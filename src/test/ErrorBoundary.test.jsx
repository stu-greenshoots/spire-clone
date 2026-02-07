import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '../components/ErrorBoundary.jsx';

// Component that throws an error for testing
const ThrowError = ({ shouldThrow, error }) => {
  if (shouldThrow) {
    throw error || new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  // Suppress console.error during tests
  let consoleErrorSpy;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    // Mock navigator.clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined)
      }
    });
    // Mock window.alert
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    vi.restoreAllMocks();
  });

  describe('Error Catching', () => {
    it('should render children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div data-testid="child">Child content</div>
        </ErrorBoundary>
      );

      expect(screen.getByTestId('child')).toBeDefined();
      expect(screen.getByText('Child content')).toBeDefined();
    });

    it('should catch errors and display fallback UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeDefined();
    });

    it('should display error message in fallback UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText(/An unexpected error occurred/)).toBeDefined();
    });
  });

  describe('Error Details', () => {
    it('should show error details when showDetails is true', () => {
      render(
        <ErrorBoundary showDetails={true}>
          <ThrowError shouldThrow={true} error={new Error('Specific error message')} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Error Details')).toBeDefined();
    });

    it('should hide error details when showDetails is false', () => {
      render(
        <ErrorBoundary showDetails={false}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.queryByText('Error Details')).toBeNull();
    });
  });

  describe('Action Buttons', () => {
    it('should display Reload Page button', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Reload Page')).toBeDefined();
    });

    it('should display Return to Menu button when onReset is provided', () => {
      const onReset = vi.fn();
      render(
        <ErrorBoundary onReset={onReset}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Return to Menu')).toBeDefined();
    });

    it('should hide Return to Menu button when onReset is not provided', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.queryByText('Return to Menu')).toBeNull();
    });

    it('should call onReset when Return to Menu is clicked', () => {
      const onReset = vi.fn();
      render(
        <ErrorBoundary onReset={onReset}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      fireEvent.click(screen.getByText('Return to Menu'));
      expect(onReset).toHaveBeenCalled();
    });
  });

  describe('Copy Bug Report Button', () => {
    it('should display Copy Bug Report button', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Copy Bug Report')).toBeDefined();
    });

    it('should copy bug report to clipboard when clicked', async () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} error={new Error('Test clipboard error')} />
        </ErrorBoundary>
      );

      fireEvent.click(screen.getByText('Copy Bug Report'));

      // Wait for async clipboard operation
      await vi.waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalled();
      });

      // Verify the copied content includes error info
      const copiedContent = navigator.clipboard.writeText.mock.calls[0][0];
      const parsedReport = JSON.parse(copiedContent);

      expect(parsedReport.error.message).toBe('Test clipboard error');
      expect(parsedReport.timestamp).toBeDefined();
      expect(parsedReport.environment).toBeDefined();
    });

    it('should show Copied! text after copying', async () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      fireEvent.click(screen.getByText('Copy Bug Report'));

      await vi.waitFor(() => {
        expect(screen.getByText('Copied!')).toBeDefined();
      });
    });

    it('should show fallback alert when clipboard fails', async () => {
      navigator.clipboard.writeText = vi.fn().mockRejectedValue(new Error('Clipboard failed'));

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      fireEvent.click(screen.getByText('Copy Bug Report'));

      await vi.waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('Bug report logged to console. Press F12 to view.');
      });
    });
  });

  describe('Game State Capture', () => {
    it('should capture game state when window.__SPIRE__ is available', () => {
      const mockGameState = {
        phase: 'combat',
        floor: 5,
        act: 1,
        character: 'ironclad',
        player: { hp: 50, maxHp: 80, energy: 2, maxEnergy: 3, gold: 100 },
        enemies: [{ name: 'JawWorm' }],
        hand: [{ name: 'Strike' }, { name: 'Defend' }]
      };

      window.__SPIRE__ = {
        getVisibleState: vi.fn().mockReturnValue(mockGameState)
      };

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Check that game state is displayed
      expect(screen.getByText(/Phase: combat/)).toBeDefined();
      expect(screen.getByText(/Floor: 5/)).toBeDefined();
      expect(screen.getByText(/HP: 50\/80/)).toBeDefined();
      expect(screen.getByText(/Enemies: 1/)).toBeDefined();
      expect(screen.getByText(/Hand: 2 cards/)).toBeDefined();

      delete window.__SPIRE__;
    });

    it('should handle missing window.__SPIRE__ gracefully', () => {
      delete window.__SPIRE__;

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Should render without game state section
      expect(screen.getByText('Something went wrong')).toBeDefined();
      expect(screen.queryByText('Game State at Error:')).toBeNull();
    });

    it('should handle getVisibleState throwing an error', () => {
      window.__SPIRE__ = {
        getVisibleState: vi.fn().mockImplementation(() => {
          throw new Error('State capture failed');
        })
      };

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Should still render error UI
      expect(screen.getByText('Something went wrong')).toBeDefined();
      expect(consoleErrorSpy).toHaveBeenCalled();

      delete window.__SPIRE__;
    });
  });

  describe('Console Logging', () => {
    it('should log comprehensive error info to console', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} error={new Error('Console test error')} />
        </ErrorBoundary>
      );

      // Check that error boundary header was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith('=== ERROR BOUNDARY CAUGHT ERROR ===');
      expect(consoleErrorSpy).toHaveBeenCalledWith('=== END ERROR REPORT ===');
    });

    it('should log game state when available', () => {
      const mockGameState = { phase: 'menu' };
      window.__SPIRE__ = {
        getVisibleState: vi.fn().mockReturnValue(mockGameState)
      };

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Find the call that logs the game state
      const gameStateCall = consoleErrorSpy.mock.calls.find(
        call => call[0] === 'Game State at Error:'
      );
      expect(gameStateCall).toBeDefined();

      delete window.__SPIRE__;
    });
  });

  describe('Bug Report Content', () => {
    it('should include all required fields in bug report', async () => {
      const testError = new Error('Detailed test error');
      testError.stack = 'Error: Detailed test error\n    at test.js:1:1';

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} error={testError} />
        </ErrorBoundary>
      );

      fireEvent.click(screen.getByText('Copy Bug Report'));

      await vi.waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalled();
      });

      const copiedContent = navigator.clipboard.writeText.mock.calls[0][0];
      const report = JSON.parse(copiedContent);

      // Check required fields
      expect(report.timestamp).toBeDefined();
      expect(report.error.message).toBe('Detailed test error');
      expect(report.error.stack).toBeDefined();
      expect(report.error.name).toBe('Error');
      expect(report.environment.userAgent).toBeDefined();
      expect(report.environment.url).toBeDefined();
      expect(report.environment.viewport).toBeDefined();
      expect(report.environment.localStorage).toBeDefined();
    });

    it('should include game state in bug report when available', async () => {
      const mockGameState = { phase: 'combat', floor: 3 };
      window.__SPIRE__ = {
        getVisibleState: vi.fn().mockReturnValue(mockGameState)
      };

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      fireEvent.click(screen.getByText('Copy Bug Report'));

      await vi.waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalled();
      });

      const copiedContent = navigator.clipboard.writeText.mock.calls[0][0];
      const report = JSON.parse(copiedContent);

      expect(report.gameState).toEqual(mockGameState);

      delete window.__SPIRE__;
    });
  });

  describe('Recovery', () => {
    it('should call onReset and clear internal error state when returning to menu', () => {
      const onReset = vi.fn();
      render(
        <ErrorBoundary onReset={onReset}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Verify error state
      expect(screen.getByText('Something went wrong')).toBeDefined();

      // Click return to menu
      fireEvent.click(screen.getByText('Return to Menu'));

      // Verify onReset was called
      expect(onReset).toHaveBeenCalledTimes(1);
    });

    it('should clear copied state when returning to menu', async () => {
      const onReset = vi.fn();
      render(
        <ErrorBoundary onReset={onReset}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Copy the report first
      fireEvent.click(screen.getByText('Copy Bug Report'));
      await vi.waitFor(() => {
        expect(screen.getByText('Copied!')).toBeDefined();
      });

      // Click return to menu - this should reset the copied state
      fireEvent.click(screen.getByText('Return to Menu'));
      expect(onReset).toHaveBeenCalled();
    });
  });

  describe('Help Text', () => {
    it('should display help text about bug reporting', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText(/Copy Bug Report.*share the report/)).toBeDefined();
    });
  });
});
