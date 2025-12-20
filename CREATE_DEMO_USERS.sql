-- CREATE DEMO USERS FOR VERCEL PORTAL
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard
-- Select your project → SQL Editor → Paste this → Run

-- ⚠️ IMPORTANT: If you get error about "active" column not existing,
-- run FIX_USERS_TABLE.sql FIRST, then come back and run this!

-- Password for ALL users: "password"
-- Password hash generated with bcrypt cost factor 12

-- Insert demo users
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
SELECT 
  id,
  name,
  email,
  role,
  active,
  created_at
FROM users
ORDER BY created_at DESC;

-- ✅ DONE! You can now login with:
--    Email: super@smartler.com
--    Password: password
