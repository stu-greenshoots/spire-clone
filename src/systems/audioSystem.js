// Sound category and ID constants
export const SOUNDS = {
  combat: {
    cardPlay: 'card_play',
    cardDraw: 'card_draw',
    attack: 'attack_hit',
    block: 'block_gain',
    enemyAttack: 'enemy_attack',
    playerHurt: 'player_hurt',
    heavyHit: 'heavy_hit',
    enemyDeath: 'enemy_death',
    buff: 'buff_apply',
    debuff: 'debuff_apply',
    heal: 'heal',
    poison: 'poison_tick',
    turnStart: 'turn_start',
    turnEnd: 'turn_end',
    victory: 'combat_victory',
    bossIntro: 'boss_intro',
    potionUse: 'potion_use',
    shivPlay: 'shiv_play',
    poisonApply: 'poison_apply',
    discard: 'card_discard',
    heartbeat: 'heartbeat',
    beatOfDeath: 'beat_of_death',
    heartPhaseTransition: 'heart_phase_transition',
    orbLightning: 'orb_lightning',
    orbFrost: 'orb_frost',
    orbDark: 'orb_dark',
    orbPlasma: 'orb_plasma',
    orbEvoke: 'orb_evoke',
    stanceTransition: 'stance_transition',
    mantraTick: 'mantra_tick',
    milestoneFanfare: 'milestone_fanfare',
    endlessDeath: 'endless_death'
  },
  ui: {
    buttonClick: 'ui_click',
    cardHover: 'card_hover',
    menuOpen: 'menu_open',
    goldGain: 'gold_gain',
    relicPickup: 'relic_pickup',
    cardUpgrade: 'card_upgrade',
    mapStep: 'map_step',
    error: 'ui_error'
  },
  ambient: {
    mapAmbience: 'map_ambience',
    shopAmbience: 'shop_ambience',
    restAmbience: 'rest_ambience',
    act1: 'ambient_act1',
    act2: 'ambient_act2',
    act3: 'ambient_act3',
    act4: 'ambient_act4',
    endless: 'ambient_endless'
  },
  music: {
    menu: 'music_menu',
    combat: 'music_combat',
    boss: 'music_boss',
    map: 'music_map',
    shop: 'music_shop',
    event: 'music_event',
    victory: 'music_victory',
    defeat: 'music_defeat',
    act3Map: 'music_act3_map'
  }
};

const STORAGE_KEY = 'spire_audio_settings';

class AudioManager {
  constructor() {
    // Volume levels (0.0 - 1.0)
    this.masterVolume = 1.0;
    this.sfxVolume = 0.8;
    this.musicVolume = 0.5;
    this.muted = false;

    // Sound categories
    this.categories = {
      combat: {},
      ui: {},
      ambient: {},
      music: {}
    };

    // Current music state
    this.currentMusic = null;
    this.musicFading = false;
    this._fadeIntervals = []; // AR-09: Support multiple concurrent fades

    // AR-09: Music ducking (temporary volume reduction for settings/pause)
    this._ducked = false;

    // AR-16: Ambient layer (loops under music, per-act)
    this._currentAmbient = null; // { trackId, audio }

    // Audio cache
    this._audioCache = {};

    // BE-28: SFX pool for overlapping sounds (max 3 concurrent per soundId)
    this._sfxPoolSize = 3;

    // Preload queue: tracks which sounds are eagerly vs lazily loaded
    this._preloadQueue = {
      eager: [],  // Loaded immediately (combat sounds)
      lazy: []    // Loaded on-demand or when idle (ui, ambient, music)
    };

    // Phase-based music selection
    this._phases = {};  // { phaseName: trackId }
    this._currentPhase = null;

    // AR-07: Debounce tracking to prevent overlapping rapid sounds
    this._lastPlayedTime = {}; // { soundId: timestamp }
    this._debounceMs = 80; // Minimum ms between same sound

    // AR-04: User gesture tracking for autoplay policy compliance
    this._userGestureReceived = false;
    this._pendingAudioQueue = []; // Queued sounds waiting for user gesture

    // BE-28: AudioContext for browser autoplay policy compliance
    this._audioContext = null;

    // BE-28: Track initialization state
    this._initialized = false;

    // Load persisted settings
    this.loadSettings();

    // Set up user gesture listener for autoplay policy
    this._initUserGestureListener();
  }

