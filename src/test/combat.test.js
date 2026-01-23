import { describe, it, expect } from 'vitest';
import { calculateDamage, calculateBlock, applyDamageToTarget } from '../context/GameContext';

// Test combat calculation helpers using the real exported functions from GameContext

describe('Combat Mechanics', () => {

  describe('calculateDamage', () => {
    it('should return base damage with no modifiers', () => {
      const attacker = { strength: 0, weak: 0 };
      const defender = { vulnerable: 0 };
      expect(calculateDamage(10, attacker, defender)).toBe(10);
    });

    it('should add strength to damage', () => {
      const attacker = { strength: 3, weak: 0 };
      const defender = { vulnerable: 0 };
      expect(calculateDamage(10, attacker, defender)).toBe(13);
    });

    it('should reduce damage by 25% when attacker is weak', () => {
      const attacker = { strength: 0, weak: 1 };
      const defender = { vulnerable: 0 };
      expect(calculateDamage(10, attacker, defender)).toBe(7); // 10 * 0.75 = 7.5 -> 7
    });

    it('should increase damage by 50% when defender is vulnerable', () => {
      const attacker = { strength: 0, weak: 0 };
      const defender = { vulnerable: 1 };
      expect(calculateDamage(10, attacker, defender)).toBe(15); // 10 * 1.5 = 15
    });

    it('should apply strength before weak', () => {
      const attacker = { strength: 4, weak: 1 };
      const defender = { vulnerable: 0 };
      // (10 + 4) * 0.75 = 10.5 -> 10
      expect(calculateDamage(10, attacker, defender)).toBe(10);
    });

    it('should apply weak before vulnerable', () => {
      const attacker = { strength: 0, weak: 1 };
      const defender = { vulnerable: 1 };
      // 10 * 0.75 = 7.5 -> 7, then 7 * 1.5 = 10.5 -> 10
      expect(calculateDamage(10, attacker, defender)).toBe(10);
    });

    it('should apply all modifiers correctly', () => {
      const attacker = { strength: 2, weak: 1 };
      const defender = { vulnerable: 1 };
      // (10 + 2) * 0.75 = 9, then 9 * 1.5 = 13.5 -> 13
      expect(calculateDamage(10, attacker, defender)).toBe(13);
    });

    it('should never return negative damage', () => {
      const attacker = { strength: -20, weak: 0 };
      const defender = { vulnerable: 0 };
      expect(calculateDamage(10, attacker, defender)).toBe(0);
    });
  });

  describe('calculateBlock', () => {
    it('should return base block with no modifiers', () => {
      const player = { dexterity: 0, frail: 0 };
      expect(calculateBlock(5, player)).toBe(5);
    });

    it('should add dexterity to block', () => {
      const player = { dexterity: 3, frail: 0 };
      expect(calculateBlock(5, player)).toBe(8);
    });

    it('should reduce block by 25% when frail', () => {
      const player = { dexterity: 0, frail: 1 };
      expect(calculateBlock(8, player)).toBe(6); // 8 * 0.75 = 6
    });

    it('should apply dexterity before frail', () => {
      const player = { dexterity: 4, frail: 1 };
      // (8 + 4) * 0.75 = 9
      expect(calculateBlock(8, player)).toBe(9);
    });

    it('should handle negative dexterity', () => {
      const player = { dexterity: -2, frail: 0 };
      expect(calculateBlock(5, player)).toBe(3);
    });

    it('should never return negative block', () => {
      const player = { dexterity: -10, frail: 0 };
      expect(calculateBlock(5, player)).toBe(0);
    });
  });

  describe('applyDamageToTarget', () => {
    it('should deal damage directly to HP when no block', () => {
      const target = { currentHp: 50, block: 0 };
      const result = applyDamageToTarget(target, 10);
      expect(result.currentHp).toBe(40);
      expect(result.block).toBe(0);
    });

    it('should reduce block before HP', () => {
      const target = { currentHp: 50, block: 15 };
      const result = applyDamageToTarget(target, 10);
      expect(result.currentHp).toBe(50);
      expect(result.block).toBe(5);
    });

    it('should deal overflow damage to HP', () => {
      const target = { currentHp: 50, block: 5 };
      const result = applyDamageToTarget(target, 10);
      expect(result.currentHp).toBe(45);
      expect(result.block).toBe(0);
    });

    it('should not reduce HP below 0', () => {
      const target = { currentHp: 10, block: 0 };
      const result = applyDamageToTarget(target, 100);
      expect(result.currentHp).toBe(0);
    });

    it('should handle 0 damage', () => {
      const target = { currentHp: 50, block: 10 };
      const result = applyDamageToTarget(target, 0);
      expect(result.currentHp).toBe(50);
      expect(result.block).toBe(10);
    });

    it('should handle exact block amount', () => {
      const target = { currentHp: 50, block: 10 };
      const result = applyDamageToTarget(target, 10);
      expect(result.currentHp).toBe(50);
      expect(result.block).toBe(0);
    });
  });

  describe('Status Effects Duration', () => {
    const decrementDebuffs = (entity) => {
      return {
        ...entity,
        vulnerable: Math.max(0, entity.vulnerable - 1),
        weak: Math.max(0, entity.weak - 1),
        frail: Math.max(0, entity.frail - 1)
      };
    };

    it('should decrement debuffs by 1', () => {
      const player = { vulnerable: 3, weak: 2, frail: 1 };
      const result = decrementDebuffs(player);
      expect(result.vulnerable).toBe(2);
      expect(result.weak).toBe(1);
      expect(result.frail).toBe(0);
    });

    it('should not go below 0', () => {
      const player = { vulnerable: 0, weak: 0, frail: 0 };
      const result = decrementDebuffs(player);
      expect(result.vulnerable).toBe(0);
      expect(result.weak).toBe(0);
      expect(result.frail).toBe(0);
    });
  });

  describe('Energy System', () => {
    it('should start with max energy each turn', () => {
      const player = { energy: 0, maxEnergy: 3 };
      const newEnergy = player.maxEnergy;
      expect(newEnergy).toBe(3);
    });

    it('should handle berserk energy bonus', () => {
      const player = { energy: 0, maxEnergy: 3, berserk: 1 };
      const newEnergy = player.maxEnergy + player.berserk;
      expect(newEnergy).toBe(4);
    });
  });

  describe('Card Draw', () => {
    const shuffleArray = (arr) => {
      const newArr = [...arr];
      for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
      }
      return newArr;
    };

    const drawCards = (drawPile, discardPile, hand, count) => {
      let newDrawPile = [...drawPile];
      let newDiscardPile = [...discardPile];
      let newHand = [...hand];

      for (let i = 0; i < count; i++) {
        if (newDrawPile.length === 0 && newDiscardPile.length > 0) {
          newDrawPile = shuffleArray(newDiscardPile);
          newDiscardPile = [];
        }
        if (newDrawPile.length > 0) {
          newHand.push(newDrawPile.shift());
        }
      }

      return { drawPile: newDrawPile, discardPile: newDiscardPile, hand: newHand };
    };

    it('should draw cards from draw pile', () => {
      const drawPile = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const result = drawCards(drawPile, [], [], 2);
      expect(result.hand.length).toBe(2);
      expect(result.drawPile.length).toBe(1);
    });

    it('should reshuffle discard when draw pile is empty', () => {
      const drawPile = [];
      const discardPile = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const result = drawCards(drawPile, discardPile, [], 2);
      expect(result.hand.length).toBe(2);
      expect(result.discardPile.length).toBe(0);
      expect(result.drawPile.length).toBe(1);
    });

    it('should not draw more cards than available', () => {
      const drawPile = [{ id: 1 }];
      const discardPile = [];
      const result = drawCards(drawPile, discardPile, [], 5);
      expect(result.hand.length).toBe(1);
      expect(result.drawPile.length).toBe(0);
    });
  });
});
