/**
 * Potion System
 *
 * Handles all potion-related functionality including obtaining, using,
 * and discarding potions. Manages the player's potion slots and applies
 * potion effects to the game state.
 *
 * @module systems/potionSystem
 */

import { ALL_POTIONS, POTION_RARITY, POTION_TYPE, POTION_TARGET, getPotionById } from '../data/potions';

/**
 * Game phases relevant to the potion system.
 * Defined locally to avoid circular dependency with GameContext.
 */
const POTION_GAME_PHASES = {
  COMBAT: 'combat'
};

/**
 * Maximum number of potion slots available to the player
 */
export const MAX_POTION_SLOTS = 3;

/**
 * Returns a random potion, optionally filtered by rarity.
 * If no rarity is specified, uses weighted random selection:
 * 65% common, 25% uncommon, 10% rare.
 *
 * @param {string|null} rarity - Optional rarity filter ('common'|'uncommon'|'rare')
 * @returns {Object} A potion definition object
 *
 * @example
 * const potion = getRandomPotion(); // any rarity
 * const rarePotion = getRandomPotion('rare'); // only rare potions
 */
export const getRandomPotion = (rarity = null) => {
  let potions = [...ALL_POTIONS];

  if (rarity) {
    potions = potions.filter(p => p.rarity === rarity);
  } else {
    // Weighted random rarity selection
    const roll = Math.random();
    let selectedRarity;
    if (roll < 0.65) selectedRarity = POTION_RARITY.COMMON;
    else if (roll < 0.90) selectedRarity = POTION_RARITY.UNCOMMON;
    else selectedRarity = POTION_RARITY.RARE;

    potions = potions.filter(p => p.rarity === selectedRarity);
  }

  if (potions.length === 0) return ALL_POTIONS[0]; // fallback

  return potions[Math.floor(Math.random() * potions.length)];
};

/**
 * Checks if a potion can be used in the current game context.
 * Combat-only potions cannot be used outside combat.
 * Health Potion (anytime type) can be used outside combat for healing.
 * Instant potions (like Fairy in a Bottle) are not manually usable.
 *
 * @param {Object} potion - The potion definition object
 * @param {Object} gameState - The current game state
 * @param {string} gameState.phase - Current game phase
 * @returns {boolean} Whether the potion can be used
 *
 * @example
 * if (canUsePotion(potion, gameState)) {
 *   applyPotionEffect(potion, gameState, targetIndex);
 * }
 */
export const canUsePotion = (potion, gameState) => {
  if (!potion) return false;

  const isInCombat = gameState.phase === POTION_GAME_PHASES.COMBAT;

  // Instant potions are automatically triggered, not manually used
  if (potion.type === POTION_TYPE.INSTANT) return false;

  // Combat-only potions require being in combat
  if (potion.type === POTION_TYPE.COMBAT && !isInCombat) return false;

  // Anytime potions with heal effect: check if healing is needed
  if (potion.effect.type === 'heal') {
    const player = gameState.player;
    if (player.currentHp >= player.maxHp) return false;
  }

  return true;
};

/**
 * Applies a potion's effect to the game state and returns the new state.
 * Handles all effect types: damage, block, energy, heal, buff, debuff, draw, etc.
 *
 * @param {Object} potion - The potion definition object
 * @param {Object} gameState - The current game state (immutable - returns new state)
 * @param {number|null} targetIndex - Index of the target enemy (for targeted potions)
 * @returns {Object} The new game state after applying the potion effect
 *
 * @example
 * const newState = applyPotionEffect(firePotion, gameState, 0);
 * // Enemy at index 0 takes 20 damage
 */
