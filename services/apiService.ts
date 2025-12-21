import { httpClient, ApiResponse } from './httpClient';
import { API_CONFIG } from '../config/api';
import {
  Property, Restaurant, MenuCategory, MenuItem, User, Sale,
  Attribute, Allergen, ModifierGroup, ModifierItem, PublicMenu,
  AuditLog, LiveOrder, OrderStatus, SubCategory, SystemMenuImportPayload, SystemImportStats,
  ApiToken, GenerateTokenRequest
} from '../types';

// --- Authentication API ---
export const authApi = {
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    const response = await httpClient.post<ApiResponse<{ user: User; token: string }>>(
      API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      { email, password }
    );
    
    // Store token
    httpClient.setAuthToken(response.data.token);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await httpClient.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
    httpClient.clearAuthToken();
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await httpClient.get<ApiResponse<User>>(API_CONFIG.ENDPOINTS.AUTH.ME);
    return response.data;
  },

  refreshToken: async (): Promise<{ token: string }> => {
    const response = await httpClient.post<ApiResponse<{ token: string }>>(
      API_CONFIG.ENDPOINTS.AUTH.REFRESH
    );
    httpClient.setAuthToken(response.data.token);
    return response.data;
  },

  register: async (name: string, email: string, password: string, role: string = 'Staff', propertyId?: string | null): Promise<{ user: User; token: string }> => {
    const response = await httpClient.post<ApiResponse<{ user: User; token: string }>>(
      '/auth/register',
      { name, email, password, role, propertyId }
    );
    
    // Store token
    httpClient.setAuthToken(response.data.token);
    return response.data;
  },
};

