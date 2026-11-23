<script setup>
import { CakeSlice, Flower2, Heart, PartyPopper, Smile, Sparkles } from 'lucide-vue-next'
import { occasions } from '~/data/catalog'

const icons = { CakeSlice, Flower2, Heart, PartyPopper, Smile, Sparkles }
</script>

<template>
  <div class="occasion-grid">
    <NuxtLink v-for="occasion in occasions" :key="occasion.id" class="occasion-tile"
      :to="{ path: '/cards', query: { occasion: occasion.id } }"
      :style="{ '--tint': occasion.tint, '--tint-ink': occasion.ink }">
      <component :is="icons[occasion.icon]" :size="25" :stroke-width="1.65" aria-hidden="true" />
      <strong>{{ occasion.label }}</strong>
    </NuxtLink>
  </div>
</template>
