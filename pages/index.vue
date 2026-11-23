<script setup>
import { Share2, Sparkles, Truck } from 'lucide-vue-next'
import { cardById, cards } from '~/data/catalog'

const lazyHeroScene = defineAsyncComponent(() => import('~/components/HeroScene.vue'))
const route = useRoute()
const router = useRouter()

useSeoMeta({
  title: 'Uthum Pathum · Cards for the people you love',
  description: 'Make it personal with a custom greeting card, a thoughtful gift, or both. Designed for celebrating in Sri Lanka.',
})

onMounted(() => {
  const oldSections = { '#cards': '/cards', '#gifts': '/gifts', '#occasions': '/occasions' }
  if (Object.hasOwn(oldSections, route.hash)) router.replace(oldSections[route.hash])
})
</script>

<template>
  <div>
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-copy">
        <p class="eyebrow">Personalized cards & gifts</p>
        <h1 id="hero-title">Make it mean <em>a little more.</em></h1>
        <p class="hero-description">Personalize a greeting card, pair it with a thoughtful gift, and make their day.</p>
        <div class="hero-actions">
          <NuxtLink class="button button-light" to="/studio">Create a card</NuxtLink>
          <NuxtLink class="button hero-secondary" to="/cards">Shop cards</NuxtLink>
        </div>
      </div>
      <div class="hero-visual">
        <img class="hero-photo" src="/images/hero.webp" alt="A burgundy Love, Always card and a pink greeting card arranged with red ribbon" fetchpriority="high" width="1300" height="867">
        <ClientOnly><component :is="lazyHeroScene" /></ClientOnly>
        <NuxtLink class="hero-feature" :to="{ path: '/cards', query: { occasion: 'love' } }">Shop Love &amp; Romance</NuxtLink>
      </div>
    </section>

    <div class="benefit-band">
      <div class="home-width benefit-inner">
        <span><Sparkles :size="20" aria-hidden="true" /> Make any card your own</span>
        <span><Truck :size="21" aria-hidden="true" /> Delivery or showroom pickup</span>
        <span><Share2 :size="19" aria-hidden="true" /> Print or share digitally</span>
      </div>
    </div>

    <section class="home-width home-section home-occasions" aria-labelledby="occasions-title">
      <div class="section-title home-heading">
        <h2 id="occasions-title">What are we <em>celebrating?</em></h2>
        <NuxtLink class="button button-outline" to="/occasions">All occasions</NuxtLink>
      </div>
      <OccasionTiles />
    </section>

    <section class="home-cards" aria-labelledby="cards-title">
      <div class="home-width home-section">
        <div class="section-title home-heading">
          <h2 id="cards-title">Cards worth <em>keeping.</em></h2>
          <NuxtLink to="/cards" class="button button-outline">View all cards</NuxtLink>
        </div>
        <CardGrid :cards="cards.slice(0, 4)" />
      </div>
    </section>

    <section class="home-gifts" aria-labelledby="gifts-title">
      <div class="home-width home-section">
        <div class="section-title home-heading">
          <div>
            <h2 id="gifts-title">A little something <em>extra.</em></h2>
            <p class="section-intro">Chocolates, cake, and fresh flowers to send on their own or with a card.</p>
          </div>
          <NuxtLink to="/gifts" class="button button-outline">Shop all gifts</NuxtLink>
        </div>
        <GiftGrid />
      </div>
    </section>

    <section class="home-studio" aria-labelledby="studio-title">
      <div class="home-width home-studio-inner">
        <div class="home-studio-art" aria-hidden="true">
          <CardCover :card="cardById['birthday-wish']" />
          <CardCover :card="cardById['love-always']" />
        </div>
        <div class="home-studio-copy">
          <div class="section-title home-heading"><h2 id="studio-title">Make it <em>yours.</em></h2></div>
          <p>Start with a design you like, add a photo or message, and see it come together in Card Studio.</p>
          <NuxtLink to="/studio" class="button button-light">Open Card Studio</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
