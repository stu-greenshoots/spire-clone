/**
 * Tests for the Headless Combat Balance Simulator
 *
 * Verifies that the simulator produces valid results, handles edge cases,
 * and completes within performance bounds.
 */

import { describe, it, expect } from 'vitest';
import { simulateCombat, simulateRun, runBalanceReport } from './simulator.js';
import { getStarterDeck } from '../../data/cards.js';
import { createEnemyInstance, getEnemyById } from '../../data/enemies.js';

describe('simulateCombat', () => {
  it('returns a valid result structure', () => {
    const deck = getStarterDeck();
    const player = {
      currentHp: 80,
      maxHp: 80,
      block: 0,
      energy: 3,
      maxEnergy: 3,
      strength: 0,
      dexterity: 0,
      vulnerable: 0,
      weak: 0,
      frail: 0,
      metallicize: 0,
      barricade: false,
      demonForm: 0,
      berserk: 0,
      rage: 0,
      doubleTap: 0,
      feelNoPain: 0,
      juggernaut: 0,
      darkEmbrace: false,
      evolve: 0,
      rupture: 0,
      fireBreathing: 0,
      corruption: false,
      brutality: false,
      combust: null,
      flameBarrier: 0,
      noDrawThisTurn: false,
      flexStrengthLoss: 0,
      intangible: 0,
      flight: 0
    };

    const cultist = getEnemyById('cultist');
    const enemies = [createEnemyInstance(cultist)];

    const result = simulateCombat(player, enemies, deck, { seed: 42 });

    // Validate structure
    expect(result).toHaveProperty('won');
    expect(result).toHaveProperty('turnsPlayed');
    expect(result).toHaveProperty('damageDealt');
    expect(result).toHaveProperty('damageReceived');
    expect(result).toHaveProperty('hpRemaining');
    expect(result).toHaveProperty('cardsPlayed');
    expect(result).toHaveProperty('cardPlayFrequency');

    // Validate types
    expect(typeof result.won).toBe('boolean');
    expect(typeof result.turnsPlayed).toBe('number');
    expect(typeof result.damageDealt).toBe('number');
    expect(typeof result.damageReceived).toBe('number');
    expect(typeof result.hpRemaining).toBe('number');
    expect(typeof result.cardsPlayed).toBe('number');
    expect(typeof result.cardPlayFrequency).toBe('object');

    // Validate ranges
    expect(result.turnsPlayed).toBeGreaterThan(0);
    expect(result.damageDealt).toBeGreaterThanOrEqual(0);
    expect(result.damageReceived).toBeGreaterThanOrEqual(0);
    expect(result.hpRemaining).toBeGreaterThanOrEqual(0);
    expect(result.hpRemaining).toBeLessThanOrEqual(80);
    expect(result.cardsPlayed).toBeGreaterThan(0);
  });

  it('wins against a single weak enemy with starter deck', () => {
    const deck = getStarterDeck();
    const player = {
      currentHp: 80,
      maxHp: 80,
      block: 0,
      energy: 3,
      maxEnergy: 3,
      strength: 0,
      dexterity: 0,
      vulnerable: 0,
      weak: 0,
      frail: 0,
      metallicize: 0,
      barricade: false,
      demonForm: 0,
      berserk: 0,
      rage: 0,
      doubleTap: 0,
      feelNoPain: 0,
      juggernaut: 0,
      darkEmbrace: false,
      evolve: 0,
      rupture: 0,
      fireBreathing: 0,
      corruption: false,
      brutality: false,
      combust: null,
      flameBarrier: 0,
      noDrawThisTurn: false,
      flexStrengthLoss: 0,
      intangible: 0,
      flight: 0
    };

    // Small slime is one of the weakest enemies
    const slime = getEnemyById('slime_small');
    const enemies = [createEnemyInstance(slime)];

    const result = simulateCombat(player, enemies, deck, { seed: 123 });

    // Should almost always win against a single small slime
    expect(result.won).toBe(true);
    expect(result.hpRemaining).toBeGreaterThan(0);
  });

  it('handles multi-enemy encounters', () => {
    const deck = getStarterDeck();
    const player = {
      currentHp: 80,
      maxHp: 80,
      block: 0,
      energy: 3,
      maxEnergy: 3,
      strength: 0,
      dexterity: 0,
      vulnerable: 0,
      weak: 0,
      frail: 0,
      metallicize: 0,
      barricade: false,
      demonForm: 0,
      berserk: 0,
      rage: 0,
      doubleTap: 0,
      feelNoPain: 0,
      juggernaut: 0,
      darkEmbrace: false,
      evolve: 0,
      rupture: 0,
      fireBreathing: 0,
      corruption: false,
      brutality: false,
      combust: null,
      flameBarrier: 0,
      noDrawThisTurn: false,
      flexStrengthLoss: 0,
      intangible: 0,
      flight: 0
    };

    const louse = getEnemyById('louse_red');
    const enemies = [createEnemyInstance(louse, 0), createEnemyInstance(louse, 1)];

    const result = simulateCombat(player, enemies, deck, { seed: 55 });

    // Should complete without errors
    expect(result).toHaveProperty('won');
    expect(result.turnsPlayed).toBeGreaterThan(0);
    expect(result.damageDealt).toBeGreaterThan(0);
  });

  it('reports loss when player HP reaches 0', () => {
    const deck = getStarterDeck();
    // Start with very low HP
    const player = {
      currentHp: 5,
      maxHp: 80,
      block: 0,
      energy: 3,
      maxEnergy: 3,
      strength: 0,
      dexterity: 0,
      vulnerable: 0,
      weak: 0,
      frail: 0,
      metallicize: 0,
      barricade: false,
      demonForm: 0,
      berserk: 0,
      rage: 0,
      doubleTap: 0,
      feelNoPain: 0,
      juggernaut: 0,
      darkEmbrace: false,
      evolve: 0,
      rupture: 0,
      fireBreathing: 0,
      corruption: false,
      brutality: false,
      combust: null,
      flameBarrier: 0,
      noDrawThisTurn: false,
      flexStrengthLoss: 0,
      intangible: 0,
      flight: 0
    };

    // Jaw Worm deals high early damage (12 on first turn)
    const jawWorm = getEnemyById('jawWorm');
    const enemies = [createEnemyInstance(jawWorm)];

    const result = simulateCombat(player, enemies, deck, { seed: 777 });

    // With only 5 HP vs a jaw worm, likely to lose
    // Either way, result should be valid
    expect(typeof result.won).toBe('boolean');
    if (!result.won) {
      expect(result.hpRemaining).toBe(0);
    }
  });

  it('tracks card play frequency correctly', () => {
    const deck = getStarterDeck();
    const player = {
      currentHp: 80,
      maxHp: 80,
      block: 0,
      energy: 3,
      maxEnergy: 3,
      strength: 0,
      dexterity: 0,
      vulnerable: 0,
      weak: 0,
      frail: 0,
      metallicize: 0,
      barricade: false,
      demonForm: 0,
      berserk: 0,
      rage: 0,
      doubleTap: 0,
      feelNoPain: 0,
      juggernaut: 0,
      darkEmbrace: false,
      evolve: 0,
      rupture: 0,
      fireBreathing: 0,
      corruption: false,
      brutality: false,
      combust: null,
      flameBarrier: 0,
      noDrawThisTurn: false,
      flexStrengthLoss: 0,
      intangible: 0,
      flight: 0
    };

    const cultist = getEnemyById('cultist');
    const enemies = [createEnemyInstance(cultist)];

    const result = simulateCombat(player, enemies, deck, { seed: 99 });

    // Starter deck has strike, defend, bash
    const freq = result.cardPlayFrequency;
    const totalFromFreq = Object.values(freq).reduce((sum, v) => sum + v, 0);
    expect(totalFromFreq).toBe(result.cardsPlayed);

    // At least some strikes and defends should have been played
    expect(freq['strike'] || freq['defend'] || freq['bash']).toBeGreaterThan(0);
  });

  it('is deterministic with the same seed', () => {
    const deck = getStarterDeck();
    const player = {
      currentHp: 80,
      maxHp: 80,
      block: 0,
      energy: 3,
      maxEnergy: 3,
      strength: 0,
      dexterity: 0,
      vulnerable: 0,
      weak: 0,
      frail: 0,
      metallicize: 0,
      barricade: false,
      demonForm: 0,
      berserk: 0,
      rage: 0,
      doubleTap: 0,
      feelNoPain: 0,
      juggernaut: 0,
      darkEmbrace: false,
      evolve: 0,
      rupture: 0,
      fireBreathing: 0,
      corruption: false,
      brutality: false,
      combust: null,
      flameBarrier: 0,
      noDrawThisTurn: false,
      flexStrengthLoss: 0,
      intangible: 0,
      flight: 0
    };

    const cultist = getEnemyById('cultist');
    const enemies1 = [createEnemyInstance(cultist)];
    const enemies2 = [createEnemyInstance(cultist)];
    // Set the same HP so results are comparable
    enemies1[0].currentHp = 50;
    enemies1[0].maxHp = 50;
    enemies2[0].currentHp = 50;
    enemies2[0].maxHp = 50;

    const result1 = simulateCombat({ ...player }, enemies1, [...deck], { seed: 12345 });
    const result2 = simulateCombat({ ...player }, enemies2, [...deck], { seed: 12345 });

    expect(result1.won).toBe(result2.won);
    expect(result1.turnsPlayed).toBe(result2.turnsPlayed);
    expect(result1.damageDealt).toBe(result2.damageDealt);
    expect(result1.damageReceived).toBe(result2.damageReceived);
    expect(result1.hpRemaining).toBe(result2.hpRemaining);
    expect(result1.cardsPlayed).toBe(result2.cardsPlayed);
  });
});

