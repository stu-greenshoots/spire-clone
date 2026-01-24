# Sprint 2 Kickoff Plan

**Sprint:** 2 - Stabilize & Expand
**Start Date:** 2026-01-24
**Goal:** Fix all P0 runtime bugs, close remaining Phase 1 gaps, lay groundwork for Phase 2.
**Branch:** `sprint-2`
**PR Target:** All PRs merge into `sprint-2` (never master directly)
**Deploys:** GitHub Pages deploys from `sprint-2` on every push
**Principle:** Fix before feature. Validate before merge. Ship stable, not fast.

---

## Sprint 1 Lessons (Non-Negotiable Changes)

Sprint 1 delivered code but broke the game. Three P0 runtime bugs shipped despite 763 passing tests. What went wrong and what changes:

| Problem | Root Cause | Sprint 2 Fix |
|---------|-----------|--------------|
| Potion UI broken at runtime | Called non-existent action | Smoke test every feature in the browser |
| Save/load corrupts data | Format mismatch (objects vs IDs) | Test round-trips, not just save OR load |
| Card effects crash | Missing context variable | Integration tests with real game state |

**New rule for sprint 2:** Every PR requires a "Smoke Test" section in the template proving the feature works in the actual running game. Screenshots or it didn't happen.

---

## Team Assignments

### Phase A: P0 Bug Fixes (Day 1 - Can Run in Parallel)

These three fixes touch independent files and can all ship simultaneously.

| Task | Owner | Files | What's Wrong | Fix |
|------|-------|-------|-------------|-----|
| FIX-01 | JR | GameContext.jsx, useGame hook, PotionSlots.jsx | `usePotion` called but doesn't exist | Add USE_POTION/DISCARD_POTION actions to GameContext, expose through useGame |
| FIX-02 | AR | saveSystem.js, metaReducer.js | Save stores full objects, load expects IDs | Serialize to IDs on save, reconstruct from definitions on load |
| FIX-03 | BE | cardEffects.js, combatReducer.js | Card effects reference `ctx.hand` but it's not passed | Include `hand` array in the effect execution context |

**Acceptance:** Each fix must include a test that fails without the fix and passes with it. Plus browser smoke test.

---

### Phase B: P1 Fixes + Remaining Sprint 1 Tasks (After Phase A merges)

| Task | Owner | Files | Description |
|------|-------|-------|-------------|
| FIX-04 | GD | assetLoader.js | WebP/PNG format inconsistency - add WebP check with PNG fallback |
| BE-02 | BE | context/, data/ | Normalize state: enemies/cards use unique IDs, not array indices |
| UX-02 | UX | Card.jsx, CombatScreen.jsx | Keyword tooltips + damage preview on card hover |
| GD-02 | GD | Card.jsx, App.css | Card frames by type (attack=red, skill=blue, power=gold) |
| JR-02 | JR | RestSite.jsx, cards.js | Card upgrade system polish - visual indicator, preview comparison |

---

### Phase C: Sprint 2 New Features (After Phase B merges)

| Task | Owner | Files | Description |
|------|-------|-------|-------------|
| FIX-05 | JR | enemies.js, effectProcessor.js | Barricade block retention for appropriate enemies |
| FIX-06 | QA | Enemy.test.jsx, Enemy.jsx | Replace regex HP selectors with data-testid attributes |
| AR-02 | AR | saveSystem.js, metaReducer.js | Save system overhaul - auto-save, validation, run history |
| AR-03 | AR | Settings.jsx | Settings & accessibility (volume, animation speed, text size) |
| QA-03 | QA | tests/e2e/ (new) | E2E test suite with Playwright |

---

## Conflict Zones

These files are touched by multiple tasks. Resolve in order shown:

| File | First | Then |
|------|-------|------|
| saveSystem.js | FIX-02 (quick fix) | AR-02 (overhaul) |
| metaReducer.js | FIX-02 | AR-02 |
| GameContext.jsx | FIX-01 (small wire-up) | BE-02 (refactor) |
| combatReducer.js | FIX-03 (add ctx.hand) | BE-02 (normalize) |
| Card.jsx | UX-02 or GD-02 (either order) | - |

---

## Process Reminders

### Branch workflow
```bash
git checkout sprint-2
git pull origin sprint-2
git checkout -b sprint-2/{task-id}-{description}
# ... work ...
npm run validate
git push -u origin sprint-2/{task-id}-{description}
# Open PR targeting sprint-2
```

### Commit format
```
TASK-ID: short description
```

### Before every push
```bash
npm run validate   # lint + test + build - must pass
```

### PR checklist
- [ ] Targets `sprint-2` branch
- [ ] Title: `TASK-ID: Description`
- [ ] Max ~300 lines
- [ ] CI passes
- [ ] Smoke test section filled with evidence
- [ ] No files outside your ownership touched without coordination

---

## Diaries

Every team member has a diary at `docs/diaries/{ROLE}.md`. Update it daily with:
- What you did
- What blocked you
- What you're doing next

This is how we track progress without standups. If your diary is stale, we assume you're stuck.

---

## Validation Gate (Before Merging sprint-2 to master)

- [ ] All P0 bugs fixed and validated at runtime
- [ ] `npm run validate` passes on sprint-2 branch
- [ ] Full game playthrough: start -> 3 combats -> rest -> event -> boss (no crashes)
- [ ] Potion use works in combat
- [ ] Save/load round-trips without corruption
- [ ] Card effects with hand context work
- [ ] All PRs followed process (branch naming, commit format, size limits)

---

## Task Owners Summary

| Member | Sprint 2 Tasks | Priority |
|--------|---------------|----------|
| **BE** | FIX-03, BE-02 | P0 fix first, then normalize |
| **JR** | FIX-01, FIX-05, JR-02 | P0 fix first, then block fix, then upgrades |
| **AR** | FIX-02, AR-02, AR-03 | P0 fix first, then overhaul, then settings |
| **GD** | FIX-04, GD-02 | Asset fix, then card frames |
| **UX** | UX-02 | Card tooltips after Phase A |
| **QA** | FIX-06, QA-03 | Test selectors, then E2E suite |
| **SL** | (support) | Available for reviews and smoke testing |
| **PM** | Coordination | Board maintenance, PR reviews, process enforcement |

---

## Definition of Done (Sprint 2 Standard)

A task is done when:
1. Code is in a merged PR on `sprint-2`
2. Tests exist that fail without the fix/feature
3. `npm run validate` passes
4. Smoke test proves it works in the running game
5. No lint errors, no TODOs, no commented-out code
6. Diary updated with what was done
7. File ownership boundaries respected

A task is NOT done when:
- Tests pass but the feature doesn't work in the browser
- Code is committed but not in a PR
- The PR is open but CI is failing
- "It works on my machine" but no smoke test evidence
