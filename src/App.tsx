import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import InquiryCart from './components/InquiryCart'
import Nav from './components/Nav'
import Preloader from './components/Preloader'
import ProductModal from './components/ProductModal'
import { Ribbon } from './components/Storefront'
import { Footer, StickyCTA } from './components/Footer'
import OwnersPage from './pages/OwnersPage'
import StorePage from './pages/StorePage'
import { useStore, VIEW_LABEL } from './store/StoreContext'
import { products } from './data/products'

export default function App() {
  // main content mounts the moment the silk starts lifting, so the hero's
  // own entrance choreography plays as the storefront is revealed
  const [loaded, setLoaded] = useState(false)
  const reduce = useReducedMotion()
  const { route, openProduct } = useStore()

  // deep links shared on WhatsApp: #product-<slug> opens straight into
  // that product (it waits under the curtains and greets after the reveal)
  useEffect(() => {
    const m = window.location.hash.match(/^#product-(.+)$/)
    if (!m) return
    const p = products.find((x) => x.slug === m[1])
    if (p) openProduct(p)
    // run once on initial load only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // every page switch starts at the top, with a title + description to match
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
    const title =
      route.page === 'owners'
        ? 'RetailFlow for Shop Owners · Zarrar.Solutions'
        : route.view === 'home'
          ? 'Marigold & Clay — Curated General Store · RetailFlow Demo'
          : `${VIEW_LABEL[route.view]} — Marigold & Clay · RetailFlow Demo`
    const description =
      route.page === 'owners'
        ? 'RetailFlow turns local shops into premium online catalogs with WhatsApp ordering — packages, admin demo and process by Zarrar.Solutions.'
        : 'Marigold & Clay is a working demo storefront: curated clothing, accessories, stationery and gifts — browse, filter and order in one WhatsApp message.'
    document.title = title
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', description)
  }, [route])

  return (
    <div className="min-h-screen">
      <div className="grain-overlay" aria-hidden />
      <Preloader onComplete={() => setLoaded(true)} />
      <Ribbon />
      <Nav />
      {loaded && (
        <motion.div
          className="origin-top overflow-x-clip"
          initial={reduce ? { opacity: 0 } : { scale: 1.055, filter: 'blur(10px)', opacity: 0.6 }}
          animate={reduce ? { opacity: 1 } : { scale: 1, filter: 'blur(0px)', opacity: 1 }}
          transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <main>
            <AnimatePresence mode="wait" initial={false}>
              {route.page === 'shop' ? (
                <StorePage key={`shop-${route.view}`} />
              ) : (
                <OwnersPage key="owners" />
              )}
            </AnimatePresence>
          </main>
          <Footer />
        </motion.div>
      )}
      {/* overlays — work on both pages */}
      <InquiryCart />
      <ProductModal />
      <StickyCTA />
    </div>
  )
}
