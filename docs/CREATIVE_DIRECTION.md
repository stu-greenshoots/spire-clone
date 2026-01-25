I don# Creative Direction

**Status:** APPROVED
**Created:** 2026-01-25
**Source:** Stu's direction from Sprint 5 brainstorm

---

## Visual References

### Primary: Slay the Spire
- Card design and behavior
- Combat screen layout
- Information hierarchy in fights
- How cards fan, select, play

### Secondary: Enter the Gungeon
- Pixel/sprite aesthetic
- Old-school feel with modern polish
- Chunky, readable sprites
- Not "realistic" - stylized retro

### Tertiary: Slice & Dice
- **Portrait mobile layout** - Works great in both portrait and landscape
- "Perfect game to play in portrait mode on iPhone" - TouchArcade
- Pixel art characters with 3D vector dice
- Clean information hierarchy - shows enemy action paths without looking busy
- Simple yet detailed pixel art for characters and enemies
- https://tann.itch.io/slice-dice

---

## Target Aesthetic

**"Retro sprites, modern feel"**

- Pixel art / sprite-based graphics
- NOT realistic AI art (current approach)
- Chunky, readable at small sizes
- Consistent pixel density across assets
- Dark fantasy theme maintained
- Modern UI polish (smooth animations, good feedback)

---

## Platform Priority

**Mobile-first, portrait orientation**

- Primary: Phone portrait (390x844ish)
- Secondary: Tablet portrait
- Tertiary: Desktop (should work, not optimized)

All UI decisions should ask: "Does this work on a phone in portrait?"

---

## Asset Constraints

### Budget
- **$0** - No budget for commissioned assets
- Must use free/open-source resources
- AI-generated where appropriate

### Music
- Stu will create music
- Format: TBD (MP3, OGG?)
- Loops for: menu, combat, boss, shop, events, victory, defeat

### Sound Effects
- Free SFX libraries (see Resources section)
- Need: card play, card draw, damage hit, block, heal, buff, debuff,
  enemy attack, enemy death, player death, gold pickup, relic pickup,
  button click, menu open/close, turn end, victory fanfare, defeat sting

### Graphics
- Transition to sprite/pixel style over time
- Can't replace all AI art immediately
- Prioritize: cards, enemies, UI elements
- Background art can remain gradient/procedural

---

## Free Asset Resources

### Sound Effects (Researched & Verified)

