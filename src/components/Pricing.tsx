import { cn, packageMessage, waLink, MSG_RETAILFLOW } from '../utils/helpers'
import { IconArrowDownRight, IconArrowRight, IconCheck, Reveal, SectionHeading, WhatsAppIcon } from './ui'
import { IconArrowUpRight } from './ui'

const PLANS = [
  {
    name: 'Starter Catalog',
    price: 'Rs. 25,000',
    suffix: '+',
    blurb: 'Your products online, beautifully — with WhatsApp ordering built in.',
    features: [
      'Public product catalog',
      'Product categories',
      'Product detail pages',
      'Images & prices',
      'WhatsApp order / check availability button',
      'Mobile responsive design',
      'Basic deployment',
    ],
    cta: 'Start with Starter',
    featured: false,
  },
  {
    name: 'Professional Catalog',
    price: 'Rs. 50,000',
    suffix: '+',
    blurb: 'The full system — your team runs the catalog without a developer.',
    features: [
      'Everything in Starter',
      'Admin dashboard',
      'Add / edit / delete products',
      'Stock status controls',
      'Size & color variants',
      'Search and filters',
      'Featured & new arrival products',
      'Inquiry / order tracking',
    ],
    cta: 'Choose Professional',
    featured: true,
  },
  {
    name: 'Monthly Care',
    price: 'Rs. 8,000',
    suffix: '/month+',
    blurb: 'Keep the catalog sharp — updates, fixes and steady improvement.',
    features: [
      'Hosting support',
      'Product updates',
      'Bug fixes',
      'Minor design & content changes',
      'Catalog improvements',
      'Monthly check-in',
    ],
    cta: 'Discuss care plan',
    featured: false,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-24 border-b border-line bg-parchment/60">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <Reveal>
          <SectionHeading
            align="center"
            eyebrow="Pricing"
            title={
              <>
                One system. <span className="italic text-terracotta">Three ways in.</span>
              </>
            }
            copy="Every package is set up for your shop — your branding, your categories, your WhatsApp number. Not a template login."
            className="[&>p]:mx-auto [&>p]:max-w-xl"
          />
        </Reveal>

        <div className="mt-14 grid items-stretch gap-5 lg:grid-cols-3">
          {PLANS.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 0.1} className="h-full">
              <div
                className={cn(
                  'relative flex h-full flex-col rounded-[1.75rem] p-7 transition-all duration-300',
                  plan.featured
                    ? 'bg-espresso text-cream shadow-soft lg:-translate-y-3'
                    : 'border border-line bg-cream hover:-translate-y-1 hover:shadow-card',
                )}
              >
                {plan.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-[2px] bg-terracotta px-4 py-1.5 text-[10px] font-bold uppercase tracking-mega text-cream shadow-pop">
                    Most chosen
                  </span>
                )}
                <h3 className="font-display text-2xl font-medium">{plan.name}</h3>
                <p className={cn('mt-1.5 text-[13px] leading-relaxed', plan.featured ? 'text-sand/75' : 'text-cocoa')}>
                  {plan.blurb}
                </p>
                <div className="mt-5 flex items-baseline gap-1.5">
                  <span className="font-display text-[2.1rem] font-semibold tracking-tight">
                    {plan.price}
                  </span>
                  <span className={cn('text-sm font-bold', plan.featured ? 'text-clay' : 'text-terracotta')}>
                    {plan.suffix}
                  </span>
                </div>
                <ul className="mt-6 flex-1 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[13.5px] font-medium">
                      <span
                        className={cn(
                          'mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full',
                          plan.featured ? 'bg-terracotta/25 text-clay' : 'bg-leaf/15 text-leaf',
                        )}
                      >
                        <IconCheck className="h-3 w-3" />
                      </span>
                      <span className={plan.featured ? 'text-cream/90' : 'text-charcoal'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={waLink(packageMessage(plan.name))}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    'mt-7 flex h-12 items-center justify-center gap-2 rounded-full text-sm font-bold transition-all active:scale-[0.99]',
                    plan.featured
                      ? 'bg-terracotta text-cream hover:bg-terracotta-dark'
                      : 'border border-espresso/20 text-espresso hover:bg-espresso hover:text-cream',
                  )}
                >
                  <WhatsAppIcon className="h-4.5 w-4.5" />
                  {plan.cta}
                </a>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.15}>
          <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-3xl border border-line bg-cream px-6 py-5 text-center sm:flex-row sm:text-left">
            <p className="text-sm leading-relaxed text-cocoa">
              <span className="font-bold text-espresso">Note:</span> add-ons cost extra depending on
              scope. Domain is billed separately, and every project begins with an advance payment.
            </p>
            <a
              href="#addons"
              className="group flex shrink-0 items-center gap-2 rounded-full bg-espresso px-5 py-2.5 text-[13px] font-bold text-cream transition-colors hover:bg-charcoal"
            >
              View add-ons
              <IconArrowDownRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ── 12 · Final CTA ────────────────────────────────────────────────── */

export function FinalCTA() {
  return (
    <section id="contact" className="scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <Reveal>
          <div className="relative overflow-hidden rounded-4xl bg-espresso px-6 py-16 text-center text-cream shadow-soft sm:rounded-5xl sm:px-12 lg:py-24">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(38rem 22rem at 50% -10%, rgba(191,91,45,0.35), transparent 65%)',
              }}
            />
            <div className="relative">
              <p className="text-[11px] font-bold uppercase tracking-mega text-clay">
                Ready when you are
              </p>
              <h2 className="mx-auto mt-4 max-w-2xl font-display text-4xl font-medium leading-[1.06] tracking-tight sm:text-5xl lg:text-[3.4rem]">
                Want RetailFlow for your business?
              </h2>
              <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-sand/80">
                Send your business name and what you sell. We'll guide you toward the right catalog
                setup.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <a
                  href={waLink(MSG_RETAILFLOW)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-12 items-center gap-2 rounded-full bg-terracotta px-7 text-sm font-bold text-cream transition-all hover:bg-terracotta-dark hover:shadow-pop active:scale-[0.98]"
                >
                  <WhatsAppIcon className="h-4.5 w-4.5" />
                  Talk on WhatsApp
                </a>
                <a
                  href="#pricing"
                  className="flex h-12 items-center gap-2 rounded-full border border-cream/25 px-6 text-sm font-bold text-cream transition-all hover:bg-cream/10"
                >
                  View Pricing
                  <IconArrowUpRight className="h-4 w-4" />
                </a>
                <a
                  href="#addons"
                  className="flex h-12 items-center gap-2 rounded-full border border-cream/25 px-6 text-sm font-bold text-cream transition-all hover:bg-cream/10"
                >
                  View Add-ons
                  <IconArrowRight className="h-4 w-4" />
                </a>
              </div>
              <p className="mt-8 text-[11px] uppercase tracking-mega text-cream/40">
                Usually replies within a few hours · Pakistan time
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
