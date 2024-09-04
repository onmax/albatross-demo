<script setup lang="ts">
const { blockNumber } = storeToRefs(useBlocks())
const { status: statsStatus } = storeToRefs(useStats())

const getNonce = () => Math.round(Math.random() * (2 ** 32 - 1))
const nonce = ref<number>(getNonce())

const { status: statusSendTx, refresh: sendTx, clear, error } = await useFetch('/api/send-tx', { method: 'POST', body: { nonce, validityStartHeight: blockNumber }, immediate: false, watch: false })

setTimeout(() => {
  nonce.value = getNonce()
  clear()
}, 50)

const pillClass = computed(() => getPillColor({ nonce: nonce.value }))
</script>

<template>
  <Blockchain>
    <template #pending-tx>
      <!-- :class="{ 'has-tx': latestTx, 'tx-sent': txSent, 'tx-failed': txFailed }"> -->
      <!-- transform: translateY(2.5rem);
        transition: transform 0.4s var(--nimiq-ease) 0.1s; -->
      <transition enter-from-class="op-0 translate-y-12" mode="out-in" enter-active-class="transition-opacity translate-y-0 duration-400 ease-in">
        <div v-if="statusSendTx === 'error'" flex="~ items-center justify-center col shrink-0" relative w-72>
          <i i-nimiq:cross text="12 red" />
          <span text="13/17 center red" mt-12 font-semibold transition-opacity duration-400 ease-in>
            Error sending transaction. {{ error }}
          </span>
        </div>
        <div v-else-if="statusSendTx === 'pending' && nonce" flex="~ items-center justify-center col shrink-0" relative w-72>
          <div grid="~ *:row-span-full *:col-span-full *:self-center *:justify-self-center">
            <i i-nimiq:spinner text="20 blue" />
            <TransactionDot :nonce />
          </div>
          <span text="13/17 center neutral-800" mt-12 font-semibold transition-opacity duration-400 ease-in>
            Transaction<br>pending
          </span>
        </div>
      </transition>
    </template>
  </Blockchain>
  <div v-if="statsStatus === 'OPEN'" flex="~ items-center justify-center gap-x-80 gap-y-32 col md:row" ring="1.5 solid neutral-500" mx="32 md:auto" my-64 max-w-712 rounded-8 px-32 py-20 font-semibold>
    <Stats flex-1 />
    <button :disabled="statusSendTx !== 'idle' && statusSendTx !== 'success'" select-none :class="pillClass" @click="() => sendTx()">
      Send Test Transaction
    </button>
  </div>
</template>
