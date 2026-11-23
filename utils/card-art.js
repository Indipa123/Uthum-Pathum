import { fontById, stickerById, themeById } from '~/data/catalog'

export const cardWidth = 600
export const cardHeight = 820

const W = cardWidth
const H = cardHeight

export const clamp = (n, min, max) => Math.min(max, Math.max(min, n))

export function readImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('This image could not be opened. Try a JPG, PNG, or WebP.'))
    image.src = src
  })
}

export async function preparePhoto(file) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 15 * 1024 ** 2) {
    throw new Error('Choose a JPG, PNG, or WebP under 15 MB.')
  }
  const src = URL.createObjectURL(file)
  try {
    const image = await readImage(src)
    const scale = Math.min(1, 1600 / Math.max(image.width, image.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(image.width * scale))
    canvas.height = Math.max(1, Math.round(image.height * scale))
    const context = canvas.getContext('2d')
    context.fillStyle = '#fffaf5'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', 0.88)
  } finally {
    URL.revokeObjectURL(src)
  }
}

function wrapText(ctx, text, maxWidth) {
  return text.split('\n').flatMap(line => {
    const tokens = line.split(/\s+/)
    const rows = []
    let row = ''
    for (const token of tokens) {
      const candidate = row ? row + ' ' + token : token
      if (row && ctx.measureText(candidate).width > maxWidth) {
        rows.push(row)
        row = token
      } else {
        row = candidate
      }
    }
    return [...rows, row]
  })
}

function textBlock(ctx, text, options) {
  const { y, size, family, width = 490, maxLines = 5, height = 200, italic = false } = options
  let fontSize = size
  let lines
  do {
    ctx.font = (italic ? 'italic ' : '') + fontSize + 'px ' + family
    lines = wrapText(ctx, text.trim(), width)
    if (lines.length <= maxLines && lines.length * fontSize * 1.13 <= height) break
    fontSize -= 2
  } while (fontSize > 13)
  const spacing = fontSize * 1.13
  lines.forEach((line, index) => {
    ctx.fillText(line, W / 2, y + (index - (lines.length - 1) / 2) * spacing, width)
  })
}

function star(ctx, x, y, r) {
  ctx.beginPath()
  for (let i = 0; i < 8; i++) {
    const angle = i * Math.PI / 4
    const radius = i % 2 ? r * 0.28 : r
    const px = x + Math.cos(angle) * radius
    const py = y + Math.sin(angle) * radius
    if (!i) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.fill()
}

function decorate(ctx, design, theme, hasPhoto) {
  ctx.strokeStyle = theme.accent
  ctx.lineWidth = 2
  ctx.globalAlpha = 0.72
  ctx.strokeRect(28, 28, W - 56, H - 56)
  ctx.fillStyle = theme.accent
  const points = [[82, 146, 23], [501, 110, 28], [86, 660, 32], [517, 670, 29], [480, 722, 15], [115, 100, 12]]
  if (design.layout === 'waves' && !hasPhoto) {
    for (const x of [85, W - 85]) {
      ctx.beginPath()
      ctx.lineWidth = 8
      for (let y = 74; y < H - 70; y += 5) {
        const px = x + Math.sin(y / 38) * 21
        if (y === 74) ctx.moveTo(px, y)
        else ctx.lineTo(px, y)
      }
      ctx.stroke()
    }
  } else if (['flowers', 'hearts'].includes(design.layout) && !hasPhoto) {
    ctx.font = '45px Georgia, serif'
    for (const [x, y, r] of points) {
      ctx.font = (r * 1.7) + 'px Georgia, serif'
      ctx.fillText(design.layout === 'hearts' ? '♥' : '✿', x, y)
    }
  } else {
    for (const [x, y, r] of points) star(ctx, x, y, r)
  }
  ctx.globalAlpha = 1
}

function drawPhoto(ctx, image, design) {
  const frame = { x: 89, y: 229, w: 422, h: 380 }
  const scale = Math.max(frame.w / image.width, frame.h / image.height) * design.zoom
  const w = image.width * scale
  const h = image.height * scale
  const x = frame.x + clamp(frame.w / 2 - w * design.photoX / 100, frame.w - w, 0)
  const y = frame.y + clamp(frame.h / 2 - h * design.photoY / 100, frame.h - h, 0)
  ctx.fillStyle = '#fffaf4'
  ctx.fillRect(frame.x - 10, frame.y - 10, frame.w + 20, frame.h + 26)
  ctx.save()
  ctx.beginPath()
  ctx.rect(frame.x, frame.y, frame.w, frame.h)
  ctx.clip()
  ctx.drawImage(image, x, y, w, h)
  ctx.restore()
}

export function renderFace(canvas, design, side = 'front', photo = null) {
  const theme = themeById[design.theme]
  const family = fontById[design.font].family
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = side === 'inside' ? '#fffaf2' : theme.paper
  ctx.fillRect(0, 0, W, H)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  if (side === 'inside') {
    ctx.fillStyle = theme.accent
    star(ctx, W / 2, 147, 25)
    ctx.fillStyle = side === 'inside' && design.theme === 'wine' ? '#812139' : theme.ink
    textBlock(ctx, design.message || 'With love.', { y: H / 2, size: 38, family, width: 475, maxLines: 13, height: 525 })
    return
  }

  decorate(ctx, design, theme, Boolean(photo))
  if (photo) drawPhoto(ctx, photo, design)
  ctx.fillStyle = theme.ink
  textBlock(ctx, design.headline || 'Made for you', { y: photo ? 142 : 382, size: photo ? 57 : 113, family, width: 445, height: photo ? 132 : 300, maxLines: 4, italic: design.font === 'serif' })
  ctx.font = '21px Arial, sans-serif'
  ctx.fillText(design.caption, W / 2, photo ? 694 : 576, 453)
  const slots = [[106, 205], [491, 207], [118, 697], [483, 698], [300, 89], [300, 751]]
  for (const [index, stickerId] of design.stickers.entries()) {
    ctx.font = '44px Arial, sans-serif'
    ctx.fillStyle = theme.ink
    ctx.fillText(stickerById[stickerId].symbol, ...slots[index])
  }
}

export async function exportCard(design, name) {
  const cover = document.createElement('canvas')
  cover.width = W
  cover.height = H
  const image = design.photo ? await readImage(design.photo) : null
  renderFace(cover, design, 'front', image)
  const final = document.createElement('canvas')
  final.width = W
  final.height = design.message.trim() ? H * 2 + 28 : H
  const ctx = final.getContext('2d')
  ctx.fillStyle = '#fffaf5'
  ctx.fillRect(0, 0, final.width, final.height)
  ctx.drawImage(cover, 0, 0)
  if (design.message.trim()) {
    renderFace(cover, design, 'inside')
    ctx.drawImage(cover, 0, H + 28)
  }
  const blob = await new Promise(resolve => final.toBlob(resolve, 'image/png'))
  if (!blob) throw new Error('The card could not be exported.')
  const filename = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return new File([blob], (filename || 'uthum-pathum-card') + '.png', { type: 'image/png' })
}
