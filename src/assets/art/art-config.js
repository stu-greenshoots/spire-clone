/**
 * Art Configuration for Ralph Wiggum's Spire Ascent
 *
 * This file manages image assets for cards, enemies, and relics.
 * When images exist, they'll be used. Otherwise, fallback to CSS/ASCII art.
 */

// Import prompts for reference
import { CARD_ART_PROMPTS, ENEMY_ART_PROMPTS, RELIC_ART_PROMPTS } from '../art-prompts';

// ============================================
// CARD ART CONFIGURATION
// ============================================

/**
 * Check if an image exists for a card
 * @param {string} cardId - The card ID
 * @returns {string|null} - Image URL or null if not found
 */
export const getCardImage = (cardId) => {
  // Try to dynamically import the image
  try {
    // These paths would be populated as you add images
    const images = import.meta.glob('./cards/*.{png,jpg,jpeg,webp}', { eager: true });
    // Find exact match by filename (without extension)
    const imagePath = Object.keys(images).find(path => {
      const filename = path.split('/').pop().split('.')[0];
      return filename.toLowerCase() === cardId.toLowerCase();
    });
    if (!imagePath) return null;
    // Vite 5+ returns the URL directly, older versions use .default
    const imageModule = images[imagePath];
    return typeof imageModule === 'string' ? imageModule : imageModule.default;
  } catch {
    return null;
  }
};

/**
 * Get card art info (image or prompt data)
 */
export const getCardArtInfo = (cardId) => {
  const image = getCardImage(cardId);
  const promptData = CARD_ART_PROMPTS[cardId];

  return {
    hasImage: !!image,
    imageUrl: image,
    prompt: promptData?.prompt || null,
    ralphQuote: promptData?.ralphQuote || null,
    description: promptData?.description || null,
    name: promptData?.name || null
  };
};

// ============================================
// ENEMY ART CONFIGURATION
// ============================================

export const getEnemyImage = (enemyId) => {
  try {
    const images = import.meta.glob('./enemies/*.{png,jpg,jpeg,webp}', { eager: true });
    const imagePath = Object.keys(images).find(path => {
      const filename = path.split('/').pop().split('.')[0];
      return filename.toLowerCase() === enemyId.toLowerCase();
    });
    if (!imagePath) return null;
    const imageModule = images[imagePath];
    return typeof imageModule === 'string' ? imageModule : imageModule.default;
  } catch {
    return null;
  }
};

export const getEnemyArtInfo = (enemyId) => {
  const image = getEnemyImage(enemyId);
  const promptData = ENEMY_ART_PROMPTS[enemyId];

  return {
    hasImage: !!image,
    imageUrl: image,
    prompt: promptData?.prompt || null,
    name: promptData?.name || null,
    description: promptData?.description || null
  };
};

// ============================================
// RELIC ART CONFIGURATION
// ============================================

export const getRelicImage = (relicId) => {
  try {
    const images = import.meta.glob('./relics/*.{png,jpg,jpeg,webp}', { eager: true });
    const imagePath = Object.keys(images).find(path => {
      const filename = path.split('/').pop().split('.')[0];
      return filename.toLowerCase() === relicId.toLowerCase();
    });
    if (!imagePath) return null;
    const imageModule = images[imagePath];
    return typeof imageModule === 'string' ? imageModule : imageModule.default;
  } catch {
    return null;
  }
};

export const getRelicArtInfo = (relicId) => {
  const image = getRelicImage(relicId);
  const promptData = RELIC_ART_PROMPTS[relicId];

  return {
    hasImage: !!image,
    imageUrl: image,
    prompt: promptData?.prompt || null,
    name: promptData?.name || null,
    description: promptData?.description || null
  };
};

// ============================================
// RALPH WIGGUM THEME NAMES
// ============================================

/**
 * Get the Ralph Wiggum-themed name for an enemy
 */
export const getRalphEnemyName = (enemyId) => {
  const promptData = ENEMY_ART_PROMPTS[enemyId];
  return promptData?.name || null;
};

/**
 * Get the Ralph Wiggum-themed name for a relic
 */
export const getRalphRelicName = (relicId) => {
  const promptData = RELIC_ART_PROMPTS[relicId];
  return promptData?.name || null;
};

// ============================================
// RALPH QUOTES
// ============================================

export const RALPH_QUOTES = {
  victory: [
    "I won! I'm a winner!",
    "The leprechaun said I'd win!",
    "I'm a unitard of victory!",
    "I beat them with my brain!",
    "Yay! More purple berries!"
  ],
  defeat: [
    "I'm learnding... to lose.",
    "Ow, my everything!",
    "The doctor said this would happen.",
    "I taste like failure!",
    "My cat's breath smells like losing."
  ],
  combat: [
    "Hi, bad guys!",
    "I'm helping!",
    "This is my sandbox!",
    "I'm a furniture!",
    "Slow down, danger!"
  ],
  cardPlay: [
    "Go banana!",
    "I'm doing it!",
    "The leprechaun approves!",
    "My brain says yes!",
    "Wheeee!"
  ],
  damage: [
    "That's my face!",
    "I bent my wookie!",
    "Not the nose!",
    "I can taste blood!",
    "Ow, my special area!"
  ],
  block: [
    "I'm unpoppable!",
    "My tummy protects me!",
    "Nothing can touch Ralph!",
    "I'm a wall!",
    "Bonk deflected!"
  ],
  heal: [
    "I feel better about my feelings!",
    "My boo-boos are gone!",
    "Juice makes me strong!",
    "I'm full of health!",
    "More life for Ralph!"
  ]
};

export const getRandomRalphQuote = (category = 'combat') => {
  const quotes = RALPH_QUOTES[category] || RALPH_QUOTES.combat;
  return quotes[Math.floor(Math.random() * quotes.length)];
};

// ============================================
// THEME SETTINGS
// ============================================

export const THEME_CONFIG = {
  // Enable/disable Ralph theming
  useRalphNames: true,
  useRalphQuotes: true,
  showQuotesOnActions: true,

  // Color scheme (Simpsons yellow theme)
  colors: {
    primary: '#FFD90F', // Simpsons yellow
    secondary: '#FF7F00', // Orange
    accent: '#00A8FF', // Sky blue
    danger: '#C41E3A', // Red
    success: '#228B22', // Green
    background: '#1a1a2e', // Dark blue
    text: '#FFFFFF'
  },

  // Animation settings
  animations: {
    cardPlayQuote: true,
    damageQuote: true,
    victoryQuote: true
  }
};

export default {
  getCardImage,
  getCardArtInfo,
  getEnemyImage,
  getEnemyArtInfo,
  getRelicImage,
  getRelicArtInfo,
  getRalphEnemyName,
  getRalphRelicName,
  getRandomRalphQuote,
  RALPH_QUOTES,
  THEME_CONFIG
};
