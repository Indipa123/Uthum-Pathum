<script setup>
import { ChevronLeft, ChevronRight, Gift, ImagePlus, Sparkles, Sticker, Type, X } from 'lucide-vue-next'
import { cardPrice, fonts, formats, gifts, newDesign, priceLabel, stickerChoices, themes } from '~/data/catalog'
import { cardWidth, cardHeight, clamp, preparePhoto, readImage, renderFace } from '~/utils/card-art'
import { suggestCrop } from '~/utils/smart-crop'

const props = defineProps({ card: { type: Object, required: true } })
const emit = defineEmits(['add'])
const design = reactive(newDesign(props.card))
const canvas = ref(null)
const photoInput = ref(null)
const side = ref('front')
const step = ref(1)
const format = ref('print')
const addOns = ref([])
const status = ref('')
const photoBusy = ref(false)
const aiBusy = ref(false)
const image = shallowRef(null)
let photoToken = 0
let drag = null

const total = computed(() => cardPrice(props.card, format.value) + gifts.filter(gift => addOns.value.includes(gift.id)).reduce((sum, gift) => sum + gift.price, 0))

watchEffect(() => {
  if (!canvas.value) return
  renderFace(canvas.value, {
    ...design,
    stickers: [...design.stickers],
  }, side.value, image.value)
}, { flush: 'post' })

function toggleSticker(id) {
  if (design.stickers.includes(id)) design.stickers = design.stickers.filter(sticker => sticker !== id)
  else design.stickers = [...design.stickers, id]
  side.value = 'front'
}

async function usePhoto(file) {
  if (!file) return
  const token = ++photoToken
  photoBusy.value = true
  status.value = ''
  try {
    const src = await preparePhoto(file)
    const preview = await readImage(src)
    if (token !== photoToken) return
    Object.assign(design, { photo: src, photoX: 50, photoY: 50, zoom: 1 })
    image.value = preview
    side.value = 'front'
    status.value = 'Photo added. Drag the preview or use AI Smart Crop.'
  } catch (error) {
    if (token === photoToken) status.value = error.message
  } finally {
    if (token === photoToken) photoBusy.value = false
  }
}

function removePhoto() {
  photoToken++
  Object.assign(design, { photo: '', photoX: 50, photoY: 50, zoom: 1 })
  image.value = null
  status.value = 'Photo removed.'
  photoBusy.value = false
}

async function smartCrop() {
  if (!design.photo || aiBusy.value) return
  const token = photoToken
  aiBusy.value = true
  status.value = 'Looking for faces…'
  try {
    const suggestion = await suggestCrop(design.photo)
    if (token !== photoToken) return
    if (suggestion) Object.assign(design, suggestion)
    else Object.assign(design, { photoX: 50, photoY: 50, zoom: 1 })
    status.value = suggestion ? 'Photo framed around the detected faces.' : 'No face found. The photo was centered and you can reposition it.'
  } catch {
    if (token === photoToken) status.value = 'AI Smart Crop could not load. Drag the photo or adjust the sliders to position it.'
  } finally {
    aiBusy.value = false
  }
}

function startDrag(event) {
  if (!design.photo || side.value !== 'front' || event.button !== 0) return
  event.currentTarget.setPointerCapture(event.pointerId)
  drag = { id: event.pointerId, x: event.clientX, y: event.clientY, photoX: design.photoX, photoY: design.photoY }
}

function moveDrag(event) {
  if (drag?.id !== event.pointerId) return
  const bounds = event.currentTarget.getBoundingClientRect()
  design.photoX = clamp(drag.photoX - (event.clientX - drag.x) * 130 / bounds.width, 0, 100)
  design.photoY = clamp(drag.photoY - (event.clientY - drag.y) * 130 / bounds.height, 0, 100)
}

function addToOrder(buyNow) {
  emit('add', {
    id: crypto.randomUUID(),
    kind: 'card',
    productId: props.card.id,
    format: format.value,
    design: JSON.parse(JSON.stringify(design)),
    gifts: [...addOns.value],
    quantity: 1,
  }, buyNow)
}
</script>

