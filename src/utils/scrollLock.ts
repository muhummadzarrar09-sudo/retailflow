import { hasDom } from './env'
/** Refcounted body scroll lock — stacked overlays (modal + basket + menu)
    lock/unlock in pairs, so background scroll only returns when the LAST
    overlay closes. (The preloader raw-locks on its own by design.) */

let locks = 0

export const lockScroll = () => {
  locks += 1
  if (hasDom()) document.body.style.overflow = 'hidden'
}

export const unlockScroll = () => {
  locks = Math.max(0, locks - 1)
  if (locks === 0 && hasDom()) document.body.style.overflow = ''
}
