import { products } from '../data/products'

let started = false

/* Eagerly pull every catalog + campaign image into the browser cache so no
 * page navigation ever shows an image streaming in client-side. (~6 MB, all
 * local.) The warm-up starts only after the window `load` event AND the main
 * thread goes idle — the hero's first slides, the webfonts and the intro
 * animation get the network first; the catalog fills the cache in the
 * background instead of racing the content the visitor is actually looking
 * at. */
export function warmProductImages() {
  if (started || typeof Image === 'undefined') return
  started = true

  const urls = new Set<string>([
    '/products/campaign-hero.jpg',
    '/products/campaign-craft.jpg',
    '/products/campaign-sale.jpg',
    '/products/campaign-flatlay.jpg',
    '/products/campaign-look.jpg',
    '/brand/logo-bloom.png', // the intro appliqué — must be instant
  ])
  for (const p of products) {
    urls.add(p.image)
    for (const alt of Object.values(p.colorImages ?? {})) urls.add(alt)
  }

  const warm = () => {
    const whenIdle = (cb: () => void) =>
      typeof window.requestIdleCallback === 'function'
        ? window.requestIdleCallback(cb, { timeout: 2500 })
        : window.setTimeout(cb, 1500)
    whenIdle(() => {
      for (const url of urls) {
        const img = new Image()
        img.decoding = 'async'
        img.src = url
      }
    })
  }

  if (document.readyState === 'complete') warm()
  else window.addEventListener('load', warm, { once: true })
}
