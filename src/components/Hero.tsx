import { motion } from 'framer-motion'
import { products } from '../data/products'
import { useStore } from '../store/StoreContext'
import { MSG_BUSINESS, productMessage, rs, waLink } from '../utils/helpers'
import {
  Badge,
  IconArrowRight,
  IconCheck,
  IconEye,
  IconSearch,
  LogoMark,
  Stars,
  WhatsAppIcon,
} from './ui'

const ease = [0.22, 1, 0.36, 1] as const

/* ── Small mockup cards for the hero cluster ───────────────────────── */

function CatalogCard() {
  const thumbs = [products[5], products[8], products[6], products[10]]
  return (
    <div
      className="floaty w-[15.5rem] rounded-3xl border border-line bg-cream p-4 shadow-card"
      style={{ '--r': '-4deg', '--t': '7.5s', transform: 'rotate(-4deg)' } as React.CSSProperties}
    >
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-mega text-taupe">Catalog</p>
        <span className="rounded-[3px] bg-parchment px-2 py-0.5 text-[10px] font-bold text-cocoa">
          25 products
        </span>
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-[4px] border border-line bg-parchment/70 px-3 py-2">
        <IconSearch className="h-3.5 w-3.5 text-taupe" />
        <span className="text-[11px] text-taupe">Search products…</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {thumbs.map((p) => (
          <div key={p.id} className="overflow-hidden rounded-xl bg-sand">
            <img src={p.image} alt="" className="aspect-square h-full w-full object-cover" loading="eager" />
            <div className="px-2 py-1.5">
              <p className="truncate text-[10px] font-semibold">{p.name}</p>
              <p className="text-[10px] font-bold text-terracotta">{rs(p.salePrice ?? p.price)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DetailCard() {
  const p = products[0]
  return (
    <div
      className="floaty w-[17.5rem] rounded-3xl border border-line bg-cream p-4 shadow-soft"
      style={{ '--r': '2deg', '--t': '6.2s', '--d': '.35s', transform: 'rotate(2deg)' } as React.CSSProperties}
    >
      <div className="relative overflow-hidden rounded-2xl bg-sand">
        <img src={p.image} alt={p.name} className="aspect-[4/3.2] w-full object-cover" loading="eager" />
        <div className="absolute left-2.5 top-2.5 flex gap-1.5">
          <Badge tone="new">New</Badge>
          <Badge tone="ok">
            <span className="h-1.5 w-1.5 bg-leaf" />
            In Stock
          </Badge>
        </div>
      </div>
      <div className="mt-3 flex items-start justify-between gap-2">
        <div>
          <p className="font-display text-lg font-medium leading-tight">{p.name}</p>
          <div className="mt-1 flex items-center gap-1.5">
            <Stars value={p.rating} />
            <span className="text-[11px] font-semibold text-taupe">{p.rating} · {p.reviews} reviews</span>
          </div>
        </div>
        <p className="font-display text-xl font-semibold text-espresso">{rs(p.price)}</p>
      </div>
      <div className="mt-3 flex gap-1.5">
        {p.sizes?.map((s) => (
          <span
            key={s}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-line text-[11px] font-bold text-cocoa first:border-espresso first:bg-espresso first:text-cream"
          >
            {s}
          </span>
        ))}
      </div>
      <a
        href={waLink(productMessage(p, 'Medium', 'Rust', 1))}
        target="_blank"
        rel="noreferrer"
        className="mt-3 flex items-center justify-center gap-2 rounded-full bg-leaf py-2.5 text-[13px] font-bold text-cream transition-transform hover:scale-[1.02] active:scale-[0.98]"
      >
        <WhatsAppIcon className="h-4 w-4" />
        Order on WhatsApp
      </a>
    </div>
  )
}

function BasketCard() {
  return (
    <div
      className="floaty w-[13.5rem] rounded-3xl border border-line bg-cream p-4 shadow-card"
      style={{ '--r': '5deg', '--t': '8.2s', '--d': '.7s', transform: 'rotate(5deg)' } as React.CSSProperties}
    >
      <p className="text-[10px] font-bold uppercase tracking-mega text-taupe">Inquiry basket</p>
      <div className="mt-3 space-y-2">
        {[
          { name: 'Linen Kurta', meta: 'M · Rust ×1', price: 3500 },
          { name: 'Matte Lip Tint', meta: 'Terracotta ×2', price: 2500 },
        ].map((l) => (
          <div key={l.name} className="flex items-center gap-2.5 rounded-2xl bg-parchment/80 p-2.5">
            <div className="h-8 w-8 shrink-0 rounded-lg bg-clay/60" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-bold">{l.name}</p>
              <p className="text-[10px] text-taupe">{l.meta}</p>
            </div>
            <p className="text-[11px] font-bold">{rs(l.price)}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-dashed border-line pt-2.5">
        <span className="text-[11px] font-semibold text-taupe">Est. total</span>
        <span className="font-display text-base font-semibold">{rs(6000)}</span>
      </div>
      <div className="mt-2 flex items-center justify-center gap-1.5 rounded-[4px] bg-espresso py-2 text-[11px] font-bold text-cream">
        <WhatsAppIcon className="h-3.5 w-3.5" />
        Send Inquiry
      </div>
    </div>
  )
}

function AdminCard() {
  return (
    <div
      className="floaty w-[19rem] rounded-3xl bg-espresso p-4 text-cream shadow-soft"
      style={{ '--r': '-2deg', '--t': '7s', '--d': '1.1s', transform: 'rotate(-2deg)' } as React.CSSProperties}
    >
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-mega text-cream/50">Admin · Today</p>
        <span className="flex items-center gap-1 rounded-[3px] bg-leaf/20 px-2 py-0.5 text-[10px] font-bold text-leaf">
          <span className="h-1.5 w-1.5 bg-leaf" />
          Live
        </span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {[
          ['Products', '248'],
          ['Low stock', '12'],
          ['Inquiries', '19'],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-cream/[0.07] p-2.5">
            <p className="font-display text-xl font-semibold">{value}</p>
            <p className="text-[10px] text-cream/55">{label}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 space-y-2">
        {[
          ['Printed Lawn 3-Piece', 'Low stock', 'text-ember'],
          ['Classic Linen Kurta', 'Published', 'text-leaf'],
        ].map(([name, status, tone]) => (
          <div key={name} className="flex items-center justify-between rounded-xl bg-cream/[0.05] px-3 py-2">
            <span className="text-[11px] font-semibold">{name}</span>
            <span className={`text-[10px] font-bold ${tone}`}>{status}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-[10px] text-cream/50">
        <IconEye className="h-3.5 w-3.5" />
        Owner edits without touching code
      </div>
    </div>
  )
}

/* ── Hero ──────────────────────────────────────────────────────────── */

export default function Hero() {
  const { goShop } = useStore()
  return (
    <section id="for-retailers" className="relative scroll-mt-16 overflow-hidden border-b border-line">
      {/* backdrop wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(52rem 32rem at 82% 8%, rgba(217,169,130,0.35), transparent 60%), radial-gradient(40rem 30rem at -8% 32%, rgba(191,91,45,0.12), transparent 55%)',
        }}
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-8 lg:py-24">
        {/* Copy */}
        <div className="lg:col-span-6 xl:col-span-6">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-5 text-[11px] font-bold uppercase tracking-mega text-taupe"
          >
            For shop owners — the platform behind the Marigold &amp; Clay demo
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
            className="flex items-center gap-2.5"
          >
            <span className="h-px w-8 bg-terracotta/60" aria-hidden />
            <LogoMark className="h-4 w-4" />
            <span className="text-[11px] font-bold uppercase tracking-mega text-terracotta-dark">
              Powered by Zarrar.Solutions
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.08, ease }}
            className="mt-6 max-w-xl font-display text-[2.85rem] font-medium leading-[1.04] tracking-tight text-espresso sm:text-6xl xl:text-[4.35rem]"
          >
            Turn your shop into a{' '}
            <span className="relative inline-block italic text-terracotta">
              premium
              <svg
                viewBox="0 0 220 12"
                className="absolute -bottom-1 left-0 w-full text-terracotta/50"
                aria-hidden
              >
                <path d="M3 9c40-5 140-7 214-3" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
              </svg>
            </span>{' '}
            online catalog.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.16, ease }}
            className="mt-6 max-w-lg text-base leading-relaxed text-cocoa"
          >
            RetailFlow helps retailers display products, prices, categories, stock status, and
            receive customer inquiries through WhatsApp — without the complexity of full
            e-commerce.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.24, ease }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <button
              onClick={() => goShop('all')}
              className="group flex h-12 items-center gap-2 rounded-full bg-terracotta px-6 text-sm font-bold text-cream shadow-pop transition-all hover:bg-terracotta-dark hover:shadow-soft active:scale-[0.98]"
            >
              Explore Demo Catalog
              <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <a
              href={waLink(MSG_BUSINESS)}
              target="_blank"
              rel="noreferrer"
              className="flex h-12 items-center gap-2 rounded-full border border-espresso/20 bg-cream/70 px-6 text-sm font-bold text-espresso backdrop-blur transition-all hover:border-espresso/40 hover:bg-parchment active:scale-[0.98]"
            >
              <WhatsAppIcon className="h-4.5 w-4.5 text-leaf" />
              Talk on WhatsApp
            </a>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.36, ease }}
            className="mt-10 flex flex-wrap gap-x-6 gap-y-2"
          >
            {[
              'No checkout complexity',
              'WhatsApp-first inquiry flow',
              'The demo store is fully live',
            ].map((t) => (
              <li key={t} className="flex items-center gap-2 text-[13px] font-semibold text-cocoa">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-leaf/15 text-leaf">
                  <IconCheck className="h-3 w-3" />
                </span>
                {t}
              </li>
            ))}
          </motion.ul>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-8 text-[11px] font-semibold uppercase tracking-mega text-taupe"
          >
            Built for boutiques · bookshops · cosmetics · gifts · stationery · local brands
          </motion.p>
        </div>

        {/* Mockup cluster — desktop */}
        <div className="relative hidden h-[620px] lg:col-span-6 lg:block xl:col-span-6">
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-terracotta/25"
          />
          <motion.div
            initial={{ opacity: 0, y: 40, rotate: -8 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease }}
            className="absolute left-0 top-14"
          >
            <CatalogCard />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 44, rotate: 6 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.9, delay: 0.45, ease }}
            className="absolute left-[13rem] top-40 z-20"
          >
            <DetailCard />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 36, rotate: 9 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.9, delay: 0.6, ease }}
            className="absolute right-2 top-0 z-10"
          >
            <BasketCard />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 36, rotate: -6 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.9, delay: 0.75, ease }}
            className="absolute bottom-0 right-10 z-30"
          >
            <AdminCard />
          </motion.div>
        </div>

        {/* Mobile condensed cluster */}
        <div className="relative lg:hidden">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease }}
            className="relative mx-auto max-w-sm"
          >
            <DetailCard />
            <div className="absolute -right-3 -top-6 z-10 scale-[0.82]">
              <BasketCard />
            </div>
            <div className="mt-4">
              <AdminCard />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
