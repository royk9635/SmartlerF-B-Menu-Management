# 🚀 Frontend API Reference - Complete Endpoint List

This document contains all APIs exposed by the backend for frontend integration. Use this reference when connecting the frontend to the backend.

## 📋 **Base Configuration**

- **Base URL**: `http://localhost:3001/api` (or your deployed backend URL)
- **WebSocket URL**: `ws://localhost:3001` (or your deployed WebSocket URL)
- **Content-Type**: `application/json`
- **Authentication**: JWT Bearer Token (for protected endpoints)

---

## 🔐 **1. Authentication Endpoints**

### **POST /api/auth/login**
Login with email and password.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-123",
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "Superadmin",
      "propertyId": "prop-123"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Headers Required:** None

---

### **GET /api/auth/me**
Get current authenticated user information.

**Headers Required:** 
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "Superadmin",
    "propertyId": "prop-123"
  }
}
```

---

### **POST /api/auth/logout**
Logout current user.

**Headers Required:** 
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### **POST /api/auth/refresh**
Refresh JWT token.

**Headers Required:** 
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 🏢 **2. Properties Management**

### **GET /api/properties**
Get all properties.

**Headers Required:** 
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "prop-123",
      "name": "Downtown Location",
      "address": "123 Main St, City, State",
      "phone": "+1-555-0123",
      "email": "downtown@restaurant.com",
      "tenantId": "tenant-123",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### **GET /api/properties/:id**
Get property by ID.

**Headers Required:** 
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "prop-123",
    "name": "Downtown Location",
    "address": "123 Main St, City, State",
    "phone": "+1-555-0123",
    "email": "downtown@restaurant.com",
    "tenantId": "tenant-123",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### **POST /api/properties**
Create a new property.

**Headers Required:** 
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "New Location",
  "address": "456 Oak Ave, City, State",
  "phone": "+1-555-0456",
  "email": "newlocation@restaurant.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "prop-456",
    "name": "New Location",
    "address": "456 Oak Ave, City, State",
    "phone": "+1-555-0456",
    "email": "newlocation@restaurant.com",
    "tenantId": "tenant-123",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### **PUT /api/properties/:id**
Update a property.

**Headers Required:** 
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Updated Location",
  "address": "789 New St, City, State",
  "phone": "+1-555-0789",
  "email": "updated@restaurant.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "prop-123",
    "name": "Updated Location",
    "address": "789 New St, City, State",
    "phone": "+1-555-0789",
    "email": "updated@restaurant.com",
    "tenantId": "tenant-123",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-02T00:00:00Z"
  }
}
```

---

### **DELETE /api/properties/:id**
Delete a property.

**Headers Required:** 
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Property deleted successfully"
}
```

---

## 🍽️ **3. Restaurants Management**

### **GET /api/restaurants**
Get all restaurants. Optionally filter by property.

**Query Parameters:**
- `propertyId` (optional): Filter restaurants by property ID

**Example:** `GET /api/restaurants?propertyId=prop-123`

**Headers Required:** 
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "rest-123",
      "name": "Main Restaurant",
      "propertyId": "prop-123",
      "cuisine": "Italian",
      "phone": "+1-555-0123",
      "email": "main@restaurant.com",
      "address": "123 Main St, City, State",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### **POST /api/restaurants**
Create a new restaurant.

**Headers Required:** 
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "New Restaurant",
  "propertyId": "prop-123",
  "cuisine": "French",
  "phone": "+1-555-0456",
  "email": "new@restaurant.com",
  "address": "456 New St, City, State",
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "rest-456",
    "name": "New Restaurant",
    "propertyId": "prop-123",
    "cuisine": "French",
    "phone": "+1-555-0456",
    "email": "new@restaurant.com",
    "address": "456 New St, City, State",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### **PUT /api/restaurants/:id**
Update a restaurant.

**Headers Required:** 
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Updated Restaurant",
  "cuisine": "Mediterranean",
  "isActive": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "rest-123",
    "name": "Updated Restaurant",
    "propertyId": "prop-123",
    "cuisine": "Mediterranean",
    "phone": "+1-555-0123",
    "email": "main@restaurant.com",
    "address": "123 Main St, City, State",
    "isActive": false,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-02T00:00:00Z"
  }
}
```

