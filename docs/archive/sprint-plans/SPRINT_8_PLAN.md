# Sprint 8 Plan: Polish + Juice + Title Screen

**Created:** 2026-01-31
**Goal:** Make every action feel impactful. Professional first impression. Fix deferred infrastructure debt.
**Integration Branch:** `sprint-8`
**Status:** PLANNED — Pending team alignment

---

## Sprint 7 Outputs Feeding This Sprint

- **UX-13a/b/c:** Mobile combat is now playable (collapsible HUD, card fan, tap-to-play, long-press inspect)
- **GD-audit:** 7 missing enemy art assets identified (automaton, bronzeOrb, gremlinMinion, mystic, shelledParasite, snecko, sphericGuardian)
- **GD-08:** Style guide established (palette, fonts, spacing, component patterns)
- **QA-08a:** 63 Act 2 regression tests, 1131 tests total
- **QA-08b deferred:** E2E viewport tests flaky — root cause needed
- **BE-09 deferred (since Sprint 6):** Starting bonus / Neow still unbuilt
- **PM retro:** Sprite sheet stale (34/41 enemies), diary freshness varies, E2E needs dedicated investment

---

## Task Overview

### P0 — Must Ship

| Task | Owner | Size | Description |
|------|-------|------|-------------|
| **GD-10** | GD | M | Title screen — Professional atmospheric art. Dark fantasy. First thing reviewers see. |
| **UX-16** | UX | M | Combat juice — Screen shake on heavy hits, card play feedback, energy pulse, status effect pop. |
| **VARROW-03** | Varrow | M | Victory/defeat narrative — Death as dissolution. Victory as becoming real. Caps the story. |
| **AR-07** | AR | M | SFX expansion — 10+ new CC0 sounds: card play, card upgrade, potion use, enemy death, boss intro, map traversal, gold gain. |
| **BE-09** | BE | M | Starting bonus / Neow — 3-4 options at run start (gain relic, gain gold, transform starter card, upgrade card). Deferred since Sprint 6. |
| **GD-09** | GD | M | Missing enemy art — Generate 7 enemy sprites + rebuild sprite sheet (41 enemies). |

### P1 — Should Ship

| Task | Owner | Size | Description |
|------|-------|------|-------------|
| **UX-14** | UX | M | Mobile map screen — Touch-friendly nodes, vertical spire background, path planning. Deferred from Sprint 7. |
| **QA-09** | QA | M | E2E infrastructure fix — Root-cause flakiness (timing, selectors, viewport). Stabilize existing tests before adding more. |
| **QA-10** | QA | M | Full balance pass — Act 1 + Act 2 combined. Target 20-35% win rate A0, 5-15% A5. |
| **UX-15** | UX | S | Narrative UI theming — Subtle war-pattern motifs in panel borders, screen transitions. |
| **JR-06** | JR | S | Bronze Orbs + Stasis — Automaton's companion mechanic (deferred from Sprint 7). Card-steal on orb death. |

### P2 — Stretch

| Task | Owner | Size | Description |
|------|-------|------|-------------|
| **AR-08** | AR | S | Sprite sheet automation — `npm run generate-sprites` in build pipeline. Prevents stale sheets. |
| **GD-11** | GD | S | Card sprite sheets — Reduce 96 card art requests to ~8-10 sheets. Same pattern as enemy sprites. |

---

## Task Details

### GD-10: Title Screen (P0, M)

Professional dark-fantasy title screen. First impression for reviewers.

- Atmospheric art (generated, dark fantasy mood)
- Game title with thematic font treatment
- Menu: New Run, Continue, Settings
- Endless War tone — the spire looming, war motifs
- Transition animation into game

**Files:** New `TitleScreen.jsx`, `App.css`, routing in `App.jsx`

**Acceptance Criteria:**
- [ ] Title screen displays on app load
- [ ] Menu options functional (New Run starts game, Continue loads save, Settings opens settings)
- [ ] Art is atmospheric and professional
- [ ] Transition to game is smooth

---

### UX-16: Combat Juice (P0, M)

Make every combat action feel impactful. Build on existing AnimationOverlay infrastructure.

- Screen shake on heavy hits (>15 damage) — respect screen shake setting
- Card play: brief glow/pulse on played card before it resolves
- Energy orb: pulse animation when energy spent/gained
- Status effect application: brief pop/scale on newly applied icons
- Keep all animations non-blocking (fire-and-forget pattern from UX-07)

**Files:** `AnimationOverlay.jsx`, `useAnimations.js`, `CombatScreen.jsx`, `App.css`

**Acceptance Criteria:**
- [ ] Screen shake fires on heavy hits
- [ ] Screen shake respects Settings toggle
- [ ] Card play has visual feedback
- [ ] Animations respect speed multiplier
- [ ] No input blocking

---

### VARROW-03: Victory/Defeat Narrative (P0, M)

Death as dissolution. Victory as becoming real. Caps the Endless War story arc.

