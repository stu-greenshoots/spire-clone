/**
 * QR-12: Custom Data Safety Tests
 * Tests for custom data validation, override detection, and safety features.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  hasCustomOverrides,
  getCustomOverridesSummary,
  validateCardData,
  validateEnemyData,
  validateRelicData,
  loadCustomData,
  saveCustomData
} from '../systems/customDataManager';

describe('Custom Data Safety', () => {
  const STORAGE_KEY = 'spireAscent_customData';

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.removeItem(STORAGE_KEY);
  });

  afterEach(() => {
    // Clean up after each test
    localStorage.removeItem(STORAGE_KEY);
  });

  describe('hasCustomOverrides', () => {
    it('returns false when no custom data exists', () => {
      expect(hasCustomOverrides()).toBe(false);
    });

    it('returns false when custom data is empty', () => {
      saveCustomData({ version: '1.0', cards: {}, relics: {}, enemies: {} });
      expect(hasCustomOverrides()).toBe(false);
    });

    it('returns true when cards are overridden', () => {
      saveCustomData({ version: '1.0', cards: { strike: { cost: 0 } }, relics: {}, enemies: {} });
      expect(hasCustomOverrides()).toBe(true);
    });

    it('returns true when relics are overridden', () => {
      saveCustomData({ version: '1.0', cards: {}, relics: { burningBlood: { amount: 10 } }, enemies: {} });
      expect(hasCustomOverrides()).toBe(true);
    });

    it('returns true when enemies are overridden', () => {
      saveCustomData({ version: '1.0', cards: {}, relics: {}, enemies: { cultist: { hp: 100 } } });
      expect(hasCustomOverrides()).toBe(true);
    });
  });

  describe('getCustomOverridesSummary', () => {
    it('returns empty arrays when no custom data exists', () => {
      const summary = getCustomOverridesSummary();
      expect(summary.cards).toEqual([]);
      expect(summary.relics).toEqual([]);
      expect(summary.enemies).toEqual([]);
    });

    it('returns IDs of overridden items', () => {
      saveCustomData({
        version: '1.0',
        cards: { strike: {}, defend: {} },
        relics: { burningBlood: {} },
        enemies: { cultist: {}, jawWorm: {}, slimeBoss: {} }
      });
      const summary = getCustomOverridesSummary();
      expect(summary.cards).toEqual(['strike', 'defend']);
      expect(summary.relics).toEqual(['burningBlood']);
      expect(summary.enemies).toEqual(['cultist', 'jawWorm', 'slimeBoss']);
    });
  });

  describe('validateCardData', () => {
    it('accepts valid card data', () => {
      const result = validateCardData({ id: 'strike', cost: 1, damage: 6 });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('accepts X-cost cards', () => {
      const result = validateCardData({ id: 'whirlwind', cost: 'X', damage: 5 });
      expect(result.valid).toBe(true);
    });

    it('accepts 0-cost cards', () => {
      const result = validateCardData({ id: 'anger', cost: 0, damage: 6 });
      expect(result.valid).toBe(true);
    });

    it('rejects cards without id', () => {
      const result = validateCardData({ cost: 1, damage: 6 });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Card must have a valid id');
    });

    it('rejects negative cost', () => {
      const result = validateCardData({ id: 'badCard', cost: -1, damage: 6 });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Negative cost'))).toBe(true);
    });

    it('rejects invalid cost type', () => {
      const result = validateCardData({ id: 'badCard', cost: 'free', damage: 6 });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid cost'))).toBe(true);
    });

    it('rejects negative damage', () => {
      const result = validateCardData({ id: 'badCard', cost: 1, damage: -5 });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Negative damage'))).toBe(true);
    });

    it('rejects negative block', () => {
      const result = validateCardData({ id: 'badCard', cost: 1, block: -5 });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Negative block'))).toBe(true);
    });
  });

  describe('validateEnemyData', () => {
    it('accepts valid enemy data', () => {
      const result = validateEnemyData({ id: 'cultist', hp: { min: 48, max: 54 } });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('accepts enemy with number HP', () => {
      const result = validateEnemyData({ id: 'boss', hp: 200 });
      expect(result.valid).toBe(true);
    });

    it('rejects enemies without id', () => {
      const result = validateEnemyData({ hp: { min: 48, max: 54 } });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Enemy must have a valid id');
    });

    it('rejects HP min less than 1', () => {
      const result = validateEnemyData({ id: 'weakEnemy', hp: { min: 0, max: 10 } });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('HP min'))).toBe(true);
    });

    it('rejects HP max less than 1', () => {
      const result = validateEnemyData({ id: 'weakEnemy', hp: { min: 10, max: 0 } });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('HP max'))).toBe(true);
    });

    it('rejects number HP less than 1', () => {
      const result = validateEnemyData({ id: 'deadEnemy', hp: 0 });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid HP'))).toBe(true);
    });
  });

  describe('validateRelicData', () => {
    it('accepts valid relic data', () => {
      const result = validateRelicData({ id: 'burningBlood', description: 'Heal 6 HP at end of combat' });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects relics without id', () => {
      const result = validateRelicData({ description: 'A mystery relic' });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Relic must have a valid id');
    });
  });
});

describe('Custom Data Load/Save', () => {
  const STORAGE_KEY = 'spireAscent_customData';

  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
  });

  afterEach(() => {
    localStorage.removeItem(STORAGE_KEY);
  });

  it('loadCustomData returns null when no data exists', () => {
    expect(loadCustomData()).toBe(null);
  });

  it('saveCustomData persists data to localStorage', () => {
    const data = { version: '1.0', cards: { strike: { cost: 0 } }, relics: {}, enemies: {} };
    saveCustomData(data);
    expect(loadCustomData()).toEqual(data);
  });

  it('loadCustomData handles invalid JSON gracefully', () => {
    localStorage.setItem(STORAGE_KEY, 'not valid json');
    expect(loadCustomData()).toBe(null);
  });
});
