#!/usr/bin/env node

/**
 * Spire Ascent - Enemy Sprite Sheet Generator
 *
 * Bundles individual enemy WebP images into sprite sheet(s) for performance.
 * Generates a JSON manifest mapping enemy IDs to sprite positions.
 *
 * Usage:
 *   node scripts/generate-sprite-sheets.js [options]
 *
 * Options:
 *   --dry-run     Show what would be generated without writing files
 *   --cols=N      Number of columns in the sprite grid (default: 6)
 *   --size=N      Size of each sprite cell in pixels (default: 512)
 *   --quality=N   WebP quality 1-100 (default: 80)
 *
 * Requires: sharp (devDependency)
 *
 * Output:
 *   src/assets/art/enemies/sprite-sheet.webp    - The sprite sheet image
 *   src/assets/art/enemies/sprite-manifest.json  - JSON manifest with positions
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch {
    console.error('ERROR: sharp is not installed. Run: npm install');
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  let cols = 6;
  let cellSize = 512;
  let quality = 80;

  args.forEach(arg => {
    if (arg.startsWith('--cols=')) cols = parseInt(arg.split('=')[1]);
    if (arg.startsWith('--size=')) cellSize = parseInt(arg.split('=')[1]);
    if (arg.startsWith('--quality=')) quality = parseInt(arg.split('=')[1]);
  });

  const enemiesDir = path.join(__dirname, '../src/assets/art/enemies');

  // Find all enemy WebP images (exclude sprite sheets themselves)
  const files = fs.readdirSync(enemiesDir)
    .filter(f => f.endsWith('.webp') && !f.startsWith('sprite-'))
    .sort();

  if (files.length === 0) {
    console.log('No enemy images found.');
    return;
  }

  console.log('='.repeat(60));
  console.log('SPIRE ASCENT - ENEMY SPRITE SHEET GENERATOR');
  console.log('='.repeat(60));
  console.log(`Found ${files.length} enemy images`);
  console.log(`Grid: ${cols} columns, ${cellSize}x${cellSize}px cells`);
  console.log(`Quality: ${quality}`);

  const rows = Math.ceil(files.length / cols);
  const sheetWidth = cols * cellSize;
  const sheetHeight = rows * cellSize;

  console.log(`Sheet dimensions: ${sheetWidth}x${sheetHeight}px (${rows} rows)`);

  // Build manifest
  const manifest = {
    cellSize,
    cols,
    rows,
    sheetWidth,
    sheetHeight,
    enemies: {}
  };

  const composites = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const enemyId = path.parse(file).name;
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = col * cellSize;
    const y = row * cellSize;

    manifest.enemies[enemyId] = {
      x,
      y,
      col,
      row,
      index: i
    };

    console.log(`  [${i}] ${enemyId} -> col=${col}, row=${row} (${x},${y})`);

    if (!dryRun) {
      const filePath = path.join(enemiesDir, file);
      // Resize each image to exactly cellSize x cellSize
      const buffer = await sharp(filePath)
        .resize(cellSize, cellSize, { fit: 'cover', position: 'center' })
        .toBuffer();

      composites.push({
        input: buffer,
        left: x,
        top: y
      });
    }
  }

  if (dryRun) {
    console.log('\n[DRY RUN] Would generate:');
    console.log(`  sprite-sheet.webp (${sheetWidth}x${sheetHeight})`);
    console.log(`  sprite-manifest.json (${files.length} entries)`);
    return;
  }

  // Create the sprite sheet
  console.log('\nCompositing sprite sheet...');
  const spriteBuffer = await sharp({
    create: {
      width: sheetWidth,
      height: sheetHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite(composites)
    .webp({ quality })
    .toBuffer();

  const sheetPath = path.join(enemiesDir, 'sprite-sheet.webp');
  fs.writeFileSync(sheetPath, spriteBuffer);

  const sheetKB = (spriteBuffer.length / 1024).toFixed(1);
  console.log(`Sprite sheet: ${sheetKB}KB`);

  // Calculate individual files total size for comparison
  let individualTotal = 0;
  for (const file of files) {
    const stats = fs.statSync(path.join(enemiesDir, file));
    individualTotal += stats.size;
  }
  const individualKB = (individualTotal / 1024).toFixed(1);
  console.log(`Individual files total: ${individualKB}KB`);
  console.log(`Reduction: ${files.length} requests -> 1 request`);

  // Write manifest
  const manifestPath = path.join(enemiesDir, 'sprite-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`Manifest written: ${manifestPath}`);

  console.log('\n' + '='.repeat(60));
  console.log('DONE');
  console.log('='.repeat(60));
}

main().catch(console.error);
