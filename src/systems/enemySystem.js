/**
 * Enemy System
 *
 * Handles enemy spawning, AI intent selection, and enemy-specific mechanics
 * like slime splitting and summoning.
 *
 * @module systems/enemySystem
 */

import { INTENT } from '../data/enemies';

/**
 * Gets the next intent for an enemy based on their AI function
 *
 * @param {Object} enemy - The enemy object
 * @param {number} turn - Current turn number
 * @returns {Object} The intent/move object
 */
export const getEnemyIntent = (enemy, turn) => {
  if (enemy.ai) {
    return enemy.ai(enemy, turn, enemy.lastMove, enemy.moveIndex);
  }
  return enemy.moveset[0];
};

/**
 * Creates split slimes when a slime dies
 *
 * @param {Object} parentEnemy - The slime that is splitting
 * @param {string} splitType - Type of split ('splitSmall', 'splitSmallSpike', 'splitMedium', 'splitBoss')
 * @returns {Array} Array of newly spawned slime enemies
 */
export const createSplitSlimes = (parentEnemy, splitType) => {
  const spawns = [];
  const timestamp = Date.now();

  if (splitType === 'splitSmall') {
    // Acid Slime (M) splits into 2 Acid Slime (S)
    for (let i = 0; i < 2; i++) {
      spawns.push({
        id: 'slime_small',
        name: 'Acid Slime (S)',
        emoji: '🟢',
        maxHp: Math.floor(Math.random() * 5) + 8,
        currentHp: Math.floor(Math.random() * 5) + 8,
        block: 0,
        instanceId: `slime_small_${timestamp}_${i}`,
        moveset: [
          { id: 'lick', intent: INTENT.DEBUFF, effects: [{ type: 'weak', amount: 1, target: 'player' }], message: 'Lick' },
          { id: 'tackle', intent: INTENT.ATTACK, damage: 3, message: 'Tackle' }
        ],
        ai: (enemy, _turn, lastMove) => {
          if (Math.random() < 0.5 && lastMove?.id !== 'lick') return enemy.moveset[0];
          return enemy.moveset[1];
        }
      });
    }
  } else if (splitType === 'splitSmallSpike') {
    // Spike Slime (M) splits into 2 Spike Slime (S)
    for (let i = 0; i < 2; i++) {
      spawns.push({
        id: 'spike_slime_small',
        name: 'Spike Slime (S)',
        emoji: '🔵',
        maxHp: Math.floor(Math.random() * 5) + 10,
        currentHp: Math.floor(Math.random() * 5) + 10,
        block: 0,
        instanceId: `spike_slime_small_${timestamp}_${i}`,
        moveset: [
          { id: 'tackle', intent: INTENT.ATTACK, damage: 5, message: 'Tackle' }
        ],
        ai: () => ({ id: 'tackle', intent: INTENT.ATTACK, damage: 5, message: 'Tackle' })
      });
    }
  } else if (splitType === 'splitMedium') {
    // Large Slime splits into 2 medium slimes
    for (let i = 0; i < 2; i++) {
      const hp = Math.floor(parentEnemy.currentHp / 2);
      spawns.push({
        id: 'slime_medium',
        name: 'Acid Slime (M)',
        emoji: '🟢',
        maxHp: hp,
        currentHp: hp,
        block: 0,
        instanceId: `slime_medium_${timestamp}_${i}`,
        onDeath: 'splitSmall',
        moveset: [
          { id: 'corrosiveSpit', intent: INTENT.ATTACK_DEBUFF, damage: 7, special: 'addSlimed', message: 'Corrosive Spit' },
          { id: 'lick', intent: INTENT.DEBUFF, effects: [{ type: 'weak', amount: 1, target: 'player' }], message: 'Lick' },
          { id: 'tackle', intent: INTENT.ATTACK, damage: 10, message: 'Tackle' }
        ],
        ai: (enemy, _turn, lastMove) => {
          const roll = Math.random();
          if (roll < 0.4 && lastMove?.id !== 'corrosiveSpit') return enemy.moveset[0];
          if (roll < 0.7 && lastMove?.id !== 'lick') return enemy.moveset[1];
          return enemy.moveset[2];
        }
      });
    }
  } else if (splitType === 'splitBoss') {
    // Slime Boss splits into 2 large slimes
    const hp = Math.floor(parentEnemy.currentHp / 2);
    for (let i = 0; i < 2; i++) {
      spawns.push({
        id: 'slime_large_split',
        name: i === 0 ? 'Acid Slime (L)' : 'Spike Slime (L)',
        emoji: i === 0 ? '🟢' : '🔵',
        maxHp: hp,
        currentHp: hp,
        block: 0,
        instanceId: `slime_boss_split_${timestamp}_${i}`,
        moveset: i === 0 ? [
          { id: 'corrosiveSpit', intent: INTENT.ATTACK_DEBUFF, damage: 12, special: 'addSlimed', message: 'Corrosive Spit' },
          { id: 'lick', intent: INTENT.DEBUFF, effects: [{ type: 'weak', amount: 2, target: 'player' }], message: 'Lick' },
          { id: 'tackle', intent: INTENT.ATTACK, damage: 18, message: 'Tackle' }
        ] : [
          { id: 'flameTackle', intent: INTENT.ATTACK, damage: 16, special: 'addSlimed', message: 'Flame Tackle' },
          { id: 'lick', intent: INTENT.DEBUFF, effects: [{ type: 'frail', amount: 2, target: 'player' }], message: 'Lick' }
        ],
        ai: (enemy, _turn, lastMove) => {
          const roll = Math.random();
          if (roll < 0.5 && lastMove?.id !== enemy.moveset[0].id) return enemy.moveset[0];
          if (enemy.moveset.length > 1 && roll < 0.8) return enemy.moveset[1];
          return enemy.moveset[enemy.moveset.length - 1];
        }
      });
    }
  }

  // Set intents for spawned enemies
  spawns.forEach(spawn => {
    spawn.intentData = getEnemyIntent(spawn, 0);
    spawn.moveIndex = 0;
  });

  return spawns;
};

