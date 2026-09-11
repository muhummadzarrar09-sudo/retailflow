import { motion } from 'framer-motion'
import { forwardRef } from 'react'
import { COLOR_HEX, discountOf, priceOf, type Product } from '../data/products'
import { useStore } from '../store/StoreContext'
import { productMessage, rs, waLink } from '../utils/helpers'
import { Badge, IconEye, IconPlus, Stars, WhatsAppIcon } from './ui'

/* ── Product card — shared by collection pages, rails and lookbooks ──
   Must forward a ref: the collection grid renders these inside
   <AnimatePresence mode="popLayout">, which needs to reach the card's DOM
   node to measure & "pop" cards out when one is filtered/sorted away. Without
   the forwarded ref framer logs a warning and exits collapse instead. */

export interface ProductCardProps {
  p: Product
  index: number
}

export const ProductCard = forwardRef<HTMLElement, ProductCardProps>(function ProductCard(
  { p, index },
  ref,
) {
  const { openProduct, add, setCartOpen } = useStore()
  const discount = discountOf(p)

  const quickAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    add({ productId: p.id, size: p.sizes?.[1] ?? p.sizes?.[0], color: p.colors[0], qty: 1 })
    setCartOpen(true)
  }

  const whatsapp = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.open(waLink(productMessage(p, p.sizes?.[1] ?? p.sizes?.[0], p.colors[0], 1)), '_blank')
  }

  return (
    <motion.article
      ref={ref}
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: Math.min(index * 0.04, 0.35) }}
      onClick={() => openProduct(p)}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          openProduct(p)
        }
      }}
      role="button"
      tabIndex={0}
      className="group cursor-pointer rounded-3xl focus-visible:outline-terracotta"
      aria-label={`View ${p.name}`}
    >
      <div className="relative overflow-hidden rounded-3xl bg-sand">
        <img
          src={p.image}
          alt={p.name}
          loading="lazy"
          decoding="async"
          className="aspect-[4/5] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        />
        <div className="absolute inset-x-3 top-3 flex items-start justify-between">
          <div className="flex flex-wrap gap-1.5">
            {p.isNew && <Badge tone="new">New</Badge>}
            {p.salePrice && <Badge tone="sale">−{discount}%</Badge>}
            {p.stock === 'low-stock' && <Badge tone="low">Low stock</Badge>}
          </div>
        </div>

        {/* hover actions — also revealed on keyboard focus */}
        <div className="absolute inset-x-3 bottom-3 flex translate-y-2 items-center justify-center gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
          <span className="flex flex-1 items-center justify-center gap-1.5 rounded-[3px] bg-espresso py-2.5 text-[12px] font-bold text-cream">
            <IconEye className="h-4 w-4" />
            View piece
          </span>
          <button
            onClick={whatsapp}
            aria-label={`Order ${p.name} on WhatsApp`}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-leaf text-cream shadow-pop transition-transform hover:scale-105 active:scale-95"
          >
            <WhatsAppIcon className="h-4.5 w-4.5" />
          </button>
          <button
            onClick={quickAdd}
            aria-label={`Add ${p.name} to inquiry basket`}
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
            <span
              key={c}
              title={c}
              className="h-3.5 w-3.5 rounded-full border border-espresso/15"
              style={{ backgroundColor: COLOR_HEX[c] ?? '#ccc' }}
            />
          ))}
          {p.sizes && (
            <span className="ml-1 text-[11px] font-semibold text-taupe">
              {p.sizes[0]}–{p.sizes[p.sizes.length - 1]}
            </span>
          )}
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-display text-lg font-semibold text-espresso">{rs(priceOf(p))}</span>
          {p.salePrice && (
            <span className="text-sm text-taupe line-through">{rs(p.price)}</span>
          )}
        </div>
      </div>
    </motion.article>
  )
})
