#!/usr/bin/env node

/**
 * VP-04: Character-Specific Relic Art Replacement
 *
 * Generates high-quality art for 15 character-specific relics:
 *
 * Ironclad (3):
 * - mark_of_pain: Bloody scar/wound symbol - +2 Strength at combat start
 * - charred_glove: Burning gauntlet - Every 5 attacks deals 8 damage to all
 * - blood_oath: Pulsing heart symbol - Heal 10 HP if below 50% at combat end
 *
 * Silent (4):
 * - ring_of_the_snake: Coiled snake ring - Draw 2 at combat start (starter)
 * - envenom_ring: Poison dripping ring - Apply Weak 2 to all at combat start
 * - wrist_blade: Hidden blade on wrist - Every 2 attacks grants +1 Dexterity
 * - cloak_of_shadows: Dark hooded cloak - +12 Block at combat start
 *
 * Defect (4):
 * - cracked_core: Damaged orb with lightning - Channel Lightning at start (starter)
 * - capacitor_coil: Electric coil - Channel Frost at combat start
 * - data_disk: Glowing data storage disk - +1 Strength and Dexterity at start
 * - emotion_chip: Circuit with heart - Block 3 and Draw 2 on first HP loss
 *
 * Watcher (4):
 * - pure_water: Glowing water droplet - Add Miracle to hand at start (starter)
 * - damaru: Ritual drum - +1 Energy at combat start
 * - golden_eye: All-seeing eye - Draw 1 at combat start
 * - duality: Yin-yang balance symbol - Every 4 stance changes grants 8 Block
 *
 * Target: >3KB per relic with detailed art
 *
 * Usage: node scripts/generate-character-relic-art-vp04.js
 * Requires: sharp (devDependency)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SIZE = 768; // Large canvas for high detail
const OUTPUT_SIZE = 256; // Match existing relics at 256x256
const NOISE_DENSITY = 400; // High density for rich textures

// Generate noise pattern for textures
function noisePattern(count, bounds, colors, opacityRange, sizeRange = [1, 4]) {
  const parts = [];
  for (let i = 0; i < count; i++) {
    const x = bounds.x + Math.random() * bounds.w;
    const y = bounds.y + Math.random() * bounds.h;
    const r = sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]);
    const color = colors[Math.floor(Math.random() * colors.length)];
    const opacity = opacityRange[0] + Math.random() * (opacityRange[1] - opacityRange[0]);
    parts.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${color}" opacity="${opacity.toFixed(2)}" />`);
  }
  return parts;
}

// Generate sparkle/shine effect
function sparkles(cx, cy, count, radius, color) {
  const parts = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const dist = radius * (0.5 + Math.random() * 0.5);
    const x = cx + Math.cos(angle) * dist;
    const y = cy + Math.sin(angle) * dist;
    const size = 1 + Math.random() * 2;
    const opacity = 0.4 + Math.random() * 0.5;
    parts.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${size.toFixed(1)}" fill="${color}" opacity="${opacity.toFixed(2)}" />`);
  }
  return parts;
}

// Character color schemes
const CHAR_COLORS = {
  ironclad: { primary: '#aa2222', secondary: '#ff4444', accent: '#ffaa44', bg1: '#3a1a1a', bg2: '#1a0808' },
  silent: { primary: '#22aa44', secondary: '#44ff66', accent: '#88ff88', bg1: '#1a3a1a', bg2: '#081a08' },
  defect: { primary: '#2266aa', secondary: '#4488ff', accent: '#66aaff', bg1: '#1a2a3a', bg2: '#080818' },
  watcher: { primary: '#aa44aa', secondary: '#dd66dd', accent: '#ffaaff', bg1: '#3a1a3a', bg2: '#180818' }
};

const RELICS = [
  // === IRONCLAD RELICS ===
  {
    id: 'mark_of_pain',
    name: 'Mark of Pain',
    character: 'ironclad',
    description: '+2 Strength at combat start',
    buildParts: () => {
      const parts = [];
      const c = CHAR_COLORS.ironclad;

      // Central wound/scar mark
      parts.push('<ellipse cx="0" cy="0" rx="45" ry="50" fill="#3a1a1a" opacity="0.95" />');
      parts.push('<ellipse cx="-3" cy="-3" rx="40" ry="45" fill="#4a2a2a" opacity="0.9" />');

      // Jagged scar pattern
      parts.push('<path d="M -30 -35 L -5 -10 L -25 5 L 0 25 L -15 40" stroke="#aa2222" stroke-width="8" fill="none" opacity="0.9" />');
      parts.push('<path d="M -28 -33 L -3 -8 L -23 7 L 2 27 L -13 42" stroke="#cc4444" stroke-width="4" fill="none" opacity="0.7" />');

      // Blood drips
      parts.push('<path d="M 0 25 Q 5 35 3 50 Q 0 55 -3 50" fill="#aa2222" opacity="0.85" />');
      parts.push('<path d="M -15 40 Q -20 50 -18 60" stroke="#aa2222" stroke-width="4" fill="none" opacity="0.7" />');

      // Wound texture
      parts.push(...noisePattern(NOISE_DENSITY, { x: -80, y: -90, w: 160, h: 180 },
        ['#5a2a2a', '#4a1a1a', '#6a3a3a', '#aa3333'], [0.1, 0.3], [2, 6]));

      // Inner glow from pain
      parts.push('<ellipse cx="0" cy="0" rx="30" ry="35" fill="#ff4444" opacity="0.15" />');
      parts.push('<ellipse cx="-5" cy="5" rx="20" ry="25" fill="#ff6666" opacity="0.1" />');

      // Strength symbols (small + marks)
      parts.push('<path d="M 25 -25 L 25 -15 M 20 -20 L 30 -20" stroke="#ffaa44" stroke-width="3" opacity="0.8" />');
      parts.push('<path d="M -30 25 L -30 35 M -35 30 L -25 30" stroke="#ffaa44" stroke-width="3" opacity="0.8" />');

      return parts;
    }
  },
  {
    id: 'charred_glove',
    name: 'Charred Glove',
    character: 'ironclad',
    description: 'Every 5 attacks deals 8 damage to all',
    buildParts: () => {
      const parts = [];

      // Gauntlet base
      parts.push('<path d="M -35 50 L -35 -10 Q -35 -30 -15 -40 L 15 -40 Q 35 -30 35 -10 L 35 50 Q 30 55 0 55 Q -30 55 -35 50" fill="#3a3a3a" opacity="0.95" />');
      parts.push('<path d="M -32 48 L -32 -8 Q -32 -26 -13 -36 L 13 -36 Q 32 -26 32 -8 L 32 48 Q 27 52 0 52 Q -27 52 -32 48" fill="#4a4a4a" opacity="0.9" />');

      // Finger segments
      for (let i = 0; i < 4; i++) {
        const x = -25 + i * 16;
        parts.push(`<rect x="${x}" y="-55" width="12" height="18" rx="3" fill="#3a3a3a" opacity="0.95" />`);
        parts.push(`<rect x="${x + 1}" y="-53" width="10" height="14" fill="#4a4a4a" opacity="0.8" />`);
      }

      // Thumb
      parts.push('<rect x="-45" y="-25" width="14" height="20" rx="4" fill="#3a3a3a" transform="rotate(-30, -38, -15)" opacity="0.95" />');

      // Char marks and burn patterns
      parts.push(...noisePattern(NOISE_DENSITY, { x: -40, y: -55, w: 80, h: 115 },
        ['#2a2a2a', '#1a1a1a', '#3a3a3a', '#111'], [0.15, 0.35], [1, 3]));

      // Fire/ember effects
      parts.push('<ellipse cx="0" cy="-20" rx="25" ry="20" fill="#ff4400" opacity="0.25" />');
      parts.push('<ellipse cx="5" cy="-25" rx="18" ry="15" fill="#ff6622" opacity="0.2" />');
      parts.push('<ellipse cx="0" cy="-28" rx="12" ry="10" fill="#ffaa44" opacity="0.15" />');

      // Glowing cracks
      parts.push('<path d="M -20 10 Q -10 20 0 15 Q 15 10 20 25" stroke="#ff4400" stroke-width="2" fill="none" opacity="0.6" />');
      parts.push('<path d="M -15 -5 Q -5 -10 10 -5" stroke="#ff6622" stroke-width="2" fill="none" opacity="0.5" />');

      // Embers floating
      parts.push(...sparkles(0, -30, 8, 35, '#ff6622'));

      return parts;
    }
  },
  {
    id: 'blood_oath',
    name: 'Blood Oath',
    character: 'ironclad',
    description: 'Heal 10 HP if below 50% at combat end',
    buildParts: () => {
      const parts = [];

      // Anatomical heart shape
      parts.push('<path d="M 0 -40 Q -30 -55 -40 -30 Q -50 -5 -25 20 L 0 50 L 25 20 Q 50 -5 40 -30 Q 30 -55 0 -40" fill="#8a2222" opacity="0.95" />');
      parts.push('<path d="M 0 -38 Q -27 -52 -36 -28 Q -45 -5 -22 18 L 0 45 L 22 18 Q 45 -5 36 -28 Q 27 -52 0 -38" fill="#aa3333" opacity="0.85" />');

      // Heart texture
      parts.push(...noisePattern(NOISE_DENSITY, { x: -45, y: -55, w: 90, h: 110 },
        ['#aa3333', '#8a2222', '#cc4444', '#7a1a1a'], [0.08, 0.22], [1, 3]));

      // Arteries/veins
      parts.push('<path d="M -30 -40 Q -40 -50 -45 -40" stroke="#661111" stroke-width="4" fill="none" opacity="0.7" />');
      parts.push('<path d="M 30 -40 Q 40 -50 45 -40" stroke="#661111" stroke-width="4" fill="none" opacity="0.7" />');
      parts.push('<path d="M 0 -42 L 0 -60" stroke="#661111" stroke-width="5" fill="none" opacity="0.7" />');

      // Pulsing glow effect
      parts.push('<path d="M 0 -35 Q -22 -48 -32 -28 Q -40 -5 -20 15 L 0 40 L 20 15 Q 40 -5 32 -28 Q 22 -48 0 -35" fill="#ff4444" opacity="0.2" />');
      parts.push('<path d="M 0 -32 Q -18 -42 -26 -25 Q -32 -5 -16 12 L 0 35 L 16 12 Q 32 -5 26 -25 Q 18 -42 0 -32" fill="#ff6666" opacity="0.15" />');

      // Highlight
      parts.push('<ellipse cx="-15" cy="-30" rx="10" ry="8" fill="#cc5555" opacity="0.5" />');

      // Blood drops
      parts.push('<ellipse cx="0" cy="58" rx="6" ry="10" fill="#aa2222" opacity="0.8" />');

      return parts;
    }
  },

  // === SILENT RELICS ===
  {
    id: 'ring_of_the_snake',
    name: 'Ring of the Snake',
    character: 'silent',
    description: 'Draw 2 cards at combat start (starter)',
    buildParts: () => {
      const parts = [];

      // Ring base
      parts.push('<ellipse cx="0" cy="0" rx="42" ry="42" fill="none" stroke="#228844" stroke-width="12" opacity="0.95" />');
      parts.push('<ellipse cx="0" cy="0" rx="42" ry="42" fill="none" stroke="#33aa55" stroke-width="8" opacity="0.6" />');

      // Snake coiling around ring
      const snakePoints = [];
      for (let t = 0; t < Math.PI * 2.5; t += 0.1) {
        const r = 42 + Math.sin(t * 3) * 5;
        const x = Math.cos(t) * r;
        const y = Math.sin(t) * r;
        snakePoints.push({ x, y });
      }

      // Snake body
      let snakePath = `M ${snakePoints[0].x} ${snakePoints[0].y}`;
      for (let i = 1; i < snakePoints.length; i++) {
        snakePath += ` L ${snakePoints[i].x} ${snakePoints[i].y}`;
      }
      parts.push(`<path d="${snakePath}" stroke="#116633" stroke-width="10" fill="none" stroke-linecap="round" opacity="0.95" />`);
      parts.push(`<path d="${snakePath}" stroke="#228844" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.8" />`);

      // Snake head (at end of path)
      const headX = snakePoints[snakePoints.length - 1].x;
      const headY = snakePoints[snakePoints.length - 1].y;
      parts.push(`<ellipse cx="${headX}" cy="${headY - 5}" rx="12" ry="10" fill="#116633" opacity="0.95" />`);
      parts.push(`<ellipse cx="${headX}" cy="${headY - 6}" rx="10" ry="8" fill="#228844" opacity="0.8" />`);

      // Snake eyes
      parts.push(`<ellipse cx="${headX - 4}" cy="${headY - 8}" rx="2" ry="3" fill="#88ff88" opacity="0.9" />`);
      parts.push(`<ellipse cx="${headX + 4}" cy="${headY - 8}" rx="2" ry="3" fill="#88ff88" opacity="0.9" />`);

      // Scales texture
      parts.push(...noisePattern(NOISE_DENSITY, { x: -50, y: -50, w: 100, h: 100 },
        ['#33aa55', '#228844', '#44bb66'], [0.1, 0.25], [1, 2]));

      // Gem in ring
      parts.push('<ellipse cx="0" cy="-42" rx="8" ry="8" fill="#115533" opacity="0.95" />');
      parts.push('<ellipse cx="0" cy="-42" rx="6" ry="6" fill="#22aa55" opacity="0.9" />');
      parts.push('<ellipse cx="-2" cy="-44" rx="2" ry="2" fill="#88ff88" opacity="0.7" />');

      return parts;
    }
  },
  {
    id: 'envenom_ring',
    name: 'Envenom Ring',
    character: 'silent',
    description: 'Apply Weak 2 to all enemies at combat start',
    buildParts: () => {
      const parts = [];

      // Ring base
      parts.push('<ellipse cx="0" cy="0" rx="38" ry="38" fill="none" stroke="#334422" stroke-width="10" opacity="0.95" />');
      parts.push('<ellipse cx="0" cy="0" rx="38" ry="38" fill="none" stroke="#445533" stroke-width="6" opacity="0.7" />');

      // Poison gem
      parts.push('<ellipse cx="0" cy="-38" rx="14" ry="14" fill="#223311" opacity="0.95" />');
      parts.push('<ellipse cx="0" cy="-38" rx="11" ry="11" fill="#446622" opacity="0.9" />');
      parts.push('<ellipse cx="0" cy="-38" rx="8" ry="8" fill="#66aa33" opacity="0.85" />');
      parts.push('<ellipse cx="-3" cy="-41" rx="3" ry="3" fill="#88cc44" opacity="0.6" />');

      // Poison dripping from gem
      parts.push('<path d="M 0 -24 Q 2 -15 0 -5 Q -3 5 0 15" stroke="#66aa33" stroke-width="4" fill="none" opacity="0.7" />');
      parts.push('<ellipse cx="0" cy="20" rx="5" ry="7" fill="#66aa33" opacity="0.6" />');
      parts.push('<path d="M 8 -20 Q 12 -10 10 0" stroke="#66aa33" stroke-width="3" fill="none" opacity="0.5" />');
      parts.push('<ellipse cx="10" cy="5" rx="4" ry="5" fill="#66aa33" opacity="0.5" />');

      // Poison puddle below
      parts.push('<ellipse cx="0" cy="50" rx="25" ry="10" fill="#446622" opacity="0.4" />');
      parts.push('<ellipse cx="0" cy="48" rx="18" ry="7" fill="#66aa33" opacity="0.3" />');

      // Toxic vapor
      parts.push(...sparkles(0, 0, 12, 45, '#88cc44'));

      // Ring texture
      parts.push(...noisePattern(NOISE_DENSITY, { x: -45, y: -45, w: 90, h: 90 },
        ['#556644', '#445533', '#667755'], [0.08, 0.2], [1, 2]));

      return parts;
    }
  },
  {
    id: 'wrist_blade',
    name: 'Wrist Blade',
    character: 'silent',
    description: 'Every 2 attacks grants +1 Dexterity',
    buildParts: () => {
      const parts = [];

      // Wrist band/bracer
      parts.push('<rect x="-35" y="10" width="70" height="40" rx="8" fill="#3a3a3a" opacity="0.95" />');
      parts.push('<rect x="-32" y="13" width="64" height="34" rx="6" fill="#4a4a4a" opacity="0.85" />');

      // Bracer details
      parts.push('<rect x="-28" y="16" width="56" height="8" fill="#333" opacity="0.6" />');
      parts.push('<rect x="-28" y="36" width="56" height="8" fill="#333" opacity="0.6" />');

      // Hidden blade extended
      parts.push('<path d="M -5 10 L 0 -55 L 5 10" fill="#aabbcc" opacity="0.95" />');
      parts.push('<path d="M -3 8 L 0 -50 L 3 8" fill="#ccdde8" opacity="0.8" />');
      parts.push('<path d="M 0 -50 L 0 5" stroke="#ddeef8" stroke-width="1" opacity="0.6" />');

      // Blade edge gleam
      parts.push('<path d="M -3 -40 L 0 -50 L 3 -40" fill="#ffffff" opacity="0.4" />');

      // Mechanism showing
      parts.push('<rect x="-8" y="5" width="16" height="8" rx="2" fill="#555" opacity="0.9" />');
      parts.push('<circle cx="0" cy="9" r="3" fill="#666" opacity="0.8" />');

      // Leather straps
      parts.push('<rect x="-40" y="18" width="8" height="24" rx="2" fill="#553322" opacity="0.9" />');
      parts.push('<rect x="32" y="18" width="8" height="24" rx="2" fill="#553322" opacity="0.9" />');

      // Buckles
      parts.push('<rect x="-38" y="26" width="4" height="8" fill="#aa8844" opacity="0.8" />');
      parts.push('<rect x="34" y="26" width="4" height="8" fill="#aa8844" opacity="0.8" />');

      // Texture
      parts.push(...noisePattern(NOISE_DENSITY, { x: -40, y: 10, w: 80, h: 45 },
        ['#555', '#444', '#666'], [0.1, 0.25], [1, 2]));

      return parts;
    }
  },
  {
    id: 'cloak_of_shadows',
    name: 'Cloak of Shadows',
    character: 'silent',
    description: '+12 Block at combat start',
    buildParts: () => {
      const parts = [];

      // Cloak flowing shape
      parts.push('<path d="M 0 -55 Q -50 -30 -45 20 Q -40 50 -25 60 L 0 50 L 25 60 Q 40 50 45 20 Q 50 -30 0 -55" fill="#1a1a2a" opacity="0.95" />');
      parts.push('<path d="M 0 -52 Q -45 -28 -42 18 Q -38 46 -23 55 L 0 46 L 23 55 Q 38 46 42 18 Q 45 -28 0 -52" fill="#2a2a3a" opacity="0.9" />');

      // Hood
      parts.push('<ellipse cx="0" cy="-40" rx="35" ry="25" fill="#1a1a2a" opacity="0.95" />');
      parts.push('<ellipse cx="0" cy="-42" rx="30" ry="20" fill="#2a2a3a" opacity="0.85" />');

      // Hood shadow (face area)
      parts.push('<ellipse cx="0" cy="-35" rx="22" ry="15" fill="#0a0a15" opacity="0.95" />');

      // Subtle glowing eyes in shadow
      parts.push('<ellipse cx="-8" cy="-38" rx="3" ry="2" fill="#44aa66" opacity="0.6" />');
      parts.push('<ellipse cx="8" cy="-38" rx="3" ry="2" fill="#44aa66" opacity="0.6" />');

      // Cloak folds
      parts.push('<path d="M -30 -20 Q -35 10 -28 40" stroke="#151525" stroke-width="3" fill="none" opacity="0.5" />');
      parts.push('<path d="M 30 -20 Q 35 10 28 40" stroke="#151525" stroke-width="3" fill="none" opacity="0.5" />');
      parts.push('<path d="M 0 -30 Q 5 10 0 45" stroke="#151525" stroke-width="2" fill="none" opacity="0.4" />');

      // Shadow wisps
      parts.push('<path d="M -40 30 Q -50 40 -55 50" stroke="#2a2a3a" stroke-width="4" fill="none" opacity="0.5" />');
      parts.push('<path d="M 40 30 Q 50 40 55 50" stroke="#2a2a3a" stroke-width="4" fill="none" opacity="0.5" />');

      // Cloak texture
      parts.push(...noisePattern(NOISE_DENSITY, { x: -50, y: -55, w: 100, h: 120 },
        ['#2a2a3a', '#1a1a2a', '#3a3a4a'], [0.08, 0.22], [1, 3]));

      // Clasp
      parts.push('<ellipse cx="0" cy="-15" rx="8" ry="8" fill="#444455" opacity="0.9" />');
      parts.push('<ellipse cx="0" cy="-15" rx="5" ry="5" fill="#555566" opacity="0.8" />');

      return parts;
    }
  },

  // === DEFECT RELICS ===
  {
    id: 'cracked_core',
    name: 'Cracked Core',
    character: 'defect',
    description: 'Channel Lightning at combat start (starter)',
    buildParts: () => {
      const parts = [];

      // Outer damaged shell
      parts.push('<ellipse cx="0" cy="0" rx="48" ry="48" fill="#334455" opacity="0.95" />');
      parts.push('<ellipse cx="-3" cy="-3" rx="44" ry="44" fill="#445566" opacity="0.9" />');

      // Cracks in the shell
      parts.push('<path d="M -40 -20 L -15 -10 L -25 10 L -5 20" stroke="#223344" stroke-width="4" fill="none" opacity="0.8" />');
      parts.push('<path d="M 30 -35 L 20 -15 L 35 5" stroke="#223344" stroke-width="3" fill="none" opacity="0.7" />');
      parts.push('<path d="M -10 40 L 5 25 L 25 35" stroke="#223344" stroke-width="3" fill="none" opacity="0.7" />');

      // Lightning glow through cracks
      parts.push('<path d="M -38 -18 L -13 -8 L -23 12 L -3 22" stroke="#88aaff" stroke-width="2" fill="none" opacity="0.6" />');

      // Inner energy core
      parts.push('<ellipse cx="0" cy="0" rx="25" ry="25" fill="#2244aa" opacity="0.9" />');
      parts.push('<ellipse cx="0" cy="0" rx="20" ry="20" fill="#4466cc" opacity="0.85" />');
      parts.push('<ellipse cx="0" cy="0" rx="14" ry="14" fill="#6688ee" opacity="0.8" />');
      parts.push('<ellipse cx="-4" cy="-4" rx="6" ry="6" fill="#88aaff" opacity="0.7" />');

      // Lightning bolt symbol in core
      parts.push('<path d="M 5 -12 L -3 2 L 5 0 L -2 15" stroke="#aaccff" stroke-width="3" fill="none" opacity="0.8" />');

      // Core glow
      parts.push('<ellipse cx="0" cy="0" rx="35" ry="35" fill="#4488ff" opacity="0.15" />');

      // Shell texture
      parts.push(...noisePattern(NOISE_DENSITY, { x: -50, y: -50, w: 100, h: 100 },
        ['#556677', '#445566', '#667788'], [0.08, 0.2], [1, 2]));

      // Sparks
      parts.push(...sparkles(0, 0, 10, 40, '#88aaff'));

      return parts;
    }
  },
  {
    id: 'capacitor_coil',
    name: 'Capacitor Coil',
    character: 'defect',
    description: 'Channel Frost at combat start',
    buildParts: () => {
      const parts = [];

      // Coil base cylinder
      parts.push('<rect x="-25" y="-45" width="50" height="90" rx="8" fill="#334455" opacity="0.95" />');
      parts.push('<rect x="-22" y="-42" width="44" height="84" fill="#445566" opacity="0.85" />');

      // Copper coil wrapping
      for (let i = 0; i < 8; i++) {
        const y = -38 + i * 10;
        parts.push(`<ellipse cx="0" cy="${y}" rx="28" ry="6" fill="#aa6633" opacity="0.9" />`);
        parts.push(`<ellipse cx="0" cy="${y - 1}" rx="26" ry="5" fill="#cc8844" opacity="0.7" />`);
      }

      // Frost crystal forming on top
      parts.push('<path d="M 0 -55 L 8 -45 L 0 -35 L -8 -45 Z" fill="#88ccee" opacity="0.8" />');
      parts.push('<path d="M -12 -50 L 0 -55 L 12 -50" stroke="#aaddff" stroke-width="2" fill="none" opacity="0.7" />');
      parts.push('<path d="M 0 -55 L 0 -65" stroke="#aaddff" stroke-width="2" opacity="0.6" />');
      parts.push('<path d="M -6 -58 L 0 -65 L 6 -58" stroke="#aaddff" stroke-width="1" fill="none" opacity="0.5" />');

      // Ice crystals
      parts.push('<path d="M -20 -35 L -25 -40 L -20 -45" stroke="#88ccee" stroke-width="2" fill="none" opacity="0.6" />');
      parts.push('<path d="M 20 -30 L 28 -35 L 22 -25" stroke="#88ccee" stroke-width="2" fill="none" opacity="0.6" />');

      // Cold vapor
      parts.push(...sparkles(0, -50, 8, 25, '#aaddff'));

      // Frost glow
      parts.push('<ellipse cx="0" cy="-45" rx="30" ry="20" fill="#88ccee" opacity="0.15" />');

      // Metal texture
      parts.push(...noisePattern(NOISE_DENSITY, { x: -28, y: -50, w: 56, h: 100 },
        ['#556677', '#445566', '#667788'], [0.08, 0.2], [1, 2]));

      // Terminals
      parts.push('<ellipse cx="-20" cy="50" rx="6" ry="4" fill="#888" opacity="0.9" />');
      parts.push('<ellipse cx="20" cy="50" rx="6" ry="4" fill="#888" opacity="0.9" />');

      return parts;
    }
  },
  {
    id: 'data_disk',
    name: 'Data Disk',
    character: 'defect',
    description: '+1 Strength and Dexterity at combat start',
    buildParts: () => {
      const parts = [];

      // Disk base
      parts.push('<ellipse cx="0" cy="0" rx="50" ry="50" fill="#223344" opacity="0.95" />');
      parts.push('<ellipse cx="-2" cy="-2" rx="46" ry="46" fill="#334455" opacity="0.9" />');

      // Center hub
      parts.push('<ellipse cx="0" cy="0" rx="15" ry="15" fill="#111" opacity="0.95" />');
      parts.push('<ellipse cx="0" cy="0" rx="8" ry="8" fill="#222" opacity="0.9" />');

      // Data tracks (concentric rings)
      for (let i = 1; i <= 4; i++) {
        const r = 18 + i * 7;
        parts.push(`<ellipse cx="0" cy="0" rx="${r}" ry="${r}" fill="none" stroke="#445566" stroke-width="3" opacity="0.6" />`);
      }

      // Glowing data points on tracks
      for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        const r = 22 + Math.floor(Math.random() * 4) * 7;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        const glow = Math.random() > 0.5;
        parts.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2" fill="${glow ? '#66aaff' : '#446688'}" opacity="${glow ? 0.9 : 0.6}" />`);
      }

      // Read head
      parts.push('<path d="M 35 -15 L 45 -5 L 35 5 L 38 -5 Z" fill="#555566" opacity="0.9" />');

      // Data glow
      parts.push('<ellipse cx="0" cy="0" rx="35" ry="35" fill="#4488ff" opacity="0.1" />');

      // Surface texture
      parts.push(...noisePattern(NOISE_DENSITY, { x: -50, y: -50, w: 100, h: 100 },
        ['#3a4a5a', '#2a3a4a', '#4a5a6a'], [0.06, 0.16], [1, 2]));

      // Stat symbols (+ marks)
      parts.push('<path d="M -30 -30 L -30 -22 M -34 -26 L -26 -26" stroke="#ff8844" stroke-width="2" opacity="0.7" />');
      parts.push('<path d="M 30 30 L 30 38 M 26 34 L 34 34" stroke="#44ff88" stroke-width="2" opacity="0.7" />');

      return parts;
    }
  },
  {
    id: 'emotion_chip',
    name: 'Emotion Chip',
    character: 'defect',
    description: 'Block 3 and Draw 2 on first HP loss',
    buildParts: () => {
      const parts = [];

      // Chip base (circuit board)
      parts.push('<rect x="-45" y="-35" width="90" height="70" rx="5" fill="#1a3322" opacity="0.95" />');
      parts.push('<rect x="-42" y="-32" width="84" height="64" fill="#224433" opacity="0.9" />');

      // Circuit traces
      parts.push('<path d="M -35 -25 L -15 -25 L -15 -10 L 10 -10" stroke="#44aa66" stroke-width="2" fill="none" opacity="0.7" />');
      parts.push('<path d="M -35 5 L -20 5 L -20 20 L 15 20" stroke="#44aa66" stroke-width="2" fill="none" opacity="0.7" />');
      parts.push('<path d="M 35 -20 L 20 -20 L 20 0 L 5 0" stroke="#44aa66" stroke-width="2" fill="none" opacity="0.7" />');
      parts.push('<path d="M 35 15 L 25 15 L 25 -5" stroke="#44aa66" stroke-width="2" fill="none" opacity="0.7" />');

      // Heart symbol (emotion) in center
      parts.push('<path d="M 0 -12 Q -12 -22 -18 -10 Q -24 2 -10 14 L 0 25 L 10 14 Q 24 2 18 -10 Q 12 -22 0 -12" fill="#aa3344" opacity="0.9" />');
      parts.push('<path d="M 0 -10 Q -10 -18 -14 -8 Q -18 2 -8 12 L 0 20 L 8 12 Q 18 2 14 -8 Q 10 -18 0 -10" fill="#cc4455" opacity="0.8" />');
      parts.push('<ellipse cx="-6" cy="-8" rx="4" ry="3" fill="#dd6677" opacity="0.6" />');

      // Heart pulsing glow
      parts.push('<path d="M 0 -15 Q -15 -28 -22 -12 Q -30 5 -12 20 L 0 32 L 12 20 Q 30 5 22 -12 Q 15 -28 0 -15" fill="#ff4466" opacity="0.15" />');

      // Contact pins on sides
      for (let i = 0; i < 4; i++) {
        const y = -25 + i * 15;
        parts.push(`<rect x="-52" y="${y}" width="10" height="6" fill="#aa9944" opacity="0.9" />`);
        parts.push(`<rect x="42" y="${y}" width="10" height="6" fill="#aa9944" opacity="0.9" />`);
      }

      // Small components
      parts.push('<rect x="-38" y="-28" width="8" height="5" fill="#333" opacity="0.8" />');
      parts.push('<rect x="30" y="22" width="8" height="5" fill="#333" opacity="0.8" />');
      parts.push('<circle cx="-30" cy="22" r="4" fill="#333" opacity="0.8" />');
      parts.push('<circle cx="35" cy="-25" r="4" fill="#333" opacity="0.8" />');

      return parts;
    }
  },

  // === WATCHER RELICS ===
  {
    id: 'pure_water',
    name: 'Pure Water',
    character: 'watcher',
    description: 'Add Miracle to hand at combat start (starter)',
    buildParts: () => {
      const parts = [];

      // Water droplet shape
      parts.push('<path d="M 0 -50 Q 40 0 30 30 Q 20 55 0 60 Q -20 55 -30 30 Q -40 0 0 -50" fill="#2266aa" opacity="0.95" />');
      parts.push('<path d="M 0 -45 Q 35 -2 26 28 Q 17 50 0 54 Q -17 50 -26 28 Q -35 -2 0 -45" fill="#3388cc" opacity="0.9" />');
      parts.push('<path d="M 0 -38 Q 28 0 20 24 Q 12 42 0 45 Q -12 42 -20 24 Q -28 0 0 -38" fill="#44aaee" opacity="0.8" />');

      // Inner light/purity
      parts.push('<ellipse cx="0" cy="10" rx="18" ry="22" fill="#66ccff" opacity="0.5" />');
      parts.push('<ellipse cx="-5" cy="0" rx="10" ry="15" fill="#88ddff" opacity="0.4" />');

      // Highlight/reflection
      parts.push('<ellipse cx="-12" cy="-15" rx="8" ry="12" fill="#aaeeff" opacity="0.5" />');
      parts.push('<ellipse cx="-10" cy="-18" rx="4" ry="6" fill="#ffffff" opacity="0.4" />');

      // Sparkles of divine light
      parts.push(...sparkles(0, 0, 12, 50, '#aaeeff'));

      // Ripple at bottom
      parts.push('<ellipse cx="0" cy="58" rx="20" ry="5" fill="#4488cc" opacity="0.3" />');
      parts.push('<ellipse cx="0" cy="62" rx="28" ry="6" fill="#3377bb" opacity="0.2" />');

      // Subtle glow
      parts.push('<ellipse cx="0" cy="5" rx="45" ry="55" fill="#66aaee" opacity="0.1" />');

      return parts;
    }
  },
  {
    id: 'damaru',
    name: 'Damaru',
    character: 'watcher',
    description: '+1 Energy at combat start',
    buildParts: () => {
      const parts = [];

      // Drum body (hourglass shape)
      parts.push('<path d="M -30 -40 Q -35 -20 -20 0 Q -35 20 -30 40 L 30 40 Q 35 20 20 0 Q 35 -20 30 -40 Z" fill="#553322" opacity="0.95" />');
      parts.push('<path d="M -27 -37 Q -32 -18 -18 0 Q -32 18 -27 37 L 27 37 Q 32 18 18 0 Q 32 -18 27 -37 Z" fill="#664433" opacity="0.9" />');

      // Drum heads (top and bottom)
      parts.push('<ellipse cx="0" cy="-42" rx="30" ry="10" fill="#aa9977" opacity="0.95" />');
      parts.push('<ellipse cx="0" cy="-43" rx="26" ry="8" fill="#bbaa88" opacity="0.8" />');
      parts.push('<ellipse cx="0" cy="42" rx="30" ry="10" fill="#aa9977" opacity="0.95" />');
      parts.push('<ellipse cx="0" cy="41" rx="26" ry="8" fill="#bbaa88" opacity="0.8" />');

      // Center waist decoration
      parts.push('<ellipse cx="0" cy="0" rx="15" ry="8" fill="#443322" opacity="0.9" />');
      parts.push('<ellipse cx="0" cy="0" rx="12" ry="6" fill="#554433" opacity="0.8" />');

      // Striker beads on strings
      parts.push('<path d="M -22 0 Q -35 -15 -40 0 Q -35 15 -22 0" stroke="#664433" stroke-width="2" fill="none" opacity="0.8" />');
      parts.push('<path d="M 22 0 Q 35 -15 40 0 Q 35 15 22 0" stroke="#664433" stroke-width="2" fill="none" opacity="0.8" />');
      parts.push('<circle cx="-40" cy="0" r="6" fill="#332211" opacity="0.95" />');
      parts.push('<circle cx="40" cy="0" r="6" fill="#332211" opacity="0.95" />');

      // Decorative patterns
      parts.push('<path d="M -15 -25 L 15 -25 M -12 25 L 12 25" stroke="#887766" stroke-width="2" opacity="0.6" />');

      // Ritual symbols
      parts.push('<circle cx="0" cy="-42" r="8" stroke="#aa8866" stroke-width="1" fill="none" opacity="0.5" />');
      parts.push('<path d="M -4 -42 L 4 -42 M 0 -46 L 0 -38" stroke="#aa8866" stroke-width="1" opacity="0.5" />');

      // Energy glow
      parts.push('<ellipse cx="0" cy="0" rx="50" ry="55" fill="#ffaa44" opacity="0.08" />');

      // Texture
      parts.push(...noisePattern(NOISE_DENSITY, { x: -35, y: -50, w: 70, h: 100 },
        ['#775544', '#664433', '#886655'], [0.08, 0.2], [1, 2]));

      return parts;
    }
  },
  {
    id: 'golden_eye',
    name: 'Golden Eye',
    character: 'watcher',
    description: 'Draw 1 card at combat start',
    buildParts: () => {
      const parts = [];

      // Eye shape (almond)
      parts.push('<path d="M -50 0 Q 0 -45 50 0 Q 0 45 -50 0" fill="#aa8822" opacity="0.95" />');
      parts.push('<path d="M -45 0 Q 0 -38 45 0 Q 0 38 -45 0" fill="#cc9933" opacity="0.9" />');

      // Iris
      parts.push('<ellipse cx="0" cy="0" rx="28" ry="28" fill="#664411" opacity="0.95" />');
      parts.push('<ellipse cx="0" cy="0" rx="24" ry="24" fill="#885522" opacity="0.9" />');

      // Iris detail (radial pattern)
      for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2;
        const x1 = Math.cos(angle) * 10;
        const y1 = Math.sin(angle) * 10;
        const x2 = Math.cos(angle) * 24;
        const y2 = Math.sin(angle) * 24;
        parts.push(`<path d="M ${x1} ${y1} L ${x2} ${y2}" stroke="#996633" stroke-width="2" opacity="0.4" />`);
      }

      // Pupil
      parts.push('<ellipse cx="0" cy="0" rx="12" ry="12" fill="#221100" opacity="0.95" />');
      parts.push('<ellipse cx="0" cy="0" rx="8" ry="8" fill="#110800" opacity="0.95" />');

      // Highlight
      parts.push('<ellipse cx="-6" cy="-6" rx="5" ry="5" fill="#ffdd88" opacity="0.6" />');
      parts.push('<ellipse cx="-5" cy="-5" rx="2" ry="2" fill="#ffffff" opacity="0.5" />');

      // Secondary highlight
      parts.push('<ellipse cx="8" cy="6" rx="3" ry="3" fill="#eebb66" opacity="0.3" />');

      // Golden glow
      parts.push('<ellipse cx="0" cy="0" rx="40" ry="35" fill="#ffcc44" opacity="0.15" />');
      parts.push('<path d="M -55 0 Q 0 -50 55 0 Q 0 50 -55 0" fill="#ffdd66" opacity="0.1" />');

      // Eyelash details on edge
      parts.push('<path d="M -48 -4 Q -52 -8 -50 -12" stroke="#886622" stroke-width="2" fill="none" opacity="0.6" />');
      parts.push('<path d="M -45 -12 Q -50 -18 -46 -22" stroke="#886622" stroke-width="2" fill="none" opacity="0.6" />');
      parts.push('<path d="M 48 -4 Q 52 -8 50 -12" stroke="#886622" stroke-width="2" fill="none" opacity="0.6" />');
      parts.push('<path d="M 45 -12 Q 50 -18 46 -22" stroke="#886622" stroke-width="2" fill="none" opacity="0.6" />');

      // Wisdom rays
      parts.push(...sparkles(0, 0, 8, 55, '#ffdd88'));

      return parts;
    }
  },
  {
    id: 'duality',
    name: 'Duality',
    character: 'watcher',
    description: 'Every 4 stance changes grants 8 Block',
    buildParts: () => {
      const parts = [];

      // Yin-yang base circle
      parts.push('<ellipse cx="0" cy="0" rx="48" ry="48" fill="#dddddd" opacity="0.95" />');

      // Yin (dark) half
      parts.push('<path d="M 0 -48 A 48 48 0 0 0 0 48 A 24 24 0 0 0 0 0 A 24 24 0 0 1 0 -48" fill="#222233" opacity="0.95" />');

      // Yang (light) half
      parts.push('<path d="M 0 -48 A 48 48 0 0 1 0 48 A 24 24 0 0 1 0 0 A 24 24 0 0 0 0 -48" fill="#ddddcc" opacity="0.95" />');

      // Yin dot (light dot in dark)
      parts.push('<ellipse cx="0" cy="-24" rx="10" ry="10" fill="#ccccbb" opacity="0.95" />');
      parts.push('<ellipse cx="-2" cy="-26" rx="3" ry="3" fill="#eeeeee" opacity="0.5" />');

      // Yang dot (dark dot in light)
      parts.push('<ellipse cx="0" cy="24" rx="10" ry="10" fill="#333344" opacity="0.95" />');
      parts.push('<ellipse cx="-2" cy="22" rx="3" ry="3" fill="#444455" opacity="0.5" />');

      // Stance change indicators (subtle glows at quarters)
      parts.push('<ellipse cx="-34" cy="0" rx="8" ry="8" fill="#aa44aa" opacity="0.3" />');
      parts.push('<ellipse cx="34" cy="0" rx="8" ry="8" fill="#ffaa44" opacity="0.3" />');
      parts.push('<ellipse cx="0" cy="-34" rx="6" ry="6" fill="#44aaff" opacity="0.25" />');
      parts.push('<ellipse cx="0" cy="34" rx="6" ry="6" fill="#44ff88" opacity="0.25" />');

      // Outer ring
      parts.push('<ellipse cx="0" cy="0" rx="50" ry="50" fill="none" stroke="#aa88aa" stroke-width="3" opacity="0.6" />');

      // Balance energy
      parts.push('<ellipse cx="0" cy="0" rx="55" ry="55" fill="#aa66aa" opacity="0.08" />');

      // Subtle yin-yang texture
      parts.push(...noisePattern(NOISE_DENSITY, { x: -48, y: -48, w: 48, h: 96 },
        ['#333344', '#222233', '#444455'], [0.08, 0.2], [1, 2]));
      parts.push(...noisePattern(NOISE_DENSITY, { x: 0, y: -48, w: 48, h: 96 },
        ['#ccccbb', '#ddddcc', '#bbbbaa'], [0.08, 0.2], [1, 2]));

      return parts;
    }
  }
];

async function generateCharacterRelicArt() {
  const sharp = (await import('sharp')).default;
  const outDir = path.join(__dirname, '..', 'src', 'assets', 'art', 'relics');

  console.log('\n=== VP-04: Character-Specific Relic Art ===\n');
  console.log('Target: >3KB per relic with detailed art\n');

  const results = {
    ironclad: [],
    silent: [],
    defect: [],
    watcher: []
  };

  for (const relic of RELICS) {
    const parts = relic.buildParts();
    const c = CHAR_COLORS[relic.character];

    const svg = `<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="50%" cy="45%" r="70%">
      <stop offset="0%" stop-color="${c.bg1}" />
      <stop offset="100%" stop-color="${c.bg2}" />
    </radialGradient>
    <radialGradient id="glow" cx="50%" cy="45%" r="50%">
      <stop offset="0%" stop-color="${c.accent}" stop-opacity="0.2" />
      <stop offset="100%" stop-color="${c.accent}" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="vignette" cx="50%" cy="50%" r="50%">
      <stop offset="50%" stop-color="black" stop-opacity="0" />
      <stop offset="100%" stop-color="black" stop-opacity="0.6" />
    </radialGradient>
  </defs>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#bg)" />
  <rect width="${SIZE}" height="${SIZE}" fill="url(#glow)" />
  <g transform="translate(384, 400)">
    ${parts.join('\n    ')}
  </g>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#vignette)" />
</svg>`;

    const outPath = path.join(outDir, `${relic.id}.webp`);

    // Render at high resolution and downscale for quality
    await sharp(Buffer.from(svg))
      .resize(OUTPUT_SIZE, OUTPUT_SIZE, { kernel: 'lanczos3' })
      .webp({ quality: 100, nearLossless: true, effort: 6 })
      .toFile(outPath);

    const stats = fs.statSync(outPath);
    const sizeKB = (stats.size / 1024).toFixed(1);
    const status = stats.size > 3 * 1024 ? '✓' : '✗ (below 3KB)';

    results[relic.character].push({
      id: relic.id,
      name: relic.name,
      sizeKB,
      passed: stats.size > 3 * 1024
    });

    console.log(`  ${relic.id}.webp: ${sizeKB}KB ${status}`);
  }

  console.log('\n=== Summary by Character ===\n');

  for (const [char, relics] of Object.entries(results)) {
    const passed = relics.filter(r => r.passed).length;
    console.log(`${char.charAt(0).toUpperCase() + char.slice(1)}: ${passed}/${relics.length} passed`);
    for (const r of relics) {
      console.log(`  - ${r.name} (${r.id}.webp): ${r.sizeKB}KB`);
    }
  }

  console.log('\n=== Generation Complete ===\n');
}

generateCharacterRelicArt().catch(console.error);