---

### **DELETE /api/restaurants/:id**
Delete a restaurant.

**Headers Required:** 
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Restaurant deleted successfully"
}
```

---

## 📂 **4. Categories Management**

### **GET /api/categories**
Get all categories. Optionally filter by restaurant.

**Query Parameters:**
- `restaurantId` (optional): Filter categories by restaurant ID

**Example:** `GET /api/categories?restaurantId=rest-123`

**Headers Required:** 
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cat-123",
      "name": "Appetizers",
      "restaurantId": "rest-123",
      "description": "Start your meal with our delicious appetizers",
      "sortOrder": 1,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### **POST /api/categories**
Create a new category.

**Headers Required:** 
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Desserts",
  "restaurantId": "rest-123",
  "description": "Sweet endings to your meal",
  "sortOrder": 3,
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cat-456",
    "name": "Desserts",
    "restaurantId": "rest-123",
    "description": "Sweet endings to your meal",
    "sortOrder": 3,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### **PUT /api/categories/:id**
Update a category.

**Headers Required:** 
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Updated Category",
  "description": "Updated description",
  "sortOrder": 2,
  "isActive": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cat-123",
    "name": "Updated Category",
    "restaurantId": "rest-123",
    "description": "Updated description",
    "sortOrder": 2,
    "isActive": false,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-02T00:00:00Z"
  }
}
```

---

### **DELETE /api/categories/:id**
Delete a category.

**Headers Required:** 
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

---

## 🍕 **5. Menu Items Management**

### **GET /api/menu-items**
Get all menu items. Optionally filter by category or subcategory.

**Query Parameters:**
- `categoryId` (optional): Filter items by category ID
- `subCategoryId` (optional): Filter items by subcategory ID

**Examples:** 
- `GET /api/menu-items?categoryId=cat-123`
- `GET /api/menu-items?categoryId=cat-123&subCategoryId=subcat-456`

**Headers Required:** 
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "item-123",
      "name": "Caesar Salad",
      "description": "Fresh romaine lettuce with caesar dressing",
      "price": 12.99,
      "categoryId": "cat-123",
      "subCategoryId": null,
      "imageUrl": "https://example.com/images/caesar-salad.jpg",
      "isAvailable": true,
      "isVegetarian": true,
      "isVegan": false,
      "isGlutenFree": false,
      "allergens": ["dairy"],
      "attributes": ["healthy", "fresh"],
      "modifierGroups": ["dressing-options"],
      "nutritionInfo": {
        "calories": 250,
        "protein": 8,
        "carbs": 15,
        "fat": 18
      },
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### **POST /api/menu-items**
Create a new menu item.

**Headers Required:** 
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Margherita Pizza",
  "description": "Classic pizza with tomato, mozzarella, and basil",
  "price": 16.99,
  "categoryId": "cat-456",
  "subCategoryId": null,
  "isAvailable": true,
  "isVegetarian": true,
  "isVegan": false,
  "isGlutenFree": false,
  "allergens": ["gluten", "dairy"],
  "attributes": ["classic", "popular"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "item-456",
    "name": "Margherita Pizza",
    "description": "Classic pizza with tomato, mozzarella, and basil",
    "price": 16.99,
    "categoryId": "cat-456",
    "subCategoryId": null,
    "imageUrl": null,
    "isAvailable": true,
    "isVegetarian": true,
    "isVegan": false,
    "isGlutenFree": false,
    "allergens": ["gluten", "dairy"],
    "attributes": ["classic", "popular"],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### **PUT /api/menu-items/:id**
Update a menu item.

**Headers Required:** 
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Updated Item",
  "price": 18.99,
  "isAvailable": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "item-123",
    "name": "Updated Item",
    "description": "Fresh romaine lettuce with caesar dressing",
    "price": 18.99,
    "categoryId": "cat-123",
    "subCategoryId": null,
    "imageUrl": "https://example.com/images/caesar-salad.jpg",
    "isAvailable": false,
    "isVegetarian": true,
    "isVegan": false,
    "isGlutenFree": false,
    "allergens": ["dairy"],
    "attributes": ["healthy", "fresh"],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-02T00:00:00Z"
  }
}
```

---

### **DELETE /api/menu-items/:id**
Delete a menu item.

**Headers Required:** 
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Menu item deleted successfully"
}
```

