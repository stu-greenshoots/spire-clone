#!/usr/bin/env node

/**
 * VP-01: Act 1 Boss Sprite Replacement
 *
 * Generates high-quality art for the 3 Act 1 bosses:
 * - Slime Boss: Massive toxic blob with multiple eyes
 * - The Guardian: Stone construct with gem core
 * - Hexaghost: Six ghostly flames around spectral skull
 *
 * Target: >30KB per sprite with detailed layered art
 *
 * Usage: node scripts/generate-boss-art-vp01.js
 * Requires: sharp (devDependency)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SIZE = 768; // Larger canvas for more detail
const NOISE_DENSITY = 600; // Very high density for rich textures

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

// Generate drip effect
function drip(x, startY, length, width, color, opacity) {
  const parts = [];
  const wobble = (Math.random() - 0.5) * 15;
  parts.push(`<path d="M ${x} ${startY} Q ${x + wobble} ${startY + length * 0.6} ${x + wobble * 0.3} ${startY + length}" stroke="${color}" stroke-width="${width}" fill="none" opacity="${opacity}" stroke-linecap="round" />`);
  parts.push(`<ellipse cx="${x + wobble * 0.3}" cy="${startY + length + width}" rx="${width * 0.8}" ry="${width * 1.2}" fill="${color}" opacity="${opacity * 0.8}" />`);
  return parts;
}

// Generate flame shape
function flameShape(cx, cy, height, width, colors, opacity) {
  const parts = [];
  // Outer flame
  parts.push(`<path d="M ${cx} ${cy} Q ${cx - width} ${cy - height * 0.5} ${cx} ${cy - height} Q ${cx + width} ${cy - height * 0.5} ${cx} ${cy}" fill="${colors[0]}" opacity="${opacity}" />`);
  // Middle flame
  parts.push(`<path d="M ${cx} ${cy - height * 0.1} Q ${cx - width * 0.6} ${cy - height * 0.5} ${cx} ${cy - height * 0.85} Q ${cx + width * 0.6} ${cy - height * 0.5} ${cx} ${cy - height * 0.1}" fill="${colors[1]}" opacity="${opacity * 0.8}" />`);
  // Inner flame core
  parts.push(`<path d="M ${cx} ${cy - height * 0.2} Q ${cx - width * 0.3} ${cy - height * 0.5} ${cx} ${cy - height * 0.7} Q ${cx + width * 0.3} ${cy - height * 0.5} ${cx} ${cy - height * 0.2}" fill="${colors[2]}" opacity="${opacity * 0.6}" />`);
  return parts;
}

const BOSSES = [
  {
    id: 'slimeBoss',
    name: 'Slime Boss',
    background: { color1: '#1a3a1a', color2: '#050a05' },
    glowColor: '#33aa22',
    buildParts: () => {
      const parts = [];

      // Toxic glow beneath
      parts.push('<ellipse cx="0" cy="60" rx="160" ry="100" fill="#33aa22" opacity="0.1" />');
      parts.push('<ellipse cx="0" cy="50" rx="140" ry="80" fill="#44bb33" opacity="0.08" />');

      // Main body - multiple organic blob layers
      parts.push(blobShape(0, 30, 130, 16, 0.35, '#153015', 0.98));
      parts.push(blobShape(-10, 35, 120, 14, 0.3, '#1a4a1a', 0.95));
      parts.push(blobShape(5, 28, 110, 14, 0.28, '#205020', 0.9));
      parts.push(blobShape(-5, 25, 100, 12, 0.25, '#256025', 0.85));
      parts.push(blobShape(0, 20, 90, 12, 0.22, '#2a7a2a', 0.75));
      parts.push(blobShape(-3, 15, 80, 10, 0.2, '#308030', 0.65));
      parts.push(blobShape(5, 10, 70, 10, 0.18, '#358535', 0.5));

      // Dense surface texture
      parts.push(...noisePattern(NOISE_DENSITY, { x: -120, y: -60, w: 240, h: 170 },
        ['#4a9a4a', '#3a8a3a', '#5aaa5a', '#3a7a3a', '#4aa04a'], [0.08, 0.25], [1, 5]));

      // Large bubbles with highlights
      for (let i = 0; i < 15; i++) {
        const x = -90 + Math.random() * 180;
        const y = -40 + Math.random() * 120;
        const r = 12 + Math.random() * 22;
        parts.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="#4a9a4a" opacity="0.4" />`);
        parts.push(`<circle cx="${x}" cy="${y}" r="${r * 0.85}" fill="#5aaa5a" opacity="0.25" />`);
        parts.push(`<circle cx="${x - r * 0.3}" cy="${y - r * 0.3}" r="${r * 0.25}" fill="#8adb8a" opacity="0.35" />`);
      }

      // Medium bubbles scattered
      for (let i = 0; i < 25; i++) {
        const x = -100 + Math.random() * 200;
        const y = -50 + Math.random() * 140;
        const r = 5 + Math.random() * 10;
        parts.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="#5aaa5a" opacity="${0.2 + Math.random() * 0.25}" />`);
        parts.push(`<circle cx="${x - r * 0.25}" cy="${y - r * 0.25}" r="${r * 0.2}" fill="#8adb8a" opacity="0.3" />`);
      }

      // Dripping slime tendrils
      for (let i = 0; i < 10; i++) {
        const x = -90 + i * 20;
        const len = 35 + Math.random() * 55;
        parts.push(...drip(x, 85 + Math.random() * 15, len, 4 + Math.random() * 5, '#44aa22', 0.4 + Math.random() * 0.15));
      }

      // Multiple menacing eyes - various sizes
      const eyes = [
        { x: -60, y: -30, r: 22 },
        { x: 0, y: -50, r: 28 },
        { x: 55, y: -25, r: 20 },
        { x: -85, y: 5, r: 14 },
        { x: 85, y: 0, r: 15 },
        { x: -35, y: 15, r: 12 },
        { x: 40, y: 20, r: 11 },
        { x: -15, y: -10, r: 10 },
        { x: 25, y: 5, r: 9 },
      ];

      eyes.forEach(eye => {
        // Eye socket
        parts.push(`<ellipse cx="${eye.x}" cy="${eye.y}" rx="${eye.r * 1.1}" ry="${eye.r * 0.9}" fill="#0a1a0a" opacity="0.9" />`);
        // Iris
        parts.push(`<circle cx="${eye.x}" cy="${eye.y}" r="${eye.r * 0.75}" fill="#ccff44" opacity="0.92" />`);
        // Iris texture
        for (let j = 0; j < 8; j++) {
          const angle = j * Math.PI / 4;
          const x1 = eye.x + Math.cos(angle) * eye.r * 0.3;
          const y1 = eye.y + Math.sin(angle) * eye.r * 0.3;
          const x2 = eye.x + Math.cos(angle) * eye.r * 0.7;
          const y2 = eye.y + Math.sin(angle) * eye.r * 0.7;
          parts.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#99cc22" stroke-width="1" opacity="0.4" />`);
        }
        // Pupil
        parts.push(`<circle cx="${eye.x}" cy="${eye.y}" r="${eye.r * 0.4}" fill="#224400" />`);
        // Highlight
        parts.push(`<circle cx="${eye.x - eye.r * 0.25}" cy="${eye.y - eye.r * 0.25}" r="${eye.r * 0.18}" fill="#eeffbb" opacity="0.7" />`);
      });

      // Split line hint
      parts.push('<path d="M 0 -75 L 0 110" stroke="#0a2a0a" stroke-width="3" opacity="0.25" stroke-dasharray="15,10" />');

      // Additional texture lines
      for (let i = 0; i < 12; i++) {
        const startX = -100 + Math.random() * 200;
        const startY = -40 + Math.random() * 100;
        const endX = startX + (Math.random() - 0.5) * 40;
        const endY = startY + 20 + Math.random() * 30;
        parts.push(`<path d="M ${startX} ${startY} Q ${(startX + endX) / 2 + (Math.random() - 0.5) * 20} ${(startY + endY) / 2} ${endX} ${endY}" stroke="#2a6a2a" stroke-width="2" opacity="0.2" fill="none" />`);
      }

      // Toxic pool effect beneath
      parts.push('<ellipse cx="0" cy="110" rx="120" ry="30" fill="#33aa22" opacity="0.15" />');
      parts.push('<ellipse cx="0" cy="115" rx="100" ry="22" fill="#44bb33" opacity="0.1" />');

      return parts;
    }
  },
  {
    id: 'theGuardian',
    name: 'The Guardian',
    background: { color1: '#1a2a3a', color2: '#050810' },
    glowColor: '#3366aa',
    buildParts: () => {
      const parts = [];

      // Stone texture noise base
      const stoneNoise = noisePattern(NOISE_DENSITY * 1.2, { x: -110, y: -120, w: 220, h: 240 },
        ['#5a6a7a', '#4a5a6a', '#6a7a8a', '#3a4a5a', '#7a8a9a'], [0.04, 0.12], [1, 3]);

      // Legs - heavy stone pillars with detail
      parts.push('<rect x="-58" y="35" width="38" height="75" rx="5" fill="#556677" opacity="0.95" />');
      parts.push('<rect x="20" y="35" width="38" height="75" rx="5" fill="#556677" opacity="0.95" />');

      // Leg armor plates
      parts.push('<rect x="-55" y="40" width="10" height="65" fill="#667788" opacity="0.5" />');
      parts.push('<rect x="-35" y="40" width="8" height="65" fill="#445566" opacity="0.3" />');
      parts.push('<rect x="47" y="40" width="10" height="65" fill="#667788" opacity="0.5" />');
      parts.push('<rect x="27" y="40" width="8" height="65" fill="#445566" opacity="0.3" />');

      // Leg joints
      parts.push('<circle cx="-39" cy="50" r="8" fill="#445566" />');
      parts.push('<circle cx="39" cy="50" r="8" fill="#445566" />');
      parts.push('<circle cx="-39" cy="50" r="4" fill="#778899" opacity="0.7" />');
      parts.push('<circle cx="39" cy="50" r="4" fill="#778899" opacity="0.7" />');

      // Main torso - massive stone slab
      parts.push('<path d="M -70 -55 L -60 50 L 60 50 L 70 -55 Z" fill="#667788" opacity="0.95" />');
      parts.push('<path d="M -60 -48 L -52 42 L 52 42 L 60 -48 Z" fill="#556677" opacity="0.8" />');
      parts.push('<path d="M -50 -42 L -45 35 L 45 35 L 50 -42 Z" fill="#4a5a6a" opacity="0.5" />');

      // Add stone noise
      parts.push(...stoneNoise);

      // Gem core - glowing blue center with complex layers
      parts.push('<circle cx="0" cy="-5" r="30" fill="#112233" opacity="0.9" />');
      parts.push('<circle cx="0" cy="-5" r="24" fill="#1a3355" opacity="0.85" />');
      parts.push('<circle cx="0" cy="-5" r="18" fill="#2266bb" opacity="0.75" />');
      parts.push('<circle cx="0" cy="-5" r="13" fill="#44aaff" opacity="0.85" />');
      parts.push('<circle cx="0" cy="-5" r="8" fill="#88ddff" opacity="0.7" />');
      parts.push('<circle cx="-4" cy="-10" r="4" fill="#aaeeff" opacity="0.8" />');

      // Gem glow aura
      parts.push('<circle cx="0" cy="-5" r="40" fill="#4488cc" opacity="0.15" />');
      parts.push('<circle cx="0" cy="-5" r="50" fill="#3366aa" opacity="0.08" />');

      // Gem facets
      for (let i = 0; i < 6; i++) {
        const angle = i * Math.PI / 3;
        const x1 = Math.cos(angle) * 8;
        const y1 = -5 + Math.sin(angle) * 8;
        const x2 = Math.cos(angle) * 22;
        const y2 = -5 + Math.sin(angle) * 22;
        parts.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#66aadd" stroke-width="1" opacity="0.4" />`);
      }

      // Head - angular stone block
      parts.push('<path d="M -30 -105 L -40 -55 L 40 -55 L 30 -105 Z" fill="#778899" opacity="0.95" />');
      parts.push('<rect x="-22" y="-95" width="44" height="28" rx="3" fill="#556677" opacity="0.8" />');

      // Head crest
      parts.push('<path d="M 0 -115 L -15 -105 L 15 -105 Z" fill="#667788" opacity="0.9" />');

      // Eyes - glowing slits
      parts.push('<rect x="-18" y="-85" width="14" height="6" rx="1" fill="#112233" />');
      parts.push('<rect x="4" y="-85" width="14" height="6" rx="1" fill="#112233" />');
      parts.push('<rect x="-16" y="-84" width="10" height="4" rx="1" fill="#44aaff" opacity="0.95" />');
      parts.push('<rect x="6" y="-84" width="10" height="4" rx="1" fill="#44aaff" opacity="0.95" />');

      // Eye glow
      parts.push('<ellipse cx="-11" cy="-82" rx="12" ry="6" fill="#44aaff" opacity="0.2" />');
      parts.push('<ellipse cx="11" cy="-82" rx="12" ry="6" fill="#44aaff" opacity="0.2" />');

      // Shield arms - massive
      parts.push('<path d="M -70 -50 L -120 -35 L -115 30 L -65 40" fill="#778899" opacity="0.85" />');
      parts.push('<path d="M 70 -50 L 120 -35 L 115 30 L 65 40" fill="#778899" opacity="0.85" />');

      // Shield inner layer
      parts.push('<path d="M -75 -45 L -110 -30 L -105 25 L -70 32" fill="#667788" opacity="0.6" />');
      parts.push('<path d="M 75 -45 L 110 -30 L 105 25 L 70 32" fill="#667788" opacity="0.6" />');

      // Shield surface details - rivets and lines
      for (let i = 0; i < 5; i++) {
        const y = -30 + i * 15;
        parts.push(`<path d="M -110 ${y} L -105 ${y + 5}" stroke="#8899aa" stroke-width="2" opacity="0.3" />`);
        parts.push(`<path d="M -100 ${y - 5} L -95 ${y}" stroke="#8899aa" stroke-width="2" opacity="0.3" />`);
        parts.push(`<path d="M 110 ${y} L 105 ${y + 5}" stroke="#8899aa" stroke-width="2" opacity="0.3" />`);
        parts.push(`<path d="M 100 ${y - 5} L 95 ${y}" stroke="#8899aa" stroke-width="2" opacity="0.3" />`);
      }

      // Rune markings on body
      const runes = [
        { x: -40, y: -25 }, { x: 40, y: -25 }, { x: -30, y: 10 },
        { x: 30, y: 10 }, { x: 0, y: 30 }, { x: -50, y: -5 }, { x: 50, y: -5 }
      ];
      runes.forEach(r => {
        parts.push(`<circle cx="${r.x}" cy="${r.y}" r="4" stroke="#4488cc" stroke-width="1.5" fill="none" opacity="0.35" />`);
        parts.push(`<circle cx="${r.x}" cy="${r.y}" r="6" stroke="#4488cc" stroke-width="0.5" fill="none" opacity="0.2" />`);
      });

      // Stone cracks
      parts.push('<path d="M -45 -35 L -38 -20 L -42 -5" stroke="#3a4a5a" stroke-width="1.5" fill="none" opacity="0.4" />');
      parts.push('<path d="M 50 20 L 42 30 L 48 45" stroke="#3a4a5a" stroke-width="1.5" fill="none" opacity="0.4" />');
      parts.push('<path d="M -25 -70 L -30 -60" stroke="#3a4a5a" stroke-width="1" fill="none" opacity="0.35" />');
      parts.push('<path d="M 35 -75 L 30 -65 L 35 -55" stroke="#3a4a5a" stroke-width="1" fill="none" opacity="0.35" />');

      // Shield edge spikes
      parts.push('<path d="M -120 -35 L -135 -55 L -118 -40" fill="#667788" />');
      parts.push('<path d="M -115 30 L -130 40 L -112 32" fill="#667788" />');
      parts.push('<path d="M 120 -35 L 135 -55 L 118 -40" fill="#667788" />');
      parts.push('<path d="M 115 30 L 130 40 L 112 32" fill="#667788" />');

      // Iron rivets
      for (let i = 0; i < 5; i++) {
        const x = -45 + i * 22;
        parts.push(`<circle cx="${x}" cy="-15" r="4" fill="#5a6a7a" opacity="0.7" />`);
        parts.push(`<circle cx="${x}" cy="-15" r="2" fill="#8899aa" opacity="0.5" />`);
        parts.push(`<circle cx="${x}" cy="20" r="4" fill="#5a6a7a" opacity="0.7" />`);
        parts.push(`<circle cx="${x}" cy="20" r="2" fill="#8899aa" opacity="0.5" />`);
      }

      return parts;
    }
  },
  {
    id: 'hexaghost',
    name: 'Hexaghost',
    background: { color1: '#2a1a3a', color2: '#0a0815' },
    glowColor: '#8844dd',
    buildParts: () => {
      const parts = [];

      // Central ethereal glow
      parts.push('<circle cx="0" cy="0" r="80" fill="#8844dd" opacity="0.08" />');
      parts.push('<circle cx="0" cy="0" r="60" fill="#aa66ff" opacity="0.1" />');

      // Spectral core - layered
      parts.push('<circle cx="0" cy="0" r="50" fill="#3a1a5a" opacity="0.7" />');
      parts.push('<circle cx="0" cy="0" r="42" fill="#4a2a6a" opacity="0.65" />');
      parts.push('<circle cx="0" cy="0" r="35" fill="#5a3a7a" opacity="0.55" />');

      // Skull shape in core
      parts.push('<ellipse cx="0" cy="-8" rx="28" ry="22" fill="#2a1040" opacity="0.8" />');
      parts.push('<ellipse cx="0" cy="2" rx="20" ry="16" fill="#3a2050" opacity="0.5" />');

      // Skull eye sockets
      parts.push('<ellipse cx="-10" cy="-12" rx="10" ry="8" fill="#0a0510" opacity="0.9" />');
      parts.push('<ellipse cx="10" cy="-12" rx="10" ry="8" fill="#0a0510" opacity="0.9" />');

      // Glowing eyes within sockets
      parts.push('<circle cx="-10" cy="-12" r="6" fill="#aa66ff" opacity="0.7" />');
      parts.push('<circle cx="10" cy="-12" r="6" fill="#aa66ff" opacity="0.7" />');
      parts.push('<circle cx="-10" cy="-12" r="3" fill="#dd99ff" opacity="0.5" />');
      parts.push('<circle cx="10" cy="-12" r="3" fill="#dd99ff" opacity="0.5" />');

      // Skull nose/mouth area
      parts.push('<path d="M -5 2 L 0 10 L 5 2" stroke="#aa66ff" stroke-width="2" fill="none" opacity="0.5" />');
      parts.push('<path d="M -12 18 Q 0 25 12 18" stroke="#8855cc" stroke-width="1.5" fill="none" opacity="0.4" />');

      // Teeth hint
      for (let i = -8; i <= 8; i += 4) {
        parts.push(`<path d="M ${i} 18 L ${i} 22" stroke="#aa66ff" stroke-width="1.5" opacity="0.35" />`);
      }

      // Six orbiting flames at hexagonal positions
      const flamePositions = [
        { angle: -90, distance: 95 },   // Top
        { angle: -30, distance: 95 },   // Upper right
        { angle: 30, distance: 95 },    // Lower right
        { angle: 90, distance: 95 },    // Bottom
        { angle: 150, distance: 95 },   // Lower left
        { angle: 210, distance: 95 },   // Upper left
      ];

      flamePositions.forEach((pos, idx) => {
        const rad = pos.angle * Math.PI / 180;
        const x = Math.cos(rad) * pos.distance;
        const y = Math.sin(rad) * pos.distance;

        // Flame base glow
        parts.push(`<circle cx="${x}" cy="${y}" r="20" fill="#8844dd" opacity="0.15" />`);
        parts.push(`<circle cx="${x}" cy="${y}" r="15" fill="#aa66ff" opacity="0.2" />`);

        // Multi-layer flame
        const flameHeight = 40 + Math.random() * 10;
        const flameWidth = 18 + Math.random() * 5;

        // Outer flame
        parts.push(`<path d="M ${x} ${y + 10} Q ${x - flameWidth} ${y - flameHeight * 0.4} ${x} ${y - flameHeight} Q ${x + flameWidth} ${y - flameHeight * 0.4} ${x} ${y + 10}" fill="#7744cc" opacity="0.8" />`);
        // Middle flame
        parts.push(`<path d="M ${x} ${y + 5} Q ${x - flameWidth * 0.7} ${y - flameHeight * 0.35} ${x} ${y - flameHeight * 0.85} Q ${x + flameWidth * 0.7} ${y - flameHeight * 0.35} ${x} ${y + 5}" fill="#9966dd" opacity="0.7" />`);
        // Inner flame
        parts.push(`<path d="M ${x} ${y} Q ${x - flameWidth * 0.4} ${y - flameHeight * 0.3} ${x} ${y - flameHeight * 0.7} Q ${x + flameWidth * 0.4} ${y - flameHeight * 0.3} ${x} ${y}" fill="#bb88ee" opacity="0.6" />`);
        // Core
        parts.push(`<path d="M ${x} ${y - 5} Q ${x - flameWidth * 0.2} ${y - flameHeight * 0.25} ${x} ${y - flameHeight * 0.55} Q ${x + flameWidth * 0.2} ${y - flameHeight * 0.25} ${x} ${y - 5}" fill="#ddaaff" opacity="0.5" />`);

        // Flame base orb
        parts.push(`<circle cx="${x}" cy="${y + 5}" r="10" fill="#5533aa" opacity="0.8" />`);
        parts.push(`<circle cx="${x}" cy="${y + 5}" r="7" fill="#7755cc" opacity="0.6" />`);
        parts.push(`<circle cx="${x - 2}" cy="${y + 2}" r="3" fill="#aa88ee" opacity="0.4" />`);
      });

      // Energy connections from flames to core
      flamePositions.forEach(pos => {
        const rad = pos.angle * Math.PI / 180;
        const x1 = Math.cos(rad) * pos.distance;
        const y1 = Math.sin(rad) * pos.distance;
        const x2 = Math.cos(rad) * 45;
        const y2 = Math.sin(rad) * 45;
        parts.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#aa66ff" stroke-width="2" opacity="0.25" stroke-dasharray="5,8" />`);
        parts.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#cc88ff" stroke-width="1" opacity="0.15" />`);
      });

      // Spectral particles around core
      parts.push(...noisePattern(150, { x: -60, y: -60, w: 120, h: 120 },
        ['#aa66ff', '#8844dd', '#cc88ff', '#7733bb'], [0.08, 0.25], [1, 3]));

      // Ethereal wisps emanating from core
      for (let i = 0; i < 12; i++) {
        const angle = i * 30 * Math.PI / 180;
        const startR = 35;
        const endR = 55 + Math.random() * 15;
        const wobble = (Math.random() - 0.5) * 20;
        const x1 = Math.cos(angle) * startR;
        const y1 = Math.sin(angle) * startR;
        const x2 = Math.cos(angle) * endR + wobble;
        const y2 = Math.sin(angle) * endR;
        parts.push(`<path d="M ${x1} ${y1} Q ${(x1 + x2) / 2 + wobble * 0.5} ${(y1 + y2) / 2} ${x2} ${y2}" stroke="#aa66ff" stroke-width="${1 + Math.random()}" opacity="${0.15 + Math.random() * 0.15}" fill="none" />`);
      }

      // Outer ethereal ring
      parts.push('<circle cx="0" cy="0" r="130" stroke="#8844dd" stroke-width="1" fill="none" opacity="0.15" stroke-dasharray="8,12" />');
      parts.push('<circle cx="0" cy="0" r="140" stroke="#aa66ff" stroke-width="0.5" fill="none" opacity="0.1" stroke-dasharray="5,15" />');

      // Additional spectral mist around edges
      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = 100 + Math.random() * 30;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        const size = 10 + Math.random() * 20;
        parts.push(`<ellipse cx="${x}" cy="${y}" rx="${size}" ry="${size * 0.6}" fill="#8844dd" opacity="${0.05 + Math.random() * 0.08}" transform="rotate(${angle * 180 / Math.PI}, ${x}, ${y})" />`);
      }

      return parts;
    }
  }
];

async function generateBossArt() {
  const sharp = (await import('sharp')).default;
  const outDir = path.join(__dirname, '..', 'src', 'assets', 'art', 'enemies');

  console.log('\n=== VP-01: Act 1 Boss Sprite Replacement ===\n');
  console.log('Target: >30KB per sprite\n');

  for (const boss of BOSSES) {
    const parts = boss.buildParts();
    const svg = `<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg-${boss.id}" cx="50%" cy="45%" r="70%">
      <stop offset="0%" stop-color="${boss.background.color1}" />
      <stop offset="100%" stop-color="${boss.background.color2}" />
    </radialGradient>
    <radialGradient id="glow-${boss.id}" cx="50%" cy="40%" r="45%">
      <stop offset="0%" stop-color="${boss.glowColor}" stop-opacity="0.2" />
      <stop offset="100%" stop-color="${boss.glowColor}" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="vignette" cx="50%" cy="50%" r="50%">
      <stop offset="40%" stop-color="black" stop-opacity="0" />
      <stop offset="100%" stop-color="black" stop-opacity="0.7" />
    </radialGradient>
    <filter id="blur-${boss.id}">
      <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
    </filter>
  </defs>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#bg-${boss.id})" />
  <rect width="${SIZE}" height="${SIZE}" fill="url(#glow-${boss.id})" />
  <g transform="translate(384, 400)">
    ${parts.join('\n    ')}
  </g>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#vignette)" />
</svg>`;

    const outPath = path.join(outDir, `${boss.id}.webp`);

    // Use PNG for higher quality (WebP compression is too aggressive)
    // Then convert to WebP with near-lossless for size while maintaining quality
    await sharp(Buffer.from(svg))
      .resize(512, 512, { kernel: 'lanczos3' })
      .webp({ quality: 100, nearLossless: true, effort: 6 })
      .toFile(outPath);

    const stats = fs.statSync(outPath);
    const sizeKB = (stats.size / 1024).toFixed(1);
    const status = stats.size > 30 * 1024 ? '✓' : '✗ (below 30KB)';
    console.log(`  ${boss.id}.webp: ${sizeKB}KB ${status}`);
  }

  console.log('\n=== Generation Complete ===\n');
}

generateBossArt().catch(console.error);
