# Act 2 Enemy Designs

Design document for 10 Act 2 enemies. Sprint 7 prep work — stat blocks, movesets, AI patterns, and special mechanics.

**Reference:** Slay the Spire baseline values. Our game uses simplified versions (no Ascension scaling). Where our codebase already has an implementation, this document notes the current state and proposes corrections to align with StS baselines.

**Notation:** Damage values are base (non-Ascension). HP ranges use our game's format `{ min, max }`.

---

## Table of Contents

1. [Centurion](#1-centurion) (normal, paired with Mystic)
2. [Mystic](#2-mystic) (normal, paired with Centurion)
3. [Snecko](#3-snecko) (normal)
4. [Chosen](#4-chosen) (normal)
5. [Shelled Parasite](#5-shelled-parasite) (normal)
6. [Byrd](#6-byrd) (normal)
7. [Book of Stabbing](#7-book-of-stabbing) (elite)
8. [Gremlin Leader](#8-gremlin-leader) (elite)
9. [Reptomancer](#9-reptomancer) (elite — currently Act 3 in our code, proposed for Act 2)
10. [Automaton](#10-automaton) (boss)

---

## 1. Centurion

**Type:** Normal | **Act:** 2 | **Always paired with Mystic**

**Status:** Already in codebase (`centurion`). Needs stat and AI corrections.

### HP
- **StS baseline:** 76–80
- **Current:** 56–62 (too low)
- **Proposed:** 76–80

### Moveset

| Move | Intent | Damage | Block | Effects | Notes |
|------|--------|--------|-------|---------|-------|
| Slash | ATTACK | 12 | — | — | Primary attack |
| Fury | ATTACK | 6x3 | — | — | Used only when Mystic is dead |
| Defend | DEFEND | — | 15 | — | Protects self or Mystic |

**Current code has:** Slash 10 dmg, Fury 5x3 dmg, Defend 12 block. All need bumping.

### AI Pattern
- If Mystic is alive: 65% Slash, 35% Defend. Cannot use same move 3x in a row.
- If Mystic is dead: Replace Defend with Fury. 50% Slash, 50% Fury.

**Current code issue:** AI does not check if Mystic is alive. Needs `allies` parameter.

### Special Mechanics
- None. Purely stat-based fighter that changes behavior when partner dies.

---

## 2. Mystic

**Type:** Normal | **Act:** 2 | **Always paired with Centurion**

**Status:** Already in codebase (`mystic`). Needs stat and moveset corrections.

### HP
- **StS baseline:** 48–56
- **Current:** 50–56 (close, acceptable)
- **Proposed:** 48–56

### Moveset

| Move | Intent | Damage | Effects | Special | Notes |
|------|--------|--------|---------|---------|-------|
| Heal | BUFF | — | — | healAll: 16 | Heals ALL enemies for 16 HP |
| Buff | BUFF | — | +2 Strength (all enemies) | buffAllies | Buffs all allies' strength |
| Attack | ATTACK_DEBUFF | 8 | Frail 2 (player) | — | Damage + debuff |

**Current code has:** Only Heal (12 HP, single ally) and Attack (8 dmg). Missing Buff move entirely.

### AI Pattern
- If any enemy is missing 16+ HP: use Heal (max 2x in a row).
- Otherwise: alternate between Buff and Attack. Cannot use Buff or Attack 3x in a row.
- Never uses Attack twice in a row if possible.

**Current code issue:** AI only checks if ally <50% HP. Should check missing HP threshold (16+). Also missing Buff move.

### Special Mechanics
- `healAll` heals ALL enemies, not just one.
- Buff applies Strength to ALL allies (including Centurion).

---

## 3. Snecko

**Type:** Normal | **Act:** 2

**Status:** Already in codebase (`snecko`). Needs HP correction and Perplexing Glare move.

### HP
- **StS baseline:** 114–120
- **Current:** 60–66 (far too low — nearly half)
- **Proposed:** 114–120

### Moveset

| Move | Intent | Damage | Effects | Notes |
|------|--------|--------|---------|-------|
| Perplexing Glare | DEBUFF | — | Confused (player) | Always used turn 0 |
| Bite | ATTACK | 15 | — | Primary attack |
| Tail Whip | ATTACK_DEBUFF | 8 | Vulnerable 2 (player) | Secondary attack |

**Current code has:** Bite (15 dmg) and Tail Whip (8 dmg + Frail 2). Missing Perplexing Glare opening move. Tail Whip should apply Vulnerable, not Frail.

### AI Pattern
- Turn 0: Always Perplexing Glare.
- Subsequent turns: 60% Bite, 40% Tail Whip. Cannot use Bite 3x in a row.

**Current code issue:** No opening Glare move. Simple alternation instead of weighted random.

### Special Mechanics
- `confuse: true` flag already exists in codebase. Perplexing Glare should apply this effect explicitly as a move rather than as a passive.
- Confused: randomizes card costs from 0–3.

---

## 4. Chosen

**Type:** Normal | **Act:** 2

**Status:** Already in codebase (`chosen`). Needs HP and moveset corrections.

### HP
- **StS baseline:** 95–99
- **Current:** 62–68 (too low)
- **Proposed:** 95–99

### Moveset

| Move | Intent | Damage | Effects | Special | Notes |
|------|--------|--------|---------|---------|-------|
| Poke | ATTACK | 5x2 | — | — | Multi-hit light attack |
| Zap | ATTACK_DEBUFF | 18 | Vulnerable 1 (player) | — | Heavy attack + debuff |
| Debilitate | DEBUFF | — | Weak 1 + Vulnerable 2 (player) | — | Pure debuff |
| Drain | BUFF | — | Weak 1 (player) | — | Gains 3 Strength, applies Weak |
| Hex | DEBUFF | — | Hex (player) | addHex | Adds Daze on non-Attack play |

**Current code has:** Poke (5x2), Zap (12 dmg + Vuln 2), Debilitate (Weak 2 + Vuln 2), Hex. Missing Drain move. Zap damage too low (should be 18). Debilitate effect amounts slightly off.

### AI Pattern
- Turn 0: Poke.
- Turn 1: Hex.
- Subsequent turns alternate between:
  - Odd turns: 50% Debilitate, 50% Drain.
  - Even turns: 60% Poke, 40% Zap.

**Current code issue:** Opens with Hex on turn 0 instead of Poke. Missing Drain move entirely.

### Special Mechanics
- Hex: whenever player plays a non-Attack card, 1 Daze is added to draw pile. Persists for entire combat.

---

## 5. Shelled Parasite

**Type:** Normal | **Act:** 2

**Status:** Already in codebase (`shelledParasite`). Needs moveset corrections.

### HP
- **StS baseline:** 68–72
- **Current:** 68–72 (correct)
- **Proposed:** 68–72

### Moveset

| Move | Intent | Damage | Effects | Special | Notes |
|------|--------|--------|---------|---------|-------|
| Double Strike | ATTACK | 6x2 | — | — | Light multi-hit |
| Suck | ATTACK_BUFF | 10 | — | lifesteal | Heals for unblocked damage dealt |
| Fell | ATTACK_DEBUFF | 18 | Frail 2 (player) | — | Heavy attack + debuff |

**Current code has:** Shell (14 block — wrong, should be Plated Armor passive), Suck (10 dmg + heal 5 — should lifesteal), Double Tap (6x2). Missing Fell move.

### AI Pattern
- 30% Double Strike, 30% Suck, 40% Fell. Cannot use any move 3x in a row. Cannot use Double Strike or Suck 2x in a row.

**Current code issue:** Has Shell as a move, but Plated Armor should be a starting buff (14 Plated Armor), not an active move. Missing Fell entirely.

### Special Mechanics
- Starts with 14 Plated Armor (gains 14 block at end of each turn, reduced by 1 each time it takes unblocked attack damage).
- `retainBlock: true` is already set in codebase (correct).
- Suck heals for exact amount of unblocked damage dealt, not a fixed amount.

---

## 6. Byrd

**Type:** Normal | **Act:** 2 | **Appears in groups of 2–3**

**Status:** Already in codebase (`byrd`). Needs AI and move corrections.

### HP
- **StS baseline:** 25–31
- **Current:** 25–31 (correct)
- **Proposed:** 25–31

### Moveset

| Move | Intent | Damage | Effects | Special | Notes |
|------|--------|--------|---------|---------|-------|
| Peck | ATTACK | 1x5 | — | — | 5-hit attack (6 on Asc2+) |
| Swoop | ATTACK | 12 | — | — | Single heavy hit |
| Caw | BUFF | — | +1 Strength | — | Self-buff |
| Fly | BUFF | — | Flight 3 | gainFlight | Regain Flying buff |
| Headbutt | ATTACK | 3 | — | — | Light attack (used when stunned) |

**Current code has:** Caw (+1 Str), Peck (1x5), Swoop (12), Fly (gainFlight). Missing Headbutt. Peck damage should be 1x5 not 5x1 (semantic — same result).

### AI Pattern
- Starts Flying (Flight 3 = takes half damage until hit 3x in one turn).
- Turn 0: 62.5% Peck, 37.5% Caw.
- Subsequent turns: 50% Peck, 20% Swoop, 30% Caw. Cannot use Peck 3x in a row, cannot use Caw or Swoop 2x in a row.
- When knocked out of flight (stunned): uses Headbutt, then Fly to regain Flight.

**Current code issue:** AI is too random. Doesn't properly handle stunned/grounded state or move repetition limits.

### Special Mechanics
- **Flight:** Takes 50% damage from attacks. Removed when hit 3x in a single turn. When removed, Byrd is stunned (skips turn with Headbutt).
- `flying: true` flag already exists in codebase.
- Appears in groups — encounter spawns 2–3 Byrds.

---

## 7. Book of Stabbing

**Type:** Elite | **Act:** 2

**Status:** Already in codebase (`bookOfStabbing`). Needs AI correction.

### HP
- **StS baseline:** 160–168
- **Current:** 180–192 (slightly high)
- **Proposed:** 160–168

### Moveset

| Move | Intent | Damage | Times | Notes |
|------|--------|--------|-------|-------|
| Multi-Stab | ATTACK | 6 | 2+N | N = number of times Multi-Stab used previously |
| Single Stab | ATTACK | 21 | 1 | Heavy single hit |

**Current code has:** Multi-Stab (7 dmg x3 + addStab), Single Stab (24 dmg). Damage values slightly off. Escalation mechanic needs clarification.

### AI Pattern
- 85% Multi-Stab, 15% Single Stab each turn.
- Cannot use Multi-Stab 3x in a row.
- Cannot use Single Stab 2x in a row.
- Multi-Stab starts at 2 hits, gains +1 hit each time it's used.

**Current code issue:** Uses simple alternation (even/odd turns) instead of weighted random. Starting hit count is 3 instead of 2.

### Special Mechanics
- Multi-Stab escalation: starts at 2 hits, increases by 1 each use. By turn 6, dealing 6x5 = 30 damage per Multi-Stab.
- This is a DPS race — the longer the fight, the more dangerous it becomes.

---

## 8. Gremlin Leader

**Type:** Elite | **Act:** 2

**Status:** Already in codebase (`gremlinLeader`). Needs stat and AI corrections.

### HP
- **StS baseline:** 140–148
- **Current:** 160–172 (too high)
- **Proposed:** 140–148

### Moveset

| Move | Intent | Damage | Effects | Special | Notes |
|------|--------|--------|---------|---------|-------|
| Rally! | BUFF | — | — | summonGremlins | Summons 2 random Gremlins |
| Encourage | BUFF | — | +3 Str, +6 Block (all minions) | buffGremlins | Buffs all living Gremlins |
| Stab | ATTACK | 6x3 | — | — | Multi-hit attack |

**Current code has:** Encourage (+3 Str), Rally (summon), Stab (7x4). Stab damage/hits are off. Encourage missing block component.

### AI Pattern
- Turn 0: Always Rally! (summon initial Gremlins).
- If 0 minions alive: 75% Rally!, 25% Stab.
- If last move was Encourage: 50% Rally!, 50% Stab.
- If last move was Rally! or Stab: 62.5% Encourage, 37.5% (the other).
- Cannot use Encourage or Rally! 2x in a row.

**Current code issue:** Uses rigid turn-based pattern instead of context-aware AI based on minion count.

### Special Mechanics
- Summons random Gremlins from the Act 1 Gremlin pool (Fat, Mad, Shield, Sneaky, Wizard).
- Max 4 minions at a time.
- Encourage gives BOTH Strength and Block to all living Gremlins.

---

## 9. Reptomancer

**Type:** Elite | **Act:** 2 (proposed move from current Act 3)

**Status:** Already in codebase as Act 3 (`reptomancer`). The task asks for Act 2 design. In StS, Reptomancer is actually an Act 3 elite, but GAME_REFERENCE.md lists it among Act 2 encounters, so we follow the project's intended placement.

### HP
- **StS baseline:** 180–190
- **Current:** 200–216 (slightly high)
- **Proposed:** 180–190

### Moveset (Reptomancer)

| Move | Intent | Damage | Effects | Special | Notes |
|------|--------|--------|---------|---------|-------|
| Summon | BUFF | — | — | summonDaggers | Summons 1 Dagger (2 on Asc18+) |
| Snake Strike | ATTACK_DEBUFF | 13x2 | Weak 1 (player) | — | Multi-hit + debuff |
| Big Bite | ATTACK | 30 | — | — | Heavy single hit |

### Dagger Minion

| Stat | Value |
|------|-------|
| HP | 20–24 |
| Stab | 9 damage (used turn 1) |
| Explode | 25 damage (used turn 2, dies after) |

**Current code has:** Snake Strike (15x2, no Weak), Big Bite (34). Missing Weak on Snake Strike. Dagger minion not defined in enemies.js.

### AI Pattern
- Turn 0: Always Summon.
- Subsequent: roughly equal chance of Snake Strike, Big Bite, Summon. Cannot use Snake Strike or Big Bite 2x in a row. Cannot use Summon 3x in a row.
- Max 4 Daggers alive at once.

**Current code issue:** Summons too frequently (every 3 turns guaranteed). Should be probability-based.

### Special Mechanics
- Daggers use Stab on their first turn, then Explode on their second turn (kills the Dagger).
- Explode deals massive damage — must kill Daggers before turn 2 or block heavily.

---

## 10. Automaton

**Type:** Boss | **Act:** 2

**Status:** NOT in codebase. New enemy.

### HP
- **StS baseline:** 300 (320 on Asc9+)
- **Proposed:** 300–320
- Starts with 3 Artifact (blocks first 3 debuff applications).

### Moveset (Automaton)

| Move | Intent | Damage | Block | Effects | Special | Notes |
|------|--------|--------|-------|---------|---------|-------|
| Spawn Orbs | BUFF | — | — | — | summonOrbs | Summons 2 Bronze Orbs |
| Flail | ATTACK | 7x2 | — | — | — | Multi-hit |
| Boost | BUFF | — | 9 | +3 Strength | — | Self-buff + block |
| Hyper Beam | ATTACK | 45 | — | — | — | Massive nuke |
| Stunned | STUN | — | — | — | — | Does nothing (recovery) |

### Bronze Orb Minion

| Stat | Value |
|------|-------|
| HP | 52–58 |
| Stasis | Steals highest-rarity card from draw pile (used first) |
| Beam | 8 damage |
| Support Beam | 0 damage, gives Automaton 12 Block |

### AI Pattern (Fixed Cycle)
1. Spawn Orbs
2. Flail
3. Boost
4. Flail
5. Boost
6. **Hyper Beam** (45 damage)
7. Stunned (does nothing)
8. Repeat from step 2

### Bronze Orb AI
- First move: 75% Stasis, 7.5% Beam, 17.5% Support Beam.
- After Stasis used: 70% Support Beam, 30% Beam.

### Special Mechanics
- **Artifact 3:** Blocks the first 3 debuffs applied to Automaton.
- **Hyper Beam:** Massive 45 damage. Followed by Stunned turn (free turn for player).
- **Bronze Orbs:** Stasis steals a card from player's draw pile for the combat. Card is returned if Orb dies. Prioritizes highest rarity.
- **Fixed pattern:** Unlike most enemies, Automaton follows a strict cycle. Players can plan around the Hyper Beam timing.

---

## Summary Table

| # | Enemy | Type | HP | Key Threat | Status |
|---|-------|------|----|------------|--------|
| 1 | Centurion | Normal | 76–80 | Fury when Mystic dies | Exists, needs corrections |
| 2 | Mystic | Normal | 48–56 | Heals allies, buffs Strength | Exists, needs Buff move |
| 3 | Snecko | Normal | 114–120 | Confused debuff | Exists, HP way too low |
| 4 | Chosen | Normal | 95–99 | Hex + Drain scaling | Exists, HP too low, missing Drain |
| 5 | Shelled Parasite | Normal | 68–72 | Plated Armor + lifesteal | Exists, moveset wrong |
| 6 | Byrd | Normal | 25–31 | Flight + Strength scaling | Exists, AI needs work |
| 7 | Book of Stabbing | Elite | 160–168 | Escalating Multi-Stab | Exists, HP/AI off |
| 8 | Gremlin Leader | Elite | 140–148 | Summons + buffs Gremlins | Exists, HP too high |
| 9 | Reptomancer | Elite | 180–190 | Dagger minions explode | Exists (Act 3), needs move |
| 10 | Automaton | Boss | 300–320 | Hyper Beam + Orb Stasis | NEW — not in codebase |

---

## Implementation Notes

### New Systems Required for Sprint 7
1. **Plated Armor** as a starting buff (Shelled Parasite)
2. **Hex debuff** mechanic (Chosen — partial, `addHex` special exists)
3. **Confused debuff** as a move effect (Snecko — `confuse` flag exists but not as a move)
4. **Artifact** buff for enemies (Automaton)
5. **Stasis** card-stealing mechanic (Bronze Orb)
6. **Dagger minion** entity with Stab/Explode lifecycle (Reptomancer)
7. **Bronze Orb minion** entity (Automaton)
8. **Ally-aware AI** — Centurion checks if Mystic alive, Mystic checks ally HP thresholds

### Existing Systems to Leverage
- `retainBlock` flag (already on Shelled Parasite)
- `flying` flag (already on Byrd)
- `summons` flag (already on Reptomancer)
- `confuse` flag (already on Snecko)
- `healAlly` / `buffGremlins` specials (already on Mystic / Gremlin Leader)
- Multi-hit attacks via `times` property
- Strength/Weak/Vulnerable/Frail effects

---

*Prepared by JR | Sprint 7 Prep | 2026-01-30*
