/**
 * FIX-ARMAMENTS: Tests for Armaments card upgrade functionality
 *
 * Armaments: 1 energy, Skill
 * - Gain 5 Block
 * - Upgrade a card in hand for this combat
 *
 * Armaments+: 1 energy, Skill
 * - Gain 5 Block
 * - Upgrade ALL cards in hand for this combat
 *
 * NOTE: SELECT_CARD for non-targeting cards automatically dispatches PLAY_CARD.
 * For targeting cards, SELECT_CARD enters targeting mode and requires a separate PLAY_CARD.
 */

import { describe, it, expect, vi } from 'vitest';
import { combatReducer } from '../context/reducers/combatReducer';
import { GAME_PHASE } from '../context/GameContext';
import { getCardById, CARD_TYPES } from '../data/cards';

vi.mock('../systems/saveSystem', () => ({
  saveGame: vi.fn(),
  loadGame: vi.fn(() => null),
  deleteSave: vi.fn(),
  hasSave: vi.fn(() => false),
  autoSave: vi.fn()
}));

vi.mock('../systems/audioSystem', () => ({
  audioManager: { playSFX: vi.fn() },
  SOUNDS: { combat: { cardPlay: 'cardPlay', shivPlay: 'shivPlay', block: 'block' } }
}));

// Helper to dispatch actions
function dispatch(state, action) {
  switch (action.type) {
    case 'SELECT_CARD':
    case 'PLAY_CARD':
    case 'CANCEL_TARGET':
    case 'END_TURN':
    case 'SELECT_CARD_FROM_PILE':
    case 'CANCEL_CARD_SELECTION':
      return combatReducer(state, action);
    default:
      return state;
  }
}

