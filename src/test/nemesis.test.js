/**
 * JR-08a: Nemesis (Act 3 Elite) + Enemy Intangible Tests
 */
import { describe, it, expect } from 'vitest';
import { applyDamageToTarget } from '../systems/combatSystem';
import { processEnemyTurns } from '../context/reducers/combat/enemyTurnAction';
import { ALL_ENEMIES, createEnemyInstance } from '../data/enemies';

describe('Enemy Intangible (applyDamageToTarget)', () => {
  it('reduces all damage to 1 when enemy has intangible', () => {
    const result = applyDamageToTarget({ currentHp: 100, maxHp: 100, block: 0, intangible: 1 }, 50);
    expect(result.currentHp).toBe(99);
  });

  it('does not reduce damage when enemy has no intangible', () => {
    const result = applyDamageToTarget({ currentHp: 100, maxHp: 100, block: 0, intangible: 0 }, 50);
    expect(result.currentHp).toBe(50);
  });

  it('intangible still applies through block', () => {
    const result = applyDamageToTarget({ currentHp: 100, maxHp: 100, block: 5, intangible: 1 }, 50);
    // Damage reduced to 1, block absorbs it, no HP lost
    expect(result.block).toBe(4);
    expect(result.currentHp).toBe(100);
  });

  it('intangible with 0 damage does nothing', () => {
    const result = applyDamageToTarget({ currentHp: 100, maxHp: 100, block: 0, intangible: 1 }, 0);
    expect(result.currentHp).toBe(100);
  });
});

describe('Nemesis Enemy Definition', () => {
  const nemesis = ALL_ENEMIES.find(e => e.id === 'nemesis');

  it('exists and is an Act 3 elite', () => {
    expect(nemesis).toBeDefined();
    expect(nemesis.type).toBe('elite');
    expect(nemesis.act).toBe(3);
  });

  it('has correct HP range', () => {
    expect(nemesis.hp.min).toBe(185);
    expect(nemesis.hp.max).toBe(200);
  });

  it('has 3 moves: scythe, attackBurn, debilitate', () => {
    expect(nemesis.moveset).toHaveLength(3);
    expect(nemesis.moveset[0].id).toBe('scythe');
    expect(nemesis.moveset[1].id).toBe('attackBurn');
    expect(nemesis.moveset[2].id).toBe('debilitate');
  });

  it('scythe deals 45 damage and adds burn', () => {
    expect(nemesis.moveset[0].damage).toBe(45);
    expect(nemesis.moveset[0].special).toBe('addBurn');
  });

  it('attackBurn deals 6 damage x3 and adds burn', () => {
    expect(nemesis.moveset[1].damage).toBe(6);
    expect(nemesis.moveset[1].times).toBe(3);
    expect(nemesis.moveset[1].special).toBe('addBurn');
  });

  it('debilitate applies frail 3 and weak 3', () => {
    const move = nemesis.moveset[2];
    expect(move.effects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'frail', amount: 3 }),
        expect.objectContaining({ type: 'weak', amount: 3 })
      ])
    );
  });

  it('has nemesisIntangible flag', () => {
    expect(nemesis.nemesisIntangible).toBe(true);
  });
});

describe('Nemesis AI Pattern', () => {
  const nemesis = ALL_ENEMIES.find(e => e.id === 'nemesis');
  let instance;

  it('uses debilitate on even turns (0, 2, 4)', () => {
    instance = createEnemyInstance(nemesis);
    expect(nemesis.ai(instance, 0, null, 0).id).toBe('debilitate');
    expect(nemesis.ai(instance, 2, { id: 'scythe' }, 0).id).toBe('debilitate');
    expect(nemesis.ai(instance, 4, { id: 'attackBurn' }, 0).id).toBe('debilitate');
  });

  it('uses scythe on odd turns when last move was not scythe', () => {
    instance = createEnemyInstance(nemesis);
    expect(nemesis.ai(instance, 1, { id: 'debilitate' }, 0).id).toBe('scythe');
    expect(nemesis.ai(instance, 3, { id: 'debilitate' }, 0).id).toBe('scythe');
  });

  it('uses attackBurn on odd turns when last move was scythe', () => {
    instance = createEnemyInstance(nemesis);
    expect(nemesis.ai(instance, 1, { id: 'scythe' }, 0).id).toBe('attackBurn');
  });
});

describe('Nemesis Intangible in Combat', () => {
  it('grants intangible when Nemesis uses debilitate', () => {
    const nemesisDef = ALL_ENEMIES.find(e => e.id === 'nemesis');
    const enemy = {
      ...createEnemyInstance(nemesisDef),
      intentData: nemesisDef.moveset[2], // debilitate
      nemesisIntangible: true
    };
    const ctx = {
      newPlayer: { currentHp: 50, maxHp: 50, block: 0, vulnerable: 0, weak: 0, frail: 0, flight: 0, intangible: 0 },
      newEnemies: [enemy],
      newHand: [],
      newDrawPile: [],
      newDiscardPile: [],
      newRelics: [],
      combatLog: []
    };
    const result = processEnemyTurns(ctx);
    expect(result.newEnemies[0].intangible).toBe(1);
    expect(result.combatLog).toContain('Nemesis becomes Intangible!');
  });

  it('does not grant intangible on attack turns', () => {
    const nemesisDef = ALL_ENEMIES.find(e => e.id === 'nemesis');
    const enemy = {
      ...createEnemyInstance(nemesisDef),
      intentData: nemesisDef.moveset[0], // scythe
      nemesisIntangible: true
    };
    const ctx = {
      newPlayer: { currentHp: 50, maxHp: 50, block: 0, vulnerable: 0, weak: 0, frail: 0, flight: 0, intangible: 0 },
      newEnemies: [enemy],
      newHand: [],
      newDrawPile: [],
      newDiscardPile: [],
      newRelics: [],
      combatLog: []
    };
    const result = processEnemyTurns(ctx);
    expect(result.newEnemies[0].intangible).toBe(0);
  });
});

describe('createEnemyInstance initializes intangible', () => {
  it('all enemies start with intangible 0', () => {
    ALL_ENEMIES.forEach(enemy => {
      const instance = createEnemyInstance(enemy);
      expect(instance.intangible).toBe(0);
    });
  });
});
