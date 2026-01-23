import { createContext, useContext, useReducer, useCallback } from 'react';
import { getStarterDeck, getCardById, ALL_CARDS, CARD_TYPES, getCardRewards, getRandomCard } from '../data/cards';
import { getEncounter, getBossEncounter } from '../data/enemies';
import { getStarterRelic, getRandomRelic, getBossRelic, getRelicById } from '../data/relics';
import { shuffleArray, generateMap } from '../utils/mapGenerator';
import { saveGame, loadGame, deleteSave } from '../systems/saveSystem';
import { triggerRelics, getPassiveRelicEffects } from '../systems/relicSystem';
import {
  calculateDamage as combatCalculateDamage,
  calculateBlock as combatCalculateBlock,
  applyDamageToTarget as combatApplyDamageToTarget
} from '../systems/combatSystem';
import { getEnemyIntent, createSplitSlimes, createSummonedEnemy } from '../systems/enemySystem';
import { handleSpecialEffect, SUPPORTED_EFFECTS } from '../systems/cardEffects';

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
const createInitialState = () => ({
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
  pendingCardPlay: null // For cards that need selection before completing
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

    case 'SELECT_NODE': {
      const { nodeId } = action.payload;
      const [floor, index] = nodeId.split('-').map(Number);
      const node = state.map[floor][index];

      // Update node as visited
      const newMap = state.map.map((f, fi) =>
        f.map((n, ni) =>
          fi === floor && ni === index ? { ...n, visited: true } : n
        )
      );

      if (node.type === 'combat' || node.type === 'elite') {
        const enemies = getEncounter(state.act, floor, 0.1, node.type === 'elite');
        const deck = [...state.deck];
        let drawPile = shuffleArray(deck.map(c => ({ ...c })));

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
        const enemies = getBossEncounter(state.act);
        const deck = [...state.deck];
        let drawPile = shuffleArray(deck.map(c => ({ ...c })));

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

    case 'SELECT_CARD': {
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
      return gameReducer(state, {
        type: 'PLAY_CARD',
        payload: { card, targetIndex: 0 }
      });
    }

    case 'PLAY_CARD': {
      const { card, targetIndex } = action.payload;

      const isXCost = card.cost === -1 || card.special === 'xCost';

      if (!isXCost && (state.player.energy < card.cost || card.unplayable)) {
        return { ...state, selectedCard: null, targetingMode: false };
      }

      // For X-cost cards, don't deduct energy here (done in xCost special handler)
      let newPlayer = { ...state.player, energy: isXCost ? state.player.energy : state.player.energy - card.cost };
      let newEnemies = [...state.enemies];
      let newHand = state.hand.filter(c => c.instanceId !== card.instanceId);
      let newDiscardPile = [...state.discardPile];
      let newExhaustPile = [...state.exhaustPile];
      let newDrawPile = [...state.drawPile];
      let combatLog = [...state.combatLog];

      // Track card plays
      newPlayer.cardsPlayedThisTurn++;
      if (card.type === CARD_TYPES.ATTACK) newPlayer.attacksPlayedThisTurn++;
      if (card.type === CARD_TYPES.SKILL) newPlayer.skillsPlayedThisTurn++;
      if (card.type === CARD_TYPES.POWER) newPlayer.powersPlayedThisTurn++;

      // Gremlin Nob's Enrage: gain strength when player plays a Skill
      if (card.type === CARD_TYPES.SKILL) {
        newEnemies = newEnemies.map(enemy => {
          if (enemy.enrage > 0 && enemy.currentHp > 0) {
            combatLog.push(`${enemy.name} gained ${enemy.enrage} Strength from Enrage!`);
            return { ...enemy, strength: (enemy.strength || 0) + enemy.enrage };
          }
          return enemy;
        });
      }

      // Hex: add Dazed when playing non-attack
      if (newPlayer.hex > 0 && card.type !== CARD_TYPES.ATTACK) {
        const dazed = ALL_CARDS.find(c => c.id === 'dazed');
        for (let i = 0; i < newPlayer.hex; i++) {
          newDrawPile.push({ ...dazed, instanceId: `dazed_hex_${Date.now()}_${i}` });
        }
        newDrawPile = shuffleArray(newDrawPile);
        combatLog.push(`Hex added ${newPlayer.hex} Dazed to draw pile`);
      }

      // Apply rage (gain block on attack)
      if (card.type === CARD_TYPES.ATTACK && newPlayer.rage > 0) {
        newPlayer.block += newPlayer.rage;
      }

      // Process card effects
      // Skip normal damage for cards that handle their own damage in special effects
      const selfDamageSpecials = ['xCost', 'bonusPerStrike', 'bonusPerStrike3', 'damageEqualBlock', 'exhaustHandDamage', 'lifesteal', 'multiUpgrade'];
      if (card.damage && !selfDamageSpecials.includes(card.special)) {
        const hits = card.hits || 1;
        const baseDamage = typeof card.damage === 'object'
          ? Math.floor(Math.random() * (card.damage.max - card.damage.min + 1)) + card.damage.min
          : card.damage;

        // Get damage options
        const damageOptions = {
          strengthMultiplier: card.strengthMultiplier || 1,
          relics: state.relics,
          doubleDamage: newPlayer.doubleTap > 0 || newPlayer.penNibActive
        };

        // Consume double tap
        if (card.type === CARD_TYPES.ATTACK && newPlayer.doubleTap > 0) {
          newPlayer.doubleTap--;
        }

        for (let h = 0; h < hits; h++) {
          if (card.targetAll) {
            newEnemies = newEnemies.map(enemy => {
              if (enemy.currentHp <= 0) return enemy;
              const damage = calculateDamage(baseDamage, newPlayer, enemy, damageOptions);
              const result = applyDamageToTarget(enemy, damage);
              combatLog.push(`Dealt ${damage} damage to ${enemy.name}`);
              if (enemy.thorns > 0) {
                const thornsDmg = enemy.thorns;
                if (newPlayer.block >= thornsDmg) {
                  newPlayer.block -= thornsDmg;
                } else {
                  const tRem = thornsDmg - newPlayer.block;
                  newPlayer.block = 0;
                  newPlayer.currentHp = Math.max(0, newPlayer.currentHp - tRem);
                }
                combatLog.push(`Thorns dealt ${thornsDmg} damage back`);
              }
              return result;
            });
          } else if (card.randomTarget) {
            const aliveEnemies = newEnemies.filter(e => e.currentHp > 0);
            if (aliveEnemies.length > 0) {
              const randomIdx = Math.floor(Math.random() * aliveEnemies.length);
              const targetEnemy = aliveEnemies[randomIdx];
              const enemyIdx = newEnemies.findIndex(e => e.instanceId === targetEnemy.instanceId);
              const damage = calculateDamage(baseDamage, newPlayer, targetEnemy, damageOptions);
              newEnemies[enemyIdx] = applyDamageToTarget(targetEnemy, damage);
              combatLog.push(`Dealt ${damage} damage to ${targetEnemy.name}`);
              if (targetEnemy.thorns > 0) {
                const thornsDmg = targetEnemy.thorns;
                if (newPlayer.block >= thornsDmg) {
                  newPlayer.block -= thornsDmg;
                } else {
                  const tRem = thornsDmg - newPlayer.block;
                  newPlayer.block = 0;
                  newPlayer.currentHp = Math.max(0, newPlayer.currentHp - tRem);
                }
                combatLog.push(`Thorns dealt ${thornsDmg} damage back`);
              }
            }
          } else {
            const enemy = newEnemies[targetIndex];
            if (enemy && enemy.currentHp > 0) {
              const damage = calculateDamage(baseDamage, newPlayer, enemy, damageOptions);
              newEnemies[targetIndex] = applyDamageToTarget(enemy, damage);
              combatLog.push(`Dealt ${damage} damage to ${enemy.name}`);
              if (enemy.thorns > 0) {
                const thornsDmg = enemy.thorns;
                if (newPlayer.block >= thornsDmg) {
                  newPlayer.block -= thornsDmg;
                } else {
                  const tRem = thornsDmg - newPlayer.block;
                  newPlayer.block = 0;
                  newPlayer.currentHp = Math.max(0, newPlayer.currentHp - tRem);
                }
                combatLog.push(`Thorns dealt ${thornsDmg} damage back`);
              }
            }
          }
        }

        // Reset pen nib after use
        newPlayer.penNibActive = false;
      }

      if (card.block) {
        const block = calculateBlock(card.block, newPlayer);
        newPlayer.block += block;
        combatLog.push(`Gained ${block} Block`);

        // Juggernaut: deal damage when gaining block
        if (newPlayer.juggernaut > 0) {
          const aliveEnemies = newEnemies.filter(e => e.currentHp > 0);
          if (aliveEnemies.length > 0) {
            const randomIdx = Math.floor(Math.random() * aliveEnemies.length);
            const enemyIdx = newEnemies.findIndex(e => e.instanceId === aliveEnemies[randomIdx].instanceId);
            newEnemies[enemyIdx] = applyDamageToTarget(newEnemies[enemyIdx], newPlayer.juggernaut);
          }
        }
      }

      if (card.effects) {
        card.effects.forEach(effect => {
          if (effect.self) {
            if (effect.type === 'vulnerable') newPlayer.vulnerable += effect.amount;
            if (effect.type === 'weak') newPlayer.weak += effect.amount;
            if (effect.type === 'strength') newPlayer.strength += effect.amount;
          } else if (card.targetAll || effect.target === 'player') {
            if (effect.target === 'player') {
              if (effect.type === 'weak') newPlayer.weak += effect.amount;
              if (effect.type === 'vulnerable') newPlayer.vulnerable += effect.amount;
              if (effect.type === 'frail') newPlayer.frail += effect.amount;
              if (effect.type === 'strength') newPlayer.strength += effect.amount;
            } else {
              newEnemies = newEnemies.map(enemy => {
                if (enemy.currentHp <= 0) return enemy;
                const newEnemy = { ...enemy };
                const isEnemyDebuff = ['vulnerable', 'weak', 'strengthDown'].includes(effect.type);
                if (isEnemyDebuff && newEnemy.artifact > 0) {
                  newEnemy.artifact--;
                  combatLog.push(`${enemy.name}'s Artifact blocked ${effect.type}!`);
                  return newEnemy;
                }
                if (effect.type === 'vulnerable') newEnemy.vulnerable = (newEnemy.vulnerable || 0) + effect.amount;
                if (effect.type === 'weak') newEnemy.weak = (newEnemy.weak || 0) + effect.amount;
                if (effect.type === 'strengthDown') newEnemy.strength = (newEnemy.strength || 0) - effect.amount;
                combatLog.push(`Applied ${effect.amount} ${effect.type} to ${enemy.name}`);
                return newEnemy;
              });
            }
          } else {
            const enemy = newEnemies[targetIndex];
            if (enemy && enemy.currentHp > 0) {
              const newEnemy = { ...enemy };
              const isEnemyDebuff = ['vulnerable', 'weak', 'strengthDown'].includes(effect.type);
              if (isEnemyDebuff && newEnemy.artifact > 0) {
                newEnemy.artifact--;
                newEnemies[targetIndex] = newEnemy;
                combatLog.push(`${enemy.name}'s Artifact blocked ${effect.type}!`);
              } else {
                if (effect.type === 'vulnerable') newEnemy.vulnerable = (newEnemy.vulnerable || 0) + effect.amount;
                if (effect.type === 'weak') newEnemy.weak = (newEnemy.weak || 0) + effect.amount;
                if (effect.type === 'strengthDown') newEnemy.strength = (newEnemy.strength || 0) - effect.amount;
                newEnemies[targetIndex] = newEnemy;
                combatLog.push(`Applied ${effect.amount} ${effect.type} to ${enemy.name}`);
              }
            }
          }
        });
      }

      if (card.draw && !newPlayer.noDrawThisTurn) {
        for (let i = 0; i < card.draw; i++) {
          if (newDrawPile.length === 0 && newDiscardPile.length > 0) {
            newDrawPile = shuffleArray(newDiscardPile);
            newDiscardPile = [];
          }
          if (newDrawPile.length > 0) {
            newHand.push(newDrawPile.shift());
          }
        }
        combatLog.push(`Drew ${card.draw} card(s)`);
      }

      if (card.energy) {
        newPlayer.energy += card.energy;
        combatLog.push(`Gained ${card.energy} Energy`);
      }

      if (card.hpCost) {
        newPlayer.currentHp = Math.max(1, newPlayer.currentHp - card.hpCost);
        combatLog.push(`Lost ${card.hpCost} HP`);
        // Rupture: gain strength when losing HP from card costs
        if (newPlayer.rupture > 0) {
          newPlayer.strength = (newPlayer.strength || 0) + newPlayer.rupture;
          combatLog.push(`Rupture granted ${newPlayer.rupture} Strength`);
        }
      }

      // Handle special effects via cardEffects system
      if (card.special && SUPPORTED_EFFECTS.includes(card.special)) {
        const effectCtx = {
          player: newPlayer,
          enemies: newEnemies,
          hand: newHand,
          drawPile: newDrawPile,
          discardPile: newDiscardPile,
          exhaustPile: newExhaustPile,
          combatLog,
          targetIndex,
          relics: state.relics,
          deck: state.deck,
          state,
          GAME_PHASE
        };

        const result = handleSpecialEffect(card.special, card, effectCtx);

        if (result && result.earlyReturn) {
          return result.earlyReturnState;
        }

        // Extract updated state from context (arrays may have been reassigned)
        newPlayer = effectCtx.player;
        newEnemies = effectCtx.enemies;
        newHand = effectCtx.hand;
        newDrawPile = effectCtx.drawPile;
        newDiscardPile = effectCtx.discardPile;
        newExhaustPile = effectCtx.exhaustPile;
        combatLog = effectCtx.combatLog;
      }

      // Beat of Death: Corrupt Heart deals damage when cards are played
      const heartEnemy = newEnemies.find(e => e.beatOfDeath && e.currentHp > 0);
      if (heartEnemy) {
        const beatDamage = 1;
        if (newPlayer.block >= beatDamage) {
          newPlayer.block -= beatDamage;
        } else {
          const remaining = beatDamage - newPlayer.block;
          newPlayer.block = 0;
          newPlayer.currentHp = Math.max(0, newPlayer.currentHp - remaining);
        }
        combatLog.push('Beat of Death dealt 1 damage');
      }

      // Awakened One: gains strength when a Power is played
      if (card.type === CARD_TYPES.POWER) {
        newEnemies = newEnemies.map(enemy => {
          if (enemy.curious && enemy.currentHp > 0) {
            const newEnemy = { ...enemy };
            newEnemy.strength = (newEnemy.strength || 0) + 2;
            combatLog.push(`${enemy.name} gained 2 Strength from Power played!`);
            return newEnemy;
          }
          return enemy;
        });
      }

      // Time Eater: count cards played, end turn at 12
      const timeEaterEnemy = newEnemies.find(e => e.onCardPlayed && e.currentHp > 0);
      if (timeEaterEnemy) {
        const result = timeEaterEnemy.onCardPlayed(timeEaterEnemy);
        if (result && result.endTurn) {
          combatLog.push('Time Eater ended your turn!');
          // Heal Time Eater
          if (result.heal) {
            const idx = newEnemies.findIndex(e => e.instanceId === timeEaterEnemy.instanceId);
            newEnemies[idx] = {
              ...newEnemies[idx],
              currentHp: Math.min(newEnemies[idx].maxHp, newEnemies[idx].currentHp + Math.floor(newEnemies[idx].maxHp * 0.02))
            };
          }
          // Discard remaining hand
          newHand.forEach(c => newDiscardPile.push(c));
          newHand = [];
          // Set energy to 0 to prevent further card plays
          newPlayer.energy = 0;
        }
      }

      // Trigger relic effects for card plays
      let relicsUpdated = [...state.relics];
      if (card.type === CARD_TYPES.ATTACK) {
        const { effects, updatedRelics } = triggerRelics(relicsUpdated, 'onAttackPlayed', { turn: state.turn });
        relicsUpdated = updatedRelics;
        if (effects.energy > 0) newPlayer.energy += effects.energy;
        if (effects.strength > 0) newPlayer.strength += effects.strength;
        if (effects.dexterity > 0) newPlayer.dexterity += effects.dexterity;
        if (effects.block > 0) newPlayer.block += effects.block;
        if (effects.doubleDamage) newPlayer.penNibActive = true;
      }
      if (card.type === CARD_TYPES.SKILL) {
        const { effects, updatedRelics } = triggerRelics(relicsUpdated, 'onSkillPlayed', { turn: state.turn });
        relicsUpdated = updatedRelics;
        if (effects.damageAll > 0) {
          newEnemies = newEnemies.map(enemy => {
            if (enemy.currentHp <= 0) return enemy;
            return applyDamageToTarget(enemy, effects.damageAll);
          });
        }
      }
      // Check for Strike cards (Strike Dummy relic)
      if (card.name.toLowerCase().includes('strike')) {
        const { effects, updatedRelics } = triggerRelics(relicsUpdated, 'onStrikePlayed', {});
        relicsUpdated = updatedRelics;
        if (effects.damage > 0 && newEnemies[targetIndex]) {
          newEnemies[targetIndex] = applyDamageToTarget(newEnemies[targetIndex], effects.damage);
        }
      }

      // Corruption: Skills cost 0 and exhaust
      if (newPlayer.corruption && card.type === CARD_TYPES.SKILL) {
        newPlayer.energy += card.cost; // Refund cost
      }

      // Handle exhaust
      if (card.exhaust || (newPlayer.corruption && card.type === CARD_TYPES.SKILL)) {
        newExhaustPile.push(card);

        // Sentinel: gain energy when exhausted
        if (card._sentinelEnergy) {
          newPlayer.energy += card._sentinelEnergy;
          combatLog.push(`Sentinel granted ${card._sentinelEnergy} Energy`);
        }

        // Dark Embrace: draw on exhaust
        if (newPlayer.darkEmbrace) {
          if (newDrawPile.length === 0 && newDiscardPile.length > 0) {
            newDrawPile = shuffleArray(newDiscardPile);
            newDiscardPile = [];
          }
          if (newDrawPile.length > 0) {
            newHand.push(newDrawPile.shift());
          }
        }

        // Feel No Pain: block on exhaust
        if (newPlayer.feelNoPain > 0) {
          newPlayer.block += newPlayer.feelNoPain;
        }

        // Dead Branch relic: add random card on exhaust
        const deadBranch = relicsUpdated.find(r => r.id === 'dead_branch');
        if (deadBranch) {
          const randomCard = getRandomCard();
          if (randomCard) {
            newHand.push({ ...randomCard, instanceId: `${randomCard.id}_branch_${Date.now()}` });
            combatLog.push(`Dead Branch added ${randomCard.name}`);
          }
        }
      } else {
        newDiscardPile.push(card);
      }

      // Wake up sleeping enemies that were attacked (Lagavulin)
      newEnemies = newEnemies.map(enemy => {
        if (enemy.asleep && enemy.currentHp < enemy.maxHp && !enemy.wokenUp) {
          return { ...enemy, wokenUp: true, asleep: false };
        }
        return enemy;
      });

      // Awakened One rebirth: prevent death if not yet reborn
      newEnemies = newEnemies.map(enemy => {
        if (enemy.currentHp <= 0 && enemy.canRebirth && !enemy.reborn) {
          return {
            ...enemy,
            currentHp: enemy.maxHp,
            reborn: true,
            strength: (enemy.strength || 0) + 2,
            vulnerable: 0,
            weak: 0,
            moveIndex: 0
          };
        }
        return enemy;
      });

      // Check for enemy deaths and handle splits/spawns
      const dyingEnemies = newEnemies.filter(e => e.currentHp <= 0);
      let spawnedEnemies = [];

      dyingEnemies.forEach(enemy => {
        // Handle slime splits
        if (enemy.onDeath && enemy.onDeath.startsWith('split') && !enemy.hasSplit) {
          const spawns = createSplitSlimes(enemy, enemy.onDeath);
          spawnedEnemies = [...spawnedEnemies, ...spawns];
          combatLog.push(`${enemy.name} split into smaller slimes!`);
        }
        // Fungi Beast: apply Weak on death
        if (enemy.sporeCloud) {
          newPlayer.weak = (newPlayer.weak || 0) + 2;
          combatLog.push(`${enemy.name}'s Spore Cloud applied 2 Weak`);
        }
      });

      newEnemies = newEnemies.filter(e => e.currentHp > 0);
      newEnemies = [...newEnemies, ...spawnedEnemies];

      // Check victory
      if (newEnemies.length === 0) {
        const goldReward = 10 + Math.floor(Math.random() * 15) +
          (state.currentNode?.type === 'elite' ? 25 : 0) +
          (state.currentNode?.type === 'boss' ? 50 : 0);

        // Apply combat end relics
        const { effects: endEffects } = triggerRelics(relicsUpdated, 'onCombatEnd', {
          playerHpPercent: newPlayer.currentHp / newPlayer.maxHp
        });
        newPlayer.currentHp = Math.min(newPlayer.maxHp, newPlayer.currentHp + endEffects.heal);

        const cardRewards = getCardRewards(3);
        let relicReward = null;
        if (state.currentNode?.type === 'elite' || state.currentNode?.type === 'boss') {
          relicReward = state.currentNode?.type === 'boss'
            ? getBossRelic(state.relics.map(r => r.id))
            : getRandomRelic(null, state.relics.map(r => r.id));
        }

        return {
          ...state,
          phase: GAME_PHASE.COMBAT_REWARD,
          player: newPlayer,
          enemies: newEnemies,
          hand: newHand,
          discardPile: newDiscardPile,
          exhaustPile: newExhaustPile,
          drawPile: newDrawPile,
          relics: relicsUpdated,
          selectedCard: null,
          targetingMode: false,
          combatLog,
          combatRewards: {
            gold: goldReward,
            cardRewards,
            relicReward
          }
        };
      }

      return {
        ...state,
        player: newPlayer,
        enemies: newEnemies,
        hand: newHand,
        discardPile: newDiscardPile,
        exhaustPile: newExhaustPile,
        drawPile: newDrawPile,
        relics: relicsUpdated,
        selectedCard: null,
        targetingMode: false,
        combatLog
      };
    }

    case 'CANCEL_TARGET': {
      return {
        ...state,
        selectedCard: null,
        targetingMode: false
      };
    }

    case 'END_TURN': {
      let newPlayer = { ...state.player };
      let newEnemies = [...state.enemies];
      let newHand = [...state.hand];
      let newDiscardPile = [...state.discardPile];
      let newDrawPile = [...state.drawPile];
      let newExhaustPile = [...state.exhaustPile];
      let newRelics = [...state.relics];
      let combatLog = [...state.combatLog, '--- Enemy Turn ---'];

      // Apply turn end relic effects (Orichalcum, Incense Burner)
      const { effects: turnEndEffects, updatedRelics: turnEndRelics } = triggerRelics(newRelics, 'onTurnEnd', {
        playerBlock: newPlayer.block,
        turn: state.turn
      });
      newRelics = turnEndRelics;
      if (turnEndEffects.block > 0) {
        newPlayer.block += turnEndEffects.block;
        combatLog.push(`Relic granted ${turnEndEffects.block} Block`);
      }
      if (turnEndEffects.intangible > 0) {
        newPlayer.intangible = (newPlayer.intangible || 0) + turnEndEffects.intangible;
        combatLog.push('Gained Intangible');
      }

      // Orange Pellets: remove debuffs if all card types played
      const orangePellets = newRelics.find(r => r.id === 'orange_pellets');
      if (orangePellets && newPlayer.attacksPlayedThisTurn > 0 &&
          newPlayer.skillsPlayedThisTurn > 0 && newPlayer.powersPlayedThisTurn > 0) {
        newPlayer.vulnerable = 0;
        newPlayer.weak = 0;
        newPlayer.frail = 0;
        combatLog.push('Orange Pellets removed all debuffs!');
      }

      // Process Burn/Decay cards in hand (deal damage at end of turn)
      newHand.forEach(card => {
        if (card.special === 'burnDamage' || card.special === 'decayCurse') {
          const burnDamage = card.burnDamage || 2;
          newPlayer.currentHp = Math.max(0, newPlayer.currentHp - burnDamage);
          combatLog.push(`${card.name} dealt ${burnDamage} damage`);
        }
        if (card.special === 'regretCurse') {
          const regretDamage = newHand.length;
          newPlayer.currentHp = Math.max(0, newPlayer.currentHp - regretDamage);
          combatLog.push(`Regret dealt ${regretDamage} damage`);
        }
        if (card.special === 'doubtCurse') {
          newPlayer.weak++;
          combatLog.push('Doubt applied Weak');
        }
      });

      // Discard hand (retain cards stay, ethereal cards exhaust with triggers)
      const retainedCards = [];
      newHand.forEach(card => {
        if (card.retain) {
          retainedCards.push(card);
        } else if (card.ethereal) {
          newExhaustPile.push(card);
          combatLog.push(`${card.name} exhausted (Ethereal)`);
          // Trigger exhaust effects for ethereal cards
          if (newPlayer.darkEmbrace) {
            if (newDrawPile.length === 0 && newDiscardPile.length > 0) {
              newDrawPile = shuffleArray(newDiscardPile);
              newDiscardPile = [];
            }
            if (newDrawPile.length > 0) {
              retainedCards.push(newDrawPile.shift());
            }
          }
          if (newPlayer.feelNoPain > 0) {
            newPlayer.block += newPlayer.feelNoPain;
          }
          const deadBranch = newRelics.find(r => r.id === 'dead_branch');
          if (deadBranch) {
            const randomCard = getRandomCard();
            if (randomCard) {
              retainedCards.push({ ...randomCard, instanceId: `${randomCard.id}_branch_${Date.now()}_${Math.random()}` });
              combatLog.push(`Dead Branch added ${randomCard.name}`);
            }
          }
        } else {
          newDiscardPile.push(card);
        }
      });
      newHand = retainedCards;

      // Apply end of turn effects
      if (newPlayer.combust) {
        newPlayer.currentHp -= newPlayer.combust.hpLoss;
        // Rupture: gain strength when losing HP from Combust
        if (newPlayer.rupture > 0) {
          newPlayer.strength = (newPlayer.strength || 0) + newPlayer.rupture;
          combatLog.push(`Rupture granted ${newPlayer.rupture} Strength`);
        }
        newEnemies = newEnemies.map(enemy => {
          if (enemy.currentHp <= 0) return enemy;
          return applyDamageToTarget(enemy, newPlayer.combust.damage);
        });
        combatLog.push(`Combust dealt ${newPlayer.combust.damage} to all enemies`);
      }

      if (newPlayer.metallicize > 0) {
        newPlayer.block += newPlayer.metallicize;
        combatLog.push(`Metallicize granted ${newPlayer.metallicize} Block`);
      }

      // Reset turn-based effects
      newPlayer.rage = 0;
      // Flex: lose temporary strength
      if (newPlayer.flexStrengthLoss > 0) {
        newPlayer.strength -= newPlayer.flexStrengthLoss;
        combatLog.push(`Lost ${newPlayer.flexStrengthLoss} temporary Strength`);
        newPlayer.flexStrengthLoss = 0;
      }
      newPlayer.flameBarrier = 0;
      newPlayer.noDrawThisTurn = false;
      newPlayer.entangle = false;

      // Reset turn-based relic counters
      newRelics = newRelics.map(relic => {
        if (relic.resetOnTurnEnd && relic.counter !== undefined) {
          return { ...relic, counter: 0 };
        }
        return relic;
      });

      // Enemy turns
      newEnemies = newEnemies.map((enemy, _idx) => {
        if (enemy.currentHp <= 0) return enemy;

        const move = enemy.intentData;
        if (!move) return enemy;

        let newEnemy = { ...enemy };

        // Execute enemy action
        if (move.damage) {
          // Book of Stabbing: use escalating multiStabCount instead of static move.times
          const hits = (move.special === 'addStab' && newEnemy.multiStabCount)
            ? newEnemy.multiStabCount
            : (move.times || 1);
          for (let h = 0; h < hits; h++) {
            let baseDamage = move.damage;
            // Handle damage ranges (e.g., {min: 5, max: 7})
            if (typeof baseDamage === 'object' && baseDamage.min !== undefined) {
              baseDamage = Math.floor(Math.random() * (baseDamage.max - baseDamage.min + 1)) + baseDamage.min;
            }
            let damage = baseDamage;
            damage += newEnemy.strength || 0;
            if (newEnemy.weak > 0) damage = Math.floor(damage * 0.75);
            if (newPlayer.vulnerable > 0) damage = Math.floor(damage * 1.5);

            // Flight: reduce damage by 50%, lose 1 stack
            if (newPlayer.flight > 0) {
              damage = Math.floor(damage / 2);
              newPlayer.flight--;
              combatLog.push('Flight reduced damage');
            }

            // Intangible: reduce all damage to 1
            if (newPlayer.intangible > 0) {
              damage = 1;
            }

            // Torii: reduce low damage (<=5) to 1
            const torii = newRelics.find(r => r.id === 'torii');
            if (torii && damage <= 5 && damage > 0) {
              damage = 1;
            }

            // Tungsten Rod: reduce HP loss by 1
            const tungstenRod = newRelics.find(r => r.id === 'tungsten_rod');

            // Apply flame barrier before taking damage
            if (newPlayer.flameBarrier > 0 && newEnemy.currentHp > 0) {
              newEnemy = applyDamageToTarget(newEnemy, newPlayer.flameBarrier);
              combatLog.push(`Flame Barrier dealt ${newPlayer.flameBarrier} back`);
            }

            // Bronze Scales (thorns)
            const bronzeScales = newRelics.find(r => r.id === 'bronze_scales');
            if (bronzeScales && newEnemy.currentHp > 0) {
              newEnemy = applyDamageToTarget(newEnemy, bronzeScales.effect.amount);
            }

            // Apply damage to player
            let hpLost = 0;
            if (newPlayer.block >= damage) {
              newPlayer.block -= damage;
            } else {
              let remainingDamage = damage - newPlayer.block;
              newPlayer.block = 0;

              // Tungsten Rod reduces HP loss
              if (tungstenRod && remainingDamage > 0) {
                remainingDamage = Math.max(0, remainingDamage - 1);
              }

              hpLost = remainingDamage;
              newPlayer.currentHp = Math.max(0, newPlayer.currentHp - remainingDamage);
            }

            // Trigger onHpLoss relics
            if (hpLost > 0) {
              // Plated Armor: lose 1 stack when taking attack damage
              if (newPlayer.platedArmor > 0) {
                newPlayer.platedArmor--;
                combatLog.push('Plated Armor lost 1 stack');
              }

              // Self-Forming Clay: block next turn
              const selfFormingClay = newRelics.find(r => r.id === 'self_forming_clay');
              if (selfFormingClay) {
                newPlayer.pendingBlock = (newPlayer.pendingBlock || 0) + 3;
              }

              // Centennial Puzzle: draw 3 on first HP loss
              const { effects: hpLossEffects, updatedRelics: hpLossRelics } = triggerRelics(newRelics, 'onFirstHpLoss', {});
              newRelics = hpLossRelics;
              if (hpLossEffects.draw > 0) {
                for (let d = 0; d < hpLossEffects.draw; d++) {
                  if (newDrawPile.length === 0 && newDiscardPile.length > 0) {
                    newDrawPile = shuffleArray(newDiscardPile);
                    newDiscardPile = [];
                  }
                  if (newDrawPile.length > 0) {
                    newHand.push(newDrawPile.shift());
                  }
                }
                combatLog.push(`Centennial Puzzle drew ${hpLossEffects.draw} cards`);
              }
            }

            combatLog.push(`${enemy.name} dealt ${damage} damage`);
          }
        }

        if (move.block) {
          newEnemy.block = (newEnemy.block || 0) + move.block;
        }

        if (move.effects) {
          move.effects.forEach(effect => {
            if (effect.target === 'player') {
              // Check artifact
              const isDebuff = ['weak', 'vulnerable', 'frail', 'strengthDown', 'dexterityDown', 'entangle', 'drawReduction'].includes(effect.type);
              if (newPlayer.artifact > 0 && isDebuff) {
                newPlayer.artifact--;
                combatLog.push('Artifact blocked debuff');
              } else {
                if (effect.type === 'weak') newPlayer.weak += effect.amount;
                if (effect.type === 'vulnerable') newPlayer.vulnerable += effect.amount;
                if (effect.type === 'frail') newPlayer.frail += effect.amount;
                if (effect.type === 'entangle') newPlayer.entangle = true;
                if (effect.type === 'drawReduction') {
                  newPlayer.drawReduction = (newPlayer.drawReduction || 0) + effect.amount;
                }
                if (effect.type === 'strengthDown') {
                  newPlayer.strength = (newPlayer.strength || 0) - effect.amount;
                }
                if (effect.type === 'dexterityDown') {
                  newPlayer.dexterity = (newPlayer.dexterity || 0) - effect.amount;
                }
              }
            } else {
              if (effect.type === 'strength') newEnemy.strength = (newEnemy.strength || 0) + effect.amount;
              if (effect.type === 'ritual') newEnemy.ritual = (newEnemy.ritual || 0) + effect.amount;
              if (effect.type === 'enrage') newEnemy.enrage = (newEnemy.enrage || 0) + effect.amount;
              if (effect.type === 'thorns') newEnemy.thorns = (newEnemy.thorns || 0) + effect.amount;
              if (effect.type === 'metallicize') newEnemy.metallicize = (newEnemy.metallicize || 0) + effect.amount;
              if (effect.type === 'artifact') newEnemy.artifact = (newEnemy.artifact || 0) + effect.amount;
            }
          });
        }

        // Handle enemy special actions
        if (move.special) {
          // Add Slimed cards to discard
          if (move.special === 'addSlimed') {
            const slimed = ALL_CARDS.find(c => c.id === 'slimed');
            const count = move.amount || 1;
            for (let i = 0; i < count; i++) {
              newDiscardPile.push({ ...slimed, instanceId: `slimed_${Date.now()}_${i}` });
            }
            combatLog.push(`${enemy.name} added ${count} Slimed to discard`);
          }

          // Add Dazed cards to draw pile
          if (move.special === 'addDazed') {
            const dazed = ALL_CARDS.find(c => c.id === 'dazed');
            newDrawPile.push({ ...dazed, instanceId: `dazed_enemy_${Date.now()}` });
            newDrawPile = shuffleArray(newDrawPile);
            combatLog.push(`${enemy.name} added Dazed to draw pile`);
          }

          // Add Burn cards
          if (move.special === 'addBurn') {
            const burn = ALL_CARDS.find(c => c.id === 'burn');
            newDiscardPile.push({ ...burn, instanceId: `burn_enemy_${Date.now()}` });
            combatLog.push(`${enemy.name} added Burn to discard`);
          }

          // Add multiple burns (Hexaghost Inferno)
          if (move.special === 'addBurns') {
            const burn = ALL_CARDS.find(c => c.id === 'burn');
            for (let i = 0; i < 6; i++) {
              newDiscardPile.push({ ...burn, instanceId: `burn_inferno_${Date.now()}_${i}` });
            }
            combatLog.push(`${enemy.name} added 6 Burns to discard`);
          }

          // Steal gold
          if (move.special === 'stealGold') {
            const stolenAmount = Math.min(newPlayer.gold, 15);
            newPlayer.gold -= stolenAmount;
            newEnemy.stolenGold = (newEnemy.stolenGold || 0) + stolenAmount;
            combatLog.push(`${enemy.name} stole ${stolenAmount} gold!`);
          }

          // Escape from combat
          if (move.special === 'escape') {
            newEnemy.escaped = true;
            newEnemy.currentHp = 0; // Mark as removed
            combatLog.push(`${enemy.name} escaped!`);
          }

          // Kill self after attack (exploding enemies)
          if (move.special === 'killSelf') {
            newEnemy.currentHp = 0;
            combatLog.push(`${enemy.name} exploded!`);
          }

          // Remove debuffs (Champ, Time Eater)
          if (move.special === 'removeDebuffs') {
            newEnemy.vulnerable = 0;
            newEnemy.weak = 0;
            // Set angered for Champ (prevents infinite ANGER loop)
            if (newEnemy.id === 'champ' || newEnemy.id === 'theChamp') {
              newEnemy.angered = true;
            }
            // Set hasted for Time Eater (prevents infinite Haste loop)
            if (newEnemy.id === 'timeEater') {
              newEnemy.hasted = true;
            }
            combatLog.push(`${enemy.name} cleared all debuffs!`);
          }

          // Mode shift (Guardian) - toggle defensiveMode for AI
          if (move.special === 'modeShift') {
            newEnemy.defensiveMode = !newEnemy.defensiveMode;
            combatLog.push(`${enemy.name} shifted modes!`);
          }

          // Giant Head count mechanic - updates slowCount for AI
          if (move.special === 'count') {
            newEnemy.slowCount = (newEnemy.slowCount || 0) + 1;
            const maxCount = newEnemy.slowCountMax || 4;
            if (newEnemy.slowCount >= maxCount) {
              combatLog.push(`${enemy.name} is fully charged!`);
            } else {
              combatLog.push(`${enemy.name} is counting... (${newEnemy.slowCount}/${maxCount})`);
            }
          }

          // Add Hex (Chosen) - adds Dazed cards when non-attack is played
          if (move.special === 'addHex') {
            newPlayer.hex = (newPlayer.hex || 0) + 1;
            combatLog.push(`${enemy.name} applied Hex!`);
          }

          // Add Parasite (Writhing Mass) - adds a Wound to draw pile
          if (move.special === 'addParasite') {
            const wound = ALL_CARDS.find(c => c.id === 'wound');
            newDrawPile.push({ ...wound, instanceId: `parasite_${Date.now()}` });
            newDrawPile = shuffleArray(newDrawPile);
            combatLog.push(`${enemy.name} implanted a parasite!`);
          }

          // Gain Flight (Byrd) - reduces incoming damage
          if (move.special === 'gainFlight') {
            newEnemy.flight = (newEnemy.flight || 0) + 3;
            newEnemy.grounded = false;
            combatLog.push(`${enemy.name} took flight!`);
          }

          // Rebirth (Awakened One) - revives with full HP and bonus strength
          if (move.special === 'rebirth') {
            newEnemy.reborn = true;
            newEnemy.currentHp = newEnemy.maxHp;
            newEnemy.strength = (newEnemy.strength || 0) + 2;
            newEnemy.vulnerable = 0;
            newEnemy.weak = 0;
            combatLog.push(`${enemy.name} has been reborn!`);
          }

          // Beat of Death (Corrupt Heart) - deal damage per card played
          if (move.special === 'beatOfDeath') {
            newEnemy.beatOfDeath = true;
            combatLog.push(`${enemy.name}'s heart beats with deadly power!`);
          }

          // Add Stab (Book of Stabbing escalation)
          if (move.special === 'addStab') {
            newEnemy.multiStabCount = (newEnemy.multiStabCount || 3) + (newEnemy.stabEscalation || 1);
            combatLog.push(`${enemy.name}'s stab count increased!`);
          }

          // Buff Gremlins (Gremlin Leader)
          if (move.special === 'buffGremlins') {
            // This is handled via the effects array on the move,
            // which applies strength to the enemy itself.
            // Other gremlins in the encounter would need to be handled
            // at a higher level (the map function handles self-effects).
            combatLog.push(`${enemy.name} encouraged allies!`);
          }

          // Summon Gremlins (Gremlin Leader)
          if (move.special === 'summonGremlins') {
            // Gremlin summoning is handled after the enemy loop
            newEnemy._summonGremlins = true;
            combatLog.push(`${enemy.name} rallied new gremlins!`);
          }

          // Summon Daggers (Reptomancer)
          if (move.special === 'summonDaggers') {
            newEnemy._summonDaggers = true;
            combatLog.push(`${enemy.name} summoned daggers!`);
          }

          // Split Boss (Slime Boss)
          if (move.special === 'splitBoss') {
            newEnemy.hasSplit = true;
            newEnemy._splitBoss = true;
            combatLog.push(`${enemy.name} split!`);
          }

          // Split Medium (Large Slime)
          if (move.special === 'splitMedium') {
            newEnemy.hasSplit = true;
            newEnemy._splitMedium = true;
            combatLog.push(`${enemy.name} split!`);
          }

          // Hexaghost activate - powers up for future attacks
          if (move.special === 'activate') {
            newEnemy.activated = true;
            combatLog.push(`${enemy.name} is powering up!`);
          }

          // Hexaghost divider - damage based on player current HP / 12 + 1
          if (move.special === 'divider') {
            const dividerDamage = Math.floor(newPlayer.currentHp / 12) + 1;
            const dividerHits = 6;
            for (let d = 0; d < dividerHits; d++) {
              let dmg = dividerDamage + (newEnemy.strength || 0);
              if (newEnemy.weak > 0) dmg = Math.floor(dmg * 0.75);
              if (newPlayer.vulnerable > 0) dmg = Math.floor(dmg * 1.5);
              if (newPlayer.intangible > 0) dmg = 1;
              if (newPlayer.block >= dmg) {
                newPlayer.block -= dmg;
              } else {
                const rem = dmg - newPlayer.block;
                newPlayer.block = 0;
                newPlayer.currentHp = Math.max(0, newPlayer.currentHp - rem);
              }
            }
            combatLog.push(`${enemy.name} used Divider for ${dividerDamage} x ${dividerHits}!`);
          }

          // Hexaghost upgradeBurn - upgrade all Burn cards in discard to Burn+
          if (move.special === 'upgradeBurn') {
            newDiscardPile = newDiscardPile.map(c => {
              if (c.id === 'burn' && !c.upgraded) {
                return { ...c, upgraded: true, burnDamage: 4, name: 'Burn+', description: 'Unplayable. At end of turn, take 4 damage.' };
              }
              return c;
            });
            combatLog.push(`${enemy.name} upgraded all Burns!`);
          }

          // Corrupt Heart addStatus - add random status card to draw pile
          if (move.special === 'addStatus') {
            const statusCards = ['wound', 'dazed', 'burn', 'slimed'];
            const count = move.amount || 1;
            for (let i = 0; i < count; i++) {
              const statusId = statusCards[Math.floor(Math.random() * statusCards.length)];
              const statusCard = ALL_CARDS.find(c => c.id === statusId);
              if (statusCard) {
                newDrawPile.push({ ...statusCard, instanceId: `status_${statusId}_${Date.now()}_${i}` });
              }
            }
            newDrawPile = shuffleArray(newDrawPile);
            combatLog.push(`${enemy.name} added ${count} status card(s)!`);
          }
        }

        // Update last move
        newEnemy.lastMove = move;
        newEnemy.moveIndex = (newEnemy.moveIndex || 0) + 1;

        // Apply enemy metallicize (Lagavulin) - gain block each turn
        if (newEnemy.metallicize > 0 && newEnemy.currentHp > 0) {
          newEnemy.block = (newEnemy.block || 0) + newEnemy.metallicize;
          combatLog.push(`${enemy.name} gained ${newEnemy.metallicize} Block from Metallicize`);
        }

        return newEnemy;
      });

      // Handle summons and splits after all enemies have acted
      let spawnedEnemies = [];
      newEnemies.forEach(enemy => {
        if (enemy._summonGremlins) {
          const timestamp = Date.now();
          const gremlin1 = createSummonedEnemy('gremlin', timestamp, 0);
          const gremlin2 = createSummonedEnemy('gremlin', timestamp, 1);
          if (gremlin1) {
            gremlin1.intentData = getEnemyIntent(gremlin1, 0);
            spawnedEnemies.push(gremlin1);
          }
          if (gremlin2) {
            gremlin2.intentData = getEnemyIntent(gremlin2, 0);
            spawnedEnemies.push(gremlin2);
          }
          delete enemy._summonGremlins;
        }
        if (enemy._summonDaggers) {
          const timestamp = Date.now();
          for (let i = 0; i < 2; i++) {
            const dagger = createSummonedEnemy('dagger', timestamp, i);
            if (dagger) {
              dagger.intentData = getEnemyIntent(dagger, 0);
              spawnedEnemies.push(dagger);
            }
          }
          delete enemy._summonDaggers;
        }
        if (enemy._splitBoss) {
          const spawns = createSplitSlimes(enemy, 'splitBoss');
          spawnedEnemies = [...spawnedEnemies, ...spawns];
          enemy.currentHp = 0; // Remove the boss
          delete enemy._splitBoss;
        }
        if (enemy._splitMedium) {
          const spawns = createSplitSlimes(enemy, 'splitMedium');
          spawnedEnemies = [...spawnedEnemies, ...spawns];
          enemy.currentHp = 0; // Remove the splitting slime
          delete enemy._splitMedium;
        }
      });

      // Check for sporeCloud deaths (Fungi Beast)
      newEnemies.forEach(enemy => {
        if (enemy.currentHp <= 0 && enemy.sporeCloud) {
          newPlayer.weak = (newPlayer.weak || 0) + 2;
          combatLog.push(`${enemy.name}'s Spore Cloud applied 2 Weak`);
        }
      });

      // Filter dead enemies and add spawns
      newEnemies = newEnemies.filter(e => e.currentHp > 0);
      newEnemies = [...newEnemies, ...spawnedEnemies];

      // Handle Gremlin Leader's buffGremlins - apply strength to all other enemies
      newEnemies.forEach(enemy => {
        if (enemy.intentData?.special === 'buffGremlins' && enemy.id === 'gremlinLeader') {
          const strengthBuff = enemy.intentData.effects?.[0]?.amount || 3;
          newEnemies.forEach(otherEnemy => {
            if (otherEnemy.instanceId !== enemy.instanceId && otherEnemy.currentHp > 0) {
              otherEnemy.strength = (otherEnemy.strength || 0) + strengthBuff;
            }
          });
        }
      });

      // Check player death
      if (newPlayer.currentHp <= 0) {
        // Check for Lizard Tail
        const lizardTailIdx = newRelics.findIndex(r => r.id === 'lizard_tail' && !r.used);
        if (lizardTailIdx >= 0) {
          newPlayer.currentHp = Math.floor(newPlayer.maxHp * 0.5);
          newRelics[lizardTailIdx] = { ...newRelics[lizardTailIdx], used: true };
          combatLog.push('Lizard Tail activated!');
        } else {
          // Delete save on game over
          deleteSave();
          return {
            ...state,
            phase: GAME_PHASE.GAME_OVER,
            player: newPlayer,
            relics: newRelics
          };
        }
      }

      // Check victory
      if (newEnemies.length === 0) {
        const goldReward = 10 + Math.floor(Math.random() * 15);
        const cardRewards = getCardRewards(3);

        const { effects: endEffects } = triggerRelics(newRelics, 'onCombatEnd', {
          playerHpPercent: newPlayer.currentHp / newPlayer.maxHp
        });
        newPlayer.currentHp = Math.min(newPlayer.maxHp, newPlayer.currentHp + endEffects.heal);

        return {
          ...state,
          phase: GAME_PHASE.COMBAT_REWARD,
          player: newPlayer,
          enemies: newEnemies,
          relics: newRelics,
          combatLog,
          combatRewards: {
            gold: goldReward,
            cardRewards
          }
        };
      }

      // ========== START NEW PLAYER TURN ==========
      const newTurn = state.turn + 1;
      combatLog.push(`--- Turn ${newTurn + 1} ---`);

      // Remove block (unless Barricade)
      if (!newPlayer.barricade) {
        // Calipers: keep block minus 15
        const calipersRelic = newRelics.find(r => r.id === 'calipers');
        if (calipersRelic) {
          newPlayer.block = Math.max(0, newPlayer.block - 15);
        } else {
          newPlayer.block = 0;
        }
      }

      // Apply pending block from Self-Forming Clay
      if (newPlayer.pendingBlock > 0) {
        newPlayer.block += newPlayer.pendingBlock;
        combatLog.push(`Gained ${newPlayer.pendingBlock} Block from Self-Forming Clay`);
        newPlayer.pendingBlock = 0;
      }

      // Decrement intangible
      if (newPlayer.intangible > 0) newPlayer.intangible--;

      // Get passive relic effects for energy
      const passiveEffects = getPassiveRelicEffects(newRelics, {
        playerHpPercent: newPlayer.currentHp / newPlayer.maxHp
      });

      // Reset energy (with boss relic bonuses)
      if (passiveEffects.conserveEnergy) {
        // Ice Cream: unused energy carries over
        newPlayer.energy += newPlayer.maxEnergy + passiveEffects.extraEnergy;
      } else {
        newPlayer.energy = newPlayer.maxEnergy + passiveEffects.extraEnergy;
      }

      // Apply berserk
      if (newPlayer.berserk > 0) {
        newPlayer.energy += newPlayer.berserk;
      }

      // Apply demon form
      if (newPlayer.demonForm > 0) {
        newPlayer.strength += newPlayer.demonForm;
        combatLog.push(`Demon Form granted ${newPlayer.demonForm} Strength`);
      }

      // Apply brutality
      if (newPlayer.brutality) {
        newPlayer.currentHp = Math.max(1, newPlayer.currentHp - 1);
        // Rupture: gain strength when losing HP from Brutality
        if (newPlayer.rupture > 0) {
          newPlayer.strength = (newPlayer.strength || 0) + newPlayer.rupture;
          combatLog.push(`Rupture granted ${newPlayer.rupture} Strength`);
        }
      }

      // Apply regen (heal at turn start)
      if (newPlayer.regen > 0) {
        const healAmount = newPlayer.regen;
        newPlayer.currentHp = Math.min(newPlayer.maxHp, newPlayer.currentHp + healAmount);
        newPlayer.regen--;
        combatLog.push(`Regen healed ${healAmount} HP`);
      }

      // Apply plated armor (gain block at turn start)
      if (newPlayer.platedArmor > 0) {
        newPlayer.block += newPlayer.platedArmor;
        combatLog.push(`Plated Armor granted ${newPlayer.platedArmor} Block`);
      }

      // Decrement debuffs
      if (newPlayer.vulnerable > 0) newPlayer.vulnerable--;
      if (newPlayer.weak > 0) newPlayer.weak--;
      if (newPlayer.frail > 0) newPlayer.frail--;

      // Reset turn counters
      newPlayer.cardsPlayedThisTurn = 0;
      newPlayer.attacksPlayedThisTurn = 0;
      newPlayer.skillsPlayedThisTurn = 0;
      newPlayer.powersPlayedThisTurn = 0;

      // Apply turn start relic effects (Mercury Hourglass, Horn Cleat)
      const { effects: turnStartEffects, updatedRelics: turnStartRelics } = triggerRelics(newRelics, 'onTurnStart', {
        turn: newTurn
      });
      newRelics = turnStartRelics;

      if (turnStartEffects.block > 0) {
        newPlayer.block += turnStartEffects.block;
        combatLog.push(`Relic granted ${turnStartEffects.block} Block`);
      }
      if (turnStartEffects.damageAll > 0) {
        newEnemies = newEnemies.map(enemy => {
          if (enemy.currentHp <= 0) return enemy;
          return applyDamageToTarget(enemy, turnStartEffects.damageAll);
        });
        combatLog.push(`Mercury Hourglass dealt ${turnStartEffects.damageAll} to all enemies`);
      }

      // Lantern: +1 energy on first turn
      if (newTurn === 0) {
        const { effects: firstTurnEffects } = triggerRelics(newRelics, 'onFirstTurn', {});
        newPlayer.energy += firstTurnEffects.energy;
      }

      // Clear enemy block and decrement debuffs
      newEnemies = newEnemies.map(enemy => {
        const e = { ...enemy };
        e.block = 0;
        if (e.vulnerable > 0) e.vulnerable--;
        if (e.weak > 0) e.weak--;
        if (e.ritual > 0) {
          e.strength = (e.strength || 0) + e.ritual;
          combatLog.push(`${e.name} gains ${e.ritual} Strength from Ritual`);
        }
        return e;
      });

      // Draw cards
      let drawCount = 5;
      if (newPlayer.brutality) drawCount++;
      drawCount += passiveEffects.extraDraw; // Snecko Eye, etc.
      // Apply draw reduction (Time Eater's Ripple)
      if (newPlayer.drawReduction > 0) {
        drawCount = Math.max(0, drawCount - newPlayer.drawReduction);
        newPlayer.drawReduction = 0; // Reset after applying
      }

      // Don't draw if noDrawNextTurn was set (Battle Trance)
      if (!newPlayer.noDrawNextTurn) {
        for (let i = 0; i < drawCount; i++) {
          if (newDrawPile.length === 0 && newDiscardPile.length > 0) {
            newDrawPile = shuffleArray(newDiscardPile);
            newDiscardPile = [];
          }
          if (newDrawPile.length > 0) {
            const drawnCard = newDrawPile.shift();
            newHand.push(drawnCard);

            // Handle draw triggers
            if (drawnCard.type === CARD_TYPES.STATUS && newPlayer.evolve > 0) {
              // Draw extra cards from Evolve
              for (let e = 0; e < newPlayer.evolve; e++) {
                if (newDrawPile.length === 0 && newDiscardPile.length > 0) {
                  newDrawPile = shuffleArray(newDiscardPile);
                  newDiscardPile = [];
                }
                if (newDrawPile.length > 0) {
                  newHand.push(newDrawPile.shift());
                }
              }
              combatLog.push(`Evolve drew ${newPlayer.evolve} card(s)`);
            }

            // Fire Breathing: damage all on Status/Curse draw
            if ((drawnCard.type === CARD_TYPES.STATUS || drawnCard.type === CARD_TYPES.CURSE) && newPlayer.fireBreathing > 0) {
              newEnemies = newEnemies.map(enemy => {
                if (enemy.currentHp <= 0) return enemy;
                return applyDamageToTarget(enemy, newPlayer.fireBreathing);
              });
              combatLog.push(`Fire Breathing dealt ${newPlayer.fireBreathing} to all enemies`);
            }

            // Void card: lose energy when drawn
            if (drawnCard.special === 'voidCard') {
              newPlayer.energy = Math.max(0, newPlayer.energy - 1);
              combatLog.push('Void drained 1 Energy');
            }

            // Pain curse: lose 1 HP when drawn
            if (drawnCard.special === 'painCurse') {
              newPlayer.currentHp = Math.max(0, newPlayer.currentHp - 1);
              combatLog.push('Pain dealt 1 damage');
            }
          }
        }
      }
      newPlayer.noDrawNextTurn = false;

      // Set new enemy intents
      newEnemies = newEnemies.map((enemy, _i) => ({
        ...enemy,
        intentData: getEnemyIntent(enemy, newTurn)
      }));

      return {
        ...state,
        player: newPlayer,
        enemies: newEnemies,
        hand: newHand,
        discardPile: newDiscardPile,
        drawPile: newDrawPile,
        exhaustPile: newExhaustPile,
        relics: newRelics,
        turn: newTurn,
        combatLog
      };
    }

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

    case 'LEAVE_SHOP': {
      const { gold: shopGold, deck: shopDeck, relics: shopRelics } = action.payload;
      return {
        ...state,
        player: {
          ...state.player,
          gold: shopGold
        },
        deck: shopDeck,
        relics: shopRelics,
        phase: GAME_PHASE.MAP
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

    case 'PROCEED_TO_MAP': {
      // Check if we beat the boss
      if (state.currentNode?.type === 'boss') {
        if (state.act >= 3) {
          // Delete save on victory
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
      const { cardIndex } = action.payload;
      const card = state.deck[cardIndex];
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

      const newDeck = [...state.deck];
      newDeck[cardIndex] = upgradedCard;

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

    case 'SELECT_CARD_FROM_PILE': {
      const { card, index: _index } = action.payload;
      const selection = state.cardSelection;
      if (!selection) return { ...state, phase: GAME_PHASE.COMBAT, cardSelection: null };

      let newHand = [...state.hand];
      let newDiscardPile = [...state.discardPile];
      let newDrawPile = [...state.drawPile];
      let newExhaustPile = [...state.exhaustPile];
      let combatLog = [...state.combatLog];

      switch (selection.type) {
        case 'discardToDrawTop': {
          // Move selected card from discard to top of draw pile
          const cardIndex = newDiscardPile.findIndex(c => c.instanceId === card.instanceId);
          if (cardIndex >= 0) {
            const [selectedCard] = newDiscardPile.splice(cardIndex, 1);
            newDrawPile.unshift(selectedCard);
            combatLog.push(`Put ${selectedCard.name} on top of draw pile`);
          }
          break;
        }

        case 'handToDrawTop': {
          // Move selected card from hand to top of draw pile
          const cardIndex = newHand.findIndex(c => c.instanceId === card.instanceId);
          if (cardIndex >= 0) {
            const [selectedCard] = newHand.splice(cardIndex, 1);
            newDrawPile.unshift(selectedCard);
            combatLog.push(`Put ${selectedCard.name} on top of draw pile`);
          }
          break;
        }

        case 'upgradeInHand': {
          // Upgrade selected card in hand
          if (selection.upgradeAll) {
            // Upgrade all cards
            newHand = newHand.map(c => {
              if (!c.upgraded && c.upgradedVersion) {
                return { ...c, ...c.upgradedVersion, upgraded: true, name: c.name + '+' };
              }
              return c;
            });
            combatLog.push('Upgraded all cards in hand');
          } else {
            // Upgrade single card
            const cardIndex = newHand.findIndex(c => c.instanceId === card.instanceId);
            if (cardIndex >= 0 && newHand[cardIndex].upgradedVersion) {
              const upgraded = {
                ...newHand[cardIndex],
                ...newHand[cardIndex].upgradedVersion,
                upgraded: true,
                name: newHand[cardIndex].name + '+'
              };
              newHand[cardIndex] = upgraded;
              combatLog.push(`Upgraded ${upgraded.name}`);
            }
          }
          break;
        }

        case 'copyCardInHand': {
          // Copy the selected card
          const copies = selection.copies || 1;
          for (let i = 0; i < copies; i++) {
            newHand.push({ ...card, instanceId: `${card.id}_dw_${Date.now()}_${i}` });
          }
          combatLog.push(`Added ${copies} cop${copies > 1 ? 'ies' : 'y'} of ${card.name} to hand`);
          break;
        }

        case 'retrieveExhausted': {
          // Return card from exhaust to hand
          const cardIndex = newExhaustPile.findIndex(c => c.instanceId === card.instanceId);
          if (cardIndex >= 0) {
            const [selectedCard] = newExhaustPile.splice(cardIndex, 1);
            newHand.push(selectedCard);
            combatLog.push(`Returned ${selectedCard.name} from exhaust`);
          }
          break;
        }

        case 'exhaustChoose': {
          // Exhaust the selected card from hand
          const cardIndex = newHand.findIndex(c => c.instanceId === card.instanceId);
          if (cardIndex >= 0) {
            const [exhaustedCard] = newHand.splice(cardIndex, 1);
            newExhaustPile.push(exhaustedCard);
            combatLog.push(`Exhausted ${exhaustedCard.name}`);
            // Dark Embrace trigger
            if (state.player.darkEmbrace) {
              if (newDrawPile.length === 0 && newDiscardPile.length > 0) {
                newDrawPile = shuffleArray(newDiscardPile);
                newDiscardPile = [];
              }
              if (newDrawPile.length > 0) {
                newHand.push(newDrawPile.shift());
              }
            }
            // Feel No Pain trigger - gain block when exhausting
            if (state.player.feelNoPain > 0) {
              // Return updated player with added block
              return {
                ...state,
                phase: GAME_PHASE.COMBAT,
                cardSelection: null,
                hand: newHand,
                discardPile: newDiscardPile,
                drawPile: newDrawPile,
                exhaustPile: newExhaustPile,
                player: {
                  ...state.player,
                  block: state.player.block + state.player.feelNoPain
                },
                combatLog
              };
            }
          }
          break;
        }
      }

      return {
        ...state,
        phase: GAME_PHASE.COMBAT,
        cardSelection: null,
        hand: newHand,
        discardPile: newDiscardPile,
        drawPile: newDrawPile,
        exhaustPile: newExhaustPile,
        combatLog
      };
    }

    case 'CANCEL_CARD_SELECTION': {
      return {
        ...state,
        phase: GAME_PHASE.COMBAT,
        cardSelection: null
      };
    }

    case 'SPAWN_ENEMIES': {
      // Used for slime splits and summons
      const { enemies: newEnemies } = action.payload;
      return {
        ...state,
        enemies: [...state.enemies, ...newEnemies]
      };
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

      // Reconstruct deck from card IDs
      const deck = saveData.deck.map((cardId, index) => {
        const baseCard = getCardById(cardId);
        if (!baseCard) return null;
        return { ...baseCard, instanceId: `${cardId}_${index}` };
      }).filter(Boolean);

      // Reconstruct relics from relic IDs
      const relics = saveData.relics.map(relicId => {
        const baseRelic = getRelicById(relicId);
        if (!baseRelic) return null;
        return { ...baseRelic };
      }).filter(Boolean);

      return {
        ...createInitialState(),
        phase: GAME_PHASE.MAP,
        player: {
          ...createInitialState().player,
          currentHp: saveData.player.hp,
          maxHp: saveData.player.maxHp,
          gold: saveData.player.gold,
        },
        deck,
        relics,
        map: saveData.map,
        currentNode: saveData.currentNode,
        currentFloor: saveData.floor,
        act: saveData.act,
      };
    }

    case 'DELETE_SAVE': {
      deleteSave();
      return state;
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

  const playCard = useCallback((card, targetIndex) => {
    dispatch({ type: 'PLAY_CARD', payload: { card, targetIndex } });
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
    deleteSaveState
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
