<script setup>
import { ArrowRight, Search } from 'lucide-vue-next'
import { cards, gifts, occasionById } from '~/data/catalog'

const route = useRoute()
const router = useRouter()
const term = computed(() => typeof route.query.q === 'string' ? route.query.q.trim() : '')
const query = ref(term.value)
const products = [
  ...cards.map(card => ({ ...card, url: '/cards/' + card.id, subtitle: occasionById[card.occasion].label })),
  ...gifts.map(gift => ({ ...gift, url: '/gifts/' + gift.id, subtitle: gift.type })),
]
const results = computed(() => {
  const phrase = term.value.toLowerCase()
  return phrase
    ? products.filter(product => [product.name, product.subtitle, product.headline, product.description].some(value => value?.toLowerCase().includes(phrase)))
    : products.slice(0, 4).concat(products.slice(-gifts.length))
})

watch(term, value => { query.value = value })
useSeoMeta({ title: 'Search the Shop · Uthum Pathum', robots: 'noindex' })

function submitSearch() {
  const value = query.value.trim()
  return router.push({ path: '/search', query: value ? { q: value } : {} })
}
</script>

<template>
  <section class="page-width section-block narrow-page">
    <div class="section-title"><h1>Find a card <em>or gift.</em></h1></div>
    <form class="search-input page-action" role="search" @submit.prevent="submitSearch">
      <input v-model="query" class="form-field" type="search" aria-label="Search cards and gifts" placeholder="Try birthday, cake, or flowers" maxlength="100">
      <button type="submit" class="button button-primary"><Search :size="17" aria-hidden="true" /> Search</button>
    </form>
    <h2 class="search-heading" aria-live="polite">{{ term ? results.length + (results.length === 1 ? ' result' : ' results') + ' for “' + term + '”' : 'Popular cards and gifts' }}</h2>
    <ul v-if="results.length" class="search-results">
      <li v-for="item in results" :key="item.url">
        <NuxtLink :to="item.url">
          <span><strong>{{ item.name }}</strong><small>{{ item.subtitle }}</small></span><ArrowRight :size="18" aria-hidden="true" />
        </NuxtLink>
      </li>
    </ul>
    <p v-else class="empty-message">Try a different product name or occasion.</p>
  </section>
</template>
