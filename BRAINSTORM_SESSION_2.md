# Spire Ascent - Team Brainstorm Session 2
## Sprint 1 Retrospective & Process Reset | 2026-01-24

**Attendees:** PM, GD, UX, SL, BE, JR, AR, QA
**Format:** Retrospective first, then process fixes, then sprint 2 prep
**Context:** Sprint 1 work landed but things got messy. PRs are tangled, CI broke post-merge, Copilot review flagged runtime bugs. We need to reset before sprint 2.

---

## Part 1: What Happened (The Honest Assessment)

### AR (Allrounder - calling it like it is):
Right. Let me summarize what actually happened today:

1. **All 10 sprint 1 tasks landed in ONE commit.** That's `7f9682e` - "Sprint 1: UI overhaul, asset optimization, and system refactoring". One commit. Ten tasks. No incremental review. No per-task validation. We said we'd be disciplined about this and then just... didn't.

2. **CI was added AFTER the work was done.** The GitHub Actions workflow exists now, but it wasn't gating anything when the sprint 1 code landed. Then we needed PRs #3 and #6 just to fix lint warnings and config issues that CI caught too late.

3. **Branch naming is a mess.** We have `claude/fix-ci-failures-RmZyD`, `claude/github-pages-deployment-LsIh1`. Auto-generated garbage names. Nobody can tell what's what from the branch list.

4. **PR #1 is still DRAFT.** The main sprint-1-to-master PR is open as a draft. Meanwhile, PRs #2, #3, #5, #6 were merged INTO sprint-1 from sub-branches. And PR #4 (addressing feedback) is still open. The PR graph makes no sense.

5. **Copilot found runtime bugs we should have caught.** These aren't lint warnings - they're actual broken functionality.

### BE (Back Ender):
The architecture split (BE-01) went well technically. GameContext is 375 lines now, tests pass. But AR is right - I should have opened a PR just for my work so it could be reviewed independently. Instead my refactor is mixed in with everyone else's changes and nobody can tell what broke what.

### QA (Tester):
I wrote 474 new tests (289 -> 763). They all pass. But here's the problem: **tests passing doesn't mean the game works.** Copilot flagged that PotionSlots.jsx references a `usePotion` function that doesn't exist in the hook. My component tests render in isolation with mocked context - they wouldn't catch that. We need integration-level validation.

### JR (Junior):
The potion system data layer works - `potionSystem.js` handles all 15 effects correctly in tests. But the UI component (`PotionSlots.jsx`) was wired up incorrectly. It references `usePotion` from the game hook, but that action was never exposed in GameContext. I built the system but didn't validate the full integration path.

---

## Part 2: The Runtime Bugs (Copilot Review Findings on PR #1)

These were flagged by GitHub Copilot's automated review. All are functional issues, not style nits:

