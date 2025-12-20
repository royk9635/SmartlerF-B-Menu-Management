import {
    Property, Restaurant, MenuCategory, MenuItem, Currency, Sale, User, UserRole,
    SpecialType, ImageOrientation, SubCategory, AuditLog, ActionType, EntityType,
    Attribute, AttributeType, Allergen, ModifierGroup, ModifierItem, PublicMenu,
    SystemMenuImportPayload, SystemImportStats, SystemCategoryNode, SystemCondiment,
    LiveOrder, OrderStatus, ApiToken, GenerateTokenRequest
} from '../types';
import { supabase } from '../supabaseClient';

// Helper to generate IDs (fallback for cases where Supabase doesn't auto-generate)
const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// --- Session Management ---
let currentSessionUser: User | null = null;

// --- Authentication (Supabase Auth) ---
export const login = async (email: string, password: string): Promise<User> => {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
    });
    
    if (authError || !authData.user) {
        throw new Error(authError?.message || 'Invalid email or password.');
    }
    
    // Get user details from users table
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();
    
    if (userError || !userData) {
        // Create user in users table if not exists
        const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert({
                id: authData.user.id,
                email: authData.user.email,
                name: authData.user.user_metadata?.name || authData.user.email,
                role: authData.user.user_metadata?.role || 'Staff',
                active: true
            })
            .select()
            .single();
        
        if (createError || !newUser) {
            throw new Error('Failed to create user profile');
        }
        
        currentSessionUser = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role as UserRole,
            propertyId: newUser.property_id
        };
        return currentSessionUser;
    }
    
    currentSessionUser = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role as UserRole,
        propertyId: userData.property_id
    };
    return currentSessionUser;
};

export const register = async (name: string, email: string, password: string, role: string = 'Staff', propertyId?: string | null): Promise<User> => {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { name, role, property_id: propertyId }
        }
    });
    
    if (authError || !authData.user) {
        throw new Error(authError?.message || 'Failed to create account');
    }
    
    // Wait for trigger to create user or create manually
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();
    
    if (userData) {
        currentSessionUser = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role as UserRole,
            propertyId: userData.property_id
        };
        return currentSessionUser;
    }
    
    // Create manually if trigger didn't fire
    const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
            id: authData.user.id,
            email,
            name,
            role,
            property_id: propertyId,
            active: true
        })
        .select()
        .single();
    
    if (createError) {
        console.error('User profile creation error:', createError);
        throw new Error(`Failed to create user profile: ${createError.message}`);
    }
    
    if (!newUser) {
        throw new Error('Failed to create user profile: No data returned');
    }
    
    currentSessionUser = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role as UserRole,
        propertyId: newUser.property_id
    };
    return currentSessionUser;
};

export const logout = async (): Promise<void> => {
    if (supabase) {
        await supabase.auth.signOut();
    }
    currentSessionUser = null;
};

export const getCurrentUser = async (): Promise<User> => {
    if (currentSessionUser) {
        return currentSessionUser;
    }
    
    if (!supabase) throw new Error('No active session.');
    
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) throw new Error('No active session.');
    
    const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();
    
    if (!userData) throw new Error('User not found.');
    
    currentSessionUser = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role as UserRole,
        propertyId: userData.property_id
    };
    return currentSessionUser;
};

// --- Properties (Supabase) ---
export const getProperties = async (tenantId?: string): Promise<Property[]> => {
    if (!supabase) return [];
    
    const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('name', { ascending: true });
    
    if (error) {
        console.error('Error fetching properties:', error);
        throw new Error(error.message);
    }
    
    return (data || []).map(p => ({
        id: p.id,
        name: p.name,
        address: p.address || '',
        tenantId: p.tenant_id || 'tenant-123'
    }));
};

export const addProperty = async (data: Omit<Property, 'id' | 'tenantId'>): Promise<Property> => {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    const { data: newProperty, error } = await supabase
        .from('properties')
        .insert({
            name: data.name,
            address: data.address,
            tenant_id: 'tenant-123'
        })
        .select()
        .single();
    
    if (error) throw new Error(error.message);
    
    return {
        id: newProperty.id,
        name: newProperty.name,
        address: newProperty.address || '',
        tenantId: newProperty.tenant_id
    };
};

export const updateProperty = async (data: Property): Promise<Property> => {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    const { data: updated, error } = await supabase
        .from('properties')
        .update({
            name: data.name,
            address: data.address
        })
        .eq('id', data.id)
        .select()
        .single();
    
    if (error) throw new Error(error.message);
    
    return {
        id: updated.id,
        name: updated.name,
        address: updated.address || '',
        tenantId: updated.tenant_id
    };
};

export const deleteProperty = async (id: string): Promise<void> => {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);
    
    if (error) throw new Error(error.message);
};

// --- Restaurants (Supabase) ---
export const getAllRestaurants = async (): Promise<Restaurant[]> => {
    if (!supabase) return [];
    
    const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .order('name', { ascending: true });
    
    if (error) {
        console.error('Error fetching restaurants:', error);
        throw new Error(error.message);
    }
    
    return (data || []).map(r => ({
        id: r.id,
        name: r.name,
        propertyId: r.property_id
    }));
};

