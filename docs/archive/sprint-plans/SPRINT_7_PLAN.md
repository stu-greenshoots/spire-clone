# Sprint 7 Plan: Mobile Combat + Act 2 Content + Narrative Voice

**Created:** 2026-01-30
**Goal:** Make combat feel professional on mobile. Correct and expand the Act 2 enemy roster. Extend the Endless War narrative.
**Integration Branch:** `sprint-7`
**Status:** FINAL — Team-aligned, Mentor-approved

---

## Sprint 6 Outputs Feeding This Sprint

- **UX-10 hit list** (`docs/UX-10-hit-list.md`): 18 issues identified. 5 quick wins, 8 medium effort, 4 need redesign.
- **JR-prep Act 2 designs** (`docs/act2-enemy-designs.md`): 10 enemies specced. 9 exist (need corrections), 1 new (Automaton boss).
- **QA-06 balance pass**: Win rate tuned to 25-35% at A0.
- **VARROW-01 boss dialogue**: "Endless War" voice established for Act 1 bosses.
- **BE-10 status effect timing**: Fixed — debuffs decrement correctly at end of player turn.

---

## Task Overview

### P0 — Must Ship

| Task | Owner | Size | Description |
|------|-------|------|-------------|
| **GD-08** | GD | S | Style guide — palette, fonts, spacing, component patterns. Gates UX work. |
| **BE-18** | BE | M | Act 2 enemy systems — Plated Armor, Confused debuff, Artifact buff, Lifesteal |
| **UX-13a** | UX | M | Mobile combat: collapsible HUD + vertical zones + header rework |
| **UX-13b** | UX | M | Mobile combat: card fan/arc + tap-to-play |
| **UX-13c** | UX | S | Mobile combat: long-press inspect + inline enemy info |
| **JR-03a** | JR | M | Act 2 enemies: Centurion + Mystic (ally pair) + Snecko |
| **JR-03b** | JR | M | Act 2 enemies: Chosen + Shelled Parasite + Byrd |
| **JR-03c** | JR | M | Act 2 enemies: Book of Stabbing + Gremlin Leader + Reptomancer (+ Dagger) |
| **VARROW-02** | Varrow | M | Event rewrite — 10 events become "pattern glitches" in the Endless War |

### P1 — Should Ship

| Task | Owner | Size | Description |
|------|-------|------|-------------|
| **JR-03d** | JR | L | Automaton boss + Bronze Orbs (simplified — no Stasis) |
| **BE-19** | BE | S | Encounter weighting for Act 2 map (DEC-017) |
| **AR-05a** | AR | S | Touch targets — 44px minimum on all interactive elements |
| **QA-08a** | QA | M | Act 2 enemy regression — AI patterns, new systems |
| **QA-08b** | QA | S | Combat redesign viewport testing — desktop + mobile |

### P2 — Stretch

| Task | Owner | Size | Description |
|------|-------|------|-------------|
| **UX-12** | UX | S | Smart card targeting (deferred from Sprint 6) |
| **GD-audit** | GD | S | Asset audit — catalog gaps (deferred from Sprint 6) |

---

## Key Decisions from Team Input

| # | Decision | Reasoning | Agreed By |
|---|----------|-----------|-----------|
| 1 | Defer UX-14 (mobile map) to Sprint 8 | UX overloaded with UX-13. Map is less critical than combat. | Mentor, UX |
| 2 | Defer BE-09 (Neow) to Sprint 8 | Sprint too full. Independent — slots into any sprint. | Mentor, BE |
| 3 | Defer Stasis (Bronze Orb card-steal) to Sprint 8 | Architecturally novel. Needs careful design. Ship Automaton without Orbs first. | Mentor, BE, JR |
| 4 | Split UX-13 into 3 sub-tasks | 300-line PR limit. Each sub-task is reviewable and testable. | UX, Mentor |
| 5 | Split JR enemies into 4 tasks | 300-line limit. Isolates Automaton risk. Makes BE dependency explicit. | JR, Mentor |
| 6 | Add BE-18 (enemy systems prerequisite) | JR blocked without Plated Armor, Confused, Artifact, Lifesteal. | BE, JR, Mentor |
| 7 | Promote GD-08 to P0 | Gates UX-13. Must ship first 2-3 days. | GD, UX, AR/QA |
| 8 | Split QA-08 into a/b | Enemy testing and viewport testing are distinct efforts. | QA |
| 9 | Automaton ships without Bronze Orbs | Hyper Beam cycle + Artifact is enough for a boss. Orbs + Stasis in Sprint 8. | Mentor, BE |

