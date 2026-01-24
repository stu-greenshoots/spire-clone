# UX Diary - Sprint 2

## Role
UX Guy - Combat feedback, tooltips, visual polish

## Owned Files
`src/components/CombatScreen.jsx`, `src/components/AnimationOverlay.jsx`, `src/hooks/useAnimations.js`

## Sprint 2 Tasks
- UX-02: Card tooltips (P1)

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
