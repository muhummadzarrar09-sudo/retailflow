# White-Glove — Round 4 · "More SSR, more device-efficient, better pictures — and the pitch goes away entirely"

The audit that preceded this round produced 25 findings; the three asks on top of it were scoped
with the user before touching code:

| Ask | Decision taken | What that meant |
| --- | --- | --- |
| "the WHOLE of the Want-one-for-your-shop nonsense" | **delete the platform side** | not the two CTA strings — the route, the page, and everything wired to it |
| "make it more SSR" | **isomorphic code, no server** | SSR-safe rendering + hydration-exact output; no prerender step, no SSR runtime added |
| "increase the quality of the pictures" | **re-master + responsive pipeline** | the pipeline shipped in full; the re-master turned out to be a measurable downgrade, so it was replaced with the levers that actually raise fidelity (§3) |

Build status after this round: `tsc --noEmit` with `noUnusedLocals` + `noUnusedParameters` ✓ ·
`npm run ssr:check` ✓ · `npm run smoke` (jsdom, real interactions) ✓ · `vite build` ✓ ·
`preview.html` regenerated (8.95 MB, 37 images) ✓

---

## 1 · The platform side is gone

Removed outright — 1,538 lines of UI plus its generator:

- `src/pages/OwnersPage.tsx` (31), `src/components/Hero.tsx` (365), `Sections.tsx` (379),
  `AdminPreview.tsx` (421), `Pricing.tsx` (220), `FAQ.tsx` (122)
- `scripts/gen-plates.mjs` (194) and the 15 orphan `public/products/*.svg` art plates — nothing in
  the app ever referenced them
- `Marquee` was the one live thing in `Sections.tsx`; it moved into `Storefront.tsx`

Then everything that pointed at it: `goOwners`, the second route branch, `MSG_RETAILFLOW`,
`packageMessage`, the dead `Logo`/`LogoMark`, `OWNER_LINKS`, `PLATFORM_LINKS`, the footer's
"Powered by RetailFlow" column, the sticky mobile bar's platform variant, the ribbon's bridge line
and the nav's "Want one for your shop?" button. `Ribbon` is now just the honest demo statement.

Kept on purpose: the shop's own identity line ("Marigold & Clay — demo storefront by RetailFlow")
in the footer and preloader. Attribution is not a pitch.

This is asserted, not promised: both smoke scripts fail the build if `Want one for your shop`,
`For Shop Owners` or `#/owners` appear in rendered markup or in the live DOM.

## 2 · Isomorphic and hydration-exact

- **No render-time browser access anywhere.** `src/utils/env.ts` owns every
  `window`/`document`/`localStorage`/`matchMedia` touch behind `hasDom()` guards; `src/utils/meta.ts`
  owns title/description/canonical/JSON-LD and no-ops off the browser. `scrollLock` is guarded too.
- **The 2.75 s curtain no longer gates mounting.** `App` animates `revealed` over the top of an
  already-mounted store instead of mounting the tree when the preloader finishes, so the server
  render, a no-JS first paint and the hydrated client render all contain the same real content.
- **Browser state is adopted in effects, never during render**: the basket is read from
  `localStorage` through `sanitizeLines` (dedupe by variant key, `clampQty`, unknown ids and junk
  entries dropped — previously a raw `JSON.parse as CartLine[]` that let a string `"03"` drive the
  badge), and the active view comes from `viewFromHash()`, which is now a strict `#/shop…` prefix
  test (`#/shopXXX` used to resolve to Home).
- **`src/main.tsx` hydrates when `#root` already has markup** and client-renders when it doesn't —
  so a prerender step or a real SSR server needs no component changes.
- Deliberately **not** done, per the scope choice: no prerender, no server, no change to what gets
  deployed. The README documents the one-step recipe if that changes.

Evidence: `scripts/ssr-smoke.mjs` renders the whole app through `react-dom/server` in an
environment with no `window`/`document`/`localStorage`, twice, and asserts determinism plus that
real catalog content, prices, `srcset`/`sizes` and intrinsic sizes are in the HTML.

## 3 · Pictures — including the part that didn't work

> Superseded on the numbers by `Docs/WHITE-GLOVE-5.md`: the masters were re-cut by a Python quality
> pass afterwards, so 248 variants / 13.4 MB / 1024² masters are no longer current. The reasoning
> in this section still stands.

