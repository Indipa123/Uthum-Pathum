<script setup>
import {
  ArrowDown, ArrowDownToLine, ArrowRight, ArrowUpRight, CakeSlice, Check, ChevronRight, Cookie,
  Flower2, Gift, Heart, Mail, MapPin, Minus, Package, PartyPopper, Plus, Search,
  Share2, ShoppingBag, Smile, Sparkles, Truck,
} from 'lucide-vue-next'
import {
  cardById, cardPrice, cards, formats, giftById, gifts, newDesign, occasions, priceLabel,
} from '~/data/catalog'
import { linePrice, needsFulfillment, useBag } from '~/composables/useBag'
import { exportCard } from '~/utils/card-art'

const icons = { CakeSlice, Cookie, Flower2, Heart, PartyPopper, Smile, Sparkles }
const lazyHeroScene = defineAsyncComponent(() => import('~/components/HeroScene.vue'))
const bag = useBag()
const filter = ref('all')
const expanded = ref(false)
const mode = ref('')
const activeCard = shallowRef(null)
const activeGift = shallowRef(null)
const selectedFormat = ref('print')
const query = ref('')
const searchBox = ref(null)
const toast = ref('')
const logoMissing = ref(false)
const directLine = shallowRef(null)
const orderReceipt = shallowRef(null)
const shareFiles = shallowRef({})
const shareStatus = ref('')
const deliveryMethod = ref('deliver')
const deliveryArea = ref('')
const deliveryDate = ref('')
const recipient = ref('')
const deliveryAddress = ref('')
const today = ref('')
const sriLankaDate = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Colombo', year: 'numeric', month: '2-digit', day: '2-digit' })
let toastTimer

const featured = computed(() => {
  if (filter.value !== 'all') return cards.filter(card => card.occasion === filter.value)
  return expanded.value ? cards : cards.slice(0, 4)
})
const searchItems = computed(() => {
  const term = query.value.trim().toLowerCase()
  return [...cards.map(item => ({ ...item, kind: 'card', subtitle: occasions.find(occasion => occasion.id === item.occasion)?.label })), ...gifts.map(item => ({ ...item, kind: 'gift', subtitle: item.type }))]
    .filter(item => !term || [item.name, item.subtitle, item.headline, item.description].some(value => value?.toLowerCase().includes(term)))
    .slice(0, term ? 16 : 6)
})
const checkoutItems = computed(() => directLine.value ? [directLine.value] : bag.lines.value)
const isPhysical = computed(() => checkoutItems.value.some(needsFulfillment))
const deliveryFee = computed(() => isPhysical.value && deliveryMethod.value === 'deliver' ? Number(deliveryArea.value || 0) : 0)
const checkoutSubtotal = computed(() => checkoutItems.value.reduce((sum, line) => sum + linePrice(line) * line.quantity, 0))
const receiptCards = computed(() => orderReceipt.value?.lines.filter(line => line.kind === 'card') ?? [])
const logoUrl = 'https://uthumpathum.com/wp-content/uploads/logo-white.png'

watch(mode, async current => {
  if (current === 'search') {
    await nextTick()
    searchBox.value?.focus()
  }
})

function revealSection(id) {
  nextTick(() => document.getElementById(id)?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }))
}

function selectOccasion(id) {
  filter.value = id
  expanded.value = false
  revealSection('cards')
}

function showAllCards() {
  filter.value = 'all'
  expanded.value = true
  revealSection('cards')
}

function showStudio(card = cards[1]) {
  activeCard.value = card
  mode.value = 'studio'
}

function showCard(card) {
  activeCard.value = card
  selectedFormat.value = 'print'
  mode.value = 'card'
}

function showGift(gift) {
  activeGift.value = gift
  mode.value = 'gift'
}

function closeDialog() {
  mode.value = ''
}

function lineName(line) {
  return line.kind === 'card' ? cardById[line.productId].name : giftById[line.productId].name
}

function lineDetail(line) {
  if (line.kind === 'gift') return giftById[line.productId].type
  return formats.find(format => format.id === line.format)?.name
}

function notify(message) {
  clearTimeout(toastTimer)
  toast.value = message
  toastTimer = setTimeout(() => { toast.value = '' }, 2800)
}

