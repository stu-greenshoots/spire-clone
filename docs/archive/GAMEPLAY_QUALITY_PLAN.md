# Gameplay Quality Plan

## Problem

Seven sprints in, the process efficiently turns task lists into merged PRs. But gameplay bugs persist because nothing in the loop discovers them systematically. The system optimizes for throughput of pre-defined tasks, not for finding and fixing actual gameplay problems.

## Root Causes

1. **No gameplay feedback loop** — "Smoke test" means "didn't crash," not "played well"
2. **Tests validate code, not game design** — 837 passing tests say nothing about balance, feel, or logic errors in enemy behavior
3. **AI reviews its own work** — Catches unused imports, misses broken game logic
4. **No bug discovery mechanism** — Bugs found only when human notices them
5. **Sprints are 100% prescriptive** — No capacity reserved for reactive fixes based on actual play

## Proposed Solutions

### 1. Balance Simulator (High Priority)

Automated combat simulation system that runs thousands of fights and flags statistical outliers.

- Run 1000+ fights per enemy with randomized decks
- Flag enemies with >95% or <5% win rates
- Flag cards that are never played or always played
- Flag damage/block values that produce degenerate outcomes
- Output a report per sprint showing balance health
- Lives in `src/test/` or `scripts/`, owned by QA

### 2. Runtime Invariant Checker (High Priority)

Instrument the game to detect impossible or unexpected states during play.

- Block should never be negative
- Dead enemies should not act or have intents
- Player HP should not exceed max HP (without a relic/effect allowing it)
- Turn count should always increment
- Energy should reset correctly each turn
- Card costs should not be negative (unless explicitly designed)
- Log violations to console with full state snapshot
- Can run in dev mode always, stripped from production build
- Lives in `src/systems/`, new file, owned by BE or QA

### 3. Automated Playthrough / E2E Canary (Medium Priority)

Post-merge integration test that plays through the game and asserts basic sanity.

- Simulate a full Act 1 → Act 2 run with simple decision heuristics
- Assert: no crashes, no infinite loops, no stuck states
- Assert: combat resolves, rewards grant, map progresses
- Run after every merge to sprint branch
- Lives in `src/test/`, owned by QA

### 4. Structured QA Playthrough Phase (Medium Priority)

Each sprint includes a dedicated QA phase where someone (human or agent) plays the game and files structured reports.

- Template: what was played, what happened, what was wrong, severity
- Findings become bug tickets for the next sprint or current sprint reactive slots
- Not optional — sprint is not complete without a playthrough report

### 5. Reactive Sprint Capacity (Process Change)

Reserve 30-40% of each sprint's task slots for bugs and issues discovered during the sprint.

- Don't pre-assign these slots during planning
- Fill them from QA playthrough findings, balance simulator results, and runtime invariant violations
- Prioritize gameplay-affecting bugs over new features

## Suggested Implementation Order

1. Runtime invariant checker — low effort, immediate value, catches impossible states
2. Balance simulator — medium effort, surfaces design/data bugs that tests can't catch
3. Reactive sprint capacity — process change, no code needed
4. Structured QA playthrough — process + template, minimal code
5. Automated E2E canary — higher effort, builds on invariant checker

## Open Questions for PM

- How much sprint capacity to reserve for reactive work? (Suggested: 30-40%)
- Should the balance simulator run in CI or be a manual script?
- Who owns the runtime invariant checker — BE or QA?
- Do we add a QA playthrough gate to the Definition of Done?