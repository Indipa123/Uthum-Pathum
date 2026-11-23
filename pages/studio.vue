<script setup>
import { cardById, cards } from '~/data/catalog'

const route = useRoute()
const router = useRouter()
const { addToBag } = useShop()
const card = computed(() => {
  const id = route.query.card
  return typeof id === 'string' && Object.hasOwn(cardById, id) ? cardById[id] : cards[1]
})

useSeoMeta({ title: 'Card Studio · Uthum Pathum', description: 'Create a personal greeting card with your own message, photo, and design.' })
</script>

<template>
  <section class="page-width section-block">
    <div class="section-title"><h1>Card <em>Studio.</em></h1></div>
    <p class="section-intro">Customize the cover and inside message, then choose a format and add a gift if you like.</p>
    <div class="field-group studio-template">
      <label for="studio-template">Starting design</label>
      <select id="studio-template" :value="card.id" class="form-field" @change="router.replace({ query: { card: $event.target.value } })">
        <option v-for="item in cards" :key="item.id" :value="item.id">{{ item.name }}</option>
      </select>
    </div>
    <CardStudio :key="card.id" :card="card" @add="addToBag" />
  </section>
</template>
