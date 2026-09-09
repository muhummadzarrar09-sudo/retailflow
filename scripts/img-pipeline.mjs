/**
 * Image pipeline — turns the photography in public/products/*.jpg into
 * browser-ready, art-directed, size-banded assets + a generated TS manifest.
 *
 *   node scripts/img-pipeline.mjs          (only re-encodes when masters change)
 *   node scripts/img-pipeline.mjs --force
 *
 * Output: public/products/opt/<slug>/  (gitignored — run via predev/prebuild)
 *         src/data/images.generated.ts (committed — the app imports it)
 *
 * Why each step exists
 *  - srcset/sizes      a phone stops downloading a 1600² master for a 190px card
 *                      (≈10KB AVIF at 400w instead of the ~284KB master)
 *  - AVIF + WebP       ~45% fewer bytes than the JPEG at equal quality, so the
 *                      bytes we save buy a HIGHER quality encode instead
 *  - chroma 4:4:4 +    masters are 1600² / 2752x1536 because a full-bleed frame on
 *    acutance          an ultrawide paints up to ~2.9k device px; resampling past
 *                      the master is what turns fabric into porridge. Slots at or
 *                      below native size are lanczos + controlled acutance, which
 *                      beats a browser bilinear stretch — the softness people saw
 *  - portrait crops    a 1.79:1 hero on a 390×844 phone is a crop lottery
 *  - explicit w/h      zero layout shift; LQIP means no white flash mid-decode
 *  - no jpg re-encode  the master already IS the JPEG fallback
 */
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { basename, extname, join } from 'node:path'
import sharp from 'sharp'

const root = new URL('..', import.meta.url).pathname
const MASTERS = join(root, 'public', 'products')
const OUT = join(MASTERS, 'opt')
const MANIFEST = join(root, 'src', 'data', 'images.generated.ts')
const STAMP = join(OUT, '.stamp')

/** narrow-viewport campaign crops */
const PORTRAIT_AT = 767
/** max synthetic width we are willing to resample up to, as a factor of master width */
const MAX_UPSCALE = 2.1

const GROUPS = {
  // 400 = phone card, 640 = desktop card, 1024 = modal, 1600 = the modal's
  // zoomed Detail/Texture crops (a 2.1-2.6x transform over the box)
  product: { widths: [400, 640, 1024, 1600], portrait: [], quality: { avif: 52, webp: 78 } },
  campaign: {
    widths: [768, 1280, 1920, 2560],
    portrait: [768, 1152],
    quality: { avif: 52, webp: 78 },
  },
}

/** art direction for the campaign crops: where the portrait crop should land */
const CAMPAIGN = {
  'campaign-hero': { gravity: 'north' },
  'campaign-sale': { gravity: 'centre' },
  'campaign-look': { gravity: 'centre' },
  'campaign-craft': { gravity: 'centre' },
  'campaign-flatlay': { gravity: 'centre' },
}

const IMG_EXT = /\.(jpe?g|png|webp)$/i

const listMasters = () =>
  readdirSync(MASTERS, { withFileTypes: true })
    .filter((d) => d.isFile() && IMG_EXT.test(d.name))
    .map((d) => d.name)
    .sort()

const fingerprint = () =>
  createHash('sha1')
    .update(listMasters().map((f) => {
      const s = statSync(join(MASTERS, f))
      return `${f}:${s.size}:${Math.round(s.mtimeMs)}`
    }).join('|'))
    .digest('hex')

/** sharpen only what we actually enlarged; never sharpen a 1:1 copy */
const acutance = (img, factor) =>
  factor > 1.02
    ? img
        .linear(1 + (factor - 1) * 0.1, 0) // micro-contrast so fabric does not block up
        .sharpen({ sigma: Math.min(1.4, 0.45 + factor * 0.4), m1: 1.1, m2: 0.9 })
    : img.sharpen({ sigma: 0.3 })

/** tiny concurrency pool — AVIF is the slow one, libvips is per-instance single-threaded */
async function pool(items, limit, worker) {
  const out = []
  let i = 0
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++
      out[idx] = await worker(items[idx], idx)
    }
  })
  await Promise.all(runners)
  return out
}

