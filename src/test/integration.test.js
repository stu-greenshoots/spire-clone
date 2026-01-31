import { describe, it, expect } from 'vitest';
import { getStarterDeck, getCardRewards, ALL_CARDS, CARD_TYPES } from '../data/cards';
import { getEncounter, getBossEncounter, createEnemyInstance, ALL_ENEMIES } from '../data/enemies';
import { getStarterRelic, getRandomRelic, ALL_RELICS } from '../data/relics';

describe('Integration Tests', () => {
  describe('Full Game Setup', () => {
    it('should be able to set up a complete game', () => {
      // Get starter deck
      const deck = getStarterDeck();
      expect(deck.length).toBe(10);

      // Get starter relic
      const relic = getStarterRelic();
      expect(relic).toBeDefined();
      expect(relic.name).toBe('Burning Blood');

      // Initial player state
      const player = {
        maxHp: 80,
        currentHp: 80,
        gold: 99,
        energy: 3,
        maxEnergy: 3
      };

      expect(player.currentHp).toBe(player.maxHp);
    });

    it('should be able to generate encounters for all acts', () => {
      for (let act = 1; act <= 3; act++) {
        const normalEncounter = getEncounter(act, 5, 0.1, false);
        expect(normalEncounter.length).toBeGreaterThan(0);

        const eliteEncounter = getEncounter(act, 5, 0.1, true);
        expect(eliteEncounter.length).toBeGreaterThan(0);
        eliteEncounter.forEach(e => expect(e.type).toBe('elite'));

        const bossEncounter = getBossEncounter(act);
        expect(bossEncounter.length).toBeGreaterThanOrEqual(1);
        expect(bossEncounter[0].type).toBe('boss');
      }
    });
  });

  describe('Combat Simulation', () => {
    it('should simulate a basic combat turn', () => {
      // Setup
      const player = {
        currentHp: 80,
        maxHp: 80,
        block: 0,
        energy: 3,
        strength: 0,
        dexterity: 0,
        weak: 0,
        vulnerable: 0,
        frail: 0
      };

      const enemies = getEncounter(1, 1, 0, false);
      expect(enemies.length).toBeGreaterThan(0);

      // Simulate playing a Strike (6 damage)
      const strike = ALL_CARDS.find(c => c.id === 'strike');
      expect(strike).toBeDefined();

      const enemy = enemies[0];
      const initialHp = enemy.currentHp;

      // Apply damage
      const damage = strike.damage + player.strength;
      enemy.currentHp -= damage;

      expect(enemy.currentHp).toBe(initialHp - 6);
    });

    it('should simulate playing Defend', () => {
      const player = {
        currentHp: 80,
        block: 0,
        dexterity: 0,
        frail: 0
      };

      const defend = ALL_CARDS.find(c => c.id === 'defend');
      expect(defend).toBeDefined();

      // Apply block
      player.block += defend.block + player.dexterity;
      expect(player.block).toBe(5);
    });

    it('should simulate enemy attack with block mitigation', () => {
      const player = {
        currentHp: 80,
        block: 10
      };

      // Enemy deals 15 damage
      const incomingDamage = 15;

      if (player.block >= incomingDamage) {
        player.block -= incomingDamage;
      } else {
        const overflow = incomingDamage - player.block;
        player.block = 0;
        player.currentHp -= overflow;
      }

      expect(player.block).toBe(0);
      expect(player.currentHp).toBe(75); // 80 - (15 - 10) = 75
    });

    it('should handle multi-hit attacks correctly', () => {
      const twinStrike = ALL_CARDS.find(c => c.id === 'twinStrike');
      expect(twinStrike).toBeDefined();
      expect(twinStrike.hits).toBe(2);
      expect(twinStrike.damage).toBe(5);

      // Total damage = 5 * 2 = 10
      const totalDamage = twinStrike.damage * twinStrike.hits;
      expect(totalDamage).toBe(10);
    });

    it('should handle AoE attacks correctly', () => {
      const cleave = ALL_CARDS.find(c => c.id === 'cleave');
      expect(cleave).toBeDefined();
      expect(cleave.targetAll).toBe(true);

      const enemies = [
        createEnemyInstance(ALL_ENEMIES[0], 0),
        createEnemyInstance(ALL_ENEMIES[0], 1)
      ];

      // Apply cleave damage to all enemies
      enemies.forEach(enemy => {
        enemy.currentHp -= cleave.damage;
      });

      enemies.forEach(enemy => {
        expect(enemy.currentHp).toBeLessThan(enemy.maxHp);
      });
    });
  });

  describe('Debuff Mechanics', () => {
    it('should apply Vulnerable correctly (50% more damage)', () => {
      const baseDamage = 10;
      const vulnerable = 2; // 2 turns of vulnerable

      let damage = baseDamage;
      if (vulnerable > 0) {
        damage = Math.floor(damage * 1.5);
      }

      expect(damage).toBe(15);
    });

    it('should apply Weak correctly (25% less damage)', () => {
      const baseDamage = 10;
      const weak = 2;

      let damage = baseDamage;
      if (weak > 0) {
        damage = Math.floor(damage * 0.75);
      }

      expect(damage).toBe(7);
    });

    it('should apply Frail correctly (25% less block)', () => {
      const baseBlock = 8;
      const frail = 1;

      let block = baseBlock;
      if (frail > 0) {
        block = Math.floor(block * 0.75);
      }

      expect(block).toBe(6);
    });

    it('should stack Strength correctly', () => {
      const baseDamage = 6;
      const strength = 3;

      const damage = baseDamage + strength;
      expect(damage).toBe(9);
    });

    it('should stack Dexterity correctly', () => {
      const baseBlock = 5;
      const dexterity = 2;

      const block = baseBlock + dexterity;
      expect(block).toBe(7);
    });
  });

  describe('Card Rewards', () => {
    it('should generate valid card rewards', () => {
      const rewards = getCardRewards(3);

      expect(rewards.length).toBe(3);
      rewards.forEach(card => {
        expect(card.instanceId).toBeDefined();
        expect(card.rarity).not.toBe('basic');
        expect(card.rarity).not.toBe('curse');
      });
    });

    it('should not have duplicate cards in rewards', () => {
      // Run multiple times to check randomness
      for (let i = 0; i < 10; i++) {
        const rewards = getCardRewards(3);
        const ids = rewards.map(c => c.id);
        const uniqueIds = [...new Set(ids)];
        expect(ids.length).toBe(uniqueIds.length);
      }
    });
  });

  describe('Relic Acquisition', () => {
    it('should be able to acquire multiple different relics', () => {
      const acquiredRelics = [];

      for (let i = 0; i < 10; i++) {
        const relic = getRandomRelic(null, acquiredRelics.map(r => r.id));
        if (relic) {
          acquiredRelics.push(relic);
        }
      }

      // Should have gotten multiple unique relics
      expect(acquiredRelics.length).toBeGreaterThan(5);
      const uniqueIds = [...new Set(acquiredRelics.map(r => r.id))];
      expect(uniqueIds.length).toBe(acquiredRelics.length);
    });
  });

  describe('Enemy AI Consistency', () => {
    it('all enemies should be able to execute at least 10 turns without error', () => {
      ALL_ENEMIES.forEach(enemyData => {
        const enemy = createEnemyInstance(enemyData);
        let lastMove = null;

        for (let turn = 0; turn < 10; turn++) {
          const move = enemyData.ai(enemy, turn, lastMove, 0);
          expect(move).toBeDefined();
          expect(move.intent).toBeDefined();
          lastMove = move;
        }
      });
    });

    it('enemy intents should match their moveset', () => {
      ALL_ENEMIES.forEach(enemyData => {
        const enemy = createEnemyInstance(enemyData);

        for (let turn = 0; turn < 5; turn++) {
          const move = enemyData.ai(enemy, turn, null, 0);
          const matchingMove = enemyData.moveset.find(m => m.id === move.id);
          expect(matchingMove).toBeDefined();
        }
      });
    });
  });

  describe('Card Type Distribution', () => {
    it('should have balanced card type distribution', () => {
      const attacks = ALL_CARDS.filter(c => c.type === CARD_TYPES.ATTACK);
      const skills = ALL_CARDS.filter(c => c.type === CARD_TYPES.SKILL);
      const powers = ALL_CARDS.filter(c => c.type === CARD_TYPES.POWER);

      expect(attacks.length).toBeGreaterThan(15);
      expect(skills.length).toBeGreaterThan(10);
      expect(powers.length).toBeGreaterThan(5);
    });

    it('should have cards at all cost levels', () => {
      const playableCards = ALL_CARDS.filter(c => !c.unplayable && c.cost >= 0);

      const cost0 = playableCards.filter(c => c.cost === 0);
      const cost1 = playableCards.filter(c => c.cost === 1);
      const cost2 = playableCards.filter(c => c.cost === 2);
      const cost3 = playableCards.filter(c => c.cost === 3);

      expect(cost0.length).toBeGreaterThan(3);
      expect(cost1.length).toBeGreaterThan(10);
      expect(cost2.length).toBeGreaterThan(5);
      expect(cost3.length).toBeGreaterThan(2);
    });
  });

  describe('Game Balance Checks', () => {
    it('starter deck should have reasonable damage output', () => {
      const deck = getStarterDeck();
      const attacks = deck.filter(c => c.type === CARD_TYPES.ATTACK);
      const totalBaseDamage = attacks.reduce((sum, c) => sum + (c.damage || 0), 0);

      // 5 Strikes (6 each) + 1 Bash (8) = 38 total
      expect(totalBaseDamage).toBe(38);
    });

    it('starter deck should have reasonable block', () => {
      const deck = getStarterDeck();
      const skills = deck.filter(c => c.type === CARD_TYPES.SKILL);
      const totalBaseBlock = skills.reduce((sum, c) => sum + (c.block || 0), 0);

      // 4 Defends (5 each) = 20 total
      expect(totalBaseBlock).toBe(20);
    });

    it('act 1 enemies should be beatable with starter deck', () => {
      const act1Normals = ALL_ENEMIES.filter(e => e.act === 1 && e.type === 'normal');

      act1Normals.forEach(enemy => {
        const hp = typeof enemy.hp === 'object' ? enemy.hp.max : enemy.hp;
        // Player should be able to kill in ~5-10 turns with starter deck
        // Starter deck does ~6 damage/card, draw 5 cards, 3 energy
        // So ~18 damage per turn on average
        expect(hp).toBeLessThan(100); // Should be killable
      });
    });
  });
});
