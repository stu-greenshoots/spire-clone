/**
 * Performance monitoring system for dev mode (QR-14)
 *
 * Features:
 * - Reducer execution timing per action type
 * - Memory usage tracking (where available)
 * - State size monitoring
 * - Rolling averages with configurable window
 *
 * Dev mode only - all operations are no-ops in production.
 */

const isDev = typeof import.meta !== 'undefined' && import.meta.env?.DEV;

// Storage for timing data
const actionTimings = {};
const TIMING_WINDOW = 50; // Keep last 50 timings per action type

// Thresholds for warnings
const SLOW_ACTION_MS = 16; // 16ms = 60fps frame budget

/**
 * Record timing for a reducer action
 * @param {string} actionType - The action type
 * @param {number} durationMs - Execution time in milliseconds
 */
export function recordActionTiming(actionType, durationMs) {
  if (!isDev) return;

  if (!actionTimings[actionType]) {
    actionTimings[actionType] = {
      timings: [],
      totalCalls: 0,
      slowCalls: 0,
      maxTime: 0
    };
  }

  const record = actionTimings[actionType];
  record.timings.push(durationMs);
  record.totalCalls++;

  if (durationMs > record.maxTime) {
    record.maxTime = durationMs;
  }

  if (durationMs > SLOW_ACTION_MS) {
    record.slowCalls++;
    console.warn(
      `%c[Perf] Slow action: ${actionType} took ${durationMs.toFixed(2)}ms (>${SLOW_ACTION_MS}ms)`,
      'color: #ffa500'
    );
  }

  // Keep only the last TIMING_WINDOW entries
  if (record.timings.length > TIMING_WINDOW) {
    record.timings.shift();
  }
}

/**
 * Get average timing for an action type
 * @param {string} actionType - The action type
 * @returns {number} Average timing in ms, or 0 if no data
 */
export function getAverageActionTiming(actionType) {
  if (!isDev) return 0;

  const record = actionTimings[actionType];
  if (!record || record.timings.length === 0) return 0;

  const sum = record.timings.reduce((a, b) => a + b, 0);
  return sum / record.timings.length;
}

/**
 * Get summary of all action timings
 * @returns {Object} Map of actionType to { avg, max, calls, slowCalls }
 */
export function getTimingSummary() {
  if (!isDev) return {};

  const summary = {};
  for (const [actionType, record] of Object.entries(actionTimings)) {
    if (record.totalCalls === 0) continue;
    const avg = record.timings.length > 0
      ? record.timings.reduce((a, b) => a + b, 0) / record.timings.length
      : 0;
    summary[actionType] = {
      avg: Math.round(avg * 100) / 100, // 2 decimal places
      max: Math.round(record.maxTime * 100) / 100,
      calls: record.totalCalls,
      slowCalls: record.slowCalls
    };
  }
  return summary;
}

/**
 * Get top N slowest actions by average time
 * @param {number} n - Number of actions to return
 * @returns {Array<{action: string, avg: number, max: number}>}
 */
export function getSlowestActions(n = 5) {
  if (!isDev) return [];

  const summary = getTimingSummary();
  return Object.entries(summary)
    .filter(([, stats]) => stats.calls > 0)
    .sort((a, b) => b[1].avg - a[1].avg)
    .slice(0, n)
    .map(([action, stats]) => ({
      action,
      avg: stats.avg,
      max: stats.max,
      calls: stats.calls
    }));
}

/**
 * Clear all timing data
 */
export function clearTimings() {
  if (!isDev) return;
  Object.keys(actionTimings).forEach(key => delete actionTimings[key]);
}

/**
 * Estimate the size of a state object in bytes
 * Uses JSON.stringify as a rough approximation
 * @param {Object} state - The state object
 * @returns {number} Estimated size in bytes
 */
export function estimateStateSize(state) {
  if (!isDev) return 0;

  try {
    const json = JSON.stringify(state);
    return new Blob([json]).size;
  } catch {
    return 0;
  }
}

/**
 * Format bytes as human-readable string
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size (e.g., "1.5 KB")
 */
export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Get memory usage (if available via performance.memory)
 * Note: Only available in Chrome with specific flags
 * @returns {Object|null} Memory info or null if unavailable
 */
export function getMemoryUsage() {
  if (!isDev) return null;

  // performance.memory is Chrome-only and behind a flag
  const memory = performance.memory;
  if (!memory) return null;

  return {
    usedJSHeapSize: memory.usedJSHeapSize,
    totalJSHeapSize: memory.totalJSHeapSize,
    jsHeapSizeLimit: memory.jsHeapSizeLimit,
    usedFormatted: formatBytes(memory.usedJSHeapSize),
    totalFormatted: formatBytes(memory.totalJSHeapSize),
    limitFormatted: formatBytes(memory.jsHeapSizeLimit),
    percentUsed: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100)
  };
}

/**
 * Create a timing wrapper for a function
 * Records execution time and logs slow calls
 * @param {string} name - Name for logging
 * @param {Function} fn - Function to wrap
 * @returns {Function} Wrapped function
 */
export function timeFunction(name, fn) {
  if (!isDev) return fn;

  return (...args) => {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();
    recordActionTiming(name, end - start);
    return result;
  };
}

/**
 * Higher-order function to wrap a reducer with timing
 * @param {Function} reducer - The reducer function
 * @returns {Function} Wrapped reducer
 */
export function withTiming(reducer) {
  if (!isDev) return reducer;

  return (state, action) => {
    const start = performance.now();
    const result = reducer(state, action);
    const end = performance.now();
    recordActionTiming(action.type, end - start);
    return result;
  };
}

// Export for DevTools API
if (isDev && typeof window !== 'undefined') {
  window.__SPIRE_PERF__ = {
    getTimingSummary,
    getSlowestActions,
    clearTimings,
    getMemoryUsage,
    estimateStateSize
  };
}
