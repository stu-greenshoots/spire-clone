#!/usr/bin/env node
/**
 * Generate atmospheric background art for each act.
 * Produces 1920x1080 WebP images with dark fantasy landscapes.
 *
 * Act 1: Dungeon depths — cool blue-purple stone corridors
 * Act 2: The City — warmer green-teal ancient ruins
 * Act 3: The Beyond — amber/orange otherworldly plane
 * Act 4: The Heart — deep crimson pulsing organic cave
 */

import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'assets', 'art', 'backgrounds');
const WIDTH = 1920;
const HEIGHT = 1080;

function createSVG(width, height, content) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${content}</svg>`);
}

const backgrounds = [
  {
    id: 'act1',
    label: 'Dungeon Depths',
    svg: () => {
      // Cool blue-purple stone dungeon with stalactites and distant light
      return createSVG(WIDTH, HEIGHT, `
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0a0a1a"/>
            <stop offset="40%" stop-color="#141428"/>
            <stop offset="70%" stop-color="#1a1a2e"/>
            <stop offset="100%" stop-color="#0a0a12"/>
          </linearGradient>
          <radialGradient id="glow" cx="50%" cy="30%" r="40%">
            <stop offset="0%" stop-color="rgba(100,120,200,0.15)"/>
            <stop offset="100%" stop-color="transparent"/>
          </radialGradient>
          <radialGradient id="groundFog" cx="50%" cy="100%" r="60%">
            <stop offset="0%" stop-color="rgba(80,80,140,0.12)"/>
            <stop offset="100%" stop-color="transparent"/>
          </radialGradient>
        </defs>
        <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
        <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow)"/>
        <!-- Stalactites -->
        <polygon points="200,0 220,180 180,180" fill="rgba(20,20,40,0.8)"/>
        <polygon points="500,0 530,250 470,250" fill="rgba(18,18,35,0.7)"/>
        <polygon points="900,0 935,200 865,200" fill="rgba(22,22,45,0.8)"/>
        <polygon points="1300,0 1325,160 1275,160" fill="rgba(20,20,38,0.75)"/>
        <polygon points="1600,0 1630,220 1570,220" fill="rgba(16,16,32,0.7)"/>
        <!-- Distant pillars -->
        <rect x="300" y="400" width="40" height="680" fill="rgba(30,30,55,0.4)"/>
        <rect x="800" y="350" width="50" height="730" fill="rgba(25,25,50,0.35)"/>
        <rect x="1400" y="420" width="35" height="660" fill="rgba(28,28,52,0.3)"/>
        <!-- Stone floor line -->
        <rect x="0" y="850" width="${WIDTH}" height="230" fill="rgba(15,15,30,0.5)"/>
        <line x1="0" y1="850" x2="${WIDTH}" y2="850" stroke="rgba(60,60,100,0.2)" stroke-width="2"/>
        <!-- Ground fog -->
        <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#groundFog)"/>
        <!-- Distant blue light source -->
        <circle cx="960" cy="300" r="100" fill="rgba(80,100,180,0.06)"/>
        <circle cx="960" cy="300" r="50" fill="rgba(100,120,200,0.04)"/>
      `);
    }
  },
  {
    id: 'act2',
    label: 'The City',
    svg: () => {
      // Warmer green-teal ancient city ruins with crumbling architecture
      return createSVG(WIDTH, HEIGHT, `
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0a0f12"/>
            <stop offset="35%" stop-color="#121a1e"/>
            <stop offset="65%" stop-color="#0f1a18"/>
            <stop offset="100%" stop-color="#080e0c"/>
          </linearGradient>
          <radialGradient id="glow" cx="30%" cy="25%" r="45%">
            <stop offset="0%" stop-color="rgba(80,160,120,0.1)"/>
            <stop offset="100%" stop-color="transparent"/>
          </radialGradient>
        </defs>
        <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
        <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow)"/>
        <!-- Ruined archways -->
        <path d="M100,900 L100,400 Q200,300 300,400 L300,900" fill="none" stroke="rgba(40,60,50,0.5)" stroke-width="30"/>
        <path d="M700,900 L700,350 Q850,250 1000,350 L1000,900" fill="none" stroke="rgba(35,55,45,0.4)" stroke-width="25"/>
        <path d="M1400,900 L1400,450 Q1500,350 1600,450 L1600,900" fill="none" stroke="rgba(38,58,48,0.35)" stroke-width="20"/>
        <!-- Broken columns -->
        <rect x="450" y="500" width="30" height="400" fill="rgba(40,55,50,0.4)" rx="5"/>
        <rect x="450" y="480" width="50" height="20" fill="rgba(45,60,55,0.35)" rx="3"/>
        <rect x="1200" y="550" width="25" height="350" fill="rgba(35,50,45,0.35)" rx="4"/>
        <!-- Overgrown vines -->
        <path d="M300,400 Q350,500 320,600 Q340,700 300,800" fill="none" stroke="rgba(30,80,50,0.2)" stroke-width="4"/>
        <path d="M1000,350 Q1050,450 1020,550 Q1040,650 1000,750" fill="none" stroke="rgba(30,80,50,0.18)" stroke-width="3"/>
        <!-- Teal mist -->
        <ellipse cx="500" cy="800" rx="400" ry="100" fill="rgba(60,120,100,0.06)"/>
        <ellipse cx="1300" cy="820" rx="350" ry="80" fill="rgba(50,110,90,0.05)"/>
        <!-- Distant window glow -->
        <rect x="170" y="420" width="60" height="40" fill="rgba(80,140,100,0.08)" rx="5"/>
        <rect x="820" y="370" width="55" height="35" fill="rgba(70,130,90,0.06)" rx="4"/>
      `);
    }
  },
  {
    id: 'act3',
    label: 'The Beyond',
    svg: () => {
      // Warm amber/orange otherworldly dimension with floating crystals
      return createSVG(WIDTH, HEIGHT, `
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#120a08"/>
            <stop offset="30%" stop-color="#1e1510"/>
            <stop offset="60%" stop-color="#1a1208"/>
            <stop offset="100%" stop-color="#0e0a06"/>
          </linearGradient>
          <radialGradient id="glow" cx="60%" cy="20%" r="50%">
            <stop offset="0%" stop-color="rgba(200,150,60,0.12)"/>
            <stop offset="100%" stop-color="transparent"/>
          </radialGradient>
          <radialGradient id="voidGlow" cx="50%" cy="50%" r="30%">
            <stop offset="0%" stop-color="rgba(180,100,30,0.08)"/>
            <stop offset="100%" stop-color="transparent"/>
          </radialGradient>
        </defs>
        <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
        <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow)"/>
        <!-- Floating crystal shards -->
        <polygon points="300,200 320,150 340,200 320,220" fill="rgba(200,160,60,0.12)" stroke="rgba(200,160,60,0.2)" stroke-width="1"/>
        <polygon points="800,300 815,260 830,300 815,320" fill="rgba(180,140,50,0.1)" stroke="rgba(180,140,50,0.15)" stroke-width="1"/>
        <polygon points="1500,180 1520,120 1540,180 1520,210" fill="rgba(210,170,70,0.11)" stroke="rgba(210,170,70,0.18)" stroke-width="1"/>
        <polygon points="1100,400 1115,365 1130,400 1115,420" fill="rgba(190,150,55,0.09)" stroke="rgba(190,150,55,0.14)" stroke-width="1"/>
        <!-- Reality fracture lines -->
        <line x1="400" y1="0" x2="380" y2="500" stroke="rgba(200,150,40,0.08)" stroke-width="1"/>
        <line x1="1200" y1="0" x2="1220" y2="600" stroke="rgba(200,150,40,0.07)" stroke-width="1"/>
        <line x1="1700" y1="200" x2="1680" y2="900" stroke="rgba(200,150,40,0.06)" stroke-width="1"/>
        <!-- Jagged floating platforms -->
        <polygon points="100,700 300,680 350,720 250,750 80,730" fill="rgba(30,25,15,0.5)"/>
        <polygon points="600,650 850,630 900,670 800,700 580,680" fill="rgba(28,22,12,0.4)"/>
        <polygon points="1300,720 1500,700 1550,740 1450,770 1280,750" fill="rgba(25,20,10,0.45)"/>
        <!-- Void portal hint -->
        <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#voidGlow)"/>
        <!-- Amber dust particles -->
        <circle cx="200" cy="400" r="2" fill="rgba(200,160,60,0.2)"/>
        <circle cx="600" cy="250" r="1.5" fill="rgba(200,160,60,0.15)"/>
        <circle cx="1000" cy="500" r="2" fill="rgba(200,160,60,0.18)"/>
        <circle cx="1400" cy="350" r="1" fill="rgba(200,160,60,0.12)"/>
        <circle cx="1700" cy="600" r="2.5" fill="rgba(200,160,60,0.14)"/>
      `);
    }
  },
  {
    id: 'act4',
    label: 'The Heart',
    svg: () => {
      // Deep crimson organic cave with pulsing veins
      return createSVG(WIDTH, HEIGHT, `
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#12080a"/>
            <stop offset="30%" stop-color="#1e0c10"/>
            <stop offset="60%" stop-color="#1a0a0e"/>
            <stop offset="100%" stop-color="#0e0608"/>
          </linearGradient>
          <radialGradient id="heartGlow" cx="50%" cy="40%" r="40%">
            <stop offset="0%" stop-color="rgba(180,30,60,0.15)"/>
            <stop offset="60%" stop-color="rgba(120,20,40,0.06)"/>
            <stop offset="100%" stop-color="transparent"/>
          </radialGradient>
          <radialGradient id="pulse" cx="50%" cy="40%" r="25%">
            <stop offset="0%" stop-color="rgba(200,40,70,0.08)"/>
            <stop offset="100%" stop-color="transparent"/>
          </radialGradient>
        </defs>
        <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
        <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#heartGlow)"/>
        <!-- Organic vein-like structures -->
        <path d="M0,500 Q200,400 400,480 Q600,560 800,450 Q1000,340 1200,420 Q1400,500 1600,380 Q1800,260 1920,350" fill="none" stroke="rgba(120,20,40,0.2)" stroke-width="8"/>
        <path d="M0,600 Q300,550 500,620 Q700,690 900,580 Q1100,470 1300,550 Q1500,630 1700,520 Q1850,440 1920,500" fill="none" stroke="rgba(100,15,30,0.15)" stroke-width="6"/>
        <path d="M0,300 Q250,350 450,280 Q650,210 850,300 Q1050,390 1250,320 Q1450,250 1650,340 Q1800,400 1920,370" fill="none" stroke="rgba(110,18,35,0.12)" stroke-width="5"/>
        <!-- Branching capillaries -->
        <path d="M400,480 Q420,380 460,300" fill="none" stroke="rgba(120,20,40,0.1)" stroke-width="2"/>
        <path d="M800,450 Q830,350 810,270" fill="none" stroke="rgba(120,20,40,0.08)" stroke-width="2"/>
        <path d="M1200,420 Q1180,320 1220,250" fill="none" stroke="rgba(120,20,40,0.09)" stroke-width="2"/>
        <!-- Organic wall texture -->
        <ellipse cx="150" cy="200" rx="120" ry="80" fill="rgba(80,15,25,0.08)"/>
        <ellipse cx="1750" cy="250" rx="100" ry="70" fill="rgba(80,15,25,0.07)"/>
        <ellipse cx="960" cy="800" rx="200" ry="100" fill="rgba(90,18,30,0.06)"/>
        <!-- Central pulse -->
        <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#pulse)"/>
        <!-- Blood-like droplets -->
        <circle cx="350" cy="550" r="3" fill="rgba(180,30,50,0.15)"/>
        <circle cx="750" cy="400" r="2" fill="rgba(180,30,50,0.12)"/>
        <circle cx="1150" cy="500" r="2.5" fill="rgba(180,30,50,0.13)"/>
        <circle cx="1550" cy="350" r="2" fill="rgba(180,30,50,0.1)"/>
      `);
    }
  }
];

async function generate() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const bg of backgrounds) {
    const outputPath = path.join(OUTPUT_DIR, `${bg.id}.webp`);
    const svg = bg.svg();
    await sharp(svg)
      .resize(WIDTH, HEIGHT)
      .webp({ quality: 80 })
      .toFile(outputPath);
    const stats = fs.statSync(outputPath);
    console.log(`Generated ${bg.id}.webp (${bg.label}) — ${(stats.size / 1024).toFixed(0)}KB`);
  }
  console.log(`\nDone! ${backgrounds.length} background images generated in ${OUTPUT_DIR}`);
}

generate().catch(err => {
  console.error('Error generating backgrounds:', err);
  process.exit(1);
});
