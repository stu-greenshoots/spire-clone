/**
 * RALPH WIGGUM'S SPIRE ASCENT - AI Art Generation Prompts
 *
 * Use these prompts with AI image generators (Midjourney, DALL-E, Stable Diffusion)
 * Style: Simpsons cartoon art style, bright colors, thick outlines, comedic
 *
 * Recommended settings:
 * - Style: Simpsons animated series, Matt Groening style
 * - Aspect ratio: Cards (2:3), Enemies (1:1), Relics (1:1)
 * - Quality: High detail, clean lines
 */

// ============================================
// CARD ART PROMPTS
// ============================================
// Format: cardId -> prompt for AI image generator

export const CARD_ART_PROMPTS = {
  // ========== BASIC CARDS ==========
  strike: {
    prompt: "Ralph Wiggum swinging a crayon like a sword, determined expression, Simpsons cartoon style, yellow skin, blue shorts, pink shirt, dramatic action pose, colorful classroom background",
    ralphQuote: "I'm a unitard!",
    description: "Basic attack - Ralph's mighty crayon strike"
  },
  defend: {
    prompt: "Ralph Wiggum hiding behind a lunch tray used as a shield, nervous but brave expression, Simpsons cartoon style, cafeteria food splattered on tray, school hallway background",
    ralphQuote: "Me fail English? That's unpossible!",
    description: "Basic defense - lunch tray shield"
  },
  bash: {
    prompt: "Ralph Wiggum headbutting with his helmet on backwards, stars circling his head, goofy smile, Simpsons cartoon style, playground background, impact lines",
    ralphQuote: "I bent my wookie!",
    description: "Heavy attack with stun - helmet headbutt"
  },

  // ========== COMMON ATTACKS ==========
  anger: {
    prompt: "Ralph Wiggum having a tantrum, throwing crayons everywhere, red face, tears flying, Simpsons cartoon style, broken toys around him, dramatic lighting",
    ralphQuote: "I'm learnding!",
    description: "Rage attack - crayon tantrum"
  },
  cleave: {
    prompt: "Ralph Wiggum spinning with arms out hitting multiple things, dizzy spiral eyes, Simpsons cartoon style, playground equipment and kids scattered, motion blur effect",
    ralphQuote: "When I grow up, I want to be a principal or a caterpillar!",
    description: "AOE attack - dizzy spin"
  },
  clothesline: {
    prompt: "Ralph running with a jump rope stretched out, accidentally clotheslining himself, Simpsons cartoon style, playground background, comedic action",
    ralphQuote: "My cat's breath smells like cat food!",
    description: "Attack with debuff - jump rope attack"
  },
  headbutt: {
    prompt: "Ralph Wiggum leading with his oversized head, determined expression, glowing forehead, Simpsons cartoon style, impact crater forming, comic book action lines",
    ralphQuote: "Hi Super Nintendo Chalmers!",
    description: "Strong hit - mega headbutt"
  },
  ironWave: {
    prompt: "Ralph in a suit of armor made from cafeteria trays, waddling forward, Simpsons cartoon style, clanking metal effects, school hallway, determined expression",
    ralphQuote: "I dress myself!",
    description: "Block and attack - tray armor charge"
  },
  pommelStrike: {
    prompt: "Ralph hitting something with the eraser end of a giant pencil, surprised expression, Simpsons cartoon style, classroom setting, eraser dust clouds",
    ralphQuote: "That's where I saw the leprechaun!",
    description: "Attack and draw - pencil bonk"
  },
  swordBoomerang: {
    prompt: "Ralph throwing his lunchbox which flies around chaotically, sandwiches spilling out, Simpsons cartoon style, dotted flight path, playground background",
    ralphQuote: "The leprechaun tells me to burn things!",
    description: "Multi-hit random - flying lunchbox"
  },
  thunderclap: {
    prompt: "Ralph clapping his hands together creating a shockwave of glitter and paste, excited expression, Simpsons cartoon style, sparkle effects, art classroom",
    ralphQuote: "I ate the purple berries!",
    description: "AOE attack with vulnerable - glitter explosion"
  },
  twinStrike: {
    prompt: "Ralph punching with both fists simultaneously, tongue sticking out in concentration, Simpsons cartoon style, double impact effects, schoolyard",
    ralphQuote: "Slow down! My legs don't know how to be as long as yours!",
    description: "Double hit - double fist punch"
  },
  wildStrike: {
    prompt: "Ralph flailing wildly with a ruler, hitting everything including himself, chaotic energy, Simpsons cartoon style, objects flying everywhere, classroom destruction",
    ralphQuote: "I found a moonrock in my nose!",
    description: "High damage with penalty - wild ruler swing"
  },
  bodySlam: {
    prompt: "Ralph belly flopping onto the ground, massive impact wave, joyful expression, Simpsons cartoon style, cafeteria floor cracking, lunch trays flying",
    ralphQuote: "Go banana!",
    description: "Block-based damage - belly flop"
  },
  clash: {
    prompt: "Ralph in full berserker mode surrounded only by crayons, war paint on face, Simpsons cartoon style, battlefield of broken pencils, intense expression",
    ralphQuote: "What's a battle?",
    description: "Attack-only restriction - all-out assault"
  },
  heavyBlade: {
    prompt: "Ralph dragging an impossibly large novelty pencil, struggling with weight, Simpsons cartoon style, pencil leaving groove in floor, school hallway, determined face",
    ralphQuote: "My daddy's gonna find you!",
    description: "Strength-scaling attack - mega pencil"
  },

  // ========== COMMON SKILLS ==========
  armaments: {
    prompt: "Ralph duct-taping supplies to himself as armor, crayons, rulers, erasers, proud expression, Simpsons cartoon style, art supply closet, crafting scene",
    ralphQuote: "I'm a furniture!",
    description: "Block and upgrade - supply armor"
  },
  flexCard: {
    prompt: "Ralph flexing tiny arm muscles, imaginary biceps drawn on arms with marker, confident pose, Simpsons cartoon style, mirror reflection showing him as buff",
    ralphQuote: "I'm pedaling backwards!",
    description: "Temporary strength - flex pose"
  },
  havoc: {
    prompt: "Ralph grabbing random things from a pile and throwing them, chaos everywhere, manic grin, Simpsons cartoon style, school supplies flying, lost and found box",
    ralphQuote: "Even Mommy's afraid of him!",
    description: "Random card play - grab bag chaos"
  },
  shrugItOff: {
    prompt: "Ralph shrugging with a confused smile while things bounce off him, invincible ignorance, Simpsons cartoon style, various projectiles deflecting, playground",
    ralphQuote: "I heard your dad went into a restaurant...",
    description: "Block and draw - confusion shield"
  },
  trueGrit: {
    prompt: "Ralph standing firm with gritted teeth, dirty face, torn clothes, determined, Simpsons cartoon style, schoolyard dirt, dramatic western lighting",
    ralphQuote: "The doctor said I wouldn't have so many nosebleeds if I kept my finger out of there",
    description: "Block with exhaust - tough it out"
  },
  warcry: {
    prompt: "Ralph screaming at the top of his lungs, veins popping, Simpsons cartoon style, sound wave effects, other students covering ears, cafeteria",
    ralphQuote: "You're the one who's in big trouble!",
    description: "Draw and reorder - battle scream"
  },
  sentinel: {
    prompt: "Ralph standing guard with a crossing guard sign, serious hall monitor expression, Simpsons cartoon style, school hallway, official looking",
    ralphQuote: "I'm not a girl!",
    description: "Block with energy refund - hall monitor duty"
  },

  // ========== UNCOMMON ATTACKS ==========
  carnage: {
    prompt: "Ralph covered in finger paint looking like a horror movie, innocent smile, Simpsons cartoon style, red and orange paint everywhere, art room destruction",
    ralphQuote: "My worm went in my mouth and then I ate it!",
    description: "Ethereal high damage - finger paint frenzy"
  },
  dropkick: {
    prompt: "Ralph attempting a dropkick, legs going in wrong direction, confused expression, Simpsons cartoon style, playground equipment, physics-defying pose",
    ralphQuote: "I'm Idaho!",
    description: "Conditional combo - awkward dropkick"
  },
  hemokinesis: {
    prompt: "Ralph with a nosebleed shooting like a laser, surprised expression, Simpsons cartoon style, dramatic blood fountain, tissue box nearby, nurse's office",
    ralphQuote: "It tastes like burning!",
    description: "HP cost attack - nosebleed blast"
  },
  pummel: {
    prompt: "Ralph doing rapid tiny punches like a cartoon windmill, determined face, Simpsons cartoon style, motion lines, many small impact effects",
    ralphQuote: "I can't go to prison! I'm too little!",
    description: "Multi-hit exhaust - flurry of fists"
  },
  rampage: {
    prompt: "Ralph running through a classroom destroying everything, escalating chaos, Simpsons cartoon style, desks flying, papers scattered, getting more intense",
    ralphQuote: "This is the sandbox! I'm not allowed in the deep end!",
    description: "Scaling damage - building rampage"
  },
  recklessCharge: {
    prompt: "Ralph charging forward with eyes closed, running into wall, Simpsons cartoon style, impact stars, dazed expression afterward, hallway",
    ralphQuote: "Miss Hoover, I glued my head to my shoulder!",
    description: "Fast attack with penalty - blind charge"
  },
  uppercut: {
    prompt: "Ralph performing an accidental uppercut while raising hand to ask question, surprised student flying, Simpsons cartoon style, classroom, question marks",
    ralphQuote: "I'm special!",
    description: "Attack with double debuff - question uppercut"
  },
  whirlwind: {
    prompt: "Ralph spinning like a tornado destroying everything in radius, dizzy spirals, Simpsons cartoon style, school supplies flying in vortex, X-energy symbols",
    ralphQuote: "You smell like dead bunnies!",
    description: "X-cost AOE - tornado spin"
  },
  searingBlow: {
    prompt: "Ralph with a flaming fist (on fire from hot cheetos), amazed expression, Simpsons cartoon style, dramatic flames, snack bag nearby, cafeteria",
    ralphQuote: "Oh boy! Sleep! That's where I'm a Viking!",
    description: "Infinitely upgradeable - hot cheeto fist"
  },
  perfectedStrike: {
    prompt: "Ralph surrounded by all his strike variants, epic pose, Simpsons cartoon style, multiple crayons floating around him, glowing aura, mastery moment",
    ralphQuote: "Super Fun Happy Slide!",
    description: "Strike synergy - ultimate crayon master"
  },
  bludgeon: {
    prompt: "Ralph swinging the leg of a desk like a club, Babe Ruth pose, Simpsons cartoon style, massive impact incoming, dramatic angle, classroom destruction",
    ralphQuote: "That's a big finger!",
    description: "Heavy damage - desk leg demolisher"
  },
  feed: {
    prompt: "Ralph eating defeated homework and getting stronger, glowing with power, Simpsons cartoon style, paper bits flying into mouth, growing larger",
    ralphQuote: "I picked a red one!",
    description: "Kill for max HP - homework feast"
  },
  fiendFire: {
    prompt: "Ralph surrounded by burning papers from his exhaust pile, pyromaniac smile, Simpsons cartoon style, flaming tests and assignments, fire everywhere",
    ralphQuote: "Burn them all! (giggles)",
    description: "Exhaust hand for damage - paper inferno"
  },
  immolate: {
    prompt: "Ralph starting a massive paste fire that spreads everywhere, surprised but happy, Simpsons cartoon style, blue paste flames, art classroom ablaze",
    ralphQuote: "We're going to Moe's!!!",
    description: "AOE damage with burn - paste fire"
  },
  reaper: {
    prompt: "Ralph dressed as grim reaper for halloween, scythe made of rulers, healing as he attacks, Simpsons cartoon style, costume slightly askew, spooky classroom",
    ralphQuote: "I'm a ghost cow!",
    description: "AOE lifesteal - costume reaper"
  },

  // ========== RARE SKILLS ==========
  doubleTap: {
    prompt: "Ralph about to high-five himself, determined expression, two hands glowing, Simpsons cartoon style, energy doubling effect, excited face",
    ralphQuote: "You got the dud!",
    description: "Next attack plays twice - double power"
  },
  exhume: {
    prompt: "Ralph digging through trash can finding his discarded cards, treasure hunter expression, Simpsons cartoon style, garbage pile, found card glowing",
    ralphQuote: "I found something! It was under E!",
    description: "Recover exhausted card - dumpster diving"
  },
  impervious: {
    prompt: "Ralph wrapped entirely in bubble wrap, nothing can touch him, serene smile, Simpsons cartoon style, impacts bouncing off, protective cocoon",
    ralphQuote: "I'm not afraid anymore!",
    description: "Massive block - bubble wrap fortress"
  },
  limitBreak: {
    prompt: "Ralph breaking his own limits, muscles expanding cartoon style, determination face, Simpsons cartoon style, power aura doubling, dramatic transformation",
    ralphQuote: "Now I'M the principal!",
    description: "Double strength - power surge"
  },
  offering: {
    prompt: "Ralph giving away his lunch for power, noble sacrifice pose, Simpsons cartoon style, sandwich ascending, energy received, cafeteria altar",
    ralphQuote: "It's a sacrifice I'm willing to make!",
    description: "HP for energy and draw - lunch sacrifice"
  },

  // ========== POWERS ==========
  barricade: {
    prompt: "Ralph behind permanent fort made of desks, commander pose, Simpsons cartoon style, impressive desk fort structure, permanent establishment",
    ralphQuote: "I live here now!",
    description: "Block persists - desk fortress"
  },
  berserk: {
    prompt: "Ralph going berserk with heart eyes, vulnerable but gaining energy, Simpsons cartoon style, manic expression, love-fueled rage, pink aura",
    ralphQuote: "Lisa's my girlfriend!",
    description: "Vulnerable for energy - love rage"
  },
  brutality: {
    prompt: "Ralph looking brutal but cute, slight damage for card draw, Simpsons cartoon style, tough expression, bandaged but determined, schoolyard warrior",
    ralphQuote: "I hurt myself today...",
    description: "HP loss for draws - tough learning"
  },
  combust: {
    prompt: "Ralph spontaneously combusting slightly each turn, damaging all around him, Simpsons cartoon style, small flames, calm expression despite fire",
    ralphQuote: "Fire makes everything better!",
    description: "Self damage AOE - spontaneous combustion"
  },
  corruption: {
    prompt: "Ralph's eyes glowing purple, skills become free but exhaust, Simpsons cartoon style, dark aura, corrupted but powerful, chaotic energy",
    ralphQuote: "The leprechaun whispers to me...",
    description: "Free skills but exhaust - leprechaun deal"
  },
  darkEmbrace: {
    prompt: "Ralph happily embracing discarded cards, drawing new ones, Simpsons cartoon style, warm hug, cards transforming into new cards, hopeful",
    ralphQuote: "I like you!",
    description: "Draw on exhaust - card recycling"
  },
  demonForm: {
    prompt: "Ralph transforming into a powerful demon version, but still cute, Simpsons cartoon style, horns and tail, growing strength, Halloween costume power",
    ralphQuote: "I'm a demon! Weee!",
    description: "Strength each turn - demon ralph"
  },
  evolve: {
    prompt: "Ralph evolving pokemon-style when drawing status cards, excited expression, Simpsons cartoon style, evolution sparkles, getting better from bad things",
    ralphQuote: "I'm EVOLVING!",
    description: "Draw on status - adaptive learning"
  },
  feelNoPain: {
    prompt: "Ralph with a huge smile while everything around him is chaos, block gained from exhausts, Simpsons cartoon style, zen expression, protective oblivion",
    ralphQuote: "I don't feel anything!",
    description: "Block on exhaust - happy ignorance"
  },
  fireBreathing: {
    prompt: "Ralph breathing fire when he draws bad cards, dragon costume, Simpsons cartoon style, fire breath, triumphant despite problems, costume play",
    ralphQuote: "I'm a dragon!",
    description: "Damage on status draw - fire breath"
  },
  inflame: {
    prompt: "Ralph flexing while on fire, getting stronger, proud pose, Simpsons cartoon style, flames and muscles, confident smile, power up moment",
    ralphQuote: "I'm strong now!",
    description: "Permanent strength - fired up"
  },
  juggernaut: {
    prompt: "Ralph as unstoppable juggernaut, dealing damage whenever he blocks, Simpsons cartoon style, X-Men parody, helmet, momentum building",
    ralphQuote: "I'm the JUGGER-RALPH!",
    description: "Damage on block gain - unstoppable"
  },
  metallicize: {
    prompt: "Ralph slowly turning metallic, gaining block each turn, Simpsons cartoon style, silver skin, robot transformation, cool pose",
    ralphQuote: "I'm made of metal! Beep boop!",
    description: "Block each turn - metal skin"
  },
  rupture: {
    prompt: "Ralph getting stronger every time he hurts himself, mad expression, Simpsons cartoon style, power from pain, bandages becoming medals",
    ralphQuote: "Pain makes me stronger!",
    description: "Strength on HP loss - pain power"
  },

  // ========== STATUS/CURSE CARDS ==========
  wound: {
    prompt: "A bleeding boo-boo with band-aid, sad face drawn on it, Simpsons cartoon style, simple wound graphic, can't do anything",
    ralphQuote: "Ow, my everything!",
    description: "Unplayable status - ouchie"
  },
  dazed: {
    prompt: "Stars and birds circling Ralph's head, confused expression, Simpsons cartoon style, dizzy spirals, ethereal daze effect",
    ralphQuote: "I see stars!",
    description: "Unplayable ethereal - dizziness"
  },
  burn: {
    prompt: "A small fire burning Ralph's hand, concerned expression, Simpsons cartoon style, flame graphic, damage at turn end",
    ralphQuote: "It burns! But I like it!",
    description: "Unplayable with damage - fire boo-boo"
  },
  slimed: {
    prompt: "Ralph covered in green cafeteria slime, disgusted expression, Simpsons cartoon style, dripping goo, yucky texture",
    ralphQuote: "It's in my ear!",
    description: "Exhaust status - slime covered"
  },
  void: {
    prompt: "A black hole of confusion in Ralph's brain, spiral eyes, Simpsons cartoon style, dark vortex, energy drain visual",
    ralphQuote: "My brain stopped!",
    description: "Energy drain status - mind void"
  },
  curse_pain: {
    prompt: "A curse manifesting as constant stubbed toe, pain expression, Simpsons cartoon style, red toe, stars of pain",
    ralphQuote: "My toe!",
    description: "Curse - constant pain"
  },
  curse_regret: {
    prompt: "Ralph holding a failed test with regret, shame spiral, Simpsons cartoon style, F grade glowing, sadness aura",
    ralphQuote: "I should have studied!",
    description: "Curse - regret damage"
  },
  curse_doubt: {
    prompt: "Ralph questioning everything, doubt clouds overhead, Simpsons cartoon style, question marks, weak aura",
    ralphQuote: "Am I real?",
    description: "Curse - self doubt weakness"
  },
  curse_decay: {
    prompt: "Ralph's sandwich decaying, spreading decay energy, Simpsons cartoon style, rotting lunch, damage aura",
    ralphQuote: "My sandwich...",
    description: "Curse - decay damage"
  },

  // ========== BLOODLETTING (missed above) ==========
  bloodletting: {
    prompt: "Ralph giving blood at school nurse for energy cookies, brave face, Simpsons cartoon style, bandage on arm, cookie reward, nurse's office",
    ralphQuote: "I'm helping!",
    description: "HP for energy - blood donation"
  }
};


