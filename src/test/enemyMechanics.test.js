import { describe, it, expect } from 'vitest';
import {
  ALL_ENEMIES,
  getEnemyById,
  createEnemyInstance,
  INTENT
} from '../data/enemies';
import { calculateDamage, applyDamageToTarget } from '../context/GameContext';

describe('Enemy Mechanics', () => {
  describe('Slime Boss Split Mechanic', () => {
    it('Slime Boss should exist', () => {
      const slimeBoss = getEnemyById('slimeBoss');
      expect(slimeBoss).toBeDefined();
      expect(slimeBoss.type).toBe('boss');
      expect(slimeBoss.act).toBe(1);
    });

    it('Slime Boss should have split move in moveset', () => {
      const slimeBoss = getEnemyById('slimeBoss');
      const splitMove = slimeBoss.moveset.find(m => m.special === 'splitBoss');
      expect(splitMove).toBeDefined();
    });

    it('Slime Boss should split when HP <= 50%', () => {
      const slimeBoss = getEnemyById('slimeBoss');
      const instance = createEnemyInstance(slimeBoss);

      // At full HP, should not split
      const fullHpMove = slimeBoss.ai(instance, 0, null, 0);
      expect(fullHpMove.special).not.toBe('splitBoss');

      // At 50% HP or below, should split
      const damagedInstance = {
        ...instance,
        currentHp: Math.floor(instance.maxHp / 2),
        hasSplit: false
      };
      const splitMove = slimeBoss.ai(damagedInstance, 0, null, 0);
      expect(splitMove.special).toBe('splitBoss');
    });

    it('Slime Boss should not split twice', () => {
      const slimeBoss = getEnemyById('slimeBoss');
      const instance = {
        ...createEnemyInstance(slimeBoss),
        currentHp: 50,
        hasSplit: true // Already split
      };

      // Should not choose split move if already split
      const move = slimeBoss.ai(instance, 0, null, 0);
      expect(move.special).not.toBe('splitBoss');
    });

    it('Slime Boss HP threshold should be at 50%', () => {
      const slimeBoss = getEnemyById('slimeBoss');
      const instance = createEnemyInstance(slimeBoss);

      // At 51% HP - should not split
      const above50 = {
        ...instance,
        currentHp: Math.floor(instance.maxHp * 0.51),
        hasSplit: false
      };
      const move1 = slimeBoss.ai(above50, 1, null, 0);
      expect(move1.special).not.toBe('splitBoss');

      // At exactly 50% HP - should split
      const at50 = {
        ...instance,
        currentHp: Math.floor(instance.maxHp / 2),
        hasSplit: false
      };
      const move2 = slimeBoss.ai(at50, 1, null, 0);
      expect(move2.special).toBe('splitBoss');
    });

    it('Large Acid Slime should also split', () => {
      const largeSlime = getEnemyById('slime_large');
      expect(largeSlime).toBeDefined();

      const splitMove = largeSlime.moveset.find(m => m.special === 'splitMedium');
      expect(splitMove).toBeDefined();

      const instance = createEnemyInstance(largeSlime);
      const damagedInstance = {
        ...instance,
        currentHp: Math.floor(instance.maxHp / 2),
        hasSplit: false
      };

      const move = largeSlime.ai(damagedInstance, 0, null, 0);
      expect(move.special).toBe('splitMedium');
    });
  });

  describe('Artifact Mechanic', () => {
    it('enemies with artifact should have artifact property', () => {
      const artifactEnemies = ALL_ENEMIES.filter(e => e.artifact && e.artifact > 0);
      expect(artifactEnemies.length).toBeGreaterThan(0);

      artifactEnemies.forEach(enemy => {
        expect(enemy.artifact).toBeGreaterThan(0);
      });
    });

    it('Sentry should have 1 artifact', () => {
      const sentry = getEnemyById('sentryA');
      expect(sentry).toBeDefined();
      expect(sentry.artifact).toBe(1);
    });

    it('artifact should block first debuff application', () => {
      // Simulate artifact blocking debuff
      const applyDebuff = (enemy, debuffType, amount) => {
        if (enemy.artifact > 0) {
          // Artifact blocks the debuff
          return {
            ...enemy,
            artifact: enemy.artifact - 1,
            [debuffType]: enemy[debuffType] || 0 // Debuff not applied
          };
        }
        // Apply debuff normally
        return {
          ...enemy,
          [debuffType]: (enemy[debuffType] || 0) + amount
        };
      };

      // Enemy with 2 artifact
      let enemy = { artifact: 2, vulnerable: 0, weak: 0 };

      // First debuff - blocked
      enemy = applyDebuff(enemy, 'vulnerable', 2);
      expect(enemy.artifact).toBe(1);
      expect(enemy.vulnerable).toBe(0);

      // Second debuff - blocked
      enemy = applyDebuff(enemy, 'weak', 2);
      expect(enemy.artifact).toBe(0);
      expect(enemy.weak).toBe(0);

      // Third debuff - not blocked, applied
      enemy = applyDebuff(enemy, 'vulnerable', 2);
      expect(enemy.artifact).toBe(0);
      expect(enemy.vulnerable).toBe(2);
    });

    it('artifact should decrement per debuff blocked', () => {
      const applyDebuff = (enemy, debuffType, amount) => {
        if (enemy.artifact > 0) {
          return { ...enemy, artifact: enemy.artifact - 1 };
        }
        return { ...enemy, [debuffType]: (enemy[debuffType] || 0) + amount };
      };

      let enemy = { artifact: 5 };

      for (let i = 0; i < 5; i++) {
        enemy = applyDebuff(enemy, 'vulnerable', 1);
      }

      expect(enemy.artifact).toBe(0);
    });

    it('artifact should not affect positive buffs', () => {
      // Artifact only blocks debuffs, not buffs like strength
      const applyBuff = (enemy, buffType, amount) => ({
        ...enemy,
        [buffType]: (enemy[buffType] || 0) + amount
      });

      let enemy = { artifact: 2, strength: 0 };

      enemy = applyBuff(enemy, 'strength', 3);
      expect(enemy.artifact).toBe(2); // Unchanged
      expect(enemy.strength).toBe(3); // Applied
    });
  });

  describe('Multi-Attack Mechanics', () => {
    it('should find enemies with multi-hit attacks', () => {
      const multiHitEnemies = ALL_ENEMIES.filter(enemy =>
        enemy.moveset.some(move => move.times && move.times > 1)
      );
      expect(multiHitEnemies.length).toBeGreaterThan(0);
    });

    it('multi-attack should hit correct number of times', () => {
      // Byrd has Peck: 1 damage x 5 times
      const byrd = getEnemyById('byrd');
      expect(byrd).toBeDefined();

      const peckMove = byrd.moveset.find(m => m.id === 'peck');
      expect(peckMove).toBeDefined();
      expect(peckMove.damage).toBe(1);
      expect(peckMove.times).toBe(5);

      // Total damage = 1 * 5 = 5
      const totalDamage = peckMove.damage * peckMove.times;
      expect(totalDamage).toBe(5);
    });

    it('multi-attack damage should be calculated per hit', () => {
      // Simulate multi-attack against target with block
      const executeMultiAttack = (damage, times, target) => {
        let currentTarget = { ...target };

        for (let i = 0; i < times; i++) {
          currentTarget = applyDamageToTarget(currentTarget, damage);
        }

        return currentTarget;
      };

      // Target has 3 block, takes 5 hits of 1 damage each
      const target = { currentHp: 50, block: 3 };
      const result = executeMultiAttack(1, 5, target);

      // First 3 hits remove block, last 2 deal 2 damage
      expect(result.block).toBe(0);
      expect(result.currentHp).toBe(48);
    });

    it('Guardian Whirlwind should hit 4 times', () => {
      const guardian = getEnemyById('theGuardian');
      expect(guardian).toBeDefined();

      const whirlwind = guardian.moveset.find(m => m.id === 'whirlwind');
      expect(whirlwind).toBeDefined();
      expect(whirlwind.damage).toBe(5);
      expect(whirlwind.times).toBe(4);

      // Total = 5 * 4 = 20
      expect(whirlwind.damage * whirlwind.times).toBe(20);
    });

    it('multi-attack with strength should add to each hit', () => {
      const attacker = { strength: 2, weak: 0 };
      const defender = { vulnerable: 0 };

      // 5 damage, 2 hits, +2 strength per hit
      const baseDamage = 5;
      const hits = 2;
      const damagePerHit = calculateDamage(baseDamage, attacker, defender);

      expect(damagePerHit).toBe(7); // 5 + 2
      expect(damagePerHit * hits).toBe(14); // Total
    });

    it('multi-attack against vulnerable target', () => {
      const attacker = { strength: 0, weak: 0 };
      const defender = { vulnerable: 1 };

      // 4 damage, 3 hits, target is vulnerable
      const baseDamage = 4;
      const hits = 3;
      const damagePerHit = calculateDamage(baseDamage, attacker, defender);

      expect(damagePerHit).toBe(6); // 4 * 1.5 = 6
      expect(damagePerHit * hits).toBe(18); // Total
    });

    it('Gremlin Leader stab should hit 3 times', () => {
      const gremlinLeader = getEnemyById('gremlinLeader');
      expect(gremlinLeader).toBeDefined();

      const stab = gremlinLeader.moveset.find(m => m.id === 'stab');
      expect(stab).toBeDefined();
      expect(stab.damage).toBe(6);
      expect(stab.times).toBe(3);

      // Total = 6 * 3 = 18
      expect(stab.damage * stab.times).toBe(18);
    });

    it('Book of Stabbing multi-stab should have 2 initial hits', () => {
      const book = getEnemyById('bookOfStabbing');
      expect(book).toBeDefined();

      const multiStab = book.moveset.find(m => m.id === 'multiStab');
      expect(multiStab).toBeDefined();
      expect(multiStab.damage).toBe(6);
      expect(multiStab.times).toBe(2);

      // Book escalates stab count over time
      expect(book.multiStabCount).toBe(2);
      expect(book.stabEscalation).toBe(1);
    });
  });

  describe('Enemy Intent System', () => {
    it('all intents should be valid', () => {
      const validIntents = Object.values(INTENT);

      ALL_ENEMIES.forEach(enemy => {
        enemy.moveset.forEach(move => {
          expect(validIntents).toContain(move.intent);
        });
      });
    });

    it('attack intents should have damage property', () => {
      const attackIntents = [INTENT.ATTACK, INTENT.ATTACK_BUFF, INTENT.ATTACK_DEBUFF, INTENT.ATTACK_DEFEND];

      ALL_ENEMIES.forEach(enemy => {
        enemy.moveset.forEach(move => {
          if (attackIntents.includes(move.intent)) {
            expect(move.damage).toBeDefined();
          }
        });
      });
    });

    it('defend intents should have block property or special effect', () => {
      const defendIntents = [INTENT.DEFEND, INTENT.DEFEND_BUFF, INTENT.ATTACK_DEFEND];

      ALL_ENEMIES.forEach(enemy => {
        enemy.moveset.forEach(move => {
          if (defendIntents.includes(move.intent)) {
            const hasBlock = move.block !== undefined;
            const hasDefendEffect = move.special !== undefined;
            expect(hasBlock || hasDefendEffect).toBe(true);
          }
        });
      });
    });
  });

  describe('Special Enemy Behaviors', () => {
    it('sleeping enemies should have asleep property', () => {
      const sleepingEnemies = ALL_ENEMIES.filter(e => e.asleep === true);
      expect(sleepingEnemies.length).toBeGreaterThan(0);

      sleepingEnemies.forEach(enemy => {
        const sleepMove = enemy.moveset.find(m => m.intent === INTENT.SLEEPING);
        expect(sleepMove).toBeDefined();
      });
    });

    it('Lagavulin should start asleep', () => {
      const lagavulin = getEnemyById('lagavulin');
      expect(lagavulin).toBeDefined();
      expect(lagavulin.asleep).toBe(true);
      expect(lagavulin.wakeThreshold).toBe(3);

      // Should use sleep move initially
      const instance = createEnemyInstance(lagavulin);
      const firstMove = lagavulin.ai(instance, 0, null, 0);
      expect(firstMove.intent).toBe(INTENT.SLEEPING);
    });

    it('enemies with metallicize should have it defined', () => {
      const lagavulin = getEnemyById('lagavulin');
      expect(lagavulin.metallicize).toBe(6);
    });

    it('enemies with thorns should deal damage when attacked', () => {
      const spiker = getEnemyById('spiker');
      expect(spiker).toBeDefined();
      expect(spiker.thorns).toBe(3);

      // Simulate thorns damage
      const applyThorns = (attacker, thornsAmount) => {
        return applyDamageToTarget(attacker, thornsAmount);
      };

      const player = { currentHp: 50, block: 0 };
      const result = applyThorns(player, 3);
      expect(result.currentHp).toBe(47);
    });

    it('Gremlin Nob should enrage when skills are played', () => {
      const gremlinNob = getEnemyById('gremlinNob');
      expect(gremlinNob).toBeDefined();
      expect(gremlinNob.enrage).toBe(true);

      // Has bellow move with enrage effect
      const bellow = gremlinNob.moveset.find(m => m.id === 'bellow');
      expect(bellow).toBeDefined();
      expect(bellow.effects.some(e => e.type === 'enrage')).toBe(true);
    });

    it('Fungi Beast should have spore cloud on death', () => {
      const fungiBeast = getEnemyById('fungiBeast');
      expect(fungiBeast).toBeDefined();
      expect(fungiBeast.sporeCloud).toBe(true);
    });
  });

  describe('Boss Mechanics', () => {
    it('all bosses should have high HP', () => {
      const bosses = ALL_ENEMIES.filter(e => e.type === 'boss');
      expect(bosses.length).toBeGreaterThan(0);

      bosses.forEach(boss => {
        const hp = typeof boss.hp === 'object' ? boss.hp.min : boss.hp;
        expect(hp).toBeGreaterThanOrEqual(100);
      });
    });

    it('The Guardian should have mode shift mechanic', () => {
      const guardian = getEnemyById('theGuardian');
      expect(guardian).toBeDefined();
      expect(guardian.modeShift).toBe(true);

      const modeShiftMove = guardian.moveset.find(m => m.special === 'modeShift');
      expect(modeShiftMove).toBeDefined();
    });

    it('Hexaghost should have divider attack', () => {
      const hexaghost = getEnemyById('hexaghost');
      expect(hexaghost).toBeDefined();

      const divider = hexaghost.moveset.find(m => m.id === 'divider');
      expect(divider).toBeDefined();
      expect(divider.times).toBe(6);
    });
  });

  describe('Enemy Instance Creation', () => {
    it('should create instance with unique ID', () => {
      const cultist = getEnemyById('cultist');
      const instance1 = createEnemyInstance(cultist, 0);
      const instance2 = createEnemyInstance(cultist, 1);

      expect(instance1.instanceId).not.toBe(instance2.instanceId);
    });

    it('should initialize HP within range', () => {
      const cultist = getEnemyById('cultist');

      for (let i = 0; i < 20; i++) {
        const instance = createEnemyInstance(cultist);
        expect(instance.currentHp).toBeGreaterThanOrEqual(cultist.hp.min);
        expect(instance.currentHp).toBeLessThanOrEqual(cultist.hp.max);
        expect(instance.currentHp).toBe(instance.maxHp);
      }
    });

    it('should initialize status effects to 0', () => {
      const enemy = getEnemyById('cultist');
      const instance = createEnemyInstance(enemy);

      expect(instance.block).toBe(0);
      expect(instance.vulnerable).toBe(0);
      expect(instance.weak).toBe(0);
      expect(instance.strength).toBe(0);
    });

    it('should copy enemy properties to instance', () => {
      const enemy = getEnemyById('cultist');
      const instance = createEnemyInstance(enemy);

      expect(instance.id).toBe(enemy.id);
      expect(instance.name).toBe(enemy.name);
      expect(instance.moveset).toBeDefined();
    });
  });

  describe('Enemy AI Consistency', () => {
    it('all enemies should have working AI', () => {
      ALL_ENEMIES.forEach(enemy => {
        const instance = createEnemyInstance(enemy);
        const move = enemy.ai(instance, 0, null, 0);

        expect(move).toBeDefined();
        expect(move.intent).toBeDefined();
      });
    });

    it('enemy AI should handle multiple consecutive turns', () => {
      ALL_ENEMIES.forEach(enemy => {
        const instance = createEnemyInstance(enemy);
        let lastMove = null;

        for (let turn = 0; turn < 10; turn++) {
          const move = enemy.ai(instance, turn, lastMove, 0);
          expect(move).toBeDefined();
          expect(move.intent).toBeDefined();
          lastMove = move;
        }
      });
    });

    it('Cultist should buff on first turn then attack', () => {
      const cultist = getEnemyById('cultist');
      const instance = createEnemyInstance(cultist);

      const turn0Move = cultist.ai(instance, 0, null, 0);
      expect(turn0Move.intent).toBe(INTENT.BUFF);

      const turn1Move = cultist.ai(instance, 1, turn0Move, 0);
      expect(turn1Move.intent).toBe(INTENT.ATTACK);
    });
  });
});
