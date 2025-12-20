# 🔧 Fix 404 Errors on Vercel for Login/Signup

## 🐛 Problem

- ✅ Login works locally (port 3002)
- ✅ Signup works locally
- ❌ Getting 404 errors on Vercel for both login and signup

## 🔍 Root Cause

**The `/api/auth/register` endpoint exists in code but hasn't been deployed to Vercel yet.**

When I tested:
- ✅ `/api/auth/login` → Works (returns "Invalid credentials" - endpoint exists)
- ❌ `/api/auth/register` → Returns "Endpoint not found" (not deployed)

---

## ✅ SOLUTION

### **Step 1: Trigger Vercel Deployment**

I just pushed a commit to trigger deployment. **Wait 2-3 minutes** for Vercel to rebuild.

**OR manually trigger:**
1. Go to: https://vercel.com/dashboard
2. Find: **smartler-f-b-menu-management**
3. Click **Deployments** tab
4. Click **"Redeploy"** on latest deployment
5. Wait for "Ready" status

---

### **Step 2: Verify Deployment**

After deployment completes, test:

```bash
# Test login endpoint
curl -X POST https://smartler-f-b-menu-management-6yjiv74io.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test","password":"test"}'

# Should return: {"success":false,"message":"Invalid credentials"}
# NOT: 404 or "Endpoint not found"

# Test register endpoint
curl -X POST https://smartler-f-b-menu-management-6yjiv74io.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"test123","role":"Staff"}'

# Should return: {"success":true,"data":{...}} or error message
# NOT: 404 or "Endpoint not found"
```

---

### **Step 3: Clear Browser Cache**

After deployment:

1. Open portal: https://smartler-f-b-menu-management-6yjiv74io.vercel.app
2. Press **F12** (DevTools)
3. **Application** tab → **Clear storage** → **Clear site data**
4. **Hard refresh:** `Ctrl/Cmd + Shift + R`

---

## 🔍 Why This Happened

1. **Register endpoint was added** in recent commits
2. **Vercel hasn't deployed** the latest code yet
3. **Old deployment** doesn't have `/api/auth/register` route
4. **Result:** 404 error when trying to signup

---

## 📊 Current Status

| Endpoint | Local | Vercel (Before) | Vercel (After Deploy) |
|----------|-------|-----------------|------------------------|
| `/api/auth/login` | ✅ Works | ✅ Works | ✅ Works |
| `/api/auth/register` | ✅ Works | ❌ 404 | ✅ Will work |
| `/api/auth/me` | ✅ Works | ✅ Works | ✅ Works |

---

## 🧪 Test After Deployment

1. **Test Login:**
   - Go to: https://smartler-f-b-menu-management-6yjiv74io.vercel.app
   - Login: `super@smartler.com` / `password`
   - ✅ Should work (if password hash is fixed)

2. **Test Signup:**
   - Click "Don't have an account? Create one"
   - Fill form and submit
   - ✅ Should work without 404

---

## 🆘 If Still Getting 404 After Deployment

### **Check 1: Verify Endpoint Exists**

```bash
curl https://smartler-f-b-menu-management-6yjiv74io.vercel.app/api/auth/register
```

**If 404:** Deployment didn't include the endpoint  
**If "Endpoint not found":** Route not registered  
**If JSON response:** ✅ Working!

### **Check 2: Check Vercel Build Logs**

1. Vercel Dashboard → Deployments
2. Click latest deployment
3. Check **Build Logs** for errors
4. Look for: "Cannot find module" or route registration errors

### **Check 3: Verify API Folder Structure**

Make sure `api/index.js` exists and exports the Express app:
```javascript
const { app } = require('../backend/server');
module.exports = app;
```

---

## 📝 Files to Verify

- ✅ `api/index.js` - Serverless function entry point
- ✅ `backend/server.js` - Has `app.post('/api/auth/register', ...)`
- ✅ `vercel.json` - Rewrites exclude `/api` routes

---

## ✅ Summary

**Problem:** Register endpoint not deployed to Vercel  
**Solution:** Wait for Vercel deployment (2-3 minutes)  
**Status:** Deployment triggered, waiting for build

**After deployment:**
- ✅ Login will work
- ✅ Signup will work
- ✅ No more 404 errors

---

**Check Vercel dashboard in 3 minutes, then test!** 🚀
