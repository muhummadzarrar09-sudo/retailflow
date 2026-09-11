import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ProductCard } from '../components/ProductCard'
import {
  IconChevronDown,
  IconFilter,
  IconSearch,
  IconX,
  Reveal,
} from '../components/ui'
import {
  COLOR_HEX,
  priceOf,
  products,
  type Product,
} from '../data/products'
import {
  CATEGORIES,
  usePendingAnchorScroll,
  useStore,
  VIEW_LABEL,
  type ShopView,
} from '../store/StoreContext'
import { cn, rs } from '../utils/helpers'
import { lockScroll, unlockScroll } from '../utils/scrollLock'
import { useFocusTrap } from '../utils/focusTrap'

type SortKey = 'newest' | 'popular' | 'price-asc' | 'price-desc'
type CollectionView = Exclude<ShopView, 'home'>

const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL']
const PRICE_MAX = Math.ceil(Math.max(...products.map((p) => p.price)) / 500) * 500

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'newest', label: 'Newest first' },
  { key: 'popular', label: 'Most popular' },
  { key: 'price-asc', label: 'Price: low → high' },
  { key: 'price-desc', label: 'Price: high → low' },
]

/* ── Collection definitions — one page per rack, like a real brand ── */

interface CollectionMeta {
  /** headline second half, rendered italic in terracotta */
  accent: string
  blurb: string
  match: (p: Product) => boolean
}

const COLLECTIONS: Record<CollectionView, CollectionMeta> = {
  new: {
    accent: 'just landed.',
    blurb:
      'This week’s arrivals — embroidered lawn, soft cotton and hand-finished goods, straight off the worktable and onto the rack.',
    match: (p) => !!p.isNew,
  },
  all: {
    accent: 'every piece, every rack.',
    blurb:
      'The complete Marigold & Clay catalog — all six racks, searchable and filterable. Open anything to see sizes, colors and stock.',
    match: () => true,
  },
  sale: {
    accent: 'softer prices.',
    blurb:
      'The Autumn Edit — selected pieces at up to 19% off while your size is still on the rack. Confirm availability on WhatsApp before you come in.',
    match: (p) => !!p.salePrice,
  },
  Clothing: {
    accent: 'stitched for the season.',
    blurb:
      'Kurtas, suits and everyday layers — breathable lawn and cotton, checked piece by piece for fabric, fall and finish.',
    match: (p) => p.category === 'Clothing',
  },
  Accessories: {
    accent: 'the finishing touch.',
    blurb: 'Bags, scarves and jewelry that complete the look — small pieces, chosen slowly.',
    match: (p) => p.category === 'Accessories',
  },
  Footwear: {
    accent: 'ready to walk.',
    blurb: 'Hand-finished pairs in easy neutrals — sized, cushioned and broken in from day one.',
    match: (p) => p.category === 'Footwear',
  },
  Stationery: {
    accent: 'for slow days.',
    blurb: 'Paper goods and pens for intentional desks — thick stock, honest ink, nothing flimsy.',
    match: (p) => p.category === 'Stationery',
  },
  Cosmetics: {
    accent: 'small rituals.',
    blurb: 'Oud, balms and everyday care — shelf-fresh, sealed and sourced we can vouch for.',
    match: (p) => p.category === 'Cosmetics',
  },
  Gifts: {
    accent: 'wrapped the Marigold way.',
    blurb: 'Ready-to-give sets and hampers — tell us the occasion on WhatsApp and we’ll handle the rest.',
    match: (p) => p.category === 'Gifts',
  },
}

const SIDEBAR_ORDER: CollectionView[] = ['new', 'all', ...CATEGORIES, 'sale']
const uniqueColors = [...new Set(products.flatMap((p) => p.colors))]

/* ── Filter pieces ─────────────────────────────────────────────────── */

function FilterBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-line pt-5 first:border-t-0 first:pt-0">
      <p className="text-[11px] font-bold uppercase tracking-mega text-taupe">{title}</p>
      <div className="mt-3">{children}</div>
    </div>
  )
}

