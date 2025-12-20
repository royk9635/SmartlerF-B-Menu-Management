import {
    Property, Restaurant, MenuCategory, MenuItem, Currency, Sale, User, UserRole,
    SpecialType, ImageOrientation, SubCategory, AuditLog, ActionType, EntityType,
    Attribute, AttributeType, Allergen, ModifierGroup, ModifierItem, PublicMenu,
    SystemMenuImportPayload, SystemImportStats, SystemCategoryNode, SystemCondiment,
    LiveOrder, OrderStatus
} from '../types';

// --- Mock Data Store with localStorage persistence ---

// Data persistence keys
const DATA_KEYS = {
    PROPERTIES: 'smartler_properties',
    RESTAURANTS: 'smartler_restaurants',
    CATEGORIES: 'smartler_categories',
    SUBCATEGORIES: 'smartler_subcategories',
    MENU_ITEMS: 'smartler_menu_items',
    USERS: 'smartler_users',
    ATTRIBUTES: 'smartler_attributes',
    ALLERGENS: 'smartler_allergens',
    MODIFIER_GROUPS: 'smartler_modifier_groups',
    MODIFIER_ITEMS: 'smartler_modifier_items',
    AUDIT_LOGS: 'smartler_audit_logs'
};

// Generic functions for data persistence
const saveToStorage = (key: string, data: any): void => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.warn(`Failed to save ${key} to localStorage:`, error);
    }
};

const loadFromStorage = <T>(key: string, defaultValue: T): T => {
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
        console.warn(`Failed to load ${key} from localStorage:`, error);
        return defaultValue;
    }
};

// Helper function to save all data after modifications
const saveAllData = (): void => {
    saveToStorage(DATA_KEYS.PROPERTIES, properties);
    saveToStorage(DATA_KEYS.RESTAURANTS, restaurants);
    saveToStorage(DATA_KEYS.CATEGORIES, categories);
    saveToStorage(DATA_KEYS.SUBCATEGORIES, subcategories);
    saveToStorage(DATA_KEYS.MENU_ITEMS, menuItems);
    saveToStorage(DATA_KEYS.USERS, users);
    saveToStorage(DATA_KEYS.ATTRIBUTES, attributes);
    saveToStorage(DATA_KEYS.ALLERGENS, allergens);
    saveToStorage(DATA_KEYS.MODIFIER_GROUPS, modifierGroups);
    saveToStorage(DATA_KEYS.MODIFIER_ITEMS, modifierItems);
    saveToStorage(DATA_KEYS.AUDIT_LOGS, auditLogs);
};

// Initialize data from localStorage or use defaults
let properties: Property[] = loadFromStorage(DATA_KEYS.PROPERTIES, [
    { id: 'prop-1', name: 'Grand Hotel Downtown', address: '123 Main St, Metropolis', tenantId: 'tenant-123' },
    { id: 'prop-2', name: 'Seaside Resort & Spa', address: '456 Ocean Ave, Coast City', tenantId: 'tenant-123' },
]);

let restaurants: Restaurant[] = loadFromStorage(DATA_KEYS.RESTAURANTS, [
    { id: 'rest-1', name: 'The Golden Spoon', propertyId: 'prop-1' },
    { id: 'rest-2', name: 'Azure Grill', propertyId: 'prop-1' },
    { id: 'rest-3', name: 'Beachside Cafe', propertyId: 'prop-2' },
]);

let categories: MenuCategory[] = loadFromStorage(DATA_KEYS.CATEGORIES, [
    { id: 'cat-1', name: 'Appetizers', description: 'Starters to whet your appetite', sortOrder: 1, activeFlag: true, restaurantId: 'rest-1' },
    { id: 'cat-2', name: 'Main Courses', description: 'Hearty and delicious main dishes', sortOrder: 2, activeFlag: true, restaurantId: 'rest-1' },
    { id: 'cat-3', name: 'Desserts', description: 'Sweet treats to end your meal', sortOrder: 3, activeFlag: true, restaurantId: 'rest-1' },
    { id: 'cat-4', name: 'Seafood Specials', description: 'Fresh from the ocean', sortOrder: 1, activeFlag: true, restaurantId: 'rest-2' },
    { id: 'cat-5', name: 'Light Bites', description: 'Snacks and small plates', sortOrder: 1, activeFlag: true, restaurantId: 'rest-3' },
]);

let subcategories: SubCategory[] = loadFromStorage(DATA_KEYS.SUBCATEGORIES, [
    { id: 'subcat-1', name: 'Soups', sortOrder: 1, categoryId: 'cat-1' },
    { id: 'subcat-2', name: 'Salads', sortOrder: 2, categoryId: 'cat-1' },
    { id: 'subcat-3', name: 'Steaks', sortOrder: 1, categoryId: 'cat-2' },
]);

let allergens: Allergen[] = loadFromStorage(DATA_KEYS.ALLERGENS, [
    { id: 'allergen-1', name: 'Gluten' },
    { id: 'allergen-2', name: 'Dairy' },
    { id: 'allergen-3', name: 'Nuts' },
    { id: 'allergen-4', name: 'Soy' },
    { id: 'allergen-5', name: 'Shellfish' },
]);