function openCheckout(line = null) {
  today.value = sriLankaDate.format(new Date())
  directLine.value = line
  deliveryMethod.value = 'deliver'
  deliveryArea.value = ''
  deliveryAddress.value = ''
  deliveryDate.value = ''
  recipient.value = ''
  mode.value = 'checkout'
}

function addLine(line, buyNow = false) {
  if (buyNow) {
    openCheckout(line)
    return
  }
  bag.add(line)
  mode.value = 'bag'
  notify(lineName(line) + ' added to your bag.')
}

function makeCardLine(card, buyNow) {
  addLine({ id: crypto.randomUUID(), kind: 'card', productId: card.id, format: selectedFormat.value, design: newDesign(card), gifts: [], quantity: 1 }, buyNow)
}

function makeGiftLine(gift, buyNow) {
  addLine({ id: crypto.randomUUID(), kind: 'gift', productId: gift.id, quantity: 1 }, buyNow)
}

async function completeOrder() {
  if (!checkoutItems.value.length) return
  const orderLines = JSON.parse(JSON.stringify(checkoutItems.value))
  const viaBag = !directLine.value
  const method = isPhysical.value ? deliveryMethod.value : 'digital'
  orderReceipt.value = {
    id: 'UP-' + crypto.randomUUID().slice(0, 8).toUpperCase(),
    lines: orderLines,
    method,
    total: checkoutSubtotal.value + deliveryFee.value,
    date: deliveryDate.value,
  }
  if (viaBag) orderLines.forEach(line => bag.remove(line.id))
  directLine.value = null
  shareStatus.value = ''
  shareFiles.value = {}
  mode.value = 'success'
  const prepared = await Promise.allSettled(orderLines.filter(line => line.kind === 'card').map(async line => [line.id, await exportCard(line.design, lineName(line))]))
  shareFiles.value = Object.fromEntries(prepared.filter(item => item.status === 'fulfilled').map(item => item.value))
  if (prepared.some(item => item.status === 'rejected')) shareStatus.value = 'An image could not be prepared. Try the download button again.'
}

function saveFile(file) {
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = file.name
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 15000)
}

async function download(line) {
  try {
    saveFile(shareFiles.value[line.id] || await exportCard(line.design, lineName(line)))
    shareStatus.value = 'PNG downloaded.'
  } catch {
    shareStatus.value = 'Could not download the card. Please try again.'
  }
}

async function share(line) {
  const file = shareFiles.value[line.id]
  if (!file) return
  try {
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: lineName(line) })
      shareStatus.value = 'Card passed to your sharing app.'
    } else {
      saveFile(file)
      shareStatus.value = 'PNG downloaded. Attach it in your preferred social app.'
    }
  } catch (error) {
    if (error.name !== 'AbortError') {
      saveFile(file)
      shareStatus.value = 'PNG downloaded. Attach it in your preferred social app.'
    }
  }
}

onBeforeUnmount(() => clearTimeout(toastTimer))
</script>

