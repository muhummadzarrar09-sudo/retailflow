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
  const needle = `/products/${file}`
  if (js.includes(needle)) {
    js = js.split(needle).join(data)
    inlined++
  }
}
// Escape closing script tags just in case, then inline as a module
js = js.replace(/<\/script>/g, '<\\/script>')
html = html.replace(
  /<script type="module"[^>]*><\/script>/,
  () => `<script type="module">\n${js}\n</script>`,
)

// 3 · inline the brand assets (favicon/apple-touch-icon) so the standalone
// file keeps the logo mark even when opened from disk with no server
for (const [needle, file] of [
  ['/brand/favicon.svg', join(root, 'public', 'brand', 'favicon.svg')],
  ['/brand/logo.svg', join(root, 'public', 'brand', 'logo.svg')],
  ['/brand/logo-mark.svg', join(root, 'public', 'brand', 'logo-mark.svg')],
]) {
  let svg
  try {
    svg = readFileSync(file, 'utf8')
  } catch {
    continue
  }
  const data = `data:image/svg+xml,${encodeURIComponent(svg).replace(/'/g, '%27')}`
  html = html.split(needle).join(data)
}

const out = join(root, 'preview.html')
writeFileSync(out, html)
console.log(`preview.html written — ${(html.length / 1024 / 1024).toFixed(2)} MB, ${inlined} images inlined`)
