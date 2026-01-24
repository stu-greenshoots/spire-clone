import { GAME_PHASE } from '../GameContext';

export const rewardReducer = (state, action) => {
  switch (action.type) {
    case 'COLLECT_GOLD': {
      // Ectoplasm: cannot gain gold
      const hasEctoplasm = state.relics.some(r => r.id === 'ectoplasm');
      if (hasEctoplasm) {
        return {
          ...state,
          combatRewards: {
            ...state.combatRewards,
            gold: 0
          }
        };
      }
      return {
        ...state,
        player: {
          ...state.player,
          gold: state.player.gold + state.combatRewards.gold
        },
        combatRewards: {
          ...state.combatRewards,
          gold: 0
        }
      };
    }

    case 'COLLECT_RELIC': {
      const relic = state.combatRewards.relicReward;
      let newPlayer = { ...state.player };

      // Handle onPickup effects
      if (relic.trigger === 'onPickup') {
        if (relic.effect.type === 'maxHp') {
          newPlayer.maxHp += relic.effect.amount;
          newPlayer.currentHp += relic.effect.amount;
        }
      }

      return {
        ...state,
        player: newPlayer,
        relics: [...state.relics, relic],
        combatRewards: {
          ...state.combatRewards,
          relicReward: null
        }
      };
    }

    case 'OPEN_CARD_REWARDS': {
      return {
        ...state,
        phase: GAME_PHASE.CARD_REWARD,
        cardRewards: state.combatRewards.cardRewards
      };
    }

    case 'SELECT_CARD_REWARD': {
      const { card } = action.payload;
      return {
        ...state,
        deck: [...state.deck, { ...card, instanceId: `${card.id}_${Date.now()}` }],
        phase: GAME_PHASE.MAP,
        cardRewards: null,
        combatRewards: null
      };
    }

    case 'SKIP_CARD_REWARD': {
      return {
        ...state,
        phase: GAME_PHASE.MAP,
        cardRewards: null,
        combatRewards: null
      };
    }

    default:
      return undefined; // Not handled by this reducer
  }
};
