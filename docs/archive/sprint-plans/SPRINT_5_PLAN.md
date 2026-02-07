# Sprint 5: Replayability - Meta-Progression & Ascension

**Status:** READY FOR APPROVAL
**Goal:** Establish meta-progression and ascension systems to give players a reason to replay
**Target:** Player retention through unlocks, achievements, and increasing challenge
**Integration Branch:** `sprint-5`
**Team Alignment:** 2026-01-25 planning session complete

---

## Current State Assessment

### What's Complete (Sprints 1-4)
- Architecture: GameContext split into domain reducers (375 lines vs 2,219)
- Stability: All P0 bugs fixed, 837 tests passing
- Visual Polish: Map auto-scroll, victory overlay, sequential enemy turns, floating damage numbers
- UX: Tooltips, damage preview with modifiers, combat feedback
- Magazine Score: 58 -> targeting 70+ (Sprint 3-4 addressed all major feedback)

### Critical Discovery (Team Input)
Several Sprint 5 tasks have existing partial implementations:
- **progressionSystem.js** - Core exists with 10 achievements, 5 unlock milestones
- **ascensionSystem.js** - Core exists with 11 levels (0-10) and modifier functions
- **DeckViewer.jsx** - Component exists (93 lines) with sort/filter, not wired to MapScreen
- **Settings.jsx** - Already complete with volume, animation speed, text size
- **15 JR-04 cards** - All 15 already exist in cards.js with working effects

**Impact:** Sprint 5 is primarily INTEGRATION work, not new feature development.

### What's Missing (Why Sprint 5)
- **No reason to replay** - Progression exists but not wired to game flow
- **No challenge scaling** - Ascension exists but not applied at combat start
- **Bosses lack personality** - Just stat blocks, no memorable moments
- **Deck viewer inaccessible** - Component exists but no entry point from map

---

## Sprint 5 Tasks (REVISED after Team Input)

### P0 - Must Complete (Core Sprint Delivery)

| Task | Owner | Size | Description | Depends On |
|------|-------|------|-------------|------------|
| **BE-06** | BE | M | **Meta-progression integration** - Wire existing progressionSystem.js into game flow: update stats on game over, track in-run stats, expose getters for UX. Core system exists. | None |
| **BE-07** | BE | M | **Ascension integration** - Wire existing ascensionSystem.js: apply modifiers at SELECT_NODE, add ascension selection to game start, unlock on first win. Core system exists. | BE-06 |
| **SL-03** | SL | M | **Boss encounters & dialogue** - Intro, mid-fight (50% HP), death quote for Act 1 bosses. SL writes data AND implements BossDialogue.jsx following VictoryOverlay pattern. | None |

**P0 Estimated Effort:** 2M (BE), 1M (SL)

### P1 - Should Complete (High Value)

| Task | Owner | Size | Description | Depends On |
|------|-------|------|-------------|------------|
| **UX-08** | UX | M | **Deck viewer integration** - Wire existing DeckViewer.jsx to MapScreen, add entry point button, integrate with Tooltip system for relics. Component exists. | BE-06 (runStats) |
| **QA-05** | QA | M | **Sprint 5 test coverage** - Unit tests for progression/ascension systems, update balance simulator for ascension modifiers, new E2E scenarios. | BE-06, BE-07 |

**P1 Estimated Effort:** 2M

### P2 - If Time Permits

| Task | Owner | Size | Description | Depends On |
|------|-------|------|-------------|------------|
| **AR-03** | AR | XS | **Settings verification** - Verify existing Settings.jsx persists correctly and animation speed affects all animations. Already complete, needs smoke test. | None |
| **GD-06** | GD | M | **Sprite sheet bundling** - Reduce 194 network requests to ~10-12 sprite sheets. Build-time Sharp composition. | None |

**P2 Estimated Effort:** 1XS + 1M

### REMOVED Tasks

| Task | Reason |
|------|--------|
| **JR-04** | All 15 cards already exist in cards.js with working effects. No work required. |

### JR Reallocation

JR has capacity available. Options for Sprint 5:
1. Help QA-05 with card effect test coverage (15 archetype cards lack dedicated tests)
2. Begin JR-03 (Act 2 enemies) early if BE-06/07 land smoothly
3. Support SL-03 with boss mechanic documentation

---

## Explicitly Deferred to Sprint 6+

