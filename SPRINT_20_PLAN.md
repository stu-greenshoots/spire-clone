# Sprint 20: Mobile UX Fix

**Created:** 2026-02-14
**Goal:** Fix mobile card selection UX — make tap-to-play instant, performant, and intuitive
**Previous Sprint:** Sprint 19 COMPLETE (10/15 tasks, v1.1.0 released, 13th consecutive 100% must-ship)
**Status:** APPROVED — Team consensus achieved
**Branch:** `sprint-20`

---

## Why This Sprint Exists

**User Feedback (2026-02-14):** "Mobile card selection doesn't work — it's so so slow and hard to use. It should only need one click to select and then one click to choose a target."

**Sprint 19 shipped v1.1.0** with 100% card art coverage and zero P0 bugs. However, post-release user testing revealed a critical mobile UX issue:

**Current Mobile Flow Problems:**
1. **Sluggish response:** 300ms animation delay before card selection
2. **Too many taps:** Card tap → targeting mode → enemy tap (should be instant for non-attack cards)
3. **Performance issues:** Double event handling (touch + drag both active)
4. **Confusing gestures:** Long-press timer runs on every tap

**Mentor Assessment:** P0 bug. This is a core interaction that makes mobile play frustrating.

---

## Sprint 20 Principles

1. **Quality over features** — Post-1.1.0, we can afford to focus on polish
2. **Mobile-first fix** — Desktop flow unchanged (don't break what works)
3. **Real device testing** — iOS Safari + Android Chrome, not just emulators
4. **Performance focus** — 60fps maintained, < 100ms perceived latency
5. **Short sprint** — 2-3 focused tasks, defer everything else

---

## Sprint 20 Tasks (9 total — revised from team input)

### P0 — Must Ship (6 tasks)

| Task | Owner | Size | Description |
|------|-------|------|-------------|
| PM-21 | PM | S | Merge Sprint 19 to master, create sprint-20 branch, draft PR |
| BE-35 | BE | S | Performance baseline profiling (BEFORE UX-37 refactor) |
| UX-37a | UX | S | Extract useTouchGesture hook (testable in isolation) |
| UX-37b | UX/BE | M | Integrate hook into CombatScreen (pairing required) |
| UX-37c | UX | S | Remove 300ms animation delay (instant dispatch) |
| QA-30a | QA | M | Automated mobile E2E tests (Playwright touch emulation) |

### P1 — Should Ship (2 tasks)

| Task | Owner | Size | Description |
|------|-------|------|-------------|
| AR-19 | AR | S | Audio polish — verify all triggers, add missing SFX (deferred from Sprint 19) |
| QA-29 | QA | S | Performance regression — Lighthouse 90+, bundle size (AFTER UX-37) |

### P2 — Nice to Have (1 task — most deferred to Sprint 21)

| Task | Owner | Size | Description |
|------|-------|------|-------------|
| GD-34 | GD | M | Remaining card art improvements (DEFERRED to Sprint 21) |

**Deferred to Sprint 21:**
- UX-38: Mobile combat polish (avoid scope creep with UX-37a/b/c)
- QA-30b: Real device manual testing documentation (Stu handles manually)

---

## Task Details

### PM-21: Sprint Setup (PM)
**Size:** S | **Priority:** P0
**Files:** `SPRINT_BOARD.md`, `SPRINT_20_PLAN.md`

1. Merge Sprint 19 to master (sprint-19 branch)
2. Create sprint-20 branch from master
3. Create draft PR from sprint-20 to master
4. Update SPRINT_BOARD.md with Sprint 20 section

**Acceptance criteria:**
- [ ] Sprint 19 merged to master
- [ ] sprint-20 branch created
- [ ] Draft PR open with task checklist
- [ ] SPRINT_BOARD.md updated

---

### UX-37: Mobile Card Interaction Refactor (UX/BE)
**Size:** L | **Priority:** P0
**Files:** `src/components/CombatScreen.jsx`, `src/hooks/useTouchGesture.js` (new)

**Root Cause:** Current mobile flow has three architectural problems:

1. **Double event handling:** `onTouchStart` triggers BOTH long-press timer AND drag initialization
2. **Blocking animations:** 300ms `setTimeout` before `selectCard()` dispatch
3. **Two-tap flow:** Card tap → targeting → enemy tap (should be instant for non-attack)

**Fix Strategy:**

Extract touch handling to `src/hooks/useTouchGesture.js`:

```javascript
export function useTouchGesture({ onTap, onLongPress, onDrag }) {
  // State machine:
  // - Touch start: Record position + timestamp
  // - Touch move: If > 10px, treat as drag
  // - Touch end:
  //   - If < 200ms && < 10px → tap
  //   - If > 500ms && < 10px → long-press
  //   - If > 10px → drag
}
```

**Changes:**
1. Create `useTouchGesture` hook with gesture detection state machine
2. Refactor CombatScreen.jsx to use hook instead of direct touch handlers
3. Remove 300ms animation delay — dispatch `selectCard()` immediately
4. Keep desktop flow unchanged (separate code paths)

**Acceptance criteria:**
- [ ] Single tap on non-attack card plays instantly (< 100ms perceived)
- [ ] Single tap on attack card enters targeting mode
- [ ] Tap target enemy to confirm (unchanged)
- [ ] Long-press (500ms) shows inspect modal
- [ ] Drag (>10px) still works for precision targeting
- [ ] Desktop flow completely unchanged
- [ ] All E2E tests pass
- [ ] Real device testing on iOS Safari + Android Chrome
- [ ] No performance regression (60fps maintained)
- [ ] npm run validate passes

**Risks:**
- **Breaking desktop interaction** — Mitigate by keeping separate code paths
- **Touch event browser quirks** — Test on real iOS device early
- **Performance regression** — Profile with React DevTools on real device

**Definition of Done:**
- Code merged and deployed
- User can play cards on mobile with instant feedback
- No regression in desktop or keyboard controls

---

### QA-30: Mobile Regression Testing (QA)
**Size:** M | **Priority:** P0
**Files:** `tests/e2e/mobile-combat.spec.js` (new)
**Depends on:** UX-37

**Scope:**
1. Create new E2E test suite for mobile gestures
2. Verify all touch interactions work correctly
3. Test on real devices (iOS Safari + Android Chrome)
4. Regression test all 4 characters

**Test scenarios:**
- [ ] Tap non-attack card → plays immediately
- [ ] Tap attack card → enters targeting mode
- [ ] Tap enemy while targeting → card plays
- [ ] Long-press card → inspect modal shows
- [ ] Drag card to enemy → card plays
- [ ] Cancel targeting by tapping elsewhere
- [ ] Tap potions, relics, end turn button
- [ ] Hand scrolling works on narrow screens

**Real Device Testing:**
- [ ] iPhone 15 Pro (iOS 17+) — Safari
- [ ] Pixel 8 (Android 14+) — Chrome
- [ ] iPad Mini (iOS 17+) — Safari landscape

**Acceptance criteria:**
- [ ] All mobile gesture tests pass
- [ ] Desktop tests unchanged and passing
- [ ] Real device testing documented
- [ ] No performance issues on real devices
- [ ] npm run validate passes

---

### AR-19: Audio Polish (AR)
**Size:** S | **Priority:** P1
**Files:** `src/systems/audioSystem.js`, `src/data/soundRegistry.js`
**Status:** DEFERRED from Sprint 19

**Scope:**
1. Verify all audio triggers fire correctly
2. Add any missing SFX identified in testing
3. Check volume balance across all sounds
4. Ensure crossfade works between tracks

**Acceptance criteria:**
- [ ] All combat events have audio (card play, damage, block, etc.)
- [ ] Map interactions have audio (node selection, path preview)
- [ ] Menu interactions have audio (button clicks, transitions)
- [ ] Volume balance verified (no sounds too loud/quiet)
- [ ] No audio bugs reported in manual testing
- [ ] npm run validate passes

---

### QA-29: Performance Regression (QA)
**Size:** S | **Priority:** P1
**Files:** N/A (testing only)
**Status:** DEFERRED from Sprint 19

**Scope:**
1. Run Lighthouse performance audit
2. Verify bundle size < 2MB
3. Check no chunks > 500KB
4. Verify 60fps maintained in combat

**Acceptance criteria:**
- [ ] Lighthouse performance score 90+
- [ ] Bundle size < 2MB uncompressed
- [ ] No chunks > 500KB
- [ ] Combat runs at 60fps on mid-range devices
- [ ] No memory leaks in long sessions
- [ ] npm run validate passes

---

### GD-34: Remaining Card Art Improvements (GD)
**Size:** M | **Priority:** P2
**Files:** `src/assets/art/cards/`, card sprite sheets
**Status:** DEFERRED from Sprint 19

**Scope:**
1. Identify lowest-quality card art (<5KB or AI artifacts)
2. Re-generate improved versions using DALL-E
3. Update sprite sheets
4. Verify visual consistency

**Target:** 20 additional cards improved

**Acceptance criteria:**
- [ ] 20 cards re-rendered with higher quality
- [ ] All new art > 10KB file size
- [ ] Visual style consistent with existing art
- [ ] Sprite sheets rebuilt
- [ ] npm run validate passes

---

### UX-38: Mobile Combat Polish (UX)
**Size:** S | **Priority:** P2
**Files:** `src/components/CombatScreen.jsx`, `src/components/EnemyInfoPanel.jsx`

**Scope:**
1. Improve enemy info tap behavior (inline vs panel)
2. Optimize hand scrolling on narrow screens
3. Add haptic feedback for card play (if supported)
4. Polish mobile UI spacing and touch targets

**Acceptance criteria:**
- [ ] Enemy info tap behavior intuitive
- [ ] Hand scrolling smooth and responsive
- [ ] All touch targets minimum 44px
- [ ] Haptic feedback added where supported
- [ ] npm run validate passes

---

### BE-35: Performance Profiling (BE)
**Size:** S | **Priority:** P2
**Files:** N/A (investigation + documentation)

**Scope:**
1. Profile React render performance in combat
2. Identify render bottlenecks (unnecessary re-renders)
3. Measure reducer execution time
4. Document findings + recommendations

**Tools:**
- React DevTools Profiler
- Chrome Performance tab
- Custom performance.mark() instrumentation

**Deliverable:**
- `docs/PERFORMANCE_PROFILE.md` with findings and recommendations

**Acceptance criteria:**
- [ ] Profiling data collected for all 4 characters
- [ ] Bottlenecks identified and documented
- [ ] Recommendations for future optimization
- [ ] No code changes (investigation only)

---

## Architectural Decisions (DEC)

### DEC-020: Touch Gesture State Machine Design
**Status:** PROPOSED
**Context:** UX-37 requires refactoring mobile touch handling

**Decision:** Extract touch handling to `src/hooks/useTouchGesture.js` custom hook

**Options Considered:**
- A) Local state in CombatScreen (current pattern)
- B) Custom hook `useTouchGesture()` (RECOMMENDED)
- C) Reducer action (overkill for UI state)

