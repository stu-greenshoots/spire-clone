# Sprint 19: Release Ready — Final Art, Bug Fix, Ship 1.1.0

**Created:** 2026-02-09
**Branch:** `sprint-19`
**Theme:** Complete the final art push, fix the reward modal bug, and ship 1.1.0
**Previous Sprint:** Sprint 18 COMPLETE (15/15 tasks, 3759 tests, 12th consecutive 100% sprint)

---

## Why This Sprint Exists

Sprint 18 accomplished its visual polish goals:
- **Art coverage improved:** 72% of cards now have quality art (up from 28%)
- **All Act 1 bosses/elites replaced:** First impression is now professional
- **All character-specific relics have art:** 15 new WebP icons
- **Validation complete:** Keyboard controls verified, DevTools working

However, Sprint 18's retrospective identified:
1. **FIX-13:** Reward modal timing bug causing 4/30 E2E tests to timeout
2. **52 card placeholders remaining:** 28% of cards still have <10KB placeholder art
3. **Release pending:** Sprint 18 achieved ship readiness, but we haven't actually released

Sprint 19 is the final sprint before 1.1.0 release. We fix the remaining bugs, complete the art push, and ship.

---

## Principles

1. **Fix before ship.** The reward modal bug is embarrassing — it shows rewards during combat.
2. **Art completion over perfection.** Get 90%+ cards to quality art; don't block on 100%.
3. **Release confidence.** Full regression before tagging 1.1.0.
4. **Celebrate completion.** 19 sprints to a polished roguelike deck-builder.

---

## Sprint 19 Tasks (15 total)

### P0 — Must Ship

| Task | Owner | Size | Description |
|------|-------|------|-------------|
| PM-19 | PM | S | Merge Sprint 18 to master, create sprint-19 branch, draft PR |
| FIX-13 | BE | M | Fix reward modal timing bug — reward screen appears during combat |
| GD-32 | GD | L | Card art batch 1 — replace 25 placeholder cards with DALL-E art |
| GD-33 | GD | L | Card art batch 2 — replace 25 more placeholder cards |
| QA-27 | QA | M | E2E test stabilization — fix 4 remaining timeout tests |

### P1 — Should Ship

| Task | Owner | Size | Description |
|------|-------|------|-------------|
| BE-34 | BE | S | Phase transition hardening — ensure COMBAT_VICTORY waits for animations |
| UX-35 | UX | S | Updated self-assessment — re-score after Sprint 19 art improvements |
| QA-28 | QA | M | Full regression — all 4 characters, all 4 acts, ascension 0 and 5 |
| JR-16 | JR | M | Final card balance review — verify win rates, adjust outliers |
| VARROW-13 | Varrow | S | Narrative polish — final pass on all player-facing text |

### P2 — Stretch

| Task | Owner | Size | Description |
|------|-------|------|-------------|
| AR-19 | AR | S | Audio polish — verify all triggers, add any missing SFX |
| GD-34 | GD | M | Remaining card art — continue replacing placeholders |
| PM-20 | PM | S | v1.1.0 Release — tag, deploy to GitHub Pages, update README |
| UX-36 | UX | S | Mobile gesture refinement — verify tap/drag on real devices |
| QA-29 | QA | S | Performance regression — Lighthouse 90+, bundle size check |

---

## Task Details

### PM-19: Sprint Setup (PM)
**Size:** S | **Priority:** P0
**Files:** `SPRINT_BOARD.md`, `SPRINT_19_PLAN.md`

