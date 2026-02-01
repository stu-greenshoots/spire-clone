#!/usr/bin/env node

/**
 * Generate placeholder card art for Defect character cards.
 * Creates 512x512 WebP images with dark fantasy themed radial gradients.
 * Uses blue/cyan palette to match Defect's character identity.
 *
 * Usage: node scripts/generate-defect-card-art.js
 * Requires: sharp (devDependency)
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Defect card definitions with thematic colors
// Blue/cyan base for Defect, with variation by card type
const CARDS = [
  // Basic / Starter
  { id: 'strike_defect', title: 'Strike', color1: '#1a3366', color2: '#0a1122', accent: '#4488ff', subtitle: 'Basic Attack' },
  { id: 'defend_defect', title: 'Defend', color1: '#1a4466', color2: '#0a1522', accent: '#44aaff', subtitle: 'Basic Skill' },
  { id: 'zap', title: 'Zap', color1: '#334466', color2: '#111522', accent: '#66aaff', subtitle: 'Basic Skill' },
  { id: 'dualcast', title: 'Dualcast', color1: '#2a3366', color2: '#0d1122', accent: '#5588ff', subtitle: 'Basic Skill' },

  // Common Attacks
  { id: 'ballLightning', title: 'Ball Lightning', color1: '#2a4466', color2: '#0d1522', accent: '#55aaff', subtitle: 'Common Attack' },
  { id: 'coldSnap', title: 'Cold Snap', color1: '#1a4477', color2: '#0a1528', accent: '#44bbee', subtitle: 'Common Attack' },
  { id: 'beamCell', title: 'Beam Cell', color1: '#334477', color2: '#111528', accent: '#66bbee', subtitle: 'Common Attack' },
  { id: 'compileDrive', title: 'Compile Driver', color1: '#2a3377', color2: '#0d1128', accent: '#5599ee', subtitle: 'Common Attack' },
  { id: 'sweepingBeam', title: 'Sweeping Beam', color1: '#1a3377', color2: '#0a1128', accent: '#4499ee', subtitle: 'Common Attack' },

  // Common Skills
  { id: 'coolheaded', title: 'Coolheaded', color1: '#1a4488', color2: '#0a1530', accent: '#44bbff', subtitle: 'Common Skill' },
  { id: 'chargeUp', title: 'Charge Battery', color1: '#2a4488', color2: '#0d1530', accent: '#55bbff', subtitle: 'Common Skill' },
  { id: 'leapDefect', title: 'Leap', color1: '#1a3388', color2: '#0a1130', accent: '#4499ff', subtitle: 'Common Skill' },
  { id: 'steamBarrier', title: 'Steam Barrier', color1: '#334488', color2: '#111530', accent: '#66bbff', subtitle: 'Common Skill' },
  { id: 'stackDefect', title: 'Stack', color1: '#2a3388', color2: '#0d1130', accent: '#5599ff', subtitle: 'Common Skill' },

  // Uncommon Attacks
  { id: 'doom', title: 'Doom and Gloom', color1: '#223366', color2: '#0b1122', accent: '#5577cc', subtitle: 'Uncommon Attack' },
  { id: 'blizzard', title: 'Blizzard', color1: '#224477', color2: '#0b1528', accent: '#55aadd', subtitle: 'Uncommon Attack' },
  { id: 'ftl', title: 'FTL', color1: '#333377', color2: '#111128', accent: '#6699dd', subtitle: 'Uncommon Attack' },
  { id: 'sunder', title: 'Sunder', color1: '#2a3366', color2: '#0d1122', accent: '#5588cc', subtitle: 'Uncommon Attack' },
  { id: 'rip', title: 'Rip and Tear', color1: '#333366', color2: '#111122', accent: '#6688cc', subtitle: 'Uncommon Attack' },

  // Uncommon Skills
  { id: 'glacier', title: 'Glacier', color1: '#224488', color2: '#0b1530', accent: '#55bbee', subtitle: 'Uncommon Skill' },
  { id: 'consume', title: 'Consume', color1: '#2a3388', color2: '#0d1130', accent: '#55aaee', subtitle: 'Uncommon Skill' },
  { id: 'equilibrium', title: 'Equilibrium', color1: '#224466', color2: '#0b1522', accent: '#55aacc', subtitle: 'Uncommon Skill' },

  // Uncommon Powers
  { id: 'defragment', title: 'Defragment', color1: '#2a4477', color2: '#0d1528', accent: '#55bbdd', subtitle: 'Uncommon Power' },
  { id: 'capacitor', title: 'Capacitor', color1: '#334477', color2: '#111528', accent: '#66bbdd', subtitle: 'Uncommon Power' },

  // Rare Attacks
  { id: 'hyperbeam', title: 'Hyperbeam', color1: '#334488', color2: '#111530', accent: '#77ccff', subtitle: 'Rare Attack' },
  { id: 'meteorStrike', title: 'Meteor Strike', color1: '#443366', color2: '#181122', accent: '#aa88ff', subtitle: 'Rare Attack' },

  // Rare Skills
  { id: 'seek', title: 'Seek', color1: '#224488', color2: '#0b1530', accent: '#66ccff', subtitle: 'Rare Skill' },

  // Rare Powers
  { id: 'creativeAI', title: 'Creative AI', color1: '#334488', color2: '#111530', accent: '#88ccff', subtitle: 'Rare Power' },
  { id: 'echoForm', title: 'Echo Form', color1: '#443388', color2: '#181130', accent: '#9988ff', subtitle: 'Rare Power' },
  { id: 'electrodynamics', title: 'Electrodynamics', color1: '#443377', color2: '#181128', accent: '#9977ee', subtitle: 'Rare Power' },
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

  console.log(`Generating ${CARDS.length} Defect card art images...`);

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
  <text x="256" y="310" text-anchor="middle" font-family="sans-serif" font-size="12" fill="${card.accent}" opacity="0.3">The Defect</text>
</svg>`;

    const outPath = path.join(outDir, `${card.id}.webp`);
    await sharp(Buffer.from(svg))
      .webp({ quality: 80 })
      .toFile(outPath);

    console.log(`  Generated: ${card.id}.webp`);
  }

  console.log(`\nDone! ${CARDS.length} Defect card images in src/assets/art/cards/`);
  console.log('Next: run `node scripts/generate-sprite-sheets.js --type=cards` to rebuild sprite sheet');
}

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

main().catch(err => { console.error(err); process.exit(1); });
