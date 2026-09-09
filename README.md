# Marigold & Clay — a clean, working storefront

A complete, browsable storefront (no separate platform/sales pages): a curated general store
("Marigold & Clay") with a cinematic intro, hero, category racks, new-arrivals rail, sale edit,
full filterable catalog, inquiry basket and WhatsApp ordering.

> Front-end demo only — no backend, no payment gateway, no real checkout. Orders happen through
> structured WhatsApp messages. That is the entire point of the flow.

---

## Experience map

One storefront, a handful of client-side **views** (hash-routed, no server needed):

- `#/shop` — Home: the campaign storefront (default landing page)
- `#/shop/new` — New Arrivals
- `#/shop/all` — Shop All (the full catalog)
- `#/shop/sale` — The Sale (The Autumn Edit)
- `#/shop/clothing` · `/accessories` · `/footwear` · `/stationery` · `/cosmetics` · `/gifts` — one collection page per rack

Every collection page is a full brand-style PLP: breadcrumb, editorial headline, sticky
search/sort toolbar, a **Collections sidebar** that deep-links between racks, size/color/price
filters and live result counts. Dropdown nav (hover mega-menu on desktop), category tiles, rails,
footer and the inquiry basket all deep-link into these views; plain `#section` anchors still scroll
within the active page, and browser back/forward works across every view switch.

| Area | Details |
| --- | --- |
| Silk preloader | Embroidered-fabric load screen — a needle sews the marigold monogram onto closed terracotta silk while the wordmark stitches in letter by letter, a sheen crosses the thread during the hold, then the curtains part and the logo + name tear in two at the seam, each half riding its panel as the silk swings away and the storefront crossfades in (respects reduced-motion) |
| Brand nav | Category mega-menu (hover panel with rack cards + campaign strip), search icon that lands you in the catalog field, basket + WhatsApp CTA |
| Campaign hero | Full-bleed editorial photography with scroll parallax, masked-line headline reveal, shoppable "as worn" chip, scroll cue |
| Category tiles | 6 racks in a broken editorial grid (staggered columns) that drive the catalog filter |
| New arrivals rail | Horizontal snap-scrolling rail with arrow controls, fed by real product flags |
| The Craft | Heritage split-editorial — artisan photography, brand stats, catalog + WhatsApp CTAs |
| Full catalog | 25 products across 6 categories (Clothing, Accessories, Footwear, Stationery, Cosmetics, Gifts) · search, categories (incl. New Arrivals & Sale), price slider, size & color filters, 4 sort modes, sticky toolbar, mobile filter sheet |
| Colorway previews | Selecting a color in the product modal re-renders the image as a styled duotone in that exact shade (labeled as a colorway preview); the photographed color keeps the full original photo |
| Product detail | Gallery (front/detail/texture), variants, quantity, stock badge, rating, accordions, related products, "check availability" WhatsApp message |
| Inquiry basket | Slide-out, quantity & variant editing, estimated total, customer name + note, `localStorage` persistence, one clean WhatsApp inquiry |
| The Autumn Edit | Full-bleed sale campaign banner with parallax drift, filters the catalog to marked-down items |
| Lookbook strip | Snap-scrolling editorial rail — campaign look + shoppable stills, tap to open the product |
| Texture break | Flat-lay textile interlude carrying the brand line |
| Store policies | WhatsApp ordering, pay-your-way, dispatch, exchange — numbered editorial row, illustrative demo policies |
| Newsletter | Signup with success state — honest demo: nothing is stored, real alerts via WhatsApp |

## Tech stack

- **React 18 + TypeScript** (strict, `tsc --noEmit` passes as part of the build)
- **Vite 5**
- **Tailwind CSS 3** with a custom warm brand system (clay / terracotta / burnt orange / espresso / cream / copper) — Fraunces + Manrope type pairing
- **Framer Motion** for reveals, filter transitions, drawer & modal animation
- **localStorage** persistence for the inquiry basket

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
```

## Production build

```bash
npm run build      # typechecks (tsc --noEmit) then bundles into dist/
npm run preview    # serve the production build locally
```

The build uses relative asset paths (`base: './'`), so `dist/` works from any sub-path,
CDN folder or static host without configuration.

### One-file preview

```bash
npm run build:preview   # builds dist/ AND generates preview.html
```

`preview.html` is a fully self-contained version of the site — CSS, JS and all 25 product
images inlined as data URIs (~10 MB). Open it anywhere, no server needed; it's the same code
that ships to production, just packaged as a single file.

**Note on buttons in the preview:** every in-page interaction (filters, search, sort, color
and size selectors, product modal, inquiry basket, accordions) works everywhere, including the
inlined preview. The WhatsApp buttons open `wa.me` in a new tab — sandboxed previews block
popups (and offline file views have no network), so those links only "do something" when the
file is open in a normal browser tab or the site is deployed. That is expected behavior, not
broken code.

### Art plates

Products without photography use consistent editorial "art plate" SVGs (warm plate, arch,
frame, hand-drawn illustration). They're generated by `scripts/gen-plates.mjs` — extend the
`ART` map and re-run to add more. Ten products use AI-generated photography; drop real client
photos into `public/products/` with the same filenames to replace any of them.

## Customizing for a real client

Everything a shop owner would change lives in three obvious places:

- **WhatsApp number & message templates** — `src/utils/helpers.ts` (`WA_NUMBER`, `waLink()`, `productMessage()`, `cartMessage()`)
- **Products** — `src/data/products.ts` (name, category, price/sale price, images, description, details, sizes, colors, stock, rating, flags for New/Featured/Sale)
- **Brand tokens** — `tailwind.config.js` (colors, fonts, shadows) and the Google Fonts link in `index.html`

Product imagery lives in `public/products/`. All 25 products are covered by AI-generated
photography in one consistent warm art direction. `scripts/gen-plates.mjs` can generate
matching editorial "art plate" SVGs for any future product added before its photo shoot.
Drop real client photos in with the same filenames to replace any asset.

## Honesty notes (by design)

- No fake testimonials; review counts are clearly demo product metadata
- No payment/checkout anywhere — WhatsApp is the order channel
- Product photos are AI-generated demo assets; two products use intentional brand "art plate"
  illustrations (SVG) — replace with real photography per client