// ============================================
// ENEMY ART PROMPTS
// ============================================

export const ENEMY_ART_PROMPTS = {
  // ========== ACT 1 - SPRINGFIELD ELEMENTARY ==========
  cultist: {
    prompt: "Nelson Muntz in dark robes performing a bully ritual, 'HA HA' symbol glowing, Simpsons cartoon style, schoolyard cult leader, menacing but comedic",
    name: "Nelson the Bully Cultist",
    description: "Performs ritual to grow stronger"
  },
  jawWorm: {
    name: "Ralph's Pet Worm (Giant)",
    prompt: "A giant friendly earthworm Ralph found, oversized googly eyes, Simpsons cartoon style, playground dirt, surprisingly menacing despite cute, Ralph riding on back",
    description: "Ralph's oversized pet from the sandbox"
  },
  louse_red: {
    name: "Angry Head Louse",
    prompt: "A cartoonish red head louse from Springfield Elementary's lice outbreak, angry expression, Simpsons cartoon style, gross but cute, tiny boxing gloves",
    description: "Product of poor hygiene"
  },
  louse_green: {
    name: "Sickly Head Louse",
    prompt: "A green head louse looking ill but mean, Simpsons cartoon style, Springfield Elementary outbreak, spits web, gross and comedic",
    description: "The diseased variety"
  },
  slime_small: {
    name: "Cafeteria Mystery Meat (Small)",
    prompt: "A small blob of sentient cafeteria mystery meat, googly eyes, Simpsons cartoon style, green goop, lunch lady Doris' creation gone wrong",
    description: "Living lunch meat"
  },
  slime_medium: {
    name: "Cafeteria Mystery Meat (Medium)",
    prompt: "A medium-sized sentient cafeteria blob, more formed features, Simpsons cartoon style, multiple eyes, dripping sauce, aggressive",
    description: "Evolved lunch monster"
  },
  slime_large: {
    name: "Cafeteria Blob Boss",
    prompt: "A massive sentient cafeteria slime monster, Lunch Lady Doris' face visible inside, Simpsons cartoon style, full cafeteria invasion, splits into smaller blobs",
    description: "The ultimate lunch horror"
  },
  spike_slime_small: {
    name: "Jello Cube (Small)",
    prompt: "A small spiked jello cube from the cafeteria, bouncing menace, Simpsons cartoon style, red jello, plastic fork spikes",
    description: "Weaponized dessert"
  },
  spike_slime_medium: {
    name: "Jello Cube (Medium)",
    prompt: "A medium spiked jello cube, more defined features, Simpsons cartoon style, flame pattern, cafeteria terror, bouncy threat",
    description: "Flaming jello monster"
  },
  fungiBeast: {
    name: "Mushroom from Ralph's Locker",
    prompt: "A sentient mushroom creature grown from Ralph's forgotten lunch, friendly but toxic expression, Simpsons cartoon style, spore cloud, locker ecosystem",
    description: "Locker life form"
  },
  looter: {
    name: "Jimbo the Locker Thief",
    prompt: "Jimbo Jones stealing from lockers, bully pose, Simpsons cartoon style, stolen items falling from pockets, purple shirt, Springfield delinquent",
    description: "Steals your lunch money"
  },
  gremlinNob: {
    name: "Gremlin Groundskeeper Willie",
    prompt: "Groundskeeper Willie in gremlin form, muscles bulging, Scottish rage, Simpsons cartoon style, rake weapon, shirtless and furious, green tint",
    description: "Elite Scottish menace"
  },
  lagavulin: {
    name: "The Sleeping Janitor",
    prompt: "A heavily armored janitor sleeping in closet, wake at your peril, Simpsons cartoon style, mop and bucket armor, snoring Z's, dormant threat",
    description: "Don't wake him"
  },
  sentryA: {
    name: "Hall Monitor Drone",
    prompt: "A robotic hall monitor with laser eyes, Springfield Elementary security system, Simpsons cartoon style, floating drone, 'HALL PASS?' display, three copies",
    description: "Automated hall patrol"
  },

  // ========== ACT 2 - SPRINGFIELD TOWN ==========
  chosen: {
    name: "Burns' Chosen Guard",
    prompt: "Mr. Burns' elite guard in yellow hazmat suit, Simpsons cartoon style, nuclear plant worker gone wrong, radiation symbol, loyal minion",
    description: "Nuclear plant enforcer"
  },
  byrd: {
    name: "Three-Eyed Crow",
    prompt: "A three-eyed mutant crow from the nuclear plant, Blinky's cousin, Simpsons cartoon style, flying menace, radioactive glow, pecking attack",
    description: "Mutant bird of Springfield"
  },
  snakePlant: {
    name: "Mutant Plant from Power Plant",
    prompt: "A mutated venus flytrap from nuclear runoff, three heads, Simpsons cartoon style, toxic colors, nuclear plant greenhouse, snapping jaws",
    description: "Radioactive vegetation"
  },
  centurion: {
    name: "Fat Tony's Guard",
    prompt: "Fat Tony's mob guard in suit, intimidating but comedic, Simpsons cartoon style, pinstripe suit, slicked hair, Springfield mafia enforcer",
    description: "Legitimate businessman's associate"
  },
  bookOfStabbing: {
    name: "Sideshow Bob's Revenge Diary",
    prompt: "Sideshow Bob's diary come to life, pages full of 'DIE BART DIE', Simpsons cartoon style, floating menacing book, stabbing pages, dramatic",
    description: "Cursed tome of revenge"
  },
  gremlinLeader: {
    name: "Krusty the Gremlin King",
    prompt: "Krusty the Clown as a gremlin leader, commanding smaller gremlins, Simpsons cartoon style, tattered clown outfit, cigar, maniacal laugh",
    description: "Leader of the Krusty Gremlins"
  },
  slaverBlue: {
    name: "Mr. Burns' Taskmaster",
    prompt: "Smithers in evil taskmaster mode, whip and chains, Simpsons cartoon style, serving Mr. Burns' dark will, professional evil, nervous smile",
    description: "Burns' loyal enforcer"
  },

  // ========== ACT 3 - TREEHOUSE OF HORROR ==========
  writhing_mass: {
    name: "Kang or Kodos (Unclear)",
    prompt: "One of the Rigellians (Kang or Kodos) in writhing tentacle form, drooling, Simpsons cartoon style, alien terror, UFO background, Halloween episode vibes",
    description: "Alien nightmare"
  },
  giant_head: {
    name: "Giant Olmec Head",
    prompt: "The Olmec head from Bart's treehouse, giant and counting down, Simpsons cartoon style, ancient stone face, glowing eyes, ominous countdown",
    description: "Ancient doom counter"
  },
  reptomancer: {
    name: "Snake Handling Reverend",
    prompt: "A sinister snake-handling preacher summoning serpents, Simpsons cartoon style, Springfield church gone wrong, multiple snakes, dramatic robes",
    description: "Summons dangerous snakes"
  },
  dagger: {
    name: "Possessed Knife",
    prompt: "A floating possessed kitchen knife from Marge's kitchen, evil glow, Simpsons cartoon style, Treehouse of Horror style, about to explode",
    description: "Living weapon minion"
  },
  orbWalker: {
    name: "Evil Krusty Toy Robot",
    prompt: "An evil Krusty toy robot shooting lasers, glowing orb center, Simpsons cartoon style, malfunctioning merchandise, clown horror",
    description: "Defective toy menace"
  },
  spiker: {
    name: "Lard Lad Minion",
    prompt: "A small spiked version of Lard Lad donut shop mascot, spike covered donut shield, Simpsons cartoon style, angry fast food, thorny texture",
    description: "Spiked mascot"
  },

  // ========== BOSSES ==========
  slimeBoss: {
    name: "MEGA CAFETERIA BLOB",
    prompt: "The ultimate cafeteria slime boss, Lunch Lady Doris fully absorbed, enormous and splitting, Simpsons cartoon style, entire cafeteria consumed, epic scale",
    description: "Act 1 Boss - Lunch Lady's Revenge"
  },
  theGuardian: {
    name: "THE GUARDIAN (Radioactive Man Armor)",
    prompt: "A massive suit of Radioactive Man armor come to life, mode shifting defenses, Simpsons cartoon style, epic superhero robot, nuclear powered, dramatic poses",
    description: "Act 1 Boss - Comic Come to Life"
  },
  hexaghost: {
    name: "THE HEXAGHOST (Six Ghosts of Christmas)",
    prompt: "Six ghostly Christmas spirits merged into one entity, burning and dividing, Simpsons cartoon style, Treehouse of Horror Christmas special, fiery specters",
    description: "Act 1 Boss - Holiday Horror"
  },
  theChamp: {
    name: "DREDERICK TATUM",
    prompt: "Drederick Tatum the boxer as final boss, championship belt, massive fists, Simpsons cartoon style, boxing ring, defensive stance then ANGER mode, gold chains",
    description: "Act 2 Boss - The Champion"
  },
  awakened_one: {
    name: "AWAKENED MR. BURNS",
    prompt: "Mr. Burns awakened to full power, demonic form, rebirth ability, Simpsons cartoon style, nuclear glow, two phases, 'Excellent' pose, Smithers cowering",
    description: "Act 3 Boss - Immortal Billionaire"
  },
  timeEater: {
    name: "THE TIME EATER (Professor Frink's Mistake)",
    prompt: "A time-eating entity created by Professor Frink's experiment, clock motif, Simpsons cartoon style, eating turns and time, scientific horror, counting cards",
    description: "Act 3 Boss - Time Devourer"
  },
  corruptHeart: {
    name: "THE CORRUPT HEART OF SPRINGFIELD",
    prompt: "The literal corrupt heart of Springfield, all darkness manifested, Simpsons cartoon style, tentacles of corruption, invincible shield, beat of death ability, final final boss",
    description: "Final Boss - City's Dark Core"
  }
};


