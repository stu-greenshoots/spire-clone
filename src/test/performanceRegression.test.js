/**
 * QA-26: Performance Regression Tests
 *
 * Validates bundle size gates after BE-33 code-splitting:
 * - No chunk exceeds 500KB uncompressed
 * - Total bundle size stays within budget
 * - Code-split configuration produces expected chunks
 * - Lazy-loaded routes don't appear in main entry chunk
 */
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const DIST_DIR = path.resolve(__dirname, '../../dist/assets');
const MAX_CHUNK_SIZE_KB = 500;
const MAX_TOTAL_SIZE_KB = 1500; // 1.5MB total JS budget

/**
 * Get all JS chunks from dist/assets.
 * Returns array of { name, sizeKB }.
 * Skips if dist doesn't exist (pre-build).
 */
function getChunks() {
  if (!fs.existsSync(DIST_DIR)) {
    return null;
  }
  const files = fs.readdirSync(DIST_DIR).filter(f => f.endsWith('.js'));
  return files.map(f => {
    const stats = fs.statSync(path.join(DIST_DIR, f));
    return {
      name: f,
      sizeBytes: stats.size,
      sizeKB: Math.round(stats.size / 1024 * 100) / 100,
    };
  });
}

describe('QA-26: Performance Regression', () => {
  describe('Bundle size gates', () => {
    const chunks = getChunks();

    it('dist/assets directory exists (build must run first)', () => {
      expect(chunks).not.toBeNull();
    });

    it('produces at least 10 JS chunks (code-splitting active)', () => {
      if (!chunks) return;
      expect(chunks.length).toBeGreaterThanOrEqual(10);
    });

    it('no single chunk exceeds 500KB uncompressed', () => {
      if (!chunks) return;
      const oversized = chunks.filter(c => c.sizeKB > MAX_CHUNK_SIZE_KB);
      expect(
        oversized,
        `Oversized chunks: ${oversized.map(c => `${c.name} (${c.sizeKB}KB)`).join(', ')}`
      ).toHaveLength(0);
    });

    it('total JS bundle stays under 1.5MB', () => {
      if (!chunks) return;
      const totalKB = chunks.reduce((sum, c) => sum + c.sizeKB, 0);
      expect(totalKB).toBeLessThan(MAX_TOTAL_SIZE_KB);
    });

    it('largest chunk is under 200KB (vendor-react expected largest)', () => {
      if (!chunks) return;
      const largest = chunks.reduce((max, c) => c.sizeKB > max.sizeKB ? c : max, chunks[0]);
      expect(largest.sizeKB).toBeLessThan(200);
    });
  });

  describe('Code-split chunk structure', () => {
    const chunks = getChunks();
    const chunkNames = chunks ? chunks.map(c => c.name) : [];

    const expectedChunks = [
      'vendor-react',
      'game-data',
      'game-systems',
      'game-reducers',
      'game-context',
      'art-assets',
      'audio',
    ];

    expectedChunks.forEach(expected => {
      it(`has dedicated "${expected}" chunk`, () => {
        if (!chunks) return;
        const found = chunkNames.some(n => n.includes(expected));
        expect(found, `Missing chunk: ${expected}`).toBe(true);
      });
    });

    it('has lazy-loaded screen chunks (route-level splitting)', () => {
      if (!chunks) return;
      const screenChunks = chunkNames.filter(n =>
        /^(CombatScreen|MapScreen|MainMenu|ShopScreen|EventScreen|RestSite|Settings|GameOverScreen|VictoryScreen|DeckViewer|RewardScreen)/i.test(n)
      );
      expect(screenChunks.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('Vite config validation', () => {
    it('manualChunks config defines expected split points', async () => {
      // Read vite config to verify split points are defined
      const configPath = path.resolve(__dirname, '../../vite.config.js');
      const configContent = fs.readFileSync(configPath, 'utf-8');

      expect(configContent).toContain('manualChunks');
      expect(configContent).toContain('vendor-react');
      expect(configContent).toContain('game-data');
      expect(configContent).toContain('game-systems');
      expect(configContent).toContain('game-reducers');
      expect(configContent).toContain('audio');
      expect(configContent).toContain('art-assets');
    });

    it('assetsInlineLimit is 0 (no inlining)', async () => {
      const configPath = path.resolve(__dirname, '../../vite.config.js');
      const configContent = fs.readFileSync(configPath, 'utf-8');
      expect(configContent).toContain('assetsInlineLimit: 0');
    });
  });

  describe('Individual chunk size budgets', () => {
    const chunks = getChunks();

    const budgets = {
      'vendor-react': 200,
      'game-data': 200,
      'game-systems': 100,
      'game-reducers': 100,
      'game-context': 50,
      'audio': 50,
      'art-assets': 100,
      'CombatScreen': 100,
      'index': 50,
    };

    Object.entries(budgets).forEach(([chunkPrefix, maxKB]) => {
      it(`${chunkPrefix} chunk stays under ${maxKB}KB`, () => {
        if (!chunks) return;
        const chunk = chunks.find(c => c.name.startsWith(chunkPrefix) || c.name.includes(chunkPrefix));
        if (!chunk) return; // chunk may not exist in all builds
        expect(
          chunk.sizeKB,
          `${chunk.name} is ${chunk.sizeKB}KB (budget: ${maxKB}KB)`
        ).toBeLessThan(maxKB);
      });
    });
  });
});
