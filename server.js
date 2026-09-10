/**
 * Dev server with true SSR — every document request is rendered by
 * react-dom/server (the same production prerender path), so the page
 * arrives fully painted and the client only hydrates it.
 *
 * Vite runs in middleware mode for module serving, static assets and HMR;
 * this file adds only the document shell (render root = src/entry-server.tsx).
 */
import { readFileSync } from 'node:fs'
import http from 'node:http'
import { createServer as createViteServer } from 'vite'

const PORT = process.env.PORT ? Number(process.env.PORT) : 5173
const HOST = '0.0.0.0'

/** @type {import('vite').ViteDevServer} */
let vite

async function ssrFallback(req, res) {
  /* nothing in the vite chain wanted this request → it's a document;
     hand back a server-rendered page */
  try {
    const url = req.url || '/'
    // read per request so head edits (icons, preloads) take effect instantly
    const indexHtml = readFileSync(new URL('./index.html', import.meta.url), 'utf-8')
    const template = await vite.transformIndexHtml(url, indexHtml)
    const { render } = await vite.ssrLoadModule('/src/entry-server.tsx')
    const appHtml = render()
    const html = template.replace(
      '<div id="root"></div>',
      `<div id="root">${appHtml}</div>`,
    )
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.setHeader('Cache-Control', 'no-cache')
    res.end(html)
  } catch (error) {
    vite.ssrFixStacktrace?.(error)
    console.error('[ssr] render failed:', error)
    res.statusCode = 500
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.end(error instanceof Error ? error.stack : String(error))
  }
}

const server = http.createServer((req, res) => {
  vite.middlewares(req, res, () => void ssrFallback(req, res))
})

vite = await createViteServer({
  appType: 'custom',
  logLevel: 'info',
  server: {
    middlewareMode: true,
    // let Vite attach its HMR websocket to OUR http server
    hmr: { server },
  },
})

server.listen(PORT, HOST, () => {
  console.log(`\n  storefront dev server (SSR) → http://${HOST}:${PORT}/\n`)
})
