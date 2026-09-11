import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { priceOf, products, type Category, type Product } from '../data/products'
import { useStore } from '../store/StoreContext'
import { MSG_SHOP, rs, waLink } from '../utils/helpers'
import {
  IconArrowRight,
  IconCheck,
  IconChevronDown,
  IconClock,
  IconShield,
  Reveal,
  SectionHeading,
  WhatsAppIcon,
} from './ui'
import { ProductCard } from './ProductCard'

const ease = [0.22, 1, 0.36, 1] as const

/* ── masked-line headline reveal (brand campaign style) ────────────── */

function MaskedLine({
  children,
  delay = 0,
  play = true,
}: {
  children: React.ReactNode
  delay?: number
  play?: boolean
}) {
  return (
    <span className="block overflow-hidden pb-[0.08em]">
      <motion.span
        className="block"
        initial={{ y: '112%' }}
        animate={play ? { y: '0%' } : { y: '112%' }}
        transition={{ duration: 0.9, delay, ease }}
      >
        {children}
      </motion.span>
    </span>
  )
}

/* ── Campaign hero — the landing stage ───────────────────────────────
   A background slideshow of the new/featured picks woven with the
   campaign stills, over solid espresso with text-safe scrims. A plain
   100svh stage: no pinning, no scroll choreography — the hero scrolls
   away like any other section and the text stays put. */

const HERO_SLIDES: { src: string; alt: string }[] = (() => {
  const picks = products.filter((p) => p.isNew || p.featured)
  const campaign = [
    'campaign-hero',
    'campaign-craft',
    'campaign-sale',
    'campaign-flatlay',
    'campaign-look',
  ]
  const slides: { src: string; alt: string }[] = []
  for (let i = 0; i < Math.max(picks.length, campaign.length); i++) {
    if (i < picks.length) slides.push({ src: picks[i].image, alt: picks[i].name })
    if (i < campaign.length)
      slides.push({ src: `/products/${campaign[i]}.jpg`, alt: 'Marigold & Clay campaign still' })
  }
  return slides
})()

const SLIDE_MS = 4500
const SLIDE_FADE = 1.05

function HeroSlideshow({ ready }: { ready: boolean }) {
  const reduce = useReducedMotion()
  const [idx, setIdx] = useState(0)

  // advance only after the curtain lifts; reduced motion = a single still
  useEffect(() => {
    if (reduce || !ready) return
    if (HERO_SLIDES.length < 2) return
    const t = window.setInterval(() => setIdx((i) => (i + 1) % HERO_SLIDES.length), SLIDE_MS)
    return () => window.clearInterval(t)
  }, [reduce, ready])

  /* mount only a sliding window — the current slide, the next one (so it's
   * decoding before its entrance) and the previous one (so the crossfade has
   * something to dissolve from). Every slide is a full-viewport JPG; mounting
   * all ~15 up front pulled megabytes nobody could see yet. */
  const n = HERO_SLIDES.length

  return (
    <div aria-hidden className="absolute inset-0">
      {HERO_SLIDES.map((slide, i) => {
        const inWindow = i === idx || i === (idx + 1) % n || (idx > 0 && i === idx - 1)
        if (!inWindow) return <div key={slide.src} className="absolute inset-0" />
        return (
          <motion.div
            key={slide.src}
            className="absolute inset-0"
            initial={false}
            animate={{ opacity: i === idx ? 1 : 0 }}
            transition={{ duration: SLIDE_FADE, ease: [0.4, 0, 0.2, 1] }}
          >
            <img
              src={slide.src}
              alt=""
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
              draggable={false}
              className="h-full w-full object-cover object-center"
            />
          </motion.div>
        )
      })}
    </div>
  )
}

