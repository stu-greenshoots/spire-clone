# Spire Ascent — Production Roadmap

**Created:** 2026-01-30
**Status:** Team-aligned, pending merge
**Scope:** 4 sprints to 1.0 (Sprint 6–9)
**Origin:** PR #48 consultant review, filtered through full team + Mentor input

---

## Strategic Context

### Where We Are
- 5 sprints complete. 911+ tests. Clean build.
- Core loop functional: combat, rewards, shop, rest, map, meta-progression, ascension, boss encounters.
- Magazine score: 58/100. Target: 75+.
- Story direction ("The Endless War") approved and ready.
- $0 budget. Stu creates music. CC0 SFX.

### What the Consultants Proposed (PR #48)
An 8-sprint roadmap (Sprints 5–12) including JSON data migration, Sentry monitoring, performance dashboards, multi-platform builds (Tauri/Capacitor/PWA), and a full mobile-first UI rebuild.

### What the Team Decided
**Compress to 4 sprints. Cut the infrastructure vanity projects. Ship a game that feels good to play.**

The Mentor's verdict: "Thank the consultants for the audit findings. Ignore the roadmap. Ship 1.0 by Sprint 9."

---

## What We Cut (and Why)

| Proposal | Decision | Reasoning |
|----------|----------|-----------|
| Sentry error monitoring (BE-12) | CUT | Zero users. Console.error is fine. |
| Performance dashboard (BE-11) | CUT | No evidence of performance problems. |
| JSON data migration (BE-08) | CUT | 81 cards is not a scaling problem. JS modules work. |
| Multi-platform builds (BE-14) | CUT (except PWA) | Ship the web version first. PWA is free. Tauri/Capacitor is scope creep. |
| 8-sprint timeline | COMPRESSED to 4 | Ship while motivation is high. |
| QA-07 (100+ mechanics tests) | REPLACED with spike | Verify claims first, then targeted tests. |
| Combat state clearing fix (BE-17) | DELETED | BE confirmed code already handles this correctly. |

---

## The 4-Sprint Roadmap

### Sprint 6: Fix + Foundation + Narrative Start
**Theme:** Fix real bugs, audit UX, start the story.

### Sprint 7: Mobile Combat + Act 2 Content + Narrative Voice
**Theme:** Make combat feel professional. Double the content. Establish the voice.

### Sprint 8: Polish + Juice + Title Screen
**Theme:** Make every action feel impactful. First impression matters.

### Sprint 9: Ship Prep + QA + Final Pass
**Theme:** Production-ready 1.0 on web (+ PWA).

---

## Sprint 6: Fix + Foundation + Narrative Start

**Goal:** Fix confirmed bugs, audit UX to inform Sprint 7, begin Endless War narrative.

### P0 — Must Ship

| Task | Owner | Size | Description |
|------|-------|------|-------------|
| BE-16 | BE | S | **Power card fix** — Powers currently go to discard after play. Should be removed from play entirely (StS behaviour). ~5-line fix. |
| UX-10 | UX | M | **UX hit list** — Focused top-20 actionable fixes, not a 50-item research paper. Groups by effort. Directly informs Sprint 7 mobile work. |
| QA-07a | QA | S | **Mechanics audit spike** — Verify the 4 Copilot claims at runtime (Sentry data, power exhaust, combat clearing, card rates). File real bugs. 2-hour timebox. |
| VARROW-01 | Varrow | M | **Boss dialogue** — Act 1 bosses get "Endless War" dialogue (intro, mid-fight, death). Establishes the narrative voice. |

### P1 — Should Ship

| Task | Owner | Size | Description |
|------|-------|------|-------------|
| BE-10 | BE | M | **Status effect timing investigation** — Investigate buff/debuff decrement timing. May or may not be a real bug. Timebox to half-sprint. |
| BE-09 | BE | M | **Starting bonus / Neow** — 3-4 options at run start (gain relic, gain gold, transform starter card, upgrade card). |
| UX-11 | UX | S | **Block indicator** — Non-intrusive, no layout jumps. |
| QA-06 | QA | M | **Balance pass** — Run simulator. Target 25-35% win rate at A0. Gate on simulator readiness. |
| JR-fix | JR | S | **Enemy HP accuracy** — Fix Sentry HP (48-56→38-42), artifact (2→1), damage (11→9). Match StS as baseline, document intentional deviations. |
| JR-prep | JR | — | **Act 2 enemy designs** — Draft 10 enemy stat blocks/movesets in doc. No code. Prep for Sprint 7. |
| GD-06 | GD | S | **Sprite sheets** — Deferred from Sprint 4. Reduce HTTP requests. |

