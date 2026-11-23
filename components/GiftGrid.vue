<script setup>
import { Plus } from 'lucide-vue-next'
import { gifts, priceLabel } from '~/data/catalog'

const { addToBag } = useShop()

function addGift(gift) {
  return addToBag({ id: crypto.randomUUID(), kind: 'gift', productId: gift.id, quantity: 1 })
}
</script>

<template>
  <div class="gift-grid">
    <article v-for="gift in gifts" :key="gift.id" class="gift-card">
      <NuxtLink class="gift-image" :to="'/gifts/' + gift.id" :style="{ backgroundColor: gift.tint }" :aria-label="'View ' + gift.name">
        <img :src="gift.image" :alt="gift.name" width="512" height="810" loading="lazy">
        <span>{{ gift.type }}</span>
      </NuxtLink>
      <div class="gift-meta">
        <div>
          <h3><NuxtLink :to="'/gifts/' + gift.id">{{ gift.name }}</NuxtLink></h3>
          <p>{{ priceLabel(gift.price) }}</p>
        </div>
        <button class="icon-button gift-add" type="button" :aria-label="'Add ' + gift.name + ' to bag'" @click="addGift(gift)"><Plus :size="21" aria-hidden="true" /></button>
      </div>
    </article>
  </div>
</template>
