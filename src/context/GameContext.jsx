import { createContext, useContext, useReducer, useCallback } from 'react';
import {
  calculateDamage as combatCalculateDamage,
  calculateBlock as combatCalculateBlock,
  applyDamageToTarget as combatApplyDamageToTarget
} from '../systems/combatSystem';
import { canUsePotion, applyPotionEffect, removePotion } from '../systems/potionSystem';
import { shopReducer } from './reducers/shopReducer';
import { mapReducer } from './reducers/mapReducer';
import { metaReducer } from './reducers/metaReducer';
import { rewardReducer } from './reducers/rewardReducer';
import { combatReducer } from './reducers/combatReducer';
import { GAME_PHASE, createInitialState } from './constants';

// Re-export for consumers
export { GAME_PHASE, createInitialState };

const GameContext = createContext(null);

// Re-export combat calculation functions for testing (implementations in combatSystem.js)
export const calculateDamage = combatCalculateDamage;
export const calculateBlock = combatCalculateBlock;
export const applyDamageToTarget = combatApplyDamageToTarget;

// Enemy functions imported from enemySystem (getEnemyIntent, createSplitSlimes)

// Game reducer
const gameReducer = (state, action) => {
  switch (action.type) {
    case 'START_GAME': {
      return metaReducer(state, action);
    }

    case 'SELECT_NODE': {
      return mapReducer(state, action);
    }

    case 'SELECT_CARD': {
      return combatReducer(state, action);
    }

    case 'PLAY_CARD': {
      return combatReducer(state, action);
    }

    case 'CANCEL_TARGET': {
      return combatReducer(state, action);
    }

    case 'END_TURN': {
      return combatReducer(state, action);
    }

    case 'COLLECT_GOLD': {
      return rewardReducer(state, action);
    }

    case 'LEAVE_SHOP': {
      return shopReducer(state, action);
    }

    case 'COLLECT_RELIC': {
      return rewardReducer(state, action);
    }

    case 'OPEN_CARD_REWARDS': {
      return rewardReducer(state, action);
    }

    case 'SELECT_CARD_REWARD': {
      return rewardReducer(state, action);
    }

    case 'SKIP_CARD_REWARD': {
      return rewardReducer(state, action);
    }

    case 'PROCEED_TO_MAP': {
      return mapReducer(state, action);
    }

    case 'REST': {
      return metaReducer(state, action);
    }

    case 'UPGRADE_CARD': {
      return metaReducer(state, action);
    }

    case 'SKIP_EVENT': {
      return metaReducer(state, action);
    }

    case 'APPLY_EVENT_CHOICE': {
      return metaReducer(state, action);
    }

    case 'DISCARD_POTION': {
      const { slotIndex } = action.payload;
      const newPotions = [...state.potions];
      newPotions[slotIndex] = null;
      return { ...state, potions: newPotions };
    }

    case 'RETURN_TO_MENU': {
      return metaReducer(state, action);
    }

    case 'OPEN_DATA_EDITOR': {
      return metaReducer(state, action);
    }

    case 'SELECT_CARD_FROM_PILE':
      return combatReducer(state, action);

    case 'CANCEL_CARD_SELECTION':
      return combatReducer(state, action);

    case 'SPAWN_ENEMIES':
      return combatReducer(state, action);

    case 'LIFT_GIRYA': {
      return metaReducer(state, action);
    }

    case 'SAVE_GAME': {
      return metaReducer(state, action);
    }

    case 'LOAD_GAME': {
      return metaReducer(state, action);
    }

    case 'USE_POTION': {
      const { slotIndex, targetIndex } = action.payload;
      const potion = state.potions[slotIndex];
      if (!potion) return state;
      if (!canUsePotion(potion, state)) return state;

      let newState = applyPotionEffect(potion, state, targetIndex);
      newState = removePotion(newState, slotIndex);
      return newState;
    }

    case 'DELETE_SAVE': {
      return metaReducer(state, action);
    }

    default:
      return state;
  }
};

