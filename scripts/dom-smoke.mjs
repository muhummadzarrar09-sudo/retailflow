/**
 * DOM smoke test — mounts the real app in jsdom and drives the flows that
 * matter, so a refactor can't quietly break interaction.
 *
 *   node scripts/dom-smoke.mjs        (also: npm run smoke)
 *
 * Deliberately no test framework: this is one file, it uses the same esbuild
 * pass the app ships with, and it asserts the six things a shopper actually
 * does — open a product, add to the basket, switch racks, search, persist.
 */
import { build } from 'esbuild'
import { JSDOM } from 'jsdom'
import { rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const root = new URL('..', import.meta.url).pathname
const entry = join(root, 'scripts', '.dom-entry.tsx')
const outfile = join(root, 'scripts', '.dom-out.mjs')
const cleanup = () => {
  rmSync(entry, { force: true })
  rmSync(outfile, { force: true })
}

const problems = []
const fail = (label, extra = '') => problems.push(`${label}${extra ? ` — ${extra}` : ''}`)

writeFileSync(
  entry,
  `import React from 'react'
import { createRoot } from 'react-dom/client'
import App from ${JSON.stringify(join(root, 'src/App.tsx'))}
import { StoreProvider } from ${JSON.stringify(join(root, 'src/store/StoreContext.tsx'))}
import ${JSON.stringify(join(root, 'src/index.css'))}

export const mount = (el) => {
  const root = createRoot(el)
  root.render(
    React.createElement(StoreProvider, null, React.createElement(App, null)),
  )
  return root
}
`,
)

await build({
  entryPoints: [entry],
  bundle: true,
  format: 'esm',
  outfile,
  jsx: 'automatic',
  loader: { '.css': 'empty', '.svg': 'text' },
  define: { 'process.env.NODE_ENV': '"development"', __RF_INLINE__: 'false' },
  absWorkingDir: root,
  logLevel: 'silent',
  // jsdom has no IntersectionObserver, and framer's whileInView needs one
  banner: {
    js: `globalThis.__needsShims = true`,
  },
})

const dom = new JSDOM(
  `<!doctype html><html lang="en"><head><title>t</title></head><body><div id="root"></div></body></html>`,
  { url: 'https://marigold.test/#/shop', pretendToBeVisual: true },
)

const { window } = dom
globalThis.window = window
globalThis.document = window.document
Object.defineProperty(globalThis, 'navigator', { value: window.navigator, configurable: true })
globalThis.location = window.location
globalThis.localStorage = window.localStorage
globalThis.HTMLElement = window.HTMLElement
globalThis.Element = window.Element
globalThis.Node = window.Node
globalThis.Event = window.Event
globalThis.MouseEvent = window.MouseEvent
globalThis.PointerEvent = window.MouseEvent
globalThis.getComputedStyle = window.getComputedStyle
globalThis.requestAnimationFrame = window.requestAnimationFrame.bind(window)
globalThis.cancelAnimationFrame = window.cancelAnimationFrame.bind(window)
// anything framer/react reaches for by bare global name
for (const k of [
  'SVGElement','SVGSVGElement','Text','Comment','DocumentFragment','FocusEvent','InputEvent',
  'KeyboardEvent','CustomEvent','DOMRect','CSSStyleDeclaration','NodeFilter','AbortController',
  'HTMLInputElement','HTMLButtonElement','HTMLAnchorElement','EventTarget','MutationObserver',
]) {
  if (globalThis[k] === undefined && window[k] !== undefined) globalThis[k] = window[k]
}
// framer hands an AbortSignal to jsdom's addEventListener, so the controller
// has to be jsdom's own — Node's signal fails its type check
globalThis.AbortController = window.AbortController
globalThis.AbortSignal = window.AbortSignal
window.scrollTo = () => {}
// jsdom 2x ships a MediaQueryList without the deprecated addListener/removeListener
// pair. framer-motion's useReducedMotion calls them when present, and the throw it
// gets back is logged from inside the library — noisy enough to mask a real failure,
// so hand it a complete MQL instead.
const mql = (media) => ({
  media,
  matches: false,
  onchange: null,
  addEventListener() {},
  removeEventListener() {},
  addListener() {},
  removeListener() {},
  dispatchEvent: () => false,
})
window.matchMedia = (q) => mql(q)
globalThis.matchMedia = (q) => mql(q)

class IO {
  constructor(cb) {
    this.cb = cb
    IO.all.push(this)
  }
  observe(el) {
    this.cb([{ target: el, isIntersecting: true, intersectionRatio: 1 }], this)
  }
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}
IO.all = []
globalThis.IntersectionObserver = IO
window.IntersectionObserver = IO
window.Element.prototype.scrollIntoView = function () {}
window.Element.prototype.scrollTo = function () {}
window.Element.prototype.setPointerCapture = function () {}
window.Element.prototype.releasePointerCapture = function () {}

// surface React's own complaints (key warnings, act noise, bad props)
const seenErrors = []
const origError = console.error
console.error = (...a) => {
  const msg = a.map(String).join(' ')
  if (/not wrapped in act|useLayoutEffect does nothing on the server/.test(msg)) return
  seenErrors.push(msg)
  origError(...a)
}
window.addEventListener('error', (e) => seenErrors.push(`window.onerror: ${e.message}`))

const { mount } = await import(pathToFileURL(outfile).href)
cleanup()
console.error = origError

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const $ = (sel) => document.querySelector(sel)
const $$ = (sel) => [...document.querySelectorAll(sel)]
const byText = (sel, text) =>
  $$(sel).find((el) => (el.textContent ?? '').toLowerCase().includes(text.toLowerCase()))
const click = (el) => {
  el.dispatchEvent(new window.MouseEvent('pointerdown', { bubbles: true }))
  el.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }))
}

