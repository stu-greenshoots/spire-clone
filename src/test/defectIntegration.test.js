import { describe, it, expect, vi } from 'vitest';
import { metaReducer } from '../context/reducers/metaReducer';
import { mapReducer } from '../context/reducers/mapReducer';
import { GAME_PHASE, createInitialState } from '../context/GameContext';
import { getStarterDeck } from '../data/cards';
import { getStarterRelic } from '../data/relics';
import { CHARACTERS, CHARACTER_IDS } from '../data/characters';

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

describe('JR-12b: Defect Character Integration', () => {
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

  describe('Character Definition', () => {
    it('Defect exists in CHARACTER_IDS', () => {
      expect(CHARACTER_IDS.DEFECT).toBe('defect');
    });

    it('Defect exists in CHARACTERS array', () => {
      const defect = CHARACTERS.find(c => c.id === 'defect');
      expect(defect).toBeDefined();
      expect(defect.name).toBe('The Defect');
      expect(defect.orbSlots).toBe(3);
      expect(defect.maxHp).toBe(75);
      expect(defect.color).toBe('#4488cc');
    });
  });

  describe('Character Selection - Defect', () => {
    it('Defect has 75 max HP', () => {
      const state = startGame('defect');
      expect(state.player.maxHp).toBe(75);
      expect(state.player.currentHp).toBe(75);
    });

    it('Defect has 3 orb slots', () => {
      const state = startGame('defect');
      expect(state.player.orbSlots).toBe(3);
    });

    it('Defect has 10-card starter deck', () => {
      const state = startGame('defect');
      expect(state.deck).toHaveLength(10);
    });

    it('Defect starter deck contains correct cards', () => {
      const state = startGame('defect');
      const ids = state.deck.map(c => c.id);
      expect(ids.filter(id => id === 'strike_defect')).toHaveLength(4);
      expect(ids.filter(id => id === 'defend_defect')).toHaveLength(4);
      expect(ids.filter(id => id === 'zap')).toHaveLength(1);
      expect(ids.filter(id => id === 'dualcast')).toHaveLength(1);
    });

    it('Defect starts with Cracked Core relic', () => {
      const state = startGame('defect');
      expect(state.relics).toHaveLength(1);
      expect(state.relics[0].id).toBe('cracked_core');
    });

    it('Defect character stored in state', () => {
      const state = startGame('defect');
      expect(state.character).toBe('defect');
    });
  });

  describe('Starter Deck and Relic helpers', () => {
    it('getStarterDeck returns 10 cards for Defect', () => {
      const deck = getStarterDeck('defect');
      expect(deck).toHaveLength(10);
      expect(deck.every(c => c.instanceId)).toBe(true);
    });

    it('getStarterRelic returns Cracked Core for Defect', () => {
      const relic = getStarterRelic('defect');
      expect(relic.id).toBe('cracked_core');
      expect(relic.name).toBe('Cracked Core');
    });
  });

  describe('Cracked Core - Combat Start Orb', () => {
    it('Defect starts combat with 1 Lightning orb from Cracked Core', () => {
      let state = startGame('defect');

      state = metaReducer(state, {
        type: 'SELECT_STARTING_BONUS',
        payload: { bonusId: 'skip' }
      });
      expect(state.phase).toBe(GAME_PHASE.MAP);

      const floor0Nodes = state.map.filter(n => n.floor === 0);
      const combatNode = floor0Nodes.find(n => n.type === 'enemy');
      if (!combatNode) return; // Skip if no combat node on floor 0

      state = mapReducer(state, {
        type: 'SELECT_NODE',
        payload: { nodeId: combatNode.id }
      });

      expect(state.phase).toBe(GAME_PHASE.COMBAT);
      expect(state.player.orbs).toHaveLength(1);
      expect(state.player.orbs[0].type).toBe('lightning');
    });
  });

  describe('Ironclad and Silent unchanged', () => {
    it('Ironclad has 0 orb slots', () => {
      const state = startGame('ironclad');
      expect(state.player.orbSlots).toBe(0);
    });

    it('Silent has 0 orb slots', () => {
      const state = startGame('silent');
      expect(state.player.orbSlots).toBe(0);
    });

    it('Ironclad still has 80 HP and 10-card deck', () => {
      const state = startGame('ironclad');
      expect(state.player.maxHp).toBe(80);
      expect(state.deck).toHaveLength(10);
    });

    it('Silent still has 70 HP and 12-card deck', () => {
      const state = startGame('silent');
      expect(state.player.maxHp).toBe(70);
      expect(state.deck).toHaveLength(12);
    });
  });
});
