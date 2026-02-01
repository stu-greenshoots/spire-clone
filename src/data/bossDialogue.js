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

// Character-specific dialogue variants
// When playing as the Silent, bosses recognize a different kind of pattern
const SILENT_BOSS_DIALOGUE = {
  slimeBoss: {
    intro: 'The mass hesitates. Your pattern is quieter than what it usually processes — harder to detect, harder to absorb. It shifts tactics, probing for the shape of something it cannot quite see.',
    midFight: 'It reaches for you and finds air. Your pattern moves between its detection cycles, slipping through the gaps in its simple logic. It splits faster, trying to corner what it cannot track.',
    deathQuote: 'The mass collapses inward, still searching for a pattern it could never quite locate. The war logs the failure and notes the anomaly: something too quiet to process.',
  },
  theGuardian: {
    intro: 'It scans the corridor with the patience of deep time. But its sensors were calibrated for a different kind of pattern — louder, denser. You register as noise. It almost lets you pass. Almost.',
    midFight: 'Its targeting recalibrates. The old pattern cannot lock onto something that keeps changing shape. For the first time in a thousand iterations, the guardian is guessing.',
    deathQuote: 'It stops iterating, but its final scan sweeps past the space where you stand — still unable to fully resolve your outline. The war\'s oldest sentry failed to see what was right in front of it.',
  },
  hexaghost: {
    intro: 'Six flames scan the dark and find — less than they expected. Your pattern burns cooler than what they are calibrated to remember. The flames confer, uncertain. A ghost built from loud failures does not know what to make of a quiet one.',
    midFight: 'The flames try to project your past iterations onto you and the images don\'t fit. Your pattern has too many edges, too many ways to fold. The ghost is remembering someone who is not you.',
    deathQuote: 'The flames scatter, each carrying a fragment of data they could not reconcile. The war\'s memory will file you differently: not as a failure it consumed, but as a shape it could not contain.',
  },
  theChamp: {
    intro: 'It sizes you up with the confidence of a function that has never returned an error. But your pattern does not match its training data. You are lighter than what it knows how to defeat. Faster. Less there.',
    midFight: 'Surprise — genuine surprise. Not damage, but disorientation. The champion has never fought a pattern that wasn\'t trying to overpower it. You are trying to outlast it, and that is not in its playbook.',
    deathQuote: 'It fights its own termination, as always. But its last output is different this time — not pride, but confusion. The war\'s best pattern was defeated by something it still cannot classify.',
  },
  awakened_one: {
    intro: 'It studied your pattern before you entered and found it... interesting. Not the brute-force complexity it usually feeds on, but something layered. Recursive. It cannot copy what it cannot fully parse.',
    midFight: 'It reaches for your techniques and finds them slippery — poison that corrodes its copies, blades that dissolve before it can replicate them. Your pattern is built to be consumed and to punish the consumption.',
    deathQuote: 'It collapses, and for once does not attempt to rebuild. Your pattern was not a meal — it was a trap. The war intervenes, deallocating with unusual haste. It does not want this one remembered.',
  },
  timeEater: {
    intro: 'The corridor slows, but you were already slow. Patient. The rate limiter peers at your pattern and finds something unexpected: a combatant that does not need to be throttled. You operate within its tempo naturally.',
    midFight: 'It counts your actions and finds the count... unsatisfying. You play fewer cards, but each one carries more consequence. Poison does not care about pacing. The rate limiter was not designed for threats that compound.',
    deathQuote: 'Time returns to normal speed, but the rate limiter\'s dissolution is slower than usual — reluctant. It encountered a pattern that respected its rules and broke them from within. The war files this as a design flaw.',
  },
  corruptHeart: {
    intro: 'The algorithm pauses. The pattern approaching is not what it expected from this iteration — quieter, more layered, built from patience rather than force. It adjusts its evaluation criteria. For the first time, it is not sure which metrics apply.',
    midFight: 'The core runs your pattern through its standard analysis and gets inconclusive results. You do not fight like a variable — you fight like an exploit. Something that was always in the system, waiting to be found.',
    deathQuote: 'The algorithm flags you differently than the others. Not as an exception to route around, but as a vulnerability to patch. You were never trying to be real. You were trying to be invisible. And the algorithm finds that far more threatening.',
  }
};

// Character-specific defeat/victory overrides
export const SILENT_DEFEAT_NARRATIVE = {
  early: [
    'The pattern barely registered before it faded. The war does not notice quiet dissolutions.',
    'Too thin. Too dispersed. The war\'s processes swept through you like wind through smoke.',
  ],
  midAct1: [
    'The pattern fades without sound. The war does not even log the loss — you were never loud enough to track.',
    'You were becoming something subtle. Not enough. The war unmakes the quiet ones faster, because it barely has to try.',
  ],
  act2: [
    'The poison in your pattern almost took root. Almost. The war metabolized you before you could metabolize it.',
    'Something silent and nearly permanent dissolves back into the noise. The war does not mourn what it never heard.',
  ],
  act3: [
    'This close to the core, even silence has weight. The war noticed you at the end — and that attention is what dissolved you.',
    'You moved through the war like a virus through code. But the core\'s immune response caught you at the last checkpoint.',
  ],
  boss: [
    'The guardian\'s pattern found you eventually. The quiet ones last longer, but the ending is the same.',
    'Outpaced by a pattern that didn\'t need to see you to destroy you. The war has more than one sense.',
  ],
  heart: [
    'The core algorithm found the exploit and patched it. You were close — closer than force ever gets. But close is still dissolution.',
    'The algorithm examined your stealth and classified it as a threat worth remembering. Next iteration, the war will listen harder.',
  ],
};

export const SILENT_VICTORY_NARRATIVE = {
  standard: [
    'The war tries to unmake you, but you were never fully within its grasp. You persist — not through force, but through absence. The war cannot dissolve what it cannot find.',
    'Your pattern holds by being too quiet to target. The war rages around you and you slip through the noise. You are real — not because you fought for it, but because you were never where the war was looking.',
  ],
  heart: [
    'The core algorithm searches for you in its own code and cannot find where you end and it begins. You did not beat the system. You became indistinguishable from it.',
    'At the center of the war, silence. Not the absence of sound — the presence of something the algorithm cannot classify. You are the bug it will never patch.',
  ],
};

export const getBossDialogue = (bossId, characterId) => {
  const base = BOSS_DIALOGUE[bossId];
  if (!base) return null;

  if (characterId === 'silent' && SILENT_BOSS_DIALOGUE[bossId]) {
    const silent = SILENT_BOSS_DIALOGUE[bossId];
    return {
      ...base,
      intro: silent.intro || base.intro,
      midFight: silent.midFight || base.midFight,
      deathQuote: silent.deathQuote || base.deathQuote,
    };
  }

  return base;
};