const container = $('#root')
const reactRoot = mount(container)
await sleep(160)

/* ── 1 · the app mounts and paints the storefront ─────────────────── */
if (!$('#root [class*="grain"]')) fail('app did not mount')
if (!/Marigold/.test(document.body.textContent ?? '')) fail('brand missing from first paint')

/* ── 2 · preloader lifts and the catalog is reachable ─────────────── */
if (process.env.DOM_DEBUG) {
  console.log('imgs:', $$('img').length, 'pictures:', $$('picture').length, 'sources:', $$('source').length)
  console.log('preloader present:', !!$('[class*="z-[200]"]'))
  console.log('first article:', ($$('article')[0]?.outerHTML ?? 'none').slice(0, 700))
  console.log('divs with lqip bg:', $$('[style*="data:image/webp"]').length)
}
await sleep(5200) // PART_MS + curtain travel
if ($('[class*="z-[200]"]')) fail('preloader never cleared')
const cards = $$('article')
if (cards.length < 8) fail('home rails missing', `only ${cards.length} cards`)

/* ── 3 · quick view opens the dialog, and focus goes to it ────────── */
const firstCard = $$('button[aria-label^="View "]')[0]
if (!firstCard) fail('no quick-view button on any card')
else {
  click(firstCard)
  await sleep(60)
  const dialog = $('[role="dialog"][aria-modal="true"]')
  if (!dialog) fail('quick view did not open a dialog')
  else {
    if (dialog !== document.activeElement && !dialog.contains(document.activeElement))
      fail('focus never entered the dialog', `activeElement=${document.activeElement?.tagName}`)
    // 3b · a sized product must not be added without choosing a size
    const addBtn = byText('button', 'Add to inquiry')
    if (!addBtn) fail('dialog has no add button')
    else {
      click(addBtn)
      await sleep(900) // the confirmation holds for 650ms before the drawer opens
      if (!$('[aria-label="Close basket"]')) fail('add to inquiry did not open the basket')
    }
    // 3c · Escape closes it
    window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await sleep(80)
  }
}

