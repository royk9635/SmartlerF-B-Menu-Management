import React from 'react';
import ReactDOM from 'react-dom/client';
import { QRCodeCanvas } from 'qrcode.react';

const { useState, useEffect, useCallback, useMemo, useRef } = React;

declare var XLSX: any;

// --- From types.ts ---
export var SpecialType;
(function (SpecialType) {
    SpecialType["NONE"] = "None";
    SpecialType["VEG"] = "Vegetarian";
    SpecialType["NON_VEG"] = "Non-Vegetarian";
    SpecialType["VEGAN"] = "Vegan";
    SpecialType["CHEF_SPECIAL"] = "Chef's Special";
})(SpecialType || (SpecialType = {}));
export var ImageOrientation;
(function (ImageOrientation) {
    ImageOrientation["LANDSCAPE"] = "16:9";
    ImageOrientation["PORTRAIT"] = "3:4";
    ImageOrientation["SQUARE"] = "1:1";
})(ImageOrientation || (ImageOrientation = {}));
// --- Attribute Types ---
export var AttributeType;
(function (AttributeType) {
    AttributeType["TEXT"] = "Text";
    AttributeType["NUMBER"] = "Number";
    AttributeType["BOOLEAN"] = "Checkbox";
    AttributeType["SELECT"] = "Dropdown";
})(AttributeType || (AttributeType = {}));
export var Currency;
(function (Currency) {
    Currency["USD"] = "USD";
    Currency["EUR"] = "EUR";
    Currency["GBP"] = "GBP";
    Currency["JPY"] = "JPY";
    Currency["INR"] = "INR";
})(Currency || (Currency = {}));
export var BulkAction;
(function (BulkAction) {
    BulkAction["ENABLE_ITEMS"] = "enable";
    BulkAction["DISABLE_ITEMS"] = "disable";
    BulkAction["MARK_SOLD_OUT"] = "sold_out";
    BulkAction["ENABLE_BOGO"] = "enable_bogo";
    BulkAction["DISABLE_BOGO"] = "disable_bogo";
    BulkAction["CHANGE_CURRENCY"] = "change_currency";
})(BulkAction || (BulkAction = {}));
// --- RBAC Types ---
export var UserRole;
(function (UserRole) {
    UserRole["SUPERADMIN"] = "Superadmin";
    UserRole["PROPERTY_ADMIN"] = "Property Admin";
})(UserRole || (UserRole = {}));
// --- Audit Log Types ---
export var ActionType;
(function (ActionType) {
    ActionType["CREATE"] = "Create";
    ActionType["UPDATE"] = "Update";
    ActionType["DELETE"] = "Delete";
})(ActionType || (ActionType = {}));
export var EntityType;
(function (EntityType) {
    EntityType["PROPERTY"] = "Property";
    EntityType["RESTAURANT"] = "Restaurant";
    EntityType["CATEGORY"] = "Category";
    EntityType["SUBCATEGORY"] = "Subcategory";
    EntityType["MENU_ITEM"] = "Menu Item";
    EntityType["USER"] = "User";
    EntityType["ATTRIBUTE"] = "Attribute";
    EntityType["ALLERGEN"] = "Allergen";
    EntityType["MODIFIER_GROUP"] = "Modifier Group";
    EntityType["MODIFIER_ITEM"] = "Modifier Item";
})(EntityType || (EntityType = {}));
// --- From types.ts (Live Orders) ---
export var OrderStatus;
(function (OrderStatus) {
    OrderStatus["NEW"] = "New";
    OrderStatus["PREPARING"] = "Preparing";
    OrderStatus["READY"] = "Ready";
    OrderStatus["COMPLETED"] = "Completed";
})(OrderStatus || (OrderStatus = {}));