---

### **PATCH /api/menu-items/bulk**
Bulk update multiple menu items.

**Headers Required:** 
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "itemIds": ["item-123", "item-456"],
  "changes": {
    "isAvailable": false,
    "price": 15.99
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Menu items updated successfully"
}
```

---

### **POST /api/menu-items/:id/image**
Upload an image for a menu item.

**Headers Required:** 
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body:** FormData with file field

**Response:**
```json
{
  "success": true,
  "data": {
    "imageUrl": "https://example.com/images/uploaded-image.jpg"
  }
}
```

---

## 👥 **6. User Management**

### **GET /api/users**
Get all users.

**Headers Required:** 
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "user-123",
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "Superadmin",
      "propertyId": "prop-123",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### **POST /api/users**
Create a new user.

**Headers Required:** 
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "password123",
  "role": "Manager",
  "propertyId": "prop-123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-456",
    "name": "New User",
    "email": "newuser@example.com",
    "role": "Manager",
    "propertyId": "prop-123",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### **PUT /api/users/:id**
Update a user.

**Headers Required:** 
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Updated User",
  "role": "Admin"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "name": "Updated User",
    "email": "admin@example.com",
    "role": "Admin",
    "propertyId": "prop-123",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-02T00:00:00Z"
  }
}
```

---

### **DELETE /api/users/:id**
Delete a user.

**Headers Required:** 
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## 📊 **7. Analytics & Sales**

### **GET /api/sales**
Get sales data for a date range.

**Query Parameters:**
- `startDate` (required): Start date in ISO format (YYYY-MM-DD)
- `endDate` (required): End date in ISO format (YYYY-MM-DD)
- `restaurantId` (optional): Filter by restaurant ID

**Example:** `GET /api/sales?startDate=2024-01-01&endDate=2024-01-31&restaurantId=rest-123`

**Headers Required:** 
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-01-01",
      "restaurantId": "rest-123",
      "totalSales": 1250.50,
      "orderCount": 45,
      "averageOrderValue": 27.79
    }
  ]
}
```

---

### **GET /api/analytics**
Get dashboard analytics.

**Query Parameters:**
- `restaurantId` (optional): Filter by restaurant ID

**Example:** `GET /api/analytics?restaurantId=rest-123`

**Headers Required:** 
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 12500.50,
    "totalOrders": 450,
    "averageOrderValue": 27.79,
    "topItems": [
      {
        "itemId": "item-123",
        "name": "Caesar Salad",
        "quantity": 120,
        "revenue": 1558.80
      }
    ],
    "categoryBreakdown": [
      {
        "categoryId": "cat-123",
        "name": "Appetizers",
        "revenue": 3500.00
      }
    ]
  }
}
```

---

## 📦 **8. Orders & Live Updates**

### **GET /api/orders**
Get all orders. Optionally filter by restaurant.

**Query Parameters:**
- `restaurantId` (optional): Filter orders by restaurant ID

**Example:** `GET /api/orders?restaurantId=rest-123`

**Headers Required:** 
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "order-123",
      "restaurantId": "rest-123",
      "customerName": "John Doe",
      "customerPhone": "+1-555-0123",
      "customerEmail": "john@example.com",
      "status": "pending",
      "items": [
        {
          "menuItemId": "item-123",
          "name": "Caesar Salad",
          "quantity": 2,
          "price": 12.99,
          "modifiers": [
            {
              "name": "Extra Dressing",
              "price": 1.00
            }
          ]
        }
      ],
      "subtotal": 25.98,
      "tax": 2.60,
      "total": 28.58,
      "notes": "No onions please",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### **PATCH /api/orders/:id/status**
Update order status.

