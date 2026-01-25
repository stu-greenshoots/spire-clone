# Data Architecture: Engine-Agnostic Design

**Status:** DRAFT
**Created:** 2026-01-25
**Goal:** Ensure game data is portable to any engine (Unity, Godot, Swift, etc.)

---

## Principle

> All game content and rules should be defined in **data files**, not **code**.
> The engine (React, Unity, whatever) is just a runtime that interprets the data.

---

## Current State Audit

### What's Already Data-Driven ✓
- `src/data/cards.js` - Card definitions
- `src/data/enemies.js` - Enemy definitions
- `src/data/relics.js` - Relic definitions
- `src/data/potions.js` - Potion definitions
- `src/data/events.js` - Event definitions
- `src/data/keywords.js` - Keyword definitions

### What's Hardcoded in Logic ✗
- Damage calculation formula (in combatSystem.js)
- Status effect behavior (scattered)
- AI patterns (in enemy definitions, but executed in JS)
- Combat flow (in reducers)
- Card effect execution (in effectProcessor.js)

### What Needs Extraction
- Combat rules → `data/rules/combat.json`
- Status effects → `data/rules/statusEffects.json`
- Balance constants → `data/balance.json`
- Encounter tables → `data/encounters.json`

---

## Target Data Structure

```
data/
├── cards/
│   ├── attacks.json
│   ├── skills.json
│   ├── powers.json
│   └── curses.json
├── enemies/
│   ├── act1/
│   │   ├── normal.json
│   │   ├── elites.json
│   │   └── bosses.json
│   ├── act2/
│   └── act3/
├── relics/
│   ├── common.json
│   ├── uncommon.json
│   ├── rare.json
│   └── boss.json
├── potions.json
├── events/
│   ├── act1.json
│   ├── act2.json
│   └── act3.json
├── rules/
│   ├── combat.json       # Damage formulas, turn order
│   ├── statusEffects.json # How each status works
│   └── keywords.json     # Keyword definitions
├── balance.json          # All tunable numbers
├── encounters.json       # What spawns where
└── scenarios/            # Test scenarios (from State Builder)
    ├── combat-basic.json
    ├── combat-boss.json
    └── ...
```

---

## Card Data Format

Current (JS):
```javascript
{
  id: 'bash',
  name: 'Bash',
  type: 'attack',
  cost: 2,
  damage: 8,
  rarity: 'basic',
  description: 'Deal 8 damage. Apply 2 Vulnerable.',
  effects: [
    { type: 'damage', amount: 8 },
    { type: 'applyStatus', status: 'vulnerable', amount: 2 }
  ]
}
```

Target (JSON, more explicit):
```json
{
  "id": "bash",
  "name": "Bash",
  "type": "attack",
  "cost": 2,
  "rarity": "basic",
  "targetType": "single_enemy",
  "effects": [
    {
      "type": "damage",
      "base": 8,
      "scaling": {
        "stat": "strength",
        "multiplier": 1
      }
    },
    {
      "type": "apply_status",
      "status": "vulnerable",
      "amount": 2,
      "target": "same"
    }
  ],
  "upgraded": {
    "name": "Bash+",
    "effects": [
      { "type": "damage", "base": 10 },
      { "type": "apply_status", "status": "vulnerable", "amount": 3 }
    ]
  },
  "art": {
    "sprite": "cards/bash.png",
    "icon": "icons/bash.png"
  },
  "audio": {
    "play": "sfx/bash.mp3"
  },
  "description": {
    "template": "Deal {damage} damage. Apply {vulnerable} Vulnerable.",
    "variables": {
      "damage": "effects[0].base",
      "vulnerable": "effects[1].amount"
    }
  }
}
```

---

## Enemy Data Format

Target (JSON):
```json
{
  "id": "jaw_worm",
  "name": "Jaw Worm",
  "type": "normal",
  "act": 1,
  "hp": {
    "base": 40,
    "variance": 4,
    "ascensionScaling": {
      "1": 1.1,
      "7": 1.2
    }
  },
  "art": {
    "sprite": "enemies/jaw_worm.png",
    "size": { "width": 64, "height": 64 }
  },
  "moveset": [
    {
      "id": "chomp",
      "weight": 45,
      "intent": "attack",
      "effects": [
        { "type": "damage", "base": 11 }
      ]
    },
    {
      "id": "thrash",
      "weight": 30,
      "intent": "attack_defend",
      "effects": [
        { "type": "damage", "base": 7 },
        { "type": "block", "base": 5 }
      ]
    },
    {
      "id": "bellow",
      "weight": 25,
      "intent": "buff",
      "effects": [
        { "type": "apply_status", "status": "strength", "amount": 3, "target": "self" },
        { "type": "block", "base": 6 }
      ]
    }
  ],
  "ai": {
    "type": "weighted_random",
    "rules": [
      { "condition": "first_turn", "force_move": "chomp", "probability": 0.75 }
    ]
  }
}
```

---

## Status Effect Data Format

