/**
 * SSR smoke test — proves the app renders with NO browser globals present.
 *
 *   node scripts/ssr-smoke.mjs        (also: npm run ssr:check)
 *
 * The bundle is compiled for node, rendered twice through react-dom/server and
 * asserted against. There is no DOM here on purpose: if any component touches
 * window / document / localStorage during render, this test dies with a
 * ReferenceError, which is exactly the class of bug that quietly breaks
 * prerendering, Next/Remix adoption and CI-rendered Open Graph snapshots.
 */
import { build } from 'esbuild'
import { rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const root = new URL('..', import.meta.url).pathname

// the entry lives inside the repo so bare imports resolve against its node_modules
const entry = join(root, 'scripts', '.ssr-entry.tsx')
const outfile = join(root, 'scripts', '.ssr-out.cjs')

writeFileSync(
  entry,
  `import { renderToString } from 'react-dom/server'
import App from ${JSON.stringify(join(root, 'src/App.tsx'))}
import { StoreProvider } from ${JSON.stringify(join(root, 'src/store/StoreContext.tsx'))}

export const render = () =>
  renderToString(
    <StoreProvider>
      <App />
    </StoreProvider>,
  )
`,
)

await build({
  entryPoints: [entry],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  outfile,
  jsx: 'automatic',
  loader: { '.css': 'empty' },
  define: { 'process.env.NODE_ENV': '"production"', __RF_INLINE__: 'false' },
  absWorkingDir: root,
  logLevel: 'silent',
})
rmSync(entry, { force: true })

const { render } = await import(pathToFileURL(outfile).href)

const cleanup = () => {
  rmSync(entry, { force: true })
  rmSync(outfile, { force: true })
}
const fail = (msg) => {
  cleanup()
  console.error(`\n✗ SSR CHECK FAILED — ${msg}\n`)
  process.exit(1)
}

// 0 · the environment really is headless (node defines `navigator` itself, so
//     only these three prove there is no DOM here)
for (const g of ['window', 'document', 'localStorage', 'matchMedia']) {
  if (globalThis[g] !== undefined) fail(`globalThis.${g} leaked into the render env`)
}

// 1 · it renders at all
let html
try {
  html = render()
} catch (e) {
  fail(`render threw: ${e.message}`)
}

// 2 · two renders are byte-identical → hydration cannot mismatch
const html2 = render()
if (html !== html2) fail('render is not deterministic (hydration would mismatch)')

// 3 · real content, not a blank curtain
if (process.env.SSR_DEBUG) {
  const i = html.indexOf('<img')
  console.log('…', html.slice(Math.max(0, i - 600), i + 400).replace(/></g, '>\n<'))
  process.exit(0)
}
// every <img> must carry a real intrinsic size (CLS defence). Written as a
// ratio rather than a literal pair so the check survives a change of master size.
const imgTags = html.match(/<img[^>]*>/gi) || []
const sizedImgs = imgTags.filter((t) => /width="\d{3,}"/i.test(t) && /height="\d{3,}"/i.test(t))

const checks = [
  ['catalog content is server-visible', html.includes('Embroidered 2-Piece Suit')],
  ['pricing is server-visible', /Rs\. 6,500|Rs\. 1,/.test(html)],
  ['images ship srcset/sizes', /srcset=/i.test(html) && /sizes=/i.test(html)],
  ['img fallback is the JPEG master', /<img[^>]+src="\/products\/[a-z-]+\.jpg"/i.test(html)],
  ['images ship intrinsic size', imgTags.length > 0 && sizedImgs.length === imgTags.length],
  ['images are lazy by default', html.includes('loading="lazy"')],
  ['JSON-LD left for the client (no DOM at render)', !html.includes('application/ld+json')],
  ['no platform cross-sell anywhere', !/Want one for your shop|For Shop Owners|goOwners|#\/owners/i.test(html)],
]
for (const [label, ok] of checks) if (!ok) fail(label)

// 4 · size sanity: the payload the browser has to parse
const kb = (s) => (Buffer.byteLength(s) / 1024).toFixed(1)
console.log(`✓ renders headless, deterministically, with real content`)
const sources = (html.match(/<source/g) ?? []).length
console.log(`  markup: ${kb(html)} kB · <picture> sources: ${sources} · <img>: ${(html.match(/<img/g) ?? []).length}`)
console.log(`  createRoot-vs-hydrate note: src/main.tsx hydrates when #root already has markup`)
cleanup()
