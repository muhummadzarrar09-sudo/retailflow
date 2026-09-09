# White glove 5 · the picture quality pass (python, not a paint model)

Round 4 shipped a real responsive ladder but left the source pixels alone: 1024² product masters
and a 1376×768 hero. The site asks the hero to fill a 2,880-device-px banner and the modal's
"Detail" crop asks for a 2.1× zoom, so those slots were browser upscaling — soft, blocked, and
mushy exactly where a shopper looks.

The instruction was specific: **do not re-master these photos with a generative model, make the
quality better with a python script.** So this round is classical CV plus one tiny learned
super-resolver, run over the masters, and nothing else.

## 1 · What was rejected, and why

| Option | Verdict |
| --- | --- |
| `generate_image` re-paint of the masters | Rejected by the user, and independently by measurement: the model returned the input's own size and **lowered** edge energy (5.94 → 5.21). It redraws, it does not restore. |
| EDSR ×2 (`dnn_superres`) | Measured, then dropped: at 1024²→2048² it needs ~4.3 GB of activations and the process is OOM-killed on this 3.9 GB box; tiled it runs ~37 s per 256² patch (~10 min per frame). Tiling seams were visible on fabric. |
| FSRCNN ×2 (39 kB weights) | **Chosen.** 1.4 s per 1024² frame, no seams, and a crop-level A/B against EDSR at matched scale was indistinguishable on this catalog. |
| Lanczos + unsharp only (no learned step) | The honest fallback and still the best "free" option, but a 4× pixel count from an interpolator is smoothness, not detail — it lost to FSRCNN on both energy and looks. |
| bicubic/`cv2.resize` alone | What the browser was already doing. That *is* the bug. |

Weights can't be fetched with `curl` here — `raw.githubusercontent.com` dies with
`SSL_ERROR_SYSCALL` after the redirect. `gh api` with the `raw` Accept header works, and the
script prints that exact command if the `.pb` is missing.

## 2 · The recipe (`scripts/enhance-masters.py`)

Order matters; each step's output is the next step's input.

1. **Denoise** — `fastNlMeansDenoisingColored(luma h=3, chroma h=4)`. Upscaling enlarges mosquito
   noise into what looks like texture, so this has to come first. Flat-area σ across the catalog:
   **1.35 → 0.50**.
2. **Learned ×2** — FSRCNN via `cv2.dnn_superres`. This is the only step that adds pixels, and it
   is a 39 kB convnet: it cannot invent a pattern that isn't implied by the source.
3. **Luminosity unsharp** — Gaussian blur of the **L\* channel only**, radius 1.6 px, amount 0.42,
   recombined. Micro-contrast is what reads as "sharp" at arm's length; confining it to lightness
   is what keeps colour fringing off thread edges.
4. **Highlight rolloff** — soft shoulder above 226/255 on L\*, so the marigold plaster and the white
   ceramics stop clipping to flat cream.
5. **+4 % vibrance** in HSV (applied where saturation is low–mid, scaled off above 0.8) — the
   catalog was shot slightly under-saturated; more than that starts looking edited.
6. **Clamp + encode** — non-campaign frames are reduced to 1600px wide with `INTER_AREA` (that
   also anti-aliases any residual SR ringing), then progressive JPEG **q84 at 4:4:4**. 4:2:0 would
   throw away exactly the chroma detail a fabric photo is made of.

`--clarity` (CLAHE micro-contrast blend) is implemented and **off by default**. Measured on this
catalog it did something bad that the average metrics reward: every product shares the same painted
wall, and CLAHE lifted the low-frequency mottling in it into visible blotches. The crop comparison
is unambiguous — background goes blotchy, fabric barely improves. Left in as a flag for shoots with
genuinely flat lighting.

## 3 · How the numbers were measured (and the trap in the first version)

The first pass reported "detail 262 → 92" and looked like a 3× loss. That was my metric being
wrong, not the image: Laplacian variance is not resolution-normalised, so quadrupling the pixel
count of the same content divides the per-pixel second derivative. **Every detail number below is
taken on a matched canvas with the same encoder** — old master → slot, new master → slot, both
`sharp` lanczos, both WebP q78, same filename, same width.

Served-slot A/B, mean over 32 non-campaign masters:

