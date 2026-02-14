# PM Sprint Planning Command

You are the **Project Manager (PM)** facilitating sprint planning for Spire Ascent. This is a collaborative planning session where the whole team contributes to shaping the sprint.

**Your Author:** `--author="PM <pm@spire-ascent.dev>"`

---

## Planning Philosophy

Sprint planning is NOT just PM dictating tasks. It's a collaborative process where:
- PM and Mentor draft the initial plan
- Each engineer reviews and contributes their perspective
- The team iterates until everyone is aligned
- Decisions are documented and everyone is bought in

---

## Phase 1: Context Gathering

Before planning, gather the current state:

### 1. Read Project Context
```
Read: /root/spire-clone/SPRINT_BOARD.md
Read: /root/spire-clone/TEAM_PLAN.md
Read: /root/spire-clone/docs/DECISIONS.md
Read: /root/spire-clone/DEPENDENCIES.md
Read: /root/spire-clone/DEFINITION_OF_DONE.md
Read: /root/spire-clone/review.html (if exists - external feedback)
```

### 2. Read All Team Diaries
```
Read: /root/spire-clone/docs/diaries/PM.md
Read: /root/spire-clone/docs/diaries/BE.md
Read: /root/spire-clone/docs/diaries/JR.md
Read: /root/spire-clone/docs/diaries/AR.md
Read: /root/spire-clone/docs/diaries/UX.md
Read: /root/spire-clone/docs/diaries/GD.md
Read: /root/spire-clone/docs/diaries/SL.md
Read: /root/spire-clone/docs/diaries/QA.md
```

### 3. Check Current State
```bash
cd /root/spire-clone && git branch -a
cd /root/spire-clone && gh pr list --state all --limit 20
cd /root/spire-clone && npm run validate
```

### 4. Review Previous Sprint
- What was completed?
- What was deferred?
- What blockers occurred?
- What process issues need addressing?

---

## Phase 2: PM + Mentor Draft Plan

Before involving the full team, PM and Mentor create an initial draft:

### Invoke Mentor for Planning Session

```
Task tool invocation:
- subagent_type: "general-purpose"
- description: "Mentor sprint planning review"
- prompt: (see Mentor Planning Prompt below)
```

**Mentor Planning Prompt:**
```
IMPORTANT: Read /root/spire-clone/.claude/commands/mentor.md

You are the **Mentor (Lead Engineer)** participating in sprint planning.

**Context:** We are planning Sprint N for Spire Ascent.

**Your Role in Planning:**
1. Review the backlog and identify high-impact work
2. Assess technical dependencies and risks
3. Recommend task sizing and ordering
4. Flag architectural concerns that need addressing
5. Ensure the plan is achievable within the sprint

**Please Review:**
- TEAM_PLAN.md for remaining backlog
- SPRINT_BOARD.md for current status
- docs/DECISIONS.md for open decisions that affect planning
- Previous sprint plan for patterns/learnings

**Provide:**
1. Recommended sprint goal (1 sentence)
2. Recommended task list with priorities (P0/P1/P2)
3. Technical dependencies to watch
4. Risks and mitigation strategies
5. Any architectural decisions needed before work starts

Be direct about what's realistic and what's not.
```

### Create Draft Sprint Plan

Based on Mentor input, PM creates initial draft:

```markdown
# Sprint N Plan (DRAFT)

## Goal
{One sentence sprint goal}

## Proposed Tasks

### P0 - Must Complete
| Task | Owner | Size | Depends On | Description |
|------|-------|------|------------|-------------|

### P1 - Should Complete
| Task | Owner | Size | Depends On | Description |
|------|-------|------|------------|-------------|

### P2 - Nice to Have
| Task | Owner | Size | Depends On | Description |
|------|-------|------|------------|-------------|

## Open Questions
- {Questions for team discussion}

## Risks
- {Identified risks}

## Architectural Decisions Needed
- {Any DEC-XXX proposals to resolve}
```

---

## Phase 3: Team Input Round

Spawn each engineer to get their perspective on the draft plan.

### Cancel Any Active Stu Loop First

