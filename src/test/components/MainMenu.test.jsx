import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the saveSystem module
vi.mock('../../systems/saveSystem', () => ({
  hasSave: vi.fn(() => false)
}));

// Mock GameContext
const mockStartGame = vi.fn();
const mockLoadGameState = vi.fn();
const mockDeleteSaveState = vi.fn();
const mockOpenDataEditor = vi.fn();

vi.mock('../../context/GameContext', () => ({
  useGame: () => ({
    startGame: mockStartGame,
    loadGameState: mockLoadGameState,
    deleteSaveState: mockDeleteSaveState,
    openDataEditor: mockOpenDataEditor
  }),
  GAME_PHASE: {
    MAIN_MENU: 'main_menu',
    MAP: 'map',
    COMBAT: 'combat'
  }
}));

import MainMenu from '../../components/MainMenu';
import { hasSave } from '../../systems/saveSystem';

describe('MainMenu Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hasSave.mockReturnValue(false);
  });

  it('renders the game title', () => {
    render(<MainMenu />);
    expect(screen.getByText('SPIRE ASCENT')).toBeInTheDocument();
  });

  it('renders the New Game button', () => {
    render(<MainMenu />);
    expect(screen.getByText('New Game')).toBeInTheDocument();
  });

  it('calls startGame and deleteSave when New Game button is clicked', () => {
    render(<MainMenu />);
    fireEvent.click(screen.getByText('New Game'));
    expect(mockDeleteSaveState).toHaveBeenCalledTimes(1);
    expect(mockStartGame).toHaveBeenCalledTimes(1);
  });

  it('shows Continue Run button when save exists', async () => {
    hasSave.mockReturnValue(true);
    render(<MainMenu />);
    await waitFor(() => {
      expect(screen.getByText('Continue Run')).toBeInTheDocument();
    });
  });

  it('does not show Continue button when no save exists', () => {
    hasSave.mockReturnValue(false);
    render(<MainMenu />);
    expect(screen.queryByText('Continue Run')).not.toBeInTheDocument();
  });

  it('calls loadGameState when Continue Run is clicked', async () => {
    hasSave.mockReturnValue(true);
    render(<MainMenu />);
    await waitFor(() => {
      expect(screen.getByText('Continue Run')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Continue Run'));
    expect(mockLoadGameState).toHaveBeenCalledTimes(1);
  });

  it('renders the subtitle text', () => {
    render(<MainMenu />);
    expect(screen.getByText(/Endless War/i)).toBeInTheDocument();
  });
});
