#!/usr/bin/env node

/**
 * GD-24: Card Art Quality Pass
 *
 * Generates improved card art for the 10 most-visible Ironclad cards.
 * Replaces simple gradient+text placeholders with detailed SVG silhouettes
 * and atmospheric effects, following the pattern from generate-polish-sprites.js.
 *
 * Targets: strike, defend, bash, anger, cleave, ironWave, pommelStrike,
 *          shrugItOff, bodySlam, clothesline
 *
 * Usage: node scripts/generate-quality-card-art.js
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
    glowColor: '#cc3322',
    // Downward sword slash
    parts: [
      // Slash trail
      '<path d="M 140 80 Q 256 180 380 320" stroke="#ff6644" stroke-width="6" fill="none" opacity="0.3" />',
      '<path d="M 150 90 Q 256 190 370 310" stroke="#ff8866" stroke-width="3" fill="none" opacity="0.5" />',
      // Sword blade
      '<path d="M 180 100 L 340 290 L 330 300 L 170 110 Z" fill="#ccccdd" opacity="0.7" />',
      '<path d="M 185 105 L 335 285 L 335 295 L 180 108 Z" fill="#eeeeff" opacity="0.3" />',
      // Guard
      '<rect x="160" y="95" width="50" height="8" rx="3" fill="#8a6a2a" opacity="0.8" transform="rotate(-50, 185, 99)" />',
      // Handle
      '<path d="M 168 108 L 148 130" stroke="#5a3a1a" stroke-width="8" stroke-linecap="round" opacity="0.8" />',
      // Impact sparks
      '<circle cx="350" cy="300" r="15" fill="#ff6644" opacity="0.2" />',
      '<circle cx="355" cy="305" r="8" fill="#ffaa66" opacity="0.3" />',
      '<path d="M 340 290 L 360 280" stroke="#ffcc88" stroke-width="2" opacity="0.4" />',
      '<path d="M 340 290 L 370 300" stroke="#ffcc88" stroke-width="2" opacity="0.4" />',
      '<path d="M 340 290 L 350 320" stroke="#ffcc88" stroke-width="2" opacity="0.4" />'
    ]
  },
  {
    id: 'defend',
    title: 'Defend',
    color1: '#1a2a4a',
    color2: '#080818',
    accent: '#4488cc',
    glowColor: '#3366aa',
    // Shield with protective aura
    parts: [
      // Shield body
      '<path d="M 256 140 L 320 180 L 320 280 L 256 340 L 192 280 L 192 180 Z" fill="#3a5a8a" opacity="0.8" />',
      '<path d="M 256 150 L 310 185 L 310 275 L 256 330 L 202 275 L 202 185 Z" fill="#4a6a9a" opacity="0.6" />',
      // Shield emblem (cross)
      '<rect x="248" y="190" width="16" height="100" rx="3" fill="#6688bb" opacity="0.5" />',
      '<rect x="220" y="225" width="72" height="16" rx="3" fill="#6688bb" opacity="0.5" />',
      // Shield rim highlight
      '<path d="M 256 140 L 320 180 L 320 280 L 256 340" stroke="#88bbee" stroke-width="2" fill="none" opacity="0.4" />',
      // Protective aura rings
      '<ellipse cx="256" cy="240" rx="100" ry="120" stroke="#4488cc" stroke-width="2" fill="none" opacity="0.15" />',
      '<ellipse cx="256" cy="240" rx="120" ry="140" stroke="#4488cc" stroke-width="1.5" fill="none" opacity="0.1" />',
      '<ellipse cx="256" cy="240" rx="140" ry="160" stroke="#4488cc" stroke-width="1" fill="none" opacity="0.05" />',
      // Sparkle effects
      '<circle cx="180" cy="200" r="3" fill="#88ccff" opacity="0.4" />',
      '<circle cx="330" cy="220" r="2" fill="#88ccff" opacity="0.3" />',
      '<circle cx="200" cy="310" r="2" fill="#88ccff" opacity="0.3" />'
    ]
  },
  {
    id: 'bash',
    title: 'Bash',
    color1: '#4a2a1a',
    color2: '#1a0a08',
    accent: '#ff8844',
    glowColor: '#cc6622',
    // Heavy mace/fist impact
    parts: [
      // Fist/mace head
      '<circle cx="280" cy="200" r="45" fill="#8a6a4a" opacity="0.8" />',
      '<circle cx="280" cy="200" r="38" fill="#9a7a5a" opacity="0.6" />',
      // Spikes on mace
      '<path d="M 280 155 L 286 140 L 274 140 Z" fill="#aa8a6a" opacity="0.7" />',
      '<path d="M 325 200 L 340 194 L 340 206 Z" fill="#aa8a6a" opacity="0.7" />',
      '<path d="M 280 245 L 286 260 L 274 260 Z" fill="#aa8a6a" opacity="0.7" />',
      '<path d="M 235 200 L 220 194 L 220 206 Z" fill="#aa8a6a" opacity="0.7" />',
      // Handle
      '<path d="M 250 230 L 180 310" stroke="#5a3a1a" stroke-width="12" stroke-linecap="round" opacity="0.8" />',
      // Impact shockwave
      '<circle cx="300" cy="180" r="60" stroke="#ff8844" stroke-width="3" fill="none" opacity="0.2" />',
      '<circle cx="300" cy="180" r="80" stroke="#ff8844" stroke-width="2" fill="none" opacity="0.1" />',
      // Impact debris
      '<path d="M 310 160 L 340 130" stroke="#ffaa66" stroke-width="2" opacity="0.4" />',
      '<path d="M 320 180 L 360 170" stroke="#ffaa66" stroke-width="2" opacity="0.4" />',
      '<path d="M 300 160 L 310 120" stroke="#ffcc88" stroke-width="2" opacity="0.3" />',
      // Vulnerable indicator (star burst)
      '<circle cx="300" cy="180" r="4" fill="#ffcc44" opacity="0.5" />',
      '<path d="M 300 170 L 300 150" stroke="#ffcc44" stroke-width="1" opacity="0.3" />',
      '<path d="M 310 180 L 330 180" stroke="#ffcc44" stroke-width="1" opacity="0.3" />'
    ]
  },
  {
    id: 'anger',
    title: 'Anger',
    color1: '#5a1a1a',
    color2: '#200808',
    accent: '#ff4422',
    glowColor: '#dd2211',
    // Rage flames and clenched fist
    parts: [
      // Clenched fist
      '<path d="M 236 220 Q 220 190 240 170 Q 260 155 280 170 Q 295 185 285 220 Z" fill="#8a5a4a" opacity="0.8" />',
      '<path d="M 240 180 Q 250 168 265 175" stroke="#6a3a2a" stroke-width="2" fill="none" opacity="0.5" />',
      '<path d="M 240 190 Q 250 178 265 185" stroke="#6a3a2a" stroke-width="2" fill="none" opacity="0.5" />',
      // Forearm
      '<path d="M 250 220 L 230 300" stroke="#7a4a3a" stroke-width="20" stroke-linecap="round" opacity="0.7" />',
      // Rage flames around fist
      '<path d="M 230 170 Q 220 130 240 110 Q 245 130 250 120 Q 255 140 260 105 Q 270 135 275 115 Q 280 145 290 125 Q 285 160 280 170" fill="#ff4422" opacity="0.3" />',
      '<path d="M 235 165 Q 230 140 245 125 Q 248 145 255 130 Q 260 150 270 130 Q 272 155 275 165" fill="#ff6644" opacity="0.25" />',
      '<path d="M 240 170 Q 238 150 250 140 Q 255 155 265 145 Q 262 165 270 170" fill="#ffaa44" opacity="0.2" />',
      // Embers
      '<circle cx="220" cy="120" r="3" fill="#ff6622" opacity="0.4" />',
      '<circle cx="290" cy="110" r="2" fill="#ff8844" opacity="0.3" />',
      '<circle cx="250" cy="100" r="2" fill="#ffaa66" opacity="0.35" />',
      '<circle cx="210" cy="150" r="2" fill="#ff4422" opacity="0.3" />',
      '<circle cx="300" cy="140" r="2" fill="#ff6644" opacity="0.25" />'
    ]
  },
  {
    id: 'cleave',
    title: 'Cleave',
    color1: '#4a1a2a',
    color2: '#1a0810',
    accent: '#ff5566',
    glowColor: '#cc3344',
    // Wide horizontal axe sweep
    parts: [
      // Axe blade (large crescent)
      '<path d="M 150 180 Q 256 120 360 180 Q 320 200 256 210 Q 190 200 150 180 Z" fill="#aaaabb" opacity="0.7" />',
      '<path d="M 160 185 Q 256 130 350 185 Q 315 200 256 205 Q 195 200 160 185 Z" fill="#ccccdd" opacity="0.3" />',
      // Axe handle
      '<path d="M 256 210 L 256 350" stroke="#5a3a1a" stroke-width="10" stroke-linecap="round" opacity="0.8" />',
      // Sweep arc trail (wide)
      '<path d="M 80 190 Q 256 100 430 190" stroke="#ff5566" stroke-width="4" fill="none" opacity="0.2" />',
      '<path d="M 100 195 Q 256 110 410 195" stroke="#ff7788" stroke-width="2" fill="none" opacity="0.3" />',
      // Multi-target indicators (three impact points)
      '<circle cx="130" cy="200" r="12" stroke="#ff5566" stroke-width="2" fill="none" opacity="0.2" />',
      '<circle cx="256" cy="170" r="12" stroke="#ff5566" stroke-width="2" fill="none" opacity="0.2" />',
      '<circle cx="380" cy="200" r="12" stroke="#ff5566" stroke-width="2" fill="none" opacity="0.2" />',
      // Blood splatter
      '<circle cx="140" cy="195" r="3" fill="#cc3344" opacity="0.3" />',
      '<circle cx="370" cy="195" r="3" fill="#cc3344" opacity="0.3" />'
    ]
  },
  {
    id: 'ironWave',
    title: 'Iron Wave',
    color1: '#2a2a4a',
    color2: '#0a0a1a',
    accent: '#6688cc',
    glowColor: '#4466aa',
    // Wave of metal/shield + sword combo
    parts: [
      // Shield (left side)
      '<path d="M 160 160 L 210 140 L 210 260 L 160 300 L 110 260 L 110 140 Z" fill="#3a5a8a" opacity="0.7" />',
      '<path d="M 160 170 L 200 150 L 200 250 L 160 285 L 120 250 L 120 150 Z" fill="#4a6a9a" opacity="0.5" />',
      // Sword (right side)
      '<path d="M 300 130 L 360 310 L 350 315 L 290 140 Z" fill="#ccccdd" opacity="0.6" />',
      '<path d="M 305 140 L 355 305 L 355 310 L 300 143 Z" fill="#eeeeff" opacity="0.2" />',
      // Guard
      '<rect x="280" y="125" width="45" height="7" rx="3" fill="#8a6a2a" opacity="0.7" transform="rotate(-10, 302, 128)" />',
      // Wave energy connecting both
      '<path d="M 210 200 Q 256 170 300 200" stroke="#6688cc" stroke-width="3" fill="none" opacity="0.3" />',
      '<path d="M 210 220 Q 256 190 300 220" stroke="#88aaee" stroke-width="2" fill="none" opacity="0.2" />',
      '<path d="M 200 240 Q 256 210 310 240" stroke="#6688cc" stroke-width="2" fill="none" opacity="0.15" />',
      // Energy particles
      '<circle cx="240" cy="190" r="3" fill="#88bbff" opacity="0.3" />',
      '<circle cx="270" cy="200" r="2" fill="#88bbff" opacity="0.25" />',
      '<circle cx="255" cy="210" r="2" fill="#aaccff" opacity="0.2" />'
    ]
  },
  {
    id: 'pommelStrike',
    title: 'Pommel Strike',
    color1: '#3a2a1a',
    color2: '#140a08',
    accent: '#ddaa55',
    glowColor: '#bb8833',
    // Sword pommel jab
    parts: [
      // Sword (reversed, pommel forward)
      '<path d="M 320 320 L 220 140" stroke="#8a7a5a" stroke-width="8" stroke-linecap="round" opacity="0.7" />',
      // Blade (behind, fading)
      '<path d="M 320 320 L 380 420" stroke="#aaaacc" stroke-width="4" fill="none" opacity="0.3" />',
      // Pommel (round, prominent)
      '<circle cx="215" cy="135" r="20" fill="#bb9944" opacity="0.8" />',
      '<circle cx="215" cy="135" r="14" fill="#ddbb66" opacity="0.5" />',
      '<circle cx="210" cy="130" r="4" fill="#eedd88" opacity="0.4" />',
      // Guard
      '<rect x="240" y="180" width="40" height="8" rx="3" fill="#8a6a2a" opacity="0.6" transform="rotate(-55, 260, 184)" />',
      // Impact effect at pommel
      '<circle cx="210" cy="130" r="30" stroke="#ddaa55" stroke-width="2" fill="none" opacity="0.2" />',
      '<circle cx="210" cy="130" r="45" stroke="#ddaa55" stroke-width="1.5" fill="none" opacity="0.1" />',
      // Motion lines
      '<path d="M 280 240 L 230 160" stroke="#ddaa55" stroke-width="1" opacity="0.2" stroke-dasharray="4,4" />',
      '<path d="M 290 250 L 240 170" stroke="#ddaa55" stroke-width="1" opacity="0.2" stroke-dasharray="4,4" />',
      // Card draw indicator (small card shape)
      '<rect x="340" y="120" width="24" height="34" rx="3" fill="#ddaa55" opacity="0.15" transform="rotate(10, 352, 137)" />',
      '<rect x="355" y="110" width="24" height="34" rx="3" fill="#ddaa55" opacity="0.1" transform="rotate(20, 367, 127)" />'
    ]
  },
  {
    id: 'shrugItOff',
    title: 'Shrug It Off',
    color1: '#1a3a3a',
    color2: '#081414',
    accent: '#44bbaa',
    glowColor: '#339988',
    // Armored shoulder shrug with block energy
    parts: [
      // Shoulder/torso silhouette
      '<path d="M 200 250 Q 200 180 256 160 Q 312 180 312 250" fill="#4a6a6a" opacity="0.6" />',
      // Shoulder pauldrons
      '<ellipse cx="205" cy="195" rx="35" ry="20" fill="#5a7a7a" opacity="0.7" transform="rotate(-15, 205, 195)" />',
      '<ellipse cx="307" cy="195" rx="35" ry="20" fill="#5a7a7a" opacity="0.7" transform="rotate(15, 307, 195)" />',
      // Block energy shield forming
      '<path d="M 170 160 Q 256 120 342 160" stroke="#44bbaa" stroke-width="3" fill="none" opacity="0.3" />',
      '<path d="M 160 150 Q 256 100 352 150" stroke="#44bbaa" stroke-width="2" fill="none" opacity="0.2" />',
      '<path d="M 180 170 Q 256 140 332 170" stroke="#66ddcc" stroke-width="2" fill="none" opacity="0.25" />',
      // Card draw sparkle
      '<rect x="320" y="120" width="20" height="28" rx="2" fill="#44bbaa" opacity="0.15" transform="rotate(5, 330, 134)" />',
      '<path d="M 330 128 L 330 140" stroke="#66ddcc" stroke-width="1" opacity="0.3" />',
      '<path d="M 324 134 L 336 134" stroke="#66ddcc" stroke-width="1" opacity="0.3" />',
      // Deflection particles
      '<circle cx="180" cy="170" r="3" fill="#88eedd" opacity="0.3" />',
      '<circle cx="330" cy="165" r="2" fill="#88eedd" opacity="0.25" />',
      '<circle cx="256" cy="130" r="2" fill="#aaffee" opacity="0.2" />'
    ]
  },
  {
    id: 'bodySlam',
    title: 'Body Slam',
    color1: '#3a2a2a',
    color2: '#140a0a',
    accent: '#cc8855',
    glowColor: '#aa6633',
    // Full body charge/slam
    parts: [
      // Body silhouette (charging forward)
      '<path d="M 220 160 Q 200 200 210 260 Q 220 310 256 330 Q 290 310 300 260 Q 310 200 290 160 Z" fill="#6a4a3a" opacity="0.7" />',
      // Shoulder forward (leading with shield/body)
      '<ellipse cx="240" cy="190" rx="40" ry="30" fill="#7a5a4a" opacity="0.6" transform="rotate(-20, 240, 190)" />',
      // Shield on body
      '<path d="M 210 180 L 240 165 L 240 225 L 210 240 L 180 225 L 180 165 Z" fill="#5a7a9a" opacity="0.5" />',
      // Impact shockwave (in front)
      '<ellipse cx="200" cy="210" rx="80" ry="40" stroke="#cc8855" stroke-width="3" fill="none" opacity="0.2" transform="rotate(-10, 200, 210)" />',
      '<ellipse cx="190" cy="210" rx="100" ry="50" stroke="#cc8855" stroke-width="2" fill="none" opacity="0.1" transform="rotate(-10, 190, 210)" />',
      // Ground crack
      '<path d="M 160 290 L 180 270 L 190 285 L 210 260 L 220 275" stroke="#aa6633" stroke-width="2" fill="none" opacity="0.3" />',
      // Motion blur lines
      '<path d="M 330 180 L 370 180" stroke="#cc8855" stroke-width="2" opacity="0.15" />',
      '<path d="M 320 210 L 370 210" stroke="#cc8855" stroke-width="2" opacity="0.15" />',
      '<path d="M 325 240 L 370 240" stroke="#cc8855" stroke-width="2" opacity="0.15" />',
      // Block→damage indicator
      '<path d="M 350 130 L 370 130 L 360 115 Z" fill="#5a7a9a" opacity="0.2" />',
      '<path d="M 360 115 L 370 100" stroke="#cc8855" stroke-width="2" opacity="0.2" />'
    ]
  },
  {
    id: 'clothesline',
    title: 'Clothesline',
    color1: '#4a2222',
    color2: '#1a0808',
    accent: '#ee6644',
    glowColor: '#cc4422',
    // Arm outstretched for a clothesline attack
    parts: [
      // Torso silhouette
      '<path d="M 180 200 Q 180 160 220 150 Q 256 145 290 150 Q 330 160 330 200 Q 330 280 256 300 Q 180 280 180 200 Z" fill="#5a3a3a" opacity="0.6" />',
      // Extended arm (the clothesline)
      '<path d="M 290 180 L 420 170" stroke="#7a4a3a" stroke-width="18" stroke-linecap="round" opacity="0.7" />',
      // Fist
      '<circle cx="425" cy="168" r="16" fill="#8a5a4a" opacity="0.8" />',
      // Impact zone
      '<circle cx="425" cy="168" r="25" stroke="#ee6644" stroke-width="3" fill="none" opacity="0.25" />',
      '<circle cx="425" cy="168" r="40" stroke="#ee6644" stroke-width="2" fill="none" opacity="0.15" />',
      // Weakness effect (debuff spiral)
      '<path d="M 400 140 Q 420 130 440 140 Q 450 155 440 170" stroke="#ee6644" stroke-width="1.5" fill="none" opacity="0.2" stroke-dasharray="3,3" />',
      // Motion blur
      '<path d="M 150 185 L 290 180" stroke="#ee6644" stroke-width="1" opacity="0.15" stroke-dasharray="8,4" />',
      '<path d="M 160 175 L 280 172" stroke="#ee6644" stroke-width="1" opacity="0.1" stroke-dasharray="8,4" />',
      // Weak status icon hint
      '<path d="M 430 130 L 435 118 L 440 130" stroke="#ff8866" stroke-width="1.5" fill="none" opacity="0.3" />',
      '<path d="M 432 130 L 432 135" stroke="#ff8866" stroke-width="1.5" opacity="0.3" />'
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

  const outDir = path.join(__dirname, '..', 'src', 'assets', 'art', 'cards');

  console.log(`Generating ${CARDS.length} improved Ironclad card art images...`);

  for (const card of CARDS) {
    const partsStr = card.parts.map(p => `    <g transform="translate(0, 0)">${p}</g>`).join('\n');

    const svg = `<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="${card.color1}" />
      <stop offset="100%" stop-color="${card.color2}" />
    </radialGradient>
    <radialGradient id="glow" cx="50%" cy="40%" r="40%">
      <stop offset="0%" stop-color="${card.glowColor}" stop-opacity="0.2" />
      <stop offset="100%" stop-color="${card.glowColor}" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="vignette" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="black" stop-opacity="0.2" />
      <stop offset="30%" stop-color="black" stop-opacity="0" />
      <stop offset="75%" stop-color="black" stop-opacity="0" />
      <stop offset="100%" stop-color="black" stop-opacity="0.4" />
    </linearGradient>
    <radialGradient id="centerGlow" cx="50%" cy="45%" r="30%">
      <stop offset="0%" stop-color="${card.accent}" stop-opacity="0.1" />
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
  <text x="256" y="430" text-anchor="middle" font-family="serif" font-size="28" font-weight="bold" fill="${card.accent}" opacity="0.7">${escapeXml(card.title)}</text>
</svg>`;

    const outPath = path.join(outDir, `${card.id}.webp`);
    await sharp(Buffer.from(svg))
      .webp({ quality: 85 })
      .toFile(outPath);

    console.log(`  Generated: ${card.id}.webp`);
  }

  console.log(`\nDone! ${CARDS.length} improved card images in src/assets/art/cards/`);
  console.log('Next: run `node scripts/generate-sprite-sheets.js --type=cards` to rebuild sprite sheet');
}

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

main().catch(err => { console.error(err); process.exit(1); });