// ============================================
// RELIC ART PROMPTS
// ============================================

export const RELIC_ART_PROMPTS = {
  // ========== STARTER ==========
  burning_blood: {
    name: "Ralph's Band-Aid Collection",
    prompt: "A collection of used band-aids that heal Ralph, glowing red, Simpsons cartoon style, slightly gross but magical, heart shape arrangement",
    description: "Heals 6 HP after combat"
  },

  // ========== COMMON ==========
  anchor: {
    name: "Ralph's Lucky Anchor Sticker",
    prompt: "A shiny anchor sticker from Ralph's collection, protective glow, Simpsons cartoon style, gold star substitute, scratched but treasured",
    description: "10 Block at combat start"
  },
  bag_of_preparation: {
    name: "Ralph's Oversized Backpack",
    prompt: "Ralph's enormous backpack full of everything, bulging with supplies, Simpsons cartoon style, crayon tips poking out, magical storage",
    description: "Draw 2 extra at start"
  },
  blood_vial: {
    name: "Ralph's Juice Box",
    prompt: "A mysterious juice box that heals Ralph, red liquid, Simpsons cartoon style, 'BLOOD ORANGE' label crossed out, slightly ominous",
    description: "Heal 2 at combat start"
  },
  bronze_scales: {
    name: "Blinky the Fish Scale",
    prompt: "A scale from Blinky the three-eyed fish, radioactive glow, Simpsons cartoon style, thorns damage effect, nuclear sparkle",
    description: "3 damage on hit"
  },
  centennial_puzzle: {
    name: "Ralph's 1000 Piece Puzzle (3 pieces)",
    prompt: "Three puzzle pieces Ralph thinks is the whole puzzle, proud arrangement, Simpsons cartoon style, obvious missing pieces, first HP loss trigger",
    description: "Draw 3 on first HP loss"
  },
  lantern: {
    name: "Krusty Brand Flashlight",
    prompt: "A Krusty brand flashlight that barely works, first turn energy, Simpsons cartoon style, Krusty face, batteries falling out",
    description: "1 Energy first turn"
  },
  nunchaku: {
    name: "Ralph's Safety Scissors",
    prompt: "Ralph's safety scissors used as weapons, 10 attack counter, Simpsons cartoon style, rounded tips, surprisingly effective, training tool",
    description: "Energy per 10 attacks"
  },
  oddly_smooth_stone: {
    name: "Ralph's 'Moon Rock' (Actually a Potato)",
    prompt: "A potato Ralph believes is a moon rock, smooth and proud display, Simpsons cartoon style, space sparkles added by Ralph, dexterity boost",
    description: "1 Dexterity at start"
  },
  orichalcum: {
    name: "Springfield Elementary Gold Star",
    prompt: "A gold star sticker from school, protective when no block, Simpsons cartoon style, participation award, proud display, shimmering",
    description: "6 Block if no block at turn end"
  },
  pen_nib: {
    name: "Lisa's Stolen Pen",
    prompt: "A fancy pen Ralph 'borrowed' from Lisa, powerful writing, Simpsons cartoon style, 10th attack double damage, saxophone engraved",
    description: "Every 10th attack doubles"
  },
  vajra: {
    name: "Homer's Dumbbell (1 lb)",
    prompt: "Homer's tiny dumbbell Ralph uses for strength, comedically light, Simpsons cartoon style, 1 LB written huge, strength at start",
    description: "1 Strength at start"
  },
  red_skull: {
    name: "Red Crayon (Broken)",
    prompt: "Ralph's broken red crayon, power when low HP, Simpsons cartoon style, snapped in half, determined red color, emergency power",
    description: "3 Strength below 50% HP"
  },
  bag_of_marbles: {
    name: "Ralph's Marble Collection",
    prompt: "Ralph's precious marble collection, causes enemies to slip, Simpsons cartoon style, colorful spheres, spilled on floor effect",
    description: "Vulnerable all at start"
  },

  // ========== UNCOMMON ==========
  blue_candle: {
    name: "Birthday Candle (Cursed)",
    prompt: "A birthday candle that never goes out, curse playing, Simpsons cartoon style, eternal flame, slightly sinister glow, HP cost",
    description: "Play curses for HP"
  },
  bottled_flame: {
    name: "Bottled Firecracker",
    prompt: "A firecracker in a bottle Ralph saved, attack in hand, Simpsons cartoon style, fuse still lit somehow, dangerous and exciting",
    description: "Start with an attack"
  },
  eternal_feather: {
    name: "Bird from Bart's Slingshot",
    prompt: "A feather from a bird Bart shot down, healing at rest, Simpsons cartoon style, slightly tattered, peaceful despite origin",
    description: "Heal per 5 cards at rest"
  },
  horn_cleat: {
    name: "Football Cleat (Signed)",
    prompt: "A football cleat signed by someone, 2nd turn block, Simpsons cartoon style, Springfield Isotopes logo, sporty power",
    description: "14 Block on turn 2"
  },
  kunai: {
    name: "Butter Knife (Sharpened)",
    prompt: "A butter knife Ralph sharpened, dexterity on attacks, Simpsons cartoon style, obviously dull but Ralph believes, 3 attack counter",
    description: "Dexterity per 3 attacks"
  },
  letter_opener: {
    name: "Principal Skinner's Letter Opener",
    prompt: "Skinner's confiscated letter opener, skill damage, Simpsons cartoon style, bureaucratic weapon, 3 skill counter, office supplies",
    description: "5 damage to all per 3 skills"
  },
  meat_on_the_bone: {
    name: "Krusty Burger Leftover",
    prompt: "An old Krusty Burger that heals when desperate, Simpsons cartoon style, questionable meat, life-saving fast food, low HP trigger",
    description: "12 HP if below 50%"
  },
  mercury_hourglass: {
    name: "Toxic Waste Timer",
    prompt: "A timer filled with green toxic waste, damage each turn, Simpsons cartoon style, nuclear plant origin, ticking danger",
    description: "3 damage to all each turn"
  },
  ornamental_fan: {
    name: "Marge's Decorative Fan",
    prompt: "One of Marge's decorative fans, block on attacks, Simpsons cartoon style, elegant but weaponized, 3 attack counter",
    description: "4 Block per 3 attacks"
  },
  paper_phrog: {
    name: "Hypno-Toad Figure",
    prompt: "A Hypno-Toad toy that enhances vulnerable, Simpsons cartoon style, swirling eyes, Futurama crossover, extra damage effect",
    description: "75% vulnerable damage"
  },
  self_forming_clay: {
    name: "Ralph's Play-Doh Creation",
    prompt: "A lump of Play-Doh that protects Ralph, block next turn, Simpsons cartoon style, vaguely humanoid, self-forming defense",
    description: "3 Block next turn on HP loss"
  },
  shuriken: {
    name: "Cardboard Throwing Star",
    prompt: "A throwing star Ralph cut from cardboard, strength on attacks, Simpsons cartoon style, obviously cardboard, 3 attack counter",
    description: "Strength per 3 attacks"
  },
  singing_bowl: {
    name: "Apu's Prayer Bowl",
    prompt: "A bowl from the Kwik-E-Mart, max HP option, Simpsons cartoon style, spiritual glow, meditation pose, card reward alternative",
    description: "+2 Max HP instead of card"
  },
  strike_dummy: {
    name: "Bart Simpson Dartboard",
    prompt: "A dartboard with Bart's face, extra strike damage, Simpsons cartoon style, well-used, 'EAT MY SHORTS' faded, bonus damage",
    description: "+3 damage on strikes"
  },
  torii: {
    name: "Anime Club Gate",
    prompt: "A small torii gate from school anime club, damage reduction, Simpsons cartoon style, miniature but protective, spiritual defense",
    description: "Reduce low damage to 1"
  },

  // ========== RARE ==========
  calipers: {
    name: "Shop Class Calipers",
    prompt: "Precision calipers from shop class, block retention, Simpsons cartoon style, measuring protection, 15 block keeps",
    description: "Keep 15 block per turn"
  },
  dead_branch: {
    name: "Treehouse Branch",
    prompt: "A branch from Bart's treehouse, random cards on exhaust, Simpsons cartoon style, magical tree connection, card generation",
    description: "Random card on exhaust"
  },
  du_vu_doll: {
    name: "Voodoo Doll (From Ralph)",
    prompt: "A voodoo doll Ralph made in art class, curse strength, Simpsons cartoon style, button eyes, crude but powerful, string hair",
    description: "Strength per curse"
  },
  girya: {
    name: "Gym Class Weight",
    prompt: "A gym weight Ralph can lift at rest, 3 uses, Simpsons cartoon style, embarrassingly light, strength option at rest",
    description: "Strength at rest (3x)"
  },
  ice_cream: {
    name: "Infinite Ice Cream Cone",
    prompt: "An ice cream cone that never melts, energy conservation, Simpsons cartoon style, magical frozen treat, energy carries over",
    description: "Energy conserved"
  },
  incense_burner: {
    name: "Hippie Van Air Freshener",
    prompt: "An air freshener from Otto's bus, intangible cycle, Simpsons cartoon style, peace symbol, 6 turn counter, protection smoke",
    description: "Intangible every 6 turns"
  },
  lizard_tail: {
    name: "Blinky's Spare Tail",
    prompt: "A regenerating tail from Blinky, one-time revive, Simpsons cartoon style, glowing mutation, 50% HP revival, emergency save",
    description: "Revive at 50% once"
  },
  magic_flower: {
    name: "Lisa's Saxophone Flower",
    prompt: "A flower that grew in Lisa's saxophone, healing boost, Simpsons cartoon style, musical bloom, 50% better healing",
    description: "50% healing bonus"
  },
  mango: {
    name: "Radioactive Fruit",
    prompt: "A glowing fruit from the power plant, max HP boost, Simpsons cartoon style, three-eyed mango, +14 max HP pickup",
    description: "+14 Max HP"
  },
  tungsten_rod: {
    name: "Unbreakable Ruler",
    prompt: "An indestructible ruler from shop class, HP loss reduction, Simpsons cartoon style, metal ruler, -1 HP loss always",
    description: "Lose 1 less HP"
  },

  // ========== BOSS ==========
  black_star: {
    name: "Principal's Secret Badge",
    prompt: "A mysterious black star badge, double elite relics, Simpsons cartoon style, hidden authority symbol, extra rewards",
    description: "Double elite relics"
  },
  coffee_dripper: {
    name: "Teacher's Coffee Addiction",
    prompt: "An endless coffee pot, energy but no rest, Simpsons cartoon style, Mrs. Krabappel's supply, always brewing, no sleep",
    description: "+1 Energy, can't rest"
  },
  cursed_key: {
    name: "Detention Room Key",
    prompt: "A key to detention that brings curses, energy but cursed, Simpsons cartoon style, ominous key, +1 energy, chest curses",
    description: "+1 Energy, curse on chest"
  },
  ectoplasm: {
    name: "Ghost Goo (Treehouse)",
    prompt: "Ectoplasm from a Treehouse of Horror, energy but no gold, Simpsons cartoon style, green slime, +1 energy, worthless",
    description: "+1 Energy, no gold"
  },
  runic_dome: {
    name: "Ignorance Helmet",
    prompt: "A helmet that blocks out enemy intents, energy but blind, Simpsons cartoon style, Ralph's thinking cap, +1 energy, no see intent",
    description: "+1 Energy, no intents"
  },
  snecko_eye: {
    name: "Blinky's Third Eye",
    prompt: "Blinky's third eye with confusion powers, extra draw but confused, Simpsons cartoon style, nuclear mutation, +2 draw, random costs",
    description: "+2 Draw, confused"
  },
  sozu: {
    name: "No Fun Allowed Sign",
    prompt: "A sign banning potions/fun, energy but no potions, Simpsons cartoon style, Skinner approved, +1 energy, no potions",
    description: "+1 Energy, no potions"
  },
  velvet_choker: {
    name: "Dress Code Collar",
    prompt: "A strict dress code collar, energy but card limit, Simpsons cartoon style, school uniform requirement, +1 energy, 6 card max",
    description: "+1 Energy, 6 cards max"
  },

  // ========== SHOP ==========
  membership_card: {
    name: "Kwik-E-Mart Rewards Card",
    prompt: "Apu's rewards card for discounts, shop discount, Simpsons cartoon style, laminated loyalty card, 50% off everything",
    description: "50% shop discount"
  },
  orange_pellets: {
    name: "Mystery Medication",
    prompt: "Orange pills from the nurse's office, remove debuffs, Simpsons cartoon style, unlabeled medication, play all types to cleanse",
    description: "Remove debuffs on all types"
  }
};


