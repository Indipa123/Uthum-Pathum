export const occasions = [
  { id: 'birthday', label: 'Birthday', icon: 'CakeSlice', tint: '#f9e5e7', ink: '#a9334a' },
  { id: 'love', label: 'Love & Romance', icon: 'Heart', tint: '#f3dfe7', ink: '#982e5d' },
  { id: 'occasion', label: 'Special Occasions', icon: 'PartyPopper', tint: '#f9edda', ink: '#a25b34' },
  { id: 'naughty', label: 'Naughty & Funny', icon: 'Smile', tint: '#eee6f3', ink: '#714b88' },
  { id: 'thanks', label: 'Thank You', icon: 'Sparkles', tint: '#eaf0e4', ink: '#4e6c56' },
  { id: 'thinking', label: 'Thinking of You', icon: 'Flower2', tint: '#f6e7dd', ink: '#a25e4e' },
]

export const themes = [
  { id: 'rose', name: 'Rose', paper: '#f9dde4', ink: '#812139', accent: '#e56f86' },
  { id: 'wine', name: 'Wine', paper: '#8e233d', ink: '#fff2de', accent: '#f5a1b3' },
  { id: 'lilac', name: 'Lilac', paper: '#ecdff3', ink: '#563569', accent: '#aa73bc' },
  { id: 'citrus', name: 'Citrus', paper: '#f7e5b3', ink: '#77351f', accent: '#d57247' },
  { id: 'sage', name: 'Sage', paper: '#dae9d9', ink: '#2f5745', accent: '#678b70' },
  { id: 'cream', name: 'Cream', paper: '#fbebd7', ink: '#8d3e37', accent: '#d78064' },
]

export const fonts = [
  { id: 'serif', name: 'Editorial', family: 'Georgia, serif' },
  { id: 'sans', name: 'Modern', family: 'Arial, sans-serif' },
  { id: 'classic', name: 'Classic', family: 'Palatino, Georgia, serif' },
  { id: 'mono', name: 'Typewriter', family: '"Courier New", monospace' },
]

export const cards = [
  { id: 'birthday-wish', name: 'Another trip around the sun', headline: 'happy\nbirthday!', caption: 'A little brighter with you in it', occasion: 'birthday', theme: 'rose', layout: 'party', price: 650, tag: 'Bestseller' },
  { id: 'love-always', name: 'Love, always', headline: 'love,\nalways.', caption: 'In all the little ways', occasion: 'love', theme: 'wine', layout: 'hearts', price: 690, tag: 'Personalizable' },
  { id: 'wild-about-you', name: 'Wild about you', headline: 'wild\nabout you', caption: 'A little unhinged, honestly', occasion: 'naughty', theme: 'lilac', layout: 'waves', price: 650, tag: 'New' },
  { id: 'big-moment', name: 'To the big moment', headline: 'you did it!', caption: 'Here’s to what comes next', occasion: 'occasion', theme: 'citrus', layout: 'stars', price: 650 },
  { id: 'a-little-thanks', name: 'A little thanks', headline: 'thank\nyou.', caption: 'More than you know', occasion: 'thanks', theme: 'sage', layout: 'flowers', price: 590 },
  { id: 'little-note', name: 'Just a little note', headline: 'thinking\nof you', caption: 'Sending some good your way', occasion: 'thinking', theme: 'cream', layout: 'flowers', price: 590 },
  { id: 'birthday-dream', name: 'Make a wish', headline: 'make\na wish', caption: 'This one is all yours', occasion: 'birthday', theme: 'citrus', layout: 'stars', price: 650 },
  { id: 'our-story', name: 'Our little story', headline: 'us,\nalways.', caption: 'Here’s to all our little moments', occasion: 'love', theme: 'rose', layout: 'photo', price: 690 },
  { id: 'no-filter', name: 'No filter needed', headline: 'still got\nit.', caption: 'Mostly. Probably.', occasion: 'naughty', theme: 'sage', layout: 'waves', price: 650 },
  { id: 'new-beginnings', name: 'New beginnings', headline: 'hello,\nnew chapter', caption: 'Good things are coming', occasion: 'occasion', theme: 'lilac', layout: 'party', price: 650 },
  { id: 'thanks-a-bunch', name: 'Thanks a bunch', headline: 'thanks\na bunch!', caption: 'For being the way you are', occasion: 'thanks', theme: 'rose', layout: 'flowers', price: 590 },
  { id: 'across-miles', name: 'Across the miles', headline: 'miss you\nloads', caption: 'Sooner than you think', occasion: 'thinking', theme: 'lilac', layout: 'hearts', price: 590 },
]

export const gifts = [
  { id: 'chocolate-box', name: 'The chocolate box', type: 'Chocolates', description: 'A box of assorted chocolate truffles.', price: 2400, image: '/images/chocolates.webp', tint: '#edc7b9', icon: 'Cookie' },
  { id: 'ribbon-cake', name: 'Pink ribbon cake', type: 'Cake', description: 'Soft vanilla sponge with pink buttercream.', price: 4200, image: '/images/cake.webp', tint: '#f3ced6', icon: 'CakeSlice' },
  { id: 'rose-bouquet', name: 'Rosy little bouquet', type: 'Flowers', description: 'Pink roses and seasonal fresh stems.', price: 3600, image: '/images/flowers.webp', tint: '#e8d5ce', icon: 'Flower2' },
]

export const formats = [
  { id: 'print', name: 'Printed + digital', description: 'A printed card and a shareable PNG' },
  { id: 'digital', name: 'Digital only', description: 'Download and share after checkout' },
]

export const stickerChoices = [
  { id: 'heart', label: 'Heart', symbol: '♥' },
  { id: 'star', label: 'Star', symbol: '✦' },
  { id: 'flower', label: 'Flower', symbol: '✿' },
  { id: 'smile', label: 'Smile', symbol: '☺' },
  { id: 'sparkle', label: 'Sparkles', symbol: '✧' },
  { id: 'ribbon', label: 'Bow', symbol: '🎀' },
]

export const cardById = Object.fromEntries(cards.map(card => [card.id, card]))
export const giftById = Object.fromEntries(gifts.map(gift => [gift.id, gift]))
export const occasionById = Object.fromEntries(occasions.map(occasion => [occasion.id, occasion]))
export const themeById = Object.fromEntries(themes.map(theme => [theme.id, theme]))
export const fontById = Object.fromEntries(fonts.map(font => [font.id, font]))
export const stickerById = Object.fromEntries(stickerChoices.map(sticker => [sticker.id, sticker]))

export const priceLabel = value => 'Rs. ' + new Intl.NumberFormat('en-LK').format(value)
export const cardPrice = (card, format) => format === 'digital' ? 390 : card.price

export function newDesign(card) {
  return {
    headline: card.headline,
    caption: card.caption,
    message: '',
    theme: card.theme,
    font: 'serif',
    layout: card.layout,
    stickers: [],
    photo: '',
    photoX: 50,
    photoY: 50,
    zoom: 1,
  }
}
