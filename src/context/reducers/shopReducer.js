import { GAME_PHASE } from '../GameContext';

export const shopReducer = (state, action) => {
  switch (action.type) {
    case 'LEAVE_SHOP': {
      const { gold: shopGold, deck: shopDeck, relics: shopRelics, potions: shopPotions } = action.payload;
      return {
        ...state,
        player: {
          ...state.player,
          gold: shopGold
        },
        deck: shopDeck,
        relics: shopRelics,
        ...(shopPotions ? { potions: shopPotions } : {}),
        phase: GAME_PHASE.MAP
      };
    }

    default:
      return undefined; // Not handled by this reducer
  }
};
