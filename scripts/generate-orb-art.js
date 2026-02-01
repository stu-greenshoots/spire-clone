#!/usr/bin/env node

/**
 * Generate orb art for The Defect's orb system.
 * Creates 128x128 WebP images for each orb type (lightning, frost, dark, plasma).
 *
 * Usage: node scripts/generate-orb-art.js
 * Requires: sharp (devDependency)
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ORBS = [
  {
    id: 'lightning',
    color1: '#ffee66',
    color2: '#cc8800',
    accent: '#ffffff',
    symbol: '⚡'
  },
  {
    id: 'frost',
    color1: '#88ddff',
    color2: '#2266aa',
    accent: '#ffffff',
    symbol: '❄'
  },
  {
    id: 'dark',
    color1: '#bb66ee',
    color2: '#440066',
    accent: '#ddaaff',
    symbol: '◉'
  },
  {
    id: 'plasma',
    color1: '#ff8855',
    color2: '#aa2200',
    accent: '#ffddaa',
    symbol: '✦'
  }
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

  const outDir = path.join(__dirname, '..', 'src', 'assets', 'art', 'orbs');
  mkdirSync(outDir, { recursive: true });

  console.log(`Generating ${ORBS.length} orb art images...`);

  for (const orb of ORBS) {
    const svg = `<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="35%" cy="35%" r="55%">
      <stop offset="0%" stop-color="${orb.color1}" />
      <stop offset="100%" stop-color="${orb.color2}" />
    </radialGradient>
    <radialGradient id="highlight" cx="30%" cy="25%" r="30%">
      <stop offset="0%" stop-color="${orb.accent}" stop-opacity="0.5" />
      <stop offset="100%" stop-color="${orb.accent}" stop-opacity="0" />
    </radialGradient>
  </defs>
  <circle cx="64" cy="64" r="58" fill="url(#bg)" />
  <circle cx="64" cy="64" r="58" fill="url(#highlight)" />
  <circle cx="64" cy="64" r="58" fill="none" stroke="${orb.color2}" stroke-width="3" opacity="0.5" />
  <text x="64" y="76" text-anchor="middle" font-size="36" fill="${orb.accent}" opacity="0.8">${orb.symbol}</text>
</svg>`;

    const outPath = path.join(outDir, `${orb.id}.webp`);
    await sharp(Buffer.from(svg))
      .webp({ quality: 85 })
      .toFile(outPath);

    console.log(`  Generated: ${orb.id}.webp`);
  }

  console.log(`\nDone! ${ORBS.length} orb images in src/assets/art/orbs/`);
}

main().catch(err => { console.error(err); process.exit(1); });
