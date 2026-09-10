import { products } from '../data/products'

let started = false

/* Eagerly pull every catalog + campaign image into the browser cache. The
 * silk intro doubles as the load window — by the time the curtains part,
 * every product photo is already in memory and no page navigation ever
 * shows an image streaming in client-side. ~6 MB total, all local. */
export function warmProductImages() {
  if (started || typeof Image === 'undefined') return
  started = true

  const urls = new Set<string>([
    '/products/campaign-hero.jpg',
    '/products/campaign-craft.jpg',
    '/products/campaign-sale.jpg',
    '/products/campaign-flatlay.jpg',
    '/products/campaign-look.jpg',
  ])
  for (const p of products) {
    urls.add(p.image)
    for (const alt of Object.values(p.colorImages ?? {})) urls.add(alt)
  }

  for (const url of urls) {
    const img = new Image()
    img.decoding = 'async'
    img.src = url
  }
}
