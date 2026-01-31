/**
 * JR-08b: Act 3 Normal Enemies — Transient, Spire Growth, Maw
 * (Writhing Mass, Orb Walker, Spiker already existed)
 */
import { describe, it, expect } from 'vitest';
import { ALL_ENEMIES, createEnemyInstance } from '../data/enemies';

// ========== TRANSIENT ==========
describe('Transient Enemy Definition', () => {
  const transient = ALL_ENEMIES.find(e => e.id === 'transient');

  it('exists and is an Act 3 normal', () => {
    expect(transient).toBeDefined();
    expect(transient.type).toBe('normal');
    expect(transient.act).toBe(3);
  });

  it('has 999 HP (effectively unkillable)', () => {
    expect(transient.hp.min).toBe(999);
    expect(transient.hp.max).toBe(999);
  });

  it('has fadeTimer of 5', () => {
    expect(transient.fadeTimer).toBe(5);
  });

  it('has 3 moves: attack, heavyAttack, fade', () => {
    expect(transient.moveset).toHaveLength(3);
    expect(transient.moveset[0].id).toBe('attack');
    expect(transient.moveset[1].id).toBe('heavyAttack');
    expect(transient.moveset[2].id).toBe('fade');
  });

  it('attack deals 30 damage, heavyAttack deals 40', () => {
    expect(transient.moveset[0].damage).toBe(30);
    expect(transient.moveset[1].damage).toBe(40);
  });
});

describe('Transient AI Pattern', () => {
  const transient = ALL_ENEMIES.find(e => e.id === 'transient');

  it('uses normal attack on turns 0-1', () => {
    const instance = createEnemyInstance(transient);
    expect(transient.ai(instance, 0, null).id).toBe('attack');
    expect(transient.ai(instance, 1, null).id).toBe('attack');
  });

  it('uses heavy attack on turns 2-3', () => {
    const instance = createEnemyInstance(transient);
    expect(transient.ai(instance, 2, null).id).toBe('heavyAttack');
    expect(transient.ai(instance, 3, null).id).toBe('heavyAttack');
  });

  it('fades on turn 4+', () => {
    const instance = createEnemyInstance(transient);
    expect(transient.ai(instance, 4, null).id).toBe('fade');
    expect(transient.ai(instance, 5, null).id).toBe('fade');
  });
});

// ========== SPIRE GROWTH ==========
describe('Spire Growth Enemy Definition', () => {
  const spireGrowth = ALL_ENEMIES.find(e => e.id === 'spireGrowth');

  it('exists and is an Act 3 normal', () => {
    expect(spireGrowth).toBeDefined();
    expect(spireGrowth.type).toBe('normal');
    expect(spireGrowth.act).toBe(3);
  });

  it('has correct HP range', () => {
    expect(spireGrowth.hp.min).toBe(170);
    expect(spireGrowth.hp.max).toBe(180);
  });

  it('has constrict property', () => {
    expect(spireGrowth.constrict).toBe(6);
  });

  it('has 3 moves: smash, constrict, grow', () => {
    expect(spireGrowth.moveset).toHaveLength(3);
    expect(spireGrowth.moveset[0].id).toBe('smash');
    expect(spireGrowth.moveset[1].id).toBe('constrict');
    expect(spireGrowth.moveset[2].id).toBe('grow');
  });

  it('smash deals 22 damage', () => {
    expect(spireGrowth.moveset[0].damage).toBe(22);
  });

  it('constrict applies constrict 6 to player', () => {
    expect(spireGrowth.moveset[1].effects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'constrict', amount: 6, target: 'player' })
      ])
    );
  });

  it('grow gives strength 3', () => {
    expect(spireGrowth.moveset[2].effects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'strength', amount: 3 })
      ])
    );
  });
});