**Chosen:** Option B

**Reasoning:**
- Keeps CombatScreen.jsx focused on rendering
- Testable in isolation
- Reusable if other components need gesture detection

**Agreed By:** Mentor (2026-02-14)
**Needs Review By:** UX, BE

---

### DEC-021: Animation vs Instant Feedback on Mobile
**Status:** PROPOSED
**Context:** Current 300ms animation delay feels sluggish

**Decision:** Dispatch `selectCard()` immediately, run animation in parallel (non-blocking)

**Before:**
```javascript
setCardPlaying(card.instanceId);
setTimeout(() => setCardPlaying(null), 300);
selectCard(card);  // Waits 300ms
```

**After:**
```javascript
selectCard(card);  // Immediate
setCardPlaying(card.instanceId);  // Animation in parallel
setTimeout(() => setCardPlaying(null), 300);
```

**Impact:** Perceived latency drops from 300ms to ~16ms (one frame)

**Agreed By:** Mentor (2026-02-14)
**Needs Review By:** UX, BE

---

### DEC-022: Desktop/Mobile Flow Separation
**Status:** PROPOSED
**Context:** Maintain backwards compatibility for desktop users

**Decision:** Keep separate desktop and mobile code paths — do NOT unify

**Reasoning:**
- Desktop drag-to-play is good, don't break it
- Mobile and desktop have different interaction paradigms
- Separation is clearer than conditional logic

