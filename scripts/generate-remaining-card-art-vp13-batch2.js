#!/usr/bin/env node

/**
 * VP-13: Remaining Card Art - Batch 2 (Safe Prompts)
 *
 * Retrying failed cards with safety-compliant prompts.
 * Focuses on fantasy energy and abstract effects rather than combat.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
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

const OPENAI_KEY = process.env.OPENAI_KEY;
if (!OPENAI_KEY) {
  console.error('Error: OPENAI_KEY not found');
  process.exit(1);
}

const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'assets', 'art', 'cards');

// Safer prompts focusing on abstract/energy effects
const CARDS_TO_GENERATE = [
  // Ironclad cards with safer prompts
  {
    id: 'cleave',
    name: 'Cleave',
    prompt: 'A powerful arc of red energy sweeping through darkness, fantasy power effect, dramatic red light trail forming a semicircle, abstract magical force, dark fantasy game art style, no text'
  },
  {
    id: 'clothesline',
    name: 'Clothesline',
    prompt: 'A horizontal wave of red force energy, powerful motion blur effect, fantasy strength aura, crimson light streak, dark dramatic background, game card art style, no text'
  },
  {
    id: 'ironWave',
    name: 'Iron Wave',
    prompt: 'Iron shield with magical wave emanating from it, defensive energy combined with offensive power, silver and red energy merger, fantasy metalwork, game card art style, no text'
  },
  {
    id: 'wallop',
    name: 'Wallop',
    prompt: 'A massive impact crater with energy shockwave radiating outward, ground shattering effect, red and grey power explosion, fantasy impact, game card art style, no text'
  },
  {
    id: 'flyingKnee',
    name: 'Flying Knee',
    prompt: 'Dynamic upward motion blur with red energy trail, athletic fantasy leap, crimson power aura in motion, martial arts energy, game card art style, no text'
  },
  {
    id: 'legSweep',
    name: 'Leg Sweep',
    prompt: 'Low sweeping arc of energy creating dust swirl, ground-level power wave, red energy curve near floor, fantasy martial technique, game card art style, no text'
  },
  // Silent cards with safer prompts
  {
    id: 'backstab',
    name: 'Backstab',
    prompt: 'A green shadow emerging from darkness, stealthy silhouette with emerald glow, mysterious shadow figure, dark fog effect, fantasy rogue theme, game card art style, no text'
  },
  {
    id: 'bladeDance',
    name: 'Blade Dance',
    prompt: 'Spinning green energy patterns forming elegant spiral, multiple emerald light trails in dance formation, graceful motion blur, fantasy dance of light, game card art style, no text'
  },
  {
    id: 'daggerSpray',
    name: 'Dagger Spray',
    prompt: 'Fan pattern of green light rays spreading outward, emerald energy spray effect, radiating green beams, fantasy projectile pattern, game card art style, no text'
  },
  {
    id: 'daggerThrow',
    name: 'Dagger Throw',
    prompt: 'Single green light streak with precision trajectory, emerald energy line with card symbols, accurate aim effect, fantasy precision theme, game card art style, no text'
  },
  {
    id: 'deadlyPoison',
    name: 'Deadly Poison',
    prompt: 'Swirling green toxic mist in a glass vial, alchemical poison potion, emerald vapor rising, fantasy alchemy theme, dark green atmospheric effect, game card art style, no text'
  },
  {
    id: 'quickSlash',
    name: 'Quick Slash',
    prompt: 'Lightning fast green energy slash mark, speed lines with emerald glow, instant motion afterimage effect, fantasy speed theme, game card art style, no text'
  },
  // Defect card
  {
    id: 'hyperbeam',
    name: 'Hyperbeam',
    prompt: 'Massive blue energy beam of concentrated light, powerful laser ray of electricity, intense bright blue beam from robotic source, sci-fi energy discharge, game card art style, no text'
  },
  // Watcher cards
  {
    id: 'bowlingBash',
    name: 'Bowling Bash',
    prompt: 'Purple energy palm wave spreading forward through space, spiritual force wave, violet chi energy rippling, zen power projection, game card art style, no text'
  },
  {
    id: 'tantrum',
    name: 'Tantrum',
    prompt: 'Intense red-purple rage aura with multiple energy bursts, furious spiritual power overflow, wrath flames surrounding meditative form, game card art style, no text'
  }
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
    https.get(url, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        https.get(res.headers.location, (res2) => {
          const chunks = [];
          res2.on('data', chunk => chunks.push(chunk));
          res2.on('end', () => resolve(Buffer.concat(chunks)));
          res2.on('error', reject);
        }).on('error', reject);
      } else {
        const chunks = [];
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => resolve(Buffer.concat(chunks)));
        res.on('error', reject);
      }
    }).on('error', reject);
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

  console.log(`[${index + 1}/${total}] Generating: ${card.name} (${card.id})`);
  console.log(`  Prompt: ${card.prompt.substring(0, 60)}...`);

  try {
    const imageUrl = await generateImage(card.id, card.prompt);
    console.log(`  ✓ Image generated`);

    const imageBuffer = await downloadImage(imageUrl);
    console.log(`  ✓ Downloaded (${(imageBuffer.length / 1024).toFixed(1)}KB)`);

    await convertToWebP(imageBuffer, outputPath);

    const stats = fs.statSync(outputPath);
    console.log(`  ✓ Saved: ${outputPath} (${(stats.size / 1024).toFixed(1)}KB)`);

    return { success: true, id: card.id, size: stats.size };
  } catch (error) {
    console.error(`  ✗ Error: ${error.message}`);
    return { success: false, id: card.id, error: error.message };
  }
}

async function main() {
  console.log('VP-13: Remaining Card Art - Batch 2 (Safe Prompts)');
  console.log('==================================================');
  console.log(`Cards to retry: ${CARDS_TO_GENERATE.length}`);
  console.log('');

  const results = [];

  for (let i = 0; i < CARDS_TO_GENERATE.length; i++) {
    const result = await processCard(CARDS_TO_GENERATE[i], i, CARDS_TO_GENERATE.length);
    results.push(result);

    if (i < CARDS_TO_GENERATE.length - 1) {
      console.log('  Waiting 2s...\n');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('\n==================================================');
  console.log('SUMMARY');
  console.log('==================================================');

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`Successful: ${successful.length}/${CARDS_TO_GENERATE.length}`);
  if (successful.length > 0) {
    const avgSize = successful.reduce((sum, r) => sum + r.size, 0) / successful.length;
    console.log(`Average file size: ${(avgSize / 1024).toFixed(1)}KB`);
  }

  if (failed.length > 0) {
    console.log(`\nFailed cards:`);
    failed.forEach(r => console.log(`  - ${r.id}: ${r.error}`));
  }

  process.exit(failed.length > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
