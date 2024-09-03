<script setup lang="ts">
import { PayloadKind } from '~~/server/types'

defineProps<{ block: BlockLiveview }>()

const { policy } = storeToRefs(useStream())
const slots = computed(() => policy.value?.slots || 0)
</script>

<template>
  <div flex="~ justify-end items-center">
    <!-- Arrow pointing to previous block -->
    <div i-nimiq:arrow-left-thin relative top--8 m-16 font-bold text="16 neutral-600" />
    <MacroBlock v-if="block.kind === PayloadKind.MacroBlock" :block :slots />
    <MicroBlock v-else-if="block.kind === 'micro'" :block />
    <div v-else-if="block.kind === 'placeholder'" grid="~ place-content-center" i-custom:curly h-120pt min-w-120pt text="30pt neutral-500" />
  </div>
</template>
