<script setup lang="ts">
const isDev = import.meta.dev
const { status } = storeToRefs(useStream())
</script>

<template>
  <main pt-32>
    <DebugPanel v-if="isDev" mx-32 />
    <Blockchain />
    <div v-if="status === StreamStatus.Connected" flex="~ items-center justify-center gap-x-80 gap-y-32 col md:row" ring="1.5 solid neutral-500" mx="32 md:auto" my-64 max-w-712 rounded-8 px-32 py-20 font-semibold>
      <Stats flex-1 />
      <button nq-pill-blue>
        Send Test Transaction
      </button>
    </div>
  </main>
</template>
