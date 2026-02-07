# Spire Ascent - Claude Code Project Instructions

**Last Updated:** 2026-02-07 (Sprint 17 Planning)

## Required Reading (Every Session)

Before starting any work, read these files to understand current state:

1. **SPRINT_BOARD.md** - Current sprint, task status, what's in progress
2. **SPRINT_17_PLAN.md** - Current sprint plan, task assignments, parallel execution
3. **docs/ENGINEER_GUIDE.md** - Common engineer workflow, git, reviews, checklists
4. **Your diary** - `docs/diaries/{ROLE}.md` - Your previous context and notes
5. **Your engineer command** - `.claude/commands/engineer-{role}.md` - Role-specific checks

For deeper context (read when relevant to your task):
- **docs/GIT_FLOW.md** - Detailed git workflow reference
- **PROCESS.md** - Branch naming, PR workflow, commit conventions
- **GAME_REFERENCE.md** - Card/enemy/relic mechanics (for content tasks)
- **DEFINITION_OF_DONE.md** - When is a task actually done

Historical sprint plans are archived in `docs/archive/sprint-plans/`.

## Commands

### Orchestration Commands

| Command | Purpose |
|---------|---------|
| `pm-sprint.md` | Sprint execution - PR management, engineer spawning, daily orchestration |
| `pm-plan.md` | Sprint planning - collaborative planning with team input |
| `mentor.md` | Lead engineer - final decisions, unblocking, quality enforcement |

### Engineer Commands

Each team role has a dedicated command that sets up their identity and responsibilities:

| Role | Command | Purpose |
|------|---------|---------|
| BE | `engineer-be.md` | Backend/architecture work |
| JR | `engineer-jr.md` | Junior dev content work |
| AR | `engineer-ar.md` | Audio/save/settings work |
| UX | `engineer-ux.md` | Combat feedback/polish work |
| GD | `engineer-gd.md` | Art/asset work |
| Varrow | `engineer-varrow.md` | Narrative design/loop-story synergy |
| QA | `engineer-qa.md` | Testing work |

**When spawning sub-agents:** Always include reference to their engineer command and remind them to read their diary first.

### When to Use Each Command

| Situation | Command |
|-----------|---------|
| Starting a new sprint | `pm-plan.md` - collaborative planning |
| Daily sprint execution | `pm-sprint.md` - PR management, engineer coordination |
| PRs stuck or decisions needed | `mentor.md` - unblock and decide |
| Individual task work | `engineer-{role}.md` - role-specific work |

## Diaries

Each team member keeps a daily diary at `docs/diaries/{ROLE}.md` (e.g. `docs/diaries/BE.md`).
Update your diary every session with what you did, blockers, and next steps.

## Decision Log

Decisions that affect shared interfaces, data formats, or process go through `docs/DECISIONS.md`.
Propose → others review → PM resolves. No silent changes to things other people depend on.

## Git Flow

**Full documentation: `docs/GIT_FLOW.md`** - Read this before every task.

### Quick Reference

```bash
# Complete workflow
git checkout sprint-N && git pull origin sprint-N
git checkout -b {task-id}-{description}
# ... do work ...
npm run validate                    # MUST pass before push
git add <specific-files>
git commit --author="{ROLE} <{role}@spire-ascent.dev>" -m "{TASK-ID}: description"
git push -u origin {task-id}-{description}
gh pr create --base sprint-N --title "{TASK-ID}: Description" --body "..."
# ... perform Copilot review (security, bugs, quality) ...
# ... perform Mentor review (architecture, integration) ...
gh pr merge --squash --delete-branch
```

### Critical Rules

1. **Always use your author flag** - `--author="{ROLE} <{role}@spire-ascent.dev>"`
2. **Always run `npm run validate`** before pushing
3. **Always perform both reviews** - Copilot AND Mentor
4. **Never auto-merge** - Complete all review steps first
5. **Never skip CI** - If CI fails, fix before proceeding

