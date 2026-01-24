# Development Process - Spire Ascent

**Established:** 2026-01-24 (Brainstorm Session 2)
**Purpose:** Prevent the sprint 1 chaos from repeating. Use GitHub properly.

---

## Branch Strategy

```
master                              (stable, deployable, protected)
  └── sprint-N                      (integration branch per sprint)
       ├── sprint-N/task-id-desc    (feature/task branches)
       └── sprint-N/fix-desc        (bug fix branches)
```

### Branch Naming Convention

```
sprint-{N}/{task-id}-{short-description}
```

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `sprint-N/TASK-ID-description` | `sprint-2/be-02-normalize-state` |
| Bug fix | `sprint-N/fix-description` | `sprint-1/fix-save-system` |
| Hotfix | `sprint-N/hotfix-description` | `sprint-1/hotfix-potion-integration` |

**Rules:**
- All lowercase, hyphens only (no underscores, no camelCase)
- No auto-generated suffixes (no `-RmZyD` or `-LsIh1`)
- Task ID included when applicable
- Short description (2-4 words max)

---

## PR Workflow

### 1. Before Starting Work
```bash
git checkout sprint-N
git pull origin sprint-N
git checkout -b sprint-N/task-id-description
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

### Author Identity

Each team member commits as themselves using the `--author` flag:

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

### Rules
- Present tense, imperative mood ("Add" not "Added")
- First line under 72 characters
- Task ID prefix always included
- No generic messages ("fix stuff", "updates", "wip")
- Always use your role's `--author` flag

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

### Future Additions (Sprint 2+)
- PR size warning (>500 lines)
- Smoke test job (dev server + basic navigation)
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
| Use auto-generated branch names | Use convention: `sprint-N/task-id-desc` |
| Merge without CI passing | Wait for green checks |
| Skip smoke testing | Test your change in the running game |
| Open 50-file PRs | Split into sub-tasks, max 300 lines |
| Fix CI after merging | Fix before merging (that's what CI gates are for) |
| Mark tasks "done" when tests pass | Done = tests pass AND feature works at runtime |
| Commit unused imports/variables | Run lint, fix all warnings |
| Add features that reference unbuilt systems | Only use APIs that currently exist |

---

## Sprint Cadence

| When | What | Who |
|------|------|-----|
| Sprint start | Brainstorm session, scope tasks, assign owners | All |
| Daily | Async standup: what's done, what's blocked | All |
| Per task | Branch -> PR -> Review -> Merge cycle | Owner |
| Mid-sprint | Check: are P0 bugs fixed? Any scope creep? | PM |
| Sprint end | Integration PR, full validation, retro | All |

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
