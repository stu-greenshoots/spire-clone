# Spire Ascent - Claude Code Project Instructions

## Required Reading (Every Session)

Before starting any work, read these files to understand current state:

1. **SPRINT_3_PLAN.md** - Sprint 3 kickoff plan, task assignments, delivery order
2. **SPRINT_BOARD.md** - Current sprint, task status, what's in progress
3. **PROCESS.md** - Branch naming, PR workflow, commit conventions
4. **DEFINITION_OF_DONE.md** - When is a task actually done (not just committed)

For deeper context (read when relevant to your task):
- **DEPENDENCIES.md** - Task ordering, conflict zones, what blocks what
- **TEAM_PLAN.md** - Full phase breakdown, all task details
- **GAME_REFERENCE.md** - Card/enemy/relic mechanics (for content tasks)
- **review.html** - Game Zone Magazine feedback (58/100) that drives Sprint 3

## Diaries

Each team member keeps a daily diary at `docs/diaries/{ROLE}.md` (e.g. `docs/diaries/BE.md`).
Update your diary every session with what you did, blockers, and next steps.

## Decision Log

Decisions that affect shared interfaces, data formats, or process go through `docs/DECISIONS.md`.
Propose → others review → PM resolves. No silent changes to things other people depend on.

## Git Flow

### Branch Structure
```
master                              (stable, protected)
  └── sprint-N                      (integration branch)
       └── task-id-description      (one task, one branch - flat names)
```

### Branch Naming
```
{task-id}-{short-description}
```
- All lowercase, hyphens only
- No auto-generated suffixes
- No `sprint-N/` prefix (conflicts with git refs per DEC-013)
- Examples: `fix-01-potion-integration`, `be-02-normalize-state`, `ux-02-card-tooltips`

### Workflow Per Task
```bash
git checkout sprint-3
git pull origin sprint-3
git checkout -b task-id-description
# ... do work ...
npm run validate                    # MUST pass before push
git add <specific-files>
git commit --author="ROLE <role@spire-ascent.dev>" -m "TASK-ID: description"
git push -u origin task-id-description
# Open PR targeting sprint-3 branch
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
- **Sprint 3 tasks:** PM-03 (hide Data Editor in production)

### BE (Back Ender)
- **Owns:** `src/context/`, `src/context/reducers/`
- **Focus:** Architecture, state management, performance
- **Sprint 3 tasks:** BE-05 (damage preview with modifiers)
- **Rule:** Same public interfaces - useGame hook shape must not change without team discussion

### JR (Junior Developer)
- **Owns:** `src/data/potions.js`, `src/data/enemies.js`, `src/systems/potionSystem.js`, `src/components/PotionSlots.jsx`
- **Focus:** Potion system, card upgrades, new content
- **Sprint 3 tasks:** JR-05 (enemy intent specificity)
- **Rule:** Build against existing APIs. If a function doesn't exist in the hook, don't call it - wire it up first.

### AR (Allrounder)
- **Owns:** `src/systems/audioSystem.js`, `src/systems/saveSystem.js`, `src/components/Settings.jsx`
- **Focus:** Audio, save/load, settings, honest assessment
- **Sprint 3 tasks:** AR-04 (audio investigation), AR-03 (settings - deferred from Sprint 2)
- **Rule:** Data formats must match between save and load. Serialize IDs, not full objects.

### UX (UX Guy)
- **Owns:** `src/components/CombatScreen.jsx`, `src/components/AnimationOverlay.jsx`, `src/hooks/useAnimations.js`
- **Focus:** Combat feedback, tooltips, visual polish
- **Sprint 3 tasks:** UX-05 (card truncation), UX-06 (tooltip infra), UX-07 (combat feedback)
- **Rule:** Animations must not block input. Speed multiplier always respected.

### GD (Graphic Designer)
- **Owns:** `public/images/`, `src/utils/assetLoader.js`, `scripts/compress-images.js`
- **Focus:** Art pipeline, asset optimization, visual consistency
- **Sprint 3 tasks:** GD-05 (theme brightness), GD-06 (sprite sheets)
- **Rule:** Always provide fallback when assets missing. Lazy-load images.

### SL (Story Line)
- **Owns:** `src/data/events.js`, `src/data/flavorText.js`
- **Focus:** Events, world building, narrative, dialogue
- **Sprint 3 tasks:** Support role (reviews, smoke testing, tooltip content)
- **Rule:** Only reference effects/systems that currently exist. No forward-referencing unbuilt features.

### QA (Tester)
- **Owns:** `src/test/`, test infrastructure
- **Focus:** Component tests, balance simulator, E2E tests
- **Sprint 3 tasks:** QA-03 (E2E tests - deferred from Sprint 2)
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

## Current State (Sprint 3 - In Progress)

- **Branch:** `sprint-3` (integration branch, deploys to GitHub Pages)
- **Previous Sprint:** Sprint 2 COMPLETE (11 PRs merged, all validation gates passed)
- **Tests:** 837 passing (29 test files)
- **Lint:** 0 errors
- **Build:** Passing
- **Runtime:** All systems functional (potions, save/load, card effects, tooltips, upgrades)
- **Review Score:** 58/100 (Game Zone Magazine) - Sprint 3 targets 70+
- **Diaries:** `docs/diaries/{ROLE}.md` - update daily
- **Sprint 3 Goal:** Address magazine review feedback to reach 70+ score
- **Phase A:** Pending (GD-05, PM-03, UX-05 - Day 1 parallel tasks)
- **Phase B:** Pending (UX-06, JR-05, AR-04, BE-05, UX-07 - Days 2-3)
- **Phase C:** Pending (GD-06, AR-03, QA-03 - Day 4+)
- **Next:** Sprint 3 work begins

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
