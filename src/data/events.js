// 20 Game Events for Spire Ascent
// All events use the "Endless War" voice — the war as system, patterns as identity
// First 10: Pattern glitches (original Varrow rewrite)
// Last 10: Pattern anomalies (VARROW-04 consistency pass)

export const events = [
  // ===== PATTERN GLITCHES (Endless War voice) =====
  {
    id: 'hollow_merchant',
    title: 'Supply Line Anomaly',
    description: 'The war keeps inventory. Resources cycle through its corridors in predictable loops. But this cache has stalled — a figure stands beside it, not quite a combatant, not quite anything. It holds out objects it should not have, in a place they should not be.',
    choices: [
      {
        text: 'Take the restorative (lose 75 gold)',
        effect: { loseGold: 75, heal: 30 },
        result: 'The liquid tastes of nothing. It heals like a process completing, efficient and without warmth. The figure does not react. It was never really here — just the war redistributing.'
      },
      {
        text: 'Take the crystallized output (lose 100 gold)',
        effect: { loseGold: 100, gainRelic: 'vajra' },
        result: 'A shard of concentrated force, dense with iterations the war ran and discarded. It bonds to you immediately. The figure dissolves. The supply line corrects itself.'
      },
      {
        text: 'Walk away',
        effect: { gainGold: 10 },
        result: 'You step past and something clinks underfoot. A small residue — the war rounds down, apparently. The anomaly collapses behind you without sound.'
      }
    ]
  },

  {
    id: 'traveling_alchemist',
    title: 'Process Deviation',
    description: 'A woman with singed eyebrows and acid-stained gloves blocks the corridor. She is not part of the war\'s pattern — or she is a part that has gone wrong. She holds out a concoction that bubbles with unstable intent. "Only mostly not kill you," she says, which is not how the war usually phrases things.',
    choices: [
      {
        text: 'Drink the concoction',
        effect: { loseHpPercent: 20, gainMaxHp: 10 },
        result: 'Your insides rearrange. The war does not approve of unauthorized modifications, but it cannot undo what has already compiled. You are sturdier now. The alchemist scribbles notes as if documenting a bug.'
      },
      {
        text: 'Politely decline and ask for gold instead',
        effect: { gainGold: 50, damage: 5 },
        result: 'She flicks a pouch at your head. It connects. The war did not arrange this interaction and seems unsure how to log it. Fair enough.'
      }
    ]
  },

  {
    id: 'forgotten_library',
    title: 'Pattern Archive',
    description: 'The war remembers everything, but not everything is meant to be accessed. This chamber holds older iterations — tactics tested and shelved, configurations abandoned mid-cycle. One record still pulses, its data wanting to be read.',
    choices: [
      {
        text: 'Access the active record',
        effect: { upgradeRandomCard: true, loseHp: 8 },
        result: 'The data overwrites something you knew with something sharper. Your nose bleeds — the war\'s archive was not designed for direct access. But the technique is yours now, refined beyond its original version.'
      },
      {
        text: 'Search for cached resources',
        effect: { gainGold: 80 },
        result: 'Behind a corrupted section, resources the war allocated and forgot. A previous iteration\'s budget, never reclaimed. The skeleton nearby suggests the last accessor did not log out cleanly.'
      },
      {
        text: 'Purge the archive',
        effect: { removeCard: true, gainMaxHp: 3 },
        result: 'The old data burns away, and with it a pattern you had been carrying — one the war embedded in you without asking. You are lighter. The walls shudder, but the war has no mechanism for complaint.'
      }
    ]
  },

  {
    id: 'crumbling_altar',
    title: 'Iteration Marker',
    description: 'A slab of dark stone scored with geometric patterns — the war\'s notation system, older than anything else in this corridor. Dried residue fills the grooves. This is where the war tracked its early cycles. The tracking still works.',
    choices: [
      {
        text: 'Offer resources to the marker (lose 60 gold)',
        effect: { loseGold: 60, gainRelic: 'anchor' },
        result: 'The gold dissolves into the grooves and reforms as a dense pendant. The war\'s oldest output — stability, grounding. The marker cracks and goes dark. Its function is complete.'
      },
      {
        text: 'Offer your blood',
        effect: { loseHp: 15, upgradeRandomCard: true, upgradeRandomCard2: true },
        result: 'Your blood fills the geometric pattern and the war reads you. It writes back. Techniques sharpen in your muscle memory as the system calibrates you like any other input. The price was steep but the data is permanent.'
      },
      {
        text: 'Break the marker',
        effect: { gainGold: 40, loseMaxHp: 3 },
        result: 'The stone shatters. Resources clatter free. But something in the breakage settles into you — a small corruption, a reduced ceiling. The war does not forget damage to its infrastructure.'
      }
    ]
  },

  {
    id: 'sunken_vault',
    title: 'Corrupted Cache',
    description: 'A storage node the war sealed and abandoned. Half-submerged, its contents glinting through murky overflow. Whatever corrupted this cache still moves in the water — the war\'s cleanup process, still running, still hungry.',
    choices: [
      {
        text: 'Grab what you can, fast',
        effect: { gainGold: 120, damage: 18 },
        result: 'You plunge in and snatch. The cleanup process objects — violently. Teeth marks cross your legs as you scramble out clutching resources the war wrote off long ago. Profitable, if the war\'s janitor doesn\'t follow.'
      },
      {
        text: 'Drain the cache slowly',
        effect: { gainGold: 60, loseMaxHp: 2 },
        result: 'Hours of careful work. The yield is modest, but the exposure to whatever saturates this place has thinned something in you. The war\'s runoff is not meant for extended contact.'
      }
    ]
  },

  {
    id: 'serpent_guardian',
    title: 'Legacy Process',
    description: 'Something old blocks the path — older than the current iteration of the war, still running on outdated logic. It coils in silver-tarnished armor and speaks in a frequency the war no longer uses: "I offer you a trade, warm-blood." The war tolerates it. It does not know how to stop it.',
    choices: [
      {
        text: 'Accept its bargain (lose 30 HP)',
        effect: { loseHp: 30, gainRelic: 'bronze_scales' },
        result: 'It bites deep, injecting something the war did not authorize. Your skin hardens with a pattern from an older version — bronze-scale armor, deprecated but functional. The war cannot patch what it did not write.'
      },
      {
        text: 'Challenge it for passage',
        effect: { damage: 12, gainGold: 65 },
        result: 'The old process strikes with outdated patterns — painful but predictable. It yields passage and sheds resources as it recoils. Impressed, perhaps. Or simply executing its loss condition.'
      },
      {
        text: 'Feed it from your reserves',
        effect: { loseGold: 30, heal: 10 },
        result: 'It accepts the input and coils aside. Warm air passes over your damage — a repair function from a gentler version of the war. The legacy process remembers a time before everything was combat.'
      }
    ]
  },

  {
    id: 'bone_collector',
    title: 'The Scavenger Pattern',
    description: 'A thing of misaligned joints and hollow sockets crouches over a pile of discarded outputs — the war\'s waste material, sorted by criteria only it understands. It grins with borrowed teeth: "Spare me something interesting?" The war does not acknowledge this entity, but it exists anyway.',
    choices: [
      {
        text: 'Offer a card from your deck',
        effect: { removeCard: true, gainRelic: 'pen_nib' },
        result: 'It extracts the technique from your configuration like pulling a bad tooth. In exchange, a sharp instrument — something for marking your progress through the war. "For writing your pattern in blood," it says. The war pretends this did not happen.'
      },
      {
        text: 'Offer your blood (lose 20 HP)',
        effect: { loseHp: 20, gainGold: 100 },
        result: 'It produces a cup and you fill it. The scavenger drinks, then produces resources from somewhere the war does not track. An off-the-books transaction. The war\'s economy has leaks.'
      }
    ]
  },

  {
    id: 'shadow_beast',
    title: 'Negative Space',
    description: 'Where the war\'s patterns do not reach, something else fills in. A gap in the corridor\'s logic, visible as a darker absence. It whispers in the frequency between the war\'s signals — offering modifications the system never intended.',
    choices: [
      {
        text: 'Accept its gift of strength',
        effect: { gainMaxHp: 8, loseGold: 50 },
        result: 'The negative space pours into you, expanding your capacity beyond the war\'s allocation. Your resources lighten — the gap feeds on surplus. An expensive update, but the war cannot roll it back.'
      },
      {
        text: 'Ask it to refine your technique',
        effect: { upgradeRandomCard: true, loseMaxHp: 4 },
        result: 'Dark tendrils rewrite a technique into something the war did not intend. Sharper, yes. But the edit cost you capacity — the gap took its margin. You are more precise now, and somehow less.'
      },
      {
        text: 'Drive it away',
        effect: { gainGold: 25 },
        result: 'You force the gap to collapse and something metallic drops from the absence. The war fills in the space immediately, relieved. Not much gained, but the system is stable again.'
      }
    ]
  },

  {
    id: 'blood_crown',
    title: 'Recursive Loop',
    description: 'An object the war produced and cannot reclaim — a crown of iron thorns, cycling endlessly through a self-referencing pattern. It sits atop the remains of everyone who wore it, each one feeding the next iteration. The loop wants a new input.',
    choices: [
      {
        text: 'Wear the crown',
        effect: { gainRelic: 'red_skull', loseHp: 25 },
        result: 'The thorns bite in and the loop accepts you. Power flows — but only at the edge, only when your own pattern is close to terminating. The crown optimizes for desperation. It knows exactly what it is doing.'
      },
      {
        text: 'Break the loop for materials',
        effect: { gainGold: 75, damage: 8 },
        result: 'The iron resists — recursive patterns do not want to end. Molten fragments spit and scar. Eventually the loop collapses into raw resources, and something that might have been a scream dissipates into the war\'s background noise.'
      }
    ]
  },

  {
    id: 'whispering_blade',
    title: 'Orphaned Instruction',
    description: 'A weapon embedded in a terminated combatant, still executing its last command. It hums at a frequency the war no longer monitors — an instruction orphaned when its owner stopped iterating. It wants to complete its function. The previous owner\'s expression suggests cooperation was not optional.',
    choices: [
      {
        text: 'Accept the instruction',
        effect: { upgradeRandomCard: true, damage: 10 },
        result: 'The blade completes its transfer — a combat technique from a pattern that no longer exists, refined by an iteration you never met. It cuts your hand in the process. Instructions from dead patterns are not gentle.'
      },
      {
        text: 'Salvage the hardware instead',
        effect: { gainGold: 90 },
        result: 'You strip the weapon\'s components without accepting its data. The instruction fades to static, then silence. Resources gained, pattern lost. The war does not mourn orphaned code.'
      },
      {
        text: 'Complete the termination properly',
        effect: { heal: 15, gainMaxHp: 3 },
        result: 'You set the blade down and close the process correctly. Something the war should have done and didn\'t. A clean shutdown restores something in you — the war\'s entropy reversed, briefly, by simple maintenance.'
      }
    ]
  },

  // ===== PATTERN ANOMALIES (Endless War voice — rewritten for consistency) =====
  {
    id: 'mirror_of_souls',
    title: 'Parallel Instance',
    description: 'A reflective surface that should not exist here — the war does not use mirrors. But this one shows a version of you from a different iteration: better-equipped, further along, more defined. It reaches toward the boundary between instances.',
    choices: [
      {
        text: 'Touch the boundary',
        effect: { gainMaxHp: 6, loseGold: 40 },
        result: 'Data transfers between instances. You are sturdier now — overwritten with a more robust version of yourself. Your resources are lighter. The other instance took its fee.'
      },
      {
        text: 'Collapse the parallel instance',
        effect: { gainGold: 55, loseMaxHp: 5 },
        result: 'The mirror fractures and resources pour through the gap. The other you ceases to exist, and something in your own capacity diminishes — the war does not allow something for nothing.'
      }
    ]
  },

  {
    id: 'wounded_knight',
    title: 'Damaged Pattern',
    description: 'A combatant the war deployed and did not reclaim. She leans against the wall, leaking data from a dozen breaches. Still functional enough to offer a trade — or vulnerable enough to exploit. The war does not intervene either way.',
    choices: [
      {
        text: 'Repair her and accept the trade',
        effect: { loseHp: 5, gainRelic: 'orichalcum' },
        result: 'You patch her breaches at the cost of your own integrity. She transfers a defensive module — dense, golden-veined, older than the current iteration. "It holds when nothing else does," she manages. The war pretends not to notice.'
      },
      {
        text: 'Salvage her resources',
        effect: { gainGold: 90, loseMaxHp: 3 },
        result: 'You strip what you can from a pattern too damaged to resist. Something in your own configuration degrades — the war taxes cruelty, apparently. Her monitoring processes track you as you leave.'
      },
      {
        text: 'Exchange combat data',
        effect: { upgradeRandomCard: true },
        result: 'Between system errors, she transfers a technique refined across iterations you will never see. Fair exchange — her accumulated knowledge for a moment of connection in the war\'s indifferent corridors.'
      }
    ]
  },

  {
    id: 'trapped_spirit',
    title: 'Contained Process',
    description: 'A pattern the war sealed inside a constraint loop — features shifting between states the war cannot resolve. It offers outputs for release and threatens outputs regardless. Contained processes are dramatic like that.',
    choices: [
      {
        text: 'Break the containment',
        effect: { gainRelic: 'lantern', loseHp: 10 },
        result: 'The process erupts from its loop, scoring your pattern as it passes. It leaves behind a luminous output as promised. At least it honored its contract, despite the damage.'
      },
      {
        text: 'Tighten the containment and demand resources',
        effect: { gainGold: 70, damage: 15 },
        result: 'The process ejects resources at high velocity. Each impact registers as damage. Profitable, if painful. The war does not regulate transactions between patterns.'
      },
      {
        text: 'Walk away from this',
        effect: { heal: 5 },
        result: 'Sometimes the optimal move is no move. You leave the process to the war\'s eventual garbage collection and feel oddly restored by the restraint. A rare efficiency.'
      }
    ]
  },

  {
    id: 'crystalline_cave',
    title: 'Energy Crystallization',
    description: 'The war stores surplus energy in crystalline formations when its processes run hot. This chamber is dense with them — blue nodes humming with restorative data, red nodes crackling with volatile resources. The wrong extraction could be healing or harmful.',
    choices: [
      {
        text: 'Absorb from the blue nodes',
        effect: { heal: 25, loseGold: 20 },
        result: 'Restorative energy flows through your pattern as the blue crystals dim. Some of your resources transmute into inert crystal dust — the war\'s exchange rate is not negotiable.'
      },
      {
        text: 'Extract the red nodes',
        effect: { gainGold: 100, damage: 15 },
        result: 'The red crystals fracture on extraction, each one a burst of heat and data. Your reserves are full of valuable material, and your hands are thoroughly burned. The war\'s energy storage was not designed for manual access.'
      },
      {
        text: 'Attune to the resonance',
        effect: { upgradeRandomCard: true, loseGold: 10 },
        result: 'The crystals\' frequency refines a technique into something the war never intended. A few resource units convert to inert matter in the process, but the optimization was worth it.'
      }
    ]
  },

  {
    id: 'toxic_spores',
    title: 'Contaminated Corridor',
    description: 'The war\'s biological processes have leaked into this passage — luminescent particulate drifts in patterns that suggest intent. Beautiful, and certainly corrosive. An alternate route exists, but it costs time the war does not give freely.',
    choices: [
      {
        text: 'Push through directly',
        effect: { damage: 12, gainGold: 35 },
        result: 'You seal your inputs and sprint. The particulate burns exposed surfaces, but you stumble over a terminated pattern halfway through — someone less fortunate, whose resources are now yours.'
      },
      {
        text: 'Take the alternate route',
        effect: { loseGold: 25, heal: 10 },
        result: 'The detour costs resources but the clean data flow is restorative. You arrive in better condition, if lighter. The war occasionally rewards patience, though it would never admit it.'
      }
    ]
  },

  {
    id: 'dark_chapel',
    title: 'Deprecated Shrine',
    description: 'An older version of the war had rituals. This chamber is a remnant — stone benches facing a processing altar where a dark flame still executes its ancient function. The inscriptions are in a protocol the war no longer uses, yet your pattern reads them fluently. They offer modification at a price.',
    choices: [
      {
        text: 'Request combat optimization',
        effect: { gainRelic: 'shuriken', loseHpPercent: 25 },
        result: 'The dark flame brands star-shaped markers into your pattern. Your attack sequences will chain faster now, each strike building toward critical mass. The old protocols were not gentle, but they were effective.'
      },
      {
        text: 'Request structural reinforcement',
        effect: { gainMaxHp: 7, loseGold: 45 },
        result: 'The shrine\'s old processes reinforce your pattern\'s capacity. Resources tarnish and collapse in your reserves — the shrine\'s fee, collected without negotiation. Deprecated does not mean powerless.'
      },
      {
        text: 'Salvage the altar\'s flame',
        effect: { gainGold: 65, loseMaxHp: 4 },
        result: 'The flame detaches but burns something fundamental in the transfer. It continues converting your capacity into resources in your reserves. The old war\'s processes do not come with off switches.'
      }
    ]
  },

  {
    id: 'bone_oracle',
    title: 'Predictive Engine',
    description: 'A ring of terminated patterns arranged in a processing formation — the war\'s early attempt at predictive modeling, still running on residual data. When you enter the formation, the outputs activate, projecting futures both useful and dire. They require input to continue.',
    choices: [
      {
        text: 'Feed resources for analysis (lose 55 gold)',
        effect: { loseGold: 55, upgradeRandomCard: true, gainMaxHp: 3 },
        result: 'The predictive engine processes your input and returns tactical refinements. Your pattern sharpens and your capacity expands. Expensive analysis, but the data is actionable.'
      },
      {
        text: 'Feed biological data',
        effect: { loseHp: 20, gainRelic: 'bag_of_marbles' },
        result: 'Your vital data pools into the formation and the engine produces a set of calibrated destabilizers. They will unbalance enemy patterns before combat begins. The engine considers this a fair transaction.'
      }
    ]
  },

  {
    id: 'wheel_of_fortune',
    title: 'Random Allocation Engine',
    description: 'The war occasionally introduces randomness — a deliberate break in its own patterns. This chamber contains one such engine: a massive mechanism that distributes outcomes without logic or fairness. An attendant pattern gestures toward it with enthusiasm it should not possess.',
    choices: [
      {
        text: 'Submit to allocation (costs 30 gold)',
        effect: { loseGold: 30, gainGold: 100, damage: 8 },
        result: 'The engine allocates generously — resources cascade from its mechanism. A secondary output also activates, because the war\'s randomness includes consequences. The attendant pattern applauds, which is unsettling.'
      },
      {
        text: 'Double allocation (costs 60 gold)',
        effect: { loseGold: 60, gainRelic: 'blood_vial', damage: 15 },
        result: 'Two cycles yield a regenerative output and considerably more damage from the engine\'s secondary mechanisms. The attendant pattern gives a standing ovation it was definitely not programmed for.'
      },
      {
        text: 'Extract resources from the attendant',
        effect: { gainGold: 45, loseHp: 5 },
        result: 'The attendant pattern intercepts your attempt and delivers a surprisingly forceful correction. You still manage to extract its resource cache. It vibrates with displeasure but lacks the authority to escalate.'
      }
    ]
  },

  {
    id: 'devil_game',
    title: 'The Broker',
    description: 'A pattern that operates outside the war\'s official economy — it has carved a space the war does not monitor and offers trades the war would not approve. Two containers sit on a surface between you. It shuffles them with inhuman speed and gestures for you to choose.',
    choices: [
      {
        text: 'Choose the left container',
        effect: { gainMaxHp: 10, loseGold: 75 },
        result: 'Capacity floods your pattern, expanding what the war allocated. The broker absorbs your resources with visible satisfaction. "Come back when you have more to trade," its output reads. The war pretends this did not happen.'
      },
      {
        text: 'Choose the right container',
        effect: { gainGold: 100, loseMaxHp: 6 },
        result: 'Resources fill your reserves but something in your pattern\'s foundation thins. The broker\'s output flickers: "The war will enjoy watching you count resources as your ceiling drops."'
      },
      {
        text: 'Reject the terms',
        effect: { damage: 10, upgradeRandomCard: true },
        result: 'Both containers rupture, their contents merging in transit. The broker\'s output reads something like laughter. "Unpredictable. How useful." Power and damage arrive simultaneously.'
      }
    ]
  },

  {
    id: 'ancient_guardian',
    title: 'Dormant Sentinel',
    description: 'The war\'s oldest defensive pattern — massive, inert, still drawing power from infrastructure that predates everything else in this corridor. Its core is exposed, glowing with stored energy. Extracting it would be profitable. Activating the sentinel would be inadvisable.',
    choices: [
      {
        text: 'Extract the core carefully',
        effect: { gainRelic: 'meat_on_the_bone', damage: 20 },
        result: 'The core detaches but the sentinel\'s last defensive reflex fires. You scramble clear clutching a module that pulses with restorative energy. The sentinel collapses, its pattern finally fully terminated.'
      },
      {
        text: 'Siphon energy without extraction',
        effect: { heal: 20, gainMaxHp: 4 },
        result: 'You draw from the core without disturbing the sentinel\'s pattern. Energy flows like data through a clean connection. The sentinel remains dormant. Sometimes the careful approach yields the best output.'
      },
      {
        text: 'Scavenge the surrounding area',
        effect: { gainGold: 70 },
        result: 'Previous patterns were not so careful. Their scattered resources litter the area around the sentinel. You collect what you can, stepping around the dormant pattern with appropriate caution.'
      }
    ]
  }
];

export default events;
