<script setup lang="ts">
import type { Block } from '~~/server/types'

defineProps<{ block: Block, slots: number }>()
</script>

<template>
  <div flex="~ justify-end items-center">
    <!-- Arrow pointing to previous block -->
    <div v-if="block.blockNumber" i-nimiq:arrow-left m-16 font-bold text="16 neutral-600" />
    <MacroBlock v-if="block.type === 'macro'" :block :slots />
    <MicroBlock v-else-if="block.type === 'micro'" :block />
    <div
      v-else-if="block.type === 'placeholder'" flex="~ items-center justify-center"
      i-custom:curly h-120pt min-w-120pt text-30pt text-neutral-300
    >
      ...
    </div>
  </div>
</template>
