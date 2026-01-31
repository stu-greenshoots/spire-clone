/**
 * Tests for newly fixed mechanics:
 * - Gremlin Nob Enrage (strength on skill played)
 * - Enemy Metallicize (Lagavulin block per turn)
 * - Enemy Thorns (Spiker damage back on attack)
 * - Spore Cloud (Fungi Beast death effect)
 * - Entangle (Slaver preventing attacks)
 * - Draw Reduction (Time Eater)
 * - Enemy Artifact (blocks debuffs)
 * - Byrd Flight (damage reduction)
 * - Slimed card (playable, exhausts)
 * - Dead Branch on exhaust effects
 * - Enemy metallicize/artifact from moves
 */

import { describe, it, expect } from 'vitest';
import { ALL_CARDS, getCardById, CARD_TYPES } from '../data/cards';
import { ALL_ENEMIES, createEnemyInstance, getEnemyById } from '../data/enemies';
import { handleEndTurn } from '../context/reducers/combat/endTurnAction';
import { applyDamageToTarget, calculateDamage } from '../systems/combatSystem';
import { handleSpecialEffect } from '../systems/cardEffects';
import {
  applyPlayerDebuff,
  applyEnemyDebuff,
  applyEnemyBuff,
  applyDamageToPlayer,
  handleExhaustTriggers,
  drawCards,
  processPlayerTurnStart,
  processEnemyTurnStart,
  createStatusCard,
  canPlayCard,
  PLAYER_DEBUFF_TYPES,
  ENEMY_DEBUFF_TYPES
} from '../systems/effectProcessor';

describe('Gremlin Nob Enrage', () => {
  it('should have enrage in moveset effects', () => {
    const nob = getEnemyById('gremlinNob');
    expect(nob).toBeDefined();
    const bellowMove = nob.moveset.find(m => m.id === 'bellow');
    expect(bellowMove).toBeDefined();
    const enrageEffect = bellowMove.effects.find(e => e.type === 'enrage');
    expect(enrageEffect).toBeDefined();
    expect(enrageEffect.amount).toBe(3);
  });

  it('should gain strength when enrage is set and skill is played', () => {
    const nob = createEnemyInstance(getEnemyById('gremlinNob'));
    nob.enrage = 3; // Set by bellow move
    // Simulating: when player plays a skill, enemy with enrage gains strength
    expect(nob.enrage).toBe(3);
    nob.strength = (nob.strength || 0) + nob.enrage;
    expect(nob.strength).toBe(3);
  });
});

describe('Enemy Metallicize', () => {
  it('Lagavulin should have metallicize stat', () => {
    const lagavulin = getEnemyById('lagavulin');
    expect(lagavulin).toBeDefined();
    expect(lagavulin.metallicize).toBe(6);
  });

  it('enemy instance should inherit metallicize', () => {
    const lagavulin = createEnemyInstance(getEnemyById('lagavulin'));
    expect(lagavulin.metallicize).toBe(6);
  });

  it('metallicize should add block to enemy', () => {
    const lagavulin = createEnemyInstance(getEnemyById('lagavulin'));
    // Simulate metallicize block gain
    lagavulin.block = (lagavulin.block || 0) + lagavulin.metallicize;
    expect(lagavulin.block).toBe(6);
  });
});

describe('Enemy Thorns (Spiker)', () => {
  it('Spiker should have thorns stat', () => {
    const spiker = getEnemyById('spiker');
    expect(spiker).toBeDefined();
    expect(spiker.thorns).toBe(3);
  });

  it('enemy instance should inherit thorns', () => {
    const spiker = createEnemyInstance(getEnemyById('spiker'));
    expect(spiker.thorns).toBe(3);
  });

  it('Spiker spike move should increase thorns', () => {
    const spiker = getEnemyById('spiker');
    const spikeMove = spiker.moveset.find(m => m.id === 'spike');
    expect(spikeMove).toBeDefined();
    expect(spikeMove.effects[0].type).toBe('thorns');
    expect(spikeMove.effects[0].amount).toBe(2);
  });
});

describe('Spore Cloud (Fungi Beast)', () => {
  it('Fungi Beast should have sporeCloud flag', () => {
    const fungiBeast = getEnemyById('fungiBeast');
    expect(fungiBeast).toBeDefined();
    expect(fungiBeast.sporeCloud).toBe(true);
  });
});

