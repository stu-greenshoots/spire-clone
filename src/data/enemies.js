// Enemy Intent Types
export const INTENT = {
  ATTACK: 'attack',
  ATTACK_BUFF: 'attack_buff',
  ATTACK_DEBUFF: 'attack_debuff',
  ATTACK_DEFEND: 'attack_defend',
  BUFF: 'buff',
  DEBUFF: 'debuff',
  DEFEND: 'defend',
  DEFEND_BUFF: 'defend_buff',
  STRONG_DEBUFF: 'strong_debuff',
  UNKNOWN: 'unknown',
  SLEEPING: 'sleeping',
  STUN: 'stun'
};

// 25+ unique enemies
export const ALL_ENEMIES = [
  // ========== ACT 1 ENEMIES ==========
  {
    id: 'cultist',
    name: 'Cultist',
    hp: { min: 48, max: 54 },
    type: 'normal',
    act: 1,
    emoji: '🧙',
    moveset: [
      { id: 'incantation', intent: INTENT.BUFF, effects: [{ type: 'ritual', amount: 3 }], message: 'Ritual' },
      { id: 'darkStrike', intent: INTENT.ATTACK, damage: 6, message: 'Dark Strike' }
    ],
    ai: (enemy, turn) => {
      if (turn === 0) return enemy.moveset[0];
      return enemy.moveset[1];
    }
  },
  {
    id: 'jawWorm',
    name: 'Jaw Worm',
    hp: { min: 42, max: 46 },
    type: 'normal',
    act: 1,
    emoji: '🐛',
    moveset: [
      { id: 'chomp', intent: INTENT.ATTACK, damage: 12, message: 'Chomp' },
      { id: 'thrash', intent: INTENT.ATTACK_DEFEND, damage: 7, block: 5, message: 'Thrash' },
      { id: 'bellow', intent: INTENT.DEFEND_BUFF, block: 6, effects: [{ type: 'strength', amount: 4 }], message: 'Bellow' }
    ],
    ai: (enemy, turn, lastMove) => {
      // Jaw Worm is a "strong single" enemy - rewarded for dealing with it
      if (turn === 0) return enemy.moveset[0];
      const roll = Math.random();
      if (roll < 0.45 && lastMove?.id !== 'chomp') return enemy.moveset[0];
      if (roll < 0.75 && lastMove?.id !== 'thrash') return enemy.moveset[1];
      return enemy.moveset[2];
    }
  },
  {
    id: 'louse_red',
    name: 'Red Louse',
    hp: { min: 10, max: 15 },
    type: 'normal',
    act: 1,
    emoji: '🪲',
    curlUp: { min: 3, max: 7 },
    moveset: [
      { id: 'bite', intent: INTENT.ATTACK, damage: { min: 5, max: 7 }, message: 'Bite' },
      { id: 'grow', intent: INTENT.BUFF, effects: [{ type: 'strength', amount: 2 }], message: 'Grow' }
    ],
    ai: (enemy, turn, lastMove) => {
      // Reduced strength gain (2 instead of 3) - more manageable in groups
      if (Math.random() < 0.80 || lastMove?.id === 'grow') return enemy.moveset[0];
      return enemy.moveset[1];
    }
  },
  {
    id: 'louse_green',
    name: 'Green Louse',
    hp: { min: 11, max: 17 },
    type: 'normal',
    act: 1,
    emoji: '🪲',
    curlUp: { min: 3, max: 7 },
    moveset: [
      { id: 'bite', intent: INTENT.ATTACK, damage: { min: 5, max: 7 }, message: 'Bite' },
      { id: 'spit', intent: INTENT.DEBUFF, effects: [{ type: 'weak', amount: 1, target: 'player' }], message: 'Spit Web' }
    ],
    ai: (enemy, turn, lastMove) => {
      // Reduced weak (1 instead of 2) - more manageable in groups
      if (Math.random() < 0.80 || lastMove?.id === 'spit') return enemy.moveset[0];
      return enemy.moveset[1];
    }
  },
  {
    id: 'slime_small',
    name: 'Acid Slime (S)',
    hp: { min: 8, max: 12 },
    type: 'normal',
    act: 1,
    emoji: '🟢',
    moveset: [
      { id: 'lick', intent: INTENT.DEBUFF, effects: [{ type: 'weak', amount: 1, target: 'player' }], message: 'Lick' },
      { id: 'tackle', intent: INTENT.ATTACK, damage: 3, message: 'Tackle' }
    ],
    ai: (enemy, turn, lastMove) => {
      if (Math.random() < 0.5 && lastMove?.id !== 'lick') return enemy.moveset[0];
      return enemy.moveset[1];
    }
  },
  {
    id: 'slime_medium',
    name: 'Acid Slime (M)',
    hp: { min: 28, max: 32 },
    type: 'normal',
    act: 1,
    emoji: '🟢',
    moveset: [
      { id: 'corrosiveSpit', intent: INTENT.ATTACK_DEBUFF, damage: 7, special: 'addSlimed', message: 'Corrosive Spit' },
      { id: 'lick', intent: INTENT.DEBUFF, effects: [{ type: 'weak', amount: 1, target: 'player' }], message: 'Lick' },
      { id: 'tackle', intent: INTENT.ATTACK, damage: 10, message: 'Tackle' }
    ],
    ai: (enemy, turn, lastMove) => {
      const roll = Math.random();
      if (roll < 0.4 && lastMove?.id !== 'corrosiveSpit') return enemy.moveset[0];
      if (roll < 0.7 && lastMove?.id !== 'lick') return enemy.moveset[1];
      return enemy.moveset[2];
    },
    onDeath: 'splitSmall'
  },
  {
    id: 'slime_large',
    name: 'Acid Slime (L)',
    hp: { min: 95, max: 105 },
    type: 'elite',
    act: 1,
    emoji: '🟢',
    moveset: [
      { id: 'corrosiveSpit', intent: INTENT.ATTACK_DEBUFF, damage: 12, special: 'addSlimed', message: 'Corrosive Spit' },
      { id: 'lick', intent: INTENT.DEBUFF, effects: [{ type: 'weak', amount: 2, target: 'player' }], message: 'Lick' },
      { id: 'tackle', intent: INTENT.ATTACK, damage: 18, message: 'Tackle' },
      { id: 'split', intent: INTENT.UNKNOWN, special: 'splitMedium', message: 'Split' }
    ],
    ai: (enemy, turn, lastMove) => {
      if (enemy.currentHp <= enemy.maxHp / 2 && !enemy.hasSplit) return enemy.moveset[3];
      const roll = Math.random();
      if (roll < 0.35 && lastMove?.id !== 'corrosiveSpit') return enemy.moveset[0];
      if (roll < 0.65 && lastMove?.id !== 'lick') return enemy.moveset[1];
      return enemy.moveset[2];
    }
  },
  {
    id: 'spike_slime_small',
    name: 'Spike Slime (S)',
    hp: { min: 10, max: 14 },
    type: 'normal',
    act: 1,
    emoji: '🔵',
    moveset: [
      { id: 'tackle', intent: INTENT.ATTACK, damage: 5, message: 'Tackle' }
    ],
    ai: () => ({ id: 'tackle', intent: INTENT.ATTACK, damage: 5, message: 'Tackle' })
  },
  {
    id: 'spike_slime_medium',
    name: 'Spike Slime (M)',
    hp: { min: 28, max: 32 },
    type: 'normal',
    act: 1,
    emoji: '🔵',
    moveset: [
      { id: 'flameTackle', intent: INTENT.ATTACK, damage: 8, special: 'addSlimed', message: 'Flame Tackle' },
      { id: 'lick', intent: INTENT.DEBUFF, effects: [{ type: 'frail', amount: 1, target: 'player' }], message: 'Lick' }
    ],
    ai: (enemy, turn, lastMove) => {
      if (Math.random() < 0.7 || lastMove?.id === 'lick') return enemy.moveset[0];
      return enemy.moveset[1];
    },
    onDeath: 'splitSmallSpike'
  },
  {
    id: 'fungiBeast',
    name: 'Fungi Beast',
    hp: { min: 22, max: 28 },
    type: 'normal',
    act: 1,
    emoji: '🍄',
    moveset: [
      { id: 'bite', intent: INTENT.ATTACK, damage: 6, message: 'Bite' },
      { id: 'grow', intent: INTENT.BUFF, effects: [{ type: 'strength', amount: 2 }], message: 'Grow' }
    ],
    ai: (enemy, turn, _lastMove) => {
      // Reduced strength (2 instead of 3) - more manageable in groups
      if (turn === 0 || Math.random() < 0.65) return enemy.moveset[0];
      return enemy.moveset[1];
    },
    sporeCloud: true
  },
  {
    id: 'looter',
    name: 'Looter',
    hp: { min: 44, max: 48 },
    type: 'normal',
    act: 1,
    emoji: '🦹',
    moveset: [
      { id: 'mug', intent: INTENT.ATTACK, damage: 10, special: 'stealGold', message: 'Mug' },
      { id: 'lunge', intent: INTENT.ATTACK, damage: 12, message: 'Lunge' },
      { id: 'smokeBomb', intent: INTENT.DEFEND_BUFF, block: 6, special: 'escape', message: 'Smoke Bomb' }
    ],
    ai: (enemy, turn, _lastMove) => {
      if (turn < 2) return enemy.moveset[0];
      if (turn === 2) return enemy.moveset[2];
      return enemy.moveset[1];
    }
  },
  {
    id: 'gremlinNob',
    name: 'Gremlin Nob',
    // HP intentionally higher than StS baseline (82-86) to compensate for
    // simpler AI pattern and lack of full enrage mechanic scaling
    hp: { min: 106, max: 118 },
    type: 'elite',
    act: 1,
    emoji: '👹',
    moveset: [
      { id: 'bellow', intent: INTENT.BUFF, effects: [{ type: 'enrage', amount: 3 }, { type: 'strength', amount: 2 }], message: 'Bellow' },
      { id: 'rush', intent: INTENT.ATTACK, damage: 18, message: 'Rush' },
      { id: 'skullBash', intent: INTENT.ATTACK_DEBUFF, damage: 10, effects: [{ type: 'vulnerable', amount: 2, target: 'player' }], message: 'Skull Bash' }
    ],
    ai: (enemy, turn, lastMove) => {
      if (turn === 0) return enemy.moveset[0];
      // More aggressive - higher rush chance, occasional double rush
      if (Math.random() < 0.6 && lastMove?.id !== 'rush') return enemy.moveset[1];
      if (Math.random() < 0.4) return enemy.moveset[1]; // Can rush twice in a row sometimes
      return enemy.moveset[2];
    },
    enrage: true
  },
  {
    id: 'lagavulin',
    name: 'Lagavulin',
    hp: { min: 120, max: 128 },
    type: 'elite',
    act: 1,
    emoji: '🛡️',
    retainBlock: true,
    metallicize: 10,
    asleep: true,
    wakeThreshold: 3, // Wakes after 3 turns even if not attacked
    moveset: [
      { id: 'sleep', intent: INTENT.SLEEPING, message: 'Sleeping...' },
      { id: 'attack', intent: INTENT.ATTACK, damage: 20, message: 'Attack' },
      { id: 'siphonSoul', intent: INTENT.STRONG_DEBUFF, effects: [{ type: 'strengthDown', amount: 2, target: 'player' }, { type: 'dexterityDown', amount: 2, target: 'player' }], message: 'Siphon Soul' }
    ],
    ai: (enemy, turn, _lastMove) => {
      // Wake up after 3 turns automatically or when attacked
      if (enemy.asleep && !enemy.wokenUp && turn < 3) return enemy.moveset[0];
      // After waking: alternate between siphon and attack, more siphons
      if (turn % 2 === 0) return enemy.moveset[2];
      return enemy.moveset[1];
    }
  },
  {
    id: 'sentryA',
    name: 'Sentry',
    hp: { min: 38, max: 42 },
    type: 'elite',
    act: 1,
    emoji: '🗿',
    artifact: 1,
    spawnCount: 3,
    moveset: [
      { id: 'bolt', intent: INTENT.ATTACK, damage: 9, message: 'Bolt' },
      { id: 'beam', intent: INTENT.ATTACK_DEBUFF, damage: 9, special: 'addDazed', message: 'Beam' }
    ],
    ai: (enemy, turn, lastMove, index) => {
      // StS baseline: all Bolt on first turn, then staggered alternation
      if (turn === 0) return enemy.moveset[0]; // All sentries Bolt first
      if (index % 2 === 0) {
        return turn % 2 === 1 ? enemy.moveset[1] : enemy.moveset[0];
      } else {
        return turn % 2 === 1 ? enemy.moveset[0] : enemy.moveset[1];
      }
    }
  },

  // ========== ACT 2 ENEMIES ==========
  {
    id: 'chosen',
    name: 'Chosen',
    hp: { min: 62, max: 68 },
    type: 'normal',
    act: 2,
    emoji: '⚔️',
    moveset: [
      { id: 'poke', intent: INTENT.ATTACK, damage: 5, times: 2, message: 'Poke' },
      { id: 'zap', intent: INTENT.ATTACK_DEBUFF, damage: 12, effects: [{ type: 'vulnerable', amount: 2, target: 'player' }], message: 'Zap' },
      { id: 'debilitate', intent: INTENT.DEBUFF, effects: [{ type: 'weak', amount: 2, target: 'player' }, { type: 'vulnerable', amount: 2, target: 'player' }], message: 'Debilitate' },
      { id: 'hex', intent: INTENT.DEBUFF, special: 'addHex', message: 'Hex' }
    ],
    ai: (enemy, turn, lastMove) => {
      if (turn === 0) return enemy.moveset[3];
      const roll = Math.random();
      if (roll < 0.5 && lastMove?.id !== 'poke') return enemy.moveset[0];
      if (roll < 0.8) return enemy.moveset[1];
      return enemy.moveset[2];
    }
  },
  {
    id: 'byrd',
    name: 'Byrd',
    hp: { min: 25, max: 31 },
    type: 'normal',
    act: 2,
    emoji: '🦅',
    flying: true,
    moveset: [
      { id: 'caw', intent: INTENT.BUFF, effects: [{ type: 'strength', amount: 1 }], message: 'Caw' },
      { id: 'peck', intent: INTENT.ATTACK, damage: 1, times: 5, message: 'Peck' },
      { id: 'swoop', intent: INTENT.ATTACK, damage: 12, message: 'Swoop' },
      { id: 'fly', intent: INTENT.BUFF, special: 'gainFlight', message: 'Fly' }
    ],
    ai: (enemy, _turn, _lastMove) => {
      if (!enemy.grounded && Math.random() < 0.5) return enemy.moveset[3];
      const roll = Math.random();
      if (roll < 0.4) return enemy.moveset[0];
      if (roll < 0.7) return enemy.moveset[1];
      return enemy.moveset[2];
    }
  },
  {
    id: 'snakePlant',
    name: 'Snake Plant',
    hp: { min: 52, max: 58 },
    type: 'normal',
    act: 2,
    emoji: '🌿',
    moveset: [
      { id: 'chomp', intent: INTENT.ATTACK, damage: 5, times: 3, message: 'Chomp' },
      { id: 'enfeeble', intent: INTENT.DEBUFF, effects: [{ type: 'weak', amount: 2, target: 'player' }, { type: 'frail', amount: 2, target: 'player' }], message: 'Enfeeble' }
    ],
    ai: (enemy, turn, lastMove) => {
      if (Math.random() < 0.65 || lastMove?.id === 'enfeeble') return enemy.moveset[0];
      return enemy.moveset[1];
    }
  },
  {
    id: 'centurion',
    name: 'Centurion',
    hp: { min: 56, max: 62 },
    type: 'normal',
    act: 2,
    emoji: '🏛️',
    moveset: [
      { id: 'slash', intent: INTENT.ATTACK, damage: 10, message: 'Slash' },
      { id: 'fury', intent: INTENT.ATTACK, damage: 5, times: 3, message: 'Fury' },
      { id: 'defend', intent: INTENT.DEFEND, block: 12, message: 'Defend' }
    ],
    ai: (enemy, turn, lastMove) => {
      const roll = Math.random();
      if (roll < 0.45 && lastMove?.id !== 'slash') return enemy.moveset[0];
      if (roll < 0.8) return enemy.moveset[1];
      return enemy.moveset[2];
    }
  },
  {
    id: 'bookOfStabbing',
    name: 'Book of Stabbing',
    hp: { min: 180, max: 192 },
    type: 'elite',
    act: 2,
    emoji: '📕',
    moveset: [
      { id: 'multiStab', intent: INTENT.ATTACK, damage: 7, times: 3, special: 'addStab', message: 'Multi Stab' },
      { id: 'singleStab', intent: INTENT.ATTACK, damage: 24, message: 'Single Stab' }
    ],
    ai: (enemy, turn, _lastMove) => {
      // Escalates stab count each time multiStab is used
      if (turn % 2 === 0) return enemy.moveset[0];
      return enemy.moveset[1];
    },
    multiStabCount: 3, // Starts at 3, increases by 1 each multi-stab
    stabEscalation: 1
  },
  {
    id: 'gremlinLeader',
    name: 'Gremlin Leader',
    hp: { min: 160, max: 172 },
    type: 'elite',
    act: 2,
    emoji: '👑',
    moveset: [
      { id: 'encourage', intent: INTENT.BUFF, special: 'buffGremlins', effects: [{ type: 'strength', amount: 3 }], message: 'Encourage' },
      { id: 'rally', intent: INTENT.BUFF, special: 'summonGremlins', message: 'Rally!' },
      { id: 'stab', intent: INTENT.ATTACK, damage: 7, times: 4, message: 'Stab' }
    ],
    ai: (enemy, turn, _lastMove) => {
      // More aggressive pattern - attacks more often
      if (turn === 0) return enemy.moveset[1]; // Start with rally
      if (turn % 4 === 0) return enemy.moveset[1]; // Rally every 4 turns
      if (turn % 2 === 0) return enemy.moveset[0]; // Encourage
      return enemy.moveset[2]; // Stab
    }
  },
  {
    id: 'slaverBlue',
    name: 'Slaver',
    hp: { min: 46, max: 50 },
    type: 'normal',
    act: 2,
    emoji: '⛓️',
    moveset: [
      { id: 'stab', intent: INTENT.ATTACK, damage: 12, message: 'Stab' },
      { id: 'rake', intent: INTENT.ATTACK_DEBUFF, damage: 7, effects: [{ type: 'weak', amount: 1, target: 'player' }], message: 'Rake' },
      { id: 'entangle', intent: INTENT.DEBUFF, effects: [{ type: 'entangle', amount: 1, target: 'player' }], message: 'Entangle' }
    ],
    ai: (enemy, turn, _lastMove) => {
      if (turn === 0) return enemy.moveset[2];
      if (Math.random() < 0.55) return enemy.moveset[0];
      return enemy.moveset[1];
    }
  },
  {
    id: 'mystic',
    name: 'Mystic',
    hp: { min: 50, max: 56 },
    type: 'normal',
    act: 2,
    emoji: '🔮',
    moveset: [
      { id: 'heal', intent: INTENT.BUFF, special: 'healAlly', healAmount: 12, message: 'Heal' },
      { id: 'attack', intent: INTENT.ATTACK, damage: 8, message: 'Attack' }
    ],
    ai: (enemy, turn, _lastMove, _index, allies) => {
      // Heals if any ally is below 50% HP, otherwise attacks
      if (allies && allies.some(a => a.instanceId !== enemy.instanceId && a.currentHp > 0 && a.currentHp < a.maxHp * 0.5)) {
        return enemy.moveset[0];
      }
      return enemy.moveset[1];
    }
  },
  {
    id: 'snecko',
    name: 'Snecko',
    hp: { min: 60, max: 66 },
    type: 'normal',
    act: 2,
    emoji: '🐍',
    moveset: [
      { id: 'bite', intent: INTENT.ATTACK, damage: 15, message: 'Bite' },
      { id: 'tailWhip', intent: INTENT.ATTACK_DEBUFF, damage: 8, effects: [{ type: 'frail', amount: 2, target: 'player' }], message: 'Tail Whip' }
    ],
    ai: (enemy, turn, _lastMove) => {
      // Alternates between bite and tail whip
      if (turn % 2 === 0) return enemy.moveset[0];
      return enemy.moveset[1];
    },
    confuse: true
  },
  {
    id: 'shelledParasite',
    name: 'Shelled Parasite',
    hp: { min: 68, max: 72 },
    type: 'normal',
    act: 2,
    emoji: '🐚',
    retainBlock: true,
    moveset: [
      { id: 'shell', intent: INTENT.DEFEND, block: 14, message: 'Shell' },
      { id: 'suck', intent: INTENT.ATTACK_BUFF, damage: 10, special: 'healSelf', healAmount: 5, message: 'Suck' },
      { id: 'doubleTap', intent: INTENT.ATTACK, damage: 6, times: 2, message: 'Double Tap' }
    ],
    ai: (enemy, turn, _lastMove) => {
      // Shells first turn, then alternates between suck and double tap
      if (turn === 0) return enemy.moveset[0];
      if (turn % 2 === 1) return enemy.moveset[1];
      return enemy.moveset[2];
    }
  },
  {
    id: 'sphericGuardian',
    name: 'Spheric Guardian',
    hp: { min: 44, max: 48 },
    type: 'normal',
    act: 2,
    emoji: '🔵',
    barricade: true,
    moveset: [
      { id: 'slam', intent: INTENT.ATTACK, damage: 10, message: 'Slam' },
      { id: 'activate', intent: INTENT.DEFEND_BUFF, block: 25, effects: [{ type: 'strength', amount: 2 }], message: 'Activate' },
      { id: 'harden', intent: INTENT.DEFEND, block: 15, message: 'Harden' }
    ],
    ai: (enemy, turn, lastMove) => {
      // Starts with activate, then cycles between slam and harden
      if (turn === 0) return enemy.moveset[1];
      if (lastMove?.id === 'slam' || lastMove?.id === 'activate') return enemy.moveset[2];
      return enemy.moveset[0];
    }
  },

  // ========== ACT 3 ENEMIES ==========
  {
    id: 'writhing_mass',
    name: 'Writhing Mass',
    hp: { min: 88, max: 96 },
    type: 'normal',
    act: 3,
    emoji: '👁️',
    reactive: true,
    moveset: [
      { id: 'implant', intent: INTENT.ATTACK, damage: 12, special: 'addParasite', message: 'Implant' },
      { id: 'flail', intent: INTENT.ATTACK, damage: 12, message: 'Flail' },
      { id: 'wither', intent: INTENT.STRONG_DEBUFF, effects: [{ type: 'weak', amount: 2, target: 'player' }, { type: 'vulnerable', amount: 2, target: 'player' }], message: 'Wither' },
      { id: 'multiStrike', intent: INTENT.ATTACK, damage: 7, times: 3, message: 'Multi Strike' }
    ],
    ai: (enemy, _turn, _lastMove) => {
      const roll = Math.random();
      if (roll < 0.1) return enemy.moveset[0];
      if (roll < 0.4) return enemy.moveset[1];
      if (roll < 0.6) return enemy.moveset[2];
      return enemy.moveset[3];
    }
  },
  {
    id: 'giant_head',
    name: 'Giant Head',
    hp: { min: 520, max: 560 },
    type: 'elite',
    act: 3,
    emoji: '🗿',
    slow: true,
    moveset: [
      { id: 'count', intent: INTENT.UNKNOWN, special: 'count', message: 'Count' },
      { id: 'glare', intent: INTENT.DEBUFF, effects: [{ type: 'weak', amount: 2, target: 'player' }, { type: 'frail', amount: 1, target: 'player' }], message: 'Glare' },
      { id: 'darkEcho', intent: INTENT.ATTACK, damage: 45, message: 'Dark Echo' }
    ],
    ai: (enemy, turn, _lastMove) => {
      // Counts down faster - only 4 turns to kill
      if (enemy.slowCount >= 4) return enemy.moveset[2];
      if (turn % 2 === 0) return enemy.moveset[0];
      return enemy.moveset[1];
    },
    slowCountMax: 4 // Reduced from 5
  },
  {
    id: 'reptomancer',
    name: 'Reptomancer',
    hp: { min: 200, max: 216 },
    type: 'elite',
    act: 3,
    emoji: '🐍',
    summons: true,
    moveset: [
      { id: 'summon', intent: INTENT.BUFF, special: 'summonDaggers', message: 'Summon' },
      { id: 'snakeStrike', intent: INTENT.ATTACK, damage: 15, times: 2, message: 'Snake Strike' },
      { id: 'bigBite', intent: INTENT.ATTACK, damage: 34, message: 'Big Bite' }
    ],
    ai: (enemy, turn, _lastMove) => {
      if (turn === 0) return enemy.moveset[0];
      // Summon more frequently - every 3 turns
      if (turn % 3 === 0) return enemy.moveset[0];
      if (Math.random() < 0.4) return enemy.moveset[1];
      return enemy.moveset[2]; // More big bites
    }
  },
  {
    id: 'dagger',
    name: 'Dagger',
    hp: { min: 20, max: 25 },
    type: 'minion',
    act: 3,
    emoji: '🗡️',
    moveset: [
      { id: 'stab', intent: INTENT.ATTACK, damage: 9, message: 'Stab' },
      { id: 'explode', intent: INTENT.ATTACK, damage: 25, special: 'killSelf', message: 'Explode!' }
    ],
    ai: (enemy, turn, _lastMove) => {
      if (turn >= 2) return enemy.moveset[1];
      return enemy.moveset[0];
    }
  },
  {
    id: 'orbWalker',
    name: 'Orb Walker',
    hp: { min: 90, max: 96 },
    type: 'normal',
    act: 3,
    emoji: '🔮',
    moveset: [
      { id: 'laser', intent: INTENT.ATTACK, damage: 10, message: 'Laser' },
      { id: 'claw', intent: INTENT.ATTACK, damage: 15, message: 'Claw' },
      { id: 'burnStrike', intent: INTENT.ATTACK_DEBUFF, damage: 11, special: 'addBurn', message: 'Burn Strike' }
    ],
    ai: (enemy, _turn, _lastMove) => {
      const roll = Math.random();
      if (roll < 0.4) return enemy.moveset[0];
      if (roll < 0.7) return enemy.moveset[1];
      return enemy.moveset[2];
    }
  },
  {
    id: 'spiker',
    name: 'Spiker',
    hp: { min: 42, max: 56 },
    type: 'normal',
    act: 3,
    emoji: '🦔',
    thorns: 3,
    moveset: [
      { id: 'cut', intent: INTENT.ATTACK, damage: 7, message: 'Cut' },
      { id: 'spike', intent: INTENT.BUFF, effects: [{ type: 'thorns', amount: 2 }], message: 'Spike' }
    ],
    ai: (enemy, turn, _lastMove) => {
      if (turn % 3 === 0) return enemy.moveset[1];
      return enemy.moveset[0];
    }
  },

  // ========== BOSSES ==========
  {
    id: 'slimeBoss',
    name: 'Slime Boss',
    hp: { min: 140, max: 140 },
    type: 'boss',
    act: 1,
    emoji: '👑🟢',
    personality: 'Alien hunger - a formless entity driven by instinct older than thought',
    intro: 'The mass quivers. Something vast and formless regards you not with malice, but with hunger older than thought.',
    midFight: 'The creature shudders, its form rippling. It does not understand pain, only the need to consume.',
    deathQuote: 'The progenitor dissolves, releasing the echoes of a thousand devoured climbers in its final tremor.',
    moveset: [
      { id: 'goop', intent: INTENT.DEBUFF, special: 'addSlimed', amount: 3, message: 'Goop Spray' },
      { id: 'preparing', intent: INTENT.UNKNOWN, message: 'Preparing...' },
      { id: 'slam', intent: INTENT.ATTACK, damage: 35, message: 'Slam' },
      { id: 'split', intent: INTENT.UNKNOWN, special: 'splitBoss', message: 'Split' }
    ],
    ai: (enemy, turn, _lastMove) => {
      if (enemy.currentHp <= enemy.maxHp / 2 && !enemy.hasSplit) return enemy.moveset[3];
      if (turn % 3 === 0) return enemy.moveset[0];
      if (turn % 3 === 1) return enemy.moveset[1];
      return enemy.moveset[2];
    }
  },
  {
    id: 'theGuardian',
    name: 'The Guardian',
    hp: { min: 240, max: 240 },
    type: 'boss',
    act: 1,
    emoji: '🛡️👹',
    retainBlock: true,
    modeShift: true,
    personality: 'Mechanical stoic - an ancient construct bound by protocol',
    intro: 'UNAUTHORIZED ASCENT DETECTED. INITIATING DEFENSIVE PROTOCOLS.',
    midFight: 'SYSTEM DAMAGE ACKNOWLEDGED. SWITCHING OPERATIONAL MODE.',
    deathQuote: 'GUARDIAN... OFFLINE... SPIRE... UNDEFENDED...',
    moveset: [
      { id: 'chargingUp', intent: INTENT.DEFEND, block: 9, message: 'Charging Up' },
      { id: 'fierceBash', intent: INTENT.ATTACK, damage: 32, message: 'Fierce Bash' },
      { id: 'ventSteam', intent: INTENT.DEBUFF, effects: [{ type: 'weak', amount: 2, target: 'player' }, { type: 'vulnerable', amount: 2, target: 'player' }], message: 'Vent Steam' },
      { id: 'whirlwind', intent: INTENT.ATTACK, damage: 5, times: 4, message: 'Whirlwind' },
      { id: 'rollAttack', intent: INTENT.ATTACK, damage: 9, message: 'Roll Attack' },
      { id: 'twinSlam', intent: INTENT.ATTACK, damage: 8, times: 2, message: 'Twin Slam' },
      { id: 'modeShift', intent: INTENT.DEFEND_BUFF, block: 20, special: 'modeShift', message: 'Mode Shift' }
    ],
    ai: (enemy, turn, _lastMove) => {
      if (enemy.defensiveMode) {
        if (turn % 4 === 0) return enemy.moveset[0];
        if (turn % 4 === 1) return enemy.moveset[3];
        if (turn % 4 === 2) return enemy.moveset[5];
        return enemy.moveset[6];
      } else {
        if (turn % 3 === 0) return enemy.moveset[2];
        if (turn % 3 === 1) return enemy.moveset[4];
        return enemy.moveset[1];
      }
    }
  },
  {
    id: 'hexaghost',
    name: 'Hexaghost',
    hp: { min: 250, max: 250 },
    type: 'boss',
    act: 1,
    emoji: '👻🔥',
    personality: 'Melancholic ancient - a hollow warrior who regards combat with weary pity',
    intro: 'Six flames orbit a hollow shell of what was once a warrior. It regards you with something like pity.',
    midFight: 'You burn brightly... but all flames gutter in the end.',
    deathQuote: 'At last... the cold...',
    moveset: [
      { id: 'activate', intent: INTENT.UNKNOWN, special: 'activate', message: 'Activate' },
      { id: 'divider', intent: INTENT.ATTACK, damage: 6, times: 6, special: 'divider', message: 'Divider' },
      { id: 'sear', intent: INTENT.ATTACK_DEBUFF, damage: 6, special: 'addBurn', message: 'Sear' },
      { id: 'tackle', intent: INTENT.ATTACK, damage: 5, times: 2, message: 'Tackle' },
      { id: 'inflame', intent: INTENT.BUFF, effects: [{ type: 'strength', amount: 2 }], special: 'upgradeBurn', message: 'Inflame' },
      { id: 'inferno', intent: INTENT.ATTACK, damage: 2, times: 6, special: 'addBurns', message: 'Inferno' }
    ],
    ai: (enemy, turn, _lastMove) => {
      if (turn === 0) return enemy.moveset[0];
      if (turn === 1) return enemy.moveset[1];
      const phase = (turn - 2) % 7;
      if (phase < 2) return enemy.moveset[2];
      if (phase < 4) return enemy.moveset[3];
      if (phase === 4) return enemy.moveset[4];
      return enemy.moveset[5];
    }
  },
  {
    id: 'theChamp',
    name: 'The Champ',
    hp: { min: 420, max: 420 },
    type: 'boss',
    act: 2,
    emoji: '🏆',
    retainBlock: true,
    moveset: [
      { id: 'defensiveStance', intent: INTENT.DEFEND_BUFF, block: 15, effects: [{ type: 'metallicize', amount: 5 }], message: 'Defensive Stance' },
      { id: 'faceSlap', intent: INTENT.ATTACK_DEBUFF, damage: 12, effects: [{ type: 'frail', amount: 2, target: 'player' }, { type: 'vulnerable', amount: 2, target: 'player' }], message: 'Face Slap' },
      { id: 'heavySlash', intent: INTENT.ATTACK, damage: 16, message: 'Heavy Slash' },
      { id: 'execute', intent: INTENT.ATTACK, damage: 10, times: 2, message: 'Execute' },
      { id: 'taunt', intent: INTENT.DEBUFF, effects: [{ type: 'weak', amount: 2, target: 'player' }, { type: 'vulnerable', amount: 2, target: 'player' }], message: 'Taunt' },
      { id: 'anger', intent: INTENT.BUFF, effects: [{ type: 'strength', amount: 6 }], special: 'removeDebuffs', message: 'ANGER!' }
    ],
    ai: (enemy, _turn, _lastMove) => {
      if (enemy.currentHp <= enemy.maxHp / 2 && !enemy.angered) return enemy.moveset[5];
      const roll = Math.random();
      if (roll < 0.2) return enemy.moveset[0];
      if (roll < 0.4) return enemy.moveset[1];
      if (roll < 0.6) return enemy.moveset[2];
      if (roll < 0.8) return enemy.moveset[3];
      return enemy.moveset[4];
    }
  },
  {
    id: 'awakened_one',
    name: 'Awakened One',
    hp: { min: 300, max: 300 },
    type: 'boss',
    act: 3,
    emoji: '😈',
    curious: true,
    canRebirth: true,
    moveset: [
      { id: 'slash', intent: INTENT.ATTACK, damage: 20, message: 'Slash' },
      { id: 'soulStrike', intent: INTENT.ATTACK, damage: 6, times: 4, message: 'Soul Strike' },
      { id: 'darkEcho', intent: INTENT.ATTACK, damage: 40, message: 'Dark Echo' },
      { id: 'rebirth', intent: INTENT.BUFF, special: 'rebirth', message: 'Rebirth' },
      { id: 'tackle', intent: INTENT.ATTACK, damage: 10, message: 'Tackle' }
    ],
    ai: (enemy, _turn, _lastMove) => {
      if (enemy.currentHp <= 0 && !enemy.reborn) return enemy.moveset[3];
      if (enemy.reborn) {
        const roll = Math.random();
        if (roll < 0.5) return enemy.moveset[0];
        return enemy.moveset[1];
      }
      const roll = Math.random();
      if (roll < 0.25) return enemy.moveset[0];
      if (roll < 0.5) return enemy.moveset[1];
      if (roll < 0.75) return enemy.moveset[2];
      return enemy.moveset[4];
    },
    onPowerPlayed: (enemy) => {
      enemy.strength = (enemy.strength || 0) + 2;
    }
  },
  {
    id: 'timeEater',
    name: 'Time Eater',
    hp: { min: 456, max: 456 },
    type: 'boss',
    act: 3,
    emoji: '⏰',
    cardCounter: 0,
    moveset: [
      { id: 'reverberate', intent: INTENT.ATTACK, damage: 7, times: 3, message: 'Reverberate' },
      { id: 'head', intent: INTENT.ATTACK, damage: 26, message: 'Head Slam' },
      { id: 'ripple', intent: INTENT.ATTACK_DEBUFF, damage: 10, effects: [{ type: 'drawReduction', amount: 1, target: 'player' }], message: 'Ripple' },
      { id: 'haste', intent: INTENT.BUFF, special: 'removeDebuffs', effects: [{ type: 'strength', amount: 2 }], message: 'Haste' }
    ],
    ai: (enemy, _turn, _lastMove) => {
      if (enemy.currentHp <= enemy.maxHp / 2 && !enemy.hasted) return enemy.moveset[3];
      const roll = Math.random();
      if (roll < 0.33) return enemy.moveset[0];
      if (roll < 0.66) return enemy.moveset[1];
      return enemy.moveset[2];
    },
    onCardPlayed: (enemy) => {
      enemy.cardCounter = (enemy.cardCounter || 0) + 1;
      if (enemy.cardCounter >= 12) {
        enemy.cardCounter = 0;
        return { endTurn: true, heal: 2 };
      }
      return null;
    }
  },
  {
    id: 'corruptHeart',
    name: 'Corrupt Heart',
    hp: { min: 800, max: 800 },
    type: 'boss',
    act: 4,
    emoji: '💀❤️',
    invincible: 300,
    beat: 0,
    moveset: [
      { id: 'debilitate', intent: INTENT.STRONG_DEBUFF, effects: [{ type: 'vulnerable', amount: 2, target: 'player' }, { type: 'weak', amount: 2, target: 'player' }, { type: 'frail', amount: 2, target: 'player' }], message: 'Debilitate' },
      { id: 'bloodShots', intent: INTENT.ATTACK, damage: 2, times: 15, special: 'bloodShots', message: 'Blood Shots' },
      { id: 'echo', intent: INTENT.ATTACK_DEBUFF, damage: 40, special: 'addStatus', message: 'Echo' },
      { id: 'buff', intent: INTENT.BUFF, effects: [{ type: 'strength', amount: 2 }, { type: 'artifact', amount: 2 }], special: 'beatOfDeath', message: 'Buff' }
    ],
    ai: (enemy, turn, _lastMove) => {
      if (turn === 0) return enemy.moveset[0];
      const phase = (turn - 1) % 3;
      if (phase === 0) return enemy.moveset[1];
      if (phase === 1) return enemy.moveset[2];
      return enemy.moveset[3];
    },
    beatOfDeath: true
  }
];

