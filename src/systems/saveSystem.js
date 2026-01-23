const SAVE_KEY = 'spireAscent_save';
const SAVE_VERSION = '1.0';

export function saveGame(state) {
  const saveData = {
    version: SAVE_VERSION,
    timestamp: Date.now(),
    player: {
      hp: state.player.currentHp,
      maxHp: state.player.maxHp,
      gold: state.player.gold,
      block: 0,
    },
    deck: state.deck.map(card => card.id),
    relics: state.relics.map(relic => relic.id),
    map: state.map,
    currentNode: state.currentNode,
    floor: state.currentFloor,
    act: state.act,
  };
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    return true;
  } catch (e) {
    console.error('Failed to save:', e);
    return false;
  }
}

export function loadGame() {
  try {
    const data = localStorage.getItem(SAVE_KEY);
    if (!data) return null;
    const saveData = JSON.parse(data);
    if (saveData.version !== SAVE_VERSION) {
      deleteSave();
      return null;
    }
    return saveData;
  } catch (e) {
    console.error('Failed to load:', e);
    return null;
  }
}

export function deleteSave() {
  localStorage.removeItem(SAVE_KEY);
}

export function hasSave() {
  return localStorage.getItem(SAVE_KEY) !== null;
}
