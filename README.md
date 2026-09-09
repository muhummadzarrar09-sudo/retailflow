# Marigold & Clay — a RetailFlow demo storefront

**A complete, working storefront — not a sales pitch.**

This is a real, browsable shop ("Marigold & Clay", a curated general store): campaign hero,
category racks, new arrivals, a sale edit, a full filterable catalog, an inquiry basket and
WhatsApp ordering. Every button works. Built by **Zarrar.Solutions** as the reference build for
what RetailFlow ships to shop owners — the shop itself carries no pitch, no pricing page and no
"want one for your shop?" link. It is just the store.

> Front-end demo only — no backend, no payment gateway, no real checkout. Orders happen through
> structured WhatsApp messages. That is the entire point of the flow.

---

## Routes

Client-side hash routing, no server needed, works from a single file. Ten views:

| URL | View |
| --- | --- |
| `#/shop` | Home — the campaign storefront |
| `#/shop/new` | New Arrivals |
| `#/shop/all` | Shop All (the full catalog) |
| `#/shop/sale` | The Sale (The Autumn Edit) |
| `#/shop/clothing` · `/accessories` · `/footwear` · `/stationery` · `/cosmetics` · `/gifts` | one collection page per rack |

Each collection page is a full brand-style PLP: breadcrumb, editorial headline, sticky
search/sort toolbar, a sidebar that deep-links between racks (chip rail on desktop, full list in
the mobile filter sheet), size/color/price filters and live result counts. Your query, filters and
sort survive hopping between racks; browser back/forward works across every view, `#section`
anchors scroll inside the active page, and a shared `#product-<slug>` link opens that product
straight away.

| Area | What it does |
| --- | --- |
| Silk preloader | Embroidered-fabric load screen — a needle sews the marigold monogram onto closed terracotta silk, the curtains part and the logo tears at the seam. The store paints *underneath* it from the first frame, so nothing waits on the animation. Respects reduced motion |
| Brand nav | Category mega-menu (rack cards + campaign strip; closes on outside tap and Escape), search icon that lands in the catalog field, basket + WhatsApp CTA |
| Campaign hero | Full-bleed A/W ’26 photography with scroll parallax, masked-line headline reveal, shoppable "as worn" chip, art-directed 4:5 crop on phones |
| Category tiles | 6 racks in a broken editorial grid, counts derived from the catalog |
| New arrivals rail | Horizontal snap rail, newest-first, arrow controls |
| The Craft | Heritage split-editorial — artisan zari photography and brand stats |
| Full catalog | 25 seeded products across 6 categories · search, price slider (Rs 750–6,500, sale prices), size & color filters, 4 sort modes, sticky toolbar, mobile filter sheet |
| Colorway previews | Picking a color in the product modal re-renders the photo as a styled duotone in that exact shade (labeled as a preview); where a real colorway photo exists it is used instead |
| Product detail | Gallery (front/detail/texture crops), variants, quantity, stock badge, rating, accordions, same-rack suggestions, "check availability" WhatsApp message |
| Inquiry basket | Slide-out, quantity & variant editing, estimated total, name + note, `localStorage` persistence (key `retailflow-inquiry-v1`), one clean WhatsApp inquiry |
| The Autumn Edit | Full-bleed sale banner with parallax drift, filters the catalog to marked-down items |
| Lookbook strip | Snap-scrolling editorial rail — campaign look + shoppable stills |
| Store policies · Newsletter | Numbered editorial row; signup with success state — nothing is stored, real alerts go via WhatsApp |

## Images

Every photo on the site lives in `public/products/*.jpg` — those files are the masters and the
source of truth. Two scripts work on them, in this order:

```
scripts/enhance-masters.py    (python)  quality pass over the masters themselves
scripts/img-pipeline.mjs      (node)    compiles masters -> responsive ladder + manifest
```

### The quality pass

The masters were 1024² product frames and a 1376×768 hero. The site asks the hero to fill a
2,880-device-px banner, and the product modal asks for 1024 exactly to fill its box — so every
large slot on the page was a browser upscale. `scripts/enhance-masters.py` rebuilds the masters
with classical + lightweight learned filters (no generative model, nothing repainted):

1. **Non-local means denoise** (luma `h=3`, chroma `h=4`) — kills the JPEG mosquito noise that
   upscaling would otherwise enlarge into texture.
2. **FSRCNN ×2 super-resolution** via `cv2.dnn_superres` (39 kB weights, 1.4 s per 1024² frame) —
   a tiny learned predictor, not a diffusion model, so it cannot invent detail. EDSR ×2 was tried
   and rejected: ~10 min per frame on this machine and it OOM-kills at 4 GB RAM for a gain
   indistinguishable from FSRCNN on this catalog.
