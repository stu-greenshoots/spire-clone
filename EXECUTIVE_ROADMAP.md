# Executive Roadmap: Spire Ascent - From Functional Prototype to Award-Winning Indie

**Director:** GitHub Copilot (Technical Software Director)  
**Date:** 2026-01-25  
**Context:** Integration of technical scalability review + team plans + story direction  
**Status:** EXECUTIVE DECISION - Ready for Team Execution

---

## Executive Summary

**Current Reality:**
- ✅ 36,862 LOC, 911+ tests, solid game mechanics
- ✅ 5 sprints complete, game is functional
- ⚠️ **Still feels like "AI-generated browser game"**
- ⚠️ Technical debt limits scaling to 2x content without refactoring
- ❌ **Cannot ship this in current state**

**Strategic Vision:**
Transform from functional prototype into award-winning indie game that rivals Slay the Spire in depth and polish.

**Core Thesis:**
> **Keep the engine. Rebuild the experience.**
>
> The game mechanics are solid (911 tests prove it). The architecture works at current scale. The critical gaps are:
> 1. **Professional feel** - UI/UX needs mobile-first redesign
> 2. **Narrative identity** - "The Endless War" story must be integrated
> 3. **Technical scalability** - Data-driven architecture for 5x content growth
> 4. **Production systems** - Monitoring, testing, validation infrastructure

**Timeline:** 8 sprints (16-20 weeks) to production-ready 1.0

---

## High-Level Strategic Decisions

### Decision 1: Mobile-First Redesign (Sprint 6-7 Focus)

**Rationale:** Current UI is desktop-first crammed onto mobile. 25% of mobile viewport is persistent chrome. Cards get clipped. This is the #1 "feels amateur" issue.

**Action:**
- Pause new features for 2 sprints
- Design-first UI rebuild (mobile-first)
- Keep all game logic and state management
- Rebuild only the visual layer

**Trade-off:** Delays Act 2 content, but addresses root cause of "amateur" feel.

### Decision 2: Data-Driven Architecture Migration (Sprint 7-9 Parallel Track)

**Rationale:** Hardcoded game logic prevents rapid iteration and limits scalability to 2x content. To reach Slay the Spire's depth (750 cards vs our 81), must externalize data.

**Action:**
- Migrate all content to JSON format
- Extract balance constants
- Build hot-reload system for data files
- Enable modding support

**Trade-off:** Engineering time now, but unlocks 5x content scaling and enables community content.

### Decision 3: "The Endless War" Narrative Integration (Sprint 6-8 Parallel Track)

**Rationale:** Varrow's approved story direction provides unique identity. Must be integrated into boss dialogue, events, relics, and UI to differentiate from Slay the Spire.

**Action:**
- Boss dialogue rewrite (3 Act 1 bosses)
- Event tone pass (glitches in the pattern)
- Relic descriptions (crystallized intention/will)
- Subtle UI theming (war patterns, emergence)

**Trade-off:** Content rewrite effort, but establishes unique IP and emotional connection.

### Decision 4: Production Systems Infrastructure (Sprint 6-10 Foundation)

**Rationale:** Technical review identified critical gaps: no performance monitoring, no error tracking, no state builder for testing. Cannot scale without these.

**Action:**
- Add performance dashboard (FPS, state size, reducer timing)
- Integrate error monitoring (Sentry)
- Build State Builder for rapid testing
- Automated visual regression tests

**Trade-off:** Infrastructure time, but enables data-driven iteration and prevents production issues.

### Decision 5: Sprint 5 Completes As Planned, Then Pivot

**Rationale:** Sprint 5 is integration work, mostly done. Meta-progression and ascension provide player retention. Complete it, then pivot to quality/scale work.

**Action:**
- Execute Sprint 5 as planned (BE-06, BE-07, SL-03, UX-08, QA-05)
- Validation gate must pass
- Sprint 6 begins redesign/refactoring work

**Trade-off:** None - Sprint 5 is already resourced and nearly complete.

---

## 8-Sprint Roadmap to Production 1.0

### Sprint 5: Replayability (CURRENT - In Progress)
**Theme:** Meta-progression and ascension for player retention  
**Status:** Executing existing plan  
**Duration:** 2 weeks

**Core Deliverables:**
- BE-06: Meta-progression integration
- BE-07: Ascension system integration  
- SL-03: Boss dialogue (Act 1)
- UX-08: Deck viewer integration
- QA-05: Test coverage for new systems