// Context Provider
export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, createInitialState());

  const startGame = useCallback(() => {
    dispatch({ type: 'START_GAME' });
  }, []);

  const selectNode = useCallback((nodeId) => {
    dispatch({ type: 'SELECT_NODE', payload: { nodeId } });
  }, []);

  const selectCard = useCallback((card) => {
    dispatch({ type: 'SELECT_CARD', payload: { card } });
  }, []);

  const playCard = useCallback((card, targetId) => {
    dispatch({ type: 'PLAY_CARD', payload: { card, targetId } });
  }, []);

  const cancelTarget = useCallback(() => {
    dispatch({ type: 'CANCEL_TARGET' });
  }, []);

  const endTurn = useCallback(() => {
    dispatch({ type: 'END_TURN' });
  }, []);

  const collectGold = useCallback(() => {
    dispatch({ type: 'COLLECT_GOLD' });
  }, []);

  const collectRelic = useCallback(() => {
    dispatch({ type: 'COLLECT_RELIC' });
  }, []);

  const openCardRewards = useCallback(() => {
    dispatch({ type: 'OPEN_CARD_REWARDS' });
  }, []);

  const selectCardReward = useCallback((card) => {
    dispatch({ type: 'SELECT_CARD_REWARD', payload: { card } });
  }, []);

  const skipCardReward = useCallback(() => {
    dispatch({ type: 'SKIP_CARD_REWARD' });
  }, []);

  const proceedToMap = useCallback(() => {
    dispatch({ type: 'PROCEED_TO_MAP' });
  }, []);

  const leaveShop = useCallback((gold, deck, relics) => {
    dispatch({ type: 'LEAVE_SHOP', payload: { gold, deck, relics } });
  }, []);

  const rest = useCallback(() => {
    dispatch({ type: 'REST' });
  }, []);

  const upgradeCard = useCallback((cardIndex) => {
    dispatch({ type: 'UPGRADE_CARD', payload: { cardIndex } });
  }, []);

  const skipEvent = useCallback(() => {
    dispatch({ type: 'SKIP_EVENT' });
  }, []);

  const applyEventChoice = useCallback((effects) => {
    dispatch({ type: 'APPLY_EVENT_CHOICE', payload: { effects } });
  }, []);

  const discardPotion = useCallback((slotIndex) => {
    dispatch({ type: 'DISCARD_POTION', payload: { slotIndex } });
  }, []);

  const returnToMenu = useCallback(() => {
    dispatch({ type: 'RETURN_TO_MENU' });
  }, []);

  const openDataEditor = useCallback(() => {
    dispatch({ type: 'OPEN_DATA_EDITOR' });
  }, []);

  const selectCardFromPile = useCallback((card, index) => {
    dispatch({ type: 'SELECT_CARD_FROM_PILE', payload: { card, index } });
  }, []);

  const cancelCardSelection = useCallback(() => {
    dispatch({ type: 'CANCEL_CARD_SELECTION' });
  }, []);

  const spawnEnemies = useCallback((enemies) => {
    dispatch({ type: 'SPAWN_ENEMIES', payload: { enemies } });
  }, []);

  const liftGirya = useCallback(() => {
    dispatch({ type: 'LIFT_GIRYA' });
  }, []);

  const saveGameState = useCallback(() => {
    dispatch({ type: 'SAVE_GAME' });
  }, []);

  const loadGameState = useCallback(() => {
    dispatch({ type: 'LOAD_GAME' });
  }, []);

  const deleteSaveState = useCallback(() => {
    dispatch({ type: 'DELETE_SAVE' });
  }, []);

  const usePotion = useCallback((slotIndex, targetIndex = null) => {
    dispatch({ type: 'USE_POTION', payload: { slotIndex, targetIndex } });
  }, []);

  const value = {
    state,
    startGame,
    selectNode,
    selectCard,
    playCard,
    cancelTarget,
    endTurn,
    collectGold,
    collectRelic,
    openCardRewards,
    selectCardReward,
    skipCardReward,
    proceedToMap,
    leaveShop,
    rest,
    upgradeCard,
    skipEvent,
    applyEventChoice,
    discardPotion,
    returnToMenu,
    openDataEditor,
    selectCardFromPile,
    cancelCardSelection,
    spawnEnemies,
    liftGirya,
    saveGameState,
    loadGameState,
    deleteSaveState,
    usePotion
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
