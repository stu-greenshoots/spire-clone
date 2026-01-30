import { GAME_PHASE } from '../../GameContext';
import { ALL_CARDS, CARD_TYPES, getCardRewards, getRandomCard } from '../../../data/cards';
import { getRandomRelic, getBossRelic } from '../../../data/relics';
import { shuffleArray } from '../../../utils/mapGenerator';
import { calculateDamage, calculateBlock, applyDamageToTarget } from '../../../systems/combatSystem';
import { createSplitSlimes } from '../../../systems/enemySystem';
import { handleSpecialEffect, SUPPORTED_EFFECTS } from '../../../systems/cardEffects';
import { triggerRelics } from '../../../systems/relicSystem';
import { autoSave } from '../../../systems/saveSystem';
import { audioManager, SOUNDS } from '../../../systems/audioSystem';
import { getEffectiveCost } from '../../../systems/effectProcessor';

export const handlePlayCard = (state, action) => {
  const { card, targetId } = action.payload;
  // Resolve target by instanceId (fallback to first enemy if no target specified)
  const resolvedTargetId = targetId != null
    ? targetId
    : (state.enemies[0] && state.enemies[0].instanceId);

  const isXCost = card.cost === -1 || card.special === 'xCost';
  const effectiveCost = isXCost ? card.cost : getEffectiveCost(card, state.player);

  if (!isXCost && (state.player.energy < effectiveCost || card.unplayable)) {
    return { ...state, selectedCard: null, targetingMode: false };
  }

  // Play card sound
  audioManager.playSFX(SOUNDS.combat.cardPlay, 'combat');

  // For X-cost cards, don't deduct energy here (done in xCost special handler)
  let newPlayer = { ...state.player, energy: isXCost ? state.player.energy : state.player.energy - effectiveCost };
  let newEnemies = [...state.enemies];
  let newHand = state.hand.filter(c => c.instanceId !== card.instanceId);
  let newDiscardPile = [...state.discardPile];
  let newExhaustPile = [...state.exhaustPile];
  let newDrawPile = [...state.drawPile];
  let combatLog = [...state.combatLog];

  // Initialize runStats tracking
  let newRunStats = {
    ...(state.runStats || {}),
    cardsPlayed: (state.runStats?.cardsPlayed || 0) + 1,
    cardsPlayedById: { ...(state.runStats?.cardsPlayedById || {}) },
    damageDealt: state.runStats?.damageDealt || 0,
    enemiesKilled: state.runStats?.enemiesKilled || 0,
    defeatedEnemies: [...(state.runStats?.defeatedEnemies || [])],
    goldEarned: state.runStats?.goldEarned || 0,
    floor: state.currentFloor + 1
  };

  // Track card played by ID
  newRunStats.cardsPlayedById[card.id] = (newRunStats.cardsPlayedById[card.id] || 0) + 1;

  // Track card plays
  newPlayer.cardsPlayedThisTurn++;
  if (card.type === CARD_TYPES.ATTACK) newPlayer.attacksPlayedThisTurn++;
  if (card.type === CARD_TYPES.SKILL) newPlayer.skillsPlayedThisTurn++;
  if (card.type === CARD_TYPES.POWER) newPlayer.powersPlayedThisTurn++;

  // Gremlin Nob's Enrage: gain strength when player plays a Skill
  if (card.type === CARD_TYPES.SKILL) {
    newEnemies = newEnemies.map(enemy => {
      if (enemy.enrage > 0 && enemy.currentHp > 0) {
        combatLog.push(`${enemy.name} gained ${enemy.enrage} Strength from Enrage!`);
        return { ...enemy, strength: (enemy.strength || 0) + enemy.enrage };
      }
      return enemy;
    });
  }

  // Hex: add Dazed when playing non-attack
  if (newPlayer.hex > 0 && card.type !== CARD_TYPES.ATTACK) {
    const dazed = ALL_CARDS.find(c => c.id === 'dazed');
    for (let i = 0; i < newPlayer.hex; i++) {
      newDrawPile.push({ ...dazed, instanceId: `dazed_hex_${Date.now()}_${i}` });
    }
    newDrawPile = shuffleArray(newDrawPile);
    combatLog.push(`Hex added ${newPlayer.hex} Dazed to draw pile`);
  }

  // Apply rage (gain block on attack)
  if (card.type === CARD_TYPES.ATTACK && newPlayer.rage > 0) {
    newPlayer.block += newPlayer.rage;
  }

  // Process card effects
  // Skip normal damage for cards that handle their own damage in special effects
  const selfDamageSpecials = ['xCost', 'bonusPerStrike', 'bonusPerStrike3', 'damageEqualBlock', 'exhaustHandDamage', 'lifesteal', 'multiUpgrade'];
  if (card.damage && !selfDamageSpecials.includes(card.special)) {
    const hits = card.hits || 1;
    const baseDamage = typeof card.damage === 'object'
      ? Math.floor(Math.random() * (card.damage.max - card.damage.min + 1)) + card.damage.min
      : card.damage;

    // Get damage options
    const damageOptions = {
      strengthMultiplier: card.strengthMultiplier || 1,
      relics: state.relics,
      doubleDamage: newPlayer.doubleTap > 0 || newPlayer.penNibActive
    };

    // Consume double tap
    if (card.type === CARD_TYPES.ATTACK && newPlayer.doubleTap > 0) {
      newPlayer.doubleTap--;
    }

    for (let h = 0; h < hits; h++) {
      if (card.targetAll) {
        newEnemies = newEnemies.map(enemy => {
          if (enemy.currentHp <= 0) return enemy;
          const damage = calculateDamage(baseDamage, newPlayer, enemy, damageOptions);
          newRunStats.damageDealt += damage; // Track damage dealt
          const result = applyDamageToTarget(enemy, damage);
          combatLog.push(`Dealt ${damage} damage to ${enemy.name}`);
          if (enemy.thorns > 0) {
            const thornsDmg = enemy.thorns;
            if (newPlayer.block >= thornsDmg) {
              newPlayer.block -= thornsDmg;
            } else {
              const tRem = thornsDmg - newPlayer.block;
              newPlayer.block = 0;
              newPlayer.currentHp = Math.max(0, newPlayer.currentHp - tRem);
            }
            combatLog.push(`Thorns dealt ${thornsDmg} damage back`);
          }
          return result;
        });
      } else if (card.randomTarget) {
        const aliveEnemies = newEnemies.filter(e => e.currentHp > 0);
        if (aliveEnemies.length > 0) {
          const randomIdx = Math.floor(Math.random() * aliveEnemies.length);
          const targetEnemy = aliveEnemies[randomIdx];
          const damage = calculateDamage(baseDamage, newPlayer, targetEnemy, damageOptions);
          newRunStats.damageDealt += damage; // Track damage dealt
          newEnemies = newEnemies.map(e =>
            e.instanceId === targetEnemy.instanceId ? applyDamageToTarget(e, damage) : e
          );
          combatLog.push(`Dealt ${damage} damage to ${targetEnemy.name}`);
          if (targetEnemy.thorns > 0) {
            const thornsDmg = targetEnemy.thorns;
            if (newPlayer.block >= thornsDmg) {
              newPlayer.block -= thornsDmg;
            } else {
              const tRem = thornsDmg - newPlayer.block;
              newPlayer.block = 0;
              newPlayer.currentHp = Math.max(0, newPlayer.currentHp - tRem);
            }
            combatLog.push(`Thorns dealt ${thornsDmg} damage back`);
          }
        }
      } else {
        const enemy = newEnemies.find(e => e.instanceId === resolvedTargetId);
        if (enemy && enemy.currentHp > 0) {
          const damage = calculateDamage(baseDamage, newPlayer, enemy, damageOptions);
          newRunStats.damageDealt += damage; // Track damage dealt
          newEnemies = newEnemies.map(e =>
            e.instanceId === resolvedTargetId ? applyDamageToTarget(e, damage) : e
          );
          combatLog.push(`Dealt ${damage} damage to ${enemy.name}`);
          if (enemy.thorns > 0) {
            const thornsDmg = enemy.thorns;
            if (newPlayer.block >= thornsDmg) {
              newPlayer.block -= thornsDmg;
            } else {
              const tRem = thornsDmg - newPlayer.block;
              newPlayer.block = 0;
              newPlayer.currentHp = Math.max(0, newPlayer.currentHp - tRem);
            }
            combatLog.push(`Thorns dealt ${thornsDmg} damage back`);
          }
        }
      }
    }

    // Play attack sound
    audioManager.playSFX(SOUNDS.combat.attack, 'combat');

    // Reset pen nib after use
    newPlayer.penNibActive = false;
  }

  if (card.block) {
    const block = calculateBlock(card.block, newPlayer);
    newPlayer.block += block;
    combatLog.push(`Gained ${block} Block`);
    audioManager.playSFX(SOUNDS.combat.block, 'combat');

    // Juggernaut: deal damage when gaining block
    if (newPlayer.juggernaut > 0) {
      const aliveEnemies = newEnemies.filter(e => e.currentHp > 0);
      if (aliveEnemies.length > 0) {
        const randomIdx = Math.floor(Math.random() * aliveEnemies.length);
        const jugTarget = aliveEnemies[randomIdx];
        newEnemies = newEnemies.map(e =>
          e.instanceId === jugTarget.instanceId ? applyDamageToTarget(e, newPlayer.juggernaut) : e
        );
      }
    }
  }

  if (card.effects) {
    card.effects.forEach(effect => {
      if (effect.self) {
        if (effect.type === 'vulnerable') newPlayer.vulnerable += effect.amount;
        if (effect.type === 'weak') newPlayer.weak += effect.amount;
        if (effect.type === 'strength') newPlayer.strength += effect.amount;
      } else if (card.targetAll || effect.target === 'player') {
        if (effect.target === 'player') {
          if (effect.type === 'weak') newPlayer.weak += effect.amount;
          if (effect.type === 'vulnerable') newPlayer.vulnerable += effect.amount;
          if (effect.type === 'frail') newPlayer.frail += effect.amount;
          if (effect.type === 'strength') newPlayer.strength += effect.amount;
        } else {
          newEnemies = newEnemies.map(enemy => {
            if (enemy.currentHp <= 0) return enemy;
            const newEnemy = { ...enemy };
            const isEnemyDebuff = ['vulnerable', 'weak', 'strengthDown'].includes(effect.type);
            if (isEnemyDebuff && newEnemy.artifact > 0) {
              newEnemy.artifact--;
              combatLog.push(`${enemy.name}'s Artifact blocked ${effect.type}!`);
              return newEnemy;
            }
            if (effect.type === 'vulnerable') newEnemy.vulnerable = (newEnemy.vulnerable || 0) + effect.amount;
            if (effect.type === 'weak') newEnemy.weak = (newEnemy.weak || 0) + effect.amount;
            if (effect.type === 'strengthDown') newEnemy.strength = (newEnemy.strength || 0) - effect.amount;
            combatLog.push(`Applied ${effect.amount} ${effect.type} to ${enemy.name}`);
            return newEnemy;
          });
        }
      } else {
        const enemy = newEnemies.find(e => e.instanceId === resolvedTargetId);
        if (enemy && enemy.currentHp > 0) {
          const isEnemyDebuff = ['vulnerable', 'weak', 'strengthDown'].includes(effect.type);
          newEnemies = newEnemies.map(e => {
            if (e.instanceId !== resolvedTargetId) return e;
            const updated = { ...e };
            if (isEnemyDebuff && updated.artifact > 0) {
              updated.artifact--;
              combatLog.push(`${e.name}'s Artifact blocked ${effect.type}!`);
            } else {
              if (effect.type === 'vulnerable') updated.vulnerable = (updated.vulnerable || 0) + effect.amount;
              if (effect.type === 'weak') updated.weak = (updated.weak || 0) + effect.amount;
              if (effect.type === 'strengthDown') updated.strength = (updated.strength || 0) - effect.amount;
              combatLog.push(`Applied ${effect.amount} ${effect.type} to ${e.name}`);
            }
            return updated;
          });
        }
      }
    });
  }

  if (card.draw && !newPlayer.noDrawThisTurn) {
    for (let i = 0; i < card.draw; i++) {
      if (newDrawPile.length === 0 && newDiscardPile.length > 0) {
        newDrawPile = shuffleArray(newDiscardPile);
        newDiscardPile = [];
      }
      if (newDrawPile.length > 0) {
        newHand.push(newDrawPile.shift());
      }
    }
    combatLog.push(`Drew ${card.draw} card(s)`);
  }

  if (card.energy) {
    newPlayer.energy += card.energy;
    combatLog.push(`Gained ${card.energy} Energy`);
  }

  if (card.hpCost) {
    newPlayer.currentHp = Math.max(1, newPlayer.currentHp - card.hpCost);
    combatLog.push(`Lost ${card.hpCost} HP`);
    // Rupture: gain strength when losing HP from card costs
    if (newPlayer.rupture > 0) {
      newPlayer.strength = (newPlayer.strength || 0) + newPlayer.rupture;
      combatLog.push(`Rupture granted ${newPlayer.rupture} Strength`);
    }
  }

  // Handle special effects via cardEffects system
  if (card.special && SUPPORTED_EFFECTS.includes(card.special)) {
    const effectCtx = {
      player: newPlayer,
      enemies: newEnemies,
      hand: newHand,
      drawPile: newDrawPile,
      discardPile: newDiscardPile,
      exhaustPile: newExhaustPile,
      combatLog,
      targetId: resolvedTargetId,
      get targetIndex() { return this.enemies.findIndex(e => e.instanceId === resolvedTargetId); },
      relics: state.relics,
      deck: state.deck,
      state,
      GAME_PHASE
    };

    const result = handleSpecialEffect(card.special, card, effectCtx);

    if (result && result.earlyReturn) {
      return result.earlyReturnState;
    }

    // Extract updated state from context (arrays may have been reassigned)
    newPlayer = effectCtx.player;
    newEnemies = effectCtx.enemies;
    newHand = effectCtx.hand;
    newDrawPile = effectCtx.drawPile;
    newDiscardPile = effectCtx.discardPile;
    newExhaustPile = effectCtx.exhaustPile;
    combatLog = effectCtx.combatLog;
  }

  // Beat of Death: Corrupt Heart deals damage when cards are played
  const heartEnemy = newEnemies.find(e => e.beatOfDeath && e.currentHp > 0);
  if (heartEnemy) {
    const beatDamage = 1;
    if (newPlayer.block >= beatDamage) {
      newPlayer.block -= beatDamage;
    } else {
      const remaining = beatDamage - newPlayer.block;
      newPlayer.block = 0;
      newPlayer.currentHp = Math.max(0, newPlayer.currentHp - remaining);
    }
    combatLog.push('Beat of Death dealt 1 damage');
  }

  // Awakened One: gains strength when a Power is played
  if (card.type === CARD_TYPES.POWER) {
    newEnemies = newEnemies.map(enemy => {
      if (enemy.curious && enemy.currentHp > 0) {
        const newEnemy = { ...enemy };
        newEnemy.strength = (newEnemy.strength || 0) + 2;
        combatLog.push(`${enemy.name} gained 2 Strength from Power played!`);
        return newEnemy;
      }
      return enemy;
    });
  }

  // Time Eater: count cards played, end turn at 12
  const timeEaterEnemy = newEnemies.find(e => e.onCardPlayed && e.currentHp > 0);
  if (timeEaterEnemy) {
    const result = timeEaterEnemy.onCardPlayed(timeEaterEnemy);
    if (result && result.endTurn) {
      combatLog.push('Time Eater ended your turn!');
      // Heal Time Eater
      if (result.heal) {
        newEnemies = newEnemies.map(e =>
          e.instanceId === timeEaterEnemy.instanceId
            ? { ...e, currentHp: Math.min(e.maxHp, e.currentHp + Math.floor(e.maxHp * 0.02)) }
            : e
        );
      }
      // Discard remaining hand
      newHand.forEach(c => newDiscardPile.push(c));
      newHand = [];
      // Set energy to 0 to prevent further card plays
      newPlayer.energy = 0;
    }
  }

  // Trigger relic effects for card plays
  let relicsUpdated = [...state.relics];
  if (card.type === CARD_TYPES.ATTACK) {
    const { effects, updatedRelics } = triggerRelics(relicsUpdated, 'onAttackPlayed', { turn: state.turn });
    relicsUpdated = updatedRelics;
    if (effects.energy > 0) newPlayer.energy += effects.energy;
    if (effects.strength > 0) newPlayer.strength += effects.strength;
    if (effects.dexterity > 0) newPlayer.dexterity += effects.dexterity;
    if (effects.block > 0) newPlayer.block += effects.block;
    if (effects.doubleDamage) newPlayer.penNibActive = true;
  }
  if (card.type === CARD_TYPES.SKILL) {
    const { effects, updatedRelics } = triggerRelics(relicsUpdated, 'onSkillPlayed', { turn: state.turn });
    relicsUpdated = updatedRelics;
    if (effects.damageAll > 0) {
      newEnemies = newEnemies.map(enemy => {
        if (enemy.currentHp <= 0) return enemy;
        return applyDamageToTarget(enemy, effects.damageAll);
      });
    }
  }
  // Check for Strike cards (Strike Dummy relic)
  if (card.name.toLowerCase().includes('strike')) {
    const { effects, updatedRelics } = triggerRelics(relicsUpdated, 'onStrikePlayed', {});
    relicsUpdated = updatedRelics;
    if (effects.damage > 0) {
      newEnemies = newEnemies.map(e =>
        e.instanceId === resolvedTargetId ? applyDamageToTarget(e, effects.damage) : e
      );
    }
  }

  // Corruption: Skills cost 0 and exhaust
  if (newPlayer.corruption && card.type === CARD_TYPES.SKILL) {
    newPlayer.energy += effectiveCost; // Refund cost
  }

  // Handle exhaust
  if (card.exhaust || (newPlayer.corruption && card.type === CARD_TYPES.SKILL)) {
    newExhaustPile.push(card);

    // Sentinel: gain energy when exhausted
    if (card._sentinelEnergy) {
      newPlayer.energy += card._sentinelEnergy;
      combatLog.push(`Sentinel granted ${card._sentinelEnergy} Energy`);
    }

    // Dark Embrace: draw on exhaust
    if (newPlayer.darkEmbrace) {
      if (newDrawPile.length === 0 && newDiscardPile.length > 0) {
        newDrawPile = shuffleArray(newDiscardPile);
        newDiscardPile = [];
      }
      if (newDrawPile.length > 0) {
        newHand.push(newDrawPile.shift());
      }
    }

    // Feel No Pain: block on exhaust
    if (newPlayer.feelNoPain > 0) {
      newPlayer.block += newPlayer.feelNoPain;
    }

    // Dead Branch relic: add random card on exhaust
    const deadBranch = relicsUpdated.find(r => r.id === 'dead_branch');
    if (deadBranch) {
      const randomCard = getRandomCard();
      if (randomCard) {
        newHand.push({ ...randomCard, instanceId: `${randomCard.id}_branch_${Date.now()}` });
        combatLog.push(`Dead Branch added ${randomCard.name}`);
      }
    }
  } else if (card.type !== CARD_TYPES.POWER) {
    // Power cards are removed from play entirely (not discarded, not exhausted)
    newDiscardPile.push(card);
  }

  // Wake up sleeping enemies that were attacked (Lagavulin)
  newEnemies = newEnemies.map(enemy => {
    if (enemy.asleep && enemy.currentHp < enemy.maxHp && !enemy.wokenUp) {
      return { ...enemy, wokenUp: true, asleep: false };
    }
    return enemy;
  });

  // Awakened One rebirth: prevent death if not yet reborn
  newEnemies = newEnemies.map(enemy => {
    if (enemy.currentHp <= 0 && enemy.canRebirth && !enemy.reborn) {
      return {
        ...enemy,
        currentHp: enemy.maxHp,
        reborn: true,
        strength: (enemy.strength || 0) + 2,
        vulnerable: 0,
        weak: 0,
        moveIndex: 0
      };
    }
    return enemy;
  });

  // Check for enemy deaths and handle splits/spawns
  const dyingEnemies = newEnemies.filter(e => e.currentHp <= 0);
  let spawnedEnemies = [];

  dyingEnemies.forEach(enemy => {
    // Track enemy kills for run stats
    newRunStats.enemiesKilled++;
    if (!newRunStats.defeatedEnemies.includes(enemy.id)) {
      newRunStats.defeatedEnemies.push(enemy.id);
    }

    // Handle slime splits
    if (enemy.onDeath && enemy.onDeath.startsWith('split') && !enemy.hasSplit) {
      const spawns = createSplitSlimes(enemy, enemy.onDeath);
      spawnedEnemies = [...spawnedEnemies, ...spawns];
      combatLog.push(`${enemy.name} split into smaller slimes!`);
    }
    // Fungi Beast: apply Weak on death
    if (enemy.sporeCloud) {
      newPlayer.weak = (newPlayer.weak || 0) + 2;
      combatLog.push(`${enemy.name}'s Spore Cloud applied 2 Weak`);
    }
  });

  newEnemies = newEnemies.filter(e => e.currentHp > 0);
  newEnemies = [...newEnemies, ...spawnedEnemies];

  // Check victory
  if (newEnemies.length === 0) {
    const goldReward = 10 + Math.floor(Math.random() * 15) +
      (state.currentNode?.type === 'elite' ? 25 : 0) +
      (state.currentNode?.type === 'boss' ? 50 : 0);

    // Apply combat end relics
    const { effects: endEffects } = triggerRelics(relicsUpdated, 'onCombatEnd', {
      playerHpPercent: newPlayer.currentHp / newPlayer.maxHp
    });
    newPlayer.currentHp = Math.min(newPlayer.maxHp, newPlayer.currentHp + endEffects.heal);

    const cardRewards = getCardRewards(3);
    let relicReward = null;
    if (state.currentNode?.type === 'elite' || state.currentNode?.type === 'boss') {
      relicReward = state.currentNode?.type === 'boss'
        ? getBossRelic(state.relics.map(r => r.id))
        : getRandomRelic(null, state.relics.map(r => r.id));
    }

    // Track gold earned in run stats
    newRunStats.goldEarned += goldReward;

    const victoryState = {
      ...state,
      phase: GAME_PHASE.COMBAT_REWARD,
      player: newPlayer,
      enemies: newEnemies,
      hand: newHand,
      discardPile: newDiscardPile,
      exhaustPile: newExhaustPile,
      drawPile: newDrawPile,
      relics: relicsUpdated,
      selectedCard: null,
      targetingMode: false,
      combatLog,
      runStats: newRunStats,
      combatRewards: {
        gold: goldReward,
        cardRewards,
        relicReward
      }
    };
    autoSave(victoryState);
    return victoryState;
  }

  return {
    ...state,
    player: newPlayer,
    enemies: newEnemies,
    hand: newHand,
    discardPile: newDiscardPile,
    exhaustPile: newExhaustPile,
    drawPile: newDrawPile,
    relics: relicsUpdated,
    selectedCard: null,
    targetingMode: false,
    combatLog,
    runStats: newRunStats
  };
};
