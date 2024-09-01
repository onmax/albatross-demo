import * as v from 'valibot'
import { colors } from '~/composables/useColors'
import type { Block, BlockStream, MacroBlockStream, MicroBlockStream, PlaceHolderBlock } from '~~/server/types'
import { PayloadKind, dataPayload, macroBlockStreamSchema, microBlockStreamSchema } from '~~/server/types'

let ws: WebSocket
const validators = new Set<string>()
const blockNumber = 0
const blocks: Block[] = []
let latestBlock: BlockStream | PlaceHolderBlock | undefined
let placeHolderID = -1
let lastBlockTime: number | undefined

export default defineEventHandler(async (event) => {
  try {
    if (!ws)
      ws = new WebSocket(useRuntimeConfig().streamUrl)

    const eventStream = createEventStream(event)

    ws.onmessage = async (event) => {
      try {
        if (typeof event.data !== 'string') {
          return
        }
        const json = JSON.parse(event.data)
        const { output, success } = v.safeParse(dataPayload, json)
        if (!success || !output)
          return

        // Handle the parsed data
        switch (output.kind) {
          case PayloadKind.NewBlock: {
            const { success: isMicro, output: parsedMicro } = v.safeParse(microBlockStreamSchema, output.data)
            if (isMicro) {
              await eventStream.push(`${JSON.stringify(handleMicroBlock(parsedMicro))}\n`)
              return
            }
            const { success: isMacro, output: parsedMacro } = v.safeParse(macroBlockStreamSchema, output.data)
            if (isMacro) {
              await eventStream.push(`${JSON.stringify(handleMacroBlock(parsedMacro))}\n`)
            }
            break
          }
        }
      }
      catch (error) {
        console.error('Failed to parse JSON', error)
      }
    }
    return eventStream.send()
  }
  catch (error) {
    return createError(`Failed to fetch stream: ${JSON.stringify(error)}`)
  }
})

function handleMicroBlock(microBlock: MicroBlockStream) {
  validators.add(microBlock.producer.publicKey)
  const color = colors[validators.size % colors.length]
  const block = { ...microBlock, color, delay: getDelay(microBlock) }
  return block
}

function handleMacroBlock(macroBlock: MacroBlockStream) {
  validators.clear()
  return { ...macroBlock, color: colors[0], delay: getDelay(macroBlock) }
}

function getDelay(block: BlockStream) {
  // Ignore out-of-order blocks, but allow network resets
  if (block.blockNumber < blockNumber && block.blockNumber > (blockNumber - 10))
    return

  // Check if a block was skipped
  if (block.blockNumber > blockNumber + 1) {
    // Don't push placeholder twice
    const isLatestPlaceholder = latestBlock && latestBlock.type === 'placeholder'
    if (!isLatestPlaceholder) {
      // Add a placeholder for the skipped block
      blocks.push({ type: 'placeholder', blockNumber: placeHolderID-- })
    }
    // Reset delay
    lastBlockTime = undefined
  }

  // Calculate block delay
  const delay = lastBlockTime ? block.timestamp - lastBlockTime : 0
  lastBlockTime = block.timestamp
  latestBlock = block
  return delay
}
