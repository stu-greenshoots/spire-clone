# Performance Baseline (Sprint 20 - Before UX-37 Refactor)

**Created:** 2026-02-14
**Task:** BE-35
**Purpose:** Establish performance baseline BEFORE UX-37 mobile card interaction refactor
**Sprint:** 20 (Mobile UX Fix)

---

## Executive Summary

This document establishes a performance baseline for Spire Ascent's combat system before the UX-37 mobile card interaction refactor. It will be used to detect regressions after the refactor is complete.

**Key Metrics:**
- **Target:** 60fps (16.67ms frame budget) in combat
- **Current State:** TBD (awaiting manual profiling)
- **Critical Actions:** PLAY_CARD, END_TURN, ENEMY_TURN, SELECT_CARD

**Expected Impact of UX-37:**
- Touch gesture state machine extraction may reduce event handler overhead
- Removing 300ms animation delay should reduce perceived latency
- Refactoring CombatScreen.jsx may trigger re-render optimizations

---

## Methodology

### 1. Reducer Timing (Automated)

Uses QR-14's `window.__SPIRE_PERF__` API to measure reducer execution time.

**How to collect:**
1. Start dev server: `npm run dev`
2. Open browser to http://localhost:5173
3. Open DevTools console
4. Paste contents of `scripts/profile-combat.js`
5. Wait for profiling to complete (~30 seconds)
6. Copy results: `copy(__PROFILE_RESULTS__)`

**Metrics captured:**
- Average reducer execution time per action type
- Max execution time per action type
- Number of slow actions (>16ms frame budget)
- Action frequency during combat

### 2. React Component Rendering (Manual)

Uses React DevTools Profiler to measure component render performance.

**How to collect:**
1. Install React DevTools browser extension
2. Open React DevTools → Profiler tab
3. Click "Start profiling"
4. Play 5 combat turns (use cards, end turn, take damage)
5. Click "Stop profiling"
6. Export flamegraph and component timings

**Key components to watch:**
- `CombatScreen` (1861 lines, complex state, many event handlers)
- `Card` (rendered 5-10 times per hand)
- `Enemy` (rendered 1-5 times per encounter)
- `AnimationOverlay` (triggered on every card play)
- `DevOverlay` (FPS counter overhead)

**Metrics to capture:**
- Total render time per component
- Number of renders during 5-turn combat
- Self time vs children time
- Commits per second

### 3. Frame Rate Measurement (Automated)

Uses `requestAnimationFrame` to measure actual FPS during combat.

**How to collect:**
- Included in `scripts/profile-combat.js`
- Samples FPS every second for 10 seconds during combat
- Reports average and minimum FPS

**Target:** 60fps sustained, no drops below 50fps

### 4. Memory Usage (Automated)

Uses `performance.memory` API (Chrome-only) to track heap growth.

**How to collect:**
- Included in `scripts/profile-combat.js`
- Captures heap before and after combat sequence
- Reports memory delta

**Red flags:**
- >10MB growth during single combat
- Memory not released after combat ends

---

## Test Scenarios

All scenarios use `window.__SPIRE__.loadScenario()` for consistency.

| Scenario | Description | Expected Duration | Expected Actions |
|----------|-------------|-------------------|------------------|
| `combat-basic` (Ironclad) | 3 Jaw Worms, starter deck | 5 turns | ~15 PLAY_CARD, 5 END_TURN, 5 ENEMY_TURN |
| `combat-elite` (Ironclad) | Gremlin Nob, upgraded deck | 5 turns | ~15 PLAY_CARD, 5 END_TURN, 5 ENEMY_TURN |
| `combat-boss` (Ironclad) | Guardian, full deck | 5 turns | ~20 PLAY_CARD, 5 END_TURN, 5 ENEMY_TURN |
| `combat-basic` (Silent) | 3 Jaw Worms, starter deck | 5 turns | ~15 PLAY_CARD, 5 END_TURN, 5 ENEMY_TURN |
| `combat-basic` (Defect) | 3 Jaw Worms, starter deck | 5 turns | ~15 PLAY_CARD, 5 END_TURN, 5 ENEMY_TURN |
| `combat-basic` (Watcher) | 3 Jaw Worms, starter deck | 5 turns | ~15 PLAY_CARD, 5 END_TURN, 5 ENEMY_TURN |

