I89-# Quality Vision: From Browser Game to Award-Winning Indie

**Status:** DRAFT - Brainstorming
**Created:** 2026-01-25
**Context:** Sprint 5 brainstorm - "Game still feels AI-generated, not professional"

---

## The Core Problem

> "This game really still looks and feels like an AI generated browser game. We need it to feel like an indie produced game that will win people's hearts and win awards."

Current state:
- Mechanics work (871 tests passing)
- Combat is faithful to Slay the Spire
- But the **experience** doesn't feel polished

---

## What "Professional Indie" Means

Games that feel professional share these qualities:

### Visual Identity
- Cohesive art style (not just "AI art that matches")
- Intentional color palette
- Typography hierarchy
- Consistent spacing/rhythm
- Background art, not just gradients

### Audio Identity
- Music that sets mood
- Sound effects that provide feedback
- Ambient audio
- Audio that responds to game state

### Animation & Juice
- Transitions between states
- Feedback on every action
- Screen shake on impact
- Particles for effects
- Nothing just "appears" or "disappears"

### Information Design
- Clear visual hierarchy
- Important info prominent
- Secondary info accessible but not cluttering
- Mobile-appropriate information density

### Polish
- No rough edges
- Consistent interactions
- Smooth performance
- Feels "finished"

---

## Current State Assessment

### What We Have ✓
- Working game mechanics
- AI-generated card art (decent quality)
- AI-generated enemy art (decent quality)
- Basic sound effects (5 sounds)
- Tooltips
- Damage preview
- Combat feedback (floating numbers)

### What We're Missing ✗
- No music
- No ambient audio
- No background art (gradients only)
- No visual style guide
- No animation choreography
- Desktop-first UI crammed onto mobile
- Too much chrome on mobile (header takes 30%)
- Cards get clipped on mobile
- Everything is very dark
- No "juice" (screen shake, particles)

---

## Mobile-First Reality Check

Current mobile experience (390x844 viewport):

```
┌─────────────────────────────────────┐
│ Header (Act, HP, Gold)              │  ~10%
├─────────────────────────────────────┤
│ Deck count, Mute button             │  ~5%
├─────────────────────────────────────┤
│ RELICS: [icon]                      │  ~5%
├─────────────────────────────────────┤
│ POTIONS: [X] [X] [X]                │  ~5%
├─────────────────────────────────────┤
│                                     │
│         ENEMY AREA                  │  ~35%
│         (cramped)                   │
│                                     │
├─────────────────────────────────────┤
│                                     │
│         CARD HAND                   │  ~30%
│    (cards get clipped)              │
│                                     │
├─────────────────────────────────────┤
│ Draw | Energy | End Turn            │  ~10%
└─────────────────────────────────────┘
```

**Problems:**
- 25% of screen is persistent chrome (relics, potions, deck count)
- Enemy area is cramped
- Cards get clipped at edges
- No room for enemy intents to be clearly visible
- Status effects barely visible

**Comparison to Slay the Spire mobile:**
- Relics/potions hidden in collapsible drawer
- Full screen for combat
- Cards scale and fan properly
- Clear enemy intents
- Swipe gestures for card play

---

## Three Strategic Options

### Option A: Polish What We Have
**Effort:** Medium
**Risk:** Low
**Outcome:** Better, but still "browser game"

- Keep current architecture
- Add music and more sound effects
- Mobile CSS overhaul
- Add particles and screen shake
- Brighten theme more

**Pros:** Low risk, incremental progress
**Cons:** Might not cross the "feels professional" threshold

### Option B: Design-First UI Rebuild
**Effort:** High
**Risk:** Medium
**Outcome:** Professional mobile experience

- Pause features for 1-2 sprints
- Create visual style guide + moodboard
- Redesign mobile UI from scratch
- Keep game logic/state (it works)
- Rebuild components with mobile-first

**Pros:** Addresses root cause
**Cons:** Feels like going backward, takes time

### Option C: Full Rebuild
**Effort:** Very High
**Risk:** High
**Outcome:** Unknown (might not finish)

- New repo, maybe different framework
- Use current game as "design doc"
- Build mobile-first from day 1

**Pros:** Clean slate
**Cons:** High risk of not finishing, lose momentum

---

## Recommendation: Option B (Design-First UI Rebuild)

The game mechanics are solid. Don't throw away:
- GameContext architecture
- Reducer system
- Combat logic
- Card effects
- Enemy AI
- Save system
- 871 tests

**Do rebuild:**
- UI components (mobile-first)
- Layout system
- Animation layer
- Visual design

---

## What We Need to Define First

Before rebuilding, we need creative direction:

### 1. Visual Reference
What games should this feel like?
- Slay the Spire (obvious)
- Balatro?
- Inscryption?
- Something else?

**Action:** Create moodboard of 3-5 reference games

### 2. Art Direction
- Color palette (beyond "dark")
- Typography (what fonts?)
- Card frame design
- UI element style
- Background art style

**Action:** Define style guide document

### 3. Audio Direction
- Music style (epic? ambient? retro?)
- Sound effect style
- When does audio play?

**Action:** Find reference tracks, define audio moments

### 4. Mobile UX
- What's visible during combat?
- What's hidden in drawers/menus?
- How do card gestures work?
- Portrait only? Landscape?

**Action:** Wireframe mobile combat screen

---

## Gap: What Tooling Are We Missing?

| Gap | What We Need | Why |
|-----|--------------|-----|
| Visual reference | Moodboard document | Can't hit undefined target |
| Mobile testing | Device testing in workflow | See what players see |
| Sound assets | Music + SFX library | Silent game is dead game |
| Animation system | Choreography, not just CSS | Make combat feel impactful |
| State builder | Jump to any state | Test without playing through |
| Visual regression | Automated screenshot tests | Catch regressions |
| Design review | Look at game, not code | Engineers miss feel issues |

---

## Proposed Quality Sprint

A focused sprint on "feel" before more features:

### Goals
1. Define visual identity (moodboard, style guide)
2. Mobile-first combat screen redesign
3. Add music and ambient audio
4. State builder for testing
5. Automated visual tests

### Non-Goals
- New features
- New content
- Performance optimization

### Success Criteria
- Play combat on phone and think "this feels like a real game"
- Automated tests catch visual regressions
- Can jump to any game state for testing

---

## Questions for Stu

1. **What games should this feel like?** (2-3 references)
2. **Budget for assets?** (Music, SFX, possibly art)
3. **Portrait only or landscape too?**
4. **How important is desktop vs mobile?** (50/50? 80/20 mobile?)
5. **Timeline pressure?** (Polish vs features - can't have both fast)

---

## Next Steps

1. **Stu provides creative direction** (reference games, priorities)
2. **Create moodboard** based on references
3. **Define style guide** (colors, typography, spacing)
4. **Wireframe mobile combat** (what's visible, what's hidden)
5. **Plan Quality Sprint** (tasks, sizing, dependencies)

---

*This document captures strategic thinking from Sprint 5 brainstorm. Needs Stu's input on creative direction before proceeding.*
