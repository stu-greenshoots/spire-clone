# JR Diary - Sprint 12

## Sprint 12 Entries

### JR-11: Heart card interactions — 60+ card edge case audit vs Heart mechanics
**Date:** 2026-02-01
**Status:** PR pending

**Done:**
- 31 new tests in heartCardInteractions.test.js covering all card types vs Heart mechanics
- Beat of Death: verified triggers for 0-cost cards (Shiv, Backstab), exhaust cards, powers, skills, X-cost (Whirlwind), multi-hit (Pummel, Twin Strike), and block interaction
- Invincible shield: verified multi-hit cards chip per-hit (Pummel 3x4, Twin Strike 5x2, Glass Knife 8x2, Dagger Spray 4x2), mid-attack shield break with HP overflow, Heavy Blade + strength scaling, vulnerable modifier
- Phase transitions: verified AI cycle unchanged regardless of shield status, low HP behavior
- Poison vs invincible: documented known limitation — poison tick bypasses invincible shield (goes straight to HP in endTurnAction.js line 331 without applyDamageToTarget)
- Card audit: validated 60+ cards all have damage or special mechanic, catalogued multi-hit, 0-cost, X-cost, power categories
- 2366 tests passing, lint clean, build clean

**Finding — Poison bypasses invincible shield:**
- Poison damage in endTurnAction.js directly reduces `currentHp` without going through `applyDamageToTarget`
- This means poison ignores the Heart's invincible shield entirely
- In StS, invincible caps ALL damage per turn. This is a known deviation, documented in test.
- Not fixed in this PR (out of scope for test-writing task, would need BE coordination)

**Files changed:** heartCardInteractions.test.js (new), JR.md (1 new + 1 existing file)

**Blockers:** None
**Next:** Await PR review and merge

---

