# Sprint 14 Plan: Audio Fix + Real Sounds + Art Quality + Fourth Character Prep

**Created:** 2026-02-01
**Goal:** Fix the broken audio system (P0 — zero sound output for 7 sprints), replace all placeholder MP3s with real CC0 sounds, improve art fidelity, and begin fourth character groundwork.
**Integration Branch:** `sprint-14`
**Status:** PLANNED

---

## Sprint 13 Outputs Feeding This Sprint

- **Sprint 13 complete:** 15/15 tasks (sixth consecutive 100% sprint)
- **2627 tests** passing across 54+ test files
- **Score trajectory:** 58 → 85 → 93 → targeting 97+
- **Content:** 3 characters (Ironclad, Silent, Defect), 4 acts, 157 cards, 45+ enemies
- **CRITICAL BUG:** Audio completely non-functional at runtime. Reported P0 in Sprint 11, again in Sprint 13. Seven sprints of audio work (AR-04, AR-06, AR-07, AR-09, AR-11, AR-12, AR-14) produce zero sound output. Players hear nothing.
- **CRITICAL BUG:** All 20+ sound files are copies of the same placeholder MP3 (boss_intro.mp3). Even if audio worked, players would hear one sound repeated.
- **Remaining gap to 100:** Art fidelity (-3), cloud save addressed (AR-13), QoL addressed (UX-26/27/28)

---

## Task Overview

### P0 — Must Ship

| Task | Owner | Size | Description |
|------|-------|------|-------------|
| **PM-14** | PM | S | Merge Sprint 13 to master, create sprint-14 branch, draft PR |
| **FIX-10** | AR/BE | M | **P0 BUG:** Audio system produces zero output. Investigate and fix: browser autoplay policy, audio preloading initialization, broken file paths, audioSystem.js not wired to game events at runtime. Must verify in both dev and production (GitHub Pages). This blocks ALL further audio work. |
| **AR-15** | AR | L | Replace all placeholder MP3s with real CC0 sounds. Currently 20+ sound IDs all point to copies of boss_intro.mp3. Source real CC0 audio from freesound.org or similar. Minimum: 7 music tracks + 15 distinct SFX (card play, damage, block, heal, poison, shiv, lightning, frost, dark, plasma, boss intro, victory, defeat, heartbeat, phase transition). |
| **GD-24** | GD | M | Art quality pass — improve 10 most-visible card illustrations. Focus on Ironclad starter cards (Strike, Defend, Bash) and most-played commons. Replace AI placeholder style with higher-quality generated art. |
| **GD-25** | GD | M | Enemy art quality pass — improve 5 Act 1 boss and elite sprites (Slime Boss, The Guardian, Hexaghost, Gremlin Nob, Lagavulin). These are the most-seen enemies and have highest visual impact. |

### P1 — Should Ship

| Task | Owner | Size | Description |
|------|-------|------|-------------|
| **BE-28** | BE | M | Audio system overhaul — refactor audioSystem.js for reliability. Proper initialization lifecycle, browser autoplay policy handling (resume AudioContext on first user interaction), error recovery, volume controls that work, preload strategy. Depends on FIX-10 diagnosis. |
| **UX-29** | UX | M | Audio settings UX — volume sliders that produce audible feedback. Music/SFX separate controls. Mute toggle. Visual indicator when audio is playing. Test that settings actually affect output. |
| **QA-21** | QA | M | Audio regression tests — verify all 7 music tracks load and can play, all 15+ SFX trigger on correct game events, volume controls work, mute works, crossfade works. Integration tests against real audio files. |
| **JR-13** | JR | M | Card balance pass — review all 157 cards across 3 characters. Identify and fix outliers from QA-19 balance data. Focus on Defect orb cards (newest, least tested in real play). |
| **VARROW-10** | Varrow | S | Fourth character concept — design document for an original fourth character. Theme, mechanic identity, 5 sample card concepts, narrative hook in Endless War framing. NOT implementation — design only. |
| **UX-30** | UX | S | Updated self-assessment — re-score against Game Zone rubric post-audio fix and art improvements. Target: 97+. |

