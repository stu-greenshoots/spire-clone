import { GAME_PHASE } from '../GameContext';
import { getEncounter, getBossEncounter } from '../../data/enemies';
import { shuffleArray, generateMap } from '../../utils/mapGenerator';
import { triggerRelics, getPassiveRelicEffects } from '../../systems/relicSystem';
import { getEnemyIntent } from '../../systems/enemySystem';
import { saveGame, deleteSave } from '../../systems/saveSystem';
import {
  applyAscensionToEnemies,
  shouldAddWoundAtCombatStart,
  createWoundCard
} from '../../systems/ascensionSystem';
import { audioManager, SOUNDS } from '../../systems/audioSystem';
import { channelOrb } from '../../systems/orbSystem';
import { getCardById } from '../../data/cards';
import { loadProgression, isHeartUnlocked } from '../../systems/progressionSystem';

/**
 * Apply endless mode scaling to enemies.
 * Each loop increases enemy HP and damage by 10%.
 */
const applyEndlessScaling = (enemies, endlessLoop) => {
  if (!endlessLoop || endlessLoop <= 0) return enemies;
  const scaleFactor = 1 + (0.1 * endlessLoop);
  return enemies.map(enemy => ({
    ...enemy,
    currentHp: Math.floor(enemy.currentHp * scaleFactor),
    maxHp: Math.floor(enemy.maxHp * scaleFactor),
    invincible: enemy.invincible ? Math.floor(enemy.invincible * scaleFactor) : 0
  }));
};

