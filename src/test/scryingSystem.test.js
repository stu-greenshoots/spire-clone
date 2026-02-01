import { describe, it, expect } from 'vitest';
import { combatReducer } from '../context/reducers/combatReducer';
import { handleSpecialEffect, SUPPORTED_EFFECTS } from '../systems/cardEffects';
import { GAME_PHASE } from '../context/GameContext';

const makeCard = (id, overrides = {}) => ({
  id,
  instanceId: `${id}_${Math.random()}`,
  name: id,
  type: 'skill',
  cost: 1,
  ...overrides
});

const makeState = (overrides = {}) => ({
  phase: GAME_PHASE.COMBAT,
  player: { currentHp: 50, maxHp: 50, block: 0, energy: 3, maxEnergy: 3, strength: 0, dexterity: 0, weak: 0, vulnerable: 0, frail: 0, statusEffects: [], currentStance: null, mantra: 0, orbs: [], orbSlots: 3, focus: 0 },
  enemies: [{ id: 'test', currentHp: 20, maxHp: 20, block: 0, intent: { type: 'attack', damage: 6 } }],
  hand: [],
  drawPile: [],
  discardPile: [],
  exhaustPile: [],
  combatLog: [],
  cardSelection: null,
  selectedCard: null,
  targetingMode: false,
  turn: 1,
  relics: [],
  ...overrides
});