---

## Task Details

### GD-08: Style Guide (P0, S)

One-page style reference. Must ship in first 2-3 days — gates UX-13.

- Palette (CSS custom properties from GD-05)
- Font stack
- Spacing scale (4/8/12/16/24/32px)
- Component patterns

**Output:** `docs/STYLE_GUIDE.md`

---

### BE-18: Act 2 Enemy Systems (P0, M)

Build the game systems JR needs for Act 2 enemies. Must land before JR-03a/b.

**Systems:**

| System | Description | Needed By |
|--------|-------------|-----------|
| **Plated Armor** | End-of-turn buff grants N block. Decreases by 1 each time enemy takes unblocked damage. | Shelled Parasite (JR-03b) |
| **Confused debuff** | As move effect: randomize card costs 0-3 when applied. Must hook into card cost resolution. | Snecko (JR-03a) |
| **Artifact buff** | Counter that blocks N debuff applications. Intercepts debuff pipeline. | Automaton (JR-03d) |
| **Lifesteal** | Attack that heals for unblocked damage dealt. Expose post-block damage value. | Shelled Parasite (JR-03b) |

**Design notes (from BE):**
- Artifact needs a design doc for where it intercepts the debuff pipeline. Affects all future debuff-blocking mechanics.
- Confused needs a 30-minute spike to determine: modifier on card object, check at play time, or render-time override?

**Files:** `combatReducer.js`, `effectProcessor.js`

**Acceptance Criteria:**
- [ ] Plated Armor grants block at end of turn, reduces on unblocked damage
- [ ] Confused randomizes card costs 0-3
- [ ] Artifact blocks first N debuff applications, counter decrements
- [ ] Lifesteal heals for exact unblocked damage
- [ ] Tests for each system

---

### UX-13a: Mobile Combat — Structure (P0, M)

Collapsible HUD + vertical zones layout. The structural foundation for mobile combat.

**From hit list:** RD-1 (combat layout), RD-2 (collapsible HUD), QW-1 (header collapse), QW-3 (bottom bar), QW-5 (turn indicator)

- Combat mode header: single row (HP + energy + block). ~40px.
- Relics/potions behind tap-to-expand drawer
- Vertical zones: header (40px), enemy zone (40%), hand zone (60%)
- Turn indicator integrated into header
- Bottom bar: 44px pile buttons, 44px energy orb

**Files:** `PersistentHeader.jsx`, `CombatScreen.jsx`, `App.css`

**Acceptance Criteria:**
- [ ] Header collapses to single row during combat
- [ ] Enemy/hand zones fill remaining space proportionally
- [ ] Desktop layout not broken
- [ ] No layout shifts when block appears/disappears

---

### UX-13b: Mobile Combat — Card Interaction (P0, M)

Card fan/arc layout + tap-to-play input mode. Depends on UX-13a layout.

**From hit list:** ME-1 (card overlap), ME-7 (drag-to-play), QW-2 (card font)

- Cards overlap in hand (80px base width), spread on tap
- Tap card to select, tap enemy to target (mobile)
- Keep drag as optional for desktop
- Card description font: 10px minimum on mobile

**Files:** `Card.jsx`, `CombatScreen.jsx` (hand area)

**Acceptance Criteria:**
- [ ] All hand cards visible without horizontal scroll
- [ ] Tap-to-select + tap-to-target works on mobile
- [ ] Card text readable on mobile
- [ ] Desktop drag still works

---

### UX-13c: Mobile Combat — Info Access (P0, S)

Card inspect and inline enemy info. Can run after UX-13a.

**From hit list:** ME-2 (long-press), ME-3 (enemy info)

- Long-press (300ms) shows enlarged card modal centered on screen
- HP, intent, and top 2 status effects visible on enemy component without tapping
- Detailed modal reserved for tap

**Files:** New modal component, `Enemy.jsx`

**Acceptance Criteria:**
- [ ] Long-press shows enlarged card
- [ ] Essential enemy info visible without taps
- [ ] Modal dismisses on release

