# Sprint 13 Plan: Score 100 — Cloud Save, Compendium, Third Character, Polish

**Created:** 2026-02-01
**Goal:** Close the remaining 7-point gap from 93 to 100. Ship cloud-compatible save export/import, card compendium, in-game pause menu, landscape support, and begin The Defect (third character). Fix poison vs invincible shield bug.
**Integration Branch:** `sprint-13`
**Status:** PLANNED — Pending team alignment

---

## Sprint 12 Outputs Feeding This Sprint

- **Sprint 12 complete:** 15/15 tasks (fifth consecutive 100% sprint)
- **2366 tests** passing across 51 test files
- **Score trajectory:** 58 → 85 → 93/100
- **All 18/18 Game Zone complaints resolved**
- **Known bug:** Poison bypasses invincible shield (Heart)
- **What Separates 93 from 100** (from SELF_ASSESSMENT.md):
  1. Art fidelity (-3) — AI art placeholder style
  2. Cloud save (-2) — localStorage-only, progress lost on browser clear
  3. QoL extras (-2) — compendium, in-game pause, landscape, third character

---

## Task Overview

### P0 — Must Ship

| Task | Owner | Size | Description |
|------|-------|------|-------------|
| **PM-13** | PM | S | Merge Sprint 12 to master, create sprint-13 branch, draft PR |
| **FIX-09** | BE | S | **P1 BUG:** Poison bypasses invincible shield — endTurnAction.js reduces HP directly without going through `applyDamageToTarget`, skipping Heart's invincible shield. Fix to route poison through damage pipeline. |
| **AR-13** | AR | M | Save export/import — JSON export to clipboard or file download, import from file. Enables manual backup and cross-device transfer without a backend. |
| **UX-26** | UX | M | Card compendium — browsable collection of all discovered cards across runs. Track which cards have been seen/played. Accessible from title screen. |
| **UX-27** | UX | M | In-game pause menu — accessible during combat and map. Settings (volume, animation speed, text size), save & quit, deck viewer, run stats. Replaces need to return to title for settings. |
| **JR-12a** | JR | L | The Defect — 30 card pool (Orbs: Lightning, Frost, Dark, Plasma. Focus/Evoke mechanics). Core orb system implementation. |

### P1 — Should Ship

| Task | Owner | Size | Description |
|------|-------|------|-------------|
| **JR-12b** | JR | M | The Defect — starter deck, character selection integration, orb slot UI |
| **BE-27** | BE | M | Orb system infrastructure — orb slots, passive/evoke triggers, Focus scaling, channel/evoke actions in reducer |
| **VARROW-09** | Varrow | M | Defect narrative — "The machine that remembers." Character-specific flavor, boss dialogue variants, Endless War perspective of a construct gaining consciousness |
| **GD-22** | GD | M | Defect art — character portrait, combat silhouette, 30 card illustrations, orb visuals (Lightning/Frost/Dark/Plasma), sprite sheet rebuild |
| **QA-19** | QA | M | Defect regression + balance — 30 cards, orb mechanics, character selection, win rate targets. Full 3-character regression. |
| **UX-28** | UX | S | Landscape mode — responsive layout that works in landscape orientation on tablets and phones. Key screens: combat, map, reward selection. |

### P2 — Stretch

| Task | Owner | Size | Description |
|------|-------|------|-------------|
| **AR-14** | AR | S | Defect audio — Orb channel/evoke SFX (lightning zap, frost crackle, dark pulse, plasma hum). 4-6 new CC0 sounds. |
| **GD-23** | GD | S | Art polish pass — identify and replace 5 lowest-quality AI sprites with improved versions. Focus on most-seen enemies (Act 1 normals, Act 1 bosses). |
| **QA-20** | QA | S | Save export/import regression — round-trip testing, corrupt file handling, cross-version compatibility |

---

## Delivery Order

### Week 1: Foundation + Bug Fix
1. **PM-13** — Sprint setup
2. **FIX-09** — Poison vs shield bug fix (unblocks Heart integrity)
3. **BE-27** — Orb system infrastructure (unblocks JR-12a)
4. **AR-13** — Save export/import
5. **UX-27** — In-game pause menu

### Week 2: Defect + Compendium
6. **JR-12a** — Defect card pool (depends on BE-27)
7. **JR-12b** — Defect integration (depends on JR-12a)
8. **UX-26** — Card compendium
9. **VARROW-09** — Defect narrative
10. **GD-22** — Defect art

### Week 3: Polish + Validate
11. **UX-28** — Landscape mode
12. **QA-19** — Defect regression
13. **AR-14** — Defect audio (stretch)
14. **GD-23** — Art polish pass (stretch)
15. **QA-20** — Save export regression (stretch)

---

## Dependencies

```
BE-27 ──→ JR-12a ──→ JR-12b ──→ QA-19
                       │
                       └──→ GD-22 (art for cards/orbs)
                       └──→ VARROW-09 (narrative)
                       └──→ AR-14 (audio)

FIX-09 (independent)
AR-13  (independent)
UX-26  (independent)
UX-27  (independent)
UX-28  (independent)
GD-23  (independent)
QA-20  (depends on AR-13)
```

## Validation Gate

- [ ] Poison correctly blocked by Heart's invincible shield
- [ ] Save export produces valid JSON, import restores full game state
- [ ] Card compendium shows all discovered cards, accessible from title screen
- [ ] In-game pause menu accessible during combat and map with settings
- [ ] The Defect playable with 30-card orb-based pool through all 4 acts
- [ ] Orb system functional (channel, evoke, Focus scaling, passive triggers)
- [ ] Landscape mode usable on tablet-width screens
- [ ] Character selection shows 3 characters
- [ ] Defect win rate: 20-30% at A0
- [ ] 2600+ tests passing
- [ ] `npm run validate` passes
- [ ] Self-assessment score: targeting 97+

---

## Addressing the 93→100 Gap

| Gap (from SELF_ASSESSMENT.md) | Sprint 13 Task | Points Recovered |
|------|----------------|-----------------|
| Art fidelity (-3) | GD-23 art polish pass | +1 (incremental) |
| Cloud save (-2) | AR-13 export/import | +2 |
| QoL extras (-2) | UX-26 compendium, UX-27 pause menu, UX-28 landscape, JR-12a/b Defect | +2 |
| Third character (content depth) | JR-12a/b + BE-27 The Defect | +2 (gameplay depth) |

---

*Sprint 13 Plan v1.0 — PM*
*Focus: Close every gap. Leave nothing on the table.*
