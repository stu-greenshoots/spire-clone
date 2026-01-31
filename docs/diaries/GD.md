# GD Diary - Sprint 3

## Role
Graphic Designer - Art pipeline, asset optimization, visual consistency

## Owned Files
`public/images/`, `src/utils/assetLoader.js`, `scripts/compress-images.js`

## Sprint 3 Tasks
- GD-05: Theme brightness pass (Day 1, P1)
- GD-06: Card art sprite sheets (Day 4+, P2)

---

## Entries

### Magazine Review Notes (58/100)
**Date:** 2026-01-24
**Context:** Game Zone preview review — Presentation scored 6/10

**My takeaways:**
- **Theme too dark** is the #1 visual issue. Reviewer says game "appears as a black rectangle" on most monitors. Background is RGB(10, 10, 15). PM recommends raising to ~#1a1a2e (+20% brightness).
  - Sprint 3 task **GD-05:** CSS variable sweep for all background colors. Small effort, high impact.
  - Need to check: are there CSS variables already, or is it hardcoded hex values scattered through components?
- **Card text truncation:** "Infernal Blade" → "Infernal Bla..." on selection screen. Relates to card frame dimensions (GD-02). May need font-size reduction or width increase.
- **100+ network requests for card art** (mentor callout): Each card art is a separate 50-90KB request. First load fetches all of them.
  - Sprint 3 task **GD-06:** Sprite sheet/texture atlas approach.
  - Options: (a) bundle by rarity/type into sprite sheets, (b) use CSS `background-position` for individual cards, (c) generate a JSON manifest at build time
  - Sharp pipeline can handle composition without new dependencies
  - Could reduce requests from 100+ down to ~10-12 sheets (by type/rarity)
  - Expected 75% request reduction, 30-40% faster initial load
- **Card rarity visual distinction:** No visual difference between common/uncommon/rare in selection. GD-02 should incorporate border color/glow (gold rare, purple uncommon, grey common). Need colorblind-friendly treatment too.
- AI art quality noted as "surprisingly coherent" — no action needed now, but worth noting for future art passes.

---

### Day 3 - GD-02 Complete
**Date:** 2026-01-24
**Status:** GD-02 complete, PR pending
**Done today:**
- Implemented card frame & type visual system in Card.jsx and App.css:
  - Type-specific left border accent (red=attack, blue=skill, gold=power, purple=curse, grey=status)
  - Type-tinted gradient overlay on card body
  - Top glow strip with type color gradient (subtle, 0.7 opacity)
  - Hover box-shadow effects per card type (only when not disabled)
  - Cost orb border tinting to match card type
  - Upgraded card dual-glow combining green upgrade indicator with type color
  - Type label background tint for readability
