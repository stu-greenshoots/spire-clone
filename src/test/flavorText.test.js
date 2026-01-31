import { describe, it, expect } from 'vitest';
import { ALL_CARDS } from '../data/cards';
import { ALL_ENEMIES } from '../data/enemies';
import { ALL_RELICS } from '../data/relics';
import {
  CARD_FLAVOR,
  ENEMY_LORE,
  ACT_DESCRIPTIONS,
  RELIC_FLAVOR,
  WORLD_LORE
} from '../data/flavorText';

describe('Flavor Text Data', () => {
  describe('CARD_FLAVOR', () => {
    it('should exist and be a non-empty object', () => {
      expect(CARD_FLAVOR).toBeDefined();
      expect(typeof CARD_FLAVOR).toBe('object');
      expect(Object.keys(CARD_FLAVOR).length).toBeGreaterThan(0);
    });

    it('should have keys matching actual card IDs from cards data', () => {
      const cardIds = ALL_CARDS.map(card => card.id);
      const flavorKeys = Object.keys(CARD_FLAVOR);

      flavorKeys.forEach(key => {
        expect(cardIds).toContain(key);
      });
    });

    it('should have flavor text for all cards', () => {
      const cardIds = ALL_CARDS.map(card => card.id);

      cardIds.forEach(id => {
        expect(CARD_FLAVOR[id]).toBeDefined();
        expect(typeof CARD_FLAVOR[id]).toBe('string');
        expect(CARD_FLAVOR[id].length).toBeGreaterThan(0);
      });
    });

    it('should not have any flavor text exceeding 200 characters', () => {
      Object.entries(CARD_FLAVOR).forEach(([key, text]) => {
        expect(text.length).toBeLessThanOrEqual(200);
      });
    });
  });

  describe('ENEMY_LORE', () => {
    it('should exist and be a non-empty object', () => {
      expect(ENEMY_LORE).toBeDefined();
      expect(typeof ENEMY_LORE).toBe('object');
      expect(Object.keys(ENEMY_LORE).length).toBeGreaterThan(0);
    });

    it('should have keys matching actual enemy IDs from enemies data', () => {
      const enemyIds = ALL_ENEMIES.map(enemy => enemy.id);
      const loreKeys = Object.keys(ENEMY_LORE);

      loreKeys.forEach(key => {
        expect(enemyIds).toContain(key);
      });
    });

    it('should have lore for all enemies', () => {
      const enemyIds = ALL_ENEMIES.map(enemy => enemy.id);

      enemyIds.forEach(id => {
        expect(ENEMY_LORE[id]).toBeDefined();
        expect(typeof ENEMY_LORE[id]).toBe('string');
        expect(ENEMY_LORE[id].length).toBeGreaterThan(0);
      });
    });

    it('should not have any lore text exceeding 200 characters', () => {
      Object.entries(ENEMY_LORE).forEach(([key, text]) => {
        expect(text.length).toBeLessThanOrEqual(200);
      });
    });
  });

  describe('ACT_DESCRIPTIONS', () => {
    it('should exist and be a non-empty object', () => {
      expect(ACT_DESCRIPTIONS).toBeDefined();
      expect(typeof ACT_DESCRIPTIONS).toBe('object');
      expect(Object.keys(ACT_DESCRIPTIONS).length).toBeGreaterThan(0);
    });

    it('should have descriptions for acts 1 through 3', () => {
      expect(ACT_DESCRIPTIONS[1]).toBeDefined();
      expect(ACT_DESCRIPTIONS[2]).toBeDefined();
      expect(ACT_DESCRIPTIONS[3]).toBeDefined();
    });

    it('should have name, subtitle, description, and entering for each act', () => {
      [1, 2, 3].forEach(act => {
        expect(ACT_DESCRIPTIONS[act].name).toBeDefined();
        expect(typeof ACT_DESCRIPTIONS[act].name).toBe('string');
        expect(ACT_DESCRIPTIONS[act].subtitle).toBeDefined();
        expect(typeof ACT_DESCRIPTIONS[act].subtitle).toBe('string');
        expect(ACT_DESCRIPTIONS[act].description).toBeDefined();
        expect(typeof ACT_DESCRIPTIONS[act].description).toBe('string');
        expect(ACT_DESCRIPTIONS[act].entering).toBeDefined();
        expect(typeof ACT_DESCRIPTIONS[act].entering).toBe('string');
      });
    });

    it('should have correct act names', () => {
      expect(ACT_DESCRIPTIONS[1].name).toBe('The Periphery');
      expect(ACT_DESCRIPTIONS[2].name).toBe('The Infrastructure');
      expect(ACT_DESCRIPTIONS[3].name).toBe('The Core');
    });
  });

  describe('RELIC_FLAVOR', () => {
    it('should exist and be a non-empty object', () => {
      expect(RELIC_FLAVOR).toBeDefined();
      expect(typeof RELIC_FLAVOR).toBe('object');
      expect(Object.keys(RELIC_FLAVOR).length).toBeGreaterThan(0);
    });

    it('should have keys matching actual relic IDs from relics data', () => {
      const relicIds = ALL_RELICS.map(relic => relic.id);
      const flavorKeys = Object.keys(RELIC_FLAVOR);

      flavorKeys.forEach(key => {
        expect(relicIds).toContain(key);
      });
    });

    it('should have flavor text for all relics', () => {
      const relicIds = ALL_RELICS.map(relic => relic.id);

      relicIds.forEach(id => {
        expect(RELIC_FLAVOR[id]).toBeDefined();
        expect(typeof RELIC_FLAVOR[id]).toBe('string');
        expect(RELIC_FLAVOR[id].length).toBeGreaterThan(0);
      });
    });

    it('should not have any flavor text exceeding 200 characters', () => {
      Object.entries(RELIC_FLAVOR).forEach(([key, text]) => {
        expect(text.length).toBeLessThanOrEqual(200);
      });
    });
  });

  describe('WORLD_LORE', () => {
    it('should exist and be a non-empty array', () => {
      expect(WORLD_LORE).toBeDefined();
      expect(Array.isArray(WORLD_LORE)).toBe(true);
      expect(WORLD_LORE.length).toBeGreaterThan(0);
    });

    it('should have at least 8 lore snippets', () => {
      expect(WORLD_LORE.length).toBeGreaterThanOrEqual(8);
    });

    it('should contain only non-empty strings', () => {
      WORLD_LORE.forEach(snippet => {
        expect(typeof snippet).toBe('string');
        expect(snippet.length).toBeGreaterThan(0);
      });
    });

    it('should not have any snippet exceeding 200 characters', () => {
      WORLD_LORE.forEach(snippet => {
        expect(snippet.length).toBeLessThanOrEqual(200);
      });
    });
  });
});