3. **Luminosity unsharp** (radius 1.6, amount 0.42, on L\* only) — micro-contrast is what reads as
   "sharp" on a phone, and keeping it in the lightness channel means no coloured fringing on edges.
4. **Highlight rolloff** (soft shoulder at 226/255) then **+4 % vibrance**, so the marigold walls
   stop clipping to flat cream without going garish.
5. **Progressive JPEG q84, 4:4:4** — chroma is what a fabric photo is made of, and 4:2:0 would
   throw away the thread colour; non-campaign frames are clamped to 1600px (the widest slot the
   site paints) with `INTER_AREA`, which doubles as an anti-alias pass.

```bash
python3 -m venv .venv && .venv/bin/pip install numpy pillow opencv-contrib-python-headless
gh api -H "Accept: application/vnd.github.raw+json" \
  repos/Saafke/EDSR_Tensorflow/contents/models/FSRCNN_x2.pb > .venv/models/FSRCNN_x2.pb
.venv/bin/python scripts/enhance-masters.py --dry-run     # metrics only, writes nothing
.venv/bin/python scripts/enhance-masters.py --install     # rewrites public/products/*.jpg
```

Measured on the served slots (identical canvas, identical encoder — old master vs enhanced):

| Slot | Edge detail | Bytes |
| --- | --- | --- |
| card 400w | ×2.47 | 13 KB → 15 KB |
| card 640w | ×2.48 | 30 KB → 33 KB |
| modal 1024w | ×1.15 | 74 KB → **64 KB** |
| zoom crop 1600w (new band) | ×1.75 | 117 KB → **111 KB** |
| campaign hero 1920w / 2560w | ×2.83 / ×2.99 | 60 → 65 KB / 88 → 92 KB |

Across all 37 masters: flat-area noise 1.35 → 0.50, JPEG 8×8 blocking 0.69 → 0.01, and
**SSIM 0.9949 against the source frame** — the content is provably the same photo, only cleaner
and larger. CLAHE-based local contrast is implemented but off by default: on this catalog it
amplified mottling in the shared painted backdrop, which looked worse than the mid-tones it bought.

### The ladder

```
public/products/<slug>.jpg            master (1600² product / 2752×1536 hero)
public/products/opt/<slug>/           generated variants — gitignored
  <slug>-400.avif / .webp             card size on a phone
  <slug>-640.avif / .webp             card size on a retina desktop
  <slug>-1024.avif / .webp            product modal
  <slug>-1600.avif / .webp            the modal's zoomed Detail/Texture crops
  campaign-…-768 → 2560               full-bleed campaign bands
  <slug>-portrait-<w>.{avif,webp}     art-directed 4:5 crop for phones (campaign only)
src/data/images.generated.ts          committed manifest (sizes, bands, LQIP)
```

Every band is now at or below the master's native width — nothing on the site is an upscale, so
`lanczos + acutance` only ever works on downsamples.

```bash
npm run images        # incremental — re-encodes only when a master changed
npm run images:force  # rebuild everything (~90s)
```

`npm run dev` and `npm run build` run the pipeline first, so a fresh clone works with no extra
step. Drop a real client photo into `public/products/` with the same filename and re-run.

What the ladder buys, measured on this catalog (the 25 images a catalog page actually loads):

| Scenario | Raw masters | WebP | AVIF |
| --- | --- | --- | --- |
| card size on a phone (350 device px → 400w band) | 7,027 KB | 392 KB | **246 KB (−97%)** |
| card size on a retina desktop (600 px → 640w) | 7,027 KB | 807 KB | **512 KB (−93%)** |
| product modal, one image (1024w) | 281 KB | 62 KB | **41 KB** |
| the modal's zoomed Detail crop (1600w, new) | 281 KB | 108 KB | **75 KB** |
| campaign hero on a phone (4:5 crop, 1280w) | 362 KB | 37 KB | **26 KB** |
| campaign hero on a desktop (2560w, native) | 362 KB | 92 KB | **71 KB** |

Every `<img>` ships `width`/`height` (no layout shift) and a 20px blurred stand-in (no white flash
mid-decode); everything below the fold is `loading="lazy"`. `preview.html` inlines a 1024px copy
of each master, so the single-file artifact got *smaller* (8.95 MB → 6.22 MB) while the pixels in
it improved.

## Server-side rendering

