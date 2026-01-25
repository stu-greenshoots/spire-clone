# Git Flow Reference - Spire Ascent

**Read this before every task. No exceptions.**

---

## Branch Structure

```
master                              (stable, protected)
  └── sprint-N                      (integration branch per sprint)
       └── task-id-description      (one task = one branch, flat names)
```

---

## Branch Naming

```
{task-id}-{short-description}
```

- All lowercase, hyphens only (no underscores, no camelCase)
- No auto-generated suffixes (no `-RmZyD` or `-LsIh1`)
- No `sprint-N/` prefix (conflicts with git refs per DEC-013)
- Examples: `vp-01-map-autoscroll`, `fix-07-tooltip-crash`, `be-03-state-refactor`

---

## Complete Task Workflow

### Step 1: Start from Sprint Branch

```bash
cd /root/spire-clone
git checkout sprint-N
git pull origin sprint-N
git checkout -b {task-id}-{short-description}
```

### Step 2: Do the Work

- Stay within your owned files only
- If you need to touch files outside your ownership, coordinate with that owner first
- Keep changes focused on ONE task

### Step 3: Validate Before Commit (MANDATORY)

```bash
npm run validate  # lint + test + build - ALL MUST PASS
```

**Do NOT proceed if validation fails.** Fix the issues first.

### Step 4: Commit with Proper Author (MANDATORY)

```bash
git add <specific-files>  # Add only files you changed - NOT git add .
git commit --author="{ROLE} <{role}@spire-ascent.dev>" -m "{TASK-ID}: description"
```

**Author format by role:**
| Role | Author Flag |
|------|-------------|
| PM | `--author="PM <pm@spire-ascent.dev>"` |
| BE | `--author="BE <be@spire-ascent.dev>"` |
| JR | `--author="JR <jr@spire-ascent.dev>"` |
| AR | `--author="AR <ar@spire-ascent.dev>"` |
| UX | `--author="UX <ux@spire-ascent.dev>"` |
| GD | `--author="GD <gd@spire-ascent.dev>"` |
| SL | `--author="SL <sl@spire-ascent.dev>"` |
| QA | `--author="QA <qa@spire-ascent.dev>"` |

**If you forget the author flag, you are breaking the process.**

### Step 5: Push and Create PR

```bash
git push -u origin {task-id}-{short-description}
gh pr create --base sprint-N --title "{TASK-ID}: Description" --body "$(cat <<'EOF'
## {TASK-ID}: {Title}

### What
{1-2 sentence summary}

### Why
{Problem this solves}

### How
{Approach taken}

### Files Changed
- `path/to/file` - {what changed}

### Testing
- [x] `npm run validate` passes locally
- [ ] New tests added for new functionality
- [ ] Manual smoke test performed

### Smoke Test Evidence
**What I tested:** {describe exactly what you clicked/tried}
**Result:** {what happened}
**Screenshot/Recording:** {if applicable}

### Checklist
- [x] Branch follows naming convention
- [x] Commit uses proper --author flag for my role
- [x] Commit messages prefixed with task ID
- [ ] No files over 500 lines (new files)
- [ ] No unused imports/variables
- [ ] PR is under 300 lines changed
EOF
)"
```

### Step 6: Perform Copilot Review (MANDATORY)

After creating the PR, you MUST perform a thorough code review. This is not optional.

```bash
git diff sprint-N...HEAD
```

**Review for these issues:**

| Category | What to Check |
|----------|---------------|
| **Security** | XSS vulnerabilities, injection risks, hardcoded secrets, unsafe eval/innerHTML |
| **Bugs** | Null/undefined references, off-by-one errors, race conditions, memory leaks |
| **Logic Errors** | Wrong conditions, missing edge cases, incorrect state transitions |
| **Code Quality** | Unused variables, dead code, excessive complexity, code duplication |
| **Tests** | Missing tests for new code, tests that don't actually verify behavior |
| **Types** | Type mismatches, missing PropTypes, incorrect prop usage |
| **Performance** | Unnecessary re-renders, missing memoization, large bundle additions |
| **Integration** | Breaking changes to shared interfaces, API mismatches |

