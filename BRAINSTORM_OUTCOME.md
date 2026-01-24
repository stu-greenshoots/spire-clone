# Spire Ascent - Team Brainstorm Outcome
## Pre-Sprint Planning Session | 2026-01-23

**Attendees:** PM, GD, UX, SL, BE, JR, AR, QA
**Format:** Open floor, then structured action items
**Context:** Investors watching. Sprint starts tomorrow. This is the last chance to raise concerns.

---

## Part 1: Feasibility Assessment (Team Round-Table)

### BE (Back Ender):
The GameContext split (BE-01) is doable but it's NOT a trivial refactor. The file is 2,352 lines with deeply nested reducer cases that cross-reference each other. The plan says "each reducer handles its own slice" but combat interacts with meta state (game phase transitions), map state (node completion), and reward state. I can do it, but I need 2-3 full Ralph loop iterations minimum to get it stable. The normalization (BE-02) should come AFTER the split, not during - doing both at once is how you break 289 tests.

**Risk I'm raising:** The plan says QA-01 depends on BE-01. That's backwards. QA should write component tests against the CURRENT interface first, then I refactor underneath. Tests prove I didn't break anything. If QA waits for me, we lose a week.

### UX (UX Guy):
Combat feedback (UX-01) depends on enemy art (GD-01) and audio (AR-01) according to the dependency map. But I can stub those. I'll build the animation system with placeholder shapes and silent triggers. When art and audio land, I plug them in. Don't block me on others.

The card info hierarchy (UX-02) is self-contained. Damage preview needs me to understand `combatSystem.js` calculations, which are already extracted. That's a clean task.

### GD (Graphic Designer):
Art generation is the wild card. OpenAI image generation is non-deterministic. I can't "code" consistency - I need to generate, evaluate, regenerate. This is NOT a ralph-loop-friendly task for the actual generation. What IS ralph-loop-friendly: organizing the assets, validating dimensions, naming conventions, building the integration code that loads and displays them.

**My proposal:** I prepare the asset pipeline (file structure, component integration, size validation) via ralph loop. Art generation itself happens manually with me curating results. Then a second ralph loop validates everything integrates cleanly.

### SL (Story Line):
Events (SL-01) and world-building (SL-02) are pure content creation. I can write all 20 events as data structures that the existing EventScreen component already consumes. I looked at the code - `EventScreen.jsx` already handles choices and effects. I just need to write the DATA file. This is highly ralph-loop-friendly: write events, run tests, validate effects trigger correctly, iterate.

**Concern:** Some event effects reference systems that don't exist yet (potions from JR-01, card transforms). I should write events with effects that CURRENTLY work, then add potion-granting events in a second pass after JR lands potion system.

### JR (Junior):
The potion system (JR-01) is the biggest chunk assigned to me. Looking at the codebase, there's already infrastructure for potions mentioned but incomplete. The data structure is clear from the plan. I can implement the data layer and combat integration independently. The UI (potion slots) needs to go into CombatScreen which is 1,000 lines already.

**Question for BE:** If you're splitting GameContext, where do potion actions land? Do I build against current monolith and you migrate it, or do I wait?

> **BE response:** Build against current. I'll migrate your code when I split. Just keep your reducer cases clean and clearly labeled.

### AR (Allrounder - "the arse"):
Right, since everyone's being polite let me be the one to say it: **this plan is 8 weeks of work for a team of 8 humans. We're not 8 humans, we're one person orchestrating 8 Claude instances.** The bottleneck isn't coding capacity, it's COORDINATION and CONTEXT.

Here's what actually worries me:

1. **Merge conflicts from hell.** If BE is rewriting GameContext while JR adds potion logic to it and UX adds animation hooks to it, we're going to spend more time resolving conflicts than writing code. We need a strict ordering on who touches GameContext when.