**Rationale:**
- Character variation: Different mechanics (orbs, stances) have different render patterns
- Encounter variation: Elite/boss combats have more complex intents and status effects
- Duration: 5 turns provides enough actions for statistical significance without fatigue

---

## Baseline Data

### Reducer Timing (BEFORE UX-37)

**Collection Date:** TBD
**Method:** `scripts/profile-combat.js`

#### Top 10 Slowest Actions (Averaged Across All Tests)

| Action Type | Avg Time (ms) | Max Time (ms) | Exceeds 16ms Budget? |
|-------------|---------------|---------------|----------------------|
| TBD         | TBD           | TBD           | TBD                  |

#### Critical Action Breakdown

| Action | Avg (ms) | Max (ms) | Frequency | Notes |
|--------|----------|----------|-----------|-------|
| PLAY_CARD | TBD | TBD | High (3-5/turn) | Card effect execution + state update |
| END_TURN | TBD | TBD | Medium (1/turn) | Enemy intent calculation + cleanup |
| ENEMY_TURN | TBD | TBD | Medium (1/turn) | Enemy action execution + multiple attacks |
| SELECT_CARD | TBD | TBD | High (5-10/turn) | Hover/touch events (UI-only, should be fast) |
| CANCEL_TARGET | TBD | TBD | Low | UI-only cleanup |

**Expected Results:**
- PLAY_CARD: 2-8ms avg (complex cards with multi-target may hit 10-15ms)
- END_TURN: 5-12ms avg (intent calculation for multiple enemies)
- ENEMY_TURN: 8-20ms avg (multiple attacks + status effect processing)
- SELECT_CARD: <1ms avg (UI-only, no game logic)
- CANCEL_TARGET: <1ms avg (UI-only, no game logic)

---

### React Component Rendering (BEFORE UX-37)

**Collection Date:** TBD
**Method:** React DevTools Profiler (manual)

#### Component Render Times (5-turn combat session)

| Component | Renders | Total Time (ms) | Self Time (ms) | Avg Per Render (ms) |
|-----------|---------|-----------------|----------------|---------------------|
| CombatScreen | TBD | TBD | TBD | TBD |
| Card | TBD | TBD | TBD | TBD |
| Enemy | TBD | TBD | TBD | TBD |
| AnimationOverlay | TBD | TBD | TBD | TBD |
| DevOverlay | TBD | TBD | TBD | TBD |

**Expected Results:**
- CombatScreen: 50-100 renders (state changes frequently)
- Card: 200-400 renders (5-10 cards × many state updates)
- Enemy: 50-150 renders (1-5 enemies × state updates)
- AnimationOverlay: 15-25 renders (once per card play + damage events)

**Red Flags:**
- CombatScreen self time >100ms total (indicates complex render logic)
- Card renders >500 times (indicates missing memoization)
- Any component with >16ms avg per render (frame budget violation)

---

### Frame Rate (BEFORE UX-37)

**Collection Date:** TBD
**Method:** `scripts/profile-combat.js` (requestAnimationFrame sampling)

#### FPS by Scenario

| Scenario | Avg FPS | Min FPS | Meets 60fps Target? |
|----------|---------|---------|---------------------|
| combat-basic (Ironclad) | TBD | TBD | TBD |
| combat-elite (Ironclad) | TBD | TBD | TBD |
| combat-boss (Ironclad) | TBD | TBD | TBD |
| combat-basic (Silent) | TBD | TBD | TBD |
| combat-basic (Defect) | TBD | TBD | TBD |
| combat-basic (Watcher) | TBD | TBD | TBD |

**Overall:**
- **Average FPS (all scenarios):** TBD
- **Minimum FPS (all scenarios):** TBD
- **Meets 60fps target:** TBD

**Expected Results:**
- Desktop: 60fps sustained (Chrome, Firefox, Safari)
- Mobile: 50-60fps (depends on device, Safari may throttle)
- FPS drops during: Enemy turn (multiple animations), card rewards (state transition)

