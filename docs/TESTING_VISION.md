# Testing Vision: State Builder & Automated Validation

**Status:** DRAFT - Brainstorming
**Created:** 2026-01-25
**Context:** Sprint 5 brainstorm - "How do we test without human involvement?"

---

## The Problem

We can't validate that the game **feels good** without:
1. Playing through to specific states (tedious, slow)
2. Human playtesting (not ready for that yet)
3. Seeing the game on mobile (engineers test on desktop)

We need a way to:
- Jump to any game state instantly
- Test visual appearance at that state
- Automate "feel" checks (layout, touch targets, overflow)
- Do this without human involvement

---

## Core Idea: In-App State Builder

An in-app tool (like Data Editor, but for runtime state) that lets you:

### Build Any State
- Set player stats (HP, gold, strength, block, status effects)
- Set floor/act/phase
- Choose enemies (from full enemy list)
- Set enemy stats (HP, intent, status effects)
- Build a hand (pick specific cards)
- Build a deck
- Add relics and potions
- Set the map state (which nodes visited)

### Then Play From There
- Click "Start" and you're in that exact state
- Test boss fights without playing 14 floors
- Test shop with exactly 15 gold
- Test combat with 10 cards in hand
- Test any edge case imaginable

### Save & Load Scenarios
- Save your built state as a named scenario
- Load it later
- Share scenarios as JSON files
- Build a library of test scenarios

---

## State Builder UI Concept

```
┌─────────────────────────────────────────────────┐
│  STATE BUILDER                            [X]   │
├─────────────────────────────────────────────────┤
│                                                 │
│  PHASE: [Combat ▼]                              │
│                                                 │
│  ─── PLAYER ───────────────────────────────     │
│  HP: [45] / [80]     Gold: [200]                │
│  Energy: [3] / [3]   Block: [0]                 │
│  Strength: [2]  Dexterity: [0]  Weak: [0]       │
│  Vulnerable: [0]  Frail: [0]  Artifact: [0]     │
│                                                 │
│  ─── LOCATION ─────────────────────────────     │
│  Act: [1 ▼]   Floor: [15]                       │
│                                                 │
│  ─── ENEMIES ──────────────────────────────     │
│  [+ Add Enemy]                                  │
│  ┌─────────────────────────────────────────┐    │
│  │ Hexaghost     HP: [250]/[250]           │    │
│  │ Intent: [Attack ▼] Damage: [6]          │    │
│  │ Vulnerable: [0]  Strength: [0]    [X]   │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  ─── HAND ─────────────────────────────────     │
│  [+ Add Card]                                   │
│  [Strike] [Strike] [Defend] [Bash] [Offering]   │
│                                                 │
│  ─── DECK ─────────────────────────────────     │
│  Cards in deck: 12  [Edit Deck...]              │
│                                                 │
│  ─── RELICS ───────────────────────────────     │
│  [+ Add Relic]                                  │
│  [Burning Blood] [Vajra] [Pen Nib]              │
│                                                 │
│  ─── POTIONS ──────────────────────────────     │
│  Slot 1: [Fire Potion ▼]                        │
│  Slot 2: [None ▼]                               │
│  Slot 3: [Block Potion ▼]                       │
│                                                 │
│  ─── SCENARIOS ────────────────────────────     │
│  [Save As...]  [Load ▼]                         │
│                                                 │
│  ════════════════════════════════════════════   │
│           [ START FROM THIS STATE ]             │
│  ════════════════════════════════════════════   │
└─────────────────────────────────────────────────┘
```

---

## Preset Scenarios Library

Pre-built scenarios for common test cases:

### Combat Scenarios
| Name | Description | Tests |
|------|-------------|-------|
| `combat-basic` | Floor 1 Jaw Worm, starter deck | Basic combat flow |
| `combat-boss-act1` | Hexaghost, mid-game deck | Boss UI, large enemy |
| `combat-multi-enemy` | 3 slimes | Targeting, layout with many enemies |
| `combat-low-hp` | 5 HP, dangerous enemy | Urgency, HP visibility |
| `combat-full-hand` | 10 cards in hand | Hand overflow, card readability |
| `combat-many-buffs` | Lots of status effects | Status effect display |
| `combat-elite` | Gremlin Nob with Vulnerable | Elite difficulty, modifiers |

### Shop Scenarios
| Name | Description | Tests |
|------|-------------|-------|
| `shop-rich` | 500 gold | Full shop interaction |
| `shop-poor` | 15 gold | Affordability UI, disabled states |
| `shop-empty` | 0 gold | Edge case |

### Reward Scenarios
| Name | Description | Tests |
|------|-------------|-------|
| `reward-cards` | 3 rare cards to choose | Card selection, rarity visibility |
| `reward-relic` | Relic + gold + card choice | Full reward flow |

### Map Scenarios
| Name | Description | Tests |
|------|-------------|-------|
| `map-start` | Floor 1, fresh run | Starting state |
| `map-mid` | Floor 8, paths available | Mid-run navigation |
| `map-pre-boss` | Floor 14 | Boss anticipation |

### Edge Cases
| Name | Description | Tests |
|------|-------------|-------|
| `max-relics` | 20+ relics | Relic display overflow |
| `long-card-names` | Cards with very long names | Text truncation |
| `zero-energy` | 0 energy, playable 0-cost cards | Energy state |