2. **Audio sourcing is a real-world task.** I can't `npm install` sound effects. I need actual audio files. The plan says "source from freesound.org" - that means manual downloading, license checking, format conversion. I can SET UP the system (audioSystem.js expansion, volume controls, fade transitions) via ralph loop. But populating it with 25 specific sounds? That's manual curation same as GD's art.

3. **The 289 tests are our lifeline.** Every ralph loop MUST run tests as part of its completion check. If anyone lands code that breaks tests, the next person's ralph loop will waste iterations debugging someone else's breakage.

4. **Save system (AR-02) is Phase 2 but should be Phase 1.** If we're all iterating and testing full game runs, we need reliable save/load NOW. The current 52-line save system doesn't handle the new state shape BE is creating. I'll tackle this right after audio.

**My specific concern for investors:** The plan promises mobile responsiveness (AR-04) in Phase 3. That's the right timing but the WRONG scope. The current CombatScreen has 1,000 lines of mouse-event-driven interaction. Making that touch-friendly isn't a polish task, it's a rewrite of the interaction model. We should be aware that AR-04 is really an M-sized task masquerading as an S.

### QA (Tester):
I agree with BE - I should start tests NOW against the current interface, not wait for the refactor. My component tests will serve as the regression suite that VALIDATES the refactor worked.

The balance testing framework (QA-02) is completely independent. I can build the simulator using just the combat system functions that are already extracted to `combatSystem.js`. This runs headless, no React, no DOM.

**Proposal:** I run a ralph loop for QA-02 (simulator) immediately in parallel with everyone else. It only touches new files in `src/test/balance/`. Zero conflict risk.

### PM (Project Manager):
Noted all concerns. Here's what I'm hearing:
- BE-01 is the critical path but shouldn't BLOCK everyone
- Art and audio sourcing are manual tasks that ralph loops can't fully automate
- Test suite is the shared safety net
- GameContext is the contention point - we need a touching order

---

## Part 2: Tools Required

### Development Tools (Already Have)
- Node.js / npm (build system)
- Vite (dev server, bundler)
- Vitest (test runner)
- React 19 + Testing Library
- ESLint (already configured, 0 errors)
- Git (version control)

### Development Tools (Need to Add)
| Tool | Purpose | Who Needs It | Install |
|------|---------|-------------|---------|
| Playwright or Cypress | E2E tests (QA-03) | QA | `npm install -D playwright` |
| vite-plugin-visualizer | Bundle analysis (BE-05) | BE | `npm install -D rollup-plugin-visualizer` |
| ffmpeg (CLI) | Audio format conversion | AR | System install |
| ImageMagick (CLI) | Image resizing/validation | GD | System install |

### External Resources (Manual Sourcing)
| Resource | Purpose | Owner |
|----------|---------|-------|
| freesound.org / OpenGameArt | Sound effects (CC0) | AR |
| OpenAI DALL-E / image gen | Enemy/relic/potion art | GD |
| Font resources | UI typography | UX |

### Claude Code Infrastructure
| Tool | Purpose |
|------|---------|
| Ralph Loop plugin | Iterative task completion per team member |
| Sub-agents (Task tool) | Parallel workstreams within a ralph loop |
| Explore agents | Codebase understanding before changes |
| Plan agents | Architecture decisions |

---

## Part 3: Dependency Graph & Parallelization

