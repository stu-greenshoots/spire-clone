# Sprint 12 Plan: The Heart + Endgame + Score 90+

**Created:** 2026-02-01
**Goal:** Add the true final boss (The Corrupt Heart), boss dialogue rendering, animated enemy sprites for key bosses, and final polish to push past 90/100. Process improvements from Sprint 11 retro.
**Integration Branch:** `sprint-12`
**Status:** PLANNED — Pending team alignment

---

## Sprint 11 Outputs Feeding This Sprint

- **Sprint 11 complete:** 16/16 tasks (fourth consecutive 100% sprint)
- **2248 tests** passing across 49 test files
- **Two playable characters:** Ironclad + The Silent (full card pools, narrative, art, audio)
- **All 18 original Game Zone complaints resolved** (skip-reward was the last one)
- **Self-assessed score trajectory:** 58 → 85 → likely 90+ with Sprint 11 features
- **Sprint 11 → master merge:** Done (PM-12)

### Remaining Gaps to 90+ (from SELF_ASSESSMENT.md)

| Gap | Status | Sprint 12 Task |
|-----|--------|----------------|
| Heart / true final boss | NOT BUILT | BE-25, JR-10, VARROW-07 |
| Boss dialogue not rendered in UI | KNOWN BUG | UX-24 |
| Animated enemy sprites (key bosses) | NOT BUILT | GD-19 |
| Diary hygiene enforcement | PROCESS GAP | PM-12 |
| SL role archival | HOUSEKEEPING | PM-12 |
| Updated self-assessment for 90+ | NEEDED | UX-25 |

---

## Task Overview

### P0 — Must Ship

| Task | Owner | Size | Description |
|------|-------|------|-------------|
| **PM-12** | PM | S | Merge Sprint 11 to master, create sprint-12 branch, archive SL diary, enforce diary updates |
| **BE-25** | BE | M | Heart boss infrastructure — Act 4 single-floor map node after Act 3 boss, Heart encounter trigger, invincible phase mechanic (200 HP shield that must break before damage), multi-hit attack pattern |
| **JR-10** | JR | M | Heart boss implementation — The Corrupt Heart enemy with 750 HP, Beat of Death passive (1 damage per card played), phase transitions, scaling multi-attack pattern. Based on StS Heart mechanics, adapted. |
| **VARROW-07** | Varrow | M | Heart narrative — "The core of the loop. The thing that won't let you stop." Intro dialogue, phase transition text, death/victory text. Ties the Endless War to its source. |
| **UX-24** | UX | M | Boss dialogue rendering — BossDialogue component exists in data but is never rendered. Wire into combat screen for boss encounters. Show intro on encounter start, mid-fight on phase transitions, death on defeat. |
| **GD-19** | GD | M | Animated boss sprites — CSS sprite animations for 3 key bosses (Hexaghost pulse, Awakened One phase shift, Heart beat). 3-4 frame idle loops. Sprite sheet integration. |

### P1 — Should Ship

| Task | Owner | Size | Description |
|------|-------|------|-------------|
| **BE-26** | BE | S | Heart unlock gate — Heart only accessible after winning with both Ironclad and Silent. Track character wins in meta-progression. |
| **QA-17** | QA | M | Heart regression + full endgame balance — Heart encounter tests, Act 4 flow, 4-act playthrough at A0 and A5. Win rate target: 5-15% for Heart kills at A0. |
| **AR-12** | AR | S | Heart audio — heartbeat ambient loop during Heart fight, unique SFX for Beat of Death passive, phase transition sound. 3-4 new CC0 sounds. |
| **GD-20** | GD | S | Heart art — Heart enemy sprite (pulsing core design), Act 4 background theme. Dark red/black palette. |
| **JR-11** | JR | S | Heart-specific card interactions — Ensure all 60+ cards (Ironclad + Silent) interact correctly with Heart mechanics (Beat of Death, invincible phase, multi-hit). Edge case audit. |
| **UX-25** | UX | S | Updated self-assessment — Re-score against Game Zone rubric with Heart, boss dialogue, animated sprites. Target 90+. |

### P2 — Stretch

| Task | Owner | Size | Description |
|------|-------|------|-------------|
| **VARROW-08** | Varrow | S | Heart-specific character dialogue — different Heart encounter text for Ironclad vs Silent. "The warrior who won't stop fighting" vs "The shadow that keeps returning." |
| **QA-18** | QA | S | Diary hygiene automation — pre-commit hook or CI check that warns if diary hasn't been updated in current sprint. |
| **GD-21** | GD | S | Act differentiation backgrounds — subtle background color/texture shift between Acts 1-4 on map and combat screens. |

---

## Delivery Order

### Week 1: Foundation
1. **PM-12** — Sprint setup, diary enforcement, SL archival
2. **BE-25** — Heart infrastructure (Act 4 map, encounter system)
3. **GD-20** — Heart art (needed before JR-10 can visualize)
4. **UX-24** — Boss dialogue rendering (unblocks narrative visibility)

### Week 2: Content
5. **JR-10** — Heart boss implementation (depends on BE-25)
6. **VARROW-07** — Heart narrative (can parallel with JR-10)
7. **AR-12** — Heart audio
8. **GD-19** — Animated boss sprites
9. **BE-26** — Heart unlock gate (depends on BE-25)
10. **JR-11** — Card interaction audit (depends on JR-10)

### Week 3: Polish & Validate
11. **QA-17** — Full endgame regression
12. **UX-25** — Updated self-assessment
13. **VARROW-08** — Character-specific Heart dialogue (stretch)
14. **QA-18** — Diary automation (stretch)
15. **GD-21** — Act backgrounds (stretch)

---

## Dependencies

```
BE-25 ──→ JR-10 ──→ JR-11
  │                    │
  └──→ BE-26          QA-17

UX-24 (independent — wire existing data)
GD-20 ──→ GD-19 (Heart sprite needed before animation)
VARROW-07 (independent — parallel with JR-10)
AR-12 (depends on JR-10 for testing)
```

## Validation Gate

- [ ] Heart boss encounter functional (750 HP, Beat of Death, phase transitions)
- [ ] Act 4 accessible after Act 3 boss defeated
- [ ] Heart locked behind both-character-wins requirement
- [ ] Boss dialogue renders in combat for all boss encounters
- [ ] At least 3 bosses have idle sprite animations
- [ ] Heart has unique audio (heartbeat loop, Beat of Death SFX)
- [ ] Full 4-act playthrough at A0 and A5 without crashes
- [ ] Heart win rate: 5-15% at A0
- [ ] All 60+ cards tested against Heart mechanics
- [ ] 2400+ tests passing
- [ ] `npm run validate` passes
- [ ] Self-assessment score: 90+/100

---

## Process Improvements (from Sprint 11 Retro)

1. **Diary updates mandatory** — Each PR must include diary update or PM will request changes
2. **SL.md archived** — Header updated to "ARCHIVED — Replaced by Varrow in Sprint 6"
3. **Stale diary headers fixed** — All diaries updated to current sprint context
4. **Validation gate ceremony** — PM formally checks each gate item before sprint close

---

*Sprint 12 Plan v1.0 — PM*
*Focus: The Heart is the endgame. Make it worth reaching.*
