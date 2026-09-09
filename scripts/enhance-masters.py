#!/usr/bin/env python3
"""
Enhance the product photography — classic signal processing, no generative model.

    .venv/bin/python scripts/enhance-masters.py --dry-run      # measure, write nothing
    .venv/bin/python scripts/enhance-masters.py                # full pass -> assets-src/enhanced
    .venv/bin/python scripts/enhance-masters.py --scale 2 --model fsrcnn
    .venv/bin/python scripts/enhance-masters.py --only campaign-hero,campaign-sale --install

Why this exists
---------------
The masters in public/products are 1024² AI-rendered photos carrying visible JPEG
mosquito noise in the fabric and blocking in the flat tones, and the campaign
frames are asked to fill up to ~2.9k device px on a desktop. Resampling that
source in the browser is what made the hero look soft. This pass fixes the *file*,
once, for every downstream size:

  1. non-local-means denoise (luma 3.0, chroma 4.0)   — kills mosquito noise and
     JPEG blocking without touching edges; it is edge-preserving by construction
  2. optional learned super-resolution (FSRCNN x2)    — a small CNN (39 kB of
     weights, 1.4 s/image) that reconstructs detail instead of inventing it.
     EDSR x2 measures better on a patch (see --model edsr) but needs ~10 min per
     image on 2 CPU cores, which is not a build step anyone will run
  3. a moderate luminosity unsharp on L* only (r=1.6, amount 0.42) — micro-contrast
     is what reads as "sharp" on a phone, and keeping it in the lightness channel
     means no colored fringing along thread edges. CLAHE is available (--clarity)
     but off by default: measured on this catalog it brings up blotchy low-frequency
     mottling in the shared backdrop, which is worse than the mid-tones it recovers
  4. tone: gentle highlight rolloff (no clipped embroidery), +4% vibrance, and
     the warm cast is left exactly where the art direction put it
  5. encode: 4:4:4 chroma (the default 4:2:0 is what turns thin thread-level
     detail into mush) at the quality given by --quality

It deliberately does NOT: re-paint content, change composition, add grain,
sharpen with a high-pass radius that rings, or shift color. --compare prints the
fidelity numbers that prove it (RMSE against the untouched source, edge energy,
and the size of the result).

Output goes to assets-src/enhanced/ (untracked). `--install` copies the result
over public/products/*.jpg — the masters, which scripts/img-pipeline.mjs then
compiles into the responsive ladder.
"""
from __future__ import annotations

import argparse
import json
import shutil
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public" / "products"
OUT = ROOT / "assets-src" / "enhanced"
MODELS = ROOT / ".venv" / "models"

CAMPAIGN_HINTS = ("campaign",)


# ── metrics ────────────────────────────────────────────────────────────
def edge_energy(img: np.ndarray) -> float:
    """Laplacian variance — the standard sharpness proxy for this kind of work."""
    g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    return float(cv2.Laplacian(g, cv2.CV_64F).var())


def detail_at(img: np.ndarray, size: int) -> float:
    """Edge energy measured on a COMMON canvas — Laplacian variance on the raw
    result would drop just because the same content now covers 4x the pixels, so
    every image is resized to `size` before the second derivative is taken."""
    g = cv2.cvtColor(cv2.resize(img, (size, size), interpolation=cv2.INTER_AREA), cv2.COLOR_BGR2GRAY)
    return float(cv2.Laplacian(g, cv2.CV_64F).var())


def flat_noise(img: np.ndarray) -> float:
    """sigma inside the flattest 2% of 32x32 blocks — the mosquito-noise floor."""
    g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32)
    h, w = g.shape
    tiles = [
        float(g[y : y + 32, x : x + 32].std())
        for y in range(0, h - 32, 32)
        for x in range(0, w - 32, 32)
    ]
    tiles.sort()
    n = max(1, len(tiles) // 50)
    return float(np.mean(tiles[:n])) if tiles else 0.0


def blocking(img: np.ndarray) -> float:
    """Mean |gradient| exactly on 8px block borders vs mid-block: JPEG blocking
    pushes the first number up, so a drop means the grid is gone."""
    g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32)
    gx = np.abs(np.diff(g, axis=1))
    h, w = gx.shape
    cols = np.arange(w)
    on, off = gx[:, (cols % 8) == 7].mean(), gx[:, (cols % 8) == 3].mean()
    return float(on - off)


