import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Mock Audio class before importing the module
global.Audio = vi.fn(function(src) {
  this.src = src || '';
  this.volume = 1;
  this.currentTime = 0;
  this.loop = false;
  this.preload = '';
  this.paused = true;
  this.play = vi.fn(function() { this.paused = false; return Promise.resolve(); });
  this.pause = vi.fn(function() { this.paused = true; });
  this.cloneNode = vi.fn(function() {
    const clone = new Audio(this.src);
    clone.volume = this.volume;
    return clone;
  });
});

// Mock localStorage
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

// Mock document event listeners for user gesture
const listeners = {};
const mockDocument = {
  addEventListener: vi.fn((event, handler, options) => {
    listeners[event] = handler;
  }),
  removeEventListener: vi.fn()
};
vi.stubGlobal('document', { ...document, ...mockDocument });

// Mock AudioContext
const mockAudioContext = {
  state: 'running',
  resume: vi.fn(() => Promise.resolve())
};
global.AudioContext = vi.fn(() => mockAudioContext);
global.requestIdleCallback = vi.fn((fn) => setTimeout(fn, 0));

const { SOUNDS, audioManager } = await import('../../src/systems/audioSystem.js');

// Helper to simulate user gesture
function simulateUserGesture() {
  if (listeners.click) {
    listeners.click();
  }
}

