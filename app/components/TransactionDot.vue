<script setup lang="ts">
const props = defineProps<{ nonce: number, hash?: string }>()
const backgroundColor = computed(() => props.hash ? getColorByHash(props.hash) : getColorByNonce(props.nonce))
</script>

<template>
  <div size-8 rounded-full :style="{ backgroundColor }" />
</template>
