# Visual Polish Reference - Sprint 4

This document catalogs the current visual issues identified via E2E test screenshots and describes the target state for each screen.

---

## 1. Main Menu

**Screenshot:** `screenshots/01-main-menu-*.png`

### Issues
| Issue | Severity | Fix |
|-------|----------|-----|
| DATA EDITOR button visible | P1 | Hide in production build |
| Very dark background | P2 | Consider brightening to #1a1a2e |

---

## 2. Map Screen

**Screenshot:** `screenshots/02-map-screen-*.png`

### Issues
| Issue | Severity | Fix |
|-------|----------|-----|
| Map starts scrolled to boss (top) | P0 | Auto-scroll to player's current floor |
| No "you are here" indicator | P1 | Add visible marker at current position |
| No scroll position indicator | P2 | Add "Floor X of 15" indicator |
| Scroll position lost on return | P2 | Remember and restore scroll position |

### Target State
```
┌──────────────────────────────┐
│     ► [Current Floor] ◄      │ ← Auto-scrolled to view
│       "You are here"         │
│           indicator          │
├──────────────────────────────┤
│  ▓▓▓░░░░░░░ Floor 3/15       │ ← Position indicator
└──────────────────────────────┘
```

---

## 3. Combat Screen - Enemy Turns

**Screenshot:** `screenshots/03-combat-start-*.png`

### Issues
| Issue | Severity | Fix |
|-------|----------|-----|
| Enemy turns happen all at once | P0 | Sequential processing with delays |
| No "enemy is attacking" indicator | P1 | Highlight active enemy |
| "← swipe →" hint confusing | P2 | Only show on touch devices |

### Target Enemy Turn Sequence
```
0ms      - "Enemy Turn" banner appears
200ms    - First enemy highlights (glow/border)
400ms    - Intent animation plays
600ms    - Damage/effect applied, floating number
1000ms   - Next enemy highlights
...      - Repeat for each enemy
Final    - "Your Turn" banner
```

---

## 4. Victory Screen

**Screenshot:** `screenshots/04-combat-victory-*.png`

### Issues
| Issue | Severity | Fix |
|-------|----------|-----|
| Full screen replacement | P0 | Should be overlay on combat |
| Loses combat context | P0 | Show defeated enemies behind |
| Abrupt transition | P2 | Add smooth fade animation |

### Target State
```
┌────────────────────────────────────┐
│     [Combat Screen Behind]         │
│   ┌────────────────────────────┐   │
│   │  (defeated enemies, faded) │   │
│   └────────────────────────────┘   │
│ ┌──────────────────────────────────┤
│ │    🏆 VICTORY! (overlay)         │
│ │    [Gold] [Card] [Continue]      │
│ └──────────────────────────────────┤
└────────────────────────────────────┘
```

### Defeated Enemy CSS
```css
.enemy--defeated {
  opacity: 0.3;
  filter: grayscale(100%);
}
```

---

## Implementation Priority

### Must Have (P0)
1. **VP-01**: Map auto-scroll to current floor
2. **VP-05**: Victory overlay on combat
3. **VP-08**: Sequential enemy turns

### Should Have (P1)
4. **VP-02**: "You are here" indicator
5. **VP-09**: Enemy action indicator
6. **VP-10**: Floating damage numbers
7. **VP-12**: Hide DATA EDITOR

### Nice to Have (P2+)
8. VP-03, VP-04, VP-07, VP-11, VP-13, VP-14, VP-15
