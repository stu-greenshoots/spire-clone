# Decision Log

Decisions that affect the team get proposed, reviewed, and accepted or rejected here. No silent changes to shared interfaces, data formats, or process.

## How to Use

1. **Propose:** Add an entry under "Open Proposals" with your role, the decision, and why.
2. **Review:** Other team members add their position (approve/reject/concern) with reasoning.
3. **Resolve:** PM moves to "Accepted" or "Rejected" once there's consensus or a clear majority.

Decisions that skip this process and break things get reverted.

## Decision Authority

| Decision Type | Who Decides | Process |
|---------------|-------------|---------|
| Within a single task | Engineer | Document in PR |
| Cross-file changes | Engineer + Owner | Coordinate first |
| Shared interface changes | Mentor | Proposal required |
| Architecture changes | Mentor | Proposal required |
| Process changes | PM + Mentor | Proposal required |
| Sprint scope changes | PM + Mentor | Document in sprint plan |
| Quality gate exceptions | Mentor only | Proposal required |
| Blocked/urgent decisions | Mentor | Can decide immediately, document after |

**Mentor Authority:** When decisions are blocked or urgent, invoke the Mentor (`mentor.md`). The Mentor can make immediate decisions and document afterward. This prevents analysis paralysis while maintaining accountability.

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

### DEC-014: Progression data storage format
**Proposed by:** BE | **Date:** 2026-01-25 | **Status:** Accepted

**Proposal:** Store progression data in localStorage under `spireAscent_progression` key as a versioned JSON structure. Use existing implementation in progressionSystem.js which includes additional fields: `highestAscension`, `totalGoldEarned`, `totalDamageDealt`, `runHistory`.

**Impact:** `src/systems/progressionSystem.js` (EXISTS), `src/context/reducers/metaReducer.js`.

**Reviews:**
- BE: approve - clean separation from run saves, versioned for future changes
- AR: approve - no conflict with existing save keys (`spireAscent_save`, `spireAscent_runHistory`)
- PM: approve - separate namespace is correct

**Resolution:** Accepted - Sprint 5 planning session 2026-01-25. AR confirmed no localStorage conflict. Use existing implementation in progressionSystem.js.

---

### DEC-015: Ascension modifier application timing
**Proposed by:** BE | **Date:** 2026-01-25 | **Status:** Accepted

**Proposal:** Apply ascension modifiers at combat initialization time (in `mapReducer.js SELECT_NODE`), not per-action. Enemy HP scaled once when enemies spawn, not recalculated each turn. This keeps combat logic simple and avoids mid-combat modifier drift.

**Impact:** `src/context/reducers/mapReducer.js`, `src/systems/ascensionSystem.js` (EXISTS).

**Reviews:**
- BE: approve - simpler implementation, matches StS behavior
- JR: approve - JR-03 enemies just need base stats; scaling is automatic
- PM: approve - prevents mid-combat bugs

**Resolution:** Accepted - Sprint 5 planning session 2026-01-25. BE documents in ascensionSystem.js that all modifiers apply at spawn time.

---

### DEC-016: Boss dialogue display method
**Proposed by:** SL | **Date:** 2026-01-25 | **Status:** Accepted

**Proposal:** Display boss dialogue as a semi-transparent overlay at the top of the combat screen (not a blocking modal). Dialogue appears for 2-3 seconds, then fades out. Player can dismiss early by clicking. Dialogue does NOT pause combat animations or block input.

**Impact:** `src/components/BossDialogue.jsx` (NEW), `src/components/CombatScreen.jsx`.

**Reviews:**
- SL: approve - non-blocking keeps the game feeling responsive
- UX: approve - no conflict with tooltip system (tooltips are bottom, dialogue is top)
- PM: approve - follows VictoryOverlay.jsx pattern

**Resolution:** Accepted - Sprint 5 planning session 2026-01-25. SL implements BossDialogue.jsx following VictoryOverlay pattern. Triggers: intro (combat start), mid-fight (50% HP), death (defeat).

---

### DEC-017: Act 2 enemy encounter weighting
**Proposed by:** JR | **Date:** 2026-01-25 | **Status:** Accepted (implementation deferred)

**Proposal:** Act 2 encounter pools use weighted selection:
- Normal encounters: 60% common (Centurion, Mystic, Byrd), 30% uncommon (Snecko, Chosen), 10% rare (Shelled Parasite, Reptomancer)
- Elite encounters: 50/50 split between Book of Stabbing and Gremlin Leader
- Boss: Automaton only (single Act 2 boss initially)

Weights stored in `src/data/encounters.js` for easy tuning.

**Impact:** `src/data/encounters.js` (NEW or extend `enemies.js`), `src/utils/mapGenerator.js`.

**Reviews:**
- JR: approve - allows balance tuning without code changes
- QA: approve - will update balance simulator when JR-03 lands
- PM: approve - schema approved, implementation deferred to Sprint 6 when JR-03 (Act 2 enemies) is built

**Resolution:** Accepted - Sprint 5 planning session 2026-01-25. Implementation deferred to Sprint 6. QA to update balance simulator spec when JR-03 task is created.

---

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
