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
