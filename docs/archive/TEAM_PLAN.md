# Spire Ascent - Team Sprint Plan

**From:** Lead Engineer (Mentor)
**To:** The Team of 8
**Date:** 2026-01-23
**Status:** Ready for Assignment

---

## Honest Assessment

Right, here's where you're at. You've built a working prototype with solid bones - 81 cards, 34 enemies, 47 relics, a combat system that actually works, and 289 passing tests. That's not nothing. But let me be straight: **this plays like a tech demo, not a game people would choose to spend time with.** The difference between where you are and something someone would recommend to a friend is mostly feel, polish, and soul.

Your biggest technical sin is `GameContext.jsx` at 2,219 lines with a single reducer handling everything. That's a ticking time bomb - every new feature makes it worse, and debugging state bugs in there is going to cost you.

The game has no personality. Five sound effects. No music. Events are shallow. There's no reason for a player to care about their run beyond "numbers go up." Slay the Spire works because every decision feels meaningful and the feedback loop is tight. You need to close that gap.

Here's what each of you should be doing. Every task below will make a **noticeable** difference to someone playing the game.

---

## Team Roster & Assignments

### PM - Project Manager
### GD - Graphic Designer (OpenAI Art)
### UX - UX Guy
### SL - Story Line
### BE - Back Ender (Architecture)
### JR - Keen Junior
### AR - Allrounder (the arse)
### QA - Tester

---

## Phase 1: Foundation & Feel (Sprint 1-2)

> Goal: Make the game FEEL good to play. Right now combat is functional but lifeless.

---

### BE-01: Split GameContext into Domain Reducers
**Owner:** Back Ender
**Impact:** Enables the whole team to work without merge conflicts, makes bugs traceable, improves performance via targeted re-renders

Your `GameContext.jsx` is 2,219 lines. The PLAY_CARD case alone is enormous. Split it:

```
src/context/
├── GameContext.jsx          (orchestrator, ~200 lines)
├── reducers/
│   ├── combatReducer.js     (PLAY_CARD, END_TURN, enemy actions)
│   ├── mapReducer.js        (SELECT_NODE, map generation)
│   ├── shopReducer.js       (BUY_CARD, BUY_RELIC, BUY_POTION)
│   ├── rewardReducer.js     (card selection, gold, relics)
│   └── metaReducer.js       (game phase, settings, save/load)
```

Each reducer handles its own slice of state. GameContext combines them with `useReducer` composition or a simple dispatch router.

**Acceptance criteria:**
- No single reducer file over 500 lines
- All 289 existing tests still pass
- No functional regression (play through a full run)
- Each reducer is independently testable

---

### BE-02: Normalize Game State
**Owner:** Back Ender
**Impact:** Eliminates duplicated enemy/card objects that cause stale state bugs

Currently enemies and cards are stored as nested arrays with duplicated data. Move to normalized IDs:

```javascript
// Before (bad):
enemies: [{ id: 'cultist', hp: 48, ... }, { id: 'cultist', hp: 52, ... }]

// After (good):
enemyIds: ['enemy_0', 'enemy_1'],
enemiesById: {
  'enemy_0': { definitionId: 'cultist', hp: 48, ... },
  'enemy_1': { definitionId: 'cultist', hp: 52, ... }
}
```

**Acceptance criteria:**
- Enemy and card instances use unique IDs
- Definitions (data/cards.js, data/enemies.js) remain static lookups
- Combat operations reference by ID, not array index

---

### UX-01: Combat Feedback Overhaul
**Owner:** UX Guy
**Impact:** Makes every card play feel impactful instead of "I clicked and numbers changed"

The animations exist in App.css but the combat screen doesn't leverage them well. Fix:

1. **Card play confirmation:** Card flies to target with a satisfying arc, not just disappearing
2. **Damage feedback:** Enemy flashes red, shakes, damage number pops up AND floats away (you have `damageFloat` keyframe - use it properly)
3. **Block feedback:** Shield icon appears with block number when block is gained
4. **Kill feedback:** Enemy death should feel weighty - flash, shrink, fade with particles
5. **Turn indicator:** Clear visual showing "YOUR TURN" vs enemy intent phase
6. **Energy spending:** Energy orbs should visually drain as you play cards

**Acceptance criteria:**
- Playing a card takes 400-600ms of visual feedback before resolving
- Player can visually track what happened without reading the combat log
- No animation blocks gameplay (all skippable/fast-forwardable)

---

### UX-02: Card Information Hierarchy
**Owner:** UX Guy
**Impact:** Players understand what cards do without memorizing keywords

1. **Keyword tooltips:** Hovering over "Vulnerable", "Weak", "Exhaust" etc. shows explanation
2. **Damage preview:** When hovering a card, show the ACTUAL damage it would deal (after strength, vulnerable, etc.) not just base damage
3. **Card pile viewers:** Clicking draw/discard pile shows cards with a proper grid layout, not just a list
4. **Upgrade preview:** At rest sites, show before/after of card upgrade side by side

