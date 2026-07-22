/**
 * Generates the editorial "art plate" SVGs used for products without
 * photography — one shared template (warm wash, arch, frame, grain) plus a
 * hand-drawn illustration per product. Run with: node scripts/gen-plates.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const OUT = join(new URL('..', import.meta.url).pathname, 'public', 'products')
mkdirSync(OUT, { recursive: true })

/* ── illustrations (drawn inside the 800×1000 canvas) ─────────────── */

const ART = {
  'silk-chiffon-dupatta': `
    <path d="M232 620 C 322 540 302 462 402 442 C 522 417 562 522 522 682" stroke="#BF5B2D" stroke-width="56" fill="none" stroke-linecap="round"/>
    <path d="M272 668 C 352 594 342 520 432 500 C 547 476 582 570 548 712" stroke="#D9A982" stroke-width="44" fill="none" stroke-linecap="round" opacity="0.92"/>
    <path d="M252 660 l-8 44 M276 672 l-4 44 M300 678 l0 44 M545 700 l8 40 M566 692 l10 40" stroke="#A34A22" stroke-width="5" stroke-linecap="round"/>
  `,
  'velvet-winter-shawl': `
    <rect x="270" y="462" width="240" height="66" rx="14" fill="#8E4A3B"/>
    <rect x="255" y="512" width="290" height="158" rx="16" fill="#7C3040"/>
    <path d="M255 556 H545 M255 606 H545" stroke="#5E2530" stroke-width="6"/>
    <path d="M262 670 v38 M284 670 v42 M306 670 v38 M328 670 v44 M350 670 v38 M372 670 v42 M394 670 v38 M416 670 v44 M438 670 v38 M460 670 v42 M482 670 v38 M504 670 v44 M526 670 v38" stroke="#5E2530" stroke-width="5" stroke-linecap="round"/>
    <path d="M288 494 h204" stroke="#A9685A" stroke-width="5" stroke-linecap="round" opacity="0.7"/>
  `,
  'denim-trucker-jacket': `
    <path d="M305 405 Q345 368 400 364 Q455 368 495 405 L548 452 L518 596 L482 584 L486 690 Q484 706 466 708 L334 708 Q316 706 314 690 L318 584 L282 596 L252 452 Z" fill="#474141"/>
    <path d="M378 364 L400 398 L422 364 L434 380 L400 428 L366 380 Z" fill="#353031"/>
    <path d="M400 428 L400 664" stroke="#2B2728" stroke-width="5"/>
    <circle cx="400" cy="456" r="4" fill="#D9A982"/><circle cx="400" cy="512" r="4" fill="#D9A982"/><circle cx="400" cy="568" r="4" fill="#D9A982"/><circle cx="400" cy="624" r="4" fill="#D9A982"/>
    <rect x="336" y="478" width="48" height="54" rx="5" fill="none" stroke="#D9A982" stroke-opacity="0.65" stroke-width="2.5"/>
    <rect x="416" y="478" width="48" height="54" rx="5" fill="none" stroke="#D9A982" stroke-opacity="0.65" stroke-width="2.5"/>
    <rect x="314" y="668" width="172" height="18" rx="8" fill="#353031"/>
    <path d="M300 428 L286 590 M500 428 L514 590" stroke="#353031" stroke-width="3" opacity="0.6"/>
  `,
  'pleated-chiffon-hijab': `
    <path d="M265 545 a135 160 0 0 1 270 0 Z" fill="#F4E8D4"/>
    <path d="M292 545 a108 132 0 0 1 216 0 Z" fill="#E8D5B8"/>
    <path d="M320 545 a82 108 0 0 1 164 0 Z" fill="#F7EFE2"/>
    <ellipse cx="400" cy="452" rx="54" ry="70" fill="#3B332B"/>
    <path d="M400 385 V500 M364 394 L394 522 M436 394 L406 522" stroke="#D9A982" stroke-width="4" opacity="0.85"/>
    <path d="M300 540 q100 62 200 0 l-10 78 q-90 46 -180 0 Z" fill="#EFE3CE"/>
    <path d="M314 588 q86 44 172 0" stroke="#D9A982" stroke-width="4" fill="none" opacity="0.7"/>
  `,
  'leather-card-wallet': `
    <rect x="330" y="430" width="118" height="64" rx="9" fill="#E7D5B6"/>
    <rect x="300" y="446" width="118" height="64" rx="9" fill="#F4E8D4"/>
    <rect x="250" y="470" width="300" height="210" rx="22" fill="#7A5433"/>
    <rect x="266" y="486" width="268" height="178" rx="15" fill="none" stroke="#E8C9A6" stroke-width="3" stroke-dasharray="2 10"/>
    <path d="M400 470 V680" stroke="#5E3D24" stroke-width="5"/>
    <rect x="286" y="520" width="88" height="58" rx="9" fill="#8A5F3A"/>
    <circle cx="472" cy="606" r="11" fill="#D9A982"/>
  `,
  'canvas-tote-bag': `
    <path d="M340 474 C 340 384 460 384 460 474" stroke="#A9744F" stroke-width="15" fill="none" stroke-linecap="round"/>
    <path d="M275 474 L525 474 L505 722 Q503 738 486 738 L314 738 Q297 738 295 722 Z" fill="#E9DCC4"/>
    <path d="M294 502 L288 700 M506 502 L512 700" stroke="#C9AE87" stroke-width="3"/>
    <circle cx="400" cy="578" r="34" fill="#BF5B2D"/>
    <ellipse cx="400" cy="571" rx="4" ry="9" fill="#F3EBDD"/><ellipse cx="400" cy="571" rx="4" ry="9" fill="#F3EBDD" transform="rotate(45 400 578)"/><ellipse cx="400" cy="571" rx="4" ry="9" fill="#F3EBDD" transform="rotate(90 400 578)"/><ellipse cx="400" cy="571" rx="4" ry="9" fill="#F3EBDD" transform="rotate(135 400 578)"/>
    <rect x="468" y="646" width="36" height="48" rx="7" fill="#BF5B2D"/>
    <circle cx="486" cy="656" r="4" fill="#F3EBDD"/>
  `,
  'minimal-steel-watch': `
    <rect x="362" y="330" width="76" height="150" rx="26" fill="#5A4130"/>
    <rect x="362" y="612" width="76" height="158" rx="26" fill="#5A4130"/>
    <path d="M374 342 V468 M426 342 V468 M374 622 V758 M426 622 V758" stroke="#C9AE87" stroke-width="3" stroke-dasharray="2 10"/>
    <circle cx="400" cy="546" r="104" fill="#2C241D"/>
    <circle cx="400" cy="546" r="86" fill="#F4E8D4"/>
    <path d="M400 474 v15 M400 603 v15 M330 546 h15 M455 546 h15" stroke="#3B332B" stroke-width="5" stroke-linecap="round"/>
    <circle cx="352" cy="497" r="3.4" fill="#8A7A66"/><circle cx="448" cy="497" r="3.4" fill="#8A7A66"/><circle cx="352" cy="595" r="3.4" fill="#8A7A66"/><circle cx="448" cy="595" r="3.4" fill="#8A7A66"/>
    <path d="M400 546 L400 500" stroke="#3B332B" stroke-width="7" stroke-linecap="round"/>
    <path d="M400 546 L442 566" stroke="#3B332B" stroke-width="6" stroke-linecap="round"/>
    <circle cx="400" cy="546" r="7" fill="#BF5B2D"/>
    <rect x="502" y="537" width="15" height="18" rx="4" fill="#2C241D"/>
  `,
  'suede-penny-loafers': `
    <path d="M242 622 L300 622 C 320 562 372 522 432 518 C 502 514 560 542 585 592 L592 622 Z" fill="#8A5F3A"/>
    <path d="M398 522 C 420 556 426 586 422 620" stroke="#6E4527" stroke-width="5" fill="none"/>
    <rect x="366" y="530" width="92" height="26" rx="13" fill="#6E4527"/>
    <rect x="400" y="536" width="22" height="14" rx="4" fill="#E9DCC4"/>
    <path d="M234 622 L598 622 L598 654 Q598 668 584 668 L248 668 Q234 668 234 654 Z" fill="#3B332B"/>
    <rect x="516" y="648" width="78" height="32" rx="6" fill="#2C241D"/>
    <path d="M258 634 H500" stroke="#5A5348" stroke-width="3" opacity="0.8"/>
  `,
  'court-sneakers': `
    <path d="M258 634 C 262 562 322 530 374 542 C 422 552 448 592 470 602 C 520 618 566 618 594 634 Z" fill="#D9A982"/>
    <path d="M258 634 C 262 592 280 562 306 550 L332 562 C 308 578 296 606 296 634 Z" fill="#C8855A"/>
    <path d="M352 562 l42 24 M396 562 l-44 24 M364 590 l42 24 M408 590 l-44 24" stroke="#3B332B" stroke-width="4.5" stroke-linecap="round"/>
    <rect x="562" y="598" width="18" height="38" rx="7" fill="#BF5B2D"/>
    <path d="M238 634 L598 634 L600 662 Q598 678 582 678 L252 678 Q238 678 238 662 Z" fill="#F4E8D4"/>
    <path d="M242 650 H594" stroke="#D9C3A3" stroke-width="5"/>
  `,
  'brass-pen-set': `
    <g transform="rotate(-16 400 560)">
      <rect x="280" y="546" width="230" height="26" rx="13" fill="#2C241D"/>
      <path d="M280 546 L250 559 L280 572 Z" fill="#C9A962"/>
      <path d="M462 546 h30" stroke="#C9A962" stroke-width="6" stroke-linecap="round"/>
    </g>
    <g transform="rotate(-16 392 616)">
      <rect x="288" y="604" width="212" height="22" rx="11" fill="#A9744F"/>
      <path d="M288 604 L262 615 L288 626 Z" fill="#C9A962"/>
      <path d="M452 604 h26" stroke="#C9A962" stroke-width="5" stroke-linecap="round"/>
    </g>
    <circle cx="252" cy="668" r="5" fill="#3B332B"/><circle cx="270" cy="682" r="3.4" fill="#3B332B"/><circle cx="240" cy="684" r="2.6" fill="#3B332B"/>
  `,
  'desk-organizer-tray': `
    <rect x="300" y="502" width="15" height="100" rx="7.5" fill="#BF5B2D" transform="rotate(-6 307 552)"/>
    <rect x="328" y="506" width="14" height="96" rx="7" fill="#C9A962" transform="rotate(5 335 554)"/>
    <rect x="384" y="508" width="50" height="50" rx="5" fill="#E8B98A" transform="rotate(-8 409 533)"/>
    <rect x="452" y="640" width="70" height="10" rx="4" fill="#F4E8D4"/>
    <rect x="452" y="655" width="70" height="10" rx="4" fill="#E7D5B6"/>
    <rect x="452" y="670" width="70" height="10" rx="4" fill="#F4E8D4"/>
    <path d="M255 570 L545 570 L528 706 Q526 720 512 720 L288 720 Q274 720 272 706 Z" fill="#C08A5B"/>
    <path d="M255 570 H545" stroke="#8A5F3A" stroke-width="8"/>
    <path d="M368 570 L376 714 M442 570 L436 714" stroke="#8A5F3A" stroke-width="6"/>
    <path d="M255 570 L545 570 L540 596 L260 596 Z" fill="#8A5F3A" opacity="0.18"/>
  `,
  'rose-face-mist': `
    <g fill="#D9A982">
      <circle cx="330" cy="420" r="4.4"/><circle cx="310" cy="410" r="3.6"/><circle cx="292" cy="398" r="3"/><circle cx="314" cy="434" r="3.2"/><circle cx="292" cy="426" r="2.6"/><circle cx="336" cy="404" r="2.8"/>
    </g>
    <rect x="368" y="410" width="18" height="30" rx="4" fill="#8C4423"/>
    <rect x="368" y="408" width="64" height="32" rx="9" fill="#BF5B2D"/>
    <rect x="378" y="438" width="44" height="32" rx="6" fill="#3B332B"/>
    <rect x="340" y="470" width="120" height="246" rx="24" fill="#EFE3CE"/>
    <rect x="356" y="566" width="88" height="134" rx="16" fill="#E5A88A" opacity="0.85"/>
    <rect x="364" y="510" width="72" height="42" rx="7" fill="#F7EFE2"/>
    <circle cx="400" cy="531" r="10" fill="#C05B2C"/>
    <path d="M380 545 h40" stroke="#C9AE87" stroke-width="3" stroke-linecap="round"/>
  `,
  'scented-soy-candle': `
    <circle cx="400" cy="428" r="30" fill="#F0A56D" opacity="0.35"/>
    <path d="M400 448 c11 -13 7 -28 0 -37 c-7 9 -11 24 0 37" fill="#D97742"/>
    <path d="M400 443 c6 -8 3 -17 0 -22 c-3 5 -6 14 0 22" fill="#F4D9A0"/>
    <path d="M400 452 v20" stroke="#3B332B" stroke-width="4" stroke-linecap="round"/>
    <path d="M318 480 L482 480 L482 692 Q482 718 456 718 L344 718 Q318 718 318 692 Z" fill="#F4E8D4"/>
    <ellipse cx="400" cy="480" rx="82" ry="13" fill="#E7D5B6"/>
    <rect x="348" y="560" width="104" height="66" rx="8" fill="#EFE3CE"/>
    <circle cx="400" cy="588" r="12" fill="#BF5B2D"/>
    <path d="M372 612 h56" stroke="#C9AE87" stroke-width="4" stroke-linecap="round"/>
    <path d="M332 520 h136" stroke="#E7D5B6" stroke-width="3" opacity="0.7"/>
  `,
}

