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

const focused = useWindowFocus()

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
  if (frame.value || status.value !== StreamStatus.Connected || !focused.value)
    return

  // eslint-disable-next-line no-console
  console.log('startAnimation')

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

  // eslint-disable-next-line no-console
  console.log('stopAnimation')

  cancelAnimationFrame(frame.value)
  frame.value = null
}

const isDev = import.meta.dev
const isDark = useDark()
</script>

<template>
  <div v-if="isDev" grid="~ place-content-center gap-12" m-16 w-max rounded-8 p-16 bg="orange op-6" border="orange/50 dashed 2" text-11>
    <div mb-6 flex="~ justify-between items-center">
      <h2 text-12 font-mono nq-label>
        Dev Panel
      </h2>
      <div flex="~ items-center gap-8" bg-op-60 text-12 capitalize :class="status === StreamStatus.Connected ? 'nq-pill-green' : 'nq-pill-secondary'">
        <div :class="status === StreamStatus.Connected ? 'i-nimiq:world-check' : 'i-nimiq:world-alert'" />
        {{ status }}
      </div>
    </div>

    <div flex="~ items-center gap-32">
      <label flex="~ items-center text-10 gap-8">
        <span text-10 nq-label>Theme</span>
        <input :value="isDark" nq-switch type="checkbox" @change="isDark = !isDark">
      </label>

      <div flex="~ items-center gap-8" text-12>
        <span text-10 nq-label>Status</span>
        <select v-model="status">
          <option v-for="s in Object.values(StreamStatus)" :key="s" :value="s" capitalize>
            {{ s }}
          </option>
        </select>
      </div>
    </div>

    <p>
      <span>Animation {{ frame ? '' : 'not' }} running</span>
    </p>

    <details>
      <summary>Policy</summary>
      <pre>{{ policy }}</pre>
    </details>
  </div>
  <div relative pt-128>
    <div flex="~ justify-end items-center" min-h-224 of-hidden px-24 pr-64>
      <transition-group
        tag="div" name="block-fade" flex="~ justify-end items-center" enter-from-class="op-0" enter-active-class="transition-opacity duration-400 ease-in"
        :style="{ transform: `translate3d(${offset}px, 0, 0)` }"
      >
        <Block v-for="block in blocks" :key="`block-${block.blockNumber}`" :block :slots :style="{ width: BLOCK_WIDTH }" />
      </transition-group>
    </div>

    <div v-if="status !== StreamStatus.Connected || blocks.length === 0" absolute inset-0 flex="~ justify-center items-center" min-h-224 font-bold>
      <div v-if="status === StreamStatus.Loading || blocks.length === 0" text-18>
        Loading...
      </div>
      <div v-else-if="status === StreamStatus.Error" text="18 white" rounded-4 bg-red px-32 py-24>
        We couldn't connect to the Demonet
      </div>
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