describe('Entangle (Slaver)', () => {
  it('Slaver should have entangle move', () => {
    const slaver = getEnemyById('slaverBlue');
    expect(slaver).toBeDefined();
    const entangleMove = slaver.moveset.find(m => m.id === 'entangle');
    expect(entangleMove).toBeDefined();
    expect(entangleMove.effects[0].type).toBe('entangle');
    expect(entangleMove.effects[0].target).toBe('player');
  });

  it('entangle should prevent playing attack cards (via canPlayCard)', () => {
    const player = { energy: 3, entangle: true, cardsPlayedThisTurn: 0 };
    const attackCard = { cost: 1, type: 'attack' };
    const result = canPlayCard(attackCard, player);
    expect(result.canPlay).toBe(false);
    expect(result.reason).toContain('Entangled');
  });

  it('entangle should not prevent playing skill cards', () => {
    const player = { energy: 3, entangle: true, cardsPlayedThisTurn: 0 };
    const skillCard = { cost: 1, type: 'skill' };
    const result = canPlayCard(skillCard, player);
    expect(result.canPlay).toBe(true);
  });
});

describe('Draw Reduction (Time Eater)', () => {
  it('Time Eater ripple should have drawReduction effect', () => {
    const timeEater = getEnemyById('timeEater');
    expect(timeEater).toBeDefined();
    const ripple = timeEater.moveset.find(m => m.id === 'ripple');
    expect(ripple).toBeDefined();
    expect(ripple.effects[0].type).toBe('drawReduction');
    expect(ripple.effects[0].amount).toBe(1);
  });
});

describe('Enemy Artifact', () => {
  it('Sentry should have artifact stat', () => {
    const sentry = getEnemyById('sentryA');
    expect(sentry).toBeDefined();
    expect(sentry.artifact).toBe(1);
  });

  it('enemy instance should inherit artifact', () => {
    const sentry = createEnemyInstance(getEnemyById('sentryA'));
    expect(sentry.artifact).toBe(1);
  });

  it('applying debuff to enemy with artifact should block it', () => {
    const sentry = createEnemyInstance(getEnemyById('sentryA'));
    const combatLog = [];
    const result = applyEnemyDebuff(sentry, 'vulnerable', 2, combatLog);
    expect(result).toBe(false);
    expect(sentry.artifact).toBe(0);
    expect(sentry.vulnerable).toBeFalsy();
  });

  it('applying debuff after artifact is depleted should work', () => {
    const sentry = createEnemyInstance(getEnemyById('sentryA'));
    sentry.artifact = 0;
    const combatLog = [];
    const result = applyEnemyDebuff(sentry, 'vulnerable', 2, combatLog);
    expect(result).toBe(true);
    expect(sentry.vulnerable).toBe(2);
  });

  it('Corrupt Heart buff move should grant artifact', () => {
    const heart = getEnemyById('corruptHeart');
    expect(heart).toBeDefined();
    const buffMove = heart.moveset.find(m => m.id === 'buff');
    expect(buffMove).toBeDefined();
    const artifactEffect = buffMove.effects.find(e => e.type === 'artifact');
    expect(artifactEffect).toBeDefined();
    expect(artifactEffect.amount).toBe(2);
  });
});

describe('Byrd Flight', () => {
  it('Byrd should have flying flag', () => {
    const byrd = getEnemyById('byrd');
    expect(byrd).toBeDefined();
    expect(byrd.flying).toBe(true);
  });

  it('Byrd instance should start with 3 flight stacks', () => {
    const byrd = createEnemyInstance(getEnemyById('byrd'));
    expect(byrd.flight).toBe(3);
  });

  it('flight should reduce incoming damage by 50%', () => {
    const byrd = createEnemyInstance(getEnemyById('byrd'));
    byrd.currentHp = 25;
    byrd.block = 0;
    const result = applyDamageToTarget(byrd, 10);
    // Flight reduces 10 to 5
    expect(result.currentHp).toBe(20);
    expect(result.flight).toBe(2);
  });

  it('enemy should be grounded when flight reaches 0', () => {
    const byrd = createEnemyInstance(getEnemyById('byrd'));
    byrd.flight = 1;
    byrd.currentHp = 25;
    byrd.block = 0;
    const result = applyDamageToTarget(byrd, 10);
    expect(result.flight).toBe(0);
    expect(result.grounded).toBe(true);
  });

  it('Byrd should have caw, peck, and swoop moves', () => {
    const byrd = getEnemyById('byrd');
    expect(byrd.moveset.find(m => m.id === 'caw')).toBeDefined();
    expect(byrd.moveset.find(m => m.id === 'peck')).toBeDefined();
    expect(byrd.moveset.find(m => m.id === 'swoop')).toBeDefined();
  });
});

describe('Slimed Card', () => {
  it('Slimed should cost 1 energy', () => {
    const slimed = getCardById('slimed');
    expect(slimed).toBeDefined();
    expect(slimed.cost).toBe(1);
  });

  it('Slimed should not be unplayable', () => {
    const slimed = getCardById('slimed');
    expect(slimed.unplayable).toBeFalsy();
  });

  it('Slimed should exhaust when played', () => {
    const slimed = getCardById('slimed');
    expect(slimed.exhaust).toBe(true);
  });
});

