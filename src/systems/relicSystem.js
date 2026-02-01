/**
 * Relic System
 *
 * Handles all relic-related functionality including triggering relics based on
 * game events, applying relic effects, and getting passive relic bonuses.
 *
 * @module systems/relicSystem
 */

import { CARD_TYPES } from '../data/cards';

/**
 * Constants for relic trigger types
 * Used to identify when relics should activate
 */
export const RELIC_TRIGGERS = {
  ON_COMBAT_START: 'onCombatStart',
  ON_COMBAT_END: 'onCombatEnd',
  ON_TURN_START: 'onTurnStart',
  ON_TURN_END: 'onTurnEnd',
  ON_ATTACK_PLAYED: 'onAttackPlayed',
  ON_SKILL_PLAYED: 'onSkillPlayed',
  ON_STRIKE_PLAYED: 'onStrikePlayed',
  ON_FIRST_HP_LOSS: 'onFirstHpLoss',
  ON_FIRST_TURN: 'onFirstTurn',
  ON_DAMAGE_TAKEN: 'onDamageTaken',
  ON_PICKUP: 'onPickup',
  PASSIVE: 'passive'
};

/**
 * Default structure for relic trigger effects
 */
const createDefaultEffects = () => ({
  heal: 0,
  block: 0,
  strength: 0,
  dexterity: 0,
  energy: 0,
  draw: 0,
  damage: 0,
  damageAll: 0,
  vulnerable: 0,
  weak: 0,
  intangible: 0,
  doubleDamage: false,
  blockNextTurn: 0,
  reduceDamage: 0,
  thorns: 0,
  channelOrbs: [],
  addCards: []
});

/**
 * Triggers all relics that match a specific trigger type
 * Handles counter-based relics, one-time-per-combat relics, and turn-specific relics
 *
 * @param {Array} relics - Array of player's relics
 * @param {string} trigger - The trigger type (e.g., 'onCombatStart', 'onTurnEnd')
 * @param {Object} context - Context object containing game state info
 * @param {number} [context.turn] - Current turn number
 * @param {number} [context.playerHpPercent] - Player's HP as percentage of max
 * @param {number} [context.playerBlock] - Player's current block
 * @param {number} [context.incomingDamage] - Amount of incoming damage (for damage reduction)
 * @param {Array} [context.deck] - Player's deck (for curse counting)
 * @returns {Object} Object containing effects to apply and updated relics array
 *
 * @example
 * const { effects, updatedRelics } = triggerRelics(relics, 'onCombatStart', { deck: state.deck });
 * if (effects.block > 0) player.block += effects.block;
 */
export const triggerRelics = (relics, trigger, context = {}) => {
  const effects = createDefaultEffects();

  if (!relics || !Array.isArray(relics)) {
    return { effects, updatedRelics: relics || [] };
  }

  const updatedRelics = relics.map(relic => {
    if (relic.trigger !== trigger) return relic;

    let newRelic = { ...relic };

    // Handle counter-based relics (e.g., Nunchaku counts attacks)
    if (relic.counter !== undefined && relic.threshold) {
      newRelic.counter = (relic.counter || 0) + 1;
      if (newRelic.counter < relic.threshold) {
        return newRelic;
      }
      newRelic.counter = 0;
    }

    // Handle one-time-per-combat relics
    if (relic.usedThisCombat) return relic;
    if (trigger === RELIC_TRIGGERS.ON_FIRST_HP_LOSS && !relic.usedThisCombat) {
      newRelic.usedThisCombat = true;
    }

    // Handle turn-specific relics (Horn Cleat activates on turn 2)
    if (relic.turn && context.turn !== relic.turn) return relic;

    // Apply effect
    const effect = relic.effect;
    if (!effect) return newRelic;

    applyRelicEffect(effect, effects, trigger, context);

    return newRelic;
  });

  return { effects, updatedRelics };
};

/**
 * Applies a single relic effect to the effects accumulator
 *
 * @param {Object} effect - The relic's effect object
 * @param {Object} effects - The effects accumulator to modify
 * @param {string} trigger - The trigger type
 * @param {Object} context - Context object containing game state
 */
export const applyRelicEffect = (effect, effects, trigger, context) => {
  if (!effect || !effects) return;

  switch (effect.type) {
    case 'heal':
      if (trigger === RELIC_TRIGGERS.ON_COMBAT_END && effect.threshold) {
        // Only heal if HP below threshold (e.g., Meat on the Bone)
        if (context.playerHpPercent <= effect.threshold) {
          effects.heal += effect.amount;
        }
      } else {
        effects.heal += effect.amount;
      }
      break;

    case 'healIfLowHp':
      if (context.playerHpPercent <= effect.threshold) {
        effects.heal += effect.amount;
      }
      break;

    case 'block':
      effects.block += effect.amount;
      break;

    case 'blockIfNone':
      // Orichalcum: gain block only if you have none
      if (context.playerBlock === 0) {
        effects.block += effect.amount;
      }
      break;

    case 'strength':
      effects.strength += effect.amount;
      break;

    case 'dexterity':
      effects.dexterity += effect.amount;
      break;

    case 'energy':
      effects.energy += effect.amount;
      break;

    case 'draw':
      effects.draw += effect.amount;
      break;

    case 'damageAll':
      effects.damageAll += effect.amount;
      break;

    case 'vulnerable':
      effects.vulnerable += effect.amount;
      break;

    case 'weak':
      effects.weak += effect.amount;
      break;

    case 'intangible':
      effects.intangible += effect.amount;
      break;

    case 'doubleDamage':
      effects.doubleDamage = true;
      break;

    case 'thorns':
      effects.thorns += effect.amount;
      break;

    case 'blockNextTurn':
      effects.blockNextTurn += effect.amount;
      break;

    case 'reduceLowDamage':
      // Torii: reduce damage <= 5 to 1
      if (context.incomingDamage && context.incomingDamage <= effect.threshold) {
        effects.reduceDamage = context.incomingDamage - 1;
      }
      break;

    case 'reduceHpLoss':
      effects.reduceDamage += effect.amount;
      break;

    case 'strengthPerCurse':
      // Du-Vu Doll: gain strength per curse in deck
      const curseCount = context.deck?.filter(c => c.type === CARD_TYPES.CURSE).length || 0;
      effects.strength += curseCount * effect.amount;
      break;

    case 'channelOrb':
      effects.channelOrbs.push(effect.orbType);
      break;

    case 'addCardToHand':
      effects.addCards.push(effect.cardId);
      break;

    default:
      // Unknown effect type, ignore
      break;
  }
};

