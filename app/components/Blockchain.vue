<script setup lang="ts">
import type { PolicyConstants } from 'nimiq-rpc-client-ts'

const { subscribe, blocks, batchNumber, blockNumber, status } = useStream()

const BLOCK_WIDTH = 208
const TARGET_OFFSET = -BLOCK_WIDTH / 4

// Higher is faster.
// Too low, and the animation can't catch up to new blocks.
// Too high, and the animation finishes too fast and stops between blocks.
// A factor of 0.55-0.65 works well for block times of ~0.2s.
const CHAIN_SPEED_FACTOR = 0.6

subscribe()

const { data: policy } = useFetch('/api/policy')
const slots = computed(() => (policy.value as PolicyConstants)?.slots)
const genesisBlockNumber = computed(() => (policy.value as PolicyConstants)?.genesisBlockNumber)
const blocksPerBatch = computed(() => (policy.value as PolicyConstants)?.blocksPerBatch)

// TODO Add cache complete

const frame = ref<number | null>(null)
const velocity = ref(0)
const offset = ref(blocks.value.length * BLOCK_WIDTH)
watch(blocks, () => {
  if (status.value === StreamStatus.Connected)
    offset.value += BLOCK_WIDTH
})

onUnmounted(() => {
  stopAnimation()
})

watch(status, (newStatus, oldStatus) => {
  if (newStatus === StreamStatus.Connected && oldStatus === StreamStatus.Syncing) {
    startAnimation()
  }
}, { immediate: true })
/*
Scrolling effect

This JS creates the effect of a continously scrolling blockchain.
New blocks arrive from the right and push the other blocks to the left.

Whenever a new block is added, a watcher (above) increases the offset of the
chain container, which reactively sets the DOM element's transform style.
In each animation frame, a velocity is calculated that enables the element's return
towards the target offset (resting state). This velocity is then applied to
the offset (which, again, updates the transform reactively).

The velocity is calculated as a root over the distance the element has to travel.
The lower the root (chain speed factor), the slower the element travels and vice-versa.
*/
function startAnimation() {
  if (frame.value || status.value !== StreamStatus.Connected)
    return

  function loop() {
    frame.value = requestAnimationFrame(loop)
    velocity.value = -Math.floor((-TARGET_OFFSET + offset.value) ** CHAIN_SPEED_FACTOR)
    offset.value += velocity.value
  }
  loop()
}

function stopAnimation() {
  if (!frame.value)
    return

  cancelAnimationFrame(frame.value)
  frame.value = null
}

const isDev = import.meta.dev
const isDark = useDark()
</script>

<template>
  <div v-if="isDev" grid="~ place-content-center" m-16 w-max rounded-8 p-16 border="orange/50 dashed 2">
    <h2 mb-6 text-12 font-mono nq-label>
      Dev Panel
    </h2>

    <label mb-12 flex="~ items-center text-10 gap-8">
      <span text-9 nq-label>Theme</span>
      <input v-model="isDark" nq-switch type="checkbox">
    </label>

    <div flex="~ items-center gap-8" bg-op-60 capitalize :class="status === StreamStatus.Connected ? 'nq-pill-green' : 'nq-pill-secondary'">
      <div :class="status === StreamStatus.Connected ? 'i-nimiq:world-check' : 'i-nimiq:world-alert'" />
      {{ status }}
    </div>
    <details>
      <summary>Policy</summary>
      <pre>{{ policy }}</pre>
    </details>
  </div>
  <div relative pt-128>
    <div flex="~ justify-end items-center" min-h-224 of-hidden px-24 pr-64>
      <transition-group
        tag="div" name="block-fade" flex="~ justify-end items-center"
        :style="{ transform: `translate3d(${offset}px, 0, 0)` }"
      >
        <Block v-for="block in blocks" :key="`block-${block.blockNumber}`" :block :slots :style="{ width: BLOCK_WIDTH }" />
      </transition-group>
    </div>

    <div w-full flex="~ justify-center" of-hidden px-32>
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
