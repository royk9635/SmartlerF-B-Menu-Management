# 🚂 Railway Quick Setup (5 Minutes)

Fastest way to deploy your API to Railway.

---

## Step 1: Deploy to Railway

1. **Go to Railway:** https://railway.app
2. **Sign up/Login**
3. **New Project** → **Deploy from GitHub** (or Empty Project)
4. **Select your repository**
5. **Set Root Directory:** `backend`
6. **Railway will auto-detect Node.js**

---

## Step 2: Set Environment Variables

In Railway Dashboard → Your Service → Variables:

```env
NODE_ENV=production
PORT=3001
JWT_SECRET=<generate-with-openssl-rand-base64-32>
FRONTEND_URL=https://your-frontend.com
TABLET_APP_URL=https://your-tablet-app.com
```

**Generate JWT_SECRET:**
```bash
openssl rand -base64 32
```

---

## Step 3: Get Your API URL

1. Railway Dashboard → Your Service
2. **Settings** → **Networking**
3. **Generate Domain** (or use provided)
4. Copy the URL: `https://your-app.up.railway.app`

**Your API URL:** `https://your-app.up.railway.app/api`

---

## Step 4: Generate API Token

### Via Portal (Recommended):
1. Deploy frontend (or use local)
2. Login → API Tokens page
3. Generate token
4. Copy token

### Via API:
```bash
# Login
JWT=$(curl -s -X POST https://your-app.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['token'])")

# Generate API Token
curl -X POST https://your-app.up.railway.app/api/tokens/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT" \
  -d '{"name":"Tablet App","expiresInDays":365}' \
  | python3 -m json.tool
```

---

## Step 5: Share with Tablet App Team

**Provide these 2 things:**

1. **API URL:**
   ```
   https://your-app.up.railway.app/api
   ```

2. **API Token:**
   ```
   tb_your_generated_token_here
   ```

3. **Documentation:** Share `TABLET_APP_INTEGRATION_PACKAGE.md`

---

## ✅ Verify Deployment

```bash
# Health check
curl https://your-app.up.railway.app/api/health

# Should return: {"success":true,"message":"Backend is running"}
```

---

## 🎉 Done!

Your API is live on Railway and ready for tablet app integration!

---

**Next:** Share the API URL and token with your tablet app team.

