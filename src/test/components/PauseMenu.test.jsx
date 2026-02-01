import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PauseMenu from '../../components/PauseMenu';

// Mock GameContext
const mockSaveGameState = vi.fn();
const mockReturnToMenu = vi.fn();

vi.mock('../../context/GameContext', () => ({
  useGame: () => ({
    state: {
      phase: 'combat',
      act: 2,
      currentFloor: 5,
      player: { currentHp: 50, maxHp: 80, gold: 120 },
      deck: [{ instanceId: '1', name: 'Strike', type: 'attack', cost: 1 }],
      relics: []
    },
    saveGameState: mockSaveGameState,
    returnToMenu: mockReturnToMenu
  }),
  GAME_PHASE: {
    MAIN_MENU: 'main_menu',
    COMBAT: 'combat',
    MAP: 'map'
  }
}));

// Mock audio system
vi.mock('../../systems/audioSystem', () => ({
  audioManager: { setMasterVolume: vi.fn(), setSFXVolume: vi.fn(), setMusicVolume: vi.fn(), toggleMute: vi.fn() }
}));

// Mock save system
vi.mock('../../systems/saveSystem', () => ({
  downloadExport: vi.fn(),
  importAllData: vi.fn()
}));

// Mock settings system
vi.mock('../../systems/settingsSystem', () => ({
  loadSettings: () => ({ masterVolume: 0.7, sfxVolume: 0.8, musicVolume: 0.6, animationSpeed: 'normal', textSize: 'normal', screenShake: true, confirmEndTurn: false, showDamageNumbers: true, highContrast: false }),
  saveSettings: vi.fn(),
  DEFAULT_SETTINGS: { masterVolume: 0.7, sfxVolume: 0.8, musicVolume: 0.6 },
  getAnimationDuration: () => 600
}));

// Mock Tooltip
vi.mock('../../components/Tooltip', () => ({
  SimpleTooltip: ({ children }) => children
}));

// Mock art-config
vi.mock('../../assets/art/art-config', () => ({
  getRelicImage: () => null,
  getCardImage: () => null
}));

describe('PauseMenu', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders pause overlay', () => {
    render(<PauseMenu onClose={mockOnClose} />);
    expect(screen.getByTestId('pause-overlay')).toBeInTheDocument();
  });

  it('shows Paused title and menu buttons', () => {
    render(<PauseMenu onClose={mockOnClose} />);
    expect(screen.getByText('Paused')).toBeInTheDocument();
    expect(screen.getByTestId('pause-resume')).toBeInTheDocument();
    expect(screen.getByTestId('pause-settings')).toBeInTheDocument();
    expect(screen.getByTestId('pause-deck')).toBeInTheDocument();
  });

  it('calls onClose when Resume is clicked', () => {
    render(<PauseMenu onClose={mockOnClose} />);
    fireEvent.click(screen.getByTestId('pause-resume'));
    expect(mockOnClose).toHaveBeenCalledOnce();
  });

  it('shows run stats', () => {
    render(<PauseMenu onClose={mockOnClose} />);
    expect(screen.getByText('50/80')).toBeInTheDocument();
    expect(screen.getByText('120')).toBeInTheDocument();
  });

  it('shows quit confirmation on Save & Quit click', () => {
    render(<PauseMenu onClose={mockOnClose} />);
    fireEvent.click(screen.getByTestId('pause-quit'));
    expect(screen.getByText('Save and return to main menu?')).toBeInTheDocument();
  });

  it('saves and returns to menu on quit confirm', () => {
    render(<PauseMenu onClose={mockOnClose} />);
    fireEvent.click(screen.getByTestId('pause-quit'));
    fireEvent.click(screen.getByTestId('pause-quit-confirm'));
    expect(mockSaveGameState).toHaveBeenCalledOnce();
    expect(mockReturnToMenu).toHaveBeenCalledOnce();
    expect(mockOnClose).toHaveBeenCalledOnce();
  });

  it('switches to settings tab', () => {
    render(<PauseMenu onClose={mockOnClose} />);
    fireEvent.click(screen.getByTestId('pause-settings'));
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByLabelText('Master Volume')).toBeInTheDocument();
  });

  it('closes overlay when clicking outside modal', () => {
    render(<PauseMenu onClose={mockOnClose} />);
    fireEvent.click(screen.getByTestId('pause-overlay'));
    expect(mockOnClose).toHaveBeenCalledOnce();
  });
});