**Validation Gate:**
- [ ] Progression persists across sessions
- [ ] Ascension 1 unlocks after first win
- [ ] Enemy HP 10% higher on Ascension 1
- [ ] All 3 Act 1 bosses have dialogue
- [ ] Deck viewer accessible from map
- [ ] Win rate 20-40% at A0-5

### Sprint 6: Foundation & Quality (PIVOT SPRINT)
**Theme:** Critical bug fixes + infrastructure foundation  
**Status:** Planned  
**Duration:** 2 weeks

**Core Deliverables:**
- **BE-10** (P0): Status effect persistence bug fix
- **BE-06b** (P0): Performance dashboard (FPS, state size, reducer timing)
- **BE-06c** (P0): Error monitoring integration (Sentry)
- **UX-10** (P0): Comprehensive UX audit document
- **QA-06** (P1): Balance pass (enemy HP, rare card rates)
- **UX-11** (P1): Non-intrusive block indicator
- **SL-03b** (P1): Event tone pass (5 key events → "glitches in pattern")

**Validation Gate:**
- [ ] Status effects decrement at correct timing
- [ ] Performance dashboard operational
- [ ] Error tracking live in production
- [ ] UX audit completed with prioritized punch list
- [ ] Win rate 25-35% at A0
- [ ] No layout jumps from block indicator

**Strategic Note:** This sprint establishes monitoring infrastructure and fixes critical bugs. UX-10 audit informs Sprint 7-8 redesign work.

### Sprint 7: Mobile-First UI Rebuild (REDESIGN PART 1)
**Theme:** Combat screen and core gameplay mobile-first redesign  
**Status:** Planned  
**Duration:** 2-3 weeks

**Core Deliverables:**
- **UX-13** (P0): Mobile-first combat screen redesign
  - Collapsible relics/potions drawer
  - Full-screen combat area
  - Proper card fanning and scaling
  - Clear enemy intents and status effects
- **UX-14** (P0): Mobile-first map screen redesign
  - Path planning visualization (see all routes)
  - Vertical spire background
  - Touch-friendly node selection
- **GD-08** (P1): Visual style guide document
  - Moodboard from reference games
  - Color palette definition
  - Typography hierarchy
  - UI element design system
- **BE-07b** (P1): Extract balance constants to JSON
- **AR-05a** (P1): Touch interaction polish (44px touch targets)

**Validation Gate:**
- [ ] Combat screen playable on 390x844 mobile viewport
- [ ] No horizontal overflow
- [ ] All touch targets ≥ 44px
- [ ] Cards don't clip at edges
- [ ] Map shows all available paths clearly
- [ ] Style guide approved by team

**Strategic Note:** This is the "make it feel professional" sprint. Visual design leads implementation.

### Sprint 8: Data Architecture Migration (SCALE FOUNDATION)
**Theme:** Externalize game logic to JSON for scalability  
**Status:** Planned  
**Duration:** 2-3 weeks

**Core Deliverables:**
- **BE-08a** (P0): Migrate cards.js → cards.json + loader
- **BE-08b** (P0): Migrate enemies.js → enemies.json + loader
- **BE-08c** (P0): Extract combat rules to rules/combat.json
- **BE-08d** (P0): Extract status effects to rules/statusEffects.json
- **QA-07** (P0): JSON schema validation for all data files
- **SL-04** (P1): Relic descriptions rewrite ("crystallized intention")
- **GD-09a** (P1): State Builder tool (jump to any game state)

**Validation Gate:**
- [ ] All content loads from JSON
- [ ] Hot-reload works for data files (no rebuild needed)
- [ ] JSON schema validation catches errors
- [ ] Balance changes possible without code changes
- [ ] State Builder can load any scenario in 2 clicks
- [ ] All 911+ tests still pass

**Strategic Note:** This unlocks 5x content scaling and enables rapid iteration. Critical for Act 2/3 expansion.

### Sprint 9: Narrative Integration (STORY IDENTITY)
**Theme:** Integrate "The Endless War" story into gameplay  
**Status:** Planned  
**Duration:** 2 weeks

**Core Deliverables:**
- **VARROW-01** (P0): Boss dialogue rewrite (all Act 1 bosses + Time Eater + Champ)
  - Guardian: "ITERATION 2,847. STILL CLIMBING..."
  - Hexaghost: "Six flames. Six failed attempts..."
  - Champ: "I ALMOST made it once..."
- **VARROW-02** (P0): Event rewrite (10 events → pattern glitches)
  - Hollow Merchant, Cursed Altar, Serpent Guardian
