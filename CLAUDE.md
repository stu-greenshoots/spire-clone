# Spire Ascent - Claude Code Project Instructions

## Required Reading (Every Session)

Before starting any work, read these files to understand current state:

1. **SPRINT_BOARD.md** - Current sprint, task status, what's in progress
2. **docs/ENGINEER_GUIDE.md** - Common engineer workflow, git, reviews, checklists
3. **Your diary** - `docs/diaries/{ROLE}.md` - Your previous context and notes
4. **Your engineer command** - `.claude/commands/engineer-{role}.md` - Role-specific checks

For deeper context (read when relevant to your task):
- **docs/GIT_FLOW.md** - Detailed git workflow reference
- **SPRINT_4_PLAN.md** - Current sprint plan, task assignments, delivery order
- **PROCESS.md** - Branch naming, PR workflow, commit conventions
- **DEPENDENCIES.md** - Task ordering, conflict zones, what blocks what
- **GAME_REFERENCE.md** - Card/enemy/relic mechanics (for content tasks)

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

### Varrow (The Loop Doctor)
- **Owns:** `src/data/events.js`, `src/data/flavorText.js`, `src/data/bossDialogue.js`
- **Focus:** Narrative design, mechanic-story synergy, emergent storytelling, loop justification
- **Specialty:** Indie roguelikes - makes the gameplay loop and story inseparable
- **Rule:** Story must embrace what the game IS, not explain it away. No derivative concepts. Challenge premises ruthlessly.

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
11. **NEVER auto-merge PRs.** Wait for Copilot review → address findings → wait for Mentor approval → then merge.

## Current State (Sprint 4 - Active)

- **Branch:** `sprint-4` (create if not exists)
- **Previous Sprint:** Sprint 3 COMPLETE (10 PRs merged, all validation gates passed)
- **Tests:** 837 passing (29 test files)
- **Lint:** 0 errors
- **Build:** Passing
- **Runtime:** All systems functional
- **Review Score:** 58/100 (Game Zone Magazine) - target 70+
- **Diaries:** `docs/diaries/{ROLE}.md` - update daily
- **Sprint 4 Plan:** See `SPRINT_4_PLAN.md` (15 visual polish tasks VP-01 to VP-15)
- **Sprint 4 Focus:** Map auto-scroll, victory overlay, sequential enemy turns, visual polish

### Sprint Infrastructure Checklist
- [ ] `sprint-4` branch exists
- [ ] Draft PR from `sprint-4` to `master` with task checklist
- [ ] All engineers using their `engineer-{role}.md` commands
- [ ] All commits authored correctly
- [ ] All PRs reviewed before merge

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
