#!/usr/bin/env node

/**
 * VP-03: Common Enemy Sprite Replacement
 *
 * Generates high-quality art for 5 common Act 1 enemies:
 * - Cultist: Robed figure with glowing eyes, ritual pose
 * - Jaw Worm: Segmented worm with massive jagged teeth
 * - Red Louse: Red tick/parasite with multiple legs, compound eyes
 * - Fungi Beast: Mushroom-covered beast with spore clouds
 * - Automaton: Bronze construct with glowing core (Act 2 boss)
 *
 * Target: >20KB per sprite with detailed layered art
 *
 * Usage: node scripts/generate-common-enemy-art-vp03.js
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

// Generate segment/scale pattern
function segmentArc(cx, cy, startAngle, endAngle, innerR, outerR, fill, opacity) {
  const x1 = cx + Math.cos(startAngle) * innerR;
  const y1 = cy + Math.sin(startAngle) * innerR;
  const x2 = cx + Math.cos(endAngle) * innerR;
  const y2 = cy + Math.sin(endAngle) * innerR;
  const x3 = cx + Math.cos(endAngle) * outerR;
  const y3 = cy + Math.sin(endAngle) * outerR;
  const x4 = cx + Math.cos(startAngle) * outerR;
  const y4 = cy + Math.sin(startAngle) * outerR;

  return `<path d="M ${x1} ${y1} A ${innerR} ${innerR} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${outerR} ${outerR} 0 0 0 ${x4} ${y4} Z" fill="${fill}" opacity="${opacity}" />`;
}

// Generate spore particles
function sporeParticles(cx, cy, count, radius, color) {
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
  const parts = [];
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

const ENEMIES = [
  {
    id: 'cultist',
    name: 'Cultist',
    background: { color1: '#2a1a2a', color2: '#0a050a' },
    glowColor: '#aa22aa',
    buildParts: () => {
      const parts = [];

      // Ground shadow
      parts.push('<ellipse cx="0" cy="110" rx="60" ry="20" fill="#000" opacity="0.4" />');

      // Flowing robe base - very wide at bottom
      parts.push('<path d="M -70 110 Q -80 30 -30 -20 L 30 -20 Q 80 30 70 110 Z" fill="#2a1a2a" opacity="0.98" />');
      parts.push('<path d="M -65 108 Q -75 35 -28 -15 L 28 -15 Q 75 35 65 108 Z" fill="#3a2a3a" opacity="0.85" />');

      // Robe folds
      parts.push('<path d="M -50 100 Q -55 60 -35 20" stroke="#1a0a1a" stroke-width="3" fill="none" opacity="0.5" />');
      parts.push('<path d="M -30 105 Q -35 50 -20 10" stroke="#1a0a1a" stroke-width="2" fill="none" opacity="0.4" />');
      parts.push('<path d="M 50 100 Q 55 60 35 20" stroke="#1a0a1a" stroke-width="3" fill="none" opacity="0.5" />');
      parts.push('<path d="M 30 105 Q 35 50 20 10" stroke="#1a0a1a" stroke-width="2" fill="none" opacity="0.4" />');
      parts.push('<path d="M 0 108 Q 5 70 0 30" stroke="#1a0a1a" stroke-width="2" fill="none" opacity="0.35" />');

      // Robe texture
      parts.push(...noisePattern(NOISE_DENSITY, { x: -80, y: -30, w: 160, h: 145 },
        ['#4a3a4a', '#3a2a3a', '#5a4a5a', '#2a1a2a'], [0.05, 0.15], [1, 4]));

      // Hood
      parts.push(blobShape(0, -40, 45, 10, 0.1, '#2a1a2a', 0.98));
      parts.push(blobShape(0, -42, 40, 8, 0.08, '#3a2a3a', 0.85));

      // Hood shadow (face area is dark)
      parts.push('<ellipse cx="0" cy="-35" rx="32" ry="28" fill="#0a0505" opacity="0.95" />');

      // Hood texture
      parts.push(...noisePattern(100, { x: -45, y: -85, w: 90, h: 70 },
        ['#4a3a4a', '#3a2a3a', '#5a4a5a'], [0.06, 0.18], [1, 3]));

      // Glowing eyes in hood shadow
      parts.push('<ellipse cx="-15" cy="-40" rx="8" ry="5" fill="#dd22dd" opacity="0.9" />');
      parts.push('<ellipse cx="15" cy="-40" rx="8" ry="5" fill="#dd22dd" opacity="0.9" />');
      parts.push('<ellipse cx="-15" cy="-40" rx="5" ry="3" fill="#ff66ff" opacity="0.8" />');
      parts.push('<ellipse cx="15" cy="-40" rx="5" ry="3" fill="#ff66ff" opacity="0.8" />');
      parts.push('<ellipse cx="-15" cy="-40" rx="2" ry="1" fill="#ffffff" opacity="0.6" />');
      parts.push('<ellipse cx="15" cy="-40" rx="2" ry="1" fill="#ffffff" opacity="0.6" />');
      // Eye glow aura
      parts.push('<ellipse cx="-15" cy="-40" rx="18" ry="12" fill="#dd22dd" opacity="0.15" />');
      parts.push('<ellipse cx="15" cy="-40" rx="18" ry="12" fill="#dd22dd" opacity="0.15" />');
      parts.push('<ellipse cx="0" cy="-40" rx="45" ry="25" fill="#aa22aa" opacity="0.08" />');

      // Arms raised in ritual pose
      // Left arm - raised up
      parts.push('<path d="M -30 -10 Q -55 -30 -60 -70 L -50 -75 Q -45 -40 -25 -15" fill="#2a1a2a" opacity="0.95" />');
      parts.push('<path d="M -32 -12 Q -52 -32 -55 -68 L -52 -70 Q -48 -42 -28 -17" fill="#3a2a3a" opacity="0.8" />');
      // Left hand with clawed fingers
      parts.push('<ellipse cx="-55" cy="-80" rx="12" ry="10" fill="#5a4a5a" opacity="0.9" />');
      for (let i = 0; i < 5; i++) {
        const angle = -Math.PI * 0.7 + (i / 4) * Math.PI * 0.6;
        const x = -55 + Math.cos(angle) * 10;
        const y = -80 + Math.sin(angle) * 8;
        const tipX = -55 + Math.cos(angle) * 20;
        const tipY = -80 + Math.sin(angle) * 16;
        parts.push(`<path d="M ${x} ${y} Q ${(x + tipX) / 2 + 2} ${(y + tipY) / 2} ${tipX} ${tipY}" stroke="#4a3a4a" stroke-width="3" fill="none" opacity="0.9" />`);
      }

      // Right arm - raised up
      parts.push('<path d="M 30 -10 Q 55 -30 60 -70 L 50 -75 Q 45 -40 25 -15" fill="#2a1a2a" opacity="0.95" />');
      parts.push('<path d="M 32 -12 Q 52 -32 55 -68 L 52 -70 Q 48 -42 28 -17" fill="#3a2a3a" opacity="0.8" />');
      // Right hand with clawed fingers
      parts.push('<ellipse cx="55" cy="-80" rx="12" ry="10" fill="#5a4a5a" opacity="0.9" />');
      for (let i = 0; i < 5; i++) {
        const angle = Math.PI * 0.1 + (i / 4) * Math.PI * 0.6;
        const x = 55 + Math.cos(angle) * 10;
        const y = -80 + Math.sin(angle) * 8;
        const tipX = 55 + Math.cos(angle) * 20;
        const tipY = -80 + Math.sin(angle) * 16;
        parts.push(`<path d="M ${x} ${y} Q ${(x + tipX) / 2 - 2} ${(y + tipY) / 2} ${tipX} ${tipY}" stroke="#4a3a4a" stroke-width="3" fill="none" opacity="0.9" />`);
      }

      // Arm texture
      parts.push(...noisePattern(60, { x: -70, y: -85, w: 35, h: 80 },
        ['#4a3a4a', '#3a2a3a', '#5a4a5a'], [0.08, 0.2], [1, 3]));
      parts.push(...noisePattern(60, { x: 35, y: -85, w: 35, h: 80 },
        ['#4a3a4a', '#3a2a3a', '#5a4a5a'], [0.08, 0.2], [1, 3]));

      // Ritual markings on robe
      parts.push('<path d="M -25 40 L 0 60 L 25 40 L 0 80 Z" stroke="#aa22aa" stroke-width="2" fill="none" opacity="0.4" />');
      parts.push('<circle cx="0" cy="60" r="8" stroke="#aa22aa" stroke-width="1.5" fill="none" opacity="0.35" />');
      parts.push('<circle cx="0" cy="60" r="15" stroke="#dd22dd" stroke-width="1" fill="none" opacity="0.25" />');

      // Mystical energy rising from hands
      parts.push(...sporeParticles(-55, -90, 20, 25, '#dd44dd'));
      parts.push(...sporeParticles(55, -90, 20, 25, '#dd44dd'));

      // Ritual power aura
      parts.push('<ellipse cx="0" cy="20" rx="90" ry="100" fill="#aa22aa" opacity="0.04" />');
      parts.push('<ellipse cx="0" cy="-10" rx="70" ry="80" fill="#dd22dd" opacity="0.03" />');

      return parts;
    }
  },
  {
    id: 'jawWorm',
    name: 'Jaw Worm',
    background: { color1: '#2a2a1a', color2: '#0a0a05' },
    glowColor: '#aa6622',
    buildParts: () => {
      const parts = [];

      // Ground shadow
      parts.push('<ellipse cx="0" cy="100" rx="100" ry="25" fill="#000" opacity="0.4" />');

      // Tail segments (back to front for proper layering)
      const segments = [
        { x: 80, y: 50, rx: 22, ry: 18 },
        { x: 55, y: 45, rx: 28, ry: 22 },
        { x: 25, y: 38, rx: 35, ry: 28 },
        { x: -10, y: 30, rx: 42, ry: 35 },
        { x: -50, y: 20, rx: 50, ry: 42 },
      ];

      // Draw segments back to front
      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        // Main segment body
        parts.push(`<ellipse cx="${seg.x}" cy="${seg.y}" rx="${seg.rx}" ry="${seg.ry}" fill="#6a5a4a" opacity="0.95" />`);
        parts.push(`<ellipse cx="${seg.x - 3}" cy="${seg.y - 5}" rx="${seg.rx * 0.85}" ry="${seg.ry * 0.8}" fill="#7a6a5a" opacity="0.8" />`);
        parts.push(`<ellipse cx="${seg.x - 5}" cy="${seg.y - 8}" rx="${seg.rx * 0.6}" ry="${seg.ry * 0.55}" fill="#8a7a6a" opacity="0.5" />`);

        // Segment ridge/spine
        parts.push(`<ellipse cx="${seg.x}" cy="${seg.y - seg.ry * 0.7}" rx="${seg.rx * 0.3}" ry="6" fill="#5a4a3a" opacity="0.6" />`);
      }

      // Segment textures
      for (const seg of segments) {
        parts.push(...noisePattern(60, {
          x: seg.x - seg.rx,
          y: seg.y - seg.ry,
          w: seg.rx * 2,
          h: seg.ry * 2
        }, ['#8a7a6a', '#7a6a5a', '#9a8a7a', '#6a5a4a'], [0.08, 0.2], [1, 4]));
      }

      // Head segment - largest and most detailed
      parts.push('<ellipse cx="-90" cy="5" rx="60" ry="55" fill="#6a5a4a" opacity="0.98" />');
      parts.push('<ellipse cx="-93" cy="0" rx="55" ry="48" fill="#7a6a5a" opacity="0.9" />');
      parts.push('<ellipse cx="-95" cy="-5" rx="45" ry="38" fill="#8a7a6a" opacity="0.7" />');

      // Head texture
      parts.push(...noisePattern(150, { x: -150, y: -55, w: 120, h: 120 },
        ['#8a7a6a', '#7a6a5a', '#9a8a7a', '#6a5a4a', '#aa9a8a'], [0.06, 0.18], [1, 4]));

      // Massive jaw structure
      // Upper jaw
      parts.push('<path d="M -150 -10 Q -170 -5 -175 15 Q -165 25 -140 20 Q -120 15 -100 5" fill="#5a4a3a" opacity="0.95" />');
      parts.push('<path d="M -148 -8 Q -165 -3 -170 12 Q -162 20 -142 17 Q -122 12 -105 5" fill="#6a5a4a" opacity="0.8" />');

      // Lower jaw
      parts.push('<path d="M -150 25 Q -170 30 -175 50 Q -160 60 -130 55 Q -100 45 -85 25" fill="#5a4a3a" opacity="0.95" />');
      parts.push('<path d="M -145 28 Q -162 32 -168 48 Q -155 55 -132 52 Q -105 43 -90 27" fill="#6a5a4a" opacity="0.8" />');

      // Jagged teeth - upper jaw
      const upperTeeth = [
        { x: -165, y: 8, h: 18 },
        { x: -155, y: 5, h: 22 },
        { x: -145, y: 8, h: 16 },
        { x: -135, y: 5, h: 20 },
        { x: -125, y: 7, h: 15 },
        { x: -115, y: 5, h: 18 },
      ];
      for (const tooth of upperTeeth) {
        parts.push(`<path d="M ${tooth.x - 4} ${tooth.y} L ${tooth.x} ${tooth.y + tooth.h} L ${tooth.x + 4} ${tooth.y}" fill="#ddc" opacity="0.95" />`);
        parts.push(`<path d="M ${tooth.x - 2} ${tooth.y + 2} L ${tooth.x} ${tooth.y + tooth.h - 2}" stroke="#aaa" stroke-width="1" opacity="0.4" />`);
      }

      // Jagged teeth - lower jaw
      const lowerTeeth = [
        { x: -160, y: 45, h: -16 },
        { x: -150, y: 48, h: -20 },
        { x: -140, y: 45, h: -18 },
        { x: -130, y: 48, h: -15 },
        { x: -120, y: 46, h: -17 },
        { x: -110, y: 48, h: -14 },
      ];
      for (const tooth of lowerTeeth) {
        parts.push(`<path d="M ${tooth.x - 4} ${tooth.y} L ${tooth.x} ${tooth.y + tooth.h} L ${tooth.x + 4} ${tooth.y}" fill="#ddc" opacity="0.95" />`);
        parts.push(`<path d="M ${tooth.x - 2} ${tooth.y - 2} L ${tooth.x} ${tooth.y + tooth.h + 2}" stroke="#aaa" stroke-width="1" opacity="0.4" />`);
      }

      // Gums/mouth interior
      parts.push('<ellipse cx="-135" cy="28" rx="25" ry="12" fill="#4a2a2a" opacity="0.9" />');

      // Eyes - small, beady, positioned on head
      parts.push('<ellipse cx="-70" cy="-20" rx="12" ry="10" fill="#1a1a0a" opacity="0.95" />');
      parts.push('<ellipse cx="-70" cy="-20" rx="8" ry="6" fill="#aa6622" opacity="0.9" />');
      parts.push('<ellipse cx="-70" cy="-20" rx="4" ry="3" fill="#ffaa44" opacity="0.8" />');
      parts.push('<ellipse cx="-71" cy="-21" rx="2" ry="1.5" fill="#fff" opacity="0.5" />');
      // Second eye
      parts.push('<ellipse cx="-100" cy="-30" rx="10" ry="8" fill="#1a1a0a" opacity="0.95" />');
      parts.push('<ellipse cx="-100" cy="-30" rx="6" ry="5" fill="#aa6622" opacity="0.9" />');
      parts.push('<ellipse cx="-100" cy="-30" rx="3" ry="2" fill="#ffaa44" opacity="0.8" />');

      // Eye glow
      parts.push('<ellipse cx="-70" cy="-20" rx="18" ry="14" fill="#aa6622" opacity="0.12" />');
      parts.push('<ellipse cx="-100" cy="-30" rx="15" ry="12" fill="#aa6622" opacity="0.1" />');

      // Tail spike
      parts.push('<path d="M 95 55 L 120 45 L 95 40" fill="#5a4a3a" opacity="0.9" />');
      parts.push('<path d="M 98 52 L 115 46 L 98 43" fill="#6a5a4a" opacity="0.7" />');

      // Slime/drool from mouth
      parts.push('<path d="M -150 60 Q -145 75 -140 90" stroke="#8a9a6a" stroke-width="3" fill="none" opacity="0.4" />');
      parts.push('<ellipse cx="-140" cy="92" rx="5" ry="8" fill="#8a9a6a" opacity="0.35" />');

      // Aggression aura
      parts.push('<ellipse cx="-40" cy="30" rx="120" ry="80" fill="#aa6622" opacity="0.04" />');

      return parts;
    }
  },
  {
    id: 'louse_red',
    name: 'Red Louse',
    background: { color1: '#2a1a1a', color2: '#0a0505' },
    glowColor: '#cc3322',
    buildParts: () => {
      const parts = [];

      // Ground shadow
      parts.push('<ellipse cx="0" cy="90" rx="80" ry="22" fill="#000" opacity="0.4" />');

      // Legs - 6 total, 3 on each side
      const legPositions = [
        { side: -1, y: 50, angle: -30, length: 55 },
        { side: -1, y: 30, angle: -15, length: 60 },
        { side: -1, y: 10, angle: 5, length: 50 },
        { side: 1, y: 50, angle: 30, length: 55 },
        { side: 1, y: 30, angle: 15, length: 60 },
        { side: 1, y: 10, angle: -5, length: 50 },
      ];

      for (const leg of legPositions) {
        const startX = leg.side * 45;
        const startY = leg.y;
        const midX = startX + leg.side * leg.length * 0.6;
        const midY = startY + 15;
        const endX = startX + leg.side * leg.length;
        const endY = startY + 35;

        parts.push(`<path d="M ${startX} ${startY} Q ${midX} ${startY - 10} ${midX} ${midY} Q ${midX + leg.side * 10} ${midY + 15} ${endX} ${endY}" stroke="#4a2a2a" stroke-width="8" fill="none" opacity="0.95" />`);
        parts.push(`<path d="M ${startX} ${startY} Q ${midX} ${startY - 10} ${midX} ${midY} Q ${midX + leg.side * 10} ${midY + 15} ${endX} ${endY}" stroke="#6a3a3a" stroke-width="5" fill="none" opacity="0.7" />`);
        // Leg joint
        parts.push(`<circle cx="${midX}" cy="${midY}" r="6" fill="#5a3a3a" opacity="0.9" />`);
        // Foot claw
        parts.push(`<ellipse cx="${endX}" cy="${endY}" rx="6" ry="4" fill="#3a2a2a" opacity="0.9" />`);
      }

      // Main body - tick-like oval
      parts.push('<ellipse cx="0" cy="30" rx="55" ry="50" fill="#8a3a3a" opacity="0.98" />');
      parts.push('<ellipse cx="-5" cy="25" rx="48" ry="43" fill="#9a4a4a" opacity="0.9" />');
      parts.push('<ellipse cx="-8" cy="20" rx="38" ry="33" fill="#aa5a5a" opacity="0.75" />');

      // Body segments/ridges
      for (let i = 0; i < 5; i++) {
        const y = -10 + i * 18;
        parts.push(`<ellipse cx="0" cy="${y}" rx="${48 - i * 3}" ry="4" fill="#7a3a3a" opacity="0.4" />`);
      }

      // Body texture
      parts.push(...noisePattern(NOISE_DENSITY, { x: -55, y: -25, w: 110, h: 110 },
        ['#aa5a5a', '#9a4a4a', '#ba6a6a', '#8a3a3a', '#ca7a7a'], [0.06, 0.18], [1, 4]));

      // Head section
      parts.push('<ellipse cx="0" cy="-40" rx="35" ry="28" fill="#8a3a3a" opacity="0.98" />');
      parts.push('<ellipse cx="-3" cy="-43" rx="30" ry="23" fill="#9a4a4a" opacity="0.85" />');

      // Head texture
      parts.push(...noisePattern(80, { x: -35, y: -70, w: 70, h: 55 },
        ['#aa5a5a', '#9a4a4a', '#ba6a6a'], [0.08, 0.2], [1, 3]));

      // Compound eyes - multiple facets
      // Left eye cluster
      const leftEyeX = -20;
      const leftEyeY = -45;
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          const x = leftEyeX - 8 + col * 8;
          const y = leftEyeY - 6 + row * 6;
          parts.push(`<ellipse cx="${x}" cy="${y}" rx="4" ry="3" fill="#220a0a" opacity="0.95" />`);
          parts.push(`<ellipse cx="${x - 1}" cy="${y - 1}" rx="2" ry="1.5" fill="#cc3322" opacity="0.7" />`);
        }
      }
      // Right eye cluster
      const rightEyeX = 20;
      const rightEyeY = -45;
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          const x = rightEyeX - 8 + col * 8;
          const y = rightEyeY - 6 + row * 6;
          parts.push(`<ellipse cx="${x}" cy="${y}" rx="4" ry="3" fill="#220a0a" opacity="0.95" />`);
          parts.push(`<ellipse cx="${x - 1}" cy="${y - 1}" rx="2" ry="1.5" fill="#cc3322" opacity="0.7" />`);
        }
      }
      // Eye glow
      parts.push(`<ellipse cx="${leftEyeX}" cy="${leftEyeY}" rx="18" ry="14" fill="#cc3322" opacity="0.12" />`);
      parts.push(`<ellipse cx="${rightEyeX}" cy="${rightEyeY}" rx="18" ry="14" fill="#cc3322" opacity="0.12" />`);

      // Mandibles/pincers
      parts.push('<path d="M -15 -60 Q -25 -75 -20 -85 Q -12 -88 -10 -75 Q -8 -65 -12 -58" fill="#5a2a2a" opacity="0.95" />');
      parts.push('<path d="M 15 -60 Q 25 -75 20 -85 Q 12 -88 10 -75 Q 8 -65 12 -58" fill="#5a2a2a" opacity="0.95" />');
      parts.push('<path d="M -13 -62 Q -22 -73 -18 -82" stroke="#6a3a3a" stroke-width="2" fill="none" opacity="0.6" />');
      parts.push('<path d="M 13 -62 Q 22 -73 18 -82" stroke="#6a3a3a" stroke-width="2" fill="none" opacity="0.6" />');

      // Antennae
      parts.push('<path d="M -8 -65 Q -20 -90 -15 -100" stroke="#6a3a3a" stroke-width="3" fill="none" opacity="0.9" />');
      parts.push('<path d="M 8 -65 Q 20 -90 15 -100" stroke="#6a3a3a" stroke-width="3" fill="none" opacity="0.9" />');
      parts.push('<circle cx="-15" cy="-100" r="4" fill="#8a4a4a" opacity="0.9" />');
      parts.push('<circle cx="15" cy="-100" r="4" fill="#8a4a4a" opacity="0.9" />');

      // Back spines
      for (let i = 0; i < 4; i++) {
        const x = -20 + i * 13;
        const baseY = -15 + Math.abs(i - 1.5) * 5;
        parts.push(`<path d="M ${x - 4} ${baseY} L ${x} ${baseY - 20 - Math.random() * 10} L ${x + 4} ${baseY}" fill="#6a3a3a" opacity="0.8" />`);
      }

      // Aggression aura
      parts.push('<ellipse cx="0" cy="20" rx="80" ry="70" fill="#cc3322" opacity="0.04" />');

      return parts;
    }
  },
  {
    id: 'fungiBeast',
    name: 'Fungi Beast',
    background: { color1: '#1a2a1a', color2: '#050a05' },
    glowColor: '#66aa44',
    buildParts: () => {
      const parts = [];

      // Ground shadow
      parts.push('<ellipse cx="0" cy="105" rx="90" ry="25" fill="#000" opacity="0.45" />');

      // Spore cloud effect (background)
      parts.push(...sporeParticles(0, 0, 80, 120, '#88aa66'));
      parts.push(...sporeParticles(-30, -40, 40, 60, '#99bb77'));
      parts.push(...sporeParticles(40, -30, 40, 50, '#77aa55'));

      // Legs - thick, fungal
      // Left leg
      parts.push('<path d="M -40 50 L -55 90 L -45 105 L -25 90 L -30 50" fill="#4a5a3a" opacity="0.95" />');
      parts.push('<path d="M -38 52 L -50 85 L -43 98 L -30 85 L -32 52" fill="#5a6a4a" opacity="0.8" />');
      // Right leg
      parts.push('<path d="M 30 50 L 45 90 L 55 105 L 60 90 L 45 50" fill="#4a5a3a" opacity="0.95" />');
      parts.push('<path d="M 32 52 L 48 85 L 52 98 L 55 85 L 43 52" fill="#5a6a4a" opacity="0.8" />');

      // Leg texture
      parts.push(...noisePattern(60, { x: -60, y: 50, w: 40, h: 55 },
        ['#6a7a5a', '#5a6a4a', '#7a8a6a'], [0.1, 0.25], [1, 3]));
      parts.push(...noisePattern(60, { x: 25, y: 50, w: 40, h: 55 },
        ['#6a7a5a', '#5a6a4a', '#7a8a6a'], [0.1, 0.25], [1, 3]));

      // Main body - bulbous, organic
      parts.push(blobShape(0, 20, 65, 12, 0.18, '#4a5a3a', 0.98));
      parts.push(blobShape(-5, 15, 58, 10, 0.15, '#5a6a4a', 0.9));
      parts.push(blobShape(-8, 10, 48, 10, 0.12, '#6a7a5a', 0.75));

      // Body texture
      parts.push(...noisePattern(NOISE_DENSITY, { x: -70, y: -55, w: 140, h: 130 },
        ['#6a7a5a', '#5a6a4a', '#7a8a6a', '#4a5a3a', '#8a9a7a'], [0.06, 0.18], [1, 4]));

      // Fungal growths/mushrooms on body
      const mushrooms = [
        { x: -45, y: -20, size: 1.2 },
        { x: -30, y: -40, size: 1.5 },
        { x: -10, y: -55, size: 1.8 },
        { x: 20, y: -45, size: 1.4 },
        { x: 40, y: -25, size: 1.3 },
        { x: 35, y: 5, size: 1.0 },
        { x: -50, y: 10, size: 0.9 },
        { x: 0, y: -35, size: 1.6 },
      ];

      for (const m of mushrooms) {
        const capR = 12 * m.size;
        const stemH = 15 * m.size;
        const stemW = 5 * m.size;

        // Stem
        parts.push(`<rect x="${m.x - stemW}" y="${m.y}" width="${stemW * 2}" height="${stemH}" rx="${stemW * 0.3}" fill="#7a8a6a" opacity="0.9" />`);
        parts.push(`<rect x="${m.x - stemW * 0.6}" y="${m.y + 2}" width="${stemW * 1.2}" height="${stemH - 4}" fill="#8a9a7a" opacity="0.6" />`);

        // Cap
        parts.push(`<ellipse cx="${m.x}" cy="${m.y - capR * 0.3}" rx="${capR}" ry="${capR * 0.6}" fill="#aa6644" opacity="0.95" />`);
        parts.push(`<ellipse cx="${m.x - capR * 0.15}" cy="${m.y - capR * 0.4}" rx="${capR * 0.75}" ry="${capR * 0.45}" fill="#bb7755" opacity="0.7" />`);

        // Spots on cap
        for (let i = 0; i < 3; i++) {
          const spotX = m.x - capR * 0.5 + Math.random() * capR;
          const spotY = m.y - capR * 0.5 + Math.random() * capR * 0.4;
          const spotR = 2 + Math.random() * 3;
          parts.push(`<ellipse cx="${spotX}" cy="${spotY}" rx="${spotR}" ry="${spotR * 0.7}" fill="#ddc" opacity="0.6" />`);
        }
      }

      // Arms - stubby, muscular
      // Left arm
      parts.push('<path d="M -55 -5 L -85 -20 L -95 0 L -80 15 L -55 10" fill="#4a5a3a" opacity="0.95" />');
      parts.push('<path d="M -57 -2 L -80 -15 L -88 2 L -77 12 L -57 8" fill="#5a6a4a" opacity="0.8" />');
      // Right arm
      parts.push('<path d="M 50 -5 L 80 -25 L 95 -5 L 85 15 L 55 10" fill="#4a5a3a" opacity="0.95" />');
      parts.push('<path d="M 52 -2 L 77 -20 L 88 -3 L 80 12 L 55 8" fill="#5a6a4a" opacity="0.8" />');

      // Arm texture
      parts.push(...noisePattern(50, { x: -100, y: -30, w: 55, h: 55 },
        ['#6a7a5a', '#5a6a4a', '#7a8a6a'], [0.1, 0.25], [1, 3]));
      parts.push(...noisePattern(50, { x: 50, y: -35, w: 55, h: 55 },
        ['#6a7a5a', '#5a6a4a', '#7a8a6a'], [0.1, 0.25], [1, 3]));

      // Fists/claws
      parts.push('<ellipse cx="-92" cy="5" rx="14" ry="12" fill="#5a6a4a" opacity="0.95" />');
      parts.push('<ellipse cx="90" cy="0" rx="14" ry="12" fill="#5a6a4a" opacity="0.95" />');

      // Head - small compared to body
      parts.push(blobShape(-5, -70, 28, 8, 0.12, '#4a5a3a', 0.98));
      parts.push(blobShape(-7, -72, 24, 7, 0.1, '#5a6a4a', 0.85));

      // Head texture
      parts.push(...noisePattern(50, { x: -35, y: -100, w: 60, h: 55 },
        ['#6a7a5a', '#5a6a4a', '#7a8a6a'], [0.08, 0.22], [1, 3]));

      // Eyes - glowing, infected-looking
      parts.push('<ellipse cx="-15" cy="-75" rx="8" ry="6" fill="#1a2a0a" opacity="0.95" />');
      parts.push('<ellipse cx="10" cy="-75" rx="8" ry="6" fill="#1a2a0a" opacity="0.95" />');
      parts.push('<ellipse cx="-15" cy="-75" rx="5" ry="4" fill="#88cc44" opacity="0.9" />');
      parts.push('<ellipse cx="10" cy="-75" rx="5" ry="4" fill="#88cc44" opacity="0.9" />');
      parts.push('<ellipse cx="-15" cy="-75" rx="2" ry="1.5" fill="#ccff88" opacity="0.8" />');
      parts.push('<ellipse cx="10" cy="-75" rx="2" ry="1.5" fill="#ccff88" opacity="0.8" />');
      // Eye glow
      parts.push('<ellipse cx="-15" cy="-75" rx="14" ry="10" fill="#88cc44" opacity="0.15" />');
      parts.push('<ellipse cx="10" cy="-75" rx="14" ry="10" fill="#88cc44" opacity="0.15" />');

      // Mouth - gaping, drooling
      parts.push('<path d="M -8 -60 Q -5 -52 8 -60" stroke="#2a3a1a" stroke-width="3" fill="none" opacity="0.7" />');
      // Drool/spores
      parts.push('<path d="M 0 -55 Q 3 -45 0 -35" stroke="#88aa66" stroke-width="2" fill="none" opacity="0.4" />');

      // More intense spore cloud around
      parts.push(...sporeParticles(0, -50, 30, 80, '#aacc88'));

      // Toxic aura
      parts.push('<ellipse cx="0" cy="0" rx="100" ry="90" fill="#66aa44" opacity="0.05" />');
      parts.push('<ellipse cx="0" cy="-20" rx="80" ry="70" fill="#88cc66" opacity="0.04" />');

      return parts;
    }
  },
  {
    id: 'automaton',
    name: 'Automaton',
    background: { color1: '#2a2a2a', color2: '#0a0a0a' },
    glowColor: '#ff8844',
    buildParts: () => {
      const parts = [];

      // Ground shadow
      parts.push('<ellipse cx="0" cy="120" rx="100" ry="30" fill="#000" opacity="0.5" />');

      // Legs - heavy mechanical
      // Left leg
      parts.push('<rect x="-50" y="50" width="30" height="70" rx="5" fill="#5a4a3a" opacity="0.95" />');
      parts.push('<rect x="-47" y="55" width="24" height="30" fill="#6a5a4a" opacity="0.7" />');
      parts.push('<rect x="-47" y="90" width="24" height="25" fill="#6a5a4a" opacity="0.7" />');
      // Left leg joints
      parts.push('<ellipse cx="-35" cy="52" rx="18" ry="10" fill="#4a3a2a" opacity="0.9" />');
      parts.push('<ellipse cx="-35" cy="88" rx="16" ry="8" fill="#4a3a2a" opacity="0.9" />');
      // Left foot
      parts.push('<rect x="-55" y="115" width="40" height="12" rx="4" fill="#5a4a3a" opacity="0.95" />');

      // Right leg
      parts.push('<rect x="20" y="50" width="30" height="70" rx="5" fill="#5a4a3a" opacity="0.95" />');
      parts.push('<rect x="23" y="55" width="24" height="30" fill="#6a5a4a" opacity="0.7" />');
      parts.push('<rect x="23" y="90" width="24" height="25" fill="#6a5a4a" opacity="0.7" />');
      // Right leg joints
      parts.push('<ellipse cx="35" cy="52" rx="18" ry="10" fill="#4a3a2a" opacity="0.9" />');
      parts.push('<ellipse cx="35" cy="88" rx="16" ry="8" fill="#4a3a2a" opacity="0.9" />');
      // Right foot
      parts.push('<rect x="15" y="115" width="40" height="12" rx="4" fill="#5a4a3a" opacity="0.95" />');

      // Leg rivets
      for (let y = 60; y < 115; y += 15) {
        parts.push(`<circle cx="-48" cy="${y}" r="3" fill="#3a2a1a" />`);
        parts.push(`<circle cx="-22" cy="${y}" r="3" fill="#3a2a1a" />`);
        parts.push(`<circle cx="22" cy="${y}" r="3" fill="#3a2a1a" />`);
        parts.push(`<circle cx="48" cy="${y}" r="3" fill="#3a2a1a" />`);
      }

      // Torso - barrel-shaped bronze construct
      parts.push('<ellipse cx="0" cy="15" rx="70" ry="55" fill="#6a5a4a" opacity="0.98" />');
      parts.push('<ellipse cx="-5" cy="10" rx="62" ry="48" fill="#7a6a5a" opacity="0.9" />');
      parts.push('<ellipse cx="-8" cy="5" rx="50" ry="38" fill="#8a7a6a" opacity="0.7" />');

      // Torso plating
      parts.push('<rect x="-55" y="-25" width="110" height="12" rx="3" fill="#5a4a3a" opacity="0.8" />');
      parts.push('<rect x="-55" y="-5" width="110" height="12" rx="3" fill="#5a4a3a" opacity="0.8" />');
      parts.push('<rect x="-55" y="15" width="110" height="12" rx="3" fill="#5a4a3a" opacity="0.8" />');
      parts.push('<rect x="-55" y="35" width="110" height="12" rx="3" fill="#5a4a3a" opacity="0.8" />');

      // Torso texture
      parts.push(...noisePattern(NOISE_DENSITY, { x: -70, y: -45, w: 140, h: 115 },
        ['#8a7a6a', '#7a6a5a', '#9a8a7a', '#6a5a4a'], [0.05, 0.14], [1, 3]));

      // Central core - glowing power source
      parts.push('<ellipse cx="0" cy="10" rx="25" ry="22" fill="#1a1a1a" opacity="0.95" />');
      parts.push('<ellipse cx="0" cy="10" rx="20" ry="18" fill="#ff6622" opacity="0.9" />');
      parts.push('<ellipse cx="0" cy="10" rx="15" ry="13" fill="#ff8844" opacity="0.85" />');
      parts.push('<ellipse cx="0" cy="10" rx="10" ry="8" fill="#ffaa66" opacity="0.8" />');
      parts.push('<ellipse cx="0" cy="8" rx="5" ry="4" fill="#ffcc88" opacity="0.7" />');
      // Core glow
      parts.push('<ellipse cx="0" cy="10" rx="40" ry="35" fill="#ff6622" opacity="0.2" />');
      parts.push('<ellipse cx="0" cy="10" rx="55" ry="48" fill="#ff8844" opacity="0.1" />');

      // Arms - heavy mechanical
      // Left arm
      parts.push('<rect x="-105" y="-30" width="45" height="25" rx="8" fill="#5a4a3a" opacity="0.95" transform="rotate(-15, -82, -17)" />');
      parts.push('<rect x="-100" y="-27" width="35" height="19" fill="#6a5a4a" opacity="0.7" transform="rotate(-15, -82, -17)" />');
      // Left forearm
      parts.push('<rect x="-130" y="0" width="40" height="22" rx="6" fill="#5a4a3a" opacity="0.95" transform="rotate(20, -110, 11)" />');
      // Left hand/claw
      parts.push('<ellipse cx="-135" cy="25" rx="20" ry="18" fill="#5a4a3a" opacity="0.95" />');
      parts.push('<ellipse cx="-135" cy="25" rx="15" ry="13" fill="#6a5a4a" opacity="0.8" />');
      // Claw fingers
      parts.push('<path d="M -150 15 L -165 5" stroke="#4a3a2a" stroke-width="6" opacity="0.95" />');
      parts.push('<path d="M -145 10 L -160 -5" stroke="#4a3a2a" stroke-width="6" opacity="0.95" />');
      parts.push('<path d="M -140 35 L -155 50" stroke="#4a3a2a" stroke-width="6" opacity="0.95" />');

      // Right arm
      parts.push('<rect x="60" y="-30" width="45" height="25" rx="8" fill="#5a4a3a" opacity="0.95" transform="rotate(15, 82, -17)" />');
      parts.push('<rect x="65" y="-27" width="35" height="19" fill="#6a5a4a" opacity="0.7" transform="rotate(15, 82, -17)" />');
      // Right forearm
      parts.push('<rect x="90" y="0" width="40" height="22" rx="6" fill="#5a4a3a" opacity="0.95" transform="rotate(-20, 110, 11)" />');
      // Right hand/claw
      parts.push('<ellipse cx="135" cy="25" rx="20" ry="18" fill="#5a4a3a" opacity="0.95" />');
      parts.push('<ellipse cx="135" cy="25" rx="15" ry="13" fill="#6a5a4a" opacity="0.8" />');
      // Claw fingers
      parts.push('<path d="M 150 15 L 165 5" stroke="#4a3a2a" stroke-width="6" opacity="0.95" />');
      parts.push('<path d="M 145 10 L 160 -5" stroke="#4a3a2a" stroke-width="6" opacity="0.95" />');
      parts.push('<path d="M 140 35 L 155 50" stroke="#4a3a2a" stroke-width="6" opacity="0.95" />');

      // Arm joints
      parts.push('<circle cx="-65" cy="-15" r="12" fill="#4a3a2a" opacity="0.9" />');
      parts.push('<circle cx="-105" cy="5" r="10" fill="#4a3a2a" opacity="0.9" />');
      parts.push('<circle cx="65" cy="-15" r="12" fill="#4a3a2a" opacity="0.9" />');
      parts.push('<circle cx="105" cy="5" r="10" fill="#4a3a2a" opacity="0.9" />');

      // Arm texture
      parts.push(...noisePattern(80, { x: -170, y: -40, w: 80, h: 100 },
        ['#7a6a5a', '#6a5a4a', '#8a7a6a'], [0.08, 0.2], [1, 3]));
      parts.push(...noisePattern(80, { x: 90, y: -40, w: 80, h: 100 },
        ['#7a6a5a', '#6a5a4a', '#8a7a6a'], [0.08, 0.2], [1, 3]));

      // Head - mechanical dome
      parts.push('<ellipse cx="0" cy="-55" rx="40" ry="35" fill="#5a4a3a" opacity="0.98" />');
      parts.push('<ellipse cx="-3" cy="-58" rx="35" ry="30" fill="#6a5a4a" opacity="0.9" />');
      parts.push('<ellipse cx="-5" cy="-60" rx="28" ry="24" fill="#7a6a5a" opacity="0.75" />');

      // Head texture
      parts.push(...noisePattern(80, { x: -40, y: -95, w: 80, h: 70 },
        ['#8a7a6a', '#7a6a5a', '#9a8a7a'], [0.06, 0.18], [1, 3]));

      // Face plate
      parts.push('<rect x="-28" y="-70" width="56" height="35" rx="5" fill="#4a3a2a" opacity="0.9" />');
      parts.push('<rect x="-24" y="-66" width="48" height="27" fill="#5a4a3a" opacity="0.7" />');

      // Eyes - glowing mechanical
      parts.push('<rect x="-22" y="-62" width="16" height="10" rx="2" fill="#1a1a0a" opacity="0.95" />');
      parts.push('<rect x="6" y="-62" width="16" height="10" rx="2" fill="#1a1a0a" opacity="0.95" />');
      parts.push('<rect x="-20" y="-60" width="12" height="6" fill="#ff6622" opacity="0.9" />');
      parts.push('<rect x="8" y="-60" width="12" height="6" fill="#ff6622" opacity="0.9" />');
      parts.push('<rect x="-18" y="-59" width="8" height="4" fill="#ff8844" opacity="0.8" />');
      parts.push('<rect x="10" y="-59" width="8" height="4" fill="#ff8844" opacity="0.8" />');
      // Eye glow
      parts.push('<ellipse cx="-14" cy="-57" rx="14" ry="10" fill="#ff6622" opacity="0.15" />');
      parts.push('<ellipse cx="14" cy="-57" rx="14" ry="10" fill="#ff6622" opacity="0.15" />');

      // Vent/grille mouth area
      for (let i = 0; i < 5; i++) {
        const x = -18 + i * 9;
        parts.push(`<rect x="${x}" y="-48" width="6" height="10" rx="1" fill="#2a2a2a" opacity="0.9" />`);
      }

      // Head crest/antenna
      parts.push('<path d="M 0 -90 L 0 -100 L 5 -95 L 0 -90 L -5 -95 Z" fill="#5a4a3a" opacity="0.95" />');
      parts.push('<circle cx="0" cy="-100" r="5" fill="#ff6622" opacity="0.8" />');
      parts.push('<circle cx="0" cy="-100" r="3" fill="#ff8844" opacity="0.6" />');

      // Shoulder pauldrons
      parts.push('<ellipse cx="-58" cy="-25" rx="20" ry="15" fill="#5a4a3a" opacity="0.95" />');
      parts.push('<ellipse cx="58" cy="-25" rx="20" ry="15" fill="#5a4a3a" opacity="0.95" />');
      parts.push('<ellipse cx="-58" cy="-27" rx="16" ry="11" fill="#6a5a4a" opacity="0.7" />');
      parts.push('<ellipse cx="58" cy="-27" rx="16" ry="11" fill="#6a5a4a" opacity="0.7" />');

      // Gears on shoulders
      parts.push(gearShape(-58, -25, 8, 12, 8, '#4a3a2a', 0.9));
      parts.push(gearShape(58, -25, 8, 12, 8, '#4a3a2a', 0.9));

      // Rivets throughout
      const rivetPositions = [
        { x: -50, y: -35 }, { x: 50, y: -35 },
        { x: -60, y: 0 }, { x: 60, y: 0 },
        { x: -55, y: 35 }, { x: 55, y: 35 },
        { x: -30, y: -70 }, { x: 30, y: -70 },
      ];
      for (const r of rivetPositions) {
        parts.push(`<circle cx="${r.x}" cy="${r.y}" r="4" fill="#3a2a1a" />`);
        parts.push(`<circle cx="${r.x - 1}" cy="${r.y - 1}" r="1.5" fill="#6a5a4a" opacity="0.6" />`);
      }

      // Steam/exhaust vents
      parts.push('<ellipse cx="-45" cy="45" rx="8" ry="5" fill="#3a3a3a" opacity="0.8" />');
      parts.push('<ellipse cx="45" cy="45" rx="8" ry="5" fill="#3a3a3a" opacity="0.8" />');
      // Steam particles
      parts.push(...sporeParticles(-45, 35, 10, 20, '#aaa'));
      parts.push(...sporeParticles(45, 35, 10, 20, '#aaa'));

      // Power aura
      parts.push('<ellipse cx="0" cy="10" rx="110" ry="95" fill="#ff8844" opacity="0.04" />');
      parts.push('<ellipse cx="0" cy="0" rx="90" ry="75" fill="#ff6622" opacity="0.03" />');

      return parts;
    }
  }
];

async function generateCommonEnemyArt() {
  const sharp = (await import('sharp')).default;
  const outDir = path.join(__dirname, '..', 'src', 'assets', 'art', 'enemies');

  console.log('\n=== VP-03: Common Enemy Sprite Replacement ===\n');
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

generateCommonEnemyArt().catch(console.error);
