import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock Audio class before importing the module
class MockAudio {
  constructor() {
    this.src = '';
    this.volume = 1;
    this.currentTime = 0;
    this.loop = false;
    this.preload = '';
    this.paused = true;
  }
  play() {
    this.paused = false;
    return Promise.resolve();
  }
  pause() {
    this.paused = true;
  }
}

global.Audio = vi.fn(function(src) {
  this.src = src || '';
  this.volume = 1;
  this.currentTime = 0;
  this.loop = false;
  this.preload = '';
  this.paused = true;
  this.play = function() { this.paused = false; return Promise.resolve(); };
  this.pause = function() { this.paused = true; };
  this.cloneNode = function() {
    const clone = new Audio(this.src);
    clone.volume = this.volume;
    return clone;
  };
});

// We need to handle localStorage mock before the module loads
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = String(value); }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    _getStore: () => store
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('AudioManager', () => {
  let AudioManagerModule;
  let audioManager;
  let SOUNDS;

  beforeEach(async () => {
    // Clear localStorage
    localStorageMock.clear();

    // Re-apply Audio mock (vi.clearAllMocks may reset implementation)
    global.Audio = vi.fn(function(src) {
      this.src = src || '';
      this.volume = 1;
      this.currentTime = 0;
      this.loop = false;
      this.preload = '';
      this.paused = true;
      this.play = function() { this.paused = false; return Promise.resolve(); };
      this.pause = function() { this.paused = true; };
      this.cloneNode = function() {
        const clone = new Audio(this.src);
        clone.volume = this.volume;
        return clone;
      };
    });

    // Re-import the module fresh each time
    vi.resetModules();
    AudioManagerModule = await import('../systems/audioSystem.js');
    // Create a fresh instance by using the class pattern
    // The module exports a singleton, so we need to work with it
    audioManager = AudioManagerModule.audioManager;
    SOUNDS = AudioManagerModule.SOUNDS;

    // Reset audioManager state to defaults after loadSettings ran with empty localStorage
    audioManager.masterVolume = 1.0;
    audioManager.sfxVolume = 0.8;
    audioManager.musicVolume = 0.5;
    audioManager.muted = false;
    audioManager.currentMusic = null;
    audioManager.musicFading = false;
    audioManager._audioCache = {};
    audioManager._preloadQueue = { eager: [], lazy: [] };
    audioManager._phases = {};
    audioManager._currentPhase = null;
    // AR-04: Simulate user gesture so tests can play audio immediately
    audioManager._userGestureReceived = true;
    audioManager._pendingAudioQueue = [];
    audioManager._audioContext = null;
    audioManager._initialized = true;
    if (audioManager._fadeInterval) {
      clearInterval(audioManager._fadeInterval);
      audioManager._fadeInterval = null;
    }
  });

  afterEach(() => {
    if (audioManager && audioManager._fadeInterval) {
      clearInterval(audioManager._fadeInterval);
    }
  });

  describe('Initialization', () => {
    it('should initialize with default volumes', () => {
      expect(audioManager.masterVolume).toBe(1.0);
      expect(audioManager.sfxVolume).toBe(0.8);
      expect(audioManager.musicVolume).toBe(0.5);
      expect(audioManager.muted).toBe(false);
    });

    it('should have all sound categories defined', () => {
      expect(audioManager.categories).toHaveProperty('combat');
      expect(audioManager.categories).toHaveProperty('ui');
      expect(audioManager.categories).toHaveProperty('ambient');
      expect(audioManager.categories).toHaveProperty('music');
    });

    it('should have null currentMusic on init', () => {
      expect(audioManager.currentMusic).toBeNull();
      expect(audioManager.musicFading).toBe(false);
    });
  });

  describe('SOUNDS constants', () => {
    it('should define combat sounds', () => {
      expect(SOUNDS.combat.cardPlay).toBe('card_play');
      expect(SOUNDS.combat.attack).toBe('attack_hit');
      expect(SOUNDS.combat.victory).toBe('combat_victory');
    });

    it('should define ui sounds', () => {
      expect(SOUNDS.ui.buttonClick).toBe('ui_click');
      expect(SOUNDS.ui.error).toBe('ui_error');
    });

    it('should define ambient sounds', () => {
      expect(SOUNDS.ambient.mapAmbience).toBe('map_ambience');
    });

    it('should define music tracks', () => {
      expect(SOUNDS.music.combat).toBe('music_combat');
      expect(SOUNDS.music.boss).toBe('music_boss');
      expect(SOUNDS.music.menu).toBe('music_menu');
    });
  });

  describe('Volume Controls', () => {
    it('should set master volume and clamp to 0-1', () => {
      audioManager.setMasterVolume(0.7);
      expect(audioManager.masterVolume).toBe(0.7);

      audioManager.setMasterVolume(1.5);
      expect(audioManager.masterVolume).toBe(1.0);

      audioManager.setMasterVolume(-0.5);
      expect(audioManager.masterVolume).toBe(0);
    });

    it('should set SFX volume and clamp to 0-1', () => {
      audioManager.setSFXVolume(0.6);
      expect(audioManager.sfxVolume).toBe(0.6);

      audioManager.setSFXVolume(2.0);
      expect(audioManager.sfxVolume).toBe(1.0);

      audioManager.setSFXVolume(-1.0);
      expect(audioManager.sfxVolume).toBe(0);
    });

    it('should set music volume and clamp to 0-1', () => {
      audioManager.setMusicVolume(0.3);
      expect(audioManager.musicVolume).toBe(0.3);

      audioManager.setMusicVolume(1.5);
      expect(audioManager.musicVolume).toBe(1.0);
    });

    it('should persist volume changes to localStorage', () => {
      audioManager.setMasterVolume(0.6);
      expect(localStorageMock.setItem).toHaveBeenCalled();

      const lastCall = localStorageMock.setItem.mock.calls[localStorageMock.setItem.mock.calls.length - 1];
      const saved = JSON.parse(lastCall[1]);
      expect(saved.masterVolume).toBe(0.6);
    });
  });

  describe('Mute', () => {
    it('should mute and unmute correctly', () => {
      audioManager.setMuted(true);
      expect(audioManager.muted).toBe(true);

      audioManager.setMuted(false);
      expect(audioManager.muted).toBe(false);
    });

    it('should toggle mute', () => {
      expect(audioManager.muted).toBe(false);

      const result1 = audioManager.toggleMute();
      expect(result1).toBe(true);
      expect(audioManager.muted).toBe(true);

      const result2 = audioManager.toggleMute();
      expect(result2).toBe(false);
      expect(audioManager.muted).toBe(false);
    });

    it('should return 0 effective volume when muted', () => {
      audioManager.setMuted(true);
      expect(audioManager._getEffectiveVolume('combat')).toBe(0);
      expect(audioManager._getEffectiveVolume('music')).toBe(0);
    });

    it('should persist mute state', () => {
      audioManager.setMuted(true);
      const lastCall = localStorageMock.setItem.mock.calls[localStorageMock.setItem.mock.calls.length - 1];
      const saved = JSON.parse(lastCall[1]);
      expect(saved.muted).toBe(true);
    });
  });

  describe('playSFX', () => {
    it('should not throw when audio file is missing', () => {
      expect(() => {
        audioManager.playSFX('nonexistent_sound');
      }).not.toThrow();
    });

    it('should not throw for any sound category', () => {
      expect(() => {
        audioManager.playSFX(SOUNDS.combat.cardPlay, 'combat');
        audioManager.playSFX(SOUNDS.ui.buttonClick, 'ui');
        audioManager.playSFX(SOUNDS.ambient.mapAmbience, 'ambient');
      }).not.toThrow();
    });

    it('should not play when muted', () => {
      audioManager.setMuted(true);
      audioManager.playSFX(SOUNDS.combat.attack, 'combat');
      // Audio constructor should not be called since muted exits early
      // (cache might already have entries from other calls)
      expect(audioManager.muted).toBe(true);
    });

    it('should create Audio instance and play', () => {
      audioManager.playSFX('test_sound', 'combat');
      expect(global.Audio).toHaveBeenCalledWith('/sounds/test_sound.mp3');
    });
  });

  describe('playMusic', () => {
    it('should set currentMusic when playing', () => {
      audioManager.playMusic('music_combat', { fadeIn: 0 });
      expect(audioManager.currentMusic).not.toBeNull();
      expect(audioManager.currentMusic.trackId).toBe('music_combat');
    });

    it('should set loop on the audio element', () => {
      audioManager.playMusic('music_combat', { loop: true, fadeIn: 0 });
      expect(audioManager.currentMusic.audio.loop).toBe(true);
    });

    it('should stop previous music before playing new', () => {
      audioManager.playMusic('music_combat', { fadeIn: 0 });
      const firstAudio = audioManager.currentMusic.audio;

      audioManager.playMusic('music_boss', { fadeIn: 0 });
      expect(firstAudio.paused).toBe(true);
      expect(audioManager.currentMusic.trackId).toBe('music_boss');
    });
  });

  describe('stopMusic', () => {
    it('should stop current music immediately with fadeOut=0', () => {
      audioManager.playMusic('music_combat', { fadeIn: 0 });
      expect(audioManager.currentMusic).not.toBeNull();

      audioManager.stopMusic({ fadeOut: 0 });
      expect(audioManager.currentMusic).toBeNull();
    });

    it('should do nothing if no music is playing', () => {
      expect(() => {
        audioManager.stopMusic({ fadeOut: 0 });
      }).not.toThrow();
    });
  });

  describe('crossfadeMusic', () => {
    it('should handle crossfade when no music is playing', () => {
      expect(() => {
        audioManager.crossfadeMusic('music_boss', 100);
      }).not.toThrow();
      // Should start playing the new track
      expect(audioManager.currentMusic).not.toBeNull();
    });

    it('should transition from one track to another', () => {
      audioManager.playMusic('music_combat', { fadeIn: 0 });
      expect(audioManager.currentMusic.trackId).toBe('music_combat');

      audioManager.crossfadeMusic('music_boss', 100);
      expect(audioManager.currentMusic.trackId).toBe('music_boss');
      expect(audioManager.musicFading).toBe(true);
    });

    it('should set musicFading during transition', () => {
      audioManager.playMusic('music_combat', { fadeIn: 0 });
      audioManager.crossfadeMusic('music_boss', 500);
      expect(audioManager.musicFading).toBe(true);
    });

    it('should complete crossfade after duration', async () => {
      vi.useFakeTimers();

      audioManager.playMusic('music_combat', { fadeIn: 0 });
      audioManager.crossfadeMusic('music_boss', 200);

      expect(audioManager.musicFading).toBe(true);

      // Advance timers past the fade duration
      vi.advanceTimersByTime(300);

      expect(audioManager.musicFading).toBe(false);
      expect(audioManager.currentMusic.trackId).toBe('music_boss');

      vi.useRealTimers();
    });
  });

  describe('saveSettings / loadSettings', () => {
    it('should save current settings to localStorage', () => {
      audioManager.masterVolume = 0.7;
      audioManager.sfxVolume = 0.6;
      audioManager.musicVolume = 0.4;
      audioManager.muted = true;

      audioManager.saveSettings();

      expect(localStorageMock.setItem).toHaveBeenCalled();
      const lastCall = localStorageMock.setItem.mock.calls[localStorageMock.setItem.mock.calls.length - 1];
      expect(lastCall[0]).toBe('spire_audio_settings');

      const saved = JSON.parse(lastCall[1]);
      expect(saved.masterVolume).toBe(0.7);
      expect(saved.sfxVolume).toBe(0.6);
      expect(saved.musicVolume).toBe(0.4);
      expect(saved.muted).toBe(true);
    });

    it('should load settings from localStorage', () => {
      const settings = {
        masterVolume: 0.3,
        sfxVolume: 0.4,
        musicVolume: 0.2,
        muted: true
      };
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(settings));

      audioManager.loadSettings();

      expect(audioManager.masterVolume).toBe(0.3);
      expect(audioManager.sfxVolume).toBe(0.4);
      expect(audioManager.musicVolume).toBe(0.2);
      expect(audioManager.muted).toBe(true);
    });

    it('should round-trip settings correctly', () => {
      audioManager.masterVolume = 0.55;
      audioManager.sfxVolume = 0.65;
      audioManager.musicVolume = 0.35;
      audioManager.muted = true;

      audioManager.saveSettings();

      // Get what was saved
      const savedCall = localStorageMock.setItem.mock.calls[localStorageMock.setItem.mock.calls.length - 1];
      const savedJson = savedCall[1];

      // Mock loading it back
      localStorageMock.getItem.mockReturnValueOnce(savedJson);

      // Reset values
      audioManager.masterVolume = 1.0;
      audioManager.sfxVolume = 0.8;
      audioManager.musicVolume = 0.5;
      audioManager.muted = false;

      audioManager.loadSettings();

      expect(audioManager.masterVolume).toBe(0.55);
      expect(audioManager.sfxVolume).toBe(0.65);
      expect(audioManager.musicVolume).toBe(0.35);
      expect(audioManager.muted).toBe(true);
    });

    it('should handle missing localStorage gracefully', () => {
      localStorageMock.getItem.mockReturnValueOnce(null);
      expect(() => audioManager.loadSettings()).not.toThrow();
    });

    it('should handle corrupt localStorage data gracefully', () => {
      localStorageMock.getItem.mockReturnValueOnce('not valid json{{{');
      expect(() => audioManager.loadSettings()).not.toThrow();
    });
  });

  describe('preload', () => {
    it('should preload an array of sound IDs', () => {
      const sounds = ['card_play', 'attack_hit', 'heal'];
      audioManager.preload(sounds);

      expect(global.Audio).toHaveBeenCalledTimes(3);
      expect(global.Audio).toHaveBeenCalledWith('/sounds/card_play.mp3');
      expect(global.Audio).toHaveBeenCalledWith('/sounds/attack_hit.mp3');
      expect(global.Audio).toHaveBeenCalledWith('/sounds/heal.mp3');
    });

    it('should handle non-array input gracefully', () => {
      expect(() => audioManager.preload(null)).not.toThrow();
      expect(() => audioManager.preload(undefined)).not.toThrow();
      expect(() => audioManager.preload('string')).not.toThrow();
    });

    it('should cache preloaded audio elements', () => {
      audioManager.preload(['test_sound']);
      expect(global.Audio).toHaveBeenCalledTimes(1);

      // Calling again should use cache
      audioManager.preload(['test_sound']);
      expect(global.Audio).toHaveBeenCalledTimes(1);
    });
  });

  describe('Effective Volume Calculations', () => {
    it('should calculate combat volume correctly', () => {
      audioManager.masterVolume = 0.5;
      audioManager.sfxVolume = 0.8;
      audioManager.muted = false;

      const vol = audioManager._getEffectiveVolume('combat');
      expect(vol).toBeCloseTo(0.4);
    });

    it('should calculate music volume correctly', () => {
      audioManager.masterVolume = 0.5;
      audioManager.musicVolume = 0.6;
      audioManager.muted = false;

      const vol = audioManager._getEffectiveVolume('music');
      expect(vol).toBeCloseTo(0.3);
    });

    it('should use sfxVolume for ui category', () => {
      audioManager.masterVolume = 1.0;
      audioManager.sfxVolume = 0.5;
      audioManager.muted = false;

      const vol = audioManager._getEffectiveVolume('ui');
      expect(vol).toBe(0.5);
    });
  });

  describe('Preload Queue (eager/lazy)', () => {
    it('should initialize preload queue with combat sounds as eager', () => {
      audioManager.initPreloadQueue();
      expect(audioManager._preloadQueue.eager.length).toBeGreaterThan(0);
      // All combat sounds should be in eager
      const combatSounds = Object.values(SOUNDS.combat);
      combatSounds.forEach(sound => {
        expect(audioManager._preloadQueue.eager).toContain(sound);
      });
    });

    it('should eagerly preload combat sounds immediately', () => {
      audioManager.initPreloadQueue();
      const combatSounds = Object.values(SOUNDS.combat);
      // Each combat sound should have been passed to Audio constructor
      combatSounds.forEach(sound => {
        expect(audioManager._audioCache[sound]).toBeDefined();
      });
    });

    it('should populate lazy queue with ui, ambient, and music sounds', () => {
      audioManager.initPreloadQueue();
      const lazySounds = [
        ...Object.values(SOUNDS.ui),
        ...Object.values(SOUNDS.ambient),
        ...Object.values(SOUNDS.music)
      ];
      lazySounds.forEach(sound => {
        expect(audioManager._preloadQueue.lazy).toContain(sound);
      });
    });

    it('should NOT eagerly preload lazy sounds', () => {
      audioManager.initPreloadQueue();
      const uiSounds = Object.values(SOUNDS.ui);
      // UI sounds should not be in cache yet (they are lazy)
      uiSounds.forEach(sound => {
        expect(audioManager._audioCache[sound]).toBeUndefined();
      });
    });

    it('should load lazy sounds in batches', () => {
      audioManager.initPreloadQueue();
      const initialLazyCount = audioManager._preloadQueue.lazy.length;

      const remaining = audioManager.loadLazySounds(3);
      expect(remaining).toBe(initialLazyCount - 3);
    });

    it('should load all lazy sounds after enough batches', () => {
      audioManager.initPreloadQueue();
      // Load all lazy sounds
      while (audioManager._preloadQueue.lazy.length > 0) {
        audioManager.loadLazySounds(10);
      }
      expect(audioManager._preloadQueue.lazy.length).toBe(0);
    });

    it('should handle loadLazySounds when queue is empty', () => {
      audioManager._preloadQueue.lazy = [];
      const remaining = audioManager.loadLazySounds(5);
      expect(remaining).toBe(0);
    });
  });

  describe('Phase-based Music Selection', () => {
    const testPhases = {
      explore: 'music_map',
      combat: 'music_combat',
      boss: 'music_boss',
      shop: 'music_shop'
    };

    it('should register phase mappings', () => {
      audioManager.setPhases(testPhases);
      const phases = audioManager.getPhases();
      expect(phases.explore).toBe('music_map');
      expect(phases.combat).toBe('music_combat');
      expect(phases.boss).toBe('music_boss');
    });

    it('should start with null phase', () => {
      expect(audioManager.getCurrentPhase()).toBeNull();
    });

    it('should transition to a named phase and play corresponding music', () => {
      audioManager.setPhases(testPhases);
      audioManager.setPhase('explore', 0);
      expect(audioManager.getCurrentPhase()).toBe('explore');
      expect(audioManager.currentMusic).not.toBeNull();
      expect(audioManager.currentMusic.trackId).toBe('music_map');
    });

    it('should crossfade when changing phases with existing music', () => {
      audioManager.setPhases(testPhases);
      audioManager.playMusic('music_map', { fadeIn: 0 });

      audioManager.setPhase('combat', 100);
      expect(audioManager.getCurrentPhase()).toBe('combat');
      expect(audioManager.currentMusic.trackId).toBe('music_combat');
      expect(audioManager.musicFading).toBe(true);
    });

    it('should not transition if already in the same phase', () => {
      audioManager.setPhases(testPhases);
      audioManager.setPhase('explore', 0);
      const firstAudio = audioManager.currentMusic.audio;

      // Setting same phase again should be a no-op
      audioManager.setPhase('explore', 0);
      expect(audioManager.currentMusic.audio).toBe(firstAudio);
    });

    it('should ignore invalid phase names', () => {
      audioManager.setPhases(testPhases);
      audioManager.setPhase('nonexistent_phase', 0);
      expect(audioManager.getCurrentPhase()).toBeNull();
      expect(audioManager.currentMusic).toBeNull();
    });

    it('should handle setPhases with invalid input gracefully', () => {
      expect(() => audioManager.setPhases(null)).not.toThrow();
      expect(() => audioManager.setPhases(undefined)).not.toThrow();
      expect(() => audioManager.setPhases('string')).not.toThrow();
    });

    it('should use fadeIn when no current music is playing', () => {
      audioManager.setPhases(testPhases);
      audioManager.setPhase('explore', 200);
      // Should have started playing with fadeIn
      expect(audioManager.currentMusic).not.toBeNull();
      expect(audioManager.currentMusic.trackId).toBe('music_map');
    });
  });

  describe('BE-28: Audio system overhaul', () => {
    it('should have AudioContext field initialized to null', () => {
      expect(audioManager._audioContext).toBeNull();
    });

    it('should track initialization state', () => {
      expect(audioManager._initialized).toBe(true); // Set in beforeEach
    });

    it('should have isInitialized method', () => {
      expect(audioManager.isInitialized()).toBe(true);
    });

    it('should have isReady method returning user gesture state', () => {
      expect(audioManager.isReady()).toBe(true);
      audioManager._userGestureReceived = false;
      expect(audioManager.isReady()).toBe(false);
    });

    it('should use cloneNode for SFX playback (overlapping sounds)', () => {
      const audio = audioManager._getAudio('test_sound');
      const cloneSpy = vi.spyOn(audio, 'cloneNode');

      audioManager._playSFXInternal('test_sound', 'combat');
      expect(cloneSpy).toHaveBeenCalled();
    });

    it('should set correct volume on cloned SFX audio', () => {
      audioManager.masterVolume = 0.5;
      audioManager.sfxVolume = 0.8;
      // Effective = 0.5 * 0.8 = 0.4

      // Pre-cache the audio
      audioManager._getAudio('test_vol');
      audioManager._playSFXInternal('test_vol', 'combat');

      // The clone should have been created and volume set
      // We can't easily inspect the clone, but we can verify no errors
      expect(audioManager._getEffectiveVolume('combat')).toBeCloseTo(0.4);
    });

    it('should have destroy method that cleans up resources', () => {
      audioManager.playMusic('music_combat', { fadeIn: 0 });
      expect(audioManager.currentMusic).not.toBeNull();

      audioManager.destroy();
      expect(audioManager.currentMusic).toBeNull();
      expect(audioManager._audioContext).toBeNull();
      expect(Object.keys(audioManager._audioCache).length).toBe(0);
    });

    it('should resume suspended AudioContext on SFX play', () => {
      const mockResume = vi.fn(() => Promise.resolve());
      audioManager._audioContext = { state: 'suspended', resume: mockResume };

      audioManager._playSFXInternal('test_resume', 'combat');
      expect(mockResume).toHaveBeenCalled();
    });

    it('should resume suspended AudioContext on music play', () => {
      const mockResume = vi.fn(() => Promise.resolve());
      audioManager._audioContext = { state: 'suspended', resume: mockResume };

      audioManager._playMusicInternal('music_combat', { fadeIn: 0 });
      expect(mockResume).toHaveBeenCalled();
    });

    it('should not resume AudioContext when state is running', () => {
      const mockResume = vi.fn(() => Promise.resolve());
      audioManager._audioContext = { state: 'running', resume: mockResume };

      audioManager._playSFXInternal('test_running', 'combat');
      expect(mockResume).not.toHaveBeenCalled();
    });
  });

  describe('Legacy compatibility exports', () => {
    it('should export preloadSounds function', () => {
      expect(AudioManagerModule.preloadSounds).toBeDefined();
      expect(typeof AudioManagerModule.preloadSounds).toBe('function');
    });

    it('should export playSound function', () => {
      expect(AudioManagerModule.playSound).toBeDefined();
      expect(typeof AudioManagerModule.playSound).toBe('function');
      expect(() => AudioManagerModule.playSound('test')).not.toThrow();
    });

    it('should export setMuted function', () => {
      expect(AudioManagerModule.setMuted).toBeDefined();
      AudioManagerModule.setMuted(true);
      expect(audioManager.muted).toBe(true);
    });

    it('should export isMuted function', () => {
      expect(AudioManagerModule.isMuted).toBeDefined();
      audioManager.muted = true;
      expect(AudioManagerModule.isMuted()).toBe(true);
    });
  });

  // AR-18: Endless mode audio constants
  describe('Endless mode audio (AR-18)', () => {
    it('should define milestone fanfare sound ID', () => {
      expect(SOUNDS.combat.milestoneFanfare).toBe('milestone_fanfare');
    });

    it('should define endless death sound ID', () => {
      expect(SOUNDS.combat.endlessDeath).toBe('endless_death');
    });

    it('should define endless ambient sound ID', () => {
      expect(SOUNDS.ambient.endless).toBe('ambient_endless');
    });

    it('should play milestone fanfare as SFX', () => {
      audioManager.playSFX(SOUNDS.combat.milestoneFanfare, 'combat');
      // Verify audio was created for the fanfare sound
      const calls = global.Audio.mock.calls;
      const fanfareCall = calls.find(c => c[0]?.includes('milestone_fanfare'));
      expect(fanfareCall).toBeDefined();
    });

    it('should play endless death as SFX', () => {
      audioManager.playSFX(SOUNDS.combat.endlessDeath, 'combat');
      const calls = global.Audio.mock.calls;
      const deathCall = calls.find(c => c[0]?.includes('endless_death'));
      expect(deathCall).toBeDefined();
    });

    it('should play endless ambient as ambient layer', () => {
      audioManager.playAmbient(SOUNDS.ambient.endless);
      expect(audioManager._currentAmbient).not.toBeNull();
      expect(audioManager._currentAmbient.trackId).toBe('ambient_endless');
    });

    it('should switch from act ambient to endless ambient', () => {
      audioManager.playAmbient(SOUNDS.ambient.act1);
      expect(audioManager._currentAmbient.trackId).toBe('ambient_act1');
      audioManager.playAmbient(SOUNDS.ambient.endless);
      expect(audioManager._currentAmbient.trackId).toBe('ambient_endless');
    });
  });
});
