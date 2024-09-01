<script setup lang="ts">
import type { MacroBlock } from '~~/server/types'

// import RadialProgress from '../RadialProgress.vue';

const props = defineProps<{ block: MacroBlock, slots: number }>()

const requiredVotes = computed(() => Math.ceil(props.slots * 2 / 3))
const progress = computed(() => Math.min(props.block.justification.votes / requiredVotes.value, 1))
</script>

<template>
  <div :class="{ accepted: progress === 1 }" title="Macro Block" flex="~ col justify-between items-center shrink-0" text="14 neutral center" relative my--24 h-208 w-160 rounded-8 bg-green transition-300>
    <header text-11 font-bold lh-24 uppercase tracking="0.1em">
      Macro Block
    </header>

    <div text-24 font-bold lh-none>
      M{{ block.batchNumber }}
    </div>

    <RadialProgress
      :progress="progress" :radius="36" stroke="#FFFFFFFF" inner-stroke="#FFFFFF66" :stroke-width="2"
      :inner-stroke-width="2"
    />

    <div mb-16 text-24>
      {{ block.justification.votes }} / {{ slots }}
      <div text-12 lh-none>
        Votes
      </div>
    </div>
  </div>
</template>

<style scoped>
.accepted :::v-deep .progress-circle {
  transition: opacity 0.6s var(--nq-ease) 0.4s;
  opacity: 0;
}
</style>
