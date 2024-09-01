<script setup lang="ts">
const props = defineProps<{
  blockNumber: number
  batchNumber: number
  blocksPerBatch: number
  genesisBlockNumber: number
  validators: []
}>()

const showColors = ref(false)
const toggleColors = useToggle(showColors)

const remainingBlockCount = computed(() => {
  if (props.batchNumber === 0)
    return props.blocksPerBatch - 1
  const remaining = props.genesisBlockNumber + (props.batchNumber * props.blocksPerBatch) - props.blockNumber - 1
  return Math.min(Math.max(remaining, 0), props.blocksPerBatch - 1)
})

const createdBlockCount = computed(() => {
  return Math.max(props.blocksPerBatch - remainingBlockCount.value - 1, 0)
})

// const pastMacro = computed(() => {
//   return props.blockNumber > (props.batchNumber * props.blocksPerBatch) + props.genesisBlockNumber
// })

// const isWaitingForMacro = computed(() => {
//   return props.blockNumber === (props.batchNumber * props.blocksPerBatch) + props.genesisBlockNumber - 1
// })
</script>

<template>
  <div
    w-388 max-w="[calc(100vw-12px)] md:full" flex="~ justify-between items-start" px-16
    @click="() => toggleColors()"
  >
    <div flex="~ col wrap" h="70 sm:56 md:44">
      <div
        v-for="n in createdBlockCount" :key="`micro-block-${n}`" m-4 inline-block size-6 rounded-2 bg-neutral-0 op-60
        :style="showColors && validators && `background: #${validators[n]}`"
      />
      <div
        v-for="n in remainingBlockCount" :key="`micro-block-${createdBlockCount + n}`" m-4 inline-block size-6
        rounded-2 bg-neutral-0 op-20
      />
    </div>

    <div
      text="14 neutral-800 center" flex="~ justify-center items-center" relative ml-4 size-44 shrink-0 rounded-8
      bg-neutral-200 font-bold op-60 transition-colors
    >
      B<span>{{ batchNumber }}</span>
      <!-- <div class="macro-block" :class="{ 'pulsing': isWaitingForMacro, 'done': pastMacro, thousand }"> -->
      M<span>{{ batchNumber }}</span>
    </div>
  </div>
</template>
