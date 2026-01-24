# QA Diary - Sprint 2

## Role
Tester - Component tests, balance simulator, E2E tests

## Owned Files
`src/test/`, test infrastructure

## Sprint 2 Tasks
- FIX-06: Test selectors (P0)
- QA-03: E2E tests (P2)

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
