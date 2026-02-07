/**
 * Seeded Random Number Generator
 * Uses Mulberry32 algorithm for fast, deterministic pseudo-random numbers.
 * Same seed always produces the same sequence.
 */

export class SeededRNG {
  constructor(seed) {
    this.state = seed | 0;
  }

  /** Returns a float in [0, 1) — drop-in replacement for Math.random() */
  next() {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Returns an integer in [min, max] inclusive */
  nextInt(min, max) {
    return min + Math.floor(this.next() * (max - min + 1));
  }

  /** Pick a random element from an array */
  pick(array) {
    if (!array || array.length === 0) return undefined;
    return array[Math.floor(this.next() * array.length)];
  }

  /** Shuffle an array in place (Fisher-Yates) */
  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}

/**
 * Generate a numeric seed from a date string (YYYY-MM-DD).
 * Same date always produces the same seed.
 */
export const dateSeed = (dateStr) => {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const ch = dateStr.charCodeAt(i);
    hash = ((hash << 5) - hash + ch) | 0;
  }
  return hash;
};

/**
 * Get today's date string in YYYY-MM-DD format.
 */
export const todayDateString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const createRNG = (seed) => new SeededRNG(seed);

/**
 * Convert a string to a numeric seed using the same hash as dateSeed.
 * Allows players to enter text seeds like "SPIRE42" or "my-favorite-run".
 */
export const stringToSeed = (str) => {
  if (!str || str.length === 0) return 0;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = ((hash << 5) - hash + ch) | 0;
  }
  return hash;
};

/**
 * Generate a random alphanumeric seed string (8 characters).
 */
export const generateSeedString = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};
