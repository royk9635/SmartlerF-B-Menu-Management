-- Create custom ENUM types (only if they don't exist)
DO $$ BEGIN
    CREATE TYPE attribute_type AS ENUM ('Text', 'Number', 'Checkbox', 'Dropdown');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE special_type AS ENUM ('None', 'Vegetarian', 'Non-Vegetarian', 'Vegan', 'Chef''s Special');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE image_orientation AS ENUM ('16:9', '3:4', '1:1');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE currency_type AS ENUM ('USD', 'EUR', 'GBP', 'JPY', 'INR');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status_type AS ENUM ('New', 'Preparing', 'Ready', 'Completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Properties Table
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT,
    tenant_id TEXT NOT NULL
);

-- Restaurants Table
CREATE TABLE IF NOT EXISTS restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE
);

-- Menu Categories Table
CREATE TABLE IF NOT EXISTS menu_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    active_flag BOOLEAN NOT NULL DEFAULT TRUE,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE
);

-- Subcategories Table
CREATE TABLE IF NOT EXISTS subcategories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    category_id UUID REFERENCES menu_categories(id) ON DELETE CASCADE
);

-- Allergens Table
CREATE TABLE IF NOT EXISTS allergens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE
);

-- Attributes Table
CREATE TABLE IF NOT EXISTS attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    type attribute_type NOT NULL,
    options TEXT[] -- For 'Dropdown' type
);

-- Modifier Groups Table
CREATE TABLE IF NOT EXISTS modifier_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    min_selection INT NOT NULL DEFAULT 0,
    max_selection INT NOT NULL DEFAULT 1
);

-- Modifier Items Table
CREATE TABLE IF NOT EXISTS modifier_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    modifier_group_id UUID REFERENCES modifier_groups(id) ON DELETE CASCADE
);

-- Menu Items Table
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    currency currency_type NOT NULL DEFAULT 'USD',
    image_url TEXT,
    video_url TEXT,
    category_id UUID REFERENCES menu_categories(id) ON DELETE CASCADE,
    subcategory_id UUID REFERENCES subcategories(id) ON DELETE SET NULL, -- Can be null if directly under category
    availability_flag BOOLEAN NOT NULL DEFAULT TRUE,
    tenant_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    sort_order INT NOT NULL DEFAULT 0,
    display_name TEXT,
    item_code TEXT,
    prep_time INT, -- in minutes
    sold_out BOOLEAN NOT NULL DEFAULT FALSE,
    portion TEXT,
    special_type special_type DEFAULT 'None',
    calories INT,
    max_order_qty INT DEFAULT 10,
    bogo BOOLEAN NOT NULL DEFAULT FALSE,
    complimentary TEXT,
    image_orientation image_orientation DEFAULT '1:1',
    available_time TEXT, -- e.g., "09:00-14:00,18:00-22:00"
    available_date TEXT, -- e.g., "2024/01/01-2024/01/31"
    attributes JSONB -- Stores custom attribute values
);

-- Junction table for Menu Items and Allergens (Many-to-Many)
CREATE TABLE IF NOT EXISTS menu_item_allergens (
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    allergen_id UUID REFERENCES allergens(id) ON DELETE CASCADE,
    PRIMARY KEY (menu_item_id, allergen_id)
);

-- Junction table for Menu Items and Modifier Groups (Many-to-Many)
CREATE TABLE IF NOT EXISTS menu_item_modifier_groups (
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    modifier_group_id UUID REFERENCES modifier_groups(id) ON DELETE CASCADE,
    PRIMARY KEY (menu_item_id, modifier_group_id)
);

-- Users Table (for RBAC, keeping it simple for now)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL, -- 'Superadmin', 'Property Admin'
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    password_hash TEXT NOT NULL -- Store hashed passwords in real app
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_name TEXT,
    action_type TEXT NOT NULL, -- 'Create', 'Update', 'Delete'
    entity_type TEXT NOT NULL, -- 'Property', 'Restaurant', 'Menu Item', etc.
    entity_name TEXT,
    details TEXT
);

-- Sales Table (simplified)
CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    total_amount NUMERIC(10, 2) NOT NULL,
    sale_date TIMESTAMPTZ NOT NULL,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    table_number INT,
    items JSONB NOT NULL -- Store array of {menuItemId, quantity, price}
);

-- Live Orders Table
CREATE TABLE IF NOT EXISTS live_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    items JSONB NOT NULL, -- Store array of {menuItemId, quantity, price}
    total_amount NUMERIC(10, 2) NOT NULL,
    placed_at TIMESTAMPTZ DEFAULT NOW(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    table_number INT,
    status order_status_type NOT NULL DEFAULT 'New'
);

-- API Tokens Table (for tablet apps)
CREATE TABLE IF NOT EXISTS api_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE, -- The actual token string (starts with tb_)
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE SET NULL,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_used_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Set up RLS (Row Level Security) policies
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE allergens ENABLE ROW LEVEL SECURITY;
ALTER TABLE attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE modifier_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE modifier_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item_allergens ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item_modifier_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public read access (for public menu)
DO $$ BEGIN
    CREATE POLICY "Public read access for restaurants" ON restaurants FOR SELECT USING (TRUE);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Public read access for menu_categories" ON menu_categories FOR SELECT USING (TRUE);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Public read access for subcategories" ON subcategories FOR SELECT USING (TRUE);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Public read access for allergens" ON allergens FOR SELECT USING (TRUE);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Public read access for attributes" ON attributes FOR SELECT USING (TRUE);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Public read access for modifier_groups" ON modifier_groups FOR SELECT USING (TRUE);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Public read access for modifier_items" ON modifier_items FOR SELECT USING (TRUE);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Public read access for menu_items" ON menu_items FOR SELECT USING (TRUE);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Public read access for menu_item_allergens" ON menu_item_allergens FOR SELECT USING (TRUE);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Public read access for menu_item_modifier_groups" ON menu_item_modifier_groups FOR SELECT USING (TRUE);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- RLS Policies for authenticated users (for admin panel operations)
-- IMPORTANT: These policies grant broad access to authenticated users.
-- In a production environment, you would implement more granular RLS based on user roles (e.g., property_id for 'Property Admin').
-- For this example, we assume a single authenticated user or the 'service_role' key for admin operations.
DO $$ BEGIN
    CREATE POLICY "Enable all access for authenticated users on properties" ON properties FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Enable all access for authenticated users on restaurants" ON restaurants FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Enable all access for authenticated users on menu_categories" ON menu_categories FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Enable all access for authenticated users on subcategories" ON subcategories FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Enable all access for authenticated users on allergens" ON allergens FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Enable all access for authenticated users on attributes" ON attributes FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Enable all access for authenticated users on modifier_groups" ON modifier_groups FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Enable all access for authenticated users on modifier_items" ON modifier_items FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Enable all access for authenticated users on menu_items" ON menu_items FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Enable all access for authenticated users on menu_item_allergens" ON menu_item_allergens FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Enable all access for authenticated users on menu_item_modifier_groups" ON menu_item_modifier_groups FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Enable all access for authenticated users on users" ON users FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Enable all access for authenticated users on audit_logs" ON audit_logs FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Enable all access for authenticated users on sales" ON sales FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Enable all access for authenticated users on live_orders" ON live_orders FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Enable all access for authenticated users on api_tokens" ON api_tokens FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
