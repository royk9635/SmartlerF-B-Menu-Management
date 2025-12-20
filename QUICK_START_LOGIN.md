# ⚡ QUICK START - Enable Login on Vercel Portal

## 🎯 Goal
Make login work on: https://smartler-f-b-menu-management-6yjiv74io.vercel.app

---

## ✅ DO THESE 3 THINGS (6 minutes total):

### **1️⃣ Create Users in Supabase** (2 minutes)

1. Go to: https://supabase.com/dashboard
2. Click your project
3. Click **SQL Editor** (left sidebar)
4. Open the file: `CREATE_DEMO_USERS.sql` (in this folder)
5. Copy ALL the SQL
6. Paste in Supabase SQL Editor
7. Click **Run** button
8. ✅ Should see 3 users created

**OR copy-paste this:**
```sql
INSERT INTO users (name, email, role, password_hash, active)
VALUES 
  ('Super Admin', 'super@smartler.com', 'Superadmin', 
   '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5ufWy3H3jzzCW', true),
  ('John Doe', 'john.doe@grandhotel.com', 'Property Admin',
   '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5ufWy3H3jzzCW', true),
  ('Test User', 'test@example.com', 'Staff',
   '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5ufWy3H3jzzCW', true)
ON CONFLICT (email) DO NOTHING;
```

---

### **2️⃣ Redeploy Vercel** (3 minutes - mostly waiting)

**Option A - Via Vercel Dashboard:**
1. Go to: https://vercel.com/dashboard
2. Find: **smartler-f-b-menu-management**
3. Click **Deployments** tab
4. Click **Redeploy** on the latest deployment
5. Wait 2-3 minutes
6. ✅ Should see "Deployment Ready"

**Option B - Already Done:**
I just pushed to GitHub which will trigger auto-deployment.
Just wait 2-3 minutes and it will deploy automatically.

---

### **3️⃣ Test Login** (30 seconds)

1. Go to: https://smartler-f-b-menu-management-6yjiv74io.vercel.app
2. **Hard refresh:** Press `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
3. Login with:
   - Email: `super@smartler.com`
   - Password: `password`
4. ✅ Should work!

---

## 🎉 DONE!

**You can now:**
- ✅ Login with demo accounts
- ✅ Click "Create Account" to sign up new users
- ✅ Others can self-register

**Demo Accounts Created:**
1. `super@smartler.com` / `password` - Superadmin
2. `john.doe@grandhotel.com` / `password` - Property Admin
3. `test@example.com` / `password` - Staff

---

## 🆘 If It Doesn't Work

### **Login fails with "Invalid credentials":**
- Wait 30 seconds after running SQL
- Hard refresh browser (Ctrl+Shift+R)
- Check Supabase: Run `SELECT * FROM users;` to verify users exist

### **Sign-up not working:**
- Wait for Vercel deployment to complete (check dashboard)
- Hard refresh browser
- Check: https://smartler-f-b-menu-management-6yjiv74io.vercel.app/api/health
  Should show: `{"success":true,...}`

### **Still stuck:**
See detailed guide in: `VERCEL_LOGIN_FIX.md`

---

**Time to complete:** 6 minutes  
**Status:** ✅ Ready to use!
