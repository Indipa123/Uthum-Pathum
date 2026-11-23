<script setup>
import { Gift, Heart, Minus, Plus, ShoppingBag } from 'lucide-vue-next'
import { useShop, lineDetail, lineName } from '~/composables/useShop'
import { linePrice } from '~/composables/useBag'
import { giftById, priceLabel } from '~/data/catalog'

const { bag } = useShop()
const subtotal = computed(() => bag.lines.value.reduce((sum, line) => sum + linePrice(line) * line.quantity, 0))
useSeoMeta({ title: 'Your Gift Bag · Uthum Pathum', robots: 'noindex' })
</script>

<template>
  <section class="page-width section-block">
    <div class="section-title"><h1>Your <em>gift bag.</em></h1></div>
    <p v-if="!bag.loaded.value" class="section-intro" role="status">Loading your bag…</p>
    <div v-else-if="!bag.lines.value.length" class="shop-panel empty-state page-action">
      <ShoppingBag :size="34" aria-hidden="true" /><h2>Your bag is empty.</h2>
      <div class="flex flex-wrap justify-center gap-2">
        <NuxtLink class="button button-primary" to="/cards">Shop cards</NuxtLink>
        <NuxtLink class="button button-outline" to="/gifts">Shop gifts</NuxtLink>
      </div>
    </div>
    <div v-else class="commerce-layout page-action">
      <div class="shop-panel">
        <p v-if="bag.storageError.value" class="field-help">This browser may clear your bag when you close the page.</p>
        <ul class="bag-list">
          <li v-for="line in bag.lines.value" :key="line.id">
            <div class="bag-item-info">
              <span class="bag-item-icon"><component :is="line.kind === 'card' ? Heart : Gift" :size="21" aria-hidden="true" /></span>
              <div>
                <strong>{{ lineName(line) }}</strong><small>{{ lineDetail(line) }}</small>
                <small v-if="line.gifts?.length">With {{ line.gifts.map(id => giftById[id].name).join(', ') }}</small>
              </div>
              <strong>{{ priceLabel(linePrice(line) * line.quantity) }}</strong>
            </div>
            <div class="bag-item-actions">
              <div class="quantity-control">
                <button type="button" :aria-label="'Decrease quantity of ' + lineName(line)" :disabled="line.quantity <= 1" @click="bag.setQuantity(line.id, line.quantity - 1)"><Minus :size="14" aria-hidden="true" /></button>
                <span>{{ line.quantity }}</span>
                <button type="button" :aria-label="'Increase quantity of ' + lineName(line)" :disabled="line.quantity >= 20" @click="bag.setQuantity(line.id, line.quantity + 1)"><Plus :size="14" aria-hidden="true" /></button>
              </div>
              <button class="text-button" type="button" :aria-label="'Remove ' + lineName(line)" @click="bag.remove(line.id)">Remove</button>
            </div>
          </li>
        </ul>
      </div>
      <aside class="shop-panel space-y-4" aria-labelledby="bag-summary">
        <h2 id="bag-summary" class="panel-heading">Order summary</h2>
        <div class="summary-total"><span>Subtotal</span><strong>{{ priceLabel(subtotal) }}</strong></div>
        <NuxtLink class="button button-primary w-full" to="/checkout">Continue to checkout</NuxtLink>
        <div class="flex flex-wrap gap-x-4 gap-y-2">
          <NuxtLink class="text-button" to="/cards">Shop cards</NuxtLink>
          <NuxtLink class="text-button" to="/gifts">Shop gifts</NuxtLink>
        </div>
      </aside>
    </div>
  </section>
</template>