**Implementation:**
```javascript
if (isMobile) {
  // New touch state machine
} else {
  // Existing mouse drag logic
}
```

**Agreed By:** Mentor (2026-02-14)
**Needs Review By:** UX, BE

---

## Dependencies

```
PM-21 (sprint setup)
  └─ UX-37 (mobile refactor)
       └─ QA-30 (mobile regression)

AR-19 (audio polish) — independent
QA-29 (performance) — independent
GD-34 (card art) — independent
UX-38 (mobile polish) — depends on UX-37
BE-35 (profiling) — independent
```

**Critical Path:** PM-21 → UX-37 → QA-30 (3-5 days)

---

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Breaking desktop interaction | Medium | High | Keep separate code paths, test desktop flow |
| Touch event browser quirks | Medium | Medium | Test on real iOS device early |
| Performance regression | Low | Medium | Profile with React DevTools on real device |
| Scope creep (UX-38, BE-35) | Medium | Low | Strictly defer to Sprint 21 if P0/P1 not done |

---

## Validation Gate

Before sprint close:

### P0 (Must Pass)
- [ ] All P0 tasks merged (PM-21, UX-37, QA-30)
- [ ] Mobile card tap-to-play feels instant (< 100ms)
- [ ] All E2E tests pass (desktop + mobile)
- [ ] Real device testing complete (iOS Safari + Android Chrome)
- [ ] No regression in desktop interaction
- [ ] No regression in keyboard controls
- [ ] npm run validate passes (3775+ tests)
- [ ] 60fps maintained in combat

