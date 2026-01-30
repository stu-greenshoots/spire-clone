/**
 * BE-18: Act 2 Enemy Systems Tests
 * Tests for: Plated Armor, Confused, Artifact, Lifesteal
 */
import { describe, it, expect } from 'vitest';
import { applyDamageToTarget } from '../systems/combatSystem';
import { applyEnemyBuff, applyEnemyDebuff, applyPlayerDebuff, getEffectiveCost, processPlayerTurnStart } from '../systems/effectProcessor';
import { processEnemyTurns } from '../context/reducers/combat/enemyTurnAction';

describe('Plated Armor (Enemy)', () => {
  it('grants block to enemy at end of turn', () => {
    const enemy = { instanceId: 'e1', id: 'test', name: 'TestEnemy', currentHp: 50, maxHp: 50, block: 0, platedArmor: 4, metallicize: 0, strength: 0, weak: 0, intentData: { damage: 0, block: 0 } };
    const ctx = { newPlayer: { currentHp: 50, maxHp: 50, block: 0, vulnerable: 0, flight: 0, intangible: 0 }, newEnemies: [enemy], newHand: [], newDrawPile: [], newDiscardPile: [], newRelics: [], combatLog: [] };
    const result = processEnemyTurns(ctx);
    expect(result.newEnemies[0].block).toBe(4);
    expect(result.combatLog).toContain('TestEnemy gained 4 Block from Plated Armor');
  });
  it('reduces plated armor by 1 on unblocked damage', () => {
    const result = applyDamageToTarget({ currentHp: 20, maxHp: 20, block: 0, platedArmor: 5 }, 8);
    expect(result.currentHp).toBe(12);
    expect(result.platedArmor).toBe(4);
  });
  it('does not reduce when fully blocked', () => {
    const result = applyDamageToTarget({ currentHp: 20, maxHp: 20, block: 10, platedArmor: 5 }, 8);
    expect(result.platedArmor).toBe(5);
  });
  it('cannot go below 0', () => {
    let result = applyDamageToTarget({ currentHp: 20, maxHp: 20, block: 0, platedArmor: 1 }, 5);
    expect(result.platedArmor).toBe(0);
    result = applyDamageToTarget(result, 5);
    expect(result.platedArmor).toBe(0);
  });
  it('applyEnemyBuff supports platedArmor', () => {
    const enemy = { platedArmor: 0 };
    applyEnemyBuff(enemy, 'platedArmor', 3);
    expect(enemy.platedArmor).toBe(3);
  });
});

describe('Confused Debuff', () => {
  it('randomizes cost 0-3 when confused', () => {
    const player = { confused: 1 };
    const card = { cost: 2, id: 'test' };
    const costs = new Set();
    for (let i = 0; i < 100; i++) { const c = getEffectiveCost(card, player); costs.add(c); expect(c).toBeGreaterThanOrEqual(0); expect(c).toBeLessThanOrEqual(3); }
    expect(costs.size).toBeGreaterThan(1);
  });
  it('returns normal cost when not confused', () => { expect(getEffectiveCost({ cost: 2 }, { confused: 0 })).toBe(2); });
  it('does not affect X-cost', () => { expect(getEffectiveCost({ cost: -1, special: 'xCost' }, { confused: 1 })).toBe(-1); });
  it('does not affect unplayable', () => { expect(getEffectiveCost({ cost: 1, unplayable: true }, { confused: 1 })).toBe(1); });
  it('applyPlayerDebuff applies confused', () => { const p = { confused: 0, artifact: 0 }; applyPlayerDebuff(p, 'confused', 2); expect(p.confused).toBe(2); });
  it('blocked by Artifact', () => { const p = { confused: 0, artifact: 1 }; expect(applyPlayerDebuff(p, 'confused', 2)).toBe(false); expect(p.confused).toBe(0); });
  it('decrements at turn start', () => {
    const p = { confused: 2, vulnerable: 0, weak: 0, frail: 0, cardsPlayedThisTurn: 0, attacksPlayedThisTurn: 0, skillsPlayedThisTurn: 0, powersPlayedThisTurn: 0, entangle: false };
    processPlayerTurnStart(p); expect(p.confused).toBe(1);
    processPlayerTurnStart(p); expect(p.confused).toBe(0);
  });
});

describe('Artifact Buff', () => {
  it('blocks player debuff', () => { const p = { artifact: 2, weak: 0 }; const l = []; expect(applyPlayerDebuff(p, 'weak', 1, l)).toBe(false); expect(p.artifact).toBe(1); });
  it('allows debuff when 0', () => { const p = { artifact: 0, weak: 0 }; applyPlayerDebuff(p, 'weak', 2); expect(p.weak).toBe(2); });
  it('blocks enemy debuff', () => { const e = { artifact: 1, vulnerable: 0, name: 'T' }; expect(applyEnemyDebuff(e, 'vulnerable', 2, [])).toBe(false); expect(e.artifact).toBe(0); });
  it('applyEnemyBuff supports artifact', () => { const e = { artifact: 0 }; applyEnemyBuff(e, 'artifact', 3); expect(e.artifact).toBe(3); });
});

describe('Enemy Lifesteal', () => {
  const makeCtx = (enemyHp, playerBlock = 0) => ({
    newPlayer: { currentHp: 50, maxHp: 50, block: playerBlock, vulnerable: 0, flight: 0, intangible: 0 },
    newEnemies: [{ instanceId: 'e1', id: 'test', name: 'Vampire', currentHp: enemyHp, maxHp: 50, block: 0, strength: 0, weak: 0, metallicize: 0, intentData: { damage: 10, lifesteal: true } }],
    newHand: [], newDrawPile: [], newDiscardPile: [], newRelics: [], combatLog: []
  });
  it('heals for unblocked damage', () => {
    const r = processEnemyTurns(makeCtx(30));
    expect(r.newPlayer.currentHp).toBe(40);
    expect(r.newEnemies[0].currentHp).toBe(40);
  });
  it('heals only unblocked portion', () => {
    const r = processEnemyTurns(makeCtx(30, 7));
    expect(r.newPlayer.currentHp).toBe(47);
    expect(r.newEnemies[0].currentHp).toBe(33);
  });
  it('caps at maxHp', () => { expect(processEnemyTurns(makeCtx(48)).newEnemies[0].currentHp).toBe(50); });
  it('no heal when fully blocked', () => { expect(processEnemyTurns(makeCtx(30, 20)).newEnemies[0].currentHp).toBe(30); });
  it('no heal without flag', () => {
    const ctx = makeCtx(30); ctx.newEnemies[0].intentData = { damage: 10 };
    expect(processEnemyTurns(ctx).newEnemies[0].currentHp).toBe(30);
  });
});