| Task | Rationale |
|------|-----------|
| JR-03: Act 2 content (10 enemies) | Too large (L). Meta-progression must land first so players have reason to see Act 2. |
| GD-07: Relic & potion art (62 items) | Too large (L). Current placeholders are functional. |
| GD-08: Map visual overhaul | Map works well after Sprint 4. Cosmetic. |
| UX-09: Tutorial | Not needed yet. Let players discover polished loop first. |
| AR-05: Mobile responsiveness | Large scope. Ship desktop-first. |
| QA-04: Pre-release QA pass | Wait until content is complete. |

---

## Task Details

### BE-06: Meta-Progression System

**Data structure (per DEC-014):**
```javascript
// localStorage key: spireAscent_progression
{
  version: 1,
  totalRuns: number,
  wins: number,
  losses: number,
  highestFloor: number,
  totalEnemiesKilled: number,
  cardsPlayed: { [cardId]: number },
  relicsCollected: { [relicId]: number },
  enemiesDefeated: { [enemyId]: number },
  unlockedCards: string[],
  achievements: string[]
}
```

**Achievements (minimum 10):**
1. First Blood - Win your first run
2. Collector - Collect 10 different relics
3. Deckmaster - Play 500 cards
4. Slayer - Kill 100 enemies
5. Minimalist - Win with 15 or fewer cards
6. Speed Demon - Win in under 30 minutes
7. Flawless - Win without taking damage in any combat
8. Unlucky - Die on floor 1
9. Hoarder - Have 100+ gold at end of run
10. Ascended - Complete Ascension 5

**Files:** `src/systems/progressionSystem.js` (NEW), `src/context/reducers/metaReducer.js`

### BE-07: Ascension System

**Modifiers (per DEC-015, apply at SELECT_NODE):**
```javascript
const ascensionModifiers = [
  { level: 1, description: 'Enemies have 10% more HP', effect: { enemyHpMult: 1.1 } },
  { level: 2, description: 'Start each combat with 1 Wound', effect: { startWithWound: 1 } },
  { level: 3, description: 'Elites deal 20% more damage', effect: { eliteDamageMult: 1.2 } },
  { level: 4, description: 'Rest sites heal 25% instead of 30%', effect: { restHealMult: 0.83 } },
  { level: 5, description: 'Bosses have additional attack patterns', effect: { bossEnhanced: true } },
];
```

**Files:** `src/systems/ascensionSystem.js` (NEW), `src/context/reducers/mapReducer.js`

### SL-03: Boss Encounters & Dialogue

**Format (per DEC-016, non-blocking overlay):**
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

**Bosses to cover:** Hexaghost, The Guardian, Slime Boss (Act 1)

**Files:** `src/data/bosses.js` or extend `enemies.js`, `src/components/BossDialogue.jsx` (NEW)

### JR-04: 15 New Cards

**Exhaust Archetype:**
| Card | Type | Cost | Effect |
|------|------|------|--------|
| Dark Embrace | Power | 2 | Whenever a card is exhausted, draw 1 |
| Sentinel | Skill | 1 | Gain 5 block. If exhausted, gain 2 energy |
| Sever Soul | Attack | 2 | Deal 16 damage. Exhaust all non-attack cards in hand |
| Evolve | Power | 1 | Whenever a Status card is drawn, draw 1 |
| Feel No Pain | Power | 1 | Whenever a card is exhausted, gain 3 block |

**Strength Archetype:**
| Card | Type | Cost | Effect |
|------|------|------|--------|
| Flex | Skill | 0 | Gain 2 Strength. Lose 2 Strength at end of turn |
| Uppercut | Attack | 2 | Deal 13 damage. Apply 1 Weak and 1 Vulnerable |
| Spot Weakness | Skill | 1 | If enemy intends to attack, gain 3 Strength |
| Whirlwind | Attack | X | Deal 5 damage to ALL enemies X times |
| Reaper | Attack | 2 | Deal 4 damage to ALL enemies. Heal for unblocked damage |

**Block Archetype:**
| Card | Type | Cost | Effect |
|------|------|------|--------|
| Entrench | Skill | 2 | Double your current block |
| Metallicize | Power | 1 | At end of turn, gain 3 block |
| Impervious | Skill | 2 | Gain 30 block. Exhaust |
| Juggernaut | Power | 2 | Whenever you gain block, deal 5 damage to random enemy |
| Ghostly Armor | Skill | 1 | Gain 10 block. Ethereal |

