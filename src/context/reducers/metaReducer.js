import { GAME_PHASE } from '../GameContext';
import { getStarterDeck, getCardById } from '../../data/cards';
import { getStarterRelic, getRelicById } from '../../data/relics';
import { getPotionById } from '../../data/potions';
import { generateMap } from '../../utils/mapGenerator';
import { saveGame, loadGame, deleteSave } from '../../systems/saveSystem';
import { getPassiveRelicEffects } from '../../systems/relicSystem';
import { createInitialState } from '../GameContext';

/**
 * Reconstruct a full card object from its serialized form.
 * @param {{ id: string, instanceId?: string, upgraded?: boolean }} savedCard
 * @param {number} index - fallback for instanceId
 * @returns {Object|null} Full card object or null if not found
 */
const deserializeCard = (savedCard, index) => {
  if (!savedCard || !savedCard.id) return null;
  const baseCard = getCardById(savedCard.id);
  if (!baseCard) return null;

  let card = { ...baseCard };

  // Apply upgrade if it was upgraded when saved
  if (savedCard.upgraded && baseCard.upgradedVersion) {
    card = {
      ...card,
      ...baseCard.upgradedVersion,
      upgraded: true,
      name: baseCard.name + '+'
    };
  }

  card.instanceId = savedCard.instanceId || `${savedCard.id}_${index}`;
  return card;
};

/**
 * Reconstruct a full relic object from its serialized form.
 * @param {{ id: string, counter?: number, liftCount?: number, used?: boolean, usesRemaining?: number, usedThisCombat?: boolean }} savedRelic
 * @returns {Object|null} Full relic object or null if not found
 */
const deserializeRelic = (savedRelic) => {
  if (!savedRelic || !savedRelic.id) return null;
  const baseRelic = getRelicById(savedRelic.id);
  if (!baseRelic) return null;

  const relic = { ...baseRelic };
  // Restore runtime state
  if (savedRelic.counter !== undefined) relic.counter = savedRelic.counter;
  if (savedRelic.liftCount !== undefined) relic.liftCount = savedRelic.liftCount;
  if (savedRelic.used !== undefined) relic.used = savedRelic.used;
  if (savedRelic.usesRemaining !== undefined) relic.usesRemaining = savedRelic.usesRemaining;
  if (savedRelic.usedThisCombat !== undefined) relic.usedThisCombat = savedRelic.usedThisCombat;
  return relic;
};

/**
 * Reconstruct a full potion object from its serialized form.
 * @param {{ id: string }} savedPotion
 * @returns {Object|null} Full potion object or null if not found
 */
const deserializePotion = (savedPotion) => {
  if (!savedPotion || !savedPotion.id) return null;
  return getPotionById(savedPotion.id) || null;
};

export const metaReducer = (state, action) => {
  switch (action.type) {
    case 'START_GAME': {
      // Delete any existing save when starting new game
      deleteSave();
      const deck = getStarterDeck();
      const starterRelic = getStarterRelic();
      const map = generateMap(1);

      return {
        ...createInitialState(),
        phase: GAME_PHASE.MAP,
        deck,
        relics: [starterRelic],
        map,
        currentFloor: -1
      };
    }

    case 'REST': {
      let healAmount = Math.floor(state.player.maxHp * 0.3);

      // Eternal Feather: heal 3 HP for every 5 cards in deck
      const eternalFeather = state.relics.find(r => r.id === 'eternal_feather');
      if (eternalFeather) {
        healAmount += Math.floor(state.deck.length / 5) * 3;
      }

      // Magic Flower: 50% more healing
      const passiveEffects = getPassiveRelicEffects(state.relics, {});
      healAmount = Math.floor(healAmount * passiveEffects.healingMultiplier);

      const newState = {
        ...state,
        player: {
          ...state.player,
          currentHp: Math.min(state.player.maxHp, state.player.currentHp + healAmount)
        },
        phase: GAME_PHASE.MAP
      };
      // Auto-save after resting
      saveGame(newState);
      return newState;
    }

    case 'UPGRADE_CARD': {
      const { cardId } = action.payload;
      const card = state.deck.find(c => c.instanceId === cardId);
      if (!card || card.upgraded || !card.upgradedVersion) {
        const noUpgradeState = {
          ...state,
          phase: GAME_PHASE.MAP
        };
        saveGame(noUpgradeState);
        return noUpgradeState;
      }

      const upgradedCard = {
        ...card,
        ...card.upgradedVersion,
        upgraded: true,
        name: card.name + '+'
      };

      const newDeck = state.deck.map(c =>
        c.instanceId === cardId ? upgradedCard : c
      );

      const upgradeState = {
        ...state,
        deck: newDeck,
        phase: GAME_PHASE.MAP
      };
      // Auto-save after upgrading
      saveGame(upgradeState);
      return upgradeState;
    }

    case 'SKIP_EVENT': {
      const skipState = {
        ...state,
        phase: GAME_PHASE.MAP
      };
      // Auto-save after skipping event
      saveGame(skipState);
      return skipState;
    }

    case 'RETURN_TO_MENU': {
      return createInitialState();
    }

    case 'OPEN_DATA_EDITOR': {
      return { ...createInitialState(), phase: GAME_PHASE.DATA_EDITOR };
    }

    case 'LIFT_GIRYA': {
      const girya = state.relics.find(r => r.id === 'girya');
      if (!girya || girya.liftCount >= 3) {
        return { ...state, phase: GAME_PHASE.MAP };
      }

      const newRelics = state.relics.map(r => {
        if (r.id === 'girya') {
          return { ...r, liftCount: (r.liftCount || 0) + 1 };
        }
        return r;
      });

      return {
        ...state,
        player: {
          ...state.player,
          strength: state.player.strength + 1
        },
        relics: newRelics,
        phase: GAME_PHASE.MAP
      };
    }

    case 'SAVE_GAME': {
      saveGame(state);
      return state;
    }

    case 'LOAD_GAME': {
      const saveData = loadGame();
      if (!saveData) return state;

      // Reconstruct deck from serialized card data
      const deck = (saveData.deck || [])
        .map((savedCard, index) => deserializeCard(savedCard, index))
        .filter(Boolean);

      // Reconstruct relics from serialized relic data
      const relics = (saveData.relics || [])
        .map(savedRelic => deserializeRelic(savedRelic))
        .filter(Boolean);

      // Reconstruct potions from serialized potion data
      const potions = (saveData.potions || [])
        .map(savedPotion => deserializePotion(savedPotion))
        .filter(Boolean);

      return {
        ...createInitialState(),
        phase: GAME_PHASE.MAP,
        player: {
          ...createInitialState().player,
          currentHp: saveData.player.currentHp,
          maxHp: saveData.player.maxHp,
          gold: saveData.player.gold,
          strength: saveData.player.strength || 0,
          dexterity: saveData.player.dexterity || 0,
        },
        deck,
        relics,
        potions,
        map: saveData.map,
        currentNode: saveData.currentNode,
        currentFloor: saveData.currentFloor,
        act: saveData.act,
        ascension: saveData.ascension || 0,
      };
    }

    case 'DELETE_SAVE': {
      deleteSave();
      return state;
    }

    default:
      return undefined; // Not handled by this reducer
  }
};
