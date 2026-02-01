#!/usr/bin/env node

/**
 * GD-25: Enemy Art Quality Pass — Act 1 Bosses & Elites
 *
 * Generates improved SVG-based enemy sprites for 5 high-visibility
 * Act 1 boss and elite enemies. Uses the same sharp pipeline as
 * generate-polish-sprites.js.
 *
 * Targets: slimeBoss, theGuardian, hexaghost, gremlinNob, lagavulin
 *
 * Usage: node scripts/generate-quality-enemy-art.js
 * Requires: sharp (devDependency)
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SIZE = 512;

const ENEMIES = [
  {
    id: 'slimeBoss',
    name: 'Slime Boss',
    color1: '#1a3a1a',
    color2: '#0a150a',
    accent: '#66dd44',
    glowColor: '#44aa22',
    // Massive amorphous blob, dripping slime, multiple eyes, green/toxic
    parts: [
      // Main body — huge amorphous blob
      '<ellipse cx="0" cy="20" rx="120" ry="85" fill="#2a5a1a" opacity="0.9" />',
      '<ellipse cx="-20" cy="30" rx="110" ry="78" fill="#336622" opacity="0.7" />',
      '<ellipse cx="15" cy="10" rx="100" ry="70" fill="#2a6a2a" opacity="0.5" />',
      // Surface bubbles / boils
      '<circle cx="-50" cy="-10" r="18" fill="#3a7a2a" opacity="0.6" />',
      '<circle cx="40" cy="0" r="22" fill="#3a8a2a" opacity="0.5" />',
      '<circle cx="-20" cy="50" r="15" fill="#2a6a1a" opacity="0.6" />',
      '<circle cx="60" cy="40" r="12" fill="#3a7a2a" opacity="0.5" />',
      // Dripping slime tendrils
      '<path d="M -80 70 Q -85 100 -75 120" stroke="#44aa22" stroke-width="6" fill="none" opacity="0.5" stroke-linecap="round" />',
      '<path d="M -40 85 Q -42 110 -35 135" stroke="#44aa22" stroke-width="8" fill="none" opacity="0.4" stroke-linecap="round" />',
      '<path d="M 30 80 Q 35 115 28 140" stroke="#44aa22" stroke-width="7" fill="none" opacity="0.45" stroke-linecap="round" />',
      '<path d="M 70 65 Q 78 95 72 115" stroke="#44aa22" stroke-width="5" fill="none" opacity="0.4" stroke-linecap="round" />',
      // Drip drops
      '<ellipse cx="-75" cy="124" rx="4" ry="6" fill="#44aa22" opacity="0.5" />',
      '<ellipse cx="-35" cy="139" rx="5" ry="7" fill="#44aa22" opacity="0.4" />',
      '<ellipse cx="28" cy="144" rx="4" ry="6" fill="#44aa22" opacity="0.4" />',
      // Multiple eyes — key feature of Slime Boss
      '<ellipse cx="-40" cy="-25" rx="16" ry="12" fill="#112211" opacity="0.8" />',
      '<circle cx="-40" cy="-25" r="8" fill="#ccff44" opacity="0.9" />',
      '<circle cx="-40" cy="-25" r="4" fill="#224400" />',
      '<ellipse cx="10" cy="-35" rx="20" ry="15" fill="#112211" opacity="0.8" />',
      '<circle cx="10" cy="-35" r="10" fill="#ccff44" opacity="0.9" />',
      '<circle cx="10" cy="-35" r="5" fill="#224400" />',
      '<ellipse cx="55" cy="-15" rx="13" ry="10" fill="#112211" opacity="0.8" />',
      '<circle cx="55" cy="-15" r="7" fill="#ccff44" opacity="0.9" />',
      '<circle cx="55" cy="-15" r="3.5" fill="#224400" />',
      // Smaller extra eyes
      '<circle cx="-70" cy="5" r="5" fill="#aadd33" opacity="0.6" />',
      '<circle cx="-70" cy="5" r="2.5" fill="#224400" opacity="0.8" />',
      '<circle cx="80" cy="10" r="4" fill="#aadd33" opacity="0.5" />',
      '<circle cx="80" cy="10" r="2" fill="#224400" opacity="0.7" />',
      // Toxic glow beneath
      '<ellipse cx="0" cy="80" rx="90" ry="20" fill="#44aa22" opacity="0.15" />',
      // Split line hint (it splits in combat)
      '<path d="M 0 -60 L 0 80" stroke="#1a3a0a" stroke-width="2" opacity="0.3" stroke-dasharray="8,6" />'
    ]
  },
  {
    id: 'theGuardian',
    name: 'The Guardian',
    color1: '#1a2a3a',
    color2: '#0a1018',
    accent: '#4488cc',
    glowColor: '#3366aa',
    // Towering stone/metal construct, gem core, shield arms, blue/grey
    parts: [
      // Legs — heavy stone pillars
      '<rect x="-50" y="40" width="30" height="60" rx="4" fill="#556677" opacity="0.8" />',
      '<rect x="20" y="40" width="30" height="60" rx="4" fill="#556677" opacity="0.8" />',
      // Torso — massive stone slab
      '<path d="M -65 -50 L -55 45 L 55 45 L 65 -50 Z" fill="#667788" opacity="0.9" />',
      '<path d="M -55 -40 L -48 35 L 48 35 L 55 -40 Z" fill="#556677" opacity="0.6" />',
      // Gem core — glowing blue center
      '<circle cx="0" cy="-5" r="22" fill="#112233" opacity="0.8" />',
      '<circle cx="0" cy="-5" r="16" fill="#2266bb" opacity="0.6" />',
      '<circle cx="0" cy="-5" r="10" fill="#44aaff" opacity="0.8" />',
      '<circle cx="-3" cy="-8" r="4" fill="#88ccff" opacity="0.7" />',
      // Gem glow
      '<circle cx="0" cy="-5" r="30" fill="#4488cc" opacity="0.12" />',
      // Head — angular stone block
      '<path d="M -25 -95 L -35 -50 L 35 -50 L 25 -95 Z" fill="#778899" opacity="0.9" />',
      '<rect x="-18" y="-85" width="36" height="20" rx="2" fill="#445566" opacity="0.7" />',
      // Eyes — glowing slits
      '<rect x="-15" y="-78" width="10" height="4" rx="1" fill="#44aaff" opacity="0.9" />',
      '<rect x="5" y="-78" width="10" height="4" rx="1" fill="#44aaff" opacity="0.9" />',
      // Shield arms — massive
      '<path d="M -65 -45 L -110 -30 L -105 20 L -60 30" fill="#778899" opacity="0.7" />',
      '<path d="M 65 -45 L 110 -30 L 105 20 L 60 30" fill="#778899" opacity="0.7" />',
      // Shield surface detail
      '<path d="M -100 -20 L -95 10" stroke="#8899aa" stroke-width="2" opacity="0.4" />',
      '<path d="M -90 -25 L -85 15" stroke="#8899aa" stroke-width="2" opacity="0.4" />',
      '<path d="M 100 -20 L 95 10" stroke="#8899aa" stroke-width="2" opacity="0.4" />',
      '<path d="M 90 -25 L 85 15" stroke="#8899aa" stroke-width="2" opacity="0.4" />',
      // Stone texture marks
      '<path d="M -30 -30 L -10 -25" stroke="#8899aa" stroke-width="1" opacity="0.3" />',
      '<path d="M 15 0 L 35 5" stroke="#8899aa" stroke-width="1" opacity="0.3" />',
      '<path d="M -20 20 L 5 25" stroke="#8899aa" stroke-width="1" opacity="0.3" />',
      // Rune markings
      '<circle cx="-30" cy="-20" r="3" stroke="#4488cc" stroke-width="1" fill="none" opacity="0.4" />',
      '<circle cx="30" cy="-20" r="3" stroke="#4488cc" stroke-width="1" fill="none" opacity="0.4" />',
      '<circle cx="0" cy="25" r="3" stroke="#4488cc" stroke-width="1" fill="none" opacity="0.4" />'
    ]
  },
  {
    id: 'hexaghost',
    name: 'Hexaghost',
    color1: '#2a1a3a',
    color2: '#0a0815',
    accent: '#aa66ff',
    glowColor: '#8844dd',
    // Six ghostly flames orbiting a spectral core, purple/ethereal
    parts: [
      // Central spectral core — translucent skull-like shape
      '<circle cx="0" cy="0" r="40" fill="#3a1a5a" opacity="0.6" />',
      '<circle cx="0" cy="0" r="30" fill="#4a2a6a" opacity="0.5" />',
      // Skull suggestion in core
      '<ellipse cx="0" cy="-5" rx="22" ry="18" fill="#2a1040" opacity="0.7" />',
      '<circle cx="-8" cy="-8" r="6" fill="#aa66ff" opacity="0.5" />',
      '<circle cx="8" cy="-8" r="6" fill="#aa66ff" opacity="0.5" />',
      '<path d="M -4 5 L 0 10 L 4 5" stroke="#aa66ff" stroke-width="1.5" fill="none" opacity="0.4" />',
      // Core glow
      '<circle cx="0" cy="0" r="50" fill="#8844dd" opacity="0.1" />',
      // Six orbiting flames — positioned in hexagonal pattern
      // Flame 1 (top)
      '<path d="M 0 -85 Q -12 -100 0 -115 Q 12 -100 0 -85" fill="#aa66ff" opacity="0.7" />',
      '<path d="M 0 -88 Q -6 -98 0 -108 Q 6 -98 0 -88" fill="#cc88ff" opacity="0.6" />',
      '<circle cx="0" cy="-90" r="8" fill="#8844dd" opacity="0.4" />',
      // Flame 2 (upper right)
      '<path d="M 73 -42 Q 65 -60 80 -68 Q 88 -53 73 -42" fill="#aa66ff" opacity="0.7" />',
      '<path d="M 74 -45 Q 70 -56 79 -62 Q 83 -52 74 -45" fill="#cc88ff" opacity="0.6" />',
      '<circle cx="75" cy="-48" r="8" fill="#8844dd" opacity="0.4" />',
      // Flame 3 (lower right)
      '<path d="M 73 42 Q 65 28 80 20 Q 88 35 73 42" fill="#aa66ff" opacity="0.7" />',
      '<path d="M 74 40 Q 70 32 79 26 Q 83 34 74 40" fill="#cc88ff" opacity="0.6" />',
      '<circle cx="75" cy="38" r="8" fill="#8844dd" opacity="0.4" />',
      // Flame 4 (bottom)
      '<path d="M 0 85 Q -12 70 0 62 Q 12 70 0 85" fill="#aa66ff" opacity="0.7" />',
      '<path d="M 0 82 Q -6 74 0 68 Q 6 74 0 82" fill="#cc88ff" opacity="0.6" />',
      '<circle cx="0" cy="80" r="8" fill="#8844dd" opacity="0.4" />',
      // Flame 5 (lower left)
      '<path d="M -73 42 Q -65 28 -80 20 Q -88 35 -73 42" fill="#aa66ff" opacity="0.7" />',
      '<path d="M -74 40 Q -70 32 -79 26 Q -83 34 -74 40" fill="#cc88ff" opacity="0.6" />',
      '<circle cx="-75" cy="38" r="8" fill="#8844dd" opacity="0.4" />',
      // Flame 6 (upper left)
      '<path d="M -73 -42 Q -65 -60 -80 -68 Q -88 -53 -73 -42" fill="#aa66ff" opacity="0.7" />',
      '<path d="M -74 -45 Q -70 -56 -79 -62 Q -83 -52 -74 -45" fill="#cc88ff" opacity="0.6" />',
      '<circle cx="-75" cy="-48" r="8" fill="#8844dd" opacity="0.4" />',
      // Connecting energy arcs between flames
      '<path d="M 0 -85 Q 40 -65 73 -42" stroke="#8844dd" stroke-width="1.5" fill="none" opacity="0.2" />',
      '<path d="M 73 -42 Q 80 0 73 42" stroke="#8844dd" stroke-width="1.5" fill="none" opacity="0.2" />',
      '<path d="M 73 42 Q 40 65 0 85" stroke="#8844dd" stroke-width="1.5" fill="none" opacity="0.2" />',
      '<path d="M 0 85 Q -40 65 -73 42" stroke="#8844dd" stroke-width="1.5" fill="none" opacity="0.2" />',
      '<path d="M -73 42 Q -80 0 -73 -42" stroke="#8844dd" stroke-width="1.5" fill="none" opacity="0.2" />',
      '<path d="M -73 -42 Q -40 -65 0 -85" stroke="#8844dd" stroke-width="1.5" fill="none" opacity="0.2" />',
      // Ethereal particles
      '<circle cx="35" cy="-65" r="2" fill="#cc88ff" opacity="0.4" />',
      '<circle cx="-50" cy="-55" r="1.5" fill="#aa66ff" opacity="0.3" />',
      '<circle cx="55" cy="25" r="2" fill="#cc88ff" opacity="0.35" />',
      '<circle cx="-45" cy="60" r="1.5" fill="#aa66ff" opacity="0.3" />'
    ]
  },
  {
    id: 'gremlinNob',
    name: 'Gremlin Nob',
    color1: '#3a1a1a',
    color2: '#150808',
    accent: '#dd4422',
    glowColor: '#aa3318',
    // Hulking muscular gremlin, massive club, aggressive stance, red/brown
    parts: [
      // Legs — thick, powerful stance
      '<path d="M -35 40 L -45 95 L -25 95 L -20 45 Z" fill="#6a4a3a" opacity="0.8" />',
      '<path d="M 20 45 L 25 95 L 45 95 L 35 40 Z" fill="#6a4a3a" opacity="0.8" />',
      // Torso — massive, hunched
      '<path d="M -55 -40 L -45 45 L 45 45 L 55 -30 Z" fill="#8a5a3a" opacity="0.9" />',
      // Chest muscle definition
      '<path d="M -20 -25 Q 0 -15 20 -25" stroke="#9a6a4a" stroke-width="2" fill="none" opacity="0.4" />',
      '<path d="M -15 -10 Q 0 0 15 -10" stroke="#9a6a4a" stroke-width="2" fill="none" opacity="0.3" />',
      // Left arm — reaching forward aggressively
      '<path d="M -55 -30 Q -80 -20 -90 0" stroke="#8a5a3a" stroke-width="22" fill="none" stroke-linecap="round" />',
      '<circle cx="-92" cy="4" r="14" fill="#8a5a3a" opacity="0.9" />',
      // Right arm — raised with club
      '<path d="M 55 -30 Q 75 -60 65 -90" stroke="#8a5a3a" stroke-width="22" fill="none" stroke-linecap="round" />',
      '<circle cx="63" cy="-94" r="14" fill="#8a5a3a" opacity="0.9" />',
      // Massive club
      '<rect x="55" y="-140" width="16" height="70" rx="3" fill="#5a4030" opacity="0.9" transform="rotate(10, 63, -105)" />',
      '<ellipse cx="63" cy="-145" rx="20" ry="14" fill="#4a3525" opacity="0.9" transform="rotate(10, 63, -145)" />',
      // Club spikes
      '<circle cx="50" cy="-148" r="4" fill="#3a2a1a" opacity="0.7" />',
      '<circle cx="76" cy="-148" r="4" fill="#3a2a1a" opacity="0.7" />',
      '<circle cx="63" cy="-158" r="4" fill="#3a2a1a" opacity="0.7" />',
      // Head — small relative to body (gremlin proportions)
      '<ellipse cx="0" cy="-60" rx="25" ry="22" fill="#8a5a3a" opacity="0.9" />',
      // Angry brow ridge
      '<path d="M -18 -68 L -5 -72 L 5 -72 L 18 -68" stroke="#6a4030" stroke-width="4" fill="none" stroke-linecap="round" />',
      // Furious eyes
      '<ellipse cx="-10" cy="-62" rx="5" ry="4" fill="#ff4422" opacity="0.9" />',
      '<ellipse cx="10" cy="-62" rx="5" ry="4" fill="#ff4422" opacity="0.9" />',
      '<circle cx="-10" cy="-62" r="2.5" fill="#880000" />',
      '<circle cx="10" cy="-62" r="2.5" fill="#880000" />',
      // Snarling mouth
      '<path d="M -12 -50 Q 0 -44 12 -50" stroke="#4a2a1a" stroke-width="2" fill="#3a1a0a" opacity="0.8" />',
      // Teeth
      '<path d="M -8 -50 L -6 -46" stroke="#ddccaa" stroke-width="1.5" opacity="0.7" />',
      '<path d="M 0 -49 L 0 -44" stroke="#ddccaa" stroke-width="1.5" opacity="0.7" />',
      '<path d="M 8 -50 L 6 -46" stroke="#ddccaa" stroke-width="1.5" opacity="0.7" />',
      // Pointed ears
      '<path d="M -22 -65 L -35 -75 L -20 -60" fill="#8a5a3a" opacity="0.8" />',
      '<path d="M 22 -65 L 35 -75 L 20 -60" fill="#8a5a3a" opacity="0.8" />',
      // Rage aura
      '<circle cx="0" cy="-10" r="70" fill="#dd4422" opacity="0.06" />'
    ]
  },
  {
    id: 'lagavulin',
    name: 'Lagavulin',
    color1: '#1a1a22',
    color2: '#08080c',
    accent: '#4466aa',
    glowColor: '#335588',
    // Armored sleeping warrior, heavy helmet, dark iron palette, glowing eyes
    parts: [
      // Body base — hunched heavy armor
      '<path d="M -60 -20 L -55 60 L 55 60 L 60 -20 Z" fill="#3a3a44" opacity="0.9" />',
      // Armor plate layers
      '<path d="M -50 -15 L -48 50 L 48 50 L 50 -15 Z" fill="#2a2a33" opacity="0.7" />',
      '<path d="M -40 0 L -38 40 L 38 40 L 40 0 Z" fill="#333340" opacity="0.5" />',
      // Shoulder pauldrons — massive
      '<ellipse cx="-65" cy="-25" rx="30" ry="22" fill="#4a4a55" opacity="0.8" />',
      '<ellipse cx="65" cy="-25" rx="30" ry="22" fill="#4a4a55" opacity="0.8" />',
      // Pauldron edge detail
      '<path d="M -85 -15 Q -65 -45 -45 -15" stroke="#5a5a66" stroke-width="2" fill="none" opacity="0.5" />',
      '<path d="M 85 -15 Q 65 -45 45 -15" stroke="#5a5a66" stroke-width="2" fill="none" opacity="0.5" />',
      // Heavy helmet
      '<path d="M -30 -80 L -40 -30 L 40 -30 L 30 -80 Z" fill="#4a4a55" opacity="0.9" />',
      // Helmet dome
      '<path d="M -30 -80 Q 0 -105 30 -80" fill="#555566" opacity="0.8" />',
      // Helmet visor slit
      '<rect x="-22" y="-60" width="44" height="8" rx="2" fill="#111118" opacity="0.9" />',
      // Glowing eyes behind visor
      '<ellipse cx="-10" cy="-56" rx="6" ry="3" fill="#4488ff" opacity="0.8" />',
      '<ellipse cx="10" cy="-56" rx="6" ry="3" fill="#4488ff" opacity="0.8" />',
      // Eye glow bleeding through visor
      '<ellipse cx="-10" cy="-56" rx="10" ry="5" fill="#4466aa" opacity="0.2" />',
      '<ellipse cx="10" cy="-56" rx="10" ry="5" fill="#4466aa" opacity="0.2" />',
      // Arms resting on weapon (sleeping pose)
      '<path d="M -60 -15 Q -70 10 -65 35" stroke="#3a3a44" stroke-width="20" fill="none" stroke-linecap="round" />',
      '<path d="M 60 -15 Q 70 10 65 35" stroke="#3a3a44" stroke-width="20" fill="none" stroke-linecap="round" />',
      // Weapon resting across lap — greatsword
      '<rect x="-80" y="30" width="160" height="6" rx="2" fill="#5a5a66" opacity="0.7" />',
      '<path d="M -85 33 L -95 28 L -95 38 Z" fill="#5a5a66" opacity="0.7" />',
      // Cross-guard
      '<rect x="-10" y="25" width="20" height="16" rx="2" fill="#4a4a55" opacity="0.8" />',
      // Iron rivets on armor
      '<circle cx="-35" cy="-10" r="2.5" fill="#5a5a66" opacity="0.5" />',
      '<circle cx="35" cy="-10" r="2.5" fill="#5a5a66" opacity="0.5" />',
      '<circle cx="-35" cy="20" r="2.5" fill="#5a5a66" opacity="0.5" />',
      '<circle cx="35" cy="20" r="2.5" fill="#5a5a66" opacity="0.5" />',
      // Chain mail hint
      '<path d="M -25 5 Q -20 8 -15 5 Q -10 8 -5 5 Q 0 8 5 5 Q 10 8 15 5 Q 20 8 25 5" stroke="#4a4a55" stroke-width="1" fill="none" opacity="0.3" />',
      '<path d="M -25 12 Q -20 15 -15 12 Q -10 15 -5 12 Q 0 15 5 12 Q 10 15 15 12 Q 20 15 25 12" stroke="#4a4a55" stroke-width="1" fill="none" opacity="0.3" />',
      // Sleeping energy — dormant blue mist
      '<ellipse cx="0" cy="55" rx="50" ry="12" fill="#335588" opacity="0.1" />',
      '<circle cx="-20" cy="48" r="2" fill="#4488ff" opacity="0.15" />',
      '<circle cx="25" cy="50" r="1.5" fill="#4488ff" opacity="0.12" />'
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
