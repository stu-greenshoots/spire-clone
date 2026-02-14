# Sprint 17: Quality Reality

**Created:** 2026-02-07
**Branch:** `sprint-17`
**Theme:** Make the game actually work, verifiably, before shipping anything else.
**Ship Date:** Pushed back indefinitely. Quality is the only priority.

---

## Why This Sprint Exists

We have 3264 tests, a self-assessed 100/100 score, and 10 consecutive "100% sprints." But when you actually play the game:

- Agents cannot properly play or verify the game works
- There are no keyboard controls — testing requires mouse interaction
- The Data Editor exists but custom edits silently override card data with no warning
- Enemy sprites range from good to barely-visible placeholders
- The self-assessment score is not credible against actual play experience
- There is no automated way to verify a full playthrough works end-to-end

**The core problem:** Tests validate isolated units against mocks. Nothing validates the integrated game experience. We need to close this gap before adding any more features.

---

## Principles

1. **Play the game.** Every change must be verified by actually playing, not just running tests.
2. **Agent-verifiable.** If an agent can't verify it works, it doesn't count as done.
3. **Honest assessment.** No more inflated scores. Report what's broken, not what passes.
4. **Fix before feature.** Zero new features until existing ones work correctly.
5. **Keyboard-first testing.** Agents interact via keyboard. Make that possible.

---

## Work Streams (Parallel Execution)

Sprint 17 is organized into 4 parallel work streams. Streams A and B can run simultaneously from day 1. Stream C depends on Stream B findings. Stream D can overlap with Stream C.

```
Timeline:
  Stream A (Testability)     ████████░░░░░░░░  (Phase 1)
  Stream B (Honest QA)       ░░░░████████░░░░  (Phase 1-2)
  Stream C (Bug Fixing)      ░░░░░░░░████████  (Phase 2-3)
  Stream D (Architecture)    ░░░░░░░░░░██████  (Phase 3)
```

---

## Stream A: Testability Infrastructure

**Goal:** Make the game playable and verifiable by agents via keyboard and automated tools.
**Owners:** BE (infrastructure), UX (keyboard UI), QA (test harness)
**Depends on:** Nothing — starts immediately
**Conflict zones:** `CombatScreen.jsx`, `GameContext.jsx`, `DevTools.jsx`

### QR-01: Keyboard Combat Controls (UX)
**Size:** M | **Priority:** P0
**Files:** `src/components/CombatScreen.jsx`, `src/hooks/useKeyboardControls.js` (new)

Add keyboard shortcuts for all combat actions:
- **1-9** keys: Select card by hand position (1 = leftmost)
- **Tab / Shift+Tab**: Cycle target between enemies
- **Enter / Space**: Confirm card play on selected target
- **E**: End turn
- **Escape**: Deselect card / cancel targeting
- **Q**: Use first available potion
- **D**: Open deck viewer
- **I**: Toggle enemy info/intent display

Acceptance criteria:
- [ ] Full combat playable without mouse
- [ ] Visual indicator shows which card is keyboard-selected
- [ ] Visual indicator shows which enemy is keyboard-targeted
- [ ] Key bindings shown in a help overlay (press `?` to toggle)
- [ ] All shortcuts documented in `GAME_REFERENCE.md`
- [ ] Works alongside existing mouse/touch controls (no regressions)

### QR-02: Enhanced DevTools API (BE)
**Size:** M | **Priority:** P0
**Files:** `src/components/DevTools.jsx`, `src/data/scenarios.js`

Expand `window.__SPIRE__` with automation-friendly methods:
```javascript
__SPIRE__.playCard(handIndex, targetIndex?)  // Play card by index
__SPIRE__.endTurn()                          // End current turn
__SPIRE__.getVisibleState()                  // Machine-readable state snapshot
__SPIRE__.autoPlayTurn()                     // Play all affordable cards, then end turn
__SPIRE__.autoFight()                        // Auto-play until combat ends
__SPIRE__.skipToPhase(phase)                 // Jump to any game phase
__SPIRE__.setFloor(floor)                    // Jump to specific floor
__SPIRE__.giveCard(cardId)                   // Add card to deck
__SPIRE__.giveRelic(relicId)                 // Add relic
__SPIRE__.givePotion(potionId)              // Add potion
__SPIRE__.giveGold(amount)                   // Add gold
__SPIRE__.setHp(current, max?)               // Set player HP
__SPIRE__.fullPlaythrough(options?)          // Automated full run (returns result)
```

