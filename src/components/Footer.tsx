import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { CATEGORIES, useStore, type ShopView } from '../store/StoreContext'
import { cn, MSG_SHOP, waLink } from '../utils/helpers'
import { IconArrowUpRight, IconBag, ShopLogo, WhatsAppIcon } from './ui'

interface FootLink {
  label: string
  run: () => void
}

export function Footer() {
  const { goShop } = useStore()

  const shop = (view: ShopView, anchor?: string) => () => goShop(view, anchor)

  const COLUMNS: { title: string; links: FootLink[] }[] = [
    {
      title: 'Shop',
      links: [
        { label: 'Shop All', run: shop('all') },
        { label: 'New Arrivals', run: shop('new') },
        { label: 'Sale', run: shop('sale') },
      ],
    },
    {
      title: 'Racks',
      links: CATEGORIES.map((c) => ({ label: c, run: shop(c) })),
    },
    {
      title: 'The Store',
      links: [
        { label: 'Store Policies', run: shop('home', 'policies') },
        { label: 'The Autumn Edit', run: shop('sale') },
      ],
    },
  ]


  return (
    <footer className="bg-espresso text-cream">
      <div className="mx-auto max-w-7xl px-4 pb-28 pt-16 sm:px-6 md:pb-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <ShopLogo
              dark
              href="#/shop"
              onClick={(e) => {
                e.preventDefault()
                goShop('home')
              }}
            />
            <p className="mt-5 max-w-sm font-display text-2xl font-light italic leading-snug text-cream/85">
              “Everyday goods, chosen with care — browse the catalog, order on WhatsApp.”
            </p>
            <a
              href={waLink(MSG_SHOP)}
              target="_blank"
              rel="noreferrer"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-leaf px-5 py-2.5 text-[13px] font-bold text-cream transition-opacity hover:opacity-90"
            >
              <WhatsAppIcon className="h-4 w-4" />
              Message the Shop
            </a>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="text-[11px] font-bold uppercase tracking-mega text-clay">{col.title}</p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <button
                        onClick={l.run}
                        className="group flex items-center gap-1 text-sm text-cream/70 transition-colors hover:text-cream"
                      >
                        {l.label}
                        <IconArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                      </button>
                    </li>
                  ))}
                  {col.title === 'The Store' && (
                    <>
                      <li className="text-sm text-cream/45">Saddar, Rawalpindi</li>
                      <li className="text-sm text-cream/45">Mon–Sat · 11am–9pm</li>
                    </>
                  )}
                </ul>
              </div>
            ))}          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-cream/10 pt-6 text-[12px] text-cream/45 sm:flex-row">
          <p>
            <span className="font-semibold text-cream/70">Marigold &amp; Clay</span> — demo
            storefront
          </p>
          <p className="text-center">
            <span className="font-semibold text-cream/70">RetailFlow</span> by Zarrar.Solutions ·
            Websites · Catalog Systems · Booking Systems · Automation
          </p>
          <p>{new Date().getFullYear()}</p>
        </div>
      </div>
    </footer>
  )
}

/* ── Sticky mobile bar + floating desktop button — follow the page ─── */

export function StickyCTA() {
  const [show, setShow] = useState(false)
  const { count, setCartOpen, goShop } = useStore()

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 480)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {/* mobile bottom bar */}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ y: 90 }}
            animate={{ y: 0 }}
            exit={{ y: 90 }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className="fixed inset-x-0 bottom-0 z-[60] border-t border-line bg-cream/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl md:hidden"
          >
            <div className="flex items-center gap-2.5">
                <button
                  onClick={() => goShop('all')}
                  className="flex h-11 flex-1 items-center justify-center rounded-full border border-espresso/20 text-[13px] font-bold text-espresso"
                >
                  Shop Catalog
                </button>
                <button
                  onClick={() => setCartOpen(true)}
                  className="relative flex h-11 w-13 items-center justify-center rounded-full border border-espresso/20 text-espresso"
                  aria-label="Open inquiry basket"
                >
                  <IconBag className="h-5 w-5" />
                  {count > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-[2px] bg-terracotta px-1 text-[10px] font-bold text-cream">
                      {count}
                    </span>
                  )}
                </button>
                <a
                  href={waLink(MSG_SHOP)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-leaf text-[13px] font-bold text-cream shadow-pop"
                >
                  <WhatsAppIcon className="h-4.5 w-4.5" />
                  WhatsApp
                </a>
              </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* desktop floating button */}
      <AnimatePresence>
        {show && (
          <motion.a
            initial={{ opacity: 0, scale: 0.6, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 16 }}
            href={waLink(MSG_SHOP)}
            target="_blank"
            rel="noreferrer"
            aria-label="Message the shop on WhatsApp"
            className={cn(
              'fixed bottom-7 right-7 z-[60] hidden h-14 w-14 items-center justify-center rounded-full bg-leaf text-cream shadow-soft transition-transform hover:scale-105 md:flex',
            )}
          >
            <WhatsAppIcon className="h-6 w-6" />
            <span className="absolute -left-1 -top-1 flex h-3.5 w-3.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-leaf opacity-50" />
              <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-cream bg-leaf" />
            </span>
          </motion.a>
        )}
      </AnimatePresence>
    </>
  )
}
