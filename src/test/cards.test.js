import { describe, it, expect } from 'vitest';
import {
  ALL_CARDS,
  CARD_TYPES,
  RARITY,
  getStarterDeck,
  getCardById,
  getRandomCard,
  getCardRewards
} from '../data/cards';

describe('Cards Data', () => {
  describe('ALL_CARDS', () => {
    it('should have at least 50 cards', () => {
      expect(ALL_CARDS.length).toBeGreaterThanOrEqual(50);
    });

    it('all cards should have required properties', () => {
      ALL_CARDS.forEach(card => {
        expect(card).toHaveProperty('id');
        expect(card).toHaveProperty('name');
        expect(card).toHaveProperty('type');
        expect(card).toHaveProperty('rarity');
        expect(card).toHaveProperty('description');
        expect(typeof card.id).toBe('string');
        expect(typeof card.name).toBe('string');
        expect(typeof card.description).toBe('string');
      });
    });

    it('all cards should have valid types', () => {
      const validTypes = Object.values(CARD_TYPES);
      ALL_CARDS.forEach(card => {
        expect(validTypes).toContain(card.type);
      });
    });

    it('all cards should have valid rarities', () => {
      const validRarities = Object.values(RARITY);
      ALL_CARDS.forEach(card => {
        expect(validRarities).toContain(card.rarity);
      });
    });

    it('attack cards should have damage or special damage effect', () => {
      const attackCards = ALL_CARDS.filter(c => c.type === CARD_TYPES.ATTACK);
      attackCards.forEach(card => {
        const hasDamage = card.damage !== undefined ||
                          card.special === 'damageEqualBlock' ||
                          card.special === 'fiendFire' ||
                          card.special === 'perfectedStrike' ||
                          card.special === 'perfectedStrikeUp' ||
                          card.special === 'blizzardDamage';
        expect(hasDamage).toBe(true);
      });
    });

    it('cards with upgradedVersion should have valid upgrade data', () => {
      const upgradableCards = ALL_CARDS.filter(c => c.upgradedVersion);
      upgradableCards.forEach(card => {
        expect(card.upgradedVersion).toBeTypeOf('object');
        expect(card.upgradedVersion).toHaveProperty('description');
      });
    });

    it('all card IDs should be unique', () => {
      const ids = ALL_CARDS.map(c => c.id);
      const uniqueIds = [...new Set(ids)];
      expect(ids.length).toBe(uniqueIds.length);
    });
  });

  describe('getStarterDeck', () => {
    it('should return a deck with 10 cards', () => {
      const deck = getStarterDeck();
      expect(deck.length).toBe(10);
    });

    it('should have 5 Strikes, 4 Defends, and 1 Bash', () => {
      const deck = getStarterDeck();
      const strikes = deck.filter(c => c.id === 'strike');
      const defends = deck.filter(c => c.id === 'defend');
      const bash = deck.filter(c => c.id === 'bash');

      expect(strikes.length).toBe(5);
      expect(defends.length).toBe(4);
      expect(bash.length).toBe(1);
    });

    it('all cards should have unique instanceIds', () => {
      const deck = getStarterDeck();
      const instanceIds = deck.map(c => c.instanceId);
      const uniqueIds = [...new Set(instanceIds)];
      expect(instanceIds.length).toBe(uniqueIds.length);
    });
  });

  describe('getCardById', () => {
    it('should return the correct card', () => {
      const strike = getCardById('strike');
      expect(strike.name).toBe('Strike');
      expect(strike.type).toBe(CARD_TYPES.ATTACK);
    });

    it('should return undefined for non-existent card', () => {
      const card = getCardById('nonexistent');
      expect(card).toBeUndefined();
    });
  });

  describe('getRandomCard', () => {
    it('should return a card', () => {
      const card = getRandomCard();
      expect(card).toBeDefined();
      expect(card).toHaveProperty('id');
    });

    it('should not return basic or curse rarity cards', () => {
      for (let i = 0; i < 50; i++) {
        const card = getRandomCard();
        expect(card.rarity).not.toBe(RARITY.BASIC);
        expect(card.rarity).not.toBe(RARITY.CURSE);
      }
    });

    it('should filter by rarity when specified', () => {
      for (let i = 0; i < 20; i++) {
        const card = getRandomCard(RARITY.RARE);
        expect(card.rarity).toBe(RARITY.RARE);
      }
    });

    it('should filter by type when specified', () => {
      for (let i = 0; i < 20; i++) {
        const card = getRandomCard(null, CARD_TYPES.ATTACK);
        expect(card.type).toBe(CARD_TYPES.ATTACK);
      }
    });
  });

  describe('getCardRewards', () => {
    it('should return 3 cards by default', () => {
      const rewards = getCardRewards();
      expect(rewards.length).toBe(3);
    });

    it('should return specified number of cards', () => {
      const rewards = getCardRewards(5);
      expect(rewards.length).toBe(5);
    });

    it('all reward cards should have instanceIds', () => {
      const rewards = getCardRewards();
      rewards.forEach(card => {
        expect(card.instanceId).toBeDefined();
      });
    });

    it('reward cards should not include basic or curse rarity', () => {
      const rewards = getCardRewards(10);
      rewards.forEach(card => {
        expect(card.rarity).not.toBe(RARITY.BASIC);
        expect(card.rarity).not.toBe(RARITY.CURSE);
      });
    });
  });

  describe('Card cost validation', () => {
    it('playable cards should have valid costs', () => {
      const playableCards = ALL_CARDS.filter(c => !c.unplayable);
      playableCards.forEach(card => {
        expect(card.cost).toBeGreaterThanOrEqual(-1); // -1 for X cost
        expect(card.cost).toBeLessThanOrEqual(5);
      });
    });

    it('unplayable cards should be marked as such', () => {
      const unplayableCards = ALL_CARDS.filter(c => c.unplayable);
      unplayableCards.forEach(card => {
        expect(card.cost).toBe(-2);
      });
    });
  });
});
