/**
 * Combat System
 *
 * Handles all combat-related calculations including damage, block, and applying
 * damage to targets. These functions are the core combat mechanics used throughout
 * the game.
 *
 * @module systems/combatSystem
 */

// Card types are available but not currently used - kept for future expansion
// import { CARD_TYPES } from '../data/cards';

/**
 * Default structure for passive relic effects
 * Used when no relics are present or as base values
 */
const DEFAULT_PASSIVE_EFFECTS = {
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

/**
 * Calculates passive relic effects based on the player's current relics
 * This is needed for combat calculations that depend on passive bonuses
 *
 * @param {Array} relics - Array of player's relics
 * @param {Object} context - Context object containing player state
 * @param {number} [context.playerHpPercent] - Player's HP as percentage of max
 * @returns {Object} Object containing all passive effect values
 */
export const getPassiveRelicEffects = (relics, context = {}) => {
  const effects = { ...DEFAULT_PASSIVE_EFFECTS };

  if (!relics || !Array.isArray(relics)) {
    return effects;
  }

  relics.forEach(relic => {
    if (relic.trigger !== 'passive') return;
    const effect = relic.effect;
    if (!effect) return;

    if (effect.type === 'energyBonus') {
      effects.extraEnergy += effect.amount;
    }
    if (effect.type === 'drawBonus') {
      effects.extraDraw += effect.amount;
    }
    if (effect.type === 'vulnerableBonus') {
      effects.vulnerableMultiplier = 1.5 + effect.amount;
    }
    if (effect.type === 'healingBonus') {
      effects.healingMultiplier = 1 + effect.amount;
    }
    if (effect.type === 'shopDiscount') {
      effects.shopDiscount = 1 - effect.amount;
    }
    if (effect.hideIntents) {
      effects.hideIntents = true;
    }
    if (effect.cardLimit) {
      effects.cardLimit = effect.cardLimit;
    }
    if (effect.type === 'conserveEnergy') {
      effects.conserveEnergy = true;
    }
    if (effect.type === 'strengthIfLowHp' && context.playerHpPercent <= effect.threshold) {
      effects.strengthBonus += effect.amount;
    }
  });

  return effects;
};

/**
 * Calculates the final damage amount for an attack
 * Takes into account strength, weakness, vulnerability, double damage effects,
 * and passive relic bonuses
 *
 * @param {number} baseDamage - The base damage value of the attack
 * @param {Object} attacker - The entity dealing damage (player or enemy)
 * @param {number} [attacker.strength=0] - Strength stat of attacker
 * @param {number} [attacker.weak=0] - Weak debuff stacks on attacker
 * @param {number} [attacker.currentHp] - Current HP (for passive effects)
 * @param {number} [attacker.maxHp] - Max HP (for passive effects)
 * @param {Object} defender - The entity receiving damage
 * @param {number} [defender.vulnerable=0] - Vulnerable debuff stacks on defender
 * @param {Object} [options={}] - Additional options
 * @param {number} [options.strengthMultiplier=1] - Multiplier for strength (Heavy Blade)
 * @param {Array} [options.relics=[]] - Player's relics for passive effects
 * @param {boolean} [options.isPlayer=true] - Whether attacker is the player
 * @param {boolean} [options.doubleDamage=false] - Whether to double the damage
 * @returns {number} The final calculated damage (minimum 0)
 *
 * @example
 * // Basic attack with 6 damage
 * const damage = calculateDamage(6, player, enemy);
 *
 * @example
 * // Heavy Blade with 3x strength multiplier
 * const damage = calculateDamage(14, player, enemy, { strengthMultiplier: 3 });
 */
export const calculateDamage = (baseDamage, attacker, defender, options = {}) => {
  let damage = baseDamage;
  const {
    strengthMultiplier = 1,
    relics = [],
    isPlayer = true,
    doubleDamage = false
  } = options;

  // Add strength (with optional multiplier for Heavy Blade)
  if (attacker.strength) {
    damage += attacker.strength * strengthMultiplier;
  }

  // Add passive strength from relics (Red Skull)
  if (isPlayer && relics.length > 0) {
    const passiveEffects = getPassiveRelicEffects(relics, {
      playerHpPercent: attacker.currentHp / attacker.maxHp
    });
    damage += passiveEffects.strengthBonus * strengthMultiplier;
  }

  // Weak reduces damage by 25%
  if (attacker.weak > 0) {
    damage = Math.floor(damage * 0.75);
  }

  // Vulnerable increases damage by 50% (or more with Paper Phrog)
  if (defender.vulnerable > 0) {
    let vulnMultiplier = 1.5;
    if (isPlayer && relics.length > 0) {
      const passiveEffects = getPassiveRelicEffects(relics, {});
      vulnMultiplier = passiveEffects.vulnerableMultiplier;
    }
    damage = Math.floor(damage * vulnMultiplier);
  }

  // Double damage from Pen Nib or Double Tap
  if (doubleDamage) {
    damage *= 2;
  }

  return Math.max(0, damage);
};

/**
 * Calculates the final block amount
 * Takes into account dexterity and frail debuff
 *
 * @param {number} baseBlock - The base block value
 * @param {Object} player - The player object
 * @param {number} [player.dexterity=0] - Dexterity stat
 * @param {number} [player.frail=0] - Frail debuff stacks
 * @returns {number} The final calculated block (minimum 0)
 *
 * @example
 * const block = calculateBlock(5, player); // Defend card
 */
export const calculateBlock = (baseBlock, player) => {
  let block = baseBlock;

  // Add dexterity
  if (player.dexterity) {
    block += player.dexterity;
  }

  // Frail reduces block by 25%
  if (player.frail > 0) {
    block = Math.floor(block * 0.75);
  }

  return Math.max(0, block);
};

/**
 * Applies damage to a target, accounting for block
 * Damage is first absorbed by block, then any remaining hits HP
 *
 * @param {Object} target - The target receiving damage
 * @param {number} target.block - Current block amount
 * @param {number} target.currentHp - Current HP
 * @param {number} damage - Amount of damage to apply
 * @returns {Object} New target object with updated block and currentHp
 *
 * @example
 * const enemy = { block: 5, currentHp: 20 };
 * const result = applyDamageToTarget(enemy, 8);
 * // result: { block: 0, currentHp: 17 }
 */
export const applyDamageToTarget = (target, damage) => {
  let remainingDamage = damage;
  let newBlock = target.block;
  let newHp = target.currentHp;
  let newFlight = target.flight;
  let newInvincible = target.invincible || 0;

  // Enemy intangible: reduce all damage to 1
  if (target.intangible > 0 && remainingDamage > 0) {
    remainingDamage = 1;
  }

  // Enemy flight: reduce incoming damage by 50% per stack, lose 1 stack
  if (newFlight > 0) {
    remainingDamage = Math.floor(remainingDamage * 0.5);
    newFlight--;
  }

  // Invincible shield: absorb damage before block and HP
  if (newInvincible > 0 && remainingDamage > 0) {
    if (newInvincible >= remainingDamage) {
      newInvincible -= remainingDamage;
      remainingDamage = 0;
    } else {
      remainingDamage -= newInvincible;
      newInvincible = 0;
    }
  }

  if (newBlock > 0) {
    if (newBlock >= remainingDamage) {
      newBlock -= remainingDamage;
      remainingDamage = 0;
    } else {
      remainingDamage -= newBlock;
      newBlock = 0;
    }
  }

  if (remainingDamage > 0) {
    newHp = Math.max(0, newHp - remainingDamage);
  }

  const result = { ...target, block: newBlock, currentHp: newHp, invincible: newInvincible };
  // Plated Armor: reduce by 1 when taking unblocked damage (HP loss)
  if (remainingDamage > 0 && target.platedArmor > 0) {
    result.platedArmor = Math.max(0, target.platedArmor - 1);
  }
  // Update flight and grounded status
  if (target.flight !== undefined) {
    result.flight = newFlight;
    if (newFlight <= 0) {
      result.grounded = true;
    }
  }
  return result;
};

/**
 * Processes damage from a card against enemies
 * Handles single target, multi-target, and random target attacks
 *
 * @param {Object} card - The card being played
 * @param {number} card.damage - Base damage of the card
 * @param {number} [card.hits=1] - Number of times to hit
 * @param {boolean} [card.targetAll] - Whether to hit all enemies
 * @param {boolean} [card.randomTarget] - Whether to hit a random enemy
 * @param {Object} player - The player object
 * @param {Array} enemies - Array of enemy objects
 * @param {number|string} targetIndexOrId - Index or instanceId of the target enemy (for single target)
 * @param {Object} options - Damage calculation options
 * @param {Array} combatLog - Array to push combat log messages
 * @returns {Object} Object with updated enemies array and combat log
 */
export const processCardDamage = (card, player, enemies, targetIndexOrId, options, combatLog) => {
  // Resolve targetId (instanceId string) to array index for backward compatibility
  const targetIndex = typeof targetIndexOrId === 'string'
    ? enemies.findIndex(e => e.instanceId === targetIndexOrId)
    : targetIndexOrId;
  let newEnemies = [...enemies];
  const hits = card.hits || 1;
  const baseDamage = typeof card.damage === 'object'
    ? Math.floor(Math.random() * (card.damage.max - card.damage.min + 1)) + card.damage.min
    : card.damage;

  for (let h = 0; h < hits; h++) {
    if (card.targetAll) {
      newEnemies = newEnemies.map(enemy => {
        if (enemy.currentHp <= 0) return enemy;
        const damage = calculateDamage(baseDamage, player, enemy, options);
        const result = applyDamageToTarget(enemy, damage);
        combatLog.push(`Dealt ${damage} damage to ${enemy.name}`);
        return result;
      });
    } else if (card.randomTarget) {
      const aliveEnemies = newEnemies.filter(e => e.currentHp > 0);
      if (aliveEnemies.length > 0) {
        const randomIdx = Math.floor(Math.random() * aliveEnemies.length);
        const targetEnemy = aliveEnemies[randomIdx];
        const enemyIdx = newEnemies.findIndex(e => e.instanceId === targetEnemy.instanceId);
        const damage = calculateDamage(baseDamage, player, targetEnemy, options);
        newEnemies[enemyIdx] = applyDamageToTarget(targetEnemy, damage);
        combatLog.push(`Dealt ${damage} damage to ${targetEnemy.name}`);
      }
    } else {
      const enemy = newEnemies[targetIndex];
      if (enemy && enemy.currentHp > 0) {
        const damage = calculateDamage(baseDamage, player, enemy, options);
        newEnemies[targetIndex] = applyDamageToTarget(enemy, damage);
        combatLog.push(`Dealt ${damage} damage to ${enemy.name}`);
      }
    }
  }

  return { enemies: newEnemies, combatLog };
};

/**
 * Processes block gain from a card, including Juggernaut effect
 *
 * @param {Object} card - The card being played
 * @param {number} card.block - Base block of the card
 * @param {Object} player - The player object
 * @param {Array} enemies - Array of enemy objects (for Juggernaut)
 * @param {Array} combatLog - Array to push combat log messages
 * @returns {Object} Object with updated player, enemies, and combat log
 */
export const processCardBlock = (card, player, enemies, combatLog) => {
  let newPlayer = { ...player };
  let newEnemies = [...enemies];

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
      combatLog.push(`Juggernaut dealt ${newPlayer.juggernaut} damage`);
    }
  }

  return { player: newPlayer, enemies: newEnemies, combatLog };
};