---

### JR-03a: Act 2 Enemies — Centurion, Mystic, Snecko (P0, M)

**Depends on:** BE-18 (Confused debuff for Snecko)

| Enemy | Key Changes |
|-------|-------------|
| Centurion | HP 56-62 → 76-80, ally-aware AI (checks Mystic alive), Fury when Mystic dead |
| Mystic | HP 50-56 → 48-56, add Buff move (+2 Str all), healAll targets ALL, AI rewrite |
| Snecko | HP 60-66 → 114-120, add Perplexing Glare opening, fix Tail Whip to Vulnerable |

**JR builds:** Ally-aware AI (pass allies array to AI function)
**BE provides:** Confused debuff system (BE-18)

---

### JR-03b: Act 2 Enemies — Chosen, Shelled Parasite, Byrd (P0, M)

**Depends on:** BE-18 (Plated Armor, Lifesteal for Shelled Parasite)

| Enemy | Key Changes |
|-------|-------------|
| Chosen | HP 62-68 → 95-99, add Drain move, fix opening to Poke then Hex |
| Shelled Parasite | Replace Shell move with Plated Armor passive, add Fell, fix Suck to lifesteal |
| Byrd | Add Headbutt (stunned state), fix AI for grounded state, group encounters (2-3) |

---

### JR-03c: Act 2 Enemies — Elites (P0, M)

| Enemy | Key Changes |
|-------|-------------|
| Book of Stabbing | HP 180-192 → 160-168, fix Multi-Stab to 2+N hits, weighted random AI |
| Gremlin Leader | HP 160-172 → 140-148, fix Stab to 6x3, Encourage adds block, context-aware AI |
| Reptomancer | HP 200-216 → 180-190, add Weak to Snake Strike, NEW Dagger minion (Stab→Explode→die) |

**JR builds:** Dagger lifecycle (2-turn entity), escalating Multi-Stab counter

---

### JR-03d: Automaton Boss (P1, L)

**Depends on:** BE-18 (Artifact buff)

**Simplified for Sprint 7:** Ship Automaton WITHOUT Bronze Orbs. Core boss only.

| Move | Effect |
|------|--------|
| Flail | 7x2 damage |
| Boost | +3 Strength, 9 block |
| Hyper Beam | 45 damage |
| Stunned | Does nothing (recovery) |

Fixed cycle: Flail → Boost → Flail → Boost → Hyper Beam → Stunned → repeat.
Starts with Artifact 3.

**Bronze Orbs + Stasis deferred to Sprint 8.** The boss is interesting enough with the Hyper Beam cycle and Artifact.

---

### VARROW-02: Event Rewrite — Pattern Glitches (P0, M)

Rewrite 10 existing events. Mechanical choices unchanged. Events become "pattern glitches" in the Endless War.

**Constraint:** No new choice branches or mechanical variations. Same gameplay effects, new narrative framing.

**Files:** `src/data/events.js`, potentially `src/data/flavorText.js`

---

### BE-19: Encounter Weighting (P1, S)

Implement DEC-017: weighted encounter pools for Act 2.
- Normal: 60% common, 30% uncommon, 10% rare
- Elite: 50/50 split
- Boss: Automaton only (single Act 2 boss)

**Files:** `src/data/encounters.js` or `src/utils/mapGenerator.js`

---

### AR-05a: Touch Targets (P1, S)

Week 1: Audit non-combat screens (map, shop, rewards, rest, settings).
Week 2+: Apply fixes to combat screens after UX-13 layout settles.

Agree on 44px minimum standard with UX upfront.

---

### QA-08a: Act 2 Enemy Testing (P1, M)

Test all corrected/new enemies: AI patterns, new systems (Plated Armor, Confused, Artifact, minion lifecycle), moveset verification, edge cases.

Review JR-03a PR early to establish test patterns before batch 2-3 land.

---

### QA-08b: Combat Viewport Testing (P1, S)

Test combat redesign on desktop (1920x1080) AND mobile (390x844). No clipping, no overflow, touch targets functional, desktop drag preserved.

---

## Phase Ordering

**Week 1 (Foundation + Independent Work):**
- GD-08 (style guide — must land first 2-3 days)
- BE-18 (enemy systems — unblocks JR)
- VARROW-02 (event rewrite — no dependencies)
- AR-05a audit (non-combat screens)

