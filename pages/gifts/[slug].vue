<script setup>
import { ArrowLeft } from 'lucide-vue-next'
import { giftById, priceLabel } from '~/data/catalog'

definePageMeta({ key: route => route.path })

const { slug } = useRoute().params
if (!Object.hasOwn(giftById, slug)) throw createError({ statusCode: 404, statusMessage: 'Gift not found', fatal: true })

const gift = giftById[slug]
const { addToBag } = useShop()

useSeoMeta({ title: gift.name + ' · Uthum Pathum', description: gift.description })

function orderGift(buyNow) {
  return addToBag({ id: crypto.randomUUID(), kind: 'gift', productId: gift.id, quantity: 1 }, buyNow)
}
</script>

<template>
  <section class="page-width section-block">
    <NuxtLink to="/gifts" class="text-button back-link"><ArrowLeft :size="16" aria-hidden="true" /> All gifts</NuxtLink>
    <div class="detail-layout product-detail">
      <div class="gift-detail" :style="{ backgroundColor: gift.tint }">
        <img :src="gift.image" :alt="gift.name" width="512" height="810" fetchpriority="high">
      </div>
      <div class="detail-fields space-y-5">
        <header class="detail-heading">
          <p class="eyebrow">{{ gift.type }}</p>
          <h1>{{ gift.name }}</h1>
          <p class="section-intro">{{ gift.description }}</p>
        </header>
        <p class="detail-price">{{ priceLabel(gift.price) }}</p>
        <button class="button button-primary w-full" type="button" @click="orderGift(false)">Add to bag</button>
        <button class="button button-outline w-full" type="button" @click="orderGift(true)">Buy now</button>
        <p class="field-help">Choose delivery or showroom pickup at checkout.</p>
      </div>
    </div>
  </section>
</template>
