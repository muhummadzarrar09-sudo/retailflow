import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import {
  COLOR_HEX,
  discountOf,
  priceOf,
  relatedTo,
  type Product,
} from '../data/products'
import { useStore } from '../store/StoreContext'
import { cn, productMessage, rs, waLink } from '../utils/helpers'
import { lockScroll, unlockScroll } from '../utils/scrollLock'
import { useFocusTrap } from '../utils/focusTrap'
import {
  Badge,
  IconBag,
  IconCheck,
  IconChevronDown,
  IconMinus,
  IconPlus,
  IconX,
  Stars,
  TintedImage,
  WhatsAppIcon,
} from './ui'

/* gallery views: full shot + zoom crops — origins are art-directed per
   product in the catalog data, with safe defaults for everything else */
const viewsFor = (p: Product) => [
  { label: 'Front', zoom: 1, origin: 'center center' },
  { label: 'Detail', zoom: 2.1, origin: p.cropDetail ?? '42% 34%' },
  { label: 'Texture', zoom: 2.6, origin: p.cropTexture ?? '58% 62%' },
]

function Accordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-t border-line py-3.5">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-left text-sm font-bold text-espresso"
      >
        {title}
        <IconChevronDown
          className={cn('h-4 w-4 text-taupe transition-transform duration-300', open && 'rotate-180')}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-3 text-sm leading-relaxed text-cocoa">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ModalBody({ p }: { p: Product }) {
  const { closeProduct, add, setCartOpen, openProduct } = useStore()
  const [view, setView] = useState(0)
  const [size, setSize] = useState<string | undefined>(p.sizes?.[1] ?? p.sizes?.[0])
  const [color, setColor] = useState<string>(p.colors[0])
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  useFocusTrap(dialogRef, true)

  // move keyboard focus into the dialog when it appears
  useEffect(() => {
    dialogRef.current?.focus()
  }, [])

  const discount = discountOf(p)
  const unit = priceOf(p)
  const VIEWS = viewsFor(p)
  /* colorway resolution: real studio photo when we have one,
     styled duotone preview when we don't, base photo for the first color */
  const photo = color !== p.colors[0] ? (p.colorImages?.[color] ?? null) : null
  const tint = photo ? null : color !== p.colors[0] ? (COLOR_HEX[color] ?? null) : null
  const imgSrc = photo ?? p.image

  const addToBasket = () => {
    add({ productId: p.id, size, color, qty })
    setAdded(true)
    window.setTimeout(() => {
      setAdded(false)
      setCartOpen(true)
    }, 650)
  }

  return (
    <motion.div
      ref={dialogRef}
      tabIndex={-1}
      initial={{ opacity: 0, y: 60, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 40, scale: 0.98 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="relative grid max-h-[92vh] w-full max-w-5xl grid-rows-[auto_1fr] overflow-hidden rounded-t-3xl bg-cream shadow-soft outline-none sm:rounded-3xl md:grid-cols-2 md:grid-rows-1"
      role="dialog"
      aria-modal="true"
      aria-label={p.name}
    >
      <button
        onClick={closeProduct}
        className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-cream/90 text-espresso shadow-pop backdrop-blur transition-transform hover:scale-105 active:scale-95"
        aria-label="Close product"
      >
        <IconX className="h-5 w-5" />
      </button>

      {/* gallery */}
      <div className="relative bg-sand md:h-full">
        <TintedImage
          src={imgSrc}
          alt={`${p.name} — ${VIEWS[view].label} view`}
          tint={tint}
          eager
          className="aspect-[4/3] w-full transition-transform duration-500 md:aspect-auto md:h-full md:min-h-[34rem]"
          style={{ transform: `scale(${VIEWS[view].zoom})`, transformOrigin: VIEWS[view].origin }}
        />
        <div className="absolute left-4 top-4 flex flex-wrap gap-1.5">
          {p.isNew && <Badge tone="new">New</Badge>}
          {p.salePrice && <Badge tone="sale">Save {discount}%</Badge>}
          {photo && <Badge tone="ok">Colorway photo: {color}</Badge>}
          {tint && <Badge tone="dark">Colorway: {color}</Badge>}
        </div>
        <div className="absolute bottom-4 left-4 flex gap-2">
          {VIEWS.map((v, i) => (
            <button
              key={v.label}
              onClick={() => setView(i)}
              aria-label={`Show ${v.label} view`}
              className={cn(
                'h-14 w-14 overflow-hidden rounded-xl border-2 bg-sand transition-all',
                view === i ? 'border-espresso shadow-pop' : 'border-cream/80 opacity-85 hover:opacity-100',
              )}
            >
              <TintedImage
                src={imgSrc}
                alt=""
                tint={tint}
                className="h-full w-full"
                style={{ transform: `scale(${v.zoom})`, transformOrigin: v.origin }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* info */}
      <div className="thin-scroll overflow-y-auto p-6 sm:p-8">
        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.14em] text-taupe">
          <span>{p.category}</span>
          {p.stock === 'in-stock' ? (
            <span className="flex items-center gap-1.5 text-leaf">
              <span className="h-1.5 w-1.5 bg-leaf" aria-hidden />
              Available
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-ember">
              <span className="h-1.5 w-1.5 bg-ember" aria-hidden />
              Low stock — a few left
            </span>
          )}
        </div>

        <h2 className="mt-2.5 font-display text-3xl font-medium tracking-tight text-espresso">
          {p.name}
        </h2>

        <div className="mt-2.5 flex items-center gap-2">
          <Stars value={p.rating} />
          <span className="text-[13px] font-semibold text-cocoa">
            {p.rating} · {p.reviews} reviews
          </span>
        </div>

        <div className="mt-4 flex items-baseline gap-3">
          <span className="font-display text-3xl font-semibold text-espresso">{rs(unit)}</span>
          {p.salePrice && <span className="text-lg text-taupe line-through">{rs(p.price)}</span>}
        </div>

        <p className="mt-4 text-sm leading-relaxed text-cocoa">{p.description}</p>

        {/* color */}
        <div className="mt-6">
          <p className="text-[11px] font-bold uppercase tracking-mega text-taupe">
            Color — <span className="text-espresso">{color}</span>
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2.5">
            {p.colors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                aria-label={`Select color ${c}`}
                title={c}
                className={cn(
                  'h-9 w-9 rounded-full border-2 transition-all',
                  color === c
                    ? 'scale-110 border-espresso shadow-pop'
                    : 'border-espresso/10 hover:scale-105',
                )}
                style={{ backgroundColor: COLOR_HEX[c] ?? '#ccc' }}
              />
            ))}
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-taupe">
            {photo
              ? `Studio photography of the ${color} colorway — what you see is what arrives.`
              : tint
                ? `Showing a styled preview in ${color} — full photography of this colorway is shared on WhatsApp.`
                : 'Pick any color to view its colorway on the left.'}
          </p>
        </div>

        {/* size */}
        {p.sizes && (
          <div className="mt-5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-mega text-taupe">
                Size — <span className="text-espresso">{size}</span>
              </p>
              <span className="text-[11px] font-semibold text-taupe">Size guide on WhatsApp</span>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {p.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={cn(
                    'h-10 min-w-12 rounded-xl border px-3 text-[13px] font-bold transition-all',
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

        {/* qty + CTAs */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-[4px] border border-line bg-parchment/60">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="flex h-11 w-11 items-center justify-center text-cocoa"
              aria-label="Decrease quantity"
            >
              <IconMinus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center text-sm font-bold">{qty}</span>
            <button
              onClick={() => setQty(Math.min(99, qty + 1))}
              className="flex h-11 w-11 items-center justify-center text-cocoa"
              aria-label="Increase quantity"
            >
              <IconPlus className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={addToBasket}
            className={cn(
              'flex h-11 flex-1 items-center justify-center gap-2 rounded-full text-sm font-bold transition-all active:scale-[0.98]',
              added ? 'bg-leaf text-cream' : 'bg-espresso text-cream hover:bg-charcoal',
            )}
          >
            {added ? (
              <>
                <IconCheck className="h-4.5 w-4.5" />
                Added to inquiry
              </>
            ) : (
              <>
                <IconBag className="h-4.5 w-4.5" />
                Add to inquiry — {rs(unit * qty)}
              </>
            )}
          </button>
        </div>

        <a
          href={waLink(productMessage(p, size, color, qty))}
          target="_blank"
          rel="noreferrer"
          className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-full border-2 border-leaf/60 bg-leaf/10 text-sm font-bold text-leaf transition-all hover:border-leaf hover:bg-leaf hover:text-cream active:scale-[0.98]"
        >
          <WhatsAppIcon className="h-4.5 w-4.5" />
          Order / check on WhatsApp
        </a>
        <p className="mt-2.5 text-center text-[11px] text-taupe">
          Sends an exact message: product, size, color, quantity & price.
        </p>

        {/* accordions */}
        <div className="mt-6 border-b border-line">
          <Accordion title="Details & specifications" defaultOpen>
            <ul className="space-y-1.5">
              {p.details.map((d) => (
                <li key={d} className="flex gap-2">
                  <span className="mt-[7px] h-1 w-1 shrink-0 bg-terracotta" />
                  {d}
                </li>
              ))}
            </ul>
          </Accordion>
          <Accordion title="How ordering works">
            Confirm availability, delivery time and delivery charges with the shop on WhatsApp
            before paying. Most shops in this flow accept cash on delivery or bank transfer —
            payment is never taken on the website itself.
          </Accordion>
          <Accordion title="Exchange & returns">
            Exchange policies vary from shop to shop. Ask on WhatsApp before ordering — the
            structured inquiry makes this a one-message conversation.
          </Accordion>
        </div>

        {/* related */}
        {relatedTo(p).length > 0 && (
          <div className="mt-7">
            <p className="text-[11px] font-bold uppercase tracking-mega text-taupe">
              Pairs well with
            </p>
            <div className="mt-3 space-y-2">
              {relatedTo(p).map((r) => (
                <button
                  key={r.id}
                  onClick={() => openProduct(r)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-line bg-parchment/40 p-2.5 text-left transition-all hover:border-terracotta/40 hover:bg-claylight/40"
                >
                  <img
                    src={r.image}
                    alt=""
                    loading="lazy"
                    className="h-14 w-14 rounded-xl object-cover"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-espresso">{r.name}</span>
                    <span className="text-[12px] font-semibold text-taupe">
                      {r.category} · {rs(priceOf(r))}
                    </span>
                  </span>
                  <IconPlus className="h-4 w-4 shrink-0 text-terracotta" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function ProductModal() {
  const { active, closeProduct, cartOpen } = useStore()
  const restoreFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!active) return
    restoreFocus.current = document.activeElement as HTMLElement | null
    lockScroll()
    // the inquiry basket stacks ABOVE this modal — let it own Escape first
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !cartOpen && closeProduct()
    window.addEventListener('keydown', onKey)
    return () => {
      unlockScroll()
      window.removeEventListener('keydown', onKey)
      restoreFocus.current?.focus?.({ preventScroll: true })
    }
  }, [active, closeProduct, cartOpen])

  return (
    <AnimatePresence>
      {active && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeProduct}
            className="absolute inset-0 bg-espresso/60 backdrop-blur-sm"
          />
          {/* key resets modal state when switching products */}
          <ModalBody key={active.id} p={active} />
        </div>
      )}
    </AnimatePresence>
  )
}
