#!/usr/bin/env node

/**
 * GD-23: Art Polish Pass
 *
 * Generates improved SVG-based enemy sprites for the 5 lowest-quality
 * placeholder images. Uses the same sharp pipeline as other art scripts.
 *
 * Targets: snecko, mystic, automaton, bronzeOrb, sphericGuardian
 *
 * Usage: node scripts/generate-polish-sprites.js
 * Requires: sharp (devDependency)
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SIZE = 512;

const ENEMIES = [
  {
    id: 'snecko',
    name: 'Snecko',
    color1: '#2a4a2a',
    color2: '#0a1a0a',
    accent: '#66dd66',
    glowColor: '#44aa44',
    // Large serpentine creature with hypnotic eyes
    parts: [
      // Body coils
      '<ellipse cx="0" cy="20" rx="90" ry="50" fill="#3a6a3a" opacity="0.8" />',
      '<ellipse cx="-30" cy="-20" rx="70" ry="45" fill="#3a7a3a" opacity="0.7" />',
      '<ellipse cx="30" cy="60" rx="65" ry="40" fill="#2a5a2a" opacity="0.7" />',
      // Tail
      '<path d="M 80 60 Q 120 30 110 -10 Q 100 -40 130 -60" stroke="#3a6a3a" stroke-width="18" fill="none" stroke-linecap="round" opacity="0.7" />',
      // Head/neck rising up
      '<path d="M -30 -20 Q -50 -80 -30 -120" stroke="#4a8a4a" stroke-width="24" fill="none" stroke-linecap="round" />',
      // Head
      '<ellipse cx="-25" cy="-135" rx="30" ry="22" fill="#4a8a4a" />',
      // Hypnotic eyes (the key feature)
      '<circle cx="-38" cy="-140" r="10" fill="#ffee00" opacity="0.9" />',
      '<circle cx="-12" cy="-140" r="10" fill="#ffee00" opacity="0.9" />',
      '<circle cx="-38" cy="-140" r="5" fill="#000" />',
      '<circle cx="-12" cy="-140" r="5" fill="#000" />',
      // Spiral hypnotic pattern on eyes
      '<circle cx="-38" cy="-140" r="8" stroke="#ff8800" stroke-width="1.5" fill="none" opacity="0.6" />',
      '<circle cx="-12" cy="-140" r="8" stroke="#ff8800" stroke-width="1.5" fill="none" opacity="0.6" />',
      // Scales pattern
      '<circle cx="-10" cy="0" r="4" fill="#5a9a5a" opacity="0.3" />',
      '<circle cx="10" cy="15" r="4" fill="#5a9a5a" opacity="0.3" />',
      '<circle cx="-20" cy="30" r="4" fill="#5a9a5a" opacity="0.3" />',
      '<circle cx="20" cy="40" r="4" fill="#5a9a5a" opacity="0.3" />',
      '<circle cx="0" cy="50" r="4" fill="#5a9a5a" opacity="0.3" />',
      // Forked tongue
      '<path d="M -25 -115 L -30 -105 L -25 -108 L -20 -105 Z" fill="#cc3333" opacity="0.8" />'
    ]
  },
  {
    id: 'mystic',
    name: 'Mystic',
    color1: '#3a2a5a',
    color2: '#120a20',
    accent: '#bb88ff',
    glowColor: '#9966dd',
    // Robed healer figure with glowing hands
    parts: [
      // Robe body
      '<path d="M -35 -50 L -55 90 L 55 90 L 35 -50 Z" fill="#4a3a6a" opacity="0.8" />',
      // Robe folds
      '<path d="M -15 -30 L -25 90" stroke="#5a4a7a" stroke-width="2" opacity="0.5" />',
      '<path d="M 15 -30 L 25 90" stroke="#5a4a7a" stroke-width="2" opacity="0.5" />',
      // Hood
      '<path d="M -40 -55 Q -45 -110 0 -120 Q 45 -110 40 -55 Z" fill="#3a2a5a" />',
      '<path d="M -25 -60 Q -20 -90 0 -95 Q 20 -90 25 -60 Z" fill="#1a0a2a" opacity="0.8" />',
      // Glowing eyes in hood
      '<ellipse cx="-10" cy="-75" rx="4" ry="3" fill="#bb88ff" opacity="0.9" />',
      '<ellipse cx="10" cy="-75" rx="4" ry="3" fill="#bb88ff" opacity="0.9" />',
      // Arms outstretched
      '<path d="M -35 -30 Q -70 -20 -80 -40" stroke="#4a3a6a" stroke-width="14" fill="none" stroke-linecap="round" />',
      '<path d="M 35 -30 Q 70 -20 80 -40" stroke="#4a3a6a" stroke-width="14" fill="none" stroke-linecap="round" />',
      // Glowing hands
      '<circle cx="-82" cy="-42" r="12" fill="#bb88ff" opacity="0.4" />',
      '<circle cx="-82" cy="-42" r="7" fill="#ddbbff" opacity="0.6" />',
      '<circle cx="82" cy="-42" r="12" fill="#bb88ff" opacity="0.4" />',
      '<circle cx="82" cy="-42" r="7" fill="#ddbbff" opacity="0.6" />',
      // Healing energy stream between hands
      '<path d="M -75 -42 Q 0 -65 75 -42" stroke="#bb88ff" stroke-width="3" fill="none" opacity="0.4" stroke-dasharray="6,4" />',
      '<path d="M -70 -42 Q 0 -55 70 -42" stroke="#ddbbff" stroke-width="2" fill="none" opacity="0.3" stroke-dasharray="4,6" />',
      // Staff
      '<rect x="-48" y="-50" width="5" height="140" rx="2" fill="#8a7a5a" opacity="0.5" transform="rotate(-12, -48, 20)" />',
      '<circle cx="-58" cy="-60" r="8" fill="#9966dd" opacity="0.5" />'
    ]
  },
  {
    id: 'automaton',
    name: 'Bronze Automaton',
    color1: '#5a4422',
    color2: '#1a1008',
    accent: '#ffaa44',
    glowColor: '#dd8833',
    // Large mechanical construct, boss-sized
    parts: [
      // Torso — massive mechanical chest
      '<rect x="-55" y="-60" width="110" height="100" rx="6" fill="#8a7040" opacity="0.9" />',
      // Chest plate detail
      '<rect x="-40" y="-45" width="80" height="70" rx="4" fill="#6a5530" opacity="0.7" />',
      '<circle cx="0" cy="-15" r="18" fill="#ffaa44" opacity="0.3" />',
      '<circle cx="0" cy="-15" r="10" fill="#ffcc66" opacity="0.5" />',
      // Head — angular mechanical
      '<rect x="-30" y="-100" width="60" height="45" rx="4" fill="#8a7040" />',
      '<rect x="-22" y="-92" width="44" height="28" rx="3" fill="#4a3820" opacity="0.8" />',
      // Eyes — glowing red
      '<rect x="-18" y="-85" width="12" height="6" rx="2" fill="#ff4444" opacity="0.9" />',
      '<rect x="6" y="-85" width="12" height="6" rx="2" fill="#ff4444" opacity="0.9" />',
      // Arms — thick mechanical
      '<rect x="-80" y="-55" width="28" height="90" rx="6" fill="#7a6035" opacity="0.8" />',
      '<rect x="52" y="-55" width="28" height="90" rx="6" fill="#7a6035" opacity="0.8" />',
      // Fists
      '<rect x="-82" y="30" width="32" height="28" rx="8" fill="#8a7040" opacity="0.9" />',
      '<rect x="50" y="30" width="32" height="28" rx="8" fill="#8a7040" opacity="0.9" />',
      // Legs
      '<rect x="-35" y="40" width="25" height="55" rx="4" fill="#7a6035" opacity="0.8" />',
      '<rect x="10" y="40" width="25" height="55" rx="4" fill="#7a6035" opacity="0.8" />',
      // Rivets/bolts
      '<circle cx="-40" cy="-50" r="3" fill="#aa9060" opacity="0.6" />',
      '<circle cx="40" cy="-50" r="3" fill="#aa9060" opacity="0.6" />',
      '<circle cx="-40" cy="30" r="3" fill="#aa9060" opacity="0.6" />',
      '<circle cx="40" cy="30" r="3" fill="#aa9060" opacity="0.6" />',
      // Hyper beam cannon glow
      '<circle cx="0" cy="-15" r="25" fill="#ffaa44" opacity="0.15" />'
    ]
  },
  {
    id: 'bronzeOrb',
    name: 'Bronze Orb',
    color1: '#4a3822',
    color2: '#1a1008',
    accent: '#ff6644',
    glowColor: '#dd4422',
    // Floating bronze sphere with energy beam
    parts: [
      // Main sphere
      '<circle cx="0" cy="-20" r="50" fill="#8a7040" opacity="0.9" />',
      // Sphere shading
      '<circle cx="-12" cy="-32" r="42" fill="#aa9060" opacity="0.3" />',
      '<circle cx="15" cy="0" r="40" fill="#5a4525" opacity="0.3" />',
      // Central eye/lens
      '<circle cx="0" cy="-20" r="20" fill="#3a2a15" opacity="0.8" />',
      '<circle cx="0" cy="-20" r="14" fill="#ff4422" opacity="0.5" />',
      '<circle cx="0" cy="-20" r="8" fill="#ff6644" opacity="0.8" />',
      '<circle cx="-3" cy="-23" r="3" fill="#ffaa88" opacity="0.9" />',
      // Decorative ring
      '<circle cx="0" cy="-20" r="35" stroke="#aa9060" stroke-width="3" fill="none" opacity="0.4" />',
      // Energy crackle
      '<path d="M 0 30 L -5 45 L 5 40 L -3 60" stroke="#ff6644" stroke-width="2" fill="none" opacity="0.5" />',
      '<path d="M 15 25 L 20 40 L 12 38 L 18 55" stroke="#ff4422" stroke-width="1.5" fill="none" opacity="0.4" />',
      // Floating particles
      '<circle cx="-30" cy="15" r="2" fill="#ffaa44" opacity="0.5" />',
      '<circle cx="25" cy="-50" r="2" fill="#ffaa44" opacity="0.4" />',
      '<circle cx="-20" cy="-55" r="1.5" fill="#ff6644" opacity="0.5" />'
    ]
  },
  {
    id: 'sphericGuardian',
    name: 'Spheric Guardian',
    color1: '#1a3a5a',
    color2: '#0a1520',
    accent: '#4488dd',
    glowColor: '#3366bb',
    // Blue crystalline sphere with defensive shield aura
    parts: [
      // Main sphere body
      '<circle cx="0" cy="-10" r="55" fill="#2255aa" opacity="0.8" />',
      // Crystal facets
      '<polygon points="0,-65 -25,-35 25,-35" fill="#3377cc" opacity="0.5" />',
      '<polygon points="-25,-35 -50,5 0,-10" fill="#2266bb" opacity="0.4" />',
      '<polygon points="25,-35 50,5 0,-10" fill="#2266bb" opacity="0.4" />',
      '<polygon points="-50,5 -25,40 0,-10" fill="#1a4488" opacity="0.4" />',
      '<polygon points="50,5 25,40 0,-10" fill="#1a4488" opacity="0.4" />',
      '<polygon points="0,-10 -25,40 25,40" fill="#1a3366" opacity="0.3" />',
      // Central eye
      '<circle cx="0" cy="-15" r="18" fill="#112244" opacity="0.8" />',
      '<circle cx="0" cy="-15" r="12" fill="#4488dd" opacity="0.6" />',
      '<circle cx="0" cy="-15" r="6" fill="#88bbff" opacity="0.8" />',
      '<circle cx="-2" cy="-17" r="2" fill="#ffffff" opacity="0.7" />',
      // Shield aura rings
      '<circle cx="0" cy="-10" r="65" stroke="#4488dd" stroke-width="2" fill="none" opacity="0.3" />',
      '<circle cx="0" cy="-10" r="72" stroke="#3366bb" stroke-width="1.5" fill="none" opacity="0.2" />',
      '<circle cx="0" cy="-10" r="80" stroke="#2255aa" stroke-width="1" fill="none" opacity="0.1" />',
      // Energy motes
      '<circle cx="-40" cy="-50" r="3" fill="#88bbff" opacity="0.4" />',
      '<circle cx="45" cy="15" r="2.5" fill="#88bbff" opacity="0.3" />',
      '<circle cx="-50" cy="20" r="2" fill="#4488dd" opacity="0.4" />',
      '<circle cx="30" cy="-55" r="2" fill="#4488dd" opacity="0.35" />'
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

  const outDir = path.join(__dirname, '..', 'src', 'assets', 'art', 'enemies');

  for (const enemy of ENEMIES) {
    const svg = `<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="50%" cy="45%" r="70%">
      <stop offset="0%" stop-color="${enemy.color1}" />
      <stop offset="100%" stop-color="${enemy.color2}" />
    </radialGradient>
    <radialGradient id="glow" cx="50%" cy="40%" r="40%">
      <stop offset="0%" stop-color="${enemy.glowColor}" stop-opacity="0.2" />
      <stop offset="100%" stop-color="${enemy.glowColor}" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="vignette" cx="50%" cy="50%" r="50%">
      <stop offset="55%" stop-color="black" stop-opacity="0" />
      <stop offset="100%" stop-color="black" stop-opacity="0.7" />
    </radialGradient>
    <filter id="softglow">
      <feGaussianBlur stdDeviation="2" />
    </filter>
  </defs>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#bg)" />
  <rect width="${SIZE}" height="${SIZE}" fill="url(#glow)" />
  <g transform="translate(256, 280)">
    ${enemy.parts.join('\n    ')}
  </g>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#vignette)" />
</svg>`;

    const outPath = path.join(outDir, `${enemy.id}.webp`);
    await sharp(Buffer.from(svg))
      .webp({ quality: 85 })
      .toFile(outPath);

    const stats = await import('fs').then(fs => fs.promises.stat(outPath));
    console.log(`Generated: ${enemy.id}.webp (${(stats.size / 1024).toFixed(1)}KB)`);
  }

  console.log(`\nDone! ${ENEMIES.length} improved sprites generated.`);
  console.log('Next: run `node scripts/generate-sprite-sheets.js --type=enemies` to rebuild sprite sheet.');
}

main().catch(err => { console.error(err); process.exit(1); });
