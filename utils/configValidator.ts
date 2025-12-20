// Configuration validator and helper utilities

export interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export const validateConfiguration = (): ConfigValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Check if using real API
  const useRealAPI = import.meta.env.VITE_USE_REAL_API === 'true';
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const wsUrl = import.meta.env.VITE_WS_URL;

  if (useRealAPI) {
    // Validate API URL
    if (!apiBaseUrl) {
      errors.push('VITE_API_BASE_URL environment variable is required when VITE_USE_REAL_API=true');
      suggestions.push('Set VITE_API_BASE_URL to your backend API endpoint (e.g., https://api.yourbackend.com/api)');
    } else if (apiBaseUrl.includes('netlify.app') && !apiBaseUrl.includes('/api')) {
      warnings.push('API URL appears to be a Netlify frontend URL, not a backend API');
      suggestions.push('Ensure your API URL points to your backend server, not the frontend');
    } else if (apiBaseUrl.startsWith('http://') && !apiBaseUrl.includes('localhost')) {
      warnings.push('Using HTTP (non-secure) connection for production API');
      suggestions.push('Consider using HTTPS for production deployments');
    }

    // Validate WebSocket URL
    if (!wsUrl) {
      warnings.push('VITE_WS_URL not configured - WebSocket features will be disabled');
      suggestions.push('Set VITE_WS_URL to enable real-time features (e.g., wss://ws.yourbackend.com)');
    } else if (wsUrl.startsWith('ws://') && !wsUrl.includes('localhost')) {
      warnings.push('Using WS (non-secure) WebSocket connection for production');
      suggestions.push('Consider using WSS for production deployments');
    }

    // Check for localhost in production
    if (apiBaseUrl?.includes('localhost') && window.location.hostname !== 'localhost') {
      errors.push('Using localhost API URL in production environment');
      suggestions.push('Update VITE_API_BASE_URL to point to your production backend');
    }
  } else {
    warnings.push('Using mock API - set VITE_USE_REAL_API=true to connect to real backend');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions
  };
};

export const logConfigurationStatus = (): void => {
  const validation = validateConfiguration();
  
  console.group('🔧 Configuration Status');
  
  if (validation.isValid) {
    console.log('✅ Configuration appears valid');
  } else {
    console.log('❌ Configuration has issues');
  }

  if (validation.errors.length > 0) {
    console.group('❌ Errors:');
    validation.errors.forEach(error => console.error(`• ${error}`));
    console.groupEnd();
  }

  if (validation.warnings.length > 0) {
    console.group('⚠️ Warnings:');
    validation.warnings.forEach(warning => console.warn(`• ${warning}`));
    console.groupEnd();
  }

  if (validation.suggestions.length > 0) {
    console.group('💡 Suggestions:');
    validation.suggestions.forEach(suggestion => console.info(`• ${suggestion}`));
    console.groupEnd();
  }

  console.groupEnd();
};

export const getEnvironmentInfo = () => {
  return {
    useRealAPI: import.meta.env.VITE_USE_REAL_API === 'true',
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
    wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:3001',
    environment: import.meta.env.NODE_ENV || 'development',
    hostname: window.location.hostname,
    protocol: window.location.protocol
  };
};
