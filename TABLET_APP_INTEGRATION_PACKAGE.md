# 📱 Tablet App Integration Package

**Complete information package for tablet app developers**

---

## 🔗 API Configuration

### Base URL
```
https://your-app.up.railway.app/api
```

**Replace `your-app.up.railway.app` with your actual Railway domain.**

### Authentication Token
```
tb_your_generated_api_token_here
```

**This token will be provided separately after deployment.**

---

## 🔐 Authentication

All API requests (except public endpoints) require authentication using the API token.

### Header Format
```
Authorization: Bearer <api_token>
```

### Example Request
```http
GET /api/restaurants
Authorization: Bearer tb_your_api_token_here
Content-Type: application/json
```

---

## 📋 Available Endpoints

### ✅ Restaurants

**Get All Restaurants**
```http
GET /api/restaurants
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
      "address": "123 Main St",
      "phone": "+1-555-0123",
      "isActive": true
    }
  ]
}
```

---

### ✅ Categories

**Get Categories for Restaurant**
```http
GET /api/categories?restaurantId=rest-123
Authorization: Bearer <api_token>
```

**Query Parameters:**
- `restaurantId` (required): Restaurant ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cat-123",
      "name": "Appetizers",
      "restaurantId": "rest-123",
      "description": "Start your meal",
      "displayOrder": 1,
      "isActive": true
    }
  ]
}
```

---

### ✅ Menu Items

**Get Menu Items**
```http
GET /api/menu-items?categoryId=cat-123
Authorization: Bearer <api_token>
```

**Query Parameters:**
- `categoryId` (optional): Filter by category
- `restaurantId` (optional): Filter by restaurant

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "item-123",
      "name": "Caesar Salad",
      "categoryId": "cat-123",
      "description": "Fresh romaine lettuce",
      "price": 12.99,
      "imageUrl": "https://...",
      "isAvailable": true,
      "allergens": ["dairy"],
      "attributes": ["vegetarian"]
    }
  ]
}
```

**Get Menu Item by ID**
```http
GET /api/menu-items/:id
Authorization: Bearer <api_token>
```

---

### ✅ Public Menu (No Authentication)

**Get Public Menu**
```http
GET /api/public/menu/:restaurantId
```

**No authentication required** - Use for public displays.

**Response:**
```json
{
  "success": true,
  "data": {
    "restaurant": {
      "id": "rest-123",
      "name": "Main Restaurant"
    },
    "categories": [
      {
        "id": "cat-123",
        "name": "Appetizers",
        "items": [
          {
            "id": "item-123",
            "name": "Caesar Salad",
            "price": 12.99,
            "description": "...",
            "imageUrl": "..."
          }
        ]
      }
    ]
  }
}
```

---

### ✅ Orders

**Get All Orders**
```http
GET /api/orders
Authorization: Bearer <api_token>
```

**Query Parameters:**
- `restaurantId` (optional): Filter by restaurant
- `status` (optional): Filter by status (`pending`, `confirmed`, `preparing`, `ready`, `completed`, `cancelled`)

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
          "price": 12.99
        }
      ],
      "total": 25.98,
      "createdAt": "2025-12-19T10:00:00.000Z"
    }
  ]
}
```

**Create Order**
```http
POST /api/orders
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
      "notes": "No croutons"
    }
  ]
}
```

**Update Order Status**
```http
PATCH /api/orders/:id/status
Authorization: Bearer <api_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "confirmed"
}
```

**Valid Statuses:** `pending`, `confirmed`, `preparing`, `ready`, `completed`, `cancelled`

---

### ✅ Attributes & Allergens

**Get Attributes**
```http
GET /api/attributes
Authorization: Bearer <api_token>
```

**Get Allergens**
```http
GET /api/allergens
Authorization: Bearer <api_token>
```

---

## 💻 Code Examples

### JavaScript/React Native

```javascript
const API_BASE_URL = 'https://your-app.up.railway.app/api';
const API_TOKEN = 'tb_your_api_token_here';

