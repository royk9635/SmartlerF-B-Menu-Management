-- Migration: Add Staff Tracking Tables
-- Run this in Supabase SQL Editor

-- Staff Table
CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    pin VARCHAR(4) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('waiter', 'manager', 'server', 'host', 'bartender')),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_pin_per_restaurant UNIQUE (pin, restaurant_id)
);

CREATE INDEX IF NOT EXISTS idx_staff_restaurant ON staff(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_staff_pin ON staff(pin);
CREATE INDEX IF NOT EXISTS idx_staff_active ON staff(is_active) WHERE is_active = TRUE;

-- Staff Assignments Table
CREATE TABLE IF NOT EXISTS staff_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    table_number INTEGER NOT NULL CHECK (table_number > 0 AND table_number <= 100),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    unassigned_at TIMESTAMPTZ NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partial unique index for active assignments (only one active per table)
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_assignment 
ON staff_assignments(table_number, restaurant_id) 
WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_assignments_table ON staff_assignments(restaurant_id, table_number, is_active);
CREATE INDEX IF NOT EXISTS idx_assignments_staff ON staff_assignments(staff_id, is_active);
CREATE INDEX IF NOT EXISTS idx_assignments_active ON staff_assignments(is_active) WHERE is_active = TRUE;

-- Enable RLS
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$ BEGIN
    CREATE POLICY "Enable all access for authenticated users on staff" 
    ON staff FOR ALL 
    USING (auth.role() = 'authenticated') 
    WITH CHECK (auth.role() = 'authenticated');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Enable all access for authenticated users on staff_assignments" 
    ON staff_assignments FOR ALL 
    USING (auth.role() = 'authenticated') 
    WITH CHECK (auth.role() = 'authenticated');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

