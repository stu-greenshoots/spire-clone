import { ALL_CARDS } from '../../../data/cards';
import { shuffleArray } from '../../../utils/mapGenerator';
import { applyDamageToTarget as combatApplyDamageToTarget } from '../../../systems/combatSystem';
import { triggerRelics } from '../../../systems/relicSystem';
import { audioManager, SOUNDS } from '../../../systems/audioSystem';

const applyDamageToTarget = combatApplyDamageToTarget;

/**
 * Processes all enemy actions during their turn.
 * Returns updated newPlayer, newEnemies, newHand, newDrawPile, newDiscardPile, newRelics, combatLog.
 */
export const processEnemyTurns = (ctx) => {
  let { newPlayer, newEnemies, newHand, newDrawPile, newDiscardPile, newRelics, combatLog } = ctx;

  newEnemies = newEnemies.map((enemy, _idx) => {
    if (enemy.currentHp <= 0) return enemy;

    const move = enemy.intentData;
    if (!move) return enemy;

    let newEnemy = { ...enemy };

    // Execute enemy action
    if (move.damage) {
      // Book of Stabbing: use escalating multiStabCount instead of static move.times
      // Blood Shots: add bloodShotsBonus extra hits each cycle
      let hits = (move.special === 'addStab' && newEnemy.multiStabCount)
        ? newEnemy.multiStabCount
        : (move.times || 1);
      if (move.special === 'bloodShotsEscalate' && newEnemy.bloodShotsBonus) {
        hits += newEnemy.bloodShotsBonus;
      }
      for (let h = 0; h < hits; h++) {
        let baseDamage = move.damage;
        // Handle damage ranges (e.g., {min: 5, max: 7})
        if (typeof baseDamage === 'object' && baseDamage.min !== undefined) {
          baseDamage = Math.floor(Math.random() * (baseDamage.max - baseDamage.min + 1)) + baseDamage.min;
        }
        let damage = baseDamage;
        damage += newEnemy.strength || 0;
        if (newEnemy.weak > 0) damage = Math.floor(damage * 0.75);
        if (newPlayer.vulnerable > 0) damage = Math.floor(damage * 1.5);

        // Wrath stance: player takes double damage
        if (newPlayer.currentStance === 'wrath') {
          damage *= 2;
        }

        // Flight: reduce damage by 50%, lose 1 stack
        if (newPlayer.flight > 0) {
          damage = Math.floor(damage / 2);
          newPlayer.flight--;
          combatLog.push('Flight reduced damage');
        }

        // Intangible: reduce all damage to 1
        if (newPlayer.intangible > 0) {
          damage = 1;
        }

        // Torii: reduce low damage (<=5) to 1
        const torii = newRelics.find(r => r.id === 'torii');
        if (torii && damage <= 5 && damage > 0) {
          damage = 1;
        }

        // Tungsten Rod: reduce HP loss by 1
        const tungstenRod = newRelics.find(r => r.id === 'tungsten_rod');

        // Apply flame barrier before taking damage
        if (newPlayer.flameBarrier > 0 && newEnemy.currentHp > 0) {
          newEnemy = applyDamageToTarget(newEnemy, newPlayer.flameBarrier);
          combatLog.push(`Flame Barrier dealt ${newPlayer.flameBarrier} back`);
        }

        // Bronze Scales (thorns)
        const bronzeScales = newRelics.find(r => r.id === 'bronze_scales');
        if (bronzeScales && newEnemy.currentHp > 0) {
          newEnemy = applyDamageToTarget(newEnemy, bronzeScales.effect.amount);
        }

        // Apply damage to player
        let hpLost = 0;
        if (newPlayer.block >= damage) {
          newPlayer.block -= damage;
        } else {
          let remainingDamage = damage - newPlayer.block;
          newPlayer.block = 0;

          // Tungsten Rod reduces HP loss
          if (tungstenRod && remainingDamage > 0) {
            remainingDamage = Math.max(0, remainingDamage - 1);
          }

          hpLost = remainingDamage;
          newPlayer.currentHp = Math.max(0, newPlayer.currentHp - remainingDamage);
        }

        // AR-07: Play enemy attack sound, heavy hit if > 15 damage
        audioManager.playSFX(SOUNDS.combat.enemyAttack, 'combat');
        if (hpLost > 15) {
          audioManager.playSFX(SOUNDS.combat.heavyHit, 'combat');
        } else if (hpLost > 0) {
          audioManager.playSFX(SOUNDS.combat.playerHurt, 'combat');
        }

        // Trigger onHpLoss relics
        if (hpLost > 0) {
          // Plated Armor: lose 1 stack when taking attack damage
          if (newPlayer.platedArmor > 0) {
            newPlayer.platedArmor--;
            combatLog.push('Plated Armor lost 1 stack');
          }

          // Self-Forming Clay: block next turn
          const selfFormingClay = newRelics.find(r => r.id === 'self_forming_clay');
          if (selfFormingClay) {
            newPlayer.pendingBlock = (newPlayer.pendingBlock || 0) + 3;
          }

          // Centennial Puzzle: draw 3 on first HP loss
          const { effects: hpLossEffects, updatedRelics: hpLossRelics } = triggerRelics(newRelics, 'onFirstHpLoss', {});
          newRelics = hpLossRelics;
          if (hpLossEffects.draw > 0) {
            for (let d = 0; d < hpLossEffects.draw; d++) {
              if (newDrawPile.length === 0 && newDiscardPile.length > 0) {
                newDrawPile = shuffleArray(newDiscardPile);
                newDiscardPile = [];
              }
              if (newDrawPile.length > 0) {
                newHand.push(newDrawPile.shift());
              }
            }
            combatLog.push(`Centennial Puzzle drew ${hpLossEffects.draw} cards`);
          }
        }

        // Lifesteal: enemy heals for unblocked damage dealt
        if (move.lifesteal && hpLost > 0 && newEnemy.currentHp > 0) {
          newEnemy.currentHp = Math.min(newEnemy.maxHp, newEnemy.currentHp + hpLost);
          combatLog.push(`${enemy.name} healed ${hpLost} HP from Lifesteal`);
        }

        combatLog.push(`${enemy.name} dealt ${damage} damage`);
      }
    }

    if (move.block) {
      newEnemy.block = (newEnemy.block || 0) + move.block;
    }

    if (move.effects) {
      move.effects.forEach(effect => {
        if (effect.target === 'player') {
          // Check artifact
          const isDebuff = ['weak', 'vulnerable', 'frail', 'strengthDown', 'dexterityDown', 'entangle', 'drawReduction', 'confused'].includes(effect.type);
          if (newPlayer.artifact > 0 && isDebuff) {
            newPlayer.artifact--;
            combatLog.push('Artifact blocked debuff');
          } else {
            if (effect.type === 'weak') newPlayer.weak += effect.amount;
            if (effect.type === 'vulnerable') newPlayer.vulnerable += effect.amount;
            if (effect.type === 'frail') newPlayer.frail += effect.amount;
            if (effect.type === 'entangle') newPlayer.entangle = true;
            if (effect.type === 'drawReduction') {
              newPlayer.drawReduction = (newPlayer.drawReduction || 0) + effect.amount;
            }
            if (effect.type === 'confused') {
              newPlayer.confused = (newPlayer.confused || 0) + effect.amount;
              combatLog.push('Applied Confused!');
            }
            if (effect.type === 'strengthDown') {
              newPlayer.strength = (newPlayer.strength || 0) - effect.amount;
            }
            if (effect.type === 'dexterityDown') {
              newPlayer.dexterity = (newPlayer.dexterity || 0) - effect.amount;
            }
          }
        } else {
          if (effect.type === 'strength') newEnemy.strength = (newEnemy.strength || 0) + effect.amount;
          if (effect.type === 'ritual') newEnemy.ritual = (newEnemy.ritual || 0) + effect.amount;
          if (effect.type === 'enrage') newEnemy.enrage = (newEnemy.enrage || 0) + effect.amount;
          if (effect.type === 'thorns') newEnemy.thorns = (newEnemy.thorns || 0) + effect.amount;
          if (effect.type === 'metallicize') newEnemy.metallicize = (newEnemy.metallicize || 0) + effect.amount;
          if (effect.type === 'artifact') newEnemy.artifact = (newEnemy.artifact || 0) + effect.amount;
        }
      });
    }

    // Handle enemy special actions
    if (move.special) {
      ({ newEnemy, newPlayer, newDrawPile, newDiscardPile, combatLog } = processEnemySpecial(
        move, newEnemy, enemy, newPlayer, newDrawPile, newDiscardPile, combatLog
      ));
    }

    // Nemesis intangible: gains intangible when using debilitate
    if (newEnemy.nemesisIntangible && move.id === 'debilitate') {
      newEnemy.intangible = 1;
      combatLog.push(`${enemy.name} becomes Intangible!`);
    }

    // Update last move
    newEnemy.lastMove = move;
    newEnemy.moveIndex = (newEnemy.moveIndex || 0) + 1;

    // Apply enemy metallicize (Lagavulin) - gain block each turn
    if (newEnemy.metallicize > 0 && newEnemy.currentHp > 0) {
      newEnemy.block = (newEnemy.block || 0) + newEnemy.metallicize;
      combatLog.push(`${enemy.name} gained ${newEnemy.metallicize} Block from Metallicize`);
    }

    // Apply enemy plated armor - gain block each turn (reduced by 1 on unblocked damage)
    if (newEnemy.platedArmor > 0 && newEnemy.currentHp > 0) {
      newEnemy.block = (newEnemy.block || 0) + newEnemy.platedArmor;
      combatLog.push(`${enemy.name} gained ${newEnemy.platedArmor} Block from Plated Armor`);
    }

    return newEnemy;
  });

  // Post-processing: handle healAlly flags (Mystic)
  newEnemies = newEnemies.map(enemy => {
    if (enemy._healAlly && enemy.currentHp > 0) {
      const healAmount = enemy._healAlly;
      // Find the lowest HP ally that isn't itself
      let lowestAlly = null;
      newEnemies.forEach((ally) => {
        if (ally.instanceId !== enemy.instanceId && ally.currentHp > 0 && ally.currentHp < ally.maxHp) {
          if (!lowestAlly || ally.currentHp < lowestAlly.currentHp) {
            lowestAlly = ally;
          }
        }
      });
      if (lowestAlly) {
        newEnemies = newEnemies.map(e =>
          e.instanceId === lowestAlly.instanceId
            ? { ...e, currentHp: Math.min(e.maxHp, e.currentHp + healAmount) }
            : e
        );
        combatLog.push(`${enemy.name} healed ${lowestAlly.name} for ${healAmount} HP`);
      }
      const { _healAlly, ...cleanEnemy } = enemy;
      return cleanEnemy;
    }
    return enemy;
  });

  // Post-processing: handle barricade (Spheric Guardian retains block)
  newEnemies = newEnemies.map(enemy => {
    if (enemy.barricade && enemy.currentHp > 0) {
      // barricade flag means block persists - nothing to do here since block is
      // cleared at start of enemy turn in processEnemyTurnStart
      // We need to flag it for the turn start processor
      return { ...enemy, retainBlock: true };
    }
    return enemy;
  });

  return { newPlayer, newEnemies, newHand, newDrawPile, newDiscardPile, newRelics, combatLog };
};

