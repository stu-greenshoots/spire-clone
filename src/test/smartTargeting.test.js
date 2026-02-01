import { describe, it, expect } from 'vitest';
import { handleSelectCard } from '../context/reducers/combat/selectCardAction';
import { CARD_TYPES } from '../data/cards';

describe('Smart Card Targeting (UX-12)', () => {
  const makeEnemy = (id) => ({ instanceId: `enemy_${id}`, name: `Enemy ${id}`, currentHp: 50, maxHp: 50 });

  const baseState = {
    player: { energy: 3, cardsPlayedThisTurn: 0, entangle: 0 },
    hand: [],
    enemies: [makeEnemy(1), makeEnemy(2)],
    relics: [],
    selectedCard: null,
    targetingMode: false
  };

  const mockReducer = (state, action) => {
    if (action.type === 'PLAY_CARD') {
      return { ...state, cardPlayed: action.payload };
    }
    return state;
  };

  describe('Non-targeting cards auto-play immediately', () => {
    it('skill card auto-plays without entering targeting mode', () => {
      const card = { instanceId: 'c1', type: CARD_TYPES.SKILL, cost: 1 };
      const result = handleSelectCard(baseState, { payload: { card } }, mockReducer);
      expect(result.targetingMode).toBeFalsy();
      expect(result.cardPlayed).toBeDefined();
      expect(result.cardPlayed.card).toBe(card);
    });

    it('power card auto-plays without entering targeting mode', () => {
      const card = { instanceId: 'c2', type: CARD_TYPES.POWER, cost: 2 };
      const result = handleSelectCard(baseState, { payload: { card } }, mockReducer);
      expect(result.targetingMode).toBeFalsy();
      expect(result.cardPlayed).toBeDefined();
    });

    it('target-all attack auto-plays without targeting mode', () => {
      const card = { instanceId: 'c3', type: CARD_TYPES.ATTACK, cost: 1, targetAll: true };
      const result = handleSelectCard(baseState, { payload: { card } }, mockReducer);
      expect(result.targetingMode).toBeFalsy();
      expect(result.cardPlayed).toBeDefined();
    });

    it('single-enemy attack auto-plays without targeting mode', () => {
      const singleEnemyState = { ...baseState, enemies: [makeEnemy(1)] };
      const card = { instanceId: 'c4', type: CARD_TYPES.ATTACK, cost: 1 };
      const result = handleSelectCard(singleEnemyState, { payload: { card } }, mockReducer);
      expect(result.targetingMode).toBeFalsy();
      expect(result.cardPlayed).toBeDefined();
    });
  });

  describe('Targeted attacks enter targeting mode', () => {
    it('attack card with multiple enemies enters targeting mode', () => {
      const card = { instanceId: 'c5', type: CARD_TYPES.ATTACK, cost: 1 };
      const result = handleSelectCard(baseState, { payload: { card } }, mockReducer);
      expect(result.targetingMode).toBe(true);
      expect(result.selectedCard).toBe(card);
      expect(result.cardPlayed).toBeUndefined();
    });
  });

  describe('Card playability guards', () => {
    it('rejects card when not enough energy', () => {
      const lowEnergyState = { ...baseState, player: { ...baseState.player, energy: 0 } };
      const card = { instanceId: 'c6', type: CARD_TYPES.SKILL, cost: 1 };
      const result = handleSelectCard(lowEnergyState, { payload: { card } }, mockReducer);
      expect(result).toBe(lowEnergyState); // unchanged
    });

    it('allows X-cost cards with zero energy', () => {
      const lowEnergyState = { ...baseState, player: { ...baseState.player, energy: 0 } };
      const card = { instanceId: 'c7', type: CARD_TYPES.SKILL, cost: -1, special: 'xCost' };
      const result = handleSelectCard(lowEnergyState, { payload: { card } }, mockReducer);
      expect(result.cardPlayed).toBeDefined();
    });

    it('rejects unplayable cards', () => {
      const card = { instanceId: 'c8', type: CARD_TYPES.SKILL, cost: 0, unplayable: true };
      const result = handleSelectCard(baseState, { payload: { card } }, mockReducer);
      expect(result).toBe(baseState);
    });

    it('rejects attack cards when entangled', () => {
      const entangledState = { ...baseState, player: { ...baseState.player, entangle: 1 } };
      const card = { instanceId: 'c9', type: CARD_TYPES.ATTACK, cost: 1 };
      const result = handleSelectCard(entangledState, { payload: { card } }, mockReducer);
      expect(result).toBe(entangledState);
    });
  });
});
