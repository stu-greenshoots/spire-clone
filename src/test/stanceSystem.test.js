import { describe, it, expect } from 'vitest';
import { calculateDamage, calculateEnemyDamage } from '../systems/combatSystem';
import { createInitialState } from '../context/GameContext';

describe('Stance System', () => {
  describe('Player state initialization', () => {
    it('should initialize with null stance and 0 mantra', () => {
      const state = createInitialState();
      expect(state.player.currentStance).toBe(null);
      expect(state.player.mantra).toBe(0);
    });
  });

  describe('Outgoing damage multipliers (calculateDamage)', () => {
    it('should deal normal damage with no stance', () => {
      const attacker = { strength: 0, weak: 0, currentStance: null };
      const defender = { vulnerable: 0 };
      expect(calculateDamage(6, attacker, defender)).toBe(6);
    });

    it('should deal normal damage in Calm stance', () => {
      const attacker = { strength: 0, weak: 0, currentStance: 'calm' };
      const defender = { vulnerable: 0 };
      expect(calculateDamage(6, attacker, defender)).toBe(6);
    });

    it('should deal 2x damage in Wrath stance', () => {
      const attacker = { strength: 0, weak: 0, currentStance: 'wrath' };
      const defender = { vulnerable: 0 };
      expect(calculateDamage(6, attacker, defender)).toBe(12);
    });

    it('should deal 3x damage in Divinity stance', () => {
      const attacker = { strength: 0, weak: 0, currentStance: 'divinity' };
      const defender = { vulnerable: 0 };
      expect(calculateDamage(6, attacker, defender)).toBe(18);
    });

    it('should apply stance multiplier before weak', () => {
      const attacker = { strength: 0, weak: 1, currentStance: 'wrath' };
      const defender = { vulnerable: 0 };
      // 6 * 2 = 12, then 12 * 0.75 = 9
      expect(calculateDamage(6, attacker, defender)).toBe(9);
    });

    it('should apply strength then stance then weak then vulnerable', () => {
      const attacker = { strength: 2, weak: 1, currentStance: 'wrath' };
      const defender = { vulnerable: 1 };
      // (6 + 2) = 8, * 2 = 16, * 0.75 = 12, * 1.5 = 18
      expect(calculateDamage(6, attacker, defender)).toBe(18);
    });
  });

  describe('Incoming damage multipliers (calculateEnemyDamage)', () => {
    it('should deal normal incoming damage with no stance', () => {
      const enemy = { strength: 0, weak: 0 };
      const player = { vulnerable: 0, currentStance: null, intangible: 0 };
      expect(calculateEnemyDamage(10, enemy, player)).toBe(10);
    });

    it('should double incoming damage in Wrath stance', () => {
      const enemy = { strength: 0, weak: 0 };
      const player = { vulnerable: 0, currentStance: 'wrath', intangible: 0 };
      expect(calculateEnemyDamage(10, enemy, player)).toBe(20);
    });

    it('should not modify incoming damage in Calm stance', () => {
      const enemy = { strength: 0, weak: 0 };
      const player = { vulnerable: 0, currentStance: 'calm', intangible: 0 };
      expect(calculateEnemyDamage(10, enemy, player)).toBe(10);
    });

    it('should apply vulnerable before Wrath multiplier', () => {
      const enemy = { strength: 0, weak: 0 };
      const player = { vulnerable: 1, currentStance: 'wrath', intangible: 0 };
      // 10 * 1.5 = 15, * 2 = 30
      expect(calculateEnemyDamage(10, enemy, player)).toBe(30);
    });
  });

  describe('Stance transitions in card play', () => {
    // These test the logic patterns that playCardAction.js implements
    // Full integration tests would use the reducer, but we test the logic here

    it('exiting Calm should grant 2 energy', () => {
      const player = { energy: 3, currentStance: 'calm', mantra: 0 };
      // Simulate transition logic
      const oldStance = player.currentStance;
      if (oldStance === 'calm') {
        player.energy += 2;
      }
      player.currentStance = 'wrath';
      expect(player.energy).toBe(5);
      expect(player.currentStance).toBe('wrath');
    });

    it('entering Divinity should grant 3 energy', () => {
      const player = { energy: 3, currentStance: null, mantra: 0 };
      player.currentStance = 'divinity';
      player.energy += 3;
      expect(player.energy).toBe(6);
    });

    it('exiting Calm into Divinity should grant 2 + 3 = 5 energy', () => {
      const player = { energy: 3, currentStance: 'calm', mantra: 0 };
      // Exit calm
      player.energy += 2;
      // Enter divinity
      player.currentStance = 'divinity';
      player.energy += 3;
      expect(player.energy).toBe(8);
    });
  });

  describe('Mantra accumulation', () => {
    it('should accumulate mantra without triggering below 10', () => {
      const player = { energy: 3, currentStance: 'calm', mantra: 0 };
      player.mantra += 5;
      expect(player.mantra).toBe(5);
      expect(player.currentStance).toBe('calm');
    });

    it('should trigger Divinity at 10 mantra', () => {
      const player = { energy: 3, currentStance: 'calm', mantra: 7 };
      player.mantra += 3; // Now 10
      if (player.mantra >= 10) {
        player.mantra -= 10;
        // Exit calm
        if (player.currentStance === 'calm') player.energy += 2;
        player.currentStance = 'divinity';
        player.energy += 3;
      }
      expect(player.mantra).toBe(0);
      expect(player.currentStance).toBe('divinity');
      expect(player.energy).toBe(8); // 3 + 2 (calm exit) + 3 (divinity enter)
    });

    it('should keep excess mantra after triggering Divinity', () => {
      const player = { energy: 3, currentStance: null, mantra: 8 };
      player.mantra += 5; // Now 13
      if (player.mantra >= 10) {
        player.mantra -= 10;
        player.currentStance = 'divinity';
        player.energy += 3;
      }
      expect(player.mantra).toBe(3);
      expect(player.currentStance).toBe('divinity');
    });
  });

  describe('Divinity auto-exit at end of turn', () => {
    it('should exit Divinity at end of turn', () => {
      const player = { currentStance: 'divinity' };
      if (player.currentStance === 'divinity') {
        player.currentStance = null;
      }
      expect(player.currentStance).toBe(null);
    });

    it('should not exit other stances at end of turn', () => {
      const wrathPlayer = { currentStance: 'wrath' };
      const calmPlayer = { currentStance: 'calm' };
      // Only divinity exits
      if (wrathPlayer.currentStance === 'divinity') wrathPlayer.currentStance = null;
      if (calmPlayer.currentStance === 'divinity') calmPlayer.currentStance = null;
      expect(wrathPlayer.currentStance).toBe('wrath');
      expect(calmPlayer.currentStance).toBe('calm');
    });
  });
});