- **Death screen:** "The pattern dissolves. The war doesn't notice." + 2-3 variations based on floor reached
- **Victory screen:** "The war tries to unmake you. You resist. For now, you are REAL." (per Mentor's approved line)
- **Heart defeat:** Special victory text acknowledging reaching the core algorithm
- Tone: existential but not bleak. Hope is in persistence, not triumph.

**Files:** `src/data/flavorText.js`, victory/defeat screen components

**Acceptance Criteria:**
- [ ] Death screen shows narrative text (not just "Game Over")
- [ ] Victory screen shows narrative text
- [ ] Text varies based on context (floor, boss beaten, heart reached)
- [ ] Tone consistent with Endless War voice

---

### AR-07: SFX Expansion (P0, M)

10+ new CC0 sound effects wired into game actions.

**Target sounds:**
| Sound | Trigger |
|-------|---------|
| Card play | Any card played |
| Card upgrade | Rest site upgrade |
| Potion use | Potion consumed |
| Enemy death | Enemy HP reaches 0 |
| Boss intro | Boss encounter starts |
| Map step | Node selected on map |
| Gold gain | Gold acquired (reward/event) |
| Relic acquire | New relic gained |
| Block applied | Block value increases |
| Heavy hit | Damage > 15 to player |

**Files:** `src/systems/audioSystem.js`, sound files in `public/audio/`

**Acceptance Criteria:**
- [ ] 10+ distinct sounds wired to game events
- [ ] All CC0 licensed
- [ ] Volume controlled by Settings
- [ ] Sounds don't overlap badly (debounce rapid events)

---

### BE-09: Starting Bonus / Neow (P0, M)

3-4 options at run start. Deferred since Sprint 6 — must ship this sprint.

**Options (per roadmap):**
1. Gain a random common relic
2. Gain 100 gold
3. Transform a starter card (replace with random card of same type)
4. Upgrade a starter card

**Implementation:**
- New game phase: `STARTING_BONUS` between character select and first map node
- UI: simple choice panel (reuse reward/event UI patterns)
- Each option executes immediately, then transitions to map

**Files:** `GameContext.jsx`, new `StartingBonus.jsx`, `metaReducer.js`

**Acceptance Criteria:**
- [ ] 3-4 options presented at run start
- [ ] Each option applies correctly
- [ ] Choice persists through save/load
- [ ] Skip option available (start with nothing)

---

### GD-09: Missing Enemy Art + Sprite Sheet Rebuild (P0, M)

Generate art for 7 missing enemies identified in GD-audit. Rebuild sprite sheet.

**Missing:** automaton, bronzeOrb, gremlinMinion, mystic, shelledParasite, snecko, sphericGuardian

**Steps:**
1. Generate 7 enemy art assets (512x512 WebP, dark fantasy style)
2. Run sprite sheet generator with all 41 enemies
3. Update sprite manifest
4. Verify fallback chain still works

**Files:** `src/assets/art/enemies/`, `scripts/generate-sprite-sheets.js`, sprite manifest

**Acceptance Criteria:**
- [ ] All 41 enemies have art
- [ ] Sprite sheet rebuilt with 41 entries
- [ ] No fallback-to-ASCII for any enemy in normal play

---

### UX-14: Mobile Map Screen (P1, M)

Deferred from Sprint 7. Touch-friendly map with vertical spire aesthetic.

- Touch-friendly node targets (44px minimum, coordinate with AR-05a)
- Vertical spire background art/gradient
- Path planning: highlight available paths from current position
- Pinch-to-zoom or fixed zoom levels

**Files:** `MapScreen.jsx`, `App.css`

**Acceptance Criteria:**
- [ ] Map playable on 390x844 mobile viewport
- [ ] All nodes tappable (44px targets)
- [ ] Available paths clearly visible
- [ ] No horizontal overflow

---

### QA-09: E2E Infrastructure Fix (P1, M)

Root-cause the flakiness that has caused QA-08b and parts of QA-03 to defer repeatedly.

**Investigation areas:**
- Timing: sequential enemy turns take variable time (600ms+ per enemy)
- Selectors: DOM structure changed by UX-13 mobile redesign
- Viewport: responsive layout changes element positions
- Waits: replace fixed timeouts with condition-based polling

**Deliverable:** Stable E2E suite that passes 3 consecutive runs without flaking.

**Files:** `tests/e2e/`

**Acceptance Criteria:**
- [ ] Root cause(s) documented
- [ ] Existing E2E tests pass 3/3 consecutive runs
- [ ] Viewport tests for desktop (1920x1080) and mobile (390x844) added
- [ ] No new fixed-timeout waits

---

### QA-10: Full Balance Pass (P1, M)

Act 1 + Act 2 combined balance using simulator.

**Targets:**
- A0: 20-35% win rate
- A5: 5-15% win rate
- Act 2 clear rate: 15-25% (given Act 1 clear)

**Files:** `src/test/balance/`, enemy data files

**Acceptance Criteria:**
- [ ] Simulator runs with Act 1 + Act 2 combined
- [ ] Win rates within target bands
- [ ] Any balance changes documented with rationale

---

### UX-15: Narrative UI Theming (P1, S)

Subtle Endless War visual motifs in UI chrome.

- Panel borders: faint pattern overlay (war/conflict motif)
- Screen transitions: brief static/glitch effect between phases
- Keep subtle — enhance atmosphere without distracting from gameplay

**Files:** `App.css`, panel/overlay components

**Acceptance Criteria:**
- [ ] Visual motifs visible but not distracting
- [ ] Consistent with Endless War theme
- [ ] No performance impact

---

### JR-06: Bronze Orbs + Stasis (P1, S)

Automaton companion mechanic deferred from Sprint 7.

- Bronze Orbs spawn alongside Automaton
- Stasis: Orb captures a card from player's hand on death
- Simplified: 1-2 orbs, each with fixed HP

**Depends on:** BE-18 systems (already merged)

**Files:** `src/data/enemies.js`, `combatReducer.js`

**Acceptance Criteria:**
- [ ] Bronze Orbs spawn with Automaton
- [ ] Stasis captures a card on orb death
- [ ] Captured card returns when Automaton dies
- [ ] Tests for orb lifecycle

---

### AR-08: Sprite Sheet Automation (P2, S)

Add `npm run generate-sprites` to build pipeline so sprite sheets stay current.

**Files:** `package.json`, `scripts/generate-sprite-sheets.js`

**Acceptance Criteria:**
- [ ] `npm run generate-sprites` regenerates sheet from current assets
- [ ] Script exits non-zero if new enemies found without art

---

### GD-11: Card Sprite Sheets (P2, S)

Apply enemy sprite sheet pattern to 96 card art images.

**Files:** `scripts/generate-sprite-sheets.js`, `src/utils/assetLoader.js`

**Acceptance Criteria:**
- [ ] Card art served from sprite sheets (8-10 sheets)
- [ ] Fallback to individual images if sheet missing
- [ ] Network requests reduced from ~96 to ~10

---

## Phase Ordering

**Week 1 (Foundation + Independent):**
- GD-10 (title screen — first impression, no dependencies)
- GD-09 (enemy art — unblocks sprite sheet rebuild)
- AR-07 (SFX — independent, source CC0 sounds)
- VARROW-03 (narrative — independent)
- QA-09 (E2E fix — independent investigation)

**Week 2 (Core Features + Polish):**
- BE-09 (starting bonus — independent)
- UX-16 (combat juice — builds on existing animation infra)
- UX-14 (mobile map — after UX-13 patterns established)
- JR-06 (Bronze Orbs — uses existing BE-18 systems)

**Week 3 (Integration + Balance):**
- UX-15 (narrative theming — after VARROW-03 sets tone)
- QA-10 (balance pass — after JR-06 changes enemies)
- AR-08 (sprite automation — after GD-09 art complete)
- GD-11 (card sprites — stretch, if time)

---

## Dependencies

```
GD-09 (enemy art) → AR-08 (sprite automation)
VARROW-03 (narrative voice) → UX-15 (narrative theming)
BE-18 (Sprint 7, merged) → JR-06 (Bronze Orbs)
JR-06 → QA-10 (balance pass includes new content)
QA-09 (E2E fix) → viewport tests stable
```

---

## Explicitly NOT in Sprint 8

- Act 3 content (post-1.0)
- Cloud save sync (post-1.0)
- Second character class (post-1.0)
- Landscape mobile support (committed to portrait-only for 1.0)
- PWA setup (Sprint 9)
- Music integration (Sprint 9 — Stu's tracks)

---

## Validation Gate

Before Sprint 8 close:
- [ ] Title screen displays and looks professional
- [ ] Every combat action has visual/audio feedback
- [ ] Animations respect speed settings
- [ ] Victory/defeat screens convey Endless War narrative
- [ ] Starting bonus options work at run start
- [ ] All 41 enemies have art (no ASCII fallbacks)
- [ ] Sprite sheet current with all 41 enemies
- [ ] E2E tests pass 3/3 consecutive runs
- [ ] Act 1 + Act 2 win rate within target bands
- [ ] Mobile map screen playable on 390x844
- [ ] `npm run validate` passes
- [ ] Full game playthrough A0 + A1 without crashes
- [ ] Diaries updated for all active roles

---

## Capacity Summary

| Role | Tasks | Load |
|------|-------|------|
| **BE** | BE-09 (M) | Light — one focused task, long overdue |
| **UX** | UX-16 (M), UX-14 (M), UX-15 (S) | Full — three tasks but phased |
| **JR** | JR-06 (S) | Light — one task, systems already exist |
| **Varrow** | VARROW-03 (M) | Normal |
| **GD** | GD-10 (M), GD-09 (M), GD-11 (S, stretch) | Full — art-heavy sprint |
| **AR** | AR-07 (M), AR-08 (S, stretch) | Normal |
| **QA** | QA-09 (M), QA-10 (M) | Full — infrastructure + balance |

---

*Sprint 8 Plan — PM draft, pending team alignment and Mentor approval.*
*Sources: ROADMAP.md (Sprint 8 section), Sprint 7 retrospective, deferred items backlog, GD-audit findings.*