---

### Memory Usage (BEFORE UX-37)

**Collection Date:** TBD
**Method:** `scripts/profile-combat.js` (performance.memory API)

#### Heap Growth by Scenario

| Scenario | Before (MB) | After (MB) | Delta (MB) | Leak Risk? |
|----------|-------------|------------|------------|------------|
| combat-basic (Ironclad) | TBD | TBD | TBD | TBD |
| combat-elite (Ironclad) | TBD | TBD | TBD | TBD |
| combat-boss (Ironclad) | TBD | TBD | TBD | TBD |
| combat-basic (Silent) | TBD | TBD | TBD | TBD |
| combat-basic (Defect) | TBD | TBD | TBD | TBD |
| combat-basic (Watcher) | TBD | TBD | TBD | TBD |

**Expected Results:**
- <5MB growth during single combat
- <10MB growth during full act (15 combats)
- Heap size returns to baseline after GC

**Red Flags:**
- >10MB growth in single combat (potential memory leak)
- Heap never returns to baseline (event listeners not cleaned up)

---

## Known Performance Characteristics (Pre-UX-37)

### Current Touch Event Handling

**Location:** `src/components/CombatScreen.jsx` (lines ~800-950)

**Current Flow:**
1. `onTouchStart`: Records touch position + timestamp, starts long-press timer (500ms)
2. `onTouchMove`: Tracks drag distance, cancels long-press if >10px
3. `onTouchEnd`: Dispatches card play with 300ms animation delay

**Performance Concerns:**
- **300ms animation delay:** Blocks card play dispatch, feels sluggish
- **Dual event handlers:** Both touch and drag logic run on every touch
- **setState churn:** `setCardPlaying(id)` + `setTimeout` + `setCardPlaying(null)` creates 2 extra renders
- **Long-press timer:** Runs on every tap, even when not needed

**Expected Overhead:**
- SELECT_CARD: <1ms (fast, UI-only)
- Touch event handling: ~2-5ms per touch (state updates + timer management)
- Animation delay: 300ms perceived latency (user-facing, not CPU time)

### Current Desktop Event Handling

**Location:** `src/components/CombatScreen.jsx` (lines ~700-800)

**Current Flow:**
1. `onMouseDown`: Records drag start position
2. `onMouseMove`: Updates drag position
3. `onMouseUp`: Dispatches card play if dragged to target

**Performance:** Fast, no issues reported. DO NOT CHANGE.

---

## Profiling Instructions for UX-37 Comparison

### Before Refactor (NOW)

1. Run `npm run dev`
2. Open http://localhost:5173 in Chrome
3. Open DevTools → Console
4. Paste contents of `scripts/profile-combat.js`
5. Wait for completion (~30 seconds)
6. Copy results: `copy(__PROFILE_RESULTS__)`
7. Paste into `docs/PERFORMANCE_BASELINE.md` (replace TBD values)
8. Open React DevTools → Profiler
9. Manually profile 5-turn combat (record component timings)
10. Export flamegraph screenshot

### After Refactor (UX-37 COMPLETE)

1. Repeat steps 1-10 above
2. Create new document: `docs/PERFORMANCE_COMPARISON.md`
3. Compare metrics side-by-side:
   - Reducer timings (did PLAY_CARD get faster?)
   - FPS (did we maintain 60fps?)
   - Memory (did we introduce a leak?)
   - React renders (did CombatScreen re-render less?)
4. Document any regressions with root cause analysis
5. Document any improvements with explanation

### Regression Thresholds

| Metric | Acceptable Change | Regression |
|--------|-------------------|------------|
| Reducer timing (avg) | +/- 20% | >20% slower |
| FPS (avg) | +/- 5fps | <55fps sustained |
| FPS (min) | +/- 10fps | <50fps |
| Memory delta | +/- 2MB | >10MB growth |
| React renders | +/- 20% | >50% more renders |

**If regression detected:**
1. Profile with React DevTools to find bottleneck
2. Check for missing `React.memo`, `useCallback`, `useMemo`
3. Check for event listener leaks (touch handlers not cleaned up)
4. Check for unnecessary state updates in `useTouchGesture` hook

