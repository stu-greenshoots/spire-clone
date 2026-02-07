import { ALL_CARDS } from '../data/cards';
import { ALL_RELICS } from '../data/relics';
import { ALL_ENEMIES } from '../data/enemies';

const STORAGE_KEY = 'spireAscent_customData';

// Preset AI patterns for enemies (functions can't be serialized)
export const AI_PATTERNS = {
  sequential: (enemy, turn) => {
    return enemy.moveset[turn % enemy.moveset.length];
  },
  random: (enemy) => {
    return enemy.moveset[Math.floor(Math.random() * enemy.moveset.length)];
  },
  firstThenRandom: (enemy, turn) => {
    if (turn === 0) return enemy.moveset[0];
    return enemy.moveset[Math.floor(Math.random() * enemy.moveset.length)];
  },
  weighted: (enemy, turn, lastMove) => {
    // First move is always moveset[0], then weighted toward earlier moves
    if (turn === 0) return enemy.moveset[0];
    const weights = enemy.moveset.map((_, i) => enemy.moveset.length - i);
    // Avoid repeating last move
    const filtered = enemy.moveset.filter(m => m.id !== lastMove?.id);
    if (filtered.length === 0) return enemy.moveset[0];
    const total = filtered.reduce((sum, _, i) => sum + (weights[i] || 1), 0);
    let roll = Math.random() * total;
    for (let i = 0; i < filtered.length; i++) {
      roll -= weights[i] || 1;
      if (roll <= 0) return filtered[i];
    }
    return filtered[filtered.length - 1];
  },
  phaseShift: (enemy, turn) => {
    // First half of moveset for first 3 turns, second half after
    const half = Math.floor(enemy.moveset.length / 2) || 1;
    if (turn < 3) {
      return enemy.moveset[turn % half];
    }
    return enemy.moveset[half + ((turn - 3) % (enemy.moveset.length - half))];
  }
};

// Store original data for reset capability
let originalCards = null;
let originalRelics = null;
let originalEnemies = null;

function storeOriginals() {
  if (!originalCards) {
    originalCards = ALL_CARDS.map(c => ({ ...c }));
    originalRelics = ALL_RELICS.map(r => ({ ...r }));
    originalEnemies = ALL_ENEMIES.map(e => ({ ...e }));
  }
}

export function loadCustomData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveCustomData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save custom data:', e);
  }
}

function getOrCreateStore() {
  let data = loadCustomData();
  if (!data) {
    data = { version: '1.0', cards: {}, relics: {}, enemies: {} };
  }
  return data;
}

export function saveCustomEntry(type, id, entryData) {
  const store = getOrCreateStore();
  if (!store[type]) store[type] = {};
  store[type][id] = entryData;
  saveCustomData(store);
}

export function deleteCustomEntry(type, id) {
  const store = getOrCreateStore();
  if (store[type] && store[type][id]) {
    delete store[type][id];
    saveCustomData(store);
  }
}

export function resetAllCustomData() {
  localStorage.removeItem(STORAGE_KEY);
  // Restore originals
  if (originalCards) {
    ALL_CARDS.length = 0;
    originalCards.forEach(c => ALL_CARDS.push({ ...c }));
  }
  if (originalRelics) {
    ALL_RELICS.length = 0;
    originalRelics.forEach(r => ALL_RELICS.push({ ...r }));
  }
  if (originalEnemies) {
    ALL_ENEMIES.length = 0;
    originalEnemies.forEach(e => ALL_ENEMIES.push({ ...e }));
  }
}

export function isCustomEntry(type, id) {
  const store = loadCustomData();
  return !!(store && store[type] && store[type][id]);
}

/**
 * Check if any custom overrides are active
 * @returns {boolean} true if any custom data exists
 */
export function hasCustomOverrides() {
  const store = loadCustomData();
  if (!store) return false;
  const hasCards = store.cards && Object.keys(store.cards).length > 0;
  const hasRelics = store.relics && Object.keys(store.relics).length > 0;
  const hasEnemies = store.enemies && Object.keys(store.enemies).length > 0;
  return hasCards || hasRelics || hasEnemies;
}

/**
 * Get a summary of all active custom overrides
 * @returns {{ cards: string[], relics: string[], enemies: string[] }}
 */
export function getCustomOverridesSummary() {
  const store = loadCustomData();
  return {
    cards: store?.cards ? Object.keys(store.cards) : [],
    relics: store?.relics ? Object.keys(store.relics) : [],
    enemies: store?.enemies ? Object.keys(store.enemies) : []
  };
}

