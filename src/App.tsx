import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import InquiryCart from './components/InquiryCart'
import Nav from './components/Nav'
import Preloader from './components/Preloader'
import { Footer, StickyCTA } from './components/Footer'
import StorePage from './pages/StorePage'
import { useStore, VIEW_LABEL } from './store/StoreContext'
import { products } from './data/products'
import { warmProductImages } from './utils/preloadImages'

export default function App() {
  // content renders immediately (and ships server-rendered); `loaded` only
  // releases the entrance choreography once the silk starts parting
  const [loaded, setLoaded] = useState(false)
  const reduce = useReducedMotion()
  const { route, view, product, openProduct } = useStore()

  // warm the whole catalog into the browser cache during the intro
  useEffect(() => {
    warmProductImages()
  }, [])

  // legacy deep links shared on WhatsApp: #product-<slug> → full product page
  useEffect(() => {
    const m = window.location.hash.match(/^#product-(.+)$/)
    if (!m) return
    const p = products.find((x) => x.slug === m[1])
    if (p) openProduct(p)
    // run once on initial load only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onProduct = route.kind === 'product' && product != null

  // every page switch starts at the top, with a title + description to match
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
    const description =
      'Marigold & Clay is a working storefront: curated clothing, accessories, stationery and gifts — browse, filter and order in one WhatsApp message.'
    let title: string
    if (onProduct && product) {
      title = `${product.name} — Marigold & Clay`
      document
        .querySelector('meta[name="description"]')
        ?.setAttribute('content', product.description)
    } else {
      title =
        view === 'home' || view == null
          ? 'Marigold & Clay — Curated General Store'
          : `${VIEW_LABEL[view]} — Marigold & Clay`
      document.querySelector('meta[name="description"]')?.setAttribute('content', description)
    }
    document.title = title
  }, [route, onProduct, product, view])

  return (
    <div className="min-h-screen">
      <div className="grain-overlay" aria-hidden />
      <Preloader onComplete={() => setLoaded(true)} />
      <Nav />
      <motion.div
        className="origin-top overflow-x-clip"
        variants={
          reduce
            ? { hidden: { opacity: 0 }, shown: { opacity: 1 } }
            : {
                hidden: { scale: 1.055, filter: 'blur(10px)', opacity: 0.6 },
                shown: { scale: 1, filter: 'blur(0px)', opacity: 1 },
              }
        }
        initial="hidden"
        animate={loaded ? 'shown' : 'hidden'}
        transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <main>
          {/* Remount the page on every route change. We deliberately avoid
              AnimatePresence mode="wait" cross-page exit/enter here: it can
              leave the incoming page stuck at opacity 0 (blank) when the
              exit handoff is interrupted in a real browser. Directly keyed
              remounting makes each navigation mount exactly like the initial
              page load, which is reliable. */}
          <StorePage
            ready={loaded}
            key={route.kind === 'product' ? `p-${route.slug}` : `v-${route.view}`}
          />
        </main>
        <Footer />
      </motion.div>
      {/* overlays */}
      <InquiryCart />
      <StickyCTA />
    </div>
  )
}
