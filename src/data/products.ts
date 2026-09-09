export type Category = 'Clothing' | 'Accessories' | 'Footwear' | 'Stationery' | 'Cosmetics' | 'Gifts'

/** the racks, in nav order — the single list behind every "shop by category" UI */
export const CATEGORY_LIST = [
  'Clothing',
  'Accessories',
  'Footwear',
  'Stationery',
  'Cosmetics',
  'Gifts',
] as const satisfies readonly Category[]

/** compile-time proof the list and the union describe the same six racks: add a
 *  category to one side and this line stops type-checking until you add it to
 *  the other (it used to live in StoreContext, where nothing linked them) */
type _RacksMatch = [Category] extends [typeof CATEGORY_LIST[number]]
  ? [typeof CATEGORY_LIST[number]] extends [Category]
    ? true
    : never
  : never
const _racks: _RacksMatch = true
void _racks
export type StockStatus = 'in-stock' | 'low-stock'

export interface Product {
  id: string
  slug: string
  name: string
  category: Category
  price: number
  salePrice?: number
  image: string
  /** real studio photography for specific colorways — overrides the styled
      duotone preview for those colors (keyed by color name exactly) */
  colorImages?: Record<string, string>
  /** art-directed zoom origins for the modal gallery's Detail/Texture views */
  cropDetail?: string
  cropTexture?: string
  description: string
  details: string[]
  sizes?: string[]
  colors: string[]
  stock: StockStatus
  isNew?: boolean
  featured?: boolean
  rating: number
  reviews: number
  popularity: number // 0–100, drives the "popular" sort
  addedAt: number // drives the "newest" sort
}

/** Demo color names → hex (used for swatches across the UI) */
export const COLOR_HEX: Record<string, string> = {
  Rust: '#B0512B',
  Sand: '#D9C3A3',
  Espresso: '#2A211B',
  Ivory: '#F1E7D6',
  Terracotta: '#C05B2C',
  Charcoal: '#3A332C',
  Tan: '#B07C4F',
  Black: '#1A1512',
  Clay: '#C8855A',
  Sage: '#8B8B6E',
  Cream: '#EFE3CE',
  Rosewood: '#8E4A3B',
  Berry: '#7C3040',
  Olive: '#6F6A45',
}

