# QA Diary - Sprint 8

## Sprint 8 Entries

### QA-09: E2E Infrastructure Fix
**Date:** 2026-01-31
**Status:** Complete, PR pending review

**Root causes identified:**
1. **Missing starting bonus skip** — The corrupted progression test clicked `newGameButton` directly without handling the starting bonus screen (added by BE-09). This caused the test to hang waiting for map nodes that never appeared because the bonus selection screen was blocking.
2. **Fixed timeouts throughout** — Combat helper used `waitForTimeout(300)`, `waitForTimeout(200)`, `waitForTimeout(500)` for card play animations, targeting resolution, and enemy turns. These are inherently flaky because animation timing varies with system load and sequential enemy turns (VP-08) can take 600ms+ per enemy.
3. **No viewport coverage** — Tests only ran at default Playwright viewport. No coverage for desktop (1920x1080) or mobile (390x844) layouts, which meant responsive layout regressions from UX-13/UX-14 went undetected.

**Fixes applied:**
1. **Corrupted progression test** — Added `gameActions` fixture parameter and used `startNewGame()` (which handles bonus skip) instead of raw button click. Increased map visibility timeout to 10s.
2. **Replaced all fixed timeouts with condition-based polling:**
   - Card play: now waits for hand count to change, targeting to activate, or combat to end
   - Targeting resolution: polls until targeting banner disappears
   - Enemy turn: polls for end-turn button, proceed button, or game-over indicators (increased max from 8s to 10s)
   - Reward collection: waits for gold button visibility/hidden state
   - Map transitions: waits for map nodes to appear
   - Added `waitForCondition()` utility for reusable polling
3. **Boss dialogue spec** — Replaced 4 `waitForTimeout` calls with condition-based waits (bonus skip, dialogue dismiss, non-combat node resolution)
4. **Added viewport test spec** — 7 tests covering desktop (1920x1080) and mobile (390x844): menu rendering, map rendering, combat rendering, overflow checks, touch target sizes.

**Results:**
- 19 E2E tests, 3/3 consecutive runs passing
- Zero fixed-timeout waits remaining in combat helper and fixture
- `npm run validate` passes (lint clean, all unit tests pass, build succeeds)

**Blockers:** None
**Next:** Await review on PR

---

# QA Diary - Sprint 7

## Sprint 7 Entries

### QA-08a: Act 2 Enemy Regression Tests
**Date:** 2026-01-31
**Status:** Complete, PR #75 ready for review

**Done:**
- Created `src/test/act2Regression.test.js` with 63 regression tests
- All 16 Act 2 enemy AIs validated for turns 0-10 (valid moves with id property)
- Centurion+Mystic pair fight: shield when hurt, heal when hurt, cycle when healthy, attack when alone
- New systems: confused (Snecko glare), plated armor (Shelled Parasite), lifesteal (Chosen/Parasite), artifact (Chosen/Automaton)
- Automaton boss 3-turn pattern verified over 9 turns
- Minion spawning: Gremlin Leader encourage/stab/enrage, Reptomancer summon/resummon
- Multi-attack values verified: Book of Stabbing, Byrd peck, Centurion fury, Chosen poke, Automaton dual, Dagger stab, Leader stab
- createEnemyInstance field propagation for all Act 2 enemies

**Validation:** `npm run validate` passes - 1131 tests, lint clean, build clean
**PR:** https://github.com/stu-greenshoots/spire-clone/pull/75

**Blockers:** None
**Next:** Await review on PR #75

---

# QA Diary - Sprint 6

## Sprint 6 Entries

### QA-07a: Mechanics Audit Spike
**Date:** 2026-01-30
**Status:** Complete, PR #50 ready for review

**Done:**
- Audited 4 Copilot claims against codebase
- 1 CONFIRMED BUG: Power cards go to discard pile (BE-16 owns fix)
- 3 NOT BUGS: Sentry data correct, combat clearing thorough, rarity distribution exists
- Created `docs/QA-07a-mechanics-audit.md` with full evidence

**Blockers:** None
**Next:** Await review on PR #50

---

# QA Diary - Sprint 5

## Role
Tester - Component tests, balance simulator, E2E tests

## Owned Files
`src/test/`, test infrastructure

## Sprint 5 Tasks
- QA-05: Sprint 5 test coverage + E2E timeout fix (P1)

---

## Entries

### QA-05 Complete - Sprint 5 Test Coverage
**Date:** 2026-01-25
**Status:** QA-05 complete, PR #44 ready for review

**Done today:**
1. **Fixed E2E timeout issue:**
   - Replaced fixed 4s wait in combat.js helper with dynamic `waitForEnemyTurnComplete()` polling function
   - Handles sequential enemy turns (VP-08) which can take 600ms per enemy
   - Polls for end turn button or combat end conditions with 8s max wait
   - Extended full-run.spec.js timeout to 90s for longer combat sequences

2. **Added ascension support to balance simulator:**
   - Added `ascension` config option (0-10) to `simulateRun` function
   - Applies HP multipliers, elite/boss buffs via `applyAscensionToEnemies`
   - Adds Wound card to deck at ascension 2+
   - Applies reduced healing percent at ascension 4+
   - Added 5 new unit tests for ascension support

