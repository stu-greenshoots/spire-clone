# Sprint Close-Out Checklist

**Use this checklist when the sprint integration PR is ready to merge to master.**

---

## Pre-Merge Verification

- [ ] All P0 tasks merged to sprint-N branch
- [ ] Integration PR validation gate fully checked (all checkboxes marked)
- [ ] `npm run validate` passes on sprint-N branch
- [ ] E2E tests passing on CI
- [ ] Full manual playthrough completed without crashes
- [ ] No open PRs targeting sprint-N (all task PRs merged or closed)

---

## Merge Process

- [ ] Merge integration PR to master (squash-merge)
- [ ] Keep sprint-N branch for history (do NOT delete — preserves audit trail and review history)
- [ ] Tag release if applicable: `git tag vX.X.X && git push --tags`
- [ ] Verify GitHub Pages deployment succeeded
- [ ] Smoke test deployed site at https://stu-greenshoots.github.io/spire-clone/

---

## Documentation Updates (CRITICAL - Don't Skip)

- [ ] Archive sprint plan: `mv SPRINT_N_PLAN.md docs/archive/sprint-plans/`
- [ ] Update CURRENT_SPRINT file: `echo "N+1" > CURRENT_SPRINT`
- [ ] Update SPRINT_BOARD.md:
  - Mark sprint N as COMPLETE in history
  - Add Sprint N+1 section at top
  - Update "Current Sprint" line
  - Update "Integration Branch" line
- [ ] Update README.md Project History: Add Sprint N summary (1-2 sentences)
- [ ] Update CLAUDE.md "Last Updated" date only if process changed
- [ ] Update PROCESS.md "Last Updated" date only if process changed

---

## Sprint N+1 Setup

- [ ] Create sprint-N+1 branch from master: `git checkout -b sprint-N+1`
- [ ] Push new branch: `git push -u origin sprint-N+1`
- [ ] Create SPRINT_N+1_PLAN.md (via `pm-plan.md` command OR copy template)
- [ ] Create draft integration PR from sprint-N+1 to master
- [ ] Update all engineer diaries with sprint transition note

---

## Verification (Double-Check Everything)

- [ ] CURRENT_SPRINT file shows N+1
- [ ] Sprint-N plan is in `docs/archive/sprint-plans/` (not root)
- [ ] Sprint-N+1 branch exists: `git branch -a | grep sprint-N+1`
- [ ] Draft integration PR exists for sprint-N+1: `gh pr list --head sprint-N+1`
- [ ] SPRINT_BOARD.md shows Sprint N+1 as "Current Sprint"
- [ ] README.md mentions Sprint N in history section
- [ ] GitHub Pages deployment is live and functional

---

## Common Mistakes to Avoid

❌ **Don't forget to archive the sprint plan** — Clutters root directory
❌ **Don't forget to update CURRENT_SPRINT** — Causes documentation drift
❌ **Don't skip the README update** — Project history becomes incomplete
❌ **Don't merge integration PR with failing tests** — Breaks master
❌ **Don't create sprint-N+1 branch before merging sprint-N** — Creates conflicts

---

## If Something Goes Wrong

See `docs/ROLLBACK_GUIDE.md` for emergency procedures.
