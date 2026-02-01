// Relic Rarities
export const RELIC_RARITY = {
  STARTER: 'starter',
  COMMON: 'common',
  UNCOMMON: 'uncommon',
  RARE: 'rare',
  BOSS: 'boss',
  EVENT: 'event',
  SHOP: 'shop'
};

// 40+ unique relics
export const ALL_RELICS = [
  // ========== STARTER ==========
  {
    id: 'burning_blood',
    name: 'Burning Blood',
    rarity: RELIC_RARITY.STARTER,
    description: 'At the end of combat, heal 6 HP.',
    emoji: '🩸',
    trigger: 'onCombatEnd',
    effect: { type: 'heal', amount: 6 }
  },

  {
    id: 'ring_of_snake',
    name: 'Ring of the Snake',
    rarity: RELIC_RARITY.STARTER,
    description: 'At the start of each combat, draw 2 additional cards.',
    emoji: '🐍',
    trigger: 'onCombatStart',
    effect: { type: 'draw', amount: 2 },
    character: 'silent'
  },

  {
    id: 'cracked_core',
    name: 'Cracked Core',
    rarity: RELIC_RARITY.STARTER,
    description: 'At the start of each combat, Channel 1 Lightning orb.',
    emoji: '⚡',
    trigger: 'onCombatStart',
    effect: { type: 'channelOrb', orbType: 'lightning' },
    character: 'defect'
  },

  {
    id: 'pure_water',
    name: 'Pure Water',
    rarity: RELIC_RARITY.STARTER,
    description: 'At the start of each combat, add a Miracle card to your hand.',
    emoji: '💧',
    trigger: 'onCombatStart',
    effect: { type: 'addCardToHand', cardId: 'miracle' },
    character: 'watcher'
  },

  // ========== COMMON ==========
  {
    id: 'anchor',
    name: 'Anchor',
    rarity: RELIC_RARITY.COMMON,
    description: 'Start each combat with 10 Block.',
    emoji: '⚓',
    trigger: 'onCombatStart',
    effect: { type: 'block', amount: 10 }
  },
  {
    id: 'bag_of_preparation',
    name: 'Bag of Preparation',
    rarity: RELIC_RARITY.COMMON,
    description: 'At the start of each combat, draw 2 additional cards.',
    emoji: '👜',
    trigger: 'onCombatStart',
    effect: { type: 'draw', amount: 2 }
  },
  {
    id: 'blood_vial',
    name: 'Blood Vial',
    rarity: RELIC_RARITY.COMMON,
    description: 'At the start of each combat, heal 2 HP.',
    emoji: '🧪',
    trigger: 'onCombatStart',
    effect: { type: 'heal', amount: 2 }
  },
  {
    id: 'bronze_scales',
    name: 'Bronze Scales',
    rarity: RELIC_RARITY.COMMON,
    description: 'Whenever you take damage, deal 3 damage back.',
    emoji: '🐉',
    trigger: 'onDamageTaken',
    effect: { type: 'thorns', amount: 3 }
  },
  {
    id: 'centennial_puzzle',
    name: 'Centennial Puzzle',
    rarity: RELIC_RARITY.COMMON,
    description: 'The first time you lose HP each combat, draw 3 cards.',
    emoji: '🧩',
    trigger: 'onFirstHpLoss',
    effect: { type: 'draw', amount: 3 },
    usedThisCombat: false
  },
  {
    id: 'lantern',
    name: 'Lantern',
    rarity: RELIC_RARITY.COMMON,
    description: 'Gain 1 Energy on the first turn of each combat.',
    emoji: '🏮',
    trigger: 'onFirstTurn',
    effect: { type: 'energy', amount: 1 }
  },
  {
    id: 'nunchaku',
    name: 'Nunchaku',
    rarity: RELIC_RARITY.COMMON,
    description: 'Every time you play 10 Attacks, gain 1 Energy.',
    emoji: '🥢',
    trigger: 'onAttackPlayed',
    counter: 0,
    threshold: 10,
    effect: { type: 'energy', amount: 1 }
  },
  {
    id: 'oddly_smooth_stone',
    name: 'Oddly Smooth Stone',
    rarity: RELIC_RARITY.COMMON,
    description: 'Start each combat with 1 Dexterity.',
    emoji: '🪨',
    trigger: 'onCombatStart',
    effect: { type: 'dexterity', amount: 1 }
  },
  {
    id: 'orichalcum',
    name: 'Orichalcum',
    rarity: RELIC_RARITY.COMMON,
    description: 'If you end your turn with no Block, gain 6 Block.',
    emoji: '🔶',
    trigger: 'onTurnEnd',
    effect: { type: 'blockIfNone', amount: 6 }
  },
  {
    id: 'pen_nib',
    name: 'Pen Nib',
    rarity: RELIC_RARITY.COMMON,
    description: 'Every 10th Attack deals double damage.',
    emoji: '🖊️',
    trigger: 'onAttackPlayed',
    counter: 0,
    threshold: 10,
    effect: { type: 'doubleDamage', amount: 1 }
  },
  {
    id: 'vajra',
    name: 'Vajra',
    rarity: RELIC_RARITY.COMMON,
    description: 'Start each combat with 1 Strength.',
    emoji: '⚡',
    trigger: 'onCombatStart',
    effect: { type: 'strength', amount: 1 }
  },
  {
    id: 'red_skull',
    name: 'Red Skull',
    rarity: RELIC_RARITY.COMMON,
    description: 'While HP is at or below 50%, gain 3 Strength.',
    emoji: '💀',
    trigger: 'passive',
    effect: { type: 'strengthIfLowHp', amount: 3, threshold: 0.5 }
  },
  {
    id: 'bag_of_marbles',
    name: 'Bag of Marbles',
    rarity: RELIC_RARITY.COMMON,
    description: 'At start of combat, apply 1 Vulnerable to ALL enemies.',
    emoji: '🔮',
    trigger: 'onCombatStart',
    effect: { type: 'vulnerable', amount: 1, targetAll: true }
  },

  // ========== UNCOMMON ==========
  {
    id: 'blue_candle',
    name: 'Blue Candle',
    rarity: RELIC_RARITY.UNCOMMON,
    description: 'Curse cards can be played. Playing a Curse will Exhaust it and lose 1 HP.',
    emoji: '🕯️',
    trigger: 'passive',
    effect: { type: 'playCurses' }
  },
  {
    id: 'bottled_flame',
    name: 'Bottled Flame',
    rarity: RELIC_RARITY.UNCOMMON,
    description: 'At the start of combat, a selected Attack is in your hand.',
    emoji: '🔥',
    trigger: 'onCombatStart',
    effect: { type: 'drawSpecific', cardType: 'attack' }
  },
  {
    id: 'eternal_feather',
    name: 'Eternal Feather',
    rarity: RELIC_RARITY.UNCOMMON,
    description: 'For every 5 cards in your deck, heal 3 HP at rest sites.',
    emoji: '🪶',
    trigger: 'onRest',
    effect: { type: 'healPerCards', amount: 3, per: 5 }
  },
  {
    id: 'horn_cleat',
    name: 'Horn Cleat',
    rarity: RELIC_RARITY.UNCOMMON,
    description: 'At the start of your 2nd turn, gain 14 Block.',
    emoji: '📯',
    trigger: 'onTurnStart',
    turn: 2,
    effect: { type: 'block', amount: 14 }
  },
  {
    id: 'kunai',
    name: 'Kunai',
    rarity: RELIC_RARITY.UNCOMMON,
    description: 'Every time you play 3 Attacks in a turn, gain 1 Dexterity.',
    emoji: '🗡️',
    trigger: 'onAttackPlayed',
    counter: 0,
    threshold: 3,
    effect: { type: 'dexterity', amount: 1 },
    resetOnTurnEnd: true
  },
  {
    id: 'letter_opener',
    name: 'Letter Opener',
    rarity: RELIC_RARITY.UNCOMMON,
    description: 'Every time you play 3 Skills in a turn, deal 5 damage to ALL enemies.',
    emoji: '✉️',
    trigger: 'onSkillPlayed',
    counter: 0,
    threshold: 3,
    effect: { type: 'damageAll', amount: 5 },
    resetOnTurnEnd: true
  },
  {
    id: 'meat_on_the_bone',
    name: 'Meat on the Bone',
    rarity: RELIC_RARITY.UNCOMMON,
    description: 'If HP is at or below 50% at end of combat, heal 12 HP.',
    emoji: '🍖',
    trigger: 'onCombatEnd',
    effect: { type: 'healIfLowHp', amount: 12, threshold: 0.5 }
  },
  {
    id: 'mercury_hourglass',
    name: 'Mercury Hourglass',
    rarity: RELIC_RARITY.UNCOMMON,
    description: 'At the start of your turn, deal 3 damage to ALL enemies.',
    emoji: '⏳',
    trigger: 'onTurnStart',
    effect: { type: 'damageAll', amount: 3 }
  },
  {
    id: 'ornamental_fan',
    name: 'Ornamental Fan',
    rarity: RELIC_RARITY.UNCOMMON,
    description: 'Every time you play 3 Attacks in a turn, gain 4 Block.',
    emoji: '🪭',
    trigger: 'onAttackPlayed',
    counter: 0,
    threshold: 3,
    effect: { type: 'block', amount: 4 },
    resetOnTurnEnd: true
  },
  {
    id: 'paper_phrog',
    name: 'Paper Phrog',
    rarity: RELIC_RARITY.UNCOMMON,
    description: 'Enemies with Vulnerable take 75% more damage rather than 50%.',
    emoji: '🐸',
    trigger: 'passive',
    effect: { type: 'vulnerableBonus', amount: 0.25 }
  },
  {
    id: 'self_forming_clay',
    name: 'Self-Forming Clay',
    rarity: RELIC_RARITY.UNCOMMON,
    description: 'Whenever you lose HP in combat, gain 3 Block next turn.',
    emoji: '🏺',
    trigger: 'onHpLoss',
    effect: { type: 'blockNextTurn', amount: 3 }
  },
  {
    id: 'shuriken',
    name: 'Shuriken',
    rarity: RELIC_RARITY.UNCOMMON,
    description: 'Every time you play 3 Attacks in a turn, gain 1 Strength.',
    emoji: '⭐',
    trigger: 'onAttackPlayed',
    counter: 0,
    threshold: 3,
    effect: { type: 'strength', amount: 1 },
    resetOnTurnEnd: true
  },
  {
    id: 'singing_bowl',
    name: 'Singing Bowl',
    rarity: RELIC_RARITY.UNCOMMON,
    description: 'When adding cards to your deck, you may gain +2 Max HP instead.',
    emoji: '🥣',
    trigger: 'onCardReward',
    effect: { type: 'maxHpOption', amount: 2 }
  },
  {
    id: 'strike_dummy',
    name: 'Strike Dummy',
    rarity: RELIC_RARITY.UNCOMMON,
    description: 'Whenever you play a Strike, deal 3 additional damage.',
    emoji: '🎯',
    trigger: 'onStrikePlayed',
    effect: { type: 'damage', amount: 3 }
  },
  {
    id: 'torii',
    name: 'Torii',
    rarity: RELIC_RARITY.UNCOMMON,
    description: 'Whenever you receive 5 or less unblocked damage, reduce it to 1.',
    emoji: '⛩️',
    trigger: 'onDamageReceived',
    effect: { type: 'reduceLowDamage', threshold: 5 }
  },

  // ========== RARE ==========
  {
    id: 'calipers',
    name: 'Calipers',
    rarity: RELIC_RARITY.RARE,
    description: 'At the start of your turn, lose 15 Block instead of all Block.',
    emoji: '📏',
    trigger: 'onTurnStart',
    effect: { type: 'retainBlock', amount: 15 }
  },
  {
    id: 'dead_branch',
    name: 'Dead Branch',
    rarity: RELIC_RARITY.RARE,
    description: 'Whenever you Exhaust a card, add a random card to your hand.',
    emoji: '🌿',
    trigger: 'onExhaust',
    effect: { type: 'addRandomCard' }
  },
  {
    id: 'du_vu_doll',
    name: 'Du-Vu Doll',
    rarity: RELIC_RARITY.RARE,
    description: 'For each Curse in your deck, start combat with 1 Strength.',
    emoji: '🪆',
    trigger: 'onCombatStart',
    effect: { type: 'strengthPerCurse', amount: 1 }
  },
  {
    id: 'girya',
    name: 'Girya',
    rarity: RELIC_RARITY.RARE,
    description: 'You can now gain Strength at Rest Sites (up to 3 times).',
    emoji: '🏋️',
    trigger: 'onRest',
    effect: { type: 'strengthOption', amount: 1, maxUses: 3 },
    usesRemaining: 3
  },
  {
    id: 'ice_cream',
    name: 'Ice Cream',
    rarity: RELIC_RARITY.RARE,
    description: 'Energy is conserved between turns.',
    emoji: '🍦',
    trigger: 'passive',
    effect: { type: 'conserveEnergy' }
  },
  {
    id: 'incense_burner',
    name: 'Incense Burner',
    rarity: RELIC_RARITY.RARE,
    description: 'Every 6 turns, gain 1 Intangible.',
    emoji: '🎐',
    trigger: 'onTurnEnd',
    counter: 0,
    threshold: 6,
    effect: { type: 'intangible', amount: 1 }
  },
  {
    id: 'lizard_tail',
    name: 'Lizard Tail',
    rarity: RELIC_RARITY.RARE,
    description: 'When you die, heal to 50% HP instead. One use.',
    emoji: '🦎',
    trigger: 'onDeath',
    effect: { type: 'revive', amount: 0.5 },
    used: false
  },
  {
    id: 'magic_flower',
    name: 'Magic Flower',
    rarity: RELIC_RARITY.RARE,
    description: 'Healing is 50% more effective.',
    emoji: '🌸',
    trigger: 'passive',
    effect: { type: 'healingBonus', amount: 0.5 }
  },
  {
    id: 'mango',
    name: 'Mango',
    rarity: RELIC_RARITY.RARE,
    description: 'Upon pickup, raise your Max HP by 14.',
    emoji: '🥭',
    trigger: 'onPickup',
    effect: { type: 'maxHp', amount: 14 }
  },
  {
    id: 'tungsten_rod',
    name: 'Tungsten Rod',
    rarity: RELIC_RARITY.RARE,
    description: 'Whenever you lose HP, lose 1 less.',
    emoji: '🔩',
    trigger: 'onHpLoss',
    effect: { type: 'reduceHpLoss', amount: 1 }
  },

  // ========== BOSS ==========
  {
    id: 'black_star',
    name: 'Black Star',
    rarity: RELIC_RARITY.BOSS,
    description: 'Elites drop an additional Relic.',
    emoji: '⬛',
    trigger: 'passive',
    effect: { type: 'doubleEliteRelics' }
  },
  {
    id: 'coffee_dripper',
    name: 'Coffee Dripper',
    rarity: RELIC_RARITY.BOSS,
    description: 'Gain 1 Energy at the start of each turn. You can no longer Rest.',
    emoji: '☕',
    trigger: 'passive',
    effect: { type: 'energyBonus', amount: 1, noRest: true }
  },
  {
    id: 'cursed_key',
    name: 'Cursed Key',
    rarity: RELIC_RARITY.BOSS,
    description: 'Gain 1 Energy at the start of each turn. Gain a Curse when opening chests.',
    emoji: '🔑',
    trigger: 'passive',
    effect: { type: 'energyBonus', amount: 1, curseOnChest: true }
  },
  {
    id: 'ectoplasm',
    name: 'Ectoplasm',
    rarity: RELIC_RARITY.BOSS,
    description: 'Gain 1 Energy at the start of each turn. You can no longer gain Gold.',
    emoji: '👻',
    trigger: 'passive',
    effect: { type: 'energyBonus', amount: 1, noGold: true }
  },
  {
    id: 'runic_dome',
    name: 'Runic Dome',
    rarity: RELIC_RARITY.BOSS,
    description: 'Gain 1 Energy at the start of each turn. You can no longer see enemy Intents.',
    emoji: '🏛️',
    trigger: 'passive',
    effect: { type: 'energyBonus', amount: 1, hideIntents: true }
  },
  {
    id: 'snecko_eye',
    name: 'Snecko Eye',
    rarity: RELIC_RARITY.BOSS,
    description: 'Draw 2 additional cards each turn. Start each combat Confused.',
    emoji: '🐍',
    trigger: 'passive',
    effect: { type: 'drawBonus', amount: 2, confused: true }
  },
  {
    id: 'sozu',
    name: 'Sozu',
    rarity: RELIC_RARITY.BOSS,
    description: 'Gain 1 Energy at the start of each turn. You can no longer get Potions.',
    emoji: '🍶',
    trigger: 'passive',
    effect: { type: 'energyBonus', amount: 1, noPotions: true }
  },
  {
    id: 'velvet_choker',
    name: 'Velvet Choker',
    rarity: RELIC_RARITY.BOSS,
    description: 'Gain 1 Energy at the start of each turn. You cannot play more than 6 cards per turn.',
    emoji: '📿',
    trigger: 'passive',
    effect: { type: 'energyBonus', amount: 1, cardLimit: 6 }
  },

  // ========== SHOP ==========
  {
    id: 'membership_card',
    name: 'Membership Card',
    rarity: RELIC_RARITY.SHOP,
    description: '50% discount on all items in the shop.',
    emoji: '💳',
    trigger: 'passive',
    effect: { type: 'shopDiscount', amount: 0.5 },
    price: 50
  },
  {
    id: 'orange_pellets',
    name: 'Orange Pellets',
    rarity: RELIC_RARITY.SHOP,
    description: 'Whenever you play a Power, Attack, AND Skill in a turn, remove all debuffs.',
    emoji: '🟠',
    trigger: 'onTurnEnd',
    effect: { type: 'removeDebuffsIfAllTypes' },
    price: 75
  }
];

export const getRelicById = (id) => ALL_RELICS.find(r => r.id === id);

export const getRandomRelic = (rarity = null, excludeIds = []) => {
  let relics = ALL_RELICS.filter(r =>
    r.rarity !== RELIC_RARITY.STARTER &&
    r.rarity !== RELIC_RARITY.BOSS &&
    r.rarity !== RELIC_RARITY.SHOP &&
    !excludeIds.includes(r.id)
  );
  if (rarity) relics = relics.filter(r => r.rarity === rarity);
  return relics[Math.floor(Math.random() * relics.length)];
};

export const getBossRelic = (excludeIds = []) => {
  const relics = ALL_RELICS.filter(r =>
    r.rarity === RELIC_RARITY.BOSS &&
    !excludeIds.includes(r.id)
  );
  return relics[Math.floor(Math.random() * relics.length)];
};

export const getStarterRelic = (characterId = 'ironclad') => {
  const STARTER_RELICS = {
    ironclad: 'burning_blood',
    silent: 'ring_of_snake',
    defect: 'cracked_core',
    watcher: 'pure_water'
  };
  const relicId = STARTER_RELICS[characterId] || STARTER_RELICS.ironclad;
  return ALL_RELICS.find(r => r.id === relicId);
};
