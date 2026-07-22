# White-Glove — Round 3 · "Hit the recommendations too"

Round 2 left five enhancement items. This round shipped **all five**. Build green: `tsc --noEmit` ✓ · `vite build` ✓ · `preview.html` regenerated (37 images, 10.4 MB) ✓

---

## 1 · Full Tab-trapping inside dialogs — SHIPPED ✅

New `src/utils/focusTrap.ts`: capture-phase Tab/Shift+Tab interception with a module-level dialog **stack**, so when overlays nest (basket over modal), only the topmost traps. Applied to:

- Product modal
- Inquiry basket drawer
- Mobile filter sheet
- Mobile nav menu (also gained `role="dialog" aria-modal`)

Escape priority from Round 2 is preserved and focus-in/restore remains in place — dialogs are now keyboard-complete: **enter → cycle inside → Esc → focus returns to the trigger.**

## 2 · SEO/meta polish — SHIPPED ✅

- Static **JSON-LD `Store` schema** in `index.html`: Marigold & Clay (Rawalpindi, PK · hours · COD/bank transfer · PKR · 25-item OfferCatalog across the 6 racks — labeled demo).
- **Per-route meta description** now swaps with the page, alongside the title (store copy vs platform copy).

## 3 · Preloader joins the scroll-lock club — SHIPPED ✅

The preloader converted from raw `body.overflow` pokes to the shared refcounted `scrollLock`. Consequence: the one documented cross-system nuance from Round 1 (deep-linked modal behind the curtains briefly losing its body lock) is **closed** — stacked locks resolve in pairs now, curtains included.

## 4 · Real per-colorway photography (batch 1) — SHIPPED ✅

Seven new studio shots, consistent with the catalog's plaster/linen/golden-window art direction. The modal now shows the **real photo** when one exists (badge: "Colorway photo"), falling back to the labeled duotone preview where it doesn't:

| Product | Colors now fully photographed |
| --- | --- |
| Embroidered 2-Piece Suit (hero) | Ivory ✓ · **Terracotta ✓ (new)** |
| Classic Linen Kurta | Rust ✓ · **Sand ✓ (new)** · **Espresso ✓ (new)** |
| Leather Crossbody Bag | Tan ✓ · **Espresso ✓ (new)** · **Black ✓ (new)** |
| Suede Penny Loafers | Tan ✓ · **Espresso ✓ (new)** |
| Premium Notebook Set | Terracotta ✓ · **Sage ✓ (new)** · Cream (duotone for now) |

Wired via a new `colorImages` field in the product data; UX copy distinguishes *"Studio photography… what you see is what arrives"* from *"styled preview… shared on WhatsApp."* Next batch (if wanted) clears the rest of the multi-color catalog.

## 5 · Per-product crop art direction — SHIPPED ✅

Modal gallery "Detail/Texture" zoom origins are now carried per product (`cropDetail`/`cropTexture` in data, with tuned defaults for everything else). Art direction was QA'd with actual rasterized crops (ImageMagick montage review):

- **Classic Linen Kurta** — Detail `46% 40%` (collar + placket), Texture `46% 62%` (linen weave body)
- **Embroidered 2-Piece Suit** — Detail `47% 30%` (lapel embroidery + bodice), Texture `46% 30%` (embroidery macro) — the shared default crop was verified *bad* here (it framed a blank wall), caught and corrected in this pass

---

### Remaining wishlist (genuinely optional now)

- Colorway photography batch 2 → every multi-color product photographed
- `sizes`/`srcset` on production `<img>` tags + Lighthouse run post-deploy
- Preload Fraunces/Manrope when self-hosting

**Disposition: the AAA checklist is closed.** Round 4 would be user-testing, not inspection.
