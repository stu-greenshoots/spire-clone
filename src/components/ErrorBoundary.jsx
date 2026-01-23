import { Component } from 'react';

/**
 * Error Boundary Component
 * Catches JavaScript errors in child component tree and displays fallback UI
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // Log error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReturnToMenu = () => {
    // Clear error state and let parent handle navigation
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
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
            marginBottom: '30px',
            maxWidth: '400px'
          }}>
            An unexpected error occurred. You can try reloading the page or returning to the main menu.
          </p>

          {this.props.showDetails && this.state.error && (
            <details style={{
              marginBottom: '30px',
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
                color: '#ff6b6b'
              }}>
                {this.state.error.toString()}
              </pre>
            </details>
          )}

          <div style={{ display: 'flex', gap: '15px' }}>
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
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
