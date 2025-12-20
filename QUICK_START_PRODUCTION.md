# 🚀 Quick Start: Production API Setup

Get your API production-ready in 5 minutes!

---

## Step 1: Generate Production Configuration

```bash
cd backend
./setup-production.sh
```

This will:
- Generate a secure JWT secret
- Create `.env` file with production settings
- Provide next steps

---

## Step 2: Update Environment Variables

Edit `backend/.env` and update:

```env
FRONTEND_URL=https://your-actual-frontend-domain.com
TABLET_APP_URL=https://your-actual-tablet-app-domain.com
```

---

## Step 3: Install Dependencies

```bash
cd backend
npm install --production
```

---

## Step 4: Start Server

### Option A: Using PM2 (Recommended)

```bash
npm install -g pm2
pm2 start server.js --name f-b-api
pm2 save
pm2 startup  # Setup PM2 to start on boot
```

### Option B: Using Node Directly

```bash
NODE_ENV=production node server.js
```

---

## Step 5: Generate API Token for Tablet App

1. **Login to get JWT token:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

2. **Generate API token:**
```bash
curl -X POST http://localhost:3001/api/tokens/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt_token_from_step_1>" \
  -d '{
    "name": "Tablet App - Production",
    "expiresInDays": 365
  }'
```

3. **Save the token** - It's only shown once!

---

## Step 6: Configure Tablet App

Use these values in your tablet app:

```
BACKEND_URL=https://your-api-domain.com/api
BACKEND_API_TOKEN=tb_your_generated_token_here
```

---

## ✅ Verification

Test your API:

```bash
# Health check
curl http://localhost:3001/api/health

# Verify token
curl -X GET http://localhost:3001/api/tokens/verify \
  -H "Authorization: Bearer tb_your_token"
```

---

## 📚 Full Documentation

- **Production Guide:** `PRODUCTION_API_GUIDE.md`
- **Tablet App API Reference:** `TABLET_APP_API_REFERENCE.md`
- **API Token Guide:** `API_TOKEN_GUIDE.md`

---

## 🔒 Security Checklist

- [ ] ✅ Strong JWT_SECRET set (32+ characters)
- [ ] ✅ NODE_ENV=production
- [ ] ✅ CORS configured with actual domains
- [ ] ✅ HTTPS enabled (use reverse proxy like nginx)
- [ ] ✅ Environment variables not committed to git
- [ ] ✅ API tokens stored securely

---

**That's it! Your API is production-ready! 🎉**