`getVisibleState()` returns:
```javascript
{
  phase, floor, act, turn,
  player: { hp, maxHp, energy, maxEnergy, gold, block, statusEffects },
  hand: [{ name, cost, type, playable, damage?, block? }],
  enemies: [{ name, hp, maxHp, block, intent, statusEffects }],
  drawPile: count, discardPile: count, exhaustPile: count,
  relics: [{ name, id }],
  potions: [{ name, id } | null]
}
```

Acceptance criteria:
- [ ] All methods work from browser console
- [ ] `autoFight()` can win a basic combat encounter
- [ ] `fullPlaythrough()` can complete Act 1 with basic strategy
- [ ] `getVisibleState()` returns complete, parseable game state
- [ ] Methods work in both dev and production builds (except scenario loading)

### QR-03: Expanded Scenario Library (QA)
**Size:** S | **Priority:** P1
**Files:** `src/data/scenarios.js`

Add scenarios covering every game phase and character:
- All 4 characters in combat (starter deck)
- All 4 characters at Act 1 boss
- Act 2 combat (with Act 2 enemies)
- Act 3 combat (with Act 3 enemies)
- Heart boss fight
- Every non-combat phase: shop, rest site, event, reward, map
- Edge cases: 0 energy, full hand, no cards playable, all enemies dead
- Status effect heavy: poison, vulnerable, weak, strength, artifact
- Multi-target scenarios: 3+ enemies
- Orb scenarios (Defect): with channeled orbs
- Stance scenarios (Watcher): in Wrath, Calm, Divinity

Acceptance criteria:
- [ ] 30+ scenarios total (currently ~15)
- [ ] Every character has at least 3 scenarios
- [ ] Every game phase has at least 1 scenario
- [ ] Scenarios load correctly via `__SPIRE__.loadScenario()`
- [ ] State Builder UI (main menu) shows all scenarios organized by category

### QR-04: Dev State Overlay (BE/UX)
**Size:** S | **Priority:** P2
**Files:** `src/components/DevOverlay.jsx` (new), `src/components/App.jsx`

