# Sprint 9 Plan: Ship Prep + QA + 1.0

**Created:** 2026-01-31
**Goal:** Production-ready 1.0 on web + PWA. Zero P0 bugs. Full regression. Professional polish.
**Integration Branch:** `sprint-9`
**Status:** PLANNED — Pending team alignment

---

## Sprint 8 Outputs Feeding This Sprint

- **100% completion rate:** All 13 Sprint 8 tasks merged — first sprint with zero deferrals
- **Title screen (GD-10):** Professional dark fantasy first impression in place
- **Combat juice (UX-16):** Screen shake, card glow, status pop, energy pulse all working
- **Narrative complete (VARROW-01/02/03):** Three-sprint Endless War arc finished — boss dialogue, event rewrites, victory/defeat
- **SFX (AR-07):** 10+ sounds wired to game events
- **Starting bonus (BE-09):** Neow-style run-start options — long-deferred, finally shipped
- **Art pipeline closed (GD-09/GD-11):** 96/96 cards, 41/41 enemies, all in sprite sheets
- **E2E stable (QA-09):** Root-caused flakiness, 3/3 consecutive passes
- **Balance pass (QA-10):** Act 1+2 simulator with card rewards
- **Mobile complete:** Combat (S7) + Map (S8) + Touch targets = fully playable
- **Sprint 8 PR #78:** Still open — merge to master before Sprint 9 branches

### Current Metrics
- **Tests:** 1159 passing (39 test files)
- **Lint:** 0 errors
- **Build:** Passing
- **Content:** 81 cards, 41 enemies, 49 relics, 15 potions, 20 events
- **Art:** Zero gaps — all assets present, sprite sheets current
- **Mobile:** Portrait playable on 390x844

---

## Task Overview

### P0 — Must Ship (1.0 Gate)

| Task | Owner | Size | Description |
|------|-------|------|-------------|
| **QA-11** | QA | L | Full regression — All cards, enemies, relics, events, potions tested. Ascension A0-A5 full playthroughs. |
| **AR-06** | AR | M | Music integration — Wire Stu's tracks: menu theme, map/exploration, combat, boss, victory/defeat. Volume control via Settings. |
| **BE-PWA** | BE | S | PWA setup — Service worker, manifest.json, offline support. App installable from browser. Icons (192/512px). |
| **AR-05b** | AR | S | Mobile final pass — Portrait responsiveness verified. Touch targets, overflow, viewport on real device dimensions. |
| **PM-09** | PM | S | Merge sprint-8 to master — Review and merge PR #78. Then create sprint-9 branch from master. |
| **GD-12** | GD | M | Relic/potion icon batch — 20 most visible relic and potion icons. Replace emoji placeholders with themed art. |

### P1 — Should Ship

| Task | Owner | Size | Description |
|------|-------|------|-------------|
| **UX-17** | UX | M | Tutorial / first-run hints — Contextual, non-intrusive. Highlight energy, draw pile, end turn on first combat. Dismiss permanently. |
| **BE-20** | BE | S | Performance audit — React.memo/useMemo where profiler shows waste. Bundle size < 2MB target. Lighthouse audit. |
| **QA-12** | QA | S | Accessibility pass — Keyboard navigation, screen reader labels on interactive elements, color contrast (WCAG AA). |
| **VARROW-04** | Varrow | S | Narrative polish — Final copy pass on all player-facing text. Consistency check across events, boss dialogue, victory/defeat, tooltips. |
| **GD-13** | GD | S | Placeholder icons — Colored silhouette style for remaining relics/potions not covered by GD-12. No emoji in 1.0. |

### P2 — Stretch (Ship If Time)

| Task | Owner | Size | Description |
|------|-------|------|-------------|
| **UX-18** | UX | S | Loading state — Brief branded splash during initial load. Replaces blank white screen. |
| **JR-07** | JR | S | Card balance fine-tuning — Address any outliers from QA-11 regression (cards that are auto-pick or never-pick). |
| **AR-09** | AR | S | Audio polish — Crossfade between music tracks on screen transitions. Fade out on pause/settings. |

