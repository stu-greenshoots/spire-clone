import { describe, it, expect } from 'vitest';
import {
  ALL_ENEMIES,
  INTENT,
  getEnemyById,
  getRandomEnemy,
  createEnemyInstance,
  getEncounter,
  getBossEncounter
} from '../data/enemies';

describe('Enemies Data', () => {
  describe('ALL_ENEMIES', () => {
    it('should have at least 20 enemies', () => {
      expect(ALL_ENEMIES.length).toBeGreaterThanOrEqual(20);
    });

    it('all enemies should have required properties', () => {
      ALL_ENEMIES.forEach(enemy => {
        expect(enemy).toHaveProperty('id');
        expect(enemy).toHaveProperty('name');
        expect(enemy).toHaveProperty('hp');
        expect(enemy).toHaveProperty('type');
        expect(enemy).toHaveProperty('act');
        expect(enemy).toHaveProperty('moveset');
        expect(enemy).toHaveProperty('ai');
        expect(typeof enemy.id).toBe('string');
        expect(typeof enemy.name).toBe('string');
        expect(Array.isArray(enemy.moveset)).toBe(true);
        expect(typeof enemy.ai).toBe('function');
      });
    });

    it('all enemies should have valid types', () => {
      const validTypes = ['normal', 'elite', 'boss', 'minion'];
      ALL_ENEMIES.forEach(enemy => {
        expect(validTypes).toContain(enemy.type);
      });
    });

    it('all enemies should have valid acts (1-4)', () => {
      ALL_ENEMIES.forEach(enemy => {
        expect(enemy.act).toBeGreaterThanOrEqual(1);
        expect(enemy.act).toBeLessThanOrEqual(4);
      });
    });

    it('all enemies should have HP defined as min/max or number', () => {
      ALL_ENEMIES.forEach(enemy => {
        if (typeof enemy.hp === 'object') {
          expect(enemy.hp).toHaveProperty('min');
          expect(enemy.hp).toHaveProperty('max');
          expect(enemy.hp.max).toBeGreaterThanOrEqual(enemy.hp.min);
        } else {
          expect(typeof enemy.hp).toBe('number');
        }
      });
    });

    it('all enemy IDs should be unique', () => {
      const ids = ALL_ENEMIES.map(e => e.id);
      const uniqueIds = [...new Set(ids)];
      expect(ids.length).toBe(uniqueIds.length);
    });

    it('should have bosses for acts 1, 2, and 3', () => {
      const act1Bosses = ALL_ENEMIES.filter(e => e.act === 1 && e.type === 'boss');
      const act2Bosses = ALL_ENEMIES.filter(e => e.act === 2 && e.type === 'boss');
      const act3Bosses = ALL_ENEMIES.filter(e => e.act === 3 && e.type === 'boss');

      expect(act1Bosses.length).toBeGreaterThanOrEqual(1);
      expect(act2Bosses.length).toBeGreaterThanOrEqual(1);
      expect(act3Bosses.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Enemy Movesets', () => {
    it('all moves should have required properties', () => {
      ALL_ENEMIES.forEach(enemy => {
        enemy.moveset.forEach(move => {
          expect(move).toHaveProperty('id');
          expect(move).toHaveProperty('intent');
          expect(move).toHaveProperty('message');

          const validIntents = Object.values(INTENT);
          expect(validIntents).toContain(move.intent);
        });
      });
    });

    it('attack moves should have damage', () => {
      const attackIntents = [INTENT.ATTACK, INTENT.ATTACK_BUFF, INTENT.ATTACK_DEBUFF, INTENT.ATTACK_DEFEND];
      ALL_ENEMIES.forEach(enemy => {
        enemy.moveset.forEach(move => {
          if (attackIntents.includes(move.intent)) {
            expect(move.damage).toBeDefined();
          }
        });
      });
    });

    it('damage values should be valid numbers or objects', () => {
      ALL_ENEMIES.forEach(enemy => {
        enemy.moveset.forEach(move => {
          if (move.damage !== undefined) {
            if (typeof move.damage === 'object') {
              expect(move.damage).toHaveProperty('min');
              expect(move.damage).toHaveProperty('max');
              expect(move.damage.max).toBeGreaterThanOrEqual(move.damage.min);
            } else {
              expect(typeof move.damage).toBe('number');
              expect(move.damage).toBeGreaterThan(0);
            }
          }
        });
      });
    });
  });

  describe('Enemy AI', () => {
    it('AI function should return a valid move', () => {
      ALL_ENEMIES.forEach(enemy => {
        const mockEnemy = createEnemyInstance(enemy);
        const move = enemy.ai(mockEnemy, 0, null, 0);

        expect(move).toBeDefined();
        expect(move).toHaveProperty('intent');
        expect(enemy.moveset).toContainEqual(expect.objectContaining({ id: move.id }));
      });
    });

    it('AI should handle multiple turns', () => {
      ALL_ENEMIES.forEach(enemy => {
        const mockEnemy = createEnemyInstance(enemy);
        let lastMove = null;

        for (let turn = 0; turn < 5; turn++) {
          const move = enemy.ai(mockEnemy, turn, lastMove, 0);
          expect(move).toBeDefined();
          lastMove = move;
        }
      });
    });
  });

  describe('getEnemyById', () => {
    it('should return the correct enemy', () => {
      const cultist = getEnemyById('cultist');
      expect(cultist).toBeDefined();
      expect(cultist.name).toBe('Cultist');
    });

    it('should return undefined for non-existent enemy', () => {
      const enemy = getEnemyById('nonexistent');
      expect(enemy).toBeUndefined();
    });
  });

  describe('getRandomEnemy', () => {
    it('should return an enemy', () => {
      const enemy = getRandomEnemy(1, 'normal');
      expect(enemy).toBeDefined();
      expect(enemy).toHaveProperty('id');
    });

    it('should filter by act', () => {
      for (let i = 0; i < 10; i++) {
        const enemy = getRandomEnemy(1, 'normal');
        expect(enemy.act).toBe(1);
      }
    });

    it('should filter by type', () => {
      for (let i = 0; i < 10; i++) {
        const enemy = getRandomEnemy(1, 'elite');
        expect(enemy.type).toBe('elite');
      }
    });
  });

  describe('createEnemyInstance', () => {
    it('should create an instance with all required properties', () => {
      const cultist = getEnemyById('cultist');
      const instance = createEnemyInstance(cultist);

      expect(instance).toHaveProperty('instanceId');
      expect(instance).toHaveProperty('currentHp');
      expect(instance).toHaveProperty('maxHp');
      expect(instance).toHaveProperty('block');
      expect(instance).toHaveProperty('strength');
      expect(instance).toHaveProperty('vulnerable');
      expect(instance).toHaveProperty('weak');
    });

    it('should roll HP within the min/max range', () => {
      const cultist = getEnemyById('cultist');
      for (let i = 0; i < 20; i++) {
        const instance = createEnemyInstance(cultist);
        expect(instance.currentHp).toBeGreaterThanOrEqual(cultist.hp.min);
        expect(instance.currentHp).toBeLessThanOrEqual(cultist.hp.max);
        expect(instance.currentHp).toBe(instance.maxHp);
      }
    });

    it('should initialize status effects to 0', () => {
      const enemy = getEnemyById('cultist');
      const instance = createEnemyInstance(enemy);

      expect(instance.block).toBe(0);
      expect(instance.vulnerable).toBe(0);
      expect(instance.weak).toBe(0);
    });

    it('should create unique instanceIds', () => {
      const enemy = getEnemyById('cultist');
      const instance1 = createEnemyInstance(enemy, 0);
      const instance2 = createEnemyInstance(enemy, 1);

      expect(instance1.instanceId).not.toBe(instance2.instanceId);
    });
  });

  describe('getEncounter', () => {
    it('should return an array of enemies', () => {
      const encounter = getEncounter(1, 1);
      expect(Array.isArray(encounter)).toBe(true);
      expect(encounter.length).toBeGreaterThan(0);
    });

    it('should return elite enemies when isElite is true', () => {
      const encounter = getEncounter(1, 1, 0.1, true);
      encounter.forEach(enemy => {
        expect(enemy.type).toBe('elite');
      });
    });

    it('all enemies in encounter should have instanceIds', () => {
      const encounter = getEncounter(1, 1);
      encounter.forEach(enemy => {
        expect(enemy.instanceId).toBeDefined();
      });
    });
  });

  describe('getBossEncounter', () => {
    it('should return a boss enemy', () => {
      const encounter = getBossEncounter(1);
      expect(encounter.length).toBe(1);
      expect(encounter[0].type).toBe('boss');
    });

    it('should return boss for the correct act', () => {
      const act1Boss = getBossEncounter(1);
      const act2Boss = getBossEncounter(2);

      expect(act1Boss[0].act).toBe(1);
      expect(act2Boss[0].act).toBe(2);
    });
  });
});
