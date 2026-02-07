# Sprint 6 Plan: Fix + Foundation + Narrative Start

**Created:** 2026-01-30
**Goal:** Fix confirmed bugs, audit UX to inform Sprint 7 mobile work, begin Endless War narrative.
**Integration Branch:** `sprint-6`
**Duration:** ~2 weeks

---

## Task Overview

### P0 — Must Ship

| Task | Owner | Size | Status | Description |
|------|-------|------|--------|-------------|
| **BE-16** | BE | S | TODO | Power cards go to discard instead of being removed from play. Fix in `playCardAction.js`. |
| **UX-10** | UX | M | TODO | Focused top-20 UX hit list. Actionable fixes grouped by effort. Informs Sprint 7. |
| **QA-07a** | QA | S | TODO | Mechanics audit spike — verify 4 Copilot claims at runtime. 2-hour timebox. |
| **VARROW-01** | Varrow | M | TODO | Act 1 boss dialogue — "Endless War" voice. Guardian, Hexaghost, Slime Boss. |

### P1 — Should Ship

| Task | Owner | Size | Status | Description |
|------|-------|------|--------|-------------|
| **BE-10** | BE | M | TODO | Investigate status effect decrement timing. May or may not be a real bug. |
| **BE-09** | BE | M | TODO | Starting bonus / Neow. 3-4 options at run start. |
| **UX-11** | UX | S | TODO | Block indicator — non-intrusive, no layout jumps. |
| **QA-06** | QA | M | TODO | Balance pass. Target 25-35% win rate at A0. Gate on simulator readiness. |
| **JR-fix** | JR | S | TODO | Fix Sentry HP (38-42), artifact (1), damage (9). Match StS baseline. |
| **JR-prep** | JR | — | TODO | Draft 10 Act 2 enemy stat blocks/movesets in doc. No code PR. |
| **GD-06** | GD | S | TODO | Sprite sheets — deferred from Sprint 4. |

### P2 — Stretch

| Task | Owner | Size | Status | Description |
|------|-------|------|--------|-------------|
| **UX-12** | UX | S | TODO | Smart card targeting — non-enemy cards playable without enemy target. |
| **GD-audit** | GD | S | TODO | Asset audit — catalog assets, gaps, placeholders. Feeds Sprint 7 style guide. |

---

## Task Details

### BE-16: Power Card Fix (P0, S)

**Problem:** Power cards currently go to discard pile after being played. In StS, power cards are removed from play entirely — they don't go to discard or exhaust. They just disappear from the hand and their effect persists.

**File:** `src/context/reducers/combat/playCardAction.js` (~line 434)

**Fix:** After processing a power card's effects, skip the discard pile push. The card should not appear in hand, discard, or exhaust after play.

