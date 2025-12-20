-- FIX RLS POLICIES FOR PROPERTIES TABLE
-- Run this in Supabase SQL Editor to allow public access (since auth is removed)

-- Step 1: Drop existing policies
DROP POLICY IF EXISTS "Enable all access for authenticated users on properties" ON properties;
DROP POLICY IF EXISTS "Enable read access for all users on properties" ON properties;
DROP POLICY IF EXISTS "Enable insert access for all users on properties" ON properties;
DROP POLICY IF EXISTS "Enable update access for all users on properties" ON properties;
DROP POLICY IF EXISTS "Enable delete access for all users on properties" ON properties;

-- Step 2: Enable RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Step 3: Create policies for public access (since auth is removed)
-- Allow all operations for everyone (public access)
-- Use DO block to handle "already exists" errors gracefully
DO $$
BEGIN
    -- Drop existing policies first (in case they exist)
    DROP POLICY IF EXISTS "Allow public read on properties" ON properties;
    DROP POLICY IF EXISTS "Allow public insert on properties" ON properties;
    DROP POLICY IF EXISTS "Allow public update on properties" ON properties;
    DROP POLICY IF EXISTS "Allow public delete on properties" ON properties;
    
    -- Create new policies
    CREATE POLICY "Allow public read on properties" ON properties
      FOR SELECT
      USING (true);

    CREATE POLICY "Allow public insert on properties" ON properties
      FOR INSERT
      WITH CHECK (true);

    CREATE POLICY "Allow public update on properties" ON properties
      FOR UPDATE
      USING (true)
      WITH CHECK (true);

    CREATE POLICY "Allow public delete on properties" ON properties
      FOR DELETE
      USING (true);
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Policies already exist, skipping creation';
END $$;

-- Step 4: Verify policies
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
WHERE tablename = 'properties';

-- ✅ DONE! Properties table now allows public access
