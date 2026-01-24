# PR Review: Sprint 1 - UI overhaul, asset optimization, and system refactoring

**Reviewer:** Team Lead / Sprint Plan Author
**Verdict:** REQUEST CHANGES
**Date:** 2026-01-24

---

## Summary

This PR claims to complete 9 Sprint 1 tasks in a single commit. It touches 289 files with +13,228/-3,040 lines. The commit message says "UI overhaul, asset optimization, and system refactoring" — which is three separate concerns in one commit, violating basic git hygiene and making it impossible to revert any single change without losing everything.

**The biggest issue isn't code quality — it's process.** The sprint plan explicitly assigned tasks to different team members with different areas of ownership. This PR ships everything as one atomic blob authored by one person. That defeats the purpose of the plan entirely.

---

## BLOCKING Issues (Must Fix Before Merge)

### 1. Single Mega-Commit Violates Sprint Process

**Files:** All 289 of them

The sprint board assigns work to BE, SL, QA, UX, GD, AR, JR, and PM roles. Each was supposed to own their changes independently. Shipping everything in one commit:
- Makes it impossible to attribute work to the correct owner
- Makes it impossible to revert one broken feature without losing all features
- Bypasses the morning/afternoon validation gate described in the execution order
- Makes code review nearly impossible (289 files in one diff)

**Action:** Split this into at minimum one commit per sprint task (BE-01, SL-01, SL-02, QA-01, QA-02, UX-01, GD-01, AR-01, JR-01, PM-01). Ideally each should have been its own PR.

---

### 2. Scope Creep: Phase 2 and Phase 3 Items Shipped Without Authorization

The following files implement features explicitly scheduled for Phase 2 or Phase 3:

| File | Implements | Scheduled |
|------|-----------|-----------|
| `src/systems/ascensionSystem.js` | BE-04: Difficulty/ascension system | Phase 2 |
| `src/systems/progressionSystem.js` | BE-03: Meta-progression (unlocks, achievements) | Phase 2 |
| `src/systems/settingsSystem.js` + `src/components/Settings.jsx` | AR-03: Settings & accessibility | Phase 2 |
| `src/components/DeckViewer.jsx` | UX-03: Deck viewer & run stats | Phase 3 |
| `src/components/Tutorial.jsx` | UX-04: Tutorial/first run experience | Phase 3 |
| `src/components/ParticleEffects.jsx` | GD-05: Visual effects & particles | Phase 3 |

**None of these are on the Sprint 1 board.** They were added without team discussion, without tests, and without updating the sprint board to reflect the scope change.

**Action:** Remove all Phase 2/3 items from this PR. If you want to propose pulling them forward, that's a sprint planning conversation — not a surprise in a PR.

---

### 3. Circular Dependency in Reducer Architecture (BE-01)

**Files:** `src/context/reducers/metaReducer.js`, `src/context/GameContext.jsx`

```
metaReducer.js imports → createInitialState from GameContext.jsx
GameContext.jsx imports → metaReducer from metaReducer.js
```

This is a circular dependency. It works today because of JS module evaluation order, but it's fragile and will break if anyone refactors the import order. The `GAME_PHASE` constant has the same issue across all reducers.

**Action:** Extract `createInitialState` and `GAME_PHASE` into a shared `src/context/constants.js` file that has zero imports from GameContext or any reducer.

---

### 4. BE-01 Is a Copy-Paste, Not a Refactor

**Files:** `src/context/reducers/mapReducer.js` (340 lines), `src/context/reducers/combat/endTurnAction.js` (462 lines), `src/context/reducers/combat/playCardAction.js` (500 lines), `src/context/reducers/combat/enemyTurnAction.js` (451 lines)

The task description was "Split GameContext into **domain reducers**." What was delivered is a mechanical cut-and-paste of code blocks into separate files. The mapReducer alone is 340 lines with massive duplicated combat-initialization code (the `SELECT_NODE` handler repeats combat setup for `combat`, `elite`, AND `boss` node types — essentially the same 100-line block three times).

The total reducer code is now 500+462+451+340+177+84+22 = **2,036 lines** spread across 7 files. GameContext was 1,841 lines before. You've increased total code by ~200 lines and made it harder to navigate.

