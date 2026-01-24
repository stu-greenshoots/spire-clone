import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  ENEMY_SIZES,
  getEnemyImagePath,
  getEnemySizeForType,
  hasImage,
  preloadImage,
  preloadEnemyImage,
  preloadEnemyImages,
  clearImageCache,
  getCacheStatus,
  isValidAssetName,
} from '../utils/assetLoader';

/**
 * Tests for the enemy art asset pipeline (assetLoader.js).
 *
 * Covers:
 * - getEnemyImagePath: correct path generation
 * - getEnemySizeForType: valid dimensions for each enemy type
 * - hasImage: boolean result based on cache state
 * - preloadImage / preloadEnemyImage: promise-based loading with Image mock
 * - preloadEnemyImages: batch preloading
 * - getCacheStatus: cache introspection
 * - clearImageCache: cache reset
 * - Fallback behavior: when images fail to load
 * - isValidAssetName: ID validation
 * - Edge cases
 */

// Mock the global Image constructor for preload tests
class MockImage {
  constructor() {
    this._src = '';
    // Simulate async image load by deferring onload/onerror
    MockImage.instances.push(this);
  }
  get src() {
    return this._src;
  }
  set src(value) {
    this._src = value;
    // Auto-trigger based on the path for testing
    if (MockImage.autoResolve) {
      setTimeout(() => {
        if (this.onload) this.onload();
      }, 0);
    } else if (MockImage.autoReject) {
      setTimeout(() => {
        if (this.onerror) this.onerror(new Error('Load failed'));
      }, 0);
    }
    // If neither autoResolve nor autoReject, caller can trigger manually
  }
}
MockImage.instances = [];
MockImage.autoResolve = false;
MockImage.autoReject = false;

