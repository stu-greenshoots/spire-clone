#!/usr/bin/env node

/**
 * Spire Ascent - Sprite Sheet Generator
 *
 * Bundles individual WebP images into sprite sheet(s) for performance.
 * Generates a JSON manifest mapping IDs to sprite positions.
 *
 * Usage:
 *   node scripts/generate-sprite-sheets.js [options]
 *
 * Options:
 *   --type=TYPE   Asset type to generate: "enemies" (default) or "cards"
 *   --dry-run     Show what would be generated without writing files
 *   --cols=N      Number of columns in the sprite grid (default: 6 enemies, 10 cards)
 *   --size=N      Size of each sprite cell in pixels (default: 512)
 *   --quality=N   WebP quality 1-100 (default: 80)
 *
 * Requires: sharp (devDependency)
 *
 * Output (enemies):
 *   src/assets/art/enemies/sprite-sheet.webp    - The sprite sheet image
 *   src/assets/art/enemies/sprite-manifest.json  - JSON manifest with positions
 *
 * Output (cards):
 *   src/assets/art/cards/sprite-sheet.webp      - The sprite sheet image
 *   src/assets/art/cards/sprite-manifest.json    - JSON manifest with positions
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
  let type = 'enemies';
  let cols = null; // Will default based on type
  let cellSize = 512;
  let quality = 80;

  args.forEach(arg => {
    if (arg.startsWith('--type=')) type = arg.split('=')[1];
    if (arg.startsWith('--cols=')) cols = parseInt(arg.split('=')[1]);
    if (arg.startsWith('--size=')) cellSize = parseInt(arg.split('=')[1]);
    if (arg.startsWith('--quality=')) quality = parseInt(arg.split('=')[1]);
  });

  // Type-specific configuration
  const config = {
    enemies: {
      dir: path.join(__dirname, '../src/assets/art/enemies'),
      dataPath: path.join(__dirname, '../src/data/enemies.js'),
      label: 'ENEMY',
      manifestKey: 'enemies',
      defaultCols: 7,
    },
    cards: {
      dir: path.join(__dirname, '../src/assets/art/cards'),
      dataPath: path.join(__dirname, '../src/data/cards.js'),
      label: 'CARD',
      manifestKey: 'cards',
      defaultCols: 10,
    },
  };

  if (!config[type]) {
    console.error(`ERROR: Unknown type "${type}". Use --type=enemies or --type=cards`);
    process.exit(1);
  }

  const cfg = config[type];
  if (cols === null) cols = cfg.defaultCols;

  const artDir = cfg.dir;
  const dataPath = cfg.dataPath;

  // Find all WebP images (exclude sprite sheets themselves)
  const files = fs.readdirSync(artDir)
    .filter(f => f.endsWith('.webp') && !f.startsWith('sprite-'))
    .sort();

  if (files.length === 0) {
    console.log(`No ${type} images found.`);
    return;
  }

  // Cross-reference data IDs against art files
  const artIds = new Set(files.map(f => path.parse(f).name));
  const dataSource = fs.readFileSync(dataPath, 'utf-8');
  const dataIds = [...dataSource.matchAll(/^\s+id:\s*'([^']+)'/gm)].map(m => m[1]);
  const missingArt = dataIds.filter(id => !artIds.has(id));

  if (missingArt.length > 0) {
    console.error(`ERROR: ${cfg.label}s defined in data but missing art:`);
    missingArt.forEach(id => console.error(`  - ${id}`));
    console.error(`\nAdd WebP images to ${artDir} for these ${type}.`);
    process.exit(1);
  }

  console.log('='.repeat(60));
  console.log(`SPIRE ASCENT - ${cfg.label} SPRITE SHEET GENERATOR`);
  console.log('='.repeat(60));
  console.log(`Found ${files.length} ${type} images`);
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
    [cfg.manifestKey]: {}
  };

  const composites = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const itemId = path.parse(file).name;
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = col * cellSize;
    const y = row * cellSize;

    manifest[cfg.manifestKey][itemId] = {
      x,
      y,
      col,
      row,
      index: i
    };

    console.log(`  [${i}] ${itemId} -> col=${col}, row=${row} (${x},${y})`);

    if (!dryRun) {
      const filePath = path.join(artDir, file);
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

  const sheetPath = path.join(artDir, 'sprite-sheet.webp');
  fs.writeFileSync(sheetPath, spriteBuffer);

  const sheetKB = (spriteBuffer.length / 1024).toFixed(1);
  console.log(`Sprite sheet: ${sheetKB}KB`);

  // Calculate individual files total size for comparison
  let individualTotal = 0;
  for (const file of files) {
    const stats = fs.statSync(path.join(artDir, file));
    individualTotal += stats.size;
  }
  const individualKB = (individualTotal / 1024).toFixed(1);
  console.log(`Individual files total: ${individualKB}KB`);
  console.log(`Reduction: ${files.length} requests -> 1 request`);

  // Write manifest
  const manifestPath = path.join(artDir, 'sprite-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`Manifest written: ${manifestPath}`);

  console.log('\n' + '='.repeat(60));
  console.log('DONE');
  console.log('='.repeat(60));
}

main().catch(console.error);