/**
 * Creates a summoned enemy (daggers, gremlins, etc.)
 *
 * @param {string} type - Type of enemy to summon ('dagger', 'gremlin')
 * @param {number} timestamp - Timestamp for unique ID generation
 * @param {number} [index=0] - Index for multiple summons
 * @returns {Object|null} The summoned enemy object or null if invalid type
 */
export const createSummonedEnemy = (type, timestamp, index = 0) => {
  if (type === 'dagger') {
    return {
      id: 'dagger',
      name: 'Dagger',
      emoji: '🗡️',
      maxHp: Math.floor(Math.random() * 6) + 20,
      currentHp: Math.floor(Math.random() * 6) + 20,
      block: 0,
      instanceId: `dagger_${timestamp}_${index}`,
      moveset: [
        { id: 'stab', intent: INTENT.ATTACK, damage: 9, message: 'Stab' },
        { id: 'explode', intent: INTENT.ATTACK, damage: 25, special: 'killSelf', message: 'Explode' }
      ],
      ai: (enemy, turn) => {
        if (turn >= 2) return enemy.moveset[1];
        return enemy.moveset[0];
      }
    };
  }
  if (type === 'gremlin') {
    const types = ['mad', 'sneaky', 'fat', 'wizard', 'shield'];
    const gType = types[Math.floor(Math.random() * types.length)];
    const base = {
      id: `gremlin_${gType}`,
      name: `Gremlin ${gType.charAt(0).toUpperCase() + gType.slice(1)}`,
      emoji: '👺',
      maxHp: Math.floor(Math.random() * 8) + 12,
      block: 0,
      instanceId: `gremlin_${gType}_${timestamp}_${index}`
    };
    base.currentHp = base.maxHp;

    if (gType === 'mad') {
      base.moveset = [{ id: 'scratch', intent: INTENT.ATTACK, damage: 4, message: 'Scratch' }];
    } else if (gType === 'sneaky') {
      base.moveset = [{ id: 'puncture', intent: INTENT.ATTACK, damage: 9, message: 'Puncture' }];
    } else if (gType === 'fat') {
      base.moveset = [
        { id: 'smash', intent: INTENT.ATTACK, damage: 4, message: 'Smash' },
        { id: 'shield', intent: INTENT.DEFEND_BUFF, block: 6, effects: [{ type: 'weak', amount: 1, target: 'player' }], message: 'Shield Bash' }
      ];
    } else if (gType === 'wizard') {
      base.moveset = [
        { id: 'charge', intent: INTENT.BUFF, message: 'Charging...' },
        { id: 'blast', intent: INTENT.ATTACK, damage: 25, message: 'Ultimate Blast' }
      ];
    } else {
      base.moveset = [
        { id: 'protect', intent: INTENT.DEFEND, block: 8, message: 'Protect' },
        { id: 'bash', intent: INTENT.ATTACK, damage: 6, message: 'Shield Bash' }
      ];
    }
    base.ai = (enemy, turn) => enemy.moveset[turn % enemy.moveset.length];
    return base;
  }
  return null;
};