```json
{
  "vulnerable": {
    "name": "Vulnerable",
    "type": "debuff",
    "icon": "icons/vulnerable.png",
    "description": "Take 50% more damage from attacks.",
    "behavior": {
      "damageModifier": {
        "incoming": 1.5,
        "type": "attack"
      },
      "duration": "turns",
      "decrement": "end_of_turn",
      "removeAt": 0
    }
  },
  "strength": {
    "name": "Strength",
    "type": "buff",
    "icon": "icons/strength.png",
    "description": "Adds damage to attacks.",
    "behavior": {
      "damageModifier": {
        "outgoing": "additive",
        "perStack": 1,
        "type": "attack"
      },
      "duration": "permanent",
      "decrement": "never"
    }
  }
}
```

---

## Combat Rules Data Format

```json
{
  "damage_calculation": {
    "order": [
      "base_damage",
      "add_strength",
      "apply_weak_penalty",
      "apply_vulnerable_bonus"
    ],
    "formulas": {
      "weak_penalty": "floor(damage * 0.75)",
      "vulnerable_bonus": "floor(damage * 1.5)"
    }
  },
  "turn_order": {
    "player_turn": [
      "decrement_status_start",
      "trigger_start_of_turn_relics",
      "trigger_start_of_turn_powers",
      "draw_cards",
      "player_actions",
      "end_turn_button",
      "discard_hand",
      "trigger_end_of_turn_effects"
    ],
    "enemy_turn": [
      "execute_enemy_intents_sequential",
      "decrement_enemy_status",
      "calculate_next_intents"
    ]
  },
  "energy": {
    "base": 3,
    "refill": "start_of_turn"
  },
  "draw": {
    "base": 5,
    "trigger": "start_of_turn"
  }
}
```

---

## Balance Constants

```json
{
  "player": {
    "starting_hp": 80,
    "starting_gold": 99,
    "potion_slots": 3,
    "starting_deck": ["strike", "strike", "strike", "strike", "strike", "defend", "defend", "defend", "defend", "bash"]
  },
  "combat": {
    "cards_drawn_per_turn": 5,
    "energy_per_turn": 3
  },
  "rewards": {
    "gold": {
      "normal": { "base": 10, "variance": 5 },
      "elite": { "base": 25, "variance": 5 },
      "boss": { "base": 100, "variance": 0 }
    },
    "cards_offered": 3,
    "rare_chance": 0.03,
    "uncommon_chance": 0.37
  },
  "shop": {
    "card_price_multiplier": 1.0,
    "relic_price_multiplier": 1.0,
    "removal_cost": 75
  },
  "rest": {
    "heal_percent": 0.3
  },
  "ascension": {
    "1": { "enemy_hp_mult": 1.1 },
    "2": { "start_with_wound": 1 },
    "3": { "elite_damage_mult": 1.2 },
    "4": { "rest_heal_mult": 0.83 },
    "5": { "boss_enhanced": true }
  }
}
```

---

## Test Scenarios Format

```json
{
  "id": "combat-boss-hexaghost",
  "name": "Boss Fight: Hexaghost",
  "description": "Act 1 boss with mid-game deck",
  "state": {
    "phase": "COMBAT",
    "floor": 15,
    "act": 1,
    "player": {
      "currentHp": 45,
      "maxHp": 80,
      "gold": 200,
      "block": 0,
      "energy": 3,
      "strength": 0,
      "dexterity": 0
    },
    "enemies": [
      { "id": "hexaghost", "currentHp": 250, "maxHp": 250 }
    ],
    "hand": ["strike", "strike", "defend", "bash", "offering"],
    "deck": ["strike", "strike", "defend", "defend", "shrug_it_off", "pommel_strike"],
    "drawPile": [],
    "discardPile": [],
    "relics": ["burning_blood", "vajra"],
    "potions": ["fire_potion", null, "block_potion"]
  },
  "testChecks": {
    "mobile_layout": true,
    "touch_targets": true,
    "boss_visible": true,
    "intent_visible": true
  }
}
```

---

## Migration Plan

### Phase 1: Extract to JSON (Keep JS Loaders)
- Convert `cards.js` → `cards.json` + loader
- Convert `enemies.js` → `enemies.json` + loader
- etc.

### Phase 2: Centralize Rules
- Extract damage formulas to `rules/combat.json`
- Extract status behaviors to `rules/statusEffects.json`
- Game logic reads from JSON, doesn't hardcode

### Phase 3: Scenario Library
- All test scenarios in `data/scenarios/`
- State Builder saves to this format
- E2E tests load scenarios from JSON

---

## Engine Rebuild Checklist

If rebuilding in Unity/Godot/Swift:

```
✓ Copy data/ folder entirely
✓ Copy public/assets/ folder entirely
✓ Implement JSON loaders for new engine
✓ Implement effect processor (reads effect definitions)
✓ Implement AI processor (reads moveset definitions)
✓ Implement damage calculator (reads rules/combat.json)
✓ Build UI layer for new platform
✓ Run same test scenarios, compare results
```

---

## Benefits

1. **Portability** - Data works in any engine
2. **Modding** - Users could mod by editing JSON
3. **Balance** - Tweak numbers without code changes
4. **Testing** - Scenarios are just JSON files
5. **Validation** - JSON schemas can validate data
6. **Documentation** - Data files ARE the documentation

---

*This is the target architecture. Migration happens incrementally as we touch each system.*
