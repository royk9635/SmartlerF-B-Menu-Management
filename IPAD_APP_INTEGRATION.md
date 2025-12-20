# 📱 iPad App Integration Guide

## 🎯 **Overview**
This guide shows how to integrate your iPad app with the F&B Portal APIs to fetch restaurant data, menus, and handle orders.

---

## 🚀 **Quick Start**

### **1. Start the API Server**
```bash
cd backend
node ipad-api-server.js
```

### **2. Test the API**
```bash
# Test health endpoint
curl http://localhost:3001/api/health

# Test restaurants endpoint
curl http://localhost:3001/api/restaurants
```

---

## 📋 **API Endpoints for iPad App**

### **Base URL**
```
http://localhost:3001/api
```

### **Authentication**
- ✅ **No authentication required** - All endpoints are public
- ✅ **CORS enabled** - Works with any origin
- ✅ **RESTful design** - Standard HTTP methods

---

## 🏪 **Restaurant Endpoints**

### **Get All Restaurants**
```http
GET /api/restaurants
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "rest-123",
      "name": "Downtown Bistro",
      "cuisine": "Italian",
      "phone": "+1-555-0123",
      "email": "downtown@bistro.com",
      "address": "123 Main St, Downtown, City",
      "description": "Authentic Italian cuisine in the heart of downtown",
      "imageUrl": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
      "isActive": true,
      "operatingHours": {
        "monday": { "open": "11:00", "close": "22:00" },
        "tuesday": { "open": "11:00", "close": "22:00" },
        "wednesday": { "open": "11:00", "close": "22:00" },
        "thursday": { "open": "11:00", "close": "22:00" },
        "friday": { "open": "11:00", "close": "23:00" },
        "saturday": { "open": "10:00", "close": "23:00" },
        "sunday": { "open": "10:00", "close": "21:00" }
      }
    }
  ],
  "count": 1
}
```

### **Get Restaurant by ID**
```http
GET /api/restaurants/{restaurantId}
```

**Example:**
```bash
curl http://localhost:3001/api/restaurants/rest-123
```

---

## 🍽️ **Menu Endpoints**

### **Get Complete Menu for Restaurant**
```http
GET /api/restaurants/{restaurantId}/menu
```

**Response:**
```json
{
  "success": true,
  "data": {
    "restaurant": {
      "id": "rest-123",
      "name": "Downtown Bistro",
      "cuisine": "Italian",
      "phone": "+1-555-0123",
      "address": "123 Main St, Downtown, City",
      "description": "Authentic Italian cuisine in the heart of downtown",
      "imageUrl": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
      "operatingHours": { /* operating hours */ }
    },
    "categories": [
      {
        "id": "cat-123",
        "name": "Appetizers",
        "description": "Start your meal with our delicious appetizers",
        "sortOrder": 1,
        "isActive": true,
        "imageUrl": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400",
        "items": [
          {
            "id": "item-123",
            "name": "Caesar Salad",
            "description": "Fresh romaine lettuce with house-made caesar dressing",
            "price": 12.99,
            "imageUrl": "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=600",
            "isAvailable": true,
            "isVegetarian": true,
            "isVegan": false,
            "isGlutenFree": false,
            "isSpicy": false,
            "allergens": ["dairy", "gluten"],
            "attributes": ["healthy", "fresh", "popular"],
            "nutritionInfo": {
              "calories": 250,
              "protein": 8,
              "carbs": 15,
              "fat": 18,
              "fiber": 3
            },
            "preparationTime": "10-15 minutes"
          }
        ]
      }
    ]
  }
}
```

### **Get Categories Only**
```http
GET /api/restaurants/{restaurantId}/categories
```

### **Get Items for Specific Category**
```http
GET /api/restaurants/{restaurantId}/categories/{categoryId}/items
```

### **Get Specific Menu Item**
```http
GET /api/menu-items/{itemId}
```

---

## 🔍 **Search Endpoints**

### **Search Menu Items**
```http
GET /api/restaurants/{restaurantId}/search?q={query}&category={categoryId}&dietary={dietary}
```

**Query Parameters:**
- `q` - Search query (name or description)
- `category` - Filter by category ID
- `dietary` - Filter by dietary requirements (`vegetarian`, `vegan`, `gluten-free`)

**Examples:**
```bash
# Search for "pizza"
curl "http://localhost:3001/api/restaurants/rest-123/search?q=pizza"

# Search for vegetarian items
curl "http://localhost:3001/api/restaurants/rest-123/search?dietary=vegetarian"

# Search for items in appetizers category
curl "http://localhost:3001/api/restaurants/rest-123/search?category=cat-123"
```

---

## 🛒 **Order Endpoints**

### **Create New Order**
```http
POST /api/orders
```

**Request Body:**
```json
{
  "restaurantId": "rest-123",
  "customerInfo": {
    "name": "John Doe",
    "phone": "+1-555-0123",
    "email": "john@example.com"
  },
  "items": [
    {
      "menuItemId": "item-123",
      "name": "Caesar Salad",
      "quantity": 2,
      "price": 12.99,
      "modifiers": [
        {
          "id": "mod-item-1",
          "name": "Extra Cheese",
          "price": 1.50
        }
      ]
    }
  ],
  "total": 28.06,
  "notes": "No onions please"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "order-abc123",
    "restaurantId": "rest-123",
    "customerInfo": { /* customer info */ },
    "items": [ /* order items */ ],
    "subtotal": 25.98,
    "tax": 2.08,
    "total": 28.06,
    "status": "pending",
    "notes": "No onions please",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "message": "Order created successfully"
}
```

