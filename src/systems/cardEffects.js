/**
 * Card Effects System
 *
 * Handles all card special effects. These are effects triggered by cards
 * that go beyond basic damage/block, such as doubling stats, adding cards
 * to piles, or triggering card selection UI.
 *
 * @module systems/cardEffects
 */

import { ALL_CARDS, CARD_TYPES, getRandomCard } from '../data/cards';
import { INTENT } from '../data/enemies';
import { shuffleArray } from '../utils/mapGenerator';
import { calculateDamage, calculateBlock, applyDamageToTarget } from './combatSystem';
import { channelOrb, evokeOrbs, applyOrbEvoke } from './orbSystem';
import { audioManager, SOUNDS } from './audioSystem';

/**
 * Helper to handle exhaust triggers (Dark Embrace, Feel No Pain, Dead Branch)
 */
const handleExhaustTriggers = (ctx) => {
  if (ctx.player.darkEmbrace) {
    if (ctx.drawPile.length === 0 && ctx.discardPile.length > 0) {
      ctx.drawPile = shuffleArray(ctx.discardPile);
      ctx.discardPile = [];
    }
    if (ctx.drawPile.length > 0) {
      ctx.hand.push(ctx.drawPile.shift());
    }
  }
  if (ctx.player.feelNoPain > 0) {
    ctx.player.block += ctx.player.feelNoPain;
  }
  // Dead Branch: add random card on exhaust
  if (ctx.relics && ctx.relics.some(r => r.id === 'dead_branch')) {
    const randomCard = getRandomCard(null, null);
    if (randomCard) {
      ctx.hand.push({ ...randomCard, instanceId: `${randomCard.id}_branch_${Date.now()}_${Math.random()}` });
      ctx.combatLog.push(`Dead Branch added ${randomCard.name}`);
    }
  }
};

/**
 * Context object passed to special effect handlers
 * @typedef {Object} EffectContext
 * @property {Object} player - Player state
 * @property {Array} enemies - Enemy array
 * @property {Array} hand - Current hand
 * @property {Array} drawPile - Draw pile
 * @property {Array} discardPile - Discard pile
 * @property {Array} exhaustPile - Exhaust pile
 * @property {Array} combatLog - Combat log messages
 * @property {number} targetIndex - Target enemy index
 * @property {Array} relics - Player relics
 * @property {Array} deck - Full deck
 * @property {Object} state - Full game state (for card selection returns)
 * @property {Object} GAME_PHASE - Game phase constants
 */

/**
 * Result object from special effect handlers
 * @typedef {Object} EffectResult
 * @property {Object} player - Updated player
 * @property {Array} enemies - Updated enemies
 * @property {Array} hand - Updated hand
 * @property {Array} drawPile - Updated draw pile
 * @property {Array} discardPile - Updated discard pile
 * @property {Array} exhaustPile - Updated exhaust pile
 * @property {Array} combatLog - Updated combat log
 * @property {boolean} [earlyReturn] - If true, return the earlyReturnState immediately
 * @property {Object} [earlyReturnState] - State to return if earlyReturn is true
 */

/**
 * Simple effects that just modify player stats
 */
