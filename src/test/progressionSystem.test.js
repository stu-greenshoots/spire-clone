/**
 * Tests for the Meta-Progression System
 *
 * Tests loadProgression, saveProgression, updateRunStats, achievements, and unlock milestones.
 * Part of QA-05 Sprint 5 test coverage.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  loadProgression,
  saveProgression,
  updateRunStats,
  getAchievements,
  getUnlockMilestones,
  ACHIEVEMENTS,
  UNLOCK_MILESTONES
} from '../systems/progressionSystem.js';

// Mock localStorage
const localStorageMock = {
  store: {},
  getItem: vi.fn((key) => localStorageMock.store[key] || null),
  setItem: vi.fn((key, value) => { localStorageMock.store[key] = value; }),
  removeItem: vi.fn((key) => { delete localStorageMock.store[key]; }),
  clear: vi.fn(() => { localStorageMock.store = {}; })
};

describe('progressionSystem', () => {
  beforeEach(() => {
    // Reset localStorage mock before each test
    localStorageMock.store = {};
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    vi.stubGlobal('localStorage', localStorageMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('loadProgression', () => {
    it('returns default progression when no saved data exists', () => {
      const progression = loadProgression();

      expect(progression.totalRuns).toBe(0);
      expect(progression.wins).toBe(0);
      expect(progression.losses).toBe(0);
      expect(progression.highestFloor).toBe(0);
      expect(progression.highestAscension).toBe(0);
      expect(progression.totalEnemiesKilled).toBe(0);
      expect(progression.totalGoldEarned).toBe(0);
      expect(progression.totalDamageDealt).toBe(0);
      expect(progression.totalCardsPlayed).toBe(0);
      expect(progression.achievements).toEqual([]);
      expect(progression.unlockedCards).toEqual([]);
      expect(progression.unlockedRelics).toEqual([]);
      expect(progression.runHistory).toEqual([]);
    });

    it('loads and merges saved progression data', () => {
      const savedData = {
        totalRuns: 5,
        wins: 2,
        losses: 3,
        highestFloor: 15,
        achievements: ['first_blood']
      };
      localStorageMock.store['spireAscent_progression'] = JSON.stringify(savedData);

      const progression = loadProgression();

      expect(progression.totalRuns).toBe(5);
      expect(progression.wins).toBe(2);
      expect(progression.losses).toBe(3);
      expect(progression.highestFloor).toBe(15);
      expect(progression.achievements).toEqual(['first_blood']);
      // Default values should still be present for missing fields
      expect(progression.totalEnemiesKilled).toBe(0);
      expect(progression.cardsPlayedById).toEqual({});
    });

    it('handles corrupted localStorage data gracefully', () => {
      localStorageMock.store['spireAscent_progression'] = 'not valid json {{{';

      const progression = loadProgression();

      // Should return default progression without crashing
      expect(progression.totalRuns).toBe(0);
      expect(progression.wins).toBe(0);
    });

    it('handles localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const progression = loadProgression();

      expect(progression.totalRuns).toBe(0);
    });
  });

  describe('saveProgression', () => {
    it('saves progression to localStorage', () => {
      const progression = {
        totalRuns: 10,
        wins: 5,
        losses: 5,
        achievements: ['first_blood', 'centurion']
      };

      saveProgression(progression);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'spireAscent_progression',
        JSON.stringify(progression)
      );
    });

    it('handles localStorage errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      // Should not throw
      expect(() => {
        saveProgression({ totalRuns: 1 });
      }).not.toThrow();
    });
  });

  describe('updateRunStats', () => {
    it('increments totalRuns on each update', () => {
      const progression = loadProgression();
      const runData = { won: false, floor: 5 };

      const updated = updateRunStats(progression, runData);

      expect(updated.totalRuns).toBe(1);
    });

    it('increments wins counter on victory', () => {
      const progression = loadProgression();
      const runData = { won: true, floor: 50 };

      const updated = updateRunStats(progression, runData);

      expect(updated.wins).toBe(1);
      expect(updated.losses).toBe(0);
    });

    it('increments losses counter on defeat', () => {
      const progression = loadProgression();
      const runData = { won: false, floor: 10 };

      const updated = updateRunStats(progression, runData);

      expect(updated.wins).toBe(0);
      expect(updated.losses).toBe(1);
    });

    it('updates highestFloor when new record is set', () => {
      const progression = loadProgression();
      progression.highestFloor = 5;
      const runData = { won: false, floor: 12 };

      const updated = updateRunStats(progression, runData);

      expect(updated.highestFloor).toBe(12);
    });

    it('does not decrease highestFloor', () => {
      const progression = loadProgression();
      progression.highestFloor = 15;
      const runData = { won: false, floor: 5 };

      const updated = updateRunStats(progression, runData);

      expect(updated.highestFloor).toBe(15);
    });

    it('accumulates enemy kill count', () => {
      const progression = loadProgression();
      progression.totalEnemiesKilled = 10;
      const runData = { won: true, floor: 20, enemiesKilled: 25 };

      const updated = updateRunStats(progression, runData);

      expect(updated.totalEnemiesKilled).toBe(35);
    });

    it('accumulates gold earned', () => {
      const progression = loadProgression();
      progression.totalGoldEarned = 100;
      const runData = { won: true, floor: 20, goldEarned: 150 };

      const updated = updateRunStats(progression, runData);

      expect(updated.totalGoldEarned).toBe(250);
    });

    it('accumulates damage dealt', () => {
      const progression = loadProgression();
      progression.totalDamageDealt = 500;
      const runData = { won: true, floor: 20, damageDealt: 300 };

      const updated = updateRunStats(progression, runData);

      expect(updated.totalDamageDealt).toBe(800);
    });

    it('accumulates cards played count', () => {
      const progression = loadProgression();
      progression.totalCardsPlayed = 100;
      const runData = { won: true, floor: 20, cardsPlayed: 75 };

      const updated = updateRunStats(progression, runData);

      expect(updated.totalCardsPlayed).toBe(175);
    });

    it('tracks defeated enemies by ID', () => {
      const progression = loadProgression();
      const runData = {
        won: true,
        floor: 20,
        defeatedEnemies: ['cultist', 'jawWorm', 'cultist']
      };

      const updated = updateRunStats(progression, runData);

      expect(updated.enemiesDefeated.cultist).toBe(2);
      expect(updated.enemiesDefeated.jawWorm).toBe(1);
    });

    it('tracks collected relics', () => {
      const progression = loadProgression();
      const runData = {
        won: true,
        floor: 20,
        relics: [
          { id: 'burning_blood' },
          { id: 'vajra' }
        ]
      };

      const updated = updateRunStats(progression, runData);

      expect(updated.relicsCollected.burning_blood).toBe(true);
      expect(updated.relicsCollected.vajra).toBe(true);
    });

    it('adds run to history (most recent first)', () => {
      const progression = loadProgression();
      const runData = {
        won: true,
        floor: 50,
        deckSize: 25,
        relics: [{ id: 'burning_blood' }],
        ascension: 3
      };

      const updated = updateRunStats(progression, runData);

      expect(updated.runHistory.length).toBe(1);
      expect(updated.runHistory[0].won).toBe(true);
      expect(updated.runHistory[0].floor).toBe(50);
      expect(updated.runHistory[0].deckSize).toBe(25);
      expect(updated.runHistory[0].relicCount).toBe(1);
      expect(updated.runHistory[0].ascension).toBe(3);
      expect(updated.runHistory[0].date).toBeDefined();
    });

    it('limits run history to 10 entries', () => {
      const progression = loadProgression();
      progression.runHistory = Array(10).fill({
        date: '2025-01-01',
        won: false,
        floor: 1
      });
      const runData = { won: true, floor: 50 };

      const updated = updateRunStats(progression, runData);

      expect(updated.runHistory.length).toBe(10);
      expect(updated.runHistory[0].won).toBe(true); // Most recent first
    });

    it('records cause of death on defeat', () => {
      const progression = loadProgression();
      const runData = {
        won: false,
        floor: 10,
        causeOfDeath: 'Slime Boss'
      };

      const updated = updateRunStats(progression, runData);

      expect(updated.runHistory[0].causeOfDeath).toBe('Slime Boss');
    });

    it('saves progression automatically after update', () => {
      const progression = loadProgression();
      const runData = { won: true, floor: 20 };

      updateRunStats(progression, runData);

      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  describe('Achievement triggers', () => {
    it('unlocks First Blood on first win', () => {
      const progression = loadProgression();
      const runData = { won: true, floor: 50 };

      const updated = updateRunStats(progression, runData);

      expect(updated.achievements).toContain('first_blood');
    });

    it('unlocks Centurion at 100 enemies killed', () => {
      const progression = loadProgression();
      progression.totalEnemiesKilled = 99;
      const runData = { won: false, floor: 10, enemiesKilled: 1 };

      const updated = updateRunStats(progression, runData);

      expect(updated.achievements).toContain('centurion');
    });

    it('unlocks Card Master at 500 cards played', () => {
      const progression = loadProgression();
      progression.totalCardsPlayed = 490;
      const runData = { won: false, floor: 10, cardsPlayed: 15 };

      const updated = updateRunStats(progression, runData);

      expect(updated.achievements).toContain('card_master');
    });

    it('unlocks Collector at 20 different relics', () => {
      const progression = loadProgression();
      // Collect 19 relics across previous runs
      for (let i = 0; i < 19; i++) {
        progression.relicsCollected[`relic_${i}`] = true;
      }
      const runData = {
        won: true,
        floor: 50,
        relics: [{ id: 'relic_new' }]
      };

      const updated = updateRunStats(progression, runData);

      expect(updated.achievements).toContain('collector');
    });

    it('unlocks Wealthy at 1000 total gold earned', () => {
      const progression = loadProgression();
      progression.totalGoldEarned = 990;
      const runData = { won: true, floor: 50, goldEarned: 15 };

      const updated = updateRunStats(progression, runData);

      expect(updated.achievements).toContain('wealthy');
    });

    it('unlocks Dedicated at 10 total runs', () => {
      const progression = loadProgression();
      progression.totalRuns = 9;
      const runData = { won: false, floor: 5 };

      const updated = updateRunStats(progression, runData);

      expect(updated.achievements).toContain('dedicated');
    });

    it('does not duplicate achievements already earned', () => {
      const progression = loadProgression();
      progression.achievements = ['first_blood'];
      progression.wins = 1;
      const runData = { won: true, floor: 50 };

      const updated = updateRunStats(progression, runData);

      const firstBloodCount = updated.achievements.filter(a => a === 'first_blood').length;
      expect(firstBloodCount).toBe(1);
    });

    it('unlocks Slayer when all bosses defeated', () => {
      const progression = loadProgression();
      progression.enemiesDefeated = {
        slimeBoss: 1,
        theGuardian: 1,
        hexaghost: 1,
        theChamp: 1,
        awakened_one: 1,
        timeEater: 1
      };
      const runData = {
        won: true,
        floor: 50,
        defeatedEnemies: ['corruptHeart']
      };

      const updated = updateRunStats(progression, runData);

      expect(updated.achievements).toContain('slayer');
    });
  });

  describe('Unlock milestones', () => {
    it('unlocks cards on first win (unlock_1)', () => {
      const progression = loadProgression();
      const runData = { won: true, floor: 50 };

      const updated = updateRunStats(progression, runData);

      expect(updated.unlockedCards).toContain('dark_embrace_card');
      expect(updated.unlockedCards).toContain('feel_no_pain_card');
    });

    it('unlocks relics at 50 enemies killed (unlock_2)', () => {
      const progression = loadProgression();
      progression.totalEnemiesKilled = 40;
      const runData = { won: false, floor: 10, enemiesKilled: 10 };

      const updated = updateRunStats(progression, runData);

      expect(updated.unlockedRelics).toContain('bronze_scales');
    });

    it('unlocks cards at 5 total runs (unlock_3)', () => {
      const progression = loadProgression();
      progression.totalRuns = 4;
      const runData = { won: false, floor: 5 };

      const updated = updateRunStats(progression, runData);

      expect(updated.unlockedCards).toContain('offering');
      expect(updated.unlockedCards).toContain('feed');
    });

    it('unlocks relics at 3 wins (unlock_4)', () => {
      const progression = loadProgression();
      progression.wins = 2;
      const runData = { won: true, floor: 50 };

      const updated = updateRunStats(progression, runData);

      expect(updated.unlockedRelics).toContain('dead_branch');
    });

    it('unlocks cards at ascension 1 (unlock_5)', () => {
      const progression = loadProgression();
      progression.highestAscension = 1;
      const runData = { won: false, floor: 10 };

      const updated = updateRunStats(progression, runData);

      expect(updated.unlockedCards).toContain('corruption');
      expect(updated.unlockedCards).toContain('barricade');
    });

    it('does not duplicate unlocks already earned', () => {
      const progression = loadProgression();
      progression.unlockedCards = ['dark_embrace_card'];
      progression.wins = 1;
      const runData = { won: true, floor: 50 };

      const updated = updateRunStats(progression, runData);

      const darkEmbraceCount = updated.unlockedCards.filter(c => c === 'dark_embrace_card').length;
      expect(darkEmbraceCount).toBe(1);
    });
  });

  describe('Exported constants and helpers', () => {
    it('exports ACHIEVEMENTS array with valid structure', () => {
      expect(Array.isArray(ACHIEVEMENTS)).toBe(true);
      expect(ACHIEVEMENTS.length).toBeGreaterThan(0);

      ACHIEVEMENTS.forEach(ach => {
        expect(ach).toHaveProperty('id');
        expect(ach).toHaveProperty('name');
        expect(ach).toHaveProperty('description');
        expect(ach).toHaveProperty('condition');
        expect(typeof ach.condition).toBe('function');
      });
    });

    it('exports UNLOCK_MILESTONES array with valid structure', () => {
      expect(Array.isArray(UNLOCK_MILESTONES)).toBe(true);
      expect(UNLOCK_MILESTONES.length).toBeGreaterThan(0);

      UNLOCK_MILESTONES.forEach(milestone => {
        expect(milestone).toHaveProperty('id');
        expect(milestone).toHaveProperty('requirement');
        expect(milestone).toHaveProperty('unlockType');
        expect(milestone).toHaveProperty('unlockIds');
        expect(typeof milestone.requirement).toBe('function');
        expect(['cards', 'relics']).toContain(milestone.unlockType);
        expect(Array.isArray(milestone.unlockIds)).toBe(true);
      });
    });

    it('getAchievements returns achievement list', () => {
      const achievements = getAchievements();
      expect(achievements).toBe(ACHIEVEMENTS);
    });

    it('getUnlockMilestones returns milestone list', () => {
      const milestones = getUnlockMilestones();
      expect(milestones).toBe(UNLOCK_MILESTONES);
    });
  });

  describe('Edge cases', () => {
    it('handles undefined run data fields gracefully', () => {
      const progression = loadProgression();
      const runData = { won: true, floor: 10 };
      // No enemiesKilled, goldEarned, etc.

      const updated = updateRunStats(progression, runData);

      expect(updated.totalEnemiesKilled).toBe(0);
      expect(updated.totalGoldEarned).toBe(0);
      expect(updated.totalDamageDealt).toBe(0);
      expect(updated.totalCardsPlayed).toBe(0);
    });

    it('handles empty relics array', () => {
      const progression = loadProgression();
      const runData = { won: true, floor: 10, relics: [] };

      const updated = updateRunStats(progression, runData);

      expect(updated.runHistory[0].relicCount).toBe(0);
    });

    it('handles null relics', () => {
      const progression = loadProgression();
      const runData = { won: true, floor: 10, relics: null };

      expect(() => {
        updateRunStats(progression, runData);
      }).not.toThrow();
    });

    it('handles empty defeatedEnemies array', () => {
      const progression = loadProgression();
      const runData = { won: true, floor: 10, defeatedEnemies: [] };

      expect(() => {
        updateRunStats(progression, runData);
      }).not.toThrow();
    });
  });
});
