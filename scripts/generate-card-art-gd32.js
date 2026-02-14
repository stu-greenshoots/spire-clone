#!/usr/bin/env node

/**
 * GD-32: Card Art Batch 1 — Replace 25 placeholder cards with DALL-E art
 *
 * Targets the 25 smallest placeholder cards (<10KB), prioritizing
 * rares and uncommons for maximum visual impact.
 *
 * Usage: node scripts/generate-card-art-gd32.js
 * Reads OPENAI_API_KEY from .env
 *
 * Requirements:
 * - OpenAI API key with DALL-E access
 * - sharp (devDependency)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
}

const OPENAI_KEY = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY;
if (!OPENAI_KEY) {
  console.error('Error: OPENAI_API_KEY not found in environment or .env file');
  process.exit(1);
}

const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'assets', 'art', 'cards');

// 25 highest-priority placeholder cards to replace
// Selected: smallest files first, rares/uncommons prioritized
const CARDS_TO_GENERATE = [
  // === DEFECT RARES (3) ===
  {
    id: 'echoForm',
    name: 'Echo Form',
    character: 'defect',
    prompt: 'A robotic entity surrounded by ghostly afterimages of itself, each echo repeating the last action, recursive blue energy loops, mechanical duplication effect, dark fantasy cybernetic theme'
  },
  {
    id: 'meteorStrike',
    name: 'Meteor Strike',
    character: 'defect',
    prompt: 'A massive flaming meteor crashing down from above, channeling plasma orb energy, fiery impact with blue and orange collision, devastating cosmic attack, dark fantasy space destruction'
  },
  {
    id: 'electrodynamics',
    name: 'Electrodynamics',
    character: 'defect',
    prompt: 'Lightning orbs arcing electricity between all enemies simultaneously, chain lightning effect, blue electric web of destruction, robotic power amplification, dark fantasy energy storm'
  },

  // === WATCHER RARES (4) ===
  {
    id: 'wish',
    name: 'Wish',
    character: 'watcher',
    prompt: 'A monk making a wish upon a radiant golden star, divine light granting power, purple and gold wish fulfillment energy, transcendent spiritual desire, dark fantasy miracle'
  },
  {
    id: 'ragnarok',
    name: 'Ragnarok',
    character: 'watcher',
    prompt: 'A monk channeling cosmic energy, multiple energy beams raining from the sky like divine judgment, purple and red celestial power, spiritual transcendence'
  },
  {
    id: 'blasphemy',
    name: 'Blasphemy',
    character: 'watcher',
    prompt: 'A monk shattering divine rules, entering a forbidden stance of ultimate power with death as consequence, purple and crimson forbidden energy, cracking reality, dark fantasy sacrilege'
  },
  {
    id: 'devaForm',
    name: 'Deva Form',
    character: 'watcher',
    prompt: 'A monk ascending to divine form, multiple arms appearing like a deity, golden radiance and purple mantra energy spiraling upward, transcendent enlightenment, dark fantasy apotheosis'
  },

  // === SILENT RARES (4) ===
  {
    id: 'adrenaline',
    name: 'Adrenaline',
    character: 'silent',
    prompt: 'A surge of pure combat adrenaline, assassin silhouette bursting with green energy and speed, cards and energy swirling around, heightened reflexes, dark fantasy rush'
  },
  {
    id: 'bulletTime',
    name: 'Bullet Time',
    character: 'silent',
    prompt: 'Time itself frozen in a magical moment, silver blades and green energy suspended mid-air in slow motion, a cloaked figure moving through frozen time, temporal magic, dark fantasy'
  },
  {
    id: 'glassKnife',
    name: 'Glass Knife',
    character: 'silent',
    prompt: 'A crystalline glass dagger shattering on impact but dealing devastating damage, fragments of broken glass flying, green-tinted transparent blade, dark fantasy fragile power'
  },
  {
    id: 'envenom',
    name: 'Envenom',
    character: 'silent',
    prompt: 'Venom being applied to every weapon, green toxic coating dripping from blades, poison on each attack, sinister dark green aura, dark fantasy toxic enchantment'
  },

  // === DEFECT UNCOMMONS (5) ===
  {
    id: 'ftl',
    name: 'FTL',
    character: 'defect',
    prompt: 'Faster-than-light speed attack, blue streaks and motion blur from a robotic strike, exceeding light speed, blue and white velocity trails, dark fantasy sci-fi speed'
  },
  {
    id: 'sunder',
    name: 'Sunder',
    character: 'defect',
    prompt: 'A robotic mechanical arm releasing a pulse of blue crackling energy, force wave shattering barriers, blue and white power surge, dark fantasy cybernetic theme'
  },
  {
    id: 'glacier',
    name: 'Glacier',
    character: 'defect',
    prompt: 'A massive ice glacier forming as defensive barrier, two frost orbs channeling simultaneously, crystalline ice wall with blue glow, dark fantasy frozen fortress'
  },
  {
    id: 'capacitor',
    name: 'Capacitor',
    character: 'defect',
    prompt: 'An electric capacitor overcharging with additional orb slot energy, blue lightning stored in mechanical device, power surge capability, dark fantasy energy storage'
  },
  {
    id: 'consume',
    name: 'Consume',
    character: 'defect',
    prompt: 'An orb being consumed and absorbed for focus power, energy being devoured by a mechanical entity, blue and purple absorption vortex, dark fantasy power consumption'
  },

  // === WATCHER UNCOMMONS (4) ===
  {
    id: 'halt',
    name: 'Halt',
    character: 'watcher',
    prompt: 'A monk in a forceful stopping stance, palm raised creating an energy barrier, defensive halt in wrath mode grants extra block, purple and gold stopping force, dark fantasy martial defense'
  },
  {
    id: 'safety',
    name: 'Safety',
    character: 'watcher',
    prompt: 'A protective safety ward being placed, monk creating a shield of calm energy, retain defensive block for next turn, purple and gold protective aura, dark fantasy spiritual safety'
  },
  {
    id: 'fearNoEvil',
    name: 'Fear No Evil',
    character: 'watcher',
    prompt: 'A monk standing fearlessly against darkness, entering calm stance through courage, purple and gold bravery aura dispelling shadow, dark fantasy spiritual courage'
  },
  {
    id: 'thirdEye',
    name: 'Third Eye',
    character: 'watcher',
    prompt: 'A glowing third eye opening on a monks forehead, scrying the future and gaining insight, purple and gold divination energy, seeing the draw pile, dark fantasy mystical vision'
  },

  // === SILENT UNCOMMONS (3) ===
  {
    id: 'finisher',
    name: 'Finisher',
    character: 'silent',
    prompt: 'A hooded rogue performing a final flourish with green energy swirling from accumulated power, multiple green afterimages of previous moves converging, dark fantasy card game art'
  },
  {
    id: 'predator',
    name: 'Predator',
    character: 'silent',
    prompt: 'A cloaked figure with glowing green eyes watching from the shadows, gathering energy from the darkness, mysterious and powerful stance, dark fantasy rogue theme'
  },
  {
    id: 'flechettes',
    name: 'Flechettes',
    character: 'silent',
    prompt: 'A fan of small silver darts flying through the air with green magical trails, skill-powered energy propelling them, precision throwing art, dark fantasy card game style'
  },

  // === DEFECT COMMONS (2) ===
  {
    id: 'leapDefect',
    name: 'Leap',
    character: 'defect',
    prompt: 'A robotic entity leaping defensively with energy shields engaging, mechanical jump creating block barrier, blue defensive leap, dark fantasy cybernetic dodge'
  },
  {
    id: 'seek',
    name: 'Seek',
    character: 'defect',
    prompt: 'A mechanical eye scanning through a deck of energy cards, finding the perfect card to draw, blue search beam and holographic card display, dark fantasy digital search'
  },
];

const STYLE_SUFFIX = ', 512x512 pixels, digital painting, dark fantasy card game art style, centered composition, dramatic lighting, no text or watermarks';

async function generateImage(cardId, prompt) {
  return new Promise((resolve, reject) => {
    const fullPrompt = prompt + STYLE_SUFFIX;

    const requestData = JSON.stringify({
      model: 'dall-e-3',
      prompt: fullPrompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      style: 'vivid'
    });

    const options = {
      hostname: 'api.openai.com',
      port: 443,
      path: '/v1/images/generations',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_KEY}`,
        'Content-Length': Buffer.byteLength(requestData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.error) {
            reject(new Error(`API Error: ${response.error.message}`));
            return;
          }
          if (response.data && response.data[0]) {
            resolve(response.data[0].url);
          } else {
            reject(new Error('No image URL in response'));
          }
        } catch (e) {
          reject(new Error(`Parse error: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    req.write(requestData);
    req.end();
  });
}

async function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const get = (targetUrl) => {
      https.get(targetUrl, (res) => {
        if (res.statusCode === 302 || res.statusCode === 301) {
          get(res.headers.location);
        } else {
          const chunks = [];
          res.on('data', chunk => chunks.push(chunk));
          res.on('end', () => resolve(Buffer.concat(chunks)));
          res.on('error', reject);
        }
      }).on('error', reject);
    };
    get(url);
  });
}

async function convertToWebP(pngBuffer, outputPath) {
  const sharp = (await import('sharp')).default;
  await sharp(pngBuffer)
    .resize(256, 256, { fit: 'cover' })
    .webp({ quality: 90 })
    .toFile(outputPath);
}

async function processCard(card, index, total) {
  const outputPath = path.join(OUTPUT_DIR, `${card.id}.webp`);

  // Skip cards that already have quality art (>10KB)
  if (fs.existsSync(outputPath)) {
    const existing = fs.statSync(outputPath);
    if (existing.size >= 10240) {
      console.log(`[${index + 1}/${total}] Skipping: ${card.name} (${card.id}) — already ${(existing.size / 1024).toFixed(1)}KB`);
      return { success: true, id: card.id, size: existing.size, skipped: true };
    }
  }

  console.log(`[${index + 1}/${total}] Generating: ${card.name} (${card.id})`);
  console.log(`  Prompt: ${card.prompt.substring(0, 60)}...`);

  try {
    const imageUrl = await generateImage(card.id, card.prompt);
    console.log(`  Generated`);

    const imageBuffer = await downloadImage(imageUrl);
    console.log(`  Downloaded (${(imageBuffer.length / 1024).toFixed(1)}KB)`);

    await convertToWebP(imageBuffer, outputPath);

    const stats = fs.statSync(outputPath);
    console.log(`  Saved: ${(stats.size / 1024).toFixed(1)}KB`);

    if (stats.size < 10240) {
      console.log(`  WARNING: File size < 10KB`);
    }

    return { success: true, id: card.id, size: stats.size };
  } catch (error) {
    console.error(`  ERROR: ${error.message}`);
    return { success: false, id: card.id, error: error.message };
  }
}

async function main() {
  console.log('GD-32: Card Art Batch 1 (DALL-E)');
  console.log('='.repeat(50));
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log(`Cards: ${CARDS_TO_GENERATE.length}`);
  console.log('');

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const results = [];

  for (let i = 0; i < CARDS_TO_GENERATE.length; i++) {
    const result = await processCard(CARDS_TO_GENERATE[i], i, CARDS_TO_GENERATE.length);
    results.push(result);

    if (!result.skipped && i < CARDS_TO_GENERATE.length - 1) {
      console.log('  Waiting 2s...\n');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('SUMMARY');
  console.log('='.repeat(50));

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`Successful: ${successful.length}/${CARDS_TO_GENERATE.length}`);
  if (successful.length > 0) {
    const avgSize = successful.reduce((sum, r) => sum + r.size, 0) / successful.length;
    console.log(`Average size: ${(avgSize / 1024).toFixed(1)}KB`);
  }

  if (failed.length > 0) {
    console.log(`\nFailed:`);
    failed.forEach(r => console.log(`  - ${r.id}: ${r.error}`));
  }

  console.log('\nNext steps:');
  console.log('1. npm run generate-card-sprites');
  console.log('2. npm run validate');

  process.exit(failed.length > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
