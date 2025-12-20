# 🎯 Frontend Integration Guide

## 🚀 **What You Need to Do in Your Frontend**

Your frontend now has all the backend integration infrastructure ready. Here's exactly what you need to do to start using live data:

### **Step 1: Configure Environment (✅ Done)**

You already have the `.env.local` file created. Update it with your actual backend URL:

```env
# Update this URL to match your backend server
VITE_API_BASE_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001
VITE_USE_REAL_API=false  # Set to 'true' when your backend is ready
```

### **Step 2: Gradual Migration Strategy**

Instead of changing everything at once, here's a simple approach:

#### **Option A: Environment Toggle (Recommended)**

Add this to your `.env.local`:
```env
VITE_USE_REAL_API=false  # Start with mock, change to 'true' for real API
```

Then in your components, you can gradually switch:

```typescript
// In any component that uses API calls
import { propertiesApi } from '../services/apiService';  // Real API
import * as mockApi from '../services/mockApiService';   // Mock API

// Use environment variable to choose
const useRealAPI = import.meta.env.VITE_USE_REAL_API === 'true';
const api = useRealAPI ? propertiesApi : mockApi;
```

#### **Option B: Component-by-Component Migration**

Update components one by one. Here's the pattern:

**Before (using mock):**
```typescript
import * as api from '../services/mockApiService';

// In component
const fetchData = async () => {
  const data = await api.getProperties('tenant-123');
  setData(data);
};
```

**After (using real API):**
```typescript
import { propertiesApi } from '../services/apiService';
import { useApi } from '../hooks/useApi';

// In component - much simpler!
const { data, loading, error, refetch } = useApi(() => propertiesApi.getAll());
```

### **Step 3: Update Key Components**

Here are the most important components to update first:

#### **1. Login Component (Already Updated ✅)**
```typescript
// LoginPage.tsx - Already using real API
import { authApi } from '../services/apiService';

const handleLogin = async () => {
  const { user, token } = await authApi.login(email, password);
  // Token is automatically stored
};
```

#### **2. Properties Page**
```typescript
// PropertiesPage.tsx
import { propertiesApi } from '../services/apiService';
import { useApi } from '../hooks/useApi';

const PropertiesPage = () => {
  const { data: properties, loading, error, refetch } = useApi(
    () => propertiesApi.getAll(),
    [], // dependencies
    ['property_updated'] // WebSocket events to listen for
  );

  const handleCreate = async (propertyData) => {
    await propertiesApi.create(propertyData);
    refetch(); // Refresh the list
  };
};
```

#### **3. Menu Items Page**
```typescript
// MenuItemsPage.tsx
import { menuItemsApi } from '../services/apiService';
import { useApi } from '../hooks/useApi';

const MenuItemsPage = () => {
  const { data: menuItems, loading, refetch } = useApi(
    () => menuItemsApi.getByCategory(categoryId),
    [categoryId],
    ['menu_item_updated', 'menu_item_created'] // Real-time updates
  );
};
```

#### **4. Live Orders (Real-time)**
```typescript
// OrdersPage.tsx
import { ordersApi } from '../services/apiService';
import { useApi, useWebSocket } from '../hooks/useApi';

const OrdersPage = () => {
  const { data: orders, loading, refetch } = useApi(
    () => ordersApi.getLiveOrders(),
    [],
    ['order_created', 'order_updated'] // Real-time updates
  );

  const { subscribe } = useWebSocket();

  useEffect(() => {
    // Listen for real-time order updates
    const unsubscribe = subscribe('order_created', (event) => {
      console.log('New order:', event.data);
      refetch(); // Refresh orders list
    });

    return unsubscribe;
  }, []);
};
```

### **Step 4: Test with Mock Data First**

1. **Keep using mock data** while you build your backend
2. **Set `VITE_USE_REAL_API=false`** in `.env.local`
3. **Everything works exactly the same** as before

### **Step 5: Switch to Real API When Ready**

When your backend is ready:

1. **Set `VITE_USE_REAL_API=true`** in `.env.local`
2. **Update `VITE_API_BASE_URL`** to your backend URL
3. **Test each feature** one by one

### **Step 6: Real-time Features**

When you want real-time updates:

```typescript
import { useWebSocket } from '../hooks/useApi';

const MyComponent = () => {
  const { connectionState, subscribe } = useWebSocket();

  useEffect(() => {
    // Listen for specific events
    const unsubscribe = subscribe('order_created', (event) => {
      // Handle new order
      console.log('New order received:', event.data);
    });

    return unsubscribe; // Cleanup
  }, []);

  return (
    <div>
      <p>WebSocket Status: {connectionState}</p>
      {/* Your component content */}
    </div>
  );
};
```

## 🎯 **Quick Start Checklist**

### **Right Now (Development with Mock Data):**
- [ ] ✅ Environment file created
- [ ] ✅ Backend integration code ready
- [ ] ✅ Keep `VITE_USE_REAL_API=false`
- [ ] ✅ Continue development as normal

### **When Backend is Ready:**
- [ ] Set `VITE_USE_REAL_API=true`
- [ ] Update API URL in `.env.local`
- [ ] Test login functionality
- [ ] Test CRUD operations
- [ ] Enable WebSocket for real-time updates

### **For Production:**
- [ ] Use HTTPS URLs (`https://your-api.com`)
- [ ] Use WSS for WebSocket (`wss://your-api.com`)
- [ ] Set proper environment variables

## 🔧 **Example: Complete Component Migration**

Here's a complete example of how to update a component:

**Before:**
```typescript
const RestaurantsPage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await mockApi.getAllRestaurants();
        setRestaurants(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
};
```

**After:**
```typescript
const RestaurantsPage = () => {
  const { data: restaurants = [], loading, error } = useApi(
    () => restaurantsApi.getAll(),
    [], // dependencies
    ['restaurant_updated'] // real-time updates
  );

  // That's it! Much simpler and includes real-time updates
};
```

## 🚨 **Important Notes**

1. **Start Simple**: Keep using mock data until your backend is ready
2. **Gradual Migration**: Update one component at a time
3. **Test Thoroughly**: Each API endpoint should be tested
4. **Error Handling**: The new system includes better error handling
5. **Real-time**: WebSocket updates happen automatically

## 🎉 **Benefits You Get**

✅ **Automatic Authentication** - JWT tokens handled automatically  
✅ **Error Handling** - Network errors, validation errors, auth errors  
✅ **Loading States** - Built-in loading indicators  
✅ **Real-time Updates** - WebSocket integration  
✅ **Type Safety** - Full TypeScript support  
✅ **Caching** - Efficient data fetching  
✅ **Offline Handling** - Graceful degradation  

Your frontend is now enterprise-ready! 🚀
