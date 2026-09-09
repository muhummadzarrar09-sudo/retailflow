import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { discountOf, priceOf, type Product } from '../data/products'
import { useStore } from '../store/StoreContext'
import { productMessage, rs, waLink } from '../utils/helpers'
import { Badge, hexOf, IconEye, IconPlus, Stars, Picture, WhatsAppIcon } from './ui'

/* ── Product card — shared by collection pages, rails and lookbooks ──
   Hit area is a real <button> overlay rather than role="button" on the
   <article>: an element with a button role must not contain other controls,
   and this also drops the hand-rolled Enter/Space handler. */

export interface ProductCardProps {
  p: Product
  index: number
  /** viewport share of the media box, for srcset selection */
  sizes?: string
  eager?: boolean
  className?: string
}

/* The ref is forwarded because the collection grid renders these inside
   <AnimatePresence mode="popLayout">, which measures the child to pull it out
   of the flow while it exits — a plain function component silently drops it. */
export const ProductCard = forwardRef<HTMLElement, ProductCardProps>(function ProductCard(
  { p, index, sizes = '(max-width:640px) 46vw, (max-width:1024px) 30vw, 25vw', eager = false, className },
  ref,
) {
  const { openProduct, add, setCartOpen } = useStore()
  const discount = discountOf(p)

  /* Quick-add is only honest when there is nothing to choose: a card has no
     variant picker, so pre-filling "Size: M" would send the shop a selection
     the shopper never made. Anything with sizes or several colorways opens the
     detail dialog instead, where the choice is visible. */
  const quickAddable = !p.sizes?.length && p.colors.length <= 1

  const onAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!quickAddable) {
      openProduct(p)
      return
    }
    add({ productId: p.id, color: p.colors[0], qty: 1 })
    setCartOpen(true)
  }

  return (
    <motion.article
      ref={ref}
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: Math.min(index * 0.04, 0.35) }}
      className={`group relative cursor-pointer rounded-3xl ${className ?? ''}`}
    >
      <div className="relative overflow-hidden rounded-3xl bg-sand">
        <Picture
          path={p.image}
          alt={p.name}
          sizes={sizes}
          eager={eager}
          className="aspect-[4/5] w-full transition-transform duration-700 ease-out group-hover:scale-[1.05]"
        />

        {/* whole-card quick view */}
        <button
          onClick={() => openProduct(p)}
          className="absolute inset-0 z-0 flex items-end justify-center pb-3 outline-none"
          aria-label={`View ${p.name}`}
        >
          <span className="pointer-events-none flex translate-y-2 items-center gap-1.5 rounded-[3px] bg-espresso/0 px-3 py-2.5 text-[12px] font-bold text-transparent opacity-0 transition-all duration-300 group-hover:bg-espresso group-hover:from-transparent group-hover:opacity-100 group-hover:text-cream group-focus-visible:bg-espresso group-focus-visible:opacity-100 group-focus-visible:text-cream">
            <IconEye className="h-4 w-4" />
            Quick view
          </span>
        </button>

        <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex flex-wrap gap-1.5">
          {p.isNew && <Badge tone="new">New</Badge>}
          {p.salePrice && <Badge tone="sale">−{discount}%</Badge>}
          {p.stock === 'low-stock' && <Badge tone="low">Low stock</Badge>}
        </div>

        {/* actions — also revealed on keyboard focus */}
        <div className="absolute bottom-3 right-3 z-20 flex translate-y-2 items-center gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
          <a
            href={waLink(productMessage(p))}
            target="_blank"
            rel="noreferrer"
            aria-label={`Ask the shop about ${p.name} on WhatsApp`}
            onClick={(e) => e.stopPropagation()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-leaf text-cream shadow-pop transition-transform hover:scale-105 active:scale-95"
          >
            <WhatsAppIcon className="h-4.5 w-4.5" />
          </a>
          <button
            onClick={onAdd}
            aria-label={
              quickAddable
                ? `Add ${p.name} to inquiry basket`
                : `Choose size and color for ${p.name}`
            }
            className="flex h-10 w-10 items-center justify-center rounded-full bg-cream text-espresso shadow-pop transition-transform hover:scale-105 active:scale-95"
          >
            <IconPlus className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      <div className="px-1 pt-4">
        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.14em] text-taupe">
          <span>{p.category}</span>
          <span className="flex items-center gap-1 normal-case tracking-normal">
            <Stars value={p.rating} />
            <span className="text-cocoa">{p.reviews}</span>
          </span>
        </div>
        <h3 className="mt-1.5 font-display text-lg font-medium leading-snug text-espresso transition-colors group-hover:text-terracotta-dark">
          {p.name}
        </h3>
        <div className="mt-1.5 flex items-center gap-1.5">
          {p.colors.slice(0, 4).map((c) => (
            <span key={c} title={c} className="h-3.5 w-3.5 rounded-full border border-espresso/15" style={{ backgroundColor: hexOf(c) }} />
          ))}
          {p.colors.length > 4 && (
            <span className="text-[11px] font-semibold text-taupe">+{p.colors.length - 4}</span>
          )}
          {p.sizes && (
            <span className="ml-1 text-[11px] font-semibold text-taupe">
              {p.sizes[0]}–{p.sizes[p.sizes.length - 1]}
            </span>
          )}
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-display text-lg font-semibold text-espresso">{rs(priceOf(p))}</span>
          {p.salePrice && <span className="text-sm text-taupe line-through">{rs(p.price)}</span>}
        </div>
      </div>
    </motion.article>
  )
})
