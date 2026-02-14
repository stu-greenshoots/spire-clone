# Sprint 18: Visual Polish & Ship Readiness

**Created:** 2026-02-07
**Branch:** `sprint-18`
**Theme:** Replace placeholders, complete validation, and prepare for 1.0 release.
**Previous Sprint:** Sprint 17 COMPLETE (15/15 tasks, zero bugs found, 3730 tests)

---

## Why This Sprint Exists

Sprint 17's "Quality Reality" audit found zero code bugs. The game logic is solid after 16 sprints of feature development. But the audit also revealed:

- **131 placeholder assets** — 20 enemy sprites are 3KB gradient blobs, 101 cards have placeholder art, 15 relics are missing art entirely
- **Validation gate incomplete** — keyboard-only playthrough not verified, honest self-assessment not completed
- **Ship readiness unclear** — we claim 100/100 but haven't run a genuine external-perspective evaluation

The code works. Now we need to make it **look** like it works.

---

## Principles

1. **Visual first impressions matter.** Players judge quality in the first 5 seconds.
2. **Complete what's started.** No new features until existing ones are visually complete.
3. **Honest assessment.** Run a real evaluation before claiming ship-ready.
4. **Gradual art improvement.** Don't block on perfection — improve iteratively.

---

## Work Streams (Parallel Execution)

Sprint 18 is organized into 3 parallel work streams:

```
Timeline:
  Stream A (Art Polish)         ████████████████  (All phases)
  Stream B (Validation)         ████████░░░░░░░░  (Phase 1)
  Stream C (Ship Prep)          ░░░░░░░░████████  (Phase 2-3)
```

---

## Stream A: Art Polish

**Goal:** Replace the worst placeholder assets with quality art.
**Owners:** GD (primary), AR (audio accompaniment)
**Depends on:** Nothing — starts immediately
**Source:** `docs/ASSET_AUDIT.md` priority list

### VP-01: Act 1 Boss Sprite Replacement (GD)
**Size:** L | **Priority:** P0
**Files:** `src/assets/art/enemies/`, sprite sheet rebuild

Replace the 3 Act 1 boss sprites (currently 3-5KB placeholders):
- Slime Boss (slimeBoss.webp)
- The Guardian (theGuardian.webp)
- Hexaghost (hexaghost.webp)

These are the first bosses players encounter. Current placeholders are gradient blobs with text.

Acceptance criteria:
- [ ] Each boss sprite is >30KB detailed art
- [ ] Sprites match thematic design (slime = amorphous, guardian = mechanical, hexaghost = spectral)
- [ ] Sprite sheet rebuilt with new assets
- [ ] Verified at runtime — bosses display correctly in combat

### VP-02: Act 1 Elite Sprite Replacement (GD)
**Size:** M | **Priority:** P0
**Files:** `src/assets/art/enemies/`, sprite sheet rebuild

Replace the 2 Act 1 elite sprites:
- Gremlin Nob (gremlinNob.webp)
- Lagavulin (lagavulin.webp)

Acceptance criteria:
- [ ] Each elite sprite is >30KB detailed art
- [ ] Sprites match character design (nob = muscular gremlin, lagavulin = sleeping armored)
- [ ] Sprite sheet rebuilt
- [ ] Verified at runtime

### VP-03: Common Enemy Sprite Replacement (GD)
**Size:** M | **Priority:** P1
**Files:** `src/assets/art/enemies/`, sprite sheet rebuild

Replace 5 common Act 1 enemies:
- Cultist (cultist.webp) — first enemy in tutorial
- Jaw Worm (jawWorm.webp) — common first encounter
- Red Louse (louse_red.webp) — green louse already has art
- Fungi Beast (fungiBeast.webp)
- Automaton (automaton.webp) — Act 2 boss

Acceptance criteria:
- [ ] Each sprite is >20KB detailed art
- [ ] Sprites match existing art style
- [ ] Sprite sheet rebuilt
- [ ] Verified at runtime

### VP-04: Character-Specific Relic Art (GD)
**Size:** M | **Priority:** P1
**Files:** `src/assets/art/relics/`

