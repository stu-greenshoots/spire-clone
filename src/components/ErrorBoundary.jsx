import { Component } from 'react';

/**
 * Error Boundary Component
 * Catches JavaScript errors in child component tree and displays fallback UI
 *
 * Enhanced in Sprint 17 (QR-15) with:
 * - Game state summary in error display
 * - "Report Bug" button that copies state + error to clipboard
 * - Better error logging for agent analysis
 * - Cascading failure prevention
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      gameState: null,
      copied: false
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  /**
   * Safely capture game state from window.__SPIRE__ API
   * Returns null if not available or if capturing fails
   */
  captureGameState = () => {
    try {
      if (window.__SPIRE__ && typeof window.__SPIRE__.getVisibleState === 'function') {
        return window.__SPIRE__.getVisibleState();
      }
    } catch (e) {
      console.warn('Failed to capture game state for error report:', e);
    }
    return null;
  };

  componentDidCatch(error, errorInfo) {
    // Capture game state at the moment of error
    const gameState = this.captureGameState();
    this.setState({ errorInfo, gameState });

    // Log comprehensive error info for agent analysis
    console.error('=== ERROR BOUNDARY CAUGHT ERROR ===');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    if (gameState) {
      console.error('Game State at Error:', JSON.stringify(gameState, null, 2));
    }
    console.error('Timestamp:', new Date().toISOString());
    console.error('User Agent:', navigator.userAgent);
    console.error('=== END ERROR REPORT ===');
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReturnToMenu = () => {
    // Clear error state and let parent handle navigation
    this.setState({ hasError: false, error: null, errorInfo: null, gameState: null, copied: false });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  /**
   * Generate a bug report object with all relevant information
   */
  generateBugReport = () => {
    const { error, errorInfo, gameState } = this.state;
    return {
      timestamp: new Date().toISOString(),
      error: {
        message: error?.message || String(error),
        stack: error?.stack || null,
        name: error?.name || 'Error'
      },
      componentStack: errorInfo?.componentStack || null,
      gameState: gameState || null,
      environment: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        localStorage: this.getSafeLocalStorageInfo()
      }
    };
  };

  /**
   * Get safe localStorage info (just keys and sizes, not sensitive data)
   */
  getSafeLocalStorageInfo = () => {
    try {
      const keys = Object.keys(localStorage);
      return keys.reduce((acc, key) => {
        const value = localStorage.getItem(key);
        acc[key] = value ? `${value.length} chars` : 'empty';
        return acc;
      }, {});
    } catch {
      return 'Unable to read localStorage';
    }
  };

  /**
   * Copy bug report to clipboard
   */
  handleCopyBugReport = async () => {
    const report = this.generateBugReport();
    const reportText = JSON.stringify(report, null, 2);

    try {
      await navigator.clipboard.writeText(reportText);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    } catch {
      // Fallback for browsers without clipboard API
      console.error('Bug Report (copy to clipboard failed):');
      console.error(reportText);
      alert('Bug report logged to console. Press F12 to view.');
    }
  };

  /**
   * Format game state for display
   */
  formatGameStateSummary = () => {
    const { gameState } = this.state;
    if (!gameState) return null;

    const lines = [];
    if (gameState.phase) lines.push(`Phase: ${gameState.phase}`);
    if (gameState.floor) lines.push(`Floor: ${gameState.floor}`);
    if (gameState.act) lines.push(`Act: ${gameState.act}`);
    if (gameState.character) lines.push(`Character: ${gameState.character}`);
    if (gameState.player) {
      lines.push(`HP: ${gameState.player.hp}/${gameState.player.maxHp}`);
      lines.push(`Energy: ${gameState.player.energy}/${gameState.player.maxEnergy}`);
      lines.push(`Gold: ${gameState.player.gold}`);
    }
    if (gameState.enemies?.length) {
      lines.push(`Enemies: ${gameState.enemies.length} (${gameState.enemies.map(e => e.name).join(', ')})`);
    }
    if (gameState.hand?.length !== undefined) {
      lines.push(`Hand: ${gameState.hand.length} cards`);
    }

    return lines.join('\n');
  };

  render() {
    if (this.state.hasError) {
      const stateSummary = this.formatGameStateSummary();

      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
          color: '#fff',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h1 style={{
            color: '#ff6b6b',
            marginBottom: '20px',
            fontSize: '28px'
          }}>
            Something went wrong
          </h1>

          <p style={{
            color: '#aaa',
            marginBottom: '20px',
            maxWidth: '400px'
          }}>
            An unexpected error occurred. You can try returning to the main menu or reloading the page.
          </p>

          {/* Game State Summary */}
          {stateSummary && (
            <div style={{
              marginBottom: '20px',
              background: 'rgba(0,0,0,0.3)',
              padding: '15px',
              borderRadius: '8px',
              maxWidth: '400px',
              textAlign: 'left'
            }}>
              <div style={{ color: '#888', marginBottom: '8px', fontWeight: 'bold' }}>
                Game State at Error:
              </div>
              <pre style={{
                fontSize: '12px',
                color: '#ccc',
                margin: 0,
                whiteSpace: 'pre-wrap'
              }}>
                {stateSummary}
              </pre>
            </div>
          )}

          {/* Error Details (collapsible) */}
          {this.props.showDetails && this.state.error && (
            <details style={{
              marginBottom: '20px',
              background: 'rgba(0,0,0,0.3)',
              padding: '15px',
              borderRadius: '8px',
              maxWidth: '500px',
              textAlign: 'left'
            }}>
              <summary style={{ cursor: 'pointer', color: '#888' }}>
                Error Details
              </summary>
              <pre style={{
                marginTop: '10px',
                fontSize: '12px',
                overflow: 'auto',
                color: '#ff6b6b',
                maxHeight: '200px'
              }}>
                {this.state.error.toString()}
                {this.state.error.stack && (
                  <>
                    {'\n\nStack Trace:\n'}
                    {this.state.error.stack}
                  </>
                )}
              </pre>
            </details>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {this.props.onReset && (
              <button
                onClick={this.handleReturnToMenu}
                style={{
                  padding: '12px 24px',
                  fontSize: '16px',
                  background: 'linear-gradient(180deg, #4a4a6a 0%, #3a3a5a 100%)',
                  color: '#fff',
                  border: '2px solid #5a5a7a',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Return to Menu
              </button>
            )}
            <button
              onClick={this.handleCopyBugReport}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                background: this.state.copied
                  ? 'linear-gradient(180deg, #2a6a2a 0%, #1a5a1a 100%)'
                  : 'linear-gradient(180deg, #4a6a4a 0%, #3a5a3a 100%)',
                color: '#fff',
                border: this.state.copied ? '2px solid #4a8a4a' : '2px solid #5a7a5a',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              {this.state.copied ? 'Copied!' : 'Copy Bug Report'}
            </button>
            <button
              onClick={this.handleReload}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                background: 'linear-gradient(180deg, #aa2020 0%, #881515 100%)',
                color: '#fff',
                border: '2px solid #cc4444',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Reload Page
            </button>
          </div>

          {/* Help text */}
          <p style={{
            color: '#666',
            marginTop: '20px',
            fontSize: '12px',
            maxWidth: '400px'
          }}>
            If this error persists, use &quot;Copy Bug Report&quot; and share the report for debugging.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