**Document your findings:**

```markdown
## Copilot Review Findings

### HIGH (must fix before merge)
- [file:line] Issue description

### MEDIUM (should fix before merge)
- [file:line] Issue description

### LOW (informational)
- [file:line] Suggestion

### Verified Clean
- [ ] No security vulnerabilities
- [ ] No obvious bugs
- [ ] No breaking changes
- [ ] Tests are meaningful
```

**If HIGH or MEDIUM findings exist:**
1. Fix each issue
2. Run `npm run validate` again
3. Commit with message: `{TASK-ID}: Address review findings`
4. Push to branch
5. Re-run review until clean

### Step 7: Perform Mentor Review (MANDATORY)

After Copilot review passes, perform architectural review:

| Category | What to Check |
|----------|---------------|
| **Architecture** | Follows existing patterns in codebase |
| **Integration** | Works with other team members' code |
| **File Ownership** | Only touches owned files (or has explicit coordination) |
| **API Consistency** | Public interfaces unchanged (or approved in DECISIONS.md) |
| **Definition of Done** | All criteria from DEFINITION_OF_DONE.md met |
| **Runtime Validation** | Feature actually works in the running game |

**Document your findings:**

```markdown
## Mentor Review

### Architectural Concerns
- [description] - [action taken]

### Integration Verification
- [ ] Checked against other in-progress work
- [ ] No conflicts with team member owned files

### Approval Status
[x] APPROVED - Ready to merge
[ ] CHANGES REQUESTED - See above
```

### Step 8: Merge After Approval (NEVER SKIP REVIEWS)

```bash
gh pr merge --squash --delete-branch
```

**Do NOT merge if:**
- Reviews were not performed
- HIGH/MEDIUM findings exist
- CI is failing
- Smoke test was not documented

### Step 9: Update Sprint Branch

```bash
git checkout sprint-N
git pull origin sprint-N
```

---

## CI Validation Checklist

Before EVERY push, verify:

- [ ] `npm run lint` - 0 errors
- [ ] `npm run test:run` - All tests pass
- [ ] `npm run build` - Builds successfully

The combined command:
```bash
npm run validate
```

**If CI fails on your PR:**
1. Pull the failure logs
2. Fix locally
3. Run `npm run validate` to confirm
4. Push the fix
5. Wait for CI to pass

**Never merge with failing CI.**

---

## Common Mistakes to Avoid

| Mistake | Why It's Bad | Do This Instead |
|---------|--------------|-----------------|
| `git add .` | Adds unintended files | `git add <specific-files>` |
| Forgetting `--author` | Breaks attribution | Always use your role's author flag |
| Skipping validation | Breaks CI | Run `npm run validate` before push |
| Auto-merging PRs | Skips quality gates | Complete all review steps |
| Generic commit messages | Hard to trace | Always prefix with task ID |
| Touching files you don't own | Creates conflicts | Coordinate with file owner |
| PRs > 300 lines | Too big to review | Split into sub-tasks |

---

## Quick Reference

```bash
# Full workflow (copy-paste friendly)
cd /root/spire-clone
git checkout sprint-N && git pull origin sprint-N
git checkout -b {task-id}-{description}
# ... do work ...
npm run validate
git add <files>
git commit --author="{ROLE} <{role}@spire-ascent.dev>" -m "{TASK-ID}: description"
git push -u origin {task-id}-{description}
gh pr create --base sprint-N --title "{TASK-ID}: Description" --body "..."
# ... perform Copilot review ...
# ... perform Mentor review ...
# ... only then merge ...
gh pr merge --squash --delete-branch
git checkout sprint-N && git pull origin sprint-N
```