Create art for 15 missing character-specific relics:
- Ironclad: Blood Oath, Charred Glove, Mark of Pain
- Silent: Cloak of Shadows, Envenom Ring, Ring of Snake, Wrist Blade
- Defect: Cracked Core, Capacitor Coil, Data Disk, Emotion Chip
- Watcher: Damaru, Duality, Golden Eye, Pure Water

Acceptance criteria:
- [ ] All 15 relics have WebP art (>3KB each)
- [ ] Art style matches existing relics
- [ ] Relic selection screen displays all correctly
- [ ] Compendium shows all relic art

### VP-05: High-Priority Card Art (GD)
**Size:** L | **Priority:** P1
**Files:** `src/assets/art/cards/`, card sprite sheet rebuild

Replace placeholder art for 20 highest-visibility cards:
- All 4 Strike variants
- All 4 Defend variants
- Bash (Ironclad starter)
- Eruption, Vigilance (Watcher starters)
- Zap, Dualcast (Defect starters)
- Neutralize, Survivor (Silent starters)
- 5 most common uncommon cards per character

Acceptance criteria:
- [ ] 20 cards have >10KB detailed art
- [ ] Art matches card effect thematically
- [ ] Card sprite sheet rebuilt
- [ ] Verified in deck viewer and combat

### VP-06: Act 2/3 Enemy Art (GD)
**Size:** M | **Priority:** P2
**Files:** `src/assets/art/enemies/`, sprite sheet rebuild

Replace remaining Act 2/3 placeholder sprites:
- Mystic, Shelled Parasite, Snecko, Spheric Guardian (Act 2)
- Maw, Nemesis, Spire Growth, Transient (Act 3)
- Bronze Orb, Gremlin Minion (minions)

Acceptance criteria:
- [ ] 10 sprites replaced with >20KB art
- [ ] Sprite sheet rebuilt
- [ ] Verified at runtime

---

## Stream B: Validation Completion

**Goal:** Complete the Sprint 17 validation gate items.
**Owners:** QA (primary), UX (keyboard verification)
**Depends on:** Nothing — uses Sprint 17 infrastructure

### VP-07: Keyboard-Only Playthrough Verification (QA/UX)
**Size:** S | **Priority:** P0
**Files:** None (verification only), update `SPRINT_BOARD.md`

Verify that full combat is playable via keyboard only:
1. Start new game (each character)
2. Navigate character select via keyboard
3. Play 3 combat encounters using only 1-9, Tab, Enter, E keys
4. Collect rewards, navigate map
5. Document any failures or friction points

Output: Report confirming keyboard-only playability, update validation gate.

Acceptance criteria:
- [ ] All 4 characters tested
- [ ] 3+ floors completed per character
- [ ] Any issues documented
- [ ] SPRINT_BOARD.md validation gate updated

### VP-08: DevTools Full Playthrough Test (QA)
**Size:** M | **Priority:** P0
**Files:** None (verification only)

Run `__SPIRE__.fullPlaythrough()` for all 4 characters:
1. Open browser console
2. Run `__SPIRE__.loadScenario('ironclad-start')` then `__SPIRE__.fullPlaythrough({maxFloors: 10})`
3. Repeat for Silent, Defect, Watcher
4. Document results

Acceptance criteria:
- [ ] Each character completes at least 5 floors via DevTools
- [ ] No JavaScript errors
- [ ] Results documented
- [ ] Validation gate updated

### VP-09: Honest Self-Assessment (PM/QA)
**Size:** M | **Priority:** P0
**Files:** `docs/SELF_ASSESSMENT.md` (new)

Create an honest self-assessment against the original Game Zone Magazine rubric:
- Don't inflate scores
- Note areas of genuine weakness
- Compare against Sprint 14's revelation that audio was broken for 7 sprints

Categories to assess:
- Gameplay mechanics (cards, enemies, relics work correctly)
- Visual presentation (art quality, animations, UI polish)
- Audio (music, SFX, volume controls)
- Performance (load times, FPS, bundle size)
- Accessibility (keyboard nav, contrast, ARIA)
- Content depth (4 characters, 188 cards, 40+ enemies)
- Replayability (endless mode, daily challenges, ascension)

