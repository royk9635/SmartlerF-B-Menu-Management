-- RUN THIS IN SUPABASE SQL EDITOR
-- Go to: https://supabase.com/dashboard → Your Project → SQL Editor

-- Step 1: Temporarily disable RLS for insert (only during this session)
SET session_replication_role = replica;

-- Step 2: Create demo users with bcrypt hashed password "password"
-- CORRECT HASH for password "password" (generated with bcrypt cost 12)
INSERT INTO users (name, email, role, password_hash, active)
VALUES 
  (
    'Super Admin',
    'super@smartler.com',
    'Superadmin',
    '$2b$12$a516V6Y/wlOqRabAkuF9gOLkjWLsPcom0MCQHx76W0uWpIo./KIq.',
    true
  ),
  (
    'John Doe', 
    'john.doe@grandhotel.com',
    'Property Admin',
    '$2b$12$a516V6Y/wlOqRabAkuF9gOLkjWLsPcom0MCQHx76W0uWpIo./KIq.',
    true
  ),
  (
    'Test User',
    'test@example.com',
    'Staff',
    '$2b$12$a516V6Y/wlOqRabAkuF9gOLkjWLsPcom0MCQHx76W0uWpIo./KIq.',
    true
  )
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  active = true;

-- Step 3: Re-enable RLS
SET session_replication_role = DEFAULT;

-- Step 4: Verify users were created
SELECT id, name, email, role, active FROM users ORDER BY created_at DESC;

-- ✅ Password for all users is: "password"

