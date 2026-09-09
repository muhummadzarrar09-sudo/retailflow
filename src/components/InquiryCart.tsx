import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store/StoreContext'
import { lockScroll, unlockScroll } from '../utils/scrollLock'
import { useFocusTrap } from '../utils/focusTrap'
import { cartMessage, rs, waLink } from '../utils/helpers'
import {
  IconArrowRight,
  IconBag,
  IconMinus,
  IconPlus,
  IconTrash,
  IconX,
  Picture,
  WhatsAppIcon,
} from './ui'

export default function InquiryCart() {
  const { cartOpen, setCartOpen, resolved, setQty, remove, clear, total, count, goShop } = useStore()
  const [name, setName] = useState('')
  const [note, setNote] = useState('')
  const drawerRef = useRef<HTMLElement>(null)
  const restoreFocus = useRef<HTMLElement | null>(null)
  useFocusTrap(drawerRef, cartOpen)

  useEffect(() => {
    if (!cartOpen) return
    restoreFocus.current = document.activeElement as HTMLElement | null
    lockScroll()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setCartOpen(false)
    window.addEventListener('keydown', onKey)
    const focusT = window.setTimeout(() => drawerRef.current?.focus(), 250)
    return () => {
      unlockScroll()
      window.removeEventListener('keydown', onKey)
      window.clearTimeout(focusT)
      // preventScroll — never yank the viewport back when the shopper is
      // being navigated somewhere (e.g. empty-basket → Shop All)
      restoreFocus.current?.focus?.({ preventScroll: true })
    }
  }, [cartOpen, setCartOpen])

  const canSend = resolved.length > 0 && name.trim().length > 0

  return (
    <AnimatePresence>
      {cartOpen && (
        <div className="fixed inset-0 z-[85]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="absolute inset-0 bg-espresso/55 backdrop-blur-sm"
          />
          <motion.aside
            ref={drawerRef}
            tabIndex={-1}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-cream shadow-soft outline-none"
            role="dialog"
            aria-modal="true"
            aria-label="Inquiry basket"
          >
            {/* header */}
            <div className="flex items-start justify-between border-b border-line px-6 py-5">
              <div>
                <h2 className="flex items-center gap-2 font-display text-2xl font-medium text-espresso">
                  <IconBag className="h-5 w-5 text-terracotta" />
                  Inquiry Basket
                  {count > 0 && (
                    <span className="rounded-[2px] bg-terracotta px-2 py-0.5 text-[11px] font-bold text-cream">
                      {count}
                    </span>
                  )}
                </h2>
                <p className="mt-1 text-[12px] text-taupe">
                  Not a checkout — this builds one clean WhatsApp message.
                </p>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-cocoa transition-colors hover:bg-parchment"
                aria-label="Close basket"
              >
                <IconX className="h-4 w-4" />
              </button>
            </div>

            {/* lines */}
            <div className="thin-scroll flex-1 overflow-y-auto px-6 py-5">
              {resolved.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-parchment text-taupe">
                    <IconBag className="h-7 w-7" />
                  </span>
                  <p className="mt-4 font-display text-xl text-espresso">Your basket is empty</p>
                  <p className="mt-1.5 max-w-[14rem] text-sm text-cocoa">
                    Browse the catalog and add items you'd like to ask the shop about.
                  </p>
                  <button
                    onClick={() => {
                      setCartOpen(false)
                      goShop('all')
                    }}
                    className="mt-6 flex items-center gap-2 rounded-full bg-espresso px-5 py-2.5 text-[13px] font-bold text-cream"
                  >
                    Browse catalog
                    <IconArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <ul className="space-y-3">
                  <AnimatePresence initial={false}>
                    {resolved.map((l) => (
                      <motion.li
                        key={l.key}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 24 }}
                        transition={{ duration: 0.25 }}
                        className="flex gap-3.5 rounded-2xl border border-line bg-parchment/50 p-3.5"
                      >
                        <Picture
                          path={l.product.image}
                          alt=""
                          sizes="64px"
                          className="h-[4.5rem] w-16 rounded-xl"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-bold leading-snug text-espresso">
                              {l.product.name}
                            </p>
                            <button
                              onClick={() => remove(l.key)}
                              className="text-taupe transition-colors hover:text-ember"
                              aria-label={`Remove ${l.product.name}`}
                            >
                              <IconTrash className="h-4 w-4" />
                            </button>
                          </div>
                          <p className="mt-0.5 text-[12px] font-semibold text-taupe">
                            {[l.size && `Size: ${l.size}`, l.color && `Color: ${l.color}`]
                              .filter(Boolean)
                              .join(' · ') || 'Standard'}
                          </p>
                          <div className="mt-2.5 flex items-center justify-between">
                            <div className="flex items-center rounded-[3px] border border-line bg-cream">
                              <button
                                // the store clamps at 1, so "−" on the last unit means remove
                                onClick={() => (l.qty > 1 ? setQty(l.key, l.qty - 1) : remove(l.key))}
                                className="flex h-8 w-8 items-center justify-center text-cocoa transition-colors hover:text-ember"
                                aria-label={l.qty > 1 ? `Decrease quantity of ${l.product.name}` : `Remove ${l.product.name}`}
                              >
                                <IconMinus className="h-3.5 w-3.5" />
                              </button>
                              <span className="w-6 text-center text-[13px] font-bold">{l.qty}</span>
                              <button
                                onClick={() => setQty(l.key, l.qty + 1)}
                                className="flex h-8 w-8 items-center justify-center text-cocoa"
                                aria-label={`Increase quantity of ${l.product.name}`}
                              >
                                <IconPlus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <p className="font-display text-[15px] font-semibold text-espresso">
                              {rs(l.unit * l.qty)}
                            </p>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}

              {resolved.length > 0 && (
                <div className="mt-6 space-y-4">
                  <div>
                    <label
                      htmlFor="cart-name"
                      className="text-[11px] font-bold uppercase tracking-mega text-taupe"
                    >
                      Your name
                    </label>
                    <input
                      id="cart-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ayesha Khan"
                      className="mt-2 w-full rounded-[4px] border border-line bg-parchment/50 px-4 py-3 text-sm font-medium outline-none transition-colors placeholder:text-taupe focus:border-terracotta"
                    />
                    <p className="mt-1.5 text-[11px] text-taupe">
                      So the shop knows who it's replying to.
                    </p>
                  </div>
                  <div>
                    <label
                      htmlFor="cart-note"
                      className="text-[11px] font-bold uppercase tracking-mega text-taupe"
                    >
                      Note <span className="font-semibold normal-case tracking-normal">(optional)</span>
                    </label>
                    <textarea
                      id="cart-note"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={2}
                      placeholder="Delivery city, timing, anything else…"
                      className="mt-2 w-full resize-none rounded-[4px] border border-line bg-parchment/50 px-4 py-3 text-sm font-medium outline-none transition-colors placeholder:text-taupe focus:border-terracotta"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* footer */}
            {resolved.length > 0 && (
              <div className="border-t border-line bg-parchment/60 px-6 py-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-cocoa">Estimated total</span>
                  <span className="font-display text-2xl font-semibold text-espresso">
                    {rs(total)}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-taupe">
                  Final price, stock and delivery are confirmed by the shop on WhatsApp.
                </p>
                {/* an anchor with no href is not focusable and not a link, so the
                    disabled state is a real <button> instead */}
                {canSend ? (
                  <a
                    href={waLink(cartMessage(name, note, resolved, total))}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-leaf text-sm font-bold text-cream transition-all hover:brightness-110 active:scale-[0.99]"
                  >
                    <WhatsAppIcon className="h-5 w-5" />
                    Send Inquiry on WhatsApp
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="mt-4 flex h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-full bg-taupe/30 text-sm font-bold text-cocoa/60"
                  >
                    <WhatsAppIcon className="h-5 w-5" />
                    Send Inquiry on WhatsApp
                  </button>
                )}
                {!name.trim() && (
                  <p className="mt-2 text-center text-[11px] font-semibold text-ember">
                    Add your name above to enable sending.
                  </p>
                )}
                <button
                  onClick={clear}
                  className="mt-2.5 w-full text-center text-[12px] font-bold text-taupe underline-offset-2 hover:underline"
                >
                  Clear basket
                </button>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}
