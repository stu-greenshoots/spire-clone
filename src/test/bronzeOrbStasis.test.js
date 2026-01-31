import { describe, it, expect } from 'vitest';
import { getEnemyById, createEnemyInstance, getBossEncounter } from '../data/enemies';
import { createSummonedEnemy, getEnemyIntent } from '../systems/enemySystem';

describe('JR-06: Bronze Orbs + Stasis', () => {
  describe('Bronze Orb spawning via createSummonedEnemy', () => {
    it('should create a Bronze Orb with correct stats', () => {
      const orb = createSummonedEnemy('bronzeOrb', Date.now(), 0);
      expect(orb).not.toBeNull();
      expect(orb.id).toBe('bronzeOrb');
      expect(orb.name).toBe('Bronze Orb');
      expect(orb.maxHp).toBe(52);
      expect(orb.currentHp).toBe(52);
      expect(orb.block).toBe(0);
      expect(orb.stasis).toBeNull();
    });

    it('should have unique instanceIds for multiple orbs', () => {
      const ts = Date.now();
      const orb0 = createSummonedEnemy('bronzeOrb', ts, 0);
      const orb1 = createSummonedEnemy('bronzeOrb', ts, 1);
      expect(orb0.instanceId).not.toBe(orb1.instanceId);
    });

    it('should have beam and supportBeam moves', () => {
      const orb = createSummonedEnemy('bronzeOrb', Date.now(), 0);
      expect(orb.moveset).toHaveLength(2);
      expect(orb.moveset[0].id).toBe('beam');
      expect(orb.moveset[0].damage).toBe(8);
      expect(orb.moveset[1].id).toBe('supportBeam');
      expect(orb.moveset[1].healAmount).toBe(12);
    });

    it('should alternate beam and supportBeam via AI', () => {
      const orb = createSummonedEnemy('bronzeOrb', Date.now(), 0);
      expect(orb.ai(orb, 0).id).toBe('beam');
      expect(orb.ai(orb, 1).id).toBe('supportBeam');
      expect(orb.ai(orb, 2).id).toBe('beam');
      expect(orb.ai(orb, 3).id).toBe('supportBeam');
    });
  });

  describe('Automaton boss encounter spawns orbs', () => {
    it('getBossEncounter for act 2 should include orbs when Automaton is selected', () => {
      // Run multiple times to find an Automaton encounter
      let foundAutomaton = false;
      for (let i = 0; i < 50; i++) {
        const encounter = getBossEncounter(2);
        const boss = encounter.find(e => e.id === 'automaton');
        if (boss) {
          foundAutomaton = true;
          const orbs = encounter.filter(e => e.id === 'bronzeOrb');
          expect(orbs).toHaveLength(2);
          expect(orbs[0].instanceId).not.toBe(orbs[1].instanceId);
          expect(orbs[0].currentHp).toBe(52);
          expect(orbs[0].stasis).toBeNull();
          break;
        }
      }
      expect(foundAutomaton).toBe(true);
    });

    it('non-Automaton bosses should not spawn minions', () => {
      for (let i = 0; i < 50; i++) {
        const encounter = getBossEncounter(1);
        // Act 1 bosses should all be single-enemy encounters (unless they have spawnMinions)
        const boss = encounter[0];
        if (!boss.spawnMinions) {
          expect(encounter).toHaveLength(1);
          break;
        }
      }
    });
  });

  describe('createEnemyInstance initializes stasis', () => {
    it('should set stasis to null on new instances', () => {
      const orbDef = getEnemyById('bronzeOrb');
      const instance = createEnemyInstance(orbDef);
      expect(instance.stasis).toBeNull();
    });

    it('should set stasis to null on Automaton instances', () => {
      const autoDef = getEnemyById('automaton');
      const instance = createEnemyInstance(autoDef);
      expect(instance.stasis).toBeNull();
    });
  });

  describe('Automaton onDeath phase2 config', () => {
    it('Automaton should have phase2Automaton onDeath', () => {
      const auto = getEnemyById('automaton');
      expect(auto.onDeath).toBe('phase2Automaton');
      expect(auto.spawnMinions).toBe('bronzeOrb');
      expect(auto.minionCount).toEqual({ min: 2, max: 2 });
    });
  });

  describe('Bronze Orb intent generation', () => {
    it('should generate valid intents via getEnemyIntent', () => {
      const orb = createSummonedEnemy('bronzeOrb', Date.now(), 0);
      const intent = getEnemyIntent(orb, 0);
      expect(intent).toBeDefined();
      expect(intent.id).toBe('beam');
    });
  });
});
