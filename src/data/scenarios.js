/**
 * Test Scenarios for State Builder
 *
 * Each scenario defines a game state that can be loaded instantly.
 * Used for testing, debugging, and visual validation.
 *
 * Format:
 * - Cards can be strings (card IDs) or objects with { id, upgraded? }
 * - Enemies can be strings (enemy IDs) or objects with { id, currentHp?, vulnerable?, etc }
 * - Relics and potions can be strings (IDs) or objects
 */

export const SCENARIOS = {
  // ============================================
  // COMBAT SCENARIOS
  // ============================================

  'combat-basic': {
    name: 'Basic Combat',
    description: 'Floor 1 Jaw Worm with starter deck',
    phase: 'COMBAT',
    floor: 1,
    act: 1,
    player: {
      currentHp: 80,
      maxHp: 80,
      gold: 99,
      energy: 3,
      maxEnergy: 3
    },
    enemies: ['jawWorm'],
    hand: ['strike', 'strike', 'defend', 'defend', 'bash'],
    deck: ['strike', 'strike', 'strike', 'defend', 'defend', 'defend', 'defend', 'bash'],
    relics: ['burning_blood'],
    potions: [null, null, null]
  },

  'combat-boss-hexaghost': {
    name: 'Boss: Hexaghost',
    description: 'Act 1 boss with mid-game deck',
    phase: 'COMBAT',
    floor: 15,
    act: 1,
    player: {
      currentHp: 45,
      maxHp: 80,
      gold: 200,
      energy: 3,
      maxEnergy: 3,
      strength: 2
    },
    enemies: [{ id: 'hexaghost', currentHp: 250, maxHp: 250 }],
    hand: ['strike', 'pommel_strike', 'defend', 'shrug_it_off', 'bash'],
    deck: [
      'strike', 'strike', 'strike',
      'defend', 'defend', 'defend',
      'bash', 'pommel_strike', 'shrug_it_off',
      'inflame', 'uppercut', 'clothesline'
    ],
    relics: ['burning_blood', 'vajra', 'pen_nib'],
    potions: ['fire_potion', null, 'block_potion']
  },

  'combat-boss-guardian': {
    name: 'Boss: The Guardian',
    description: 'Act 1 boss - defensive boss',
    phase: 'COMBAT',
    floor: 15,
    act: 1,
    player: {
      currentHp: 55,
      maxHp: 80,
      gold: 180,
      energy: 3,
      maxEnergy: 3
    },
    enemies: [{ id: 'theGuardian', currentHp: 240, maxHp: 240 }],
    hand: ['strike', 'strike', 'defend', 'defend', 'bash'],
    deck: [
      'strike', 'strike', 'strike',
      'defend', 'defend', 'defend', 'defend',
      'bash', 'armaments', 'shrug_it_off'
    ],
    relics: ['burning_blood'],
    potions: ['strength_potion', null, null]
  },

  'combat-boss-slime': {
    name: 'Boss: Slime Boss',
    description: 'Act 1 boss - splits when damaged',
    phase: 'COMBAT',
    floor: 15,
    act: 1,
    player: {
      currentHp: 50,
      maxHp: 80,
      gold: 190,
      energy: 3,
      maxEnergy: 3
    },
    enemies: [{ id: 'slimeBoss', currentHp: 140, maxHp: 140 }],
    hand: ['strike', 'strike', 'cleave', 'defend', 'bash'],
    deck: [
      'strike', 'strike', 'strike',
      'defend', 'defend', 'defend',
      'bash', 'cleave', 'iron_wave'
    ],
    relics: ['burning_blood'],
    potions: [null, null, null]
  },

  'combat-multi-enemy': {
    name: 'Multi-Enemy Fight',
    description: '3 slimes - test targeting UI',
    phase: 'COMBAT',
    floor: 5,
    act: 1,
    player: {
      currentHp: 65,
      maxHp: 80,
      gold: 120,
      energy: 3,
      maxEnergy: 3
    },
    enemies: [
      { id: 'slime_medium', currentHp: 28, maxHp: 28 },
      { id: 'slime_medium', currentHp: 28, maxHp: 28 },
      { id: 'slime_small', currentHp: 12, maxHp: 12 }
    ],
    hand: ['strike', 'strike', 'cleave', 'defend', 'bash'],
    deck: ['strike', 'strike', 'defend', 'defend', 'bash', 'cleave'],
    relics: ['burning_blood'],
    potions: [null, null, null]
  },

  'combat-low-hp': {
    name: 'Low HP Danger',
    description: '5 HP vs dangerous enemy - test urgency display',
    phase: 'COMBAT',
    floor: 8,
    act: 1,
    player: {
      currentHp: 5,
      maxHp: 80,
      gold: 150,
      energy: 3,
      maxEnergy: 3
    },
    enemies: [{ id: 'gremlinNob', currentHp: 82, maxHp: 82, strength: 2 }],
    hand: ['strike', 'strike', 'defend', 'defend', 'bash'],
    deck: ['strike', 'strike', 'defend', 'defend', 'bash'],
    relics: ['burning_blood'],
    potions: ['blood_potion', null, null]
  },

  'combat-full-hand': {
    name: 'Full Hand (10 Cards)',
    description: 'Test hand overflow display',
    phase: 'COMBAT',
    floor: 10,
    act: 1,
    player: {
      currentHp: 60,
      maxHp: 80,
      gold: 180,
      energy: 4,
      maxEnergy: 4
    },
    enemies: ['jawWorm'],
    hand: [
      'strike', 'strike', 'strike', 'strike',
      'defend', 'defend', 'defend',
      'bash', 'pommel_strike', 'shrug_it_off'
    ],
    deck: ['strike', 'defend', 'bash'],
    relics: ['burning_blood'],
    potions: [null, null, null]
  },

  'combat-many-buffs': {
    name: 'Many Status Effects',
    description: 'Test status effect display',
    phase: 'COMBAT',
    floor: 10,
    act: 1,
    player: {
      currentHp: 50,
      maxHp: 80,
      gold: 150,
      energy: 3,
      maxEnergy: 3,
      strength: 5,
      dexterity: 3,
      vulnerable: 2,
      artifact: 2
    },
    enemies: [
      { id: 'sentry', currentHp: 38, maxHp: 38, vulnerable: 3, weak: 2 }
    ],
    hand: ['strike', 'strike', 'defend', 'bash', 'flex'],
    deck: ['strike', 'defend', 'bash', 'flex'],
    relics: ['burning_blood', 'vajra', 'oddly_smooth_stone'],
    potions: ['strength_potion', 'weak_potion', null]
  },

  'combat-elite': {
    name: 'Elite: Gremlin Nob',
    description: 'Elite enemy with enrage mechanic',
    phase: 'COMBAT',
    floor: 6,
    act: 1,
    player: {
      currentHp: 70,
      maxHp: 80,
      gold: 130,
      energy: 3,
      maxEnergy: 3
    },
    enemies: [{ id: 'gremlinNob', currentHp: 82, maxHp: 82 }],
    hand: ['strike', 'strike', 'strike', 'defend', 'bash'],
    deck: ['strike', 'strike', 'strike', 'defend', 'defend', 'bash'],
    relics: ['burning_blood'],
    potions: [null, null, null]
  },

  // ============================================
  // SHOP SCENARIOS
  // ============================================

  'shop-rich': {
    name: 'Shop (Rich)',
    description: '500 gold - can buy anything',
    phase: 'SHOP',
    floor: 7,
    act: 1,
    player: {
      currentHp: 65,
      maxHp: 80,
      gold: 500,
      energy: 3,
      maxEnergy: 3
    },
    enemies: [],
    hand: [],
    deck: ['strike', 'strike', 'strike', 'defend', 'defend', 'defend', 'bash'],
    relics: ['burning_blood'],
    potions: [null, null, null]
  },

  'shop-poor': {
    name: 'Shop (Poor)',
    description: '15 gold - test affordability UI',
    phase: 'SHOP',
    floor: 7,
    act: 1,
    player: {
      currentHp: 65,
      maxHp: 80,
      gold: 15,
      energy: 3,
      maxEnergy: 3
    },
    enemies: [],
    hand: [],
    deck: ['strike', 'strike', 'strike', 'defend', 'defend', 'defend', 'bash'],
    relics: ['burning_blood'],
    potions: [null, null, null]
  },

  // ============================================
  // MAP SCENARIOS
  // ============================================

  'map-start': {
    name: 'Map (Start)',
    description: 'Fresh run, floor 1',
    phase: 'MAP',
    floor: 0,
    act: 1,
    player: {
      currentHp: 80,
      maxHp: 80,
      gold: 99
    },
    enemies: [],
    hand: [],
    deck: ['strike', 'strike', 'strike', 'strike', 'strike', 'defend', 'defend', 'defend', 'defend', 'bash'],
    relics: ['burning_blood'],
    potions: [null, null, null]
  },

  'map-mid': {
    name: 'Map (Mid-Run)',
    description: 'Floor 8, mid-game',
    phase: 'MAP',
    floor: 8,
    act: 1,
    player: {
      currentHp: 55,
      maxHp: 80,
      gold: 180
    },
    enemies: [],
    hand: [],
    deck: [
      'strike', 'strike', 'strike',
      'defend', 'defend', 'defend',
      'bash', 'pommel_strike', 'shrug_it_off', 'inflame'
    ],
    relics: ['burning_blood', 'vajra'],
    potions: ['fire_potion', null, null]
  },

  // ============================================
  // REWARD SCENARIOS
  // ============================================

  'reward-cards': {
    name: 'Card Reward',
    description: '3 cards to choose from',
    phase: 'CARD_REWARD',
    floor: 3,
    act: 1,
    player: {
      currentHp: 72,
      maxHp: 80,
      gold: 130
    },
    enemies: [],
    hand: [],
    deck: ['strike', 'strike', 'strike', 'defend', 'defend', 'defend', 'bash'],
    relics: ['burning_blood'],
    potions: [null, null, null]
  },

  // ============================================
  // REST SITE SCENARIOS
  // ============================================

  'rest-site': {
    name: 'Rest Site',
    description: 'Rest or upgrade decision',
    phase: 'REST_SITE',
    floor: 6,
    act: 1,
    player: {
      currentHp: 45,
      maxHp: 80,
      gold: 150
    },
    enemies: [],
    hand: [],
    deck: ['strike', 'strike', 'strike', 'defend', 'defend', 'defend', 'bash'],
    relics: ['burning_blood'],
    potions: [null, null, null]
  },

  // ============================================
  // EDGE CASES
  // ============================================

  'max-relics': {
    name: 'Max Relics',
    description: 'Many relics - test display overflow',
    phase: 'COMBAT',
    floor: 12,
    act: 1,
    player: {
      currentHp: 60,
      maxHp: 100,
      gold: 300,
      energy: 4,
      maxEnergy: 4,
      strength: 3
    },
    enemies: ['jawWorm'],
    hand: ['strike', 'strike', 'defend', 'defend', 'bash'],
    deck: ['strike', 'strike', 'defend', 'defend', 'bash'],
    relics: [
      'burning_blood', 'vajra', 'pen_nib', 'bag_of_marbles',
      'lantern', 'anchor', 'horn_cleat', 'thread_and_needle',
      'blood_vial', 'oddly_smooth_stone', 'boot', 'orichalcum'
    ],
    potions: ['fire_potion', 'block_potion', 'strength_potion']
  },

  'long-card-names': {
    name: 'Long Card Names',
    description: 'Test text truncation handling',
    phase: 'COMBAT',
    floor: 5,
    act: 1,
    player: {
      currentHp: 70,
      maxHp: 80,
      gold: 150,
      energy: 3,
      maxEnergy: 3
    },
    enemies: ['jawWorm'],
    hand: ['thunderclap', 'searing_blow', 'infernal_blade', 'blood_for_blood', 'body_slam'],
    deck: ['thunderclap', 'searing_blow', 'infernal_blade'],
    relics: ['burning_blood'],
    potions: [null, null, null]
  }
};

/**
 * Get a scenario by name
 */
export const getScenario = (name) => SCENARIOS[name] || null;

/**
 * Get all scenario names
 */
export const getScenarioNames = () => Object.keys(SCENARIOS);

/**
 * Get scenarios grouped by category
 */
export const getScenariosByCategory = () => {
  const categories = {
    combat: [],
    shop: [],
    map: [],
    reward: [],
    rest: [],
    edge: []
  };

  for (const [key, scenario] of Object.entries(SCENARIOS)) {
    if (key.startsWith('combat-') || key.includes('-boss-') || key.includes('-elite')) {
      categories.combat.push({ key, ...scenario });
    } else if (key.startsWith('shop-')) {
      categories.shop.push({ key, ...scenario });
    } else if (key.startsWith('map-')) {
      categories.map.push({ key, ...scenario });
    } else if (key.startsWith('reward-')) {
      categories.reward.push({ key, ...scenario });
    } else if (key.startsWith('rest-')) {
      categories.rest.push({ key, ...scenario });
    } else {
      categories.edge.push({ key, ...scenario });
    }
  }

  return categories;
};
