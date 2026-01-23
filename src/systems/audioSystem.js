const sounds = {};
let muted = localStorage.getItem('audioMuted') === 'true';

// Preload sounds
const soundFiles = {
  cardPlay: '/sounds/card-play.mp3',
  hit: '/sounds/hit.mp3',
  block: '/sounds/block.mp3',
  enemyDeath: '/sounds/enemy-death.mp3',
  goldPickup: '/sounds/gold.mp3',
};

export function preloadSounds() {
  Object.entries(soundFiles).forEach(([name, path]) => {
    sounds[name] = new Audio(path);
    sounds[name].preload = 'auto';
  });
}

export function playSound(name) {
  if (muted || !sounds[name]) return;
  const sound = sounds[name];
  sound.currentTime = 0;
  sound.play().catch(() => {});
}

export function setMuted(value) {
  muted = value;
  localStorage.setItem('audioMuted', String(value));
}

export function isMuted() {
  return muted;
}