export const getEnemyById = (id) => ALL_ENEMIES.find(e => e.id === id);

export const getRandomEnemy = (act = 1, type = 'normal') => {
  const enemies = ALL_ENEMIES.filter(e => e.act === act && e.type === type);
  return enemies[Math.floor(Math.random() * enemies.length)];
};

export const createEnemyInstance = (enemy, index = 0) => {
  const hp = typeof enemy.hp.min !== 'undefined'
    ? Math.floor(Math.random() * (enemy.hp.max - enemy.hp.min + 1)) + enemy.hp.min
    : enemy.hp;

  return {
    ...enemy,
    instanceId: `${enemy.id}_${Date.now()}_${index}`,
    currentHp: hp,
    maxHp: hp,
    block: 0,
    strength: 0,
    dexterity: 0,
    vulnerable: 0,
    weak: 0,
    frail: 0,
    poison: 0,
    artifact: enemy.artifact || 0,
    ritual: 0,
    thorns: enemy.thorns || 0,
    flight: enemy.flying ? 3 : 0,
    metallicize: enemy.metallicize || 0,
    enrage: 0,
    lastMove: null,
    moveIndex: 0,
    intentData: null,
    asleep: enemy.asleep || false,
    hasSplit: false
  };
};

// Weak enemies suitable for multi-spawn encounters (low damage, manageable HP)
const WEAK_ENEMIES = ['louse_red', 'louse_green', 'slime_small', 'spike_slime_small', 'fungiBeast'];
const MEDIUM_ENEMIES = ['slime_medium', 'spike_slime_medium', 'cultist', 'mystic', 'byrd'];
const STRONG_NORMAL_ENEMIES = ['jawWorm', 'looter', 'chosen', 'snakePlant', 'centurion', 'slaverBlue', 'snecko', 'shelledParasite', 'sphericGuardian', 'writhing_mass', 'orbWalker', 'spiker'];