<template>
  <a class="skip-link" href="#main">Skip to content</a>
  <div class="announcement">
    <Heart :size="13" /> Made for the moments that matter.
    <span class="announcement-separator"></span>
    <span>Gifting in Sri Lanka</span>
  </div>

  <header class="site-header">
    <div class="page-width header-inner">
      <a class="wordmark" href="#" aria-label="Uthum Pathum home">
        <img v-if="!logoMissing" :src="logoUrl" alt="Uthum Pathum" width="157" height="43" @error="logoMissing = true">
        <span v-else class="wordmark-backup"><img src="/images/mark.svg" alt="" width="28" height="28">Uthum Pathum</span>
      </a>
      <nav class="main-nav" aria-label="Main navigation">
        <a href="#cards" @click.prevent="showAllCards">Shop cards</a>
        <a href="#occasions">Occasions</a>
        <a href="#gifts">Gifts</a>
        <button type="button" class="nav-studio" @click="showStudio()"><Sparkles :size="14" /> Card Studio</button>
      </nav>
      <div class="header-actions">
        <button class="icon-button" type="button" aria-label="Search the shop" @click="query = ''; mode = 'search'"><Search :size="21" /></button>
        <button class="icon-button bag-button" type="button" :aria-label="'Shopping bag, ' + bag.quantity.value + ' items'" @click="mode = 'bag'">
          <ShoppingBag :size="21" /><span class="bag-count">{{ bag.quantity.value }}</span>
        </button>
      </div>
    </div>
  </header>

  <main id="main">
    <section class="hero page-width" aria-labelledby="hero-title">
      <div class="hero-copy">
        <p class="eyebrow"><span></span> THE GREETING & GIFT STUDIO</p>
        <h1 id="hero-title">Make it mean<br><em>a little more.</em></h1>
        <p class="hero-description">A card they’ll keep. A gift they’ll remember. Make both personal, then send a little love their way.</p>
        <div class="hero-actions">
          <button class="button button-primary" type="button" @click="showStudio()"><Sparkles :size="17" /> Create a card</button>
          <a class="button button-outline" href="#cards" @click.prevent="showAllCards">Shop cards</a>
        </div>
        <a class="hero-note" href="#occasions"><ArrowDown :size="14" /> Find their occasion</a>
      </div>
      <div class="hero-visual">
        <img class="hero-photo" src="/images/hero.webp" alt="Burgundy Love, Always card and a pink greeting card arranged with a curled red ribbon" fetchpriority="high" width="1300" height="867">
        <ClientOnly><component :is="lazyHeroScene" /></ClientOnly>
        <button class="hero-feature" type="button" @click="showCard(cards[1])">
          <span class="feature-icon"><Heart :size="18" /></span>
          <span><small>THE LOVE COLLECTION</small><strong>Little notes, big feelings.</strong></span>
          <ArrowUpRight class="feature-arrow" :size="20" />
        </button>
      </div>
    </section>

    <div class="benefit-band">
      <div class="page-width benefit-inner">
        <span><Sparkles :size="18" /> Personalize every detail</span>
        <span><Truck :size="19" /> Delivery or pickup</span>
        <span><Share2 :size="17" /> Download & share digitally</span>
      </div>
    </div>

    <section id="occasions" class="page-width section-block occasions-block" aria-labelledby="occasions-title">
      <p class="eyebrow section-eyebrow">FIND THE RIGHT WORDS</p>
      <div class="section-title">
        <h2 id="occasions-title">What are we <em>celebrating?</em></h2>
        <button type="button" class="text-button section-action" @click="showAllCards">View all cards <ArrowRight :size="18" /></button>
      </div>
      <div class="occasion-grid">
        <button
          v-for="occasion in occasions" :key="occasion.id" type="button" class="occasion-tile"
          :aria-pressed="filter === occasion.id" :style="{ '--tint': occasion.tint, '--tint-ink': occasion.ink }"
          @click="selectOccasion(occasion.id)"
        >
          <span><component :is="icons[occasion.icon]" :size="25" :stroke-width="1.65" /></span>
          <strong>{{ occasion.label }}</strong>
        </button>
      </div>
    </section>

    <section id="cards" class="page-width section-block card-section" aria-labelledby="cards-title">
      <p class="eyebrow section-eyebrow">THE CARD SHOP</p>
      <div class="section-title">
        <h2 id="cards-title">{{ filter === 'all' ? 'Good things come' : occasions.find(occasion => occasion.id === filter)?.label }} <em v-if="filter === 'all'">in envelopes.</em></h2>
        <button v-if="filter !== 'all' || !expanded" type="button" class="text-button section-action" @click="showAllCards">View all cards <ArrowRight :size="18" /></button>
      </div>
      <div class="filter-row" aria-label="Filter cards by occasion">
        <button
          v-for="item in [{ id: 'all', label: 'All cards' }, ...occasions]" :key="item.id" type="button"
          :aria-pressed="filter === item.id" @click="filter = item.id; expanded = item.id === 'all'"
        >{{ item.label }}</button>
      </div>
      <div class="product-grid" aria-live="polite">
        <article v-for="card in featured" :key="card.id" class="product-card">
          <button class="product-visual" type="button" :aria-label="'View ' + card.name" :style="{ '--product-tone': occasions.find(occasion => occasion.id === card.occasion)?.tint }" @click="showCard(card)">
            <CardCover :card="card" />
            <span v-if="card.tag" class="product-tag">{{ card.tag }}</span>
          </button>
          <div class="product-meta">
            <p>{{ occasions.find(occasion => occasion.id === card.occasion)?.label }}</p>
            <h3><button type="button" @click="showCard(card)">{{ card.name }}</button></h3>
            <div class="product-bottom">
              <strong>From {{ priceLabel(cardPrice(card, 'digital')) }}</strong>
              <button class="text-button" type="button" :aria-label="'Customize ' + card.name" @click="showStudio(card)"><Sparkles :size="15" /> Customize</button>
            </div>
          </div>
        </article>
      </div>
    </section>

    <section id="gifts" class="gift-section" aria-labelledby="gifts-title">
      <div class="page-width section-block">
        <p class="eyebrow section-eyebrow">THE GIFT SHOP</p>
        <div class="section-title"><h2 id="gifts-title">A little something <em>extra.</em></h2></div>
        <p class="section-intro">Pick a treat on its own, or pair it with a card you made.</p>
        <div class="gift-grid">
          <article v-for="gift in gifts" :key="gift.id" class="gift-card">
            <button type="button" class="gift-image" :style="{ backgroundColor: gift.tint }" :aria-label="'View ' + gift.name" @click="showGift(gift)">
              <img :src="gift.image" :alt="gift.name" width="512" height="810" loading="lazy">
              <span>{{ gift.type }}</span>
            </button>
            <div class="gift-meta">
              <div><h3><button type="button" @click="showGift(gift)">{{ gift.name }}</button></h3><p>{{ priceLabel(gift.price) }}</p></div>
              <button class="icon-button gift-add" type="button" :aria-label="'Add ' + gift.name + ' to bag'" @click="makeGiftLine(gift, false)"><Plus :size="21" /></button>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="page-width bottom-banner" aria-labelledby="bottom-banner-title">
      <div><Sparkles :size="24" /><h2 id="bottom-banner-title">Got something to say?</h2><p>Start with a card, then make it yours.</p></div>
      <button class="button button-light" type="button" @click="showStudio()">Open Card Studio <ArrowUpRight :size="17" /></button>
    </section>
  </main>

  <footer class="site-footer">
    <div class="page-width footer-inner">
      <div>
        <a class="wordmark" href="#" aria-label="Uthum Pathum home">
          <img v-if="!logoMissing" :src="logoUrl" alt="Uthum Pathum" width="155" height="43">
          <span v-else class="wordmark-backup"><img src="/images/mark.svg" alt="" width="28" height="28">Uthum Pathum</span>
        </a>
        <p>Greeting cards and thoughtful gifts from Sri Lanka.</p>
      </div>
      <nav aria-label="Footer navigation"><a href="#cards">Shop cards</a><a href="#gifts">Shop gifts</a><button type="button" @click="showStudio()">Card Studio</button></nav>
      <div class="footer-contact"><a href="mailto:info@uthumpathum.com"><Mail :size="16" /> info@uthumpathum.com</a><a href="https://maps.app.goo.gl/vHkuV7TiA6jq1nSe8" target="_blank" rel="noopener"><MapPin :size="16" /> Colombo 5 showroom</a></div>
    </div>
    <div class="page-width footer-bottom">© {{ new Date().getFullYear() }} Uthum Pathum</div>
  </footer>

  <CardStudio v-if="mode === 'studio'" :key="activeCard.id" :card="activeCard" @close="closeDialog" @add="addLine" />

  <ShopDialog v-else-if="mode === 'card'" :title="activeCard.name" panel-class="detail-dialog" @close="closeDialog">
    <div class="detail-layout">
      <div class="detail-art" :style="{ backgroundColor: occasions.find(item => item.id === activeCard.occasion)?.tint }"><CardCover :card="activeCard" /></div>
      <div class="detail-fields space-y-4">
        <p>{{ activeCard.caption }}.</p>
        <fieldset class="field-group">
          <legend>Card format</legend>
          <label v-for="format in formats" :key="format.id" class="option-row">
            <input v-model="selectedFormat" type="radio" name="ready-format" :value="format.id" class="h-4 w-4">
            <span><strong>{{ format.name }}</strong><small>{{ format.description }}</small></span>
            <strong>{{ priceLabel(cardPrice(activeCard, format.id)) }}</strong>
          </label>
        </fieldset>
        <button class="button button-primary w-full" type="button" @click="showStudio(activeCard)"><Sparkles :size="17" /> Customize this card</button>
        <div class="flex flex-wrap gap-2">
          <button class="button button-outline grow" type="button" @click="makeCardLine(activeCard, false)">Add to bag</button>
          <button class="button button-outline grow" type="button" @click="makeCardLine(activeCard, true)">Buy now</button>
        </div>
      </div>
    </div>
  </ShopDialog>

  <ShopDialog v-else-if="mode === 'gift'" :title="activeGift.name" panel-class="detail-dialog" @close="closeDialog">
    <div class="detail-layout">
      <div class="detail-art gift-detail"><img :src="activeGift.image" :alt="activeGift.name" width="512" height="810"></div>
      <div class="detail-fields space-y-4">
        <p>{{ activeGift.description }}</p>
        <div class="summary-total"><span>{{ activeGift.type }}</span><strong>{{ priceLabel(activeGift.price) }}</strong></div>
        <button class="button button-primary w-full" type="button" @click="makeGiftLine(activeGift, false)">Add to bag</button>
        <button class="button button-outline w-full" type="button" @click="makeGiftLine(activeGift, true)">Buy now</button>
        <p class="field-help">Choose delivery or showroom pickup at checkout.</p>
      </div>
    </div>
  </ShopDialog>

  <ShopDialog v-else-if="mode === 'search'" title="Find a card or gift" @close="closeDialog">
    <div class="dialog-content">
      <div class="search-input"><Search :size="20" /><input ref="searchBox" v-model="query" class="form-field" type="search" aria-label="Search cards and gifts" placeholder="Search cards, occasions, gifts…"></div>
      <ul v-if="searchItems.length" class="search-results">
        <li v-for="item in searchItems" :key="item.id"><button type="button" @click="item.kind === 'card' ? showCard(item) : showGift(item)"><span><strong>{{ item.name }}</strong><small>{{ item.subtitle }}</small></span><ChevronRight :size="20" /></button></li>
      </ul>
      <p v-else class="empty-message">No matches. Try “birthday”, “cake”, or “flowers”.</p>
    </div>
  </ShopDialog>

  <ShopDialog v-else-if="mode === 'bag'" title="Your gift bag" panel-class="bag-dialog" @close="closeDialog">
    <div class="dialog-content space-y-5">
      <p v-if="bag.storageError.value" class="field-help">This browser may clear your bag when you close the page.</p>
      <div v-if="!bag.lines.value.length" class="empty-state"><ShoppingBag :size="34" /><h3>Your bag is empty.</h3><button class="button button-primary" type="button" @click="closeDialog(); showAllCards()">Find a card</button></div>
      <template v-else>
        <ul class="bag-list">
          <li v-for="line in bag.lines.value" :key="line.id">
            <div class="bag-item-info">
              <span class="bag-item-icon"><component :is="line.kind === 'card' ? Heart : Gift" :size="21" /></span>
              <div><strong>{{ lineName(line) }}</strong><small>{{ lineDetail(line) }}</small><small v-if="line.gifts?.length">With {{ line.gifts.map(id => giftById[id].name).join(', ') }}</small></div>
              <strong>{{ priceLabel(linePrice(line) * line.quantity) }}</strong>
            </div>
            <div class="bag-item-actions">
              <div class="quantity-control">
                <button type="button" :aria-label="'Decrease quantity of ' + lineName(line)" :disabled="line.quantity <= 1" @click="bag.setQuantity(line.id, line.quantity - 1)"><Minus :size="14" /></button>
                <span>{{ line.quantity }}</span>
                <button type="button" :aria-label="'Increase quantity of ' + lineName(line)" :disabled="line.quantity >= 20" @click="bag.setQuantity(line.id, line.quantity + 1)"><Plus :size="14" /></button>
              </div>
              <button class="text-button" type="button" @click="bag.remove(line.id)">Remove</button>
            </div>
          </li>
        </ul>
        <div class="summary-total"><span>Subtotal</span><strong>{{ priceLabel(bag.lines.value.reduce((sum, line) => sum + linePrice(line) * line.quantity, 0)) }}</strong></div>
        <button class="button button-primary w-full" type="button" @click="openCheckout()">Continue to checkout</button>
        <button class="text-button" type="button" @click="closeDialog()">Continue shopping</button>
      </template>
    </div>
  </ShopDialog>

  <ShopDialog v-else-if="mode === 'checkout'" title="Checkout" @close="closeDialog">
    <form class="dialog-content checkout-form space-y-5" @submit.prevent="completeOrder">
      <p class="demo-note">Demo checkout. Use sample details. This preview simulates payment and fulfillment.</p>
      <div v-if="isPhysical" class="space-y-4">
        <fieldset class="field-group">
          <legend>How should they receive it?</legend>
          <label class="option-row"><input v-model="deliveryMethod" name="delivery" type="radio" value="deliver" class="h-4 w-4"><span><strong>Delivery</strong><small>Send it to their address</small></span><Truck :size="20" /></label>
          <label class="option-row"><input v-model="deliveryMethod" name="delivery" type="radio" value="pickup" class="h-4 w-4"><span><strong>Showroom pickup</strong><small>Jawatha, Colombo 5</small></span><Package :size="20" /></label>
        </fieldset>
        <div class="field-group"><label for="recipient">Recipient name</label><input id="recipient" v-model="recipient" class="form-field" placeholder="e.g. Alex" maxlength="80" required></div>
        <template v-if="deliveryMethod === 'deliver'">
          <div class="field-group"><label for="delivery-area">Delivery area</label><select id="delivery-area" v-model="deliveryArea" class="form-field" required><option value="" disabled>Choose an area</option><option value="450">Colombo · Rs. 450</option><option value="650">Greater Colombo · Rs. 650</option><option value="900">Other supported areas · Rs. 900</option></select></div>
          <div class="field-group"><label for="delivery-address">Delivery address</label><textarea id="delivery-address" v-model="deliveryAddress" class="form-field" rows="2" maxlength="160" required /></div>
        </template>
        <div class="field-group"><label for="delivery-date">Preferred {{ deliveryMethod === 'deliver' ? 'delivery' : 'pickup' }} date</label><input id="delivery-date" v-model="deliveryDate" class="form-field" type="date" :min="today" required></div>
      </div>
      <p v-else class="digital-note"><Share2 :size="19" /> Your digital card will be ready to download and share after this step.</p>
      <div class="checkout-totals">
        <p><span>Items</span><strong>{{ priceLabel(checkoutSubtotal) }}</strong></p>
        <p v-if="isPhysical"><span>{{ deliveryMethod === 'deliver' ? 'Delivery estimate' : 'Showroom pickup' }}</span><strong>{{ deliveryMethod === 'deliver' && !deliveryArea ? 'Choose an area' : priceLabel(deliveryFee) }}</strong></p>
        <div class="summary-total"><span>Total</span><strong>{{ priceLabel(checkoutSubtotal + deliveryFee) }}</strong></div>
      </div>
      <button class="button button-primary w-full" type="submit">Complete demo order</button>
    </form>
  </ShopDialog>

  <ShopDialog v-else-if="mode === 'success'" title="Your demo order is ready" @close="closeDialog">
    <div class="dialog-content space-y-5">
      <div class="order-success"><span><Check :size="26" /></span><div><strong>{{ orderReceipt.id }}</strong><p>{{ orderReceipt.method === 'digital' ? 'Your digital card is ready to prepare.' : 'Your ' + (orderReceipt.method === 'pickup' ? 'pickup' : 'delivery') + ' was simulated for ' + orderReceipt.date + '.' }}</p></div></div>
      <div v-for="line in receiptCards" :key="line.id" class="share-item space-y-2">
        <strong>{{ lineName(line) }}</strong>
        <div class="flex flex-wrap gap-2">
          <button class="button button-primary button-small" type="button" :aria-label="'Download PNG of ' + lineName(line)" @click="download(line)"><ArrowDownToLine :size="17" /> Download PNG</button>
          <button class="button button-outline button-small" type="button" :disabled="!shareFiles[line.id]" :aria-label="'Share ' + lineName(line)" @click="share(line)"><Share2 :size="17" /> Share card</button>
        </div>
      </div>
      <p v-if="shareStatus" class="field-help" aria-live="polite">{{ shareStatus }}</p>
      <button class="text-button" type="button" @click="closeDialog()">Back to the shop <ChevronRight :size="16" /></button>
    </div>
  </ShopDialog>

  <Transition><div v-if="toast" class="toast" role="status"><Check :size="18" /> {{ toast }}</div></Transition>
</template>
