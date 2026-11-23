<script setup>
import { themeById } from '~/data/catalog'

const props = defineProps({ card: { type: Object, required: true } })
const theme = computed(() => themeById[props.card.theme])
const symbol = computed(() => ({ hearts: '♥', flowers: '✿', waves: '∿', party: '✧' })[props.card.layout] || '✦')
</script>

<template>
  <div
    class="card-cover"
    :class="'layout-' + card.layout"
    :style="{ '--cover-paper': theme.paper, '--cover-ink': theme.ink, '--cover-accent': theme.accent }"
    aria-hidden="true"
  >
    <div class="cover-frame">
      <span class="cover-shape shape-one">{{ symbol }}</span>
      <span class="cover-shape shape-two">{{ symbol }}</span>
      <span class="cover-shape shape-three">{{ symbol }}</span>
      <span class="cover-shape shape-four">{{ symbol }}</span>
      <span class="cover-headline">{{ card.headline }}</span>
      <span class="cover-caption">{{ card.caption }}</span>
    </div>
  </div>
</template>