The request was to re-master all 25 product + 5 campaign photos at higher fidelity, then make them
responsive. The second half shipped. The first half was tested and rejected:

- Asked to re-master `campaign-hero.jpg`, the model returned **1376×768 — the input's own
  dimensions**. Upscaling the master to 2048×1152 first and re-feeding it produced **1456×720** at
  110 KB (it clamps to its own size bucket).
- Sharpness, measured as Laplacian edge energy on the luminance plane: source **5.940**, re-mastered
  **5.209**. It repaints texture rather than resolving it.

Re-mastering 30 photos that way would have made the demo *softer*, so it was not done. Any single
photo can still be re-painted on request (the tool works; it is just not an upscaler). What shipped
instead are the four levers that raise measured quality per pixel on screen:

1. **No browser-side upscale.** The campaign hero displays up to ~2.9k device px from a 1376-wide
   master; a browser bilinear stretch measured **3.664** edge energy. The pipeline resamples the
   exact slot with lanczos + controlled acutance (micro-contrast + unsharp, applied only when the
   target exceeds the master): **4.538** — +24% detail — at 88 KB against the master's 120 KB.
2. **Higher-quality encode paid for by the format.** AVIF/WebP buy ~45% over the JPEG at equal
   quality, so that budget went into quality (and the JPEG fallback keeps 4:4:4 chroma instead of
   the default 4:2:0, which is where thin thread-level embroidery goes muddy).
3. **Art-directed crops.** Phones get a real 4:5 crop of the campaign frames instead of a 1.79:1
   master `object-cover`-cropped by CSS into a lottery.
4. **Perceived quality:** every `<img>` carries `width`/`height` (zero layout shift) and a 20px
   blurred LQIP background (no white flash mid-decode), and above-the-fold images get
   `fetchpriority=high` + sync decode.

The pipeline (`scripts/img-pipeline.mjs`, `npm run images`, wired into `predev`/`prebuild`):

```
public/products/<slug>.jpg          masters — untouched, still the source of truth
public/products/opt/<slug>/         248 variants · 13.4 MB · gitignored, generated at build time
src/data/images.generated.ts        committed manifest · 12.2 kB · numbers only, filenames derived
```

| One page load · 25 catalog images | JPEG masters | WebP | AVIF |
| --- | --- | --- | --- |
| phone (≈570 device px per card) | 4,706 KB | 1,055 KB | **632 KB (−87%)** |
| desktop retina (≈760 px) | 4,706 KB | 2,163 KB | **1,421 KB (−70%)** |
| campaign hero on a phone | 120 KB | 51 KB | **42 KB (−65%)** |
| campaign hero on a desktop | 120 KB | 129 KB | **104 KB at 2× the source resolution** |

Bands never exceed 2.1× the master (nothing is fabricated past that), slots the master already
covers are copied, not resampled, and a fingerprint stamp makes re-runs a no-op — `predev` costs
~40 ms when nothing changed. The variants are deliberately **not** committed: the repo did not
grow, and `npm ci && npm run build` on Vercel reproduces them.

## 4 · Bundle

| | before | after |
| --- | --- | --- |
| JS (one chunk) | 423.83 kB · gz 126.96 | app **118.27 kB · gz 34.14** + vendor 263.73 kB · gz 85.75 (split, so content changes re-validate without re-parsing React + Framer) |
| CSS | 48.45 kB · gz 8.91 | 42.43 kB · gz 7.97 |
| modules | 408 | 405 |
| `preview.html` | 10.9 MB, tracked and **stale** | 8.95 MB, generated by `npm run build:preview` |
| `tsconfig` | `noUnusedLocals/Params: false` (hid dead code) | both `true` — dead code now fails the build |

The single-file preview is *smaller than the original* despite the app gaining a pipeline, because
the manifest is no longer keyed by image paths: `build-preview.mjs` rewrites every occurrence of a
`/products/x.jpg` string into a base64 URI, and keyed-by-path duplicated all 37 images (that bug
briefly pushed the artifact to 16.34 MB; the slug-keyed manifest is the fix, and one copy of each
photo is what a single-file artifact should carry).

## 5 · Audit findings closed on the way through

