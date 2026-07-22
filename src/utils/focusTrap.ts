import { useEffect, type RefObject } from 'react'

/** Minimal Tab-trap for dialogs. A module-level stack tracks open dialogs,
    so when overlays nest (basket over modal) only the TOPMOST traps. */

const SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

const stack: HTMLElement[] = []

export function useFocusTrap(ref: RefObject<HTMLElement | null>, active: boolean) {
  useEffect(() => {
    if (!active) return
    const root = ref.current
    if (!root) return

    stack.push(root)

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      if (stack[stack.length - 1] !== root) return // only the topmost dialog traps

      const els = [...root.querySelectorAll<HTMLElement>(SELECTOR)].filter(
        (el) => el.getClientRects().length > 0,
      )
      if (els.length === 0) return

      const first = els[0]
      const last = els[els.length - 1]
      const current = document.activeElement as HTMLElement | null

      if (e.shiftKey) {
        if (!current || current === first || !root.contains(current)) {
          e.preventDefault()
          last.focus()
        }
      } else if (!current || current === last || !root.contains(current)) {
        e.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKey, true)
    return () => {
      window.removeEventListener('keydown', onKey, true)
      const i = stack.indexOf(root)
      if (i > -1) stack.splice(i, 1)
    }
  }, [ref, active])
}
