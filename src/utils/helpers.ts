import { priceOf, type Product } from '../data/products'
import type { ResolvedLine } from '../store/StoreContext'

export const cn = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(' ')

export const rs = (n: number) => `Rs. ${n.toLocaleString('en-US')}`

export const WA_NUMBER = '923335666050'

export const waLink = (message: string) =>
  `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`

export const MSG_SHOP =
  'Assalamualaikum, I have a question about a product at Marigold & Clay.'

export const productLink = (p: Product) =>
  typeof window === 'undefined'
    ? `https://retailflow.demo/#product-${p.slug}`
    : `${window.location.href.split('#')[0]}#product-${p.slug}`

/** file:// previews have no shareable address — keep the message clean there */
const linkShareable = () =>
  typeof window === 'undefined' || window.location.protocol.startsWith('http')

/** "Check availability" message from a product card / detail view */
export function productMessage(p: Product, size?: string, color?: string, qty = 1): string {
  const lines = [
    'Assalamualaikum, I want to check availability for:',
    `Product: ${p.name}`,
    size ? `Size: ${size}` : null,
    color ? `Color: ${color}` : null,
    `Quantity: ${qty}`,
    `Price: ${rs(priceOf(p))}`,
    linkShareable() ? `Link: ${productLink(p)}` : null,
  ].filter(Boolean)
  return lines.join('\n')
}

/** Full basket inquiry message */
export function cartMessage(name: string, note: string, lines: ResolvedLine[], total: number): string {
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
