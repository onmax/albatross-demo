<script setup lang="ts">
import type { PolicyConstants } from 'nimiq-rpc-client-ts'

const { subscribe, blocks } = useStream()

const blockWidth = 208

// TODO Virtual list

subscribe()

const { data: policy } = useFetch('/api/policy')
const slots = computed(() => (policy.value as PolicyConstants).slots)
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
  </div>
</template>

<style scoped>
.block-fade-enter-active {
  transition: opacity 0.4s ease-in;
}

.block-fade-enter {
  opacity: 0;
}
</style>
