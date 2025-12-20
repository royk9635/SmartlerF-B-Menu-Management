# 🔓 Fix Vercel Deployment Protection

**Your API is protected by Vercel's deployment protection, which blocks API access.**

---

## 🚨 Problem

When you try to access the API, you see Vercel's authentication page instead of JSON responses. This is because **Deployment Protection** is enabled.

---

## ✅ Solution: Disable Deployment Protection

### Step 1: Go to Vercel Dashboard

1. Go to: https://vercel.com/dashboard
2. Click on your project: `smartler-f-b-menu-management`

### Step 2: Disable Protection

1. Click **"Settings"** tab
2. Click **"Deployment Protection"** in the left sidebar
3. **Disable** or **Remove** protection for Production deployments
4. Or set it to **"No Protection"**

### Step 3: Redeploy

After disabling protection:
- Vercel will auto-redeploy, OR
- Go to Deployments → Click "Redeploy"

---

## 🧪 Test After Disabling Protection

Once protection is disabled, try again:

```bash
curl -X POST https://smartler-f-b-menu-management-6yjiv74io.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

**You should now see JSON response with the JWT token!**

---

## 📋 Alternative: Use curl in Terminal (Not Browser)

**Important:** Don't paste curl commands in the browser! Use the **Cursor Terminal**:

1. **Open Cursor Terminal:**
   - View → Terminal (or press `` Cmd+` ``)

2. **Paste the curl command there**

3. **You'll see JSON response** (not HTML)

---

## 🎯 Quick Commands (Copy These)

### Step 1: Login (in Cursor Terminal)

```bash
curl -X POST https://smartler-f-b-menu-management-6yjiv74io.vercel.app/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@example.com","password":"password"}'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Copy the `token` value** (the long string starting with `eyJ`)

### Step 2: Generate API Token

Replace `YOUR_JWT_TOKEN` with the token from Step 1:

```bash
curl -X POST https://smartler-f-b-menu-management-6yjiv74io.vercel.app/api/tokens/generate -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_JWT_TOKEN" -d '{"name":"Tablet App - Production","expiresInDays":365}'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "token": "tb_476af4703c55205f81176e4ca5f438f4bc195b7acc41977e2e846e6192bd049c"
  }
}
```

**Copy the `token` value** (starts with `tb_`)

---

## 🔍 Where to Find JWT Token

After running Step 1 in **Cursor Terminal**, you'll see:

```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItMTIzIiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbGUiOiJTdXBlcmFkbWluIiwiaWF0IjoxNzY2MTYyNzk2LCJleHAiOjE3NjYyNDkxOTZ9.c7gzT5OfvwMuaZ1M7XnC1HMYqIfYKgg7ZY0Lm-qXs7U"
  }
}
```

**The JWT token is:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (the entire long string)

---

## ⚠️ Important Notes

1. **Don't use browser** - Use Cursor Terminal or command line
2. **Disable Vercel Protection** - Otherwise API won't work
3. **Copy entire token** - It's very long, make sure you get it all
4. **No spaces** - Token should have no spaces before/after

---

**After disabling protection, the commands will work! 🎉**