def fidelity(a: np.ndarray, b: np.ndarray) -> tuple[float, float]:
    """(rmse, ssim-lite) of b against a, both normalized to the smaller size."""
    h = min(a.shape[0], b.shape[0])
    w = min(a.shape[1], b.shape[1])
    a = cv2.resize(a, (w, h), interpolation=cv2.INTER_AREA).astype(np.float64)
    b = cv2.resize(b, (w, h), interpolation=cv2.INTER_AREA).astype(np.float64)
    rmse = float(np.sqrt(((a - b) ** 2).mean()))
    mu_a, mu_b = a.mean(), b.mean()
    va, vb = a.var(), b.var()
    cov = ((a - mu_a) * (b - mu_b)).mean()
    c1, c2 = (0.01 * 255) ** 2, (0.03 * 255) ** 2
    ssim = ((2 * mu_a * mu_b + c1) * (2 * cov + c2)) / ((mu_a**2 + mu_b**2 + c1) * (va + vb + c2))
    return rmse, float(ssim)


# ── the pass ───────────────────────────────────────────────────────────
def denoise(img: np.ndarray, h: float, hc: float) -> np.ndarray:
    return cv2.fastNlMeansDenoisingColored(img, None, h, hc, 7, 21)


def unsharp_lab(img: np.ndarray, radius: float, amount: float) -> np.ndarray:
    """Sharpen the L* channel only — no color fringing at the edges of threads."""
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB).astype(np.float32)
    l, a, b = cv2.split(lab)
    blur = cv2.GaussianBlur(l, (0, 0), radius)
    l2 = np.clip(l + (l - blur) * amount, 0, 255).astype(np.uint8)
    return cv2.cvtColor(cv2.merge([l2, a.astype(np.uint8), b.astype(np.uint8)]), cv2.COLOR_LAB2BGR)


def local_contrast(img: np.ndarray, strength: float, clip: float = 1.15) -> np.ndarray:
    """CLAHE on L*, blended down — flat AI-linen has almost no mid-scale contrast."""
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=clip, tileGridSize=(8, 8))
    mixed = cv2.addWeighted(l, 1 - strength, clahe.apply(l), strength, 0)
    return cv2.cvtColor(cv2.merge([mixed, a, b]), cv2.COLOR_LAB2BGR)


def highlight_rolloff(img: np.ndarray, knee: float = 232.0, softness: float = 26.0) -> np.ndarray:
    """A filmic shoulder above the knee: keeps embroidery from clipping to paste."""
    f = img.astype(np.float32)
    mask = f > knee
    over = (f - knee)[mask]
    f[mask] = knee + softness * over / (over + softness)
    return np.clip(f, 0, 255).astype(np.uint8)


def vibrance(img: np.ndarray, amount: float) -> np.ndarray:
    """Boost the dull pixels, leave the already-saturated ones alone."""
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV).astype(np.float32)
    s = hsv[..., 1]
    hsv[..., 1] = np.clip(s * (1 + amount * (1.0 - s / 255.0)), 0, 255)
    return cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2BGR)