/**
 * Gets passive relic effects that are always active
 * These don't need triggering but provide constant bonuses
 *
 * @param {Array} relics - Array of player's relics
 * @param {Object} context - Context object containing game state
 * @param {number} [context.playerHpPercent] - Player's HP as percentage of max
 * @returns {Object} Object containing all passive effect values
 *
 * @example
 * const passiveEffects = getPassiveRelicEffects(relics, { playerHpPercent: 0.5 });
 * player.energy = player.maxEnergy + passiveEffects.extraEnergy;
 */
export const getPassiveRelicEffects = (relics, context = {}) => {
  const effects = {
    extraEnergy: 0,
    extraDraw: 0,
    vulnerableMultiplier: 1.5,
    healingMultiplier: 1,
    shopDiscount: 1,
    hideIntents: false,
    cardLimit: 999,
    conserveEnergy: false,
    strengthBonus: 0
  };

  if (!relics || !Array.isArray(relics)) {
    return effects;
  }

  relics.forEach(relic => {
    if (relic.trigger !== RELIC_TRIGGERS.PASSIVE) return;
    const effect = relic.effect;
    if (!effect) return;

    if (effect.type === 'energyBonus') {
      effects.extraEnergy += effect.amount;
    }
    if (effect.type === 'drawBonus') {
      effects.extraDraw += effect.amount;
    }
    if (effect.type === 'vulnerableBonus') {
      // Paper Phrog: +25% vulnerable damage
      effects.vulnerableMultiplier = 1.5 + effect.amount;
    }
    if (effect.type === 'healingBonus') {
      // Magic Flower: +50% healing at rest sites
      effects.healingMultiplier = 1 + effect.amount;
    }
    if (effect.type === 'shopDiscount') {
      // Membership Card: 50% shop discount
      effects.shopDiscount = 1 - effect.amount;
    }
    if (effect.hideIntents) {
      // Runic Dome: enemies don't show intents
      effects.hideIntents = true;
    }
    if (effect.cardLimit) {
      // Velvet Choker: can only play 6 cards per turn
      effects.cardLimit = effect.cardLimit;
    }
    if (effect.type === 'conserveEnergy') {
      // Ice Cream: energy carries over between turns
      effects.conserveEnergy = true;
    }
    if (effect.type === 'strengthIfLowHp' && context.playerHpPercent <= effect.threshold) {
      // Red Skull: gain strength when below 50% HP
      effects.strengthBonus += effect.amount;
    }
  });

  return effects;
};

/**
 * Resets relics for a new combat
 * Clears usedThisCombat flags and resets counters
 *
 * @param {Array} relics - Array of player's relics
 * @returns {Array} Array of relics with reset state
 */
export const resetRelicsForCombat = (relics) => {
  if (!relics || !Array.isArray(relics)) {
    return [];
  }

  return relics.map(r => ({
    ...r,
    usedThisCombat: false,
    counter: r.counter !== undefined ? 0 : undefined
  }));
};

/**
 * Handles relic pickup effects
 * Some relics have immediate effects when picked up
 *
 * @param {Object} relic - The relic being picked up
 * @param {Object} player - The player object
 * @returns {Object} Updated player object
 */
export const handleRelicPickup = (relic, player) => {
  if (!relic || relic.trigger !== RELIC_TRIGGERS.ON_PICKUP) {
    return player;
  }

  const newPlayer = { ...player };
  const effect = relic.effect;

  if (!effect) return newPlayer;

  if (effect.type === 'maxHp') {
    newPlayer.maxHp += effect.amount;
    newPlayer.currentHp += effect.amount;
  }
  if (effect.type === 'heal') {
    newPlayer.currentHp = Math.min(newPlayer.maxHp, newPlayer.currentHp + effect.amount);
  }
  if (effect.type === 'gold') {
    newPlayer.gold = (newPlayer.gold || 0) + effect.amount;
  }

  return newPlayer;
};

/**
 * Checks if a relic with a specific ID exists and is active
 *
 * @param {Array} relics - Array of player's relics
 * @param {string} relicId - The ID of the relic to check
 * @returns {Object|null} The relic if found, null otherwise
 */
export const findRelic = (relics, relicId) => {
  if (!relics || !Array.isArray(relics)) {
    return null;
  }
  return relics.find(r => r.id === relicId) || null;
};

/**
 * Checks if a relic has been used this combat (for one-time relics)
 *
 * @param {Array} relics - Array of player's relics
 * @param {string} relicId - The ID of the relic to check
 * @returns {boolean} True if the relic has been used this combat
 */
export const isRelicUsedThisCombat = (relics, relicId) => {
  const relic = findRelic(relics, relicId);
  return relic?.usedThisCombat || false;
};
