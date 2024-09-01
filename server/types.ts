import * as v from 'valibot'

export enum Status {
  Idle = 'idle',
  Loading = 'loading',
  Connected = 'connected',
}

export enum PayloadKind {
  NewBlock = 'newBlock',
  Policy = 'policy',
  Stats = 'stats',
  CacheComplete = 'cacheComplete',
  Stale = 'stale',
}

export const dataPayload = v.object({ kind: v.enum(PayloadKind), data: v.any() })

export const microBlockSchema = v.object({
  type: v.literal('micro'),
  hash: v.string(),
  blockNumber: v.number(),
  timestamp: v.number(),
  batchNumber: v.number(),
  epochNumber: v.number(),
  producer: v.object({ index: v.number(), publicKey: v.string(), stakerAddress: v.string() }),
  matchedTxs: v.array(v.any()),
  unmatchedTxs: v.array(v.any()),
  isSkip: v.optional(v.boolean()),
})

export const macroBlockSchema = v.object({

  type: v.literal('macro'),
  hash: v.string(),
  blockNumber: v.number(),
  timestamp: v.number(),
  batchNumber: v.number(),
  epochNumber: v.number(),
  justification: v.object({ votes: v.number() }),
  matchedTxs: v.array(v.any()),
  unmatchedTxs: v.array(v.string()),
})

export type Block = v.InferInput<typeof microBlockSchema> | v.InferInput<typeof macroBlockSchema>
