import { type Block, Status } from '~~/server/types'

export const useBlockchain = defineStore('blockchain', () => {
  const status = ref(Status.Idle)
  const { data: policy } = useFetch('/api/policy')
  const blocks = ref<Block[]>([])

  async function subscribe() {
    const response = await $fetch<ReadableStream>('/api/stream-blocks', { responseType: 'stream' })
    const reader = response.pipeThrough(new TextDecoderStream()).getReader()
    let buffer = ''

    while (true) {
      const { value, done } = await reader.read()
      if (done)
        break

      buffer += value

      try {
        // Try to parse the buffer as JSON
        while (buffer) {
          const boundary = buffer.indexOf('\n')
          if (boundary === -1)
            break

          const chunk = buffer.slice(0, boundary).trim()
          buffer = buffer.slice(boundary + 1)

          if (chunk) {
            const block = JSON.parse(chunk)
            blocks.value = [...blocks.value, block].slice(-30)
          }
        }
      }
      catch (e) {
        // If JSON.parse fails, continue to accumulate more data
        if (!(e instanceof SyntaxError)) {
          throw e
        }
      }
    }
  }

  return {
    status,
    policy,
    subscribe,
    blocks,
  }
})