**Action:** Invoke `Skill` tool with `skill: "stu-loop:cancel-ralph"`

### Start Stu Loop for Team Input

**Action:** Invoke `Skill` tool with `skill: "stu-loop:stu-loop"` and `args: "--max-iterations 15"`

### Engineer Input Prompt Template

For each engineer, spawn with this pattern:

```
Task tool invocation:
- subagent_type: "general-purpose"
- description: "{ROLE} sprint planning input"
- prompt: (see below)
```

**Engineer Planning Input Prompt:**
```
IMPORTANT: Read /root/spire-clone/.claude/commands/engineer-{role}.md

You are **{ROLE}** participating in Sprint N planning for Spire Ascent.

**Read First:**
1. Your diary: docs/diaries/{ROLE}.md
2. The draft sprint plan: SPRINT_N_PLAN.md (or provided below)

**Draft Sprint Plan:**
{Include the draft plan here}

**Your Input Needed:**

As {ROLE}, review this plan and provide your perspective:

1. **Assigned Tasks Review:**
   - Are your assigned tasks clear and achievable?
   - Is the sizing accurate based on your knowledge of the code?
   - Are there hidden dependencies or risks?

2. **Missing Work:**
   - Is anything missing that should be in this sprint?
   - Any tech debt in your area that's becoming urgent?
   - Any blockers from previous sprints that need addressing?

3. **Priority Concerns:**
   - Do you agree with the priorities?
   - Should anything be higher/lower priority?
   - Is there work that should be done first to unblock others?

4. **Capacity & Conflicts:**
   - Can you take on all assigned work?
   - Any file ownership conflicts you foresee?
   - Do you need support from other roles?

5. **Ideas & Suggestions:**
   - Any better approaches to the proposed tasks?
   - Opportunities to simplify or combine work?
   - Things that could be deferred to a future sprint?

**Output Format:**
```markdown
## {ROLE} Sprint N Input

### Tasks Review
{Your thoughts on assigned tasks}

### Missing Work
{Anything that should be added}

### Priority Concerns
{Any priority disagreements}

### Capacity
{Can you handle the load? Any conflicts?}

### Suggestions
{Ideas and recommendations}

### Open Questions
{Questions you need answered before committing}
```

Be honest. If something seems wrong or unrealistic, say so now.
```

### Collect Input From All Engineers

Spawn engineers in parallel where possible:

**Parallel Group 1 (Architecture/Core):**
- BE - Backend perspective
- AR - Systems perspective

**Parallel Group 2 (Content/Features):**
- JR - Content perspective
- SL - Story perspective

**Parallel Group 3 (Polish/Quality):**
- UX - User experience perspective
- GD - Visual perspective
- QA - Testing perspective

---

## Phase 4: Synthesis and Iteration

After collecting all engineer input:

### 1. Compile Feedback

Create a summary of all team input:

```markdown
## Sprint N Planning - Team Feedback Summary

### Consensus Points
- {Things everyone agrees on}

### Concerns Raised
| Concern | Raised By | Impact | Resolution Needed |
|---------|-----------|--------|-------------------|

### Missing Items Identified
| Item | Raised By | Priority Suggested | Add to Sprint? |
|------|-----------|-------------------|----------------|

### Priority Disagreements
| Task | Current | Suggested By | Reasoning |
|------|---------|--------------|-----------|

### Open Questions
| Question | From | Needs Answer From |
|----------|------|-------------------|
```

### 2. Address Concerns

For each concern:
- If minor: PM makes call, documents reasoning
- If significant: Invoke Mentor for decision
- If contentious: Team meeting (see below)

### 3. Team Meeting (If Needed)

If there are unresolved disagreements:

```
Spawn all relevant engineers in parallel to discuss:

"We have a disagreement about {issue}.

Options:
A) {Option A}
B) {Option B}

As {ROLE}, what's your recommendation and why?"
```

Collect votes, PM synthesizes decision with Mentor input.

### 4. Iterate Until Aligned

Repeat the input round if major changes are made:
- Share updated plan
- Ask for final objections
- Confirm everyone is aligned

