import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { cn } from '../utils/helpers'

/* ── Icons ─────────────────────────────────────────────────────────── */

type IconProps = { className?: string }

const I = ({
  children,
  className = 'h-5 w-5',
  filled = false,
}: IconProps & { children: ReactNode; filled?: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke={filled ? 'none' : 'currentColor'}
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden
  >
    {children}
  </svg>
)

export const IconSearch = ({ className }: IconProps) => (
  <I className={className}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </I>
)

export const IconBag = ({ className }: IconProps) => (
  <I className={className}>
    <path d="M6 7h12l1 13H5L6 7Z" />
    <path d="M9 10V6a3 3 0 0 1 6 0v4" />
  </I>
)

export const IconX = ({ className }: IconProps) => (
  <I className={className}>
    <path d="M6 6l12 12M18 6 6 18" />
  </I>
)

export const IconPlus = ({ className }: IconProps) => (
  <I className={className}>
    <path d="M12 5v14M5 12h14" />
  </I>
)

export const IconMinus = ({ className }: IconProps) => (
  <I className={className}>
    <path d="M5 12h14" />
  </I>
)

export const IconCheck = ({ className }: IconProps) => (
  <I className={className}>
    <path d="m5 13 4 4L19 7" />
  </I>
)

export const IconArrowRight = ({ className }: IconProps) => (
  <I className={className}>
    <path d="M4 12h16m-6-6 6 6-6 6" />
  </I>
)

export const IconArrowUpRight = ({ className }: IconProps) => (
  <I className={className}>
    <path d="M7 17 17 7M9 7h8v8" />
  </I>
)

export const IconArrowDownRight = ({ className }: IconProps) => (
  <I className={className}>
    <path d="m7 7 10 10M17 9v8H9" />
  </I>
)

export const IconTrash = ({ className }: IconProps) => (
  <I className={className}>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
  </I>
)

export const IconEdit = ({ className }: IconProps) => (
  <I className={className}>
    <path d="M4 20h4l11-11-4-4L4 16v4Z" />
    <path d="m13 7 4 4" />
  </I>
)

export const IconFilter = ({ className }: IconProps) => (
  <I className={className}>
    <path d="M4 6h16M7 12h10M10 18h4" />
  </I>
)

export const IconMenu = ({ className }: IconProps) => (
  <I className={className}>
    <path d="M4 7h16M4 12h16M4 17h10" />
  </I>
)

export const IconBox = ({ className }: IconProps) => (
  <I className={className}>
    <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
    <path d="M3 8l9 5 9-5M12 13v8" />
  </I>
)

export const IconMessage = ({ className }: IconProps) => (
  <I className={className}>
    <path d="M21 12a8 8 0 0 1-8 8H4l2-3a8 8 0 1 1 15-5Z" />
  </I>
)

export const IconChart = ({ className }: IconProps) => (
  <I className={className}>
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  </I>
)

export const IconShield = ({ className }: IconProps) => (
  <I className={className}>
    <path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3Z" />
    <path d="m9 12 2 2 4-4" />
  </I>
)

export const IconSparkle = ({ className }: IconProps) => (
  <I className={className}>
    <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z" />
  </I>
)

export const IconClock = ({ className }: IconProps) => (
  <I className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
  </I>
)

export const IconLayers = ({ className }: IconProps) => (
  <I className={className}>
    <path d="m12 3 9 5-9 5-9-5 9-5Z" />
    <path d="m3 13 9 5 9-5" />
  </I>
)

export const IconImage = ({ className }: IconProps) => (
  <I className={className}>
    <rect x="3" y="4" width="18" height="16" rx="3" />
    <circle cx="9" cy="10" r="1.6" />
    <path d="m5 19 5-5 3 3 3-3 3 3" />
  </I>
)

export const IconTag = ({ className }: IconProps) => (
  <I className={className}>
    <path d="M12 3H4v8l9 9 8-8-9-9Z" />
    <circle cx="8.5" cy="7.5" r="1.2" />
  </I>
)

export const IconStore = ({ className }: IconProps) => (
  <I className={className}>
    <path d="M4 10 6 4h12l2 6" />
    <path d="M4 10v10h16V10M4 10h16" />
    <path d="M9 20v-6h6v6" />
  </I>
)

export const IconEye = ({ className }: IconProps) => (
  <I className={className}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </I>
)

export const IconChevronDown = ({ className }: IconProps) => (
  <I className={className}>
    <path d="m6 9 6 6 6-6" />
  </I>
)

export const IconStar = ({ className }: IconProps) => (
  <I className={className} filled>
    <path d="M12 2l2.9 6.26 6.6.57-5 4.44 1.5 6.53L12 16.9 5.99 19.8l1.5-6.53-5-4.44 6.6-.57L12 2z" />
  </I>
)

export const WhatsAppIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413" />
  </svg>
)

/* ── Demo storefront brand: Marigold & Clay ────────────────────────── */

export function ShopMark({ className = 'h-9 w-9' }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <circle cx="20" cy="20" r="19" fill="#BF5B2D" />
      {Array.from({ length: 8 }).map((_, i) => (
        <ellipse
          key={i}
          cx="20"
          cy="12"
          rx="2.7"
          ry="6.2"
          fill="#F3EBDD"
          transform={`rotate(${i * 45} 20 20)`}
        />
      ))}
      <circle cx="20" cy="20" r="4.4" fill="#8C4423" />
      <circle cx="20" cy="20" r="2" fill="#E8B98A" />
    </svg>
  )
}

