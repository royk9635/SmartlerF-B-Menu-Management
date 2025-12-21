export interface Property {
    id: string;
    name: string;
    address: string;
    tenantId: string;
}

export interface Restaurant {
    id: string;
    name: string;
    propertyId: string;
}

export interface MenuCategory {
    id: string;
    name: string;
    description: string;
    sortOrder: number;
    activeFlag: boolean;
    restaurantId: string;
}

export interface SubCategory {
    id: string;
    name: string;
    sortOrder: number;
    categoryId: string;
}

export enum SpecialType {
    NONE = 'None',
    VEG = 'Vegetarian',
    NON_VEG = 'Non-Vegetarian',
    VEGAN = 'Vegan',
    CHEF_SPECIAL = "Chef's Special",
}

export enum ImageOrientation {
    LANDSCAPE = '16:9',
    PORTRAIT = '3:4',
    SQUARE = '1:1',
}

// --- Attribute Types ---
export enum AttributeType {
    TEXT = 'Text',
    NUMBER = 'Number',
    BOOLEAN = 'Checkbox',
    SELECT = 'Dropdown',
}

export interface Attribute {
    id: string;
    name: string;
    type: AttributeType;
    options?: string[]; // For SELECT type
}

// --- Allergen Type ---
export interface Allergen {
    id: string;
    name: string;
}

// --- Modifier Types ---
export interface ModifierGroup {
    id: string;
    name: string;
    restaurantId: string;
    minSelection: number;
    maxSelection: number;
}

export interface ModifierItem {
    id: string;
    name: string;
    price: number;
    modifierGroupId: string;
}


export interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: Currency;
    imageUrl: string;
    videoUrl?: string;
    allergens: string[]; // Now stores an array of Allergen IDs
    categoryId: string;
    subCategoryId?: string; // Added for subcategory support
    availabilityFlag: boolean;
    tenantId: string;
    createdAt: string;
    updatedAt: string;
    sortOrder: number;
    modifierGroupIds?: string[]; // Links to modifier groups
    
    // New fields based on reference
    displayName?: string;
    itemCode?: string;
    prepTime?: number; // in minutes
    soldOut: boolean;
    portion?: string;
    specialType?: SpecialType;
    calories?: number;
    maxOrderQty?: number;
    bogo: boolean;
    complimentary?: string;
    imageOrientation?: ImageOrientation;
    availableTime?: string;
    availableDate?: string;

    // Custom attributes
    attributes?: Record<string, string | number | boolean>;
}

export enum Currency {
    USD = 'USD',
    EUR = 'EUR',
    GBP = 'GBP',
    JPY = 'JPY',
    INR = 'INR',
}

export enum BulkAction {
    ENABLE_ITEMS = 'enable',
    DISABLE_ITEMS = 'disable',
    MARK_SOLD_OUT = 'sold_out',
    ENABLE_BOGO = 'enable_bogo',
    DISABLE_BOGO = 'disable_bogo',
    CHANGE_CURRENCY = 'change_currency',
}

export interface Sale {
    id: string;
    items: {
        menuItemId: string;
        quantity: number;
        price: number; // Price at time of sale
    }[];
    totalAmount: number;
    saleDate: string; // ISO string
    restaurantId: string;
    tableNumber: number;
}

// FIX: Moved PublicMenu interface here from services/mockApiService.ts to fix import error.
export interface PublicMenu {
    restaurant: Restaurant;
    categories: (MenuCategory & { 
        subcategories: (SubCategory & { items: MenuItem[] })[];
        items: MenuItem[]; // Items directly under the category
    })[];
}


// --- RBAC Types ---

export enum UserRole {
    SUPERADMIN = 'SuperAdmin',
    ADMIN = 'Admin',
    MANAGER = 'Manager',
    STAFF = 'Staff',
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    propertyId?: string; // Only for Property Admins
    password?: string;
}

// --- Audit Log Types ---

export enum ActionType {
    CREATE = 'Create',
    UPDATE = 'Update',
    DELETE = 'Delete',
}

export enum EntityType {
    PROPERTY = 'Property',
    RESTAURANT = 'Restaurant',
    CATEGORY = 'Category',
    SUBCATEGORY = 'Subcategory',
    MENU_ITEM = 'Menu Item',
    USER = 'User',
    ATTRIBUTE = 'Attribute',
    ALLERGEN = 'Allergen',
    MODIFIER_GROUP = 'Modifier Group',
    MODIFIER_ITEM = 'Modifier Item',
}

export interface AuditLog {
    id: string;
    timestamp: string; // ISO string
    userId: string;
    userName: string;
    actionType: ActionType;
    entityType: EntityType;
    entityName: string; // e.g., "Grand Hotel Downtown" or "Grilled Salmon"
    details: string; // e.g., "Updated price from $25.00 to $28.00"
}

// --- System-Wide Import Types ---

export interface SystemCondimentItem {
    condimentItemName: string;
    condimentItemCode: string;
    calorificValue: string | null;
    attributeList: string;
}

export interface SystemCondiment {
    condimentName: string;
    condimentCode: string;
    condimentItems: SystemCondimentItem[];
}

export interface SystemMenuItem {
    itemName: string;
    itemCode: string;
    itemImage: string;
    itemPrice: number;
    restaurantId: string;
    restaurantName: string;
    category: string; // Used to find category name if categoryId link fails
    categoryId: string;
    attributeList: string;
    itemDescription: string;
    calorificValue: string;
    preparationTime: string;
    perServe: string;
    sortOrder: number;
    condimentCodes: string;
}

export interface SystemCategoryNode {
    id: string;
    name: string;
    sortOrder: number;
    categories: SystemCategoryNode[] | null;
}

export interface SystemRestaurantCategoryInfo {
    restaurantId: string;
    restaurantName: string;
    categories: SystemCategoryNode[];
}

export interface SystemMenuImportPayload {
    items: SystemMenuItem[];
    condiments: SystemCondiment[];
    restaurantCategory: SystemRestaurantCategoryInfo[];
}

export interface SystemImportStats {
    restaurantsProcessed: number;
    restaurantsSkipped: { id: string; name: string }[];
    categoriesCreated: number;
    subcategoriesCreated: number;
    itemsCreated: number;
    itemsUpdated: number;
    allergensCreated: number;
    modifierGroupsCreated: number;
    modifierItemsCreated: number;
}


// --- Live Order Types ---

export enum OrderStatus {
    NEW = 'New',
    PREPARING = 'Preparing',
    READY = 'Ready',
    COMPLETED = 'Completed',
}

export interface LiveOrder {
    id: string;
    items: {
        menuItemId: string;
        quantity: number;
        price: number;
    }[];
    totalAmount: number;
    placedAt: string; // ISO string
    restaurantId: string;
    tableNumber: number | null;
    status: OrderStatus;
}

// --- API Token Types ---
export interface ApiToken {
    id: string;
    name: string;
    token?: string; // Only present when generating new token
    tokenPreview?: string; // Partial token for display
    restaurantId: string | null;
    propertyId: string | null;
    isActive: boolean;
    expiresAt: string | null;
    createdAt: string;
    lastUsedAt: string | null;
    createdBy: string;
}

export interface GenerateTokenRequest {
    name: string;
    restaurantId?: string;
    propertyId?: string;
    expiresInDays?: number;
}
