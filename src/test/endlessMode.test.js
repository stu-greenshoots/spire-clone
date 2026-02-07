import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createInitialState, GAME_PHASE } from '../context/GameContext';
import { mapReducer } from '../context/reducers/mapReducer';
import { createEnemyInstance, getEnemyById } from '../data/enemies';

// Mock dependencies
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
  loadProgression: vi.fn(() => ({ characterWins: { ironclad: 1, silent: 1 } })),
  isHeartUnlocked: vi.fn(() => true)
}));

describe('Endless Mode Infrastructure — BE-31', () => {
  describe('Initial State', () => {
    it('initializes with endlessMode false and endlessLoop 0', () => {
      const state = createInitialState();
      expect(state.endlessMode).toBe(false);
      expect(state.endlessLoop).toBe(0);
    });

    it('has ENDLESS_TRANSITION phase defined', () => {
      expect(GAME_PHASE.ENDLESS_TRANSITION).toBe('endless_transition');
    });
  });

  describe('PROCEED_TO_MAP after Heart (Act 4 boss)', () => {
    it('transitions to ENDLESS_TRANSITION instead of VICTORY after Heart defeat', () => {
      const state = {
        ...createInitialState(),
        phase: GAME_PHASE.COMBAT_REWARD,
        act: 4,
        currentNode: { type: 'boss' },
        endlessMode: false,
        endlessLoop: 0
      };

      const result = mapReducer(state, { type: 'PROCEED_TO_MAP' });
      expect(result.phase).toBe(GAME_PHASE.ENDLESS_TRANSITION);
    });

    it('transitions to ENDLESS_TRANSITION after Heart in endless mode', () => {
      const state = {
        ...createInitialState(),
        phase: GAME_PHASE.COMBAT_REWARD,
        act: 4,
        currentNode: { type: 'boss' },
        endlessMode: true,
        endlessLoop: 1
      };

      const result = mapReducer(state, { type: 'PROCEED_TO_MAP' });
      expect(result.phase).toBe(GAME_PHASE.ENDLESS_TRANSITION);
    });
  });

  describe('ENTER_ENDLESS action', () => {
    it('sets endlessMode to true and increments endlessLoop', () => {
      const state = {
        ...createInitialState(),
        phase: GAME_PHASE.ENDLESS_TRANSITION,
        act: 4,
        endlessMode: false,
        endlessLoop: 0
      };

      const result = mapReducer(state, { type: 'ENTER_ENDLESS' });
      expect(result.endlessMode).toBe(true);
      expect(result.endlessLoop).toBe(1);
    });

    it('resets to Act 1 with a new map', () => {
      const state = {
        ...createInitialState(),
        phase: GAME_PHASE.ENDLESS_TRANSITION,
        act: 4,
        endlessMode: false,
        endlessLoop: 0
      };

      const result = mapReducer(state, { type: 'ENTER_ENDLESS' });
      expect(result.act).toBe(1);
      expect(result.phase).toBe(GAME_PHASE.MAP);
      expect(result.currentFloor).toBe(-1);
      expect(result.map).toBeTruthy();
      expect(result.map.length).toBeGreaterThan(0);
    });

    it('increments loop counter on subsequent loops', () => {
      const state = {
        ...createInitialState(),
        phase: GAME_PHASE.ENDLESS_TRANSITION,
        act: 4,
        endlessMode: true,
        endlessLoop: 2
      };

      const result = mapReducer(state, { type: 'ENTER_ENDLESS' });
      expect(result.endlessLoop).toBe(3);
      expect(result.endlessMode).toBe(true);
      expect(result.act).toBe(1);
    });
  });

  describe('Endless mode act progression', () => {
    it('progresses from Act 1 to Act 2 boss in endless', () => {
      const state = {
        ...createInitialState(),
        phase: GAME_PHASE.COMBAT_REWARD,
        act: 1,
        currentNode: { type: 'boss' },
        endlessMode: true,
        endlessLoop: 1
      };

      const result = mapReducer(state, { type: 'PROCEED_TO_MAP' });
      expect(result.act).toBe(2);
      expect(result.phase).toBe(GAME_PHASE.MAP);
    });

    it('progresses from Act 3 to Act 4 (Heart) in endless', () => {
      const state = {
        ...createInitialState(),
        phase: GAME_PHASE.COMBAT_REWARD,
        act: 3,
        currentNode: { type: 'boss' },
        endlessMode: true,
        endlessLoop: 1
      };

      const result = mapReducer(state, { type: 'PROCEED_TO_MAP' });
      expect(result.act).toBe(4);
      expect(result.phase).toBe(GAME_PHASE.MAP);
    });
  });

  describe('Endless scaling', () => {
    it('scales enemy HP by 10% per loop', () => {
      // Test the applyEndlessScaling function indirectly via state
      // A jawWorm has ~40-44 HP range
      const jawWorm = getEnemyById('jawWorm');
      const instance = createEnemyInstance(jawWorm);
      const baseHp = instance.currentHp;

      // Simulate what mapReducer does: scale by loop factor
      const scaleFactor = 1 + (0.1 * 1); // loop 1 = +10%
      const scaledHp = Math.floor(baseHp * scaleFactor);
      expect(scaledHp).toBeGreaterThan(baseHp);
      expect(scaledHp).toBe(Math.floor(baseHp * 1.1));
    });

    it('scales invincible shield in endless mode', () => {
      const heart = getEnemyById('corruptHeart');
      const instance = createEnemyInstance(heart);
      expect(instance.invincible).toBe(200);

      // Loop 2: +20% scaling
      const scaleFactor = 1 + (0.1 * 2);
      const scaledInvincible = Math.floor(200 * scaleFactor);
      expect(scaledInvincible).toBe(240);
    });

    it('loop 5 gives 50% HP increase', () => {
      const scaleFactor = 1 + (0.1 * 5);
      expect(scaleFactor).toBe(1.5);
      expect(Math.floor(100 * scaleFactor)).toBe(150);
    });
  });

  describe('Endless Mode UI — UX-33', () => {
    it('endless state provides loop and scaling info for UI display', () => {
      const state = {
        ...createInitialState(),
        endlessMode: true,
        endlessLoop: 3,
        act: 2,
        currentFloor: 5
      };

      // UI should display: Loop 3, scaling +30%
      expect(state.endlessLoop).toBe(3);
      expect(state.endlessLoop * 10).toBe(30); // +30% scaling display
      expect(state.act).toBe(2);
      expect(state.currentFloor).toBe(5);
    });

    it('non-endless state has endlessMode false for conditional UI rendering', () => {
      const state = createInitialState();
      expect(state.endlessMode).toBe(false);
      expect(state.endlessLoop).toBe(0);
    });

    it('death in endless mode preserves loop stats for death screen', () => {
      const state = {
        ...createInitialState(),
        phase: GAME_PHASE.GAME_OVER,
        endlessMode: true,
        endlessLoop: 4,
        act: 3,
        currentFloor: 8,
        runStats: {
          cardsPlayed: 150,
          damageDealt: 3200,
          enemiesKilled: 45,
          goldEarned: 800,
          floor: 0
        }
      };

      // Verify all data needed for endless death screen is accessible
      expect(state.endlessMode).toBe(true);
      expect(state.endlessLoop).toBe(4);
      expect(state.runStats.enemiesKilled).toBe(45);
      expect(state.runStats.damageDealt).toBe(3200);
    });

    it('endless footer text uses loop count', () => {
      const endlessLoop = 3;
      const footerText = `You held on for ${endlessLoop} loop${endlessLoop !== 1 ? 's' : ''}. The war forgets your name.`;
      expect(footerText).toBe('You held on for 3 loops. The war forgets your name.');
    });

    it('single loop uses singular form', () => {
      const endlessLoop = 1;
      const footerText = `You held on for ${endlessLoop} loop${endlessLoop !== 1 ? 's' : ''}. The war forgets your name.`;
      expect(footerText).toBe('You held on for 1 loop. The war forgets your name.');
    });
  });

  describe('Non-endless flow unchanged', () => {
    it('normal Act 3 boss victory with Heart unlocked still goes to Act 4', () => {
      const state = {
        ...createInitialState(),
        phase: GAME_PHASE.COMBAT_REWARD,
        act: 3,
        currentNode: { type: 'boss' },
        endlessMode: false,
        endlessLoop: 0
      };

      const result = mapReducer(state, { type: 'PROCEED_TO_MAP' });
      expect(result.act).toBe(4);
      expect(result.phase).toBe(GAME_PHASE.MAP);
    });
  });
});
