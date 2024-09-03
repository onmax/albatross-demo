import { type Block, NimiqRPCClient } from 'nimiq-rpc-client-ts'
import { ref, watch } from 'vue'
import type { LiveviewStream, PayloadLiveview, PlaceholderBlockLiveview } from '../types'
import { PayloadKind } from '../types'

const STATS_WINDOW_SIZE = 3 * 128
const STATS_REFRESH_EVERY = 5

let placeholderCounter = -1
let lastCalculatedDelay = 0

export default defineEventHandler(async (event) => {
  const latestBlock = ref<Block>()
  const rpcUrl = useRuntimeConfig().rpcUrl
  const eventStream = createEventStream(event)

  function sendPayload<T extends PayloadLiveview>(payload: T) {
    const stream: LiveviewStream<T> = { kind: payload.kind, data: payload }
    eventStream.push(`${JSON.stringify(stream)}\n`)
  }

  const client = new NimiqRPCClient(new URL(rpcUrl))

  const { next: nextMicroblock } = await client.blockchainStreams.subscribeForMicroBlocks()
  nextMicroblock(async ({ error, data: block }) => {
    if (error?.code || !block) {
      console.error(`Error subscribing to microblocks: ${JSON.stringify(error)}`)
      return
    }

    const delay = calculateDelay(latestBlock.value, block)

    const placeholder = await lock(() => handleBlock(latestBlock.value, block))
    if (placeholder)
      sendPayload(placeholder)

    const { producer, justification, transactions, number, batch, timestamp } = block
    const isSkip = 'skip' in justification
    const matchedTxs = transactions.filter(tx => tx.to.length === 8).map(tx => Number.parseInt(tx.to, 16))
    const unmatchedTxs = transactions.filter(tx => tx.to.length !== 8).map(tx => tx.hash.substring(0, 8))
    const kind = PayloadKind.MicroBlock

    sendPayload({ producer, isSkip, matchedTxs, unmatchedTxs, delay, kind, number, batch, timestamp })
    latestBlock.value = placeholder ? undefined : block
  })

  const { next: nextMacroblock } = await client.blockchainStreams.subscribeForMacroBlocks()
  nextMacroblock(async ({ error, data: block }) => {
    if (error?.code || !block) {
      console.error(`Error subscribing to macroblocks: ${JSON.stringify(error)}`)
      return
    }

    const placeholder = await lock(() => handleBlock(latestBlock.value, block))
    if (placeholder) {
      sendPayload(placeholder)
    }

    const { transactions, justification, batch, number } = block
    const unmatchedTxs = transactions.map(tx => tx.hash.substring(0, 8))
    const votes = justification.sig.signers.length
    const kind = PayloadKind.MacroBlock

    sendPayload({ unmatchedTxs, votes, batch, kind, number })
    latestBlock.value = placeholder ? undefined : block
  })

  async function sendStats(lastBlock: Pick<Block, 'number' | 'timestamp'>) {
    const firstBlock = Math.max(1, lastBlock.number - STATS_WINDOW_SIZE)
    const { data: initialBlock, error } = await client.blockchain.getBlockByNumber(firstBlock)
    if (!initialBlock || error) {
      console.error(`Error fetching block ${firstBlock}: ${JSON.stringify(error)}`)
      return
    }
    const duration = lastBlock.timestamp - initialBlock.timestamp
    const numberBlocks = lastBlock.number - firstBlock + 1
    const kind = PayloadKind.Stats
    sendPayload({ duration, numberBlocks, kind })
  }

  const { data: head, error } = await client.blockchain.getBlockNumber()
  if (!head || error) {
    console.error(`Error fetching head block: ${JSON.stringify(error)}`)
    return
  }
  sendStats({ number: head, timestamp: Date.now() })

  watch(latestBlock, async (lastBlock) => {
    if (!lastBlock || lastBlock.number % STATS_REFRESH_EVERY !== 0)
      return
    sendStats(lastBlock)
  })

  return eventStream.send()
})

async function handleBlock<T extends Block>(latestBlock: Block | undefined, block: T): Promise<PlaceholderBlockLiveview | undefined> {
  if (!latestBlock)
    return

  // Ignore out-of-order blocks, but allow network resets
  if (latestBlock && block.number < latestBlock.number && block.number > (latestBlock.number - 10))
    return

  // Check if a block was skipped
  if (block.number > latestBlock.number + 1) {
    const isLatestPlaceholder = !!latestBlock
    if (isLatestPlaceholder)
      return
    return { number: placeholderCounter--, timestamp: Date.now(), kind: PayloadKind.PlaceholderBlock } satisfies PlaceholderBlockLiveview
  }
}

let locked = false
let lockPromise = () => Promise.resolve()

async function lock<T>(callback: () => T) {
  let res: T
  if (locked) {
    await lockPromise()
  }
  locked = true
  lockPromise = async () => {
    try {
      res = callback()
    }
    finally {
      locked = false
    }
  }

  await lockPromise()
  return res!
}

function calculateDelay(oldBlock: Block | PlaceholderBlockLiveview | undefined, newBlock: Block): number {
  if (!oldBlock) {
    return lastCalculatedDelay // Return the previous delay if lastBlockTimestamp was undefined
  }
  const delay = newBlock.timestamp - oldBlock.timestamp
  lastCalculatedDelay = delay // Store the current delay for future use
  return delay
}
