import { CARD_TYPES } from '../../../data/cards';
import { getPassiveRelicEffects } from '../../../systems/relicSystem';

export const handleSelectCard = (state, action, combatReducer) => {
  const { card } = action.payload;

  // X-cost cards are always playable (cost -1)
  const isXCost = card.cost === -1 || card.special === 'xCost';

  if (!isXCost && state.player.energy < card.cost) {
    return state;
  }

  if (card.unplayable) {
    return state;
  }

  // Entangle: cannot play Attack cards
  if (state.player.entangle && card.type === CARD_TYPES.ATTACK) {
    return state;
  }

  // Clash: can only play if all cards in hand are attacks
  if (card.special === 'onlyAttacks') {
    const hasNonAttack = state.hand.some(c => c.type !== CARD_TYPES.ATTACK && c.instanceId !== card.instanceId);
    if (hasNonAttack) {
      return state; // Can't play Clash
    }
  }

  // Check card limit (Velvet Choker)
  const passiveEffects = getPassiveRelicEffects(state.relics, {});
  if (state.player.cardsPlayedThisTurn >= passiveEffects.cardLimit) {
    return state;
  }

  // Check if card requires targeting
  if (card.type === CARD_TYPES.ATTACK && !card.targetAll && state.enemies.length > 1) {
    return {
      ...state,
      selectedCard: card,
      targetingMode: true
    };
  }

  // Auto-target single enemy or play non-targeting cards
  const autoTargetId = state.enemies.length > 0 ? state.enemies[0].instanceId : null;
  return combatReducer(state, {
    type: 'PLAY_CARD',
    payload: { card, targetId: autoTargetId }
  });
};

export const handleCancelTarget = (state) => {
  return {
    ...state,
    selectedCard: null,
    targetingMode: false
  };
};
