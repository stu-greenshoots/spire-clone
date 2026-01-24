# Spire Ascent - Claude Code Project Instructions

## Required Reading (Every Session)

Before starting any work, read these files to understand current state:

1. **SPRINT_BOARD.md** - Current sprint, task status, what's in progress
2. **PROCESS.md** - Branch naming, PR workflow, commit conventions
3. **DEFINITION_OF_DONE.md** - When is a task actually done (not just committed)

For deeper context (read when relevant to your task):
- **DEPENDENCIES.md** - Task ordering, conflict zones, what blocks what
- **TEAM_PLAN.md** - Full phase breakdown, all task details
- **GAME_REFERENCE.md** - Card/enemy/relic mechanics (for content tasks)

## Git Flow

### Branch Structure
```
master                              (stable, protected)
  └── sprint-N                      (integration branch)
       └── sprint-N/task-id-desc    (one task, one branch)
```

### Branch Naming
```
sprint-{N}/{task-id}-{short-description}
```
- All lowercase, hyphens only
- No auto-generated suffixes
- Examples: `sprint-2/fix-potion-integration`, `sprint-2/be-02-normalize-state`

### Workflow Per Task
```bash
git checkout sprint-2
git pull origin sprint-2
git checkout -b sprint-2/task-id-description
# ... do work ...
npm run validate                    # MUST pass before push
git add <specific-files>
git commit -m "TASK-ID: description"
git push -u origin sprint-2/task-id-description
# Open PR targeting sprint-2 branch
```

### Commit Messages
```
TASK-ID: short description

Examples:
FIX-01: Wire usePotion action through GameContext
BE-02: Extract player state to use entity IDs
JR-03: Add 5 Act 2 normal enemies with movesets
```

### PR Rules
- Target: `sprint-N` branch (never master directly)
- Title: `TASK-ID: Description`
- Max ~300 lines changed
- CI must pass
- Smoke test documented
- Use the template in `.github/pull_request_template.md`

## Team Members

Each "team member" is a role with owned files and responsibilities. When working as a specific role, stay within your file boundaries.

### PM (Project Manager)
- **Owns:** `*.md` docs, `package.json` scripts, `.github/`
- **Focus:** Sprint coordination, process, CI/CD, PR management
- **Current tasks:** Close PR #4, maintain sprint board

### BE (Back Ender)
- **Owns:** `src/context/`, `src/context/reducers/`
- **Focus:** Architecture, state management, performance
- **Current tasks:** FIX-03 (card effect context), BE-02 (normalize state)
- **Rule:** Same public interfaces - useGame hook shape must not change without team discussion

### JR (Junior Developer)
- **Owns:** `src/data/potions.js`, `src/systems/potionSystem.js`, `src/components/PotionSlots.jsx`
- **Focus:** Potion system, card upgrades, new content
- **Current tasks:** FIX-01 (potion UI integration), FIX-05 (enemy block), JR-02 (card upgrades)
- **Rule:** Build against existing APIs. If a function doesn't exist in the hook, don't call it - wire it up first.

### AR (Allrounder)
- **Owns:** `src/systems/audioSystem.js`, `src/systems/saveSystem.js`, `src/components/Settings.jsx`
- **Focus:** Audio, save/load, settings, honest assessment
- **Current tasks:** FIX-02 (save system format), AR-02 (save overhaul), AR-03 (settings)
- **Rule:** Data formats must match between save and load. Serialize IDs, not full objects.

### UX (UX Guy)
- **Owns:** `src/components/CombatScreen.jsx`, `src/components/AnimationOverlay.jsx`, `src/hooks/useAnimations.js`
- **Focus:** Combat feedback, tooltips, visual polish
- **Current tasks:** UX-02 (card tooltips)
- **Rule:** Animations must not block input. Speed multiplier always respected.

### GD (Graphic Designer)
- **Owns:** `public/images/`, `src/utils/assetLoader.js`, `scripts/compress-images.js`
- **Focus:** Art pipeline, asset optimization, visual consistency
- **Current tasks:** FIX-04 (asset format), GD-02 (card frames)
- **Rule:** Always provide fallback when assets missing. Lazy-load images.

### SL (Story Line)
- **Owns:** `src/data/events.js`, `src/data/flavorText.js`
- **Focus:** Events, world building, narrative, dialogue
- **Rule:** Only reference effects/systems that currently exist. No forward-referencing unbuilt features.

### QA (Tester)
- **Owns:** `src/test/`, test infrastructure
- **Focus:** Component tests, balance simulator, E2E tests
- **Current tasks:** FIX-06 (test selectors), QA-03 (E2E tests)
- **Rule:** Tests validate behavior against real interfaces. Use data-testid, not fragile regex.

## Key Commands

```bash
npm run dev              # Dev server (localhost:5173)
npm run validate         # lint + test + build (run before EVERY push)
npm run validate:quick   # tests only
npm run lint             # ESLint check
npm run test:run         # Vitest once
npm run build            # Production build
```

## Critical Rules

1. **One PR per task.** No bundling multiple tasks.
2. **`npm run validate` before push.** No exceptions.
3. **Smoke test your change.** Run the game, click things, document what works.
4. **Tests passing ≠ validated.** Feature must work at runtime in the actual game.
5. **Stay in your lane.** Each role has owned files. Don't touch files outside your scope without coordination.
6. **Fix before feature.** All P0 bugs must close before new features start.
7. **No auto-generated branch names.** Follow the convention.
8. **Max 300 lines per PR.** Split larger tasks into sub-tasks.
9. **No unused imports/variables.** Lint must be clean.
10. **No forward-referencing.** Don't call APIs that don't exist yet.

## Current State (Sprint 2)

- **P0 Bugs:** 3 open (potion UI, save format, card effect context)
- **Tests:** 763 passing
- **Lint:** 0 errors
- **Build:** Passing
- **Runtime:** Potions, save/load, and some card effects are BROKEN

## Architecture Quick Reference

```
src/context/GameContext.jsx          # 375-line orchestrator
src/context/reducers/                # Domain reducers (combat, map, meta, reward, shop)
src/systems/                         # Game logic (combat, cards, potions, audio, save)
src/data/                            # Content definitions (cards, enemies, events, potions, relics)
src/components/                      # React UI components
src/hooks/                           # Custom hooks (useGame, useAnimations)
src/utils/                           # Utilities (assetLoader, mapGenerator)
src/test/                            # Test suites
```
