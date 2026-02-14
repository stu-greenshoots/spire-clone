# Engineer Guide - Spire Ascent

This is the common reference for all engineers. Read this before every task.

---

## Session Start Checklist

Before doing ANY work:

1. **Read your diary:** `docs/diaries/{ROLE}.md`
2. **Read git flow:** `docs/GIT_FLOW.md`
3. **Check git state:**
   ```bash
   git status && git branch
   ```
4. **Read sprint board:** `SPRINT_BOARD.md`
5. **Read sprint plan:** `SPRINT_17_PLAN.md` (or current sprint plan)

---

## Git Workflow Summary

Full details in `docs/GIT_FLOW.md`. Quick reference:

```bash
git checkout sprint-N && git pull origin sprint-N
git checkout -b {task-id}-{description}
# ... do work ...
npm run validate                    # MUST pass
git add <specific-files>
git commit --author="{ROLE} <{role}@spire-ascent.dev>" -m "{TASK-ID}: description"
git push -u origin {task-id}-{description}
gh pr create --base sprint-N --title "{TASK-ID}: Description" --body "..."
# ... perform Copilot review ...
# ... perform Mentor review ...
gh pr merge --squash --delete-branch
```

---

## Definition of Done

Your task is NOT done until:

- [ ] Code in properly named branch
- [ ] `npm run validate` passes
- [ ] Commit uses correct `--author` flag
- [ ] PR created with full template
- [ ] Copilot review performed AND posted as PR comment
- [ ] Mentor review performed AND posted as PR comment
- [ ] All PR checklist items checked `[x]`
- [ ] Smoke test documented in PR
- [ ] Feature works at runtime (not just tests)
- [ ] Your diary updated

---

## Review Process

**CRITICAL: All review findings MUST be posted as PR comments for audit trail.**

### Copilot Review (perform on your own code)

Check for:
- Security: XSS, injection, secrets, unsafe eval
- Bugs: null refs, off-by-one, race conditions
- Quality: unused vars, dead code, duplication
- Tests: coverage, meaningful assertions

**Post findings to PR:** `gh pr comment --body "## Copilot Review Findings ..."`

### Mentor Review (perform on your own code)

Check for:
- Architecture: follows existing patterns
- Integration: works with other code
- File ownership: only your files (or coordinated)
- Definition of done: all criteria met

**Post findings to PR:** `gh pr comment --body "## Mentor Review ..."`

### Before Merge

1. All PR body checkboxes must be `[x]` (not `[ ]`)
2. Both reviews posted as PR comments
3. All HIGH/MEDIUM issues resolved

---

## Session End Checklist

Before ending:

1. **Update your diary** with what you did, blockers, next steps
2. **Verify PRs** are reviewed and ready (not just opened)
3. **Check sprint board** - update task status if needed

---

## Common Rules

1. **Stay in your lane** - Only modify files you own
2. **Validate before push** - `npm run validate` must pass
3. **Author your commits** - Use `--author="{ROLE} <{role}@spire-ascent.dev>"`
4. **No auto-merge** - Complete all review steps
5. **Document smoke tests** - What did you actually test?
6. **Update your diary** - Every session

---

## Author Flags

| Role | Author |
|------|--------|
| PM | `--author="PM <pm@spire-ascent.dev>"` |
| BE | `--author="BE <be@spire-ascent.dev>"` |
| JR | `--author="JR <jr@spire-ascent.dev>"` |
| AR | `--author="AR <ar@spire-ascent.dev>"` |
| UX | `--author="UX <ux@spire-ascent.dev>"` |
| GD | `--author="GD <gd@spire-ascent.dev>"` |
| SL | `--author="SL <sl@spire-ascent.dev>"` |
| Varrow | `--author="Varrow <varrow@spire-ascent.dev>"` |
| QA | `--author="QA <qa@spire-ascent.dev>"` |
