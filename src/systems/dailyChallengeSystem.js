/**
 * Daily Challenge System
 * Seeded runs with fixed modifiers and scoring.
 * Each day generates a unique challenge with 2-3 modifiers from a pool.
 */

import { SeededRNG, dateSeed, todayDateString } from '../utils/seededRandom';

// ── Modifier Pool ──────────────────────────────────────────────────

export const DAILY_MODIFIERS = {
  enemy_hp_up: {
    id: 'enemy_hp_up',
    name: 'Fortified Foes',
    description: 'All enemies have 25% more HP',
    scoreMultiplier: 1.3,
    modifiers: { enemyHpMultiplier: 1.25 }
  },
  less_energy: {
    id: 'less_energy',
    name: 'Exhaustion',
    description: 'Start each combat with 1 less energy',
    scoreMultiplier: 1.5,
    playerMods: { maxEnergy: -1 }
  },
  double_gold: {
    id: 'double_gold',
    name: 'Golden Age',
    description: 'Earn double gold from all sources',
    scoreMultiplier: 0.8,
    modifiers: { goldMultiplier: 2 }
  },
  random_relic: {
    id: 'random_relic',
    name: 'Gifted',
    description: 'Start with a random relic',
    scoreMultiplier: 0.9,
    startEffect: 'random_relic'
  },
  fragile: {
    id: 'fragile',
    name: 'Fragile',
    description: 'Start with 20% less max HP',
    scoreMultiplier: 1.4,
    playerMods: { maxHpMultiplier: 0.8 }
  },
  elite_hunter: {
    id: 'elite_hunter',
    name: 'Elite Hunter',
    description: 'Elites have 50% more HP but drop better rewards',
    scoreMultiplier: 1.2,
    modifiers: { eliteHpMultiplier: 1.5 }
  }
};

const MODIFIER_IDS = Object.keys(DAILY_MODIFIERS);

// ── Daily Challenge Generation ─────────────────────────────────────

/**
 * Generate today's daily challenge configuration.
 * Same day always produces the same challenge.
 * @param {string} [date] - Optional date override (YYYY-MM-DD). Defaults to today.
 * @returns {{ seed: number, date: string, modifierIds: string[] }}
 */
export const getDailyChallenge = (date) => {
  const dateStr = date || todayDateString();
  const seed = dateSeed(dateStr);
  const rng = new SeededRNG(seed);

  // Pick 2-3 modifiers
  const count = rng.nextInt(2, 3);
  const shuffled = rng.shuffle([...MODIFIER_IDS]);
  const modifierIds = shuffled.slice(0, count);

  return {
    seed,
    date: dateStr,
    modifierIds
  };
};

/**
 * Get full modifier objects for a list of modifier IDs.
 * @param {string[]} modifierIds
 * @returns {Object[]}
 */
export const getModifierDetails = (modifierIds) =>
  modifierIds.map(id => DAILY_MODIFIERS[id]).filter(Boolean);

// ── Modifier Application ───────────────────────────────────────────

/**
 * Apply daily challenge modifiers to initial game state.
 * Called after START_GAME sets up the base state.
 * @param {Object} state - Game state
 * @param {string[]} modifierIds - Active modifier IDs
 * @returns {Object} Modified state
 */
export const applyDailyChallengeModifiers = (state, modifierIds) => {
  let newState = { ...state };
  const mods = getModifierDetails(modifierIds);

  for (const mod of mods) {
    // Apply player stat modifications
    if (mod.playerMods) {
      const player = { ...newState.player };
      if (mod.playerMods.maxEnergy !== undefined) {
        player.maxEnergy = Math.max(1, player.maxEnergy + mod.playerMods.maxEnergy);
        player.energy = player.maxEnergy;
      }
      if (mod.playerMods.maxHpMultiplier !== undefined) {
        player.maxHp = Math.max(1, Math.floor(player.maxHp * mod.playerMods.maxHpMultiplier));
        player.currentHp = player.maxHp;
      }
      newState.player = player;
    }
  }

  return newState;
};

/**
 * Get combined combat modifiers from daily challenge modifier IDs.
 * These are merged with ascension modifiers during enemy creation.
 * @param {string[]} modifierIds
 * @returns {Object} Combat modifier flags
 */
export const getDailyChallengeModifiers = (modifierIds) => {
  const result = {};
  const mods = getModifierDetails(modifierIds);

  for (const mod of mods) {
    if (mod.modifiers) {
      Object.assign(result, mod.modifiers);
    }
  }

  return result;
};

// ── Score Calculation ──────────────────────────────────────────────

/**
 * Calculate the daily challenge score from run stats.
 * Score = (floors * 10) + (enemies * 5) + remaining HP + gold + modifier bonuses
 * @param {Object} runStats - Run statistics from game state
 * @param {Object} player - Player state (HP, gold)
 * @param {string[]} modifierIds - Active modifiers (affect score multiplier)
 * @returns {number} Final score
 */
export const calculateChallengeScore = (runStats, player, modifierIds) => {
  let score = 0;

  // Base scoring components
  score += (runStats.floor || 0) * 10;
  score += (runStats.enemiesKilled || 0) * 5;
  score += (player.currentHp || 0);
  score += (player.gold || 0);

  // Bonus for damage dealt
  score += Math.floor((runStats.damageDealt || 0) / 10);

  // Apply combined modifier score multiplier
  const mods = getModifierDetails(modifierIds);
  let multiplier = 1;
  for (const mod of mods) {
    if (mod.scoreMultiplier) {
      multiplier *= mod.scoreMultiplier;
    }
  }

  return Math.floor(score * multiplier);
};

// ── LocalStorage Persistence ───────────────────────────────────────

const STORAGE_KEY = 'spire_daily_challenge';

/**
 * Save a daily challenge score.
 * @param {string} date - Challenge date (YYYY-MM-DD)
 * @param {number} score - Score achieved
 */
export const saveChallengeScore = (date, score) => {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const existing = data[date];
    // Only save if it's a new high score for this date
    if (!existing || score > existing.score) {
      data[date] = { score, timestamp: Date.now() };
    }
    // Keep last 30 days only
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    for (const key of Object.keys(data)) {
      if (data[key].timestamp < cutoff) delete data[key];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage unavailable — silently skip
  }
};

/**
 * Load saved challenge scores.
 * @returns {Object} Map of date → { score, timestamp }
 */
export const loadChallengeScores = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
};

/**
 * Get the score for a specific date, or null if none.
 * @param {string} date
 * @returns {number|null}
 */
export const getChallengeScore = (date) => {
  const scores = loadChallengeScores();
  return scores[date]?.score ?? null;
};
