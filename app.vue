<script setup>
import { Check, Heart, Mail, MapPin, Search, ShoppingBag, Sparkles } from 'lucide-vue-next'
import { provideShop } from '~/composables/useShop'

const { bag, notice } = provideShop()
const route = useRoute()
const section = computed(() => '/' + route.path.split('/')[1])
</script>

<template>
  <div class="site-shell">
    <NuxtRouteAnnouncer />
    <a class="skip-link" href="#main">Skip to content</a>
    <div class="announcement">
      <Heart :size="13" aria-hidden="true" /> Made for the moments that matter.
      <span class="announcement-separator"></span>
      <span>Gifting in Sri Lanka</span>
    </div>

    <header class="site-header">
      <div class="page-width header-inner">
        <NuxtLink class="wordmark" to="/" aria-label="Uthum Pathum home"><ShopWordmark /></NuxtLink>
        <nav class="main-nav" aria-label="Main navigation">
          <NuxtLink to="/cards" :class="{ 'nav-current': section === '/cards' }">Shop cards</NuxtLink>
          <NuxtLink to="/occasions">Occasions</NuxtLink>
          <NuxtLink to="/gifts" :class="{ 'nav-current': section === '/gifts' }">Gifts</NuxtLink>
          <NuxtLink to="/studio" class="nav-studio"><Sparkles :size="14" aria-hidden="true" /> Card Studio</NuxtLink>
        </nav>
        <div class="header-actions">
          <NuxtLink to="/search" class="icon-button" aria-label="Search the shop"><Search :size="21" aria-hidden="true" /></NuxtLink>
          <NuxtLink to="/bag" class="icon-button bag-button" :aria-label="'Shopping bag, ' + bag.quantity.value + ' items'">
            <ShoppingBag :size="21" aria-hidden="true" /><span class="bag-count" aria-hidden="true">{{ bag.quantity.value }}</span>
          </NuxtLink>
        </div>
      </div>
    </header>

    <main id="main" tabindex="-1">
      <NuxtPage />
    </main>

    <footer class="site-footer">
      <div class="page-width footer-inner">
        <div>
          <NuxtLink class="wordmark" to="/" aria-label="Uthum Pathum home"><ShopWordmark /></NuxtLink>
          <p>Greeting cards and thoughtful gifts from Sri Lanka.</p>
        </div>
        <nav aria-label="Footer navigation">
          <NuxtLink to="/cards">Shop cards</NuxtLink>
          <NuxtLink to="/gifts">Shop gifts</NuxtLink>
          <NuxtLink to="/studio">Card Studio</NuxtLink>
        </nav>
        <div class="footer-contact">
          <a href="mailto:info@uthumpathum.com"><Mail :size="16" aria-hidden="true" /> info@uthumpathum.com</a>
          <a href="https://maps.app.goo.gl/vHkuV7TiA6jq1nSe8" target="_blank" rel="noopener"><MapPin :size="16" aria-hidden="true" /> Colombo 5 showroom</a>
        </div>
      </div>
      <div class="page-width footer-bottom">© {{ new Date().getFullYear() }} Uthum Pathum</div>
    </footer>

    <Transition><div v-if="notice" class="toast" role="status"><Check :size="18" aria-hidden="true" /> {{ notice }}</div></Transition>
  </div>
</template>
