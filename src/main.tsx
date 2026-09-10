import React from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App'
import { shopRouteFromHash, StoreProvider } from './store/StoreContext'
import './index.css'

const app = (
  <React.StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </React.StrictMode>
)

const rootEl = document.getElementById('root')!

/* The served page is server-rendered for the home route. When the URL asks
 * for exactly that, hydrate → zero client-side re-render, images already
 * painted. Deep links (a collection or product hash) instead swap the
 * home markup for a straight client render of the requested page — no
 * hydration-mismatch fireworks in the console. */
const route = shopRouteFromHash()
const ssrIsUsable =
  rootEl.hasChildNodes() && route.kind === 'shop' && route.view === 'home'

if (ssrIsUsable) {
  hydrateRoot(rootEl, app)
} else {
  if (rootEl.hasChildNodes()) rootEl.innerHTML = ''
  createRoot(rootEl).render(app)
}