let attributes: Attribute[] = loadFromStorage(DATA_KEYS.ATTRIBUTES, [
    { id: 'attr-1', name: 'Spiciness', type: AttributeType.SELECT, options: ['Mild', 'Medium', 'Hot', 'Extra Hot'] },
    { id: 'attr-2', name: 'Serves', type: AttributeType.NUMBER },
    { id: 'attr-3', name: 'Is Gluten-Free', type: AttributeType.BOOLEAN },
]);

let modifierGroups: ModifierGroup[] = [
    { id: 'modgroup-1', name: 'Steak Temperature', restaurantId: 'rest-1', minSelection: 1, maxSelection: 1 },
    { id: 'modgroup-2', name: 'Salad Dressing', restaurantId: 'rest-1', minSelection: 0, maxSelection: 1 },
];

let modifierItems: ModifierItem[] = [
    { id: 'moditem-1', name: 'Rare', price: 0, modifierGroupId: 'modgroup-1' },
    { id: 'moditem-2', name: 'Medium Rare', price: 0, modifierGroupId: 'modgroup-1' },
    { id: 'moditem-3', name: 'Medium', price: 0, modifierGroupId: 'modgroup-1' },
    { id: 'moditem-4', name: 'Well Done', price: 0, modifierGroupId: 'modgroup-1' },
    { id: 'moditem-5', name: 'Vinaigrette', price: 0, modifierGroupId: 'modgroup-2' },
    { id: 'moditem-6', name: 'Ranch', price: 0, modifierGroupId: 'modgroup-2' },
    { id: 'moditem-7', name: 'Caesar', price: 1.5, modifierGroupId: 'modgroup-2' },
];

let menuItems: MenuItem[] = [
    {
        id: 'item-1', name: 'Bruschetta', description: 'Grilled bread with tomatoes, garlic, and olive oil', price: 8.50, currency: Currency.USD,
        imageUrl: 'https://images.unsplash.com/photo-1505253716362-afb74b62f847?w=400', allergens: ['allergen-1'], categoryId: 'cat-1',
        availabilityFlag: true, tenantId: 'tenant-123', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), sortOrder: 1,
        soldOut: false, specialType: SpecialType.VEG, bogo: false, imageOrientation: ImageOrientation.LANDSCAPE,
        attributes: { 'attr-3': true },
    },
    {
        id: 'item-2', name: 'Caesar Salad', description: 'Romaine lettuce with Caesar dressing, croutons, and Parmesan cheese', price: 10.00, currency: Currency.USD,
        imageUrl: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400', allergens: ['allergen-1', 'allergen-2'], categoryId: 'cat-1', subCategoryId: 'subcat-2',
        availabilityFlag: true, tenantId: 'tenant-123', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), sortOrder: 2,
        soldOut: false, specialType: SpecialType.NONE, bogo: true, imageOrientation: ImageOrientation.SQUARE
    },
    {
        id: 'item-3', name: 'Filet Mignon', description: '8oz center-cut tenderloin, grilled to perfection', price: 35.00, currency: Currency.USD,
        imageUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c7373094?w=400', allergens: [], categoryId: 'cat-2', subCategoryId: 'subcat-3',
        availabilityFlag: true, tenantId: 'tenant-123', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), sortOrder: 1,
        soldOut: false, specialType: SpecialType.NON_VEG, bogo: false, imageOrientation: ImageOrientation.LANDSCAPE,
        modifierGroupIds: ['modgroup-1'],
    },
    {
        id: 'item-4', name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with a molten center, served with vanilla ice cream', price: 9.00, currency: Currency.USD,
        imageUrl: 'https://images.unsplash.com/photo-1586985289936-e04c356a8c65?w=400', allergens: ['allergen-1', 'allergen-2'], categoryId: 'cat-3',
        availabilityFlag: true, tenantId: 'tenant-123', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), sortOrder: 1,
        soldOut: true, specialType: SpecialType.VEG, bogo: false, imageOrientation: ImageOrientation.PORTRAIT
    },
    {
        id: 'item-5', name: 'Grilled Salmon', description: 'Fresh Atlantic salmon with a lemon-dill sauce', price: 28.00, currency: Currency.EUR,
        imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400', allergens: [], categoryId: 'cat-4',
        availabilityFlag: true, tenantId: 'tenant-123', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), sortOrder: 1,
        soldOut: false, specialType: SpecialType.CHEF_SPECIAL, bogo: false, imageOrientation: ImageOrientation.LANDSCAPE
    },
];

let users: User[] = [
    { id: 'user-1', name: 'Alice Super', email: 'super@smartler.com', role: UserRole.SUPERADMIN, password: 'password' },
    { id: 'user-2', name: 'John Doe', email: 'john.doe@grandhotel.com', role: UserRole.PROPERTY_ADMIN, propertyId: 'prop-1', password: 'password' },
];

let sales: Sale[] = [];
let auditLogs: AuditLog[] = [];
let liveOrders: LiveOrder[] = [];

// Helper to simulate network delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Helper to generate IDs
const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Helper to create audit log
const logAction = (user: User, actionType: ActionType, entityType: EntityType, entityName: string, details: string) => {
    const log: AuditLog = {
        id: generateId('log'),
        timestamp: new Date().toISOString(),
        userId: user.id,
        userName: user.name,
        actionType,
        entityType,
        entityName,
        details,
    };
    auditLogs.unshift(log);
};