/**
 * Applies card effects (debuffs/buffs) to targets
 *
 * @param {Array} effects - Array of effect objects from the card
 * @param {Object} player - The player object
 * @param {Array} enemies - Array of enemy objects
 * @param {number|string} targetIndexOrId - Index or instanceId of target enemy
 * @param {boolean} targetAll - Whether card targets all enemies
 * @param {Array} combatLog - Array to push combat log messages
 * @returns {Object} Object with updated player, enemies, and combat log
 */
export const applyCardEffects = (effects, player, enemies, targetIndexOrId, targetAll, combatLog) => {
  // Resolve targetId (instanceId string) to array index for backward compatibility
  const targetIndex = typeof targetIndexOrId === 'string'
    ? enemies.findIndex(e => e.instanceId === targetIndexOrId)
    : targetIndexOrId;
  let newPlayer = { ...player };
  let newEnemies = [...enemies];

  effects.forEach(effect => {
    if (effect.self) {
      // Self-inflicted debuffs
      if (effect.type === 'vulnerable') newPlayer.vulnerable += effect.amount;
      if (effect.type === 'weak') newPlayer.weak += effect.amount;
      if (effect.type === 'strength') newPlayer.strength += effect.amount;
    } else if (targetAll || effect.target === 'player') {
      if (effect.target === 'player') {
        // Effects that target the player
        if (effect.type === 'weak') newPlayer.weak += effect.amount;
        if (effect.type === 'vulnerable') newPlayer.vulnerable += effect.amount;
        if (effect.type === 'frail') newPlayer.frail += effect.amount;
        if (effect.type === 'strength') newPlayer.strength += effect.amount;
      } else {
        // Effects that target all enemies
        newEnemies = newEnemies.map(enemy => {
          if (enemy.currentHp <= 0) return enemy;
          const newEnemy = { ...enemy };
          if (effect.type === 'vulnerable') newEnemy.vulnerable = (newEnemy.vulnerable || 0) + effect.amount;
          if (effect.type === 'weak') newEnemy.weak = (newEnemy.weak || 0) + effect.amount;
          if (effect.type === 'strengthDown') newEnemy.strength = (newEnemy.strength || 0) - effect.amount;
          combatLog.push(`Applied ${effect.amount} ${effect.type} to ${enemy.name}`);
          return newEnemy;
        });
      }
    } else {
      // Single target effects
      const enemy = newEnemies[targetIndex];
      if (enemy && enemy.currentHp > 0) {
        const newEnemy = { ...enemy };
        if (effect.type === 'vulnerable') newEnemy.vulnerable = (newEnemy.vulnerable || 0) + effect.amount;
        if (effect.type === 'weak') newEnemy.weak = (newEnemy.weak || 0) + effect.amount;
        if (effect.type === 'strengthDown') newEnemy.strength = (newEnemy.strength || 0) - effect.amount;
        newEnemies[targetIndex] = newEnemy;
        combatLog.push(`Applied ${effect.amount} ${effect.type} to ${enemy.name}`);
      }
    }
  });

  return { player: newPlayer, enemies: newEnemies, combatLog };
};