---

## Automated Testing Integration

### How AI Can Use This

1. **Load scenario** via console API or direct state injection
2. **Take screenshot** at mobile resolution
3. **Run automated checks**:
   - Touch targets ≥ 44px
   - No horizontal overflow
   - Text contrast passes WCAG
   - All interactive elements visible
4. **Compare to golden screenshots** (visual regression)
5. **Output report** with pass/fail per scenario

### Console API (Dev Mode)

```javascript
// Load a preset scenario
window.__SPIRE__.loadScenario('combat-boss-act1');

// Build custom state
window.__SPIRE__.setState({
  phase: 'COMBAT',
  player: { currentHp: 10, maxHp: 80 },
  enemies: [{ id: 'hexaghost' }],
  hand: ['strike', 'defend', 'bash'],
});

// List available scenarios
window.__SPIRE__.listScenarios();

// Export current state as scenario
window.__SPIRE__.exportState(); // Returns JSON
```

### E2E Test Pattern

```javascript
test('visual: boss fight on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  // Inject state via console
  await page.evaluate(() => {
    window.__SPIRE__.loadScenario('combat-boss-act1');
  });

  await page.waitForTimeout(500); // Let state settle

  // Visual regression
  await expect(page).toHaveScreenshot('boss-fight-mobile.png');

  // Layout checks
  const cards = await page.locator('.card').all();
  for (const card of cards) {
    const box = await card.boundingBox();
    expect(box.width).toBeGreaterThanOrEqual(44);
  }
});
```

---

## Validation Checks We Can Automate

### Layout Checks
- [ ] No horizontal scroll on mobile viewport
- [ ] All touch targets ≥ 44x44px
- [ ] No elements overflow their containers
- [ ] Cards in hand are all visible (not clipped)
- [ ] Enemy intents are visible
- [ ] Status effects are visible

### Accessibility Checks
- [ ] Text contrast ratio ≥ 4.5:1 (WCAG AA)
- [ ] Interactive elements have focus states
- [ ] No text smaller than 12px on mobile

### Visual Regression
- [ ] Screenshot matches golden image (within threshold)
- [ ] Key elements are in expected positions
- [ ] No unexpected visual changes

### Functional Checks (per scenario)
- [ ] Cards are playable (not all disabled)
- [ ] End Turn button is visible and clickable
- [ ] Enemy HP bars are visible
- [ ] Player HP is visible

---

## Implementation Approach

### Phase 1: State Builder UI
- New component: `StateBuilder.jsx`
- Accessible from main menu (dev mode only)
- Can set all state fields
- "Start" button applies state and begins game

### Phase 2: Scenario Library
- Preset scenarios in `src/test/fixtures/scenarios.js`
- Save/load custom scenarios to localStorage
- Export/import as JSON

### Phase 3: Console API
- `window.__SPIRE__` global in dev mode
- `loadScenario()`, `setState()`, `exportState()`
- Used by E2E tests

### Phase 4: Automated Visual Tests
- Playwright tests that load each scenario
- Screenshot comparison
- Layout audit checks
- Run on every PR

### Phase 5: CI Integration
- `npm run test:visual` in CI pipeline
- Fail PR if visual regression detected
- Fail PR if layout checks fail

---

## Open Questions

1. **Where does State Builder live?**
   - Replace Data Editor?
   - Separate button on main menu?
   - Hidden behind key combo (Ctrl+Shift+D)?

2. **How do we handle map state?**
   - Map is procedurally generated
   - Do we need to save/load full map structure?
   - Or just "floor 8, combat node"?

3. **Scenario storage format?**
   - JSON files in repo?
   - localStorage?
   - Both?

4. **Golden screenshots - where stored?**
   - In repo (bloats size)?
   - Separate artifact storage?
   - Generated on first run?

5. **Mobile testing in CI?**
   - Playwright can emulate mobile viewport
   - But not actual device testing
   - Is emulation good enough?

6. **What's "good enough" visual regression threshold?**
   - Exact pixel match is too strict (font rendering varies)
   - 1% difference? 5%?

---

## Relationship to Existing Tools

### Data Editor
- Currently edits card/enemy/relic **definitions**
- State Builder edits **runtime state**
- Could merge them or keep separate

### Save System
- Already serializes game state
- State Builder uses same format
- Scenarios are just saved states with names

### E2E Tests
- Already exist with Playwright
- State Builder enables targeted scenario tests
- No more "play through 14 floors to test boss"

---

## Success Criteria

When this is done, we can:

1. ✅ Jump to any game state in 2 clicks
2. ✅ Test boss fight without playing 14 floors
3. ✅ Test shop with exactly 15 gold
4. ✅ See mobile layout without deploying
5. ✅ Automated PR checks catch visual regressions
6. ✅ Automated PR checks catch layout issues
7. ✅ Build new scenarios as we discover edge cases
8. ✅ AI can run full visual test suite without human

---

## Next Steps

1. **Review this doc** - Does this solve the problem?
2. **Decide on UI location** - Where does State Builder live?
3. **Prioritize** - Is this Sprint 6 work or sooner?
4. **Size it** - Estimate effort for each phase

---

*This document captures brainstorming from Sprint 5 team session. Not yet approved for implementation.*
