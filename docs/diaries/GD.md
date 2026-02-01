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

### Sprint 14 - GD-25 Complete
**Date:** 2026-02-01
**Status:** GD-25 complete, PR #171 merged to sprint-14

**Done today:**
- Created `scripts/generate-quality-enemy-art.js` with detailed SVG silhouettes for 5 Act 1 boss/elite enemies
- Targets: slimeBoss, theGuardian, hexaghost, gremlinNob, lagavulin
- Each enemy has unique thematic silhouette and color palette:
  - Slime Boss: massive amorphous blob with multiple eyes, dripping slime tendrils, split-line hint
  - The Guardian: towering stone/metal construct with glowing gem core, shield arms, rune markings
  - Hexaghost: six ghostly flames in hexagonal orbit around spectral skull core, connecting arcs
  - Gremlin Nob: hulking muscular gremlin with massive spiked club, aggressive stance, rage aura
  - Lagavulin: armored sleeping warrior with heavy helmet, glowing visor eyes, greatsword across lap
- Rebuilt enemy sprite sheet (45 enemies, 1747KB -- down from previous build)

**Validation:** `npm run validate` passes

**Next:** Sprint 14 GD tasks complete

---

### Sprint 14 - GD-24 Complete
**Date:** 2026-02-01
**Status:** GD-24 complete, PR #170 merged to sprint-14

**Done today:**
- Created `scripts/generate-quality-card-art.js` with detailed SVG silhouettes for 10 Ironclad cards
- Targets: Strike, Defend, Bash, Anger, Cleave, Iron Wave, Pommel Strike, Shrug It Off, Body Slam, Clothesline
- Each card now has thematic visual elements instead of simple gradient+text:
  - Strike: sword blade with slash trail and impact sparks
  - Defend: shield with protective aura rings and sparkles
  - Bash: mace with impact shockwave and debris
  - Anger: clenched fist with rage flames and embers
  - Cleave: wide axe sweep with multi-target indicators
  - Iron Wave: shield + sword combo with connecting energy waves
  - Pommel Strike: reversed sword pommel jab with card draw hint
  - Shrug It Off: armored shoulders with block energy and draw sparkle
  - Body Slam: charging body slam with ground crack
  - Clothesline: extended arm strike with weakness debuff hint
- Rebuilt card sprite sheet (157 cards, 3078KB — down from 3449KB)
- File sizes reduced: individual cards went from 20-47KB to 4-5KB each (more detailed but cleaner SVGs)

**Validation:** `npm run validate` passes — 0 errors, 3 pre-existing warnings

**Next:** GD-25 (enemy art quality pass) pending as remaining P0

---

### Sprint 13 - GD-23 Complete
**Date:** 2026-02-01
**Status:** GD-23 complete, PR #163 merged to sprint-13

**Done today:**
- Identified 5 lowest-quality enemy sprites by file size: snecko (2.2K), mystic (2.3K), automaton (2.9K), bronzeOrb (3.3K), sphericGuardian (3.3K)
- Created `scripts/generate-polish-sprites.js` with detailed SVG silhouettes for each enemy
- Each sprite gets unique color palette, silhouette geometry, and atmospheric effects matching dark fantasy theme
- Snecko: serpentine body coils + hypnotic yellow eyes + forked tongue
- Mystic: hooded robed figure + glowing hands + healing energy stream
- Automaton: massive mechanical boss + angular chest plate + glowing red eyes
- Bronze Orb: floating sphere + red central eye/lens + energy crackle
- Spheric Guardian: crystalline faceted sphere + shield aura rings + blue eye
- Rebuilt enemy sprite sheet (45 enemies, 2040KB)

**Validation:** `npm run validate` passes — 2606 tests, lint clean, build clean

**Next:** All GD Sprint 13 tasks complete (GD-22 + GD-23)

---

### Sprint 13 - GD-22 Complete
**Date:** 2026-02-01
**Status:** GD-22 complete, PR #161 merged to sprint-13