describe('Armaments Card - FIX-ARMAMENTS', () => {
  const createCombatState = () => {
    const armaments = {
      ...getCardById('armaments'),
      instanceId: 'armaments_0'
    };

    const strikeCard = {
      id: 'strike',
      name: 'Strike',
      type: CARD_TYPES.ATTACK,
      cost: 1,
      damage: 6,
      description: 'Deal 6 damage.',
      upgraded: false,
      upgradedVersion: {
        damage: 9,
        description: 'Deal 9 damage.'
      },
      instanceId: 'strike_0'
    };

    const defendCard = {
      id: 'defend',
      name: 'Defend',
      type: CARD_TYPES.SKILL,
      cost: 1,
      block: 5,
      description: 'Gain 5 Block.',
      upgraded: false,
      upgradedVersion: {
        block: 8,
        description: 'Gain 8 Block.'
      },
      instanceId: 'defend_0'
    };

    return {
      phase: GAME_PHASE.COMBAT,
      player: {
        currentHp: 80,
        maxHp: 80,
        block: 0,
        energy: 3,
        strength: 0,
        dexterity: 0
      },
      enemies: [{
        id: 'cultist',
        name: 'Cultist',
        instanceId: 'enemy_0',
        currentHp: 48,
        maxHp: 48,
        block: 0
      }],
      hand: [armaments, strikeCard, defendCard],
      drawPile: [],
      discardPile: [],
      exhaustPile: [],
      deck: [],
      relics: [],
      combatLog: [],
      selectedCard: null,
      targetingMode: false,
      cardSelection: null,
      turn: 1
    };
  };

  describe('Basic Armaments (not upgraded)', () => {
    it('should have upgradeInHand special effect', () => {
      const armaments = getCardById('armaments');
      expect(armaments).toBeDefined();
      expect(armaments.special).toBe('upgradeInHand');
      expect(armaments.block).toBe(5);
      expect(armaments.cost).toBe(1);
    });

    it('should transition to CARD_SELECT_HAND phase when played', () => {
      const state = createCombatState();
      const armaments = state.hand[0];

      // SELECT_CARD on a non-targeting card automatically plays it
      const newState = dispatch(state, { type: 'SELECT_CARD', payload: { card: armaments } });

      // Should be in card selection phase
      expect(newState.phase).toBe(GAME_PHASE.CARD_SELECT_HAND);
      expect(newState.cardSelection).toBeDefined();
      expect(newState.cardSelection.type).toBe('upgradeInHand');
    });

    it('should grant 5 block when played', () => {
      const state = createCombatState();
      const armaments = state.hand[0];

      // SELECT_CARD automatically plays non-targeting cards
      const newState = dispatch(state, { type: 'SELECT_CARD', payload: { card: armaments } });

      // Block should be applied
      expect(newState.player.block).toBe(5);
    });

    it('should upgrade selected card when selection is made', () => {
      const state = createCombatState();
      const armaments = state.hand[0];
      const strikeCard = state.hand[1];

      // Play Armaments (SELECT_CARD auto-plays non-targeting cards)
      let newState = dispatch(state, { type: 'SELECT_CARD', payload: { card: armaments } });

      // Verify we're in selection phase
      expect(newState.phase).toBe(GAME_PHASE.CARD_SELECT_HAND);

      // Select Strike to upgrade
      newState = dispatch(newState, {
        type: 'SELECT_CARD_FROM_PILE',
        payload: { card: strikeCard }
      });

      // Should return to combat
      expect(newState.phase).toBe(GAME_PHASE.COMBAT);

      // Strike should be upgraded
      const upgradedStrike = newState.hand.find(c => c.id === 'strike');
      expect(upgradedStrike).toBeDefined();
      expect(upgradedStrike.upgraded).toBe(true);
      expect(upgradedStrike.name).toBe('Strike+');
      expect(upgradedStrike.damage).toBe(9);
    });

    it('should not upgrade already upgraded cards', () => {
      const state = createCombatState();

      // Make Strike already upgraded
      state.hand[1] = {
        ...state.hand[1],
        ...state.hand[1].upgradedVersion,
        upgraded: true,
        name: 'Strike+'
      };

      const armaments = state.hand[0];

      // Play Armaments
      const newState = dispatch(state, { type: 'SELECT_CARD', payload: { card: armaments } });

      // Should still enter selection phase (Defend is still upgradable)
      expect(newState.phase).toBe(GAME_PHASE.CARD_SELECT_HAND);

      // Only Defend should be upgradable (not the already-upgraded Strike)
      const upgradableCards = newState.hand.filter(c => !c.upgraded && c.upgradedVersion);
      expect(upgradableCards.length).toBe(1);
      expect(upgradableCards[0].id).toBe('defend');
    });

    it('should skip selection if no upgradable cards in hand', () => {
      const state = createCombatState();

      // Make all cards already upgraded
      state.hand = state.hand.map(card => {
        if (card.upgradedVersion) {
          return { ...card, ...card.upgradedVersion, upgraded: true, name: card.name + '+' };
        }
        return card;
      });

      const armaments = state.hand[0];

      // Play Armaments
      const newState = dispatch(state, { type: 'SELECT_CARD', payload: { card: armaments } });

      // Should return directly to combat (no selection needed)
      expect(newState.phase).toBe(GAME_PHASE.COMBAT);
      expect(newState.cardSelection).toBeNull();

      // Block should still be applied
      expect(newState.player.block).toBe(5);
    });
  });

  describe('Armaments+ (upgraded)', () => {
    const createUpgradedArmamentsState = () => {
      const armamentsBase = getCardById('armaments');
      const armamentsPlus = {
        ...armamentsBase,
        ...armamentsBase.upgradedVersion,
        upgraded: true,
        name: 'Armaments+',
        instanceId: 'armaments_0'
      };

      const strike1 = {
        id: 'strike',
        name: 'Strike',
        type: CARD_TYPES.ATTACK,
        cost: 1,
        damage: 6,
        description: 'Deal 6 damage.',
        upgraded: false,
        upgradedVersion: { damage: 9, description: 'Deal 9 damage.' },
        instanceId: 'strike_0'
      };

      const strike2 = {
        id: 'strike',
        name: 'Strike',
        type: CARD_TYPES.ATTACK,
        cost: 1,
        damage: 6,
        description: 'Deal 6 damage.',
        upgraded: false,
        upgradedVersion: { damage: 9, description: 'Deal 9 damage.' },
        instanceId: 'strike_1'
      };

      const defend = {
        id: 'defend',
        name: 'Defend',
        type: CARD_TYPES.SKILL,
        cost: 1,
        block: 5,
        description: 'Gain 5 Block.',
        upgraded: false,
        upgradedVersion: { block: 8, description: 'Gain 8 Block.' },
        instanceId: 'defend_0'
      };

      return {
        phase: GAME_PHASE.COMBAT,
        player: {
          currentHp: 80,
          maxHp: 80,
          block: 0,
          energy: 3,
          strength: 0,
          dexterity: 0
        },
        enemies: [{
          id: 'cultist',
          instanceId: 'enemy_0',
          currentHp: 48,
          maxHp: 48,
          block: 0
        }],
        hand: [armamentsPlus, strike1, strike2, defend],
        drawPile: [],
        discardPile: [],
        exhaustPile: [],
        deck: [],
        relics: [],
        combatLog: [],
        selectedCard: null,
        targetingMode: false,
        cardSelection: null,
        turn: 1
      };
    };

    it('should have upgradeAll: true in upgraded version', () => {
      const armaments = getCardById('armaments');
      expect(armaments.upgradedVersion).toBeDefined();
      expect(armaments.upgradedVersion.upgradeAll).toBe(true);
    });

    it('should upgrade ALL cards in hand when played', () => {
      const state = createUpgradedArmamentsState();
      const armamentsPlus = state.hand[0];

      // Verify initial state
      const upgradableCount = state.hand.filter(c => !c.upgraded && c.upgradedVersion).length;
      expect(upgradableCount).toBe(3); // 2 strikes + 1 defend

      // Play Armaments+
      const newState = dispatch(state, { type: 'SELECT_CARD', payload: { card: armamentsPlus } });

      // Should return to combat directly (no selection needed for upgrade all)
      expect(newState.phase).toBe(GAME_PHASE.COMBAT);
      expect(newState.cardSelection).toBeNull();

      // All upgradable cards should be upgraded
      const strikes = newState.hand.filter(c => c.id === 'strike');
      const defend = newState.hand.find(c => c.id === 'defend');

      strikes.forEach(strike => {
        expect(strike.upgraded).toBe(true);
        expect(strike.name).toBe('Strike+');
        expect(strike.damage).toBe(9);
      });

      expect(defend.upgraded).toBe(true);
      expect(defend.name).toBe('Defend+');
      expect(defend.block).toBe(8);

      // Combat log should show the upgrade
      expect(newState.combatLog.some(msg => msg.includes('Armaments+ upgraded all cards'))).toBe(true);
    });

    it('should still grant 5 block when upgrading all', () => {
      const state = createUpgradedArmamentsState();
      const armamentsPlus = state.hand[0];

      const newState = dispatch(state, { type: 'SELECT_CARD', payload: { card: armamentsPlus } });

      expect(newState.player.block).toBe(5);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty hand after Armaments is played', () => {
      const state = createCombatState();
      // Only Armaments in hand
      state.hand = [state.hand[0]];

      const armaments = state.hand[0];

      const newState = dispatch(state, { type: 'SELECT_CARD', payload: { card: armaments } });

      // Should return to combat (no cards to upgrade)
      expect(newState.phase).toBe(GAME_PHASE.COMBAT);
      expect(newState.player.block).toBe(5);
    });

    it('should handle cards without upgradedVersion property', () => {
      const state = createCombatState();

      // Add a card without upgradedVersion
      state.hand.push({
        id: 'curse_clumsy',
        name: 'Clumsy',
        type: 'curse',
        cost: -2,
        description: 'Unplayable.',
        unplayable: true,
        instanceId: 'curse_0'
        // No upgradedVersion
      });

      const armaments = state.hand[0];

      let newState = dispatch(state, { type: 'SELECT_CARD', payload: { card: armaments } });

      // Should still enter selection (Strike and Defend are upgradable)
      expect(newState.phase).toBe(GAME_PHASE.CARD_SELECT_HAND);

      // Select Strike
      const strikeCard = state.hand[1];
      newState = dispatch(newState, {
        type: 'SELECT_CARD_FROM_PILE',
        payload: { card: strikeCard }
      });

      expect(newState.phase).toBe(GAME_PHASE.COMBAT);
    });

    it('should cancel selection properly', () => {
      const state = createCombatState();
      const armaments = state.hand[0];

      let newState = dispatch(state, { type: 'SELECT_CARD', payload: { card: armaments } });

      expect(newState.phase).toBe(GAME_PHASE.CARD_SELECT_HAND);

      // Cancel selection
      newState = dispatch(newState, { type: 'CANCEL_CARD_SELECTION' });

      expect(newState.phase).toBe(GAME_PHASE.COMBAT);
      expect(newState.cardSelection).toBeNull();

      // Block should still be applied
      expect(newState.player.block).toBe(5);
    });
  });
});
