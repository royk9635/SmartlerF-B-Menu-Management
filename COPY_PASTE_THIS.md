# ⚡ COPY & PASTE THIS INTO SUPABASE

## 🎯 Quick Fix - Run These 2 SQL Queries

### **Step 1: Fix Users Table (Run First)**

Copy and paste this into Supabase SQL Editor and click **Run**:

```sql
-- Add missing columns
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;
```

✅ Wait for "Success"

---

### **Step 2: Create Demo Users (Run Second)**

Now copy and paste this into Supabase SQL Editor and click **Run**:

```sql
-- Insert demo users (password for all: "password")
INSERT INTO users (name, email, role, password_hash)
VALUES 
  (
    'Super Admin',
    'super@smartler.com',
    'Superadmin',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5ufWy3H3jzzCW'
  ),
  (
    'John Doe',
    'john.doe@grandhotel.com',
    'Property Admin',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5ufWy3H3jzzCW'
  ),
  (
    'Test User',
    'test@example.com',
    'Staff',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5ufWy3H3jzzCW'
  )
ON CONFLICT (email) DO NOTHING;

-- Verify users were created
SELECT id, name, email, role FROM users;
```

✅ Should see 3 users!

---

## 🎉 DONE!

Now you can login at: https://smartler-f-b-menu-management-6yjiv74io.vercel.app

**Login with:**
- Email: `super@smartler.com`
- Password: `password`

---

## 🔄 Where to Run This?

1. Go to: https://supabase.com/dashboard
2. Click your project
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**
5. Paste Step 1 → Run
6. Paste Step 2 → Run
7. ✅ Done!
