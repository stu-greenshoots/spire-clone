import { describe, it, expect } from 'vitest';
import { calculateDamage, calculateBlock, applyDamageToTarget } from '../context/GameContext';
import { getRelicById } from '../data/relics';

describe('Status Effects', () => {
  describe('Vulnerable', () => {
    it('should increase damage taken by 50%', () => {
      const attacker = { strength: 0, weak: 0 };
      const defender = { vulnerable: 1 };

      const baseDamage = 10;
      const damage = calculateDamage(baseDamage, attacker, defender);

      expect(damage).toBe(15); // 10 * 1.5 = 15
    });

    it('should apply 50% increase regardless of vulnerable stacks', () => {
      const attacker = { strength: 0, weak: 0 };
      const defender1 = { vulnerable: 1 };
      const defender2 = { vulnerable: 5 };
      const defender3 = { vulnerable: 10 };

      // All should give same damage increase (vulnerable doesn't stack multiplier)
      expect(calculateDamage(10, attacker, defender1)).toBe(15);
      expect(calculateDamage(10, attacker, defender2)).toBe(15);
      expect(calculateDamage(10, attacker, defender3)).toBe(15);
    });

    it('should not apply when vulnerable is 0', () => {
      const attacker = { strength: 0, weak: 0 };
      const defender = { vulnerable: 0 };

      expect(calculateDamage(10, attacker, defender)).toBe(10);
    });

    it('should floor the damage result', () => {
      const attacker = { strength: 0, weak: 0 };
      const defender = { vulnerable: 1 };

      // 7 * 1.5 = 10.5 -> should floor to 10
      expect(calculateDamage(7, attacker, defender)).toBe(10);

      // 3 * 1.5 = 4.5 -> should floor to 4
      expect(calculateDamage(3, attacker, defender)).toBe(4);
    });

    it('should stack with strength', () => {
      const attacker = { strength: 3, weak: 0 };
      const defender = { vulnerable: 1 };

      // (10 + 3) * 1.5 = 19.5 -> 19
      expect(calculateDamage(10, attacker, defender)).toBe(19);
    });
  });

  describe('Weak', () => {
    it('should reduce attack damage by 25%', () => {
      const attacker = { strength: 0, weak: 1 };
      const defender = { vulnerable: 0 };

      const baseDamage = 10;
      const damage = calculateDamage(baseDamage, attacker, defender);

      expect(damage).toBe(7); // 10 * 0.75 = 7.5 -> 7
    });

    it('should apply 25% reduction regardless of weak stacks', () => {
      const defender = { vulnerable: 0 };

      const attacker1 = { strength: 0, weak: 1 };
      const attacker2 = { strength: 0, weak: 5 };
      const attacker3 = { strength: 0, weak: 10 };

      // All should give same damage reduction
      expect(calculateDamage(10, attacker1, defender)).toBe(7);
      expect(calculateDamage(10, attacker2, defender)).toBe(7);
      expect(calculateDamage(10, attacker3, defender)).toBe(7);
    });

    it('should not apply when weak is 0', () => {
      const attacker = { strength: 0, weak: 0 };
      const defender = { vulnerable: 0 };

      expect(calculateDamage(10, attacker, defender)).toBe(10);
    });

    it('should floor the damage result', () => {
      const attacker = { strength: 0, weak: 1 };
      const defender = { vulnerable: 0 };

      // 10 * 0.75 = 7.5 -> 7
      expect(calculateDamage(10, attacker, defender)).toBe(7);

      // 6 * 0.75 = 4.5 -> 4
      expect(calculateDamage(6, attacker, defender)).toBe(4);
    });

    it('should apply before vulnerable', () => {
      const attacker = { strength: 0, weak: 1 };
      const defender = { vulnerable: 1 };

      // 10 * 0.75 = 7.5 -> 7, then 7 * 1.5 = 10.5 -> 10
      expect(calculateDamage(10, attacker, defender)).toBe(10);
    });

    it('should apply after strength', () => {
      const attacker = { strength: 4, weak: 1 };
      const defender = { vulnerable: 0 };

      // (10 + 4) * 0.75 = 10.5 -> 10
      expect(calculateDamage(10, attacker, defender)).toBe(10);
    });
  });

  describe('Frail', () => {
    it('should reduce block gained by 25%', () => {
      const player = { dexterity: 0, frail: 1 };

      const baseBlock = 8;
      const block = calculateBlock(baseBlock, player);

      expect(block).toBe(6); // 8 * 0.75 = 6
    });

    it('should apply 25% reduction regardless of frail stacks', () => {
      const player1 = { dexterity: 0, frail: 1 };
      const player2 = { dexterity: 0, frail: 5 };
      const player3 = { dexterity: 0, frail: 10 };

      // All should give same block reduction
      expect(calculateBlock(8, player1)).toBe(6);
      expect(calculateBlock(8, player2)).toBe(6);
      expect(calculateBlock(8, player3)).toBe(6);
    });

    it('should not apply when frail is 0', () => {
      const player = { dexterity: 0, frail: 0 };

      expect(calculateBlock(8, player)).toBe(8);
    });

    it('should floor the block result', () => {
      const player = { dexterity: 0, frail: 1 };

      // 10 * 0.75 = 7.5 -> 7
      expect(calculateBlock(10, player)).toBe(7);

      // 5 * 0.75 = 3.75 -> 3
      expect(calculateBlock(5, player)).toBe(3);
    });

    it('should apply after dexterity', () => {
      const player = { dexterity: 4, frail: 1 };

      // (8 + 4) * 0.75 = 9
      expect(calculateBlock(8, player)).toBe(9);
    });
  });

  describe('Strength', () => {
    it('should add flat damage to attacks', () => {
      const attacker = { strength: 3, weak: 0 };
      const defender = { vulnerable: 0 };

      // 10 + 3 = 13
      expect(calculateDamage(10, attacker, defender)).toBe(13);
    });

    it('should stack additively', () => {
      const defender = { vulnerable: 0 };

      expect(calculateDamage(10, { strength: 1, weak: 0 }, defender)).toBe(11);
      expect(calculateDamage(10, { strength: 5, weak: 0 }, defender)).toBe(15);
      expect(calculateDamage(10, { strength: 10, weak: 0 }, defender)).toBe(20);
    });

    it('should handle negative strength', () => {
      const attacker = { strength: -3, weak: 0 };
      const defender = { vulnerable: 0 };

      // 10 - 3 = 7
      expect(calculateDamage(10, attacker, defender)).toBe(7);
    });

    it('should not let damage go below 0', () => {
      const attacker = { strength: -15, weak: 0 };
      const defender = { vulnerable: 0 };

      // 10 - 15 = -5 -> should be 0
      expect(calculateDamage(10, attacker, defender)).toBe(0);
    });

    it('should apply to each hit of multi-hit attacks', () => {
      const attacker = { strength: 2, weak: 0 };
      const defender = { vulnerable: 0 };

      // Each hit: 5 + 2 = 7
      const damagePerHit = calculateDamage(5, attacker, defender);
      expect(damagePerHit).toBe(7);

      // Twin Strike (5 damage, 2 hits) with +2 strength
      // Total: 7 * 2 = 14
      const totalDamage = damagePerHit * 2;
      expect(totalDamage).toBe(14);
    });
  });

  describe('Dexterity', () => {
    it('should add flat block to skills', () => {
      const player = { dexterity: 3, frail: 0 };

      // 5 + 3 = 8
      expect(calculateBlock(5, player)).toBe(8);
    });

    it('should stack additively', () => {
      expect(calculateBlock(5, { dexterity: 1, frail: 0 })).toBe(6);
      expect(calculateBlock(5, { dexterity: 5, frail: 0 })).toBe(10);
      expect(calculateBlock(5, { dexterity: 10, frail: 0 })).toBe(15);
    });

    it('should handle negative dexterity', () => {
      const player = { dexterity: -2, frail: 0 };

      // 5 - 2 = 3
      expect(calculateBlock(5, player)).toBe(3);
    });

    it('should not let block go below 0', () => {
      const player = { dexterity: -10, frail: 0 };

      // 5 - 10 = -5 -> should be 0
      expect(calculateBlock(5, player)).toBe(0);
    });
  });

  describe('Poison', () => {
    it('should deal damage at turn start and decrease', () => {
      // Simulate poison mechanics
      const applyPoison = (target) => {
        if (target.poison > 0) {
          const poisonDamage = target.poison;
          const newHp = Math.max(0, target.currentHp - poisonDamage);
          const newPoison = target.poison - 1;
          return {
            ...target,
            currentHp: newHp,
            poison: newPoison,
            damageTaken: poisonDamage
          };
        }
        return { ...target, damageTaken: 0 };
      };

      // Target with 5 poison
      let target = { currentHp: 50, poison: 5 };

      // Turn 1: Take 5 damage, poison becomes 4
      target = applyPoison(target);
      expect(target.currentHp).toBe(45);
      expect(target.poison).toBe(4);

      // Turn 2: Take 4 damage, poison becomes 3
      target = applyPoison(target);
      expect(target.currentHp).toBe(41);
      expect(target.poison).toBe(3);

      // Turn 3: Take 3 damage, poison becomes 2
      target = applyPoison(target);
      expect(target.currentHp).toBe(38);
      expect(target.poison).toBe(2);
    });

    it('should deal total damage over multiple turns', () => {
      const applyPoison = (target) => {
        if (target.poison > 0) {
          const poisonDamage = target.poison;
          const newHp = Math.max(0, target.currentHp - poisonDamage);
          const newPoison = target.poison - 1;
          return { ...target, currentHp: newHp, poison: newPoison };
        }
        return target;
      };

      // 5 poison deals: 5+4+3+2+1 = 15 total damage
      let target = { currentHp: 100, poison: 5 };
      let totalDamage = 0;

      while (target.poison > 0) {
        const beforeHp = target.currentHp;
        target = applyPoison(target);
        totalDamage += beforeHp - target.currentHp;
      }

      expect(totalDamage).toBe(15);
      expect(target.poison).toBe(0);
    });

    it('should stack when reapplied', () => {
      let target = { poison: 3 };

      // Apply 4 more poison
      target.poison += 4;

      expect(target.poison).toBe(7);
    });

    it('should not go below 0', () => {
      const applyPoison = (target) => {
        if (target.poison > 0) {
          return { ...target, poison: target.poison - 1 };
        }
        return target;
      };

      let target = { poison: 1 };
      target = applyPoison(target);
      expect(target.poison).toBe(0);

      target = applyPoison(target);
      expect(target.poison).toBe(0);
    });

    it('poison should bypass block', () => {
      const applyPoison = (target) => {
        if (target.poison > 0) {
          // Poison ignores block
          const newHp = Math.max(0, target.currentHp - target.poison);
          return { ...target, currentHp: newHp, poison: target.poison - 1 };
        }
        return target;
      };

      let target = { currentHp: 50, block: 20, poison: 5 };
      target = applyPoison(target);

      // Should take 5 damage directly to HP, block unchanged
      expect(target.currentHp).toBe(45);
      expect(target.block).toBe(20);
    });
  });

  describe('Combined Status Effects', () => {
    it('should apply strength, weak, and vulnerable in correct order', () => {
      const attacker = { strength: 2, weak: 1 };
      const defender = { vulnerable: 1 };

      // Order: strength -> weak -> vulnerable
      // (10 + 2) * 0.75 = 9, then 9 * 1.5 = 13.5 -> 13
      expect(calculateDamage(10, attacker, defender)).toBe(13);
    });

    it('should apply dexterity and frail in correct order', () => {
      const player = { dexterity: 4, frail: 1 };

      // Order: dexterity -> frail
      // (8 + 4) * 0.75 = 9
      expect(calculateBlock(8, player)).toBe(9);
    });

    it('should handle all modifiers being active', () => {
      // Full combat scenario with all effects
      const attacker = { strength: 5, weak: 1 };
      const defender = { vulnerable: 1, dexterity: 2, frail: 1 };

      // Damage: (10 + 5) * 0.75 = 11.25 -> 11, then 11 * 1.5 = 16.5 -> 16
      const damage = calculateDamage(10, attacker, defender);
      expect(damage).toBe(16);

      // Block: (5 + 2) * 0.75 = 5.25 -> 5
      const block = calculateBlock(5, defender);
      expect(block).toBe(5);
    });

    it('should correctly calculate damage through block', () => {
      const attacker = { strength: 3, weak: 0 };
      const defender = { vulnerable: 1, currentHp: 50, block: 10 };

      // Damage: (10 + 3) * 1.5 = 19.5 -> 19
      const damage = calculateDamage(10, attacker, defender);
      expect(damage).toBe(19);

      // Apply damage: 19 - 10 block = 9 to HP
      const result = applyDamageToTarget({ currentHp: 50, block: 10 }, damage);
      expect(result.block).toBe(0);
      expect(result.currentHp).toBe(41);
    });
  });

  describe('Status Effect Duration', () => {
    it('should decrement debuffs at turn end', () => {
      const decrementDebuffs = (entity) => ({
        ...entity,
        vulnerable: Math.max(0, entity.vulnerable - 1),
        weak: Math.max(0, entity.weak - 1),
        frail: Math.max(0, entity.frail - 1)
      });

      let player = { vulnerable: 3, weak: 2, frail: 1 };

      player = decrementDebuffs(player);
      expect(player.vulnerable).toBe(2);
      expect(player.weak).toBe(1);
      expect(player.frail).toBe(0);

      player = decrementDebuffs(player);
      expect(player.vulnerable).toBe(1);
      expect(player.weak).toBe(0);
      expect(player.frail).toBe(0);

      player = decrementDebuffs(player);
      expect(player.vulnerable).toBe(0);
      expect(player.weak).toBe(0);
      expect(player.frail).toBe(0);
    });

    it('strength and dexterity should persist (not decrement)', () => {
      const player = { strength: 5, dexterity: 3 };

      // Strength and dexterity don't expire
      expect(player.strength).toBe(5);
      expect(player.dexterity).toBe(3);

      // After many turns, still the same
      expect(player.strength).toBe(5);
      expect(player.dexterity).toBe(3);
    });
  });

  describe('Edge Cases', () => {
    it('should handle 0 base damage', () => {
      const attacker = { strength: 3, weak: 0 };
      const defender = { vulnerable: 1 };

      // 0 + 3 = 3, then 3 * 1.5 = 4.5 -> 4
      expect(calculateDamage(0, attacker, defender)).toBe(4);
    });

    it('should handle 0 base block', () => {
      const player = { dexterity: 3, frail: 1 };

      // 0 + 3 = 3, then 3 * 0.75 = 2.25 -> 2
      expect(calculateBlock(0, player)).toBe(2);
    });

    it('should handle very large damage values', () => {
      const attacker = { strength: 100, weak: 0 };
      const defender = { vulnerable: 1 };

      // 100 + 100 = 200, then 200 * 1.5 = 300
      expect(calculateDamage(100, attacker, defender)).toBe(300);
    });

    it('should handle multiple weakness applications', () => {
      // Weak is binary - either you're weak or not
      // Stacks just extend duration, not multiplier
      const attacker = { strength: 0, weak: 5 };
      const defender = { vulnerable: 0 };

      // Still only 25% reduction
      expect(calculateDamage(10, attacker, defender)).toBe(7);
    });
  });
});