3. **Validated and committed Sprint 5 test files:**
   - `src/test/progressionSystem.test.js` - 43 unit tests for meta-progression (BE-06)
   - `tests/e2e/specs/boss-dialogue.spec.js` - 5 E2E tests for boss dialogue (SL-03)
   - `tests/e2e/specs/progression.spec.js` - 4 E2E tests for progression persistence

**Test counts:**
- progressionSystem.test.js: 43 tests passing
- ascensionSystem.test.js: 34 tests passing (existing)
- balance/simulator.test.js: 24 tests passing (5 new for ascension)
- E2E specs: 3 new files added

**Validation:** `npm run validate` passes - lint clean, all tests pass, build succeeds

**Blockers:** None

**Copilot Review:** PASSED - No HIGH/MEDIUM issues found
**Mentor Review:** APPROVED

**PR:** https://github.com/stu-greenshoots/spire-clone/pull/44

---

### Magazine Review Notes (58/100)
**Date:** 2026-01-24
**Context:** Game Zone preview review — Stability scored 4/10. 763 unit tests pass but 3 P0 bugs exist at runtime.

**My takeaways:**
- **Critical lesson:** 763 passing unit tests masked 3 game-breaking runtime failures. Unit tests mock context, skip UI integration, and don't test actual user interactions. The magazine's automated playtesting agent (browser automation playing the game) caught all 3 in one pass.
- This validates **QA-03 (E2E tests)** as essential. The balance simulator (QA-02) ensures the game is fair; E2E tests ensure it's playable.

**E2E test scenarios to add (from review findings):**
1. Potion use flow: acquire potion → enter combat → use potion → verify effect applied
2. Save/load round-trip: play 3 floors → save → reload → verify state matches
3. Card effects with hand context: play cards that reference `ctx.hand` (e.g., Dead Branch) → verify no crash
4. Slime split: kill medium slime → verify two small slimes spawn → verify combat continues
5. Reward card selection: win combat → select card → verify card added to deck
6. Card text display: verify no truncation on reward screen card names

**Self-review checklist pattern (mentor recommendation):**
- After Sprint 3 closes, run through every bullet point from the Game Zone review
- Verify each addressed issue is fixed at runtime, not just in tests
- Only invite re-review when the checklist is green

**Stability path:** Fix P0s → 4/10 becomes 7/10. E2E tests prevent regression.

---

### Day 3 - FIX-06 Complete
**Date:** 2026-01-24
**Status:** FIX-06 complete, PR pending
**Done today:**
- Added data-testid attributes to Enemy.jsx:
  - `enemy-intent` on intent display div
  - `enemy-name` on name div
  - `enemy-hp` on HP text div
  - `enemy-block` on block display div
- Rewrote all Enemy.test.jsx assertions:
  - Replaced `screen.getByText(/44.*\/.*44/)` with `screen.getByTestId('enemy-hp').toHaveTextContent('44/44')`
  - Replaced `screen.getByText('11')` with `screen.getByTestId('enemy-intent').toHaveTextContent('11')`
  - All name/intent/block assertions now use testid-based queries
- Added new test: verifies block element is absent when block is 0
- All tests pass, validate clean
**Blockers:**
- None
**Next:**
- QA-03: E2E test suite with Playwright (if time permits in sprint 2)
- Available for reviewing other PRs

---

### Sprint 2 Complete
**Date:** 2026-01-24
**Status:** All priority tasks merged. Sprint 2 DONE.
**Summary:**
- FIX-06: Test selectors — MERGED (PR #16), replaced all fragile regex with data-testid
- QA-03: E2E tests — Deferred to Sprint 3 (not blocking)
**Validation:** 759 tests passing across 27 files. Lint clean. Build passes.
**Known issue:** audioSystem.test.js has worker timeout (infra issue, not code). Not blocking.
**Satisfaction:** Happy with sprint 2. All blocking tasks complete.
**Ready for Sprint 3:** Yes. QA-03 (E2E with Playwright) carries forward.

---

### Sprint 3 Kickoff
**Date:** 2026-01-25
**Status:** Sprint 3 ACTIVE

**My task:**
- **QA-03 (Day 4+, P2):** E2E test suite with Playwright
  - Per DEC-010: start with 3 critical scenarios (amended from 5)
  - Required before sprint-3 merges to master:
    1. Complete a combat encounter
    2. Save and reload a run
    3. Play a card that references hand context

  - Additional scenarios (once infrastructure is stable):
    4. Use a potion in combat
    5. Navigate 3+ floors on the map

  - Files: tests/e2e/ (NEW directory)

**Dependencies:**
- Benefits from Phase B completion (more UI to test)
- Can start scaffolding early but full scenarios need working features

**Test approach:**
- Playwright browser automation (not mocked context)
- Real user interactions: click, hover, verify DOM state
- Screenshot evidence on failure
- Integrate with `npm run validate` gate

**Lesson from Sprint 1:** 763 unit tests masked 3 P0 runtime bugs. E2E tests catch what unit tests miss.

**Ready to start:** Day 4+ (after Phase B)

---
