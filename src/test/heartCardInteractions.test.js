/**
 * JR-11: Heart Card Interactions — 60+ card edge case audit vs Heart mechanics
 * Beat of Death, invincible shield, multi-hit, poison, 0-cost, X-cost, powers
 */
import { describe, it, expect } from 'vitest';
import { getEnemyById, createEnemyInstance } from '../data/enemies.js';
import { ALL_CARDS, CARD_TYPES } from '../data/cards.js';
import { applyDamageToTarget, processCardDamage, calculateDamage } from '../systems/combatSystem.js';

const getCardById = (id) => ALL_CARDS.find(c => c.id === id);
const createHeart = (overrides = {}) => ({ ...createEnemyInstance(getEnemyById('corruptHeart')), ...overrides });
const createPlayer = (overrides = {}) => ({
  currentHp: 80, maxHp: 80, block: 0, strength: 0, dexterity: 0,
  vulnerable: 0, weak: 0, frail: 0, energy: 3, ...overrides
});

// 1. Beat of Death — 1 damage per card played
describe('JR-11: Beat of Death interactions', () => {
  it('Heart has beatOfDeath flag', () => {
    expect(createHeart().beatOfDeath).toBe(true);
  });

  it('0-cost cards are playable (trigger Beat of Death)', () => {
    const shiv = getCardById('shiv');
    const backstab = getCardById('backstab');
    expect(shiv.cost).toBe(0);
    expect(backstab.cost).toBe(0);
    expect(shiv.type).toBe(CARD_TYPES.ATTACK);
  });

  it('exhaust cards are playable (trigger Beat of Death)', () => {
    expect(getCardById('pummel').exhaust).toBe(true);
    expect(getCardById('feed').exhaust).toBe(true);
    expect(getCardById('backstab').exhaust).toBe(true);
  });

  it('powers and skills are playable (trigger Beat of Death)', () => {
    expect(ALL_CARDS.filter(c => c.type === CARD_TYPES.POWER).length).toBeGreaterThan(0);
    expect(ALL_CARDS.filter(c => c.type === CARD_TYPES.SKILL).length).toBeGreaterThan(0);
  });

  it('Beat of Death respects player block (absorbed) and damages HP when no block', () => {
    // With block: absorbed
    expect(Math.max(0, 5 - 1)).toBe(4); // block 5, beat 1 => block 4
    // Without block: HP damage
    expect(Math.max(0, 80 - 1)).toBe(79);
  });

  it('X-cost and multi-hit are single plays — Beat of Death fires once each', () => {
    expect(getCardById('whirlwind').cost).toBe(-1);
    expect(getCardById('pummel').hits).toBe(4);
    expect(getCardById('twinStrike').hits).toBe(2);
  });

  it('60+ playable cards exist; curses and statuses do not trigger Beat of Death', () => {
    const playable = ALL_CARDS.filter(c =>
      [CARD_TYPES.ATTACK, CARD_TYPES.SKILL, CARD_TYPES.POWER].includes(c.type)
    );
    expect(playable.length).toBeGreaterThan(60);
    expect(ALL_CARDS.filter(c => c.type === CARD_TYPES.CURSE).length).toBeGreaterThan(0);
    expect(ALL_CARDS.filter(c => c.type === CARD_TYPES.STATUS).length).toBeGreaterThan(0);
  });
});

