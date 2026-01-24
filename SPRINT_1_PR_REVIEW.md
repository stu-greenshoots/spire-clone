# Sprint 1 PR Review - PM-01: Sprint Board & Docs

**PR:** PM-01 Sprint Documentation
**Author:** PM
**Reviewers:** All team members, Copilot, Mentor
**Status:** Changes Requested → Resolved

---

## Copilot (Automated Review)

> **SPRINT_BOARD.md:12-34** - Tasks are missing size estimates (S/M/L). The mentor's acceptance criteria for PM-01 explicitly requires: "Each task has owner, priority, estimate (S/M/L)". Please add estimates to all task entries.

**Status:** Resolved. Size estimates added to all tasks.

> **SPRINT_BOARD.md** - No standup cadence defined. Acceptance criteria states: "Daily standup scheduled". Document should include sprint cadence section.

**Status:** Resolved. Sprint Cadence section added with daily async standup format.

> **DEFINITION_OF_DONE.md:5** - "No file in the codebase exceeds 500 lines (new files)" is ambiguous. Does this apply to new files only, or all files? GameContext.jsx is 2,352 lines. Clarify scope.

**Status:** Resolved. Reworded to: "No newly created file exceeds 500 lines (existing files like GameContext.jsx are exempt until BE-01 completes)".

> **DEPENDENCIES.md:16** - Mermaid graph shows QA-01 → QA-03 dependency but no explicit QA-01 → BE-01 edge. However, the original TEAM_PLAN.md states "QA-01 depends on BE-01 completing." This contradicts the brainstorm resolution. Clarify which is authoritative.

**Status:** Resolved. Brainstorm decision is authoritative: QA-01 has NO dependency on BE-01. Added "Key Dependency Corrections" table to make this explicit.

> **DEFINITION_OF_DONE.md:10** - Rule 10 says "Tests are not rewritten to pass" but there's no mechanism to enforce this. Consider adding this to the Red Flags section.

**Status:** Resolved. Added to Red Flags: "Tests are being rewritten to pass instead of fixing underlying code".

> **package.json:14** - `validate` script uses `&&` chaining which stops on first failure. This is correct behavior (fail-fast) but consider documenting this.

**Status:** Acknowledged. Fail-fast is intentional - documented in DEFINITION_OF_DONE.md.

---

## Mentor (Lead Engineer)

> The board is functional but was missing the estimates I specifically asked for. S/M/L isn't about precision - it's about the team having a shared understanding of relative effort. When AR says AR-04 is "M but really L", that's exactly the kind of calibration estimates surface. Good that you've added them now.
>
> The dependency corrections from the brainstorm are critical. The original plan had QA-01 blocked on BE-01, which would have wasted a week. The brainstorm correctly identified that testing the current interface first is both safer and faster. Make sure the docs reflect the AGREED decisions, not my initial assumptions.
>
> One thing still missing: the docs don't capture WHY we're prioritizing feel over architecture for the investor demo. Add a note in the sprint board or dependencies about the dual critical paths - one for long-term velocity (architecture) and one for demo impact (feel). Both run in parallel but if we have to sacrifice one, it's architecture.

**Status:** Resolved. Added investor demo priority note to DEPENDENCIES.md critical path section. Added "Key Decisions" table to SPRINT_BOARD.md capturing the brainstorm resolutions.

---

## BE (Back Ender)

> The dependency map originally implied QA-01 waits for me. That's backwards and I want it on record: QA should write component tests NOW against the current interface. Those tests become my safety net during the refactor. If QA waits for me, we lose coverage AND time.
>
> Also, the DoD says "no file >500 lines" but my starting point is 2,352 lines. The exemption for existing files until BE-01 completes is the right call. Don't want a DoD rule that makes my task fail by definition on day one.

**Status:** Resolved. QA-01 dependency removed. 500-line rule clarified with GameContext.jsx exemption.

---

## AR (Allrounder)

