# UX-10: Top 20 UX Hit List

**Author:** UX (UX Guy)
**Date:** 2026-01-30
**Target viewport:** 390x844 (iPhone 14 / standard mobile)
**Purpose:** Identify and prioritize the top UX issues that make Spire Ascent feel amateur on mobile. Feeds directly into Sprint 7 mobile combat redesign (UX-13).

---

## Summary

After a conceptual mobile playthrough at 390x844, the game's biggest problems cluster around three areas: (1) the persistent header consuming too much vertical space, (2) combat cards being too small and hard to read, and (3) poor information density on screens where the player needs to make decisions quickly (combat, rewards, shop).

---

## Quick Wins (< 30 min each)

### QW-1: Persistent header is 3 rows tall, eats ~90px of screen
**Screen:** All gameplay screens
**Problem:** PersistentHeader renders stats row + relics row + potions row. On a 390x844 viewport with browser chrome, that leaves roughly 650px of usable height. The header takes ~90px (14% of usable space). During combat this is devastating -- enemies are squeezed and the hand area is cramped.
**Fix:** Collapse relics and potions into a single row, or hide them behind a tap-to-expand drawer. Stats row alone should be ~40px.
**Screenshot note:** Full combat screen at 390x844 showing header eating top quarter.

### QW-2: Card description text at 8px is unreadable on mobile
**Screen:** Combat (hand area)
**Problem:** `Card.jsx` sets description font to `8px` (6px in small mode). On a mobile screen this is effectively invisible. Players cannot read what their cards do without relying on the tooltip system.
**Fix:** Bump card description to 10px minimum on mobile. Reduce art area height to compensate.
**Screenshot note:** Close-up of a card in hand showing illegible description text.

### QW-3: Energy orb is 52px but sits between tiny pile buttons
**Screen:** Combat bottom controls
**Problem:** The energy orb (52x52) and End Turn button dominate the bottom bar, but the Draw/Disc/Exh pile buttons are 11px font with small padding. Imbalanced visual hierarchy -- the most-used area looks cluttered.
**Fix:** Increase pile button touch targets to 44px minimum height. Reduce energy orb to 44px.
**Screenshot note:** Bottom combat bar showing size mismatch between energy orb and pile buttons.

### QW-4: Map SVG is 360px wide but viewport is 390px
**Screen:** Map
**Problem:** `MapScreen` uses a fixed `width: 360` for the SVG layout. On a 390px viewport this wastes 30px and leaves the map looking off-center, with the scroll position bar squeezed into 24px on the right. On smaller phones (360px viewport) it clips.
**Fix:** Make SVG width responsive: `Math.min(containerWidth, 400)`.
**Screenshot note:** Map screen showing wasted horizontal space on iPhone 14.

### QW-5: Turn indicator sits below 90px of padding, wastes space
**Screen:** Combat
**Problem:** CombatScreen has `paddingTop: '90px'` to clear the persistent header, then renders a turn indicator with its own 4px padding. Combined with the header, the first interactive element (enemies) starts ~120px down the screen.
**Fix:** Integrate turn number into the persistent header (e.g., next to floor indicator). Remove the standalone turn indicator div.
**Screenshot note:** Combat screen showing gap between header and enemy area.

---

## Medium Effort (half-day each)

### ME-1: Cards in hand are 100px wide -- too small to read, too big to fit 5+
**Screen:** Combat
**Problem:** Cards are 100x145px. At 390px viewport width, only 3.5 cards fit without scrolling. With 5 cards in hand (typical), 2 are off-screen requiring horizontal scroll. The cards are simultaneously too small to read and too wide to all be visible.
**Fix:** Redesign hand as a fan/arc layout or implement card overlap with spread-on-tap. Cards could be 80px wide but overlap, showing only cost + name. Tapping a card fans the hand and enlarges the selected card.
**Screenshot note:** Hand area with 5 cards, showing 2 hidden off-screen with scroll indicator visible.

