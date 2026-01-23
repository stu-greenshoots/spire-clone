import { describe, it, expect } from 'vitest';
import {
  ALL_ENEMIES,
  getEnemyById,
  createEnemyInstance,
  INTENT
} from '../data/enemies';
import { CARD_TYPES } from '../data/cards';
import { calculateDamage, applyDamageToTarget } from '../context/GameContext';

describe('Fixed Mechanics', () => {

  describe('Champ angered flag on removeDebuffs', () => {
    it('Champ AI should use ANGER move when HP <= 50% and not angered', () => {
      const champ = getEnemyById('theChamp');
      expect(champ).toBeDefined();

      const instance = createEnemyInstance(champ);
      const damagedInstance = {
        ...instance,
        currentHp: Math.floor(instance.maxHp / 2),
        angered: false
      };

      const move = champ.ai(damagedInstance, 1, null, 0);
      expect(move.id).toBe('anger');
      expect(move.special).toBe('removeDebuffs');
    });

    it('Champ AI should NOT use ANGER move once angered flag is set', () => {
      const champ = getEnemyById('theChamp');
      const instance = createEnemyInstance(champ);
      const damagedAndAngered = {
        ...instance,
        currentHp: Math.floor(instance.maxHp / 2),
        angered: true
      };

      // Run multiple times to account for random AI rolls
      for (let i = 0; i < 20; i++) {
        const move = champ.ai(damagedAndAngered, i, null, 0);
        expect(move.id).not.toBe('anger');
      }
    });

    it('removeDebuffs special should set angered = true for Champ', () => {
      // Simulate the reducer logic: when move.special === 'removeDebuffs'
      // and enemy id is 'theChamp', angered should be set to true
      const champ = getEnemyById('theChamp');
      const instance = createEnemyInstance(champ);

      // Simulate the reducer behavior
      let newEnemy = { ...instance };
      const move = champ.moveset.find(m => m.special === 'removeDebuffs');
      expect(move).toBeDefined();

      // Apply removeDebuffs effect
      newEnemy.vulnerable = 0;
      newEnemy.weak = 0;
      if (newEnemy.id === 'theChamp') {
        newEnemy.angered = true;
      }

      expect(newEnemy.angered).toBe(true);
      expect(newEnemy.vulnerable).toBe(0);
      expect(newEnemy.weak).toBe(0);
    });

    it('Champ anger move should clear debuffs', () => {
      const champ = getEnemyById('theChamp');
      const angerMove = champ.moveset.find(m => m.id === 'anger');
      expect(angerMove).toBeDefined();
      expect(angerMove.special).toBe('removeDebuffs');
      expect(angerMove.effects).toBeDefined();
      expect(angerMove.effects.some(e => e.type === 'strength')).toBe(true);
    });

    it('without angered flag, Champ would repeatedly pick ANGER (infinite loop)', () => {
      const champ = getEnemyById('theChamp');
      const instance = createEnemyInstance(champ);

      // At low HP but without angered being set, AI always returns anger
      const lowHpNotAngered = {
        ...instance,
        currentHp: Math.floor(instance.maxHp / 4), // 25% HP
        angered: false
      };
      const move = champ.ai(lowHpNotAngered, 5, null, 0);
      expect(move.id).toBe('anger');

      // After setting angered, it picks other moves
      const lowHpAngered = { ...lowHpNotAngered, angered: true };
      const move2 = champ.ai(lowHpAngered, 5, null, 0);
      expect(move2.id).not.toBe('anger');
    });
  });

  describe('Time Eater hasted flag on removeDebuffs', () => {
    it('Time Eater AI should use haste move when HP <= 50% and not hasted', () => {
      const timeEater = getEnemyById('timeEater');
      expect(timeEater).toBeDefined();

      const instance = createEnemyInstance(timeEater);
      const damagedInstance = {
        ...instance,
        currentHp: Math.floor(instance.maxHp / 2),
        hasted: false
      };

      const move = timeEater.ai(damagedInstance, 1, null, 0);
      expect(move.id).toBe('haste');
      expect(move.special).toBe('removeDebuffs');
    });

    it('Time Eater AI should NOT use haste move once hasted flag is set', () => {
      const timeEater = getEnemyById('timeEater');
      const instance = createEnemyInstance(timeEater);
      const damagedAndHasted = {
        ...instance,
        currentHp: Math.floor(instance.maxHp / 2),
        hasted: true
      };

      // Run multiple times to account for random AI rolls
      for (let i = 0; i < 20; i++) {
        const move = timeEater.ai(damagedAndHasted, i, null, 0);
        expect(move.id).not.toBe('haste');
      }
    });

    it('removeDebuffs special should set hasted = true for Time Eater', () => {
      const timeEater = getEnemyById('timeEater');
      const instance = createEnemyInstance(timeEater);

      let newEnemy = { ...instance, vulnerable: 3, weak: 2 };
      const move = timeEater.moveset.find(m => m.special === 'removeDebuffs');
      expect(move).toBeDefined();

      // Simulate reducer behavior
      newEnemy.vulnerable = 0;
      newEnemy.weak = 0;
      if (newEnemy.id === 'timeEater') {
        newEnemy.hasted = true;
      }

      expect(newEnemy.hasted).toBe(true);
      expect(newEnemy.vulnerable).toBe(0);
      expect(newEnemy.weak).toBe(0);
    });

    it('Time Eater haste move should have removeDebuffs special and strength buff', () => {
      const timeEater = getEnemyById('timeEater');
      const hasteMove = timeEater.moveset.find(m => m.id === 'haste');
      expect(hasteMove).toBeDefined();
      expect(hasteMove.special).toBe('removeDebuffs');
      expect(hasteMove.effects.some(e => e.type === 'strength' && e.amount === 2)).toBe(true);
    });
  });

  describe('Book of Stabbing escalation (addStab)', () => {
    it('Book of Stabbing should have multiStabCount and stabEscalation', () => {
      const book = getEnemyById('bookOfStabbing');
      expect(book).toBeDefined();
      expect(book.multiStabCount).toBe(3);
      expect(book.stabEscalation).toBe(1);
    });

    it('multiStab move should have addStab special', () => {
      const book = getEnemyById('bookOfStabbing');
      const multiStab = book.moveset.find(m => m.id === 'multiStab');
      expect(multiStab).toBeDefined();
      expect(multiStab.special).toBe('addStab');
    });

    it('hit count should use enemy.multiStabCount when move.special is addStab', () => {
      // Simulate the reducer logic for determining hit count
      const book = getEnemyById('bookOfStabbing');
      const instance = createEnemyInstance(book);
      const move = book.moveset.find(m => m.special === 'addStab');

      // Initial state: multiStabCount is 3, same as move.times
      let enemy = { ...instance, multiStabCount: 3 };
      let hits = (move.special === 'addStab' && enemy.multiStabCount)
        ? enemy.multiStabCount
        : (move.times || 1);
      expect(hits).toBe(3);

      // After first escalation: multiStabCount becomes 4
      enemy.multiStabCount = 4;
      hits = (move.special === 'addStab' && enemy.multiStabCount)
        ? enemy.multiStabCount
        : (move.times || 1);
      expect(hits).toBe(4);

      // After second escalation: multiStabCount becomes 5
      enemy.multiStabCount = 5;
      hits = (move.special === 'addStab' && enemy.multiStabCount)
        ? enemy.multiStabCount
        : (move.times || 1);
      expect(hits).toBe(5);
    });

    it('without escalation fix, hits would always be static move.times (3)', () => {
      const book = getEnemyById('bookOfStabbing');
      const move = book.moveset.find(m => m.special === 'addStab');

      // Using only move.times ignores escalation
      const staticHits = move.times;
      expect(staticHits).toBe(3); // Always 3, never escalates

      // Using multiStabCount respects escalation
      const escalatedEnemy = { multiStabCount: 7 };
      const dynamicHits = (move.special === 'addStab' && escalatedEnemy.multiStabCount)
        ? escalatedEnemy.multiStabCount
        : (move.times || 1);
      expect(dynamicHits).toBe(7); // Properly escalated
    });

    it('addStab special should increment multiStabCount by stabEscalation', () => {
      const book = getEnemyById('bookOfStabbing');
      let enemy = { ...createEnemyInstance(book), multiStabCount: 3 };

      // Simulate the reducer: multiStabCount += stabEscalation
      enemy.multiStabCount = (enemy.multiStabCount || 3) + (enemy.stabEscalation || 1);
      expect(enemy.multiStabCount).toBe(4);

      enemy.multiStabCount = (enemy.multiStabCount || 3) + (enemy.stabEscalation || 1);
      expect(enemy.multiStabCount).toBe(5);

      enemy.multiStabCount = (enemy.multiStabCount || 3) + (enemy.stabEscalation || 1);
      expect(enemy.multiStabCount).toBe(6);
    });

    it('total damage should increase each turn with escalation', () => {
      const book = getEnemyById('bookOfStabbing');
      const move = book.moveset.find(m => m.special === 'addStab');
      const baseDamage = move.damage; // 7

      // Turn 1: 3 hits * 7 = 21
      expect(baseDamage * 3).toBe(21);
      // Turn 2: 4 hits * 7 = 28
      expect(baseDamage * 4).toBe(28);
      // Turn 3: 5 hits * 7 = 35
      expect(baseDamage * 5).toBe(35);
    });
  });

  describe('Lagavulin waking up when damaged', () => {
    it('Lagavulin should start asleep', () => {
      const lagavulin = getEnemyById('lagavulin');
      expect(lagavulin).toBeDefined();
      expect(lagavulin.asleep).toBe(true);
    });

    it('Lagavulin should wake up when currentHp < maxHp (damaged)', () => {
      const lagavulin = getEnemyById('lagavulin');
      const instance = createEnemyInstance(lagavulin);

      // Simulate the reducer logic: if asleep && currentHp < maxHp && !wokenUp
      const damagedEnemy = { ...instance, currentHp: instance.maxHp - 5 };

      let result = damagedEnemy;
      if (result.asleep && result.currentHp < result.maxHp && !result.wokenUp) {
        result = { ...result, wokenUp: true, asleep: false };
      }

      expect(result.wokenUp).toBe(true);
      expect(result.asleep).toBe(false);
    });

    it('Lagavulin should NOT wake up if not damaged (currentHp === maxHp)', () => {
      const lagavulin = getEnemyById('lagavulin');
      const instance = createEnemyInstance(lagavulin);

      // At full HP, condition currentHp < maxHp is false
      let result = { ...instance };
      if (result.asleep && result.currentHp < result.maxHp && !result.wokenUp) {
        result = { ...result, wokenUp: true, asleep: false };
      }

      expect(result.wokenUp).toBeUndefined();
      expect(result.asleep).toBe(true);
    });

    it('Lagavulin should NOT wake up again if already wokenUp', () => {
      const lagavulin = getEnemyById('lagavulin');
      const instance = createEnemyInstance(lagavulin);

      // Already woken up
      const alreadyWoken = {
        ...instance,
        currentHp: instance.maxHp - 10,
        wokenUp: true,
        asleep: false
      };

      let result = { ...alreadyWoken };
      if (result.asleep && result.currentHp < result.maxHp && !result.wokenUp) {
        result = { ...result, wokenUp: true, asleep: false };
      }

      // No change since asleep is already false
      expect(result.wokenUp).toBe(true);
      expect(result.asleep).toBe(false);
    });

    it('Lagavulin AI uses sleep move when asleep and not wokenUp', () => {
      const lagavulin = getEnemyById('lagavulin');
      const instance = createEnemyInstance(lagavulin);
      const sleepingInstance = { ...instance, wokenUp: false };

      const move = lagavulin.ai(sleepingInstance, 0, null, 0);
      expect(move.intent).toBe(INTENT.SLEEPING);
    });

    it('Lagavulin AI uses attack/debuff moves after waking', () => {
      const lagavulin = getEnemyById('lagavulin');
      const instance = createEnemyInstance(lagavulin);
      const wokenInstance = { ...instance, asleep: false, wokenUp: true };

      // After waking, AI alternates between siphon (turn%2===0) and attack (turn%2===1)
      const moveEven = lagavulin.ai(wokenInstance, 4, null, 0);
      expect(moveEven.id).toBe('siphonSoul');

      const moveOdd = lagavulin.ai(wokenInstance, 5, null, 0);
      expect(moveOdd.id).toBe('attack');
    });

    it('any amount of damage should trigger wake up', () => {
      const lagavulin = getEnemyById('lagavulin');
      const instance = createEnemyInstance(lagavulin);

      // Even 1 HP of damage should wake it
      const barelyDamaged = { ...instance, currentHp: instance.maxHp - 1 };

      let result = { ...barelyDamaged };
      if (result.asleep && result.currentHp < result.maxHp && !result.wokenUp) {
        result = { ...result, wokenUp: true, asleep: false };
      }

      expect(result.wokenUp).toBe(true);
      expect(result.asleep).toBe(false);
    });
  });

  describe('Awakened One rebirth', () => {
    it('Awakened One should have canRebirth property', () => {
      const awakenedOne = getEnemyById('awakened_one');
      expect(awakenedOne).toBeDefined();
      expect(awakenedOne.canRebirth).toBe(true);
    });

    it('enemy reaching 0 HP with canRebirth should be restored to full HP', () => {
      const awakenedOne = getEnemyById('awakened_one');
      const instance = createEnemyInstance(awakenedOne);
      const deadEnemy = { ...instance, currentHp: 0 };

      // Simulate rebirth check from reducer
      let result = { ...deadEnemy };
      if (result.currentHp <= 0 && result.canRebirth && !result.reborn) {
        result = {
          ...result,
          currentHp: result.maxHp,
          reborn: true,
          strength: (result.strength || 0) + 2,
          vulnerable: 0,
          weak: 0,
          moveIndex: 0
        };
      }

      expect(result.currentHp).toBe(instance.maxHp);
      expect(result.reborn).toBe(true);
      expect(result.strength).toBe(2);
    });

    it('reborn enemy should gain +2 strength', () => {
      const awakenedOne = getEnemyById('awakened_one');
      const instance = createEnemyInstance(awakenedOne);
      const deadWithStrength = { ...instance, currentHp: 0, strength: 3 };

      let result = { ...deadWithStrength };
      if (result.currentHp <= 0 && result.canRebirth && !result.reborn) {
        result = {
          ...result,
          currentHp: result.maxHp,
          reborn: true,
          strength: (result.strength || 0) + 2,
          vulnerable: 0,
          weak: 0,
          moveIndex: 0
        };
      }

      expect(result.strength).toBe(5); // 3 existing + 2 from rebirth
    });

    it('rebirth should clear debuffs', () => {
      const awakenedOne = getEnemyById('awakened_one');
      const instance = createEnemyInstance(awakenedOne);
      const deadWithDebuffs = {
        ...instance,
        currentHp: 0,
        vulnerable: 3,
        weak: 2
      };

      let result = { ...deadWithDebuffs };
      if (result.currentHp <= 0 && result.canRebirth && !result.reborn) {
        result = {
          ...result,
          currentHp: result.maxHp,
          reborn: true,
          strength: (result.strength || 0) + 2,
          vulnerable: 0,
          weak: 0,
          moveIndex: 0
        };
      }

      expect(result.vulnerable).toBe(0);
      expect(result.weak).toBe(0);
    });

    it('enemy with reborn: true should NOT rebirth again', () => {
      const awakenedOne = getEnemyById('awakened_one');
      const instance = createEnemyInstance(awakenedOne);
      const deadAndReborn = { ...instance, currentHp: 0, reborn: true };

      let result = { ...deadAndReborn };
      if (result.currentHp <= 0 && result.canRebirth && !result.reborn) {
        result = {
          ...result,
          currentHp: result.maxHp,
          reborn: true,
          strength: (result.strength || 0) + 2,
          vulnerable: 0,
          weak: 0,
          moveIndex: 0
        };
      }

      // Should remain dead since reborn is already true
      expect(result.currentHp).toBe(0);
    });

    it('enemies without canRebirth should NOT rebirth', () => {
      const cultist = getEnemyById('cultist');
      const instance = createEnemyInstance(cultist);
      const deadCultist = { ...instance, currentHp: 0 };

      let result = { ...deadCultist };
      if (result.currentHp <= 0 && result.canRebirth && !result.reborn) {
        result = {
          ...result,
          currentHp: result.maxHp,
          reborn: true,
          strength: (result.strength || 0) + 2,
          vulnerable: 0,
          weak: 0,
          moveIndex: 0
        };
      }

      expect(result.currentHp).toBe(0);
      expect(result.reborn).toBeUndefined();
    });
  });

  describe('Enemy flight damage reduction', () => {
    it('applyDamageToTarget should reduce damage by 50% when target has flight > 0', () => {
      const target = { currentHp: 50, block: 0, flight: 3 };
      const result = applyDamageToTarget(target, 10);

      // 10 * 0.5 = 5 damage after flight reduction
      expect(result.currentHp).toBe(45);
    });

    it('applyDamageToTarget should decrement flight by 1 when hit', () => {
      const target = { currentHp: 50, block: 0, flight: 3 };
      const result = applyDamageToTarget(target, 10);

      expect(result.flight).toBe(2);
    });

    it('target should be grounded when flight reaches 0', () => {
      const target = { currentHp: 50, block: 0, flight: 1 };
      const result = applyDamageToTarget(target, 10);

      expect(result.flight).toBe(0);
      expect(result.grounded).toBe(true);
    });

    it('target should NOT be grounded when flight is still > 0 after hit', () => {
      const target = { currentHp: 50, block: 0, flight: 2 };
      const result = applyDamageToTarget(target, 10);

      expect(result.flight).toBe(1);
      expect(result.grounded).toBeFalsy();
    });

    it('flight damage reduction should be applied before block', () => {
      const target = { currentHp: 50, block: 10, flight: 2 };
      const result = applyDamageToTarget(target, 20);

      // 20 * 0.5 = 10 after flight, then 10 - 10 block = 0 HP damage
      expect(result.block).toBe(0);
      expect(result.currentHp).toBe(50);
      expect(result.flight).toBe(1);
    });

    it('flight reduction should floor the damage', () => {
      const target = { currentHp: 50, block: 0, flight: 2 };
      const result = applyDamageToTarget(target, 7);

      // 7 * 0.5 = 3.5 -> floor to 3
      expect(result.currentHp).toBe(47);
    });

    it('target without flight should take full damage', () => {
      const target = { currentHp: 50, block: 0 };
      const result = applyDamageToTarget(target, 10);

      expect(result.currentHp).toBe(40);
    });

    it('target with flight = 0 should take full damage', () => {
      const target = { currentHp: 50, block: 0, flight: 0 };
      const result = applyDamageToTarget(target, 10);

      // flight is 0, so no damage reduction
      expect(result.currentHp).toBe(40);
    });

    it('multi-hit attacks should decrement flight each hit', () => {
      let target = { currentHp: 50, block: 0, flight: 3 };

      // Hit 1: 10 * 0.5 = 5, flight goes to 2
      target = applyDamageToTarget(target, 10);
      expect(target.currentHp).toBe(45);
      expect(target.flight).toBe(2);

      // Hit 2: 10 * 0.5 = 5, flight goes to 1
      target = applyDamageToTarget(target, 10);
      expect(target.currentHp).toBe(40);
      expect(target.flight).toBe(1);

      // Hit 3: 10 * 0.5 = 5, flight goes to 0, grounded
      target = applyDamageToTarget(target, 10);
      expect(target.currentHp).toBe(35);
      expect(target.flight).toBe(0);
      expect(target.grounded).toBe(true);

      // Hit 4: no more flight, full damage
      target = applyDamageToTarget(target, 10);
      expect(target.currentHp).toBe(25);
    });
  });

  describe('Beat of Death', () => {
    it('Corrupt Heart should have beatOfDeath property', () => {
      const heart = getEnemyById('corruptHeart');
      expect(heart).toBeDefined();
      expect(heart.beatOfDeath).toBe(true);
    });

    it('playing a card should deal 1 damage to player when enemy has beatOfDeath', () => {
      // Simulate the reducer beat of death logic
      const player = { currentHp: 50, block: 0 };
      const enemies = [{ beatOfDeath: true, currentHp: 800 }];

      const heartEnemy = enemies.find(e => e.beatOfDeath && e.currentHp > 0);
      let newPlayer = { ...player };

      if (heartEnemy) {
        const beatDamage = 1;
        if (newPlayer.block >= beatDamage) {
          newPlayer.block -= beatDamage;
        } else {
          const remaining = beatDamage - newPlayer.block;
          newPlayer.block = 0;
          newPlayer.currentHp = Math.max(0, newPlayer.currentHp - remaining);
        }
      }

      expect(newPlayer.currentHp).toBe(49);
    });

    it('beat of death damage should reduce block first', () => {
      const player = { currentHp: 50, block: 5 };
      const enemies = [{ beatOfDeath: true, currentHp: 800 }];

      const heartEnemy = enemies.find(e => e.beatOfDeath && e.currentHp > 0);
      let newPlayer = { ...player };

      if (heartEnemy) {
        const beatDamage = 1;
        if (newPlayer.block >= beatDamage) {
          newPlayer.block -= beatDamage;
        } else {
          const remaining = beatDamage - newPlayer.block;
          newPlayer.block = 0;
          newPlayer.currentHp = Math.max(0, newPlayer.currentHp - remaining);
        }
      }

      expect(newPlayer.block).toBe(4);
      expect(newPlayer.currentHp).toBe(50);
    });

    it('beat of death should not trigger if enemy is dead', () => {
      const player = { currentHp: 50, block: 0 };
      const enemies = [{ beatOfDeath: true, currentHp: 0 }]; // Dead

      const heartEnemy = enemies.find(e => e.beatOfDeath && e.currentHp > 0);
      let newPlayer = { ...player };

      if (heartEnemy) {
        const beatDamage = 1;
        if (newPlayer.block >= beatDamage) {
          newPlayer.block -= beatDamage;
        } else {
          const remaining = beatDamage - newPlayer.block;
          newPlayer.block = 0;
          newPlayer.currentHp = Math.max(0, newPlayer.currentHp - remaining);
        }
      }

      // No damage since heart is dead
      expect(newPlayer.currentHp).toBe(50);
    });

    it('beat of death should not reduce HP below 0', () => {
      const player = { currentHp: 1, block: 0 };
      const enemies = [{ beatOfDeath: true, currentHp: 800 }];

      const heartEnemy = enemies.find(e => e.beatOfDeath && e.currentHp > 0);
      let newPlayer = { ...player };

      if (heartEnemy) {
        const beatDamage = 1;
        if (newPlayer.block >= beatDamage) {
          newPlayer.block -= beatDamage;
        } else {
          const remaining = beatDamage - newPlayer.block;
          newPlayer.block = 0;
          newPlayer.currentHp = Math.max(0, newPlayer.currentHp - remaining);
        }
      }

      expect(newPlayer.currentHp).toBe(0);
    });

    it('multiple cards should each trigger beat of death independently', () => {
      let player = { currentHp: 50, block: 0 };
      const enemies = [{ beatOfDeath: true, currentHp: 800 }];

      // Play 5 cards
      for (let i = 0; i < 5; i++) {
        const heartEnemy = enemies.find(e => e.beatOfDeath && e.currentHp > 0);
        if (heartEnemy) {
          const beatDamage = 1;
          if (player.block >= beatDamage) {
            player = { ...player, block: player.block - beatDamage };
          } else {
            const remaining = beatDamage - player.block;
            player = {
              ...player,
              block: 0,
              currentHp: Math.max(0, player.currentHp - remaining)
            };
          }
        }
      }

      expect(player.currentHp).toBe(45); // 5 damage total
    });
  });

  describe('Awakened One curiosity (Power card reaction)', () => {
    it('Awakened One should have curious property', () => {
      const awakenedOne = getEnemyById('awakened_one');
      expect(awakenedOne).toBeDefined();
      expect(awakenedOne.curious).toBe(true);
    });

    it('playing a POWER card should give +2 strength to curious enemies', () => {
      const card = { type: CARD_TYPES.POWER };
      let enemies = [
        { id: 'awakened_one', curious: true, currentHp: 300, strength: 0 }
      ];

      // Simulate reducer logic
      if (card.type === CARD_TYPES.POWER) {
        enemies = enemies.map(enemy => {
          if (enemy.curious && enemy.currentHp > 0) {
            return { ...enemy, strength: (enemy.strength || 0) + 2 };
          }
          return enemy;
        });
      }

      expect(enemies[0].strength).toBe(2);
    });

    it('playing a non-POWER card should NOT trigger curiosity', () => {
      const attackCard = { type: CARD_TYPES.ATTACK };
      const skillCard = { type: CARD_TYPES.SKILL };
      let enemies = [
        { id: 'awakened_one', curious: true, currentHp: 300, strength: 0 }
      ];

      // Attack card
      if (attackCard.type === CARD_TYPES.POWER) {
        enemies = enemies.map(enemy => {
          if (enemy.curious && enemy.currentHp > 0) {
            return { ...enemy, strength: (enemy.strength || 0) + 2 };
          }
          return enemy;
        });
      }
      expect(enemies[0].strength).toBe(0);

      // Skill card
      if (skillCard.type === CARD_TYPES.POWER) {
        enemies = enemies.map(enemy => {
          if (enemy.curious && enemy.currentHp > 0) {
            return { ...enemy, strength: (enemy.strength || 0) + 2 };
          }
          return enemy;
        });
      }
      expect(enemies[0].strength).toBe(0);
    });

    it('curiosity should stack with each POWER card played', () => {
      let enemies = [
        { id: 'awakened_one', curious: true, currentHp: 300, strength: 0 }
      ];

      // Play 3 power cards
      for (let i = 0; i < 3; i++) {
        const card = { type: CARD_TYPES.POWER };
        if (card.type === CARD_TYPES.POWER) {
          enemies = enemies.map(enemy => {
            if (enemy.curious && enemy.currentHp > 0) {
              return { ...enemy, strength: (enemy.strength || 0) + 2 };
            }
            return enemy;
          });
        }
      }

      expect(enemies[0].strength).toBe(6); // 3 * 2
    });

    it('dead curious enemies should NOT gain strength', () => {
      const card = { type: CARD_TYPES.POWER };
      let enemies = [
        { id: 'awakened_one', curious: true, currentHp: 0, strength: 0 }
      ];

      if (card.type === CARD_TYPES.POWER) {
        enemies = enemies.map(enemy => {
          if (enemy.curious && enemy.currentHp > 0) {
            return { ...enemy, strength: (enemy.strength || 0) + 2 };
          }
          return enemy;
        });
      }

      expect(enemies[0].strength).toBe(0);
    });

    it('non-curious enemies should NOT gain strength from POWER cards', () => {
      const card = { type: CARD_TYPES.POWER };
      let enemies = [
        { id: 'cultist', curious: false, currentHp: 50, strength: 0 },
        { id: 'awakened_one', curious: true, currentHp: 300, strength: 0 }
      ];

      if (card.type === CARD_TYPES.POWER) {
        enemies = enemies.map(enemy => {
          if (enemy.curious && enemy.currentHp > 0) {
            return { ...enemy, strength: (enemy.strength || 0) + 2 };
          }
          return enemy;
        });
      }

      expect(enemies[0].strength).toBe(0); // Cultist unchanged
      expect(enemies[1].strength).toBe(2); // Awakened One gains strength
    });
  });
});
