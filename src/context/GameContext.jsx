/* eslint-disable react-refresh/only-export-components */
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

const GameContext = createContext(null);

// Game phases
export const GAME_PHASE = {
  MAIN_MENU: 'main_menu',
  MAP: 'map',
  COMBAT: 'combat',
  COMBAT_REWARD: 'combat_reward',
  CARD_REWARD: 'card_reward',
  REST_SITE: 'rest_site',
  SHOP: 'shop',
  EVENT: 'event',
  GAME_OVER: 'game_over',
  VICTORY: 'victory',
  // Data editor
  DATA_EDITOR: 'data_editor',
  // Card selection sub-phases
  CARD_SELECT_HAND: 'card_select_hand',
  CARD_SELECT_DISCARD: 'card_select_discard',
  CARD_SELECT_EXHAUST: 'card_select_exhaust'
};

// Initial game state
export const createInitialState = () => ({
  phase: GAME_PHASE.MAIN_MENU,
  player: {
    maxHp: 80,
    currentHp: 80,
    block: 0,
    energy: 3,
    maxEnergy: 3,
    gold: 99,
    strength: 0,
    dexterity: 0,
    vulnerable: 0,
    weak: 0,
    frail: 0,
    artifact: 0,
    intangible: 0,
    thorns: 0,
    metallicize: 0,
    platedArmor: 0,
    regen: 0,
    hex: 0,
    flight: 0,
    barricade: false,
    berserk: 0,
    brutality: false,
    combust: null,
    corruption: false,
    darkEmbrace: false,
    demonForm: 0,
    doubleTap: 0,
    evolve: 0,
    feelNoPain: 0,
    fireBreathing: 0,
    juggernaut: 0,
    rage: 0,
    rupture: 0,
    flameBarrier: 0,
    noDrawNextTurn: false,
    noDrawThisTurn: false,
    entangle: false,
    drawReduction: 0,
    pendingBlock: 0,
    penNibActive: false,
    cardsPlayedThisTurn: 0,
    attacksPlayedThisTurn: 0,
    skillsPlayedThisTurn: 0,
    powersPlayedThisTurn: 0,
    flexStrengthLoss: 0
  },
  deck: [],
  drawPile: [],
  hand: [],
  discardPile: [],
  exhaustPile: [],
  relics: [],
  potions: [null, null, null],
  enemies: [],
  currentFloor: 0,
  act: 1,
  ascension: 0,
  map: null,
  currentNode: null,
  selectedCard: null,
  targetingMode: false,
  turn: 0,
  combatRewards: null,
  cardRewards: null,
  animation: null,
  message: null,
  combatLog: [],
  // Card selection state
  cardSelection: null, // { type: 'discardToDrawTop'|'handToDrawTop'|'upgradeInHand'|'copyCardInHand'|'retrieveExhausted', sourceCard: card }
  pendingCardPlay: null, // For cards that need selection before completing
  // Run stats tracking (for meta-progression)
  runStats: {
    cardsPlayed: 0,
    cardsPlayedById: {},
    damageDealt: 0,
    enemiesKilled: 0,
    defeatedEnemies: [], // Array of enemy IDs killed this run
    goldEarned: 0,
    floor: 0
  }
});

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

    case 'DISCARD_POTION': {
      const { slotIndex } = action.payload;
      const potion = state.potions[slotIndex];
      if (!potion) return state;
      return removePotion(state, slotIndex);
    }

    case 'DELETE_SAVE': {
      return metaReducer(state, action);
    }

    case 'UPDATE_PROGRESSION': {
      return metaReducer(state, action);
    }

    case 'LOAD_SCENARIO': {
      return metaReducer(state, action);
    }

    default:
      return state;
  }
};

// Context Provider
export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, createInitialState());

  const startGame = useCallback((ascensionLevel = 0) => {
    dispatch({ type: 'START_GAME', payload: { ascensionLevel } });
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

  const upgradeCard = useCallback((cardId) => {
    dispatch({ type: 'UPGRADE_CARD', payload: { cardId } });
  }, []);

  const skipEvent = useCallback(() => {
    dispatch({ type: 'SKIP_EVENT' });
  }, []);

  const returnToMenu = useCallback(() => {
    dispatch({ type: 'RETURN_TO_MENU' });
  }, []);

  const openDataEditor = useCallback(() => {
    dispatch({ type: 'OPEN_DATA_EDITOR' });
  }, []);

  const selectCardFromPile = useCallback((card) => {
    dispatch({ type: 'SELECT_CARD_FROM_PILE', payload: { card } });
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

  const discardPotion = useCallback((slotIndex) => {
    dispatch({ type: 'DISCARD_POTION', payload: { slotIndex } });
  }, []);

  const loadScenario = useCallback((scenario) => {
    dispatch({ type: 'LOAD_SCENARIO', payload: scenario });
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
    returnToMenu,
    openDataEditor,
    selectCardFromPile,
    cancelCardSelection,
    spawnEnemies,
    liftGirya,
    saveGameState,
    loadGameState,
    deleteSaveState,
    usePotion,
    discardPotion,
    loadScenario
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