1. Merge Sprint 18 to master (PR #241 or current)
2. Create sprint-19 branch from master
3. Create draft PR from sprint-19 to master
4. Update SPRINT_BOARD.md with Sprint 19 section

Acceptance criteria:
- [ ] Sprint 18 merged to master
- [ ] sprint-19 branch created
- [ ] Draft PR open
- [ ] SPRINT_BOARD.md updated

---

### FIX-13: Reward Modal Timing Bug (BE)
**Size:** M | **Priority:** P0
**Files:** `src/context/reducers/combatReducer.js`, `src/components/CombatScreen.jsx`

Root cause (from VP-10 investigation):
- `COMBAT_VICTORY` action dispatches before enemy death animations complete
- Phase transitions from COMBAT to REWARD while combat UI is still visible
- Reward modal overlays combat screen instead of replacing it

Fix approach:
1. Delay COMBAT_VICTORY dispatch until death animations complete
2. OR: Add transitional "victory" state between COMBAT and REWARD
3. Ensure CombatScreen unmounts before RewardScreen mounts

Acceptance criteria:
- [ ] Reward modal never appears during combat
- [ ] Victory animation plays to completion before rewards
- [ ] All 4 E2E playthrough tests pass
- [ ] No regression in victory flow

---

### GD-32: Card Art Batch 1 (GD)
**Size:** L | **Priority:** P0
**Files:** `src/assets/art/cards/`, card sprite sheet

Replace 25 placeholder cards with DALL-E generated art, prioritizing:
- Ironclad uncommon/rare with <5KB art
- Silent uncommon/rare with <5KB art

Use the proven DALL-E workflow from VP-13:
- OpenAI API with safe prompts (abstract energy, magical effects)
- 1024px generation → 256px resize → WebP quality 90

Target cards (verify actual sizes before replacing):
- Ironclad: berserk, brutality, demonForm, exhume, feed, fiendFire, immolate, limitBreak, offering, reaper
- Silent: adrenaline, afterImage, burst, caltrops, catalyst, chokePods, cloak, crippling, dieDieDie, doppelganger
- Continue with remaining Ironclad/Silent uncommon/rare

Acceptance criteria:
- [ ] 25 cards replaced with >10KB art
- [ ] Card sprite sheet rebuilt
- [ ] Verified in deck viewer
- [ ] `npm run validate` passes

---

### GD-33: Card Art Batch 2 (GD)
**Size:** L | **Priority:** P0
**Files:** `src/assets/art/cards/`, card sprite sheet

Replace 25 more placeholder cards, prioritizing:
- Defect uncommon/rare with <5KB art
- Watcher uncommon/rare with <5KB art

Target cards:
- Defect: aggregate, biasedCognition, bootSequence, buffer, chaos, charge, consume, darkness, equilibrium, geneticAlgorithm
- Watcher: alpha, beta, innerPeace, judgement, lessonLearned, like_water, omega, rushdown, simmeringFury, swivel
- Continue with remaining

Acceptance criteria:
- [ ] 25 cards replaced with >10KB art
- [ ] Card sprite sheet rebuilt
- [ ] Verified in deck viewer
- [ ] `npm run validate` passes

---

### QA-27: E2E Test Stabilization (QA)
**Size:** M | **Priority:** P0
**Files:** `tests/e2e/specs/*.spec.js`

Fix the 4 E2E tests that timeout:
1. `full-playthrough.spec.js` (Ironclad, Silent, Defect, Watcher)

Root cause is FIX-13 (reward modal timing). After BE fixes FIX-13:
1. Verify tests pass locally
2. Verify tests pass on CI
3. If still failing, investigate test infrastructure

Acceptance criteria:
- [ ] All 30 E2E tests pass on CI
- [ ] No test skips or flaky annotations
- [ ] CI pipeline is green

---

### BE-34: Phase Transition Hardening (BE)
**Size:** S | **Priority:** P1
**Files:** `src/context/reducers/combatReducer.js`, `src/components/CombatScreen.jsx`

Strengthen the phase transition system to prevent future timing bugs:
1. Add explicit "transitioning" state if needed
2. Ensure animation system communicates completion to reducer
3. Add defensive checks for phase mismatches

Acceptance criteria:
- [ ] Phase transitions are robust
- [ ] No phase race conditions possible
- [ ] Test coverage for phase transitions

---

### UX-35: Updated Self-Assessment (UX)
**Size:** S | **Priority:** P1
**Files:** `docs/SELF_ASSESSMENT.md`

Re-score the game after Sprint 19 art improvements:
- Sprint 18 honest score: 84/100
- Sprint 18 post-art estimated: 92/100
- Sprint 19 target: 95+/100

Update all category scores with evidence:
- Visual Presentation: Expected improvement from 6 to 8-9
- Other categories: Verify still accurate

Acceptance criteria:
- [ ] All category scores updated with evidence
- [ ] Overall score reflects Sprint 19 state
- [ ] Comparison to previous assessments

---

### QA-28: Full Regression (QA)
**Size:** M | **Priority:** P1
**Files:** None (testing only)

Before release, verify everything works:
1. Full playthrough with each character (A0)
2. Full playthrough with each character (A5)
3. Verify endless mode works
4. Verify daily challenge works
5. Verify custom seeds work
6. Verify all 4 compendiums (cards, relics, potions, enemies)

Document any issues found.

Acceptance criteria:
- [ ] 4 character playthroughs at A0 completed
- [ ] 4 character playthroughs at A5 completed
- [ ] All game modes verified
- [ ] Issues documented or none found

---

### JR-16: Final Card Balance Review (JR)
**Size:** M | **Priority:** P1
**Files:** `src/data/cards.js` (if changes needed)

Review card balance one final time:
1. Run balance simulator for all 4 characters
2. Check win rates: Target 25-35% at A0, 10-20% at A5
3. Identify any outlier cards (too strong/weak)
4. Propose fixes if needed (requires PM approval for balance changes)

Acceptance criteria:
- [ ] Win rate data for all characters
- [ ] Outlier analysis complete
- [ ] Any fixes approved and merged (or documented for post-release)

---

### VARROW-13: Narrative Polish (Varrow)
**Size:** S | **Priority:** P1
**Files:** `src/data/flavorText.js`, `src/data/bossDialogue.js`, `src/data/events.js`

Final pass on all narrative text:
1. Check for typos/grammar
2. Verify voice consistency ("The Endless War" theme)
3. Ensure all cards/relics have flavor text
4. Check event text completeness

Acceptance criteria:
- [ ] All text reviewed for quality
- [ ] Voice consistency verified
- [ ] No missing flavor text
- [ ] No typos/grammar issues

---

### AR-19: Audio Polish (AR)
**Size:** S | **Priority:** P2
**Files:** `public/sounds/`

Final audio verification:
1. Verify all 52 audio files still play correctly
2. Check for any missing SFX (new cards/features)
3. Verify volume normalization
4. Test on different browsers

Acceptance criteria:
- [ ] All audio triggers verified
- [ ] No missing SFX
- [ ] Cross-browser compatibility

---

### GD-34: Remaining Card Art (GD)
**Size:** M | **Priority:** P2
**Files:** `src/assets/art/cards/`

If GD-32 and GD-33 complete, continue replacing remaining placeholders:
- Target: Get to 90%+ quality coverage (170+ cards)
- Current: 135/188 quality (72%)
- After GD-32/33: 185/188 quality (98%)

This task is stretch — only if time permits after P0/P1.

Acceptance criteria:
- [ ] Additional cards improved
- [ ] Progress tracked in ASSET_AUDIT.md

---

### PM-20: v1.1.0 Release (PM)
**Size:** S | **Priority:** P2
**Files:** `package.json`, `README.md`

Execute the release checklist (docs/RELEASE_CHECKLIST.md):
1. Merge sprint-19 to master
2. Tag v1.1.0
3. Verify GitHub Pages deployment
4. Update README with changelog
5. Update version in package.json

Acceptance criteria:
- [ ] v1.1.0 tagged on master
- [ ] GitHub Pages serving latest build
- [ ] README updated
- [ ] Deployment verified

---

### UX-36: Mobile Gesture Refinement (UX)
**Size:** S | **Priority:** P2
**Files:** `src/components/CombatScreen.jsx`

Verify mobile gestures on real devices:
1. Test on iOS Safari
2. Test on Android Chrome
3. Verify tap-to-play works
4. Verify drag-to-play works
5. Verify 10px threshold is appropriate

Acceptance criteria:
- [ ] Gestures work on iOS
- [ ] Gestures work on Android
- [ ] No regressions from UX-URGENT fix

---

### QA-29: Performance Regression (QA)
**Size:** S | **Priority:** P2
**Files:** None (testing only)

Verify performance hasn't regressed:
1. Run Lighthouse audit (target: 90+ performance)
2. Verify bundle size hasn't grown significantly
3. Check sprite sheet sizes
4. Measure load time on slow connection

Acceptance criteria:
- [ ] Lighthouse performance 90+
- [ ] Bundle size documented
- [ ] No major regressions

---

## Parallel Execution Plan

### Batch 1 (Start Immediately)

| Task | Agent | Notes |
|------|-------|-------|
| PM-19 | PM | Setup (done first) |
| FIX-13 | BE | P0 bug fix |
| GD-32 | GD | Card art batch 1 |
| QA-27 | QA | Depends on FIX-13 |

### Batch 2 (After Batch 1 completes)

| Task | Agent | Notes |
|------|-------|-------|
| GD-33 | GD | Card art batch 2 |
| BE-34 | BE | Phase transition hardening |
| JR-16 | JR | Balance review |
| VARROW-13 | Varrow | Narrative polish |

### Batch 3 (P2 tasks)

| Task | Agent | Notes |
|------|-------|-------|
| QA-28 | QA | Full regression |
| UX-35 | UX | Self-assessment |
| AR-19 | AR | Audio polish |
| GD-34 | GD | More art (stretch) |
| PM-20 | PM | Release (final) |
| UX-36 | UX | Mobile testing |
| QA-29 | QA | Performance check |

---

## Validation Gate

### P0 (Must Pass)
- [ ] FIX-13 merged — reward modal timing fixed
- [ ] GD-32 merged — 25 cards improved
- [ ] GD-33 merged — 25 cards improved
- [ ] All 30 E2E tests pass on CI
- [ ] `npm run validate` passes (3759+ tests)

### P1 (Should Pass)
- [ ] Full regression completed without issues
- [ ] Card balance verified
- [ ] Narrative text polished
- [ ] Phase transitions hardened
- [ ] Self-assessment updated to 95+

### P2 (Nice to Have)
- [ ] v1.1.0 released
- [ ] Mobile gestures verified
- [ ] Performance regression passed
- [ ] 90%+ card art coverage

---

## Success Criteria

Sprint 19 is successful if:
1. **The reward modal bug is fixed** — embarrassing visual bug eliminated
2. **Card art reaches 90%+ coverage** — <20 placeholders remaining
3. **E2E tests are stable** — 30/30 passing on CI
4. **1.1.0 is released** — or we're confident we could release

---

## What We Are NOT Doing

- No new features
- No new content (cards, enemies, relics)
- No new characters
- No major refactors
- No scope creep

This is a polish and release sprint. Fix bugs, improve art, ship.

---

## Risk Assessment

### Low Risk
- GD-32/33: Proven DALL-E workflow from VP-13
- PM-20: Release checklist already created

### Medium Risk
- FIX-13: Phase transition bugs can be subtle
- QA-27: E2E tests depend on FIX-13 success

### Mitigation
- If FIX-13 is complex, BE-34 can help with investigation
- If E2E tests still fail after FIX-13, QA can add targeted test fixes
- Release (PM-20) can be deferred to Sprint 20 if blockers emerge

---

## Sprint 19 Metrics Targets

| Metric | Current | Target |
|--------|---------|--------|
| Tests | 3759 | 3800+ |
| Card Art Quality | 135/188 (72%) | 185/188 (98%) |
| E2E Tests Passing | 26/30 | 30/30 |
| Self-Assessment Score | 84 → 92 | 95+ |
| Consecutive 100% Sprints | 12 | 13 |

---

*Sprint 19 is the final push. After 18 sprints of development, we ship.*