Add a toggleable dev overlay (press backtick `` ` `` to toggle) showing:
- Current game phase, floor, act, turn number
- Player: HP, energy, block, all status effects with values
- Each enemy: HP, block, intent (type + value), all status effects
- Hand: card names with costs, which are playable
- Draw pile count, discard count, exhaust count
- FPS counter
- Last action dispatched

Acceptance criteria:
- [ ] Overlay visible in dev mode only
- [ ] Does not interfere with game interaction (click-through)
- [ ] Updates in real-time as state changes
- [ ] Machine-parseable (data-testid attributes on all values)

---

## Stream B: Honest QA Audit

**Goal:** Find every bug, broken asset, and incorrect behavior. Document everything.
**Owners:** QA (test writing), GD (asset audit), AR (audio audit)
**Depends on:** QR-02 (Enhanced DevTools) for automated testing
**Can start manually before QR-02 is done**

### QR-05: Full Playthrough E2E Test (QA)
**Size:** L | **Priority:** P0
**Files:** `tests/e2e/specs/full-playthrough.spec.js` (new), `tests/e2e/helpers/`

Write a Playwright E2E test that:
1. Starts from main menu
2. Selects each character (run 4 times)
3. Plays through at least 5 combat encounters per run
4. Uses keyboard controls (QR-01) to play cards
5. Collects rewards, navigates map
6. Takes screenshots at every phase transition
7. Logs full game state at every step
8. Reports any JavaScript errors, React errors, or unexpected states

This is NOT a "does it crash" test — it's a "does it play correctly" test:
- Verify energy decreases when cards are played
- Verify enemies take damage equal to card damage
- Verify block reduces damage taken
- Verify status effects apply correctly
- Verify card draw/discard counts are consistent
- Verify gold increases after combat

Acceptance criteria:
- [ ] Test runs against dev server via Playwright
- [ ] Passes for all 4 characters through 5+ floors
- [ ] Screenshots saved for visual review
- [ ] State log saved as JSON for analysis
- [ ] Any failures produce clear, actionable error messages
- [ ] Test can be run via `npm run test:e2e:playthrough`

### QR-06: Visual Asset Audit (GD)
**Size:** M | **Priority:** P0
**Files:** `docs/ASSET_AUDIT.md` (new)

Systematically catalog every visual asset in the game:

For every enemy (all 40+):
- [ ] Sprite exists at expected path
- [ ] Sprite is visible (not a tiny blob or solid color)
- [ ] Sprite matches enemy theme/name
- [ ] Sprite is correct size (not scaled weirdly)

For every card (all 157+):
- [ ] Card art exists at expected path
- [ ] Card art is visible and meaningful (not a gradient blob)
- [ ] Card border matches rarity (common/uncommon/rare)

For all UI elements:
- [ ] Relic icons exist (no emoji fallbacks)
- [ ] Potion icons exist (no emoji fallbacks)
- [ ] Intent icons show correct type (attack/defend/buff/debuff)
- [ ] Status effect icons are visible and distinguishable

Output: `docs/ASSET_AUDIT.md` with:
- Complete inventory (path, exists, quality rating 1-5)
- List of broken/missing/placeholder assets
- Priority list for replacement

Acceptance criteria:
- [ ] Every visual asset cataloged
- [ ] Broken assets identified with specific file paths
- [ ] Priority replacement list created

### QR-07: Card Mechanics Verification (QA/JR)
**Size:** L | **Priority:** P0
**Files:** `src/test/cardMechanicsVerification.test.js` (new)

For every card in the game (all 157+), verify:
1. Cost matches definition
2. Damage/block values match description text
3. Status effects apply with correct values
4. Upgraded version has correct improvements
5. Card type (attack/skill/power) is correct
6. Target type works correctly (single/all/self)
7. Special effects trigger (exhaust, ethereal, innate, retain)

Use the actual game reducer, not mocks:
```javascript
// Load real combat state, play card, verify outcome
const state = loadScenario('combat-basic');
const result = playCard(state, cardIndex, targetIndex);
expect(result.enemies[0].currentHp).toBe(expectedHp);
```

Acceptance criteria:
- [ ] Every card has at least 1 verification test
- [ ] Tests use real reducers, not mocks
- [ ] Failed tests produce clear report of what's wrong
- [ ] Run via `npm run test:mechanics`

### QR-08: Audio Audit (AR)
**Size:** S | **Priority:** P1
**Files:** `docs/AUDIO_AUDIT.md` (new)

Verify every audio file:
- [ ] File exists at expected path
- [ ] File is audible (not silent)
- [ ] File is distinct (not a copy of another file)
- [ ] File triggers at correct game event
- [ ] Volume is reasonable relative to other sounds
- [ ] Music transitions work between phases

Output: `docs/AUDIO_AUDIT.md` with inventory and issues.

Acceptance criteria:
- [ ] Every audio file cataloged
- [ ] Silent/broken/duplicate files identified
- [ ] Trigger points verified

### QR-09: Enemy Behavior Verification (QA/JR)
**Size:** M | **Priority:** P1
**Files:** `src/test/enemyBehaviorVerification.test.js` (new)

For every enemy (all 40+), verify:
1. HP matches definition
2. Damage values match intent display
3. AI pattern cycles correctly
4. Special abilities work (split, enrage, artifact, etc.)
5. Status effects applied by enemy work correctly
6. Enemy death triggers are correct

Acceptance criteria:
- [ ] Every enemy has at least 1 behavior test
- [ ] Tests use real combat reducer
- [ ] Boss phase transitions verified
- [ ] Multi-enemy encounters verified (ally pairs, minion spawning)

---

## Stream C: Bug Fixing

**Goal:** Fix every bug found in Stream B.
**Owners:** Assigned based on bug domain (BE for state, UX for display, JR for content, GD for art)
**Depends on:** Stream B findings
**Tasks created dynamically as bugs are found**

### QR-10: Bug Fix Sprint (ALL)
**Size:** Variable | **Priority:** P0

This is a placeholder for bugs discovered in Stream B. Each bug becomes a sub-task:
- **P0 (game-breaking):** Fix immediately, block nothing
- **P1 (incorrect behavior):** Fix in this sprint
- **P2 (visual/polish):** Fix if time permits, otherwise Sprint 18

Bug tracking format:
```
BUG-XX: [Short description]
Severity: P0/P1/P2
Found by: QR-XX task
Steps to reproduce: ...
Expected: ...
Actual: ...
Fix owner: ROLE
```

### QR-11: Placeholder Asset Replacement (GD)
**Size:** L | **Priority:** P1
**Files:** `public/images/`

Based on QR-06 findings, replace the worst placeholder assets:
- Priority: enemy sprites that are blobs/invisible
- Priority: card art that is just gradients
- Priority: missing intent/status icons

Acceptance criteria:
- [ ] Top 10 worst assets replaced
- [ ] All replaced assets verified at runtime
- [ ] Sprite sheets rebuilt after replacements

### QR-12: Data Editor Safety (BE)
**Size:** S | **Priority:** P1
**Files:** `src/components/DataEditor.jsx`, `src/data/cards.js`

Prevent the Data Editor from silently corrupting gameplay:
- Show a persistent warning banner when custom data overrides are active
- Add a "Reset All Custom Data" button on the main menu (visible when overrides exist)
- Log which cards/enemies/relics are overridden on game start
- Validate custom data against card schema (reject invalid cost, negative damage, etc.)

Acceptance criteria:
- [ ] Warning visible when custom overrides active
- [ ] One-click reset from main menu
- [ ] Invalid overrides rejected with error message
- [ ] Console log shows active overrides on game load

---

## Stream D: Architecture Hardening

**Goal:** Make the game resilient and monitorable.
**Owners:** BE (core), QA (validation)
**Depends on:** Can start after Stream A
**Conflict zones:** `GameContext.jsx`

### QR-13: Runtime State Validation (BE)
**Size:** M | **Priority:** P1
**Files:** `src/systems/stateValidator.js` (new), `src/context/GameContext.jsx`

Add runtime validation that catches impossible states:
- Player HP > maxHp
- Negative energy
- Card in hand with undefined cost
- Enemy with negative HP still alive
- Duplicate instanceIds
- Invalid game phase transitions
- Status effect with NaN value

In dev mode: throw errors with actionable messages
In production: log warnings, auto-correct where safe

Acceptance criteria:
- [ ] Validation runs after every state update (dev mode)
- [ ] Validation runs on critical transitions only (production)
- [ ] Impossible states produce clear error messages
- [ ] No false positives on normal gameplay

### QR-14: Performance Monitoring (BE/UX)
**Size:** S | **Priority:** P2
**Files:** `src/systems/performanceMonitor.js` (new)

Add dev-mode performance instrumentation:
- FPS counter (rolling average)
- Reducer execution time per action type
- React render count per component (via Profiler API)
- State size monitoring
- Memory usage tracking

Surface via QR-04 dev overlay.

Acceptance criteria:
- [ ] FPS visible in dev overlay
- [ ] Slow reducers (>16ms) logged with warning
- [ ] No performance impact in production build

### QR-15: Error Boundary Enhancement (BE)
**Size:** S | **Priority:** P2
**Files:** `src/components/ErrorBoundary.jsx`

Improve error recovery:
- Show useful error message with game state summary
- "Return to Main Menu" button that resets state
- "Report Bug" button that copies state + error to clipboard
- Log error + state to console for agent analysis
- Prevent cascading failures from crashing entire app

Acceptance criteria:
- [ ] Errors caught and displayed gracefully
- [ ] Game recoverable without page refresh
- [ ] Error state includes enough info to reproduce

---

## Task Summary

| Task | Stream | Owner | Size | Priority | Depends On |
|------|--------|-------|------|----------|------------|
| QR-01 | A | UX | M | P0 | - |
| QR-02 | A | BE | M | P0 | - |
| QR-03 | A | QA | S | P1 | - |
| QR-04 | A | BE/UX | S | P2 | - |
| QR-05 | B | QA | L | P0 | QR-01, QR-02 |
| QR-06 | B | GD | M | P0 | - |
| QR-07 | B | QA/JR | L | P0 | - |
| QR-08 | B | AR | S | P1 | - |
| QR-09 | B | QA/JR | M | P1 | - |
| QR-10 | C | ALL | Var | P0 | Stream B |
| QR-11 | C | GD | L | P1 | QR-06 |
| QR-12 | C | BE | S | P1 | - |
| QR-13 | D | BE | M | P1 | - |
| QR-14 | D | BE/UX | S | P2 | QR-04 |
| QR-15 | D | BE | S | P2 | - |

## Parallel Execution Plan

### Batch 1 (Start Immediately — No Dependencies)
Run these agents in parallel:
| Task | Agent | Files Touched |
|------|-------|---------------|
| QR-01 | UX | `CombatScreen.jsx`, new `useKeyboardControls.js` |
| QR-02 | BE | `DevTools.jsx`, `scenarios.js` |
| QR-03 | QA | `scenarios.js` (coordinate with BE on QR-02) |
| QR-06 | GD | `docs/ASSET_AUDIT.md` (read-only audit, no code changes) |
| QR-07 | JR | new `cardMechanicsVerification.test.js` |
| QR-08 | AR | `docs/AUDIO_AUDIT.md` (read-only audit, no code changes) |
| QR-12 | BE-2 | `DataEditor.jsx` (no conflict with QR-02) |
| QR-13 | BE-3 | new `stateValidator.js`, `GameContext.jsx` |

**Conflict resolution:**
- QR-02 and QR-03 both touch `scenarios.js` — QR-02 goes first, QR-03 builds on it
- QR-13 touches `GameContext.jsx` — no other Batch 1 task touches it
- All audit tasks (QR-06, QR-08) are read-only, no conflicts

### Batch 2 (After Batch 1 Completes)
| Task | Agent | Depends On |
|------|-------|------------|
| QR-05 | QA | QR-01 (keyboard), QR-02 (DevTools API) |
| QR-09 | JR/QA | QR-02 (DevTools API for state inspection) |
| QR-04 | UX | QR-14 (performance data to display) |
| QR-11 | GD | QR-06 (asset audit findings) |
| QR-15 | BE | No strict dependency, but after QR-13 |

### Batch 3 (After QR-05, QR-07, QR-09 Report Findings)
| Task | Agent | Depends On |
|------|-------|------------|
| QR-10 | ALL | Stream B findings — bugs triaged and assigned |
| QR-14 | BE | QR-04 overlay |

---

## Validation Gate

Sprint 17 is NOT complete until ALL of the following are verified by actually playing:

- [ ] Full combat playable via keyboard only (no mouse required)
- [ ] `__SPIRE__.fullPlaythrough()` completes Act 1 for all 4 characters
- [ ] E2E Playwright test passes for all 4 characters through 5+ floors
- [ ] Every card verified: cost, damage, effects match description
- [ ] Every enemy verified: HP, damage, AI pattern correct
- [ ] Asset audit complete — all placeholders documented
- [ ] Top 10 worst placeholder assets replaced
- [ ] Zero P0 bugs remaining from QR-10
- [ ] Data Editor overrides show visible warning
- [ ] Runtime state validation catches impossible states in dev mode
- [ ] `npm run validate` passes
- [ ] Honest self-assessment completed (no inflated scores)

---

## What We Are NOT Doing

- No new features
- No new characters, cards, enemies, or content
- No new game modes
- No UI redesigns
- No architecture rewrites
- No migration to JSON data
- No deployment or shipping

This sprint is about making what we have actually work, and proving it works.