**Action:**
- Extract the duplicated combat-initialization logic into a `startCombat(state, enemies, options)` helper used by all three node types
- The `USE_POTION` case is still handled inline in GameContext.jsx — move it to a reducer for consistency
- Each reducer file should be <200 lines. If it's bigger, you haven't decomposed enough.

---

### 5. Card Art Deleted Without Explanation

**Files:** 23 card art files deleted (barricade.png, berserk.png, brutality.png, burn.png, clash.png, combust.png, corruption.png, etc.)

These cards had working art assets. They were deleted in this commit with no explanation in the commit message, no migration note, and no replacement assets. Players will now see fallback ASCII art for these cards.

**Action:** Either restore the deleted art, provide replacement WebP assets, or add a clear migration note explaining why these were intentionally removed and when replacements are coming.

---

### 6. `openai` Added as Dev Dependency

**File:** `package.json`

```json
"openai": "^6.16.0"
```

This was added as a dev dependency. The `generate-images.js` script uses it. This is a 5MB+ package that requires an API key to function. It should NOT be in the main package.json:
- It makes `npm install` slower for every developer
- It requires an API key that isn't in the repo (and shouldn't be)
- It's a tooling concern, not a project dependency

**Action:** Move image generation to a separate tool directory with its own package.json, or document clearly that this is optional and the script gracefully handles missing API keys.

---

## HIGH Priority Issues

### 7. `shuffleArray` Imported from `mapGenerator` in Combat Reducers

**Files:** `src/context/reducers/combatReducer.js:5`, `src/context/reducers/mapReducer.js:3`

A general-purpose shuffle utility is imported from `utils/mapGenerator.js`. This is a coupling smell — combat code should not depend on map code.

**Action:** Move `shuffleArray` to `src/utils/array.js` or similar generic utility module.

---

### 8. PotionSlots.jsx `handleDiscard` Is Broken

**File:** `src/components/PotionSlots.jsx:43-46`

```javascript
const handleDiscard = (slotIndex) => {
  // Just remove the potion by using the remove action
  usePotion(slotIndex); // This will fail canUsePotion check but we need a DISCARD action
  setSelectedSlot(null);
};
```

The comment literally says "This will fail canUsePotion check." This is dead code that does nothing. The discard feature doesn't work.

**Action:** Add a `DISCARD_POTION` action type to the reducer that removes the potion without requiring `canUsePotion` to pass. This is JR-01 scope and should have been caught before marking it done.

---

### 9. Balance Simulator Uses Hardcoded Random Instead of Seeded RNG Throughout

**File:** `src/test/balance/simulator.js`

The simulator correctly implements a seeded RNG (`createRng`) but the actual game systems it imports (`getEncounter`, combat system) all use `Math.random()`. This means the simulator's "deterministic" seeds only control card draw order, not enemy spawns or damage rolls. Test results will still be flaky.

**Action:** Document this limitation clearly in the test file, or better: refactor game systems to accept an optional RNG parameter for testability.

---

### 10. Events Have No Integration with GameContext

**File:** `src/data/events.js`

20 events were created with effect schemas like `{ loseGold: 75, heal: 30 }`, `{ upgradeRandomCard: true }`, `{ removeCard: true }`. But there is no event reducer or handler that processes these effects. The events are data-only with no game integration.

The `SKIP_EVENT` action exists in metaReducer but there's no `APPLY_EVENT_CHOICE` action. Players can't actually use these events in gameplay.

**Action:** Add an `eventReducer.js` that handles `APPLY_EVENT_CHOICE` with the effect schema. Otherwise SL-01 isn't actually "done" — it's just a JSON file.

---

### 11. MapScreen.jsx Grew to 474 Lines of Inline Styles

**File:** `src/components/MapScreen.jsx`

This component is 474 lines, almost entirely inline style objects and SVG path data. The SVG node icons are hardcoded at the top of the file (50+ lines of path data). The component mixes layout logic, style computation, game state access, and rendering in one blob.

**Action:**
- Extract SVG icons to a `MapIcons.js` constants file
- Move inline styles to CSS classes in App.css (which already exists and has 1335 lines — might as well use it)
- Extract the path-drawing logic into a `MapPath` sub-component

