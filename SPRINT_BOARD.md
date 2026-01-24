# Sprint Board - Spire Ascent

**Last Updated:** 2026-01-24
**Current Sprint:** 2 (Stabilize & Expand)
**Process:** See PROCESS.md for workflow conventions

---

## Sprint 1 Retrospective (Foundation & Feel)

**Status:** Code committed, NOT fully validated. See BRAINSTORM_SESSION_2.md for details.

### Sprint 1 Tasks - Validation Status

| Task | Owner | Size | Status | Validated? | Issues |
|------|-------|------|--------|------------|--------|
| BE-01 | BE | L | Done | YES | GameContext 375 lines, tests pass, works at runtime |
| SL-01 | SL | M | Done | YES | 20 events load and trigger correctly |
| SL-02 | SL | S | Done | YES | Flavor text displays, no missing refs |
| QA-01 | QA | M | Done | PARTIAL | Tests pass but use fragile selectors |
| QA-02 | QA | M | Done | YES | Simulator runs 1000 games headless |
| UX-01 | UX | M | Done | YES | Animations play, don't block input |
| GD-01 | GD | M | Done | PARTIAL | Pipeline works, PNG/WebP format mismatch |
| AR-01 | AR | M | Done | YES | Audio system works with fallback silence |
| JR-01 | JR | L | Done | NO | Data layer works, UI integration broken |
| PM-01 | PM | S | Done | YES | Docs created |

### Sprint 1 Open Bugs (Carry to Sprint 2)

| Bug | Severity | Root Cause | Owner |
|-----|----------|------------|-------|
| FIX-01: Potion UI calls non-existent usePotion | P0 | PotionSlots.jsx refs action not in GameContext | JR |
| FIX-02: Save/load data format mismatch | P0 | saveSystem stores objects, metaReducer expects IDs | AR |
| FIX-03: Card effects reference missing ctx.hand | P0 | cardEffects.js uses hand but it's not in context | BE |
| FIX-04: Asset loader PNG/WebP inconsistency | P1 | assetLoader uses .png, PR claims WebP conversion | GD |
| FIX-05: barricade only on one enemy | P2 | retainBlock mechanic incomplete | JR |
| FIX-06: Fragile test selectors | P2 | Regex-based HP matching in Enemy.test | QA |

---

## Sprint 2: Stabilize & Expand

**Goal:** Fix sprint 1 runtime bugs, then add remaining Phase 1 features.
**Principle:** Fix before feature. Validate before merge. One PR per task.

### Phase A: Bug Fixes (Must complete before Phase B)

| Task | Owner | Size | Priority | Branch | Description |
|------|-------|------|----------|--------|-------------|
| FIX-01 | JR | S | P0 | `sprint-2/fix-potion-integration` | Wire USE_POTION/DISCARD_POTION through GameContext, expose in useGame hook |
| FIX-02 | AR | M | P0 | `sprint-2/fix-save-system` | Align save serialization (store IDs) with load deserialization |
| FIX-03 | BE | S | P0 | `sprint-2/fix-card-effect-context` | Pass hand array to card effect execution context |
| FIX-04 | GD | S | P1 | `sprint-2/fix-asset-format` | Update assetLoader to check WebP with PNG fallback |
| FIX-05 | JR | S | P2 | `sprint-2/fix-enemy-block` | Add retainBlock to enemies that should retain block |
| FIX-06 | QA | S | P2 | `sprint-2/fix-test-selectors` | Replace regex HP matching with data-testid attributes |

### Phase B: Remaining Sprint 1 Tasks

| Task | Owner | Size | Priority | Branch | Description |
|------|-------|------|----------|--------|-------------|
| BE-02 | BE | M | P1 | `sprint-2/be-02-normalize-state` | Normalize game state (IDs not indices) |
| UX-02 | UX | S | P2 | `sprint-2/ux-02-card-tooltips` | Card info hierarchy & damage preview tooltips |
| GD-02 | GD | M | P2 | `sprint-2/gd-02-card-frames` | Card frame & type visual system |
| JR-02 | JR | S | P2 | `sprint-2/jr-02-card-upgrades` | Card upgrade system polish |

