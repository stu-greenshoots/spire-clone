import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Settings from '../../components/Settings';
import { loadSettings, saveSettings, DEFAULT_SETTINGS } from '../../systems/settingsSystem';

// Mock the audio system
vi.mock('../../systems/audioSystem', () => {
  const mockAudioManager = {
    setMasterVolume: vi.fn(),
    setSFXVolume: vi.fn(),
    setMusicVolume: vi.fn(),
    toggleMute: vi.fn(() => false),
    setMuted: vi.fn(),
    muted: false
  };
  return { audioManager: mockAudioManager };
});

describe('Settings Component', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Volume Controls', () => {
    it('renders master volume slider', () => {
      render(<Settings />);
      const masterSlider = screen.getByLabelText('Master Volume');
      expect(masterSlider).toBeInTheDocument();
    });

    it('renders SFX volume slider', () => {
      render(<Settings />);
      const sfxSlider = screen.getByLabelText('SFX Volume');
      expect(sfxSlider).toBeInTheDocument();
    });

    it('renders music volume slider', () => {
      render(<Settings />);
      const musicSlider = screen.getByLabelText('Music Volume');
      expect(musicSlider).toBeInTheDocument();
    });

    it('updates master volume display when slider changes', () => {
      render(<Settings />);
      const masterSlider = screen.getByLabelText('Master Volume');

      fireEvent.change(masterSlider, { target: { value: '0.5' } });

      expect(screen.getByText(/Master Volume: 50%/)).toBeInTheDocument();
    });

    it('persists master volume in localStorage', () => {
      render(<Settings />);
      const masterSlider = screen.getByLabelText('Master Volume');

      fireEvent.change(masterSlider, { target: { value: '0.6' } });

      const saved = loadSettings();
      expect(saved.masterVolume).toBe(0.6);
    });

    it('persists SFX volume in localStorage', () => {
      render(<Settings />);
      const sfxSlider = screen.getByLabelText('SFX Volume');

      fireEvent.change(sfxSlider, { target: { value: '0.7' } });

      const saved = loadSettings();
      expect(saved.sfxVolume).toBe(0.7);
    });

    it('persists music volume in localStorage', () => {
      render(<Settings />);
      const musicSlider = screen.getByLabelText('Music Volume');

      fireEvent.change(musicSlider, { target: { value: '0.4' } });

      const saved = loadSettings();
      expect(saved.musicVolume).toBe(0.4);
    });
  });

  describe('Mute Button', () => {
    it('renders mute button', () => {
      render(<Settings />);
      const muteButton = screen.getByLabelText('Toggle Mute');
      expect(muteButton).toBeInTheDocument();
    });

    it('calls audioManager.toggleMute on click', async () => {
      const { audioManager } = await import('../../systems/audioSystem');
      render(<Settings />);
      const muteButton = screen.getByLabelText('Toggle Mute');

      fireEvent.click(muteButton);

      expect(audioManager.toggleMute).toHaveBeenCalled();
    });
  });

  describe('Animation Speed Control', () => {
    it('renders animation speed select', () => {
      render(<Settings />);
      const speedSelect = screen.getByLabelText('Animation Speed');
      expect(speedSelect).toBeInTheDocument();
    });

    it('has normal, fast, and instant options', () => {
      render(<Settings />);
      const speedSelect = screen.getByLabelText('Animation Speed');
      const options = speedSelect.querySelectorAll('option');

      expect(options[0].value).toBe('normal');
      expect(options[1].value).toBe('fast');
      expect(options[2].value).toBe('instant');
    });

    it('updates animation speed setting', () => {
      render(<Settings />);
      const speedSelect = screen.getByLabelText('Animation Speed');

      fireEvent.change(speedSelect, { target: { value: 'fast' } });

      const saved = loadSettings();
      expect(saved.animationSpeed).toBe('fast');
    });

    it('persists animation speed to localStorage', () => {
      render(<Settings />);
      const speedSelect = screen.getByLabelText('Animation Speed');

      fireEvent.change(speedSelect, { target: { value: 'instant' } });

      // Clear component and render again to test persistence
      const loaded = loadSettings();
      expect(loaded.animationSpeed).toBe('instant');
    });
  });

  describe('Text Size Control', () => {
    it('renders text size select', () => {
      render(<Settings />);
      const textSelect = screen.getByLabelText('Text Size');
      expect(textSelect).toBeInTheDocument();
    });

    it('has normal and large options', () => {
      render(<Settings />);
      const textSelect = screen.getByLabelText('Text Size');
      const options = textSelect.querySelectorAll('option');

      expect(options[0].value).toBe('normal');
      expect(options[1].value).toBe('large');
    });

    it('updates text size setting', () => {
      render(<Settings />);
      const textSelect = screen.getByLabelText('Text Size');

      fireEvent.change(textSelect, { target: { value: 'large' } });

      const saved = loadSettings();
      expect(saved.textSize).toBe('large');
    });

    it('applies large text size to container', () => {
      render(<Settings />);
      const container = screen.getByText('Settings').closest('.settings-panel');

      // Initially should have default font size
      expect(container.style.fontSize).toBe('1rem');

      const textSelect = screen.getByLabelText('Text Size');
      fireEvent.change(textSelect, { target: { value: 'large' } });

      // After change, should apply large font size
      expect(container.style.fontSize).toBe('1.1rem');
    });

    it('persists text size to localStorage', () => {
      render(<Settings />);
      const textSelect = screen.getByLabelText('Text Size');

      fireEvent.change(textSelect, { target: { value: 'large' } });

      const loaded = loadSettings();
      expect(loaded.textSize).toBe('large');
    });
  });

  describe('Screen Shake Toggle', () => {
    it('renders screen shake toggle', () => {
      render(<Settings />);
      const shakeToggle = screen.getByLabelText('Screen Shake');
      expect(shakeToggle).toBeInTheDocument();
    });

    it('shows On/Off status', () => {
      render(<Settings />);
      expect(screen.getByText(/Screen Shake/)).toBeInTheDocument();
    });

    it('toggles screen shake setting', () => {
      render(<Settings />);
      const shakeToggle = screen.getByLabelText('Screen Shake');

      fireEvent.click(shakeToggle);

      const saved = loadSettings();
      // Default is true, so after click should be false
      expect(saved.screenShake).toBe(false);
    });

    it('persists screen shake to localStorage', () => {
      render(<Settings />);
      const shakeToggle = screen.getByLabelText('Screen Shake');

      fireEvent.click(shakeToggle);

      const loaded = loadSettings();
      expect(loaded.screenShake).toBe(false);
    });
  });

  describe('Confirm End Turn Toggle', () => {
    it('renders confirm end turn toggle', () => {
      render(<Settings />);
      const confirmToggle = screen.getByLabelText('Confirm End Turn');
      expect(confirmToggle).toBeInTheDocument();
    });

    it('toggles confirm end turn setting', () => {
      render(<Settings />);
      const confirmToggle = screen.getByLabelText('Confirm End Turn');

      fireEvent.click(confirmToggle);

      const saved = loadSettings();
      expect(saved.confirmEndTurn).toBe(true);
    });

    it('persists confirm end turn to localStorage', () => {
      render(<Settings />);
      const confirmToggle = screen.getByLabelText('Confirm End Turn');

      fireEvent.click(confirmToggle);

      const loaded = loadSettings();
      expect(loaded.confirmEndTurn).toBe(true);
    });
  });

  describe('Show Damage Numbers Toggle', () => {
    it('renders show damage numbers toggle', () => {
      render(<Settings />);
      const damageToggle = screen.getByLabelText('Show Damage Numbers');
      expect(damageToggle).toBeInTheDocument();
    });

    it('toggles damage numbers setting', () => {
      render(<Settings />);
      const damageToggle = screen.getByLabelText('Show Damage Numbers');

      // Default is true, so click should set to false
      fireEvent.click(damageToggle);

      const saved = loadSettings();
      expect(saved.showDamageNumbers).toBe(false);
    });

    it('persists damage numbers to localStorage', () => {
      render(<Settings />);
      const damageToggle = screen.getByLabelText('Show Damage Numbers');

      fireEvent.click(damageToggle);

      const loaded = loadSettings();
      expect(loaded.showDamageNumbers).toBe(false);
    });
  });

  describe('High Contrast Toggle', () => {
    it('renders high contrast toggle', () => {
      render(<Settings />);
      const contrastToggle = screen.getByLabelText('High Contrast Mode');
      expect(contrastToggle).toBeInTheDocument();
    });

    it('toggles high contrast setting', () => {
      render(<Settings />);
      const contrastToggle = screen.getByLabelText('High Contrast Mode');

      fireEvent.click(contrastToggle);

      const saved = loadSettings();
      expect(saved.highContrast).toBe(true);
    });

    it('persists high contrast to localStorage', () => {
      render(<Settings />);
      const contrastToggle = screen.getByLabelText('High Contrast Mode');

      fireEvent.click(contrastToggle);

      const loaded = loadSettings();
      expect(loaded.highContrast).toBe(true);
    });
  });

  describe('Reset to Defaults', () => {
    it('renders reset button', () => {
      render(<Settings />);
      const resetButton = screen.getByLabelText('Reset to Defaults');
      expect(resetButton).toBeInTheDocument();
    });

    it('resets all settings to defaults', () => {
      render(<Settings />);

      // Change some settings
      const masterSlider = screen.getByLabelText('Master Volume');
      const speedSelect = screen.getByLabelText('Animation Speed');
      fireEvent.change(masterSlider, { target: { value: '0.2' } });
      fireEvent.change(speedSelect, { target: { value: 'fast' } });

      // Click reset
      const resetButton = screen.getByLabelText('Reset to Defaults');
      fireEvent.click(resetButton);

      // Check that settings are back to defaults
      const loaded = loadSettings();
      expect(loaded.masterVolume).toBe(DEFAULT_SETTINGS.masterVolume);
      expect(loaded.animationSpeed).toBe(DEFAULT_SETTINGS.animationSpeed);
    });

    it('persists reset to localStorage', () => {
      render(<Settings />);

      // Change a setting
      const masterSlider = screen.getByLabelText('Master Volume');
      fireEvent.change(masterSlider, { target: { value: '0.2' } });

      // Click reset
      const resetButton = screen.getByLabelText('Reset to Defaults');
      fireEvent.click(resetButton);

      // Check localStorage
      const loaded = loadSettings();
      expect(loaded.masterVolume).toBe(DEFAULT_SETTINGS.masterVolume);
    });
  });

  describe('Persistence Across Sessions', () => {
    it('loads saved settings on mount', () => {
      // Save custom settings
      const customSettings = {
        ...DEFAULT_SETTINGS,
        masterVolume: 0.3,
        animationSpeed: 'fast',
        textSize: 'large'
      };
      saveSettings(customSettings);

      // Render component
      render(<Settings />);

      // Check that custom values are loaded
      const masterSlider = screen.getByLabelText('Master Volume');
      const speedSelect = screen.getByLabelText('Animation Speed');
      const textSelect = screen.getByLabelText('Text Size');

      expect(masterSlider.value).toBe('0.3');
      expect(speedSelect.value).toBe('fast');
      expect(textSelect.value).toBe('large');
    });

    it('maintains settings across multiple changes', () => {
      render(<Settings />);

      // Change multiple settings
      const masterSlider = screen.getByLabelText('Master Volume');
      const speedSelect = screen.getByLabelText('Animation Speed');
      const shakeToggle = screen.getByLabelText('Screen Shake');

      fireEvent.change(masterSlider, { target: { value: '0.4' } });
      fireEvent.change(speedSelect, { target: { value: 'instant' } });
      fireEvent.click(shakeToggle); // Disable shake

      // Verify all are saved
      const loaded = loadSettings();
      expect(loaded.masterVolume).toBe(0.4);
      expect(loaded.animationSpeed).toBe('instant');
      expect(loaded.screenShake).toBe(false);
    });
  });

  describe('UI Sections', () => {
    it('renders Audio section', () => {
      render(<Settings />);
      const audioSection = screen.getByText(/Audio/);
      expect(audioSection).toBeInTheDocument();
    });

    it('renders Gameplay section', () => {
      render(<Settings />);
      const gameplaySection = screen.getByText(/Gameplay/);
      expect(gameplaySection).toBeInTheDocument();
    });

    it('renders Accessibility section', () => {
      render(<Settings />);
      const a11ySection = screen.getByText(/Accessibility/);
      expect(a11ySection).toBeInTheDocument();
    });

    it('renders Settings title', () => {
      render(<Settings />);
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });
  });
});