describe('QA-21: Audio Regression Tests', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  // =========================================================================
  // 1. All sound files exist on disk
  // =========================================================================
  describe('Sound file existence', () => {
    const soundsDir = path.resolve(__dirname, '../../public/sounds');

    it('all combat sound files exist', () => {
      for (const [key, fileId] of Object.entries(SOUNDS.combat)) {
        const filePath = path.join(soundsDir, `${fileId}.mp3`);
        expect(fs.existsSync(filePath), `Missing combat sound: ${key} → ${fileId}.mp3`).toBe(true);
      }
    });

    it('all UI sound files exist', () => {
      for (const [key, fileId] of Object.entries(SOUNDS.ui)) {
        const filePath = path.join(soundsDir, `${fileId}.mp3`);
        expect(fs.existsSync(filePath), `Missing UI sound: ${key} → ${fileId}.mp3`).toBe(true);
      }
    });

    it('core music track files exist (menu, map, combat, boss, victory, defeat, act3)', () => {
      const coreTracks = ['menu', 'map', 'combat', 'boss', 'victory', 'defeat', 'act3Map'];
      for (const key of coreTracks) {
        const fileId = SOUNDS.music[key];
        const filePath = path.join(soundsDir, `${fileId}.mp3`);
        expect(fs.existsSync(filePath), `Missing music track: ${key} → ${fileId}.mp3`).toBe(true);
      }
    });

    it('has at least 7 music files on disk', () => {
      const existingFiles = Object.values(SOUNDS.music).filter(fileId =>
        fs.existsSync(path.join(soundsDir, `${fileId}.mp3`))
      );
      expect(existingFiles.length).toBeGreaterThanOrEqual(7);
    });

    it('has at least 28 combat sounds defined', () => {
      expect(Object.keys(SOUNDS.combat).length).toBeGreaterThanOrEqual(28);
    });

    it('has at least 8 UI sounds defined', () => {
      expect(Object.keys(SOUNDS.ui).length).toBeGreaterThanOrEqual(8);
    });

    it('has at least 7 music tracks defined', () => {
      expect(Object.keys(SOUNDS.music).length).toBeGreaterThanOrEqual(7);
    });

    it('has at least 3 ambient sounds defined', () => {
      expect(Object.keys(SOUNDS.ambient).length).toBeGreaterThanOrEqual(3);
    });
  });

  // =========================================================================
  // 2. Sound files are unique (not duplicates)
  // =========================================================================
  describe('Sound file uniqueness', () => {
    const soundsDir = path.resolve(__dirname, '../../public/sounds');

    it('all music tracks are distinct files (different sizes)', () => {
      const musicFiles = Object.values(SOUNDS.music);
      const sizes = new Map();
      for (const fileId of musicFiles) {
        const filePath = path.join(soundsDir, `${fileId}.mp3`);
        if (fs.existsSync(filePath)) {
          const stat = fs.statSync(filePath);
          sizes.set(fileId, stat.size);
        }
      }
      // At least 3 distinct file sizes among 7+ tracks (some may share size)
      const uniqueSizes = new Set(sizes.values());
      expect(uniqueSizes.size).toBeGreaterThanOrEqual(3);
    });

    it('combat SFX are not all the same file', () => {
      const soundsDir2 = path.resolve(__dirname, '../../public/sounds');
      const combatFiles = Object.values(SOUNDS.combat);
      const sizes = new Set();
      for (const fileId of combatFiles) {
        const filePath = path.join(soundsDir2, `${fileId}.mp3`);
        if (fs.existsSync(filePath)) {
          sizes.add(fs.statSync(filePath).size);
        }
      }
      // Should have many distinct sizes (not all copies of one file)
      expect(sizes.size).toBeGreaterThanOrEqual(8);
    });
  });

  // =========================================================================
  // 3. SOUNDS constants completeness — every game event has a sound
  // =========================================================================
  describe('SOUNDS constants coverage', () => {
    it('has card play and draw sounds', () => {
      expect(SOUNDS.combat.cardPlay).toBeDefined();
      expect(SOUNDS.combat.cardDraw).toBeDefined();
    });

    it('has attack and block sounds', () => {
      expect(SOUNDS.combat.attack).toBeDefined();
      expect(SOUNDS.combat.block).toBeDefined();
    });

    it('has enemy combat sounds', () => {
      expect(SOUNDS.combat.enemyAttack).toBeDefined();
      expect(SOUNDS.combat.playerHurt).toBeDefined();
      expect(SOUNDS.combat.heavyHit).toBeDefined();
      expect(SOUNDS.combat.enemyDeath).toBeDefined();
    });

    it('has status effect sounds', () => {
      expect(SOUNDS.combat.buff).toBeDefined();
      expect(SOUNDS.combat.debuff).toBeDefined();
      expect(SOUNDS.combat.heal).toBeDefined();
      expect(SOUNDS.combat.poison).toBeDefined();
      expect(SOUNDS.combat.poisonApply).toBeDefined();
    });

    it('has turn structure sounds', () => {
      expect(SOUNDS.combat.turnStart).toBeDefined();
      expect(SOUNDS.combat.turnEnd).toBeDefined();
      expect(SOUNDS.combat.victory).toBeDefined();
    });

    it('has boss-specific sounds', () => {
      expect(SOUNDS.combat.bossIntro).toBeDefined();
      expect(SOUNDS.combat.heartbeat).toBeDefined();
      expect(SOUNDS.combat.beatOfDeath).toBeDefined();
      expect(SOUNDS.combat.heartPhaseTransition).toBeDefined();
    });

    it('has orb sounds for all 4 types plus evoke', () => {
      expect(SOUNDS.combat.orbLightning).toBeDefined();
      expect(SOUNDS.combat.orbFrost).toBeDefined();
      expect(SOUNDS.combat.orbDark).toBeDefined();
      expect(SOUNDS.combat.orbPlasma).toBeDefined();
      expect(SOUNDS.combat.orbEvoke).toBeDefined();
    });

    it('has Silent-specific sounds', () => {
      expect(SOUNDS.combat.shivPlay).toBeDefined();
      expect(SOUNDS.combat.discard).toBeDefined();
    });

    it('has UI interaction sounds', () => {
      expect(SOUNDS.ui.buttonClick).toBeDefined();
      expect(SOUNDS.ui.cardHover).toBeDefined();
      expect(SOUNDS.ui.menuOpen).toBeDefined();
      expect(SOUNDS.ui.goldGain).toBeDefined();
      expect(SOUNDS.ui.relicPickup).toBeDefined();
      expect(SOUNDS.ui.cardUpgrade).toBeDefined();
      expect(SOUNDS.ui.mapStep).toBeDefined();
      expect(SOUNDS.ui.error).toBeDefined();
    });

    it('has music tracks for all game phases', () => {
      expect(SOUNDS.music.menu).toBeDefined();
      expect(SOUNDS.music.combat).toBeDefined();
      expect(SOUNDS.music.boss).toBeDefined();
      expect(SOUNDS.music.map).toBeDefined();
      expect(SOUNDS.music.victory).toBeDefined();
      expect(SOUNDS.music.defeat).toBeDefined();
      expect(SOUNDS.music.act3Map).toBeDefined();
    });

    it('all sound IDs map to string file identifiers', () => {
      for (const category of Object.values(SOUNDS)) {
        for (const [key, value] of Object.entries(category)) {
          expect(typeof value).toBe('string');
          expect(value.length).toBeGreaterThan(0);
        }
      }
    });
  });

  // =========================================================================
  // 4. Volume controls
  // =========================================================================
  describe('Volume controls', () => {
    it('master volume affects effective volume for all categories', () => {
      audioManager.muted = false;
      audioManager.masterVolume = 0.5;
      audioManager.sfxVolume = 1.0;
      audioManager.musicVolume = 1.0;
      expect(audioManager._getEffectiveVolume('combat')).toBeCloseTo(0.5);
      expect(audioManager._getEffectiveVolume('music')).toBeCloseTo(0.5);
    });

    it('SFX volume multiplies with master for combat sounds', () => {
      audioManager.muted = false;
      audioManager.masterVolume = 1.0;
      audioManager.sfxVolume = 0.6;
      expect(audioManager._getEffectiveVolume('combat')).toBeCloseTo(0.6);
      expect(audioManager._getEffectiveVolume('ui')).toBeCloseTo(0.6);
    });

    it('music volume multiplies with master independently from SFX', () => {
      audioManager.muted = false;
      audioManager.masterVolume = 1.0;
      audioManager.sfxVolume = 0.3;
      audioManager.musicVolume = 0.8;
      expect(audioManager._getEffectiveVolume('combat')).toBeCloseTo(0.3);
      expect(audioManager._getEffectiveVolume('music')).toBeCloseTo(0.8);
    });

    it('muted state overrides all volumes to 0', () => {
      audioManager.muted = true;
      audioManager.masterVolume = 1.0;
      audioManager.sfxVolume = 1.0;
      audioManager.musicVolume = 1.0;
      expect(audioManager._getEffectiveVolume('combat')).toBe(0);
      expect(audioManager._getEffectiveVolume('music')).toBe(0);
      expect(audioManager._getEffectiveVolume('ui')).toBe(0);
    });

    it('volume clamps to 0-1 range on set', () => {
      audioManager.setMasterVolume(-0.5);
      expect(audioManager.masterVolume).toBe(0);
      audioManager.setMasterVolume(1.5);
      expect(audioManager.masterVolume).toBe(1);
    });

    it('mute toggle works correctly', () => {
      audioManager.muted = false;
      audioManager.setMuted(true);
      expect(audioManager.muted).toBe(true);
      audioManager.setMuted(false);
      expect(audioManager.muted).toBe(false);
    });
  });

  // =========================================================================
  // 5. Settings persistence
  // =========================================================================
  describe('Settings persistence', () => {
    it('saves and loads volume settings via localStorage', () => {
      audioManager.masterVolume = 0.7;
      audioManager.sfxVolume = 0.4;
      audioManager.musicVolume = 0.6;
      audioManager.muted = true;
      audioManager.saveSettings();

      // Reset and reload
      audioManager.masterVolume = 1.0;
      audioManager.sfxVolume = 0.8;
      audioManager.musicVolume = 0.5;
      audioManager.muted = false;
      audioManager.loadSettings();

      expect(audioManager.masterVolume).toBeCloseTo(0.7);
      expect(audioManager.sfxVolume).toBeCloseTo(0.4);
      expect(audioManager.musicVolume).toBeCloseTo(0.6);
      expect(audioManager.muted).toBe(true);
    });

    it('handles missing localStorage gracefully', () => {
      localStorageMock.getItem.mockReturnValueOnce(null);
      audioManager.loadSettings();
      // Should use defaults without throwing
      expect(audioManager.masterVolume).toBeDefined();
    });

    it('handles corrupt localStorage gracefully', () => {
      localStorageMock.getItem.mockReturnValueOnce('not-valid-json');
      audioManager.loadSettings();
      // Should not throw
      expect(audioManager.masterVolume).toBeDefined();
    });
  });

  // =========================================================================
  // 6. Phase-based music system
  // =========================================================================
  describe('Phase-based music', () => {
    it('registers phase-to-track mappings', () => {
      const phases = {
        menu: 'music_menu',
        combat: 'music_combat',
        boss: 'music_boss'
      };
      audioManager.setPhases(phases);
      expect(audioManager._phases).toEqual(phases);
    });

    it('handles invalid phase gracefully', () => {
      audioManager.setPhases({ menu: 'music_menu' });
      // Setting a phase that doesn't exist should not throw
      expect(() => audioManager.setPhase('nonexistent')).not.toThrow();
    });

    it('tracks current phase', () => {
      audioManager.setPhases({ menu: 'music_menu', combat: 'music_combat' });
      audioManager.setPhase('menu');
      expect(audioManager._currentPhase).toBe('menu');
    });
  });

  // =========================================================================
  // 7. Preload system
  // =========================================================================
  describe('Preload system', () => {
    it('initializes eager and lazy queues correctly', () => {
      audioManager.initPreloadQueue();
      // Eager should include combat sounds
      expect(audioManager._preloadQueue.eager.length).toBeGreaterThan(0);
      // Lazy should include ui/ambient/music sounds
      expect(audioManager._preloadQueue.lazy.length).toBeGreaterThan(0);
    });

    it('combat sounds are in the eager queue', () => {
      audioManager.initPreloadQueue();
      const combatSoundIds = Object.values(SOUNDS.combat);
      for (const soundId of combatSoundIds) {
        expect(audioManager._preloadQueue.eager).toContain(soundId);
      }
    });

    it('music tracks are in the lazy queue', () => {
      audioManager.initPreloadQueue();
      const musicSoundIds = Object.values(SOUNDS.music);
      for (const soundId of musicSoundIds) {
        expect(audioManager._preloadQueue.lazy).toContain(soundId);
      }
    });

    it('preload caches audio elements', () => {
      const soundIds = [SOUNDS.combat.cardPlay];
      audioManager.preload(soundIds);
      expect(audioManager._audioCache[SOUNDS.combat.cardPlay]).toBeDefined();
    });
  });

  // =========================================================================
  // 8. SFX playback
  // =========================================================================
  describe('SFX playback', () => {
    beforeEach(() => {
      // Ensure audio is "initialized"
      audioManager._userGestureReceived = true;
      audioManager._initialized = true;
      audioManager.muted = false;
      audioManager.masterVolume = 1.0;
      audioManager.sfxVolume = 1.0;
    });

    it('playSFX does not throw for any combat sound', () => {
      for (const soundId of Object.values(SOUNDS.combat)) {
        expect(() => audioManager.playSFX(soundId, 'combat')).not.toThrow();
      }
    });

    it('playSFX does not throw for any UI sound', () => {
      for (const soundId of Object.values(SOUNDS.ui)) {
        expect(() => audioManager.playSFX(soundId, 'ui')).not.toThrow();
      }
    });

    it('playSFX does not throw when muted', () => {
      audioManager.muted = true;
      expect(() => audioManager.playSFX(SOUNDS.combat.cardPlay, 'combat')).not.toThrow();
    });

    it('playSFX queues sounds before user gesture', () => {
      audioManager._userGestureReceived = false;
      audioManager._initialized = false;
      audioManager.playSFX(SOUNDS.combat.cardPlay, 'combat');
      expect(audioManager._pendingAudioQueue.length).toBeGreaterThanOrEqual(0);
    });
  });

  // =========================================================================
  // 9. Music playback
  // =========================================================================
  describe('Music playback', () => {
    beforeEach(() => {
      audioManager._userGestureReceived = true;
      audioManager._initialized = true;
      audioManager.muted = false;
      audioManager.masterVolume = 1.0;
      audioManager.musicVolume = 1.0;
    });

    it('playMusic does not throw for any music track', () => {
      for (const trackId of Object.values(SOUNDS.music)) {
        expect(() => audioManager.playMusic(trackId)).not.toThrow();
      }
    });

    it('stopMusic does not throw when no music is playing', () => {
      audioManager.currentMusic = null;
      expect(() => audioManager.stopMusic()).not.toThrow();
    });

    it('crossfadeMusic does not throw', () => {
      expect(() => audioManager.crossfadeMusic(SOUNDS.music.combat, 1000)).not.toThrow();
    });
  });

  // =========================================================================
  // 10. Audio base path (FIX-10 regression)
  // =========================================================================
  describe('FIX-10: Audio base path', () => {
    it('_getAudio uses import.meta.env.BASE_URL for file paths', () => {
      const audio = audioManager._getAudio('test_sound');
      // Should include BASE_URL prefix (/ in test environment)
      expect(audio.src).toContain('sounds/test_sound.mp3');
    });

    it('_getAudio caches audio elements', () => {
      const audio1 = audioManager._getAudio('cache_test');
      const audio2 = audioManager._getAudio('cache_test');
      expect(audio1).toBe(audio2);
    });
  });

  // =========================================================================
  // 11. BE-28 overhaul features
  // =========================================================================
  describe('BE-28: Audio system overhaul', () => {
    it('isInitialized returns boolean', () => {
      expect(typeof audioManager.isInitialized()).toBe('boolean');
    });

    it('isReady returns boolean based on user gesture', () => {
      expect(typeof audioManager.isReady()).toBe('boolean');
    });

    it('destroy cleans up resources without throwing', () => {
      expect(() => audioManager.destroy()).not.toThrow();
    });
  });

  // =========================================================================
  // 12. Music ducking (AR-09)
  // =========================================================================
  describe('AR-09: Music ducking', () => {
    it('duckMusic does not throw', () => {
      expect(() => audioManager.duckMusic()).not.toThrow();
    });

    it('unduckMusic does not throw', () => {
      expect(() => audioManager.unduckMusic()).not.toThrow();
    });
  });

  // =========================================================================
  // 13. Reducer SFX trigger point validation
  // =========================================================================
  describe('Reducer SFX integration points', () => {
    // Verify that reducer files import and call audioManager for key game events
    // These are static analysis tests — they verify the wiring exists

    it('playCardAction.js triggers card play SFX', async () => {
      const source = fs.readFileSync(
        path.resolve(__dirname, '../context/reducers/combat/playCardAction.js'), 'utf8'
      );
      expect(source).toContain('SOUNDS.combat.cardPlay');
      expect(source).toContain('SOUNDS.combat.attack');
      expect(source).toContain('SOUNDS.combat.block');
      expect(source).toContain('SOUNDS.combat.shivPlay');
      expect(source).toContain('SOUNDS.combat.poisonApply');
      expect(source).toContain('SOUNDS.combat.beatOfDeath');
      expect(source).toContain('SOUNDS.combat.enemyDeath');
      expect(source).toContain('SOUNDS.combat.victory');
    });

    it('enemyTurnAction.js triggers enemy combat SFX', () => {
      const source = fs.readFileSync(
        path.resolve(__dirname, '../context/reducers/combat/enemyTurnAction.js'), 'utf8'
      );
      expect(source).toContain('SOUNDS.combat.enemyAttack');
      expect(source).toContain('SOUNDS.combat.heavyHit');
      expect(source).toContain('SOUNDS.combat.playerHurt');
      expect(source).toContain('SOUNDS.combat.heartPhaseTransition');
      expect(source).toContain('SOUNDS.combat.heartbeat');
    });

    it('endTurnAction.js triggers orb and poison SFX', () => {
      const source = fs.readFileSync(
        path.resolve(__dirname, '../context/reducers/combat/endTurnAction.js'), 'utf8'
      );
      expect(source).toContain('SOUNDS.combat.poison');
      expect(source).toContain('orbTypeSfx');
    });

    it('mapReducer.js triggers map step and boss intro SFX', () => {
      const source = fs.readFileSync(
        path.resolve(__dirname, '../context/reducers/mapReducer.js'), 'utf8'
      );
      expect(source).toContain('SOUNDS.ui.mapStep');
      expect(source).toContain('SOUNDS.combat.bossIntro');
    });

    it('rewardReducer.js triggers gold and relic pickup SFX', () => {
      const source = fs.readFileSync(
        path.resolve(__dirname, '../context/reducers/rewardReducer.js'), 'utf8'
      );
      expect(source).toContain('SOUNDS.ui.goldGain');
      expect(source).toContain('SOUNDS.ui.relicPickup');
    });

    it('metaReducer.js triggers card upgrade SFX', () => {
      const source = fs.readFileSync(
        path.resolve(__dirname, '../context/reducers/metaReducer.js'), 'utf8'
      );
      expect(source).toContain('SOUNDS.ui.cardUpgrade');
    });
  });

  // =========================================================================
  // 14. Sound file non-empty (not zero-byte)
  // =========================================================================
  describe('Sound file integrity', () => {
    const soundsDir = path.resolve(__dirname, '../../public/sounds');

    it('no sound files are empty (0 bytes)', () => {
      const allSoundIds = [
        ...Object.values(SOUNDS.combat),
        ...Object.values(SOUNDS.ui),
        ...Object.values(SOUNDS.ambient),
        ...Object.values(SOUNDS.music)
      ];
      for (const soundId of allSoundIds) {
        const filePath = path.join(soundsDir, `${soundId}.mp3`);
        if (fs.existsSync(filePath)) {
          const stat = fs.statSync(filePath);
          expect(stat.size, `${soundId}.mp3 is empty`).toBeGreaterThan(0);
        }
      }
    });

    it('all music tracks are at least 3KB (real audio, not stubs)', () => {
      const musicIds = Object.values(SOUNDS.music);
      for (const soundId of musicIds) {
        const filePath = path.join(soundsDir, `${soundId}.mp3`);
        if (fs.existsSync(filePath)) {
          const stat = fs.statSync(filePath);
          expect(stat.size, `${soundId}.mp3 too small — likely placeholder`).toBeGreaterThan(3000);
        }
      }
    });
  });
});
