# 🔐 How to Set JWT_SECRET in Vercel

**Step-by-step guide to generate and set JWT_SECRET**

---

## ✅ Yes, You Can Generate It Locally!

You can generate the `JWT_SECRET` in your Cursor terminal, then copy it to Vercel.

---

## 📋 Step-by-Step Process

### Step 1: Generate JWT_SECRET Locally

In your Cursor terminal, run:

```bash
openssl rand -base64 32
```

**Example output:**
```
DK/usLXS82zXarPqlDfDZUgyshwq7/Si280Isn7E0CY=
```

### Step 2: Copy the Generated Secret

Copy the entire output (the long random string).

### Step 3: Add to Vercel Environment Variables

1. **Go to Vercel Dashboard**
   - https://vercel.com/dashboard
   - Click on your project: `smartler-f-b-menu-management`

2. **Go to Settings**
   - Click "Settings" tab
   - Click "Environment Variables" in the left sidebar

3. **Add JWT_SECRET**
   - Click "Add New" button
   - **Key:** `JWT_SECRET`
   - **Value:** Paste your generated secret (e.g., `DK/usLXS82zXarPqlDfDZUgyshwq7/Si280Isn7E0CY=`)
   - **Environment:** Select "Production" (and optionally Preview/Development)
   - Click "Save"

4. **Add NODE_ENV** (if not already added)
   - Click "Add New" again
   - **Key:** `NODE_ENV`
   - **Value:** `production`
   - **Environment:** Select "Production"
   - Click "Save"

5. **Add Other Variables** (optional but recommended)
   - `FRONTEND_URL` = `https://your-frontend-domain.com`
   - `TABLET_APP_URL` = `https://your-tablet-app-domain.com`

### Step 4: Redeploy

**Important:** After adding environment variables, you MUST redeploy:

1. Go to "Deployments" tab
2. Click the three dots (⋯) on the latest deployment
3. Click "Redeploy"
4. Or push a new commit to trigger auto-deploy

---

## 🔍 Verify It's Working

After redeploying, check the logs:

1. Vercel Dashboard → Your Project → Deployments
2. Click on the latest deployment
3. Click "Logs" tab
4. Look for: `🚀 Running on Vercel - Serverless mode`
5. Should NOT see: `⚠️ WARNING: JWT_SECRET not set`

Test the API:
```bash
curl https://your-project.vercel.app/api/health
```

Should return:
```json
{"success":true,"message":"Backend is running",...}
```

---

## ⚠️ Important Notes

1. **Generate Once, Use Everywhere**
   - Generate the secret locally
   - Copy it to Vercel
   - Use the SAME secret for all environments (or different ones if you prefer)

2. **Keep It Secret**
   - Never commit to Git
   - Never share in documentation
   - Store securely

3. **Must Redeploy**
   - Environment variables only take effect after redeployment
   - Vercel doesn't auto-reload env vars on existing deployments

4. **Same Secret Works**
   - The secret you generate locally will work perfectly in Vercel production
   - It's just a random string - doesn't matter where it's generated

---

## 🎯 Quick Copy-Paste

```bash
# Generate secret
openssl rand -base64 32

# Copy the output, then:
# 1. Go to Vercel Dashboard → Project → Settings → Environment Variables
# 2. Add: JWT_SECRET = <paste-generated-value>
# 3. Add: NODE_ENV = production
# 4. Redeploy
```

---

## ✅ Checklist

- [ ] Generated JWT_SECRET locally
- [ ] Copied the secret value
- [ ] Added to Vercel Environment Variables
- [ ] Set NODE_ENV=production
- [ ] Redeployed the project
- [ ] Verified in logs (no warnings)
- [ ] Tested API endpoint

---

**That's it! Your JWT_SECRET will work perfectly in production! 🎉**