// --- Mock Session Management with localStorage persistence ---
const SESSION_KEY = 'smartler_current_user';

// Get session from localStorage
const getStoredSession = (): User | null => {
    try {
        const stored = localStorage.getItem(SESSION_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
};

// Set session in localStorage
const setStoredSession = (user: User | null): void => {
    if (user) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
        localStorage.removeItem(SESSION_KEY);
    }
};

// Initialize session from localStorage
let currentSessionUser: User | null = getStoredSession();
// FIX: Replaced non-null assertion `!` with a proper runtime check for robustness.
const superAdminUser = users.find(u => u.role === UserRole.SUPERADMIN);
if (!superAdminUser) {
    throw new Error("Fatal Error: Superadmin user not found in mock data.");
}
const SUPERADMIN_USER = superAdminUser;

// --- Sales Data Generation ---
const initializeSalesData = () => {
    if (sales.length > 0) return;
    const today = new Date();
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(today.getMonth() - 2);

    for (let d = twoMonthsAgo; d <= today; d.setDate(d.getDate() + 1)) {
        if (Math.random() > 0.1) { // 90% chance of sales on a given day
            const numSales = Math.floor(Math.random() * 20) + 5;
            for (let i = 0; i < numSales; i++) {
                const restaurant = restaurants[Math.floor(Math.random() * restaurants.length)];
                const restaurantItems = menuItems.filter(item => categories.find(c => c.id === item.categoryId)?.restaurantId === restaurant.id);
                if (restaurantItems.length === 0) continue;

                const numItemsInSale = Math.floor(Math.random() * 5) + 1;
                let saleItems: Sale['items'] = [];
                let totalAmount = 0;

                for (let j = 0; j < numItemsInSale; j++) {
                    const menuItem = restaurantItems[Math.floor(Math.random() * restaurantItems.length)];
                    const quantity = Math.floor(Math.random() * 3) + 1;
                    saleItems.push({ menuItemId: menuItem.id, quantity, price: menuItem.price });
                    totalAmount += menuItem.price * quantity;
                }

                const saleDate = new Date(d);
                saleDate.setHours(Math.floor(Math.random() * 12) + 9);
                saleDate.setMinutes(Math.floor(Math.random() * 60));

                sales.push({
                    id: generateId('sale'),
                    items: saleItems,
                    totalAmount: totalAmount,
                    saleDate: saleDate.toISOString(),
                    restaurantId: restaurant.id,
                    tableNumber: Math.floor(Math.random() * 20) + 1,
                });
            }
        }
    }
    sales.sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());
};

initializeSalesData();

// --- Live Order Simulator ---
const simulateNewOrder = () => {
    if (restaurants.length === 0) return;
    const restaurant = restaurants[Math.floor(Math.random() * restaurants.length)];
    const restaurantItems = menuItems.filter(item => 
        categories.find(c => c.id === item.categoryId)?.restaurantId === restaurant.id &&
        item.availabilityFlag && !item.soldOut
    );
    if (restaurantItems.length === 0) return;

    const numItemsInOrder = Math.floor(Math.random() * 4) + 1;
    let orderItems: LiveOrder['items'] = [];
    let totalAmount = 0;

    for (let i = 0; i < numItemsInOrder; i++) {
        const menuItem = restaurantItems[Math.floor(Math.random() * restaurantItems.length)];
        const quantity = Math.floor(Math.random() * 2) + 1;
        orderItems.push({ menuItemId: menuItem.id, quantity, price: menuItem.price });
        totalAmount += menuItem.price * quantity;
    }

    const newOrder: LiveOrder = {
        id: generateId('ord'),
        items: orderItems,
        totalAmount: totalAmount,
        placedAt: new Date().toISOString(),
        restaurantId: restaurant.id,
        tableNumber: Math.floor(Math.random() * 30) + 1,
        status: OrderStatus.NEW,
    };
    liveOrders.unshift(newOrder);
};

// Start the simulator
setInterval(simulateNewOrder, 15000); // New order every 15 seconds
// Add a few initial orders
setTimeout(simulateNewOrder, 1000);
setTimeout(simulateNewOrder, 5000);


// --- API Functions ---

// Session
export const login = async (email: string, password: string): Promise<User> => {
    await delay(500);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (user) {
        currentSessionUser = { ...user };
        delete currentSessionUser.password;
        setStoredSession(currentSessionUser); // Persist to localStorage
        return currentSessionUser;
    }
    throw new Error('Invalid email or password.');
};

export const logout = async (): Promise<void> => {
    await delay(200);
    currentSessionUser = null;
    setStoredSession(null); // Clear from localStorage
};

export const getCurrentUser = async (): Promise<User> => {
    await delay(100);
    if (currentSessionUser) {
        return currentSessionUser;
    }
    throw new Error('No active session.');
};

// Properties
export const getProperties = async (tenantId: string): Promise<Property[]> => {
    await delay(300);
    return JSON.parse(JSON.stringify(properties));
};