async function buildOne(masterPath, slug, group) {
  const cfg = GROUPS[group]
  const meta = await sharp(masterPath, { failOn: 'none' }).metadata()
  const W = meta.width
  const H = meta.height
  const dir = join(OUT, slug)
  rmSync(dir, { recursive: true, force: true })
  mkdirSync(dir, { recursive: true })

  // A 4:5 campaign frame is never painted full-bleed across a desktop, so bands
  // past its native width would only ever be an upscale — drop them.
  const wanted = cfg.widths.filter(
    (w) => w <= Math.round(W * MAX_UPSCALE) && !(H > W && w > 1920),
  )
  const jobs = []
  for (const ext of ['avif', 'webp']) {
    for (const w of wanted) jobs.push({ ext, w, kind: 'wide' })
  }
  for (const w of cfg.portrait) {
    for (const ext of ['avif', 'webp']) jobs.push({ ext, w, kind: 'portrait' })
  }

  const done = await pool(jobs, 6, async ({ ext, w, kind }) => {
    const base = sharp(masterPath, { failOn: 'none' })
    let step
    if (kind === 'portrait') {
      step = base
        .resize({
          width: w,
          height: Math.round(w * 1.25),
          fit: 'cover',
          position: (CAMPAIGN[slug]?.gravity ?? 'centre'),
          kernel: sharp.kernel.lanczos3,
        })
        .sharpen({ sigma: 0.5 })
    } else {
      step = acutance(
        base.resize({ width: w, kernel: w > W ? sharp.kernel.lanczos3 : sharp.kernel.nearest, fast: false }),
        w / W,
      )
    }
    const name = `${slug}${kind === 'portrait' ? '-portrait' : ''}-${w}.${ext}`
    await step[ext]({ quality: cfg.quality[ext], effort: 3 }).toFile(join(dir, name))
    return { ext, w, name, kind }
  })

  /* both formats get the same width bands, so the manifest stores numbers and
     the component derives `<slug>-<w>.<ext>` — ~5x smaller than a name list,
     which matters because this file is parsed on every phone */
  const wide = [...new Set(done.filter((d) => d.kind === 'wide').map((d) => d.w))].sort((a, b) => a - b)
  const portraitW = [...new Set(done.filter((d) => d.kind === 'portrait').map((d) => d.w))].sort((a, b) => a - b)

  const tiny = await sharp(masterPath).resize({ width: 20, fit: 'inside' }).blur(1).webp({ quality: 30 }).toBuffer()

  const largest = wide.at(-1) ?? W
  return {
    width: W,
    height: H,
    w: wide,
    p: portraitW.length ? portraitW : null,
    lqip: `data:image/webp;base64,${tiny.toString('base64')}`,
    upsampledTo: largest > W ? largest : 0,
    files: done.length,
  }
}

async function main() {
  const force = process.argv.includes('--force')
  const masters = listMasters()
  if (!masters.length) {
    console.error(`no masters found in ${MASTERS}`)
    process.exit(1)
  }

  const fp = fingerprint()
  if (!force) {
    try {
      if (readFileSync(STAMP, 'utf8').trim() === fp && readdirSync(OUT).length > masters.length) {
        console.log('images: up to date (use --force to rebuild)')
        return
      }
    } catch {
      /* no stamp yet — full build */
    }
  }

  mkdirSync(OUT, { recursive: true })
  const t0 = Date.now()
  const manifest = {}
  let bytes = 0
  let files = 0

  await pool(masters, 3, async (file) => {
    const slug = basename(file, extname(file))
    const group = slug.startsWith('campaign') ? 'campaign' : 'product'
    const entry = await buildOne(join(MASTERS, file), slug, group)
    for (const f of readdirSync(join(OUT, slug))) {
      bytes += statSync(join(OUT, slug, f)).size
      files++
    }
    const ups = entry.upsampledTo ? ` ↻ resampled → ${entry.upsampledTo}w` : ''
    console.log(
      `  ${slug.padEnd(32)} ${group.padEnd(8)} ${entry.width}x${entry.height}${ups}  ${entry.files} variants`,
    )
    manifest[slug] = entry
  })

  const cleanManifest = Object.fromEntries(
    Object.entries(manifest).map(([k, { files: _files, ...v }]) => [k, v]),
  )

  writeFileSync(
    MANIFEST,
    `/**
 * GENERATED by scripts/img-pipeline.mjs — do not edit by hand.
 * Slot filenames are derived, not listed: <slug>-<w>.<ext>, and
 * <slug>-portrait-<w>.<ext> for the 4:5 crops.
 * Re-run the pipeline (or any npm run dev/build, which calls it) after
 * changing photography in public/products.
 */

export interface ImgAsset {
  /** master dimensions — lets callers size <img> so layout never shifts */
  width: number
  height: number
  /** available widths for both AVIF and WebP, ascending */
  w: number[]
  /** art-directed 4:5 crop widths for narrow viewports, or null */
  p: number[] | null
  /** 20px blurred stand-in, applied as a background so paint is instant */
  lqip: string
  /** largest width that had to be resampled beyond the master (0 = none) */
  upsampledTo: number
}

export const IMG_BASE = '/products/opt'
export const PORTRAIT_MAX_WIDTH = ${PORTRAIT_AT}

export const IMAGES: Record<string, ImgAsset> = ${JSON.stringify(cleanManifest)}

/**
 * Look up an optimized asset from a catalog path (/products/foo.jpg). Keyed by
 * the file's stem — the same stem products.ts and colorImages use — so a path
 * string never appears twice in the bundle: scripts/build-preview.mjs rewrites
 * every occurrence of a product path into a base64 data URI, and keying the
 * manifest by those same paths used to double the artifact's weight.
 */
export const imageFor = (path: string) =>
  IMAGES[path.split('/').pop()!.replace(/\.[^.]+$/, '')]
`,
  )

  writeFileSync(STAMP, fp)
  console.log(
    `\nimages: ${masters.length} masters → ${files} variants, ${(bytes / 1024 / 1024).toFixed(1)} MB ` +
      `in ${((Date.now() - t0) / 1000).toFixed(1)}s · manifest → src/data/images.generated.ts`,
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
