#!/usr/bin/env node

/**
 * Generate character portrait art for character selection screen.
 * Creates 512x512 WebP images with dark fantasy themed character silhouettes.
 *
 * Usage: node scripts/generate-character-art.js
 * Requires: sharp (devDependency)
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CHARACTERS = [
  {
    id: 'ironclad',
    title: 'The Ironclad',
    subtitle: 'Strength &amp; Fury',
    color1: '#8b2222',
    color2: '#1a0808',
    accent: '#ff4444',
    // Warrior silhouette — broad shoulders, heavy armor, sword
    silhouetteFill: '#cc3333',
    silhouetteParts: [
      '<rect x="-40" y="-80" width="80" height="120" rx="8" />',
      '<circle cx="0" cy="-110" r="35" />',
      '<rect x="-65" y="-80" width="130" height="30" rx="10" />',
      '<rect x="55" y="-140" width="8" height="160" rx="2" fill="#cc8844" opacity="0.7" />',
      '<rect x="45" y="-145" width="28" height="8" rx="2" fill="#cc8844" opacity="0.7" />',
      '<ellipse cx="-55" cy="-30" rx="25" ry="35" fill="#993333" opacity="0.5" />'
    ]
  },
  {
    id: 'silent',
    title: 'The Silent',
    subtitle: 'Poison &amp; Daggers',
    color1: '#1a5a2e',
    color2: '#0a1a0f',
    accent: '#44dd88',
    // Assassin silhouette — hooded, lean, dual daggers
    silhouetteFill: '#2d8a4e',
    silhouetteParts: [
      '<rect x="-30" y="-75" width="60" height="110" rx="8" />',
      '<path d="M -30 -80 Q -35 -130 0 -145 Q 35 -130 30 -80 Z" />',
      '<path d="M -10 -145 Q 0 -160 10 -145 Z" opacity="0.8" />',
      '<rect x="-50" y="-75" width="100" height="20" rx="8" />',
      '<rect x="-60" y="-100" width="5" height="80" rx="1" transform="rotate(-15, -60, -60)" fill="#88ddaa" opacity="0.6" />',
      '<rect x="55" y="-100" width="5" height="80" rx="1" transform="rotate(15, 55, -60)" fill="#88ddaa" opacity="0.6" />',
      '<path d="M -30 35 Q -50 60 -40 90 L 40 90 Q 50 60 30 35 Z" opacity="0.4" />'
    ]
  },
  {
    id: 'defect',
    title: 'The Defect',
    subtitle: 'Orbs &amp; Energy',
    color1: '#224488',
    color2: '#0a1533',
    accent: '#66bbff',
    // Automaton silhouette — angular body, orbiting orbs, crystalline
    silhouetteFill: '#3377bb',
    silhouetteParts: [
      '<rect x="-35" y="-70" width="70" height="100" rx="4" />',
      '<rect x="-30" y="-110" width="60" height="45" rx="3" />',
      '<rect x="-20" y="-120" width="40" height="15" rx="2" opacity="0.8" />',
      '<rect x="-50" y="-65" width="100" height="20" rx="6" />',
      '<circle cx="-55" cy="-20" r="12" fill="#66bbff" opacity="0.5" />',
      '<circle cx="55" cy="-20" r="12" fill="#ffdd44" opacity="0.5" />',
      '<circle cx="0" cy="-140" r="10" fill="#9944cc" opacity="0.5" />',
      '<rect x="-25" y="30" width="20" height="50" rx="3" opacity="0.6" />',
      '<rect x="5" y="30" width="20" height="50" rx="3" opacity="0.6" />'
    ]
  },
  {
    id: 'watcher',
    title: 'The Watcher',
    subtitle: 'Stances &amp; Divinity',
    color1: '#4a2266',
    color2: '#1a0a22',
    accent: '#cc88ff',
    // Monk silhouette — meditative pose, third eye, flowing robes
    silhouetteFill: '#8844bb',
    silhouetteParts: [
      '<rect x="-28" y="-70" width="56" height="100" rx="10" />',
      '<circle cx="0" cy="-100" r="30" />',
      '<circle cx="0" cy="-115" r="5" fill="#ffdd44" opacity="0.7" />',
      '<path d="M -28 -65 Q -50 -40 -45 10 L -28 10 Z" opacity="0.5" />',
      '<path d="M 28 -65 Q 50 -40 45 10 L 28 10 Z" opacity="0.5" />',
      '<path d="M -35 30 Q -55 70 -50 90 L 50 90 Q 55 70 35 30 Z" opacity="0.4" />',
      '<circle cx="-40" cy="-10" r="8" fill="#ffdd44" opacity="0.3" />',
      '<circle cx="40" cy="-10" r="8" fill="#ff6644" opacity="0.3" />'
    ]
  }
];

const SIZE = 512;

async function main() {
  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch {
    console.error('ERROR: sharp not installed. Run: npm install');
    process.exit(1);
  }

  const outDir = path.join(__dirname, '..', 'src', 'assets', 'art', 'characters');

  for (const char of CHARACTERS) {
    const svg = `<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="50%" cy="45%" r="70%">
      <stop offset="0%" stop-color="${char.color1}" />
      <stop offset="100%" stop-color="${char.color2}" />
    </radialGradient>
    <radialGradient id="glow" cx="50%" cy="35%" r="35%">
      <stop offset="0%" stop-color="${char.accent}" stop-opacity="0.25" />
      <stop offset="100%" stop-color="${char.accent}" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="vignette" cx="50%" cy="50%" r="50%">
      <stop offset="60%" stop-color="black" stop-opacity="0" />
      <stop offset="100%" stop-color="black" stop-opacity="0.6" />
    </radialGradient>
  </defs>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#bg)" />
  <rect width="${SIZE}" height="${SIZE}" fill="url(#glow)" />
  <g transform="translate(256, 280)" fill="${char.silhouetteFill}" opacity="0.6">
    ${char.silhouetteParts.join('\n    ')}
  </g>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#vignette)" />
  <text x="256" y="430" text-anchor="middle" font-family="serif" font-size="32" font-weight="bold" fill="${char.accent}" opacity="0.9">${char.title}</text>
  <text x="256" y="465" text-anchor="middle" font-family="serif" font-size="16" fill="${char.accent}" opacity="0.5">${char.subtitle}</text>
</svg>`;

    const outPath = path.join(outDir, `${char.id}.webp`);
    await sharp(Buffer.from(svg))
      .webp({ quality: 85 })
      .toFile(outPath);

    console.log(`Generated: ${char.id}.webp`);
  }

  console.log(`\nDone! ${CHARACTERS.length} character images in src/assets/art/characters/`);
}

main().catch(err => { console.error(err); process.exit(1); });
