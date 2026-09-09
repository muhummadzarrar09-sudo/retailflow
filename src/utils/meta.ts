/** Document head management — title, meta and JSON-LD, kept in sync from one
 *  place. Server-safe: every write is guarded, so calling these during render
 *  is a no-op rather than a crash. */

import { hasDom } from './env'

export const SITE = 'Marigold & Clay'
export const TAGLINE =
  'A curated general store — clothing, accessories, footwear, stationery, cosmetics and gifts. Browse, then order in one clean WhatsApp message.'

export const setMeta = ({
  title,
  description,
  image,
}: {
  title: string
  description: string
  image?: string
}) => {
  if (!hasDom()) return
  document.title = title

  const put = (selector: string, key: 'name' | 'property', value: string, content: string) => {
    let el = document.head.querySelector<HTMLMetaElement>(selector)
    if (!el) {
      el = document.createElement('meta')
      el.setAttribute(key, value)
      document.head.appendChild(el)
    }
    el.setAttribute('content', content)
  }

  put('meta[name="description"]', 'name', 'description', description)
  put('meta[property="og:title"]', 'property', 'og:title', title)
  put('meta[property="og:description"]', 'property', 'og:description', description)
  if (image) put('meta[property="og:image"]', 'property', 'og:image', image)

  // canonical + a JSON-LD breadcrumb so each hash view is self-describing
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.rel = 'canonical'
    document.head.appendChild(link)
  }
  link.href = window.location.href.split('#')[0] + (window.location.hash.startsWith('#/') ? window.location.hash : '')
}

/** serialize + inject a schema.org block, replacing any previous one we own */
export const setJsonLd = (id: string, data: unknown) => {
  if (!hasDom()) return
  let el = document.getElementById(id) as HTMLScriptElement | null
  if (!data) {
    el?.remove()
    return
  }
  if (!el) {
    el = document.createElement('script')
    el.id = id
    el.type = 'application/ld+json'
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(data)
}
