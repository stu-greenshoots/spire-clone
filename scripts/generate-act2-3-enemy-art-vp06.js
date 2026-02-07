#!/usr/bin/env node

/**
 * VP-06: Act 2/3 Enemy Sprite Replacement
 *
 * Generates high-quality art for 10 Act 2/3 enemies:
 * - Mystic: Hooded healer with glowing hands and healing energy
 * - Shelled Parasite: Armored tick with shell plates
 * - Snecko: Serpentine creature with hypnotic eyes
 * - Spheric Guardian: Crystalline sphere with shield aura
 * - Bronze Orb: Floating mechanical orb (Automaton minion)
 * - Gremlin Minion: Small gremlin (Gremlin Leader minion)
 * - Maw: Massive mouth/jaw creature
 * - Nemesis: Spectral reaper/phantom elite
 * - Spire Growth: Organic/crystalline tower growth
 * - Transient: Fading ghost that vanishes over time
 *
 * Target: >20KB per sprite with detailed layered art
 *
 * Usage: node scripts/generate-act2-3-enemy-art-vp06.js
 * Requires: sharp (devDependency)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SIZE = 768; // Larger canvas for more detail
const NOISE_DENSITY = 400; // High density for rich textures

// Generate noise pattern for organic textures
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

// Generate organic blob with bezier curves
function blobShape(cx, cy, radius, points, irregularity, fill, opacity) {
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

  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < points; i++) {
    const curr = pts[i];
    const next = pts[(i + 1) % points];
    const midX = (curr.x + next.x) / 2;
    const midY = (curr.y + next.y) / 2;
    d += ` Q ${curr.x.toFixed(1)} ${curr.y.toFixed(1)} ${midX.toFixed(1)} ${midY.toFixed(1)}`;
  }
  d += ' Z';
  return `<path d="${d}" fill="${fill}" opacity="${opacity}" />`;
}

// Generate spore/particle effect
function particleCloud(cx, cy, count, radius, color) {
  const parts = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * radius;
    const x = cx + Math.cos(angle) * dist;
    const y = cy + Math.sin(angle) * dist;
    const r = 1 + Math.random() * 3;
    const opacity = 0.2 + Math.random() * 0.5;
    parts.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${color}" opacity="${opacity.toFixed(2)}" />`);
  }
  return parts;
}

// Generate gear/cog shape
function gearShape(cx, cy, innerR, outerR, teeth, fill, opacity) {
  const toothAngle = (Math.PI * 2) / teeth;
  let d = '';

  for (let i = 0; i < teeth; i++) {
    const angle1 = i * toothAngle;
    const angle2 = angle1 + toothAngle * 0.15;
    const angle3 = angle1 + toothAngle * 0.35;
    const angle4 = angle1 + toothAngle * 0.5;
    const angle5 = angle1 + toothAngle * 0.65;
    const angle6 = angle1 + toothAngle * 0.85;

    if (i === 0) {
      d = `M ${cx + Math.cos(angle1) * innerR} ${cy + Math.sin(angle1) * innerR}`;
    }
    d += ` L ${cx + Math.cos(angle2) * innerR} ${cy + Math.sin(angle2) * innerR}`;
    d += ` L ${cx + Math.cos(angle3) * outerR} ${cy + Math.sin(angle3) * outerR}`;
    d += ` L ${cx + Math.cos(angle4) * outerR} ${cy + Math.sin(angle4) * outerR}`;
    d += ` L ${cx + Math.cos(angle5) * outerR} ${cy + Math.sin(angle5) * outerR}`;
    d += ` L ${cx + Math.cos(angle6) * innerR} ${cy + Math.sin(angle6) * innerR}`;
  }
  d += ' Z';

  return `<path d="${d}" fill="${fill}" opacity="${opacity}" />`;
}

// Generate crystalline facets
function crystalFacets(cx, cy, size, facetCount, colors) {
  const parts = [];
  for (let i = 0; i < facetCount; i++) {
    const angle = (i / facetCount) * Math.PI * 2;
    const nextAngle = ((i + 1) / facetCount) * Math.PI * 2;
    const r = size * (0.8 + Math.random() * 0.4);
    const x1 = cx + Math.cos(angle) * r;
    const y1 = cy + Math.sin(angle) * r;
    const x2 = cx + Math.cos(nextAngle) * r * (0.9 + Math.random() * 0.2);
    const y2 = cy + Math.sin(nextAngle) * r * (0.9 + Math.random() * 0.2);
    const color = colors[Math.floor(Math.random() * colors.length)];
    const opacity = 0.4 + Math.random() * 0.4;
    parts.push(`<path d="M ${cx} ${cy} L ${x1} ${y1} L ${x2} ${y2} Z" fill="${color}" opacity="${opacity.toFixed(2)}" />`);
  }
  return parts;
}

const ENEMIES = [
  {
    id: 'mystic',
    name: 'Mystic',
    background: { color1: '#1a2a1a', color2: '#050a05' },
    glowColor: '#44ff88',
    buildParts: () => {
      const parts = [];

      // Ground shadow
      parts.push('<ellipse cx="0" cy="110" rx="55" ry="18" fill="#000" opacity="0.4" />');

      // Flowing robe base
      parts.push('<path d="M -60 108 Q -65 40 -25 -15 L 25 -15 Q 65 40 60 108 Z" fill="#2a4a3a" opacity="0.98" />');
      parts.push('<path d="M -55 105 Q -60 45 -22 -10 L 22 -10 Q 60 45 55 105 Z" fill="#3a5a4a" opacity="0.85" />');

      // Robe folds with green tint
      parts.push('<path d="M -45 100 Q -50 55 -30 15" stroke="#1a3a2a" stroke-width="3" fill="none" opacity="0.5" />');
      parts.push('<path d="M -25 102 Q -30 50 -15 5" stroke="#1a3a2a" stroke-width="2" fill="none" opacity="0.4" />');
      parts.push('<path d="M 45 100 Q 50 55 30 15" stroke="#1a3a2a" stroke-width="3" fill="none" opacity="0.5" />');
      parts.push('<path d="M 25 102 Q 30 50 15 5" stroke="#1a3a2a" stroke-width="2" fill="none" opacity="0.4" />');

      // Robe texture
      parts.push(...noisePattern(NOISE_DENSITY, { x: -65, y: -20, w: 130, h: 130 },
        ['#4a6a5a', '#3a5a4a', '#5a7a6a', '#2a4a3a'], [0.05, 0.15], [1, 4]));

      // Hood
      parts.push(blobShape(0, -38, 42, 10, 0.1, '#2a4a3a', 0.98));
      parts.push(blobShape(0, -40, 37, 8, 0.08, '#3a5a4a', 0.85));

      // Hood shadow (face area)
      parts.push('<ellipse cx="0" cy="-33" rx="30" ry="26" fill="#0a1a0a" opacity="0.95" />');

      // Hood texture
      parts.push(...noisePattern(80, { x: -42, y: -80, w: 84, h: 65 },
        ['#4a6a5a', '#3a5a4a', '#5a7a6a'], [0.06, 0.18], [1, 3]));

      // Glowing eyes in hood - mystical green
      parts.push('<ellipse cx="-12" cy="-38" rx="7" ry="4" fill="#44ff88" opacity="0.9" />');
      parts.push('<ellipse cx="12" cy="-38" rx="7" ry="4" fill="#44ff88" opacity="0.9" />');
      parts.push('<ellipse cx="-12" cy="-38" rx="4" ry="2.5" fill="#88ffbb" opacity="0.8" />');
      parts.push('<ellipse cx="12" cy="-38" rx="4" ry="2.5" fill="#88ffbb" opacity="0.8" />');
      parts.push('<ellipse cx="-12" cy="-38" rx="1.5" ry="1" fill="#ffffff" opacity="0.6" />');
      parts.push('<ellipse cx="12" cy="-38" rx="1.5" ry="1" fill="#ffffff" opacity="0.6" />');
      // Eye glow aura
      parts.push('<ellipse cx="0" cy="-38" rx="40" ry="22" fill="#44ff88" opacity="0.1" />');

      // Arms extended forward in healing pose
      // Left arm
      parts.push('<path d="M -28 5 Q -55 -10 -70 -30 L -60 -38 Q -48 -18 -24 0" fill="#2a4a3a" opacity="0.95" />');
      parts.push('<path d="M -30 3 Q -52 -12 -65 -32" stroke="#3a5a4a" stroke-width="8" fill="none" opacity="0.8" />');
      // Left hand with spread fingers
      parts.push('<ellipse cx="-65" cy="-35" rx="12" ry="10" fill="#5a7a6a" opacity="0.9" />');
      for (let i = 0; i < 5; i++) {
        const angle = -Math.PI * 0.75 + (i / 4) * Math.PI * 0.65;
        const x = -65 + Math.cos(angle) * 10;
        const y = -35 + Math.sin(angle) * 8;
        const tipX = -65 + Math.cos(angle) * 20;
        const tipY = -35 + Math.sin(angle) * 15;
        parts.push(`<path d="M ${x} ${y} Q ${(x + tipX) / 2} ${(y + tipY) / 2 - 3} ${tipX} ${tipY}" stroke="#5a7a6a" stroke-width="3" fill="none" opacity="0.9" />`);
      }

      // Right arm
      parts.push('<path d="M 28 5 Q 55 -10 70 -30 L 60 -38 Q 48 -18 24 0" fill="#2a4a3a" opacity="0.95" />');
      parts.push('<path d="M 30 3 Q 52 -12 65 -32" stroke="#3a5a4a" stroke-width="8" fill="none" opacity="0.8" />');
      // Right hand
      parts.push('<ellipse cx="65" cy="-35" rx="12" ry="10" fill="#5a7a6a" opacity="0.9" />');
      for (let i = 0; i < 5; i++) {
        const angle = Math.PI * 0.1 + (i / 4) * Math.PI * 0.65;
        const x = 65 + Math.cos(angle) * 10;
        const y = -35 + Math.sin(angle) * 8;
        const tipX = 65 + Math.cos(angle) * 20;
        const tipY = -35 + Math.sin(angle) * 15;
        parts.push(`<path d="M ${x} ${y} Q ${(x + tipX) / 2} ${(y + tipY) / 2 - 3} ${tipX} ${tipY}" stroke="#5a7a6a" stroke-width="3" fill="none" opacity="0.9" />`);
      }

      // Healing energy stream between hands
      parts.push('<path d="M -55 -40 Q 0 -60 55 -40" stroke="#44ff88" stroke-width="4" fill="none" opacity="0.6" />');
      parts.push('<path d="M -50 -35 Q 0 -50 50 -35" stroke="#88ffcc" stroke-width="2" fill="none" opacity="0.4" />');

      // Healing energy particles
      parts.push(...particleCloud(0, -45, 30, 40, '#44ff88'));
      parts.push(...particleCloud(-55, -40, 15, 20, '#88ffcc'));
      parts.push(...particleCloud(55, -40, 15, 20, '#88ffcc'));

      // Mystical symbol on robe
      parts.push('<circle cx="0" cy="50" r="15" stroke="#44ff88" stroke-width="2" fill="none" opacity="0.5" />');
      parts.push('<circle cx="0" cy="50" r="10" stroke="#88ffcc" stroke-width="1.5" fill="none" opacity="0.4" />');
      parts.push('<path d="M 0 35 L 0 65 M -15 50 L 15 50" stroke="#44ff88" stroke-width="1.5" fill="none" opacity="0.4" />');

      // Healing aura
      parts.push('<ellipse cx="0" cy="10" rx="85" ry="95" fill="#44ff88" opacity="0.05" />');
      parts.push('<ellipse cx="0" cy="-20" rx="65" ry="75" fill="#88ffcc" opacity="0.04" />');

      return parts;
    }
  },
  {
    id: 'shelledParasite',
    name: 'Shelled Parasite',
    background: { color1: '#2a2a1a', color2: '#0a0a05' },
    glowColor: '#aa8844',
    buildParts: () => {
      const parts = [];

      // Ground shadow
      parts.push('<ellipse cx="0" cy="95" rx="75" ry="22" fill="#000" opacity="0.4" />');

      // Legs - 6 total, armored
      const legPositions = [
        { side: -1, y: 55, angle: -25, length: 50 },
        { side: -1, y: 35, angle: -10, length: 55 },
        { side: -1, y: 15, angle: 10, length: 45 },
        { side: 1, y: 55, angle: 25, length: 50 },
        { side: 1, y: 35, angle: 10, length: 55 },
        { side: 1, y: 15, angle: -10, length: 45 },
      ];

      for (const leg of legPositions) {
        const startX = leg.side * 50;
        const startY = leg.y;
        const midX = startX + leg.side * leg.length * 0.55;
        const midY = startY + 12;
        const endX = startX + leg.side * leg.length;
        const endY = startY + 30;

        // Armored leg segments
        parts.push(`<path d="M ${startX} ${startY} Q ${midX} ${startY - 8} ${midX} ${midY} Q ${midX + leg.side * 8} ${midY + 12} ${endX} ${endY}" stroke="#5a4a3a" stroke-width="9" fill="none" opacity="0.95" />`);
        parts.push(`<path d="M ${startX} ${startY} Q ${midX} ${startY - 8} ${midX} ${midY} Q ${midX + leg.side * 8} ${midY + 12} ${endX} ${endY}" stroke="#6a5a4a" stroke-width="6" fill="none" opacity="0.7" />`);
        // Joint armor
        parts.push(`<circle cx="${midX}" cy="${midY}" r="7" fill="#5a4a3a" opacity="0.9" />`);
        parts.push(`<circle cx="${midX}" cy="${midY}" r="4" fill="#7a6a5a" opacity="0.7" />`);
        // Armored foot
        parts.push(`<ellipse cx="${endX}" cy="${endY}" rx="7" ry="5" fill="#4a3a2a" opacity="0.9" />`);
      }

      // Main shell - armored oval with plates
      parts.push('<ellipse cx="0" cy="30" rx="60" ry="55" fill="#6a5a4a" opacity="0.98" />');
      parts.push('<ellipse cx="-5" cy="25" rx="52" ry="47" fill="#7a6a5a" opacity="0.9" />');

      // Shell plates/segments
      for (let row = 0; row < 4; row++) {
        const y = -15 + row * 22;
        const width = 55 - row * 5;
        parts.push(`<ellipse cx="0" cy="${y}" rx="${width}" ry="10" fill="#5a4a3a" opacity="0.6" />`);
        parts.push(`<ellipse cx="0" cy="${y - 3}" rx="${width - 5}" ry="6" fill="#8a7a6a" opacity="0.3" />`);
      }

      // Shell ridges/spines
      for (let i = 0; i < 6; i++) {
        const x = -30 + i * 12;
        const baseY = -10;
        const spikeH = 12 + Math.random() * 8;
        parts.push(`<path d="M ${x - 3} ${baseY} L ${x} ${baseY - spikeH} L ${x + 3} ${baseY}" fill="#5a4a3a" opacity="0.85" />`);
        parts.push(`<path d="M ${x - 1} ${baseY} L ${x} ${baseY - spikeH + 3}" stroke="#7a6a5a" stroke-width="1" opacity="0.6" />`);
      }

      // Shell texture
      parts.push(...noisePattern(NOISE_DENSITY, { x: -60, y: -30, w: 120, h: 115 },
        ['#8a7a6a', '#7a6a5a', '#9a8a7a', '#6a5a4a'], [0.06, 0.18], [1, 4]));

      // Head section - protruding from shell
      parts.push('<ellipse cx="0" cy="-45" rx="32" ry="25" fill="#6a5a4a" opacity="0.98" />');
      parts.push('<ellipse cx="-3" cy="-48" rx="27" ry="20" fill="#7a6a5a" opacity="0.85" />');

      // Head texture
      parts.push(...noisePattern(70, { x: -32, y: -72, w: 64, h: 50 },
        ['#8a7a6a', '#7a6a5a', '#9a8a7a'], [0.08, 0.2], [1, 3]));

      // Eyes - beady, predatory
      parts.push('<ellipse cx="-15" cy="-50" rx="8" ry="6" fill="#1a1a0a" opacity="0.95" />');
      parts.push('<ellipse cx="15" cy="-50" rx="8" ry="6" fill="#1a1a0a" opacity="0.95" />');
      parts.push('<ellipse cx="-15" cy="-50" rx="5" ry="4" fill="#aa8844" opacity="0.9" />');
      parts.push('<ellipse cx="15" cy="-50" rx="5" ry="4" fill="#aa8844" opacity="0.9" />');
      parts.push('<ellipse cx="-15" cy="-50" rx="2" ry="1.5" fill="#ffcc66" opacity="0.8" />');
      parts.push('<ellipse cx="15" cy="-50" rx="2" ry="1.5" fill="#ffcc66" opacity="0.8" />');
      // Eye glow
      parts.push('<ellipse cx="-15" cy="-50" rx="12" ry="9" fill="#aa8844" opacity="0.12" />');
      parts.push('<ellipse cx="15" cy="-50" rx="12" ry="9" fill="#aa8844" opacity="0.12" />');

      // Mandibles
      parts.push('<path d="M -12 -35 Q -22 -25 -18 -15" stroke="#5a4a3a" stroke-width="5" fill="none" opacity="0.95" />');
      parts.push('<path d="M 12 -35 Q 22 -25 18 -15" stroke="#5a4a3a" stroke-width="5" fill="none" opacity="0.95" />');
      parts.push('<path d="M -18 -15 L -22 -8" stroke="#4a3a2a" stroke-width="3" fill="none" opacity="0.9" />');
      parts.push('<path d="M 18 -15 L 22 -8" stroke="#4a3a2a" stroke-width="3" fill="none" opacity="0.9" />');

      // Antennae
      parts.push('<path d="M -8 -68 Q -18 -85 -12 -95" stroke="#6a5a4a" stroke-width="3" fill="none" opacity="0.9" />');
      parts.push('<path d="M 8 -68 Q 18 -85 12 -95" stroke="#6a5a4a" stroke-width="3" fill="none" opacity="0.9" />');
      parts.push('<circle cx="-12" cy="-95" r="4" fill="#7a6a5a" opacity="0.9" />');
      parts.push('<circle cx="12" cy="-95" r="4" fill="#7a6a5a" opacity="0.9" />');

      // Shell edge plating
      parts.push('<ellipse cx="0" cy="82" rx="58" ry="12" fill="#5a4a3a" opacity="0.8" />');
      parts.push('<ellipse cx="0" cy="80" rx="52" ry="8" fill="#6a5a4a" opacity="0.6" />');

      // Armored aura
      parts.push('<ellipse cx="0" cy="25" rx="80" ry="75" fill="#aa8844" opacity="0.04" />');

      return parts;
    }
  },
  {
    id: 'snecko',
    name: 'Snecko',
    background: { color1: '#2a2a3a', color2: '#0a0a15' },
    glowColor: '#ffff44',
    buildParts: () => {
      const parts = [];

      // Ground shadow
      parts.push('<ellipse cx="0" cy="105" rx="90" ry="25" fill="#000" opacity="0.4" />');

      // Serpentine tail coils - back to front
      const coils = [
        { cx: 70, cy: 70, rx: 25, ry: 20 },
        { cx: 50, cy: 45, rx: 30, ry: 25 },
        { cx: 20, cy: 25, rx: 35, ry: 30 },
        { cx: -20, cy: 10, rx: 40, ry: 35 },
      ];

      for (const coil of coils) {
        // Main coil body
        parts.push(`<ellipse cx="${coil.cx}" cy="${coil.cy}" rx="${coil.rx}" ry="${coil.ry}" fill="#4a5a6a" opacity="0.95" />`);
        parts.push(`<ellipse cx="${coil.cx - 3}" cy="${coil.cy - 4}" rx="${coil.rx * 0.85}" ry="${coil.ry * 0.8}" fill="#5a6a7a" opacity="0.85" />`);
        parts.push(`<ellipse cx="${coil.cx - 5}" cy="${coil.cy - 7}" rx="${coil.rx * 0.6}" ry="${coil.ry * 0.55}" fill="#6a7a8a" opacity="0.5" />`);

        // Scale pattern
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const sx = coil.cx + Math.cos(angle) * coil.rx * 0.7;
          const sy = coil.cy + Math.sin(angle) * coil.ry * 0.7;
          parts.push(`<ellipse cx="${sx}" cy="${sy}" rx="4" ry="3" fill="#3a4a5a" opacity="0.4" />`);
        }
      }

      // Coil textures
      for (const coil of coils) {
        parts.push(...noisePattern(50, {
          x: coil.cx - coil.rx,
          y: coil.cy - coil.ry,
          w: coil.rx * 2,
          h: coil.ry * 2
        }, ['#6a7a8a', '#5a6a7a', '#7a8a9a', '#4a5a6a'], [0.06, 0.16], [1, 3]));
      }

      // Main body/head section
      parts.push('<ellipse cx="-55" cy="-15" rx="55" ry="50" fill="#4a5a6a" opacity="0.98" />');
      parts.push('<ellipse cx="-58" cy="-20" rx="48" ry="43" fill="#5a6a7a" opacity="0.9" />');
      parts.push('<ellipse cx="-60" cy="-25" rx="38" ry="33" fill="#6a7a8a" opacity="0.7" />');

      // Head texture
      parts.push(...noisePattern(NOISE_DENSITY * 0.7, { x: -115, y: -70, w: 120, h: 115 },
        ['#6a7a8a', '#5a6a7a', '#7a8a9a', '#4a5a6a', '#8a9aaa'], [0.05, 0.15], [1, 4]));

      // Hypnotic eyes - large, spiral-patterned
      // Left eye
      parts.push('<ellipse cx="-75" cy="-30" rx="18" ry="16" fill="#1a1a2a" opacity="0.95" />');
      parts.push('<ellipse cx="-75" cy="-30" rx="14" ry="12" fill="#ffff44" opacity="0.9" />');
      parts.push('<ellipse cx="-75" cy="-30" rx="10" ry="8" fill="#ffff88" opacity="0.85" />');
      // Spiral pattern in left eye
      parts.push('<path d="M -75 -30 Q -85 -35 -80 -25 Q -70 -20 -75 -30" stroke="#ff8800" stroke-width="2" fill="none" opacity="0.7" />');
      parts.push('<circle cx="-75" cy="-30" r="4" fill="#000" opacity="0.9" />');

      // Right eye
      parts.push('<ellipse cx="-40" cy="-35" rx="16" ry="14" fill="#1a1a2a" opacity="0.95" />');
      parts.push('<ellipse cx="-40" cy="-35" rx="12" ry="10" fill="#ffff44" opacity="0.9" />');
      parts.push('<ellipse cx="-40" cy="-35" rx="8" ry="6" fill="#ffff88" opacity="0.85" />');
      // Spiral pattern in right eye
      parts.push('<path d="M -40 -35 Q -48 -40 -45 -32 Q -35 -28 -40 -35" stroke="#ff8800" stroke-width="2" fill="none" opacity="0.7" />');
      parts.push('<circle cx="-40" cy="-35" r="3" fill="#000" opacity="0.9" />');

      // Hypnotic eye glow
      parts.push('<ellipse cx="-75" cy="-30" rx="28" ry="24" fill="#ffff44" opacity="0.15" />');
      parts.push('<ellipse cx="-40" cy="-35" rx="24" ry="20" fill="#ffff44" opacity="0.12" />');
      parts.push('<ellipse cx="-55" cy="-32" rx="50" ry="35" fill="#ffff88" opacity="0.08" />');

      // Snout/nose
      parts.push('<ellipse cx="-95" cy="-10" rx="20" ry="15" fill="#4a5a6a" opacity="0.95" />');
      parts.push('<ellipse cx="-97" cy="-12" rx="16" ry="11" fill="#5a6a7a" opacity="0.8" />');
      // Nostrils
      parts.push('<ellipse cx="-105" cy="-12" rx="4" ry="3" fill="#2a3a4a" opacity="0.9" />');
      parts.push('<ellipse cx="-100" cy="-15" rx="3" ry="2" fill="#2a3a4a" opacity="0.9" />');

      // Forked tongue
      parts.push('<path d="M -110 -5 Q -125 -8 -130 -12" stroke="#aa4466" stroke-width="3" fill="none" opacity="0.9" />');
      parts.push('<path d="M -130 -12 L -140 -18" stroke="#aa4466" stroke-width="2" fill="none" opacity="0.9" />');
      parts.push('<path d="M -130 -12 L -138 -5" stroke="#aa4466" stroke-width="2" fill="none" opacity="0.9" />');

      // Confusion/hypnotic aura waves
      for (let i = 0; i < 3; i++) {
        const r = 50 + i * 20;
        const opacity = 0.15 - i * 0.04;
        parts.push(`<ellipse cx="-55" cy="-25" rx="${r}" ry="${r * 0.8}" fill="none" stroke="#ffff44" stroke-width="2" opacity="${opacity}" />`);
      }

      // Tail tip
      parts.push('<path d="M 90 75 Q 105 70 115 80 Q 105 90 90 85" fill="#4a5a6a" opacity="0.9" />');
      parts.push('<path d="M 92 77 Q 102 73 110 80" stroke="#5a6a7a" stroke-width="3" fill="none" opacity="0.7" />');

      // Confusion particles
      parts.push(...particleCloud(-55, -30, 25, 60, '#ffff66'));

      // Hypnotic aura
      parts.push('<ellipse cx="-30" cy="20" rx="110" ry="90" fill="#ffff44" opacity="0.04" />');

      return parts;
    }
  },
  {
    id: 'sphericGuardian',
    name: 'Spheric Guardian',
    background: { color1: '#1a2a3a', color2: '#050a15' },
    glowColor: '#4488ff',
    buildParts: () => {
      const parts = [];

      // Ground shadow
      parts.push('<ellipse cx="0" cy="100" rx="65" ry="20" fill="#000" opacity="0.4" />');

      // Shield aura rings
      for (let i = 3; i >= 0; i--) {
        const r = 75 + i * 15;
        const opacity = 0.08 + i * 0.02;
        parts.push(`<circle cx="0" cy="0" r="${r}" fill="none" stroke="#4488ff" stroke-width="2" opacity="${opacity}" />`);
      }

      // Crystalline faceted sphere - outer layer
      parts.push(...crystalFacets(0, 0, 65, 12, ['#3a5a8a', '#4a6a9a', '#5a7aaa', '#2a4a7a']));

      // Main sphere body
      parts.push('<circle cx="0" cy="0" r="55" fill="#3a5a8a" opacity="0.95" />');
      parts.push('<circle cx="-8" cy="-10" r="48" fill="#4a6a9a" opacity="0.85" />');
      parts.push('<circle cx="-12" cy="-15" r="38" fill="#5a7aaa" opacity="0.7" />');

      // Crystalline surface facets
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const r = 45;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        const nextAngle = ((i + 1) / 8) * Math.PI * 2;
        const x2 = Math.cos(nextAngle) * r;
        const y2 = Math.sin(nextAngle) * r;
        parts.push(`<path d="M 0 0 L ${x} ${y} L ${x2} ${y2} Z" fill="#2a4a7a" opacity="0.3" />`);
      }

      // Surface texture
      parts.push(...noisePattern(NOISE_DENSITY * 0.8, { x: -55, y: -55, w: 110, h: 110 },
        ['#6a8aba', '#5a7aaa', '#7a9aca', '#4a6a9a'], [0.04, 0.12], [1, 3]));

      // Central eye
      parts.push('<circle cx="0" cy="0" r="25" fill="#1a2a4a" opacity="0.95" />');
      parts.push('<circle cx="0" cy="0" r="20" fill="#4488ff" opacity="0.9" />');
      parts.push('<circle cx="0" cy="0" r="15" fill="#66aaff" opacity="0.85" />');
      parts.push('<circle cx="0" cy="0" r="10" fill="#88ccff" opacity="0.8" />');
      parts.push('<circle cx="-3" cy="-3" r="5" fill="#ffffff" opacity="0.6" />');

      // Eye glow
      parts.push('<circle cx="0" cy="0" r="35" fill="#4488ff" opacity="0.2" />');
      parts.push('<circle cx="0" cy="0" r="45" fill="#66aaff" opacity="0.1" />');

      // Floating crystal shards around sphere
      const shards = [
        { x: -70, y: -30, rot: -20 },
        { x: 65, y: -40, rot: 25 },
        { x: -60, y: 45, rot: -35 },
        { x: 70, y: 35, rot: 40 },
        { x: 0, y: -80, rot: 0 },
        { x: 0, y: 85, rot: 180 },
      ];

      for (const shard of shards) {
        parts.push(`<path d="M ${shard.x} ${shard.y - 12} L ${shard.x + 6} ${shard.y} L ${shard.x} ${shard.y + 12} L ${shard.x - 6} ${shard.y} Z" fill="#5a7aaa" opacity="0.8" transform="rotate(${shard.rot}, ${shard.x}, ${shard.y})" />`);
        parts.push(`<path d="M ${shard.x} ${shard.y - 8} L ${shard.x + 3} ${shard.y}" stroke="#8abaff" stroke-width="1" opacity="0.6" transform="rotate(${shard.rot}, ${shard.x}, ${shard.y})" />`);
      }

      // Energy connections to shards
      for (const shard of shards) {
        parts.push(`<line x1="0" y1="0" x2="${shard.x * 0.7}" y2="${shard.y * 0.7}" stroke="#4488ff" stroke-width="1" opacity="0.3" />`);
      }

      // Shield energy particles
      parts.push(...particleCloud(0, 0, 30, 80, '#66aaff'));

      // Defensive aura
      parts.push('<circle cx="0" cy="0" r="90" fill="#4488ff" opacity="0.05" />');
      parts.push('<circle cx="0" cy="0" r="70" fill="#66aaff" opacity="0.04" />');

      return parts;
    }
  },
  {
    id: 'bronzeOrb',
    name: 'Bronze Orb',
    background: { color1: '#2a2a2a', color2: '#0a0a0a' },
    glowColor: '#ff4422',
    buildParts: () => {
      const parts = [];

      // Ground shadow (floating, so smaller)
      parts.push('<ellipse cx="0" cy="70" rx="35" ry="12" fill="#000" opacity="0.3" />');

      // Floating effect - energy beneath
      parts.push('<ellipse cx="0" cy="55" rx="25" ry="8" fill="#ff4422" opacity="0.15" />');
      parts.push('<ellipse cx="0" cy="50" rx="18" ry="5" fill="#ff6644" opacity="0.1" />');

      // Main orb body - bronze mechanical
      parts.push('<circle cx="0" cy="0" r="50" fill="#6a5a4a" opacity="0.98" />');
      parts.push('<circle cx="-6" cy="-8" r="44" fill="#7a6a5a" opacity="0.9" />');
      parts.push('<circle cx="-10" cy="-12" r="36" fill="#8a7a6a" opacity="0.75" />');

      // Metal plating/panels
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const nextAngle = ((i + 1) / 6) * Math.PI * 2;
        const innerR = 25;
        const outerR = 45;

        const x1 = Math.cos(angle) * innerR;
        const y1 = Math.sin(angle) * innerR;
        const x2 = Math.cos(nextAngle) * innerR;
        const y2 = Math.sin(nextAngle) * innerR;
        const x3 = Math.cos(nextAngle) * outerR;
        const y3 = Math.sin(nextAngle) * outerR;
        const x4 = Math.cos(angle) * outerR;
        const y4 = Math.sin(angle) * outerR;

        const color = i % 2 === 0 ? '#5a4a3a' : '#6a5a4a';
        parts.push(`<path d="M ${x1} ${y1} L ${x4} ${y4} A ${outerR} ${outerR} 0 0 1 ${x3} ${y3} L ${x2} ${y2} A ${innerR} ${innerR} 0 0 0 ${x1} ${y1}" fill="${color}" opacity="0.7" />`);
      }

      // Surface texture
      parts.push(...noisePattern(250, { x: -50, y: -50, w: 100, h: 100 },
        ['#8a7a6a', '#7a6a5a', '#9a8a7a', '#6a5a4a'], [0.05, 0.15], [1, 3]));

      // Rivets around edge
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const x = Math.cos(angle) * 42;
        const y = Math.sin(angle) * 42;
        parts.push(`<circle cx="${x}" cy="${y}" r="4" fill="#4a3a2a" />`);
        parts.push(`<circle cx="${x - 1}" cy="${y - 1}" r="1.5" fill="#7a6a5a" opacity="0.6" />`);
      }

      // Central lens/eye
      parts.push('<circle cx="0" cy="0" r="20" fill="#2a1a1a" opacity="0.95" />');
      parts.push('<circle cx="0" cy="0" r="16" fill="#ff4422" opacity="0.9" />');
      parts.push('<circle cx="0" cy="0" r="12" fill="#ff6644" opacity="0.85" />');
      parts.push('<circle cx="0" cy="0" r="8" fill="#ff8866" opacity="0.8" />');
      parts.push('<circle cx="-2" cy="-2" r="4" fill="#ffaa88" opacity="0.6" />');

      // Eye glow
      parts.push('<circle cx="0" cy="0" r="28" fill="#ff4422" opacity="0.2" />');
      parts.push('<circle cx="0" cy="0" r="38" fill="#ff6644" opacity="0.1" />');

      // Scanning beam effect
      parts.push('<path d="M 0 18 L -25 60 L 25 60 Z" fill="#ff4422" opacity="0.15" />');
      parts.push('<path d="M 0 18 L -18 55 L 18 55 Z" fill="#ff6644" opacity="0.1" />');

      // Small gears visible
      parts.push(gearShape(-30, -25, 6, 10, 6, '#4a3a2a', 0.8));
      parts.push(gearShape(28, -28, 5, 8, 5, '#4a3a2a', 0.8));
      parts.push(gearShape(25, 30, 7, 11, 7, '#4a3a2a', 0.8));

      // Energy crackle
      parts.push(...particleCloud(0, 0, 15, 35, '#ff8866'));

      // Power aura
      parts.push('<circle cx="0" cy="0" r="60" fill="#ff4422" opacity="0.05" />');

      return parts;
    }
  },
  {
    id: 'gremlinMinion',
    name: 'Gremlin Minion',
    background: { color1: '#2a2a1a', color2: '#0a0a05' },
    glowColor: '#88aa44',
    buildParts: () => {
      const parts = [];

      // Ground shadow
      parts.push('<ellipse cx="0" cy="85" rx="40" ry="12" fill="#000" opacity="0.4" />');

      // Legs - short, bowed
      // Left leg
      parts.push('<path d="M -20 50 Q -35 65 -30 85 L -18 82 Q -22 65 -15 52" fill="#5a6a4a" opacity="0.95" />');
      parts.push('<path d="M -22 52 Q -32 65 -28 80" stroke="#6a7a5a" stroke-width="5" fill="none" opacity="0.7" />');
      // Left foot
      parts.push('<ellipse cx="-25" cy="85" rx="10" ry="6" fill="#4a5a3a" opacity="0.9" />');

      // Right leg
      parts.push('<path d="M 15 50 Q 30 65 28 85 L 16 82 Q 20 65 12 52" fill="#5a6a4a" opacity="0.95" />');
      parts.push('<path d="M 18 52 Q 28 65 26 80" stroke="#6a7a5a" stroke-width="5" fill="none" opacity="0.7" />');
      // Right foot
      parts.push('<ellipse cx="22" cy="85" rx="10" ry="6" fill="#4a5a3a" opacity="0.9" />');

      // Body - small, hunched
      parts.push(blobShape(0, 25, 32, 8, 0.15, '#5a6a4a', 0.98));
      parts.push(blobShape(-3, 22, 27, 7, 0.12, '#6a7a5a', 0.85));
      parts.push(blobShape(-5, 19, 20, 6, 0.1, '#7a8a6a', 0.65));

      // Body texture
      parts.push(...noisePattern(200, { x: -35, y: -10, w: 70, h: 75 },
        ['#6a7a5a', '#5a6a4a', '#7a8a6a', '#4a5a3a'], [0.06, 0.18], [1, 3]));

      // Arms - thin, wiry
      // Left arm raised with crude weapon
      parts.push('<path d="M -25 15 Q -45 5 -50 -20" stroke="#5a6a4a" stroke-width="8" fill="none" opacity="0.95" />');
      parts.push('<path d="M -25 15 Q -43 7 -48 -18" stroke="#6a7a5a" stroke-width="5" fill="none" opacity="0.7" />');
      // Left hand
      parts.push('<ellipse cx="-50" cy="-22" rx="8" ry="7" fill="#6a7a5a" opacity="0.9" />');
      // Crude club/stick weapon
      parts.push('<path d="M -52 -25 L -65 -55 L -55 -58 L -45 -28" fill="#4a3a2a" opacity="0.9" />');
      parts.push('<path d="M -55 -58 L -60 -60 L -70 -52 L -65 -55" fill="#3a2a1a" opacity="0.8" />');

      // Right arm
      parts.push('<path d="M 22 18 Q 40 25 48 15" stroke="#5a6a4a" stroke-width="7" fill="none" opacity="0.95" />');
      parts.push('<path d="M 22 18 Q 38 24 46 16" stroke="#6a7a5a" stroke-width="4" fill="none" opacity="0.7" />');
      // Right hand (clenched)
      parts.push('<ellipse cx="50" cy="14" rx="7" ry="6" fill="#6a7a5a" opacity="0.9" />');

      // Head - large compared to body
      parts.push(blobShape(0, -25, 28, 8, 0.12, '#5a6a4a', 0.98));
      parts.push(blobShape(-2, -27, 24, 7, 0.1, '#6a7a5a', 0.85));
      parts.push(blobShape(-4, -29, 18, 6, 0.08, '#7a8a6a', 0.6));

      // Head texture
      parts.push(...noisePattern(80, { x: -30, y: -55, w: 60, h: 55 },
        ['#6a7a5a', '#5a6a4a', '#7a8a6a'], [0.08, 0.2], [1, 3]));

      // Ears - large, pointed
      parts.push('<path d="M -25 -30 Q -40 -50 -30 -60 Q -22 -45 -20 -32" fill="#5a6a4a" opacity="0.95" />');
      parts.push('<path d="M -24 -32 Q -35 -48 -28 -55" stroke="#7a8a6a" stroke-width="2" fill="none" opacity="0.5" />');
      parts.push('<path d="M 22 -30 Q 38 -50 28 -60 Q 20 -45 18 -32" fill="#5a6a4a" opacity="0.95" />');
      parts.push('<path d="M 21 -32 Q 33 -48 26 -55" stroke="#7a8a6a" stroke-width="2" fill="none" opacity="0.5" />');

      // Eyes - beady, mischievous
      parts.push('<ellipse cx="-10" cy="-28" rx="8" ry="7" fill="#1a2a0a" opacity="0.95" />');
      parts.push('<ellipse cx="10" cy="-28" rx="8" ry="7" fill="#1a2a0a" opacity="0.95" />');
      parts.push('<ellipse cx="-10" cy="-28" rx="5" ry="4" fill="#88aa44" opacity="0.9" />');
      parts.push('<ellipse cx="10" cy="-28" rx="5" ry="4" fill="#88aa44" opacity="0.9" />');
      parts.push('<ellipse cx="-10" cy="-28" rx="2" ry="1.5" fill="#ccff66" opacity="0.8" />');
      parts.push('<ellipse cx="10" cy="-28" rx="2" ry="1.5" fill="#ccff66" opacity="0.8" />');
      // Eye glow
      parts.push('<ellipse cx="-10" cy="-28" rx="12" ry="10" fill="#88aa44" opacity="0.12" />');
      parts.push('<ellipse cx="10" cy="-28" rx="12" ry="10" fill="#88aa44" opacity="0.12" />');

      // Snout/nose
      parts.push('<ellipse cx="0" cy="-15" rx="12" ry="8" fill="#5a6a4a" opacity="0.9" />');
      parts.push('<ellipse cx="0" cy="-16" rx="8" ry="5" fill="#6a7a5a" opacity="0.7" />');
      parts.push('<ellipse cx="-4" cy="-14" rx="3" ry="2" fill="#3a4a2a" opacity="0.8" />');
      parts.push('<ellipse cx="4" cy="-14" rx="3" ry="2" fill="#3a4a2a" opacity="0.8" />');

      // Mouth - jagged grin
      parts.push('<path d="M -12 -8 Q 0 2 12 -8" stroke="#2a3a1a" stroke-width="2" fill="none" opacity="0.8" />');
      // Teeth
      for (let i = 0; i < 5; i++) {
        const x = -8 + i * 4;
        const y = -6 + Math.sin(i) * 2;
        parts.push(`<path d="M ${x - 1} ${y} L ${x} ${y + 4} L ${x + 1} ${y}" fill="#ddc" opacity="0.9" />`);
      }

      // Aggression lines
      parts.push('<path d="M -35 -35 L -45 -40" stroke="#88aa44" stroke-width="2" opacity="0.4" />');
      parts.push('<path d="M 35 -35 L 45 -40" stroke="#88aa44" stroke-width="2" opacity="0.4" />');

      // Chaotic aura
      parts.push('<ellipse cx="0" cy="10" rx="60" ry="70" fill="#88aa44" opacity="0.04" />');

      return parts;
    }
  },
  {
    id: 'maw',
    name: 'Maw',
    background: { color1: '#2a1a2a', color2: '#0a050a' },
    glowColor: '#ff4488',
    buildParts: () => {
      const parts = [];

      // Ground shadow
      parts.push('<ellipse cx="0" cy="100" rx="85" ry="25" fill="#000" opacity="0.45" />');

      // Body is essentially one giant mouth
      // Lower jaw/body mass
      parts.push(blobShape(0, 50, 75, 10, 0.2, '#4a2a3a', 0.98));
      parts.push(blobShape(-5, 45, 68, 9, 0.18, '#5a3a4a', 0.9));
      parts.push(blobShape(-8, 40, 55, 8, 0.15, '#6a4a5a', 0.75));

      // Body texture
      parts.push(...noisePattern(NOISE_DENSITY, { x: -80, y: -20, w: 160, h: 130 },
        ['#6a4a5a', '#5a3a4a', '#7a5a6a', '#4a2a3a'], [0.05, 0.16], [1, 4]));

      // Upper jaw - curved over
      parts.push('<path d="M -70 20 Q -80 -30 -40 -60 Q 0 -75 40 -60 Q 80 -30 70 20" fill="#4a2a3a" opacity="0.98" />');
      parts.push('<path d="M -65 18 Q -75 -25 -38 -55 Q 0 -68 38 -55 Q 75 -25 65 18" fill="#5a3a4a" opacity="0.85" />');

      // Mouth interior - gaping void
      parts.push('<ellipse cx="0" cy="5" rx="55" ry="45" fill="#1a0a1a" opacity="0.95" />');
      parts.push('<ellipse cx="0" cy="0" rx="45" ry="35" fill="#2a1a2a" opacity="0.8" />');

      // Gullet/throat depth
      parts.push('<ellipse cx="0" cy="15" rx="30" ry="25" fill="#0a0508" opacity="0.9" />');

      // Massive teeth - upper jaw
      const upperTeeth = [
        { x: -50, y: -5, h: 35 },
        { x: -38, y: -10, h: 45 },
        { x: -25, y: -8, h: 40 },
        { x: -10, y: -12, h: 50 },
        { x: 5, y: -12, h: 48 },
        { x: 20, y: -8, h: 42 },
        { x: 35, y: -10, h: 44 },
        { x: 48, y: -5, h: 35 },
      ];
      for (const tooth of upperTeeth) {
        parts.push(`<path d="M ${tooth.x - 6} ${tooth.y} L ${tooth.x} ${tooth.y + tooth.h} L ${tooth.x + 6} ${tooth.y}" fill="#ddc" opacity="0.95" />`);
        parts.push(`<path d="M ${tooth.x - 3} ${tooth.y + 5} L ${tooth.x} ${tooth.y + tooth.h - 5}" stroke="#aaa" stroke-width="2" opacity="0.4" />`);
        // Blood stain
        if (Math.random() > 0.5) {
          parts.push(`<ellipse cx="${tooth.x}" cy="${tooth.y + tooth.h * 0.3}" rx="3" ry="5" fill="#8a2a3a" opacity="0.5" />`);
        }
      }

      // Massive teeth - lower jaw
      const lowerTeeth = [
        { x: -45, y: 55, h: -30 },
        { x: -30, y: 60, h: -40 },
        { x: -15, y: 58, h: -38 },
        { x: 0, y: 62, h: -45 },
        { x: 15, y: 58, h: -38 },
        { x: 30, y: 60, h: -40 },
        { x: 45, y: 55, h: -30 },
      ];
      for (const tooth of lowerTeeth) {
        parts.push(`<path d="M ${tooth.x - 6} ${tooth.y} L ${tooth.x} ${tooth.y + tooth.h} L ${tooth.x + 6} ${tooth.y}" fill="#ddc" opacity="0.95" />`);
        parts.push(`<path d="M ${tooth.x - 3} ${tooth.y - 5} L ${tooth.x} ${tooth.y + tooth.h + 5}" stroke="#aaa" stroke-width="2" opacity="0.4" />`);
      }

      // Gums - fleshy pink
      parts.push('<path d="M -60 -5 Q -30 5 0 0 Q 30 5 60 -5" fill="#8a4a5a" opacity="0.7" />');
      parts.push('<path d="M -55 55 Q -25 48 0 52 Q 25 48 55 55" fill="#8a4a5a" opacity="0.7" />');

      // Drool/saliva strands
      parts.push('<path d="M -20 30 Q -18 50 -22 70" stroke="#8a7a8a" stroke-width="2" fill="none" opacity="0.4" />');
      parts.push('<path d="M 15 25 Q 18 45 12 65" stroke="#8a7a8a" stroke-width="2" fill="none" opacity="0.4" />');
      parts.push('<path d="M -5 35 Q -3 55 -8 75" stroke="#8a7a8a" stroke-width="1.5" fill="none" opacity="0.35" />');

      // Small beady eyes - almost hidden
      parts.push('<ellipse cx="-55" cy="-35" rx="8" ry="6" fill="#1a0a1a" opacity="0.9" />');
      parts.push('<ellipse cx="55" cy="-35" rx="8" ry="6" fill="#1a0a1a" opacity="0.9" />');
      parts.push('<ellipse cx="-55" cy="-35" rx="4" ry="3" fill="#ff4488" opacity="0.8" />');
      parts.push('<ellipse cx="55" cy="-35" rx="4" ry="3" fill="#ff4488" opacity="0.8" />');
      parts.push('<ellipse cx="-55" cy="-35" rx="1.5" ry="1" fill="#ff88aa" opacity="0.6" />');
      parts.push('<ellipse cx="55" cy="-35" rx="1.5" ry="1" fill="#ff88aa" opacity="0.6" />');

      // Hunger/aggression aura
      parts.push('<ellipse cx="0" cy="25" rx="95" ry="85" fill="#ff4488" opacity="0.04" />');
      parts.push('<ellipse cx="0" cy="10" rx="75" ry="65" fill="#ff6699" opacity="0.03" />');

      return parts;
    }
  },
  {
    id: 'nemesis',
    name: 'Nemesis',
    background: { color1: '#1a1a2a', color2: '#05050a' },
    glowColor: '#8844ff',
    buildParts: () => {
      const parts = [];

      // No ground shadow - floating specter

      // Spectral trail/fade effect
      parts.push('<ellipse cx="0" cy="90" rx="40" ry="60" fill="#8844ff" opacity="0.08" />');
      parts.push('<ellipse cx="0" cy="70" rx="30" ry="45" fill="#aa66ff" opacity="0.06" />');

      // Ethereal robe/shroud - fading at bottom
      parts.push('<path d="M -50 100 Q -60 30 -30 -30 L 30 -30 Q 60 30 50 100 Q 0 120 -50 100" fill="#3a3a5a" opacity="0.7" />');
      parts.push('<path d="M -45 95 Q -55 35 -28 -25 L 28 -25 Q 55 35 45 95 Q 0 110 -45 95" fill="#4a4a6a" opacity="0.5" />');

      // Robe texture - ethereal wisps
      parts.push(...noisePattern(300, { x: -55, y: -35, w: 110, h: 140 },
        ['#5a5a7a', '#4a4a6a', '#6a6a8a', '#3a3a5a'], [0.03, 0.12], [1, 5]));

      // Ethereal wisps rising
      for (let i = 0; i < 8; i++) {
        const x = -40 + Math.random() * 80;
        const startY = 60 + Math.random() * 40;
        const endY = startY - 40 - Math.random() * 30;
        const ctrl1Y = startY - 20;
        const ctrl2Y = endY + 15;
        const ctrlX = x + (Math.random() - 0.5) * 30;
        parts.push(`<path d="M ${x} ${startY} Q ${ctrlX} ${ctrl1Y} ${ctrlX} ${ctrl2Y} Q ${x + (Math.random() - 0.5) * 20} ${endY + 5} ${x} ${endY}" stroke="#6a6a8a" stroke-width="2" fill="none" opacity="0.3" />`);
      }

      // Skeletal/spectral hands
      // Left hand
      parts.push('<path d="M -35 0 Q -60 -15 -70 -35" stroke="#5a5a7a" stroke-width="6" fill="none" opacity="0.8" />');
      parts.push('<ellipse cx="-72" cy="-38" rx="10" ry="8" fill="#5a5a7a" opacity="0.7" />');
      // Bony fingers
      for (let i = 0; i < 4; i++) {
        const angle = -Math.PI * 0.7 + (i / 3) * Math.PI * 0.5;
        const x = -72 + Math.cos(angle) * 8;
        const y = -38 + Math.sin(angle) * 6;
        const tipX = -72 + Math.cos(angle) * 22;
        const tipY = -38 + Math.sin(angle) * 18;
        parts.push(`<path d="M ${x} ${y} L ${tipX} ${tipY}" stroke="#6a6a8a" stroke-width="2" fill="none" opacity="0.7" />`);
      }

      // Right hand with scythe
      parts.push('<path d="M 32 5 Q 55 -10 65 -40" stroke="#5a5a7a" stroke-width="6" fill="none" opacity="0.8" />');
      parts.push('<ellipse cx="68" cy="-45" rx="10" ry="8" fill="#5a5a7a" opacity="0.7" />');

      // Spectral scythe
      parts.push('<path d="M 65 -50 L 60 -110" stroke="#4a4a6a" stroke-width="5" fill="none" opacity="0.9" />');
      // Scythe blade
      parts.push('<path d="M 60 -110 Q 30 -115 10 -95 Q 25 -100 55 -105 L 60 -110" fill="#8a8aaa" opacity="0.8" />');
      parts.push('<path d="M 55 -107 Q 30 -108 18 -97" stroke="#aaaacc" stroke-width="1.5" fill="none" opacity="0.6" />');

      // Hood/head
      parts.push(blobShape(0, -50, 35, 10, 0.1, '#3a3a5a', 0.85));
      parts.push(blobShape(-2, -52, 30, 8, 0.08, '#4a4a6a', 0.7));

      // Hood shadow (face void)
      parts.push('<ellipse cx="0" cy="-48" rx="25" ry="22" fill="#0a0a15" opacity="0.95" />');

      // Glowing eyes in void
      parts.push('<ellipse cx="-10" cy="-52" rx="6" ry="4" fill="#8844ff" opacity="0.9" />');
      parts.push('<ellipse cx="10" cy="-52" rx="6" ry="4" fill="#8844ff" opacity="0.9" />');
      parts.push('<ellipse cx="-10" cy="-52" rx="3" ry="2" fill="#aa66ff" opacity="0.8" />');
      parts.push('<ellipse cx="10" cy="-52" rx="3" ry="2" fill="#aa66ff" opacity="0.8" />');
      parts.push('<ellipse cx="-10" cy="-52" rx="1" ry="0.7" fill="#ffffff" opacity="0.6" />');
      parts.push('<ellipse cx="10" cy="-52" rx="1" ry="0.7" fill="#ffffff" opacity="0.6" />');
      // Eye glow
      parts.push('<ellipse cx="0" cy="-52" rx="30" ry="18" fill="#8844ff" opacity="0.12" />');

      // Death aura
      parts.push('<ellipse cx="0" cy="0" rx="80" ry="100" fill="#8844ff" opacity="0.05" />');
      parts.push('<ellipse cx="0" cy="-20" rx="60" ry="75" fill="#aa66ff" opacity="0.04" />');

      // Spectral particles
      parts.push(...particleCloud(0, 20, 25, 90, '#aa66ff'));

      return parts;
    }
  },
  {
    id: 'spireGrowth',
    name: 'Spire Growth',
    background: { color1: '#2a1a2a', color2: '#0a050a' },
    glowColor: '#ff44aa',
    buildParts: () => {
      const parts = [];

      // Ground shadow/base
      parts.push('<ellipse cx="0" cy="105" rx="60" ry="20" fill="#000" opacity="0.5" />');

      // Root system spreading
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
        const length = 40 + Math.random() * 30;
        const endX = Math.cos(angle) * length;
        const endY = 100 + Math.sin(angle) * 15;
        const ctrlX = Math.cos(angle) * length * 0.6;
        const ctrlY = 95 + Math.sin(angle) * 10;
        parts.push(`<path d="M 0 90 Q ${ctrlX} ${ctrlY} ${endX} ${endY}" stroke="#4a2a4a" stroke-width="${4 + Math.random() * 3}" fill="none" opacity="0.8" />`);
      }

      // Main crystalline tower body
      parts.push('<path d="M -35 90 L -45 30 L -30 -50 L 0 -90 L 30 -50 L 45 30 L 35 90 Z" fill="#5a3a5a" opacity="0.95" />');
      parts.push('<path d="M -32 85 L -42 32 L -28 -45 L 0 -82 L 28 -45 L 42 32 L 32 85 Z" fill="#6a4a6a" opacity="0.85" />');

      // Crystal facets
      parts.push('<path d="M 0 -82 L -28 -45 L 0 -30 Z" fill="#7a5a7a" opacity="0.6" />');
      parts.push('<path d="M 0 -82 L 28 -45 L 0 -30 Z" fill="#5a3a5a" opacity="0.7" />');
      parts.push('<path d="M -28 -45 L -42 32 L 0 10 Z" fill="#6a4a6a" opacity="0.5" />');
      parts.push('<path d="M 28 -45 L 42 32 L 0 10 Z" fill="#4a2a4a" opacity="0.6" />');

      // Texture
      parts.push(...noisePattern(NOISE_DENSITY, { x: -50, y: -95, w: 100, h: 190 },
        ['#7a5a7a', '#6a4a6a', '#8a6a8a', '#5a3a5a'], [0.04, 0.14], [1, 4]));

      // Organic growth veins
      for (let i = 0; i < 5; i++) {
        const startY = 80 - i * 30;
        const endY = startY - 40;
        const side = i % 2 === 0 ? -1 : 1;
        parts.push(`<path d="M 0 ${startY} Q ${side * 25} ${(startY + endY) / 2} ${side * 15} ${endY}" stroke="#ff44aa" stroke-width="2" fill="none" opacity="0.4" />`);
      }

      // Glowing crystal eyes/nodes
      const nodes = [
        { x: 0, y: -60, size: 1.2 },
        { x: -20, y: -20, size: 0.9 },
        { x: 18, y: -25, size: 0.85 },
        { x: -12, y: 20, size: 0.7 },
        { x: 15, y: 25, size: 0.75 },
      ];

      for (const node of nodes) {
        const r = 10 * node.size;
        parts.push(`<circle cx="${node.x}" cy="${node.y}" r="${r + 4}" fill="#ff44aa" opacity="0.15" />`);
        parts.push(`<circle cx="${node.x}" cy="${node.y}" r="${r}" fill="#1a0a1a" opacity="0.95" />`);
        parts.push(`<circle cx="${node.x}" cy="${node.y}" r="${r * 0.75}" fill="#ff44aa" opacity="0.9" />`);
        parts.push(`<circle cx="${node.x}" cy="${node.y}" r="${r * 0.5}" fill="#ff66bb" opacity="0.8" />`);
        parts.push(`<circle cx="${node.x - r * 0.15}" cy="${node.y - r * 0.15}" r="${r * 0.25}" fill="#ff88cc" opacity="0.6" />`);
      }

      // Smaller crystal spikes
      const spikes = [
        { x: -40, y: 50, h: 25, angle: -15 },
        { x: 38, y: 55, h: 22, angle: 12 },
        { x: -35, y: 0, h: 30, angle: -20 },
        { x: 33, y: -5, h: 28, angle: 18 },
        { x: -25, y: -55, h: 20, angle: -25 },
        { x: 22, y: -52, h: 18, angle: 22 },
      ];

      for (const spike of spikes) {
        const tipX = spike.x + Math.sin(spike.angle * Math.PI / 180) * spike.h;
        const tipY = spike.y - Math.cos(spike.angle * Math.PI / 180) * spike.h;
        parts.push(`<path d="M ${spike.x - 5} ${spike.y} L ${tipX} ${tipY} L ${spike.x + 5} ${spike.y}" fill="#6a4a6a" opacity="0.85" />`);
        parts.push(`<path d="M ${spike.x} ${spike.y - 3} L ${tipX} ${tipY}" stroke="#8a6a8a" stroke-width="1.5" fill="none" opacity="0.5" />`);
      }

      // Energy particles
      parts.push(...particleCloud(0, -20, 30, 70, '#ff66bb'));

      // Growth aura
      parts.push('<ellipse cx="0" cy="0" rx="75" ry="110" fill="#ff44aa" opacity="0.05" />');
      parts.push('<ellipse cx="0" cy="-20" rx="55" ry="85" fill="#ff66bb" opacity="0.04" />');

      return parts;
    }
  },
  {
    id: 'transient',
    name: 'Transient',
    background: { color1: '#1a1a2a', color2: '#05050a' },
    glowColor: '#44aaff',
    buildParts: () => {
      const parts = [];

      // No ground shadow - ethereal being

      // Fading ethereal trail
      parts.push('<ellipse cx="0" cy="80" rx="50" ry="70" fill="#44aaff" opacity="0.06" />');
      parts.push('<ellipse cx="0" cy="60" rx="40" ry="55" fill="#66bbff" opacity="0.04" />');
      parts.push('<ellipse cx="0" cy="40" rx="30" ry="40" fill="#88ccff" opacity="0.03" />');

      // Main ghostly form - semi-transparent
      parts.push(blobShape(0, 0, 55, 12, 0.2, '#4a6a8a', 0.5));
      parts.push(blobShape(-3, -5, 48, 10, 0.18, '#5a7a9a', 0.4));
      parts.push(blobShape(-5, -10, 38, 10, 0.15, '#6a8aaa', 0.3));

      // Ethereal texture - very light
      parts.push(...noisePattern(200, { x: -60, y: -70, w: 120, h: 160 },
        ['#6a8aaa', '#5a7a9a', '#7a9aba', '#4a6a8a'], [0.02, 0.08], [1, 5]));

      // Fading/dissolving edges
      for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 45 + Math.random() * 20;
        const x = Math.cos(angle) * dist;
        const y = Math.sin(angle) * dist - 10;
        const fadeDir = angle + (Math.random() - 0.5) * 0.5;
        const fadeLen = 15 + Math.random() * 20;
        const fadeX = x + Math.cos(fadeDir) * fadeLen;
        const fadeY = y + Math.sin(fadeDir) * fadeLen;
        parts.push(`<path d="M ${x} ${y} Q ${(x + fadeX) / 2 + (Math.random() - 0.5) * 10} ${(y + fadeY) / 2} ${fadeX} ${fadeY}" stroke="#6a8aaa" stroke-width="${1 + Math.random() * 2}" fill="none" opacity="${0.1 + Math.random() * 0.2}" />`);
      }

      // Central form - slightly more solid
      parts.push(blobShape(0, -15, 35, 8, 0.12, '#5a7a9a', 0.6));
      parts.push(blobShape(-2, -18, 28, 7, 0.1, '#6a8aaa', 0.5));

      // Face area - haunting expression
      // Eyes - sad, fading
      parts.push('<ellipse cx="-15" cy="-25" rx="10" ry="8" fill="#2a4a6a" opacity="0.7" />');
      parts.push('<ellipse cx="15" cy="-25" rx="10" ry="8" fill="#2a4a6a" opacity="0.7" />');
      parts.push('<ellipse cx="-15" cy="-25" rx="6" ry="5" fill="#44aaff" opacity="0.8" />');
      parts.push('<ellipse cx="15" cy="-25" rx="6" ry="5" fill="#44aaff" opacity="0.8" />');
      parts.push('<ellipse cx="-15" cy="-25" rx="3" ry="2.5" fill="#88ccff" opacity="0.7" />');
      parts.push('<ellipse cx="15" cy="-25" rx="3" ry="2.5" fill="#88ccff" opacity="0.7" />');
      // Sad downturned glow
      parts.push('<ellipse cx="-15" cy="-23" rx="12" ry="10" fill="#44aaff" opacity="0.15" />');
      parts.push('<ellipse cx="15" cy="-23" rx="12" ry="10" fill="#44aaff" opacity="0.15" />');

      // Mouth - open in silent scream or sorrow
      parts.push('<ellipse cx="0" cy="-5" rx="12" ry="10" fill="#1a3a5a" opacity="0.6" />');
      parts.push('<ellipse cx="0" cy="-3" rx="8" ry="6" fill="#0a2a4a" opacity="0.5" />');

      // Ethereal "arms" reaching out/fading
      parts.push('<path d="M -35 -5 Q -60 -15 -75 -10 Q -85 -5 -90 5" stroke="#5a7a9a" stroke-width="8" fill="none" opacity="0.35" />');
      parts.push('<path d="M -37 -7 Q -58 -17 -72 -12" stroke="#6a8aaa" stroke-width="5" fill="none" opacity="0.25" />');

      parts.push('<path d="M 35 -5 Q 60 -15 75 -10 Q 85 -5 90 5" stroke="#5a7a9a" stroke-width="8" fill="none" opacity="0.35" />');
      parts.push('<path d="M 37 -7 Q 58 -17 72 -12" stroke="#6a8aaa" stroke-width="5" fill="none" opacity="0.25" />');

      // Fading hands
      parts.push('<ellipse cx="-88" cy="5" rx="12" ry="10" fill="#5a7a9a" opacity="0.25" />');
      parts.push('<ellipse cx="88" cy="5" rx="12" ry="10" fill="#5a7a9a" opacity="0.25" />');

      // Time/fade indicators - clock-like markings
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
        const x1 = Math.cos(angle) * 60;
        const y1 = Math.sin(angle) * 60;
        const x2 = Math.cos(angle) * 70;
        const y2 = Math.sin(angle) * 70;
        const opacity = 0.15 - (i / 8) * 0.1;
        parts.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#44aaff" stroke-width="2" opacity="${opacity}" />`);
      }

      // Ethereal particles dispersing
      parts.push(...particleCloud(0, 0, 35, 100, '#88ccff'));

      // Fading aura
      parts.push('<ellipse cx="0" cy="0" rx="85" ry="95" fill="#44aaff" opacity="0.04" />');
      parts.push('<ellipse cx="0" cy="-10" rx="65" ry="75" fill="#66bbff" opacity="0.03" />');

      return parts;
    }
  }
];

async function generateAct2_3EnemyArt() {
  const sharp = (await import('sharp')).default;
  const outDir = path.join(__dirname, '..', 'src', 'assets', 'art', 'enemies');

  console.log('\n=== VP-06: Act 2/3 Enemy Sprite Replacement ===\n');
  console.log('Target: >20KB per sprite\n');

  for (const enemy of ENEMIES) {
    const parts = enemy.buildParts();
    const svg = `<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg-${enemy.id}" cx="50%" cy="45%" r="70%">
      <stop offset="0%" stop-color="${enemy.background.color1}" />
      <stop offset="100%" stop-color="${enemy.background.color2}" />
    </radialGradient>
    <radialGradient id="glow-${enemy.id}" cx="50%" cy="40%" r="45%">
      <stop offset="0%" stop-color="${enemy.glowColor}" stop-opacity="0.12" />
      <stop offset="100%" stop-color="${enemy.glowColor}" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="vignette" cx="50%" cy="50%" r="50%">
      <stop offset="40%" stop-color="black" stop-opacity="0" />
      <stop offset="100%" stop-color="black" stop-opacity="0.7" />
    </radialGradient>
  </defs>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#bg-${enemy.id})" />
  <rect width="${SIZE}" height="${SIZE}" fill="url(#glow-${enemy.id})" />
  <g transform="translate(384, 400)">
    ${parts.join('\n    ')}
  </g>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#vignette)" />
</svg>`;

    const outPath = path.join(outDir, `${enemy.id}.webp`);

    // Render at high resolution and downscale for quality
    await sharp(Buffer.from(svg))
      .resize(512, 512, { kernel: 'lanczos3' })
      .webp({ quality: 100, nearLossless: true, effort: 6 })
      .toFile(outPath);

    const stats = fs.statSync(outPath);
    const sizeKB = (stats.size / 1024).toFixed(1);
    const status = stats.size > 20 * 1024 ? '✓' : '✗ (below 20KB)';
    console.log(`  ${enemy.id}.webp: ${sizeKB}KB ${status}`);
  }

  console.log('\n=== Generation Complete ===\n');
  console.log('Next: Rebuild sprite sheet with: node scripts/generate-sprite-sheets.js --type=enemies\n');
}

generateAct2_3EnemyArt().catch(console.error);