/**
 * Calculates enemy damage accounting for strength, weak, and player vulnerability
 *
 * @param {number} baseDamage - Base damage of the enemy attack
 * @param {Object} enemy - The attacking enemy
 * @param {Object} player - The player being attacked
 * @param {Array} relics - Player's relics for damage reduction checks
 * @returns {number} Final calculated damage
 */
export const calculateEnemyDamage = (baseDamage, enemy, player, relics = []) => {
  let damage = baseDamage;

  // Handle damage ranges
  if (typeof damage === 'object' && damage.min !== undefined) {
    damage = Math.floor(Math.random() * (damage.max - damage.min + 1)) + damage.min;
  }

  // Add enemy strength
  damage += enemy.strength || 0;

  // Weak reduces damage by 25%
  if (enemy.weak > 0) {
    damage = Math.floor(damage * 0.75);
  }

  // Vulnerable increases damage by 50%
  if (player.vulnerable > 0) {
    damage = Math.floor(damage * 1.5);
  }

  // Torii: reduce low damage to 1
  const torii = relics.find(r => r.id === 'torii');
  if (torii && damage <= 5 && damage > 0) {
    damage = 1;
  }

  // Intangible: reduce all damage to 1
  if (player.intangible > 0) {
    damage = 1;
  }

  return damage;
};

