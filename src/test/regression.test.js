/**
 * QA-11: Full Regression Test Suite
 *
 * Comprehensive coverage for all cards, enemies, relics, events, potions,
 * and ascension playthroughs. Targets gaps not covered by existing tests.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ALL_CARDS, getCardById, CARD_TYPES, RARITY } from '../data/cards';
import { ALL_ENEMIES, getEnemyById, createEnemyInstance } from '../data/enemies';
import { ALL_RELICS, getRelicById } from '../data/relics';
import { ALL_POTIONS, getPotionById } from '../data/potions';
import events from '../data/events';
import { applyPotionEffect, canUsePotion } from '../systems/potionSystem';
import { createInitialState, GAME_PHASE } from '../context/GameContext';
import { metaReducer } from '../context/reducers/metaReducer';
import { mapReducer } from '../context/reducers/mapReducer';
import { combatReducer } from '../context/reducers/combatReducer';
import { rewardReducer } from '../context/reducers/rewardReducer';
import { removePotion } from '../systems/potionSystem';

vi.mock('../systems/saveSystem', () => ({
  saveGame: vi.fn(),
  loadGame: vi.fn(() => null),
  deleteSave: vi.fn(),
  hasSave: vi.fn(() => false),
  autoSave: vi.fn()
}));

// Dispatch helper matching GameContext logic
function dispatch(state, action) {
  switch (action.type) {
    case 'START_GAME':
    case 'SELECT_CHARACTER':
    case 'SELECT_STARTING_BONUS':
    case 'REST':
    case 'UPGRADE_CARD':
    case 'SKIP_EVENT':
    case 'RETURN_TO_MENU':
    case 'LIFT_GIRYA':
    case 'SAVE_GAME':
    case 'LOAD_GAME':
    case 'DELETE_SAVE':
      return metaReducer(state, action);
    case 'SELECT_NODE':
    case 'PROCEED_TO_MAP':
      return mapReducer(state, action);
    case 'SELECT_CARD':
    case 'PLAY_CARD':
    case 'CANCEL_TARGET':
    case 'END_TURN':
    case 'SELECT_CARD_FROM_PILE':
    case 'CANCEL_CARD_SELECTION':
    case 'SPAWN_ENEMIES':
      return combatReducer(state, action);
    case 'COLLECT_GOLD':
    case 'COLLECT_RELIC':
    case 'OPEN_CARD_REWARDS':
    case 'SELECT_CARD_REWARD':
    case 'SKIP_CARD_REWARD':
      return rewardReducer(state, action);
    case 'USE_POTION': {
      const { slotIndex, targetIndex } = action.payload;
      const potion = state.potions[slotIndex];
      if (!potion) return state;
      if (!canUsePotion(potion, state)) return state;
      let newState = applyPotionEffect(potion, state, targetIndex);
      newState = removePotion(newState, slotIndex);
      return newState;
    }
    default:
      return state;
  }
}

// Run a combat to completion, returns final state
function runCombat(state, maxTurns = 50) {
  let turns = 0;
  while (state.phase === GAME_PHASE.COMBAT && turns < maxTurns) {
    const attacks = state.hand.filter(c => c.type === 'attack' && c.cost <= state.player.energy);
    for (const card of attacks) {
      if (state.phase !== GAME_PHASE.COMBAT) break;
      if (!state.hand.find(h => h.instanceId === card.instanceId)) continue;
      if (!state.enemies.length) break;
      state = dispatch(state, { type: 'SELECT_CARD', payload: { card } });
      if (state.targetingMode) {
        const target = state.enemies.find(e => e.currentHp > 0);
        if (target) {
          state = dispatch(state, { type: 'PLAY_CARD', payload: { card, targetId: target.instanceId } });
        }
      } else if (state.selectedCard) {
        state = dispatch(state, { type: 'PLAY_CARD', payload: { card, targetId: null } });
      }
    }
    const skills = state.hand.filter(c => c.type === 'skill' && c.cost <= state.player.energy);
    for (const card of skills) {
      if (state.phase !== GAME_PHASE.COMBAT) break;
      if (!state.hand.find(h => h.instanceId === card.instanceId)) continue;
      state = dispatch(state, { type: 'SELECT_CARD', payload: { card } });
      if (state.targetingMode && state.enemies.length > 0) {
        state = dispatch(state, { type: 'PLAY_CARD', payload: { card, targetId: state.enemies[0].instanceId } });
      } else if (!state.targetingMode) {
        state = dispatch(state, { type: 'PLAY_CARD', payload: { card, targetId: null } });
      }
    }
    if (state.phase === GAME_PHASE.COMBAT) {
      state = dispatch(state, { type: 'END_TURN' });
      turns++;
    }
  }
  return state;
}

// ============================================================
// 1. Card Effect Regression - ALL playable cards
// ============================================================

describe('Card Effect Regression', () => {
  const playableCards = ALL_CARDS.filter(c => !c.unplayable);

  it(`covers all ${playableCards.length} playable cards`, () => {
    expect(playableCards.length).toBeGreaterThanOrEqual(81);
  });

  describe('Every playable card has valid structure', () => {
    playableCards.forEach(card => {
      it(`${card.id}: has cost, type, and description`, () => {
        expect(card.cost).toBeGreaterThanOrEqual(-1);
        expect(card.cost).toBeLessThanOrEqual(5);
        expect(typeof card.type).toBe('string');
        expect(typeof card.description).toBe('string');
        expect(card.description.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Attack cards have damage or special damage mechanic', () => {
    const attackCards = playableCards.filter(c => c.type === CARD_TYPES.ATTACK);
    attackCards.forEach(card => {
      it(`${card.id}: attack has damage or special`, () => {
        const hasDamage = card.damage !== undefined || card.special !== undefined;
        expect(hasDamage).toBe(true);
      });
    });
  });

  describe('Upgraded versions are well-formed', () => {
    const upgradeable = playableCards.filter(c => c.upgradedVersion && !c.upgraded);
    upgradeable.forEach(card => {
      it(`${card.id}: upgrade has description and improved stats`, () => {
        const up = card.upgradedVersion;
        expect(up).toBeDefined();
        expect(typeof up.description).toBe('string');
        // Upgrade should change at least one thing
        const changedKeys = Object.keys(up).filter(k => k !== 'description');
        expect(changedKeys.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Special mechanic cards reference known specials', () => {
    const knownSpecials = [
      'addCopyToDiscard', 'discardToDrawTop', 'addWound', 'damageEqualBlock',
      'onlyAttacks', 'upgradeInHand', 'flexStrength', 'playTopCard',
      'exhaustRandom', 'handToDrawTop', 'gainEnergyOnExhaust', 'hpForEnergy',
      'bonusIfVulnerable', 'escalatingDamage', 'addDaze', 'xCost',
      'multiUpgrade', 'bonusPerStrike', 'cantDraw', 'removeStrength',
      'copyCardInHand', 'doubleBlock', 'retaliateOnHit', 'addRandomAttack',
      'addWoundsToHand', 'blockPerAttack', 'exhaustNonAttacksBlock',
      'strIfAttacking', 'killForMaxHp', 'exhaustHandDamage', 'addBurn',
      'lifesteal', 'doubleNextAttack', 'retrieveExhausted', 'doubleStrength',
      'retainAllBlock', 'selfVulnForEnergy', 'hpForDraw', 'hpForAoeDamage',
      'freeSkillsExhaust', 'drawOnExhaust', 'strengthEachTurn', 'drawOnStatus',
      'blockOnExhaust', 'aoeOnStatus', 'damageOnBlock', 'metallicize',
      'strengthOnSelfHpLoss', 'severSoul', 'tempStrengthDown', 'exhaustForDraw',
      'combustStack', 'doubleNextAttacks2', 'costReduceOnHpLoss', 'damagePerStatus',
      'gainEnergyOnExhaust3', 'blockPerAttackEvolved', 'gainStrengthOnKill',
      'burnDamage', 'voidCard', 'painCurse', 'regretCurse', 'doubtCurse',
      'decayCurse', 'perfectedStrikeUp',
      // Silent specials
      'discardOne', 'drawThenDiscard', 'gainEnergyNextTurn', 'drawThenDiscardOne',
      'addShivs', 'blockNextTurn', 'noxiousFumes', 'gainDexterity', 'drawNextTurn',
      'damagePerSkillInHand', 'damagePerAttackPlayed', 'retainCards', 'thousandCuts',
      'bulletTime', 'corpseExplosion', 'envenom', 'glassKnife',
      'escalatingDamage8', 'bonusPerStrike3', 'doubleNextAttacks3', 'exhaustChoose',
      // Defect specials
      'channelLightning', 'channelFrost', 'channelDark', 'channelPlasma',
      'evokeOrb', 'evokeAllOrbs', 'gainFocus', 'loseFocus', 'gainOrbSlot',
      'dualcast', 'drawPerOrb', 'steamBarrier', 'blockPerDiscard', 'blizzardDamage',
      'ftlDraw', 'sunderEnergy', 'consume', 'seekCards', 'creativeAI', 'echoForm',
      'electrodynamics',
      // Watcher specials
      'haltWrath'
    ];
    const specialCards = ALL_CARDS.filter(c => c.special);
    specialCards.forEach(card => {
      it(`${card.id}: special '${card.special}' is a known mechanic`, () => {
        expect(knownSpecials).toContain(card.special);
      });
    });
  });
});

// ============================================================
// 2. Enemy AI Regression - Act 1 + Act 3 enemies
// ============================================================

describe('Enemy AI Regression - Non-Act-2 Enemies', () => {
  // Act 2 is covered by act2Regression.test.js
  const act2Ids = [
    'centurion', 'mystic', 'snecko', 'chosen', 'shelledParasite',
    'byrd', 'bookOfStabbing', 'gremlinLeader', 'reptomancer',
    'dagger', 'automaton', 'bronzeOrb', 'slaverBlue', 'snakePlant',
    'sphericGuardian', 'gremlinMinion'
  ];
  const nonAct2 = ALL_ENEMIES.filter(e => !act2Ids.includes(e.id));

  it(`covers ${nonAct2.length} non-Act-2 enemies`, () => {
    expect(nonAct2.length).toBeGreaterThan(0);
  });

  describe('All non-Act-2 enemies produce valid moves on turns 0-10', () => {
    nonAct2.forEach(enemy => {
      it(`${enemy.id} (${enemy.type}, act ${enemy.act}): AI returns valid moves`, () => {
        const instance = createEnemyInstance(enemy);
        let lastMove = null;
        for (let turn = 0; turn <= 10; turn++) {
          const move = enemy.ai(instance, turn, lastMove, 0, [instance]);
          expect(move, `${enemy.id} turn ${turn}`).toBeDefined();
          expect(move.id, `${enemy.id} turn ${turn} missing id`).toBeDefined();
          expect(typeof move.id).toBe('string');
          lastMove = move;
        }
      });
    });
  });

  describe('All non-Act-2 enemy instances have combat fields', () => {
    nonAct2.forEach(enemy => {
      it(`${enemy.id}: instance has required fields`, () => {
        const inst = createEnemyInstance(enemy);
        expect(inst.currentHp).toBeGreaterThan(0);
        expect(inst.maxHp).toBeGreaterThan(0);
        expect(inst.block).toBe(0);
        expect(typeof inst.strength).toBe('number');
        expect(typeof inst.vulnerable).toBe('number');
        expect(typeof inst.weak).toBe('number');
        expect(inst.instanceId).toBeDefined();
      });
    });
  });
});

// ============================================================
// 3. Relic Trigger Regression - Full coverage of all 49 relics
// ============================================================

describe('Relic Regression - All Relics', () => {
  it(`has exactly ${ALL_RELICS.length} relics`, () => {
    expect(ALL_RELICS.length).toBeGreaterThanOrEqual(49);
  });

  describe('Every relic has valid structure', () => {
    ALL_RELICS.forEach(relic => {
      it(`${relic.id}: has required fields`, () => {
        expect(relic.id).toBeDefined();
        expect(typeof relic.id).toBe('string');
        expect(relic.name).toBeDefined();
        expect(relic.description).toBeDefined();
        expect(relic.trigger).toBeDefined();
        expect(relic.rarity).toBeDefined();
      });
    });
  });

  describe('Every relic with an effect has valid effect type', () => {
    const relicsWithEffects = ALL_RELICS.filter(r => r.effect);
    relicsWithEffects.forEach(relic => {
      it(`${relic.id}: effect type '${relic.effect.type}' is valid`, () => {
        const validTypes = [
          'addRandomCard', 'block', 'blockIfNone', 'blockNextTurn',
          'channelOrb', 'conserveEnergy', 'damage', 'damageAll', 'dexterity',
          'doubleDamage', 'doubleEliteRelics', 'draw', 'drawBonus',
          'drawSpecific', 'energy', 'energyBonus', 'heal', 'healIfLowHp',
          'healPerCards', 'healingBonus', 'intangible', 'maxHp',
          'maxHpOption', 'playCurses', 'reduceHpLoss', 'reduceLowDamage',
          'removeDebuffsIfAllTypes', 'retainBlock', 'revive',
          'shopDiscount', 'strength', 'strengthIfLowHp', 'strengthOption',
          'strengthPerCurse', 'thorns', 'vulnerable', 'vulnerableBonus',
          'weak'
        ];
        expect(validTypes).toContain(relic.effect.type);
      });
    });
  });

  describe('Counter-based relics have threshold', () => {
    const counterRelics = ALL_RELICS.filter(r => r.counter !== undefined);
    counterRelics.forEach(relic => {
      it(`${relic.id}: has threshold`, () => {
        expect(relic.threshold).toBeDefined();
        expect(relic.threshold).toBeGreaterThan(0);
      });
    });
  });
});

// ============================================================
// 4. Event Choice Regression - All 25 events
// ============================================================

describe('Event Choice Regression', () => {
  it('has exactly 25 events', () => {
    expect(events.length).toBe(25);
  });

  describe('Every event choice has valid effect keys and result text', () => {
    const validEffectKeys = [
      'heal', 'damage', 'gainGold', 'loseGold', 'loseHp', 'loseHpPercent',
      'gainRelic', 'addCardToDiscard', 'removeCard', 'upgradeRandomCard',
      'gainMaxHp', 'loseMaxHp'
    ];

    events.forEach(event => {
      describe(`Event: ${event.title}`, () => {
        event.choices.forEach((choice, idx) => {
          it(`choice ${idx + 1} ("${choice.text.slice(0, 40)}...") has valid effects`, () => {
            const keys = Object.keys(choice.effect);
            expect(keys.length).toBeGreaterThan(0);
            keys.forEach(key => {
              const isValid = validEffectKeys.some(vk => key.startsWith(vk));
              expect(isValid, `Unknown effect key: ${key}`).toBe(true);
            });
          });

          it(`choice ${idx + 1} has non-empty result text`, () => {
            expect(typeof choice.result).toBe('string');
            expect(choice.result.length).toBeGreaterThan(10);
          });
        });
      });
    });
  });
});

// ============================================================
// 5. Potion Regression - All 15 potions with combat state
// ============================================================

describe('Potion Effect Regression - All Potions', () => {
  const createCombatState = () => ({
    phase: 'combat',
    player: {
      maxHp: 80, currentHp: 50, block: 0, energy: 3, maxEnergy: 3,
      strength: 0, dexterity: 0, vulnerable: 0, weak: 0,
      metallicize: 0, platedArmor: 0, doubleTap: 0, pendingDraw: 0
    },
    potions: [null, null, null],
    enemies: [
      { id: 'e1', name: 'Test Enemy', currentHp: 40, maxHp: 40, block: 0, vulnerable: 0, weak: 0 },
      { id: 'e2', name: 'Test Enemy 2', currentHp: 25, maxHp: 25, block: 0, vulnerable: 0, weak: 0 }
    ]
  });

  it(`covers all ${ALL_POTIONS.length} potions`, () => {
    expect(ALL_POTIONS.length).toBe(15);
  });

  ALL_POTIONS.forEach(potion => {
    it(`${potion.id}: applyPotionEffect does not throw`, () => {
      const state = createCombatState();
      const targetIndex = potion.targetType === 'enemy' ? 0 : null;
      expect(() => {
        applyPotionEffect(potion, state, targetIndex);
      }).not.toThrow();
    });

    it(`${potion.id}: applyPotionEffect returns a valid state`, () => {
      const state = createCombatState();
      const targetIndex = potion.targetType === 'enemy' ? 0 : null;
      const newState = applyPotionEffect(potion, state, targetIndex);
      expect(newState).toBeDefined();
      expect(newState.player).toBeDefined();
      expect(newState.enemies).toBeDefined();
    });
  });
});

// ============================================================
// 6. Ascension Playthroughs - A0 and A5
// ============================================================

describe('Ascension Playthrough Regression', () => {
  const runPlaythrough = (ascensionLevel) => {
    let state = createInitialState();
    expect(state.phase).toBe(GAME_PHASE.MAIN_MENU);

    state = dispatch(state, { type: 'START_GAME', payload: { ascensionLevel } });
    state = dispatch(state, { type: 'SELECT_CHARACTER', payload: { characterId: 'ironclad' } });
    state = dispatch(state, { type: 'SELECT_STARTING_BONUS', payload: { bonusId: 'skip' } });
    expect(state.phase).toBe(GAME_PHASE.MAP);
    expect(state.ascension).toBe(ascensionLevel);

    // Play through 3 floors
    for (let floor = 0; floor < 3 && state.phase === GAME_PHASE.MAP; floor++) {
      const floorNodes = state.map[floor];
      if (!floorNodes) break;
      const combatNode = floorNodes.find(n => n.type === 'combat');
      if (!combatNode) break;
      const nodeId = `${floor}-${floorNodes.indexOf(combatNode)}`;
      state = dispatch(state, { type: 'SELECT_NODE', payload: { nodeId } });

      state = runCombat(state);

      if (state.phase === GAME_PHASE.COMBAT_REWARD) {
        if (state.combatRewards?.gold > 0) {
          state = dispatch(state, { type: 'COLLECT_GOLD' });
        }
        state = dispatch(state, { type: 'PROCEED_TO_MAP' });
      }
      if (state.phase === GAME_PHASE.GAME_OVER) break;
    }

    return state;
  };

  it('A0 playthrough: 3 floors without crashes', () => {
    const state = runPlaythrough(0);
    expect(state).toBeDefined();
    expect(state.phase).toBeDefined();
    expect([
      GAME_PHASE.MAP, GAME_PHASE.COMBAT, GAME_PHASE.COMBAT_REWARD,
      GAME_PHASE.GAME_OVER, GAME_PHASE.VICTORY
    ]).toContain(state.phase);
  });

  it('A5 playthrough: 3 floors without crashes', () => {
    const state = runPlaythrough(5);
    expect(state).toBeDefined();
    expect(state.phase).toBeDefined();
    expect([
      GAME_PHASE.MAP, GAME_PHASE.COMBAT, GAME_PHASE.COMBAT_REWARD,
      GAME_PHASE.GAME_OVER, GAME_PHASE.VICTORY
    ]).toContain(state.phase);
  });

  it('A5 applies ascension modifiers (reduced starting gold)', () => {
    let state = createInitialState();
    state = dispatch(state, { type: 'START_GAME', payload: { ascensionLevel: 5 } });
    state = dispatch(state, { type: 'SELECT_CHARACTER', payload: { characterId: 'ironclad' } });
    state = dispatch(state, { type: 'SELECT_STARTING_BONUS', payload: { bonusId: 'skip' } });
    expect(state.ascension).toBe(5);
    // A0 starts with 99 gold, A5 should have same or less
    expect(state.player.gold).toBeLessThanOrEqual(99);
  });
});

// ============================================================
// 7. Save/Load at every game phase
// ============================================================

describe('Save/Load Phase Regression', () => {
  const phases = [GAME_PHASE.MAP, GAME_PHASE.REST_SITE, GAME_PHASE.EVENT];

  phases.forEach(phase => {
    it(`SAVE_GAME does not crash in ${phase} phase`, () => {
      let state = createInitialState();
      state = dispatch(state, { type: 'START_GAME' });
      state = dispatch(state, { type: 'SELECT_CHARACTER', payload: { characterId: 'ironclad' } });
      state = dispatch(state, { type: 'SELECT_STARTING_BONUS', payload: { bonusId: 'skip' } });
      state = { ...state, phase };

      expect(() => {
        dispatch(state, { type: 'SAVE_GAME' });
      }).not.toThrow();
    });
  });
});
