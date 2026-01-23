/**
 * Effect Processor System
 *
 * Centralized system for applying effects (damage, debuffs, buffs, status)
 * to both players and enemies. This provides a single source of truth for
 * how effects are resolved, making it easy to add new effects without
 * modifying multiple places in the code.
 *
 * Usage:
 *   import { applyPlayerDebuff, applyEnemyDebuff, applyDamageToPlayer, exhaustCard } from './effectProcessor';
 *
 * @module systems/effectProcessor
 */

import { ALL_CARDS, getRandomCard } from '../data/cards';
import { shuffleArray } from '../utils/mapGenerator';

/**
 * Registry of all player debuff types.
 * Adding a new debuff type here makes it automatically work with Artifact blocking.
 */
export const PLAYER_DEBUFF_TYPES = ['weak', 'vulnerable', 'frail', 'strengthDown', 'dexterityDown', 'entangle', 'drawReduction'];

/**
 * Registry of all enemy debuff types.
 * Adding a new debuff type here makes it automatically work with enemy Artifact blocking.
 */
export const ENEMY_DEBUFF_TYPES = ['vulnerable', 'weak', 'strengthDown'];

/**
 * Applies a debuff to the player, respecting Artifact.
 *
 * @param {Object} player - Player state object (mutated in place)
 * @param {string} type - The debuff type
 * @param {number} amount - The amount to apply
 * @param {Array} combatLog - Combat log array to push messages to
 * @returns {boolean} true if the debuff was applied, false if blocked by Artifact
 */
export const applyPlayerDebuff = (player, type, amount, combatLog = []) => {
  const isDebuff = PLAYER_DEBUFF_TYPES.includes(type);
  if (isDebuff && player.artifact > 0) {
    player.artifact--;
    combatLog.push('Artifact blocked debuff');
    return false;
  }

  switch (type) {
    case 'weak': player.weak = (player.weak || 0) + amount; break;
    case 'vulnerable': player.vulnerable = (player.vulnerable || 0) + amount; break;
    case 'frail': player.frail = (player.frail || 0) + amount; break;
    case 'entangle': player.entangle = true; break;
    case 'drawReduction': player.drawReduction = (player.drawReduction || 0) + amount; break;
    case 'strengthDown': player.strength = (player.strength || 0) - amount; break;
    case 'dexterityDown': player.dexterity = (player.dexterity || 0) - amount; break;
    default: return false;
  }
  return true;
};

/**
 * Applies a debuff to an enemy, respecting enemy Artifact.
 *
 * @param {Object} enemy - Enemy object (mutated in place)
 * @param {string} type - The debuff type
 * @param {number} amount - The amount to apply
 * @param {Array} combatLog - Combat log array
 * @returns {boolean} true if the debuff was applied, false if blocked by Artifact
 */
export const applyEnemyDebuff = (enemy, type, amount, combatLog = []) => {
  const isDebuff = ENEMY_DEBUFF_TYPES.includes(type);
  if (isDebuff && enemy.artifact > 0) {
    enemy.artifact--;
    combatLog.push(`${enemy.name}'s Artifact blocked ${type}!`);
    return false;
  }

  switch (type) {
    case 'vulnerable': enemy.vulnerable = (enemy.vulnerable || 0) + amount; break;
    case 'weak': enemy.weak = (enemy.weak || 0) + amount; break;
    case 'strengthDown': enemy.strength = (enemy.strength || 0) - amount; break;
    default: return false;
  }
  combatLog.push(`Applied ${amount} ${type} to ${enemy.name}`);
  return true;
};

/**
 * Applies a buff to an enemy.
 *
 * @param {Object} enemy - Enemy object (mutated in place)
 * @param {string} type - The buff type
 * @param {number} amount - The amount to apply
 * @param {Array} combatLog - Combat log array
 */
export const applyEnemyBuff = (enemy, type, amount, _combatLog = []) => {
  switch (type) {
    case 'strength': enemy.strength = (enemy.strength || 0) + amount; break;
    case 'ritual': enemy.ritual = (enemy.ritual || 0) + amount; break;
    case 'enrage': enemy.enrage = (enemy.enrage || 0) + amount; break;
    case 'thorns': enemy.thorns = (enemy.thorns || 0) + amount; break;
    case 'metallicize': enemy.metallicize = (enemy.metallicize || 0) + amount; break;
    case 'artifact': enemy.artifact = (enemy.artifact || 0) + amount; break;
    default: return false;
  }
  return true;
};

/**
 * Applies damage to the player, respecting block, Intangible, Tungsten Rod, Torii, and Flight.
 *
 * @param {Object} player - Player state (mutated in place)
 * @param {number} damage - Raw damage amount
 * @param {Array} relics - Player's relics
 * @param {Array} combatLog - Combat log array
 * @returns {number} Actual HP lost (after block, Intangible, etc.)
 */
export const applyDamageToPlayer = (player, damage, relics = [], combatLog = []) => {
  let effectiveDamage = damage;

  // Flight: reduce damage by 50%
  if (player.flight > 0) {
    effectiveDamage = Math.floor(effectiveDamage / 2);
    player.flight--;
    combatLog.push('Flight reduced damage');
  }

  // Intangible: reduce all damage to 1
  if (player.intangible > 0) {
    effectiveDamage = 1;
  }

  // Torii: reduce low damage to 1
  const torii = relics.find(r => r.id === 'torii');
  if (torii && effectiveDamage <= 5 && effectiveDamage > 0) {
    effectiveDamage = 1;
  }

  // Apply to block first
  let hpLost = 0;
  if (player.block >= effectiveDamage) {
    player.block -= effectiveDamage;
  } else {
    let remainingDamage = effectiveDamage - player.block;
    player.block = 0;

    // Tungsten Rod: reduce HP loss by 1
    const tungstenRod = relics.find(r => r.id === 'tungsten_rod');
    if (tungstenRod && remainingDamage > 0) {
      remainingDamage = Math.max(0, remainingDamage - 1);
    }

    hpLost = remainingDamage;
    player.currentHp = Math.max(0, player.currentHp - remainingDamage);
  }

  return hpLost;
};

