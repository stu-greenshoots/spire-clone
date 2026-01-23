#!/usr/bin/env node

/**
 * Ralph Wiggum Spire Ascent - Automated AI Image Generation
 *
 * Generates all game art using OpenAI DALL-E 3
 *
 * Usage:
 *   OPENAI_API_KEY=your_key node scripts/generate-images.js [options]
 *
 * Options:
 *   --type=cards|enemies|relics|all  Generate specific type (default: all)
 *   --start=id                       Start from specific asset ID
 *   --only=id1,id2,id3               Generate only specific IDs
 *   --dry-run                        Show what would be generated without calling API
 *   --quality=standard|hd            Image quality (default: standard, $0.04 vs $0.08)
 *   --size=1024x1024|1024x1792       Image size (default: 1024x1024)
 */

import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
  outputDir: path.join(__dirname, '../src/assets/art'),
  progressFile: path.join(__dirname, '../src/assets/art/.generation-progress.json'),
  quality: 'standard', // 'standard' or 'hd'
  size: '1024x1024',   // '1024x1024' or '1024x1792' for portrait
  model: 'dall-e-3',
  rateLimitDelay: 1000, // ms between requests
  maxRetries: 3,
};

// Style constants
const STYLE_BASE = "Simpsons animated series art style, Matt Groening style, thick black outlines, bright saturated colors, yellow skin characters, comedic expressions";

const ASPECT_RATIOS = {
  card: "portrait composition, card game art format",
  enemy: "square composition, centered character, full body visible",
  relic: "square composition, item focused, iconic design, simple background"
};

// ============================================
// PROMPT DATA (embedded for standalone script)
// ============================================

