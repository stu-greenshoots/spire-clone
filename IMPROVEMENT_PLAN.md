# Spire Ascent - Improvement Plan

**Last Updated**: 2026-01-22
**Status**: Active Development

---

## Current State

| Metric | Value |
|--------|-------|
| Lint Errors | 0 |
| Tests Passing | 289 |
| GameContext.jsx | 1841 lines |
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
- [ ] Screen shake on big hits
- [ ] Card play animations
- [ ] Enemy death effects
- [ ] Damage number popups

### Audio
- [ ] Sound effects (card play, damage, block)
- [ ] Background music
- [ ] Mute toggle (partially implemented)

### UI/UX
- [ ] Card tooltips with keyword explanations
- [ ] Relic tooltips
- [ ] Enemy intent clarity
- [ ] Turn indicator

---

## Priority 3: Content & Balance

### Missing Features
- [ ] More card variety (currently 81 cards)
- [ ] Additional relics
- [ ] More enemy types
- [ ] Events with meaningful choices
- [ ] Potion system completion

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
├── context/
│   └── GameContext.jsx  # Main game state (1841 lines)
├── data/
│   ├── cards.js       # Card definitions
│   ├── enemies.js     # Enemy definitions
│   └── relics.js      # Relic definitions
├── systems/
│   ├── audioSystem.js
│   ├── cardEffects.js   # Card special effects
│   ├── combatSystem.js  # Damage/block calculations
│   ├── enemySystem.js   # Enemy spawning/AI
│   ├── relicSystem.js   # Relic triggers
│   └── saveSystem.js    # Save/load
├── utils/
│   └── mapGenerator.js  # Map generation
└── test/              # Test files
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