const META = {
  'silk-chiffon-dupatta': ['13', 'SILK CHIFFON DUPATTA'],
  'velvet-winter-shawl': ['14', 'VELVET WINTER SHAWL'],
  'denim-trucker-jacket': ['15', 'DENIM TRUCKER JACKET'],
  'pleated-chiffon-hijab': ['16', 'PLEATED CHIFFON HIJAB'],
  'leather-card-wallet': ['17', 'LEATHER CARD WALLET'],
  'canvas-tote-bag': ['18', 'CANVAS TOTE BAG'],
  'minimal-steel-watch': ['19', 'MINIMAL STEEL WATCH'],
  'suede-penny-loafers': ['20', 'SUEDE PENNY LOAFERS'],
  'court-sneakers': ['21', 'COURT SNEAKERS'],
  'brass-pen-set': ['22', 'BRASS PEN SET'],
  'desk-organizer-tray': ['23', 'DESK ORGANIZER TRAY'],
  'rose-face-mist': ['24', 'ROSE FACE MIST'],
  'scented-soy-candle': ['25', 'SCENTED SOY CANDLE'],
}

const TEMPLATE = (art, num, name) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000">
  <defs>
    <filter id="soft" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="14"/>
    </filter>
  </defs>

  <rect width="800" height="1000" fill="#F6ECDC"/>
  <ellipse cx="400" cy="330" rx="330" ry="290" fill="#FFFFFF" opacity="0.28"/>

  <path d="M400 170 C 565 170 646 296 646 460 L646 1000 L154 1000 L154 460 C154 296 235 170 400 170 Z" fill="#BF5B2D" opacity="0.07"/>
  <path d="M400 205 C 545 205 614 316 614 460" fill="none" stroke="#BF5B2D" stroke-opacity="0.22" stroke-width="1.5"/>

  <ellipse cx="400" cy="800" rx="180" ry="20" fill="#33291F" opacity="0.16" filter="url(#soft)"/>

  ${art}

  <rect x="30" y="30" width="740" height="940" fill="none" stroke="#C9B28E" stroke-width="1.5"/>
  <path d="M30 70 L30 30 L70 30 M730 30 L770 30 L770 70 M770 930 L770 970 L730 970 M70 970 L30 970 L30 930" fill="none" stroke="#BF5B2D" stroke-width="2.5"/>

  <text x="400" y="928" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="19" letter-spacing="7" fill="#8A7A66">RETAILFLOW &#183; DEMO CATALOG</text>
  <text x="64" y="76" font-family="Georgia, serif" font-size="15" letter-spacing="4" fill="#A3927A">N&#186; ${num}</text>
  <text x="736" y="76" text-anchor="end" font-family="Georgia, serif" font-size="15" letter-spacing="3" fill="#A3927A">${name}</text>
</svg>
`

let count = 0
for (const [slug, art] of Object.entries(ART)) {
  const [num, name] = META[slug]
  writeFileSync(join(OUT, `${slug}.svg`), TEMPLATE(art, num, name))
  count++
}
console.log(`generated ${count} art plates → public/products/`)
