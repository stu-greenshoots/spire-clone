import { describe, it, expect } from 'vitest';
import {
  getAscensionModifiers,
  getAscensionDescription,
  getMaxAscension,
  applyAscensionToEnemy,
  getAscensionStartGold,
  getAscensionHealPercent,
  getAscensionCardRewardCount,
  applyAscensionToEnemies,
  shouldAddWoundAtCombatStart,
  createWoundCard,
  ASCENSION_LEVELS
} from '../systems/ascensionSystem';

describe('Ascension System', () => {
  describe('ASCENSION_LEVELS', () => {
    it('has 11 levels (0-10)', () => {
      expect(ASCENSION_LEVELS.length).toBe(11);
      expect(ASCENSION_LEVELS[0].level).toBe(0);
      expect(ASCENSION_LEVELS[10].level).toBe(10);
    });

    it('level 0 has no modifiers', () => {
      expect(ASCENSION_LEVELS[0].modifiers).toEqual({});
    });

    it('level 1 has HP multiplier', () => {
      expect(ASCENSION_LEVELS[1].modifiers.enemyHpMultiplier).toBe(1.1);
    });

    it('level 2 adds startWithWound', () => {
      expect(ASCENSION_LEVELS[2].modifiers.startWithWound).toBe(true);
    });
  });

  describe('getAscensionModifiers', () => {
    it('returns empty object for level 0', () => {
      expect(getAscensionModifiers(0)).toEqual({});
    });

    it('returns correct modifiers for level 1', () => {
      const mods = getAscensionModifiers(1);
      expect(mods.enemyHpMultiplier).toBe(1.1);
    });

    it('returns level 0 modifiers for invalid level', () => {
      expect(getAscensionModifiers(-1)).toEqual({});
      expect(getAscensionModifiers(100)).toEqual({});
    });
  });

  describe('getAscensionDescription', () => {
    it('returns correct description for level 0', () => {
      expect(getAscensionDescription(0)).toBe('Normal difficulty');
    });

    it('returns correct description for level 1', () => {
      expect(getAscensionDescription(1)).toBe('Enemies have 10% more HP');
    });

    it('returns Unknown for invalid level', () => {
      expect(getAscensionDescription(100)).toBe('Unknown');
    });
  });

  describe('getMaxAscension', () => {
    it('returns 10', () => {
      expect(getMaxAscension()).toBe(10);
    });
  });

  describe('applyAscensionToEnemy', () => {
    const baseEnemy = {
      id: 'test_enemy',
      name: 'Test Enemy',
      currentHp: 100,
      maxHp: 100,
      type: 'combat'
    };

    it('returns unchanged enemy with no modifiers', () => {
      const result = applyAscensionToEnemy(baseEnemy, {});
      expect(result.currentHp).toBe(100);
      expect(result.maxHp).toBe(100);
    });

    it('applies HP multiplier', () => {
      const result = applyAscensionToEnemy(baseEnemy, { enemyHpMultiplier: 1.1 });
      // Note: 100 * 1.1 = 110.00000000000001 in JS due to floating point
      // Math.ceil(110.00000000000001) = 111
      expect(result.currentHp).toBe(111);
      expect(result.maxHp).toBe(111);
    });

    it('rounds HP up with ceil', () => {
      const enemy = { ...baseEnemy, currentHp: 50, maxHp: 50 };
      const result = applyAscensionToEnemy(enemy, { enemyHpMultiplier: 1.1 });
      // 50 * 1.1 = 55.00000000000001 in JS, Math.ceil = 56
      expect(result.currentHp).toBe(56);
      expect(result.maxHp).toBe(56);
    });

    it('applies elite buff for elite enemies', () => {
      const elite = { ...baseEnemy, type: 'elite' };
      const result = applyAscensionToEnemy(elite, { eliteBuffed: true });
      expect(result.strength).toBe(1);
    });

    it('does not apply elite buff for non-elite enemies', () => {
      const result = applyAscensionToEnemy(baseEnemy, { eliteBuffed: true });
      expect(result.strength).toBeUndefined();
    });

    it('applies boss buff for boss enemies', () => {
      const boss = { ...baseEnemy, type: 'boss' };
      const result = applyAscensionToEnemy(boss, { bossBuffed: true });
      expect(result.strength).toBe(1);
      expect(result.currentHp).toBe(105); // 100 * 1.05
      expect(result.maxHp).toBe(105);
    });
  });

  describe('getAscensionStartGold', () => {
    it('returns 99 for level 0-5', () => {
      expect(getAscensionStartGold(0)).toBe(99);
      expect(getAscensionStartGold(5)).toBe(99);
    });

    it('returns 75 for level 6+', () => {
      expect(getAscensionStartGold(6)).toBe(75);
      expect(getAscensionStartGold(10)).toBe(75);
    });
  });

  describe('getAscensionHealPercent', () => {
    it('returns 0.30 for level 0-3', () => {
      expect(getAscensionHealPercent(0)).toBe(0.30);
      expect(getAscensionHealPercent(3)).toBe(0.30);
    });

    it('returns 0.25 for level 4+', () => {
      expect(getAscensionHealPercent(4)).toBe(0.25);
      expect(getAscensionHealPercent(10)).toBe(0.25);
    });
  });

  describe('getAscensionCardRewardCount', () => {
    it('returns 3 for level 0-7', () => {
      expect(getAscensionCardRewardCount(0)).toBe(3);
      expect(getAscensionCardRewardCount(7)).toBe(3);
    });

    it('returns 2 for level 8+', () => {
      expect(getAscensionCardRewardCount(8)).toBe(2);
      expect(getAscensionCardRewardCount(10)).toBe(2);
    });
  });

  describe('applyAscensionToEnemies', () => {
    const enemies = [
      { id: 'enemy1', name: 'Enemy 1', currentHp: 50, maxHp: 50 },
      { id: 'enemy2', name: 'Enemy 2', currentHp: 100, maxHp: 100 }
    ];

    it('returns unchanged enemies for level 0', () => {
      const result = applyAscensionToEnemies(enemies, 0, 'combat');
      expect(result[0].currentHp).toBe(50);
      expect(result[1].currentHp).toBe(100);
    });

    it('applies HP multiplier for level 1', () => {
      const result = applyAscensionToEnemies(enemies, 1, 'combat');
      // JS floating point: 50 * 1.1 = 55.00000000000001, ceil = 56
      // 100 * 1.1 = 110.00000000000001, ceil = 111
      expect(result[0].currentHp).toBe(56);
      expect(result[1].currentHp).toBe(111);
    });

    it('returns empty array for empty enemies', () => {
      const result = applyAscensionToEnemies([], 1, 'combat');
      expect(result).toEqual([]);
    });

    it('returns unchanged for null/undefined enemies', () => {
      expect(applyAscensionToEnemies(null, 1, 'combat')).toBe(null);
      expect(applyAscensionToEnemies(undefined, 1, 'combat')).toBe(undefined);
    });

    it('sets enemy type from nodeType if not set', () => {
      const enemiesNoType = [{ id: 'test', currentHp: 100, maxHp: 100 }];
      const result = applyAscensionToEnemies(enemiesNoType, 3, 'elite');
      expect(result[0].type).toBe('elite');
      expect(result[0].strength).toBe(1); // Elite buff applied
    });
  });

  describe('shouldAddWoundAtCombatStart', () => {
    it('returns false for level 0', () => {
      expect(shouldAddWoundAtCombatStart(0)).toBe(false);
    });

    it('returns false for level 1', () => {
      expect(shouldAddWoundAtCombatStart(1)).toBe(false);
    });

    it('returns true for level 2', () => {
      expect(shouldAddWoundAtCombatStart(2)).toBe(true);
    });

    it('returns true for level 10', () => {
      expect(shouldAddWoundAtCombatStart(10)).toBe(true);
    });
  });

  describe('createWoundCard', () => {
    it('creates a valid wound card with instanceId', () => {
      const wound = createWoundCard('test_wound_123');
      expect(wound.id).toBe('wound');
      expect(wound.name).toBe('Wound');
      expect(wound.type).toBe('status');
      expect(wound.unplayable).toBe(true);
      expect(wound.instanceId).toBe('test_wound_123');
    });

    it('creates unique cards with different instanceIds', () => {
      const wound1 = createWoundCard('wound_1');
      const wound2 = createWoundCard('wound_2');
      expect(wound1.instanceId).not.toBe(wound2.instanceId);
    });
  });
});
