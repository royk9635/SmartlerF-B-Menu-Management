# ⚡ **Quick Config for Google AI Studio**

## 🎯 **Copy-Paste These Changes**

### **Step 1: Update API Configuration**

**File: `config/api.ts`**
```typescript
// API Configuration
export const API_CONFIG = {
  // 🔥 CHANGE THIS URL TO YOUR NETLIFY BACKEND
  BASE_URL: 'https://YOUR-NETLIFY-APP-NAME.netlify.app/api',
  
  // API endpoints (keep as is)
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
```

### **Step 2: Force Real API in Login**

**File: `components/LoginPage.tsx`**
```typescript
// Find the handleSubmit function and replace the try block:

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
        // 🔥 FORCE REAL API - CHANGE THIS
        const useRealAPI = true; // Always use real API
        
        let user;
        if (useRealAPI) {
            const result = await authApi.login(email, password);
            user = result.user;
        } else {
            // Use mock API
            user = await mockApi.login(email, password);
        }
        
        onLoginSuccess(user);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(errorMessage);
        showToast(errorMessage, 'error');
        setIsLoading(false);
    }
};
```

### **Step 3: Force Real API in App**

**File: `App.tsx`**
```typescript
// Find the checkSession function and update:

const checkSession = async () => {
    setLoadingSession(true);
    try {
        // 🔥 FORCE REAL API - CHANGE THIS
        const useRealAPI = true; // Always use real API
        
        let user;
        if (useRealAPI) {
            user = await authApi.getCurrentUser();
        } else {
            // Use mock API - for mock, we'll just skip session check
            throw new Error('No session in mock mode');
        }
        
        setCurrentUser(user);
    } catch (error) {
        // No active session, which is fine
        console.log('No active session');
    } finally {
        setLoadingSession(false);
    }
};

// Also find the handleLogout function and update:

const handleLogout = async () => {
    try {
        // 🔥 FORCE REAL API - CHANGE THIS
        const useRealAPI = true; // Always use real API
        
        if (useRealAPI) {
            await authApi.logout();
        } else {
            // Use mock API
            await mockApi.logout();
        }
        
        setCurrentUser(null);
        showToast('You have been logged out.', 'success');
    } catch (error) {
        showToast('Logout failed. Please try again.', 'error');
    }
};
```

---

## 🎯 **That's It! Just 3 Changes:**

1. **Replace `YOUR-NETLIFY-APP-NAME`** with your actual Netlify app name
2. **Set `useRealAPI = true`** in LoginPage.tsx  
3. **Set `useRealAPI = true`** in App.tsx (2 places)

---

## 🚀 **Test Your Setup**

1. **Update the code** in Google AI Studio
2. **Deploy/Save** your changes
3. **Open the app**
4. **Look for 🟢 Green indicator** (Real API connected)
5. **Login** with your backend credentials
6. **Create properties, restaurants, menu items**
7. **Refresh page** - data should persist!

---

## 🔧 **Backend Requirements**

Your Netlify backend must respond to:
- `POST /api/auth/login` - For authentication
- `GET /api/properties` - For properties list
- `POST /api/properties` - For creating properties
- Similar endpoints for restaurants, categories, menu items

**Response format:**
```json
{
  "success": true,
  "data": { /* your data */ }
}
```

---

## 🎉 **Success!**

When working, you'll see:
- 🟢 **Green status indicator**
- **Real backend data** in your dashboard
- **Persistent data** after page refresh
- **Ability to create/edit** properties, restaurants, menu items

**Your F&B Management System is now connected to live data!** 🌟

---

## 📝 **Quick Checklist**

- [ ] Updated `config/api.ts` with Netlify URL
- [ ] Set `useRealAPI = true` in LoginPage.tsx
- [ ] Set `useRealAPI = true` in App.tsx (2 places)
- [ ] Backend has CORS enabled for AI Studio
- [ ] Backend endpoints are working
- [ ] Deployed changes to Google AI Studio
- [ ] Tested login with backend credentials
- [ ] Verified data persistence

**Done!** 🚀
