# ⚡ Vercel Environment Variables - Quick Reference

**Copy-paste ready for Vercel Dashboard**

---

## 🔴 REQUIRED (Must Set)

### 1. NODE_ENV
```
NODE_ENV=production
```

### 2. JWT_SECRET
```
JWT_SECRET=DK/usLXS82zXarPqlDfDZUgyshwq7/Si280Isn7E0CY=
```
*(Generate new one: `openssl rand -base64 32`)*

### 3. SUPABASE_URL
```
SUPABASE_URL=https://pmnaywtzcmlsmqucyuie.supabase.co
```

### 4. SUPABASE_ANON_KEY
```
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtbmF5d3R6Y21sc21xdWN5dWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3Njg4NDIsImV4cCI6MjA3MzM0NDg0Mn0.13gNWEEmeZ4Fq2t3nAwUdijQ0Bm2KZNo_uo2P2zdwcU
```

---

## 🟡 RECOMMENDED (Should Set)

### 3. FRONTEND_URL
```
FRONTEND_URL=https://your-frontend-domain.com
```

### 4. TABLET_APP_URL
```
TABLET_APP_URL=https://your-tablet-app-domain.com
```

---

## 🟢 OPTIONAL (Nice to Have)

### 5. ALLOWED_ORIGINS
```
ALLOWED_ORIGINS=https://app1.com,https://app2.com
```

### 6. LOG_LEVEL
```
LOG_LEVEL=info
```

---

## 📋 Complete Setup (Copy All)

```
NODE_ENV=production
JWT_SECRET=DK/usLXS82zXarPqlDfDZUgyshwq7/Si280Isn7E0CY=
SUPABASE_URL=https://pmnaywtzcmlsmqucyuie.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtbmF5d3R6Y21sc21xdWN5dWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3Njg4NDIsImV4cCI6MjA3MzM0NDg0Mn0.13gNWEEmeZ4Fq2t3nAwUdijQ0Bm2KZNo_uo2P2zdwcU
FRONTEND_URL=https://your-frontend-domain.com
TABLET_APP_URL=https://your-tablet-app-domain.com
```

**⚠️ Replace:**
- `JWT_SECRET` - Generate new: `openssl rand -base64 32`
- `FRONTEND_URL` - Your actual frontend URL
- `TABLET_APP_URL` - Your actual tablet app URL
- `SUPABASE_URL` and `SUPABASE_ANON_KEY` - Already set (don't change unless you have a new Supabase project)

---

## 🚀 How to Add in Vercel

1. Vercel Dashboard → Your Project
2. Settings → Environment Variables
3. Add each variable above
4. Select "Production" environment
5. Save
6. **Redeploy** (important!)

---

**See `VERCEL_ENVIRONMENT_VARIABLES.md` for detailed guide.**

