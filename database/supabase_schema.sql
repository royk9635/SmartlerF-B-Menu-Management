-- Smartler F&B Menu Management - Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- ============================================
-- 1. PROPERTIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    tenant_id VARCHAR(100) DEFAULT 'tenant-123',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. RESTAURANTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'Staff' CHECK (role IN ('SuperAdmin', 'Admin', 'Manager', 'Staff')),
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. MENU CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS menu_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    active_flag BOOLEAN DEFAULT true,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. SUBCATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS subcategories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    category_id UUID NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 6. ATTRIBUTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('TEXT', 'NUMBER', 'BOOLEAN', 'SELECT', 'MULTI_SELECT')),
    options JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 7. ALLERGENS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS allergens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 8. MODIFIER GROUPS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS modifier_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    min_selection INTEGER DEFAULT 0,
    max_selection INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 9. MODIFIER ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS modifier_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) DEFAULT 0,
    modifier_group_id UUID NOT NULL REFERENCES modifier_groups(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 10. MENU ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'USD',
    image_url TEXT,
    video_url TEXT,
    category_id UUID NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
    subcategory_id UUID REFERENCES subcategories(id) ON DELETE SET NULL,
    availability_flag BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    display_name VARCHAR(255),
    item_code VARCHAR(50),
    prep_time INTEGER,
    sold_out BOOLEAN DEFAULT false,
    portion VARCHAR(100),
    special_type VARCHAR(50) CHECK (special_type IS NULL OR special_type IN ('NONE', 'CHEFS_SPECIAL', 'NEW', 'POPULAR', 'SEASONAL')),
    calories INTEGER,
    max_order_qty INTEGER,
    bogo BOOLEAN DEFAULT false,
    complimentary BOOLEAN DEFAULT false,
    image_orientation VARCHAR(20) DEFAULT 'SQUARE' CHECK (image_orientation IN ('SQUARE', 'PORTRAIT', 'LANDSCAPE')),
    available_time VARCHAR(100),
    available_date VARCHAR(100),
    attributes JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 11. MENU ITEM ALLERGENS (Junction Table)
-- ============================================
CREATE TABLE IF NOT EXISTS menu_item_allergens (
    menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    allergen_id UUID NOT NULL REFERENCES allergens(id) ON DELETE CASCADE,
    PRIMARY KEY (menu_item_id, allergen_id)
);

-- ============================================
-- 12. MENU ITEM MODIFIER GROUPS (Junction Table)
-- ============================================
CREATE TABLE IF NOT EXISTS menu_item_modifier_groups (
    menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    modifier_group_id UUID NOT NULL REFERENCES modifier_groups(id) ON DELETE CASCADE,
    PRIMARY KEY (menu_item_id, modifier_group_id)
);

-- ============================================
-- 13. API TOKENS TABLE (for tablet/mobile apps)
-- ============================================
CREATE TABLE IF NOT EXISTS api_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    token_preview VARCHAR(50),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP WITH TIME ZONE,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_restaurants_property ON restaurants(property_id);
CREATE INDEX IF NOT EXISTS idx_menu_categories_restaurant ON menu_categories(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_subcategories_category ON subcategories(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_subcategory ON menu_items(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_modifier_groups_restaurant ON modifier_groups(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_modifier_items_group ON modifier_items(modifier_group_id);
CREATE INDEX IF NOT EXISTS idx_api_tokens_restaurant ON api_tokens(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_users_property ON users(property_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) - Optional but recommended
-- ============================================
-- Enable RLS on all tables
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE allergens ENABLE ROW LEVEL SECURITY;
ALTER TABLE modifier_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE modifier_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item_allergens ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item_modifier_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies to allow authenticated users to access data
-- (Adjust these based on your security requirements)
CREATE POLICY "Allow authenticated read access" ON properties FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated all access" ON properties FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated read access" ON restaurants FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated all access" ON restaurants FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated read access" ON users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated all access" ON users FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated read access" ON menu_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated all access" ON menu_categories FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated read access" ON subcategories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated all access" ON subcategories FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated read access" ON menu_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated all access" ON menu_items FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated read access" ON attributes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated all access" ON attributes FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated read access" ON allergens FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated all access" ON allergens FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated read access" ON modifier_groups FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated all access" ON modifier_groups FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated read access" ON modifier_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated all access" ON modifier_items FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated read access" ON menu_item_allergens FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated all access" ON menu_item_allergens FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated read access" ON menu_item_modifier_groups FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated all access" ON menu_item_modifier_groups FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated read access" ON api_tokens FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated all access" ON api_tokens FOR ALL TO authenticated USING (true);

-- Allow public access to menu items for digital menu (customers don't need to login)
CREATE POLICY "Allow public read access for digital menu" ON menu_items FOR SELECT TO anon USING (availability_flag = true);
CREATE POLICY "Allow public read access for categories" ON menu_categories FOR SELECT TO anon USING (active_flag = true);
CREATE POLICY "Allow public read access for subcategories" ON subcategories FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public read access for restaurants" ON restaurants FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public read access for allergens" ON allergens FOR SELECT TO anon USING (true);

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================
-- Uncomment and run if you want sample data

-- INSERT INTO properties (name, address) VALUES 
--     ('Grand Hotel', '123 Main Street, City'),
--     ('Beach Resort', '456 Ocean Drive, Beach');

-- INSERT INTO allergens (name) VALUES 
--     ('Gluten'), ('Dairy'), ('Nuts'), ('Shellfish'), ('Eggs'), ('Soy'), ('Fish'), ('Peanuts');
