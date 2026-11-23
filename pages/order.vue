<script setup>
import { ArrowDownToLine, Check, Share2 } from 'lucide-vue-next'
import { useShop, lineName } from '~/composables/useShop'
import { priceLabel } from '~/data/catalog'
import { exportCard } from '~/utils/card-art'

const { receipt, sessionReady } = useShop()
const cards = computed(() => receipt.value?.lines.filter(line => line.kind === 'card') ?? [])
const files = shallowRef({})
const status = ref('')

useSeoMeta({ title: 'Demo Order · Uthum Pathum', robots: 'noindex' })

watch(receipt, async (_, __, onCleanup) => {
  if (import.meta.server) return
  let current = true
  onCleanup(() => { current = false })
  const prepared = await Promise.allSettled(cards.value.map(async line => [line.id, await exportCard(line.design, lineName(line))]))
  if (!current) return
  files.value = Object.fromEntries(prepared.filter(item => item.status === 'fulfilled').map(item => item.value))
  if (prepared.some(item => item.status === 'rejected')) status.value = 'An image could not be prepared. Try the download button again.'
}, { immediate: true })

function saveFile(file) {
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = file.name
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 15000)
}

async function download(line) {
  try {
    saveFile(files.value[line.id] || await exportCard(line.design, lineName(line)))
    status.value = 'PNG downloaded.'
  } catch {
    status.value = 'Could not download the card. Please try again.'
  }
}

async function share(line) {
  const file = files.value[line.id]
  if (!file) return
  const shareData = { files: [file], title: lineName(line) }
  try {
    if (navigator.canShare?.(shareData)) {
      await navigator.share(shareData)
      status.value = 'Card passed to your sharing app.'
      return
    }
  } catch (error) {
    if (error.name === 'AbortError') return
  }
  saveFile(file)
  status.value = 'PNG downloaded. Attach it in your preferred social app.'
}
</script>

<template>
  <section class="page-width section-block narrow-page">
    <div class="section-title"><h1>{{ receipt ? 'Your demo order is ready.' : 'Order confirmation' }}</h1></div>
    <p v-if="!sessionReady" class="section-intro" role="status">Loading your confirmation…</p>
    <div v-else class="shop-panel page-action space-y-5">
      <template v-if="receipt">
        <div class="order-success">
          <span><Check :size="26" aria-hidden="true" /></span>
          <div>
            <strong>{{ receipt.id }}</strong>
            <p>{{ receipt.method === 'digital' ? 'Download or share your digital card below.' : 'Your ' + (receipt.method === 'pickup' ? 'pickup' : 'delivery') + ' was simulated for ' + receipt.date + '.' }}</p>
          </div>
        </div>
        <div class="summary-total"><span>Total</span><strong>{{ priceLabel(receipt.total) }}</strong></div>
        <div v-for="line in cards" :key="line.id" class="share-item space-y-2">
          <strong>{{ lineName(line) }}</strong>
          <div class="flex flex-wrap gap-2">
            <button class="button button-primary button-small" type="button" :aria-label="'Download PNG of ' + lineName(line)" @click="download(line)"><ArrowDownToLine :size="17" aria-hidden="true" /> Download PNG</button>
            <button class="button button-outline button-small" type="button" :disabled="!files[line.id]" :aria-label="'Share ' + lineName(line)" @click="share(line)"><Share2 :size="17" aria-hidden="true" /> Share card</button>
          </div>
        </div>
        <p v-if="status" class="field-help" aria-live="polite">{{ status }}</p>
      </template>
      <p v-else>There’s no demo order to show in this tab.</p>
      <NuxtLink class="button button-outline" to="/cards">Back to the shop</NuxtLink>
    </div>
  </section>
</template>
