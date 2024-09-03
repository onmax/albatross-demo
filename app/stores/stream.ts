import type { PolicyConstants } from 'nimiq-rpc-client-ts'
import { PayloadKind } from '~~/server/types'
import type { BlockLiveview, LiveviewStream, MacroBlockLiveview, MicroBlockLiveview, StatsLiveview } from '~~/server/types'

export enum StreamStatus {
  Idle = 'idle',
  Loading = 'loading',
  Syncing = 'syncing',
  Connected = 'connected',
  Error = 'error',
}

const TXS_PER_BLOCK = 1175

export const useStream = defineStore('app', () => {
  const { data: _policy } = useFetch('/api/policy')
  const policy = computed(() => _policy.value as PolicyConstants | undefined)

  const status = ref(StreamStatus.Idle)

  const stats = ref<StatsLiveview>({ duration: 0, numberBlocks: 0 })

  const latestBlock = ref<MicroBlockLiveview | MacroBlockLiveview>()
  const blocks = ref<BlockLiveview[]>([])

  function pushBlock(block: BlockLiveview) {
    if (block.kind === PayloadKind.MacroBlock || block.kind === PayloadKind.MicroBlock)
      latestBlock.value = block
    blocks.value = [...blocks.value, block].slice(-30)
  }

  let alreadyConnected = false

  async function subscribe() {
    if (import.meta.server)
      return

    const eventSource = new EventSource('/api/stream-blocks')

    status.value = StreamStatus.Loading
    eventSource.addEventListener('open', () => status.value = StreamStatus.Syncing)
    eventSource.addEventListener('error', () => status.value = StreamStatus.Error)

    eventSource.onmessage = (event) => {
      if (!alreadyConnected) {
        status.value = StreamStatus.Connected
        alreadyConnected = true
      }

      const json = JSON.parse(event.data) as LiveviewStream
      switch (json.kind) {
        case PayloadKind.MicroBlock:
        case PayloadKind.MacroBlock:
        case PayloadKind.PlaceholderBlock:
          pushBlock(json.data as BlockLiveview)
          break
        case PayloadKind.Stats:
          stats.value = json.data as StatsLiveview
          break
      }
    }
  }

  const throughput = computed(() => {
    if (blocks.value.length < 3)
      return 0
    // Blocks in the array might be placeholders, so we split the array at placeholders into segments
    // of length >= 3 and compute throughput individually per segment. The overall throughput is calculated
    // as the segment-length-weighted average of the individual throughput values.
    const segments = blocks.value
      .filter(block => block.kind !== PayloadKind.PlaceholderBlock)
      .reduce((segments, block) => {
        if (block.kind === PayloadKind.MacroBlock) {
          segments.push([])
        }
        else {
          segments.at(-1)?.push(block)
        }
        return segments
      }, [[]] as MicroBlockLiveview[][]).filter(segment => segment.length >= 3)

    const weightedTxps = segments.reduce((sum, segment) => {
      const txs = segment.reduce((txs, block) => txs + block.matchedTxs.length + block.unmatchedTxs.length, 0)
      const [first, last] = [segment[0], segment.at(-1)]
      if (!first || !last)
        return sum
      const timespan = (last.timestamp - first.timestamp) / 1000
      return sum + (segment.length * (txs / timespan))
    }, 0)

    const numBlocks = segments.reduce((sum, segment) => sum + segment.length, 0)
    return Math.round(weightedTxps / numBlocks)
  })

  const duration = computed(() => stats.value.duration)
  const numberBlocks = computed(() => stats.value.numberBlocks)

  const txLimit = computed(() => {
    const p = policy.value
    if (!p)
      return 0
    const microBlockCount = numberBlocks.value - Math.floor(numberBlocks.value / p.blocksPerBatch)
    return Math.round(microBlockCount * TXS_PER_BLOCK / (duration.value / 1000))
  })

  const blockTime = computed(() => {
    const blockTime = duration.value / 1000 / numberBlocks.value
    return roundToSignificant(blockTime, 2)
  })

  return {
    status,
    subscribe,
    blocks,
    blockNumber: computed(() => latestBlock.value?.number || -1),
    batchNumber: computed(() => latestBlock.value?.batch || -1),
    stats,
    throughput,
    txLimit,
    blockTime,
    policy,
  }
})

function roundToSignificant(number: number, places = 1) {
  const roundingFactor = number < 0.01
    ? 10 ** (2 + places)
    : number < 0.1
      ? 10 ** (1 + places)
      : number < 10
        ? 10 ** (places)
        : 1

  return Math.round(number * roundingFactor) / roundingFactor
}