const simplePlayerEffects = {
  haltWrath: (card, ctx) => {
    if (ctx.player.currentStance === 'wrath') {
      const wrathBlock = card.upgraded ? 14 : 9;
      ctx.player.block += wrathBlock - (card.block || 0);
      ctx.combatLog.push(`Halt: in Wrath, gained ${wrathBlock} Block total`);
    }
  },
  doubleBlock: (card, ctx) => {
    ctx.player.block *= 2;
    ctx.combatLog.push(`Block doubled to ${ctx.player.block}`);
  },
  doubleStrength: (card, ctx) => {
    ctx.player.strength *= 2;
    ctx.combatLog.push(`Strength doubled to ${ctx.player.strength}`);
  },
  retaliateOnHit: (card, ctx) => {
    ctx.player.flameBarrier = card.thorns || card.damage || 4;
  },
  retainAllBlock: (card, ctx) => {
    ctx.player.barricade = true;
    ctx.combatLog.push('Block now persists between turns');
  },
  selfVulnForEnergy: (card, ctx) => {
    ctx.player.berserk++;
  },
  strengthEachTurn: (card, ctx) => {
    ctx.player.demonForm += card.strength || card.damage || 2;
  },
  doubleNextAttack: (card, ctx) => {
    ctx.player.doubleTap++;
  },
  blockPerAttack: (card, ctx) => {
    ctx.player.rage = card.rageBlock || card.block || 3;
  },
  metallicize: (card, ctx) => {
    ctx.player.metallicize += card.block || 3;
  },
  blockOnExhaust: (card, ctx) => {
    ctx.player.feelNoPain += card.block || 3;
  },
  damageOnBlock: (card, ctx) => {
    ctx.player.juggernaut = card.damage || 5;
  },
  drawOnExhaust: (card, ctx) => {
    ctx.player.darkEmbrace = true;
  },
  drawOnStatus: (card, ctx) => {
    ctx.player.evolve += card.draw || 1;
  },
  strengthOnSelfHpLoss: (card, ctx) => {
    ctx.player.rupture += card.strength || 1;
  },
  aoeOnStatus: (card, ctx) => {
    ctx.player.fireBreathing = card.damage || 6;
  },
  freeSkillsExhaust: (card, ctx) => {
    ctx.player.corruption = true;
    ctx.combatLog.push('Skills now cost 0 but Exhaust');
  },
  hpForDraw: (card, ctx) => {
    ctx.player.brutality = true;
  },
  hpForAoeDamage: (card, ctx) => {
    ctx.player.combust = { hpLoss: card.hpLoss || 1, damage: card.damage || 5 };
  },
  cantDraw: (card, ctx) => {
    ctx.player.noDrawThisTurn = true;
    ctx.combatLog.push('Cannot draw more cards this turn');
  },
  flexStrength: (card, ctx) => {
    // Mark that player has temporary strength to lose at end of turn
    ctx.player.flexStrengthLoss = (ctx.player.flexStrengthLoss || 0) + (card.effects?.[0]?.amount || 2);
  },
  doubleNextAttacks2: (card, ctx) => {
    ctx.player.doubleTap += 2;
  },
  doubleNextAttacks3: (card, ctx) => {
    ctx.player.doubleTap += 3;
  },
  combustStack: (card, ctx) => {
    // Stacks with existing combust
    const existingCombust = ctx.player.combust;
    if (existingCombust) {
      ctx.player.combust = {
        hpLoss: existingCombust.hpLoss + (card.hpLoss || 1),
        damage: existingCombust.damage + (card.damage || 5)
      };
    } else {
      ctx.player.combust = { hpLoss: card.hpLoss || 1, damage: card.damage || 5 };
    }
    ctx.combatLog.push(`Combust stacked: ${ctx.player.combust.damage} damage per turn`);
  },
  blockPerAttackEvolved: (card, ctx) => {
    ctx.player.rage = card.rageBlock || 5;
  },
  noxiousFumes: (card, ctx) => {
    ctx.player.noxiousFumes = (ctx.player.noxiousFumes || 0) + (card.poisonPerTurn || 2);
    ctx.combatLog.push(`Noxious Fumes will apply ${card.poisonPerTurn || 2} Poison each turn`);
  },
  gainDexterity: (card, ctx) => {
    ctx.player.dexterity = (ctx.player.dexterity || 0) + (card.dexterity || 2);
    ctx.combatLog.push(`Gained ${card.dexterity || 2} Dexterity`);
  },
  thousandCuts: (card, ctx) => {
    ctx.player.thousandCuts = (ctx.player.thousandCuts || 0) + (card.damagePerCard || 1);
    ctx.combatLog.push(`A Thousand Cuts will deal ${card.damagePerCard || 1} damage per card played`);
  },
  retainCards: (card, ctx) => {
    ctx.player.wellLaidPlans = (ctx.player.wellLaidPlans || 0) + (card.retainCount || 1);
    ctx.combatLog.push(`Well-Laid Plans: Retain up to ${card.retainCount || 1} card(s) at end of turn`);
  },
  envenom: (card, ctx) => {
    ctx.player.envenom = (ctx.player.envenom || 0) + (card.poisonOnUnblocked || 1);
    ctx.combatLog.push(`Envenom: apply ${card.poisonOnUnblocked || 1} Poison on unblocked damage`);
  },
  bulletTime: (card, ctx) => {
    ctx.player.bulletTime = true;
    ctx.player.noDrawThisTurn = true;
    ctx.combatLog.push('All cards cost 0 this turn. Cannot draw additional cards.');
  },
  gainFocus: (card, ctx) => {
    const amount = card.focusAmount || card.focus || 2;
    ctx.player.focus = (ctx.player.focus || 0) + amount;
    ctx.combatLog.push(`Gained ${amount} Focus`);
  },
  loseFocus: (card, ctx) => {
    const amount = card.focusLoss || 1;
    ctx.player.focus = (ctx.player.focus || 0) - amount;
    ctx.combatLog.push(`Lost ${amount} Focus`);
  },
  gainOrbSlot: (card, ctx) => {
    const amount = card.orbSlotGain || 1;
    ctx.player.orbSlots = (ctx.player.orbSlots || 3) + amount;
    ctx.combatLog.push(`Gained ${amount} Orb slot(s)`);
  }
};

/**
 * Effects that add cards to various piles
 */