### ME-2: No card enlargement on tap-and-hold
**Screen:** Combat
**Problem:** On desktop, hover tooltips (CardTooltip) provide card details. On mobile (touch devices), there is no equivalent. The CSS media query disables hover effects but provides no alternative inspection mechanism. Players must memorize what cards do.
**Fix:** Add long-press (300ms) handler that shows a modal/portal with enlarged card (200px+ wide) centered on screen. Dismiss on release.
**Screenshot note:** Player tapping a card with no way to see full description.

### ME-3: Enemy info requires clicking, then a modal -- too many taps
**Screen:** Combat
**Problem:** To see enemy details (status effects, moveset), the player must tap an enemy (not in targeting mode) to open `EnemyInfoPanel`. This is a full modal overlay. On mobile where the enemy is already small, this is friction-heavy. Players rarely check.
**Fix:** Show essential info (HP, intent, top 2 status effects) directly on the enemy component without needing a tap. Reserve the modal for detailed info.
**Screenshot note:** Small enemy component with multiple status badges that require a tap to understand.

### ME-4: Block indicator causes layout shift (UX-11 overlap)
**Screen:** Combat
**Problem:** When player gains block, the block display appears/disappears in the header area. This causes adjacent elements to shift. On mobile, layout shifts during combat are disorienting.
**Fix:** Reserve space for block display always (show "0" or empty shield). This is also tracked as UX-11.
**Screenshot note:** Before/after of header when block is gained showing layout jump.

### ME-5: Reward card selection -- 3 cards at 100px don't fit on 390px
**Screen:** Card reward
**Problem:** `RewardScreen` lays out 3 cards in a flex row with 15px gaps. Total: 3*100 + 2*15 = 330px plus 40px padding = 370px. This barely fits on 390px with no breathing room. Cards are cramped and the "Choose a Card" header wastes vertical space with 24px font + 28px emoji + 8px subtitle.
**Fix:** Stack cards vertically on mobile, or use a swipeable carousel. Compact the header.
**Screenshot note:** Card reward screen showing 3 cramped cards with no room to tap confidently.

### ME-6: Shop screen card grid doesn't account for mobile width
**Screen:** Shop
**Problem:** Shop cards render at full 100px width in a horizontal layout. On mobile, cards overlap or require scrolling. No price comparison or "can I afford this?" visual at a glance.
**Fix:** Vertical list layout on mobile with card name, cost, type, and "Buy" button. Show gold remaining prominently.
**Screenshot note:** Shop screen with overlapping card items on mobile.

### ME-7: Drag-to-play cards is janky on mobile
**Screen:** Combat
**Problem:** Card drag uses `touchmove` with a 60fps throttle, but the drop zone detection relies on the card being in the "upper 60% of screen." On mobile, the hand area is at the very bottom and the enemy area is compressed. Dragging cards upward means the thumb covers the enemies, making it impossible to see which enemy you're targeting.
**Fix:** Prefer tap-to-select, tap-enemy-to-play on mobile. Keep drag as optional. Or: drag upward shows a targeting reticle above the thumb.
**Screenshot note:** Player dragging card upward, thumb covering all enemies.

### ME-8: Event/rest site choice buttons are too narrow on mobile
**Screen:** Events, Rest Site
**Problem:** Event choices and rest site options have `min-height: 48px` from CSS but no min-width. On narrow screens, multi-line text wraps awkwardly in buttons that look broken.
**Fix:** Set event choice buttons to `width: 100%` on mobile with proper text wrapping and padding.
**Screenshot note:** Event screen with a long choice text wrapping to 3 lines in a narrow button.

---

## Needs Redesign (Sprint 7 scope)

