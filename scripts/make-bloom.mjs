/**
 * Cut the white studio background out of an AI-generated logo concept.
 * Edge-flood approach: white is only removed where it can be reached from
 * the image border, so enclosed light details (the cream seed dots in the
 * bloom's center) survive untouched. A 1px feather ring softens the edge.
 *
 *   node scripts/make-bloom.mjs <input.png> <output.png> [size]
 *
 * Requires: npm install --no-save sharp
 */
import sharp from 'sharp'

const [input, output = 'logo-bloom.png', sizeArg] = process.argv.slice(2)
const size = sizeArg ? Number(sizeArg) : 512
if (!input) throw new Error('usage: node scripts/make-bloom.mjs <input> [output] [size]')

const img = sharp(input).ensureAlpha()
const { data, info } = await img.raw().toBuffer({ resolveWithObject: true })
const { width: W, height: H } = info
const ch = 4

const minC = (i) => Math.min(data[i], data[i + 1], data[i + 2])

/* 1 · flood from the borders through near-white pixels */
const FLOOD_T = 235
const removed = new Uint8Array(W * H)
const stack = []
const seed = (x, y) => {
  const p = y * W + x
  if (!removed[p] && minC(p * ch) > FLOOD_T) {
    removed[p] = 1
    stack.push(p)
  }
}
for (let x = 0; x < W; x++) {
  seed(x, 0)
  seed(x, H - 1)
}
for (let y = 0; y < H; y++) {
  seed(0, y)
  seed(W - 1, y)
}
while (stack.length) {
  const p = stack.pop()
  const x = p % W
  const y = (p / W) | 0
  const tryN = (nx, ny) => {
    if (nx < 0 || ny < 0 || nx >= W || ny >= H) return
    const q = ny * W + nx
    if (!removed[q] && minC(q * ch) > FLOOD_T) {
      removed[q] = 1
      stack.push(q)
    }
  }
  tryN(x + 1, y)
  tryN(x - 1, y)
  tryN(x, y + 1)
  tryN(x, y - 1)
}
for (let p = 0; p < W * H; p++) if (removed[p]) data[p * ch + 3] = 0

/* 2 · feather the boundary ring — anti-aliased white halo → soft alpha */
const F_LO = 210
const F_HI = 255
for (let p = 0; p < W * H; p++) {
  if (removed[p] || data[p * ch + 3] === 0) continue
  const x = p % W
  const y = (p / W) | 0
  const nearHole =
    (x > 0 && removed[p - 1]) ||
    (x < W - 1 && removed[p + 1]) ||
    (y > 0 && removed[p - W]) ||
    (y < H - 1 && removed[p + W])
  if (!nearHole) continue
  const m = minC(p * ch)
  if (m > F_LO) data[p * ch + 3] = Math.max(0, 255 - ((m - F_LO) * 255) / (F_HI - F_LO))
}

/* 3 · trim, square-pad, resize, save */
await sharp(data, { raw: { width: W, height: H, channels: ch } })
  .trim()
  .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile(output)

console.log(`background removed → ${output} (${size}×${size}, center tones preserved)`)