<template>
  <div class="studio-grid">
    <div class="studio-preview">
      <div class="preview-toggle" aria-label="Preview card side">
        <button v-for="face in ['front', 'inside']" :key="face" type="button" :aria-pressed="side === face" @click="side = face">{{ face === 'front' ? 'Front' : 'Inside' }}</button>
      </div>
      <canvas
        ref="canvas" :width="cardWidth" :height="cardHeight"
        :class="{ 'can-drag': design.photo && side === 'front' }"
        :aria-label="side === 'front' ? 'Live front cover preview' : 'Live inside message preview'"
        @pointerdown="startDrag" @pointermove="moveDrag" @pointerup="drag = null"
        @pointercancel="drag = null" @lostpointercapture="drag = null"
        @dragover.prevent @drop.prevent="usePhoto($event.dataTransfer.files[0])"
      />
      <p>{{ card.name }}</p>
    </div>

    <div class="studio-controls">
      <nav class="studio-steps" aria-label="Customize card steps">
        <button type="button" :aria-current="step === 1 ? 'step' : undefined" @click="step = 1"><Type :size="16" /> Customize</button>
        <button type="button" :aria-current="step === 2 ? 'step' : undefined" @click="step = 2"><Gift :size="16" /> Format & gifts</button>
      </nav>
      <div v-if="step === 1" class="studio-fields space-y-4">
        <div class="field-group">
          <label for="card-title">Cover text</label>
          <textarea id="card-title" v-model="design.headline" class="form-field" rows="2" maxlength="70" @focus="side = 'front'" />
        </div>
        <div class="field-group">
          <label for="card-caption">Cover caption</label>
          <input id="card-caption" v-model="design.caption" class="form-field" maxlength="75" @focus="side = 'front'">
        </div>
        <div class="field-group">
          <label for="card-message">Inside message</label>
          <textarea id="card-message" v-model="design.message" class="form-field" rows="3" maxlength="380" placeholder="Write a little something for them…" @focus="side = 'inside'" />
        </div>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="field-group">
            <label for="card-font">Font</label>
            <select id="card-font" v-model="design.font" class="form-field">
              <option v-for="font in fonts" :key="font.id" :value="font.id">{{ font.name }}</option>
            </select>
          </div>
          <div class="field-group">
            <label for="card-layout">Design</label>
            <select id="card-layout" v-model="design.layout" class="form-field" @change="side = 'front'">
              <option value="party">Confetti</option><option value="hearts">Hearts</option>
              <option value="waves">Waves</option><option value="stars">Stars</option>
              <option value="flowers">Flowers</option><option value="photo">Photo frame</option>
            </select>
          </div>
        </div>
        <fieldset class="field-group">
          <legend>Color theme</legend>
          <div class="swatch-row">
            <button v-for="theme in themes" :key="theme.id" type="button" :title="theme.name" :aria-label="theme.name" :aria-pressed="design.theme === theme.id" :style="{ '--swatch': theme.paper }" @click="design.theme = theme.id"></button>
          </div>
        </fieldset>
        <fieldset class="field-group">
          <legend class="flex items-center gap-2"><Sticker :size="16" /> Stickers</legend>
          <div class="sticker-row">
            <button v-for="sticker in stickerChoices" :key="sticker.id" type="button" :aria-label="sticker.label" :title="sticker.label" :aria-pressed="design.stickers.includes(sticker.id)" @click="toggleSticker(sticker.id)">{{ sticker.symbol }}</button>
          </div>
        </fieldset>
        <div class="photo-box">
          <div class="flex flex-wrap items-center gap-2">
            <button class="button button-outline button-small" type="button" :disabled="photoBusy" @click="photoInput.click()"><ImagePlus :size="16" /> {{ design.photo ? 'Replace photo' : 'Add photo' }}</button>
            <button v-if="design.photo" class="button button-outline button-small" type="button" :disabled="aiBusy" @click="smartCrop"><Sparkles :size="16" /> {{ aiBusy ? 'Framing…' : 'AI Smart Crop' }}</button>
            <button v-if="design.photo" class="icon-button" type="button" aria-label="Remove photo" @click="removePhoto"><X :size="18" /></button>
            <input ref="photoInput" class="sr-only" type="file" accept="image/jpeg,image/png,image/webp" aria-label="Upload a card photo" @change="usePhoto($event.target.files[0]); $event.target.value = ''">
          </div>
          <p class="field-help" aria-live="polite">{{ status || 'JPG, PNG, or WebP up to 15 MB. Photos stay in this browser.' }}</p>
          <div v-if="design.photo" class="photo-sliders">
            <label>Horizontal <input v-model.number="design.photoX" type="range" min="0" max="100" aria-label="Photo horizontal position"></label>
            <label>Vertical <input v-model.number="design.photoY" type="range" min="0" max="100" aria-label="Photo vertical position"></label>
            <label>Zoom <input v-model.number="design.zoom" type="range" min="1" max="2.7" step=".01" aria-label="Photo zoom"></label>
          </div>
        </div>
        <button class="button button-primary w-full" type="button" @click="step = 2">Choose format & gifts <ChevronRight :size="17" /></button>
      </div>

      <div v-else class="studio-fields space-y-4">
        <fieldset class="field-group">
          <legend>Choose a format</legend>
          <label v-for="item in formats" :key="item.id" class="option-row">
            <input v-model="format" name="studio-format" type="radio" :value="item.id" class="h-4 w-4">
            <span><strong>{{ item.name }}</strong><small>{{ item.description }}</small></span>
            <strong>{{ priceLabel(cardPrice(card, item.id)) }}</strong>
          </label>
        </fieldset>
        <fieldset class="field-group">
          <legend>Add a gift <small>Optional</small></legend>
          <label v-for="gift in gifts" :key="gift.id" class="option-row">
            <input v-model="addOns" type="checkbox" :value="gift.id" class="h-4 w-4">
            <img :src="gift.image" alt="" width="44" height="44">
            <span><strong>{{ gift.name }}</strong><small>{{ gift.type }}</small></span>
            <strong>{{ priceLabel(gift.price) }}</strong>
          </label>
        </fieldset>
        <p v-if="addOns.length" class="field-help">Gifts require delivery or pickup, even when the card is digital.</p>
        <div class="summary-total"><span>Bundle total</span><strong>{{ priceLabel(total) }}</strong></div>
        <div class="flex flex-wrap gap-2">
          <button class="button button-outline grow" type="button" @click="addToOrder(false)">Add to bag</button>
          <button class="button button-primary grow" type="button" @click="addToOrder(true)">Buy now</button>
        </div>
        <button class="text-button" type="button" @click="step = 1"><ChevronLeft :size="17" /> Back to customize</button>
      </div>
    </div>
  </div>
</template>