**Best CC0 Packs on OpenGameArt:**
- [80 CC0 RPG SFX](https://opengameart.org/content/80-cc0-rpg-sfx) - blade, creature sounds, coins, gems, spell sounds
- [Fantasy Sound Effects Library](https://opengameart.org/content/fantasy-sound-effects-library) - 45 sounds: dragon, goblin, spells, gold pickup, traps
- [100 CC0 SFX](https://opengameart.org/content/100-cc0-sfx) - hit, item, metal, misc sounds
- [RPG Sound Pack](https://opengameart.org/content/rpg-sound-pack) - public domain RPG-specific sounds
- [CC0 Fantasy Music & Sounds](https://opengameart.org/content/cc0-fantasy-music-sounds) - high quality fantasy music

**Other Sources:**
- **itch.io** - [Free fantasy SFX](https://itch.io/game-assets/free/tag-fantasy/tag-sound-effects)
- **Pixabay** - [CC0 sounds](https://pixabay.com/sound-effects/search/cc0/)
- **Kenney.nl** - High quality free game assets

### Pixel Art / Sprites
- **OpenGameArt.org** - Lots of fantasy pixel art
- **Kenney.nl** - Consistent style asset packs
- **itch.io free assets** - Search "pixel art fantasy free"
- [Tiny Pixel Card Roguelike Game UI](https://assetstore.unity.com/packages/2d/gui/tiny-pixel-card-roguelike-game-ui-236116) - Reference for pixel card UI (tiles 16x16, cards 220x34)
- **Lospec** - Pixel art palettes and tutorials

### Fonts
- **Google Fonts** - Free web fonts
- **DaFont** - Free fonts (check licenses)
- **Fontsource** - npm-installable fonts

---

## Sprite Size Guidelines

Based on research into Enter the Gungeon and similar games:

| Element | Recommended Size | Notes |
|---------|------------------|-------|
| Characters/Enemies | 20-32px | Keep under 30x30 for consistent aesthetic |
| Card icons | 16x16 | Standard tile size |
| UI tiles | 16x16 base | Can scale 2x or 4x for display |
| Weapon/item icons | ~32px | Consistent with ETG style |
| Touch targets | ≥44x44px | Apple HIG minimum for mobile |

**Key insight from ETG modding community:** "A good rule of thumb is to keep sprites below a 30px X 30px square."

---

## AI Decision Framework

Since no human playtesting, the AI team must decide what "works best."

### Quantitative Metrics (Automated)
- Touch target size ≥ 44px
- No viewport overflow
- Text contrast ≥ 4.5:1
- Load time < 2s
- Bundle size < 1MB
- Animation duration 150-400ms

### Comparative Analysis (AI Judgment)
When making visual/UX decisions:

1. **Screenshot current state**
2. **Screenshot reference game** (StS, Balatro, Gungeon)
3. **Compare side-by-side**
4. **Document differences**
5. **Propose changes to close gap**
6. **Implement and re-compare**

### Quality Checklist (Per Screen)
- [ ] Would this screenshot look out of place next to Balatro?
- [ ] Is all critical information visible without scrolling?
- [ ] Are touch targets comfortable for thumb use?
- [ ] Is text readable without squinting?
- [ ] Does animation provide feedback, not frustration?
- [ ] Is the visual hierarchy clear (what's most important)?

### A/B Comparison Process
When uncertain between two approaches:
1. Implement both as toggleable options
2. Screenshot both on mobile
3. Apply quality checklist to both
4. Document reasoning for choice
5. Remove losing option

---

## Engine Portability

Design decisions should consider future rebuild in another language/engine.

### What Should Be Engine-Agnostic

**Game Data (JSON/portable)**
- Card definitions (id, cost, effects, art reference)
- Enemy definitions (id, hp, moveset, art reference)
- Relic definitions
- Event definitions
- Encounter tables
- Balance numbers

**Art Assets (files)**
- Sprite sheets (PNG)
- Sound effects (MP3/OGG)
- Music (MP3/OGG)
- Fonts (TTF/WOFF2)

**Game Logic (documented)**
- Combat rules
- Damage calculation
- Status effect behavior
- AI patterns

### What's React-Specific (OK to rebuild)
- Components
- State management
- Animation implementation
- Routing

### Portability Principle
> If we rebuild in Unity/Godot/Swift tomorrow, we should be able to:
> 1. Copy all JSON data files directly
> 2. Copy all asset files directly
> 3. Re-implement logic from documentation
> 4. Only rebuild UI/rendering layer

---

## Immediate Priorities

Based on this direction:

1. **State Builder** - Enable testing any state (see TESTING_VISION.md)
2. **Mobile Layout Audit** - Document all mobile issues
3. **Portrait Combat Redesign** - Balatro-inspired layout
4. **Find Free SFX** - Build sound library
5. **Sprite Style Exploration** - Can we generate/find pixel art?

---

## Open Questions

1. **Pixel density for sprites?**
   - 16x16? 32x32? 64x64?
   - Need to pick one for consistency

2. **Color palette?**
   - Should define limited palette for pixel art consistency
   - Reference: Lospec palettes

3. **Card art transition?**
   - Replace AI art with pixel art?
   - Or keep AI art, just make UI more pixel-styled?

4. **Animation style?**
   - Tweened (smooth modern)?
   - Frame-by-frame (retro)?
   - Hybrid?

---

*This document captures Stu's creative direction. AI team uses this as north star for all visual/audio decisions.*
