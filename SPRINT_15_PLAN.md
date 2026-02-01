# Sprint 15 Plan: The Watcher + Art Quality → Score 100

**Created:** 2026-02-01
**Sprint Branch:** `sprint-15`
**Base:** `master` (post Sprint 14 merge)
**Goal:** Implement The Watcher (fourth character) and improve art fidelity to close the remaining 3-point gap from 97 to 100/100.

---

## Score Gap Analysis (from UX-30 Self-Assessment)

| Gap | Points | Solution |
|-----|--------|----------|
| Art fidelity — AI art recognizably AI | -2 | Art quality passes on key visible assets, consistent style guide enforcement |
| Content depth — fourth character missing | -1 | Implement The Watcher with 30-card stance pool |
| **Total remaining** | **-3** | |

---

## Sprint 15 Tasks (15 tasks)

### P0 — Must Ship (6 tasks)

| Task | Owner | Size | Description |
|------|-------|------|-------------|
| **PM-15** | PM | S | Merge Sprint 14 to master, create sprint-15 branch, draft PR |
| **BE-29** | BE | M | Stance system infrastructure — stance state in combat reducer, entry/exit events, damage multipliers (Wrath 2×, Divinity 3×), Mantra counter triggering Divinity at 10 |
| **JR-14a** | JR | L | The Watcher — 30 card pool batch 1 (15 cards): starters (Eruption, Vigilance), common attacks/skills with stance interactions, Halt, Empty Mind |
| **JR-14b** | JR | L | The Watcher — 30 card pool batch 2 (15 cards): uncommon/rare cards, Worship (Mantra), Scrying mechanic, Retain cards, stance-conditional effects |
| **JR-14c** | JR | M | The Watcher — starter deck, character selection integration, starter relic (Pure Water: Miracle card) |
| **VARROW-11** | Varrow | M | Watcher narrative — character-specific flavor text, boss dialogue variants for all bosses, defeat/victory text in Endless War voice (from concept doc) |

### P1 — Should Ship (6 tasks)

| Task | Owner | Size | Description |
|------|-------|------|-------------|
| **GD-27** | GD | M | Watcher art — portrait, combat silhouette, 30 card illustrations, stance visual indicators, sprite sheet rebuild |
| **GD-28** | GD | M | Art consistency pass — re-render 10 most inconsistent sprites (enemy + card) to match unified style guide (GD-08) |
| **UX-31** | UX | M | Stance UI — current stance indicator in combat HUD, stance entry/exit visual feedback, Mantra progress display, Wrath danger glow |
| **QA-23** | QA | M | Watcher regression + balance — 30 cards, stance mechanics, Mantra/Divinity, 4-character regression, win rate targeting 20-30% A0 |
| **AR-17** | AR | S | Watcher audio — stance transition SFX (calm chime, wrath percussion, divinity resonance), Mantra accumulation tick |
| **BE-30** | BE | S | Scrying system — look at top N cards of draw pile, choose which to discard. Used by Watcher cards (Third Eye, Scrawl, etc.) |

### P2 — Stretch (3 tasks)

| Task | Owner | Size | Description |
|------|-------|------|-------------|
| **GD-29** | GD | S | Key card art re-render — 5 highest-visibility cards (Strike, Defend, Bash, Neutralize, Zap) with improved quality |
| **UX-32** | UX | S | Final self-assessment — honest re-score targeting 100/100 post-Watcher and art improvements |
| **QA-24** | QA | S | Deploy smoke test — automated check that audio plays, assets load, and game boots on GitHub Pages URL |

---

## Delivery Order

### Phase A: Infrastructure (BE-29, BE-30 first)
1. **PM-15** — Sprint setup (this document)
2. **BE-29** — Stance system must exist before cards can reference it
3. **BE-30** — Scrying system for Watcher card pool

### Phase B: Content (JR-14a/b/c, VARROW-11, GD-27, AR-17 in parallel)
4. **JR-14a** — First 15 cards (depends on BE-29)
5. **JR-14b** — Remaining 15 cards (depends on BE-29, BE-30)
6. **JR-14c** — Character integration (depends on JR-14a)
7. **VARROW-11** — Narrative (can start in parallel with JR)
8. **GD-27** — Watcher art (can start in parallel)
9. **AR-17** — Watcher audio (can start after BE-29 defines stance events)

### Phase C: Polish + QA (UX-31, GD-28, QA-23)
10. **UX-31** — Stance UI (depends on BE-29)
11. **GD-28** — Art consistency pass (independent)
12. **QA-23** — Full regression (depends on all Watcher tasks)

### Phase D: Stretch
13. **GD-29** — Key card art re-render
14. **UX-32** — Final self-assessment
15. **QA-24** — Deploy smoke test

---

## Dependencies

```
BE-29 (stances) ──┬── JR-14a (cards batch 1) ── JR-14c (character integration)
                  ├── JR-14b (cards batch 2) ── (also needs BE-30)
                  ├── UX-31 (stance UI)
                  └── AR-17 (stance audio)

BE-30 (scrying) ──── JR-14b (cards using scrying)

JR-14a + JR-14b + JR-14c ──── QA-23 (regression)
```

---

## Validation Gate (Sprint 15)

- [ ] Stance system functional (Calm → energy on exit, Wrath → 2× damage, Divinity → 3× + 3 energy)
- [ ] Mantra accumulates across turns, triggers Divinity at 10
- [ ] Scrying mechanic works (view top N, discard chosen)
- [ ] 30 Watcher cards implemented with stance interactions
- [ ] Character selection shows 4 characters
- [ ] The Watcher playable through all 4 acts
- [ ] Watcher starter relic (Pure Water / Miracle) functional
- [ ] Boss dialogue variants for Watcher
- [ ] Watcher art: portrait, silhouette, 30 card illustrations
- [ ] Stance UI indicator visible in combat
- [ ] Watcher-specific SFX for stance transitions
- [ ] Art consistency improved (10 re-rendered assets)
- [ ] 2800+ tests passing
- [ ] `npm run validate` passes
- [ ] Watcher win rate: 20-30% at A0
- [ ] Self-assessment score: targeting 100/100

---

## Risk Assessment

| Risk | Mitigation |
|------|-----------|
| Stance damage multipliers create balance issues | QA-23 balance pass with simulator, tune individual card numbers |
| Divinity too powerful / too rare | Calibrate Mantra generation across card pool; test with 1000-run simulator |
| 30 cards is tight sprint for JR | Split into two batches (JR-14a, JR-14b) with clear priority order |
| Scrying UI complexity | Keep simple: modal showing N cards with discard checkboxes |

---

*Sprint 15 is the capstone sprint — if successful, Spire Ascent achieves a perfect 100/100 self-assessment with 4 playable characters, working audio, polished art, and complete roguelike gameplay across 4 acts.*
