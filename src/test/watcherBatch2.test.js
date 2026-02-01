/**
 * JR-14b: Watcher Card Pool Batch 2 — 15 Uncommon/Rare Cards
 *
 * Tests for Watcher uncommon and rare cards:
 * - Card structure validation (all 15 cards exist with correct properties)
 * - Special effects (wallop, brilliance, blasphemy, etc.)
 * - Stance interactions (Fear No Evil, Tantrum, Ragnarok)
 * - Generated cards (Through Violence, Safety)
 * - Power cards (Mental Fortress, Deva Form)
 */

import { describe, it, expect, vi } from 'vitest';
import { ALL_CARDS, getCardById, CARD_TYPES, RARITY } from '../data/cards';
import { CARD_FLAVOR } from '../data/flavorText';
import { handleSpecialEffect, SUPPORTED_EFFECTS } from '../systems/cardEffects';

vi.mock('../systems/saveSystem', () => ({
  saveGame: vi.fn(),
  loadGame: vi.fn(() => null),
  deleteSave: vi.fn(),
  hasSave: vi.fn(() => false),
  autoSave: vi.fn()
}));

vi.mock('../systems/audioSystem', () => ({
  audioManager: { playSFX: vi.fn(), playMusic: vi.fn(), stopMusic: vi.fn() },
  SOUNDS: { combat: {}, ui: {} }
}));

// ============================================================
// 1. Card Structure Validation
// ============================================================

const BATCH_2_IDS = [
  'wallop', 'tantrum', 'reachHeaven', 'throughViolence', 'worship',
  'thirdEye', 'deceiveReality', 'safety', 'fearNoEvil', 'mentalFortress',
  'ragnarok', 'brilliance', 'blasphemy', 'devaForm', 'wish'
];

describe('Watcher Batch 2 Card Structure', () => {
  BATCH_2_IDS.forEach(id => {
    it(`${id} exists in ALL_CARDS`, () => {
      const card = ALL_CARDS.find(c => c.id === id);
      expect(card).toBeDefined();
      expect(card.character).toBe('watcher');
    });
  });

  it('has 8 uncommon and 5 rare cards (+ 2 generated uncommon)', () => {
    const batch2 = ALL_CARDS.filter(c => BATCH_2_IDS.includes(c.id));
    const uncommon = batch2.filter(c => c.rarity === RARITY.UNCOMMON);
    const rare = batch2.filter(c => c.rarity === RARITY.RARE);
    expect(uncommon.length).toBe(10); // includes throughViolence and safety
    expect(rare.length).toBe(5);
  });

  it('all batch 2 cards have upgradedVersion', () => {
    BATCH_2_IDS.forEach(id => {
      const card = ALL_CARDS.find(c => c.id === id);
      expect(card.upgradedVersion).toBeDefined();
    });
  });

  it('all batch 2 cards have flavor text', () => {
    BATCH_2_IDS.forEach(id => {
      expect(CARD_FLAVOR[id]).toBeDefined();
      expect(CARD_FLAVOR[id].length).toBeGreaterThan(0);
    });
  });
});

// ============================================================
// 2. Specific Card Properties
// ============================================================