---

## Architecture Notes

### QR-14 Performance Monitor Integration

**File:** `src/systems/performanceMonitor.js`

**Already Instrumented:**
- All reducer actions via `withTiming()` wrapper in `GameContext.jsx`
- Memory tracking via `performance.memory` (Chrome-only)
- State size estimation via `estimateStateSize()`
- DevTools API: `window.__SPIRE_PERF__`

**Available APIs:**
```javascript
window.__SPIRE_PERF__.getTimingSummary()     // All action timings
window.__SPIRE_PERF__.getSlowestActions(10)  // Top 10 slow actions
window.__SPIRE_PERF__.clearTimings()         // Reset data
window.__SPIRE_PERF__.getMemoryUsage()       // Heap info
window.__SPIRE_PERF__.estimateStateSize()    // State size in bytes
```

### QR-04 DevOverlay Integration

**File:** `src/components/DevOverlay.jsx`

**Live FPS Counter:**
- Rolling 30-frame average
- Color-coded: red <30fps, yellow <50fps, green 50+fps
- Toggle with backtick (`) key
- Only runs when visible (no overhead when hidden)

**Usage for Visual FPS Check:**
1. Toggle overlay with `
2. Play combat while watching FPS counter
3. Note any FPS drops below 50fps
4. Correlate with actions (card play, end turn, enemy turn)

---

## Action Items for UX-37

### BEFORE Starting Refactor

- [ ] Run profiling script and fill in TBD values above
- [ ] Manually profile with React DevTools and capture component timings
- [ ] Take screenshots of React DevTools flamegraph
- [ ] Document any current performance issues discovered

### AFTER Completing Refactor

- [ ] Re-run profiling script with exact same scenarios
- [ ] Re-profile with React DevTools (same 5-turn combat flow)
- [ ] Create `docs/PERFORMANCE_COMPARISON.md` with side-by-side metrics
- [ ] Flag any regressions >20% threshold
- [ ] Update this document with "AFTER" results if needed

### If Regression Detected

- [ ] Profile with React DevTools to identify bottleneck
- [ ] Check for missing memoization (React.memo, useCallback, useMemo)
- [ ] Check for event listener leaks (touch handlers not cleaned up)
- [ ] Check for unnecessary state updates in useTouchGesture hook
- [ ] Compare reducer timings to identify slow action
- [ ] File P0 bug if regression >50% or FPS <50fps

---

## Next Steps

1. **Manual Profiling Required:** This document provides methodology and structure, but actual profiling data must be collected manually by opening the game in a browser and running the profiling script.

2. **UX Team Coordination:** UX-37 should use this baseline to ensure no performance regressions after the mobile refactor.

3. **Real Device Testing:** While automated profiling runs on desktop Chrome, real device testing (iOS Safari, Android Chrome) is critical for mobile performance validation. See QA-30 for mobile testing plan.

---

**Status:** BASELINE METHODOLOGY COMPLETE
**Actual Data:** PENDING MANUAL COLLECTION
**Ready for UX-37:** YES (provides comparison framework)

---

## Appendix: Performance Profiling Script

**File:** `scripts/profile-combat.js`

See file for full automated profiling implementation. Key features:

- Automated scenario loading via `window.__SPIRE__.loadScenario()`
- Automated combat playthrough via `window.__SPIRE__.playCard()` and `window.__SPIRE__.endTurn()`
- FPS sampling via `requestAnimationFrame`
- Memory snapshots via `performance.memory`
- Reducer timing via `window.__SPIRE_PERF__.getTimingSummary()`
- Results exported to `window.__PROFILE_RESULTS__` for clipboard copy

**Usage:**
```javascript
// Open DevTools console at http://localhost:5173
// Paste contents of scripts/profile-combat.js
// Wait for completion
// Copy results
copy(__PROFILE_RESULTS__)
```

Results can be pasted into JSON formatter and manually transcribed to this document's TBD sections.

---

**Created by:** BE (Sprint 20, BE-35)
**Last Updated:** 2026-02-14
