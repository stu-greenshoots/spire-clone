# Sprint 11 Plan: Second Character + QoL + Score Push

**Created:** 2026-01-31
**Goal:** Introduce the Silent (second character class), resolve all remaining Game Zone complaints, and push toward 90+ score. Quality of life features for player retention.
**Integration Branch:** `sprint-11`
**Status:** PLANNED — Pending team alignment

---

## Sprint 10 Outputs Feeding This Sprint

- **Sprint 10 complete:** 15/15 tasks (third consecutive 100% sprint)
- **1973 tests** passing across 40+ test files
- **3-act game complete:** 81 cards, 45+ enemies, 49 relics, 15 potions, 25 events
- **Daily challenge mode:** Functional with seeded runs, modifiers, scoring
- **Self-assessed score: 85/100** (up from 58/100 at Sprint 2)
- **Sprint 10 → master merge:** Pending (PM-11 task)

### Remaining Game Zone Complaints (3 unresolved)

| Complaint | Status | Sprint 11 Task |
|-----------|--------|----------------|
| No run statistics or history | NOT FIXED | UX-21 |
| No visual distinction common/uncommon/rare | NOT FIXED | GD-16 |
| No confirmation when skipping rewards | NOT FIXED | UX-22 |

### Path to 90+ (from SELF_ASSESSMENT.md)

1. **Second character class** — Single biggest gameplay depth gap → JR-09, BE-23, VARROW-06
2. **Run history / statistics screen** — UX-21
3. **Card rarity visuals** — GD-16
4. ~~Animated enemy sprites~~ — Deferred (high effort, diminishing returns)
5. ~~Heart / true final boss~~ — Deferred (needs design spike)
6. ~~Cloud save~~ — Deferred (no server infrastructure)

---

## Task Overview

### P0 — Must Ship

| Task | Owner | Size | Description |
|------|-------|------|-------------|
| **PM-11** | PM | S | Merge Sprint 10 to master, create sprint-11 branch, draft PR |
| **JR-09a** | JR | L | The Silent — 30 card pool (10 common, 10 uncommon, 6 rare, 4 starter). Shiv, poison, discard synergies. |
| **JR-09b** | JR | M | The Silent — starter deck and character selection. 12-card starter (Strikes, Defends, Survivor, Neutralize). |
| **BE-23** | BE | M | Character system — character selection at run start, character-specific card pools, starter decks, starter relics. Wire into GameContext. |
| **GD-16** | GD | M | Card rarity visuals — distinct card frame borders/glow for common, uncommon, rare in reward selection and deck viewer. |
| **UX-21** | UX | M | Run history & statistics — completed runs list, win/loss record, cards picked, floors reached, enemies killed. LocalStorage persistence. |

### P1 — Should Ship

| Task | Owner | Size | Description |
|------|-------|------|-------------|
| **VARROW-06** | Varrow | M | Silent narrative — character-specific flavor text, boss dialogue variants, event text for "a second warrior enters the loop." |
| **UX-22** | UX | S | Skip-reward confirmation — "Are you sure?" prompt when skipping card/relic/potion rewards. Last unresolved Game Zone complaint. |
| **GD-17** | GD | S | Silent character art — character portrait for selection screen + in-combat silhouette. Match dark fantasy style. |
| **QA-15** | QA | M | Silent regression + balance — all 30 Silent cards tested, starter deck balance, character selection flow, 2-character win rates. |
| **AR-11** | AR | S | Silent audio — character-specific card play sounds (Shiv swoosh, poison sizzle). 3-4 new CC0 SFX. |
| **BE-24** | BE | S | Act 3 balance tuning — adjust Act 3 enemy stats based on QA-13 data. Fine-tune win rates (target 15-25% A0 for both characters). |

### P2 — Stretch

| Task | Owner | Size | Description |
|------|-------|------|-------------|
| **UX-23** | UX | S | Map visited-node indicator — grey out or check-mark nodes already visited. Minor polish. |
| **QA-16** | QA | S | Diary enforcement audit — verify all team diaries updated for Sprint 10. Document gaps. Process improvement. |
| **GD-18** | GD | S | Silent card art — 30 card illustrations for Silent pool. Sprite sheet rebuild. |

---

## Task Details

### PM-11: Merge Sprint 10 + Create Sprint 11 Infra (P0, S)

Sprint 10 PR #106 is open (draft). Sprint-10 work complete but not merged to master.