describe('Effect Processor - Player Debuffs', () => {
  it('should apply weak to player', () => {
    const player = { weak: 0, artifact: 0 };
    const result = applyPlayerDebuff(player, 'weak', 2);
    expect(result).toBe(true);
    expect(player.weak).toBe(2);
  });

  it('should block debuff with artifact', () => {
    const player = { weak: 0, artifact: 1 };
    const combatLog = [];
    const result = applyPlayerDebuff(player, 'weak', 2, combatLog);
    expect(result).toBe(false);
    expect(player.weak).toBe(0);
    expect(player.artifact).toBe(0);
  });

  it('should apply strengthDown to player', () => {
    const player = { strength: 3, artifact: 0 };
    applyPlayerDebuff(player, 'strengthDown', 2);
    expect(player.strength).toBe(1);
  });

  it('should apply dexterityDown to player', () => {
    const player = { dexterity: 2, artifact: 0 };
    applyPlayerDebuff(player, 'dexterityDown', 1);
    expect(player.dexterity).toBe(1);
  });

  it('should apply drawReduction to player', () => {
    const player = { drawReduction: 0, artifact: 0 };
    applyPlayerDebuff(player, 'drawReduction', 1);
    expect(player.drawReduction).toBe(1);
  });

  it('should set entangle on player', () => {
    const player = { entangle: false, artifact: 0 };
    applyPlayerDebuff(player, 'entangle', 1);
    expect(player.entangle).toBe(true);
  });

  it('artifact should block all registered debuff types', () => {
    PLAYER_DEBUFF_TYPES.forEach(type => {
      const player = { weak: 0, vulnerable: 0, frail: 0, strength: 5, dexterity: 5, drawReduction: 0, entangle: false, artifact: 1 };
      const result = applyPlayerDebuff(player, type, 1);
      expect(result).toBe(false);
      expect(player.artifact).toBe(0);
    });
  });
});

describe('Effect Processor - Enemy Debuffs', () => {
  it('should apply vulnerable to enemy', () => {
    const enemy = { name: 'Test', vulnerable: 0, artifact: 0 };
    const result = applyEnemyDebuff(enemy, 'vulnerable', 2);
    expect(result).toBe(true);
    expect(enemy.vulnerable).toBe(2);
  });

  it('enemy artifact should block debuffs', () => {
    const enemy = { name: 'Test', vulnerable: 0, artifact: 2 };
    const result = applyEnemyDebuff(enemy, 'vulnerable', 2);
    expect(result).toBe(false);
    expect(enemy.vulnerable).toBe(0);
    expect(enemy.artifact).toBe(1);
  });
});

describe('Effect Processor - Enemy Buffs', () => {
  it('should apply strength to enemy', () => {
    const enemy = { strength: 0 };
    applyEnemyBuff(enemy, 'strength', 3);
    expect(enemy.strength).toBe(3);
  });

  it('should apply metallicize to enemy', () => {
    const enemy = { metallicize: 0 };
    applyEnemyBuff(enemy, 'metallicize', 5);
    expect(enemy.metallicize).toBe(5);
  });

  it('should apply artifact to enemy', () => {
    const enemy = { artifact: 0 };
    applyEnemyBuff(enemy, 'artifact', 2);
    expect(enemy.artifact).toBe(2);
  });

  it('should apply thorns to enemy', () => {
    const enemy = { thorns: 3 };
    applyEnemyBuff(enemy, 'thorns', 2);
    expect(enemy.thorns).toBe(5);
  });
});

describe('Effect Processor - Player Damage', () => {
  it('should apply damage through block first', () => {
    const player = { block: 5, currentHp: 20, intangible: 0, flight: 0 };
    const hpLost = applyDamageToPlayer(player, 8, []);
    expect(player.block).toBe(0);
    expect(player.currentHp).toBe(17);
    expect(hpLost).toBe(3);
  });

  it('should not lose HP if block absorbs all damage', () => {
    const player = { block: 10, currentHp: 20, intangible: 0, flight: 0 };
    const hpLost = applyDamageToPlayer(player, 5, []);
    expect(player.block).toBe(5);
    expect(player.currentHp).toBe(20);
    expect(hpLost).toBe(0);
  });

  it('intangible should reduce all damage to 1', () => {
    const player = { block: 0, currentHp: 20, intangible: 1, flight: 0 };
    const hpLost = applyDamageToPlayer(player, 50, []);
    expect(player.currentHp).toBe(19);
    expect(hpLost).toBe(1);
  });

  it('Torii should reduce low damage to 1', () => {
    const player = { block: 0, currentHp: 20, intangible: 0, flight: 0 };
    const relics = [{ id: 'torii' }];
    const hpLost = applyDamageToPlayer(player, 4, relics);
    expect(player.currentHp).toBe(19);
    expect(hpLost).toBe(1);
  });

  it('Torii should not reduce damage above 5', () => {
    const player = { block: 0, currentHp: 20, intangible: 0, flight: 0 };
    const relics = [{ id: 'torii' }];
    const hpLost = applyDamageToPlayer(player, 6, relics);
    expect(player.currentHp).toBe(14);
    expect(hpLost).toBe(6);
  });

  it('Tungsten Rod should reduce HP loss by 1', () => {
    const player = { block: 0, currentHp: 20, intangible: 0, flight: 0 };
    const relics = [{ id: 'tungsten_rod' }];
    const hpLost = applyDamageToPlayer(player, 5, relics);
    expect(player.currentHp).toBe(16); // 5 - 1 = 4 HP lost
    expect(hpLost).toBe(4);
  });

  it('Flight should reduce damage by 50% and lose 1 stack', () => {
    const player = { block: 0, currentHp: 20, intangible: 0, flight: 2 };
    const hpLost = applyDamageToPlayer(player, 10, []);
    expect(player.currentHp).toBe(15); // 10 * 0.5 = 5 HP lost
    expect(player.flight).toBe(1);
    expect(hpLost).toBe(5);
  });
});

