import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState, type ReactNode } from 'react'
import { lockScroll, unlockScroll } from '../utils/scrollLock'

const CURTAIN_EASE = [0.76, 0, 0.24, 1] as const
const TITLE = 'Marigold & Clay'
/* the closed-silk act gets room to breathe; the part begins at PART_MS */
const PART_MS = 2750

/* ── stitched seam that draws itself, then petals bloom ─────────────── */

/* ── a needle sews the seam live; stitches crawl like hand-work ────── */

function StitchedMark() {
  // full-circle path the needle travels (two arcs, clockwise from the top)
  const needlePath = 'M60 8 A52 52 0 1 1 60 112 A52 52 0 1 1 60 8'
  return (
    <motion.svg
      viewBox="0 0 120 120"
      className="h-20 w-20 sm:h-24 sm:w-24"
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1, 1.035, 1] }}
      transition={{ duration: 0.6, times: [0, 0.5, 0.8, 1], delay: 1.75 }}
    >
      {/* inner hairline — second thread, crawling opposite */}
      <motion.circle
        cx="60"
        cy="60"
        r="46"
        fill="none"
        stroke="#E8B98A"
        strokeWidth="1"
        strokeDasharray="2 6"
        initial={{ rotate: 140, opacity: 0 }}
        animate={{ rotate: 500, opacity: 0.4 }}
        transition={{ opacity: { duration: 0.5, delay: 0.4 }, rotate: { duration: 1.6, delay: 0.2, ease: 'linear' } }}
        style={{ transformOrigin: 'center' }}
      />
      {/* the thread being laid down — dashes crawl while it draws */}
      <motion.circle
        cx="60"
        cy="60"
        r="52"
        fill="none"
        stroke="#F6E7CF"
        strokeWidth="1.7"
        strokeDasharray="4 7"
        strokeLinecap="round"
        initial={{ pathLength: 0, rotate: -90, strokeDashoffset: 0 }}
        animate={{ pathLength: 1, strokeDashoffset: -22 }}
        transition={{
          pathLength: { duration: 1.25, delay: 0.2, ease: [0.4, 0, 0.2, 1] },
          strokeDashoffset: { duration: 1.7, delay: 0.2, ease: 'linear' },
        }}
        style={{ transformOrigin: 'center' }}
      />
      {/* the needle — rides the circle, thread trails behind it */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration: 1.35, delay: 0.2, times: [0, 0.04, 0.88, 1] }}
      >
        <circle r="2.8" fill="#E8B98A" />
        <line x1="0" y1="0" x2="11" y2="0" stroke="#E8B98A" strokeWidth="1.8" strokeLinecap="round" />
        <animateMotion dur="1.25s" begin="0.2s" fill="freeze" rotate="auto" path={needlePath} />
      </motion.g>
      {/* petals bloom */}
      {Array.from({ length: 8 }).map((_, i) => (
        <g key={i} transform={`rotate(${i * 45} 60 60)`}>
          <motion.ellipse
            cx="60"
            cy="32"
            rx="7.5"
            ry="17"
            fill="#F6E7CF"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: 0.72 + i * 0.075,
              duration: 0.55,
              ease: [0.34, 1.56, 0.64, 1],
            }}
            style={{ transformOrigin: 'center', transformBox: 'fill-box' }}
          />
        </g>
      ))}
      <motion.circle
        cx="60"
        cy="60"
        r="10.5"
        fill="#E8B98A"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.25, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        style={{ transformOrigin: 'center' }}
      />
      <motion.circle
        cx="60"
        cy="60"
        r="4.4"
        fill="#8C4423"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.38, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
        style={{ transformOrigin: 'center' }}
      />
    </motion.svg>
  )
}

/* ── letter-by-letter masked wordmark — slow, deliberate stitches ────── */

