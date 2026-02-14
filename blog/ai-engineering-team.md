# Building a Game with an AI Engineering Team: The Spire Ascent Experiment

## Can AI agents work as a coordinated development team to build a complete game?

This is the question at the heart of **[Spire Ascent](https://github.com/stu-greenshoots/spire-clone)** — a browser-based roguelike deck builder inspired by Slay the Spire. But the real experiment isn't the game itself. It's *how* the game is being built: entirely by AI agents operating as a simulated software engineering team.

---

## The Premise: Vibe-Coded Origins

It all started with pure vibe coding. I typed "make me a Slay the Spire clone" and let an AI generate the initial codebase. I did this **on my phone**, without ever looking at the source code. That was the spark — the question became: *can AI agents take it from there?*

---

## The Team

The project has a full simulated engineering team, each agent with a defined role, owned files, and responsibilities:

| Agent | Role | Focus |
|-------|------|-------|
| **PM** | Project Manager | Sprint coordination, PR management, process |
| **BE** | Backend Engineer | Architecture, state management, reducers |
| **JR** | Junior Developer | Content work, cards, enemies, potions |
| **AR** | Allrounder | Audio, save system, settings |
| **UX** | UX Engineer | Combat feedback, tooltips, visual polish |
| **GD** | Graphic Designer | Art pipeline, assets, themes |
| **SL** | Storyline | Events, narrative, dialogue |
| **QA** | Quality Assurance | Testing, E2E, balance simulation |
| **Mentor** | Lead Engineer | Final decisions, unblocking, architecture |

Each engineer has their own **diary** at `docs/diaries/{ROLE}.md` where they log what they worked on, what blocked them, and what's next. This creates a searchable record and maintains continuity across sessions.

---

## The Process: Skills, Commands, and the Stu Loop

The agents don't just randomly write code. They follow a structured process using **custom commands** that define their workflows:

- **`pm-plan.md`**: Sprint planning. The PM and Mentor draft an initial plan, then each engineer is spawned to provide input. The team iterates until aligned.
- **`pm-sprint.md`**: Daily sprint execution. PR management, spawning engineers for tasks, managing reviews.
- **`mentor.md`**: When decisions get stuck, the Mentor steps in with authority to unblock.
- **`engineer-{role}.md`**: Each role has a dedicated command that sets identity, owned files, and role-specific checks.

The magic happens through the **Stu Loop** — an iterative process where the PM orchestrates the sprint:

1. Check for completed work (any PRs ready for review?)
2. Review and merge ready PRs (Copilot review + Mentor review)
3. Spawn engineers for unblocked tasks (running parallel when possible)
4. Update documentation (sprint board, draft PR, PM diary)
5. Repeat

This allows the team to complete an entire sprint autonomously, with multiple engineers working on the same branch but submitting separate PRs. The key is a **work plan that prevents overlapping work** — engineers brainstorm during planning to identify dependencies and conflict zones so they can commit without stepping on each other.

---

## The Review Process: Simulated Copilot and Mentor Approval

Every PR goes through two review stages:

**Copilot Review** — The engineer reviews their own code for:
- Security vulnerabilities (XSS, injection)
- Bugs (null refs, race conditions)
- Code quality (unused variables, duplication)
- Test coverage

**Mentor Review** — Architecture and integration check:
- Does it follow existing patterns?
- Does it break shared interfaces?
- Does it meet the Definition of Done?

PRs don't merge until both reviews pass. CI must be green. Smoke test evidence must be documented.

Each commit is properly attributed with an `--author` flag:
```bash
git commit --author="UX <ux@spire-ascent.dev>" -m "VP-07: Smooth victory transition"
```

This creates a clear audit trail of which "engineer" contributed what.

---

## The Testing Challenge: Agents Can't Play the Game

One of the fundamental challenges: **AI agents can't actually see or play the game**. They can run tests and check CI, but they can't experience what a player experiences.

This became painfully clear in Sprint 1 when 763 unit tests passed but the game shipped with 3 critical runtime bugs. Tests were mocking context, skipping UI integration, and not testing real user interactions.

The solution involved multiple approaches:

1. **Smoke test requirements** — Every PR must include evidence that the feature works in the actual running game. Screenshots or it didn't happen.

2. **E2E tests with Playwright** — Real browser automation testing actual user flows. Click, hover, verify DOM state.

3. **State Builder** — A system to generate specific game states for testing. Want to test the boss fight? Load the "combat-boss-hexaghost" scenario and jump directly there instead of playing through 14 floors.

4. **Screenshot generation** — Automated flows generate screenshots at key states, which can be attached to PRs for review.

We even used a **separate agent running Playwright MCP** to actually play the game and generate a review. That review was then read by the team for feedback — creating a loop where one AI tests the game and another responds to the findings.

---

## External Review: The Game Zone Magazine

To get genuine external feedback, I had an AI simulate a game magazine review (the `review.html` file). The verdict? **58/100**. Brutal but fair.

Key callouts:
- The game "appears as a black rectangle" on default monitor brightness
- Card names truncate ("Infernal Bla...")
- No tooltips explaining what cards do
- Audio is completely silent
- Combat feels like things just "happen" with no feedback
- Three P0 bugs at runtime despite passing tests

This became the improvement roadmap for Sprints 3-4.

---

## The Storyline Problem: Firing an Engineer

Here's something you don't expect to write about AI: **the Storyline agent (SL) couldn't get the new story right, so was fired.**

When attempting to add boss dialogue and events, the SL agent kept producing content that didn't fit the tone or couldn't be properly integrated. Rather than endless iteration, the pragmatic choice was to let other engineers (UX, BE) handle the integration while the narrative work was deprioritized.

This mirrors real teams — sometimes a role isn't producing, and you adjust.

---

## The User Feedback Problem: Small Changes That Don't Move Forward

One persistent issue: **agents tend to take on small bits of work that don't make meaningful progress**. Refactors, lint fixes, documentation updates — valuable, but not shippable features.

Without strong direction, the team defaults to safe, incremental changes rather than tackling the hard problems that would make the game feel complete.

My solution was to add a `user-feedback.md` file with direct feedback from actually playing the game. Then I asked **Gemini 3** to act as a software consultant and map out what's needed to make this a shippable game — taking inspiration from tech stacks and processes used by successful indie game developers.

The result was a comprehensive shipping plan targeting **Sprint 12** as the release milestone, with clear phases:
- Sprint 6: User feedback bug fixes
- Sprint 7: Act 2 content and map improvements  
- Sprint 8: Tutorial and ship preparation

---

## Limitations Discovered

### 1. Without proper planning and input, agents don't make meaningful design choices
They default to small refactors and incremental improvements. They need strong product direction to take on features that actually move the game forward.

### 2. PR reviews are hard when you can't play the game
Agents can check code quality, but they can't feel if combat is satisfying or if the UI is confusing. Visual validation and playtesting remain fundamentally challenging.

### 3. Tests pass but features break
763 tests passing meant nothing when the potion UI was broken at runtime. The mocked unit tests weren't testing real integration points.

---

## What We Can Try Next

1. **Better visual validation** — Automated screenshot comparison, layout regression tests, accessibility audits.

2. **AI playtesters with better tools** — More sophisticated game-playing agents that can navigate and evaluate the experience, not just click through.

3. **Tighter feedback loops** — Shorter sprints focused on getting playable builds in front of (simulated or real) reviewers faster.

4. **Music and audio integration** — Currently silent. Adding CC0 sound packs from OpenGameArt is planned for the Quality Sprint.

5. **Mobile-first redesign** — The game works but wasn't designed for mobile. A UI rebuild focused on touch interaction is proposed.

---

## Will We Ship by Sprint 12?

The Gemini-generated plan has Sprint 12 as the shipping target. Currently at Sprint 5 (completed), that's 7 more sprints to go.

**Realistic assessment:** It depends on maintaining momentum and avoiding the trap of endless small refinements. The infrastructure is solid — 911+ tests, clean CI, working save system, 81 cards, 34 enemies, 47 relics. The game *exists*.

What's missing is the **polish that makes a game feel finished**: onboarding, balance tuning, visual identity, audio, and that ineffable quality that separates "functional prototype" from "thing I'd share with friends."

Can AI agents deliver that? This experiment is about finding out.

---

## Try It Yourself

The game is playable at the GitHub Pages deployment, and the entire codebase is public. You can read the team's diaries, review their PRs, see the sprint plans, and follow the experiment as it unfolds.

**Repository:** [stu-greenshoots/spire-clone](https://github.com/stu-greenshoots/spire-clone)

---

*This project raises fascinating questions about the future of software development. Not "will AI replace developers?" but "what kind of team structures, processes, and tools let AI agents contribute meaningfully to complex creative projects?"*

*The answer, so far: more structure than you'd think. Clear ownership, defined processes, explicit review gates, and — critically — human direction on what actually matters.*