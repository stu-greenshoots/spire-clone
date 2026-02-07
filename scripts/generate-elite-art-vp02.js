#!/usr/bin/env node

/**
 * VP-02: Act 1 Elite Sprite Replacement
 *
 * Generates high-quality art for the 2 Act 1 elites:
 * - Gremlin Nob: Hulking muscular gremlin with massive club
 * - Lagavulin: Armored sleeping warrior that awakens with glowing eyes
 *
 * Target: >30KB per sprite with detailed layered art
 *
 * Usage: node scripts/generate-elite-art-vp02.js
 * Requires: sharp (devDependency)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SIZE = 768; // Larger canvas for more detail
const NOISE_DENSITY = 500; // High density for rich textures

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

// Generate muscle definition lines
function muscleLines(cx, cy, radius, count, color, opacity) {
  const parts = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const startR = radius * (0.3 + Math.random() * 0.2);
    const endR = radius * (0.7 + Math.random() * 0.25);
    const x1 = cx + Math.cos(angle) * startR;
    const y1 = cy + Math.sin(angle) * startR;
    const x2 = cx + Math.cos(angle) * endR;
    const y2 = cy + Math.sin(angle) * endR;
    const ctrl = {
      x: (x1 + x2) / 2 + (Math.random() - 0.5) * radius * 0.3,
      y: (y1 + y2) / 2 + (Math.random() - 0.5) * radius * 0.3
    };
    parts.push(`<path d="M ${x1} ${y1} Q ${ctrl.x} ${ctrl.y} ${x2} ${y2}" stroke="${color}" stroke-width="${1 + Math.random()}" fill="none" opacity="${opacity}" />`);
  }
  return parts;
}

// Generate armor plate detail
function armorPlate(x, y, width, height, rotation, color, highlightColor) {
  const parts = [];
  parts.push(`<g transform="rotate(${rotation}, ${x + width/2}, ${y + height/2})">`);
  // Main plate
  parts.push(`<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="3" fill="${color}" opacity="0.9" />`);
  // Highlight edge
  parts.push(`<rect x="${x + 2}" y="${y + 2}" width="${width - 4}" height="4" fill="${highlightColor}" opacity="0.5" />`);
  // Shadow edge
  parts.push(`<rect x="${x + 2}" y="${y + height - 6}" width="${width - 4}" height="4" fill="#000" opacity="0.3" />`);
  // Rivet
  parts.push(`<circle cx="${x + width/2}" cy="${y + height/2}" r="3" fill="#1a1a1a" />`);
  parts.push(`<circle cx="${x + width/2 - 1}" cy="${y + height/2 - 1}" r="1" fill="#666" opacity="0.6" />`);
  parts.push('</g>');
  return parts;
}

const ELITES = [
  {
    id: 'gremlinNob',
    name: 'Gremlin Nob',
    background: { color1: '#2a2a1a', color2: '#0a0a05' },
    glowColor: '#aa4422',
    buildParts: () => {
      const parts = [];

      // Ground shadow
      parts.push('<ellipse cx="0" cy="110" rx="90" ry="25" fill="#000" opacity="0.4" />');

      // Legs - thick and powerful
      // Left leg
      parts.push('<path d="M -40 45 L -55 95 L -45 110 L -25 95 L -30 45" fill="#5a4a3a" opacity="0.95" />');
      parts.push('<path d="M -42 50 L -52 90 L -43 100 L -32 90 L -35 50" fill="#6a5a4a" opacity="0.8" />');
      // Right leg
      parts.push('<path d="M 25 45 L 35 95 L 50 115 L 55 95 L 40 45" fill="#5a4a3a" opacity="0.95" />');
      parts.push('<path d="M 28 50 L 38 90 L 48 105 L 52 90 L 38 50" fill="#6a5a4a" opacity="0.8" />');

      // Leg muscle texture
      parts.push(...noisePattern(80, { x: -60, y: 45, w: 40, h: 65 },
        ['#7a6a5a', '#6a5a4a', '#8a7a6a'], [0.1, 0.25], [1, 3]));
      parts.push(...noisePattern(80, { x: 25, y: 45, w: 35, h: 70 },
        ['#7a6a5a', '#6a5a4a', '#8a7a6a'], [0.1, 0.25], [1, 3]));

      // Massive torso - barrel-shaped
      parts.push(blobShape(0, -5, 75, 12, 0.15, '#5a4a3a', 0.98));
      parts.push(blobShape(-5, -8, 68, 10, 0.12, '#6a5a4a', 0.9));
      parts.push(blobShape(5, -3, 60, 10, 0.1, '#7a6a5a', 0.7));

      // Chest texture - dense for muscular look
      parts.push(...noisePattern(NOISE_DENSITY, { x: -70, y: -75, w: 140, h: 130 },
        ['#8a7a6a', '#7a6a5a', '#9a8a7a', '#6a5a4a', '#aa9a8a'], [0.06, 0.2], [1, 4]));

      // Pectoral definition
      parts.push('<ellipse cx="-25" cy="-25" rx="30" ry="22" fill="#7a6a5a" opacity="0.4" />');
      parts.push('<ellipse cx="25" cy="-25" rx="30" ry="22" fill="#7a6a5a" opacity="0.4" />');
      parts.push('<path d="M -30 -40 Q 0 -25 30 -40" stroke="#5a4a3a" stroke-width="3" fill="none" opacity="0.5" />');

      // Muscle striations
      parts.push(...muscleLines(-25, -25, 28, 8, '#5a4a3a', 0.3));
      parts.push(...muscleLines(25, -25, 28, 8, '#5a4a3a', 0.3));

      // Abs definition
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 2; col++) {
          const x = -18 + col * 20;
          const y = 5 + row * 18;
          parts.push(`<rect x="${x}" y="${y}" width="16" height="14" rx="4" fill="#6a5a4a" opacity="0.35" />`);
        }
      }

      // Massive arms
      // Left arm - reaching back
      parts.push('<path d="M -65 -50 L -105 -35 L -130 -60 L -140 -55 L -115 -25 L -65 -35" fill="#5a4a3a" opacity="0.95" />');
      parts.push('<path d="M -68 -48 L -100 -35 L -125 -55 L -110 -30 L -68 -38" fill="#6a5a4a" opacity="0.8" />');
      // Left forearm
      parts.push('<path d="M -115 -25 L -135 15 L -125 25 L -105 0" fill="#5a4a3a" opacity="0.9" />');

      // Right arm - forward/down
      parts.push('<path d="M 60 -45 L 95 -20 L 110 15 L 95 25 L 75 0 L 55 -30" fill="#5a4a3a" opacity="0.95" />');
      parts.push('<path d="M 62 -42 L 90 -20 L 100 10 L 90 18 L 72 -5 L 58 -32" fill="#6a5a4a" opacity="0.8" />');

      // Arm muscle texture
      parts.push(...noisePattern(100, { x: -145, y: -70, w: 85, h: 100 },
        ['#7a6a5a', '#6a5a4a', '#8a7a6a'], [0.08, 0.22], [1, 3]));
      parts.push(...noisePattern(100, { x: 55, y: -50, w: 60, h: 80 },
        ['#7a6a5a', '#6a5a4a', '#8a7a6a'], [0.08, 0.22], [1, 3]));

      // Bicep bulge on left arm
      parts.push('<ellipse cx="-90" cy="-40" rx="18" ry="14" fill="#7a6a5a" opacity="0.5" />');
      parts.push(...muscleLines(-90, -40, 16, 6, '#5a4a3a', 0.25));

      // Massive club in left hand
      // Club handle
      parts.push('<rect x="-145" y="5" width="25" height="90" rx="8" fill="#3a2a1a" opacity="0.95" transform="rotate(-15, -132, 50)" />');
      // Club head - massive and spiked
      parts.push('<ellipse cx="-125" cy="80" rx="45" ry="35" fill="#4a3a2a" opacity="0.95" transform="rotate(-15, -125, 80)" />');
      parts.push('<ellipse cx="-125" cy="80" rx="38" ry="28" fill="#5a4a3a" opacity="0.8" transform="rotate(-15, -125, 80)" />');
      // Club texture
      parts.push(...noisePattern(150, { x: -175, y: 45, w: 100, h: 70 },
        ['#6a5a4a', '#5a4a3a', '#7a6a5a'], [0.1, 0.3], [2, 5]));
      // Club spikes
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 - Math.PI * 0.3;
        const x = -125 + Math.cos(angle) * 42;
        const y = 80 + Math.sin(angle) * 32;
        const tipX = -125 + Math.cos(angle) * 60;
        const tipY = 80 + Math.sin(angle) * 48;
        parts.push(`<path d="M ${x - 5} ${y} L ${tipX} ${tipY} L ${x + 5} ${y}" fill="#5a4a3a" opacity="0.9" />`);
      }
      // Club binding straps
      parts.push('<path d="M -155 15 L -125 25" stroke="#2a1a0a" stroke-width="4" opacity="0.7" />');
      parts.push('<path d="M -155 35 L -120 45" stroke="#2a1a0a" stroke-width="4" opacity="0.7" />');

      // Fist on right arm
      parts.push('<ellipse cx="105" cy="20" rx="18" ry="15" fill="#5a4a3a" opacity="0.95" />');
      parts.push('<ellipse cx="105" cy="20" rx="14" ry="11" fill="#6a5a4a" opacity="0.7" />');
      // Knuckles
      for (let i = 0; i < 4; i++) {
        const x = 95 + i * 7;
        parts.push(`<ellipse cx="${x}" cy="12" rx="4" ry="3" fill="#7a6a5a" opacity="0.6" />`);
      }

      // Neck - thick
      parts.push('<path d="M -20 -70 L -25 -90 L 25 -90 L 20 -70" fill="#5a4a3a" opacity="0.95" />');
      parts.push('<path d="M -15 -72 L -18 -85 L 18 -85 L 15 -72" fill="#6a5a4a" opacity="0.7" />');

      // Head - brutish
      parts.push(blobShape(0, -110, 40, 10, 0.12, '#5a4a3a', 0.98));
      parts.push(blobShape(-3, -112, 35, 8, 0.1, '#6a5a4a', 0.85));

      // Head texture
      parts.push(...noisePattern(80, { x: -40, y: -150, w: 80, h: 80 },
        ['#7a6a5a', '#6a5a4a', '#8a7a6a'], [0.08, 0.2], [1, 3]));

      // Brow ridge - heavy and angry
      parts.push('<path d="M -30 -125 Q 0 -135 30 -125" stroke="#4a3a2a" stroke-width="6" fill="none" opacity="0.8" />');
      parts.push('<path d="M -25 -123 Q 0 -130 25 -123" stroke="#5a4a3a" stroke-width="3" fill="none" opacity="0.5" />');

      // Eyes - angry, glowing
      parts.push('<ellipse cx="-15" cy="-115" rx="10" ry="6" fill="#1a0a0a" opacity="0.9" />');
      parts.push('<ellipse cx="15" cy="-115" rx="10" ry="6" fill="#1a0a0a" opacity="0.9" />');
      parts.push('<ellipse cx="-15" cy="-115" rx="7" ry="4" fill="#dd4422" opacity="0.9" />');
      parts.push('<ellipse cx="15" cy="-115" rx="7" ry="4" fill="#dd4422" opacity="0.9" />');
      parts.push('<ellipse cx="-15" cy="-115" rx="4" ry="2" fill="#ffaa44" opacity="0.7" />');
      parts.push('<ellipse cx="15" cy="-115" rx="4" ry="2" fill="#ffaa44" opacity="0.7" />');
      // Eye glow
      parts.push('<ellipse cx="-15" cy="-115" rx="14" ry="8" fill="#dd4422" opacity="0.15" />');
      parts.push('<ellipse cx="15" cy="-115" rx="14" ry="8" fill="#dd4422" opacity="0.15" />');

      // Nose - flat, brutish
      parts.push('<path d="M -5 -110 L 0 -98 L 5 -110" fill="#5a4a3a" opacity="0.8" />');
      parts.push('<ellipse cx="-3" cy="-100" rx="4" ry="3" fill="#4a3a2a" opacity="0.7" />');
      parts.push('<ellipse cx="3" cy="-100" rx="4" ry="3" fill="#4a3a2a" opacity="0.7" />');

      // Mouth - snarling with tusks
      parts.push('<path d="M -20 -92 Q 0 -85 20 -92" stroke="#3a2a1a" stroke-width="3" fill="none" opacity="0.8" />');
      // Tusks
      parts.push('<path d="M -22 -90 L -28 -75 L -20 -85" fill="#ddc" opacity="0.95" />');
      parts.push('<path d="M 22 -90 L 28 -75 L 20 -85" fill="#ddc" opacity="0.95" />');
      parts.push('<path d="M -23 -88 L -27 -78" stroke="#aaa" stroke-width="2" opacity="0.3" />');
      parts.push('<path d="M 23 -88 L 27 -78" stroke="#aaa" stroke-width="2" opacity="0.3" />');

      // Pointed ears
      parts.push('<path d="M -35 -115 L -50 -135 L -32 -120" fill="#5a4a3a" opacity="0.95" />');
      parts.push('<path d="M 35 -115 L 50 -135 L 32 -120" fill="#5a4a3a" opacity="0.95" />');
      parts.push('<path d="M -37 -116 L -45 -130 L -34 -120" fill="#6a5a4a" opacity="0.6" />');
      parts.push('<path d="M 37 -116 L 45 -130 L 34 -120" fill="#6a5a4a" opacity="0.6" />');

      // War paint / scars
      parts.push('<path d="M -30 -30 L -15 -10 L -25 10" stroke="#aa3322" stroke-width="4" fill="none" opacity="0.4" />');
      parts.push('<path d="M 35 -40 L 28 -20" stroke="#aa3322" stroke-width="3" fill="none" opacity="0.35" />');
      parts.push('<path d="M 15 5 L 25 25" stroke="#aa3322" stroke-width="3" fill="none" opacity="0.35" />');

      // Rage aura
      parts.push('<ellipse cx="0" cy="-30" rx="100" ry="90" fill="#aa4422" opacity="0.06" />');
      parts.push('<ellipse cx="0" cy="-40" rx="80" ry="70" fill="#dd5533" opacity="0.04" />');

      return parts;
    }
  },
  {
    id: 'lagavulin',
    name: 'Lagavulin',
    background: { color1: '#1a1a2a', color2: '#05050a' },
    glowColor: '#4466aa',
    buildParts: () => {
      const parts = [];

      // Asleep / defensive posture ground shadow
      parts.push('<ellipse cx="0" cy="95" rx="100" ry="30" fill="#000" opacity="0.5" />');

      // The creature is curled up in a ball-like defensive posture
      // Main shell/armor dome
      parts.push('<ellipse cx="0" cy="15" rx="95" ry="75" fill="#3a3a4a" opacity="0.98" />');
      parts.push('<ellipse cx="0" cy="10" rx="88" ry="68" fill="#4a4a5a" opacity="0.9" />');
      parts.push('<ellipse cx="0" cy="5" rx="78" ry="60" fill="#5a5a6a" opacity="0.75" />');

      // Armor plates on the dome - overlapping scale pattern
      const plateRows = [
        { y: -45, count: 5, width: 32, height: 22 },
        { y: -25, count: 6, width: 28, height: 20 },
        { y: -5, count: 7, width: 26, height: 18 },
        { y: 15, count: 6, width: 28, height: 20 },
        { y: 35, count: 5, width: 30, height: 18 },
        { y: 55, count: 4, width: 28, height: 16 },
      ];

      plateRows.forEach(row => {
        const startX = -(row.count * row.width) / 2 + row.width / 2;
        for (let i = 0; i < row.count; i++) {
          const x = startX + i * row.width;
          parts.push(...armorPlate(x - row.width/2 + 2, row.y - row.height/2, row.width - 4, row.height, 0, '#4a4a5a', '#6a6a7a'));
        }
      });

      // Armor texture noise
      parts.push(...noisePattern(NOISE_DENSITY, { x: -95, y: -60, w: 190, h: 150 },
        ['#5a5a6a', '#4a4a5a', '#6a6a7a', '#3a3a4a', '#7a7a8a'], [0.04, 0.12], [1, 3]));

      // Spikes along the dome ridge
      const spikePositions = [
        { x: 0, y: -60, size: 25, angle: 0 },
        { x: -30, y: -52, size: 22, angle: -15 },
        { x: 30, y: -52, size: 22, angle: 15 },
        { x: -55, y: -38, size: 18, angle: -25 },
        { x: 55, y: -38, size: 18, angle: 25 },
        { x: -75, y: -15, size: 15, angle: -35 },
        { x: 75, y: -15, size: 15, angle: 35 },
      ];

      spikePositions.forEach(spike => {
        parts.push(`<g transform="rotate(${spike.angle}, ${spike.x}, ${spike.y})">`);
        parts.push(`<path d="M ${spike.x - 8} ${spike.y} L ${spike.x} ${spike.y - spike.size} L ${spike.x + 8} ${spike.y}" fill="#3a3a4a" opacity="0.95" />`);
        parts.push(`<path d="M ${spike.x - 5} ${spike.y - 2} L ${spike.x} ${spike.y - spike.size + 3} L ${spike.x + 5} ${spike.y - 2}" fill="#5a5a6a" opacity="0.6" />`);
        // Spike highlight
        parts.push(`<path d="M ${spike.x - 2} ${spike.y - spike.size * 0.3} L ${spike.x} ${spike.y - spike.size + 2}" stroke="#7a7a8a" stroke-width="1" opacity="0.4" />`);
        parts.push('</g>');
      });

      // The head tucked in, partially visible
      // Head position - peeking from under the shell
      parts.push('<ellipse cx="0" cy="65" rx="45" ry="35" fill="#2a2a3a" opacity="0.95" />');
      parts.push('<ellipse cx="0" cy="62" rx="40" ry="30" fill="#3a3a4a" opacity="0.85" />');

      // Helmet on head
      parts.push('<path d="M -40 55 Q -45 40 -35 35 L 35 35 Q 45 40 40 55" fill="#3a3a4a" opacity="0.95" />');
      parts.push('<path d="M -35 52 Q -38 42 -30 38 L 30 38 Q 38 42 35 52" fill="#4a4a5a" opacity="0.8" />');

      // Helmet crest
      parts.push('<path d="M 0 35 L 0 15" stroke="#4a4a5a" stroke-width="6" opacity="0.9" />');
      parts.push('<path d="M 0 18 L 0 35" stroke="#5a5a6a" stroke-width="3" opacity="0.6" />');

      // Face visor - slit eyes (closed, but with faint glow to suggest sleeping power)
      parts.push('<rect x="-30" y="50" width="60" height="8" rx="2" fill="#1a1a2a" opacity="0.9" />');

      // Glowing eyes behind visor (dormant blue glow)
      parts.push('<rect x="-22" y="51" width="16" height="5" rx="1" fill="#3355aa" opacity="0.6" />');
      parts.push('<rect x="6" y="51" width="16" height="5" rx="1" fill="#3355aa" opacity="0.6" />');
      // Eye glow aura
      parts.push('<ellipse cx="-14" cy="53" rx="14" ry="8" fill="#4466aa" opacity="0.15" />');
      parts.push('<ellipse cx="14" cy="53" rx="14" ry="8" fill="#4466aa" opacity="0.15" />');

      // Arms wrapped around / clutching (visible on sides)
      // Left arm
      parts.push('<path d="M -85 20 L -95 50 L -80 75 L -60 60 L -70 35" fill="#2a2a3a" opacity="0.95" />');
      parts.push('<path d="M -82 25 L -90 48 L -78 68 L -65 55 L -72 32" fill="#3a3a4a" opacity="0.8" />');
      // Left gauntlet
      parts.push('<rect x="-100" y="40" width="25" height="35" rx="3" fill="#3a3a4a" opacity="0.9" />');
      parts.push('<rect x="-97" y="43" width="19" height="8" fill="#4a4a5a" opacity="0.6" />');
      parts.push('<rect x="-97" y="55" width="19" height="8" fill="#4a4a5a" opacity="0.6" />');
      parts.push('<rect x="-97" y="67" width="19" height="6" fill="#4a4a5a" opacity="0.6" />');

      // Right arm
      parts.push('<path d="M 85 20 L 95 50 L 80 75 L 60 60 L 70 35" fill="#2a2a3a" opacity="0.95" />');
      parts.push('<path d="M 82 25 L 90 48 L 78 68 L 65 55 L 72 32" fill="#3a3a4a" opacity="0.8" />');
      // Right gauntlet
      parts.push('<rect x="75" y="40" width="25" height="35" rx="3" fill="#3a3a4a" opacity="0.9" />');
      parts.push('<rect x="78" y="43" width="19" height="8" fill="#4a4a5a" opacity="0.6" />');
      parts.push('<rect x="78" y="55" width="19" height="8" fill="#4a4a5a" opacity="0.6" />');
      parts.push('<rect x="78" y="67" width="19" height="6" fill="#4a4a5a" opacity="0.6" />');

      // Arm texture
      parts.push(...noisePattern(60, { x: -100, y: 20, w: 45, h: 60 },
        ['#4a4a5a', '#3a3a4a', '#5a5a6a'], [0.08, 0.2], [1, 3]));
      parts.push(...noisePattern(60, { x: 55, y: 20, w: 45, h: 60 },
        ['#4a4a5a', '#3a3a4a', '#5a5a6a'], [0.08, 0.2], [1, 3]));

      // Large weapon/axe resting alongside
      // Axe handle
      parts.push('<rect x="100" y="-40" width="12" height="130" rx="4" fill="#2a1a1a" opacity="0.95" transform="rotate(15, 106, 25)" />');
      // Axe head
      parts.push('<path d="M 115 -60 L 150 -45 L 155 -20 L 145 0 L 115 -10 Z" fill="#3a3a4a" opacity="0.95" transform="rotate(15, 130, -30)" />');
      parts.push('<path d="M 118 -55 L 145 -42 L 148 -22 L 140 -5 L 118 -12 Z" fill="#4a4a5a" opacity="0.7" transform="rotate(15, 130, -30)" />');
      // Axe edge
      parts.push('<path d="M 150 -45 L 155 -20" stroke="#5a5a6a" stroke-width="2" opacity="0.8" transform="rotate(15, 130, -30)" />');
      // Axe texture
      parts.push(...noisePattern(40, { x: 110, y: -65, w: 50, h: 70 },
        ['#5a5a6a', '#4a4a5a', '#6a6a7a'], [0.1, 0.25], [1, 3]));

      // Scratches and battle damage on armor
      parts.push('<path d="M -50 -20 L -35 0" stroke="#2a2a3a" stroke-width="2" opacity="0.4" />');
      parts.push('<path d="M 40 10 L 55 25 L 45 30" stroke="#2a2a3a" stroke-width="2" opacity="0.35" />');
      parts.push('<path d="M -20 40 L -10 55" stroke="#2a2a3a" stroke-width="1.5" opacity="0.3" />');
      parts.push('<path d="M 25 -30 L 35 -20" stroke="#2a2a3a" stroke-width="1.5" opacity="0.3" />');

      // Rivets on major armor plates
      const rivetPositions = [
        { x: -60, y: -20 }, { x: -40, y: -35 }, { x: -20, y: -45 },
        { x: 0, y: -50 }, { x: 20, y: -45 }, { x: 40, y: -35 }, { x: 60, y: -20 },
        { x: -70, y: 10 }, { x: 70, y: 10 },
        { x: -55, y: 40 }, { x: 55, y: 40 },
      ];

      rivetPositions.forEach(r => {
        parts.push(`<circle cx="${r.x}" cy="${r.y}" r="4" fill="#2a2a3a" />`);
        parts.push(`<circle cx="${r.x - 1}" cy="${r.y - 1}" r="1.5" fill="#5a5a6a" opacity="0.6" />`);
      });

      // Sleeping "Z" aura effect (subtle)
      parts.push('<text x="60" y="-40" font-size="24" fill="#4466aa" opacity="0.2">z</text>');
      parts.push('<text x="80" y="-60" font-size="32" fill="#4466aa" opacity="0.15">z</text>');
      parts.push('<text x="105" y="-85" font-size="40" fill="#4466aa" opacity="0.1">z</text>');

      // Dormant power aura
      parts.push('<ellipse cx="0" cy="30" rx="110" ry="85" fill="#4466aa" opacity="0.04" />');
      parts.push('<ellipse cx="0" cy="25" rx="95" ry="72" fill="#5577bb" opacity="0.03" />');

      return parts;
    }
  }
];

async function generateEliteArt() {
  const sharp = (await import('sharp')).default;
  const outDir = path.join(__dirname, '..', 'src', 'assets', 'art', 'enemies');

  console.log('\n=== VP-02: Act 1 Elite Sprite Replacement ===\n');
  console.log('Target: >30KB per sprite\n');

  for (const elite of ELITES) {
    const parts = elite.buildParts();
    const svg = `<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg-${elite.id}" cx="50%" cy="45%" r="70%">
      <stop offset="0%" stop-color="${elite.background.color1}" />
      <stop offset="100%" stop-color="${elite.background.color2}" />
    </radialGradient>
    <radialGradient id="glow-${elite.id}" cx="50%" cy="40%" r="45%">
      <stop offset="0%" stop-color="${elite.glowColor}" stop-opacity="0.15" />
      <stop offset="100%" stop-color="${elite.glowColor}" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="vignette" cx="50%" cy="50%" r="50%">
      <stop offset="40%" stop-color="black" stop-opacity="0" />
      <stop offset="100%" stop-color="black" stop-opacity="0.7" />
    </radialGradient>
  </defs>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#bg-${elite.id})" />
  <rect width="${SIZE}" height="${SIZE}" fill="url(#glow-${elite.id})" />
  <g transform="translate(384, 400)">
    ${parts.join('\n    ')}
  </g>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#vignette)" />
</svg>`;

    const outPath = path.join(outDir, `${elite.id}.webp`);

    // Render at high resolution and downscale for quality
    await sharp(Buffer.from(svg))
      .resize(512, 512, { kernel: 'lanczos3' })
      .webp({ quality: 100, nearLossless: true, effort: 6 })
      .toFile(outPath);

    const stats = fs.statSync(outPath);
    const sizeKB = (stats.size / 1024).toFixed(1);
    const status = stats.size > 30 * 1024 ? '✓' : '✗ (below 30KB)';
    console.log(`  ${elite.id}.webp: ${sizeKB}KB ${status}`);
  }

  console.log('\n=== Generation Complete ===\n');
  console.log('Next: Rebuild sprite sheet with: node scripts/generate-sprite-sheets.js --type=enemies\n');
}

generateEliteArt().catch(console.error);
