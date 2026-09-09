import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { StoreProvider } from './store/StoreContext'
import './index.css'

/**
 * The tree is isomorphic (see scripts/ssr-smoke.mjs), so it can arrive already
 * marked up — from a prerender step, a static HTML snapshot, or a real SSR
 * server. In that case we hydrate what is on the page instead of throwing it
 * away; with an empty #root (plain `npm run dev`) we client-render as before.
 */
const container = document.getElementById('root')
if (!container) throw new Error('#root is missing from the document')

const app = (
  <React.StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </React.StrictMode>
)

if (container.hasChildNodes()) {
  ReactDOM.hydrateRoot(container, app)
} else {
  ReactDOM.createRoot(container).render(app)
}
