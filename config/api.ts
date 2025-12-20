// API Configuration
// In production (Vercel), use relative URL since frontend and backend are on same domain
// In development, use localhost:3001
const getBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  // Production: use relative URL (same domain)
  if (import.meta.env.PROD || window.location.hostname !== 'localhost') {
    return '/api';
  }
  // Development: use localhost
  return 'http://localhost:3002/api';
};

export const API_CONFIG = {
  // Replace with your actual backend URL
  BASE_URL: getBaseUrl(),
  
  // API endpoints
  ENDPOINTS: {
    // Authentication
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      ME: '/auth/me',
    },
    
    // Properties
    PROPERTIES: '/properties',
    
    // Restaurants
    RESTAURANTS: '/restaurants',
    
    // Categories
    CATEGORIES: '/categories',
    
    // Menu Items
    MENU_ITEMS: '/menu-items',
    
    // Users
    USERS: '/users',
    
    // Attributes
    ATTRIBUTES: '/attributes',
    
    // Allergens
    ALLERGENS: '/allergens',
    
    // Modifiers
    MODIFIER_GROUPS: '/modifier-groups',
    MODIFIER_ITEMS: '/modifier-items',
    
    // Sales & Analytics
    SALES: '/sales',
    ANALYTICS: '/analytics',
    
    // Live Orders
    ORDERS: '/orders',
    
    // System Import
    IMPORT: '/import',
    
    // Public Menu
    PUBLIC_MENU: '/public/menu',
    
    // Audit Logs
    AUDIT_LOGS: '/audit-logs',
  },
  
  // Request timeout
  TIMEOUT: 30000,
  
  // Headers
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
} as const;
