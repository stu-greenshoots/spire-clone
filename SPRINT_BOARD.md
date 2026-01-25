# Sprint Board - Spire Ascent

**Last Updated:** 2026-01-25
**Current Sprint:** 4 (Visual Polish) - IN_PROGRESS
**Integration Branch:** `sprint-4`
**Sprint Plan:** See `docs/SPRINT_4_PLAN.md`
**Diaries:** `docs/diaries/{ROLE}.md`
**Process:** See PROCESS.md for workflow conventions
**Previous:** Sprint 3 COMPLETE (10 PRs merged, 837 tests)

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

## Sprint 2: Stabilize & Expand - COMPLETE

**Goal:** Fix sprint 1 runtime bugs, then add remaining Phase 1 features.
**Status:** COMPLETE - All validation gates passed. 11 PRs merged.

### Phase A: Bug Fixes - COMPLETE

| Task | Owner | Size | Priority | Branch | Status |
|------|-------|------|----------|--------|--------|
| FIX-01 | JR | S | P0 | `fix-01-potion-integration` | MERGED (PR #8) |
| FIX-02 | AR | M | P0 | `fix-02-save-system` | MERGED (PR #9) |
| FIX-03 | BE | S | P0 | `fix-03-card-effect-context` | MERGED (PR #10) |
| FIX-04 | GD | S | P1 | `fix-04-asset-format` | MERGED (PR #12) |
| FIX-05 | JR | S | P2 | `fix-05-enemy-block` | MERGED (PR #15) |
| FIX-06 | QA | S | P2 | `fix-06-test-selectors` | MERGED (PR #16) |

### Phase B: Remaining Sprint 1 Tasks - COMPLETE

| Task | Owner | Size | Priority | Branch | Status |
|------|-------|------|----------|--------|--------|
| BE-02 | BE | M | P1 | `be-02-normalize-state` | MERGED (PR #18) |
| UX-02 | UX | S | P2 | `ux-02-card-tooltips` | MERGED (PR #13) |
| GD-02 | GD | M | P2 | `gd-02-card-frames` | MERGED (PR #17) |
| JR-02 | JR | S | P2 | `jr-02-card-upgrades` | MERGED (PR #14) |

### Phase C: Sprint 2 New Features - PARTIAL

| Task | Owner | Size | Priority | Branch | Status |
|------|-------|------|----------|--------|--------|
| AR-02 | AR | M | P1 | `ar-02-save-overhaul` | MERGED (PR #19) |
| AR-03 | AR | S | P2 | - | Deferred to Sprint 3 |
| QA-03 | QA | L | P2 | - | Deferred to Sprint 3 |

### Sprint 2 Validation Gate - COMPLETE

- [x] All P0 bugs fixed and validated at runtime
- [x] `npm run validate` passes (837 tests green, 29 files)
- [x] Full game playthrough without crashes (fullPlaythrough.test.js)
- [x] Potion use works in combat
- [x] Save/load round-trips correctly
- [x] Card effects with ctx.hand work
- [x] All PRs follow PROCESS.md conventions
- [x] State normalized to IDs (BE-02)
- [x] Card tooltips/frames/upgrades functional

---

## Sprint 3: Review Feedback & Polish - COMPLETE

**Source:** Game Zone Magazine preview review (58/100). See `review.html` and PR #11.
**Goal:** Address reviewer feedback to reach 70+ score.
**Branch:** `sprint-3` (merged to master via PR #31)
**Status:** COMPLETE - All validation gates passed. 10 PRs merged.

### Phase A: Quick Wins - COMPLETE

| Task | Owner | Size | Priority | Branch | Status |
|------|-------|------|----------|--------|--------|
| GD-05 | GD | S | P1 | `gd-05-theme-brightness` | MERGED (PR #20) |
| PM-03 | PM/BE | XS | P1 | `pm-03-hide-data-editor` | MERGED (PR #21) |
| UX-05 | UX/GD | S | P1 | `ux-05-card-truncation` | MERGED (PR #22) |

### Phase B: UX Infrastructure - COMPLETE

| Task | Owner | Size | Priority | Branch | Status |
|------|-------|------|----------|--------|--------|
| UX-06 | UX | M | P1 | `ux-06-tooltip-infra` | MERGED (PR #24) |
| JR-05 | JR | S | P2 | `jr-05-intent-specificity` | MERGED (PR #25) |
| AR-04 | AR | S | P2 | `ar-04-audio-investigation` | MERGED (PR #26) |
| BE-05 | BE/UX | S | P1 | `be-05-damage-preview-clean` | MERGED (PR #27) |
| UX-07 | UX | M | P1 | `ux-07-combat-feedback` | Deferred to Sprint 4 |

### Phase C: Performance & Deferred - PARTIAL

| Task | Owner | Size | Priority | Branch | Status |
|------|-------|------|----------|--------|--------|
| GD-06 | GD | M | P2 | `gd-06-sprite-sheets` | Deferred to Sprint 4 |
| AR-03 | AR | S | P2 | `ar-03-settings` | Deferred to Sprint 4 |
| QA-03 | QA | L | P2 | `qa-03-e2e-tests-sprint3` | MERGED (PR #23, #29) |

### Sprint 3 Validation Gate - COMPLETE

- [x] Theme is visibly brighter (not "black rectangle" on default monitor brightness)
- [x] Card names do not truncate on reward selection screen
- [x] Tooltips display on hover for cards, relics, and status effects
- [x] Floating damage numbers appear when attacks connect
- [x] Card damage preview updates with Vulnerable modifier
- [x] No Data Editor button visible in production build
- [x] Enemy intents show specific effect (e.g., "Applying Weak 2")
- [x] Audio plays after first user interaction
- [x] `npm run validate` passes (837 tests)
- [x] Self-review against Game Zone feedback checklist

---

## Sprint 4: Visual Polish - IN_PROGRESS

**Goal:** Transform from "functional alpha" to "polished experience"; target 70+ magazine score.
**Branch:** `sprint-4`
**Plan:** See `docs/SPRINT_4_PLAN.md`

### Phase A: Map Navigation (Priority)

| Task | Owner | Size | Description | Status |
|------|-------|------|-------------|--------|
| VP-01 | UX | M | Map auto-scroll to player position | Pending |
| VP-02 | UX | S | "You are here" indicator | Pending |
| VP-03 | UX | S | Map position indicator (floor X of 15) | Pending |
| VP-04 | UX | XS | Remember scroll position on return | Pending |

### Phase B: Victory Overlay (Priority)

| Task | Owner | Size | Description | Status |
|------|-------|------|-------------|--------|
| VP-05 | UX | M | Victory as overlay on combat screen | Pending |
| VP-06 | UX | S | Defeated enemies visual (faded/grey) | Pending |
| VP-07 | UX | XS | Smooth victory transition animation | Pending |

### Phase C: Enemy Turn Animations (Priority)

| Task | Owner | Size | Description | Status |
|------|-------|------|-------------|--------|
| VP-08 | BE/UX | L | Sequential enemy turns with visible delay | Pending |
| VP-09 | UX | M | Enemy action indicator (highlight active) | Pending |
| VP-10 | UX | S | Floating damage numbers for enemy attacks | Pending |
| VP-11 | UX | S | Block applied visual for enemies | Pending |

### Phase D: Quick Polish (Lower Priority)

| Task | Owner | Size | Description | Status |
|------|-------|------|-------------|--------|
| VP-12 | PM | XS | Hide DATA EDITOR in production | DONE (Sprint 3 PM-03) |
| VP-13 | GD | S | Theme brightness pass | DONE (Sprint 3 GD-05) |
| VP-14 | UX | S | Card text truncation fix | DONE (Sprint 3 UX-05) |
| VP-15 | UX | S | Swipe hint removal for non-touch | Pending |

### Sprint 4 Validation Gate

- [ ] Map auto-scrolls to player position on load and floor change
- [ ] Player can always see where they are on the map
- [ ] Victory screen shows as overlay with combat visible behind
- [ ] Enemy turns animate one-by-one with visible feedback
- [ ] Each enemy shows "attacking" indicator during their turn
- [ ] Floating damage numbers appear for enemy attacks
- [ ] E2E tests pass with updated screenshots
- [ ] Full playthrough feels "polished" not "alpha"

---

## Phase 2: Content & Depth (Sprint 5+) - Backlog

| Task | Owner | Size | Priority | Description |
|------|-------|------|----------|-------------|
| BE-06 | BE | L | P2 | Meta-progression system (unlocks, achievements) |
| BE-07 | BE | M | P2 | Difficulty/ascension system (5+ levels) |
| GD-07 | GD | L | P2 | Relic & potion art (47 relics + 15 potions) |
| GD-08 | GD | M | P3 | Map visual overhaul |
| SL-03 | SL | M | P2 | Boss encounters & character dialogue |
| JR-03 | JR | L | P2 | Act 2 content expansion (10 new enemies) |
| JR-04 | JR | M | P2 | 15 new cards |

## Phase 3: Polish & Ship (Sprint 6+) - Backlog

| Task | Owner | Size | Priority | Description |
|------|-------|------|----------|-------------|
| UX-08 | UX | M | P3 | Deck viewer & run stats |
| UX-09 | UX | M | P3 | Tutorial/first run experience |
| GD-09 | GD | M | P3 | Visual effects & particles |
| BE-08 | BE | M | P3 | Performance optimization |
| AR-05 | AR | L | P3 | Mobile responsiveness |
| QA-04 | QA | M | P3 | Pre-release QA pass |