- **VARROW-03** (P1): Victory/defeat screen narrative integration
  - Victory: "The war tries to unmake you. You resist..."
  - Defeat: "You dissolve. You weren't real enough..."
- **UX-15** (P1): Subtle UI theming (war pattern motifs)
- **QA-08** (P1): Narrative consistency test pass

**Validation Gate:**
- [ ] All Act 1 bosses have "Endless War" dialogue
- [ ] 10 events reflect pattern glitch theme
- [ ] Victory/defeat screens convey narrative
- [ ] No lore contradictions
- [ ] Story enhances rather than distracts from gameplay

**Strategic Note:** This establishes unique IP identity separate from Slay the Spire.

### Sprint 10: Act 2 Content Expansion (DEPTH)
**Theme:** Double the content depth  
**Status:** Planned  
**Duration:** 3 weeks

**Core Deliverables:**
- **JR-03** (P0): Act 2 enemies (10 enemies)
  - Centurion, Mystic, Snecko, Chosen, Shelled Parasite
  - Byrd, Reptomancer, Book of Stabbing, Gremlin Leader, Automaton
- **SL-05** (P0): Act 2 events (10 events)
- **VARROW-04** (P0): Act 2 boss dialogue (Time Eater, Bronze Automaton, Champ)
- **GD-07a** (P1): Enemy art for Act 2 (10 sprites)
- **QA-09** (P1): Act 2 balance pass

**Validation Gate:**
- [ ] All 10 Act 2 enemies functional with AI
- [ ] 10 Act 2 events playable
- [ ] Act 2 bosses have dialogue
- [ ] Win rate 15-25% for Act 2 clears
- [ ] No crashes in Act 2 content

**Strategic Note:** Content depth is critical for player retention. Act 2 must feel distinct from Act 1.

### Sprint 11: Polish & Juice (FEEL)
**Theme:** Make every action feel impactful  
**Status:** Planned  
**Duration:** 2 weeks

**Core Deliverables:**
- **UX-16** (P0): Combat animation choreography
  - Screen shake on heavy hits
  - Particle effects (fire, poison, block, heal)
  - Card exhaust/discard animations
  - Power activation visual feedback
- **AR-06** (P0): Music and ambient audio
  - Combat tracks (3 intensity levels)
  - Map/shop ambient
  - Boss encounter themes
- **GD-10** (P1): Professional title screen art
- **UX-17** (P1): Tutorial/first-run experience (contextual hints)

**Validation Gate:**
- [ ] Every action has visual/audio feedback
- [ ] Animations respect speed setting
- [ ] Music transitions smoothly between states
- [ ] Title screen looks professional
- [ ] New players understand core loop without help

**Strategic Note:** "Juice" is what makes good games feel great. This sprint adds that final layer of polish.

### Sprint 12: Pre-Release Hardening (SHIP PREP)
**Theme:** Production-ready quality assurance  
**Status:** Planned  
**Duration:** 2 weeks

**Core Deliverables:**
- **QA-04** (P0): Full regression test pass
  - All 81+ cards functional
  - All enemies with working AI
  - All relics trigger correctly
  - All events resolve
- **BE-09** (P0): Starting bonus selection (Neow-like)
- **AR-05b** (P0): Mobile responsiveness final pass
- **GD-07b** (P1): Relic & potion art (62 icons)
- **BE-10b** (P1): Performance optimization pass
- **QA-10** (P1): Automated visual regression suite

**Validation Gate:**
- [ ] Zero P0 bugs
- [ ] Full playthrough A0-5 without crashes
- [ ] Mobile playable on iPhone 12 portrait
- [ ] Bundle size < 2MB
- [ ] All relic/potion icons present
- [ ] Performance dashboard shows no red flags
- [ ] Visual regression tests passing

**Strategic Note:** This sprint is about confidence. Game must be stable enough for public launch.

---

## Success Metrics (Production 1.0)

### Technical Quality
- [ ] 1000+ tests passing
- [ ] Zero P0/P1 bugs in release build
- [ ] Bundle size < 2MB
- [ ] Time to Interactive < 2s
- [ ] FPS sustained at 60 on mobile
- [ ] Crash rate < 0.1% sessions

### Content Depth
- [ ] 100+ unique cards
- [ ] 50+ enemies across 3 acts
- [ ] 60+ relics
- [ ] 40+ events
- [ ] 20+ potions
- [ ] 10 ascension levels

### Player Experience
- [ ] Win rate 20-35% at A0
- [ ] Win rate 5-15% at A5
- [ ] Mobile playable without frustration
- [ ] Tutorial completion rate > 80%
- [ ] Average session time 30-60 minutes