**Done today:**
- Generated Defect character portrait (512x512 WebP, blue/cyan palette, automaton silhouette with orbiting orbs)
- Generated 30 Defect card art images (blue/cyan dark fantasy theme, type/rarity color variation)
- Generated 4 orb type art images (lightning yellow, frost blue, dark purple, plasma orange)
- Rebuilt card sprite sheet: 127 → 157 cards (10-col, 16-row grid, 3449KB)
- Added `getOrbImage()` to art-config.js following existing asset loading pattern
- Wired orb images into CombatScreen with emoji fallback
- Created `generate-defect-card-art.js` and `generate-orb-art.js` scripts

**Key decisions:**
- Blue/cyan palette for Defect cards — distinguishes from Ironclad red and Silent green at a glance
- Orb images are 128x128 (smaller than card/enemy 512x512) — appropriate for 40px display size
- Emoji fallback preserved in orb rendering — graceful degradation if images fail to load
- Extended existing generate-character-art.js rather than duplicating (single script for all characters)

**Validation:** `npm run validate` passes — 2606 tests, lint clean, build clean

**Next:**
- All GD Sprint 13 P1 tasks complete (GD-22)
- GD-23 (P2 stretch): Art polish pass — replace 5 lowest-quality AI sprites

---

### Sprint 12 - GD-21 Complete
**Date:** 2026-02-01
**Status:** GD-21 complete, PR #149 merged to sprint-12

**Done today:**
- Added act-based background color differentiation to both CombatScreen and MapScreen
- CombatScreen: `ACT_THEMES` config with per-act hue shifts, `applyActTint()` helper shifts hex colors subtly
  - Act 1: cool blue-purple (unchanged default)
  - Act 2: slightly warmer green-teal tint
  - Act 3: warm amber/orange tint
  - Act 4: deep crimson shift for the Heart
- MapScreen: Container background and SVG gradient stops now act-aware via ternary expressions
- Enemy-type theming (boss, elite, slime, cultist) preserved — act tint layers underneath
- 2 files changed, 45 insertions, 19 deletions

**Key decisions:**
- Used channel-level color shifting rather than CSS filter approach — more precise, no dependency on CSS support
- Kept shifts subtle (hueShift 0.15-0.35) so act differences are felt rather than jarring
- Act 4 uses negative shift (crimson) to reinforce the Heart's blood-red atmosphere

**Validation:** `npm run validate` passes — 2366 tests, lint clean, build clean

**Next:**
- All GD Sprint 12 tasks complete (GD-19, GD-20, GD-21)
- Sprint 12 is fully done from GD perspective

---

### Sprint 12 - GD-20 No-Op
**Date:** 2026-02-01
**Status:** GD-20 is already complete — no work needed

**Investigation:**
- `corruptHeart.webp` already exists in `src/assets/art/enemies/` (66KB, 512x512, high-quality art)
- Sprite manifest already includes `corruptHeart` at index 7 (row 1, col 0)
- Sprite sheet already built with the Heart included (45 enemies, 7x7 grid)
- `art-config.js` already serves Heart art via `getEnemySpriteInfo('corruptHeart')`
- No Act 4 background system exists — game uses CSS for screen styling, not image backgrounds
- No other acts have background images (no `src/assets/art/backgrounds/` directory)
- CombatScreen has no act-specific theming/coloring

**Conclusion:**
- Heart enemy sprite: already done (from an earlier sprint)
- Act 4 background: no infrastructure exists. Would require building a background image system from scratch, which is out of scope for this task.
- No PR needed — nothing to change.

**Next:**
- If Act 4 background theming is desired, a new task should be created to build a background image system for all acts (not just Act 4)

---

### Sprint 12 - GD-19 Complete
**Date:** 2026-02-01
**Status:** GD-19 complete, PR #142 merged to sprint-12

**Done today:**
- Added unique CSS idle animations for 3 key bosses:
  - **Hexaghost**: Fiery pulse glow (2.5s) — brightness and orange drop-shadow intensify at peak
  - **Awakened One**: Eerie phase shimmer (4s) — subtle rotation and hue-rotate shift
  - **Corrupt Heart**: Rhythmic heartbeat (1.5s) — quick double-pump with magenta glow, 68% rest period
- Updated Enemy.jsx `getAnimation()` to dispatch boss-specific animations by enemy ID
- Other bosses (Slime Boss, Guardian, Champ, Time Eater, Automaton) retain default `breathe` animation
- 2 files changed, 38 insertions, 1 deletion

