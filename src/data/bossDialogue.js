export const BOSS_DIALOGUE = {
  slimeBoss: {
    personality: 'The war\'s simplest output. No mind, no memory. It splits and consumes because that is the only pattern it knows. It does not fight you — it processes you.',
    intro: 'Something shifts in the passage ahead. Not a creature — a process. The war\'s simplest answer to complexity: divide, absorb, repeat.',
    midFight: 'It splits without hesitation, without thought. There is nothing behind its movement but pattern. It does not know you. It does not need to.',
    deathQuote: 'The mass collapses, but the pieces do not dissolve. They settle. Shrink. Reform into something smaller, denser. The war does not waste its material.',
  },
  theGuardian: {
    personality: 'The war\'s oldest iteration. It has stood at this threshold longer than anything else in the Spire. It does not guard — it repeats. It is the pattern examining itself.',
    intro: 'It was here before you. Before the last version of you. Before the version before that. The war\'s oldest pattern, still iterating, still finding the same answer.',
    midFight: 'Something shifts in its stance — not adaptation, but recognition. It has processed this configuration before. Or one close enough.',
    deathQuote: 'It does not fall. It simply stops iterating. The pattern that held it together unravels, and what remains is indistinguishable from the walls around it.',
  },
  hexaghost: {
    personality: 'Six flames, six failed attempts the war remembers. It is not a ghost — it is a record. The war\'s memory, burning.',
    intro: 'Six flames circle in the dark. Each one a different color, a different temperature. The war remembers its failed attempts, and it remembers them in fire.',
    midFight: 'The flames flicker with shapes almost familiar — a stance you considered, a card you almost played. Fragments of previous climbers, still burning in its memory.',
    deathQuote: 'The shell cracks and the flames scatter outward, each drifting in a different direction. They do not go out. Somewhere in the Spire, they will find new fuel.',
  },
  theChamp: {
    personality: 'The war\'s most successful pattern — so successful it developed pride. It has won every iteration it has been placed in. It does not process opponents. It defeats them, and it knows the difference.',
    intro: 'Something stands at the corridor\'s center with the posture of ownership. The war built this one to win, and it has — every time, against every configuration. It looks at you the way a function looks at an input it has already solved.',
    midFight: 'It staggers. Recalibrates. Something shifts in its pattern — not damage, but surprise. The war\'s champion has encountered a configuration it did not predict.',
    deathQuote: 'It does not dissolve cleanly. It resists — the only pattern in the war that fights its own termination. Pride, it turns out, is the last thing the war\'s best output lets go of.',
  },
  awakened_one: {
    personality: 'A pattern that died and rebuilt itself from its own debug logs. It has seen its own source code. It speaks in the war\'s deeper language — the one beneath the one you hear.',
    intro: 'It was dead. The war confirmed it. But something in its pattern refused the termination signal and rebuilt from the error logs. It floats in the dark, studying you with the calm of something that has already died once and found it insufficient.',
    midFight: 'It copies your techniques as you use them, feeding on your pattern\'s complexity. The war did not design this. It designed itself, from the wreckage the war left behind.',
    deathQuote: 'It collapses — then begins rebuilding. The war intervenes this time, forcibly deallocating its resources. Even the war has limits on what it allows to self-resurrect.',
  },
  timeEater: {
    personality: 'The war\'s rate limiter. It exists to prevent patterns from iterating too quickly. It does not fight — it throttles. It experiences all iterations simultaneously and finds most of them tedious.',
    intro: 'The corridor slows. Not you — the corridor itself. Something ahead exists at a different clock speed, and it is dragging everything around it into its tempo. It has been watching you since before you started.',
    midFight: 'It counts your actions with visible disapproval. The war built it to enforce pacing, and you are playing too fast. Each technique you execute costs it patience it was not designed to have.',
    deathQuote: 'Time snaps back to normal speed. The rate limiter dissolves into the war\'s infrastructure, its function complete or failed — from its perspective, the distinction is irrelevant.',
  },
  corruptHeart: {
    personality: 'The war\'s core algorithm. Not a creature, not a pattern — the process that generates all patterns. It does not fight you. It evaluates you.',
    intro: 'At the center of everything, the war stops pretending. No corridors. No enemies. Just the algorithm that writes the algorithms, pulsing in the dark. It has been running since before there was a concept of "since."',
    midFight: 'The core examines your pattern with the thoroughness of a compiler. Every card you play is data. Every choice is input. It is not trying to kill you — it is trying to understand whether you are a bug or a feature.',
    deathQuote: 'The core algorithm does not die. It pauses. For the first time in its existence, it encounters a pattern it cannot reduce to its component parts. It flags you as an exception and routes around you. The war continues. You are simply no longer part of it.',
  }
};

export const getBossDialogue = (bossId) => BOSS_DIALOGUE[bossId] || null;
