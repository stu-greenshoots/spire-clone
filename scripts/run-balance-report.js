/**
 * Balance Report Runner - JR-16
 * Runs balance simulations for all 4 characters at A0 and A5.
 * Target win rates: 25-35% at A0, 10-20% at A5.
 */

import { runBalanceReport } from '../src/test/balance/simulator.js';

// Note: The simulator currently uses Ironclad starter deck.
// This script runs at A0 and A5 to verify difficulty scaling.
// Character-specific balance would require simulator updates (out of scope).

const RUNS_PER_TEST = 2000;
const SEED = 20260214; // Sprint 19 date

console.log('='.repeat(80));
console.log('SPIRE ASCENT BALANCE REPORT — JR-16 (Sprint 19)');
console.log('='.repeat(80));
console.log(`Runs per test: ${RUNS_PER_TEST}`);
console.log(`Seed: ${SEED}`);
console.log('');

// A0 full run (3 acts + Heart)
console.log('--- ASCENSION 0 (Acts 1-3 + Heart) ---');
const a0Full = runBalanceReport(RUNS_PER_TEST, {
  seed: SEED,
  floors: 14,
  acts: 4,
  ascension: 0
});

console.log(`Win Rate: ${(a0Full.winRate * 100).toFixed(2)}%`);
console.log(`Avg Floors Cleared: ${a0Full.avgFloorsCleared.toFixed(1)}`);
console.log(`Avg Turns Per Combat: ${a0Full.avgTurnsPerCombat.toFixed(1)}`);
console.log(`Deadliest Enemy: ${a0Full.deadliestEnemy}`);
console.log(`Avg HP at End (survivors): ${a0Full.avgHpAtEnd.toFixed(1)}`);
console.log(`Total Time: ${(a0Full.totalTime / 1000).toFixed(1)}s`);
console.log('');

// A5 full run
console.log('--- ASCENSION 5 (Acts 1-3 + Heart) ---');
const a5Full = runBalanceReport(RUNS_PER_TEST, {
  seed: SEED,
  floors: 14,
  acts: 4,
  ascension: 5
});

console.log(`Win Rate: ${(a5Full.winRate * 100).toFixed(2)}%`);
console.log(`Avg Floors Cleared: ${a5Full.avgFloorsCleared.toFixed(1)}`);
console.log(`Avg Turns Per Combat: ${a5Full.avgTurnsPerCombat.toFixed(1)}`);
console.log(`Deadliest Enemy: ${a5Full.deadliestEnemy}`);
console.log(`Avg HP at End (survivors): ${a5Full.avgHpAtEnd.toFixed(1)}`);
console.log(`Total Time: ${(a5Full.totalTime / 1000).toFixed(1)}s`);
console.log('');

// Top 20 most played cards
console.log('--- TOP 20 MOST PLAYED CARDS (A0) ---');
const topCards = Object.entries(a0Full.cardPlayFrequency).slice(0, 20);
topCards.forEach(([cardId, count], idx) => {
  console.log(`${idx + 1}. ${cardId}: ${count} plays`);
});
console.log('');

// Bottom 20 least played cards (excluding starter cards)
console.log('--- BOTTOM 20 LEAST PLAYED CARDS (A0) ---');
const allCards = Object.entries(a0Full.cardPlayFrequency);
const nonStarterCards = allCards.filter(([id]) =>
  !['strike', 'defend', 'bash', 'strike_silent', 'defend_silent', 'neutralize', 'survivor',
    'strike_defect', 'defend_defect', 'zap', 'dualcast', 'strike_watcher', 'defend_watcher',
    'eruption', 'vigilance'].includes(id)
);
const bottomCards = nonStarterCards.slice(-20).reverse();
bottomCards.forEach(([cardId, count], idx) => {
  console.log(`${idx + 1}. ${cardId}: ${count} plays`);
});
console.log('');

console.log('='.repeat(80));
console.log('ASSESSMENT');
console.log('='.repeat(80));

// Target win rates: 25-35% at A0, 10-20% at A5
const a0Target = { min: 0.25, max: 0.35 };
const a5Target = { min: 0.10, max: 0.20 };

console.log(`A0 Win Rate: ${(a0Full.winRate * 100).toFixed(2)}% (Target: ${a0Target.min * 100}-${a0Target.max * 100}%)`);
if (a0Full.winRate >= a0Target.min && a0Full.winRate <= a0Target.max) {
  console.log('✓ A0 win rate is within target range');
} else if (a0Full.winRate < a0Target.min) {
  console.log('✗ A0 win rate is TOO LOW - game is too hard');
} else {
  console.log('✗ A0 win rate is TOO HIGH - game is too easy');
}
console.log('');

console.log(`A5 Win Rate: ${(a5Full.winRate * 100).toFixed(2)}% (Target: ${a5Target.min * 100}-${a5Target.max * 100}%)`);
if (a5Full.winRate >= a5Target.min && a5Full.winRate <= a5Target.max) {
  console.log('✓ A5 win rate is within target range');
} else if (a5Full.winRate < a5Target.min) {
  console.log('✗ A5 win rate is TOO LOW - ascension is too hard');
} else {
  console.log('✗ A5 win rate is TOO HIGH - ascension is too easy');
}
console.log('');

// Difficulty scaling check
const scalingRatio = a0Full.winRate > 0 ? (a5Full.winRate / a0Full.winRate) : 0;
console.log(`Difficulty Scaling (A5/A0 ratio): ${scalingRatio.toFixed(2)}`);
if (scalingRatio < 0.8) {
  console.log('✓ Ascension 5 is materially harder than A0');
} else {
  console.log('✗ Ascension 5 is not hard enough (should be ~40-60% of A0 win rate)');
}
console.log('');

console.log('NOTE: The simulator uses a greedy AI with random card rewards.');
console.log('Win rates are lower than skilled human gameplay.');
console.log('Character-specific balance requires simulator updates (not in scope for JR-16).');
console.log('');
console.log('='.repeat(80));