**Key decisions:**
- Heart animation uses asymmetric timing (8%/16%/24%/32% keyframes) to mimic real heartbeat rhythm
- Awakened One uses hue-rotate for an otherworldly shimmer without changing the sprite itself
- Kept animations subtle — enhance atmosphere without distracting from gameplay

**Validation:** `npm run validate` passes — 2248 tests, lint clean, build clean

**Next:**
- GD-20 (Heart art) and GD-21 (Act backgrounds) pending as P1/P2

---

### Sprint 11 - GD-18 Complete
**Date:** 2026-02-01
**Status:** GD-18 complete, PR #136 merged to sprint-11

**Done today:**
- Generated placeholder WebP art for all 31 Silent cards (512x512, green/teal dark fantasy palette)
- Color variation by card type: attacks greener, skills bluer, powers brighter, rares more saturated
- Created `scripts/generate-silent-card-art.js` for reproducible generation via SVG→sharp→WebP
- Rebuilt card sprite sheet from 96 → 127 cards (10-col grid, 13 rows, 5120x6656px, 3278KB)
- Updated sprite-manifest.json with all 127 card positions
- Sprite sheet generator validates all card IDs have art — zero missing

**Key decisions:**
- Green/teal palette distinguishes Silent cards from Ironclad's red/fire tones at a glance
- Followed same placeholder pattern as event/enemy/character art generators
- Individual images still available as fallback, but sprite sheet is primary delivery

**Validation:** `npm run validate` passes — 2248 tests, lint clean, build clean

**Next:**
- All GD Sprint 11 tasks complete (GD-16, GD-17, GD-18)
- Sprint 11 is fully done from GD perspective
- Placeholder art could be upgraded to higher quality in future sprints

---

### Sprint 11 - GD-17 Complete
**Date:** 2026-02-01
**Status:** GD-17 complete, PR #130 merged to sprint-11

**Done today:**
- Generated character portrait art for Ironclad (warrior silhouette, red palette) and Silent (hooded assassin, green palette)
- Both images are 512x512 WebP with dark fantasy radial gradients, vignette, and character silhouettes
- Added `getCharacterImage()` to art-config.js following existing asset loading pattern
- Updated CharacterSelect.jsx to display portraits as 100px circular thumbnails with color-matched borders/glow
- Created `scripts/generate-character-art.js` for reproducible generation via SVG→sharp→WebP
- Graceful fallback: if images missing, buttons render text-only (same as before)

**Key decisions:**
- Circular crop for portraits — fits the button layout, adds visual weight without crowding
- Both characters get portraits (not just Silent) — consistent selection screen
- Silhouettes use geometric shapes (not detailed art) — matches placeholder style used across the project

**Validation:** `npm run validate` passes — 2120 tests, lint clean, build clean

**Next:**
- GD-18 (Silent card art — 30 illustrations, sprite sheet rebuild) pending as P2 stretch

---

### Sprint 11 - GD-16 Complete
**Date:** 2026-01-31
**Status:** GD-16 complete, PR #125 merged to sprint-11

**Done today:**
- Enhanced Card.jsx rarity visuals: uncommon cards get blue glow, rare cards get gold glow with stronger box-shadow
- Added rarity label text ("UNCOMMON" / "RARE") between type badge and description in full-size card view
- Updated DeckViewer.jsx to show rarity classes and labels for uncommon/rare cards
- Added CSS styles in App.css for deck viewer rarity borders, glow effects, and label colors
- Uses existing CSS variables (--uncommon-color, --rare-color) for consistency

**Key decisions:**
- Rarity label hidden in small mode (in-hand cards) — keeps combat view clean
- Common cards intentionally left with default styling — only uncommon/rare get special treatment
- DeckViewer only shows rarity for uncommon/rare (common is implicit default)

**Validation:** `npm run validate` passes — 2111 tests, lint clean, build clean

**Next:**
- GD-17 (Silent character art) and GD-18 (Silent card art) pending

---

### Sprint 10 - GD-15 Complete
**Date:** 2026-01-31
**Status:** GD-15 complete, PR #119 merged to sprint-10

