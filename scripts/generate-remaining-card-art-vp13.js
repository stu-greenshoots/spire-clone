#!/usr/bin/env node

/**
 * VP-13: Remaining Card Art Replacement using DALL-E
 *
 * Generates high-quality art for 30 additional cards using OpenAI's DALL-E API.
 * This follows the PM's directive to use DALL-E for art generation.
 *
 * Target cards: Highest-visibility uncommon/rare cards still using placeholder art.
 *
 * Usage: OPENAI_KEY=your-key node scripts/generate-remaining-card-art-vp13.js
 * Or: Uses .env file if present
 *
 * Requirements:
 * - OpenAI API key with DALL-E access
 * - sharp (devDependency)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

// Load .env if exists
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
  console.error('Error: OPENAI_KEY not found in environment or .env file');
  process.exit(1);
}

const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'assets', 'art', 'cards');

// 30 high-priority cards to replace with DALL-E art
// Selected based on: uncommon/rare rarity, gameplay importance, visual impact
const CARDS_TO_GENERATE = [
  // === IRONCLAD CARDS (8) ===
  {
    id: 'cleave',
    name: 'Cleave',
    character: 'ironclad',
    prompt: 'A massive iron greatsword mid-swing creating an arc of destruction, slashing through multiple shadowy enemies, dark fantasy style, dramatic lighting with red energy trails, dark background, game card art style, no text'
  },
  {
    id: 'bodySlam',
    name: 'Body Slam',
    character: 'ironclad',
    prompt: 'A heavily armored warrior shoulder-charging forward with immense force, shield raised, creating shockwave impact, dark fantasy style, dynamic action pose, red and silver color scheme, dark background, game card art, no text'
  },
  {
    id: 'clothesline',
    name: 'Clothesline',
    character: 'ironclad',
    prompt: 'A muscular warrior throwing a devastating clothesline attack with armored forearm extended, enemy being knocked back, dark fantasy combat, red energy effect, dramatic lighting, game card art style, no text'
  },
  {
    id: 'ironWave',
    name: 'Iron Wave',
    character: 'ironclad',
    prompt: 'A warrior simultaneously blocking with a shield and striking with a sword, defensive and offensive stance combined, iron and steel elements, dark fantasy, red accents, wave of energy, game card art, no text'
  },
  {
    id: 'shrugItOff',
    name: 'Shrug It Off',
    character: 'ironclad',
    prompt: 'A stoic warrior shrugging off damage with thick iron armor, defensive stance with subtle card draw magic effect, dark red and silver tones, dark fantasy resilience theme, game card art style, no text'
  },
  {
    id: 'wallop',
    name: 'Wallop',
    character: 'ironclad',
    prompt: 'A powerful overhead hammer strike creating massive impact crater, heavy weapon crushing downward, dark fantasy brutal strength theme, red and grey colors, dramatic impact effect, game card art, no text'
  },
  {
    id: 'flyingKnee',
    name: 'Flying Knee',
    character: 'ironclad',
    prompt: 'A warrior launching into a devastating flying knee strike, athletic combat move, dark fantasy martial arts, red energy trailing from knee, dynamic mid-air pose, game card art style, no text'
  },
  {
    id: 'legSweep',
    name: 'Leg Sweep',
    character: 'ironclad',
    prompt: 'A low sweeping kick knocking enemies off their feet, dust and debris flying, debuff and damage combo, dark fantasy combat, red weakness effect swirling, game card art style, no text'
  },

  // === SILENT CARDS (8) ===
  {
    id: 'acrobatics',
    name: 'Acrobatics',
    character: 'silent',
    prompt: 'A cloaked assassin performing an acrobatic flip while drawing cards/daggers from the air, agile movement, dark green and shadow colors, graceful motion blur, game card art style, no text'
  },
  {
    id: 'backflip',
    name: 'Backflip',
    character: 'silent',
    prompt: 'A hooded assassin mid-backflip with daggers in hand, defensive evasive maneuver, green energy trail, dark shadows, acrobatic grace, dark fantasy rogue theme, game card art style, no text'
  },
  {
    id: 'backstab',
    name: 'Backstab',
    character: 'silent',
    prompt: 'A shadow assassin striking from behind with poisoned daggers, first strike ambush attack, dark shadows and green poison mist, stealthy and deadly, game card art style, no text'
  },
  {
    id: 'bladeDance',
    name: 'Blade Dance',
    character: 'silent',
    prompt: 'Multiple throwing knives (shivs) spinning in an elegant deadly dance pattern, assassin silhouette, green and silver blades, fluid motion, dark fantasy, game card art style, no text'
  },
  {
    id: 'daggerSpray',
    name: 'Dagger Spray',
    character: 'silent',
    prompt: 'A fan of multiple daggers being thrown simultaneously at all enemies, spray attack pattern, green and silver knives flying outward, dark shadows, assassin theme, game card art, no text'
  },
  {
    id: 'daggerThrow',
    name: 'Dagger Throw',
    character: 'silent',
    prompt: 'A single precision dagger throw with perfect aim, card draw effect swirling around the blade, green trails, assassin hand releasing knife, dark background, game card art, no text'
  },
  {
    id: 'deadlyPoison',
    name: 'Deadly Poison',
    character: 'silent',
    prompt: 'A vial of deadly green poison being applied to a blade or thrown, toxic mist spreading, skull motif in the poison cloud, dark and sinister, game card art style, no text'
  },
  {
    id: 'quickSlash',
    name: 'Quick Slash',
    character: 'silent',
    prompt: 'A lightning-fast sword slash with speed lines, instant strike leaving afterimage, green energy trail, assassin blade technique, dark fantasy, game card art style, no text'
  },

  // === DEFECT CARDS (8) ===
  {
    id: 'coldSnap',
    name: 'Cold Snap',
    character: 'defect',
    prompt: 'A robotic hand channeling a frost orb, ice crystals forming, cold damage attack with orb being created, blue and white ice energy, mechanical defect theme, game card art style, no text'
  },
  {
    id: 'coolheaded',
    name: 'Coolheaded',
    character: 'defect',
    prompt: 'A frost orb channeling with calm blue energy, defensive meditation pose, ice crystals and card draw symbols, cool blue tones, mechanical serenity, game card art style, no text'
  },
  {
    id: 'defragment',
    name: 'Defragment',
    character: 'defect',
    prompt: 'Digital code fragments reassembling into enhanced focus power, blue circuit patterns, orb upgrade effect, computer optimization theme, blue energy grid, game card art, no text'
  },
  {
    id: 'steamBarrier',
    name: 'Steam Barrier',
    character: 'defect',
    prompt: 'A defensive steam cloud barrier being generated by mechanical vents, protective shield of hot vapor, blue and white steam effects, robotic defense, game card art style, no text'
  },
  {
    id: 'doom',
    name: 'Doom',
    character: 'defect',
    prompt: 'A dark orb pulsing with ominous purple-black energy, channeling doom damage, void darkness theme, mechanical dark orb, sinister power building, game card art style, no text'
  },
  {
    id: 'hyperbeam',
    name: 'Hyperbeam',
    character: 'defect',
    prompt: 'A massive energy beam firing from a robotic cannon, devastating blue laser attack hitting all enemies, mechanical overload, bright energy discharge, game card art style, no text'
  },
  {
    id: 'blizzard',
    name: 'Blizzard',
    character: 'defect',
    prompt: 'A massive ice storm being unleashed, multiple frost orbs powering the blizzard, frozen enemies, blue and white ice magic, mechanical frost attack, game card art style, no text'
  },
  {
    id: 'creativeAI',
    name: 'Creative AI',
    character: 'defect',
    prompt: 'A robotic brain generating new power cards from digital creativity, circuit patterns forming cards, blue lightning inspiration, mechanical intelligence theme, game card art, no text'
  },

  // === WATCHER CARDS (6) ===
  {
    id: 'bowlingBash',
    name: 'Bowling Bash',
    character: 'watcher',
    prompt: 'A monk striking with palm strike that hits multiple enemies in a line, purple energy wave bowling through foes, martial arts power, watcher stance energy, game card art style, no text'
  },
  {
    id: 'crescendo',
    name: 'Crescendo',
    character: 'watcher',
    prompt: 'A meditating monk building to wrath stance, energy crescendo building from calm to fury, purple and red energy transition, spiritual martial arts, game card art style, no text'
  },
  {
    id: 'tantrum',
    name: 'Tantrum',
    character: 'watcher',
    prompt: 'A monk in furious wrath stance unleashing multiple rapid strikes, red and purple rage energy, repeated attack effect, martial fury theme, game card art style, no text'
  },
  {
    id: 'prostrate',
    name: 'Prostrate',
    character: 'watcher',
    prompt: 'A monk in deep meditation prostrating position, generating mantra energy, purple spiritual glow, devotion and block generation, peaceful power, game card art style, no text'
  },
  {
    id: 'worship',
    name: 'Worship',
    character: 'watcher',
    prompt: 'A monk in worship pose with hands raised, golden mantra energy accumulating, spiritual devotion power, purple and gold divine energy, transcendence theme, game card art style, no text'
  },
  {
    id: 'deceiveReality',
    name: 'Deceive Reality',
    character: 'watcher',
    prompt: 'Reality fracturing into illusion shards, a monk manipulating perception, miracle card being generated, purple and gold reality-bending effect, mystical deception, game card art, no text'
  }
];

// Style suffix for all prompts
const STYLE_SUFFIX = ', 512x512 pixels, digital painting, dark fantasy card game art style, centered composition, dramatic lighting, no text or watermarks';

async function generateImage(cardId, prompt) {
  return new Promise((resolve, reject) => {
    const fullPrompt = prompt + STYLE_SUFFIX;

    const requestData = JSON.stringify({
      model: 'dall-e-3',
      prompt: fullPrompt,
      n: 1,
      size: '1024x1024',  // DALL-E 3 minimum size, will resize after
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

async function downloadImage(url, outputPath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        // Follow redirect
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
  // Dynamic import of sharp
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
    // Generate image with DALL-E
    const imageUrl = await generateImage(card.id, card.prompt);
    console.log(`  ✓ Image generated`);

    // Download the image
    const imageBuffer = await downloadImage(imageUrl);
    console.log(`  ✓ Downloaded (${(imageBuffer.length / 1024).toFixed(1)}KB)`);

    // Convert to WebP and resize
    await convertToWebP(imageBuffer, outputPath);

    // Check final file size
    const stats = fs.statSync(outputPath);
    console.log(`  ✓ Saved: ${outputPath} (${(stats.size / 1024).toFixed(1)}KB)`);

    if (stats.size < 10240) {
      console.log(`  ⚠ Warning: File size < 10KB, may not meet quality requirements`);
    }

    return { success: true, id: card.id, size: stats.size };
  } catch (error) {
    console.error(`  ✗ Error: ${error.message}`);
    return { success: false, id: card.id, error: error.message };
  }
}

async function main() {
  console.log('VP-13: Remaining Card Art Generation (DALL-E)');
  console.log('=============================================');
  console.log(`Output directory: ${OUTPUT_DIR}`);
  console.log(`Cards to generate: ${CARDS_TO_GENERATE.length}`);
  console.log('');

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const results = [];

  for (let i = 0; i < CARDS_TO_GENERATE.length; i++) {
    const result = await processCard(CARDS_TO_GENERATE[i], i, CARDS_TO_GENERATE.length);
    results.push(result);

    // Rate limiting - wait between requests
    if (i < CARDS_TO_GENERATE.length - 1) {
      console.log('  Waiting 2s (rate limit)...\n');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Summary
  console.log('\n=============================================');
  console.log('SUMMARY');
  console.log('=============================================');

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

  console.log('\nNext steps:');
  console.log('1. Run: node scripts/rebuild-card-sprites.js (if it exists)');
  console.log('2. Run: npm run validate');
  console.log('3. Test card art in game at runtime');

  // Return non-zero if any failed
  process.exit(failed.length > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
