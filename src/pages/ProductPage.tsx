import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import {
  COLOR_HEX,
  discountOf,
  priceOf,
  relatedTo,
  type Product,
} from '../data/products'
import { useStore } from '../store/StoreContext'
import { cn, productMessage, rs, waLink } from '../utils/helpers'
import {
  Badge,
  IconArrowRight,
  IconBag,
  IconCheck,
  IconChevronDown,
  IconMinus,
  IconPlus,
  Stars,
  WhatsAppIcon,
} from '../components/ui'

/* Shopify-style full-width detail page with its own URL:
   #/shop/product/<slug>. The image is one edge-to-edge hero, then a
   scrollable spec/related section below — no clipping, no popup. */

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

export default function ProductPage({ product: p }: { product: Product }) {
  const { add, setCartOpen, goShop, openProduct } = useStore()
  const [size, setSize] = useState<string | undefined>(p.sizes?.[1] ?? p.sizes?.[0])
  const [color, setColor] = useState<string>(p.colors[0])
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [open, setOpen] = useState<'details' | 'delivery' | 'returns' | null>('details')

  useEffect(() => {
    // reset state whenever we switch to a different product
    setSize(p.sizes?.[1] ?? p.sizes?.[0])
    setColor(p.colors[0])
    setQty(1)
    setAdded(false)
    setOpen('details')
  }, [p])

  const discount = discountOf(p)
  const unit = priceOf(p)
  const photo = color !== p.colors[0] ? (p.colorImages?.[color] ?? null) : null
  const tint = photo ? null : color !== p.colors[0] ? (COLOR_HEX[color] ?? null) : null
  const imgSrc = photo ?? p.image
  const related = useMemo(() => relatedTo(p, 4), [p])

  const addToBasket = () => {
    add({ productId: p.id, size, color, qty })
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1400)
  }
  const quickCheckout = () => {
    add({ productId: p.id, size, color, qty })
    setCartOpen(true)
  }

  const accordions: { key: 'details' | 'delivery' | 'returns'; title: string }[] = [
    { key: 'details', title: 'Details & specifications' },
    { key: 'delivery', title: 'Delivery' },
    { key: 'returns', title: 'Exchanges & returns' },
  ]
  const accordionBody: Record<string, React.ReactNode> = {
    details: (
      <ul className="space-y-2">
        {p.details.map((d) => (
          <li key={d} className="flex gap-3">
            <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rotate-45 bg-terracotta" aria-hidden />
            <span className="text-sm leading-relaxed text-cocoa">{d}</span>
          </li>
        ))}
      </ul>
    ),
    delivery:
      'Confirm availability, delivery time and charges with the shop on WhatsApp before paying. Most orders in this flow dispatch within 24–48 hours and are confirmed in chat first.',
    returns:
      'Exchange policies vary by item — ask on WhatsApp before ordering. The structured inquiry makes this a one-message conversation.',
  }

  return (
    <div>
      {/* ── breadcrumb ── */}
      <div className="border-b border-line bg-parchment/40">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 text-[11px] font-bold uppercase tracking-mega text-taupe sm:px-6 lg:px-8">
          <button onClick={() => goShop('home')} className="transition-colors hover:text-terracotta-dark">
            Home
          </button>
          <span aria-hidden>/</span>
          <button
            onClick={() => goShop(p.category)}
            className="transition-colors hover:text-terracotta-dark"
          >
            {p.category}
          </button>
          <span aria-hidden>/</span>
          <span className="truncate text-espresso">{p.name}</span>
        </div>
      </div>

      {/* ── hero — full-bleed editorial image with the key info over it ── */}
      <div className="relative min-h-[78vh] w-full overflow-hidden bg-espresso">
        <div className="absolute inset-0">
          <img
            src={imgSrc}
            alt={`${p.name} — ${color}`}
            className="h-full w-full object-cover object-[center_30%]"
          />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-espresso/90 via-espresso/25 to-espresso/30" />
        </div>

        {/* badges */}
        <div className="absolute left-4 top-5 flex flex-wrap gap-1.5 sm:left-6 lg:left-8">
          {p.isNew && <Badge tone="new">New arrival</Badge>}
          {p.salePrice && <Badge tone="sale">Save {discount}%</Badge>}
          {photo && <Badge tone="dark">Colorway photo · {color}</Badge>}
          {tint && <Badge tone="dark">Colorway · {color}</Badge>}
        </div>

        {/* scroll cue */}
        <div className="pointer-events-none absolute inset-x-0 bottom-5 flex justify-center">
          <span className="text-[9px] font-bold uppercase tracking-mega text-cream/60">Scroll to order</span>
        </div>
      </div>

      {/* ── info / purchase section ── */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* left: title & full description */}
          <div className="lg:col-span-6">
            <Reveal>
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-mega text-taupe">
                <span>{p.category}</span>
                <span aria-hidden>·</span>
                <span className={p.stock === 'in-stock' ? 'text-leaf' : 'text-ember'}>
                  {p.stock === 'in-stock' ? '● In stock' : '● Low stock — a few left'}
                </span>
              </div>
              <h1 className="mt-3 font-display text-4xl font-medium leading-[1.02] tracking-tight text-espresso sm:text-5xl">
                {p.name}
              </h1>
              <div className="mt-3 flex items-center gap-2.5">
                <Stars value={p.rating} />
                <span className="text-sm font-semibold text-cocoa">
                  {p.rating} · {p.reviews} reviews
                </span>
              </div>
              <div className="mt-5 flex items-baseline gap-3">
                <span className="font-display text-3xl font-semibold text-espresso">{rs(unit)}</span>
                {p.salePrice && (
                  <>
                    <span className="text-xl text-taupe line-through">{rs(p.price)}</span>
                    <Badge tone="sale">−{discount}%</Badge>
                  </>
                )}
              </div>
              <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-cocoa">{p.description}</p>
            </Reveal>

            {/* colorway preview strip */}
            <div className="mt-8">
              <Reveal>
                <p className="text-[11px] font-bold uppercase tracking-mega text-taupe">
                  Color — <span className="text-espresso">{color}</span>
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {p.colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      aria-label={`Select ${c}`}
                      title={c}
                      className={cn(
                        'h-11 w-11 rounded-full border-2 transition-all',
                        color === c
                          ? 'scale-110 border-espresso shadow-pop ring-2 ring-terracotta ring-offset-2'
                          : 'border-espresso/15 hover:scale-105',
                      )}
                      style={{ backgroundColor: COLOR_HEX[c] ?? '#ccc' }}
                    />
                  ))}
                </div>
                <div
                  className="relative mt-5 overflow-hidden rounded-3xl bg-sand"
                  style={{ aspectRatio: '4/3' }}
                >
                  <img
                    src={imgSrc}
                    alt={`${p.name} in ${color}`}
                    className="h-full w-full object-cover"
                    style={
                      tint
                        ? { filter: 'grayscale(1) contrast(1.04) brightness(1.06)' }
                        : undefined
                    }
                  />
                  {tint && (
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0"
                      style={{ backgroundColor: tint, mixBlendMode: 'color', opacity: 0.82 }}
                    />
                  )}
                  <div className="absolute left-3 top-3">
                    {photo ? (
                      <Badge tone="ok">Studio photo · {color}</Badge>
                    ) : (
                      <Badge tone="dark">Styled preview · {color}</Badge>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-[11px] text-taupe">
                  {photo
                    ? 'Studio photography of this colorway — what you see is what arrives.'
                    : 'Showing a styled preview — full photography is shared on WhatsApp.'}
                </p>
              </Reveal>
            </div>
          </div>

          {/* right: size + purchase + accordions */}
          <div className="lg:col-span-6">
            <div className="lg:sticky lg:top-24">
              <Reveal>
                {p.sizes && (
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-bold uppercase tracking-mega text-taupe">
                        Size — <span className="text-espresso">{size}</span>
                      </p>
                      <span className="text-[11px] font-semibold text-taupe">
                        Size guide on WhatsApp
                      </span>
                    </div>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {p.sizes.map((s) => (
                        <button
                          key={s}
                          onClick={() => setSize(s)}
                          className={cn(
                            'h-11 min-w-12 rounded-xl border px-4 text-sm font-bold transition-all',
                            size === s
                              ? 'border-espresso bg-espresso text-cream'
                              : 'border-line bg-cream text-cocoa hover:border-taupe',
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <div className="flex items-center rounded-lg border border-line bg-parchment/60">
                    <button
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="flex h-12 w-12 items-center justify-center text-cocoa transition-colors hover:text-espresso"
                      aria-label="Decrease quantity"
                    >
                      <IconMinus className="h-4 w-4" />
                    </button>
                    <span className="w-9 text-center text-base font-bold">{qty}</span>
                    <button
                      onClick={() => setQty(Math.min(99, qty + 1))}
                      className="flex h-12 w-12 items-center justify-center text-cocoa transition-colors hover:text-espresso"
                      aria-label="Increase quantity"
                    >
                      <IconPlus className="h-4 w-4" />
                    </button>
                  </div>

                  <button
                    onClick={addToBasket}
                    className={cn(
                      'group flex h-12 flex-1 items-center justify-center gap-2 rounded-full px-6 text-sm font-bold text-cream transition-all active:scale-[0.98]',
                      added ? 'bg-leaf' : 'bg-espresso hover:bg-charcoal',
                    )}
                  >
                    {added ? (
                      <>
                        <IconCheck className="h-5 w-5" />
                        Added to basket
                      </>
                    ) : (
                      <>
                        <IconBag className="h-5 w-5" />
                        Add to inquiry
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <button
                    onClick={quickCheckout}
                    className="flex h-12 items-center justify-center gap-2 rounded-full border-2 border-terracotta bg-terracotta text-sm font-bold text-cream transition-all hover:bg-terracotta-dark active:scale-[0.98]"
                  >
                    <IconArrowRight className="h-4 w-4" />
                    Order on WhatsApp
                  </button>
                  <a
                    href={waLink(productMessage(p, size, color, qty))}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-12 items-center justify-center gap-2 rounded-full border-2 border-leaf/60 bg-leaf/10 text-sm font-bold text-leaf transition-all hover:border-leaf hover:bg-leaf hover:text-cream active:scale-[0.98]"
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                    Check availability
                  </a>
                </div>
                <p className="mt-3 text-center text-[11px] text-taupe">
                  Your inquiry is a structured WhatsApp message — product, size, color, quantity &amp; price.
                </p>

                {/* accordions */}
                <div className="mt-7 divide-y divide-line border-y border-line">
                  {accordions.map((a) => {
                    const isOpen = open === a.key
                    return (
                      <div key={a.key}>
                        <button
                          onClick={() => setOpen(isOpen ? null : a.key)}
                          aria-expanded={isOpen}
                          className="flex w-full items-center justify-between py-4 text-left text-sm font-bold text-espresso"
                        >
                          {a.title}
                          <IconChevronDown
                            className={cn('h-4 w-4 text-taupe transition-transform', isOpen && 'rotate-180')}
                          />
                        </button>
                        {isOpen && (
                          <div className="pb-5 text-sm leading-relaxed text-cocoa">
                            {accordionBody[a.key]}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </div>

      {/* ── related products ── */}
      {related.length > 0 && (
        <div className="border-t border-line bg-parchment/40">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-display text-3xl font-medium tracking-tight text-espresso sm:text-4xl">
                You may also like
              </h2>
              <button
                onClick={() => goShop(p.category)}
                className="group hidden items-center gap-1.5 text-sm font-bold text-terracotta-dark sm:flex"
              >
                View {p.category}
                <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
              {related.map((r, i) => (
                <motion.button
                  key={r.id}
                  onClick={() => openProduct(r)}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.06 }}
                  className="group text-left"
                  aria-label={`View ${r.name}`}
                >
                  <div className="overflow-hidden rounded-3xl bg-sand">
                    <img
                      src={r.image}
                      alt={r.name}
                      loading="lazy"
                      className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                    />
                  </div>
                  <div className="px-1 pt-3">
                    <p className="truncate font-display text-lg font-medium text-espresso">{r.name}</p>
                    <p className="mt-0.5 font-display text-base font-semibold text-espresso">
                      {rs(priceOf(r))}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
