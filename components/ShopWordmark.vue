<script setup>
const missing = ref(false)
</script>

<template>
  <img v-if="!missing" src="https://uthumpathum.com/wp-content/uploads/logo-white.png" alt="" width="157" height="43" @error="missing = true">
  <span v-else class="wordmark-backup"><img src="/images/mark.svg" alt="" width="28" height="28">Uthum Pathum</span>
</template>
