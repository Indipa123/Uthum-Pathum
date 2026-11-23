<script setup>
import { Sparkles } from 'lucide-vue-next'
import { cardPrice, occasionById, priceLabel } from '~/data/catalog'

defineProps({ cards: { type: Array, required: true } })
</script>

<template>
  <div class="product-grid">
    <article v-for="card in cards" :key="card.id" class="product-card">
      <NuxtLink class="product-visual" :to="'/cards/' + card.id" :aria-label="'View ' + card.name" :style="{ '--product-tone': occasionById[card.occasion].tint }">
        <CardCover :card="card" />
        <span v-if="card.tag" class="product-tag">{{ card.tag }}</span>
      </NuxtLink>
      <div class="product-meta">
        <p>{{ occasionById[card.occasion].label }}</p>
        <h3><NuxtLink :to="'/cards/' + card.id">{{ card.name }}</NuxtLink></h3>
        <div class="product-bottom">
          <strong>From {{ priceLabel(cardPrice(card, 'digital')) }}</strong>
          <NuxtLink class="text-button" :to="{ path: '/studio', query: { card: card.id } }" :aria-label="'Customize ' + card.name">
            <Sparkles :size="15" aria-hidden="true" /> Customize
          </NuxtLink>
        </div>
      </div>
    </article>
  </div>
</template>
