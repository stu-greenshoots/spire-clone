# JR Diary - Sprint 2

## Role
Junior Developer - Potion system, card upgrades, new content

## Owned Files
`src/data/potions.js`, `src/systems/potionSystem.js`, `src/components/PotionSlots.jsx`

## Sprint 2 Tasks
- FIX-01: Potion UI integration (P0)
- FIX-05: Enemy block retention (P2)
- JR-02: Card upgrades (P1)

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
