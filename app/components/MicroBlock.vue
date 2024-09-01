<script setup lang="ts">
import type { Block } from '~~/server/types'
// import TransactionCanvas from '../TransactionCanvas.vue';

const props = defineProps<{ block: Block }>()

const MAX_TXS = 1102

// const delay = computed(() => {
//   if (props.block.delay === 0)
//     return '?'
//   return (props.block.delay / 1000).toFixed(1)
// })

const txCount = computed(() => props.block.matchedTxs.length + props.block.unmatchedTxs.length)

const nonces = computed(() => props.block.matchedTxs.slice(0, MAX_TXS))
const hashes = computed(() => props.block.unmatchedTxs.slice(0, MAX_TXS - nonces.value.length))
</script>

<template>
  <div class="block" title="Micro Block">
    <div class="counts">
      <div
        class="block-number" :class="{
          s: block.blockNumber > 9999,
          xs: block.blockNumber > 99999,
          xxs: block.blockNumber > 999999,
        }"
      >
        #{{ block.blockNumber }}
      </div>
      <div v-if="txCount" class="tx-count">
        {{ txCount }} TX
      </div>
    </div>

    <div v-if="!txCount" class="no-transactions">
      <!-- <template v-if="!isSkip">No Transactions</template> -->
    </div>
    <div v-else class="transactions">
      <TransactionCanvas :nonces="nonces" :hashes="hashes" class="canvas" />
    </div>

    <!-- <footer>
      <div class="slot">
        Slot {{ block.producer.index }}
      </div>
      <div class="block-time">
        {{ delay }}s block time
      </div>
    </footer> -->
  </div>
</template>

<style scoped>
.block {
  position: relative;
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  border-radius: 1rem;
  width: 20rem;
  height: 20rem;
  background: white;
  color: #1f2348;
  font-size: 1.675rem;
}

header {
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
  position: absolute;
  left: 0;
  top: -3rem;
  width: 100%;
  height: 4rem;
  text-align: center;
  line-height: 3rem;
  font-size: 1.375rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  z-index: -1;
}

.counts {
  padding: 1.75rem 2rem 1.25rem;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.block-number {
  font-size: 3rem;
  font-weight: bold;
  line-height: 0.8;
}

.block-number.s {
  font-size: 2.5rem;
}

.block-number.xs {
  font-size: 2.125rem;
}

.block-number.xxs {
  line-height: 0.9;
  font-size: 1.875rem;
}

.tx-count {
  font-weight: 600;
  line-height: 1;
}

.no-transactions {
  flex-grow: 1;
}

.no-transactions {
  text-align: center;
  margin-top: 10rem;
  font-weight: 600;
  opacity: 0.4;
}

.transactions {
  flex-grow: 1;
}

.canvas {
  position: absolute;
  left: 0;
  bottom: 0;
  transform: scale(0.5);
  transform-origin: 0 100%;
}

footer {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  padding: 0.25rem 1rem 0;
  height: 3rem;
  line-height: 3rem;
  margin-bottom: -3rem;
  color: white;
  font-size: 1.5rem;
  opacity: 0.8;
}
</style>
