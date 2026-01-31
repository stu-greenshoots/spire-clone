// Card Types: ATTACK, SKILL, POWER, CURSE, STATUS
// Rarity: COMMON, UNCOMMON, RARE, BASIC, CURSE

export const CARD_TYPES = {
  ATTACK: 'attack',
  SKILL: 'skill',
  POWER: 'power',
  CURSE: 'curse',
  STATUS: 'status'
};

export const RARITY = {
  BASIC: 'basic',
  COMMON: 'common',
  UNCOMMON: 'uncommon',
  RARE: 'rare',
  CURSE: 'curse'
};

// 60+ unique cards
export const ALL_CARDS = [
  // ========== BASIC CARDS ==========
  {
    id: 'strike',
    name: 'Strike',
    type: CARD_TYPES.ATTACK,
    rarity: RARITY.BASIC,
    cost: 1,
    damage: 6,
    description: 'Deal 6 damage.',
    upgraded: false,
    upgradedVersion: { damage: 9, description: 'Deal 9 damage.' }
  },
  {
    id: 'defend',
    name: 'Defend',
    type: CARD_TYPES.SKILL,
    rarity: RARITY.BASIC,
    cost: 1,
    block: 5,
    description: 'Gain 5 Block.',
    upgraded: false,
    upgradedVersion: { block: 8, description: 'Gain 8 Block.' }
  },
  {
    id: 'bash',
    name: 'Bash',
    type: CARD_TYPES.ATTACK,
    rarity: RARITY.BASIC,
    cost: 2,
    damage: 8,
    effects: [{ type: 'vulnerable', amount: 2 }],
    description: 'Deal 8 damage. Apply 2 Vulnerable.',
    upgraded: false,
    upgradedVersion: { damage: 10, effects: [{ type: 'vulnerable', amount: 3 }], description: 'Deal 10 damage. Apply 3 Vulnerable.' }
  },

  // ========== COMMON ATTACKS ==========
  {
    id: 'anger',
    name: 'Anger',
    type: CARD_TYPES.ATTACK,
    rarity: RARITY.COMMON,
    cost: 0,
    damage: 6,
    special: 'addCopyToDiscard',
    description: 'Deal 6 damage. Add a copy to your discard pile.',
    upgraded: false,
    upgradedVersion: { damage: 8, description: 'Deal 8 damage. Add a copy to your discard pile.' }
  },
  {
    id: 'cleave',
    name: 'Cleave',
    type: CARD_TYPES.ATTACK,
    rarity: RARITY.COMMON,
    cost: 1,
    damage: 8,
    targetAll: true,
    description: 'Deal 8 damage to ALL enemies.',
    upgraded: false,
    upgradedVersion: { damage: 11, description: 'Deal 11 damage to ALL enemies.' }
  },
  {
    id: 'clothesline',
    name: 'Clothesline',
    type: CARD_TYPES.ATTACK,
    rarity: RARITY.COMMON,
    cost: 2,
    damage: 12,
    effects: [{ type: 'weak', amount: 2 }],
    description: 'Deal 12 damage. Apply 2 Weak.',
    upgraded: false,
    upgradedVersion: { damage: 14, effects: [{ type: 'weak', amount: 3 }], description: 'Deal 14 damage. Apply 3 Weak.' }
  },
  {
    id: 'headbutt',
    name: 'Headbutt',
    type: CARD_TYPES.ATTACK,
    rarity: RARITY.COMMON,
    cost: 1,
    damage: 9,
    special: 'discardToDrawTop',
    description: 'Deal 9 damage. Put a card from discard on top of deck.',
    upgraded: false,
    upgradedVersion: { damage: 12, description: 'Deal 12 damage. Put a card from discard on top of deck.' }
  },
  {
    id: 'ironWave',
    name: 'Iron Wave',
    type: CARD_TYPES.ATTACK,
    rarity: RARITY.COMMON,
    cost: 1,
    damage: 5,
    block: 5,
    description: 'Gain 5 Block. Deal 5 damage.',
    upgraded: false,
    upgradedVersion: { damage: 7, block: 7, description: 'Gain 7 Block. Deal 7 damage.' }
  },
  {
    id: 'pommelStrike',
    name: 'Pommel Strike',
    type: CARD_TYPES.ATTACK,
    rarity: RARITY.COMMON,
    cost: 1,
    damage: 9,
    draw: 1,
    description: 'Deal 9 damage. Draw 1 card.',
    upgraded: false,
    upgradedVersion: { damage: 10, draw: 2, description: 'Deal 10 damage. Draw 2 cards.' }
  },
  {
    id: 'swordBoomerang',
    name: 'Sword Boomerang',
    type: CARD_TYPES.ATTACK,
    rarity: RARITY.COMMON,
    cost: 1,
    damage: 3,
    hits: 3,
    randomTarget: true,
    description: 'Deal 3 damage to a random enemy 3 times.',
    upgraded: false,
    upgradedVersion: { hits: 4, description: 'Deal 3 damage to a random enemy 4 times.' }
  },
  {
    id: 'thunderclap',
    name: 'Thunderclap',
    type: CARD_TYPES.ATTACK,
    rarity: RARITY.COMMON,
    cost: 1,
    damage: 4,
    targetAll: true,
    effects: [{ type: 'vulnerable', amount: 1 }],
    description: 'Deal 4 damage to ALL. Apply 1 Vulnerable to ALL.',
    upgraded: false,
    upgradedVersion: { damage: 7, description: 'Deal 7 damage to ALL. Apply 1 Vulnerable to ALL.' }
  },
  {
    id: 'twinStrike',
    name: 'Twin Strike',
    type: CARD_TYPES.ATTACK,
    rarity: RARITY.COMMON,
    cost: 1,
    damage: 5,
    hits: 2,
    description: 'Deal 5 damage twice.',
    upgraded: false,
    upgradedVersion: { damage: 7, description: 'Deal 7 damage twice.' }
  },
  {
    id: 'wildStrike',
    name: 'Wild Strike',
    type: CARD_TYPES.ATTACK,
    rarity: RARITY.COMMON,
    cost: 1,
    damage: 12,
    special: 'addWound',
    description: 'Deal 12 damage. Shuffle a Wound into your draw pile.',
    upgraded: false,
    upgradedVersion: { damage: 17, description: 'Deal 17 damage. Shuffle a Wound into your draw pile.' }
  },
  {
    id: 'bodySlam',
    name: 'Body Slam',
    type: CARD_TYPES.ATTACK,
    rarity: RARITY.COMMON,
    cost: 1,
    special: 'damageEqualBlock',
    description: 'Deal damage equal to your current Block.',
    upgraded: false,
    upgradedVersion: { cost: 0, description: 'Cost 0. Deal damage equal to your current Block.' }
  },
  {
    id: 'clash',
    name: 'Clash',
    type: CARD_TYPES.ATTACK,
    rarity: RARITY.COMMON,
    cost: 0,
    damage: 18,
    special: 'onlyAttacks',
    description: 'Can only play if every card in hand is Attack. Deal 18 damage.',
    upgraded: false,
    upgradedVersion: { damage: 24, description: 'Can only play if every card in hand is Attack. Deal 24 damage.' }
  },
  {
    id: 'heavyBlade',
    name: 'Heavy Blade',
    type: CARD_TYPES.ATTACK,
    rarity: RARITY.COMMON,
    cost: 2,
    damage: 14,
    strengthMultiplier: 3,
    description: 'Deal 14 damage. Strength affects this 3x.',
    upgraded: false,
    upgradedVersion: { strengthMultiplier: 5, description: 'Deal 14 damage. Strength affects this 5x.' }
  },

  // ========== COMMON SKILLS ==========
  {
    id: 'armaments',
    name: 'Armaments',
    type: CARD_TYPES.SKILL,
    rarity: RARITY.COMMON,
    cost: 1,
    block: 5,
    special: 'upgradeInHand',
    description: 'Gain 5 Block. Upgrade a card in hand for this combat.',
    upgraded: false,
    upgradedVersion: { special: 'upgradeInHand', upgradeAll: true, description: 'Gain 5 Block. Upgrade ALL cards in hand for this combat.' }
  },
  {
    id: 'flexCard',
    name: 'Flex',
    type: CARD_TYPES.SKILL,
    rarity: RARITY.COMMON,
    cost: 0,
    effects: [{ type: 'strength', amount: 2, self: true }],
    special: 'flexStrength',
    description: 'Gain 2 Strength. At end of turn, lose 2 Strength.',
    upgraded: false,
    upgradedVersion: { effects: [{ type: 'strength', amount: 4, self: true }], special: 'flexStrength', description: 'Gain 4 Strength. At end of turn, lose 4 Strength.' }
  },
  {
    id: 'havoc',
    name: 'Havoc',
    type: CARD_TYPES.SKILL,
    rarity: RARITY.COMMON,
    cost: 1,
    special: 'playTopCard',
    description: 'Play the top card of your draw pile and Exhaust it.',
    upgraded: false,
    upgradedVersion: { cost: 0, description: 'Cost 0. Play the top card of your draw pile and Exhaust it.' }
  },
  {
    id: 'shrugItOff',
    name: 'Shrug It Off',
    type: CARD_TYPES.SKILL,
    rarity: RARITY.COMMON,
    cost: 1,
    block: 8,
    draw: 1,
    description: 'Gain 8 Block. Draw 1 card.',
    upgraded: false,
    upgradedVersion: { block: 11, description: 'Gain 11 Block. Draw 1 card.' }
  },
  {
    id: 'trueGrit',
    name: 'True Grit',
    type: CARD_TYPES.SKILL,
    rarity: RARITY.COMMON,
    cost: 1,
    block: 9,
    special: 'exhaustRandom',
    description: 'Gain 9 Block. Exhaust a random card.',
    upgraded: false,
    upgradedVersion: { block: 12, special: 'exhaustChoose', description: 'Gain 12 Block. Exhaust a card.' }
  },
  {
    id: 'warcry',
    name: 'Warcry',
    type: CARD_TYPES.SKILL,
    rarity: RARITY.COMMON,
    cost: 0,
    draw: 1,
    special: 'handToDrawTop',
    exhaust: true,
    description: 'Draw 1 card. Put a card on top of deck. Exhaust.',
    upgraded: false,
    upgradedVersion: { draw: 2, description: 'Draw 2 cards. Put a card on top of deck. Exhaust.' }
  },
  {
    id: 'sentinel',
    name: 'Sentinel',
    type: CARD_TYPES.SKILL,
    rarity: RARITY.COMMON,
    cost: 1,
    block: 5,
    special: 'gainEnergyOnExhaust',
    description: 'Gain 5 Block. If this is Exhausted, gain 2 Energy.',
    upgraded: false,
    upgradedVersion: { block: 8, special: 'gainEnergyOnExhaust3', description: 'Gain 8 Block. If this is Exhausted, gain 3 Energy.' }
  },

  // ========== UNCOMMON ATTACKS ==========
  {
    id: 'bloodletting',
    name: 'Bloodletting',
    type: CARD_TYPES.SKILL,
    rarity: RARITY.UNCOMMON,
    cost: 0,
    special: 'hpForEnergy',
    hpLoss: 3,
    energyGain: 2,
    description: 'Lose 3 HP. Gain 2 Energy.',
    upgraded: false,
    upgradedVersion: { energyGain: 3, description: 'Lose 3 HP. Gain 3 Energy.' }
  },
  {
    id: 'carnage',
    name: 'Carnage',
    type: CARD_TYPES.ATTACK,
    rarity: RARITY.UNCOMMON,
    cost: 2,
    damage: 20,
    ethereal: true,
    description: 'Ethereal. Deal 20 damage.',
    upgraded: false,
    upgradedVersion: { damage: 28, description: 'Ethereal. Deal 28 damage.' }
  },
  {
    id: 'dropkick',
    name: 'Dropkick',
    type: CARD_TYPES.ATTACK,
    rarity: RARITY.UNCOMMON,
    cost: 1,
    damage: 5,
    special: 'bonusIfVulnerable',
    description: 'Deal 5 damage. If enemy is Vulnerable, gain 1 Energy and draw 1.',
    upgraded: false,
    upgradedVersion: { damage: 8, description: 'Deal 8 damage. If enemy is Vulnerable, gain 1 Energy and draw 1.' }
  },
  {
    id: 'hemokinesis',
    name: 'Hemokinesis',
    type: CARD_TYPES.ATTACK,
    rarity: RARITY.UNCOMMON,
    cost: 1,
    damage: 15,
    hpCost: 2,
    description: 'Lose 2 HP. Deal 15 damage.',
    upgraded: false,
    upgradedVersion: { damage: 20, description: 'Lose 2 HP. Deal 20 damage.' }
  },
  {
    id: 'pummel',
    name: 'Pummel',
    type: CARD_TYPES.ATTACK,
    rarity: RARITY.UNCOMMON,
    cost: 1,
    damage: 3,
    hits: 4,
    exhaust: true,
    description: 'Deal 3 damage 4 times. Exhaust.',
    upgraded: false,
    upgradedVersion: { hits: 5, description: 'Deal 3 damage 5 times. Exhaust.' }
  },
  {
    id: 'rampage',
    name: 'Rampage',
    type: CARD_TYPES.ATTACK,
    rarity: RARITY.UNCOMMON,
    cost: 1,
    damage: 8,
    special: 'escalatingDamage',
    description: 'Deal 8 damage. Increase this card\'s damage by 5 this combat.',
    upgraded: false,
    upgradedVersion: { special: 'escalatingDamage8', description: 'Deal 8 damage. Increase this card\'s damage by 8 this combat.' }
  },
  {
    id: 'recklessCharge',
    name: 'Reckless Charge',
    type: CARD_TYPES.ATTACK,
    rarity: RARITY.UNCOMMON,
    cost: 0,
    damage: 7,
    special: 'addDaze',
    description: 'Deal 7 damage. Shuffle a Daze into your draw pile.',
    upgraded: false,
    upgradedVersion: { damage: 10, description: 'Deal 10 damage. Shuffle a Daze into your draw pile.' }
  },
  {
    id: 'uppercut',
    name: 'Uppercut',
    type: CARD_TYPES.ATTACK,
    rarity: RARITY.UNCOMMON,
    cost: 2,
    damage: 13,
    effects: [{ type: 'weak', amount: 1 }, { type: 'vulnerable', amount: 1 }],
    description: 'Deal 13 damage. Apply 1 Weak. Apply 1 Vulnerable.',
    upgraded: false,
    upgradedVersion: { effects: [{ type: 'weak', amount: 2 }, { type: 'vulnerable', amount: 2 }], description: 'Deal 13 damage. Apply 2 Weak. Apply 2 Vulnerable.' }
  },
  {
    id: 'whirlwind',
    name: 'Whirlwind',
    type: CARD_TYPES.ATTACK,
    rarity: RARITY.UNCOMMON,
    cost: -1,
    damage: 5,
    targetAll: true,
    special: 'xCost',
    description: 'Deal 5 damage to ALL enemies X times.',
    upgraded: false,
    upgradedVersion: { damage: 8, description: 'Deal 8 damage to ALL enemies X times.' }
  },
  {
    id: 'searingBlow',
    name: 'Searing Blow',
    type: CARD_TYPES.ATTACK,
    rarity: RARITY.UNCOMMON,
    cost: 2,
    damage: 12,
    special: 'multiUpgrade',
    upgradeCount: 0,
    canUpgradeInfinitely: true,
    description: 'Deal 12 damage. Can be upgraded any number of times.',
    upgraded: false,
    upgradedVersion: { upgradeCount: 1, description: 'Deal 16(+4) damage. Can be upgraded any number of times.' }
  },
  {
    id: 'perfectedStrike',
    name: 'Perfected Strike',
    type: CARD_TYPES.ATTACK,
    rarity: RARITY.UNCOMMON,
    cost: 2,
    damage: 6,
    special: 'bonusPerStrike',
    description: 'Deal 6 damage. +2 damage for each Strike card in your deck.',
    upgraded: false,
    upgradedVersion: { special: 'bonusPerStrike3', description: 'Deal 6 damage. +3 damage for each Strike card in your deck.' }
  },

  // ========== UNCOMMON SKILLS ==========
  {
    id: 'battleTrance',
    name: 'Battle Trance',
    type: CARD_TYPES.SKILL,
    rarity: RARITY.UNCOMMON,
    cost: 0,
    draw: 3,
    special: 'cantDraw',
    description: 'Draw 3 cards. You cannot draw more cards this turn.',
    upgraded: false,
    upgradedVersion: { draw: 4, description: 'Draw 4 cards. You cannot draw more cards this turn.' }
  },
  {
    id: 'disarm',
    name: 'Disarm',
    type: CARD_TYPES.SKILL,
    rarity: RARITY.UNCOMMON,
    cost: 1,
    special: 'removeStrength',
    strengthReduction: 2,
    exhaust: true,
    description: 'Enemy loses 2 Strength. Exhaust.',
    upgraded: false,
    upgradedVersion: { strengthReduction: 3, description: 'Enemy loses 3 Strength. Exhaust.' }
  },
  {
    id: 'dualWield',
    name: 'Dual Wield',
    type: CARD_TYPES.SKILL,
    rarity: RARITY.UNCOMMON,
    cost: 1,
    special: 'copyCardInHand',
    copies: 1,
    description: 'Create a copy of an Attack or Power card in your hand.',
    upgraded: false,
    upgradedVersion: { copies: 2, description: 'Create 2 copies of an Attack or Power card in your hand.' }
  },
  {
    id: 'entrench',
    name: 'Entrench',
    type: CARD_TYPES.SKILL,
    rarity: RARITY.UNCOMMON,
    cost: 2,
    special: 'doubleBlock',
    description: 'Double your current Block.',
    upgraded: false,
    upgradedVersion: { cost: 1, description: 'Cost 1. Double your current Block.' }
  },
  {
    id: 'flameBarrier',
    name: 'Flame Barrier',
    type: CARD_TYPES.SKILL,
    rarity: RARITY.UNCOMMON,
    cost: 2,
    block: 12,
    special: 'retaliateOnHit',
    thorns: 4,
    description: 'Gain 12 Block. When attacked this turn, deal 4 damage back.',
    upgraded: false,
    upgradedVersion: { block: 16, thorns: 6, description: 'Gain 16 Block. When attacked this turn, deal 6 damage back.' }
  },
  {
    id: 'ghostlyArmor',
    name: 'Ghostly Armor',
    type: CARD_TYPES.SKILL,
    rarity: RARITY.UNCOMMON,
    cost: 1,
    block: 10,
    ethereal: true,
    description: 'Ethereal. Gain 10 Block.',
    upgraded: false,
    upgradedVersion: { block: 13, description: 'Ethereal. Gain 13 Block.' }
  },
  {
    id: 'infernalBlade',
    name: 'Infernal Blade',
    type: CARD_TYPES.SKILL,
    rarity: RARITY.UNCOMMON,
    cost: 1,
    special: 'addRandomAttack',
    exhaust: true,
    description: 'Add a random Attack to your hand. It costs 0 this turn. Exhaust.',
    upgraded: false,
    upgradedVersion: { cost: 0, description: 'Add a random Attack to your hand. It costs 0 this turn. Exhaust.' }
  },
  {
    id: 'intimidate',
    name: 'Intimidate',
    type: CARD_TYPES.SKILL,
    rarity: RARITY.UNCOMMON,
    cost: 0,
    effects: [{ type: 'weak', amount: 1 }],
    targetAll: true,
    exhaust: true,
    description: 'Apply 1 Weak to ALL enemies. Exhaust.',
    upgraded: false,
    upgradedVersion: { effects: [{ type: 'weak', amount: 2 }], description: 'Apply 2 Weak to ALL enemies. Exhaust.' }
  },
  {
    id: 'powerThrough',
    name: 'Power Through',
    type: CARD_TYPES.SKILL,
    rarity: RARITY.UNCOMMON,
    cost: 1,
    block: 15,
    special: 'addWoundsToHand',
    wounds: 2,
    description: 'Add 2 Wounds to your hand. Gain 15 Block.',
    upgraded: false,
    upgradedVersion: { block: 20, description: 'Add 2 Wounds to your hand. Gain 20 Block.' }
  },
  {
    id: 'rage',
    name: 'Rage',
    type: CARD_TYPES.SKILL,
    rarity: RARITY.UNCOMMON,
    cost: 0,
    special: 'blockPerAttack',
    rageBlock: 3,
    description: 'Whenever you play an Attack this turn, gain 3 Block.',
    upgraded: false,
    upgradedVersion: { rageBlock: 5, description: 'Whenever you play an Attack this turn, gain 5 Block.' }
  },
  {
    id: 'secondWind',
    name: 'Second Wind',
    type: CARD_TYPES.SKILL,
    rarity: RARITY.UNCOMMON,
    cost: 1,
    special: 'exhaustNonAttacksBlock',
    blockPer: 5,
    description: 'Exhaust all non-Attack cards in hand. Gain 5 Block for each.',
    upgraded: false,
    upgradedVersion: { blockPer: 7, description: 'Exhaust all non-Attack cards in hand. Gain 7 Block for each.' }
  },
  {
    id: 'seeingRed',
    name: 'Seeing Red',
    type: CARD_TYPES.SKILL,
    rarity: RARITY.UNCOMMON,
    cost: 1,
    energy: 2,
    exhaust: true,
    description: 'Gain 2 Energy. Exhaust.',
    upgraded: false,
    upgradedVersion: { cost: 0, description: 'Gain 2 Energy. Exhaust.' }
  },
  {
    id: 'shockwave',
    name: 'Shockwave',
    type: CARD_TYPES.SKILL,
    rarity: RARITY.UNCOMMON,
    cost: 2,
    effects: [{ type: 'weak', amount: 3 }, { type: 'vulnerable', amount: 3 }],
    targetAll: true,
    exhaust: true,
    description: 'Apply 3 Weak and 3 Vulnerable to ALL enemies. Exhaust.',
    upgraded: false,
    upgradedVersion: { effects: [{ type: 'weak', amount: 5 }, { type: 'vulnerable', amount: 5 }], description: 'Apply 5 Weak and 5 Vulnerable to ALL enemies. Exhaust.' }
  },
  {
    id: 'spotWeakness',
    name: 'Spot Weakness',
    type: CARD_TYPES.SKILL,
    rarity: RARITY.UNCOMMON,
    cost: 1,
    special: 'strIfAttacking',
    strength: 3,
    description: 'If enemy intends to attack, gain 3 Strength.',
    upgraded: false,
    upgradedVersion: { strength: 4, description: 'If enemy intends to attack, gain 4 Strength.' }
  },

  // ========== RARE ATTACKS ==========
  {
    id: 'bludgeon',
    name: 'Bludgeon',
    type: CARD_TYPES.ATTACK,
    rarity: RARITY.RARE,
    cost: 3,
    damage: 32,
    description: 'Deal 32 damage.',
    upgraded: false,
    upgradedVersion: { damage: 42, description: 'Deal 42 damage.' }
  },
  {
    id: 'feed',
    name: 'Feed',
    type: CARD_TYPES.ATTACK,
    rarity: RARITY.RARE,
    cost: 1,
    damage: 10,
    special: 'killForMaxHp',
    maxHpGain: 3,
    exhaust: true,
    description: 'Deal 10 damage. If this kills, gain 3 max HP. Exhaust.',
    upgraded: false,
    upgradedVersion: { damage: 12, maxHpGain: 4, description: 'Deal 12 damage. If this kills, gain 4 max HP. Exhaust.' }
  },
  {
    id: 'fiendFire',
    name: 'Fiend Fire',
    type: CARD_TYPES.ATTACK,
    rarity: RARITY.RARE,
    cost: 2,
    damage: 7,
    special: 'exhaustHandDamage',
    exhaust: true,
    description: 'Exhaust all cards in hand. Deal 7 damage for each. Exhaust.',
    upgraded: false,
    upgradedVersion: { damage: 10, description: 'Exhaust all cards in hand. Deal 10 damage for each. Exhaust.' }
  },
  {
    id: 'immolate',
    name: 'Immolate',
    type: CARD_TYPES.ATTACK,
    rarity: RARITY.RARE,
    cost: 2,
    damage: 21,
    targetAll: true,
    special: 'addBurn',
    description: 'Deal 21 damage to ALL enemies. Add a Burn to discard.',
    upgraded: false,
    upgradedVersion: { damage: 28, description: 'Deal 28 damage to ALL enemies. Add a Burn to discard.' }
  },
  {
    id: 'reaper',
    name: 'Reaper',
    type: CARD_TYPES.ATTACK,
    rarity: RARITY.RARE,
    cost: 2,
    damage: 4,
    targetAll: true,
    special: 'lifesteal',
    exhaust: true,
    description: 'Deal 4 damage to ALL. Heal HP equal to damage dealt. Exhaust.',
    upgraded: false,
    upgradedVersion: { damage: 5, description: 'Deal 5 damage to ALL. Heal HP equal to damage dealt. Exhaust.' }
  },

  // ========== RARE SKILLS ==========
  {
    id: 'doubleTap',
    name: 'Double Tap',
    type: CARD_TYPES.SKILL,
    rarity: RARITY.RARE,
    cost: 1,
    special: 'doubleNextAttack',
    description: 'This turn, your next Attack is played twice.',
    upgraded: false,
    upgradedVersion: { special: 'doubleNextAttacks2', description: 'This turn, your next 2 Attacks are played twice.' }
  },
  {
    id: 'exhume',
    name: 'Exhume',
    type: CARD_TYPES.SKILL,
    rarity: RARITY.RARE,
    cost: 1,
    special: 'retrieveExhausted',
    exhaust: true,
    description: 'Put a card from exhaust pile into your hand. Exhaust.',
    upgraded: false,
    upgradedVersion: { cost: 0, description: 'Put a card from exhaust pile into your hand. Exhaust.' }
  },
  {
    id: 'impervious',
    name: 'Impervious',
    type: CARD_TYPES.SKILL,
    rarity: RARITY.RARE,
    cost: 2,
    block: 30,
    exhaust: true,
    description: 'Gain 30 Block. Exhaust.',
    upgraded: false,
    upgradedVersion: { block: 40, description: 'Gain 40 Block. Exhaust.' }
  },
  {
    id: 'limitBreak',
    name: 'Limit Break',
    type: CARD_TYPES.SKILL,
    rarity: RARITY.RARE,
    cost: 1,
    special: 'doubleStrength',
    exhaust: true,
    description: 'Double your Strength. Exhaust.',
    upgraded: false,
    upgradedVersion: { exhaust: false, description: 'Double your Strength.' }
  },
  {
    id: 'offering',
    name: 'Offering',
    type: CARD_TYPES.SKILL,
    rarity: RARITY.RARE,
    cost: 0,
    hpCost: 6,
    energy: 2,
    draw: 3,
    exhaust: true,
    description: 'Lose 6 HP. Gain 2 Energy. Draw 3 cards. Exhaust.',
    upgraded: false,
    upgradedVersion: { draw: 5, description: 'Lose 6 HP. Gain 2 Energy. Draw 5 cards. Exhaust.' }
  },

  // ========== POWERS ==========
  {
    id: 'barricade',
    name: 'Barricade',
    type: CARD_TYPES.POWER,
    rarity: RARITY.RARE,
    cost: 3,
    special: 'retainAllBlock',
    description: 'Block is not removed at the start of your turn.',
    upgraded: false,
    upgradedVersion: { cost: 2, description: 'Block is not removed at the start of your turn.' }
  },
  {
    id: 'berserk',
    name: 'Berserk',
    type: CARD_TYPES.POWER,
    rarity: RARITY.UNCOMMON,
    cost: 0,
    effects: [{ type: 'vulnerable', amount: 2, self: true }],
    special: 'selfVulnForEnergy',
    description: 'Gain 2 Vulnerable. At the start of your turn, gain 1 Energy.',
    upgraded: false,
    upgradedVersion: { effects: [{ type: 'vulnerable', amount: 1, self: true }], description: 'Gain 1 Vulnerable. At the start of your turn, gain 1 Energy.' }
  },
  {
    id: 'brutality',
    name: 'Brutality',
    type: CARD_TYPES.POWER,
    rarity: RARITY.RARE,
    cost: 0,
    special: 'hpForDraw',
    description: 'At the start of your turn, lose 1 HP and draw 1 card.',
    upgraded: false,
    upgradedVersion: { innate: true, description: 'Innate. At the start of your turn, lose 1 HP and draw 1 card.' }
  },
  {
    id: 'combust',
    name: 'Combust',
    type: CARD_TYPES.POWER,
    rarity: RARITY.UNCOMMON,
    cost: 1,
    special: 'hpForAoeDamage',
    hpLoss: 1,
    damage: 5,
    description: 'At end of turn, lose 1 HP, deal 5 damage to ALL enemies.',
    upgraded: false,
    upgradedVersion: { damage: 7, description: 'At end of turn, lose 1 HP, deal 7 damage to ALL enemies.' }
  },
  {
    id: 'corruption',
    name: 'Corruption',
    type: CARD_TYPES.POWER,
    rarity: RARITY.RARE,
    cost: 3,
    special: 'freeSkillsExhaust',
    description: 'Skills cost 0. Whenever you play a Skill, Exhaust it.',
    upgraded: false,
    upgradedVersion: { cost: 2, description: 'Skills cost 0. Whenever you play a Skill, Exhaust it.' }
  },
  {
    id: 'darkEmbrace',
    name: 'Dark Embrace',
    type: CARD_TYPES.POWER,
    rarity: RARITY.UNCOMMON,
    cost: 2,
    special: 'drawOnExhaust',
    description: 'Whenever a card is Exhausted, draw 1 card.',
    upgraded: false,
    upgradedVersion: { cost: 1, description: 'Whenever a card is Exhausted, draw 1 card.' }
  },
  {
    id: 'demonForm',
    name: 'Demon Form',
    type: CARD_TYPES.POWER,
    rarity: RARITY.RARE,
    cost: 3,
    special: 'strengthEachTurn',
    strength: 2,
    description: 'At the start of your turn, gain 2 Strength.',
    upgraded: false,
    upgradedVersion: { strength: 3, description: 'At the start of your turn, gain 3 Strength.' }
  },
  {
    id: 'evolve',
    name: 'Evolve',
    type: CARD_TYPES.POWER,
    rarity: RARITY.UNCOMMON,
    cost: 1,
    special: 'drawOnStatus',
    draw: 1,
    description: 'Whenever you draw a Status, draw 1 card.',
    upgraded: false,
    upgradedVersion: { draw: 2, description: 'Whenever you draw a Status, draw 2 cards.' }
  },
  {
    id: 'feelNoPain',
    name: 'Feel No Pain',
    type: CARD_TYPES.POWER,
    rarity: RARITY.UNCOMMON,
    cost: 1,
    special: 'blockOnExhaust',
    block: 3,
    description: 'Whenever a card is Exhausted, gain 3 Block.',
    upgraded: false,
    upgradedVersion: { block: 4, description: 'Whenever a card is Exhausted, gain 4 Block.' }
  },
  {
    id: 'fireBreathing',
    name: 'Fire Breathing',
    type: CARD_TYPES.POWER,
    rarity: RARITY.UNCOMMON,
    cost: 1,
    special: 'aoeOnStatus',
    damage: 6,
    description: 'Whenever you draw a Status or Curse, deal 6 damage to ALL enemies.',
    upgraded: false,
    upgradedVersion: { damage: 10, description: 'Whenever you draw a Status or Curse, deal 10 damage to ALL enemies.' }
  },
  {
    id: 'inflame',
    name: 'Inflame',
    type: CARD_TYPES.POWER,
    rarity: RARITY.UNCOMMON,
    cost: 1,
    effects: [{ type: 'strength', amount: 2, self: true }],
    description: 'Gain 2 Strength.',
    upgraded: false,
    upgradedVersion: { effects: [{ type: 'strength', amount: 3, self: true }], description: 'Gain 3 Strength.' }
  },
  {
    id: 'juggernaut',
    name: 'Juggernaut',
    type: CARD_TYPES.POWER,
    rarity: RARITY.UNCOMMON,
    cost: 2,
    special: 'damageOnBlock',
    damage: 5,
    description: 'Whenever you gain Block, deal 5 damage to a random enemy.',
    upgraded: false,
    upgradedVersion: { damage: 7, description: 'Whenever you gain Block, deal 7 damage to a random enemy.' }
  },
  {
    id: 'metallicize',
    name: 'Metallicize',
    type: CARD_TYPES.POWER,
    rarity: RARITY.UNCOMMON,
    cost: 1,
    special: 'metallicize',
    block: 3,
    description: 'At the end of your turn, gain 3 Block.',
    upgraded: false,
    upgradedVersion: { block: 4, description: 'At the end of your turn, gain 4 Block.' }
  },
  {
    id: 'rupture',
    name: 'Rupture',
    type: CARD_TYPES.POWER,
    rarity: RARITY.UNCOMMON,
    cost: 1,
    special: 'strengthOnSelfHpLoss',
    strength: 1,
    description: 'Whenever you lose HP from a card, gain 1 Strength.',
    upgraded: false,
    upgradedVersion: { strength: 2, description: 'Whenever you lose HP from a card, gain 2 Strength.' }
  },

  // ========== NEW UNCOMMON/RARE CARDS (JR-04) ==========
  {
    id: 'severSoul',
    name: 'Sever Soul',
    type: CARD_TYPES.ATTACK,
    rarity: RARITY.UNCOMMON,
    cost: 2,
    damage: 16,
    special: 'severSoul',
    description: 'Exhaust all non-Attack cards in hand. Deal 16 damage.',
    upgraded: false,
    upgradedVersion: { damage: 22, description: 'Exhaust all non-Attack cards in hand. Deal 22 damage.' }
  },
  {
    id: 'darkShackles',
    name: 'Dark Shackles',
    type: CARD_TYPES.SKILL,
    rarity: RARITY.UNCOMMON,
    cost: 0,
    special: 'tempStrengthDown',
    strengthReduction: 9,
    exhaust: true,
    description: 'Enemy loses 9 Strength for the rest of this turn. Exhaust.',
    upgraded: false,
    upgradedVersion: { strengthReduction: 15, description: 'Enemy loses 15 Strength for the rest of this turn. Exhaust.' }
  },
  {
    id: 'burningPact',
    name: 'Burning Pact',
    type: CARD_TYPES.SKILL,
    rarity: RARITY.UNCOMMON,
    cost: 1,
    special: 'exhaustForDraw',
    draw: 2,
    exhaust: false,
    description: 'Exhaust 1 card. Draw 2 cards.',
    upgraded: false,
    upgradedVersion: { draw: 3, description: 'Exhaust 1 card. Draw 3 cards.' }
  },
  {
    id: 'combust_plus',
    name: 'Combust+',
    type: CARD_TYPES.POWER,
    rarity: RARITY.UNCOMMON,
    cost: 1,
    special: 'combustStack',
    hpLoss: 1,
    damage: 5,
    description: 'Stacks with Combust. At end of turn, lose 1 HP, deal 5 damage to ALL enemies.',
    upgraded: false,
    upgradedVersion: { damage: 7, description: 'Stacks with Combust. At end of turn, lose 1 HP, deal 7 damage to ALL enemies.' }
  },
  {
    id: 'doubleTapPlus',
    name: 'Double Tap+',
    type: CARD_TYPES.SKILL,
    rarity: RARITY.RARE,
    cost: 1,
    special: 'doubleNextAttacks2',
    description: 'This turn, your next 2 Attacks are played twice.',
    upgraded: false,
    upgradedVersion: { special: 'doubleNextAttacks3', description: 'This turn, your next 3 Attacks are played twice.' }
  },
  {
    id: 'bloodForBlood',
    name: 'Blood for Blood',
    type: CARD_TYPES.ATTACK,
    rarity: RARITY.UNCOMMON,
    cost: 4,
    damage: 18,
    special: 'costReduceOnHpLoss',
    description: 'Costs 1 less for each time you lose HP this combat. Deal 18 damage.',
    upgraded: false,
    upgradedVersion: { damage: 22, cost: 3, description: 'Costs 1 less for each time you lose HP this combat. Deal 22 damage.' }
  },
  {
    id: 'fireBreath',
    name: 'Fire Breath',
    type: CARD_TYPES.ATTACK,
    rarity: RARITY.UNCOMMON,
    cost: 1,
    damage: 6,
    special: 'damagePerStatus',
    targetAll: true,
    description: 'Deal 6 damage to ALL for each Status in your hand.',
    upgraded: false,
    upgradedVersion: { damage: 10, description: 'Deal 10 damage to ALL for each Status in your hand.' }
  },
  {
    id: 'seeingRedPlus',
    name: 'Seeing Red+',
    type: CARD_TYPES.SKILL,
    rarity: RARITY.UNCOMMON,
    cost: 0,
    energy: 2,
    exhaust: true,
    description: 'Gain 2 Energy. Exhaust.',
    upgraded: true,
    upgradedVersion: null
  },
  {
    id: 'sentinel_plus',
    name: 'Sentinel+',
    type: CARD_TYPES.SKILL,
    rarity: RARITY.COMMON,
    cost: 1,
    block: 8,
    special: 'gainEnergyOnExhaust3',
    description: 'Gain 8 Block. If this is Exhausted, gain 3 Energy.',
    upgraded: true,
    upgradedVersion: null
  },
  {
    id: 'infernalStrike',
    name: 'Infernal Strike',
    type: CARD_TYPES.ATTACK,
    rarity: RARITY.UNCOMMON,
    cost: 1,
    damage: 9,
    special: 'addBurn',
    description: 'Deal 9 damage. Add a Burn to enemy discard pile.',
    upgraded: false,
    upgradedVersion: { damage: 13, description: 'Deal 13 damage. Add a Burn to enemy discard pile.' }
  },
  {
    id: 'rupturePlus',
    name: 'Rupture+',
    type: CARD_TYPES.POWER,
    rarity: RARITY.UNCOMMON,
    cost: 1,
    special: 'strengthOnSelfHpLoss',
    strength: 2,
    description: 'Whenever you lose HP from a card, gain 2 Strength.',
    upgraded: true,
    upgradedVersion: null
  },
  {
    id: 'warcryPlus',
    name: 'Warcry+',
    type: CARD_TYPES.SKILL,
    rarity: RARITY.COMMON,
    cost: 0,
    draw: 2,
    special: 'handToDrawTop',
    exhaust: true,
    description: 'Draw 2 cards. Put a card on top of deck. Exhaust.',
    upgraded: true,
    upgradedVersion: null
  },
  {
    id: 'flameStrike',
    name: 'Flame Strike',
    type: CARD_TYPES.ATTACK,
    rarity: RARITY.RARE,
    cost: 3,
    damage: 12,
    targetAll: true,
    special: 'addBurn',
    description: 'Deal 12 damage to ALL enemies. Add a Burn to your discard pile.',
    upgraded: false,
    upgradedVersion: { damage: 16, description: 'Deal 16 damage to ALL enemies. Add a Burn to your discard pile.' }
  },
  {
    id: 'evolvedRage',
    name: 'Evolved Rage',
    type: CARD_TYPES.SKILL,
    rarity: RARITY.UNCOMMON,
    cost: 0,
    special: 'blockPerAttackEvolved',
    rageBlock: 5,
    description: 'Whenever you play an Attack this turn, gain 5 Block.',
    upgraded: false,
    upgradedVersion: { rageBlock: 7, description: 'Whenever you play an Attack this turn, gain 7 Block.' }
  },
  {
    id: 'demonStrike',
    name: 'Demon Strike',
    type: CARD_TYPES.ATTACK,
    rarity: RARITY.RARE,
    cost: 2,
    damage: 14,
    special: 'gainStrengthOnKill',
    strengthGain: 3,
    description: 'Deal 14 damage. If this kills an enemy, gain 3 Strength.',
    upgraded: false,
    upgradedVersion: { damage: 18, strengthGain: 4, description: 'Deal 18 damage. If this kills an enemy, gain 4 Strength.' }
  },

  // ========== STATUS/CURSE CARDS ==========
  {
    id: 'wound',
    name: 'Wound',
    type: CARD_TYPES.STATUS,
    rarity: RARITY.CURSE,
    cost: -2,
    description: 'Unplayable.',
    unplayable: true,
    upgraded: false
  },
  {
    id: 'dazed',
    name: 'Dazed',
    type: CARD_TYPES.STATUS,
    rarity: RARITY.CURSE,
    cost: -2,
    ethereal: true,
    description: 'Unplayable. Ethereal.',
    unplayable: true,
    upgraded: false
  },
  {
    id: 'burn',
    name: 'Burn',
    type: CARD_TYPES.STATUS,
    rarity: RARITY.CURSE,
    cost: -2,
    special: 'burnDamage',
    burnDamage: 2,
    description: 'Unplayable. At end of turn, take 2 damage.',
    unplayable: true,
    upgraded: false
  },
  {
    id: 'slimed',
    name: 'Slimed',
    type: CARD_TYPES.STATUS,
    rarity: RARITY.CURSE,
    cost: 1,
    exhaust: true,
    description: 'Cost 1. Exhaust.',
    upgraded: false
  },
  {
    id: 'void',
    name: 'Void',
    type: CARD_TYPES.STATUS,
    rarity: RARITY.CURSE,
    cost: -2,
    special: 'voidCard',
    ethereal: true,
    description: 'Unplayable. Ethereal. When drawn, lose 1 Energy.',
    unplayable: true,
    upgraded: false
  },
  {
    id: 'curse_pain',
    name: 'Pain',
    type: CARD_TYPES.CURSE,
    rarity: RARITY.CURSE,
    cost: -2,
    special: 'painCurse',
    description: 'Unplayable. Whenever you draw this card, lose 1 HP.',
    unplayable: true,
    upgraded: false
  },
  {
    id: 'curse_regret',
    name: 'Regret',
    type: CARD_TYPES.CURSE,
    rarity: RARITY.CURSE,
    cost: -2,
    special: 'regretCurse',
    description: 'Unplayable. At end of turn, lose 1 HP per card in hand.',
    unplayable: true,
    upgraded: false
  },
  {
    id: 'curse_doubt',
    name: 'Doubt',
    type: CARD_TYPES.CURSE,
    rarity: RARITY.CURSE,
    cost: -2,
    special: 'doubtCurse',
    description: 'Unplayable. At end of turn, gain 1 Weak.',
    unplayable: true,
    upgraded: false
  },
  {
    id: 'curse_decay',
    name: 'Decay',
    type: CARD_TYPES.CURSE,
    rarity: RARITY.CURSE,
    cost: -2,
    special: 'decayCurse',
    description: 'Unplayable. At end of turn, take 2 damage.',
    unplayable: true,
    upgraded: false
  }
];

