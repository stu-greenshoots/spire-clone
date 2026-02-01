import { describe, it, expect } from 'vitest';
import { SeededRNG, stringToSeed, generateSeedString, createRNG } from '../utils/seededRandom';
import { generateMap } from '../utils/mapGenerator';

describe('Custom Seeded Runs', () => {
  describe('stringToSeed', () => {
    it('converts a string to a numeric seed', () => {
      const seed = stringToSeed('SPIRE42');
      expect(typeof seed).toBe('number');
      expect(Number.isInteger(seed)).toBe(true);
    });

    it('produces the same seed for the same string', () => {
      expect(stringToSeed('ABC123')).toBe(stringToSeed('ABC123'));
    });

    it('produces different seeds for different strings', () => {
      expect(stringToSeed('ABC')).not.toBe(stringToSeed('XYZ'));
    });

    it('returns 0 for empty or null input', () => {
      expect(stringToSeed('')).toBe(0);
      expect(stringToSeed(null)).toBe(0);
    });
  });

  describe('generateSeedString', () => {
    it('generates an 8-character alphanumeric string', () => {
      const seed = generateSeedString();
      expect(seed).toHaveLength(8);
      expect(seed).toMatch(/^[A-Z0-9]+$/);
    });

    it('generates different seeds on repeated calls', () => {
      const seeds = new Set();
      for (let i = 0; i < 20; i++) {
        seeds.add(generateSeedString());
      }
      // Should have at least 15 unique seeds out of 20 (probabilistic but safe)
      expect(seeds.size).toBeGreaterThanOrEqual(15);
    });
  });

  describe('seeded map generation', () => {
    it('produces identical maps for the same seed', () => {
      const rng1 = new SeededRNG(stringToSeed('TESTMAP'));
      const rng2 = new SeededRNG(stringToSeed('TESTMAP'));
      const map1 = generateMap(1, rng1);
      const map2 = generateMap(1, rng2);

      // Compare structure: same number of nodes per floor, same types
      expect(map1.length).toBe(map2.length);
      for (let i = 0; i < map1.length; i++) {
        expect(map1[i].length).toBe(map2[i].length);
        for (let j = 0; j < map1[i].length; j++) {
          expect(map1[i][j].type).toBe(map2[i][j].type);
          expect(map1[i][j].connections).toEqual(map2[i][j].connections);
        }
      }
    });

    it('produces different maps for different seeds', () => {
      // Run multiple times to avoid false positives from unlikely identical maps
      let allIdentical = true;
      for (let attempt = 0; attempt < 5; attempt++) {
        const seedA = `SEED_A_${attempt}`;
        const seedB = `SEED_B_${attempt}`;
        const rng1 = new SeededRNG(stringToSeed(seedA));
        const rng2 = new SeededRNG(stringToSeed(seedB));
        const map1 = generateMap(1, rng1);
        const map2 = generateMap(1, rng2);

        // Check if any floor has different node counts or types
        let different = false;
        for (let i = 0; i < map1.length && !different; i++) {
          if (map1[i].length !== map2[i].length) different = true;
          for (let j = 0; j < Math.min(map1[i].length, map2[i].length) && !different; j++) {
            if (map1[i][j].type !== map2[i][j].type) different = true;
          }
        }
        if (different) {
          allIdentical = false;
          break;
        }
      }
      expect(allIdentical).toBe(false);
    });

    it('seeded maps still have valid structure (15 floors, boss at end)', () => {
      const rng = new SeededRNG(stringToSeed('STRUCTURE'));
      const map = generateMap(1, rng);
      expect(map).toHaveLength(15);
      expect(map[14]).toHaveLength(1);
      expect(map[14][0].type).toBe('boss');
      map[0].forEach(node => expect(node.type).toBe('combat'));
      map[7].forEach(node => expect(node.type).toBe('rest'));
    });

    it('unseeded maps still work (null rng)', () => {
      const map = generateMap(1, null);
      expect(map).toHaveLength(15);
      expect(map[14][0].type).toBe('boss');
    });

    it('different acts with same seed produce different maps', () => {
      const baseSeed = stringToSeed('MULTIACT');
      const rng1 = new SeededRNG(baseSeed + 1 * 7919);
      const rng2 = new SeededRNG(baseSeed + 2 * 7919);
      const map1 = generateMap(1, rng1);
      const map2 = generateMap(2, rng2);

      // Maps should differ (different act distributions + different RNG state)
      let hasDifference = false;
      for (let i = 2; i < 7; i++) {
        if (map1[i].length !== map2[i].length) { hasDifference = true; break; }
        for (let j = 0; j < Math.min(map1[i].length, map2[i].length); j++) {
          if (map1[i][j].type !== map2[i][j].type) { hasDifference = true; break; }
        }
        if (hasDifference) break;
      }
      expect(hasDifference).toBe(true);
    });
  });

  describe('SeededRNG determinism', () => {
    it('same seed produces identical sequence', () => {
      const rng1 = createRNG(42);
      const rng2 = createRNG(42);
      const seq1 = Array.from({ length: 20 }, () => rng1.next());
      const seq2 = Array.from({ length: 20 }, () => rng2.next());
      expect(seq1).toEqual(seq2);
    });

    it('pick is deterministic with same seed', () => {
      const items = ['a', 'b', 'c', 'd', 'e'];
      const rng1 = createRNG(99);
      const rng2 = createRNG(99);
      const picks1 = Array.from({ length: 10 }, () => rng1.pick(items));
      const picks2 = Array.from({ length: 10 }, () => rng2.pick(items));
      expect(picks1).toEqual(picks2);
    });

    it('shuffle is deterministic with same seed', () => {
      const rng1 = createRNG(77);
      const rng2 = createRNG(77);
      const arr1 = [1, 2, 3, 4, 5, 6, 7, 8];
      const arr2 = [1, 2, 3, 4, 5, 6, 7, 8];
      rng1.shuffle(arr1);
      rng2.shuffle(arr2);
      expect(arr1).toEqual(arr2);
    });
  });
});