// Fetch restaurants
async function getRestaurants() {
  const response = await fetch(`${API_BASE_URL}/restaurants`, {
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  if (data.success) {
    return data.data;
  }
  throw new Error(data.message || 'Failed to fetch restaurants');
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
  if (data.success) {
    return data.data;
  }
  throw new Error(data.message || 'Failed to create order');
}
```

### Swift/iOS

```swift
let apiBaseURL = "https://your-app.up.railway.app/api"
let apiToken = "tb_your_api_token_here"

func getRestaurants() async throws -> [Restaurant] {
    guard let url = URL(string: "\(apiBaseURL)/restaurants") else {
        throw APIError.invalidURL
    }
    
    var request = URLRequest(url: url)
    request.setValue("Bearer \(apiToken)", forHTTPHeaderField: "Authorization")
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    
    let (data, response) = try await URLSession.shared.data(for: request)
    
    guard let httpResponse = response as? HTTPURLResponse,
          httpResponse.statusCode == 200 else {
        throw APIError.invalidResponse
    }
    
    let apiResponse = try JSONDecoder().decode(APIResponse<[Restaurant]>.self, from: data)
    return apiResponse.success ? apiResponse.data : []
}
```

### Kotlin/Android

```kotlin
val apiBaseURL = "https://your-app.up.railway.app/api"
val apiToken = "tb_your_api_token_here"

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

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": {
    "field": ["Error details"]
  }
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (token expired/revoked)
- `404` - Not Found
- `500` - Server Error

---

## ⚠️ Error Handling

### Example Error Handling

```javascript
async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      if (response.status === 401) {
        // Token invalid or expired
        throw new Error('Authentication failed. Please check your API token.');
      } else if (response.status === 403) {
        // Token revoked
        throw new Error('Access denied. Token may have been revoked.');
      } else {
        throw new Error(data.message || 'API request failed');
      }
    }
    
    return data.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}
```

---

## 🧪 Testing the API

### Test Token Verification
```bash
curl -X GET https://your-app.up.railway.app/api/tokens/verify \
  -H "Authorization: Bearer tb_your_token"
```

### Test Fetch Restaurants
```bash
curl -X GET https://your-app.up.railway.app/api/restaurants \
  -H "Authorization: Bearer tb_your_token"
```

### Test Public Menu (No Auth)
```bash
curl -X GET https://your-app.up.railway.app/api/public/menu/rest-123
```

---

## 🔒 Security Best Practices

1. **Store API token securely**
   - iOS: Keychain
   - Android: EncryptedSharedPreferences
   - React Native: SecureStore

2. **Use HTTPS only** (Railway provides HTTPS automatically)

3. **Handle token expiration**
   - Check token validity on app startup
   - Request new token if expired

4. **Never expose tokens**
   - Don't log tokens
   - Don't commit tokens to version control
   - Don't expose in client-side code

---

## 📱 Quick Integration Checklist

- [ ] ✅ Get API URL from Railway deployment
- [ ] ✅ Get API token from portal
- [ ] ✅ Configure API base URL in app
- [ ] ✅ Store API token securely
- [ ] ✅ Test token verification endpoint
- [ ] ✅ Test fetch restaurants endpoint
- [ ] ✅ Implement error handling
- [ ] ✅ Test all required endpoints
- [ ] ✅ Handle authentication errors gracefully

---

## 📞 Support & Documentation

- **Full API Reference:** See `TABLET_APP_API_REFERENCE.md`
- **Endpoint Quick Reference:** See `API_ENDPOINTS_FOR_TABLET_APP.md`
- **Production Guide:** See `PRODUCTION_API_GUIDE.md`

---

## 🎯 What You Need to Provide

**To the tablet app developers, provide:**

1. **API Base URL:**
   ```
   https://your-app.up.railway.app/api
   ```

2. **API Token:**
   ```
   tb_your_generated_token_here
   ```

3. **This Document:** `TABLET_APP_INTEGRATION_PACKAGE.md`

4. **Optional:** Test credentials for development
   ```
   Email: admin@example.com
   Password: password
   ```

---

**That's everything the tablet app team needs! 🚀**

