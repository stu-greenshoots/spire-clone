/**
 * Meta-Progression System
 * Tracks stats across runs and unlocks new content based on milestones.
 */

const STORAGE_KEY = 'spireAscent_progression';

const DEFAULT_PROGRESSION = {
  totalRuns: 0,
  wins: 0,
  losses: 0,
  highestFloor: 0,
  highestAscension: 0,
  totalEnemiesKilled: 0,
  totalGoldEarned: 0,
  totalDamageDealt: 0,
  totalCardsPlayed: 0,
  cardsPlayedById: {},
  relicsCollected: {},
  enemiesDefeated: {},
  achievements: [],
  unlockedCards: [],
  unlockedRelics: [],
  runHistory: [] // Last 10 runs
};

// Achievement definitions
const ACHIEVEMENTS = [
  { id: 'first_blood', name: 'First Blood', description: 'Win your first run', condition: (p) => p.wins >= 1 },
  { id: 'centurion', name: 'Centurion', description: 'Kill 100 enemies', condition: (p) => p.totalEnemiesKilled >= 100 },
  { id: 'card_master', name: 'Card Master', description: 'Play 500 cards', condition: (p) => p.totalCardsPlayed >= 500 },
  { id: 'minimalist', name: 'Minimalist', description: 'Win with 5 or fewer cards in deck', condition: (p) => p.achievements.includes('minimalist_run') },
  { id: 'perfectionist', name: 'Perfectionist', description: 'Win without taking damage in a combat', condition: (p) => p.achievements.includes('perfect_combat') },
  { id: 'collector', name: 'Collector', description: 'Collect 20 different relics across all runs', condition: (p) => Object.keys(p.relicsCollected).length >= 20 },
  { id: 'slayer', name: 'Slayer', description: 'Defeat all boss types', condition: (p) => {
    const bosses = ['slimeBoss', 'theGuardian', 'hexaghost', 'theChamp', 'awakened_one', 'timeEater', 'corruptHeart'];
    return bosses.every(b => p.enemiesDefeated[b]);
  }},
  { id: 'ascendant', name: 'Ascendant', description: 'Complete Ascension 5', condition: (p) => p.highestAscension >= 5 },
  { id: 'wealthy', name: 'Wealthy', description: 'Earn 1000 total gold', condition: (p) => p.totalGoldEarned >= 1000 },
  { id: 'dedicated', name: 'Dedicated', description: 'Complete 10 runs', condition: (p) => p.totalRuns >= 10 }
];

// Unlock milestones
const UNLOCK_MILESTONES = [
  { id: 'unlock_1', requirement: (p) => p.wins >= 1, unlockType: 'cards', unlockIds: ['dark_embrace_card', 'feel_no_pain_card'] },
  { id: 'unlock_2', requirement: (p) => p.totalEnemiesKilled >= 50, unlockType: 'relics', unlockIds: ['bronze_scales'] },
  { id: 'unlock_3', requirement: (p) => p.totalRuns >= 5, unlockType: 'cards', unlockIds: ['offering', 'feed'] },
  { id: 'unlock_4', requirement: (p) => p.wins >= 3, unlockType: 'relics', unlockIds: ['dead_branch'] },
  { id: 'unlock_5', requirement: (p) => p.highestAscension >= 1, unlockType: 'cards', unlockIds: ['corruption', 'barricade'] }
];

export const loadProgression = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return { ...DEFAULT_PROGRESSION, ...JSON.parse(saved) };
  } catch (e) { /* ignore */ }
  return { ...DEFAULT_PROGRESSION };
};

export const saveProgression = (progression) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progression));
  } catch (e) { /* ignore */ }
};

export const updateRunStats = (progression, runData) => {
  const updated = { ...progression };
  updated.totalRuns++;
  if (runData.won) updated.wins++;
  else updated.losses++;
  updated.highestFloor = Math.max(updated.highestFloor, runData.floor);
  updated.totalEnemiesKilled += runData.enemiesKilled || 0;
  updated.totalGoldEarned += runData.goldEarned || 0;
  updated.totalDamageDealt += runData.damageDealt || 0;
  updated.totalCardsPlayed += runData.cardsPlayed || 0;

  // Track enemies defeated
  if (runData.defeatedEnemies) {
    runData.defeatedEnemies.forEach(id => {
      updated.enemiesDefeated[id] = (updated.enemiesDefeated[id] || 0) + 1;
    });
  }

  // Track relics collected
  if (runData.relics) {
    runData.relics.forEach(r => {
      updated.relicsCollected[r.id] = true;
    });
  }

  // Add to run history (keep last 10)
  updated.runHistory = [
    {
      date: new Date().toISOString(),
      won: runData.won,
      floor: runData.floor,
      deckSize: runData.deckSize,
      relicCount: runData.relics?.length || 0,
      ascension: runData.ascension || 0,
      causeOfDeath: runData.causeOfDeath || null
    },
    ...updated.runHistory
  ].slice(0, 10);

  // Check achievements
  ACHIEVEMENTS.forEach(ach => {
    if (!updated.achievements.includes(ach.id) && ach.condition(updated)) {
      updated.achievements.push(ach.id);
    }
  });

  // Check unlocks
  UNLOCK_MILESTONES.forEach(milestone => {
    if (milestone.requirement(updated)) {
      if (milestone.unlockType === 'cards') {
        milestone.unlockIds.forEach(id => {
          if (!updated.unlockedCards.includes(id)) updated.unlockedCards.push(id);
        });
      } else if (milestone.unlockType === 'relics') {
        milestone.unlockIds.forEach(id => {
          if (!updated.unlockedRelics.includes(id)) updated.unlockedRelics.push(id);
        });
      }
    }
  });

  saveProgression(updated);
  return updated;
};

export const getAchievements = () => ACHIEVEMENTS;
export const getUnlockMilestones = () => UNLOCK_MILESTONES;
export { ACHIEVEMENTS, UNLOCK_MILESTONES };
