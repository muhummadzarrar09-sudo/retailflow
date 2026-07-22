import { motion } from 'framer-motion'
import AdminPreview from '../components/AdminPreview'
import FAQ from '../components/FAQ'
import Hero from '../components/Hero'
import { FinalCTA, Pricing } from '../components/Pricing'
import { AddonsSection, MoatSection, ProblemSection, SystemSection } from '../components/Sections'
import { usePendingAnchorScroll } from '../store/StoreContext'

/* ── Page 2 · For Shop Owners — the RetailFlow platform behind the demo ── */

export default function OwnersPage() {
  usePendingAnchorScroll()
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.16 } }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Hero />
      <ProblemSection />
      <SystemSection />
      <AdminPreview />
      <MoatSection />
      <Pricing />
      <AddonsSection />
      <FAQ />
      <FinalCTA />
    </motion.div>
  )
}
