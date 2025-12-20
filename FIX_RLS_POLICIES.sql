-- FIX RLS POLICIES FOR USERS TABLE
-- Run this in Supabase SQL Editor to allow backend to read/write users

-- Step 1: Enable RLS (if not already enabled)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop existing policies (if any) to start fresh
DROP POLICY IF EXISTS "Allow backend service role access" ON users;
DROP POLICY IF EXISTS "Allow authenticated reads" ON users;
DROP POLICY IF EXISTS "Allow public reads" ON users;
DROP POLICY IF EXISTS "Allow public inserts" ON users;

-- Step 3: Create policy to allow service_role (backend) full access
-- This allows your backend serverless functions to read/write users
CREATE POLICY "Allow service role full access" ON users
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Step 4: Create policy to allow authenticated users to read their own data
-- This is for future use when users are logged in
CREATE POLICY "Users can read own data" ON users
  FOR SELECT
  USING (auth.uid()::text = id::text);

-- Step 5: Create policy to allow public signup (for registration)
-- This allows anyone to create a new user account
CREATE POLICY "Allow public signup" ON users
  FOR INSERT
  WITH CHECK (true);

-- Step 6: Verify policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'users';

-- ✅ DONE! Backend can now read/write users
