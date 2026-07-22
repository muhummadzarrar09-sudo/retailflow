import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { priceOf, products } from '../data/products'
import { cn, rs } from '../utils/helpers'
import {
  Badge,
  IconBox,
  IconCheck,
  IconChart,
  IconChevronDown,
  IconEdit,
  IconMessage,
  IconPlus,
  IconSearch,
  IconSparkle,
  Reveal,
  SectionHeading,
  WhatsAppIcon,
} from './ui'

type Tab = 'Overview' | 'Products' | 'Inquiries' | 'Edit Product'
const TABS: Tab[] = ['Overview', 'Products', 'Inquiries', 'Edit Product']

const STATS = [
  { icon: IconBox, label: 'Total products', value: '248', delta: '+12 this month', tone: 'text-espresso' },
  { icon: IconSparkle, label: 'Low stock', value: '12', delta: 'needs restock', tone: 'text-ember' },
  { icon: IconMessage, label: 'New inquiries', value: '19', delta: '6 today', tone: 'text-leaf' },
  { icon: IconChart, label: 'Featured', value: '8', delta: 'on homepage', tone: 'text-terracotta-dark' },
]

const INQUIRIES = [
  { name: 'Ayesha K.', items: 'Linen Kurta — M · Rust ×1', total: 3500, age: '12 min ago', status: 'New' },
  { name: 'Bilal R.', items: 'Oud Perfume Set ×1, Matte Lip Tint ×2', total: 6250, age: '40 min ago', status: 'New' },
  { name: 'Mahnoor S.', items: 'Printed Lawn 3-Piece — L ×1', total: 3950, age: '2 hrs ago', status: 'Replied' },
  { name: 'Hassan A.', items: 'Gift Box Hamper ×2', total: 10000, age: '5 hrs ago', status: 'Confirmed' },
]

const STATUS_TONE: Record<string, string> = {
  New: 'bg-terracotta/15 text-terracotta-dark',
  Replied: 'bg-clay/25 text-cocoa',
  Confirmed: 'bg-leaf/15 text-leaf',
}

function StatusPill({ status }: { status: string }) {
  return (
    <span className={cn('rounded-[3px] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em]', STATUS_TONE[status] ?? 'bg-parchment text-cocoa')}>
      {status}
    </span>
  )
}

/* ── panels ────────────────────────────────────────────────────────── */

