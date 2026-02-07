# Sprint 10 Plan: Act 3 + Daily Challenge + Post-Launch Polish

**Created:** 2026-01-31
**Goal:** Ship Act 3 content, daily challenge mode, and post-launch quality improvements. First post-1.0 content update.
**Integration Branch:** `sprint-10`
**Status:** PLANNED — Pending team alignment

---

## Sprint 9 Outputs Feeding This Sprint

- **1.0 complete:** All Sprint 9 tasks shipped (15/15). Second consecutive 100% sprint.
- **1736 tests** passing across 39+ test files
- **Full art pipeline:** Zero emoji, zero placeholders. Sprite sheets automated.
- **PWA installable:** Offline-capable, service worker in place.
- **Mobile playable:** Combat, map, touch targets all verified.
- **Music + SFX:** 6 tracks with crossfade, 10+ SFX.
- **Accessibility:** Keyboard nav, ARIA labels, contrast.
- **Tutorial:** First-run hints working.
- **Sprint 9 PR #92:** Still open — merge to master and tag v1.0.0 before Sprint 10 branches.

### Current Metrics
- **Tests:** 1736 passing
- **Lint:** 0 errors
- **Build:** Passing (bundle ~600KB gzipped)
- **Content:** 81 cards, 41 enemies (Act 1+2), 49 relics, 15 potions, 20 events
- **Art:** 100% coverage
- **Mobile:** Portrait playable on 375px+

### Content Gap: Act 3
The game currently ends after Act 2 boss. Act 3 is the single largest content gap — a complete run should have 3 acts culminating in the Heart (or Spire equivalent). This sprint prioritizes building Act 3.

---

## Task Overview

### P0 — Must Ship

| Task | Owner | Size | Description |
|------|-------|------|-------------|
| **PM-10** | PM | S | Merge Sprint 9 PR #92 to master, tag v1.0.0, create sprint-10 branch |
| **FIX-07** | JR/BE | S | **P0 BUG: Potions never awarded from battles** — Potion reward system broken. Players never receive potions as combat rewards despite UI being present. Investigate rewardReducer/combatReducer. |
| **JR-08a** | JR | M | Act 3 enemies batch 1 — Giant Head, Nemesis, Reptomancer (elite tier). AI patterns, movesets, StS-baseline stats. |
| **JR-08b** | JR | M | Act 3 enemies batch 2 — Writhing Mass, Transient, Spire Growth, Maw, Orb Walker. Normal tier Act 3 encounters. |
| **JR-08c** | JR | M | Act 3 boss — Awakened One (two-phase boss with phase transition at 50% HP, powered-up second phase). |
| **BE-21** | BE | M | Act 3 map generation — floors 35-50, Act 3 encounter pools, elite/rest/shop distribution. Wire to map generator. |
| **VARROW-05** | Varrow | M | Act 3 narrative — Endless War deepens near the Spire's peak. Boss dialogue for Awakened One. 5 Act 3 events as "reality fractures". |

### P1 — Should Ship

| Task | Owner | Size | Description |
|------|-------|------|-------------|
| **UX-19** | UX | M | Daily challenge mode — Seeded runs with fixed modifiers (e.g., "all enemies +25% HP", "start with 1 random relic"). Leaderboard-ready scoring (no actual leaderboard yet). |
| **BE-22** | BE | S | Daily challenge infrastructure — Seeded RNG, modifier system, score calculation. Date-based seed. |
| **QA-13** | QA | M | Act 3 regression + balance — All new enemies tested. Act 3 win rate 15-25% at A0. Full 3-act playthrough test. |
| **GD-14** | GD | M | Act 3 enemy art — 8 new enemy sprites in dark fantasy style. Add to sprite sheet. |
| **AR-10** | AR | S | Act 3 music track — New track for Act 3 map/exploration. Wire to audioSystem for floors 35+. |

### P2 — Stretch

| Task | Owner | Size | Description |
|------|-------|------|-------------|
| **UX-20** | UX | S | Re-review self-assessment — Score the game against original Game Zone rubric. Document improvements since 58/100. |
| **QA-14** | QA | S | DataEditor removal — Strip DataEditor from production bundle entirely (currently 51KB dead weight). |
| **GD-15** | GD | S | Act 3 event art — 5 event scene illustrations for "reality fracture" events. |

---

## Task Details

### PM-10: Merge Sprint 9 + Tag v1.0.0 (P0, S)

Sprint 9 PR #92 is open. Master is at Sprint 7 merge point.

**Steps:**
1. Review PR #92 (sprint-9 → master)
2. Merge sprint-9 → master
3. Tag `v1.0.0` on master
4. Create sprint-10 branch from updated master
5. Create draft PR sprint-10 → master

**Acceptance Criteria:**
- [ ] PR #92 merged
- [ ] `v1.0.0` tag on master
- [ ] sprint-10 branch created and pushed
- [ ] Draft PR open

---

### JR-08a: Act 3 Enemies Batch 1 — Elites (P0, M)

Three Act 3 elite-tier enemies.