---

### 12. App.css Is 1335 Lines With No Organization

**File:** `src/App.css`

707 new lines of CSS were added with no clear organization, no CSS custom properties for theming, and many duplicated values (colors, shadows, transitions). The file has no section headers or comments explaining which component each block belongs to.

**Action:** At minimum, add section comments grouping styles by component. Ideally, use CSS custom properties for the color palette and recurring values.

---

## MEDIUM Priority Issues

### 13. Audio System Has No Actual Audio Files

**File:** `src/systems/audioSystem.js`

490 lines of audio management code (volume control, fade, categories, phase-based music) but the `_getAudio` method just tries to load `/sounds/{id}.mp3` — and there are no `.mp3` files in the repository. This is 490 lines of code that currently does nothing audible.

The sprint board action item says "AR-01: Audio system expansion." The pre-sprint checklist says "Identify the 10 highest-priority sounds and find CC0 sources" — this was NOT checked off in BRAINSTORM_OUTCOME.md.

**Action:** Either add placeholder audio files or clearly mark this system as "infrastructure only, no assets yet" in the code and sprint board.

---

### 14. `ascensionSystem.js` Modifiers Are Never Applied

**File:** `src/systems/ascensionSystem.js`

The file exports `applyAscensionToEnemy`, `getAscensionStartGold`, `getAscensionHealPercent`, `getAscensionCardRewardCount` — but none of these are called anywhere in the codebase. The mapReducer still hardcodes `getEncounter(state.act, floor, 0.1, ...)` and the metaReducer hardcodes `Math.floor(state.player.maxHp * 0.3)` for rest healing.

