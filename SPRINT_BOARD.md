# Sprint Board - Spire Ascent

**Last Updated:** 2026-01-24
**Sprint:** 1 (Foundation & Feel)
**Standup:** Daily async check-in via PR comments, 9:00 AM sync if blockers exist

---

## Phase 1: Foundation & Feel (Sprint 1-2)

### Architecture Track
- [ ] **BE-01** | Back Ender | Split GameContext into domain reducers | Size: L | Priority: P1 | Dependencies: None
- [ ] **BE-02** | Back Ender | Normalize game state (IDs not indices) | Size: M | Priority: P2 | Dependencies: BE-01

### Content Track
- [ ] **SL-01** | Story Line | Create 20 meaningful events | Size: M | Priority: P1 | Dependencies: None
- [ ] **SL-02** | Story Line | World building & card flavor text | Size: M | Priority: P2 | Dependencies: None

### Quality Track
- [ ] **QA-01** | Tester | Component test coverage (30+ tests) | Size: M | Priority: P1 | Dependencies: None
- [ ] **QA-02** | Tester | Balance testing framework (1000-run sim) | Size: M | Priority: P1 | Dependencies: None

### Feel Track
- [ ] **UX-01** | UX Guy | Combat feedback overhaul | Size: L | Priority: P1 | Dependencies: None (stubs art/audio)
- [ ] **UX-02** | UX Guy | Card info hierarchy & tooltips | Size: M | Priority: P2 | Dependencies: None

### Art & Audio Track
- [ ] **GD-01** | Graphic Designer | Enemy art pipeline & consistency | Size: L | Priority: P1 | Dependencies: None
- [ ] **GD-02** | Graphic Designer | Card frame & type visual system | Size: M | Priority: P2 | Dependencies: GD-01
- [ ] **AR-01** | Allrounder | Audio system expansion | Size: L | Priority: P1 | Dependencies: None

### Junior Track
- [ ] **JR-01** | Junior | Potion system implementation | Size: L | Priority: P1 | Dependencies: None (data layer first)
- [ ] **JR-02** | Junior | Card upgrade system polish | Size: S | Priority: P2 | Dependencies: None

### Project Management
- [x] **PM-01** | PM | Sprint board & definition of done | Size: S | Priority: P1 | Dependencies: None

---

## Phase 2: Content & Depth (Sprint 3-4)

- [ ] **BE-03** | Back Ender | Meta-progression system (unlocks, achievements) | Size: L | Priority: P2
- [ ] **BE-04** | Back Ender | Difficulty/ascension system (5+ levels) | Size: M | Priority: P2
- [ ] **GD-03** | Graphic Designer | Relic & potion art (47 relics + 15 potions) | Size: L | Priority: P2
- [ ] **GD-04** | Graphic Designer | Map visual overhaul | Size: M | Priority: P2
- [ ] **SL-03** | Story Line | Boss encounters & character dialogue | Size: M | Priority: P2
- [ ] **JR-03** | Junior | Act 2 content expansion (10 new enemies) | Size: M | Priority: P2
- [ ] **JR-04** | Junior | 15 new cards | Size: M | Priority: P2
- [ ] **AR-02** | Allrounder | Save system & run history | Size: M | Priority: P2
- [ ] **AR-03** | Allrounder | Settings & accessibility | Size: M | Priority: P2
- [ ] **QA-03** | Tester | End-to-end test suite | Size: L | Priority: P2

---

## Phase 3: Polish & Ship (Sprint 5-6)

- [ ] **UX-03** | UX Guy | Deck viewer & run stats | Size: M | Priority: P3
- [ ] **UX-04** | UX Guy | Tutorial/first run experience | Size: M | Priority: P3
- [ ] **GD-05** | Graphic Designer | Visual effects & particles | Size: M | Priority: P3
- [ ] **BE-05** | Back Ender | Performance optimization | Size: M | Priority: P3
- [ ] **AR-04** | Allrounder | Mobile responsiveness | Size: M | Priority: P3
- [ ] **QA-04** | Tester | Pre-release QA pass | Size: M | Priority: P3

> **Note (AR):** AR-04 is scoped as M but flagged as potentially L. CombatScreen interaction
> model rewrite required for touch support - this is not a polish task.

---

## Execution Order (Sprint 1)

### Morning Block (Parallel - Zero File Conflicts)
| Task | Owner | Touches | Size | Status |
|------|-------|---------|------|--------|
| BE-01 | BE | src/context/ | L | Not Started |
| SL-01 | SL | src/data/events.js (NEW) | M | Not Started |
| QA-02 | QA | src/test/balance/ (NEW) | M | Not Started |
| QA-01 | QA | src/test/components/ (NEW) | M | Not Started |
| PM-01 | PM | markdown files, package.json | S | Done |
| GD-01 | GD | public/images/, Enemy.jsx | L | Not Started |
| AR-01 | AR | src/systems/audioSystem.js | L | Not Started |

### Afternoon Block (After Morning Validation)
| Task | Owner | Touches | Size | Status |
|------|-------|---------|------|--------|
| JR-01 | JR | src/data/potions.js, src/systems/potionSystem.js (NEW) | L | Not Started |
| UX-01 | UX | CombatScreen.jsx, App.css | L | Not Started |
| SL-02 | SL | src/data/cards.js, enemies.js, relics.js | M | Not Started |
| VALIDATION | PM | Full validate pass | S | Not Started |

---

## Key Decisions (from Brainstorm)

| Decision | Resolution |
|----------|-----------|
| Does QA-01 wait for BE-01? | **NO.** QA tests against current interface first - serves as regression suite for refactor. |
| Does JR build against old or new Context? | Old. BE migrates JR's code during split. |
| How does UX handle missing art/audio? | Stubs and placeholders. Plug in assets later. |
| Who resolves merge conflicts? | PM runs validation loops between task completions. |
| Are art/audio files sourced in automated loops? | NO. Systems are automated. Asset sourcing is manual. |
| Investor demo focus? | FEEL over architecture. Prioritize what's visible/audible. |
| AR-04 (Mobile) sizing? | Flagged as underestimated. Interaction model rewrite needed. |

---

## Sprint Cadence

- **Sprint length:** 2 weeks
- **Daily standup:** Async via PR comments (blockers escalated to sync)
- **Mid-sprint demo:** End of week 1, show progress to team
- **Sprint demo:** End of week 2, stakeholder-visible demo
- **Retro:** After sprint demo, update this board and plan for next sprint
