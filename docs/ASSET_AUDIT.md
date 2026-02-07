# Visual Asset Audit - Sprint 17 QR-06

**Date:** 2026-02-07
**Auditor:** GD (Graphic Designer)
**Purpose:** Catalog every visual asset, identify placeholders, and prioritize replacements

---

## Executive Summary

| Category | Total | Art Exists | High Quality | Placeholder | Missing |
|----------|-------|------------|--------------|-------------|---------|
| Enemies | 45 | 45 (100%) | 25 (56%) | 20 (44%) | 0 |
| Cards | 188 | 189 (100%) | 88 (47%) | 101 (53%) | 0 |
| Relics | 64 | 49 (77%) | 49 (100%) | 0 | 15 |
| Potions | 15 | 15 (100%) | 15 (100%) | 0 | 0 |
| Orbs | 4 | 4 (100%) | 4 (100%) | 0 | 0 |
| Stances | 3 | 3 (100%) | 3 (100%) | 0 | 0 |
| Characters | 4 | 4 (100%) | 4 (100%) | 0 | 0 |
| Backgrounds | 4 | 4 (100%) | 4 (100%) | 0 | 0 |
| **Total** | **327** | **313** | **192** | **121** | **15** |

**Key Findings:**
1. **15 relics are missing art** — these are the character-specific relics added in Sprint 16
2. **20 enemy sprites are placeholder quality** (3-5KB simple gradients with text)
3. **101 card art images are placeholder quality** (under 5KB)
4. Intent icons use emoji (by design) — no image assets needed
5. Status effect icons use emoji (by design) — no image assets needed

---

## Enemy Sprites (45 total)

All 45 enemy sprites exist. Quality is categorized by file size:
- **High Quality (>30KB):** Detailed art with silhouettes and effects
- **Placeholder (3-10KB):** Simple gradients with text overlay

### High Quality Sprites (25)

| Enemy ID | File Size | Notes |
|----------|-----------|-------|
| awakened_one | 77.7KB | Boss, Act 3 |
| bookOfStabbing | 39.5KB | Act 2 enemy |
| byrd | 59.9KB | Act 2 enemy |
| centurion | 38.0KB | Act 2 enemy |
| chosen | 70.3KB | Act 2 enemy |
| corruptHeart | 64.6KB | Final boss |
| dagger | 54.1KB | Reptomancer minion |
| giant_head | 85.8KB | Act 3 elite |
| gremlinLeader | 80.6KB | Act 2 boss |
| looter | 44.6KB | Act 1 enemy |
| louse_green | 42.5KB | Act 1 enemy |
| orbWalker | 90.3KB | Act 3 enemy |
| reptomancer | 89.4KB | Act 2 enemy |
| sentryA | 66.7KB | Act 1 elite |
| slaverBlue | 54.6KB | Act 2 enemy |
| slime_large | 69.5KB | Act 1 elite |
| slime_medium | 70.9KB | Act 1 enemy |
| slime_small | 78.0KB | Act 1 enemy |
| snakePlant | 75.5KB | Act 2 enemy |
| spike_slime_medium | 53.3KB | Act 1 enemy |
| spike_slime_small | 62.3KB | Act 1 enemy |
| spiker | 43.3KB | Act 1 enemy |
| theChamp | 75.2KB | Act 2 boss |
| timeEater | 61.8KB | Act 3 boss |
| writhing_mass | 53.5KB | Act 3 enemy |

### Placeholder Sprites — Priority for Replacement (20)

| Priority | Enemy ID | File Size | Notes |
|----------|----------|-----------|-------|
| P1 | slimeBoss | 4.9KB | **Act 1 boss** — first boss players fight |
| P1 | theGuardian | 3.6KB | **Act 1 boss** — high visibility |
| P1 | hexaghost | 3.8KB | **Act 1 boss** — high visibility |
| P1 | gremlinNob | 3.8KB | **Act 1 elite** — common early elite |
| P1 | lagavulin | 2.7KB | **Act 1 elite** — common early elite |
| P2 | automaton | 3.4KB | Act 2 boss |
| P2 | cultist | 3.3KB | Act 1 enemy — first enemy in tutorial |
| P2 | jawWorm | 3.6KB | Act 1 enemy — common first encounter |
| P2 | louse_red | 3.1KB | Act 1 enemy (green louse has good art) |
| P2 | fungiBeast | 3.3KB | Act 1 enemy |
| P3 | bronzeOrb | 3.5KB | Automaton minion |
| P3 | gremlinMinion | 3.4KB | Gremlin Leader minion |
| P3 | mystic | 3.7KB | Act 2 enemy (healer) |
| P3 | shelledParasite | 3.5KB | Act 2 enemy |
| P3 | snecko | 4.1KB | Act 2 enemy |
| P3 | sphericGuardian | 3.8KB | Act 2 enemy |
| P3 | maw | 3.1KB | Act 3 enemy |
| P3 | nemesis | 3.5KB | Act 3 elite |
| P3 | spireGrowth | 4.2KB | Act 3 enemy |
| P3 | transient | 3.7KB | Act 3 enemy |

**Sprite Sheet:** `sprite-sheet.webp` (1595KB) contains all 45 enemies. Rebuild required after art updates.

---

## Card Art (188 cards)

All 188 cards in data have art files. One extra file (`sprite-sheet.webp`) exists for the card sprite sheet.

### Quality Distribution

| Quality Level | Count | Percentage |
|---------------|-------|------------|
| High Quality (>20KB) | 88 | 47% |
| Placeholder (<5KB) | 101 | 53% |

### Placeholder Cards by Character (101 total)

**Ironclad:** ~20 cards with placeholder art
**Silent:** ~31 cards with placeholder art
**Defect:** ~30 cards with placeholder art
**Watcher:** ~20 cards with placeholder art