describe('Watcher Batch 2 Card Properties', () => {
  it('Wallop is 2-cost attack with wallopBlock special', () => {
    const card = getCardById('wallop');
    expect(card.type).toBe(CARD_TYPES.ATTACK);
    expect(card.cost).toBe(2);
    expect(card.damage).toBe(9);
    expect(card.special).toBe('wallopBlock');
    expect(card.upgradedVersion.damage).toBe(12);
  });

  it('Tantrum is multi-hit attack that enters Wrath', () => {
    const card = getCardById('tantrum');
    expect(card.type).toBe(CARD_TYPES.ATTACK);
    expect(card.damage).toBe(3);
    expect(card.hits).toBe(3);
    expect(card.enterStance).toBe('wrath');
    expect(card.upgradedVersion.hits).toBe(4);
  });

  it('Reach Heaven shuffles Through Violence into draw pile', () => {
    const card = getCardById('reachHeaven');
    expect(card.type).toBe(CARD_TYPES.ATTACK);
    expect(card.special).toBe('addThroughViolence');
    expect(card.damage).toBe(10);
  });

  it('Through Violence is 0-cost retain attack', () => {
    const card = getCardById('throughViolence');
    expect(card.type).toBe(CARD_TYPES.ATTACK);
    expect(card.cost).toBe(0);
    expect(card.damage).toBe(20);
    expect(card.retain).toBe(true);
    expect(card.upgradedVersion.damage).toBe(30);
  });

  it('Worship gains 5 Mantra', () => {
    const card = getCardById('worship');
    expect(card.type).toBe(CARD_TYPES.SKILL);
    expect(card.mantra).toBe(5);
    expect(card.upgradedVersion.mantra).toBe(7);
  });

  it('Third Eye gives block and scries', () => {
    const card = getCardById('thirdEye');
    expect(card.block).toBe(7);
    expect(card.special).toBe('scryCards');
    expect(card.scryCount).toBe(3);
    expect(card.upgradedVersion.scryCount).toBe(5);
  });

  it('Deceive Reality enters Calm and adds Safety', () => {
    const card = getCardById('deceiveReality');
    expect(card.enterStance).toBe('calm');
    expect(card.special).toBe('addSafety');
    expect(card.block).toBe(4);
  });

  it('Safety is retain block card', () => {
    const card = getCardById('safety');
    expect(card.retain).toBe(true);
    expect(card.block).toBe(12);
    expect(card.upgradedVersion.block).toBe(16);
  });

  it('Fear No Evil enters Calm conditionally', () => {
    const card = getCardById('fearNoEvil');
    expect(card.type).toBe(CARD_TYPES.ATTACK);
    expect(card.damage).toBe(8);
    expect(card.special).toBe('fearNoEvilCalm');
  });

  it('Mental Fortress is a Power that grants block on stance change', () => {
    const card = getCardById('mentalFortress');
    expect(card.type).toBe(CARD_TYPES.POWER);
    expect(card.mentalFortressBlock).toBe(4);
    expect(card.upgradedVersion.mentalFortressBlock).toBe(6);
  });

  it('Ragnarok is multi-hit AoE rare attack', () => {
    const card = getCardById('ragnarok');
    expect(card.type).toBe(CARD_TYPES.ATTACK);
    expect(card.rarity).toBe(RARITY.RARE);
    expect(card.damage).toBe(5);
    expect(card.hits).toBe(5);
    expect(card.targetAll).toBe(true);
    expect(card.enterStance).toBe('wrath');
  });

  it('Brilliance deals bonus damage from Mantra', () => {
    const card = getCardById('brilliance');
    expect(card.rarity).toBe(RARITY.RARE);
    expect(card.special).toBe('brillianceDamage');
    expect(card.damage).toBe(12);
  });

  it('Blasphemy enters Divinity and exhausts', () => {
    const card = getCardById('blasphemy');
    expect(card.rarity).toBe(RARITY.RARE);
    expect(card.enterStance).toBe('divinity');
    expect(card.exhaust).toBe(true);
    expect(card.special).toBe('blasphemy');
    expect(card.upgradedVersion.cost).toBe(0);
  });

  it('Deva Form is rare Power with increasing energy', () => {
    const card = getCardById('devaForm');
    expect(card.type).toBe(CARD_TYPES.POWER);
    expect(card.rarity).toBe(RARITY.RARE);
    expect(card.cost).toBe(3);
    expect(card.special).toBe('devaForm');
    expect(card.upgradedVersion.cost).toBe(1);
  });

  it('Wish gives Strength and exhausts', () => {
    const card = getCardById('wish');
    expect(card.rarity).toBe(RARITY.RARE);
    expect(card.exhaust).toBe(true);
    expect(card.effects[0].type).toBe('strength');
    expect(card.effects[0].amount).toBe(3);
    expect(card.effects[0].self).toBe(true);
  });
});

// ============================================================
// 3. Special Effect Tests
// ============================================================

