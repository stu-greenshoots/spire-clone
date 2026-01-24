# Definition of Done - Spire Ascent

## For All Tasks

Every task is considered "done" when ALL of the following are true:

### Code Quality
1. Code is committed to a feature branch with descriptive commit message
2. `npm run lint` produces 0 errors
3. `npm run test:run` passes all tests (count must be >= 289 baseline)
4. `npm run build` succeeds without errors
5. No newly created file exceeds 500 lines (existing files like GameContext.jsx are exempt until BE-01 completes)
6. No TODO/FIXME/HACK comments without a task reference (e.g. `// TODO(BE-01): migrate this`)

### Testing
7. New functionality has corresponding tests
8. Tests validate correct behavior, not just "it doesn't crash" (assert specific outputs)
9. Edge cases are covered (empty arrays, null values, boundary conditions)
10. Tests are not rewritten to pass - if tests fail, fix the code, not the assertions

### Functionality
11. Feature works correctly in a full game run (no crash from start to game-over)
12. No regressions in existing functionality
13. Plays correctly with all existing cards, relics, and enemies

### Integration
14. No merge conflicts with the current working branch
15. Cross-validated by another team member's test suite (see protocol below)
16. Compatible with other in-progress tasks (doesn't break shared interfaces)

---

## Task-Specific Criteria

### Architecture Tasks (BE-*)
- Existing public interfaces unchanged (useGame hook exports same shape)
- No performance regression (render counts, bundle size)
- Each module independently testable
- All 289+ existing tests pass without modification

### Content Tasks (SL-*, JR-*)
- All referenced IDs exist in their respective data files
- Effect keys are handled by corresponding screen components
- Data follows established schema patterns
- Only references currently working game mechanics (no forward-referencing unbuilt systems)

### UI/UX Tasks (UX-*)
- Animations don't block gameplay input
- Speed multiplier respected (1x, 2x, instant)
- Graceful degradation when assets missing (placeholder shapes, silent audio hooks)
- Visual changes are cosmetic layer only - don't break game logic

### Art/Audio Tasks (GD-*, AR-*)
- Fallback behavior when assets don't exist (emoji for art, silence for audio)
- Assets lazy-loaded (don't block initial render)
- File sizes reasonable (images < 500KB, audio < 1MB per file)
- System code is automatable; asset sourcing/curation is documented as manual steps

### Quality Tasks (QA-*)
- Tests run in < 30 seconds total
- No flaky tests (random failures)
- Coverage of critical paths (combat, card play, state transitions)
- Tests written against CURRENT interfaces (serve as regression suite for future refactors)

---

## Cross-Validation Protocol

After each major task completes, another team member validates:

| After... | Validated By | How |
|----------|-------------|-----|
| BE-01 (context split) | QA | Full test suite + manual play-through |
| SL-01 (events) | QA, AR | Verify all effect keys valid, play through each event |
| JR-01 (potions) | QA, BE | Potion-specific tests, verify state shape |
| UX-01 (feedback) | QA, AR | Visual check, play combat, confirm no logic regression |
| AR-01 (audio) | QA, UX | Unit tests on AudioManager, confirm hook points |
| GD-01 (pipeline) | QA, UX | Asset validation test, confirm emoji fallback works |

---

## Red Flags (Stop and Reassess)

- Tests are being rewritten to pass instead of fixing underlying code
- Same error recurring 3+ iterations without resolution
- File sizes growing without functional progress
- Modifications to files outside the task's stated scope
- Forward-referencing systems that don't exist yet

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