Note: Many common cards (Strike, Defend variants, colorless) have detailed art. Character-specific uncommon/rare cards tend to be placeholders.

### Priority Replacements

The following high-visibility cards have placeholder art:

| Priority | Card | Character | Reason |
|----------|------|-----------|--------|
| P1 | strike (all variants) | All | Most played card |
| P1 | defend (all variants) | All | Most played card |
| P1 | bash | Ironclad | Starter card |
| P2 | eruption | Watcher | Starter stance card |
| P2 | vigilance | Watcher | Starter stance card |
| P2 | zap | Defect | Starter orb card |
| P2 | dualcast | Defect | Starter orb card |

**Card Sprite Sheet:** `sprite-sheet.webp` (3155KB) exists. Rebuild required after art updates.

---

## Relics (64 total, 15 missing)

### Missing Relic Art (15)

These are character-specific relics added in Sprint 16:

| Relic ID | Character | Notes |
|----------|-----------|-------|
| blood_oath | Ironclad | Character-specific |
| charred_glove | Ironclad | Character-specific |
| mark_of_pain | Ironclad | Character-specific |
| cloak_of_shadows | Silent | Character-specific |
| envenom_ring | Silent | Character-specific |
| ring_of_snake | Silent | Character-specific |
| cracked_core | Defect | Character-specific |
| capacitor_coil | Defect | Character-specific |
| data_disk | Defect | Character-specific |
| emotion_chip | Defect | Character-specific |
| damaru | Watcher | Character-specific |
| duality | Watcher | Character-specific |
| golden_eye | Watcher | Character-specific |
| pure_water | Watcher | Starter relic (Miracle) |
| wrist_blade | Silent | Character-specific |

**All 49 existing relic images are high quality (>5KB).**

---

## Potions (15 total)

All 15 potions have art. All are high quality.

| Potion ID | File Size | Status |
|-----------|-----------|--------|
| All potions | 5-10KB each | ✓ Complete |

---

## Other Assets

### Orbs (4)
All 4 Defect orb types have art:
- lightning.webp (3.2KB)
- frost.webp (3.2KB)
- dark.webp (3.0KB)
- plasma.webp (3.1KB)

### Stances (3)
All 3 Watcher stances have art:
- calm.webp (1.2KB)
- wrath.webp (1.0KB)
- divinity.webp (2.0KB)

### Characters (4)
All 4 character portraits exist:
- ironclad.webp (5.4KB)
- silent.webp (5.2KB)
- defect.webp (5.4KB)
- watcher.webp (5.5KB)

### Backgrounds (4)
All 4 act backgrounds exist:
- act1.webp (7.6KB)
- act2.webp (8.6KB)
- act3.webp (8.4KB)
- act4.webp (9.0KB)

---

## Intent Icons

**By Design:** Intent icons do not use image assets. They use color-coded text labels:
- Attack intents show damage values in red
- Defend intents show block values in blue
- Buff intents show green labels
- Debuff intents show purple labels

This is intentional for clarity and accessibility.

---

## Status Effect Icons

**By Design:** Status effects use emoji icons (💪, 💀, 🛡️, etc.) with color-coded backgrounds.

This is intentional — emoji provide universal iconography that scales well and doesn't require asset management.

---

## Priority Replacement List (QR-11)

Based on this audit, the following assets should be prioritized for replacement:

### Top 10 Priority Replacements

| # | Asset Type | ID | Priority | Reason |
|---|------------|-----|----------|--------|
| 1 | Enemy | slimeBoss | P1 | Act 1 boss, first boss encounter |
| 2 | Enemy | theGuardian | P1 | Act 1 boss, high visibility |
| 3 | Enemy | hexaghost | P1 | Act 1 boss, high visibility |
| 4 | Enemy | gremlinNob | P1 | Act 1 elite, common early fight |
| 5 | Enemy | lagavulin | P1 | Act 1 elite, common early fight |
| 6 | Enemy | cultist | P2 | First enemy in tutorial |
| 7 | Enemy | jawWorm | P2 | Common first encounter |
| 8 | Relic | pure_water | P2 | Watcher starter relic |
| 9 | Enemy | automaton | P2 | Act 2 boss |
| 10 | Enemy | louse_red | P2 | Common Act 1 (green has art) |

### Additional Recommendations

1. **Generate art for 15 missing relics** — character-specific relics need WebP art
2. **Improve Act 1 boss sprites first** — players see these early, sets quality expectations
3. **Consider card art pass** — 53% of cards are placeholders, but many are rarely played
4. **Rebuild sprite sheets** after any art updates

---

## File Locations

| Asset Type | Directory | Count |
|------------|-----------|-------|
| Enemy sprites | `src/assets/art/enemies/` | 46 files (45 + sprite sheet) |
| Card art | `src/assets/art/cards/` | 190 files (189 + sprite sheet) |
| Relic icons | `src/assets/art/relics/` | 49 files |
| Potion icons | `src/assets/art/potions/` | 15 files |
| Orbs | `src/assets/art/orbs/` | 4 files |
| Stances | `src/assets/art/stances/` | 3 files |
| Characters | `src/assets/art/characters/` | 4 files |
| Backgrounds | `src/assets/art/backgrounds/` | 4 files |

---

## Validation Notes

- All existing assets load correctly (verified via art-config.js)
- Sprite sheets include manifest files for position lookup
- Fallback chain: sprite sheet → individual image → ASCII/emoji
- No broken image paths found
- Asset loading respects `import.meta.env.BASE_URL` for GitHub Pages deployment

---

*Audit complete. Next steps: QR-11 (Placeholder Asset Replacement) should use this document to prioritize work.*