**Enemies:**
| Name | Type | HP Range | Key Moves |
|------|------|----------|-----------|
| Giant Head | Elite | 500-520 | Slow count (5 turns), then 40 dmg nuke. Grows stronger each count. |
| Nemesis | Elite | 185-200 | 6 dmg x3 multi-attack, 45 dmg single, Intangible (alternating). Burns cards. |
| Reptomancer | Elite | 180-190 | Summons Daggers (minions, 25 HP, 9 dmg). Buffs minions. Multi-stab if alone. |

**Files:** `src/data/enemies.js`, encounter pools
**Acceptance Criteria:**
- [ ] All 3 enemies have complete AI patterns
- [ ] Stats match StS baseline (document deviations)
- [ ] Tests for all 3 AI patterns

---

### JR-08b: Act 3 Enemies Batch 2 — Normals (P0, M)

Five Act 3 normal-tier enemies.

**Enemies:**
| Name | Type | HP Range | Key Moves |
|------|------|----------|-----------|
| Writhing Mass | Normal | 160-170 | Copies player's last card type (attack→attack, skill→buff). Unpredictable. |
| Transient | Normal | 999 | Fades after 5 turns. Deals escalating damage. Can't be killed normally. |
| Spire Growth | Normal | 170-180 | Constrict (damage every turn), gains Strength over time. |
| Maw | Normal | 300 | Drool (debuff) → Slam (massive damage) pattern. Weak between slams. |
| Orb Walker | Normal | 100-110 | Laser (damage + burn), generates status cards. |

**Files:** `src/data/enemies.js`, encounter pools
**Acceptance Criteria:**
- [ ] All 5 enemies functional with AI patterns
- [ ] Encounter pools updated for Act 3 floors
- [ ] Tests cover all AI branches

---

### JR-08c: Act 3 Boss — Awakened One (P0, M)

The Act 3 boss. Two-phase fight.

**Phase 1 (HP: 300):**
- Slash (20 dmg), Soul Strike (6 dmg x4)
- Gains Strength when player plays a Power card
- At 0 HP → transitions to Phase 2

**Phase 2 (HP: 300, revives):**
- Dark Echo (40 dmg), Anomaly (debuff all stats)
- Starts with 2 Strength, no longer reacts to Powers
- True death at 0 HP

**Files:** `src/data/enemies.js`, boss encounter pool, boss dialogue hook
**Acceptance Criteria:**
- [ ] Two-phase transition works correctly
- [ ] Power-reaction mechanic in Phase 1
- [ ] Boss dialogue hooks wired for VARROW-05
- [ ] Full boss test coverage

---

### BE-21: Act 3 Map Generation (P0, M)

Extend map generator to produce Act 3 (floors 35-50).

**Implementation:**
- Add Act 3 floor range to mapGenerator
- Act 3 encounter pools: 5 normals, 3 elites, 1 boss
- Floor distribution: more elites and fewer rest sites than Act 1/2
- Wire Act 3 boss node at floor 50

**Files:** `src/utils/mapGenerator.js`, `src/data/enemies.js` (encounter pools)
**Acceptance Criteria:**
- [ ] Map generates 50 floors across 3 acts
- [ ] Act 3 encounters draw from correct enemy pool
- [ ] Act 3 boss is Awakened One
- [ ] Existing Act 1/2 map generation unchanged

---

### VARROW-05: Act 3 Narrative (P0, M)

The Endless War reaches the peak. Reality destabilizes.

**Scope:**
- Awakened One boss dialogue (intro, mid-fight phase transition, death)
- 5 Act 3 events as "reality fractures" — choices carry higher stakes
- Flavor text for Act 3 map exploration
- Consistency with VARROW-01/02/03/04 voice

**Files:** `src/data/bossDialogue.js`, `src/data/events.js`, `src/data/flavorText.js`
**Acceptance Criteria:**
- [ ] Awakened One has full dialogue set
- [ ] 5 events with distinct choices and consequences
- [ ] Text reviewed for Endless War consistency
- [ ] No placeholder text

---

### UX-19: Daily Challenge Mode (P1, M)

Seeded daily runs with fixed modifiers for replayability.

**Implementation:**
- Daily challenge screen accessible from title/menu
- Today's challenge: fixed seed + 2-3 random modifiers from a pool
- Modifiers: "Enemies +25% HP", "Start with random relic", "1 less energy", "Double gold", etc.
- Score = floors cleared × enemies killed × gold earned
- Display personal best and today's score
- LocalStorage persistence

**Files:** New `DailyChallengeScreen.jsx`, `src/systems/dailyChallengeSystem.js`, title screen integration
**Acceptance Criteria:**
- [ ] Daily challenge accessible from menu
- [ ] Same seed produces same run on same day
- [ ] Modifiers apply correctly
- [ ] Score calculated and persisted
- [ ] Different challenge each day

---

### BE-22: Daily Challenge Infrastructure (P1, S)

Backend support for seeded RNG and modifiers.

**Implementation:**
- Seeded random number generator (date-based seed)
- Modifier system: array of modifier objects with `apply(gameState)` functions
- Score calculation function
- Wire into GameContext so challenge mode uses seeded RNG