const CARD_PROMPTS = {
  strike: {
    prompt: "Ralph Wiggum swinging a crayon like a sword, determined expression, yellow skin, blue shorts, pink shirt, dramatic action pose, colorful classroom background",
  },
  defend: {
    prompt: "Ralph Wiggum hiding behind a lunch tray used as a shield, nervous but brave expression, cafeteria food splattered on tray, school hallway background",
  },
  bash: {
    prompt: "Ralph Wiggum wearing a helmet backwards with stars circling his head, dizzy expression, goofy smile, colorful playground background, cartoon style",
  },
  anger: {
    prompt: "Ralph Wiggum having a tantrum, throwing crayons everywhere, red face, tears flying, broken toys around him, dramatic lighting",
  },
  cleave: {
    prompt: "Ralph Wiggum spinning around with arms outstretched, dizzy spiral eyes, playground equipment around him, motion blur effect, cartoon spinning",
  },
  clothesline: {
    prompt: "Ralph running while tangled in a jump rope, tripping over himself, playground background, comedic slapstick, funny accident",
  },
  headbutt: {
    prompt: "Ralph Wiggum leading with his oversized head, determined expression, glowing forehead, impact crater forming, comic book action lines",
  },
  ironWave: {
    prompt: "Ralph in a suit of armor made from cafeteria trays, waddling forward, clanking metal effects, school hallway, determined expression",
  },
  pommelStrike: {
    prompt: "Ralph hitting something with the eraser end of a giant pencil, surprised expression, classroom setting, eraser dust clouds",
  },
  swordBoomerang: {
    prompt: "Ralph throwing his lunchbox which flies around chaotically, sandwiches spilling out, dotted flight path, playground background",
  },
  thunderclap: {
    prompt: "Ralph clapping his hands together creating a shockwave of glitter and paste, excited expression, sparkle effects, art classroom",
  },
  twinStrike: {
    prompt: "Ralph Wiggum with both arms raised triumphantly, tongue sticking out in concentration, victory pose, schoolyard background, cartoon style, happy expression",
  },
  wildStrike: {
    prompt: "Ralph waving a ruler around chaotically, confused expression, objects flying everywhere, chaotic energy, classroom mess, cartoon chaos",
  },
  bodySlam: {
    prompt: "Ralph doing a big belly flop jump onto a pile of pillows, joyful expression, pillows and feathers flying, gymnasium, cartoon fun",
  },
  clash: {
    prompt: "Ralph in full berserker mode surrounded only by crayons, war paint on face, battlefield of broken pencils, intense expression",
  },
  heavyBlade: {
    prompt: "Ralph dragging an impossibly large novelty pencil bigger than him, struggling with weight, pencil is huge, school hallway, determined face, cartoon struggle",
  },
  armaments: {
    prompt: "Ralph duct-taping supplies to himself as armor, crayons rulers erasers, proud expression, art supply closet, crafting scene",
  },
  flexCard: {
    prompt: "Ralph Wiggum posing confidently like a superhero, cape made of towel, muscles drawn on arms with marker, mirror reflection, gym background, cartoon funny",
  },
  shrugItOff: {
    prompt: "Ralph shrugging with a confused smile while things bounce off him, invincible ignorance, various projectiles deflecting, playground",
  },
  warcry: {
    prompt: "Ralph yelling loudly with hands cupped around mouth, sound wave effects, other students covering ears, cafeteria, megaphone energy, cartoon loud",
  },
  carnage: {
    prompt: "Ralph covered in finger paint looking like a horror movie, innocent smile, red and orange paint everywhere, art room destruction",
  },
  whirlwind: {
    prompt: "Ralph spinning like a tornado destroying everything in radius, dizzy spirals, school supplies flying in vortex, energy symbols",
  },
  bludgeon: {
    prompt: "Ralph swinging the leg of a desk like a club, Babe Ruth pose, massive impact incoming, dramatic angle, classroom destruction",
  },
  impervious: {
    prompt: "Ralph wrapped entirely in bubble wrap, nothing can touch him, serene smile, impacts bouncing off, protective cocoon",
  },
  offering: {
    prompt: "Ralph giving away his lunch for power, noble sacrifice pose, sandwich ascending, energy received, cafeteria altar",
  },
  demonForm: {
    prompt: "Ralph transforming into a powerful demon version but still cute, horns and tail, growing strength, Halloween costume power",
  },
  inflame: {
    prompt: "Ralph flexing while on fire, getting stronger, proud pose, flames and muscles, confident smile, power up moment",
  },
  metallicize: {
    prompt: "Ralph slowly turning metallic, gaining block each turn, silver skin, robot transformation, cool pose",
  },
  wound: {
    prompt: "A cartoon band-aid with a sad face drawn on it, ouchie symbol, simple graphic, pink background, cute medical sticker style",
  },
  burn: {
    prompt: "A small fire burning on a hand, concerned cartoony face in flames, flame graphic, orange background",
  },
  // Additional cards
  barricade: {
    prompt: "Ralph building a fortress out of school desks and chairs, proud architect pose, impenetrable wall, classroom background, cartoon construction",
  },
  battleTrance: {
    prompt: "Ralph in deep meditation with eyes crossed, floating slightly, mystical energy, peaceful but silly expression, gym mat background",
  },
  berserk: {
    prompt: "Ralph with wild eyes and messy hair, surrounded by energy, going crazy with power, red aura, playground rampage",
  },
  bloodletting: {
    prompt: "Ralph squeezing a juice box dramatically, red juice spraying, sacrifice for power, determined expression, cafeteria background",
  },
  brutality: {
    prompt: "Ralph looking surprisingly fierce, crayon war paint on cheeks, intense stare, schoolyard warrior, cartoon intimidating",
  },
  combust: {
    prompt: "Ralph surrounded by small flames, sweating but happy, everything around him slightly singed, fire powers, classroom chaos",
  },
  corruption: {
    prompt: "Ralph with a mischievous dark glow, shadowy aura, evil smile but still cute, purple energy, corrupted but adorable",
  },
  curse_decay: {
    prompt: "A wilting flower with sad cartoon eyes, drooping petals, dark purple background, curse symbol, gloomy atmosphere",
  },
  curse_doubt: {
    prompt: "A question mark with worried cartoon eyes, shaky and uncertain, dark blue background, existential dread, cartoon doubt",
  },
  curse_pain: {
    prompt: "A cartoon heart with band-aids all over it, sad expression, dark red background, pain symbol, ouchie vibes",
  },
  curse_regret: {
    prompt: "A cartoon ghost of spilled milk crying, regretful expression, dark background, shoulda coulda woulda, sad cartoon",
  },
  darkEmbrace: {
    prompt: "Ralph hugging his shadow which hugs back, dark but friendly, night time playground, embracing darkness, cartoon wholesome dark",
  },
  dazed: {
    prompt: "Ralph with swirly confused eyes, stars circling head, completely lost, dazed expression, dizzy cartoon, blue tint",
  },
  disarm: {
    prompt: "Ralph accidentally making others drop things by being distracting, oops expression, items falling, disarming cuteness",
  },
  doubleTap: {
    prompt: "Ralph poking something twice rapidly, focused expression, double motion blur, tap tap gesture, cartoon precision",
  },
  dropkick: {
    prompt: "Ralph attempting a dramatic kick but falling over, legs in air, comedic fail, playground background, cartoon slapstick",
  },
  dualWield: {
    prompt: "Ralph holding two crayons like swords, ninja pose, determined expression, dual wielding stance, cartoon warrior",
  },
  entrench: {
    prompt: "Ralph dug into a sandbox fort, only head visible, defensive position, protected and happy, cartoon fortification",
  },
  evolve: {
    prompt: "Ralph glowing and transforming slightly, evolution energy, becoming stronger, metamorphosis effect, cartoon power up",
  },
  exhume: {
    prompt: "Ralph digging up buried treasure toys from sandbox, excited discovery, old toys emerging, cartoon archaeology",
  },
  feed: {
    prompt: "Ralph eating a sandwich and growing slightly larger, power from food, satisfied expression, cafeteria background",
  },
  feelNoPain: {
    prompt: "Ralph with a completely blank happy expression while things bounce off him, oblivious to everything, cartoon invincibility",
  },
  fiendFire: {
    prompt: "Ralph breathing cartoon fire like a dragon, fierce but cute, flames everywhere, Halloween costume energy, fire breath",
  },
  fireBreathing: {
    prompt: "Ralph with hot sauce bottle, breathing fire after eating, spicy reaction, flames from mouth, cafeteria chaos",
  },
  flameBarrier: {
    prompt: "Ralph surrounded by a ring of friendly flames, protective fire circle, warm and safe, fire shield cartoon",
  },
  ghostlyArmor: {
    prompt: "Ralph wearing a sheet ghost costume as armor, spooky but cute, ghostly protection, Halloween vibes, cartoon ghost",
  },
  havoc: {
    prompt: "Ralph causing absolute chaos everywhere, things flying, mess explosion, happy chaos expression, destruction cartoon",
  },
  hemokinesis: {
    prompt: "Ralph controlling spilled juice with his mind, juice bending powers, concentrated expression, cafeteria magic, cartoon psychic",
  },
  immolate: {
    prompt: "Ralph happily on fire spreading warmth to everyone, friendly fire, warm hugs, everyone slightly singed, cartoon warmth",
  },
  infernalBlade: {
    prompt: "Ralph holding a flaming ruler sword, epic fire weapon, dramatic pose, fire effects, cartoon epic",
  },
  intimidate: {
    prompt: "Ralph trying to look scary but just looking cute, failed intimidation, pouty face, not very threatening, cartoon attempt",
  },
  juggernaut: {
    prompt: "Ralph as an unstoppable force, marching forward, nothing can stop him, determination, juggernaut pose, cartoon tank",
  },
  limitBreak: {
    prompt: "Ralph breaking through his limits, energy explosion, going beyond, power surge, limit exceeded, cartoon breakthrough",
  },
  perfectedStrike: {
    prompt: "Ralph doing a perfect crayon stroke, artistic precision, masterpiece moment, perfect form, cartoon excellence",
  },
  powerThrough: {
    prompt: "Ralph pushing through obstacles, determination face, barriers breaking, willpower energy, cartoon perseverance",
  },
  pummel: {
    prompt: "Ralph doing rapid silly slaps, blur of hands, comedic rapid motion, playground scene, cartoon rapid fire",
  },
  rage: {
    prompt: "Ralph in full tantrum mode, red faced, steam from ears, maximum anger, cartoon rage explosion",
  },
  rampage: {
    prompt: "Ralph running wild through classroom, destruction path, gleeful chaos, rampage energy, cartoon mayhem",
  },
  reaper: {
    prompt: "Ralph in a tiny grim reaper costume, scythe made of ruler, Halloween vibes, cute but spooky, cartoon reaper",
  },
  recklessCharge: {
    prompt: "Ralph running forward with eyes closed, no plan, just charging, reckless abandon, cartoon bull rush",
  },
  rupture: {
    prompt: "Ralph causing cracks in the ground by stomping, earthquake effect, powerful stomp, rupture cartoon",
  },
  searingBlow: {
    prompt: "Ralph with glowing hot hands, searing touch, steam rising, powerful heated energy, cartoon heat",
  },
  secondWind: {
    prompt: "Ralph catching his breath and getting second wind, energy returning, refreshed, deep breath cartoon",
  },
  seeingRed: {
    prompt: "Ralph with red tinted vision, angry focus, seeing red literally, rage vision, cartoon anger mode",
  },
  sentinel: {
    prompt: "Ralph standing guard like a sentinel, watchful pose, protective stance, guardian energy, cartoon sentry",
  },
  shockwave: {
    prompt: "Ralph stomping and creating a circular shockwave, ground rippling, power burst, cartoon shockwave effect",
  },
  slimed: {
    prompt: "Ralph covered in green slime, grossed out expression, dripping goo, slime puddle, cartoon gross",
  },
  spotWeakness: {
    prompt: "Ralph pointing at something with detective magnifying glass, finding weakness, eureka moment, cartoon discovery",
  },
  trueGrit: {
    prompt: "Ralph with determined gritty expression, tough and resilient, cowboy vibes, true grit stance, cartoon determination",
  },
  uppercut: {
    prompt: "Ralph doing an upward motion punch, rising energy, uppercut pose, dramatic angle, cartoon fighting",
  },
  void: {
    prompt: "A small black hole with worried cartoon eyes, emptiness incarnate, void energy, dark space, cartoon cosmic horror",
  },
};