### P2 — Stretch

| Task | Owner | Size | Description |
|------|-------|------|-------------|
| UX-12 | UX | S | **Smart card targeting** — Non-enemy cards playable without dragging to enemy. |
| GD-audit | GD | S | **Asset audit** — Catalog what we have, what's placeholder, what's missing. Feeds style guide. |

### Validation Gate
- [ ] Power cards removed from play correctly (not in discard)
- [ ] UX hit list produced and prioritized
- [ ] Mechanics audit claims triaged (real bugs filed, non-issues closed)
- [ ] Boss dialogue for 3 Act 1 bosses in game
- [ ] `npm run validate` passes
- [ ] Full game playthrough without crashes

---

## Sprint 7: Mobile Combat + Act 2 + Narrative World

**Goal:** Make combat professional on mobile. Double the enemy roster. Extend the story.

### P0

| Task | Owner | Size | Description |
|------|-------|------|-------------|
| UX-13 | UX | L | **Mobile-first combat screen** — Collapsible chrome, full-screen combat area, proper card fanning, touch-friendly. The single highest-impact task. |
| JR-03a | JR | M | **5 Act 2 enemies** — Centurion, Mystic, Snecko, Chosen, Shelled Parasite. |
| JR-03b | JR | M | **5 Act 2 enemies** — Byrd, Reptomancer, Book of Stabbing, Gremlin Leader, Automaton. |
| VARROW-02 | Varrow | M | **Event rewrite** — 10 events → "pattern glitches" in the Endless War. |

### P1

| Task | Owner | Size | Description |
|------|-------|------|-------------|
| UX-14 | UX | M | **Mobile-first map screen** — Path planning, vertical spire background, touch-friendly nodes. |
| GD-08 | GD | S | **Style guide** — One-pager: palette, font stack, spacing scale, component patterns. Before mobile redesign decisions. |
| AR-05a | AR | S | **Touch targets** — 44px minimum on all interactive elements. Separate from UX layout work. |
| QA (regression) | QA | M | **Act 2 + combat redesign testing** — Verify new content and new layout. |

### Validation Gate
- [ ] Combat screen playable on 390x844 mobile viewport
- [ ] No card clipping or horizontal overflow
- [ ] All touch targets ≥ 44px
- [ ] 10 Act 2 enemies functional with AI
- [ ] 10 events reflect Endless War theme
- [ ] Win rate 15-25% for Act 2 clears

---

## Sprint 8: Polish + Juice + Title Screen

**Goal:** Make every action feel impactful. Professional first impression.

### P0

| Task | Owner | Size | Description |
|------|-------|------|-------------|
| UX-16 | UX | M | **Combat animations** — Screen shake on heavy hits, damage numbers, card play feedback, enemy sequential turns with visual feedback. |
| GD-10 | GD | M | **Title screen** — Professional atmospheric art. Dark fantasy. First thing reviewers see. |
| VARROW-03 | Varrow | M | **Victory/defeat narrative** — Death as dissolution. Victory as becoming real. Caps the story. |
| AR-07 | AR | M | **SFX expansion** — 10+ new CC0 sounds: card upgrade, potion use, map traversal, enemy death, boss intro. |

### P1

| Task | Owner | Size | Description |
|------|-------|------|-------------|
| GD-07a | GD | M | **Enemy art batch 1** — 10 Act 2 enemy sprites. |
| UX-15 | UX | S | **Narrative UI theming** — Subtle war pattern motifs in UI. |
| BE (any bugs) | BE | S | **Bug fixes from Sprint 7** — Address issues found in mobile redesign/Act 2. |
| QA | QA | M | **Full balance pass** — Act 1 + Act 2 combined. |

### Validation Gate
- [ ] Every combat action has visual/audio feedback
- [ ] Animations respect speed settings
- [ ] Title screen looks professional
- [ ] Victory/defeat screens convey narrative
- [ ] Act 2 enemies have art

---

## Sprint 9: Ship Prep + QA + 1.0

**Goal:** Production-ready web game with PWA support.

### P0

| Task | Owner | Size | Description |
|------|-------|------|-------------|
| QA-04 | QA | L | **Full regression** — All cards, enemies, relics, events, potions tested. |
| AR-06 | AR | M | **Music integration** — Stu's tracks wired in. Combat, map, boss themes. |
| AR-05b | AR | S | **Mobile final pass** — Portrait responsiveness verified on real devices. |
| BE-PWA | BE | S | **PWA setup** — Service worker, manifest, offline support. Installable from browser. |
| GD-07b | GD | M | **Icon batch 1** — 20 most visible relic/potion icons. |