/**
 * Validate custom card data against schema
 * @param {Object} cardData - Card data to validate
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateCardData(cardData) {
  const errors = [];

  if (!cardData.id || typeof cardData.id !== 'string') {
    errors.push('Card must have a valid id');
  }

  if (cardData.cost !== undefined) {
    if (typeof cardData.cost !== 'number' && cardData.cost !== 'X') {
      errors.push(`Invalid cost: ${cardData.cost} (must be number or "X")`);
    } else if (typeof cardData.cost === 'number' && cardData.cost < 0) {
      errors.push(`Negative cost not allowed: ${cardData.cost}`);
    }
  }

  if (cardData.damage !== undefined && typeof cardData.damage === 'number' && cardData.damage < 0) {
    errors.push(`Negative damage not allowed: ${cardData.damage}`);
  }

  if (cardData.block !== undefined && typeof cardData.block === 'number' && cardData.block < 0) {
    errors.push(`Negative block not allowed: ${cardData.block}`);
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate custom enemy data against schema
 * @param {Object} enemyData - Enemy data to validate
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateEnemyData(enemyData) {
  const errors = [];

  if (!enemyData.id || typeof enemyData.id !== 'string') {
    errors.push('Enemy must have a valid id');
  }

  if (enemyData.hp !== undefined) {
    if (typeof enemyData.hp === 'object') {
      if (enemyData.hp.min !== undefined && enemyData.hp.min < 1) {
        errors.push(`Invalid HP min: ${enemyData.hp.min} (must be >= 1)`);
      }
      if (enemyData.hp.max !== undefined && enemyData.hp.max < 1) {
        errors.push(`Invalid HP max: ${enemyData.hp.max} (must be >= 1)`);
      }
    } else if (typeof enemyData.hp === 'number' && enemyData.hp < 1) {
      errors.push(`Invalid HP: ${enemyData.hp} (must be >= 1)`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate custom relic data against schema
 * @param {Object} relicData - Relic data to validate
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateRelicData(relicData) {
  const errors = [];

  if (!relicData.id || typeof relicData.id !== 'string') {
    errors.push('Relic must have a valid id');
  }

  return { valid: errors.length === 0, errors };
}

function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])
        && target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

export function applyCustomData() {
  storeOriginals();
  const store = loadCustomData();
  if (!store) return;

  const appliedCards = [];
  const appliedRelics = [];
  const appliedEnemies = [];
  const validationErrors = [];

  // Apply card overrides
  if (store.cards) {
    for (const [id, overrides] of Object.entries(store.cards)) {
      // Validate before applying
      const validation = validateCardData({ id, ...overrides });
      if (!validation.valid) {
        validationErrors.push(`Card "${id}": ${validation.errors.join(', ')}`);
        continue; // Skip invalid entries
      }

      const idx = ALL_CARDS.findIndex(c => c.id === id);
      if (idx >= 0) {
        // Existing card - merge overrides
        const merged = deepMerge(ALL_CARDS[idx], overrides);
        ALL_CARDS[idx] = merged;
        appliedCards.push(id);
      } else {
        // New custom card - add to array
        ALL_CARDS.push({ ...overrides, id });
        appliedCards.push(`${id} (new)`);
      }
    }
  }

  // Apply relic overrides
  if (store.relics) {
    for (const [id, overrides] of Object.entries(store.relics)) {
      // Validate before applying
      const validation = validateRelicData({ id, ...overrides });
      if (!validation.valid) {
        validationErrors.push(`Relic "${id}": ${validation.errors.join(', ')}`);
        continue;
      }

      const idx = ALL_RELICS.findIndex(r => r.id === id);
      if (idx >= 0) {
        const merged = deepMerge(ALL_RELICS[idx], overrides);
        ALL_RELICS[idx] = merged;
        appliedRelics.push(id);
      } else {
        ALL_RELICS.push({ ...overrides, id });
        appliedRelics.push(`${id} (new)`);
      }
    }
  }

  // Apply enemy overrides
  if (store.enemies) {
    for (const [id, overrides] of Object.entries(store.enemies)) {
      // Validate before applying
      const validation = validateEnemyData({ id, ...overrides });
      if (!validation.valid) {
        validationErrors.push(`Enemy "${id}": ${validation.errors.join(', ')}`);
        continue;
      }

      const idx = ALL_ENEMIES.findIndex(e => e.id === id);
      if (idx >= 0) {
        const merged = deepMerge(ALL_ENEMIES[idx], overrides);
        // Restore AI function from pattern name
        if (overrides.aiPattern && AI_PATTERNS[overrides.aiPattern]) {
          merged.ai = AI_PATTERNS[overrides.aiPattern];
        } else if (!merged.ai) {
          merged.ai = originalEnemies[idx].ai;
        }
        ALL_ENEMIES[idx] = merged;
        appliedEnemies.push(id);
      } else {
        const newEnemy = { ...overrides, id };
        if (overrides.aiPattern && AI_PATTERNS[overrides.aiPattern]) {
          newEnemy.ai = AI_PATTERNS[overrides.aiPattern];
        } else {
          newEnemy.ai = AI_PATTERNS.sequential;
        }
        ALL_ENEMIES.push(newEnemy);
        appliedEnemies.push(`${id} (new)`);
      }
    }
  }

  // Log applied overrides if any exist
  const hasOverrides = appliedCards.length > 0 || appliedRelics.length > 0 || appliedEnemies.length > 0;
  if (hasOverrides) {
    console.warn(
      '%c⚠️ CUSTOM DATA OVERRIDES ACTIVE',
      'background: #ff6600; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;'
    );
    if (appliedCards.length > 0) {
      console.warn('  Cards overridden:', appliedCards.join(', '));
    }
    if (appliedRelics.length > 0) {
      console.warn('  Relics overridden:', appliedRelics.join(', '));
    }
    if (appliedEnemies.length > 0) {
      console.warn('  Enemies overridden:', appliedEnemies.join(', '));
    }
    console.warn('  To reset: localStorage.removeItem("spireAscent_customData") and refresh');
  }

  // Log validation errors
  if (validationErrors.length > 0) {
    console.error(
      '%c❌ CUSTOM DATA VALIDATION ERRORS (entries skipped)',
      'background: #cc0000; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;'
    );
    validationErrors.forEach(err => console.error('  ', err));
  }
}
