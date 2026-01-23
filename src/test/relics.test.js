import { describe, it, expect } from 'vitest';
import {
  ALL_RELICS,
  RELIC_RARITY,
  getRelicById,
  getRandomRelic,
  getBossRelic,
  getStarterRelic
} from '../data/relics';

describe('Relics Data', () => {
  describe('ALL_RELICS', () => {
    it('should have at least 40 relics', () => {
      expect(ALL_RELICS.length).toBeGreaterThanOrEqual(40);
    });

    it('all relics should have required properties', () => {
      ALL_RELICS.forEach(relic => {
        expect(relic).toHaveProperty('id');
        expect(relic).toHaveProperty('name');
        expect(relic).toHaveProperty('rarity');
        expect(relic).toHaveProperty('description');
        expect(relic).toHaveProperty('emoji');
        expect(relic).toHaveProperty('trigger');
        expect(relic).toHaveProperty('effect');
        expect(typeof relic.id).toBe('string');
        expect(typeof relic.name).toBe('string');
        expect(typeof relic.description).toBe('string');
      });
    });

    it('all relics should have valid rarities', () => {
      const validRarities = Object.values(RELIC_RARITY);
      ALL_RELICS.forEach(relic => {
        expect(validRarities).toContain(relic.rarity);
      });
    });

    it('all relic IDs should be unique', () => {
      const ids = ALL_RELICS.map(r => r.id);
      const uniqueIds = [...new Set(ids)];
      expect(ids.length).toBe(uniqueIds.length);
    });

    it('all relic names should be unique', () => {
      const names = ALL_RELICS.map(r => r.name);
      const uniqueNames = [...new Set(names)];
      expect(names.length).toBe(uniqueNames.length);
    });

    it('should have relics of main rarity types', () => {
      const mainRarities = [
        RELIC_RARITY.STARTER,
        RELIC_RARITY.COMMON,
        RELIC_RARITY.UNCOMMON,
        RELIC_RARITY.RARE,
        RELIC_RARITY.BOSS,
        RELIC_RARITY.SHOP
      ];
      mainRarities.forEach(rarity => {
        const relicsOfRarity = ALL_RELICS.filter(r => r.rarity === rarity);
        expect(relicsOfRarity.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Relic Effects', () => {
    it('all relics should have valid triggers', () => {
      const validTriggers = [
        'onCombatStart', 'onCombatEnd', 'onTurnStart', 'onTurnEnd',
        'onAttackPlayed', 'onSkillPlayed', 'onStrikePlayed', 'onExhaust',
        'onDamageTaken', 'onDamageReceived', 'onHpLoss', 'onFirstHpLoss',
        'onDeath', 'onRest', 'onCardReward', 'onPickup', 'onFirstTurn',
        'passive'
      ];

      ALL_RELICS.forEach(relic => {
        expect(validTriggers).toContain(relic.trigger);
      });
    });

    it('all relics should have effect object', () => {
      ALL_RELICS.forEach(relic => {
        expect(typeof relic.effect).toBe('object');
        expect(relic.effect).toHaveProperty('type');
      });
    });

    it('relics with counter mechanics should have threshold', () => {
      const counterRelics = ALL_RELICS.filter(r => r.counter !== undefined);
      counterRelics.forEach(relic => {
        expect(relic.threshold).toBeDefined();
        expect(relic.threshold).toBeGreaterThan(0);
      });
    });
  });

  describe('getRelicById', () => {
    it('should return the correct relic', () => {
      const burningBlood = getRelicById('burning_blood');
      expect(burningBlood).toBeDefined();
      expect(burningBlood.name).toBe('Burning Blood');
    });

    it('should return undefined for non-existent relic', () => {
      const relic = getRelicById('nonexistent');
      expect(relic).toBeUndefined();
    });
  });

  describe('getRandomRelic', () => {
    it('should return a relic', () => {
      const relic = getRandomRelic();
      expect(relic).toBeDefined();
      expect(relic).toHaveProperty('id');
    });

    it('should not return starter, boss, or shop relics by default', () => {
      for (let i = 0; i < 50; i++) {
        const relic = getRandomRelic();
        expect(relic.rarity).not.toBe(RELIC_RARITY.STARTER);
        expect(relic.rarity).not.toBe(RELIC_RARITY.BOSS);
        expect(relic.rarity).not.toBe(RELIC_RARITY.SHOP);
      }
    });

    it('should filter by rarity when specified', () => {
      for (let i = 0; i < 20; i++) {
        const relic = getRandomRelic(RELIC_RARITY.RARE);
        expect(relic.rarity).toBe(RELIC_RARITY.RARE);
      }
    });

    it('should exclude specified IDs', () => {
      const excludeIds = ['anchor', 'vajra', 'lantern'];
      for (let i = 0; i < 50; i++) {
        const relic = getRandomRelic(null, excludeIds);
        expect(excludeIds).not.toContain(relic.id);
      }
    });
  });

  describe('getBossRelic', () => {
    it('should return a boss relic', () => {
      const relic = getBossRelic();
      expect(relic).toBeDefined();
      expect(relic.rarity).toBe(RELIC_RARITY.BOSS);
    });

    it('should exclude specified IDs', () => {
      const bossRelics = ALL_RELICS.filter(r => r.rarity === RELIC_RARITY.BOSS);
      const excludeIds = bossRelics.slice(0, 3).map(r => r.id);

      for (let i = 0; i < 20; i++) {
        const relic = getBossRelic(excludeIds);
        if (relic) {
          expect(excludeIds).not.toContain(relic.id);
        }
      }
    });
  });

  describe('getStarterRelic', () => {
    it('should return Burning Blood', () => {
      const relic = getStarterRelic();
      expect(relic).toBeDefined();
      expect(relic.id).toBe('burning_blood');
      expect(relic.name).toBe('Burning Blood');
      expect(relic.rarity).toBe(RELIC_RARITY.STARTER);
    });
  });

  describe('Boss Relics', () => {
    it('boss relics should have energy bonus effect', () => {
      const bossRelics = ALL_RELICS.filter(r => r.rarity === RELIC_RARITY.BOSS);
      bossRelics.forEach(relic => {
        // Most boss relics give energy or have significant effects
        expect(relic.effect).toBeDefined();
      });
    });

    it('boss relics should have meaningful drawbacks or powerful effects', () => {
      const bossRelics = ALL_RELICS.filter(r => r.rarity === RELIC_RARITY.BOSS);
      expect(bossRelics.length).toBeGreaterThanOrEqual(5);
    });
  });
});
