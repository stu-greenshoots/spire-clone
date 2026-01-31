import { describe, it, expect, vi, beforeEach } from 'vitest';
import { metaReducer } from '../context/reducers/metaReducer';
import { GAME_PHASE, createInitialState } from '../context/GameContext';
import { getStarterDeck } from '../data/cards';
import { getStarterRelic } from '../data/relics';

// Mock save system
vi.mock('../systems/saveSystem', () => ({
  saveGame: vi.fn(),
  loadGame: vi.fn(),
  deleteSave: vi.fn()
}));

// Mock audio
vi.mock('../systems/audioSystem', () => ({
  audioManager: { playSFX: vi.fn() },
  SOUNDS: { ui: { cardUpgrade: 'cardUpgrade' } }
}));

describe('Starting Bonus (BE-09)', () => {
  let baseState;

  beforeEach(() => {
    const deck = getStarterDeck();
    const starterRelic = getStarterRelic();
    baseState = {
      ...createInitialState(),
      phase: GAME_PHASE.STARTING_BONUS,
      deck,
      relics: [starterRelic],
      currentFloor: -1,
      player: {
        ...createInitialState().player,
        gold: 99
      }
    };
  });

  describe('START_GAME transitions to CHARACTER_SELECT', () => {
    it('should set phase to CHARACTER_SELECT', () => {
      const result = metaReducer(createInitialState(), {
        type: 'START_GAME',
        payload: { ascensionLevel: 0 }
      });
      expect(result.phase).toBe(GAME_PHASE.CHARACTER_SELECT);
    });

    it('SELECT_CHARACTER transitions to STARTING_BONUS with deck and relic', () => {
      const selectState = metaReducer(createInitialState(), {
        type: 'START_GAME',
        payload: { ascensionLevel: 0 }
      });
      const result = metaReducer(selectState, {
        type: 'SELECT_CHARACTER',
        payload: { characterId: 'ironclad' }
      });
      expect(result.phase).toBe(GAME_PHASE.STARTING_BONUS);
      expect(result.deck.length).toBe(10);
      expect(result.relics.length).toBe(1);
      expect(result.character).toBe('ironclad');
    });
  });

  describe('SELECT_STARTING_BONUS', () => {
    it('skip goes to MAP without changes', () => {
      const result = metaReducer(baseState, {
        type: 'SELECT_STARTING_BONUS',
        payload: { bonusId: 'skip' }
      });
      expect(result.phase).toBe(GAME_PHASE.MAP);
      expect(result.deck).toEqual(baseState.deck);
      expect(result.relics).toEqual(baseState.relics);
      expect(result.player.gold).toBe(baseState.player.gold);
    });

    it('gain_gold adds 100 gold', () => {
      const result = metaReducer(baseState, {
        type: 'SELECT_STARTING_BONUS',
        payload: { bonusId: 'gain_gold' }
      });
      expect(result.phase).toBe(GAME_PHASE.MAP);
      expect(result.player.gold).toBe(baseState.player.gold + 100);
    });

    it('random_relic adds a common relic', () => {
      const result = metaReducer(baseState, {
        type: 'SELECT_STARTING_BONUS',
        payload: { bonusId: 'random_relic' }
      });
      expect(result.phase).toBe(GAME_PHASE.MAP);
      expect(result.relics.length).toBe(baseState.relics.length + 1);
      expect(result.relics[result.relics.length - 1].rarity).toBe('common');
    });

    it('upgrade_card upgrades a starter card', () => {
      const result = metaReducer(baseState, {
        type: 'SELECT_STARTING_BONUS',
        payload: { bonusId: 'upgrade_card' }
      });
      expect(result.phase).toBe(GAME_PHASE.MAP);
      const upgraded = result.deck.filter(c => c.upgraded);
      expect(upgraded.length).toBe(1);
      expect(upgraded[0].name).toMatch(/\+$/);
    });

    it('transform_card replaces a starter card', () => {
      const strikeCount = baseState.deck.filter(c => c.id === 'strike').length;
      const defendCount = baseState.deck.filter(c => c.id === 'defend').length;
      const starterCount = strikeCount + defendCount;

      const result = metaReducer(baseState, {
        type: 'SELECT_STARTING_BONUS',
        payload: { bonusId: 'transform_card' }
      });
      expect(result.phase).toBe(GAME_PHASE.MAP);
      expect(result.deck.length).toBe(baseState.deck.length);

      const newStrikeCount = result.deck.filter(c => c.id === 'strike').length;
      const newDefendCount = result.deck.filter(c => c.id === 'defend').length;
      const newStarterCount = newStrikeCount + newDefendCount;
      expect(newStarterCount).toBe(starterCount - 1);
    });
  });
});
