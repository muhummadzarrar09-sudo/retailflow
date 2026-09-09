/**
 * Builds a fully self-contained preview.html — CSS, JS and every product image
 * inlined as data URIs — so the demo opens anywhere without a dev server.
 *
 * It drives the build itself (npm run build:preview) with RF_INLINE_IMAGES=1:
 * that switches the responsive <picture> ladder off, because a single HTML file
 * has no sibling /products/opt/ variants to negotiate. Only the masters are
 * inlined — the generated variants stay out of the artifact on purpose.
 */
import { execSync } from 'node:child_process'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import sharp from 'sharp'
import { join } from 'node:path'

const root = new URL('..', import.meta.url).pathname
const dist = join(root, 'dist')

execSync('npm run build', {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, RF_INLINE_IMAGES: '1' },
})

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
  // Masters are 1600-2752px wide (they are the pipeline's source of truth), but
  // the largest slot this artifact ever paints is a ~1024px card/modal, so
  // inlining them byte-for-byte would triple the file for pixels no browser asks
  // for. Downscale, re-encode, then base64.
  const buf = await sharp(join(productsDir, file))
    .resize({ width: 1024, withoutEnlargement: true })
    .jpeg({ quality: 78, progressive: true, chromaSubsampling: '4:2:0' })
    .toBuffer()
  const data = `data:${type};base64,${buf.toString('base64')}`
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

const out = join(root, 'preview.html')
writeFileSync(out, html)
console.log(`preview.html written — ${(html.length / 1024 / 1024).toFixed(2)} MB, ${inlined} images inlined`)