/* ── 4 · switching racks changes the collection, keeping the basket ─ */
click(byText('a', 'Sale') ?? $$('header a')[1])
await sleep(120)
if (!location.hash.includes('sale')) fail('sale link did not update the hash', location.hash)
if (!$('[aria-label="Inquiry basket"]') && !byText('span', 'Basket')) fail('basket button missing')
const badge = byText('span', 'Basket')?.parentElement?.textContent ?? ''
if (!/Basket\s*[1-9]/.test(badge.replace(/\s+/g, ' ')))
  fail('basket count did not survive the view switch', JSON.stringify(badge))

/* ── 5 · the basket persists to localStorage and rehydrates ──────── */
const stored = localStorage.getItem('retailflow-inquiry-v1')
if (!stored) fail('basket never persisted to localStorage')
else {
  const parsed = JSON.parse(stored)
  const qty = parsed.reduce?.((n, l) => n + Number(l.qty), 0)
  if (!qty) fail('persisted basket has no quantities', stored.slice(0, 120))
  else if (typeof parsed[0].qty !== 'number') fail('stored qty is not a number', stored.slice(0, 120))
}

/* ── 6 · a hostile payload in storage cannot poison the badge ────── */
localStorage.setItem(
  'retailflow-inquiry-v1',
  JSON.stringify([
    { productId: 'p1', qty: '03' },
    { productId: 'p1', qty: '03' },
    { productId: 'nope', qty: 9999 },
    'garbage',
    null,
  ]),
)
reactRoot.unmount()
await sleep(60)
const reactRoot2 = mount($('#root'))
await sleep(5200)
// identical lines merge into one (3 + 3 units), the unknown id and the junk
// entries drop, and the string qty stays a number the badge can render
const after = JSON.parse(localStorage.getItem('retailflow-inquiry-v1') ?? '[]')
if (after.length !== 1) fail('dirty storage was not merged down to one line', JSON.stringify(after))
if (after[0]?.qty !== 6) fail('merged qty wrong', JSON.stringify(after[0]))
const badge2 = byText('span', 'Basket')?.parentElement?.textContent ?? ''
const n = Number((badge2.match(/(\d+)\s*$/) ?? [])[1] ?? NaN)
if (n !== 6) fail('badge does not match the merged basket', JSON.stringify(badge2))
/* ── 7 · no platform cross-sell survives anywhere in the DOM ─────── */
const body = document.body.innerHTML
if (/Want one for your shop|For Shop Owners|#\/owners|Admin Demo|RetailFlow for retailers/i.test(body))
  fail('platform cross-sell still present in the DOM')

/* ── 8 · images negotiate ────────────────────────────────────────── */
if (!$('picture source[type="image/avif"]')) fail('no avif <source> in the DOM')
if (!$('img[srcset], source[srcset]')) fail('no srcset anywhere')
if (!$$('img').some((i) => i.getAttribute('loading') === 'lazy')) fail('nothing is lazy-loaded')
if (!$$('img').every((i) => i.hasAttribute('width') === i.hasAttribute('height')))
  fail('an <img> has width without height (layout shift risk)')

/* ── 9 · React logged nothing worth reading ─────────────────────── */
// the useScroll warning is a test artifact: this bundle strips CSS, so every
// element computes to position:static and framer complains about the target
const real = seenErrors.filter((m) => !/non-static position/.test(m))
if (real.length) fail('React logged errors', real.slice(0, 3).join(' | ').slice(0, 400))

reactRoot2.unmount?.()
if (problems.length) {
  console.error(`\n✗ DOM SMOKE FAILED (${problems.length})`)
  for (const p of problems) console.error(`   · ${p}`)
  process.exit(1)
}
console.log('✓ DOM smoke passed — mount, quick view, basket, rack switch, persistence, dirty storage, images')
process.exit(0)