const ENEMY_PROMPTS = {
  cultist: {
    name: "Nelson the Bully Cultist",
    prompt: "Nelson Muntz in dark robes performing a bully ritual, HA HA symbol glowing, schoolyard cult leader, menacing but comedic, purple lighting",
  },
  jawWorm: {
    name: "Giant Pet Worm",
    prompt: "A giant friendly earthworm with oversized googly eyes, surprisingly menacing despite cute, playground dirt background, brown and pink colors",
  },
  louse_red: {
    name: "Angry Head Louse",
    prompt: "A cartoonish red head louse with angry expression, tiny boxing gloves, gross but cute, white background with hair strands",
  },
  louse_green: {
    name: "Sickly Head Louse",
    prompt: "A green head louse looking ill but mean, dripping slime, gross and comedic, white background with hair strands",
  },
  slime_small: {
    name: "Mystery Meat Blob",
    prompt: "A small blob of sentient cafeteria mystery meat, googly eyes, green goop dripping, lunch tray background",
  },
  slime_medium: {
    name: "Cafeteria Slime",
    prompt: "A medium-sized sentient cafeteria blob, multiple eyes, dripping sauce, aggressive expression, cafeteria background",
  },
  fungiBeast: {
    name: "Locker Mushroom",
    prompt: "A sentient mushroom creature with friendly but toxic expression, spore cloud, grown from forgotten lunch, locker background",
  },
  looter: {
    name: "Jimbo the Thief",
    prompt: "Jimbo Jones from The Simpsons looking sneaky, purple shirt, hands in pockets, mischievous grin, Springfield school hallway background, cartoon delinquent",
  },
  gremlinNob: {
    name: "Gremlin Willie",
    prompt: "Groundskeeper Willie in gremlin form, muscles bulging, Scottish rage, rake weapon, shirtless and furious, green tint, dramatic pose",
  },
  lagavulin: {
    name: "Sleeping Janitor",
    prompt: "A heavily armored janitor sleeping in closet, mop and bucket armor, snoring Z symbols, dormant threat, dark closet background",
  },
  sentryA: {
    name: "Hall Monitor Drone",
    prompt: "A robotic hall monitor with laser eyes, floating drone, HALL PASS display screen, Springfield Elementary security, metallic blue",
  },
  bookOfStabbing: {
    name: "Revenge Diary",
    prompt: "A floating magical diary with an angry face, pages fluttering dramatically, glowing red aura, spooky book character, dark background, cartoon villain book",
  },
  gremlinLeader: {
    name: "Krusty Gremlin King",
    prompt: "Krusty the Clown as a gremlin leader, commanding pose, tattered clown outfit, cigar, maniacal laugh, crown, green skin",
  },
  writhing_mass: {
    name: "Kang or Kodos",
    prompt: "One of the Rigellians Kang or Kodos in writhing tentacle form, drooling, alien terror, UFO background, green and purple",
  },
  giant_head: {
    name: "Olmec Head",
    prompt: "The Olmec head from Barts treehouse, giant stone face, glowing eyes, ominous countdown numbers, ancient and menacing",
  },
  reptomancer: {
    name: "Snake Handler",
    prompt: "A sinister snake-handling preacher summoning serpents, dramatic robes, multiple snakes, church window background, green lighting",
  },
  slimeBoss: {
    name: "MEGA CAFETERIA BLOB",
    prompt: "A giant green slime monster made of cafeteria food, multiple googly eyes, enormous and wobbly, epic boss character, cartoon monster, cafeteria background",
  },
  theGuardian: {
    name: "Radioactive Man Armor",
    prompt: "Massive Radioactive Man armor suit come to life, epic superhero robot, nuclear powered glow, dramatic defensive pose, comic book style",
  },
  hexaghost: {
    name: "Six Christmas Ghosts",
    prompt: "Six ghostly Christmas spirits merged into one fiery entity, burning and ethereal, holiday horror, red and orange flames, spooky",
  },
  theChamp: {
    name: "Drederick Tatum",
    prompt: "Drederick Tatum the boxer as final boss, championship belt, massive fists, boxing ring, gold chains, intimidating stance",
  },
  awakened_one: {
    name: "Awakened Mr Burns",
    prompt: "Mr Burns awakened to full demonic power, nuclear glow, Excellent finger pose, Smithers cowering, two-phase boss, terrifying",
  },
  timeEater: {
    name: "Professor Frinks Mistake",
    prompt: "A time-eating entity from Professor Frinks experiment, clock motif body, eating time and space, scientific horror, purple vortex",
  },
  corruptHeart: {
    name: "Heart of Springfield",
    prompt: "The literal corrupt heart of Springfield, all darkness manifested, tentacles of corruption, invincible shield glow, final boss, massive scale",
  },
  // Additional enemies
  slime_large: {
    name: "Giant Cafeteria Blob",
    prompt: "A large sentient cafeteria slime blob, many googly eyes, dripping green goo, threatening but silly, cafeteria background, cartoon monster",
  },
  spike_slime_small: {
    name: "Spiky Jello",
    prompt: "A small blue spiky jello creature with attitude, pointy protrusions, wiggly and dangerous, cafeteria dessert gone wrong, cartoon",
  },
  spike_slime_medium: {
    name: "Medium Spiky Jello",
    prompt: "A medium-sized blue spiky jello monster, multiple sharp points, wobbly menace, cafeteria background, cartoon dessert monster",
  },
  chosen: {
    name: "Teachers Pet",
    prompt: "Martin Prince as a glowing chosen one, halo effect, smug expression, golden aura, classroom background, cartoon enlightened nerd",
  },
  byrd: {
    name: "Angry Pigeon",
    prompt: "A mean Springfield pigeon with angry eyes, puffed up feathers, pecking pose, city background, cartoon angry bird",
  },
  snakePlant: {
    name: "Classroom Plant",
    prompt: "A sentient classroom plant with vines and angry face, overgrown menace, pot cracked, classroom windowsill, cartoon plant monster",
  },
  centurion: {
    name: "Roman Nerd",
    prompt: "A school play Roman centurion costume kid, cardboard armor, determined expression, stage background, cartoon theater kid",
  },
  slaverBlue: {
    name: "Detention Monitor",
    prompt: "A mean detention hall monitor in blue, clipboard and whistle, disapproving frown, hallway background, cartoon authority figure",
  },
  dagger: {
    name: "Paper Airplane",
    prompt: "A sharp paper airplane with angry eyes, swooping pose, pointy and dangerous, classroom background, cartoon projectile",
  },
  orbWalker: {
    name: "Science Fair Robot",
    prompt: "A crude science fair robot with glowing orb, walking awkwardly, wires showing, gymnasium background, cartoon robot",
  },
  spiker: {
    name: "Cactus Kid",
    prompt: "A sentient cactus from the classroom window, spiky and grumpy, pot cracked, desert plant attitude, cartoon plant character",
  },
};

