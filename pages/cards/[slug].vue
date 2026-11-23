<script setup>
import { ArrowLeft, Sparkles } from 'lucide-vue-next'
import { cardById, cardPrice, formats, newDesign, occasionById, priceLabel } from '~/data/catalog'

definePageMeta({ key: route => route.path })

const { slug } = useRoute().params
if (!Object.hasOwn(cardById, slug)) throw createError({ statusCode: 404, statusMessage: 'Card not found', fatal: true })

const card = cardById[slug]
const occasion = occasionById[card.occasion]
const format = ref('print')
const { addToBag } = useShop()

useSeoMeta({ title: card.name + ' · Uthum Pathum', description: card.caption })

function orderCard(buyNow) {
  return addToBag({
    id: crypto.randomUUID(), kind: 'card', productId: card.id,
    format: format.value, design: newDesign(card), gifts: [], quantity: 1,
  }, buyNow)
}
</script>

<template>
  <section class="page-width section-block">
    <NuxtLink to="/cards" class="text-button back-link"><ArrowLeft :size="16" aria-hidden="true" /> All greeting cards</NuxtLink>
    <div class="detail-layout product-detail">
      <div class="detail-art" :style="{ backgroundColor: occasion.tint }"><CardCover :card="card" /></div>
      <div class="detail-fields space-y-5">
        <header class="detail-heading">
          <p class="eyebrow">{{ occasion.label }}</p>
          <h1>{{ card.name }}</h1>
          <p class="section-intro">{{ card.caption }}</p>
        </header>
        <fieldset class="field-group">
          <legend>Card format</legend>
          <label v-for="item in formats" :key="item.id" class="option-row">
            <input v-model="format" type="radio" name="card-format" :value="item.id" class="h-4 w-4">
            <span><strong>{{ item.name }}</strong><small>{{ item.description }}</small></span>
            <strong>{{ priceLabel(cardPrice(card, item.id)) }}</strong>
          </label>
        </fieldset>
        <NuxtLink class="button button-primary w-full" :to="{ path: '/studio', query: { card: card.id } }">
          <Sparkles :size="17" aria-hidden="true" /> Customize this card
        </NuxtLink>
        <div class="flex flex-wrap gap-2">
          <button class="button button-outline grow" type="button" @click="orderCard(false)">Add to bag</button>
          <button class="button button-outline grow" type="button" @click="orderCard(true)">Buy now</button>
        </div>
      </div>
    </div>
  </section>
</template>
