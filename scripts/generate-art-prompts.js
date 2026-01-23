#!/usr/bin/env node

/**
 * Ralph Wiggum Spire Ascent - Art Generation Utility
 *
 * This script helps generate and manage AI art prompts for the game.
 *
 * Usage:
 *   node scripts/generate-art-prompts.js [command] [options]
 *
 * Commands:
 *   list-cards      - List all card art prompts
 *   list-enemies    - List all enemy art prompts
 *   list-relics     - List all relic art prompts
 *   export-all      - Export all prompts to a text file
 *   export-batch    - Export prompts in batch format for AI generators
 *   check-missing   - Check which assets are missing images
 */

const fs = require('fs');
const path = require('path');

// Since this is a Node script, we'll inline the prompt data
// In production, you'd import this properly

const STYLE_BASE = "Simpsons animated series art style, Matt Groening style, thick black outlines, bright saturated colors, yellow skin characters, comedic expressions";

const ASPECT_RATIOS = {
  card: "2:3 aspect ratio, portrait orientation, card game format",
  enemy: "1:1 aspect ratio, square format, centered character",
  relic: "1:1 aspect ratio, square format, item focused, iconic design"
};

// Sample of prompts (full list is in art-prompts.js)
const CARD_PROMPTS = {
  strike: {
    prompt: "Ralph Wiggum swinging a crayon like a sword, determined expression, Simpsons cartoon style, yellow skin, blue shorts, pink shirt, dramatic action pose, colorful classroom background",
    ralphQuote: "I'm a unitard!"
  },
  defend: {
    prompt: "Ralph Wiggum hiding behind a lunch tray used as a shield, nervous but brave expression, Simpsons cartoon style, cafeteria food splattered on tray, school hallway background",
    ralphQuote: "Me fail English? That's unpossible!"
  },
  bash: {
    prompt: "Ralph Wiggum headbutting with his helmet on backwards, stars circling his head, goofy smile, Simpsons cartoon style, playground background, impact lines",
    ralphQuote: "I bent my wookie!"
  }
  // ... more in the actual file
};

const ENEMY_PROMPTS = {
  cultist: {
    name: "Nelson the Bully Cultist",
    prompt: "Nelson Muntz in dark robes performing a bully ritual, 'HA HA' symbol glowing, Simpsons cartoon style, schoolyard cult leader, menacing but comedic"
  },
  slimeBoss: {
    name: "MEGA CAFETERIA BLOB",
    prompt: "The ultimate cafeteria slime boss, Lunch Lady Doris fully absorbed, enormous and splitting, Simpsons cartoon style, entire cafeteria consumed, epic scale"
  }
  // ... more in the actual file
};

function getStyledPrompt(basePrompt, type = 'card') {
  return `${basePrompt}, ${STYLE_BASE}, ${ASPECT_RATIOS[type]}, high quality, clean lines, no text`;
}

function listPrompts(type) {
  const prompts = type === 'card' ? CARD_PROMPTS :
                  type === 'enemy' ? ENEMY_PROMPTS : {};

  console.log(`\\n=== ${type.toUpperCase()} ART PROMPTS ===\\n`);

  Object.entries(prompts).forEach(([id, data]) => {
    console.log(`[${id}]`);
    if (data.name) console.log(`  Name: ${data.name}`);
    console.log(`  Prompt: ${data.prompt}`);
    if (data.ralphQuote) console.log(`  Quote: "${data.ralphQuote}"`);
    console.log('');
  });
}