**Headers Required:** 
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "preparing"
}
```

**Valid Status Values:** `pending`, `preparing`, `ready`, `completed`, `cancelled`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "order-123",
    "status": "preparing",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

## 🌐 **9. Public Menu (Customer-Facing)**

### **GET /api/public/menu/:restaurantId**
Get public menu for a restaurant (no authentication required).

**Headers Required:** None

**Response:**
```json
{
  "success": true,
  "data": {
    "restaurant": {
      "id": "rest-123",
      "name": "Main Restaurant",
      "cuisine": "Italian",
      "phone": "+1-555-0123",
      "address": "123 Main St, City, State"
    },
    "categories": [
      {
        "id": "cat-123",
        "name": "Appetizers",
        "description": "Start your meal with our delicious appetizers",
        "items": [
          {
            "id": "item-123",
            "name": "Caesar Salad",
            "description": "Fresh romaine lettuce with caesar dressing",
            "price": 12.99,
            "imageUrl": "https://example.com/images/caesar-salad.jpg",
            "isAvailable": true,
            "allergens": ["dairy"],
            "attributes": ["healthy", "fresh"]
          }
        ]
      }
    ]
  }
}
```

---

### **POST /api/public/orders**
Create a public order (customer-facing, no authentication required).

**Headers Required:** None

**Request Body:**
```json
{
  "restaurantId": "rest-123",
  "customerName": "John Doe",
  "customerPhone": "+1-555-0123",
  "customerEmail": "john@example.com",
  "items": [
    {
      "menuItemId": "item-123",
      "quantity": 2,
      "modifiers": [
        {
          "modifierItemId": "mod-item-1",
          "name": "Extra Dressing",
          "price": 1.00
        }
      ]
    }
  ],
  "notes": "No onions please"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "order-123",
    "restaurantId": "rest-123",
    "status": "pending",
    "total": 28.58,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

## 🏷️ **10. Attributes & Allergens**

### **GET /api/attributes**
Get all attributes.

**Headers Required:** 
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "attr-123",
      "name": "Spicy",
      "description": "Contains spicy ingredients",
      "color": "#ff4444",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### **POST /api/attributes**
Create a new attribute.

**Headers Required:** 
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Healthy",
  "description": "Healthy option",
  "color": "#00ff00"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "attr-456",
    "name": "Healthy",
    "description": "Healthy option",
    "color": "#00ff00",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### **PUT /api/attributes/:id**
Update an attribute.

**Headers Required:** 
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Updated Attribute",
  "color": "#ff0000"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "attr-123",
    "name": "Updated Attribute",
    "description": "Contains spicy ingredients",
    "color": "#ff0000",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-02T00:00:00Z"
  }
}
```

---

### **DELETE /api/attributes/:id**
Delete an attribute.

**Headers Required:** 
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Attribute deleted successfully"
}
```

---

### **GET /api/allergens**
Get all allergens.

**Headers Required:** 
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "allergen-123",
      "name": "Dairy",
      "description": "Contains dairy products",
      "icon": "🥛",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### **POST /api/allergens**
Create a new allergen.

**Headers Required:** 
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Nuts",
  "description": "Contains nuts",
  "icon": "🥜"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "allergen-456",
    "name": "Nuts",
    "description": "Contains nuts",
    "icon": "🥜",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### **PUT /api/allergens/:id**
Update an allergen.

**Headers Required:** 
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Updated Allergen",
  "icon": "🌰"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "allergen-123",
    "name": "Updated Allergen",
    "description": "Contains dairy products",
    "icon": "🌰",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-02T00:00:00Z"
  }
}
```

---

### **DELETE /api/allergens/:id**
Delete an allergen.

**Headers Required:** 
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Allergen deleted successfully"
}
```

---

## 🔧 **11. Modifiers**

### **GET /api/modifier-groups**
Get all modifier groups. Optionally filter by restaurant.

**Query Parameters:**
- `restaurantId` (optional): Filter modifier groups by restaurant ID

**Example:** `GET /api/modifier-groups?restaurantId=rest-123`

**Headers Required:** 
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "mod-group-123",
      "name": "Size Options",
      "restaurantId": "rest-123",
      "type": "single",
      "required": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### **GET /api/modifier-items**
Get all modifier items. Optionally filter by group.

**Query Parameters:**
- `groupId` (optional): Filter modifier items by group ID

**Example:** `GET /api/modifier-items?groupId=mod-group-123`

**Headers Required:** 
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "mod-item-123",
      "name": "Small",
      "groupId": "mod-group-123",
      "price": 0.00,
      "isAvailable": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### **POST /api/modifier-groups**
Create a new modifier group.

