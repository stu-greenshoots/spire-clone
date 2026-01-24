# Decision Log

Decisions that affect the team get proposed, reviewed, and accepted or rejected here. No silent changes to shared interfaces, data formats, or process.

## How to Use

1. **Propose:** Add an entry under "Open Proposals" with your role, the decision, and why.
2. **Review:** Other team members add their position (approve/reject/concern) with reasoning.
3. **Resolve:** PM moves to "Accepted" or "Rejected" once there's consensus or a clear majority.

Decisions that skip this process and break things get reverted.

---

## Template

```
### DEC-XXX: Short title
**Proposed by:** ROLE | **Date:** YYYY-MM-DD | **Status:** Open/Accepted/Rejected

**Proposal:** What you want to do and why.

**Impact:** What files/systems/team members are affected.

**Reviews:**
- ROLE: approve/reject/concern - reasoning
- ROLE: approve/reject/concern - reasoning

**Resolution:** Accepted/Rejected - summary of outcome (filled by PM)
```

---

## Open Proposals

(none)

---

## Accepted

### DEC-001: Daily diaries instead of standups
**Proposed by:** PM | **Date:** 2026-01-24 | **Status:** Accepted

**Proposal:** Each team member updates `docs/diaries/{ROLE}.md` daily instead of synchronous standups. Stale diary = assumed stuck.

**Impact:** All team members. No meetings, but accountability through written record.

**Reviews:**
- PM: approve - async-first fits our workflow, written record is searchable

**Resolution:** Accepted - diaries created, referenced in CLAUDE.md and SPRINT_2_PLAN.md.

---

### DEC-002: Fix before feature (P0 gate)
**Proposed by:** PM | **Date:** 2026-01-24 | **Status:** Accepted

**Proposal:** No Phase B or C work starts until all three P0 bugs (FIX-01, FIX-02, FIX-03) are merged to sprint-2. Sprint 1 proved that shipping broken features wastes everyone's time.

**Impact:** All team members. UX, GD, SL, QA wait for P0 owners to finish before starting their tasks.

**Reviews:**
- PM: approve - sprint 1 lesson learned the hard way

**Resolution:** Accepted - encoded in SPRINT_2_PLAN.md Phase ordering.

---

### DEC-003: Smoke test evidence required in every PR
**Proposed by:** PM | **Date:** 2026-01-24 | **Status:** Accepted

**Proposal:** Every PR must include a "Smoke Test" section proving the feature works in the running game. Screenshots, console output, or a recorded description. "Tests pass" is not sufficient.

**Impact:** All team members. PRs without smoke test evidence will be sent back.

**Reviews:**
- PM: approve - 763 tests passed in sprint 1 and 3 features were still broken

**Resolution:** Accepted - added to SPRINT_2_PLAN.md Definition of Done.

---

## Rejected

(none)
