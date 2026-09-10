/**
 * Prerenders the storefront home page into dist/index.html — the served
 * document contains the complete campaign storefront (hero, sections,
 * footer) with every image tag already in place, so nothing important is
 * left to render client-side. The client bundle then hydrates it.
 *
 * Run automatically as the last step of `npm run build`.
 */
import { readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { build } from 'vite'

const root = new URL('..', import.meta.url).pathname

/* bundle the server entry (react-dom/server) */
await build({
  root,
  logLevel: 'warn',
  build: {
    ssr: join(root, 'src/entry-server.tsx'),
    outDir: join(root, 'dist-ssr'),
  },
})

const { render } = await import(join(root, 'dist-ssr', 'entry-server.js'))
const appHtml = render()

const file = join(root, 'dist', 'index.html')
const template = readFileSync(file, 'utf8')
const marker = '<div id="root"></div>'
if (!template.includes(marker)) {
  throw new Error('prerender: could not find the #root marker in dist/index.html')
}
writeFileSync(file, template.replace(marker, `<div id="root">${appHtml}</div>`))
rmSync(join(root, 'dist-ssr'), { recursive: true, force: true })

const kb = (appHtml.length / 1024).toFixed(1)
console.log(`prerendered home page → dist/index.html (+${kb} kB of markup)`)