### PR Review Process (MANDATORY)

**DO NOT AUTO-MERGE PRs. EVER.**

For each PR:
1. **Check CI status** - Must be passing
2. **Perform Copilot Review** - Security, bugs, quality checks
3. **Perform Mentor Review** - Architecture, integration, Definition of Done
4. **Merge only after approval** - Both reviews must pass

See `docs/GIT_FLOW.md` for detailed review templates and checklists.

## Team Members

Each "team member" is a role with owned files and responsibilities. When working as a specific role, stay within your file boundaries.

### PM (Project Manager)
- **Owns:** `*.md` docs, `package.json` scripts, `.github/`
- **Focus:** Sprint coordination, process, CI/CD, PR management

### BE (Back Ender)
- **Owns:** `src/context/`, `src/context/reducers/`, `src/systems/` (infrastructure)
- **Focus:** Architecture, state management, performance
- **Rule:** Same public interfaces - useGame hook shape must not change without team discussion

### JR (Junior Developer)
- **Owns:** `src/data/` (cards, enemies, potions), `src/systems/potionSystem.js`, `src/components/PotionSlots.jsx`
- **Focus:** Content (cards, enemies, potions), card mechanics, balance
- **Rule:** Build against existing APIs. If a function doesn't exist in the hook, don't call it - wire it up first.

### AR (Allrounder)
- **Owns:** `src/systems/audioSystem.js`, `src/systems/saveSystem.js`, `src/components/Settings.jsx`
- **Focus:** Audio, save/load, settings, honest assessment
- **Rule:** Data formats must match between save and load. Serialize IDs, not full objects.

### UX (UX Guy)
- **Owns:** `src/components/CombatScreen.jsx`, `src/components/AnimationOverlay.jsx`, `src/hooks/useAnimations.js`
- **Focus:** Combat feedback, tooltips, visual polish, keyboard controls
- **Rule:** Animations must not block input. Speed multiplier always respected.

### GD (Graphic Designer)
- **Owns:** `public/images/`, `src/utils/assetLoader.js`, `scripts/compress-images.js`
- **Focus:** Art pipeline, asset optimization, visual consistency
- **Rule:** Always provide fallback when assets missing. Lazy-load images.

### Varrow (The Loop Doctor)
- **Owns:** `src/data/events.js`, `src/data/flavorText.js`, `src/data/bossDialogue.js`
- **Focus:** Narrative design, mechanic-story synergy, emergent storytelling, loop justification
- **Rule:** Story must embrace what the game IS, not explain it away. No derivative concepts.

### QA (Tester)
- **Owns:** `src/test/`, `tests/e2e/`, test infrastructure
- **Focus:** E2E tests, card/enemy verification, balance simulator, regression
- **Rule:** Tests validate behavior against real interfaces. Use data-testid, not fragile regex. Tests must use real reducers, not mocks, wherever possible.

## Key Commands

```bash
npm run dev              # Dev server (localhost:5173)
npm run validate         # lint + test + build (run before EVERY push)
npm run validate:quick   # tests only
npm run lint             # ESLint check
npm run test:run         # Vitest once
npm run build            # Production build
```

## Dev Tools (Development Mode)

In dev mode (`npm run dev`), the following tools are available:

### Main Menu
- **Data Editor** button - Edit card/enemy/relic data at runtime (persists to localStorage)
- **State Builder** button - Load predefined game scenarios

### Console API
```javascript
__SPIRE__.listScenarios()           // List all available scenarios
__SPIRE__.loadScenario("name")      // Load a scenario (e.g. "combat-basic")
__SPIRE__.getState()                // Get current game state
__SPIRE__.setState(scenario)        // Load custom state
```

### WARNING: Data Editor Persistence
The Data Editor saves custom changes to `localStorage` under key `spireAscent_customData`. These changes **silently override** card/enemy/relic definitions at runtime. If the game behaves unexpectedly (e.g. cards cost 0), check and clear this key:
```javascript
localStorage.removeItem('spireAscent_customData')
```