### P1

| Task | Owner | Size | Description |
|------|-------|------|-------------|
| UX-17 | UX | M | **Tutorial / first-run hints** — Contextual, non-intrusive. |
| BE-09b | BE | S | **Performance optimization** — React.memo, useMemo where needed. Bundle < 2MB. |
| GD-icons | GD | S | **Placeholder icons** — Colored silhouettes for remaining relics/potions. |

### Validation Gate (1.0 RELEASE GATE)
- [ ] Zero P0 bugs
- [ ] Full playthrough A0-5 without crashes
- [ ] Mobile playable on iPhone 12 portrait
- [ ] Bundle size < 2MB
- [ ] Music and SFX on all key actions
- [ ] PWA installable
- [ ] Magazine score assessment: targeting 75+

---

## Success Metrics (1.0)

| Category | Target |
|----------|--------|
| Tests | 1000+ passing |
| Bundle | < 2MB |
| Win rate | 20-35% at A0, 5-15% at A5 |
| Mobile | Playable on 390x844 portrait |
| Content | 80+ cards, 30+ enemies, 40+ relics, 20+ events |
| Identity | "Endless War" story integrated, not "StS clone" |
| Score | Magazine review 75+/100 |

---

## Post-1.0 Backlog (Not Scheduled)

- Act 3 content (first major update)
- Second character class
- JSON data migration (if modding support needed)
- Cloud save sync
- Desktop builds (Tauri) — only if player demand exists
- Mobile native builds (Capacitor) — only if player demand exists
- Daily challenge mode
- Localization
- Community mod support

---

## Decisions Made During Planning

| # | Decision | Reasoning | Agreed By |
|---|----------|-----------|-----------|
| 1 | Compress 8→4 sprints | Ship while motivation is high. Infrastructure can come later. | Mentor, PM |
| 2 | Cut Sentry/perf dashboard/JSON migration | No users, no perf problems, 81 cards isn't a scaling issue. | Mentor, BE |
| 3 | Cut Tauri + Capacitor | Ship web first. PWA is enough. | Mentor, AR |
| 4 | Narrative starts Sprint 6, not Sprint 9 | Story has zero tech dependencies. Landing it early means Act 2 content fits the tone. | Varrow, Mentor |
| 5 | Spike before fix for mechanics audit | Verify claims at runtime before committing fix tasks. | QA, BE, Mentor |
| 6 | BE-17 (combat state clearing) deleted | Code already handles this. Copilot didn't read the code. | BE (verified) |
| 7 | Power card bug is real but different | Not "exhausts incorrectly" — cards go to discard instead of being removed. | BE (verified) |
| 8 | Act 2 enemies in Sprint 7, not Sprint 10 | Earlier content means earlier balancing. Split into 2x5 PRs. | JR, Mentor |
| 9 | Title screen moved to Sprint 8 (from 11) | First impression matters for reviewers. | GD |
| 10 | SFX expansion in Sprint 8 (from 11) | 5 sounds isn't enough once sequential turns and Act 2 land. | AR |
| 11 | Match StS values as baseline | Document intentional deviations. "Wrong" values look like bugs, not design. | JR, QA |

---

## Team Alignment

All team members provided input. Key consensus points:

- **Mentor:** "Cut the infrastructure vanity projects. Ship a game that feels good to play, not one that's architecturally impressive to review."
- **BE:** "3 of the 7 proposed BE tasks aren't real bugs. 2 aren't BE-scoped. Realistic capacity: 2-3 medium tasks."
- **UX:** "The score jump comes from layout and spacing, not features. Mobile combat redesign is the single highest-impact task."
- **QA:** "Spike first, always. Investigate before committing to fix tasks."
- **Varrow:** "Every sprint without narrative is a sprint where new content drifts from the vision."
- **JR:** "Match StS as baseline, diverge intentionally. 10 enemies is realistic if split into 2 PRs."
- **AR:** "Don't invent work. SFX expansion should happen Sprint 8 when content needs it."
- **GD:** "Title screen is cheap perception points. Move it earlier."

---

*Roadmap v1.0 — Team-aligned, Mentor-approved.*
*Compressed from PR #48's 8-sprint consultant proposal.*
*Origin: Copilot/Gemini audit → Team review → Mentor adjudication → This document.*
