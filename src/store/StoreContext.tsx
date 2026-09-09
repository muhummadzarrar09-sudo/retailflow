import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { priceOf, products, type Category, type Product } from '../data/products'

/* ── Client-side hash routing — one URL per storefront view ────────
   #/shop                    → Home (campaign storefront)
   #/shop/new                → New Arrivals
   #/shop/all                → Shop All
   #/shop/sale               → The Sale
   #/shop/clothing|accessories|footwear|stationery|cosmetics|gifts
                             → category collection pages
   Plain anchor hashes (e.g. #policies) and #product-<slug> deep links
   are NOT routes — they never flip the active view. */

export type ShopView = 'home' | 'new' | 'sale' | 'all' | Category

export const CATEGORIES: Category[] = [
  'Clothing',
  'Accessories',
  'Footwear',
  'Stationery',
  'Cosmetics',
  'Gifts',
]

const SLUG_VIEW: Record<string, ShopView> = {
  new: 'new',
  sale: 'sale',
  all: 'all',
  clothing: 'Clothing',
  accessories: 'Accessories',
  footwear: 'Footwear',
  stationery: 'Stationery',
  cosmetics: 'Cosmetics',
  gifts: 'Gifts',
}

export const VIEW_PATH: Record<ShopView, string> = {
  home: '#/shop',
  new: '#/shop/new',
  sale: '#/shop/sale',
  all: '#/shop/all',
  Clothing: '#/shop/clothing',
  Accessories: '#/shop/accessories',
  Footwear: '#/shop/footwear',
  Stationery: '#/shop/stationery',
  Cosmetics: '#/shop/cosmetics',
  Gifts: '#/shop/gifts',
}

export const VIEW_LABEL: Record<ShopView, string> = {
  home: 'Home',
  new: 'New Arrivals',
  sale: 'The Sale',
  all: 'Shop All',
  Clothing: 'Clothing',
  Accessories: 'Accessories',
  Footwear: 'Footwear',
  Stationery: 'Stationery',
  Cosmetics: 'Cosmetics',
  Gifts: 'Gifts',
}

/* the active view lives purely in the hash — unknown/empty hashes fall back
   to the storefront home so nothing ever 404s */
const viewFromHash = (): ShopView => {
  const h = window.location.hash
  if (h.startsWith('#/shop') || h === '#/') {
    const seg = h.replace(/^#\//, '').split('/')[1]?.toLowerCase() ?? ''
    return SLUG_VIEW[seg] ?? 'home'
  }
  return 'home'
}

export interface CartLine {
  productId: string
  size?: string
  color?: string
  qty: number
}

export const keyOf = (l: CartLine) => `${l.productId}::${l.size ?? ''}::${l.color ?? ''}`

export interface ResolvedLine extends CartLine {
  key: string
  product: Product
  unit: number
}

interface StoreValue {
  lines: CartLine[]
  resolved: ResolvedLine[]
  count: number
  total: number
  add: (line: CartLine) => void
  remove: (key: string) => void
  setQty: (key: string, qty: number) => void
  clear: () => void
  cartOpen: boolean
  setCartOpen: (open: boolean) => void
  active: Product | null
  openProduct: (p: Product) => void
  closeProduct: () => void
  view: ShopView
  goShop: (view?: ShopView, anchor?: string) => void
  scrollToAnchor: (id: string, smooth?: boolean) => void
  consumePendingAnchor: () => string | null
  queueSearchFocus: () => void
  consumeSearchFocus: () => boolean
  searchTick: number
}

const StoreCtx = createContext<StoreValue | null>(null)

const STORAGE_KEY = 'retailflow-inquiry-v1'

const loadLines = (): CartLine[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CartLine[]
    if (!Array.isArray(parsed)) return []
    // only restore lines that still match a seeded product
    return parsed.filter((l) => products.some((p) => p.id === l.productId) && l.qty > 0)
  } catch {
    return []
  }
}