function Overview() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="rounded-2xl border border-line bg-parchment/50 p-4">
            <div className="flex items-center justify-between">
              <s.icon className="h-4.5 w-4.5 text-terracotta" />
            </div>
            <p className={cn('mt-3 font-display text-3xl font-semibold', s.tone)}>{s.value}</p>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-taupe">{s.label}</p>
            <p className="mt-1 text-[11px] font-semibold text-cocoa/70">{s.delta}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-5">
        <div className="rounded-2xl border border-line p-4 lg:col-span-3">
          <div className="flex items-center justify-between">
            <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-taupe">
              Recent WhatsApp inquiries
            </p>
            <span className="text-[11px] font-bold text-terracotta-dark">Live feed</span>
          </div>
          <ul className="mt-3 divide-y divide-line">
            {INQUIRIES.map((q) => (
              <li key={q.name} className="flex items-center gap-3 py-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-espresso font-display text-sm italic text-cream">
                  {q.name[0]}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold text-espresso">
                    {q.name} <span className="font-semibold text-taupe">· {q.age}</span>
                  </p>
                  <p className="truncate text-[12px] text-cocoa">{q.items}</p>
                </div>
                <span className="hidden font-display text-sm font-semibold sm:block">{rs(q.total)}</span>
                <StatusPill status={q.status} />
                <WhatsAppIcon className="h-4 w-4 shrink-0 text-leaf" />
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-line p-4 lg:col-span-2">
          <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-taupe">Low stock watchlist</p>
          <ul className="mt-3 space-y-2.5">
            {products
              .filter((p) => p.stock === 'low-stock')
              .map((p) => (
                <li key={p.id} className="flex items-center gap-3 rounded-xl bg-claylight/40 p-2.5">
                  <img src={p.image} alt="" className="h-9 w-9 rounded-lg object-cover" loading="lazy" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-bold">{p.name}</p>
                    <p className="text-[11px] text-taupe">{p.category}</p>
                  </div>
                  <Badge tone="low">Low</Badge>
                </li>
              ))}
            <li className="rounded-xl border border-dashed border-taupe/40 p-3 text-center text-[11px] font-semibold text-taupe">
              Restock reminders keep availability honest
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function ProductsPanel() {
  const [featured, setFeatured] = useState<Record<string, boolean>>(
    Object.fromEntries(products.map((p) => [p.id, !!p.featured])),
  )
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 rounded-[4px] bg-parchment/80 px-3.5 py-2">
          <IconSearch className="h-3.5 w-3.5 text-taupe" />
          <span className="text-[12px] text-taupe">Search 248 products…</span>
        </div>
        <span className="flex items-center gap-1.5 rounded-[4px] bg-espresso px-4 py-2 text-[12px] font-bold text-cream">
          <IconPlus className="h-3.5 w-3.5" />
          Add product
        </span>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-line">
        {products.slice(0, 6).map((p, i) => (
          <div
            key={p.id}
            className={cn(
              'flex items-center gap-3 bg-cream px-4 py-3',
              i !== 0 && 'border-t border-line',
            )}
          >
            <img src={p.image} alt="" className="h-11 w-11 rounded-xl object-cover" loading="lazy" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-bold text-espresso">{p.name}</p>
              <p className="text-[11px] text-taupe">{p.category}</p>
            </div>
            <span className="hidden font-display text-sm font-semibold sm:block">{rs(priceOf(p))}</span>
            <span
              className={cn(
                'hidden items-center gap-1.5 rounded-[3px] border px-3 py-1.5 text-[11px] font-bold sm:flex',
                p.stock === 'in-stock'
                  ? 'border-leaf/30 bg-leaf/10 text-leaf'
                  : 'border-ember/30 bg-ember/10 text-ember',
              )}
            >
              {p.stock === 'in-stock' ? 'Available' : 'Low stock'}
              <IconChevronDown className="h-3 w-3" />
            </span>
            <button
              onClick={() => setFeatured((f) => ({ ...f, [p.id]: !f[p.id] }))}
              aria-label={`Toggle featured for ${p.name}`}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full transition-colors',
                featured[p.id] ? 'text-terracotta' : 'text-line hover:text-taupe',
              )}
            >
              <IconSparkle className="h-4.5 w-4.5" />
            </button>
            <IconEdit className="h-4 w-4 shrink-0 text-taupe" />
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-taupe">
        Status controls, featured toggles and edit — no code, no developer needed for daily changes.
      </p>
    </div>
  )
}

function InquiriesPanel() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {INQUIRIES.map((q) => (
        <div key={q.name} className="rounded-2xl border border-line bg-parchment/40 p-4">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-sm font-bold text-espresso">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-espresso font-display text-xs italic text-cream">
                {q.name[0]}
              </span>
              {q.name}
            </p>
            <StatusPill status={q.status} />
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-cocoa">{q.items}</p>
          <div className="mt-3 flex items-center justify-between border-t border-dashed border-line pt-3">
            <span className="text-[11px] font-semibold text-taupe">{q.age}</span>
            <span className="font-display text-base font-semibold">{rs(q.total)}</span>
          </div>
          <div className="mt-3 flex items-center justify-center gap-1.5 rounded-[4px] bg-leaf/10 py-2 text-[12px] font-bold text-leaf">
            <WhatsAppIcon className="h-3.5 w-3.5" />
            Reply in WhatsApp
          </div>
        </div>
      ))}
    </div>
  )
}

function EditPanel() {
  const p = products[0]
  const [stock, setStock] = useState(true)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!saved) return
    const t = window.setTimeout(() => setSaved(false), 2200)
    return () => window.clearTimeout(t)
  }, [saved])

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-mega text-taupe">Product name</p>
          <div className="mt-1.5 rounded-xl border border-line bg-cream px-3.5 py-2.5 text-sm font-semibold">
            {p.name}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-mega text-taupe">Price (PKR)</p>
            <div className="mt-1.5 rounded-xl border border-line bg-cream px-3.5 py-2.5 text-sm font-semibold">
              3,500
            </div>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-mega text-taupe">Category</p>
            <div className="mt-1.5 flex items-center justify-between rounded-xl border border-line bg-cream px-3.5 py-2.5 text-sm font-semibold">
              Clothing
              <IconChevronDown className="h-3.5 w-3.5 text-taupe" />
            </div>
          </div>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-mega text-taupe">Sizes</p>
          <div className="mt-1.5 flex gap-2">
            {p.sizes?.map((s) => (
              <span key={s} className="rounded-lg border border-line bg-parchment px-3 py-1.5 text-[12px] font-bold">
                {s}
              </span>
            ))}
            <span className="flex items-center rounded-lg border border-dashed border-taupe/50 px-3 text-taupe">
              <IconPlus className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-line bg-parchment/50 px-4 py-3">
          <div>
            <p className="text-sm font-bold text-espresso">Marked as available</p>
            <p className="text-[11px] text-taupe">Toggle off the moment it sells out</p>
          </div>
          <button
            onClick={() => setStock(!stock)}
            aria-label="Toggle stock status"
            className={cn(
              'relative h-7 w-12 rounded-full transition-colors',
              stock ? 'bg-leaf' : 'bg-taupe/40',
            )}
          >
            <span
              className={cn(
                'absolute top-1 h-5 w-5 rounded-full bg-cream transition-all',
                stock ? 'left-6' : 'left-1',
              )}
            />
          </button>
        </div>
        <button
          onClick={() => setSaved(true)}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-bold transition-all',
            saved ? 'bg-leaf text-cream' : 'bg-espresso text-cream hover:bg-charcoal',
          )}
        >
          {saved ? (
            <>
              <IconCheck className="h-4.5 w-4.5" />
              Changes saved
            </>
          ) : (
            'Save changes'
          )}
        </button>
      </div>

      {/* live preview */}
      <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-parchment/40 p-6">
        <p className="mb-4 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-mega text-taupe">
          <IconSparkle className="h-3.5 w-3.5" />
          Live storefront preview
        </p>
        <div className="w-56">
          <div className="relative overflow-hidden rounded-2xl">
            <img src={p.image} alt="" className="aspect-[4/5] w-full object-cover" />
            <div className="absolute left-2 top-2">
              {stock ? <Badge tone="ok">Available</Badge> : <Badge tone="sale">Sold out</Badge>}
            </div>
          </div>
          <p className="mt-2.5 font-display text-lg font-medium">{p.name}</p>
          <p className={cn('text-sm font-semibold', stock ? 'text-espresso' : 'text-taupe line-through')}>
            {rs(p.price)}
          </p>
        </div>
      </div>
    </div>
  )
}

