# Future Sprints Plan - Based on User Feedback

**Created:** 2026-01-25
**Source:** user-feedback.md + existing backlog analysis
**Status:** DRAFT - Awaiting team review

---

## User Feedback Summary

User feedback collected and prioritized:

| # | Feedback | Status | Sprint |
|---|----------|--------|--------|
| 1 | Map is confusing - need to see paths ahead | Partially addressed (S4) | S7 refinement |
| 2 | Title screen is ugly - needs art | NEW | S6 P2 |
| 3 | Choice of reward at start (like StS Neow) | NEW | S6 P1 |
| 4 | Enemies/bosses too powerful | Balance issue | S6 P1 |
| 5 | Rare cards appear too often | Balance issue | S6 P1 |
| 6 | UX deep dive - game looks amateur | NEW | S6 P0 |
| 7 | Buff/debuff system issues (persistence) | **BUG - P0** | S6 P0 |
| 8 | Enemies need sequential animated turns | DONE (S4 VP-08) | N/A |
| 9 | Block indicator causes jumping | NEW | S6 P1 |
| 10 | Victory screen too large | Addressed (S4 VP-05) | Minor refinement if needed |
| 11 | Non-targeting cards shouldn't need enemy target | NEW | S6 P2 |

---

## Sprint 5: Replayability (PLANNED - Ready for Execution)

**Status:** Plan approved, awaiting sprint start
**Goal:** Meta-progression and ascension systems for player retention
**See:** SPRINT_5_PLAN.md for full details

### Summary
- BE-06: Meta-progression integration (M)
- BE-07: Ascension integration (M)
- SL-03: Boss encounters & dialogue (M)
- UX-08: Deck viewer integration (M)
- QA-05: Sprint 5 test coverage (M)
- AR-03: Settings verification (XS)
- GD-06: Sprite sheet bundling (M, P2)

---

## Sprint 6: User Feedback & Bug Fixes (PROPOSED)

**Goal:** Address critical user feedback, especially the buff/debuff bug
**Theme:** Quality and polish based on real user complaints

### P0 - Must Complete

| Task | Owner | Size | Description |
|------|-------|------|-------------|
| **BE-10** | BE | M | **Status effect persistence fix** - Buff/debuff system bug. When enemy applies 2 Vulnerable, it should NOT decrement until END of player's NEXT turn (currently may be decrementing immediately). Audit all status effect timing. |
| **UX-10** | UX | L | **Comprehensive UX audit** - Document all "amateur-looking" elements. Create punch list of micro-improvements. Cover all screens: title, map, combat, shop, rest, rewards, events, game over. |

### P1 - Should Complete

| Task | Owner | Size | Description |
|------|-------|------|-------------|
| **BE-09** | BE | M | **Starting bonus selection** - Neow-like system at run start. 3-4 options: gain relic, gain gold, transform starter card, upgrade card, etc. Player chooses one before floor 1. |
| **UX-11** | UX | S | **Non-intrusive block indicator** - Block display should NOT cause layout shifts/jumping. Use absolute positioning or fixed-size reserved space. |
| **QA-06** | QA | M | **Balance pass** - Run balance simulator. Tune enemy/boss HP and damage. Adjust rare card drop rates (currently too high). Target win rate 25-35% at Ascension 0. |

### P2 - If Time Permits

| Task | Owner | Size | Description |
|------|-------|------|-------------|
| **UX-12** | UX | S | **Smart card targeting** - Cards that don't affect enemies (Block, buffs) should NOT require dragging to an enemy. Drop anywhere in play area to activate. Attack cards still require target selection. |
| **GD-10** | GD | L | **Title screen art** - Professional, atmospheric title screen illustration. Dark fantasy style consistent with enemy art. "Spire Ascent" logo treatment. |

### Sprint 6 Validation Gate

- [ ] Status effects decrement at correct timing (end of turn, not on application)
- [ ] UX audit document completed with prioritized punch list
- [ ] Starting bonus selection works with 4 distinct options
- [ ] Block indicator doesn't cause layout jumps
- [ ] Balance simulator shows 25-35% win rate at A0
- [ ] Rare cards appear at expected frequency (<10% of reward pools)
- [ ] `npm run validate` passes (880+ tests)

---

## Sprint 7: Content & Map Polish (PROPOSED)

**Goal:** Act 2 content and map improvements for better route planning
**Theme:** Depth and navigation

### P0 - Must Complete

| Task | Owner | Size | Description |
|------|-------|------|-------------|
| **UX-13** | UX | M | **Map path planning** - Show all possible paths from current position. Allow players to see routes to boss. Highlight available paths vs locked paths. Consider "hover to preview full route" feature. |
| **JR-03** | JR | L | **Act 2 content** - 10 new enemies (Centurion, Mystic, Snecko, Chosen, Shelled Parasite, Byrd, Reptomancer, Book of Stabbing, Gremlin Leader, Automaton). See TEAM_PLAN.md for full specs. |