// ============================================
// GENERATION HELPER
// ============================================

/**
 * Get full prompt with consistent styling
 */
export const getStyledPrompt = (basePrompt, type = 'card') => {
  const styleBase = "Simpsons animated series art style, Matt Groening style, thick black outlines, bright saturated colors, yellow skin characters, comedic expressions";

  const aspectRatios = {
    card: "2:3 aspect ratio, portrait orientation, card game format",
    enemy: "1:1 aspect ratio, square format, centered character",
    relic: "1:1 aspect ratio, square format, item focused, iconic design"
  };

  return `${basePrompt}, ${styleBase}, ${aspectRatios[type]}, high quality, clean lines, no text`;
};

/**
 * Get all prompts for batch generation
 */
export const getAllPrompts = () => {
  const prompts = [];

  // Cards
  Object.entries(CARD_ART_PROMPTS).forEach(([id, data]) => {
    prompts.push({
      id,
      type: 'card',
      ...data,
      fullPrompt: getStyledPrompt(data.prompt, 'card')
    });
  });

  // Enemies
  Object.entries(ENEMY_ART_PROMPTS).forEach(([id, data]) => {
    prompts.push({
      id,
      type: 'enemy',
      ...data,
      fullPrompt: getStyledPrompt(data.prompt, 'enemy')
    });
  });

  // Relics
  Object.entries(RELIC_ART_PROMPTS).forEach(([id, data]) => {
    prompts.push({
      id,
      type: 'relic',
      ...data,
      fullPrompt: getStyledPrompt(data.prompt, 'relic')
    });
  });

  return prompts;
};

/**
 * Export prompts to clipboard-friendly format
 */
export const exportPromptsForMidjourney = () => {
  const all = getAllPrompts();
  return all.map(p => `**${p.type}/${p.id}**\n${p.fullPrompt}\n`).join('\n---\n');
};

export default {
  CARD_ART_PROMPTS,
  ENEMY_ART_PROMPTS,
  RELIC_ART_PROMPTS,
  getStyledPrompt,
  getAllPrompts,
  exportPromptsForMidjourney
};