### Phase C: Sprint 2 New Features

| Task | Owner | Size | Priority | Branch | Description |
|------|-------|------|----------|--------|-------------|
| AR-02 | AR | M | P1 | `sprint-2/ar-02-save-overhaul` | Save system overhaul with proper state serialization |
| AR-03 | AR | S | P2 | `sprint-2/ar-03-settings` | Settings & accessibility options |
| QA-03 | QA | L | P2 | `sprint-2/qa-03-e2e-tests` | E2E test suite with Playwright |

---

## Execution Order (Sprint 2)

### Day 1: P0 Bug Fixes (Parallel - independent files)
| Task | Branch | Files Touched | Status |
|------|--------|---------------|--------|
| FIX-01 | sprint-2/fix-potion-integration | GameContext.jsx, useGame.jsx, PotionSlots.jsx | Pending |
| FIX-02 | sprint-2/fix-save-system | saveSystem.js, metaReducer.js | Pending |
| FIX-03 | sprint-2/fix-card-effect-context | cardEffects.js, combatReducer.js | Pending |

### Day 1-2: P1 Fixes + Features (After P0 merged)
| Task | Branch | Files Touched | Status |
|------|--------|---------------|--------|
| FIX-04 | sprint-2/fix-asset-format | assetLoader.js | Pending |
| BE-02 | sprint-2/be-02-normalize-state | context/, data/ | Pending |
| AR-02 | sprint-2/ar-02-save-overhaul | saveSystem.js, metaReducer.js | Pending |

### Day 2-3: P2 Tasks (After P1 merged)
| Task | Branch | Files Touched | Status |
|------|--------|---------------|--------|
| FIX-05 | sprint-2/fix-enemy-block | enemies.js, effectProcessor.js | Pending |
| FIX-06 | sprint-2/fix-test-selectors | Enemy.test.jsx, Enemy.jsx | Pending |
| UX-02 | sprint-2/ux-02-card-tooltips | Card.jsx, CombatScreen.jsx | Pending |
| JR-02 | sprint-2/jr-02-card-upgrades | RestSite.jsx, cards.js | Pending |
| GD-02 | sprint-2/gd-02-card-frames | Card.jsx, App.css | Pending |
| AR-03 | sprint-2/ar-03-settings | Settings.jsx | Pending |
| QA-03 | sprint-2/qa-03-e2e-tests | tests/e2e/ (NEW) | Pending |

---

## Sprint 2 Validation Gate

Before merging sprint-2 to master:
- [ ] All P0 bugs fixed and validated at runtime
- [ ] `npm run validate` passes
- [ ] Full game playthrough without crashes
- [ ] Potion use works in combat
- [ ] Save/load round-trips correctly
- [ ] Card effects with ctx.hand work
- [ ] All new PRs follow PROCESS.md conventions

---

## Phase 2: Content & Depth (Sprint 3-4) - Backlog

| Task | Owner | Size | Priority | Description |
|------|-------|------|----------|-------------|
| BE-03 | BE | L | P2 | Meta-progression system (unlocks, achievements) |
| BE-04 | BE | M | P2 | Difficulty/ascension system (5+ levels) |
| GD-03 | GD | L | P2 | Relic & potion art (47 relics + 15 potions) |
| GD-04 | GD | M | P3 | Map visual overhaul |
| SL-03 | SL | M | P2 | Boss encounters & character dialogue |
| JR-03 | JR | L | P2 | Act 2 content expansion (10 new enemies) |
| JR-04 | JR | M | P2 | 15 new cards |

## Phase 3: Polish & Ship (Sprint 5-6) - Backlog

| Task | Owner | Size | Priority | Description |
|------|-------|------|----------|-------------|
| UX-03 | UX | M | P3 | Deck viewer & run stats |
| UX-04 | UX | M | P3 | Tutorial/first run experience |
| GD-05 | GD | M | P3 | Visual effects & particles |
| BE-05 | BE | M | P3 | Performance optimization |
| AR-04 | AR | L | P3 | Mobile responsiveness |
| QA-04 | QA | M | P3 | Pre-release QA pass |