class Upscaler:
    def __init__(self, name: str, scale: int):
        self.name, self.scale = name, scale
        if name == "none":
            self.sr = None
            return
        path = MODELS / f"{name.upper()}_x{scale}.pb"
        if not path.exists():
            raise SystemExit(
                f"missing weights {path}\n"
                f"  gh api -H 'Accept: application/vnd.github.raw+json' "
                f"repos/Saafke/{name.upper()}_Tensorflow/contents/models/{path.name} > {path}"
            )
        sr = cv2.dnn_superres.DnnSuperResImpl_create()
        sr.readModel(str(path))
        sr.setModel(name, scale)
        self.sr = sr

    def apply(self, img: np.ndarray) -> np.ndarray:
        if self.sr is None:
            return img
        if self.name == "edsr":
            return self._tiled(img)
        return self.sr.upsample(img)

    def _tiled(self, img: np.ndarray, tile: int = 320, overlap: int = 24) -> np.ndarray:
        """EDSR on a 1024² frame needs 4 GB of activations — tile it, feather the
        seams, and it runs in any amount of memory."""
        s, o = self.scale, overlap
        h, w = img.shape[:2]
        out = np.zeros((h * s, w * s, 3), np.float32)
        wt = np.zeros((h * s, w * s, 1), np.float32)
        step = tile - 2 * overlap
        for y in range(0, h, step):
            for x in range(0, w, step):
                y0, x0 = max(0, y - overlap), max(0, x - overlap)
                y1, x1 = min(h, y + tile - overlap), min(w, x + tile - overlap)
                patch = img[y0:y1, x0:x1]
                up = self.sr.upsample(patch).astype(np.float32)
                oy, ox = (y0 - y) * s, (x0 - x) * s
                py, px = y * s, x * s
                win = (
                    slice(max(0, py - 0), min(h * s, py + tile * s)),
                    slice(max(0, px - 0), min(w * s, px + tile * s)),
                )
                # weight the interior fully, taper the rim so tiles fuse
                yy, xx = np.mgrid[win[0].start : win[0].stop, win[1].start : win[1].stop]
                gy = np.minimum(yy - y * s, (y + tile) * s - 1 - yy)
                gx = np.minimum(xx - x * s, (x + tile) * s - 1 - xx)
                m = np.clip(np.minimum(gy, gx) / max(1.0, o * s), 0, 1)[..., None] ** 0.6
                out[win] += up[oy : oy + m.shape[0], ox : ox + m.shape[1]] * m
                wt[win] += m
        return np.clip(out / np.maximum(wt, 1e-6), 0, 255).astype(np.uint8)


def enhance(img: np.ndarray, args, upscale: Upscaler) -> np.ndarray:
    out = img
    if args.denoise > 0:
        out = denoise(out, args.denoise, args.denoise_color)
    if args.scale > 1:
        before = out.shape[:2]
        out = upscale.apply(out)
        got = out.shape[:2]
        want = (before[0] * args.scale, before[1] * args.scale)
        if got != want:  # tiles/rounding safety
            out = cv2.resize(out, (want[1], want[0]), interpolation=cv2.INTER_LANCZOS4)
    elif upscale.scale > 1:
        out = cv2.resize(out, (img.shape[1] * upscale.scale, img.shape[0] * upscale.scale),
                         interpolation=cv2.INTER_LANCZOS4)
    if args.clarity > 0:
        out = local_contrast(out, args.clarity)
    if args.sharpen > 0:
        out = unsharp_lab(out, args.sharpen_radius, args.sharpen)
    if args.rolloff > 0:
        out = highlight_rolloff(out, softness=args.rolloff)
    if args.vibrance > 0:
        out = vibrance(out, args.vibrance)
    return out