const addCardEffects = {
  addCopyToDiscard: (card, ctx) => {
    ctx.discardPile.push({ ...card, instanceId: `${card.id}_copy_${Date.now()}` });
  },
  addWound: (card, ctx) => {
    const count = card.wounds || 1;
    const wound = ALL_CARDS.find(c => c.id === 'wound');
    for (let i = 0; i < count; i++) {
      ctx.drawPile.push({ ...wound, instanceId: `wound_${Date.now()}_${i}` });
    }
    ctx.drawPile = shuffleArray(ctx.drawPile);
  },
  addWounds: (card, ctx) => {
    addCardEffects.addWound(card, ctx);
  },
  addDaze: (card, ctx) => {
    const daze = ALL_CARDS.find(c => c.id === 'dazed');
    ctx.drawPile.push({ ...daze, instanceId: `daze_${Date.now()}` });
    ctx.drawPile = shuffleArray(ctx.drawPile);
  },
  addBurn: (card, ctx) => {
    const burn = ALL_CARDS.find(c => c.id === 'burn');
    ctx.discardPile.push({ ...burn, instanceId: `burn_${Date.now()}` });
  },
  addShivs: (card, ctx) => {
    const shivCard = ALL_CARDS.find(c => c.id === 'shiv');
    const count = card.shivCount || 3;
    for (let i = 0; i < count; i++) {
      ctx.hand.push({ ...shivCard, instanceId: `shiv_${Date.now()}_${i}` });
    }
    ctx.combatLog.push(`Added ${count} Shiv(s) to hand`);
  },
  addWoundsToHand: (card, ctx) => {
    const wound = ALL_CARDS.find(c => c.id === 'wound');
    const count = card.wounds || 2;
    for (let i = 0; i < count; i++) {
      ctx.hand.push({ ...wound, instanceId: `wound_hand_${Date.now()}_${i}` });
    }
    ctx.combatLog.push(`Added ${count} Wounds to hand`);
  },
  addRandomAttack: (card, ctx) => {
    const randomAttack = getRandomCard(null, CARD_TYPES.ATTACK);
    if (randomAttack) {
      const freeAttack = { ...randomAttack, cost: 0, instanceId: `${randomAttack.id}_${Date.now()}` };
      ctx.hand.push(freeAttack);
      ctx.combatLog.push(`Added ${randomAttack.name} to hand (costs 0)`);
    }
  }
};

/**
 * Complex effects that involve damage calculations or multiple state changes
 */
