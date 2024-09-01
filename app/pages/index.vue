<script setup lang="ts">
const { subscribe } = useBlockchain()
subscribe()
const { status, policy, blocks } = storeToRefs(useBlockchain())
</script>

<template>
  <div>
    {{ status }}
    Last block: {{ blocks.at(-1)?.hash }}
    <pre>
      {{ policy }}
    </pre>
  </div>
</template>