function MaskedTitle() {
  return (
    <motion.h1
      className="flex flex-wrap justify-center font-display text-[11.5vw] font-medium leading-none tracking-tight text-cream sm:text-7xl lg:text-8xl"
      style={{ textShadow: '0 2px 8px rgba(60,20,5,.32), 0 0 1px rgba(60,20,5,.55)' }}
      variants={{ show: { transition: { staggerChildren: 0.075, delayChildren: 0.5 } } }}
      initial="hidden"
      animate="show"
      aria-label={TITLE}
    >
      {TITLE.split('').map((ch, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.14em]" aria-hidden>
          <motion.span
            className={`inline-block ${ch === '&' ? 'italic text-claylight' : ''}`}
            variants={{
              hidden: { y: '118%' },
              show: { y: '0%', transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] } },
            }}
          >
            {ch === ' ' ? '\u00A0' : ch}
          </motion.span>
        </span>
      ))}
    </motion.h1>
  )
}

/* ── the embroidered artwork — rendered INSIDE each silk panel, one copy
     per half, clipped exactly at the seam so the mark reads whole while
     the curtains are closed and tears in two when they part ─────────── */

function CurtainArtwork({ reduce }: { reduce: boolean }) {
  return (
    <>
      <div className="flex w-max flex-col items-center justify-center gap-7 [@media(max-height:640px)]:scale-[0.82] [@media(max-height:460px)]:scale-[0.68]">
        <StitchedMark />
        <MaskedTitle />

        {/* thread sews itself across */}
        <div className="relative h-5 w-48 sm:w-56">
          <motion.div
            className="absolute top-1/2 h-px w-full origin-left"
            style={{ backgroundImage: 'linear-gradient(90deg, rgba(246,231,207,.75) 55%, transparent 45%)', backgroundSize: '10px 1px' }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.7, delay: 1.85, ease: [0.4, 0, 0.2, 1] }}
          />
          <motion.div
            className="absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-claylight shadow-pop"
            initial={{ x: -2, opacity: 0 }}
            animate={{ x: [null, 180], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 0.7, delay: 1.85, times: [0, 0.08, 0.85, 1], ease: [0.4, 0, 0.2, 1] }}
          />
        </div>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 2.15 }}
          className="-mt-2 whitespace-nowrap text-[10px] font-bold uppercase tracking-mega text-cream/65"
        >
          Est · Curated Goods — Rawalpindi
        </motion.p>
      </div>

      {/* a slow sheen crosses the embroidery while it holds — light
          catching the thread before the seam opens */}
      {!reduce && (
        <motion.div
          className="pointer-events-none absolute -inset-x-12 -inset-y-8 mix-blend-soft-light"
          style={{
            background:
              'linear-gradient(105deg, transparent 38%, rgba(255,243,224,.9) 50%, transparent 62%)',
            filter: 'blur(2px)',
          }}
          initial={{ x: '-115%' }}
          animate={{ x: '115%' }}
          transition={{ duration: 1.15, delay: 2.0, ease: [0.6, 0, 0.3, 1] }}
        />
      )}
    </>
  )
}

/* ── silk curtain panel with swaying folds + wavy seam hem ──────────── */

