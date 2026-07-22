import {
  IconArrowRight,
  IconBag,
  IconBox,
  IconChart,
  IconCheck,
  IconClock,
  IconEye,
  IconImage,
  IconLayers,
  IconMessage,
  IconPlus,
  IconSearch,
  IconShield,
  IconSparkle,
  IconStore,
  IconTag,
  Reveal,
  SectionHeading,
  WhatsAppIcon,
} from './ui'

/* ── Category marquee strip ────────────────────────────────────────── */

export function Marquee() {
  const items = [
    'Clothing',
    'Accessories',
    'Footwear',
    'Stationery',
    'Cosmetics',
    'Gifts',
    'Order on WhatsApp',
    'Cash on Delivery',
    'New Arrivals Weekly',
  ]
  return (
    <div className="overflow-hidden border-y border-line bg-parchment/70 py-3.5">
      {/* two identical halves: translateX(-50%) loops seamlessly;
          the repeat half is hidden from assistive tech */}
      <div className="animate-marquee flex w-max items-center">
        {[0, 1].map((half) => (
          <div key={half} className="flex items-center gap-8 pr-8" aria-hidden={half === 1 || undefined}>
            {items.map((t) => (
              <span key={t} className="flex items-center gap-8 whitespace-nowrap">
                <span className="text-[11px] font-bold uppercase tracking-mega text-cocoa/70">{t}</span>
                <span className="h-1.5 w-1.5 rotate-45 bg-terracotta/50" aria-hidden />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── 2 · Problem ───────────────────────────────────────────────────── */

const PROBLEMS = [
  {
    icon: IconLayers,
    title: 'Products scattered everywhere',
    copy: 'Catalog shots live across WhatsApp chats, Instagram posts, story highlights and phone galleries — nothing in one place.',
  },
  {
    icon: IconMessage,
    title: 'The same questions, all day',
    copy: '"Price?" "Do you have this in medium?" "Original pic?" Customers ask the same things on repeat because details aren\u2019t visible.',
  },
  {
    icon: IconClock,
    title: 'Staff hours lost to copy-paste',
    copy: 'Someone on your team re-sends the same pictures, prices and size charts dozens of times a day instead of serving buyers.',
  },
  {
    icon: IconBox,
    title: 'Stock and sizes stay unclear',
    copy: 'Customers get excited about items that sold out yesterday. Nobody wins — and trust takes the hit.',
  },
  {
    icon: IconSparkle,
    title: 'Looking smaller than you are',
    copy: 'Bigger brands look polished online. A blurry photo dump makes a good shop feel less professional than it really is.',
  },
]

export function ProblemSection() {
  return (
    <section id="problem" className="scroll-mt-24 border-b border-line">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-8 lg:py-28">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <Reveal>
              <SectionHeading
                eyebrow="The Problem"
                title={
                  <>
                    WhatsApp selling works — <span className="italic text-terracotta">until it becomes messy.</span>
                  </>
                }
                copy="Most local shops already sell through WhatsApp and Instagram. The problem is everything before the message: repeated product questions, scattered pictures, old prices, missing sizes, and unclear availability."
              />
            </Reveal>
            <Reveal delay={0.15}>
              <div className="mt-8 rounded-3xl border border-terracotta/25 bg-claylight/50 p-6">
                <p className="font-display text-lg italic leading-snug text-espresso">
                  “The sale usually happens in chat. The friction happens before it.”
                </p>
                <p className="mt-3 text-[11px] font-bold uppercase tracking-mega text-terracotta-dark">
                  What RetailFlow removes
                </p>
              </div>
            </Reveal>
          </div>
        </div>

        <div className="lg:col-span-7">
          <ol className="space-y-4">
            {PROBLEMS.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.07}>
                <li className="group flex gap-5 rounded-3xl border border-line bg-cream p-6 transition-all duration-300 hover:-translate-y-1 hover:border-terracotta/40 hover:shadow-card">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-parchment text-terracotta transition-colors group-hover:bg-terracotta group-hover:text-cream">
                    <p.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="flex items-baseline gap-3">
                      <span className="font-display text-sm italic text-taupe">0{i + 1}</span>
                      <h3 className="font-display text-xl font-medium text-espresso">{p.title}</h3>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-cocoa">{p.copy}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

/* ── 3 · The system ────────────────────────────────────────────────── */

const FEATURES = [
  { icon: IconStore, label: 'Product catalog' },
  { icon: IconLayers, label: 'Categories' },
  { icon: IconEye, label: 'Product pages' },
  { icon: IconImage, label: 'Images & prices' },
  { icon: IconTag, label: 'Size / color options' },
  { icon: IconBox, label: 'Stock status' },
  { icon: WhatsAppIcon, label: 'WhatsApp order button' },
  { icon: IconBag, label: 'Inquiry cart' },
  { icon: IconChart, label: 'Admin preview' },
  { icon: IconSparkle, label: 'Mobile-first design' },
]

const STEPS = [
  {
    n: '01',
    title: 'Customer browses first',
    copy: 'They open your catalog link, explore categories, check prices, sizes and stock — before ever messaging you.',
  },
  {
    n: '02',
    title: 'Builds an exact inquiry',
    copy: 'They pick size, color and quantity, add items to their inquiry basket, and see an estimated total.',
  },
  {
    n: '03',
    title: 'One clean WhatsApp message',
    copy: 'Everything lands in your WhatsApp as a structured message — no back-and-forth, no missing details.',
  },
]

export function SystemSection() {
  return (
    <section id="system" className="scroll-mt-24 border-b border-line bg-parchment/60">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <Reveal>
          <SectionHeading
            align="center"
            eyebrow="The System"
            title={
              <>
                Not full e-commerce.{' '}
                <span className="italic text-terracotta">A practical catalog system</span> built
                around WhatsApp.
              </>
            }
            copy="RetailFlow gives retailers a clean catalog link where customers can browse products first, then send an exact inquiry through WhatsApp. It works with how local businesses already sell — but makes the experience cleaner, faster, and more professional."
            className="[&>p]:mx-auto [&>p]:max-w-2xl"
          />
        </Reveal>

        {/* steps */}
        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.1}>
              <div className="relative h-full rounded-3xl border border-line bg-cream p-7">
                <span className="font-display text-4xl font-light italic text-clay">{s.n}</span>
                <h3 className="mt-3 font-display text-xl font-medium text-espresso">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-cocoa">{s.copy}</p>
                {i < 2 && (
                  <IconArrowRight className="absolute -right-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-terracotta md:block" />
                )}
              </div>
            </Reveal>
          ))}
        </div>

        {/* feature grid */}
        <Reveal delay={0.1}>
          <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {FEATURES.map((f, i) => (
              <div
                key={f.label}
                className="group flex items-center gap-3 rounded-2xl border border-line bg-cream px-4 py-3.5 transition-all duration-300 hover:border-terracotta/40 hover:bg-claylight/40"
                style={{ transitionDelay: `${i * 10}ms` }}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-parchment text-terracotta">
                  <f.icon className="h-4 w-4" />
                </span>
                <span className="text-[13px] font-bold text-charcoal">{f.label}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ── 8 · Moat ──────────────────────────────────────────────────────── */

const MOAT = [
  { title: 'Brand presentation', copy: 'Your products finally look the way they deserve — editorial, consistent, premium.' },
  { title: 'Product organization', copy: 'Categories, variants, prices and stock in one structured system instead of a camera roll.' },
  { title: 'Customer browsing experience', copy: 'Shoppers arrive informed. They compare, shortlist and decide before they message.' },
  { title: 'WhatsApp inquiry flow', copy: 'Structured inquiries with name, items, sizes, colors and totals — straight into your chat.' },
  { title: 'Stock visibility', copy: 'Availability stays honest. Fewer dead-end conversations, more trust.' },
  { title: 'Admin control', copy: 'You or your staff update products, prices and stock without a developer.' },
  { title: 'Monthly improvements', copy: 'The catalog keeps getting better — layout, content and conversion, month over month.' },
  { title: 'SEO-ready structure', copy: 'Clean, indexable pages with proper structure and local relevance — foundations done right.' },
]

export function MoatSection() {
  return (
    <section id="moat" className="scroll-mt-24 border-b border-line">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <Reveal>
                <SectionHeading
                  eyebrow="The Moat"
                  title={
                    <>
                      More than a website. <span className="italic text-terracotta">A business asset.</span>
                    </>
                  }
                  copy="A basic website only shows that your business exists. RetailFlow turns your product catalog into a system customers can actually use."
                />
              </Reveal>
              <Reveal delay={0.15}>
                <blockquote className="mt-8 rounded-3xl bg-espresso p-7 text-cream shadow-card">
                  <p className="font-display text-xl italic leading-snug">
                    “Every season your catalog gets richer. That compounds — your competitor with a
                    photo dump can’t catch up.”
                  </p>
                  <footer className="mt-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-mega text-clay">
                    <IconShield className="h-4 w-4" />
                    The Zarrar.Solutions approach
                  </footer>
                </blockquote>
              </Reveal>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2">
              {MOAT.map((m, i) => (
                <Reveal key={m.title} delay={(i % 2) * 0.07} className="h-full">
                  <div className="h-full bg-cream p-6 transition-colors duration-300 hover:bg-claylight/40">
                    <span className="text-[11px] font-bold tracking-mega text-terracotta">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="mt-2 font-display text-lg font-medium text-espresso">{m.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-cocoa">{m.copy}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── 10 · Add-ons ──────────────────────────────────────────────────── */

const ADDONS = [
  'Domain setup',
  'Extra pages',
  'Product upload support',
  'Advanced admin dashboard',
  'Stock management',
  'Search & filters',
  'WhatsApp automation',
  'Payment integration',
  'Analytics / Search Console setup',
  'SEO setup',
  'Google Business Profile optimization',
  'Location pages',
  'Review system',
  'Maintenance & reporting',
]

export function AddonsSection() {
  return (
    <section id="addons" className="scroll-mt-24 border-b border-line bg-parchment/60">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <Reveal>
          <SectionHeading
            eyebrow="Extend the system"
            title={
              <>
                Add-ons, <span className="italic text-terracotta">quoted by scope.</span>
              </>
            }
            copy="Start with a catalog that already converts — then bolt on exactly what your shop needs, when it needs it."
          />
        </Reveal>

        <Reveal delay={0.1}>
          <ul className="mt-10 flex flex-wrap gap-2.5">
            {ADDONS.map((a) => (
              <li
                key={a}
                className="group flex items-center gap-2 rounded-full border border-line bg-cream py-2 pl-4 pr-3 text-[13px] font-semibold text-charcoal transition-all hover:border-terracotta/50 hover:bg-claylight/50"
              >
                {a}
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-parchment text-terracotta transition-colors group-hover:bg-terracotta group-hover:text-cream">
                  <IconPlus className="h-3 w-3" />
                </span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-line bg-cream p-6">
              <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-mega text-terracotta-dark">
                <IconTag className="h-4 w-4" />
                How add-ons are priced
              </p>
              <p className="mt-3 text-sm leading-relaxed text-cocoa">
                Add-ons are quoted separately depending on scope, timeline, and complexity. You get
                a clear price before any work begins — no surprises mid-project.
              </p>
            </div>
            <div className="rounded-3xl border border-line bg-cream p-6">
              <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-mega text-terracotta-dark">
                <IconCheck className="h-4 w-4" />
                An honest note on SEO
              </p>
              <p className="mt-3 text-sm leading-relaxed text-cocoa">
                We do not guarantee rankings. SEO work improves structure, technical health, content
                clarity, and local relevance — the foundations that give your shop a fair chance to
                be found.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