export const addRestaurant = async (data: Omit<Restaurant, 'id'>): Promise<Restaurant> => {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    const { data: newRestaurant, error } = await supabase
        .from('restaurants')
        .insert({
            name: data.name,
            property_id: data.propertyId
        })
        .select()
        .single();
    
    if (error) throw new Error(error.message);
    
    return {
        id: newRestaurant.id,
        name: newRestaurant.name,
        propertyId: newRestaurant.property_id
    };
};

export const updateRestaurant = async (data: Restaurant): Promise<Restaurant> => {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    const { data: updated, error } = await supabase
        .from('restaurants')
        .update({
            name: data.name,
            property_id: data.propertyId
        })
        .eq('id', data.id)
        .select()
        .single();
    
    if (error) throw new Error(error.message);
    
    return {
        id: updated.id,
        name: updated.name,
        propertyId: updated.property_id
    };
};

export const deleteRestaurant = async (id: string): Promise<void> => {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    const { error } = await supabase
        .from('restaurants')
        .delete()
        .eq('id', id);
    
    if (error) throw new Error(error.message);
};

// --- Users (Supabase) ---
export const getUsers = async (): Promise<User[]> => {
    if (!supabase) return [];
    
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('name', { ascending: true });
    
    if (error) {
        console.error('Error fetching users:', error);
        throw new Error(error.message);
    }
    
    return (data || []).map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role as UserRole,
        propertyId: u.property_id
    }));
};

export const addUser = async (data: Omit<User, 'id'>): Promise<User> => {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    // For adding users, we should use Supabase Auth signup
    // This is a simplified version - in production, you'd send an invite email
    const { data: newUser, error } = await supabase
        .from('users')
        .insert({
            id: generateId('user'),
            name: data.name,
            email: data.email,
            role: data.role,
            property_id: data.propertyId,
            active: true
        })
        .select()
        .single();
    
    if (error) throw new Error(error.message);
    
    return {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role as UserRole,
        propertyId: newUser.property_id
    };
};

export const updateUser = async (data: User): Promise<User> => {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    const { data: updated, error } = await supabase
        .from('users')
        .update({
            name: data.name,
            email: data.email,
            role: data.role,
            property_id: data.propertyId
        })
        .eq('id', data.id)
        .select()
        .single();
    
    if (error) throw new Error(error.message);
    
    return {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role as UserRole,
        propertyId: updated.property_id
    };
};

export const deleteUser = async (id: string): Promise<void> => {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);
    
    if (error) throw new Error(error.message);
};

// --- Categories (Supabase) ---
export const getCategories = async (restaurantId: string): Promise<MenuCategory[]> => {
    if (!supabase) return [];
    
    const { data, error } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('sort_order', { ascending: true });
    
    if (error) throw new Error(error.message);
    
    return (data || []).map(c => ({
        id: c.id,
        name: c.name,
        description: c.description || '',
        sortOrder: c.sort_order,
        activeFlag: c.active_flag,
        restaurantId: c.restaurant_id,
    }));
};

export const getAllCategories = async (): Promise<MenuCategory[]> => {
    if (!supabase) return [];
    
    const { data, error } = await supabase
        .from('menu_categories')
        .select('*')
        .order('sort_order', { ascending: true });
    
    if (error) throw new Error(error.message);
    
    return (data || []).map(c => ({
        id: c.id,
        name: c.name,
        description: c.description || '',
        sortOrder: c.sort_order,
        activeFlag: c.active_flag,
        restaurantId: c.restaurant_id,
    }));
};

export const addCategory = async (data: Omit<MenuCategory, 'id'>): Promise<MenuCategory> => {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    const { data: newCategory, error } = await supabase
        .from('menu_categories')
        .insert({
            name: data.name,
            description: data.description,
            sort_order: data.sortOrder,
            active_flag: data.activeFlag,
            restaurant_id: data.restaurantId,
        })
        .select()
        .single();
    
    if (error) throw new Error(error.message);
    
    return {
        id: newCategory.id,
        name: newCategory.name,
        description: newCategory.description || '',
        sortOrder: newCategory.sort_order,
        activeFlag: newCategory.active_flag,
        restaurantId: newCategory.restaurant_id,
    };
};

export const updateCategory = async (data: MenuCategory): Promise<MenuCategory> => {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    const { data: updated, error } = await supabase
        .from('menu_categories')
        .update({
            name: data.name,
            description: data.description,
            sort_order: data.sortOrder,
            active_flag: data.activeFlag,
            restaurant_id: data.restaurantId,
        })
        .eq('id', data.id)
        .select()
        .single();
    
    if (error) throw new Error(error.message);
    
    return {
        id: updated.id,
        name: updated.name,
        description: updated.description || '',
        sortOrder: updated.sort_order,
        activeFlag: updated.active_flag,
        restaurantId: updated.restaurant_id,
    };
};

export const deleteCategory = async (id: string): Promise<void> => {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    const { error } = await supabase
        .from('menu_categories')
        .delete()
        .eq('id', id);
    
    if (error) throw new Error(error.message);
};

// --- SubCategories (Supabase) ---
export const getSubCategories = async (categoryId: string): Promise<SubCategory[]> => {
    if (!supabase) return [];
    
    const { data, error } = await supabase
        .from('subcategories')
        .select('*')
        .eq('category_id', categoryId)
        .order('sort_order', { ascending: true });
    
    if (error) throw new Error(error.message);
    
    return (data || []).map(sc => ({
        id: sc.id,
        name: sc.name,
        sortOrder: sc.sort_order,
        categoryId: sc.category_id,
    }));
};

