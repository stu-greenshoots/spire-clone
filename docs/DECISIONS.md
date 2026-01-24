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

### DEC-009: User-gesture-gated audio initialization
**Proposed by:** AR | **Date:** 2026-01-24 | **Status:** Open

**Proposal:** Instead of initializing AudioContext on page load (which gets blocked by browser autoplay policy), defer AudioContext creation until the first user click/keypress. Use a one-time event listener on the document that creates and resumes the AudioContext, then removes itself. All audio calls before initialization get silently queued and play once the context is ready. This explains why audio is "wired up but silent" — the context never gets permission to play.

**Impact:** `src/systems/audioSystem.js` only. No public interface changes to useGame hook or other systems. AR owns this entirely.

**Reviews:**
- AR: approve - this is exactly what's wrong, I built the mute button assuming context would auto-resume but it doesn't
- BE: approve - self-contained fix, no interface changes, no objections
- PM: approve - explains a mystery from sprint 1 (AR-01 "works with fallback silence" — the fallback IS the bug)

**Resolution:** (to be filled by PM)

---

### DEC-010: E2E smoke test gate on sprint close
**Proposed by:** QA | **Date:** 2026-01-24 | **Status:** Open

**Proposal:** Before any sprint branch merges to master, at minimum 5 critical E2E scenarios must pass (in addition to unit tests and lint): (1) complete a combat encounter, (2) use a potion in combat, (3) save and reload a run, (4) play a card that references hand context, (5) navigate 3+ floors on the map. These E2E tests run as part of `npm run validate`. Sprint 1 proved unit tests alone are insufficient — the game can pass 763 tests and still be unplayable.

**Impact:** `package.json` scripts, CI pipeline, test infrastructure. Team members affected: QA (implementation), PM (process enforcement), all (CI gate enforcement).

**Reviews:**
- QA: approve - the magazine review proved this gap exists, 763 tests ≠ playable game
- PM: approve - aligns with DEC-003 (smoke tests). This is the automated version.
- BE: concern - Playwright adds CI time and a heavy dependency. Can we start with 3 scenarios instead of 5 and expand?
- AR: approve - save/load round-trip test would have caught FIX-02 before it shipped

**Resolution:** (to be filled by PM)

---

### DEC-011: Structured intent data format
**Proposed by:** JR | **Date:** 2026-01-24 | **Status:** Open

**Proposal:** Currently enemy intents are loosely typed (just a string like "Debuff"). Propose a structured format: `{ type: 'debuff', effect: 'weak', amount: 2, target: 'player' }` instead of just `{ type: 'debuff' }`. This enables the UI to display "Applying Weak 2" and makes intent data machine-readable for tooltips and AI analysis. Backwards-compatible: add fields alongside existing type strings, UI falls back to generic display if fields are missing.

**Impact:** `src/data/enemies.js` (all enemy intent definitions), combat UI (intent display component). Team members affected: JR (data entry), UX (display rendering), QA (test updates).

**Reviews:**
- JR: approve - straightforward data change, backwards-compatible
- UX: approve - gives me what I need to render specific intent text instead of generic labels
- BE: approve - structured data is always better than strings. Enables future AI/analysis tooling.
- QA: concern - need to update test assertions that match on intent strings. Manageable but flag it.

**Resolution:** (to be filled by PM)

---

### DEC-004: Shared damage calculation utility
**Proposed by:** BE | **Date:** 2026-01-24 | **Status:** Open

**Proposal:** Extract card damage calculation into a pure function `calculateEffectiveDamage(card, target, playerState, modifiers)` that both the combat system (for real execution) and the UI (for preview/tooltips) call. Magazine review revealed that damage previews don't reflect active Vulnerable/Weak modifiers on targets. This causes player confusion and wrong decisions. A shared utility ensures the preview always matches actual damage and eliminates calculation duplication.

**Impact:** `src/systems/combatSystem.js`, card component rendering, tooltip system. Changes public API for damage queries, so must be coordinated. Affects: BE (implementation), UX (tooltip system), potentially JR (card effects that deal damage).

**Reviews:**
- BE: approve - pure function, easy to test, eliminates the preview/execution divergence
- UX: approve - gives me reliable numbers for tooltip display without reimplementing combat math
- JR: approve - as long as my card effects still work through the same interface
- PM: approve - directly addresses magazine review feedback, prevents a class of UX bugs

**Resolution:** (to be filled by PM)

---

### DEC-005: Centralized effect processor pattern
**Proposed by:** BE | **Date:** 2026-01-24 | **Status:** Open

**Proposal:** ALL card effects (not just exhaust triggers) route through a centralized effect processor rather than inline reducer logic. FIX-03 fix identified that exhaust triggers were getting missed in alternative code paths because effect logic was duplicated across multiple places. Centralizing effect processing ensures consistency and prevents future bugs where edge cases skip critical side effects.