interface FiltersProps {
  sizes: string[]
  toggleSize: (s: string) => void
  colors: string[]
  toggleColor: (c: string) => void
  maxPrice: number
  setMaxPrice: (n: number) => void
}

function FilterControls({ sizes, toggleSize, colors, toggleColor, maxPrice, setMaxPrice }: FiltersProps) {
  return (
    <div className="space-y-6">
      <FilterBlock title="Price">
        <input
          type="range"
          min={1000}
          max={PRICE_MAX}
          step={250}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full"
          aria-label="Maximum price"
        />
        <div className="mt-1.5 flex justify-between text-[12px] font-semibold text-cocoa">
          <span>{rs(1000)}</span>
          <span className="text-terracotta-dark">
            {maxPrice >= PRICE_MAX ? 'Any price' : `Up to ${rs(maxPrice)}`}
          </span>
        </div>
      </FilterBlock>

      <FilterBlock title="Size">
        <div className="flex flex-wrap gap-2">
          {ALL_SIZES.map((s) => (
            <button
              key={s}
              onClick={() => toggleSize(s)}
              className={cn(
                'h-9 w-11 rounded-[3px] border text-[12px] font-bold transition-all',
                sizes.includes(s)
                  ? 'border-espresso bg-espresso text-cream'
                  : 'border-line bg-cream text-cocoa hover:border-taupe',
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </FilterBlock>

      <FilterBlock title="Color">
        <div className="flex flex-wrap gap-2.5">
          {uniqueColors.map((c) => (
            <button
              key={c}
              onClick={() => toggleColor(c)}
              title={c}
              aria-label={`Filter by ${c}`}
              className={cn(
                'h-8 w-8 rounded-full border-2 transition-all',
                colors.includes(c)
                  ? 'scale-110 border-espresso shadow-pop'
                  : 'border-espresso/10 hover:scale-105',
              )}
              style={{ backgroundColor: COLOR_HEX[c] ?? '#ccc' }}
            />
          ))}
        </div>
        <p className="mt-2 text-[11px] text-taupe">
          {colors.length ? colors.join(', ') : 'All colors'}
        </p>
      </FilterBlock>
    </div>
  )
}

/* ── Collections navigation — the brand sidebar + mobile chip rail ── */

function CollectionsNav({
  view,
  onNavigate,
}: {
  view: CollectionView
  onNavigate?: () => void
}) {
  const { goShop } = useStore()
  return (
    <nav aria-label="Collections">
      <p className="text-[11px] font-bold uppercase tracking-mega text-espresso">Collections</p>
      <ul className="mt-3 space-y-1">
        {SIDEBAR_ORDER.map((v) => {
          const activeItem = v === view
          const count = products.filter(COLLECTIONS[v].match).length
          return (
            <li key={v}>
              <button
                onClick={() => {
                  goShop(v)
                  onNavigate?.()
                }}
                aria-current={activeItem ? 'page' : undefined}
                className={cn(
                  'group flex w-full items-baseline justify-between gap-3 border-l-2 py-2 pl-3 pr-1 text-left text-[13.5px] transition-all',
                  activeItem
                    ? 'border-espresso font-bold text-espresso'
                    : 'border-transparent font-semibold text-cocoa hover:border-taupe hover:text-espresso',
                  v === 'sale' && !activeItem && 'text-terracotta-dark',
                )}
              >
                <span className="flex items-baseline gap-2">
                  {VIEW_LABEL[v]}
                  {v === 'sale' && <span className="text-[10px]">●</span>}
                </span>
                <span
                  className={cn(
                    'text-[11px] font-semibold tabular-nums',
                    activeItem ? 'text-espresso/60' : 'text-taupe',
                  )}
                >
                  {count}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/* ── Collection page ───────────────────────────────────────────────── */

/* skeleton card — mirrors the product card's geometry for filler loading */

function SkeletonCard() {
  return (
    <div aria-hidden>
      <div className="skeleton aspect-[4/5] w-full rounded-3xl" />
      <div className="mt-3.5 space-y-2 px-0.5">
        <div className="skeleton h-3.5 w-3/4 rounded-full" />
        <div className="skeleton h-3 w-2/5 rounded-full" />
      </div>
    </div>
  )
}

export default function CollectionPage({ view }: { view: CollectionView }) {
  const { goShop, searchTick, consumeSearchFocus } = useStore()
  usePendingAnchorScroll()
  const meta = COLLECTIONS[view]
  const rack = useMemo(() => products.filter(meta.match), [meta])

  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('newest')
  const [sizes, setSizes] = useState<string[]>([])
  const [colors, setColors] = useState<string[]>([])
  const [maxPrice, setMaxPrice] = useState(PRICE_MAX)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const firstPass = useRef(true)

  /* brief skeleton shimmer whenever the result set is re-queried —
     natural-ui filler loading, never the intro curtain; the page's own
     first render skips it because mount already feels instant */
  useEffect(() => {
    if (firstPass.current) {
      firstPass.current = false
      return
    }
    setRefreshing(true)
    const t = window.setTimeout(() => setRefreshing(false), 420)
    return () => window.clearTimeout(t)
  }, [sort, query, sizes, colors, maxPrice])

  /* nav search icon — works from any page, on first mount and re-clicks */
  useEffect(() => {
    if (searchTick === 0) return
    if (!consumeSearchFocus()) return
    const t = window.setTimeout(() => {
      const el = document.getElementById('collection-search')
      if (!el) return
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      el.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' })
      el.focus({ preventScroll: true })
    }, 520)
    return () => window.clearTimeout(t)
  }, [searchTick, consumeSearchFocus])

  const toggleSize = (s: string) =>
    setSizes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))
  const toggleColor = (c: string) =>
    setColors((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]))

  // mobile filter sheet — dialog manners: lock the page, honor Escape, take focus
  const sheetRef = useRef<HTMLDivElement>(null)
  useFocusTrap(sheetRef, sheetOpen)
  useEffect(() => {
    if (!sheetOpen) return
    lockScroll()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSheetOpen(false)
    window.addEventListener('keydown', onKey)
    const t = window.setTimeout(() => sheetRef.current?.focus(), 250)
    return () => {
      unlockScroll()
      window.removeEventListener('keydown', onKey)
      window.clearTimeout(t)
    }
  }, [sheetOpen])

  const reset = () => {
    setQuery('')
    setSizes([])
    setColors([])
    setMaxPrice(PRICE_MAX)
  }

  const activeCount = sizes.length + colors.length + (maxPrice < PRICE_MAX ? 1 : 0)

  const list = useMemo(() => {
    let out = rack.filter((p) => {
      if (query) {
        const q = query.toLowerCase()
        if (!`${p.name} ${p.category} ${p.description}`.toLowerCase().includes(q)) return false
      }
      if (priceOf(p) > maxPrice) return false
      if (sizes.length && (!p.sizes || !p.sizes.some((s) => sizes.includes(s)))) return false
      if (colors.length && !p.colors.some((c) => colors.includes(c))) return false
      return true
    })

    switch (sort) {
      case 'newest':
        out = [...out].sort((a, b) => b.addedAt - a.addedAt)
        break
      case 'popular':
        out = [...out].sort((a, b) => b.popularity - a.popularity)
        break
      case 'price-asc':
        out = [...out].sort((a, b) => priceOf(a) - priceOf(b))
        break
      case 'price-desc':
        out = [...out].sort((a, b) => priceOf(b) - priceOf(a))
        break
    }
    return out
  }, [rack, query, sort, sizes, colors, maxPrice])

  const filterProps: FiltersProps = {
    sizes,
    toggleSize,
    colors,
    toggleColor,
    maxPrice,
    setMaxPrice,
  }

  return (
    <div>
      {/* ── collection header — editorial, brand-style ── */}
      <header className="border-b border-line bg-parchment/60">
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-14 sm:px-6 lg:px-8 lg:pb-16 lg:pt-20">
          {/* breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-mega text-taupe">
            <button
              onClick={() => goShop('home')}
              className="transition-colors hover:text-terracotta-dark"
            >
              Home
            </button>
            <span aria-hidden>/</span>
            <span className="text-espresso">{VIEW_LABEL[view]}</span>
          </nav>

          <Reveal>
            <h1 className="mt-6 max-w-3xl font-display text-5xl font-medium leading-[1.02] tracking-tight text-espresso sm:text-6xl lg:text-7xl">
              {view === 'sale' ? (
                <>
                  The <span className="italic text-terracotta">Sale.</span>
                </>
              ) : (
                <>
                  {VIEW_LABEL[view]} — <span className="italic text-terracotta">{meta.accent}</span>
                </>
              )}
            </h1>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-cocoa sm:text-base">
              {meta.blurb}
            </p>
          </Reveal>
          <Reveal delay={0.14}>
            <p className="mt-6 text-[11px] font-bold uppercase tracking-mega text-taupe">
              {rack.length} {rack.length === 1 ? 'piece' : 'pieces'}
              {view === 'sale' && ' · up to 19% off'}
            </p>
          </Reveal>
        </div>
      </header>

      {/* ── mobile collection rail — brand tabs, jumps between pages ── */}
      <div className="no-scrollbar sticky top-[4.75rem] z-30 flex gap-1 overflow-x-auto border-b border-line bg-cream/95 px-4 backdrop-blur-xl lg:hidden">
        {SIDEBAR_ORDER.map((v) => (
          <button
            key={v}
            onClick={() => goShop(v)}
            aria-current={v === view ? 'page' : undefined}
            className={cn(
              'whitespace-nowrap border-b-2 px-3.5 py-3.5 text-[12px] font-bold uppercase tracking-[0.12em] transition-colors',
              v === view
                ? 'border-espresso text-espresso'
                : 'border-transparent text-taupe hover:text-espresso',
              v === 'sale' && v !== view && 'text-terracotta-dark',
            )}
          >
            {VIEW_LABEL[v]}
          </button>
        ))}
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">
        <div className="grid gap-x-8 lg:grid-cols-[15.5rem_minmax(0,1fr)]">
          {/* ── sidebar: collections + filters — pinned while the grid scrolls ── */}
          <aside className="hidden lg:block">
            <div className="thin-scroll lg:sticky lg:top-[4.9rem] lg:max-h-[calc(100vh-5.5rem)] lg:overflow-y-auto lg:space-y-8 lg:pb-2 lg:pr-2">
              <CollectionsNav view={view} />
              <div className="space-y-6 rounded-3xl border border-line bg-parchment/50 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-mega text-espresso">
                    Filters
                  </p>
                  {activeCount > 0 && (
                    <button
                      onClick={reset}
                      className="text-[11px] font-bold text-terracotta-dark underline underline-offset-2"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <FilterControls {...filterProps} />
              </div>
            </div>
          </aside>

          {/* ── toolbar + product grid — search/sort stays pinned too ── */}
          <div className="min-w-0">
            {/* toolbar */}
            <div className="z-20 -mx-4 border-line bg-cream/90 px-4 py-3 backdrop-blur-xl max-lg:sticky max-lg:top-[7.69rem] max-lg:border-b sm:mx-0 sm:rounded-[4px] sm:border sm:px-4 lg:sticky lg:top-[4.9rem]">
              <div className="flex items-center gap-2.5">
                <div className="flex min-w-0 flex-1 items-center gap-2 rounded-[3px] bg-parchment/80 px-3.5 py-2">
                  <IconSearch className="h-4 w-4 shrink-0 text-taupe" />
                  <input
                    id="collection-search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={`Search ${VIEW_LABEL[view].toLowerCase()}…`}
                    className="w-full min-w-0 bg-transparent text-sm font-medium outline-none placeholder:text-taupe"
                    aria-label={`Search ${VIEW_LABEL[view]}`}
                  />
                  {query && (
                    <button onClick={() => setQuery('')} aria-label="Clear search">
                      <IconX className="h-3.5 w-3.5 text-taupe" />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setSheetOpen(true)}
                  className="flex h-9.5 items-center gap-2 rounded-[3px] border border-line bg-cream px-4 text-[13px] font-bold text-charcoal lg:hidden"
                >
                  <IconFilter className="h-4 w-4" />
                  Filters
                  {activeCount > 0 && (
                    <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-[2px] bg-terracotta px-1 text-[10px] font-bold text-cream">
                      {activeCount}
                    </span>
                  )}
                </button>
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortKey)}
                    className="h-9.5 appearance-none rounded-[3px] border border-line bg-cream pl-4 pr-9 text-[13px] font-bold text-charcoal outline-none"
                    aria-label="Sort products"
                  >
                    {SORTS.map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <IconChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-taupe" />
                </div>
              </div>
            </div>

            {/* ── grid ── */}
            <div className="mt-6">
              {refreshing ? (
                <div className="skeleton mb-5 h-3.5 w-44 rounded-full" aria-hidden />
              ) : (
                <p className="mb-5 text-[13px] font-semibold text-taupe" role="status">
                  Showing <span className="text-espresso">{list.length}</span> of {rack.length}{' '}
                  {rack.length === 1 ? 'piece' : 'pieces'}
                </p>
              )}

              {refreshing ? (
                <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 sm:gap-x-5" aria-busy>
                  {Array.from({ length: Math.min(Math.max(list.length, 6), 9) }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : list.length === 0 ? (
                <div className="flex flex-col items-center rounded-3xl border border-dashed border-taupe/40 bg-parchment/40 px-6 py-20 text-center">
                  <IconSearch className="h-8 w-8 text-taupe" />
                  <p className="mt-4 font-display text-xl text-espresso">
                    Nothing matches those filters.
                  </p>
                  <p className="mt-1 text-sm text-cocoa">
                    Loosen a filter — or browse every rack in the store instead.
                  </p>
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={reset}
                      className="rounded-full bg-espresso px-5 py-2.5 text-[13px] font-bold text-cream"
                    >
                      Reset filters
                    </button>
                    <button
                      onClick={() => goShop('all')}
                      className="rounded-full border border-espresso/20 px-5 py-2.5 text-[13px] font-bold text-espresso transition-colors hover:bg-parchment"
                    >
                      Shop everything
                    </button>
                  </div>
                </div>
              ) : (
                <motion.div
                  layout
                  className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 sm:gap-x-5"
                >
                  <AnimatePresence mode="popLayout">
                    {list.map((p, i) => (
                      <ProductCard key={p.id} p={p} index={i} />
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── mobile filter sheet ── */}
      <AnimatePresence>
        {sheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSheetOpen(false)}
              className="fixed inset-0 z-[75] bg-espresso/50 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              ref={sheetRef}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-label="Product filters"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-[76] max-h-[85vh] overflow-y-auto rounded-t-3xl bg-cream p-6 outline-none lg:hidden"
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line" />
              <div className="flex items-center justify-between">
                <p className="font-display text-xl font-medium">Filters &amp; racks</p>
                <div className="flex items-center gap-3">
                  {activeCount > 0 && (
                    <button
                      onClick={reset}
                      className="text-[12px] font-bold text-terracotta-dark underline underline-offset-2"
                    >
                      Clear all
                    </button>
                  )}
                  <button
                    onClick={() => setSheetOpen(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-line"
                    aria-label="Close filters"
                  >
                    <IconX className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="mt-5 rounded-2xl border border-line bg-parchment/40 p-3">
                <CollectionsNav view={view} onNavigate={() => setSheetOpen(false)} />
              </div>
              <div className="mt-6">
                <FilterControls {...filterProps} />
              </div>
              <button
                onClick={() => setSheetOpen(false)}
                className="mt-7 w-full rounded-full bg-espresso py-3.5 text-sm font-bold text-cream"
              >
                Show {list.length} {list.length === 1 ? 'piece' : 'pieces'}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
