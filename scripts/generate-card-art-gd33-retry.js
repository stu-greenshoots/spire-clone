#!/usr/bin/env node

/**
 * GD-33: Card Art Batch 2 — Retry with safe prompts
 *
 * Retries the 11 cards that failed DALL-E safety filters in the first pass.
 * All prompts revised to focus on abstract energy, magical effects, and
 * avoid combat/violence/weapon imagery.
 *
 * Usage: node scripts/generate-card-art-gd33-retry.js
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

// Retry cards with safe prompts — focus on abstract energy and magical effects
const CARDS_TO_GENERATE = [
  // Silent
  {
    id: 'dash',
    name: 'Dash',
    character: 'silent',
    prompt: 'A green streak of light moving at incredible speed across a dark landscape, afterimage trails and motion blur, swift energy flowing forward and creating a protective shield, dark fantasy magical speed'
  },
  {
    id: 'corpseExplosion',
    name: 'Corpse Explosion',
    character: 'silent',
    prompt: 'A burst of toxic green energy erupting outward in a magical chain reaction, spreading emerald magical essence to all surroundings, mystical green explosion of accumulated power, dark fantasy magical burst'
  },
  {
    id: 'aThousandCuts',
    name: 'A Thousand Cuts',
    character: 'silent',
    prompt: 'A swirling vortex of countless tiny green magical crescents filling the air, each one a tiny arc of emerald energy, relentless magical barrage of a thousand tiny energy waves, dark fantasy spell art'
  },
  {
    id: 'poisonedStab',
    name: 'Poisoned Stab',
    character: 'silent',
    prompt: 'A glowing green crystal shard emanating toxic emerald energy, venom-like magical aura dripping from the crystal tip, concentrated poison essence, dark fantasy magical toxin'
  },
  {
    id: 'backstab',
    name: 'Backstab',
    character: 'silent',
    prompt: 'Twin emerald energy crescents emerging from shadows, a surprise magical strike from the darkness, green shadow energy materializing into sharp forms, dark fantasy shadow magic'
  },

  // Defect
  {
    id: 'rip',
    name: 'Rip and Tear',
    character: 'defect',
    prompt: 'Raw mechanical blue energy tearing through a barrier, electric blue force ripping apart a magical shield, pure power and circuit energy breaking through, dark fantasy cybernetic force'
  },

  // Watcher
  {
    id: 'followUp',
    name: 'Follow-Up',
    character: 'watcher',
    prompt: 'Two overlapping purple and gold energy waves in sequence, the second wave following the first in a chain of spiritual power, sequential divine energy pulses, dark fantasy spiritual continuation'
  },
  {
    id: 'crushJoints',
    name: 'Crush Joints',
    character: 'watcher',
    prompt: 'Purple spiritual energy focusing on precise pressure points in space, targeted circles of concentrated purple force on weak spots, precision magical focus, dark fantasy spiritual precision'
  },
  {
    id: 'sashWhip',
    name: 'Sash Whip',
    character: 'watcher',
    prompt: 'A flowing purple and gold ribbon of cloth imbued with spiritual energy, graceful arc of magical silk trailing sparks of divine light, enchanted fabric in motion, dark fantasy spiritual art'
  },
  {
    id: 'flurryOfBlows',
    name: 'Flurry of Blows',
    character: 'watcher',
    prompt: 'Multiple overlapping circles of purple spiritual energy radiating outward in rapid succession, a cascade of divine force waves triggered by spiritual stance changes, dark fantasy energy cascade'
  },
  {
    id: 'throughViolence',
    name: 'Through Violence',
    character: 'watcher',
    prompt: 'A single concentrated beam of intense purple and crimson spiritual power, ultimate focused divine energy channeled into one overwhelming surge of magical force, dark fantasy transcendent power'
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
  console.log('GD-33: Card Art Batch 2 — Retry (safe prompts)');
  console.log('='.repeat(50));
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log(`Cards: ${CARDS_TO_GENERATE.length}`);
  console.log('');

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
