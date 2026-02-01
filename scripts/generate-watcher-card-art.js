#!/usr/bin/env node

/**
 * Generate placeholder card art for Watcher character cards.
 * Creates 512x512 WebP images with dark fantasy themed radial gradients.
 * Uses purple/gold palette to match Watcher's character identity.
 *
 * Usage: node scripts/generate-watcher-card-art.js
 * Requires: sharp (devDependency)
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Watcher card definitions with thematic colors
// Purple/gold base for Watcher, with variation by card type and rarity
const CARDS = [
  // Basic / Starter
  { id: 'strike_watcher', title: 'Strike', color1: '#4a2266', color2: '#1a0a22', accent: '#cc88ff', subtitle: 'Basic Attack' },
  { id: 'defend_watcher', title: 'Defend', color1: '#3a2266', color2: '#150a22', accent: '#bb88ff', subtitle: 'Basic Skill' },
  { id: 'eruption', title: 'Eruption', color1: '#662233', color2: '#220a11', accent: '#ff6644', subtitle: 'Basic Attack' },
  { id: 'vigilance', title: 'Vigilance', color1: '#334466', color2: '#111522', accent: '#88aadd', subtitle: 'Basic Skill' },

  // Common Attacks
  { id: 'bowlingBash', title: 'Bowling Bash', color1: '#4a2255', color2: '#1a0a1e', accent: '#cc77ee', subtitle: 'Common Attack' },
  { id: 'crushJoints', title: 'Crush Joints', color1: '#552244', color2: '#1e0a18', accent: '#dd77cc', subtitle: 'Common Attack' },
  { id: 'flurryOfBlows', title: 'Flurry of Blows', color1: '#4a2244', color2: '#1a0a18', accent: '#cc77cc', subtitle: 'Common Attack' },
  { id: 'followUp', title: 'Follow-Up', color1: '#442255', color2: '#180a1e', accent: '#bb77ee', subtitle: 'Common Attack' },
  { id: 'sashWhip', title: 'Sash Whip', color1: '#552255', color2: '#1e0a1e', accent: '#dd77dd', subtitle: 'Common Attack' },

  // Common Skills
  { id: 'halt', title: 'Halt', color1: '#3a2266', color2: '#150a22', accent: '#aa88ff', subtitle: 'Common Skill' },
  { id: 'emptyMind', title: 'Empty Mind', color1: '#332266', color2: '#110a22', accent: '#9988ff', subtitle: 'Common Skill' },
  { id: 'crescendo', title: 'Crescendo', color1: '#662244', color2: '#220a18', accent: '#ff77cc', subtitle: 'Common Skill' },
  { id: 'tranquility', title: 'Tranquility', color1: '#224466', color2: '#0a1522', accent: '#66aadd', subtitle: 'Common Skill' },
  { id: 'prostrate', title: 'Prostrate', color1: '#444422', color2: '#18180a', accent: '#dddd66', subtitle: 'Common Skill' },
  { id: 'protectingLight', title: 'Protecting Light', color1: '#445533', color2: '#181e11', accent: '#bbdd88', subtitle: 'Common Skill' },

  // Uncommon Attacks
  { id: 'wallop', title: 'Wallop', color1: '#553355', color2: '#1e111e', accent: '#dd99dd', subtitle: 'Uncommon Attack' },
  { id: 'tantrum', title: 'Tantrum', color1: '#663333', color2: '#221111', accent: '#ff8888', subtitle: 'Uncommon Attack' },
  { id: 'reachHeaven', title: 'Reach Heaven', color1: '#554433', color2: '#1e1811', accent: '#ddbb88', subtitle: 'Uncommon Attack' },
  { id: 'throughViolence', title: 'Through Violence', color1: '#553344', color2: '#1e1118', accent: '#dd88bb', subtitle: 'Uncommon Attack' },
  { id: 'fearNoEvil', title: 'Fear No Evil', color1: '#334455', color2: '#11181e', accent: '#88bbdd', subtitle: 'Uncommon Attack' },

  // Uncommon Skills
  { id: 'worship', title: 'Worship', color1: '#554422', color2: '#1e180a', accent: '#ddbb55', subtitle: 'Uncommon Skill' },
  { id: 'thirdEye', title: 'Third Eye', color1: '#443366', color2: '#181122', accent: '#bb88ff', subtitle: 'Uncommon Skill' },
  { id: 'deceiveReality', title: 'Deceive Reality', color1: '#334455', color2: '#11181e', accent: '#88bbdd', subtitle: 'Uncommon Skill' },
  { id: 'safety', title: 'Safety', color1: '#335544', color2: '#111e18', accent: '#88ddbb', subtitle: 'Uncommon Skill' },

  // Uncommon Power
  { id: 'mentalFortress', title: 'Mental Fortress', color1: '#444466', color2: '#181822', accent: '#bbbbff', subtitle: 'Uncommon Power' },

  // Rare Attacks
  { id: 'ragnarok', title: 'Ragnarok', color1: '#663344', color2: '#221118', accent: '#ff88bb', subtitle: 'Rare Attack' },
  { id: 'brilliance', title: 'Brilliance', color1: '#665522', color2: '#221e0a', accent: '#ffdd66', subtitle: 'Rare Attack' },

  // Rare Skills
  { id: 'blasphemy', title: 'Blasphemy', color1: '#662222', color2: '#220a0a', accent: '#ff6666', subtitle: 'Rare Skill' },
  { id: 'wish', title: 'Wish', color1: '#556633', color2: '#1e2211', accent: '#ccff88', subtitle: 'Rare Skill' },

  // Rare Power
  { id: 'devaForm', title: 'Deva Form', color1: '#665533', color2: '#221e11', accent: '#ffcc88', subtitle: 'Rare Power' },

  // Generated Card
  { id: 'miracle', title: 'Miracle', color1: '#555522', color2: '#1e1e0a', accent: '#eeee77', subtitle: 'Generated Skill' },
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

  const outDir = path.join(__dirname, '..', 'src', 'assets', 'art', 'cards');

  console.log(`Generating ${CARDS.length} Watcher card art images...`);

  for (const card of CARDS) {
    const svg = `<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="${card.color1}" />
      <stop offset="100%" stop-color="${card.color2}" />
    </radialGradient>
    <radialGradient id="glow" cx="50%" cy="35%" r="35%">
      <stop offset="0%" stop-color="${card.accent}" stop-opacity="0.25" />
      <stop offset="100%" stop-color="${card.accent}" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="vignette" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="black" stop-opacity="0.3" />
      <stop offset="40%" stop-color="black" stop-opacity="0" />
      <stop offset="70%" stop-color="black" stop-opacity="0" />
      <stop offset="100%" stop-color="black" stop-opacity="0.5" />
    </linearGradient>
  </defs>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#bg)" />
  <rect width="${SIZE}" height="${SIZE}" fill="url(#glow)" />
  <rect width="${SIZE}" height="${SIZE}" fill="url(#vignette)" />
  <text x="256" y="230" text-anchor="middle" font-family="serif" font-size="32" font-weight="bold" fill="${card.accent}" opacity="0.85">${escapeXml(card.title)}</text>
  <text x="256" y="275" text-anchor="middle" font-family="serif" font-size="16" fill="${card.accent}" opacity="0.5">${card.subtitle}</text>
  <text x="256" y="310" text-anchor="middle" font-family="sans-serif" font-size="12" fill="${card.accent}" opacity="0.3">The Watcher</text>
</svg>`;

    const outPath = path.join(outDir, `${card.id}.webp`);
    await sharp(Buffer.from(svg))
      .webp({ quality: 80 })
      .toFile(outPath);

    console.log(`  Generated: ${card.id}.webp`);
  }

  console.log(`\nDone! ${CARDS.length} Watcher card images in src/assets/art/cards/`);
  console.log('Next: run `node scripts/generate-sprite-sheets.js --type=cards` to rebuild sprite sheet');
}

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

main().catch(err => { console.error(err); process.exit(1); });
