import * as v from 'valibot'

export enum PayloadKind {
  NewBlock = 'newBlock',
  Policy = 'policy',
  Stats = 'stats',
  CacheComplete = 'cacheComplete',
  Stale = 'stale',
}

export const dataPayload = v.object({ kind: v.enum(PayloadKind), data: v.any() })

export const microBlockStreamSchema = v.object({
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

export const macroBlockStreamSchema = v.object({
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

export const statsStreamSchema = v.object({
  duration: v.number(),
  numberBlocks: v.number(),
})

export type Stats = v.InferInput<typeof statsStreamSchema>

export type MicroBlockStream = v.InferInput<typeof microBlockStreamSchema>
export type MacroBlockStream = v.InferInput<typeof macroBlockStreamSchema>
export type BlockStream = MicroBlockStream | MacroBlockStream

export type MicroBlock = MicroBlockStream & { delay: number, color: string }
export type MacroBlock = MacroBlockStream & { delay: number, color: string }
export interface PlaceHolderBlock { type: 'placeholder', blockNumber: number }
export type Block = MicroBlock | MacroBlock | PlaceHolderBlock
