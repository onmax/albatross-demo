<script setup lang="ts">
import type { Block } from '~~/server/types'

// import RadialProgress from '../RadialProgress.vue';

const props = defineProps<{ block: Block, slots: number }>()

const requiredVotes = computed(() => Math.ceil(props.slots * 2 / 3))
const progress = computed(() => Math.min(props.block.votes / requiredVotes.value, 1))
</script>

<template>
  <div class="nq-green-bg block" :class="{ accepted: progress === 1 }" title="Macro Block">
    <header>Macro Block</header>

    <div class="block-number">
      M{{ block.batchNumber }}
    </div>

    <RadialProgress
      :progress="progress" :radius="36" stroke="#FFFFFFFF" inner-stroke="#FFFFFF66" :stroke-width="2"
      :inner-stroke-width="2"
    />

    <div class="votes">
      {{ block.justification.votes }} / {{ slots }}
      <div class="votes-description">
        Votes
      </div>
    </div>
  </div>
</template>

<style scoped>
.block {
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  text-align: center;
  transition: 0.3s;
  border-radius: 1rem;
  width: 20rem;
  height: 26rem;
  font-size: 1.675rem;
  margin-top: -3rem;
  margin-bottom: -3rem;
}

header {
  height: 3rem;
  line-height: 3rem;
  font-size: 1.375rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.block-number {
  font-size: 3rem;
  font-weight: bold;
  line-height: 1;
}

.block.accepted >>> .progress-circle {
  transition: opacity 0.6s var(--nimiq-ease) 0.4s;
  opacity: 0;
}

.votes {
  font-size: 3rem;
  margin-bottom: 2rem;
}

.votes-description {
  font-size: 1.5rem;
  line-height: 1;
}
</style>
