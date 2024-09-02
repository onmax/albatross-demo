import type { PolicyConstants } from 'nimiq-rpc-client-ts'
import { type Block, type MicroBlock, PayloadKind, type Stats } from '~~/server/types'

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
  const blocks = ref<Block[]>([])
  const stats = ref<Stats>({ duration: 0, numberBlocks: 0 })

  let alreadyConnected = false

  async function subscribe() {
    if (import.meta.server)
      return

    const eventSource = new EventSource('/api/stream-blocks')

    status.value = StreamStatus.Loading
    eventSource.addEventListener('open', () => status.value = StreamStatus.Syncing)
    eventSource.addEventListener('error', () => status.value = StreamStatus.Error)

    eventSource.onmessage = (event) => {
      const { kind, data } = JSON.parse(event.data)
      switch (kind) {
        case PayloadKind.NewBlock:
          if (!alreadyConnected) {
            alreadyConnected = true
            status.value = StreamStatus.Connected
          }
          blocks.value = [...blocks.value, data].slice(-30)
          break
        case PayloadKind.CacheComplete:
          status.value = StreamStatus.Connected
          break
        case PayloadKind.Stats:
          stats.value = data
          break
      }
    }
  }

  const latestBlock = computed(() => blocks.value.at(-1))
  const latestMicroBlock = computed(() => blocks.value.filter(b => b.type === 'micro').at(-1))
  const blockNumber = computed(() => latestBlock.value?.blockNumber || 0)
  const batchNumber = computed(() => latestMicroBlock.value?.batchNumber || 0)

  const throughput = computed(() => {
    if (blocks.value.length < 3)
      return 0
    // Blocks in the array might be placeholders, so we split the array at placeholders into segments
    // of length >= 3 and compute throughput individually per segment. The overall throughput is calculated
    // as the segment-length-weighted average of the individual throughput values.
    const segments = blocks.value.reduce((segments, block) => {
      if (block.type === 'macro') {
        segments.push([])
      }
      else {
        segments.at(-1)?.push(block as MicroBlock)
      }
      return segments
    }, [[]] as MicroBlock[][]).filter(segment => segment.length >= 3)

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
    blockNumber,
    batchNumber,
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