const complexEffects = {
  damageEqualBlock: (card, ctx) => {
    const damage = calculateDamage(ctx.player.block, ctx.player, ctx.enemies[ctx.targetIndex]);
    ctx.enemies[ctx.targetIndex] = applyDamageToTarget(ctx.enemies[ctx.targetIndex], damage);
    ctx.combatLog.push(`Body Slam dealt ${damage} damage`);
  },

  exhaustNonAttacksBlock: (card, ctx) => {
    const nonAttacks = ctx.hand.filter(c => c.type !== CARD_TYPES.ATTACK);
    const blockGain = nonAttacks.length * card.blockPer;
    ctx.player.block += calculateBlock(blockGain, ctx.player);
    nonAttacks.forEach(c => {
      ctx.exhaustPile.push(c);
      handleExhaustTriggers(ctx);
    });
    ctx.hand = ctx.hand.filter(c => c.type === CARD_TYPES.ATTACK);
    ctx.combatLog.push(`Exhausted ${nonAttacks.length} cards, gained ${blockGain} Block`);
  },

  exhaustHandDamage: (card, ctx) => {
    const handCards = [...ctx.hand];
    const damage = card.damage * handCards.length;
    handCards.forEach(c => {
      ctx.exhaustPile.push(c);
      handleExhaustTriggers(ctx);
    });
    ctx.hand = [];
    const enemy = ctx.enemies[ctx.targetIndex];
    if (enemy && enemy.currentHp > 0) {
      const totalDamage = calculateDamage(damage, ctx.player, enemy, { relics: ctx.relics });
      ctx.enemies[ctx.targetIndex] = applyDamageToTarget(enemy, totalDamage);
      ctx.combatLog.push(`Fiend Fire dealt ${totalDamage} damage`);
    }
  },

  killForMaxHp: (card, ctx) => {
    const enemy = ctx.enemies[ctx.targetIndex];
    if (enemy && enemy.currentHp <= 0) {
      ctx.player.maxHp += card.maxHpGain;
      ctx.player.currentHp += card.maxHpGain;
      ctx.combatLog.push(`Gained ${card.maxHpGain} Max HP from Feed`);
    }
  },

  lifesteal: (card, ctx) => {
    let totalHealing = 0;
    ctx.enemies = ctx.enemies.map(enemy => {
      if (enemy.currentHp <= 0) return enemy;
      const damage = calculateDamage(card.damage, ctx.player, enemy, { relics: ctx.relics });
      totalHealing += Math.min(damage, enemy.currentHp);
      const result = applyDamageToTarget(enemy, damage);
      ctx.combatLog.push(`Dealt ${damage} damage to ${enemy.name}`);
      return result;
    });
    ctx.player.currentHp = Math.min(ctx.player.maxHp, ctx.player.currentHp + totalHealing);
    ctx.combatLog.push(`Healed ${totalHealing} HP from Reaper`);
  },

  strIfAttacking: (card, ctx) => {
    const enemy = ctx.enemies[ctx.targetIndex];
    const attackIntents = [INTENT.ATTACK, INTENT.ATTACK_BUFF, INTENT.ATTACK_DEBUFF, INTENT.ATTACK_DEFEND];
    if (enemy && enemy.currentHp > 0 && enemy.intentData && attackIntents.includes(enemy.intentData.intent)) {
      ctx.player.strength += card.strength;
      ctx.combatLog.push(`Gained ${card.strength} Strength from Spot Weakness`);
    }
  },

  bonusIfVulnerable: (card, ctx) => {
    const enemy = ctx.enemies[ctx.targetIndex];
    if (enemy && enemy.currentHp > 0 && enemy.vulnerable > 0) {
      ctx.player.energy++;
      if (ctx.drawPile.length === 0 && ctx.discardPile.length > 0) {
        ctx.drawPile = shuffleArray(ctx.discardPile);
        ctx.discardPile = [];
      }
      if (ctx.drawPile.length > 0) {
        ctx.hand.push(ctx.drawPile.shift());
      }
      ctx.combatLog.push('Dropkick bonus: +1 Energy, drew 1 card');
    }
  },

  xCost: (card, ctx) => {
    const energyToSpend = ctx.player.energy;
    ctx.player.energy = 0;
    const baseDamage = card.damage || 5;
    for (let x = 0; x < energyToSpend; x++) {
      ctx.enemies = ctx.enemies.map(enemy => {
        if (enemy.currentHp <= 0) return enemy;
        const damage = calculateDamage(baseDamage, ctx.player, enemy, { relics: ctx.relics });
        return applyDamageToTarget(enemy, damage);
      });
    }
    ctx.combatLog.push(`Whirlwind dealt ${baseDamage} x ${energyToSpend} to all enemies`);
  },

  bonusPerStrike: (card, ctx) => {
    const strikeCount = ctx.deck.filter(c => c.name.toLowerCase().includes('strike')).length;
    const bonusPerStrike = 2;
    const bonusDamage = strikeCount * bonusPerStrike;
    const enemy = ctx.enemies[ctx.targetIndex];
    if (enemy && enemy.currentHp > 0) {
      const totalDamage = calculateDamage(card.damage + bonusDamage, ctx.player, enemy, { relics: ctx.relics });
      ctx.enemies[ctx.targetIndex] = applyDamageToTarget(enemy, totalDamage);
      ctx.combatLog.push(`Perfected Strike dealt ${totalDamage} damage (${strikeCount} Strikes)`);
    }
  },

  bonusPerStrike3: (card, ctx) => {
    const strikeCount = ctx.deck.filter(c => c.name.toLowerCase().includes('strike')).length;
    const bonusPerStrike = 3;
    const bonusDamage = strikeCount * bonusPerStrike;
    const enemy = ctx.enemies[ctx.targetIndex];
    if (enemy && enemy.currentHp > 0) {
      const totalDamage = calculateDamage(card.damage + bonusDamage, ctx.player, enemy, { relics: ctx.relics });
      ctx.enemies[ctx.targetIndex] = applyDamageToTarget(enemy, totalDamage);
      ctx.combatLog.push(`Perfected Strike dealt ${totalDamage} damage (${strikeCount} Strikes)`);
    }
  },

  escalatingDamage: (card, ctx) => {
    const rampageBonus = 5;
    // Update the card itself so it retains the bonus when discarded
    card.damage = (card.damage || 8) + rampageBonus;
    // Also update any copies in other piles
    const updateRampage = (cardToUpdate) => {
      if (cardToUpdate.instanceId === card.instanceId) {
        return { ...cardToUpdate, damage: card.damage };
      }
      return cardToUpdate;
    };
    ctx.discardPile = ctx.discardPile.map(updateRampage);
    ctx.drawPile = ctx.drawPile.map(updateRampage);
    ctx.combatLog.push(`Rampage damage increased by ${rampageBonus}`);
  },

  escalatingDamage8: (card, ctx) => {
    const rampageBonus = 8;
    // Update the card itself so it retains the bonus when discarded
    card.damage = (card.damage || 8) + rampageBonus;
    // Also update any copies in other piles
    const updateRampage = (cardToUpdate) => {
      if (cardToUpdate.instanceId === card.instanceId) {
        return { ...cardToUpdate, damage: card.damage };
      }
      return cardToUpdate;
    };
    ctx.discardPile = ctx.discardPile.map(updateRampage);
    ctx.drawPile = ctx.drawPile.map(updateRampage);
    ctx.combatLog.push(`Rampage damage increased by ${rampageBonus}`);
  },

  exhaustRandom: (card, ctx) => {
    if (ctx.hand.length > 0) {
      const randomIdx = Math.floor(Math.random() * ctx.hand.length);
      const exhaustedCard = ctx.hand[randomIdx];
      ctx.hand = ctx.hand.filter((_, i) => i !== randomIdx);
      ctx.exhaustPile.push(exhaustedCard);
      ctx.combatLog.push(`Exhausted ${exhaustedCard.name}`);
      handleExhaustTriggers(ctx);
    }
  },

  playTopCard: (card, ctx) => {
    if (ctx.drawPile.length > 0) {
      const topCard = ctx.drawPile.shift();
      if (!topCard.unplayable) {
        ctx.combatLog.push(`Havoc plays ${topCard.name}`);
        if (topCard.damage) {
          const damage = calculateDamage(topCard.damage, ctx.player, ctx.enemies[0] || {}, { relics: ctx.relics });
          if (ctx.enemies[0]) {
            ctx.enemies[0] = applyDamageToTarget(ctx.enemies[0], damage);
          }
        }
        if (topCard.block) {
          ctx.player.block += calculateBlock(topCard.block, ctx.player);
        }
      }
      ctx.exhaustPile.push(topCard);
    }
  },

  gainEnergyOnExhaust: (card, _ctx) => {
    card._sentinelEnergy = 2;
  },

  gainEnergyOnExhaust3: (card, _ctx) => {
    card._sentinelEnergy = 3;
  },

  severSoul: (card, ctx) => {
    const nonAttacks = ctx.hand.filter(c => c.type !== CARD_TYPES.ATTACK);
    nonAttacks.forEach(c => {
      ctx.exhaustPile.push(c);
      handleExhaustTriggers(ctx);
    });
    ctx.hand = ctx.hand.filter(c => c.type === CARD_TYPES.ATTACK);
    ctx.combatLog.push(`Sever Soul exhausted ${nonAttacks.length} non-attack cards`);
  },

  multiUpgrade: (card, ctx) => {
    const upgradeCount = card.upgradeCount || 0;
    const bonusDamage = upgradeCount * 4 + (upgradeCount * (upgradeCount - 1)) / 2;
    const totalDamage = calculateDamage(12 + bonusDamage, ctx.player, ctx.enemies[ctx.targetIndex], { relics: ctx.relics });
    ctx.enemies[ctx.targetIndex] = applyDamageToTarget(ctx.enemies[ctx.targetIndex], totalDamage);
    ctx.combatLog.push(`Searing Blow dealt ${totalDamage} damage`);
  },

  removeStrength: (card, ctx) => {
    const enemy = ctx.enemies[ctx.targetIndex];
    if (enemy && enemy.currentHp > 0) {
      ctx.enemies[ctx.targetIndex] = {
        ...enemy,
        strength: (enemy.strength || 0) - (card.strengthReduction || 2)
      };
      ctx.combatLog.push(`Reduced ${enemy.name}'s Strength by ${card.strengthReduction || 2}`);
    }
  },

  gainEnergy: (card, ctx) => {
    const amount = card.energyGain || 1;
    ctx.player.energy += amount;
    ctx.combatLog.push(`Gained ${amount} Energy`);
  },

  hpForEnergy: (card, ctx) => {
    const hpLoss = card.hpLoss || 3;
    ctx.player.currentHp = Math.max(1, ctx.player.currentHp - hpLoss);
    ctx.player.energy += card.energyGain || 2;
    ctx.combatLog.push(`Lost ${hpLoss} HP, gained ${card.energyGain || 2} Energy`);
    if (ctx.player.rupture > 0) {
      ctx.player.strength += ctx.player.rupture;
      ctx.combatLog.push(`Rupture granted ${ctx.player.rupture} Strength`);
    }
  },

  loseHpGainEnergy: (card, ctx) => {
    complexEffects.hpForEnergy(card, ctx);
  },

  tempStrengthDown: (card, ctx) => {
    const enemy = ctx.enemies[ctx.targetIndex];
    if (enemy && enemy.currentHp > 0) {
      const reduction = card.strengthReduction || 9;
      ctx.enemies[ctx.targetIndex] = {
        ...enemy,
        strength: (enemy.strength || 0) - reduction,
        tempStrengthLoss: (enemy.tempStrengthLoss || 0) + reduction
      };
      ctx.combatLog.push(`${enemy.name} lost ${reduction} Strength this turn`);
    }
  },

  costReduceOnHpLoss: (card, ctx) => {
    // Damage is dealt normally by the combat system using card.damage
    // The cost reduction is tracked on the card and handled by the combat system
    ctx.combatLog.push(`Blood for Blood dealt damage`);
  },

  damagePerStatus: (card, ctx) => {
    const statusCount = ctx.hand.filter(c => c.type === CARD_TYPES.STATUS || c.type === CARD_TYPES.CURSE).length;
    if (statusCount > 0) {
      const baseDamage = card.damage || 6;
      ctx.enemies = ctx.enemies.map(enemy => {
        if (enemy.currentHp <= 0) return enemy;
        const totalDamage = calculateDamage(baseDamage * statusCount, ctx.player, enemy, { relics: ctx.relics });
        ctx.combatLog.push(`Fire Breath dealt ${totalDamage} to ${enemy.name} (${statusCount} status cards)`);
        return applyDamageToTarget(enemy, totalDamage);
      });
    } else {
      ctx.combatLog.push('Fire Breath: no Status cards in hand');
    }
  },

  gainStrengthOnKill: (card, ctx) => {
    const enemy = ctx.enemies[ctx.targetIndex];
    if (enemy && enemy.currentHp <= 0) {
      const strengthGain = card.strengthGain || 3;
      ctx.player.strength += strengthGain;
      ctx.combatLog.push(`Gained ${strengthGain} Strength from kill`);
    }
  },

  // Orb effects (Defect)
  channelLightning: (card, ctx) => {
    const count = card.orbCount || 1;
    for (let i = 0; i < count; i++) {
      const result = channelOrb(ctx.player, 'lightning', ctx.enemies, ctx.combatLog);
      ctx.enemies = result.enemies;
    }
    audioManager.playSFX(SOUNDS.combat.orbLightning, 'combat');
  },
  channelFrost: (card, ctx) => {
    const count = card.orbCount || 1;
    for (let i = 0; i < count; i++) {
      const result = channelOrb(ctx.player, 'frost', ctx.enemies, ctx.combatLog);
      ctx.enemies = result.enemies;
    }
    // Track for Blizzard damage calculation
    ctx.player.frostChanneled = (ctx.player.frostChanneled || 0) + count;
    audioManager.playSFX(SOUNDS.combat.orbFrost, 'combat');
  },
  channelDark: (card, ctx) => {
    const count = card.orbCount || 1;
    for (let i = 0; i < count; i++) {
      const result = channelOrb(ctx.player, 'dark', ctx.enemies, ctx.combatLog);
      ctx.enemies = result.enemies;
    }
    audioManager.playSFX(SOUNDS.combat.orbDark, 'combat');
  },
  channelPlasma: (card, ctx) => {
    const count = card.orbCount || 1;
    for (let i = 0; i < count; i++) {
      const result = channelOrb(ctx.player, 'plasma', ctx.enemies, ctx.combatLog);
      ctx.enemies = result.enemies;
    }
    audioManager.playSFX(SOUNDS.combat.orbPlasma, 'combat');
  },
  evokeOrb: (card, ctx) => {
    const count = card.evokeCount || 1;
    const result = evokeOrbs(ctx.player, ctx.enemies, ctx.combatLog, { count });
    ctx.enemies = result.enemies;
    audioManager.playSFX(SOUNDS.combat.orbEvoke, 'combat');
  },
  evokeAllOrbs: (card, ctx) => {
    const result = evokeOrbs(ctx.player, ctx.enemies, ctx.combatLog, { all: true });
    ctx.enemies = result.enemies;
    audioManager.playSFX(SOUNDS.combat.orbEvoke, 'combat');
  },

  // Defect specials
  dualcast: (card, ctx) => {
    // Evoke the leftmost orb twice
    const orbs = ctx.player.orbs || [];
    if (orbs.length > 0) {
      const orb = orbs[0];
      const focus = ctx.player.focus || 0;
      // Evoke once (without removing)
      let result = applyOrbEvoke(orb, ctx.player, ctx.enemies, focus, ctx.combatLog);
      ctx.enemies = result.enemies;
      // Evoke again and remove
      result = applyOrbEvoke(orb, ctx.player, ctx.enemies, focus, ctx.combatLog);
      ctx.enemies = result.enemies;
      ctx.player.orbs = orbs.slice(1);
      audioManager.playSFX(SOUNDS.combat.orbEvoke, 'combat');
    }
  },
  drawPerOrb: (card, ctx) => {
    const orbs = ctx.player.orbs || [];
    const uniqueTypes = new Set(orbs.map(o => o.type));
    const drawCount = uniqueTypes.size;
    if (drawCount > 0) {
      for (let i = 0; i < drawCount; i++) {
        if (ctx.drawPile.length > 0) {
          const drawn = ctx.drawPile.pop();
          ctx.hand.push(drawn);
        }
      }
      ctx.combatLog.push(`Drew ${drawCount} card(s) from ${uniqueTypes.size} unique Orb type(s)`);
    }
  },
  steamBarrier: (card, ctx) => {
    // Reduce block already applied by the amount of previous plays this combat
    const reduction = ctx.player.steamBarrierReduction || 0;
    if (reduction > 0) {
      const actualReduction = Math.min(reduction, ctx.player.block);
      ctx.player.block -= actualReduction;
    }
    ctx.player.steamBarrierReduction = reduction + 1;
    ctx.combatLog.push('Steam Barrier block decreases by 1 each play');
  },
  blockPerDiscard: (card, ctx) => {
    const discardCount = ctx.discardPile.length;
    const bonus = card.blockBonus || 0;
    const blockGain = discardCount + bonus;
    if (blockGain > 0) {
      ctx.player.block += blockGain;
      ctx.combatLog.push(`Gained ${blockGain} Block from ${discardCount} discarded cards`);
    }
  },
  blizzardDamage: (card, ctx) => {
    const frostCount = ctx.player.frostChanneled || 0;
    const multiplier = card.blizzardMultiplier || 2;
    const damage = frostCount * multiplier;
    if (damage > 0) {
      ctx.enemies = ctx.enemies.map(e => {
        if (e.currentHp <= 0) return e;
        return applyDamageToTarget(e, calculateDamage(damage, ctx.player));
      });
      ctx.combatLog.push(`Blizzard dealt ${damage} damage to all enemies (${frostCount} Frost × ${multiplier})`);
    }
  },
  ftlDraw: (card, ctx) => {
    const threshold = card.ftlThreshold || 3;
    const cardsPlayed = ctx.player.cardsPlayedThisTurn || 0;
    if (cardsPlayed < threshold && ctx.drawPile.length > 0) {
      const drawn = ctx.drawPile.pop();
      ctx.hand.push(drawn);
      ctx.combatLog.push('FTL: Drew 1 card');
    }
  },
  sunderEnergy: (card, ctx) => {
    // Check if target enemy was killed by the damage (already applied)
    const target = ctx.enemies.find(e => e.instanceId === ctx.targetId);
    if (target && target.currentHp <= 0) {
      ctx.player.energy += 3;
      ctx.combatLog.push('Sunder killed enemy — gained 3 Energy');
    }
  },
  consume: (card, ctx) => {
    const focusGain = card.focusAmount || 2;
    ctx.player.focus = (ctx.player.focus || 0) + focusGain;
    ctx.player.orbSlots = Math.max(0, (ctx.player.orbSlots || 3) - 1);
    // If we have more orbs than slots, evoke overflow
    while ((ctx.player.orbs || []).length > ctx.player.orbSlots && ctx.player.orbs.length > 0) {
      const orb = ctx.player.orbs[0];
      const result = applyOrbEvoke(orb, ctx.player, ctx.enemies, ctx.player.focus, ctx.combatLog);
      ctx.enemies = result.enemies;
      ctx.player.orbs = ctx.player.orbs.slice(1);
    }
    ctx.combatLog.push(`Consumed: Gained ${focusGain} Focus, lost 1 Orb slot`);
  },
  seekCards: (card, ctx) => {
    const count = card.seekCount || 1;
    for (let i = 0; i < count; i++) {
      if (ctx.drawPile.length > 0) {
        // Take a random card from draw pile
        const idx = Math.floor(Math.random() * ctx.drawPile.length);
        const sought = ctx.drawPile.splice(idx, 1)[0];
        ctx.hand.push(sought);
      }
    }
    ctx.combatLog.push(`Sought ${count} card(s) from draw pile`);
  },
  creativeAI: (card, ctx) => {
    ctx.player.creativeAI = true;
    ctx.combatLog.push('Creative AI activated — a random Power card will be added each turn');
  },
  echoForm: (card, ctx) => {
    ctx.player.echoForm = (ctx.player.echoForm || 0) + 1;
    ctx.combatLog.push('Echo Form activated — first card each turn is played twice');
  },
  electrodynamics: (card, ctx) => {
    ctx.player.electrodynamics = true;
    // Channel Lightning orbs
    const count = card.orbCount || 2;
    for (let i = 0; i < count; i++) {
      const result = channelOrb(ctx.player, 'lightning', ctx.enemies, ctx.combatLog);
      ctx.enemies = result.enemies;
    }
    ctx.combatLog.push('Electrodynamics: Lightning now hits ALL enemies');
  }
};

