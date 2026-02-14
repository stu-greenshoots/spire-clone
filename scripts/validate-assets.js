import fs from 'fs';
import path from 'path';

const PLACEHOLDER_THRESHOLD_KB = 5;
const WARN_RATE = 0.05;
const FAIL_RATE = 0.20;
const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp']);

const ROOT = path.resolve(import.meta.dirname, '..');

const ASSET_DIRS = [
  { label: 'Cards', dir: path.join(ROOT, 'public/images/cards') },
  { label: 'Enemies', dir: path.join(ROOT, 'public/images/enemies') },
  { label: 'Relics', dir: path.join(ROOT, 'public/images/relics') },
];

function scanDirectory(dirPath) {
  const results = { total: 0, placeholders: 0 };

  if (!fs.existsSync(dirPath)) {
    return results;
  }

  function walk(currentPath) {
    let entries;
    try {
      entries = fs.readdirSync(currentPath, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (!IMAGE_EXTENSIONS.has(ext)) continue;

        results.total++;

        try {
          const stat = fs.statSync(fullPath);
          if (stat.size < PLACEHOLDER_THRESHOLD_KB * 1024) {
            results.placeholders++;
          }
        } catch {
          // If we can't stat a file, skip it
        }
      }
    }
  }

  walk(dirPath);
  return results;
}

// Run validation
const report = ASSET_DIRS.map(({ label, dir }) => {
  const { total, placeholders } = scanDirectory(dir);
  return { label, total, placeholders };
});

const totalImages = report.reduce((sum, r) => sum + r.total, 0);
const totalPlaceholders = report.reduce((sum, r) => sum + r.placeholders, 0);
const realAssets = totalImages - totalPlaceholders;
const placeholderRate = totalImages > 0 ? totalPlaceholders / totalImages : 0;

// Print report
console.log('');
console.log('Asset Validation Report');
console.log('========================');

const maxLabelLen = Math.max(...report.map(r => r.label.length));
for (const { label, total, placeholders } of report) {
  const paddedLabel = (label + ':').padEnd(maxLabelLen + 2);
  console.log(`${paddedLabel}${total} images found, ${placeholders} placeholders (<5KB)`);
}

console.log('');
const overallLabel = 'Overall:'.padEnd(maxLabelLen + 2);
const pctStr = (placeholderRate * 100).toFixed(1);
console.log(`${overallLabel}${realAssets}/${totalImages} real assets (${pctStr}% placeholder rate)`);

let status;
let exitCode;
if (placeholderRate > FAIL_RATE) {
  status = 'FAIL';
  exitCode = 1;
} else if (placeholderRate > WARN_RATE) {
  status = 'WARN (>5% placeholders)';
  exitCode = 0;
} else {
  status = 'PASS';
  exitCode = 0;
}

const statusLabel = 'Status:'.padEnd(maxLabelLen + 2);
console.log(`${statusLabel}${status}`);
console.log('');

process.exit(exitCode);