### JR-10: Heart boss implementation — 750 HP, phase transitions, scaling Blood Shots
**Date:** 2026-02-01
**Status:** MERGED (PR #139)

**Done:**
- Adjusted Corrupt Heart HP from 800 → 750 (StS-aligned) and invincible shield from 300 → 200 for better pacing
- Added Blood Shots escalation mechanic: `bloodShotsEscalate` special increments `bloodShotsBonus` each cycle, adding +1 hit to the 15-hit multi-attack
- Wired escalation into enemyTurnAction.js hit calculation loop alongside existing Book of Stabbing pattern
- AI pattern: Turn 0 Debilitate (all debuffs), then repeating Blood Shots → Echo → Buff cycle
- Beat of Death passive (1 damage per card played) was already wired by BE-25
- 17 new tests in heartBoss.test.js covering base stats, moveset, AI cycle, escalation
- Updated 4 existing test files for new HP/invincible values
- 2278 tests passing, lint clean, build clean

**Files changed:** enemies.js, enemyTurnAction.js, heartBoss.test.js (new), enemies.test.js, act3Regression.test.js, newMechanics.test.js (6 files, +161/-16)

**Design decisions:**
- HP 750 (not 800) to match StS Heart and make the fight achievable given our card pool
- Invincible 200 (not 300) — 300 was too forgiving (gives Heart too many turns before players can damage HP)
- Blood Shots escalation (+1 hit per cycle) creates increasing urgency without changing base damage
- Phase transition is implicit: same AI cycle regardless of shield status. The escalation IS the phase progression.

**Blockers:** None
**Next:** JR-11 (card interaction audit vs Heart mechanics) when scheduled

---

# JR Diary - Sprint 11

## Sprint 11 Entries

### FIX-08: Add potions to shop inventory
**Date:** 2026-01-31
**Status:** MERGED (PR #124)

**Root cause:** Shop inventory generation in ShopScreen.jsx only created cards, relics, and card removal service. Potions were completely missing from the shop despite being a core mechanic with 15 potions defined.

**Fix:** Added `getRandomPotion(rarity, excludeIds)` to potions.js. Shop now generates 2 potions (1 common at 50-74g, 1 uncommon at 75-124g). Added buy logic with empty slot check and "No empty potion slot" feedback. Wired potions through `leaveShop` → `shopReducer` for state persistence.

**Files changed:** potions.js, ShopScreen.jsx, GameContext.jsx, shopReducer.js, shopPotions.test.js (5 files, +219/-7)

**Tests:** 6 new tests for getRandomPotion and shopReducer potions. 2111 total passing.

**Blockers:** None
**Next:** Available for QA-15 support or other tasks.

---

### JR-09b: The Silent — Starter Deck & Character Integration
**Date:** 2026-01-31
**Status:** MERGED (PR #123)

**Done:**
- Fixed character-specific maxHp not being applied in SELECT_CHARACTER reducer (Silent was getting 80 HP instead of 70)
- Same fix applied to START_DAILY_CHALLENGE path
- Added 10 integration tests in silentIntegration.test.js covering:
  - Silent character selection (70 HP, 12-card deck, Ring of the Snake relic, character state)
  - Ironclad regression (80 HP, 10 cards, Burning Blood — unchanged)
  - Ring of the Snake combat draw bonus (7 cards at combat start vs 5 for Ironclad)
- 2105 tests passing, lint clean, build clean

**Files changed:** metaReducer.js (+11 lines), silentIntegration.test.js (new, 132 lines)

**Key finding:** Most JR-09b acceptance criteria were already met by BE-23 (character system) and JR-09a (card pool). The real gap was: (1) character HP bug, and (2) no integration tests proving the full Silent flow works end-to-end.

**Blockers:** None
**Next:** All JR Sprint 11 P0 tasks complete. Available for QA-15 support or reviews.

---

### JR-09a: The Silent — 30 card pool
**Date:** 2026-01-31
**Status:** MERGED (PR #122)

**Done:**
- Added 31 Silent cards: 5 basic (strike, defend, neutralize, survivor, shiv), 10 common, 10 uncommon, 7 rare
- Implemented poison mechanic: poison application via card effects, poison tick at start of player turn in endTurnAction, poison death + victory handling
- Implemented Silent specials: discardOne, addShivs, drawThenDiscard, noxiousFumes, envenom, glassKnife, corpseExplosion, bulletTime, thousandCuts, and more
- Added Ring of the Snake starter relic (draw 2 at combat start)
- Added flavor text for all 31 cards + relic
- Updated regression test knownSpecials (18 new entries)
- Added silentCards.test.js with card structure validation
- 2095 tests passing, lint clean, build clean

**Files changed:** cards.js, characters.js, relics.js, flavorText.js, cardEffects.js, endTurnAction.js, playCardAction.js, regression.test.js, silentCards.test.js (9 files, +795/-4)

**Design decisions:**
- Poison tick happens at start of player turn (StS-accurate), decrements by 1 per turn
- Noxious Fumes applies before poison tick (so fumes poison doesn't damage until next turn)
- Victory-on-poison-death follows existing victory pattern (gold, card rewards, potion rewards)
- Shiv is exhaust + 0-cost, upgrades to 6 damage (StS-accurate)

**Blockers:** None
**Next:** JR-09b (Silent starter deck + character selection integration)

---

## Sprint 10 Entries

### JR-08b: Act 3 enemies batch 2 — normals
**Date:** 2026-01-31
**Status:** MERGED (PR #109)

**Done:**
- Added 3 new Act 3 normal enemies: Transient (999 HP, fades after 5 turns), Spire Growth (170-180 HP, constrict + strength scaling), Maw (300 HP, drool-slam-roar-nom cycle)
- Writhing Mass, Orb Walker, and Spiker already existed — this completes the Act 3 normal pool (6 enemies)
- Added all 3 to STRONG_NORMAL_ENEMIES encounter pool
- Added flavor text for all 3 enemies
- 39 new tests in act3Normals.test.js, 1794 total passing

**Files changed:** enemies.js, flavorText.js, act3Normals.test.js (3 files, +295/-1)

**Design decisions:**
- Transient uses fadeTimer flag (5 turns) — fade special needs combat system wiring to kill enemy
- Spire Growth has constrict property — constrict damage-per-turn needs BE wiring
- Maw follows drool→slam→roar→nom→drool deterministic cycle

**Blockers:** None
**Next:** JR-08c (Awakened One boss)

---

### JR-08a: Act 3 enemies batch 1 — Nemesis elite
**Date:** 2026-01-31
**Status:** MERGED (PR #108)

**Done:**
- Added Nemesis as Act 3 elite (185-200 HP) — the only missing Act 3 elite. Giant Head and Reptomancer already existed.
- Implemented enemy intangible system: `applyDamageToTarget` reduces all damage to 1 when enemy has intangible > 0
- Nemesis AI: alternating pattern — even turns use Debilitate (Frail 3 + Weak 3) and gain Intangible 1, odd turns alternate between Scythe (45 dmg + Burn) and Attack Burn (6×3 + Burn)
- Added intangible decrement at end of turn, intangible badge in Enemy component, lore in flavorText
- 17 new tests, 1755 total passing

**Files changed:** enemies.js, combatSystem.js, enemyTurnAction.js, endTurnAction.js, Enemy.jsx, flavorText.js, nemesis.test.js (7 files, +198/-1)

**Design decisions:**
- Enemy intangible is generic (works for any enemy), not Nemesis-specific — future enemies can use it
- Nemesis grants intangible via `nemesisIntangible` flag + move ID check, not turn counter
- `addBurn` special reused from existing Orb Walker / Hexaghost pattern

**Blockers:** None
**Next:** JR-08b (Act 3 normals) or JR-08c (Awakened One boss)

---

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