// --- From services/mockApiService.ts ---
const api = (() => {
    // --- Mock Data Store ---

    let properties = [
        { id: 'prop-1', name: 'Grand Hotel Downtown', address: '123 Main St, Metropolis', tenantId: 'tenant-123' },
        { id: 'prop-2', name: 'Seaside Resort & Spa', address: '456 Ocean Ave, Coast City', tenantId: 'tenant-123' },
    ];

    let restaurants = [
        { id: 'rest-1', name: 'The Golden Spoon', propertyId: 'prop-1' },
        { id: 'rest-2', name: 'Azure Grill', propertyId: 'prop-1' },
        { id: 'rest-3', name: 'Beachside Cafe', propertyId: 'prop-2' },
    ];

    let categories = [
        { id: 'cat-1', name: 'Appetizers', description: 'Starters to whet your appetite', sortOrder: 1, activeFlag: true, restaurantId: 'rest-1' },
        { id: 'cat-2', name: 'Main Courses', description: 'Hearty and delicious main dishes', sortOrder: 2, activeFlag: true, restaurantId: 'rest-1' },
        { id: 'cat-3', name: 'Desserts', description: 'Sweet treats to end your meal', sortOrder: 3, activeFlag: true, restaurantId: 'rest-1' },
        { id: 'cat-4', name: 'Seafood Specials', description: 'Fresh from the ocean', sortOrder: 1, activeFlag: true, restaurantId: 'rest-2' },
        { id: 'cat-5', name: 'Light Bites', description: 'Snacks and small plates', sortOrder: 1, activeFlag: true, restaurantId: 'rest-3' },
    ];

    let subcategories = [
        { id: 'subcat-1', name: 'Soups', sortOrder: 1, categoryId: 'cat-1' },
        { id: 'subcat-2', name: 'Salads', sortOrder: 2, categoryId: 'cat-1' },
        { id: 'subcat-3', name: 'Steaks', sortOrder: 1, categoryId: 'cat-2' },
    ];

    let allergens = [
        { id: 'allergen-1', name: 'Gluten' },
        { id: 'allergen-2', name: 'Dairy' },
        { id: 'allergen-3', name: 'Nuts' },
        { id: 'allergen-4', name: 'Soy' },
        { id: 'allergen-5', name: 'Shellfish' },
    ];

    let attributes = [
        { id: 'attr-1', name: 'Spiciness', type: AttributeType.SELECT, options: ['Mild', 'Medium', 'Hot', 'Extra Hot'] },
        { id: 'attr-2', name: 'Serves', type: AttributeType.NUMBER },
        { id: 'attr-3', name: 'Is Gluten-Free', type: AttributeType.BOOLEAN },
    ];

    let modifierGroups = [
        { id: 'modgroup-1', name: 'Steak Temperature', restaurantId: 'rest-1', minSelection: 1, maxSelection: 1 },
        { id: 'modgroup-2', name: 'Salad Dressing', restaurantId: 'rest-1', minSelection: 0, maxSelection: 1 },
    ];

    let modifierItems = [
        { id: 'moditem-1', name: 'Rare', price: 0, modifierGroupId: 'modgroup-1' },
        { id: 'moditem-2', name: 'Medium Rare', price: 0, modifierGroupId: 'modgroup-1' },
        { id: 'moditem-3', name: 'Medium', price: 0, modifierGroupId: 'modgroup-1' },
        { id: 'moditem-4', name: 'Well Done', price: 0, modifierGroupId: 'modgroup-1' },
        { id: 'moditem-5', name: 'Vinaigrette', price: 0, modifierGroupId: 'modgroup-2' },
        { id: 'moditem-6', name: 'Ranch', price: 0, modifierGroupId: 'modgroup-2' },
        { id: 'moditem-7', name: 'Caesar', price: 1.5, modifierGroupId: 'modgroup-2' },
    ];

    let menuItems = [
        {
            id: 'item-1', name: 'Bruschetta', description: 'Grilled bread with tomatoes, garlic, and olive oil', price: 8.50, currency: Currency.USD,
            imageUrl: 'https://images.unsplash.com/photo-1505253716362-afb74b62f847?w=400', allergens: ['allergen-1'], categoryId: 'cat-1',
            availabilityFlag: true, tenantId: 'tenant-123', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), sortOrder: 1,
            itemCode: 'ITEM-001', soldOut: false, specialType: SpecialType.VEG, bogo: false, imageOrientation: ImageOrientation.LANDSCAPE,
            attributes: { 'attr-3': true },
        },
        {
            id: 'item-2', name: 'Caesar Salad', description: 'Romaine lettuce with Caesar dressing, croutons, and Parmesan cheese', price: 10.00, currency: Currency.USD,
            imageUrl: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400', allergens: ['allergen-1', 'allergen-2'], categoryId: 'cat-1', subCategoryId: 'subcat-2',
            availabilityFlag: true, tenantId: 'tenant-123', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), sortOrder: 2,
            itemCode: 'ITEM-002', soldOut: false, specialType: SpecialType.NONE, bogo: true, imageOrientation: ImageOrientation.SQUARE
        },
        {
            id: 'item-3', name: 'Filet Mignon', description: '8oz center-cut tenderloin, grilled to perfection', price: 35.00, currency: Currency.USD,
            imageUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c7373094?w=400', allergens: [], categoryId: 'cat-2', subCategoryId: 'subcat-3',
            availabilityFlag: true, tenantId: 'tenant-123', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), sortOrder: 1,
            itemCode: 'ITEM-003', soldOut: false, specialType: SpecialType.NON_VEG, bogo: false, imageOrientation: ImageOrientation.LANDSCAPE,
            modifierGroupIds: ['modgroup-1'],
        },
        {
            id: 'item-4', name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with a molten center, served with vanilla ice cream', price: 9.00, currency: Currency.USD,
            imageUrl: 'https://images.unsplash.com/photo-1586985289936-e04c356a8c65?w=400', allergens: ['allergen-1', 'allergen-2'], categoryId: 'cat-3',
            availabilityFlag: true, tenantId: 'tenant-123', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), sortOrder: 1,
            itemCode: 'ITEM-004', soldOut: true, specialType: SpecialType.VEG, bogo: false, imageOrientation: ImageOrientation.PORTRAIT
        },
        {
            id: 'item-5', name: 'Grilled Salmon', description: 'Fresh Atlantic salmon with a lemon-dill sauce', price: 28.00, currency: Currency.EUR,
            imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400', allergens: [], categoryId: 'cat-4',
            availabilityFlag: true, tenantId: 'tenant-123', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), sortOrder: 1,
            itemCode: 'ITEM-005', soldOut: false, specialType: SpecialType.CHEF_SPECIAL, bogo: false, imageOrientation: ImageOrientation.LANDSCAPE
        },
    ];

    let users = [
        { id: 'user-1', name: 'Alice Super', email: 'super@smartler.com', role: UserRole.SUPERADMIN, password: 'password' },
        { id: 'user-2', name: 'John Doe', email: 'john.doe@grandhotel.com', role: UserRole.PROPERTY_ADMIN, propertyId: 'prop-1', password: 'password' },
    ];

    let sales = [];
    let auditLogs = [];
    let liveOrders = [];

    // Helper to simulate network delay
    const delay = (ms) => new Promise(res => setTimeout(res, ms));

    // Helper to generate IDs
    const generateId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Helper to create audit log
    const logAction = (user, actionType, entityType, entityName, details) => {
        const log = {
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

    // --- Mock Session Management ---
    let currentSessionUser = null;
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

        for (let d = new Date(twoMonthsAgo); d <= today; d.setDate(d.getDate() + 1)) {
            if (Math.random() > 0.1) { // 90% chance of sales on a given day
                const numSales = Math.floor(Math.random() * 20) + 5;
                for (let i = 0; i < numSales; i++) {
                    const restaurant = restaurants[Math.floor(Math.random() * restaurants.length)];
                    const restaurantItems = menuItems.filter(item => categories.find(c => c.id === item.categoryId)?.restaurantId === restaurant.id);
                    if (restaurantItems.length === 0) continue;

                    const numItemsInSale = Math.floor(Math.random() * 5) + 1;
                    let saleItems = [];
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
        let orderItems = [];
        let totalAmount = 0;

        for (let i = 0; i < numItemsInOrder; i++) {
            const menuItem = restaurantItems[Math.floor(Math.random() * restaurantItems.length)];
            const quantity = Math.floor(Math.random() * 2) + 1;
            orderItems.push({ menuItemId: menuItem.id, quantity, price: menuItem.price });
            totalAmount += menuItem.price * quantity;
        }

        const newOrder = {
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
    const login = async (email, password) => {
        await delay(500);
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        if (user) {
            currentSessionUser = { ...user };
            delete currentSessionUser.password;
            return currentSessionUser;
        }
        throw new Error('Invalid email or password.');
    };

    const logout = async () => {
        await delay(200);
        currentSessionUser = null;
    };

    const getCurrentUser = async () => {
        await delay(100);
        if (currentSessionUser) {
            return currentSessionUser;
        }
        throw new Error('No active session.');
    };

    // Properties
    const getProperties = async (tenantId) => {
        await delay(300);
        return JSON.parse(JSON.stringify(properties));
    };

    const addProperty = async (data) => {
        await delay(200);
        const newProperty = { ...data, id: generateId('prop'), tenantId: 'tenant-123' };
        properties.push(newProperty);
        logAction(currentSessionUser || SUPERADMIN_USER, ActionType.CREATE, EntityType.PROPERTY, newProperty.name, `Created new property.`);
        return newProperty;
    };

    const updateProperty = async (data) => {
        await delay(200);
        const index = properties.findIndex(p => p.id === data.id);
        if (index === -1) throw new Error('Property not found');
        properties[index] = data;
        logAction(currentSessionUser || SUPERADMIN_USER, ActionType.UPDATE, EntityType.PROPERTY, data.name, `Updated property details.`);
        return data;
    };

    const deleteProperty = async (id) => {
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
    };

    // Restaurants
    const getAllRestaurants = async () => {
        await delay(200);
        return JSON.parse(JSON.stringify(restaurants));
    };

    const addRestaurant = async (data) => {
        await delay(200);
        const newRestaurant = { ...data, id: generateId('rest') };
        restaurants.push(newRestaurant);
        logAction(currentSessionUser || SUPERADMIN_USER, ActionType.CREATE, EntityType.RESTAURANT, newRestaurant.name, `Created new restaurant.`);
        return newRestaurant;
    };

    const updateRestaurant = async (data) => {
        await delay(200);
        const index = restaurants.findIndex(r => r.id === data.id);
        if (index === -1) throw new Error('Restaurant not found');
        restaurants[index] = data;
        logAction(currentSessionUser || SUPERADMIN_USER, ActionType.UPDATE, EntityType.RESTAURANT, data.name, `Updated restaurant details.`);
        return data;
    };

    const deleteRestaurant = async (id) => {
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
    };

    // Categories & Subcategories
    const getCategories = async (restaurantId) => {
        await delay(300);
        return JSON.parse(JSON.stringify(categories.filter(c => c.restaurantId === restaurantId).sort((a,b) => a.sortOrder - b.sortOrder)));
    };

    const getAllCategories = async () => {
        await delay(100);
        return JSON.parse(JSON.stringify(categories));
    }

    const addCategory = async (data) => {
        await delay(200);
        const newCategory = { ...data, id: generateId('cat') };
        categories.push(newCategory);
        logAction(currentSessionUser || SUPERADMIN_USER, ActionType.CREATE, EntityType.CATEGORY, newCategory.name, `Created new category.`);
        return newCategory;
    };

    const updateCategory = async (data) => {
        await delay(100);
        const index = categories.findIndex(c => c.id === data.id);
        if (index === -1) throw new Error('Category not found');
        categories[index] = data;
         logAction(currentSessionUser || SUPERADMIN_USER, ActionType.UPDATE, EntityType.CATEGORY, data.name, `Updated category details.`);
        return data;
    };

    const deleteCategory = async (id) => {
        await delay(400);
        const cat = categories.find(c => c.id === id);
        if (!cat) return;
        categories = categories.filter(c => c.id !== id);
        subcategories = subcategories.filter(sc => sc.categoryId !== id);
        menuItems = menuItems.filter(i => i.categoryId !== id);
        logAction(currentSessionUser || SUPERADMIN_USER, ActionType.DELETE, EntityType.CATEGORY, cat.name, `Deleted category and its items.`);
    };

    const getSubCategories = async (categoryId) => {
        await delay(200);
        return JSON.parse(JSON.stringify(subcategories.filter(sc => sc.categoryId === categoryId).sort((a,b) => a.sortOrder - b.sortOrder)));
    };

    const addSubCategory = async (data) => {
        await delay(200);
        const newSubCategory = { ...data, id: generateId('subcat') };
        subcategories.push(newSubCategory);
        logAction(currentSessionUser || SUPERADMIN_USER, ActionType.CREATE, EntityType.SUBCATEGORY, newSubCategory.name, `Created new subcategory.`);
        return newSubCategory;
    };

    const updateSubCategory = async (data) => {
        await delay(100);
        const index = subcategories.findIndex(sc => sc.id === data.id);
        if (index === -1) throw new Error('Subcategory not found');
        subcategories[index] = data;
        logAction(currentSessionUser || SUPERADMIN_USER, ActionType.UPDATE, EntityType.SUBCATEGORY, data.name, `Updated subcategory details.`);
        return data;
    };

    const deleteSubCategory = async (id) => {
        await delay(400);
        const subcat = subcategories.find(sc => sc.id === id);
        if (!subcat) return;
        subcategories = subcategories.filter(sc => sc.id !== id);
        menuItems = menuItems.filter(i => i.subCategoryId !== id);
         logAction(currentSessionUser || SUPERADMIN_USER, ActionType.DELETE, EntityType.SUBCATEGORY, subcat.name, `Deleted subcategory and its items.`);
    };

    // Menu Items
    const getMenuItems = async (tenantId, categoryId, subCategoryId) => {
        await delay(400);
        let items = menuItems.filter(item => item.categoryId === categoryId);
        if (subCategoryId) {
            items = items.filter(item => item.subCategoryId === subCategoryId);
        } else {
            items = items.filter(item => !item.subCategoryId);
        }
        return JSON.parse(JSON.stringify(items.sort((a,b) => a.sortOrder - b.sortOrder)));
    };

    const getAllMenuItems = async() => {
        await delay(200);
        return JSON.parse(JSON.stringify(menuItems));
    }

    const addMenuItem = async (data) => {
        await delay(200);
        const newItem = {
            ...data,
            id: generateId('item'),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        menuItems.push(newItem);
        logAction(currentSessionUser || SUPERADMIN_USER, ActionType.CREATE, EntityType.MENU_ITEM, newItem.name, `Created new menu item.`);
        return newItem;
    };

    const updateMenuItem = async (data) => {
        await delay(100);
        const index = menuItems.findIndex(i => i.id === data.id);
        if (index === -1) throw new Error('Menu item not found');
        menuItems[index] = { ...data, updatedAt: new Date().toISOString() };
        logAction(currentSessionUser || SUPERADMIN_USER, ActionType.UPDATE, EntityType.MENU_ITEM, data.name, `Updated menu item details.`);
        return menuItems[index];
    };

    const deleteMenuItem = async (id) => {
        await delay(200);
        const item = menuItems.find(i => i.id === id);
        if (!item) return;
        menuItems = menuItems.filter(i => i.id !== id);
        logAction(currentSessionUser || SUPERADMIN_USER, ActionType.DELETE, EntityType.MENU_ITEM, item.name, `Deleted menu item.`);
    };

    const updateMenuItemsBatch = async (itemIds, changes) => {
        await delay(500);
        menuItems = menuItems.map(item => {
            if (itemIds.includes(item.id)) {
                return Object.assign({}, item, changes, { updatedAt: new Date().toISOString() });
            }
            return item;
        });
        logAction(currentSessionUser || SUPERADMIN_USER, ActionType.UPDATE, EntityType.MENU_ITEM, `${itemIds.length} items`, `Performed bulk update.`);
    };

    // Public Menu
    const getPublicMenuData = async (restaurantId) => {
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
    const getSales = async (startDate, endDate) => {
        await delay(600);
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();
        return JSON.parse(JSON.stringify(sales.filter(s => {
            const saleTime = new Date(s.saleDate).getTime();
            return saleTime >= start && saleTime <= end;
        })));
    };

    // Users
    const getUsers = async () => {
        await delay(300);
        return JSON.parse(JSON.stringify(users.map(u => {
            const userCopy = {...u};
            delete userCopy.password;
            return userCopy;
        })));
    };

    const addUser = async (data) => {
        await delay(200);
        if (users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
            throw new Error("A user with this email already exists.");
        }
        const newUser = { ...data, id: generateId('user'), password: 'password' }; // Set a default password
        users.push(newUser);
        logAction(currentSessionUser || SUPERADMIN_USER, ActionType.CREATE, EntityType.USER, newUser.name, `Created new user.`);
        const userCopy = {...newUser};
        delete userCopy.password;
        return userCopy;
    };

    const updateUser = async (data) => {
        await delay(200);
        const index = users.findIndex(u => u.id === data.id);
        if (index === -1) throw new Error('User not found');
        users[index] = { ...users[index], ...data };
        logAction(currentSessionUser || SUPERADMIN_USER, ActionType.UPDATE, EntityType.USER, data.name, `Updated user details.`);
        const userCopy = {...users[index]};
        delete userCopy.password;
        return userCopy;
    };

    const deleteUser = async (id) => {
        await delay(200);
        const user = users.find(u => u.id === id);
        if (!user) return;
        if (id === 'user-1' || (currentSessionUser && id === currentSessionUser.id)) {
            throw new Error("Cannot delete the main superadmin or your own account.");
        }
        users = users.filter(u => u.id !== id);
        logAction(currentSessionUser || SUPERADMIN_USER, ActionType.DELETE, EntityType.USER, user.name, `Deleted user account.`);
    };

    // Audit Log
    const getAuditLogs = async (filters) => {
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
    const getAttributes = async () => {
        await delay(200);
        return JSON.parse(JSON.stringify(attributes));
    };
    const addAttribute = async (data) => {
        await delay(200);
        const newAttr = { ...data, id: generateId('attr') };
        attributes.push(newAttr);
        logAction(currentSessionUser || SUPERADMIN_USER, ActionType.CREATE, EntityType.ATTRIBUTE, newAttr.name, `Created new attribute.`);
        return newAttr;
    };
    const updateAttribute = async (data) => {
        await delay(200);
        const index = attributes.findIndex(a => a.id === data.id);
        if (index === -1) throw new Error('Attribute not found');
        attributes[index] = data;
        logAction(currentSessionUser || SUPERADMIN_USER, ActionType.UPDATE, EntityType.ATTRIBUTE, data.name, `Updated attribute.`);
        return data;
    };
    const deleteAttribute = async (id) => {
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
    const getAllergens = async () => {
        await delay(200);
        return JSON.parse(JSON.stringify(allergens));
    };
    const addAllergen = async (data) => {
        await delay(200);
        const newAllergen = { ...data, id: generateId('allergen') };
        allergens.push(newAllergen);
        logAction(currentSessionUser || SUPERADMIN_USER, ActionType.CREATE, EntityType.ALLERGEN, newAllergen.name, `Created new allergen.`);
        return newAllergen;
    };
    const updateAllergen = async (data) => {
        await delay(200);
        const index = allergens.findIndex(a => a.id === data.id);
        if (index === -1) throw new Error('Allergen not found');
        allergens[index] = data;
        logAction(currentSessionUser || SUPERADMIN_USER, ActionType.UPDATE, EntityType.ALLERGEN, data.name, `Updated allergen.`);
        return data;
    };
    const deleteAllergen = async (id) => {
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
    const getModifierGroups = async (restaurantId) => {
        await delay(300);
        return JSON.parse(JSON.stringify(modifierGroups.filter(g => g.restaurantId === restaurantId)));
    };
    const getModifierItems = async (groupId) => {
        await delay(200);
        return JSON.parse(JSON.stringify(modifierItems.filter(i => i.modifierGroupId === groupId)));
    };
    const addModifierGroup = async (data) => {
        await delay(200);
        const newGroup = { ...data, id: generateId('modgroup') };
        modifierGroups.push(newGroup);
        logAction(currentSessionUser || SUPERADMIN_USER, ActionType.CREATE, EntityType.MODIFIER_GROUP, newGroup.name, `Created modifier group.`);
        return newGroup;
    };
    const updateModifierGroup = async (data) => {
        await delay(200);
        const index = modifierGroups.findIndex(g => g.id === data.id);
        if (index === -1) throw new Error('Modifier group not found');
        modifierGroups[index] = data;
        logAction(currentSessionUser || SUPERADMIN_USER, ActionType.UPDATE, EntityType.MODIFIER_GROUP, data.name, `Updated modifier group.`);
        return data;
    };
    const deleteModifierGroup = async (id) => {
        await delay(300);
        const group = modifierGroups.find(g => g.id === id);
        if (!group) return;
        modifierGroups = modifierGroups.filter(g => g.id !== id);
        modifierItems = modifierItems.filter(i => i.modifierGroupId !== id);
        menuItems.forEach(item => {
            if (item.modifierGroupIds) {
                item.modifierGroupIds = item.modifierGroupIds.filter(groupId => groupId !== id);
            }
        });
        logAction(currentSessionUser || SUPERADMIN_USER, ActionType.DELETE, EntityType.MODIFIER_GROUP, group.name, `Deleted modifier group.`);
    };
    const addModifierItem = async (data) => {
        await delay(200);
        const newItem = { ...data, id: generateId('moditem') };
        modifierItems.push(newItem);
        logAction(currentSessionUser || SUPERADMIN_USER, ActionType.CREATE, EntityType.MODIFIER_ITEM, newItem.name, `Created modifier item.`);
        return newItem;
    };
    const updateModifierItem = async (data) => {
        await delay(200);
        const index = modifierItems.findIndex(i => i.id === data.id);
        if (index === -1) throw new Error('Modifier item not found');
        modifierItems[index] = data;
        logAction(currentSessionUser || SUPERADMIN_USER, ActionType.UPDATE, EntityType.MODIFIER_ITEM, data.name, `Updated modifier item.`);
        return data;
    };
    const deleteModifierItem = async (id) => {
        await delay(200);
        const item = modifierItems.find(i => i.id === id);
        if (!item) return;
        modifierItems = modifierItems.filter(i => i.id !== id);
        logAction(currentSessionUser || SUPERADMIN_USER, ActionType.DELETE, EntityType.MODIFIER_ITEM, item.name, `Deleted modifier item.`);
    };


    // Import/Export
    const importMenuFromJson = async (jsonString, restaurantId) => {
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

            const processItems = async (itemsList, categoryId, subCategoryId) => {
                for (const itemData of itemsList) {
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
                await processItems(catData.items, category.id, undefined);
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


    const importSystemMenuFromJson = async (jsonString) => {
        await delay(2000);
        const payload = JSON.parse(jsonString);
        const stats = {
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

        const processCategories = async (nodes, restaurantId, parentCategoryId) => {
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

        for (const restCatInfo of payload.restaurantCategory) {
            let restaurant = restaurants.find(r => r.id === restCatInfo.restaurantId) || restaurants.find(r => r.name.toLowerCase() === restCatInfo.restaurantName.toLowerCase());
            if (!restaurant) {
                stats.restaurantsSkipped.push({ id: restCatInfo.restaurantId, name: restCatInfo.restaurantName });
                continue;
            }
            stats.restaurantsProcessed++;
            await processCategories(restCatInfo.categories, restaurant.id, undefined);
        }

        const condimentMap = new Map(payload.condiments.map(c => [c.condimentCode, c]));
        const processedModifierGroupsCache = new Map();

        for (const item of payload.items) {
            let restaurant = restaurants.find(r => r.id === item.restaurantId) || restaurants.find(r => r.name.toLowerCase() === item.restaurantName.toLowerCase());
            if (!restaurant) continue;

            let category = categories.find(c => c.name.toLowerCase() === item.category.toLowerCase() && c.restaurantId === restaurant.id);
            if (!category) continue;
            
            const itemModifierGroupIds = [];
            if (item.condimentCodes) {
                const codes = item.condimentCodes.split(',').map(c => c.trim()).filter(Boolean);
                for (const code of codes) {
                    const groupKey = `${restaurant.id}-${code}`;

                    if (processedModifierGroupsCache.has(groupKey)) {
                        const groupId = processedModifierGroupsCache.get(groupKey);
                        if (groupId && !itemModifierGroupIds.includes(groupId)) {
                          itemModifierGroupIds.push(groupId);
                        }
                        continue;
                    }

                    const condiment = condimentMap.get(code);
                    if (condiment) {
                        let group = modifierGroups.find(g =>
                            g.restaurantId === restaurant.id &&
                            g.name.toLowerCase() === (condiment as any).condimentName.toLowerCase()
                        );

                        if (!group) {
                            const newGroup = await addModifierGroup({
                                name: (condiment as any).condimentName,
                                restaurantId: restaurant.id,
                                minSelection: 0,
                                maxSelection: 1,
                            });
                            stats.modifierGroupsCreated++;

                            for (const condimentItem of (condiment as any).condimentItems || []) {
                                await addModifierItem({
                                    name: condimentItem.condimentItemName,
                                    price: 0,
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

            const existing = menuItems.find(i => i.itemCode === item.itemCode && category && i.categoryId === category.id);
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
    const getLiveOrders = async () => {
        await delay(300);
        return JSON.parse(JSON.stringify(liveOrders.filter(o => o.status !== OrderStatus.COMPLETED)));
    };

    const updateOrderStatus = async (orderId, status) => {
        await delay(200);
        const orderIndex = liveOrders.findIndex(o => o.id === orderId);
        if (orderIndex === -1) {
            throw new Error("Order not found");
        }
        liveOrders[orderIndex].status = status;
        return JSON.parse(JSON.stringify(liveOrders[orderIndex]));
    };

    return {
        login, logout, getCurrentUser, getProperties, addProperty, updateProperty, deleteProperty, getAllRestaurants, addRestaurant, updateRestaurant, deleteRestaurant,
        getCategories, getAllCategories, addCategory, updateCategory, deleteCategory, getSubCategories, addSubCategory, updateSubCategory, deleteSubCategory,
        getMenuItems, getAllMenuItems, addMenuItem, updateMenuItem, deleteMenuItem, updateMenuItemsBatch, getPublicMenuData, getSales, getUsers, addUser, updateUser,
        deleteUser, getAuditLogs, getAttributes, addAttribute, updateAttribute, deleteAttribute, getAllergens, addAllergen, updateAllergen, deleteAllergen,
        getModifierGroups, getModifierItems, addModifierGroup, updateModifierGroup, deleteModifierGroup, addModifierItem, updateModifierItem, deleteModifierItem,
        importMenuFromJson, importSystemMenuFromJson,
        getLiveOrders, updateOrderStatus
    };
})();

// ==========================================================================================
// --- COMPONENTS ---
// ==========================================================================================

// --- From components/Icons.tsx ---

const PlusIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
    </svg>
);

const PencilIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
    </svg>
);

const TrashIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const EyeIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const ArrowLeftIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

const XIcon = ({ className }) => (
     <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const PlusCircleIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const DownloadIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const DragHandleIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const WarningIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

const SearchIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const QRIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h-1m-1 0H9m12 0h-1m-4 0h-1m-1 0H9m12 0h-1M4 12H3m1 0h1m4 0h1m1 0h4m1 0h1m-1 0h1m4 0h1m-1 0h1M4 20v-1m0-1v-4m0-1v-1m0 0v-1m16 8v-1m0-1v-4m0-1v-1m0 0v-1M4 4h1v1H4V4zm1 1V4m0 1h1V4m-1 8h1v1H5v-1zm1 1v-1m0 1h1v-1m-1 8h1v1H5v-1zm1 1v-1m0 1h1v-1M16 4h1v1h-1V4zm1 1V4m0 1h1V4m-1 8h1v1h-1v-1zm1 1v-1m0 1h1v-1" />
    </svg>
);

const UploadIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

const LoadingSpinnerIcon = ({ className }) => (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const SubcategoriesIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
);

const ChevronDownIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);

const ChevronUpIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
    </svg>
);

const AnalyticsIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

const DocumentReportIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const ChevronLeftIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
);

const ChevronRightIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
);

const InfoIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const UsersIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A4 4 0 015 11.146M9 18h6" />
    </svg>
);

const DisplayIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

const AuditLogIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
);

const TagIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.53 0 1.04.21 1.41.59l7 7a2 2 0 010 2.82l-5 5a2 2 0 01-2.82 0l-7-7A2 2 0 013 8V3a2 2 0 012-2h2z" />
    </svg>
);

const AdjustmentsIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8v-2m0 2a2 2 0 100 4m0-4a2 2 0 110 4m0-4v-2m0 2a2 2 0 100 4m0-4a2 2 0 110 4m6-14v-2m0 2a2 2 0 100 4m0-4a2 2 0 110 4m0 0v-2" />
    </svg>
);

const PreviewIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const ServerStackIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
    </svg>
);

const CheckCircleIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const XCircleIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const BellIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);

// --- From components/LoadingSpinner.tsx ---
const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center space-y-2">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        <p className="text-slate-600">Loading...</p>
    </div>
);

// --- From components/Toast.tsx ---
const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    const icon = type === 'success' ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
    ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );

    return (
        <div className={`fixed top-5 right-5 z-50 flex items-center p-4 rounded-lg shadow-lg text-white ${bgColor}`}>
            {icon}
            <p className="ml-3 font-medium">{message}</p>
            <button onClick={onClose} className="ml-4 -mr-2 p-1 rounded-md hover:bg-white hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
};

// --- From components/ToggleSwitch.tsx ---
const ToggleSwitch = ({ checked, onChange, disabled = false }) => {
    const handleToggle = () => {
        if (!disabled) {
            onChange(!checked);
        }
    };

    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={handleToggle}
            disabled={disabled}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                checked ? 'bg-primary-600' : 'bg-slate-200'
            } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        >
            <span
                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${
                    checked ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
        </button>
    );
};

// --- From components/StatCard.tsx ---
const StatCard = ({ title, value, description }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 flex flex-col justify-between">
            <div>
                <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</h4>
                <p className="text-4xl font-bold text-slate-800 mt-2">{value}</p>
            </div>
            {description && <p className="text-sm text-slate-400 mt-4">{description}</p>}
        </div>
    );
};

// --- From components/CategoryBarChart.tsx ---
const CategoryBarChart = ({ data }: { data: {name: string, count: number}[] }) => {
    const maxCount = Math.max(...data.map(d => d.count), 0);
    const chartHeight = 300;
    const barWidth = 35;
    const barMargin = 15;
    const chartWidth = data.length * (barWidth + barMargin);

    return (
        <div className="w-full overflow-x-auto">
            <svg width={chartWidth} height={chartHeight} aria-label="Category Item Count Bar Chart">
                <g className="bars">
                    {data.map((d, i) => {
                        const barHeight = maxCount > 0 ? (d.count / maxCount) * (chartHeight - 40) : 0;
                        const x = i * (barWidth + barMargin);
                        const y = chartHeight - barHeight - 20;
                        return (
                            <g key={String(d.name)}>
                                <rect
                                    x={x}
                                    y={y}
                                    width={barWidth}
                                    height={barHeight}
                                    className="fill-primary-500 hover:fill-primary-600 transition-colors"
                                    rx="4"
                                    ry="4"
                                >
                                  <title>{`${d.name || ''}: ${d.count || 0} items`}</title>
                                </rect>
                                <text
                                    x={x + barWidth / 2}
                                    y={y - 5}
                                    textAnchor="middle"
                                    className="text-xs font-semibold fill-slate-700"
                                >
                                    {d.count}
                                </text>
                            </g>
                        );
                    })}
                </g>
                <g className="labels">
                    {data.map((d, i) => (
                        <text
                            key={String(d.name)}
                            x={i * (barWidth + barMargin) + barWidth / 2}
                            y={chartHeight - 5}
                            textAnchor="middle"
                            className="text-xs fill-slate-500"
                        >
                            {d.name?.length > 10 ? `${d.name.substring(0, 8)}..` : d.name}
                        </text>
                    ))}
                </g>
            </svg>
        </div>
    );
};

// --- From components/SpecialTypesBarChart.tsx ---
const SpecialTypesBarChart = ({ data }: { data: {name: string, count: number}[] }) => {
    const maxCount = Math.max(...data.map(d => d.count), 0);
    const chartHeight = 300;
    const barWidth = 35;
    const barMargin = 15;
    const chartWidth = data.length * (barWidth + barMargin);
    
    // Consistent color mapping for special types
    const colorMap = {
        'Vegetarian': 'fill-emerald-500',
        'Non-Vegetarian': 'fill-rose-500',
        'Vegan': 'fill-lime-500',
        "Chef's Special": 'fill-amber-500',
        'None': 'fill-slate-400',
    };

    return (
        <div className="w-full overflow-x-auto">
            <svg width={chartWidth} height={chartHeight} aria-label="Special Types Bar Chart">
                 <g className="bars">
                    {data.map((d, i) => {
                        const barHeight = maxCount > 0 ? (Number(d.count) / maxCount) * (chartHeight - 40) : 0;
                        const x = i * (barWidth + barMargin);
                        const y = chartHeight - barHeight - 20;
                        const colorClass = colorMap[d.name] || 'fill-sky-500';
                        return (
                            <g key={String(d.name)}>
                                <rect
                                    x={x}
                                    y={y}
                                    width={barWidth}
                                    height={barHeight}
                                    className={`${colorClass} transition-opacity hover:opacity-80`}
                                    rx="4"
                                    ry="4"
                                >
                                  <title>{`${d.name || ''}: ${d.count || 0} items`}</title>
                                </rect>
                                <text
                                    x={x + barWidth / 2}
                                    y={y - 5}
                                    textAnchor="middle"
                                    className="text-xs font-semibold fill-slate-700"
                                >
                                    {d.count}
                                </text>
                            </g>
                        );
                    })}
                </g>
                <g className="labels">
                    {data.map((d, i) => (
                        <text
                            key={String(d.name)}
                            x={i * (barWidth + barMargin) + barWidth / 2}
                            y={chartHeight - 5}
                            textAnchor="middle"
                            className="text-xs fill-slate-500"
                        >
                             {d.name?.length > 10 ? `${d.name.substring(0, 8)}..` : d.name}
                        </text>
                    ))}
                </g>
            </svg>
        </div>
    );
};

// --- From components/DailyRevenueBarChart.tsx ---
const DailyRevenueBarChart = ({ data, daysInMonth }: { data: {day: number, total: number}[], daysInMonth: number }) => {
    const dataMap = new Map(data.map(d => [d.day, d.total]));
    const maxRevenue = Math.max(...data.map(d => d.total), 0);
    
    const chartHeight = 250;
    const chartWidth = 900; // Fixed width, bars will adjust
    const barMargin = 4;
    const barWidth = (chartWidth - (daysInMonth - 1) * barMargin) / daysInMonth;

    const allDaysData = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        return {
            day,
            total: dataMap.get(day) || 0,
        };
    });

    return (
        <div className="w-full overflow-x-auto p-2 bg-slate-50 rounded-lg">
            <svg width={chartWidth} height={chartHeight} aria-label="Daily Revenue Bar Chart">
                <g className="bars">
                    {allDaysData.map((d, i) => {
                        const barHeight = maxRevenue > 0 ? (d.total / maxRevenue) * (chartHeight - 30) : 0;
                        const x = i * (barWidth + barMargin);
                        const y = chartHeight - barHeight - 20;
                        
                        return (
                            <g key={String(d.day)}>
                                <rect
                                    x={x}
                                    y={y}
                                    width={barWidth}
                                    height={barHeight}
                                    className="fill-primary-400 hover:fill-primary-500 transition-colors"
                                    rx="2"
                                    ry="2"
                                >
                                    <title>{`Day ${d.day}: $${Number(d.total).toFixed(2)}`}</title>
                                </rect>
                            </g>
                        );
                    })}
                </g>
                <g className="labels">
                    {allDaysData.map((d, i) => {
                        if ((d.day - 1) % 2 === 0) { // Show label for every other day to avoid clutter
                            return (
                                <text
                                    key={String(d.day)}
                                    x={i * (barWidth + barMargin) + barWidth / 2}
                                    y={chartHeight - 5}
                                    textAnchor="middle"
                                    className="text-xs fill-slate-500"
                                >
                                    {d.day}
                                </text>
                            );
                        }
                        return null;
                    })}
                </g>
            </svg>
        </div>
    );
};

// --- From components/DigitalMenuPage.tsx ---
const DigitalMenuPage = ({ restaurantId }: { restaurantId: string }) => {
    const [menuData, setMenuData] = useState<PublicMenu | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            const data = await api.getPublicMenuData(restaurantId);
            setMenuData(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load menu data.');
        } finally {
            setLoading(false);
        }
    }, [restaurantId]);

    useEffect(() => {
        fetchData(); // Initial fetch
        const intervalId = setInterval(fetchData, 30000); // Poll every 30 seconds
        return () => clearInterval(intervalId); // Cleanup on unmount
    }, [fetchData]);
    
    const SpecialTypeBadge = ({ type }) => {
        if (type === SpecialType.NONE) return null;

        const styles = {
            [SpecialType.VEG]: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
            [SpecialType.VEGAN]: { bg: 'bg-lime-100', text: 'text-lime-800', border: 'border-lime-300' },
            [SpecialType.NON_VEG]: { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300' },
            [SpecialType.CHEF_SPECIAL]: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
        };

        const style = styles[type];
        if (!style) return null;

        return (
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${style.bg} ${style.text} ${style.border}`}>
                {type}
            </span>
        );
    };

    const MenuItemDisplay = ({ item, style }) => {
        return (
            <div 
                style={style} 
                className="opacity-0 fade-in transition-all duration-300 hover:scale-[1.03] hover:shadow-lg rounded-lg p-3 -m-3 hover:bg-slate-50 cursor-pointer"
            >
                <div className="flex justify-between items-start gap-4">
                    <div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h4 className="text-2xl font-bold text-slate-900">{item.name}</h4>
                            {item.specialType && <SpecialTypeBadge type={item.specialType} />}
                        </div>
                        {item.bogo && <p className="text-xs font-bold uppercase tracking-wider text-cyan-600">Buy One Get One</p>}
                        <p className="text-slate-600 mt-1">{item.description}</p>
                    </div>
                    <p className="text-2xl font-bold text-primary-600 whitespace-nowrap">{Number(item.price).toFixed(2)}</p>
                </div>
            </div>
        );
    };


    if (loading) {
        return (
            <div className="bg-white min-h-screen w-full flex flex-col items-center justify-center text-slate-800">
                <LoadingSpinner />
                <p className="mt-4 text-xl">Loading Menu...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-rose-50 min-h-screen w-full flex flex-col items-center justify-center text-rose-900 p-8">
                <h1 className="text-3xl font-bold">Error Loading Menu</h1>
                <p className="mt-2 text-rose-700">{error}</p>
                <p className="mt-4 text-sm text-rose-600">The display will attempt to reload automatically.</p>
            </div>
        );
    }

    if (!menuData) {
        return null;
    }
    
    // Split categories into two columns for display
    const midpoint = Math.ceil(menuData.categories.length / 2);
    const column1Categories = menuData.categories.slice(0, midpoint);
    const column2Categories = menuData.categories.slice(midpoint);

    const animationStyles = `
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .fade-in-up {
            animation: fadeInUp 0.6s ease-out forwards;
        }
        .fade-in {
            animation: fadeIn 0.5s ease-out forwards;
        }
    `;

    return (
        <div className="bg-white min-h-screen font-sans text-slate-800 p-8">
            <style>{animationStyles}</style>
            <header className="text-center mb-12 opacity-0 fade-in-up" style={{ animationDelay: '0ms' }}>
                <h1 className="text-6xl font-bold tracking-tight text-slate-900">{menuData.restaurant.name}</h1>
            </header>
            <main className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                {/* Column 1 */}
                <div className="space-y-10">
                    {column1Categories.map((category, catIndex) => {
                        const categoryDelay = 200 + (catIndex * 250);
                        let itemCounter = 0;
                        return (
                            <section key={category.id} aria-labelledby={`category-${category.id}`} className="opacity-0 fade-in-up" style={{ animationDelay: `${categoryDelay}ms` }}>
                                <h2 id={`category-${category.id}`} className="text-4xl font-bold text-slate-900 border-b-2 border-slate-200 pb-2 mb-6">{category.name}</h2>
                                <div className="space-y-6">
                                    {category.items.map(item => <MenuItemDisplay key={item.id} item={item} style={{ animationDelay: `${categoryDelay + (++itemCounter * 80)}ms` }} />)}
                                    {category.subcategories.map(subcat => {
                                        const subcatDelay = categoryDelay + (++itemCounter * 80);
                                        return(
                                            <div key={subcat.id} className="opacity-0 fade-in-up" style={{ animationDelay: `${subcatDelay}ms` }}>
                                                <h3 className="text-2xl font-semibold text-slate-700 mt-8 mb-4">{subcat.name}</h3>
                                                <div className="space-y-6 pl-4 border-l-2 border-slate-200">
                                                    {subcat.items.map(item => <MenuItemDisplay key={item.id} item={item} style={{ animationDelay: `${subcatDelay + (++itemCounter * 80)}ms` }} />)}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </section>
                        )
                    })}
                </div>
                {/* Column 2 */}
                <div className="space-y-10">
                     {column2Categories.map((category, catIndex) => {
                         const categoryDelay = 200 + (column1Categories.length * 250) + (catIndex * 250);
                         let itemCounter = 0;
                         return (
                            <section key={category.id} aria-labelledby={`category-${category.id}`} className="opacity-0 fade-in-up" style={{ animationDelay: `${categoryDelay}ms` }}>
                                <h2 id={`category-${category.id}`} className="text-4xl font-bold text-slate-900 border-b-2 border-slate-200 pb-2 mb-6">{category.name}</h2>
                                <div className="space-y-6">
                                    {category.items.map(item => <MenuItemDisplay key={item.id} item={item} style={{ animationDelay: `${categoryDelay + (++itemCounter * 80)}ms` }} />)}
                                    {category.subcategories.map(subcat => {
                                        const subcatDelay = categoryDelay + (++itemCounter * 80);
                                        return (
                                            <div key={subcat.id} className="opacity-0 fade-in-up" style={{ animationDelay: `${subcatDelay}ms` }}>
                                                <h3 className="text-2xl font-semibold text-slate-700 mt-8 mb-4">{subcat.name}</h3>
                                                <div className="space-y-6 pl-4 border-l-2 border-slate-200">
                                                    {subcat.items.map(item => <MenuItemDisplay key={item.id} item={item} style={{ animationDelay: `${subcatDelay + (++itemCounter * 80)}ms` }} />)}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </section>
                        )
                    })}
                </div>
            </main>
        </div>
    );
};

// --- From components/ConfirmationModal.tsx ---
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md transform transition-all">
                <div className="flex justify-between items-center p-4 border-b border-slate-200">
                    <h3 className="text-xl font-semibold text-slate-800">{title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>
                <div className="p-6">
                    <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                                <WarningIcon className="h-6 w-6 text-red-600" />
                            </div>
                        </div>
                        <div className="flex-1 pt-1">
                            <p className="text-sm text-slate-600">{message}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-50 p-4 flex justify-end space-x-3 rounded-b-lg">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        Cancel
                    </button>
                    <button 
                        type="button" 
                        onClick={onConfirm} 
                        className="bg-red-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- From components/PropertyModal.tsx ---
const PropertyModal = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setAddress(initialData.address);
        } else {
            setName('');
            setAddress('');
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ name, address });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b border-slate-200">
                    <h3 className="text-xl font-semibold">{initialData ? 'Edit Property' : 'Add New Property'}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Property Name</label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-slate-700">Address</label>
                            <textarea
                                id="address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                rows={3}
                                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                required
                            />
                        </div>
                    </div>
                    <div className="bg-slate-50 p-4 flex justify-end space-x-2 rounded-b-lg">
                        <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                            Cancel
                        </button>
                        <button type="submit" className="bg-primary-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                            Save Property
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- From components/RestaurantModal.tsx ---
const RestaurantModal = ({ isOpen, onClose, onSubmit, initialData, properties }) => {
    const [name, setName] = useState('');
    const [propertyId, setPropertyId] = useState('');

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setPropertyId(initialData.propertyId);
        } else {
            setName('');
            setPropertyId(properties[0]?.id || '');
        }
    }, [initialData, isOpen, properties]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!propertyId) {
            // In a real app, better validation would be here
            alert("Please select a property.");
            return;
        }
        onSubmit({ name, propertyId });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b border-slate-200">
                    <h3 className="text-xl font-semibold">{initialData ? 'Edit Restaurant' : 'Add New Restaurant'}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="propertyId" className="block text-sm font-medium text-slate-700">Property</label>
                            <select
                                id="propertyId"
                                value={propertyId}
                                onChange={(e) => setPropertyId(e.target.value)}
                                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                required
                            >
                                <option value="" disabled>Select a property</option>
                                {properties.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Restaurant Name</label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                required
                            />
                        </div>
                    </div>
                    <div className="bg-slate-50 p-4 flex justify-end space-x-2 rounded-b-lg">
                        <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                            Cancel
                        </button>
                        <button type="submit" className="bg-primary-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                            Save Restaurant
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- From components/CategoryModal.tsx ---
const CategoryModal = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [sortOrder, setSortOrder] = useState(10);
    const [activeFlag, setActiveFlag] = useState(true);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setDescription(initialData.description);
            setSortOrder(initialData.sortOrder);
            setActiveFlag(initialData.activeFlag);
        } else {
            setName('');
            setDescription('');
            setSortOrder(10);
            setActiveFlag(true);
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ name, description, sortOrder, activeFlag });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b border-slate-200">
                    <h3 className="text-xl font-semibold">{initialData ? 'Edit Category' : 'Add New Category'}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Name</label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-slate-700">Description</label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                               <label htmlFor="sortOrder" className="block text-sm font-medium text-slate-700">Sort Order</label>
                                <input
                                    id="sortOrder"
                                    type="number"
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(parseInt(e.target.value, 10))}
                                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                    required
                                />
                            </div>
                            <div className="flex items-center pt-6">
                                <input
                                    id="activeFlag"
                                    type="checkbox"
                                    checked={activeFlag}
                                    onChange={(e) => setActiveFlag(e.target.checked)}
                                    className="h-4 w-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
                                />
                                <label htmlFor="activeFlag" className="ml-2 block text-sm text-slate-900">Active</label>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-50 p-4 flex justify-end space-x-2 rounded-b-lg">
                        <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                            Cancel
                        </button>
                        <button type="submit" className="bg-primary-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                            Save Category
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- From components/SubCategoryModal.tsx ---
const SubCategoryModal = ({ isOpen, onClose, onSubmit, initialData, parentCategoryName }) => {
    const [name, setName] = useState('');
    const [sortOrder, setSortOrder] = useState(10);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setSortOrder(initialData.sortOrder);
        } else {
            setName('');
            setSortOrder(10);
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ name, sortOrder });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b border-slate-200">
                    <h3 className="text-xl font-semibold">{initialData ? 'Edit Subcategory' : `Add Subcategory to ${parentCategoryName}`}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Subcategory Name</label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                required
                            />
                        </div>
                        <div>
                           <label htmlFor="sortOrder" className="block text-sm font-medium text-slate-700">Sort Order</label>
                            <input
                                id="sortOrder"
                                type="number"
                                value={sortOrder}
                                onChange={(e) => setSortOrder(parseInt(e.target.value, 10))}
                                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                required
                            />
                        </div>
                    </div>
                    <div className="bg-slate-50 p-4 flex justify-end space-x-2 rounded-b-lg">
                        <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                            Cancel
                        </button>
                        <button type="submit" className="bg-primary-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                            Save Subcategory
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- From components/MenuItemModal.tsx ---
const getInitialFormData = () => ({
    name: '',
    description: '',
    price: '',
    currency: Currency.INR,
    imageUrl: '',
    videoUrl: '',
    allergens: [],
    subCategoryId: '',
    availabilityFlag: true,
    sortOrder: '10',
    displayName: '',
    itemCode: '',
    prepTime: '',
    soldOut: false,
    portion: '',
    specialType: SpecialType.NONE,
    calories: '',
    maxOrderQty: 10,
    bogo: false,
    complimentary: '',
    imageOrientation: ImageOrientation.SQUARE,
    availableTime: '',
    availableDate: '',
    attributes: {},
    modifierGroupIds: [],
});

const MenuItemModal = ({ isOpen, onClose, onSubmit, initialData, categoryId, subcategories, attributes, availableAllergens, availableCurrencies, availableModifierGroups }) => {
    const [formData, setFormData] = useState(getInitialFormData());
    const [imagePreview, setImagePreview] = useState(null);
    const nameCharLimit = 100;

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                description: initialData.description,
                price: String(initialData.price),
                currency: initialData.currency,
                imageUrl: initialData.imageUrl,
                videoUrl: initialData.videoUrl ?? '',
                allergens: initialData.allergens,
                subCategoryId: initialData.subCategoryId ?? '',
                availabilityFlag: initialData.availabilityFlag,
                sortOrder: initialData.sortOrder.toString(),
                displayName: initialData.displayName ?? '',
                itemCode: initialData.itemCode ?? '',
                prepTime: initialData.prepTime?.toString() ?? '',
                soldOut: initialData.soldOut ?? false,
                portion: initialData.portion ?? '',
                specialType: initialData.specialType ?? SpecialType.NONE,
                calories: initialData.calories?.toString() ?? '',
                maxOrderQty: initialData.maxOrderQty ?? 10,
                bogo: initialData.bogo ?? false,
                complimentary: initialData.complimentary ?? '',
                imageOrientation: initialData.imageOrientation ?? ImageOrientation.SQUARE,
                availableTime: initialData.availableTime ?? '',
                availableDate: initialData.availableDate ?? '',
                attributes: initialData.attributes ?? {},
                modifierGroupIds: initialData.modifierGroupIds ?? [],
            });
            setImagePreview(initialData.imageUrl);
        } else {
            setFormData(getInitialFormData());
            setImagePreview(null);
        }
    }, [initialData, isOpen]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const { checked } = e.target;
             setFormData(prev => ({ ...prev, [name]: checked }));
        } else if (name === 'availabilityFlag' || name === 'soldOut' || name === 'bogo') {
            setFormData(prev => ({ ...prev, [name]: value === 'true' }));
        } else {
             setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleAttributeChange = (attributeId, value, type) => {
        let processedValue = value;
        if (type === AttributeType.NUMBER) {
            processedValue = value === '' ? '' : Number(value);
        }
        setFormData(prev => ({
            ...prev,
            attributes: {
                ...prev.attributes,
                [attributeId]: processedValue,
            }
        }));
    };

    const handleAllergenChange = (allergenId) => {
        setFormData(prev => {
            const newAllergens = prev.allergens.includes(allergenId)
                ? prev.allergens.filter(id => id !== allergenId)
                : [...prev.allergens, allergenId];
            return { ...prev, allergens: newAllergens };
        });
    };
    
    const handleModifierGroupChange = (groupId) => {
        setFormData(prev => {
            const newGroupIds = prev.modifierGroupIds.includes(groupId)
                ? prev.modifierGroupIds.filter(id => id !== groupId)
                : [...prev.modifierGroupIds, groupId];
            return { ...prev, modifierGroupIds: newGroupIds };
        });
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result;
                setImagePreview(result);
                // In a real app, you'd upload this and get a URL. We'll use a placeholder.
                setFormData(prev => ({ ...prev, imageUrl: 'https://picsum.photos/400/300' }));
            };
            reader.readAsDataURL(file);
        }
    };
    
    const errors = useMemo(() => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Item Name is required.';
        } else if (formData.name.length > nameCharLimit) {
            newErrors.name = `Item Name cannot exceed ${nameCharLimit} characters.`;
        }

        const priceValue = parseFloat(String(formData.price));
// FIX: Changed price validation from < 0 to <= 0 to ensure price is a positive number, which is more robust and aligns with the source component's logic. Also updated the error message.
        if (String(formData.price).trim() === '' || isNaN(priceValue) || priceValue <= 0) {
            newErrors.price = 'Price must be a positive number.';
        }

        return newErrors;
    }, [formData.name, formData.price]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (Object.keys(errors).length > 0) return;

        const parseNumeric = (value) => {
            if (value === null || value === undefined || String(value).trim() === '') {
                return undefined;
            }
            const num = parseInt(String(value), 10);
            return isNaN(num) ? undefined : num;
        };
        
        const dataToSubmit = {
            ...formData,
            price: parseFloat(String(formData.price)) || 0,
            sortOrder: parseInt(String(formData.sortOrder), 10) || 10,
            prepTime: parseNumeric(formData.prepTime),
            calories: parseNumeric(formData.calories),
            maxOrderQty: parseNumeric(formData.maxOrderQty),
            subCategoryId: formData.subCategoryId || undefined,
        };
         onSubmit({ ...dataToSubmit, categoryId });
    };

    if (!isOpen) return null;

    const inputClass = "mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500";
    const labelClass = "block text-sm font-medium text-slate-700";
    const errorInputClass = "border-red-500 focus:ring-red-500 focus:border-red-500";

    const getCharCountClass = () => {
        const len = formData.name.length;
        if (len >= nameCharLimit) return 'text-red-600 font-medium';
        if (len >= nameCharLimit - 10) return 'text-yellow-600';
        return 'text-slate-500';
    };

    const renderAttributeInput = (attr) => {
        const value = formData.attributes[attr.id];
        const id = `attr-${attr.id}`;
        switch(attr.type) {
            case AttributeType.TEXT:
                return <input id={id} type="text" value={value || ''} onChange={(e) => handleAttributeChange(attr.id, e.target.value, attr.type)} className={inputClass} />;
            case AttributeType.NUMBER:
                return <input id={id} type="number" value={value || ''} onChange={(e) => handleAttributeChange(attr.id, e.target.value, attr.type)} className={inputClass} />;
            case AttributeType.BOOLEAN:
                return (
                    <div className="mt-2 flex items-center">
                         <input id={id} type="checkbox" checked={!!value} onChange={(e) => handleAttributeChange(attr.id, e.target.checked, attr.type)} className="h-4 w-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500" />
                         <label htmlFor={id} className="ml-2 text-sm text-slate-900">Enabled</label>
                    </div>
                );
            case AttributeType.SELECT:
                return (
                    <select id={id} value={value || ''} onChange={(e) => handleAttributeChange(attr.id, e.target.value, attr.type)} className={inputClass}>
                        <option value="">Select...</option>
                        {attr.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                );
            default:
                return null;
        }
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white flex justify-between items-center p-4 border-b border-slate-200 z-10">
                    <h3 className="text-xl font-semibold">{initialData ? 'Edit Food Item' : 'Food Item Registration'}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        {/* Left Column */}
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="name" className={labelClass}>Item Name*</label>
                                <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} className={`${inputClass} ${errors.name ? errorInputClass : ''}`} required maxLength={nameCharLimit}/>
                                <div className="flex justify-between items-center mt-1">
                                    {errors.name ? (
                                        <p className="text-red-500 text-xs">{errors.name}</p>
                                    ) : (
                                        <div /> 
                                    )}
                                    <p className={`text-xs transition-colors ${getCharCountClass()}`}>
                                        {nameCharLimit - formData.name.length} characters remaining
                                    </p>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="subCategoryId" className={labelClass}>Subcategory</label>
                                <select id="subCategoryId" name="subCategoryId" value={formData.subCategoryId} onChange={handleChange} className={inputClass}>
                                    <option value="">None (Item in main category)</option>
                                    {subcategories.map(sc => (
                                        <option key={String(sc.id)} value={sc.id}>{sc.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="sortOrder" className={labelClass}>Sort Order</label>
                                <input id="sortOrder" name="sortOrder" type="number" value={formData.sortOrder} onChange={handleChange} className={inputClass} required />
                            </div>
                             <div>
                                <label htmlFor="availableTime" className={labelClass}>Available Time Period</label>
                                <input id="availableTime" name="availableTime" type="text" value={formData.availableTime} onChange={handleChange} className={inputClass} placeholder="e.g., 09:00-14:00,18:00-22:00" />
                            </div>
                            <div>
                                <label htmlFor="availabilityFlag" className={labelClass}>Active Status</label>
                                <select id="availabilityFlag" name="availabilityFlag" value={String(formData.availabilityFlag)} onChange={handleChange} className={inputClass}>
                                    <option value="true">Active</option>
                                    <option value="false">Inactive</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="description" className={labelClass}>Item Description</label>
                                <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} className={inputClass} />
                            </div>
                            <div>
                                <label htmlFor="soldOut" className={labelClass}>Sold Out</label>
                                <select id="soldOut" name="soldOut" value={String(formData.soldOut)} onChange={handleChange} className={inputClass}>
                                    <option value="false">No</option>
                                    <option value="true">Yes</option>
                                </select>
                            </div>
                             <div>
                                <label htmlFor="portion" className={labelClass}>Portion Good For</label>
                                <input id="portion" name="portion" type="text" value={formData.portion} onChange={handleChange} className={inputClass} placeholder="e.g., 2 persons" />
                            </div>
                             <div>
                                <label className={labelClass}>Primary Image</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
                                    <div className="space-y-1 text-center">
                                        {imagePreview ? <img src={imagePreview} alt="Preview" className="mx-auto h-24 w-24 object-cover rounded-md" /> : <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                                        <div className="flex text-sm text-slate-600 justify-center"><label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"><span>Upload a file</span><input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" /></label></div><p className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="videoUrl" className={labelClass}>Secondary Video URL</label>
                                <input id="videoUrl" name="videoUrl" type="text" value={formData.videoUrl} onChange={handleChange} className={inputClass} placeholder="https://example.com/video.mp4" />
                            </div>
                        </div>
                        {/* Right Column */}
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="displayName" className={labelClass}>Item Display Name</label>
                                <input id="displayName" name="displayName" type="text" value={formData.displayName} onChange={handleChange} className={inputClass} />
                            </div>
                            <div>
                                <label htmlFor="itemCode" className={labelClass}>Item Code</label>
                                <input id="itemCode" name="itemCode" type="text" value={formData.itemCode} onChange={handleChange} className={inputClass} />
                            </div>
                            <div className="flex space-x-4">
                                <div className="flex-grow">
                                    <label htmlFor="price" className={labelClass}>Price*</label>
                                    <input id="price" name="price" type="number" value={formData.price} onChange={handleChange} step="0.01" min="0" className={`${inputClass} ${errors.price ? errorInputClass : ''}`} required />
                                    {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                                </div>
                                <div>
                                    <label htmlFor="currency" className={labelClass}>Currency</label>
                                    <select id="currency" name="currency" value={formData.currency} onChange={handleChange} className={inputClass}>
                                        {availableCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                             <div>
                                <label htmlFor="prepTime" className={labelClass}>Preparation Time in Minutes</label>
                                <input id="prepTime" name="prepTime" type="number" value={formData.prepTime} onChange={handleChange} className={inputClass} min="0" />
                            </div>
                             <div>
                                <label htmlFor="availableDate" className={labelClass}>Available Date Period</label>
                                <input id="availableDate" name="availableDate" type="text" value={formData.availableDate} onChange={handleChange} className={inputClass} placeholder="e.g., 2024/01/01-2024/01/31" />
                            </div>
                            <div>
                                <label htmlFor="specialType" className={labelClass}>Special Type</label>
                                <select id="specialType" name="specialType" value={formData.specialType} onChange={handleChange} className={inputClass}>
                                    {Object.values(SpecialType).map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                             <div>
                                <label htmlFor="calories" className={labelClass}>Calorific Value</label>
                                <input id="calories" name="calories" type="number" value={formData.calories} onChange={handleChange} className={inputClass} min="0" />
                            </div>
                            <div>
                                <label htmlFor="maxOrderQty" className={labelClass}>Max Order Quantity</label>
                                <input id="maxOrderQty" name="maxOrderQty" type="number" value={formData.maxOrderQty} onChange={handleChange} className={inputClass} min="0" />
                            </div>
                             <div>
                                <label htmlFor="bogo" className={labelClass}>BOGO (Buy One Get One)</label>
                                <select id="bogo" name="bogo" value={String(formData.bogo)} onChange={handleChange} className={inputClass}>
                                    <option value="false">No</option>
                                    <option value="true">Yes</option>
                                </select>
                            </div>
                             <div>
                                <label htmlFor="complimentary" className={labelClass}>Complimentary Offering</label>
                                <input id="complimentary" name="complimentary" type="text" value={formData.complimentary} onChange={handleChange} className={inputClass} />
                            </div>
                            <div>
                                <label htmlFor="imageOrientation" className={labelClass}>Image Orientation</label>
                                <select id="imageOrientation" name="imageOrientation" value={formData.imageOrientation} onChange={handleChange} className={inputClass}>
                                    {Object.values(ImageOrientation).map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className={labelClass}>Allergens</label>
                            <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                                {availableAllergens.map(allergen => (
                                    <div key={allergen.id} className="flex items-center">
                                        <input id={`allergen-${allergen.id}`} type="checkbox" checked={formData.allergens.includes(allergen.id)} onChange={() => handleAllergenChange(allergen.id)} className="h-4 w-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500" />
                                        <label htmlFor={`allergen-${allergen.id}`} className="ml-2 text-sm text-slate-700">{allergen.name}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {/* Modifier Groups Section */}
                        <div className="md:col-span-2 pt-4 border-t border-slate-200">
                            <label className={labelClass}>Modifier Groups</label>
                            <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                                {availableModifierGroups.map(group => (
                                    <div key={group.id} className="flex items-center">
                                        <input
                                            id={`modifier-${group.id}`}
                                            type="checkbox"
                                            checked={formData.modifierGroupIds.includes(group.id)}
                                            onChange={() => handleModifierGroupChange(group.id)}
                                            className="h-4 w-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
                                        />
                                        <label htmlFor={`modifier-${group.id}`} className="ml-2 text-sm text-slate-700">{group.name}</label>
                                    </div>
                                ))}
                                {availableModifierGroups.length === 0 && (
                                    <p className="text-sm text-slate-500 col-span-full">No modifier groups available for this restaurant.</p>
                                )}
                            </div>
                        </div>

                        {/* Custom Attributes Section */}
                        {attributes.length > 0 && (
                            <div className="md:col-span-2 pt-4 border-t border-slate-200">
                                <h4 className="text-md font-semibold text-slate-800 mb-2">Custom Attributes</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                    {attributes.map(attr => (
                                        <div key={attr.id}>
                                            <label htmlFor={`attr-${attr.id}`} className={labelClass}>{attr.name}</label>
                                            {renderAttributeInput(attr)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="bg-slate-50 p-4 flex justify-end space-x-2 sticky bottom-0 z-10 rounded-b-lg">
                        <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={Object.keys(errors).length > 0}
                            className="bg-primary-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300 disabled:cursor-not-allowed"
                        >
                            Save Item
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- From components/ImagePreviewModal.tsx ---
const ImagePreviewModal = ({ isOpen, onClose, imageUrl }) => {
    if (!isOpen || !imageUrl) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-75 z-[60] flex justify-center items-center p-4"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="relative bg-white p-4 rounded-lg shadow-2xl max-w-4xl max-h-[90vh] transform transition-all"
                onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside the image container
            >
                <button 
                    onClick={onClose} 
                    className="absolute top-2 right-2 text-gray-200 bg-gray-800 bg-opacity-50 rounded-full p-1 hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-white"
                    aria-label="Close image preview"
                >
                    <XIcon className="h-6 w-6" />
                </button>
                <img 
                    src={imageUrl} 
                    alt="Menu item preview" 
                    className="object-contain w-full h-full max-h-[85vh]" 
                />
            </div>
        </div>
    );
};

// --- From components/BulkActionModal.tsx ---
const BulkActionModal = ({ isOpen, onClose, items, onApply }: { isOpen: boolean, onClose: () => void, items: MenuItem[], onApply: (itemIds: string[], action: BulkAction, payload?: { currency?: Currency }) => void }) => {
    const [selectedAction, setSelectedAction] = useState('');
    const [selectedItemIds, setSelectedItemIds] = useState(new Set());
    const [targetCurrency, setTargetCurrency] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setSelectedAction('');
            setSelectedItemIds(new Set());
            setTargetCurrency('');
        }
    }, [isOpen]);

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allItemIds = new Set(items.map(item => item.id));
            setSelectedItemIds(allItemIds);
        } else {
            setSelectedItemIds(new Set());
        }
    };

    const handleSelectItem = (itemId) => {
        setSelectedItemIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }
            return newSet;
        });
    };

    const handleSubmit = () => {
        if (!canApply) return;

        const payload = selectedAction === BulkAction.CHANGE_CURRENCY 
            ? { currency: targetCurrency } 
            : undefined;
            
        onApply(Array.from(selectedItemIds), selectedAction, payload);
    };

    const isAllSelected = useMemo(() => {
        return items.length > 0 && selectedItemIds.size === items.length;
    }, [items, selectedItemIds]);
    
    const canApply = useMemo(() => {
        if (selectedItemIds.size === 0 || !selectedAction) {
            return false;
        }
        if (selectedAction === BulkAction.CHANGE_CURRENCY && !targetCurrency) {
            return false;
        }
        return true;
    }, [selectedAction, selectedItemIds, targetCurrency]);


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-slate-200">
                    <h3 className="text-xl font-semibold">Bulk Actions</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>
                
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                        <div>
                            <label htmlFor="bulk-action" className="block text-sm font-medium text-slate-700">Select Action</label>
                            <select
                                id="bulk-action"
                                value={selectedAction}
                                onChange={(e) => setSelectedAction(e.target.value)}
                                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            >
                                <option value="" disabled>Choose an action</option>
                                <option value={BulkAction.ENABLE_ITEMS}>Enable Items</option>
                                <option value={BulkAction.DISABLE_ITEMS}>Disable Items</option>
                                <option value={BulkAction.MARK_SOLD_OUT}>Mark as Sold Out</option>
                                <option value={BulkAction.ENABLE_BOGO}>Enable BOGO Offer</option>
                                <option value={BulkAction.DISABLE_BOGO}>Disable BOGO Offer</option>
                                <option value={BulkAction.CHANGE_CURRENCY}>Change Currency</option>
                            </select>
                        </div>
                        {selectedAction === BulkAction.CHANGE_CURRENCY && (
                             <div>
                                <label htmlFor="target-currency" className="block text-sm font-medium text-slate-700">Target Currency</label>
                                <select
                                    id="target-currency"
                                    value={targetCurrency}
                                    onChange={(e) => setTargetCurrency(e.target.value)}
                                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                >
                                    <option value="" disabled>Select currency</option>
                                    {Object.values(Currency).map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        )}
                         <div className="flex items-center pb-2 justify-self-end">
                            <input
                                id="select-all"
                                type="checkbox"
                                checked={isAllSelected}
                                onChange={handleSelectAll}
                                className="h-4 w-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
                            />
                            <label htmlFor="select-all" className="ml-2 block text-sm text-slate-900">
                                Select All ({items.length})
                            </label>
                        </div>
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto border-t border-b border-slate-200">
                    <ul className="divide-y divide-slate-200">
                        {items.map(item => (
                            <li key={item.id} className="p-4 flex items-center space-x-4">
                                <input
                                    type="checkbox"
                                    checked={selectedItemIds.has(item.id)}
                                    onChange={() => handleSelectItem(item.id)}
                                    className="h-4 w-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
                                />
                                <img src={item.imageUrl} alt={item.name} className="h-10 w-10 rounded-md object-cover" />
                                <div className="flex-grow">
                                    <p className="font-medium text-slate-800">{item.name}</p>
                                    <p className="text-sm text-slate-500">{Number(item.price).toFixed(2)} {item.currency}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                     {item.availabilityFlag ? 
                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Available</span> 
                                        : <span className="px-2 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-800">Disabled</span>
                                     }
                                     {item.soldOut && <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Sold Out</span>}
                                     {item.bogo && <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">BOGO</span>}
                                </div>
                            </li>
                        ))}
                         {items.length === 0 && (
                            <li className="p-4 text-center text-slate-500">
                                No items in this category.
                            </li>
                        )}
                    </ul>
                </div>

                <div className="bg-slate-50 p-4 flex justify-between items-center rounded-b-lg">
                    <p className="text-sm font-medium text-slate-700">{selectedItemIds.size} items selected</p>
                    <div className="flex space-x-2">
                        <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                            Cancel
                        </button>
                        <button 
                            type="button" 
                            onClick={handleSubmit} 
                            disabled={!canApply}
                            className="bg-primary-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300 disabled:cursor-not-allowed"
                        >
                            Apply Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- From components/QRCodeModal.tsx ---
const QRCodeModal = ({ isOpen, onClose, title, url }) => {
    const qrRef = useRef(null);

    const downloadQRCode = () => {
        if (!qrRef.current) return;

        const canvas = qrRef.current.querySelector('canvas');
        if (!canvas) return;

        const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        
        const downloadLink = document.createElement("a");
        const fileName = `${title.replace(/\s+/g, '_')}_QR_Code.png`;
        downloadLink.href = pngUrl;
        downloadLink.download = fileName;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm transform transition-all">
                <div className="flex justify-between items-center p-4 border-b border-slate-200">
                    <h3 className="text-xl font-semibold text-slate-800">{title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>
                <div className="p-8 flex flex-col items-center justify-center space-y-4">
                    <div ref={qrRef} className="p-4 bg-white border rounded-lg">
                       <QRCodeCanvas
                            value={url}
                            size={256}
                            level={'H'}
                            includeMargin={true}
                        />
                    </div>
                    <p className="text-xs text-slate-500 text-center max-w-xs break-words">{url}</p>
                </div>
                <div className="bg-slate-50 p-4 flex justify-end space-x-3 rounded-b-lg">
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        Close
                    </button>
                    <button
                        type="button"
                        onClick={downloadQRCode}
                        className="flex items-center bg-primary-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        <DownloadIcon className="h-5 w-5 mr-2" />
                        Download PNG
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- From components/DisplayUrlModal.tsx ---
const DisplayUrlModal = ({ isOpen, onClose, url, showToast }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            showToast('URL copied to clipboard!', 'success');
            setTimeout(() => setCopied(false), 2000);
        }, () => {
            showToast('Failed to copy URL.', 'error');
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg">
                <div className="flex justify-between items-center p-4 border-b border-slate-200">
                    <h3 className="text-xl font-semibold text-slate-800">Digital Menu Display URL</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-sm text-slate-600">
                        Use this URL on your in-store digital screens. The menu will update automatically when you make changes in the portal.
                    </p>
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={url}
                            readOnly
                            className="w-full bg-slate-100 border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
                        />
                        <button
                            onClick={handleCopy}
                            className="flex-shrink-0 bg-primary-600 text-white font-semibold py-2 px-3 rounded-lg shadow-sm hover:bg-primary-700 transition duration-300 disabled:bg-primary-300"
                        >
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                </div>
                 <div className="bg-slate-50 p-4 flex justify-end space-x-2 rounded-b-lg">
                    <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- From components/DigitalMenuPreviewModal.tsx ---
const DigitalMenuPreviewModal = ({ isOpen, onClose, restaurantId }) => {
    if (!isOpen || !restaurantId) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-75 z-[60] flex justify-center items-center p-4 sm:p-6 lg:p-8"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="relative bg-slate-800 p-2 sm:p-4 rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col border-4 border-slate-700"
                onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
            >
                {/* Bezel top */}
                <div className="flex-shrink-0 flex justify-between items-center px-4 py-2 bg-slate-900 rounded-t-lg">
                    <div className="h-3 w-3 bg-slate-700 rounded-full"></div>
                    <span className="text-sm text-slate-400">Digital Menu Preview</span>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-white"
                        aria-label="Close preview"
                    >
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Screen Content */}
                <div className="flex-grow bg-slate-900 overflow-y-auto">
                    <DigitalMenuPage restaurantId={restaurantId} />
                </div>

                 {/* Bezel bottom */}
                 <div className="flex-shrink-0 h-8 bg-slate-900 rounded-b-lg flex items-center justify-center">
                    <div className="h-1.5 w-20 bg-slate-700 rounded-full"></div>
                 </div>
            </div>
        </div>
    );
};

// --- From components/SystemImportModal.tsx ---
const SystemImportModal = ({ isOpen, onClose, onImport, initialStats }) => {
    const [view, setView] = useState(initialStats ? 'summary' : 'upload');
    const [stats, setStats] = useState(initialStats);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = async (file) => {
        if (!file) return;
        
        if (file.type !== 'application/json') {
            setError('Invalid file type. Please upload a JSON file.');
            return;
        }
        
        setError(null);
        setView('processing');
        try {
            const resultStats = await onImport(file);
            setStats(resultStats);
            setView('summary');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during import.';
            setError(errorMessage);
            setView('upload');
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files?.[0];
        handleFileChange(file || null);
    };

    const handleClose = () => {
        setView('upload');
        setStats(null);
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    const renderContent = () => {
        switch (view) {
            case 'processing':
                return (
                    <div className="flex flex-col items-center justify-center p-16 space-y-4">
                        <LoadingSpinnerIcon className="h-12 w-12 text-primary-600" />
                        <h4 className="text-xl font-semibold text-slate-700">Processing Menu...</h4>
                        <p className="text-slate-500">This may take a moment. Please don't close this window.</p>
                    </div>
                );
            case 'summary':
                if (!stats) return <p>No summary to display.</p>;
                return (
                    <div className="p-6">
                        <div className="text-center mb-6">
                             <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto" />
                             <h3 className="text-2xl font-bold text-slate-800 mt-2">Import Complete</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                             <div className="bg-slate-50 p-3 rounded-lg">
                                <p className="font-semibold text-slate-600">Restaurants Processed</p>
                                <p className="text-2xl font-bold text-slate-800">{stats.restaurantsProcessed}</p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg">
                                <p className="font-semibold text-slate-600">Restaurants Skipped</p>
                                <p className="text-2xl font-bold text-slate-800">{stats.restaurantsSkipped.length}</p>
                            </div>
                            <div className="bg-green-50 p-3 rounded-lg">
                                <p className="font-semibold text-green-800">Items Created</p>
                                <p className="text-2xl font-bold text-green-900">{stats.itemsCreated}</p>
                            </div>
                             <div className="bg-blue-50 p-3 rounded-lg">
                                <p className="font-semibold text-blue-800">Items Updated</p>
                                <p className="text-2xl font-bold text-blue-900">{stats.itemsUpdated}</p>
                            </div>
                              <div className="bg-sky-50 p-3 rounded-lg">
                                <p className="font-semibold text-sky-800">Categories Created</p>
                                <p className="text-2xl font-bold text-sky-900">{stats.categoriesCreated + stats.subcategoriesCreated}</p>
                            </div>
                             <div className="bg-indigo-50 p-3 rounded-lg">
                                <p className="font-semibold text-indigo-800">Modifiers Created</p>
                                <p className="text-2xl font-bold text-indigo-900">{stats.modifierGroupsCreated + stats.modifierItemsCreated}</p>
                            </div>
                        </div>
                        {stats.restaurantsSkipped.length > 0 && (
                             <div className="mt-4">
                                <p className="font-semibold text-amber-700">Skipped Restaurants (Not Found):</p>
                                <ul className="text-xs list-disc list-inside text-slate-600 max-h-24 overflow-y-auto bg-amber-50 p-2 rounded">
                                    {stats.restaurantsSkipped.map(r => <li key={r.id}><strong>{r.name}</strong> (ID: {r.id})</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                );
            case 'upload':
            default:
                return (
                    <div className="p-6 space-y-4">
                        <p className="text-slate-600">
                            Upload a system-wide menu JSON file. The system will match restaurants by ID, then create or update their categories, items, and modifiers. Restaurants not found in the system will be skipped.
                        </p>
                        <div 
                            onDragOver={handleDragOver} 
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-1 flex justify-center px-6 pt-10 pb-12 border-2 border-slate-300 border-dashed rounded-md cursor-pointer hover:border-primary-500 hover:bg-slate-50 transition"
                        >
                            <div className="space-y-1 text-center">
                                <UploadIcon className="mx-auto h-12 w-12 text-slate-400" />
                                <div className="flex text-sm text-slate-600">
                                    <span className="font-medium text-primary-600">Upload a file</span>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-slate-500">JSON file only</p>
                            </div>
                        </div>
                        <input
                            ref={fileInputRef}
                            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                            type="file"
                            className="hidden"
                            accept=".json,application/json"
                        />
                        {error && (
                            <div className="bg-red-50 p-3 rounded-md flex items-center text-sm text-red-700">
                                <XCircleIcon className="h-5 w-5 mr-2 flex-shrink-0"/>
                                <span>{error}</span>
                            </div>
                        )}
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg">
                <div className="flex justify-between items-center p-4 border-b border-slate-200">
                    <div className="flex items-center space-x-3">
                        <ServerStackIcon className="h-6 w-6 text-primary-600" />
                        <h3 className="text-xl font-semibold text-slate-800">System-Wide Menu Import</h3>
                    </div>
                    <button onClick={handleClose} className="text-slate-400 hover:text-slate-600">
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>
                {renderContent()}
                <div className="bg-slate-50 p-4 flex justify-end space-x-2 rounded-b-lg">
                    <button type="button" onClick={handleClose} className="bg-primary-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                        {view === 'summary' ? 'Done' : 'Close'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- From components/AttributeModal.tsx ---
const AttributeModal = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState(AttributeType.TEXT);
    const [options, setOptions] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setType(initialData.type);
            setOptions(initialData.options?.join(', ') || '');
        } else {
            setName('');
            setType(AttributeType.TEXT);
            setOptions('');
        }
        setError(null);
    }, [initialData, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null);

        const optionsArray = type === AttributeType.SELECT ? options.split(',').map(o => o.trim()).filter(Boolean) : undefined;

        if (type === AttributeType.SELECT && (!optionsArray || optionsArray.length === 0)) {
            setError('Please provide at least one option for the Dropdown type.');
            return;
        }

        onSubmit({ name, type, options: optionsArray });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b border-slate-200">
                    <h3 className="text-xl font-semibold">{initialData ? 'Edit Attribute' : 'Add New Attribute'}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Attribute Name</label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-slate-700">Input Type</label>
                             <select
                                id="type"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            >
                                {Object.values(AttributeType).map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                         {type === AttributeType.SELECT && (
                            <div>
                                <label htmlFor="options" className="block text-sm font-medium text-slate-700">Options</label>
                                <textarea
                                    id="options"
                                    value={options}
                                    onChange={(e) => setOptions(e.target.value)}
                                    rows={3}
                                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="Enter comma-separated values, e.g., Mild, Medium, Hot"
                                />
                                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                            </div>
                        )}
                    </div>
                    <div className="bg-slate-50 p-4 flex justify-end space-x-2 rounded-b-lg">
                        <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                            Cancel
                        </button>
                        <button type="submit" className="bg-primary-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                            Save Attribute
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- From components/AllergenModal.tsx ---
const AllergenModal = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [name, setName] = useState('');

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
        } else {
            setName('');
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ name });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b border-slate-200">
                    <h3 className="text-xl font-semibold">{initialData ? 'Edit Allergen' : 'Add New Allergen'}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Allergen Name</label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                required
                            />
                        </div>
                    </div>
                    <div className="bg-slate-50 p-4 flex justify-end space-x-2 rounded-b-lg">
                        <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                            Cancel
                        </button>
                        <button type="submit" className="bg-primary-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                            Save Allergen
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- From components/ModifierGroupModal.tsx ---
const ModifierGroupModal = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [name, setName] = useState('');
    const [minSelection, setMinSelection] = useState(0);
    const [maxSelection, setMaxSelection] = useState(1);
    const [error, setError] = useState('');

    useEffect(() => {
        setError('');
        if (initialData) {
            setName(initialData.name);
            setMinSelection(initialData.minSelection);
            setMaxSelection(initialData.maxSelection);
        } else {
            setName('');
            setMinSelection(0);
            setMaxSelection(1);
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (minSelection > maxSelection) {
            setError('Minimum selections cannot be greater than maximum selections.');
            return;
        }
        setError('');
        onSubmit({ name, minSelection, maxSelection });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b border-slate-200">
                    <h3 className="text-xl font-semibold">{initialData ? 'Edit Modifier Group' : 'Add New Modifier Group'}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Group Name</label>
                            <input
                                id="name" type="text" value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="minSelection" className="block text-sm font-medium text-slate-700">Min Selections</label>
                                <input
                                    id="minSelection" type="number" value={minSelection}
                                    onChange={(e) => setMinSelection(parseInt(e.target.value, 10))}
                                    min="0"
                                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500"
                                    required
                                />
                            </div>
                             <div>
                                <label htmlFor="maxSelection" className="block text-sm font-medium text-slate-700">Max Selections</label>
                                <input
                                    id="maxSelection" type="number" value={maxSelection}
                                    onChange={(e) => setMaxSelection(parseInt(e.target.value, 10))}
                                    min="1"
                                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500"
                                    required
                                />
                            </div>
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                    </div>
                    <div className="bg-slate-50 p-4 flex justify-end space-x-2 rounded-b-lg">
                        <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none">
                            Cancel
                        </button>
                        <button type="submit" className="bg-primary-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-700 focus:outline-none">
                            Save Group
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- From components/ModifierItemModal.tsx ---
const ModifierItemModal = ({ isOpen, onClose, onSubmit, initialData, parentGroupName }) => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setPrice(initialData.price);
        } else {
            setName('');
            setPrice(0);
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ name, price });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b border-slate-200">
                    <h3 className="text-xl font-semibold">{initialData ? 'Edit Modifier Item' : `Add Item to ${parentGroupName}`}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Item Name</label>
                            <input
                                id="name" type="text" value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-slate-700">Additional Price</label>
                            <input
                                id="price" type="number" value={price}
                                onChange={(e) => setPrice(parseFloat(e.target.value))}
                                step="0.01" min="0"
                                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500"
                                required
                            />
                        </div>
                    </div>
                    <div className="bg-slate-50 p-4 flex justify-end space-x-2 rounded-b-lg">
                        <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none">
                            Cancel
                        </button>
                        <button type="submit" className="bg-primary-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-700 focus:outline-none">
                            Save Item
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- From components/BillModal.tsx ---
const BillModal = ({ isOpen, onClose, sale, menuItemMap }: {isOpen: boolean, onClose: () => void, sale: any, menuItemMap: Map<string, any>}) => {
    if (!isOpen || !sale) return null;
    
    const saleDate = new Date(sale.saleDate);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md transform transition-all">
                <div className="flex justify-between items-center p-4 border-b border-slate-200">
                    <h3 className="text-xl font-semibold text-slate-800">Order Details</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <p className="text-sm text-slate-500">Order ID</p>
                        <p className="font-mono text-slate-800">{sale.id}</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Date & Time</p>
                        <p className="font-medium text-slate-800">{saleDate.toLocaleString()}</p>
                    </div>

                    <div className="border-t border-slate-200 pt-4">
                        <h4 className="font-semibold text-slate-700 mb-2">Items</h4>
                        <ul className="divide-y divide-slate-200">
                            {sale.items.map((item, index) => {
                                const menuItem = menuItemMap.get(item.menuItemId);
                                const subtotal = item.quantity * item.price;
                                return (
                                     <li key={`${item.menuItemId}-${index}`} className="py-2 flex justify-between items-center">
                                        <div>
                                            <p className="font-medium text-slate-800">{menuItem?.name || 'Unknown Item'}</p>
                                            <p className="text-sm text-slate-500">{item.quantity} x ${Number(item.price).toFixed(2)}</p>
                                        </div>
                                        <p className="font-mono text-slate-800">${Number(subtotal).toFixed(2)}</p>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    <div className="border-t-2 border-dashed border-slate-300 pt-4 flex justify-between items-center">
                        <p className="text-lg font-bold text-slate-800">Total</p>
                        <p className="text-lg font-bold font-mono text-slate-800">${Number(sale.totalAmount).toFixed(2)}</p>
                    </div>

                </div>
                <div className="bg-slate-50 p-4 flex justify-end rounded-b-lg">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- From components/UserModal.tsx ---
const UserModal = ({ isOpen, onClose, onSubmit, initialData, properties }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState(UserRole.PROPERTY_ADMIN);
    const [propertyId, setPropertyId] = useState('');

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setEmail(initialData.email);
            setRole(initialData.role);
            setPropertyId(initialData.propertyId);
        } else {
            setName('');
            setEmail('');
            setRole(UserRole.PROPERTY_ADMIN);
            setPropertyId(properties[0]?.id || '');
        }
    }, [initialData, isOpen, properties]);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const userData = {
            name,
            email,
            role,
            propertyId: role === UserRole.PROPERTY_ADMIN ? propertyId : undefined,
        };
        onSubmit(userData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b border-slate-200">
                    <h3 className="text-xl font-semibold">{initialData ? 'Edit User' : 'Add New User'}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Full Name</label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-slate-700">Role</label>
                            <select
                                id="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            >
                                <option value={UserRole.SUPERADMIN}>Superadmin</option>
                                <option value={UserRole.PROPERTY_ADMIN}>Property Admin</option>
                            </select>
                        </div>
                        {role === UserRole.PROPERTY_ADMIN && (
                            <div>
                                <label htmlFor="propertyId" className="block text-sm font-medium text-slate-700">Assign to Property</label>
                                <select
                                    id="propertyId"
                                    value={propertyId}
                                    onChange={(e) => setPropertyId(e.target.value)}
                                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                    required
                                >
                                    <option value="" disabled>Select a property</option>
                                    {properties.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                    <div className="bg-slate-50 p-4 flex justify-end space-x-2 rounded-b-lg">
                        <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                            Cancel
                        </button>
                        <button type="submit" className="bg-primary-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                            Save User
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- From components/LoginPage.tsx ---
const LoginPage = ({ onLoginSuccess, showToast }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const user = await api.login(email, password);
            onLoginSuccess(user);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(errorMessage);
            showToast(errorMessage, 'error');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 border border-slate-200">
                <div className="flex flex-col items-center mb-6">
                    <div className="flex items-center space-x-2">
                        <svg className="h-10 w-10 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h1 className="text-3xl font-bold text-slate-800">
                            Smartler <span className="text-primary-600 font-semibold">Portal</span>
                        </h1>
                    </div>
                     <p className="text-slate-500 mt-2">Sign in to manage your F&B menus.</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                            Email address
                        </label>
                        <div className="mt-1">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                placeholder="super@smartler.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                            Password
                        </label>
                        <div className="mt-1">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                placeholder="password"
                            />
                        </div>
                    </div>
                    
                    {error && (
                        <div className="text-center text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300 disabled:cursor-not-allowed"
                        >
                            {isLoading ? <LoadingSpinnerIcon className="h-5 w-5" /> : 'Sign In'}
                        </button>
                    </div>
                </form>

                 <div className="mt-6 text-center text-xs text-slate-400">
                    <p>Demo accounts:</p>
                    <p>super@smartler.com (Superadmin)</p>
                    <p>john.doe@grandhotel.com (Property Admin)</p>
                    <p>Password for all accounts: <strong>password</strong></p>
                </div>
            </div>
        </div>
    );
};

// --- From components/Header.tsx ---
const Header = ({ currentUser, onLogout }) => (
    <header className="bg-white border-b border-slate-200">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-3">
                    <svg className="h-8 w-8 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h1 className="text-2xl font-bold text-slate-800">
                        Smartler F&B <span className="text-primary-600 font-semibold">Menu Portal</span>
                    </h1>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="text-right">
                        <p className="font-semibold text-slate-700">{currentUser.name}</p>
                        <p className="text-sm text-slate-500">{currentUser.role}</p>
                    </div>
                    <div>
                         <button
                            onClick={onLogout}
                            className="text-sm border border-slate-300 rounded-md shadow-sm py-1 px-3 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                         >
                            Logout
                         </button>
                    </div>
                </div>
            </div>
        </div>
    </header>
);

// --- From components/Sidebar.tsx ---
const NavItem = ({ page, label, currentPage, setCurrentPage, icon = null }) => {
    const isActive = currentPage === page;
    return (
        <li>
            <a
                href="#"
                onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(page);
                }}
                className={`flex items-center p-3 text-base font-normal rounded-lg transition duration-75 hover:bg-primary-100 hover:text-primary-800 group ${
                    isActive
                        ? 'bg-primary-500 text-white shadow-inner'
                        : 'text-slate-700'
                }`}
            >
                {icon && <span className="w-6 h-6">{icon}</span>}
                <span className="ml-3">{label}</span>
            </a>
        </li>
    );
};

const Sidebar = ({ currentPage, setCurrentPage, currentUser }) => {
    return (
        <aside className="w-64" aria-label="Sidebar">
            <div className="overflow-y-auto h-screen py-4 px-3 bg-white border-r border-slate-200">
                <div className="flex items-center pl-2.5 mb-5">
                     <svg className="h-8 w-8 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="self-center text-xl font-semibold whitespace-nowrap text-slate-800 ml-2">Smartler</span>
                </div>
                <ul className="space-y-2">
                    {/* FIX: Added icon={null} to NavItem calls that were missing it, to satisfy the component's prop requirements. */}
                    <NavItem page="properties" label="Properties" currentPage={currentPage} setCurrentPage={setCurrentPage} icon={null} />
                    <NavItem page="restaurants" label="Restaurants" currentPage={currentPage} setCurrentPage={setCurrentPage} icon={null} />
                    <NavItem page="categories" label="Categories" currentPage={currentPage} setCurrentPage={setCurrentPage} icon={null} />
                    <NavItem page="menu_items" label="Menu Items" currentPage={currentPage} setCurrentPage={setCurrentPage} icon={null} />
                    <NavItem 
                        page="attributes" 
                        label="Item Attributes" 
                        currentPage={currentPage} 
                        setCurrentPage={setCurrentPage}
                        icon={<TagIcon className={currentPage === 'attributes' ? 'text-white' : 'text-slate-500 group-hover:text-primary-800'}/>}
                    />
                     <NavItem 
                        page="modifiers" 
                        label="Modifiers" 
                        currentPage={currentPage} 
                        setCurrentPage={setCurrentPage}
                        icon={<AdjustmentsIcon className={currentPage === 'modifiers' ? 'text-white' : 'text-slate-500 group-hover:text-primary-800'}/>}
                    />
                    <NavItem 
                        page="allergens" 
                        label="Allergens" 
                        currentPage={currentPage} 
                        setCurrentPage={setCurrentPage}
                        icon={<WarningIcon className={currentPage === 'allergens' ? 'text-white' : 'text-slate-500 group-hover:text-primary-800'}/>}
                    />
                     <div className="pt-4 mt-4 space-y-2 border-t border-slate-200">
                        <NavItem
                            page="orders"
                            label="Live Orders"
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                            icon={<BellIcon className={currentPage === 'orders' ? 'text-white' : 'text-slate-500 group-hover:text-primary-800'}/>}
                        />
                        <NavItem 
                            page="analytics" 
                            label="Analytics" 
                            currentPage={currentPage} 
                            setCurrentPage={setCurrentPage}
                            icon={<AnalyticsIcon className={currentPage === 'analytics' ? 'text-white' : 'text-slate-500 group-hover:text-primary-800'}/>}
                        />
                        <NavItem 
                            page="sales_report" 
                            label="Sales Report" 
                            currentPage={currentPage} 
                            setCurrentPage={setCurrentPage}
                            icon={<DocumentReportIcon className={currentPage === 'sales_report' ? 'text-white' : 'text-slate-500 group-hover:text-primary-800'}/>}
                        />
                         {currentUser.role === UserRole.SUPERADMIN && (
                            <>
                             <NavItem 
                                page="user_management" 
                                label="User Management" 
                                currentPage={currentPage} 
                                setCurrentPage={setCurrentPage}
                                icon={<UsersIcon className={currentPage === 'user_management' ? 'text-white' : 'text-slate-500 group-hover:text-primary-800'}/>}
                            />
                            <NavItem 
                                page="audit_log" 
                                label="Activity Log" 
                                currentPage={currentPage} 
                                setCurrentPage={setCurrentPage}
                                icon={<AuditLogIcon className={currentPage === 'audit_log' ? 'text-white' : 'text-slate-500 group-hover:text-primary-800'}/>}
                            />
                            </>
                        )}
                    </div>
                </ul>
            </div>
        </aside>
    );
};

// --- Page Components ---
// All page components are defined here, following the structure of the provided application.tsx
const PropertiesPage = ({ showToast, currentUser }) => {
    const [allProperties, setAllProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingProperty, setEditingProperty] = useState(null);

    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    const [deleteAction, setDeleteAction] = useState(null);
    const [confirmMessage, setConfirmMessage] = useState('');
    
    const isSuperAdmin = currentUser.role === UserRole.SUPERADMIN;

    const fetchProperties = useCallback(async () => {
        setLoading(true);
        try {
            const fetchedProperties = await api.getProperties('tenant-123');
            setAllProperties(fetchedProperties);
        } catch (error) {
            showToast('Failed to fetch properties.', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchProperties();
    }, [fetchProperties]);

    const visibleProperties = useMemo(() => {
        if (isSuperAdmin) {
            return allProperties;
        }
        return allProperties.filter(p => p.id === currentUser.propertyId);
    }, [allProperties, currentUser, isSuperAdmin]);


    const handleOpenAddModal = () => {
        setEditingProperty(null);
        setModalOpen(true);
    };

    const handleOpenEditModal = (property) => {
        setEditingProperty(property);
        setModalOpen(true);
    };

    const handleSaveProperty = async (propertyData) => {
        try {
            if (editingProperty) {
                await api.updateProperty({ ...editingProperty, ...propertyData });
                showToast('Property updated successfully!', 'success');
            } else {
                await api.addProperty(propertyData);
                showToast('Property added successfully!', 'success');
            }
            await fetchProperties();
            setModalOpen(false);
            setEditingProperty(null);
        } catch (error) {
            showToast('Failed to save property.', 'error');
        }
    };

    const handleDeleteProperty = (property) => {
        setConfirmMessage(`Are you sure you want to delete "${property.name}"? This will also delete all associated restaurants and menus.`);
        setDeleteAction(() => async () => {
            try {
                await api.deleteProperty(property.id);
                showToast('Property deleted successfully!', 'success');
                await fetchProperties();
            } catch (error) {
                showToast('Failed to delete property.', 'error');
            }
        });
        setConfirmModalOpen(true);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-96"><LoadingSpinner /></div>;
    }

    return (
        <div className="bg-white shadow-md rounded-lg border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-700">Manage Properties</h2>
                {isSuperAdmin && (
                    <button
                        onClick={handleOpenAddModal}
                        className="flex items-center bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-primary-700 transition duration-300"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Add Property
                    </button>
                )}
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600">Name</th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600">Address</th>
                            <th className="text-center py-3 px-4 uppercase font-semibold text-sm text-slate-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-slate-700">
                        {visibleProperties.map(prop => (
                            <tr key={prop.id} className="border-b border-slate-200 hover:bg-slate-50">
                                <td className="py-3 px-4 font-medium">{prop.name}</td>
                                <td className="py-3 px-4">{prop.address}</td>
                                <td className="py-3 px-4 text-center">
                                    <div className="flex items-center justify-center space-x-2">
                                        <button onClick={() => handleOpenEditModal(prop)} className="text-amber-500 hover:text-amber-700 p-2 rounded-full hover:bg-amber-100 transition" title="Edit Property">
                                            <PencilIcon className="h-5 w-5"/>
                                        </button>
                                        {isSuperAdmin && (
                                            <button onClick={() => handleDeleteProperty(prop)} className="text-rose-500 hover:text-rose-700 p-2 rounded-full hover:bg-rose-100 transition" title="Delete Property">
                                                <TrashIcon className="h-5 w-5"/>
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {visibleProperties.length === 0 && (
                    <div className="text-center py-10 text-slate-500">
                        <p>No properties found. {isSuperAdmin ? 'Click "Add Property" to get started.' : 'Contact a superadmin to be assigned to a property.'}</p>
                    </div>
                )}
            </div>

            <PropertyModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSaveProperty}
                initialData={editingProperty}
            />

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={() => {
                    deleteAction?.();
                    setConfirmModalOpen(false);
                }}
                title="Confirm Deletion"
                message={confirmMessage}
            />
        </div>
    );
};

const RestaurantsPage = ({ showToast, currentUser }) => {
    const [allRestaurants, setAllRestaurants] = useState([]);
    const [allProperties, setAllProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterPropertyId, setFilterPropertyId] = useState('');
    
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingRestaurant, setEditingRestaurant] = useState(null);

    const [isUrlModalOpen, setUrlModalOpen] = useState(false);
    const [displayUrl, setDisplayUrl] = useState('');
    
    const [isPreviewModalOpen, setPreviewModalOpen] = useState(false);
    const [previewRestaurantId, setPreviewRestaurantId] = useState(null);

    const [isSystemImportModalOpen, setSystemImportModalOpen] = useState(false);
    const [systemImportStats, setSystemImportStats] = useState(null);

    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    const [deleteAction, setDeleteAction] = useState(null);
    const [confirmMessage, setConfirmMessage] = useState('');
    
    const isSuperAdmin = currentUser.role === UserRole.SUPERADMIN;

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [fetchedRestaurants, fetchedProperties] = await Promise.all([
                api.getAllRestaurants(),
                api.getProperties('tenant-123')
            ]);
            setAllRestaurants(fetchedRestaurants);
            setAllProperties(fetchedProperties);
            if (!isSuperAdmin) {
                setFilterPropertyId(currentUser.propertyId || '');
            }
        } catch (error) {
            showToast('Failed to fetch data.', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast, isSuperAdmin, currentUser.propertyId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const propertyMap = useMemo(() => new Map(allProperties.map(p => [p.id, p.name])), [allProperties]);

    const visibleProperties = useMemo(() => {
        if (isSuperAdmin) {
            return allProperties;
        }
        return allProperties.filter(p => p.id === currentUser.propertyId);
    }, [allProperties, currentUser, isSuperAdmin]);


    const filteredRestaurants = useMemo(() => {
        if (!filterPropertyId) return isSuperAdmin ? allRestaurants : allRestaurants.filter(r => r.propertyId === currentUser.propertyId);
        return allRestaurants.filter(r => r.propertyId === filterPropertyId);
    }, [allRestaurants, filterPropertyId, isSuperAdmin, currentUser.propertyId]);

    const handleOpenAddModal = () => {
        if (visibleProperties.length === 0) {
            showToast('Please create a property first before adding a restaurant.', 'error');
            return;
        }
        setEditingRestaurant(null);
        setModalOpen(true);
    };

    const handleOpenEditModal = (restaurant) => {
        setEditingRestaurant(restaurant);
        setModalOpen(true);
    };

    const handleSaveRestaurant = async (restaurantData) => {
        try {
            if (editingRestaurant) {
                await api.updateRestaurant({ ...editingRestaurant, ...restaurantData });
                showToast('Restaurant updated successfully!', 'success');
            } else {
                await api.addRestaurant(restaurantData);
                showToast('Restaurant added successfully!', 'success');
            }
            await fetchData();
            setModalOpen(false);
            setEditingRestaurant(null);
        } catch (error) {
            showToast('Failed to save restaurant.', 'error');
        }
    };

    const handleDeleteRestaurant = (restaurant) => {
        setConfirmMessage(`Are you sure you want to delete "${restaurant.name}"? This will also delete its menu.`);
        setDeleteAction(() => async () => {
            try {
                await api.deleteRestaurant(restaurant.id);
                showToast('Restaurant deleted successfully!', 'success');
                await fetchData();
            } catch (error) {
                showToast('Failed to delete restaurant.', 'error');
            }
        });
        setConfirmModalOpen(true);
    };

    const handleOpenDisplayUrl = (restaurant) => {
        const baseUrl = window.location.origin + window.location.pathname;
        const url = `${baseUrl}?display_restaurant_id=${restaurant.id}`;
        setDisplayUrl(url);
        setUrlModalOpen(true);
    };
    
    const handleOpenPreviewModal = (restaurantId) => {
        setPreviewRestaurantId(restaurantId);
        setPreviewModalOpen(true);
    };
    
    const handleSystemImport = async (file) => {
        const jsonString = await file.text();
        const stats = await api.importSystemMenuFromJson(jsonString);
        setSystemImportStats(stats);
        showToast('System-wide import completed!', 'success');
        fetchData(); // Refresh data after import
        return stats;
    };


    if (loading) {
        return <div className="flex justify-center items-center h-96"><LoadingSpinner /></div>;
    }

    return (
        <div className="bg-white shadow-md rounded-lg border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <h2 className="text-2xl font-bold text-slate-700">Manage Restaurants</h2>
                <div className="flex items-center space-x-2">
                    {isSuperAdmin && (
                        <>
                            <select
                                value={filterPropertyId}
                                onChange={(e
