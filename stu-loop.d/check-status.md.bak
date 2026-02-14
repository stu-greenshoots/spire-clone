Read docs/diaries/PM.md first — check for any URGENT/P0 entries.
Then read SPRINT_BOARD.md and run:
```bash
git log --oneline -20
gh pr list --state open
```

Tell me:
1. What sprint are we on?
2. How many tasks remain?
3. Are there any open PRs needing review?
4. Are there any BLOCKED tasks?
5. Did the last validation pass? (Check stu-loop.d/last-cycle.md if it exists)

Then output EXACTLY two status tags at the end of your response:

**Sprint status (pick one):**
- SPRINT_COMPLETE — if ALL tasks in the current sprint are done/merged
- SPRINT_ACTIVE — if there are tasks remaining

**PR status (pick one):**
- HAS_OPEN_PRS — if there are open PRs targeting the sprint branch that need review
- NO_OPEN_PRS — if there are no open PRs (or only the draft integration PR)

Example output endings:
```
SPRINT_ACTIVE
HAS_OPEN_PRS
```
or
```
SPRINT_ACTIVE
NO_OPEN_PRS
```