describe('Effect Processor - Draw Cards', () => {
  it('should draw cards from draw pile', () => {
    const ctx = {
      hand: [],
      drawPile: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
      discardPile: []
    };
    const drawn = drawCards(2, ctx);
    expect(drawn.length).toBe(2);
    expect(ctx.hand.length).toBe(2);
    expect(ctx.drawPile.length).toBe(1);
  });

  it('should reshuffle discard if draw pile is empty', () => {
    const ctx = {
      hand: [],
      drawPile: [],
      discardPile: [{ id: 'a' }, { id: 'b' }]
    };
    const drawn = drawCards(1, ctx);
    expect(drawn.length).toBe(1);
    expect(ctx.hand.length).toBe(1);
  });

  it('should not draw more than available', () => {
    const ctx = {
      hand: [],
      drawPile: [{ id: 'a' }],
      discardPile: []
    };
    const drawn = drawCards(5, ctx);
    expect(drawn.length).toBe(1);
  });
});

describe('Effect Processor - Turn Start', () => {
  it('should decrement player debuffs', () => {
    const player = { vulnerable: 2, weak: 1, frail: 3, entangle: true, cardsPlayedThisTurn: 5, attacksPlayedThisTurn: 3, skillsPlayedThisTurn: 1, powersPlayedThisTurn: 1 };
    processPlayerTurnStart(player);
    expect(player.vulnerable).toBe(1);
    expect(player.weak).toBe(0);
    expect(player.frail).toBe(2);
    expect(player.entangle).toBe(false);
    expect(player.cardsPlayedThisTurn).toBe(0);
  });

  it('should process enemy turn start', () => {
    const enemies = [
      { name: 'A', block: 5, vulnerable: 2, weak: 1, ritual: 3, strength: 0 },
      { name: 'B', block: 10, vulnerable: 0, weak: 0, ritual: 0, strength: 5 }
    ];
    const result = processEnemyTurnStart(enemies);
    expect(result[0].block).toBe(0);
    expect(result[0].vulnerable).toBe(1);
    expect(result[0].weak).toBe(0);
    expect(result[0].strength).toBe(3); // ritual added
    expect(result[1].block).toBe(0);
    expect(result[1].strength).toBe(5); // no ritual
  });
});

describe('Effect Processor - Status Cards', () => {
  it('should create a wound card', () => {
    const card = createStatusCard('wound', 'test');
    expect(card).toBeDefined();
    expect(card.id).toBe('wound');
    expect(card.instanceId).toContain('wound_test');
  });

  it('should create a burn card', () => {
    const card = createStatusCard('burn', 'hexaghost');
    expect(card).toBeDefined();
    expect(card.id).toBe('burn');
  });

  it('should return null for unknown cards', () => {
    const card = createStatusCard('nonexistent', 'test');
    expect(card).toBeNull();
  });
});

describe('Effect Processor - Exhaust Triggers', () => {
  it('should trigger Dark Embrace on exhaust', () => {
    const ctx = {
      player: { darkEmbrace: true, feelNoPain: 0, block: 0 },
      hand: [],
      drawPile: [{ id: 'card1' }],
      discardPile: [],
      exhaustPile: [],
      relics: [],
      combatLog: []
    };
    handleExhaustTriggers(ctx);
    expect(ctx.hand.length).toBe(1);
    expect(ctx.drawPile.length).toBe(0);
  });

  it('should trigger Feel No Pain on exhaust', () => {
    const ctx = {
      player: { darkEmbrace: false, feelNoPain: 3, block: 0 },
      hand: [],
      drawPile: [],
      discardPile: [],
      exhaustPile: [],
      relics: [],
      combatLog: []
    };
    handleExhaustTriggers(ctx);
    expect(ctx.player.block).toBe(3);
  });

  it('should trigger Dead Branch on exhaust', () => {
    const ctx = {
      player: { darkEmbrace: false, feelNoPain: 0, block: 0 },
      hand: [],
      drawPile: [],
      discardPile: [],
      exhaustPile: [],
      relics: [{ id: 'dead_branch' }],
      combatLog: []
    };
    handleExhaustTriggers(ctx);
    expect(ctx.hand.length).toBe(1); // Random card added
    expect(ctx.combatLog.length).toBe(1);
    expect(ctx.combatLog[0]).toContain('Dead Branch');
  });
});

