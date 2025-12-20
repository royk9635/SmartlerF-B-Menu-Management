# 🔐 Vercel Environment Variables Guide

Complete list of environment variables needed for Vercel deployment.

---

## ✅ Required Environment Variables

### 1. **JWT_SECRET** (REQUIRED)
**Purpose:** Secret key for signing JWT tokens  
**Generate:** 
```bash
openssl rand -base64 32
```
**Example:**
```
JWT_SECRET=abc123xyz789def456ghi012jkl345mno678pqr901stu234vwx567yz
```
**⚠️ CRITICAL:** Must be at least 32 characters long. Keep this secret!

---

### 2. **NODE_ENV** (REQUIRED)
**Purpose:** Sets the environment mode  
**Value:**
```
NODE_ENV=production
```

---

## 🔧 Optional Environment Variables

### 3. **FRONTEND_URL** (Recommended)
**Purpose:** Frontend portal URL for CORS  
**Example:**
```
FRONTEND_URL=https://your-frontend.vercel.app
```
**Or:**
```
FRONTEND_URL=https://your-frontend-domain.com
```

---

### 4. **TABLET_APP_URL** (Recommended)
**Purpose:** Tablet app URL for CORS  
**Example:**
```
TABLET_APP_URL=https://your-tablet-app-domain.com
```
**Note:** If same as frontend, you can skip this.

---

### 5. **ALLOWED_ORIGINS** (Optional)
**Purpose:** Additional allowed origins (comma-separated)  
**Example:**
```
ALLOWED_ORIGINS=https://app1.com,https://app2.com,https://app3.com
```
**Note:** Only needed if you have multiple frontend/tablet app domains.

---

### 6. **LOG_LEVEL** (Optional)
**Purpose:** Logging level  
**Default:** `info`  
**Values:** `debug`, `info`, `warn`, `error`  
**Example:**
```
LOG_LEVEL=info
```

---

## 📋 Complete Environment Variables List

### Minimum Required (2 variables):
```env
NODE_ENV=production
JWT_SECRET=<generate-secure-secret>
```

### Recommended (4 variables):
```env
NODE_ENV=production
JWT_SECRET=<generate-secure-secret>
FRONTEND_URL=https://your-frontend-domain.com
TABLET_APP_URL=https://your-tablet-app-domain.com
```

### Full Configuration (6 variables):
```env
NODE_ENV=production
JWT_SECRET=<generate-secure-secret>
FRONTEND_URL=https://your-frontend-domain.com
TABLET_APP_URL=https://your-tablet-app-domain.com
ALLOWED_ORIGINS=https://app1.com,https://app2.com
LOG_LEVEL=info
```

---

## 🚀 How to Set Environment Variables in Vercel

### Method 1: Via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - https://vercel.com/dashboard
   - Select your project

2. **Go to Settings**
   - Click on your project
   - Click "Settings" tab
   - Click "Environment Variables" in sidebar

3. **Add Variables**
   - Click "Add New"
   - Enter variable name (e.g., `JWT_SECRET`)
   - Enter variable value
   - Select environments: Production, Preview, Development (or just Production)
   - Click "Save"

4. **Repeat for each variable**

### Method 2: Via Vercel CLI

```bash
# Set environment variable
vercel env add JWT_SECRET production

# It will prompt you to enter the value
# Repeat for each variable
```

### Method 3: Via vercel.json (Not Recommended)

You can add to `vercel.json`, but it's less secure:
```json
{
  "env": {
    "NODE_ENV": "production"
  }
}
```
**⚠️ Don't add secrets here!** Use Vercel Dashboard for secrets.

---

## 🔑 Quick Setup Script

Generate all values and copy-paste ready:

```bash
#!/bin/bash

echo "🔐 Generate Environment Variables for Vercel"
echo "=============================================="
echo ""

# Generate JWT Secret
JWT_SECRET=$(openssl rand -base64 32)

echo "Copy these to Vercel Environment Variables:"
echo ""
echo "NODE_ENV=production"
echo "JWT_SECRET=$JWT_SECRET"
echo ""
echo "FRONTEND_URL=https://your-frontend-domain.com"
echo "TABLET_APP_URL=https://your-tablet-app-domain.com"
echo ""
echo "⚠️  Save JWT_SECRET securely!"
```

---

## ✅ Verification Checklist

After setting environment variables:

- [ ] ✅ `NODE_ENV` set to `production`
- [ ] ✅ `JWT_SECRET` generated and set (32+ characters)
- [ ] ✅ `FRONTEND_URL` set (if you have frontend)
- [ ] ✅ `TABLET_APP_URL` set (if different from frontend)
- [ ] ✅ Variables set for Production environment
- [ ] ✅ Redeploy after adding variables

---

## 🔄 After Adding Variables

**Important:** After adding/changing environment variables:

1. **Redeploy** your project:
   - Vercel Dashboard → Deployments → Click "Redeploy"
   - Or push a new commit to trigger auto-deploy

2. **Verify** variables are loaded:
   - Check Vercel logs
   - Test API endpoint: `curl https://your-app.vercel.app/api/health`

---

## 🐛 Troubleshooting

### Variables Not Working?
- ✅ Check variable names are exact (case-sensitive)
- ✅ Ensure variables are set for correct environment (Production)
- ✅ Redeploy after adding variables
- ✅ Check Vercel logs for errors

### CORS Errors?
- ✅ Verify `FRONTEND_URL` and `TABLET_APP_URL` are set correctly
- ✅ Include your Vercel domain in allowed origins if needed
- ✅ Check variable values don't have trailing spaces

### 401 Unauthorized?
- ✅ Verify `JWT_SECRET` is set
- ✅ Check `JWT_SECRET` is at least 32 characters
- ✅ Ensure `NODE_ENV=production` is set

---

## 📝 Example: Complete Setup

### Step 1: Generate JWT Secret
```bash
openssl rand -base64 32
# Output: abc123xyz789def456ghi012jkl345mno678pqr901stu234vwx567yz
```

### Step 2: Set in Vercel Dashboard

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `NODE_ENV` | `production` | Production |
| `JWT_SECRET` | `abc123xyz789...` | Production |
| `FRONTEND_URL` | `https://your-frontend.vercel.app` | Production |
| `TABLET_APP_URL` | `https://your-tablet-app.com` | Production |

### Step 3: Redeploy
- Vercel Dashboard → Deployments → Redeploy

### Step 4: Verify
```bash
curl https://your-app.vercel.app/api/health
```

---

## 🔒 Security Best Practices

1. **Never commit secrets** to Git
2. **Use Vercel Dashboard** for sensitive variables
3. **Generate strong secrets** (32+ characters)
4. **Rotate secrets** periodically
5. **Use different secrets** for different environments
6. **Don't share secrets** in documentation or logs

---

**That's all you need! 🎉**