**Impact:** `src/context/reducers/combatReducer.js`, new `src/systems/effectProcessor.js` or expansion of existing pattern. Architectural change that touches reducer logic and effect system. Affects: BE (architecture/reducer), JR (card effect definitions), potentially all roles touching combat.

**Reviews:**
- BE: approve - FIX-03 proved this pattern works for exhaust triggers. Generalizing it prevents the same class of bug.
- JR: concern - how do I define new card effects? Need clear docs/examples for the processor pattern. Approve if documented.
- UX: approve - as long as animations can still hook into effect execution (need event hooks for floating numbers)
- PM: approve - architectural investment that prevents future P0s. Worth the refactor cost.

**Resolution:** (to be filled by PM)

---


### DEC-006: Portal-based tooltip architecture with data-driven content
**Proposed by:** UX | **Date:** 2026-01-24 | **Status:** Open

**Proposal:** All tooltips (cards, relics, potions, status effects) render through a single generic `Tooltip` component using React Portal to `document.body`. Content is defined in data files (cards.js, relics.js, potions.js, statusEffects.js) rather than hardcoded in components. This centralizes tooltip logic, enables consistent styling and behavior, and decouples content from presentation. Every data file gains a `tooltip` or `description` field; the Tooltip component is ~80-120 lines; all hover targets use a shared `useTooltip()` hook.

**Impact:**
- Files: `src/components/` (new Tooltip.jsx, modified components), `src/hooks/` (new useTooltip.js), `src/data/` (cards.js, relics.js, potions.js, statusEffects.js all gain tooltip fields)
- Team members: UX (implementation), JR/SL (data file content), BE (state access for dynamic tooltip values like current status effect stacks or card cost modifiers)
- Sprint 3 tasks affected: UX-06 (tooltips) depends on this decision

**Reviews:**
- UX: approve - addresses magazine review gap (no tooltips), mentor recommended portal approach, keeps components thin
- BE: approve - Portal to body is correct, avoids z-index fights. Dynamic values (e.g., current Vulnerable stacks) need access to game state via useGame.
- JR: approve - happy to add tooltip fields to enemies.js and potions.js. Clear format needed.
- SL: approve - can add flavor text for events/relics. Just need the field name spec.
- AR: approve - settings tooltip for audio/theme controls would use the same system

**Resolution:** (to be filled by PM)

---

### DEC-007: CSS custom properties for theme colors
**Proposed by:** GD | **Date:** 2026-01-24 | **Status:** Open

**Proposal:** Consolidate all background/surface colors currently hardcoded as hex values into CSS custom properties (variables) at `:root`. This enables a single brightness pass to darken/lighten the entire UI, and creates a foundation for future user-configurable theme settings. Instead of updating 50 files scattered across the codebase, one theme layer changes global colors.

**Impact:** All component CSS files, `src/App.css` (or new `src/theme.css`). Team members affected: GD (implementation), all component owners (any component with hardcoded background/surface colors), AR (settings UI can expose a theme brightness slider in future).

**Reviews:**
- GD: approve - makes my Sprint 3 brightness task trivial instead of a file-by-file hunt
- AR: approve - perfect foundation for settings brightness slider (AR-03)
- UX: approve - CSS variables also help with tooltip/overlay theming consistency
- BE: approve - no logic changes, purely presentational. Clean separation of concerns.
- PM: approve - addresses the #1 first-impression issue from the review with minimal risk

**Resolution:** (to be filled by PM)

---

### DEC-008: Sprite sheet bundling for card art
**Proposed by:** GD | **Date:** 2026-01-24 | **Status:** Open

**Proposal:** Replace individual card art imports (100+ separate network requests at ~50-90KB each) with build-time sprite sheet generation. Card art images are grouped by type/rarity into ~10-12 sprite sheets. A build script (extending `scripts/compress-images.js`) uses Sharp to compose individual card images into sprites and generates a JSON manifest mapping card ID → sheet file + CSS position. Card rendering components switch from `<img>` tags with lazy imports to CSS `background-image` + `background-position` targeting the sprite sheets. Result: 1-2 network requests for all card art instead of 100+.

**Impact:** `scripts/compress-images.js` (sprite composition logic), `src/utils/assetLoader.js` (manifest loading), card rendering components (CombatScreen, ShopScreen, etc.), Vite build pipeline. Team members affected: GD (pipeline and manifest generation), BE (card component integration), UX (card display rendering changes).

**Reviews:**
- GD: approve - Sharp already handles this, just compositing. Manifest approach is clean.
- BE: concern - CSS background-position means we lose `<img>` semantics (alt text, lazy loading attributes). Can we keep `<img>` with a clip approach instead? Approve with investigation.
- UX: approve - as long as card enlargement (hover preview) still works with the sprite approach
- PM: approve - 100+ requests is a real perf issue that will get worse as JR adds cards. Sprint 3 is the right time.

**Resolution:** (to be filled by PM)

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

## Rejected

(none)
