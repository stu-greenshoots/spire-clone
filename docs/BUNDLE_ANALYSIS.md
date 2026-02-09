# Bundle Analysis

**Last Updated:** 2026-02-09 (Sprint 18 VP-11)
**Build Tool:** Vite 6.x with React plugin

## Summary

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Total JS | 788 KB | <1 MB | ✅ Pass |
| Largest JS chunk | 184.2 KB | <200 KB | ✅ Pass |
| Total assets | ~15 MB | N/A | Expected |
| JS chunks | 30 | N/A | Well-split |
| PWA precache | 425 entries | N/A | Cacheable |

## JavaScript Chunks

### Core Chunks (by size, uncompressed)

| Chunk | Size | Gzipped | Purpose |
|-------|------|---------|---------|
| vendor-react | 184.2 KB | 59.0 KB | React + ReactDOM |
| game-data | 150.6 KB | 36.2 KB | Cards, enemies, relics, events data |
| art-assets | 73.7 KB | 14.7 KB | Asset import manifest |
| CombatScreen | 66.4 KB | 18.5 KB | Main combat UI |
| game-systems | 49.9 KB | 14.7 KB | Combat, card, save systems |
| game-reducers | 45.0 KB | 13.7 KB | State reducers |
| MainMenu | 36.2 KB | 7.8 KB | Title screen + compendiums |
| PersistentHeader | 18.5 KB | 5.0 KB | Header bar |
| Card | 14.0 KB | 4.2 KB | Card component |
| MapScreen | 13.4 KB | 4.9 KB | Map navigation |
| index | 13.1 KB | 4.8 KB | Entry point |
| RestSite | 12.8 KB | 3.7 KB | Rest site screen |

### Lazy-loaded Screens

All game screens are lazy-loaded via `React.lazy()`:
- MainMenu, CombatScreen, MapScreen, RewardScreen, ShopScreen
- EventScreen, RestSite, GameOverScreen, VictoryScreen
- CharacterSelect, DeckViewer, Settings, PauseMenu
- EndlessTransition, PlayerStatusBar, PersistentHeader

### Code-splitting Strategy

Configured in `vite.config.js` with manual chunks:
- `vendor-react` — React core (cached long-term)
- `vendor` — Other npm dependencies
- `game-data` — Static game content (cards, enemies, relics)
- `game-systems` — Game logic (combat, saves, audio)
- `game-reducers` — State management
- `game-context` — React context
- `art-assets` — Asset manifest
- `game-hooks` — Custom React hooks
- `game-utils` — Utility functions
- `audio` — Audio system

## Asset Breakdown

### Images (WebP)
| Category | Count | Size |
|----------|-------|------|
| Card art | ~188 | ~4.5 MB |
| Enemy sprites | ~45 | ~3 MB |
| Relic icons | ~64 | ~0.8 MB |
| UI/misc | ~30 | ~0.5 MB |
| Sprite sheets | 2 | ~4.8 MB |
| **Total** | **334** | **~11.5 MB** |

### Audio
| Category | Count | Size |
|----------|-------|------|
| Music tracks | 7 | ~3 MB |
| SFX | 45 | ~1 MB |
| **Total** | **52** | **~4 MB** |

## Performance Characteristics

### Initial Load
- Critical path: index.js (13 KB) + vendor-react (184 KB) + CSS (34 KB)
- Total blocking: ~231 KB (~73 KB gzipped)
- First Contentful Paint: Fast (React hydration)

### Code Splitting Benefits
- Screens loaded on-demand (combat, shop, events)
- Game data loaded when needed
- Audio system deferred

### PWA Caching
- Service Worker precaches 425 assets (14.5 MB)
- Subsequent loads served from cache
- Offline-capable after first visit

## Optimization History

### Sprint 16 (BE-33)
- Implemented manual chunks
- Reduced index chunk from 1.2 MB to 13 KB
- Added React.lazy for all screens
- Set assetsInlineLimit to 0

### Sprint 18 (VP-11)
- Verified all chunks under 200 KB target
- Documented bundle composition
- No regressions from art additions

## Recommendations

### Current State: Acceptable
The bundle is well-optimized for a game of this complexity:
- JavaScript is properly split into ~30 chunks
- No single chunk exceeds 200 KB
- React is isolated for long-term caching
- Assets are cached by service worker

### Future Improvements (Not Blocking)
1. **Sprite sheet optimization** — Current sheets are 1.5 MB + 3.2 MB. Could be split by act for faster initial load.
2. **Tree-shaking game-data** — If individual characters have separate builds, could reduce initial data.
3. **WebP quality tuning** — Some AI-generated art could use lower quality settings without visible impact.

## Verification Commands

```bash
# Build and analyze
npm run build

# Check for chunks over 200KB
for f in dist/assets/*.js; do
  size=$(wc -c < "$f")
  if [ $size -gt 204800 ]; then
    echo "EXCEEDS: $(basename $f) - $((size/1024))KB"
  fi
done

# Total JS size
ls -la dist/assets/*.js | awk '{total += $5} END {printf "%.2f KB\n", total/1024}'

# Total dist size
du -sh dist/
```
