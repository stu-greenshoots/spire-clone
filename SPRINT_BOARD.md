# Sprint Board - Spire Ascent

**Last Updated:** 2026-01-23
**Sprint:** 1 (Foundation & Feel)

---

## Phase 1: Foundation & Feel (Sprint 1-2)

### Architecture Track
- [ ] **BE-01** | Back Ender | Split GameContext into domain reducers | Dependencies: None
- [ ] **BE-02** | Back Ender | Normalize game state (IDs not indices) | Dependencies: BE-01

### Content Track
- [ ] **SL-01** | Story Line | Create 20 meaningful events | Dependencies: None
- [ ] **SL-02** | Story Line | World building & card flavor text | Dependencies: None

### Quality Track
- [ ] **QA-01** | Tester | Component test coverage (30+ tests) | Dependencies: None
- [ ] **QA-02** | Tester | Balance testing framework (1000-run sim) | Dependencies: None

### Feel Track
- [ ] **UX-01** | UX Guy | Combat feedback overhaul | Dependencies: None (stubs art/audio)
- [ ] **UX-02** | UX Guy | Card info hierarchy & tooltips | Dependencies: None

### Art & Audio Track
- [ ] **GD-01** | Graphic Designer | Enemy art pipeline & consistency | Dependencies: None
- [ ] **GD-02** | Graphic Designer | Card frame & type visual system | Dependencies: GD-01
- [ ] **AR-01** | Allrounder | Audio system expansion | Dependencies: None

### Junior Track
- [ ] **JR-01** | Junior | Potion system implementation | Dependencies: None (data layer first)
- [ ] **JR-02** | Junior | Card upgrade system polish | Dependencies: None

### Project Management
- [ ] **PM-01** | PM | Sprint board & definition of done | Dependencies: None

---

## Phase 2: Content & Depth (Sprint 3-4)

- [ ] **BE-03** | Back Ender | Meta-progression system (unlocks, achievements)
- [ ] **BE-04** | Back Ender | Difficulty/ascension system (5+ levels)
- [ ] **GD-03** | Graphic Designer | Relic & potion art (47 relics + 15 potions)
- [ ] **GD-04** | Graphic Designer | Map visual overhaul
- [ ] **SL-03** | Story Line | Boss encounters & character dialogue
- [ ] **JR-03** | Junior | Act 2 content expansion (10 new enemies)
- [ ] **JR-04** | Junior | 15 new cards
- [ ] **AR-02** | Allrounder | Save system & run history
- [ ] **AR-03** | Allrounder | Settings & accessibility
- [ ] **QA-03** | Tester | End-to-end test suite

---

## Phase 3: Polish & Ship (Sprint 5-6)

- [ ] **UX-03** | UX Guy | Deck viewer & run stats
- [ ] **UX-04** | UX Guy | Tutorial/first run experience
- [ ] **GD-05** | Graphic Designer | Visual effects & particles
- [ ] **BE-05** | Back Ender | Performance optimization
- [ ] **AR-04** | Allrounder | Mobile responsiveness
- [ ] **QA-04** | Tester | Pre-release QA pass

---

## Execution Order (Today)

### Morning Block (Parallel - Zero Conflicts)
| Task | Owner | Touches | Status |
|------|-------|---------|--------|
| BE-01 | BE | src/context/ | Not Started |
| SL-01 | SL | src/data/events.js (NEW) | Not Started |
| QA-02 | QA | src/test/balance/ (NEW) | Not Started |
| PM-01 | PM | markdown files, package.json | Not Started |
| GD-01 | GD | public/images/, Enemy.jsx | Not Started |
| AR-01 | AR | src/systems/audioSystem.js | Not Started |

### Afternoon Block (After Morning Validation)
| Task | Owner | Touches | Status |
|------|-------|---------|--------|
| JR-01 | JR | src/data/potions.js, src/systems/potionSystem.js (NEW) | Not Started |
| UX-01 | UX | CombatScreen.jsx, App.css | Not Started |
| QA-01 | QA | src/test/components/ (NEW) | Not Started |
| SL-02 | SL | src/data/cards.js, enemies.js, relics.js | Not Started |
| VALIDATION | PM | Full validate pass | Not Started |