**Files:** `src/data/cards.js`, tests for each card

---

## Task Dependencies

```
BE-06 (progression) ─────────┬───── BE-07 (ascension)
      │                      │
      └──────────────────────┼───── UX-08 (deck viewer shows progression stats)
                             │
SL-03 (boss dialogue) ───────┼───── independent
                             │
JR-04 (new cards) ───────────┼───── independent
                             │
AR-03 (settings) ────────────┼───── independent
                             │
GD-06 (sprites) ─────────────┘      independent
```

**Parallel tracks:**
- BE-06/BE-07 is the critical path
- SL-03, JR-04 can run fully parallel to BE work
- UX-08 can start immediately, integrates with BE-06 near end of sprint

---

## Execution Order (REVISED)

```
Week 1:
├── BE starts BE-06 (progression integration) - critical path
├── SL starts SL-03 (boss dialogue + component) - independent
├── UX starts UX-08 (deck viewer integration) - can proceed, runStats later
├── AR verifies AR-03 (settings smoke test) - quick win
└── JR helps QA with archetype card test coverage

Mid-Sprint Check:
├── BE-06 wired to game over flow, in-run tracking working
├── SL-03 has 3 boss dialogue sets + BossDialogue.jsx draft
├── UX-08 has deck viewer accessible from map
├── AR-03 verified and closed
└── QA-05 has progressionSystem tests written

Week 2:
├── BE starts BE-07 (ascension integration) - applies modifiers at SELECT_NODE
├── QA-05 writes ascensionSystem tests + updates balance simulator
├── UX-08 integrates with BE-06 runStats
├── SL-03 polishes dialogue triggers and timing
└── GD-06 (sprite sheets) if P2 time available

End of Sprint:
├── All P0 merged (BE-06, BE-07, SL-03)
├── All P1 merged (UX-08, QA-05)
├── P2 as available (AR-03 verification, GD-06)
└── Sprint 5 validation gate verified
```

---

## Decisions Resolved

### DEC-014: Progression data storage format
**Status:** ACCEPTED
- Separate localStorage key `spireAscent_progression`
- Versioned for future migrations
- No conflict with existing run saves

### DEC-015: Ascension modifier application timing
**Status:** ACCEPTED
- Apply at SELECT_NODE (combat initialization)
- Enemy HP scaled once when spawned
- Matches Slay the Spire behavior

### DEC-016: Boss dialogue display method
**Status:** ACCEPTED
- Semi-transparent overlay at top of combat screen
- 2-3 seconds display, click to dismiss
- Non-blocking (no pause, no input block)

### DEC-017: Act 2 enemy encounter weighting
**Status:** ACCEPTED (deferred implementation to Sprint 6)
- Weights approved for when JR-03 lands
- Stored in encounters.js for easy tuning

---

## Validation Gate (REVISED)

Before closing Sprint 5:

**BE-06 (Progression):**
- [ ] Meta-progression persists across browser sessions (localStorage)
- [ ] Run stats update on game over (wins, losses, enemies killed)
- [ ] In-run stats track during combat (damage dealt, cards played)
- [ ] At least 5 achievements trigger correctly (First Blood, Slayer, etc.)

**BE-07 (Ascension):**
- [ ] Ascension 1 unlocks after first win
- [ ] Ascension selection available at game start
- [ ] Enemy HP is 10% higher on Ascension 1 (visible difference)
- [ ] Wound card appears in deck on Ascension 2+
- [ ] Full playthrough on Ascension 1 without crashes

**SL-03 (Boss Dialogue):**
- [ ] All 3 Act 1 bosses have intro, mid-fight, death dialogue
- [ ] Dialogue appears as non-blocking overlay
- [ ] Click to dismiss works
- [ ] Auto-dismiss after 2-3 seconds

**UX-08 (Deck Viewer):**
- [ ] Deck viewer accessible from map screen
- [ ] Cards sortable by type/cost/name
- [ ] Relic tooltips display on hover

**QA-05 (Testing):**
- [ ] Unit tests for progressionSystem.js (10+)
- [ ] Unit tests for ascensionSystem.js (10+)
- [ ] Balance simulator supports ascension config
- [ ] Win rate 20-40% maintained at Ascension 0-5