## Critical Rules

1. **One PR per task.** No bundling multiple tasks.
2. **`npm run validate` before push.** No exceptions.
3. **Smoke test your change.** Run the game, click things, document what works.
4. **Tests passing ≠ validated.** Feature must work at runtime in the actual game.
5. **Play the game.** Every change verified by actually playing, not just running tests.
6. **Stay in your lane.** Each role has owned files. Don't touch files outside your scope without coordination.
7. **Fix before feature.** All P0 bugs must close before new features start.
8. **No auto-generated branch names.** Follow the convention.
9. **Max 300 lines per PR.** Split larger tasks into sub-tasks.
10. **No unused imports/variables.** Lint must be clean.
11. **No forward-referencing.** Don't call APIs that don't exist yet.
12. **NEVER auto-merge PRs.** Wait for Copilot review → address findings → wait for Mentor approval → then merge.
13. **Honest assessment.** No inflated scores. Report what's broken, not what passes.

## Current State (Sprint 18 - Visual Polish & Ship Readiness)

- **Branch:** `sprint-18` (create from master)
- **Previous Sprint:** Sprint 17 COMPLETE (15 tasks, 3730 tests, Zero bugs found)
- **Tests:** 3730 passing (75 test files)
- **Lint:** 0 errors
- **Build:** Passing (~940ms)
- **Bundle:** Code-split, no chunk >200KB, total JS ~700KB
- **Content:** 4 characters, 188 cards, 45 enemies, 64 relics, 15 potions, 4 acts + Heart
- **Features:** Endless mode, daily challenges, custom seeded runs, compendium, run history, keyboard controls
- **Sprint 18 Focus:** Art polish, validation completion, ship readiness. Replace 131 placeholder assets.
- **Sprint Plan:** See `SPRINT_18_PLAN.md` (15 VP tasks across 3 parallel work streams)
- **Asset Backlog:** 20 enemy placeholders, 101 card placeholders, 15 missing relic icons

### Sprint Infrastructure Checklist
- [ ] `sprint-18` branch exists
- [ ] Draft PR from `sprint-18` to `master` with task checklist
- [ ] All engineers using their `engineer-{role}.md` commands
- [ ] All commits authored correctly
- [ ] All PRs reviewed before merge

## Architecture Quick Reference

```
src/context/GameContext.jsx          # Game state orchestrator
src/context/reducers/                # Domain reducers (combat, map, meta, reward, shop)
src/systems/                         # Game logic (combat, cards, potions, audio, save, seededRandom)
src/data/                            # Content (cards, enemies, events, potions, relics, scenarios)
src/components/                      # React UI (lazy-loaded screens)
src/hooks/                           # Custom hooks (useGame, useAnimations, useKeyboardControls)
src/utils/                           # Utilities (assetLoader, mapGenerator)
src/test/                            # Unit/integration tests (Vitest)
tests/e2e/                           # E2E tests (Playwright)
public/images/                       # Game assets (sprites, cards, backgrounds)
public/sounds/                       # Audio files (music, SFX, ambient)
docs/                                # Documentation, diaries, guides
docs/archive/                        # Historical docs, old sprint plans
```

## Project History

- **Sprints 1-3:** Foundation — core game loop, bug fixes, review feedback
- **Sprints 4-8:** Polish — visual effects, mobile support, title screen, Act 2, juice
- **Sprint 9:** Ship prep — 1.0 release, PWA, regression, music, tutorial
- **Sprints 10-12:** Content — Act 3, The Silent, The Heart, daily challenges
- **Sprints 13-15:** Characters — The Defect, The Watcher, orbs, stances, score 100
- **Sprint 16:** Retention — Endless mode, custom seeds, code-splitting, compendiums
- **Sprint 17:** Quality Reality — Zero bugs found. 3730 tests. Verification complete.
- **Sprint 18:** Visual Polish — Replace placeholders, honest assessment, ship readiness.