**Week 2 (Mobile Combat + Enemies Start):**
- UX-13a (collapsible HUD + zones — uses style guide)
- JR-03a (Centurion, Mystic, Snecko — uses BE-18 Confused)
- JR-03b (Chosen, Shelled Parasite, Byrd — uses BE-18 Plated Armor, Lifesteal)

**Week 3 (More Content + Polish):**
- UX-13b (card fan + tap-to-play — after UX-13a)
- UX-13c (long-press + inline info — after UX-13a)
- JR-03c (elites + Dagger minion)
- AR-05a fixes (combat screens — after UX-13 layout)
- BE-19 (encounter weighting)

**Week 4 (Boss + Testing):**
- JR-03d (Automaton — uses BE-18 Artifact)
- QA-08a (enemy testing — after JR tasks)
- QA-08b (viewport testing — after UX-13)

---

## Dependencies

```
GD-08 → UX-13a/b/c
BE-18 → JR-03a (Confused), JR-03b (Plated Armor, Lifesteal), JR-03d (Artifact)
UX-13a → UX-13b, UX-13c, AR-05a (combat screens), QA-08b
JR-03a → JR-03b → JR-03c → JR-03d
JR-03a/b/c/d + UX-13 → QA-08a, QA-08b
VARROW-01 (Sprint 6) → VARROW-02
```

---

## Explicitly NOT in Sprint 7

- UX-14 (mobile map) — deferred to Sprint 8
- BE-09 (Neow / starting bonus) — deferred to Sprint 8
- Bronze Orbs + Stasis card-steal — deferred to Sprint 8
- Enemy flavor text — deferred to Sprint 8 (with VARROW-03)
- Full mobile landscape support — commit to portrait-only for 1.0
- Title screen — Sprint 8
- SFX expansion — Sprint 8

---

## Validation Gate

Before Sprint 7 close:
- [ ] Combat screen playable on 390x844 mobile viewport
- [ ] No card clipping or horizontal overflow
- [ ] All touch targets >= 44px
- [ ] 9 Act 2 enemies functional with correct AI (Centurion through Reptomancer)
- [ ] Automaton boss functional (without Bronze Orbs)
- [ ] 10 events reflect Endless War theme
- [ ] Win rate 15-25% for Act 2 clears
- [ ] `npm run validate` passes
- [ ] Full game playthrough A0 + A1 without crashes
- [ ] Diaries updated for all active roles

---

## Capacity Summary

| Role | Tasks | Load |
|------|-------|------|
| **BE** | BE-18 (M), BE-19 (S) | Normal |
| **UX** | UX-13a (M), UX-13b (M), UX-13c (S) | Full — focused on one track |
| **JR** | JR-03a-d (M+M+M+L) | Full — sequential pipeline |
| **Varrow** | VARROW-02 (M) | Normal |
| **GD** | GD-08 (S), GD-audit (S, stretch) | Light |
| **AR** | AR-05a (S) | Light |
| **QA** | QA-08a (M), QA-08b (S) | Normal |

---

## Team Feedback Summary

**Mentor:** "30% overscoped. Cut UX-14, BE-09. Extract BE systems. Separate Automaton. Defer Stasis."
**BE:** "I can handle Plated Armor + Confused + Artifact + Lifesteal + Encounter Weighting. Stasis should be deferred."
**UX:** "Split UX-13 into 3. Need GD-08 first. Card fan is the riskiest item. Fallback: simpler horizontal scroll."
**JR:** "Both original tasks are undersized. Need 4 tasks. Automaton must be separate. BE systems must exist first."
**AR:** "Wait for UX-13 before fixing combat touch targets. Do non-combat audit in Week 1."
**QA:** "Split into enemy testing + viewport testing. Review JR-03a early to establish patterns."
**GD:** "GD-08 should be P0. One-page doc — can ship in 2 days."
**Varrow:** "M is right for 10 events. Hold the line on 'mechanical choices unchanged.'"

---

*Sprint 7 Plan — Team-aligned, Mentor-approved.*
*Changes from draft: -30% scope (UX-14, BE-09, Stasis deferred), +BE systems prerequisite, +task splits.*