Acceptance criteria:
- [ ] Honest scores in each category
- [ ] Specific issues documented
- [ ] Comparison to claimed 100/100 score
- [ ] Realistic ship readiness assessment

---

## Stream C: Ship Prep

**Goal:** Prepare for 1.0 release.
**Owners:** BE (infrastructure), AR (audio polish), PM (release coordination)
**Depends on:** Streams A & B progress

### VP-10: E2E CI Stabilization (BE/QA)
**Size:** M | **Priority:** P1
**Files:** `.github/workflows/`, `tests/e2e/`

Fix the flaky deploy-smoke tests:
- Investigate root cause of CI failures
- Add retry logic or fix timing issues
- Ensure E2E tests pass consistently

Acceptance criteria:
- [ ] E2E tests pass 10/10 runs on CI
- [ ] Flakiness root cause documented
- [ ] No test skips or flaky annotations

### VP-11: Bundle Optimization (BE)
**Size:** S | **Priority:** P2
**Files:** `vite.config.js`, code-split boundaries

Review and optimize bundle size:
- Current: ~700KB JS, 5MB sprite sheets
- Target: No regression, investigate sprite sheet compression
- Ensure Lighthouse performance 90+

Acceptance criteria:
- [ ] Bundle size documented
- [ ] Lighthouse performance score verified
- [ ] No chunks >200KB JS

### VP-12: Audio Final Pass (AR)
**Size:** S | **Priority:** P2
**Files:** `public/sounds/`

Final audio verification and polish:
- Verify all 52 audio files are normalized
- Check music transitions between phases
- Verify volume controls work in production

Acceptance criteria:
- [ ] All tracks verified in production build
- [ ] Volume controls tested
- [ ] Music transitions smooth

### VP-13: Remaining Card Art (GD)
**Size:** L | **Priority:** P2
**Files:** `src/assets/art/cards/`

Continue replacing placeholder card art:
- Target: 30 additional cards (highest-visibility uncommon/rare)
- Progress toward eliminating 101-card placeholder backlog

Acceptance criteria:
- [ ] 30 cards improved
- [ ] Card sprite sheet rebuilt
- [ ] Progress tracked in ASSET_AUDIT.md

### VP-14: Documentation Polish (PM)
**Size:** S | **Priority:** P2
**Files:** `README.md`, `docs/`

Update documentation for 1.0:
- README with accurate feature list
- Controls documentation (keyboard section)
- Known issues list
- Credits for CC0 assets

Acceptance criteria:
- [ ] README reflects current state
- [ ] Controls documented
- [ ] Known issues honest and current

### VP-15: Release Checklist (PM)
**Size:** S | **Priority:** P2
**Files:** `docs/RELEASE_CHECKLIST.md` (new)

Create a 1.0 release checklist:
- Version tagging
- GitHub Pages deployment
- PWA manifest verification
- Social/announcement prep

Acceptance criteria:
- [ ] Checklist covers all release steps
- [ ] Can be followed by any team member

---

## Task Summary

| Task | Stream | Owner | Size | Priority | Depends On |
|------|--------|-------|------|----------|------------|
| VP-01 | A | GD | L | P0 | - |
| VP-02 | A | GD | M | P0 | - |
| VP-03 | A | GD | M | P1 | - |
| VP-04 | A | GD | M | P1 | - |
| VP-05 | A | GD | L | P1 | - |
| VP-06 | A | GD | M | P2 | - |
| VP-07 | B | QA/UX | S | P0 | - |
| VP-08 | B | QA | M | P0 | - |
| VP-09 | B | PM/QA | M | P0 | VP-07, VP-08 |
| VP-10 | C | BE/QA | M | P1 | - |
| VP-11 | C | BE | S | P2 | - |
| VP-12 | C | AR | S | P2 | - |
| VP-13 | C | GD | L | P2 | VP-05 |
| VP-14 | C | PM | S | P2 | - |
| VP-15 | C | PM | S | P2 | - |