export const addProperty = async (data: Omit<Property, 'id' | 'tenantId'>): Promise<Property> => {
    await delay(200);
    const newProperty: Property = { ...data, id: generateId('prop'), tenantId: 'tenant-123' };
    properties.push(newProperty);
    logAction(currentSessionUser || SUPERADMIN_USER, ActionType.CREATE, EntityType.PROPERTY, newProperty.name, `Created new property.`);
    saveAllData(); // Persist changes to localStorage
    return newProperty;
};

export const updateProperty = async (data: Property): Promise<Property> => {
    await delay(200);
    const index = properties.findIndex(p => p.id === data.id);
    if (index === -1) throw new Error('Property not found');
    properties[index] = data;
    logAction(currentSessionUser || SUPERADMIN_USER, ActionType.UPDATE, EntityType.PROPERTY, data.name, `Updated property details.`);
    return data;
};

export const deleteProperty = async (id: string): Promise<void> => {
    await delay(400);
    const prop = properties.find(p => p.id === id);
    if (!prop) return;
    properties = properties.filter(p => p.id !== id);
    // Cascade delete
    const restToDelete = restaurants.filter(r => r.propertyId === id).map(r => r.id);
    restaurants = restaurants.filter(r => r.propertyId !== id);
    const catsToDelete = categories.filter(c => restToDelete.includes(c.restaurantId)).map(c => c.id);
    categories = categories.filter(c => !restToDelete.includes(c.restaurantId));
    subcategories = subcategories.filter(sc => !catsToDelete.includes(sc.categoryId));
    menuItems = menuItems.filter(i => !catsToDelete.includes(i.categoryId));
    logAction(currentSessionUser || SUPERADMIN_USER, ActionType.DELETE, EntityType.PROPERTY, prop.name, `Deleted property and all associated data.`);
    saveAllData(); // Persist changes to localStorage
};

// Restaurants
export const getAllRestaurants = async (): Promise<Restaurant[]> => {
    await delay(200);
    return JSON.parse(JSON.stringify(restaurants));
};

export const addRestaurant = async (data: Omit<Restaurant, 'id'>): Promise<Restaurant> => {
    await delay(200);
    const newRestaurant: Restaurant = { ...data, id: generateId('rest') };
    restaurants.push(newRestaurant);
    logAction(currentSessionUser || SUPERADMIN_USER, ActionType.CREATE, EntityType.RESTAURANT, newRestaurant.name, `Created new restaurant.`);
    return newRestaurant;
};

export const updateRestaurant = async (data: Restaurant): Promise<Restaurant> => {
    await delay(200);
    const index = restaurants.findIndex(r => r.id === data.id);
    if (index === -1) throw new Error('Restaurant not found');
    restaurants[index] = data;
    logAction(currentSessionUser || SUPERADMIN_USER, ActionType.UPDATE, EntityType.RESTAURANT, data.name, `Updated restaurant details.`);
    return data;
};

export const deleteRestaurant = async (id: string): Promise<void> => {
    await delay(400);
    const rest = restaurants.find(r => r.id === id);
    if (!rest) return;
    restaurants = restaurants.filter(r => r.id !== id);
    // Cascade delete
    const catsToDelete = categories.filter(c => c.restaurantId === id).map(c => c.id);
    categories = categories.filter(c => c.restaurantId !== id);
    subcategories = subcategories.filter(sc => !catsToDelete.includes(sc.categoryId));
    menuItems = menuItems.filter(i => !catsToDelete.includes(i.categoryId));
    logAction(currentSessionUser || SUPERADMIN_USER, ActionType.DELETE, EntityType.RESTAURANT, rest.name, `Deleted restaurant and its menu.`);
    saveAllData(); // Persist changes to localStorage
};

// Categories & Subcategories
export const getCategories = async (restaurantId: string): Promise<MenuCategory[]> => {
    await delay(300);
    return JSON.parse(JSON.stringify(categories.filter(c => c.restaurantId === restaurantId).sort((a,b) => a.sortOrder - b.sortOrder)));
};

export const getAllCategories = async (): Promise<MenuCategory[]> => {
    await delay(100);
    return JSON.parse(JSON.stringify(categories));
}

export const addCategory = async (data: Omit<MenuCategory, 'id'>): Promise<MenuCategory> => {
    await delay(200);
    const newCategory: MenuCategory = { ...data, id: generateId('cat') };
    categories.push(newCategory);
    logAction(currentSessionUser || SUPERADMIN_USER, ActionType.CREATE, EntityType.CATEGORY, newCategory.name, `Created new category.`);
    return newCategory;
};

export const updateCategory = async (data: MenuCategory): Promise<MenuCategory> => {
    await delay(100);
    const index = categories.findIndex(c => c.id === data.id);
    if (index === -1) throw new Error('Category not found');
    categories[index] = data;
     logAction(currentSessionUser || SUPERADMIN_USER, ActionType.UPDATE, EntityType.CATEGORY, data.name, `Updated category details.`);
    return data;
};

export const deleteCategory = async (id: string): Promise<void> => {
    await delay(400);
    const cat = categories.find(c => c.id === id);
    if (!cat) return;
    categories = categories.filter(c => c.id !== id);
    subcategories = subcategories.filter(sc => sc.categoryId !== id);
    menuItems = menuItems.filter(i => i.categoryId !== id);
    logAction(currentSessionUser || SUPERADMIN_USER, ActionType.DELETE, EntityType.CATEGORY, cat.name, `Deleted category and its items.`);
};

