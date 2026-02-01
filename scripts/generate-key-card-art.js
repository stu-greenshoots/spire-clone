#!/usr/bin/env node

/**
 * GD-29: Key Card Art Re-render
 *
 * Re-renders 5 highest-visibility cards with improved detail and quality:
 * - Strike (Ironclad) - most-played card in the game
 * - Defend (Ironclad) - second most-played card
 * - Bash (Ironclad) - signature starter card
 * - Neutralize (Silent) - Silent starter attack
 * - Zap (Defect) - Defect starter card
 *
 * These are the cards every player sees in their first hand, every run.
 * Higher detail SVG paths, richer layering, and more atmospheric effects.
 *
 * Usage: node scripts/generate-key-card-art.js
 * Requires: sharp (devDependency)
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SIZE = 512;

const CARDS = [
  {
    id: 'strike',
    title: 'Strike',
    color1: '#4a1a1a',
    color2: '#1a0808',
    accent: '#ff6644',
    glowColor: '#cc4422',
    // Ironclad signature — heavy sword slash with fire trail
    parts: [
      // Sword blade — large, dominant
      '<path d="M 160 80 L 340 280 L 328 292 L 148 92 Z" fill="#ccccdd" opacity="0.75" />',
      '<path d="M 165 88 L 335 274 L 335 286 L 160 96 Z" fill="#eeeeff" opacity="0.35" />',
      // Blade edge highlight
      '<path d="M 162 84 L 338 278" stroke="#ffffff" stroke-width="1.5" opacity="0.3" />',
      // Crossguard
      '<rect x="135" y="85" width="50" height="8" rx="3" fill="#8a4a2a" opacity="0.8" transform="rotate(-45, 160, 89)" />',
      '<rect x="137" y="87" width="46" height="4" rx="2" fill="#aa6a4a" opacity="0.5" transform="rotate(-45, 160, 89)" />',
      // Grip
      '<path d="M 148 92 L 120 120" stroke="#5a3a2a" stroke-width="10" stroke-linecap="round" opacity="0.8" />',
      '<path d="M 148 92 L 122 118" stroke="#6a4a3a" stroke-width="6" stroke-linecap="round" opacity="0.5" />',
      // Pommel
      '<circle cx="116" cy="124" r="7" fill="#8a4a2a" opacity="0.8" />',
      '<circle cx="114" cy="122" r="3" fill="#aa6a4a" opacity="0.6" />',
      // Fire trail along slash arc
      '<path d="M 130 60 Q 200 140 360 300" stroke="#ff6644" stroke-width="8" fill="none" opacity="0.15" />',
      '<path d="M 140 70 Q 210 150 350 290" stroke="#ff8844" stroke-width="5" fill="none" opacity="0.2" />',
      '<path d="M 150 80 Q 220 160 340 280" stroke="#ffaa66" stroke-width="3" fill="none" opacity="0.25" />',
      // Sparks at impact point
      '<circle cx="340" cy="285" r="15" fill="#ff6644" opacity="0.15" />',
      '<circle cx="345" cy="290" r="8" fill="#ffaa66" opacity="0.2" />',
      '<circle cx="350" cy="300" r="4" fill="#ff6644" opacity="0.3" />',
      '<circle cx="330" cy="295" r="3" fill="#ffcc88" opacity="0.35" />',
      '<circle cx="355" cy="280" r="3" fill="#ff8844" opacity="0.25" />',
      // Motion lines
      '<path d="M 170 100 L 140 70" stroke="#ff6644" stroke-width="2" opacity="0.15" stroke-linecap="round" />',
      '<path d="M 200 140 L 175 110" stroke="#ff6644" stroke-width="2" opacity="0.12" stroke-linecap="round" />',
      '<path d="M 260 200 L 240 175" stroke="#ff6644" stroke-width="2" opacity="0.1" stroke-linecap="round" />',
      // Ember particles
      '<circle cx="180" cy="130" r="2" fill="#ffaa66" opacity="0.4" />',
      '<circle cx="220" cy="160" r="1.5" fill="#ff8844" opacity="0.35" />',
      '<circle cx="300" cy="250" r="2" fill="#ffaa66" opacity="0.3" />',
      '<circle cx="150" cy="100" r="1.5" fill="#ffcc88" opacity="0.4" />'
    ]
  },
  {
    id: 'defend',
    title: 'Defend',
    color1: '#2a2a4a',
    color2: '#0a0a1a',
    accent: '#ff6644',
    glowColor: '#884422',
    // Ironclad — raised shield with defensive aura
    parts: [
      // Shield body — large kite shield
      '<path d="M 256 130 L 320 180 L 320 280 L 256 340 L 192 280 L 192 180 Z" fill="#4a3a2a" opacity="0.85" />',
      '<path d="M 256 140 L 312 186 L 312 274 L 256 330 L 200 274 L 200 186 Z" fill="#5a4a3a" opacity="0.7" />',
      '<path d="M 256 150 L 304 192 L 304 268 L 256 320 L 208 268 L 208 192 Z" fill="#6a5a4a" opacity="0.5" />',
      // Shield boss (center circle)
      '<circle cx="256" cy="240" r="30" fill="#4a3a2a" opacity="0.8" />',
      '<circle cx="256" cy="240" r="22" fill="#5a4a3a" opacity="0.6" />',
      '<circle cx="256" cy="240" r="14" fill="#ff6644" opacity="0.3" />',
      '<circle cx="256" cy="240" r="8" fill="#ffaa66" opacity="0.2" />',
      // Shield rivets
      '<circle cx="256" cy="160" r="4" fill="#8a6a4a" opacity="0.6" />',
      '<circle cx="256" cy="320" r="4" fill="#8a6a4a" opacity="0.6" />',
      '<circle cx="200" cy="210" r="4" fill="#8a6a4a" opacity="0.6" />',
      '<circle cx="312" cy="210" r="4" fill="#8a6a4a" opacity="0.6" />',
      '<circle cx="200" cy="270" r="4" fill="#8a6a4a" opacity="0.6" />',
      '<circle cx="312" cy="270" r="4" fill="#8a6a4a" opacity="0.6" />',
      // Shield edge highlight
      '<path d="M 256 130 L 320 180 L 320 280 L 256 340 L 192 280 L 192 180 Z" stroke="#8a7a6a" stroke-width="2" fill="none" opacity="0.4" />',
      // Defensive aura rings
      '<path d="M 256 130 L 320 180 L 320 280 L 256 340 L 192 280 L 192 180 Z" stroke="#ff6644" stroke-width="3" fill="none" opacity="0.1" transform="scale(1.15) translate(-19.2, -28.8)" />',
      '<path d="M 256 130 L 320 180 L 320 280 L 256 340 L 192 280 L 192 180 Z" stroke="#ff6644" stroke-width="2" fill="none" opacity="0.07" transform="scale(1.3) translate(-38.4, -57.6)" />',
      // Block value glow
      '<ellipse cx="256" cy="240" rx="50" ry="60" fill="#4488cc" opacity="0.06" />',
      // Light reflection on shield
      '<ellipse cx="240" cy="200" rx="20" ry="30" fill="#ffffff" opacity="0.05" />'
    ]
  },
  {
    id: 'bash',
    title: 'Bash',
    color1: '#4a1a1a',
    color2: '#1a0808',
    accent: '#ff6644',
    glowColor: '#cc4422',
    // Ironclad signature — massive fist/mace impact with vulnerable crack
    parts: [
      // Mace head
      '<ellipse cx="280" cy="180" rx="55" ry="50" fill="#5a3a2a" opacity="0.85" />',
      '<ellipse cx="278" cy="178" rx="45" ry="42" fill="#6a4a3a" opacity="0.7" />',
      // Mace spikes
      '<path d="M 280 128 L 290 145 L 270 145 Z" fill="#8a6a4a" opacity="0.7" />',
      '<path d="M 336 175 L 320 185 L 320 165 Z" fill="#8a6a4a" opacity="0.7" />',
      '<path d="M 280 232 L 290 215 L 270 215 Z" fill="#8a6a4a" opacity="0.7" />',
      '<path d="M 224 175 L 240 185 L 240 165 Z" fill="#8a6a4a" opacity="0.7" />',
      // Mace handle
      '<path d="M 256 210 L 200 320" stroke="#5a3a2a" stroke-width="12" stroke-linecap="round" opacity="0.8" />',
      '<path d="M 254 212 L 198 318" stroke="#6a4a3a" stroke-width="7" stroke-linecap="round" opacity="0.5" />',
      // Impact shockwave
      '<circle cx="280" cy="180" r="70" stroke="#ff6644" stroke-width="4" fill="none" opacity="0.2" />',
      '<circle cx="280" cy="180" r="95" stroke="#ff6644" stroke-width="3" fill="none" opacity="0.12" />',
      '<circle cx="280" cy="180" r="120" stroke="#ff6644" stroke-width="2" fill="none" opacity="0.07" />',
      // Vulnerable cracks radiating from impact
      '<path d="M 280 180 L 350 120 L 360 130" stroke="#ff6644" stroke-width="2" fill="none" opacity="0.3" />',
      '<path d="M 280 180 L 370 200 L 380 190" stroke="#ff6644" stroke-width="2" fill="none" opacity="0.25" />',
      '<path d="M 280 180 L 340 260 L 350 250" stroke="#ff6644" stroke-width="2" fill="none" opacity="0.25" />',
      '<path d="M 280 180 L 200 100 L 190 110" stroke="#ff6644" stroke-width="2" fill="none" opacity="0.2" />',
      '<path d="M 280 180 L 220 260 L 210 255" stroke="#ff6644" stroke-width="2" fill="none" opacity="0.2" />',
      // Debris particles
      '<rect x="340" y="140" width="6" height="6" fill="#8a6a4a" opacity="0.4" transform="rotate(30, 343, 143)" />',
      '<rect x="320" y="120" width="4" height="4" fill="#8a6a4a" opacity="0.3" transform="rotate(45, 322, 122)" />',
      '<rect x="350" y="200" width="5" height="5" fill="#8a6a4a" opacity="0.35" transform="rotate(15, 353, 203)" />',
      '<rect x="200" y="130" width="4" height="4" fill="#8a6a4a" opacity="0.3" transform="rotate(60, 202, 132)" />',
      // Vulnerable status icon
      '<circle cx="370" cy="300" r="16" stroke="#ff6644" stroke-width="2" fill="none" opacity="0.2" />',
      '<path d="M 362 295 L 370 310 L 378 295" stroke="#ff6644" stroke-width="2" fill="none" opacity="0.25" />'
    ]
  },
  {
    id: 'neutralize',
    title: 'Neutralize',
    color1: '#1a3a1a',
    color2: '#0a1508',
    accent: '#66dd44',
    glowColor: '#44aa22',
    // Silent starter — improved: twin daggers crossing with poison drip
    parts: [
      // Left dagger blade
      '<path d="M 180 120 L 280 240 L 270 252 L 170 132 Z" fill="#ccccdd" opacity="0.7" />',
      '<path d="M 184 126 L 276 236 L 276 248 L 178 130 Z" fill="#eeeeff" opacity="0.3" />',
      // Left dagger handle
      '<path d="M 170 128 L 150 148" stroke="#2a5a2a" stroke-width="9" stroke-linecap="round" opacity="0.8" />',
      '<rect x="155" y="122" width="28" height="6" rx="2" fill="#3a6a3a" opacity="0.7" transform="rotate(-45, 169, 125)" />',
      // Right dagger blade (crossing)
      '<path d="M 332 120 L 232 240 L 242 252 L 342 132 Z" fill="#ccccdd" opacity="0.7" />',
      '<path d="M 328 126 L 236 236 L 236 248 L 334 130 Z" fill="#eeeeff" opacity="0.3" />',
      // Right dagger handle
      '<path d="M 342 128 L 362 148" stroke="#2a5a2a" stroke-width="9" stroke-linecap="round" opacity="0.8" />',
      '<rect x="329" y="122" width="28" height="6" rx="2" fill="#3a6a3a" opacity="0.7" transform="rotate(45, 343, 125)" />',
      // Poison dripping from blade intersection
      '<ellipse cx="256" cy="246" rx="8" ry="12" fill="#66dd44" opacity="0.5" />',
      '<ellipse cx="256" cy="260" rx="5" ry="8" fill="#88ff66" opacity="0.4" />',
      '<ellipse cx="256" cy="275" rx="3" ry="5" fill="#66dd44" opacity="0.3" />',
      '<ellipse cx="256" cy="288" rx="2" ry="3" fill="#66dd44" opacity="0.2" />',
      // Poison splash at bottom
      '<ellipse cx="256" cy="310" rx="25" ry="8" fill="#66dd44" opacity="0.15" />',
      '<ellipse cx="248" cy="308" rx="4" ry="3" fill="#88ff66" opacity="0.2" />',
      '<ellipse cx="265" cy="312" rx="3" ry="2" fill="#88ff66" opacity="0.2" />',
      // Weak debuff aura
      '<circle cx="256" cy="240" r="70" stroke="#66dd44" stroke-width="2" fill="none" opacity="0.1" stroke-dasharray="6,4" />',
      '<circle cx="256" cy="240" r="90" stroke="#66dd44" stroke-width="1.5" fill="none" opacity="0.06" stroke-dasharray="4,6" />',
      // Strike motion arcs
      '<path d="M 160 100 Q 220 170 290 250" stroke="#66dd44" stroke-width="3" fill="none" opacity="0.12" />',
      '<path d="M 352 100 Q 292 170 222 250" stroke="#66dd44" stroke-width="3" fill="none" opacity="0.12" />',
      // Poison mist particles
      '<circle cx="230" cy="260" r="2" fill="#88ff66" opacity="0.3" />',
      '<circle cx="280" cy="255" r="1.5" fill="#88ff66" opacity="0.25" />',
      '<circle cx="240" cy="285" r="2" fill="#66dd44" opacity="0.2" />',
      '<circle cx="272" cy="280" r="1.5" fill="#66dd44" opacity="0.2" />'
    ]
  },
  {
    id: 'zap',
    title: 'Zap',
    color1: '#1a2a4a',
    color2: '#080818',
    accent: '#4488ff',
    glowColor: '#3366dd',
    // Defect starter — improved: orb channeling with lightning arc
    parts: [
      // Central orb
      '<circle cx="256" cy="220" r="55" fill="#1a2a4a" opacity="0.9" />',
      '<circle cx="256" cy="220" r="45" fill="#2a4a6a" opacity="0.7" />',
      '<circle cx="256" cy="220" r="35" fill="#3a5a8a" opacity="0.6" />',
      '<circle cx="256" cy="220" r="25" fill="#4488ff" opacity="0.5" />',
      '<circle cx="250" cy="214" r="12" fill="#6699ff" opacity="0.6" />',
      '<circle cx="247" cy="210" r="6" fill="#88bbff" opacity="0.7" />',
      // Orb energy ring
      '<circle cx="256" cy="220" r="58" stroke="#4488ff" stroke-width="2" fill="none" opacity="0.3" />',
      '<circle cx="256" cy="220" r="62" stroke="#4488ff" stroke-width="1" fill="none" opacity="0.15" stroke-dasharray="8,4" />',
      // Lightning bolt from orb — upward
      '<path d="M 270 165 L 250 130 L 268 135 L 255 95" stroke="#4488ff" stroke-width="4" fill="none" opacity="0.6" stroke-linejoin="round" />',
      '<path d="M 270 165 L 252 134 L 266 138 L 255 100" stroke="#88bbff" stroke-width="2" fill="none" opacity="0.4" stroke-linejoin="round" />',
      // Lightning bolt from orb — downward
      '<path d="M 242 275 L 262 310 L 244 305 L 257 345" stroke="#4488ff" stroke-width="4" fill="none" opacity="0.6" stroke-linejoin="round" />',
      '<path d="M 242 275 L 260 306 L 246 302 L 257 340" stroke="#88bbff" stroke-width="2" fill="none" opacity="0.4" stroke-linejoin="round" />',
      // Branching sparks
      '<path d="M 250 130 L 230 115" stroke="#4488ff" stroke-width="2" fill="none" opacity="0.3" />',
      '<path d="M 262 310 L 280 325" stroke="#4488ff" stroke-width="2" fill="none" opacity="0.3" />',
      '<path d="M 255 95 L 270 80" stroke="#4488ff" stroke-width="2" fill="none" opacity="0.25" />',
      '<path d="M 257 345 L 242 360" stroke="#4488ff" stroke-width="2" fill="none" opacity="0.25" />',
      // Electric sparks around orb
      '<circle cx="310" cy="210" r="4" fill="#88ccff" opacity="0.5" />',
      '<circle cx="200" cy="230" r="3" fill="#88ccff" opacity="0.4" />',
      '<circle cx="280" cy="165" r="3" fill="#88ccff" opacity="0.45" />',
      '<circle cx="230" cy="275" r="3" fill="#88ccff" opacity="0.4" />',
      '<circle cx="300" cy="260" r="2.5" fill="#88ccff" opacity="0.35" />',
      '<circle cx="215" cy="180" r="2.5" fill="#88ccff" opacity="0.35" />',
      // Ambient glow
      '<circle cx="256" cy="220" r="90" fill="#4488ff" opacity="0.04" />',
      // Channel slot indicator (Defect mechanic)
      '<rect x="230" y="370" width="52" height="8" rx="4" fill="#2a4a6a" opacity="0.3" />',
      '<rect x="232" y="372" width="16" height="4" rx="2" fill="#4488ff" opacity="0.4" />'
    ]
  }
];

async function main() {
  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch {
    console.error('ERROR: sharp not installed. Run: npm install');
    process.exit(1);
  }

  const cardOutDir = path.join(__dirname, '..', 'src', 'assets', 'art', 'cards');
  console.log(`Generating ${CARDS.length} improved key card art images...`);

  for (const card of CARDS) {
    const partsStr = card.parts.map(p => `    <g transform="translate(256, 256)">${p}</g>`).join('\n');

    const svg = `<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="${card.color1}" />
      <stop offset="100%" stop-color="${card.color2}" />
    </radialGradient>
    <radialGradient id="glow" cx="50%" cy="40%" r="40%">
      <stop offset="0%" stop-color="${card.glowColor}" stop-opacity="0.25" />
      <stop offset="100%" stop-color="${card.glowColor}" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="vignette" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="black" stop-opacity="0.15" />
      <stop offset="25%" stop-color="black" stop-opacity="0" />
      <stop offset="75%" stop-color="black" stop-opacity="0" />
      <stop offset="100%" stop-color="black" stop-opacity="0.35" />
    </linearGradient>
    <radialGradient id="centerGlow" cx="50%" cy="45%" r="35%">
      <stop offset="0%" stop-color="${card.accent}" stop-opacity="0.12" />
      <stop offset="100%" stop-color="${card.accent}" stop-opacity="0" />
    </radialGradient>
  </defs>
  <!-- Background -->
  <rect width="${SIZE}" height="${SIZE}" fill="url(#bg)" />
  <rect width="${SIZE}" height="${SIZE}" fill="url(#glow)" />
  <rect width="${SIZE}" height="${SIZE}" fill="url(#centerGlow)" />
  <!-- Card illustration -->
${partsStr}
  <!-- Atmosphere -->
  <rect width="${SIZE}" height="${SIZE}" fill="url(#vignette)" />
  <!-- Title -->
  <text x="256" y="460" text-anchor="middle" font-family="serif" font-size="26" font-weight="bold" fill="${card.accent}" opacity="0.65">${escapeXml(card.title)}</text>
</svg>`;

    const outPath = path.join(cardOutDir, `${card.id}.webp`);
    await sharp(Buffer.from(svg))
      .webp({ quality: 85 })
      .toFile(outPath);

    console.log(`  Card: ${card.id}.webp`);
  }

  console.log(`\nDone! Generated ${CARDS.length} improved key card images.`);
  console.log('Output: src/assets/art/cards/');
  console.log('\nNext steps:');
  console.log('  1. node scripts/generate-sprite-sheets.js --type=cards');
  console.log('  2. npm run validate');
}

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

main().catch(err => { console.error(err); process.exit(1); });