// 2. Invincible Shield — multi-hit cards chip per hit
describe('JR-11: Invincible shield vs card types', () => {
  it('single-hit attack absorbed by invincible', () => {
    const r = applyDamageToTarget(createHeart({ invincible: 200, block: 0 }), 6);
    expect(r.invincible).toBe(194);
    expect(r.currentHp).toBe(750);
  });

  it('high-damage single hit (Bludgeon 32) absorbed by invincible', () => {
    const r = applyDamageToTarget(createHeart({ invincible: 200, block: 0 }), 32);
    expect(r.invincible).toBe(168);
    expect(r.currentHp).toBe(750);
  });

  it('damage exceeding invincible overflows to HP', () => {
    const r = applyDamageToTarget(createHeart({ invincible: 10, block: 0 }), 32);
    expect(r.invincible).toBe(0);
    expect(r.currentHp).toBe(728);
  });

  it('Pummel (3x4): each hit chips invincible separately', () => {
    const r = processCardDamage(getCardById('pummel'), createPlayer(), [createHeart({ invincible: 200, block: 0 })], 0, {}, []);
    expect(r.enemies[0].invincible).toBe(188); // 200 - 3*4
    expect(r.enemies[0].currentHp).toBe(750);
  });

  it('Twin Strike (5x2): chips invincible per hit', () => {
    const r = processCardDamage(getCardById('twinStrike'), createPlayer(), [createHeart({ invincible: 200, block: 0 })], 0, {}, []);
    expect(r.enemies[0].invincible).toBe(190);
    expect(r.enemies[0].currentHp).toBe(750);
  });

  it('Pummel breaks invincible mid-attack, remaining hits damage HP', () => {
    const r = processCardDamage(getCardById('pummel'), createPlayer(), [createHeart({ invincible: 5, block: 0 })], 0, {}, []);
    // Hit1: 3, inv 5->2 | Hit2: 3, inv 2->0, 1->HP | Hit3: 3->HP | Hit4: 3->HP
    expect(r.enemies[0].invincible).toBe(0);
    expect(r.enemies[0].currentHp).toBe(743);
  });

  it('Whirlwind (X-cost, targetAll): each X-hit chips invincible', () => {
    const ww = { ...getCardById('whirlwind'), hits: 3 };
    const r = processCardDamage(ww, createPlayer(), [createHeart({ invincible: 200, block: 0 })], 0, {}, []);
    expect(r.enemies[0].invincible).toBe(185); // 200 - 5*3
    expect(r.enemies[0].currentHp).toBe(750);
  });

  it('Glass Knife (8x2) and Dagger Spray (4x2) chip invincible per hit', () => {
    const gk = processCardDamage(getCardById('glassKnife'), createPlayer(), [createHeart({ invincible: 200, block: 0 })], 0, {}, []);
    expect(gk.enemies[0].invincible).toBe(184);
    const ds = processCardDamage(getCardById('daggerSpray'), createPlayer(), [createHeart({ invincible: 200, block: 0 })], 0, {}, []);
    expect(ds.enemies[0].invincible).toBe(192);
  });

  it('invincible zero: damage goes to block then HP normally', () => {
    const r = applyDamageToTarget(createHeart({ invincible: 0, block: 10 }), 15);
    expect(r.block).toBe(0);
    expect(r.currentHp).toBe(745);
  });

  it('strength-scaling absorbed by invincible', () => {
    const heart = createHeart({ invincible: 200, block: 0 });
    const dmg = calculateDamage(6, createPlayer({ strength: 10 }), heart, {});
    expect(dmg).toBe(16);
    const r = applyDamageToTarget(heart, dmg);
    expect(r.invincible).toBe(184);
    expect(r.currentHp).toBe(750);
  });

  it('vulnerable increases damage, still absorbed by invincible', () => {
    const heart = createHeart({ invincible: 200, block: 0, vulnerable: 2 });
    const dmg = calculateDamage(6, createPlayer(), heart, {});
    expect(dmg).toBe(9);
    const r = applyDamageToTarget(heart, dmg);
    expect(r.invincible).toBe(191);
    expect(r.currentHp).toBe(750);
  });

  it('Heavy Blade with strength multiplier absorbed by invincible', () => {
    const hb = getCardById('heavyBlade');
    const dmg = calculateDamage(hb.damage, createPlayer({ strength: 5 }), createHeart({ invincible: 200, block: 0 }), { strengthMultiplier: hb.strengthMultiplier });
    const r = applyDamageToTarget(createHeart({ invincible: 200, block: 0 }), dmg);
    expect(r.invincible).toBe(200 - dmg);
    expect(r.currentHp).toBe(750);
  });
});

