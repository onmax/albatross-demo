import type { Block } from '~~/server/types'

export enum StreamStatus {
  Idle = 'idle',
  Loading = 'loading',
  Syncing = 'syncing',
  Connected = 'connected',
  Error = 'error',
}

export function useStream() {
  const status = ref(StreamStatus.Idle)
  const blocks = ref<Block[]>([])

  async function subscribe() {
    if (import.meta.server)
      return

    const eventSource = new EventSource('/api/stream-blocks')

    status.value = StreamStatus.Loading
    eventSource.addEventListener('open', () => status.value = StreamStatus.Syncing)
    eventSource.addEventListener('error', () => status.value = StreamStatus.Error)

    eventSource.onmessage = (event) => {
      const json = JSON.parse(event.data)
      if (json.type === 'cacheComplete') {
        status.value = StreamStatus.Connected
      }
      else {
        // if (blocks.value.length < 10)
        blocks.value = [...blocks.value, json].slice(-100)
      }
    }
  }

  const latestBlock = computed(() => blocks.value.at(-1))
  const latestMicroBlock = computed(() => blocks.value.filter(b => b.type === 'micro').at(-1))
  const blockNumber = computed(() => latestBlock.value?.blockNumber || 0)
  const batchNumber = computed(() => latestMicroBlock.value?.batchNumber || 0)

  return {
    status,
    subscribe,
    blocks,
    blockNumber,
    batchNumber,
  }
}