**Files:** `src/systems/dailyChallengeSystem.js`, `src/context/GameContext.jsx`
**Acceptance Criteria:**
- [ ] Seeded RNG produces deterministic results
- [ ] Modifier system is extensible
- [ ] Score calculation covers key metrics
- [ ] Normal mode unaffected

---

### QA-13: Act 3 Regression + Balance (P1, M)

Test all new Act 3 content and verify balance.

**Scope:**
- All 8 new Act 3 enemies: AI patterns, damage calculations, special actions
- Awakened One boss: both phases, transition, power reaction
- Act 3 encounter pool distribution
- Full 3-act playthrough (A0 and A5) without crashes
- Balance: Act 3 win rate 15-25% at A0

**Files:** `src/test/`, new Act 3 test files
**Acceptance Criteria:**
- [ ] All 8 enemies + 1 boss tested
- [ ] Full 3-act playthrough passes
- [ ] Balance simulator updated for 3 acts
- [ ] 1800+ tests passing

---

### GD-14: Act 3 Enemy Art (P1, M)

8 new enemy sprites for Act 3 in existing dark fantasy style.

**Enemies:** Giant Head, Nemesis, Reptomancer, Writhing Mass, Transient, Spire Growth, Maw, Orb Walker
**Style:** Match existing sprite sheet style. 128x128. WebP format.

**Files:** `public/images/enemies/`, sprite sheet rebuild
**Acceptance Criteria:**
- [ ] 8 enemy sprites created
- [ ] Sprite sheet rebuilt with `npm run generate-sprites`
- [ ] All enemies render in combat

---

### AR-10: Act 3 Music Track (P1, S)

New exploration/map music for Act 3 floors.

**Implementation:**
- Wire a new track for Act 3 (floors 35+) — distinct from Act 1/2 exploration
- Use existing audioSystem music layer
- Crossfade on act transition

**Files:** `src/systems/audioSystem.js`, `public/audio/music/`
**Acceptance Criteria:**
- [ ] Act 3 map has distinct music
- [ ] Crossfade works on act boundary
- [ ] Volume controls apply

---

## Phase Ordering

**Phase 1 (Foundation — Do First):**
- PM-10 (merge Sprint 9, tag 1.0, create branch)
- BE-21 (Act 3 map generation — unblocks enemy testing)
- JR-08a/b (Act 3 enemies — independent, parallel batches)

**Phase 2 (Core Content):**
- JR-08c (Awakened One boss — after enemy systems confirmed)
- VARROW-05 (narrative — after boss structure exists)
- GD-14 (enemy art — after enemy IDs defined)
- BE-22 (daily challenge infra — independent)

**Phase 3 (Integration + Polish):**
- UX-19 (daily challenge UI — after BE-22)
- QA-13 (regression — after all content in)
- AR-10 (Act 3 music — independent)
- Stretch: UX-20, QA-14, GD-15

---

## Dependencies

```
PM-10 (merge + tag) → all other tasks (branch exists)
BE-21 (map gen) → JR-08a/b/c (enemies need encounter pools)
JR-08c (boss) → VARROW-05 (boss dialogue needs boss structure)
JR-08a/b (enemy IDs) → GD-14 (art needs IDs to name files)
BE-22 (challenge infra) → UX-19 (UI needs system)
All content tasks → QA-13 (regression after content complete)
```

---

## Explicitly NOT in Sprint 10

- Second character class (needs design spike first)
- Cloud save sync (no server infrastructure)
- Localization (post-content-complete)
- Mod support (post-stable)
- Tauri/Capacitor native builds

---

## Validation Gate

Before Sprint 10 close:
- [ ] Full 3-act playthrough (A0 + A5) without crashes
- [ ] 8 Act 3 enemies + 1 boss functional with AI
- [ ] Awakened One two-phase transition works
- [ ] Act 3 map generates correctly (floors 35-50)
- [ ] Boss dialogue and 5 events in Endless War voice
- [ ] Act 3 enemy art in sprite sheet
- [ ] Daily challenge mode functional with seeded runs
- [ ] 1800+ tests passing
- [ ] `npm run validate` passes
- [ ] Act 3 win rate: 15-25% at A0

---

## Capacity Summary

| Role | Tasks | Load |
|------|-------|------|
| **BE** | BE-21 (M), BE-22 (S) | Normal — map gen + challenge infra |
| **UX** | UX-19 (M), UX-20 (S, stretch) | Normal |
| **JR** | JR-08a (M), JR-08b (M), JR-08c (M) | Full — 3 enemy batches, sprint anchor |
| **Varrow** | VARROW-05 (M) | Normal — boss dialogue + events |
| **GD** | GD-14 (M), GD-15 (S, stretch) | Normal — enemy art batch |
| **AR** | AR-10 (S) | Light — one music track |
| **QA** | QA-13 (M), QA-14 (S, stretch) | Normal — regression + cleanup |
| **PM** | PM-10 (S) | Light — merge + coordination |

---

*Sprint 10 Plan — PM draft, pending team alignment and Mentor approval.*
*Focus: Act 3 content is the highest-impact gap post-1.0. Daily challenge adds replay value.*
