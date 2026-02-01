#!/usr/bin/env node

/**
 * Generate placeholder card art for Silent character cards.
 * Creates 512x512 WebP images with dark fantasy themed radial gradients.
 * Uses green/teal palette to match Silent's character identity.
 *
 * Usage: node scripts/generate-silent-card-art.js
 * Requires: sharp (devDependency)
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Silent card definitions with thematic colors
// Green/teal base for Silent, with variation by card type
const CARDS = [
  // Basic / Starter
  { id: 'shiv', title: 'Shiv', color1: '#006633', color2: '#001a0d', accent: '#44ff88', subtitle: 'Token Attack' },
  { id: 'strike_silent', title: 'Strike', color1: '#004433', color2: '#001111', accent: '#33cc77', subtitle: 'Basic Attack' },
  { id: 'defend_silent', title: 'Defend', color1: '#003344', color2: '#000d11', accent: '#33aacc', subtitle: 'Basic Skill' },
  { id: 'neutralize', title: 'Neutralize', color1: '#335544', color2: '#0d1a11', accent: '#66cc88', subtitle: 'Starter Attack' },
  { id: 'survivor', title: 'Survivor', color1: '#334455', color2: '#0d1118', accent: '#6699bb', subtitle: 'Starter Skill' },

  // Common Attacks
  { id: 'daggerSpray', title: 'Dagger Spray', color1: '#226633', color2: '#0a1a0d', accent: '#55ff99', subtitle: 'Common Attack' },
  { id: 'daggerThrow', title: 'Dagger Throw', color1: '#226644', color2: '#0a1a11', accent: '#44ee88', subtitle: 'Common Attack' },
  { id: 'flyingKnee', title: 'Flying Knee', color1: '#336633', color2: '#111a0d', accent: '#66ff88', subtitle: 'Common Attack' },
  { id: 'poisonedStab', title: 'Poisoned Stab', color1: '#116633', color2: '#051a0d', accent: '#33ff77', subtitle: 'Common Attack' },
  { id: 'quickSlash', title: 'Quick Slash', color1: '#227744', color2: '#0a1f11', accent: '#44ffaa', subtitle: 'Common Attack' },

  // Common Skills
  { id: 'acrobatics', title: 'Acrobatics', color1: '#225566', color2: '#0a1518', accent: '#44bbdd', subtitle: 'Common Skill' },
  { id: 'backflip', title: 'Backflip', color1: '#226655', color2: '#0a1a15', accent: '#44ddbb', subtitle: 'Common Skill' },
  { id: 'bladeDance', title: 'Blade Dance', color1: '#336655', color2: '#111a15', accent: '#66ddaa', subtitle: 'Common Skill' },
  { id: 'deadlyPoison', title: 'Deadly Poison', color1: '#116644', color2: '#051a11', accent: '#33dd88', subtitle: 'Common Skill' },
  { id: 'dodgeAndRoll', title: 'Dodge and Roll', color1: '#225566', color2: '#0a1518', accent: '#44aacc', subtitle: 'Common Skill' },

  // Uncommon
  { id: 'dash', title: 'Dash', color1: '#337755', color2: '#111f15', accent: '#66eebb', subtitle: 'Uncommon' },
  { id: 'legSweep', title: 'Leg Sweep', color1: '#336655', color2: '#111a15', accent: '#66ccaa', subtitle: 'Uncommon' },
  { id: 'noxiousFumes', title: 'Noxious Fumes', color1: '#227733', color2: '#0a1f0d', accent: '#44ee66', subtitle: 'Uncommon Power' },
  { id: 'footwork', title: 'Footwork', color1: '#226677', color2: '#0a1a1f', accent: '#44ccee', subtitle: 'Uncommon Power' },
  { id: 'predator', title: 'Predator', color1: '#336644', color2: '#111a11', accent: '#66cc88', subtitle: 'Uncommon Attack' },
  { id: 'flechettes', title: 'Flechettes', color1: '#447755', color2: '#181f15', accent: '#88eebb', subtitle: 'Uncommon Attack' },
  { id: 'backstab', title: 'Backstab', color1: '#224433', color2: '#0a110d', accent: '#449966', subtitle: 'Uncommon Attack' },
  { id: 'cloakAndDagger', title: 'Cloak and Dagger', color1: '#334466', color2: '#0d1118', accent: '#6688cc', subtitle: 'Uncommon Skill' },
  { id: 'finisher', title: 'Finisher', color1: '#446644', color2: '#181a11', accent: '#88cc88', subtitle: 'Uncommon Attack' },
  { id: 'wellLaidPlans', title: 'Well-Laid Plans', color1: '#335566', color2: '#111518', accent: '#66aacc', subtitle: 'Uncommon Power' },

  // Rare
  { id: 'aThousandCuts', title: 'A Thousand Cuts', color1: '#448844', color2: '#182218', accent: '#88ff88', subtitle: 'Rare Power' },
  { id: 'adrenaline', title: 'Adrenaline', color1: '#559955', color2: '#1a2a1a', accent: '#99ffaa', subtitle: 'Rare Skill' },
  { id: 'bulletTime', title: 'Bullet Time', color1: '#446688', color2: '#111a22', accent: '#88aaff', subtitle: 'Rare Skill' },
  { id: 'corpseExplosion', title: 'Corpse Explosion', color1: '#664433', color2: '#1a110d', accent: '#cc8866', subtitle: 'Rare Skill' },
  { id: 'envenom', title: 'Envenom', color1: '#448833', color2: '#18220d', accent: '#88ff66', subtitle: 'Rare Power' },
  { id: 'glassKnife', title: 'Glass Knife', color1: '#448888', color2: '#182222', accent: '#88ffff', subtitle: 'Rare Attack' },
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

  console.log(`Generating ${CARDS.length} Silent card art images...`);

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
  <text x="256" y="310" text-anchor="middle" font-family="sans-serif" font-size="12" fill="${card.accent}" opacity="0.3">The Silent</text>
</svg>`;

    const outPath = path.join(outDir, `${card.id}.webp`);
    await sharp(Buffer.from(svg))
      .webp({ quality: 80 })
      .toFile(outPath);

    console.log(`  Generated: ${card.id}.webp`);
  }

  console.log(`\nDone! ${CARDS.length} Silent card images in src/assets/art/cards/`);
  console.log('Next: run `node scripts/generate-sprite-sheets.js --type=cards` to rebuild sprite sheet');
}

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

main().catch(err => { console.error(err); process.exit(1); });
