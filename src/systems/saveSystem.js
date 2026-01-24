const SAVE_KEY = 'spireAscent_save';
const HISTORY_KEY = 'spireAscent_runHistory';

export const saveGame = (state) => {
  try {
    const saveData = {
      version: 2,
      timestamp: Date.now(),
      state: {
        player: state.player,
        deck: state.deck,
        drawPile: state.drawPile,
        hand: state.hand,
        discardPile: state.discardPile,
        exhaustPile: state.exhaustPile,
        relics: state.relics,
        potions: state.potions,
        enemies: state.enemies,
        currentFloor: state.currentFloor,
        act: state.act,
        map: state.map,
        currentNode: state.currentNode,
        phase: state.phase,
        turn: state.turn,
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
  } catch (e) {
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
  } catch (e) {
    return null;
  }
};

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
  } catch (e) { /* ignore */ }
};

export const getRunHistory = () => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
};
