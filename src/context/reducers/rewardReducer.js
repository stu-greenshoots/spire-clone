import { GAME_PHASE } from '../GameContext';
import { audioManager, SOUNDS } from '../../systems/audioSystem';

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
      audioManager.playSFX(SOUNDS.ui.goldGain, 'ui');
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
      audioManager.playSFX(SOUNDS.ui.relicPickup, 'ui');
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

    case 'COLLECT_POTION': {
      const potion = state.combatRewards.potionReward;
      if (!potion) return state;
      const potions = [...state.potions];
      const emptySlot = potions.indexOf(null);
      if (emptySlot === -1) return state;
      potions[emptySlot] = { ...potion };
      audioManager.playSFX(SOUNDS.ui.relicPickup, 'ui');
      return {
        ...state,
        potions,
        combatRewards: {
          ...state.combatRewards,
          potionReward: null
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
