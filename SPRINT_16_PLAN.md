# Sprint 16 Plan: Endless Mode, Custom Runs, Performance & QoL

**Date:** 2026-02-01
**Sprint:** 16
**Branch:** `sprint-16`
**Previous:** Sprint 15 COMPLETE (17/17 tasks, 3072 tests, 100/100 score, 4 characters)
**Theme:** Player retention — give players reasons to keep playing after they've beaten the Heart.

---

## Strategic Context

The game is feature-complete at 100/100. Four characters, four acts, daily challenges, full audio, polished art. What's missing is **long-term player retention**: endless mode, custom seeded runs, performance optimization (1.2MB main chunk), and quality-of-life features that reward mastery.

### Sprint 16 Priorities
1. **Endless Mode** — Infinite scaling after Act 4 for players who want to push limits
2. **Custom Seeded Runs** — Player-initiated seeded games beyond daily challenge
3. **Performance** — Code-split the 1.2MB main bundle, reduce precache bloat (13MB)
4. **Content QoL** — Relic/potion compendium, achievement notifications, character-specific relics
5. **Smart Card Targeting** — Deferred since Sprint 6, long overdue

---

## P0 — Must Ship

| Task | Owner | Size | Description |
|------|-------|------|-------------|
| PM-16 | PM | S | Merge Sprint 15 to master, create sprint-16 branch, draft PR |
| BE-31 | BE | M | Endless mode infrastructure — post-Heart looping with scaling HP/damage, floor counter, no win condition |
| UX-33 | UX | M | Endless mode UI — floor counter, difficulty indicator, run stats overlay, death screen with stats |
| BE-32 | BE | S | Custom seeded runs — player-entered seed input, seed display on run history, shareable seed codes |
| JR-15 | JR | M | Character-specific relics — 3 new relics per character (12 total) that synergize with character mechanics |
| UX-12 | UX | S | Smart card targeting — non-enemy cards playable without dragging to enemy (deferred since Sprint 6) |

## P1 — Should Ship

| Task | Owner | Size | Description |
|------|-------|------|-------------|
| BE-33 | BE | M | Bundle code-splitting — break 1.2MB index chunk into game systems, data, and UI chunks |
| GD-30 | GD | M | Relic & potion compendium — browsable collection screen (like card compendium) with discovery tracking |
| VARROW-12 | Varrow | M | Endless mode narrative — escalating "loop dissolution" text, floor milestone dialogue, unique death text |
| QA-25 | QA | M | Endless mode regression + balance — scaling curves, floor 100+ stability, character balance in endless |
| AR-18 | AR | S | Endless mode audio — escalating ambient intensity, milestone fanfare, new death SFX for endless |

## P2 — Stretch

| Task | Owner | Size | Description |
|------|-------|------|-------------|
| UX-34 | UX | S | Achievement notification toasts — in-game popups when achievements unlock (currently silent) |
| QA-26 | QA | S | Performance regression — bundle size gate (<1.5MB per chunk), Lighthouse 90+ after code-split |
| GD-31 | GD | S | Endless mode visual escalation — background color/intensity shifts every 10 floors beyond Act 4 |

---

## Task Details

### PM-16: Sprint Setup
Create sprint-16 branch, draft PR, update board. Standard PM sprint infrastructure.

### BE-31: Endless Mode Infrastructure (M)
After defeating the Heart, players can choose to continue into an infinite loop:
- Floors restart from Act 1 structure but with scaling modifiers
- Enemy HP and damage scale +10% per loop (configurable)
- Elite frequency increases each loop
- Boss pool rotates through all bosses
- No win condition — run until death
- Floor counter persists (e.g., "Floor 67")
- Score accumulates based on floors cleared, elites killed, damage dealt

### BE-32: Custom Seeded Runs (S)
Extend the daily challenge seed system to support player-entered seeds:
- Seed input field on character select
- Display seed on run history entries
- Seeds are shareable text strings
- Same seed + same character = same map/encounters/rewards
- No modifiers (unlike daily challenge) — pure seeded standard run

### BE-33: Bundle Code-Splitting (M)
The main index chunk is 1.2MB (579KB gzipped). Split into:
- Core game engine (reducers, systems, combat)
- Data layer (cards, enemies, relics, events, potions)
- UI components (lazy-load non-critical screens)
- Audio system (separate chunk, loaded on demand)
Target: no single chunk >500KB uncompressed.

