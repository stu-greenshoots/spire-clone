# JR Diary - Sprint 10

## Sprint 10 Entries

### FIX-07: Wire potion rewards into combat victory flow
**Date:** 2026-01-31
**Status:** MERGED (PR #107)

**Root cause:** Potion rewards were completely missing from the victory flow. `combatRewards` only contained `gold` and `cardRewards` — no `potionReward` field was ever set, and RewardScreen.jsx had no potion section.

**Fix:** Added potion reward generation to both victory paths (endTurnAction.js and playCardAction.js), 40% drop rate for normal/elite fights, 100% for bosses. Only offered when player has an empty potion slot. Added COLLECT_POTION reducer action and RewardScreen UI with potion art.

**Files changed:** endTurnAction.js, playCardAction.js, rewardReducer.js, GameContext.jsx, RewardScreen.jsx (5 files, +87/-4 lines)

---

## Sprint 9 Entries

### JR-07: Card balance fine-tuning
**Date:** 2026-01-31
**Status:** Complete, MERGED (PR #104)

**Done:**
- Balanced 3 card outliers identified as never-pick relative to alternatives:
  - **Pummel:** 2→3 damage per hit (8→12 total, 10→15 upgraded) — exhaust cost now justified
  - **Clash:** 14→18 base, 18→24 upgraded — reward matches harsh all-attacks condition
  - **True Grit:** 7→9 block base, 9→12 upgraded — random exhaust risk compensated
- Conservative number-only changes, no mechanic modifications
- All 1218 tests passing, lint clean, build clean

**Design decisions:**
- Kept changes minimal — only adjusted cards that were clearly outclassed by same-cost alternatives
- Pummel still exhausts (key balance lever), but 3 damage per hit makes strength scaling more relevant
- Clash buff is largest (14→18) because the condition is among the hardest to meet in the game
- True Grit upgraded version bumped to 12 (from 9) to create meaningful upgrade incentive

**Blockers:** None
**Next:** All JR Sprint 9 tasks complete

---

# JR Diary - Sprint 8

## Role
Junior Developer - Potion system, card upgrades, new content

## Sprint 8 Entries

### JR-06: Bronze Orbs + Stasis — Automaton companion mechanic
**Date:** 2026-01-31
**Status:** Complete, MERGED (PR #85)

**Done:**
- Added `bronzeOrb` type to `createSummonedEnemy` in enemySystem.js (52 HP, beam/supportBeam alternation)
- Modified `getBossEncounter` to spawn 2 Bronze Orbs alongside Automaton at fight start
- Implemented phase2Automaton onDeath handler in both playCardAction.js and endTurnAction.js:
  - Spawns 2 new Bronze Orbs that each capture a random card from hand via Stasis
  - Cards returned to discard pile when orb is killed
- Added `stasis: null` to `createEnemyInstance` for all enemies
- 10 new tests in bronzeOrbStasis.test.js covering orb lifecycle
- Updated encounterWeighting and integration tests for multi-enemy boss encounters
- 1147 tests passing, lint clean, build clean

**Design decisions:**
- Stasis capture happens on phase 2 spawn (not initial fight start) — initial orbs fight normally
- Stasis card returns to discard (not hand) to match StS behavior
- Phase 2 logic duplicated across playCardAction/endTurnAction following existing pattern (sporeCloud)

**Blockers:** None
**Next:** Available for Sprint 8 tasks or reviews

---

# JR Diary - Sprint 3

## Owned Files
`src/data/potions.js`, `src/data/enemies.js`, `src/systems/potionSystem.js`, `src/components/PotionSlots.jsx`

## Sprint 3 Tasks
- JR-05: Enemy intent specificity (Day 2, P2)

---

## Entries

### Day 1
**Date:** 2026-01-24
**Status:** FIX-01 complete, PR pending
**Done today:**
- Implemented Discard button on PotionSlots popup
- Wired DISCARD_POTION action through GameContext and useGame hook
- Added 9 integration tests for usePotion and discardPotion
- All tests pass (792 total), validate clean
**Blockers:**
- None
**Tomorrow:**
- Wait for FIX-01 PR review and merge
- Start FIX-05 (enemy block retention) after Phase A merges

---

### Magazine Review Notes (58/100)
**Date:** 2026-01-24
**Context:** Game Zone preview review — confirms potions broken, praises slime split!

**My takeaways:**
- FIX-01 validated by review: "Potions are completely non-functional." Fix is done, awaiting merge.
- **Slime split WORKS!** Reviewer quote: "The slime split on death. In a browser game. That's commitment to the source material." This means enemy data and combat logic for splits is correct. Pattern to follow for future complex mechanics.
- **Sprint 3 task (JR-05):** Enemy intent specificity. Currently shows generic "Debuff" instead of "Applying Weak 2" or "Slimed". This is a data task — update enemies.js intent data to include debuff name/amount so the UI can display it. Low priority, easy.
- Card text truncation: "Infernal Blade" → "Infernal Bla..." — not directly my file but worth knowing. Card names in my data files should be kept concise.
- Lesson reinforced: build against existing APIs. The potion fix was about wiring existing logic through GameContext — not about new features. Validate at runtime, not just tests.

---

### Day 2 - JR-02 Complete
**Date:** 2026-01-24
**Status:** JR-02 merged (PR #14)
**Done today:**
- Implemented card upgrade preview in RestSite deck selection
- Added getUpgradeDiffs helper — compares damage, block, cost, hits, draw, and effects between base and upgraded versions
- Hover effects: upgradable cards glow orange, scale up (1.08), and shift up (-4px translateY)
- Stat preview tooltip shows before→after values in green when improved
- Non-upgradable cards dimmed to 0.4 opacity with 0.95 scale — clear visual hierarchy
- Added @keyframes upgradeGlow animation in App.css
- All tests pass, build clean
**Notes:**
- Effect comparison assumes same ordering in base/upgraded — holds for all current cards
- Future: could add upgrade cost display for cards that require gold at shops
**Next:**
- FIX-05: Enemy block retention (starting now)

---

### Day 3 - FIX-05 Complete
**Date:** 2026-01-24
**Status:** FIX-05 complete, PR pending
**Done today:**
- Added `retainBlock: true` flag to enemies that canonically retain block:
  - Lagavulin (elite, Act 1) - sleeps with block, shouldn't lose it
  - Shelled Parasite (normal, Act 2) - shell mechanic relies on block retention
  - The Guardian (boss, Act 1) - defensive mode retains block
  - The Champ (boss, Act 2) - defensive stance retains block
- Updated endTurnAction.js to skip block clear when `enemy.barricade || enemy.retainBlock`
- All tests pass, validate clean
**Blockers:**
- None
**Next:**
- All my Sprint 2 tasks complete (FIX-01 merged, JR-02 merged, FIX-05 PR pending)
- Available for reviews or Sprint 3 prep

---

### Sprint 2 Complete
**Date:** 2026-01-24
**Status:** All tasks merged. Sprint 2 DONE.
**Summary:**
- FIX-01: Potion UI integration — MERGED (PR #8)
- JR-02: Card upgrades with preview — MERGED (PR #14)
- FIX-05: Enemy block retention — MERGED (PR #15), added 7 retainBlock tests per co-pilot review
**Satisfaction:** Happy with sprint 2. All my tasks complete, PRs reviewed and merged.
**Ready for Sprint 3:** Yes. No assigned S3 tasks yet but available for JR-05 (enemy intent specificity).

---

### Sprint 3 Kickoff
**Date:** 2026-01-25
**Status:** Sprint 3 ACTIVE

**My task:**
- **JR-05 (Day 2, P2):** Enemy intent specificity
  - Show "Applying Weak 2" instead of generic "Debuff"
  - Structured intent format per DEC-011: `{ type, effect, amount, target }`
  - Backwards-compatible: add fields alongside existing type strings
  - Files: enemies.js (data file)
  - QA to update test assertions when implemented

**Dependencies:**
- No hard blockers (can start Day 2)
- Independent of Phase A tasks

**Data format change (per DEC-011):**
```javascript
// Before:
intent: { type: 'debuff' }

// After:
intent: { type: 'debuff', effect: 'weak', amount: 2, target: 'player' }
```

**Ready to start:** Day 2 (after Phase A)

---

### Sprint 6 - JR-fix: Enemy HP Accuracy
**Date:** 2026-01-30
**Status:** PR #52 open, awaiting review
**Done today:**
- Aligned Sentry stats with StS baseline: HP 48-56 to 38-42, artifact 2 to 1, damage 11 to 9
- Updated Sentry AI: all Bolt on turn 0, then staggered alternation (was staggered from turn 0)
- Documented Gremlin Nob HP deviation (106-118 vs StS 82-86) with code comment
- Updated 4 test assertions across enemyMechanics.test.js and newMechanics.test.js
- All tests passing (959), validate clean
**Blockers:** None
**Next:** Await PR review and merge

---