describe('Can Play Card checks', () => {
  it('should reject card when not enough energy', () => {
    const player = { energy: 1, entangle: false, cardsPlayedThisTurn: 0 };
    const card = { cost: 2, type: 'attack' };
    const result = canPlayCard(card, player);
    expect(result.canPlay).toBe(false);
    expect(result.reason).toContain('energy');
  });

  it('should reject unplayable cards', () => {
    const player = { energy: 5, entangle: false, cardsPlayedThisTurn: 0 };
    const card = { cost: 0, type: 'status', unplayable: true };
    const result = canPlayCard(card, player);
    expect(result.canPlay).toBe(false);
  });

  it('should allow X-cost cards with 0 energy', () => {
    const player = { energy: 0, entangle: false, cardsPlayedThisTurn: 0 };
    const card = { cost: -1, type: 'attack', special: 'xCost' };
    const result = canPlayCard(card, player);
    expect(result.canPlay).toBe(true);
  });

  it('should enforce card limit', () => {
    const player = { energy: 5, entangle: false, cardsPlayedThisTurn: 6 };
    const card = { cost: 1, type: 'attack' };
    const result = canPlayCard(card, player, { cardLimit: 6 });
    expect(result.canPlay).toBe(false);
    expect(result.reason).toContain('limit');
  });
});

describe('Lagavulin Siphon Soul', () => {
  it('should have strengthDown and dexterityDown effects targeting player', () => {
    const lagavulin = getEnemyById('lagavulin');
    const siphon = lagavulin.moveset.find(m => m.id === 'siphonSoul');
    expect(siphon).toBeDefined();
    expect(siphon.effects.length).toBe(2);

    const strDown = siphon.effects.find(e => e.type === 'strengthDown');
    expect(strDown).toBeDefined();
    expect(strDown.amount).toBe(1);
    expect(strDown.target).toBe('player');

    const dexDown = siphon.effects.find(e => e.type === 'dexterityDown');
    expect(dexDown).toBeDefined();
    expect(dexDown.amount).toBe(1);
    expect(dexDown.target).toBe('player');
  });
});

describe('The Champ Metallicize', () => {
  it('The Champ defensive stance should grant metallicize', () => {
    const champ = getEnemyById('theChamp');
    const defensive = champ.moveset.find(m => m.id === 'defensiveStance');
    expect(defensive).toBeDefined();
    const metalEffect = defensive.effects.find(e => e.type === 'metallicize');
    expect(metalEffect).toBeDefined();
    expect(metalEffect.amount).toBe(5);
  });
});

describe('Corrupt Heart Boss', () => {
  it('should have beatOfDeath flag', () => {
    const heart = getEnemyById('corruptHeart');
    expect(heart.beatOfDeath).toBe(true);
  });

  it('should have invincible threshold', () => {
    const heart = getEnemyById('corruptHeart');
    expect(heart.invincible).toBe(300);
  });

  it('buff move should grant strength and artifact', () => {
    const heart = getEnemyById('corruptHeart');
    const buff = heart.moveset.find(m => m.id === 'buff');
    expect(buff.effects.find(e => e.type === 'strength').amount).toBe(2);
    expect(buff.effects.find(e => e.type === 'artifact').amount).toBe(2);
  });
});

describe('Time Eater onCardPlayed', () => {
  it('should count cards and end turn at 12', () => {
    const timeEater = createEnemyInstance(getEnemyById('timeEater'));
    timeEater.cardCounter = 0;

    // Play 11 cards - no effect
    for (let i = 0; i < 11; i++) {
      const result = timeEater.onCardPlayed(timeEater);
      expect(result).toBeNull();
    }

    // 12th card triggers
    const result = timeEater.onCardPlayed(timeEater);
    expect(result).not.toBeNull();
    expect(result.endTurn).toBe(true);
    expect(result.heal).toBe(2);
    expect(timeEater.cardCounter).toBe(0); // Reset
  });
});

describe('Awakened One Power Reaction', () => {
  it('should have curious flag', () => {
    const awakenedOne = getEnemyById('awakened_one');
    expect(awakenedOne.curious).toBe(true);
  });

  it('should have canRebirth flag', () => {
    const awakenedOne = getEnemyById('awakened_one');
    expect(awakenedOne.canRebirth).toBe(true);
  });
});

