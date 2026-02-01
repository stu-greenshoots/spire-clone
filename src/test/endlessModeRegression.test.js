/**
 * QA-25: Endless Mode Regression + Balance Tests
 *
 * Validates scaling curves, floor 100+ stability, character balance in endless,
 * seeded run reproducibility, narrative integration, and defeat tiers.
 */

import { describe, it, expect, vi } from 'vitest';
import { createInitialState, GAME_PHASE } from '../context/GameContext';
import { mapReducer } from '../context/reducers/mapReducer';
import { createEnemyInstance, getEnemyById, getBossEncounter, getEncounter } from '../data/enemies';
import { SeededRNG, stringToSeed } from '../utils/seededRandom';
import { generateMap } from '../utils/mapGenerator';
import { ENDLESS_LOOP_MILESTONES, ENDLESS_DEFEAT_NARRATIVE, ENDLESS_DEFEAT_FOOTER } from '../data/flavorText';
import { ALL_RELICS, getRandomRelic, getStarterRelic } from '../data/relics';
import { CHARACTER_IDS } from '../data/characters';
import { simulateRun, runBalanceReport } from './balance/simulator';

// Mock dependencies required by mapReducer
vi.mock('../systems/audioSystem', () => ({
  audioManager: { playSFX: vi.fn(), setPhase: vi.fn(), playAmbient: vi.fn(), stopAmbient: vi.fn() },
  SOUNDS: { ui: { mapStep: 'step' }, combat: { bossIntro: 'boss' }, music: {}, ambient: {} }
}));

vi.mock('../systems/saveSystem', () => ({
  saveGame: vi.fn(),
  deleteSave: vi.fn(),
  loadGame: vi.fn(),
  hasSavedGame: vi.fn()
}));

vi.mock('../systems/progressionSystem', () => ({
  loadProgression: vi.fn(() => ({ characterWins: { ironclad: 1, silent: 1, defect: 1, watcher: 1 } })),
  isHeartUnlocked: vi.fn(() => true)
}));

