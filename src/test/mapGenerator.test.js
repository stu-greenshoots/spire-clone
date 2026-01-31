import { describe, it, expect } from 'vitest';
import { generateMap } from '../utils/mapGenerator';

describe('generateMap', () => {
  describe('structure', () => {
    it('generates 15 floors', () => {
      const map = generateMap(1);
      expect(map).toHaveLength(15);
    });

    it('floor 0 has 2-4 combat nodes', () => {
      for (let i = 0; i < 20; i++) {
        const map = generateMap(1);
        expect(map[0].length).toBeGreaterThanOrEqual(2);
        expect(map[0].length).toBeLessThanOrEqual(4);
        map[0].forEach(node => expect(node.type).toBe('combat'));
      }
    });

    it('floor 14 is a single boss node', () => {
      const map = generateMap(1);
      expect(map[14]).toHaveLength(1);
      expect(map[14][0].type).toBe('boss');
    });

    it('floor 7 is all rest sites', () => {
      for (let i = 0; i < 10; i++) {
        const map = generateMap(1);
        map[7].forEach(node => expect(node.type).toBe('rest'));
      }
    });

    it('floor 13 (pre-boss) is all rest sites', () => {
      for (let i = 0; i < 10; i++) {
        const map = generateMap(1);
        map[13].forEach(node => expect(node.type).toBe('rest'));
      }
    });

    it('all non-boss floors have 2-4 nodes', () => {
      for (let i = 0; i < 10; i++) {
        const map = generateMap(1);
        for (let f = 0; f < 14; f++) {
          expect(map[f].length).toBeGreaterThanOrEqual(2);
          expect(map[f].length).toBeLessThanOrEqual(4);
        }
      }
    });

    it('nodes have correct structure', () => {
      const map = generateMap(1);
      const node = map[0][0];
      expect(node).toHaveProperty('id');
      expect(node).toHaveProperty('floor', 0);
      expect(node).toHaveProperty('index', 0);
      expect(node).toHaveProperty('type');
      expect(node).toHaveProperty('visited', false);
      expect(node).toHaveProperty('connections');
      expect(Array.isArray(node.connections)).toBe(true);
    });
  });

  describe('connectivity', () => {
    it('all nodes are reachable from floor 0', () => {
      for (let trial = 0; trial < 20; trial++) {
        const map = generateMap(1);
        const reachable = new Set();
        map[0].forEach(n => reachable.add(n.id));
        for (let f = 0; f < map.length - 1; f++) {
          map[f].forEach(node => {
            if (reachable.has(node.id)) {
              node.connections.forEach(id => reachable.add(id));
            }
          });
        }
        // Every node should be reachable
        map.forEach(floor => floor.forEach(node => {
          expect(reachable.has(node.id)).toBe(true);
        }));
      }
    });

    it('boss node is reachable', () => {
      for (let i = 0; i < 20; i++) {
        const map = generateMap(1);
        const reachable = new Set();
        map[0].forEach(n => reachable.add(n.id));
        for (let f = 0; f < map.length - 1; f++) {
          map[f].forEach(node => {
            if (reachable.has(node.id)) {
              node.connections.forEach(id => reachable.add(id));
            }
          });
        }
        expect(reachable.has(map[14][0].id)).toBe(true);
      }
    });
  });

  describe('act-specific generation', () => {
    it('Act 1, 2, and 3 all produce valid 15-floor maps', () => {
      for (const act of [1, 2, 3]) {
        const map = generateMap(act);
        expect(map).toHaveLength(15);
        expect(map[14][0].type).toBe('boss');
        expect(map[0][0].type).toBe('combat');
      }
    });

    it('Act 3 produces more elites on average than Act 1', () => {
      const runs = 100;
      let act1Elites = 0;
      let act3Elites = 0;

      for (let i = 0; i < runs; i++) {
        const map1 = generateMap(1);
        const map3 = generateMap(3);
        map1.forEach(floor => floor.forEach(node => { if (node.type === 'elite') act1Elites++; }));
        map3.forEach(floor => floor.forEach(node => { if (node.type === 'elite') act3Elites++; }));
      }

      // Act 3 elite rate (22%) should be higher than Act 1 (15%)
      expect(act3Elites).toBeGreaterThan(act1Elites);
    });

    it('Act 3 produces fewer rest sites on regular floors than Act 1', () => {
      const runs = 100;
      let act1Rests = 0;
      let act3Rests = 0;

      for (let i = 0; i < runs; i++) {
        const map1 = generateMap(1);
        const map3 = generateMap(3);
        // Only count regular floors (2-6, 8-12) to exclude guaranteed rest floors
        const regularFloors = [2, 3, 4, 5, 6, 8, 9, 10, 11, 12];
        regularFloors.forEach(f => {
          map1[f].forEach(node => { if (node.type === 'rest') act1Rests++; });
          map3[f].forEach(node => { if (node.type === 'rest') act3Rests++; });
        });
      }

      expect(act3Rests).toBeLessThan(act1Rests);
    });

    it('all valid node types appear across acts', () => {
      const validTypes = new Set(['combat', 'elite', 'rest', 'shop', 'event', 'boss']);
      for (const act of [1, 2, 3]) {
        const types = new Set();
        for (let i = 0; i < 50; i++) {
          const map = generateMap(act);
          map.forEach(floor => floor.forEach(node => types.add(node.type)));
        }
        validTypes.forEach(t => expect(types.has(t)).toBe(true));
      }
    });
  });
});
