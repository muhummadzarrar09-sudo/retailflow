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
import { CATEGORY_LIST, priceOf, products, type Category, type Product } from '../data/products'
import { currentHash, hasDom, prefersReducedMotion, scrollIntoView, scrollTo } from '../utils/env'

/* ── Client-side hash routing — brand-style, one URL per view ────────
   #/shop                    → Home (campaign storefront)
   #/shop/new                → New Arrivals
   #/shop/all                → Shop All
   #/shop/sale               → The Sale
   #/shop/clothing|accessories|footwear|stationery|cosmetics|gifts
                             → category collection pages
   Plain anchor hashes (e.g. #pricing) and #product-<slug> deep links
   are not routes — they never flip the active view.

   Routing is adoption-based: the server (and the first client render) always
   start on Home, then the URL is read in an effect. That keeps hydration
   byte-identical while still honoring shared links. */

export type ShopView = 'home' | 'new' | 'sale' | 'all' | Category

/** the racks — owned by the catalog so the nav, the tiles and the counts can
 *  never disagree about how many there are */
export const CATEGORIES: Category[] = [...CATEGORY_LIST]

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

/** #/shop/sale → 'sale' · anything unknown (including plain anchors) → null */
export const viewFromHash = (hash = currentHash()): ShopView | null => {
  if (!hash.startsWith('#/shop')) return null
  const rest = hash.slice('#/shop'.length)
  if (rest !== '' && rest[0] !== '/') return null // reject #/shoplift
  const seg = rest.replace(/^\//, '').split('/')[0].toLowerCase()
  if (!seg) return 'home'
  return SLUG_VIEW[seg] ?? null
}

export interface CartLine {
  productId: string
  size?: string
  color?: string
  qty: number
}

export const keyOf = (l: CartLine) => `${l.productId}::${l.size ?? ''}::${l.color ?? ''}`

const MAX_QTY = 99

export const clampQty = (n: unknown): number => {
  const q = Math.floor(Number(n))
  return Number.isFinite(q) ? Math.max(1, Math.min(MAX_QTY, q)) : 1
}

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
  hydrated: boolean
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

/** Untrusted JSON → known-good lines. Anything malformed is dropped rather
 *  than trusted, and duplicate variant lines are merged (two lines sharing a
 *  key would collide in the basket list and make remove/setQty hit both). */
const sanitizeLines = (raw: unknown): CartLine[] => {
  if (!Array.isArray(raw)) return []
  const byKey = new Map<string, CartLine>()
  for (const item of raw) {
    if (typeof item !== 'object' || item === null) continue
    const { productId, size, color, qty } = item as Partial<CartLine>
    if (typeof productId !== 'string') continue
    if (!products.some((p) => p.id === productId)) continue
    if (typeof qty === 'number' && !(qty > 0)) continue
    const line: CartLine = {
      productId,
      size: typeof size === 'string' ? size : undefined,
      color: typeof color === 'string' ? color : undefined,
      qty: clampQty(qty),
    }
    const key = keyOf(line)
    const seen = byKey.get(key)
    byKey.set(key, seen ? { ...seen, qty: Math.min(MAX_QTY, seen.qty + line.qty) } : line)
  }
  return [...byKey.values()]
}

const readStoredLines = (): CartLine[] => {
  if (!hasDom()) return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? sanitizeLines(JSON.parse(raw)) : []
  } catch {
    return []
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  // both server and first client render start empty/on-Home; the browser-only
  // truth (stored basket, shared URL) is adopted in effects below
  const [lines, setLines] = useState<CartLine[]>([])
  const [hydrated, setHydrated] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [active, setActive] = useState<Product | null>(null)
  const [view, setView] = useState<ShopView>('home')
  const pendingAnchor = useRef<string | null>(null)

  /* restore the basket after mount — writing the empty initial state back to
     storage would wipe a shopper's saved basket before it is ever read */
  useEffect(() => {
    setLines(readStoredLines())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated || !hasDom()) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
    } catch {
      /* storage unavailable (private mode, quota) — session-only basket */
    }
  }, [lines, hydrated])

  /* shared links + back/forward buttons drive the active view */
  useEffect(() => {
    const apply = () => {
      const v = viewFromHash()
      if (v) setView((prev) => (prev === v ? prev : v))
    }
    apply()
    window.addEventListener('hashchange', apply)
    return () => window.removeEventListener('hashchange', apply)
  }, [])

  const add = useCallback((line: CartLine) => {
    const next: CartLine = { ...line, qty: clampQty(line.qty) }
    setLines((prev) => {
      const key = keyOf(next)
      const idx = prev.findIndex((l) => keyOf(l) === key)
      if (idx === -1) return [...prev, next]
      const out = [...prev]
      out[idx] = { ...out[idx], qty: Math.min(MAX_QTY, out[idx].qty + next.qty) }
      return out
    })
  }, [])

  const remove = useCallback((key: string) => {
    setLines((prev) => prev.filter((l) => keyOf(l) !== key))
  }, [])

  const setQty = useCallback((key: string, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => keyOf(l) !== key)
        : prev.map((l) => (keyOf(l) === key ? { ...l, qty: clampQty(qty) } : l)),
    )
  }, [])

  const clear = useCallback(() => setLines([]), [])

  const openProduct = useCallback((p: Product) => setActive(p), [])
  const closeProduct = useCallback(() => setActive(null), [])

  const scrollToAnchor = useCallback((id: string, smooth = true) => {
    if (!hasDom()) return
    const el = document.getElementById(id)
    if (el) scrollIntoView(el, { smooth })
  }, [])

  const navigate = useCallback((v: ShopView) => {
    setView((prev) => (prev === v ? prev : v))
    const hash = VIEW_PATH[v]
    if (hasDom() && window.location.hash !== hash) window.location.hash = hash
  }, [])

  /* go to a storefront view — home, a collection, or a category rack —
     optionally landing on a specific section of that page */
  const goShop = useCallback(
    (target: ShopView = 'home', anchor?: string) => {
      if (target === view) {
        if (anchor) scrollToAnchor(anchor)
        else scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
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
     field. The flag is scoped to the navigation that asked for it, so an
     unconsumed request can never steal focus on a later, unrelated visit. */
  const searchFlag = useRef<number | boolean>(false)
  const [searchTick, setSearchTick] = useState(0)
  const queueSearchFocus = useCallback(() => {
    searchFlag.current = Date.now()
    setSearchTick((t) => t + 1)
  }, [])
  /* the flag is a request to focus the field on the page we are about to land
     on — if that never happens (nav cancelled, link clicked twice), it must not
     steal focus on some unrelated visit later */
  const consumeSearchFocus = useCallback(() => {
    const at = searchFlag.current
    searchFlag.current = 0
    return typeof at === 'number' && at > 0 && Date.now() - at < 2000
  }, [])

  const resolved = useMemo<ResolvedLine[]>(
    () =>
      lines.flatMap((l) => {
        const product = products.find((p) => p.id === l.productId)
        return product ? [{ ...l, key: keyOf(l), product, unit: priceOf(product) }] : []
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
      hydrated,
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
      hydrated,
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

/** After a view switch, scroll to the requested section once the target page
 *  has mounted. */
export function usePendingAnchorScroll() {
  const { consumePendingAnchor, scrollToAnchor } = useStore()
  useEffect(() => {
    const anchor = consumePendingAnchor()
    if (!anchor) return
    const t = window.setTimeout(() => scrollToAnchor(anchor, false), 90)
    return () => window.clearTimeout(t)
  }, [consumePendingAnchor, scrollToAnchor])
}
