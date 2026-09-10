/* ── Category marquee strip — storefront interstitial ──────────────── */

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