  /**
   * AR-04/BE-28: Set up one-time listener for user gesture to enable audio.
   * Modern browsers require a user gesture before audio can play.
   * BE-28: Creates AudioContext and starts preloading on first gesture.
   */
  _initUserGestureListener() {
    const enableAudio = () => {
      if (this._userGestureReceived) return;
      this._userGestureReceived = true;

      // BE-28: Create AudioContext on first user gesture for browser compliance
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this._audioContext = new AudioCtx();
          if (this._audioContext.state === 'suspended') {
            this._audioContext.resume().catch(() => {});
          }
        }
      } catch {
        // AudioContext not available — HTML5 Audio fallback still works
      }

      // BE-28: Start preloading combat sounds on first user gesture
      this.initPreloadQueue();

      // BE-28: Schedule lazy sound loading in idle time
      this._scheduleLazyLoading();

      this._initialized = true;

      // Play any queued sounds
      this._pendingAudioQueue.forEach(({ type, args }) => {
        if (type === 'sfx') {
          this._playSFXInternal(...args);
        } else if (type === 'music') {
          this._playMusicInternal(...args);
        } else if (type === 'ambient') {
          this._playAmbientInternal(...args);
        }
      });
      this._pendingAudioQueue = [];

      // Remove listeners after first gesture
      document.removeEventListener('click', enableAudio);
      document.removeEventListener('keydown', enableAudio);
      document.removeEventListener('touchstart', enableAudio);
    };

    // Listen for any user gesture (manually removed after first trigger)
    document.addEventListener('click', enableAudio, { passive: true });
    document.addEventListener('keydown', enableAudio, { passive: true });
    document.addEventListener('touchstart', enableAudio, { passive: true });
  }

  /**
   * BE-28: Schedule lazy sound loading using requestIdleCallback or setTimeout fallback.
   */
  _scheduleLazyLoading() {
    const loadBatch = () => {
      const remaining = this.loadLazySounds(3);
      if (remaining > 0) {
        if (typeof requestIdleCallback === 'function') {
          requestIdleCallback(loadBatch);
        } else {
          setTimeout(loadBatch, 200);
        }
      }
    };
    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(loadBatch);
    } else {
      setTimeout(loadBatch, 200);
    }
  }

  /**
   * Check if audio is ready to play (user gesture received)
   */
  isReady() {
    return this._userGestureReceived;
  }

  /**
   * Get effective volume for a category
   */
  _getEffectiveVolume(category) {
    if (this.muted) return 0;
    const categoryMultiplier = (category === 'music') ? this.musicVolume : this.sfxVolume;
    return this.masterVolume * categoryMultiplier;
  }

  /**
   * Try to create and cache an Audio element for a sound ID.
   * Returns null silently if the audio file doesn't exist.
   */
  _getAudio(soundId) {
    if (this._audioCache[soundId]) {
      return this._audioCache[soundId];
    }
    try {
      const base = (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) || '/';
      const audio = new Audio(`${base}sounds/${soundId}.mp3`);
      audio.preload = 'auto';
      this._audioCache[soundId] = audio;
      return audio;
    } catch {
      // Silent fallback - no errors when audio files don't exist
      return null;
    }
  }

  /**
   * Play a sound effect (queues if user gesture not yet received)
   */
  playSFX(soundId, category = 'combat') {
    if (this.muted) return;

    // AR-04: Queue sound if user hasn't interacted yet
    if (!this._userGestureReceived) {
      this._pendingAudioQueue.push({ type: 'sfx', args: [soundId, category] });
      return;
    }

    this._playSFXInternal(soundId, category);
  }

  /**
   * Internal SFX playback (called after user gesture verified).
   * BE-28: Uses audio cloning so the same sound can overlap (e.g. rapid card plays).
   */
  _playSFXInternal(soundId, category = 'combat') {
    const volume = this._getEffectiveVolume(category);
    if (volume <= 0) return;

    // AR-07: Debounce rapid duplicate sounds
    const now = Date.now();
    if (this._lastPlayedTime[soundId] && now - this._lastPlayedTime[soundId] < this._debounceMs) {
      return;
    }
    this._lastPlayedTime[soundId] = now;

    const audio = this._getAudio(soundId);
    if (!audio) return;

    // BE-28: Resume AudioContext if it was suspended (e.g. after tab backgrounding)
    if (this._audioContext && this._audioContext.state === 'suspended') {
      this._audioContext.resume().catch(() => {});
    }

    try {
      // BE-28: Clone the audio element so overlapping plays don't cut each other off
      const clone = audio.cloneNode();
      clone.volume = volume;
      const playPromise = clone.play();
      if (playPromise) {
        playPromise.catch(() => {
          // BE-28: Retry once on failure (common after tab regains focus)
          setTimeout(() => {
            try { clone.play().catch(() => {}); } catch { /* give up */ }
          }, 50);
        });
      }
    } catch {
      // Silent fallback
    }
  }

  /**
   * Play a music track with optional loop and fade-in (queues if user gesture not yet received)
   */
  playMusic(trackId, options = {}) {
    // AR-04: Queue music if user hasn't interacted yet
    if (!this._userGestureReceived) {
      this._pendingAudioQueue.push({ type: 'music', args: [trackId, options] });
      return;
    }

    this._playMusicInternal(trackId, options);
  }

  /**
   * Internal music playback (called after user gesture verified)
   */
  _playMusicInternal(trackId, { loop = true, fadeIn = 1000 } = {}) {
    // Stop current music first (instant stop since we're starting fresh)
    if (this.currentMusic) {
      const { audio: oldAudio } = this.currentMusic;
      this._clearFade();
      oldAudio.pause();
      oldAudio.currentTime = 0;
      this.currentMusic = null;
      this.musicFading = false;
    }

    // BE-28: Resume AudioContext if suspended
    if (this._audioContext && this._audioContext.state === 'suspended') {
      this._audioContext.resume().catch(() => {});
    }

    const audio = this._getAudio(trackId);
    if (!audio) return;

    audio.loop = loop;
    this.currentMusic = { trackId, audio };

    const targetVolume = this._getEffectiveVolume('music');

    if (fadeIn > 0 && targetVolume > 0) {
      audio.volume = 0;
      try {
        audio.play().catch(() => {});
      } catch {
        return;
      }
      this._fadeAudio(audio, 0, targetVolume, fadeIn);
    } else {
      audio.volume = targetVolume;
      try {
        audio.play().catch(() => {});
      } catch {
        // Silent fallback
      }
    }
  }

  /**
   * Stop the currently playing music with optional fade-out
   */
  stopMusic({ fadeOut = 1000 } = {}) {
    if (!this.currentMusic) return;

    const { audio } = this.currentMusic;

    if (fadeOut > 0 && audio.volume > 0) {
      this.musicFading = true;
      this.currentMusic = null;
      this._fadeAudio(audio, audio.volume, 0, fadeOut, () => {
        audio.pause();
        audio.currentTime = 0;
        if (this.currentMusic === null) this.musicFading = false;
      });
    } else {
      this._clearFade();
      audio.pause();
      audio.currentTime = 0;
      this.currentMusic = null;
      this.musicFading = false;
    }
  }

  /**
   * Crossfade from current music to a new track
   */
  crossfadeMusic(newTrackId, duration = 2000) {
    const oldMusic = this.currentMusic;

    if (!oldMusic) {
      // No current music, just play the new one
      this.playMusic(newTrackId, { fadeIn: duration / 2 });
      return;
    }

    const { audio: oldAudio } = oldMusic;
    this.musicFading = true;

    // Fade out old track
    this._fadeAudio(oldAudio, oldAudio.volume, 0, duration, () => {
      oldAudio.pause();
      oldAudio.currentTime = 0;
    });

    // Start new track with fade in
    const newAudio = this._getAudio(newTrackId);
    if (!newAudio) {
      this.musicFading = false;
      this.currentMusic = null;
      return;
    }

    newAudio.loop = true;
    newAudio.volume = 0;
    this.currentMusic = { trackId: newTrackId, audio: newAudio };

    try {
      newAudio.play().catch(() => {});
    } catch {
      // Silent fallback
    }

    const targetVolume = this._getEffectiveVolume('music');
    this._fadeAudio(newAudio, 0, targetVolume, duration, () => {
      this.musicFading = false;
    });
  }

  /**
   * Fade audio volume from start to end over duration (ms).
   * AR-09: Returns interval ID so multiple fades can run concurrently.
   */
  _fadeAudio(audio, fromVolume, toVolume, duration, onComplete) {
    const steps = 20;
    const stepTime = duration / steps;
    const volumeStep = (toVolume - fromVolume) / steps;
    let currentStep = 0;

    audio.volume = fromVolume;

    const intervalId = setInterval(() => {
      currentStep++;
      const newVolume = Math.max(0, Math.min(1, fromVolume + volumeStep * currentStep));
      try {
        audio.volume = newVolume;
      } catch {
        // Silent fallback
      }

      if (currentStep >= steps) {
        clearInterval(intervalId);
        this._fadeIntervals = this._fadeIntervals.filter(id => id !== intervalId);
        try {
          audio.volume = Math.max(0, Math.min(1, toVolume));
        } catch {
          // Silent fallback
        }
        if (onComplete) onComplete();
      }
    }, stepTime);

    this._fadeIntervals.push(intervalId);
    return intervalId;
  }

  /**
   * Clear all active fade intervals
   */
  _clearFade() {
    this._fadeIntervals.forEach(id => clearInterval(id));
    this._fadeIntervals = [];
  }

  /**
   * Set master volume (0.0 - 1.0)
   */
  setMasterVolume(level) {
    this.masterVolume = Math.max(0, Math.min(1, level));
    this._updateCurrentMusicVolume();
    this.saveSettings();
  }

  /**
   * Set SFX volume (0.0 - 1.0)
   */
  setSFXVolume(level) {
    this.sfxVolume = Math.max(0, Math.min(1, level));
    this.saveSettings();
  }

  /**
   * Set music volume (0.0 - 1.0)
   */
  setMusicVolume(level) {
    this.musicVolume = Math.max(0, Math.min(1, level));
    this._updateCurrentMusicVolume();
    this.saveSettings();
  }

  /**
   * Set muted state
   */
  setMuted(value) {
    this.muted = Boolean(value);
    this._updateCurrentMusicVolume();
    this.saveSettings();
  }

  /**
   * Toggle muted state
   */
  toggleMute() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  /**
   * Update volume on currently playing music
   */
  _updateCurrentMusicVolume() {
    if (this.currentMusic && this.currentMusic.audio && !this.musicFading) {
      const vol = this._getEffectiveVolume('music');
      try {
        this.currentMusic.audio.volume = vol;
      } catch {
        // Silent fallback
      }
    }
    // AR-16: Update ambient volume (40% of music volume)
    if (this._currentAmbient && this._currentAmbient.audio) {
      const ambientVol = this._getEffectiveVolume('music') * 0.4;
      try {
        this._currentAmbient.audio.volume = ambientVol;
      } catch {
        // Silent fallback
      }
    }
  }

  /**
   * AR-16: Play an ambient loop layered under music.
   * Ambient plays at 40% of music volume for subtle background texture.
   */
  playAmbient(trackId) {
    if (!this._userGestureReceived) {
      this._pendingAudioQueue.push({ type: 'ambient', args: [trackId] });
      return;
    }
    this._playAmbientInternal(trackId);
  }

  /**
   * AR-16: Internal ambient playback.
   */
  _playAmbientInternal(trackId) {
    // Same track already playing — skip
    if (this._currentAmbient && this._currentAmbient.trackId === trackId) return;

    // Fade out old ambient
    if (this._currentAmbient) {
      const { audio: oldAudio } = this._currentAmbient;
      this._fadeAudio(oldAudio, oldAudio.volume, 0, 2000, () => {
        oldAudio.pause();
        oldAudio.currentTime = 0;
      });
      this._currentAmbient = null;
    }

    const audio = this._getAudio(trackId);
    if (!audio) return;

    audio.loop = true;
    this._currentAmbient = { trackId, audio };

    const targetVolume = this._getEffectiveVolume('music') * 0.4;
    audio.volume = 0;
    try {
      audio.play().catch(() => {});
    } catch {
      return;
    }
    this._fadeAudio(audio, 0, targetVolume, 2000);
  }

  /**
   * AR-16: Stop ambient loop with fade out.
   */
  stopAmbient() {
    if (!this._currentAmbient) return;
    const { audio } = this._currentAmbient;
    this._currentAmbient = null;
    this._fadeAudio(audio, audio.volume, 0, 2000, () => {
      audio.pause();
      audio.currentTime = 0;
    });
  }

  /**
   * AR-09: Temporarily reduce music volume (e.g., when settings/pause opens).
   * Fades to 30% of current volume over 300ms.
   */
  duckMusic(fadeDuration = 300) {
    if (this._ducked || !this.currentMusic) return;
    this._ducked = true;
    const { audio } = this.currentMusic;
    const targetVolume = this._getEffectiveVolume('music') * 0.3;
    this._fadeAudio(audio, audio.volume, targetVolume, fadeDuration);
  }

  /**
   * AR-09: Restore music volume after ducking.
   */
  unduckMusic(fadeDuration = 300) {
    if (!this._ducked || !this.currentMusic) return;
    this._ducked = false;
    const { audio } = this.currentMusic;
    const targetVolume = this._getEffectiveVolume('music');
    this._fadeAudio(audio, audio.volume, targetVolume, fadeDuration);
  }

  /**
   * Save audio settings to localStorage
   */
  saveSettings() {
    try {
      const settings = {
        masterVolume: this.masterVolume,
        sfxVolume: this.sfxVolume,
        musicVolume: this.musicVolume,
        muted: this.muted
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Silent fallback if localStorage is unavailable
    }
  }

  /**
   * Load audio settings from localStorage
   */
  loadSettings() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const settings = JSON.parse(stored);
        if (typeof settings.masterVolume === 'number') {
          this.masterVolume = Math.max(0, Math.min(1, settings.masterVolume));
        }
        if (typeof settings.sfxVolume === 'number') {
          this.sfxVolume = Math.max(0, Math.min(1, settings.sfxVolume));
        }
        if (typeof settings.musicVolume === 'number') {
          this.musicVolume = Math.max(0, Math.min(1, settings.musicVolume));
        }
        if (typeof settings.muted === 'boolean') {
          this.muted = settings.muted;
        }
      }
    } catch {
      // Silent fallback if localStorage is unavailable or data is corrupt
    }
  }

  /**
   * Preload a list of sound IDs for faster playback
   */
  preload(soundIds) {
    if (!Array.isArray(soundIds)) return;
    soundIds.forEach(id => {
      this._getAudio(id);
    });
  }

  /**
   * Initialize preload queue: combat sounds are eager (loaded immediately),
   * other categories are lazy (loaded on first use or when idle).
   */
  initPreloadQueue() {
    // Eager: combat sounds loaded immediately
    const combatSounds = Object.values(SOUNDS.combat);
    this._preloadQueue.eager = [...combatSounds];
    this.preload(combatSounds);

    // Lazy: ui, ambient, music sounds loaded on-demand
    const lazySounds = [
      ...Object.values(SOUNDS.ui),
      ...Object.values(SOUNDS.ambient),
      ...Object.values(SOUNDS.music)
    ];
    this._preloadQueue.lazy = [...lazySounds];
  }

  /**
   * Load lazy sounds (call when idle or after initial load).
   * Loads one batch at a time to avoid blocking.
   */
  loadLazySounds(batchSize = 5) {
    const batch = this._preloadQueue.lazy.splice(0, batchSize);
    if (batch.length > 0) {
      this.preload(batch);
    }
    return this._preloadQueue.lazy.length;
  }

  /**
   * Register phase-based music mappings.
   * Phases allow automatic track selection based on game state.
   * @param {Object} phaseMap - { phaseName: trackId }
   * Example: { explore: 'music_map', combat: 'music_combat', boss: 'music_boss' }
   */
  setPhases(phaseMap) {
    if (typeof phaseMap !== 'object' || phaseMap === null) return;
    this._phases = { ...phaseMap };
  }

  /**
   * Get the current phase name
   */
  getCurrentPhase() {
    return this._currentPhase;
  }

  /**
   * Transition to a named music phase.
   * Automatically crossfades to the track associated with the phase.
   * @param {string} phaseName - The phase to transition to
   * @param {number} fadeDuration - Crossfade duration in ms
   */
  setPhase(phaseName, fadeDuration = 2000) {
    if (this._currentPhase === phaseName) return;
    const trackId = this._phases[phaseName];
    if (!trackId) return;

    this._currentPhase = phaseName;

    if (this.currentMusic) {
      this.crossfadeMusic(trackId, fadeDuration);
    } else {
      this.playMusic(trackId, { fadeIn: fadeDuration / 2 });
    }
  }

  /**
   * Get all registered phases
   */
  getPhases() {
    return { ...this._phases };
  }

  /**
   * BE-28: Check if audio system has been fully initialized (user gesture received + preload started).
   */
  isInitialized() {
    return this._initialized;
  }

  /**
   * BE-28: Clean up all audio resources. Call on unmount or before page unload.
   */
  destroy() {
    this._clearFade();
    if (this.currentMusic) {
      try {
        this.currentMusic.audio.pause();
      } catch { /* ignore */ }
      this.currentMusic = null;
    }
    // AR-16: Clean up ambient
    if (this._currentAmbient) {
      try {
        this._currentAmbient.audio.pause();
      } catch { /* ignore */ }
      this._currentAmbient = null;
    }
    this._audioCache = {};
    this._pendingAudioQueue = [];
    if (this._audioContext) {
      try {
        this._audioContext.close().catch(() => {});
      } catch { /* ignore */ }
      this._audioContext = null;
    }
  }
}

export const audioManager = new AudioManager();

// Legacy compatibility exports
export function preloadSounds() {
  const combatSounds = Object.values(SOUNDS.combat);
  audioManager.preload(combatSounds);
}

export function playSound(name) {
  audioManager.playSFX(name, 'combat');
}

export function setMuted(value) {
  audioManager.setMuted(value);
}

export function isMuted() {
  return audioManager.muted;
}

export default audioManager;