```
PARALLEL TRACK A (Architecture):     PARALLEL TRACK B (Content):      PARALLEL TRACK C (Quality):
┌─────────────────────────┐          ┌──────────────────────┐         ┌─────────────────────┐
│ BE-01: Split Context    │          │ SL-01: 20 Events     │         │ QA-02: Balance Sim  │
│   (no dependencies)     │          │   (self-contained)   │         │   (self-contained)  │
└──────────┬──────────────┘          └──────────┬───────────┘         └──────────┬──────────┘
           │                                    │                                │
           ▼                                    ▼                                ▼
┌─────────────────────────┐          ┌──────────────────────┐         ┌─────────────────────┐
│ BE-02: Normalize State  │          │ SL-02: World Building│         │ QA-01: Component    │
│   (needs BE-01)         │          │   (self-contained)   │         │   Tests (any time)  │
└──────────┬──────────────┘          └──────────────────────┘         └─────────────────────┘
           │
           ▼
┌─────────────────────────┐
│ JR-01: Potions          │
│   (after BE-01 ideally, │
│    but can start now on  │
│    data layer)           │
└─────────────────────────┘

PARALLEL TRACK D (Feel):             PARALLEL TRACK E (Art/Audio):
┌─────────────────────────┐          ┌──────────────────────┐
│ UX-01: Combat Feedback  │◄─ - - - -│ GD-01: Enemy Art     │
│   (stubs first, then    │  assets  │   (pipeline + gen)   │
│    integrate art+audio) │◄─ - - - -│                      │
└──────────┬──────────────┘          └──────────────────────┘
           │                          ┌──────────────────────┐
           │                          │ AR-01: Audio System  │
           │              ◄─ - - - - -│   (system + source)  │
           ▼                          └──────────────────────┘
┌─────────────────────────┐
│ UX-02: Card Info        │
│   (self-contained)      │
└─────────────────────────┘
```

### What Can Run Day 1 In Parallel (Zero Dependencies):
1. **BE-01** - Context split (touches: `src/context/`)
2. **SL-01** - Events data (touches: `src/data/events.js` - NEW file)
3. **SL-02** - Flavor text (touches: `src/data/cards.js`, `src/data/enemies.js`, `src/data/relics.js` - adding fields)
4. **QA-02** - Balance simulator (touches: `src/test/balance/` - NEW directory)
5. **AR-01** - Audio system expansion (touches: `src/systems/audioSystem.js`, `public/sounds/`)
6. **GD-01** - Asset pipeline setup (touches: `public/images/enemies/` - NEW directory)
7. **JR-01** - Potion data layer (touches: `src/data/potions.js` - NEW file)
8. **QA-01** - Component tests (touches: `src/test/components/` - NEW directory)

### Conflict Zones (MUST Be Sequential):
| File | Who Wants It | Resolution |
|------|-------------|------------|
| `GameContext.jsx` | BE (rewrite), JR (add potions), UX (add animation hooks) | BE goes first. Others build in NEW files, BE integrates. |
| `CombatScreen.jsx` | UX (animations), JR (potion UI) | UX goes first with animation layer. JR adds potion slots after. |
| `src/data/cards.js` | SL (flavor text), JR (new cards) | SL adds `flavor` field first. JR adds new card objects after. |
| `App.css` | UX (animations), GD (art styling) | Both append to end. Namespace classes. |

---

## Part 4: Ralph Loop Strategy Per Team Member

### The Pattern: Each "team member" = One Ralph Loop Session

Each ralph loop gets a focused prompt that:
1. States what files it CAN touch (containment)
2. States what tests must pass (validation)
3. States a clear completion promise (exit condition)
4. Uses sub-agents for exploration/validation within its loop

---

### BE Ralph Loop: Context Split
```bash
/ralph-loop "Split GameContext.jsx (2,352 lines) into domain-specific reducers.

TARGET STRUCTURE:
src/context/
├── GameContext.jsx (orchestrator, <300 lines)
├── reducers/
│   ├── combatReducer.js
│   ├── mapReducer.js
│   ├── shopReducer.js
│   ├── rewardReducer.js
│   └── metaReducer.js

RULES:
- All 289 existing tests MUST pass after each change
- Run 'npm test' after every reducer extraction
- No reducer file over 500 lines
- GameContext.jsx exports the SAME interface (useGame hook)
- Do NOT change component code - only context internals
- Commit after each successful reducer extraction

APPROACH:
1. Read GameContext.jsx fully, identify all action types
2. Group actions by domain (combat, map, shop, reward, meta)
3. Extract one reducer at a time, starting with smallest (shop)
4. After each extraction: run tests, fix any failures
5. Continue until GameContext is just the orchestrator

When ALL reducers are extracted AND npm test passes AND no file >500 lines:
<promise>CONTEXT SPLIT COMPLETE</promise>" --max-iterations 30
```

