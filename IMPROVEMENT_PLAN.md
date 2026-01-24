# Spire Ascent - Improvement Plan

**Last Updated**: 2026-01-24
**Status**: Sprint 1 code committed, validation incomplete. Sprint 2 starting.
**Process**: See PROCESS.md for workflow conventions.

---

## Current State

| Metric | Value | Notes |
|--------|-------|-------|
| Lint Errors | 0 | Fixed in PR #6 |
| Tests Passing | 763 | Up from 289 baseline |
| GameContext.jsx | 375 lines | Down from 2,352 (orchestrator only) |
| Build | Passing | |
| Runtime Bugs | 3 P0, 1 P1, 2 P2 | See below |
| CI | Active | GitHub Actions on push/PR |

### Important Distinction: Committed vs Validated

| Category | Committed | Validated at Runtime |
|----------|-----------|---------------------|
| Context split (BE-01) | YES | YES |
| Events (SL-01) | YES | YES |
| Flavor text (SL-02) | YES | YES |
| Balance simulator (QA-02) | YES | YES |
| Audio system (AR-01) | YES | YES (with silent fallback) |
| Combat feedback (UX-01) | YES | YES |
| Enemy art pipeline (GD-01) | YES | PARTIAL (format mismatch) |
| Component tests (QA-01) | YES | PARTIAL (fragile selectors) |
| Potion system (JR-01) | YES | NO (UI broken) |
| Save system | YES | NO (data format mismatch) |

---

## Runtime Bugs (P0 - Must Fix)

### BUG-01: Potion UI Integration Broken
- **File:** `src/components/PotionSlots.jsx`
- **Issue:** Calls `usePotion` from `useGame` hook, but this action is never dispatched through GameContext
- **Impact:** Clicking a potion in combat does nothing (or throws)
- **Fix:** Add USE_POTION and DISCARD_POTION action handlers to GameContext/combatReducer, expose in useGame hook

### BUG-02: Save/Load Data Format Mismatch
- **File:** `src/systems/saveSystem.js` / `src/context/reducers/metaReducer.js`
- **Issue:** `saveGame()` stores full card/relic objects; `loadGame()` in metaReducer expects ID strings and tries to reconstruct
- **Impact:** Saving works but loading corrupts game state
- **Fix:** Either serialize to IDs in saveSystem or deserialize full objects in metaReducer (IDs is the correct approach)

### BUG-03: Card Effects Missing Context
- **File:** `src/systems/cardEffects.js`
- **Issue:** Effects `costReduceOnHpLoss`, `damagePerStatus`, `gainStrengthOnKill` reference `ctx.hand` which isn't passed to the effect execution context
- **Impact:** Playing cards with these effects throws or silently fails
- **Fix:** Pass `hand` array as part of the effect context object in combatReducer

---

## Known Issues (P1-P2)

### ISSUE-04: Asset Format Confusion (P1)
- **File:** `src/utils/assetLoader.js`
- **Issue:** Uses `.png` extension for enemy images, but sprint 1 PR claimed WebP conversion
- **Impact:** May load wrong format or 404 on missing files
- **Fix:** Check WebP first with PNG fallback, or confirm which format actually exists

### ISSUE-05: Incomplete Block Retention (P2)
- **File:** `src/data/enemies.js` / `src/systems/effectProcessor.js`
- **Issue:** `barricade`/`retainBlock` flag only set on `sphericGuardian`. Other enemies that should retain block don't have the property.
- **Impact:** Block-retaining enemies lose block each turn
- **Fix:** Audit enemy data, add retainBlock where appropriate

### ISSUE-06: Fragile Test Selectors (P2)
- **File:** `src/test/components/Enemy.test.jsx`
- **Issue:** Uses regex `/44.*\/.*44/` to match HP display
- **Impact:** Tests break with any UI format change
- **Fix:** Add `data-testid` attributes, query by those instead

---

## Completed Work (Validated)

