import { Marquee } from '../components/Sections'
import {
  CampaignHero,
  CategoryTiles,
  CraftSplit,
  EditorialBanner,
  LeadIn,
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
   product   → a full product detail page, Shopify-style with its own URL
   The wrapper is intentionally a plain div: it must never sit invisible
   while a mount animation runs, so content is always shown on navigation. */

function HomeSections({ ready }: { ready: boolean }) {
  return (
    <>
      <CampaignHero ready={ready} />
      <LeadIn />
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

export default function StorePage({ ready = true }: { ready?: boolean }) {
  usePendingAnchorScroll()
  const { route, view, product } = useStore()

  return (
    <div>
      {route.kind === 'product' ? (
        product ? (
          <ProductPage product={product} />
        ) : (
          <CollectionPage view="all" />
        )
      ) : view === 'home' ? (
        <HomeSections ready={ready} />
      ) : (
        <CollectionPage view={view!} />
      )}
    </div>
  )
}
