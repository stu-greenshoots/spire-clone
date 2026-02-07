# Development Process - Spire Ascent

**Established:** 2026-01-24 (Brainstorm Session 2)
**Updated:** 2026-02-07 (Sprint 17 - Quality Reality)
**Purpose:** Prevent sprint chaos. Use GitHub properly. Take ownership.

---

## Key Documents

| Document | Purpose |
|----------|---------|
| `docs/GIT_FLOW.md` | Complete git workflow - READ BEFORE EVERY TASK |
| `docs/diaries/{ROLE}.md` | Individual engineer diaries |

### Commands

| Command | When to Use |
|---------|-------------|
| `.claude/commands/pm-plan.md` | Starting a new sprint - collaborative planning with team |
| `.claude/commands/pm-sprint.md` | Daily sprint execution - PR management, engineer spawning |
| `.claude/commands/mentor.md` | Unblocking PRs, making decisions, quality enforcement |
| `.claude/commands/engineer-{role}.md` | Individual engineer task work |

---

## Branch Strategy

```
master                              (stable, deployable, protected)
  └── sprint-N                      (integration branch per sprint)
       ├── task-id-description      (feature/task branches - flat names)
       └── fix-NN-description       (bug fix branches - flat names)
```

### Branch Naming Convention

```
{task-id}-{short-description}
```

**Note:** Per DEC-013, branch names are flat (no `sprint-N/` prefix) because git treats `sprint-N` as both a branch and a directory prefix, causing push conflicts.

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `TASK-ID-description` | `be-02-normalize-state` |
| Bug fix | `fix-NN-description` | `fix-01-potion-integration` |

**Rules:**
- All lowercase, hyphens only (no underscores, no camelCase)
- No auto-generated suffixes (no `-RmZyD` or `-LsIh1`)
- No `sprint-N/` prefix (conflicts with sprint-N branch in git refs)
- Task ID included when applicable
- Short description (2-4 words max)

---

## PR Workflow

### 1. Before Starting Work
```bash
git checkout sprint-N
git pull origin sprint-N
git checkout -b task-id-description
```

### 2. During Work
- Commit frequently with task-prefixed messages
- Run `npm run validate` before each push
- Keep changes focused on ONE task

### 3. Opening a PR
- Target: `sprint-N` branch (NOT master, NEVER master)
- Title format: `TASK-ID: Description`
- Fill out PR template completely
- Max ~300 lines changed (split larger tasks)

### Deploy Pipeline
- Deploys trigger automatically on push to `sprint-N`
- Every merged PR = live deploy to GitHub Pages
- Master only gets updated at sprint end (integration merge)

### 4. Review & Merge
- CI must pass (lint + test + build)
- Address all HIGH/MEDIUM Copilot findings
- Smoke test documented in PR
- Merge via squash-merge to keep history clean

### 5. Sprint End
- One final PR from `sprint-N` to `master`
- Full team review of integration PR
- All validation checks pass
- Smoke test of full game flow

---

## PR Template

```markdown
## {TASK-ID}: {Title}

### What
{1-2 sentence summary of the change}

### Why
{What problem does this solve or what feature does it add}

### How
{Brief description of approach taken}

### Files Changed
- `path/to/file.js` - {what changed}

### Testing
- [ ] `npm run validate` passes locally
- [ ] New tests added for new functionality
- [ ] Manual smoke test: {describe what you tested}

### Smoke Test Results
{What did you actually click/try in the running game?}

### Checklist
- [ ] Branch follows naming convention
- [ ] Commit messages prefixed with task ID
- [ ] No files over 500 lines (new files)
- [ ] No TODO/FIXME without task reference
- [ ] No unused imports/variables
- [ ] PR is under 300 lines changed
```

---

## Commit Conventions

### Format
```
TASK-ID: short description of what changed

Optional longer explanation if needed.
```

### Examples
```
BE-02: Extract player state to use entity IDs
JR-03: Add 5 Act 2 normal enemies with movesets
FIX-01: Wire usePotion action through GameContext
QA-03: Add Playwright E2E test for combat flow
```

### Author Identity (MANDATORY)

**Every commit MUST use the correct author flag for the role doing the work.**

```
PM:  --author="PM <pm@spire-ascent.dev>"
BE:  --author="BE <be@spire-ascent.dev>"
JR:  --author="JR <jr@spire-ascent.dev>"
AR:  --author="AR <ar@spire-ascent.dev>"
UX:  --author="UX <ux@spire-ascent.dev>"
GD:  --author="GD <gd@spire-ascent.dev>"
SL:  --author="SL <sl@spire-ascent.dev>"
QA:  --author="QA <qa@spire-ascent.dev>"
```

Example:
```bash
git commit --author="JR <jr@spire-ascent.dev>" -m "FIX-01: Wire usePotion action through GameContext"
```

**If you forget the author flag, you are not properly taking on your role.**

### Rules
- Present tense, imperative mood ("Add" not "Added")
- First line under 72 characters
- Task ID prefix always included
- No generic messages ("fix stuff", "updates", "wip")
- **Always use your role's `--author` flag** - this is not optional

---

## CI/CD Configuration

### Triggers
```yaml
on:
  push:
    branches: [main, master, sprint-*]
  pull_request:
    branches: [main, master, sprint-*]
```

### Jobs
1. **Lint** - `npm run lint` (0 errors required)
2. **Test** - `npm run test:run` (all tests pass, Node 18 + 20)
3. **Build** - `npm run build` (no errors)
4. **Coverage** - `npm run test:coverage` (report only, no gate)