**Action:** Either integrate the ascension system or remove it from this PR (it's Phase 2 anyway).

---

### 15. `progressionSystem.js` Silently Swallows Errors

**File:** `src/systems/progressionSystem.js:62-63`, `src/systems/progressionSystem.js:68-69`

```javascript
} catch (e) { /* ignore */ }
```

Both `loadProgression` and `saveProgression` silently eat errors. If localStorage is full, corrupted, or throws a SecurityError, players lose their progression data with no feedback.

**Action:** At minimum, log a warning. Ideally, return a `{ success: false, error }` result so the caller can handle it.

---

### 16. Test Utils Mock Module Has Ordering Issues

**File:** `src/test/components/testUtils.jsx:9-15`

```javascript
vi.mock('../../context/GameContext', async () => {
  const actual = await vi.importActual('../../context/GameContext');
  return {
    ...actual,
    useGame: () => mockContextValue,
  };
});
```

`mockContextValue` is defined as an empty object `{}` at line 7, and individual tests need to mutate it before rendering. This creates implicit test coupling — if one test forgets to set up the mock, it inherits whatever the previous test left behind. The mock is module-scoped, not per-test.

**Action:** Export a `setupMockGame(overrides)` function that returns a fresh mock for each test, and call it in `beforeEach`.

---

### 17. Tooltip Component Re-renders Entire Card on Hover

**File:** `src/components/Card.jsx:5-14`

The `Tooltip` component uses `useState` for show/hide, which means every hover triggers a re-render of the parent Card (since Tooltip is rendered inside Card's render tree). With 10 cards in hand, this creates unnecessary re-render cascades.

**Action:** Either:
- Use CSS-only tooltips (`:hover` + `::after` pseudo-element)
- Or extract Tooltip to use a portal so its state changes don't bubble

---

### 18. `ParticleEffects.jsx` Creates DOM Elements With `setTimeout`

**File:** `src/components/ParticleEffects.jsx:23-26`

```javascript
useEffect(() => {
  const timer = setTimeout(() => setOpacity(0), 50);
  return () => clearTimeout(timer);
}, []);
```

Each particle is its own React component with its own state and its own setTimeout. Rendering 12 particles means 12 components, 12 state updates, 12 re-renders. For a visual effect system, this will cause frame drops.

**Action:** Use a single canvas element or CSS animations with `@keyframes` instead of per-particle React state. This is a Phase 3 item anyway — remove from this PR.

---

### 19. Keywords Regex Rebuilds on Every Render

**File:** `src/data/keywords.js:24-28`, used in `src/components/Card.jsx:120-123`

```javascript
const pattern = new RegExp(`(${keywordNames.map(n =>
  n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
```

This regex is rebuilt every time `renderDescriptionWithKeywords` is called (every card render). With 19 keywords and 10 cards in hand, that's 10 regex compilations per render cycle.

**Action:** Memoize the pattern at module level since KEYWORDS is static.

---

### 20. Enemy Image Loading Triggers Waterfall Requests

**File:** `src/components/Enemy.jsx:128-133`

```javascript
useEffect(() => {
  if (!hasImage(enemy.id)) {
    preloadEnemyImage(enemy.id)
      .then(() => setImageReady(true))
      .catch(() => setImageReady(false));
  }
}, [enemy.id]);
```

Each enemy component independently fires a preload request. In a 3-enemy encounter, this creates 3 sequential-ish image loads that each trigger a re-render when complete. Combined with the fact that `preloadImage` uses polling (`setTimeout(check, 50)`) for duplicate requests, this is inefficient.

**Action:** Preload all encounter enemy images at combat start (in the reducer or a dedicated hook), not per-component.

---

## LOW Priority / Nits

### 21. `.claude/settings.local.json` Contains a Hardcoded Commit Message

**File:** `.claude/settings.local.json:12`

A full git commit command with message is saved as an allowed bash pattern. This is development tooling debris that shouldn't be in the PR.

**Action:** Remove the specific commit message entry, keep only the generic patterns.

---

### 22. Sprint Board Claims "Done" for Incomplete Items

**File:** `SPRINT_BOARD.md`

UX-01 is marked "Done" but the combat feedback code has no tests. QA-01 claims "30+ tests" but the actual component tests are relatively shallow (they test rendering, not interactions). The Definition of Done wasn't applied consistently.

**Action:** Be honest about completion status. "Code written" != "Done" per the Definition of Done document.

---

### 23. `IMPROVEMENT_PLAN.md` Claims 763 Tests Passing

**File:** `IMPROVEMENT_PLAN.md:13`

This number should be verified. If the balance simulator's 493 test cases are included, many of those are likely parameterized variants of the same assertion.

**Action:** Run `npm test` and report the actual count. Don't inflate numbers.

---

### 24. `public/images/enemies/.gitkeep` Is Pointless

**File:** `public/images/enemies/.gitkeep`

The directory is empty and the `assetLoader.js` references `/images/enemies/{id}.png` — but the actual enemy images are in `src/assets/art/enemies/` as WebP files. This `.gitkeep` serves no purpose and the paths don't match.

**Action:** Either put actual images in `public/images/enemies/` or remove the directory and fix the assetLoader paths.

---

### 25. `generate-images.js` Grew by 600+ Lines Without Tests

**File:** `scripts/generate-images.js`

906 lines of image generation logic with OpenAI API calls, prompt engineering, and file I/O. Zero tests. This script touches production assets (writes to `src/assets/art/`).

**Action:** Add at minimum a dry-run mode test that validates the prompt generation logic without making API calls.

---

## Copilot Review Notes

Copilot is also reviewing this PR. Areas where I expect Copilot to flag similar issues:
- The inline styles vs CSS inconsistency
- The dead code in PotionSlots
- Potential unused imports after the art-prompts removal
- The circular dependency pattern

Where my review differs from what Copilot will likely catch: I'm focused on **process violations** (scope creep, sprint plan adherence, single-commit-for-everything), **architectural debt** (copy-paste refactor, circular deps), and **feature completeness** (events without a reducer, audio without files, ascension without integration). These are judgment calls that require understanding the team plan, not just static analysis.

---

## Recommendation

**Do not merge as-is.** The work here represents genuine effort and the content (events, flavor text, potions, keywords) is high quality. But the delivery mechanism is broken:

1. Split into per-task commits with proper attribution
2. Remove Phase 2/3 items
3. Fix the circular dependency
4. Wire up the events system so it actually functions
5. Fix the broken potion discard
6. Address the deleted card art

Once these blocking issues are resolved, the remaining items can be addressed in follow-up PRs per the sprint process.