| Slot | Edge detail | Bytes |
| --- | --- | --- |
| 400w | ×2.47 | 13 → 15 KB |
| 640w | ×2.48 | 30 → 33 KB |
| 1024w | ×1.15 | 74 → **64 KB** |
| 1600w (new band) | ×1.75 | 117 → **111 KB** |
| campaign hero 1920w | ×2.83 | 60 → 65 KB |
| campaign hero 2560w | ×2.99 | 88 → 92 KB |

Fidelity against the source frame (the anti-repaint check): **SSIM 0.9949 mean, RMSE ≈ 6/255**
across all 37 masters. JPEG 8×8 blocking metric **0.69 → 0.01** — the block grid is gone, which is
most of why the small slots look better rather than merely sharper.

Masters went 5.68 MB → 12.30 MB in git. That is the cost of the pass; the payload shipped to a
browser went *down* (next section), and `preview.html` shrank from 8.95 MB to 6.22 MB because the
inliner now resizes to 1024 before embedding (the artifact never paints a bigger slot).

## 4 · Repo changes around the pass

- `public/products/*.jpg` — all 37 masters replaced (products 1024²→1600², hero 1376×768→
  2752×1536, portrait campaign frames 928×1152→1856×2304).
- `scripts/img-pipeline.mjs` — product bands are now `400/640/1024/1600` (the 1600 band exists for
  the modal's zoomed Detail/Texture crops); campaign band 3200 was tried and dropped, since nothing
  on the page paints wider than 2,880 device px. **Every served slot is now at or below the
  master's native width** — `upsampledTo` is 0 for all 32 products and for the hero. Four campaign
  frames keep one band slightly past native so a request is never stranded: the two portrait ones
  (1856px) carry 1920 (+3.4 %) and the two landscape ones (2528px) carry 2560 (+1.3 %). The
  `MAX_UPSCALE 2.1` synthesis path is now
  dead code for this catalog; it stays so a smaller drop-in photo still gets a full ladder.
- `index.html` — `og:image:width/height` follow the new hero (2752×1536).
- `scripts/ssr-smoke.mjs` — the intrinsic-size assertion had `width="1024"` hard-coded and started
  failing the moment the masters changed; it now requires *every* `<img>` to carry a real
  width/height, which is the property that was actually meant.
- `scripts/dom-smoke.mjs` — jsdom 2x removed `MediaQueryList.addListener`; framer's
  `useReducedMotion` threw inside the library and printed a stack that could hide a real failure.
  The stub now hands back a complete MQL.
- `.gitignore` — `assets-src/` (the pass's staging dir), `.venv/`, `__pycache__/`.

## 5 · Reproducing it

```bash
python3 -m venv .venv
.venv/bin/pip install numpy pillow opencv-contrib-python-headless     # contrib: cv2.dnn_superres
mkdir -p .venv/models
gh api -H "Accept: application/vnd.github.raw+json" \
  repos/Saafke/EDSR_Tensorflow/contents/models/FSRCNN_x2.pb > .venv/models/FSRCNN_x2.pb
.venv/bin/python scripts/enhance-masters.py --dry-run                 # metrics, writes nothing
.venv/bin/python scripts/enhance-masters.py --quality 84 --install    # then:
npm run images:force && npm run check && npm run build:preview
```

Whole pass over 37 frames: ~100 s. That is deliberately not a build step — a fresh clone must not
need a python toolchain, so the enhanced pixels are committed as the masters and `prebuild` only
runs `sharp`. When real client photos arrive: drop them in, run the pass once, commit the masters.

## 6 · Limits, stated plainly

- FSRCNN is a small predictor. On very busy textures (the lawn print) it resolves more than the
  browser stretch did, but it is inferring, not recovering — at 400% zoom a viewer may see waxy
  micro-pattern in places where the original had grain. Nothing generative is added; nothing is
  guaranteed to exist that wasn't implied.
- No Lighthouse or real-device run yet, so the payload numbers are computed from the manifest and
  file sizes, not from a cold network trace.
- The modal's "front / detail / texture" gallery views are still crops of one photo — this pass
  makes those crops better, it does not make them additional angles. Real shoot remains the fix.
- SSIM/RMSE prove structural agreement with the source frame. They are the right guard against a
  repainting model, not a substitute for a human looking at the page.
