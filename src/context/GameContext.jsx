/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useReducer, useCallback, useState } from 'react';
import {
  calculateDamage as combatCalculateDamage,
  calculateBlock as combatCalculateBlock,
  applyDamageToTarget as combatApplyDamageToTarget
} from '../systems/combatSystem';
import { canUsePotion, applyPotionEffect, removePotion } from '../systems/potionSystem';
import { audioManager, SOUNDS } from '../systems/audioSystem';
import { validateAndCorrectState } from '../systems/stateValidator';
import { recordActionTiming } from '../systems/performanceMonitor';
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
  COMBAT_VICTORY: 'combat_victory', // Transitional phase — death animations play before rewards
  COMBAT_REWARD: 'combat_reward',
  CARD_REWARD: 'card_reward',
  REST_SITE: 'rest_site',
  SHOP: 'shop',
  EVENT: 'event',
  GAME_OVER: 'game_over',
  VICTORY: 'victory',
  CHARACTER_SELECT: 'character_select',
  STARTING_BONUS: 'starting_bonus',
  // Data editor
  DATA_EDITOR: 'data_editor',
  // Card selection sub-phases
  CARD_SELECT_HAND: 'card_select_hand',
  CARD_SELECT_DISCARD: 'card_select_discard',
  CARD_SELECT_EXHAUST: 'card_select_exhaust',
  CARD_SELECT_DRAW: 'card_select_draw',
  // Endless mode
  ENDLESS_TRANSITION: 'endless_transition'
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
    confused: 0,
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
    flexStrengthLoss: 0,
    // Orb system (Defect)
    orbs: [],
    orbSlots: 0,
    focus: 0,
    // Stance system (Watcher)
    currentStance: null, // null | 'calm' | 'wrath' | 'divinity'
    mantra: 0
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
  },
  // Daily challenge state (null when not in a daily challenge)
  dailyChallenge: null,
  // Character ID (e.g., 'ironclad', 'silent')
  character: null,
  // Endless mode state
  endlessMode: false,
  endlessLoop: 0,
  // Custom seeded run (null when not seeded)
  customSeed: null
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

    case 'SELECT_CHARACTER': {
      return metaReducer(state, action);
    }

    case 'START_DAILY_CHALLENGE': {
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

    case 'COLLECT_POTION': {
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

      audioManager.playSFX(SOUNDS.combat.potionUse, 'combat');
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

    case 'SELECT_STARTING_BONUS': {
      return metaReducer(state, action);
    }

    case 'LOAD_SCENARIO': {
      return metaReducer(state, action);
    }

    case 'DISMISS_ACHIEVEMENT_TOAST': {
      return metaReducer(state, action);
    }

    case 'ENTER_ENDLESS': {
      return mapReducer(state, action);
    }

    case 'SHOW_COMBAT_REWARDS': {
      // Transition from COMBAT_VICTORY to COMBAT_REWARD
      // Called after death animations complete
      if (state.phase === GAME_PHASE.COMBAT_VICTORY) {
        return { ...state, phase: GAME_PHASE.COMBAT_REWARD };
      }

      // Idempotent: allow repeat calls when already in COMBAT_REWARD (prevents race conditions)
      if (state.phase === GAME_PHASE.COMBAT_REWARD) {
        return state;
      }

      // Defensive check: detect invalid phase transitions in dev mode
      if (import.meta.env?.DEV) {
        console.warn(`[Phase Transition Error] SHOW_COMBAT_REWARDS dispatched in invalid phase: ${state.phase}`);
        console.warn(`Expected: COMBAT_VICTORY or COMBAT_REWARD`);
        console.warn(`Current enemies: ${state.enemies?.length || 0}, combatRewards: ${state.combatRewards ? 'present' : 'missing'}`);
        console.warn(`This indicates a timing bug or incorrect action dispatch sequence.`);
      }

      // Defensive: do not transition from invalid phases
      return state;
    }

    default:
      return state;
  }
};

// Wrapping reducer that validates state after each action (dev mode only)
const isDev = typeof import.meta !== 'undefined' && import.meta.env?.DEV;

