# Sprint Board - Spire Ascent

**Last Updated:** 2026-01-30
**Current Sprint:** 7 (Mobile Combat + Act 2 Content + Narrative Voice) - PLANNED
**Integration Branch:** `sprint-7` (to be created)
**Sprint Plan:** See `SPRINT_7_PLAN.md`
**Roadmap:** See `ROADMAP.md` (4-sprint plan to 1.0)
**Diaries:** `docs/diaries/{ROLE}.md`
**Process:** See PROCESS.md for workflow conventions
**Previous:** Sprint 5 COMPLETE (all tasks merged, 911+ tests, meta-progression + ascension live)

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

## Sprint 4: Visual Polish - COMPLETE

**Goal:** Transform from "functional alpha" to "polished experience"; target 70+ magazine score.
**Branch:** `sprint-4` (merged to master via PR #38)
**Status:** COMPLETE - All VP tasks merged, validation gate passed.

### Phase A: Map Navigation (Priority)

| Task | Owner | Size | Description | Status |
|------|-------|------|-------------|--------|
| VP-01 | UX | M | Map auto-scroll to player position | MERGED (PR #33) |
| VP-02 | UX | S | "You are here" indicator | MERGED (PR #33) |
| VP-03 | UX | S | Map position indicator (floor X of 15) | MERGED (PR #33) |
| VP-04 | UX | XS | Remember scroll position on return | MERGED (PR #37) |

### Phase B: Victory Overlay (Priority)

| Task | Owner | Size | Description | Status |
|------|-------|------|-------------|--------|
| VP-05 | UX | M | Victory as overlay on combat screen | MERGED (PR #34) |
| VP-06 | UX | S | Defeated enemies visual (faded/grey) | MERGED (PR #34) |
| VP-07 | UX | XS | Smooth victory transition animation | MERGED (PR #36) |

### Phase C: Enemy Turn Animations (Priority)

| Task | Owner | Size | Description | Status |
|------|-------|------|-------------|--------|
| VP-08 | BE/UX | L | Sequential enemy turns with visible delay | MERGED (PR #33) |
| VP-09 | UX | M | Enemy action indicator (highlight active) | MERGED (PR #33) |
| VP-10 | UX | S | Floating damage numbers for enemy attacks | MERGED (PR #35) |
| VP-11 | UX | S | Block applied visual for enemies | MERGED (PR #33) |

### Phase D: Quick Polish (Lower Priority)

| Task | Owner | Size | Description | Status |
|------|-------|------|-------------|--------|
| VP-12 | PM | XS | Hide DATA EDITOR in production | DONE (Sprint 3 PM-03) |
| VP-13 | GD | S | Theme brightness pass | DONE (Sprint 3 GD-05) |
| VP-14 | UX | S | Card text truncation fix | DONE (Sprint 3 UX-05) |
| VP-15 | UX | S | Swipe hint removal for non-touch | MERGED (PR #33) |

### Sprint 4 Validation Gate - COMPLETE

- [x] Map auto-scrolls to player position on load and floor change
- [x] Player can always see where they are on the map
- [x] Victory screen shows as overlay with combat visible behind
- [x] Enemy turns animate one-by-one with visible feedback
- [x] Each enemy shows "attacking" indicator during their turn
- [x] Floating damage numbers appear for enemy attacks
- [x] E2E tests pass with updated screenshots
- [x] Full playthrough feels "polished" not "alpha"

---

## Sprint 5: Replayability - COMPLETE

**Goal:** Establish meta-progression and ascension systems for player retention
**Branch:** `sprint-5`
**Plan:** See `SPRINT_5_PLAN.md`
**Status:** COMPLETE - All P0/P1 tasks merged, validation gate passed

### Key Discovery
Sprint 5 is primarily INTEGRATION work. Core systems already exist:
- `progressionSystem.js` - 10 achievements, 5 unlock milestones
- `ascensionSystem.js` - 11 levels with modifier functions
- `DeckViewer.jsx` - 93-line component with sort/filter
- `Settings.jsx` - Complete with volume, animation speed, text size

### Sprint 5 Tasks

| Task | Owner | Size | Priority | Description | Status |
|------|-------|------|----------|-------------|--------|
| BE-06 | BE | M | P0 | Meta-progression integration (wire existing system) | MERGED (PR #40) |
| BE-07 | BE | M | P0 | Ascension integration (apply modifiers at SELECT_NODE) | MERGED (PR #43) |
| SL-03 | SL | M | P0 | Boss encounters & dialogue (data + BossDialogue.jsx) | MERGED (PR #41) |
| UX-08 | UX | M | P1 | Deck viewer integration (wire to MapScreen) | MERGED (PR #42) |
| QA-05 | QA | M | P1 | Sprint 5 test coverage + balance simulator update | MERGED (PR #44) |
| AR-03 | AR | XS | P2 | Settings verification (smoke test) | MERGED (PR #45) |
| GD-06 | GD | M | P2 | Sprite sheet bundling | Deferred to Sprint 6 |

### Removed from Sprint 5
- **JR-04** - All 15 cards already exist in cards.js. JR reallocated to QA-05 support.

### Sprint 5 Validation Gate - COMPLETE

- [x] Meta-progression persists across browser sessions
- [x] Ascension 1 unlocks after first win
- [x] Enemy HP is 10% higher on Ascension 1
- [x] All 3 Act 1 bosses have dialogue (intro, mid-fight, death)
- [x] Deck viewer accessible from map screen
- [x] Balance simulator supports ascension config
- [x] Win rate 20-40% at each ascension level (0-5)
- [x] `npm run validate` passes (911+ tests)

---

## Sprint 6: Fix + Foundation + Narrative Start - COMPLETE

**Goal:** Fix confirmed bugs, audit UX, begin Endless War narrative.
**Plan:** See `SPRINT_6_PLAN.md`
**Branch:** `sprint-6` (merged to master via PR #49)
**Status:** COMPLETE - All P0/P1 merged, BE-09 deferred to Sprint 7, stretch items deferred

### P0 — Must Ship

| Task | Owner | Size | Description | Status |
|------|-------|------|-------------|--------|
| BE-16 | BE | S | Power card fix — remove from play, not discard | MERGED (PR #51) |
| UX-10 | UX | M | Focused top-20 UX hit list | MERGED (PR #54) |
| QA-07a | QA | S | Mechanics audit spike — verify 4 Copilot claims | MERGED (PR #50) |
| VARROW-01 | Varrow | M | Act 1 boss dialogue ("Endless War") | MERGED (PR #50) |

### P1 — Should Ship

| Task | Owner | Size | Description | Status |
|------|-------|------|-------------|--------|
| BE-10 | BE | M | Status effect timing fix | MERGED (PR #55) |
| BE-09 | BE | M | Starting bonus / Neow | DEFERRED (Sprint 7) |
| UX-11 | UX | S | Block indicator — no layout jumps | MERGED (PR #56) |
| QA-06 | QA | M | Balance pass (25-35% win rate A0) | MERGED (PR #57) |
| JR-fix | JR | S | Enemy HP accuracy (Sentry → StS baseline) | MERGED (PR #52) |
| JR-prep | JR | — | Draft 10 Act 2 enemy designs (doc only) | MERGED (PR #58) |
| GD-06 | GD | S | Sprite sheets (deferred from Sprint 4) | MERGED (PR #53) |

### P2 — Stretch

| Task | Owner | Size | Description | Status |
|------|-------|------|-------------|--------|
| UX-12 | UX | S | Smart card targeting | DEFERRED (Sprint 7) |
| GD-audit | GD | S | Asset audit — catalog gaps | DEFERRED (Sprint 7) |

---

## Sprint 7: Mobile Combat + Act 2 Content + Narrative Voice - IN PROGRESS

**Goal:** Make combat feel professional on mobile. Correct and expand the Act 2 enemy roster. Extend the Endless War narrative.
**Plan:** See `SPRINT_7_PLAN.md`
**Branch:** `sprint-7`
**Status:** NEAR COMPLETE — 9/9 P0 + 4/5 P1 merged (13 PRs), QA-08b deferred

### P0 — Must Ship (ALL COMPLETE)

| Task | Owner | Size | Description | Status |
|------|-------|------|-------------|--------|
| GD-08 | GD | S | Style guide — palette, fonts, spacing, component patterns | MERGED (PR #60) |
| BE-18 | BE | M | Act 2 enemy systems — Plated Armor, Confused, Artifact, Lifesteal | MERGED (PR #62) |
| UX-13a | UX | M | Mobile combat: collapsible HUD + vertical zones + header rework | MERGED (PR #65) |
| UX-13b | UX | M | Mobile combat: card fan/arc + tap-to-play | MERGED (PR #70) |
| UX-13c | UX | S | Mobile combat: long-press inspect + inline enemy info | MERGED (PR #73) |
| JR-03a | JR | M | Act 2 enemies: Centurion + Mystic (ally pair) + Snecko | MERGED (PR #63) |
| JR-03b | JR | M | Act 2 enemies: Chosen + Shelled Parasite + Byrd | MERGED (PR #64) |
| JR-03c | JR | M | Act 2 enemies: Book of Stabbing + Gremlin Leader + Reptomancer (+ Dagger) | MERGED (PR #66) |
| VARROW-02 | Varrow | M | Event rewrite — 10 events become "pattern glitches" in the Endless War | MERGED (PR #61) |

### P1 — Should Ship

| Task | Owner | Size | Description | Status |
|------|-------|------|-------------|--------|
| JR-03d | JR | L | Automaton boss + Bronze Orbs (simplified — no Stasis) | MERGED (PR #68) |
| BE-19 | BE | S | Encounter weighting for Act 2 map (DEC-017) | MERGED (PR #71) |
| AR-05a | AR | S | Touch targets — 44px minimum on all interactive elements | MERGED (PR #72) |
| QA-08a | QA | M | Act 2 enemy regression — AI patterns, new systems | MERGED (PR #75) |
| QA-08b | QA | S | Combat redesign viewport testing — desktop + mobile | DEFERRED (E2E flaky) |

### P2 — Stretch

| Task | Owner | Size | Description | Status |
|------|-------|------|-------------|--------|
| UX-12 | UX | S | Smart card targeting (deferred from Sprint 6) | PENDING |
| GD-audit | GD | S | Asset audit — catalog gaps (deferred from Sprint 6) | PENDING |

---

## Sprints 8–9: See `ROADMAP.md`

**Sprint 8:** Polish + Juice + Gameplay Quality Infrastructure
**Sprint 9:** Ship Prep + QA + 1.0 (Web + PWA)
