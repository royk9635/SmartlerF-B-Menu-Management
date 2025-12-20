# 🚀 Backend API Specification for F&B Menu Management

## 📋 **Complete Endpoint List**

### **1. Authentication Endpoints**
```http
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/me
```

### **2. Properties Management**
```http
GET    /api/properties
GET    /api/properties/{id}
POST   /api/properties
PUT    /api/properties/{id}
DELETE /api/properties/{id}
```

### **3. Restaurants Management**
```http
GET    /api/restaurants
GET    /api/restaurants?propertyId={propertyId}
POST   /api/restaurants
PUT    /api/restaurants/{id}
DELETE /api/restaurants/{id}
```

### **4. Categories Management**
```http
GET    /api/categories?restaurantId={restaurantId}
POST   /api/categories
PUT    /api/categories/{id}
DELETE /api/categories/{id}
```

### **5. Menu Items Management**
```http
GET    /api/menu-items?categoryId={categoryId}&subCategoryId={subCategoryId}
GET    /api/menu-items
POST   /api/menu-items
PUT    /api/menu-items/{id}
DELETE /api/menu-items/{id}
PATCH  /api/menu-items/bulk
POST   /api/menu-items/{id}/image
```

### **6. User Management**
```http
GET    /api/users
POST   /api/users
PUT    /api/users/{id}
DELETE /api/users/{id}
```

### **7. Analytics & Sales**
```http
GET /api/sales?startDate={date}&endDate={date}&restaurantId={id}
GET /api/analytics?restaurantId={id}
```

### **8. Orders & Live Updates**
```http
GET  /api/orders?restaurantId={id}
PATCH /api/orders/{id}/status
```

### **9. Public Menu (Customer-Facing)**
```http
GET /api/public/menu/{restaurantId}
POST /api/public/orders
```

### **10. Attributes & Allergens**
```http
GET    /api/attributes
POST   /api/attributes
PUT    /api/attributes/{id}
DELETE /api/attributes/{id}

GET    /api/allergens
POST   /api/allergens
PUT    /api/allergens/{id}
DELETE /api/allergens/{id}
```

### **11. Modifiers**
```http
GET    /api/modifier-groups?restaurantId={id}
GET    /api/modifier-items?groupId={id}
POST   /api/modifier-groups
POST   /api/modifier-items
```

### **12. System & Utilities**
```http
POST   /api/import/menu/{restaurantId}
POST   /api/import/system-menu
GET    /api/audit-logs?{filters}
```

---

## 📝 **Detailed Request/Response Examples**

### **Authentication**

#### **POST /api/auth/login**
```json
// Request
{
  "email": "admin@example.com",
  "password": "password123"
}

// Response
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

#### **GET /api/auth/me**
```json
// Response
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

### **Properties**

#### **GET /api/properties**
```json
// Response
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

#### **POST /api/properties**
```json
// Request
{
  "name": "New Location",
  "address": "456 Oak Ave, City, State",
  "phone": "+1-555-0456",
  "email": "newlocation@restaurant.com"
}

// Response
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

### **Restaurants**

#### **GET /api/restaurants?propertyId=prop-123**
```json
// Response
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

### **Categories**

#### **GET /api/categories?restaurantId=rest-123**
```json
// Response
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

### **Menu Items**

#### **GET /api/menu-items?categoryId=cat-123**
```json
// Response
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

#### **POST /api/menu-items**
```json
// Request
{
  "name": "Margherita Pizza",
  "description": "Classic pizza with tomato, mozzarella, and basil",
  "price": 16.99,
  "categoryId": "cat-456",
  "isAvailable": true,
  "isVegetarian": true,
  "isVegan": false,
  "isGlutenFree": false,
  "allergens": ["gluten", "dairy"],
  "attributes": ["classic", "popular"]
}

// Response
{
  "success": true,
  "data": {
    "id": "item-456",
    "name": "Margherita Pizza",
    "description": "Classic pizza with tomato, mozzarella, and basil",
    "price": 16.99,
    "categoryId": "cat-456",
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

### **Public Menu**

#### **GET /api/public/menu/rest-123**
```json
// Response
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

### **Orders**

#### **GET /api/orders?restaurantId=rest-123**
```json
// Response
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

#### **PATCH /api/orders/order-123/status**
```json
// Request
{
  "status": "preparing"
}

// Response
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

## 🔌 **WebSocket Events**

Your backend should emit these WebSocket events:

```javascript
// WebSocket Event Types
const WebSocketEvents = {
  ORDER_CREATED: 'order_created',
  ORDER_UPDATED: 'order_updated', 
  MENU_ITEM_UPDATED: 'menu_item_updated',
  USER_ACTIVITY: 'user_activity',
  SYSTEM_NOTIFICATION: 'system_notification'
};

// Example WebSocket message format
{
  "type": "order_created",
  "data": {
    "orderId": "order-123",
    "restaurantId": "rest-123",
    "status": "pending"
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

---

## 🛡️ **Authentication & CORS**

### **JWT Token Authentication**
- Include `Authorization: Bearer <token>` header for protected endpoints
- Return `401 Unauthorized` for invalid/expired tokens

### **CORS Configuration**
```javascript
// Allow these origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174', 
  'https://your-frontend-domain.com'
];
```

---

## 📊 **Error Handling**

### **Standard Error Response**
```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field": ["validation error message"]
  }
}
```

### **HTTP Status Codes**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## 🧪 **Testing Endpoints**

Use these curl commands to test your backend:

```bash
# Test basic connectivity
curl http://localhost:3001/api/health

# Test login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password"}'

# Test public menu
curl http://localhost:3001/api/public/menu/rest-123

# Test with authentication
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/properties
```

This specification covers all the endpoints your frontend needs. Let me know which backend technology you're using, and I can provide specific implementation examples!