### Future Additions
- PR size warning (>500 lines)
- Automated smoke test job (dev server + basic navigation)
- Branch name validation

---

## Validation

### Before Every Push
```bash
npm run validate
```
This runs: lint -> test:run -> build (all must pass).

### Before Every PR
1. `npm run validate` passes
2. Run the game locally (`npm run dev`)
3. Do a manual smoke test relevant to your change
4. Document what you tested in the PR

### Sprint Gate
Before sprint branch merges to master:
- [ ] All tasks have individual merged PRs
- [ ] `npm run validate` passes on sprint-N tip
- [ ] Full game playthrough (start -> boss fight) without crashes
- [ ] All P0 bugs from previous sprint closed
- [ ] No open PRs targeting sprint-N branch

---

## Task Lifecycle

```
Backlog -> Sprint Board -> Branch Created -> PR Opened -> CI Pass -> Review -> Merge -> Validated
```

1. **Backlog:** Task defined in SPRINT_BOARD.md with size/priority
2. **Sprint Board:** Task assigned to current sprint
3. **Branch Created:** `sprint-N/task-id-description`
4. **PR Opened:** Against sprint-N, template filled
5. **CI Pass:** All checks green
6. **Review:** Copilot findings addressed, smoke test documented
7. **Merge:** Squash-merged to sprint-N
8. **Validated:** Feature confirmed working in integrated build

---

## Anti-Patterns (What NOT to Do)

| Don't | Do Instead |
|-------|-----------|
| Bundle 10 tasks in one commit | One commit per logical change, one PR per task |
| Use auto-generated branch names | Use convention: `task-id-description` (flat, no sprint prefix) |
| Merge without CI passing | Wait for green checks |
| Skip smoke testing | Test your change in the running game |
| Open 50-file PRs | Split into sub-tasks, max 300 lines |
| Fix CI after merging | Fix before merging (that's what CI gates are for) |
| Mark tasks "done" when tests pass | Done = tests pass AND feature works at runtime |
| Commit unused imports/variables | Run lint, fix all warnings |
| Add features that reference unbuilt systems | Only use APIs that currently exist |

---

## Sprint Cadence

| When | What | Who | Command |
|------|------|-----|---------|
| Sprint planning | Collaborative planning, team input | All | `pm-plan.md` |
| Daily execution | PR management, engineer spawning | PM | `pm-sprint.md` |
| Per task | Branch -> PR -> Review -> Merge | Engineer | `engineer-{role}.md` |
| Blockers/decisions | Unblock PRs, make calls | Mentor | `mentor.md` |
| Sprint end | Integration PR, full validation | All | `pm-sprint.md` |

---

## Sprint Planning Process

Sprint planning is collaborative, not dictated. Use `pm-plan.md` command.

### Planning Phases

1. **Context Gathering** - Read all project state, diaries, previous sprint
2. **PM + Mentor Draft** - Create initial plan with priorities and assignments
3. **Team Input Round** - Each engineer reviews and provides perspective
4. **Synthesis & Iteration** - Address concerns, iterate until aligned
5. **Finalize** - Create sprint plan doc, update board, create infrastructure

### Engineer Input Questions

Each engineer is asked:
- Are assigned tasks clear and achievable?
- Is sizing accurate?
- Anything missing that should be in the sprint?
- Any priority disagreements?
- Can you handle the workload?
- Any better approaches?

### Planning Outputs

- `SPRINT_N_PLAN.md` - Finalized sprint plan
- Updated `SPRINT_BOARD.md` - Tasks with owners and phases
- Updated `docs/DECISIONS.md` - Any decisions made during planning
- Updated team diaries - Each engineer's assignments
- Sprint branch and draft PR created

---

## Size Estimates

| Size | Lines Changed | Typical Duration | Example |
|------|--------------|-----------------|---------|
| S | <100 | Quick | Fix unused import, add one test |
| M | 100-300 | Moderate | New component, system refactor |
| L | 300-500 | Significant | New system, major refactor |
| XL | >500 | Split it | Too big for one PR - break into sub-tasks |

---

## Definition of "Validated"

A feature is validated when:
1. Its tests pass (unit level)
2. `npm run validate` passes (integration level)
3. It works in the running game (runtime level)
4. It doesn't break other features (regression level)

**Tests passing alone is NOT validation.** Sprint 1 proved this - 763 tests passed while the potion UI, save system, and card effects were broken at runtime.

---

## Engineer Responsibility

Each engineer is responsible for the FULL lifecycle of their work:

### Before Starting
1. Read your diary (`docs/diaries/{ROLE}.md`)
2. Read the git flow (`docs/GIT_FLOW.md`)
3. Read your engineer command (`.claude/commands/engineer-{role}.md`)
4. Check sprint board for your assigned tasks

### During Work
1. Stay within your owned files
2. Run `npm run validate` frequently
3. Commit with proper `--author` flag
4. Keep PRs under 300 lines

### Before Merge
1. Create PR with full template
2. Verify CI is passing
3. Perform Copilot review (security, bugs, quality)
4. Perform Mentor review (architecture, integration)
5. Document smoke test evidence
6. Only then merge

### After Merge
1. Update your diary with session notes
2. Pull latest sprint branch
3. Check sprint board for next task

### Taking Ownership Means:
- You ARE the role, not just completing tasks
- You catch your own bugs before review
- You document what you tested
- You update the sprint draft PR after your merge
- You never skip steps because "it's just a small change"

**If a PR sits unreviewed, that's a process failure.** If CI is failing, that blocks everything. If reviews are superficial, bugs slip through. Own your work end-to-end.
