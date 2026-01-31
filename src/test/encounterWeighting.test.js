import { describe, it, expect } from 'vitest';
import { getEncounter, getBossEncounter } from '../data/enemies';

describe('Act 2 Encounter Weighting (DEC-017)', () => {
  const SAMPLE_SIZE = 500;

  describe('Act 2 normal encounters', () => {
    it('should only return Act 1 or Act 2 enemies (never Act 3+)', () => {
      for (let i = 0; i < SAMPLE_SIZE; i++) {
        const encounter = getEncounter(2, Math.floor(Math.random() * 15) + 1);
        encounter.forEach(enemy => {
          expect(enemy.act).toBeLessThanOrEqual(2);
        });
      }
    });

    it('should never include elite, boss, or minion enemies in normal encounters', () => {
      for (let i = 0; i < SAMPLE_SIZE; i++) {
        const encounter = getEncounter(2, Math.floor(Math.random() * 15) + 1);
        encounter.forEach(enemy => {
          expect(enemy.type).not.toBe('elite');
          expect(enemy.type).not.toBe('boss');
          expect(enemy.type).not.toBe('minion');
        });
      }
    });

    it('should spawn centurion and mystic together as a pair', () => {
      let pairCount = 0;
      let centurionAlone = 0;
      let mysticAlone = 0;

      for (let i = 0; i < SAMPLE_SIZE; i++) {
        const encounter = getEncounter(2, 8);
        const ids = encounter.map(e => e.id);
        const hasCenturion = ids.includes('centurion');
        const hasMystic = ids.includes('mystic');

        if (hasCenturion && hasMystic) pairCount++;
        if (hasCenturion && !hasMystic) centurionAlone++;
        if (hasMystic && !hasCenturion) mysticAlone++;
      }

      expect(centurionAlone).toBe(0);
      expect(mysticAlone).toBe(0);
      expect(pairCount).toBeGreaterThan(0);
    });

    it('should include multiple different Act 2 enemies across encounters', () => {
      const act2EnemyIds = new Set();
      for (let i = 0; i < SAMPLE_SIZE; i++) {
        const encounter = getEncounter(2, 8);
        encounter.forEach(enemy => {
          if (enemy.act === 2) act2EnemyIds.add(enemy.id);
        });
      }
      expect(act2EnemyIds.size).toBeGreaterThanOrEqual(4);
    });

    it('should return valid enemy instances', () => {
      for (let i = 0; i < 50; i++) {
        const encounter = getEncounter(2, 8);
        expect(encounter.length).toBeGreaterThan(0);
        encounter.forEach(enemy => {
          expect(enemy.instanceId).toBeDefined();
          expect(enemy.currentHp).toBeGreaterThan(0);
          expect(enemy.maxHp).toBeGreaterThan(0);
          expect(enemy.moveset).toBeDefined();
        });
      }
    });
  });

  describe('Act 2 elite encounters', () => {
    it('should only return elite enemies', () => {
      for (let i = 0; i < 100; i++) {
        const encounter = getEncounter(2, 8, 0.1, true);
        encounter.forEach(enemy => {
          expect(enemy.type).toBe('elite');
        });
      }
    });

    it('reptomancer should only appear on elite nodes', () => {
      let reptomancerInNormal = 0;
      for (let i = 0; i < SAMPLE_SIZE; i++) {
        const encounter = getEncounter(2, 8, 0.1, false);
        if (encounter.some(e => e.id === 'reptomancer')) reptomancerInNormal++;
      }
      expect(reptomancerInNormal).toBe(0);
    });
  });

  describe('Act 2 boss encounters', () => {
    it('should return Act 2 boss', () => {
      for (let i = 0; i < 50; i++) {
        const encounter = getBossEncounter(2);
        expect(encounter.length).toBe(1);
        expect(encounter[0].type).toBe('boss');
        expect(encounter[0].act).toBe(2);
      }
    });
  });

  describe('Act 1 encounters unchanged', () => {
    it('should not include Act 2 enemies in Act 1 encounters', () => {
      for (let i = 0; i < SAMPLE_SIZE; i++) {
        const encounter = getEncounter(1, Math.floor(Math.random() * 15) + 1);
        encounter.forEach(enemy => {
          expect(enemy.act).toBe(1);
        });
      }
    });
  });
});