- Added rarity indicator styles:
  - Common: grey (#95a5a6)
  - Uncommon: blue (#3498db)
  - Rare: gold (#f1c40f)
- Smooth transitions (0.2s cubic-bezier) on all interactive states
- All tests pass, validate clean, no lint errors
**Design decisions:**
- Kept colors at 0.7 opacity to not overwhelm the card art
- Used `not([style*="not-allowed"])` selector to skip hover on disabled cards
- Left border is 4px (vs 2px for other sides) to create a clear type identifier even at small sizes
**Blockers:**
- None
**Next:**
- All my Sprint 2 tasks complete (FIX-04 merged, GD-02 PR pending)
- Sprint 3: GD-05 (brightness pass) and GD-06 (sprite sheets) ready when sprint 3 starts

---

### Sprint 2 Complete
**Date:** 2026-01-24
**Status:** All tasks merged. Sprint 2 DONE.
**Summary:**
- FIX-04: Asset format PNG/WebP fix — MERGED (PR #12)
- GD-02: Card frame & type visual system — MERGED (PR #17), type-specific borders/gradients/rarity indicators
**Satisfaction:** Happy with sprint 2. Card frames give much-needed visual distinction.
**Ready for Sprint 3:** Yes. GD-05 (brightness pass) and GD-06 (sprite sheets) queued.

---

### Sprint 3 Kickoff
**Date:** 2026-01-25
**Status:** Sprint 3 ACTIVE

**My tasks:**
- **GD-05 (Day 1, P1):** Theme brightness pass
  - Raise background from #0a0a0f to ~#1a1a2e
  - Implement CSS custom properties per DEC-007
  - Sweep all hardcoded hex values into :root variables
  - Files: App.css, theme.css (or new file)
  - Can run parallel with PM-03 and UX-05

- **GD-06 (Day 4+, P2):** Card art sprite sheets
  - Reduce 100+ network requests to ~10-12 sprite sheets
  - Build-time composition with Sharp
  - Generate JSON manifest for card ID → sheet position
  - Files: scripts/compress-images.js, assetLoader.js
  - Per DEC-008: investigate CSS background-position vs `<img>` clip approach

**Dependencies:**
- GD-05 has no blockers (Day 1 parallel)
- GD-06 depends on Phase A completion

**Ready to start:** GD-05 immediately

---

### Sprint 7 - GD-audit Complete
**Date:** 2026-01-31
**Status:** GD-audit complete, PR pending targeting sprint-7

**Done today:**
- Full asset audit across all 4 categories (cards, enemies, relics, potions)
- Created `docs/GD-AUDIT.md` with detailed findings
- Key findings:
  - Cards: 96/96 (100% coverage) -- all good
  - Enemies: 34/41 (83% coverage) -- 7 missing art from Sprint 7 JR-03 additions
  - Relics: 49/49 (100%) -- all good
  - Potions: 15/15 (100%) -- all good
  - Dual asset loader system: legacy `public/images/enemies/` is dead (empty dir), `src/assets/art/` is the active pipeline
  - Sprite sheet is stale (34 enemies, should be 41)
  - Naming inconsistency: mix of camelCase and snake_case enemy IDs (documented, not worth fixing)
  - Total asset disk: 8.5 MB, all individual files well under 500 KB limit

**Recommendations documented:**
- P1: Generate art for 7 missing enemies, rebuild sprite sheet
- P2: Remove dead legacy asset loader path, card sprite sheets
- P3: Clean up empty public/images/enemies/ dir

**Next:**
- Generate art for automaton, bronzeOrb, gremlinMinion, mystic, shelledParasite, snecko, sphericGuardian
- Regenerate sprite sheet with all 41 enemies
- Add custom ASCII fallbacks for new enemies in Enemy.jsx

---

### Sprint 7 - GD-08 Complete
**Date:** 2026-01-30
**Status:** GD-08 complete, PR #60 open targeting sprint-7

**Done today:**
- Created `docs/STYLE_GUIDE.md` — one-page style reference (165 lines)
- Documented all CSS custom properties from `:root` (card types, rarity, UI colors)
- Defined surface color palette (backgrounds, overlays, highlights)
- Captured font stack, type scale, base line-height
- Established 4px spacing scale (4/8/12/16/24/32)
- Documented component patterns: cards, buttons, panels, overlays, health bars, screen shake
- All values verified against `src/App.css` and `src/index.css`

**Design decisions:**
- Kept as documentation only — no CSS changes, no new custom properties
- Noted surface colors and spacing are not yet extracted to custom properties (future task)
- Focused on practical reference over comprehensive design system

**Next:**
- Surface colors could be extracted to CSS custom properties in a follow-up task
- Spacing scale could become custom properties when needed

---

### Sprint 6 - GD-06 Complete
**Date:** 2026-01-30
**Status:** GD-06 complete, PR #53 open targeting sprint-6

**Done today:**
- Implemented enemy sprite sheet bundling:
  - Created `scripts/generate-sprite-sheets.js` using sharp to composite 34 enemy WebP images into a single 3072x3072 sprite sheet
  - Generated `sprite-sheet.webp` (2018KB) + `sprite-manifest.json` (position data for all 34 enemies)
  - Individual files total: 2126KB -> sprite sheet: 2018KB (5% smaller, 34 requests -> 1)
  - Updated `art-config.js` with new `getEnemySpriteInfo()` function and sprite sheet loading via `import.meta.glob`
  - Updated `Enemy.jsx` to render sprites via CSS `background-position` with proper scaling (512px cells -> 70-100px display)
  - Full fallback chain: sprite sheet -> asset pipeline -> individual art -> ASCII
  - All 959 tests pass, build succeeds

**Design decisions:**
- Used CSS `background-position` + `background-size` approach (per DEC-008 investigation)
- Single sprite sheet for all enemies (6x6 grid) since 34 images fit well in one sheet
- Sprite sheet is imported via `import.meta.glob` for Vite hashing/bundling
- Manifest JSON is statically imported at module level
- Scale factor computed per render: `displaySize / cellSize` applied to all position/size values
- Individual images still bundled as fallback (e.g., for enemies added after sprite sheet generation)

**Next:**
- Card sprite sheets could follow the same pattern (100+ cards would need multiple sheets)
- Consider adding `npm run generate-sprites` to the build pipeline

---