function exportAllPrompts() {
  const outputPath = path.join(__dirname, '../src/assets/art/PROMPTS.md');

  let content = `# Ralph Wiggum's Spire Ascent - AI Art Prompts

## How to Use These Prompts

1. Copy the full prompt for the asset you want to generate
2. Paste into your AI image generator (Midjourney, DALL-E, Stable Diffusion)
3. Generate the image
4. Save to the appropriate folder:
   - Cards: src/assets/art/cards/{card_id}.png
   - Enemies: src/assets/art/enemies/{enemy_id}.png
   - Relics: src/assets/art/relics/{relic_id}.png

## Style Guide

All images should follow these guidelines:
- **Style**: ${STYLE_BASE}
- **Cards**: ${ASPECT_RATIOS.card}
- **Enemies**: ${ASPECT_RATIOS.enemy}
- **Relics**: ${ASPECT_RATIOS.relic}

---

## Card Art Prompts

`;

  Object.entries(CARD_PROMPTS).forEach(([id, data]) => {
    content += `### ${id}\\n`;
    content += `**Full Prompt:**\\n\`\`\`\\n${getStyledPrompt(data.prompt, 'card')}\\n\`\`\`\\n`;
    if (data.ralphQuote) content += `*Ralph says: "${data.ralphQuote}"*\\n`;
    content += '\\n';
  });

  content += `---\\n\\n## Enemy Art Prompts\\n\\n`;

  Object.entries(ENEMY_PROMPTS).forEach(([id, data]) => {
    content += `### ${id}`;
    if (data.name) content += ` - ${data.name}`;
    content += `\\n`;
    content += `**Full Prompt:**\\n\`\`\`\\n${getStyledPrompt(data.prompt, 'enemy')}\\n\`\`\`\\n\\n`;
  });

  fs.writeFileSync(outputPath, content);
  console.log(`Prompts exported to: ${outputPath}`);
}

function exportBatchFormat() {
  const outputPath = path.join(__dirname, '../src/assets/art/BATCH_PROMPTS.txt');

  let content = `RALPH WIGGUM SPIRE ASCENT - BATCH PROMPTS
==========================================
Copy each prompt to generate the corresponding image.
Save with the filename shown before each prompt.

`;

  // Cards
  content += '=== CARDS ===\\n\\n';
  Object.entries(CARD_PROMPTS).forEach(([id, data]) => {
    content += `--- cards/${id}.png ---\\n`;
    content += getStyledPrompt(data.prompt, 'card');
    content += '\\n\\n';
  });

  // Enemies
  content += '=== ENEMIES ===\\n\\n';
  Object.entries(ENEMY_PROMPTS).forEach(([id, data]) => {
    content += `--- enemies/${id}.png ---\\n`;
    content += getStyledPrompt(data.prompt, 'enemy');
    content += '\\n\\n';
  });

  fs.writeFileSync(outputPath, content);
  console.log(`Batch prompts exported to: ${outputPath}`);
}

function checkMissingAssets() {
  const artDir = path.join(__dirname, '../src/assets/art');

  const checkDir = (subdir, ids) => {
    const dirPath = path.join(artDir, subdir);

    if (!fs.existsSync(dirPath)) {
      console.log(`\\nDirectory missing: ${dirPath}`);
      console.log(`Missing all ${ids.length} ${subdir} images`);
      return;
    }

    const files = fs.readdirSync(dirPath);
    const existing = files.map(f => path.parse(f).name.toLowerCase());

    const missing = ids.filter(id => !existing.includes(id.toLowerCase()));

    console.log(`\\n=== ${subdir.toUpperCase()} ===`);
    console.log(`Total: ${ids.length}`);
    console.log(`Existing: ${ids.length - missing.length}`);
    console.log(`Missing: ${missing.length}`);

    if (missing.length > 0 && missing.length <= 20) {
      console.log(`Missing: ${missing.join(', ')}`);
    }
  };

  checkDir('cards', Object.keys(CARD_PROMPTS));
  checkDir('enemies', Object.keys(ENEMY_PROMPTS));
}

// CLI handling
const command = process.argv[2];

switch (command) {
  case 'list-cards':
    listPrompts('card');
    break;
  case 'list-enemies':
    listPrompts('enemy');
    break;
  case 'list-relics':
    listPrompts('relic');
    break;
  case 'export-all':
    exportAllPrompts();
    break;
  case 'export-batch':
    exportBatchFormat();
    break;
  case 'check-missing':
    checkMissingAssets();
    break;
  default:
    console.log(`
Ralph Wiggum Spire Ascent - Art Generation Utility

Usage: node scripts/generate-art-prompts.js [command]

Commands:
  list-cards      List all card art prompts
  list-enemies    List all enemy art prompts
  list-relics     List all relic art prompts
  export-all      Export all prompts to markdown file
  export-batch    Export prompts in batch format for AI generators
  check-missing   Check which assets are missing images

Example:
  node scripts/generate-art-prompts.js export-batch
    `);
}