export const addSubCategory = async (data: Omit<SubCategory, 'id'>): Promise<SubCategory> => {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    const { data: newSubCategory, error } = await supabase
        .from('subcategories')
        .insert({
            name: data.name,
            sort_order: data.sortOrder,
            category_id: data.categoryId,
        })
        .select()
        .single();
    
    if (error) throw new Error(error.message);
    
    return {
        id: newSubCategory.id,
        name: newSubCategory.name,
        sortOrder: newSubCategory.sort_order,
        categoryId: newSubCategory.category_id,
    };
};

export const updateSubCategory = async (data: SubCategory): Promise<SubCategory> => {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    const { data: updated, error } = await supabase
        .from('subcategories')
        .update({
            name: data.name,
            sort_order: data.sortOrder,
            category_id: data.categoryId,
        })
        .eq('id', data.id)
        .select()
        .single();
    
    if (error) throw new Error(error.message);
    
    return {
        id: updated.id,
        name: updated.name,
        sortOrder: updated.sort_order,
        categoryId: updated.category_id,
    };
};

export const deleteSubCategory = async (id: string): Promise<void> => {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    const { error } = await supabase
        .from('subcategories')
        .delete()
        .eq('id', id);
    
    if (error) throw new Error(error.message);
};

// --- Menu Items (Supabase) ---
const mapSupabaseMenuItemToApp = (item: any): MenuItem => ({
    id: item.id,
    name: item.name,
    description: item.description || '',
    price: parseFloat(item.price),
    currency: item.currency as Currency,
    imageUrl: item.image_url || '',
    videoUrl: item.video_url || undefined,
    allergens: item.allergen_ids || [],
    categoryId: item.category_id,
    subCategoryId: item.subcategory_id || undefined,
    availabilityFlag: item.availability_flag,
    tenantId: item.tenant_id,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    sortOrder: item.sort_order,
    displayName: item.display_name || undefined,
    itemCode: item.item_code || undefined,
    prepTime: item.prep_time || undefined,
    soldOut: item.sold_out,
    portion: item.portion || undefined,
    specialType: item.special_type as SpecialType || SpecialType.NONE,
    calories: item.calories || undefined,
    maxOrderQty: item.max_order_qty || undefined,
    bogo: item.bogo,
    complimentary: item.complimentary || undefined,
    imageOrientation: item.image_orientation as ImageOrientation || ImageOrientation.SQUARE,
    availableTime: item.available_time || undefined,
    availableDate: item.available_date || undefined,
    attributes: item.attributes || undefined,
    modifierGroupIds: item.modifier_group_ids || [],
});