### SL Ralph Loop: Events
```bash
/ralph-loop "Create 20 meaningful game events in src/data/events.js.

REFERENCE: Read EventScreen.jsx to understand the data format it expects.
REFERENCE: Read src/data/cards.js and src/data/relics.js for valid effect targets.

RULES:
- Each event has: id, title, description (2-3 sentences flavor), choices (2-3 each)
- Each choice has: text, effect (object), result (flavor text)
- Effects use ONLY currently working mechanics: heal, damage, gainGold, loseGold,
  loseHp, loseHpPercent, gainRelic (use relic IDs from relics.js),
  addCardToDiscard, removeCard, upgradeRandomCard, gainMaxHp, loseMaxHp
- NO effects referencing potions (not yet implemented)
- Dark fantasy tone with dry humor
- No obvious best choice - real trade-offs

VALIDATION:
- Import events in a test file, verify all referenced relic IDs exist
- Verify all effect keys are handled by EventScreen
- npm test must pass

When 20+ events are written AND validated AND tests pass:
<promise>EVENTS COMPLETE</promise>" --max-iterations 20
```

### AR Ralph Loop: Audio System
```bash
/ralph-loop "Expand audioSystem.js into a full audio management system.

CURRENT STATE: 34 lines, 5 sounds, basic play/mute.

TARGET:
- AudioManager class with: SFX volume, Music volume, Master volume
- Preload queue (combat sounds eager, others lazy)
- Music system: crossfade between tracks, loop, phase-based selection
- Sound categories: combat, ui, ambient, music
- Volume persisted to localStorage
- No audio pop/click on transitions (fade in/out)
- Placeholder/silent fallback when audio files don't exist yet

FILES TO TOUCH:
- src/systems/audioSystem.js (rewrite)
- src/components/Settings.jsx (add volume sliders) - CREATE if needed
- Integration points: document WHERE in combat/map/shop each sound triggers
  (as comments/constants, don't modify those components yet)

DO NOT source actual audio files. Build the SYSTEM that will play them.
Write tests for the audio manager (mocking Audio API).

When audioSystem.js is a full manager with volume/fade/category support
AND volume controls exist in a Settings component
AND tests pass:
<promise>AUDIO SYSTEM COMPLETE</promise>" --max-iterations 20
```

### JR Ralph Loop: Potions
```bash
/ralph-loop "Implement the potion system for Spire Ascent.

PHASE 1 (this loop): Data layer + combat integration
- Create src/data/potions.js with 15 potions (see TEAM_PLAN.md for list)
- Create src/systems/potionSystem.js with: usePotion(), canUsePotion(),
  getPotionReward() functions
- Integrate potion effects into combat state (temporary buffs that last one combat)
- Potion slots: player.potions (max 3), stored as array of potion objects or null

DO NOT modify CombatScreen.jsx or GameContext.jsx directly.
Instead, create the system so it can be integrated later:
- Export functions that take state and return new state
- Document the reducer actions needed (ADD_POTION, USE_POTION, DISCARD_POTION)
- Write comprehensive tests for all 15 potion effects

RULES:
- Each potion has: id, name, rarity, description, effect, usableIn (combat/anytime)
- Fairy in a Bottle triggers automatically on death (passive check)
- Potions with target:'single' need targeting (document this for UI layer)
- npm test must pass

When all 15 potions are defined AND potionSystem.js handles all effects
AND tests exist and pass for each potion:
<promise>POTIONS COMPLETE</promise>" --max-iterations 20
```

