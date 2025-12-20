import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// localStorage health check and recovery
const checkLocalStorageHealth = () => {
  try {
    // Test if localStorage is accessible
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    
    // Check for corrupted auth token
    const authToken = localStorage.getItem('auth_token');
    if (authToken) {
      // Validate it's not corrupted (basic check)
      if (authToken.trim() === '' || authToken === 'null' || authToken === 'undefined') {
        console.warn('⚠️ Detected corrupted auth token, clearing...');
        localStorage.removeItem('auth_token');
      }
    }
    
    console.log('✅ localStorage health check passed');
    return true;
  } catch (error) {
    console.error('❌ localStorage health check failed:', error);
    // Try to clear localStorage if it's corrupted
    try {
      localStorage.clear();
      console.log('🔄 Cleared corrupted localStorage');
    } catch (clearError) {
      console.error('❌ Failed to clear localStorage:', clearError);
    }
    return false;
  }
};

// Run health check before app initialization
checkLocalStorageHealth();

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 React Error Boundary caught an error:', error, errorInfo);
    console.error('Error stack:', error.stack);
    console.error('Component stack:', errorInfo.componentStack);
  }

  handleClearDataAndReload = () => {
    try {
      // Clear all localStorage data
      localStorage.clear();
      console.log('✅ Cleared all localStorage data');
      
      // Clear sessionStorage too
      sessionStorage.clear();
      console.log('✅ Cleared all sessionStorage data');
      
      // Reload the page
      window.location.href = window.location.pathname;
    } catch (error) {
      console.error('❌ Failed to clear storage:', error);
      // Force reload anyway
      window.location.href = window.location.pathname;
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center', 
          fontFamily: 'system-ui',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{ maxWidth: '500px' }}>
            <h1 style={{ fontSize: '24px', marginBottom: '16px', color: '#1e293b' }}>
              Something went wrong
            </h1>
            <p style={{ marginBottom: '24px', color: '#64748b', lineHeight: '1.6' }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: '#14b8a6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500'
            }}
          >
            Reload Page
          </button>
              
              <button 
                onClick={this.handleClearDataAndReload}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
              >
                Clear Data & Reload
              </button>
            </div>
            
            <p style={{ 
              marginTop: '24px', 
              fontSize: '14px', 
              color: '#94a3b8',
              lineHeight: '1.5'
            }}>
              If the problem persists, try "Clear Data & Reload" to reset your session.
              <br />
              Check the browser console (F12) for more details.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
