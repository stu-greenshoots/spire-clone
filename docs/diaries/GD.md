# GD Diary - Sprint 2

## Role
Graphic Designer - Art pipeline, asset optimization, visual consistency

## Owned Files
`public/images/`, `src/utils/assetLoader.js`, `scripts/compress-images.js`

## Sprint 2 Tasks
- FIX-04: Asset format PNG/WebP inconsistency (P0)
- GD-02: Card frames (P1)

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
