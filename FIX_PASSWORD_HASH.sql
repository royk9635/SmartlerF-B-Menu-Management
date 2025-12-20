-- FIX PASSWORD HASHES FOR EXISTING USERS
-- Run this in Supabase SQL Editor to update password hashes

-- CORRECT bcrypt hash for password "password" (cost factor 12)
UPDATE users
SET password_hash = '$2b$12$a516V6Y/wlOqRabAkuF9gOLkjWLsPcom0MCQHx76W0uWpIo./KIq.'
WHERE email IN ('super@smartler.com', 'john.doe@grandhotel.com', 'test@example.com');

-- Verify update
SELECT email, name, role, 
       CASE 
         WHEN password_hash = '$2b$12$a516V6Y/wlOqRabAkuF9gOLkjWLsPcom0MCQHx76W0uWpIo./KIq.' 
         THEN '✅ Correct hash' 
         ELSE '❌ Wrong hash' 
       END as hash_status
FROM users
WHERE email IN ('super@smartler.com', 'john.doe@grandhotel.com', 'test@example.com');

-- ✅ DONE! Now login with password "password" should work
