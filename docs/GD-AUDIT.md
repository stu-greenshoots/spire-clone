# GD Asset Audit - Sprint 7

**Date:** 2026-01-31
**Author:** GD (Graphic Designer)
**Scope:** All image assets in `src/assets/art/` and `public/images/`

---

## Summary

| Category | Data Items | Art Files | Coverage | Status |
|----------|-----------|-----------|----------|--------|
| Cards | 96 | 96 | 100% | COMPLETE |
| Enemies | 41 | 34 individual + sprite sheet | 83% | 7 MISSING |
| Relics | 49 | 49 | 100% | COMPLETE |
| Potions | 15 | 15 | 100% | COMPLETE |

**Total disk usage:** 8.5 MB (src/assets/art/)

---

## 1. Missing Enemy Art (7 enemies)

These enemies were added in Sprint 7 (JR-03 tasks) but have no art and no sprite sheet entry. They fall back to generic ASCII art.

| Enemy ID | Type | Added In | Fallback |
|----------|------|----------|----------|
| `gremlinMinion` | minion | JR-03c | Generic ASCII (no custom) |
| `mystic` | normal | JR-03a | Generic ASCII (no custom) |
| `snecko` | normal | JR-03a | Generic ASCII (no custom) |
| `shelledParasite` | normal | JR-03b | Generic ASCII (no custom) |
| `sphericGuardian` | elite | JR-03b | Generic ASCII (no custom) |
| `automaton` | boss | JR-03d | Generic boss ASCII (no custom) |
| `bronzeOrb` | minion | JR-03d | Generic ASCII (no custom) |

**Impact:** These enemies render with placeholder ASCII art instead of images. The sprite sheet (34 enemies) is stale and needs regeneration.

**Fix:** Generate WebP art for these 7 enemies, add custom ASCII fallbacks in Enemy.jsx, regenerate sprite sheet.

---

## 2. Naming Inconsistency

Enemy IDs use a mix of camelCase and snake_case:

- **camelCase (18):** jawWorm, fungiBeast, gremlinNob, sentryA, snakePlant, bookOfStabbing, gremlinLeader, gremlinMinion, slaverBlue, shelledParasite, sphericGuardian, bronzeOrb, orbWalker, slimeBoss, theGuardian, theChamp, timeEater, corruptHeart
- **snake_case (10):** louse_red, louse_green, slime_small, slime_medium, slime_large, spike_slime_small, spike_slime_medium, writhing_mass, giant_head, awakened_one

Art files match their enemy IDs exactly, so there is no mismatch between code and files. However, the inconsistency makes the naming convention unclear.

**Recommendation:** Document the convention (both are valid per `isValidAssetName()`). Do NOT rename -- too many downstream references. Future enemies should prefer snake_case.

---

## 3. Dual Asset Loader Systems

Two independent systems load enemy images:

1. **Legacy:** `src/utils/assetLoader.js` -- loads from `public/images/enemies/{id}.png|.webp` via `<img>` tag at runtime. Used by `Enemy.jsx` (fallback path 2).
2. **Current:** `src/assets/art/art-config.js` -- loads from `src/assets/art/enemies/` via Vite `import.meta.glob`. Includes sprite sheet support. Used by `Enemy.jsx` (fallback paths 1 and 3).

The `public/images/enemies/` directory contains only `.gitkeep` -- no actual images. The legacy loader's preload always fails silently, so `imageReady` is always false. This means fallback path 2 in Enemy.jsx is dead code.

**Impact:** Minor -- the dead code path costs a failed network request per enemy on first render (caught silently). No visual bug.

**Fix (quick win):** Remove the legacy `preloadEnemyImage` call from Enemy.jsx and the dead `imageReady` rendering branch. Or remove the empty `public/images/enemies/` directory. See "Quick Wins" below.

---

## 4. File Size Analysis

### By Category
| Directory | Size | File Count | Avg Size |
|-----------|------|------------|----------|
| cards/ | 3.6 MB | 96 files | ~38 KB |
| enemies/ | 4.1 MB | 34 + sprite sheet | ~62 KB individual, 2 MB sprite |
| relics/ | 644 KB | 49 files | ~13 KB |
| potions/ | 164 KB | 15 files | ~11 KB |

### Largest Files
- `enemies/sprite-sheet.webp` -- 2.0 MB (34 enemies in 3072x3072 grid)
- `enemies/reptomancer.webp` -- 92 KB
- `enemies/orbWalker.webp` -- 92 KB
- `cards/juggernaut.webp` -- 64 KB

All individual files are well under the 500 KB limit. The sprite sheet is reasonable for 34 composited images.

**Recommendation:** Card sprite sheets would reduce 96 requests to ~4-5 sheets. Lower priority than missing enemy art.

---

## 5. Optimization Opportunities

### P1 - Should Fix
1. **Generate art for 7 missing enemies** -- automaton (boss) is highest priority
2. **Regenerate sprite sheet** to include all 41 enemies
3. **Add custom ASCII fallbacks** for 7 new enemies in Enemy.jsx

### P2 - Nice to Have
4. **Remove dead legacy asset loader path** from Enemy.jsx
5. **Card sprite sheets** -- 96 individual requests could become ~4-5 sheets
6. **Standardize naming convention** in documentation

### P3 - Low Priority
7. **Remove `public/images/enemies/.gitkeep`** -- directory is unused since sprite sheet migration
8. **Consider removing `src/utils/assetLoader.js`** entirely if legacy path is fully dead

---

## 6. Quick Wins (Done in This PR)

- [x] Documented full audit findings (this file)
- No code changes in this PR -- missing art generation and sprite sheet rebuild are separate tasks

---

## Appendix: Full Asset Inventory

### Enemy Art Files (34/41)
awakened_one, bookOfStabbing, byrd, centurion, chosen, corruptHeart, cultist, dagger, fungiBeast, giant_head, gremlinLeader, gremlinNob, hexaghost, jawWorm, lagavulin, looter, louse_green, louse_red, orbWalker, reptomancer, sentryA, slaverBlue, slimeBoss, slime_large, slime_medium, slime_small, snakePlant, spike_slime_medium, spike_slime_small, spiker, theChamp, theGuardian, timeEater, writhing_mass

### Missing Enemy Art (7)
automaton, bronzeOrb, gremlinMinion, mystic, shelledParasite, snecko, sphericGuardian
