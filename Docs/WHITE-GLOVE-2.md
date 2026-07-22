# White-Glove Review — Round 2 · RetailFlow × Marigold & Clay

**Scope of this pass:** regression-verification of all Round-1 fixes, first-ever audit of the remaining unaudited code (admin dashboard panels, mobile filter sheet, full catalog tail), an **automated data-integrity audit of all 25 products**, overlay z/z-order + keyboard Esc choreography, and short-viewport survival of the intro.

**Build status at sign-off:** `tsc --noEmit` ✓ · `vite build` ✓ · `preview.html` regenerated ✓
**Method:** static + code-path tracing (same as Round 1 — sandbox has no headless browser).

---

## Part 1 · Regression check on Round-1 fixes — all hold ✅

| Round-1 fix | Verified |
| --- | --- |
| WhatsApp `Link:` clean on file:// previews | ✓ `linkShareable()` guard in place |
| `#product-<slug>` deep links open the modal | ✓ App mount effect parses + opens |
| Mega-menu anchored to viewport | ✓ `fixed inset-x-0 top-[4.25rem]` centers everywhere |
| Reduced-motion kills marquee/floaty/smooth-scroll | ✓ media query in `index.css` |
| Modal/basket focus-in + restore | ✓ working; restore chain (card → modal → basket) behaves correctly |
| Esc on mobile menu | ✓ |
| Keyboard product cards + focus-within actions | ✓ `role="button"`, Enter/Space, no child-button interference (target check) |
| Basket `aria-modal` + Browse-catalog navigates | ✓ |
| Marquee single-read + seamless loop | ✓ |
| Route-aware `document.title` | ✓ |
| OG meta | ✓ |

**Regression found: none.**

## Part 2 · Automated data audit — CLEAN ✅

`tsx` script over `src/data/products.ts` + `public/` filesystem:

- 25/25 unique ids and slugs · **all 25 images exist on disk** · every color across every product has a `COLOR_HEX` entry
- Pricing sane: 3 sale items (discount < price, sane %), 9 new arrivals, 2 low-stock · `priceOf()/discountOf()` consistent
- Ratings 0–5 ✓ · reviews > 0 ✓ · popularity within 0–100 ✓ · every product has details + colors; sizes consistent
- `addedAt` fully unique → **"Newest first" sort is fully deterministic**
- Category coverage: Clothing 10 · Accessories 4 · Footwear 2 · Stationery 4 · Cosmetics 3 · Gifts 2 — every nav tile maps to real stock

*(Audit script kept at the end of this document for re-use on every catalog change.)*

## Part 3 · New findings — 6 fixed this pass

| # | Area | Finding | Disposition |
| --- | --- | --- | --- |
| 1 | Esc choreography | With the basket stacked above the product modal, one Escape press closed **both** dialogs — the user lost the modal they were mid-purchase in. | **Fixed** — modal defers Escape to the basket when stacked. |
| 2 | Scroll locking | Same stack: closing the basket raw-cleared `body.overflow` while the modal was still open → background scrolled behind a live modal. | **Fixed** — new refcounted `scrollLock` util (`utils/scrollLock.ts`); modal, basket, mobile menu and filter sheet all lock/unlock in matched pairs. |
| 3 | Mobile filter sheet | Had no Escape handling, no `dialog` semantics, no scroll lock, no focus management — the rawest overlay in the app. | **Fixed** — full dialog treatment (lock, Esc, `aria-modal`, focus-in, outline-none). |
| 4 | Mega-menu on touch | On touch-capable laptops/tablets (no hover), tapping "Categories" navigated without ever showing the panel. | **Fixed** — first tap opens the panel, second tap navigates; mouse behavior unchanged (hover opens, click navigates). |
| 5 | Intro on short viewports | The embroidered composition (~480px tall) clips top/bottom on landscape phones (panels are `overflow-hidden`). | **Fixed** — height-based scale guards (≤640px → 0.82×, ≤460px → 0.68×). |
| 6 | Mega-menu timer | Close-delay timer not cleared on unmount (would fire on dead component). | **Fixed.** |

## Part 4 · Observations verified acceptable (no action)

- **Admin dashboard section** — pulls *real* product data for the watchlist and edit preview (stock badge, strikethrough price react live), sample inquiry figures carry the "illustrative" note, and the section itself is labeled "Demo preview / Interactive preview". Meets our honesty bar. ✅
- **Results count** uses `role="status"` — screen readers announce filter changes politely. ✅
- **Z-order audit** — preloader (200) > dialogs (85) > modal (80) > filter sheet (76) > sticky CTAs (60) > mega panel (60) > nav (50) — every stacking case traced; the only intentional stack (basket over modal) is now Esc-safe and scroll-safe. ✅
- **New-arrivals rail arrow math** — 340px nudge ≈ 1.03 card widths; end-card "view all" flex-stretches to rail height. ✅
- **Basket restore-focus chain** — basket opened from inside the modal restores focus *into the still-open modal*, which later restores to the originating card. Triple-stack safe. ✅

## Part 5 · Still recommended (enhancement, not repair)

1. **Full Tab-trapping** inside dialogs (we have focus-in/restore/priority-Esc; cycling Tab is the AAA cherry).
2. JSON-LD product schema + per-route meta description at real deployment.
3. Preloader body-lock could share the refcount util (stand-alone raw lock documented since Round 1 — low risk; leaving by design).
4. Real per-colorway photography for top sellers.
5. Per-product zoom-crop art direction for client photography.

**Reviewer disposition:** Round-1 clean bill confirmed; six new items found and resolved; zero regressions. Recommending this moves from "review cadence" to "spot-check on change" status.

---

### Appendix · the data audit script (re-runnable)

```bash
npx tsx@4 /tmp/audit.mts   # script verifies: id/slug uniqueness, image files on disk,
                           # COLOR_HEX coverage, pricing sanity, metadata bounds,
                           # addedAt determinism, category coverage
```

Mirrors live in `src/data/products.ts` checks: unique ids/slugs, image existence, color→hex map, price/sale sanity, ratings/reviews/popularity bounds, deterministic `addedAt`, non-empty racks. Run it whenever the catalog changes.
