# UX Diary - Sprint 3

## Role
UX Guy - Combat feedback, tooltips, visual polish

## Owned Files
`src/components/CombatScreen.jsx`, `src/components/AnimationOverlay.jsx`, `src/hooks/useAnimations.js`

## Sprint 3 Tasks
- UX-05: Card text truncation fix (Day 1, P1)
- UX-06: Tooltip infrastructure (Day 2, P1)
- UX-07: Combat feedback/floating numbers (Day 3, P1)

---

## Entries

### Sprint 11 - UX-23 Complete
**Date:** 2026-02-01
**Status:** UX-23 DONE (PR #134)

**What I did:**
- Added visited-node checkmark indicator to map — small checkmark badge (top-right) on completed nodes
- Uses existing `node.visited` flag, excludes currently accessible nodes
- Scales with node radius (works for boss nodes too)
- 1 file changed (MapScreen.jsx), 8 insertions
- Both Copilot and Mentor reviews passed, merged via squash

**Sprint 11 UX status:** UX-21 done, UX-22 done, UX-23 done. All UX tasks complete.

---

### Sprint 11 - UX-22 Complete
**Date:** 2026-02-01
**Status:** UX-22 DONE (PR #127)

**What I did:**
- Added skip-reward confirmation to card reward screen — two-step "Are you sure?" flow
- First click shows "Skip this reward?" with "Yes, Skip" and "Go Back" buttons
- Prevents accidental reward skipping — last unresolved Game Zone complaint
- 1 file changed (RewardScreen.jsx), 63 insertions, 18 deletions
- Both Copilot and Mentor reviews passed, merged via squash

**Sprint 11 UX status:** UX-21 done, UX-22 done. UX-23 (map visited-node) remaining as P2 stretch.

---

### Sprint 11 - UX-21 Complete
**Date:** 2026-02-01
**Status:** UX-21 DONE (PR #126)

**What I did:**
- Added RunHistoryPanel to MainMenu — modal showing overall stats (total runs, wins, win rate), lifetime stats (highest floor, highest ascension, enemies killed, cards played), and last 20 runs
- Each run entry shows outcome (Victory/Defeat), floor, act, ascension, deck size, relics, and cause of death for defeats
- Wired UPDATE_PROGRESSION dispatch on VictoryScreen and GameOverScreen mount to actually record runs
- Added addRunToHistory call in metaReducer for detailed run history persistence to localStorage
- Added updateProgression action to GameContext hook
- 239 lines changed across 5 files, follows DailyChallengePanel pattern

**Sprint 11 UX status:** UX-21 done. UX-22 (skip-reward confirmation) and UX-23 (map visited-node) remaining.

---

### Magazine Review Notes (58/100)
**Date:** 2026-01-24
**Context:** Game Zone preview review — UX/Polish scored 5/10 (lowest category)

**My takeaways:**
- UX is the biggest improvement opportunity. Reviewer called out: no tooltips, no card enlargement, no damage previews, no floating damage numbers, card text truncation.
- **Sprint 3 tasks assigned to me:**
  - **UX-05:** Card text truncation fix (small, CSS-only)
  - **UX-06:** Tooltip infrastructure (medium) — Generic Portal-based component
  - **UX-07:** Combat feedback/floating damage numbers (medium) — Queue-based via AnimationOverlay

**Tooltip implementation plan (from mentor):**
- Single generic component, 80-120 lines
- React Portal to `document.body` (avoids overflow/z-index issues)
- Position relative to mouse or trigger element (pick one, be consistent)
- 150-200ms show delay to avoid flicker on incidental mouse movement
- Data-driven: cards, relics, potions, status effects each define tooltip content in their data files

**Combat feedback plan (from mentor):**
- Queue-based animation approach — push events with {type, value, x, y, duration}
- AnimationOverlay (already stubbed!) reads from queue, renders short-lived elements
- Animations self-remove after duration
- NEVER block player input — fire-and-forget, pointerEvents: 'none'
- Start with damage numbers. Healing, block, status follow same pattern.

**Card enlargement:**
- Modal preview via Portal (safer than in-place hover)
- Show on long-hover (300ms?) or on explicit "inspect" action
- Display full card art, stats, and description without truncation

**Dependencies:**
- Need to verify: Does GameContext already have animation queue wired?
- How does speed multiplier work? (global CSS var or JS calculation?)

---

### Sprint 2 Complete
**Date:** 2026-01-24
**Status:** All tasks merged. Sprint 2 DONE.
**Summary:**
- UX-02: Card tooltips — MERGED (PR #13)
**Satisfaction:** Happy with sprint 2. Tooltip groundwork laid for Sprint 3 infrastructure expansion.
**Ready for Sprint 3:** Yes. UX-05 (text truncation), UX-06 (tooltip infra), UX-07 (combat feedback) queued.

---

### Sprint 3 Kickoff
**Date:** 2026-01-25
**Status:** Sprint 3 ACTIVE

**My tasks:**
- **UX-05 (Day 1, P1):** Card text truncation fix
  - Fix "Infernal Blade" → "Infernal Bla..." on selection screen
  - CSS-only fix: font sizing or auto-resize on overflow
  - Files: App.css, Card.jsx
  - Can run parallel with GD-05 and PM-03

- **UX-06 (Day 2, P1):** Tooltip infrastructure
  - Generic Portal-based Tooltip component per DEC-006
  - React Portal to document.body (avoids z-index issues)
  - 150-200ms show delay
  - Data-driven content from cards.js, relics.js, etc.
  - Files: NEW Tooltip.jsx, NEW useTooltip.js
  - Critical path: BE-05 and UX-07 depend on this

- **UX-07 (Day 3, P1):** Combat feedback/floating numbers
  - Queue-based animation via AnimationOverlay
  - Floating damage/block/heal numbers
  - Fire-and-forget, never block input
  - Files: AnimationOverlay.jsx, useAnimations.js

**Dependencies:**
- UX-05 has no blockers (Day 1 parallel)
- UX-06 depends on Phase A completion
- UX-07 depends on UX-06 completion

**Ready to start:** UX-05 immediately

---

### Sprint 6 - UX-10 Complete
**Date:** 2026-01-30
**Status:** UX-10 DONE (PR #54)

**What I did:**
- Conceptual mobile audit at 390x844 viewport (iPhone 14)
- Read through all major components: CombatScreen, PersistentHeader, Card, Enemy, MapScreen, RewardScreen, ShopScreen
- Identified 18 UX issues grouped into 3 effort tiers:
  - 5 quick wins (header collapse, font sizes, layout balance, map width, turn indicator)
  - 8 medium effort (hand redesign, card enlargement, drag UX, reward layout, shop layout, etc.)
  - 4 needs-redesign (combat layout, collapsible HUD, map zoom, landscape)
- Created `docs/UX-10-hit-list.md` with code references and screenshot descriptions

**Key findings:**
- The persistent header (3 rows, ~90px) is the single biggest mobile problem -- it eats 14% of usable screen height
- Cards at 100x145px are simultaneously too small to read (8px descriptions) and too wide to fit 5+ in hand
- The combat screen vertical space budget is the core issue feeding into Sprint 7's UX-13 redesign

**Next steps:**
- UX-11 (block indicator no layout jumps) is next
- Quick wins QW-1 through QW-5 could be Sprint 6 stretch work
- Sprint 7 UX-13 should use this doc as its requirements input

---

### Sprint 7 - UX-13c Complete
**Date:** 2026-01-31
**Status:** UX-13c DONE (PR #73)

**What I did:**
- Added long-press (500ms) card inspect modal for mobile
- Made enemy info stay inline on mobile (no more full-screen panel on tap)
- Added compact mobile enemy wrappers (max-width: 110px)
- Desktop behavior unchanged

**Next:** UX-13 complete (a, b, c all done). Ready for QA-08b viewport testing.

---

### Sprint 7 - UX-12 Complete
**Date:** 2026-01-31
**Status:** UX-12 DONE (PR #76)

**What I did:**
- Smart card targeting: non-attack cards (skills, powers) can now be played by dropping anywhere during drag-and-drop
- Attack cards with single enemy already auto-targeted via reducer — no change needed
- Attack cards with multiple enemies still require explicit enemy selection
- Click-to-play path was already correct, no changes needed

**Analysis:** The reducer (`selectCardAction.js`) already handled single-enemy auto-targeting correctly. The only gap was the drag-and-drop path in `handleDragEnd` which required dropping in the enemy area (upper 60%) even for non-attack cards. Fixed by checking card type first and playing non-attacks on any drop location.

**Next:** Awaiting reviews on PR #76.

---

### Sprint 8 - UX-16 Complete
**Date:** 2026-01-31
**Status:** UX-16 DONE (PR #80)

**What I did:**
- Screen shake on player damage (light/medium/heavy tiers based on damage amount)
- Screen shake on heavy enemy hits (>15 damage)
- All shakes respect `screenShake` setting and `animationSpeed` multiplier
- Enhanced cardFlyToEnemy with initial brightness flash (glow before fly)
- Energy orb now pulses on both spend AND gain (was spend-only)
- Floating status effect labels when vulnerable/weak/strength/platedArmor/artifact applied to enemies
- Floating status effect labels when vulnerable/weak/strength applied to player
- All animations fire-and-forget, non-blocking

**Technical notes:**
- Used existing CSS shake classes (shake-light, shake-medium, shake-heavy) already in App.css
- `loadSettings()` called directly in effects (consistent with useEnemyTurnSequence pattern)
- Status tracking uses refs for previous values (same pattern as prevEnemyHp)
- Extracted player status fields to variables to satisfy exhaustive-deps lint rule

**Next:** UX-14 (mobile map screen) and UX-15 (narrative UI theming) remaining for Sprint 8.

---

### Sprint 8 - UX-14 Complete
**Date:** 2026-01-31
**Status:** UX-14 DONE (PR #86)

**What I did:**
- Made MapScreen responsive for mobile viewports (<480px)
- Added `useViewportWidth` hook for reactive layout
- SVG width scales to viewport on mobile (min 280px, max viewport-32px)
- Reduced header padding from 90px to 60px on mobile
- Hidden mini-map sidebar on mobile to maximize horizontal space
- Compact legend with tighter spacing
- Prevented horizontal overflow with overflowX: hidden
- Added WebkitOverflowScrolling: touch for smooth mobile scrolling
- Node targets remain 44px diameter (WCAG compliant)
- Desktop layout unchanged

**Validation:** `npm run validate` passes — 1147 tests, lint clean, build clean

**Next:** UX-15 (narrative UI theming) remaining for Sprint 8.

---

### Sprint 8 - UX-15 Complete
**Date:** 2026-01-31
**Status:** UX-15 DONE (PR #89)

**What I did:**
- Added subtle Endless War narrative motifs to UI chrome (CSS-only, ~90 lines)
- War-pattern diagonal hash borders on panels (deck viewer, tooltips, settings, tutorial)
- Faint red radial vignette overlay on combat screen via ::before pseudo-element
- Scanline glitch effect on game-container::after (3% opacity, slow 4s pulse)
- Vertical hash borders on victory/defeat content panels
- CSS custom properties for war theme: --war-border-color, --war-glow, --war-accent
- All effects use pointer-events: none, purely atmospheric

**Validation:** `npm run validate` passes — 1147 tests, lint clean, build clean

**Sprint 8 UX status:** All 3 UX tasks complete (UX-16, UX-14, UX-15). Done for the sprint.

---

### Sprint 9 - UX-17 Complete
**Date:** 2026-01-31
**Status:** UX-17 DONE (PR #98)

**What I did:**
- Created TutorialOverlay.jsx (118 lines) — self-contained tutorial component
- 4 sequential hints: play cards, draw pile, energy, end turn
- Mobile-aware text (drag vs tap instructions)
- localStorage persistence (`spireAscent_hasSeenTutorial`)
- Skip All / Next / Got it buttons with progress dots
- Dark fantasy themed (blue accent #44aacc, gradient background)
- Non-blocking overlay with pointer-events pass-through on backdrop click
- Added to CombatScreen.jsx after AnimationOverlay
- 135 lines of BEM CSS in App.css with slide-in animation and responsive breakpoints

**Validation:** `npm run validate` passes, 254 lines changed (under 300 limit)

**Sprint 9 UX status:** UX-17 done. UX-18 (loading splash) is P2 stretch if time allows.

---

### Sprint 9 - UX-18 Complete
**Date:** 2026-01-31
**Status:** UX-18 DONE (PR #103)

**What I did:**
- Added branded dark fantasy loading splash to index.html
- Displays "Spire Ascent" title with red glow text-shadow + "The Endless War Awaits" tagline
- Subtle red pulsing line animation during load
- All inline HTML/CSS — zero JS, displays before bundle loads
- React replaces content on mount (standard #root replacement)
- Responsive text sizing with clamp() for mobile/desktop
- 43 lines added, minimal and clean

**Sprint 9 UX status:** All UX tasks complete (UX-17 + UX-18). Done for the sprint.

---

### Sprint 10 - UX-19 Complete
**Date:** 2026-01-31
**Status:** UX-19 DONE (PR #113)

**What I did:**
- Added "Daily Challenge" button to MainMenu (amber/gold theme, between New Game and Settings)
- Created DailyChallengePanel modal showing today's date, active modifiers with score multiplier indicators, and personal best score
- Added challenge score calculation and display to VictoryScreen and GameOverScreen
- Scores auto-save to localStorage via BE-22's dailyChallengeSystem infrastructure
- 268 lines changed across 3 files

**Sprint 10 UX status:** UX-19 done. UX-20 (re-review self-assessment) is P2 stretch.

---

### Sprint 10 - UX-20 Complete
**Date:** 2026-01-31
**Status:** UX-20 DONE (PR #118)

**What I did:**
- Created `docs/SELF_ASSESSMENT.md` — full re-review against Game Zone Magazine rubric
- Original score: 58/100. Projected current score: **85/100** (+27)
- Breakdown: Gameplay 7→9, Presentation 6→8, Stability 4→9, UX/Polish 5→8
- 15/18 original complaints resolved (83%)
- Remaining gaps: no run statistics, no card rarity visuals, no skip-reward confirmation
- Documented path to 90+ (second character, run history, animated sprites, Heart boss, cloud save)

**Sprint 10 UX status:** All UX tasks complete (UX-19 + UX-20). Done for the sprint.

---
