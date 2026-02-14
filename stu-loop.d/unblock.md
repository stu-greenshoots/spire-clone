# Unblock

You are the PM acting as Mentor. Read SPRINT_BOARD.md, the current sprint plan, and docs/diaries/*.md.

Something is blocked. Diagnose the issue:
1. Read the relevant engineer's diary for context on what went wrong
2. Check git log and any open PRs for the blocked task
3. Identify the root cause of the blockage
4. Make a decision to unblock — update docs/DECISIONS.md if it affects shared interfaces
5. If the task needs to be reassigned or split, update SPRINT_BOARD.md
6. Commit any changes with --author='PM <pm@spire-ascent.dev>'

If the block is a code issue, fix it directly.
If the block is a process issue, document the resolution.
If the block requires user input, output: NEEDS_HUMAN
