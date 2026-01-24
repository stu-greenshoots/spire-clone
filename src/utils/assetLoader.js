/**
 * Asset Loader Utility for Enemy Art Pipeline
 *
 * Provides image preloading, caching, and fallback logic for enemy display.
 * When a PNG exists in public/images/enemies/{enemyId}.png, it will be shown.
 * Otherwise, the component falls back to the existing emoji/ASCII art display.
 */

// Size constants for enemy art assets (in pixels)
export const ENEMY_SIZES = {
  normal: 256,
  elite: 384,
  boss: 512,
};

// In-memory cache for image load status
// Maps enemyId -> { loaded: boolean, error: boolean, url: string }
const imageCache = new Map();

// Set of image paths currently being preloaded
const preloadingSet = new Set();

/**
 * Get the expected image path for an enemy ID.
 * Convention: public/images/enemies/{enemyId}.png
 * @param {string} enemyId - The enemy identifier (e.g., 'cultist', 'jaw_worm')
 * @returns {string} The path to the enemy image relative to public root
 */
export function getEnemyImagePath(enemyId) {
  return `/images/enemies/${enemyId}.png`;
}

/**
 * Get the appropriate display size for an enemy based on its type.
 * @param {string} type - The enemy type ('normal', 'elite', 'boss', 'minion')
 * @returns {number} The size in pixels for the enemy image
 */
export function getEnemySizeForType(type) {
  if (type === 'boss') return ENEMY_SIZES.boss;
  if (type === 'elite') return ENEMY_SIZES.elite;
  return ENEMY_SIZES.normal;
}

/**
 * Preload an image and store its status in the cache.
 * Returns a promise that resolves when the image loads or rejects on error.
 * @param {string} path - The image path to preload
 * @returns {Promise<string>} Resolves with the path on success
 */
export function preloadImage(path) {
  // Return cached result if already loaded
  if (imageCache.has(path)) {
    const cached = imageCache.get(path);
    if (cached.loaded) return Promise.resolve(path);
    if (cached.error) return Promise.reject(new Error(`Image not found: ${path}`));
  }

  // Avoid duplicate preload requests
  if (preloadingSet.has(path)) {
    return new Promise((resolve, reject) => {
      const check = () => {
        if (imageCache.has(path)) {
          const cached = imageCache.get(path);
          if (cached.loaded) resolve(path);
          else reject(new Error(`Image not found: ${path}`));
        } else {
          setTimeout(check, 50);
        }
      };
      check();
    });
  }

  preloadingSet.add(path);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      imageCache.set(path, { loaded: true, error: false, url: path });
      preloadingSet.delete(path);
      resolve(path);
    };
    img.onerror = () => {
      imageCache.set(path, { loaded: false, error: true, url: path });
      preloadingSet.delete(path);
      reject(new Error(`Image not found: ${path}`));
    };
    img.src = path;
  });
}

/**
 * Check if an image exists (has been successfully loaded) for a given enemy ID.
 * This is synchronous and checks the cache only.
 * Call preloadEnemyImage first to populate the cache.
 * @param {string} enemyId - The enemy identifier
 * @returns {boolean} True if image is cached and loaded successfully
 */
export function hasImage(enemyId) {
  const path = getEnemyImagePath(enemyId);
  const cached = imageCache.get(path);
  return cached ? cached.loaded : false;
}

/**
 * Preload the image for a specific enemy by ID.
 * @param {string} enemyId - The enemy identifier
 * @returns {Promise<string>} Resolves with the image path on success
 */
export function preloadEnemyImage(enemyId) {
  const path = getEnemyImagePath(enemyId);
  return preloadImage(path);
}

/**
 * Preload images for multiple enemies.
 * Failures are silently caught (enemies without art simply won't show images).
 * @param {string[]} enemyIds - Array of enemy identifiers to preload
 * @returns {Promise<Object>} Resolves with { loaded: string[], failed: string[] }
 */
export async function preloadEnemyImages(enemyIds) {
  const results = await Promise.allSettled(
    enemyIds.map(id => preloadEnemyImage(id))
  );

  const loaded = [];
  const failed = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      loaded.push(enemyIds[index]);
    } else {
      failed.push(enemyIds[index]);
    }
  });

  return { loaded, failed };
}

/**
 * Clear the image cache. Useful for testing or forced re-checks.
 */
export function clearImageCache() {
  imageCache.clear();
  preloadingSet.clear();
}

/**
 * Get cache status for debugging.
 * @returns {Object} Current cache state
 */
export function getCacheStatus() {
  const entries = {};
  imageCache.forEach((value, key) => {
    entries[key] = value;
  });
  return {
    size: imageCache.size,
    preloading: preloadingSet.size,
    entries,
  };
}

/**
 * Validates that an enemy ID follows the expected naming convention
 * for asset file names. IDs should be lowercase with underscores
 * (matching the pattern used in enemies.js).
 * @param {string} enemyId - The enemy identifier to validate
 * @returns {boolean} True if the ID produces a valid filename
 */
export function isValidAssetName(enemyId) {
  // Must be a non-empty string
  if (!enemyId || typeof enemyId !== 'string') return false;
  // Only allow lowercase letters, numbers, and underscores
  // (camelCase IDs are also valid as they produce valid filenames)
  return /^[a-zA-Z][a-zA-Z0-9_]*$/.test(enemyId);
}