export const getSubCategories = async (categoryId: string): Promise<SubCategory[]> => {
    await delay(200);
    return JSON.parse(JSON.stringify(subcategories.filter(sc => sc.categoryId === categoryId).sort((a,b) => a.sortOrder - b.sortOrder)));
};

export const addSubCategory = async (data: Omit<SubCategory, 'id'>): Promise<SubCategory> => {
    await delay(200);
    const newSubCategory: SubCategory = { ...data, id: generateId('subcat') };
    subcategories.push(newSubCategory);
    logAction(currentSessionUser || SUPERADMIN_USER, ActionType.CREATE, EntityType.SUBCATEGORY, newSubCategory.name, `Created new subcategory.`);
    return newSubCategory;
};

export const updateSubCategory = async (data: SubCategory): Promise<SubCategory> => {
    await delay(100);
    const index = subcategories.findIndex(sc => sc.id === data.id);
    if (index === -1) throw new Error('Subcategory not found');
    subcategories[index] = data;
    logAction(currentSessionUser || SUPERADMIN_USER, ActionType.UPDATE, EntityType.SUBCATEGORY, data.name, `Updated subcategory details.`);
    return data;
};

export const deleteSubCategory = async (id: string): Promise<void> => {
    await delay(400);
    const subcat = subcategories.find(sc => sc.id === id);
    if (!subcat) return;
    subcategories = subcategories.filter(sc => sc.id !== id);
    menuItems = menuItems.filter(i => i.subCategoryId !== id);
     logAction(currentSessionUser || SUPERADMIN_USER, ActionType.DELETE, EntityType.SUBCATEGORY, subcat.name, `Deleted subcategory and its items.`);
};

// Menu Items
export const getMenuItems = async (tenantId: string, categoryId: string, subCategoryId?: string): Promise<MenuItem[]> => {
    await delay(400);
    let items = menuItems.filter(item => item.categoryId === categoryId);
    if (subCategoryId) {
        items = items.filter(item => item.subCategoryId === subCategoryId);
    } else {
        items = items.filter(item => !item.subCategoryId);
    }
    return JSON.parse(JSON.stringify(items.sort((a,b) => a.sortOrder - b.sortOrder)));
};

export const getAllMenuItems = async(): Promise<MenuItem[]> => {
    await delay(200);
    return JSON.parse(JSON.stringify(menuItems));
}