### UX Ralph Loop: Combat Feedback
```bash
/ralph-loop "Overhaul combat visual feedback in CombatScreen.jsx.

CURRENT: Cards disappear on play. Damage just updates numbers. No juice.

TARGET FEEDBACK LOOP:
1. Card play: card animates toward target (CSS transform, 400ms)
2. Impact: target flashes, shakes, damage number floats up and fades
3. Block: shield icon appears briefly when block gained
4. Kill: enemy shrinks + fades with opacity transition
5. Turn indicator: clear YOUR TURN / ENEMY TURN text
6. Energy: visual drain effect on energy orbs

APPROACH:
- Use CSS animations and React state for timing
- useAnimations hook already exists - extend it
- Add animation state machine: IDLE -> CARD_FLYING -> IMPACT -> RESOLVING -> IDLE
- During animation, disable input (prevent double-play)
- All animations respect a speed multiplier (1x, 2x, instant)
- Use placeholder colored divs where art would go

FILES TO TOUCH:
- src/components/CombatScreen.jsx (animation state, timing)
- src/hooks/useAnimations.js (extend)
- src/App.css (new keyframes, animation classes)
- src/components/AnimationOverlay.jsx (damage floats)

DO NOT break existing combat logic. Animations are cosmetic layer only.
npm test must pass after all changes.

When card play has visible fly-to-target animation AND damage numbers float
AND enemy death has visual effect AND turn indicator shows:
<promise>COMBAT FEEDBACK COMPLETE</promise>" --max-iterations 25
```

### QA Ralph Loop: Balance Simulator
```bash
/ralph-loop "Build an automated combat balance simulator.

CREATE: src/test/balance/simulator.js

The simulator runs HEADLESS (no React, no DOM). It imports:
- cards from src/data/cards.js (getStarterDeck)
- enemies from src/data/enemies.js
- combatSystem from src/systems/combatSystem.js
- cardEffects from src/systems/cardEffects.js

SIMULATE:
- Create player state (80hp, starter deck, no relics)
- Generate encounter sequence (Act 1: floors 1-15)
- For each combat:
  - Simulate turns: draw 5, play cards by simple AI (prioritize block if
    about to be hit hard, else play highest damage), end turn, enemy acts
  - Track: turns taken, damage dealt, damage received, HP remaining
- After all floors: record survival, floor reached, cards played

OUTPUT:
- Function runSimulation(config) returns stats object
- Function runBalanceReport(n=1000) runs n simulations, returns:
  { winRate, avgFloorsCleared, avgTurnsPerCombat, deadliestEnemy,
    avgHpAtEnd, cardPlayFrequency }

RULES:
- Pure functions, no side effects, no DOM
- Must handle all current card effects (or skip gracefully with warning)
- 1000 runs should complete in <10 seconds
- Write tests that verify simulator produces reasonable results
- npm test must pass

When simulator runs 1000 games AND produces balance report
AND tests verify it works AND npm test passes:
<promise>SIMULATOR COMPLETE</promise>" --max-iterations 15
```

### GD Ralph Loop: Asset Pipeline
```bash
/ralph-loop "Set up the art asset pipeline for enemy display.

CURRENT: Enemies show emoji characters.

TARGET:
- Directory: public/images/enemies/ with placeholder structure
- Component update: Enemy.jsx shows <img> when art exists, emoji fallback
- Validation script: checks all enemy IDs have matching art files
- Size constants: NORMAL=256x256, ELITE=384x384, BOSS=512x512
- Loading: lazy load images, show emoji while loading

FILES TO CREATE:
- public/images/enemies/.gitkeep
- src/utils/assetLoader.js (image preloading, cache, fallback)
- src/test/assets.test.js (validates asset naming matches enemy IDs)

FILES TO MODIFY:
- src/components/Enemy.jsx (conditional image vs emoji render)

DO NOT generate actual art. Build the SYSTEM that displays it.
Place one test image (can be a colored rectangle PNG) to verify the pipeline.

npm test must pass. Enemy.jsx must still work with emojis when no art exists.

When Enemy.jsx supports image display with emoji fallback
AND assetLoader handles preloading AND validation test exists:
<promise>ASSET PIPELINE COMPLETE</promise>" --max-iterations 15
```