**Headers Required:** 
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Dressing Options",
  "restaurantId": "rest-123",
  "type": "single",
  "required": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "mod-group-456",
    "name": "Dressing Options",
    "restaurantId": "rest-123",
    "type": "single",
    "required": false,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### **POST /api/modifier-items**
Create a new modifier item.

**Headers Required:** 
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Large",
  "groupId": "mod-group-123",
  "price": 4.00,
  "isAvailable": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "mod-item-456",
    "name": "Large",
    "groupId": "mod-group-123",
    "price": 4.00,
    "isAvailable": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

## 🔄 **12. System & Utilities**

### **POST /api/import/menu/:restaurantId**
Import menu data for a restaurant.

**Headers Required:** 
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "categories": [
    {
      "name": "Appetizers",
      "items": [
        {
          "name": "Caesar Salad",
          "price": 12.99
        }
      ]
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "categoriesImported": 5,
    "itemsImported": 25,
    "message": "Menu imported successfully"
  }
}
```

---

### **POST /api/import/system-menu**
Import system menu data.

**Headers Required:** 
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "restaurantId": "rest-123",
  "menuData": {
    "categories": [...],
    "items": [...]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "categoriesImported": 10,
    "itemsImported": 50,
    "message": "System menu imported successfully"
  }
}
```

---

### **GET /api/audit-logs**
Get audit logs with optional filters.

**Query Parameters:**
- `userId` (optional): Filter by user ID
- `action` (optional): Filter by action type
- `startDate` (optional): Start date filter
- `endDate` (optional): End date filter

**Example:** `GET /api/audit-logs?userId=user-123&action=create&startDate=2024-01-01`

**Headers Required:** 
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "log-123",
      "userId": "user-123",
      "action": "create",
      "entityType": "menu-item",
      "entityId": "item-123",
      "details": {
        "name": "Caesar Salad"
      },
      "timestamp": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### **GET /api/health**
Health check endpoint (no authentication required).

**Headers Required:** None

**Response:**
```json
{
  "success": true,
  "message": "Backend is running",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

---

## 🔌 **WebSocket Events**

The backend also supports WebSocket connections for real-time updates.

**WebSocket URL:** `ws://localhost:3001` (or your deployed WebSocket URL)

### **Event Types:**

1. **order_created** - Emitted when a new order is created
2. **order_updated** - Emitted when an order status is updated
3. **menu_item_updated** - Emitted when a menu item is updated
4. **user_activity** - Emitted for user activity events
5. **system_notification** - Emitted for system notifications

### **WebSocket Message Format:**

```json
{
  "type": "order_updated",
  "data": {
    "orderId": "order-123",
    "restaurantId": "rest-123",
    "status": "preparing"
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

---

## ⚠️ **Error Handling**

All endpoints return errors in the following format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field": ["validation error message"]
  }
}
```

### **HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (valid token but insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## 📝 **Notes for Frontend Integration**

1. **Authentication**: Store the JWT token from login response and include it in the `Authorization` header for all protected endpoints.

2. **Base URL**: Configure the base URL in your frontend environment variables.

3. **Error Handling**: Always check the `success` field in responses before accessing `data`.

4. **CORS**: The backend is configured to allow requests from `http://localhost:5173` and `http://localhost:5174`. Update CORS settings for production.

5. **WebSocket**: Connect to WebSocket for real-time order updates and notifications.

6. **File Uploads**: For image uploads, use `multipart/form-data` content type.

---

## 🎯 **Quick Reference Summary**

| Category | Endpoints | Auth Required |
|----------|----------|---------------|
| Authentication | 4 endpoints | Partial |
| Properties | 5 endpoints | Yes |
| Restaurants | 5 endpoints | Yes |
| Categories | 4 endpoints | Yes |
| Menu Items | 6 endpoints | Yes |
| Users | 4 endpoints | Yes |
| Analytics | 2 endpoints | Yes |
| Orders | 2 endpoints | Yes |
| Public Menu | 2 endpoints | No |
| Attributes | 4 endpoints | Yes |
| Allergens | 4 endpoints | Yes |
| Modifiers | 4 endpoints | Yes |
| System | 3 endpoints | Yes |
| Health | 1 endpoint | No |

**Total: 50+ API endpoints**

---

This document contains all the APIs your frontend needs to integrate with the backend. Use this as a reference when implementing API calls in your frontend application.

