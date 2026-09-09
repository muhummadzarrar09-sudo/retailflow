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
source of truth. `scripts/img-pipeline.mjs` compiles them into a responsive ladder:

```
public/products/<slug>.jpg            master (never modified)
public/products/opt/<slug>/           generated variants — gitignored
  <slug>-400.avif / .webp             card size
  <slug>-640.avif / .webp             grid / tile size
  <slug>-1024.avif / .webp            modal size (the master's native width)
  campaign-…-768 → 2560               full-bleed campaign bands
  <slug>-portrait-<w>.{avif,webp}     art-directed 4:5 crop for phones (campaign only)
src/data/images.generated.ts          committed manifest (sizes, bands, LQIP)
```

```bash
npm run images        # incremental — re-encodes only when a master changed
npm run images:force  # rebuild everything (~45s)
```

`npm run dev` and `npm run build` run the pipeline first, so a fresh clone works with no extra
step. Drop a real client photo into `public/products/` with the same filename and re-run.

What the pipeline buys, measured on this catalog (per page load):

| Scenario | JPEG masters | WebP | AVIF |
| --- | --- | --- | --- |
| 25 catalog images at card size, phone (≈570 device px) | 4,706 KB | 1,055 KB | **632 KB (−87%)** |
| 25 catalog images at card size, desktop retina | 4,706 KB | 2,163 KB | **1,421 KB (−70%)** |
| Campaign hero, phone (4:5 crop) | 120 KB | 51 KB | **42 KB (−65%)** |
| Campaign hero, desktop (2,880 device px) | 120 KB | 129 KB | **104 KB, at 2× the source resolution** |

Full-width slots beyond the master's native size are resampled with lanczos + controlled acutance
(edge energy 4.54 vs 3.66 for the browser's bilinear stretch, i.e. visibly crisper detail), and the
JPEG fallback keeps 4:4:4 chroma. Every `<img>` ships `width`/`height` (no layout shift) and a
20px blurred stand-in (no white flash mid-decode); everything below the fold is `loading="lazy"`.

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
