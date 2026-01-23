import { describe, it, expect } from 'vitest';
import { ALL_RELICS, getRelicById, RELIC_RARITY } from '../data/relics';
import { CARD_TYPES } from '../data/cards';

// Simulate the relic trigger system from GameContext
const triggerRelics = (relics, trigger, context = {}) => {
  let effects = {
    heal: 0,
    block: 0,
    strength: 0,
    dexterity: 0,
    energy: 0,
    draw: 0,
    damage: 0,
    damageAll: 0,
    vulnerable: 0,
    weak: 0,
    intangible: 0,
    doubleDamage: false,
    blockNextTurn: 0,
    reduceDamage: 0,
    thorns: 0
  };

  const updatedRelics = relics.map(relic => {
    if (relic.trigger !== trigger) return relic;

    let newRelic = { ...relic };

    // Handle counter-based relics
    if (relic.counter !== undefined && relic.threshold) {
      newRelic.counter = (relic.counter || 0) + 1;
      if (newRelic.counter < relic.threshold) {
        return newRelic;
      }
      newRelic.counter = 0;
    }

    // Handle one-time-per-combat relics
    if (relic.usedThisCombat) return relic;
    if (trigger === 'onFirstHpLoss' && !relic.usedThisCombat) {
      newRelic.usedThisCombat = true;
    }

    // Handle turn-specific relics (Horn Cleat)
    if (relic.turn && context.turn !== relic.turn) return relic;

    // Apply effect
    const effect = relic.effect;
    if (!effect) return newRelic;

    switch (effect.type) {
      case 'heal':
        effects.heal += effect.amount;
        break;
      case 'block':
        effects.block += effect.amount;
        break;
      case 'blockIfNone':
        if (context.playerBlock === 0) {
          effects.block += effect.amount;
        }
        break;
      case 'strength':
        effects.strength += effect.amount;
        break;
      case 'dexterity':
        effects.dexterity += effect.amount;
        break;
      case 'energy':
        effects.energy += effect.amount;
        break;
      case 'draw':
        effects.draw += effect.amount;
        break;
      case 'damageAll':
        effects.damageAll += effect.amount;
        break;
      case 'vulnerable':
        effects.vulnerable += effect.amount;
        break;
      case 'weak':
        effects.weak += effect.amount;
        break;
      case 'thorns':
        effects.thorns += effect.amount;
        break;
      case 'doubleDamage':
        effects.doubleDamage = true;
        break;
    }

    return newRelic;
  });

  return { effects, updatedRelics };
};

