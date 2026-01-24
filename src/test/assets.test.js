import { describe, it, expect, beforeEach } from 'vitest';
import { ALL_ENEMIES } from '../data/enemies';
import {
  ENEMY_SIZES,
  getEnemyImagePath,
  getEnemySizeForType,
  hasImage,
  isValidAssetName,
  clearImageCache,
} from '../utils/assetLoader';

describe('Asset Pipeline - Enemy Art', () => {

  describe('ENEMY_SIZES constants', () => {
    it('should define correct size for normal enemies (256x256)', () => {
      expect(ENEMY_SIZES.normal).toBe(256);
    });

    it('should define correct size for elite enemies (384x384)', () => {
      expect(ENEMY_SIZES.elite).toBe(384);
    });

    it('should define correct size for boss enemies (512x512)', () => {
      expect(ENEMY_SIZES.boss).toBe(512);
    });
  });

  describe('getEnemySizeForType', () => {
    it('should return 256 for normal type', () => {
      expect(getEnemySizeForType('normal')).toBe(256);
    });

    it('should return 384 for elite type', () => {
      expect(getEnemySizeForType('elite')).toBe(384);
    });

    it('should return 512 for boss type', () => {
      expect(getEnemySizeForType('boss')).toBe(512);
    });

    it('should return 256 (normal) for minion type', () => {
      expect(getEnemySizeForType('minion')).toBe(256);
    });

    it('should return 256 (normal) for unknown type', () => {
      expect(getEnemySizeForType('unknown')).toBe(256);
    });
  });

  describe('getEnemyImagePath', () => {
    it('should return correct path for a simple enemy ID', () => {
      expect(getEnemyImagePath('cultist')).toBe('/images/enemies/cultist.png');
    });

    it('should return correct path for an underscore enemy ID', () => {
      expect(getEnemyImagePath('louse_red')).toBe('/images/enemies/louse_red.png');
    });

    it('should return correct path for a camelCase enemy ID', () => {
      expect(getEnemyImagePath('jawWorm')).toBe('/images/enemies/jawWorm.png');
    });

    it('should return correct path for a boss enemy ID', () => {
      expect(getEnemyImagePath('slimeBoss')).toBe('/images/enemies/slimeBoss.png');
    });
  });

  describe('isValidAssetName', () => {
    it('should accept simple lowercase IDs', () => {
      expect(isValidAssetName('cultist')).toBe(true);
    });

    it('should accept camelCase IDs', () => {
      expect(isValidAssetName('jawWorm')).toBe(true);
    });

    it('should accept underscore IDs', () => {
      expect(isValidAssetName('louse_red')).toBe(true);
    });

    it('should accept IDs with numbers', () => {
      expect(isValidAssetName('sentry2')).toBe(true);
    });

    it('should reject empty string', () => {
      expect(isValidAssetName('')).toBe(false);
    });

    it('should reject null', () => {
      expect(isValidAssetName(null)).toBe(false);
    });

    it('should reject undefined', () => {
      expect(isValidAssetName(undefined)).toBe(false);
    });

    it('should reject IDs with spaces', () => {
      expect(isValidAssetName('jaw worm')).toBe(false);
    });

    it('should reject IDs starting with numbers', () => {
      expect(isValidAssetName('1cultist')).toBe(false);
    });

    it('should reject IDs with special characters', () => {
      expect(isValidAssetName('cultist!')).toBe(false);
      expect(isValidAssetName('louse-red')).toBe(false);
      expect(isValidAssetName('slime.boss')).toBe(false);
    });
  });

  describe('hasImage - cache behavior', () => {
    beforeEach(() => {
      clearImageCache();
    });

    it('should return false for uncached enemy IDs', () => {
      expect(hasImage('cultist')).toBe(false);
    });

    it('should return false for unknown enemy IDs', () => {
      expect(hasImage('nonexistent_enemy')).toBe(false);
    });
  });

  describe('Enemy ID naming conventions', () => {
    it('should have ALL_ENEMIES defined with entries', () => {
      expect(ALL_ENEMIES).toBeDefined();
      expect(ALL_ENEMIES.length).toBeGreaterThan(0);
    });

    it('all enemy IDs should be valid asset names', () => {
      const invalidIds = ALL_ENEMIES.filter(enemy => !isValidAssetName(enemy.id));
      if (invalidIds.length > 0) {
        const names = invalidIds.map(e => `"${e.id}"`).join(', ');
        throw new Error(`Invalid asset names found: ${names}`);
      }
      expect(invalidIds).toHaveLength(0);
    });

    it('all enemy IDs should produce valid PNG file paths', () => {
      ALL_ENEMIES.forEach(enemy => {
        const path = getEnemyImagePath(enemy.id);
        expect(path).toMatch(/^\/images\/enemies\/[a-zA-Z][a-zA-Z0-9_]*\.png$/);
      });
    });

    it('all enemy IDs should be unique', () => {
      const ids = ALL_ENEMIES.map(e => e.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('all enemies should have a type property', () => {
      ALL_ENEMIES.forEach(enemy => {
        expect(enemy.type).toBeDefined();
        expect(['normal', 'elite', 'boss', 'minion']).toContain(enemy.type);
      });
    });

    it('all enemies should map to a valid size constant based on type', () => {
      ALL_ENEMIES.forEach(enemy => {
        const size = getEnemySizeForType(enemy.type);
        expect(size).toBeGreaterThan(0);
        expect([256, 384, 512]).toContain(size);
      });
    });

    it('boss enemies should use 512px size', () => {
      const bosses = ALL_ENEMIES.filter(e => e.type === 'boss');
      expect(bosses.length).toBeGreaterThan(0);
      bosses.forEach(boss => {
        expect(getEnemySizeForType(boss.type)).toBe(512);
      });
    });

    it('elite enemies should use 384px size', () => {
      const elites = ALL_ENEMIES.filter(e => e.type === 'elite');
      expect(elites.length).toBeGreaterThan(0);
      elites.forEach(elite => {
        expect(getEnemySizeForType(elite.type)).toBe(384);
      });
    });

    it('normal enemies should use 256px size', () => {
      const normals = ALL_ENEMIES.filter(e => e.type === 'normal');
      expect(normals.length).toBeGreaterThan(0);
      normals.forEach(normal => {
        expect(getEnemySizeForType(normal.type)).toBe(256);
      });
    });

    it('all enemies should have image paths that follow the naming convention {enemyId}.png', () => {
      ALL_ENEMIES.forEach(enemy => {
        const path = getEnemyImagePath(enemy.id);
        const expectedPath = `/images/enemies/${enemy.id}.png`;
        expect(path).toBe(expectedPath);
      });
    });

    it('no enemy IDs should contain path-unsafe characters', () => {
      const unsafePattern = /[\/\\:*?"<>|#%&{}$!@+`=]/;
      ALL_ENEMIES.forEach(enemy => {
        expect(unsafePattern.test(enemy.id)).toBe(false);
      });
    });
  });
});
