# 🔧 Fix Login on Vercel Portal

## 🎯 **Your Situation**

- ✅ Portal hosted on Vercel: https://smartler-f-b-menu-management-6yjiv74io.vercel.app
- ✅ API working (health check passes)
- ❌ Can't login (no users in database)
- ❌ Can't sign-up (endpoint not deployed yet)

---

## ✅ **COMPLETE FIX - 3 Steps**

### **Step 1: Create Demo Users in Supabase**

You need to manually create users in Supabase since the sign-up feature isn't deployed yet.

1. Go to: https://supabase.com/dashboard
2. Select your project: **pmnaywtzcmlsmqucyuie**
3. Click **SQL Editor** (left sidebar)
4. Paste and run this SQL:

```sql
-- Create demo users with bcrypt hashed passwords
-- Password for all: "password"

INSERT INTO users (name, email, role, password_hash, active)
VALUES 
  (
    'Super Admin',
    'super@smartler.com',
    'Superadmin',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5ufWy3H3jzzCW',
    true
  ),
  (
    'John Doe',
    'john.doe@grandhotel.com',
    'Property Admin',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5ufWy3H3jzzCW',
    true
  ),
  (
    'Test User',
    'test@example.com',
    'Staff',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5ufWy3H3jzzCW',
    true
  )
ON CONFLICT (email) DO NOTHING;

-- Verify users were created
SELECT id, name, email, role FROM users;
```

**Note:** Password hash is for `"password"` - all demo users have same password.

---

### **Step 2: Deploy Sign-Up Feature to Vercel**

The sign-up code is already committed to GitHub, but Vercel needs to redeploy.

#### **Option A: Auto Deploy (Easiest)**

1. Go to: https://vercel.com/dashboard
2. Find your project: **smartler-f-b-menu-management**
3. Click **Deployments** tab
4. Click **Redeploy** on latest deployment
5. ✅ Wait 2-3 minutes for deployment

#### **Option B: Force Deploy with Git**

```bash
cd "/Users/kaushik/Desktop/F&Bportal 181225/smartler-f-b-menu-management"

# Make sure you're up to date
git pull origin main

# Push to trigger deployment (already done, but just in case)
git push origin main
```

Vercel will automatically deploy when you push to main.

---

### **Step 3: Test Login**

After Steps 1 & 2 are complete:

1. Open: https://smartler-f-b-menu-management-6yjiv74io.vercel.app
2. **Clear browser cache:**
   - Press `Ctrl/Cmd + Shift + R` (hard refresh)
   - Or go to DevTools (F12) → Application → Clear storage → Clear site data
3. Try logging in:
   - Email: `super@smartler.com`
   - Password: `password`
4. ✅ Should work!

---

## 🧪 **Quick Test Commands**

### **Test Login API (After Step 1):**
```bash
curl -X POST https://smartler-f-b-menu-management-6yjiv74io.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"super@smartler.com","password":"password"}'
```

**Expected:** `{"success":true,"data":{"user":{...},"token":"..."}}`

### **Test Sign-Up API (After Step 2):**
```bash
curl -X POST https://smartler-f-b-menu-management-6yjiv74io.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"New User","email":"newuser@test.com","password":"test123","role":"Staff"}'
```

**Expected:** `{"success":true,"data":{"user":{...},"token":"..."}}`

---

## 🔍 **Verify Supabase Setup**

Make sure your Supabase database has the users table:

```sql
-- Check if table exists
SELECT COUNT(*) FROM users;

-- If error "relation users does not exist", create table:
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'Staff',
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ,
    active BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

---

## ✅ **Verify Vercel Environment Variables**

Make sure these are set in Vercel Dashboard → Settings → Environment Variables:

| Variable | Value | Required |
|----------|-------|----------|
| `NODE_ENV` | `production` | ✅ Yes |
| `JWT_SECRET` | (your secret key) | ✅ Yes |
| `SUPABASE_URL` | `https://pmnaywtzcmlsmqucyuie.supabase.co` | ✅ Yes |
| `SUPABASE_ANON_KEY` | (your anon key) | ✅ Yes |

**Get your keys from:**
- Supabase Dashboard → Settings → API → Project URL & anon/public key

---

## 📊 **Deployment Checklist**

After completing all steps:

- [ ] Users table exists in Supabase
- [ ] Demo users created (super@smartler.com, etc.)
- [ ] Vercel environment variables set
- [ ] Latest code deployed to Vercel
- [ ] Browser cache cleared
- [ ] Login works with demo account
- [ ] Sign-up creates new users

---

## 🚨 **If Login Still Fails**

### **Error: "Invalid credentials"**

**Cause:** User doesn't exist in database OR password hash is wrong

**Fix:**
```sql
-- Check if user exists
SELECT email, password_hash FROM users WHERE email = 'super@smartler.com';

-- If no result, run Step 1 again
-- If password_hash is different, update it:
UPDATE users 
SET password_hash = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5ufWy3H3jzzCW'
WHERE email = 'super@smartler.com';
```

### **Error: "Failed to execute 'json'"**

**Cause:** Browser cache issue

**Fix:**
```
1. Press F12 (DevTools)
2. Application tab → Clear storage
3. Click "Clear site data"
4. Hard refresh: Ctrl/Cmd + Shift + R
```

### **Error: "Endpoint not found"**

**Cause:** Old deployment without new sign-up code

**Fix:**
```
1. Vercel Dashboard → Deployments
2. Click "Redeploy" on latest
3. Wait for deployment to complete
```

---

## 🎯 **Why This Happened**

1. **You pushed new sign-up code to GitHub** ✅
2. **But Vercel hasn't deployed it yet** ⏳
3. **AND no users exist in Supabase database** ❌

**Solution:**
- **Step 1** creates users so you can login NOW
- **Step 2** deploys sign-up so others can self-register
- **Step 3** verifies everything works

---

## 🔄 **After Fix - How to Create More Users**

### **Option 1: Use Sign-Up Page (After Step 2)**

1. Click "Don't have an account? Create one"
2. Fill form and submit
3. ✅ Auto-created in database

### **Option 2: Manually in Supabase SQL**

```sql
-- Generate password hash first (use bcrypt with cost 12)
-- For password "mypassword123":
-- $2b$12$... (use online bcrypt tool or Node.js)

INSERT INTO users (name, email, role, password_hash, active)
VALUES (
  'New User Name',
  'user@example.com',
  'Staff',
  '$2b$12$YOUR_BCRYPT_HASH_HERE',
  true
);
```

**Generate hash online:**
- https://bcrypt-generator.com/
- Set "Cost Factor" to 12
- Enter password
- Copy hash

---

## 📝 **Summary**

**Current Status:**
- ✅ Code committed to GitHub
- ✅ API working on Vercel
- ❌ Sign-up endpoint not deployed (yet)
- ❌ No users in database

**Do This:**
1. **NOW:** Create users in Supabase (Step 1) → Can login immediately
2. **Then:** Redeploy Vercel (Step 2) → Sign-up works
3. **Test:** Login and sign-up both work ✅

**Time Estimate:**
- Step 1: 2 minutes
- Step 2: 3 minutes (waiting for deployment)
- Step 3: 30 seconds
- **Total: ~6 minutes**

---

**Status:** ✅ Complete fix provided - follow 3 steps above!