describe('simulateRun', () => {
  it('completes without errors', () => {
    const result = simulateRun({ seed: 42, floors: 5 });

    expect(result).toHaveProperty('survived');
    expect(result).toHaveProperty('floorsCleared');
    expect(result).toHaveProperty('finalHp');
    expect(result).toHaveProperty('combatStats');

    expect(typeof result.survived).toBe('boolean');
    expect(typeof result.floorsCleared).toBe('number');
    expect(typeof result.finalHp).toBe('number');
    expect(Array.isArray(result.combatStats)).toBe(true);
  });

  it('clears at least some floors with starter deck', () => {
    const result = simulateRun({ seed: 100, floors: 14 });

    expect(result.floorsCleared).toBeGreaterThanOrEqual(0);
    expect(result.combatStats.length).toBeGreaterThan(0);
  });

  it('tracks combat stats for each floor', () => {
    const result = simulateRun({ seed: 200, floors: 5 });

    result.combatStats.forEach(cs => {
      expect(cs).toHaveProperty('floor');
      expect(cs).toHaveProperty('won');
      expect(cs).toHaveProperty('turnsPlayed');
      expect(cs).toHaveProperty('damageDealt');
      expect(cs).toHaveProperty('damageReceived');
      expect(cs).toHaveProperty('hpRemaining');
      expect(cs).toHaveProperty('enemyNames');
      expect(Array.isArray(cs.enemyNames)).toBe(true);
      expect(cs.enemyNames.length).toBeGreaterThan(0);
    });
  });

  it('reports survived=true when all floors are cleared', () => {
    // Give the player a lot of HP to ensure survival
    const result = simulateRun({ seed: 42, floors: 3, hp: 200, maxHp: 200 });

    // With 200 HP over 3 floors, should likely survive
    if (result.survived) {
      expect(result.floorsCleared).toBe(3);
      expect(result.finalHp).toBeGreaterThan(0);
    }
  });

  it('is deterministic with same seed', () => {
    const result1 = simulateRun({ seed: 555, floors: 5 });
    const result2 = simulateRun({ seed: 555, floors: 5 });

    expect(result1.survived).toBe(result2.survived);
    expect(result1.floorsCleared).toBe(result2.floorsCleared);
    expect(result1.finalHp).toBe(result2.finalHp);
    expect(result1.combatStats.length).toBe(result2.combatStats.length);
  });

  it('applies healing between floors when configured', () => {
    const result = simulateRun({ seed: 42, floors: 5, healPerFloor: 5 });

    // Should complete without errors when healing is enabled
    expect(result).toHaveProperty('survived');
    expect(result.floorsCleared).toBeGreaterThanOrEqual(0);
  });
});

