# Uthum Pathum

A Nuxt storefront demo for greeting cards, a card editor, and gift bundles. The storefront includes a Three.js hero, Tailwind CSS, and Flowbite form styling.

```sh
npm ci
npm run dev
```

Run `npm run generate` for a static build at `.output/public`.

Checkout uses sample prices and delivery options. Payments and fulfillment are simulated. Card images, cart data, and digital exports are handled in the browser. Smart Crop uses MediaPipe Face Detector. The browser loads the model from Google's public model repository and runs face detection locally. Shoppers can position photos manually if the model is unavailable.