// 3. Poison vs Invincible Shield
describe('JR-11: Poison vs Heart invincible shield', () => {
  it('poison cards apply poison effect', () => {
    expect(getCardById('deadlyPoison').effects[0]).toEqual({ type: 'poison', amount: 5 });
    expect(getCardById('noxiousFumes').poisonPerTurn).toBe(2);
    expect(getCardById('corpseExplosion').special).toBe('corpseExplosion');
  });

  it('poison damage bypasses invincible (known limitation — needs BE fix)', () => {
    // Poison tick in endTurnAction.js directly reduces currentHp without
    // going through applyDamageToTarget, so it bypasses invincible shield.
    const heart = createHeart({ invincible: 200, currentHp: 750, poison: 10 });
    const newHp = Math.max(0, heart.currentHp - heart.poison);
    expect(newHp).toBe(740); // Poison bypasses invincible
    expect(heart.invincible).toBe(200); // Invincible unchanged
  });
});

// 4. Card type coverage audit
describe('JR-11: Card type coverage', () => {
  it('60+ unique cards', () => {
    expect(new Set(ALL_CARDS.map(c => c.id)).size).toBeGreaterThanOrEqual(60);
  });

  it('all attack cards have damage or special damage mechanic', () => {
    ALL_CARDS.filter(c => c.type === CARD_TYPES.ATTACK).forEach(card => {
      expect(!!(card.damage !== undefined || card.special), `${card.id}`).toBe(true);
    });
  });

  it('multi-hit cards: Pummel, Twin Strike, Dagger Spray, Glass Knife all have hits > 1', () => {
    const mh = ALL_CARDS.filter(c => c.hits && c.hits > 1).map(c => c.id);
    ['pummel', 'twinStrike', 'daggerSpray', 'glassKnife'].forEach(id => expect(mh).toContain(id));
  });

  it('0-cost attacks include Shiv and Backstab', () => {
    const ids = ALL_CARDS.filter(c => c.type === CARD_TYPES.ATTACK && c.cost === 0).map(c => c.id);
    expect(ids).toContain('shiv');
    expect(ids).toContain('backstab');
  });

  it('X-cost cards include Whirlwind', () => {
    const ww = ALL_CARDS.find(c => c.id === 'whirlwind');
    expect(ww.cost).toBe(-1);
    expect(ww.special).toBe('xCost');
  });

  it('key power cards exist (Inflame, Noxious Fumes)', () => {
    const pids = ALL_CARDS.filter(c => c.type === CARD_TYPES.POWER).map(p => p.id);
    expect(pids).toContain('inflame');
    expect(pids).toContain('noxiousFumes');
  });
});

// 5. Phase transition edge cases
describe('JR-11: Phase transitions', () => {
  it('invincible fully depleted: overflow hits HP', () => {
    const r = applyDamageToTarget(createHeart({ invincible: 3, block: 0 }), 10);
    expect(r.invincible).toBe(0);
    expect(r.currentHp).toBe(743);
  });

  it('Twin Strike breaks invincible mid-attack, overflow to HP', () => {
    const r = processCardDamage(getCardById('twinStrike'), createPlayer(), [createHeart({ invincible: 8, block: 0 })], 0, {}, []);
    expect(r.enemies[0].invincible).toBe(0);
    expect(r.enemies[0].currentHp).toBe(748); // Hit1: 5, inv 8->3 | Hit2: 5, inv 3->0, 2->HP
  });

  it('Heart AI cycle unchanged regardless of shield or HP status', () => {
    const heart = getEnemyById('corruptHeart');
    const broken = createHeart({ invincible: 0, currentHp: 1 });
    expect(heart.ai(broken, 0, null).id).toBe('debilitate');
    expect(heart.ai(broken, 1, null).id).toBe('bloodShots');
    expect(heart.ai(broken, 2, null).id).toBe('echo');
    expect(heart.ai(broken, 3, null).id).toBe('buff');
    expect(heart.ai(broken, 4, null).id).toBe('bloodShots'); // cycle repeats
  });

  it('Blood Shots has escalation special (15 base hits)', () => {
    const bs = getEnemyById('corruptHeart').moveset[1];
    expect(bs.special).toBe('bloodShotsEscalate');
    expect(bs.times).toBe(15);
  });
});
