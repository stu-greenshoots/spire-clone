# Rollback Guide - Emergency Procedures

**Purpose:** Emergency procedures for reverting changes when things go wrong.

---

## When to Use This Guide

Use these procedures when:
- A merged PR breaks the game in production
- An integration PR to master was merged prematurely
- Sprint branch is in an unrecoverable state
- Critical bug shipped to production (GitHub Pages)

**CRITICAL:** Always inform Stu via MISSION_CONTROL.md before executing emergency rollbacks.

---

## Scenario 1: Revert a Single Task PR (Merged to sprint-N)

**Problem:** A task PR was merged to `sprint-N` but breaks the game.

**Solution:** Create a revert PR.

```bash
# 1. Checkout sprint branch
git checkout sprint-N
git pull origin sprint-N

# 2. Find the merge commit to revert
git log --oneline --merges -10  # Find the PR merge commit hash

# 3. Create revert commit
git revert -m 1 <merge-commit-hash>

# 4. Push revert commit
git push origin sprint-N

# 5. Update integration PR
# - Add note about revert in PR description
# - Remove reverted task from Merged PRs table
# - Add to Remaining section if it needs to be reworked
```

**Example:**
```bash
git checkout sprint-19
git pull origin sprint-19
git log --oneline --merges -10
# Found: e4a2b3c Merge pull request #245 from stu-greenshoots/gd-33-card-art-batch-2
git revert -m 1 e4a2b3c
git commit -m "REVERT: GD-33 card art batch 2 (broke asset loader)"
git push origin sprint-19
```

---

## Scenario 2: Hotfix on Master (Emergency Production Fix)

**Problem:** Critical bug in production (master/GitHub Pages), can't wait for sprint process.

**Solution:** Emergency hotfix PR directly to master.

```bash
# 1. Create hotfix branch from master
git checkout master
git pull origin master
git checkout -b hotfix-<description>

# 2. Make minimal fix
# ... edit files ...
npm run validate  # MUST pass

# 3. Commit and push
git commit --author="PM <pm@spire-ascent.dev>" -m "HOTFIX: <description>"
git push -u origin hotfix-<description>

# 4. Create PR to master (NOT sprint-N)
gh pr create --base master --head hotfix-<description> --title "HOTFIX: <description>" --body "Emergency fix for production bug. Cherry-pick to sprint-N after merge."

# 5. After merge to master, cherry-pick to sprint-N
git checkout sprint-N
git pull origin sprint-N
git cherry-pick <hotfix-commit-hash>
git push origin sprint-N
```

**IMPORTANT:** Hotfixes bypass the normal sprint process. Only use for critical production bugs.

---

## Scenario 3: Revert Integration PR (Merged sprint-N to master)

**Problem:** Integration PR was merged to master but contains critical bugs.

**Solution:** Revert the integration merge and re-open the sprint.

```bash
# 1. Find the integration merge commit
git checkout master
git pull origin master
git log --oneline --merges -5  # Find sprint-N integration merge

# 2. Revert the merge
git revert -m 1 <integration-merge-commit-hash>
git commit -m "REVERT: Sprint N integration (critical bugs found)"

# 3. Push revert to master
git push origin master

# 4. Restore sprint-N branch (if deleted)
git checkout -b sprint-N <commit-before-integration>
git push -u origin sprint-N

# 5. Fix bugs on sprint-N
# ... fix issues ...

# 6. Re-create integration PR when ready
gh pr create --base master --head sprint-N --title "Sprint N: <Goal> (v2 - fixes applied)"
```

**CRITICAL:** Inform Stu immediately via MISSION_CONTROL.md. This is a major rollback.

---

## Scenario 4: Reset Sprint Branch (Nuclear Option)

**Problem:** Sprint branch is in unrecoverable state (merge conflicts, corrupted history, etc.).

**Solution:** Hard reset sprint branch to last known good state.

```bash
# 1. Find last known good commit
git checkout sprint-N
git log --oneline -20  # Identify good commit hash

# 2. Backup current state (just in case)
git checkout -b sprint-N-backup-$(date +%Y%m%d)
git push -u origin sprint-N-backup-$(date +%Y%m%d)

# 3. Hard reset sprint branch
git checkout sprint-N
git reset --hard <last-good-commit-hash>

# 4. Force push (DANGEROUS - requires confirmation)
git push --force-with-lease origin sprint-N
```

