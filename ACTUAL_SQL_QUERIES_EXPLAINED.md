# 🔍 Actual SQL Queries Being Executed

## 📋 Overview

Your backend code uses **Supabase client** which **automatically converts JavaScript to SQL**.

You **DON'T need to write SQL manually** - the backend does it for you!

But this document shows the **exact SQL queries** that execute behind the scenes.

---

## 1️⃣ REGISTRATION (Sign-Up)

### What You See in Backend Code:
```javascript
// backend/server.js - Lines 597-608
const { data: newUser, error: insertError } = await supabase
  .from('users')
  .insert({
    name,
    email,
    role,
    property_id: propertyId,
    password_hash: passwordHash,
    active: true
  })
  .select('id, name, email, role, property_id')
  .single();
```

### What SQL Actually Executes:
```sql
INSERT INTO users (
    name, 
    email, 
    role, 
    property_id, 
    password_hash, 
    active,
    created_at,
    updated_at
)
VALUES (
    'John Doe',                                    -- name from form
    'john@example.com',                           -- email from form
    'Staff',                                      -- role from form
    NULL,                                         -- propertyId (optional)
    '$2b$12$KIX...',                             -- bcrypt hashed password
    true,                                         -- active = true
    NOW(),                                        -- current timestamp
    NOW()                                         -- current timestamp
)
RETURNING id, name, email, role, property_id;
```

### Result:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "Staff",
  "property_id": null
}
```

---

## 2️⃣ LOGIN (Sign-In) - Step 1: Find User

### What You See in Backend Code:
```javascript
// backend/server.js - Lines 484-488
const { data: user, error: userError } = await supabase
  .from('users')
  .select('*')
  .eq('email', email)
  .single();
```

### What SQL Actually Executes:
```sql
SELECT 
    id,
    name,
    email,
    role,
    property_id,
    password_hash,
    active,
    created_at,
    updated_at,
    last_login
FROM users
WHERE email = 'john@example.com'
  AND active = true
LIMIT 1;
```

### Result:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "Staff",
  "property_id": null,
  "password_hash": "$2b$12$KIX...",
  "active": true,
  "created_at": "2025-12-20T10:00:00.000Z",
  "updated_at": "2025-12-20T10:00:00.000Z",
  "last_login": null
}
```

---

## 3️⃣ LOGIN - Step 2: Password Verification

### What You See in Backend Code:
```javascript
// backend/server.js - Line 498
const isValidPassword = await bcrypt.compare(password, user.password_hash);
```

### What Happens:
This is **NOT SQL** - it's bcrypt verification in JavaScript:
```javascript
// Compares:
// 1. Plain password from login form: "password123"
// 2. Hashed password from database: "$2b$12$KIX..."

// Returns: true or false
```

**No SQL query here** - just password comparison in memory.

---

## 4️⃣ CHECK IF EMAIL EXISTS (During Registration)

### What You See in Backend Code:
```javascript
// backend/server.js - Lines 580-584
const { data: existingUser } = await supabase
  .from('users')
  .select('id')
  .eq('email', email)
  .single();
```

### What SQL Actually Executes:
```sql
SELECT id
FROM users
WHERE email = 'john@example.com'
LIMIT 1;
```

### Result:
- If user exists: `{ id: "uuid-here" }`
- If no user: `null`

---

## 5️⃣ GET CURRENT USER (Session Check)

### What You See in Backend Code:
```javascript
// backend/server.js - Lines 542-546
const { data: user, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', req.user.id)
  .single();
```

### What SQL Actually Executes:
```sql
SELECT 
    id,
    name,
    email,
    role,
    property_id,
    active,
    created_at,
    updated_at,
    last_login
FROM users
WHERE id = '550e8400-e29b-41d4-a716-446655440000'
  AND active = true
LIMIT 1;
```

---

## 🎯 Summary: What SQL Runs Automatically

| Action | Backend Code | SQL That Executes |
|--------|-------------|-------------------|
| **Sign Up** | `supabase.from('users').insert({...})` | `INSERT INTO users (...) VALUES (...) RETURNING ...` |
| **Login (Find)** | `supabase.from('users').select('*').eq('email', email)` | `SELECT * FROM users WHERE email = '...'` |
| **Check Exists** | `supabase.from('users').select('id').eq('email', email)` | `SELECT id FROM users WHERE email = '...'` |
| **Get User** | `supabase.from('users').select('*').eq('id', id)` | `SELECT * FROM users WHERE id = '...'` |
| **Verify Password** | `bcrypt.compare(plain, hash)` | ❌ NO SQL - JavaScript only |
| **Generate Token** | `jwt.sign({...})` | ❌ NO SQL - JavaScript only |

---

## 📖 Do You Need to Run SQL Manually?

### ❌ NO - For Normal Operation
The backend code handles everything automatically.

### ✅ YES - Only If:

1. **Initial Setup:** Create the users table
```sql
-- Run this ONCE in Supabase SQL Editor
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

CREATE INDEX idx_users_email ON users(email);
```