- [x] ESLint configuration (0 errors)
- [x] Test infrastructure (763 tests, Vitest)
- [x] CI/CD pipeline (GitHub Actions, Node 18+20)
- [x] Error boundaries
- [x] Combat system extracted (`combatSystem.js`)
- [x] Relic system extracted (`relicSystem.js`)
- [x] Enemy system extracted (`enemySystem.js`)
- [x] Card effects extracted (`cardEffects.js`)
- [x] Map generator extracted (`mapGenerator.js`)
- [x] GameContext split into domain reducers (BE-01)
- [x] Audio system with manager/volume/fade (AR-01)
- [x] 20 game events with trade-off choices (SL-01)
- [x] Card/enemy/relic flavor text (SL-02)
- [x] Combat feedback animations (UX-01)
- [x] Enemy art pipeline with fallback (GD-01)
- [x] Balance simulator 1000-run headless (QA-02)
- [x] Component tests 43+ tests (QA-01)
- [x] Sprint coordination docs (PM-01)
- [x] GitHub Pages deployment
- [x] PR template and process docs

## Committed But NOT Validated

- [ ] Potion system UI integration (JR-01 - data layer works, UI broken)
- [ ] Save/load system (broken data format)
- [ ] 3 card effects using ctx.hand (broken at runtime)
- [ ] WebP asset optimization (format mismatch)

---

## Priority 1: Fix Runtime Bugs (Sprint 2, Phase A)

All P0 bugs must be fixed before new features. Each fix = own branch, own PR:

1. `sprint-2/fix-potion-integration` - Wire potion actions end-to-end
2. `sprint-2/fix-save-system` - Serialize/deserialize consistently
3. `sprint-2/fix-card-effect-context` - Pass hand to effect context

---

## Priority 2: Remaining Phase 1 Features (Sprint 2, Phase B-C)

| Feature | Status | Next Step |
|---------|--------|-----------|
| State normalization (BE-02) | Not started | After P0 fixes |
| Card tooltips (UX-02) | Not started | Independent |
| Card frames (GD-02) | Not started | After GD-01 format fix |
| Card upgrades (JR-02) | Not started | Independent |
| Save system overhaul (AR-02) | Not started | After FIX-02 |
| Settings (AR-03) | Not started | After AR-02 |
| E2E tests (QA-03) | Not started | After P0 fixes |

---

## Priority 3: Map System Improvements

### Issues Identified
1. Connection algorithm bias - nodes on right edge converge
2. Limited path branching - only 1-2 connections per node
3. No path validation - unreachable nodes possible
4. Act parameter unused - no variation between acts
5. Fixed 15-floor structure - no difficulty scaling

---

## Architecture

```
src/
├── components/        # React components
│   ├── AnimationOverlay.jsx  # Damage floats, effects
│   └── PotionSlots.jsx       # BROKEN - needs GameContext wiring
├── context/
│   ├── GameContext.jsx       # Orchestrator (375 lines)
│   └── reducers/
│       ├── combatReducer.js  # Combat actions
│       ├── mapReducer.js     # Map/node actions
│       ├── metaReducer.js    # Game lifecycle (BROKEN load)
│       ├── rewardReducer.js  # Reward collection
│       ├── shopReducer.js    # Shop actions
│       └── combat/           # Combat sub-actions
├── data/
│   ├── cards.js       # 81 card definitions
│   ├── enemies.js     # 34 enemies (block retention incomplete)
│   ├── events.js      # 20 game events
│   ├── flavorText.js  # World building text
│   ├── potions.js     # 15 potions
│   └── relics.js      # 47 relic definitions
├── systems/
│   ├── audioSystem.js    # Audio manager
│   ├── cardEffects.js    # BROKEN - ctx.hand missing
│   ├── combatSystem.js   # Damage/block calculations
│   ├── enemySystem.js    # Enemy spawning/AI
│   ├── potionSystem.js   # Potion effects (data layer works)
│   ├── relicSystem.js    # Relic triggers
│   └── saveSystem.js     # BROKEN - format mismatch
├── utils/
│   ├── assetLoader.js    # Image loading (format issue)
│   └── mapGenerator.js   # Map generation
└── test/
    ├── balance/          # Headless combat simulator
    └── components/       # React component tests
```

---

## Commands

```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run lint             # Check for errors
npm run test:run         # Run tests once
npm run test:coverage    # Coverage report
npm run validate         # lint + test:run + build (all must pass)
npm run validate:quick   # test:run only
```
