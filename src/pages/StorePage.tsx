import { motion } from 'framer-motion'
import { Marquee } from '../components/Sections'
import {
  CampaignHero,
  CategoryTiles,
  CraftSplit,
  EditorialBanner,
  LookbookStrip,
  NewArrivalsRail,
  Newsletter,
  Policies,
  TextureBreak,
} from '../components/Storefront'
import { usePendingAnchorScroll, useStore } from '../store/StoreContext'
import CollectionPage from './CollectionPage'
import ProductPage from './ProductPage'

/* ── The Shop — Marigold & Clay storefront ───────────────────────────
   home      → campaign storefront
   other view→ full collection page (New / Sale / Shop All / a rack)
   product   → a full product detail page, Shopify-style with its own URL */

function HomeSections() {
  return (
    <>
      <CampaignHero />
      <Marquee />
      <CategoryTiles />
      <NewArrivalsRail />
      <CraftSplit />
      <EditorialBanner />
      <LookbookStrip />
      <TextureBreak />
      <Policies />
      <Newsletter />
    </>
  )
}

export default function StorePage() {
  usePendingAnchorScroll()
  const { route, view, product } = useStore()

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.16 } }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {route.kind === 'product' ? (
        product ? (
          <ProductPage product={product} />
        ) : (
          <CollectionPage view="all" />
        )
      ) : view === 'home' ? (
        <HomeSections />
      ) : (
        <CollectionPage view={view!} />
      )}
    </motion.div>
  )
}