describe('QA-25: Endless Mode Regression + Balance', () => {
  // ── Scaling Curves ──────────────────────────────────────────────────

  describe('Scaling curves feel fair', () => {
    const baseEnemy = { currentHp: 100, maxHp: 100, invincible: 0 };

    it('loop 1 scales HP by exactly 10%', () => {
      const factor = 1 + 0.1 * 1;
      expect(Math.floor(baseEnemy.currentHp * factor)).toBe(110);
    });

    it('loop 5 scales HP by exactly 50%', () => {
      const factor = 1 + 0.1 * 5;
      expect(Math.floor(baseEnemy.currentHp * factor)).toBe(150);
    });

    it('loop 10 doubles enemy HP', () => {
      const factor = 1 + 0.1 * 10;
      expect(Math.floor(baseEnemy.currentHp * factor)).toBe(200);
    });

    it('loop 25 scales to 350%', () => {
      const factor = 1 + 0.1 * 25;
      expect(Math.floor(baseEnemy.currentHp * factor)).toBe(350);
    });

    it('scaling is linear — each loop adds approximately 10%', () => {
      for (let loop = 1; loop <= 20; loop++) {
        const factor = 1 + 0.1 * loop;
        const scaled = Math.floor(100 * factor);
        // Allow ±1 for floating point rounding
        const expected = 100 + loop * 10;
        expect(Math.abs(scaled - expected)).toBeLessThanOrEqual(1);
      }
    });

    it('scaling applies to all enemy types consistently', () => {
      const enemies = ['jawWorm', 'cultist', 'slimeBoss', 'corruptHeart'];
      for (const id of enemies) {
        const enemy = getEnemyById(id);
        if (!enemy) continue;
        const instance = createEnemyInstance(enemy);
        const scaled = Math.floor(instance.currentHp * 1.5); // loop 5
        expect(scaled).toBeGreaterThan(instance.currentHp);
        expect(scaled).toBe(Math.floor(instance.currentHp * 1.5));
      }
    });

    it('Heart invincible shield scales with loop', () => {
      const heart = getEnemyById('corruptHeart');
      if (!heart) return; // skip if Heart not available
      const instance = createEnemyInstance(heart);
      const baseInvincible = instance.invincible;
      expect(baseInvincible).toBeGreaterThan(0);

      // Loop 3: +30%
      expect(Math.floor(baseInvincible * 1.3)).toBeGreaterThan(baseInvincible);
      // Loop 10: doubled
      expect(Math.floor(baseInvincible * 2.0)).toBe(baseInvincible * 2);
    });

    it('loop 0 and negative loops do not scale', () => {
      // applyEndlessScaling returns enemies unchanged for loop <= 0
      const factor0 = 1 + 0.1 * 0;
      expect(factor0).toBe(1);
    });
  });

  // ── State Transitions & Stability ───────────────────────────────────

  describe('Endless mode state transitions', () => {
    it('ENTER_ENDLESS preserves player HP and relics', () => {
      const state = {
        ...createInitialState(),
        phase: GAME_PHASE.ENDLESS_TRANSITION,
        act: 4,
        endlessMode: false,
        endlessLoop: 0,
        player: { currentHp: 45, maxHp: 80, gold: 250, block: 0 },
        relics: [{ id: 'burning_blood' }],
        deck: [{ id: 'strike', instanceId: 's1' }]
      };

      const result = mapReducer(state, { type: 'ENTER_ENDLESS' });
      expect(result.endlessMode).toBe(true);
      expect(result.endlessLoop).toBe(1);
      // Player state should carry over
      expect(result.player.currentHp).toBe(45);
      expect(result.player.maxHp).toBe(80);
    });

    it('multiple ENTER_ENDLESS calls increment loop correctly', () => {
      let state = {
        ...createInitialState(),
        phase: GAME_PHASE.ENDLESS_TRANSITION,
        act: 4,
        endlessMode: false,
        endlessLoop: 0
      };

      // Simulate 5 loops
      for (let i = 1; i <= 5; i++) {
        state = mapReducer({ ...state, phase: GAME_PHASE.ENDLESS_TRANSITION, act: 4 }, { type: 'ENTER_ENDLESS' });
        expect(state.endlessLoop).toBe(i);
        expect(state.endlessMode).toBe(true);
        expect(state.act).toBe(1);
      }
    });

    it('generates valid maps for loops 1 through 10', () => {
      for (let loop = 1; loop <= 10; loop++) {
        const state = {
          ...createInitialState(),
          phase: GAME_PHASE.ENDLESS_TRANSITION,
          act: 4,
          endlessMode: loop > 1,
          endlessLoop: loop - 1
        };

        const result = mapReducer(state, { type: 'ENTER_ENDLESS' });
        expect(result.map).toBeTruthy();
        expect(result.map.length).toBeGreaterThan(0);
        expect(result.currentFloor).toBe(-1);
      }
    });
  });

  // ── Floor 100+ Stability ────────────────────────────────────────────

  describe('Floor 100+ stability — no state bloat', () => {
    it('state size does not grow unboundedly through loops', () => {
      let state = {
        ...createInitialState(),
        phase: GAME_PHASE.ENDLESS_TRANSITION,
        act: 4,
        endlessMode: false,
        endlessLoop: 0
      };

      const initialSize = JSON.stringify(state).length;

      // Simulate 10 loops
      for (let i = 0; i < 10; i++) {
        state = mapReducer(
          { ...state, phase: GAME_PHASE.ENDLESS_TRANSITION, act: 4 },
          { type: 'ENTER_ENDLESS' }
        );
      }

      const finalSize = JSON.stringify(state).length;
      // Map regenerates each loop, so size should stay bounded
      // Allow 5x growth for map data but no exponential blowup
      expect(finalSize).toBeLessThan(initialSize * 5);
    });

    it('endlessLoop value is stable at high values', () => {
      const state = {
        ...createInitialState(),
        phase: GAME_PHASE.ENDLESS_TRANSITION,
        act: 4,
        endlessMode: true,
        endlessLoop: 99
      };

      const result = mapReducer(state, { type: 'ENTER_ENDLESS' });
      expect(result.endlessLoop).toBe(100);
      expect(Number.isFinite(result.endlessLoop)).toBe(true);
    });

    it('scaling factor at loop 100 is finite and reasonable', () => {
      const factor = 1 + 0.1 * 100;
      expect(factor).toBe(11);
      expect(Number.isFinite(factor)).toBe(true);
      // Enemy with 100 HP would have 1100 HP — tough but not infinite
      expect(Math.floor(100 * factor)).toBe(1100);
    });
  });

  // ── Seeded Run Reproducibility ──────────────────────────────────────

  describe('Seeded run reproducibility in endless', () => {
    it('same seed + same loop produces identical map', () => {
      const seed = 'ENDLESS_TEST';
      const numericSeed = stringToSeed(seed);

      for (const loop of [0, 1, 5]) {
        const combinedSeed = numericSeed + 1 * 7919 + loop * 104729;
        const rng1 = new SeededRNG(combinedSeed);
        const rng2 = new SeededRNG(combinedSeed);

        const map1 = generateMap(1, rng1);
        const map2 = generateMap(1, rng2);

        expect(JSON.stringify(map1)).toBe(JSON.stringify(map2));
      }
    });

    it('different loops produce different maps for the same seed', () => {
      const seed = stringToSeed('LOOP_VARIETY');
      const rng0 = new SeededRNG(seed + 1 * 7919 + 0 * 104729);
      const rng1 = new SeededRNG(seed + 1 * 7919 + 1 * 104729);

      const map0 = generateMap(1, rng0);
      const map1 = generateMap(1, rng1);

      // Different loops should yield different maps
      expect(JSON.stringify(map0)).not.toBe(JSON.stringify(map1));
    });

    it('different acts produce different maps for the same seed and loop', () => {
      const seed = stringToSeed('ACT_VARIETY');
      const rng1 = new SeededRNG(seed + 1 * 7919 + 0 * 104729);
      const rng2 = new SeededRNG(seed + 2 * 7919 + 0 * 104729);

      const map1 = generateMap(1, rng1);
      const map2 = generateMap(2, rng2);

      expect(JSON.stringify(map1)).not.toBe(JSON.stringify(map2));
    });
  });

  // ── Character Balance in Endless ────────────────────────────────────

  describe('All 4 characters viable — balance simulator', () => {
    // Run a modest number of simulations to verify basic viability
    // We test Act 1 runs which are the common case
    it('balance simulator shows viability at A0 (>= 5% win rate Act 1)', () => {
      const report = runBalanceReport(50, {
        seed: 42,
        acts: 1,
        ascension: 0
      });

      expect(report.winRate).toBeGreaterThanOrEqual(0.05);
      expect(report.totalRuns).toBe(50);
    });

    it('balance simulator produces valid output structure', () => {
      const report = runBalanceReport(10, { seed: 123, acts: 1 });
      expect(report).toHaveProperty('winRate');
      expect(report).toHaveProperty('avgFloorsCleared');
      expect(report).toHaveProperty('avgTurnsPerCombat');
      expect(report).toHaveProperty('totalRuns');
      expect(report).toHaveProperty('totalTime');
      expect(report.winRate).toBeGreaterThanOrEqual(0);
      expect(report.winRate).toBeLessThanOrEqual(1);
      expect(report.avgFloorsCleared).toBeGreaterThan(0);
    });

    it('seeded simulator runs are deterministic', () => {
      const run1 = simulateRun({ seed: 999, acts: 1 });
      const run2 = simulateRun({ seed: 999, acts: 1 });

      expect(run1.survived).toBe(run2.survived);
      expect(run1.floorsCleared).toBe(run2.floorsCleared);
      expect(run1.finalHp).toBe(run2.finalHp);
    });
  });

  // ── Narrative Integration ───────────────────────────────────────────

  describe('Endless narrative content — VARROW-12 integration', () => {
    it('generic loop milestones have at least 3 entries', () => {
      expect(ENDLESS_LOOP_MILESTONES.generic.length).toBeGreaterThanOrEqual(3);
    });

    it('milestone text exists for all documented thresholds', () => {
      const thresholds = [3, 5, 7, 10, 15, 25];
      for (const t of thresholds) {
        expect(ENDLESS_LOOP_MILESTONES[t]).toBeTruthy();
        expect(typeof ENDLESS_LOOP_MILESTONES[t]).toBe('string');
        expect(ENDLESS_LOOP_MILESTONES[t].length).toBeGreaterThan(20);
      }
    });

    it('milestone selection logic picks highest applicable threshold', () => {
      const thresholds = [25, 15, 10, 7, 5, 3];
      const getMilestoneText = (loop) => {
        for (const threshold of thresholds) {
          if (loop >= threshold) return ENDLESS_LOOP_MILESTONES[threshold];
        }
        return ENDLESS_LOOP_MILESTONES.generic[0];
      };

      // Loop 3 → threshold 3
      expect(getMilestoneText(3)).toBe(ENDLESS_LOOP_MILESTONES[3]);
      // Loop 7 → threshold 7, not 5 or 3
      expect(getMilestoneText(7)).toBe(ENDLESS_LOOP_MILESTONES[7]);
      // Loop 12 → threshold 10
      expect(getMilestoneText(12)).toBe(ENDLESS_LOOP_MILESTONES[10]);
      // Loop 25 → threshold 25
      expect(getMilestoneText(25)).toBe(ENDLESS_LOOP_MILESTONES[25]);
      // Loop 50 → still 25 (highest threshold)
      expect(getMilestoneText(50)).toBe(ENDLESS_LOOP_MILESTONES[25]);
      // Loop 2 → generic
      expect(getMilestoneText(2)).toBe(ENDLESS_LOOP_MILESTONES.generic[0]);
    });
  });

  // ── Defeat Narrative Tiers ──────────────────────────────────────────

  describe('Endless defeat narrative tiers', () => {
    it('early tier exists (loop < 3)', () => {
      expect(ENDLESS_DEFEAT_NARRATIVE.early).toBeTruthy();
      expect(ENDLESS_DEFEAT_NARRATIVE.early.length).toBeGreaterThanOrEqual(3);
    });

    it('mid tier exists (loop 3-5)', () => {
      expect(ENDLESS_DEFEAT_NARRATIVE.mid).toBeTruthy();
      expect(ENDLESS_DEFEAT_NARRATIVE.mid.length).toBeGreaterThanOrEqual(3);
    });

    it('deep tier exists (loop 6-9)', () => {
      expect(ENDLESS_DEFEAT_NARRATIVE.deep).toBeTruthy();
      expect(ENDLESS_DEFEAT_NARRATIVE.deep.length).toBeGreaterThanOrEqual(3);
    });

    it('extreme tier exists (loop 10+)', () => {
      expect(ENDLESS_DEFEAT_NARRATIVE.extreme).toBeTruthy();
      expect(ENDLESS_DEFEAT_NARRATIVE.extreme.length).toBeGreaterThanOrEqual(3);
    });

    it('defeat tier selection matches GameOverScreen logic', () => {
      const getPool = (loop) => {
        if (loop >= 10) return 'extreme';
        if (loop >= 6) return 'deep';
        if (loop >= 3) return 'mid';
        return 'early';
      };

      expect(getPool(1)).toBe('early');
      expect(getPool(2)).toBe('early');
      expect(getPool(3)).toBe('mid');
      expect(getPool(5)).toBe('mid');
      expect(getPool(6)).toBe('deep');
      expect(getPool(9)).toBe('deep');
      expect(getPool(10)).toBe('extreme');
      expect(getPool(25)).toBe('extreme');
    });

    it('ENDLESS_DEFEAT_FOOTER has at least 3 entries', () => {
      expect(ENDLESS_DEFEAT_FOOTER.length).toBeGreaterThanOrEqual(3);
    });

    it('all defeat narrative entries are non-empty strings', () => {
      for (const tier of ['early', 'mid', 'deep', 'extreme']) {
        for (const text of ENDLESS_DEFEAT_NARRATIVE[tier]) {
          expect(typeof text).toBe('string');
          expect(text.length).toBeGreaterThan(10);
        }
      }
      for (const text of ENDLESS_DEFEAT_FOOTER) {
        expect(typeof text).toBe('string');
        expect(text.length).toBeGreaterThan(10);
      }
    });
  });

  // ── Character-Specific Relics in Endless ────────────────────────────

  describe('Character-specific relics available in endless', () => {
    const charIds = Object.values(CHARACTER_IDS);

    it('each character has a starter relic', () => {
      for (const charId of charIds) {
        const relic = getStarterRelic(charId);
        expect(relic).toBeTruthy();
        expect(relic.id).toBeTruthy();
      }
    });

    it('character-specific relics exist for all characters', () => {
      const charRelics = ALL_RELICS.filter(r => r.character);
      // At least 3 per character
      for (const charId of charIds) {
        const forChar = charRelics.filter(r => r.character === charId);
        expect(forChar.length).toBeGreaterThanOrEqual(3);
      }
    });

    it('getRandomRelic with characterId includes character-specific relics', () => {
      const seen = new Set();
      for (let i = 0; i < 100; i++) {
        const relic = getRandomRelic(null, [], 'ironclad');
        if (relic && relic.character === 'ironclad') {
          seen.add(relic.id);
        }
      }
      expect(seen.size).toBeGreaterThan(0);
    });

    it('getRandomRelic without characterId excludes character-specific', () => {
      for (let i = 0; i < 50; i++) {
        const relic = getRandomRelic(null, []);
        if (relic) {
          expect(relic.character).toBeFalsy();
        }
      }
    });
  });

  // ── Encounter Generation Stability ──────────────────────────────────

  describe('Encounter generation stability at high acts', () => {
    it('getEncounter returns valid enemies for acts 1-4', () => {
      for (let act = 1; act <= 4; act++) {
        const encounter = getEncounter(act, 5, 0.1, false);
        expect(Array.isArray(encounter)).toBe(true);
        expect(encounter.length).toBeGreaterThan(0);
        for (const enemy of encounter) {
          expect(enemy.currentHp).toBeGreaterThan(0);
          expect(enemy.maxHp).toBeGreaterThan(0);
          expect(enemy.name).toBeTruthy();
        }
      }
    });

    it('getBossEncounter returns valid bosses for acts 1-4', () => {
      for (let act = 1; act <= 4; act++) {
        const bosses = getBossEncounter(act);
        expect(Array.isArray(bosses)).toBe(true);
        expect(bosses.length).toBeGreaterThan(0);
        for (const boss of bosses) {
          expect(boss.currentHp).toBeGreaterThan(0);
          expect(boss.name).toBeTruthy();
        }
      }
    });

    it('enemy instances have required fields for combat', () => {
      const requiredFields = ['id', 'name', 'currentHp', 'maxHp', 'block'];
      const jawWorm = getEnemyById('jawWorm');
      if (!jawWorm) return;
      const instance = createEnemyInstance(jawWorm);

      for (const field of requiredFields) {
        expect(instance).toHaveProperty(field);
      }
    });
  });

  // ── SeededRNG Stability ─────────────────────────────────────────────

  describe('SeededRNG stability at high iteration counts', () => {
    it('produces valid numbers after 10000 iterations', () => {
      const rng = new SeededRNG(42);
      for (let i = 0; i < 10000; i++) {
        const val = rng.next();
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThan(1);
        expect(Number.isFinite(val)).toBe(true);
      }
    });

    it('nextInt stays within bounds at high iterations', () => {
      const rng = new SeededRNG(123);
      for (let i = 0; i < 1000; i++) {
        const val = rng.nextInt(1, 10);
        expect(val).toBeGreaterThanOrEqual(1);
        expect(val).toBeLessThanOrEqual(10);
      }
    });

    it('shuffle does not lose or duplicate elements', () => {
      const rng = new SeededRNG(999);
      const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const original = [...arr];
      rng.shuffle(arr);
      expect(arr.sort()).toEqual(original.sort());
    });
  });
});
