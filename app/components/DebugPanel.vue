<script setup lang="ts">
const { policy, status, stats } = storeToRefs(useStream())
const isDark = useDark()
</script>

<template>
  <div grid="~ place-content-center gap-12" w-max rounded-8 p-16 bg="orange op-6" border="orange/50 dashed 2" text-11>
    <div mb-6 flex="~ justify-between items-center">
      <h2 text-12 font-mono nq-label>
        Dev Panel
      </h2>
      <div flex="~ items-center gap-8" bg-op-60 text-12 capitalize :class="status === StreamStatus.Connected ? 'nq-pill-green' : 'nq-pill-secondary'">
        <div :class="status === StreamStatus.Connected ? 'i-nimiq:world-check' : 'i-nimiq:world-alert'" />
        {{ status }}
      </div>
    </div>

    <div flex="~ gap-16 items-center">
      <div flex="~ gap-8 items-center" bg-transparent text-11 nq-pill-tertiary>
        <div i-nimiq:stopwatch />
        <span>Duration: {{ stats?.duration || -1 }}</span>
      </div>
      <div flex="~ gap-8 items-center" bg-transparent text-11 nq-pill-tertiary>
        <div i-nimiq:digital-gold />
        <span># blocks: {{ stats?.numberBlocks || -1 }}</span>
      </div>
    </div>

    <div flex="~ items-center gap-32">
      <label flex="~ items-center text-10 gap-8">
        <span text-10 nq-label>Theme</span>
        <input :value="isDark" nq-switch type="checkbox" @change="isDark = !isDark">
      </label>

      <div flex="~ items-center gap-8" text-12>
        <span text-10 nq-label>Status</span>
        <select v-model="status">
          <option v-for="s in Object.values(StreamStatus)" :key="s" :value="s" capitalize>
            {{ s }}
          </option>
        </select>
      </div>
    </div>

    <details>
      <summary>Policy</summary>
      <pre>{{ policy }}</pre>
    </details>
  </div>
</template>