/**
 * Applies damage to the player, handling block, flight, and tungsten rod
 *
 * @param {Object} player - The player object
 * @param {number} damage - Amount of damage to apply
 * @param {Array} relics - Player's relics
 * @param {Array} combatLog - Combat log array
 * @returns {Object} Object with updated player, HP lost, and combat log
 */
export const applyDamageToPlayer = (player, damage, relics, combatLog) => {
  let newPlayer = { ...player };
  let hpLost = 0;

  // Flight: reduce damage by 50%, lose 1 stack
  if (newPlayer.flight > 0) {
    damage = Math.floor(damage / 2);
    newPlayer.flight--;
    combatLog.push('Flight reduced damage');
  }

  // Apply damage to block first
  if (newPlayer.block >= damage) {
    newPlayer.block -= damage;
  } else {
    let remainingDamage = damage - newPlayer.block;
    newPlayer.block = 0;

    // Tungsten Rod reduces HP loss by 1
    const tungstenRod = relics.find(r => r.id === 'tungsten_rod');
    if (tungstenRod && remainingDamage > 0) {
      remainingDamage = Math.max(0, remainingDamage - 1);
    }

    hpLost = remainingDamage;
    newPlayer.currentHp = Math.max(0, newPlayer.currentHp - remainingDamage);
  }

  return { player: newPlayer, hpLost, combatLog };
};
