import * as v from 'valibot'
import { type Block, PayloadKind, dataPayload, macroBlockSchema, microBlockSchema } from '~~/server/types'

export default defineEventHandler(async (event) => {
  const { streamUrl } = useRuntimeConfig()
  const ws = new WebSocket(streamUrl)

  const stream = new ReadableStream<string>({
    start(controller) {
      ws.onmessage = (event) => {
        const json = JSON.parse(event.data)
        const { output, success } = v.safeParse(dataPayload, json)
        if (!success || !output)
          return

        switch (output.kind) {
          case PayloadKind.NewBlock: {
            const { success: isMicro, output: parsedMicro } = v.safeParse(microBlockSchema, output.data)
            if (isMicro) {
              controller.enqueue(`${JSON.stringify(parsedMicro)}\n`)
              // return
            }
            // const { success: isMacro, output: parsedMacro } = v.safeParse(macroBlockSchema, output.data)
            // if (isMacro) {
            //   controller.enqueue(parsedMacro)
            // }
            break
          }
          case PayloadKind.Stats:
          case PayloadKind.Policy:
          case PayloadKind.CacheComplete:
          case PayloadKind.Stale:
            // eslint-disable-next-line no-console
            console.log(`Ignoring payload of kind ${output.kind}`)
        }
      }
    },
    cancel: () => ws.close(),
  })

  return sendStream(event, stream)
})