### P1 - Should Complete

| Task | Owner | Size | Description |
|------|-------|------|-------------|
| **GD-07** | GD | L | **Relic & potion art** - 47 relics + 15 potions need 64x64 icons. Dark fantasy item style. Color-coded potions by effect type. |
| **GD-08** | GD | M | **Map visual overhaul** - Vertical spire illustration as background. Distinct node icons. Styled path connections. Fog of war for upper floors. |

### P2 - If Time Permits

| Task | Owner | Size | Description |
|------|-------|------|-------------|
| **SL-04** | SL | M | **Act 2 events** - 10 new events themed for mid-game. Higher stakes choices. References Act 2 enemies/setting. |

### Sprint 7 Validation Gate

- [ ] Map shows all available paths clearly
- [ ] Players can plan routes to boss
- [ ] All 10 Act 2 enemies functional with AI patterns
- [ ] 62 relic/potion icons created in consistent style
- [ ] Map looks professional (not "connected dots")
- [ ] `npm run validate` passes (920+ tests)

---

## Sprint 8: Tutorial & Ship Prep (PROPOSED)

**Goal:** Prepare for wider release with onboarding and polish
**Theme:** New player experience and release readiness

### P0 - Must Complete

| Task | Owner | Size | Description |
|------|-------|------|-------------|
| **UX-09** | UX | M | **Tutorial/first run experience** - Contextual hints (not heavy tutorial). Highlight energy, card play, turn end, map navigation. Dismissable, never shows again after first run. |
| **QA-04** | QA | M | **Pre-release QA pass** - Full regression test. All 81+ cards functional. All enemies with working AI. All relics trigger correctly. All events resolve. Mobile layout check. |

### P1 - Should Complete

| Task | Owner | Size | Description |
|------|-------|------|-------------|
| **AR-05** | AR | L | **Mobile responsiveness** - Touch targets 44x44px minimum. Tap-to-select card interface. Proper scaling all phone sizes. Portrait mode support. Remove hover-dependent UI. |
| **GD-09** | GD | M | **Visual effects & particles** - CSS/Canvas particles for fire damage, poison, block, heal, card exhaust, power activation, death blow. Respects animation speed setting. |

### P2 - If Time Permits

| Task | Owner | Size | Description |
|------|-------|------|-------------|
| **BE-08** | BE | M | **Performance optimization** - React.memo on Card, Enemy, StatusEffect. useMemo for damage calculations. Image compression (<200KB per asset). Bundle <2MB. |

### Sprint 8 Validation Gate

- [ ] New player can understand core loop without external help
- [ ] Full regression checklist passed (QA-04 document)
- [ ] Game playable on iPhone 12 (375px) in portrait
- [ ] Particle effects for major actions (damage, block, heal)
- [ ] No P0/P1 bugs in release build
- [ ] `npm run validate` passes (950+ tests)

---

## Backlog (Sprint 9+)

Items not scheduled but tracked:

| Task | Owner | Size | Description |
|------|-------|------|-------------|
| JR-06 | JR | L | Act 3 content (10 enemies) |
| SL-05 | SL | M | Act 3 events (10 events) |
| BE-11 | BE | M | Second character class |
| UX-14 | UX | M | Daily challenge mode |
| AR-06 | AR | M | Cloud save sync |
| GD-11 | GD | L | Card art for all 81+ cards |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| BE-10 (buff/debuff) has deep roots | Medium | High | Audit entire status effect system before fixing |
| Act 2 content (JR-03) is large scope | High | Medium | Can split into JR-03a (5 enemies) and JR-03b (5 enemies) |
| Mobile (AR-05) reveals structural issues | Medium | Medium | Start with viewport/touch only, defer complex gestures |
| Balance tuning is subjective | Low | Medium | Use simulator data, but manual playtesting required |

---

## Decision Points for Team Discussion

1. **Sprint 6 vs Sprint 5:** Should we interrupt Sprint 5 to fix the buff/debuff bug (BE-10), or complete Sprint 5 first since the bug is not a crash?

2. **UX-10 scope:** How comprehensive should the UX audit be? Full design overhaul or targeted fixes?

3. **Starting bonus (BE-09):** Which bonuses to offer? Proposal:
   - Gain a random common relic
   - Gain 100 gold
   - Transform a starter card
   - Upgrade a starter card

4. **Smart card targeting (UX-12):** Should we implement this in Sprint 6 or accept the current behavior?

5. **Act 2 timing:** Start JR-03 in Sprint 6 (parallel track) or wait for Sprint 7?

---

## Next Steps

1. **Complete Sprint 5** - Execute existing plan for replayability features
2. **Collect team input** - Share this document with team for feedback
3. **Prioritize BE-10** - Determine if buff/debuff bug is blocking
4. **Finalize Sprint 6 plan** - After Sprint 5 completes

---

*This document is a draft based on PM analysis of user feedback. Team input required before execution.*
