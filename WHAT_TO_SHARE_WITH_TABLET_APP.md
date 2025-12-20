# 📦 What to Share with Tablet App Team

**Complete package of information for tablet app integration**

---

## ✅ Required Information (Share These)

### 1. API Base URL
```
https://your-app.up.railway.app/api
```
*(Replace with your actual Railway URL after deployment)*

### 2. API Token
```
tb_your_generated_api_token_here
```
*(Generate this after deployment - see instructions below)*

---

## 📄 Documentation Files to Share

Share these files with the tablet app team:

1. **`TABLET_APP_INTEGRATION_PACKAGE.md`** ⭐ **MAIN DOCUMENT**
   - Complete API reference
   - Code examples (JavaScript, Swift, Kotlin)
   - Error handling
   - Security best practices

2. **`API_ENDPOINTS_FOR_TABLET_APP.md`**
   - Quick reference of all endpoints
   - Request/response examples

3. **`TABLET_APP_API_REFERENCE.md`** (Optional - Detailed)
   - Full detailed API reference
   - All endpoints with examples

---

## 🔑 How to Generate API Token

### After Railway Deployment:

1. **Get your Railway API URL:**
   - Railway Dashboard → Service → Settings → Networking
   - Copy the domain: `https://your-app.up.railway.app`
   - API URL: `https://your-app.up.railway.app/api`

2. **Generate API Token:**

   **Option A: Via Portal (Easiest)**
   - Deploy frontend or use locally
   - Login → Go to "API Tokens" page
   - Click "Generate New Token"
   - Copy the token (starts with `tb_`)

   **Option B: Via API**
   ```bash
   # Step 1: Login
   JWT_TOKEN=$(curl -s -X POST https://your-app.up.railway.app/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"password"}' \
     | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['token'])")
   
   # Step 2: Generate API Token
   curl -X POST https://your-app.up.railway.app/api/tokens/generate \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $JWT_TOKEN" \
     -d '{
       "name": "Tablet App - Production",
       "expiresInDays": 365
     }' | python3 -m json.tool
   ```

3. **Save the token** - It's only shown once!

---

## 📋 Quick Reference Card (Copy This)

```
═══════════════════════════════════════════════════════
  F&B MENU MANAGEMENT API - TABLET APP CONFIGURATION
═══════════════════════════════════════════════════════

API Base URL:
https://your-app.up.railway.app/api

API Token:
tb_your_generated_token_here

Authentication:
Header: Authorization: Bearer <api_token>

Main Endpoints:
- GET  /api/restaurants
- GET  /api/categories?restaurantId=:id
- GET  /api/menu-items?categoryId=:id
- GET  /api/public/menu/:restaurantId (no auth)
- GET  /api/orders
- POST /api/orders
- PATCH /api/orders/:id/status

Response Format:
{
  "success": true,
  "data": { ... }
}

Error Format:
{
  "success": false,
  "message": "Error message"
}

═══════════════════════════════════════════════════════
```

---

## 🎯 What Tablet App Team Needs

### Minimum Required:
1. ✅ API Base URL
2. ✅ API Token
3. ✅ `TABLET_APP_INTEGRATION_PACKAGE.md` document

### Recommended:
4. ✅ `API_ENDPOINTS_FOR_TABLET_APP.md` (quick reference)
5. ✅ Test credentials (for development):
   ```
   Email: admin@example.com
   Password: password
   ```

---

## 📧 Email Template (Copy & Send)

```
Subject: F&B Menu Management API - Integration Information

Hi Tablet App Team,

Here's everything you need to integrate with our API:

🔗 API Base URL:
https://your-app.up.railway.app/api

🔑 API Token:
tb_your_generated_token_here

📚 Documentation:
Please see the attached files:
- TABLET_APP_INTEGRATION_PACKAGE.md (main document)
- API_ENDPOINTS_FOR_TABLET_APP.md (quick reference)

🧪 Test the API:
curl -X GET https://your-app.up.railway.app/api/tokens/verify \
  -H "Authorization: Bearer tb_your_token"

📋 Quick Start:
1. Configure API URL: https://your-app.up.railway.app/api
2. Configure API Token: tb_your_token
3. Use Authorization header: Bearer <token>
4. See documentation for code examples

Let me know if you need any clarification!

Best regards,
[Your Name]
```

---

## ✅ Checklist Before Sharing

- [ ] ✅ Railway deployment completed
- [ ] ✅ API URL obtained from Railway
- [ ] ✅ API token generated
- [ ] ✅ API tested and working
- [ ] ✅ Documentation files ready
- [ ] ✅ Token saved securely
- [ ] ✅ CORS configured correctly

---

## 🔒 Security Notes

**Important for tablet app team:**
- Store API token securely (Keychain/SecureStorage)
- Never expose token in logs or client code
- Use HTTPS only (Railway provides this)
- Handle 401/403 errors gracefully
- Token can be revoked - implement re-authentication flow

---

## 📞 Support

If tablet app team has questions:
- Check `TABLET_APP_INTEGRATION_PACKAGE.md` first
- All endpoints are documented with examples
- Test endpoints using curl commands provided

---

**Everything is ready to share! 🚀**