| # | Severity | Issue | File | Status |
|---|----------|-------|------|--------|
| 1 | **HIGH** | Save system stores full objects but load expects IDs - save/load is broken | saveSystem.js / metaReducer.js | UNRESOLVED |
| 2 | **HIGH** | PotionSlots.jsx calls `usePotion` which doesn't exist in useGame hook | PotionSlots.jsx | UNRESOLVED |
| 3 | **HIGH** | Card effects reference `ctx.hand` which isn't passed to effect context | cardEffects.js | UNRESOLVED |
| 4 | **MEDIUM** | Asset loader uses PNG paths but PR claims WebP conversion done | assetLoader.js | UNRESOLVED |
| 5 | **MEDIUM** | Vitest `pool: 'threads'` and `maxWorkers: 2` are invalid config options | vite.config.js | FIXED (PR #6) |
| 6 | **LOW** | `barricade`/`retainBlock` only set on one enemy, others won't retain block | enemies.js / effectProcessor.js | UNRESOLVED |
| 7 | **LOW** | Test uses fragile regex for HP display matching | Enemy.test.jsx | UNRESOLVED |
| 8 | **LOW** | compress-images.js uses sharp which needs platform-specific binaries | scripts/compress-images.js | ACKNOWLEDGED |

**Verdict:** 3 HIGH severity bugs mean the potion UI, save system, and some card effects are non-functional at runtime despite tests passing. Sprint 1 is NOT actually done - it's committed but not validated.

---

## Part 3: Why This Happened (Root Causes)

### PM (Project Manager):
Being honest with myself here. The process failures trace back to:

1. **No PR-per-task discipline.** The brainstorm said "each team member = one ralph loop" but we never said "each loop = one PR with review before merge". Everything accumulated into one branch tip.

2. **No CI gate on the sprint-1 branch.** CI only triggers on PRs to main/master. Sprint-1 had no protection.

3. **"Tests pass" was our only validation.** Unit tests mock dependencies. A function can exist in tests but not in the actual codebase.

4. **No manual smoke test.** Nobody ran the game and actually tried to use a potion, save/load, or play a barricade card.

5. **Review came too late.** Copilot reviewed PR #1 after ALL the work was done. By then it's a 50-file PR that nobody wants to unpick.

---

## Part 4: Process Changes (How GitHub Helps Us)

### Proposed Workflow for Sprint 2:

```
master (stable, deployable)
  └── sprint-2 (integration branch)
       ├── sprint-2/be-02-normalize-state     (one task, one branch)
       ├── sprint-2/jr-03-act2-enemies        (one task, one branch)
       ├── sprint-2/fix-save-system           (bug fix branch)
       └── sprint-2/fix-potion-integration    (bug fix branch)
```

### Branch Naming Convention
```
sprint-{N}/{task-id}-{short-description}
```
Examples:
- `sprint-2/be-02-normalize-state`
- `sprint-2/jr-03-act2-enemies`
- `sprint-2/fix-save-system`
- `sprint-1/hotfix-potion-integration`

### PR Rules
1. **One PR per task.** No bundling. Max ~300 lines changed.
2. **PR title format:** `{TASK-ID}: {Description}` (e.g., `BE-02: Normalize game state from indices to IDs`)
3. **PR must target sprint-N branch** (not master directly).
4. **CI must pass** before merge.
5. **Validate script must pass locally** before pushing: `npm run validate`
6. **PR body uses template** (see PROCESS.md).
7. **No auto-generated branch names.** Human-readable names only.

### CI Expansion
- Add `sprint-*` branches to CI trigger (not just main/master)
- Add a "smoke test" job: start dev server, run basic navigation check
- Add PR size check: warn if >500 lines changed

### Review Process
1. Author runs `npm run validate` locally and confirms pass
2. PR opened with filled-out template
3. Copilot reviews automatically
4. Address all HIGH/MEDIUM findings before merge
5. Merge to sprint-N branch
6. At sprint end: one reviewed PR from sprint-N to master

### Commit Conventions
```
{task-id}: {what changed}

Examples:
BE-02: Extract player state to use entity IDs instead of array indices
JR-03: Add 5 Act 2 normal enemies with movesets
FIX: Wire usePotion action through GameContext to PotionSlots
```

---

## Part 5: Sprint 1 Validation & Bug Fixes

### Before Sprint 2 Starts, Fix These:

| Priority | Fix | Owner | Branch |
|----------|-----|-------|--------|
| P0 | Wire `usePotion`/`discardPotion` actions through GameContext | JR | sprint-1/hotfix-potion-integration |
| P0 | Fix save system object/ID mismatch | AR | sprint-1/hotfix-save-system |
| P0 | Add `hand` to card effect context object | BE | sprint-1/hotfix-card-effect-context |
| P1 | Align asset loader with actual file formats (PNG vs WebP) | GD | sprint-1/hotfix-asset-format |
| P2 | Set barricade/retainBlock on relevant enemies | JR | sprint-1/hotfix-enemy-block |
| P2 | Replace fragile regex in Enemy.test.jsx with data-testid | QA | sprint-1/hotfix-test-selectors |

### Validation Checklist (Must Pass Before Sprint 2):
- [ ] `npm run validate` passes
- [ ] Start game -> play 3 combats -> no crashes
- [ ] Use a potion during combat -> effect applies
- [ ] Save game -> reload page -> load game -> state restored
- [ ] Play a card with `costReduceOnHpLoss` effect -> no error
- [ ] Enemy with barricade retains block between turns

---

## Part 6: Sprint 2 Scope

### Carry-Forward from Sprint 1 (Bugs):
- FIX-01: Potion UI integration (P0)
- FIX-02: Save system mismatch (P0)
- FIX-03: Card effect context (P0)
- FIX-04: Asset format alignment (P1)
- FIX-05: Enemy block retention (P2)

### New Sprint 2 Tasks (After bugs fixed):
| Task | Owner | Size | Priority | Description |
|------|-------|------|----------|-------------|
| BE-02 | BE | M | P1 | Normalize state (IDs not indices) |
| AR-02 | AR | M | P1 | Save system overhaul (proper serialization) |
| UX-02 | UX | S | P2 | Card info hierarchy & tooltips |
| JR-02 | JR | S | P2 | Card upgrade system polish |
| QA-03 | QA | L | P2 | E2E test suite (Playwright) |
| GD-02 | GD | M | P2 | Card frame & type visual system |

### Sprint 2 Principles:
1. **Fix before feature.** All P0 bugs closed before new work begins.
2. **One PR per task.** No exceptions.
3. **Validate before push.** `npm run validate` locally.
4. **Smoke test after merge.** Run the game. Click things. Does it work?
5. **Small PRs.** If a task is >300 lines, split it into sub-tasks.

---

## Part 7: Action Items

| # | Action | Owner | When |
|---|--------|-------|------|
| 1 | Create PROCESS.md with all conventions | PM | Now |
| 2 | Update CI to trigger on sprint-* branches | PM | Now |
| 3 | Fix P0 bugs (3 hotfix branches/PRs) | JR, AR, BE | Sprint 2 Day 1 |
| 4 | Close or merge PR #4 | PM | Now |
| 5 | Add PR template to .github/ | PM | Now |
| 6 | Update SPRINT_BOARD.md with sprint 2 scope | PM | Now |
| 7 | Each new task = own branch, own PR | ALL | Ongoing |

---

## Part 8: Key Decisions Made

| Decision | Rationale | Owner |
|----------|-----------|-------|
| Fix bugs before sprint 2 features | Runtime bugs mean sprint 1 isn't truly done | PM |
| One PR per task, max 300 lines | Prevents the PR #1 problem (50 files, unreviable) | PM |
| Branch naming convention enforced | Auto-generated names are unreadable | ALL |
| CI on sprint branches | Can't merge broken code to integration branch | PM |
| Manual smoke test required | Unit tests don't catch integration failures | QA |
| Save system gets a proper overhaul in sprint 2 | Current implementation has fundamental mismatch | AR |

---

## Closing Note (AR):
Look, sprint 1 produced a LOT of code. 763 tests, 10 systems, potions, events, audio, art pipeline - the volume is impressive. But volume without validation is technical debt. We shipped code that doesn't actually work at runtime. The fix isn't to slow down - it's to validate as we go. One PR, one review, one merge. Repeat. That's how real teams ship.
