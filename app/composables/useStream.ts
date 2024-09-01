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
      if (blocks.value.some(b => b.type === 'macro'))
        return
      blocks.value = [...blocks.value, block].slice(-30)
    }
  }

  return {
    status,
    subscribe,
    blocks,
  }
}
