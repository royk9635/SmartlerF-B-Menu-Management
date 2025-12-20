-- FIX PROPERTIES TABLE FOR UPDATES
-- Run this in Supabase SQL Editor to ensure table supports updates

-- Step 1: Add updated_at column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'properties' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE properties ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Step 2: Add created_at column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'properties' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE properties ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Step 3: Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_properties_updated_at ON properties;
CREATE TRIGGER update_properties_updated_at
    BEFORE UPDATE ON properties
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 4: Ensure RLS policies allow updates
DROP POLICY IF EXISTS "Allow public update on properties" ON properties;
CREATE POLICY "Allow public update on properties" ON properties
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Step 5: Verify update works
-- Test with: UPDATE properties SET name = name WHERE id IN (SELECT id FROM properties LIMIT 1);

-- ✅ DONE! Properties table now supports updates