/**
 * Handles all exhaust triggers (Dark Embrace, Feel No Pain, Dead Branch).
 * Call this whenever a card is exhausted.
 *
 * @param {Object} ctx - Effect context containing player, hand, drawPile, discardPile, relics, combatLog
 */
export const handleExhaustTriggers = (ctx) => {
  // Dark Embrace: draw a card
  if (ctx.player.darkEmbrace) {
    if (ctx.drawPile.length === 0 && ctx.discardPile.length > 0) {
      ctx.drawPile = shuffleArray(ctx.discardPile);
      ctx.discardPile = [];
    }
    if (ctx.drawPile.length > 0) {
      ctx.hand.push(ctx.drawPile.shift());
    }
  }

  // Feel No Pain: gain block
  if (ctx.player.feelNoPain > 0) {
    ctx.player.block += ctx.player.feelNoPain;
  }

  // Dead Branch: add random card on exhaust
  if (ctx.relics && ctx.relics.some(r => r.id === 'dead_branch')) {
    const randomCard = getRandomCard(null, null);
    if (randomCard) {
      ctx.hand.push({ ...randomCard, instanceId: `${randomCard.id}_branch_${Date.now()}_${Math.random()}` });
      ctx.combatLog.push(`Dead Branch added ${randomCard.name}`);
    }
  }
};

/**
 * Exhausts a card from a given pile, triggering all exhaust-related effects.
 *
 * @param {Object} card - The card to exhaust
 * @param {Array} sourcePile - The pile to remove the card from (mutated)
 * @param {Object} ctx - Effect context
 * @returns {boolean} true if card was found and exhausted
 */
export const exhaustCard = (card, sourcePile, ctx) => {
  const idx = sourcePile.findIndex(c => c.instanceId === card.instanceId);
  if (idx < 0) return false;

  const [exhaustedCard] = sourcePile.splice(idx, 1);
  ctx.exhaustPile.push(exhaustedCard);
  ctx.combatLog.push(`Exhausted ${exhaustedCard.name}`);

  handleExhaustTriggers(ctx);
  return true;
};

/**
 * Draws cards from draw pile to hand, reshuffling discard if needed.
 *
 * @param {number} count - Number of cards to draw
 * @param {Object} ctx - Object with hand, drawPile, discardPile arrays
 * @returns {Array} The cards that were drawn
 */
export const drawCards = (count, ctx) => {
  const drawn = [];
  for (let i = 0; i < count; i++) {
    if (ctx.drawPile.length === 0 && ctx.discardPile.length > 0) {
      ctx.drawPile = shuffleArray(ctx.discardPile);
      ctx.discardPile = [];
    }
    if (ctx.drawPile.length > 0) {
      const card = ctx.drawPile.shift();
      ctx.hand.push(card);
      drawn.push(card);
    }
  }
  return drawn;
};

/**
 * Processes the start of a new player turn: decrements debuffs, resets per-turn state.
 *
 * @param {Object} player - Player state (mutated)
 */
export const processPlayerTurnStart = (player) => {
  // Decrement debuffs
  if (player.vulnerable > 0) player.vulnerable--;
  if (player.weak > 0) player.weak--;
  if (player.frail > 0) player.frail--;

  // Reset per-turn counters
  player.cardsPlayedThisTurn = 0;
  player.attacksPlayedThisTurn = 0;
  player.skillsPlayedThisTurn = 0;
  player.powersPlayedThisTurn = 0;

  // Reset per-turn effects
  player.entangle = false;
};

/**
 * Processes start of new turn for enemies: clears block, decrements debuffs, applies ritual.
 *
 * @param {Array} enemies - Array of enemy objects (mutated)
 * @param {Array} combatLog - Combat log array
 * @returns {Array} Updated enemies array
 */
export const processEnemyTurnStart = (enemies, combatLog = []) => {
  return enemies.map(enemy => {
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
};

/**
 * Gets a status card by ID with a unique instanceId.
 *
 * @param {string} cardId - The status card ID (wound, dazed, burn, slimed)
 * @param {string} [source=''] - Source identifier for the instanceId
 * @returns {Object|null} A card instance or null
 */
export const createStatusCard = (cardId, source = '') => {
  const card = ALL_CARDS.find(c => c.id === cardId);
  if (!card) return null;
  return { ...card, instanceId: `${cardId}_${source}_${Date.now()}_${Math.random()}` };
};

/**
 * Checks if a card can be played given current state.
 *
 * @param {Object} card - The card to check
 * @param {Object} player - Player state
 * @param {Object} passiveEffects - Passive relic effects
 * @returns {{ canPlay: boolean, reason: string }} Whether the card can be played and why not
 */
export const canPlayCard = (card, player, passiveEffects = {}) => {
  const isXCost = card.cost === -1 || card.special === 'xCost';

  if (!isXCost && player.energy < card.cost) {
    return { canPlay: false, reason: 'Not enough energy' };
  }

  if (card.unplayable) {
    return { canPlay: false, reason: 'Card is unplayable' };
  }

  if (player.entangle && card.type === 'attack') {
    return { canPlay: false, reason: 'Entangled - cannot play attacks' };
  }

  if (player.cardsPlayedThisTurn >= (passiveEffects.cardLimit || 999)) {
    return { canPlay: false, reason: 'Card limit reached' };
  }

  return { canPlay: true, reason: '' };
};
