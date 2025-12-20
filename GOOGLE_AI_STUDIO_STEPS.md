# 🎯 **Google AI Studio Integration Steps**

## 📋 **Simple Checklist for Google AI Studio**

### **What You Need:**
- ✅ Your Netlify backend URL (e.g., `https://your-app.netlify.app`)
- ✅ Backend admin credentials (email/password)

---

## 🚀 **Step 1: Update Frontend Configuration**

### **Option A: Environment Variables (If Available)**
In Google AI Studio environment settings, add:
```
VITE_API_BASE_URL=https://your-backend-app.netlify.app/api
VITE_USE_REAL_API=true
```

### **Option B: Direct Code Update (Recommended)**

**File: `config/api.ts`**
```typescript
export const API_CONFIG = {
  // Replace this line:
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  
  // With your Netlify URL:
  BASE_URL: 'https://your-backend-app.netlify.app/api',
  
  // Keep the rest as is...
  ENDPOINTS: {
    // ... existing endpoints
  }
};
```

---

## 🔧 **Step 2: Force Real API Usage**

**File: `components/LoginPage.tsx`**
```typescript
// Find this line:
const useRealAPI = import.meta.env.VITE_USE_REAL_API === 'true';

// Replace with:
const useRealAPI = true; // Force real API
```

**File: `App.tsx`**
```typescript
// Find this line:
const useRealAPI = import.meta.env.VITE_USE_REAL_API === 'true';

// Replace with:
const useRealAPI = true; // Force real API
```

---

## 🎯 **Step 3: Test the Connection**

1. **Deploy/Update** your Google AI Studio app
2. **Open the app** in browser
3. **Look for**:
   - 🟢 **Green status indicator** (bottom-right corner)
   - **"Real API" text** in status indicator
4. **Try logging in** with your backend credentials

---

## 🔍 **Step 4: Verify Backend Requirements**

Your Netlify backend must have these endpoints working:

### **Test Login Endpoint:**
```bash
curl -X POST https://your-backend-app.netlify.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password"}'
```

### **Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "name": "...", "email": "..." },
    "token": "eyJ..."
  }
}
```

---

## 📝 **Step 5: Backend CORS Configuration**

Your Netlify backend needs CORS setup:

```javascript
// In your backend code
app.use(cors({
  origin: [
    'https://aistudio.google.com',
    'https://ai.studio',
    'https://studio.ai.google.com'  // Add all possible AI Studio domains
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## 🎉 **Success Checklist**

When everything works, you should see:

- [ ] 🟢 **Green status indicator** in app
- [ ] **Successful login** with backend credentials  
- [ ] **Properties page loads** with real data
- [ ] **Can create new properties** and they persist
- [ ] **Can create restaurants** under properties
- [ ] **Can create menu items** and categories
- [ ] **Data remains** after page refresh

---

## 🚨 **Quick Troubleshooting**

### **If Login Fails:**
1. Check browser console for errors
2. Verify backend URL is correct
3. Test login endpoint directly (curl command above)
4. Check CORS configuration

### **If Status Shows Yellow (Mock API):**
1. Verify `useRealAPI = true` in code
2. Check API_CONFIG.BASE_URL points to Netlify
3. Redeploy the app

### **If CORS Errors:**
```
Access to fetch at 'https://...' has been blocked by CORS policy
```
1. Add AI Studio domains to backend CORS
2. Redeploy backend
3. Test again

---

## 🎯 **Final Result**

Once connected, you can:

1. **Login** with real backend credentials
2. **Create Properties** → Saved to Netlify backend
3. **Add Restaurants** → Linked to properties in backend
4. **Create Menu Categories** → Organized by restaurant
5. **Add Menu Items** → Complete with images, prices, etc.
6. **Real-time Updates** → Changes sync across tabs

**Your F&B Management System is now live with real data!** 🚀

---

## 📞 **Need the Exact Code Changes?**

If you need the exact files with changes made, here are the key modifications:

### **config/api.ts:**
```typescript
export const API_CONFIG = {
  BASE_URL: 'https://YOUR-NETLIFY-APP.netlify.app/api', // Your URL here
  // ... rest unchanged
};
```

### **components/LoginPage.tsx & App.tsx:**
```typescript
const useRealAPI = true; // Force real API instead of env check
```

That's it! Just these 3 changes and your app connects to live backend data. 🌟
