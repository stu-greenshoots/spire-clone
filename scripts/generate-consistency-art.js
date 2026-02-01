#!/usr/bin/env node

/**
 * GD-28: Art Consistency Pass
 *
 * Re-renders 10 inconsistent sprites (mix of cards and enemies) to match
 * the established style guide. Ensures visual consistency across all four
 * characters and common enemies.
 *
 * Cards: neutralize, survivor, deadlyPoison (Silent), zap, dualcast (Defect),
 *        eruption (Watcher)
 * Enemies: cultist, jawWorm, louse_red, fungiBeast
 *
 * Usage: node scripts/generate-consistency-art.js
 * Requires: sharp (devDependency)
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SIZE = 512;

// Silent cards - green color scheme
const SILENT_CARDS = [
  {
    id: 'neutralize',
    title: 'Neutralize',
    color1: '#1a3a1a',
    color2: '#0a1508',
    accent: '#66dd44',
    glowColor: '#44aa22',
    // Silent starter - dagger strike with weak effect
    parts: [
      // Dagger blade
      '<path d="M 220 140 L 330 260 L 318 272 L 208 152 Z" fill="#ccccdd" opacity="0.7" />',
      '<path d="M 224 144 L 326 254 L 326 264 L 220 148 Z" fill="#eeeeff" opacity="0.3" />',
      // Dagger handle
      '<path d="M 208 148 L 188 168" stroke="#2a5a2a" stroke-width="10" stroke-linecap="round" opacity="0.8" />',
      '<rect x="195" y="143" width="30" height="6" rx="2" fill="#3a6a3a" opacity="0.7" transform="rotate(-45, 210, 146)" />',
      // Poison droplet on blade
      '<ellipse cx="270" cy="200" rx="6" ry="8" fill="#66dd44" opacity="0.6" />',
      '<ellipse cx="268" cy="197" rx="3" ry="4" fill="#88ff66" opacity="0.7" />',
      // Weak debuff spiral
      '<path d="M 340 270 Q 360 260 380 270 Q 390 285 380 300" stroke="#66dd44" stroke-width="2" fill="none" opacity="0.3" stroke-dasharray="4,3" />',
      '<path d="M 350 275 Q 365 268 375 275" stroke="#88ff66" stroke-width="1.5" fill="none" opacity="0.25" />',
      // Strike trail
      '<path d="M 180 120 Q 256 200 340 280" stroke="#66dd44" stroke-width="4" fill="none" opacity="0.2" />',
      '<path d="M 190 130 Q 256 210 330 270" stroke="#88ff66" stroke-width="2" fill="none" opacity="0.3" />',
      // Weak status icon
      '<circle cx="370" cy="285" r="12" stroke="#66dd44" stroke-width="2" fill="none" opacity="0.2" />',
      '<path d="M 370 275 L 370 280 M 368 288 L 372 288" stroke="#66dd44" stroke-width="2" opacity="0.25" />'
    ]
  },
  {
    id: 'survivor',
    title: 'Survivor',
    color1: '#1a2a3a',
    color2: '#080818',
    accent: '#4488cc',
    glowColor: '#3366aa',
    // Silent starter - defensive stance with discard pile glow
    parts: [
      // Cloaked figure silhouette
      '<path d="M 256 150 Q 220 170 210 220 L 210 320 Q 256 340 302 320 L 302 220 Q 292 170 256 150 Z" fill="#2a4a6a" opacity="0.7" />',
      '<path d="M 256 160 Q 230 175 222 210 L 222 310 Q 256 325 290 310 L 290 210 Q 282 175 256 160 Z" fill="#3a5a7a" opacity="0.5" />',
      // Hood
      '<ellipse cx="256" cy="170" rx="40" ry="30" fill="#1a3a5a" opacity="0.8" />',
      '<ellipse cx="256" cy="165" rx="30" ry="20" fill="#2a4a6a" opacity="0.6" />',
      // Face hidden in shadow
      '<ellipse cx="246" cy="172" rx="4" ry="3" fill="#4488cc" opacity="0.4" />',
      '<ellipse cx="266" cy="172" rx="4" ry="3" fill="#4488cc" opacity="0.4" />',
      // Defensive block cards floating
      '<rect x="180" y="200" width="40" height="55" rx="3" fill="#3a5a7a" opacity="0.5" />',
      '<rect x="185" y="205" width="30" height="45" rx="2" fill="#4a6a8a" opacity="0.3" />',
      '<rect x="292" y="210" width="40" height="55" rx="3" fill="#3a5a7a" opacity="0.5" />',
      '<rect x="297" y="215" width="30" height="45" rx="2" fill="#4a6a8a" opacity="0.3" />',
      // Discard pile glow (card draw effect)
      '<ellipse cx="256" cy="360" rx="60" ry="20" fill="#4488cc" opacity="0.2" />',
      '<ellipse cx="256" cy="360" rx="40" ry="12" fill="#6699dd" opacity="0.3" />',
      // Floating card particles
      '<rect x="230" y="340" width="8" height="12" rx="1" fill="#4488cc" opacity="0.4" />',
      '<rect x="280" y="350" width="6" height="10" rx="1" fill="#4488cc" opacity="0.3" />'
    ]
  },
  {
    id: 'deadlyPoison',
    title: 'Deadly Poison',
    color1: '#1a3a1a',
    color2: '#0a1a08',
    accent: '#66dd44',
    glowColor: '#44aa22',
    // Poison vial with toxic liquid
    parts: [
      // Vial body
      '<ellipse cx="256" cy="280" rx="50" ry="70" fill="#1a3a1a" opacity="0.8" />',
      '<ellipse cx="256" cy="275" rx="42" ry="60" fill="#2a4a2a" opacity="0.6" />',
      // Poison liquid inside
      '<ellipse cx="256" cy="295" rx="38" ry="50" fill="#2a5a1a" opacity="0.7" />',
      '<ellipse cx="256" cy="300" rx="32" ry="42" fill="#3a6a2a" opacity="0.6" />',
      '<ellipse cx="250" cy="290" rx="15" ry="20" fill="#66dd44" opacity="0.4" />',
      // Bubbles
      '<circle cx="240" cy="310" r="5" fill="#66dd44" opacity="0.3" />',
      '<circle cx="268" cy="300" r="4" fill="#66dd44" opacity="0.25" />',
      '<circle cx="252" cy="325" r="3" fill="#66dd44" opacity="0.2" />',
      // Vial neck
      '<rect x="241" y="210" width="30" height="40" rx="2" fill="#2a3a2a" opacity="0.7" />',
      '<rect x="244" y="215" width="24" height="30" rx="1" fill="#3a4a3a" opacity="0.5" />',
      // Cork/stopper
      '<ellipse cx="256" cy="205" rx="18" ry="8" fill="#5a4a2a" opacity="0.8" />',
      '<ellipse cx="256" cy="202" rx="15" ry="6" fill="#6a5a3a" opacity="0.6" />',
      // Toxic vapor
      '<path d="M 246 190 Q 240 170 250 155" stroke="#66dd44" stroke-width="2" fill="none" opacity="0.15" />',
      '<path d="M 256 188 Q 256 165 260 145" stroke="#66dd44" stroke-width="2" fill="none" opacity="0.15" />',
      '<path d="M 266 190 Q 272 170 262 155" stroke="#66dd44" stroke-width="2" fill="none" opacity="0.15" />',
      // Vapor wisps
      '<circle cx="250" cy="150" r="8" fill="#66dd44" opacity="0.1" />',
      '<circle cx="260" cy="140" r="6" fill="#66dd44" opacity="0.08" />',
      // Skull symbol on vial (deadly)
      '<circle cx="256" cy="270" r="12" fill="#112211" opacity="0.5" />',
      '<ellipse cx="250" cy="267" rx="3" ry="4" fill="#66dd44" opacity="0.4" />',
      '<ellipse cx="262" cy="267" rx="3" ry="4" fill="#66dd44" opacity="0.4" />'
    ]
  }
];

// Defect cards - blue/electric color scheme
const DEFECT_CARDS = [
  {
    id: 'zap',
    title: 'Zap',
    color1: '#1a2a4a',
    color2: '#080818',
    accent: '#4488ff',
    glowColor: '#3366dd',
    // Electric bolt
    parts: [
      // Lightning bolt main
      '<path d="M 280 100 L 240 180 L 270 180 L 230 300 L 300 200 L 270 200 L 310 120 Z" fill="#4488ff" opacity="0.7" />',
      '<path d="M 285 110 L 250 175 L 275 175 L 245 280 L 295 205 L 275 205 L 305 130 Z" fill="#6699ff" opacity="0.5" />',
      // Lightning core glow
      '<path d="M 287 115 L 260 170 L 278 170 L 255 260 L 290 210 L 278 210 L 302 135 Z" fill="#88bbff" opacity="0.4" />',
      // Electric sparks
      '<circle cx="280" cy="95" r="10" fill="#4488ff" opacity="0.3" />',
      '<circle cx="230" cy="305" r="12" fill="#4488ff" opacity="0.25" />',
      // Branching lightning
      '<path d="M 265 150 L 240 160 L 250 170" stroke="#4488ff" stroke-width="3" fill="none" opacity="0.3" />',
      '<path d="M 255 220 L 230 230" stroke="#4488ff" stroke-width="2" fill="none" opacity="0.25" />',
      '<path d="M 285 240 L 310 250" stroke="#4488ff" stroke-width="2" fill="none" opacity="0.25" />',
      // Glow aura
      '<circle cx="270" cy="200" r="80" fill="#4488ff" opacity="0.05" />',
      // Small spark effects
      '<circle cx="220" cy="155" r="3" fill="#88ccff" opacity="0.4" />',
      '<circle cx="315" cy="145" r="2" fill="#88ccff" opacity="0.4" />',
      '<circle cx="205" cy="240" r="2" fill="#88ccff" opacity="0.3" />'
    ]
  },
  {
    id: 'dualcast',
    title: 'Dualcast',
    color1: '#1a2a4a',
    color2: '#080818',
    accent: '#4488ff',
    glowColor: '#3366dd',
    // Twin orbs being channeled
    parts: [
      // Left orb
      '<circle cx="200" cy="240" r="45" fill="#1a2a4a" opacity="0.8" />',
      '<circle cx="200" cy="240" r="35" fill="#2a4a6a" opacity="0.6" />',
      '<circle cx="200" cy="240" r="25" fill="#4488ff" opacity="0.5" />',
      '<circle cx="195" cy="235" r="12" fill="#6699ff" opacity="0.6" />',
      '<circle cx="193" cy="232" r="6" fill="#88bbff" opacity="0.7" />',
      // Right orb
      '<circle cx="312" cy="240" r="45" fill="#1a2a4a" opacity="0.8" />',
      '<circle cx="312" cy="240" r="35" fill="#2a4a6a" opacity="0.6" />',
      '<circle cx="312" cy="240" r="25" fill="#4488ff" opacity="0.5" />',
      '<circle cx="307" cy="235" r="12" fill="#6699ff" opacity="0.6" />',
      '<circle cx="305" cy="232" r="6" fill="#88bbbb" opacity="0.7" />',
      // Energy connection between orbs
      '<path d="M 245 240 Q 256 220 267 240" stroke="#4488ff" stroke-width="3" fill="none" opacity="0.4" />',
      '<path d="M 245 240 Q 256 260 267 240" stroke="#4488ff" stroke-width="3" fill="none" opacity="0.4" />',
      '<path d="M 250 235 L 262 235" stroke="#6699ff" stroke-width="2" opacity="0.5" />',
      '<path d="M 250 245 L 262 245" stroke="#6699ff" stroke-width="2" opacity="0.5" />',
      // Outer glow
      '<circle cx="200" cy="240" r="60" stroke="#4488ff" stroke-width="1.5" fill="none" opacity="0.15" />',
      '<circle cx="312" cy="240" r="60" stroke="#4488ff" stroke-width="1.5" fill="none" opacity="0.15" />',
      // Spark effects
      '<circle cx="190" cy="200" r="3" fill="#88ccff" opacity="0.4" />',
      '<circle cx="322" cy="280" r="3" fill="#88ccff" opacity="0.4" />',
      '<circle cx="256" cy="210" r="2" fill="#88ccff" opacity="0.3" />'
    ]
  }
];

// Watcher cards - purple/divine color scheme
const WATCHER_CARDS = [
  {
    id: 'eruption',
    title: 'Eruption',
    color1: '#3a1a3a',
    color2: '#1a0a1a',
    accent: '#aa66dd',
    glowColor: '#8844bb',
    // Watcher entering Wrath stance - explosive energy
    parts: [
      // Meditative figure
      '<ellipse cx="256" cy="260" rx="60" ry="80" fill="#4a2a5a" opacity="0.7" />',
      '<ellipse cx="256" cy="255" rx="48" ry="65" fill="#5a3a6a" opacity="0.5" />',
      // Head/aura
      '<circle cx="256" cy="200" r="28" fill="#3a2a4a" opacity="0.8" />',
      '<circle cx="256" cy="198" r="22" fill="#4a3a5a" opacity="0.6" />',
      // Eyes (awakening)
      '<ellipse cx="246" cy="198" rx="4" ry="3" fill="#aa66dd" opacity="0.8" />',
      '<ellipse cx="266" cy="198" rx="4" ry="3" fill="#aa66dd" opacity="0.8" />',
      // Wrath energy explosion
      '<circle cx="256" cy="200" r="60" stroke="#aa66dd" stroke-width="4" fill="none" opacity="0.3" />',
      '<circle cx="256" cy="200" r="80" stroke="#aa66dd" stroke-width="3" fill="none" opacity="0.2" />',
      '<circle cx="256" cy="200" r="100" stroke="#aa66dd" stroke-width="2" fill="none" opacity="0.1" />',
      // Energy bursts radiating outward
      '<path d="M 256 200 L 180 120" stroke="#aa66dd" stroke-width="3" opacity="0.25" stroke-linecap="round" />',
      '<path d="M 256 200 L 332 120" stroke="#aa66dd" stroke-width="3" opacity="0.25" stroke-linecap="round" />',
      '<path d="M 256 200 L 140 200" stroke="#aa66dd" stroke-width="3" opacity="0.25" stroke-linecap="round" />',
      '<path d="M 256 200 L 372 200" stroke="#aa66dd" stroke-width="3" opacity="0.25" stroke-linecap="round" />',
      '<path d="M 256 200 L 200 320" stroke="#aa66dd" stroke-width="3" opacity="0.25" stroke-linecap="round" />',
      '<path d="M 256 200 L 312 320" stroke="#aa66dd" stroke-width="3" opacity="0.25" stroke-linecap="round" />',
      // Inner glow
      '<circle cx="256" cy="200" r="40" fill="#aa66dd" opacity="0.15" />',
      // Stance symbols (Wrath)
      '<path d="M 256 150 L 266 170 L 246 170 Z" fill="#aa66dd" opacity="0.4" />',
      '<circle cx="256" cy="175" r="8" stroke="#aa66dd" stroke-width="2" fill="none" opacity="0.3" />'
    ]
  }
];

// Enemies
const ENEMIES = [
  {
    id: 'cultist',
    name: 'Cultist',
    color1: '#2a1a3a',
    color2: '#0a0515',
    accent: '#8844aa',
    glowColor: '#663388',
    // Hooded cultist performing ritual, dark purple
    parts: [
      // Robe body
      '<path d="M 0 -30 Q -60 0 -65 80 L -35 120 L 35 120 L 65 80 Q 60 0 0 -30 Z" fill="#3a2a4a" opacity="0.8" />',
      '<path d="M 0 -20 Q -50 5 -55 70 L -30 110 L 30 110 L 55 70 Q 50 5 0 -20 Z" fill="#4a3a5a" opacity="0.6" />',
      // Hood
      '<ellipse cx="0" cy="-50" rx="45" ry="35" fill="#2a1a3a" opacity="0.9" />',
      '<ellipse cx="0" cy="-48" rx="35" ry="28" fill="#3a2a4a" opacity="0.7" />',
      // Face hidden in shadow, glowing eyes
      '<ellipse cx="-12" cy="-48" rx="6" ry="8" fill="#8844aa" opacity="0.8" />',
      '<ellipse cx="12" cy="-48" rx="6" ry="8" fill="#8844aa" opacity="0.8" />',
      '<circle cx="-12" cy="-48" r="3" fill="#aa66dd" opacity="0.9" />',
      '<circle cx="12" cy="-48" r="3" fill="#aa66dd" opacity="0.9" />',
      // Ritual hands raised
      '<path d="M -55 20 Q -80 -10 -70 -35" stroke="#4a3a5a" stroke-width="12" stroke-linecap="round" opacity="0.7" />',
      '<ellipse cx="-72" cy="-38" rx="8" ry="12" fill="#5a4a6a" opacity="0.7" />',
      '<path d="M 55 20 Q 80 -10 70 -35" stroke="#4a3a5a" stroke-width="12" stroke-linecap="round" opacity="0.7" />',
      '<ellipse cx="72" cy="-38" rx="8" ry="12" fill="#5a4a6a" opacity="0.7" />',
      // Dark ritual energy between hands
      '<path d="M -70 -35 Q 0 -60 70 -35" stroke="#8844aa" stroke-width="2" fill="none" opacity="0.4" stroke-dasharray="4,3" />',
      '<circle cx="0" cy="-50" r="20" stroke="#8844aa" stroke-width="1.5" fill="none" opacity="0.2" />',
      // Ritual buff aura
      '<ellipse cx="0" cy="0" rx="90" ry="120" stroke="#8844aa" stroke-width="1" fill="none" opacity="0.15" />',
      // Incantation symbols
      '<circle cx="-45" cy="-70" r="4" fill="#8844aa" opacity="0.3" />',
      '<circle cx="45" cy="-70" r="4" fill="#8844aa" opacity="0.3" />',
      '<path d="M -40 -75 L -35 -70 L -40 -65" stroke="#aa66dd" stroke-width="1" fill="none" opacity="0.25" />',
      '<path d="M 40 -75 L 45 -70 L 40 -65" stroke="#aa66dd" stroke-width="1" fill="none" opacity="0.25" />'
    ]
  },
  {
    id: 'jawWorm',
    name: 'Jaw Worm',
    color1: '#3a2a1a',
    color2: '#1a1008',
    accent: '#aa6644',
    glowColor: '#884422',
    // Segmented worm with massive jaws
    parts: [
      // Worm body segments
      '<ellipse cx="10" cy="40" rx="50" ry="40" fill="#4a3a2a" opacity="0.8" />',
      '<ellipse cx="-5" cy="25" rx="48" ry="38" fill="#5a4a3a" opacity="0.7" />',
      '<ellipse cx="-15" cy="10" rx="45" ry="35" fill="#4a3a2a" opacity="0.8" />',
      '<ellipse cx="-20" cy="-5" rx="42" ry="32" fill="#5a4a3a" opacity="0.7" />',
      '<ellipse cx="-22" cy="-20" rx="38" ry="28" fill="#4a3a2a" opacity="0.8" />',
      // Segment ridges
      '<ellipse cx="10" cy="40" rx="42" ry="32" stroke="#6a5a4a" stroke-width="2" fill="none" opacity="0.4" />',
      '<ellipse cx="-5" cy="25" rx="40" ry="30" stroke="#6a5a4a" stroke-width="2" fill="none" opacity="0.4" />',
      '<ellipse cx="-15" cy="10" rx="37" ry="28" stroke="#6a5a4a" stroke-width="2" fill="none" opacity="0.4" />',
      // Head
      '<ellipse cx="-25" cy="-40" rx="35" ry="30" fill="#5a4a3a" opacity="0.9" />',
      '<ellipse cx="-25" cy="-38" rx="28" ry="24" fill="#6a5a4a" opacity="0.7" />',
      // Massive jaw - upper
      '<path d="M -55 -45 Q -45 -65 -15 -60 Q 5 -58 10 -45" fill="#4a3a2a" opacity="0.8" />',
      '<path d="M -50 -48 Q -42 -62 -18 -58 Q 3 -56 8 -48" fill="#5a4a3a" opacity="0.6" />',
      // Massive jaw - lower
      '<path d="M -55 -35 Q -45 -15 -15 -20 Q 5 -22 10 -35" fill="#4a3a2a" opacity="0.8" />',
      '<path d="M -50 -32 Q -42 -18 -18 -22 Q 3 -24 8 -32" fill="#5a4a3a" opacity="0.6" />',
      // Teeth
      '<path d="M -45 -48 L -47 -40" stroke="#ccccdd" stroke-width="3" opacity="0.7" stroke-linecap="round" />',
      '<path d="M -35 -50 L -37 -40" stroke="#ccccdd" stroke-width="3" opacity="0.7" stroke-linecap="round" />',
      '<path d="M -25 -51 L -27 -40" stroke="#ccccdd" stroke-width="3" opacity="0.7" stroke-linecap="round" />',
      '<path d="M -15 -50 L -17 -40" stroke="#ccccdd" stroke-width="3" opacity="0.7" stroke-linecap="round" />',
      '<path d="M -5 -48 L -7 -40" stroke="#ccccdd" stroke-width="3" opacity="0.7" stroke-linecap="round" />',
      // Eyes
      '<circle cx="-35" cy="-42" r="5" fill="#aa6644" opacity="0.6" />',
      '<circle cx="-35" cy="-42" r="2.5" fill="#222222" opacity="0.8" />',
      // Block effect (gains block)
      '<ellipse cx="-25" cy="-25" rx="45" ry="35" stroke="#4488cc" stroke-width="2" fill="none" opacity="0.2" />'
    ]
  },
  {
    id: 'louse_red',
    name: 'Red Louse',
    color1: '#4a1a1a',
    color2: '#1a0808',
    accent: '#dd4444',
    glowColor: '#aa2222',
    // Small parasitic creature, red/angry
    parts: [
      // Body
      '<ellipse cx="0" cy="10" rx="50" ry="35" fill="#5a2a2a" opacity="0.8" />',
      '<ellipse cx="-5" cy="5" rx="45" ry="30" fill="#6a3a3a" opacity="0.7" />',
      '<ellipse cx="-8" cy="0" rx="40" ry="25" fill="#5a2a2a" opacity="0.6" />',
      // Segments
      '<ellipse cx="0" cy="10" rx="42" ry="28" stroke="#7a4a4a" stroke-width="1.5" fill="none" opacity="0.4" />',
      '<ellipse cx="-5" cy="5" rx="37" ry="24" stroke="#7a4a4a" stroke-width="1.5" fill="none" opacity="0.4" />',
      // Head
      '<ellipse cx="-20" cy="-20" rx="20" ry="18" fill="#6a3a3a" opacity="0.9" />',
      '<ellipse cx="-20" cy="-22" rx="16" ry="14" fill="#7a4a4a" opacity="0.7" />',
      // Mandibles
      '<path d="M -35 -18 Q -40 -15 -38 -10" stroke="#5a2a2a" stroke-width="4" stroke-linecap="round" opacity="0.7" />',
      '<path d="M -35 -22 Q -40 -25 -38 -30" stroke="#5a2a2a" stroke-width="4" stroke-linecap="round" opacity="0.7" />',
      '<path d="M -5 -18 Q 0 -15 -2 -10" stroke="#5a2a2a" stroke-width="4" stroke-linecap="round" opacity="0.7" />',
      '<path d="M -5 -22 Q 0 -25 -2 -30" stroke="#5a2a2a" stroke-width="4" stroke-linecap="round" opacity="0.7" />',
      // Eyes - angry
      '<ellipse cx="-25" cy="-22" rx="4" ry="3" fill="#dd4444" opacity="0.8" />',
      '<circle cx="-25" cy="-22" r="2" fill="#222222" />',
      '<ellipse cx="-15" cy="-22" rx="4" ry="3" fill="#dd4444" opacity="0.8" />',
      '<circle cx="-15" cy="-22" r="2" fill="#222222" />',
      // Legs
      '<path d="M -30 20 Q -45 35 -40 50" stroke="#5a2a2a" stroke-width="5" stroke-linecap="round" opacity="0.6" />',
      '<path d="M -15 25 Q -20 45 -15 60" stroke="#5a2a2a" stroke-width="5" stroke-linecap="round" opacity="0.6" />',
      '<path d="M 0 28 Q 0 48 5 60" stroke="#5a2a2a" stroke-width="5" stroke-linecap="round" opacity="0.6" />',
      '<path d="M 15 25 Q 20 45 25 55" stroke="#5a2a2a" stroke-width="5" stroke-linecap="round" opacity="0.6" />',
      '<path d="M 30 20 Q 45 35 50 45" stroke="#5a2a2a" stroke-width="5" stroke-linecap="round" opacity="0.6" />',
      // Curl defense buff (red louse curls up)
      '<path d="M -60 -10 Q -70 10 -60 30" stroke="#dd4444" stroke-width="2" fill="none" opacity="0.2" stroke-dasharray="3,3" />',
      '<circle cx="-60" cy="10" r="15" stroke="#dd4444" stroke-width="1.5" fill="none" opacity="0.15" />'
    ]
  },
  {
    id: 'fungiBeast',
    name: 'Fungi Beast',
    color1: '#2a3a1a',
    color2: '#0a1508',
    accent: '#88aa44',
    glowColor: '#668833',
    // Mushroom creature with spore attack
    parts: [
      // Mushroom cap
      '<ellipse cx="0" cy="-30" rx="60" ry="40" fill="#3a5a2a" opacity="0.9" />',
      '<ellipse cx="0" cy="-35" rx="52" ry="34" fill="#4a6a3a" opacity="0.7" />',
      '<ellipse cx="0" cy="-38" rx="45" ry="28" fill="#5a7a4a" opacity="0.5" />',
      // Cap spots
      '<circle cx="-25" cy="-40" r="8" fill="#6a8a5a" opacity="0.6" />',
      '<circle cx="20" cy="-38" r="10" fill="#6a8a5a" opacity="0.6" />',
      '<circle cx="-5" cy="-45" r="6" fill="#6a8a5a" opacity="0.5" />',
      '<circle cx="10" cy="-28" r="7" fill="#6a8a5a" opacity="0.5" />',
      '<circle cx="-35" cy="-25" r="5" fill="#6a8a5a" opacity="0.4" />',
      // Gills under cap
      '<path d="M -50 -10 Q -40 -5 -30 -10" stroke="#2a4a1a" stroke-width="2" opacity="0.5" />',
      '<path d="M -30 -10 Q -20 -5 -10 -10" stroke="#2a4a1a" stroke-width="2" opacity="0.5" />',
      '<path d="M -10 -10 Q 0 -5 10 -10" stroke="#2a4a1a" stroke-width="2" opacity="0.5" />',
      '<path d="M 10 -10 Q 20 -5 30 -10" stroke="#2a4a1a" stroke-width="2" opacity="0.5" />',
      '<path d="M 30 -10 Q 40 -5 50 -10" stroke="#2a4a1a" stroke-width="2" opacity="0.5" />',
      // Stalk/body
      '<rect x="-25" y="-10" width="50" height="70" rx="8" fill="#3a5a2a" opacity="0.8" />',
      '<rect x="-20" y="-5" width="40" height="60" rx="6" fill="#4a6a3a" opacity="0.6" />',
      // Texture on stalk
      '<ellipse cx="0" cy="10" rx="18" ry="8" stroke="#2a4a1a" stroke-width="1.5" fill="none" opacity="0.3" />',
      '<ellipse cx="0" cy="30" rx="20" ry="10" stroke="#2a4a1a" stroke-width="1.5" fill="none" opacity="0.3" />',
      '<ellipse cx="0" cy="50" rx="22" ry="12" stroke="#2a4a1a" stroke-width="1.5" fill="none" opacity="0.3" />',
      // Spores (attack effect)
      '<circle cx="-40" cy="-50" r="4" fill="#88aa44" opacity="0.4" />',
      '<circle cx="-50" cy="-30" r="3" fill="#88aa44" opacity="0.35" />',
      '<circle cx="45" cy="-55" r="3.5" fill="#88aa44" opacity="0.4" />',
      '<circle cx="55" cy="-35" r="3" fill="#88aa44" opacity="0.35" />',
      '<circle cx="-35" cy="-70" r="2.5" fill="#88aa44" opacity="0.3" />',
      '<circle cx="40" cy="-75" r="2.5" fill="#88aa44" opacity="0.3" />',
      // Spore cloud
      '<ellipse cx="0" cy="-50" rx="70" ry="40" fill="#88aa44" opacity="0.08" />',
      // Root tendrils
      '<path d="M -20 60 Q -30 80 -25 100" stroke="#2a4a1a" stroke-width="6" stroke-linecap="round" opacity="0.6" />',
      '<path d="M 20 60 Q 30 80 25 100" stroke="#2a4a1a" stroke-width="6" stroke-linecap="round" opacity="0.6" />'
    ]
  }
];

async function main() {
  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch {
    console.error('ERROR: sharp not installed. Run: npm install');
    process.exit(1);
  }

  const cardOutDir = path.join(__dirname, '..', 'src', 'assets', 'art', 'cards');
  const enemyOutDir = path.join(__dirname, '..', 'src', 'assets', 'art', 'enemies');

  // Generate all cards
  const allCards = [...SILENT_CARDS, ...DEFECT_CARDS, ...WATCHER_CARDS];
  console.log(`Generating ${allCards.length} improved card art images...`);

  for (const card of allCards) {
    const partsStr = card.parts.map(p => `    <g transform="translate(256, 256)">${p}</g>`).join('\n');

    const svg = `<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="${card.color1}" />
      <stop offset="100%" stop-color="${card.color2}" />
    </radialGradient>
    <radialGradient id="glow" cx="50%" cy="40%" r="40%">
      <stop offset="0%" stop-color="${card.glowColor}" stop-opacity="0.2" />
      <stop offset="100%" stop-color="${card.glowColor}" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="vignette" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="black" stop-opacity="0.2" />
      <stop offset="30%" stop-color="black" stop-opacity="0" />
      <stop offset="75%" stop-color="black" stop-opacity="0" />
      <stop offset="100%" stop-color="black" stop-opacity="0.4" />
    </linearGradient>
    <radialGradient id="centerGlow" cx="50%" cy="45%" r="30%">
      <stop offset="0%" stop-color="${card.accent}" stop-opacity="0.1" />
      <stop offset="100%" stop-color="${card.accent}" stop-opacity="0" />
    </radialGradient>
  </defs>
  <!-- Background -->
  <rect width="${SIZE}" height="${SIZE}" fill="url(#bg)" />
  <rect width="${SIZE}" height="${SIZE}" fill="url(#glow)" />
  <rect width="${SIZE}" height="${SIZE}" fill="url(#centerGlow)" />
  <!-- Card illustration -->
${partsStr}
  <!-- Atmosphere -->
  <rect width="${SIZE}" height="${SIZE}" fill="url(#vignette)" />
  <!-- Title -->
  <text x="256" y="460" text-anchor="middle" font-family="serif" font-size="24" font-weight="bold" fill="${card.accent}" opacity="0.6">${escapeXml(card.title)}</text>
</svg>`;

    const outPath = path.join(cardOutDir, `${card.id}.webp`);
    await sharp(Buffer.from(svg))
      .webp({ quality: 85 })
      .toFile(outPath);

    console.log(`  Card: ${card.id}.webp`);
  }

  // Generate all enemies
  console.log(`\nGenerating ${ENEMIES.length} improved enemy art images...`);

  for (const enemy of ENEMIES) {
    const partsStr = enemy.parts.map(p => `    <g transform="translate(256, 256)">${p}</g>`).join('\n');

    const svg = `<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="${enemy.color1}" />
      <stop offset="100%" stop-color="${enemy.color2}" />
    </radialGradient>
    <radialGradient id="glow" cx="50%" cy="40%" r="40%">
      <stop offset="0%" stop-color="${enemy.glowColor}" stop-opacity="0.2" />
      <stop offset="100%" stop-color="${enemy.glowColor}" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="vignette" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="black" stop-opacity="0.2" />
      <stop offset="30%" stop-color="black" stop-opacity="0" />
      <stop offset="75%" stop-color="black" stop-opacity="0" />
      <stop offset="100%" stop-color="black" stop-opacity="0.4" />
    </linearGradient>
    <radialGradient id="centerGlow" cx="50%" cy="45%" r="30%">
      <stop offset="0%" stop-color="${enemy.accent}" stop-opacity="0.1" />
      <stop offset="100%" stop-color="${enemy.accent}" stop-opacity="0" />
    </radialGradient>
  </defs>
  <!-- Background -->
  <rect width="${SIZE}" height="${SIZE}" fill="url(#bg)" />
  <rect width="${SIZE}" height="${SIZE}" fill="url(#glow)" />
  <rect width="${SIZE}" height="${SIZE}" fill="url(#centerGlow)" />
  <!-- Enemy illustration -->
${partsStr}
  <!-- Atmosphere -->
  <rect width="${SIZE}" height="${SIZE}" fill="url(#vignette)" />
  <!-- Name -->
  <text x="256" y="480" text-anchor="middle" font-family="serif" font-size="20" font-weight="bold" fill="${enemy.accent}" opacity="0.5">${escapeXml(enemy.name)}</text>
</svg>`;

    const outPath = path.join(enemyOutDir, `${enemy.id}.webp`);
    await sharp(Buffer.from(svg))
      .webp({ quality: 85 })
      .toFile(outPath);

    console.log(`  Enemy: ${enemy.id}.webp`);
  }

  console.log(`\nDone! Generated ${allCards.length} card images and ${ENEMIES.length} enemy images.`);
  console.log('Card images: src/assets/art/cards/');
  console.log('Enemy images: src/assets/art/enemies/');
  console.log('\nNext steps:');
  console.log('  1. node scripts/generate-sprite-sheets.js --type=cards');
  console.log('  2. node scripts/generate-sprite-sheets.js --type=enemies');
}

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

main().catch(err => { console.error(err); process.exit(1); });