describe('Watcher Batch 2 Special Effects', () => {
  const makeCtx = (overrides = {}) => ({
    player: { currentHp: 50, maxHp: 72, block: 0, energy: 3, strength: 0, currentStance: null, mantra: 0, totalMantraGained: 0, ...overrides.player },
    enemies: overrides.enemies || [{ instanceId: 'e1', name: 'Test', currentHp: 50, maxHp: 50, block: 0, intent: { type: 'attack' } }],
    hand: overrides.hand || [],
    drawPile: overrides.drawPile || [],
    discardPile: overrides.discardPile || [],
    exhaustPile: overrides.exhaustPile || [],
    combatLog: [],
    targetId: 'e1',
    get targetIndex() { return this.enemies.findIndex(e => e.instanceId === 'e1'); },
    relics: [],
    deck: [],
    state: {},
    GAME_PHASE: { CARD_SELECT_DRAW: 'CARD_SELECT_DRAW' }
  });

  it('wallopBlock: gains block equal to unblocked damage', () => {
    const ctx = makeCtx({ enemies: [{ instanceId: 'e1', name: 'Test', currentHp: 50, maxHp: 50, block: 3, intent: {} }] });
    handleSpecialEffect('wallopBlock', { damage: 9 }, ctx);
    expect(ctx.player.block).toBe(6); // 9 - 3 block = 6 unblocked
  });

  it('wallopBlock: no block gained when enemy has full block', () => {
    const ctx = makeCtx({ enemies: [{ instanceId: 'e1', name: 'Test', currentHp: 50, maxHp: 50, block: 20, intent: {} }] });
    handleSpecialEffect('wallopBlock', { damage: 9 }, ctx);
    expect(ctx.player.block).toBe(0);
  });

  it('fearNoEvilCalm: enters Calm when enemy attacks', () => {
    const ctx = makeCtx({ enemies: [{ instanceId: 'e1', name: 'Test', currentHp: 50, maxHp: 50, block: 0, intent: { type: 'attack' } }] });
    handleSpecialEffect('fearNoEvilCalm', { damage: 8 }, ctx);
    expect(ctx.player.currentStance).toBe('calm');
  });

  it('fearNoEvilCalm: does not enter Calm when enemy buffs', () => {
    const ctx = makeCtx({ enemies: [{ instanceId: 'e1', name: 'Test', currentHp: 50, maxHp: 50, block: 0, intent: { type: 'buff' } }] });
    handleSpecialEffect('fearNoEvilCalm', { damage: 8 }, ctx);
    expect(ctx.player.currentStance).toBeNull();
  });

  it('brillianceDamage: deals bonus damage from totalMantraGained', () => {
    const ctx = makeCtx({ player: { totalMantraGained: 10 } });
    handleSpecialEffect('brillianceDamage', { damage: 12 }, ctx);
    expect(ctx.enemies[0].currentHp).toBe(40); // 50 - 10
  });

  it('brillianceDamage: no bonus if no mantra gained', () => {
    const ctx = makeCtx({ player: { totalMantraGained: 0 } });
    handleSpecialEffect('brillianceDamage', { damage: 12 }, ctx);
    expect(ctx.enemies[0].currentHp).toBe(50); // unchanged
  });

  it('blasphemy: sets blasphemyDeath flag', () => {
    const ctx = makeCtx();
    handleSpecialEffect('blasphemy', {}, ctx);
    expect(ctx.player.blasphemyDeath).toBe(true);
  });

  it('mentalFortress: sets mentalFortress value on player', () => {
    const ctx = makeCtx();
    handleSpecialEffect('mentalFortress', { mentalFortressBlock: 4 }, ctx);
    expect(ctx.player.mentalFortress).toBe(4);
  });

  it('mentalFortress: stacks with existing value', () => {
    const ctx = makeCtx({ player: { mentalFortress: 4 } });
    handleSpecialEffect('mentalFortress', { mentalFortressBlock: 6 }, ctx);
    expect(ctx.player.mentalFortress).toBe(10);
  });

  it('devaForm: sets devaForm flag and initial energy', () => {
    const ctx = makeCtx();
    handleSpecialEffect('devaForm', {}, ctx);
    expect(ctx.player.devaForm).toBe(true);
    expect(ctx.player.devaFormEnergy).toBe(1);
  });

  it('addThroughViolence: shuffles Through Violence into draw pile', () => {
    const ctx = makeCtx({ drawPile: [{ id: 'strike', instanceId: 's1' }] });
    handleSpecialEffect('addThroughViolence', { upgraded: false }, ctx);
    expect(ctx.drawPile.length).toBe(2);
    const tv = ctx.drawPile.find(c => c.id === 'throughViolence');
    expect(tv).toBeDefined();
    expect(tv.damage).toBe(20);
  });

  it('addSafety: adds Safety card to hand', () => {
    const ctx = makeCtx();
    handleSpecialEffect('addSafety', { upgraded: false }, ctx);
    expect(ctx.hand.length).toBe(1);
    expect(ctx.hand[0].id).toBe('safety');
    expect(ctx.hand[0].block).toBe(12);
  });

  it('all batch 2 specials are in SUPPORTED_EFFECTS', () => {
    const specials = ['wallopBlock', 'addThroughViolence', 'addSafety', 'fearNoEvilCalm',
      'mentalFortress', 'brillianceDamage', 'blasphemy', 'devaForm'];
    specials.forEach(s => {
      expect(SUPPORTED_EFFECTS).toContain(s);
    });
  });
});

// ============================================================
// 4. Total Watcher Card Count
// ============================================================

describe('Watcher Card Pool Totals', () => {
  it('Watcher has 31 cards total (16 batch 1 + 15 batch 2)', () => {
    const watcherCards = ALL_CARDS.filter(c => c.character === 'watcher');
    expect(watcherCards.length).toBe(31);
  });

  it('Watcher has cards across all rarities', () => {
    const watcherCards = ALL_CARDS.filter(c => c.character === 'watcher');
    const basic = watcherCards.filter(c => c.rarity === RARITY.BASIC);
    const common = watcherCards.filter(c => c.rarity === RARITY.COMMON);
    const uncommon = watcherCards.filter(c => c.rarity === RARITY.UNCOMMON);
    const rare = watcherCards.filter(c => c.rarity === RARITY.RARE);
    expect(basic.length).toBe(5); // 4 starters + miracle
    expect(common.length).toBe(11); // from batch 1
    expect(uncommon.length).toBe(10); // batch 2
    expect(rare.length).toBe(5); // batch 2
  });
});