**Acceptance criteria:**
- New player can understand every card's effect without external reference
- Damage preview accounts for all modifiers (strength, weak, vulnerable, relics)

---

### GD-01: Enemy Art Consistency Pass
**Owner:** Graphic Designer
**Impact:** Enemies feel like they belong in the same world instead of random AI generations

Right now you have emojis as enemy display with some art assets. Generate a consistent set:

1. **Style guide first:** Pick ONE art style - suggest dark fantasy painted style, consistent lighting from top-left, muted backgrounds, character fills 80% of frame
2. **Act 1 enemies (15):** All normal + elite enemies need art in consistent style
3. **Act 1 boss:** Needs a larger, more detailed piece
4. **Size consistency:** Normal enemies: 256x256, Elites: 384x384, Bosses: 512x512
5. **Idle animation frames:** Generate 2-3 frames per enemy for subtle breathing/movement (slight variations of same image)

**Prompt template for OpenAI:**
```
"Dark fantasy [enemy_name], painted illustration style, dramatic top-left lighting,
muted dark background, character centered filling 80% of frame, card game art style,
[specific_details]. No text, no border, square aspect ratio."
```

**Acceptance criteria:**
- All Act 1 enemies have art (not emojis)
- Consistent style across all pieces (same prompt structure, same settings)
- Transparent or easily-removable backgrounds
- Files named: `enemy_[id].png` matching enemy definitions

---

### GD-02: Card Frame & Type Visual System
**Owner:** Graphic Designer
**Impact:** Cards are instantly recognizable by type without reading the text

Design card frames:
1. **Attack cards:** Red/orange border with sword motif
2. **Skill cards:** Blue/green border with shield motif
3. **Power cards:** Gold/yellow border with crown motif
4. **Curse cards:** Purple/dark border with thorns
5. **Status cards:** Grey border, cracked appearance
6. **Upgraded indicator:** Subtle glow or gem on upgraded cards

Each frame should have a window for the card art, name area, cost circle, and description area.

**Acceptance criteria:**
- Player can identify card type at a glance from hand
- Frames work at both full size and thumbnail size
- Rarity indicated via frame detail (common=plain, rare=ornate)

---

### AR-01: Audio System Expansion
**Owner:** Allrounder
**Impact:** Sound transforms the game from "clicking buttons" to "playing a game." This is the single highest-impact polish item.

You have 5 sounds. You need at minimum 25. Source from free libraries (freesound.org, OpenGameArt) or generate:

**Priority sounds:**
1. Card draw (whoosh)
2. Card hover (subtle tick)
3. Turn start chime
4. Turn end swoosh
5. Enemy intent reveal (subtle menacing tone)
6. Block hit (metallic clang, different from damage)
7. Heavy hit (for 15+ damage)
8. Critical/overkill (satisfying crunch)
9. Heal (warm shimmer)
10. Buff applied (positive sting)
11. Debuff applied (negative sting)
12. Energy gain (power-up tone)
13. Gold pickup (coins, you have this)
14. Relic pickup (magical item sound)
15. Map node select (click/confirm)
16. Shop purchase (register/cha-ching)
17. Boss encounter (dramatic sting)
18. Victory fanfare (short, triumphant)
19. Defeat sound (somber)
20. Card exhaust (flame/dissolve)
21. Card upgrade (crystalline enhancement)
22. Shuffle sound (for deck shuffle)
23. Poison tick (bubbling)
24. Vulnerable applied (glass crack)
25. Background ambience (subtle loop per area)

**Plus:** One looping music track per game phase:
- Menu theme (mysterious, inviting)
- Map/exploration (calm, contemplative)
- Normal combat (tense, rhythmic)
- Elite combat (faster, more intense)
- Boss combat (dramatic, epic)
- Shop (relaxed, safe)
- Rest site (peaceful)

**Implementation:**
- Extend `audioSystem.js` with volume categories (SFX, Music, Master)
- Add proper fade in/out for music transitions
- Preload combat sounds, lazy-load others

**Acceptance criteria:**
- Every player action has audio feedback
- Music changes based on game phase
- Volume controls work (SFX/Music/Master sliders)
- No audio pop/click on transitions

---

### SL-01: Event System Rewrite
**Owner:** Story Line
**Impact:** Events are currently boring stat checks. They should be the moments players remember and talk about.

Write 20 meaningful events with real choices. Each event needs:
- **Flavor text** that builds the world
- **2-3 choices** with genuine trade-offs (not "good option vs bad option")
- **Consequences** that affect the run meaningfully

**Event templates:**

