import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveGame,
  loadGame,
  hasSavedGame,
  exportAllData,
  importAllData,
  addRunToHistory,
  getRunHistory
} from '../systems/saveSystem';
import { getStarterDeck } from '../data/cards';
import { getStarterRelic, getRelicById } from '../data/relics';
import { getPotionById } from '../data/potions';

/**
 * QA-20: Save Export/Import Regression Tests
 *
 * Validates the full export/import pipeline:
 * - Round-trip with realistic multi-key data
 * - Corrupt/malformed file handling
 * - All 7 localStorage keys preserved
 * - Edge cases (empty export, partial data, large data)
 */

const ALL_KEYS = [
  'spireAscent_save',
  'spireAscent_runHistory',
  'spireAscent_progression',
  'spireAscent_settings',
  'spireAscent_tutorialDone',
  'spireAscent_hasSeenTutorial',
  'spireAscent_customData'
];

const createRealisticState = (overrides = {}) => ({
  player: { currentHp: 55, maxHp: 80, gold: 230, strength: 3, dexterity: 1 },
  deck: getStarterDeck(),
  relics: [getStarterRelic(), { ...getRelicById('nunchaku'), counter: 4 }],
  potions: [getPotionById('fire_potion'), getPotionById('health_potion')],
  currentFloor: 9,
  act: 2,
  map: [[{ type: 'monster' }, { type: 'elite' }], [{ type: 'rest' }]],
  currentNode: { x: 1, y: 0 },
  ascension: 5,
  character: 'ironclad',
  ...overrides
});