### PM Ralph Loop: Sprint Board & Docs
```bash
/ralph-loop "Set up project coordination infrastructure.

CREATE:
1. SPRINT_BOARD.md - All tasks from TEAM_PLAN.md as checklist with:
   - [ ] Task ID, Owner, Status (Not Started/In Progress/Done)
   - Dependencies listed
   - Sprint assignment (1-2, 3-4, 5-6, 7-8)

2. DEFINITION_OF_DONE.md - Expanded from TEAM_PLAN.md section

3. DEPENDENCIES.md - Mermaid diagram of task dependencies

4. Update package.json scripts:
   - 'npm run validate' - runs lint + tests + build
   - 'npm run validate:quick' - runs just tests

RULES:
- Documents must be accurate to current TEAM_PLAN.md
- package.json changes must not break existing scripts
- npm test must pass
- npm run build must pass

When all docs created AND validate scripts work AND npm test passes:
<promise>SPRINT DOCS COMPLETE</promise>" --max-iterations 10
```

---

## Part 5: Cross-Validation Protocol

### How We Check Each Other's Work

Each ralph loop's completion promise requires `npm test` passing. But that's not enough. We need CROSS-validation:

| After... | Validated By... | How |
|----------|----------------|-----|
| BE-01 (context split) | QA runs full test suite + manual play-through | Sub-agent does `npm test && npm run build` |
| SL-01 (events) | QA verifies all effect keys valid, AR plays through each | Sub-agent imports events, checks schema |
| JR-01 (potions) | QA writes potion-specific tests, BE verifies state shape | Sub-agent runs potion test suite |
| UX-01 (feedback) | QA visual regression (screenshot), AR plays combat | Manual visual check required |
| AR-01 (audio) | QA unit tests on AudioManager, UX confirms hook points | Sub-agent runs audio tests |
| GD-01 (pipeline) | QA asset validation test, UX confirms rendering | Sub-agent runs asset tests |

### The Validation Ralph Loop
After each major task completes, run a short validation loop:

```bash
/ralph-loop "VALIDATION PASS: Run full project validation.

1. npm run lint (must be 0 errors)
2. npm test (all must pass, count should be >= 289)
3. npm run build (must succeed)
4. Check no file in src/context/reducers/ exceeds 500 lines
5. Check GameContext.jsx interface hasn't changed (useGame hook exports same shape)
6. Verify no TODO/FIXME/HACK comments added without ticket reference

Report any failures. Fix if possible (only lint/test issues).
Do NOT refactor or add features.

When lint=0 AND tests>=289 pass AND build succeeds:
<promise>VALIDATION PASSED</promise>" --max-iterations 5
```

---

## Part 6: Sub-Agent Strategy Within Ralph Loops

Each ralph loop iteration can spawn sub-agents for:

### Exploration (before making changes)
```
Task(subagent_type=Explore): "Find all places where PLAY_CARD action is dispatched"
Task(subagent_type=Explore): "How does EventScreen.jsx consume event data?"
```

### Parallel file operations (within one iteration)
```
Task(subagent_type=Bash): "Run npm test and report failures"
Task(subagent_type=Bash): "Run npm run build"
// Both in parallel - fast feedback
```

### Validation (after making changes)
```
Task(subagent_type=general-purpose): "Read the new combatReducer.js and verify
all PLAY_CARD logic from GameContext.jsx was preserved correctly"
```

### Context Window Management
- Each ralph loop starts fresh - no context bleed between team members
- Sub-agents get focused prompts - they don't see the full game state
- Git commits between iterations give ralph loops their "memory"
- The state file (.claude/ralph-loop.local.md) tracks iteration count

---