def save(img: np.ndarray, path: Path, quality: int) -> None:
    """4:4:4 chroma — the default 4:2:0 is where thin detail goes to die."""
    path.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB)).save(
        path, "JPEG", quality=quality, subsampling=0, optimize=True, progressive=True
    )


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--only", help="comma-separated file stems to process")
    p.add_argument("--scale", type=int, default=2, choices=[1, 2, 3, 4], help="super-resolution factor (1 = no upscale)")
    p.add_argument("--model", default="fsrcnn", choices=["fsrcnn", "edsr", "espcn", "none"])
    p.add_argument("--quality", type=int, default=88)
    p.add_argument("--denoise", type=float, default=3.0, help="NLM luma strength (0 disables)")
    p.add_argument("--denoise-color", type=float, default=4.0)
    p.add_argument(
        "--clarity",
        type=float,
        default=0.0,
        help="CLAHE blend weight — off by default: on this catalog it amplifies "
        "mottling in the flat painted backdrop every product shares. The "
        "luminosity unsharp already carries the crispness",
    )
    p.add_argument("--sharpen", type=float, default=0.42, help="luminosity unsharp amount")
    p.add_argument("--sharpen-radius", type=float, default=1.6)
    p.add_argument("--rolloff", type=float, default=26.0, help="highlight shoulder softness (0 off)")
    p.add_argument("--vibrance", type=float, default=0.04)
    p.add_argument(
        "--max-width",
        type=int,
        default=1600,
        help="cap NON-campaign masters at this width (INTER_AREA, so it also "
        "anti-aliases any SR ringing). Campaign frames are never clamped — they "
        "are the ones asked to fill 2.9k device px. 0 disables the cap",
    )
    p.add_argument("--campaign-only", action="store_true", help="upscale only the full-bleed campaign frames")
    p.add_argument("--out", default=str(OUT))
    p.add_argument("--install", action="store_true", help="copy results over public/products/*.jpg")
    p.add_argument("--dry-run", action="store_true", help="report metrics, write nothing")
    args = p.parse_args()

    out_dir = Path(args.out)
    files = sorted(f for f in SRC.glob("*.jpg"))
    if args.only:
        wanted = {w.strip() for w in args.only.split(",")}
        files = [f for f in files if f.stem in wanted]
    upscale = Upscaler(args.model if args.scale > 1 else "none", max(args.scale, 1))

    rows, before_bytes, after_bytes = [], 0, 0
    for f in files:
        img = cv2.imread(str(f), cv2.IMREAD_COLOR)
        if img is None:
            print(f"skip {f.name}: unreadable")
            continue
        scale = args.scale
        if args.campaign_only and not any(h in f.name for h in CAMPAIGN_HINTS):
            scale = 1
        res = enhance(img, argparse.Namespace(**{**vars(args), "scale": scale}), upscale)
        is_campaign = any(h in f.name for h in CAMPAIGN_HINTS)
        if args.max_width and not is_campaign and res.shape[1] > args.max_width:
            h = round(res.shape[0] * args.max_width / res.shape[1])
            res = cv2.resize(res, (args.max_width, h), interpolation=cv2.INTER_AREA)
        rmse, ssim = fidelity(img, res)
        src_kb = f.stat().st_size / 1024
        if args.dry_run:
            tmp = out_dir / f"probe-{f.stem}.jpg"
            tmp.parent.mkdir(parents=True, exist_ok=True)
            save(res, tmp, args.quality)
            dst_kb = tmp.stat().st_size / 1024
            tmp.unlink(missing_ok=True)
        else:
            dst = out_dir / f.name
            dst.parent.mkdir(parents=True, exist_ok=True)
            save(res, dst, args.quality)
            dst_kb = dst.stat().st_size / 1024
        before_bytes += src_kb * 1024
        after_bytes += dst_kb * 1024
        rows.append(
            {
                "file": f.name,
                "src": f"{img.shape[1]}x{img.shape[0]}",
                "out": f"{res.shape[1]}x{res.shape[0]}",
                "detail_before": round(detail_at(img, 1024), 1),
                "detail_after": round(detail_at(res, 1024), 1),
                "noise_before": round(flat_noise(img), 2),
                "noise_after": round(flat_noise(res), 2),
                "blocking_before": round(blocking(img), 3),
                "blocking_after": round(blocking(res), 3),
                "rmse": round(rmse, 2),
                "ssim": round(ssim, 4),
                "kb_before": round(src_kb, 1),
                "kb_after": round(dst_kb, 1),
            }
        )
        r = rows[-1]
        print(
            f"  {f.name:<26} {r['out']:>9}  detail@1024 {r['detail_before']:6.1f}→{r['detail_after']:6.1f} "
            f"({r['detail_after']/max(r['detail_before'],1e-6):4.2f}x)  noise {r['noise_before']:4.2f}→{r['noise_after']:4.2f}  "
            f"blocking {r['blocking_before']:5.2f}→{r['blocking_after']:5.2f}  ssim {r['ssim']:.4f}  "
            f"{r['kb_before']:4.0f}→{r['kb_after']:4.0f} KB"
        )

    mean = lambda k: float(np.mean([r[k] for r in rows])) if rows else 0.0
    print(
        f"\n  {len(rows)} images · {(before_bytes/1024/1024):5.1f} MB → {(after_bytes/1024/1024):5.1f} MB"
        f" · detail x{mean('detail_after')/max(mean('detail_before'),1e-6):.2f}"
        f" · noise {mean('noise_before'):.2f}→{mean('noise_after'):.2f}"
        f" · blocking {mean('blocking_before'):.2f}→{mean('blocking_after'):.2f}"
        f" · ssim vs source {mean('ssim'):.4f}"
    )
    print(f"  {'(dry run — nothing written)' if args.dry_run else '→ ' + str(out_dir)}")
    if not args.dry_run:
        (out_dir / "enhance-report.json").write_text(json.dumps(rows, indent=2))
        if args.install:
            n = 0
            for f in files:
                src = out_dir / f.name
                if src.exists():
                    shutil.copyfile(src, SRC / f.name)
                    n += 1
            print(f"  installed {n} masters over {SRC} — run `npm run images:force` next")
    return 0


if __name__ == "__main__":
    sys.exit(main())