### **Get Order Status**
```http
GET /api/orders/{orderId}
```

---

## 🎛️ **Modifiers Endpoints**

### **Get Modifiers for Menu Item**
```http
GET /api/menu-items/{itemId}/modifiers
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "mod-123",
      "name": "Size",
      "type": "single",
      "required": true,
      "items": [
        { "id": "mod-item-1", "name": "Small", "price": 0 },
        { "id": "mod-item-2", "name": "Medium", "price": 2.00 },
        { "id": "mod-item-3", "name": "Large", "price": 4.00 }
      ]
    },
    {
      "id": "mod-456",
      "name": "Extra Toppings",
      "type": "multiple",
      "required": false,
      "items": [
        { "id": "mod-item-4", "name": "Extra Cheese", "price": 1.50 },
        { "id": "mod-item-5", "name": "Extra Basil", "price": 0.50 }
      ]
    }
  ]
}
```

---

## 📱 **iPad App Integration Examples**

### **React Native / JavaScript**

```javascript
// API Configuration
const API_BASE_URL = 'http://localhost:3001/api';

// Fetch all restaurants
const fetchRestaurants = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/restaurants`);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return [];
  }
};

// Fetch menu for restaurant
const fetchMenu = async (restaurantId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/restaurants/${restaurantId}/menu`);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching menu:', error);
    return null;
  }
};

// Create order
const createOrder = async (orderData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error creating order:', error);
    return null;
  }
};

// Search menu items
const searchMenuItems = async (restaurantId, query, filters = {}) => {
  try {
    const params = new URLSearchParams({
      q: query,
      ...filters
    });
    
    const response = await fetch(`${API_BASE_URL}/restaurants/${restaurantId}/search?${params}`);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error searching menu:', error);
    return [];
  }
};
```

### **Swift / iOS**

```swift
// API Configuration
let API_BASE_URL = "http://localhost:3001/api"

// Fetch restaurants
func fetchRestaurants() async -> [Restaurant] {
    guard let url = URL(string: "\(API_BASE_URL)/restaurants") else {
        return []
    }
    
    do {
        let (data, _) = try await URLSession.shared.data(from: url)
        let response = try JSONDecoder().decode(RestaurantsResponse.self, from: data)
        return response.data
    } catch {
        print("Error fetching restaurants: \(error)")
        return []
    }
}

// Fetch menu
func fetchMenu(restaurantId: String) async -> Menu? {
    guard let url = URL(string: "\(API_BASE_URL)/restaurants/\(restaurantId)/menu") else {
        return nil
    }
    
    do {
        let (data, _) = try await URLSession.shared.data(from: url)
        let response = try JSONDecoder().decode(MenuResponse.self, from: data)
        return response.data
    } catch {
        print("Error fetching menu: \(error)")
        return nil
    }
}
```

---

## 🧪 **Testing the API**

### **Test All Endpoints**
```bash
# Health check
curl http://localhost:3001/api/health

# Get restaurants
curl http://localhost:3001/api/restaurants

# Get specific restaurant
curl http://localhost:3001/api/restaurants/rest-123

# Get complete menu
curl http://localhost:3001/api/restaurants/rest-123/menu

# Get categories
curl http://localhost:3001/api/restaurants/rest-123/categories

# Get items in category
curl http://localhost:3001/api/restaurants/rest-123/categories/cat-123/items

# Get specific menu item
curl http://localhost:3001/api/menu-items/item-123

# Get modifiers
curl http://localhost:3001/api/menu-items/item-123/modifiers

# Search items
curl "http://localhost:3001/api/restaurants/rest-123/search?q=pizza"

# Create order
curl -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "restaurantId": "rest-123",
    "customerInfo": {
      "name": "John Doe",
      "phone": "+1-555-0123",
      "email": "john@example.com"
    },
    "items": [
      {
        "menuItemId": "item-123",
        "name": "Caesar Salad",
        "quantity": 2,
        "price": 12.99,
        "modifiers": []
      }
    ],
    "total": 25.98,
    "notes": "No onions please"
  }'
```

---

## 🔧 **Configuration**

### **CORS Settings**
- ✅ **All origins allowed** - Works with any domain
- ✅ **No authentication required** - Public endpoints
- ✅ **JSON responses** - Standard format

### **Error Handling**
All endpoints return consistent error format:
```json
{
  "success": false,
  "message": "Error description"
}
```

### **HTTP Status Codes**
- `200` - Success
- `201` - Created (for orders)
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

---

## 🚀 **Deployment**

### **For Production**
1. **Update CORS origins** to your iPad app's domain
2. **Add authentication** if needed
3. **Use HTTPS** for security
4. **Add rate limiting** to prevent abuse
5. **Add logging** for monitoring

### **Environment Variables**
```bash
PORT=3001
NODE_ENV=production
CORS_ORIGINS=https://your-ipad-app.com
```

---

## 📞 **Support**

If you need help with integration:
1. Check the API health endpoint first
2. Verify CORS settings
3. Test with curl commands
4. Check browser network tab for errors

**API Server Status:** `http://localhost:3001/api/health`