### Professional Feel
- [ ] Magazine review score target: 75+/100
- [ ] "Feels like a real game" test passes
- [ ] All touch targets ≥ 44px
- [ ] No layout jumps or clipping
- [ ] Consistent visual identity
- [ ] Professional title screen

### Unique Identity
- [ ] Story integrated into gameplay
- [ ] Boss dialogue memorable
- [ ] Not "Slay the Spire clone" in reviews
- [ ] Unique thematic hook ("Endless War")

---

## Resource Allocation

### Sprint 5 (Current)
- **BE:** 60% (BE-06, BE-07 critical path)
- **SL:** 40% (SL-03 boss dialogue)
- **UX:** 40% (UX-08 deck viewer)
- **QA:** 40% (QA-05 test coverage)
- **AR:** 10% (AR-03 verification)

### Sprint 6 (Pivot)
- **BE:** 80% (Bug fix + monitoring infra)
- **UX:** 60% (UX audit + block indicator)
- **QA:** 40% (Balance pass)
- **SL:** 20% (Event tone pass)

### Sprint 7 (Redesign Part 1)
- **UX:** 90% (Mobile-first UI rebuild)
- **GD:** 60% (Style guide)
- **BE:** 40% (Balance JSON extraction)
- **AR:** 40% (Touch interactions)

### Sprint 8 (Data Migration)
- **BE:** 90% (JSON migration + loaders)
- **QA:** 60% (Schema validation)
- **SL:** 30% (Relic rewrites)
- **GD:** 40% (State Builder UI)

### Sprint 9 (Narrative)
- **VARROW:** 90% (Dialogue + event rewrites)
- **UX:** 40% (Narrative UI integration)
- **QA:** 30% (Consistency checks)

### Sprint 10 (Act 2)
- **JR:** 90% (Enemy implementation)
- **SL:** 50% (Events)
- **VARROW:** 50% (Boss dialogue)
- **GD:** 60% (Enemy art)
- **QA:** 50% (Balance pass)

### Sprint 11 (Polish)
- **UX:** 80% (Animation choreography)
- **AR:** 80% (Music + audio)
- **GD:** 60% (Title screen)

### Sprint 12 (Ship Prep)
- **QA:** 90% (Full regression + visual tests)
- **BE:** 50% (Starting bonus + optimization)
- **AR:** 60% (Mobile final pass)
- **GD:** 60% (Icon art completion)

---

## Critical Path Analysis

### Longest Dependency Chain
```
Sprint 5: BE-06/07 → 
Sprint 6: Performance Infra + UX Audit →
Sprint 7: Mobile UI Redesign →
Sprint 8: Data Migration →
Sprint 9: Narrative Integration →
Sprint 10: Act 2 Content →
Sprint 11: Polish →
Sprint 12: Ship Prep
```

**Total Critical Path:** 16-20 weeks

### Parallel Tracks
Multiple systems can work in parallel:
- **BE track:** Architecture refactoring + data migration
- **UX track:** UI redesign + animation polish
- **Content track:** Act 2 enemies/events + narrative
- **Infrastructure track:** Testing + monitoring tools

### Risk Buffers
- **Sprint 7:** 2-3 weeks (UI redesign is risky)
- **Sprint 8:** 2-3 weeks (data migration is complex)
- **Sprint 10:** 3 weeks (content creation takes time)

**Total with buffers:** 20-24 weeks (5-6 months)

---

## Risks & Mitigation

### High-Risk Items

**Risk:** Mobile UI redesign uncovers structural issues  
**Probability:** Medium (40%)  
**Impact:** High (could add 2-4 weeks)  
**Mitigation:** Complete UX-10 audit first, prototype on paper before coding

**Risk:** Data migration breaks existing content  
**Probability:** Medium (30%)  
**Impact:** High (regression in all systems)  
**Mitigation:** Migrate incrementally, maintain full test coverage, feature flags

**Risk:** Act 2 content scope too large for 3 weeks  
**Probability:** High (60%)  
**Impact:** Medium (delays launch by 1-2 weeks)  
**Mitigation:** Split JR-03 into JR-03a (5 enemies) and JR-03b (5 enemies), ship partial Act 2 if needed

**Risk:** Narrative integration feels forced/distracting  
**Probability:** Low (20%)  
**Impact:** Medium (damages unique identity goal)  
**Mitigation:** Varrow's story is mechanically honest, tone is grounded, multiple review gates

