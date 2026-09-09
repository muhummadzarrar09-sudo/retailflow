import { priceOf, type Product } from '../data/products'
import type { ResolvedLine } from '../store/StoreContext'
import { hasDom } from './env'

export const cn = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(' ')

export const rs = (n: number) => `Rs. ${n.toLocaleString('en-US')}`

/** the shop's generic WhatsApp opener (the only CTA left in the app) */
export const MSG_SHOP =
  'Assalamualaikum, I have a question about a product at Marigold & Clay.'

export const WA_NUMBER = '923335666050'

export const waLink = (message: string) =>
  `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`

/** file:// previews and local dev have no shareable address — keep the
 *  message clean there instead of sending a `Link: null` line */
const linkShareable = () => !hasDom() || window.location.protocol.startsWith('http')

export const productLink = (p: Product) =>
  !hasDom() ? '' : `${window.location.href.split('#')[0]}#product-${p.slug}`

/**
 * "Check availability" message from a product card / detail view.
 * The price line is the LINE total (unit × qty), matching what the basket
 * sends — a message that said "Quantity: 3 / Price: Rs. 1,250" read as if
 * three units cost 1,250.
 */
export function productMessage(
  p: Product,
  opts: { size?: string; color?: string; qty?: number; wantVariant?: boolean } = {},
): string {
  const { size, color, qty = 1, wantVariant = true } = opts
  const unit = priceOf(p)
  const lines = [
    'Assalamualaikum, I want to check availability for:',
    `Product: ${p.name}`,
    wantVariant && size ? `Size: ${size}` : null,
    wantVariant && color ? `Color: ${color}` : null,
    `Quantity: ${qty}`,
    wantVariant && qty > 1 ? `Price: ${rs(unit * qty)} (${rs(unit)} each)` : `Price: ${rs(unit)}`,
    linkShareable() ? `Link: ${productLink(p)}` : null,
  ].filter(Boolean)
  return lines.join('\n')
}

/** Full basket inquiry message */
export function cartMessage(
  name: string,
  note: string,
  lines: ResolvedLine[],
  total: number,
): string {
  const items = lines
    .map((l, i) => {
      const variant = [l.size ? `Size: ${l.size}` : null, l.color ? `Color: ${l.color}` : null]
        .filter(Boolean)
        .join(', ')
      return `${i + 1}. ${l.product.name}${variant ? ` — ${variant}` : ''} × ${l.qty} — ${rs(
        l.unit * l.qty,
      )}`
    })
    .join('\n')

  return [
    'Assalamualaikum, I would like to place an inquiry.',
    `Name: ${name.trim()}`,
    '',
    'Items:',
    items,
    '',
    `Estimated Total: ${rs(total)}`,
    note.trim() ? `Note: ${note.trim()}` : null,
  ]
    .filter((l) => l !== null)
    .join('\n')
}