describe('Scrying System', () => {
  describe('scryCards effect registration', () => {
    it('should be in SUPPORTED_EFFECTS', () => {
      expect(SUPPORTED_EFFECTS).toContain('scryCards');
    });
  });

  describe('scryCards card selection effect', () => {
    it('should open draw pile selection with top N cards', () => {
      const cards = [makeCard('a'), makeCard('b'), makeCard('c'), makeCard('d'), makeCard('e')];
      const scryCard = makeCard('third_eye', { special: 'scryCards', scryCount: 3 });
      const ctx = {
        state: makeState({ drawPile: cards }),
        GAME_PHASE,
        player: { currentHp: 50, maxHp: 50, block: 0, energy: 3 },
        enemies: [],
        hand: [],
        drawPile: [...cards],
        discardPile: [],
        exhaustPile: [],
        combatLog: []
      };

      const result = handleSpecialEffect('scryCards', scryCard, ctx);
      expect(result).not.toBeNull();
      expect(result.earlyReturn).toBe(true);
      expect(result.earlyReturnState.phase).toBe(GAME_PHASE.CARD_SELECT_DRAW);
      expect(result.earlyReturnState.cardSelection.type).toBe('scryCards');
      expect(result.earlyReturnState.cardSelection.scryCount).toBe(3);
    });

    it('should return null when draw pile is empty', () => {
      const scryCard = makeCard('third_eye', { special: 'scryCards', scryCount: 3 });
      const ctx = {
        state: makeState(),
        GAME_PHASE,
        player: { currentHp: 50, maxHp: 50, block: 0, energy: 3 },
        enemies: [],
        hand: [],
        drawPile: [],
        discardPile: [],
        exhaustPile: [],
        combatLog: []
      };

      const result = handleSpecialEffect('scryCards', scryCard, ctx);
      expect(result).toBeNull();
    });

    it('should use default scryCount of 3 when not specified', () => {
      const cards = [makeCard('a'), makeCard('b'), makeCard('c'), makeCard('d')];
      const scryCard = makeCard('scry_card', { special: 'scryCards' });
      const ctx = {
        state: makeState({ drawPile: cards }),
        GAME_PHASE,
        player: { currentHp: 50, maxHp: 50, block: 0, energy: 3 },
        enemies: [],
        hand: [],
        drawPile: [...cards],
        discardPile: [],
        exhaustPile: [],
        combatLog: []
      };

      const result = handleSpecialEffect('scryCards', scryCard, ctx);
      expect(result.earlyReturnState.cardSelection.scryCount).toBe(3);
    });
  });

  describe('combatReducer scryCards selection', () => {
    it('should discard selected card from top of draw pile', () => {
      const cardA = makeCard('a');
      const cardB = makeCard('b');
      const cardC = makeCard('c');
      const cardD = makeCard('d');

      const state = makeState({
        phase: GAME_PHASE.CARD_SELECT_DRAW,
        drawPile: [cardA, cardB, cardC, cardD],
        cardSelection: { type: 'scryCards', scryCount: 3 }
      });

      const result = combatReducer(state, {
        type: 'SELECT_CARD_FROM_PILE',
        payload: { card: cardB }
      });

      // cardB should be in discard, not in draw pile
      expect(result.discardPile.some(c => c.instanceId === cardB.instanceId)).toBe(true);
      expect(result.drawPile.some(c => c.instanceId === cardB.instanceId)).toBe(false);
      // Other cards stay in draw pile
      expect(result.drawPile.some(c => c.instanceId === cardA.instanceId)).toBe(true);
      expect(result.drawPile.some(c => c.instanceId === cardD.instanceId)).toBe(true);
    });

    it('should re-open modal with remaining scryable cards after discard', () => {
      const cardA = makeCard('a');
      const cardB = makeCard('b');
      const cardC = makeCard('c');
      const cardD = makeCard('d');

      const state = makeState({
        phase: GAME_PHASE.CARD_SELECT_DRAW,
        drawPile: [cardA, cardB, cardC, cardD],
        cardSelection: { type: 'scryCards', scryCount: 3 }
      });

      const result = combatReducer(state, {
        type: 'SELECT_CARD_FROM_PILE',
        payload: { card: cardA }
      });

      // Should still be in scry mode with reduced count
      expect(result.phase).toBe(GAME_PHASE.CARD_SELECT_DRAW);
      expect(result.cardSelection).not.toBeNull();
      expect(result.cardSelection.type).toBe('scryCards');
    });

    it('should return to combat when last scryable card is discarded', () => {
      const cardA = makeCard('a');

      const state = makeState({
        phase: GAME_PHASE.CARD_SELECT_DRAW,
        drawPile: [cardA],
        cardSelection: { type: 'scryCards', scryCount: 1 }
      });

      const result = combatReducer(state, {
        type: 'SELECT_CARD_FROM_PILE',
        payload: { card: cardA }
      });

      expect(result.phase).toBe(GAME_PHASE.COMBAT);
      expect(result.cardSelection).toBeNull();
      expect(result.discardPile.length).toBe(1);
      expect(result.drawPile.length).toBe(0);
    });

    it('should return to combat when cancel is pressed during scry', () => {
      const state = makeState({
        phase: GAME_PHASE.CARD_SELECT_DRAW,
        drawPile: [makeCard('a'), makeCard('b'), makeCard('c')],
        cardSelection: { type: 'scryCards', scryCount: 3 }
      });

      const result = combatReducer(state, { type: 'CANCEL_CARD_SELECTION' });

      expect(result.phase).toBe(GAME_PHASE.COMBAT);
      expect(result.cardSelection).toBeNull();
      // No cards discarded
      expect(result.drawPile.length).toBe(3);
    });

    it('should log scry discard action', () => {
      const cardA = makeCard('a');
      cardA.name = 'Test Card';

      const state = makeState({
        phase: GAME_PHASE.CARD_SELECT_DRAW,
        drawPile: [cardA, makeCard('b')],
        cardSelection: { type: 'scryCards', scryCount: 2 }
      });

      const result = combatReducer(state, {
        type: 'SELECT_CARD_FROM_PILE',
        payload: { card: cardA }
      });

      expect(result.combatLog.some(log => log.includes('Scry') && log.includes('Test Card'))).toBe(true);
    });

    it('should handle scryCount less than draw pile size', () => {
      const cards = [makeCard('a'), makeCard('b'), makeCard('c'), makeCard('d'), makeCard('e')];

      const state = makeState({
        phase: GAME_PHASE.CARD_SELECT_DRAW,
        drawPile: cards,
        cardSelection: { type: 'scryCards', scryCount: 2 }
      });

      // Only the first 2 cards should be selectable
      const result = combatReducer(state, {
        type: 'SELECT_CARD_FROM_PILE',
        payload: { card: cards[0] }
      });

      expect(result.discardPile.length).toBe(1);
    });
  });

  describe('GAME_PHASE', () => {
    it('should have CARD_SELECT_DRAW phase', () => {
      expect(GAME_PHASE.CARD_SELECT_DRAW).toBe('card_select_draw');
    });
  });
});
