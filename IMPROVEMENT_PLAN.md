# Spire Ascent - Improvement Plan

**Last Updated**: 2026-01-24
**Status**: Active Development - Sprint 1 Day 1 Complete

---

## Current State

| Metric | Value |
|--------|-------|
| Lint Errors | 0 |
| Tests Passing | 763 |
| GameContext.jsx | 375 lines (orchestrator) |
| Build | Passing |

### Completed Work
- [x] ESLint configuration fixed
- [x] Test coverage infrastructure
- [x] Error boundaries added
- [x] CI/CD pipeline (GitHub Actions)
- [x] Combat system extracted to `src/systems/combatSystem.js`
- [x] Relic system extracted to `src/systems/relicSystem.js`
- [x] Enemy system extracted to `src/systems/enemySystem.js`
- [x] Card effects extracted to `src/systems/cardEffects.js`
- [x] Map generator extracted to `src/utils/mapGenerator.js`
- [x] Save system implemented in `src/systems/saveSystem.js`
- [x] GameContext split into domain reducers (BE-01)
- [x] Audio system expanded with manager, volume, fade (AR-01)
- [x] 20 game events created (SL-01)
- [x] Card/enemy/relic flavor text (SL-02)
- [x] Potion system: 15 potions with full effects (JR-01)
- [x] Combat feedback: animations, damage floats, death effects (UX-01)
- [x] Enemy art pipeline with fallback (GD-01)
- [x] Balance simulator: 1000-run headless testing (QA-02)
- [x] Component tests: 43 tests across 5 files (QA-01)
- [x] Sprint coordination docs (PM-01)

---

## Priority 1: Map System Improvements

### Issues Identified
1. **Connection algorithm bias** - Nodes on right edge get all connections converging
2. **Limited path branching** - Only 1-2 connections per node, restricts player choice
3. **No path validation** - Possible to generate unreachable nodes
4. **Act parameter unused** - `generateMap(act)` ignores the act for variation
5. **Fixed 15-floor structure** - No difficulty scaling between acts

### Tasks
- [ ] Fix connection algorithm to distribute paths evenly
- [ ] Ensure all nodes are reachable (path validation)
- [ ] Add act-specific map variations
- [ ] Improve visual path clarity

---

## Priority 2: Game Polish

### Combat Feel
- [x] Screen shake on big hits
- [x] Card play animations
- [x] Enemy death effects
- [x] Damage number popups

### Audio
- [x] Audio manager with volume/fade/categories
- [ ] Source actual sound effect files (CC0)
- [ ] Background music tracks
- [x] Volume controls in Settings

### UI/UX
- [ ] Card tooltips with keyword explanations (UX-02)
- [ ] Relic tooltips
- [ ] Enemy intent clarity
- [x] Turn indicator

---

## Priority 3: Content & Balance

### Missing Features
- [ ] More card variety (currently 81 cards, JR-04 adds 15 more)
- [ ] Additional relics
- [ ] More enemy types (JR-03: 10 new Act 2 enemies)
- [x] Events with meaningful choices (20 events)
- [x] Potion system (15 potions with effects)

### Balance
- [ ] Enemy damage scaling per act
- [ ] Card reward quality by floor
- [ ] Elite difficulty tuning
- [ ] Boss pattern variety

---

## Architecture

```
src/
├── components/        # React components
│   └── AnimationOverlay.jsx  # Damage floats, effects
├── context/
│   ├── GameContext.jsx       # Orchestrator (375 lines)
│   └── reducers/
│       ├── combatReducer.js  # Combat actions
│       ├── mapReducer.js     # Map/node actions
│       ├── metaReducer.js    # Game lifecycle
│       ├── rewardReducer.js  # Reward collection
│       ├── shopReducer.js    # Shop actions
│       └── combat/           # Combat sub-actions
├── data/
│   ├── cards.js       # 81 card definitions
│   ├── enemies.js     # Enemy definitions
│   ├── events.js      # 20 game events
│   ├── flavorText.js  # World building text
│   ├── potions.js     # 15 potions
│   └── relics.js      # 47 relic definitions
├── hooks/
│   └── useAnimations.js  # Animation state machine
├── systems/
│   ├── audioSystem.js    # Audio manager (volume, fade, categories)
│   ├── cardEffects.js    # Card special effects
│   ├── combatSystem.js   # Damage/block calculations
│   ├── enemySystem.js    # Enemy spawning/AI
│   ├── potionSystem.js   # Potion effects
│   ├── relicSystem.js    # Relic triggers
│   └── saveSystem.js     # Save/load
├── utils/
│   ├── assetLoader.js    # Image preloading, fallback
│   └── mapGenerator.js   # Map generation
└── test/
    ├── balance/          # Headless combat simulator
    └── components/       # React component tests
```

---

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # Check for errors
npm test             # Run tests
npm run test:coverage # Coverage report
```