export const getStarterDeck = (characterId = 'ironclad') => {
  // Import character data dynamically to avoid circular dependencies
  // For now, support ironclad (default) — future characters define their own starters
  if (characterId === 'ironclad') {
    const deck = [];
    for (let i = 0; i < 5; i++) {
      deck.push({ ...ALL_CARDS.find(c => c.id === 'strike'), instanceId: `strike_${i}` });
    }
    for (let i = 0; i < 4; i++) {
      deck.push({ ...ALL_CARDS.find(c => c.id === 'defend'), instanceId: `defend_${i}` });
    }
    deck.push({ ...ALL_CARDS.find(c => c.id === 'bash'), instanceId: 'bash_0' });
    return deck;
  }
  // Fallback: return ironclad starter
  return getStarterDeck('ironclad');
};

export const getCardById = (id) => ALL_CARDS.find(c => c.id === id);

export const getRandomCard = (rarity = null, type = null, characterId = null) => {
  let cards = ALL_CARDS.filter(c =>
    c.rarity !== RARITY.BASIC &&
    c.rarity !== RARITY.CURSE &&
    c.type !== CARD_TYPES.STATUS &&
    c.type !== CARD_TYPES.CURSE
  );
  // Filter by character: cards without a character field belong to ironclad
  // Colorless cards (character: 'neutral') are available to all characters
  if (characterId) {
    cards = cards.filter(c => {
      const cardChar = c.character || 'ironclad';
      return cardChar === characterId || cardChar === 'neutral';
    });
  }
  if (rarity) cards = cards.filter(c => c.rarity === rarity);
  if (type) cards = cards.filter(c => c.type === type);
  return cards[Math.floor(Math.random() * cards.length)];
};

export const getCardRewards = (count = 3, characterId = null) => {
  const rewards = [];
  for (let i = 0; i < count; i++) {
    const roll = Math.random();
    let rarity;
    if (roll < 0.6) rarity = RARITY.COMMON;
    else if (roll < 0.9) rarity = RARITY.UNCOMMON;
    else rarity = RARITY.RARE;

    const card = getRandomCard(rarity, null, characterId);
    if (card && !rewards.find(r => r.id === card.id)) {
      rewards.push({ ...card, instanceId: `${card.id}_${Date.now()}_${i}` });
    } else {
      i--;
    }
  }
  return rewards;
};