export function CampaignHero({ ready = true }: { ready?: boolean }) {
  const { goShop } = useStore()
  const reduce = useReducedMotion()

  return (
    <section
      id="top"
      /* pulled up under the floating header — the canvas reaches the very
         top of the document, so nothing pale peeks behind the pill.
         At least one viewport tall and unpinned: on short viewports
         (foldable cover screens, split-pane landscape) the stage grows
         with its content instead of clipping the CTAs, and content below
         follows immediately in normal document flow. */
      className="relative -mt-[4.25rem] bg-espresso"
    >
      <div className="relative overflow-hidden">
        <HeroSlideshow ready={ready} />

        {/* owner spec — the photo stays bright, no flat overlay:
            a radial pool lives ONLY behind the text block, and the bottom
            third carries a scrim for the action row; the top of every
            slide stays clean and undarkened */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 70%)',
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(0deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.26) 16%, rgba(0,0,0,0) 34%)',
          }}
        />

        {/* stage text — season slogan · headline · exactly two actions.
            In flow with min-h-100svh (the stage's height-giver): centered
            exactly as before when the viewport is tall enough, growing the
            stage on short foldable/split screens so nothing clips.
            Short-height variants densify the rhythm and push the block
            below the floating nav zone. Entrance choreography only; the
            block never reacts to scroll. */}
        <div className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center px-4 text-center [@media(max-height:560px)]:pb-12 [@media(max-height:560px)]:pt-[7.25rem]">
          <motion.p
            initial={{ opacity: 0 }}
            animate={ready ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.42 }}
            className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-mega text-[#F5E9DC]/80"
            style={{ textShadow: '0 2px 24px rgba(0,0,0,0.55), 0 1px 4px rgba(0,0,0,0.4)' }}
          >
            <span className="h-px w-6 bg-clay/80" aria-hidden />
            Marigold &amp; Clay · Season 04 — Rawalpindi
            <span className="h-px w-6 bg-clay/80" aria-hidden />
          </motion.p>

          <h1
            className="mt-6 max-w-3xl font-display text-[12.5vw] font-medium leading-[1.02] tracking-tight text-[#F5E9DC] sm:text-6xl lg:text-[4.6rem] [@media(max-height:560px)]:mt-4"
            style={{ textShadow: '0 2px 24px rgba(0,0,0,0.55), 0 1px 4px rgba(0,0,0,0.4)' }}
          >
            <MaskedLine delay={0.52} play={ready}>
              Dress like the
            </MaskedLine>
            <MaskedLine delay={0.64} play={ready}>
              <span className="italic text-claylight">season</span> feels.
            </MaskedLine>
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
            transition={{ duration: 0.8, delay: 0.95, ease }}
            className="mt-9 flex flex-wrap items-center justify-center gap-3 [@media(max-height:560px)]:mt-5"
          >
            <button
              onClick={() => goShop('all')}
              className="group flex h-12 items-center gap-2 rounded-full bg-cream px-7 text-sm font-bold text-espresso shadow-pop transition-all hover:bg-sand active:scale-[0.98]"
            >
              Enter the Store
              <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              onClick={() => goShop('sale')}
              className="flex h-12 items-center gap-2 rounded-full bg-terracotta px-7 text-sm font-bold text-cream shadow-[0_4px_20px_rgba(0,0,0,0.25)] transition-all hover:bg-terracotta-dark active:scale-[0.98]"
            >
              The Autumn Edit
            </button>
          </motion.div>
        </div>

        {/* scroll cue — static within the stage; hidden on short viewports
            where the vertical budget belongs to the message */}
        <div
          className="absolute bottom-7 left-1/2 z-10 hidden -translate-x-1/2 sm:block [@media(max-height:560px)]:hidden"
          aria-hidden
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={ready ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 1.5, duration: 0.7 }}
          >
            <motion.span
              animate={reduce ? undefined : { y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-cream/30 text-cream/70"
            >
              <IconChevronDown className="h-4 w-4" />
            </motion.span>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ── lead-in — the hero's promise lands just past the fold ─────────── */

export function LeadIn() {
  return (
    <section className="border-b border-line bg-parchment/60">
      <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:py-14">
        <Reveal>
          <p className="text-[11px] font-bold uppercase tracking-mega text-taupe">The Promise</p>
          <p className="mt-4 font-display text-2xl font-light italic leading-snug text-espresso sm:text-3xl">
            “Embroidered lawn, soft cotton and hand-finished goods — curated in Rawalpindi.
            Browse the racks, then order in one clean WhatsApp message.”
          </p>
        </Reveal>
      </div>
    </section>
  )
}

/* ── Category tiles — broken editorial grid ────────────────────────── */

export const TILES: { name: Category; image: string }[] = [
  { name: 'Clothing', image: '/products/embroidered-2-piece-suit.jpg' },
  { name: 'Accessories', image: '/products/leather-crossbody-bag.jpg' },
  { name: 'Footwear', image: '/products/suede-penny-loafers.jpg' },
  { name: 'Stationery', image: '/products/premium-notebook-set.jpg' },
  { name: 'Cosmetics', image: '/products/oud-perfume-set.jpg' },
  { name: 'Gifts', image: '/products/gift-box-hamper.jpg' },
]

export function CategoryTiles() {
  const { goShop } = useStore()
  return (
    <section id="categories" className="scroll-mt-24 border-b border-line">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <Reveal>
          <div className="flex items-end justify-between gap-6">
            <SectionHeading
              eyebrow="Shop by Category"
              title={
                <>
                  Every rack, <span className="italic text-terracotta">curated.</span>
                </>
              }
            />
            <button
              onClick={() => goShop('all')}
              className="group hidden items-center gap-1.5 text-sm font-bold text-terracotta-dark sm:flex"
            >
              View everything
              <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </Reveal>

        <div className="mt-12 grid grid-cols-2 gap-3 pb-2 sm:gap-5 sm:pb-16 lg:grid-cols-3">
          {TILES.map((t, i) => {
            const count = products.filter((p) => p.category === t.name).length
            const lift = i % 3 === 1 ? 'lg:translate-y-12' : i % 3 === 2 ? 'lg:translate-y-6' : ''
            return (
              <Reveal key={t.name} delay={i * 0.05} className={lift}>
                <button
                  onClick={() => goShop(t.name)}
                  className="group relative block w-full overflow-hidden rounded-3xl bg-sand text-left"
                >
                  <img
                    src={t.image}
                    alt={t.name}
                    loading="lazy"
                    className="aspect-[3/4] w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.06]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-espresso/70 via-transparent to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-3">
                    <div>
                      <p className="font-display text-2xl font-medium text-cream">{t.name}</p>
                      <p className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.14em] text-cream/65">
                        {count} {count === 1 ? 'piece' : 'pieces'}
                      </p>
                    </div>
                    <span className="mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cream/40 text-cream opacity-0 transition-all duration-300 group-hover:opacity-100">
                      <IconArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </button>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ── New arrivals — horizontal snap rail ───────────────────────────── */

export function NewArrivalsRail() {
  const { goShop } = useStore()
  const railRef = useRef<HTMLDivElement>(null)
  const fresh = products.filter((p) => p.isNew)
  const nudge = (dir: number) =>
    railRef.current?.scrollBy({ left: dir * 340, behavior: 'smooth' })

  return (
    <section className="border-b border-line bg-parchment/60">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <Reveal>
          <div className="flex items-end justify-between gap-6">
            <SectionHeading
              eyebrow="Just Landed"
              title={
                <>
                  New in, <span className="italic text-terracotta">this week.</span>
                </>
              }
            />
            <div className="flex items-center gap-2">
              <button
                onClick={() => goShop('new')}
                className="group mr-2 hidden items-center gap-1.5 text-sm font-bold text-terracotta-dark sm:flex"
              >
                All new arrivals
                <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <button
                onClick={() => nudge(-1)}
                aria-label="Scroll new arrivals back"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-espresso/15 text-espresso transition-colors hover:border-espresso/40"
              >
                <IconArrowRight className="h-4 w-4 rotate-180" />
              </button>
              <button
                onClick={() => nudge(1)}
                aria-label="Scroll new arrivals forward"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-espresso/15 text-espresso transition-colors hover:border-espresso/40"
              >
                <IconArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </Reveal>

        <div
          ref={railRef}
          className="no-scrollbar -mx-4 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
        >
          {fresh.map((p, i) => (
            <div key={p.id} className="w-[15.5rem] shrink-0 snap-start sm:w-[16.5rem]">
              <ProductCard p={p} index={i} />
            </div>
          ))}
          {/* end card — view all */}
          <button
            onClick={() => goShop('new')}
            className="group flex w-[10rem] shrink-0 snap-start flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-espresso/20 text-espresso transition-colors hover:border-terracotta/50 hover:text-terracotta-dark"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-current">
              <IconArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-0.5" />
            </span>
            <span className="px-4 text-center text-[12px] font-bold">View all new arrivals</span>
          </button>
        </div>
      </div>
    </section>
  )
}

/* ── Craft stats ─────────────────────────────────────────────────────
   Numbers are derived from the live catalog so they can never drift
   from reality, and they count up once they scroll into view. */

function useCountUp(target: number, duration = 1400) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const reduce = useReducedMotion()
  const [n, setN] = useState(0)

  useEffect(() => {
    if (!inView) return
    if (reduce) {
      setN(target)
      return
    }
    let raf = 0
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration)
      setN(Math.round(target * (1 - Math.pow(1 - p, 3)))) // ease-out cubic
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, target, duration, reduce])

  // reduced-motion users get the final figure immediately, no ticking
  return { ref, value: reduce && !inView ? target : n }
}

function StatNumber({ target }: { target: number }) {
  const { ref, value } = useCountUp(target)
  return (
    <span ref={ref} className="tabular-nums">
      {value}
    </span>
  )
}

export function CraftStats() {
  const totalPieces = products.length
  const rackCount = new Set(products.map((p) => p.category)).size

  const stats: { idx: string; label: string; hint: string; target?: number; text?: string }[] = [
    {
      idx: '01',
      target: totalPieces,
      label: 'Curated pieces',
      hint: 'Each one inspected on the table before it reaches the rail.',
    },
    {
      idx: '02',
      target: rackCount,
      label: 'Category racks',
      hint: 'Clothing rail to gift shelf — six ways into the store.',
    },
    {
      idx: '03',
      text: '24–48h',
      label: 'Dispatch window',
      hint: 'Packed once your order is confirmed in chat.',
    },
  ]

  return (
    <dl className="mt-10 grid divide-y divide-line overflow-hidden rounded-2xl border border-line bg-parchment/60 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      {stats.map((s) => (
        <div key={s.idx} className="flex flex-col px-5 py-5 sm:px-6 sm:py-6">
          <span className="font-display text-[12px] font-semibold italic text-terracotta">
            {s.idx}
          </span>
          <dt className="order-3 mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-taupe">
            {s.label}
          </dt>
          <dd className="order-2 mt-2.5 font-display text-4xl font-semibold tracking-tight text-espresso">
            {s.target != null ? <StatNumber target={s.target} /> : s.text}
          </dd>
          <p className="order-4 mt-2 text-[12px] leading-relaxed text-cocoa/75">{s.hint}</p>
        </div>
      ))}
    </dl>
  )
}

/* ── The craft — heritage split editorial ──────────────────────────── */

export function CraftSplit() {
  const { goShop } = useStore()
  return (
    <section className="border-b border-line">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
        <Reveal>
          <div className="relative">
            <div className="overflow-hidden rounded-4xl">
              <img
                src="/products/campaign-craft.jpg"
                alt="Hands embroidering golden zari thread onto terracotta fabric"
                loading="lazy"
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-5 left-6 border-l-2 border-terracotta bg-espresso px-4 py-3 shadow-card">
              <p className="text-[10px] font-bold uppercase tracking-mega text-clay">Atelier</p>
              <p className="font-display text-sm font-semibold text-cream">
                Hand zari — Rawalpindi
              </p>
            </div>
          </div>
        </Reveal>

        <div>
          <Reveal>
            <SectionHeading
              eyebrow="The Craft"
              title={
                <>
                  Stitched slowly, <span className="italic text-terracotta">on purpose.</span>
                </>
              }
              copy="Every piece on these racks is chosen by hand — checked for fabric, fall and finish before it earns a place in the store. What you see online is what's folded on the shelf, priced honestly, and confirmed on WhatsApp before dispatch."
            />
          </Reveal>

          <Reveal delay={0.1}>
            <CraftStats />
          </Reveal>

          <Reveal delay={0.16}>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <button
                onClick={() => goShop('all')}
                className="group flex h-12 items-center gap-2 rounded-full bg-espresso px-6 text-sm font-bold text-cream transition-all hover:bg-charcoal hover:shadow-pop active:scale-[0.98]"
              >
                Browse the Catalog
                <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <a
                href={waLink(MSG_SHOP)}
                target="_blank"
                rel="noreferrer"
                className="flex h-12 items-center gap-2 rounded-full border border-espresso/20 px-6 text-sm font-bold text-espresso transition-all hover:border-espresso/40 hover:bg-parchment active:scale-[0.98]"
              >
                <WhatsAppIcon className="h-4.5 w-4.5 text-leaf" />
                Ask about a piece
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/* ── The Autumn Edit — full-bleed campaign banner ──────────────────── */

export function EditorialBanner() {
  const { goShop } = useStore()
  const saleCount = products.filter((p) => p.salePrice).length
  const reduce = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])

  return (
    <section
      id="autumn-edit"
      ref={ref}
      className="relative overflow-hidden border-b border-line bg-espresso"
    >
      <motion.div aria-hidden className="absolute -inset-y-[10%] inset-x-0" style={reduce ? undefined : { y }}>
        <img
          src="/products/campaign-sale.jpg"
          alt=""
          className="h-full w-full object-cover object-center"
        />
      </motion.div>
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-espresso/80 via-espresso/45 to-espresso/10"
      />

      <div className="relative mx-auto flex min-h-[32rem] max-w-7xl items-center px-4 py-20 sm:px-6 lg:min-h-[36rem] lg:px-8">
        <div className="max-w-xl">
          <Reveal>
            <p className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-mega text-clay">
              <span className="h-px w-8 bg-clay/70" aria-hidden />
              The Autumn Edit
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="mt-5 font-display text-4xl font-medium leading-[1.04] tracking-tight text-cream sm:text-5xl lg:text-6xl">
              Warm tones, <span className="italic text-clay">softer prices.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-cream/75 sm:text-base">
              Selected lawn, cotton and everyday pieces at up to 19% off — while your size is
              still on the rack. Confirm availability on WhatsApp before you come in.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                onClick={() => goShop('sale')}
                className="group flex h-12 items-center gap-2 rounded-full bg-terracotta px-7 text-sm font-bold text-cream shadow-pop transition-all hover:bg-terracotta-dark active:scale-[0.98]"
              >
                Shop the Sale
                <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <span className="text-[12px] font-semibold text-cream/60">
                {saleCount} products marked down
              </span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/* ── Texture break — flat-lay interlude with the brand line ────────── */

export function TextureBreak() {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div aria-hidden className="absolute inset-0">
        <img
          src="/products/campaign-flatlay.jpg"
          alt=""
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-espresso/55" />
      </div>
      <div className="relative mx-auto flex min-h-[18rem] max-w-4xl flex-col items-center justify-center px-4 py-20 text-center sm:min-h-[22rem]">
        <Reveal>
          <p className="font-display text-3xl font-light italic leading-snug tracking-tight text-cream sm:text-5xl">
            “Everyday goods, chosen with care.”
          </p>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mt-5 text-[11px] font-bold uppercase tracking-mega text-cream/60">
            The Marigold &amp; Clay promise
          </p>
        </Reveal>
      </div>
    </section>
  )
}

/* ── Lookbook strip — campaign + shopable stills ───────────────────── */

function LookCard({
  image,
  label,
  meta,
  onOpen,
  tall = false,
}: {
  image: string
  label: string
  meta: string
  onOpen?: () => void
  tall?: boolean
}) {
  return (
    <motion.button
      onClick={onOpen}
      whileHover={onOpen ? { y: -6 } : undefined}
      className={`group relative block shrink-0 snap-start overflow-hidden rounded-3xl bg-sand text-left shadow-card ${
        tall ? 'w-64 sm:w-72' : 'w-56 sm:w-64'
      }`}
    >
      <img
        src={image}
        alt={label}
        loading="lazy"
        className="aspect-[3/4] w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.05]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-espresso/65 via-transparent to-transparent" />
      <div className="absolute inset-x-4 bottom-4">
        <p className="truncate text-[13px] font-bold text-cream">{label}</p>
        <p className="text-[11px] font-semibold text-cream/65">{meta}</p>
      </div>
      {onOpen && (
        <span className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-cream/15 text-cream opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
          <IconArrowRight className="h-3.5 w-3.5" />
        </span>
      )}
    </motion.button>
  )
}

export function LookbookStrip() {
  const { openProduct } = useStore()
  const suit = products[1]
  const picks: Product[] = [products[5], products[10], products[9], products[18], products[22]]

  return (
    <section className="border-b border-line bg-parchment/60">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <Reveal>
          <SectionHeading
            eyebrow="The Lookbook"
            title={
              <>
                From the racks, <span className="italic text-terracotta">as worn.</span>
              </>
            }
          />
        </Reveal>

        <div className="no-scrollbar -mx-4 mt-10 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <LookCard
            image="/products/campaign-look.jpg"
            label="A/W ’26 — Look 01"
            meta="Embroidered lawn, hand zari"
            tall
            onOpen={() => openProduct(suit)}
          />
          {picks.map((p) => (
            <LookCard
              key={p.id}
              image={p.image}
              label={p.name}
              meta={rs(priceOf(p))}
              onOpen={() => openProduct(p)}
            />
          ))}
        </div>
        <p className="mt-5 text-[11px] font-semibold text-taupe">
          Tap any piece for the full view — sizes, colors and current stock.
        </p>
      </div>
    </section>
  )
}

/* ── Store policies — minimal numbered editorial row ───────────────── */

const POLICIES = [
  {
    icon: WhatsAppIcon,
    title: 'Order on WhatsApp',
    copy: 'No apps, no accounts. Your basket becomes one clean message.',
  },
  {
    icon: IconShield,
    title: 'Pay your way',
    copy: 'Cash on delivery or bank transfer — confirmed in chat.',
  },
  {
    icon: IconClock,
    title: 'Fast dispatch',
    copy: 'Orders packed within 24–48 hours, delivery confirmed first.',
  },
  {
    icon: IconCheck,
    title: 'Easy exchange',
    copy: 'Exchange windows vary by item — ask before you order.',
  },
]

export function Policies() {
  return (
    <section id="policies" className="scroll-mt-24 border-b border-line">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
          {POLICIES.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.06}>
              <div className="flex h-full flex-col gap-3 lg:border-l lg:border-line lg:px-8 lg:first:border-l-0 lg:first:pl-0 lg:last:pr-0">
                <div className="flex items-center justify-between">
                  <span className="font-display text-sm font-semibold italic text-terracotta">
                    0{i + 1}
                  </span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-terracotta/12 text-terracotta-dark">
                    <p.icon className="h-4.5 w-4.5" />
                  </span>
                </div>
                <p className="font-display text-xl font-medium text-espresso">{p.title}</p>
                <p className="text-[13px] leading-relaxed text-cocoa">{p.copy}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-10 text-center text-[11px] text-taupe">
          Sample storefront — inventory and policies are illustrative for the demo.
        </p>
      </div>
    </section>
  )
}

/* ── Newsletter — the brand list (honest: nothing is stored) ───────── */

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)
  const valid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())

  return (
    <section id="newsletter" className="border-b border-line bg-parchment/60">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-xl text-center">
          <Reveal>
            <p className="text-[11px] font-bold uppercase tracking-mega text-taupe">
              The Marigold List
            </p>
            <h2 className="mt-3 font-display text-4xl font-medium tracking-tight text-espresso sm:text-5xl">
              First to know, <span className="italic text-terracotta">first to wear.</span>
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-cocoa">
              Drops, restocks and the quiet mid-season edits — one short message, never spam.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            {done ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mx-auto mt-8 flex max-w-md items-center justify-center gap-2.5 border-l-2 border-leaf bg-leaf/10 px-6 py-4 text-sm font-bold text-leaf"
              >
                <IconCheck className="h-4.5 w-4.5" />
                You’re on the list — see you at the next drop.
              </motion.div>
            ) : (
              <form
                className="mx-auto mt-8 flex max-w-md items-end gap-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  if (valid) setDone(true)
                }}
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  aria-label="Email for the Marigold List"
                  className="w-full min-w-0 flex-1 border-b-2 border-espresso/25 bg-transparent py-3 text-sm font-medium text-espresso outline-none transition-colors placeholder:text-taupe focus:border-terracotta"
                />
                <button
                  type="submit"
                  disabled={!valid}
                  className="flex h-11 shrink-0 items-center gap-1.5 bg-espresso px-6 text-[11px] font-bold uppercase tracking-[0.2em] text-cream transition-colors hover:bg-terracotta-dark disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Join
                  <IconArrowRight className="h-3.5 w-3.5" />
                </button>
              </form>
            )}
            <p className="mt-4 text-[11px] leading-relaxed text-taupe">
              Demo storefront — addresses aren’t stored anywhere. For real drop alerts,{' '}
              <a
                href={waLink(MSG_SHOP)}
                target="_blank"
                rel="noreferrer"
                className="font-bold text-terracotta-dark underline-offset-2 hover:underline"
              >
                message the shop on WhatsApp
              </a>
              .
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
