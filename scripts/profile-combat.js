/**
 * Combat Performance Profiling Script
 *
 * Usage:
 * 1. Start dev server: npm run dev
 * 2. Open browser to localhost:5173
 * 3. Open console and paste this script
 * 4. Results will be logged and can be copied
 *
 * Profiles:
 * - React render timing (via React DevTools Profiler API)
 * - Reducer execution timing (via __SPIRE_PERF__)
 * - Combat frame rate (60fps target)
 * - Memory usage during combat
 */

async function profileCombat() {
  console.log('%c=== COMBAT PERFORMANCE PROFILING ===', 'color: #00ff00; font-weight: bold; font-size: 16px');

  const results = {
    timestamp: new Date().toISOString(),
    testScenarios: [],
    reducerTimings: {},
    frameRates: [],
    memorySnapshots: [],
    summary: {}
  };

  // Test scenarios to profile
  const scenarios = [
    { name: 'Basic Combat (Ironclad)', scenario: 'combat-basic', character: 'ironclad' },
    { name: 'Elite Combat (Ironclad)', scenario: 'combat-elite', character: 'ironclad' },
    { name: 'Boss Combat (Ironclad)', scenario: 'combat-boss', character: 'ironclad' },
    { name: 'Basic Combat (Silent)', scenario: 'combat-basic', character: 'silent' },
    { name: 'Basic Combat (Defect)', scenario: 'combat-basic', character: 'defect' },
    { name: 'Basic Combat (Watcher)', scenario: 'combat-basic', character: 'watcher' }
  ];

  for (const { name, scenario, character } of scenarios) {
    console.log(`\n%cProfiling: ${name}`, 'color: #ffaa00; font-weight: bold');

    // Load scenario
    await new Promise(resolve => setTimeout(resolve, 100));
    window.__SPIRE__.loadScenario(scenario);

    // Wait for render
    await new Promise(resolve => setTimeout(resolve, 200));

    // Clear previous timing data
    window.__SPIRE_PERF__.clearTimings();

    // Capture memory before combat
    const memBefore = window.__SPIRE_PERF__.getMemoryUsage();

    // Measure FPS during combat
    const fpsSamples = [];
    let frameCount = 0;
    let lastTime = performance.now();

    const measureFrame = () => {
      frameCount++;
      const now = performance.now();
      const delta = now - lastTime;

      if (delta >= 1000) {
        const fps = Math.round((frameCount * 1000) / delta);
        fpsSamples.push(fps);
        frameCount = 0;
        lastTime = now;
      }

      if (fpsSamples.length < 10) {
        requestAnimationFrame(measureFrame);
      }
    };

    requestAnimationFrame(measureFrame);

    // Auto-play combat turns
    const maxTurns = 5;
    for (let turn = 0; turn < maxTurns; turn++) {
      await new Promise(resolve => setTimeout(resolve, 500));

      const state = window.__SPIRE__.getVisibleState();
      if (state.phase !== 'COMBAT') break;

      // Play cards randomly
      const hand = state.hand || [];
      for (let i = 0; i < Math.min(3, hand.length); i++) {
        await new Promise(resolve => setTimeout(resolve, 100));

        try {
          // Try to play first playable card
          const card = hand.find(c => c.cost <= state.energy);
          if (!card) break;

          const handIndex = hand.indexOf(card);
          if (card.requiresTarget && card.target !== 'all') {
            window.__SPIRE__.playCard(handIndex, 0);
          } else {
            window.__SPIRE__.playCard(handIndex);
          }
        } catch (err) {
          console.log('Card play error (expected in some cases):', err.message);
        }
      }

      // End turn
      await new Promise(resolve => setTimeout(resolve, 200));
      try {
        window.__SPIRE__.endTurn();
      } catch (err) {
        console.log('End turn error:', err.message);
        break;
      }
    }

    // Wait for FPS measurement to complete
    await new Promise(resolve => setTimeout(resolve, 6000));

    // Capture memory after combat
    const memAfter = window.__SPIRE_PERF__.getMemoryUsage();

    // Get reducer timings
    const timings = window.__SPIRE_PERF__.getTimingSummary();
    const slowest = window.__SPIRE_PERF__.getSlowestActions(10);

    // Calculate FPS statistics
    const avgFps = fpsSamples.length > 0
      ? Math.round(fpsSamples.reduce((a, b) => a + b, 0) / fpsSamples.length)
      : 0;
    const minFps = fpsSamples.length > 0 ? Math.min(...fpsSamples) : 0;

    // Store results
    results.testScenarios.push({
      name,
      character,
      scenario,
      fps: {
        avg: avgFps,
        min: minFps,
        samples: fpsSamples
      },
      memory: {
        before: memBefore,
        after: memAfter,
        delta: memAfter && memBefore
          ? {
              usedMB: ((memAfter.usedJSHeapSize - memBefore.usedJSHeapSize) / 1024 / 1024).toFixed(2),
              totalMB: ((memAfter.totalJSHeapSize - memBefore.totalJSHeapSize) / 1024 / 1024).toFixed(2)
            }
          : null
      },
      reducers: {
        summary: timings,
        slowest: slowest
      }
    });

    console.log(`✓ FPS: ${avgFps} avg, ${minFps} min`);
    console.log(`✓ Slowest actions:`, slowest.slice(0, 3).map(a => `${a.action} (${a.avg.toFixed(2)}ms)`).join(', '));
  }

  // Generate summary
  const allFps = results.testScenarios.flatMap(s => s.fps.samples);
  const avgFpsAll = Math.round(allFps.reduce((a, b) => a + b, 0) / allFps.length);
  const minFpsAll = Math.min(...allFps);

  const allSlowActions = {};
  results.testScenarios.forEach(s => {
    Object.entries(s.reducers.summary).forEach(([action, stats]) => {
      if (!allSlowActions[action]) {
        allSlowActions[action] = { avgSum: 0, maxMax: 0, count: 0 };
      }
      allSlowActions[action].avgSum += stats.avg;
      allSlowActions[action].maxMax = Math.max(allSlowActions[action].maxMax, stats.max);
      allSlowActions[action].count++;
    });
  });

  const topSlowActions = Object.entries(allSlowActions)
    .map(([action, data]) => ({
      action,
      avgAcrossTests: (data.avgSum / data.count).toFixed(2),
      maxAcrossTests: data.maxMax.toFixed(2)
    }))
    .sort((a, b) => parseFloat(b.avgAcrossTests) - parseFloat(a.avgAcrossTests))
    .slice(0, 10);

  results.summary = {
    totalTests: results.testScenarios.length,
    fps: {
      avgAcrossAllTests: avgFpsAll,
      minAcrossAllTests: minFpsAll,
      meets60fpsTarget: minFpsAll >= 60
    },
    reducers: {
      topSlowActions,
      actionsOver16ms: topSlowActions.filter(a => parseFloat(a.avgAcrossTests) > 16).length
    }
  };

  console.log('\n%c=== SUMMARY ===', 'color: #00ff00; font-weight: bold; font-size: 16px');
  console.log(`FPS: ${avgFpsAll} avg, ${minFpsAll} min (target: 60fps)`);
  console.log(`Frame budget violations: ${results.summary.reducers.actionsOver16ms} actions > 16ms`);
  console.log('\nTop slow actions:');
  topSlowActions.slice(0, 5).forEach(a => {
    console.log(`  ${a.action}: ${a.avgAcrossTests}ms avg, ${a.maxAcrossTests}ms max`);
  });

  console.log('\n%cFull results:', 'color: #00aaff; font-weight: bold');
  console.log(JSON.stringify(results, null, 2));

  console.log('\n%cCopy results to clipboard:', 'color: #00aaff; font-weight: bold');
  console.log('copy(results)');

  return results;
}

// Run profiling
console.log('Starting combat profiling in 3 seconds...');
console.log('Make sure React DevTools is open for component profiling!');
setTimeout(() => {
  profileCombat().then(results => {
    window.__PROFILE_RESULTS__ = results;
    console.log('\n%cProfiled data stored in window.__PROFILE_RESULTS__', 'color: #00ff00; font-weight: bold');
    console.log('To copy: copy(__PROFILE_RESULTS__)');
  });
}, 3000);
