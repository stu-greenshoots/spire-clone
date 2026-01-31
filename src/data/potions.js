// Potion Rarities
export const POTION_RARITY = {
  COMMON: 'common',
  UNCOMMON: 'uncommon',
  RARE: 'rare'
};

// Potion usage types
// 'combat' = can only be used during combat
// 'anytime' = can be used during combat or on the map
// 'instant' = applied immediately when obtained (not stored)
export const POTION_TYPE = {
  COMBAT: 'combat',
  ANYTIME: 'anytime',
  INSTANT: 'instant'
};

// Potion target types
export const POTION_TARGET = {
  ENEMY: 'enemy',
  SELF: 'self',
  ALL_ENEMIES: 'all_enemies',
  NONE: 'none'
};

// All potions
export const ALL_POTIONS = [
  // ========== COMMON POTIONS ==========
  {
    id: 'fire_potion',
    name: 'Fire Potion',
    description: 'Deal 20 damage to target enemy.',
    rarity: POTION_RARITY.COMMON,
    type: POTION_TYPE.COMBAT,
    targetType: POTION_TARGET.ENEMY,
    effect: { type: 'damage', amount: 20 }
  },
  {
    id: 'block_potion',
    name: 'Block Potion',
    description: 'Gain 12 Block.',
    rarity: POTION_RARITY.COMMON,
    type: POTION_TYPE.COMBAT,
    targetType: POTION_TARGET.SELF,
    effect: { type: 'block', amount: 12 }
  },
  {
    id: 'energy_potion',
    name: 'Energy Potion',
    description: 'Gain 2 Energy this turn.',
    rarity: POTION_RARITY.COMMON,
    type: POTION_TYPE.COMBAT,
    targetType: POTION_TARGET.SELF,
    effect: { type: 'energy', amount: 2 }
  },
  {
    id: 'explosive_potion',
    name: 'Explosive Potion',
    description: 'Deal 10 damage to ALL enemies.',
    rarity: POTION_RARITY.COMMON,
    type: POTION_TYPE.COMBAT,
    targetType: POTION_TARGET.ALL_ENEMIES,
    effect: { type: 'damageAll', amount: 10 }
  },
  {
    id: 'weak_potion',
    name: 'Weak Potion',
    description: 'Apply 3 Weak to ALL enemies.',
    rarity: POTION_RARITY.COMMON,
    type: POTION_TYPE.COMBAT,
    targetType: POTION_TARGET.ALL_ENEMIES,
    effect: { type: 'debuff', debuff: 'weak', amount: 3 }
  },

  // ========== UNCOMMON POTIONS ==========
  {
    id: 'health_potion',
    name: 'Health Potion',
    description: 'Heal 20 HP. Can only be used outside of combat.',
    rarity: POTION_RARITY.UNCOMMON,
    type: POTION_TYPE.ANYTIME,
    targetType: POTION_TARGET.SELF,
    effect: { type: 'heal', amount: 20 }
  },
  {
    id: 'strength_potion',
    name: 'Strength Potion',
    description: 'Gain 2 Strength for the rest of combat.',
    rarity: POTION_RARITY.UNCOMMON,
    type: POTION_TYPE.COMBAT,
    targetType: POTION_TARGET.SELF,
    effect: { type: 'buff', buff: 'strength', amount: 2 }
  },
  {
    id: 'dexterity_potion',
    name: 'Dexterity Potion',
    description: 'Gain 2 Dexterity for the rest of combat.',
    rarity: POTION_RARITY.UNCOMMON,
    type: POTION_TYPE.COMBAT,
    targetType: POTION_TARGET.SELF,
    effect: { type: 'buff', buff: 'dexterity', amount: 2 }
  },
  {
    id: 'speed_potion',
    name: 'Speed Potion',
    description: 'Draw 3 cards.',
    rarity: POTION_RARITY.UNCOMMON,
    type: POTION_TYPE.COMBAT,
    targetType: POTION_TARGET.SELF,
    effect: { type: 'draw', amount: 3 }
  },
  {
    id: 'fear_potion',
    name: 'Fear Potion',
    description: 'Apply 3 Vulnerable to ALL enemies.',
    rarity: POTION_RARITY.UNCOMMON,
    type: POTION_TYPE.COMBAT,
    targetType: POTION_TARGET.ALL_ENEMIES,
    effect: { type: 'debuff', debuff: 'vulnerable', amount: 3 }
  },

  // ========== RARE POTIONS ==========
  {
    id: 'fairy_potion',
    name: 'Fairy in a Bottle',
    description: 'When you die, heal to 30% HP instead. Automatically used.',
    rarity: POTION_RARITY.RARE,
    type: POTION_TYPE.INSTANT,
    targetType: POTION_TARGET.SELF,
    effect: { type: 'revive', amount: 0.3 }
  },
  {
    id: 'cultist_potion',
    name: 'Cultist Potion',
    description: 'Gain 5 Strength for the rest of combat.',
    rarity: POTION_RARITY.RARE,
    type: POTION_TYPE.COMBAT,
    targetType: POTION_TARGET.SELF,
    effect: { type: 'buff', buff: 'strength', amount: 5 }
  },
  {
    id: 'duplication_potion',
    name: 'Duplication Potion',
    description: 'This turn, your next card is played twice.',
    rarity: POTION_RARITY.RARE,
    type: POTION_TYPE.COMBAT,
    targetType: POTION_TARGET.SELF,
    effect: { type: 'doubleTap', amount: 1 }
  },
  {
    id: 'essence_of_steel',
    name: 'Essence of Steel',
    description: 'Gain 4 Plated Armor.',
    rarity: POTION_RARITY.RARE,
    type: POTION_TYPE.COMBAT,
    targetType: POTION_TARGET.SELF,
    effect: { type: 'buff', buff: 'platedArmor', amount: 4 }
  },
  {
    id: 'heart_of_iron',
    name: 'Heart of Iron',
    description: 'Gain 6 Metallicize for the rest of combat.',
    rarity: POTION_RARITY.RARE,
    type: POTION_TYPE.COMBAT,
    targetType: POTION_TARGET.SELF,
    effect: { type: 'buff', buff: 'metallicize', amount: 6 }
  }
];

/**
 * Get a potion definition by its ID
 * @param {string} id - The potion ID
 * @returns {Object|undefined} The potion definition
 */
export const getPotionById = (id) => ALL_POTIONS.find(p => p.id === id);

/**
 * Get all potions of a specific rarity
 * @param {string} rarity - The rarity to filter by
 * @returns {Array} Array of potions matching the rarity
 */
export const getPotionsByRarity = (rarity) => ALL_POTIONS.filter(p => p.rarity === rarity);

/**
 * Get a random potion, optionally filtered by rarity, excluding specific IDs
 * @param {string|null} rarity - Optional rarity filter
 * @param {string[]} excludeIds - IDs to exclude
 * @returns {Object|undefined} A random potion
 */
export const getRandomPotion = (rarity = null, excludeIds = []) => {
  let potions = ALL_POTIONS.filter(p => !excludeIds.includes(p.id));
  if (rarity) potions = potions.filter(p => p.rarity === rarity);
  return potions[Math.floor(Math.random() * potions.length)];
};
