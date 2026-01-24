/**
 * Art Configuration for Spire Ascent
 *
 * This file manages image assets for cards, enemies, relics, and potions.
 * Supports WebP (preferred) and PNG fallback formats.
 */

// ============================================
// CARD ART CONFIGURATION
// ============================================

/**
 * Check if an image exists for a card
 * @param {string} cardId - The card ID
 * @returns {string|null} - Image URL or null if not found
 */
export const getCardImage = (cardId) => {
  try {
    const images = import.meta.glob('./cards/*.{webp,png,jpg,jpeg}', { eager: true });
    const imagePath = Object.keys(images).find(path => {
      const filename = path.split('/').pop().split('.')[0];
      return filename.toLowerCase() === cardId.toLowerCase();
    });
    if (!imagePath) return null;
    const imageModule = images[imagePath];
    return typeof imageModule === 'string' ? imageModule : imageModule.default;
  } catch {
    return null;
  }
};

/**
 * Get card art info
 */
export const getCardArtInfo = (cardId) => {
  const image = getCardImage(cardId);
  return {
    hasImage: !!image,
    imageUrl: image,
  };
};

// ============================================
// ENEMY ART CONFIGURATION
// ============================================

export const getEnemyImage = (enemyId) => {
  try {
    const images = import.meta.glob('./enemies/*.{webp,png,jpg,jpeg}', { eager: true });
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
  return {
    hasImage: !!image,
    imageUrl: image,
  };
};

// ============================================
// RELIC ART CONFIGURATION
// ============================================

export const getRelicImage = (relicId) => {
  try {
    const images = import.meta.glob('./relics/*.{webp,png,jpg,jpeg}', { eager: true });
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
  return {
    hasImage: !!image,
    imageUrl: image,
  };
};

// ============================================
// POTION ART CONFIGURATION
// ============================================

export const getPotionImage = (potionId) => {
  try {
    const images = import.meta.glob('./potions/*.{webp,png,jpg,jpeg}', { eager: true });
    const imagePath = Object.keys(images).find(path => {
      const filename = path.split('/').pop().split('.')[0];
      return filename.toLowerCase() === potionId.toLowerCase();
    });
    if (!imagePath) return null;
    const imageModule = images[imagePath];
    return typeof imageModule === 'string' ? imageModule : imageModule.default;
  } catch {
    return null;
  }
};

// ============================================
// THEME SETTINGS
// ============================================

export const THEME_CONFIG = {
  // Color scheme (dark fantasy)
  colors: {
    primary: '#C9A84C', // Antique gold
    secondary: '#8B4513', // Saddle brown
    accent: '#6A5ACD', // Slate blue
    danger: '#8B0000', // Dark red
    success: '#2E8B57', // Sea green
    background: '#0a0a12', // Near black
    text: '#E8E0D0' // Parchment
  }
};

// Potion visual colors for UI rendering
export const POTION_COLORS = {
  fire_potion: { primary: '#ff4400', secondary: '#ff8800', glow: 'rgba(255, 68, 0, 0.4)' },
  block_potion: { primary: '#4488ff', secondary: '#88bbff', glow: 'rgba(68, 136, 255, 0.4)' },
  energy_potion: { primary: '#ffdd00', secondary: '#ffff88', glow: 'rgba(255, 221, 0, 0.4)' },
  explosive_potion: { primary: '#ff6600', secondary: '#ff9944', glow: 'rgba(255, 102, 0, 0.4)' },
  weak_potion: { primary: '#44aa44', secondary: '#88dd88', glow: 'rgba(68, 170, 68, 0.4)' },
  health_potion: { primary: '#cc0000', secondary: '#ff4444', glow: 'rgba(204, 0, 0, 0.4)' },
  strength_potion: { primary: '#cc2222', secondary: '#ff6666', glow: 'rgba(204, 34, 34, 0.4)' },
  dexterity_potion: { primary: '#22aa66', secondary: '#66ddaa', glow: 'rgba(34, 170, 102, 0.4)' },
  speed_potion: { primary: '#4466cc', secondary: '#88aaff', glow: 'rgba(68, 102, 204, 0.4)' },
  fear_potion: { primary: '#8844aa', secondary: '#bb88dd', glow: 'rgba(136, 68, 170, 0.4)' },
  fairy_potion: { primary: '#ffcc00', secondary: '#ffee88', glow: 'rgba(255, 204, 0, 0.5)' },
  cultist_potion: { primary: '#6622aa', secondary: '#9944dd', glow: 'rgba(102, 34, 170, 0.4)' },
  duplication_potion: { primary: '#aaaacc', secondary: '#ddddff', glow: 'rgba(170, 170, 204, 0.4)' },
  essence_of_steel: { primary: '#888899', secondary: '#bbbbcc', glow: 'rgba(136, 136, 153, 0.4)' },
  heart_of_iron: { primary: '#666677', secondary: '#9999aa', glow: 'rgba(102, 102, 119, 0.4)' },
};

export default {
  getCardImage,
  getCardArtInfo,
  getEnemyImage,
  getEnemyArtInfo,
  getRelicImage,
  getRelicArtInfo,
  getPotionImage,
  THEME_CONFIG,
  POTION_COLORS
};
