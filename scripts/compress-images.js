#!/usr/bin/env node

/**
 * Spire Ascent - Image Compression Pipeline
 *
 * Resizes and converts all game art to optimized WebP format.
 * Target: <100KB per image for fast web loading.
 *
 * Usage:
 *   node scripts/compress-images.js [options]
 *
 * Options:
 *   --type=cards|enemies|relics|potions|all  Process specific type (default: all)
 *   --quality=80                             WebP quality 1-100 (default: 80)
 *   --dry-run                                Show what would be processed
 *   --force                                  Re-process even if WebP already exists
 *   --keep-originals                         Don't delete original PNGs after conversion
 *
 * Requires: npm install sharp
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
  artDir: path.join(__dirname, '../src/assets/art'),
  // Target dimensions per asset type
  sizes: {
    cards: { width: 512, height: 512 },
    enemies: { width: 512, height: 512 },
    relics: { width: 256, height: 256 },
    potions: { width: 256, height: 256 },
  },
  // WebP quality (1-100)
  quality: 80,
  // Target max file size in bytes
  maxFileSize: 100 * 1024, // 100KB
};

// ============================================
// MAIN
// ============================================

async function main() {
  // Dynamic import of sharp (must be installed)
  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch (e) {
    console.error('ERROR: sharp is not installed.');
    console.error('Install it with: npm install --save-dev sharp');
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const options = {
    type: 'all',
    quality: CONFIG.quality,
    dryRun: args.includes('--dry-run'),
    force: args.includes('--force'),
    keepOriginals: args.includes('--keep-originals'),
  };

  args.forEach(arg => {
    if (arg.startsWith('--type=')) options.type = arg.split('=')[1];
    if (arg.startsWith('--quality=')) options.quality = parseInt(arg.split('=')[1]);
  });

  console.log('='.repeat(60));
  console.log('SPIRE ASCENT - IMAGE COMPRESSION PIPELINE');
  console.log('='.repeat(60));
  console.log(`Type: ${options.type}`);
  console.log(`Quality: ${options.quality}`);
  console.log(`Force: ${options.force}`);
  console.log(`Keep originals: ${options.keepOriginals}`);
  console.log(`Dry run: ${options.dryRun}`);
  console.log('='.repeat(60));

  const types = options.type === 'all'
    ? ['cards', 'enemies', 'relics', 'potions']
    : [options.type];

  let totalProcessed = 0;
  let totalSaved = 0;
  let totalOriginalSize = 0;
  let totalNewSize = 0;

  for (const type of types) {
    const dir = path.join(CONFIG.artDir, type);
    const size = CONFIG.sizes[type];

    if (!fs.existsSync(dir)) {
      console.log(`\nSkipping ${type} - directory not found: ${dir}`);
      continue;
    }

    const files = fs.readdirSync(dir)
      .filter(f => /\.(png|jpg|jpeg)$/i.test(f));

    if (files.length === 0) {
      console.log(`\nNo images found in ${type}/`);
      continue;
    }

    console.log(`\n--- ${type.toUpperCase()} (${files.length} images) ---`);
    console.log(`  Target: ${size.width}x${size.height} @ quality ${options.quality}`);

    for (const file of files) {
      const inputPath = path.join(dir, file);
      const baseName = path.parse(file).name;
      const outputPath = path.join(dir, `${baseName}.webp`);

      // Skip if WebP already exists and not forcing
      if (!options.force && fs.existsSync(outputPath)) {
        continue;
      }

      const originalStats = fs.statSync(inputPath);
      const originalKB = (originalStats.size / 1024).toFixed(1);

      if (options.dryRun) {
        console.log(`  [DRY] ${file} (${originalKB}KB) -> ${baseName}.webp`);
        totalProcessed++;
        continue;
      }

      try {
        // Resize and convert to WebP
        let quality = options.quality;
        let buffer = await sharp(inputPath)
          .resize(size.width, size.height, {
            fit: 'cover',
            position: 'center'
          })
          .webp({ quality })
          .toBuffer();

        // If still over max size, reduce quality iteratively
        while (buffer.length > CONFIG.maxFileSize && quality > 30) {
          quality -= 10;
          buffer = await sharp(inputPath)
            .resize(size.width, size.height, {
              fit: 'cover',
              position: 'center'
            })
            .webp({ quality })
            .toBuffer();
        }

        fs.writeFileSync(outputPath, buffer);

        const newKB = (buffer.length / 1024).toFixed(1);
        const savings = ((1 - buffer.length / originalStats.size) * 100).toFixed(0);

        console.log(`  ${file} (${originalKB}KB) -> ${baseName}.webp (${newKB}KB, -${savings}%${quality < options.quality ? `, q=${quality}` : ''})`);

        totalOriginalSize += originalStats.size;
        totalNewSize += buffer.length;
        totalProcessed++;

        // Remove original if not keeping
        if (!options.keepOriginals) {
          fs.unlinkSync(inputPath);
          totalSaved += originalStats.size - buffer.length;
        }

      } catch (err) {
        console.error(`  ERROR processing ${file}: ${err.message}`);
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('COMPRESSION COMPLETE');
  console.log('='.repeat(60));
  console.log(`Processed: ${totalProcessed} images`);
  if (!options.dryRun && totalOriginalSize > 0) {
    console.log(`Original total: ${(totalOriginalSize / 1024 / 1024).toFixed(1)}MB`);
    console.log(`New total: ${(totalNewSize / 1024 / 1024).toFixed(1)}MB`);
    console.log(`Space saved: ${(totalSaved / 1024 / 1024).toFixed(1)}MB`);
    console.log(`Average reduction: ${((1 - totalNewSize / totalOriginalSize) * 100).toFixed(0)}%`);
  }
}

main().catch(console.error);
