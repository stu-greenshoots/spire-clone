# Quality Sprint Plan

**Status:** TEAM DECISION - Ready for execution
**Created:** 2026-01-25
**Decision by:** AI Team (PM/BE/UX/GD/AR/QA)

---

## Team Decision: Execution Order

After brainstorming, the team has decided on this priority order:

### Priority 1: State Builder (Blocks Everything Else)
**Why first:** Without ability to jump to any game state, we can't efficiently test visual changes. We'd have to play through 14 floors to test a boss fight UI change. This is a force multiplier.

**Owner:** BE (architecture) + UX (UI)
**Deliverable:** In-app State Builder accessible from main menu

### Priority 2: Download & Integrate Free SFX
**Why second:** Quick win, can be done in parallel with State Builder. Immediately makes game feel more alive.

**Owner:** AR
**Deliverable:** Replace placeholder sounds with proper SFX from CC0 packs

### Priority 3: Portrait Mobile Combat Redesign
**Why third:** Once we have State Builder, we can rapidly iterate on mobile layout. This is the biggest impact item.

**Owner:** UX + GD
**Deliverable:** Combat screen that works well in portrait (390x844)

### Priority 4: Sprite Art Style Exploration
**Why fourth:** Depends on having the other pieces in place. Can be incremental.

**Owner:** GD
**Deliverable:** Pixel art proof-of-concept for cards/enemies

---

## Phase 1: State Builder

### Scope
- In-app UI to construct any game state
- Accessible from main menu (can hide later)
- Can set: player stats, enemies, hand, deck, relics, potions, floor/act
- Save/load named scenarios
- Console API for automation: `window.__SPIRE__.loadScenario(name)`

### Files to Create/Modify
- `src/components/StateBuilder.jsx` - NEW, main UI
- `src/context/GameContext.jsx` - Add LOAD_SCENARIO action
- `src/data/scenarios/` - NEW directory for preset scenarios
- `src/components/MainMenu.jsx` - Add State Builder button

### Preset Scenarios to Include
```
combat-basic          - Floor 1 Jaw Worm
combat-boss-hexaghost - Act 1 boss
combat-multi-enemy    - 3 slimes
combat-low-hp         - 5 HP danger
combat-full-hand      - 10 cards
shop-rich             - 500 gold
shop-poor             - 15 gold
reward-cards          - 3 rare cards
map-mid               - Floor 8
```

### Acceptance Criteria
- [ ] Can build any combat state (enemies, hand, player stats)
- [ ] Can save state as named scenario
- [ ] Can load preset scenarios
- [ ] Console API works: `window.__SPIRE__.loadScenario('combat-boss-hexaghost')`
- [ ] Works on mobile viewport

---

## Phase 2: SFX Integration

### Sounds Needed
| Sound | Current | Source Pack |
|-------|---------|-------------|
| Card play | ✓ exists | Keep or upgrade |
| Card draw | ✗ missing | 80 CC0 RPG SFX |
| Damage hit | ✓ exists | Keep or upgrade |
| Block | ✓ exists | Keep or upgrade |
| Heal | ✗ missing | Fantasy SFX Library |
| Buff applied | ✗ missing | 80 CC0 RPG SFX (spell) |
| Debuff applied | ✗ missing | 80 CC0 RPG SFX (spell) |
| Enemy death | ✓ exists | Keep or upgrade |
| Gold pickup | ✓ exists | Fantasy SFX Library has better |
| Relic pickup | ✗ missing | 80 CC0 RPG SFX (item) |
| Button click | ✗ missing | 100 CC0 SFX |
| Turn end | ✗ missing | 80 CC0 RPG SFX |
| Victory | ✗ missing | Fantasy SFX Library (jingle) |
| Defeat | ✗ missing | Fantasy SFX Library |

### Process
1. Download packs from OpenGameArt
2. Audition sounds, select best fits
3. Convert to consistent format (MP3, normalized volume)
4. Place in `public/sounds/`
5. Wire into audioSystem.js

### Acceptance Criteria
- [ ] At least 10 distinct sound effects
- [ ] All major actions have audio feedback
- [ ] Sounds feel cohesive (not random collection)
- [ ] Volume normalized across all sounds

---

## Phase 3: Portrait Combat Redesign

### Current Problems (from screenshot analysis)
- Header takes 25% of screen (relics, potions, deck count always visible)
- Enemy area cramped
- Cards clipped at edges
- No room for enemy intents
- Status effects barely visible

### Design Goals (Slice & Dice inspired)
- Maximize combat area
- Hide secondary info in collapsible drawer
- Cards must be touchable (44px+ touch targets)
- Enemy intents clearly visible
- Clean information hierarchy

