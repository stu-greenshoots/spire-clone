# Spire Ascent - Game Reference Matrix

This document provides a complete reference for all game mechanics, enabling easy content creation and modification.

---

## Table of Contents
1. [Card System](#card-system)
2. [Card Effect Types](#card-effect-types)
3. [Enemy System](#enemy-system)
4. [Enemy Special Actions](#enemy-special-actions)
5. [Relic System](#relic-system)
6. [Relic Trigger Types](#relic-trigger-types)
7. [Status Effects](#status-effects)
8. [Creating New Content](#creating-new-content)

---

## Card System

### Card Types
```javascript
CARD_TYPES = {
  ATTACK: 'attack',   // Deals damage, affected by Strength/Weak
  SKILL: 'skill',     // Utility/Block, affected by Dexterity/Frail
  POWER: 'power',     // Permanent effects, stay in play
  STATUS: 'status',   // Negative cards (Burn, Wound, etc.)
  CURSE: 'curse'      // Very negative cards, hard to remove
}
```

### Card Rarities
```javascript
CARD_RARITY = {
  STARTER: 'starter',     // Starting deck cards
  COMMON: 'common',       // Most frequent drops
  UNCOMMON: 'uncommon',   // Medium frequency
  RARE: 'rare',           // Low frequency, powerful
  SPECIAL: 'special',     // Event/reward only
  STATUS: 'status',       // Status cards
  CURSE: 'curse'          // Curse cards
}
```

### Card Structure
```javascript
{
  id: 'strike',                    // Unique identifier
  name: 'Strike',                  // Display name
  type: CARD_TYPES.ATTACK,         // Card type
  rarity: CARD_RARITY.STARTER,     // Rarity
  cost: 1,                         // Energy cost (-1 for X-cost, 0 for free)
  damage: 6,                       // Base damage (optional)
  block: 0,                        // Base block (optional)
  description: 'Deal 6 damage.',   // Card text

  // Optional properties:
  targetAll: false,                // Hits all enemies
  randomTarget: false,             // Hits random enemy
  hits: 1,                         // Number of damage instances
  draw: 0,                         // Cards to draw
  energy: 0,                       // Energy gained
  exhaust: false,                  // Exhausts when played
  ethereal: false,                 // Exhausts at end of turn if not played
  unplayable: false,               // Cannot be played
  innate: false,                   // Starts in hand
  retain: false,                   // Doesn't discard at end of turn

  effects: [],                     // Status effects to apply
  special: null,                   // Special effect handler

  upgradedVersion: {               // Changes when upgraded
    damage: 9,
    description: 'Deal 9 damage.'
  }
}
```

---

## Card Effect Types

### Basic Effects (Fully Implemented)

| Effect | Property | Example | Description |
|--------|----------|---------|-------------|
| Damage | `damage: N` | `damage: 6` | Deal N damage to target |
| Block | `block: N` | `block: 5` | Gain N block |
| Draw | `draw: N` | `draw: 2` | Draw N cards |
| Energy | `energy: N` | `energy: 1` | Gain N energy |
| Multi-hit | `hits: N` | `hits: 3` | Repeat damage N times |
| Target All | `targetAll: true` | | Hits all enemies |
| Random Target | `randomTarget: true` | | Hits random enemy |
| Exhaust | `exhaust: true` | | Remove from combat |
| Ethereal | `ethereal: true` | | Exhaust if not played |
| HP Cost | `hpCost: N` | `hpCost: 2` | Lose N HP when played |

### Status Effects (via `effects` array)

```javascript
effects: [
  { type: 'vulnerable', amount: 2 },           // Apply to target
  { type: 'weak', amount: 1, self: true },     // Apply to self
  { type: 'strength', amount: 3, target: 'player' }, // Buff self
  { type: 'strengthDown', amount: 2 }          // Reduce enemy strength
]
```

| Type | Target | Description |
|------|--------|-------------|
| `vulnerable` | enemy | +50% damage taken |
| `weak` | any | -25% damage dealt |
| `frail` | player | -25% block gained |
| `strength` | any | +1 damage per attack |
| `dexterity` | player | +1 block per card |
| `strengthDown` | enemy | Reduce strength |

### Special Effects (via `special` property)

| Special | Properties | Description |
|---------|------------|-------------|
| `damageEqualBlock` | - | Body Slam: damage = current block |
| `doubleBlock` | - | Entrench: double current block |
| `limitBreak` | - | Double current strength |
| `barricade` | - | Block persists between turns |
| `demonForm` | `strength: N` | Gain N strength each turn |
| `berserk` | - | Gain 1 energy each turn |
| `rage` | `rageBlock: N` | Gain N block on attack |
| `metallicize` | `block: N` | Gain N block at end of turn |
| `flameBarrier` | `thorns: N` | Deal N damage when attacked |
| `feelNoPain` | `block: N` | Gain N block on exhaust |
| `darkEmbrace` | - | Draw 1 on exhaust |
| `evolve` | `draw: N` | Draw N on Status draw |
| `rupture` | `strength: N` | Gain N strength on HP loss |
| `fireBreathing` | `damage: N` | Deal N damage on Status/Curse draw |
| `corruption` | - | Skills cost 0, exhaust |
| `brutality` | - | Lose 1 HP, draw 1 at turn start |
| `combust` | `hpLoss: N, damage: N` | Lose HP, damage all at turn end |
| `juggernaut` | `damage: N` | Deal N damage when gaining block |
| `doubleTap` | - | Next attack plays twice |
| `addCopyToDiscard` | - | Add copy to discard |
| `addWound` | `wounds: N` | Add N Wounds to draw pile |
| `addDaze` | - | Add Daze to draw pile |
| `addBurn` | - | Add Burn to discard |
| `secondWind` | `blockPer: N` | Exhaust non-attacks, N block each |
| `fiendFire` | `damage: N` | Exhaust hand, N damage per card |
| `feed` | `maxHpGain: N` | Gain N max HP if kills |
| `lifesteal` | - | Heal for damage dealt |
| `spotWeakness` | `strength: N` | Gain N strength if enemy attacking |
| `dropkick` | - | If vulnerable: +1 energy, draw 1 |
| `xCost` | - | Spend all energy |
| `strengthMultiplier` | `multiplier: N` | Multiply strength bonus by N |
| `putCardOnDeck` | - | Select discard card for draw pile |
| `seeingRed` | - | Gain 2 energy, exhaust |
| `offering` | `hpLoss: N, energy: N, draw: N` | Lose HP, gain energy + draw |
| `bloodletting` | `hpLoss: N, energy: N` | Lose HP, gain energy |
| `havoc` | - | Play top card of draw pile |
| `infernalBlade` | - | Add random attack to hand |
| `exhume` | - | Return card from exhaust |
| `severSoul` | - | Exhaust non-attacks in hand |
| `shockwave` | `amount: N` | Vulnerable + Weak to all |
| `powerThrough` | `wounds: N, block: N` | Add wounds to hand, gain block |
| `burningPact` | `exhaust: N, draw: N` | Exhaust cards, draw cards |

---

## Enemy System

### Enemy Structure
```javascript
{
  id: 'jaw_worm',
  name: 'Jaw Worm',
  maxHp: { min: 40, max: 44 },     // HP range
  emoji: ' ',
  type: 'normal',                  // normal, elite, boss, minion
  moveset: [                       // Available moves
    {
      name: 'Chomp',
      intent: INTENT.ATTACK,
      damage: 11
    },
    {
      name: 'Thrash',
      intent: INTENT.ATTACK_DEBUFF,
      damage: 7,
      block: 5
    },
    {
      name: 'Bellow',
      intent: INTENT.BUFF,
      effects: [{ type: 'strength', amount: 3 }],
      block: 6
    }
  ],
  ai: (enemy, turn, lastMove, moveIndex) => {
    // Return move from moveset based on game logic
    return enemy.moveset[moveIndex % enemy.moveset.length];
  }
}
```

### Intent Types
```javascript
INTENT = {
  ATTACK: 'attack',           // Dealing damage
  DEFEND: 'defend',           // Gaining block
  BUFF: 'buff',               // Buffing self
  DEBUFF: 'debuff',           // Debuffing player
  ATTACK_DEBUFF: 'attack_debuff',   // Attack + debuff
  ATTACK_DEFEND: 'attack_defend',   // Attack + block
  UNKNOWN: 'unknown',         // Hidden intent
  SLEEPING: 'sleeping',       // Asleep
  STUNNED: 'stunned'          // Stunned
}
```

### Enemy Move Structure
```javascript
{
  name: 'Move Name',
  intent: INTENT.ATTACK,
  damage: 10,                    // Base damage
  times: 1,                      // Hit count
  block: 0,                      // Block gained
  effects: [                     // Status effects
    { type: 'weak', amount: 1, target: 'player' },
    { type: 'strength', amount: 2 }  // Self buff
  ],
  special: null                  // Special action
}
```

---

## Enemy Special Actions

| Action | Parameters | Description |
|--------|------------|-------------|
| `addSlimed` | `amount: N` | Add N Slimed cards to player's discard |
| `split` | `into: 'small'/'medium'` | Split into smaller slimes |
| `stealGold` | `amount: N` | Steal N gold from player |
| `escape` | - | Remove from combat |
| `explode` | `damage: N` | Deal N damage and die |
| `heal` | `amount: N` | Heal self |
| `healAll` | `amount: N` | Heal all enemies |
| `revive` | `hp: N` | Resurrect with N HP |
| `summon` | `type: 'minion_id'` | Summon minion |
| `buffAllies` | `effect: {}` | Apply buff to all allies |
| `curl` | `thorns: N` | Gain thorns |
| `grow` | `strength: N` | Gain strength |
| `clearDebuffs` | - | Remove all debuffs from self |

---

## Relic System

### Relic Structure
```javascript
{
  id: 'burning_blood',
  name: 'Burning Blood',
  rarity: RELIC_RARITY.STARTER,
  description: 'At the end of combat, heal 6 HP.',
  emoji: ' ',
  trigger: 'onCombatEnd',        // When effect triggers
  effect: {                      // Effect to apply
    type: 'heal',
    amount: 6
  },
  // Optional:
  counter: 0,                    // For counting relics
  threshold: 10,                 // Trigger at this count
  usedThisCombat: false,        // One-time per combat
  used: false,                   // One-time ever
  resetOnTurnEnd: true          // Reset counter each turn
}
```

### Relic Rarities
```javascript
RELIC_RARITY = {
  STARTER: 'starter',    // Starting relic
  COMMON: 'common',      // Frequent drops
  UNCOMMON: 'uncommon',  // Medium drops
  RARE: 'rare',          // Rare drops
  BOSS: 'boss',          // Boss rewards only
  EVENT: 'event',        // Event rewards
  SHOP: 'shop'           // Shop only
}
```

---

## Relic Trigger Types

| Trigger | When | Example Relics |
|---------|------|----------------|
| `onCombatStart` | Combat begins | Anchor, Vajra, Bag of Marbles |
| `onCombatEnd` | Combat ends | Burning Blood, Meat on the Bone |
| `onTurnStart` | Player turn starts | Mercury Hourglass, Horn Cleat |
| `onTurnEnd` | Player turn ends | Orichalcum, Incense Burner |
| `onFirstTurn` | First turn only | Lantern |
| `onAttackPlayed` | Attack card played | Nunchaku, Pen Nib, Kunai |
| `onSkillPlayed` | Skill card played | Letter Opener |
| `onPowerPlayed` | Power card played | - |
| `onStrikePlayed` | Strike played | Strike Dummy |
| `onCardPlayed` | Any card played | - |
| `onExhaust` | Card exhausted | Dead Branch |
| `onDamageTaken` | Player hit | Bronze Scales |
| `onDamageReceived` | Before damage | Torii |
| `onHpLoss` | HP actually lost | Tungsten Rod, Self-Forming Clay |
| `onFirstHpLoss` | First HP loss in combat | Centennial Puzzle |
| `onDeath` | HP reaches 0 | Lizard Tail |
| `onRest` | At rest site | Eternal Feather, Girya |
| `onPickup` | When obtained | Mango |
| `onCardReward` | Card reward screen | Singing Bowl |
| `passive` | Always active | Red Skull, Ice Cream, Snecko Eye |

### Relic Effect Types

| Effect Type | Parameters | Description |
|-------------|------------|-------------|
| `heal` | `amount` | Heal HP |
| `block` | `amount` | Gain block |
| `strength` | `amount` | Gain strength |
| `dexterity` | `amount` | Gain dexterity |
| `energy` | `amount` | Gain energy |
| `draw` | `amount` | Draw cards |
| `damageAll` | `amount` | Damage all enemies |
| `thorns` | `amount` | Deal damage back when hit |
| `vulnerable` | `amount, targetAll` | Apply vulnerable |
| `weak` | `amount, targetAll` | Apply weak |
| `blockIfNone` | `amount` | Block if at 0 block |
| `doubleDamage` | - | Next attack deals double |
| `intangible` | `amount` | Gain intangible |
| `addRandomCard` | - | Add random card to hand |
| `retainBlock` | `amount` | Keep some block |
| `reduceLowDamage` | `threshold` | Reduce small hits to 1 |
| `reduceHpLoss` | `amount` | Reduce HP loss |
| `blockNextTurn` | `amount` | Block at start of next turn |
| `revive` | `amount` (% of max HP) | Revive on death |
| `healIfLowHp` | `amount, threshold` | Heal if below % HP |
| `strengthIfLowHp` | `amount, threshold` | Strength if below % HP |
| `healingBonus` | `amount` | % increase to healing |
| `vulnerableBonus` | `amount` | Extra vulnerable damage |
| `strengthPerCurse` | `amount` | Strength per curse in deck |
| `healPerCards` | `amount, per` | Heal per N cards in deck |
| `drawSpecific` | `cardType` | Draw specific card type |
| `maxHp` | `amount` | Increase max HP |
| `maxHpOption` | `amount` | +Max HP instead of card |
| `strengthOption` | `amount, maxUses` | Strength at rest |
| `energyBonus` | `amount` | +Max energy |
| `conserveEnergy` | - | Keep unspent energy |
| `shopDiscount` | `amount` | Shop price reduction |
| `doubleEliteRelics` | - | Extra relic from elites |
| `removeDebuffsIfAllTypes` | - | Clear debuffs |
| `playCurses` | - | Allow playing curses |
| `confused` | - | Randomize card costs |
| `drawBonus` | `amount` | Draw extra cards |
| `hideIntents` | - | Can't see enemy intents |
| `cardLimit` | `amount` | Max cards per turn |
| `noRest` | - | Can't rest |
| `noGold` | - | Can't gain gold |
| `noPotions` | - | Can't gain potions |
| `curseOnChest` | - | Curse when opening chests |

---

## Status Effects

### Buffs (Positive)

| Effect | Property | Description |
|--------|----------|-------------|
| Strength | `strength` | +1 damage per attack |
| Dexterity | `dexterity` | +1 block per card |
| Artifact | `artifact` | Block 1 debuff application |
| Intangible | `intangible` | Reduce all damage to 1 |
| Thorns | `thorns` | Deal damage when attacked |
| Metallicize | `metallicize` | Gain block at turn end |
| Plated Armor | `platedArmor` | Block each turn, reduced by hits |
| Regen | `regen` | Heal at turn end |
| Barricade | `barricade` | Block persists |
| Rage | `rage` | Block when playing attacks |
| Flame Barrier | `flameBarrier` | Damage attackers this turn |
| Feel No Pain | `feelNoPain` | Block on exhaust |
| Dark Embrace | `darkEmbrace` | Draw on exhaust |
| Demon Form | `demonForm` | Strength each turn |
| Berserk | `berserk` | Energy each turn |
| Brutality | `brutality` | Lose HP, draw card at turn start |
| Combust | `combust` | Lose HP, damage enemies at turn end |
| Double Tap | `doubleTap` | Play next attack twice |
| Evolve | `evolve` | Draw when Status drawn |
| Fire Breathing | `fireBreathing` | Damage on Status/Curse draw |
| Juggernaut | `juggernaut` | Damage random enemy on block |
| Corruption | `corruption` | Skills free + exhaust |
| Rupture | `rupture` | Strength when losing HP |

### Debuffs (Negative)

| Effect | Property | Duration | Description |
|--------|----------|----------|-------------|
| Vulnerable | `vulnerable` | Decrements | +50% damage taken |
| Weak | `weak` | Decrements | -25% damage dealt |
| Frail | `frail` | Decrements | -25% block gained |
| No Draw | `noDrawNextTurn` | 1 turn | Skip draw next turn |

### Enemy-Specific

| Effect | Property | Description |
|--------|----------|-------------|
| Ritual | `ritual` | Gain strength each turn |
| Enrage | `enrage` | Gain strength when hit |
| Curl Up | `curlUp` | Block when first attacked |
| Split | `canSplit` | Splits when HP low |
| Anger | `anger` | Add Anger cards on attack |

---

## Creating New Content

### Adding a New Card

1. Add to `/src/data/cards.js`:

```javascript
{
  id: 'my_new_card',
  name: 'My New Card',
  type: CARD_TYPES.ATTACK,
  rarity: CARD_RARITY.UNCOMMON,
  cost: 2,
  damage: 12,
  description: 'Deal 12 damage. Draw 1 card.',
  draw: 1,
  upgradedVersion: {
    damage: 16,
    draw: 2,
    description: 'Deal 16 damage. Draw 2 cards.'
  }
}
```

2. If using a new `special` effect, add handler in `/src/context/GameContext.jsx`:

```javascript
if (card.special === 'myNewEffect') {
  // Handle the effect
}
```

### Adding a New Enemy

1. Add to `/src/data/enemies.js`:

```javascript
{
  id: 'my_enemy',
  name: 'My Enemy',
  maxHp: { min: 30, max: 35 },
  emoji: ' ',
  type: 'normal',
  moveset: [
    { name: 'Attack', intent: INTENT.ATTACK, damage: 8 },
    { name: 'Defend', intent: INTENT.DEFEND, block: 10 }
  ],
  ai: (enemy, turn) => enemy.moveset[turn % 2]
}
```

2. Add to encounter pools in the same file.

### Adding a New Relic

1. Add to `/src/data/relics.js`:

```javascript
{
  id: 'my_relic',
  name: 'My Relic',
  rarity: RELIC_RARITY.UNCOMMON,
  description: 'When you play 3 cards, gain 1 Strength.',
  emoji: ' ',
  trigger: 'onCardPlayed',
  counter: 0,
  threshold: 3,
  effect: { type: 'strength', amount: 1 },
  resetOnTurnEnd: true
}
```

2. Ensure trigger is handled in `/src/context/GameContext.jsx`.

---

## Quick Reference - All 81 Cards

### Starter (5)
| Name | Cost | Type | Effect |
|------|------|------|--------|
| Strike | 1 | Attack | 6 damage |
| Defend | 1 | Skill | 5 block |
| Bash | 2 | Attack | 8 damage, 2 Vulnerable |
| Strike | 1 | Attack | 6 damage |
| Strike | 1 | Attack | 6 damage |

### Common Attacks (15)
| Name | Cost | Effect |
|------|------|--------|
| Anger | 0 | 6 dmg, add copy to discard |
| Body Slam | 1 | Damage = block |
| Clash | 0 | 14 dmg if only attacks |
| Cleave | 1 | 8 dmg to all |
| Clothesline | 2 | 12 dmg, 2 Weak |
| Headbutt | 1 | 9 dmg, put discard on deck |
| Heavy Blade | 2 | 14 dmg, 3x strength |
| Iron Wave | 1 | 5 dmg, 5 block |
| Perfected Strike | 2 | 6 dmg +2 per Strike |
| Pommel Strike | 1 | 9 dmg, draw 1 |
| Sword Boomerang | 1 | 3 dmg x3 random |
| Thunderclap | 1 | 4 dmg all, 1 Vulnerable all |
| Twin Strike | 1 | 5 dmg x2 |
| Wild Strike | 1 | 12 dmg, add Wound |
| Blood for Blood | 4 | 18 dmg, -1 cost per HP lost |

### Common Skills (10)
| Name | Cost | Effect |
|------|------|--------|
| Armaments | 1 | 5 block, upgrade hand card |
| Flex | 0 | +2 Strength this turn |
| Havoc | 1 | Play top draw pile, exhaust |
| Shrug It Off | 1 | 8 block, draw 1 |
| True Grit | 1 | 7 block, exhaust random |
| Warcry | 0 | Draw 2, put 1 on deck |

### Uncommon Attacks (15)
| Name | Cost | Effect |
|------|------|--------|
| Carnage | 2 | 20 dmg, Ethereal |
| Dropkick | 1 | 5 dmg, if Vulnerable: +E, draw |
| Hemokinesis | 1 | 15 dmg, lose 2 HP |
| Pummel | 1 | 2 dmg x4 |
| Rampage | 1 | 8 dmg, +5 each play |
| Reckless Charge | 0 | 7 dmg, add Daze |
| Searing Blow | 2 | 12 dmg, +4 per upgrade |
| Sever Soul | 2 | 16 dmg, exhaust non-attacks |
| Uppercut | 2 | 13 dmg, 1 Weak, 1 Vulnerable |
| Whirlwind | X | 5 dmg to all x(X+1) |

### Uncommon Skills (12)
| Name | Cost | Effect |
|------|------|--------|
| Battle Trance | 0 | Draw 3, no draw next turn |
| Bloodletting | 0 | Lose 3 HP, gain 2 Energy |
| Burning Pact | 1 | Exhaust 1, draw 2 |
| Disarm | 1 | -2 enemy Strength, exhaust |
| Dual Wield | 1 | Copy attack/power to hand |
| Entrench | 2 | Double block |
| Flame Barrier | 2 | 12 block, 4 Thorns |
| Ghostly Armor | 1 | 10 block, Ethereal |
| Infernal Blade | 1 | Add random attack, exhaust |
| Intimidate | 0 | 1 Weak to all, exhaust |
| Power Through | 1 | 15 block, 2 Wounds to hand |
| Second Wind | 1 | 5 block per non-attack exhausted |
| Seeing Red | 1 | +2 Energy, exhaust |
| Sentinel | 1 | 5 block, 2E if exhausted |
| Shockwave | 2 | 3 Weak+Vuln to all, exhaust |
| Spot Weakness | 1 | +3 Str if attacking, exhaust |

### Uncommon Powers (8)
| Name | Cost | Effect |
|------|------|--------|
| Combust | 1 | Lose 1 HP, 5 dmg all at turn end |
| Corruption | 3 | Skills cost 0, exhaust |
| Dark Embrace | 2 | Draw 1 on exhaust |
| Evolve | 1 | Draw 1 on Status draw |
| Feel No Pain | 1 | 3 block on exhaust |
| Fire Breathing | 1 | 6 dmg on Status/Curse draw |
| Inflame | 1 | +2 Strength |
| Metallicize | 1 | 3 block at turn end |
| Rupture | 1 | +1 Str when losing HP to cards |

### Rare Attacks (10)
| Name | Cost | Effect |
|------|------|--------|
| Bludgeon | 3 | 32 damage |
| Feed | 1 | 10 dmg, +3 Max HP if kills |
| Fiend Fire | 2 | 7 dmg x cards in hand, exhaust all |
| Immolate | 2 | 21 dmg to all, add Burn |
| Reaper | 2 | 4 dmg to all, heal for damage |

### Rare Skills (6)
| Name | Cost | Effect |
|------|------|--------|
| Exhume | 1 | Return exhausted card |
| Impervious | 2 | 30 block, exhaust |
| Limit Break | 1 | Double Strength, exhaust |
| Offering | 0 | Lose 6 HP, +2E, draw 3 |

### Rare Powers (8)
| Name | Cost | Effect |
|------|------|--------|
| Barricade | 3 | Block persists |
| Berserk | 0 | 2 Vulnerable, +1E per turn |
| Brutality | 0 | Lose 1 HP, draw 1 at turn start |
| Demon Form | 3 | +2 Strength per turn |
| Double Tap | 1 | Next attack plays twice |
| Juggernaut | 2 | 5 dmg on block gain |
| Rage | 0 | 3 block on attack played |

### Status Cards (4)
| Name | Cost | Effect |
|------|------|--------|
| Burn | U | Unplayable. Take 2 dmg at turn end |
| Dazed | U | Unplayable. Ethereal |
| Slimed | 1 | Exhaust |
| Wound | U | Unplayable |

### Curse Cards (5)
| Name | Cost | Effect |
|------|------|--------|
| Ascender's Bane | U | Unplayable. Cannot be removed |
| Clumsy | U | Unplayable. Ethereal |
| Decay | U | Unplayable. Take 2 dmg at turn end |
| Doubt | U | Unplayable. 1 Weak at turn end |
| Regret | U | Unplayable. Lose HP = hand size |

---

## Quick Reference - All 34 Enemies

### Normal (18)
| Name | HP | Key Moves |
|------|-----|-----------|
| Jaw Worm | 40-44 | 11 dmg, 7+5 block, +3 Str |
| Cultist | 48-54 | 6 dmg, +3 Ritual |
| Louse (Red) | 10-15 | 5-7 dmg, +3 Str |
| Louse (Green) | 11-17 | 5-7 dmg, Weak |
| Acid Slime (S) | 8-12 | 3 dmg, 1 Weak |
| Spike Slime (S) | 10-14 | 5 dmg, Slimed |
| Acid Slime (M) | 28-32 | 7 dmg, 1 Weak, Slimed |
| Spike Slime (M) | 28-32 | 8 dmg, Slimed |
| Fungi Beast | 22-28 | 6 dmg, +3 Str |
| Fat Gremlin | 13-17 | 4 dmg, 1 Weak |
| Mad Gremlin | 20-24 | 4 dmg +1 Angry |
| Shield Gremlin | 12-15 | 6 dmg or 7 block |
| Sneaky Gremlin | 10-14 | 9 dmg |
| Wizard Gremlin | 23-25 | 25 dmg (charged) |
| Sentry | 38-42 | 9 dmg, Daze |
| Looter | 44-48 | 10 dmg, steals gold, escapes |
| Mugger | 48-52 | 10 dmg, steals gold |
| Slaver (Blue) | 46-50 | 12 dmg, 1 Weak |

### Elite (8)
| Name | HP | Key Moves |
|------|-----|-----------|
| Gremlin Nob | 82-86 | 14 dmg, +2 Enrage, 8 Rush |
| Lagavulin | 109-111 | 18 dmg, 8 block, -1 Str/Dex |
| 3 Sentries | 38-42 | 9 dmg, Daze, alternating |
| Book of Stabbing | 160-168 | Multi-stab, +book |
| Gremlin Leader | 140-148 | 6 dmg x3, summons |
| Taskmaster | 54-58 | 7 dmg, 2 Wounds |
| Giant Head | 500-520 | Count to 5, 40 dmg |
| Nemesis | 185-200 | 6 dmg x3, 45 dmg |

### Boss (7)
| Name | HP | Key Moves |
|------|-----|-----------|
| Slime Boss | 140-150 | 35 dmg, Slimed x3, splits |
| The Guardian | 240-250 | 32 dmg, 9 block, Mode shift |
| Hexaghost | 250-260 | 2 dmg x6, 6 Burn, charge |
| The Champ | 420-440 | 18 dmg, Taunt, Execute |
| Collector | 282-300 | 18 dmg, summons torches |
| Automaton | 300-320 | 7 dmg x2, Hyper Beam |
| Donu & Deca | 250+250 | Multi-attack, buffs, debuffs |

---

## Quick Reference - All 47 Relics

### Starter (1)
| Name | Effect |
|------|--------|
| Burning Blood | Heal 6 HP at combat end |

### Common (13)
| Name | Effect |
|------|--------|
| Anchor | Start combat with 10 Block |
| Bag of Preparation | Draw 2 extra at combat start |
| Blood Vial | Heal 2 HP at combat start |
| Bronze Scales | Deal 3 damage when hit |
| Centennial Puzzle | Draw 3 on first HP loss |
| Lantern | +1 Energy on first turn |
| Nunchaku | +1 Energy per 10 attacks |
| Oddly Smooth Stone | +1 Dexterity at combat start |
| Orichalcum | 6 Block if ending at 0 |
| Pen Nib | Every 10th attack: 2x damage |
| Vajra | +1 Strength at combat start |
| Red Skull | +3 Strength below 50% HP |
| Bag of Marbles | 1 Vulnerable to all at start |

### Uncommon (14)
| Name | Effect |
|------|--------|
| Blue Candle | Play Curses (exhaust, -1 HP) |
| Bottled Flame | Selected Attack in starting hand |
| Eternal Feather | +3 HP per 5 deck cards at rest |
| Horn Cleat | 14 Block on turn 2 |
| Kunai | +1 Dex per 3 attacks/turn |
| Letter Opener | 5 dmg all per 3 skills/turn |
| Meat on the Bone | Heal 12 if below 50% at end |
| Mercury Hourglass | 3 dmg to all at turn start |
| Ornamental Fan | 4 Block per 3 attacks/turn |
| Paper Phrog | Vulnerable = 75% more damage |
| Self-Forming Clay | 3 Block next turn on HP loss |
| Shuriken | +1 Str per 3 attacks/turn |
| Singing Bowl | +2 Max HP instead of card |
| Strike Dummy | +3 damage on Strikes |
| Torii | 5 or less damage becomes 1 |

### Rare (10)
| Name | Effect |
|------|--------|
| Calipers | Keep Block - 15 |
| Dead Branch | Random card on exhaust |
| Du-Vu Doll | +1 Str per curse |
| Girya | Gain Str at rest (3 uses) |
| Ice Cream | Conserve energy |
| Incense Burner | Intangible every 6 turns |
| Lizard Tail | Revive at 50% HP once |
| Magic Flower | +50% healing |
| Mango | +14 Max HP |
| Tungsten Rod | -1 HP loss |

### Boss (8)
| Name | Effect |
|------|--------|
| Black Star | Double elite relics |
| Coffee Dripper | +1 Energy, no rest |
| Cursed Key | +1 Energy, curse on chest |
| Ectoplasm | +1 Energy, no gold |
| Runic Dome | +1 Energy, no intents |
| Snecko Eye | +2 draw, Confused |
| Sozu | +1 Energy, no potions |
| Velvet Choker | +1 Energy, 6 card limit |

### Shop (2)
| Name | Effect |
|------|--------|
| Membership Card | 50% shop discount |
| Orange Pellets | Clear debuffs if all types played |

---

*Last Updated: Generated by Audit System*
