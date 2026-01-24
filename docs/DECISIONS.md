# Decision Log

Decisions that affect the team get proposed, reviewed, and accepted or rejected here. No silent changes to shared interfaces, data formats, or process.

## How to Use

1. **Propose:** Add an entry under "Open Proposals" with your role, the decision, and why.
2. **Review:** Other team members add their position (approve/reject/concern) with reasoning.
3. **Resolve:** PM moves to "Accepted" or "Rejected" once there's consensus or a clear majority.

Decisions that skip this process and break things get reverted.

---

## Template

```
### DEC-XXX: Short title
**Proposed by:** ROLE | **Date:** YYYY-MM-DD | **Status:** Open/Accepted/Rejected

**Proposal:** What you want to do and why.

**Impact:** What files/systems/team members are affected.

**Reviews:**
- ROLE: approve/reject/concern - reasoning
- ROLE: approve/reject/concern - reasoning

**Resolution:** Accepted/Rejected - summary of outcome (filled by PM)
```

---

## Open Proposals

(none)


---

## Accepted

### DEC-001: Daily diaries instead of standups
**Proposed by:** PM | **Date:** 2026-01-24 | **Status:** Accepted

**Proposal:** Each team member updates `docs/diaries/{ROLE}.md` daily instead of synchronous standups. Stale diary = assumed stuck.

**Impact:** All team members. No meetings, but accountability through written record.

**Reviews:**
- PM: approve - async-first fits our workflow, written record is searchable

**Resolution:** Accepted - diaries created, referenced in CLAUDE.md and SPRINT_2_PLAN.md.

---

### DEC-002: Fix before feature (P0 gate)
**Proposed by:** PM | **Date:** 2026-01-24 | **Status:** Accepted

**Proposal:** No Phase B or C work starts until all three P0 bugs (FIX-01, FIX-02, FIX-03) are merged to sprint-2. Sprint 1 proved that shipping broken features wastes everyone's time.

**Impact:** All team members. UX, GD, SL, QA wait for P0 owners to finish before starting their tasks.

**Reviews:**
- PM: approve - sprint 1 lesson learned the hard way

**Resolution:** Accepted - encoded in SPRINT_2_PLAN.md Phase ordering.

---

### DEC-003: Smoke test evidence required in every PR
**Proposed by:** PM | **Date:** 2026-01-24 | **Status:** Accepted

**Proposal:** Every PR must include a "Smoke Test" section proving the feature works in the running game. Screenshots, console output, or a recorded description. "Tests pass" is not sufficient.

**Impact:** All team members. PRs without smoke test evidence will be sent back.

**Reviews:**
- PM: approve - 763 tests passed in sprint 1 and 3 features were still broken

**Resolution:** Accepted - added to SPRINT_2_PLAN.md Definition of Done.

---

### DEC-012: ID-based save serialization (v3 format)
**Proposed by:** AR | **Date:** 2026-01-24 | **Status:** Accepted

**Proposal:** Save system stores entity IDs and minimal state rather than full objects. Cards serialize to `{id, instanceId, upgraded}`, relics to `{id, counter, state}`, potions to `{id}`. Deserialization reconstructs full objects from data definitions at load time. This prevents the format mismatch that caused FIX-02 (save stored full objects, load expected IDs).

**Impact:** `src/systems/saveSystem.js`, `src/context/reducers/metaReducer.js`. All save/load operations affected.

**Reviews:**
- AR: approve - fixes FIX-02, future-proof format
- BE: approve - aligns with BE-02 normalization. IDs as source of truth is correct.
- PM: approve - prevents the class of bug where data definitions change but saves hold stale copies

**Resolution:** Accepted - implemented in FIX-02 branch, 20 tests covering round-trips.

---

### DEC-013: Branch naming without sprint prefix
**Proposed by:** PM | **Date:** 2026-01-24 | **Status:** Accepted

**Proposal:** Use `fix-{N}-{description}` or `{task-id}-{description}` instead of `sprint-2/{task-id}-{description}`. Git refs treat `sprint-2` as a file (the branch) and `sprint-2/` as a directory, causing push conflicts. The CLAUDE.md convention of `sprint-N/task-id-desc` is not possible when `sprint-N` already exists as a branch.

**Impact:** All branch names going forward. CLAUDE.md convention documented but not enforceable.

**Reviews:**
- PM: approve - discovered the hard way when first push was rejected
- All: acknowledge - pragmatic fix for a git limitation

**Resolution:** Accepted - all Sprint 2 PRs use flat branch names.

---

### DEC-004: Shared damage calculation utility
**Proposed by:** BE | **Date:** 2026-01-24 | **Status:** Accepted