describe('QA-20: Save Export/Import Regression', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Full round-trip with all 7 keys', () => {
    it('exports and imports all 7 localStorage keys correctly', () => {
      // Populate all 7 keys
      saveGame(createRealisticState());
      addRunToHistory({ won: true, floor: 15, act: 3, deckSize: 25, relicCount: 8, gold: 400, ascension: 0, enemiesKilled: 20 });
      addRunToHistory({ won: false, floor: 7, act: 2, deckSize: 15, relicCount: 3, gold: 50, ascension: 0, causeOfDeath: 'Gremlin Nob' });
      localStorage.setItem('spireAscent_progression', JSON.stringify({ wins: 5, losses: 12, characterWins: { ironclad: 3, silent: 2 }, achievements: ['first_win', 'ascension_5'] }));
      localStorage.setItem('spireAscent_settings', JSON.stringify({ masterVolume: 0.7, sfxVolume: 0.8, musicVolume: 0.5, animationSpeed: 'fast', textSize: 'normal' }));
      localStorage.setItem('spireAscent_tutorialDone', 'true');
      localStorage.setItem('spireAscent_hasSeenTutorial', 'true');
      localStorage.setItem('spireAscent_customData', JSON.stringify({ dailyScores: { '2026-01-15': 1200 } }));

      // Export
      const exported = exportAllData();
      const parsed = JSON.parse(exported);

      // Verify all 7 keys present in export
      for (const key of ALL_KEYS) {
        expect(parsed[key]).toBeDefined();
      }
      expect(parsed.exportVersion).toBe(1);
      expect(parsed.exportDate).toBeDefined();

      // Clear everything
      localStorage.clear();
      expect(loadGame()).toBeNull();
      expect(getRunHistory()).toEqual([]);

      // Import
      const result = importAllData(exported);
      expect(result.success).toBe(true);
      expect(result.keysRestored).toBe(7);

      // Verify save restored
      const loaded = loadGame();
      expect(loaded).not.toBeNull();
      expect(loaded.player.currentHp).toBe(55);
      expect(loaded.player.gold).toBe(230);
      expect(loaded.currentFloor).toBe(9);
      expect(loaded.act).toBe(2);
      expect(loaded.character).toBe('ironclad');

      // Verify run history restored
      const history = getRunHistory();
      expect(history.length).toBe(2);
      expect(history[0].won).toBe(false); // Most recent first
      expect(history[1].won).toBe(true);

      // Verify progression restored
      const prog = JSON.parse(localStorage.getItem('spireAscent_progression'));
      expect(prog.wins).toBe(5);
      expect(prog.characterWins.ironclad).toBe(3);

      // Verify settings restored
      const settings = JSON.parse(localStorage.getItem('spireAscent_settings'));
      expect(settings.masterVolume).toBe(0.7);
      expect(settings.animationSpeed).toBe('fast');

      // Verify tutorial flags restored
      expect(localStorage.getItem('spireAscent_tutorialDone')).toBe('true');
      expect(localStorage.getItem('spireAscent_hasSeenTutorial')).toBe('true');

      // Verify custom data restored
      const custom = JSON.parse(localStorage.getItem('spireAscent_customData'));
      expect(custom.dailyScores['2026-01-15']).toBe(1200);
    });

    it('round-trips with Defect character state', () => {
      const state = createRealisticState({ character: 'defect', ascension: 3 });
      saveGame(state);
      localStorage.setItem('spireAscent_progression', JSON.stringify({ characterWins: { ironclad: 1, silent: 1, defect: 0 } }));

      const exported = exportAllData();
      localStorage.clear();

      const result = importAllData(exported);
      expect(result.success).toBe(true);

      const loaded = loadGame();
      expect(loaded.character).toBe('defect');
      expect(loaded.ascension).toBe(3);
    });

    it('round-trips with Silent character state', () => {
      const state = createRealisticState({ character: 'silent' });
      saveGame(state);

      const exported = exportAllData();
      localStorage.clear();

      importAllData(exported);
      const loaded = loadGame();
      expect(loaded.character).toBe('silent');
    });
  });

  describe('Corrupt file handling', () => {
    it('rejects empty string', () => {
      const result = importAllData('');
      expect(result.success).toBe(false);
    });

    it('rejects plain text', () => {
      const result = importAllData('this is not json at all');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to parse');
    });

    it('rejects valid JSON without exportVersion', () => {
      const result = importAllData(JSON.stringify({ hello: 'world' }));
      expect(result.success).toBe(false);
      expect(result.error).toContain('missing export version');
    });

    it('rejects array JSON', () => {
      const result = importAllData(JSON.stringify([1, 2, 3]));
      expect(result.success).toBe(false);
    });

    it('rejects null', () => {
      const result = importAllData('null');
      expect(result.success).toBe(false);
    });

    it('rejects exportVersion: 0 (falsy)', () => {
      const result = importAllData(JSON.stringify({ exportVersion: 0 }));
      expect(result.success).toBe(false);
    });

    it('handles truncated JSON gracefully', () => {
      const result = importAllData('{"exportVersion": 1, "spireAscent_save":');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to parse');
    });

    it('does not overwrite existing data on failed import', () => {
      // Set up existing data
      saveGame(createRealisticState());
      expect(hasSavedGame()).toBe(true);

      // Attempt bad import
      const result = importAllData('not json');
      expect(result.success).toBe(false);

      // Existing data should still be there
      expect(hasSavedGame()).toBe(true);
      const loaded = loadGame();
      expect(loaded.player.currentHp).toBe(55);
    });

    it('ignores unknown keys in otherwise valid export', () => {
      const exportData = {
        exportVersion: 1,
        exportDate: '2026-02-01T00:00:00Z',
        'spireAscent_save': '{"version":4,"state":{"player":{"currentHp":50}}}',
        'malicious_key': 'should not be stored',
        'spireAscent_evil': 'also ignored'
      };

      const result = importAllData(JSON.stringify(exportData));
      expect(result.success).toBe(true);
      expect(result.keysRestored).toBe(1);
      expect(localStorage.getItem('malicious_key')).toBeNull();
      expect(localStorage.getItem('spireAscent_evil')).toBeNull();
    });
  });

  describe('Partial data handling', () => {
    it('imports export with only save data (no progression/settings)', () => {
      const exportData = {
        exportVersion: 1,
        exportDate: '2026-02-01T00:00:00Z',
        'spireAscent_save': JSON.stringify({
          version: 4,
          timestamp: Date.now(),
          checksum: 0,
          state: {
            player: { currentHp: 40, maxHp: 80, gold: 100, strength: 0, dexterity: 0 },
            deck: [{ id: 'strike', instanceId: 's_0' }],
            relics: [{ id: 'burning_blood' }],
            potions: [],
            currentFloor: 3,
            act: 1,
            map: [],
            currentNode: null,
            ascension: 0,
            character: 'ironclad'
          }
        })
      };

      const result = importAllData(JSON.stringify(exportData));
      expect(result.success).toBe(true);
      expect(result.keysRestored).toBe(1);

      const loaded = loadGame();
      expect(loaded).not.toBeNull();
      expect(loaded.player.currentHp).toBe(40);
    });

    it('imports export with no game keys (just version/date)', () => {
      const exportData = {
        exportVersion: 1,
        exportDate: '2026-02-01T00:00:00Z'
      };

      const result = importAllData(JSON.stringify(exportData));
      expect(result.success).toBe(true);
      expect(result.keysRestored).toBe(0);
    });

    it('preserves existing keys not present in import', () => {
      // Set up existing settings
      localStorage.setItem('spireAscent_settings', '{"masterVolume":0.9}');

      // Import with only save data (no settings key)
      const exportData = {
        exportVersion: 1,
        'spireAscent_save': '{"version":4,"state":{"player":{"currentHp":50},"deck":[],"relics":[],"currentFloor":1}}'
      };

      importAllData(JSON.stringify(exportData));

      // Settings should still be the original value (import doesn't clear missing keys)
      expect(localStorage.getItem('spireAscent_settings')).toBe('{"masterVolume":0.9}');
    });
  });

  describe('Export format validation', () => {
    it('export produces valid JSON', () => {
      saveGame(createRealisticState());
      const exported = exportAllData();

      expect(() => JSON.parse(exported)).not.toThrow();
    });

    it('export includes exportVersion and exportDate', () => {
      const exported = exportAllData();
      const parsed = JSON.parse(exported);

      expect(parsed.exportVersion).toBe(1);
      expect(typeof parsed.exportDate).toBe('string');
      expect(new Date(parsed.exportDate).getTime()).not.toBeNaN();
    });

    it('export stores raw localStorage strings (not parsed objects)', () => {
      const settingsStr = '{"masterVolume":0.5}';
      localStorage.setItem('spireAscent_settings', settingsStr);

      const exported = exportAllData();
      const parsed = JSON.parse(exported);

      // Value should be a string, not a parsed object
      expect(typeof parsed['spireAscent_settings']).toBe('string');
      expect(parsed['spireAscent_settings']).toBe(settingsStr);
    });

    it('export with empty localStorage produces minimal output', () => {
      const exported = exportAllData();
      const parsed = JSON.parse(exported);

      expect(parsed.exportVersion).toBe(1);
      // No game keys should be present
      for (const key of ALL_KEYS) {
        expect(parsed[key]).toBeUndefined();
      }
    });
  });

  describe('Large data handling', () => {
    it('handles run history with 20 entries', () => {
      for (let i = 0; i < 20; i++) {
        addRunToHistory({
          won: i % 3 === 0,
          floor: 5 + i,
          act: Math.min(3, Math.floor(i / 5) + 1),
          deckSize: 10 + i,
          relicCount: 1 + Math.floor(i / 4),
          gold: 50 + i * 20,
          ascension: i % 11,
          enemiesKilled: 5 + i * 2
        });
      }

      const exported = exportAllData();
      localStorage.clear();

      const result = importAllData(exported);
      expect(result.success).toBe(true);

      const history = getRunHistory();
      expect(history.length).toBe(20);
    });

    it('handles progression with many achievements', () => {
      const bigProg = {
        wins: 50,
        losses: 100,
        characterWins: { ironclad: 20, silent: 15, defect: 15 },
        achievements: Array.from({ length: 30 }, (_, i) => `achievement_${i}`),
        cardsPlayedById: Object.fromEntries(Array.from({ length: 80 }, (_, i) => [`card_${i}`, i * 10]))
      };
      localStorage.setItem('spireAscent_progression', JSON.stringify(bigProg));

      const exported = exportAllData();
      localStorage.clear();

      importAllData(exported);
      const restored = JSON.parse(localStorage.getItem('spireAscent_progression'));
      expect(restored.wins).toBe(50);
      expect(restored.achievements.length).toBe(30);
      expect(Object.keys(restored.cardsPlayedById).length).toBe(80);
    });
  });
});