function processEnemySpecial(move, newEnemy, enemy, newPlayer, newDrawPile, newDiscardPile, combatLog) {
  // Add Slimed cards to discard
  if (move.special === 'addSlimed') {
    const slimed = ALL_CARDS.find(c => c.id === 'slimed');
    const count = move.amount || 1;
    for (let i = 0; i < count; i++) {
      newDiscardPile.push({ ...slimed, instanceId: `slimed_${Date.now()}_${i}` });
    }
    combatLog.push(`${enemy.name} added ${count} Slimed to discard`);
  }

  // Add Dazed cards to draw pile
  if (move.special === 'addDazed') {
    const dazed = ALL_CARDS.find(c => c.id === 'dazed');
    newDrawPile.push({ ...dazed, instanceId: `dazed_enemy_${Date.now()}` });
    newDrawPile = shuffleArray(newDrawPile);
    combatLog.push(`${enemy.name} added Dazed to draw pile`);
  }

  // Add Burn cards
  if (move.special === 'addBurn') {
    const burn = ALL_CARDS.find(c => c.id === 'burn');
    newDiscardPile.push({ ...burn, instanceId: `burn_enemy_${Date.now()}` });
    combatLog.push(`${enemy.name} added Burn to discard`);
  }

  // Add multiple burns (Hexaghost Inferno)
  if (move.special === 'addBurns') {
    const burn = ALL_CARDS.find(c => c.id === 'burn');
    for (let i = 0; i < 6; i++) {
      newDiscardPile.push({ ...burn, instanceId: `burn_inferno_${Date.now()}_${i}` });
    }
    combatLog.push(`${enemy.name} added 6 Burns to discard`);
  }

  // Steal gold
  if (move.special === 'stealGold') {
    const stolenAmount = Math.min(newPlayer.gold, 15);
    newPlayer.gold -= stolenAmount;
    newEnemy.stolenGold = (newEnemy.stolenGold || 0) + stolenAmount;
    combatLog.push(`${enemy.name} stole ${stolenAmount} gold!`);
  }

  // Escape from combat
  if (move.special === 'escape') {
    newEnemy.escaped = true;
    newEnemy.currentHp = 0; // Mark as removed
    combatLog.push(`${enemy.name} escaped!`);
  }

  // Kill self after attack (exploding enemies)
  if (move.special === 'killSelf') {
    newEnemy.currentHp = 0;
    combatLog.push(`${enemy.name} exploded!`);
  }

  // Remove debuffs (Champ, Time Eater)
  if (move.special === 'removeDebuffs') {
    newEnemy.vulnerable = 0;
    newEnemy.weak = 0;
    if (newEnemy.id === 'champ' || newEnemy.id === 'theChamp') {
      newEnemy.angered = true;
    }
    if (newEnemy.id === 'timeEater') {
      newEnemy.hasted = true;
    }
    combatLog.push(`${enemy.name} cleared all debuffs!`);
  }

  // Mode shift (Guardian)
  if (move.special === 'modeShift') {
    newEnemy.defensiveMode = !newEnemy.defensiveMode;
    combatLog.push(`${enemy.name} shifted modes!`);
  }

  // Giant Head count mechanic
  if (move.special === 'count') {
    newEnemy.slowCount = (newEnemy.slowCount || 0) + 1;
    const maxCount = newEnemy.slowCountMax || 4;
    if (newEnemy.slowCount >= maxCount) {
      combatLog.push(`${enemy.name} is fully charged!`);
    } else {
      combatLog.push(`${enemy.name} is counting... (${newEnemy.slowCount}/${maxCount})`);
    }
  }

  // Add Hex (Chosen)
  if (move.special === 'addHex') {
    newPlayer.hex = (newPlayer.hex || 0) + 1;
    combatLog.push(`${enemy.name} applied Hex!`);
  }

  // Add Parasite (Writhing Mass)
  if (move.special === 'addParasite') {
    const wound = ALL_CARDS.find(c => c.id === 'wound');
    newDrawPile.push({ ...wound, instanceId: `parasite_${Date.now()}` });
    newDrawPile = shuffleArray(newDrawPile);
    combatLog.push(`${enemy.name} implanted a parasite!`);
  }

  // Gain Flight (Byrd)
  if (move.special === 'gainFlight') {
    newEnemy.flight = (newEnemy.flight || 0) + 3;
    newEnemy.grounded = false;
    combatLog.push(`${enemy.name} took flight!`);
  }

  // Rebirth (Awakened One)
  if (move.special === 'rebirth') {
    newEnemy.reborn = true;
    newEnemy.currentHp = newEnemy.maxHp;
    newEnemy.strength = (newEnemy.strength || 0) + 2;
    newEnemy.vulnerable = 0;
    newEnemy.weak = 0;
    combatLog.push(`${enemy.name} has been reborn!`);
  }

  // Beat of Death (Corrupt Heart)
  if (move.special === 'beatOfDeath') {
    newEnemy.beatOfDeath = true;
    audioManager.playSFX(SOUNDS.combat.heartPhaseTransition, 'combat');
    combatLog.push(`${enemy.name}'s heart beats with deadly power!`);
  }

  // Blood Shots escalation (Corrupt Heart) — each cycle adds 1 hit
  if (move.special === 'bloodShotsEscalate') {
    newEnemy.bloodShotsBonus = (newEnemy.bloodShotsBonus || 0) + 1;
    audioManager.playSFX(SOUNDS.combat.heartbeat, 'combat');
    combatLog.push(`${enemy.name}'s Blood Shots intensify!`);
  }

  // Add Stab (Book of Stabbing escalation)
  if (move.special === 'addStab') {
    newEnemy.multiStabCount = (newEnemy.multiStabCount || 3) + (newEnemy.stabEscalation || 1);
    combatLog.push(`${enemy.name}'s stab count increased!`);
  }

  // Buff Gremlins (Gremlin Leader)
  if (move.special === 'buffGremlins') {
    combatLog.push(`${enemy.name} encouraged allies!`);
  }

  // Summon Gremlins (Gremlin Leader)
  if (move.special === 'summonGremlins') {
    newEnemy._summonGremlins = true;
    combatLog.push(`${enemy.name} rallied new gremlins!`);
  }

  // Summon Daggers (Reptomancer)
  if (move.special === 'summonDaggers') {
    newEnemy._summonDaggers = true;
    combatLog.push(`${enemy.name} summoned daggers!`);
  }

  // Split Boss (Slime Boss)
  if (move.special === 'splitBoss') {
    newEnemy.hasSplit = true;
    newEnemy._splitBoss = true;
    combatLog.push(`${enemy.name} split!`);
  }

  // Split Medium (Large Slime)
  if (move.special === 'splitMedium') {
    newEnemy.hasSplit = true;
    newEnemy._splitMedium = true;
    combatLog.push(`${enemy.name} split!`);
  }

  // Hexaghost activate
  if (move.special === 'activate') {
    newEnemy.activated = true;
    combatLog.push(`${enemy.name} is powering up!`);
  }

  // Hexaghost divider
  if (move.special === 'divider') {
    const dividerDamage = Math.floor(newPlayer.currentHp / 12) + 1;
    const dividerHits = 6;
    for (let d = 0; d < dividerHits; d++) {
      let dmg = dividerDamage + (newEnemy.strength || 0);
      if (newEnemy.weak > 0) dmg = Math.floor(dmg * 0.75);
      if (newPlayer.vulnerable > 0) dmg = Math.floor(dmg * 1.5);
      if (newPlayer.intangible > 0) dmg = 1;
      if (newPlayer.block >= dmg) {
        newPlayer.block -= dmg;
      } else {
        const rem = dmg - newPlayer.block;
        newPlayer.block = 0;
        newPlayer.currentHp = Math.max(0, newPlayer.currentHp - rem);
      }
    }
    combatLog.push(`${enemy.name} used Divider for ${dividerDamage} x ${dividerHits}!`);
  }

  // Hexaghost upgradeBurn
  if (move.special === 'upgradeBurn') {
    newDiscardPile = newDiscardPile.map(c => {
      if (c.id === 'burn' && !c.upgraded) {
        return { ...c, upgraded: true, burnDamage: 4, name: 'Burn+', description: 'Unplayable. At end of turn, take 4 damage.' };
      }
      return c;
    });
    combatLog.push(`${enemy.name} upgraded all Burns!`);
  }

  // Heal self (Shelled Parasite)
  if (move.special === 'healSelf') {
    const healAmount = move.healAmount || 5;
    newEnemy.currentHp = Math.min(newEnemy.maxHp, newEnemy.currentHp + healAmount);
    combatLog.push(`${enemy.name} healed ${healAmount} HP`);
  }

  // Heal ally (Mystic) - flag for post-processing
  if (move.special === 'healAlly') {
    newEnemy._healAlly = move.healAmount || 12;
    combatLog.push(`${enemy.name} is healing an ally!`);
  }

  // Corrupt Heart addStatus
  if (move.special === 'addStatus') {
    const statusCards = ['wound', 'dazed', 'burn', 'slimed'];
    const count = move.amount || 1;
    for (let i = 0; i < count; i++) {
      const statusId = statusCards[Math.floor(Math.random() * statusCards.length)];
      const statusCard = ALL_CARDS.find(c => c.id === statusId);
      if (statusCard) {
        newDrawPile.push({ ...statusCard, instanceId: `status_${statusId}_${Date.now()}_${i}` });
      }
    }
    newDrawPile = shuffleArray(newDrawPile);
    combatLog.push(`${enemy.name} added ${count} status card(s)!`);
  }

  return { newEnemy, newPlayer, newDrawPile, newDiscardPile, combatLog };
}
