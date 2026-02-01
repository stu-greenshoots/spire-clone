# BE Diary

## Role
Back Ender - Architecture, state management, performance

## Sprint 11 Entries

### BE-24: Act 3 Balance Tuning
**Date:** 2026-02-01
**Status:** MERGED (PR #133)

**Done:**
- Reduced overtuned Act 3 enemy HP values:
  - Giant Head (elite): 520-560 → 480-520 (~8% reduction)
  - Maw (normal): 300 → 240-260 (~17% reduction, was outlier for normal enemy)
  - Spire Growth (normal): 170-180 → 150-165 (~9% reduction)
- Added 7 new balance tests for full 3-act simulator runs
- Tests cover: 3-act completion, encounter functionality, win rate ordering (Act 3 < Act 2), ascension scaling, deadliest enemies, performance (2000 runs < 60s)
- Updated 3 existing test assertions for new HP values
- 2248 tests passing, lint clean, build clean

**Rationale:**
- Maw at 300 HP as a normal enemy was disproportionate (next highest normal is ~96 HP for Writhing Mass/Orb Walker)
- Giant Head at 520-560 combined with 45 dmg Dark Echo after 4 turns was overtuned
- Spire Growth with constrict (6/turn) + strength gain (+3/turn) already scales dangerously without high HP

**Blockers:** None
**Next:** All BE Sprint 11 tasks complete

---

### BE-23: Character System
**Date:** 2026-01-31
**Status:** MERGED (PR #121)

**Done:**
- Added CHARACTER_SELECT phase between START_GAME and STARTING_BONUS
- Created `src/data/characters.js` with character definitions (Ironclad only for now)
- Created `CharacterSelect.jsx` component with dark fantasy styling
- Added `character` field to game state and save/load serialization
- Modified `getStarterDeck()`, `getStarterRelic()` to accept characterId
- Modified `getRandomCard()`, `getCardRewards()` to filter by character pool
- Updated card reward generation in playCardAction.js and endTurnAction.js
- Updated all 5 test files (dispatch helpers + game flow tests)
- 1974 tests passing, lint clean, build clean

**Architecture:**
- Cards without a `character` field default to `'ironclad'` — zero changes to existing card definitions
- `character: 'neutral'` cards will be available to all characters (future)
- Phase flow: MAIN_MENU → CHARACTER_SELECT → STARTING_BONUS → MAP
- Shop/event `getRandomCard` calls don't pass character yet — acceptable until Silent cards exist (JR-09b)

**Blockers:** None
**Next:** BE-24 (Act 3 balance tuning) after QA-13 data, or support JR-09a/b integration

---

## Sprint 10 Entries

### BE-22: Daily Challenge Infrastructure
**Date:** 2026-01-31
**Status:** MERGED (PR #112)

**Done:**
- Created `src/utils/seededRandom.js` — Mulberry32 PRNG with `next()`, `nextInt()`, `pick()`, `shuffle()`, date-based seed generation
- Created `src/systems/dailyChallengeSystem.js` — 6 modifiers (Fortified Foes, Exhaustion, Golden Age, Gifted, Fragile, Elite Hunter), daily challenge generation, modifier application, score calculation, localStorage persistence
- Wired `START_DAILY_CHALLENGE` action into GameContext + metaReducer
- Added `dailyChallenge` field to game state (null by default — zero impact on normal play)
- 63 new tests covering RNG determinism, challenge generation, modifiers, scoring, persistence
- 1870 tests passing total

**Architecture:**
- Modifier system follows ascensionSystem pattern — modifiers object with flags consumed by combat system
- `playerMods` apply at START_DAILY_CHALLENGE (energy, HP); `modifiers` are combat-time flags (enemy HP, gold multiplier)
- Score = (floors × 10) + (kills × 5) + HP + gold + (damage/10), multiplied by modifier difficulty multipliers
- LocalStorage auto-cleans entries older than 30 days
- RNG not yet threaded through all Math.random() calls — that's UX-19 integration work

**Blockers:** None
**Next:** All BE Sprint 10 tasks complete

---

### BE-21: Act 3 Map Generation
**Date:** 2026-01-31
**Status:** MERGED (PR #110)

**Done:**
- Made `generateMap(act)` act-aware — previously ignored the act parameter
- Extracted `ACT_DISTRIBUTIONS` config with per-act probability thresholds
- Act 3: more elites (22% vs 15%), fewer rest sites (10% vs 12%), fewer combat-only floors (40% vs 50%)
- Act 2 also gets slightly different distribution (45% combat, 17% elite)
- 13 new tests covering structure, connectivity, and statistical act differences
- 1807 tests passing total

**Architecture:**
- Distribution is config-driven — easy to tune per act without touching logic
- Fallback to Act 1 distribution for unknown acts
- Map structure (15 floors, boss at end, guaranteed rests) unchanged across all acts
- Encounter system already handled Act 3 enemies via `act <= 3` filter

**Blockers:** None
**Next:** BE-22 (Daily challenge infrastructure) when assigned

---

## Sprint 9 Entries

### BE-PWA: PWA Setup
**Date:** 2026-01-31
**Status:** COMPLETE, MERGED (PR #93)

**Done:**
- Added `vite-plugin-pwa` with workbox service worker (autoUpdate strategy)
- Manifest: standalone, portrait, dark fantasy theme (#0a0a0f)
- Generated 192x192 and 512x512 PNG app icons with spire branding
- Precaches 237 assets (~12MB) for full offline support
- Apple touch icon added to index.html

**Architecture:**
- Uses workbox `generateSW` mode — no manual service worker needed
- Cache-first for all static assets (JS, CSS, images, audio, fonts)
- `maximumFileSizeToCacheInBytes` set to 10MB to handle sprite sheet files
- `autoUpdate` register type — service worker updates silently on revisit

**Blockers:** None
**Next:** BE-20 (Performance audit) when ready

---

### BE-20: Performance Audit
**Date:** 2026-01-31
**Status:** COMPLETE, MERGED (PR #99)

**Done:**
- Bundle size analysis: 565KB JS (167KB gzipped), well under 2MB target
- Added `useCallback` to `handleCardClick` and `handleEnemyClick` in CombatScreen
- Added `useMemo` for `passiveEffects` computation in CombatScreen
- Wrapped `PileButton` in `React.memo` (CombatScreen)
- Wrapped `StatusBadge` in `React.memo` (Enemy.jsx)
- Card and Enemy components already had React.memo from prior work
- 6 screen-level components already lazy-loaded via React.lazy

**Findings:**
- JS bundle is 565KB — sprite sheet images (~5.3MB) are loaded on demand, not in bundle
- Inline arrow closures in `.map()` iterations still create new refs per render; deeper refactoring out of scope
- All 1736 tests pass, no regressions

**Blockers:** None
**Next:** All BE Sprint 9 tasks complete

---

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
