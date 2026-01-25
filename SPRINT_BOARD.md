# Sprint Board - Spire Ascent

**Last Updated:** 2026-01-24
**Current Sprint:** 2 (Stabilize & Expand) - COMPLETE ✓ All validation gates passed
**Integration Branch:** `sprint-2` (pushed to origin)
**Kickoff Plan:** See SPRINT_2_PLAN.md
**Diaries:** `docs/diaries/{ROLE}.md`
**Process:** See PROCESS.md for workflow conventions

---

## Sprint 1 Retrospective (Foundation & Feel)

**Status:** Code committed, NOT fully validated.

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
| FIX-01 | JR | S | P0 | `fix-01-potion-integration` | Wire USE_POTION/DISCARD_POTION through GameContext, expose in useGame hook |
| FIX-02 | AR | M | P0 | `fix-02-save-system` | Align save serialization (store IDs) with load deserialization |
| FIX-03 | BE | S | P0 | `fix-03-card-effect-context` | Pass hand array to card effect execution context |
| FIX-04 | GD | S | P1 | `fix-04-asset-format` | Update assetLoader to check WebP with PNG fallback |
| FIX-05 | JR | S | P2 | `fix-05-enemy-block` | Add retainBlock to enemies that should retain block |
| FIX-06 | QA | S | P2 | `fix-06-test-selectors` | Replace regex HP matching with data-testid attributes |

### Phase B: Remaining Sprint 1 Tasks

| Task | Owner | Size | Priority | Branch | Description |
|------|-------|------|----------|--------|-------------|
| BE-02 | BE | M | P1 | `be-02-normalize-state` | Normalize game state (IDs not indices) |
| UX-02 | UX | S | P2 | `ux-02-card-tooltips` | Card info hierarchy & damage preview tooltips |
| GD-02 | GD | M | P2 | `gd-02-card-frames` | Card frame & type visual system |
| JR-02 | JR | S | P2 | `jr-02-card-upgrades` | Card upgrade system polish |

### Phase C: Sprint 2 New Features

| Task | Owner | Size | Priority | Branch | Description |
|------|-------|------|----------|--------|-------------|
| AR-02 | AR | M | P1 | `ar-02-save-overhaul` | Save system overhaul with proper state serialization |
| AR-03 | AR | S | P2 | `ar-03-settings` | Settings & accessibility options |
| QA-03 | QA | L | P2 | `qa-03-e2e-tests` | E2E test suite with Playwright |

---

## Execution Order (Sprint 2)