### P2 — Stretch

| Task | Owner | Size | Description |
|------|-------|------|-------------|
| **GD-26** | GD | S | Background art differentiation — unique background illustrations for each act (currently CSS color shifts only). 4 atmospheric backgrounds. |
| **AR-16** | AR | S | Audio ambient layer — subtle ambient sound loops per act (dungeon drips, wind, mechanical hum, heartbeat). Layered under music. |
| **QA-22** | QA | S | Validation gate ceremony — check off all unchecked gate items from Sprints 9-13. Document evidence for each. Process debt cleanup. |

---

## Delivery Order

### Week 1: Audio Emergency Fix
1. **PM-14** — Sprint setup
2. **FIX-10** — Audio system investigation and fix (BLOCKS everything audio)
3. **BE-28** — Audio system overhaul (depends on FIX-10 diagnosis)
4. **GD-24** — Card art quality pass (independent)
5. **GD-25** — Enemy art quality pass (independent)

### Week 2: Real Sounds + Balance
6. **AR-15** — Replace placeholder MP3s with real CC0 sounds (depends on FIX-10)
7. **UX-29** — Audio settings UX (depends on BE-28)
8. **JR-13** — Card balance pass (independent)
9. **VARROW-10** — Fourth character concept (independent)

### Week 3: Validate + Polish
10. **QA-21** — Audio regression tests (depends on AR-15)
11. **UX-30** — Updated self-assessment
12. **GD-26** — Background art (stretch)
13. **AR-16** — Ambient audio (stretch, depends on AR-15)
14. **QA-22** — Validation gate ceremony (stretch)

---

## Dependencies

```
FIX-10 ──→ BE-28 ──→ UX-29
  │
  └──→ AR-15 ──→ QA-21
                  │
                  └──→ AR-16 (stretch)

GD-24  (independent)
GD-25  (independent)
JR-13  (independent)
VARROW-10 (independent)
UX-30  (depends on audio + art completion)
GD-26  (independent)
QA-22  (independent)
```

## Validation Gate

- [ ] Audio plays in both dev server and production (GitHub Pages)
- [ ] All 7 music tracks are distinct, real audio files (not copies)
- [ ] All 15+ SFX are distinct, real audio files (not copies)
- [ ] Music transitions between game phases (menu → map → combat → boss)
- [ ] Volume controls actually change volume
- [ ] Mute button silences all audio
- [ ] 10 card illustrations visually improved over Sprint 13
- [ ] 5 enemy sprites visually improved over Sprint 13
- [ ] Card balance: no single card has >60% pick rate or <5% pick rate
- [ ] Fourth character concept document exists with clear identity
- [ ] 2700+ tests passing
- [ ] `npm run validate` passes
- [ ] Self-assessment score: targeting 97+

---

## Addressing the Remaining Gap

| Gap | Sprint 14 Task | Points Expected |
|-----|----------------|-----------------|
| Art fidelity (-3 from 93) | GD-24 card art + GD-25 enemy art + GD-26 backgrounds | +2 (Presentation 9→10 realistic with focused improvements) |
| Audio non-functional (hidden -2) | FIX-10 + BE-28 + AR-15 | +2 (Presentation score was inflated — audio never worked) |
| Balance/polish (-2) | JR-13 balance + UX-29 audio UX + QA-21 regression | +1 |

**Honest reassessment:** The self-assessed 93/100 score included "Audio working" in the Presentation category, but audio has NEVER worked at runtime. The real score is likely closer to 88-90. Sprint 14's audio fix is the single highest-impact improvement available.

---

*Sprint 14 Plan v1.0 — PM*
*Focus: Fix the audio system. Replace placeholder sounds. Improve art. Be honest about the score.*
