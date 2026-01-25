# Sprint 3 Kickoff Plan

**Sprint:** 3 - Review Feedback & Polish
**Start Date:** 2026-01-25
**Goal:** Address Game Zone Magazine feedback (58/100) to reach 70+ score
**Branch:** `sprint-3`
**PR Target:** All PRs merge into `sprint-3` (never master directly)
**Principle:** Fix before feature. Polish over scope. Target 70+ reviewer score.

---

## Sprint 2 Summary

Sprint 2 COMPLETE. All P0 bugs fixed, state normalized, save system overhauled.
- **Tests:** 837 passing (29 test files)
- **PRs Merged:** 11 into sprint-2
- **Deferred:** AR-03 (settings), QA-03 (E2E tests)

---

## Magazine Review Target Areas

Game Zone scored us 58/100. Here's what we need to fix:

| Category | Score | Issues | Sprint 3 Target |
|----------|-------|--------|-----------------|
| Gameplay | 7/10 | Damage preview ignores modifiers | 8/10 |
| Presentation | 6/10 | Too dark, card text truncation | 7/10 |
| Stability | 4/10 | P0 bugs (FIXED in Sprint 2) | 8/10 |
| UX/Polish | 5/10 | No tooltips, no feedback, no previews | 7/10 |

**Projected Score:** 68-72/100 (target: 70+)

---

## Team Assignments

### Phase A: Quick Wins (Day 1 - All Parallel)

These are independent CSS/config changes with high impact. All can run simultaneously.

| Task | Owner | Size | Files | Description |
|------|-------|------|-------|-------------|
| GD-05 | GD | S | App.css, theme.css | Theme brightness pass: raise background from #0a0a0f to ~#1a1a2e, CSS variable sweep |
| PM-03 | PM/BE | XS | App.jsx | Hide Data Editor button in production (`import.meta.env.PROD` check) |
| UX-05 | UX/GD | S | App.css, Card.jsx | Fix card text truncation: font sizing or auto-resize on overflow |

**Acceptance:** Each fix visible in running game. Screenshot evidence in PR.

---

### Phase B: UX Infrastructure (Days 2-3 - Ordered)

These build the tooltip and feedback systems that address the biggest review gaps.

| Task | Owner | Size | Files | Depends On | Description |
|------|-------|------|-------|------------|-------------|
| UX-06 | UX | M | NEW Tooltip.jsx, NEW useTooltip.js | Phase A | Portal-based tooltip for cards, relics, potions, status effects |
| JR-05 | JR | S | enemies.js | None | Enemy intent specificity: show "Applying Weak 2" not generic "Debuff" |
| AR-04 | AR | S | audioSystem.js | None | Audio investigation: verify Web Audio API autoplay policy handling |
| BE-05 | BE/UX | S | combatSystem.js, card components | UX-06 | Damage preview with modifiers: card numbers reflect Vulnerable/Weak |
| UX-07 | UX | M | AnimationOverlay.jsx, useAnimations.js | UX-06 | Combat feedback: floating damage/block/heal numbers |

**Dependency Notes:**
- UX-06 (tooltips) establishes the portal pattern that BE-05 and UX-07 can leverage
- BE-05 (damage preview) and UX-07 (floating numbers) can run in parallel after UX-06
- JR-05 and AR-04 are independent data/system changes

---

### Phase C: Performance & Deferred (Days 4+)

| Task | Owner | Size | Files | Depends On | Description |
|------|-------|------|-------|------------|-------------|
| GD-06 | GD | M | scripts/, assetLoader.js, card components | Phase A | Card art sprite sheet: reduce 100+ requests to bundled sprites |
| AR-03 | AR | S | Settings.jsx | AR-04 | Settings & accessibility (volume, animation speed, text size) |
| QA-03 | QA | L | tests/e2e/ (NEW) | All Phase B | E2E test suite with Playwright (5+ critical scenarios) |

---

## Execution Order (Conflict-Free)

### Day 1 (Parallel - Zero File Conflicts)
```
GD-05: App.css, theme.css (CSS variables only)
PM-03: App.jsx (single env check)
UX-05: App.css, Card.jsx (CSS text overflow)
```

### Day 2 (After Phase A merged)
```
UX-06: NEW Tooltip.jsx, NEW useTooltip.js (new files, no conflicts)
JR-05: enemies.js (data file only, JR-owned)
AR-04: audioSystem.js (AR-owned)
```