**Acceptance Criteria:**
- [ ] Power cards don't appear in discard pile after play
- [ ] Power effects persist for entire combat
- [ ] Corruption + Skill interaction still works (skills exhaust, not powers)
- [ ] Dead Branch interaction verified (powers shouldn't trigger Dead Branch)
- [ ] Test added

---

### UX-10: UX Hit List (P0, M)

**Not a sprawling 50+ item audit.** Play the game on mobile (390x844 viewport). Write down the top 20 things that make it feel amateur. Group by:
- **Quick wins** (< 30 min each)
- **Medium effort** (half-day each)
- **Needs redesign** (Sprint 7 scope)

This document directly feeds Sprint 7's mobile combat redesign (UX-13).

**Acceptance Criteria:**
- [ ] Prioritized list of 15-20 actionable items
- [ ] Each item has effort estimate (quick/medium/redesign)
- [ ] Top 5 "quick wins" identified for Sprint 6 stretch work
- [ ] Mobile screenshots documenting key issues

---

### QA-07a: Mechanics Audit Spike (P0, S)

**2-hour timebox.** Verify these 4 claims from the Copilot audit:

1. **Sentry data** — Read `enemies.js`, confirm HP/artifact/damage values. (JR-fix handles the fix.)
2. **Power card exhaustion** — Play a power card in-game. Check if it appears in discard pile. (BE-16 handles the fix.)
3. **Combat state clearing** — Play a combat with buffs/debuffs. Win. Start next combat. Check if effects cleared. (BE confirmed code handles this — verify at runtime.)
4. **Card appearance rates** — Check reward generation logic. Confirm rarity distribution code exists and matches expected rates.

**Output:** For each claim, one of:
- **CONFIRMED BUG** — file a task
- **NOT A BUG** — close with evidence
- **NEEDS MORE INVESTIGATION** — scope follow-up

**Acceptance Criteria:**
- [ ] All 4 claims triaged with evidence
- [ ] Real bugs filed as tasks
- [ ] Non-issues documented and closed

---

### VARROW-01: Boss Dialogue (P0, M)

**The most visible narrative moment in the game.** All 3 Act 1 bosses get "Endless War" dialogue:

**Guardian:**
- Intro: The war's oldest pattern. Something about iteration, repetition.
- Mid-fight: Recognition — has it seen you before?
- Death: Dissolution back into the pattern.

**Hexaghost:**
- Intro: Six flames, six failed attempts. The war remembers in fire.
- Mid-fight: Fragments of previous climbers in its flames.
- Death: The flames scatter but don't go out.

**Slime Boss:**
- Intro: The war's simplest creation. Split and consume.
- Mid-fight: It doesn't think. It just IS the pattern.
- Death: Reforms smaller. The war doesn't waste material.

**Tone:** Not edgy or grimdark. Mechanical. The war is a system, not a villain. Bosses are its outputs, not its servants.

**Files:** `src/data/bossDialogue.js` or equivalent.

**Acceptance Criteria:**
- [ ] 3 bosses have intro, mid-fight, and death dialogue
- [ ] Dialogue displays using existing non-blocking overlay (DEC-016)
- [ ] Tone is consistent with approved "Endless War" pitch
- [ ] No lore contradictions

---

### BE-10: Status Effect Timing (P1, M)

**Investigation task.** The claim is that buff/debuff decrement timing is wrong. Check:
1. When enemy applies 2 Vulnerable, does it last 2 full player turns?
2. Does decrement happen at END of player turn (correct) or START (wrong)?
3. Do player-applied debuffs on enemies decrement at end of enemy turn?

If a bug is found, fix it. If not, document the correct behavior in a test.

**Files to check:** `combatReducer.js` END_TURN logic, `effectProcessor.js` decrement logic.

---

### BE-09: Starting Bonus / Neow (P1, M)

At the start of each run, offer 3-4 options (pick one):
- Gain a random common relic
- Gain 100 gold
- Transform a starter card (replace Strike/Defend with random card)
- Upgrade a random starter card

**Acceptance Criteria:**
- [ ] Selection screen appears before first floor
- [ ] All 4 options functional
- [ ] Choice persists through save/load
- [ ] Test coverage for each option

---

### JR-fix: Enemy HP Accuracy (P1, S)

**File:** `src/data/enemies.js`

Fix Sentry values to match StS baseline:
- HP: 48-56 → **38-42**
- Artifact: 2 → **1**
- Damage: 11 → **9**
- AI: First turn all Bolt, then staggered alternation (verify current pattern)

Also review Gremlin Nob (106-118 vs StS 82-86) — if intentionally higher, add a code comment documenting the deviation and reasoning.

---

### JR-prep: Act 2 Enemy Designs (P1, doc only)

Draft stat blocks for 10 Act 2 enemies. No code PR — this is prep work for Sprint 7.

Enemies: Centurion, Mystic, Snecko, Chosen, Shelled Parasite, Byrd, Reptomancer, Book of Stabbing, Gremlin Leader, Automaton.

For each: HP range, moveset (2-4 moves), AI pattern, special mechanics.

---

## Phase Ordering

**Week 1:**
- QA-07a (spike — informs other work)
- BE-16 (power card fix)
- VARROW-01 (boss dialogue — no dependencies)
- JR-fix (enemy accuracy)
- GD-06 (sprite sheets)

**Week 2:**
- UX-10 (UX hit list)
- BE-10 (status effect investigation)
- BE-09 (starting bonus)
- UX-11 (block indicator)
- QA-06 (balance pass)
- JR-prep (Act 2 designs)

---

## Dependencies

```
QA-07a spike → confirms/closes BE-17 (already closed), informs BE-10
UX-10 hit list → feeds Sprint 7 UX-13 (mobile combat)
JR-prep → feeds Sprint 7 JR-03a/b (Act 2 enemies)
GD-audit → feeds Sprint 7 GD-08 (style guide)
VARROW-01 → VARROW-02 in Sprint 7 (events build on boss voice)
```

---

## Explicitly NOT in Sprint 6

- Performance dashboard (BE-11) — no users, no perf problems
- Sentry error tracking (BE-12) — no users
- JSON data migration (BE-08) — premature
- Combat state clearing fix (BE-17) — already works (BE verified)
- 100+ mechanics test suite (QA-07) — spike first, then targeted tests
- Multi-platform builds — post-1.0
- Full mobile redesign — Sprint 7

---

## Validation Gate

Before Sprint 6 close:
- [ ] All P0 tasks merged
- [ ] `npm run validate` passes (911+ tests, 0 lint errors, build clean)
- [ ] Power cards work correctly (not in discard)
- [ ] Boss dialogue in game for 3 Act 1 bosses
- [ ] Mechanics audit claims triaged
- [ ] UX hit list produced
- [ ] Full game playthrough A0 without crashes
- [ ] Diaries updated for all active roles

---

*Sprint 6 Plan — Team-aligned, Mentor-approved.*
