import { describe, it, expect } from 'vitest';
import { combatReducer } from '../context/reducers/combatReducer';
import { GAME_PHASE } from '../context/GameContext';

/**
 * FIX-03: Verifies that exhaust triggers (Dark Embrace, Feel No Pain, Dead Branch)
 * fire correctly when cards are exhausted via card selection (exhaustChoose).
 * Previously, the inline exhaust handling in combatReducer was missing the
 * Dead Branch trigger and didn't properly pass hand context.
 */
describe('Card Effect Context - Exhaust Triggers via Card Selection', () => {
  const baseState = {
    phase: GAME_PHASE.COMBAT,
    player: { block: 0, darkEmbrace: false, feelNoPain: 0 },
    hand: [
      { id: 'strike', instanceId: 'strike_0', name: 'Strike', type: 'attack' },
      { id: 'defend', instanceId: 'defend_0', name: 'Defend', type: 'skill' }
    ],
    drawPile: [{ id: 'bash', instanceId: 'bash_0', name: 'Bash' }],
    discardPile: [],
    exhaustPile: [],
    relics: [],
    enemies: [{ id: 'test', currentHp: 50, maxHp: 50 }],
    combatLog: [],
    cardSelection: { type: 'exhaustChoose' }
  };

  it('should trigger Dead Branch when exhausting via card selection', () => {
    const state = {
      ...baseState,
      relics: [{ id: 'dead_branch' }]
    };

    const result = combatReducer(state, {
      type: 'SELECT_CARD_FROM_PILE',
      payload: { card: state.hand[0] }
    });

    // Dead Branch should add a random card to hand
    // Original hand had 2, we exhausted 1 (leaving 1), Dead Branch adds 1 = 2
    expect(result.hand.length).toBe(2);
    expect(result.exhaustPile.length).toBe(1);
    expect(result.exhaustPile[0].id).toBe('strike');
    expect(result.combatLog.some(msg => msg.includes('Dead Branch'))).toBe(true);
  });

  it('should trigger Dark Embrace when exhausting via card selection', () => {
    const state = {
      ...baseState,
      player: { ...baseState.player, darkEmbrace: true }
    };

    const result = combatReducer(state, {
      type: 'SELECT_CARD_FROM_PILE',
      payload: { card: state.hand[0] }
    });

    // Dark Embrace draws from draw pile: hand was 2, exhaust 1 = 1, draw 1 = 2
    expect(result.hand.length).toBe(2);
    expect(result.drawPile.length).toBe(0);
  });

  it('should trigger Feel No Pain when exhausting via card selection', () => {
    const state = {
      ...baseState,
      player: { ...baseState.player, feelNoPain: 4 }
    };

    const result = combatReducer(state, {
      type: 'SELECT_CARD_FROM_PILE',
      payload: { card: state.hand[0] }
    });

    expect(result.player.block).toBe(4);
  });

  it('should trigger all exhaust effects together', () => {
    const state = {
      ...baseState,
      player: { ...baseState.player, darkEmbrace: true, feelNoPain: 3 },
      relics: [{ id: 'dead_branch' }]
    };

    const result = combatReducer(state, {
      type: 'SELECT_CARD_FROM_PILE',
      payload: { card: state.hand[0] }
    });

    // Exhaust 1 from hand (2->1), Dark Embrace draws 1 (1->2), Dead Branch adds 1 (2->3)
    expect(result.hand.length).toBe(3);
    expect(result.player.block).toBe(3);
    expect(result.drawPile.length).toBe(0);
    expect(result.exhaustPile.length).toBe(1);
  });

  it('should not crash when exhausting with empty draw pile and Dead Branch', () => {
    const state = {
      ...baseState,
      drawPile: [],
      relics: [{ id: 'dead_branch' }]
    };

    const result = combatReducer(state, {
      type: 'SELECT_CARD_FROM_PILE',
      payload: { card: state.hand[0] }
    });

    // Hand: 2 - 1 exhausted + 1 from Dead Branch = 2
    expect(result.hand.length).toBe(2);
    expect(result.exhaustPile.length).toBe(1);
  });
});
