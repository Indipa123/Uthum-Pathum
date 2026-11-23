<script setup>
defineProps({ error: { type: Object, required: true } })
</script>

<template>
  <main class="page-width section-block narrow-page">
    <div class="section-title"><h1>{{ error.statusCode === 404 ? 'Page not found.' : 'Something went wrong.' }}</h1></div>
    <p class="section-intro">{{ error.statusCode === 404 ? 'This address may have changed. You can find our cards and gifts from the home page.' : 'Return to the storefront and try again.' }}</p>
    <button type="button" class="button button-primary page-action" @click="clearError({ redirect: '/' })">Back to Uthum Pathum</button>
  </main>
</template>
