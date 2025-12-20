# 🔑 Generate API Token - Step by Step Guide

**Complete guide to generate API token for tablet app**

---

## 📍 Where to Run These Commands

You can run these commands in:
- **Cursor Terminal** (recommended - you're already here!)
- **Mac Terminal** (Applications → Utilities → Terminal)
- **Windows Command Prompt** or **PowerShell**
- **Any terminal/command line**

---

## 🚀 Step 1: Login and Get JWT Token

### Copy this command:

```bash
curl -X POST https://smartler-f-b-menu-management-6yjiv74io.vercel.app/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@example.com","password":"password"}'
```

### How to run:

1. **Open Cursor Terminal** (or your terminal)
   - In Cursor: View → Terminal (or press `` Ctrl+` `` or `` Cmd+` ``)

2. **Paste the command** and press Enter

3. **You'll see output like this:**
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
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItMTIzIiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbGUiOiJTdXBlcmFkbWluIiwiaWF0IjoxNzY2MTYyNzk2LCJleHAiOjE3NjYyNDkxOTZ9.c7gzT5OfvwMuaZ1M7XnC1HMYqIfYKgg7ZY0Lm-qXs7U"
  }
}
```

4. **Copy the token** - It's the long string after `"token":` (starts with `eyJ...`)

---

## 🔑 Step 2: Generate API Token

### Copy this command template:

```bash
curl -X POST https://smartler-f-b-menu-management-6yjiv74io.vercel.app/api/tokens/generate -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" -d '{"name":"Tablet App - Production","expiresInDays":365}'
```

### How to run:

1. **Replace `YOUR_JWT_TOKEN_HERE`** with the token you copied from Step 1

2. **Example** (with actual token):
```bash
curl -X POST https://smartler-f-b-menu-management-6yjiv74io.vercel.app/api/tokens/generate -H "Content-Type: application/json" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItMTIzIiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbGUiOiJTdXBlcmFkbWluIiwiaWF0IjoxNzY2MTYyNzk2LCJleHAiOjE3NjYyNDkxOTZ9.c7gzT5OfvwMuaZ1M7XnC1HMYqIfYKgg7ZY0Lm-qXs7U" -d '{"name":"Tablet App - Production","expiresInDays":365}'
```

3. **Paste in terminal** and press Enter

4. **You'll see output like this:**
```json
{
  "success": true,
  "data": {
    "id": "token-123",
    "name": "Tablet App - Production",
    "token": "tb_476af4703c55205f81176e4ca5f438f4bc195b7acc41977e2e846e6192bd049c",
    "expiresAt": "2026-12-19T00:00:00.000Z",
    "message": "⚠️ IMPORTANT: Save this token now. It will not be shown again!"
  }
}
```

5. **Copy the API token** - It's the string after `"token":` (starts with `tb_`)

**⚠️ IMPORTANT:** Save this token immediately! You won't see it again!

---

## 🎯 Quick Copy-Paste Method (Easier)

### Method 1: One-Line Commands

**Step 1 - Login:**
```bash
curl -X POST https://smartler-f-b-menu-management-6yjiv74io.vercel.app/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@example.com","password":"password"}'
```

**Step 2 - Generate Token** (replace YOUR_TOKEN):
```bash
curl -X POST https://smartler-f-b-menu-management-6yjiv74io.vercel.app/api/tokens/generate -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_TOKEN" -d '{"name":"Tablet App","expiresInDays":365}'
```

### Method 2: Using Variables (Easier)

**In Cursor Terminal, run these one by one:**

```bash
# Step 1: Login and save token to variable
JWT_TOKEN=$(curl -s -X POST https://smartler-f-b-menu-management-6yjiv74io.vercel.app/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@example.com","password":"password"}' | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['token'])")

# Step 2: Generate API token (uses the saved JWT_TOKEN)
curl -X POST https://smartler-f-b-menu-management-6yjiv74io.vercel.app/api/tokens/generate -H "Content-Type: application/json" -H "Authorization: Bearer $JWT_TOKEN" -d '{"name":"Tablet App - Production","expiresInDays":365}' | python3 -m json.tool
```

**This method automatically:**
- Saves the JWT token to a variable
- Uses it in the next command
- Formats the output nicely

---

## 📝 Visual Guide

### Step 1: Login

```
┌─────────────────────────────────────────────────────────┐
│ Cursor Terminal                                          │
├─────────────────────────────────────────────────────────┤
│ $ curl -X POST https://smartler-f-b-menu-management... │
│                                                          │
│ {                                                        │
│   "success": true,                                      │
│   "data": {                                             │
│     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." │ ← Copy this!
│   }                                                      │
│ }                                                        │
└─────────────────────────────────────────────────────────┘
```

### Step 2: Generate API Token

```
┌─────────────────────────────────────────────────────────┐
│ Cursor Terminal                                          │
├─────────────────────────────────────────────────────────┤
│ $ curl -X POST ... -H "Authorization: Bearer eyJ..." \  │
│   -d '{"name":"Tablet App","expiresInDays":365}'        │
│                                                          │
│ {                                                        │
│   "success": true,                                      │
│   "data": {                                             │
│     "token": "tb_476af4703c55205f81176e4ca5f438f4..." │ ← Copy this!
│   }                                                      │
│ }                                                        │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ What You'll Get

After Step 2, you'll have:

1. **API Token:** `tb_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
2. **Token Name:** Tablet App - Production
3. **Expires:** 365 days from now

---

## 📱 Use in Tablet App

```
BACKEND_URL=https://smartler-f-b-menu-management-6yjiv74io.vercel.app/api
BACKEND_API_TOKEN=tb_your_generated_token_here
```

---

## 🆘 Troubleshooting

### "Command not found: curl"
- **Mac/Linux:** curl should be installed by default
- **Windows:** Install Git Bash or use PowerShell

### "Invalid token" or "401 Unauthorized"
- Make sure you copied the ENTIRE token (it's very long)
- No spaces before/after the token
- Token should start with `eyJ`

### "Failed to fetch" or Network Error
- Check your internet connection
- Verify the API URL is correct
- Try accessing: `https://smartler-f-b-menu-management-6yjiv74io.vercel.app/api/health`

---

## 🎯 Quick Test

After generating the token, test it:

```bash
curl -X GET https://smartler-f-b-menu-management-6yjiv74io.vercel.app/api/tokens/verify -H "Authorization: Bearer tb_your_token_here"
```

Should return: `{"success":true,"message":"API token is valid",...}`

---

**That's it! You now have your API token for the tablet app! 🎉**

