# QA Diary - Sprint 3

## Role
Tester - Component tests, balance simulator, E2E tests

## Owned Files
`src/test/`, test infrastructure

## Sprint 3 Tasks
- QA-03: E2E tests with Playwright (Day 4+, P2) - carried from Sprint 2

---

## Entries

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
