import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  vite: { plugins: [tailwindcss()] },
  nitro: {
    prerender: { routes: ['/'] },
    publicAssets: [{
      dir: fileURLToPath(new URL('./node_modules/@mediapipe/tasks-vision/wasm', import.meta.url)),
      baseURL: '/vision',
      maxAge: 86400,
    }],
  },
  app: {
    head: {
      htmlAttrs: { lang: 'en-LK' },
      title: 'Uthum Pathum · Cards for the people you love',
      meta: [
        { name: 'description', content: 'Make it personal with a custom greeting card, a thoughtful gift, or both. Designed for celebrating in Sri Lanka.' },
        { name: 'theme-color', content: '#fffaf5' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap' },
        { rel: 'icon', type: 'image/svg+xml', href: '/images/mark.svg' },
      ],
    },
  },
})
