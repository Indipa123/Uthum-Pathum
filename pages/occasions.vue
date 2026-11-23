<script setup>
useSeoMeta({ title: 'Shop by Occasion · Uthum Pathum', description: 'Find a greeting card for birthdays, anniversaries, celebrations and the little moments in between.' })
</script>

<template>
  <section class="page-width section-block">
    <div class="section-title"><h1>Shop by <em>occasion.</em></h1></div>
    <p class="section-intro">Find the right card for the moment you’re celebrating.</p>
    <OccasionTiles />
    <NuxtLink to="/cards" class="button button-outline page-action">Browse all cards</NuxtLink>
  </section>
</template>
