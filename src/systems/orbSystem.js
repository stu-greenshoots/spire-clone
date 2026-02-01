/**
 * Orb System for The Defect
 *
 * Orbs are channeled into orb slots. Each orb has:
 * - Passive: triggers at end of player turn
 * - Evoke: triggers when orb is removed (manually or by overflow)
 *
 * Focus scales passive and evoke values for Lightning, Frost, and Dark.
 * Plasma is unaffected by Focus.
 *
 * @module systems/orbSystem
 */

import { applyDamageToTarget } from './combatSystem';

export const ORB_TYPES = {
  LIGHTNING: 'lightning',
  FROST: 'frost',
  DARK: 'dark',
  PLASMA: 'plasma'
};

/**
 * Create a new orb instance
 * @param {string} type - ORB_TYPES value
 * @returns {Object} orb instance
 */
export const createOrb = (type) => ({
  id: `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  type,
  // Dark orbs accumulate damage each turn
  darkDamage: type === ORB_TYPES.DARK ? 6 : 0
});

/**
 * Get the passive effect value for an orb (affected by Focus)
 * @param {Object} orb - The orb
 * @param {number} focus - Player's focus value
 * @returns {number} passive value
 */
export const getOrbPassiveValue = (orb, focus) => {
  switch (orb.type) {
    case ORB_TYPES.LIGHTNING: return Math.max(0, 3 + focus);
    case ORB_TYPES.FROST: return Math.max(0, 2 + focus);
    case ORB_TYPES.DARK: return Math.max(0, 6 + focus);
    case ORB_TYPES.PLASMA: return 1; // Always 1 energy, unaffected by Focus
    default: return 0;
  }
};

/**
 * Get the evoke effect value for an orb (affected by Focus)
 * @param {Object} orb - The orb
 * @param {number} focus - Player's focus value
 * @returns {number} evoke value
 */
export const getOrbEvokeValue = (orb, focus) => {
  switch (orb.type) {
    case ORB_TYPES.LIGHTNING: return Math.max(0, 8 + focus);
    case ORB_TYPES.FROST: return Math.max(0, 5 + focus);
    case ORB_TYPES.DARK: return Math.max(0, orb.darkDamage + focus);
    case ORB_TYPES.PLASMA: return 2; // Always 2 energy, unaffected by Focus
    default: return 0;
  }
};

/**
 * Apply an orb's passive effect
 * @param {Object} orb - The orb
 * @param {Object} player - Player state (mutated)
 * @param {Array} enemies - Enemy array
 * @param {number} focus - Player focus
 * @param {Array} combatLog - Combat log (mutated)
 * @returns {{ enemies: Array }} updated enemies
 */
export const applyOrbPassive = (orb, player, enemies, focus, combatLog) => {
  const value = getOrbPassiveValue(orb, focus);
  let newEnemies = enemies;

  switch (orb.type) {
    case ORB_TYPES.LIGHTNING: {
      // Deal damage to random enemy
      const aliveEnemies = newEnemies.filter(e => e.currentHp > 0);
      if (aliveEnemies.length > 0 && value > 0) {
        const targetIdx = Math.floor(Math.random() * aliveEnemies.length);
        const targetInstanceId = aliveEnemies[targetIdx].instanceId;
        newEnemies = newEnemies.map(e =>
          e.instanceId === targetInstanceId ? applyDamageToTarget(e, value) : e
        );
        combatLog.push(`Lightning Orb dealt ${value} damage to ${aliveEnemies[targetIdx].name}`);
      }
      break;
    }
    case ORB_TYPES.FROST: {
      // Gain block
      if (value > 0) {
        player.block += value;
        combatLog.push(`Frost Orb granted ${value} Block`);
      }
      break;
    }
    case ORB_TYPES.DARK: {
      // Accumulate damage (already stored on orb — caller must update orb.darkDamage)
      // The passive value is added to darkDamage each turn
      combatLog.push(`Dark Orb charged to ${orb.darkDamage + value}`);
      break;
    }
    case ORB_TYPES.PLASMA: {
      // Gain energy
      player.energy += value;
      combatLog.push(`Plasma Orb granted ${value} Energy`);
      break;
    }
  }

  return { enemies: newEnemies };
};

/**
 * Apply an orb's evoke effect
 * @param {Object} orb - The orb being evoked
 * @param {Object} player - Player state (mutated)
 * @param {Array} enemies - Enemy array
 * @param {number} focus - Player focus
 * @param {Array} combatLog - Combat log (mutated)
 * @returns {{ enemies: Array }} updated enemies
 */
export const applyOrbEvoke = (orb, player, enemies, focus, combatLog) => {
  const value = getOrbEvokeValue(orb, focus);
  let newEnemies = enemies;

  switch (orb.type) {
    case ORB_TYPES.LIGHTNING: {
      // Deal damage to random enemy
      const aliveEnemies = newEnemies.filter(e => e.currentHp > 0);
      if (aliveEnemies.length > 0 && value > 0) {
        const targetIdx = Math.floor(Math.random() * aliveEnemies.length);
        const targetInstanceId = aliveEnemies[targetIdx].instanceId;
        newEnemies = newEnemies.map(e =>
          e.instanceId === targetInstanceId ? applyDamageToTarget(e, value) : e
        );
        combatLog.push(`Lightning Orb evoked for ${value} damage to ${aliveEnemies[targetIdx].name}`);
      }
      break;
    }
    case ORB_TYPES.FROST: {
      // Gain block
      if (value > 0) {
        player.block += value;
        combatLog.push(`Frost Orb evoked for ${value} Block`);
      }
      break;
    }
    case ORB_TYPES.DARK: {
      // Deal accumulated damage to lowest HP enemy
      if (value > 0) {
        const aliveEnemies = newEnemies.filter(e => e.currentHp > 0);
        if (aliveEnemies.length > 0) {
          const lowestHp = aliveEnemies.reduce((min, e) => e.currentHp < min.currentHp ? e : min, aliveEnemies[0]);
          newEnemies = newEnemies.map(e =>
            e.instanceId === lowestHp.instanceId ? applyDamageToTarget(e, value) : e
          );
          combatLog.push(`Dark Orb evoked for ${value} damage to ${lowestHp.name}`);
        }
      }
      break;
    }
    case ORB_TYPES.PLASMA: {
      // Gain energy
      player.energy += value;
      combatLog.push(`Plasma Orb evoked for ${value} Energy`);
      break;
    }
  }

  return { enemies: newEnemies };
};

/**
 * Channel an orb into the player's orb slots.
 * If slots are full, evoke the leftmost orb first.
 * @param {Object} player - Player state (mutated: orbs array)
 * @param {string} orbType - Type of orb to channel
 * @param {Array} enemies - Enemy array
 * @param {Array} combatLog - Combat log (mutated)
 * @returns {{ enemies: Array }} updated enemies (from potential evoke)
 */
export const channelOrb = (player, orbType, enemies, combatLog) => {
  const orbs = player.orbs || [];
  const maxSlots = player.orbSlots || 3;
  let newEnemies = enemies;

  // If full, evoke leftmost orb
  if (orbs.length >= maxSlots) {
    const evokedOrb = orbs[0];
    const evokeResult = applyOrbEvoke(evokedOrb, player, newEnemies, player.focus || 0, combatLog);
    newEnemies = evokeResult.enemies;
    player.orbs = orbs.slice(1);
  }

  const newOrb = createOrb(orbType);
  player.orbs = [...(player.orbs || []), newOrb];
  combatLog.push(`Channeled ${orbType} Orb`);

  return { enemies: newEnemies };
};

/**
 * Evoke the leftmost orb (or all orbs)
 * @param {Object} player - Player state (mutated)
 * @param {Array} enemies - Enemy array
 * @param {Array} combatLog - Combat log
 * @param {Object} options - { all: boolean, count: number }
 * @returns {{ enemies: Array }} updated enemies
 */
export const evokeOrbs = (player, enemies, combatLog, options = {}) => {
  const orbs = player.orbs || [];
  if (orbs.length === 0) return { enemies };

  let newEnemies = enemies;
  const count = options.all ? orbs.length : (options.count || 1);

  for (let i = 0; i < count && player.orbs.length > 0; i++) {
    const orb = player.orbs[0];
    const result = applyOrbEvoke(orb, player, newEnemies, player.focus || 0, combatLog);
    newEnemies = result.enemies;
    player.orbs = player.orbs.slice(1);
  }

  return { enemies: newEnemies };
};

/**
 * Process all orb passives at end of player turn.
 * @param {Object} player - Player state (mutated)
 * @param {Array} enemies - Enemy array
 * @param {Array} combatLog - Combat log
 * @returns {{ enemies: Array }} updated enemies
 */
export const processOrbPassives = (player, enemies, combatLog) => {
  const orbs = player.orbs || [];
  if (orbs.length === 0) return { enemies };

  let newEnemies = enemies;
  const focus = player.focus || 0;

  // Process each orb's passive and update dark orbs
  player.orbs = orbs.map(orb => {
    const result = applyOrbPassive(orb, player, newEnemies, focus, combatLog);
    newEnemies = result.enemies;

    // Dark orbs accumulate damage each passive trigger
    if (orb.type === ORB_TYPES.DARK) {
      return { ...orb, darkDamage: orb.darkDamage + getOrbPassiveValue(orb, focus) };
    }
    return orb;
  });

  return { enemies: newEnemies };
};