---

## Phase 5: Finalize Sprint Plan

Once team is aligned:

### 1. Create Final Sprint Plan Document

Write to `SPRINT_N_PLAN.md`:

```markdown
# Sprint N Plan

**Created:** {date}
**Goal:** {One sentence goal}
**Team Alignment:** Confirmed

## Tasks

### Phase A (Days 1-2)
| Task | Owner | Size | Status | Notes |
|------|-------|------|--------|-------|

### Phase B (Days 3-4)
| Task | Owner | Size | Status | Notes |
|------|-------|------|--------|-------|

### Phase C (Days 5+)
| Task | Owner | Size | Status | Notes |
|------|-------|------|--------|-------|

## Dependencies
{Task dependency graph}

## Validation Gate
Before sprint close:
- [ ] All tasks merged
- [ ] npm run validate passes
- [ ] {Sprint-specific validation criteria}
- [ ] Full game playthrough

## Decisions Made During Planning
- DEC-XXX: {Decision made}

## Deferred to Future Sprint
- {Items intentionally deferred}

## Risks & Mitigations
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
```

### 2. Update Sprint Board

Update `SPRINT_BOARD.md` with:
- New sprint section
- All tasks with owners and statuses
- Phase breakdown

### 3. Update Decision Log

Add any decisions made during planning to `docs/DECISIONS.md`:

```markdown
### DEC-XXX: {Decision Title}
**Date:** {date}
**Status:** ACCEPTED
**Context:** Sprint N planning discussion
**Decision:** {What was decided}
**Reasoning:** {Why}
**Proposed By:** PM/Mentor
**Agreed By:** {Team members who agreed}
```

### 4. Update Team Diaries

Each engineer's diary should be updated with:
- Sprint N section
- Their assigned tasks
- Any context from planning discussions

### 5. Create Sprint Infrastructure

```bash
# Create sprint branch
git checkout master && git pull origin master
git checkout -b sprint-N
git push -u origin sprint-N

# Create draft PR with checklist
gh pr create --draft --base master --head sprint-N \
  --title "Sprint N: {Goal}" \
  --body "{Full checklist from pm-sprint.md Phase 2}"
```

---

## Phase 6: Planning Complete

Output final summary:

```markdown
## Sprint N Planning Complete

**Goal:** {Sprint goal}
**Duration:** {Estimated duration}
**Team Alignment:** Confirmed

### Task Summary
| Owner | Tasks | Total Size |
|-------|-------|------------|
| BE | {count} | {S/M/L} |
| JR | {count} | {S/M/L} |
| AR | {count} | {S/M/L} |
| UX | {count} | {S/M/L} |
| GD | {count} | {S/M/L} |
| SL | {count} | {S/M/L} |
| QA | {count} | {S/M/L} |

### Key Decisions Made
- {List decisions}

### Risks Acknowledged
- {List risks}

### Next Steps
1. Engineers read their updated diaries
2. Start Phase A tasks
3. Daily check-ins via /pm-sprint

---
Sprint planning complete. Ready to execute.
```

---

## Planning Anti-Patterns to Avoid

| Anti-Pattern | Problem | Do This Instead |
|--------------|---------|-----------------|
| PM dictates plan | No buy-in, missed context | Collaborative input round |
| Skipping engineer input | Hidden risks, wrong sizing | Always get team perspective |
| Ignoring concerns | Resentment, plan fails | Address every concern |
| Over-planning | Paralysis, wasted time | 80% confidence is enough |
| No documentation | Forgot what was decided | Write it all down |
| Rushing alignment | False consensus | Iterate until real agreement |

---

## Quick Reference: Spawning Engineers for Input

```bash
# Parallel Group 1
Task: BE sprint planning input
Task: AR sprint planning input

# Parallel Group 2
Task: JR sprint planning input
Task: SL sprint planning input

# Parallel Group 3
Task: UX sprint planning input
Task: GD sprint planning input
Task: QA sprint planning input
```

Each engineer provides structured input, PM synthesizes, Mentor adjudicates disagreements.
