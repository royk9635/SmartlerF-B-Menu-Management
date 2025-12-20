-- VERIFY PROPERTIES TABLE STRUCTURE
-- Run this in Supabase SQL Editor to check table structure

-- Step 1: Check if table exists and get structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'properties'
ORDER BY ordinal_position;

-- Step 2: Check RLS policies
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

-- Step 3: Check if RLS is enabled
SELECT 
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'properties';

-- Step 4: Test update (replace with actual property ID)
-- SELECT * FROM properties LIMIT 1; -- Get an ID first
-- UPDATE properties SET name = 'Test Update' WHERE id = 'your-property-id-here';
-- SELECT * FROM properties WHERE id = 'your-property-id-here';

-- Step 5: Check current data (order by id - works even if created_at doesn't exist)
SELECT * FROM properties ORDER BY id DESC LIMIT 10;
