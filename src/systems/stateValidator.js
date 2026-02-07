/**
 * QR-13: Runtime State Validation
 *
 * Catches impossible game states to aid debugging and prevent cascading errors.
 * In dev mode: throws errors with actionable messages.
 * In production: logs warnings and auto-corrects where safe.
 */

// Check if we're in development mode
const isDev = typeof import.meta !== 'undefined' && import.meta.env?.DEV;

/**
 * Validation result structure
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - Whether the state is valid
 * @property {string[]} errors - List of critical errors (impossible states)
 * @property {string[]} warnings - List of non-critical issues
 * @property {Object|null} corrections - Suggested corrections for auto-fix
 */

/**
 * Validate player state
 * @param {Object} player - Player state object
 * @returns {ValidationResult}
 */
function validatePlayer(player) {
  const errors = [];
  const warnings = [];
  const corrections = {};

  if (!player) {
    errors.push('Player object is null or undefined');
    return { valid: false, errors, warnings, corrections: null };
  }

  // HP validation
  if (typeof player.currentHp !== 'number' || Number.isNaN(player.currentHp)) {
    errors.push(`Player currentHp is invalid: ${player.currentHp}`);
  } else if (player.currentHp < 0) {
    errors.push(`Player HP is negative: ${player.currentHp}`);
    corrections.currentHp = 0;
  }

  if (typeof player.maxHp !== 'number' || Number.isNaN(player.maxHp)) {
    errors.push(`Player maxHp is invalid: ${player.maxHp}`);
  } else if (player.maxHp < 1) {
    errors.push(`Player maxHp is less than 1: ${player.maxHp}`);
    corrections.maxHp = 1;
  }

  if (player.currentHp > player.maxHp) {
    warnings.push(`Player HP (${player.currentHp}) exceeds maxHp (${player.maxHp})`);
    corrections.currentHp = player.maxHp;
  }

  // Energy validation
  if (typeof player.energy !== 'number' || Number.isNaN(player.energy)) {
    errors.push(`Player energy is invalid: ${player.energy}`);
  } else if (player.energy < 0) {
    errors.push(`Player energy is negative: ${player.energy}`);
    corrections.energy = 0;
  }

  if (typeof player.maxEnergy !== 'number' || Number.isNaN(player.maxEnergy)) {
    errors.push(`Player maxEnergy is invalid: ${player.maxEnergy}`);
  } else if (player.maxEnergy < 0) {
    errors.push(`Player maxEnergy is negative: ${player.maxEnergy}`);
    corrections.maxEnergy = 0;
  }

  // Block validation
  if (typeof player.block !== 'number' || Number.isNaN(player.block)) {
    errors.push(`Player block is invalid: ${player.block}`);
  } else if (player.block < 0) {
    errors.push(`Player block is negative: ${player.block}`);
    corrections.block = 0;
  }

  // Gold validation
  if (typeof player.gold !== 'number' || Number.isNaN(player.gold)) {
    errors.push(`Player gold is invalid: ${player.gold}`);
  } else if (player.gold < 0) {
    errors.push(`Player gold is negative: ${player.gold}`);
    corrections.gold = 0;
  }

  // Status effect validation - check for NaN values
  const statusEffects = [
    'strength', 'dexterity', 'vulnerable', 'weak', 'frail', 'artifact',
    'intangible', 'thorns', 'metallicize', 'platedArmor', 'regen', 'hex',
    'confused', 'flight', 'berserk', 'demonForm', 'doubleTap', 'evolve',
    'feelNoPain', 'fireBreathing', 'juggernaut', 'rage', 'rupture',
    'flameBarrier', 'drawReduction', 'pendingBlock', 'focus', 'mantra'
  ];

  for (const effect of statusEffects) {
    if (player[effect] !== undefined && Number.isNaN(player[effect])) {
      errors.push(`Player status effect "${effect}" is NaN`);
      corrections[effect] = 0;
    }
  }

  // Orb slots validation (Defect)
  if (player.orbSlots !== undefined) {
    if (typeof player.orbSlots !== 'number' || Number.isNaN(player.orbSlots)) {
      errors.push(`Player orbSlots is invalid: ${player.orbSlots}`);
    } else if (player.orbSlots < 0) {
      errors.push(`Player orbSlots is negative: ${player.orbSlots}`);
      corrections.orbSlots = 0;
    }
  }

  // Orbs array validation
  if (player.orbs !== undefined) {
    if (!Array.isArray(player.orbs)) {
      errors.push(`Player orbs is not an array: ${typeof player.orbs}`);
    } else if (player.orbSlots !== undefined && player.orbs.length > player.orbSlots) {
      warnings.push(`Player has ${player.orbs.length} orbs but only ${player.orbSlots} slots`);
    }
  }

  // Mantra validation (Watcher)
  if (player.mantra !== undefined) {
    if (typeof player.mantra !== 'number' || Number.isNaN(player.mantra)) {
      errors.push(`Player mantra is invalid: ${player.mantra}`);
    } else if (player.mantra < 0) {
      errors.push(`Player mantra is negative: ${player.mantra}`);
      corrections.mantra = 0;
    }
  }

  // Stance validation (Watcher)
  if (player.currentStance !== undefined && player.currentStance !== null) {
    const validStances = ['calm', 'wrath', 'divinity'];
    if (!validStances.includes(player.currentStance)) {
      errors.push(`Player stance is invalid: ${player.currentStance}`);
      corrections.currentStance = null;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    corrections: Object.keys(corrections).length > 0 ? corrections : null
  };
}

/**
 * Validate a single enemy
 * @param {Object} enemy - Enemy state object
 * @param {number} index - Index in enemies array
 * @returns {ValidationResult}
 */
function validateEnemy(enemy, index) {
  const errors = [];
  const warnings = [];
  const corrections = {};

  if (!enemy) {
    errors.push(`Enemy at index ${index} is null or undefined`);
    return { valid: false, errors, warnings, corrections: null };
  }

  // HP validation
  if (typeof enemy.currentHp !== 'number' || Number.isNaN(enemy.currentHp)) {
    errors.push(`Enemy "${enemy.name || index}" currentHp is invalid: ${enemy.currentHp}`);
  } else if (enemy.currentHp < 0) {
    // Enemies can briefly have negative HP before being removed, but it's a warning
    warnings.push(`Enemy "${enemy.name || index}" has negative HP: ${enemy.currentHp}`);
    corrections.currentHp = 0;
  }

  if (typeof enemy.maxHp !== 'number' || Number.isNaN(enemy.maxHp)) {
    errors.push(`Enemy "${enemy.name || index}" maxHp is invalid: ${enemy.maxHp}`);
  } else if (enemy.maxHp < 1) {
    errors.push(`Enemy "${enemy.name || index}" maxHp is less than 1: ${enemy.maxHp}`);
    corrections.maxHp = 1;
  }

  if (enemy.currentHp > enemy.maxHp) {
    warnings.push(`Enemy "${enemy.name || index}" HP (${enemy.currentHp}) exceeds maxHp (${enemy.maxHp})`);
    corrections.currentHp = enemy.maxHp;
  }

  // Block validation
  if (typeof enemy.block !== 'number' || Number.isNaN(enemy.block)) {
    errors.push(`Enemy "${enemy.name || index}" block is invalid: ${enemy.block}`);
  } else if (enemy.block < 0) {
    errors.push(`Enemy "${enemy.name || index}" block is negative: ${enemy.block}`);
    corrections.block = 0;
  }

  // instanceId validation
  if (enemy.instanceId === undefined || enemy.instanceId === null) {
    warnings.push(`Enemy "${enemy.name || index}" has no instanceId`);
  }

  // Status effect NaN checks
  const statusEffects = [
    'vulnerable', 'weak', 'strength', 'artifact', 'intangible',
    'thorns', 'metallicize', 'platedArmor', 'flight'
  ];

  for (const effect of statusEffects) {
    if (enemy[effect] !== undefined && Number.isNaN(enemy[effect])) {
      errors.push(`Enemy "${enemy.name || index}" status effect "${effect}" is NaN`);
      corrections[effect] = 0;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    corrections: Object.keys(corrections).length > 0 ? corrections : null
  };
}

/**
 * Validate enemies array for duplicates and state consistency
 * @param {Array} enemies - Array of enemy objects
 * @returns {ValidationResult}
 */
function validateEnemies(enemies) {
  const errors = [];
  const warnings = [];

  if (!enemies) {
    return { valid: true, errors, warnings, corrections: null };
  }

  if (!Array.isArray(enemies)) {
    errors.push(`Enemies is not an array: ${typeof enemies}`);
    return { valid: false, errors, warnings, corrections: null };
  }

  // Check for duplicate instanceIds
  const instanceIds = new Set();
  const duplicates = [];

  for (let i = 0; i < enemies.length; i++) {
    const enemy = enemies[i];
    if (enemy && enemy.instanceId !== undefined) {
      if (instanceIds.has(enemy.instanceId)) {
        duplicates.push({ index: i, instanceId: enemy.instanceId, name: enemy.name });
      } else {
        instanceIds.add(enemy.instanceId);
      }
    }

    // Validate each enemy
    const enemyResult = validateEnemy(enemy, i);
    errors.push(...enemyResult.errors);
    warnings.push(...enemyResult.warnings);
  }

  if (duplicates.length > 0) {
    const dupInfo = duplicates.map(d => `${d.name}(${d.instanceId})`).join(', ');
    errors.push(`Duplicate enemy instanceIds found: ${dupInfo}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    corrections: null
  };
}

/**
 * Validate a single card
 * @param {Object} card - Card object
 * @param {string} pile - Which pile the card is in (hand, draw, discard, exhaust)
 * @param {number} index - Index in the pile
 * @returns {ValidationResult}
 */
function validateCard(card, pile, index) {
  const errors = [];
  const warnings = [];

  if (!card) {
    errors.push(`Card in ${pile}[${index}] is null or undefined`);
    return { valid: false, errors, warnings, corrections: null };
  }

  // Card must have an id
  if (!card.id) {
    errors.push(`Card in ${pile}[${index}] has no id`);
  }

  // Cost validation (can be number, 'X', or undefined for unplayable)
  if (card.cost !== undefined && card.cost !== 'X') {
    if (typeof card.cost !== 'number') {
      errors.push(`Card "${card.name || card.id}" in ${pile}[${index}] has invalid cost type: ${typeof card.cost}`);
    } else if (Number.isNaN(card.cost)) {
      errors.push(`Card "${card.name || card.id}" in ${pile}[${index}] has NaN cost`);
    } else if (card.cost < 0) {
      warnings.push(`Card "${card.name || card.id}" in ${pile}[${index}] has negative cost: ${card.cost}`);
    }
  }

  // Damage validation
  if (card.damage !== undefined) {
    if (typeof card.damage !== 'number') {
      errors.push(`Card "${card.name || card.id}" in ${pile}[${index}] has invalid damage type: ${typeof card.damage}`);
    } else if (Number.isNaN(card.damage)) {
      errors.push(`Card "${card.name || card.id}" in ${pile}[${index}] has NaN damage`);
    }
  }

  // Block validation
  if (card.block !== undefined) {
    if (typeof card.block !== 'number') {
      errors.push(`Card "${card.name || card.id}" in ${pile}[${index}] has invalid block type: ${typeof card.block}`);
    } else if (Number.isNaN(card.block)) {
      errors.push(`Card "${card.name || card.id}" in ${pile}[${index}] has NaN block`);
    }
  }

  // instanceId for deck cards
  if (card.instanceId === undefined || card.instanceId === null) {
    warnings.push(`Card "${card.name || card.id}" in ${pile}[${index}] has no instanceId`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    corrections: null
  };
}

/**
 * Validate card piles for consistency and duplicates
 * @param {Object} state - Game state with card piles
 * @returns {ValidationResult}
 */
function validateCardPiles(state) {
  const errors = [];
  const warnings = [];

  const piles = [
    { name: 'hand', cards: state.hand },
    { name: 'drawPile', cards: state.drawPile },
    { name: 'discardPile', cards: state.discardPile },
    { name: 'exhaustPile', cards: state.exhaustPile }
  ];

  // Collect all instanceIds across all piles
  const allInstanceIds = new Set();
  const duplicates = [];

  for (const pile of piles) {
    if (!pile.cards) continue;
    if (!Array.isArray(pile.cards)) {
      errors.push(`${pile.name} is not an array: ${typeof pile.cards}`);
      continue;
    }

    for (let i = 0; i < pile.cards.length; i++) {
      const card = pile.cards[i];

      // Validate individual card
      const cardResult = validateCard(card, pile.name, i);
      errors.push(...cardResult.errors);
      warnings.push(...cardResult.warnings);

      // Check for duplicate instanceIds across all piles
      if (card && card.instanceId !== undefined) {
        if (allInstanceIds.has(card.instanceId)) {
          duplicates.push({ pile: pile.name, index: i, instanceId: card.instanceId, name: card.name });
        } else {
          allInstanceIds.add(card.instanceId);
        }
      }
    }
  }

  if (duplicates.length > 0) {
    const dupInfo = duplicates.map(d => `${d.name}@${d.pile}(${d.instanceId})`).join(', ');
    errors.push(`Duplicate card instanceIds found: ${dupInfo}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    corrections: null
  };
}

/**
 * Valid game phases
 */
const VALID_PHASES = [
  'main_menu', 'map', 'combat', 'combat_reward', 'card_reward',
  'rest_site', 'shop', 'event', 'game_over', 'victory',
  'character_select', 'starting_bonus', 'data_editor',
  'card_select_hand', 'card_select_discard', 'card_select_exhaust',
  'card_select_draw', 'endless_transition'
];

/**
 * Validate game phase
 * @param {string} phase - Current game phase
 * @returns {ValidationResult}
 */
function validatePhase(phase) {
  const errors = [];
  const warnings = [];

  if (!phase) {
    errors.push('Game phase is null or undefined');
    return { valid: false, errors, warnings, corrections: null };
  }

  if (!VALID_PHASES.includes(phase)) {
    errors.push(`Invalid game phase: "${phase}"`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    corrections: null
  };
}

/**
 * Validate floor and act progression
 * @param {Object} state - Game state
 * @returns {ValidationResult}
 */
function validateProgression(state) {
  const errors = [];
  const warnings = [];

  // Floor validation
  if (typeof state.currentFloor !== 'number' || Number.isNaN(state.currentFloor)) {
    errors.push(`currentFloor is invalid: ${state.currentFloor}`);
  } else if (state.currentFloor < 0) {
    errors.push(`currentFloor is negative: ${state.currentFloor}`);
  }

  // Act validation
  if (typeof state.act !== 'number' || Number.isNaN(state.act)) {
    errors.push(`act is invalid: ${state.act}`);
  } else if (state.act < 1 || state.act > 4) {
    // Act 4 is the Heart
    warnings.push(`act is outside expected range (1-4): ${state.act}`);
  }

  // Turn validation (only in combat)
  if (state.phase === 'combat') {
    if (typeof state.turn !== 'number' || Number.isNaN(state.turn)) {
      errors.push(`turn is invalid during combat: ${state.turn}`);
    } else if (state.turn < 0) {
      errors.push(`turn is negative: ${state.turn}`);
    }
  }

  // Ascension validation
  if (typeof state.ascension !== 'number' || Number.isNaN(state.ascension)) {
    errors.push(`ascension is invalid: ${state.ascension}`);
  } else if (state.ascension < 0 || state.ascension > 20) {
    warnings.push(`ascension is outside expected range (0-20): ${state.ascension}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    corrections: null
  };
}

/**
 * Validate potions array
 * @param {Array} potions - Potions array (3 slots, can be null)
 * @returns {ValidationResult}
 */
function validatePotions(potions) {
  const errors = [];
  const warnings = [];

  if (!potions) {
    return { valid: true, errors, warnings, corrections: null };
  }

  if (!Array.isArray(potions)) {
    errors.push(`potions is not an array: ${typeof potions}`);
    return { valid: false, errors, warnings, corrections: null };
  }

  if (potions.length !== 3) {
    warnings.push(`potions array has ${potions.length} slots, expected 3`);
  }

  for (let i = 0; i < potions.length; i++) {
    const potion = potions[i];
    if (potion !== null && potion !== undefined) {
      if (!potion.id) {
        errors.push(`Potion in slot ${i} has no id`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    corrections: null
  };
}

/**
 * Validate relics array
 * @param {Array} relics - Relics array
 * @returns {ValidationResult}
 */
function validateRelics(relics) {
  const errors = [];
  const warnings = [];

  if (!relics) {
    return { valid: true, errors, warnings, corrections: null };
  }

  if (!Array.isArray(relics)) {
    errors.push(`relics is not an array: ${typeof relics}`);
    return { valid: false, errors, warnings, corrections: null };
  }

  const relicIds = new Set();
  for (let i = 0; i < relics.length; i++) {
    const relic = relics[i];
    if (!relic) {
      errors.push(`Relic at index ${i} is null or undefined`);
      continue;
    }
    if (!relic.id) {
      errors.push(`Relic at index ${i} has no id`);
      continue;
    }
    // Check for duplicate relics (most relics can only be held once)
    if (relicIds.has(relic.id)) {
      warnings.push(`Duplicate relic found: ${relic.id}`);
    } else {
      relicIds.add(relic.id);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    corrections: null
  };
}

/**
 * Main state validation function
 * Validates the entire game state and returns a comprehensive result.
 *
 * @param {Object} state - Full game state
 * @returns {ValidationResult}
 */
export function validateState(state) {
  const allErrors = [];
  const allWarnings = [];
  let allCorrections = {};

  if (!state) {
    return {
      valid: false,
      errors: ['Game state is null or undefined'],
      warnings: [],
      corrections: null
    };
  }

  // Validate phase
  const phaseResult = validatePhase(state.phase);
  allErrors.push(...phaseResult.errors);
  allWarnings.push(...phaseResult.warnings);

  // Validate player
  const playerResult = validatePlayer(state.player);
  allErrors.push(...playerResult.errors);
  allWarnings.push(...playerResult.warnings);
  if (playerResult.corrections) {
    allCorrections.player = playerResult.corrections;
  }

  // Validate enemies (only if in combat or combat-related phases)
  const combatPhases = ['combat', 'combat_reward', 'card_select_hand', 'card_select_discard', 'card_select_exhaust', 'card_select_draw'];
  if (combatPhases.includes(state.phase) || (state.enemies && state.enemies.length > 0)) {
    const enemiesResult = validateEnemies(state.enemies);
    allErrors.push(...enemiesResult.errors);
    allWarnings.push(...enemiesResult.warnings);
  }

  // Validate card piles
  const cardPilesResult = validateCardPiles(state);
  allErrors.push(...cardPilesResult.errors);
  allWarnings.push(...cardPilesResult.warnings);

  // Validate progression
  const progressionResult = validateProgression(state);
  allErrors.push(...progressionResult.errors);
  allWarnings.push(...progressionResult.warnings);

  // Validate potions
  const potionsResult = validatePotions(state.potions);
  allErrors.push(...potionsResult.errors);
  allWarnings.push(...potionsResult.warnings);

  // Validate relics
  const relicsResult = validateRelics(state.relics);
  allErrors.push(...relicsResult.errors);
  allWarnings.push(...relicsResult.warnings);

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
    corrections: Object.keys(allCorrections).length > 0 ? allCorrections : null
  };
}

/**
 * Apply corrections to state where safe
 * @param {Object} state - Game state to correct
 * @param {Object} corrections - Corrections object from validateState
 * @returns {Object} Corrected state
 */
export function applyCorrections(state, corrections) {
  if (!corrections) return state;

  const newState = { ...state };

  // Apply player corrections (most common case: HP capping, negative value fixes)
  if (corrections.player) {
    newState.player = { ...newState.player, ...corrections.player };
  }

  // Note: Enemy/card corrections are generated but not auto-applied.
  // These are intentionally logged only, as auto-correcting combat state
  // could mask real bugs. Player corrections are safer (HP caps, etc.)

  return newState;
}

/**
 * Runtime validation hook for use after state updates.
 * In dev mode: throws on errors
 * In production: logs warnings and attempts auto-correction
 *
 * @param {Object} state - Game state to validate
 * @param {string} action - Action type that caused the state change (for logging)
 * @returns {Object} Validated (and possibly corrected) state
 */
export function validateAndCorrectState(state, action = 'UNKNOWN') {
  const result = validateState(state);

  if (!result.valid) {
    const errorMessage = `State validation failed after ${action}:\n  ${result.errors.join('\n  ')}`;

    if (isDev) {
      console.error(
        '%c❌ STATE VALIDATION ERROR',
        'background: #cc0000; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;'
      );
      console.error(errorMessage);
      console.error('Current state:', state);
      // In dev mode, throw to help catch issues early
      throw new Error(errorMessage);
    } else {
      // In production, log and attempt to correct
      console.warn('[StateValidator]', errorMessage);
      if (result.corrections) {
        console.warn('[StateValidator] Applying auto-corrections:', result.corrections);
        return applyCorrections(state, result.corrections);
      }
    }
  }

  if (result.warnings.length > 0 && isDev) {
    console.warn(
      '%c⚠️ STATE VALIDATION WARNINGS',
      'background: #ff9900; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;'
    );
    console.warn(`After ${action}:\n  ${result.warnings.join('\n  ')}`);
  }

  return state;
}

/**
 * Light validation for critical transitions only (production mode)
 * Checks only the most important invariants for performance.
 *
 * @param {Object} state - Game state
 * @returns {boolean} Whether state passes critical checks
 */
export function validateCritical(state) {
  if (!state || !state.player) return false;

  // Critical checks only
  if (state.player.currentHp < 0) return false;
  if (state.player.energy < 0) return false;
  if (typeof state.phase !== 'string') return false;

  return true;
}

// Export individual validators for testing
export const validators = {
  validatePlayer,
  validateEnemy,
  validateEnemies,
  validateCard,
  validateCardPiles,
  validatePhase,
  validateProgression,
  validatePotions,
  validateRelics
};