const scrollTop = (smooth: boolean) => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top: 0, behavior: smooth && !reduced ? 'smooth' : 'auto' })
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(loadLines)
  const [cartOpen, setCartOpen] = useState(false)
  const [active, setActive] = useState<Product | null>(null)
  const [view, setView] = useState<ShopView>(() => viewFromHash())
  const pendingAnchor = useRef<string | null>(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
    } catch {
      /* storage unavailable — session-only cart */
    }
  }, [lines])

  /* back/forward buttons + direct hash edits drive the active view */
  useEffect(() => {
    const onHash = () => {
      const v = viewFromHash()
      setView((prev) => (prev === v ? prev : v))
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const add = useCallback((line: CartLine) => {
    setLines((prev) => {
      const key = keyOf(line)
      const idx = prev.findIndex((l) => keyOf(l) === key)
      if (idx === -1) return [...prev, line]
      const next = [...prev]
      next[idx] = { ...next[idx], qty: Math.min(99, next[idx].qty + line.qty) }
      return next
    })
  }, [])

  const remove = useCallback((key: string) => {
    setLines((prev) => prev.filter((l) => keyOf(l) !== key))
  }, [])

  const setQty = useCallback((key: string, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => keyOf(l) !== key)
        : prev.map((l) => (keyOf(l) === key ? { ...l, qty: Math.min(99, qty) } : l)),
    )
  }, [])

  const clear = useCallback(() => setLines([]), [])

  const openProduct = useCallback((p: Product) => setActive(p), [])
  const closeProduct = useCallback(() => setActive(null), [])

  const scrollToAnchor = useCallback((id: string, smooth = true) => {
    const el = document.getElementById(id)
    if (!el) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ behavior: smooth && !reduced ? 'smooth' : 'auto', block: 'start' })
  }, [])

  const navigate = useCallback((target: ShopView) => {
    setView((prev) => (prev === target ? prev : target))
    const hash = VIEW_PATH[target]
    if (window.location.hash !== hash) window.location.hash = hash
  }, [])

  /* go to a storefront page — home, a collection, or a category rack —
     optionally landing on a specific section of that page */
  const goShop = useCallback(
    (target: ShopView = 'home', anchor?: string) => {
      if (view === target) {
        if (anchor) scrollToAnchor(anchor)
        else scrollTop(true)
        return
      }
      pendingAnchor.current = anchor ?? null
      navigate(target)
    },
    [view, navigate, scrollToAnchor],
  )

  const consumePendingAnchor = useCallback(() => {
    const a = pendingAnchor.current
    pendingAnchor.current = null
    return a
  }, [])

  /* nav search icon → lands on Shop All with the cursor already in the
     field, even when re-triggered on the same page (the tick forces the
     consumer effect to re-run) */
  const searchFlag = useRef(false)
  const [searchTick, setSearchTick] = useState(0)
  const queueSearchFocus = useCallback(() => {
    searchFlag.current = true
    setSearchTick((t) => t + 1)
  }, [])
  const consumeSearchFocus = useCallback(() => {
    const q = searchFlag.current
    searchFlag.current = false
    return q
  }, [])

  const resolved = useMemo<ResolvedLine[]>(
    () =>
      lines.flatMap((l) => {
        const product = products.find((p) => p.id === l.productId)
        return product
          ? [{ ...l, key: keyOf(l), product, unit: priceOf(product) }]
          : []
      }),
    [lines],
  )

  const value = useMemo<StoreValue>(
    () => ({
      lines,
      resolved,
      count: resolved.reduce((n, l) => n + l.qty, 0),
      total: resolved.reduce((n, l) => n + l.unit * l.qty, 0),
      add,
      remove,
      setQty,
      clear,
      cartOpen,
      setCartOpen,
      active,
      openProduct,
      closeProduct,
      view,
      goShop,
      scrollToAnchor,
      consumePendingAnchor,
      queueSearchFocus,
      consumeSearchFocus,
      searchTick,
    }),
    [
      lines,
      resolved,
      cartOpen,
      active,
      view,
      searchTick,
      add,
      remove,
      setQty,
      clear,
      openProduct,
      closeProduct,
      goShop,
      scrollToAnchor,
      consumePendingAnchor,
      queueSearchFocus,
      consumeSearchFocus,
    ],
  )

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreCtx)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}

/* After a cross-view navigation, scroll to the requested section once
   the target view has mounted. */
export function usePendingAnchorScroll() {
  const { consumePendingAnchor, scrollToAnchor } = useStore()
  useEffect(() => {
    const anchor = consumePendingAnchor()
    if (!anchor) return
    const t = window.setTimeout(() => scrollToAnchor(anchor, false), 90)
    return () => window.clearTimeout(t)
  }, [consumePendingAnchor, scrollToAnchor])
}
