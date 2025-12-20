# 📱 Tablet App API Reference

Complete API reference for integrating the F&B Menu Management API with tablet applications.

---

## 🔗 Base URL

```
Production: https://your-api-domain.com/api
Development: http://localhost:3001/api
```

---

## 🔐 Authentication

All endpoints (except public endpoints) require authentication using API tokens.

### Header Format
```
Authorization: Bearer <api_token>
```

### Getting an API Token

1. Login to the portal and generate an API token
2. Token format: `tb_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
3. Save token securely - it's only shown once during generation

---

## 📋 Endpoints

### 🔍 **GET /api/tokens/verify**
Verify if an API token is valid.

**Headers:**
```
Authorization: Bearer <api_token>
```

**Response:**
```json
{
  "success": true,
  "message": "API token is valid",
  "data": {
    "tokenId": "token-123",
    "name": "Tablet App Token",
    "restaurantId": "rest-123",
    "propertyId": "prop-123",
    "isActive": true,
    "expiresAt": "2026-12-19T00:00:00.000Z"
  }
}
```

---

### 🏢 **GET /api/restaurants**
Get all restaurants accessible by the API token.

**Headers:**
```
Authorization: Bearer <api_token>
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
      "address": "123 Main St, City, State",
      "phone": "+1-555-0123",
      "email": "info@restaurant.com",
      "isActive": true,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 🏢 **GET /api/restaurants/:id**
Get a specific restaurant by ID.

**Headers:**
```
Authorization: Bearer <api_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "rest-123",
    "name": "Main Restaurant",
    "propertyId": "prop-123",
    "address": "123 Main St",
    "phone": "+1-555-0123",
    "isActive": true
  }
}
```

---

### 📂 **GET /api/categories**
Get categories for a restaurant.

**Query Parameters:**
- `restaurantId` (required): Restaurant ID

**Headers:**
```
Authorization: Bearer <api_token>
```

**Example:**
```
GET /api/categories?restaurantId=rest-123
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
      "displayOrder": 1,
      "isActive": true,
      "imageUrl": "https://..."
    }
  ]
}
```

---

### 🍽️ **GET /api/menu-items**
Get menu items, optionally filtered by category or restaurant.

**Query Parameters:**
- `categoryId` (optional): Filter by category ID
- `restaurantId` (optional): Filter by restaurant ID

**Headers:**
```
Authorization: Bearer <api_token>
```

**Example:**
```
GET /api/menu-items?categoryId=cat-123
GET /api/menu-items?restaurantId=rest-123
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "item-123",
      "name": "Caesar Salad",
      "categoryId": "cat-123",
      "restaurantId": "rest-123",
      "description": "Fresh romaine lettuce with Caesar dressing",
      "price": 12.99,
      "imageUrl": "https://...",
      "isAvailable": true,
      "displayOrder": 1,
      "allergens": ["dairy"],
      "attributes": ["vegetarian"],
      "modifierGroups": [
        {
          "id": "mod-group-123",
          "name": "Dressing",
          "required": false,
          "items": [
            {
              "id": "mod-item-123",
              "name": "Extra Dressing",
              "price": 1.50
            }
          ]
        }
      ]
    }
  ]
}
```

---

### 🍽️ **GET /api/menu-items/:id**
Get a specific menu item by ID.

**Headers:**
```
Authorization: Bearer <api_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "item-123",
    "name": "Caesar Salad",
    "description": "...",
    "price": 12.99,
    "imageUrl": "...",
    "isAvailable": true,
    "allergens": ["dairy"],
    "attributes": ["vegetarian"]
  }
}
```

---

### 📋 **GET /api/public/menu/:restaurantId**
Get public menu for a restaurant (NO AUTHENTICATION REQUIRED).

**No headers required** - This is a public endpoint.

**Example:**
```
GET /api/public/menu/rest-123
```

**Response:**
```json
{
  "success": true,
  "data": {
    "restaurant": {
      "id": "rest-123",
      "name": "Main Restaurant",
      "address": "123 Main St"
    },
    "categories": [
      {
        "id": "cat-123",
        "name": "Appetizers",
        "displayOrder": 1,
        "items": [
          {
            "id": "item-123",
            "name": "Caesar Salad",
            "description": "...",
            "price": 12.99,
            "imageUrl": "...",
            "isAvailable": true
          }
        ]
      }
    ]
  }
}
```

---

### 🛒 **GET /api/orders**
Get all orders, optionally filtered by restaurant or status.

**Query Parameters:**
- `restaurantId` (optional): Filter by restaurant ID
- `status` (optional): Filter by status (`pending`, `confirmed`, `preparing`, `ready`, `completed`, `cancelled`)

**Headers:**
```
Authorization: Bearer <api_token>
```

**Example:**
```
GET /api/orders?restaurantId=rest-123&status=pending
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "order-123",
      "restaurantId": "rest-123",
      "tableNumber": "5",
      "status": "pending",
      "items": [
        {
          "menuItemId": "item-123",
          "name": "Caesar Salad",
          "quantity": 2,
          "price": 12.99,
          "notes": "No croutons",
          "modifiers": [
            {
              "modifierGroupId": "mod-group-123",
              "modifierItemId": "mod-item-123",
              "name": "Extra Dressing",
              "price": 1.50
            }
          ]
        }
      ],
      "subtotal": 25.98,
      "tax": 2.60,
      "total": 28.58,
      "createdAt": "2025-12-19T10:00:00.000Z",
      "updatedAt": "2025-12-19T10:00:00.000Z"
    }
  ]
}
```

