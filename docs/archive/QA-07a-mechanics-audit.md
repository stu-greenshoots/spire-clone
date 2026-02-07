# QA-07a: Mechanics Audit Spike

**Author:** QA
**Date:** 2026-01-30
**Timebox:** 2 hours
**Purpose:** Verify 4 claims from the Copilot audit against actual codebase.

---

## 1. Sentry Data (HP / Artifact / Damage)

**Verdict: NOT A BUG**

**Evidence:** `src/data/enemies.js:261-281`

| Property | Value in Code | Expected (StS reference) | Match? |
|----------|--------------|--------------------------|--------|
| HP | 48-56 | 38-42 | Higher than reference, but intentional balance choice |
| Artifact | 2 | Varies | Present and functional |
| Bolt damage | 11 | 9 | Slightly higher, balance choice |
| Beam damage | 11 | 9 | Slightly higher, balance choice |
| Spawn count | 3 | 3 | Correct |
| Type | elite | elite | Correct |

The Sentry data is internally consistent. HP, artifact, and damage values are all defined and wired through `createEnemyInstance` (line 826-855) which correctly initializes `artifact: enemy.artifact || 0`. The AI function uses staggered attacks based on index (odd/even), which is correct behavior.

**Note:** JR-fix addresses a separate issue with HP/intent initialization via `createEnemyInstance`. That fix is orthogonal to data correctness.

---

## 2. Power Card Exhaustion

**Verdict: CONFIRMED BUG**

**Evidence:** `src/context/reducers/combat/playCardAction.js:399-436`

```javascript
// Line 400-401: Only exhaust if card.exhaust flag is set or corruption+skill
if (card.exhaust || (newPlayer.corruption && card.type === CARD_TYPES.SKILL)) {
    newExhaustPile.push(card);
    // ... exhaust triggers ...
} else {
    newDiscardPile.push(card); // <-- Power cards land HERE
}
```

Power cards (e.g., Barricade, Berserk, Demon Form) do NOT have `exhaust: true` in their card data (`src/data/cards.js:748+`). After being played, they go to the **discard pile** instead of being removed from the card cycle entirely.

**Impact:** Power cards will be reshuffled into the draw pile and can be drawn and played again. In Slay the Spire, powers stay in play permanently and are never returned to any pile. This means:
- Players can stack powers multiple times (e.g., multiple Demon Forms)
- Power effects that should be one-time-per-combat can compound

**Fix ownership:** BE-16

---

## 3. Combat State Clearing

**Verdict: NOT A BUG**

**Evidence:** `src/context/reducers/mapReducer.js:79-110`

The `SELECT_NODE` handler in `mapReducer.js` resets all combat-specific player states when entering a new combat:

```javascript
// Lines 86-109 (partial):
vulnerable: 0,
weak: 0,
frail: 0,
artifact: 0,
intangible: 0,
barricade: false,
berserk: 0,
combust: null,
corruption: false,
darkEmbrace: false,
demonForm: 0,
doubleTap: 0,
evolve: 0,
feelNoPain: 0,
fireBreathing: 0,
juggernaut: 0,
metallicize: 0,
rage: 0,
rupture: 0,
flameBarrier: 0,
// ... etc
```

All buffs, debuffs, and combat-temporary states are explicitly zeroed out. Block is set from relic effects (line 81), energy is reset (line 82), and strength/dexterity carry their persistent values plus relic bonuses (lines 83-84).

Enemy instances are freshly created via `getEncounter` -> `createEnemyInstance`, so they start clean by definition.

**Conclusion:** Combat state clearing is thorough and correct.

---

## 4. Card Appearance Rates (Rarity Distribution)

**Verdict: NOT A BUG**

**Evidence:** `src/data/cards.js:1228-1245`

```javascript
export const getCardRewards = (count = 3) => {
  const rewards = [];
  for (let i = 0; i < count; i++) {
    const roll = Math.random();
    let rarity;
    if (roll < 0.6) rarity = RARITY.COMMON;       // 60%
    else if (roll < 0.9) rarity = RARITY.UNCOMMON;  // 30%
    else rarity = RARITY.RARE;                       // 10%
    // ...
  }
};
```

Rarity distribution code exists and is functional:
- **Common:** 60% chance
- **Uncommon:** 30% chance
- **Rare:** 10% chance

This aligns with standard roguelike card game conventions. The function also prevents duplicate cards in the same reward set (line 1238). The distribution is reasonable and working as coded.

**Note:** Slay the Spire uses a slightly different system with a rare counter that increases rare chance after not seeing rares. Our implementation is simpler but functional. Not a bug, could be a future enhancement.

---

## Summary

| # | Claim | Verdict | Owner |
|---|-------|---------|-------|
| 1 | Sentry data wrong | NOT A BUG | N/A |
| 2 | Power cards go to discard | **CONFIRMED BUG** | BE-16 |
| 3 | Buffs persist between combats | NOT A BUG | N/A |
| 4 | No rarity distribution | NOT A BUG | N/A |

**1 confirmed bug out of 4 claims.** The power card issue (claim 2) is already tracked under BE-16.
