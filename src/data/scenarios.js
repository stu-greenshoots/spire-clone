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
    hand: ['strike', 'pommelStrike', 'defend', 'shrugItOff', 'bash'],
    deck: [
      'strike', 'strike', 'strike',
      'defend', 'defend', 'defend',
      'bash', 'pommelStrike', 'shrugItOff',
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
      'bash', 'armaments', 'shrugItOff'
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
      'bash', 'cleave', 'ironWave'
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
      'bash', 'pommelStrike', 'shrugItOff'
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
      'bash', 'pommelStrike', 'shrugItOff', 'inflame'
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
    hand: ['thunderclap', 'searingBlow', 'infernalBlade', 'bloodForBlood', 'bodySlam'],
    deck: ['thunderclap', 'searingBlow', 'infernalBlade'],
    relics: ['burning_blood'],
    potions: [null, null, null]
  },

  // ============================================
  // THE SILENT SCENARIOS
  // ============================================

  'silent-combat-basic': {
    name: 'Silent: Basic Combat',
    description: 'Silent starter deck vs Cultist',
    phase: 'COMBAT',
    floor: 1,
    act: 1,
    player: {
      currentHp: 70,
      maxHp: 70,
      gold: 99,
      energy: 3,
      maxEnergy: 3
    },
    enemies: ['cultist'],
    hand: ['strike_silent', 'strike_silent', 'defend_silent', 'neutralize', 'survivor'],
    deck: ['strike_silent', 'strike_silent', 'strike_silent', 'defend_silent', 'defend_silent', 'defend_silent', 'defend_silent', 'neutralize', 'survivor'],
    relics: ['ring_of_snake'],
    potions: [null, null, null]
  },

  'silent-poison-build': {
    name: 'Silent: Poison Build',
    description: 'Mid-game poison synergy deck',
    phase: 'COMBAT',
    floor: 10,
    act: 2,
    player: {
      currentHp: 50,
      maxHp: 70,
      gold: 200,
      energy: 3,
      maxEnergy: 3
    },
    enemies: [{ id: 'chosen', currentHp: 95, maxHp: 95 }],
    hand: ['deadlyPoison', 'noxiousFumes', 'corpseExplosion', 'defend_silent', 'footwork'],
    deck: [
      'strike_silent', 'strike_silent', 'defend_silent', 'defend_silent',
      'neutralize', 'survivor', 'deadlyPoison', 'noxiousFumes',
      'corpseExplosion', 'footwork', 'dash', 'bladeDance'
    ],
    relics: ['ring_of_snake', 'snecko_skull'],
    potions: ['poison_potion', null, null]
  },

  'silent-shiv-build': {
    name: 'Silent: Shiv Build',
    description: 'Shiv synergy deck with multiple targets',
    phase: 'COMBAT',
    floor: 8,
    act: 2,
    player: {
      currentHp: 55,
      maxHp: 70,
      gold: 150,
      energy: 3,
      maxEnergy: 3
    },
    enemies: [
      { id: 'byrd', currentHp: 25, maxHp: 25 },
      { id: 'byrd', currentHp: 25, maxHp: 25 },
      { id: 'byrd', currentHp: 25, maxHp: 25 }
    ],
    hand: ['bladeDance', 'cloakAndDagger', 'finisher', 'defend_silent', 'neutralize'],
    deck: [
      'strike_silent', 'strike_silent', 'defend_silent', 'defend_silent',
      'neutralize', 'bladeDance', 'cloakAndDagger', 'finisher',
      'aThousandCuts', 'finisher'
    ],
    relics: ['ring_of_snake', 'kunai'],
    potions: [null, null, null]
  },

  // ============================================
  // THE DEFECT SCENARIOS
  // ============================================

  'defect-combat-basic': {
    name: 'Defect: Basic Combat',
    description: 'Defect starter deck vs Jaw Worm',
    phase: 'COMBAT',
    floor: 1,
    act: 1,
    player: {
      currentHp: 75,
      maxHp: 75,
      gold: 99,
      energy: 3,
      maxEnergy: 3
    },
    enemies: ['jawWorm'],
    hand: ['strike_defect', 'strike_defect', 'defend_defect', 'zap', 'dualcast'],
    deck: ['strike_defect', 'strike_defect', 'defend_defect', 'defend_defect', 'defend_defect', 'zap', 'dualcast'],
    relics: ['cracked_core'],
    potions: [null, null, null]
  },

  'defect-orb-lightning': {
    name: 'Defect: Lightning Orbs',
    description: 'Lightning orb focus build',
    phase: 'COMBAT',
    floor: 12,
    act: 2,
    player: {
      currentHp: 60,
      maxHp: 75,
      gold: 180,
      energy: 3,
      maxEnergy: 3,
      focus: 2
    },
    enemies: [{ id: 'automaton', currentHp: 300, maxHp: 300 }],
    hand: ['ballLightning', 'electrodynamics', 'defragment', 'defend_defect', 'zap'],
    deck: [
      'strike_defect', 'strike_defect', 'defend_defect', 'defend_defect',
      'zap', 'dualcast', 'ballLightning', 'electrodynamics',
      'defragment', 'compileDrive', 'sweepingBeam'
    ],
    relics: ['cracked_core', 'data_disk'],
    potions: ['focus_potion', null, null],
    orbs: [
      { type: 'lightning', passive: 3, evoke: 8 },
      { type: 'lightning', passive: 3, evoke: 8 },
      null
    ]
  },

  'defect-orb-frost': {
    name: 'Defect: Frost Orbs',
    description: 'Frost orb defensive build',
    phase: 'COMBAT',
    floor: 10,
    act: 2,
    player: {
      currentHp: 45,
      maxHp: 75,
      gold: 160,
      energy: 3,
      maxEnergy: 3,
      focus: 3
    },
    enemies: [
      { id: 'shelledParasite', currentHp: 68, maxHp: 68 },
      { id: 'shelledParasite', currentHp: 68, maxHp: 68 }
    ],
    hand: ['coolheaded', 'glacier', 'coldSnap', 'defend_defect', 'coolheaded'],
    deck: [
      'strike_defect', 'defend_defect', 'defend_defect',
      'zap', 'coolheaded', 'glacier', 'coldSnap', 'coolheaded',
      'defragment', 'consume'
    ],
    relics: ['cracked_core', 'frozen_core'],
    potions: [null, null, null],
    orbs: [
      { type: 'frost', passive: 2, evoke: 5 },
      { type: 'frost', passive: 2, evoke: 5 },
      { type: 'frost', passive: 2, evoke: 5 }
    ]
  },

  // ============================================
  // THE WATCHER SCENARIOS
  // ============================================

  'watcher-combat-basic': {
    name: 'Watcher: Basic Combat',
    description: 'Watcher starter deck vs Louse',
    phase: 'COMBAT',
    floor: 1,
    act: 1,
    player: {
      currentHp: 72,
      maxHp: 72,
      gold: 99,
      energy: 3,
      maxEnergy: 3
    },
    enemies: ['louse_red'],
    hand: ['strike_watcher', 'strike_watcher', 'defend_watcher', 'eruption', 'vigilance'],
    deck: ['strike_watcher', 'strike_watcher', 'defend_watcher', 'defend_watcher', 'defend_watcher', 'eruption', 'vigilance'],
    relics: ['pure_water'],
    potions: [null, null, null]
  },

  'watcher-wrath-stance': {
    name: 'Watcher: Wrath Stance',
    description: 'In Wrath stance - 2x damage dealt/taken',
    phase: 'COMBAT',
    floor: 8,
    act: 1,
    player: {
      currentHp: 60,
      maxHp: 72,
      gold: 150,
      energy: 3,
      maxEnergy: 3,
      stance: 'wrath'
    },
    enemies: [{ id: 'gremlinNob', currentHp: 82, maxHp: 82 }],
    hand: ['strike_watcher', 'tantrum', 'flurryOfBlows', 'defend_watcher', 'vigilance'],
    deck: [
      'strike_watcher', 'strike_watcher', 'defend_watcher', 'defend_watcher',
      'eruption', 'vigilance', 'tantrum', 'flurryOfBlows', 'crescendo'
    ],
    relics: ['pure_water'],
    potions: [null, null, null]
  },

  'watcher-calm-stance': {
    name: 'Watcher: Calm Stance',
    description: 'In Calm stance - gain 2 energy on exit',
    phase: 'COMBAT',
    floor: 10,
    act: 2,
    player: {
      currentHp: 55,
      maxHp: 72,
      gold: 200,
      energy: 3,
      maxEnergy: 3,
      stance: 'calm'
    },
    enemies: [{ id: 'snecko', currentHp: 114, maxHp: 114 }],
    hand: ['eruption', 'fearNoEvil', 'tranquility', 'defend_watcher', 'bowlingBash'],
    deck: [
      'strike_watcher', 'strike_watcher', 'defend_watcher', 'defend_watcher',
      'eruption', 'vigilance', 'fearNoEvil', 'tranquility',
      'emptyMind', 'bowlingBash', 'sashWhip'
    ],
    relics: ['pure_water', 'teardrop_locket'],
    potions: [null, null, null]
  },

  'watcher-divinity': {
    name: 'Watcher: Divinity Stance',
    description: 'In Divinity - 3x damage, 3 energy',
    phase: 'COMBAT',
    floor: 15,
    act: 2,
    player: {
      currentHp: 50,
      maxHp: 72,
      gold: 250,
      energy: 6,
      maxEnergy: 3,
      stance: 'divinity',
      mantra: 0
    },
    enemies: [{ id: 'awakened_one', currentHp: 300, maxHp: 300 }],
    hand: ['strike_watcher', 'strike_watcher', 'ragnarok', 'brilliance', 'protectingLight'],
    deck: [
      'strike_watcher', 'defend_watcher',
      'eruption', 'vigilance', 'ragnarok', 'brilliance',
      'worship', 'prostrate', 'protectingLight'
    ],
    relics: ['pure_water', 'damaru'],
    potions: [null, null, null]
  },

  // ============================================
  // ACT 2 COMBAT SCENARIOS
  // ============================================

  'combat-act2-basic': {
    name: 'Act 2: Basic Combat',
    description: 'Act 2 normal encounter',
    phase: 'COMBAT',
    floor: 18,
    act: 2,
    player: {
      currentHp: 60,
      maxHp: 80,
      gold: 180,
      energy: 3,
      maxEnergy: 3
    },
    enemies: [
      { id: 'snakePlant', currentHp: 75, maxHp: 75 },
      { id: 'snakePlant', currentHp: 75, maxHp: 75 }
    ],
    hand: ['strike', 'strike', 'pommelStrike', 'defend', 'shrugItOff'],
    deck: [
      'strike', 'strike', 'strike', 'defend', 'defend', 'defend',
      'bash', 'pommelStrike', 'shrugItOff', 'inflame', 'uppercut'
    ],
    relics: ['burning_blood', 'anchor'],
    potions: ['fire_potion', null, null]
  },

  'combat-act2-elite-ally': {
    name: 'Act 2: Centurion & Mystic',
    description: 'Ally pair elite encounter',
    phase: 'COMBAT',
    floor: 22,
    act: 2,
    player: {
      currentHp: 55,
      maxHp: 80,
      gold: 200,
      energy: 3,
      maxEnergy: 3
    },
    enemies: [
      { id: 'centurion', currentHp: 76, maxHp: 76 },
      { id: 'mystic', currentHp: 50, maxHp: 50 }
    ],
    hand: ['strike', 'cleave', 'whirlwind', 'defend', 'bash'],
    deck: [
      'strike', 'strike', 'defend', 'defend', 'defend',
      'bash', 'cleave', 'whirlwind', 'inflame', 'heavyBlade'
    ],
    relics: ['burning_blood', 'meat_on_the_bone'],
    potions: [null, null, null]
  },

  'combat-boss-automaton': {
    name: 'Boss: Automaton',
    description: 'Act 2 boss with orbs',
    phase: 'COMBAT',
    floor: 33,
    act: 2,
    player: {
      currentHp: 45,
      maxHp: 80,
      gold: 280,
      energy: 4,
      maxEnergy: 4,
      strength: 3
    },
    enemies: [{ id: 'automaton', currentHp: 300, maxHp: 300, artifact: 3 }],
    hand: ['strike', 'heavyBlade', 'limitBreak', 'defend', 'impervious'],
    deck: [
      'strike', 'strike', 'defend', 'defend', 'defend',
      'bash', 'heavyBlade', 'limitBreak', 'impervious',
      'demonForm', 'inflame', 'spotWeakness'
    ],
    relics: ['burning_blood', 'vajra', 'paper_phrog'],
    potions: ['strength_potion', 'block_potion', null]
  },

  // ============================================
  // ACT 3 COMBAT SCENARIOS
  // ============================================

  'combat-act3-basic': {
    name: 'Act 3: Basic Combat',
    description: 'Act 3 normal encounter',
    phase: 'COMBAT',
    floor: 38,
    act: 3,
    player: {
      currentHp: 50,
      maxHp: 90,
      gold: 350,
      energy: 4,
      maxEnergy: 4,
      strength: 4
    },
    enemies: [
      { id: 'writhing_mass', currentHp: 160, maxHp: 160 }
    ],
    hand: ['strike', 'heavyBlade', 'offering', 'defend', 'demonForm'],
    deck: [
      'strike', 'strike', 'defend', 'defend',
      'bash', 'heavyBlade', 'offering', 'demonForm',
      'limitBreak', 'impervious', 'feed'
    ],
    relics: ['burning_blood', 'vajra', 'paper_phrog', 'girya'],
    potions: ['strength_potion', 'blood_potion', null]
  },

  'combat-boss-awakened': {
    name: 'Boss: Awakened One',
    description: 'Act 3 boss with power reaction',
    phase: 'COMBAT',
    floor: 50,
    act: 3,
    player: {
      currentHp: 55,
      maxHp: 95,
      gold: 400,
      energy: 4,
      maxEnergy: 4,
      strength: 5
    },
    enemies: [{ id: 'awakened_one', currentHp: 300, maxHp: 300 }],
    hand: ['strike', 'heavyBlade', 'whirlwind', 'defend', 'impervious'],
    deck: [
      'strike', 'defend', 'defend',
      'heavyBlade', 'whirlwind', 'impervious',
      'limitBreak', 'offering', 'feed', 'reaper'
    ],
    relics: ['burning_blood', 'vajra', 'paper_phrog', 'mark_of_pain'],
    potions: ['strength_potion', null, null]
  },

  // ============================================
  // HEART BOSS SCENARIO
  // ============================================

  'combat-boss-heart': {
    name: 'Boss: The Heart',
    description: 'Final boss with invincible shield',
    phase: 'COMBAT',
    floor: 52,
    act: 4,
    player: {
      currentHp: 40,
      maxHp: 100,
      gold: 500,
      energy: 5,
      maxEnergy: 5,
      strength: 8
    },
    enemies: [{ id: 'corruptHeart', currentHp: 750, maxHp: 750 }],
    hand: ['strike', 'heavyBlade', 'offering', 'impervious', 'limitBreak'],
    deck: [
      'strike', 'defend',
      'heavyBlade', 'impervious', 'offering', 'limitBreak',
      'reaper', 'demonForm', 'feed', 'corruption'
    ],
    relics: ['burning_blood', 'vajra', 'paper_phrog', 'mark_of_pain', 'girya'],
    potions: ['blood_potion', 'strength_potion', 'fire_potion']
  },

  // ============================================
  // EVENT SCENARIOS
  // ============================================

  'event-basic': {
    name: 'Event: Random Event',
    description: 'Generic event encounter',
    phase: 'EVENT',
    floor: 4,
    act: 1,
    player: {
      currentHp: 75,
      maxHp: 80,
      gold: 120
    },
    enemies: [],
    hand: [],
    deck: ['strike', 'strike', 'strike', 'strike', 'strike', 'defend', 'defend', 'defend', 'defend', 'bash'],
    relics: ['burning_blood'],
    potions: [null, null, null]
  },

  // ============================================
  // ADDITIONAL EDGE CASES
  // ============================================

  'zero-energy': {
    name: 'Zero Energy',
    description: 'No energy available - test unplayable cards',
    phase: 'COMBAT',
    floor: 5,
    act: 1,
    player: {
      currentHp: 60,
      maxHp: 80,
      gold: 100,
      energy: 0,
      maxEnergy: 3
    },
    enemies: [{ id: 'louse_green', currentHp: 12, maxHp: 12 }],
    hand: ['strike', 'strike', 'defend', 'defend', 'bash'],
    deck: ['strike', 'strike', 'defend', 'defend', 'bash'],
    relics: ['burning_blood'],
    potions: [null, null, null]
  },

  'no-playable-cards': {
    name: 'No Playable Cards',
    description: 'All cards too expensive to play',
    phase: 'COMBAT',
    floor: 8,
    act: 1,
    player: {
      currentHp: 50,
      maxHp: 80,
      gold: 150,
      energy: 1,
      maxEnergy: 3
    },
    enemies: ['jawWorm'],
    hand: ['bash', 'bludgeon', 'impervious', 'immolate', 'demonForm'],
    deck: ['bash', 'bludgeon', 'impervious'],
    relics: ['burning_blood'],
    potions: [null, null, null]
  },

  'combat-victory': {
    name: 'Combat Victory',
    description: 'All enemies dead - victory state',
    phase: 'COMBAT',
    floor: 5,
    act: 1,
    player: {
      currentHp: 65,
      maxHp: 80,
      gold: 120,
      energy: 2,
      maxEnergy: 3
    },
    enemies: [
      { id: 'jawWorm', currentHp: 0, maxHp: 44 }
    ],
    hand: ['strike', 'strike', 'defend'],
    deck: ['strike', 'strike', 'defend', 'defend', 'bash'],
    relics: ['burning_blood'],
    potions: [null, null, null]
  },

  'status-heavy-player': {
    name: 'Status Heavy (Player)',
    description: 'Player with many negative statuses',
    phase: 'COMBAT',
    floor: 12,
    act: 2,
    player: {
      currentHp: 30,
      maxHp: 80,
      gold: 200,
      energy: 3,
      maxEnergy: 3,
      vulnerable: 3,
      weak: 2,
      frail: 2
    },
    enemies: [{ id: 'chosen', currentHp: 95, maxHp: 95, strength: 2 }],
    hand: ['strike', 'defend', 'defend', 'shrugItOff', 'trueGrit'],
    deck: ['strike', 'strike', 'defend', 'defend', 'shrugItOff', 'trueGrit'],
    relics: ['burning_blood', 'torii'],
    potions: ['blood_potion', null, null]
  },

  'status-heavy-enemy': {
    name: 'Status Heavy (Enemy)',
    description: 'Enemy with many negative statuses',
    phase: 'COMBAT',
    floor: 10,
    act: 1,
    player: {
      currentHp: 70,
      maxHp: 80,
      gold: 180,
      energy: 3,
      maxEnergy: 3,
      strength: 4
    },
    enemies: [
      { id: 'lagavulin', currentHp: 109, maxHp: 109, vulnerable: 4, weak: 3 }
    ],
    hand: ['strike', 'heavyBlade', 'uppercut', 'defend', 'bash'],
    deck: ['strike', 'strike', 'defend', 'heavyBlade', 'uppercut', 'bash'],
    relics: ['burning_blood', 'vajra', 'bag_of_marbles'],
    potions: ['weak_potion', null, null]
  },

  'five-enemies': {
    name: '5 Enemy Encounter',
    description: 'Maximum enemy count scenario',
    phase: 'COMBAT',
    floor: 7,
    act: 1,
    player: {
      currentHp: 60,
      maxHp: 80,
      gold: 140,
      energy: 3,
      maxEnergy: 3
    },
    enemies: [
      { id: 'slime_small', currentHp: 12, maxHp: 12 },
      { id: 'slime_small', currentHp: 12, maxHp: 12 },
      { id: 'slime_small', currentHp: 12, maxHp: 12 },
      { id: 'slime_small', currentHp: 12, maxHp: 12 },
      { id: 'slime_small', currentHp: 12, maxHp: 12 }
    ],
    hand: ['cleave', 'cleave', 'whirlwind', 'defend', 'bash'],
    deck: ['cleave', 'cleave', 'whirlwind', 'defend', 'defend', 'bash'],
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
    ironclad: [],
    silent: [],
    defect: [],
    watcher: [],
    bosses: [],
    shop: [],
    map: [],
    reward: [],
    rest: [],
    event: [],
    edge: []
  };

  for (const [key, scenario] of Object.entries(SCENARIOS)) {
    // Character-specific scenarios
    if (key.startsWith('silent-')) {
      categories.silent.push({ key, ...scenario });
    } else if (key.startsWith('defect-')) {
      categories.defect.push({ key, ...scenario });
    } else if (key.startsWith('watcher-')) {
      categories.watcher.push({ key, ...scenario });
    // Boss encounters
    } else if (key.includes('-boss-')) {
      categories.bosses.push({ key, ...scenario });
    // Non-combat phases
    } else if (key.startsWith('shop-')) {
      categories.shop.push({ key, ...scenario });
    } else if (key.startsWith('map-')) {
      categories.map.push({ key, ...scenario });
    } else if (key.startsWith('reward-')) {
      categories.reward.push({ key, ...scenario });
    } else if (key.startsWith('rest-')) {
      categories.rest.push({ key, ...scenario });
    } else if (key.startsWith('event-')) {
      categories.event.push({ key, ...scenario });
    // Combat scenarios (Ironclad default)
    } else if (key.startsWith('combat-')) {
      categories.ironclad.push({ key, ...scenario });
    // Edge cases and other
    } else {
      categories.edge.push({ key, ...scenario });
    }
  }

  return categories;
};