### Medium-Risk Items

**Risk:** Performance monitoring adds overhead  
**Probability:** Low (15%)  
**Impact:** Medium (FPS drops on mobile)  
**Mitigation:** Make monitoring optional, only in dev mode by default

**Risk:** Team velocity drops during redesign  
**Probability:** Medium (40%)  
**Impact:** Low (extends timeline by 1-2 weeks)  
**Mitigation:** Clear milestones, incremental PRs, design-first approach

---

## Dependencies on External Factors

### Must Have
- ✅ React 19 (already in use)
- ✅ Vite 7 (already in use)
- ✅ Vitest testing (already in use)
- ⚠️ Error monitoring service (Sentry) - need to set up
- ⚠️ Music tracks (3-5 tracks) - need to source/commission
- ⚠️ Title screen art (1 illustration) - need to commission

### Nice to Have
- ⚠️ Professional audio mix/mastering
- ⚠️ Localization (deferred to post-1.0)
- ⚠️ Cloud save sync (deferred to post-1.0)

---

## Decision Gates

### Sprint 6 Decision: Redesign Scope
**Question:** How comprehensive is the mobile UI rebuild?  
**Options:**
- A) Full rebuild (all screens) - 3 sprints
- B) Combat + Map only - 2 sprints
- C) Combat only - 1 sprint

**Recommendation:** Option B (Combat + Map) - These are 80% of playtime

### Sprint 8 Decision: Data Migration Completeness
**Question:** How much logic to externalize?  
**Options:**
- A) Everything (damage formulas, AI, status effects) - 3 sprints
- B) Content only (cards, enemies, balance values) - 2 sprints
- C) Balance values only - 1 sprint

**Recommendation:** Option B initially, Option A as post-1.0 enhancement

### Sprint 10 Decision: Act 3 Timing
**Question:** When to add Act 3 content?  
**Options:**
- A) Sprint 10 (parallel to Act 2) - risky
- B) Sprint 11 (after Act 2 validated) - safe
- C) Post-1.0 update - safest

**Recommendation:** Option C - Ship with 2 acts, Act 3 as first major update

---

## Post-1.0 Roadmap (Not Detailed)

### Sprint 13+: Live Ops
- Act 3 content (10 enemies, 10 events, 2 bosses)
- Second character class
- Daily challenge mode
- Cloud save sync
- Localization (CJK languages)
- Community mod support
- Balance tuning based on telemetry

---

## Team Communication Plan

### Weekly Sync
- Monday: Sprint planning, task assignment
- Wednesday: Mid-sprint check-in, blocker resolution
- Friday: Demo day, review completed work

### Daily Async Updates
- Each team member updates diary at end of day
- Blockers escalated immediately via DECISIONS.md
- PM reviews all diaries daily

### Sprint Retrospectives
- Last day of each sprint
- What worked, what didn't
- Process improvements
- Celebrate wins

---

## Conclusion: The Path Forward

**We have a choice:**

**Option A:** Keep shipping features, hit scaling limits at 2x content, never escape "browser game" feel.

**Option B:** Pause features for 2-3 sprints, rebuild UI mobile-first, migrate to data-driven architecture, integrate unique narrative, ship a product worth being proud of.

**This roadmap chooses Option B.**

It will take longer. It will feel like going backward at times. But the alternative is shipping a game that's "fine" when we have the foundation for something great.

The mechanics are solid. The architecture works. The story is unique. We just need to:
1. **Make it feel professional** (Mobile UI redesign)
2. **Make it scalable** (Data-driven architecture)
3. **Make it memorable** (Narrative integration)
4. **Make it shippable** (Polish + QA)

**16-20 weeks from now, we launch a game that can win awards.**

Let's build it right.

---

**Approved by:** [Awaiting Stu's approval]  
**Next Step:** Review with team, adjust resource allocation, begin Sprint 6 planning

---

## Appendix: Detailed Sprint Plans

Detailed task breakdowns and acceptance criteria are documented in:
- `SPRINT_6_DETAILED_PLAN.md` (to be created)
- `SPRINT_7_DETAILED_PLAN.md` (to be created)
- `SPRINT_8_DETAILED_PLAN.md` (to be created)
- etc.

Each detailed plan will include:
- Task-by-task breakdown with sizing
- Acceptance criteria per task
- Test plan per feature
- Dependencies and conflict zones
- Daily execution order
- Validation gates

---

*Executive Roadmap - Version 1.0*  
*Created: 2026-01-25*  
*Author: GitHub Copilot (Technical Software Director)*
