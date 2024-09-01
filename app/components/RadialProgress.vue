<script setup lang="ts">
const props = defineProps<{
  progress: number
  radius: number
  strokeWidth: number
  innerStrokeWidth: number
  innerStroke: string
  stroke: string
}>()

const normalizedRadius = computed(() => props.radius - props.strokeWidth * 2)
const circumference = computed(() => normalizedRadius.value * 2 * Math.PI)
const ringStyle = computed(() => `stroke-dashoffset: ${circumference.value - props.progress * circumference.value}`)
</script>

<template>
  <div class="radial-progress">
    <svg class="progress-circle" :width="radius * 2" :height="radius * 2" fill="none">
      <circle
        :style="{ 'stroke-width': innerStrokeWidth }" :stroke="innerStroke" :cx="radius" :cy="radius"
        :r="normalizedRadius"
      />
      <circle
        class="stroke" :stroke="stroke" :stroke-width="strokeWidth"
        :stroke-dasharray="`${circumference} ${circumference}`" :style="ringStyle" :cx="radius" :cy="radius"
        :r="normalizedRadius"
      />
    </svg>

    <div v-if="progress < 1" class="percentage">
      {{ Math.round(100 * progress) }}%
    </div>
    <div v-else class="percentage">
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M29.2175 0.3515C28.3759 -0.252179 27.2046 -0.0589953 26.6012 0.782999L9.05763 25.2571L3.20143 19.3925C2.72783 18.9184 2.03743 18.7331 1.39029 18.9064C0.743152 19.0798 0.237593 19.5854 0.0640511 20.2328C-0.109491 20.8803 0.0753507 21.5711 0.548947 22.0452L7.96764 29.467C8.36163 29.8464 8.89947 30.0382 9.44444 29.9937C9.98942 29.9492 10.4891 29.6726 10.8164 29.2344L29.6487 2.96926C30.252 2.12722 30.059 0.955241 29.2175 0.3515Z"
          fill="white"
        />
      </svg>
    </div>
  </div>
</template>

<style scoped>
.radial-progress {
  position: relative;
}

.progress-circle {
  display: block;
  transform: rotate(-90deg);
}

.progress-circle circle {
  transition: stroke-dashoffset 0.6s var(--nimiq-ease);
}

.percentage {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2rem;
  font-weight: bold;
}
</style>
