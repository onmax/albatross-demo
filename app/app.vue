<script setup lang="ts">
const route = useRoute()
const darkQueryParam = computed(() => route.query.dark === 'true' ? 'dark' : 'light')
useDark({ initialValue: darkQueryParam })
</script>

<template>
  <NuxtPage />
</template>
