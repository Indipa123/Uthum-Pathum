<script setup>
import { X } from 'lucide-vue-next'

const props = defineProps({
  title: { type: String, required: true },
  panelClass: { type: String, default: '' },
})
const emit = defineEmits(['close'])
const modal = ref(null)
const headingId = useId()

onMounted(() => {
  modal.value.showModal()
  document.body.classList.add('has-shop-dialog')
})
onBeforeUnmount(() => {
  modal.value?.close()
  document.body.classList.remove('has-shop-dialog')
})
</script>

<template>
  <dialog
    ref="modal"
    class="shop-dialog"
    :class="props.panelClass"
    :aria-labelledby="headingId"
    @cancel.prevent="emit('close')"
    @click.self="emit('close')"
  >
    <article class="dialog-panel">
      <header class="dialog-header">
        <h2 :id="headingId">{{ title }}</h2>
        <button autofocus class="icon-button" type="button" aria-label="Close dialog" @click="emit('close')"><X :size="22" /></button>
      </header>
      <slot />
    </article>
  </dialog>
</template>
