# 🚂 Railway Deployment Guide

Complete guide to deploy the F&B Menu Management API to Railway.

---

## 📋 Prerequisites

1. Railway account (sign up at https://railway.app)
2. Railway CLI installed (optional, can use web interface)
3. Git repository ready

---

## 🚀 Step-by-Step Deployment

### Step 1: Prepare Your Repository

Ensure your `backend` folder has:
- ✅ `package.json` with start script
- ✅ `server.js` (main server file)
- ✅ `.env.example` (for reference)

### Step 2: Create Railway Project

#### Option A: Using Railway Web Interface

1. **Go to Railway Dashboard** → https://railway.app/dashboard
2. **Click "New Project"**
3. **Select "Deploy from GitHub repo"** (or "Empty Project" if deploying manually)
4. **Select your repository**

#### Option B: Using Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Link to existing project (if you have one)
railway link
```

### Step 3: Configure Environment Variables

In Railway dashboard, go to your project → **Variables** tab and add:

```env
NODE_ENV=production
PORT=3001
JWT_SECRET=your-very-secure-random-secret-key-minimum-32-characters-long
FRONTEND_URL=https://your-frontend-domain.com
TABLET_APP_URL=https://your-tablet-app-domain.com
```

**⚠️ IMPORTANT:** Generate a secure JWT_SECRET:
```bash
openssl rand -base64 32
```

### Step 4: Configure Build Settings

In Railway project settings:

**Root Directory:** `backend`

**Start Command:** `node server.js`

**Build Command:** (leave empty or `npm install --production`)

### Step 5: Deploy

#### If using GitHub integration:
- Push to your repository
- Railway will auto-deploy

#### If using CLI:
```bash
railway up
```

### Step 6: Get Your Railway URL

After deployment:
1. Go to your service in Railway
2. Click on the service
3. Go to **Settings** → **Networking**
4. **Generate Domain** or use the provided domain
5. Copy the URL (e.g., `https://your-app.up.railway.app`)

### Step 7: Update CORS Origins

Update Railway environment variables with your Railway URL:

```env
FRONTEND_URL=https://your-frontend-domain.com
TABLET_APP_URL=https://your-tablet-app-domain.com
ALLOWED_ORIGINS=https://your-app.up.railway.app,https://your-frontend.com
```

### Step 8: Verify Deployment

```bash
# Health check
curl https://your-app.up.railway.app/api/health

# Should return:
# {"success":true,"message":"Backend is running",...}
```

---

## 🔧 Railway-Specific Configuration

### Create `railway.json` (Optional)

Create `backend/railway.json`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install --production"
  },
  "deploy": {
    "startCommand": "node server.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Update `package.json` Start Script

Ensure `backend/package.json` has:

```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

---

## 🔐 Environment Variables for Railway

### Required Variables:

```env
NODE_ENV=production
PORT=3001
JWT_SECRET=<generate-secure-secret>
```

### Optional Variables:

```env
FRONTEND_URL=https://your-frontend.com
TABLET_APP_URL=https://your-tablet-app.com
ALLOWED_ORIGINS=https://app1.com,https://app2.com
LOG_LEVEL=info
```

---

## 📱 Getting Your API URL for Tablet App

After deployment, your API URL will be:

```
https://your-app.up.railway.app/api
```

**Use this URL in your tablet app configuration!**

---

## 🔑 Generating API Token for Tablet App

### Method 1: Via Portal (Recommended)

1. Deploy frontend to Railway or your hosting
2. Login to portal
3. Go to "API Tokens" page
4. Generate new token
5. Copy the token

### Method 2: Via API

```bash
# 1. Login to get JWT token
JWT_TOKEN=$(curl -s -X POST https://your-app.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}' \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['token'])")

# 2. Generate API token
curl -X POST https://your-app.up.railway.app/api/tokens/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "name": "Tablet App - Production",
    "expiresInDays": 365
  }' | python3 -m json.tool
```

---

## ✅ Post-Deployment Checklist

- [ ] ✅ Railway deployment successful
- [ ] ✅ Environment variables set
- [ ] ✅ API health check passes
- [ ] ✅ CORS configured correctly
- [ ] ✅ API token generated
- [ ] ✅ Tablet app configured with API URL and token
- [ ] ✅ Test API endpoints from tablet app

---

## 🐛 Troubleshooting

### API Not Responding
- Check Railway logs: Railway Dashboard → Service → Logs
- Verify environment variables are set
- Check PORT is set correctly

### CORS Errors
- Verify `FRONTEND_URL` and `TABLET_APP_URL` are set
- Check Railway domain is in allowed origins
- Mobile apps may need `ALLOWED_ORIGINS` with `*` or empty origin handling

### 401 Unauthorized
- Verify JWT_SECRET is set
- Check API token is valid
- Test token with `/api/tokens/verify`

---

## 📊 Monitoring

Railway provides:
- **Logs** - Real-time application logs
- **Metrics** - CPU, Memory, Network usage
- **Deployments** - Deployment history

Access via Railway Dashboard → Your Service

---

## 🔄 Updating Deployment

### Via GitHub (Auto-deploy):
1. Push changes to repository
2. Railway auto-deploys

### Via CLI:
```bash
railway up
```

### Manual:
1. Railway Dashboard → Service → Deployments
2. Click "Redeploy"

---

## 💰 Railway Pricing

- **Hobby Plan**: Free tier available
- **Pro Plan**: $5/month per developer
- Check current pricing at https://railway.app/pricing

---

## 📞 Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway

---

**Your API is now deployed on Railway! 🎉**

