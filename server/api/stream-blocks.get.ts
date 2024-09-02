import * as v from 'valibot'
import { colors } from '~/composables/useColors'
import type { BlockStream, MacroBlockStream, MicroBlockStream, PlaceHolderBlock } from '~~/server/types'
import { PayloadKind, dataPayload, macroBlockStreamSchema, microBlockStreamSchema, statsStreamSchema } from '~~/server/types'

const validators = new Set<string>()
let blockNumber = 0
let latestBlock: BlockStream | PlaceHolderBlock | undefined
let placeHolderID = -1
let lastBlockTime: number | undefined

export default defineEventHandler(async (event) => {
  try {
    const ws = new WebSocket(useRuntimeConfig().streamUrl)

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
              const microBlock = handleMicroBlock(parsedMicro)
              const skipBlock = handleSkipBlock(microBlock)
              if (skipBlock)
                await eventStream.push(`${JSON.stringify({ kind: PayloadKind.NewBlock, data: skipBlock })}\n`)
              await eventStream.push(`${JSON.stringify({ kind: PayloadKind.NewBlock, data: microBlock })}\n`)
              return
            }
            const { success: isMacro, output: parsedMacro } = v.safeParse(macroBlockStreamSchema, output.data)
            if (isMacro) {
              const macroBlock = handleMacroBlock(parsedMacro)
              const skipBlock = handleSkipBlock(macroBlock)
              if (skipBlock)
                await eventStream.push(`${JSON.stringify({ kind: PayloadKind.NewBlock, data: skipBlock })}\n`)
              await eventStream.push(`${JSON.stringify({ kind: PayloadKind.NewBlock, data: macroBlock })}\n`)
            }
            break
          }
          case PayloadKind.CacheComplete: {
            await eventStream.push(`${JSON.stringify({ kind: PayloadKind.CacheComplete })}\n`)
            break
          }
          case PayloadKind.Stats: {
            const { success, output: stats } = v.safeParse(statsStreamSchema, output.data)
            if (!success || !stats)
              return
            await eventStream.push(`${JSON.stringify({ kind: PayloadKind.Stats, data: stats })}\n`)
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
  blockNumber = block.blockNumber
  return block
}

function handleMacroBlock(macroBlock: MacroBlockStream) {
  validators.clear()
  const block = { ...macroBlock, color: colors[0], delay: getDelay(macroBlock) }
  blockNumber = block.blockNumber
  return block
}

function handleSkipBlock(block: MicroBlockStream | MacroBlockStream) {
  // Ignore out-of-order blocks, but allow network resets
  if (block.blockNumber < blockNumber && block.blockNumber > (blockNumber - 10))
    return

  // Check if a block was skipped
  if (block.blockNumber > blockNumber + 1) {
    // Don't push placeholder twice
    const isLatestPlaceholder = latestBlock && latestBlock.type === 'placeholder'
    if (!isLatestPlaceholder) {
      // Add a placeholder for the skipped block
      return { type: 'placeholder', blockNumber: placeHolderID-- }
    }
    lastBlockTime = undefined
  }
}

function getDelay(block: BlockStream) {
  const delay = lastBlockTime ? block.timestamp - lastBlockTime : 0
  lastBlockTime = block.timestamp
  latestBlock = block
  return delay
}
