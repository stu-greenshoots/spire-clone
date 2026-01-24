const SAVE_KEY = 'spireAscent_save';
const HISTORY_KEY = 'spireAscent_runHistory';

/**
 * Serialize a card to its save-friendly format.
 * Stores only the ID, upgrade state, and instance ID.
 */
const serializeCard = (card) => {
  if (!card) return null;
  const serialized = { id: card.id, instanceId: card.instanceId };
  if (card.upgraded) {
    serialized.upgraded = true;
  }
  return serialized;
};

/**
 * Serialize a relic to its save-friendly format.
 * Stores the ID plus any runtime state (counters, used flags, etc).
 */
const serializeRelic = (relic) => {
  if (!relic) return null;
  const serialized = { id: relic.id };
  // Preserve runtime state that varies per-run
  if (relic.counter !== undefined) serialized.counter = relic.counter;
  if (relic.liftCount !== undefined) serialized.liftCount = relic.liftCount;
  if (relic.used !== undefined) serialized.used = relic.used;
  if (relic.usesRemaining !== undefined) serialized.usesRemaining = relic.usesRemaining;
  if (relic.usedThisCombat !== undefined) serialized.usedThisCombat = relic.usedThisCombat;
  return serialized;
};

/**
 * Serialize a potion to its save-friendly format.
 * Potions have no runtime state beyond their ID.
 */
const serializePotion = (potion) => {
  if (!potion) return null;
  return { id: potion.id };
};

export const saveGame = (state) => {
  try {
    const saveData = {
      version: 3,
      timestamp: Date.now(),
      state: {
        player: {
          currentHp: state.player.currentHp,
          maxHp: state.player.maxHp,
          gold: state.player.gold,
          strength: state.player.strength || 0,
          dexterity: state.player.dexterity || 0
        },
        deck: (state.deck || []).map(serializeCard).filter(Boolean),
        relics: (state.relics || []).map(serializeRelic).filter(Boolean),
        potions: (state.potions || []).map(serializePotion).filter(Boolean),
        currentFloor: state.currentFloor,
        act: state.act,
        map: state.map,
        currentNode: state.currentNode,
        ascension: state.ascension || 0
      }
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    return true;
  } catch (e) {
    console.error('Save failed:', e);
    return false;
  }
};

export const loadGame = () => {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const saveData = JSON.parse(raw);
    if (!validateSave(saveData)) {
      console.warn('Corrupted save detected');
      return null;
    }
    return saveData.state;
  } catch (e) {
    console.error('Load failed:', e);
    return null;
  }
};

export const hasSavedGame = () => {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const saveData = JSON.parse(raw);
    return validateSave(saveData);
  } catch {
    return false;
  }
};

export const hasSave = hasSavedGame;

export const getSavePreview = () => {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const saveData = JSON.parse(raw);
    if (!validateSave(saveData)) return null;
    const s = saveData.state;
    return {
      floor: s.currentFloor,
      hp: s.player.currentHp,
      maxHp: s.player.maxHp,
      deckSize: s.deck.length,
      relicCount: s.relics.length,
      gold: s.player.gold,
      ascension: s.ascension || 0,
      timestamp: saveData.timestamp
    };
  } catch {
    return null;
  }
};

// Exported for testing
export { serializeCard, serializeRelic, serializePotion };

export const deleteSave = () => {
  localStorage.removeItem(SAVE_KEY);
};

const validateSave = (saveData) => {
  if (!saveData || !saveData.state) return false;
  if (!saveData.version) return false;
  const s = saveData.state;
  if (!s.player || typeof s.player.currentHp !== 'number') return false;
  if (!s.deck || !Array.isArray(s.deck)) return false;
  if (!s.relics || !Array.isArray(s.relics)) return false;
  if (typeof s.currentFloor !== 'number') return false;
  // v3 format: deck items must have an id field
  if (saveData.version >= 3 && s.deck.length > 0) {
    if (typeof s.deck[0] !== 'object' || !s.deck[0].id) return false;
  }
  return true;
};

// Run History
export const addRunToHistory = (runData) => {
  try {
    const history = getRunHistory();
    history.unshift({
      date: new Date().toISOString(),
      won: runData.won,
      floor: runData.floor,
      deckSize: runData.deckSize || 0,
      relicCount: runData.relicCount || 0,
      gold: runData.gold || 0,
      ascension: runData.ascension || 0,
      causeOfDeath: runData.causeOfDeath || null,
      enemiesKilled: runData.enemiesKilled || 0
    });
    // Keep only last 10
    const trimmed = history.slice(0, 10);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch { /* ignore */ }
};

export const getRunHistory = () => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
};
