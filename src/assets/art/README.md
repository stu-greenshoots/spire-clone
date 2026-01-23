# Ralph Wiggum's Spire Ascent - Art Assets

## Overview

This directory contains AI-generated art assets for the Ralph Wiggum-themed Slay the Spire clone.

## Directory Structure

```
art/
├── cards/          # Card artwork (2:3 aspect ratio, 200x300px recommended)
├── enemies/        # Enemy artwork (1:1 aspect ratio, 200x200px recommended)
├── relics/         # Relic icons (1:1 aspect ratio, 100x100px recommended)
├── art-config.js   # Configuration for loading and managing art
└── README.md       # This file
```

## Adding Art Assets

### 1. Generate images using AI

Use the prompts from `../art-prompts.js` with your preferred AI image generator:
- **Midjourney**: Best for stylized cartoon art
- **DALL-E 3**: Good for consistent Simpsons style
- **Stable Diffusion**: Use with Simpsons LoRA for best results

### 2. Save images with correct naming

Files should be named exactly like the game IDs:
- `cards/strike.png`
- `cards/bash.png`
- `enemies/cultist.png`
- `enemies/slimeBoss.png`
- `relics/burning_blood.png`

### 3. Supported formats

- PNG (recommended for transparency)
- JPG
- JPEG
- WebP

## Style Guidelines

All art should follow the Simpsons animated series style:

- **Colors**: Bright, saturated colors with Simpsons yellow (#FFD90F) for characters
- **Lines**: Thick black outlines
- **Characters**: Yellow skin, exaggerated features
- **Expressions**: Comedic, matching Ralph Wiggum's personality
- **Background**: Appropriate setting (classroom, playground, etc.)

## Prompt Format

Full prompts include:
1. Character/scene description
2. Style keywords: "Simpsons cartoon style, Matt Groening style"
3. Technical specs: aspect ratio, quality settings
4. Exclusions: "no text" to avoid unwanted labels

### Example Card Prompt

```
Ralph Wiggum swinging a crayon like a sword, determined expression,
Simpsons cartoon style, yellow skin, blue shorts, pink shirt,
dramatic action pose, colorful classroom background,
Simpsons animated series art style, Matt Groening style,
thick black outlines, bright saturated colors, yellow skin characters,
comedic expressions, 2:3 aspect ratio, portrait orientation,
card game format, high quality, clean lines, no text
```

### Example Enemy Prompt

```
Nelson Muntz in dark robes performing a bully ritual,
'HA HA' symbol glowing, Simpsons cartoon style,
schoolyard cult leader, menacing but comedic,
Simpsons animated series art style, Matt Groening style,
thick black outlines, bright saturated colors, yellow skin characters,
1:1 aspect ratio, square format, centered character,
high quality, clean lines, no text
```

## Quick Start

1. Check what images are missing:
   ```bash
   node scripts/generate-art-prompts.js check-missing
   ```

2. Export batch prompts:
   ```bash
   node scripts/generate-art-prompts.js export-batch
   ```

3. Generate images using your preferred AI tool

4. Save to appropriate directory with matching filename

5. The game will automatically use the images when available!

## Theme: Ralph Wiggum

The game is themed around Ralph Wiggum from The Simpsons:
- **Player character**: Ralph Wiggum
- **Cards**: Themed around Ralph's quotes and actions
- **Enemies**: Springfield Elementary and Springfield town characters
- **Relics**: Items from Ralph's world

### Ralph's Famous Quotes (used in card art)

- "I'm learnding!"
- "Me fail English? That's unpossible!"
- "My cat's breath smells like cat food!"
- "Hi Super Nintendo Chalmers!"
- "The leprechaun tells me to burn things!"
- "Go banana!"
- "I bent my wookie!"
- "It tastes like burning!"

## Fallback Behavior

When images are not available:
- **Cards**: CSS gradient backgrounds (matching original game)
- **Enemies**: ASCII art representations
- **Relics**: Emoji icons

This ensures the game is fully playable even without generated art.