**WARNING:** This is destructive. Only use as last resort. Always backup first.

**CRITICAL:** Inform Stu via MISSION_CONTROL.md before force-pushing.

---

## Scenario 5: Un-merge a Task PR (Before Integration)

**Problem:** A task PR was merged to sprint-N but shouldn't have been (failed review, premature merge).

**Solution:** Same as Scenario 1 - create a revert commit.

```bash
git checkout sprint-N
git pull origin sprint-N
git log --oneline --merges -10
git revert -m 1 <merge-commit-hash>
git commit -m "REVERT: <TASK-ID> (merged prematurely, failed review)"
git push origin sprint-N
```

---

## Scenario 6: Corrupted GitHub Pages Deploy

**Problem:** Deployment to GitHub Pages failed or deployed broken build.

**Solution:** Redeploy from last known good commit.

```bash
# 1. Check deployment history
gh run list --workflow deploy.yml --limit 10

# 2. Find last successful deploy
# Note the commit hash

# 3. If sprint-N is broken, revert to good commit
git checkout sprint-N
git reset --hard <last-good-commit-hash>
git push --force-with-lease origin sprint-N

# 4. Re-trigger deploy
git commit --allow-empty -m "Re-trigger deploy"
git push origin sprint-N
```

**Alternative:** If master is good but sprint-N is broken, just wait - master is the stable deploy.

---

## Emergency Contacts

| Situation | Action |
|-----------|--------|
| Uncertain about rollback | Add 🔴 URGENT note to MISSION_CONTROL.md, wait for Stu |
| Critical production bug | Hotfix to master (Scenario 2), notify Stu |
| Sprint in chaos | Add 🟡 NEEDS INPUT to MISSION_CONTROL.md, describe state |
| GitHub Pages down | Check `gh run list --workflow deploy.yml` for errors |

---

## Rollback Checklist

Before executing any rollback:

- [ ] Document the problem (what broke, when, why)
- [ ] Identify affected commits/PRs
- [ ] Backup current state if doing destructive operations
- [ ] Notify Stu via MISSION_CONTROL.md for major rollbacks
- [ ] Execute rollback procedure
- [ ] Verify fix (run game, check CI, test affected features)
- [ ] Update integration PR description if affected
- [ ] Update sprint board task statuses
- [ ] Document root cause and prevention in DECISIONS.md

---

## Prevention

**How to avoid needing rollbacks:**

1. **Never skip validation** - `npm run validate` before every push
2. **Always smoke test** - Run the game, test your changes
3. **Peer review required** - No self-merge without peer approval
4. **CI must pass** - Never merge with failing CI
5. **Small PRs** - <300 lines, easier to revert
6. **Feature flags** - For risky changes, use feature flags to toggle off
7. **Integration testing** - Test on sprint-N before merging to master

---

## Post-Rollback

After any rollback:

1. **Root cause analysis** - Why did this happen?
2. **Update DECISIONS.md** - Document the incident and prevention
3. **Fix the issue** - Create new PR with proper fix
4. **Update tests** - Add regression tests for the bug
5. **Review process** - Did review process fail? Improve it.

---

## Common Git Commands

```bash
# View recent merges
git log --oneline --merges -10

# View commit history
git log --oneline -20

# View file at specific commit
git show <commit-hash>:path/to/file

# View diff between commits
git diff <commit-A> <commit-B>

# List all branches
git branch -a

# Check what changed in a PR
gh pr diff <PR-NUMBER>

# View PR details
gh pr view <PR-NUMBER>

# List recent GitHub Actions runs
gh run list --limit 10
```

---

## Remember

- **Communicate first** - Always inform Stu for major rollbacks
- **Backup before force-push** - Create backup branches
- **Verify after rollback** - Test that the fix worked
- **Document everything** - Update DECISIONS.md with incidents
- **Learn and prevent** - Every rollback is a process improvement opportunity
