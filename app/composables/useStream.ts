import { type Block, StreamStatus } from '~~/server/types'

export function useStream() {
  const status = ref(StreamStatus.Idle)
  const blocks = ref<Block[]>([])

  async function subscribe() {
    const eventSource = new EventSource('/api/stream-blocks')

    status.value = StreamStatus.Loading
    eventSource.addEventListener('open', () => {
      status.value = StreamStatus.Connected
    })
    eventSource.addEventListener('error', () => {
      status.value = StreamStatus.Error
    })

    eventSource.onmessage = (event) => {
      const block = JSON.parse(event.data)
      blocks.value = [...blocks.value, block].slice(-90)
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