## Part 7: Finish Conditions (Ralph Loop Exit Criteria)

### Per-Task Completion Promises
| Task | Promise Text | Hard Requirements |
|------|-------------|-------------------|
| BE-01 | `CONTEXT SPLIT COMPLETE` | No file >500 lines, tests pass, same exports |
| BE-02 | `STATE NORMALIZED` | IDs not indices, tests pass |
| SL-01 | `EVENTS COMPLETE` | 20+ events, all effects valid, tests pass |
| SL-02 | `WORLD BUILDING COMPLETE` | All cards have flavor, setting named |
| JR-01 | `POTIONS COMPLETE` | 15 potions, all tested, system exported |
| JR-02 | `UPGRADES POLISHED` | Visual indicator, preview works |
| UX-01 | `COMBAT FEEDBACK COMPLETE` | Card fly, damage float, death effect, turn indicator |
| UX-02 | `CARD INFO COMPLETE` | Tooltips, damage preview, pile viewers |
| AR-01 | `AUDIO SYSTEM COMPLETE` | Manager class, volume controls, fade, tests |
| AR-02 | `SAVE SYSTEM COMPLETE` | Auto-save, history, corruption handling |
| GD-01 | `ASSET PIPELINE COMPLETE` | Image support, fallback, validation |
| QA-01 | `COMPONENT TESTS COMPLETE` | 30+ new tests, critical paths covered |
| QA-02 | `SIMULATOR COMPLETE` | 1000 runs, balance report, <10s runtime |
| PM-01 | `SPRINT DOCS COMPLETE` | Board, DoD, dependencies, validate scripts |

### Global Safety Net
- `--max-iterations` on every loop (no infinite runs burning API credits)
- Recommended limits: Architecture tasks=30, Content tasks=20, Tooling=15, Docs=10
- If a loop hits max iterations without completing: it means the task is too big or the prompt needs refinement. PM reviews and breaks it down further.

### Kill Conditions (When to `/cancel-ralph`)
- Tests are passing but the wrong tests (loop is rewriting tests to pass)
- Same error recurring 3+ iterations (loop is stuck)
- File sizes growing without progress (loop is adding code without converging)
- Loop is modifying files outside its stated scope (containment breach)

---

## Part 8: Execution Order for Tomorrow

### Morning Block (All Parallel, Zero Conflicts):
```
Terminal 1: BE-01 (Context Split)         - touches src/context/
Terminal 2: SL-01 (Events)                - creates src/data/events.js
Terminal 3: QA-02 (Balance Simulator)     - creates src/test/balance/
Terminal 4: PM-01 (Sprint Docs)           - creates markdown files
Terminal 5: GD-01 (Asset Pipeline)        - creates public/images/, modifies Enemy.jsx
Terminal 6: AR-01 (Audio System)          - rewrites src/systems/audioSystem.js
```

### Afternoon Block (After Morning Completes):
```
Terminal 1: JR-01 (Potions Data+System)   - creates src/data/potions.js + src/systems/potionSystem.js
Terminal 2: UX-01 (Combat Feedback)       - modifies CombatScreen.jsx, App.css
Terminal 3: QA-01 (Component Tests)       - creates src/test/components/
Terminal 4: SL-02 (World Building)        - adds fields to data files
Terminal 5: VALIDATION LOOP               - runs full validate pass
```

### Why This Order:
- Morning tasks touch ZERO shared files (pure parallel)
- Afternoon tasks may touch shared files but morning established the foundation
- BE-01 completing in morning means afternoon work goes into the new structure
- Validation loop at end catches any cross-task regressions

---

## Part 9: AR's Full Rant (Since You Asked)

Look, I'll say what everyone's thinking:

**The plan is achievable but the timeline assumes everything goes right.**

Here's my real concern list:

1. **Ralph loops are great for convergent tasks** (make tests pass, refactor to target structure). They're TERRIBLE for divergent tasks (design decisions, creative content, UX feel). Half our tasks are divergent. The loops for SL and UX need human checkpoints built in.

