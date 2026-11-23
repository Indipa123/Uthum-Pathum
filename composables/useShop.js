import { cardById, formats, giftById } from '~/data/catalog'
import { useBag } from './useBag'

const shopKey = Symbol('shop')

export function lineName(line) {
  return line.kind === 'card' ? cardById[line.productId].name : giftById[line.productId].name
}

export function lineDetail(line) {
  return line.kind === 'gift' ? giftById[line.productId].type : formats.find(format => format.id === line.format)?.name
}

export function provideShop() {
  const bag = useBag()
  const router = useRouter()
  const directLine = shallowRef(null)
  const receipt = shallowRef(null)
  const sessionReady = ref(false)
  const notice = ref('')
  const directKey = 'uthum-pathum:buy-now'
  const receiptKey = 'uthum-pathum:receipt'
  let noticeTimer

  onMounted(() => {
    try {
      directLine.value = JSON.parse(sessionStorage.getItem(directKey))
      receipt.value = JSON.parse(sessionStorage.getItem(receiptKey))
    } catch {
      // Private browsing or disabled storage can limit checkout to this page session.
    } finally {
      sessionReady.value = true
    }
  })

  function saveSession(key, value) {
    try {
      if (value === null) sessionStorage.removeItem(key)
      else sessionStorage.setItem(key, JSON.stringify(value))
    } catch {
      // The current receipt and buy-now selection are also held in memory.
    }
  }

  async function addToBag(line, buyNow = false) {
    if (buyNow) {
      directLine.value = line
      saveSession(directKey, line)
      return router.push({ path: '/checkout', query: { mode: 'buy-now' } })
    }
    await bag.load()
    await bag.add(line)
    clearTimeout(noticeTimer)
    notice.value = lineName(line) + ' added to your bag.'
    noticeTimer = setTimeout(() => { notice.value = '' }, 2800)
    return router.push('/bag')
  }

  async function recordOrder(order, buyNow) {
    receipt.value = order
    saveSession(receiptKey, order)
    if (buyNow) {
      directLine.value = null
      saveSession(directKey, null)
    } else {
      await bag.removeLines(order.lines.map(line => line.id))
    }
    return router.replace('/order')
  }

  onBeforeUnmount(() => clearTimeout(noticeTimer))

  const shop = { bag, directLine, receipt, sessionReady, notice, addToBag, recordOrder }
  provide(shopKey, shop)
  return shop
}

export function useShop() {
  return inject(shopKey)
}
