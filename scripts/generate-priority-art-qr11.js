#!/usr/bin/env node

/**
 * QR-11: Placeholder Asset Replacement — Priority Art Generation
 *
 * Generates improved SVG-based art for the top 10 priority assets identified
 * in the QR-06 Visual Asset Audit. Uses detailed layered SVG with textures,
 * gradients, and complex shapes for higher visual quality.
 *
 * Priority enemies (from ASSET_AUDIT.md):
 * 1. slimeBoss - Act 1 boss
 * 2. theGuardian - Act 1 boss
 * 3. hexaghost - Act 1 boss
 * 4. gremlinNob - Act 1 elite
 * 5. lagavulin - Act 1 elite
 * 6. cultist - Tutorial enemy
 * 7. jawWorm - Common first encounter
 * 8. automaton - Act 2 boss
 * 9. louse_red - Common Act 1
 *
 * Priority relic:
 * 10. pure_water - Watcher starter relic
 *
 * Usage: node scripts/generate-priority-art-qr11.js
 * Requires: sharp (devDependency)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENEMY_SIZE = 512;
const RELIC_SIZE = 128;

// Generate random noise pattern for texture
function noisePattern(count, bounds, colors, opacityRange) {
  const parts = [];
  for (let i = 0; i < count; i++) {
    const x = bounds.x + Math.random() * bounds.w;
    const y = bounds.y + Math.random() * bounds.h;
    const r = 1 + Math.random() * 3;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const opacity = opacityRange[0] + Math.random() * (opacityRange[1] - opacityRange[0]);
    parts.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${color}" opacity="${opacity.toFixed(2)}" />`);
  }
  return parts;
}

// Generate organic blob shapes for slimes
function blobShape(cx, cy, radius, irregularity, fill, opacity) {
  const points = 12;
  const angleStep = (Math.PI * 2) / points;
  const pts = [];
  for (let i = 0; i < points; i++) {
    const angle = i * angleStep;
    const r = radius * (1 + (Math.random() - 0.5) * irregularity);
    pts.push({
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle)
    });
  }
  // Close path with smooth curves
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < points; i++) {
    const curr = pts[i];
    const next = pts[(i + 1) % points];
    const cp1x = curr.x + (next.x - curr.x) * 0.5;
    const cp1y = curr.y;
    const cp2x = next.x - (next.x - curr.x) * 0.5;
    const cp2y = next.y;
    d += ` Q ${cp1x.toFixed(1)} ${cp1y.toFixed(1)} ${next.x.toFixed(1)} ${next.y.toFixed(1)}`;
  }
  d += ' Z';
  return `<path d="${d}" fill="${fill}" opacity="${opacity}" />`;
}

const ENEMIES = [
  {
    id: 'slimeBoss',
    name: 'Slime Boss',
    color1: '#1a3a1a',
    color2: '#050a05',
    accent: '#66dd44',
    glowColor: '#33aa22',
    buildParts: () => {
      const parts = [];
      // Background toxic glow
      parts.push('<ellipse cx="0" cy="40" rx="140" ry="90" fill="#33aa22" opacity="0.08" />');
      // Main body layers - massive toxic blob
      parts.push(blobShape(0, 30, 120, 0.3, '#1a4a1a', 0.95));
      parts.push(blobShape(-15, 35, 105, 0.25, '#2a5a2a', 0.85));
      parts.push(blobShape(10, 25, 95, 0.2, '#2a6a2a', 0.75));
      parts.push(blobShape(-5, 20, 85, 0.15, '#3a7a3a', 0.6));
      // Surface bubbles and boils with texture
      parts.push(...noisePattern(80, { x: -100, y: -50, w: 200, h: 150 }, ['#4a9a4a', '#3a8a3a', '#5aaa5a'], [0.1, 0.3]));
      // Large bubbles
      for (let i = 0; i < 8; i++) {
        const x = -70 + Math.random() * 140;
        const y = -30 + Math.random() * 100;
        const r = 10 + Math.random() * 18;
        parts.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="#4a9a4a" opacity="0.4" />`);
        parts.push(`<circle cx="${x-r*0.3}" cy="${y-r*0.3}" r="${r*0.3}" fill="#7acc7a" opacity="0.3" />`);
      }
      // Dripping slime tendrils
      const drips = [
        { x: -80, y: 90 }, { x: -50, y: 100 }, { x: -20, y: 95 },
        { x: 15, y: 105 }, { x: 45, y: 95 }, { x: 75, y: 88 }
      ];
      drips.forEach(d => {
        const len = 30 + Math.random() * 40;
        parts.push(`<path d="M ${d.x} ${d.y} Q ${d.x + (Math.random()-0.5)*10} ${d.y + len*0.6} ${d.x + (Math.random()-0.5)*5} ${d.y + len}" stroke="#44aa22" stroke-width="${4 + Math.random()*4}" fill="none" opacity="0.5" stroke-linecap="round" />`);
        parts.push(`<ellipse cx="${d.x}" cy="${d.y + len + 5}" rx="${3 + Math.random()*2}" ry="${5 + Math.random()*3}" fill="#44aa22" opacity="0.4" />`);
      });
      // Multiple menacing eyes
      const eyes = [
        { x: -50, y: -25, r: 18 }, { x: 5, y: -40, r: 22 }, { x: 55, y: -20, r: 16 },
        { x: -75, y: 10, r: 10 }, { x: 80, y: 5, r: 12 }, { x: -30, y: 20, r: 8 }
      ];
      eyes.forEach(eye => {
        parts.push(`<ellipse cx="${eye.x}" cy="${eye.y}" rx="${eye.r}" ry="${eye.r * 0.8}" fill="#0a1a0a" opacity="0.85" />`);
        parts.push(`<circle cx="${eye.x}" cy="${eye.y}" r="${eye.r * 0.65}" fill="#ccff44" opacity="0.9" />`);
        parts.push(`<circle cx="${eye.x}" cy="${eye.y}" r="${eye.r * 0.35}" fill="#224400" />`);
        parts.push(`<circle cx="${eye.x - eye.r*0.2}" cy="${eye.y - eye.r*0.2}" r="${eye.r * 0.15}" fill="#eeffaa" opacity="0.6" />`);
      });
      // Split line hint - it splits in combat
      parts.push('<path d="M 0 -70 L 0 100" stroke="#0a2a0a" stroke-width="2" opacity="0.25" stroke-dasharray="12,8" />');
      // Toxic pool beneath
      parts.push('<ellipse cx="0" cy="100" rx="100" ry="25" fill="#33aa22" opacity="0.12" />');
      return parts;
    }
  },
  {
    id: 'theGuardian',
    name: 'The Guardian',
    color1: '#1a2a3a',
    color2: '#050810',
    accent: '#4488cc',
    glowColor: '#3366aa',
    buildParts: () => {
      const parts = [];
      // Stone texture noise
      const stoneNoise = noisePattern(120, { x: -80, y: -100, w: 160, h: 200 }, ['#5a6a7a', '#4a5a6a', '#6a7a8a'], [0.05, 0.15]);
      // Legs - heavy stone pillars
      parts.push('<rect x="-55" y="35" width="35" height="70" rx="4" fill="#556677" opacity="0.9" />');
      parts.push('<rect x="20" y="35" width="35" height="70" rx="4" fill="#556677" opacity="0.9" />');
      // Leg armor plates
      parts.push('<rect x="-52" y="40" width="8" height="60" fill="#667788" opacity="0.5" />');
      parts.push('<rect x="47" y="40" width="8" height="60" fill="#667788" opacity="0.5" />');
      // Torso - massive stone slab
      parts.push('<path d="M -70 -55 L -60 45 L 60 45 L 70 -55 Z" fill="#667788" opacity="0.95" />');
      parts.push('<path d="M -60 -45 L -52 38 L 52 38 L 60 -45 Z" fill="#556677" opacity="0.7" />');
      // Stone texture on torso
      parts.push(...stoneNoise);
      // Gem core - glowing blue center (key visual element)
      parts.push('<circle cx="0" cy="-8" r="35" fill="#223344" opacity="0.9" />');
      parts.push('<circle cx="0" cy="-8" r="28" fill="#2266bb" opacity="0.7" />');
      parts.push('<circle cx="0" cy="-8" r="20" fill="#4499dd" opacity="0.8" />');
      parts.push('<circle cx="0" cy="-8" r="12" fill="#66ccff" opacity="0.9" />');
      parts.push('<circle cx="-4" cy="-12" r="5" fill="#aaddff" opacity="0.7" />');
      // Gem glow aura
      parts.push('<circle cx="0" cy="-8" r="45" fill="#4488cc" opacity="0.15" />');
      parts.push('<circle cx="0" cy="-8" r="55" fill="#4488cc" opacity="0.08" />');
      // Head - angular stone block
      parts.push('<path d="M -28 -100 L -38 -55 L 38 -55 L 28 -100 Z" fill="#778899" opacity="0.95" />');
      parts.push('<rect x="-20" y="-90" width="40" height="22" rx="2" fill="#445566" opacity="0.8" />');
      // Glowing eyes - slits
      parts.push('<rect x="-16" y="-82" width="12" height="5" rx="1" fill="#44aaff" opacity="0.95" />');
      parts.push('<rect x="4" y="-82" width="12" height="5" rx="1" fill="#44aaff" opacity="0.95" />');
      // Eye glow
      parts.push('<ellipse cx="-10" cy="-80" rx="10" ry="6" fill="#4488cc" opacity="0.2" />');
      parts.push('<ellipse cx="10" cy="-80" rx="10" ry="6" fill="#4488cc" opacity="0.2" />');
      // Shield arms - massive defensive mode
      parts.push('<path d="M -70 -50 L -115 -35 L -110 25 L -65 35" fill="#778899" opacity="0.85" />');
      parts.push('<path d="M 70 -50 L 115 -35 L 110 25 L 65 35" fill="#778899" opacity="0.85" />');
      // Shield rune markings
      for (let i = 0; i < 3; i++) {
        const y = -20 + i * 20;
        parts.push(`<circle cx="-90" cy="${y}" r="5" stroke="#4488cc" stroke-width="1.5" fill="none" opacity="0.4" />`);
        parts.push(`<circle cx="90" cy="${y}" r="5" stroke="#4488cc" stroke-width="1.5" fill="none" opacity="0.4" />`);
      }
      // Stone crack details
      parts.push('<path d="M -30 -30 L -15 -20 L -25 0" stroke="#445566" stroke-width="1" fill="none" opacity="0.3" />');
      parts.push('<path d="M 25 10 L 40 20 L 35 40" stroke="#445566" stroke-width="1" fill="none" opacity="0.3" />');
      return parts;
    }
  },
  {
    id: 'hexaghost',
    name: 'Hexaghost',
    color1: '#2a1a3a',
    color2: '#080510',
    accent: '#aa66ff',
    glowColor: '#8844dd',
    buildParts: () => {
      const parts = [];
      // Ethereal background glow
      parts.push('<circle cx="0" cy="0" r="100" fill="#8844dd" opacity="0.06" />');
      // Central spectral core
      parts.push('<circle cx="0" cy="0" r="50" fill="#3a1a5a" opacity="0.7" />');
      parts.push('<circle cx="0" cy="0" r="40" fill="#4a2a6a" opacity="0.6" />');
      parts.push('<circle cx="0" cy="0" r="30" fill="#5a3a7a" opacity="0.5" />');
      // Skull face in core
      parts.push('<ellipse cx="0" cy="-5" rx="24" ry="20" fill="#2a1040" opacity="0.8" />');
      parts.push('<circle cx="-10" cy="-10" r="8" fill="#aa66ff" opacity="0.6" />');
      parts.push('<circle cx="10" cy="-10" r="8" fill="#aa66ff" opacity="0.6" />');
      parts.push('<circle cx="-10" cy="-10" r="4" fill="#ffaaff" opacity="0.4" />');
      parts.push('<circle cx="10" cy="-10" r="4" fill="#ffaaff" opacity="0.4" />');
      parts.push('<path d="M -5 8 L 0 15 L 5 8" stroke="#aa66ff" stroke-width="2" fill="none" opacity="0.5" />');
      // Core glow pulsing
      parts.push('<circle cx="0" cy="0" r="60" fill="#aa66ff" opacity="0.08" />');
      // Six orbiting flames in hexagonal pattern
      const flamePositions = [
        { x: 0, y: -95, angle: 0 },
        { x: 82, y: -47, angle: 60 },
        { x: 82, y: 47, angle: 120 },
        { x: 0, y: 95, angle: 180 },
        { x: -82, y: 47, angle: 240 },
        { x: -82, y: -47, angle: 300 }
      ];
      flamePositions.forEach((pos, i) => {
        // Outer flame
        parts.push(`<path d="M ${pos.x} ${pos.y - 10} Q ${pos.x - 15} ${pos.y - 30} ${pos.x} ${pos.y - 45} Q ${pos.x + 15} ${pos.y - 30} ${pos.x} ${pos.y - 10}" fill="#aa66ff" opacity="0.75" />`);
        // Inner flame
        parts.push(`<path d="M ${pos.x} ${pos.y - 12} Q ${pos.x - 8} ${pos.y - 26} ${pos.x} ${pos.y - 38} Q ${pos.x + 8} ${pos.y - 26} ${pos.x} ${pos.y - 12}" fill="#cc88ff" opacity="0.65" />`);
        // Core glow
        parts.push(`<circle cx="${pos.x}" cy="${pos.y - 15}" r="12" fill="#8844dd" opacity="0.5" />`);
        parts.push(`<circle cx="${pos.x}" cy="${pos.y - 15}" r="6" fill="#ddaaff" opacity="0.4" />`);
        // Flame particles
        parts.push(`<circle cx="${pos.x + (Math.random()-0.5)*20}" cy="${pos.y - 50 - Math.random()*15}" r="2" fill="#cc88ff" opacity="0.4" />`);
      });
      // Connecting energy arcs between flames
      for (let i = 0; i < 6; i++) {
        const curr = flamePositions[i];
        const next = flamePositions[(i + 1) % 6];
        const midX = (curr.x + next.x) / 2;
        const midY = (curr.y + next.y) / 2;
        const pullX = midX * 0.7;
        const pullY = midY * 0.7;
        parts.push(`<path d="M ${curr.x} ${curr.y - 15} Q ${pullX} ${pullY} ${next.x} ${next.y - 15}" stroke="#8844dd" stroke-width="2" fill="none" opacity="0.25" />`);
      }
      // Ethereal particles scattered around
      parts.push(...noisePattern(30, { x: -110, y: -110, w: 220, h: 220 }, ['#cc88ff', '#aa66ff', '#ddaaff'], [0.15, 0.35]));
      return parts;
    }
  },
  {
    id: 'gremlinNob',
    name: 'Gremlin Nob',
    color1: '#3a1a1a',
    color2: '#100505',
    accent: '#dd4422',
    glowColor: '#aa3318',
    buildParts: () => {
      const parts = [];
      // Rage aura
      parts.push('<circle cx="0" cy="-20" r="100" fill="#dd4422" opacity="0.06" />');
      // Powerful legs in aggressive stance
      parts.push('<path d="M -40 40 L -52 100 L -28 100 L -22 45 Z" fill="#7a5a4a" opacity="0.9" />');
      parts.push('<path d="M 22 45 L 28 100 L 52 100 L 40 40 Z" fill="#7a5a4a" opacity="0.9" />');
      // Massive torso - hulking, hunched
      parts.push('<path d="M -60 -45 L -50 50 L 50 50 L 60 -35 Z" fill="#9a6a4a" opacity="0.95" />');
      // Chest muscle definition
      parts.push('<path d="M -25 -30 Q 0 -20 25 -30" stroke="#aa7a5a" stroke-width="3" fill="none" opacity="0.5" />');
      parts.push('<path d="M -20 -10 Q 0 0 20 -10" stroke="#aa7a5a" stroke-width="2" fill="none" opacity="0.4" />');
      // Skin texture
      parts.push(...noisePattern(50, { x: -55, y: -40, w: 110, h: 90 }, ['#ba7a5a', '#8a5a3a'], [0.1, 0.2]));
      // Left arm reaching forward
      parts.push('<path d="M -60 -35 Q -90 -25 -100 5" stroke="#9a6a4a" stroke-width="26" fill="none" stroke-linecap="round" />');
      parts.push('<circle cx="-102" cy="10" r="16" fill="#9a6a4a" />');
      // Clawed fingers
      parts.push('<path d="M -115 0 L -125 -10" stroke="#8a5a3a" stroke-width="4" stroke-linecap="round" />');
      parts.push('<path d="M -118 10 L -130 8" stroke="#8a5a3a" stroke-width="4" stroke-linecap="round" />');
      parts.push('<path d="M -115 20 L -125 28" stroke="#8a5a3a" stroke-width="4" stroke-linecap="round" />');
      // Right arm raised with massive club
      parts.push('<path d="M 60 -35 Q 82 -70 70 -100" stroke="#9a6a4a" stroke-width="26" fill="none" stroke-linecap="round" />');
      parts.push('<circle cx="68" cy="-105" r="16" fill="#9a6a4a" />');
      // Massive spiked club
      parts.push('<rect x="58" y="-160" width="20" height="80" rx="4" fill="#5a4030" opacity="0.95" transform="rotate(15, 68, -120)" />');
      parts.push('<ellipse cx="68" cy="-165" rx="28" ry="18" fill="#4a3525" opacity="0.95" transform="rotate(15, 68, -165)" />');
      // Club spikes
      parts.push('<circle cx="48" cy="-170" r="6" fill="#3a2a1a" />');
      parts.push('<circle cx="88" cy="-165" r="6" fill="#3a2a1a" />');
      parts.push('<circle cx="68" cy="-182" r="7" fill="#3a2a1a" />');
      // Head - small relative to body (gremlin proportions)
      parts.push('<ellipse cx="0" cy="-70" rx="30" ry="26" fill="#9a6a4a" />');
      // Furious brow ridge
      parts.push('<path d="M -22 -80 L -8 -86 L 8 -86 L 22 -80" stroke="#7a4a30" stroke-width="6" fill="none" stroke-linecap="round" />');
      // Glowing rage-filled eyes
      parts.push('<ellipse cx="-12" cy="-72" rx="7" ry="5" fill="#ff4422" opacity="0.95" />');
      parts.push('<ellipse cx="12" cy="-72" rx="7" ry="5" fill="#ff4422" opacity="0.95" />');
      parts.push('<circle cx="-12" cy="-72" r="3" fill="#990000" />');
      parts.push('<circle cx="12" cy="-72" r="3" fill="#990000" />');
      // Snarling mouth with teeth
      parts.push('<path d="M -15 -55 Q 0 -48 15 -55" stroke="#5a3020" stroke-width="3" fill="#3a1a0a" opacity="0.9" />');
      parts.push('<path d="M -10 -55 L -8 -50" stroke="#ddccaa" stroke-width="2" />');
      parts.push('<path d="M 0 -54 L 0 -48" stroke="#ddccaa" stroke-width="2" />');
      parts.push('<path d="M 10 -55 L 8 -50" stroke="#ddccaa" stroke-width="2" />');
      // Pointed ears
      parts.push('<path d="M -28 -75 L -45 -90 L -25 -68" fill="#9a6a4a" />');
      parts.push('<path d="M 28 -75 L 45 -90 L 25 -68" fill="#9a6a4a" />');
      return parts;
    }
  },
  {
    id: 'lagavulin',
    name: 'Lagavulin',
    color1: '#1a1a22',
    color2: '#08080c',
    accent: '#4466aa',
    glowColor: '#335588',
    buildParts: () => {
      const parts = [];
      // Dormant blue mist beneath
      parts.push('<ellipse cx="0" cy="70" rx="80" ry="20" fill="#335588" opacity="0.12" />');
      // Body base - heavy dark iron armor, hunched sleeping pose
      parts.push('<path d="M -65 -25 L -60 65 L 60 65 L 65 -25 Z" fill="#3a3a44" opacity="0.95" />');
      parts.push('<path d="M -55 -20 L -52 55 L 52 55 L 55 -20 Z" fill="#2a2a33" opacity="0.8" />');
      // Armor plate layers
      parts.push('<path d="M -45 -5 L -42 45 L 42 45 L 45 -5 Z" fill="#333340" opacity="0.6" />');
      // Iron texture
      parts.push(...noisePattern(80, { x: -60, y: -25, w: 120, h: 90 }, ['#4a4a55', '#3a3a44', '#5a5a66'], [0.08, 0.18]));
      // Massive shoulder pauldrons
      parts.push('<ellipse cx="-72" cy="-30" rx="35" ry="26" fill="#4a4a55" opacity="0.9" />');
      parts.push('<ellipse cx="72" cy="-30" rx="35" ry="26" fill="#4a4a55" opacity="0.9" />');
      // Pauldron edge spikes
      parts.push('<path d="M -95 -25 L -100 -45 L -85 -30" fill="#4a4a55" />');
      parts.push('<path d="M 95 -25 L 100 -45 L 85 -30" fill="#4a4a55" />');
      // Heavy helmet
      parts.push('<path d="M -35 -90 L -45 -35 L 45 -35 L 35 -90 Z" fill="#4a4a55" opacity="0.95" />');
      // Helmet dome
      parts.push('<path d="M -35 -90 Q 0 -120 35 -90" fill="#555566" opacity="0.9" />');
      // Helmet visor slit - the iconic feature
      parts.push('<rect x="-26" y="-68" width="52" height="10" rx="2" fill="#111118" opacity="0.95" />');
      // Glowing eyes behind visor (sleeping but still visible)
      parts.push('<ellipse cx="-12" cy="-63" rx="8" ry="4" fill="#4488ff" opacity="0.7" />');
      parts.push('<ellipse cx="12" cy="-63" rx="8" ry="4" fill="#4488ff" opacity="0.7" />');
      // Eye glow bleeding through
      parts.push('<ellipse cx="-12" cy="-63" rx="12" ry="6" fill="#4466aa" opacity="0.2" />');
      parts.push('<ellipse cx="12" cy="-63" rx="12" ry="6" fill="#4466aa" opacity="0.2" />');
      // Arms resting on weapon (sleeping pose)
      parts.push('<path d="M -65 -20 Q -78 15 -72 40" stroke="#3a3a44" stroke-width="24" fill="none" stroke-linecap="round" />');
      parts.push('<path d="M 65 -20 Q 78 15 72 40" stroke="#3a3a44" stroke-width="24" fill="none" stroke-linecap="round" />');
      // Gauntlets
      parts.push('<ellipse cx="-72" cy="45" rx="14" ry="12" fill="#4a4a55" />');
      parts.push('<ellipse cx="72" cy="45" rx="14" ry="12" fill="#4a4a55" />');
      // Greatsword resting across lap
      parts.push('<rect x="-90" y="35" width="180" height="8" rx="2" fill="#5a5a66" opacity="0.85" />');
      parts.push('<path d="M -95 39 L -110 32 L -110 46 Z" fill="#5a5a66" opacity="0.85" />');
      // Cross-guard
      parts.push('<rect x="-12" y="28" width="24" height="22" rx="3" fill="#4a4a55" opacity="0.9" />');
      // Iron rivets on armor
      for (let i = 0; i < 4; i++) {
        const x = -40 + i * 26;
        parts.push(`<circle cx="${x}" cy="-10" r="3" fill="#5a5a66" opacity="0.6" />`);
        parts.push(`<circle cx="${x}" cy="20" r="3" fill="#5a5a66" opacity="0.6" />`);
      }
      // Chain mail hint under armor
      for (let y = 5; y < 35; y += 8) {
        parts.push(`<path d="M -28 ${y} Q -22 ${y+3} -16 ${y} Q -10 ${y+3} -4 ${y} Q 2 ${y+3} 8 ${y} Q 14 ${y+3} 20 ${y} Q 26 ${y+3} 28 ${y}" stroke="#4a4a55" stroke-width="1" fill="none" opacity="0.25" />`);
      }
      // Sleeping energy particles
      parts.push('<circle cx="-25" cy="55" r="2" fill="#4488ff" opacity="0.15" />');
      parts.push('<circle cx="30" cy="60" r="1.5" fill="#4488ff" opacity="0.12" />');
      parts.push('<circle cx="0" cy="65" r="2" fill="#4488ff" opacity="0.1" />');
      return parts;
    }
  },
  {
    id: 'cultist',
    name: 'Cultist',
    color1: '#2a1a2a',
    color2: '#100810',
    accent: '#cc4466',
    glowColor: '#aa3355',
    buildParts: () => {
      const parts = [];
      // Dark ritual aura
      parts.push('<circle cx="0" cy="0" r="90" fill="#aa3355" opacity="0.05" />');
      // Tattered robes
      parts.push('<path d="M -35 -30 L -50 95 L 50 95 L 35 -30 Z" fill="#3a2a3a" opacity="0.9" />');
      // Robe tatter details at bottom
      parts.push('<path d="M -50 95 L -55 105 L -40 95" fill="#3a2a3a" opacity="0.7" />');
      parts.push('<path d="M -20 95 L -25 108 L -10 95" fill="#3a2a3a" opacity="0.7" />');
      parts.push('<path d="M 15 95 L 18 105 L 30 95" fill="#3a2a3a" opacity="0.7" />');
      parts.push('<path d="M 40 95 L 50 108 L 55 95" fill="#3a2a3a" opacity="0.7" />');
      // Robe folds
      parts.push('<path d="M -15 -10 L -22 95" stroke="#4a3a4a" stroke-width="2" opacity="0.4" />');
      parts.push('<path d="M 15 -10 L 22 95" stroke="#4a3a4a" stroke-width="2" opacity="0.4" />');
      parts.push('<path d="M 0 0 L 0 95" stroke="#4a3a4a" stroke-width="1.5" opacity="0.3" />');
      // Hood - deep and shadowy
      parts.push('<path d="M -40 -35 Q -45 -100 0 -110 Q 45 -100 40 -35 Z" fill="#3a2a3a" opacity="0.95" />');
      parts.push('<path d="M -28 -40 Q -25 -85 0 -90 Q 25 -85 28 -40 Z" fill="#1a0a1a" opacity="0.9" />');
      // Glowing eyes within hood
      parts.push('<circle cx="-10" cy="-65" r="5" fill="#cc4466" opacity="0.85" />');
      parts.push('<circle cx="10" cy="-65" r="5" fill="#cc4466" opacity="0.85" />');
      parts.push('<circle cx="-10" cy="-65" r="2.5" fill="#ff88aa" opacity="0.6" />');
      parts.push('<circle cx="10" cy="-65" r="2.5" fill="#ff88aa" opacity="0.6" />');
      // Eye glow
      parts.push('<circle cx="-10" cy="-65" r="8" fill="#cc4466" opacity="0.15" />');
      parts.push('<circle cx="10" cy="-65" r="8" fill="#cc4466" opacity="0.15" />');
      // Raised arms (for "CAW!" battle cry)
      parts.push('<path d="M -35 -20 Q -60 -50 -55 -80" stroke="#3a2a3a" stroke-width="12" fill="none" stroke-linecap="round" />');
      parts.push('<path d="M 35 -20 Q 60 -50 55 -80" stroke="#3a2a3a" stroke-width="12" fill="none" stroke-linecap="round" />');
      // Claw-like hands
      parts.push('<circle cx="-55" cy="-82" r="8" fill="#5a4a4a" />');
      parts.push('<circle cx="55" cy="-82" r="8" fill="#5a4a4a" />');
      parts.push('<path d="M -60 -90 L -65 -100" stroke="#5a4a4a" stroke-width="3" stroke-linecap="round" />');
      parts.push('<path d="M -55 -92 L -55 -102" stroke="#5a4a4a" stroke-width="3" stroke-linecap="round" />');
      parts.push('<path d="M -50 -90 L -45 -100" stroke="#5a4a4a" stroke-width="3" stroke-linecap="round" />');
      parts.push('<path d="M 60 -90 L 65 -100" stroke="#5a4a4a" stroke-width="3" stroke-linecap="round" />');
      parts.push('<path d="M 55 -92 L 55 -102" stroke="#5a4a4a" stroke-width="3" stroke-linecap="round" />');
      parts.push('<path d="M 50 -90 L 45 -100" stroke="#5a4a4a" stroke-width="3" stroke-linecap="round" />');
      // Ritual symbol on chest
      parts.push('<circle cx="0" cy="10" r="12" stroke="#cc4466" stroke-width="2" fill="none" opacity="0.4" />');
      parts.push('<path d="M 0 -2 L 0 22" stroke="#cc4466" stroke-width="1.5" opacity="0.3" />');
      parts.push('<path d="M -10 10 L 10 10" stroke="#cc4466" stroke-width="1.5" opacity="0.3" />');
      return parts;
    }
  },
  {
    id: 'jawWorm',
    name: 'Jaw Worm',
    color1: '#4a3a2a',
    color2: '#1a1008',
    accent: '#cc8844',
    glowColor: '#aa6633',
    buildParts: () => {
      const parts = [];
      // Segmented worm body - curled
      const segments = [
        { x: 0, y: 50, rx: 55, ry: 40 },
        { x: -25, y: 20, rx: 50, ry: 38 },
        { x: -40, y: -15, rx: 45, ry: 35 },
        { x: -35, y: -50, rx: 40, ry: 32 },
        { x: -15, y: -80, rx: 35, ry: 28 }
      ];
      // Body segments with depth
      segments.forEach((seg, i) => {
        const shade = 0.95 - i * 0.08;
        parts.push(`<ellipse cx="${seg.x}" cy="${seg.y}" rx="${seg.rx}" ry="${seg.ry}" fill="#7a5a3a" opacity="${shade}" />`);
        parts.push(`<ellipse cx="${seg.x + 5}" cy="${seg.y - 5}" rx="${seg.rx * 0.85}" ry="${seg.ry * 0.85}" fill="#8a6a4a" opacity="${shade * 0.6}" />`);
      });
      // Segment lines
      parts.push('<path d="M -60 35 Q -30 30 0 35" stroke="#5a4020" stroke-width="2" opacity="0.3" />');
      parts.push('<path d="M -70 5 Q -40 0 -10 5" stroke="#5a4020" stroke-width="2" opacity="0.3" />');
      parts.push('<path d="M -70 -30 Q -45 -35 -20 -30" stroke="#5a4020" stroke-width="2" opacity="0.3" />');
      // Skin texture
      parts.push(...noisePattern(60, { x: -80, y: -90, w: 120, h: 160 }, ['#9a7a5a', '#6a5030'], [0.1, 0.2]));
      // Head - massive jaws
      parts.push('<ellipse cx="10" cy="-95" rx="45" ry="35" fill="#8a6a4a" />');
      // Upper jaw
      parts.push('<path d="M -30 -100 Q 10 -130 50 -100 L 40 -90 Q 10 -115 -20 -90 Z" fill="#6a5030" opacity="0.9" />');
      // Lower jaw - open, aggressive
      parts.push('<path d="M -25 -90 Q 10 -60 45 -90 L 35 -95 Q 10 -75 -15 -95 Z" fill="#6a5030" opacity="0.9" />');
      // Teeth - multiple rows of jagged teeth
      for (let i = 0; i < 7; i++) {
        const x = -20 + i * 8;
        const h = 8 + Math.random() * 6;
        parts.push(`<path d="M ${x} -100 L ${x + 3} ${-100 - h} L ${x + 6} -100" fill="#eeeecc" opacity="0.9" />`);
        parts.push(`<path d="M ${x} -90 L ${x + 3} ${-90 + h} L ${x + 6} -90" fill="#eeeecc" opacity="0.9" />`);
      }
      // Small beady eyes
      parts.push('<circle cx="-8" cy="-105" r="6" fill="#1a1008" />');
      parts.push('<circle cx="28" cy="-105" r="6" fill="#1a1008" />');
      parts.push('<circle cx="-8" cy="-105" r="3" fill="#cc8844" opacity="0.8" />');
      parts.push('<circle cx="28" cy="-105" r="3" fill="#cc8844" opacity="0.8" />');
      // Tail end curling up
      parts.push('<path d="M 40 60 Q 70 70 80 50 Q 90 30 85 10" stroke="#7a5a3a" stroke-width="20" fill="none" stroke-linecap="round" />');
      parts.push('<path d="M 85 10 Q 82 -5 90 -15" stroke="#7a5a3a" stroke-width="14" fill="none" stroke-linecap="round" />');
      return parts;
    }
  },
  {
    id: 'automaton',
    name: 'Bronze Automaton',
    color1: '#5a4422',
    color2: '#1a1008',
    accent: '#ffaa44',
    glowColor: '#dd8822',
    buildParts: () => {
      const parts = [];
      // Steam/heat glow
      parts.push('<circle cx="0" cy="-20" r="100" fill="#dd8822" opacity="0.05" />');
      // Heavy bronze legs
      parts.push('<rect x="-50" y="35" width="28" height="70" rx="4" fill="#8a6a3a" opacity="0.9" />');
      parts.push('<rect x="22" y="35" width="28" height="70" rx="4" fill="#8a6a3a" opacity="0.9" />');
      // Leg joints - riveted
      parts.push('<circle cx="-36" cy="45" r="8" fill="#6a5030" />');
      parts.push('<circle cx="36" cy="45" r="8" fill="#6a5030" />');
      parts.push('<circle cx="-36" cy="45" r="4" fill="#aa8855" />');
      parts.push('<circle cx="36" cy="45" r="4" fill="#aa8855" />');
      // Massive torso - barrel-shaped bronze
      parts.push('<path d="M -55 -50 L -50 45 L 50 45 L 55 -50 Z" fill="#9a7a4a" opacity="0.95" />');
      parts.push('<ellipse cx="0" cy="-50" rx="55" ry="20" fill="#aa8a5a" opacity="0.9" />');
      parts.push('<ellipse cx="0" cy="45" rx="50" ry="18" fill="#8a6a3a" opacity="0.8" />');
      // Bronze plate texture
      parts.push(...noisePattern(60, { x: -50, y: -45, w: 100, h: 90 }, ['#ba9a6a', '#7a5a30'], [0.1, 0.2]));
      // Glowing core (heating up for Hyperbeam)
      parts.push('<circle cx="0" cy="-5" r="22" fill="#4a3020" opacity="0.9" />');
      parts.push('<circle cx="0" cy="-5" r="16" fill="#dd8822" opacity="0.7" />');
      parts.push('<circle cx="0" cy="-5" r="10" fill="#ffcc66" opacity="0.8" />');
      parts.push('<circle cx="-3" cy="-8" r="4" fill="#ffeebb" opacity="0.6" />');
      // Core glow
      parts.push('<circle cx="0" cy="-5" r="30" fill="#ffaa44" opacity="0.12" />');
      // Massive arms
      parts.push('<path d="M -55 -40 Q -85 -30 -95 -5" stroke="#9a7a4a" stroke-width="26" fill="none" stroke-linecap="round" />');
      parts.push('<path d="M 55 -40 Q 85 -30 95 -5" stroke="#9a7a4a" stroke-width="26" fill="none" stroke-linecap="round" />');
      // Fists - bronze hammers
      parts.push('<ellipse cx="-100" cy="0" rx="18" ry="22" fill="#8a6a3a" />');
      parts.push('<ellipse cx="100" cy="0" rx="18" ry="22" fill="#8a6a3a" />');
      // Head - domed bronze
      parts.push('<ellipse cx="0" cy="-75" rx="35" ry="30" fill="#aa8a5a" />');
      parts.push('<ellipse cx="0" cy="-80" rx="30" ry="20" fill="#ba9a6a" opacity="0.6" />');
      // Glowing eye slits
      parts.push('<rect x="-20" y="-78" width="12" height="6" rx="1" fill="#ffcc44" opacity="0.9" />');
      parts.push('<rect x="8" y="-78" width="12" height="6" rx="1" fill="#ffcc44" opacity="0.9" />');
      // Eye glow
      parts.push('<ellipse cx="-14" cy="-75" rx="10" ry="6" fill="#ffaa44" opacity="0.2" />');
      parts.push('<ellipse cx="14" cy="-75" rx="10" ry="6" fill="#ffaa44" opacity="0.2" />');
      // Bronze rivets
      for (let i = 0; i < 6; i++) {
        const x = -40 + i * 16;
        parts.push(`<circle cx="${x}" cy="-35" r="4" fill="#6a5030" opacity="0.7" />`);
        parts.push(`<circle cx="${x}" cy="-35" r="2" fill="#ccaa77" opacity="0.5" />`);
      }
      // Steam vents on shoulders
      parts.push('<ellipse cx="-55" cy="-45" rx="8" ry="5" fill="#3a2a1a" />');
      parts.push('<ellipse cx="55" cy="-45" rx="8" ry="5" fill="#3a2a1a" />');
      // Steam wisps
      parts.push('<path d="M -55 -50 Q -60 -65 -55 -80" stroke="#aaaaaa" stroke-width="3" fill="none" opacity="0.2" />');
      parts.push('<path d="M 55 -50 Q 60 -65 55 -80" stroke="#aaaaaa" stroke-width="3" fill="none" opacity="0.2" />');
      return parts;
    }
  },
  {
    id: 'louse_red',
    name: 'Red Louse',
    color1: '#4a1a1a',
    color2: '#1a0808',
    accent: '#dd4444',
    glowColor: '#aa3333',
    buildParts: () => {
      const parts = [];
      // Body - tick/louse shape, red variant
      parts.push('<ellipse cx="0" cy="0" rx="65" ry="50" fill="#6a2a2a" opacity="0.95" />');
      parts.push('<ellipse cx="5" cy="-10" rx="55" ry="42" fill="#8a3a3a" opacity="0.8" />');
      parts.push('<ellipse cx="10" cy="-18" rx="45" ry="34" fill="#9a4a4a" opacity="0.6" />');
      // Segmented shell pattern
      parts.push('<path d="M -50 -10 Q -30 -35 0 -40 Q 30 -35 50 -10" stroke="#5a2020" stroke-width="2" fill="none" opacity="0.3" />');
      parts.push('<path d="M -55 10 Q -35 -20 0 -25 Q 35 -20 55 10" stroke="#5a2020" stroke-width="2" fill="none" opacity="0.25" />');
      // Shell texture
      parts.push(...noisePattern(40, { x: -55, y: -40, w: 110, h: 80 }, ['#aa5a5a', '#7a3030'], [0.15, 0.3]));
      // Multiple legs - 6 insect legs
      const legAngles = [-140, -160, -180, 0, 20, 40];
      legAngles.forEach((angle, i) => {
        const startX = i < 3 ? -45 : 45;
        const dir = i < 3 ? -1 : 1;
        parts.push(`<path d="M ${startX} 20 Q ${startX + dir*30} 40 ${startX + dir*50} 60" stroke="#5a2020" stroke-width="6" fill="none" stroke-linecap="round" />`);
        parts.push(`<path d="M ${startX + dir*50} 60 L ${startX + dir*60} 75" stroke="#5a2020" stroke-width="4" fill="none" stroke-linecap="round" />`);
      });
      // Head/front
      parts.push('<ellipse cx="-50" cy="5" rx="25" ry="20" fill="#7a3030" />');
      // Mandibles
      parts.push('<path d="M -70 0 Q -85 -10 -80 -25" stroke="#5a2020" stroke-width="5" fill="none" stroke-linecap="round" />');
      parts.push('<path d="M -70 10 Q -85 20 -80 35" stroke="#5a2020" stroke-width="5" fill="none" stroke-linecap="round" />');
      // Eyes - multiple small compound eyes
      parts.push('<circle cx="-55" cy="-8" r="6" fill="#1a0808" />');
      parts.push('<circle cx="-55" cy="8" r="6" fill="#1a0808" />');
      parts.push('<circle cx="-55" cy="-8" r="3" fill="#dd4444" opacity="0.8" />');
      parts.push('<circle cx="-55" cy="8" r="3" fill="#dd4444" opacity="0.8" />');
      // Glowing curl-up defense indicator (they curl up)
      parts.push('<path d="M 50 0 Q 65 15 55 30" stroke="#9a4a4a" stroke-width="8" fill="none" stroke-linecap="round" opacity="0.6" />');
      return parts;
    }
  }
];

// Pure Water relic (Watcher starter - gives Miracle card)
const RELICS = [
  {
    id: 'pure_water',
    name: 'Pure Water',
    color1: '#1a3a5a',
    color2: '#081828',
    accent: '#66aadd',
    glowColor: '#4488bb',
    buildParts: () => {
      const parts = [];
      // Water droplet shape
      parts.push('<path d="M 0 -45 Q -35 0 -30 25 Q -25 50 0 55 Q 25 50 30 25 Q 35 0 0 -45" fill="#3388cc" opacity="0.9" />');
      parts.push('<path d="M 0 -40 Q -28 -5 -24 22 Q -20 45 0 48 Q 20 45 24 22 Q 28 -5 0 -40" fill="#55aadd" opacity="0.7" />');
      parts.push('<path d="M 0 -32 Q -18 -2 -15 18 Q -12 35 0 38 Q 12 35 15 18 Q 18 -2 0 -32" fill="#77ccee" opacity="0.5" />');
      // Highlight
      parts.push('<ellipse cx="-10" cy="-10" rx="8" ry="12" fill="#aaddff" opacity="0.5" transform="rotate(-15, -10, -10)" />');
      parts.push('<ellipse cx="-8" cy="-15" rx="4" ry="6" fill="#ffffff" opacity="0.4" transform="rotate(-15, -8, -15)" />');
      // Inner glow
      parts.push('<circle cx="0" cy="10" r="20" fill="#66aadd" opacity="0.15" />');
      // Ripple effect at bottom
      parts.push('<ellipse cx="0" cy="50" rx="20" ry="5" fill="#4488bb" opacity="0.2" />');
      parts.push('<ellipse cx="0" cy="55" rx="25" ry="4" fill="#4488bb" opacity="0.1" />');
      return parts;
    }
  }
];

async function generateEnemyArt(sharp) {
  const outDir = path.join(__dirname, '..', 'src', 'assets', 'art', 'enemies');

  console.log('\n=== Generating Enemy Art ===\n');

  for (const enemy of ENEMIES) {
    const parts = enemy.buildParts();
    const svg = `<svg width="${ENEMY_SIZE}" height="${ENEMY_SIZE}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg-${enemy.id}" cx="50%" cy="45%" r="70%">
      <stop offset="0%" stop-color="${enemy.color1}" />
      <stop offset="100%" stop-color="${enemy.color2}" />
    </radialGradient>
    <radialGradient id="glow-${enemy.id}" cx="50%" cy="40%" r="45%">
      <stop offset="0%" stop-color="${enemy.glowColor}" stop-opacity="0.15" />
      <stop offset="100%" stop-color="${enemy.glowColor}" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="vignette" cx="50%" cy="50%" r="50%">
      <stop offset="50%" stop-color="black" stop-opacity="0" />
      <stop offset="100%" stop-color="black" stop-opacity="0.6" />
    </radialGradient>
  </defs>
  <rect width="${ENEMY_SIZE}" height="${ENEMY_SIZE}" fill="url(#bg-${enemy.id})" />
  <rect width="${ENEMY_SIZE}" height="${ENEMY_SIZE}" fill="url(#glow-${enemy.id})" />
  <g transform="translate(256, 280)">
    ${parts.join('\n    ')}
  </g>
  <rect width="${ENEMY_SIZE}" height="${ENEMY_SIZE}" fill="url(#vignette)" />
</svg>`;

    const outPath = path.join(outDir, `${enemy.id}.webp`);
    await sharp(Buffer.from(svg))
      .webp({ quality: 90 })
      .toFile(outPath);

    const stats = fs.statSync(outPath);
    console.log(`  ${enemy.id}.webp (${(stats.size / 1024).toFixed(1)}KB)`);
  }
}

async function generateRelicArt(sharp) {
  const outDir = path.join(__dirname, '..', 'src', 'assets', 'art', 'relics');

  // Ensure directory exists
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  console.log('\n=== Generating Relic Art ===\n');

  for (const relic of RELICS) {
    const parts = relic.buildParts();
    const svg = `<svg width="${RELIC_SIZE}" height="${RELIC_SIZE}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg-${relic.id}" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="${relic.color1}" />
      <stop offset="100%" stop-color="${relic.color2}" />
    </radialGradient>
    <radialGradient id="glow-${relic.id}" cx="50%" cy="45%" r="50%">
      <stop offset="0%" stop-color="${relic.glowColor}" stop-opacity="0.2" />
      <stop offset="100%" stop-color="${relic.glowColor}" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="${RELIC_SIZE}" height="${RELIC_SIZE}" fill="url(#bg-${relic.id})" rx="8" />
  <rect width="${RELIC_SIZE}" height="${RELIC_SIZE}" fill="url(#glow-${relic.id})" rx="8" />
  <g transform="translate(64, 64)">
    ${parts.join('\n    ')}
  </g>
</svg>`;

    const outPath = path.join(outDir, `${relic.id}.webp`);
    await sharp(Buffer.from(svg))
      .webp({ quality: 90 })
      .toFile(outPath);

    const stats = fs.statSync(outPath);
    console.log(`  ${relic.id}.webp (${(stats.size / 1024).toFixed(1)}KB)`);
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('QR-11: PLACEHOLDER ASSET REPLACEMENT');
  console.log('='.repeat(60));
  console.log('\nGenerating improved art for top 10 priority assets...\n');

  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch {
    console.error('ERROR: sharp not installed. Run: npm install');
    process.exit(1);
  }

  await generateEnemyArt(sharp);
  await generateRelicArt(sharp);

  console.log('\n' + '='.repeat(60));
  console.log('DONE - Generated art for 9 enemies + 1 relic');
  console.log('='.repeat(60));
  console.log('\nNext steps:');
  console.log('1. Run: node scripts/generate-sprite-sheets.js --type=enemies');
  console.log('2. Verify assets at runtime by playing the game');
  console.log('3. Run: npm run validate');
}

main().catch(err => { console.error(err); process.exit(1); });
