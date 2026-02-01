/**
 * Headless Combat Balance Simulator
 *
 * Runs combat simulations without DOM/React to evaluate game balance.
 * Imports game data and systems directly for accurate calculations.
 *
 * @module test/balance/simulator
 */

import { getStarterDeck, getRandomCard, CARD_TYPES } from '../../data/cards.js';
import { getEncounter, getBossEncounter, createEnemyInstance, ALL_ENEMIES, INTENT } from '../../data/enemies.js';
import {
  calculateDamage,
  calculateBlock,
  applyDamageToTarget,
  calculateEnemyDamage,
  applyDamageToPlayer
} from '../../systems/combatSystem.js';
import {
  getAscensionModifiers,
  getAscensionStartGold,
  getAscensionHealPercent,
  applyAscensionToEnemies,
  shouldAddWoundAtCombatStart,
  createWoundCard
} from '../../systems/ascensionSystem.js';

/**
 * Simple seeded random number generator (mulberry32)
 * Provides deterministic results when a seed is given.
 *
 * @param {number} seed - The seed value
 * @returns {function} A function that returns the next pseudorandom number [0, 1)
 */
function createRng(seed) {
  let state = seed;
  return function () {
    state |= 0;
    state = (state + 0x6D2B79F5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Shuffles an array in place using the provided RNG.
 *
 * @param {Array} arr - Array to shuffle
 * @param {function} rng - Random number generator function
 * @returns {Array} The same array, shuffled
 */
function shuffleWithRng(arr, rng) {
  const newArr = [...arr];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

/**
 * Creates initial player state for a simulation.
 *
 * @param {Object} config - Configuration overrides
 * @param {number} [config.hp=80] - Starting HP
 * @param {number} [config.maxHp=80] - Max HP
 * @param {number} [config.energy=3] - Energy per turn
 * @returns {Object} Initial player state
 */
function createPlayerState(config = {}) {
  return {
    currentHp: config.hp || 80,
    maxHp: config.maxHp || 80,
    block: 0,
    energy: config.energy || 3,
    maxEnergy: config.energy || 3,
    strength: 0,
    dexterity: 0,
    vulnerable: 0,
    weak: 0,
    frail: 0,
    metallicize: 0,
    barricade: false,
    demonForm: 0,
    berserk: 0,
    rage: 0,
    doubleTap: 0,
    feelNoPain: 0,
    juggernaut: 0,
    darkEmbrace: false,
    evolve: 0,
    rupture: 0,
    fireBreathing: 0,
    corruption: false,
    brutality: false,
    combust: null,
    flameBarrier: 0,
    noDrawThisTurn: false,
    flexStrengthLoss: 0,
    intangible: 0,
    flight: 0
  };
}

/**
 * Determines enemy intent for a turn.
 *
 * @param {Object} enemy - The enemy instance
 * @param {number} turn - Current turn number
 * @param {function} rng - Random number generator
 * @returns {Object} The enemy's chosen move
 */
function getEnemyIntent(enemy, turn, rng) {
  // Override Math.random temporarily with our rng for deterministic AI
  const origRandom = Math.random;
  Math.random = rng;
  try {
    const move = enemy.ai
      ? enemy.ai(enemy, turn, enemy.lastMove, enemy.spawnIndex || 0)
      : enemy.moveset[0];
    return move || enemy.moveset[0];
  } finally {
    Math.random = origRandom;
  }
}

/**
 * Simple AI to decide which cards to play.
 * Strategy: if enemy intends high damage, prioritize block cards; otherwise play damage.
 *
 * @param {Array} hand - Cards in hand
 * @param {number} energy - Available energy
 * @param {Array} enemies - Current enemies
 * @param {Object} player - Player state
 * @returns {Array} Ordered list of cards to play with target indices
 */
function selectCardsToPlay(hand, energy, enemies, player) {
  const playable = hand.filter(c => !c.unplayable && c.cost >= 0 && c.cost <= energy);
  if (playable.length === 0) return [];

  // Determine total incoming damage from alive enemies
  const totalIncomingDamage = enemies.reduce((sum, e) => {
    if (e.currentHp <= 0) return sum;
    if (!e.intentData) return sum;
    const intent = e.intentData;
    const attackIntents = [INTENT.ATTACK, INTENT.ATTACK_BUFF, INTENT.ATTACK_DEBUFF, INTENT.ATTACK_DEFEND];
    if (attackIntents.includes(intent.intent)) {
      const baseDmg = typeof intent.damage === 'object'
        ? (intent.damage.min + intent.damage.max) / 2
        : (intent.damage || 0);
      const times = intent.times || 1;
      return sum + baseDmg * times;
    }
    return sum;
  }, 0);

  // Should we prioritize blocking?
  const shouldBlock = totalIncomingDamage > 10 && player.block < totalIncomingDamage * 0.5;

  // Separate into categories
  const attacks = playable.filter(c => c.type === CARD_TYPES.ATTACK);
  const skills = playable.filter(c => c.type === CARD_TYPES.SKILL);
  const powers = playable.filter(c => c.type === CARD_TYPES.POWER);
  const blockCards = skills.filter(c => c.block && c.block > 0);
  const nonBlockSkills = skills.filter(c => !c.block || c.block <= 0);

  // Sort attacks by damage descending (higher damage first)
  attacks.sort((a, b) => {
    const aDmg = (a.damage || 0) * (a.hits || 1);
    const bDmg = (b.damage || 0) * (b.hits || 1);
    return bDmg - aDmg;
  });

  // Sort block cards by block value descending
  blockCards.sort((a, b) => (b.block || 0) - (a.block || 0));

  let ordered;
  if (shouldBlock) {
    // Block first, then attacks, then powers, then remaining skills
    ordered = [...blockCards, ...attacks, ...powers, ...nonBlockSkills];
  } else {
    // Attacks first, then powers, then block, then skills
    ordered = [...attacks, ...powers, ...blockCards, ...nonBlockSkills];
  }

  // Greedily select cards that fit within energy
  const selected = [];
  let remainingEnergy = energy;
  for (const card of ordered) {
    const cost = card.cost === -1 ? remainingEnergy : card.cost;
    if (cost <= remainingEnergy) {
      // Find best target for attack cards
      let targetIndex = 0;
      if (card.type === CARD_TYPES.ATTACK && !card.targetAll && !card.randomTarget) {
        // Target the enemy with lowest HP that is alive
        let lowestHp = Infinity;
        enemies.forEach((e, idx) => {
          if (e.currentHp > 0 && e.currentHp < lowestHp) {
            lowestHp = e.currentHp;
            targetIndex = idx;
          }
        });
      }
      selected.push({ card, targetIndex });
      remainingEnergy -= (card.cost === -1 ? remainingEnergy : card.cost);
      if (remainingEnergy <= 0) break;
    }
  }

  return selected;
}

/**
 * Processes the effects of playing a card in the simulator.
 * Handles damage, block, and status effects. Complex specials are skipped gracefully.
 *
 * @param {Object} card - The card being played
 * @param {Object} player - Player state (mutated)
 * @param {Array} enemies - Enemy array (mutated)
 * @param {number} targetIndex - Target enemy index
 * @param {Object} combatStats - Stats tracking object (mutated)
 * @returns {void}
 */
function processCard(card, player, enemies, targetIndex, combatStats, rng) {
  combatStats.cardsPlayed++;
  combatStats.cardPlayFrequency[card.id] = (combatStats.cardPlayFrequency[card.id] || 0) + 1;

  // Handle X-cost cards (Whirlwind)
  if (card.cost === -1) {
    // Use all remaining energy
    const timesToHit = player.energy;
    player.energy = 0;
    if (card.damage && timesToHit > 0) {
      for (let x = 0; x < timesToHit; x++) {
        enemies.forEach((enemy, idx) => {
          if (enemy.currentHp <= 0) return;
          const dmg = calculateDamage(
            typeof card.damage === 'object'
              ? Math.floor((card.damage.min + card.damage.max) / 2)
              : card.damage,
            player,
            enemy,
            { relics: [] }
          );
          enemies[idx] = applyDamageToTarget(enemy, dmg);
          combatStats.damageDealt += dmg;
        });
      }
    }
    return;
  }

  // Handle damage
  if (card.damage && card.type === CARD_TYPES.ATTACK) {
    const hits = card.hits || 1;
    const baseDmg = typeof card.damage === 'object'
      ? Math.floor((card.damage.min + card.damage.max) / 2)
      : card.damage;

    for (let h = 0; h < hits; h++) {
      if (card.targetAll) {
        enemies.forEach((enemy, idx) => {
          if (enemy.currentHp <= 0) return;
          const dmg = calculateDamage(baseDmg, player, enemy, {
            strengthMultiplier: card.strengthMultiplier || 1,
            relics: []
          });
          enemies[idx] = applyDamageToTarget(enemy, dmg);
          combatStats.damageDealt += dmg;
        });
      } else if (card.randomTarget) {
        const alive = enemies.filter(e => e.currentHp > 0);
        if (alive.length > 0) {
          const rIdx = Math.floor(rng() * alive.length);
          const target = alive[rIdx];
          const eIdx = enemies.indexOf(target);
          const dmg = calculateDamage(baseDmg, player, target, {
            strengthMultiplier: card.strengthMultiplier || 1,
            relics: []
          });
          enemies[eIdx] = applyDamageToTarget(target, dmg);
          combatStats.damageDealt += dmg;
        }
      } else {
        const enemy = enemies[targetIndex];
        if (enemy && enemy.currentHp > 0) {
          const dmg = calculateDamage(baseDmg, player, enemy, {
            strengthMultiplier: card.strengthMultiplier || 1,
            relics: []
          });
          enemies[targetIndex] = applyDamageToTarget(enemy, dmg);
          combatStats.damageDealt += dmg;
        }
      }
    }
  }

  // Handle block
  if (card.block && card.block > 0) {
    const blockGain = calculateBlock(card.block, player);
    player.block += blockGain;
  }

  // Handle effects (debuffs/buffs applied by the card)
  if (card.effects && card.effects.length > 0) {
    card.effects.forEach(effect => {
      if (effect.self) {
        // Self buffs/debuffs
        if (effect.type === 'strength') player.strength += effect.amount;
        if (effect.type === 'vulnerable') player.vulnerable += effect.amount;
        if (effect.type === 'weak') player.weak += effect.amount;
      } else if (effect.target === 'player') {
        // Enemy effects targeting player (handled during enemy turn typically)
        // Skip here - handled in enemy action
      } else if (card.targetAll) {
        // Apply to all enemies
        enemies.forEach((enemy, idx) => {
          if (enemy.currentHp <= 0) return;
          if (effect.type === 'vulnerable') enemies[idx] = { ...enemy, vulnerable: (enemy.vulnerable || 0) + effect.amount };
          if (effect.type === 'weak') enemies[idx] = { ...enemy, weak: (enemy.weak || 0) + effect.amount };
        });
      } else {
        // Apply to target enemy
        const enemy = enemies[targetIndex];
        if (enemy && enemy.currentHp > 0) {
          if (effect.type === 'vulnerable') enemies[targetIndex] = { ...enemy, vulnerable: (enemy.vulnerable || 0) + effect.amount };
          if (effect.type === 'weak') enemies[targetIndex] = { ...enemy, weak: (enemy.weak || 0) + effect.amount };
        }
      }
    });
  }

  // Handle simple specials that we can safely simulate
  if (card.special) {
    switch (card.special) {
      case 'flexStrength':
        player.flexStrengthLoss = (player.flexStrengthLoss || 0) + (card.effects?.[0]?.amount || 2);
        break;
      case 'doubleBlock':
        player.block *= 2;
        break;
      case 'doubleStrength':
        player.strength *= 2;
        break;
      case 'metallicize':
        player.metallicize += (card.block || 3);
        break;
      case 'strengthEachTurn':
        player.demonForm += (card.strength || 2);
        break;
      case 'removeStrength': {
        const enemy = enemies[targetIndex];
        if (enemy && enemy.currentHp > 0) {
          enemies[targetIndex] = { ...enemy, strength: (enemy.strength || 0) - (card.strengthReduction || 2) };
        }
        break;
      }
      case 'retainAllBlock':
        player.barricade = true;
        break;
      case 'gainEnergy':
        player.energy += (card.energyGain || 1);
        break;
      case 'hpForEnergy':
        player.currentHp = Math.max(1, player.currentHp - (card.hpLoss || 3));
        player.energy += (card.energyGain || 2);
        break;
      case 'blockPerAttack':
        player.rage = card.rageBlock || 3;
        break;
      case 'damageEqualBlock': {
        const enemy = enemies[targetIndex];
        if (enemy && enemy.currentHp > 0) {
          const dmg = calculateDamage(player.block, player, enemy, { relics: [] });
          enemies[targetIndex] = applyDamageToTarget(enemy, dmg);
          combatStats.damageDealt += dmg;
        }
        break;
      }
      case 'xCost':
        // Already handled above for X-cost cards
        break;
      default:
        // Complex specials (card selection UI, etc.) are skipped gracefully
        break;
    }
  }

  // Handle HP cost cards
  if (card.hpCost && card.hpCost > 0) {
    player.currentHp = Math.max(1, player.currentHp - card.hpCost);
  }

  // Handle draw (not actually drawing in this simplified sim, but tracked)
  // We skip draw effects as hand management is handled at turn level

  // Handle energy gain from card
  if (card.energy && card.energy > 0) {
    player.energy += card.energy;
  }
}

/**
 * Processes an enemy's action for their turn.
 *
 * @param {Object} enemy - The enemy acting
 * @param {Object} move - The enemy's chosen move
 * @param {Object} player - Player state (mutated)
 * @param {Object} combatStats - Stats tracking (mutated)
 * @returns {Object} Updated enemy state
 */
function processEnemyAction(enemy, move, player, combatStats) {
  if (!move) return enemy;

  const updatedEnemy = { ...enemy };
  const attackIntents = [INTENT.ATTACK, INTENT.ATTACK_BUFF, INTENT.ATTACK_DEBUFF, INTENT.ATTACK_DEFEND];

  // Handle damage
  if (attackIntents.includes(move.intent) && move.damage) {
    const times = move.times || 1;
    for (let t = 0; t < times; t++) {
      const dmg = calculateEnemyDamage(move.damage, updatedEnemy, player, []);
      const result = applyDamageToPlayer(player, dmg, [], []);
      Object.assign(player, result.player);
      combatStats.damageReceived += result.hpLost;

      // Flame Barrier retaliation
      if (player.flameBarrier > 0 && result.hpLost >= 0) {
        updatedEnemy.currentHp = Math.max(0, updatedEnemy.currentHp - player.flameBarrier);
      }
    }
  }

  // Handle block
  if (move.block) {
    updatedEnemy.block += move.block;
  }

  // Handle effects
  if (move.effects) {
    move.effects.forEach(effect => {
      if (effect.target === 'player') {
        if (effect.type === 'weak') player.weak += effect.amount;
        if (effect.type === 'vulnerable') player.vulnerable += effect.amount;
        if (effect.type === 'frail') player.frail += effect.amount;
        if (effect.type === 'strengthDown') player.strength -= effect.amount;
        if (effect.type === 'dexterityDown') player.dexterity -= effect.amount;
      } else {
        // Self buffs
        if (effect.type === 'strength') updatedEnemy.strength += effect.amount;
        if (effect.type === 'ritual') updatedEnemy.ritual = (updatedEnemy.ritual || 0) + effect.amount;
        if (effect.type === 'enrage') updatedEnemy.enrage = (updatedEnemy.enrage || 0) + effect.amount;
        if (effect.type === 'metallicize') updatedEnemy.metallicize = (updatedEnemy.metallicize || 0) + effect.amount;
        if (effect.type === 'thorns') updatedEnemy.thorns = (updatedEnemy.thorns || 0) + effect.amount;
      }
    });
  }

  updatedEnemy.lastMove = move;
  return updatedEnemy;
}

/**
 * Decrements status effect durations at end of turn.
 *
 * @param {Object} entity - The entity (player or enemy)
 * @returns {Object} Updated entity with decremented statuses
 */
function tickStatusEffects(entity) {
  const updated = { ...entity };
  if (updated.vulnerable > 0) updated.vulnerable--;
  if (updated.weak > 0) updated.weak--;
  if (updated.frail > 0) updated.frail--;
  return updated;
}

/**
 * Simulates a single combat encounter.
 *
 * @param {Object} playerState - Initial player state
 * @param {Array} enemies - Array of enemy instances
 * @param {Array} deck - Player's deck (array of card objects)
 * @param {Object} [config={}] - Configuration options
 * @param {number} [config.maxTurns=50] - Maximum turns before forced draw
 * @param {number} [config.seed] - RNG seed for deterministic results
 * @param {number} [config.drawPerTurn=5] - Cards drawn per turn
 * @returns {Object} Combat result: { won, turnsPlayed, damageDealt, damageReceived, hpRemaining, cardsPlayed, cardPlayFrequency }
 */
export function simulateCombat(playerState, enemies, deck, config = {}) {
  const maxTurns = config.maxTurns || 50;
  const drawPerTurn = config.drawPerTurn || 5;
  const rng = config.seed != null ? createRng(config.seed) : () => Math.random();

  // Override Math.random for deterministic combat (combatSystem uses it internally)
  const origRandom = Math.random;
  if (config.seed != null) {
    Math.random = rng;
  }
  try {
  return _simulateCombatInner(playerState, enemies, deck, rng, maxTurns, drawPerTurn);
  } finally {
    Math.random = origRandom;
  }
}

function _simulateCombatInner(playerState, enemies, deck, rng, maxTurns, drawPerTurn) {
  // Deep copy state
  const player = { ...playerState, block: 0 };
  let currentEnemies = enemies.map(e => ({ ...e, block: 0 }));
  let drawPile = shuffleWithRng([...deck], rng);
  let discardPile = [];
  let hand = [];

  const combatStats = {
    damageDealt: 0,
    damageReceived: 0,
    cardsPlayed: 0,
    cardPlayFrequency: {}
  };

  let turn = 0;

  while (turn < maxTurns) {
    // --- Start of Player Turn ---

    // Reset block (unless barricade)
    if (!player.barricade) {
      player.block = 0;
    }

    // Reset energy
    player.energy = player.maxEnergy + (player.berserk || 0);

    // Demon form: gain strength
    if (player.demonForm > 0) {
      player.strength += player.demonForm;
    }

    // Metallicize: gain block at start of turn
    if (player.metallicize > 0) {
      player.block += player.metallicize;
    }

    // Brutality: lose 1 HP, draw 1 extra
    if (player.brutality) {
      player.currentHp = Math.max(0, player.currentHp - 1);
      if (player.currentHp <= 0) break;
    }

    // Reset per-turn state
    player.flameBarrier = 0;
    player.noDrawThisTurn = false;
    player.rage = 0;

    // Draw cards
    hand = [];
    for (let i = 0; i < drawPerTurn; i++) {
      if (drawPile.length === 0) {
        if (discardPile.length === 0) break;
        drawPile = shuffleWithRng(discardPile, rng);
        discardPile = [];
      }
      if (drawPile.length > 0) {
        hand.push(drawPile.shift());
      }
    }

    // Determine enemy intents
    currentEnemies = currentEnemies.map((enemy, idx) => {
      if (enemy.currentHp <= 0) return enemy;
      const intent = getEnemyIntent(enemy, turn, rng);
      return { ...enemy, intentData: intent, spawnIndex: idx };
    });

    // Player AI selects and plays cards
    const cardsToPlay = selectCardsToPlay(hand, player.energy, currentEnemies, player);

    for (const { card, targetIndex } of cardsToPlay) {
      // Check if card is still in hand (not removed by prior plays)
      const handIdx = hand.findIndex(c => c.instanceId === card.instanceId);
      if (handIdx === -1) continue;

      // Remove from hand
      hand.splice(handIdx, 1);

      // Deduct energy
      if (card.cost > 0) {
        player.energy -= card.cost;
      }

      // Rage: gain block per attack played
      if (player.rage > 0 && card.type === CARD_TYPES.ATTACK) {
        player.block += player.rage;
      }

      // Process card
      processCard(card, player, currentEnemies, targetIndex, combatStats, rng);

      // Handle exhaust
      if (card.exhaust) {
        // Card is exhausted - not added to discard
      } else {
        discardPile.push(card);
      }

      // Check if all enemies dead
      if (currentEnemies.every(e => e.currentHp <= 0)) break;
      // Check if player dead
      if (player.currentHp <= 0) break;
    }

    // Discard remaining hand
    discardPile.push(...hand);
    hand = [];

    // Check win/loss
    if (currentEnemies.every(e => e.currentHp <= 0)) {
      return {
        won: true,
        turnsPlayed: turn + 1,
        damageDealt: combatStats.damageDealt,
        damageReceived: combatStats.damageReceived,
        hpRemaining: player.currentHp,
        cardsPlayed: combatStats.cardsPlayed,
        cardPlayFrequency: combatStats.cardPlayFrequency
      };
    }
    if (player.currentHp <= 0) {
      return {
        won: false,
        turnsPlayed: turn + 1,
        damageDealt: combatStats.damageDealt,
        damageReceived: combatStats.damageReceived,
        hpRemaining: 0,
        cardsPlayed: combatStats.cardsPlayed,
        cardPlayFrequency: combatStats.cardPlayFrequency
      };
    }

    // --- End of Player Turn ---

    // Flex strength loss
    if (player.flexStrengthLoss > 0) {
      player.strength -= player.flexStrengthLoss;
      player.flexStrengthLoss = 0;
    }

    // Combust: lose HP, deal AoE
    if (player.combust) {
      player.currentHp = Math.max(0, player.currentHp - player.combust.hpLoss);
      currentEnemies = currentEnemies.map(e => {
        if (e.currentHp <= 0) return e;
        return applyDamageToTarget(e, player.combust.damage);
      });
    }

    // --- Enemy Turn ---
    for (let eIdx = 0; eIdx < currentEnemies.length; eIdx++) {
      const enemy = currentEnemies[eIdx];
      if (enemy.currentHp <= 0) continue;

      // Enemy block resets each turn
      currentEnemies[eIdx] = { ...enemy, block: 0 };

      // Ritual: gain strength
      if (enemy.ritual > 0) {
        currentEnemies[eIdx].strength += enemy.ritual;
      }

      // Metallicize: gain block
      if (enemy.metallicize > 0) {
        currentEnemies[eIdx].block += enemy.metallicize;
      }

      const move = enemy.intentData;
      currentEnemies[eIdx] = processEnemyAction(currentEnemies[eIdx], move, player, combatStats);

      if (player.currentHp <= 0) break;
    }

    // Check player death after enemy actions
    if (player.currentHp <= 0) {
      return {
        won: false,
        turnsPlayed: turn + 1,
        damageDealt: combatStats.damageDealt,
        damageReceived: combatStats.damageReceived,
        hpRemaining: 0,
        cardsPlayed: combatStats.cardsPlayed,
        cardPlayFrequency: combatStats.cardPlayFrequency
      };
    }

    // Tick status effects
    Object.assign(player, tickStatusEffects(player));
    currentEnemies = currentEnemies.map(e => {
      if (e.currentHp <= 0) return e;
      return tickStatusEffects(e);
    });

    turn++;
  }

  // Max turns reached - treat as loss
  return {
    won: false,
    turnsPlayed: maxTurns,
    damageDealt: combatStats.damageDealt,
    damageReceived: combatStats.damageReceived,
    hpRemaining: player.currentHp,
    cardsPlayed: combatStats.cardsPlayed,
    cardPlayFrequency: combatStats.cardPlayFrequency
  };
}

/**
 * Simulates a full run through Act 1 (14 floors of combat).
 *
 * @param {Object} [config={}] - Configuration options
 * @param {number} [config.floors=14] - Number of combat floors
 * @param {number} [config.hp=80] - Starting HP
 * @param {number} [config.maxHp=80] - Max HP
 * @param {number} [config.seed] - RNG seed for deterministic results
 * @param {number} [config.eliteChance=0.1] - Chance of elite encounter
 * @param {number} [config.healPerFloor=0] - HP healed between floors (rest simulation)
 * @param {number} [config.ascension=0] - Ascension level (0-10, affects enemy HP, debuffs, etc.)
 * @param {number} [config.acts=1] - Number of acts to simulate (1 = Act 1 only, 2 = Act 1 + Act 2)
 * @returns {Object} Run result: { survived, floorsCleared, finalHp, combatStats, ascension, actsCompleted }
 */
export function simulateRun(config = {}) {
  const floorsPerAct = config.floors || 14;
  const acts = config.acts || 1;
  const seed = config.seed != null ? config.seed : Math.floor(Math.random() * 2147483647);
  const rng = createRng(seed);
  const eliteChance = config.eliteChance != null ? config.eliteChance : 0.1;
  // Default heal of 6 HP/floor models rest sites, events, and potions
  // averaged across a typical run (not every floor is combat)
  const healPerFloor = config.healPerFloor != null ? config.healPerFloor : 6;
  const ascension = config.ascension || 0;

  // Get starter deck - add Wound card at ascension 2+
  const deck = getStarterDeck();
  if (shouldAddWoundAtCombatStart(ascension)) {
    deck.push(createWoundCard(`wound_asc_${Date.now()}`));
  }

  const player = createPlayerState(config);

  const combatStats = [];
  let floorsCleared = 0;
  let actsCompleted = 0;

  for (let act = 1; act <= acts; act++) {
    // Normal floors for this act
    for (let floor = 1; floor <= floorsPerAct; floor++) {
      const origRandom = Math.random;
      Math.random = () => rng();
      let enemies;
      let nodeType = 'combat';
      try {
        const isElite = rng() < eliteChance;
        nodeType = isElite ? 'elite' : 'combat';
        enemies = getEncounter(act, floor, eliteChance, isElite);
      } finally {
        Math.random = origRandom;
      }

      if (ascension > 0) {
        enemies = applyAscensionToEnemies(enemies, ascension, nodeType);
      }

      const result = simulateCombat(
        { ...player },
        enemies,
        [...deck],
        { seed: Math.floor(rng() * 2147483647), maxTurns: 50 }
      );

      combatStats.push({
        floor: floorsCleared + 1,
        act,
        ...result,
        enemyNames: enemies.map(e => e.name)
      });

      if (!result.won) {
        return {
          survived: false,
          floorsCleared,
          finalHp: 0,
          combatStats,
          ascension,
          actsCompleted
        };
      }

      player.currentHp = result.hpRemaining;

      if (healPerFloor > 0) {
        const healPercent = getAscensionHealPercent(ascension);
        const healAmount = Math.floor(player.maxHp * healPercent);
        player.currentHp = Math.min(player.maxHp, player.currentHp + Math.min(healPerFloor, healAmount));
      }

      // Simulate card reward — pick a random card and add to deck
      // Models the deck-building progression that happens in actual gameplay
      const origRandom2 = Math.random;
      Math.random = () => rng();
      try {
        const roll = rng();
        const rarity = roll < 0.6 ? 'common' : roll < 0.9 ? 'uncommon' : 'rare';
        const reward = getRandomCard(rarity);
        if (reward) {
          deck.push({ ...reward, instanceId: `reward_${floorsCleared}_${Date.now()}` });
        }
      } finally {
        Math.random = origRandom2;
      }

      floorsCleared++;
    }

    // Boss fight at end of act
    const origRandom = Math.random;
    Math.random = () => rng();
    let bossEnemies;
    try {
      bossEnemies = getBossEncounter(act);
    } finally {
      Math.random = origRandom;
    }

    if (ascension > 0) {
      bossEnemies = applyAscensionToEnemies(bossEnemies, ascension, 'boss');
    }

    const bossResult = simulateCombat(
      { ...player },
      bossEnemies,
      [...deck],
      { seed: Math.floor(rng() * 2147483647), maxTurns: 50 }
    );

    combatStats.push({
      floor: floorsCleared + 1,
      act,
      boss: true,
      ...bossResult,
      enemyNames: bossEnemies.map(e => e.name)
    });

    if (!bossResult.won) {
      return {
        survived: false,
        floorsCleared,
        finalHp: 0,
        combatStats,
        ascension,
        actsCompleted
      };
    }

    player.currentHp = bossResult.hpRemaining;

    // Full heal between acts (like StS rest before next act)
    if (act < acts) {
      player.currentHp = Math.min(player.maxHp, player.currentHp + Math.floor(player.maxHp * 0.25));
    }

    floorsCleared++;
    actsCompleted++;
  }

  return {
    survived: true,
    floorsCleared,
    finalHp: player.currentHp,
    combatStats,
    ascension,
    actsCompleted
  };
}

/**
 * Runs n simulations and produces aggregate balance statistics.
 *
 * @param {number} [n=1000] - Number of simulations to run
 * @param {Object} [config={}] - Configuration passed to simulateRun
 * @returns {Object} Balance report: { winRate, avgFloorsCleared, avgTurnsPerCombat, deadliestEnemy, avgHpAtEnd, cardPlayFrequency, totalRuns, totalTime }
 */
export function runBalanceReport(n = 1000, config = {}) {
  const startTime = Date.now();

  let wins = 0;
  let totalFloorsCleared = 0;
  let totalTurns = 0;
  let totalCombats = 0;
  let totalHpAtEnd = 0;
  let survivorCount = 0;
  const enemyKills = {}; // enemy name -> times it killed the player
  const cardFrequency = {};

  for (let i = 0; i < n; i++) {
    const runSeed = config.seed != null ? config.seed + i : undefined;
    const result = simulateRun({ ...config, seed: runSeed });

    if (result.survived) {
      wins++;
      totalHpAtEnd += result.finalHp;
      survivorCount++;
    }

    totalFloorsCleared += result.floorsCleared;

    // Aggregate combat stats
    result.combatStats.forEach(cs => {
      totalTurns += cs.turnsPlayed;
      totalCombats++;

      // Track card frequencies
      if (cs.cardPlayFrequency) {
        Object.entries(cs.cardPlayFrequency).forEach(([cardId, count]) => {
          cardFrequency[cardId] = (cardFrequency[cardId] || 0) + count;
        });
      }

      // Track deadliest enemy
      if (!cs.won && cs.enemyNames) {
        cs.enemyNames.forEach(name => {
          enemyKills[name] = (enemyKills[name] || 0) + 1;
        });
      }
    });
  }

  // Find deadliest enemy
  let deadliestEnemy = 'none';
  let maxKills = 0;
  Object.entries(enemyKills).forEach(([name, kills]) => {
    if (kills > maxKills) {
      maxKills = kills;
      deadliestEnemy = name;
    }
  });

  // Sort card frequency
  const sortedCardFrequency = Object.entries(cardFrequency)
    .sort((a, b) => b[1] - a[1])
    .reduce((obj, [key, val]) => {
      obj[key] = val;
      return obj;
    }, {});

  const totalTime = Date.now() - startTime;

  return {
    winRate: n > 0 ? wins / n : 0,
    avgFloorsCleared: n > 0 ? totalFloorsCleared / n : 0,
    avgTurnsPerCombat: totalCombats > 0 ? totalTurns / totalCombats : 0,
    deadliestEnemy,
    avgHpAtEnd: survivorCount > 0 ? totalHpAtEnd / survivorCount : 0,
    cardPlayFrequency: sortedCardFrequency,
    totalRuns: n,
    totalTime
  };
}