### Day 3 (After UX-06 merged)
```
BE-05: combatSystem.js, card display (damage calculation utility)
UX-07: AnimationOverlay.jsx, useAnimations.js (UX-owned)
```

### Day 4+ (After Phase B merged)
```
GD-06: scripts/, assetLoader.js, card components (asset pipeline)
AR-03: Settings.jsx (after audio investigation)
QA-03: tests/e2e/ (new directory, no conflicts)
```

---

## Conflict Zones

| File | Tasks | Resolution Order |
|------|-------|-----------------|
| `App.css` | GD-05, UX-05 | GD-05 first (CSS vars), then UX-05 (text overflow) - OR parallel if using different selectors |
| `Card.jsx` | UX-05, BE-05 | UX-05 first (styling), then BE-05 (damage calculation display) |
| `AnimationOverlay.jsx` | UX-07 only | No conflict - UX-owned |
| `audioSystem.js` | AR-04, AR-03 | AR-04 first (investigation), then AR-03 (settings integration) |
| `enemies.js` | JR-05 only | No conflict - JR-owned |

---

## Open Decisions to Resolve

Before work begins, PM resolves these in DECISIONS.md:

| Decision | Summary | Affects |
|----------|---------|---------|
| DEC-004 | Shared damage calculation utility | BE-05 |
| DEC-005 | Centralized effect processor | Future BE work |
| DEC-006 | Portal-based tooltip architecture | UX-06 |
| DEC-007 | CSS custom properties for theme | GD-05 |
| DEC-008 | Sprite sheet bundling | GD-06 |
| DEC-009 | User-gesture-gated audio | AR-04 |
| DEC-010 | E2E smoke test gate | QA-03 |
| DEC-011 | Structured intent data format | JR-05 |

---

## Process Reminders

### Branch workflow
```bash
git checkout sprint-3
git pull origin sprint-3
git checkout -b {task-id}-{description}
# ... work ...
npm run validate
git push -u origin {task-id}-{description}
# Open PR targeting sprint-3
```

### Commit format
```
TASK-ID: short description
```

### PR checklist
- [ ] Targets `sprint-3` branch
- [ ] Title: `TASK-ID: Description`
- [ ] Max ~300 lines
- [ ] CI passes
- [ ] Smoke test section with screenshot evidence
- [ ] No files outside your ownership without coordination

---

## Validation Gate (Before Merging sprint-3 to master)

- [ ] Theme is visibly brighter (not "black rectangle" on default monitor brightness)
- [ ] Card names do not truncate on reward selection screen
- [ ] Tooltips display on hover for cards, relics, and status effects
- [ ] Floating damage numbers appear when attacks connect
- [ ] Card damage preview updates with Vulnerable modifier
- [ ] No Data Editor button visible in production build
- [ ] Enemy intents show specific effect (e.g., "Applying Weak 2")
- [ ] Audio plays after first user interaction
- [ ] Self-review against Game Zone feedback checklist
- [ ] `npm run validate` passes

---

## Task Owners Summary

| Member | Sprint 3 Tasks | Priority |
|--------|---------------|----------|
| **GD** | GD-05, GD-06 | Brightness first (Day 1), sprites later (Day 4+) |
| **PM** | PM-03 | Quick win (Day 1) |
| **UX** | UX-05, UX-06, UX-07 | Truncation (Day 1), tooltips (Day 2), feedback (Day 3) |
| **BE** | BE-05 | Damage preview (Day 3) |
| **JR** | JR-05 | Intent specificity (Day 2) |
| **AR** | AR-04, AR-03 | Audio fix (Day 2), settings (Day 4+) |
| **QA** | QA-03 | E2E tests (Day 4+) |
| **SL** | (support) | Reviews, smoke testing, tooltip content |

---

## Definition of Done (Sprint 3)

A task is done when:
1. Code is in a merged PR on `sprint-3`
2. `npm run validate` passes
3. Screenshot evidence of feature working in browser
4. No lint errors, no TODOs, no commented-out code
5. Diary updated with what was done
6. File ownership boundaries respected
7. Addresses specific reviewer feedback (cite the review comment)

---

## Success Criteria

Sprint 3 is successful when:
1. All Phase A + Phase B tasks merged
2. Game Zone Magazine re-review would score 70+ (self-assessment)
3. A new player can understand cards via tooltips without external help
4. Combat feels responsive with visual feedback on every action
5. The game is no longer "a black rectangle" on first load