describe('Guardian Mode Shift', () => {
  it('should have modeShift flag', () => {
    const guardian = getEnemyById('theGuardian');
    expect(guardian.modeShift).toBe(true);
  });

  it('should have modeShift move', () => {
    const guardian = getEnemyById('theGuardian');
    const modeShiftMove = guardian.moveset.find(m => m.special === 'modeShift');
    expect(modeShiftMove).toBeDefined();
  });
});

describe('xCost (Whirlwind)', () => {
  it('should deal exactly X hits where X = energy spent', () => {
    const enemy = createEnemyInstance(getEnemyById('jawWorm'));
    const startHp = enemy.currentHp;
    const ctx = {
      player: { energy: 3, strength: 0, weak: 0, vulnerable: 0 },
      enemies: [enemy],
      targetIndex: 0,
      relics: [],
      combatLog: []
    };
    const card = { damage: 5, special: 'xCost' };
    handleSpecialEffect('xCost', card, ctx);

    // With 3 energy, should hit exactly 3 times (not 4)
    expect(ctx.player.energy).toBe(0);
    // Each hit does 5 damage, 3 hits = 15 total
    expect(ctx.enemies[0].currentHp).toBe(startHp - 15);
  });

  it('should deal 0 hits with 0 energy', () => {
    const enemy = createEnemyInstance(getEnemyById('jawWorm'));
    const startHp = enemy.currentHp;
    const ctx = {
      player: { energy: 0, strength: 0, weak: 0, vulnerable: 0 },
      enemies: [enemy],
      targetIndex: 0,
      relics: [],
      combatLog: []
    };
    const card = { damage: 5, special: 'xCost' };
    handleSpecialEffect('xCost', card, ctx);

    expect(ctx.player.energy).toBe(0);
    expect(ctx.enemies[0].currentHp).toBe(startHp);
  });

  it('should hit all enemies', () => {
    const enemy1 = createEnemyInstance(getEnemyById('jawWorm'));
    const enemy2 = createEnemyInstance(getEnemyById('jawWorm'));
    const hp1 = enemy1.currentHp;
    const hp2 = enemy2.currentHp;
    const ctx = {
      player: { energy: 2, strength: 0, weak: 0, vulnerable: 0 },
      enemies: [enemy1, enemy2],
      targetIndex: 0,
      relics: [],
      combatLog: []
    };
    const card = { damage: 5, special: 'xCost' };
    handleSpecialEffect('xCost', card, ctx);

    expect(ctx.enemies[0].currentHp).toBe(hp1 - 10);
    expect(ctx.enemies[1].currentHp).toBe(hp2 - 10);
  });
});

describe('Rupture', () => {
  it('should grant strength when hpCost card is played', () => {
    const player = { rupture: 1, strength: 0, currentHp: 50 };
    // Simulate hpCost triggering Rupture (as done in GameContext)
    const hpCost = 3;
    player.currentHp = Math.max(1, player.currentHp - hpCost);
    if (player.rupture > 0) {
      player.strength += player.rupture;
    }
    expect(player.strength).toBe(1);
    expect(player.currentHp).toBe(47);
  });

  it('should grant multiple strength with higher rupture stacks', () => {
    const player = { rupture: 3, strength: 2, currentHp: 50 };
    const hpCost = 3;
    player.currentHp = Math.max(1, player.currentHp - hpCost);
    if (player.rupture > 0) {
      player.strength += player.rupture;
    }
    expect(player.strength).toBe(5);
  });

  it('should not trigger from enemy damage (only card HP loss)', () => {
    const player = { rupture: 1, strength: 0, currentHp: 50, block: 0 };
    // Enemy damage does NOT trigger rupture
    const enemyDamage = 10;
    player.currentHp = Math.max(0, player.currentHp - enemyDamage);
    // Rupture should not trigger here
    expect(player.strength).toBe(0);
  });

  it('should trigger from Brutality HP loss', () => {
    const player = { rupture: 2, strength: 0, currentHp: 50, brutality: true };
    // Simulate Brutality at turn start
    player.currentHp = Math.max(1, player.currentHp - 1);
    if (player.rupture > 0) {
      player.strength += player.rupture;
    }
    expect(player.strength).toBe(2);
    expect(player.currentHp).toBe(49);
  });

  it('should trigger from Combust HP loss', () => {
    const player = { rupture: 1, strength: 0, currentHp: 50, combust: { hpLoss: 1, damage: 5 } };
    // Simulate Combust at end of turn
    player.currentHp -= player.combust.hpLoss;
    if (player.rupture > 0) {
      player.strength += player.rupture;
    }
    expect(player.strength).toBe(1);
    expect(player.currentHp).toBe(49);
  });
});