---

## Task Details

### QA-11: Full Regression (P0, L)

Comprehensive regression test pass for 1.0 release confidence.

**Scope:**
- All 81 cards: play, upgrade, exhaust, special effects
- All 41 enemies: AI patterns, special actions, death triggers
- All 49 relics: triggers fire at correct times, counters work
- All 15 potions: use in combat, discard, effects apply
- All 20 events: choices resolve correctly, rewards granted
- Ascension A0 through A5: modifiers apply, difficulty scales
- Save/load round-trip at every game phase
- Meta-progression: achievements unlock, ascension persists

**Files:** `src/test/`, new regression test files

**Acceptance Criteria:**
- [ ] Card regression suite covers all 81 cards
- [ ] Enemy regression suite covers all 41 enemies
- [ ] Relic regression suite covers all 49 relics
- [ ] Full playthrough A0 and A5 without crashes
- [ ] Save/load works at every game phase
- [ ] 1200+ tests passing

---

### AR-06: Music Integration (P0, M)

Wire Stu's music tracks into the game. Tracks provided as audio files.

**Target tracks:**
| Track | When |
|-------|------|
| Menu theme | Title screen |
| Exploration | Map screen, rest sites, shop, events |
| Combat | Normal + elite encounters |
| Boss | Boss encounters |
| Victory | Victory screen |
| Defeat | Game over screen |

**Implementation:**
- Extend audioSystem.js with music layer (separate from SFX)
- Music volume slider in Settings (independent from SFX volume)
- Crossfade or cut on screen transitions
- Loop combat/exploration tracks
- Respect existing audio-after-interaction pattern

**Files:** `src/systems/audioSystem.js`, `src/components/Settings.jsx`, `public/audio/music/`

**Acceptance Criteria:**
- [ ] 6 music tracks wired to game phases
- [ ] Music volume independently controllable
- [ ] Music loops correctly
- [ ] No audio overlap between tracks
- [ ] Respects first-interaction requirement

---

### BE-PWA: PWA Setup (P0, S)

Make the game installable as a Progressive Web App.

**Implementation:**
- `public/manifest.json` with app name, icons, theme color, display: standalone
- Service worker for offline caching (Vite PWA plugin or manual)
- App icons: 192x192 and 512x512 (reuse title screen art)
- Cache strategy: cache-first for assets, network-first for nothing (fully static app)

**Files:** `public/manifest.json`, `vite.config.js`, service worker, `index.html`

**Acceptance Criteria:**
- [ ] "Install App" prompt appears in Chrome/Safari
- [ ] App works offline after first load
- [ ] Icons display correctly on home screen
- [ ] Standalone mode (no browser chrome)

---

### AR-05b: Mobile Final Pass (P0, S)

Verify portrait-mode responsiveness on real device dimensions.

**Checklist:**
- iPhone 12/13/14 (390x844)
- iPhone SE (375x667)
- Pixel 7 (412x915)
- iPad portrait (810x1080)
- All screens: title, map, combat, shop, rest, event, reward, settings, victory, defeat
- No horizontal overflow, no clipped text, no unreachable buttons

**Files:** Responsive CSS fixes as needed

**Acceptance Criteria:**
- [ ] All screens render correctly on 4 viewport sizes
- [ ] No horizontal scroll on any screen
- [ ] All interactive elements reachable and tappable
- [ ] Text readable without zooming

---

### PM-09: Merge Sprint 8 to Master (P0, S)

Sprint 8 PR #78 is still open with 63 files changed, +3482/-463.

**Steps:**
1. Final review of PR #78
2. Merge sprint-8 → master
3. Tag `v0.9.0` on master
4. Create sprint-9 branch from updated master

**Acceptance Criteria:**
- [ ] PR #78 merged
- [ ] Master has all Sprint 8 work
- [ ] sprint-9 branch created

---