export const getEncounter = (act, floor, _eliteChance = 0.1, isElite = false) => {
  const type = isElite ? 'elite' : 'normal';
  const availableEnemies = ALL_ENEMIES.filter(e => e.act <= act && e.type === type);

  if (type === 'elite') {
    // Prefer elites from current act, but can pull from earlier acts
    const currentActElites = availableEnemies.filter(e => e.act === act);
    const pool = currentActElites.length > 0 ? currentActElites : availableEnemies;
    const enemy = pool[Math.floor(Math.random() * pool.length)];
    const count = enemy.spawnCount || 1;
    const instances = [];
    for (let i = 0; i < count; i++) {
      instances.push(createEnemyInstance(enemy, i));
    }
    return instances;
  }

  // Floor-based difficulty scaling
  // Early floors (1-5): Easier encounters
  // Mid floors (6-10): Normal difficulty
  // Late floors (11-15): Harder encounters
  const floorInAct = ((floor - 1) % 15) + 1;
  const isEarlyFloor = floorInAct <= 5;
  const isLateFloor = floorInAct >= 11;

  const roll = Math.random();

  // Rebalanced encounter chances - more single enemies, especially early
  // Act 1: 50% single (was 25%), 35% double, 15% multi
  // Act 2: 45% single, 35% double, 20% multi
  // Act 3: 40% single, 35% double, 25% multi
  let singleChance = act === 1 ? 0.50 : act === 2 ? 0.45 : 0.40;
  let doubleChance = act === 1 ? 0.35 : act === 2 ? 0.35 : 0.35;

  // Early floors get even more single enemies
  if (isEarlyFloor) {
    singleChance += 0.15;
    doubleChance -= 0.10;
  } else if (isLateFloor) {
    singleChance -= 0.10;
    doubleChance += 0.05;
  }

  if (roll < singleChance) {
    // Single enemy - can be any strength level, but weighted by floor
    let pool = availableEnemies;
    if (isEarlyFloor && act === 1) {
      // Early Act 1: Prefer weaker single enemies
      const weakPool = availableEnemies.filter(e => WEAK_ENEMIES.includes(e.id) || MEDIUM_ENEMIES.includes(e.id));
      pool = weakPool.length > 0 ? weakPool : availableEnemies;
    } else if (isLateFloor) {
      // Late floors: Prefer stronger enemies
      const strongPool = availableEnemies.filter(e => STRONG_NORMAL_ENEMIES.includes(e.id) || MEDIUM_ENEMIES.includes(e.id));
      pool = strongPool.length > 0 ? strongPool : availableEnemies;
    }
    const enemy = pool[Math.floor(Math.random() * pool.length)];
    return [createEnemyInstance(enemy)];

  } else if (roll < singleChance + doubleChance) {
    // Double enemy - MUST use weaker enemies
    const weakPool = availableEnemies.filter(e => WEAK_ENEMIES.includes(e.id));
    const mediumPool = availableEnemies.filter(e => MEDIUM_ENEMIES.includes(e.id));

    // Prefer weak enemies for doubles, fall back to medium
    let pool;
    if (weakPool.length > 0 && (isEarlyFloor || Math.random() < 0.7)) {
      pool = weakPool;
    } else if (mediumPool.length > 0) {
      pool = mediumPool;
    } else {
      pool = availableEnemies.filter(e => !STRONG_NORMAL_ENEMIES.includes(e.id));
      if (pool.length === 0) pool = availableEnemies;
    }

    const enemy = pool[Math.floor(Math.random() * pool.length)];
    return [createEnemyInstance(enemy, 0), createEnemyInstance(enemy, 1)];

  } else {
    // Multi-enemy (2-3) - ONLY weak enemies, mix types for variety
    const weakPool = availableEnemies.filter(e => WEAK_ENEMIES.includes(e.id));
    if (weakPool.length === 0) {
      // Fallback: just use 2 medium enemies
      const mediumPool = availableEnemies.filter(e => MEDIUM_ENEMIES.includes(e.id));
      const pool = mediumPool.length > 0 ? mediumPool : availableEnemies;
      const enemy = pool[Math.floor(Math.random() * pool.length)];
      return [createEnemyInstance(enemy, 0), createEnemyInstance(enemy, 1)];
    }

    const enemies = [];
    const count = isEarlyFloor ? 2 : (Math.floor(Math.random() * 2) + 2); // 2 early, 2-3 later

    for (let i = 0; i < count; i++) {
      const enemy = weakPool[Math.floor(Math.random() * weakPool.length)];
      enemies.push(createEnemyInstance(enemy, i));
    }
    return enemies;
  }
};

export const getBossEncounter = (act) => {
  const bosses = ALL_ENEMIES.filter(e => e.act === act && e.type === 'boss');
  const boss = bosses[Math.floor(Math.random() * bosses.length)];
  return [createEnemyInstance(boss)];
};