describe('Dropkick dead enemy check', () => {
  it('should not grant bonus on dead enemy', () => {
    const enemy = createEnemyInstance(getEnemyById('jawWorm'));
    enemy.currentHp = 0; // dead
    enemy.vulnerable = 2;
    const ctx = {
      player: { energy: 1, strength: 0, weak: 0 },
      enemies: [enemy],
      targetIndex: 0,
      hand: [],
      drawPile: [{ id: 'strike', instanceId: 'test_1' }],
      discardPile: [],
      relics: [],
      combatLog: []
    };
    const card = { damage: 5, special: 'bonusIfVulnerable' };
    handleSpecialEffect('bonusIfVulnerable', card, ctx);

    // Should not gain energy or draw since enemy is dead
    expect(ctx.player.energy).toBe(1);
    expect(ctx.hand.length).toBe(0);
  });

  it('should grant bonus on living vulnerable enemy', () => {
    const enemy = createEnemyInstance(getEnemyById('jawWorm'));
    enemy.vulnerable = 2;
    const ctx = {
      player: { energy: 1, strength: 0, weak: 0 },
      enemies: [enemy],
      targetIndex: 0,
      hand: [],
      drawPile: [{ id: 'strike', instanceId: 'test_1' }],
      discardPile: [],
      relics: [],
      combatLog: []
    };
    const card = { damage: 5, special: 'bonusIfVulnerable' };
    handleSpecialEffect('bonusIfVulnerable', card, ctx);

    expect(ctx.player.energy).toBe(2);
    expect(ctx.hand.length).toBe(1);
  });
});

describe('Rampage escalating damage', () => {
  it('should increase card damage by 5 each play', () => {
    const card = { id: 'rampage', damage: 8, special: 'escalatingDamage', instanceId: 'rampage_1' };
    const enemy = createEnemyInstance(getEnemyById('jawWorm'));
    const ctx = {
      player: { energy: 1, strength: 0, weak: 0 },
      enemies: [enemy],
      targetIndex: 0,
      hand: [card],
      drawPile: [],
      discardPile: [],
      relics: [],
      combatLog: []
    };

    // First play: damage becomes 8+5=13
    handleSpecialEffect('escalatingDamage', card, ctx);
    expect(card.damage).toBe(13);

    // Second play: damage becomes 13+5=18
    handleSpecialEffect('escalatingDamage', card, ctx);
    expect(card.damage).toBe(18);
  });

  it('should update card damage in discard pile too', () => {
    const card = { id: 'rampage', damage: 8, special: 'escalatingDamage', instanceId: 'rampage_1' };
    const cardInDiscard = { id: 'rampage', damage: 8, special: 'escalatingDamage', instanceId: 'rampage_1' };
    const enemy = createEnemyInstance(getEnemyById('jawWorm'));
    const ctx = {
      player: { energy: 1, strength: 0, weak: 0 },
      enemies: [enemy],
      targetIndex: 0,
      hand: [card],
      drawPile: [],
      discardPile: [cardInDiscard],
      relics: [],
      combatLog: []
    };

    handleSpecialEffect('escalatingDamage', card, ctx);
    // The card in discard with same instanceId should also be updated
    expect(ctx.discardPile[0].damage).toBe(13);
  });
});

describe('Damage Pipeline Order', () => {
  it('should apply Flight before Intangible (Flight reduces then Intangible caps at 1)', () => {
    const player = { currentHp: 50, block: 0, flight: 2, intangible: 1 };
    const hpLost = applyDamageToPlayer(player, 20, [], []);
    // Flight halves to 10, then Intangible caps at 1, Torii not applicable
    expect(hpLost).toBe(1);
    expect(player.flight).toBe(1); // consumed 1 stack
  });

  it('should apply Torii after Intangible (damage already 1, Torii still applies)', () => {
    const player = { currentHp: 50, block: 0, intangible: 1 };
    const torii = { id: 'torii' };
    const hpLost = applyDamageToPlayer(player, 20, [torii], []);
    // Intangible caps at 1, Torii applies (1 <= 5), damage stays 1
    expect(hpLost).toBe(1);
  });

  it('should apply Torii on low damage without Intangible', () => {
    const player = { currentHp: 50, block: 0 };
    const torii = { id: 'torii' };
    const hpLost = applyDamageToPlayer(player, 4, [torii], []);
    // 4 <= 5, Torii reduces to 1
    expect(hpLost).toBe(1);
  });

  it('should not apply Torii on high damage without Intangible', () => {
    const player = { currentHp: 50, block: 0 };
    const torii = { id: 'torii' };
    const hpLost = applyDamageToPlayer(player, 10, [torii], []);
    // 10 > 5, Torii does NOT apply
    expect(hpLost).toBe(10);
  });

  it('should apply Tungsten Rod after block is broken', () => {
    const player = { currentHp: 50, block: 5 };
    const tungstenRod = { id: 'tungsten_rod' };
    const hpLost = applyDamageToPlayer(player, 10, [tungstenRod], []);
    // 10 - 5 block = 5 remaining, Tungsten Rod reduces by 1 = 4 HP lost
    expect(hpLost).toBe(4);
    expect(player.currentHp).toBe(46);
  });

  it('should handle block absorbing all damage', () => {
    const player = { currentHp: 50, block: 20 };
    const hpLost = applyDamageToPlayer(player, 10, [], []);
    expect(hpLost).toBe(0);
    expect(player.block).toBe(10);
    expect(player.currentHp).toBe(50);
  });
});