// --- Properties API ---
export const propertiesApi = {
  getAll: async (): Promise<Property[]> => {
    const response = await httpClient.get<ApiResponse<Property[]>>(API_CONFIG.ENDPOINTS.PROPERTIES);
    return response.data;
  },

  getById: async (id: string): Promise<Property> => {
    const response = await httpClient.get<ApiResponse<Property>>(`${API_CONFIG.ENDPOINTS.PROPERTIES}/${id}`);
    return response.data;
  },

  create: async (data: Omit<Property, 'id' | 'tenantId'>): Promise<Property> => {
    const response = await httpClient.post<ApiResponse<Property>>(API_CONFIG.ENDPOINTS.PROPERTIES, data);
    return response.data;
  },

  update: async (id: string, data: Partial<Property>): Promise<Property> => {
    const response = await httpClient.put<ApiResponse<Property>>(`${API_CONFIG.ENDPOINTS.PROPERTIES}/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await httpClient.delete(`${API_CONFIG.ENDPOINTS.PROPERTIES}/${id}`);
  },
};

// --- Restaurants API ---
export const restaurantsApi = {
  getAll: async (): Promise<Restaurant[]> => {
    const response = await httpClient.get<ApiResponse<Restaurant[]>>(API_CONFIG.ENDPOINTS.RESTAURANTS);
    return response.data;
  },

  getByProperty: async (propertyId: string): Promise<Restaurant[]> => {
    const response = await httpClient.get<ApiResponse<Restaurant[]>>(
      `${API_CONFIG.ENDPOINTS.RESTAURANTS}?propertyId=${propertyId}`
    );
    return response.data;
  },

  create: async (data: Omit<Restaurant, 'id'>): Promise<Restaurant> => {
    const response = await httpClient.post<ApiResponse<Restaurant>>(API_CONFIG.ENDPOINTS.RESTAURANTS, data);
    return response.data;
  },

  update: async (id: string, data: Partial<Restaurant>): Promise<Restaurant> => {
    const response = await httpClient.put<ApiResponse<Restaurant>>(`${API_CONFIG.ENDPOINTS.RESTAURANTS}/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await httpClient.delete(`${API_CONFIG.ENDPOINTS.RESTAURANTS}/${id}`);
  },
};

// --- Categories API ---
export const categoriesApi = {
  getAll: async (restaurantId?: string): Promise<MenuCategory[]> => {
    let url = API_CONFIG.ENDPOINTS.CATEGORIES;
    if (restaurantId) {
      url += `?restaurantId=${restaurantId}`;
    }
    const response = await httpClient.get<ApiResponse<MenuCategory[]>>(url);
    return response.data;
  },

  getByRestaurant: async (restaurantId: string): Promise<MenuCategory[]> => {
    const response = await httpClient.get<ApiResponse<MenuCategory[]>>(
      `${API_CONFIG.ENDPOINTS.CATEGORIES}?restaurantId=${restaurantId}`
    );
    return response.data;
  },

  create: async (data: Omit<MenuCategory, 'id'>): Promise<MenuCategory> => {
    const response = await httpClient.post<ApiResponse<MenuCategory>>(API_CONFIG.ENDPOINTS.CATEGORIES, data);
    return response.data;
  },

  update: async (id: string, data: Partial<MenuCategory>): Promise<MenuCategory> => {
    const response = await httpClient.put<ApiResponse<MenuCategory>>(`${API_CONFIG.ENDPOINTS.CATEGORIES}/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await httpClient.delete(`${API_CONFIG.ENDPOINTS.CATEGORIES}/${id}`);
  },
};

// --- Menu Items API ---
export const menuItemsApi = {
  getByCategory: async (categoryId: string, subCategoryId?: string): Promise<MenuItem[]> => {
    let url = `${API_CONFIG.ENDPOINTS.MENU_ITEMS}?categoryId=${categoryId}`;
    if (subCategoryId) {
      url += `&subCategoryId=${subCategoryId}`;
    }
    const response = await httpClient.get<ApiResponse<MenuItem[]>>(url);
    return response.data;
  },

  getAll: async (): Promise<MenuItem[]> => {
    const response = await httpClient.get<ApiResponse<MenuItem[]>>(API_CONFIG.ENDPOINTS.MENU_ITEMS);
    return response.data;
  },

  create: async (data: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<MenuItem> => {
    const response = await httpClient.post<ApiResponse<MenuItem>>(API_CONFIG.ENDPOINTS.MENU_ITEMS, data);
    return response.data;
  },

  update: async (id: string, data: Partial<MenuItem>): Promise<MenuItem> => {
    const response = await httpClient.put<ApiResponse<MenuItem>>(`${API_CONFIG.ENDPOINTS.MENU_ITEMS}/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await httpClient.delete(`${API_CONFIG.ENDPOINTS.MENU_ITEMS}/${id}`);
  },

  bulkUpdate: async (itemIds: string[], changes: Partial<MenuItem>): Promise<void> => {
    await httpClient.patch(`${API_CONFIG.ENDPOINTS.MENU_ITEMS}/bulk`, { itemIds, changes });
  },

  uploadImage: async (itemId: string, file: File): Promise<{ imageUrl: string }> => {
    const response = await httpClient.uploadFile<ApiResponse<{ imageUrl: string }>>(
      `${API_CONFIG.ENDPOINTS.MENU_ITEMS}/${itemId}/image`,
      file
    );
    return response.data;
  },
};

// --- Users API ---
export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const response = await httpClient.get<ApiResponse<User[]>>(API_CONFIG.ENDPOINTS.USERS);
    return response.data;
  },

  create: async (data: Omit<User, 'id'>): Promise<User> => {
    const response = await httpClient.post<ApiResponse<User>>(API_CONFIG.ENDPOINTS.USERS, data);
    return response.data;
  },

  update: async (id: string, data: Partial<User>): Promise<User> => {
    const response = await httpClient.put<ApiResponse<User>>(`${API_CONFIG.ENDPOINTS.USERS}/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await httpClient.delete(`${API_CONFIG.ENDPOINTS.USERS}/${id}`);
  },
};

// --- Analytics API ---
export const analyticsApi = {
  getSales: async (startDate: string, endDate: string, restaurantId?: string): Promise<Sale[]> => {
    let url = `${API_CONFIG.ENDPOINTS.SALES}?startDate=${startDate}&endDate=${endDate}`;
    if (restaurantId) {
      url += `&restaurantId=${restaurantId}`;
    }
    const response = await httpClient.get<ApiResponse<Sale[]>>(url);
    return response.data;
  },

  getDashboardStats: async (restaurantId?: string): Promise<any> => {
    let url = API_CONFIG.ENDPOINTS.ANALYTICS;
    if (restaurantId) {
      url += `?restaurantId=${restaurantId}`;
    }
    const response = await httpClient.get<ApiResponse<any>>(url);
    return response.data;
  },
};

// --- Live Orders API ---
export const ordersApi = {
  getLiveOrders: async (restaurantId?: string): Promise<LiveOrder[]> => {
    let url = API_CONFIG.ENDPOINTS.ORDERS;
    if (restaurantId) {
      url += `?restaurantId=${restaurantId}`;
    }
    const response = await httpClient.get<ApiResponse<LiveOrder[]>>(url);
    return response.data;
  },

  updateOrderStatus: async (orderId: string, status: OrderStatus): Promise<LiveOrder> => {
    const response = await httpClient.patch<ApiResponse<LiveOrder>>(
      `${API_CONFIG.ENDPOINTS.ORDERS}/${orderId}/status`,
      { status }
    );
    return response.data;
  },
};

// --- Public Menu API ---
export const publicMenuApi = {
  getMenu: async (restaurantId: string): Promise<PublicMenu> => {
    const response = await httpClient.get<ApiResponse<PublicMenu>>(
      `${API_CONFIG.ENDPOINTS.PUBLIC_MENU}/${restaurantId}`
    );
    return response.data;
  },
};

// --- System Import API ---
export const importApi = {
  importMenu: async (restaurantId: string, data: any): Promise<any> => {
    const response = await httpClient.post<ApiResponse<any>>(
      `${API_CONFIG.ENDPOINTS.IMPORT}/menu/${restaurantId}`,
      data
    );
    return response.data;
  },

  importSystemMenu: async (data: SystemMenuImportPayload): Promise<SystemImportStats> => {
    const response = await httpClient.post<ApiResponse<SystemImportStats>>(
      `${API_CONFIG.ENDPOINTS.IMPORT}/system-menu`,
      data
    );
    return response.data;
  },
};

// --- Audit Logs API ---
export const auditApi = {
  getLogs: async (filters: any): Promise<AuditLog[]> => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await httpClient.get<ApiResponse<AuditLog[]>>(
      `${API_CONFIG.ENDPOINTS.AUDIT_LOGS}?${queryParams}`
    );
    return response.data;
  },
};

// --- Attributes & Allergens API ---
export const attributesApi = {
  getAll: async (): Promise<Attribute[]> => {
    const response = await httpClient.get<ApiResponse<Attribute[]>>(API_CONFIG.ENDPOINTS.ATTRIBUTES);
    return response.data;
  },

  create: async (data: Omit<Attribute, 'id'>): Promise<Attribute> => {
    const response = await httpClient.post<ApiResponse<Attribute>>(API_CONFIG.ENDPOINTS.ATTRIBUTES, data);
    return response.data;
  },

  update: async (id: string, data: Partial<Attribute>): Promise<Attribute> => {
    const response = await httpClient.put<ApiResponse<Attribute>>(`${API_CONFIG.ENDPOINTS.ATTRIBUTES}/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await httpClient.delete(`${API_CONFIG.ENDPOINTS.ATTRIBUTES}/${id}`);
  },
};

export const allergensApi = {
  getAll: async (): Promise<Allergen[]> => {
    const response = await httpClient.get<ApiResponse<Allergen[]>>(API_CONFIG.ENDPOINTS.ALLERGENS);
    return response.data;
  },

  create: async (data: Omit<Allergen, 'id'>): Promise<Allergen> => {
    const response = await httpClient.post<ApiResponse<Allergen>>(API_CONFIG.ENDPOINTS.ALLERGENS, data);
    return response.data;
  },

  update: async (id: string, data: Partial<Allergen>): Promise<Allergen> => {
    const response = await httpClient.put<ApiResponse<Allergen>>(`${API_CONFIG.ENDPOINTS.ALLERGENS}/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await httpClient.delete(`${API_CONFIG.ENDPOINTS.ALLERGENS}/${id}`);
  },
};

// --- Modifiers API ---
export const modifiersApi = {
  getGroups: async (restaurantId: string): Promise<ModifierGroup[]> => {
    const response = await httpClient.get<ApiResponse<ModifierGroup[]>>(
      `${API_CONFIG.ENDPOINTS.MODIFIER_GROUPS}?restaurantId=${restaurantId}`
    );
    return response.data;
  },

  getItems: async (groupId: string): Promise<ModifierItem[]> => {
    const response = await httpClient.get<ApiResponse<ModifierItem[]>>(
      `${API_CONFIG.ENDPOINTS.MODIFIER_ITEMS}?groupId=${groupId}`
    );
    return response.data;
  },

  createGroup: async (data: Omit<ModifierGroup, 'id'>): Promise<ModifierGroup> => {
    const response = await httpClient.post<ApiResponse<ModifierGroup>>(API_CONFIG.ENDPOINTS.MODIFIER_GROUPS, data);
    return response.data;
  },

  createItem: async (data: Omit<ModifierItem, 'id'>): Promise<ModifierItem> => {
    const response = await httpClient.post<ApiResponse<ModifierItem>>(API_CONFIG.ENDPOINTS.MODIFIER_ITEMS, data);
    return response.data;
  },
};

// --- API Tokens API ---
export const apiTokensApi = {
  generate: async (data: GenerateTokenRequest): Promise<ApiToken> => {
    const response = await httpClient.post<ApiResponse<ApiToken>>('/tokens/generate', data);
    return response.data;
  },

  getAll: async (): Promise<ApiToken[]> => {
    const response = await httpClient.get<ApiResponse<ApiToken[]>>('/tokens');
    return response.data;
  },

  revoke: async (id: string): Promise<void> => {
    await httpClient.patch(`/tokens/${id}/revoke`);
  },

  activate: async (id: string): Promise<void> => {
    await httpClient.patch(`/tokens/${id}/activate`);
  },

  delete: async (id: string): Promise<void> => {
    await httpClient.delete(`/tokens/${id}`);
  },

  verify: async (token: string): Promise<ApiToken> => {
    const response = await httpClient.get<ApiResponse<ApiToken>>('/tokens/verify', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  },
};
