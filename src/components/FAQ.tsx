import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { cn } from '../utils/helpers'
import { IconPlus, Reveal, SectionHeading } from './ui'

const FAQS = [
  {
    q: 'Is RetailFlow a full e-commerce store?',
    a: 'No — and that\u2019s deliberate. RetailFlow is a product catalog plus WhatsApp inquiry system. Customers browse like e-commerce, but the order itself is confirmed in chat, the way local retail already works. If you later need more, payments, automation and deeper features are available as add-ons.',
  },
  {
    q: 'Can customers pay online?',
    a: 'Not by default. The standard flow is: browse → inquire on WhatsApp → the shop confirms price, stock and delivery → payment happens directly with the shop (cash on delivery, bank transfer, etc.). If you want online payments, payment integration is available as an add-on, quoted separately.',
  },
  {
    q: 'Can I update products myself?',
    a: 'Yes — with the Professional Catalog package you get an admin dashboard where you or your staff can add, edit and delete products, change prices, mark stock status and feature items, all without touching code. On the Starter package, updates are handled for you (for example through Monthly Care).',
  },
  {
    q: 'Can this work for my shop category?',
    a: 'If you sell physical products, almost certainly yes. Clothing stores, boutiques, bookshops, stationery shops, cosmetics, shoe stores, gift shops and small local brands all fit the same structure: categories, product pages, variants, prices, stock and a WhatsApp order button. We adapt the layout and fields to what you sell.',
  },
  {
    q: 'Is a domain included?',
    a: 'The domain cost itself is separate — domains are billed by the registrar yearly and stay in your name. Domain setup (buying, connecting, SSL) is available as an add-on, and we handle the whole thing for you.',
  },
  {
    q: 'Does it work with WhatsApp?',
    a: 'WhatsApp is central to the whole flow. Every order button and inquiry basket opens your WhatsApp with a pre-written, structured message: product name, size, color, quantity, price and link. Your customer presses send, and you reply like you already do today — just with all the details in the first message.',
  },
  {
    q: 'How long does delivery take?',
    a: 'It depends on scope and how ready your content is (product photos, names, prices). A typical Starter catalog is roughly 1–2 weeks; Professional with the admin dashboard is usually 2–3 weeks. You get a clear timeline in writing before any work starts.',
  },
  {
    q: 'Do you require advance payment?',
    a: 'Yes. An advance payment is required to begin — it reserves your production slot and covers the setup work. The exact split and milestone structure is agreed in writing before we start, so there are no surprises.',
  },
  {
    q: 'Can this be adapted for salons or spas?',
    a: 'Yes. For service businesses we adapt the same system into BookingFlow: a services menu with prices and durations, plus a WhatsApp booking flow instead of a product inquiry. Same idea, shaped for appointments.',
  },
  {
    q: 'Do you guarantee SEO rankings?',
    a: 'No — and you should be cautious of anyone who does. Our SEO work improves structure, technical health, content clarity and local relevance: fast pages, proper headings, metadata, Search Console setup and Google Business Profile optimization. Rankings themselves are never guaranteed.',
  },
]

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="scroll-mt-24 border-b border-line">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-28">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <Reveal>
              <SectionHeading
                eyebrow="FAQ"
                title={
                  <>
                    Straight answers, <span className="italic text-terracotta">no fine print.</span>
                  </>
                }
                copy="The questions shop owners actually ask us on WhatsApp — answered the same way we'd answer them there."
              />
            </Reveal>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-cream">
            {FAQS.map((f, i) => {
              const isOpen = open === i
              return (
                <Reveal key={f.q} delay={Math.min(i * 0.04, 0.25)}>
                  <div>
                    <button
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-parchment/50"
                      aria-expanded={isOpen}
                    >
                      <span className="flex items-baseline gap-4">
                        <span className="font-display text-sm italic text-taupe">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="font-display text-lg font-medium text-espresso">{f.q}</span>
                      </span>
                      <span
                        className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-cocoa transition-all duration-300',
                          isOpen && 'rotate-45 border-terracotta bg-terracotta text-cream',
                        )}
                      >
                        <IconPlus className="h-4 w-4" />
                      </span>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <p className="px-6 pb-6 pl-[4.25rem] pr-8 text-sm leading-relaxed text-cocoa">
                            {f.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