export const getMenuItems = async (tenantId: string, categoryId: string, subCategoryId?: string): Promise<MenuItem[]> => {
    if (!supabase) return [];
    
    let query = supabase
        .from('menu_items')
        .select('*')
        .eq('category_id', categoryId)
        .order('sort_order', { ascending: true });

    if (subCategoryId) {
        query = query.eq('subcategory_id', subCategoryId);
    } else {
        query = query.is('subcategory_id', null);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    // Fetch allergen and modifier group associations
    const itemIds = (data || []).map(item => item.id);
    
    const [allergensResult, modifiersResult] = await Promise.all([
        supabase.from('menu_item_allergens').select('menu_item_id, allergen_id').in('menu_item_id', itemIds),
        supabase.from('menu_item_modifier_groups').select('menu_item_id, modifier_group_id').in('menu_item_id', itemIds)
    ]);

    const allergenMap = new Map<string, string[]>();
    (allergensResult.data || []).forEach(a => {
        if (!allergenMap.has(a.menu_item_id)) allergenMap.set(a.menu_item_id, []);
        allergenMap.get(a.menu_item_id)!.push(a.allergen_id);
    });

    const modifierMap = new Map<string, string[]>();
    (modifiersResult.data || []).forEach(m => {
        if (!modifierMap.has(m.menu_item_id)) modifierMap.set(m.menu_item_id, []);
        modifierMap.get(m.menu_item_id)!.push(m.modifier_group_id);
    });

    return (data || []).map(item => ({
        ...mapSupabaseMenuItemToApp(item),
        allergens: allergenMap.get(item.id) || [],
        modifierGroupIds: modifierMap.get(item.id) || [],
    }));
};

export const getAllMenuItems = async (): Promise<MenuItem[]> => {
    if (!supabase) return [];
    
    const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('sort_order', { ascending: true });
    
    if (error) throw new Error(error.message);
    
    return (data || []).map(item => mapSupabaseMenuItemToApp(item));
};

export const addMenuItem = async (data: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<MenuItem> => {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    const { allergens, modifierGroupIds, ...itemData } = data;

    const { data: newMenuItem, error } = await supabase
        .from('menu_items')
        .insert({
            name: itemData.name,
            description: itemData.description,
            price: itemData.price,
            currency: itemData.currency,
            image_url: itemData.imageUrl,
            video_url: itemData.videoUrl,
            category_id: itemData.categoryId,
            subcategory_id: itemData.subCategoryId,
            availability_flag: itemData.availabilityFlag,
            tenant_id: itemData.tenantId || 'tenant-123',
            sort_order: itemData.sortOrder,
            display_name: itemData.displayName,
            item_code: itemData.itemCode,
            prep_time: itemData.prepTime,
            sold_out: itemData.soldOut,
            portion: itemData.portion,
            special_type: itemData.specialType,
            calories: itemData.calories,
            max_order_qty: itemData.maxOrderQty,
            bogo: itemData.bogo,
            complimentary: itemData.complimentary,
            image_orientation: itemData.imageOrientation,
            available_time: itemData.availableTime,
            available_date: itemData.availableDate,
            attributes: itemData.attributes,
        })
        .select()
        .single();
    
    if (error) throw new Error(error.message);

    // Handle junction tables for allergens
    if (allergens && allergens.length > 0) {
        const allergenInserts = allergens.map(allergenId => ({
            menu_item_id: newMenuItem.id,
            allergen_id: allergenId,
        }));
        await supabase.from('menu_item_allergens').insert(allergenInserts);
    }

    // Handle junction tables for modifier groups
    if (modifierGroupIds && modifierGroupIds.length > 0) {
        const modifierGroupInserts = modifierGroupIds.map(groupId => ({
            menu_item_id: newMenuItem.id,
            modifier_group_id: groupId,
        }));
        await supabase.from('menu_item_modifier_groups').insert(modifierGroupInserts);
    }

    return {
        ...mapSupabaseMenuItemToApp(newMenuItem),
        allergens: allergens || [],
        modifierGroupIds: modifierGroupIds || [],
    };
};

export const updateMenuItem = async (data: MenuItem): Promise<MenuItem> => {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    const { allergens, modifierGroupIds, id, createdAt, updatedAt, ...itemData } = data;

    const { data: updated, error } = await supabase
        .from('menu_items')
        .update({
            name: itemData.name,
            description: itemData.description,
            price: itemData.price,
            currency: itemData.currency,
            image_url: itemData.imageUrl,
            video_url: itemData.videoUrl,
            category_id: itemData.categoryId,
            subcategory_id: itemData.subCategoryId,
            availability_flag: itemData.availabilityFlag,
            sort_order: itemData.sortOrder,
            display_name: itemData.displayName,
            item_code: itemData.itemCode,
            prep_time: itemData.prepTime,
            sold_out: itemData.soldOut,
            portion: itemData.portion,
            special_type: itemData.specialType,
            calories: itemData.calories,
            max_order_qty: itemData.maxOrderQty,
            bogo: itemData.bogo,
            complimentary: itemData.complimentary,
            image_orientation: itemData.imageOrientation,
            available_time: itemData.availableTime,
            available_date: itemData.availableDate,
            attributes: itemData.attributes,
        })
        .eq('id', id)
        .select()
        .single();
    
    if (error) throw new Error(error.message);

    // Update allergens
    await supabase.from('menu_item_allergens').delete().eq('menu_item_id', id);
    if (allergens && allergens.length > 0) {
        const allergenInserts = allergens.map(allergenId => ({
            menu_item_id: id,
            allergen_id: allergenId,
        }));
        await supabase.from('menu_item_allergens').insert(allergenInserts);
    }

    // Update modifier groups
    await supabase.from('menu_item_modifier_groups').delete().eq('menu_item_id', id);
    if (modifierGroupIds && modifierGroupIds.length > 0) {
        const modifierGroupInserts = modifierGroupIds.map(groupId => ({
            menu_item_id: id,
            modifier_group_id: groupId,
        }));
        await supabase.from('menu_item_modifier_groups').insert(modifierGroupInserts);
    }

    return {
        ...mapSupabaseMenuItemToApp(updated),
        allergens: allergens || [],
        modifierGroupIds: modifierGroupIds || [],
    };
};

export const deleteMenuItem = async (id: string): Promise<void> => {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    // Delete from junction tables first
    await supabase.from('menu_item_allergens').delete().eq('menu_item_id', id);
    await supabase.from('menu_item_modifier_groups').delete().eq('menu_item_id', id);
    
    const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);
    
    if (error) throw new Error(error.message);
};

export const bulkUpdateMenuItems = async (itemIds: string[], changes: Partial<MenuItem>): Promise<void> => {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    const updateData: any = {};
    if (changes.availabilityFlag !== undefined) updateData.availability_flag = changes.availabilityFlag;
    if (changes.soldOut !== undefined) updateData.sold_out = changes.soldOut;
    if (changes.bogo !== undefined) updateData.bogo = changes.bogo;
    if (changes.currency !== undefined) updateData.currency = changes.currency;
    
    const { error } = await supabase
        .from('menu_items')
        .update(updateData)
        .in('id', itemIds);
    
    if (error) throw new Error(error.message);
};

export const updateMenuItemsBatch = bulkUpdateMenuItems;

// --- Attributes (Supabase) ---
export const getAttributes = async (): Promise<Attribute[]> => {
    if (!supabase) return [];
    
    const { data, error } = await supabase
        .from('attributes')
        .select('*')
        .order('name', { ascending: true });
    
    if (error) throw new Error(error.message);
    
    return (data || []).map(a => ({
        id: a.id,
        name: a.name,
        type: a.type as AttributeType,
        options: a.options || undefined,
    }));
};

export const addAttribute = async (data: Omit<Attribute, 'id'>): Promise<Attribute> => {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    const { data: newAttribute, error } = await supabase
        .from('attributes')
        .insert({
            name: data.name,
            type: data.type,
            options: data.options,
        })
        .select()
        .single();
    
    if (error) throw new Error(error.message);
    
    return {
        id: newAttribute.id,
        name: newAttribute.name,
        type: newAttribute.type as AttributeType,
        options: newAttribute.options || undefined,
    };
};

export const updateAttribute = async (data: Attribute): Promise<Attribute> => {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    const { data: updated, error } = await supabase
        .from('attributes')
        .update({
            name: data.name,
            type: data.type,
            options: data.options,
        })
        .eq('id', data.id)
        .select()
        .single();
    
    if (error) throw new Error(error.message);
    
    return {
        id: updated.id,
        name: updated.name,
        type: updated.type as AttributeType,
        options: updated.options || undefined,
    };
};

export const deleteAttribute = async (id: string): Promise<void> => {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    const { error } = await supabase
        .from('attributes')
        .delete()
        .eq('id', id);
    
    if (error) throw new Error(error.message);
};

// --- Allergens (Supabase) ---
export const getAllergens = async (): Promise<Allergen[]> => {
    if (!supabase) return [];
    
    const { data, error } = await supabase
        .from('allergens')
        .select('*')
        .order('name', { ascending: true });
    
    if (error) throw new Error(error.message);
    
    return (data || []).map(a => ({
        id: a.id,
        name: a.name,
    }));
};

export const addAllergen = async (data: Omit<Allergen, 'id'>): Promise<Allergen> => {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    const { data: newAllergen, error } = await supabase
        .from('allergens')
        .insert({ name: data.name })
        .select()
        .single();
    
    if (error) throw new Error(error.message);
    
    return {
        id: newAllergen.id,
        name: newAllergen.name,
    };
};

export const updateAllergen = async (data: Allergen): Promise<Allergen> => {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    const { data: updated, error } = await supabase
        .from('allergens')
        .update({ name: data.name })
        .eq('id', data.id)
        .select()
        .single();
    
    if (error) throw new Error(error.message);
    
    return {
        id: updated.id,
        name: updated.name,
    };
};

export const deleteAllergen = async (id: string): Promise<void> => {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    const { error } = await supabase
        .from('allergens')
        .delete()
        .eq('id', id);
    
    if (error) throw new Error(error.message);
};

// --- Modifier Groups (Supabase) ---
export const getModifierGroups = async (restaurantId: string): Promise<ModifierGroup[]> => {
    if (!supabase) return [];
    
    const { data, error } = await supabase
        .from('modifier_groups')
        .select('*')
        .eq('restaurant_id', restaurantId);
    
    if (error) throw new Error(error.message);
    
    return (data || []).map(g => ({
        id: g.id,
        name: g.name,
        restaurantId: g.restaurant_id,
        minSelection: g.min_selection,
        maxSelection: g.max_selection,
    }));
};

export const addModifierGroup = async (data: Omit<ModifierGroup, 'id'>): Promise<ModifierGroup> => {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    const { data: newGroup, error } = await supabase
        .from('modifier_groups')
        .insert({
            name: data.name,
            restaurant_id: data.restaurantId,
            min_selection: data.minSelection,
            max_selection: data.maxSelection,
        })
        .select()
        .single();
    
    if (error) throw new Error(error.message);
    
    return {
        id: newGroup.id,
        name: newGroup.name,
        restaurantId: newGroup.restaurant_id,
        minSelection: newGroup.min_selection,
        maxSelection: newGroup.max_selection,
    };
};

export const updateModifierGroup = async (data: ModifierGroup): Promise<ModifierGroup> => {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    const { data: updated, error } = await supabase
        .from('modifier_groups')
        .update({
            name: data.name,
            restaurant_id: data.restaurantId,
            min_selection: data.minSelection,
            max_selection: data.maxSelection,
        })
        .eq('id', data.id)
        .select()
        .single();
    
    if (error) throw new Error(error.message);
    
    return {
        id: updated.id,
        name: updated.name,
        restaurantId: updated.restaurant_id,
        minSelection: updated.min_selection,
        maxSelection: updated.max_selection,
    };
};

export const deleteModifierGroup = async (id: string): Promise<void> => {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    const { error } = await supabase
        .from('modifier_groups')
        .delete()
        .eq('id', id);
    
    if (error) throw new Error(error.message);
};

// --- Modifier Items (Supabase) ---
export const getModifierItems = async (groupId: string): Promise<ModifierItem[]> => {
    if (!supabase) return [];
    
    const { data, error } = await supabase
        .from('modifier_items')
        .select('*')
        .eq('modifier_group_id', groupId);
    
    if (error) throw new Error(error.message);
    
    return (data || []).map(i => ({
        id: i.id,
        name: i.name,
        price: parseFloat(i.price),
        modifierGroupId: i.modifier_group_id,
    }));
};

export const addModifierItem = async (data: Omit<ModifierItem, 'id'>): Promise<ModifierItem> => {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    const { data: newItem, error } = await supabase
        .from('modifier_items')
        .insert({
            name: data.name,
            price: data.price,
            modifier_group_id: data.modifierGroupId,
        })
        .select()
        .single();
    
    if (error) throw new Error(error.message);
    
    return {
        id: newItem.id,
        name: newItem.name,
        price: parseFloat(newItem.price),
        modifierGroupId: newItem.modifier_group_id,
    };
};

export const updateModifierItem = async (data: ModifierItem): Promise<ModifierItem> => {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    const { data: updated, error } = await supabase
        .from('modifier_items')
        .update({
            name: data.name,
            price: data.price,
            modifier_group_id: data.modifierGroupId,
        })
        .eq('id', data.id)
        .select()
        .single();
    
    if (error) throw new Error(error.message);
    
    return {
        id: updated.id,
        name: updated.name,
        price: parseFloat(updated.price),
        modifierGroupId: updated.modifier_group_id,
    };
};

export const deleteModifierItem = async (id: string): Promise<void> => {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    const { error } = await supabase
        .from('modifier_items')
        .delete()
        .eq('id', id);
    
    if (error) throw new Error(error.message);
};

// --- Sales & Analytics (Mock for now - can be migrated to Supabase later) ---
let sales: Sale[] = [];

export const getSales = async (startDate: string, endDate: string, restaurantId?: string): Promise<Sale[]> => {
    return sales.filter(s => {
        const saleDate = new Date(s.saleDate);
        const start = new Date(startDate);
        const end = new Date(endDate);
        const dateMatch = saleDate >= start && saleDate <= end;
        const restaurantMatch = !restaurantId || s.restaurantId === restaurantId;
        return dateMatch && restaurantMatch;
    });
};

// --- Live Orders (Mock for now) ---
let liveOrders: LiveOrder[] = [];

export const getLiveOrders = async (): Promise<LiveOrder[]> => {
    return liveOrders.filter(o => o.status !== OrderStatus.COMPLETED);
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<LiveOrder> => {
    const orderIndex = liveOrders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
        throw new Error("Order not found");
    }
    liveOrders[orderIndex].status = status;
    return { ...liveOrders[orderIndex] };
};

// --- Audit Logs (Mock for now) ---
let auditLogs: AuditLog[] = [];

export const getAuditLogs = async (entityType?: EntityType, actionType?: ActionType): Promise<AuditLog[]> => {
    return auditLogs.filter(log => {
        const entityMatch = !entityType || log.entityType === entityType;
        const actionMatch = !actionType || log.actionType === actionType;
        return entityMatch && actionMatch;
    });
};

// --- Public Menu (Supabase) ---
export const getPublicMenu = async (restaurantId: string): Promise<PublicMenu | null> => {
    if (!supabase) return null;
    
    // Fetch restaurant
    const { data: restaurant } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', restaurantId)
        .single();
    
    if (!restaurant) return null;
    
    // Fetch categories
    const { data: categories } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('active_flag', true)
        .order('sort_order', { ascending: true });
    
    const categoryData = [];
    
    for (const cat of (categories || [])) {
        // Fetch subcategories
        const { data: subcategories } = await supabase
            .from('subcategories')
            .select('*')
            .eq('category_id', cat.id)
            .order('sort_order', { ascending: true });
        
        // Fetch items directly under category (no subcategory)
        const { data: directItems } = await supabase
            .from('menu_items')
            .select('*')
            .eq('category_id', cat.id)
            .is('subcategory_id', null)
            .eq('availability_flag', true)
            .order('sort_order', { ascending: true });
        
        const subcategoryData = [];
        for (const subcat of (subcategories || [])) {
            const { data: subcatItems } = await supabase
                .from('menu_items')
                .select('*')
                .eq('subcategory_id', subcat.id)
                .eq('availability_flag', true)
                .order('sort_order', { ascending: true });
            
            subcategoryData.push({
                id: subcat.id,
                name: subcat.name,
                sortOrder: subcat.sort_order,
                categoryId: subcat.category_id,
                items: (subcatItems || []).map(item => mapSupabaseMenuItemToApp(item)),
            });
        }
        
        categoryData.push({
            id: cat.id,
            name: cat.name,
            description: cat.description || '',
            sortOrder: cat.sort_order,
            activeFlag: cat.active_flag,
            restaurantId: cat.restaurant_id,
            subcategories: subcategoryData,
            items: (directItems || []).map(item => mapSupabaseMenuItemToApp(item)),
        });
    }
    
    return {
        restaurant: {
            id: restaurant.id,
            name: restaurant.name,
            propertyId: restaurant.property_id,
        },
        categories: categoryData,
    };
};

// --- Import Functions (Simplified) ---
export const importMenuFromJson = async (jsonString: string, restaurantId: string): Promise<{ itemsCreated: number, itemsUpdated: number, categoriesCreated: number, subcategoriesCreated: number }> => {
    const data = JSON.parse(jsonString);
    let stats = { itemsCreated: 0, itemsUpdated: 0, categoriesCreated: 0, subcategoriesCreated: 0 };
    
    // Implementation can be added as needed
    console.log('Import menu from JSON called for restaurant:', restaurantId);
    
    return stats;
};

export const importSystemMenuFromJson = async (jsonString: string): Promise<SystemImportStats> => {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    const payload: SystemMenuImportPayload = JSON.parse(jsonString);
    const stats: SystemImportStats = {
        restaurantsProcessed: 0,
        restaurantsSkipped: [],
        categoriesCreated: 0,
        subcategoriesCreated: 0,
        itemsCreated: 0,
        itemsUpdated: 0,
        allergensCreated: 0,
        modifierGroupsCreated: 0,
        modifierItemsCreated: 0,
    };

    // Fetch all restaurants
    const restaurants = await getAllRestaurants();
    
    // Helper to process categories recursively
    const processCategories = async (nodes: SystemCategoryNode[], restaurantId: string, parentCategoryId?: string) => {
        for (const node of nodes) {
            if (parentCategoryId) {
                // Process as subcategory
                const { data: existingSubcats } = await supabase
                    .from('subcategories')
                    .select('*')
                    .eq('category_id', parentCategoryId)
                    .ilike('name', node.name);
                
                let subcat;
                if (existingSubcats && existingSubcats.length > 0) {
                    subcat = {
                        id: existingSubcats[0].id,
                        name: existingSubcats[0].name,
                        sortOrder: existingSubcats[0].sort_order,
                        categoryId: existingSubcats[0].category_id,
                    };
                } else {
                    subcat = await addSubCategory({ 
                        name: node.name, 
                        sortOrder: node.sortOrder || 0, 
                        categoryId: parentCategoryId 
                    });
                    stats.subcategoriesCreated++;
                }
                
                if (node.categories && node.categories.length > 0) {
                    await processCategories(node.categories, restaurantId, subcat.id);
                }
            } else {
                // Process as category
                const { data: existingCats } = await supabase
                    .from('menu_categories')
                    .select('*')
                    .eq('restaurant_id', restaurantId)
                    .ilike('name', node.name);
                
                let cat;
                if (existingCats && existingCats.length > 0) {
                    cat = {
                        id: existingCats[0].id,
                        name: existingCats[0].name,
                        description: existingCats[0].description || '',
                        sortOrder: existingCats[0].sort_order,
                        activeFlag: existingCats[0].active_flag,
                        restaurantId: existingCats[0].restaurant_id,
                    };
                } else {
                    cat = await addCategory({ 
                        name: node.name, 
                        description: '', 
                        sortOrder: node.sortOrder || 0, 
                        activeFlag: true, 
                        restaurantId: restaurantId 
                    });
                    stats.categoriesCreated++;
                }
                
                if (node.categories && node.categories.length > 0) {
                    await processCategories(node.categories, restaurantId, cat.id);
                }
            }
        }
    };

    // Process restaurants and their categories
    for (const restCatInfo of payload.restaurantCategory) {
        let restaurant = restaurants.find(r => r.id === restCatInfo.restaurantId) || 
                        restaurants.find(r => r.name.toLowerCase() === restCatInfo.restaurantName.toLowerCase());
        
        if (!restaurant) {
            stats.restaurantsSkipped.push({ id: restCatInfo.restaurantId, name: restCatInfo.restaurantName });
            continue;
        }
        
        stats.restaurantsProcessed++;
        await processCategories(restCatInfo.categories, restaurant.id);
    }

    // Process modifiers (condiments) and items
    const condimentMap = new Map<string, SystemCondiment>(payload.condiments.map(c => [c.condimentCode, c]));
    const processedModifierGroupsCache = new Map<string, string>(); // Key: "restaurantId-condimentCode", Value: "modifierGroupId"

    for (const item of payload.items) {
        let restaurant = restaurants.find(r => r.id === item.restaurantId) || 
                        restaurants.find(r => r.name.toLowerCase() === item.restaurantName.toLowerCase());
        
        if (!restaurant) continue;

        // Find category
        const { data: categoryData } = await supabase
            .from('menu_categories')
            .select('*')
            .eq('restaurant_id', restaurant.id)
            .ilike('name', item.category)
            .limit(1)
            .single();
        
        if (!categoryData) continue;
        
        const category = {
            id: categoryData.id,
            name: categoryData.name,
            description: categoryData.description || '',
            sortOrder: categoryData.sort_order,
            activeFlag: categoryData.active_flag,
            restaurantId: categoryData.restaurant_id,
        };

        // Process and link modifiers for this item
        const itemModifierGroupIds: string[] = [];
        if (item.condimentCodes) {
            const codes = item.condimentCodes.split(',').map(c => c.trim()).filter(Boolean);
            for (const code of codes) {
                const groupKey = `${restaurant.id}-${code}`;

                if (processedModifierGroupsCache.has(groupKey)) {
                    const groupId = processedModifierGroupsCache.get(groupKey)!;
                    if (!itemModifierGroupIds.includes(groupId)) {
                        itemModifierGroupIds.push(groupId);
                    }
                    continue;
                }

                const condiment = condimentMap.get(code);
                if (condiment) {
                    // Check if modifier group exists
                    const { data: existingGroups } = await supabase
                        .from('modifier_groups')
                        .select('*')
                        .eq('restaurant_id', restaurant.id)
                        .ilike('name', condiment.condimentName)
                        .limit(1);

                    let group;
                    if (existingGroups && existingGroups.length > 0) {
                        group = {
                            id: existingGroups[0].id,
                            name: existingGroups[0].name,
                            restaurantId: existingGroups[0].restaurant_id,
                            minSelection: existingGroups[0].min_selection,
                            maxSelection: existingGroups[0].max_selection,
                        };
                    } else {
                        // Create new modifier group
                        group = await addModifierGroup({
                            name: condiment.condimentName,
                            restaurantId: restaurant.id,
                            minSelection: 0,
                            maxSelection: 1,
                        });
                        stats.modifierGroupsCreated++;

                        // Add modifier items
                        for (const condimentItem of condiment.condimentItems) {
                            await addModifierItem({
                                name: condimentItem.condimentItemName,
                                price: 0,
                                modifierGroupId: group.id,
                            });
                            stats.modifierItemsCreated++;
                        }
                    }

                    if (group) {
                        if (!itemModifierGroupIds.includes(group.id)) {
                            itemModifierGroupIds.push(group.id);
                        }
                        processedModifierGroupsCache.set(groupKey, group.id);
                    }
                }
            }
        }

        // Check if menu item exists
        const { data: existingItems } = await supabase
            .from('menu_items')
            .select('*')
            .eq('item_code', item.itemCode)
            .eq('category_id', category.id)
            .limit(1);

        let existing: MenuItem | null = null;
        if (existingItems && existingItems.length > 0) {
            const existingItem = existingItems[0];
            // Fetch allergens and modifier groups for existing item
            const { data: allergenData } = await supabase
                .from('menu_item_allergens')
                .select('allergen_id')
                .eq('menu_item_id', existingItem.id);
            
            const { data: modifierGroupData } = await supabase
                .from('menu_item_modifier_groups')
                .select('modifier_group_id')
                .eq('menu_item_id', existingItem.id);
            
            existing = {
                ...mapSupabaseMenuItemToApp(existingItem),
                allergens: (allergenData || []).map(a => a.allergen_id),
                modifierGroupIds: (modifierGroupData || []).map(m => m.modifier_group_id),
            };
        }

        const newItemData: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'> = {
            name: item.itemName,
            itemCode: item.itemCode,
            imageUrl: item.itemImage || null,
            price: item.itemPrice,
            categoryId: category.id,
            description: item.itemDescription || '',
            sortOrder: item.sortOrder || 0,
            availabilityFlag: true,
            bogo: false,
            soldOut: false,
            currency: Currency.INR,
            tenantId: 'tenant-123',
            allergens: [],
            modifierGroupIds: itemModifierGroupIds,
        };

        if (existing) {
            await updateMenuItem({ ...existing, ...newItemData });
            stats.itemsUpdated++;
        } else {
            await addMenuItem(newItemData);
            stats.itemsCreated++;
        }
    }
    
    return stats;
};

