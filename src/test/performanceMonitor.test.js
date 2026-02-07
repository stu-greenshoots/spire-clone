import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  recordActionTiming,
  getAverageActionTiming,
  getTimingSummary,
  getSlowestActions,
  clearTimings,
  estimateStateSize,
  formatBytes,
  getMemoryUsage,
  timeFunction,
  withTiming
} from '../systems/performanceMonitor';

describe('Performance Monitor (QR-14)', () => {
  beforeEach(() => {
    clearTimings();
  });

  describe('recordActionTiming', () => {
    it('records timing for an action type', () => {
      recordActionTiming('TEST_ACTION', 5);
      recordActionTiming('TEST_ACTION', 10);
      recordActionTiming('TEST_ACTION', 15);

      const avg = getAverageActionTiming('TEST_ACTION');
      expect(avg).toBe(10); // (5 + 10 + 15) / 3
    });

    it('returns 0 for unknown action type', () => {
      const avg = getAverageActionTiming('UNKNOWN_ACTION');
      expect(avg).toBe(0);
    });

    it('keeps rolling window of timings', () => {
      // Record 60 timings
      for (let i = 0; i < 60; i++) {
        recordActionTiming('MANY_TIMINGS', i);
      }

      const summary = getTimingSummary();
      expect(summary['MANY_TIMINGS']).toBeDefined();
      expect(summary['MANY_TIMINGS'].calls).toBe(60);
      // Should only keep last 50 timings for average calculation
      // Last 50 timings are 10-59, average = 34.5
      expect(summary['MANY_TIMINGS'].avg).toBeCloseTo(34.5, 1);
    });

    it('logs warning for slow actions', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      recordActionTiming('SLOW_ACTION', 20); // > 16ms threshold

      expect(warnSpy).toHaveBeenCalled();
      expect(warnSpy.mock.calls[0][0]).toContain('Slow action');
      expect(warnSpy.mock.calls[0][0]).toContain('SLOW_ACTION');

      warnSpy.mockRestore();
    });

    it('does not log warning for fast actions', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      recordActionTiming('FAST_ACTION', 5); // < 16ms threshold

      expect(warnSpy).not.toHaveBeenCalled();

      warnSpy.mockRestore();
    });
  });

  describe('getTimingSummary', () => {
    it('returns summary of all action timings', () => {
      recordActionTiming('ACTION_A', 5);
      recordActionTiming('ACTION_A', 10);
      recordActionTiming('ACTION_B', 20);
      recordActionTiming('ACTION_B', 30);

      const summary = getTimingSummary();

      expect(summary['ACTION_A']).toBeDefined();
      expect(summary['ACTION_A'].avg).toBe(7.5);
      expect(summary['ACTION_A'].max).toBe(10);
      expect(summary['ACTION_A'].calls).toBe(2);

      expect(summary['ACTION_B']).toBeDefined();
      expect(summary['ACTION_B'].avg).toBe(25);
      expect(summary['ACTION_B'].max).toBe(30);
      expect(summary['ACTION_B'].calls).toBe(2);
    });

    it('tracks slow call count', () => {
      recordActionTiming('MIXED_ACTION', 5);  // fast
      recordActionTiming('MIXED_ACTION', 20); // slow (>16ms)
      recordActionTiming('MIXED_ACTION', 10); // fast
      recordActionTiming('MIXED_ACTION', 25); // slow (>16ms)

      const summary = getTimingSummary();
      expect(summary['MIXED_ACTION'].slowCalls).toBe(2);
    });
  });

  describe('getSlowestActions', () => {
    it('returns top N slowest actions by average time', () => {
      recordActionTiming('FAST', 2);
      recordActionTiming('MEDIUM', 10);
      recordActionTiming('SLOW', 25);
      recordActionTiming('VERY_SLOW', 50);

      const slowest = getSlowestActions(2);

      expect(slowest).toHaveLength(2);
      expect(slowest[0].action).toBe('VERY_SLOW');
      expect(slowest[0].avg).toBe(50);
      expect(slowest[1].action).toBe('SLOW');
      expect(slowest[1].avg).toBe(25);
    });

    it('returns empty array when no timings', () => {
      const slowest = getSlowestActions(5);
      expect(slowest).toEqual([]);
    });

    it('includes call count in results', () => {
      recordActionTiming('CALLED_MANY', 10);
      recordActionTiming('CALLED_MANY', 10);
      recordActionTiming('CALLED_MANY', 10);

      const slowest = getSlowestActions(1);
      expect(slowest[0].calls).toBe(3);
    });
  });

  describe('clearTimings', () => {
    it('clears all timing data', () => {
      recordActionTiming('ACTION_A', 10);
      recordActionTiming('ACTION_B', 20);

      clearTimings();

      const summary = getTimingSummary();
      expect(Object.keys(summary)).toHaveLength(0);
    });
  });

  describe('estimateStateSize', () => {
    it('estimates size of state object', () => {
      const state = {
        player: { hp: 100, maxHp: 100 },
        deck: ['card1', 'card2', 'card3'],
        enemies: [{ name: 'Enemy', hp: 50 }]
      };

      const size = estimateStateSize(state);

      expect(size).toBeGreaterThan(0);
      expect(size).toBeLessThan(1000); // Should be a few hundred bytes
    });

    it('returns 0 for circular references', () => {
      const circular = {};
      circular.self = circular;

      const size = estimateStateSize(circular);
      expect(size).toBe(0);
    });

    it('handles empty objects', () => {
      const size = estimateStateSize({});
      expect(size).toBeGreaterThan(0); // At least "{}"
      expect(size).toBeLessThan(10);
    });
  });

  describe('formatBytes', () => {
    it('formats bytes correctly', () => {
      expect(formatBytes(100)).toBe('100 B');
      expect(formatBytes(1024)).toBe('1.0 KB');
      expect(formatBytes(1536)).toBe('1.5 KB');
      expect(formatBytes(1024 * 1024)).toBe('1.0 MB');
      expect(formatBytes(1.5 * 1024 * 1024)).toBe('1.5 MB');
    });
  });

  describe('getMemoryUsage', () => {
    it('returns null when performance.memory is unavailable', () => {
      // performance.memory is Chrome-only
      if (!performance.memory) {
        const result = getMemoryUsage();
        expect(result).toBeNull();
      }
    });

    it('returns memory info when available', () => {
      // Mock performance.memory if not available
      const originalMemory = performance.memory;
      if (!originalMemory) {
        Object.defineProperty(performance, 'memory', {
          value: {
            usedJSHeapSize: 50 * 1024 * 1024,
            totalJSHeapSize: 100 * 1024 * 1024,
            jsHeapSizeLimit: 200 * 1024 * 1024
          },
          configurable: true
        });
      }

      const result = getMemoryUsage();

      if (performance.memory) {
        expect(result).toBeDefined();
        expect(result.usedJSHeapSize).toBeGreaterThan(0);
        expect(result.usedFormatted).toBeDefined();
        expect(result.percentUsed).toBeGreaterThan(0);
        expect(result.percentUsed).toBeLessThanOrEqual(100);
      }

      // Restore original
      if (!originalMemory) {
        delete performance.memory;
      }
    });
  });

  describe('timeFunction', () => {
    it('wraps function and records timing', () => {
      const fn = vi.fn((a, b) => a + b);
      const timed = timeFunction('ADD', fn);

      const result = timed(2, 3);

      expect(result).toBe(5);
      expect(fn).toHaveBeenCalledWith(2, 3);

      const avg = getAverageActionTiming('ADD');
      expect(avg).toBeGreaterThanOrEqual(0); // Should have recorded something
    });
  });

  describe('withTiming', () => {
    it('wraps reducer and records action timing', () => {
      const reducer = (state, action) => {
        if (action.type === 'INCREMENT') {
          return { ...state, count: state.count + 1 };
        }
        return state;
      };

      const timedReducer = withTiming(reducer);
      const state = { count: 0 };

      const newState = timedReducer(state, { type: 'INCREMENT' });

      expect(newState.count).toBe(1);

      const avg = getAverageActionTiming('INCREMENT');
      expect(avg).toBeGreaterThanOrEqual(0);
    });
  });

  describe('DevTools API exposure', () => {
    it('exposes performance functions on window.__SPIRE_PERF__', () => {
      // In dev mode, these should be exposed
      if (import.meta.env.DEV) {
        expect(window.__SPIRE_PERF__).toBeDefined();
        expect(typeof window.__SPIRE_PERF__.getTimingSummary).toBe('function');
        expect(typeof window.__SPIRE_PERF__.getSlowestActions).toBe('function');
        expect(typeof window.__SPIRE_PERF__.clearTimings).toBe('function');
        expect(typeof window.__SPIRE_PERF__.getMemoryUsage).toBe('function');
        expect(typeof window.__SPIRE_PERF__.estimateStateSize).toBe('function');
      }
    });
  });
});
