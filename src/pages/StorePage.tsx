import { motion } from 'framer-motion'
import { Marquee } from '../components/Storefront'
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

/* ── Page 1 · The Shop — Marigold & Clay, a working demo storefront ──
   'home' renders the campaign storefront; every other view renders a
   full collection page (New / Sale / Shop All / each category rack). */

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
  const { view } = useStore()

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.16 } }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {view === 'home' ? <HomeSections /> : <CollectionPage view={view} />}
    </motion.div>
  )
}
