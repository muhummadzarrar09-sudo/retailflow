import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import InquiryCart from './components/InquiryCart'
import Nav from './components/Nav'
import Preloader from './components/Preloader'
import ProductModal from './components/ProductModal'
import { Ribbon } from './components/Storefront'
import { Footer, StickyCTA } from './components/Footer'
import StorePage from './pages/StorePage'
import { useStore, VIEW_LABEL } from './store/StoreContext'
import { products } from './data/products'
import { currentHash, scrollToTop } from './utils/env'
import { setMeta } from './utils/meta'

export default function App() {
  // the storefront is mounted from the very first paint (server HTML, no-JS
  // and LCP all see real content); the silk simply lifts off it. `revealed`
  // drives the animation instead of a mount/unmount gate, so the server render
  // and the hydrated client render are the same tree.
  const [revealed, setRevealed] = useState(false)
  const reduce = useReducedMotion()
  const { view, openProduct } = useStore()

  // deep links shared on WhatsApp: #product-<slug> opens straight into
  // that product (it waits under the curtains and greets after the reveal)
  useEffect(() => {
    const m = currentHash().match(/^#product-(.+)$/)
    if (!m) return
    const p = products.find((x) => x.slug === m[1])
    if (p) openProduct(p)
    // run once on initial load only
  }, [openProduct])

  // every view switch starts at the top, with a title + description to match
  useEffect(() => {
    // instant on purpose — 'auto'/'smooth' would animate a full-page jump on
    // every rack switch, which reads as a lag, not as a transition
    scrollToTop()
    setMeta({
      title:
        view === 'home'
          ? 'Marigold & Clay — Curated General Store'
          : `${VIEW_LABEL[view]} — Marigold & Clay`,
      description:
        view === 'home'
          ? 'Browse a curated general store — clothing, accessories, stationery, cosmetics and gifts — then order in one clean WhatsApp message.'
          : `${VIEW_LABEL[view]} at Marigold & Clay: real prices, sizes, colors and stock, with every inquiry sent straight to the shop on WhatsApp.`,
    })
  }, [view])

  return (
    <div className="min-h-screen">
      <div className="grain-overlay" aria-hidden />
      <Preloader onComplete={() => setRevealed(true)} />
      <Ribbon />
      <Nav />
      <motion.div
        className="origin-top overflow-x-clip"
        initial={false}
        animate={
          revealed
            ? reduce
              ? { opacity: 1 }
              : { scale: 1, filter: 'blur(0px)', opacity: 1 }
            : reduce
              ? { opacity: 0 }
              : { scale: 1.055, filter: 'blur(10px)', opacity: 0.6 }
        }
        transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <main>
          {/* deliberately unkeyed — hopping between racks keeps your query,
              filters and sort; the view prop drives the results */}
          <StorePage />
        </main>
        <Footer />
      </motion.div>
      {/* overlays */}
      <InquiryCart />
      <ProductModal />
      <StickyCTA />
    </div>
  )
}
