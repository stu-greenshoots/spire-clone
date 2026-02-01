#!/usr/bin/env node

/**
 * Generate stance visual indicator art for Watcher.
 * Creates 128x128 WebP images for each stance type.
 *
 * Usage: node scripts/generate-stance-art.js
 * Requires: sharp (devDependency)
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const STANCES = [
  {
    id: 'calm',
    title: 'Calm',
    color1: '#1a4466',
    color2: '#0a1522',
    accent: '#44aadd',
    glowColor: '#66ccff',
    // Serene water ripple pattern
    shapes: [
      '<circle cx="64" cy="64" r="40" fill="none" stroke="#44aadd" stroke-width="1.5" opacity="0.4" />',
      '<circle cx="64" cy="64" r="28" fill="none" stroke="#66ccff" stroke-width="1" opacity="0.5" />',
      '<circle cx="64" cy="64" r="16" fill="#44aadd" opacity="0.3" />',
      '<circle cx="64" cy="64" r="6" fill="#88ddff" opacity="0.7" />',
    ]
  },
  {
    id: 'wrath',
    title: 'Wrath',
    color1: '#662222',
    color2: '#220808',
    accent: '#ff4444',
    glowColor: '#ff6622',
    // Angry flame burst
    shapes: [
      '<path d="M 64 20 Q 50 45 64 50 Q 78 45 64 20" fill="#ff4444" opacity="0.6" />',
      '<path d="M 40 35 Q 48 55 64 60 Q 80 55 88 35 Q 76 50 64 45 Q 52 50 40 35" fill="#ff6622" opacity="0.5" />',
      '<path d="M 30 60 Q 45 70 64 75 Q 83 70 98 60 Q 85 80 64 85 Q 43 80 30 60" fill="#ff4444" opacity="0.4" />',
      '<circle cx="64" cy="64" r="15" fill="#ff8844" opacity="0.5" />',
      '<circle cx="64" cy="64" r="6" fill="#ffcc44" opacity="0.8" />',
    ]
  },
  {
    id: 'divinity',
    title: 'Divinity',
    color1: '#665522',
    color2: '#221a08',
    accent: '#ffdd44',
    glowColor: '#ffee88',
    // Radiant divine halo
    shapes: [
      '<circle cx="64" cy="64" r="45" fill="none" stroke="#ffdd44" stroke-width="2" opacity="0.5" />',
      '<circle cx="64" cy="64" r="35" fill="none" stroke="#ffee88" stroke-width="1.5" opacity="0.4" />',
      '<line x1="64" y1="10" x2="64" y2="118" stroke="#ffdd44" stroke-width="1" opacity="0.3" />',
      '<line x1="10" y1="64" x2="118" y2="64" stroke="#ffdd44" stroke-width="1" opacity="0.3" />',
      '<line x1="25" y1="25" x2="103" y2="103" stroke="#ffee88" stroke-width="0.8" opacity="0.2" />',
      '<line x1="103" y1="25" x2="25" y2="103" stroke="#ffee88" stroke-width="0.8" opacity="0.2" />',
      '<circle cx="64" cy="64" r="18" fill="#ffdd44" opacity="0.4" />',
      '<circle cx="64" cy="64" r="8" fill="#ffffcc" opacity="0.8" />',
    ]
  },
];

const SIZE = 128;

async function main() {
  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch {
    console.error('ERROR: sharp not installed. Run: npm install');
    process.exit(1);
  }

  const outDir = path.join(__dirname, '..', 'src', 'assets', 'art', 'stances');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  console.log(`Generating ${STANCES.length} stance indicator images...`);

  for (const stance of STANCES) {
    const svg = `<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="${stance.color1}" />
      <stop offset="100%" stop-color="${stance.color2}" />
    </radialGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="40%">
      <stop offset="0%" stop-color="${stance.glowColor}" stop-opacity="0.3" />
      <stop offset="100%" stop-color="${stance.glowColor}" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#bg)" />
  <rect width="${SIZE}" height="${SIZE}" fill="url(#glow)" />
  ${stance.shapes.join('\n  ')}
</svg>`;

    const outPath = path.join(outDir, `${stance.id}.webp`);
    await sharp(Buffer.from(svg))
      .webp({ quality: 85 })
      .toFile(outPath);

    console.log(`  Generated: ${stance.id}.webp`);
  }

  console.log(`\nDone! ${STANCES.length} stance images in src/assets/art/stances/`);
}

main().catch(err => { console.error(err); process.exit(1); });
