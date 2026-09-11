import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { products, type Category } from '../data/products'
import {
  CATEGORIES,
  useStore,
  VIEW_LABEL,
  type ShopView,
} from '../store/StoreContext'
import { cn } from '../utils/helpers'
import { lockScroll, unlockScroll } from '../utils/scrollLock'
import { useFocusTrap } from '../utils/focusTrap'
import {
  IconArrowRight,
  IconBag,
  IconChevronDown,
  IconMenu,
  IconSearch,
  IconX,
  ShopLogo,
} from './ui'

/* mega-menu racks — mirrors the storefront category tiles */
const MEGA_TILES: { name: Category; image: string }[] = [
  { name: 'Clothing', image: '/products/embroidered-2-piece-suit.jpg' },
  { name: 'Accessories', image: '/products/leather-crossbody-bag.jpg' },
  { name: 'Footwear', image: '/products/suede-penny-loafers.jpg' },
  { name: 'Stationery', image: '/products/premium-notebook-set.jpg' },
  { name: 'Cosmetics', image: '/products/oud-perfume-set.jpg' },
  { name: 'Gifts', image: '/products/gift-box-hamper.jpg' },
]

/* brand mega-menu — hover panel: category rack cards + campaign strip,
   each card deep-links to its own collection page */
function MegaMenu({ dark = false }: { dark?: boolean }) {
  const { goShop, view } = useStore()
  const [open, setOpen] = useState(false)
  /* the panel is viewport-fixed, so its top must track wherever the sticky
     header currently is (below the announcement bar at the top of the page,
     flush to the viewport edge once scrolled) — measured at open time */
  const [panelTop, setPanelTop] = useState('4.75rem')
  const rootRef = useRef<HTMLDivElement>(null)
  const timer = useRef<number>()
  const activeView = view

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const syncTop = () => {
    const header = rootRef.current?.closest('header')
    if (!header) return
    setPanelTop(`${Math.round(header.getBoundingClientRect().bottom + 6)}px`)
  }
  const openNow = () => {
    syncTop()
    window.clearTimeout(timer.current)
    setOpen(true)
  }
  const enter = () => openNow()
  const leave = () => {
    timer.current = window.setTimeout(() => setOpen(false), 140)
  }
  const go = (target: ShopView) => {
    setOpen(false)
    goShop(target)
  }

  return (
    <div ref={rootRef} className="relative" onMouseEnter={enter} onMouseLeave={leave}>
      <button
        className={cn(
          'flex items-center gap-1 text-[13px] font-semibold transition-colors',
          dark
            ? open
              ? 'text-cream'
              : 'text-cream/70 hover:text-cream'
            : open
              ? 'text-espresso'
              : 'text-cocoa hover:text-espresso',
        )}
        aria-expanded={open}
        /* mouse: hover opens, click navigates · touch: first tap opens, second navigates */
        onClick={() => (open ? go('all') : openNow())}
      >
        Categories
        <IconChevronDown
          className={cn('h-3.5 w-3.5 transition-transform duration-300', open && 'rotate-180')}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.99 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            /* anchored to the viewport, not the trigger — never clips off-screen
               at narrow lg widths; top tracks the sticky header's live position */
            style={{ top: panelTop }}
            className="pointer-events-none fixed inset-x-0 z-[60] flex justify-center px-4"
          >
            <div className="pointer-events-auto w-[44rem] max-w-full rounded-3xl border border-line bg-cream/95 p-4 shadow-soft backdrop-blur-xl">
              <div className="grid grid-cols-3 gap-2.5">
                {MEGA_TILES.map((t) => {
                  const isActive = activeView === t.name
                  return (
                    <button
                      key={t.name}
                      onClick={() => go(t.name)}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'group relative overflow-hidden rounded-2xl bg-sand text-left',
                        isActive && 'ring-2 ring-terracotta',
                      )}
                    >
                      <img
                        src={t.image}
                        alt={t.name}
                        loading="lazy"
                        className="h-24 w-full object-cover transition-transform duration-700 group-hover:scale-[1.08]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-espresso/70 via-espresso/10 to-transparent" />
                      <div className="absolute inset-x-3 bottom-2.5 flex items-end justify-between">
                        <span className="text-[12px] font-bold text-cream">{t.name}</span>
                        <span className="text-[10px] font-semibold text-cream/70">
                          {products.filter((p) => p.category === t.name).length}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
              <button
                onClick={() => go('sale')}
                className="group relative mt-2.5 block h-24 w-full overflow-hidden rounded-2xl text-left"
              >
                <img
                  src="/products/campaign-sale.jpg"
                  alt="The Autumn Edit"
                  loading="lazy"
                  className="h-full w-full object-cover object-[center_35%] transition-transform duration-700 group-hover:scale-[1.05]"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-espresso/75 via-espresso/40 to-transparent" />
                <div className="absolute inset-y-0 left-5 flex flex-col justify-center">
                  <span className="text-[9px] font-bold uppercase tracking-mega text-clay">
                    The Autumn Edit
                  </span>
                  <span className="font-display text-lg font-medium text-cream">
                    Up to 19% off →
                  </span>
                </div>
              </button>
              <div className="mt-3 flex items-center justify-between px-1">
                <button
                  onClick={() => go('new')}
                  className="text-[12px] font-bold text-cocoa transition-colors hover:text-espresso"
                >
                  New Arrivals
                </button>
                <button
                  onClick={() => go('all')}
                  className="group flex items-center gap-1 text-[12px] font-bold text-terracotta-dark"
                >
                  Shop everything
                  <IconArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── announcement bar — a real 36px promo strip above the nav ────────
   Centered, readable, tappable (deep-links to the sale rack). It scrolls
   away with the page — the nav stays the only sticky chrome on mobile.
   Sits on solid espresso, so the area above the navigation can never
   collapse into a stray colored line again. */
function AnnouncementBar() {
  const { goShop } = useStore()
  return (
    <div className="relative flex h-9 items-center justify-center overflow-hidden bg-espresso px-3 text-cream">
      <button
        onClick={() => goShop('sale')}
        className="absolute inset-0"
        aria-label="Shop the Autumn Edit sale"
      />
      <p className="pointer-events-none flex max-w-full items-center gap-2.5 whitespace-nowrap text-[10px] font-bold uppercase tracking-mega sm:gap-3 sm:text-[11px]">
        <span className="text-cream/85">
          <span className="sm:hidden">Autumn Edit</span>
          <span className="hidden sm:inline">The Autumn Edit</span>{' '}
          <span className="text-claylight">· up to 19% off</span>
        </span>
        <span aria-hidden className="h-1 w-1 shrink-0 rotate-45 bg-clay/70" />
        <span className="hidden text-cream/70 md:inline">Cash on delivery</span>
        <span aria-hidden className="hidden h-1 w-1 shrink-0 rotate-45 bg-clay/70 md:block" />
        <span className="hidden text-cream/70 lg:inline">24–48h dispatch</span>
      </p>
    </div>
  )
}

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)
  /* starts dark: the prerendered home page always opens over the espresso
     hero — the effect corrects it on other pages right after mount */
  const [overDark, setOverDark] = useState(true)
  const menuRef = useRef<HTMLDivElement>(null)
  useFocusTrap(menuRef, menuOpen)
  const { count, setCartOpen, view, goShop, queueSearchFocus } = useStore()

  /* while the pinned dark hero stage is behind the nav, the pill switches to
     dark glass — the cream pill would read as a white block on the espresso
     canvas. Below the hero it's the warm cream glass again. */
  useEffect(() => {
    const measure = () => {
      const hero = document.getElementById('top')
      if (!hero) {
        setOverDark(false)
        return
      }
      const stageBottomPassesNav = hero.offsetTop + hero.offsetHeight - 68
      setOverDark(window.scrollY < stageBottomPassesNav)
    }
    measure()
    const raf = requestAnimationFrame(measure)
    window.addEventListener('scroll', measure, { passive: true })
    window.addEventListener('resize', measure)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', measure)
      window.removeEventListener('resize', measure)
    }
  }, [view])

  useEffect(() => {
    if (!menuOpen) return
    lockScroll()
    return () => unlockScroll()
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  /* search icon → Shop All, then straight into the search field
     (focus fires via the CollectionPage tick effect — same page or not) */
  const openSearch = () => {
    queueSearchFocus()
    goShop('all')
  }

  /* solid-fill icon buttons, both nav states: espresso-on-cream by default
     (the solid cream mobile pill and the cream glass at lg), cream-on-espresso
     when the dark glass shows at lg. Solid fills keep ≥7:1 contrast against
     either pill — no more outlined ghosts on translucent brown. */
  const iconBtn = cn(
    'border-transparent bg-espresso text-cream shadow-[0_6px_16px_-8px_rgba(31,23,18,0.55)] hover:bg-charcoal',
    overDark && 'lg:bg-cream lg:text-espresso lg:hover:bg-sand',
  )

  return (
    <>
      <AnnouncementBar />

      <header className="sticky top-0 z-50 h-[4.25rem] pt-[0.44rem]">
        {/* below lg: a SOLID cream pill — always legible over the hero photo,
            no translucency for the logo or icons to fight through. From lg
            up: the floating glass pill — dark glass while the hero stage is
            behind it, cream glass once content turns light; the outer height
            never changes so every pinned offset below lines up.
            The pill is positioned with header PADDING, not margin: a child
            margin collapses through a sticky header and pushes the whole
            document down, leaving a bare strip of page background above
            the hero. */}
        <div
          className={cn(
            'mx-3 flex h-[3.55rem] max-w-[62rem] items-center justify-between rounded-full border border-espresso/10 bg-cream px-4 shadow-[0_12px_32px_-16px_rgba(31,23,18,0.5)] transition-all duration-500 sm:px-6 lg:mx-auto lg:backdrop-blur-2xl lg:backdrop-saturate-150',
            overDark
              ? 'lg:border-white/[0.08] lg:bg-espresso/55 lg:shadow-[0_16px_48px_-14px_rgba(10,4,2,0.65),inset_0_1px_0_rgba(255,255,255,0.06)]'
              : 'lg:border-white/60 lg:bg-cream/70 lg:shadow-[0_16px_48px_-14px_rgba(50,22,6,0.35),0_2px_10px_rgba(50,22,6,0.08),inset_0_1px_0_rgba(255,255,255,0.7)]',
          )}
        >
          <ShopLogo
            dark={overDark}
            responsive
            href="#/shop"
            onClick={(e) => {
              e.preventDefault()
              goShop('home')
            }}
          />

          {/* desktop links */}
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Shop">
            <a
              href="#/shop/new"
              onClick={(e) => {
                e.preventDefault()
                goShop('new')
              }}
              className={cn(
                'text-[13px] font-semibold transition-colors',
                overDark
                  ? view === 'new'
                    ? 'text-cream underline underline-offset-8'
                    : 'text-cream/70 hover:text-cream'
                  : view === 'new'
                    ? 'text-espresso underline underline-offset-8'
                    : 'text-cocoa hover:text-espresso',
              )}
            >
              New In
            </a>
            <MegaMenu dark={overDark} />
            <a
              href="#/shop/sale"
              onClick={(e) => {
                e.preventDefault()
                goShop('sale')
              }}
              className={cn(
                'text-[13px] font-semibold transition-colors',
                overDark
                  ? view === 'sale'
                    ? 'text-claylight underline underline-offset-8'
                    : 'text-clay hover:text-claylight'
                  : view === 'sale'
                    ? 'text-ember underline underline-offset-8'
                    : 'text-terracotta-dark hover:text-ember',
              )}
            >
              Sale
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            {/* phones get two icons (basket · menu); search lives in the
                mobile menu — the pill stays uncramped at 320–430px */}
            <button
              onClick={openSearch}
              className={cn(iconBtn, 'hidden h-10 w-10 items-center justify-center rounded-[4px] border sm:flex')}
              aria-label="Search the catalog"
            >
              <IconSearch className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={() => setCartOpen(true)}
              className={cn(
                iconBtn,
                'group relative flex h-10 items-center gap-2 rounded-[4px] border px-3.5 text-[13px] font-semibold transition-all sm:px-4',
              )}
              aria-label="Open inquiry basket"
            >
              <IconBag className="h-4.5 w-4.5" />
              <span className="hidden sm:inline">Basket</span>
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex h-5 min-w-5 items-center justify-center rounded-[2px] bg-terracotta px-1 text-[11px] font-bold text-cream"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            <button
              onClick={() => setMenuOpen(true)}
              className={cn(iconBtn, 'flex h-10 w-10 items-center justify-center rounded-[4px] border lg:hidden')}
              aria-label="Open menu"
            >
              <IconMenu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            ref={menuRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[70] flex flex-col bg-espresso text-cream lg:hidden"
          >
            <div className="flex h-[4.25rem] items-center justify-between px-4 sm:px-6">
              <ShopLogo
                dark
                href="#/shop"
                onClick={(e) => {
                  e.preventDefault()
                  goShop('home')
                  setMenuOpen(false)
                }}
              />
              <button
                onClick={() => setMenuOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-cream/20"
                aria-label="Close menu"
              >
                <IconX className="h-5 w-5" />
              </button>
            </div>

            <nav
              className="flex flex-1 flex-col justify-center gap-1 overflow-y-auto px-8 py-4"
              aria-label="Mobile"
            >
              {/* search collapsed into the menu on phones — the pill above
                  keeps only basket + menu icons */}
              <motion.button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  openSearch()
                }}
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05, duration: 0.4 }}
                className="flex items-center gap-3 border-b border-cream/10 py-3.5 text-left text-[15px] font-semibold text-cream/80 transition-colors hover:text-cream"
              >
                <IconSearch className="h-4.5 w-4.5 text-clay" />
                Search the catalog
              </motion.button>
              {(['new', 'all', 'sale'] as ShopView[]).map((v, i) => (
                <motion.a
                  key={v}
                  href={`#/shop/${v}`}
                  onClick={(e) => {
                    e.preventDefault()
                    goShop(v)
                    setMenuOpen(false)
                  }}
                  initial={{ opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.06 + i * 0.05, duration: 0.4 }}
                  aria-current={view === v ? 'page' : undefined}
                  className={cn(
                    'border-b border-cream/10 py-3.5 font-display text-3xl font-medium tracking-tight',
                    v === 'sale' && 'italic text-clay',
                    view === v && 'text-claylight',
                  )}
                >
                  {v === 'all' ? 'Shop All' : VIEW_LABEL[v]}
                </motion.a>
              ))}

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.24, duration: 0.4 }}
                className="mt-5 text-[10px] font-bold uppercase tracking-mega text-cream/40"
              >
                Categories
              </motion.p>
              <div className="mt-1 grid grid-cols-2 gap-x-6">
                {CATEGORIES.map((c, i) => (
                  <motion.a
                    key={c}
                    href={`#/shop/${c.toLowerCase()}`}
                    onClick={(e) => {
                      e.preventDefault()
                      goShop(c)
                      setMenuOpen(false)
                    }}
                    initial={{ opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.26 + i * 0.04, duration: 0.35 }}
                    aria-current={view === c ? 'page' : undefined}
                    className={cn(
                      'border-b border-cream/10 py-3 text-[15px] font-semibold text-cream/80 transition-colors hover:text-cream',
                      view === c && 'text-claylight',
                    )}
                  >
                    {c}
                    <span className="ml-2 text-[11px] font-semibold text-cream/35">
                      {products.filter((p) => p.category === c).length}
                    </span>
                  </motion.a>
                ))}
              </div>
            </nav>

            <div className="p-8">
              <p className="text-center text-[11px] uppercase tracking-mega text-cream/40">
                Marigold & Clay — curated general store
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
