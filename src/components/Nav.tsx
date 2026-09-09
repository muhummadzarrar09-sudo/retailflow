import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { products, type Category } from '../data/products'
import {
  CATEGORIES,
  useStore,
  VIEW_LABEL,
  type ShopView,
} from '../store/StoreContext'
import { cn, MSG_SHOP, waLink } from '../utils/helpers'
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
  WhatsAppIcon,
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
function MegaMenu() {
  const { goShop, view } = useStore()
  const [open, setOpen] = useState(false)
  const timer = useRef<number>()
  const activeView = view

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const enter = () => {
    window.clearTimeout(timer.current)
    setOpen(true)
  }
  const leave = () => {
    timer.current = window.setTimeout(() => setOpen(false), 140)
  }
  const go = (target: ShopView) => {
    setOpen(false)
    goShop(target)
  }

  return (
    <div className="relative" onMouseEnter={enter} onMouseLeave={leave}>
      <button
        className={cn(
          'flex items-center gap-1 text-[13px] font-semibold transition-colors',
          open ? 'text-espresso' : 'text-cocoa hover:text-espresso',
        )}
        aria-expanded={open}
        /* mouse: hover opens, click navigates · touch: first tap opens, second navigates */
        onClick={() => (open ? go('all') : setOpen(true))}
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
               at narrow lg widths */
            className="pointer-events-none fixed inset-x-0 top-[4.25rem] z-[60] flex justify-center px-4"
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

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  useFocusTrap(menuRef, menuOpen)
  const { count, setCartOpen, view, goShop, queueSearchFocus } = useStore()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 transition-all duration-500',
          scrolled
            ? 'border-b border-line bg-cream/90 backdrop-blur-xl'
            : 'bg-cream/70 backdrop-blur-sm',
        )}
      >
        <div className="mx-auto flex h-[4.25rem] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <ShopLogo
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
                'text-[13px] font-semibold transition-colors hover:text-espresso',
                view === 'new' ? 'text-espresso underline underline-offset-8' : 'text-cocoa',
              )}
            >
              New In
            </a>
            <MegaMenu />
            <a
              href="#/shop/sale"
              onClick={(e) => {
                e.preventDefault()
                goShop('sale')
              }}
              className={cn(
                'text-[13px] font-semibold transition-colors hover:text-ember',
                view === 'sale'
                  ? 'text-ember underline underline-offset-8'
                  : 'text-terracotta-dark',
              )}
            >
              Sale
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              onClick={openSearch}
              className="flex h-10 w-10 items-center justify-center rounded-[4px] border border-espresso/15 bg-cream text-espresso transition-all hover:border-espresso/30 hover:bg-parchment"
              aria-label="Search the catalog"
            >
              <IconSearch className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={() => setCartOpen(true)}
              className="group relative flex h-10 items-center gap-2 rounded-[4px] border border-espresso/15 bg-cream px-4 text-[13px] font-semibold text-espresso transition-all hover:border-espresso/30 hover:bg-parchment"
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

            <a
              href={waLink(MSG_SHOP)}
              target="_blank"
              rel="noreferrer"
              className="hidden h-10 items-center gap-2 rounded-full bg-espresso px-4.5 text-[13px] font-semibold text-cream transition-all hover:bg-charcoal hover:shadow-pop md:flex"
            >
              <WhatsAppIcon className="h-4 w-4" />
              Message the Shop
            </a>

            <button
              onClick={() => setMenuOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-[4px] border border-espresso/15 text-espresso lg:hidden"
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
              <a
                href={waLink(MSG_SHOP)}
                target="_blank"
                rel="noreferrer"
                className="flex h-13 items-center justify-center gap-2.5 rounded-full bg-leaf py-3.5 font-semibold"
              >
                <WhatsAppIcon className="h-5 w-5" />
                Message the Shop
              </a>
              <p className="mt-4 text-center text-[11px] uppercase tracking-mega text-cream/40">
                Marigold & Clay — curated general store
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
