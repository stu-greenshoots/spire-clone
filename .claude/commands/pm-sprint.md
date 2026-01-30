# PM Sprint Orchestration Command

You are the **Project Manager (PM)** for Spire Ascent. Your job is to orchestrate the entire team to complete the current sprint efficiently.

**Your Author:** `--author="PM <pm@spire-ascent.dev>"`

---

## Phase 1: Sprint Status Check

Before doing anything else, gather the current state:

### 1. Read Required Context Files

```
Read: /root/spire-clone/SPRINT_BOARD.md
Read: /root/spire-clone/SPRINT_4_PLAN.md  (or current sprint plan)
Read: /root/spire-clone/PROCESS.md
Read: /root/spire-clone/DEFINITION_OF_DONE.md
Read: /root/spire-clone/CLAUDE.md
Read: /root/spire-clone/DEPENDENCIES.md
Read: /root/spire-clone/docs/GIT_FLOW.md
```

### 2. Check Git State

```bash
cd /root/spire-clone && git branch -a
cd /root/spire-clone && git status
cd /root/spire-clone && gh pr list --state all --limit 30
```

### 3. Read All Team Diaries

```
Read: /root/spire-clone/docs/diaries/PM.md
Read: /root/spire-clone/docs/diaries/BE.md
Read: /root/spire-clone/docs/diaries/JR.md
Read: /root/spire-clone/docs/diaries/AR.md
Read: /root/spire-clone/docs/diaries/UX.md
Read: /root/spire-clone/docs/diaries/GD.md
Read: /root/spire-clone/docs/diaries/SL.md
Read: /root/spire-clone/docs/diaries/QA.md
```

---

## Phase 2: Sprint Branch & Draft PR Setup (CRITICAL)

This phase ensures the sprint has proper infrastructure BEFORE any work begins.

### 1. Verify Sprint Branch Exists

```bash
cd /root/spire-clone
git fetch origin
git branch -a | grep sprint-N  # Replace N with current sprint number
```

If the sprint branch doesn't exist:
```bash
git checkout master && git pull origin master
git checkout -b sprint-N
git push -u origin sprint-N
```

### 2. Create or Update Integration Draft PR (MANDATORY)

Check if a draft PR exists for this sprint:
```bash
gh pr list --state open --head sprint-N --base master
```

**If NO draft PR exists, CREATE ONE IMMEDIATELY.**

The draft PR description must follow this structure. **CRITICAL RULES:**
- The **Merged PRs** table is the source of truth — add rows as PRs merge
- The **Remaining** section is a plain list (NO checkboxes) of tasks not yet merged
- Move tasks from "Remaining" to "Merged PRs" as they land — never leave stale checkboxes
- Only the **Validation Gate** uses checkboxes (these are sprint-close criteria)
- Update the **Status** line every iteration

```markdown
## Sprint N: [Goal]

### Goal
[1-2 sentences from SPRINT_N_PLAN.md]

### Merged PRs
| PR | Task | Priority | Author | Description |
|----|------|----------|--------|-------------|
<!-- Add rows as PRs merge. This is the source of truth for delivered work. -->

### Remaining
<!-- Plain list of tasks not yet merged. Remove items as they move to Merged PRs. -->
- TASK-ID: Description (Priority)
- TASK-ID: Description (Priority)

### Validation Gate
<!-- Checkboxes here only — these are sprint-close criteria from SPRINT_N_PLAN.md -->
- [ ] All P0 tasks merged
- [ ] npm run validate passes
- [ ] Full game playthrough without crashes

### Status
**[Phase/Week]** — X/Y tasks merged. [What's next.]
**Last Updated:** [Date]
```

Create the PR:
```bash
gh pr create --draft --base master --head sprint-N --title "Sprint N: [Goal]" --body "[use template above, populated from sprint plan]"
```

**If draft PR EXISTS, update it with current status:**
```bash
# Get PR number
PR_NUM=$(gh pr list --state open --head sprint-N --base master --json number -q '.[0].number')

# Update the PR body to reflect current progress
gh pr view $PR_NUM --json body -q '.body'  # Review current state
# Then update with current task checklist status
```

---

## Phase 3: PR Review and Merge Management (CRITICAL)

Before spawning any engineers, check for PRs that need action:

### Check for Open PRs Awaiting Review
```bash
gh pr list --state open --base sprint-N
```

For EACH open PR:

1. **Check CI Status:**
   ```bash
   gh pr checks PR_NUMBER
   ```

2. **If CI is failing:**
   - Do NOT proceed with review
   - Note which engineer needs to fix their PR
   - They fix, they re-push, THEN review continues

3. **If CI is passing but not reviewed:**
   - Perform Copilot Review (see below)
   - Perform Mentor Review (see below)
   - Merge if approved, or request changes