**General:**
- [ ] `npm run validate` passes (850+ tests expected)
- [ ] No P0/P1 regressions

---

## Open Questions - PM Decisions

**Resolved during planning session:**

1. **BE: Ascension selection UI** - BE provides state/logic, UX builds selector component as part of UX-08 integration work
2. **BE: Achievement notifications** - BE provides detection, UX implements pop-up (can be Sprint 6 polish)
3. **JR-04 removal** - Confirmed. JR reallocated to help QA with card effect tests
4. **SL: Boss dialogue triggers** - Use 50% HP as standard trigger; can customize per-boss if SL prefers
5. **UX: Deck viewer access** - Map only for Sprint 5; combat access is Sprint 6 enhancement
6. **UX: Relic tooltips** - Yes, use existing Tooltip infrastructure
7. **AR: Volume control** - Already implemented as Master/SFX/Music (better than master-only)
8. **GD: Achievement badges** - CSS-only for Sprint 5; art badges deferred to Sprint 6
9. **QA: Win rate as gate** - Yes, add to validation gate (20-40% at each ascension level)

**Remaining questions (non-blocking):**
- JR-05 completion status from Sprint 3 - verify in diary (if incomplete, JR can finish)
- Max text length for boss dialogue overlay - SL to determine during implementation

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| BE-06/BE-07 scope creep | Medium | High | Cap at exactly 5 ascension levels, 10 achievements |
| Boss dialogue feels tacked on | Medium | Medium | SL writes all dialogue before implementation, PM reviews tone |
| JR-04 cards break balance | Medium | Low | QA simulator validates win rate stays 20-40% |
| localStorage quota | Low | Medium | Progression data is small (<10KB) |

---

## Team Review Notes (Collected 2026-01-25)

**BE:**
- Core systems (progressionSystem.js, ascensionSystem.js) already exist with substantial implementation
- Revised sizing from L+M to M+M (integration work, not new development)
- DEC-014 schema in plan was incomplete vs actual implementation - use existing richer schema
- Recommends extracting mapReducer combat initialization helper before adding ascension logic
- Questions: Who builds ascension selection UI? Achievement notifications BE or UX?
- Formally accept DEC-014/015/016 so implementation can proceed

**JR:**
- All 15 JR-04 cards already exist in cards.js with working effects
- No new card implementation needed - task should be REMOVED
- Effect processor already handles all card mechanics
- Available capacity: can help with test coverage or begin Act 2 work early
- Question: Was JR-05 (enemy intent specificity) completed in Sprint 3?

**AR:**
- AR-03 (Settings) is ALREADY COMPLETE in Settings.jsx
- All features implemented: volume (Master/SFX/Music), animation speed, text size, screen shake, etc.
- Just needs verification (smoke test), revise sizing S → XS
- CONFIRMED: No localStorage conflict with `spireAscent_progression` key
- Minor tech debt: audio settings duplicated between audioSystem.js and settingsSystem.js

**UX:**
- DeckViewer.jsx exists (93 lines) with sort/filter already implemented
- NOT wired to MapScreen - needs integration
- runStats prop expected but doesn't exist in state - soft dependency on BE-06
- Recommends modal overlay approach, deck count as clickable entry point
- Questions: Deck viewer during combat? Keyboard shortcut?

**GD:**
- GD-06 still valuable (194 requests at 32KB avg = 6.3MB total)
- P2 priority acceptable for this sprint's theme (replayability not performance)
- CSS background-position is the right technical approach
- Achievement badges can be CSS-only (no new art needed)
- JR-04 card art question moot - cards already have art

**SL:**
- SL-03 is clear and achievable
- Proposes distinct boss personalities: Hexaghost (melancholic), Guardian (mechanical), Slime Boss (alien)
- Recommends serious dark fantasy tone, no humor
- Will implement both dialogue data AND BossDialogue.jsx component
- Follows VictoryOverlay pattern for non-blocking display
- Questions: Trigger on 50% HP or per-boss events? Max text length for overlay?

**QA:**
- Recommends adding QA-05: Sprint 5 Test Coverage (M)
- Balance simulator needs ascension modifier updates
- New E2E scenarios: progression persistence, ascension unlock, boss dialogue
- Proactive test strategy with data-testid requirements
- Questions: Should win rate 20-40% be a validation gate?
