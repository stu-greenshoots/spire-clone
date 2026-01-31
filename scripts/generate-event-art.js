#!/usr/bin/env node

/**
 * Generate placeholder event art for Act 3 reality fracture events.
 * Creates 512x512 WebP images with dark fantasy themed radial gradients.
 *
 * Usage: node scripts/generate-event-art.js
 * Requires: sharp (devDependency)
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const EVENTS = [
  { id: 'reality_seam', title: 'Reality Seam', color1: '#4400aa', color2: '#110033', accent: '#8866ff' },
  { id: 'dissolving_pattern', title: 'The Dissolving', color1: '#006644', color2: '#001a11', accent: '#44ffaa' },
  { id: 'core_echo', title: 'Core Echo', color1: '#aa4400', color2: '#331100', accent: '#ff8844' },
  { id: 'identity_fork', title: 'Identity Fork', color1: '#660044', color2: '#1a0011', accent: '#cc44aa' },
  { id: 'war_memory', title: 'War Remembers', color1: '#444400', color2: '#111100', accent: '#aaaa44' },
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

  const outDir = path.join(__dirname, '..', 'src', 'assets', 'art', 'events');

  for (const event of EVENTS) {
    // Create SVG with radial gradient and text
    const svg = `<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="${event.color1}" />
      <stop offset="100%" stop-color="${event.color2}" />
    </radialGradient>
    <radialGradient id="glow" cx="50%" cy="40%" r="40%">
      <stop offset="0%" stop-color="${event.accent}" stop-opacity="0.3" />
      <stop offset="100%" stop-color="${event.accent}" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#bg)" />
  <rect width="${SIZE}" height="${SIZE}" fill="url(#glow)" />
  <text x="256" y="240" text-anchor="middle" font-family="serif" font-size="36" font-weight="bold" fill="${event.accent}" opacity="0.8">${event.title}</text>
  <text x="256" y="290" text-anchor="middle" font-family="serif" font-size="16" fill="${event.accent}" opacity="0.5">Act 3 Event</text>
</svg>`;

    const outPath = path.join(outDir, `${event.id}.webp`);
    await sharp(Buffer.from(svg))
      .webp({ quality: 80 })
      .toFile(outPath);

    console.log(`Generated: ${event.id}.webp`);
  }

  console.log(`\nDone! ${EVENTS.length} event images in src/assets/art/events/`);
}

main().catch(err => { console.error(err); process.exit(1); });