> Three things:
>
> 1. AR-04 (Mobile) is listed as M. It's not. CombatScreen has 1,000 lines of mouse-event-driven interaction. Making that touch-friendly is a rewrite, not a polish pass. Flag it.
>
> 2. The docs should explicitly call out that art/audio SOURCING is manual work. The systems (audioSystem.js, assetLoader.js) are automatable. The actual files (25 sounds, 30 enemy PNGs) require human curation. Don't let anyone think a ralph loop can `npm install` sound effects.
>
> 3. Missing from the DoD: what happens when a loop gets stuck? The brainstorm discussed kill conditions but they weren't in the original DoD. Add them.

**Status:** Resolved. AR-04 flagged with size warning. Art/audio task-specific DoD updated to distinguish system code from manual sourcing. Red Flags section added to DoD.

---

## QA (Tester)

> Agreeing with BE: I start testing NOW against the current interface. My component tests will be the regression suite that proves BE-01 didn't break anything. The dependency graph should show QA-01 as INDEPENDENT, not downstream of BE-01.
>
> Also added to the DoD: "Tests written against CURRENT interfaces (serve as regression suite for future refactors)". This prevents the failure mode where we test against a moving target.

**Status:** Resolved. QA-01 shown as independent in both sprint board and dependency graph.

---

## UX (UX Guy)

> The dependency map had me blocked on GD-01 and AR-01. I can stub both. Colored rectangles for art, silent function calls for audio hooks. When real assets land, I plug them in. Don't block my animation work on someone else's sourcing timeline.
>
> Good that the DoD now says "Graceful degradation when assets missing." That's exactly my approach - placeholder shapes, silent triggers, everything works with or without real assets.

**Status:** Resolved. UX-01 dependencies marked as soft/optional in the graph.

---

## SL (Story Line)

> My events (SL-01) will only use effects that currently work in the game engine. The brainstorm flagged that some planned events reference potions (JR-01) which don't exist yet. I'll write events with heal/damage/gold/relic effects only. Potion-granting events come in a second pass after JR lands the system.
>
> The DoD addition "Only references currently working game mechanics" captures this perfectly.

**Status:** Resolved. Content task DoD updated to prevent forward-referencing.

---

## JR (Junior)

> Quick clarification confirmed: I build potions against the current GameContext monolith. BE migrates my code during the split. That means I need to keep my reducer cases clean and clearly labeled so BE can find them. The sprint board correctly shows JR-01 in the afternoon block, after BE-01 has started but doesn't need to be finished.
>
> One question resolved: potion slots go in player state as `player.potions` (max 3 array). BE confirmed this is the right shape for the eventual normalized state too.

**Status:** Resolved. Build order clarified in Key Decisions table.

---

## GD (Graphic Designer)

> The DoD distinction between "system code" and "asset sourcing" is important for my work. The asset pipeline (file structure, component integration, fallback rendering) is automatable. The actual art generation (DALL-E prompts, curation, consistency checking) is manual. These are two separate phases of GD-01.
>
> Board correctly sizes GD-01 as L. The pipeline code is M, but the manual art curation pushes it to L total.

**Status:** Resolved. Size Warnings table in DEPENDENCIES.md now documents this distinction.

---

## PM (Project Manager)

> All feedback addressed. Summary of changes to sprint docs:
>
> 1. **SPRINT_BOARD.md:** Added size estimates (S/M/L), priorities (P1/P2/P3), sprint cadence, key decisions table, and corrected execution order (QA-01 moved to morning parallel block).
> 2. **DEPENDENCIES.md:** Added dependency corrections table, investor demo critical path, size warnings, updated soft dependency labels in mermaid graph.
> 3. **DEFINITION_OF_DONE.md:** Clarified 500-line rule scope, added cross-validation protocol, added red flags section, strengthened testing and content task-specific criteria.
>
> The docs now reflect the brainstorm consensus, not just the mentor's initial plan. All copilot suggestions addressed. Ready for final approval.

---

## Resolution Summary

| Source | Issues Raised | Resolved |
|--------|--------------|----------|
| Copilot | 6 | 6 |
| Mentor | 3 | 3 |
| BE | 2 | 2 |
| AR | 3 | 3 |
| QA | 2 | 2 |
| UX | 1 | 1 |
| SL | 1 | 1 |
| JR | 1 | 1 |
| GD | 1 | 1 |
| **Total** | **20** | **20** |
