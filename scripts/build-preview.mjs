/**
 * Builds a fully self-contained preview.html — CSS, JS, and every product
 * image inlined as data URIs — so the demo can be opened anywhere (including
 * offline viewers) without a dev server. Run after `npm run build`.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const root = new URL('..', import.meta.url).pathname
const dist = join(root, 'dist')

let html = readFileSync(join(dist, 'index.html'), 'utf8')

// 1 · inline CSS
const cssFile = readdirSync(join(dist, 'assets')).find((f) => f.endsWith('.css'))
const css = readFileSync(join(dist, 'assets', cssFile), 'utf8')
html = html.replace(
  /<link rel="stylesheet"[^>]*>/,
  () => `<style>\n${css}\n</style>`,
)

// 2 · inline JS (and swap product image paths for data URIs)
const jsFile = readdirSync(join(dist, 'assets')).find((f) => f.endsWith('.js'))
let js = readFileSync(join(dist, 'assets', jsFile), 'utf8')

const mime = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', svg: 'image/svg+xml' }
const productsDir = join(root, 'public', 'products')
let inlined = 0
for (const file of readdirSync(productsDir)) {
  const ext = file.split('.').pop().toLowerCase()
  const type = mime[ext]
  if (!type) continue
  const data = `data:${type};base64,${readFileSync(join(productsDir, file)).toString('base64')}`
  //Vite rewrites absolute head links to "./products/…" in the built HTML —
  // swap the longer, dotted needle first so nothing survives as ".data:…"
  for (const needle of [`./products/${file}`, `/products/${file}`]) {
    if (js.includes(needle)) {
      js = js.split(needle).join(data)
      inlined++
    }
    // the prerendered markup (and its preload hint) reference the same files
    if (html.includes(needle)) {
      html = html.split(needle).join(data)
      inlined++
    }
  }
}
// Escape closing script tags just in case, then inline as a module
js = js.replace(/<\/script>/g, '<\\/script>')
html = html.replace(
  /<script type="module"[^>]*><\/script>/,
  () => `<script type="module">\n${js}\n</script>`,
)

const svgData = (buf) => `data:image/svg+xml,${encodeURIComponent(buf.toString('utf8')).replace(/'/g, '%27')}`

// 3 · inline the brand assets (favicon/apple-touch-icon) so the standalone
// file keeps the logo mark even when opened from disk with no server
for (const [needle, file, toData] of [
  ['/brand/favicon.svg', join(root, 'public', 'brand', 'favicon.svg'), svgData],
  ['/brand/logo.svg', join(root, 'public', 'brand', 'logo.svg'), svgData],
  ['/brand/logo-mark.svg', join(root, 'public', 'brand', 'logo-mark.svg'), svgData],
  [
    '/brand/favicon-192.png',
    join(root, 'public', 'brand', 'favicon-192.png'),
    (buf) => `data:image/png;base64,${buf.toString('base64')}`,
  ],
]) {
  let buf
  try {
    buf = readFileSync(file)
  } catch {
    continue
  }
  const data = toData(buf)
  for (const variant of [`.${needle}`, needle]) html = html.split(variant).join(data)
}

const out = join(root, 'preview.html')
writeFileSync(out, html)
console.log(`preview.html written — ${(html.length / 1024 / 1024).toFixed(2)} MB, ${inlined} images inlined`)
