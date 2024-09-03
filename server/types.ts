import type { Block, MacroBlock, MicroBlock } from 'nimiq-rpc-client-ts'

export enum PayloadKind {
  MicroBlock = 'micro',
  MacroBlock = 'macro',
  PlaceholderBlock = 'placeholder',
  Stats = 'stats',
}

export type MicroBlockLiveview = {
  kind: PayloadKind.MicroBlock
  delay: number
  matchedTxs: number[]
  unmatchedTxs: string[]
  isSkip: boolean
} & Pick<MicroBlock, 'producer' | 'number' | 'batch' | 'timestamp'>

export type MacroBlockLiveview = {
  kind: PayloadKind.MacroBlock
  unmatchedTxs: string[]
  votes: number
} & Pick<MacroBlock, 'batch' | 'number'>

export type PlaceholderBlockLiveview = Pick<Block, 'number' | 'timestamp'> & { kind: PayloadKind.PlaceholderBlock }

export interface StatsLiveview {
  kind?: PayloadKind.Stats
  duration: number
  numberBlocks: number
}

export type BlockLiveview = MicroBlockLiveview | MacroBlockLiveview | PlaceholderBlockLiveview
export type PayloadLiveview = BlockLiveview | StatsLiveview

export interface LiveviewStream<T extends PayloadLiveview = PayloadLiveview> { kind: T['kind'], data: T }
