# Definition of Done - Spire Ascent

## For All Tasks

Every task is considered "done" when ALL of the following are true:

### Code Quality
1. Code is committed to a feature branch with descriptive commit message
2. `npm run lint` produces 0 errors
3. `npm run test:run` passes all tests (count must be >= baseline)
4. `npm run build` succeeds without errors
5. No file in the codebase exceeds 500 lines (new files)
6. No TODO/FIXME/HACK comments without a task reference

### Testing
7. New functionality has corresponding tests
8. Tests are meaningful (not just "it doesn't crash")
9. Edge cases are covered (empty arrays, null values, boundary conditions)

### Functionality
10. Feature works correctly in a full game run (no crash from start to game-over)
11. No regressions in existing functionality
12. Plays correctly with all existing cards, relics, and enemies

### Integration
13. No merge conflicts with master branch
14. Cross-validated by another team member's test suite
15. Compatible with other in-progress tasks (doesn't break shared interfaces)

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