const validatingReducer = (state, action) => {
  // Record timing in dev mode (QR-14)
  const start = isDev ? performance.now() : 0;
  const newState = gameReducer(state, action);
  if (isDev) {
    const end = performance.now();
    recordActionTiming(action.type, end - start);
  }

  // Only validate in dev mode to avoid performance impact in production
  if (isDev) {
    // Skip validation for high-frequency/UI-only actions that don't change game state
    const skipValidationActions = [
      'SELECT_CARD',      // Card hover/selection (UI only)
      'CANCEL_TARGET',    // Cancel targeting mode (UI only)
    ];
    if (!skipValidationActions.includes(action.type)) {
      try {
        return validateAndCorrectState(newState, action.type);
      } catch (error) {
        // Only swallow validation errors (which have already been logged)
        // Re-throw unexpected JavaScript errors (TypeError, ReferenceError, etc.)
        if (error.message?.includes('State validation failed')) {
          return newState;
        }
        throw error;
      }
    }
  }

  return newState;
};

// Context Provider
export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(validatingReducer, createInitialState());

  // Track last action for DevOverlay (QR-04)
  const [lastAction, setLastAction] = useState(null);
  const wrappedDispatch = useCallback((action) => {
    setLastAction(action);
    dispatch(action);
  }, []);

  const startGame = useCallback((ascensionLevel = 0) => {
    wrappedDispatch({ type: 'START_GAME', payload: { ascensionLevel } });
  }, [wrappedDispatch]);

  const selectCharacter = useCallback((characterId, customSeed = null) => {
    wrappedDispatch({ type: 'SELECT_CHARACTER', payload: { characterId, customSeed } });
  }, [wrappedDispatch]);

  const startDailyChallenge = useCallback((challenge) => {
    wrappedDispatch({ type: 'START_DAILY_CHALLENGE', payload: challenge });
  }, [wrappedDispatch]);

  const selectNode = useCallback((nodeId) => {
    wrappedDispatch({ type: 'SELECT_NODE', payload: { nodeId } });
  }, [wrappedDispatch]);

  const selectCard = useCallback((card) => {
    wrappedDispatch({ type: 'SELECT_CARD', payload: { card } });
  }, [wrappedDispatch]);

  const playCard = useCallback((card, targetId) => {
    wrappedDispatch({ type: 'PLAY_CARD', payload: { card, targetId } });
  }, [wrappedDispatch]);

  const cancelTarget = useCallback(() => {
    wrappedDispatch({ type: 'CANCEL_TARGET' });
  }, [wrappedDispatch]);

  const endTurn = useCallback(() => {
    wrappedDispatch({ type: 'END_TURN' });
  }, [wrappedDispatch]);

  const collectGold = useCallback(() => {
    wrappedDispatch({ type: 'COLLECT_GOLD' });
  }, [wrappedDispatch]);

  const collectRelic = useCallback(() => {
    wrappedDispatch({ type: 'COLLECT_RELIC' });
  }, [wrappedDispatch]);

  const collectPotion = useCallback(() => {
    wrappedDispatch({ type: 'COLLECT_POTION' });
  }, [wrappedDispatch]);

  const openCardRewards = useCallback(() => {
    wrappedDispatch({ type: 'OPEN_CARD_REWARDS' });
  }, [wrappedDispatch]);

  const selectCardReward = useCallback((card) => {
    wrappedDispatch({ type: 'SELECT_CARD_REWARD', payload: { card } });
  }, [wrappedDispatch]);

  const skipCardReward = useCallback(() => {
    wrappedDispatch({ type: 'SKIP_CARD_REWARD' });
  }, [wrappedDispatch]);

  const proceedToMap = useCallback(() => {
    wrappedDispatch({ type: 'PROCEED_TO_MAP' });
  }, [wrappedDispatch]);

  const leaveShop = useCallback((gold, deck, relics, potions) => {
    wrappedDispatch({ type: 'LEAVE_SHOP', payload: { gold, deck, relics, potions } });
  }, [wrappedDispatch]);

  const rest = useCallback(() => {
    wrappedDispatch({ type: 'REST' });
  }, [wrappedDispatch]);

  const upgradeCard = useCallback((cardId) => {
    wrappedDispatch({ type: 'UPGRADE_CARD', payload: { cardId } });
  }, [wrappedDispatch]);

  const skipEvent = useCallback(() => {
    wrappedDispatch({ type: 'SKIP_EVENT' });
  }, [wrappedDispatch]);

  const updateProgression = useCallback((won, causeOfDeath = null) => {
    wrappedDispatch({ type: 'UPDATE_PROGRESSION', payload: { won, causeOfDeath } });
  }, [wrappedDispatch]);

  const returnToMenu = useCallback(() => {
    wrappedDispatch({ type: 'RETURN_TO_MENU' });
  }, [wrappedDispatch]);

  const openDataEditor = useCallback(() => {
    wrappedDispatch({ type: 'OPEN_DATA_EDITOR' });
  }, [wrappedDispatch]);

  const selectCardFromPile = useCallback((card) => {
    wrappedDispatch({ type: 'SELECT_CARD_FROM_PILE', payload: { card } });
  }, [wrappedDispatch]);

  const cancelCardSelection = useCallback(() => {
    wrappedDispatch({ type: 'CANCEL_CARD_SELECTION' });
  }, [wrappedDispatch]);

  const spawnEnemies = useCallback((enemies) => {
    wrappedDispatch({ type: 'SPAWN_ENEMIES', payload: { enemies } });
  }, [wrappedDispatch]);

  const liftGirya = useCallback(() => {
    wrappedDispatch({ type: 'LIFT_GIRYA' });
  }, [wrappedDispatch]);

  const saveGameState = useCallback(() => {
    wrappedDispatch({ type: 'SAVE_GAME' });
  }, [wrappedDispatch]);

  const loadGameState = useCallback(() => {
    wrappedDispatch({ type: 'LOAD_GAME' });
  }, [wrappedDispatch]);

  const deleteSaveState = useCallback(() => {
    wrappedDispatch({ type: 'DELETE_SAVE' });
  }, [wrappedDispatch]);

  const usePotion = useCallback((slotIndex, targetIndex = null) => {
    wrappedDispatch({ type: 'USE_POTION', payload: { slotIndex, targetIndex } });
  }, [wrappedDispatch]);

  const discardPotion = useCallback((slotIndex) => {
    wrappedDispatch({ type: 'DISCARD_POTION', payload: { slotIndex } });
  }, [wrappedDispatch]);

  const selectStartingBonus = useCallback((bonusId) => {
    wrappedDispatch({ type: 'SELECT_STARTING_BONUS', payload: { bonusId } });
  }, [wrappedDispatch]);

  const enterEndless = useCallback(() => {
    wrappedDispatch({ type: 'ENTER_ENDLESS' });
  }, [wrappedDispatch]);

  const loadScenario = useCallback((scenario) => {
    wrappedDispatch({ type: 'LOAD_SCENARIO', payload: scenario });
  }, [wrappedDispatch]);

  const dismissAchievementToast = useCallback(() => {
    wrappedDispatch({ type: 'DISMISS_ACHIEVEMENT_TOAST' });
  }, [wrappedDispatch]);

  const showCombatRewards = useCallback(() => {
    wrappedDispatch({ type: 'SHOW_COMBAT_REWARDS' });
  }, [wrappedDispatch]);

  const value = {
    state,
    lastAction,
    startGame,
    selectCharacter,
    startDailyChallenge,
    selectNode,
    selectCard,
    playCard,
    cancelTarget,
    endTurn,
    collectGold,
    collectRelic,
    collectPotion,
    openCardRewards,
    selectCardReward,
    skipCardReward,
    proceedToMap,
    leaveShop,
    rest,
    upgradeCard,
    skipEvent,
    updateProgression,
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
    selectStartingBonus,
    enterEndless,
    loadScenario,
    dismissAchievementToast,
    showCombatRewards
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