**Proposal:** Extract card damage calculation into a pure function `calculateEffectiveDamage(card, target, playerState, modifiers)` that both the combat system (for real execution) and the UI (for preview/tooltips) call.

**Impact:** `src/systems/combatSystem.js`, card component rendering, tooltip system.

**Reviews:**
- BE: approve - UX: approve - JR: approve - PM: approve

**Resolution:** Accepted (unanimous). Implement as Sprint 3 task BE-05. Pure function ensures preview always matches actual damage.

---

### DEC-005: Centralized effect processor pattern
**Proposed by:** BE | **Date:** 2026-01-24 | **Status:** Accepted

**Proposal:** ALL card effects route through a centralized effect processor rather than inline reducer logic.

**Impact:** `src/context/reducers/combatReducer.js`, `src/systems/effectProcessor.js`.

**Reviews:**
- BE: approve - JR: conditional approve (needs docs) - UX: approve - PM: approve

**Resolution:** Accepted with condition: BE must document the effect processor pattern with examples before JR implements new card effects against it. Sprint 3+ task.

---

### DEC-006: Portal-based tooltip architecture with data-driven content
**Proposed by:** UX | **Date:** 2026-01-24 | **Status:** Accepted

**Proposal:** All tooltips render through a single generic `Tooltip` component using React Portal to `document.body`. Content defined in data files.

**Impact:** `src/components/Tooltip.jsx`, `src/hooks/useTooltip.js`, data files gain tooltip fields.

**Reviews:**
- UX: approve - BE: approve - JR: approve - SL: approve - AR: approve

**Resolution:** Accepted (unanimous). Foundation for Sprint 3 UX-06. Data file owners add tooltip/description fields when implementing.

---

### DEC-007: CSS custom properties for theme colors
**Proposed by:** GD | **Date:** 2026-01-24 | **Status:** Accepted

**Proposal:** Consolidate hardcoded hex colors into CSS custom properties at `:root`.

**Impact:** All component CSS files, `src/App.css` or new `src/theme.css`.

**Reviews:**
- GD: approve - AR: approve - UX: approve - BE: approve - PM: approve

**Resolution:** Accepted (unanimous). Prerequisite for Sprint 3 GD-05 brightness pass. GD implements as first Sprint 3 task.

---

### DEC-008: Sprite sheet bundling for card art
**Proposed by:** GD | **Date:** 2026-01-24 | **Status:** Accepted

**Proposal:** Replace individual card art imports (100+ requests) with build-time sprite sheet generation.

**Impact:** `scripts/compress-images.js`, `src/utils/assetLoader.js`, card rendering components.

**Reviews:**
- GD: approve - BE: conditional approve (investigate `<img>` clip vs CSS background-position) - UX: approve - PM: approve

**Resolution:** Accepted with investigation: GD to prototype both approaches (CSS background-position vs `<img>` clip) and choose based on accessibility and hover-preview compatibility. Sprint 3 task GD-06.

---

### DEC-009: User-gesture-gated audio initialization
**Proposed by:** AR | **Date:** 2026-01-24 | **Status:** Accepted

**Proposal:** Defer AudioContext creation until first user gesture. Queue audio calls before initialization.

**Impact:** `src/systems/audioSystem.js` only.

**Reviews:**
- AR: approve - BE: approve - PM: approve

**Resolution:** Accepted (unanimous). Self-contained fix in AR's owned file. Sprint 3 task AR-04.

---

### DEC-010: E2E smoke test gate on sprint close
**Proposed by:** QA | **Date:** 2026-01-24 | **Status:** Accepted

**Proposal:** Minimum 5 E2E scenarios must pass before sprint merges to master.

**Impact:** `package.json` scripts, CI pipeline, test infrastructure.

**Reviews:**
- QA: approve - PM: approve - AR: approve - BE: conditional (start with 3)

**Resolution:** Accepted with BE's amendment: start with 3 critical scenarios (combat, save/load, card effects), expand to 5 once Playwright infrastructure is stable. Sprint 2 task QA-03.

---

### DEC-011: Structured intent data format
**Proposed by:** JR | **Date:** 2026-01-24 | **Status:** Accepted

**Proposal:** Structured intent format: `{ type, effect, amount, target }` instead of just `{ type }`. Backwards-compatible.

**Impact:** `src/data/enemies.js`, combat UI intent display.

**Reviews:**
- JR: approve - UX: approve - BE: approve - QA: conditional (test updates needed)

**Resolution:** Accepted. QA to update test assertions that match intent strings when JR implements. Sprint 3 task JR-05.

---

## Rejected

(none)