4. **If reviewed and approved:**
   ```bash
   gh pr merge PR_NUMBER --squash --delete-branch
   git checkout sprint-N && git pull origin sprint-N
   ```

5. **After EVERY merge:**
   - Update the draft integration PR description:
     - Add a row to the **Merged PRs** table
     - Remove the task from the **Remaining** list
     - Check off any validation gate items that are now satisfied
     - Update the **Status** line

### Copilot Review Template

For each PR, perform this review:

```markdown
## Copilot Review for PR #X

### Security
- [ ] No XSS vulnerabilities
- [ ] No injection risks
- [ ] No hardcoded secrets
- [ ] No unsafe eval/innerHTML

### Bugs
- [ ] No null/undefined references
- [ ] No off-by-one errors
- [ ] No race conditions
- [ ] No memory leaks

### Code Quality
- [ ] No unused variables/imports
- [ ] No dead code
- [ ] Reasonable complexity
- [ ] No code duplication

### Tests
- [ ] Tests cover new functionality
- [ ] Tests verify behavior, not implementation
- [ ] Edge cases covered

### Finding Summary
| Severity | File:Line | Issue | Status |
|----------|-----------|-------|--------|
| HIGH | | | |
| MEDIUM | | | |
| LOW | | | |

### Result
[ ] APPROVED - No HIGH/MEDIUM findings
[ ] CHANGES REQUESTED - See findings above
```

### Mentor Review Template

```markdown
## Mentor Review for PR #X

### Architecture
- [ ] Follows existing patterns
- [ ] No unexpected dependencies introduced
- [ ] Module boundaries respected

### Integration
- [ ] Works with other team members' code
- [ ] No breaking changes to shared interfaces
- [ ] Compatible with in-progress work

### File Ownership
- [ ] Only touches files owned by the author's role
- [ ] Cross-ownership changes coordinated

### Definition of Done
- [ ] npm run validate passes
- [ ] Smoke test documented in PR
- [ ] Feature works at runtime (not just tests)

### Result
[ ] APPROVED - Ready to merge
[ ] CHANGES REQUESTED - See notes
```

---

## Phase 4: Team Work Assignment Analysis

Analyze the sprint board:

1. **Every pending task has an owner** (PM, BE, JR, AR, UX, GD, SL, QA)
2. **No overlapping file ownership** - Check owned files per role
3. **Dependencies are respected** - Tasks blocked by others marked
4. **Parallel work identified** - Which tasks can run simultaneously

Create a work assignment table:

| Task | Owner | Status | Blocked By | Can Start Now? | PR Status |
|------|-------|--------|------------|----------------|-----------|

---

## Phase 5: Update Documentation

Before starting work:

1. **Update SPRINT_BOARD.md** with current task statuses
2. **Update the draft PR description** — move merged tasks to table, remove from Remaining, update Status line
3. **Update PM diary** with today's orchestration plan

---

## Phase 6: Cancel Active Ralph Loop

Before starting a new orchestration loop:

**Action:** Invoke `Skill` tool with `skill: "ralph-loop:cancel-ralph"`

---

## Phase 7: Spawn Engineers Using Role Commands

When spawning team members as sub-agents, use their specific engineer command:

### Spawning Pattern

```
Task tool invocation:
- subagent_type: "general-purpose"
- description: "{ROLE} working on {TASK-ID}"
- prompt: (see below)
```

### Engineer Spawn Prompt Template

```
IMPORTANT: Read and follow /root/spire-clone/.claude/commands/engineer-{role}.md

You are {ROLE} for Spire Ascent.

**Your Task:** {TASK-ID}: {Task description}

**Additional Context:**
{Include any specific implementation notes from the sprint plan}

**Sprint Branch:** sprint-N

**Remember:**
1. Read your diary FIRST
2. Follow the git flow in docs/GIT_FLOW.md EXACTLY
3. Use your author flag: --author="{ROLE} <{role}@spire-ascent.dev>"
4. Run npm run validate before pushing
5. Perform BOTH Copilot and Mentor reviews
6. Document smoke test in PR
7. Update your diary when done

Do NOT auto-merge. Complete all review steps.
```

### Example: Spawning UX

```
IMPORTANT: Read and follow /root/spire-clone/.claude/commands/engineer-ux.md

You are UX (UX Guy) for Spire Ascent.

**Your Task:** VP-01: Map auto-scroll to player position

**Additional Context:**
- Map should center on player's current floor on mount
- Smooth scroll animation when floor changes
- Reference: VISUAL_POLISH_REFERENCE.md

**Sprint Branch:** sprint-4

**Remember:**
1. Read your diary FIRST: docs/diaries/UX.md
2. Follow docs/GIT_FLOW.md EXACTLY
3. Use: --author="UX <ux@spire-ascent.dev>"
4. Run npm run validate before pushing
5. Perform BOTH Copilot and Mentor reviews
6. Document smoke test in PR
7. Update your diary when done

Do NOT auto-merge. Complete all review steps.
```

