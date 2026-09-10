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

/* ── Client-side hash routing — one URL per page ───────────────────
   #/shop                        → Home (campaign storefront)
   #/shop/new · /all · /sale     → New Arrivals · Shop All · The Sale
   #/shop/clothing|accessories|footwear|stationery|cosmetics|gifts
                                → category collection pages
   #/shop/product/<slug>         → a full product detail page
   Plain anchor hashes (e.g. #policies) and legacy #product-<slug>
   deep links are NOT the URL form we steer users to. */

export type ShopView = 'home' | 'new' | 'sale' | 'all' | Category
export type ShopRoute =
  | { kind: 'shop'; view: ShopView }
  | { kind: 'product'; slug: string }

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

export const productPath = (slug: string) => `#/shop/product/${slug}`

/* the active route lives purely in the hash — unknown/empty hashes fall
   back to the storefront home so nothing ever 404s. On the server there is
   no URL, so the prerender always paints the home page; the client then
   hydrates it only when the real hash agrees (see main.tsx). */
export const shopRouteFromHash = (): ShopRoute => {
  if (typeof window === 'undefined') return { kind: 'shop', view: 'home' }
  const h = window.location.hash
  if (h.startsWith('#/shop')) {
    const parts = h.slice(1).split('/').filter(Boolean) // ['shop', ...]
    if (parts[1] === 'product' && parts[2]) return { kind: 'product', slug: parts[2] }
    const v = SLUG_VIEW[parts[1]?.toLowerCase() ?? ''] ?? 'home'
    return { kind: 'shop', view: v }
  }
  // bare '#', '#/', or any non-route hash (anchors, legacy #product-<slug>)
  return { kind: 'shop', view: 'home' }
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
  route: ShopRoute
  /** active collection view when browsing, else null on a product page */
  view: ShopView | null
  /** the product being viewed on a product page, else null */
  product: Product | null
  openProduct: (p: Product) => void
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
  /* start empty so server HTML and the first client render match byte-for-
     byte; the persisted basket is restored in an effect right after mount */
  const [lines, setLines] = useState<CartLine[]>([])
  const [hydratedCart, setHydratedCart] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [route, setRoute] = useState<ShopRoute>(() => shopRouteFromHash())
  const pendingAnchor = useRef<string | null>(null)

  useEffect(() => {
    setLines(loadLines())
    setHydratedCart(true)
  }, [])

  useEffect(() => {
    // persist only after the restore above has committed — never overwrite a
    // saved basket with the empty server-rendered state
    if (!hydratedCart) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
    } catch {
      /* storage unavailable — session-only cart */
    }
  }, [lines, hydratedCart])

  /* back/forward buttons + direct hash edits drive the active route */
  useEffect(() => {
    const onHash = () => {
      const r = shopRouteFromHash()
      setRoute((prev) => (JSON.stringify(prev) === JSON.stringify(r) ? prev : r))
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

  const scrollToAnchor = useCallback((id: string, smooth = true) => {
    const el = document.getElementById(id)
    if (!el) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ behavior: smooth && !reduced ? 'smooth' : 'auto', block: 'start' })
  }, [])

  const pushRoute = useCallback((next: ShopRoute) => {
    setRoute((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next))
    const hash =
      next.kind === 'product'
        ? productPath(next.slug)
        : VIEW_PATH[next.view]
    if (window.location.hash !== hash) window.location.hash = hash
  }, [])

  /* open a product's full detail page */
  const openProduct = useCallback((p: Product) => pushRoute({ kind: 'product', slug: p.slug }), [pushRoute])

  /* go to a storefront page — home, a collection, or a category rack —
     optionally landing on a specific section of that page */
  const goShop = useCallback(
    (target: ShopView = 'home', anchor?: string) => {
      const onCollection = route.kind === 'shop' && route.view === target
      if (onCollection) {
        if (anchor) scrollToAnchor(anchor)
        else scrollTop(true)
        return
      }
      pendingAnchor.current = anchor ?? null
      pushRoute({ kind: 'shop', view: target })
    },
    [route, pushRoute, scrollToAnchor],
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

  const product =
    route.kind === 'product'
      ? (products.find((p) => p.slug === route.slug) ?? null)
      : null

  const view: ShopView | null = route.kind === 'shop' ? route.view : null

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
      route,
      view,
      product,
      openProduct,
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
      route,
      view,
      product,
      searchTick,
      add,
      remove,
      setQty,
      clear,
      openProduct,
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

/* After a cross-page navigation, scroll to the requested section once
   the target page has mounted. */
export function usePendingAnchorScroll() {
  const { consumePendingAnchor, scrollToAnchor } = useStore()
  useEffect(() => {
    const anchor = consumePendingAnchor()
    if (!anchor) return
    const t = window.setTimeout(() => scrollToAnchor(anchor, false), 90)
    return () => window.clearTimeout(t)
  }, [consumePendingAnchor, scrollToAnchor])
}
