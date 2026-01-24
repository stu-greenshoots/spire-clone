import { GAME_PHASE } from '../../GameContext';
import { CARD_TYPES, getCardRewards, getRandomCard } from '../../../data/cards';
import { shuffleArray } from '../../../utils/mapGenerator';
import { applyDamageToTarget as combatApplyDamageToTarget } from '../../../systems/combatSystem';
import { getEnemyIntent, createSplitSlimes, createSummonedEnemy } from '../../../systems/enemySystem';
import { triggerRelics, getPassiveRelicEffects } from '../../../systems/relicSystem';
import { deleteSave, autoSave } from '../../../systems/saveSystem';
import { processEnemyTurns } from './enemyTurnAction';

const applyDamageToTarget = combatApplyDamageToTarget;

export const handleEndTurn = (state) => {
  let newPlayer = { ...state.player };
  let newEnemies = [...state.enemies];
  let newHand = [...state.hand];
  let newDiscardPile = [...state.discardPile];
  let newDrawPile = [...state.drawPile];
  let newExhaustPile = [...state.exhaustPile];
  let newRelics = [...state.relics];
  let combatLog = [...state.combatLog, '--- Enemy Turn ---'];

  // Apply turn end relic effects (Orichalcum, Incense Burner)
  const { effects: turnEndEffects, updatedRelics: turnEndRelics } = triggerRelics(newRelics, 'onTurnEnd', {
    playerBlock: newPlayer.block,
    turn: state.turn
  });
  newRelics = turnEndRelics;
  if (turnEndEffects.block > 0) {
    newPlayer.block += turnEndEffects.block;
    combatLog.push(`Relic granted ${turnEndEffects.block} Block`);
  }
  if (turnEndEffects.intangible > 0) {
    newPlayer.intangible = (newPlayer.intangible || 0) + turnEndEffects.intangible;
    combatLog.push('Gained Intangible');
  }

  // Orange Pellets: remove debuffs if all card types played
  const orangePellets = newRelics.find(r => r.id === 'orange_pellets');
  if (orangePellets && newPlayer.attacksPlayedThisTurn > 0 &&
      newPlayer.skillsPlayedThisTurn > 0 && newPlayer.powersPlayedThisTurn > 0) {
    newPlayer.vulnerable = 0;
    newPlayer.weak = 0;
    newPlayer.frail = 0;
    combatLog.push('Orange Pellets removed all debuffs!');
  }

  // Process Burn/Decay cards in hand (deal damage at end of turn)
  newHand.forEach(card => {
    if (card.special === 'burnDamage' || card.special === 'decayCurse') {
      const burnDamage = card.burnDamage || 2;
      newPlayer.currentHp = Math.max(0, newPlayer.currentHp - burnDamage);
      combatLog.push(`${card.name} dealt ${burnDamage} damage`);
    }
    if (card.special === 'regretCurse') {
      const regretDamage = newHand.length;
      newPlayer.currentHp = Math.max(0, newPlayer.currentHp - regretDamage);
      combatLog.push(`Regret dealt ${regretDamage} damage`);
    }
    if (card.special === 'doubtCurse') {
      newPlayer.weak++;
      combatLog.push('Doubt applied Weak');
    }
  });

  // Discard hand (retain cards stay, ethereal cards exhaust with triggers)
  const retainedCards = [];
  newHand.forEach(card => {
    if (card.retain) {
      retainedCards.push(card);
    } else if (card.ethereal) {
      newExhaustPile.push(card);
      combatLog.push(`${card.name} exhausted (Ethereal)`);
      // Trigger exhaust effects for ethereal cards
      if (newPlayer.darkEmbrace) {
        if (newDrawPile.length === 0 && newDiscardPile.length > 0) {
          newDrawPile = shuffleArray(newDiscardPile);
          newDiscardPile = [];
        }
        if (newDrawPile.length > 0) {
          retainedCards.push(newDrawPile.shift());
        }
      }
      if (newPlayer.feelNoPain > 0) {
        newPlayer.block += newPlayer.feelNoPain;
      }
      const deadBranch = newRelics.find(r => r.id === 'dead_branch');
      if (deadBranch) {
        const randomCard = getRandomCard();
        if (randomCard) {
          retainedCards.push({ ...randomCard, instanceId: `${randomCard.id}_branch_${Date.now()}_${Math.random()}` });
          combatLog.push(`Dead Branch added ${randomCard.name}`);
        }
      }
    } else {
      newDiscardPile.push(card);
    }
  });
  newHand = retainedCards;

  // Apply end of turn effects
  if (newPlayer.combust) {
    newPlayer.currentHp -= newPlayer.combust.hpLoss;
    // Rupture: gain strength when losing HP from Combust
    if (newPlayer.rupture > 0) {
      newPlayer.strength = (newPlayer.strength || 0) + newPlayer.rupture;
      combatLog.push(`Rupture granted ${newPlayer.rupture} Strength`);
    }
    newEnemies = newEnemies.map(enemy => {
      if (enemy.currentHp <= 0) return enemy;
      return applyDamageToTarget(enemy, newPlayer.combust.damage);
    });
    combatLog.push(`Combust dealt ${newPlayer.combust.damage} to all enemies`);
  }

  if (newPlayer.metallicize > 0) {
    newPlayer.block += newPlayer.metallicize;
    combatLog.push(`Metallicize granted ${newPlayer.metallicize} Block`);
  }

  // Reset turn-based effects
  newPlayer.rage = 0;
  // Flex: lose temporary strength
  if (newPlayer.flexStrengthLoss > 0) {
    newPlayer.strength -= newPlayer.flexStrengthLoss;
    combatLog.push(`Lost ${newPlayer.flexStrengthLoss} temporary Strength`);
    newPlayer.flexStrengthLoss = 0;
  }
  newPlayer.flameBarrier = 0;
  newPlayer.noDrawThisTurn = false;
  newPlayer.entangle = false;

  // Reset turn-based relic counters
  newRelics = newRelics.map(relic => {
    if (relic.resetOnTurnEnd && relic.counter !== undefined) {
      return { ...relic, counter: 0 };
    }
    return relic;
  });

  // Enemy turns
  const enemyResult = processEnemyTurns({
    newPlayer, newEnemies, newHand, newDrawPile, newDiscardPile, newRelics, combatLog
  });
  newPlayer = enemyResult.newPlayer;
  newEnemies = enemyResult.newEnemies;
  newHand = enemyResult.newHand;
  newDrawPile = enemyResult.newDrawPile;
  newDiscardPile = enemyResult.newDiscardPile;
  newRelics = enemyResult.newRelics;
  combatLog = enemyResult.combatLog;

  // Handle summons and splits after all enemies have acted
  let spawnedEnemies = [];
  newEnemies.forEach(enemy => {
    if (enemy._summonGremlins) {
      const timestamp = Date.now();
      const gremlin1 = createSummonedEnemy('gremlin', timestamp, 0);
      const gremlin2 = createSummonedEnemy('gremlin', timestamp, 1);
      if (gremlin1) {
        gremlin1.intentData = getEnemyIntent(gremlin1, 0);
        spawnedEnemies.push(gremlin1);
      }
      if (gremlin2) {
        gremlin2.intentData = getEnemyIntent(gremlin2, 0);
        spawnedEnemies.push(gremlin2);
      }
      delete enemy._summonGremlins;
    }
    if (enemy._summonDaggers) {
      const timestamp = Date.now();
      for (let i = 0; i < 2; i++) {
        const dagger = createSummonedEnemy('dagger', timestamp, i);
        if (dagger) {
          dagger.intentData = getEnemyIntent(dagger, 0);
          spawnedEnemies.push(dagger);
        }
      }
      delete enemy._summonDaggers;
    }
    if (enemy._splitBoss) {
      const spawns = createSplitSlimes(enemy, 'splitBoss');
      spawnedEnemies = [...spawnedEnemies, ...spawns];
      enemy.currentHp = 0; // Remove the boss
      delete enemy._splitBoss;
    }
    if (enemy._splitMedium) {
      const spawns = createSplitSlimes(enemy, 'splitMedium');
      spawnedEnemies = [...spawnedEnemies, ...spawns];
      enemy.currentHp = 0; // Remove the splitting slime
      delete enemy._splitMedium;
    }
  });

  // Check for sporeCloud deaths (Fungi Beast)
  newEnemies.forEach(enemy => {
    if (enemy.currentHp <= 0 && enemy.sporeCloud) {
      newPlayer.weak = (newPlayer.weak || 0) + 2;
      combatLog.push(`${enemy.name}'s Spore Cloud applied 2 Weak`);
    }
  });

  // Filter dead enemies and add spawns
  newEnemies = newEnemies.filter(e => e.currentHp > 0);
  newEnemies = [...newEnemies, ...spawnedEnemies];

  // Handle Gremlin Leader's buffGremlins - apply strength to all other enemies
  newEnemies.forEach(enemy => {
    if (enemy.intentData?.special === 'buffGremlins' && enemy.id === 'gremlinLeader') {
      const strengthBuff = enemy.intentData.effects?.[0]?.amount || 3;
      newEnemies.forEach(otherEnemy => {
        if (otherEnemy.instanceId !== enemy.instanceId && otherEnemy.currentHp > 0) {
          otherEnemy.strength = (otherEnemy.strength || 0) + strengthBuff;
        }
      });
    }
  });

  // Check player death
  if (newPlayer.currentHp <= 0) {
    // Check for Lizard Tail
    const lizardTailIdx = newRelics.findIndex(r => r.id === 'lizard_tail' && !r.used);
    if (lizardTailIdx >= 0) {
      newPlayer.currentHp = Math.floor(newPlayer.maxHp * 0.5);
      newRelics[lizardTailIdx] = { ...newRelics[lizardTailIdx], used: true };
      combatLog.push('Lizard Tail activated!');
    } else {
      // Delete save on game over
      deleteSave();
      return {
        ...state,
        phase: GAME_PHASE.GAME_OVER,
        player: newPlayer,
        relics: newRelics
      };
    }
  }

  // Check victory
  if (newEnemies.length === 0) {
    const goldReward = 10 + Math.floor(Math.random() * 15);
    const cardRewards = getCardRewards(3);

    const { effects: endEffects } = triggerRelics(newRelics, 'onCombatEnd', {
      playerHpPercent: newPlayer.currentHp / newPlayer.maxHp
    });
    newPlayer.currentHp = Math.min(newPlayer.maxHp, newPlayer.currentHp + endEffects.heal);

    const victoryState = {
      ...state,
      phase: GAME_PHASE.COMBAT_REWARD,
      player: newPlayer,
      enemies: newEnemies,
      relics: newRelics,
      combatLog,
      combatRewards: {
        gold: goldReward,
        cardRewards
      }
    };
    autoSave(victoryState);
    return victoryState;
  }

  // ========== START NEW PLAYER TURN ==========
  const newTurn = state.turn + 1;
  combatLog.push(`--- Turn ${newTurn + 1} ---`);

  // Remove block (unless Barricade)
  if (!newPlayer.barricade) {
    // Calipers: keep block minus 15
    const calipersRelic = newRelics.find(r => r.id === 'calipers');
    if (calipersRelic) {
      newPlayer.block = Math.max(0, newPlayer.block - 15);
    } else {
      newPlayer.block = 0;
    }
  }

  // Apply pending block from Self-Forming Clay
  if (newPlayer.pendingBlock > 0) {
    newPlayer.block += newPlayer.pendingBlock;
    combatLog.push(`Gained ${newPlayer.pendingBlock} Block from Self-Forming Clay`);
    newPlayer.pendingBlock = 0;
  }

  // Decrement intangible
  if (newPlayer.intangible > 0) newPlayer.intangible--;

  // Get passive relic effects for energy
  const passiveEffects = getPassiveRelicEffects(newRelics, {
    playerHpPercent: newPlayer.currentHp / newPlayer.maxHp
  });

  // Reset energy (with boss relic bonuses)
  if (passiveEffects.conserveEnergy) {
    // Ice Cream: unused energy carries over
    newPlayer.energy += newPlayer.maxEnergy + passiveEffects.extraEnergy;
  } else {
    newPlayer.energy = newPlayer.maxEnergy + passiveEffects.extraEnergy;
  }

  // Apply berserk
  if (newPlayer.berserk > 0) {
    newPlayer.energy += newPlayer.berserk;
  }

  // Apply demon form
  if (newPlayer.demonForm > 0) {
    newPlayer.strength += newPlayer.demonForm;
    combatLog.push(`Demon Form granted ${newPlayer.demonForm} Strength`);
  }

  // Apply brutality
  if (newPlayer.brutality) {
    newPlayer.currentHp = Math.max(1, newPlayer.currentHp - 1);
    // Rupture: gain strength when losing HP from Brutality
    if (newPlayer.rupture > 0) {
      newPlayer.strength = (newPlayer.strength || 0) + newPlayer.rupture;
      combatLog.push(`Rupture granted ${newPlayer.rupture} Strength`);
    }
  }

  // Apply regen (heal at turn start)
  if (newPlayer.regen > 0) {
    const healAmount = newPlayer.regen;
    newPlayer.currentHp = Math.min(newPlayer.maxHp, newPlayer.currentHp + healAmount);
    newPlayer.regen--;
    combatLog.push(`Regen healed ${healAmount} HP`);
  }

  // Apply plated armor (gain block at turn start)
  if (newPlayer.platedArmor > 0) {
    newPlayer.block += newPlayer.platedArmor;
    combatLog.push(`Plated Armor granted ${newPlayer.platedArmor} Block`);
  }

  // Decrement debuffs
  if (newPlayer.vulnerable > 0) newPlayer.vulnerable--;
  if (newPlayer.weak > 0) newPlayer.weak--;
  if (newPlayer.frail > 0) newPlayer.frail--;

  // Reset turn counters
  newPlayer.cardsPlayedThisTurn = 0;
  newPlayer.attacksPlayedThisTurn = 0;
  newPlayer.skillsPlayedThisTurn = 0;
  newPlayer.powersPlayedThisTurn = 0;

  // Apply turn start relic effects (Mercury Hourglass, Horn Cleat)
  const { effects: turnStartEffects, updatedRelics: turnStartRelics } = triggerRelics(newRelics, 'onTurnStart', {
    turn: newTurn
  });
  newRelics = turnStartRelics;

  if (turnStartEffects.block > 0) {
    newPlayer.block += turnStartEffects.block;
    combatLog.push(`Relic granted ${turnStartEffects.block} Block`);
  }
  if (turnStartEffects.damageAll > 0) {
    newEnemies = newEnemies.map(enemy => {
      if (enemy.currentHp <= 0) return enemy;
      return applyDamageToTarget(enemy, turnStartEffects.damageAll);
    });
    combatLog.push(`Mercury Hourglass dealt ${turnStartEffects.damageAll} to all enemies`);
  }

  // Lantern: +1 energy on first turn
  if (newTurn === 0) {
    const { effects: firstTurnEffects } = triggerRelics(newRelics, 'onFirstTurn', {});
    newPlayer.energy += firstTurnEffects.energy;
  }

  // Clear enemy block and decrement debuffs
  newEnemies = newEnemies.map(enemy => {
    const e = { ...enemy };
    // Barricade/retainBlock: don't clear block for enemies that retain it
    if (!e.barricade && !e.retainBlock) {
      e.block = 0;
    }
    if (e.vulnerable > 0) e.vulnerable--;
    if (e.weak > 0) e.weak--;
    if (e.ritual > 0) {
      e.strength = (e.strength || 0) + e.ritual;
      combatLog.push(`${e.name} gains ${e.ritual} Strength from Ritual`);
    }
    return e;
  });

  // Draw cards
  let drawCount = 5;
  if (newPlayer.brutality) drawCount++;
  drawCount += passiveEffects.extraDraw; // Snecko Eye, etc.
  // Apply draw reduction (Time Eater's Ripple)
  if (newPlayer.drawReduction > 0) {
    drawCount = Math.max(0, drawCount - newPlayer.drawReduction);
    newPlayer.drawReduction = 0; // Reset after applying
  }

  // Don't draw if noDrawNextTurn was set (Battle Trance)
  if (!newPlayer.noDrawNextTurn) {
    for (let i = 0; i < drawCount; i++) {
      if (newDrawPile.length === 0 && newDiscardPile.length > 0) {
        newDrawPile = shuffleArray(newDiscardPile);
        newDiscardPile = [];
      }
      if (newDrawPile.length > 0) {
        const drawnCard = newDrawPile.shift();
        newHand.push(drawnCard);

        // Handle draw triggers
        if (drawnCard.type === CARD_TYPES.STATUS && newPlayer.evolve > 0) {
          // Draw extra cards from Evolve
          for (let e = 0; e < newPlayer.evolve; e++) {
            if (newDrawPile.length === 0 && newDiscardPile.length > 0) {
              newDrawPile = shuffleArray(newDiscardPile);
              newDiscardPile = [];
            }
            if (newDrawPile.length > 0) {
              newHand.push(newDrawPile.shift());
            }
          }
          combatLog.push(`Evolve drew ${newPlayer.evolve} card(s)`);
        }

        // Fire Breathing: damage all on Status/Curse draw
        if ((drawnCard.type === CARD_TYPES.STATUS || drawnCard.type === CARD_TYPES.CURSE) && newPlayer.fireBreathing > 0) {
          newEnemies = newEnemies.map(enemy => {
            if (enemy.currentHp <= 0) return enemy;
            return applyDamageToTarget(enemy, newPlayer.fireBreathing);
          });
          combatLog.push(`Fire Breathing dealt ${newPlayer.fireBreathing} to all enemies`);
        }

        // Void card: lose energy when drawn
        if (drawnCard.special === 'voidCard') {
          newPlayer.energy = Math.max(0, newPlayer.energy - 1);
          combatLog.push('Void drained 1 Energy');
        }

        // Pain curse: lose 1 HP when drawn
        if (drawnCard.special === 'painCurse') {
          newPlayer.currentHp = Math.max(0, newPlayer.currentHp - 1);
          combatLog.push('Pain dealt 1 damage');
        }
      }
    }
  }
  newPlayer.noDrawNextTurn = false;

  // Set new enemy intents
  newEnemies = newEnemies.map((enemy, _i) => ({
    ...enemy,
    intentData: getEnemyIntent(enemy, newTurn)
  }));

  return {
    ...state,
    player: newPlayer,
    enemies: newEnemies,
    hand: newHand,
    discardPile: newDiscardPile,
    drawPile: newDrawPile,
    exhaustPile: newExhaustPile,
    relics: newRelics,
    turn: newTurn,
    combatLog
  };
};
