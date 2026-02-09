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

**Post your review findings to the PR (MANDATORY):**

```bash
gh pr comment --body "$(cat <<'EOF'
## Copilot Review Findings

### HIGH (must fix before merge)
- None

### MEDIUM (should fix before merge)
- None

### LOW (informational)
- None

### Verified Clean
- [x] No security vulnerabilities
- [x] No obvious bugs
- [x] No breaking changes
- [x] Tests are meaningful
EOF
)"
```

**If HIGH or MEDIUM findings exist:**
1. Post findings to PR first (for audit trail)
2. Fix each issue
3. Run `npm run validate` again
4. Commit with message: `{TASK-ID}: Address review findings`
5. Push to branch
6. Re-run review until clean
7. Post final clean review to PR

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

**Post your review findings to the PR (MANDATORY):**

```bash
gh pr comment --body "$(cat <<'EOF'
## Mentor Review

### Architectural Concerns
- None (or describe and action taken)

### Integration Verification
- [x] Checked against other in-progress work
- [x] No conflicts with team member owned files

### Definition of Done
- [x] All criteria from DEFINITION_OF_DONE.md verified

### Approval Status
- [x] APPROVED - Ready to merge
EOF
)"
```

**If CHANGES REQUESTED:** Post the specific issues to the PR, fix them, then post approval once resolved.

### Step 8: Verify PR Checklist (MANDATORY)

Before merging, verify ALL checkboxes in the PR body are checked:

```bash
# View the PR body and verify all [ ] are now [x]
gh pr view --json body --jq '.body'
```

**Update any unchecked items:**
```bash
gh pr edit --body "$(cat <<'EOF'
... updated body with all checkboxes marked [x] ...
EOF
)"
```

Every `[ ]` must become `[x]` before merge. If an item cannot be checked, explain why in a PR comment.

### Step 9: Merge After Approval (NEVER SKIP REVIEWS)

```bash
gh pr merge --squash --delete-branch
```

**Do NOT merge if:**
- Reviews were not posted as PR comments
- HIGH/MEDIUM findings exist (even if posted)
- CI is failing
- Smoke test was not documented
- PR body has unchecked checkboxes

### Step 10: Update Sprint Branch

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
| Not posting reviews to PR | No audit trail | Use `gh pr comment` for all reviews |
| Merging with unchecked boxes | Incomplete work | Verify all `[ ]` become `[x]` first |

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
gh pr comment --body "## Copilot Review Findings ..."  # POST TO PR!
# ... perform Mentor review ...
gh pr comment --body "## Mentor Review ..."             # POST TO PR!
# ... verify all PR checkboxes are [x] ...
gh pr view --json body --jq '.body' | grep -c '\[ \]'  # Should be 0
# ... only then merge ...
gh pr merge --squash --delete-branch
git checkout sprint-N && git pull origin sprint-N
```
