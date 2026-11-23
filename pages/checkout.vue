<script setup>
import { ArrowLeft, Package, Share2, Truck } from 'lucide-vue-next'
import { useShop, lineName } from '~/composables/useShop'
import { linePrice, needsFulfillment } from '~/composables/useBag'
import { priceLabel } from '~/data/catalog'

const route = useRoute()
const { bag, directLine, sessionReady, recordOrder } = useShop()
const buyNow = computed(() => route.query.mode === 'buy-now')
const ready = computed(() => buyNow.value ? sessionReady.value : bag.loaded.value)
const items = computed(() => buyNow.value ? (directLine.value ? [directLine.value] : []) : bag.lines.value)
const physical = computed(() => items.value.some(needsFulfillment))
const method = ref('deliver')
const area = ref('')
const date = ref('')
const recipient = ref('')
const address = ref('')
const submitting = ref(false)
const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Colombo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
const deliveryFee = computed(() => physical.value && method.value === 'deliver' ? Number(area.value) : 0)
const subtotal = computed(() => items.value.reduce((sum, line) => sum + linePrice(line) * line.quantity, 0))
const total = computed(() => subtotal.value + deliveryFee.value)

useSeoMeta({ title: 'Checkout · Uthum Pathum', robots: 'noindex' })

async function completeOrder() {
  if (submitting.value || !items.value.length) return
  submitting.value = true
  try {
    await recordOrder({
      id: 'UP-' + crypto.randomUUID().slice(0, 8).toUpperCase(),
      lines: JSON.parse(JSON.stringify(items.value)),
      method: physical.value ? method.value : 'digital',
      date: date.value,
      total: total.value,
    }, buyNow.value)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="page-width section-block">
    <NuxtLink to="/bag" class="text-button back-link"><ArrowLeft :size="16" aria-hidden="true" /> Your gift bag</NuxtLink>
    <div class="section-title"><h1>Checkout</h1></div>
    <p v-if="!ready" class="section-intro" role="status">Loading your order…</p>
    <div v-else-if="!items.length" class="shop-panel empty-state page-action">
      <h2>{{ buyNow ? 'This purchase selection is no longer available.' : 'Your bag is empty.' }}</h2>
      <div class="flex flex-wrap justify-center gap-2">
        <NuxtLink class="button button-primary" to="/cards">Shop cards</NuxtLink>
        <NuxtLink class="button button-outline" to="/gifts">Shop gifts</NuxtLink>
      </div>
    </div>
    <form v-else class="commerce-layout page-action" @submit.prevent="completeOrder">
      <div class="shop-panel space-y-5">
        <p class="demo-note">Demo checkout. Use sample details. This preview simulates payment and fulfillment.</p>
        <div v-if="physical" class="space-y-4">
          <fieldset class="field-group">
            <legend>How should they receive it?</legend>
            <label class="option-row"><input v-model="method" name="delivery" type="radio" value="deliver" class="h-4 w-4"><span><strong>Delivery</strong><small>Send it to their address</small></span><Truck :size="20" aria-hidden="true" /></label>
            <label class="option-row"><input v-model="method" name="delivery" type="radio" value="pickup" class="h-4 w-4"><span><strong>Showroom pickup</strong><small>Jawatha, Colombo 5</small></span><Package :size="20" aria-hidden="true" /></label>
          </fieldset>
          <div class="field-group"><label for="recipient">Recipient name</label><input id="recipient" v-model="recipient" class="form-field" placeholder="e.g. Alex" maxlength="80" required></div>
          <template v-if="method === 'deliver'">
            <div class="field-group"><label for="delivery-area">Delivery area</label><select id="delivery-area" v-model="area" class="form-field" required><option value="" disabled>Choose an area</option><option value="450">Colombo · Rs. 450</option><option value="650">Greater Colombo · Rs. 650</option><option value="900">Other supported areas · Rs. 900</option></select></div>
            <div class="field-group"><label for="delivery-address">Delivery address</label><textarea id="delivery-address" v-model="address" class="form-field" rows="2" maxlength="160" required /></div>
          </template>
          <div class="field-group"><label for="delivery-date">Preferred {{ method === 'deliver' ? 'delivery' : 'pickup' }} date</label><input id="delivery-date" v-model="date" class="form-field" type="date" :min="today" required></div>
        </div>
        <p v-else class="digital-note"><Share2 :size="19" aria-hidden="true" /> Your digital card will be ready to download and share after this step.</p>
      </div>
      <aside class="shop-panel space-y-4" aria-labelledby="checkout-summary">
        <h2 id="checkout-summary" class="panel-heading">Order summary</h2>
        <ul class="checkout-items">
          <li v-for="line in items" :key="line.id"><span>{{ lineName(line) }} <small>× {{ line.quantity }}</small></span><strong>{{ priceLabel(linePrice(line) * line.quantity) }}</strong></li>
        </ul>
        <div class="checkout-totals">
          <p><span>Items</span><strong>{{ priceLabel(subtotal) }}</strong></p>
          <p v-if="physical"><span>{{ method === 'deliver' ? 'Delivery estimate' : 'Showroom pickup' }}</span><strong>{{ method === 'deliver' && !area ? 'Choose an area' : priceLabel(deliveryFee) }}</strong></p>
          <div class="summary-total"><span>Total</span><strong>{{ priceLabel(total) }}</strong></div>
        </div>
        <button class="button button-primary w-full" type="submit" :disabled="submitting">Complete demo order</button>
      </aside>
    </form>
  </section>
</template>
