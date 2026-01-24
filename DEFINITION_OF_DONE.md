# Definition of Done - Spire Ascent

**Updated:** 2026-01-24 (Post-Sprint 1 Retrospective)
**Key Learning:** Tests passing != feature working.

## For All Tasks

Every task is considered "done" when ALL of the following are true:

### Code Quality
1. Code is committed to a named feature branch (see PROCESS.md for naming)
2. `npm run lint` produces 0 errors (no unused imports/variables)
3. `npm run test:run` passes all tests (count must be >= baseline)
4. `npm run build` succeeds without errors
5. No new file exceeds 500 lines
6. No TODO/FIXME/HACK comments without a task reference

### Testing
7. New functionality has corresponding tests
8. Tests are meaningful (not just "it doesn't crash")
9. Edge cases are covered (empty arrays, null values, boundary conditions)
10. Tests validate behavior against REAL interfaces (not mocked-away dependencies)

### Runtime Validation (NEW - Sprint 1 lesson)
11. Feature works in the running game (`npm run dev`, click through it)
12. Smoke test documented in PR (what did you actually try?)
13. No calls to functions/actions that don't exist in the target module
14. No references to context properties that aren't passed to the execution scope
15. Data formats match between producer and consumer (serialize/deserialize agreement)

### Functionality
16. Feature works correctly in a full game run (no crash from start to game-over)
17. No regressions in existing functionality
18. Plays correctly with all existing cards, relics, and enemies

### Integration
19. No merge conflicts with sprint-N branch
20. PR follows template (see .github/pull_request_template.md)
21. CI passes on the PR
22. All HIGH/MEDIUM Copilot findings addressed before merge
23. Compatible with other in-progress tasks (doesn't break shared interfaces)

---

## Task-Specific Criteria

### Architecture Tasks (BE-*)
- Existing public interfaces unchanged (useGame hook exports same shape)
- No performance regression (render counts, bundle size)
- Each module independently testable

### Content Tasks (SL-*, JR-*)
- All referenced IDs exist in their respective data files
- Effect keys are handled by corresponding screen components
- Data follows established schema patterns

### UI/UX Tasks (UX-*)
- Animations don't block gameplay input
- Speed multiplier respected (1x, 2x, instant)
- Graceful degradation when assets missing

### Art/Audio Tasks (GD-*, AR-*)
- Fallback behavior when assets don't exist (emoji, silence)
- Assets lazy-loaded (don't block initial render)
- File sizes reasonable (images < 500KB, audio < 1MB per file)

### Quality Tasks (QA-*)
- Tests run in < 30 seconds total
- No flaky tests (random failures)
- Coverage of critical paths (combat, card play, state transitions)

---

## Validation Script

Run the full validation with:
```bash
npm run validate
```

This runs: lint + tests + build in sequence. All three must pass.

Quick validation (tests only):
```bash
npm run validate:quick
```

---

## Red Flags (Task is NOT Done If...)

These patterns from Sprint 1 indicate a task is committed but not actually done:

| Red Flag | What It Means |
|----------|--------------|
| Component calls a function not exported by its hook | Integration gap - will throw at runtime |
| Tests mock the exact thing being tested | Tests prove nothing about real behavior |
| Save format doesn't match load format | Data corruption on round-trip |
| Effect references context property not passed | Silent failure or crash |
| PR has >500 lines changed | Too big to review - split it |
| No smoke test documented | Nobody actually ran it |
| Copilot HIGH findings unaddressed | Known bugs being merged |

---

## Sprint 1 Anti-Patterns (Don't Repeat)

1. **"Tests pass so it works"** - 763 tests passed while 3 features were broken at runtime
2. **One giant PR for everything** - 50 files, impossible to review or bisect
3. **Building against unbuilt APIs** - PotionSlots.jsx used usePotion before it existed
4. **Format assumptions** - saveSystem saved objects, loader expected IDs
5. **No manual verification** - Nobody ran the game and tried the features