function Curtain({
  side,
  phase,
  reduce,
  sheer = false,
  children,
}: {
  side: 'left' | 'right'
  phase: number
  reduce: boolean
  sheer?: boolean
  children?: ReactNode
}) {
  const out = phase >= 1
  const dir = side === 'left' ? -1 : 1
  // anticipation: panels pull slightly toward the seam, then sweep out and
  // swing away like heavy fabric released from the top edge
  const delay = (side === 'right' ? 0.05 : 0) + (sheer ? 0.13 : 0)
  const target = `${dir * 106}%`

  return (
    <motion.div
      className={`absolute inset-y-0 w-1/2 overflow-hidden ${side === 'left' ? 'left-0' : 'right-0'}`}
      style={{
        background: sheer
          ? 'linear-gradient(180deg, rgba(246,231,207,.30) 0%, rgba(246,231,207,.14) 100%)'
          : 'linear-gradient(180deg,#C75F31 0%,#B0512B 52%,#98411F 100%)',
        boxShadow: sheer
          ? 'none'
          : side === 'left'
            ? '36px 0 64px -28px rgba(60,20,5,.55)'
            : '-36px 0 64px -28px rgba(60,20,5,.55)',
        filter: sheer ? 'blur(1px)' : 'none',
        transformOrigin: side === 'left' ? '100% 0%' : '0% 0%',
      }}
      animate={
        out
          ? reduce
            ? { opacity: 0 }
            : {
                x: ['0%', `${dir * 0.9}%`, target],
                rotate: [0, 0, dir * -1.4],
                opacity: [1, 1, 0],
              }
          : { x: '0%', opacity: 1, rotate: 0 }
      }
      transition={
        out
          ? reduce
            ? { duration: 0.4, delay: sheer ? 0.05 : 0, ease: 'easeOut' }
            : {
                x: { duration: 1.18, times: [0, 0.13, 1], ease: CURTAIN_EASE, delay },
                rotate: { duration: 1.18, times: [0, 0.13, 1], ease: CURTAIN_EASE, delay },
                opacity: { duration: 0.35, delay: delay + 0.82 },
              }
          : { duration: 0.3 }
      }
    >
      {!sheer && (
        <>
          {/* curtain folds — slow sway */}
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                'repeating-linear-gradient(90deg, rgba(255,235,210,.06) 0px 16px, rgba(70,26,6,.10) 16px 34px, rgba(0,0,0,0) 34px 60px)',
            }}
            animate={reduce ? undefined : { backgroundPositionX: ['0px', '30px', '0px'] }}
            transition={{ repeat: Infinity, duration: 5.5, ease: 'easeInOut' }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(70% 60% at 50% 42%, rgba(255,214,170,.14), transparent 70%)',
            }}
          />
          {/* seam hem — fluttering wavy silk edge, tucked UNDER the embroidery
              so the artwork reads as one seamless piece while closed */}
          <motion.svg
            viewBox="0 0 60 1000"
            preserveAspectRatio="none"
            className={`absolute top-0 h-full w-7 sm:w-9 ${side === 'left' ? '-right-px' : '-left-px -scale-x-100'}`}
            style={{ transformOrigin: side === 'left' ? '0% 50%' : '100% 50%' }}
            animate={reduce || out ? undefined : { scaleX: [1, 1.07, 1] }}
            transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
            aria-hidden
          >
            <path
              d="M4 0 L4 1000 L34 1000 C 12 830 52 668 34 500 C 12 332 52 168 34 0 Z"
              fill="#7E3416"
            />
            <path
              d="M0 0 L0 1000 L28 1000 C 6 830 46 668 28 500 C 6 332 46 168 28 0 Z"
              fill="#B0512B"
            />
          </motion.svg>
          {/* the embroidery — the panel itself clips it exactly at the midline,
              so it rides the fabric when the panel sweeps away */}
          <div
            className={`absolute top-1/2 w-max ${
              side === 'left' ? 'left-full' : 'left-0'
            } -translate-x-1/2 -translate-y-1/2`}
          >
            {children}
          </div>
        </>
      )}
    </motion.div>
  )
}

