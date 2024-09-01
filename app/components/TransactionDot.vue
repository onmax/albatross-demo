<script setup lang="ts">
const props = defineProps<{ nonce?: number, hash: string }>()
const color = computed(() => props.nonce ? getColorByNonce(props.nonce) : getColorByHash(props.hash))
</script>

<template>
  <div size-8 rounded-full :style="{ color }" />
</template>
