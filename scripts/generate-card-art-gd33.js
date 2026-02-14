#!/usr/bin/env node

/**
 * GD-33: Card Art Batch 2 — Replace remaining placeholder cards with DALL-E art
 *
 * Targets the remaining ~28 placeholder cards (<10KB), focusing on
 * Defect and Watcher uncommons/rares plus Silent stragglers.
 *
 * Usage: node scripts/generate-card-art-gd33.js
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

// All remaining placeholder cards (<10KB) to replace
const CARDS_TO_GENERATE = [
  // === SILENT (10 cards) ===
  {
    id: 'dash',
    name: 'Dash',
    character: 'silent',
    prompt: 'A hooded assassin performing a swift dashing strike, green energy trail behind them, simultaneous attack and defense in one fluid motion, dark fantasy agile combat'
  },
  {
    id: 'corpseExplosion',
    name: 'Corpse Explosion',
    character: 'silent',
    prompt: 'A defeated enemy erupting in a toxic green explosion, spreading poison damage to all nearby foes, dark visceral chain reaction, sinister green energy blast, dark fantasy'
  },
  {
    id: 'footwork',
    name: 'Footwork',
    character: 'silent',
    prompt: 'An assassin practicing precise footwork stances, green aura around nimble feet, increased dexterity and evasion, martial arts training, dark fantasy rogue agility'
  },
  {
    id: 'wellLaidPlans',
    name: 'Well-Laid Plans',
    character: 'silent',
    prompt: 'A strategic map with daggers pinning key points, green threads connecting plans, a calculating rogue plotting the perfect hand, tactical scheming, dark fantasy strategy'
  },
  {
    id: 'dodgeAndRoll',
    name: 'Dodge and Roll',
    character: 'silent',
    prompt: 'An agile rogue tumbling and rolling to evade attacks, green defensive energy trail, acrobatic evasion with persistent block, dark fantasy acrobatics'
  },
  {
    id: 'cloakAndDagger',
    name: 'Cloak and Dagger',
    character: 'silent',
    prompt: 'A dark cloak swirling with hidden daggers emerging, block and shiv generation combined, green-tinted shadow concealment with silver blades, dark fantasy stealth'
  },
  {
    id: 'aThousandCuts',
    name: 'A Thousand Cuts',
    character: 'silent',
    prompt: 'Countless tiny green energy slashes filling the air, each card played triggers another cut, death by a thousand wounds, relentless green blade storm, dark fantasy power'
  },
  {
    id: 'noxiousFumes',
    name: 'Noxious Fumes',
    character: 'silent',
    prompt: 'Thick toxic green clouds billowing outward, poisoning all enemies each turn, noxious gas spreading relentlessly, sinister green miasma, dark fantasy poison cloud'
  },
  {
    id: 'poisonedStab',
    name: 'Poisoned Stab',
    character: 'silent',
    prompt: 'A dagger coated in bright green venom being thrust forward, poison dripping from the blade tip, quick venomous strike, dark fantasy assassin attack'
  },
  {
    id: 'backstab',
    name: 'Backstab',
    character: 'silent',
    prompt: 'A shadowy figure striking from behind with twin daggers, green energy marking the opening hand surprise attack, stealth assassination, dark fantasy ambush'
  },

  // === DEFECT (7 cards) ===
  {
    id: 'stackDefect',
    name: 'Stack',
    character: 'defect',
    prompt: 'A mechanical entity stacking layers of digital shields, blue energy barriers building on top of each other based on cards in hand, dark fantasy cybernetic defense stacking'
  },
  {
    id: 'rip',
    name: 'Rip and Tear',
    character: 'defect',
    prompt: 'A robotic arm tearing through enemies with raw mechanical force, blue sparks flying from metal claws ripping apart, brutal cybernetic attack, dark fantasy destruction'
  },
  {
    id: 'beamCell',
    name: 'Beam Cell',
    character: 'defect',
    prompt: 'A concentrated energy beam cell charging and firing, blue laser beam cutting through darkness, channeling electric orb power, dark fantasy sci-fi energy weapon'
  },
  {
    id: 'equilibrium',
    name: 'Equilibrium',
    character: 'defect',
    prompt: 'Perfect mechanical balance between two energy states, blue and gold yin-yang of robotic harmony, retaining cards in perfect equilibrium, dark fantasy cybernetic balance'
  },
  {
    id: 'compileDrive',
    name: 'Compile Driver',
    character: 'defect',
    prompt: 'A mechanical drive compiling energy into a focused attack beam, circuit patterns glowing blue as code executes into power, dark fantasy digital compilation'
  },
  {
    id: 'sweepingBeam',
    name: 'Sweeping Beam',
    character: 'defect',
    prompt: 'A wide arc of blue energy sweeping across all enemies, robotic arm projecting a broad beam of destruction and drawing a card, dark fantasy energy sweep'
  },
  {
    id: 'chargeUp',
    name: 'Charge Battery',
    character: 'defect',
    prompt: 'A mechanical battery core charging with crackling blue lightning, storing energy for the next orb evoke, power building and accumulating, dark fantasy energy storage'
  },

  // === WATCHER (11 cards) ===
  {
    id: 'followUp',
    name: 'Follow-Up',
    character: 'watcher',
    prompt: 'A monk delivering a precise follow-up strike after an attack, purple and gold continuation energy, martial arts chain combo, dark fantasy spiritual combat technique'
  },
  {
    id: 'tranquility',
    name: 'Tranquility',
    character: 'watcher',
    prompt: 'A monk meditating in absolute stillness, entering calm stance through inner peace, serene purple and gold aura of tranquility, peaceful water reflection, dark fantasy zen'
  },
  {
    id: 'emptyMind',
    name: 'Empty Mind',
    character: 'watcher',
    prompt: 'A monk clearing all thoughts, empty mind drawing new insight and cards, purple and gold void of consciousness, blank awareness, dark fantasy mental emptiness'
  },
  {
    id: 'crushJoints',
    name: 'Crush Joints',
    character: 'watcher',
    prompt: 'A monk targeting enemy joints with precise strikes, vulnerability-inflicting pressure point attack, purple energy focusing on weak points, dark fantasy martial arts'
  },
  {
    id: 'sashWhip',
    name: 'Sash Whip',
    character: 'watcher',
    prompt: 'A monk using a flowing cloth sash as a whip weapon, purple and gold fabric snapping with energy, applying weakness on the first attack, dark fantasy spiritual combat'
  },
  {
    id: 'flurryOfBlows',
    name: 'Flurry of Blows',
    character: 'watcher',
    prompt: 'A monk unleashing rapid-fire punches triggered by stance changes, purple energy fists multiplying in rapid succession, dark fantasy martial arts barrage'
  },
  {
    id: 'reachHeaven',
    name: 'Reach Heaven',
    character: 'watcher',
    prompt: 'A monk reaching upward toward divine light, creating a path to Through Violence, purple and gold ascending spiritual energy, dark fantasy heavenly aspiration'
  },
  {
    id: 'brilliance',
    name: 'Brilliance',
    character: 'watcher',
    prompt: 'Blinding golden divine light radiating from a monks hands, damage scaling with mantra accumulated, brilliant golden and purple radiance, dark fantasy holy power'
  },
  {
    id: 'mentalFortress',
    name: 'Mental Fortress',
    character: 'watcher',
    prompt: 'An impenetrable fortress of pure thought energy surrounding a meditating monk, gaining block on each stance change, purple mental barriers, dark fantasy psychic defense'
  },
  {
    id: 'throughViolence',
    name: 'Through Violence',
    character: 'watcher',
    prompt: 'A monk channeling all spiritual energy into one devastating strike, the conclusion of Reach Heaven, purple and crimson focused destruction, dark fantasy ultimate attack'
  },
  {
    id: 'protectingLight',
    name: 'Protecting Light',
    character: 'watcher',
    prompt: 'A warm golden shield of divine light protecting allies, block scaling with current HP, healing protective radiance, purple and gold divine ward, dark fantasy holy protection'
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
  console.log('GD-33: Card Art Batch 2 (DALL-E)');
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
  const generated = successful.filter(r => !r.skipped);

  console.log(`Total: ${CARDS_TO_GENERATE.length}`);
  console.log(`Generated: ${generated.length}`);
  console.log(`Skipped (already quality): ${successful.length - generated.length}`);
  if (generated.length > 0) {
    const avgSize = generated.reduce((sum, r) => sum + r.size, 0) / generated.length;
    console.log(`Average new size: ${(avgSize / 1024).toFixed(1)}KB`);
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