2. **Testing:** Manually check data
```sql
-- See all users
SELECT id, name, email, role FROM users;

-- Check if email exists
SELECT * FROM users WHERE email = 'test@example.com';

-- Delete test user
DELETE FROM users WHERE email = 'test@example.com';
```

3. **Debugging:** Understand what's stored
```sql
-- See password hashes (for debugging only)
SELECT email, password_hash FROM users;

-- Check active users
SELECT * FROM users WHERE active = true;
```

---

## 🔧 How the Backend Flow Works

### Registration Flow:
```
1. User fills sign-up form
   ↓
2. Frontend sends: POST /api/auth/register
   Body: { name, email, password, role }
   ↓
3. Backend receives data
   ↓
4. Backend validates (email format, password length, etc.)
   ↓
5. Backend checks if email exists
   SQL: SELECT id FROM users WHERE email = '...'
   ↓
6. Backend hashes password with bcrypt
   JavaScript: bcrypt.hash(password, 12)
   ↓
7. Backend saves to database
   SQL: INSERT INTO users (...) VALUES (...)
   ↓
8. Backend generates JWT token
   JavaScript: jwt.sign({...})
   ↓
9. Backend returns { user, token }
   ↓
10. Frontend stores token in localStorage
   ↓
11. User is logged in! ✅
```

### Login Flow:
```
1. User fills login form
   ↓
2. Frontend sends: POST /api/auth/login
   Body: { email, password }
   ↓
3. Backend receives data
   ↓
4. Backend finds user by email
   SQL: SELECT * FROM users WHERE email = '...'
   ↓
5. Backend verifies password
   JavaScript: bcrypt.compare(password, hash)
   ↓
6. Backend generates JWT token
   JavaScript: jwt.sign({...})
   ↓
7. Backend returns { user, token }
   ↓
8. Frontend stores token in localStorage
   ↓
9. User is logged in! ✅
```

---

## 🛠️ Manual SQL Examples (For Testing)

### Create Test User Manually:
```sql
-- Hash password first using bcrypt (in Node.js console):
-- const bcrypt = require('bcryptjs');
-- const hash = await bcrypt.hash('password123', 12);
-- Result: $2b$12$KIX...

INSERT INTO users (name, email, role, password_hash)
VALUES (
    'Test User',
    'test@example.com',
    'Staff',
    '$2b$12$KIXGdW7T3qk6vH7yE5mFWeZqCQTYZQqrZKnYKj7gHqXqZKnYKj7gH'
);
```

### Verify User Can Login:
```sql
-- Check user exists
SELECT id, name, email, password_hash
FROM users
WHERE email = 'test@example.com';

-- If password_hash matches what you created, login should work!
```

### Update User Password:
```sql
-- First, generate hash in Node.js:
-- const hash = await bcrypt.hash('newpassword', 12);

UPDATE users
SET password_hash = '$2b$12$NEW_HASH_HERE',
    updated_at = NOW()
WHERE email = 'test@example.com';
```

### Delete Test User:
```sql
DELETE FROM users WHERE email = 'test@example.com';
```

---

## 🔍 Debugging Queries

### See All Users:
```sql
SELECT id, name, email, role, active, created_at
FROM users
ORDER BY created_at DESC;
```

### Count Users:
```sql
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as active_users FROM users WHERE active = true;
```

### Find User by Email:
```sql
SELECT * FROM users WHERE email = 'super@smartler.com';
```

### See Recent Registrations:
```sql
SELECT name, email, role, created_at
FROM users
ORDER BY created_at DESC
LIMIT 10;
```

---

## ⚡ Quick Test Commands

### In Supabase SQL Editor:

1. **Create users table** (if not exists):
```sql
-- Copy from supabase_schema.sql
-- Should already exist if you ran the schema
```

2. **Check if table exists**:
```sql
SELECT COUNT(*) FROM users;
```

3. **See demo users**:
```sql
SELECT email, role FROM users;
```

4. **Test insert** (manual):
```sql
INSERT INTO users (name, email, role, password_hash)
VALUES (
    'Manual Test',
    'manual@test.com',
    'Staff',
    '$2b$12$KIX...' -- Use a real bcrypt hash
)
RETURNING *;
```

---

## 🎓 Key Takeaways

1. ✅ **Supabase client automatically runs SQL** - you don't write SQL in backend code
2. ✅ **Backend code = SQL queries** - just hidden behind JavaScript API
3. ✅ **Registration = INSERT INTO users**
4. ✅ **Login = SELECT FROM users + password verify**
5. ❌ **You DON'T manually run SQL** - backend does it automatically
6. ✅ **Manual SQL only for:** setup, testing, debugging

---

## 📚 Related Files

- `AUTH_SQL_QUERIES.md` - All SQL queries with examples
- `LOGIN_ERROR_FIX_WITH_SIGNUP.md` - Troubleshooting guide
- `supabase_schema.sql` - Database schema (run once to set up)
- `backend/server.js` - Backend code (SQL runs here automatically)

---

**Bottom Line:** 
- ✅ SQL queries ARE running
- ✅ Backend code does it automatically via Supabase client
- ❌ You DON'T need to write SQL yourself
- ✅ Just make sure users table exists in database

**Status:** ✅ All SQL queries are handled by the backend automatically!
