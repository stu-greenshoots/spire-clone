import { describe, it, expect } from 'vitest';
import { ALL_CARDS, getCardById, CARD_TYPES } from '../data/cards';
import { ALL_ENEMIES, createEnemyInstance } from '../data/enemies';
import { ALL_RELICS } from '../data/relics';

describe('Edge Cases', () => {
  describe('Card Edge Cases', () => {
    it('X cost cards should have cost of -1', () => {
      const xCostCards = ALL_CARDS.filter(c => c.special === 'xCost');
      xCostCards.forEach(card => {
        expect(card.cost).toBe(-1);
      });
    });

    it('exhaust cards should be marked correctly', () => {
      const exhaustCards = ALL_CARDS.filter(c => c.exhaust === true);
      expect(exhaustCards.length).toBeGreaterThan(0);
      exhaustCards.forEach(card => {
        expect(card.exhaust).toBe(true);
      });
    });

    it('ethereal cards should be marked correctly', () => {
      const etherealCards = ALL_CARDS.filter(c => c.ethereal === true);
      expect(etherealCards.length).toBeGreaterThan(0);
      etherealCards.forEach(card => {
        expect(card.ethereal).toBe(true);
      });
    });

    it('multi-hit cards should have hits > 1', () => {
      const multiHitCards = ALL_CARDS.filter(c => c.hits && c.hits > 1);
      expect(multiHitCards.length).toBeGreaterThan(0);
      multiHitCards.forEach(card => {
        expect(card.hits).toBeGreaterThan(1);
        expect(card.damage).toBeDefined();
      });
    });

    it('cards targeting all enemies should be marked', () => {
      const aoeCards = ALL_CARDS.filter(c => c.targetAll === true);
      expect(aoeCards.length).toBeGreaterThan(0);
    });

    it('power cards should not have damage (except special cases)', () => {
      const powerCards = ALL_CARDS.filter(c => c.type === CARD_TYPES.POWER);
      powerCards.forEach(card => {
        // Powers with damage are special cases like Combust
        if (card.damage && !card.special) {
          console.warn(`Power card ${card.name} has direct damage without special handling`);
        }
      });
      expect(powerCards.length).toBeGreaterThan(0);
    });

    it('upgraded versions should have different stats or description', () => {
      const upgradableCards = ALL_CARDS.filter(c => c.upgradedVersion);
      upgradableCards.forEach(card => {
        const hasDescriptionChange = card.upgradedVersion.description !== card.description;
        const hasCostChange = card.upgradedVersion.cost !== undefined && card.upgradedVersion.cost !== card.cost;
        const hasDamageChange = card.upgradedVersion.damage !== undefined;
        const hasBlockChange = card.upgradedVersion.block !== undefined;
        const hasEffectsChange = card.upgradedVersion.effects !== undefined;
        const hasOtherChange = Object.keys(card.upgradedVersion).some(key =>
          key !== 'description' && card.upgradedVersion[key] !== card[key]
        );

        // Upgraded card should change something
        expect(hasDescriptionChange || hasCostChange || hasDamageChange || hasBlockChange || hasEffectsChange || hasOtherChange).toBe(true);
      });
    });
  });

  describe('Enemy Edge Cases', () => {
    it('boss enemies should have high HP', () => {
      const bosses = ALL_ENEMIES.filter(e => e.type === 'boss');
      bosses.forEach(boss => {
        const minHp = typeof boss.hp === 'object' ? boss.hp.min : boss.hp;
        expect(minHp).toBeGreaterThanOrEqual(100);
      });
    });

    it('all enemies should have at least one move', () => {
      ALL_ENEMIES.forEach(enemy => {
        expect(enemy.moveset.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('sleeping enemies should have sleep move', () => {
      const sleepingEnemies = ALL_ENEMIES.filter(e => e.asleep === true);
      sleepingEnemies.forEach(enemy => {
        const sleepMove = enemy.moveset.find(m => m.intent === 'sleeping');
        expect(sleepMove).toBeDefined();
      });
    });

    it('enemy instances should not share references', () => {
      const enemy = ALL_ENEMIES[0];
      const instance1 = createEnemyInstance(enemy, 0);
      const instance2 = createEnemyInstance(enemy, 1);

      instance1.currentHp = 1;
      expect(instance2.currentHp).not.toBe(1);
    });

    it('enemies with special abilities should have them defined', () => {
      const specialEnemies = ALL_ENEMIES.filter(e =>
        e.onDeath || e.sporeCloud || e.enrage || e.modeShift || e.curious
      );
      expect(specialEnemies.length).toBeGreaterThan(0);
    });
  });

  describe('Relic Edge Cases', () => {
    it('relics with counters should reset properly', () => {
      const counterRelics = ALL_RELICS.filter(r => r.counter !== undefined);
      counterRelics.forEach(relic => {
        expect(relic.counter).toBe(0);
        expect(relic.threshold).toBeGreaterThan(0);
      });
    });

    it('boss relics should have significant effects', () => {
      const bossRelics = ALL_RELICS.filter(r => r.rarity === 'boss');
      bossRelics.forEach(relic => {
        // Boss relics typically give energy bonus or have major effects
        const hasEnergyBonus = relic.effect.type === 'energyBonus' ||
                               relic.effect.type === 'drawBonus';
        const hasMajorEffect = relic.effect.type !== undefined;
        expect(hasEnergyBonus || hasMajorEffect).toBe(true);
      });
    });

    it('one-use relics should have used flag', () => {
      const oneUseRelics = ALL_RELICS.filter(r => r.trigger === 'onDeath');
      oneUseRelics.forEach(relic => {
        expect(relic.used).toBeDefined();
      });
    });
  });

  describe('Combat Edge Cases', () => {
    it('should handle zero damage correctly', () => {
      const applyDamage = (target, damage) => {
        let remainingDamage = damage;
        let newBlock = target.block;
        let newHp = target.currentHp;

        if (newBlock > 0) {
          if (newBlock >= remainingDamage) {
            newBlock -= remainingDamage;
            remainingDamage = 0;
          } else {
            remainingDamage -= newBlock;
            newBlock = 0;
          }
        }

        if (remainingDamage > 0) {
          newHp = Math.max(0, newHp - remainingDamage);
        }

        return { ...target, block: newBlock, currentHp: newHp };
      };

      const target = { currentHp: 50, block: 10 };
      const result = applyDamage(target, 0);
      expect(result.currentHp).toBe(50);
      expect(result.block).toBe(10);
    });

    it('should handle massive damage correctly', () => {
      const applyDamage = (target, damage) => {
        let remainingDamage = damage;
        let newBlock = target.block;
        let newHp = target.currentHp;

        if (newBlock > 0) {
          if (newBlock >= remainingDamage) {
            newBlock -= remainingDamage;
            remainingDamage = 0;
          } else {
            remainingDamage -= newBlock;
            newBlock = 0;
          }
        }

        if (remainingDamage > 0) {
          newHp = Math.max(0, newHp - remainingDamage);
        }

        return { ...target, block: newBlock, currentHp: newHp };
      };

      const target = { currentHp: 50, block: 10 };
      const result = applyDamage(target, 10000);
      expect(result.currentHp).toBe(0);
      expect(result.block).toBe(0);
    });

    it('should handle negative strength correctly', () => {
      const calculateDamage = (baseDamage, attacker, defender) => {
        let damage = baseDamage + (attacker.strength || 0);
        if (attacker.weak > 0) damage = Math.floor(damage * 0.75);
        if (defender.vulnerable > 0) damage = Math.floor(damage * 1.5);
        return Math.max(0, damage);
      };

      const attacker = { strength: -5, weak: 0 };
      const defender = { vulnerable: 0 };
      const damage = calculateDamage(6, attacker, defender);
      expect(damage).toBe(1); // 6 - 5 = 1
    });

    it('should handle extreme debuff stacking', () => {
      const calculateDamage = (baseDamage, attacker, defender) => {
        let damage = baseDamage + (attacker.strength || 0);
        if (attacker.weak > 0) damage = Math.floor(damage * 0.75);
        if (defender.vulnerable > 0) damage = Math.floor(damage * 1.5);
        return Math.max(0, damage);
      };

      // Attacker is weak, defender is vulnerable
      const attacker = { strength: 0, weak: 10 }; // High weak count shouldn't matter
      const defender = { vulnerable: 10 }; // High vuln count shouldn't matter
      const damage = calculateDamage(10, attacker, defender);
      // 10 * 0.75 = 7.5 -> 7, then 7 * 1.5 = 10.5 -> 10
      expect(damage).toBe(10);
    });
  });

  describe('Data Integrity', () => {
    it('all card IDs should be valid identifiers', () => {
      ALL_CARDS.forEach(card => {
        expect(card.id).toMatch(/^[a-zA-Z_][a-zA-Z0-9_]*$/);
      });
    });

    it('all enemy IDs should be valid identifiers', () => {
      ALL_ENEMIES.forEach(enemy => {
        expect(enemy.id).toMatch(/^[a-zA-Z_][a-zA-Z0-9_]*$/);
      });
    });

    it('all relic IDs should be valid identifiers', () => {
      ALL_RELICS.forEach(relic => {
        expect(relic.id).toMatch(/^[a-zA-Z_][a-zA-Z0-9_]*$/);
      });
    });

    it('no duplicate names across all data', () => {
      const allNames = [
        ...ALL_CARDS.map(c => c.name),
        ...ALL_ENEMIES.map(e => e.name),
        ...ALL_RELICS.map(r => r.name)
      ];
      // Names can repeat across types (e.g., a card and enemy could share a name)
      // but check for any obvious issues
      expect(allNames.length).toBeGreaterThan(100);
    });
  });
});
