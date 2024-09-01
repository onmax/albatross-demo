import * as v from 'valibot'
import type { Block, BlockStream } from '~~/server/types'
import { PayloadKind, dataPayload, microBlockStreamSchema } from '~~/server/types'

let ws: WebSocket

function getWs() {
  if (ws)
    return ws
  const { streamUrl } = useRuntimeConfig()
  ws = new WebSocket(streamUrl)
  return ws
}

let stream: ReadableStream<string>

export function getStream() {
  if (stream)
    return stream

  stream = new ReadableStream<string>({
    start(controller) {
      getWs().onmessage = (event) => {
        const json = JSON.parse(event.data)
        const { output, success } = v.safeParse(dataPayload, json)
        if (!success || !output)
          return

        switch (output.kind) {
          case PayloadKind.NewBlock: {
            const { success: isMicro, output: parsedMicro } = v.safeParse(microBlockStreamSchema, output.data)
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
    cancel: () => getWs().close(),
  })
  return stream
}

const blockNumber = 0
let placeHolderID = -1
const blocks: Block[] = []
let lastBlockTime: number | undefined

async function _onNewBlock(blockStream: BlockStream) {
  // Process transactions in block
  // if ($.pendingTxs.length && (block.matchedTxs || []).length) {
  //   $.removePendingTxs(block.matchedTxs);
  // }

  // Ignore out-of-order blocks, but allow network resets
  if (blockStream.blockNumber < blockNumber && blockStream.blockNumber > (blockNumber - 10))
    return

  // Check if a block was skipped
  if (blockStream.blockNumber > blockNumber + 1) {
    // Don't push placeholder twice
    const latest = blocks.at(-1)
    const isLatestPlaceholder = latest && latest.type === 'placeholder'
    if (!isLatestPlaceholder) {
      // Add a placeholder for the skipped block
      blocks.push({
        type: 'placeholder',
        blockNumber: placeHolderID--,
      })
    }
    lastBlockTime = undefined
  }

  // Calculate block delay
  const block = { ...blockStream, delay: lastBlockTime ? blockStream.timestamp - lastBlockTime : 0 }
  lastBlockTime = block.timestamp

  // console.log('Incoming block', { ...block });
  blocks.push(block)

  // Push latest block number and validator data
  $.blockNumber = blockStream.blockNumber
  _pushValidator(blockStream.producer, blockStream.blockNumber)
}
