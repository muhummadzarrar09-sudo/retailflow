/** Environment guards.
 *
 *  Every browser touchpoint in the app goes through here so the tree renders
 *  identically on a server and in the browser — no `window` at module scope,
 *  no storage/scroll/matchMedia access during render, and any state that can
 *  only be read in the browser is adopted in an effect (never in a useState
 *  initializer) so hydration matches the server HTML exactly.
 */

export const hasDom = () => typeof window !== 'undefined' && typeof document !== 'undefined'

/** prefers-reduced-motion, server-safe (server + first client render = false) */
export const prefersReducedMotion = () =>
  hasDom() && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

/** the location hash, or '' when there is no DOM (SSR) */
export const currentHash = () => (hasDom() ? window.location.hash : '')

/** safe in both environments; falls back to instant scrolling */
export const scrollTo = (opts: ScrollToOptions) => {
  if (hasDom()) window.scrollTo(opts)
}

/** jump to a y-offset without inheriting html{scroll-behavior:smooth} */
export const scrollToTop = () => {
  if (hasDom()) window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
}

/** scroll an element into view; never smooth-animate for reduced-motion users */
export const scrollIntoView = (
  el: Element,
  opts: { block?: ScrollLogicalPosition; smooth?: boolean } = {},
) => {
  const behavior: ScrollBehavior =
    opts.smooth === false || prefersReducedMotion() ? 'auto' : 'smooth'
  el.scrollIntoView({ behavior, block: opts.block ?? 'start' })
}

/** open an outbound URL without handing the target a window.opener handle */
export const openExternal = (url: string) => {
  if (!hasDom()) return
  const w = window.open(url, '_blank', 'noopener,noreferrer')
  if (w) w.opener = null
}