---

## Parallel Execution Plan

### Batch 1 (Start Immediately — No Dependencies)

| Task | Agent | Files Touched |
|------|-------|---------------|
| VP-01 | GD | `src/assets/art/enemies/` (3 boss sprites) |
| VP-02 | GD-2 | `src/assets/art/enemies/` (2 elite sprites) |
| VP-04 | GD-3 | `src/assets/art/relics/` (15 relic icons) |
| VP-07 | QA | None (verification only) |
| VP-08 | QA-2 | None (verification only) |
| VP-10 | BE | `.github/workflows/`, `tests/e2e/` |

**Conflict resolution:**
- VP-01 and VP-02 both touch enemy sprites — can run in parallel if different files
- All verification tasks (VP-07, VP-08) are read-only, no conflicts
- Sprite sheet rebuild should happen after VP-01, VP-02, VP-03 all complete

### Batch 2 (After Batch 1 P0 tasks complete)

| Task | Agent | Depends On |
|------|-------|------------|
| VP-03 | GD | VP-01, VP-02 (shared sprite sheet) |
| VP-05 | GD | None (cards have separate sprite sheet) |
| VP-09 | PM/QA | VP-07, VP-08 (needs verification results) |
| VP-11 | BE | VP-10 (CI must be stable first) |

### Batch 3 (P2 tasks after progress on P0/P1)

| Task | Agent | Depends On |
|------|-------|------------|
| VP-06 | GD | VP-01, VP-02, VP-03 |
| VP-12 | AR | None |
| VP-13 | GD | VP-05 |
| VP-14 | PM | VP-09 |
| VP-15 | PM | VP-14 |

---

## Validation Gate

Sprint 18 is NOT complete until ALL of the following are verified:

### P0 (Must Pass)
- [ ] All 3 Act 1 boss sprites are quality art (>30KB each)
- [ ] All 2 Act 1 elite sprites are quality art (>30KB each)
- [ ] Keyboard-only combat playthrough verified for all 4 characters
- [ ] DevTools fullPlaythrough completes for all 4 characters
- [ ] Honest self-assessment document created
- [ ] `npm run validate` passes

### P1 (Should Pass)
- [ ] All 15 character-specific relics have art
- [ ] 20 high-visibility card art pieces replaced
- [ ] E2E tests pass consistently on CI
- [ ] 5 common enemy sprites replaced

### P2 (Nice to Have)
- [ ] 10 Act 2/3 enemy sprites replaced
- [ ] 30 additional card art pieces improved
- [ ] Bundle optimization reviewed
- [ ] Audio final pass complete
- [ ] Release checklist created

---

## Art Quality Standards

All replacement art must meet these standards:

### Enemy Sprites
- **File size:** >20KB for common enemies, >30KB for elites/bosses
- **Dimensions:** 256x256 or larger, WebP format
- **Style:** Dark fantasy silhouettes with subtle color gradients
- **Contrast:** Visible against any act background

### Card Art
- **File size:** >10KB
- **Dimensions:** 128x128 or larger, WebP format
- **Style:** Match existing card art (illustrated, not photorealistic)
- **Relevance:** Art should represent the card's effect

### Relic Icons
- **File size:** >3KB
- **Dimensions:** 64x64 or larger, WebP format
- **Style:** Match existing relic icons (stylized objects)
- **Clarity:** Recognizable at small size

---

## What We Are NOT Doing

- No new features
- No new characters, cards, enemies, or content
- No gameplay changes
- No major architecture rewrites
- No new game modes

This sprint is about making what we have look professional and verifying it's ship-ready.

---

## Success Criteria for 1.0 Consideration

After Sprint 18, we can consider 1.0 release if:
1. All P0 validation gate items pass
2. Honest self-assessment scores 85+ in all categories
3. No P0 bugs discovered
4. Act 1 visual presentation is professional quality
5. CI pipeline is stable and reliable

If these criteria are not met, Sprint 19 continues the polish work.