// --- API Tokens (Direct Supabase) ---
const generateTokenString = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = 'smtlr_';
    for (let i = 0; i < 32; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
};

export const getApiTokens = async (): Promise<ApiToken[]> => {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    const { data, error } = await supabase
        .from('api_tokens')
        .select('*')
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error('Error fetching API tokens:', error);
        return [];
    }
    
    return (data || []).map(token => ({
        id: token.id,
        name: token.name,
        tokenPreview: token.token_preview,
        restaurantId: token.restaurant_id,
        propertyId: token.property_id,
        isActive: token.is_active,
        expiresAt: token.expires_at,
        createdAt: token.created_at,
        lastUsedAt: token.last_used_at,
        createdBy: token.created_by
    }));
};

export const generateApiToken = async (request: GenerateTokenRequest, userId?: string): Promise<ApiToken> => {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    let createdBy = userId;
    if (!createdBy) {
        try {
            const user = await getCurrentUser();
            createdBy = user?.id;
        } catch (e) {
            console.log('No active session');
        }
    }
    
    const token = generateTokenString();
    const tokenPreview = token.substring(0, 8) + '...' + token.substring(token.length - 4);
    
    const expiresAt = request.expiresInDays 
        ? new Date(Date.now() + request.expiresInDays * 24 * 60 * 60 * 1000).toISOString()
        : null;
    
    const { data, error } = await supabase
        .from('api_tokens')
        .insert({
            name: request.name,
            token: token,
            token_preview: tokenPreview,
            restaurant_id: request.restaurantId || null,
            property_id: request.propertyId || null,
            is_active: true,
            expires_at: expiresAt,
            created_by: createdBy || null
        })
        .select()
        .single();
    
    if (error) throw new Error(error.message);
    
    return {
        id: data.id,
        name: data.name,
        token: token, // Return full token only on creation
        tokenPreview: tokenPreview,
        restaurantId: data.restaurant_id,
        propertyId: data.property_id,
        isActive: data.is_active,
        expiresAt: data.expires_at,
        createdAt: data.created_at,
        lastUsedAt: data.last_used_at,
        createdBy: data.created_by
    };
};

export const revokeApiToken = async (tokenId: string): Promise<void> => {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    const { error } = await supabase
        .from('api_tokens')
        .update({ is_active: false })
        .eq('id', tokenId);
    
    if (error) throw new Error(error.message);
};

export const activateApiToken = async (tokenId: string): Promise<void> => {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    const { error } = await supabase
        .from('api_tokens')
        .update({ is_active: true })
        .eq('id', tokenId);
    
    if (error) throw new Error(error.message);
};

export const deleteApiToken = async (tokenId: string): Promise<void> => {
    if (!supabase) throw new Error('Supabase client not initialized');
    
    const { error } = await supabase
        .from('api_tokens')
        .delete()
        .eq('id', tokenId);
    
    if (error) throw new Error(error.message);
};
