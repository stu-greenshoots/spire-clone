import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  ORB_TYPES,
  createOrb,
  getOrbPassiveValue,
  getOrbEvokeValue,
  applyOrbPassive,
  applyOrbEvoke,
  channelOrb,
  evokeOrbs,
  processOrbPassives
} from '../systems/orbSystem';

// Helper to create a test enemy
const createEnemy = (overrides = {}) => ({
  id: 'test_enemy',
  instanceId: `test_${Date.now()}_${Math.random()}`,
  name: 'Test Enemy',
  currentHp: 50,
  maxHp: 50,
  block: 0,
  strength: 0,
  vulnerable: 0,
  weak: 0,
  intangible: 0,
  ...overrides
});

// Helper to create test player
const createPlayer = (overrides = {}) => ({
  currentHp: 80,
  maxHp: 80,
  block: 0,
  energy: 3,
  focus: 0,
  orbs: [],
  orbSlots: 3,
  ...overrides
});

describe('Orb System', () => {
  describe('createOrb', () => {
    it('creates a lightning orb with unique id', () => {
      const orb = createOrb(ORB_TYPES.LIGHTNING);
      expect(orb.type).toBe('lightning');
      expect(orb.id).toContain('lightning');
      expect(orb.darkDamage).toBe(0);
    });

    it('creates a dark orb with initial darkDamage of 6', () => {
      const orb = createOrb(ORB_TYPES.DARK);
      expect(orb.type).toBe('dark');
      expect(orb.darkDamage).toBe(6);
    });
  });

  describe('getOrbPassiveValue', () => {
    it('lightning passive is 3 + focus', () => {
      const orb = createOrb(ORB_TYPES.LIGHTNING);
      expect(getOrbPassiveValue(orb, 0)).toBe(3);
      expect(getOrbPassiveValue(orb, 2)).toBe(5);
    });

    it('frost passive is 2 + focus', () => {
      const orb = createOrb(ORB_TYPES.FROST);
      expect(getOrbPassiveValue(orb, 0)).toBe(2);
      expect(getOrbPassiveValue(orb, 3)).toBe(5);
    });

    it('dark passive is 6 + focus', () => {
      const orb = createOrb(ORB_TYPES.DARK);
      expect(getOrbPassiveValue(orb, 0)).toBe(6);
      expect(getOrbPassiveValue(orb, 1)).toBe(7);
    });

    it('plasma passive is always 1 regardless of focus', () => {
      const orb = createOrb(ORB_TYPES.PLASMA);
      expect(getOrbPassiveValue(orb, 0)).toBe(1);
      expect(getOrbPassiveValue(orb, 10)).toBe(1);
    });

    it('negative focus floors at 0', () => {
      const orb = createOrb(ORB_TYPES.LIGHTNING);
      expect(getOrbPassiveValue(orb, -5)).toBe(0);
    });
  });

  describe('getOrbEvokeValue', () => {
    it('lightning evoke is 8 + focus', () => {
      const orb = createOrb(ORB_TYPES.LIGHTNING);
      expect(getOrbEvokeValue(orb, 0)).toBe(8);
      expect(getOrbEvokeValue(orb, 2)).toBe(10);
    });

    it('frost evoke is 5 + focus', () => {
      const orb = createOrb(ORB_TYPES.FROST);
      expect(getOrbEvokeValue(orb, 0)).toBe(5);
    });

    it('dark evoke is darkDamage + focus', () => {
      const orb = createOrb(ORB_TYPES.DARK);
      expect(getOrbEvokeValue(orb, 0)).toBe(6); // initial darkDamage
      orb.darkDamage = 20;
      expect(getOrbEvokeValue(orb, 3)).toBe(23);
    });

    it('plasma evoke is always 2 regardless of focus', () => {
      const orb = createOrb(ORB_TYPES.PLASMA);
      expect(getOrbEvokeValue(orb, 0)).toBe(2);
      expect(getOrbEvokeValue(orb, 10)).toBe(2);
    });
  });

  describe('channelOrb', () => {
    it('adds orb to empty slots', () => {
      const player = createPlayer();
      const enemies = [createEnemy()];
      const log = [];
      channelOrb(player, 'lightning', enemies, log);
      expect(player.orbs).toHaveLength(1);
      expect(player.orbs[0].type).toBe('lightning');
    });

    it('evokes leftmost orb when slots full', () => {
      const player = createPlayer({
        orbs: [createOrb('frost'), createOrb('frost'), createOrb('frost')],
        orbSlots: 3
      });
      const enemies = [createEnemy()];
      const log = [];
      channelOrb(player, 'lightning', enemies, log);
      // Should still have 3 orbs, first is frost, last is lightning
      expect(player.orbs).toHaveLength(3);
      expect(player.orbs[2].type).toBe('lightning');
      expect(player.orbs[0].type).toBe('frost');
      // Frost evoke grants block
      expect(player.block).toBe(5);
    });

    it('lightning evoke on overflow deals damage to random enemy', () => {
      const enemy = createEnemy({ currentHp: 50 });
      const player = createPlayer({
        orbs: [createOrb('lightning'), createOrb('frost'), createOrb('frost')],
        orbSlots: 3
      });
      const log = [];
      const result = channelOrb(player, 'frost', [enemy], log);
      // Lightning evoke deals 8 damage
      const updatedEnemy = result.enemies[0];
      expect(updatedEnemy.currentHp).toBe(42); // 50 - 8
    });
  });

  describe('evokeOrbs', () => {
    it('evokes leftmost orb', () => {
      const player = createPlayer({
        orbs: [createOrb('frost'), createOrb('lightning')]
      });
      const enemies = [createEnemy()];
      const log = [];
      evokeOrbs(player, enemies, log, { count: 1 });
      expect(player.orbs).toHaveLength(1);
      expect(player.orbs[0].type).toBe('lightning');
      expect(player.block).toBe(5); // Frost evoke
    });

    it('evokes all orbs', () => {
      const player = createPlayer({
        orbs: [createOrb('frost'), createOrb('frost')]
      });
      const enemies = [createEnemy()];
      const log = [];
      evokeOrbs(player, enemies, log, { all: true });
      expect(player.orbs).toHaveLength(0);
      expect(player.block).toBe(10); // 5 + 5
    });

    it('does nothing with no orbs', () => {
      const player = createPlayer();
      const enemies = [createEnemy()];
      const log = [];
      const result = evokeOrbs(player, enemies, log);
      expect(result.enemies).toEqual(enemies);
    });
  });

  describe('processOrbPassives', () => {
    it('processes lightning passive - deals damage to random enemy', () => {
      const enemy = createEnemy({ currentHp: 50 });
      const player = createPlayer({
        orbs: [createOrb('lightning')]
      });
      const log = [];
      const result = processOrbPassives(player, [enemy], log);
      expect(result.enemies[0].currentHp).toBe(47); // 50 - 3
    });

    it('processes frost passive - grants block', () => {
      const player = createPlayer({
        orbs: [createOrb('frost')]
      });
      const log = [];
      processOrbPassives(player, [createEnemy()], log);
      expect(player.block).toBe(2);
    });

    it('processes dark passive - accumulates darkDamage', () => {
      const player = createPlayer({
        orbs: [createOrb('dark')]
      });
      const log = [];
      processOrbPassives(player, [createEnemy()], log);
      expect(player.orbs[0].darkDamage).toBe(12); // 6 initial + 6 passive
    });

    it('processes plasma passive - grants energy', () => {
      const player = createPlayer({
        orbs: [createOrb('plasma')]
      });
      const log = [];
      processOrbPassives(player, [createEnemy()], log);
      expect(player.energy).toBe(4); // 3 + 1
    });

    it('focus scales lightning and frost passives', () => {
      const enemy = createEnemy({ currentHp: 50 });
      const player = createPlayer({
        orbs: [createOrb('lightning'), createOrb('frost')],
        focus: 3
      });
      const log = [];
      const result = processOrbPassives(player, [enemy], log);
      // Lightning: 3 + 3 = 6 damage
      expect(result.enemies[0].currentHp).toBe(44);
      // Frost: 2 + 3 = 5 block
      expect(player.block).toBe(5);
    });

    it('multiple orbs all trigger', () => {
      const player = createPlayer({
        orbs: [createOrb('frost'), createOrb('frost'), createOrb('frost')]
      });
      const log = [];
      processOrbPassives(player, [createEnemy()], log);
      expect(player.block).toBe(6); // 2 * 3
    });
  });

  describe('Focus scaling', () => {
    it('focus affects lightning evoke', () => {
      const orb = createOrb(ORB_TYPES.LIGHTNING);
      expect(getOrbEvokeValue(orb, 4)).toBe(12); // 8 + 4
    });

    it('focus does NOT affect plasma evoke', () => {
      const orb = createOrb(ORB_TYPES.PLASMA);
      expect(getOrbEvokeValue(orb, 10)).toBe(2);
    });
  });

  describe('Dark orb evoke targets lowest HP enemy', () => {
    it('targets the lowest HP enemy', () => {
      const enemy1 = createEnemy({ currentHp: 30, instanceId: 'e1', name: 'Big' });
      const enemy2 = createEnemy({ currentHp: 10, instanceId: 'e2', name: 'Small' });
      const player = createPlayer();
      const orb = createOrb(ORB_TYPES.DARK);
      orb.darkDamage = 20;
      const log = [];
      const result = applyOrbEvoke(orb, player, [enemy1, enemy2], 0, log);
      // Should target enemy2 (lowest HP)
      const small = result.enemies.find(e => e.instanceId === 'e2');
      expect(small.currentHp).toBeLessThan(10);
    });
  });
});