The tree is **isomorphic**: no component touches `window`, `document`, `localStorage` or
`matchMedia` while rendering, the first client render matches a server render exactly, and
browser state is adopted in effects. `src/main.tsx` hydrates when `#root` already contains markup
and client-renders when it does not, so adding a prerender step (or moving the app onto a real SSR
server) needs no component changes.

This repo deliberately ships a **static** build — no SSR server and no prerender step. The
guarantees are enforced by two scripts you can run in CI:

```bash
npm run ssr:check   # renders the whole app through react-dom/server with no DOM globals:
                    # asserts it renders, renders identically twice (hydration-safe), shows
                    # real catalog content, and ships srcset/sizes + intrinsic sizes
npm run smoke       # mounts the real app in jsdom and drives it: quick view → dialog + focus,
                    # add to inquiry → basket, rack switch keeps the basket, dirty localStorage
                    # is sanitized (merged, clamped, junk dropped), no console errors
npm run check       # tsc + both of the above
```

To actually prerender: run `renderToString(<StoreProvider><App/></StoreProvider>)` at build time,
write it into `index.html`'s `#root`, and `main.tsx` will hydrate it. `setMeta()`
(`src/utils/meta.ts`) already manages title/description/canonical/JSON-LD for whichever view is
active and no-ops off the browser.

## Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | images (if stale) → Vite dev server |
| `npm run build` | images (if stale) → `tsc --noEmit` → Vite build into `dist/` |
| `npm run preview` | serve the production build locally |
| `npm run build:preview` | self-contained `preview.html` (see below) |
| `npm run typecheck` / `check` / `ssr:check` / `smoke` | verification, no test framework needed |
| `npm run images` / `images:force` | the photo pipeline |

## Tech stack

- **React 18 + TypeScript 5** — `strict`, plus `noUnusedLocals` / `noUnusedParameters`, so dead
  code fails the build; `tsc --noEmit` runs as part of `npm run build`
- **Vite 5** — `base: './'` so `dist/` works from any sub-path or static host; React, Framer and
  React DOM are split into a `vendor` chunk that stays cached between content changes
- **Tailwind CSS 3** with a warm brand system (clay / terracotta / espresso / cream / sand) and
  Fraunces + Manrope typography
- **Framer Motion** for reveals, filter transitions, drawer and modal animation
- **sharp** (dev-only) for the image pipeline

## One-file preview

```bash
npm run build:preview   # builds dist/ and generates preview.html
```

`preview.html` is the whole site in one file — CSS, JS and every product photo inlined as a data
URI — for opening anywhere without a server (the file is tracked in git so the demo survives being
emailed). Because a single HTML file has no sibling variants to negotiate, this build sets
`RF_INLINE_IMAGES=1`, which swaps the `<picture>` ladder for the master JPEG.

**Buttons in the preview:** every in-page interaction works offline — filters, search, sort,
color/size selection, the modal, the basket, accordions. The WhatsApp links open `wa.me` in a new
tab; sandboxed preview viewers block popups and an offline file has no network, so those need a
normal browser tab or a deployed site. Expected, not broken.

## Deploy to Vercel

1. Push this folder to a Git repository.
2. In Vercel: **Add New → Project → Import**.
3. Framework preset: **Vite** (auto-detected). Build command `npm run build`, output `dist`.
4. Deploy. No environment variables required. Vercel runs `npm ci`, which installs `sharp`, so the
   image pipeline runs as part of the build with no extra configuration.

## Customizing for a real client

- **WhatsApp number & messages** — `src/utils/helpers.ts` (`WA_NUMBER`, `waLink()`,
  `productMessage()`, `cartMessage()`). Inquiry messages only ever state what the shopper actually
  chose: the basket line prints the line total, unit price included when quantity is above 1
- **Products** — `src/data/products.ts` (name, category, price/sale price, images, description,
  details, sizes, colors, stock, rating, New/Featured/Sale flags, gallery crop hints). The rack
  list, per-rack counts and the tile imagery come from the same file
- **Brand tokens** — `tailwind.config.js` and the Google Fonts link in `index.html`
- **Photography** — replace the masters in `public/products/`, run `npm run images`

## Honesty notes (by design)

- No fake testimonials; review counts are demo product metadata
- No payment or checkout anywhere — WhatsApp is the order channel
- No SEO-ranking guarantees in the copy; `Docs/` records what is claimed vs what is true
- Product photos are AI-generated demo assets in one consistent art direction — swap in real
  client photography with the same filenames
- The colorway duotones are a *preview* of an unavailable shade, labeled as such in the UI, not a
  claim that the photo is that product in that color
