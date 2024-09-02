<script setup lang="ts">
const isDev = import.meta.dev
</script>

<template>
  <main pt-32>
    <DebugPanel v-if="isDev" mx-32 />
    <Blockchain />
    <div flex="~ items-center wrap justify-between gap-80" ring="1.5 solid neutral-500" mx-auto my-64 max-w-712 rounded-8 px-32 py-20 font-semibold>
      <Stats flex-1 />
      <button nq-pill-blue>
        Send Test Transaction
      </button>
    </div>
  </main>
</template>