### GD-12: Relic/Potion Icon Batch (P0, M)

Replace the 20 most visible emoji placeholders with themed art icons.

**Priority icons (most seen by players):**
- Starter relic: Burning Blood
- Common relics: Anchor, Vajra, Bag of Preparation, Lantern, Orichalcum
- Boss relics: Coffee Dripper, Cursed Key, Snecko Eye
- Potions: Fire Potion, Block Potion, Strength Potion, Weak Potion, Swift Potion

**Style:** Match existing dark fantasy art. 128x128 WebP. Add to relic/potion sprite sheet.

**Files:** `public/images/relics/`, `public/images/potions/`, sprite sheet rebuild

**Acceptance Criteria:**
- [ ] 20 icons replace emoji placeholders
- [ ] Consistent art style with existing assets
- [ ] Sprite sheet updated
- [ ] Fallback to emoji if image fails to load

---

### UX-17: Tutorial / First-Run Hints (P1, M)

Contextual hints for new players. Non-intrusive, dismissible.

**Hints (first combat only):**
1. "Drag cards to play them" (or "Tap to play" on mobile)
2. "You draw 5 cards each turn" (highlight draw pile)
3. "Click End Turn when done" (highlight end turn button)
4. "Energy limits how many cards you play" (highlight energy orb)

**Implementation:**
- Track `hasSeenTutorial` in localStorage
- Overlay hint arrows/tooltips on first combat
- Dismiss on interaction or "Got it" button
- Never show again after first combat

**Files:** New `TutorialOverlay.jsx`, `CombatScreen.jsx`, localStorage

**Acceptance Criteria:**
- [ ] Hints appear on first-ever combat
- [ ] Hints don't appear on subsequent runs
- [ ] Non-blocking (player can still interact)
- [ ] Works on mobile and desktop

---

### BE-20: Performance Audit (P1, S)

Profile and optimize. Target: bundle < 2MB, no jank.

**Checklist:**
- Lighthouse performance score (target 90+)
- Bundle size analysis (`npx vite-bundle-visualizer`)
- React DevTools profiler: identify unnecessary re-renders
- Apply React.memo to heavy components (enemy list, card hand, map)
- Verify lazy loading of sprite sheets

**Files:** Components as needed, `vite.config.js`

**Acceptance Criteria:**
- [ ] Bundle size < 2MB
- [ ] No component re-renders > 16ms
- [ ] Lighthouse performance 90+
- [ ] No regressions

---

### QA-12: Accessibility Pass (P1, S)

Basic accessibility for 1.0. Not full WCAG compliance, but minimum playability.

**Scope:**
- Keyboard navigation: Tab through cards, Enter to play, Escape to cancel
- ARIA labels on interactive elements (cards, buttons, relics, potions)
- Color contrast check (WCAG AA) on text against backgrounds
- Focus indicators visible on all interactive elements

**Files:** Component files as needed

**Acceptance Criteria:**
- [ ] Game playable with keyboard only
- [ ] Screen reader can identify all interactive elements
- [ ] Text passes WCAG AA contrast
- [ ] Focus indicators visible

---

### VARROW-04: Narrative Polish (P1, S)

Final copy pass across all player-facing text.

**Scope:**
- Events: consistent voice, no typos, no placeholder text
- Boss dialogue: timing cues make sense, no duplicates
- Victory/defeat: text variations all grammatically correct
- Tooltips: mechanical descriptions clear and consistent
- Card descriptions: match actual effects

**Files:** `src/data/flavorText.js`, `src/data/events.js`, `src/data/bossDialogue.js`, `src/data/cards.js`

**Acceptance Criteria:**
- [ ] All player-facing text reviewed
- [ ] Zero typos or placeholder text
- [ ] Consistent Endless War voice
- [ ] Card descriptions match mechanical effects

---

### GD-13: Placeholder Icons (P1, S)

Colored silhouettes for remaining relics/potions not in GD-12 batch.

