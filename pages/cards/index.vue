<script setup>
import { cards, occasionById, occasions } from '~/data/catalog'

const route = useRoute()
const currentOccasion = computed(() => {
  const id = route.query.occasion
  return typeof id === 'string' && Object.hasOwn(occasionById, id) ? occasionById[id] : null
})
const visibleCards = computed(() => currentOccasion.value ? cards.filter(card => card.occasion === currentOccasion.value.id) : cards)

useSeoMeta({
  title: () => (currentOccasion.value ? currentOccasion.value.label + ' Cards' : 'Shop Greeting Cards') + ' · Uthum Pathum',
  description: 'Browse printed and digital greeting cards and personalize any design in Card Studio.',
})
</script>

<template>
  <section class="page-width section-block">
    <div class="section-title">
      <h1 v-if="currentOccasion">{{ currentOccasion.label }} <em>cards.</em></h1>
      <h1 v-else>Shop <em>greeting cards.</em></h1>
    </div>
    <p class="section-intro">Pick a design, then make it yours in Card Studio or order it as shown.</p>
    <nav class="filter-row" aria-label="Filter cards by occasion">
      <NuxtLink v-for="item in [{ id: 'all', label: 'All cards' }, ...occasions]" :key="item.id"
        :to="item.id === 'all' ? '/cards' : { path: '/cards', query: { occasion: item.id } }"
        :aria-current-value="(currentOccasion?.id ?? 'all') === item.id ? 'page' : 'false'">
        {{ item.label }}
      </NuxtLink>
    </nav>
    <CardGrid :cards="visibleCards" />
  </section>
</template>