### RD-1: Combat layout needs a mobile-first redesign
**Screen:** Combat
**Problem:** The combat screen is a vertical stack: header (90px) + turn indicator + enemy area (flex: 1) + targeting bar + hand area (~155px + scrollbar) + bottom controls (~70px). On 844px viewport, the enemy area gets roughly 350px. With 3 enemies in a flex-wrap layout, they overlap or shrink below usability. The entire layout was designed for a taller viewport.
**Redesign:** Mobile combat should use zones: fixed header (40px), enemy zone (40% of remaining), hand zone (60% of remaining). Enemies should scale based on count. Hand should use a fan/arc pattern.
**Screenshot note:** Full combat screen showing all zones and their pixel heights.

### RD-2: Persistent header should be a collapsible HUD
**Screen:** All
**Problem:** The header shows HP, gold, deck count, mute, relics, and potions. On mobile, only HP and energy are essential during combat. The rest is noise. The header should contextually adapt: during combat show HP/energy/block, during map show full info.
**Redesign:** Context-aware header. Combat mode: single row (HP bar + energy + block). Map mode: full 2-row header. Relics/potions accessible via a slide-out drawer.

### RD-3: Map needs horizontal scroll or pinch-zoom on mobile
**Screen:** Map
**Problem:** The map SVG is a vertical scroll with 360px fixed width. On mobile the nodes (22px radius) are small and close together. Tapping the correct node is difficult when two are adjacent. The scroll position bar (24px wide) wastes space.
**Redesign:** Make the map pannable and pinch-zoomable. Remove the scroll position bar on mobile (replace with a mini-map overlay). Increase node radius to 28px with more spacing.

### RD-4: No landscape support
**Screen:** All
**Problem:** The landscape CSS (`max-height: 500px, orientation: landscape`) sets `flex-direction: row` on `.game-container` and reduces card/hand sizes, but this is not meaningfully tested or designed. The game is effectively portrait-only.
**Redesign:** Either commit to portrait-only (lock orientation) or properly design landscape layouts for combat and map.

---

## Top 5 Quick Wins for Sprint 6 Stretch Work

| Priority | ID | Description | Effort |
|----------|-----|-------------|--------|
| 1 | QW-1 | Collapse persistent header to 1 row during combat | Quick |
| 2 | QW-5 | Move turn indicator into header, remove standalone div | Quick |
| 3 | QW-2 | Bump card description font to 10px on mobile | Quick |
| 4 | QW-3 | Balance bottom bar: bigger pile buttons, smaller energy orb | Quick |
| 5 | QW-4 | Make map SVG width responsive to container | Quick |

---

## Mobile Screenshot Reference

For each issue above, the "screenshot note" describes what should be captured at 390x844 viewport. To reproduce:

1. Open Chrome DevTools
2. Toggle device toolbar (Ctrl+Shift+M)
3. Set to 390x844 (iPhone 14)
4. Navigate to the relevant screen
5. Capture the specific issue described

Key screenshots to take:
- **Combat full screen:** Shows header + enemies + hand + controls vertical space budget
- **Hand with 5 cards:** Shows horizontal overflow and scroll indicator
- **Card close-up:** Shows 8px description text illegibility
- **Map screen:** Shows 360px SVG in 390px viewport
- **Card reward:** Shows 3 cramped cards in 390px
- **Bottom bar:** Shows energy orb vs pile button size mismatch

---

## Appendix: Code References

| Component | File | Key Issue |
|-----------|------|-----------|
| PersistentHeader | `src/components/PersistentHeader.jsx` | 3-row layout, fixed position, ~90px tall |
| CombatScreen | `src/components/CombatScreen.jsx` | 90px paddingTop, hand area 155px min-height |
| Card | `src/components/Card.jsx` | 100x145px, 8px description, 6px in small mode |
| Enemy | `src/components/Enemy.jsx` | 100px min-width, 70px art area |
| MapScreen | `src/components/MapScreen.jsx` | 360px fixed SVG width, 22px node radius |
| RewardScreen | `src/components/RewardScreen.jsx` | 3 cards in flex row, 15px gap |
| App.css | `src/App.css` | Mobile breakpoints at 768px, 375px, 360px |
