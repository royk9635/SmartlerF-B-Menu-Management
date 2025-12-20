# 🌐 **Netlify Backend Integration Guide**

## 🎯 **Overview**
This guide shows you how to connect your Google AI Studio frontend to your Netlify-hosted backend for real-time data synchronization.

---

## 📋 **Step-by-Step Integration**

### **Step 1: Get Your Netlify Backend URL**

1. **Go to your Netlify dashboard**
2. **Find your deployed backend app**
3. **Copy the URL** (e.g., `https://your-backend-app.netlify.app`)

### **Step 2: Update Frontend Environment Configuration**

In your **Google AI Studio** project, you need to update the environment configuration:

#### **Option A: Update .env.local file**
```env
# Netlify Backend Configuration
VITE_API_BASE_URL=https://your-backend-app.netlify.app/api
VITE_WS_URL=wss://your-backend-app.netlify.app
VITE_USE_REAL_API=true
VITE_NODE_ENV=production
VITE_API_LOGGING=true
```

#### **Option B: Update config/api.ts directly**
```typescript
// In config/api.ts - replace the BASE_URL
export const API_CONFIG = {
  BASE_URL: 'https://your-backend-app.netlify.app/api', // Your Netlify URL
  // ... rest of the config
}
```

### **Step 3: Test Backend Endpoints**

Before connecting, verify your backend is working:

#### **Test Authentication:**
```bash
curl -X POST https://your-backend-app.netlify.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password"}'
```

#### **Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-123",
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "Superadmin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### **Step 4: Update Frontend Code in Google AI Studio**

#### **4.1: Update Environment Toggle**
In your frontend code, make sure you're using the real API:

```typescript
// This should be set to 'true' for production
const useRealAPI = import.meta.env.VITE_USE_REAL_API === 'true';
```

#### **4.2: Update API Base URL**
```typescript
// In config/api.ts
export const API_CONFIG = {
  BASE_URL: 'https://your-backend-app.netlify.app/api',
  // ... rest of config
}
```

### **Step 5: Enable CORS on Your Backend**

Your Netlify backend must allow requests from Google AI Studio:

```javascript
// In your backend (Express.js example)
app.use(cors({
  origin: [
    'https://aistudio.google.com',
    'https://ai.studio',
    'http://localhost:5173', // for local development
    'http://localhost:5174'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## 🚀 **Quick Setup for Google AI Studio**

### **Method 1: Environment Variables (Recommended)**

1. **In Google AI Studio**, find your environment configuration
2. **Add these variables**:
   ```
   VITE_API_BASE_URL=https://your-backend-app.netlify.app/api
   VITE_USE_REAL_API=true
   ```

### **Method 2: Direct Code Update**

If environment variables aren't available, update the code directly:

```typescript
// In config/api.ts - Replace this line:
BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',

// With your Netlify URL:
BASE_URL: 'https://your-backend-app.netlify.app/api',
```

```typescript
// In components where API toggle is used, force real API:
const useRealAPI = true; // Force real API instead of checking env
```

---

## 📝 **Required Backend Endpoints**

Your Netlify backend must implement these endpoints:

### **Authentication**
```
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
POST /api/auth/refresh
```

### **Core Resources**
```
# Properties
GET    /api/properties
POST   /api/properties
PUT    /api/properties/:id
DELETE /api/properties/:id

# Restaurants
GET    /api/restaurants
POST   /api/restaurants
PUT    /api/restaurants/:id
DELETE /api/restaurants/:id

# Categories
GET    /api/categories
POST   /api/categories
PUT    /api/categories/:id
DELETE /api/categories/:id