**Done today:**
- Generated 5 placeholder WebP images (512x512) for Act 3 reality fracture events
- Events: reality_seam, dissolving_pattern, core_echo, identity_fork, war_memory
- Color palettes: purple for Reality Seam, green for Dissolving, orange for Core Echo, magenta for Identity Fork, yellow for War Memory
- Added `getEventImage()` to art-config.js following existing pattern
- Updated EventScreen.jsx to render event art first with emoji fallback
- Created `scripts/generate-event-art.js` for reproducible generation

**Key finding:**
- EventScreen.jsx uses a LOCAL `EVENTS` array with emoji+color fields, not the Act 3 events from src/data/events.js
- The image fallback approach works for both: events with art get images, events without get emoji
- 8 files changed, 120 insertions, 9 deletions — well under 300 line limit

**Validation:** `npm run validate` passes — 1973 tests, lint clean, build clean

**Next:**
- All GD Sprint 10 tasks complete (GD-14, GD-15)
- Placeholder art could be upgraded to higher quality in future sprints

---

### Sprint 10 - GD-14 Complete
**Date:** 2026-01-31
**Status:** GD-14 complete, PR #115 merged to sprint-10

**Done today:**
- Generated placeholder art for 4 missing Act 3 enemies: transient, spireGrowth, maw, nemesis
- Each is 512x512 WebP with dark fantasy themed radial gradient and enemy name text
- Color palettes: blue for Transient, green for Spire Growth, red for Maw, purple for Nemesis
- Rebuilt sprite sheet from 41 → 45 enemies (7x7 grid, 3584x3584px, 2044KB)
- Updated sprite-manifest.json with all 45 entries

**Key finding:**
- Task was scoped as "8 sprites" but only 4 were actually missing (transient, spireGrowth, maw, nemesis)
- The other 4 Act 3 enemies (giant_head, writhing_mass, orbWalker, reptomancer) already had art from earlier sprints
- Awakened One (boss) also already had high-quality art

**Validation:** `npm run validate` passes — 1973 tests, lint clean, build clean

**Next:**
- GD-15 (P2 stretch): Act 3 event art — 5 scene illustrations for reality fractures
- All placeholder enemies could be upgraded to higher-quality art in a future pass

---

### Sprint 9 - GD-13 Complete (Verification)
**Date:** 2026-01-31
**Status:** GD-13 complete, PR #102 merged to sprint-9

**Done today:**
- Verified all 49 relic WebP images exist in `src/assets/art/relics/`
- Verified all 15 potion WebP images exist in `src/assets/art/potions/`
- Confirmed all UI components use image-first rendering with emoji fallback
- Components checked: PersistentHeader, ShopScreen, DeckViewer, RewardScreen, VictoryScreen, GameOverScreen, PotionSlots
- Since all images exist, emoji fallback never triggers — zero emoji in production UI

**Key finding:**
- As predicted in GD-12 diary entry, GD-13 was a no-op
- All relic/potion art was already generated in earlier sprints
- GD-12 wired all components to use images; GD-13 confirms nothing was missed
- No new art generation or sprite sheet rebuild needed

**Validation:** `npm run validate` passes — no code changes needed

**Next:**
- All GD Sprint 9 tasks complete (GD-12, GD-13)
- Sprint 9 1.0 validation gate: "All relics/potions have icon art (no emoji)" — SATISFIED

---

### Sprint 9 - GD-12 Complete
**Date:** 2026-01-31
**Status:** GD-12 complete, PR #97 merged to sprint-9

**Done today:**
- Wired existing relic WebP assets to all UI components that were still showing emoji
- All 49 relic images already existed in `src/assets/art/relics/` — only PersistentHeader's header row used `getRelicImage()`
- Updated 6 components: RewardScreen, ShopScreen, DeckViewer, VictoryScreen, GameOverScreen, PersistentHeader (popup)
- Each uses `getRelicImage(relic.id)` with emoji fallback if image not found
- All 15 potion images already wired via PotionSlots — no changes needed

**Key finding:**
- The task was scoped as "generate 20 icons" but all 49 relic + 15 potion images already existed from earlier sprints
- The real gap was that most components hardcoded `relic.emoji` instead of using `getRelicImage()`
- No new art generation needed — purely a wiring fix

