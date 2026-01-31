import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SeededRNG, dateSeed, createRNG } from '../utils/seededRandom';
import {
  getDailyChallenge,
  getModifierDetails,
  applyDailyChallengeModifiers,
  getDailyChallengeModifiers,
  calculateChallengeScore,
  saveChallengeScore,
  loadChallengeScores,
  getChallengeScore,
  DAILY_MODIFIERS
} from '../systems/dailyChallengeSystem';

// ── SeededRNG Tests ────────────────────────────────────────────────

describe('SeededRNG', () => {
  it('produces deterministic sequence from same seed', () => {
    const rng1 = new SeededRNG(42);
    const rng2 = new SeededRNG(42);
    const seq1 = Array.from({ length: 10 }, () => rng1.next());
    const seq2 = Array.from({ length: 10 }, () => rng2.next());
    expect(seq1).toEqual(seq2);
  });

  it('produces different sequences from different seeds', () => {
    const rng1 = new SeededRNG(42);
    const rng2 = new SeededRNG(99);
    const seq1 = Array.from({ length: 5 }, () => rng1.next());
    const seq2 = Array.from({ length: 5 }, () => rng2.next());
    expect(seq1).not.toEqual(seq2);
  });

  it('next() returns values in [0, 1)', () => {
    const rng = new SeededRNG(123);
    for (let i = 0; i < 1000; i++) {
      const v = rng.next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('nextInt returns values in [min, max] inclusive', () => {
    const rng = new SeededRNG(7);
    const seen = new Set();
    for (let i = 0; i < 200; i++) {
      const v = rng.nextInt(1, 3);
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(3);
      seen.add(v);
    }
    expect(seen.size).toBe(3);
  });

  it('pick selects from array deterministically', () => {
    const rng1 = new SeededRNG(50);
    const rng2 = new SeededRNG(50);
    const arr = ['a', 'b', 'c', 'd', 'e'];
    const picks1 = Array.from({ length: 5 }, () => rng1.pick(arr));
    const picks2 = Array.from({ length: 5 }, () => rng2.pick(arr));
    expect(picks1).toEqual(picks2);
  });

  it('pick returns undefined for empty array', () => {
    const rng = new SeededRNG(1);
    expect(rng.pick([])).toBeUndefined();
  });

  it('shuffle is deterministic', () => {
    const rng1 = new SeededRNG(10);
    const rng2 = new SeededRNG(10);
    const a1 = [1, 2, 3, 4, 5];
    const a2 = [1, 2, 3, 4, 5];
    rng1.shuffle(a1);
    rng2.shuffle(a2);
    expect(a1).toEqual(a2);
  });
});

describe('dateSeed', () => {
  it('same date produces same seed', () => {
    expect(dateSeed('2026-01-31')).toBe(dateSeed('2026-01-31'));
  });

  it('different dates produce different seeds', () => {
    expect(dateSeed('2026-01-31')).not.toBe(dateSeed('2026-02-01'));
  });
});

// ── Daily Challenge Generation ─────────────────────────────────────

describe('getDailyChallenge', () => {
  it('returns consistent challenge for same date', () => {
    const c1 = getDailyChallenge('2026-01-31');
    const c2 = getDailyChallenge('2026-01-31');
    expect(c1).toEqual(c2);
  });

  it('returns different challenge for different dates', () => {
    const c1 = getDailyChallenge('2026-01-31');
    const c2 = getDailyChallenge('2026-02-01');
    expect(c1.seed).not.toBe(c2.seed);
  });

  it('returns 2-3 modifiers', () => {
    const c = getDailyChallenge('2026-06-15');
    expect(c.modifierIds.length).toBeGreaterThanOrEqual(2);
    expect(c.modifierIds.length).toBeLessThanOrEqual(3);
  });

  it('modifiers are all valid IDs', () => {
    const c = getDailyChallenge('2026-03-20');
    for (const id of c.modifierIds) {
      expect(DAILY_MODIFIERS[id]).toBeDefined();
    }
  });

  it('includes seed and date in result', () => {
    const c = getDailyChallenge('2026-01-31');
    expect(c.seed).toEqual(expect.any(Number));
    expect(c.date).toBe('2026-01-31');
  });
});

// ── Modifier Application ───────────────────────────────────────────

describe('applyDailyChallengeModifiers', () => {
  const baseState = {
    player: { maxHp: 80, currentHp: 80, maxEnergy: 3, energy: 3, gold: 99 },
    deck: [],
    relics: []
  };

  it('less_energy reduces max energy by 1', () => {
    const result = applyDailyChallengeModifiers(baseState, ['less_energy']);
    expect(result.player.maxEnergy).toBe(2);
    expect(result.player.energy).toBe(2);
  });

  it('fragile reduces max HP by 20%', () => {
    const result = applyDailyChallengeModifiers(baseState, ['fragile']);
    expect(result.player.maxHp).toBe(64);
    expect(result.player.currentHp).toBe(64);
  });

  it('does not modify state for modifier-only mods', () => {
    const result = applyDailyChallengeModifiers(baseState, ['enemy_hp_up']);
    expect(result.player).toEqual(baseState.player);
  });

  it('applies multiple modifiers', () => {
    const result = applyDailyChallengeModifiers(baseState, ['less_energy', 'fragile']);
    expect(result.player.maxEnergy).toBe(2);
    expect(result.player.maxHp).toBe(64);
  });

  it('energy never goes below 1', () => {
    const lowEnergy = { ...baseState, player: { ...baseState.player, maxEnergy: 1, energy: 1 } };
    const result = applyDailyChallengeModifiers(lowEnergy, ['less_energy']);
    expect(result.player.maxEnergy).toBe(1);
  });
});

describe('getDailyChallengeModifiers', () => {
  it('returns enemy HP multiplier for enemy_hp_up', () => {
    const mods = getDailyChallengeModifiers(['enemy_hp_up']);
    expect(mods.enemyHpMultiplier).toBe(1.25);
  });

  it('returns gold multiplier for double_gold', () => {
    const mods = getDailyChallengeModifiers(['double_gold']);
    expect(mods.goldMultiplier).toBe(2);
  });

  it('merges multiple modifier flags', () => {
    const mods = getDailyChallengeModifiers(['enemy_hp_up', 'elite_hunter']);
    expect(mods.enemyHpMultiplier).toBe(1.25);
    expect(mods.eliteHpMultiplier).toBe(1.5);
  });

  it('returns empty object for no modifiers', () => {
    expect(getDailyChallengeModifiers([])).toEqual({});
  });
});

// ── Score Calculation ──────────────────────────────────────────────

describe('calculateChallengeScore', () => {
  const baseStats = { floor: 10, enemiesKilled: 20, damageDealt: 500, goldEarned: 100 };
  const basePlayer = { currentHp: 50, gold: 80 };

  it('calculates base score correctly', () => {
    const score = calculateChallengeScore(baseStats, basePlayer, []);
    // (10*10) + (20*5) + 50 + 80 + floor(500/10) = 100 + 100 + 50 + 80 + 50 = 380
    expect(score).toBe(380);
  });

  it('applies modifier score multiplier', () => {
    const score = calculateChallengeScore(baseStats, basePlayer, ['enemy_hp_up']);
    // 380 * 1.3 = 494
    expect(score).toBe(494);
  });

  it('compounds multiple multipliers', () => {
    const score = calculateChallengeScore(baseStats, basePlayer, ['enemy_hp_up', 'less_energy']);
    // 380 * 1.3 * 1.5 = 741
    expect(score).toBe(741);
  });

  it('handles zero stats', () => {
    const empty = { floor: 0, enemiesKilled: 0, damageDealt: 0, goldEarned: 0 };
    const deadPlayer = { currentHp: 0, gold: 0 };
    expect(calculateChallengeScore(empty, deadPlayer, [])).toBe(0);
  });
});

// ── LocalStorage Persistence ───────────────────────────────────────

describe('challenge score persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves and loads a score', () => {
    saveChallengeScore('2026-01-31', 500);
    expect(getChallengeScore('2026-01-31')).toBe(500);
  });

  it('only keeps high score for same date', () => {
    saveChallengeScore('2026-01-31', 500);
    saveChallengeScore('2026-01-31', 300);
    expect(getChallengeScore('2026-01-31')).toBe(500);
    saveChallengeScore('2026-01-31', 700);
    expect(getChallengeScore('2026-01-31')).toBe(700);
  });

  it('returns null for unknown date', () => {
    expect(getChallengeScore('2099-12-31')).toBeNull();
  });

  it('loads all scores', () => {
    saveChallengeScore('2026-01-31', 500);
    saveChallengeScore('2026-02-01', 600);
    const scores = loadChallengeScores();
    expect(Object.keys(scores).length).toBe(2);
  });
});

// ── Modifier Details ───────────────────────────────────────────────

describe('getModifierDetails', () => {
  it('returns full modifier objects', () => {
    const details = getModifierDetails(['enemy_hp_up', 'fragile']);
    expect(details).toHaveLength(2);
    expect(details[0].name).toBe('Fortified Foes');
    expect(details[1].name).toBe('Fragile');
  });

  it('filters out invalid IDs', () => {
    const details = getModifierDetails(['enemy_hp_up', 'nonexistent']);
    expect(details).toHaveLength(1);
  });
});
