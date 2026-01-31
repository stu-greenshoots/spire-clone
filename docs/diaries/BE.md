# BE Diary

## Role
Back Ender - Architecture, state management, performance

## Sprint 8 Entries

### BE-09: Starting Bonus / Neow
**Date:** 2026-01-31
**Status:** COMPLETE, MERGED (PR #83)

**Done:**
- Added STARTING_BONUS game phase between START_GAME and MAP
- 4 bonus options: random common relic, 100 gold, upgrade starter card, transform starter card
- Skip option for purists
- New StartingBonus.jsx component (119 lines) with Endless War theming
- SELECT_STARTING_BONUS reducer in metaReducer.js (72 lines of new logic)
- 6 new tests in startingBonus.test.js
- Updated 20 START_GAME dispatches in fullPlaythrough.test.js
- Updated E2E fixture to handle bonus screen
- All 1137 tests pass, lint clean, build clean

**Architecture:**
- Phase flow: MAIN_MENU → STARTING_BONUS → MAP (was MAIN_MENU → MAP)
- Save/load safe: LOAD_GAME always restores to MAP phase
- Bonus selection auto-saves after applying choice
- Transform uses getRandomCard with same type filter for thematic replacement

**Blockers:** None
**Next:** Available for Sprint 8 support

---

## Sprint 3 Entries

## Owned Files
`src/context/`, `src/context/reducers/`

## Sprint 3 Tasks
- BE-05: Damage preview with modifiers (Day 3, P1)

---

## Entries

### Day 1
**Date:** 2026-01-24
**Status:** FIX-03 complete, PR pending
**Done today:**
- Fixed exhaust trigger handling in combatReducer's exhaustChoose case
- Replaced inline Dark Embrace + Feel No Pain logic with centralized handleExhaustTriggers
- This fixes missing Dead Branch trigger when cards are exhausted via card selection
- Added import of handleExhaustTriggers from effectProcessor
- Proper hand context now passed to all exhaust triggers
- 5 new tests covering all exhaust trigger combinations via card selection
- All tests pass, validate clean
**Blockers:**
- None
**Tomorrow:**
- Wait for FIX-03 PR review and merge
- Start BE-02 (normalize state with entity IDs) after Phase A merges

---

### Magazine Review Notes (58/100)
**Date:** 2026-01-24
**Context:** Game Zone preview review — see `review.html` and PR #11

**My takeaways:**
- FIX-03 validated by review: card effects crash confirmed. Fix is done, awaiting merge.
- **Sprint 3 task (BE-05):** Damage preview needs to reflect modifiers (Vulnerable/Weak). Currently shows base damage (6) when effective is (9). In StS the number turns green when boosted.
  - Approach: Extract a shared `calculateEffectiveDamage(card, target, playerState, modifiers)` utility that both effect execution and preview call. Prevents duplication and makes tooltip calculations reliable.
  - Touches: combatSystem, card rendering pipeline
- **Sprint 3 task (PM-03):** Data Editor button visible in production. Trivial env gate — `import.meta.env.PROD` check.
- Mentor advice on tooltips: Portal-based generic component. When I normalize state (BE-02), ensure modifier application is deterministic so tooltip damage calculations are reliable.
- Audio is silent — AR should investigate autoplay policy.

---

### Day 3 - BE-02 Complete
**Date:** 2026-01-24
**Status:** BE-02 complete, PR pending
**Done today:**
- Normalized enemy references in playCardAction.js:
  - Replaced `targetIndex` array index with `resolvedTargetId` instanceId
  - All single-target damage/effects now use `.map()` with instanceId matching
  - Random target (Juggernaut, random damage cards) normalized to map pattern
  - Time Eater heal uses map instead of index mutation
  - Strike Dummy relic uses map instead of index mutation
  - effectCtx provides `targetId` as primary, `targetIndex` as backward-compatible getter
- Normalized enemyTurnAction.js:
  - Heal ally (Mystic) uses map with instanceId instead of lowestIdx mutation
- Normalized card upgrade API:
  - `upgradeCard(cardIndex)` → `upgradeCard(cardId)` using instanceId
  - metaReducer uses `deck.find(c => c.instanceId === cardId)` instead of `deck[cardIndex]`
  - RestSite passes card.instanceId instead of array index
  - GameContext `selectCardFromPile` removed unused `index` param
**Architecture:**
- cardEffects.js still uses ctx.targetIndex internally (backward-compat getter bridges the gap)
- Full normalization of cardEffects would be a separate task (50+ index refs)
- Public API is now fully ID-based: no component passes array indices
**Blockers:**
- None
**Next:**
- All BE Sprint 2 tasks complete (FIX-03 merged, BE-02 PR pending)

---

### Sprint 2 Complete
**Date:** 2026-01-24
**Status:** All tasks merged. Sprint 2 DONE.
**Summary:**
- FIX-03: Card effect context fix — MERGED (PR #10)
- BE-02: Normalize state to IDs — MERGED (PR #18), all public APIs now ID-based
**Architecture note:** cardEffects.js still uses ctx.targetIndex internally via backward-compat getter. Full normalization would be a separate Sprint 3+ task.
**Satisfaction:** Happy with sprint 2. State is properly normalized, no more index mutations in public API.
**Ready for Sprint 3:** Yes. BE-05 (damage preview with modifiers) queued.

---

### Sprint 3 Kickoff
**Date:** 2026-01-25
**Status:** Sprint 3 ACTIVE

**My task:**
- **BE-05 (Day 3, P1):** Damage preview with modifiers
  - Card numbers reflect Vulnerable/Weak modifiers
  - Numbers turn green when boosted (like StS)
  - Extract shared `calculateEffectiveDamage(card, target, playerState, modifiers)` per DEC-004
  - Pure function used by both combat execution and UI preview
  - Files: combatSystem.js, card display components

**Dependencies:**
- Depends on UX-06 (tooltip infrastructure) for display pattern
- Can coordinate with UX for card rendering integration

**Architecture notes:**
- Ensure modifier application is deterministic for reliable calculations
- cardEffects.js still uses ctx.targetIndex internally (Sprint 3+ full normalization)

**Ready to start:** Day 3 (after UX-06 merged)

---
