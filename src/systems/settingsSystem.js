const SETTINGS_KEY = 'spireAscent_settings';

const DEFAULT_SETTINGS = {
  masterVolume: 0.7,
  sfxVolume: 0.8,
  musicVolume: 0.5,
  animationSpeed: 'normal', // 'normal', 'fast', 'instant'
  screenShake: true,
  textSize: 'normal', // 'normal', 'large'
  highContrast: false,
  confirmEndTurn: false,
  showDamageNumbers: true
};

export const loadSettings = () => {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
  } catch (e) { /* ignore */ }
  return { ...DEFAULT_SETTINGS };
};

export const saveSettings = (settings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) { /* ignore */ }
};

export const getAnimationDuration = (settings, baseDuration = 400) => {
  switch (settings.animationSpeed) {
    case 'fast': return baseDuration * 0.5;
    case 'instant': return 0;
    default: return baseDuration;
  }
};

export { DEFAULT_SETTINGS };