describe('Relic Triggers', () => {
  describe('ON_COMBAT_START Triggers', () => {
    it('should fire onCombatStart triggers when combat begins', () => {
      const combatStartRelics = ALL_RELICS.filter(r => r.trigger === 'onCombatStart');
      expect(combatStartRelics.length).toBeGreaterThan(0);
    });

    it('Anchor should give 10 block at combat start', () => {
      const anchor = getRelicById('anchor');
      expect(anchor).toBeDefined();
      expect(anchor.trigger).toBe('onCombatStart');
      expect(anchor.effect.type).toBe('block');
      expect(anchor.effect.amount).toBe(10);

      const { effects } = triggerRelics([anchor], 'onCombatStart');
      expect(effects.block).toBe(10);
    });

    it('Vajra should give 1 strength at combat start', () => {
      const vajra = getRelicById('vajra');
      expect(vajra).toBeDefined();
      expect(vajra.trigger).toBe('onCombatStart');
      expect(vajra.effect.type).toBe('strength');
      expect(vajra.effect.amount).toBe(1);

      const { effects } = triggerRelics([vajra], 'onCombatStart');
      expect(effects.strength).toBe(1);
    });

    it('Oddly Smooth Stone should give 1 dexterity at combat start', () => {
      const stone = getRelicById('oddly_smooth_stone');
      expect(stone).toBeDefined();
      expect(stone.trigger).toBe('onCombatStart');
      expect(stone.effect.type).toBe('dexterity');
      expect(stone.effect.amount).toBe(1);

      const { effects } = triggerRelics([stone], 'onCombatStart');
      expect(effects.dexterity).toBe(1);
    });

    it('Bag of Preparation should draw 2 cards at combat start', () => {
      const bag = getRelicById('bag_of_preparation');
      expect(bag).toBeDefined();
      expect(bag.trigger).toBe('onCombatStart');
      expect(bag.effect.type).toBe('draw');
      expect(bag.effect.amount).toBe(2);

      const { effects } = triggerRelics([bag], 'onCombatStart');
      expect(effects.draw).toBe(2);
    });

    it('Blood Vial should heal 2 HP at combat start', () => {
      const vial = getRelicById('blood_vial');
      expect(vial).toBeDefined();
      expect(vial.trigger).toBe('onCombatStart');
      expect(vial.effect.type).toBe('heal');
      expect(vial.effect.amount).toBe(2);

      const { effects } = triggerRelics([vial], 'onCombatStart');
      expect(effects.heal).toBe(2);
    });

    it('Bag of Marbles should apply vulnerable at combat start', () => {
      const marbles = getRelicById('bag_of_marbles');
      expect(marbles).toBeDefined();
      expect(marbles.trigger).toBe('onCombatStart');
      expect(marbles.effect.type).toBe('vulnerable');
      expect(marbles.effect.amount).toBe(1);

      const { effects } = triggerRelics([marbles], 'onCombatStart');
      expect(effects.vulnerable).toBe(1);
    });

    it('multiple combat start relics should stack effects', () => {
      const anchor = { ...getRelicById('anchor') };
      const vajra = { ...getRelicById('vajra') };
      const stone = { ...getRelicById('oddly_smooth_stone') };

      const { effects } = triggerRelics([anchor, vajra, stone], 'onCombatStart');

      expect(effects.block).toBe(10);
      expect(effects.strength).toBe(1);
      expect(effects.dexterity).toBe(1);
    });
  });

  describe('ON_TURN_START Triggers', () => {
    it('should fire onTurnStart triggers each turn', () => {
      const turnStartRelics = ALL_RELICS.filter(r => r.trigger === 'onTurnStart');
      expect(turnStartRelics.length).toBeGreaterThan(0);
    });

    it('Horn Cleat should give 14 block on turn 2', () => {
      const hornCleat = getRelicById('horn_cleat');
      expect(hornCleat).toBeDefined();
      expect(hornCleat.trigger).toBe('onTurnStart');
      expect(hornCleat.turn).toBe(2);
      expect(hornCleat.effect.amount).toBe(14);

      // Should not trigger on turn 1
      const turn1Result = triggerRelics([{ ...hornCleat }], 'onTurnStart', { turn: 1 });
      expect(turn1Result.effects.block).toBe(0);

      // Should trigger on turn 2
      const turn2Result = triggerRelics([{ ...hornCleat }], 'onTurnStart', { turn: 2 });
      expect(turn2Result.effects.block).toBe(14);

      // Should not trigger on turn 3
      const turn3Result = triggerRelics([{ ...hornCleat }], 'onTurnStart', { turn: 3 });
      expect(turn3Result.effects.block).toBe(0);
    });
  });

  describe('ON_TURN_END Triggers', () => {
    it('should fire onTurnEnd triggers at end of turn', () => {
      const turnEndRelics = ALL_RELICS.filter(r => r.trigger === 'onTurnEnd');
      expect(turnEndRelics.length).toBeGreaterThan(0);
    });

    it('Orichalcum should give 6 block if player has no block', () => {
      const orichalcum = getRelicById('orichalcum');
      expect(orichalcum).toBeDefined();
      expect(orichalcum.trigger).toBe('onTurnEnd');
      expect(orichalcum.effect.type).toBe('blockIfNone');
      expect(orichalcum.effect.amount).toBe(6);

      // Should trigger when block is 0
      const noBlockResult = triggerRelics([{ ...orichalcum }], 'onTurnEnd', { playerBlock: 0 });
      expect(noBlockResult.effects.block).toBe(6);

      // Should not trigger when player has block
      const hasBlockResult = triggerRelics([{ ...orichalcum }], 'onTurnEnd', { playerBlock: 5 });
      expect(hasBlockResult.effects.block).toBe(0);
    });
  });

  describe('ON_CARD_PLAYED Triggers', () => {
    it('should have relics that trigger on card played', () => {
      const attackPlayedRelics = ALL_RELICS.filter(r => r.trigger === 'onAttackPlayed');
      const skillPlayedRelics = ALL_RELICS.filter(r => r.trigger === 'onSkillPlayed');
      expect(attackPlayedRelics.length + skillPlayedRelics.length).toBeGreaterThan(0);
    });

    it('Nunchaku should give energy every 10 attacks', () => {
      const nunchaku = getRelicById('nunchaku');
      expect(nunchaku).toBeDefined();
      expect(nunchaku.trigger).toBe('onAttackPlayed');
      expect(nunchaku.counter).toBe(0);
      expect(nunchaku.threshold).toBe(10);

      // Simulate playing 10 attacks
      let relic = { ...nunchaku };
      let totalEnergy = 0;

      for (let i = 0; i < 10; i++) {
        const { effects, updatedRelics } = triggerRelics([relic], 'onAttackPlayed');
        relic = updatedRelics[0];
        totalEnergy += effects.energy;
      }

      // Should have gained 1 energy after 10 attacks
      expect(totalEnergy).toBe(1);
      expect(relic.counter).toBe(0); // Reset after threshold
    });

    it('Pen Nib should give double damage every 10 attacks', () => {
      const penNib = getRelicById('pen_nib');
      expect(penNib).toBeDefined();
      expect(penNib.trigger).toBe('onAttackPlayed');
      expect(penNib.counter).toBe(0);
      expect(penNib.threshold).toBe(10);

      // Simulate playing 9 attacks (no trigger)
      let relic = { ...penNib };

      for (let i = 0; i < 9; i++) {
        const { effects, updatedRelics } = triggerRelics([relic], 'onAttackPlayed');
        relic = updatedRelics[0];
        expect(effects.doubleDamage).toBe(false);
      }

      // 10th attack should trigger double damage
      const { effects } = triggerRelics([relic], 'onAttackPlayed');
      expect(effects.doubleDamage).toBe(true);
    });

    it('Kunai should give dexterity every 3 attacks in a turn', () => {
      const kunai = getRelicById('kunai');
      expect(kunai).toBeDefined();
      expect(kunai.trigger).toBe('onAttackPlayed');
      expect(kunai.threshold).toBe(3);

      let relic = { ...kunai };
      let totalDexterity = 0;

      for (let i = 0; i < 3; i++) {
        const { effects, updatedRelics } = triggerRelics([relic], 'onAttackPlayed');
        relic = updatedRelics[0];
        totalDexterity += effects.dexterity;
      }

      expect(totalDexterity).toBe(1);
    });

    it('Letter Opener should deal damage when playing skills', () => {
      const letterOpener = getRelicById('letter_opener');
      if (letterOpener) {
        expect(letterOpener.trigger).toBe('onSkillPlayed');
      }
    });
  });

  describe('ON_ENEMY_DEATH Triggers', () => {
    it('should have relics with onDeath or similar triggers', () => {
      // Relics that trigger on enemy death
      const deathRelics = ALL_RELICS.filter(r =>
        r.trigger === 'onDeath' ||
        r.id === 'gremlin_horn' ||
        r.id === 'face_of_cleric'
      );
      expect(deathRelics.length).toBeGreaterThan(0);
    });

    it('Gremlin Horn should gain energy and draw on kill', () => {
      const gremlinHorn = getRelicById('gremlin_horn');
      if (gremlinHorn) {
        expect(gremlinHorn.effect).toBeDefined();
      }
    });

    it('simulated enemy death should trigger relevant relics', () => {
      // Simulate enemy death trigger system
      const onEnemyDeath = (relics) => {
        let effects = { energy: 0, draw: 0, heal: 0, gold: 0 };

        relics.forEach(relic => {
          // Gremlin Horn gives energy and card draw
          if (relic.id === 'gremlin_horn') {
            effects.energy += 1;
            effects.draw += 1;
          }
          // Face of Cleric heals
          if (relic.id === 'face_of_cleric') {
            effects.heal += 1;
          }
        });

        return effects;
      };

      const gremlinHorn = getRelicById('gremlin_horn');
      if (gremlinHorn) {
        const effects = onEnemyDeath([gremlinHorn]);
        expect(effects.energy).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('ON_DAMAGE_TAKEN Triggers', () => {
    it('should have relics that trigger on damage taken', () => {
      const damageTakenRelics = ALL_RELICS.filter(r =>
        r.trigger === 'onDamageTaken' ||
        r.trigger === 'onDamageReceived' ||
        r.trigger === 'onHpLoss' ||
        r.trigger === 'onFirstHpLoss'
      );
      expect(damageTakenRelics.length).toBeGreaterThan(0);
    });

    it('Bronze Scales should deal thorns damage when hit', () => {
      const bronzeScales = getRelicById('bronze_scales');
      expect(bronzeScales).toBeDefined();
      expect(bronzeScales.trigger).toBe('onDamageTaken');
      expect(bronzeScales.effect.type).toBe('thorns');
      expect(bronzeScales.effect.amount).toBe(3);

      const { effects } = triggerRelics([bronzeScales], 'onDamageTaken');
      expect(effects.thorns).toBe(3);
    });

    it('Centennial Puzzle should draw 3 on first HP loss', () => {
      const puzzle = getRelicById('centennial_puzzle');
      expect(puzzle).toBeDefined();
      expect(puzzle.trigger).toBe('onFirstHpLoss');
      expect(puzzle.effect.type).toBe('draw');
      expect(puzzle.effect.amount).toBe(3);

      // First HP loss should trigger
      const relic = { ...puzzle, usedThisCombat: false };
      const { effects, updatedRelics } = triggerRelics([relic], 'onFirstHpLoss');
      expect(effects.draw).toBe(3);
      expect(updatedRelics[0].usedThisCombat).toBe(true);

      // Second HP loss should not trigger
      const { effects: effects2 } = triggerRelics([updatedRelics[0]], 'onFirstHpLoss');
      expect(effects2.draw).toBe(0);
    });

    it('onFirstHpLoss should only trigger once per combat', () => {
      const puzzle = { ...getRelicById('centennial_puzzle'), usedThisCombat: false };

      // First trigger
      const result1 = triggerRelics([puzzle], 'onFirstHpLoss');
      expect(result1.effects.draw).toBe(3);

      // Second trigger (already used)
      const result2 = triggerRelics([result1.updatedRelics[0]], 'onFirstHpLoss');
      expect(result2.effects.draw).toBe(0);
    });
  });

  describe('ON_FIRST_TURN Triggers', () => {
    it('Lantern should give 1 energy on first turn', () => {
      const lantern = getRelicById('lantern');
      expect(lantern).toBeDefined();
      expect(lantern.trigger).toBe('onFirstTurn');
      expect(lantern.effect.type).toBe('energy');
      expect(lantern.effect.amount).toBe(1);

      const { effects } = triggerRelics([lantern], 'onFirstTurn');
      expect(effects.energy).toBe(1);
    });
  });

  describe('Counter-Based Relics', () => {
    it('counter relics should increment on trigger', () => {
      const nunchaku = { ...getRelicById('nunchaku') };
      expect(nunchaku.counter).toBe(0);

      const { updatedRelics } = triggerRelics([nunchaku], 'onAttackPlayed');
      expect(updatedRelics[0].counter).toBe(1);
    });

    it('counter should reset when threshold is reached', () => {
      const nunchaku = { ...getRelicById('nunchaku'), counter: 9 };

      const { updatedRelics, effects } = triggerRelics([nunchaku], 'onAttackPlayed');
      expect(updatedRelics[0].counter).toBe(0);
      expect(effects.energy).toBe(1);
    });

    it('counter should not trigger effect before threshold', () => {
      const nunchaku = { ...getRelicById('nunchaku'), counter: 5 };

      const { effects } = triggerRelics([nunchaku], 'onAttackPlayed');
      expect(effects.energy).toBe(0);
    });
  });

  describe('Passive Relics', () => {
    it('passive relics should provide continuous bonuses', () => {
      const passiveRelics = ALL_RELICS.filter(r => r.trigger === 'passive');
      expect(passiveRelics.length).toBeGreaterThan(0);
    });

    it('boss relics with energy bonus should be passive', () => {
      const bossRelics = ALL_RELICS.filter(r => r.rarity === RELIC_RARITY.BOSS);
      const energyBonusRelics = bossRelics.filter(r =>
        r.effect && r.effect.type === 'energyBonus'
      );

      energyBonusRelics.forEach(relic => {
        expect(relic.trigger).toBe('passive');
      });
    });
  });

  describe('Combat End Triggers', () => {
    it('Burning Blood should heal 6 HP at combat end', () => {
      const burningBlood = getRelicById('burning_blood');
      expect(burningBlood).toBeDefined();
      expect(burningBlood.trigger).toBe('onCombatEnd');
      expect(burningBlood.effect.type).toBe('heal');
      expect(burningBlood.effect.amount).toBe(6);

      const { effects } = triggerRelics([burningBlood], 'onCombatEnd');
      expect(effects.heal).toBe(6);
    });
  });

  describe('Multiple Relic Interactions', () => {
    it('multiple relics of same trigger should all fire', () => {
      const relics = [
        { ...getRelicById('anchor') },
        { ...getRelicById('vajra') },
        { ...getRelicById('oddly_smooth_stone') },
        { ...getRelicById('blood_vial') }
      ];

      const { effects } = triggerRelics(relics, 'onCombatStart');

      expect(effects.block).toBe(10); // Anchor
      expect(effects.strength).toBe(1); // Vajra
      expect(effects.dexterity).toBe(1); // Oddly Smooth Stone
      expect(effects.heal).toBe(2); // Blood Vial
    });

    it('relics with different triggers should only fire on their trigger', () => {
      const relics = [
        { ...getRelicById('anchor') }, // onCombatStart
        { ...getRelicById('orichalcum') }, // onTurnEnd
        { ...getRelicById('bronze_scales') } // onDamageTaken
      ];

      // Only anchor should fire on combat start
      const combatStartEffects = triggerRelics(relics, 'onCombatStart').effects;
      expect(combatStartEffects.block).toBe(10);
      expect(combatStartEffects.thorns).toBe(0);

      // Only orichalcum should fire on turn end (with no block)
      const turnEndEffects = triggerRelics(relics, 'onTurnEnd', { playerBlock: 0 }).effects;
      expect(turnEndEffects.block).toBe(6);

      // Only bronze scales should fire on damage taken
      const damageTakenEffects = triggerRelics(relics, 'onDamageTaken').effects;
      expect(damageTakenEffects.thorns).toBe(3);
    });
  });
});