### P1 (Should Pass)
- [ ] AR-19 merged (audio polish)
- [ ] QA-29 merged (performance regression)
- [ ] Lighthouse score 90+
- [ ] Bundle size < 2MB

### P2 (Nice to Have)
- [ ] GD-34 merged (more card art)
- [ ] UX-38 merged (mobile polish)
- [ ] BE-35 merged (profiling)

---

## Open Questions for Team

1. **UX:** Do you agree with the touch gesture state machine design? Any concerns with extracting to a custom hook?
2. **BE:** Are you comfortable pairing on UX-37? This touches complex event handling in a 1861-line file.
3. **QA:** Do you have access to real iOS + Android devices for testing? If not, what's your plan?
4. **AR:** Is Sprint 19's deferred AR-19 still relevant, or has user feedback changed priorities?
5. **ALL:** Should we defer ALL P2 tasks, or is there one that's critical enough to prioritize?

---

## Sprint 20 Summary (DRAFT)

**Goal:** Fix mobile card selection UX — make tap-to-play instant, performant, and intuitive

**Scope:**
- 3 P0 tasks (must ship)
- 2 P1 tasks (should ship)
- 3 P2 tasks (nice to have)

**Estimated Duration:** 1 week (P0+P1 only), 2 weeks (all tasks)

**Key Decision Points:**
- DEC-020: Touch gesture state machine design
- DEC-021: Animation vs instant feedback
- DEC-022: Desktop/mobile flow separation

**Next Steps:**
1. Team input round — all engineers review and provide feedback
2. Resolve open questions and decision proposals
3. Finalize task list and priorities
4. Create sprint-20 branch and draft PR
5. Start UX-37 (mobile refactor)

---

**Status:** AWAITING TEAM INPUT

PM to spawn engineers for planning input round.