export const products: Product[] = [
  {
    id: 'p1',
    slug: 'classic-linen-kurta',
    name: 'Classic Linen Kurta',
    category: 'Clothing',
    price: 3500,
    image: '/products/classic-linen-kurta.jpg',
    colorImages: {
      Sand: '/products/classic-linen-kurta-sand.jpg',
      Espresso: '/products/classic-linen-kurta-espresso.jpg',
    },
    cropDetail: '46% 40%',
    cropTexture: '46% 62%',
    description:
      'A breathable pure-linen kurta cut in a clean, straight silhouette. Pre-washed for softness — an everyday piece that still looks considered.',
    details: [
      '100% European flax linen',
      'Corozo nut buttons',
      'Side slits with reinforced seams',
      'Machine wash cold, line dry',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Rust', 'Sand', 'Espresso'],
    stock: 'in-stock',
    isNew: true,
    rating: 4.8,
    reviews: 23,
    popularity: 82,
    addedAt: 12,
  },
  {
    id: 'p2',
    slug: 'embroidered-2-piece-suit',
    name: 'Embroidered 2-Piece Suit',
    category: 'Clothing',
    price: 6200,
    image: '/products/embroidered-2-piece-suit.jpg',
    colorImages: {
      Terracotta: '/products/embroidered-2-piece-suit-terracotta.jpg',
    },
    cropDetail: '47% 30%',
    cropTexture: '46% 30%',
    description:
      'Ivory cambric two-piece with hand-guided terracotta thread embroidery along the neckline and cuffs. Lined bodice, relaxed straight trouser.',
    details: [
      'Premium cambric cotton',
      'Hand-guided thread embroidery',
      'Fully lined bodice',
      'Dry clean recommended',
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Ivory', 'Terracotta'],
    stock: 'in-stock',
    featured: true,
    rating: 4.9,
    reviews: 41,
    popularity: 96,
    addedAt: 9,
  },
  {
    id: 'p3',
    slug: 'printed-lawn-3-piece',
    name: 'Printed Lawn 3-Piece',
    category: 'Clothing',
    price: 4800,
    salePrice: 3950,
    image: '/products/printed-lawn-3-piece.jpg',
    description:
      'Soft summer lawn three-piece with an all-over botanical print. Includes printed shirt, dyed trouser and matching dupatta.',
    details: [
      '90/88 count summer lawn',
      '3-piece: shirt, trouser, dupatta',
      'Unstitched — 3.25m shirt fabric',
      'Color-fast reactive dyes',
    ],
    sizes: ['S', 'M', 'L'],
    colors: ['Rosewood', 'Sand'],
    stock: 'low-stock',
    rating: 4.7,
    reviews: 18,
    popularity: 88,
    addedAt: 7,
  },
  {
    id: 'p4',
    slug: 'minimal-black-abaya',
    name: 'Minimal Black Abaya',
    category: 'Clothing',
    price: 5500,
    image: '/products/minimal-black-abaya.jpg',
    description:
      'A fluid, minimal abaya in premium nida fabric with a soft drape and hidden front snap closure. Finished with a clean structured cuff.',
    details: [
      'Premium Korean nida fabric',
      'Hidden snap front closure',
      'Structured cuff detailing',
      'Sizes follow standard abaya length chart',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Charcoal'],
    stock: 'in-stock',
    rating: 4.9,
    reviews: 35,
    popularity: 90,
    addedAt: 8,
  },
  {
    id: 'p5',
    slug: 'cotton-daily-wear-kurti',
    name: 'Cotton Daily Wear Kurti',
    category: 'Clothing',
    price: 2400,
    salePrice: 1950,
    image: '/products/cotton-daily-wear-kurti.jpg',
    description:
      'Easy everyday kurti in breathable combed cotton with a relaxed fit and side pockets. Made to be worn on repeat.',
    details: ['Combed cotton jersey', 'Functional side pockets', 'Relaxed straight fit', 'Machine washable'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Clay', 'Sage', 'Cream'],
    stock: 'in-stock',
    rating: 4.6,
    reviews: 27,
    popularity: 74,
    addedAt: 6,
  },
  {
    id: 'p6',
    slug: 'leather-crossbody-bag',
    name: 'Leather Crossbody Bag',
    category: 'Accessories',
    price: 4200,
    image: '/products/leather-crossbody-bag.jpg',
    colorImages: {
      Espresso: '/products/leather-crossbody-bag-espresso.jpg',
      Black: '/products/leather-crossbody-bag-black.jpg',
    },
    description:
      'Full-grain leather crossbody with an adjustable strap, magnetic flap and a lined interior pocket. Ages beautifully with wear.',
    details: [
      'Full-grain leather',
      'Cotton twill lining',
      'Adjustable shoulder strap',
      'Magnetic flap closure',
    ],
    colors: ['Tan', 'Espresso', 'Black'],
    stock: 'in-stock',
    featured: true,
    rating: 4.8,
    reviews: 19,
    popularity: 91,
    addedAt: 10,
  },
  {
    id: 'p7',
    slug: 'premium-notebook-set',
    name: 'Premium Notebook Set',
    category: 'Stationery',
    price: 1450,
    image: '/products/premium-notebook-set.jpg',
    colorImages: {
      Sage: '/products/premium-notebook-set-sage.jpg',
    },
    description:
      'Set of three A5 notebooks with cloth-bound covers in terracotta, sage and cream. Thick, fountain-pen friendly paper.',
    details: ['Set of 3 — A5 size', '100gsm natural white paper', 'Lay-flat stitched binding', '192 pages each'],
    colors: ['Terracotta', 'Sage', 'Cream'],
    stock: 'in-stock',
    isNew: true,
    rating: 4.9,
    reviews: 12,
    popularity: 68,
    addedAt: 11,
  },
  {
    id: 'p8',
    slug: 'office-stationery-bundle',
    name: 'Office Stationery Bundle',
    category: 'Stationery',
    price: 2800,
    image: '/products/office-stationery-bundle.jpg',
    description:
      'A curated desk bundle for small offices: notebooks, brass scissors, gel pens, sticky notes, clips and washi tape in warm tones.',
    details: ['14 curated pieces', 'Includes storage tray', 'Refills available separately', 'Bulk pricing for 5+ bundles'],
    colors: ['Cream'],
    stock: 'in-stock',
    rating: 4.7,
    reviews: 16,
    popularity: 79,
    addedAt: 5,
  },
  {
    id: 'p9',
    slug: 'matte-lip-tint',
    name: 'Matte Lip Tint',
    category: 'Cosmetics',
    price: 1250,
    image: '/products/matte-lip-tint.jpg',
    description:
      'Weightless matte lip tint with a soft-blur finish. Long-wearing without drying — terracotta, rosewood and berry shades.',
    details: ['Soft-blur matte finish', 'Up to 8 hours wear', 'Vitamin E enriched', 'Cruelty free'],
    colors: ['Terracotta', 'Rosewood', 'Berry'],
    stock: 'in-stock',
    isNew: true,
    rating: 4.6,
    reviews: 31,
    popularity: 85,
    addedAt: 13,
  },
  {
    id: 'p10',
    slug: 'oud-perfume-set',
    name: 'Oud Perfume Set',
    category: 'Cosmetics',
    price: 3750,
    image: '/products/oud-perfume-set.jpg',
    description:
      'A duo of amber oud eau de parfum — one smoky, one soft — presented in a rigid gift box with oud wood chips.',
    details: ['2 × 30ml eau de parfum', 'Smoky + soft amber oud', 'Rigid gift box included', 'Unverified claim-free fragrances'],
    colors: ['Espresso'],
    stock: 'low-stock',
    rating: 4.8,
    reviews: 22,
    popularity: 77,
    addedAt: 4,
  },
  {
    id: 'p11',
    slug: 'gift-box-hamper',
    name: 'Gift Box Hamper',
    category: 'Gifts',
    price: 5000,
    image: '/products/gift-box-hamper.jpg',
    description:
      'A ready-to-give hamper: soy candle, artisan soap, mini attar, dried orange slices and a hand-tied ribbon. Custom note card on request.',
    details: [
      'Soy candle + artisan soap',
      'Mini attar 6ml',
      'Hand-tied ribbon + note card',
      'Contents can be customized on WhatsApp',
    ],
    colors: ['Cream'],
    stock: 'in-stock',
    featured: true,
    rating: 4.9,
    reviews: 14,
    popularity: 93,
    addedAt: 3,
  },
  {
    id: 'p12',
    slug: 'mens-casual-kurta',
    name: "Men's Casual Kurta",
    category: 'Clothing',
    price: 3200,
    image: '/products/mens-casual-kurta.jpg',
    description:
      'A relaxed cotton kurta with a band collar and single chest pocket. Clean enough for jummah, easy enough for every day.',
    details: ['Soft wash cotton', 'Band collar, chest pocket', 'Relaxed regular fit', 'Machine washable'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Charcoal', 'Sand', 'Olive'],
    stock: 'in-stock',
    isNew: true,
    rating: 4.7,
    reviews: 9,
    popularity: 71,
    addedAt: 14,
  },
  {
    id: 'p13',
    slug: 'silk-chiffon-dupatta',
    name: 'Silk Chiffon Dupatta',
    category: 'Clothing',
    price: 1850,
    image: '/products/silk-chiffon-dupatta.jpg',
    description:
      'Feather-light chiffon dupatta with a hand-rolled edge and soft fall. The finishing piece your suit has been waiting for.',
    details: ['Pure chiffon', 'Hand-rolled edges', '2.5m length', 'Gentle hand wash'],
    colors: ['Terracotta', 'Ivory', 'Black'],
    stock: 'in-stock',
    rating: 4.7,
    reviews: 11,
    popularity: 66,
    addedAt: 15,
  },
  {
    id: 'p14',
    slug: 'velvet-winter-shawl',
    name: 'Velvet Winter Shawl',
    category: 'Clothing',
    price: 2950,
    image: '/products/velvet-winter-shawl.jpg',
    description:
      'Dense micro-velvet shawl with a brushed finish and knotted fringe. Warm without weight, dressy without trying.',
    details: ['Micro-velvet, brushed finish', 'Knotted fringe ends', '1 × 2.4m', 'Dry clean only'],
    colors: ['Berry', 'Charcoal'],
    stock: 'in-stock',
    isNew: true,
    rating: 4.8,
    reviews: 8,
    popularity: 72,
    addedAt: 16,
  },
  {
    id: 'p15',
    slug: 'denim-trucker-jacket',
    name: 'Denim Trucker Jacket',
    category: 'Clothing',
    price: 4600,
    image: '/products/denim-trucker-jacket.jpg',
    description:
      'A structured trucker in warm-wash denim with corozo buttons and double chest pockets. Breaks in beautifully.',
    details: ['12oz warm-wash denim', 'Corozo button placket', 'Double chest pockets', 'Machine wash cold inside-out'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Charcoal', 'Sand'],
    stock: 'in-stock',
    rating: 4.6,
    reviews: 14,
    popularity: 69,
    addedAt: 17,
  },
  {
    id: 'p16',
    slug: 'pleated-chiffon-hijab',
    name: 'Pleated Chiffon Hijab',
    category: 'Clothing',
    price: 1250,
    image: '/products/pleated-chiffon-hijab.jpg',
    description:
      'Pre-pleated chiffon that drapes in seconds and stays put. Breathable, opaque, and endlessly re-wearable.',
    details: ['Pre-pleated chiffon', 'Opaque double layer', '75 × 180cm', 'Machine washable'],
    colors: ['Cream', 'Terracotta', 'Rosewood'],
    stock: 'in-stock',
    rating: 4.8,
    reviews: 24,
    popularity: 81,
    addedAt: 18,
  },
  {
    id: 'p17',
    slug: 'leather-card-wallet',
    name: 'Leather Card Wallet',
    category: 'Accessories',
    price: 1650,
    image: '/products/leather-card-wallet.jpg',
    description:
      'Slim bifold in full-grain leather with four card slots and a center fold for folded notes. Disappears into a pocket.',
    details: ['Full-grain leather', '4 card slots + note fold', 'Edge-painted, saddle-stitched', 'Ages to a deep patina'],
    colors: ['Tan', 'Espresso', 'Black'],
    stock: 'in-stock',
    rating: 4.7,
    reviews: 17,
    popularity: 70,
    addedAt: 19,
  },
  {
    id: 'p18',
    slug: 'canvas-tote-bag',
    name: 'Canvas Tote Bag',
    category: 'Accessories',
    price: 1950,
    image: '/products/canvas-tote-bag.jpg',
    description:
      'Heavyweight 16oz canvas tote with leather handles and an interior zip pocket. Carries the week, looks like the weekend.',
    details: ['16oz cotton canvas', 'Full-grain leather handles', 'Interior zip pocket', 'Fits a 15" laptop'],
    colors: ['Cream', 'Clay'],
    stock: 'in-stock',
    isNew: true,
    rating: 4.8,
    reviews: 9,
    popularity: 76,
    addedAt: 20,
  },
  {
    id: 'p19',
    slug: 'minimal-steel-watch',
    name: 'Minimal Steel Watch',
    category: 'Accessories',
    price: 5400,
    image: '/products/minimal-steel-watch.jpg',
    description:
      'A clean 38mm case, cream dial and quick-release leather strap. Quiet on the wrist, sharp in a meeting.',
    details: ['38mm brushed steel case', 'Japanese quartz movement', 'Quick-release leather strap', '3ATM splash resistant'],
    colors: ['Espresso', 'Tan'],
    stock: 'in-stock',
    rating: 4.9,
    reviews: 13,
    popularity: 83,
    addedAt: 21,
  },
  {
    id: 'p20',
    slug: 'suede-loafers',
    name: 'Suede Penny Loafers',
    category: 'Footwear',
    price: 4200,
    image: '/products/suede-penny-loafers.jpg',
    colorImages: {
      Espresso: '/products/suede-penny-loafers-espresso.jpg',
    },
    description:
      'Unlined suede loafers with a classic penny band and stacked heel. Soft from day one, smarter than sneakers.',
    details: ['Unlined cow suede', 'Stacked leather heel', 'Cushioned insole', 'True to size'],
    colors: ['Tan', 'Espresso'],
    stock: 'in-stock',
    rating: 4.6,
    reviews: 10,
    popularity: 67,
    addedAt: 22,
  },
  {
    id: 'p21',
    slug: 'court-sneakers',
    name: 'Court Sneakers',
    category: 'Footwear',
    price: 3800,
    salePrice: 3150,
    image: '/products/court-sneakers.jpg',
    description:
      'Minimal low-top sneakers in tumble-soft leather with a tonal sole. The clean pair that goes with everything.',
    details: ['Tumbled leather upper', 'Cushioned footbed', 'Tonal rubber sole', 'Wipe clean'],
    colors: ['Cream', 'Clay'],
    stock: 'in-stock',
    isNew: true,
    rating: 4.7,
    reviews: 15,
    popularity: 80,
    addedAt: 23,
  },
  {
    id: 'p22',
    slug: 'brass-pen-set',
    name: 'Brass Pen Set',
    category: 'Stationery',
    price: 2200,
    image: '/products/brass-pen-set.jpg',
    description:
      'A weighty brass pen and pencil duo that patinas with use. The desk upgrade you feel every time you write.',
    details: ['Solid brass barrels', 'Gel pen + 0.7mm pencil', 'Refills available in-store', 'Gift box included'],
    colors: ['Tan', 'Espresso'],
    stock: 'in-stock',
    rating: 4.8,
    reviews: 7,
    popularity: 62,
    addedAt: 24,
  },
  {
    id: 'p23',
    slug: 'desk-organizer-tray',
    name: 'Desk Organizer Tray',
    category: 'Stationery',
    price: 1750,
    image: '/products/desk-organizer-tray.jpg',
    description:
      'A three-compartment desk tray that corrals pens, notes and the small things that wander. Solid, satisfying order.',
    details: ['Engineered wood, matte finish', '3 compartments', 'Felt-padded base', 'Wipe clean'],
    colors: ['Tan', 'Cream'],
    stock: 'in-stock',
    rating: 4.5,
    reviews: 6,
    popularity: 58,
    addedAt: 25,
  },
  {
    id: 'p24',
    slug: 'rose-face-mist',
    name: 'Rose Face Mist',
    category: 'Cosmetics',
    price: 950,
    image: '/products/rose-face-mist.jpg',
    description:
      'A fine, cooling rose mist for midday resets. Alcohol-free, gentle on skin, kind to your desk drawer.',
    details: ['100ml', 'Alcohol-free', 'Damask rose water', 'Patch test recommended'],
    colors: ['Cream', 'Rosewood'],
    stock: 'in-stock',
    isNew: true,
    rating: 4.6,
    reviews: 19,
    popularity: 73,
    addedAt: 26,
  },
  {
    id: 'p25',
    slug: 'scented-soy-candle',
    name: 'Scented Soy Candle',
    category: 'Gifts',
    price: 1600,
    image: '/products/scented-soy-candle.jpg',
    description:
      'A hand-poured soy candle in amber oud and vanilla — 45 hours of slow, clean burn in a reusable glass jar.',
    details: ['100% soy wax, 45h burn', 'Amber oud + vanilla', 'Cotton wick', 'Reusable glass jar'],
    colors: ['Cream', 'Terracotta'],
    stock: 'in-stock',
    isNew: true,
    rating: 4.9,
    reviews: 21,
    popularity: 88,
    addedAt: 27,
  },
]

export const priceOf = (p: Product) => p.salePrice ?? p.price

export const discountOf = (p: Product) =>
  p.salePrice ? Math.round(((p.price - p.salePrice) / p.price) * 100) : 0

export const relatedTo = (p: Product, count = 3): Product[] =>
  products.filter((x) => x.id !== p.id && x.category === p.category).slice(0, count)
/** the six racks, with the photo each one is represented by — used by the
 *  storefront tile grid and the nav mega-menu alike (they used to keep two
 *  copies of this list, which drifted the moment anyone added a category) */
export const CATEGORY_TILES: { name: Category; image: string }[] = [
  { name: 'Clothing', image: '/products/embroidered-2-piece-suit.jpg' },
  { name: 'Accessories', image: '/products/leather-crossbody-bag.jpg' },
  { name: 'Footwear', image: '/products/suede-penny-loafers.jpg' },
  { name: 'Stationery', image: '/products/premium-notebook-set.jpg' },
  { name: 'Cosmetics', image: '/products/oud-perfume-set.jpg' },
  { name: 'Gifts', image: '/products/gift-box-hamper.jpg' },
]

/** how many products sit on each rack — one pass, typed to the union so a new
 *  category has to be counted (and pictured) before this compiles */
export const COUNT_BY_CATEGORY: Record<Category, number> = CATEGORY_LIST.reduce(
  (acc, c) => ({ ...acc, [c]: products.filter((p) => p.category === c).length }),
  {} as Record<Category, number>,
)

export const RACKS: { name: Category; image: string; count: number }[] = CATEGORY_TILES.map(
  (t) => ({ ...t, count: COUNT_BY_CATEGORY[t.name] }),
)