/**
 * Effects that require card selection UI and trigger early return
 * These return { earlyReturn: true, earlyReturnState: {...} }
 */
const cardSelectionEffects = {
  discardToDrawTop: (card, ctx) => {
    if (ctx.discardPile.length > 0) {
      return {
        earlyReturn: true,
        earlyReturnState: {
          ...ctx.state,
          phase: ctx.GAME_PHASE.CARD_SELECT_DISCARD,
          cardSelection: { type: 'discardToDrawTop', sourceCard: card },
          player: ctx.player,
          enemies: ctx.enemies,
          hand: ctx.hand,
          discardPile: ctx.discardPile,
          drawPile: ctx.drawPile,
          exhaustPile: ctx.exhaustPile,
          selectedCard: null,
          targetingMode: false,
          combatLog: ctx.combatLog
        }
      };
    }
    return null;
  },

  handToDrawTop: (card, ctx) => {
    if (ctx.hand.length > 0) {
      return {
        earlyReturn: true,
        earlyReturnState: {
          ...ctx.state,
          phase: ctx.GAME_PHASE.CARD_SELECT_HAND,
          cardSelection: { type: 'handToDrawTop', sourceCard: card },
          player: ctx.player,
          enemies: ctx.enemies,
          hand: ctx.hand,
          discardPile: ctx.discardPile,
          drawPile: ctx.drawPile,
          exhaustPile: ctx.exhaustPile,
          selectedCard: null,
          targetingMode: false,
          combatLog: ctx.combatLog
        }
      };
    }
    return null;
  },

  upgradeInHand: (card, ctx) => {
    const upgradableInHand = ctx.hand.filter(c => !c.upgraded && c.upgradedVersion);
    if (upgradableInHand.length > 0) {
      return {
        earlyReturn: true,
        earlyReturnState: {
          ...ctx.state,
          phase: ctx.GAME_PHASE.CARD_SELECT_HAND,
          cardSelection: { type: 'upgradeInHand', sourceCard: card, upgradeAll: card.upgradeAll },
          player: ctx.player,
          enemies: ctx.enemies,
          hand: ctx.hand,
          discardPile: ctx.discardPile,
          drawPile: ctx.drawPile,
          exhaustPile: ctx.exhaustPile,
          selectedCard: null,
          targetingMode: false,
          combatLog: ctx.combatLog
        }
      };
    } else if (card.upgradeAll) {
      ctx.hand = ctx.hand.map(c => {
        if (!c.upgraded && c.upgradedVersion) {
          return { ...c, ...c.upgradedVersion, upgraded: true, name: c.name + '+' };
        }
        return c;
      });
      ctx.combatLog.push('Armaments+ upgraded all cards in hand');
    }
    return null;
  },

  copyCardInHand: (card, ctx) => {
    const validCards = ctx.hand.filter(c => c.type === CARD_TYPES.ATTACK || c.type === CARD_TYPES.POWER);
    if (validCards.length > 0) {
      return {
        earlyReturn: true,
        earlyReturnState: {
          ...ctx.state,
          phase: ctx.GAME_PHASE.CARD_SELECT_HAND,
          cardSelection: { type: 'copyCardInHand', sourceCard: card, copies: card.copies || 1 },
          player: ctx.player,
          enemies: ctx.enemies,
          hand: ctx.hand,
          discardPile: ctx.discardPile,
          drawPile: ctx.drawPile,
          exhaustPile: ctx.exhaustPile,
          selectedCard: null,
          targetingMode: false,
          combatLog: ctx.combatLog
        }
      };
    }
    return null;
  },

  retrieveExhausted: (card, ctx) => {
    const validExhaust = ctx.exhaustPile.filter(c => c.id !== 'exhume' && c.id !== 'exhumeUp');
    if (validExhaust.length > 0) {
      return {
        earlyReturn: true,
        earlyReturnState: {
          ...ctx.state,
          phase: ctx.GAME_PHASE.CARD_SELECT_EXHAUST,
          cardSelection: { type: 'retrieveExhausted', sourceCard: card },
          player: ctx.player,
          enemies: ctx.enemies,
          hand: ctx.hand,
          discardPile: ctx.discardPile,
          drawPile: ctx.drawPile,
          exhaustPile: ctx.exhaustPile,
          selectedCard: null,
          targetingMode: false,
          combatLog: ctx.combatLog
        }
      };
    }
    return null;
  },

  exhaustChoose: (card, ctx) => {
    if (ctx.hand.length > 0) {
      return {
        earlyReturn: true,
        earlyReturnState: {
          ...ctx.state,
          phase: ctx.GAME_PHASE.CARD_SELECT_HAND,
          cardSelection: { type: 'exhaustChoose', sourceCard: card },
          player: ctx.player,
          enemies: ctx.enemies,
          hand: ctx.hand,
          discardPile: ctx.discardPile,
          drawPile: ctx.drawPile,
          exhaustPile: ctx.exhaustPile,
          selectedCard: null,
          targetingMode: false,
          combatLog: ctx.combatLog
        }
      };
    }
    return null;
  },

  exhaustForDraw: (card, ctx) => {
    if (ctx.hand.length > 0) {
      return {
        earlyReturn: true,
        earlyReturnState: {
          ...ctx.state,
          phase: ctx.GAME_PHASE.CARD_SELECT_HAND,
          cardSelection: { type: 'exhaustForDraw', sourceCard: card, drawCount: card.draw || 2 },
          player: ctx.player,
          enemies: ctx.enemies,
          hand: ctx.hand,
          discardPile: ctx.discardPile,
          drawPile: ctx.drawPile,
          exhaustPile: ctx.exhaustPile,
          selectedCard: null,
          targetingMode: false,
          combatLog: ctx.combatLog
        }
      };
    }
    return null;
  }
};

/**
 * Main handler for card special effects
 *
 * @param {string} special - The special effect type
 * @param {Object} card - The card being played
 * @param {EffectContext} ctx - The effect context
 * @returns {EffectResult|null} The result or null if no effect handled
 */
export const handleSpecialEffect = (special, card, ctx) => {
  // Check card selection effects first (they may early return)
  if (cardSelectionEffects[special]) {
    const result = cardSelectionEffects[special](card, ctx);
    if (result) return result;
  }

  // Check simple player effects
  if (simplePlayerEffects[special]) {
    simplePlayerEffects[special](card, ctx);
    return { handled: true };
  }

  // Check add card effects
  if (addCardEffects[special]) {
    addCardEffects[special](card, ctx);
    return { handled: true };
  }

  // Check complex effects
  if (complexEffects[special]) {
    complexEffects[special](card, ctx);
    return { handled: true };
  }

  return null;
};

/**
 * List of all supported special effects
 */
export const SUPPORTED_EFFECTS = [
  ...Object.keys(simplePlayerEffects),
  ...Object.keys(addCardEffects),
  ...Object.keys(complexEffects),
  ...Object.keys(cardSelectionEffects)
];
