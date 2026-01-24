/**
 * Ascension/Difficulty System
 * Progressive difficulty modifiers unlocked after winning.
 */

export const ASCENSION_LEVELS = [
  { level: 0, description: 'Normal difficulty', modifiers: {} },
  { level: 1, description: 'Enemies have 10% more HP', modifiers: { enemyHpMultiplier: 1.1 } },
  { level: 2, description: 'Start each combat with a Wound in draw pile', modifiers: { enemyHpMultiplier: 1.1, startWithWound: true } },
  { level: 3, description: 'Elites have stronger movesets', modifiers: { enemyHpMultiplier: 1.1, startWithWound: true, eliteBuffed: true } },
  { level: 4, description: 'Rest sites heal 25% instead of 30%', modifiers: { enemyHpMultiplier: 1.1, startWithWound: true, eliteBuffed: true, reducedHealing: true } },
  { level: 5, description: 'Bosses have additional move patterns', modifiers: { enemyHpMultiplier: 1.1, startWithWound: true, eliteBuffed: true, reducedHealing: true, bossBuffed: true } },
  { level: 6, description: 'Start with less gold (75 instead of 99)', modifiers: { enemyHpMultiplier: 1.1, startWithWound: true, eliteBuffed: true, reducedHealing: true, bossBuffed: true, reducedGold: true } },
  { level: 7, description: 'Normal enemies have 20% more HP', modifiers: { enemyHpMultiplier: 1.2, startWithWound: true, eliteBuffed: true, reducedHealing: true, bossBuffed: true, reducedGold: true } },
  { level: 8, description: 'Card rewards have fewer choices', modifiers: { enemyHpMultiplier: 1.2, startWithWound: true, eliteBuffed: true, reducedHealing: true, bossBuffed: true, reducedGold: true, fewerRewards: true } },
  { level: 9, description: 'Start with a Curse', modifiers: { enemyHpMultiplier: 1.2, startWithWound: true, eliteBuffed: true, reducedHealing: true, bossBuffed: true, reducedGold: true, fewerRewards: true, startWithCurse: true } },
  { level: 10, description: 'Enemies deal 10% more damage', modifiers: { enemyHpMultiplier: 1.2, enemyDamageMultiplier: 1.1, startWithWound: true, eliteBuffed: true, reducedHealing: true, bossBuffed: true, reducedGold: true, fewerRewards: true, startWithCurse: true } }
];

export const getAscensionModifiers = (level) => {
  const ascension = ASCENSION_LEVELS.find(a => a.level === level) || ASCENSION_LEVELS[0];
  return ascension.modifiers;
};

export const getAscensionDescription = (level) => {
  const ascension = ASCENSION_LEVELS.find(a => a.level === level);
  return ascension ? ascension.description : 'Unknown';
};

export const getMaxAscension = () => ASCENSION_LEVELS.length - 1;

export const applyAscensionToEnemy = (enemy, modifiers) => {
  if (!modifiers || Object.keys(modifiers).length === 0) return enemy;

  const modified = { ...enemy };

  if (modifiers.enemyHpMultiplier) {
    modified.currentHp = Math.ceil(modified.currentHp * modifiers.enemyHpMultiplier);
    modified.maxHp = Math.ceil(modified.maxHp * modifiers.enemyHpMultiplier);
  }

  if (modifiers.eliteBuffed && (enemy.type === 'elite')) {
    modified.strength = (modified.strength || 0) + 1;
  }

  if (modifiers.bossBuffed && (enemy.type === 'boss')) {
    modified.strength = (modified.strength || 0) + 1;
    modified.currentHp = Math.ceil(modified.currentHp * 1.05);
    modified.maxHp = Math.ceil(modified.maxHp * 1.05);
  }

  return modified;
};

export const getAscensionStartGold = (ascensionLevel) => {
  const modifiers = getAscensionModifiers(ascensionLevel);
  return modifiers.reducedGold ? 75 : 99;
};

export const getAscensionHealPercent = (ascensionLevel) => {
  const modifiers = getAscensionModifiers(ascensionLevel);
  return modifiers.reducedHealing ? 0.25 : 0.30;
};

export const getAscensionCardRewardCount = (ascensionLevel) => {
  const modifiers = getAscensionModifiers(ascensionLevel);
  return modifiers.fewerRewards ? 2 : 3;
};
