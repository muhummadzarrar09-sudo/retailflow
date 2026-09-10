import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App'
import { StoreProvider } from './store/StoreContext'

/* Server-side render — paints the full home page (hero, sections, footer)
 * straight into the initial HTML so every image and word is delivered with
 * the very first byte. The client then hydrates this markup without a
 * client-side re-render. Hash routes can't be read server-side, so the
 * prerendered route is always the storefront home. */
export function render() {
  return renderToString(
    <StrictMode>
      <StoreProvider>
        <App />
      </StoreProvider>
    </StrictMode>,
  )
}