### JR-15: Character-Specific Relics (M)
12 new relics (3 per character) that only appear for their character:
- **Ironclad:** Strength/exhaust/HP synergies
- **Silent:** Poison/shiv/discard synergies
- **Defect:** Orb/focus/channel synergies
- **Watcher:** Stance/mantra/scry synergies
Adds build diversity and character identity to relic pool.

### UX-12: Smart Card Targeting (S)
Cards that don't target enemies (skills, powers) should be playable with a single click/tap instead of requiring drag-to-play. Only attack cards targeting a specific enemy need the drag interaction. Deferred from Sprint 6, then Sprint 7.

### GD-30: Relic & Potion Compendium (M)
Mirror the card compendium (UX-26) for relics and potions:
- Browsable grid with icon art
- Discovery tracking (greyed out until found)
- Tooltip with description, rarity, source
- Filter by rarity, character, discovered/undiscovered
- Accessible from title screen collection menu

### VARROW-12: Endless Mode Narrative (M)
The loop dissolution deepens as floors climb:
- Every 10 floors: brief text about the war unraveling further
- Floor milestones (50, 100): significant narrative beats
- Unique endless death text — "You held on for X floors. The war forgets your name."
- Boss dialogue shifts subtly in later loops — they begin to recognize you

### QA-25: Endless Mode Regression (M)
- Verify scaling curves feel fair (not instant death, not trivial)
- Floor 100+ stability test (no memory leaks, state doesn't bloat)
- All 4 characters viable in endless (win rate parity at floor milestones)
- Seeded run reproducibility verification
- Balance: target median death around floor 60-80 on loop 1 at A0

### AR-18: Endless Mode Audio (S)
- Ambient intensity increases with floor count (filter/reverb adjustments)
- Milestone fanfare at loop boundaries (floor 50, 100)
- New endless-specific death SFX (longer, more dramatic)
- Music doesn't restart on loop — continuous across the endless run

### UX-34: Achievement Notification Toasts (S)
Currently achievements unlock silently. Add non-intrusive toast notifications:
- Slide in from top-right, auto-dismiss after 3s
- Show achievement icon + name + description
- Queue multiple achievements if several trigger at once
- Respect animation speed settings

### QA-26: Performance Regression (S)
After BE-33 code-splitting:
- Verify no chunk exceeds 500KB uncompressed
- Lighthouse performance score remains 90+
- Initial load time doesn't regress
- Lazy-loaded screens still work after code-split
- PWA precache size reduced from 13MB

### GD-31: Endless Mode Visual Escalation (S)
Beyond Act 4, backgrounds should shift every 10 floors:
- Increasing saturation/contrast
- Subtle color rotation (warm → cool → desaturated)
- Communicates difficulty escalation visually

---

## Delivery Order

**Phase A (Infrastructure):**
1. PM-16 — Sprint setup
2. BE-31 — Endless mode infrastructure (blocks UX-33, VARROW-12, QA-25, AR-18, GD-31)
3. BE-32 — Custom seeded runs (independent)
4. BE-33 — Code-splitting (independent, blocks QA-26)

**Phase B (Content & UI):**
5. JR-15 — Character-specific relics
6. UX-12 — Smart card targeting
7. UX-33 — Endless mode UI (needs BE-31)
8. GD-30 — Relic/potion compendium
9. VARROW-12 — Endless mode narrative (needs BE-31)
10. AR-18 — Endless mode audio (needs BE-31)

**Phase C (Testing & Polish):**
11. QA-25 — Endless mode regression (needs UX-33, VARROW-12)
12. UX-34 — Achievement toasts
13. QA-26 — Performance regression (needs BE-33)
14. GD-31 — Endless mode visual escalation (needs BE-31)

---

## Validation Gate

- [ ] Endless mode accessible after Heart defeat
- [ ] Enemy scaling works (+10% per loop)
- [ ] Floor counter displays correctly beyond floor 50
- [ ] Custom seeded runs produce identical outcomes for same seed
- [ ] Seed visible on run history
- [ ] 12 character-specific relics functional
- [ ] Non-targeting cards playable without drag (smart targeting)
- [ ] Relic/potion compendium accessible with discovery tracking
- [ ] No bundle chunk >500KB uncompressed
- [ ] Endless mode narrative triggers at floor milestones
- [ ] 3200+ tests passing
- [ ] `npm run validate` passes
- [ ] Median endless death: floor 60-80 at A0

---

*Sprint 16 Plan — PM-authored, pending team review.*