**Style:** Solid color silhouette with themed glow. Not emoji. Quick to produce, visually consistent.

**Files:** `public/images/relics/`, `public/images/potions/`, sprite sheets

**Acceptance Criteria:**
- [ ] All relics have icon art (no emoji in 1.0)
- [ ] All potions have icon art (no emoji in 1.0)
- [ ] Sprite sheets rebuilt

---

## Phase Ordering

**Phase 1 (Foundation — Do First):**
- PM-09 (merge Sprint 8 → master, create sprint-9 branch)
- AR-06 (music — independent, needs Stu's tracks)
- GD-12 (relic/potion icons — independent art work)
- QA-11 (regression — start early, largest task)

**Phase 2 (Core Features):**
- BE-PWA (PWA setup — independent)
- UX-17 (tutorial hints — independent)
- AR-05b (mobile final pass — after any CSS changes)
- VARROW-04 (narrative polish — independent)

**Phase 3 (Polish + Ship):**
- BE-20 (performance audit — after all features in)
- QA-12 (accessibility — after UI stabilized)
- GD-13 (placeholder icons — after GD-12 establishes style)
- Stretch: UX-18, JR-07, AR-09

---

## Dependencies

```
PM-09 (merge S8) → all other tasks (branch exists)
GD-12 (icon style) → GD-13 (remaining icons follow same style)
QA-11 (regression) → JR-07 (balance outliers identified by regression)
AR-06 (music tracks) → AR-09 (crossfade polish)
All P0/P1 → BE-20 (performance audit last, after features stable)
```

---

## Explicitly NOT in Sprint 9

- Act 3 content (post-1.0)
- Second character class (post-1.0)
- Cloud save sync (post-1.0)
- Landscape mobile (portrait-only for 1.0)
- Mod support (post-1.0)
- Localization (post-1.0)

---

## Validation Gate (1.0 RELEASE GATE)

Before Sprint 9 close / 1.0 tag:
- [ ] Zero P0 bugs
- [ ] Full playthrough A0 + A5 without crashes
- [ ] All 81 cards tested in regression
- [ ] All 41 enemies tested in regression
- [ ] All relics/potions have icon art (no emoji)
- [ ] Music plays on all game phases
- [ ] PWA installable and works offline
- [ ] Mobile playable on iPhone 12 portrait (390x844)
- [ ] Bundle size < 2MB
- [ ] Tutorial hints work for new players
- [ ] Keyboard navigation functional
- [ ] All player-facing text proofread
- [ ] 1200+ tests passing
- [ ] `npm run validate` passes
- [ ] Lighthouse performance 90+
- [ ] Magazine score self-assessment: targeting 75+

---

## Capacity Summary

| Role | Tasks | Load |
|------|-------|------|
| **BE** | BE-PWA (S), BE-20 (S) | Light — two small tasks |
| **UX** | UX-17 (M), UX-18 (S, stretch) | Normal |
| **JR** | JR-07 (S, stretch) | Light — on standby for balance fixes |
| **Varrow** | VARROW-04 (S) | Light — copy review pass |
| **GD** | GD-12 (M), GD-13 (S) | Normal — art batch + placeholders |
| **AR** | AR-06 (M), AR-05b (S), AR-09 (S, stretch) | Full — music is the big one |
| **QA** | QA-11 (L), QA-12 (S) | Full — regression is the sprint's anchor |
| **PM** | PM-09 (S) | Light — merge + coordination |

---

## 1.0 Release Checklist (Post-Sprint 9)

After all tasks merge:
1. Merge sprint-9 → master
2. Tag `v1.0.0` on master
3. Deploy to GitHub Pages (production)
4. Verify PWA installable on live URL
5. Run final Lighthouse audit
6. Self-score against Game Zone criteria
7. Update README with play link and screenshots

---

*Sprint 9 Plan — PM draft, pending team alignment and Mentor approval.*
*Sources: ROADMAP.md (Sprint 9 section), Sprint 8 retrospective, team diaries, 1.0 success metrics.*
