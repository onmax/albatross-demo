<script setup lang="ts">
import type { PolicyConstants } from 'nimiq-rpc-client-ts'

const { subscribe, blocks, batchNumber, blockNumber } = useStream()

const blockWidth = 208

// TODO Virtual list

subscribe()

const { data: policy } = useFetch('/api/policy')
const slots = computed(() => (policy.value as PolicyConstants).slots)
const genesisBlockNumber = computed(() => (policy.value as PolicyConstants).genesisBlockNumber)
const blocksPerBatch = computed(() => (policy.value as PolicyConstants).blocksPerBatch)
</script>

<template>
  <div relative px-32 pt-128>
    <div flex="~ justify-end items-center" h-full px-24>
      <transition-group
        tag="div" name="block-fade" flex="~ justify-end items-center"
        :style="{ transform: `translate3d(${0}px, 0, 0)` }"
      >
        <Block v-for="block in blocks" :key="`block-${block.blockNumber}`" :block :slots :style="{ width: blockWidth }" />
      </transition-group>
    </div>

    <div w-full flex="~ justify-center" of-hidden>
      <!-- :class="{ unimate: isMacro || isFirstBatchAfterPageLoad }"> -->
      <div flex="~ justify-center">
        <Batch
          v-for="n in 7" :key="`batch-${batchNumber - 3 + n - 1}`"
          :block-number :genesis-block-number :batch-number="batchNumber - 3 + n - 1"
          :blocks-per-batch mt-64 shrink-0 class="animate-batch-unshift"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.block-fade-enter-active {
  transition: opacity 0.4s ease-in;
}

.block-fade-enter {
  opacity: 0;
}

.animate-batch-unshift {
  animation: batch-unshift 0.6s ease-in-out;
}

@keyframes batch-unshift {
  from {
    transform: translateX(100%);
  }

  to {
    transform: translateX(0);
  }
}
</style>
