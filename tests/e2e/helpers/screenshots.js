import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_DIR = path.resolve(__dirname, '../../../screenshots');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Take a timestamped screenshot. Useful for debugging test runs.
 */
export async function takeScreenshot(page, name, options = {}) {
  const dir = options.dir || process.env.SCREENSHOT_DIR || DEFAULT_DIR;
  ensureDir(dir);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${name}-${timestamp}.png`;
  const filepath = path.join(dir, filename);

  await page.screenshot({
    path: filepath,
    fullPage: options.fullPage !== false,
  });

  return filepath;
}

/**
 * Take a screenshot with a clean name (no timestamp).
 * Ideal for PR attachments - overwrites previous screenshot of same name.
 */
export async function takeNamedScreenshot(page, name, options = {}) {
  const dir = options.dir || process.env.SCREENSHOT_DIR || DEFAULT_DIR;
  ensureDir(dir);

  const filepath = path.join(dir, `${name}.png`);

  await page.screenshot({
    path: filepath,
    fullPage: options.fullPage !== false,
  });

  return filepath;
}