/* ── section ───────────────────────────────────────────────────────── */

export default function AdminPreview() {
  const [tab, setTab] = useState<Tab>('Overview')

  return (
    <section id="admin" className="scroll-mt-24 border-b border-espresso bg-espresso text-cream">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="grid items-end gap-8 lg:grid-cols-2">
          <Reveal>
            <SectionHeading
              dark
              eyebrow="For the Owner"
              title={
                <>
                  Behind the catalog:{' '}
                  <span className="italic text-clay">simple management.</span>
                </>
              }
            />
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-sm leading-relaxed text-sand/80 lg:pb-1">
              RetailFlow can include an admin dashboard so business owners or staff can manage
              products, stock status, and inquiries without touching code. Update a price at the
              counter, mark a size sold out from your phone, watch inquiries land in real time.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.12}>
          <div className="mt-10 rounded-[1.75rem] border border-cream/15 bg-[#241B14] p-2.5 shadow-soft">
            {/* window chrome */}
            <div className="flex items-center justify-between px-3 pb-2.5 pt-1.5">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-[2px] bg-ember/80" />
                <span className="h-2.5 w-2.5 rounded-[2px] bg-clay/80" />
                <span className="h-2.5 w-2.5 rounded-[2px] bg-leaf/80" />
              </div>
              <div className="flex items-center gap-2 rounded-[4px] bg-cream/[0.06] px-3.5 py-1 text-[11px] text-cream/60">
                <IconChart className="h-3 w-3" />
                admin.yourshop.com
              </div>
              <Badge tone="sale" className="bg-terracotta/25 text-clay">
                Demo preview
              </Badge>
            </div>

            {/* tabs */}
            <div className="no-scrollbar flex gap-1.5 overflow-x-auto border-t border-cream/10 px-3 pb-2.5 pt-3">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    'whitespace-nowrap rounded-[3px] px-4 py-2 text-[12px] font-bold transition-all',
                    tab === t
                      ? 'bg-cream text-espresso'
                      : 'bg-cream/[0.06] text-cream/60 hover:bg-cream/[0.12] hover:text-cream',
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* panel */}
            <div className="rounded-3xl bg-cream p-4 text-charcoal sm:p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  {tab === 'Overview' && <Overview />}
                  {tab === 'Products' && <ProductsPanel />}
                  {tab === 'Inquiries' && <InquiriesPanel />}
                  {tab === 'Edit Product' && <EditPanel />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <p className="mt-6 text-center text-[12px] text-cream/45">
            Interactive preview — figures shown are illustrative for the demo. Available in the
            Professional package.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