const RELIC_PROMPTS = {
  burning_blood: {
    name: "Band-Aid Collection",
    prompt: "A collection of used band-aids arranged in heart shape, glowing red healing energy, slightly gross but magical, simple background",
  },
  anchor: {
    name: "Lucky Anchor Sticker",
    prompt: "A shiny gold anchor sticker with protective glow, scratched but treasured, simple clean background",
  },
  bag_of_preparation: {
    name: "Oversized Backpack",
    prompt: "An enormous bulging backpack full of school supplies, crayon tips poking out, magical storage glow, simple background",
  },
  lantern: {
    name: "Krusty Flashlight",
    prompt: "A Krusty brand flashlight that barely works, Krusty face on it, batteries falling out, yellow glow, simple background",
  },
  vajra: {
    name: "Homers Dumbbell",
    prompt: "A tiny dumbbell with 1 LB written huge on it, comedically light, strength aura, simple background",
  },
  red_skull: {
    name: "Broken Red Crayon",
    prompt: "A broken red crayon snapped in half, glowing with power, determined red color, simple background",
  },
  kunai: {
    name: "Sharpened Butter Knife",
    prompt: "A butter knife that someone tried to sharpen, obviously dull but believing, ninja star pose, simple background",
  },
  ice_cream: {
    name: "Infinite Ice Cream",
    prompt: "An ice cream cone that never melts, magical frozen treat, sparkles, multiple scoops, simple background",
  },
  coffee_dripper: {
    name: "Teachers Coffee",
    prompt: "An endless coffee pot always brewing, steam rising, Mrs Krabappels mug, caffeine energy, simple background",
  },
  snecko_eye: {
    name: "Blinkys Third Eye",
    prompt: "Blinkys third eye with swirling confusion powers, nuclear mutation glow, fish eye, hypnotic spiral, simple background",
  },
  membership_card: {
    name: "Kwik-E-Mart Card",
    prompt: "Apus rewards card laminated and glowing, loyalty card with discount symbol, simple background",
  },
};