# Menu Items
GET    /api/menu-items
POST   /api/menu-items
PUT    /api/menu-items/:id
DELETE /api/menu-items/:id
PATCH  /api/menu-items/bulk
```

### **Expected Response Format**
```json
{
  "success": true,
  "data": { /* your data */ },
  "message": "Operation successful"
}
```

---

## 🔧 **Testing the Integration**

### **Step 1: Test Login**
1. **Open your Google AI Studio app**
2. **Try logging in** with your backend credentials
3. **Check browser console** for any errors
4. **Look for green status indicator** (Real API connected)

### **Step 2: Test CRUD Operations**
1. **Create a new property**
2. **Add a restaurant**
3. **Create menu categories**
4. **Add menu items**
5. **Verify data persists** after page refresh

### **Step 3: Test Real-time Updates**
1. **Open app in multiple tabs**
2. **Create/update data in one tab**
3. **Check if changes appear in other tabs**

---

## 🚨 **Common Issues & Solutions**

### **Issue 1: CORS Errors**
**Error**: `Access to fetch at 'https://...' from origin 'https://aistudio.google.com' has been blocked by CORS policy`

**Solution**: Add CORS configuration to your backend:
```javascript
app.use(cors({
  origin: ['https://aistudio.google.com', 'https://ai.studio'],
  credentials: true
}));
```

### **Issue 2: 404 Not Found**
**Error**: `GET https://your-backend-app.netlify.app/api/properties 404`

**Solution**: 
- Check if your backend routes are properly configured
- Verify the API base path is `/api`
- Test endpoints directly with curl/Postman

### **Issue 3: Authentication Fails**
**Error**: `Invalid credentials` or `401 Unauthorized`

**Solution**:
- Verify your backend user accounts exist
- Check password hashing is working
- Test login endpoint directly

### **Issue 4: Environment Variables Not Working**
**Solution**: Update code directly:
```typescript
// Force production configuration
const API_CONFIG = {
  BASE_URL: 'https://your-backend-app.netlify.app/api',
  // ... other config
};

const useRealAPI = true; // Force real API
```

---

## 📱 **Production Checklist**

### **Backend (Netlify)**
- [ ] ✅ All API endpoints implemented
- [ ] ✅ CORS configured for Google AI Studio
- [ ] ✅ Database connected and working
- [ ] ✅ Authentication system working
- [ ] ✅ HTTPS enabled (automatic with Netlify)

### **Frontend (Google AI Studio)**
- [ ] ✅ API URL updated to Netlify backend
- [ ] ✅ `VITE_USE_REAL_API=true` set
- [ ] ✅ Environment variables configured
- [ ] ✅ Login functionality tested
- [ ] ✅ CRUD operations working

---

## 🎯 **Quick Test Commands**

### **Test Your Backend:**
```bash
# Test login
curl -X POST https://your-backend-app.netlify.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@test.com", "password": "password"}'

# Test properties (replace TOKEN with actual token)
curl -H "Authorization: Bearer TOKEN" \
  https://your-backend-app.netlify.app/api/properties
```

### **Test Frontend Connection:**
1. Open browser console
2. Look for API calls to your Netlify URL
3. Check for successful responses (200 status)
4. Verify data is displaying correctly

---

## 🌟 **Final Steps**

### **1. Update Your Google AI Studio App:**
- Set environment variables or update code directly
- Deploy/update your app

### **2. Test End-to-End:**
- Login with real credentials
- Create properties, restaurants, menu items
- Verify data persists and syncs

### **3. Monitor:**
- Check browser console for errors
- Monitor Netlify function logs
- Verify real-time updates work

---

## 🎉 **Success Indicators**

When everything is working correctly, you should see:

1. **🟢 Green status indicator** in your app (Real API connected)
2. **Successful login** with your backend credentials
3. **Data persistence** - created items remain after refresh
4. **Real-time updates** - changes sync across browser tabs
5. **No CORS errors** in browser console

Your F&B Management System is now fully connected to live data! 🚀

---

## 📞 **Need Help?**

If you encounter issues:
1. Check browser console for error messages
2. Verify Netlify function logs
3. Test API endpoints directly with curl/Postman
4. Ensure CORS is properly configured

**Your production-ready system is just a few configuration changes away!** 🌟