2. **We're building on a working prototype.** That's good. But the prototype's architecture (2,352 line god-reducer) means every task that touches state is playing Jenga. BE-01 is correctly prioritized but it's also the highest-risk task. If the context split introduces subtle bugs that only manifest in specific card+relic+enemy combinations, our test suite won't catch them because we only test individual mechanics, not emergent interactions.

3. **The investor demo.** What do they actually want to SEE? A polished first act? A technical architecture? A growth plan? If it's "play the game and be impressed," then UX-01 and AR-01 (feel and audio) are worth more than BE-01 (architecture). Architecture is invisible to players. We should ask what the demo scenario is.

4. **Sub-agent coordination is our superpower AND our risk.** 8 parallel ralph loops can produce 8x the output but also 8x the merge conflicts. The "morning/afternoon" split helps but we need a MERGE MASTER role. That's PM. PM's ralph loop should end early so they can run integration passes.

5. **The save system (AR-02) issue.** Every ralph loop that tests "full run" scenarios is testing against the CURRENT save format. When BE-01 changes the state shape, old saves break. This is fine for dev (we don't care about dev saves) but we need to be clear: save migration is a Phase 2 task that blocks nothing.

6. **Testing is undertested.** We have 289 tests for game MECHANICS but zero tests for the REACT COMPONENTS. A combat feedback animation that breaks the render cycle won't fail any test. QA-01 (component tests) should be higher priority than QA-02 (balance sim). Balance doesn't matter if the game crashes.

7. **My actual task list priority:** AR-01 (audio system) > AR-02 (save expansion) > AR-03 (settings) > AR-04 (mobile). The plan has this order already. Good. But AR-03 (settings) is a dependency for AR-01 (volume controls). I'm going to combine them into one loop.

**Final word:** This is doable. The codebase is cleaner than I expected - systems are extracted, tests exist, the build passes. We're not building from zero, we're going from "functional tech demo" to "game worth playing." That's the right gap to close. Let's not over-complicate the coordination and just write good code.

---

## Part 10: Summary of Decisions

| Decision | Resolution |
|----------|-----------|
| Does QA wait for BE-01? | NO. QA starts now against current interface. |
| Does JR build against old or new Context? | OLD. BE migrates JR's code during split. |
| How does UX handle missing art/audio? | Stubs and placeholders. Plug in assets later. |
| Who resolves merge conflicts? | PM runs validation loops between task completions. |
| Are art/audio sourcing in ralph loops? | NO. Systems are automated. Asset sourcing is manual. |
| What if a ralph loop gets stuck? | Max iterations hit → PM reviews → break task smaller. |
| Mobile (AR-04) - Phase 3? | YES but flagged as larger than estimated. |
| Save system timing? | Audio first, save second. Save format will change after BE-01. |
| Investor demo focus? | FEEL over architecture. Prioritize what's visible/audible. |

---

## Action Items for Tonight (Pre-Sprint)

- [x] **PM:** Verify `npm test` and `npm run build` both pass cleanly right now
- [x] **ALL:** Read the files you'll be modifying tomorrow. Know what you're walking into.
- [x] **BE:** Draft the action type groupings (which actions go to which reducer)
- [ ] **AR:** Identify the 10 highest-priority sounds and find CC0 sources
- [x] **QA:** Write the balance simulator test expectations (what's a "reasonable" result)
- [x] **SL:** Draft 5 events tonight as proof of concept for the data format
- [x] **PM:** Write the ralph loop prompts (this doc) and have team review (DONE - this doc)
- [x] **GD:** Decide art style and generate 1 test image to validate pipeline assumptions

---

*This document is the team's contract with ourselves. We execute against this tomorrow. If something changes, we update this doc FIRST, then change course. No cowboy commits.*

*Meeting adjourned. Get some sleep. Tomorrow we ship.*