```javascript
{
  id: 'the_forgotten_altar',
  title: 'The Forgotten Altar',
  description: 'A crumbling altar stands before you, its surface stained with old offerings. The air hums with residual power. Strange runes pulse with a faint, hungry light.',
  choices: [
    {
      text: 'Offer 10% of your max HP as tribute',
      effect: { loseHpPercent: 10, gainRelic: 'random_uncommon' },
      result: 'Blood pools in the carved channels. The altar shudders and produces a glowing artifact.'
    },
    {
      text: 'Smash the altar',
      effect: { gainGold: 50, addCurse: 'decay' },
      result: 'Stone shatters. Gold coins spill from within, but a dark mist seeps into your pack.'
    },
    {
      text: 'Study the runes carefully',
      effect: { upgradeRandomCard: true },
      result: 'The patterns reveal a technique you hadn\'t considered. Your understanding deepens.'
    }
  ]
}
```

**Required events (minimum 20):**

| # | Event | Theme | Choices involve |
|---|-------|-------|----------------|
| 1 | The Forgotten Altar | Sacrifice | HP vs Relic vs Knowledge |
| 2 | Wounded Adventurer | Mercy | Gold vs Card vs Karma |
| 3 | The Living Wall | Obstacle | Remove card vs Upgrade vs Transform |
| 4 | Merchant's Ghost | Commerce | Discount vs Free relic vs Curse |
| 5 | The Mirror Pool | Identity | Duplicate card vs Heal vs See future |
| 6 | Mushroom Grove | Nature | Buff vs Heal vs Poison |
| 7 | Ancient Library | Knowledge | 1 of 3 rare cards |
| 8 | The Colosseum | Challenge | Mini-fight vs Watch vs Flee |
| 9 | Trapped Chest | Greed | Relic+curse vs Gold vs Nothing |
| 10 | Ethereal Portal | Chaos | Random transform vs Skip |
| 11 | The Burning Cage | Morality | Free prisoner vs Loot vs Leave |
| 12 | Stone Guardians | Trial | Answer riddle vs Fight vs Sneak |
| 13 | Abandoned Camp | Survival | Rest vs Loot vs Both(risk) |
| 14 | The Architect | Building | Remove 2 cards vs Add rare |
| 15 | Blood Fountain | Temptation | Full heal+curse vs Partial heal |
| 16 | The Nest | Discovery | Eggs(relic) vs Flee(safe) |
| 17 | Traveling Merchant | Opportunity | Unique card vs Unique relic |
| 18 | Ancient Training | Growth | +2 str or +2 dex permanently |
| 19 | The Void | Risk | Lose relic vs Gain 2 relics |
| 20 | Forgotten Armory | Equipment | 3 card choices (one per type) |

**Acceptance criteria:**
- 20+ events implemented and playable
- Each event has flavor text that builds the world
- No "obvious best choice" - each option has trade-offs
- Events reference the world consistently (same setting, same tone)

---

### SL-02: World Building & Card Flavor
**Owner:** Story Line
**Impact:** Gives the game personality. Right now it's mechanics without soul.

1. **Name the setting:** The Spire needs a name, a reason to exist, a history
2. **Card flavor text:** Add one-line flavor quotes to all 81 cards
3. **Enemy descriptions:** Each enemy gets a 1-2 sentence description for bestiary
4. **Relic lore:** Each relic gets an origin story (1-2 sentences)
5. **Boss introductions:** 2-3 lines of dialogue/description when encountering a boss

Example card flavor:
```javascript
{
  id: 'bash',
  // ... existing properties
  flavor: '"Technique is overrated." - Gronk, Arena Champion'
}
```

**Acceptance criteria:**
- Every card has flavor text
- Setting has a name and 1-paragraph description
- Tone is consistent (dark fantasy with dry humor)

---

