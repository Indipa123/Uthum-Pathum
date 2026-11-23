import { cardById, cardPrice, giftById } from '~/data/catalog'

function database() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('uthum-pathum-studio', 1)
    request.onupgradeneeded = () => request.result.createObjectStore('shop')
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function readBag() {
  const db = await database()
  try {
    return await new Promise((resolve, reject) => {
      const request = db.transaction('shop').objectStore('shop').get('bag')
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  } finally {
    db.close()
  }
}

async function writeBag(lines) {
  const db = await database()
  try {
    await new Promise((resolve, reject) => {
      const transaction = db.transaction('shop', 'readwrite')
      transaction.oncomplete = resolve
      transaction.onerror = () => reject(transaction.error)
      transaction.onabort = () => reject(transaction.error)
      transaction.objectStore('shop').put(lines, 'bag')
    })
  } finally {
    db.close()
  }
}

export function linePrice(line) {
  if (line.kind === 'gift') return giftById[line.productId].price
  return cardPrice(cardById[line.productId], line.format) + line.gifts.reduce((sum, id) => sum + giftById[id].price, 0)
}

export function needsFulfillment(line) {
  return line.kind === 'gift' || line.format === 'print' || line.gifts.length > 0
}

export function useBag() {
  const lines = useState('shop-bag', () => [])
  const loaded = useState('shop-bag-loaded', () => false)
  const storageError = useState('shop-bag-error', () => false)
  const quantity = computed(() => lines.value.reduce((sum, line) => sum + line.quantity, 0))
  let pending = Promise.resolve()
  let loading

  function load() {
    loading ||= readBag().then(saved => {
      if (Array.isArray(saved)) lines.value = saved
    }).catch(() => {
      storageError.value = true
    }).finally(() => {
      loaded.value = true
    })
    return loading
  }

  onMounted(load)

  watch(lines, value => {
    if (!loaded.value) return
    const snapshot = JSON.parse(JSON.stringify(value))
    pending = pending.then(() => writeBag(snapshot)).catch(() => { storageError.value = true })
  }, { deep: true, flush: 'sync' })

  function add(line) {
    const existing = line.kind === 'gift' && lines.value.find(item => item.kind === 'gift' && item.productId === line.productId)
    if (existing) existing.quantity = Math.min(20, existing.quantity + 1)
    else lines.value.push(line)
    return pending
  }

  function setQuantity(id, value) {
    const line = lines.value.find(item => item.id === id)
    if (line && value > 0) line.quantity = Math.min(20, value)
    else remove(id)
  }

  function remove(id) {
    return removeLines([id])
  }

  function removeLines(ids) {
    lines.value = lines.value.filter(item => !ids.includes(item.id))
    return pending
  }

  return { lines, quantity, loaded, storageError, load, add, setQuantity, remove, removeLines }
}