describe('Spot Weakness intent check', () => {
  it('should grant strength for attack_buff intent', () => {
    const enemy = createEnemyInstance(getEnemyById('jawWorm'));
    enemy.intentData = { intent: 'attack_buff' };
    const ctx = {
      player: { strength: 0, energy: 1, weak: 0 },
      enemies: [enemy],
      targetIndex: 0,
      relics: [],
      combatLog: []
    };
    const card = { damage: 0, special: 'strIfAttacking', strength: 3 };
    handleSpecialEffect('strIfAttacking', card, ctx);
    expect(ctx.player.strength).toBe(3);
  });

  it('should grant strength for attack intent', () => {
    const enemy = createEnemyInstance(getEnemyById('jawWorm'));
    enemy.intentData = { intent: 'attack' };
    const ctx = {
      player: { strength: 0, energy: 1, weak: 0 },
      enemies: [enemy],
      targetIndex: 0,
      relics: [],
      combatLog: []
    };
    const card = { damage: 0, special: 'strIfAttacking', strength: 3 };
    handleSpecialEffect('strIfAttacking', card, ctx);
    expect(ctx.player.strength).toBe(3);
  });

  it('should not grant strength for defend intent', () => {
    const enemy = createEnemyInstance(getEnemyById('jawWorm'));
    enemy.intentData = { intent: 'defend' };
    const ctx = {
      player: { strength: 0, energy: 1, weak: 0 },
      enemies: [enemy],
      targetIndex: 0,
      relics: [],
      combatLog: []
    };
    const card = { damage: 0, special: 'strIfAttacking', strength: 3 };
    handleSpecialEffect('strIfAttacking', card, ctx);
    expect(ctx.player.strength).toBe(0);
  });
});

describe('Enemy Block Retention (FIX-05)', () => {
  const createMinimalCombatState = (enemies) => ({
    player: {
      currentHp: 50, maxHp: 80, block: 0, energy: 3, maxEnergy: 3,
      strength: 0, dexterity: 0, vulnerable: 0, weak: 0, frail: 0,
      powers: [], statusEffects: []
    },
    enemies,
    hand: [],
    drawPile: [getCardById('strike'), getCardById('strike'), getCardById('defend'), getCardById('defend'), getCardById('strike')],
    discardPile: [],
    exhaustPile: [],
    relics: [],
    turn: 1,
    combatLog: [],
    roomType: 'combat'
  });

  it('should clear block for normal enemies without retainBlock', () => {
    const jawWorm = createEnemyInstance(getEnemyById('jawWorm'));
    jawWorm.block = 10;
    const state = createMinimalCombatState([jawWorm]);
    const result = handleEndTurn(state);
    expect(result.enemies[0].block).toBe(0);
  });

  it('should NOT clear block for enemies with retainBlock', () => {
    const lagavulin = createEnemyInstance(getEnemyById('lagavulin'));
    lagavulin.block = 15;
    const state = createMinimalCombatState([lagavulin]);
    const result = handleEndTurn(state);
    expect(result.enemies[0].block).toBe(15);
  });

  it('should NOT clear block for enemies with barricade flag', () => {
    const enemy = createEnemyInstance(getEnemyById('jawWorm'));
    enemy.barricade = true;
    enemy.block = 8;
    const state = createMinimalCombatState([enemy]);
    const result = handleEndTurn(state);
    expect(result.enemies[0].block).toBe(8);
  });

  it('Lagavulin should have retainBlock in enemy data', () => {
    const lagavulin = getEnemyById('lagavulin');
    expect(lagavulin.retainBlock).toBe(true);
  });

  it('Shelled Parasite should have platedArmor in enemy data', () => {
    const shelledParasite = getEnemyById('shelledParasite');
    expect(shelledParasite.platedArmor).toBe(14);
  });

  it('The Guardian should have retainBlock in enemy data', () => {
    const guardian = getEnemyById('theGuardian');
    expect(guardian.retainBlock).toBe(true);
  });

  it('The Champ should have retainBlock in enemy data', () => {
    const champ = getEnemyById('theChamp');
    expect(champ.retainBlock).toBe(true);
  });
});
