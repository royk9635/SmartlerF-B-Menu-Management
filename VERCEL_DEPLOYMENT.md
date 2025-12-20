# ▲ Vercel Deployment Guide

Complete guide to deploy the F&B Menu Management API to Vercel.

---

## 📋 Prerequisites

1. Vercel account (sign up at https://vercel.com)
2. Vercel CLI installed (optional, can use web interface)
3. GitHub repository ready

---

## 🚀 Step-by-Step Deployment

### Step 1: Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Configure Project

```bash
cd /path/to/your/project
vercel
```

Follow the prompts:
- **Set up and deploy?** Yes
- **Which scope?** Your account
- **Link to existing project?** No (first time)
- **Project name?** smartler-f-b-menu-management (or your choice)
- **Directory?** `./` (root)
- **Override settings?** No

### Step 4: Set Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables:

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

### Step 5: Deploy

#### Option A: Via Vercel Dashboard

1. **Go to Vercel Dashboard:** https://vercel.com/dashboard
2. **Click "Add New Project"**
3. **Import Git Repository** → Select your GitHub repo
4. **Configure Project:**
   - Framework Preset: Other
   - Root Directory: `./` (root)
   - Build Command: (leave empty or `cd backend && npm install`)
   - Output Directory: (leave empty)
   - Install Command: `cd backend && npm install`
5. **Add Environment Variables** (see Step 4)
6. **Click "Deploy"**

#### Option B: Via CLI

```bash
vercel --prod
```

### Step 6: Get Your Vercel URL

After deployment:
1. Go to Vercel Dashboard → Your Project
2. Copy the deployment URL: `https://your-project.vercel.app`
3. Your API URL: `https://your-project.vercel.app/api`

### Step 7: Update CORS Origins

Update Vercel environment variables with your Vercel URL:

```env
FRONTEND_URL=https://your-frontend-domain.com
TABLET_APP_URL=https://your-tablet-app-domain.com
ALLOWED_ORIGINS=https://your-project.vercel.app,https://your-frontend.com
```

### Step 8: Verify Deployment

```bash
# Health check
curl https://your-project.vercel.app/api/health

# Should return:
# {"success":true,"message":"Backend is running",...}
```

---

## 🔧 Vercel Configuration

### `vercel.json` File

The project includes `vercel.json` which configures:
- Build settings for Node.js
- Routing for `/api/*` endpoints
- Serverless function configuration

### Project Structure

```
project-root/
├── vercel.json          # Vercel configuration
├── backend/
│   ├── server.js        # Express server
│   ├── api/
│   │   └── index.js     # Vercel entry point
│   └── package.json
└── ...
```

---

## 🔐 Environment Variables for Vercel

### Required Variables:

```env
NODE_ENV=production
JWT_SECRET=<generate-secure-secret>
```

### Optional Variables:

```env
FRONTEND_URL=https://your-frontend.com
TABLET_APP_URL=https://your-tablet-app.com
ALLOWED_ORIGINS=https://app1.com,https://app2.com
LOG_LEVEL=info
```

**Note:** Vercel automatically sets `PORT`, so you don't need to set it.

---

## 📱 Getting Your API URL for Tablet App

After deployment, your API URL will be:

```
https://your-project.vercel.app/api
```

**Use this URL in your tablet app configuration!**

---

## 🔑 Generating API Token for Tablet App

### Method 1: Via Portal (Recommended)

1. Deploy frontend to Vercel or your hosting
2. Login to portal
3. Go to "API Tokens" page
4. Generate new token
5. Copy the token

### Method 2: Via API

```bash
# 1. Login to get JWT token
JWT_TOKEN=$(curl -s -X POST https://your-project.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}' \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['token'])")

# 2. Generate API token
curl -X POST https://your-project.vercel.app/api/tokens/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "name": "Tablet App - Production",
    "expiresInDays": 365
  }' | python3 -m json.tool
```

---

## ✅ Post-Deployment Checklist

- [ ] ✅ Vercel deployment successful
- [ ] ✅ Environment variables set
- [ ] ✅ API health check passes
- [ ] ✅ CORS configured correctly
- [ ] ✅ API token generated
- [ ] ✅ Tablet app configured with API URL and token
- [ ] ✅ Test API endpoints from tablet app

---

## 🐛 Troubleshooting

### API Not Responding
- Check Vercel logs: Vercel Dashboard → Project → Deployments → Click deployment → Logs
- Verify environment variables are set
- Check `vercel.json` configuration

### CORS Errors
- Verify `FRONTEND_URL` and `TABLET_APP_URL` are set
- Check Vercel domain is in allowed origins
- Mobile apps may need `ALLOWED_ORIGINS` with `*` or empty origin handling

### 401 Unauthorized
- Verify `JWT_SECRET` is set
- Check API token is valid
- Test token with `/api/tokens/verify`

### Function Timeout
- Vercel free tier: 10 seconds timeout
- Vercel Pro: 60 seconds timeout
- Consider optimizing slow endpoints

---

## 📊 Vercel Features

- **Automatic HTTPS** - SSL certificates included
- **Global CDN** - Fast response times worldwide
- **Auto-deployments** - Deploys on every git push
- **Preview deployments** - Test before production
- **Environment variables** - Secure configuration
- **Logs** - Real-time application logs

---

## 🔄 Updating Deployment

### Via GitHub (Auto-deploy):
1. Push changes to repository
2. Vercel auto-deploys

### Via CLI:
```bash
vercel --prod
```

### Manual:
1. Vercel Dashboard → Project → Deployments
2. Click "Redeploy"

---

## 💰 Vercel Pricing

- **Hobby Plan**: Free tier available
- **Pro Plan**: $20/month per user
- Check current pricing at https://vercel.com/pricing

**Free Tier Limits:**
- 100GB bandwidth/month
- Serverless function execution time: 10 seconds (free), 60 seconds (pro)
- Unlimited deployments

---

## 🌐 Custom Domain

1. Vercel Dashboard → Project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `FRONTEND_URL` and `TABLET_APP_URL` in environment variables

---

## 📞 Support

- Vercel Docs: https://vercel.com/docs
- Vercel Discord: https://vercel.com/discord
- Vercel Support: https://vercel.com/support

---

## 🎯 Quick Deploy Command

```bash
# One command deploy (after initial setup)
vercel --prod
```

---

**Your API is now deployed on Vercel! 🎉**

