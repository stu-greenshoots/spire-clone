# BE Diary

## Role
Back Ender - Architecture, state management, performance

## Sprint 17 Entries

### QR-02: Enhanced DevTools API
**Date:** 2026-02-07
**Status:** MERGED (PR #213)

**Done:**
- Expanded `window.__SPIRE__` with automation-friendly methods for agent-verifiable testing
- Combat Actions: `playCard(handIndex, targetIndex?)`, `endTurn()`, `getVisibleState()`
- Automation: `autoPlayTurn()`, `autoFight()`, `fullPlaythrough(options?)`
- State Manipulation: `giveCard()`, `giveRelic()`, `givePotion()`, `giveGold()`, `setHp()`, `setEnergy()`, `setFloor()`, `skipToPhase()`
- Helper exports: `PHASES`, `inCombat()`, `handSize()`, `enemyCount()`, `hpPercent()`
- Fixed `targetAll` check in `requiresTargeting()` to handle both `target === 'all'` and `targetAll: true`
- 37 new tests in devToolsApi.test.js
- 3315 tests passing (3278 + 37 new), lint clean, build clean

**Architecture:**
- Uses refs (`stateRef`, `gameContextRef`) to avoid stale closure issues in the `useEffect` callback
- State manipulation uses existing `loadScenario` mechanism from `metaReducer`
- `autoPlayTurn()` prioritizes attacks → skills → powers, targets lowest HP enemy
- `autoFight()` loops `autoPlayTurn()` until combat ends or max turns reached
- `fullPlaythrough()` is async, handles all game phases including map navigation

**Blockers:** None
**Next:** QR-05 (E2E test) and QR-03 (scenarios) are now unblocked by this API

---

## Sprint 16 Entries

### BE-33: Bundle Code-Splitting
**Date:** 2026-02-01
**Status:** MERGED (PR #202)

**Done:**
- Added manualChunks function to vite.config.js splitting: vendor-react, vendor, game-data, game-systems, game-reducers, game-context, art-assets, audio, game-hooks, game-utils
- Converted 9 more components to React.lazy(): MainMenu, CombatScreen, RewardScreen, GameOverScreen, VictoryScreen, EndlessTransition, PersistentHeader, PlayerStatusBar, PauseMenu
- Set assetsInlineLimit to 0 to prevent base64-inlining hundreds of small images into JS chunks
- Moved all lazy components inside single Suspense boundary
- Index chunk reduced from 1.2MB to 9.4KB; largest chunk is vendor-react at 189KB
- 3155 tests passing, lint clean, build clean

**Architecture:**
- manualChunks uses path-based matching (id.includes) with specific-before-general ordering
- assetsInlineLimit: 0 trades slightly more HTTP requests for dramatically smaller JS chunks; PWA service worker caches everything anyway
- All screens are now lazy-loaded; only DevTools remains eager (78 lines, dev-only)

**Blockers:** None
**Next:** QA-26 (performance regression) is now unblocked

---

### BE-32: Custom Seeded Runs
**Date:** 2026-02-01
**Status:** MERGED (PR #199)

**Done:**
- Added `stringToSeed()` and `generateSeedString()` to seededRandom.js
- CharacterSelect: seed input field with random seed generator and clear button
- `selectCharacter()` accepts optional `customSeed` parameter
- `generateMap()` accepts optional SeededRNG for deterministic map generation
- All `Math.random()` calls in mapGenerator.js replaced with seeded `rand()` function
- `customSeed` persisted in game state, save/load, and run history
- mapReducer threads seed through act transitions and endless mode loops via `getMapRng()`
- RunHistoryPanel displays seed on seeded runs
- 14 new tests, 3104 total passing, lint clean, build clean

**Architecture:**
- `getMapRng(state, act)` combines seed + act * 7919 + loop * 104729 for unique per-act maps
- Map generation fully deterministic with seed; encounters/rewards still use Math.random()
- Backward compatible: null rng falls through to Math.random in all functions

**Blockers:** None
**Next:** Continue with remaining P0 tasks (JR-15, UX-12)

---

### BE-31: Endless Mode Infrastructure
**Date:** 2026-02-01
**Status:** MERGED (PR #197)

**Done:**
- Added ENDLESS_TRANSITION game phase for post-Heart decision screen
- Added endlessMode (boolean) and endlessLoop (number) to game state
- Modified PROCEED_TO_MAP: after Heart defeat, shows Endless Transition instead of Victory
- Added ENTER_ENDLESS action: resets to Act 1 with incremented loop counter
- Added applyEndlessScaling(): scales enemy HP, maxHp, and invincible by +10% per loop
- Endless encounters use effective act (capped at 3) for enemy pools
- Created EndlessTransition component with "Enter the Endless" and "Claim Victory" buttons
- Save/load persists endlessMode and endlessLoop
- 13 new tests, 3085 total passing, lint clean, build clean

**Architecture:**
- Scaling applied at encounter creation time in mapReducer (same pattern as ascension)
- Combat system unaware of endless mode — scaling pre-applied to enemy instances
- Each loop cycles Acts 1→2→3→Heart, then offers another loop
- Effective act for encounter pools: Math.min(state.act, 3)

**Blockers:** None
**Next:** UX-33, VARROW-12, AR-18, GD-31 now unblocked

---

## Sprint 15 Entries

### BE-30: Scrying System
**Date:** 2026-02-01
**Status:** MERGED (PR #183)

**Done:**
- Added `CARD_SELECT_DRAW` game phase for scry modal
- Added `scryCards` card selection effect in cardEffects.js (follows existing pattern)
- Added `scryCards` case in combatReducer's handleSelectCardFromPile
- Iterative discard: each selection discards card and re-opens modal with remaining top cards
- Cancel/Done returns to combat, keeping undiscarded cards on top of draw pile
- Cards use `special: 'scryCards'` and `scryCount: N` properties
- CombatScreen wired to show top N draw pile cards during scry
- 10 new tests covering effect, reducer, phase, cancel, logging
- 2839 tests passing, lint clean, build clean

**Architecture:**
- Scry shows `drawPile.slice(0, scryCount)` — only top N visible
- Guard prevents selecting cards beyond scryCount index
- After discard, remainingScryCount recalculated as `min(scryCount, drawPile.length)`
- Empty remaining → falls through to default return (COMBAT phase)

**Blockers:** None
**Next:** JR-14b is now fully unblocked (needs BE-29 + BE-30, both done)

---

### BE-29: Stance System Infrastructure
**Date:** 2026-02-01
**Status:** MERGED (PR #180)

**Done:**
- Added `currentStance` (null/calm/wrath/divinity) and `mantra` (numeric) to player state in createInitialState
- Wrath stance: 2× outgoing damage (in calculateDamage), 2× incoming damage (in enemyTurnAction + calculateEnemyDamage)
- Divinity stance: 3× outgoing damage, +3 energy on entry, auto-exits at end of turn
- Calm stance: +2 energy on exit
- Stance transitions via `card.enterStance` property in playCardAction
- Mantra accumulation via `card.mantra` property; auto-triggers Divinity at 10 (excess mantra preserved)
- 19 new tests covering all multiplier combos, transitions, mantra, and auto-exit
- 2732 tests passing, lint clean, build clean

**Architecture:**
- Stance multiplier applied in calculateDamage after strength, before weak — matches StS damage order
- Wrath incoming damage applied in both enemyTurnAction (actual damage) and calculateEnemyDamage (intent preview)
- Divinity exits at end of turn (before enemy turns), not start of next turn
- Cards interact via `enterStance: 'calm'|'wrath'|'divinity'|'none'` and `mantra: N`
- Null stance = no multiplier = zero impact on existing characters

**Blockers:** None
**Next:** BE-30 (Scrying system) is next on the dependency chain. JR-14a/b are now unblocked.

---

## Sprint 14 Entries

### BE-28: Audio System Overhaul
**Date:** 2026-02-01
**Status:** MERGED (PR #167)

**Done:**
- Created AudioContext on first user gesture for browser autoplay policy compliance
- Added AudioContext resume before SFX and music playback (handles tab backgrounding)
- Implemented SFX audio cloning via `cloneNode()` — overlapping plays no longer cut each other off
- Auto-called `initPreloadQueue()` on first user gesture (was never called at runtime)
- Scheduled lazy sound loading via `requestIdleCallback` with `setTimeout` fallback
- Added retry-once on SFX play failure (50ms delay, common after tab regains focus)
- Added `destroy()` method for resource cleanup and `isInitialized()` for state checking
- 10 new tests covering AudioContext resume, SFX cloning, destroy, initialization state
- 2637 tests passing, 0 lint errors, build clean

**Architecture:**
- AudioContext created lazily on first user gesture — not at module load time
- `_playSFXInternal` now clones the cached Audio element instead of reusing it (fire-and-forget pattern)
- `_scheduleLazyLoading` uses `requestIdleCallback` to preload UI/ambient/music sounds without blocking
- Retry mechanism is simple one-shot setTimeout — not a queue or exponential backoff (appropriate for audio)

**Blockers:** None
**Next:** UX-29 (audio settings UX) is now unblocked by this overhaul

---

## Sprint 12 Entries

### BE-26: Heart Unlock Gate
**Date:** 2026-02-01
**Status:** MERGED (PR #143)

**Done:**
- Added `characterWins` field to `DEFAULT_PROGRESSION` — tracks wins per character as `{ ironclad: N, silent: N }`
- Updated `updateRunStats()` to increment character-specific win counter on victory
- Added `isHeartUnlocked(progression)` export — returns true only when both ironclad and silent have ≥1 win
- Passed `character` field through `runData` in metaReducer's `UPDATE_PROGRESSION` case
- Gated Act 3→4 transition in mapReducer's `PROCEED_TO_MAP`: if Heart not unlocked, Act 3 boss win → VICTORY (same as pre-Heart behavior)
- 11 new tests: 5 for characterWins tracking, 5 for isHeartUnlocked, 1 for null/undefined safety
- 2292 tests passing, lint clean, build clean

**Architecture:**
- `characterWins` is a simple object keyed by character ID — extensible for future characters
- Old saves without `characterWins` default to `{}` via DEFAULT_PROGRESSION spread
- Gate check uses `loadProgression()` at transition time — always reads latest persisted state
- Players who beat Act 3 without unlock simply get the normal victory screen

**Blockers:** None
**Next:** QA-17 can now test full 4-act flow with unlock requirement

---

### BE-25: Heart Boss Infrastructure
**Date:** 2026-02-01
**Status:** MERGED (PR #138)

**Done:**
- Added Act 4 single-floor map generation in `generateMap()` — returns one boss node
- Updated `mapReducer.js` PROCEED_TO_MAP: Act 3 boss now advances to Act 4 (was → Victory)
- Implemented invincible shield mechanic in `applyDamageToTarget()`:
  - Absorbs damage after intangible/flight but before block and HP
  - Does not regenerate once depleted
- Added `invincible` field to `createEnemyInstance()` (defaults to 0)
- Added orange invincible shield indicator in Enemy.jsx
- 13 new tests: Act 4 map (3), invincible combat (5), Heart enemy (5)
- 2261 tests passing, lint clean, build clean

**Architecture:**
- Heart enemy definition was already in enemies.js (act: 4, invincible: 300, beatOfDeath: true)
- This PR wires the infrastructure so Act 4 is reachable and invincible shield works in combat
- Damage order: intangible → flight → invincible → block → HP
- Act 4 map is trivial (1 floor, 1 node) — player goes straight to Heart

**Blockers:** None
**Next:** BE-26 (Heart unlock gate) depends on this. JR-10 (Heart implementation) can now proceed.

---

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