/* ── the sequence ────────────────────────────────────────────────────── */

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const reduce = useReducedMotion()
  const [phase, setPhase] = useState(0) // 0 stitched hold · 1 curtains part · 2 silk dissolves · 3 gone

  useEffect(() => {
    // shares the app-wide refcounted lock — stacked overlays (deep-linked
    // modal behind the curtains) stay locked until THEY release
    lockScroll()
    const unlocked = { current: false } as { current: boolean }
    const unlock = () => {
      if (unlocked.current) return
      unlocked.current = true
      unlockScroll()
    }
    const partAt = reduce ? 700 : PART_MS
    const t1 = window.setTimeout(() => {
      setPhase(1)
      onComplete() // hero mounts beneath the parting silk
      unlock() // store is interactive beneath the parting silk
    }, partAt)
    // after the panels sweep clear, dissolve the opaque silk backdrop so the
    // already-settled storefront crossfades in rather than popping in hard
    const t2 = window.setTimeout(() => setPhase(2), partAt + (reduce ? 420 : 1350))
    const t3 = window.setTimeout(
      () => setPhase(3),
      partAt + (reduce ? 420 : 1350) + (reduce ? 360 : 700),
    )
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      window.clearTimeout(t3)
      unlock()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (phase === 3) return null

  const dissolve = phase === 2

  return (
    <motion.div
      className="fixed inset-0 z-[200]"
      animate={{ opacity: dissolve ? 0 : 1 }}
      transition={{ duration: reduce ? 0.34 : 0.7, ease: [0.4, 0, 0.2, 1] }}
      style={{
        pointerEvents: phase >= 1 ? 'none' : 'auto',
        // silk fallback tone — seals any sub-pixel hairline between the panels
        background: '#98411F',
      }}
      aria-hidden={phase >= 1}
    >
      {/* seam light — the pull before the part, fired just as the hold ends */}
      {!reduce && (
        <motion.div
          className="absolute left-1/2 top-1/2 z-10 h-44 w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: 'linear-gradient(180deg, transparent, #F6E7CF, transparent)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0, 0.95, 0], scaleY: [0.25, 0.3, 1, 0.55] }}
          transition={{ duration: 0.6, times: [0, 0.15, 0.55, 1], delay: PART_MS / 1000 - 0.5 }}
        />
      )}

      {/* light bloom — warmth rushes through the seam as it opens */}
      {!reduce && phase >= 1 && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-[5]"
          style={{
            background:
              'radial-gradient(46% 46% at 50% 50%, rgba(246,231,207,.55), transparent 72%)',
          }}
          initial={{ opacity: 0.55, scale: 0.35 }}
          animate={{ opacity: 0, scale: 2.6 }}
          transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
        />
      )}

      {/* the silk — heavy drape (carrying the embroidered artwork) + sheer
          lining lagging behind it */}
      <Curtain side="left" phase={phase} reduce={!!reduce} sheer />
      <Curtain side="right" phase={phase} reduce={!!reduce} sheer />
      <Curtain side="left" phase={phase} reduce={!!reduce}>
        <CurtainArtwork reduce={!!reduce} />
      </Curtain>
      <Curtain side="right" phase={phase} reduce={!!reduce}>
        {/* visual mirror of the same embroidery — skip for AT */}
        <div aria-hidden>
          <CurtainArtwork reduce={!!reduce} />
        </div>
      </Curtain>

      {/* bottom tag */}
      <motion.p
        className="absolute bottom-7 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold uppercase tracking-mega text-cream/40"
        animate={phase >= 1 ? { opacity: 0 } : { opacity: 1 }}
        initial={{ opacity: 0 }}
        transition={{ duration: 0.4, delay: phase >= 1 ? 0 : 2.45 }}
      >
        Browse the catalog · Order on WhatsApp
      </motion.p>

      {/* cinematic edge vignette — a stage-light focus pulls in around the
          embroidery while the silk is closed, then breathes out as the
          curtains part and the storefront dissolves into view */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-20"
        style={{
          background:
            'radial-gradient(125% 96% at 50% 44%, rgba(0,0,0,0) 52%, rgba(28,7,2,0.04) 70%, rgba(28,7,2,0.5) 100%)',
        }}
        animate={
          phase >= 1
            ? { opacity: 0 }
            : reduce
              ? { opacity: 0.55 }
              : { opacity: [0.55, 0.85, 0.55] }
        }
        transition={
          phase >= 1
            ? { duration: reduce ? 0.35 : 1.15, ease: [0.22, 1, 0.36, 1] }
            : { repeat: Infinity, duration: 3.6, ease: 'easeInOut' }
        }
      />
    </motion.div>
  )
}