### Proposed Layout (Portrait)
```
┌─────────────────────────────────┐
│ Act 1 - Floor 8    ♥ 45/80  ⚙ │  <- Minimal header
├─────────────────────────────────┤
│                                 │
│         ENEMY AREA              │  <- 50% of screen
│    (full width, intents clear)  │
│                                 │
├─────────────────────────────────┤
│  [Deck] [Potions] [Relics]      │  <- Collapsible drawer
├─────────────────────────────────┤
│                                 │
│         CARD HAND               │  <- 35% of screen
│   (5 cards, all visible)        │
│                                 │
├─────────────────────────────────┤
│ Draw 5 │ ⚡ 3/3 │  END TURN    │  <- Fixed footer
└─────────────────────────────────┘
```

### Key Changes
1. **Collapsible drawer** for relics/potions/deck - tap to expand
2. **Larger enemy area** - intents always visible
3. **Card hand** - horizontal scroll if needed, or fan that fits
4. **Fixed footer** - energy and end turn always accessible

### Files to Modify
- `src/components/CombatScreen.jsx` - Major refactor
- `src/components/PersistentHeader.jsx` - Simplify for mobile
- `src/components/Card.jsx` - Mobile-optimized sizing
- `src/App.css` - Mobile-first breakpoints

### Acceptance Criteria
- [ ] All 5 cards visible without clipping on 390px width
- [ ] Enemy intents clearly visible
- [ ] Touch targets ≥ 44px
- [ ] No horizontal scroll
- [ ] Relics/potions accessible but not always visible
- [ ] Tested via State Builder at multiple scenarios

---

## Phase 4: Sprite Art Exploration

### Approach
Not replacing all art immediately. Proof of concept first:

1. **Pick 3 test subjects:**
   - 1 card (Strike)
   - 1 enemy (Jaw Worm)
   - 1 UI element (End Turn button)

2. **Create pixel art versions:**
   - 32x32 for enemy
   - 16x16 for card icon
   - Test at 2x and 4x scale

3. **Evaluate:**
   - Does it match Enter the Gungeon feel?
   - Is it readable at mobile size?
   - Does it clash with existing AI art?

4. **Decision point:**
   - Full pixel art transition?
   - Hybrid (pixel UI, AI card art)?
   - Different direction?

### Tools to Research
- Aseprite (pixel art editor)
- AI pixel art generators (if they exist)
- Lospec palettes for consistent colors

### Acceptance Criteria
- [ ] 3 pixel art assets created
- [ ] Tested in-game at mobile resolution
- [ ] Team decision on art direction documented

---

## Execution Timeline

```
Phase 1 (State Builder):
├── Day 1-2: BE builds LOAD_SCENARIO action + data structure
├── Day 2-3: UX builds StateBuilder.jsx UI
├── Day 3: Integrate, test preset scenarios
└── Day 3: Console API + E2E test integration

Phase 2 (SFX) - Parallel with Phase 1:
├── Day 1: AR downloads SFX packs
├── Day 2: AR auditions and selects sounds
├── Day 2-3: AR integrates into audioSystem.js
└── Day 3: Test all sound triggers

Phase 3 (Portrait Redesign):
├── Day 4: UX wireframes mobile combat layout
├── Day 5-6: UX implements new CombatScreen
├── Day 6-7: GD assists with visual polish
├── Day 7: Test all scenarios via State Builder
└── Day 8: Mobile device testing

Phase 4 (Sprite Exploration):
├── Day 8-9: GD creates 3 pixel art POC assets
├── Day 9: Integrate and evaluate
└── Day 10: Document decision on art direction
```

---

## Validation Framework

Since no human playtesting, each phase validates via:

### Automated Checks
- Touch target size ≥ 44px
- No viewport overflow
- All elements visible in State Builder scenarios

### AI Comparative Review
- Screenshot current vs Slice & Dice reference
- Document gaps
- Iterate until gap closes

### Scenario Coverage
Each change tested against:
- `combat-basic`
- `combat-boss-hexaghost`
- `combat-multi-enemy`
- `combat-full-hand`
- `shop-poor`

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| State Builder scope creep | Fixed feature list, no extras |
| SFX doesn't feel cohesive | Select from single pack first, mix later |
| Portrait redesign breaks desktop | Mobile-first, desktop second (acceptable tradeoff) |
| Pixel art doesn't match | POC first before committing |

---

## Success Criteria (End of Quality Sprint)

- [ ] Can jump to any game state in 2 clicks
- [ ] Game has 10+ distinct, cohesive sound effects
- [ ] Combat works well in portrait on 390px viewport
- [ ] All cards visible and touchable
- [ ] AI team can run visual tests without human involvement
- [ ] Clear decision on pixel art direction

---

*This plan was created by the AI team. Execution begins immediately.*