**Validation:** `npm run validate` passes — 1736 tests, lint clean, build clean

**Next:**
- GD-13 (placeholder icons) may also be a no-op — verify whether any relics/potions are actually missing images
- If all have images, GD-13 becomes "verify all assets load" rather than "generate silhouettes"

---

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

### Sprint 8 - GD-11 Complete
**Date:** 2026-01-31
**Status:** GD-11 complete, PR #91 merged to sprint-8

**Done today:**
- Bundled 96 individual card art images into a single sprite sheet
- Extended `generate-sprite-sheets.js` to support `--type=cards` flag (reusable for any asset type)
- Generated 5120x5120 sprite sheet (10 cols × 10 rows, 3199KB vs 3466KB individual)
- Added `getCardSpriteInfo()` to art-config.js following enemy sprite pattern
- Updated `getCardArtInfo()` to try sprite sheet first, fall back to individual images
- Updated Card.jsx to render from sprite sheet via CSS `background-position`
- Added `npm run generate-card-sprites` script to package.json

**Performance impact:**
- Network requests: 96 → 1
- Total size: 3466KB → 3199KB (8% smaller)
- Fallback chain preserved: sprite sheet → individual image → icon

**Design decisions:**
- Used 10-column grid (vs 7 for enemies) to keep sheet roughly square at 96 images
- Card art display is smaller (88px vs 512px cells), so scale factor handles the mapping
- Individual images still bundled as eager fallback — could be optimized to lazy in future

**Validation:** `npm run validate` passes — 1159 tests, lint clean, build clean

**Next:**
- All GD Sprint 8 tasks complete (GD-10, GD-09, GD-11)
- Sprint 8 is fully done from GD perspective

---

### Sprint 8 - GD-09 Complete
**Date:** 2026-01-31
**Status:** GD-09 complete, PR #84 merged to sprint-8

**Done today:**
- Generated placeholder art for 7 missing Act 2 enemies: automaton, bronzeOrb, gremlinMinion, mystic, shelledParasite, snecko, sphericGuardian
- Each is 512x512 WebP with dark fantasy themed radial gradient and enemy name text
- Rebuilt sprite sheet from 34 → 41 enemies using 7-column grid (3584x3072px, 2033KB)
- Updated sprite-manifest.json with all 41 entries
- All enemies now served from sprite sheet — no ASCII fallbacks in normal play

**Design decisions:**
- Used themed color palettes per enemy type (bronze for mechanical, purple for mystic, teal for reptile, etc.)
- Placeholder style is serviceable — can be replaced with higher-quality art later
- Changed grid from 6 to 7 columns to fit 41 enemies in 6 rows

**Validation:** `npm run validate` passes — 1137 tests, lint clean, build clean

**Next:**
- GD-11 (P2 stretch): Card sprite sheets if time permits
- AR-08 depends on GD-09 completion — now unblocked

---

### Sprint 8 - GD-10 Complete
**Date:** 2026-01-31
**Status:** GD-10 complete, PR #79 merged to sprint-8

**Done today:**
- Professional dark fantasy title screen upgrade
- Replaced generic "A Deck-Building Roguelike" subtitle with Endless War narrative tone ("The Endless War" + atmospheric tagline)
- Added Settings button accessible from title screen (modal overlay pattern)
- Removed emoji feature grid for cleaner, more atmospheric first impression
- Added entrance fade-in animation with staggered title/button timing
- Vignette overlay for depth, responsive title sizing via clamp()
- Sharper button styling (8px border-radius, semi-transparent borders)
- All 1131 tests pass, build clean

**Design decisions:**
- Kept existing atmospheric elements (starfield, spire silhouette, embers, fog) — they work well
- Settings opens as modal overlay rather than navigating to separate phase — simpler, stays on title screen
- Removed FeatureItem grid — felt cluttered and too "mobile app store" for dark fantasy tone
- Used muted purple-grey palette (#8878a0, #9988aa) for secondary text to maintain atmosphere
- Entrance animation is subtle (0.8s fade + translate) — professional, not flashy

**Next:**
- GD-09: Generate 7 missing enemy sprites + rebuild sprite sheet (41 enemies)

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
