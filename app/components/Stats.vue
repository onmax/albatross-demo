<script setup lang="ts">
import TweenedNumber from './TweenedNumber.vue'

const { throughput, txLimit, blockTime } = storeToRefs(useStream())
</script>

<template>
  <ul flex="~ items-center justify-between gap-32">
    <li>
      <div text="24/none neutral">
        <TweenedNumber :value="throughput" :decimals="1" :animation-duration="500" />
        tx/s
      </div>
      <p text="14 neutral-800">
        Throughput
      </p>
    </li>
    <li>
      <div text="24/none neutral">
        <TweenedNumber :value="txLimit" :decimals="0" :animation-duration="500" />
        tx/s
      </div>
      <p text="14 neutral-800">
        Capacity
      </p>
    </li>
    <li>
      <div text="24/none neutral">
        <TweenedNumber :value="blockTime" :decimals="1" :animation-duration="500" />
        s
      </div>
      <p text="14 neutral-800">
        Avg. block time
      </p>
    </li>
  </ul>
</template>
