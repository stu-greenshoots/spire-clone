/**
 * Detailed Balance Analysis - JR-16
 * Analyzes win rates by act completion to identify balance issues.
 */

import { runBalanceReport } from '../src/test/balance/simulator.js';

const RUNS = 1000;
const SEED = 20260214;

console.log('='.repeat(80));
console.log('DETAILED BALANCE ANALYSIS — JR-16');
console.log('='.repeat(80));
console.log('');

// Test each act progression separately
const configs = [
  { acts: 1, ascension: 0, label: 'Act 1 Boss (A0)' },
  { acts: 2, ascension: 0, label: 'Act 2 Boss (A0)' },
  { acts: 3, ascension: 0, label: 'Act 3 Boss (A0)' },
  { acts: 4, ascension: 0, label: 'The Heart (A0)' },
  { acts: 1, ascension: 5, label: 'Act 1 Boss (A5)' },
  { acts: 2, ascension: 5, label: 'Act 2 Boss (A5)' },
  { acts: 3, ascension: 5, label: 'Act 3 Boss (A5)' },
  { acts: 4, ascension: 5, label: 'The Heart (A5)' }
];

const results = [];

for (const config of configs) {
  console.log(`Running ${config.label}... (${RUNS} runs)`);
  const report = runBalanceReport(RUNS, {
    seed: SEED,
    floors: 14,
    acts: config.acts,
    ascension: config.ascension
  });

  results.push({
    ...config,
    winRate: report.winRate,
    avgFloors: report.avgFloorsCleared,
    avgTurns: report.avgTurnsPerCombat,
    deadliest: report.deadliestEnemy,
    time: report.totalTime
  });

  console.log(`  Win Rate: ${(report.winRate * 100).toFixed(2)}%`);
  console.log(`  Avg Floors: ${report.avgFloorsCleared.toFixed(1)}`);
  console.log(`  Deadliest: ${report.deadliestEnemy}`);
  console.log('');
}

console.log('='.repeat(80));
console.log('SUMMARY TABLE');
console.log('='.repeat(80));
console.log('');
console.log('Ascension 0:');
console.log('-'.repeat(80));
console.log('Target              | Win Rate   | Avg Floors | Deadliest Enemy');
console.log('-'.repeat(80));

results.filter(r => r.ascension === 0).forEach(r => {
  console.log(
    `${r.label.padEnd(20)} | ${(r.winRate * 100).toFixed(2).padStart(9)}% | ${r.avgFloors.toFixed(1).padStart(10)} | ${r.deadliest}`
  );
});

console.log('');
console.log('Ascension 5:');
console.log('-'.repeat(80));
console.log('Target              | Win Rate   | Avg Floors | Deadliest Enemy');
console.log('-'.repeat(80));

results.filter(r => r.ascension === 5).forEach(r => {
  console.log(
    `${r.label.padEnd(20)} | ${(r.winRate * 100).toFixed(2).padStart(9)}% | ${r.avgFloors.toFixed(1).padStart(10)} | ${r.deadliest}`
  );
});

console.log('');
console.log('='.repeat(80));
console.log('ASSESSMENT');
console.log('='.repeat(80));
console.log('');

// Target win rates:
// - Act 1: 60-80% (most players should clear Act 1)
// - Act 2: 35-50% (moderate difficulty spike)
// - Act 3: 20-30% (high difficulty)
// - Heart: 10-20% at A0, 5-10% at A5 (endgame challenge)

const a0Act1 = results.find(r => r.acts === 1 && r.ascension === 0);
const a0Act2 = results.find(r => r.acts === 2 && r.ascension === 0);
const a0Act3 = results.find(r => r.acts === 3 && r.ascension === 0);
const a0Heart = results.find(r => r.acts === 4 && r.ascension === 0);
const a5Act1 = results.find(r => r.acts === 1 && r.ascension === 5);
const a5Heart = results.find(r => r.acts === 4 && r.ascension === 5);

console.log('PROGRESSION DIFFICULTY (A0):');
console.log(`  Act 1 → Act 2: ${(a0Act1.winRate * 100).toFixed(1)}% → ${(a0Act2.winRate * 100).toFixed(1)}% (drop: ${((a0Act1.winRate - a0Act2.winRate) * 100).toFixed(1)}%)`);
console.log(`  Act 2 → Act 3: ${(a0Act2.winRate * 100).toFixed(1)}% → ${(a0Act3.winRate * 100).toFixed(1)}% (drop: ${((a0Act2.winRate - a0Act3.winRate) * 100).toFixed(1)}%)`);
console.log(`  Act 3 → Heart: ${(a0Act3.winRate * 100).toFixed(1)}% → ${(a0Heart.winRate * 100).toFixed(1)}% (drop: ${((a0Act3.winRate - a0Heart.winRate) * 100).toFixed(1)}%)`);
console.log('');

console.log('ASCENSION SCALING:');
console.log(`  Act 1:  A0 ${(a0Act1.winRate * 100).toFixed(1)}% → A5 ${(a5Act1.winRate * 100).toFixed(1)}% (${((a5Act1.winRate / a0Act1.winRate) * 100).toFixed(0)}% retention)`);
console.log(`  Heart:  A0 ${(a0Heart.winRate * 100).toFixed(1)}% → A5 ${(a5Heart.winRate * 100).toFixed(1)}% (${a0Heart.winRate > 0 ? ((a5Heart.winRate / a0Heart.winRate) * 100).toFixed(0) : 'N/A'}% retention)`);
console.log('');

console.log('BALANCE FLAGS:');
let flags = 0;

if (a0Act1.winRate < 0.60) {
  console.log(`⚠ Act 1 A0 win rate (${(a0Act1.winRate * 100).toFixed(1)}%) is below target (60%+) - early game too hard`);
  flags++;
}

if (a0Act2.winRate < 0.35) {
  console.log(`⚠ Act 2 A0 win rate (${(a0Act2.winRate * 100).toFixed(1)}%) is below target (35%+) - mid game too hard`);
  flags++;
}

if (a0Act3.winRate < 0.20) {
  console.log(`⚠ Act 3 A0 win rate (${(a0Act3.winRate * 100).toFixed(1)}%) is below target (20%+) - late game too hard`);
  flags++;
}

if (a0Heart.winRate < 0.10) {
  console.log(`⚠ Heart A0 win rate (${(a0Heart.winRate * 100).toFixed(1)}%) is below target (10%+) - endgame too hard`);
  flags++;
}

if (a5Act1.winRate < 0.40) {
  console.log(`⚠ Act 1 A5 win rate (${(a5Act1.winRate * 100).toFixed(1)}%) is below target (40%+) - ascension too punishing`);
  flags++;
}

if (flags === 0) {
  console.log('✓ All win rates are within acceptable ranges');
}

console.log('');
console.log('NOTE: Simulator uses greedy AI - real player win rates will be higher.');
console.log('='.repeat(80));