export const mapReducer = (state, action) => {
  switch (action.type) {
    case 'SELECT_NODE': {
      const { nodeId } = action.payload;
      const [floor, index] = nodeId.split('-').map(Number);
      const node = state.map[floor][index];

      // AR-07: Play map step sound on node selection
      audioManager.playSFX(SOUNDS.ui.mapStep, 'ui');

      // Update node as visited
      const newMap = state.map.map((f, fi) =>
        f.map((n, ni) =>
          fi === floor && ni === index ? { ...n, visited: true } : n
        )
      );

      if (node.type === 'combat' || node.type === 'elite') {
        // In endless mode, use effective act (1-3 cycle) for encounter pools
        const effectiveAct = state.endlessMode ? Math.min(state.act, 3) : state.act;
        let enemies = getEncounter(effectiveAct, floor, 0.1, node.type === 'elite');

        // Apply ascension modifiers to enemies (DEC-015: apply at SELECT_NODE)
        const ascensionLevel = state.ascension || 0;
        enemies = applyAscensionToEnemies(enemies, ascensionLevel, node.type);

        // Apply endless mode scaling
        enemies = applyEndlessScaling(enemies, state.endlessLoop);

        const deck = [...state.deck];
        let drawPile = shuffleArray(deck.map(c => ({ ...c })));

        // Add Wound to draw pile for Ascension 2+
        if (shouldAddWoundAtCombatStart(ascensionLevel)) {
          const woundCard = createWoundCard(`wound_asc_${Date.now()}`);
          drawPile.push(woundCard);
          // Re-shuffle to randomize wound position
          drawPile = shuffleArray(drawPile);
        }

        // Innate: move innate cards to front of draw pile
        const innateCards = drawPile.filter(c => c.innate);
        if (innateCards.length > 0) {
          drawPile = [...innateCards, ...drawPile.filter(c => !c.innate)];
        }

        // Get passive relic effects for extra draw
        const passiveEffects = getPassiveRelicEffects(state.relics, {
          playerHpPercent: state.player.currentHp / state.player.maxHp
        });

        // Draw cards (base 5 + relic bonuses)
        const initialDraw = 5 + passiveEffects.extraDraw;
        let hand = drawPile.splice(0, initialDraw);

        // Set enemy intents
        let enemiesWithIntents = enemies.map((enemy, _i) => ({
          ...enemy,
          intentData: getEnemyIntent(enemy, 0),
          moveIndex: 0
        }));

        // Apply combat start relics using trigger system
        const { effects, updatedRelics } = triggerRelics(state.relics, 'onCombatStart', {
          deck: state.deck
        });

        // Reset one-time-per-combat relics
        let newRelics = updatedRelics.map(r => ({
          ...r,
          usedThisCombat: false,
          counter: r.counter !== undefined ? 0 : undefined
        }));

        let player = {
          ...state.player,
          block: effects.block,
          energy: state.player.maxEnergy + passiveEffects.extraEnergy,
          strength: state.player.strength + effects.strength,
          dexterity: state.player.dexterity + effects.dexterity,
          // Reset combat-specific states
          vulnerable: 0,
          weak: 0,
          frail: 0,
          artifact: 0,
          intangible: 0,
          barricade: false,
          berserk: 0,
          combust: null,
          corruption: false,
          darkEmbrace: false,
          demonForm: 0,
          doubleTap: 0,
          evolve: 0,
          feelNoPain: 0,
          fireBreathing: 0,
          juggernaut: 0,
          metallicize: 0,
          rage: 0,
          rupture: 0,
          flameBarrier: 0,
          pendingBlock: 0,
          penNibActive: false,
          noDrawNextTurn: false,
          noDrawThisTurn: false
        };

        // Set thorns from Bronze Scales for display
        const bronzeScalesRelic = newRelics.find(r => r.id === 'bronze_scales');
        if (bronzeScalesRelic) {
          player.thorns = bronzeScalesRelic.effect.amount;
        }

        // Apply heal from relics (Blood Vial)
        if (effects.heal > 0) {
          player.currentHp = Math.min(player.maxHp, player.currentHp + effects.heal);
        }

        // Apply vulnerable to all enemies (Bag of Marbles)
        if (effects.vulnerable > 0) {
          enemiesWithIntents = enemiesWithIntents.map(enemy => ({
            ...enemy,
            vulnerable: (enemy.vulnerable || 0) + effects.vulnerable
          }));
        }

        // Extra draw from relics (Bag of Preparation)
        if (effects.draw > 0) {
          for (let i = 0; i < effects.draw; i++) {
            if (drawPile.length > 0) {
              hand.push(drawPile.shift());
            }
          }
        }

        // Channel orbs from relics (Cracked Core)
        if (effects.channelOrbs && effects.channelOrbs.length > 0) {
          for (const orbType of effects.channelOrbs) {
            const result = channelOrb(player, orbType, enemiesWithIntents, []);
            if (result) {
              enemiesWithIntents = result.enemies || enemiesWithIntents;
            }
          }
        }

        // Add cards to hand from relics (Pure Water)
        if (effects.addCards && effects.addCards.length > 0) {
          for (const cardId of effects.addCards) {
            const cardTemplate = getCardById(cardId);
            if (cardTemplate) {
              hand.push({ ...cardTemplate, instanceId: `${cardId}_relic_${Date.now()}_${Math.random()}` });
            }
          }
        }

        return {
          ...state,
          phase: GAME_PHASE.COMBAT,
          map: newMap,
          currentFloor: floor,
          currentNode: node,
          enemies: enemiesWithIntents,
          drawPile,
          hand,
          discardPile: [],
          exhaustPile: [],
          relics: newRelics,
          player: {
            ...player,
            cardsPlayedThisTurn: 0,
            attacksPlayedThisTurn: 0,
            skillsPlayedThisTurn: 0,
            powersPlayedThisTurn: 0
          },
          turn: 0,
          combatLog: ['Combat started!']
        };
      }

      if (node.type === 'boss') {
        audioManager.playSFX(SOUNDS.combat.bossIntro, 'combat');
        let enemies = getBossEncounter(state.act);

        // Apply ascension modifiers to boss (DEC-015: apply at SELECT_NODE)
        const ascensionLevel = state.ascension || 0;
        enemies = applyAscensionToEnemies(enemies, ascensionLevel, 'boss');

        // Apply endless mode scaling
        enemies = applyEndlessScaling(enemies, state.endlessLoop);

        const deck = [...state.deck];
        let drawPile = shuffleArray(deck.map(c => ({ ...c })));

        // Add Wound to draw pile for Ascension 2+
        if (shouldAddWoundAtCombatStart(ascensionLevel)) {
          const woundCard = createWoundCard(`wound_asc_${Date.now()}`);
          drawPile.push(woundCard);
          // Re-shuffle to randomize wound position
          drawPile = shuffleArray(drawPile);
        }

        // Innate: move innate cards to front of draw pile
        const innateCardsBoss = drawPile.filter(c => c.innate);
        if (innateCardsBoss.length > 0) {
          drawPile = [...innateCardsBoss, ...drawPile.filter(c => !c.innate)];
        }

        // Get passive relic effects for extra draw
        const passiveEffects = getPassiveRelicEffects(state.relics, {
          playerHpPercent: state.player.currentHp / state.player.maxHp
        });

        // Draw cards (base 5 + relic bonuses)
        const initialDraw = 5 + passiveEffects.extraDraw;
        let hand = drawPile.splice(0, initialDraw);

        let enemiesWithIntents = enemies.map((enemy, _i) => ({
          ...enemy,
          intentData: getEnemyIntent(enemy, 0),
          moveIndex: 0
        }));

        // Apply combat start relics using trigger system
        const { effects, updatedRelics } = triggerRelics(state.relics, 'onCombatStart', {
          deck: state.deck
        });

        // Reset one-time-per-combat relics
        let newRelics = updatedRelics.map(r => ({
          ...r,
          usedThisCombat: false,
          counter: r.counter !== undefined ? 0 : undefined
        }));

        let player = {
          ...state.player,
          block: effects.block,
          energy: state.player.maxEnergy + passiveEffects.extraEnergy,
          strength: state.player.strength + effects.strength,
          dexterity: state.player.dexterity + effects.dexterity,
          // Reset combat-specific states
          vulnerable: 0,
          weak: 0,
          frail: 0,
          artifact: 0,
          intangible: 0,
          barricade: false,
          berserk: 0,
          combust: null,
          corruption: false,
          darkEmbrace: false,
          demonForm: 0,
          doubleTap: 0,
          evolve: 0,
          feelNoPain: 0,
          fireBreathing: 0,
          juggernaut: 0,
          metallicize: 0,
          rage: 0,
          rupture: 0,
          flameBarrier: 0,
          pendingBlock: 0,
          penNibActive: false,
          noDrawNextTurn: false,
          noDrawThisTurn: false
        };

        // Set thorns from Bronze Scales for display
        const bronzeScalesRelic = newRelics.find(r => r.id === 'bronze_scales');
        if (bronzeScalesRelic) {
          player.thorns = bronzeScalesRelic.effect.amount;
        }

        // Apply heal from relics
        if (effects.heal > 0) {
          player.currentHp = Math.min(player.maxHp, player.currentHp + effects.heal);
        }

        // Apply vulnerable to all enemies (Bag of Marbles)
        if (effects.vulnerable > 0) {
          enemiesWithIntents = enemiesWithIntents.map(enemy => ({
            ...enemy,
            vulnerable: (enemy.vulnerable || 0) + effects.vulnerable
          }));
        }

        // Extra draw from relics
        if (effects.draw > 0) {
          for (let i = 0; i < effects.draw; i++) {
            if (drawPile.length > 0) {
              hand.push(drawPile.shift());
            }
          }
        }

        // Channel orbs from relics (Cracked Core)
        if (effects.channelOrbs && effects.channelOrbs.length > 0) {
          for (const orbType of effects.channelOrbs) {
            const result = channelOrb(player, orbType, enemiesWithIntents, []);
            if (result) {
              enemiesWithIntents = result.enemies || enemiesWithIntents;
            }
          }
        }

        // Add cards to hand from relics (Pure Water)
        if (effects.addCards && effects.addCards.length > 0) {
          for (const cardId of effects.addCards) {
            const cardTemplate = getCardById(cardId);
            if (cardTemplate) {
              hand.push({ ...cardTemplate, instanceId: `${cardId}_relic_${Date.now()}_${Math.random()}` });
            }
          }
        }

        return {
          ...state,
          phase: GAME_PHASE.COMBAT,
          map: newMap,
          currentFloor: floor,
          currentNode: node,
          enemies: enemiesWithIntents,
          drawPile,
          hand,
          discardPile: [],
          exhaustPile: [],
          relics: newRelics,
          player: {
            ...player,
            cardsPlayedThisTurn: 0,
            attacksPlayedThisTurn: 0,
            skillsPlayedThisTurn: 0,
            powersPlayedThisTurn: 0
          },
          turn: 0,
          combatLog: ['Boss fight!']
        };
      }

      if (node.type === 'rest') {
        return {
          ...state,
          phase: GAME_PHASE.REST_SITE,
          map: newMap,
          currentFloor: floor,
          currentNode: node
        };
      }

      if (node.type === 'shop') {
        return {
          ...state,
          phase: GAME_PHASE.SHOP,
          map: newMap,
          currentFloor: floor,
          currentNode: node
        };
      }

      if (node.type === 'event') {
        return {
          ...state,
          phase: GAME_PHASE.EVENT,
          map: newMap,
          currentFloor: floor,
          currentNode: node
        };
      }

      return state;
    }

    case 'ENTER_ENDLESS': {
      // Player chose to continue into endless mode after Heart defeat
      const newLoop = (state.endlessLoop || 0) + 1;
      const endlessState = {
        ...state,
        phase: GAME_PHASE.MAP,
        endlessMode: true,
        endlessLoop: newLoop,
        act: 1,
        currentFloor: -1,
        map: generateMap(1),
        combatRewards: null
      };
      saveGame(endlessState);
      return endlessState;
    }

    case 'PROCEED_TO_MAP': {
      // Check if we beat the boss
      if (state.currentNode?.type === 'boss') {
        // In endless mode, loop through Acts 1-3 then Heart, then repeat
        if (state.endlessMode) {
          if (state.act >= 4) {
            // Beat the Heart again in endless — offer another loop
            return {
              ...state,
              phase: GAME_PHASE.ENDLESS_TRANSITION
            };
          }
          // Move to next act within the endless loop
          const newActState = {
            ...state,
            phase: GAME_PHASE.MAP,
            act: state.act + 1,
            currentFloor: -1,
            map: generateMap(state.act + 1),
            combatRewards: null
          };
          saveGame(newActState);
          return newActState;
        }

        if (state.act >= 4) {
          // Beat the Heart — offer endless mode
          return {
            ...state,
            phase: GAME_PHASE.ENDLESS_TRANSITION
          };
        }

        // Gate Act 4 (Heart): requires wins with both Ironclad and Silent
        if (state.act === 3 && !isHeartUnlocked(loadProgression())) {
          // Act 3 boss beaten but Heart not unlocked — regular victory
          deleteSave();
          return {
            ...state,
            phase: GAME_PHASE.VICTORY
          };
        }

        // Move to next act
        const newActState = {
          ...state,
          phase: GAME_PHASE.MAP,
          act: state.act + 1,
          currentFloor: -1,
          map: generateMap(state.act + 1),
          combatRewards: null
        };
        // Auto-save after completing boss
        saveGame(newActState);
        return newActState;
      }

      const newState = {
        ...state,
        phase: GAME_PHASE.MAP,
        combatRewards: null
      };
      // Auto-save after completing node
      saveGame(newState);
      return newState;
    }

    default:
      return undefined; // Not handled by this reducer
  }
};