describe('Asset Loader - Enemy Art Pipeline', () => {
  let originalImage;

  beforeEach(() => {
    clearImageCache();
    MockImage.instances = [];
    MockImage.autoResolve = false;
    MockImage.autoReject = false;
    originalImage = global.Image;
    global.Image = MockImage;
  });

  afterEach(() => {
    global.Image = originalImage;
  });

  // =============================================
  // getEnemyImagePath
  // =============================================
  describe('getEnemyImagePath', () => {
    it('should return a path under /images/enemies/ with .png extension', () => {
      const path = getEnemyImagePath('cultist');
      expect(path).toBe('/images/enemies/cultist.png');
    });

    it('should preserve camelCase enemy IDs in the path', () => {
      const path = getEnemyImagePath('jawWorm');
      expect(path).toBe('/images/enemies/jawWorm.png');
    });

    it('should preserve underscore enemy IDs in the path', () => {
      const path = getEnemyImagePath('louse_red');
      expect(path).toBe('/images/enemies/louse_red.png');
    });

    it('should handle boss enemy IDs', () => {
      const path = getEnemyImagePath('slimeBoss');
      expect(path).toBe('/images/enemies/slimeBoss.png');
    });

    it('should handle enemy IDs with numbers', () => {
      const path = getEnemyImagePath('sentry2');
      expect(path).toBe('/images/enemies/sentry2.png');
    });

    it('should always start with /images/enemies/', () => {
      const ids = ['cultist', 'jawWorm', 'slimeBoss', 'louse_red', 'hexaghost'];
      ids.forEach(id => {
        expect(getEnemyImagePath(id)).toMatch(/^\/images\/enemies\/.+\.png$/);
      });
    });
  });

  // =============================================
  // getEnemySizeForType
  // =============================================
  describe('getEnemySizeForType', () => {
    it('should return 256 for normal enemies', () => {
      expect(getEnemySizeForType('normal')).toBe(256);
    });

    it('should return 384 for elite enemies', () => {
      expect(getEnemySizeForType('elite')).toBe(384);
    });

    it('should return 512 for boss enemies', () => {
      expect(getEnemySizeForType('boss')).toBe(512);
    });

    it('should return 256 (normal default) for minion type', () => {
      expect(getEnemySizeForType('minion')).toBe(256);
    });

    it('should return 256 (normal default) for undefined type', () => {
      expect(getEnemySizeForType(undefined)).toBe(256);
    });

    it('should return 256 (normal default) for empty string type', () => {
      expect(getEnemySizeForType('')).toBe(256);
    });

    it('should always return a positive number', () => {
      const types = ['normal', 'elite', 'boss', 'minion', 'unknown', '', null, undefined];
      types.forEach(type => {
        const size = getEnemySizeForType(type);
        expect(size).toBeGreaterThan(0);
      });
    });

    it('should only return values from ENEMY_SIZES constants', () => {
      const validSizes = Object.values(ENEMY_SIZES);
      const types = ['normal', 'elite', 'boss', 'minion', 'unknown'];
      types.forEach(type => {
        expect(validSizes).toContain(getEnemySizeForType(type));
      });
    });
  });

  // =============================================
  // hasImage - cache-based checks
  // =============================================
  describe('hasImage', () => {
    it('should return false for an enemy that has never been preloaded', () => {
      expect(hasImage('cultist')).toBe(false);
    });

    it('should return false for a non-existent enemy ID', () => {
      expect(hasImage('totally_fake_enemy')).toBe(false);
    });

    it('should return true after a successful preload', async () => {
      MockImage.autoResolve = true;
      await preloadEnemyImage('cultist');
      expect(hasImage('cultist')).toBe(true);
    });

    it('should return false after a failed preload', async () => {
      MockImage.autoReject = true;
      try {
        await preloadEnemyImage('missing_enemy');
      } catch {
        // expected
      }
      expect(hasImage('missing_enemy')).toBe(false);
    });

    it('should return false after cache is cleared even if previously loaded', async () => {
      MockImage.autoResolve = true;
      await preloadEnemyImage('cultist');
      expect(hasImage('cultist')).toBe(true);
      clearImageCache();
      expect(hasImage('cultist')).toBe(false);
    });

    it('should return a boolean value', () => {
      const result = hasImage('cultist');
      expect(typeof result).toBe('boolean');
    });
  });

  // =============================================
  // preloadImage
  // =============================================
  describe('preloadImage', () => {
    it('should return a promise', () => {
      MockImage.autoResolve = true;
      const result = preloadImage('/images/enemies/cultist.png');
      expect(result).toBeInstanceOf(Promise);
    });

    it('should resolve with the path on successful load', async () => {
      MockImage.autoResolve = true;
      const path = '/images/enemies/cultist.png';
      const result = await preloadImage(path);
      expect(result).toBe(path);
    });

    it('should reject with an error on failed load', async () => {
      MockImage.autoReject = true;
      const path = '/images/enemies/missing.png';
      await expect(preloadImage(path)).rejects.toThrow('Image not found');
    });

    it('should cache successful loads and return immediately on second call', async () => {
      MockImage.autoResolve = true;
      const path = '/images/enemies/cultist.png';
      await preloadImage(path);

      // Second call should resolve immediately from cache
      const result = await preloadImage(path);
      expect(result).toBe(path);
      // Only one Image instance should have been created
      expect(MockImage.instances.length).toBe(1);
    });

    it('should cache failed loads and reject immediately on second call', async () => {
      MockImage.autoReject = true;
      const path = '/images/enemies/missing.png';
      try {
        await preloadImage(path);
      } catch {
        // expected
      }

      // Second call should reject immediately from cache
      await expect(preloadImage(path)).rejects.toThrow('Image not found');
      // Only one Image instance should have been created
      expect(MockImage.instances.length).toBe(1);
    });

    it('should set the src property on the Image instance', async () => {
      MockImage.autoResolve = true;
      const path = '/images/enemies/cultist.png';
      await preloadImage(path);
      expect(MockImage.instances[0]._src).toBe(path);
    });
  });

  // =============================================
  // preloadEnemyImage
  // =============================================
  describe('preloadEnemyImage', () => {
    it('should return a promise', () => {
      MockImage.autoResolve = true;
      const result = preloadEnemyImage('cultist');
      expect(result).toBeInstanceOf(Promise);
    });

    it('should resolve with the correct image path for the enemy', async () => {
      MockImage.autoResolve = true;
      const result = await preloadEnemyImage('cultist');
      expect(result).toBe('/images/enemies/cultist.png');
    });

    it('should reject when the enemy image fails to load', async () => {
      MockImage.autoReject = true;
      await expect(preloadEnemyImage('missing_enemy')).rejects.toThrow('Image not found');
    });

    it('should make hasImage return true after successful load', async () => {
      MockImage.autoResolve = true;
      expect(hasImage('jawWorm')).toBe(false);
      await preloadEnemyImage('jawWorm');
      expect(hasImage('jawWorm')).toBe(true);
    });

    it('should use the correct path convention for the enemy ID', async () => {
      MockImage.autoResolve = true;
      await preloadEnemyImage('louse_red');
      expect(MockImage.instances[0]._src).toBe('/images/enemies/louse_red.png');
    });
  });

  // =============================================
  // preloadEnemyImages (batch)
  // =============================================
  describe('preloadEnemyImages', () => {
    it('should return an object with loaded and failed arrays', async () => {
      MockImage.autoResolve = true;
      const result = await preloadEnemyImages(['cultist', 'jawWorm']);
      expect(result).toHaveProperty('loaded');
      expect(result).toHaveProperty('failed');
      expect(Array.isArray(result.loaded)).toBe(true);
      expect(Array.isArray(result.failed)).toBe(true);
    });

    it('should report all as loaded when all succeed', async () => {
      MockImage.autoResolve = true;
      const enemies = ['cultist', 'jawWorm', 'slimeBoss'];
      const result = await preloadEnemyImages(enemies);
      expect(result.loaded).toEqual(enemies);
      expect(result.failed).toHaveLength(0);
    });

    it('should report all as failed when all fail', async () => {
      MockImage.autoReject = true;
      const enemies = ['fake1', 'fake2', 'fake3'];
      const result = await preloadEnemyImages(enemies);
      expect(result.loaded).toHaveLength(0);
      expect(result.failed).toEqual(enemies);
    });

    it('should handle an empty array without errors', async () => {
      const result = await preloadEnemyImages([]);
      expect(result.loaded).toHaveLength(0);
      expect(result.failed).toHaveLength(0);
    });

    it('should handle mixed success and failure', async () => {
      // Use a custom approach: resolve for specific paths, reject for others
      global.Image = class extends MockImage {
        set src(value) {
          this._src = value;
          setTimeout(() => {
            if (value.includes('cultist')) {
              if (this.onload) this.onload();
            } else {
              if (this.onerror) this.onerror(new Error('Not found'));
            }
          }, 0);
        }
      };

      const result = await preloadEnemyImages(['cultist', 'nonexistent']);
      expect(result.loaded).toContain('cultist');
      expect(result.failed).toContain('nonexistent');
    });
  });

  // =============================================
  // getCacheStatus
  // =============================================
  describe('getCacheStatus', () => {
    it('should return an object with size, preloading, and entries fields', () => {
      const status = getCacheStatus();
      expect(status).toHaveProperty('size');
      expect(status).toHaveProperty('preloading');
      expect(status).toHaveProperty('entries');
    });

    it('should report size 0 on a fresh cache', () => {
      const status = getCacheStatus();
      expect(status.size).toBe(0);
      expect(status.preloading).toBe(0);
    });

    it('should reflect loaded entries after successful preloads', async () => {
      MockImage.autoResolve = true;
      await preloadEnemyImage('cultist');
      const status = getCacheStatus();
      expect(status.size).toBe(1);
      expect(status.entries['/images/enemies/cultist.png']).toBeDefined();
      expect(status.entries['/images/enemies/cultist.png'].loaded).toBe(true);
    });

    it('should reflect error entries after failed preloads', async () => {
      MockImage.autoReject = true;
      try { await preloadEnemyImage('fake'); } catch { /* expected */ }
      const status = getCacheStatus();
      expect(status.size).toBe(1);
      expect(status.entries['/images/enemies/fake.png'].loaded).toBe(false);
      expect(status.entries['/images/enemies/fake.png'].error).toBe(true);
    });

    it('should report size 0 after clearImageCache', async () => {
      MockImage.autoResolve = true;
      await preloadEnemyImage('cultist');
      clearImageCache();
      const status = getCacheStatus();
      expect(status.size).toBe(0);
    });
  });

  // =============================================
  // clearImageCache
  // =============================================
  describe('clearImageCache', () => {
    it('should clear all cached entries', async () => {
      MockImage.autoResolve = true;
      await preloadEnemyImage('cultist');
      await preloadEnemyImage('jawWorm');
      expect(getCacheStatus().size).toBe(2);
      clearImageCache();
      expect(getCacheStatus().size).toBe(0);
    });

    it('should cause hasImage to return false for previously loaded enemies', async () => {
      MockImage.autoResolve = true;
      await preloadEnemyImage('cultist');
      expect(hasImage('cultist')).toBe(true);
      clearImageCache();
      expect(hasImage('cultist')).toBe(false);
    });

    it('should allow re-preloading after clearing', async () => {
      MockImage.autoResolve = true;
      await preloadEnemyImage('cultist');
      clearImageCache();
      // Should be able to preload again, creating a new Image instance
      await preloadEnemyImage('cultist');
      expect(hasImage('cultist')).toBe(true);
      expect(MockImage.instances.length).toBe(2); // Two Image instances created
    });
  });

  // =============================================
  // isValidAssetName
  // =============================================
  describe('isValidAssetName', () => {
    it('should accept lowercase alphabetic IDs', () => {
      expect(isValidAssetName('cultist')).toBe(true);
    });

    it('should accept camelCase IDs', () => {
      expect(isValidAssetName('jawWorm')).toBe(true);
      expect(isValidAssetName('slimeBoss')).toBe(true);
    });

    it('should accept IDs with underscores', () => {
      expect(isValidAssetName('louse_red')).toBe(true);
      expect(isValidAssetName('writhing_mass')).toBe(true);
    });

    it('should accept IDs with trailing numbers', () => {
      expect(isValidAssetName('sentry2')).toBe(true);
      expect(isValidAssetName('slime3')).toBe(true);
    });

    it('should reject empty string', () => {
      expect(isValidAssetName('')).toBe(false);
    });

    it('should reject null and undefined', () => {
      expect(isValidAssetName(null)).toBe(false);
      expect(isValidAssetName(undefined)).toBe(false);
    });

    it('should reject non-string types', () => {
      expect(isValidAssetName(123)).toBe(false);
      expect(isValidAssetName({})).toBe(false);
      expect(isValidAssetName([])).toBe(false);
    });

    it('should reject IDs starting with numbers', () => {
      expect(isValidAssetName('123enemy')).toBe(false);
    });

    it('should reject IDs with special characters', () => {
      expect(isValidAssetName('enemy!')).toBe(false);
      expect(isValidAssetName('louse-red')).toBe(false);
      expect(isValidAssetName('slime.boss')).toBe(false);
      expect(isValidAssetName('enemy@home')).toBe(false);
    });

    it('should reject IDs with spaces', () => {
      expect(isValidAssetName('jaw worm')).toBe(false);
    });

    it('should reject IDs with path separators', () => {
      expect(isValidAssetName('path/enemy')).toBe(false);
      expect(isValidAssetName('path\\enemy')).toBe(false);
    });
  });

  // =============================================
  // Fallback behavior (integration)
  // =============================================
  describe('Fallback behavior', () => {
    it('should gracefully handle missing images by leaving hasImage as false', async () => {
      MockImage.autoReject = true;
      try {
        await preloadEnemyImage('nonexistent_boss');
      } catch {
        // This is expected - image does not exist
      }
      // The fallback path: hasImage returns false, so Enemy.jsx uses ASCII art
      expect(hasImage('nonexistent_boss')).toBe(false);
    });

    it('should not throw when preloading a batch with all missing images', async () => {
      MockImage.autoReject = true;
      // preloadEnemyImages catches individual failures silently
      const result = await preloadEnemyImages(['fake1', 'fake2', 'fake3']);
      expect(result.loaded).toHaveLength(0);
      expect(result.failed).toHaveLength(3);
    });

    it('should allow successful images to display while failed ones fall back', async () => {
      // Simulate mixed loading: 'cultist' succeeds, 'unknown_foe' fails
      global.Image = class extends MockImage {
        set src(value) {
          this._src = value;
          setTimeout(() => {
            if (value.includes('cultist')) {
              if (this.onload) this.onload();
            } else {
              if (this.onerror) this.onerror(new Error('Not found'));
            }
          }, 0);
        }
      };

      await preloadEnemyImages(['cultist', 'unknown_foe']);

      // cultist has an image -> rendered via <img> tag
      expect(hasImage('cultist')).toBe(true);
      // unknown_foe does not -> rendered via ASCII/emoji fallback
      expect(hasImage('unknown_foe')).toBe(false);
    });

    it('should produce correct path even for enemies without actual images', () => {
      // The path is deterministic regardless of whether the file exists
      const path = getEnemyImagePath('totally_imaginary_enemy');
      expect(path).toBe('/images/enemies/totally_imaginary_enemy.png');
    });

    it('should not crash on repeated hasImage calls for same enemy', () => {
      // Calling hasImage many times should be safe (no side effects)
      for (let i = 0; i < 100; i++) {
        expect(hasImage('cultist')).toBe(false);
      }
    });
  });

  // =============================================
  // ENEMY_SIZES constant validation
  // =============================================
  describe('ENEMY_SIZES constants', () => {
    it('should have normal, elite, and boss size properties', () => {
      expect(ENEMY_SIZES).toHaveProperty('normal');
      expect(ENEMY_SIZES).toHaveProperty('elite');
      expect(ENEMY_SIZES).toHaveProperty('boss');
    });

    it('should have sizes in ascending order: normal < elite < boss', () => {
      expect(ENEMY_SIZES.normal).toBeLessThan(ENEMY_SIZES.elite);
      expect(ENEMY_SIZES.elite).toBeLessThan(ENEMY_SIZES.boss);
    });

    it('should have all sizes be positive integers', () => {
      Object.values(ENEMY_SIZES).forEach(size => {
        expect(Number.isInteger(size)).toBe(true);
        expect(size).toBeGreaterThan(0);
      });
    });
  });
});
