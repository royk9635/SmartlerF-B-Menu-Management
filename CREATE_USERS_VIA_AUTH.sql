-- CREATE USERS VIA SUPABASE AUTH (EASIEST METHOD)
-- This creates users in auth.users table, trigger will sync to users table

-- Method 1: Use Supabase Dashboard (RECOMMENDED)
-- Go to: Authentication → Users → Add user
-- Fill: Email, Password, Auto Confirm ✅
-- Add metadata: { "name": "Super Admin", "role": "Superadmin" }

-- Method 2: Use Supabase Management API (if you have service_role key)
-- This requires service_role key which bypasses RLS

-- Method 3: Use the /api/auth/register endpoint
-- Just call the register API - it uses Supabase Auth automatically!

-- ✅ EASIEST: Use Supabase Dashboard to create users
-- Then they can login immediately!