| Finding | Outcome |
| --- | --- |
| Price slider floor unreachable (`min={1000}` vs a Rs 950 floor, bounds from list price while the filter compared sale price) | both bounds derived from `priceOf()`; Rs 750–6,500 |
| `productMessage` printed the unit price next to `Quantity: 3` | line total + `(Rs x each)` when qty > 1 |
| Quick-add fabricated a size/color the shopper never chose | card adds only when there is nothing to choose; otherwise it opens the dialog, and the WhatsApp message omits unchosen variants |
| Modal effect re-ran on `cartOpen`, yanking focus to the card behind the overlays | lock/focus effect keyed to the product; Escape listener separate |
| 650 ms "added" timeout never cleared on unmount | stored in a ref and cleared |
| Mega-menu had no touch/outside/Escape dismissal | closes on outside pointerdown and Escape |
| Reduced-motion gaps (`Reveal`, `animate-ping`, full-page `blur(10px)`) | `Reveal` returns a plain node under `useReducedMotion`; `.animate-ping` added to the reduced-motion block; the blur only exists during the reveal |
| New Arrivals filtered by flag but sorted by date, silently excluding 8 newer pieces | newest-first within the flagged set, capped at 8, matching the rack it links to |
| Search-focus request never expired | 2 s window |
| `colorImages[colors[0]]` ignored | honored — a real photo for the first color beats the tinting path |
| "Pairs well with" over same-rack items, `+` icon on a row that only navigates | "More from {category}", arrow icon |
| View-keyed remount dropped query/filters/sort | unkeyed; the view prop drives results |
| `reset()` ignored sort; `activeCount` ignored the query | both included |
| `role="button"` `<article>` containing buttons; `aria-label` on a bare `<span>`; anchor with `href={undefined}` + `aria-disabled` | card hit area is a real `<button>` overlay (and the hand-rolled Enter/Space handler went with it); `Stars` is `role="img"`; the disabled basket CTA is a `<button disabled>` |
| `AnimatePresence mode="popLayout"` couldn't measure `ProductCard` (function component, no ref) | `forwardRef` — also silenced a React warning the jsdom run surfaced |
| Dead `Logo`, duplicated `MEGA_TILES`/`TILES`, `copper`, `terracotta.light`, `rounded-5xl`, `.floaty` + keyframes, two copies of the easing curve, per-tile `filter()` counts | all removed; the rack list, its counts and the tiles now come from one `CATEGORY_TILES`/`COUNT_BY_CATEGORY` pair, with a compile-time check that the rack list and the `Category` union cannot drift apart |
| Hard-coded counts (`25`, `numberOfItems` in JSON-LD) | derived from the catalog or removed |
| Dead `eslint-disable` comments with no linter installed | removed, replaced by the reason the dep array is intentional |
| `tone: Record<string, string>` swallowing a missing key | `Record<BadgeTone, string>` |

## 6 · Corrections to earlier rounds

- Round 3 wrote "**`preview.html` regenerated (37 images, 10.4 MB)**". The tracked artifact was
  10.9 MB and did **not** match a fresh build. Now `npm run build:preview` runs the build itself, so
  the artifact cannot drift from the source again.
- Round 3 claimed reduced motion was respected. It was respected for the preloader and the marquee
  only — `Reveal` (~60 blocks per page), `animate-ping` and the page-wide reveal blur ignored it.
- Round 3 claimed "no dead paths". §5 lists the dead code that was still in the repo.
- Round 3 concluded "the AAA checklist is closed. Round 4 would be user-testing, not inspection."
  Inspection alone found five logic/accessibility bugs this round, so that conclusion was premature.
- The round-2 data audit is the one round whose claims verified true line by line.

## 7 · Still open (not hidden)

- No Lighthouse run and no real-device testing — those need Chrome on a machine, and the numbers
  above are byte measurements, not lab scores.
- No visual regression harness. `npm run smoke` asserts structure, flow and console silence; it
  cannot tell you a shadow got lighter.
- The 1920/2560 campaign slots are resampled from a 1376-wide master. They are *sharper than a
  browser stretch* and cheaper than the JPEG, but they are not real 2.5k detail — that needs a
  reshoot or a dedicated upscaler (Topaz/Real-ESRGAN class), not this model.
- The modal's three gallery "views" are crops of one photo, not three angles.
- `preview.html` is still an ~9 MB tracked file. Reproducible in one command if you would rather
  not carry it.