// ============================================
// UTILITIES
// ============================================

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function loadProgress() {
  try {
    if (fs.existsSync(CONFIG.progressFile)) {
      return JSON.parse(fs.readFileSync(CONFIG.progressFile, 'utf8'));
    }
  } catch (e) {
    console.log('Could not load progress file, starting fresh');
  }
  return { completed: [], failed: [], lastRun: null };
}

function saveProgress(progress) {
  progress.lastRun = new Date().toISOString();
  fs.writeFileSync(CONFIG.progressFile, JSON.stringify(progress, null, 2));
}

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(filepath);
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {}); // Delete partial file
      reject(err);
    });
  });
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// ============================================
// IMAGE GENERATION
// ============================================

async function generateImage(openai, prompt, type, id, options = {}) {
  const fullPrompt = `${prompt}, ${STYLE_BASE}, ${ASPECT_RATIOS[type]}, high quality, clean lines, no text, no watermark`;

  const size = type === 'card' ? '1024x1792' : '1024x1024';

  console.log(`\n[${type}/${id}] Generating...`);
  if (options.dryRun) {
    console.log(`  Prompt: ${fullPrompt.substring(0, 100)}...`);
    console.log(`  Size: ${size}`);
    return { success: true, dryRun: true };
  }

  try {
    const response = await openai.images.generate({
      model: CONFIG.model,
      prompt: fullPrompt,
      n: 1,
      size: size,
      quality: options.quality || CONFIG.quality,
    });

    const imageUrl = response.data[0].url;
    const revisedPrompt = response.data[0].revised_prompt;

    // Download and save
    const outputDir = path.join(CONFIG.outputDir, type === 'enemy' ? 'enemies' : `${type}s`);
    ensureDir(outputDir);

    const filepath = path.join(outputDir, `${id}.png`);
    await downloadImage(imageUrl, filepath);

    console.log(`  Saved: ${filepath}`);
    if (revisedPrompt && revisedPrompt !== fullPrompt) {
      console.log(`  Note: DALL-E revised the prompt`);
    }

    return { success: true, filepath, revisedPrompt };

  } catch (error) {
    console.error(`  ERROR: ${error.message}`);
    if (error.code === 'content_policy_violation') {
      console.error(`  Content policy violation - prompt may need adjustment`);
    }
    return { success: false, error: error.message };
  }
}