### JR-01: Potion System Implementation
**Owner:** Junior
**Impact:** Adds a major strategic layer (potions are a core part of Spire's decision-making)

Potions are mentioned in the codebase but incomplete. Implement:

**Data structure:**
```javascript
// src/data/potions.js
export const potions = [
  {
    id: 'fire_potion',
    name: 'Fire Potion',
    rarity: 'common',
    description: 'Deal 20 damage to a target enemy.',
    effect: { damage: 20, target: 'single' },
    usableIn: 'combat'
  },
  // ... 15+ potions
];
```

**Potions to implement (15):**

| Potion | Rarity | Effect |
|--------|--------|--------|
| Fire Potion | Common | Deal 20 damage |
| Block Potion | Common | Gain 12 block |
| Energy Potion | Common | Gain 2 energy |
| Swift Potion | Common | Draw 3 cards |
| Strength Potion | Common | +2 Strength this combat |
| Dexterity Potion | Common | +2 Dexterity this combat |
| Fear Potion | Common | Apply 3 Vulnerable to all |
| Weak Potion | Common | Apply 3 Weak to all |
| Regen Potion | Uncommon | Gain 5 Regen |
| Ancient Potion | Uncommon | Gain 1 Artifact |
| Liquid Bronze | Uncommon | Gain 3 Thorns |
| Gamblers Brew | Uncommon | Discard hand, draw equal cards |
| Essence of Steel | Uncommon | Gain 4 Plated Armor |
| Fairy in a Bottle | Rare | Auto-use on death: heal 30% |
| Fruit Juice | Rare | Gain 5 max HP |

**UI needed:**
- 3 potion slots visible during combat (below player HP)
- Click potion to activate, click enemy to target (if needed)
- Potion belt visible on map screen
- Potions as possible combat rewards (20% chance)
- Potions purchasable in shop

**Acceptance criteria:**
- 15 potions implemented and functional
- Potion UI shows slots with current potions
- Potions work correctly in combat
- Potions drop from combats and are in shop
- Tests for all potion effects

---

### JR-02: Card Upgrade System Polish
**Owner:** Junior
**Impact:** Upgrading cards should feel rewarding, not just "numbers went up"

Current upgrade system exists but needs polish:

1. **Visual upgrade indicator:** Upgraded cards show a + after name and have a green tint/shimmer
2. **Upgrade animation:** Quick sparkle/glow effect when card is upgraded
3. **Preview comparison:** Rest site shows card before AND after upgrade side-by-side
4. **Upgrade all path:** Some relics/events should allow upgrading multiple cards
5. **Upgrade tracking:** Track total upgrades per run for stats

**Acceptance criteria:**
- Upgraded cards are visually distinct from non-upgraded
- Rest site upgrade selection shows what will change
- Animation plays on upgrade

---

### QA-01: Component Test Coverage
**Owner:** Tester
**Impact:** Currently 289 tests but they're all unit/system tests. The UI is untested.

Write tests for the critical user paths:

**Priority test suites:**

```
src/test/
├── components/
│   ├── CombatScreen.test.jsx    # Card selection, play, targeting
│   ├── MapScreen.test.jsx       # Node selection, path validation
│   ├── ShopScreen.test.jsx      # Purchase flow, insufficient gold
│   ├── RestSite.test.jsx        # Heal vs upgrade choice
│   ├── RewardScreen.test.jsx    # Card selection, skip
│   ├── Card.test.jsx            # Render states, hover, click
│   └── Enemy.test.jsx           # Intent display, health bar
├── integration/
│   ├── fullRun.test.jsx         # Simulate: menu → combat → reward → map → next
│   ├── combatFlow.test.jsx      # Full combat: draw → play → end turn → enemy
│   └── deckBuilding.test.jsx    # Add card → upgrade → use in combat
```

**Test scenarios that MUST exist:**
1. Playing a card reduces energy and moves card to discard
2. Killing all enemies triggers reward phase
3. Player death triggers game over
4. Block reduces damage before HP
5. Status effects apply and decrement correctly
6. Multi-hit cards hit correct number of times
7. Exhaust cards don't return to discard
8. Draw pile shuffles discard when empty
9. Rest site heal restores correct amount
10. Shop purchase deducts gold and adds item

**Acceptance criteria:**
- 30+ new component/integration tests
- All critical paths covered (combat, map, shop, rest, reward)
- Test coverage rises to 40%+ statements
- Tests run in under 30 seconds total

---

### QA-02: Balance Testing Framework
**Owner:** Tester
**Impact:** Currently no way to know if game is balanced without playing hundreds of runs

Build an automated simulation that runs combat encounters:

```javascript
// src/test/balance/simulator.js
function simulateRun(config = {}) {
  // Create initial deck
  // For each floor:
  //   - Generate encounter
  //   - Simulate combat (play highest-value card each turn)
  //   - Track HP remaining, turns taken, cards played
  // Return: { survived: bool, floorsCleared, hpHistory, turnsPerCombat }
}

function runBalanceTest(runs = 1000) {
  const results = Array(runs).fill(null).map(() => simulateRun());
  return {
    winRate: results.filter(r => r.survived).length / runs,
    avgFloors: avg(results.map(r => r.floorsCleared)),
    avgTurnsPerCombat: avg(results.flatMap(r => r.turnsPerCombat)),
    deadlyEncounters: findSpikes(results) // Which enemies kill most often
  };
}
```

**Acceptance criteria:**
- Simulator can run 1000 automated runs
- Output shows win rate, floor distribution, deadly encounters
- Can run with different deck configurations
- Results help identify over/under-tuned enemies

---

### PM-01: Sprint Board & Definition of Done
**Owner:** Project Manager
**Impact:** Keeps 8 people working on the right things in the right order

Set up:
1. **GitHub Projects board** with columns: Backlog, In Progress, Review, Done
2. **Sprint cadence:** 2-week sprints with demos
3. **Definition of Done for each task type:**
   - Code: PR reviewed, tests pass, no lint errors, deployed to preview
   - Art: Consistent style, correct dimensions, named correctly, committed
   - Audio: Correct format (MP3, <500KB), normalized volume, committed
   - Content: Spell-checked, tone-consistent, reviewed by another team member

4. **Dependencies map:**
   ```
   BE-01 (reducer split) ← blocks nothing but de-risks everything
   GD-01 (enemy art) → UX-01 (combat feedback needs art to animate)
   AR-01 (audio) → UX-01 (feedback needs sounds)
   SL-01 (events) → JR-01 (events can give potions)
   QA-01 (tests) ← depends on BE-01 completing
   ```

5. **Risk register:**
   - OpenAI art consistency (mitigate: strict prompt templates, style guide)
   - GameContext refactor breaking things (mitigate: BE does it first, then all work on new structure)
   - Audio sourcing licensing (mitigate: use CC0/public domain only)

**Acceptance criteria:**
- Board exists with all tasks from this document
- Each task has owner, priority, estimate (S/M/L)
- Sprint 1 tasks identified and assigned
- Daily standup scheduled

---

## Phase 2: Content & Depth (Sprint 3-4)

> Goal: Give players reasons to replay. Right now there's no meta-progression, no character variety, and encounters blur together.

---

### BE-03: Meta-Progression System
**Owner:** Back Ender
**Impact:** Players have a reason to keep playing beyond "try again." Every run unlocks something.

```javascript
// src/systems/progressionSystem.js
const progression = {
  totalRuns: 0,
  wins: 0,
  losses: 0,
  highestFloor: 0,
  totalEnemiesKilled: 0,
  totalGoldEarned: 0,
  cardsPlayed: {},        // Track per-card usage
  relicsCollected: {},    // Track which relics found
  enemiesDefeated: {},    // Bestiary unlock

  // Unlocks
  unlockedCards: [],      // New cards unlocked by milestones
  unlockedRelics: [],     // New relics unlocked
  achievements: [],       // Achievement list
};
```

**Unlock milestones (examples):**
- Win 1 run → Unlock 5 new cards
- Kill 100 enemies → Unlock new relic
- Play 500 attack cards → Unlock "Perfected Strike"
- Reach floor 10 without taking damage → Unlock "Tungsten Rod"
- Win with <20 cards in deck → Unlock "Minimalist" achievement

**Acceptance criteria:**
- Run stats persist in localStorage across sessions
- Unlocks gate new content
- Stats screen accessible from main menu
- Bestiary shows discovered enemies with art/stats

---

### BE-04: Difficulty / Ascension System
**Owner:** Back Ender
**Impact:** Keeps experienced players challenged. Slay the Spire has 20 ascension levels. You need at least 5.

```javascript
const ascensionModifiers = [
  { level: 1, description: 'Enemies have 10% more HP' },
  { level: 2, description: 'Start each combat with 1 Wound in draw pile' },
  { level: 3, description: 'Elites are harder (buffed movesets)' },
  { level: 4, description: 'Rest sites heal 25% instead of 30%' },
  { level: 5, description: 'Boss has additional move pattern' },
];
```

**Acceptance criteria:**
- Ascension unlocked after first win
- Each ascension level adds cumulative difficulty
- Ascension level shown on run screen
- Stats tracked per ascension level

---

### GD-03: Relic & Potion Art
**Owner:** Graphic Designer
**Impact:** Relics and potions are currently just text. Visual items are more memorable.

Generate art for:
- 47 relics (64x64 icon style, consistent lighting, dark fantasy)
- 15 potions (64x64, glass bottle/vial style, color-coded by effect type)

**Style guide for relics:**
```
"Dark fantasy item icon, [item_description], painted style, dramatic lighting,
dark background, centered object, 64x64 game icon style. No text."
```

**Color coding for potions:**
- Red: Damage effects
- Blue: Block/defense
- Green: Healing/regen
- Yellow: Energy/draw
- Purple: Debuff effects
- Orange: Buff effects

**Acceptance criteria:**
- All 47 relics have icons
- All 15 potions have icons
- Consistent style with enemy art (same art direction)

---

### GD-04: Map Visual Overhaul
**Owner:** Graphic Designer + UX Guy (collab)
**Impact:** Map currently looks like connected dots. It should look like a world you're ascending through.

Design:
1. **Background:** Vertical spire/tower illustration as map background
2. **Node icons:** Distinct icons for each node type (sword=combat, skull=elite, campfire=rest, bag=shop, ?=event, crown=boss)
3. **Path lines:** Styled connections (not plain lines - try dotted trails or glowing paths)
4. **Current position:** Glowing indicator on current floor
5. **Fog of war:** Floors above current slightly dimmed/obscured
6. **Act transitions:** Visual break between acts (clouds, barriers, doorways)

**Acceptance criteria:**
- Map tells a visual story of ascending
- Node types identifiable at a glance without labels
- Player always knows where they are and where they can go
- Paths are clear and not cluttered

---

### SL-03: Boss Encounters & Character
**Owner:** Story Line
**Impact:** Bosses should be memorable characters, not just stat blocks

For each boss:
1. **Introduction:** 2-3 lines when first encountered
2. **Mid-fight dialogue:** Line at 50% HP
3. **Death quote:** Line on defeat
4. **Personality:** Each boss should have a distinct personality

Example:
```javascript
{
  id: 'hexaghost',
  name: 'The Hexaghost',
  personality: 'Ancient, melancholic, treats combat as ritual',
  intro: 'Six flames orbit a hollow shell of what was once a warrior. It regards you with something like pity.',
  midFight: '"You burn brightly... but all flames gutter in the end."',
  deathQuote: '"At last... the cold..."',
}
```

**Acceptance criteria:**
- Every boss has intro, mid-fight, and death dialogue
- Dialogue doesn't slow down gameplay (quick fade-in text)
- Personalities feel distinct from each other

---

### JR-03: Act 2 Content Expansion
**Owner:** Junior
**Impact:** Game currently has one act worth of tuned content. Need Act 2 to feel different.

Using existing enemy system patterns, add:

**10 new Act 2 enemies:**
| Enemy | HP | Type | Gimmick |
|-------|-----|------|---------|
| Centurion | 76-80 | Normal | Gains fury stacks, hits harder each turn |
| Mystic | 50-56 | Normal | Heals allies, weak attacks |
| Snecko | 60-66 | Normal | Confuses card costs (randomize) |
| Chosen | 95-100 | Normal | Alternates hex and big damage |
| Shelled Parasite | 68-72 | Normal | High block, weak attack |
| Byrd | 25-30 | Normal | Flying (take reduced damage), attacks in groups |
| Reptomancer | 65-70 | Normal | Summons daggers |
| Book of Stabbing | 160-170 | Elite | Multi-stab that increases each turn |
| Gremlin Leader | 140-148 | Elite | Summons gremlins, buffs them |
| Automaton | 188-200 | Boss | Two phases: offensive and defensive |

**Acceptance criteria:**
- All enemies have correct AI patterns
- HP ranges appropriate for Act 2 difficulty
- Tests cover all enemy move patterns
- Enemies use existing status effect system

---

### JR-04: 15 New Cards
**Owner:** Junior
**Impact:** More build variety means more replayability

Add cards that enable new deck archetypes:

**Exhaust archetype (5 cards):**
| Card | Type | Cost | Effect |
|------|------|------|--------|
| Dark Embrace | Power | 2 | Whenever a card is exhausted, draw 1 |
| Sentinel | Skill | 1 | Gain 5 block. If exhausted, gain 2 energy |
| Sever Soul | Attack | 2 | Deal 16 damage. Exhaust all non-attack cards in hand |
| Evolve | Power | 1 | Whenever a Status card is drawn, draw 1 |
| Feel No Pain | Power | 1 | Whenever a card is exhausted, gain 3 block |

**Strength archetype (5 cards):**
| Card | Type | Cost | Effect |
|------|------|------|--------|
| Flex | Skill | 0 | Gain 2 Strength. Lose 2 Strength at end of turn |
| Uppercut | Attack | 2 | Deal 13 damage. Apply 1 Weak. Apply 1 Vulnerable |
| Spot Weakness | Skill | 1 | If enemy intends to attack, gain 3 Strength |
| Whirlwind | Attack | X | Deal 5 damage to ALL enemies X times |
| Reaper | Attack | 2 | Deal 4 damage to ALL enemies. Heal HP for unblocked damage |

**Block archetype (5 cards):**
| Card | Type | Cost | Effect |
|------|------|------|--------|
| Entrench | Skill | 2 | Double your current block |
| Metallicize | Power | 1 | At end of turn, gain 3 block |
| Impervious | Skill | 2 | Gain 30 block. Exhaust |
| Juggernaut | Power | 2 | Whenever you gain block, deal 5 damage to random enemy |
| Ghostly Armor | Skill | 1 | Gain 10 block. Ethereal |

**Acceptance criteria:**
- All 15 cards functional in combat
- Cards have descriptions matching actual effects
- Upgrade versions defined for each card
- Archetype-enabling cards appear in reward pools
- Tests for each card's special effects

---

### AR-02: Save System & Run History
**Owner:** Allrounder
**Impact:** Players can leave and come back. Lost runs due to browser close are frustrating.

Current save system is basic. Expand:

1. **Auto-save:** Save after every node completion (combat win, event choice, shop exit)
2. **Save validation:** Detect corrupted saves, offer to start fresh
3. **Run history:** Store last 10 completed runs with summary (floor reached, cards, relics, cause of death)
4. **Continue button:** Main menu shows "Continue Run" if save exists with preview (floor, HP, deck size)

**Acceptance criteria:**
- Closing browser and reopening continues the run exactly
- Run history visible from main menu
- Corrupted saves don't crash the game
- Save file size reasonable (<100KB)

---

### AR-03: Settings & Accessibility
**Owner:** Allrounder
**Impact:** Players with different needs can actually play the game

Implement settings screen:
1. **Volume:** Master, SFX, Music sliders
2. **Animation speed:** Normal, Fast, Instant (for speedrunners)
3. **Screen shake:** Toggle on/off
4. **Text size:** Normal, Large (scales card descriptions and UI text)
5. **High contrast mode:** Brighter borders, stronger differentiation
6. **Confirm end turn:** Toggle (prevents accidental turn end)
7. **Show damage numbers:** Toggle

**Acceptance criteria:**
- Settings persist in localStorage
- Changes apply immediately without restart
- Settings accessible from both main menu and in-game pause
- Animation speed "Instant" still shows state changes clearly

---

### QA-03: End-to-End Test Suite
**Owner:** Tester
**Impact:** Catches regressions before they reach players

Write Playwright or Cypress E2E tests:

```javascript
describe('Full Game Run', () => {
  it('can start new game and reach combat', () => {});
  it('can play cards and kill enemy', () => {});
  it('can navigate map after combat', () => {});
  it('can use rest site to heal', () => {});
  it('can buy from shop', () => {});
  it('can complete an event', () => {});
  it('game over screen appears on death', () => {});
  it('save and load preserves game state', () => {});
});
```

**Acceptance criteria:**
- E2E suite runs in CI pipeline
- Tests cover happy path through all game phases
- Tests run in <2 minutes
- Failures produce screenshots for debugging

---

## Phase 3: Polish & Ship (Sprint 5-6)

> Goal: Take it from "functional game" to "game I'd share with friends."

---

### UX-03: Deck Viewer & Run Stats
**Owner:** UX Guy
**Impact:** Players want to see their deck, plan strategy, and feel pride in their build

1. **Full deck viewer:** Accessible from map screen, shows all cards with sorting (by type, cost, name)
2. **Run stats panel:** Cards played, damage dealt, damage taken, gold earned, enemies killed
3. **Relic display:** All collected relics with descriptions on hover
4. **Card count per type:** Visual breakdown of attack/skill/power ratio

**Acceptance criteria:**
- Deck viewer accessible at any time outside combat
- Cards sortable and filterable
- Run stats update in real-time
- Relic tooltips explain each relic's effect

---

### UX-04: Tutorial / First Run Experience
**Owner:** UX Guy + Story Line (collab)
**Impact:** New players currently have no idea what to do. Retention is zero without onboarding.

Not a heavy tutorial - just contextual hints:

1. **First combat:** Highlight energy → "This is your energy. Cards cost energy to play."
2. **First card play:** Arrow from card to enemy → "Drag cards to enemies to attack"
3. **First end turn:** Highlight button → "End your turn when done. Enemies will attack."
4. **First map:** Highlight paths → "Choose your path. Each icon is a different encounter."
5. **First rest site:** Explain options briefly
6. **Dismissable:** "Got it" button, never shows again after first run

**Acceptance criteria:**
- First-time player can understand core loop without external help
- Hints are brief and non-intrusive
- Hints don't appear on subsequent runs
- Player can dismiss any hint immediately

---

### GD-05: Visual Effects & Particles
**Owner:** Graphic Designer + UX Guy (collab)
**Impact:** Effects sell the fantasy of power. A fireball should LOOK like a fireball.

Create CSS/Canvas particle effects for:
1. **Fire damage:** Orange particles on hit
2. **Poison/Weak:** Green drip particles
3. **Block gained:** Blue shield shimmer
4. **Card exhaust:** Card burns away (flame particles)
5. **Heal:** Green rising particles
6. **Power played:** Aura pulse around player
7. **Strength buff:** Red glow on player
8. **Death blow:** Explosion particles on enemy

**Acceptance criteria:**
- Effects enhance readability (you can tell WHAT happened)
- Performance stays smooth (no frame drops from particles)
- Effects respect "animation speed" setting
- CSS-based where possible, canvas for complex ones

---

### BE-05: Performance Optimization
**Owner:** Back Ender
**Impact:** Game should feel instant. Any lag between click and response breaks immersion.

1. **React.memo critical components:** Card, Enemy, StatusEffect - prevent re-renders
2. **Context splitting:** Separate combat context from map context to reduce re-render scope
3. **useMemo for calculations:** Damage previews, card cost calculations
4. **Lazy load non-combat screens:** Shop, Events, Map don't need to be in memory during combat
5. **Image optimization:** Compress card art (currently 2-4MB each - should be <200KB)
6. **Bundle analysis:** Run `vite-plugin-visualizer`, identify and eliminate large dependencies

**Acceptance criteria:**
- Card play to resolution: <100ms (no visual lag)
- Initial load: <3 seconds on 3G connection
- Bundle size: <2MB total (excluding lazy chunks)
- No dropped frames during animations (60fps)
- Card art compressed without visible quality loss

---

### AR-04: Mobile Responsiveness
**Owner:** Allrounder
**Impact:** Half your potential players are on phones. The game needs to work there.

Current state has some mobile styles but untested:

1. **Touch targets:** All interactive elements minimum 44x44px
2. **Card hand:** Fan layout at bottom, tap to select, tap enemy to play
3. **Swipe gestures:** Swipe up to end turn, swipe left/right to view piles
4. **Viewport:** Proper scaling on all phone sizes (iPhone SE to tablet)
5. **Portrait mode:** Game should work in portrait (not just landscape)
6. **No hover states:** Replace all hover-dependent UI with tap alternatives

**Acceptance criteria:**
- Playable on iPhone 12 (375px) in portrait
- All interactions work with touch only
- No horizontal scrolling or overflow
- Text readable without zooming
- Card text readable at mobile sizes

---

### QA-04: Pre-Release QA Pass
**Owner:** Tester
**Impact:** The last line of defense before players see bugs

Structured testing checklist:

**Smoke test (every deploy):**
- [ ] New game starts correctly
- [ ] Can play 5 combats without crash
- [ ] Save/load works
- [ ] All screen transitions work

**Full regression (every sprint):**
- [ ] All 81 cards function correctly
- [ ] All enemies have working AI
- [ ] All relics trigger correctly
- [ ] All events resolve without errors
- [ ] Shop pricing correct
- [ ] Rest site heal/upgrade works
- [ ] Map generation produces valid maps
- [ ] Game over / Victory screens accessible
- [ ] Audio plays correctly
- [ ] Mobile layout not broken

**Edge cases to verify:**
- [ ] 0 HP enemy interaction
- [ ] Empty draw pile + empty discard
- [ ] Max hand size (10 cards)
- [ ] Playing card when no valid target
- [ ] Relic trigger on exact threshold
- [ ] Status effects at 999 stacks
- [ ] Very long combat (50+ turns)
- [ ] Concurrent animations don't break state

**Acceptance criteria:**
- Complete checklist document in repo
- All items verified before each release
- Bug tracker used for any failures
- No P0/P1 bugs in release build

---

## Priority Order (What to do FIRST)

```
WEEK 1-2 (Foundation):
├── BE-01: Split GameContext (unblocks everything)
├── AR-01: Audio system (biggest feel improvement)
├── GD-01: Enemy art (biggest visual improvement)
└── PM-01: Sprint board (coordination)

WEEK 3-4 (Content):
├── SL-01: Events rewrite
├── JR-01: Potion system
├── UX-01: Combat feedback
├── QA-01: Component tests
└── GD-02: Card frames

WEEK 5-6 (Depth):
├── BE-03: Meta-progression
├── JR-03: Act 2 enemies
├── JR-04: New cards
├── SL-02: World building
└── AR-02: Save system

WEEK 7-8 (Polish):
├── UX-03: Deck viewer
├── UX-04: Tutorial
├── GD-05: Particle effects
├── BE-05: Performance
├── AR-04: Mobile
└── QA-04: QA pass
```

---

## Definition of Done (All Tasks)

A task is NOT done until:
1. Code is in a PR with description
2. Tests exist and pass for new functionality
3. No lint errors introduced
4. Another team member has reviewed
5. Plays correctly in a full run (no crash)
6. Deployed to preview environment

---

## Final Words

Look, you've got something real here. The architecture is sound enough to build on, you've got content, and the combat math works. What you're missing is **soul and juice.** Every interaction should have feedback - visual, audio, or both. Every decision should feel meaningful. Every run should feel different from the last.

The biggest risks:
1. **GameContext refactor** - Do this first or you'll regret it. Every new feature piled into 2,219 lines makes the next feature harder.
2. **Art consistency** - OpenAI generations can be all over the place. Strict prompts, same seed where possible, and a style guide are non-negotiable.
3. **Scope creep** - You're 8 people. Ship something polished with 1.5 acts before you think about Act 3. A tight, polished short game beats a sprawling broken one.

Don't try to be Slay the Spire. Be a good game that happens to be inspired by it. Find your own voice - that starts with the story, the art style, and the events.

Now get to work.