describe('Spire Growth AI Pattern', () => {
  const spireGrowth = ALL_ENEMIES.find(e => e.id === 'spireGrowth');

  it('opens with constrict on turn 0', () => {
    const instance = createEnemyInstance(spireGrowth);
    expect(spireGrowth.ai(instance, 0, null).id).toBe('constrict');
  });

  it('grows after constrict', () => {
    const instance = createEnemyInstance(spireGrowth);
    expect(spireGrowth.ai(instance, 1, { id: 'constrict' }).id).toBe('grow');
  });

  it('smashes after grow', () => {
    const instance = createEnemyInstance(spireGrowth);
    expect(spireGrowth.ai(instance, 2, { id: 'grow' }).id).toBe('smash');
  });

  it('grows after smash', () => {
    const instance = createEnemyInstance(spireGrowth);
    expect(spireGrowth.ai(instance, 3, { id: 'smash' }).id).toBe('grow');
  });
});

// ========== MAW ==========
describe('Maw Enemy Definition', () => {
  const maw = ALL_ENEMIES.find(e => e.id === 'maw');

  it('exists and is an Act 3 normal', () => {
    expect(maw).toBeDefined();
    expect(maw.type).toBe('normal');
    expect(maw.act).toBe(3);
  });

  it('has 300 HP', () => {
    expect(maw.hp.min).toBe(300);
    expect(maw.hp.max).toBe(300);
  });

  it('has 4 moves: drool, slam, nomNom, roar', () => {
    expect(maw.moveset).toHaveLength(4);
    expect(maw.moveset[0].id).toBe('drool');
    expect(maw.moveset[1].id).toBe('slam');
    expect(maw.moveset[2].id).toBe('nomNom');
    expect(maw.moveset[3].id).toBe('roar');
  });

  it('drool applies weak 2 and frail 2', () => {
    expect(maw.moveset[0].effects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'weak', amount: 2 }),
        expect.objectContaining({ type: 'frail', amount: 2 })
      ])
    );
  });

  it('slam deals 25 damage', () => {
    expect(maw.moveset[1].damage).toBe(25);
  });

  it('nomNom deals 5x3 and heals 10', () => {
    expect(maw.moveset[2].damage).toBe(5);
    expect(maw.moveset[2].times).toBe(3);
    expect(maw.moveset[2].healAmount).toBe(10);
  });

  it('roar gives strength 4', () => {
    expect(maw.moveset[3].effects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'strength', amount: 4 })
      ])
    );
  });
});

describe('Maw AI Pattern', () => {
  const maw = ALL_ENEMIES.find(e => e.id === 'maw');

  it('opens with drool on turn 0', () => {
    const instance = createEnemyInstance(maw);
    expect(maw.ai(instance, 0, null).id).toBe('drool');
  });

  it('slams after drool', () => {
    const instance = createEnemyInstance(maw);
    expect(maw.ai(instance, 1, { id: 'drool' }).id).toBe('slam');
  });

  it('roars after slam', () => {
    const instance = createEnemyInstance(maw);
    expect(maw.ai(instance, 2, { id: 'slam' }).id).toBe('roar');
  });

  it('nom noms after roar', () => {
    const instance = createEnemyInstance(maw);
    expect(maw.ai(instance, 3, { id: 'roar' }).id).toBe('nomNom');
  });

  it('resets to drool after nomNom', () => {
    const instance = createEnemyInstance(maw);
    expect(maw.ai(instance, 4, { id: 'nomNom' }).id).toBe('drool');
  });
});

// ========== ENCOUNTER POOL ==========
describe('Act 3 Normal Encounter Pool', () => {
  it('has at least 6 Act 3 normal enemies', () => {
    const act3Normals = ALL_ENEMIES.filter(e => e.act === 3 && e.type === 'normal');
    expect(act3Normals.length).toBeGreaterThanOrEqual(6);
  });

  it('includes all expected Act 3 normals', () => {
    const act3NormalIds = ALL_ENEMIES.filter(e => e.act === 3 && e.type === 'normal').map(e => e.id);
    expect(act3NormalIds).toContain('writhing_mass');
    expect(act3NormalIds).toContain('orbWalker');
    expect(act3NormalIds).toContain('spiker');
    expect(act3NormalIds).toContain('transient');
    expect(act3NormalIds).toContain('spireGrowth');
    expect(act3NormalIds).toContain('maw');
  });
});