**Steps:**
1. Merge sprint-10 → master (PR #106)
2. Create sprint-11 branch from updated master
3. Create draft PR sprint-11 → master with task checklist
4. Update SPRINT_BOARD.md

**Acceptance Criteria:**
- [ ] PR #106 merged
- [ ] sprint-11 branch created and pushed
- [ ] Draft PR open with checklist

---

### JR-09a: The Silent — Card Pool (P0, L)

30 cards for the Silent character class. Archetypes: Shiv (0-cost attacks), Poison (stacking damage), Discard (card manipulation).

**Card breakdown:**
- **Starter (4):** Strike (Silent), Defend (Silent), Neutralize (1-cost, 3 dmg + 1 Weak), Survivor (1-cost, 8 block, discard 1)
- **Common Attacks (5):** Dagger Spray (1, 4x2 dmg), Dagger Throw (1, 9 dmg draw 1 discard 1), Flying Knee (1, 8 dmg +1 energy next turn), Poisoned Stab (1, 6 dmg + 3 poison), Quick Slash (1, 8 dmg draw 1)
- **Common Skills (5):** Acrobatics (1, draw 3 discard 1), Backflip (1, 5 block draw 2), Blade Dance (1, add 3 Shivs to hand), Deadly Poison (1, 5 poison), Dodge and Roll (1, 4 block, 4 block next turn)
- **Uncommon (10):** Dash (2, 10 dmg + 10 block), Leg Sweep (2, 11 block + 2 Weak), Noxious Fumes (1 Power, 2 poison to all per turn), Footwork (1 Power, +2 Dexterity), Predator (2, 15 dmg draw 2 next turn), Flechettes (1, 4 dmg per skill in hand), Backstab (0, 11 dmg, Innate, Exhaust), Cloak and Dagger (1, 6 block + 1 Shiv), Finisher (1, 8 dmg per attack played this turn), Well-Laid Plans (1 Power, Retain 1 card)
- **Rare (6):** A Thousand Cuts (2 Power, 1 dmg per card played), Adrenaline (0, draw 2 +1 energy, Exhaust), Bullet Time (3, cards cost 0 this turn, no draw next turn), Corpse Explosion (2, apply to enemy — explodes for max HP dmg on death), Envenom (2 Power, add poison on unblocked attack dmg), Glass Knife (1, 8x2 dmg, -2 dmg per play)

**Files:** `src/data/cards.js` (new Silent section), `src/data/characters.js` (new file)
**Acceptance Criteria:**
- [ ] 30 cards with descriptions, costs, effects, upgraded versions
- [ ] Shiv token card (0-cost, 4 dmg, Exhaust)
- [ ] Poison mechanic works (damage at turn end, decrements)
- [ ] Tests for all 30 cards

---

### JR-09b: The Silent — Starter Deck & Character Integration (P0, M)

Wire the Silent as a selectable character.

**Implementation:**
- Starter deck: 5 Strikes, 5 Defends, 1 Neutralize, 1 Survivor
- Starter relic: Ring of the Snake (draw 2 extra on first turn)
- Character data: `{ id: 'silent', name: 'The Silent', starterDeck: [...], starterRelic: 'ring_of_snake', cardPool: 'silent' }`

**Files:** `src/data/characters.js`, `src/data/relics.js` (Ring of the Snake)
**Acceptance Criteria:**
- [ ] Silent selectable at run start
- [ ] Correct starter deck dealt
- [ ] Ring of the Snake functional
- [ ] Card rewards draw from Silent pool only

---

### BE-23: Character System (P0, M)

Architecture for multiple characters. Currently everything assumes a single card pool.

**Implementation:**
- Character selection screen before run start (after starting bonus / Neow)
- `GameContext` stores `currentCharacter` in state
- Card reward pools filtered by character
- Starter deck and starter relic determined by character
- Existing Ironclad cards tagged with `character: 'ironclad'`
- Neutral cards (e.g., colorless) available to both

**Files:** `src/context/GameContext.jsx`, `src/context/reducers/metaReducer.js`, `src/components/CharacterSelect.jsx` (new)
**Acceptance Criteria:**
- [ ] Character selection screen works
- [ ] Card pools are character-specific
- [ ] Ironclad gameplay completely unchanged
- [ ] State serialization includes character

---

### GD-16: Card Rarity Visuals (P0, M)

Cards should look visually distinct by rarity in reward selection and deck viewer.

**Implementation:**
- Common: default frame (current)
- Uncommon: blue/teal border glow
- Rare: gold/amber border glow
- Card frames get subtle colored accents matching rarity
- Applied in CardDisplay component

**Files:** `src/components/CardDisplay.jsx`, card-related CSS
**Acceptance Criteria:**
- [ ] Rarity visually obvious in reward selection
- [ ] Rarity visible in deck viewer
- [ ] Does not affect in-hand card rendering (keep clean)

---

### UX-21: Run History & Statistics (P0, M)

Players want to see their progress over time.

**Implementation:**
- Run history screen accessible from title menu
- Stores last 50 runs in localStorage
- Per-run data: character, win/loss, floors reached, enemies killed, cards picked, relics collected, ascension level, score
- Summary stats: total wins, total runs, win rate per character, best score
- Clean table/list UI matching existing dark fantasy theme

**Files:** New `src/components/RunHistory.jsx`, `src/systems/runHistorySystem.js`
**Acceptance Criteria:**
- [ ] Run data saved on run end (win or loss)
- [ ] History screen shows past runs with key stats
- [ ] Summary statistics calculated
- [ ] localStorage persistence

---

### VARROW-06: Silent Narrative (P1, M)

The Silent entering the Endless War. A second perspective on the loop.

**Scope:**
- Silent-specific flavor text for map exploration
- Boss dialogue variants when playing as Silent
- 2-3 Silent-specific event options (e.g., stealth-focused choices)
- "A second warrior steps into the pattern" framing

**Files:** `src/data/flavorText.js`, `src/data/bossDialogue.js`, `src/data/events.js`
**Acceptance Criteria:**
- [ ] Silent has distinct flavor text
- [ ] Boss dialogue acknowledges Silent differently
- [ ] No placeholder text
- [ ] Consistent with Endless War voice

---

### UX-22: Skip-Reward Confirmation (P1, S)

Last unresolved Game Zone complaint. When player clicks "Skip" on card/relic/potion rewards, show a brief confirmation.

**Implementation:**
- "Skip rewards?" modal with Confirm/Cancel
- Only on explicit skip (not on auto-advance)
- Respects existing UI patterns

**Files:** `src/components/RewardScreen.jsx`
**Acceptance Criteria:**
- [ ] Confirmation appears on skip
- [ ] Can cancel to return to rewards
- [ ] Does not trigger on auto-advance

---

## Phase Ordering

**Phase 1 (Foundation — Do First):**
- PM-11 (merge Sprint 10, create branch)
- BE-23 (character system — unblocks everything Silent-related)
- GD-16 (card rarity visuals — independent, quick win)

**Phase 2 (Core Content):**
- JR-09a (Silent card pool — after BE-23 establishes character system)
- JR-09b (Silent starter deck — after JR-09a)
- UX-21 (run history — independent)
- UX-22 (skip confirmation — independent, small)

**Phase 3 (Integration + Polish):**
- VARROW-06 (Silent narrative — after Silent exists in game)
- GD-17 (Silent art — after character ID defined)
- AR-11 (Silent audio — after card types known)
- QA-15 (regression — after all Silent content in)
- BE-24 (balance tuning — after QA data)
- Stretch: UX-23, QA-16, GD-18

---

## Dependencies

```
PM-11 (merge + branch) → all other tasks
BE-23 (character system) → JR-09a/b, VARROW-06, GD-17, AR-11
JR-09a (card pool) → JR-09b (starter deck + integration)
JR-09a/b (Silent cards) → QA-15 (regression)
QA-15 (balance data) → BE-24 (balance tuning)
All content → QA-15 (regression after content complete)
```

---

## Explicitly NOT in Sprint 11

- Heart / true final boss (needs design spike)
- Cloud save (no server infrastructure)
- Animated enemy sprites (high effort, diminishing returns)
- Localization
- Native builds (Tauri/Capacitor)
- Third character class (ship Silent first, validate)

---

## Validation Gate

Before Sprint 11 close:
- [ ] Character selection screen functional
- [ ] Silent playable with 30-card pool through all 3 acts
- [ ] Ironclad completely unaffected by character system
- [ ] Card rarity visually distinct in reward selection
- [ ] Run history screen shows past runs with statistics
- [ ] Skip-reward confirmation works
- [ ] Silent-specific narrative text in Endless War voice
- [ ] 2100+ tests passing
- [ ] `npm run validate` passes
- [ ] Win rate: Silent 20-30% A0, Ironclad unchanged
- [ ] All 3 original unresolved Game Zone complaints addressed

---

## Capacity Summary

| Role | Tasks | Load |
|------|-------|------|
| **BE** | BE-23 (M), BE-24 (S) | Normal — character system + balance |
| **UX** | UX-21 (M), UX-22 (S), UX-23 (S, stretch) | Normal |
| **JR** | JR-09a (L), JR-09b (M) | Full — sprint anchor (30 cards + integration) |
| **Varrow** | VARROW-06 (M) | Normal — Silent narrative |
| **GD** | GD-16 (M), GD-17 (S), GD-18 (S, stretch) | Normal — rarity visuals + character art |
| **AR** | AR-11 (S) | Light — Silent SFX |
| **QA** | QA-15 (M), QA-16 (S, stretch) | Normal — regression + process |
| **PM** | PM-11 (S) | Light — merge + coordination |

---

*Sprint 11 Plan — PM draft, pending team alignment and Mentor approval.*
*Focus: Second character is the single highest-impact addition for gameplay depth. QoL fixes resolve all remaining reviewer complaints.*