---

### 🛒 **POST /api/orders**
Create a new order.

**Headers:**
```
Authorization: Bearer <api_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "restaurantId": "rest-123",
  "tableNumber": "5",
  "items": [
    {
      "menuItemId": "item-123",
      "quantity": 2,
      "notes": "No croutons please",
      "modifiers": [
        {
          "modifierGroupId": "mod-group-123",
          "modifierItemId": "mod-item-123"
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
    "id": "order-123",
    "restaurantId": "rest-123",
    "tableNumber": "5",
    "status": "pending",
    "items": [...],
    "total": 28.58,
    "createdAt": "2025-12-19T10:00:00.000Z"
  }
}
```

---

### 🛒 **PATCH /api/orders/:id/status**
Update order status.

**Headers:**
```
Authorization: Bearer <api_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "confirmed"
}
```

**Valid Statuses:**
- `pending` - Order just created
- `confirmed` - Order confirmed by kitchen
- `preparing` - Order being prepared
- `ready` - Order ready for pickup/delivery
- `completed` - Order completed
- `cancelled` - Order cancelled

**Response:**
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "data": {
    "id": "order-123",
    "status": "confirmed",
    "updatedAt": "2025-12-19T10:05:00.000Z"
  }
}
```

---

### 🛒 **GET /api/orders/:id**
Get a specific order by ID.

**Headers:**
```
Authorization: Bearer <api_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "order-123",
    "restaurantId": "rest-123",
    "tableNumber": "5",
    "status": "pending",
    "items": [...],
    "total": 28.58,
    "createdAt": "2025-12-19T10:00:00.000Z"
  }
}
```

---

### 🏷️ **GET /api/attributes**
Get all available item attributes (e.g., vegetarian, gluten-free).

**Headers:**
```
Authorization: Bearer <api_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "attr-123",
      "name": "Vegetarian",
      "icon": "🌱",
      "description": "Contains no meat"
    }
  ]
}
```

---

### 🏷️ **GET /api/allergens**
Get all available allergens.

**Headers:**
```
Authorization: Bearer <api_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "allergen-123",
      "name": "Dairy",
      "icon": "🥛",
      "description": "Contains dairy products"
    }
  ]
}
```

---

## 📝 Code Examples

### JavaScript/React Native

```javascript
const API_BASE_URL = 'https://your-api-domain.com/api';
const API_TOKEN = 'tb_your_token_here';

// Fetch restaurants
async function getRestaurants() {
  const response = await fetch(`${API_BASE_URL}/restaurants`, {
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  return data.success ? data.data : [];
}

// Create order
async function createOrder(orderData) {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderData)
  });
  const data = await response.json();
  return data.success ? data.data : null;
}
```

### Swift/iOS

```swift
let apiBaseURL = "https://your-api-domain.com/api"
let apiToken = "tb_your_token_here"

func getRestaurants() async throws -> [Restaurant] {
    guard let url = URL(string: "\(apiBaseURL)/restaurants") else {
        throw APIError.invalidURL
    }
    
    var request = URLRequest(url: url)
    request.setValue("Bearer \(apiToken)", forHTTPHeaderField: "Authorization")
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    
    let (data, _) = try await URLSession.shared.data(for: request)
    let response = try JSONDecoder().decode(APIResponse<[Restaurant]>.self, from: data)
    
    return response.success ? response.data : []
}
```

### Kotlin/Android

```kotlin
val apiBaseURL = "https://your-api-domain.com/api"
val apiToken = "tb_your_token_here"

suspend fun getRestaurants(): List<Restaurant> {
    val client = HttpClient(CIO) {
        install(ContentNegotiation) {
            json()
        }
    }
    
    val response: HttpResponse = client.get("$apiBaseURL/restaurants") {
        headers {
            append("Authorization", "Bearer $apiToken")
            append("Content-Type", "application/json")
        }
    }
    
    val apiResponse = response.body<APIResponse<List<Restaurant>>>()
    return if (apiResponse.success) apiResponse.data else emptyList()
}
```

---

## ⚠️ Error Handling

All errors follow this format:

```json
{
  "success": false,
  "message": "Error message",
  "errors": {
    "field": ["Field-specific error"]
  }
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (token expired or revoked)
- `404` - Not Found
- `500` - Server Error

**Example Error Handling:**

```javascript
try {
  const response = await fetch(`${API_BASE_URL}/restaurants`, {
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`
    }
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    if (response.status === 401) {
      // Token invalid or expired
      // Re-authenticate or show login
    } else if (response.status === 403) {
      // Token revoked
      // Request new token
    } else {
      // Other error
      throw new Error(data.message || 'API request failed');
    }
  }
  
  return data.data;
} catch (error) {
  console.error('API Error:', error);
  throw error;
}
```

---

## 🔄 Rate Limiting

Currently, there's no rate limiting implemented. Consider implementing:
- 100 requests per minute per token
- 1000 requests per hour per token

---

## 📊 Response Format

All successful responses:
```json
{
  "success": true,
  "data": { ... }
}
```

All error responses:
```json
{
  "success": false,
  "message": "Error message",
  "errors": { ... }
}
```

---

## 🔒 Security Notes

1. **Always use HTTPS** in production
2. **Store API tokens securely** (keychain, secure storage)
3. **Never expose tokens** in client-side code or logs
4. **Rotate tokens regularly** (every 90-180 days)
5. **Monitor token usage** for suspicious activity
6. **Revoke compromised tokens** immediately

---

**Last Updated:** December 19, 2025