export const applyPotionEffect = (potion, gameState, targetIndex = null) => {
  if (!potion || !potion.effect) return gameState;

  const effect = potion.effect;
  let newState = { ...gameState };
  let newPlayer = { ...newState.player };
  let newEnemies = newState.enemies ? newState.enemies.map(e => ({ ...e })) : [];

  switch (effect.type) {
    case 'damage': {
      // Deal damage to a single target enemy
      if (targetIndex !== null && targetIndex >= 0 && targetIndex < newEnemies.length) {
        const enemy = newEnemies[targetIndex];
        const damage = effect.amount;
        const actualDamage = Math.max(0, damage - (enemy.block || 0));
        const remainingBlock = Math.max(0, (enemy.block || 0) - damage);
        newEnemies[targetIndex] = {
          ...enemy,
          block: remainingBlock,
          currentHp: Math.max(0, enemy.currentHp - actualDamage)
        };
      }
      break;
    }

    case 'damageAll': {
      // Deal damage to all enemies
      newEnemies = newEnemies.map(enemy => {
        const damage = effect.amount;
        const actualDamage = Math.max(0, damage - (enemy.block || 0));
        const remainingBlock = Math.max(0, (enemy.block || 0) - damage);
        return {
          ...enemy,
          block: remainingBlock,
          currentHp: Math.max(0, enemy.currentHp - actualDamage)
        };
      });
      break;
    }

    case 'block': {
      // Gain block
      newPlayer.block = (newPlayer.block || 0) + effect.amount;
      break;
    }

    case 'energy': {
      // Gain energy
      newPlayer.energy = (newPlayer.energy || 0) + effect.amount;
      break;
    }

    case 'heal': {
      // Heal HP (capped at maxHp)
      newPlayer.currentHp = Math.min(
        newPlayer.maxHp,
        newPlayer.currentHp + effect.amount
      );
      break;
    }

    case 'buff': {
      // Apply a buff to the player (strength, dexterity, platedArmor, metallicize)
      const buffKey = effect.buff;
      if (buffKey in newPlayer) {
        newPlayer[buffKey] = (newPlayer[buffKey] || 0) + effect.amount;
      }
      break;
    }

    case 'debuff': {
      // Apply debuff to target or all enemies
      const debuffKey = effect.debuff;
      if (potion.targetType === POTION_TARGET.ALL_ENEMIES) {
        newEnemies = newEnemies.map(enemy => ({
          ...enemy,
          [debuffKey]: (enemy[debuffKey] || 0) + effect.amount
        }));
      } else if (targetIndex !== null && targetIndex >= 0 && targetIndex < newEnemies.length) {
        newEnemies[targetIndex] = {
          ...newEnemies[targetIndex],
          [debuffKey]: (newEnemies[targetIndex][debuffKey] || 0) + effect.amount
        };
      }
      break;
    }

    case 'draw': {
      // Draw cards - add draw count to a pendingDraw field for the combat system to process
      newPlayer.pendingDraw = (newPlayer.pendingDraw || 0) + effect.amount;
      break;
    }

    case 'doubleTap': {
      // Next card is played twice
      newPlayer.doubleTap = (newPlayer.doubleTap || 0) + effect.amount;
      break;
    }

    case 'revive': {
      // Fairy in a Bottle: heal to percentage of max HP
      newPlayer.currentHp = Math.max(
        newPlayer.currentHp,
        Math.floor(newPlayer.maxHp * effect.amount)
      );
      break;
    }

    default:
      break;
  }

  newState.player = newPlayer;
  newState.enemies = newEnemies;
  return newState;
};

/**
 * Adds a potion to the first available slot.
 * If all slots are full, the potion is discarded (state unchanged).
 *
 * @param {Object} gameState - The current game state
 * @param {string} potionId - The ID of the potion to add
 * @returns {Object} Object with newState and whether the potion was added
 *
 * @example
 * const { newState, added } = addPotion(gameState, 'fire_potion');
 * if (!added) console.log('Potion slots full!');
 */
export const addPotion = (gameState, potionId) => {
  const potion = getPotionById(potionId);
  if (!potion) return { newState: gameState, added: false };

  const potions = [...(gameState.potions || [null, null, null])];
  const emptySlot = potions.findIndex(slot => slot === null);

  if (emptySlot === -1) {
    // All slots full, potion is discarded
    return { newState: gameState, added: false };
  }

  potions[emptySlot] = { ...potion };
  return {
    newState: { ...gameState, potions },
    added: true
  };
};

/**
 * Removes a potion from a specific slot index.
 *
 * @param {Object} gameState - The current game state
 * @param {number} slotIndex - The slot index to clear (0-2)
 * @returns {Object} The new game state with the potion removed
 *
 * @example
 * const newState = removePotion(gameState, 1); // Remove potion from slot 1
 */
export const removePotion = (gameState, slotIndex) => {
  if (slotIndex < 0 || slotIndex >= MAX_POTION_SLOTS) return gameState;

  const potions = [...(gameState.potions || [null, null, null])];
  potions[slotIndex] = null;

  return { ...gameState, potions };
};

/**
 * Generates potion rewards for combat victory.
 * Higher floors have slightly better odds for uncommon/rare potions.
 * Avoids duplicate potions in the same reward set.
 *
 * @param {number} count - Number of potions to generate (default 1)
 * @param {number} floor - Current floor number (affects rarity odds)
 * @returns {Array} Array of potion definition objects
 *
 * @example
 * const potionRewards = getPotionRewards(1, 10);
 * // Returns array with 1 potion, odds skewed by floor 10
 */
export const getPotionRewards = (count = 1, floor = 0) => {
  const rewards = [];

  for (let i = 0; i < count; i++) {
    // Floor bonus: higher floors shift rarity odds toward uncommon/rare
    const floorBonus = Math.min(floor * 0.01, 0.15);

    const roll = Math.random();
    let rarity;
    if (roll < (0.65 - floorBonus)) rarity = POTION_RARITY.COMMON;
    else if (roll < (0.90 - floorBonus * 0.5)) rarity = POTION_RARITY.UNCOMMON;
    else rarity = POTION_RARITY.RARE;

    const potion = getRandomPotion(rarity);

    // Avoid duplicates in the same reward set
    if (potion && !rewards.find(r => r.id === potion.id)) {
      rewards.push({ ...potion });
    } else {
      // If duplicate, try again
      i--;
      // Safety: prevent infinite loops if not enough unique potions
      if (rewards.length >= ALL_POTIONS.filter(p => p.rarity === rarity).length) {
        break;
      }
    }
  }

  return rewards;
};