export function ShopLogo({
  dark = false,
  href = '#top',
  onClick,
}: {
  dark?: boolean
  href?: string
  onClick?: React.MouseEventHandler<HTMLAnchorElement>
}) {
  return (
    <a href={href} onClick={onClick} className="group flex items-center gap-2.5">
      <ShopMark className="h-9 w-9 transition-transform duration-500 group-hover:rotate-45" />
      <span className="leading-none">
        <span
          className={cn(
            'font-display text-[1.3rem] font-semibold tracking-tight',
            dark ? 'text-cream' : 'text-espresso',
          )}
        >
          Marigold <span className="italic text-terracotta">&</span> Clay
        </span>
        <span className="mt-1 block text-[9px] font-bold uppercase tracking-mega text-taupe">
          General Store · Demo
        </span>
      </span>
    </a>
  )
}

/* ── Stars ─────────────────────────────────────────────────────────── */

export function Stars({ value, className }: { value: number; className?: string }) {
  const row = (tone: string) => (
    <div className={cn('flex w-max gap-0.5', tone)}>
      {Array.from({ length: 5 }).map((_, i) => (
        <IconStar key={i} className="h-3.5 w-3.5" />
      ))}
    </div>
  )
  return (
    <span className={cn('relative inline-flex shrink-0', className)} aria-label={`${value} out of 5`}>
      {row('text-line')}
      <span
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${Math.min(100, (value / 5) * 100)}%` }}
      >
        {row('text-terracotta')}
      </span>
    </span>
  )
}

/* ── Badges & pills ────────────────────────────────────────────────── */

export function Badge({
  tone = 'neutral',
  children,
  className,
}: {
  tone?: 'neutral' | 'new' | 'sale' | 'low' | 'ok' | 'dark'
  children: ReactNode
  className?: string
}) {
  const tones: Record<string, string> = {
    neutral: 'bg-cream text-charcoal shadow-sm',
    new: 'bg-espresso text-cream',
    sale: 'bg-terracotta text-cream',
    low: 'bg-[#F3DCCB] text-ember',
    ok: 'bg-leaf/15 text-leaf',
    dark: 'bg-charcoal text-cream',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-[3px] px-2 py-[5px] text-[9px] font-bold uppercase tracking-[0.2em]',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

/* ── Colorway image: styled duotone preview per selected color ─────── */

const luminance = (hex: string) => {
  const n = parseInt(hex.replace('#', ''), 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
}

export function TintedImage({
  src,
  alt,
  tint,
  className,
  style,
  eager = false,
}: {
  src: string
  alt: string
  /** hex color to render the image as a colorway duotone; null = original photo */
  tint?: string | null
  className?: string
  style?: React.CSSProperties
  eager?: boolean
}) {
  const lum = tint ? luminance(tint) : null
  return (
    <div className={cn('relative overflow-hidden', className)} style={{ isolation: 'isolate', ...style }}>
      <img
        src={src}
        alt={alt}
        draggable={false}
        loading={eager ? 'eager' : 'lazy'}
        className="h-full w-full object-cover"
        style={tint ? { filter: 'grayscale(1) contrast(1.04) brightness(1.06)' } : undefined}
      />
      {tint && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ backgroundColor: tint, mixBlendMode: 'color', opacity: 0.82 }}
        />
      )}
      {tint && lum !== null && lum < 0.3 && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ backgroundColor: tint, mixBlendMode: 'multiply', opacity: 0.32 }}
        />
      )}
      {tint && lum !== null && lum > 0.78 && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ backgroundColor: tint, mixBlendMode: 'screen', opacity: 0.22 }}
        />
      )}
    </div>
  )
}

/* ── Editorial section heading ─────────────────────────────────────── */

export function SectionHeading({
  eyebrow,
  title,
  copy,
  align = 'left',
  dark = false,
  className,
}: {
  eyebrow: string
  title: ReactNode
  copy?: ReactNode
  align?: 'left' | 'center'
  dark?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        'max-w-2xl',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      <div
        className={cn(
          'flex items-center gap-3 text-[11px] font-bold uppercase tracking-mega text-terracotta',
          align === 'center' && 'justify-center',
        )}
      >
        <span className="h-px w-8 bg-terracotta/60" aria-hidden />
        {eyebrow}
        {align === 'center' && <span className="h-px w-8 bg-terracotta/60" aria-hidden />}
      </div>
      <h2
        className={cn(
          'mt-4 font-display text-4xl font-medium leading-[1.08] tracking-tight sm:text-[2.75rem]',
          dark ? 'text-cream' : 'text-espresso',
        )}
      >
        {title}
      </h2>
      {copy && (
        <p className={cn('mt-5 text-[15px] leading-relaxed', dark ? 'text-sand/80' : 'text-cocoa')}>
          {copy}
        </p>
      )}
    </div>
  )
}

/* ── Scroll reveal wrapper ─────────────────────────────────────────── */

export function Reveal({
  children,
  delay = 0,
  y = 26,
  className,
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-70px' }}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