export const addMenuItem = async (data: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<MenuItem> => {
    await delay(200);
    const newItem: MenuItem = {
        ...data,
        id: generateId('item'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    menuItems.push(newItem);
    logAction(currentSessionUser || SUPERADMIN_USER, ActionType.CREATE, EntityType.MENU_ITEM, newItem.name, `Created new menu item.`);
    return newItem;
};

export const updateMenuItem = async (data: MenuItem): Promise<MenuItem> => {
    await delay(100);
    const index = menuItems.findIndex(i => i.id === data.id);
    if (index === -1) throw new Error('Menu item not found');
    menuItems[index] = { ...data, updatedAt: new Date().toISOString() };
    logAction(currentSessionUser || SUPERADMIN_USER, ActionType.UPDATE, EntityType.MENU_ITEM, data.name, `Updated menu item details.`);
    return menuItems[index];
};

export const deleteMenuItem = async (id: string): Promise<void> => {
    await delay(200);
    const item = menuItems.find(i => i.id === id);
    if (!item) return;
    menuItems = menuItems.filter(i => i.id !== id);
    logAction(currentSessionUser || SUPERADMIN_USER, ActionType.DELETE, EntityType.MENU_ITEM, item.name, `Deleted menu item.`);
};

export const updateMenuItemsBatch = async (itemIds: string[], changes: Partial<Omit<MenuItem, 'id'>>): Promise<void> => {
    await delay(500);
    menuItems = menuItems.map(item => {
        if (itemIds.includes(item.id)) {
            return { ...item, ...changes, updatedAt: new Date().toISOString() };
        }
        return item;
    });
    logAction(currentSessionUser || SUPERADMIN_USER, ActionType.UPDATE, EntityType.MENU_ITEM, `${itemIds.length} items`, `Performed bulk update.`);
};

// Public Menu
export const getPublicMenuData = async (restaurantId: string): Promise<PublicMenu> => {
    await delay(800);
    const restaurant = restaurants.find(r => r.id === restaurantId);
    if (!restaurant) throw new Error('Restaurant not found.');
    
    const restaurantCategories = categories.filter(c => c.restaurantId === restaurantId && c.activeFlag);
    const categoryIds = new Set(restaurantCategories.map(c => c.id));
    const restaurantItems = menuItems.filter(i => categoryIds.has(i.categoryId) && i.availabilityFlag);
    const restaurantSubCategories = subcategories.filter(sc => categoryIds.has(sc.categoryId));

    const publicCategories = restaurantCategories.map(cat => {
        return {
            ...cat,
            items: restaurantItems.filter(i => i.categoryId === cat.id && !i.subCategoryId),
            subcategories: restaurantSubCategories
                .filter(sc => sc.categoryId === cat.id)
                .map(sc => ({
                    ...sc,
                    items: restaurantItems.filter(i => i.subCategoryId === sc.id)
                }))
        };
    });

    return {
        restaurant,
        categories: publicCategories
    };
};

// Sales
export const getSales = async (startDate: string, endDate: string): Promise<Sale[]> => {
    await delay(600);
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    return JSON.parse(JSON.stringify(sales.filter(s => {
        const saleTime = new Date(s.saleDate).getTime();
        return saleTime >= start && saleTime <= end;
    })));
};

// Users
export const getUsers = async (): Promise<User[]> => {
    await delay(300);
    return JSON.parse(JSON.stringify(users.map(u => {
        const userCopy = {...u};
        delete userCopy.password;
        return userCopy;
    })));
};

export const addUser = async (data: Omit<User, 'id'>): Promise<User> => {
    await delay(200);
    if (users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
        throw new Error("A user with this email already exists.");
    }
    const newUser: User = { ...data, id: generateId('user'), password: 'password' }; // Set a default password
    users.push(newUser);
    logAction(currentSessionUser || SUPERADMIN_USER, ActionType.CREATE, EntityType.USER, newUser.name, `Created new user.`);
    const userCopy = {...newUser};
    delete userCopy.password;
    return userCopy;
};

export const updateUser = async (data: User): Promise<User> => {
    await delay(200);
    const index = users.findIndex(u => u.id === data.id);
    if (index === -1) throw new Error('User not found');
    users[index] = { ...users[index], ...data };
    logAction(currentSessionUser || SUPERADMIN_USER, ActionType.UPDATE, EntityType.USER, data.name, `Updated user details.`);
    const userCopy = {...users[index]};
    delete userCopy.password;
    return userCopy;
};

export const deleteUser = async (id: string): Promise<void> => {
    await delay(200);
    const user = users.find(u => u.id === id);
    if (!user) return;
    if (id === 'user-1' || id === currentSessionUser?.id) {
        throw new Error("Cannot delete the main superadmin or your own account.");
    }
    users = users.filter(u => u.id !== id);
    logAction(currentSessionUser || SUPERADMIN_USER, ActionType.DELETE, EntityType.USER, user.name, `Deleted user account.`);
};

// Audit Log
export const getAuditLogs = async (filters: { userId: string, startDate: string, endDate: string, actionType: string }): Promise<AuditLog[]> => {
    await delay(500);
    let filteredLogs = [...auditLogs];

    if (filters.userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
    }
    if (filters.actionType) {
        filteredLogs = filteredLogs.filter(log => log.actionType === filters.actionType);
    }
    if (filters.startDate) {
        const start = new Date(filters.startDate).getTime();
        filteredLogs = filteredLogs.filter(log => new Date(log.timestamp).getTime() >= start);
    }
    if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999); // Include the whole day
        filteredLogs = filteredLogs.filter(log => new Date(log.timestamp).getTime() <= end.getTime());
    }

    return JSON.parse(JSON.stringify(filteredLogs));
};

// Attributes
export const getAttributes = async (): Promise<Attribute[]> => {
    await delay(200);
    return JSON.parse(JSON.stringify(attributes));
};
export const addAttribute = async (data: Omit<Attribute, 'id'>): Promise<Attribute> => {
    await delay(200);
    const newAttr: Attribute = { ...data, id: generateId('attr') };
    attributes.push(newAttr);
    logAction(currentSessionUser || SUPERADMIN_USER, ActionType.CREATE, EntityType.ATTRIBUTE, newAttr.name, `Created new attribute.`);
    return newAttr;
};
export const updateAttribute = async (data: Attribute): Promise<Attribute> => {
    await delay(200);
    const index = attributes.findIndex(a => a.id === data.id);
    if (index === -1) throw new Error('Attribute not found');
    attributes[index] = data;
    logAction(currentSessionUser || SUPERADMIN_USER, ActionType.UPDATE, EntityType.ATTRIBUTE, data.name, `Updated attribute.`);
    return data;
};
export const deleteAttribute = async (id: string): Promise<void> => {
    await delay(200);
    const attr = attributes.find(a => a.id === id);
    if (!attr) return;
    attributes = attributes.filter(a => a.id !== id);
    // Remove from items
    menuItems.forEach(item => {
        if (item.attributes && item.attributes[id]) {
            delete item.attributes[id];
        }
    });
    logAction(currentSessionUser || SUPERADMIN_USER, ActionType.DELETE, EntityType.ATTRIBUTE, attr.name, `Deleted attribute.`);
};

// Allergens
export const getAllergens = async (): Promise<Allergen[]> => {
    await delay(200);
    return JSON.parse(JSON.stringify(allergens));
};
export const addAllergen = async (data: Omit<Allergen, 'id'>): Promise<Allergen> => {
    await delay(200);
    const newAllergen: Allergen = { ...data, id: generateId('allergen') };
    allergens.push(newAllergen);
    logAction(currentSessionUser || SUPERADMIN_USER, ActionType.CREATE, EntityType.ALLERGEN, newAllergen.name, `Created new allergen.`);
    return newAllergen;
};
export const updateAllergen = async (data: Allergen): Promise<Allergen> => {
    await delay(200);
    const index = allergens.findIndex(a => a.id === data.id);
    if (index === -1) throw new Error('Allergen not found');
    allergens[index] = data;
    logAction(currentSessionUser || SUPERADMIN_USER, ActionType.UPDATE, EntityType.ALLERGEN, data.name, `Updated allergen.`);
    return data;
};
export const deleteAllergen = async (id: string): Promise<void> => {
    await delay(200);
    const allergen = allergens.find(a => a.id === id);
    if (!allergen) return;
    allergens = allergens.filter(a => a.id !== id);
    menuItems.forEach(item => {
        item.allergens = item.allergens.filter(allergenId => allergenId !== id);
    });
    logAction(currentSessionUser || SUPERADMIN_USER, ActionType.DELETE, EntityType.ALLERGEN, allergen.name, `Deleted allergen.`);
};

// Modifiers
export const getModifierGroups = async (restaurantId: string): Promise<ModifierGroup[]> => {
    await delay(300);
    return JSON.parse(JSON.stringify(modifierGroups.filter(g => g.restaurantId === restaurantId)));
};
export const getModifierItems = async (groupId: string): Promise<ModifierItem[]> => {
    await delay(200);
    return JSON.parse(JSON.stringify(modifierItems.filter(i => i.modifierGroupId === groupId)));
};
export const addModifierGroup = async (data: Omit<ModifierGroup, 'id'>): Promise<ModifierGroup> => {
    await delay(200);
    const newGroup: ModifierGroup = { ...data, id: generateId('modgroup') };
    modifierGroups.push(newGroup);
    logAction(currentSessionUser || SUPERADMIN_USER, ActionType.CREATE, EntityType.MODIFIER_GROUP, newGroup.name, `Created modifier group.`);
    return newGroup;
};
export const updateModifierGroup = async (data: ModifierGroup): Promise<ModifierGroup> => {
    await delay(200);
    const index = modifierGroups.findIndex(g => g.id === data.id);
    if (index === -1) throw new Error('Modifier group not found');
    modifierGroups[index] = data;
    logAction(currentSessionUser || SUPERADMIN_USER, ActionType.UPDATE, EntityType.MODIFIER_GROUP, data.name, `Updated modifier group.`);
    return data;
};
export const deleteModifierGroup = async (id: string): Promise<void> => {
    await delay(300);
    const group = modifierGroups.find(g => g.id === id);
    if (!group) return;
    modifierGroups = modifierGroups.filter(g => g.id !== id);
    modifierItems = modifierItems.filter(i => i.modifierGroupId !== id);
    menuItems.forEach(item => {
        item.modifierGroupIds = item.modifierGroupIds?.filter(groupId => groupId !== id);
    });
    logAction(currentSessionUser || SUPERADMIN_USER, ActionType.DELETE, EntityType.MODIFIER_GROUP, group.name, `Deleted modifier group.`);
};
export const addModifierItem = async (data: Omit<ModifierItem, 'id'>): Promise<ModifierItem> => {
    await delay(200);
    const newItem: ModifierItem = { ...data, id: generateId('moditem') };
    modifierItems.push(newItem);
    logAction(currentSessionUser || SUPERADMIN_USER, ActionType.CREATE, EntityType.MODIFIER_ITEM, newItem.name, `Created modifier item.`);
    return newItem;
};
export const updateModifierItem = async (data: ModifierItem): Promise<ModifierItem> => {
    await delay(200);
    const index = modifierItems.findIndex(i => i.id === data.id);
    if (index === -1) throw new Error('Modifier item not found');
    modifierItems[index] = data;
    logAction(currentSessionUser || SUPERADMIN_USER, ActionType.UPDATE, EntityType.MODIFIER_ITEM, data.name, `Updated modifier item.`);
    return data;
};
export const deleteModifierItem = async (id: string): Promise<void> => {
    await delay(200);
    const item = modifierItems.find(i => i.id === id);
    if (!item) return;
    modifierItems = modifierItems.filter(i => i.id !== id);
    logAction(currentSessionUser || SUPERADMIN_USER, ActionType.DELETE, EntityType.MODIFIER_ITEM, item.name, `Deleted modifier item.`);
};


// Import/Export
export const importMenuFromJson = async (jsonString: string, restaurantId: string): Promise<{ itemsCreated: number, itemsUpdated: number, categoriesCreated: number, subcategoriesCreated: number }> => {
    await delay(1500);
    const data = JSON.parse(jsonString);
    let stats = { itemsCreated: 0, itemsUpdated: 0, categoriesCreated: 0, subcategoriesCreated: 0 };
    
    for (const catData of data.categories) {
        let category = categories.find(c => c.name === catData.name && c.restaurantId === restaurantId);
        if (!category) {
            category = await addCategory({
                name: catData.name,
                description: catData.description || '',
                sortOrder: catData.sortOrder || categories.length,
                activeFlag: true,
                restaurantId: restaurantId,
            });
            stats.categoriesCreated++;
        }

        const processItems = async (items: any[], categoryId: string, subCategoryId?: string) => {
             for (const itemData of items) {
                const existingItem = menuItems.find(i => i.itemCode === itemData.itemCode && i.categoryId === categoryId);
                const newItemData = {
                    ...itemData,
                    categoryId,
                    subCategoryId,
                    tenantId: 'tenant-123'
                };
                if (existingItem) {
                    await updateMenuItem({ ...existingItem, ...newItemData });
                    stats.itemsUpdated++;
                } else {
                    await addMenuItem(newItemData);
                    stats.itemsCreated++;
                }
            }
        }

        if (catData.items) {
            await processItems(catData.items, category.id);
        }

        if (catData.subcategories) {
            for (const subcatData of catData.subcategories) {
                let subcategory = subcategories.find(sc => sc.name === subcatData.name && sc.categoryId === category.id);
                 if (!subcategory) {
                    subcategory = await addSubCategory({
                        name: subcatData.name,
                        sortOrder: subcatData.sortOrder || 10,
                        categoryId: category.id
                    });
                    stats.subcategoriesCreated++;
                }
                if (subcatData.items) {
                    await processItems(subcatData.items, category.id, subcategory.id);
                }
            }
        }
    }
    return stats;
};


export const importSystemMenuFromJson = async (jsonString: string): Promise<SystemImportStats> => {
    await delay(2000);
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

    // Helper to process categories recursively
    const processCategories = async (nodes: SystemCategoryNode[], restaurantId: string, parentCategoryId?: string) => {
        for (const node of nodes) {
            if (parentCategoryId) {
                let subcat = subcategories.find(sc => sc.name.toLowerCase() === node.name.toLowerCase() && sc.categoryId === parentCategoryId);
                if (!subcat) {
                    subcat = await addSubCategory({ name: node.name, sortOrder: node.sortOrder, categoryId: parentCategoryId });
                    stats.subcategoriesCreated++;
                }
                if (node.categories) await processCategories(node.categories, restaurantId, subcat.id);
            } else {
                let cat = categories.find(c => c.name.toLowerCase() === node.name.toLowerCase() && c.restaurantId === restaurantId);
                if (!cat) {
                    cat = await addCategory({ name: node.name, description: '', sortOrder: node.sortOrder, activeFlag: true, restaurantId: restaurantId });
                    stats.categoriesCreated++;
                }
                if (node.categories) await processCategories(node.categories, restaurantId, cat.id);
            }
        }
    };

    // Process restaurants and their categories
    for (const restCatInfo of payload.restaurantCategory) {
        let restaurant = restaurants.find(r => r.id === restCatInfo.restaurantId) || restaurants.find(r => r.name.toLowerCase() === restCatInfo.restaurantName.toLowerCase());
        if (!restaurant) {
            stats.restaurantsSkipped.push({ id: restCatInfo.restaurantId, name: restCatInfo.restaurantName });
            continue;
        }
        stats.restaurantsProcessed++;
        await processCategories(restCatInfo.categories, restaurant.id);
    }

    // Process modifiers (condiments) and items with corrected logic
    const condimentMap = new Map<string, SystemCondiment>(payload.condiments.map(c => [c.condimentCode, c]));
    const processedModifierGroupsCache = new Map<string, string>(); // Key: "restaurantId-condimentCode", Value: "modifierGroupId"

    for (const item of payload.items) {
        let restaurant = restaurants.find(r => r.id === item.restaurantId) || restaurants.find(r => r.name.toLowerCase() === item.restaurantName.toLowerCase());
        if (!restaurant) continue;

        let category = categories.find(c => c.name.toLowerCase() === item.category.toLowerCase() && c.restaurantId === restaurant!.id);
        if (!category) continue;

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
                    let group = modifierGroups.find(g =>
                        g.restaurantId === restaurant.id &&
                        g.name.toLowerCase() === condiment.condimentName.toLowerCase()
                    );

                    if (!group) {
                        const newGroup = await addModifierGroup({
                            name: condiment.condimentName,
                            restaurantId: restaurant.id,
                            minSelection: 0, // Default values
                            maxSelection: 1, // Default values
                        });
                        stats.modifierGroupsCreated++;

                        for (const condimentItem of condiment.condimentItems) {
                            await addModifierItem({
                                name: condimentItem.condimentItemName,
                                price: 0, // Default price
                                modifierGroupId: newGroup.id,
                            });
                            stats.modifierItemsCreated++;
                        }
                        group = newGroup;
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

        const existing = menuItems.find(i => i.itemCode === item.itemCode && i.categoryId === category!.id);
        const newItemData = {
            name: item.itemName,
            itemCode: item.itemCode,
            imageUrl: item.itemImage,
            price: item.itemPrice,
            categoryId: category.id,
            description: item.itemDescription,
            sortOrder: item.sortOrder,
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
    
    logAction(currentSessionUser || SUPERADMIN_USER, ActionType.CREATE, EntityType.MENU_ITEM, "System-wide", `Imported menu affecting ${stats.restaurantsProcessed} restaurants.`);
    
    return stats;
}

// --- Live Orders API ---
export const getLiveOrders = async (): Promise<LiveOrder[]> => {
    await delay(300);
    return JSON.parse(JSON.stringify(liveOrders.filter(o => o.status !== OrderStatus.COMPLETED)));
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<LiveOrder> => {
    await delay(200);
    const orderIndex = liveOrders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
        throw new Error("Order not found");
    }
    liveOrders[orderIndex].status = status;
    return JSON.parse(JSON.stringify(liveOrders[orderIndex]));
};
