# Sprint 4: Visual Polish - Making It Pro

**Status:** Planning
**Goal:** Transform Spire Ascent from "functional alpha" to "polished experience"
**Target:** Magazine re-review score 70+ (currently 58)
**Integration Branch:** `sprint-4`

---

## Current State Assessment

### Screenshots Analysis (from E2E tests)

| Screen | Issues Identified |
|--------|------------------|
| **Main Menu** | DATA EDITOR button visible in production - needs env gate |
| **Map Screen** | Defaults to boss view (top); player must scroll to find their position at bottom; no auto-scroll; no "you are here" indicator |
| **Combat** | Enemy turns happen simultaneously; no visual per-enemy turn sequence; no "attacking" indicator |
| **Victory** | Full screen replacement loses combat context; should be overlay showing defeated enemies |
| **Rewards** | Map still shows wrong scroll position after returning |

### Magazine Review Pain Points (Game Zone 58/100)
- Stability: 4/10 (P0 bugs fixed in Sprint 2)
- UX/Polish: 5/10 (main focus of Sprint 4)
- Presentation: 6/10 (theme brightness, feedback)

---

## Sprint 4 Tasks

### Phase A: Map Navigation Overhaul (High Priority)

| Task | Owner | Size | Description |
|------|-------|------|-------------|
| **VP-01** | UX | M | **Map auto-scroll to player position** - On mount and floor change, scroll map container to center player's current floor; add smooth scroll animation |
| **VP-02** | UX | S | **"You are here" indicator** - Add pulsing marker or highlight ring at player's current floor position; persist visible even when scrolling |
| **VP-03** | UX | S | **Map position indicator** - Mini-map or scroll position bar showing where you are in the full map; "Floor X of 15" with visual indicator |
| **VP-04** | UX | XS | **Remember scroll position** - When returning to map from combat/events, restore previous scroll position rather than resetting |

**Implementation Notes for VP-01:**
```jsx
// MapScreen.jsx - Add useEffect to scroll to current floor
useEffect(() => {
  if (containerRef.current && currentFloor >= 0) {
    const floorY = layout.positions[map[currentFloor]?.[0]?.id]?.y;
    if (floorY) {
      containerRef.current.scrollTo({
        top: floorY - containerRef.current.clientHeight / 2,
        behavior: 'smooth'
      });
    }
  }
}, [currentFloor, layout.positions, map]);
```

---

### Phase B: Victory Screen as Overlay (High Priority)

| Task | Owner | Size | Description |
|------|-------|------|-------------|
| **VP-05** | UX | M | **Victory overlay on combat** - Instead of full screen replacement, render victory as semi-transparent overlay showing defeated enemies in background |
| **VP-06** | UX | S | **Defeated enemies visual** - Show enemy sprites faded/grey/dissolving behind victory modal |
| **VP-07** | UX | XS | **Smooth transition** - Animate victory panel sliding up or fading in over combat scene |

**Implementation approach:**
1. Add `combatVictory: boolean` to state
2. Keep CombatScreen mounted when phase is COMBAT_REWARD
3. Render VictoryOverlay as fixed overlay
4. Enemy component shows "defeated" state (grey, faded, or dissolve animation)

---

### Phase C: Enemy Turn Animations (High Priority)

| Task | Owner | Size | Description |
|------|-------|------|-------------|
| **VP-08** | BE/UX | L | **Sequential enemy turns** - Process enemy actions one at a time with visible delay; show "Enemy Name is attacking" indicator |
| **VP-09** | UX | M | **Enemy action indicator** - Highlight active enemy with glow/border during their action; show intent being executed |
| **VP-10** | UX | S | **Damage dealt animation** - Floating damage numbers when enemy attacks player; screen shake for big hits |
| **VP-11** | UX | S | **Block applied visual** - Show shield icon/animation when enemies gain block |

**Recommended approach (animation-layer, not state-driven):**
- Keep reducer synchronous - all enemy actions computed instantly
- Add `enemyTurnQueue` to AnimationOverlay for visual sequencing
- Avoids major reducer surgery, can be skipped with speed setting

---

### Phase D: Quick Polish Wins (Lower Priority)

| Task | Owner | Size | Description |
|------|-------|------|-------------|
| **VP-12** | PM | XS | **Hide DATA EDITOR in production** - Add `import.meta.env.PROD` check to MainMenu |
| **VP-13** | GD | S | **Theme brightness pass** - Raise background from `#0a0a0f` to `#1a1a2e`; update CSS variables |
| **VP-14** | UX | S | **Card text truncation fix** - Ensure card names don't truncate on reward screen |
| **VP-15** | UX | S | **Swipe hint removal** - Remove "← swipe →" text for non-touch devices |

---

## Task Dependencies

```
VP-01 (auto-scroll) ← VP-04 (remember position)
VP-05 (victory overlay) ← VP-06 (defeated enemies) ← VP-07 (transition)
VP-08 (sequential turns) ← VP-09 (action indicator) ← VP-10/VP-11 (damage visuals)
```

**Parallel tracks:**
- Map work (VP-01 through VP-04) can run parallel to combat work (VP-05 through VP-11)
- Quick wins (VP-12 through VP-15) can be done anytime

---

## Validation Gate

Before closing Sprint 4:
- [ ] Map auto-scrolls to player position on load and floor change
- [ ] Player can always see where they are on the map without scrolling
- [ ] Victory screen shows as overlay with combat visible behind
- [ ] Enemy turns animate one-by-one with visible feedback
- [ ] Each enemy shows "attacking" indicator during their turn
- [ ] Floating damage numbers appear for enemy attacks
- [ ] DATA EDITOR button hidden in production build
- [ ] E2E tests pass with updated screenshots
- [ ] Full playthrough feels "polished" not "alpha"

---

## Team Review Notes

**UX:** Use animation-layer approach for VP-08 (not state-driven). Speed multiplier must apply.

**BE:** Keep reducer atomic, animate visually in AnimationOverlay.

**GD:** Brightness already done. Add `.enemy--defeated` CSS class for faded state.

**QA:** Need `data-testid` on animated elements, configurable timing for tests.