// ============================================
// MAIN EXECUTION
// ============================================

async function main() {
  // Parse arguments
  const args = process.argv.slice(2);
  const options = {
    type: 'all',
    dryRun: args.includes('--dry-run'),
    quality: 'standard',
    only: null,
    start: null,
  };

  args.forEach(arg => {
    if (arg.startsWith('--type=')) options.type = arg.split('=')[1];
    if (arg.startsWith('--quality=')) options.quality = arg.split('=')[1];
    if (arg.startsWith('--only=')) options.only = arg.split('=')[1].split(',');
    if (arg.startsWith('--start=')) options.start = arg.split('=')[1];
  });

  // Check API key
  if (!process.env.OPENAI_API_KEY && !options.dryRun) {
    console.error('ERROR: OPENAI_API_KEY environment variable not set');
    console.error('Usage: OPENAI_API_KEY=your_key node scripts/generate-images.js');
    process.exit(1);
  }

  // Only initialize OpenAI if not doing a dry run
  const openai = options.dryRun ? null : new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  console.log('='.repeat(60));
  console.log('RALPH WIGGUM SPIRE ASCENT - AI IMAGE GENERATOR');
  console.log('='.repeat(60));
  console.log(`Type: ${options.type}`);
  console.log(`Quality: ${options.quality}`);
  console.log(`Dry run: ${options.dryRun}`);
  if (options.only) console.log(`Only: ${options.only.join(', ')}`);
  if (options.start) console.log(`Starting from: ${options.start}`);
  console.log('='.repeat(60));

  // Load progress
  const progress = loadProgress();
  console.log(`\nPreviously completed: ${progress.completed.length} images`);
  console.log(`Previously failed: ${progress.failed.length} images`);

  // Build generation queue
  const queue = [];

  const shouldGenerate = (type, id) => {
    const key = `${type}/${id}`;
    if (progress.completed.includes(key)) return false;
    if (options.only && !options.only.includes(id)) return false;
    return true;
  };

  let startFound = !options.start;

  if (options.type === 'all' || options.type === 'cards') {
    Object.entries(CARD_PROMPTS).forEach(([id, data]) => {
      if (!startFound && id === options.start) startFound = true;
      if (startFound && shouldGenerate('card', id)) {
        queue.push({ type: 'card', id, prompt: data.prompt });
      }
    });
  }

  if (options.type === 'all' || options.type === 'enemies') {
    Object.entries(ENEMY_PROMPTS).forEach(([id, data]) => {
      if (!startFound && id === options.start) startFound = true;
      if (startFound && shouldGenerate('enemy', id)) {
        queue.push({ type: 'enemy', id, prompt: data.prompt });
      }
    });
  }

  if (options.type === 'all' || options.type === 'relics') {
    Object.entries(RELIC_PROMPTS).forEach(([id, data]) => {
      if (!startFound && id === options.start) startFound = true;
      if (startFound && shouldGenerate('relic', id)) {
        queue.push({ type: 'relic', id, prompt: data.prompt });
      }
    });
  }

  console.log(`\nImages to generate: ${queue.length}`);

  if (queue.length === 0) {
    console.log('Nothing to generate!');
    return;
  }

  // Estimate cost
  const costPerImage = options.quality === 'hd' ? 0.08 : 0.04;
  const portraitCost = options.quality === 'hd' ? 0.12 : 0.08;
  const cardCount = queue.filter(q => q.type === 'card').length;
  const otherCount = queue.length - cardCount;
  const estimatedCost = (cardCount * portraitCost) + (otherCount * costPerImage);

  console.log(`Estimated cost: $${estimatedCost.toFixed(2)}`);

  if (!options.dryRun) {
    console.log('\nStarting generation in 3 seconds... (Ctrl+C to cancel)');
    await sleep(3000);
  }

  // Generate images
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < queue.length; i++) {
    const item = queue[i];
    console.log(`\n[${i + 1}/${queue.length}]`);

    const result = await generateImage(openai, item.prompt, item.type, item.id, options);

    const key = `${item.type}/${item.id}`;
    if (result.success) {
      successCount++;
      if (!options.dryRun) {
        progress.completed.push(key);
        progress.failed = progress.failed.filter(f => f !== key);
      }
    } else {
      failCount++;
      if (!options.dryRun && !progress.failed.includes(key)) {
        progress.failed.push(key);
      }
    }

    // Save progress after each image
    if (!options.dryRun) {
      saveProgress(progress);
    }

    // Rate limiting
    if (i < queue.length - 1 && !options.dryRun) {
      await sleep(CONFIG.rateLimitDelay);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('GENERATION COMPLETE');
  console.log('='.repeat(60));
  console.log(`Success: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  console.log(`Total completed: ${progress.completed.length}`);

  if (progress.failed.length > 0) {
    console.log(`\nFailed images (retry with --only=id1,id2):`);
    progress.failed.forEach(f => console.log(`  - ${f}`));
  }
}

main().catch(console.error);