### Day 1: P0 Bug Fixes (Parallel - independent files)
| Task | Branch | Files Touched | Status |
|------|--------|---------------|--------|
| FIX-01 | fix-01-potion-integration | GameContext.jsx, PotionSlots.jsx | MERGED (PR #8) |
| FIX-02 | fix-02-save-system | saveSystem.js, metaReducer.js | MERGED (PR #9) |
| FIX-03 | fix-03-card-effect-context | combatReducer.js | MERGED (PR #10) |

### Day 1-2: P1 Fixes + Features (After P0 merged)
| Task | Branch | Files Touched | Status |
|------|--------|---------------|--------|
| FIX-04 | fix-04-asset-format | assetLoader.js | MERGED (PR #12) |
| BE-02 | be-02-normalize-state | context/, data/ | Pending |
| AR-02 | ar-02-save-overhaul | saveSystem.js, metaReducer.js | Pending |

### Day 2-3: P2 Tasks (After P1 merged)
| Task | Branch | Files Touched | Status |
|------|--------|---------------|--------|
| FIX-05 | fix-05-enemy-block | enemies.js, effectProcessor.js | Pending |
| FIX-06 | fix-06-test-selectors | Enemy.test.jsx, Enemy.jsx | Pending |
| UX-02 | ux-02-card-tooltips | CombatScreen.jsx | PR #13 Open |
| JR-02 | jr-02-card-upgrades | RestSite.jsx | PR #14 Open |
| GD-02 | gd-02-card-frames | Card.jsx, App.css | Pending |
| AR-03 | ar-03-settings | Settings.jsx | Pending |
| QA-03 | qa-03-e2e-tests | tests/e2e/ (NEW) | Pending |

---

## Sprint 2 Validation Gate

Before merging sprint-2 to master:
- [x] All P0 bugs fixed and validated at runtime (FIX-01, FIX-02, FIX-03 merged)
- [x] `npm run validate` passes (837+ tests green)
- [x] Full game playthrough without crashes (fullPlaythrough.test.js: 20 tests covering all phases)
- [x] Potion use works in combat (FIX-01)
- [x] Save/load round-trips correctly (FIX-02)
- [x] Card effects with ctx.hand work (FIX-03)
- [x] All new PRs follow PROCESS.md conventions
- [x] Asset format fixed (FIX-04)

---

## Sprint 3: Review Feedback & Polish - Backlog

**Source:** Game Zone Magazine preview review (58/100). See `review.html` and PR #11 comments for full context.
**Goal:** Address reviewer feedback to reach 70+ score. Fix before feature.

### Sprint 3 Phase A: Quick Wins (High impact, low effort)

| Task | Owner | Size | Priority | Description |
|------|-------|------|----------|-------------|
| GD-05 | GD | S | P1 | Theme brightness pass — raise background from #0a0a0f to ~#1a1a2e, CSS variable sweep |
| PM-03 | PM/BE | XS | P1 | Hide Data Editor button in production build (env gate) |
| UX-05 | UX/GD | S | P1 | Fix card text truncation — font sizing or auto-resize on overflow |

### Sprint 3 Phase B: UX Infrastructure (Medium effort, high impact)

| Task | Owner | Size | Priority | Description |
|------|-------|------|----------|-------------|
| UX-06 | UX | M | P1 | Tooltip infrastructure — generic Portal-based Tooltip component for cards, relics, potions, status effects |
| UX-07 | UX | M | P1 | Combat feedback — floating damage/block/heal numbers via AnimationOverlay queue |
| BE-05 | BE/UX | S | P1 | Damage preview with modifiers — card numbers reflect Vulnerable/Weak, turn green when boosted |
| JR-05 | JR | S | P2 | Enemy intent specificity — show "Applying Weak 2" instead of generic "Debuff" |

### Sprint 3 Phase C: Performance & Audio

| Task | Owner | Size | Priority | Description |
|------|-------|------|----------|-------------|
| GD-06 | GD | M | P2 | Card art sprite sheet/atlas — reduce 100+ network requests to bundled sprites |
| AR-04 | AR | S | P2 | Audio investigation — verify audioSystem.js plays audio, check Web Audio API autoplay policy |

### Sprint 3 Validation Gate

Before closing Sprint 3:
- [ ] Theme is visibly brighter (not "black rectangle" on default monitor brightness)
- [ ] Card names do not truncate on reward selection screen
- [ ] Tooltips display on hover for cards, relics, and status effects
- [ ] Floating damage numbers appear when attacks connect
- [ ] Card damage preview updates with Vulnerable modifier
- [ ] No Data Editor button visible in production build
- [ ] Self-review against Game Zone feedback checklist before inviting re-review

---

## Phase 2: Content & Depth (Sprint 4-5) - Backlog

| Task | Owner | Size | Priority | Description |
|------|-------|------|----------|-------------|
| BE-06 | BE | L | P2 | Meta-progression system (unlocks, achievements) |
| BE-07 | BE | M | P2 | Difficulty/ascension system (5+ levels) |
| GD-07 | GD | L | P2 | Relic & potion art (47 relics + 15 potions) |
| GD-08 | GD | M | P3 | Map visual overhaul |
| SL-03 | SL | M | P2 | Boss encounters & character dialogue |
| JR-03 | JR | L | P2 | Act 2 content expansion (10 new enemies) |
| JR-04 | JR | M | P2 | 15 new cards |

## Phase 3: Polish & Ship (Sprint 5-6) - Backlog

| Task | Owner | Size | Priority | Description |
|------|-------|------|----------|-------------|
| UX-08 | UX | M | P3 | Deck viewer & run stats |
| UX-09 | UX | M | P3 | Tutorial/first run experience |
| GD-09 | GD | M | P3 | Visual effects & particles |
| BE-08 | BE | M | P3 | Performance optimization |
| AR-05 | AR | L | P3 | Mobile responsiveness |
| QA-04 | QA | M | P3 | Pre-release QA pass |
