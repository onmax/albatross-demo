<script setup lang="ts">
import { Tweenable } from '@nimiq/utils'

const props = withDefaults(defineProps<{
  value: number
  decimals?: number
  animationDuration?: number
}>(), { decimals: 0, animationDuration: 500 })

const tweeningValue = ref(props.value)

onMounted(() => tween(0, tweeningValue.value || 0))
watch(() => props.value, (newValue) => {
  tween(tweeningValue.value, newValue)
})

function tween(startValue: number, endValue: number) {
  if (import.meta.server)
    return

  const transition = new Tweenable(endValue, startValue, props.animationDuration)

  function animate() {
    const progress = transition.progress
    const currentValue = transition.currentValue
    tweeningValue.value = currentValue
    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }
  animate()
}
</script>

<template>
  <span style="font-variant-numeric: normal">{{ tweeningValue.toFixed(decimals) }}</span>
</template>