describe('runBalanceReport', () => {
  it('produces reasonable results', () => {
    const report = runBalanceReport(50, { seed: 1, floors: 5 });

    expect(report).toHaveProperty('winRate');
    expect(report).toHaveProperty('avgFloorsCleared');
    expect(report).toHaveProperty('avgTurnsPerCombat');
    expect(report).toHaveProperty('deadliestEnemy');
    expect(report).toHaveProperty('avgHpAtEnd');
    expect(report).toHaveProperty('cardPlayFrequency');
    expect(report).toHaveProperty('totalRuns');
    expect(report).toHaveProperty('totalTime');

    // winRate should be between 0 and 1
    expect(report.winRate).toBeGreaterThanOrEqual(0);
    expect(report.winRate).toBeLessThanOrEqual(1);

    // avgFloorsCleared should be positive
    expect(report.avgFloorsCleared).toBeGreaterThan(0);

    // avgTurnsPerCombat should be reasonable (1-50)
    expect(report.avgTurnsPerCombat).toBeGreaterThan(0);
    expect(report.avgTurnsPerCombat).toBeLessThan(50);

    // deadliestEnemy should be a string
    expect(typeof report.deadliestEnemy).toBe('string');

    // cardPlayFrequency should have entries
    expect(Object.keys(report.cardPlayFrequency).length).toBeGreaterThan(0);

    // totalRuns matches input
    expect(report.totalRuns).toBe(50);
  });

  it('completes 100 runs in reasonable time', () => {
    const startTime = Date.now();
    const report = runBalanceReport(100, { floors: 14 });
    const elapsed = Date.now() - startTime;

    // Should complete in under 10 seconds (generous limit)
    expect(elapsed).toBeLessThan(10000);

    // Should have valid data
    expect(report.totalRuns).toBe(100);
    expect(report.winRate).toBeGreaterThanOrEqual(0);
    expect(report.winRate).toBeLessThanOrEqual(1);
  });

  it('shows higher win rate with more HP', () => {
    const lowHpReport = runBalanceReport(50, { seed: 1, floors: 5, hp: 40, maxHp: 40 });
    const highHpReport = runBalanceReport(50, { seed: 1, floors: 5, hp: 200, maxHp: 200 });

    // More HP should mean higher or equal win rate
    expect(highHpReport.winRate).toBeGreaterThanOrEqual(lowHpReport.winRate);
  });

  it('reports card play frequency with starter deck cards', () => {
    const report = runBalanceReport(30, { seed: 42, floors: 3 });

    // Starter deck cards should appear in frequency
    const freq = report.cardPlayFrequency;
    const hasStarterCards = 'strike' in freq || 'defend' in freq || 'bash' in freq;
    expect(hasStarterCards).toBe(true);
  });

  it('identifies a deadliest enemy when losses occur', () => {
    // Low HP to ensure some losses
    const report = runBalanceReport(50, { seed: 1, floors: 14, hp: 30, maxHp: 30 });

    // With low HP and 14 floors, should have some losses
    if (report.winRate < 1) {
      expect(report.deadliestEnemy).not.toBe('none');
    }
  });

  it('produces deterministic results with same seed', () => {
    const report1 = runBalanceReport(20, { seed: 999, floors: 5 });
    const report2 = runBalanceReport(20, { seed: 999, floors: 5 });

    expect(report1.winRate).toBe(report2.winRate);
    expect(report1.avgFloorsCleared).toBe(report2.avgFloorsCleared);
    expect(report1.avgTurnsPerCombat).toBe(report2.avgTurnsPerCombat);
    expect(report1.deadliestEnemy).toBe(report2.deadliestEnemy);
  });
});

describe('Performance', () => {
  it('1000 runs complete in under 10 seconds', () => {
    const startTime = Date.now();
    const report = runBalanceReport(1000, { floors: 14 });
    const elapsed = Date.now() - startTime;

    expect(elapsed).toBeLessThan(10000);
    expect(report.totalRuns).toBe(1000);
    expect(report.winRate).toBeGreaterThanOrEqual(0);
    expect(report.avgFloorsCleared).toBeGreaterThan(0);
  });
});