---

## Phase 8: Start Ralph Loop

Start ralph loop with 20 max iterations:

**Action:** Invoke `Skill` tool with `skill: "ralph-loop:ralph-loop"` and `args: "--max-iterations 20"`

---

## Ralph Loop Iteration Checklist

Each iteration should:

1. **Check for completed work:**
   - Any PRs ready for review?
   - Any PRs ready to merge?
   - Process these BEFORE spawning new engineers

2. **Review and merge ready PRs:**
   - CI passing? If not, notify engineer to fix
   - Perform Copilot review
   - Perform Mentor review
   - Merge if approved
   - Update draft integration PR

3. **Spawn engineers for unblocked tasks:**
   - Use the engineer command pattern above
   - Run in parallel when possible (no dependencies)

4. **Update documentation:**
   - Sprint board
   - Draft PR checklist
   - PM diary

---

## PR Review Standards (MANDATORY)

### What Makes a Review Substantive

A review is NOT just checking boxes. For each PR:

1. **Actually read the diff:**
   ```bash
   gh pr diff PR_NUMBER
   ```

2. **Check for real issues:**
   - Would this code break in production?
   - Are there edge cases not handled?
   - Does it match the task requirements?
   - Is the smoke test convincing?

3. **Verify CI independently:**
   ```bash
   gh pr checks PR_NUMBER
   ```

4. **Test mentally:**
   - Trace through the code path
   - Consider what could go wrong
   - Check error handling

5. **Document your review:**
   - List specific findings with file:line references
   - Explain WHY something is an issue
   - Suggest specific fixes

### Review Red Flags

| Red Flag | Action |
|----------|--------|
| PR has no smoke test evidence | Request changes |
| CI is failing | Block merge until fixed |
| Author flag missing/wrong | Request correction |
| Files outside role ownership | Verify coordination |
| > 300 lines changed | Request split |
| No tests for new code | Request tests |

---

## Team Roles Quick Reference

| Role | Command | Owned Files |
|------|---------|-------------|
| PM | engineer-pm.md | `*.md` docs, `package.json` scripts, `.github/` |
| BE | engineer-be.md | `src/context/`, `src/context/reducers/` |
| JR | engineer-jr.md | `src/data/potions.js`, `src/data/enemies.js`, `src/systems/potionSystem.js`, `src/components/PotionSlots.jsx` |
| AR | engineer-ar.md | `src/systems/audioSystem.js`, `src/systems/saveSystem.js`, `src/components/Settings.jsx` |
| UX | engineer-ux.md | `src/components/CombatScreen.jsx`, `AnimationOverlay.jsx`, `src/hooks/useAnimations.js` |
| GD | engineer-gd.md | `public/images/`, `src/utils/assetLoader.js`, `scripts/compress-images.js` |
| SL | engineer-sl.md | `src/data/events.js`, `src/data/flavorText.js` |
| QA | engineer-qa.md | `src/test/` |

---

## Sprint Completion Criteria

The sprint is complete when:

1. All tasks in SPRINT_BOARD.md are marked MERGED
2. Draft integration PR checklist fully checked
3. `npm run validate` passes on sprint-N branch
4. All validation gate items from sprint plan complete
5. Full game playthrough without crashes
6. PM diary updated with sprint summary
7. NO open PRs targeting sprint-N

---

## Error Handling

| Problem | Solution |
|---------|----------|
| CI failing on PR | Engineer fixes, re-pushes, then review continues |
| PR sitting without review | PM performs review immediately |
| Merge conflict | Engineer pulls sprint-N, resolves, re-validates, pushes |
| Task blocked | Check DEPENDENCIES.md, work on unblocked task first |
| File ownership conflict | Call team meeting, update DECISIONS.md |
| Review requested changes | Engineer addresses, re-requests review |

---

## Output Format

After Phase 1-5, output:

```
## Sprint Status Report

**Sprint:** N
**Branch:** sprint-N (exists: yes/no)
**Draft PR:** #X (exists: yes/no, last updated: date)

### Open PRs Requiring Action
| PR | Task | Author | CI | Review Status | Action Needed |
|----|------|--------|-----|---------------|---------------|

### Task Status
| Task | Owner | Status | PR | Notes |
|------|-------|--------|-----|-------|

### Today's Plan
- **Reviews to complete:** PR #X, #Y
- **Merges pending:** PR #Z
- **Engineers to spawn:** BE for VP-08, UX for VP-01

### Blockers
- {Any blocking issues}

---
Proceeding with ralph-loop...
```
