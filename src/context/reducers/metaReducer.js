import { GAME_PHASE } from '../GameContext';
import { getStarterDeck, getCardById, getRandomCard, RARITY } from '../../data/cards';
import { getCharacterById } from '../../data/characters';
import { getStarterRelic, getRelicById, getRandomRelic, RELIC_RARITY } from '../../data/relics';
import { getPotionById } from '../../data/potions';
import { getEnemyById, createEnemyInstance } from '../../data/enemies';
import { getEnemyIntent } from '../../systems/enemySystem';
import { generateMap } from '../../utils/mapGenerator';
import { saveGame, loadGame, deleteSave, addRunToHistory } from '../../systems/saveSystem';
import { getPassiveRelicEffects } from '../../systems/relicSystem';
import { createInitialState } from '../GameContext';
import { loadProgression, updateRunStats, saveProgression } from '../../systems/progressionSystem';
import { getAscensionStartGold } from '../../systems/ascensionSystem';
import { applyDailyChallengeModifiers } from '../../systems/dailyChallengeSystem';
import { audioManager, SOUNDS } from '../../systems/audioSystem';
import { SeededRNG, stringToSeed } from '../../utils/seededRandom';

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
      const ascensionLevel = action.payload?.ascensionLevel || 0;

      return {
        ...createInitialState(),
        phase: GAME_PHASE.CHARACTER_SELECT,
        ascension: ascensionLevel
      };
    }

    case 'SELECT_CHARACTER': {
      const { characterId, customSeed } = action.payload;
      const ascensionLevel = state.ascension || 0;
      const deck = getStarterDeck(characterId);
      const starterRelic = getStarterRelic(characterId);

      // Create seeded RNG for map generation if custom seed provided
      const seedRng = customSeed ? new SeededRNG(stringToSeed(customSeed)) : null;
      const map = generateMap(1, seedRng);
      const character = getCharacterById(characterId);

      // Apply ascension starting gold modifier (Ascension 6+)
      const startingGold = getAscensionStartGold(ascensionLevel);

      // Apply character-specific max HP (Silent: 70, Ironclad: 80)
      const maxHp = character?.maxHp || 80;
      const orbSlots = character?.orbSlots || 0;

      return {
        ...createInitialState(),
        phase: GAME_PHASE.STARTING_BONUS,
        character: characterId,
        deck,
        relics: [starterRelic],
        map,
        currentFloor: -1,
        ascension: ascensionLevel,
        customSeed: customSeed || null,
        player: {
          ...createInitialState().player,
          maxHp,
          currentHp: maxHp,
          gold: startingGold,
          orbSlots
        }
      };
    }

    case 'START_DAILY_CHALLENGE': {
      deleteSave();
      const { seed, date, modifierIds } = action.payload;
      const characterId = action.payload.characterId || 'ironclad';
      const deck = getStarterDeck(characterId);
      const starterRelic = getStarterRelic(characterId);
      const map = generateMap(1);
      const dailyCharacter = getCharacterById(characterId);
      const dailyMaxHp = dailyCharacter?.maxHp || 80;
      const dailyOrbSlots = dailyCharacter?.orbSlots || 0;

      let newState = {
        ...createInitialState(),
        phase: GAME_PHASE.STARTING_BONUS,
        character: characterId,
        deck,
        relics: [starterRelic],
        map,
        currentFloor: -1,
        ascension: 0,
        player: {
          ...createInitialState().player,
          maxHp: dailyMaxHp,
          currentHp: dailyMaxHp,
          gold: 99,
          orbSlots: dailyOrbSlots
        },
        dailyChallenge: {
          seed,
          date,
          modifierIds,
          startTime: Date.now()
        }
      };

      // Apply daily challenge modifiers to initial state
      newState = applyDailyChallengeModifiers(newState, modifierIds);

      return newState;
    }

    case 'SELECT_STARTING_BONUS': {
      const { bonusId } = action.payload;

      // Skip option — go straight to map
      if (bonusId === 'skip') {
        const skipState = { ...state, phase: GAME_PHASE.MAP };
        saveGame(skipState);
        return skipState;
      }

      let newState = { ...state };

      switch (bonusId) {
        case 'random_relic': {
          const existingIds = state.relics.map(r => r.id);
          const relic = getRandomRelic(RELIC_RARITY.COMMON, existingIds, state.character);
          if (relic) {
            newState.relics = [...state.relics, relic];
          }
          break;
        }
        case 'gain_gold': {
          newState.player = { ...state.player, gold: state.player.gold + 100 };
          break;
        }
        case 'upgrade_card': {
          // Upgrade a random upgradable starter card
          const upgradable = state.deck.filter(c => !c.upgraded && c.upgradedVersion);
          if (upgradable.length > 0) {
            const target = upgradable[Math.floor(Math.random() * upgradable.length)];
            newState.deck = state.deck.map(c => {
              if (c.instanceId === target.instanceId) {
                return {
                  ...c,
                  ...c.upgradedVersion,
                  upgraded: true,
                  name: c.name + '+'
                };
              }
              return c;
            });
          }
          break;
        }
        case 'transform_card': {
          // Replace a random starter Strike/Defend with a random card of same type
          const starters = state.deck.filter(c =>
            c.id === 'strike' || c.id === 'defend'
          );
          if (starters.length > 0) {
            const target = starters[Math.floor(Math.random() * starters.length)];
            const newCard = getRandomCard(RARITY.COMMON, target.type, state.character);
            if (newCard) {
              newState.deck = state.deck.map(c => {
                if (c.instanceId === target.instanceId) {
                  return { ...newCard, instanceId: c.instanceId };
                }
                return c;
              });
            }
          }
          break;
        }
        default:
          break;
      }

      newState.phase = GAME_PHASE.MAP;
      saveGame(newState);
      return newState;
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

      audioManager.playSFX(SOUNDS.ui.cardUpgrade, 'ui');

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
      deleteSave();
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

      // Ensure we always have exactly 3 potion slots (using null for empty slots)
      while (potions.length < 3) potions.push(null);

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
          orbs: saveData.player.orbs || [],
          orbSlots: saveData.player.orbSlots || 0,
          focus: saveData.player.focus || 0,
        },
        deck,
        relics,
        potions,
        map: saveData.map,
        currentNode: saveData.currentNode,
        currentFloor: saveData.currentFloor,
        act: saveData.act,
        ascension: saveData.ascension || 0,
        character: saveData.character || 'ironclad',
        endlessMode: saveData.endlessMode || false,
        endlessLoop: saveData.endlessLoop || 0,
        customSeed: saveData.customSeed || null,
      };
    }

    case 'DELETE_SAVE': {
      deleteSave();
      return state;
    }

    case 'LOAD_SCENARIO': {
      // Load a test scenario - allows jumping to any game state
      const scenario = action.payload;
      if (!scenario) return state;

      // Reconstruct deck from card IDs or full card objects
      const deck = (scenario.deck || [])
        .map((card, index) => {
          if (typeof card === 'string') {
            // Card ID string - look up the card
            const baseCard = getCardById(card);
            if (!baseCard) return null;
            return { ...baseCard, instanceId: `${card}_scenario_${index}` };
          }
          // Already a card object with at least an id
          if (card.id) {
            const baseCard = getCardById(card.id);
            if (!baseCard) return null;
            return {
              ...baseCard,
              ...card,
              instanceId: card.instanceId || `${card.id}_scenario_${index}`
            };
          }
          return null;
        })
        .filter(Boolean);

      // Reconstruct hand from card IDs
      const hand = (scenario.hand || [])
        .map((card, index) => {
          if (typeof card === 'string') {
            const baseCard = getCardById(card);
            if (!baseCard) return null;
            return { ...baseCard, instanceId: `${card}_hand_${index}` };
          }
          if (card.id) {
            const baseCard = getCardById(card.id);
            if (!baseCard) return null;
            return {
              ...baseCard,
              ...card,
              instanceId: card.instanceId || `${card.id}_hand_${index}`
            };
          }
          return null;
        })
        .filter(Boolean);

      // Reconstruct relics
      const relics = (scenario.relics || [])
        .map(relic => {
          if (typeof relic === 'string') {
            return getRelicById(relic);
          }
          if (relic.id) {
            const baseRelic = getRelicById(relic.id);
            if (!baseRelic) return null;
            return { ...baseRelic, ...relic };
          }
          return null;
        })
        .filter(Boolean);

      // Reconstruct potions
      const potions = (scenario.potions || [null, null, null])
        .map(potion => {
          if (!potion) return null;
          if (typeof potion === 'string') {
            return getPotionById(potion);
          }
          if (potion.id) {
            return getPotionById(potion.id);
          }
          return null;
        });
      while (potions.length < 3) potions.push(null);

      // Reconstruct enemies
      const enemies = (scenario.enemies || [])
        .map((enemy, index) => {
          if (typeof enemy === 'string') {
            // Enemy is just an ID string - create a fresh instance
            const baseEnemy = getEnemyById(enemy);
            if (!baseEnemy) return null;
            const instance = createEnemyInstance(baseEnemy, index);
            instance.intentData = getEnemyIntent(instance, 0);
            return instance;
          }
          if (enemy.id) {
            // Enemy is an object with an ID - create instance and override with scenario data
            const baseEnemy = getEnemyById(enemy.id);
            if (!baseEnemy) return null;
            const instance = createEnemyInstance(baseEnemy, index);

            // Override with scenario-specific values
            if (enemy.currentHp !== undefined) instance.currentHp = enemy.currentHp;
            if (enemy.maxHp !== undefined) instance.maxHp = enemy.maxHp;
            if (enemy.block !== undefined) instance.block = enemy.block;
            if (enemy.instanceId !== undefined) instance.instanceId = enemy.instanceId;
            if (enemy.vulnerable !== undefined) instance.vulnerable = enemy.vulnerable;
            if (enemy.weak !== undefined) instance.weak = enemy.weak;
            if (enemy.strength !== undefined) instance.strength = enemy.strength;
            if (enemy.moveIndex !== undefined) instance.moveIndex = enemy.moveIndex;

            // Calculate intent based on current move
            instance.intentData = getEnemyIntent(instance, instance.moveIndex || 0);
            return instance;
          }
          return null;
        })
        .filter(Boolean);

      // Build the scenario state
      const baseState = createInitialState();
      const scenarioPhase = scenario.phase ?
        GAME_PHASE[scenario.phase.toUpperCase()] || GAME_PHASE.COMBAT :
        GAME_PHASE.COMBAT;

      return {
        ...baseState,
        phase: scenarioPhase,
        player: {
          ...baseState.player,
          ...(scenario.player || {}),
          currentHp: scenario.player?.currentHp ?? baseState.player.currentHp,
          maxHp: scenario.player?.maxHp ?? baseState.player.maxHp,
          gold: scenario.player?.gold ?? baseState.player.gold,
          energy: scenario.player?.energy ?? baseState.player.energy,
          maxEnergy: scenario.player?.maxEnergy ?? baseState.player.maxEnergy,
          block: scenario.player?.block ?? 0,
          strength: scenario.player?.strength ?? 0,
          dexterity: scenario.player?.dexterity ?? 0,
          vulnerable: scenario.player?.vulnerable ?? 0,
          weak: scenario.player?.weak ?? 0,
          frail: scenario.player?.frail ?? 0,
          artifact: scenario.player?.artifact ?? 0
        },
        deck,
        hand,
        drawPile: [], // Scenarios start with specified hand
        discardPile: [],
        exhaustPile: [],
        relics,
        potions,
        enemies,
        currentFloor: scenario.floor ?? scenario.currentFloor ?? 1,
        act: scenario.act ?? 1,
        ascension: scenario.ascension ?? 0,
        map: scenario.map ?? generateMap(scenario.act ?? 1),
        turn: scenario.turn ?? 1,
        targetingMode: false,
        selectedCard: null
      };
    }

    case 'UPDATE_PROGRESSION': {
      // Called on game over (win or loss) to update meta-progression
      const { won, causeOfDeath } = action.payload;
      const progression = loadProgression();
      const currentAscension = state.ascension || 0;

      // Build run data from current state and runStats
      const runData = {
        won,
        floor: state.currentFloor + 1, // Convert 0-based to 1-based
        enemiesKilled: state.runStats?.enemiesKilled || 0,
        goldEarned: state.runStats?.goldEarned || 0,
        damageDealt: state.runStats?.damageDealt || 0,
        cardsPlayed: state.runStats?.cardsPlayed || 0,
        defeatedEnemies: state.runStats?.defeatedEnemies || [],
        relics: state.relics,
        deckSize: state.deck?.length || 0,
        ascension: currentAscension,
        causeOfDeath: won ? null : causeOfDeath,
        character: state.character || 'ironclad'
      };

      // Update progression (this also saves to localStorage)
      const updatedProgression = updateRunStats(progression, runData);

      // Also save to run history (separate localStorage store with more detail)
      addRunToHistory({
        ...runData,
        act: state.act || 1,
        relicCount: state.relics?.length || 0,
        potionCount: state.potions?.filter(Boolean)?.length || 0,
        gold: state.player?.gold || 0,
        character: state.character || 'ironclad',
        seed: state.customSeed || null
      });

      // Unlock next ascension level on win
      // - First win unlocks Ascension 1
      // - Winning at current highest unlocks next level
      if (won && currentAscension >= updatedProgression.highestAscension) {
        updatedProgression.highestAscension = currentAscension + 1;
        saveProgression(updatedProgression);
      }

      return state;
    }

    default:
      return undefined; // Not handled by this reducer
  }
};
