import type { Block, MacroBlock, MicroBlock } from 'nimiq-rpc-client-ts'
import { NimiqRPCClient } from 'nimiq-rpc-client-ts'
import type { BlockLiveview } from '../types'
import { BlockLiveviewType } from '../types'

const INITIAL_BLOCK_FETCH = 16

let lastCalculatedDelay = 0

export default defineEventHandler(async (event) => {
  let latestBlock: Block | undefined
  const rpcUrl = useRuntimeConfig().rpcUrl
  const eventStream = createEventStream(event)

  function sendPayload(block: BlockLiveview) {
    eventStream.push(`${JSON.stringify(block)}\n`)
  }

  const client = new NimiqRPCClient(rpcUrl)

  // Fetch the latest blocks
  const { data: head, error: headError } = await client.blockchain.getBlockNumber()
  if (!head || headError) {
    console.error(`Error fetching head block: ${JSON.stringify(headError)}`)
    return
  }

  const latestBlockNumber = head
  const blockPromises = []

  for (let i = 0; i < INITIAL_BLOCK_FETCH; i++) {
    const blockNumber = latestBlockNumber - i
    blockPromises.push(
      client.blockchain.getBlockByNumber(blockNumber).then(({ data: block, error: blockError }) => {
        return { blockNumber, block, blockError }
      }),
    )
  }

  const blockResults = await Promise.all(blockPromises)

  // Sort the blocks by their number in descending order
  blockResults.sort((a, b) => b.blockNumber - a.blockNumber)

  for (const { block, blockError } of blockResults) {
    if (!block || blockError)
      sendPayload({ kind: BlockLiveviewType.PlaceholderBlock, timestamp: Date.now() })
    else if (block.type === 'micro')
      await sendMicroblock(block as MicroBlock)
    else if (block.type === 'macro')
      await sendMacroblock(block as MacroBlock)

    latestBlock = block as Block
  }

  const { next: nextMicroblock } = await client.blockchainStreams.subscribeForMicroBlocks()
  nextMicroblock(async ({ error, data: block }) => {
    if (error?.code || !block) {
      console.error(`Error subscribing to microblocks: ${JSON.stringify(error)}`)
      return
    }

    await lock(async () => {
      const placeholderSent = await maybeSendPlaceholder(latestBlock, block)
      await sendMicroblock(block)
      latestBlock = placeholderSent ? undefined : block
    })
  })

  const { next: nextMacroblock } = await client.blockchainStreams.subscribeForMacroBlocks()
  nextMacroblock(async ({ error, data: block }) => {
    if (error?.code || !block) {
      console.error(`Error subscribing to macroblocks: ${JSON.stringify(error)}`)
      return
    }

    await lock(async () => {
      const placeholderSent = await maybeSendPlaceholder(latestBlock, block)
      sendMacroblock(block)
      latestBlock = placeholderSent ? undefined : block
    })
  })

  async function sendMicroblock(block: MicroBlock) {
    const { producer, justification, transactions, number, batch, timestamp } = block
    const isSkip = 'skip' in justification
    const matchedTxs = transactions.filter(tx => tx.to.length === 8).map(tx => Number.parseInt(tx.to, 16))
    const unmatchedTxs = transactions.filter(tx => tx.to.length !== 8).map(tx => tx.hash.substring(0, 8))
    const kind = BlockLiveviewType.MicroBlock
    const delay = latestBlock ? block.timestamp - latestBlock.timestamp : lastCalculatedDelay
    lastCalculatedDelay = delay
    sendPayload({ producer, isSkip, matchedTxs, unmatchedTxs, delay, kind, number, batch, timestamp })
  }

  async function sendMacroblock(block: MacroBlock) {
    const { transactions, justification, batch, number } = block
    const unmatchedTxs = transactions.map(tx => tx.hash.substring(0, 8))
    const votes = justification.sig.signers.length
    const kind = BlockLiveviewType.MacroBlock
    sendPayload({ unmatchedTxs, votes, batch, kind, number })
  }

  async function maybeSendPlaceholder<T extends Block>(latestBlock: Block | undefined, block: T): Promise<boolean> {
    if (!latestBlock)
      return false

    // If the block was not skipped, return false
    if (block.number <= latestBlock.number + 1)
      return false

    // If the latest block is already a placeholder, return false
    if (latestBlock === undefined)
      return false

    // Send the placeholder payload
    sendPayload({ timestamp: Date.now(), kind: BlockLiveviewType.PlaceholderBlock })
    return true
  }

  return eventStream.send()
})

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
