import { describe, it, expect, vi } from 'vitest';
import { metaReducer } from '../context/reducers/metaReducer';
import { mapReducer } from '../context/reducers/mapReducer';
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
  audioManager: { playSFX: vi.fn(), playMusic: vi.fn() },
  SOUNDS: { ui: { cardUpgrade: 'cardUpgrade' }, combat: { start: 'start', bossIntro: 'bossIntro' } }
}));

describe('JR-09b: Silent Character Integration', () => {
  const startGame = (characterId) => {
    const initial = metaReducer(createInitialState(), {
      type: 'START_GAME',
      payload: { ascensionLevel: 0 }
    });
    return metaReducer(initial, {
      type: 'SELECT_CHARACTER',
      payload: { characterId }
    });
  };

  describe('Character Selection - Silent', () => {
    it('Silent has 70 max HP', () => {
      const state = startGame('silent');
      expect(state.player.maxHp).toBe(70);
      expect(state.player.currentHp).toBe(70);
    });

    it('Silent has 12-card starter deck', () => {
      const state = startGame('silent');
      expect(state.deck).toHaveLength(12);
    });

    it('Silent starter deck contains correct cards', () => {
      const state = startGame('silent');
      const ids = state.deck.map(c => c.id);
      expect(ids.filter(id => id === 'strike_silent')).toHaveLength(5);
      expect(ids.filter(id => id === 'defend_silent')).toHaveLength(5);
      expect(ids.filter(id => id === 'neutralize')).toHaveLength(1);
      expect(ids.filter(id => id === 'survivor')).toHaveLength(1);
    });

    it('Silent starts with Ring of the Snake relic', () => {
      const state = startGame('silent');
      expect(state.relics).toHaveLength(1);
      expect(state.relics[0].id).toBe('ring_of_snake');
    });

    it('Silent character stored in state', () => {
      const state = startGame('silent');
      expect(state.character).toBe('silent');
    });
  });

  describe('Character Selection - Ironclad unchanged', () => {
    it('Ironclad has 80 max HP', () => {
      const state = startGame('ironclad');
      expect(state.player.maxHp).toBe(80);
      expect(state.player.currentHp).toBe(80);
    });

    it('Ironclad has 10-card starter deck', () => {
      const state = startGame('ironclad');
      expect(state.deck).toHaveLength(10);
    });

    it('Ironclad starts with Burning Blood relic', () => {
      const state = startGame('ironclad');
      expect(state.relics[0].id).toBe('burning_blood');
    });
  });

  describe('Ring of the Snake - Combat Draw', () => {
    it('Silent draws 7 cards at combat start (5 base + 2 from relic)', () => {
      // Set up a Silent game state ready for combat
      let state = startGame('silent');

      // Skip starting bonus to get to MAP
      state = metaReducer(state, {
        type: 'SELECT_STARTING_BONUS',
        payload: { bonusId: 'skip' }
      });
      expect(state.phase).toBe(GAME_PHASE.MAP);

      // Find first combat node
      const floor0Nodes = state.map.filter(n => n.floor === 0);
      const combatNode = floor0Nodes.find(n => n.type === 'enemy');
      if (!combatNode) return; // Skip if no combat node on floor 0

      // Enter combat
      state = mapReducer(state, {
        type: 'SELECT_NODE',
        payload: { nodeId: combatNode.id }
      });

      expect(state.phase).toBe(GAME_PHASE.COMBAT);
      // Ring of the Snake: 5 base draw + 2 extra = 7 cards in hand
      expect(state.hand.length).toBe(7);
    });

    it('Ironclad draws 5 cards at combat start (no extra draw)', () => {
      let state = startGame('ironclad');
      state = metaReducer(state, {
        type: 'SELECT_STARTING_BONUS',
        payload: { bonusId: 'skip' }
      });

      const floor0Nodes = state.map.filter(n => n.floor === 0);
      const combatNode = floor0Nodes.find(n => n.type === 'enemy');
      if (!combatNode) return;

      state = mapReducer(state, {
        type: 'SELECT_NODE',
        payload: { nodeId: combatNode.id }
      });

      expect(state.phase).toBe(GAME_PHASE.COMBAT);
      expect(state.hand.length).toBe(5);
    });
  });
});
