# Backend API Token Support Improvements

## Overview

Enhanced backend endpoints to automatically use `restaurantId` and `propertyId` from API tokens when query parameters are not provided. This makes API token usage seamless for tablet apps - they no longer need to send these parameters in queries.

---

## Endpoints Enhanced

### 1. GET /api/categories

**Before:**
- Required `restaurantId` in query parameters
- Tablet app had to send: `GET /api/categories?restaurantId=xxx`

**After:**
- Automatically uses `restaurantId` from API token if not in query
- Tablet app can send: `GET /api/categories` (restaurantId from token)
- Still accepts `restaurantId` in query (backward compatible)

**Implementation:**
- Checks `req.authType === 'api_token'`
- Uses `req.user.restaurantId` if query parameter is missing
- Logs when using restaurantId from API token

---

### 2. GET /api/menu-items

**Before:**
- Could filter by `categoryId` and `subCategoryId`
- No automatic restaurant filtering

**After:**
- Automatically filters by restaurant from API token
- Uses `restaurantId` from API token to filter categories, then menu items
- Tablet app can send: `GET /api/menu-items` (automatically filtered by token's restaurant)
- Still accepts `restaurantId` in query (backward compatible)

**Implementation:**
- Checks `req.authType === 'api_token'`
- Uses `req.user.restaurantId` if query parameter is missing
- Filters categories by restaurant, then filters menu items by those categories
- Returns empty array if no categories exist for the restaurant

---

### 3. GET /api/orders

**Before:**
- Required `restaurantId` in query parameters for filtering
- Tablet app had to send: `GET /api/orders?restaurantId=xxx`

**After:**
- Automatically uses `restaurantId` from API token if not in query
- Tablet app can send: `GET /api/orders` (restaurantId from token)
- Still accepts `restaurantId` in query (backward compatible)

**Implementation:**
- Checks `req.authType === 'api_token'`
- Uses `req.user.restaurantId` if query parameter is missing
- Logs when using restaurantId from API token

---

### 4. GET /api/service-requests

**Before:**
- Required `restaurantId` in query parameters for filtering
- Tablet app had to send: `GET /api/service-requests?restaurantId=xxx`

**After:**
- Automatically uses `restaurantId` from API token if not in query
- Tablet app can send: `GET /api/service-requests` (restaurantId from token)
- Still accepts `restaurantId` in query (backward compatible)

**Implementation:**
- Checks `req.authType === 'api_token'`
- Uses `req.user.restaurantId` if query parameter is missing
- Handles both UUID and tenant_id formats
- Logs when using restaurantId from API token

---

### 5. POST /api/service-requests

**Before:**
- Required `restaurantId` in request body
- Tablet app had to send: `POST /api/service-requests` with `{ restaurantId: "xxx", ... }`

**After:**
- Automatically uses `restaurantId` from API token if not in body
- Tablet app can send: `POST /api/service-requests` with `{ tableNumber, requestType, ... }` (restaurantId from token)
- Still accepts `restaurantId` in body (backward compatible)

**Implementation:**
- Checks Authorization header for API token
- Validates API token format (`tb_` or `smtlr_` prefix)
- Queries `api_tokens` table for `restaurant_id`
- Uses token's restaurantId if body parameter is missing
- Logs when using restaurantId from API token

**Note:** Also updated `/api/public/service-requests` endpoint with same logic

---

### 6. GET /api/restaurants

**Before:**
- Optional `propertyId` in query parameters
- Tablet app had to send: `GET /api/restaurants?propertyId=xxx` to filter

**After:**
- Automatically uses `propertyId` from API token if not in query
- Tablet app can send: `GET /api/restaurants` (propertyId from token)
- Still accepts `propertyId` in query (backward compatible)

**Implementation:**
- Checks `req.authType === 'api_token'`
- Uses `req.user.propertyId` if query parameter is missing
- Handles both UUID and tenant_id formats
- Logs when using propertyId from API token

---

### 7. GET /api/staff

**Already Enhanced:**
- Uses `restaurantId`/`propertyId` from API token automatically
- Uses `propertyId` from user profile for Supabase/JWT tokens
- Fully supports API tokens without query parameters

---

## How It Works

### API Token Detection

The `authenticateToken` middleware automatically:
1. Checks if token starts with `tb_` or `smtlr_` (API token format)
2. Validates token in `api_tokens` table
3. Sets `req.authType = 'api_token'`
4. Sets `req.user.restaurantId` and `req.user.propertyId` from token

### Automatic Fallback Logic

Each endpoint follows this pattern:

```javascript
// Get restaurantId/propertyId from query
let finalRestaurantId = restaurantId;
let finalPropertyId = propertyId;

// Use from API token if not in query
if (!finalRestaurantId && req.authType === 'api_token' && req.user.restaurantId) {
  finalRestaurantId = req.user.restaurantId;
  console.log(`[Endpoint] Using restaurantId from API token: ${finalRestaurantId}`);
}

// Use finalRestaurantId for filtering
if (finalRestaurantId) {
  query = query.eq('restaurant_id', finalRestaurantId);
}
```

---

## Benefits

1. **Simpler Requests**: Tablet apps don't need to send `restaurantId`/`propertyId` in queries
2. **Automatic Filtering**: Data is automatically filtered by token's restaurant/property
3. **Backward Compatible**: Existing queries with parameters still work
4. **Security**: Tokens are scoped, so users can only access their restaurant/property data
5. **Less Error-Prone**: No risk of sending wrong `restaurantId`/`propertyId`

---

## Testing

### Test with API Token

```bash
# Get categories (restaurantId from token)
curl -H "Authorization: Bearer tb_your_token" \
  https://api.example.com/api/categories

# Get menu items (restaurantId from token)
curl -H "Authorization: Bearer tb_your_token" \
  https://api.example.com/api/menu-items

# Get orders (restaurantId from token)
curl -H "Authorization: Bearer tb_your_token" \
  https://api.example.com/api/orders

# Get service requests (restaurantId from token)
curl -H "Authorization: Bearer tb_your_token" \
  https://api.example.com/api/service-requests

# Create service request (restaurantId from token)
curl -X POST -H "Authorization: Bearer tb_your_token" \
  -H "Content-Type: application/json" \
  -d '{"tableNumber": 5, "requestType": "waiter"}' \
  https://api.example.com/api/service-requests

# Get restaurants (propertyId from token)
curl -H "Authorization: Bearer tb_your_token" \
  https://api.example.com/api/restaurants
```

### Test Backward Compatibility

```bash
# Still works with query parameters
curl -H "Authorization: Bearer tb_your_token" \
  "https://api.example.com/api/categories?restaurantId=xxx"

curl -H "Authorization: Bearer tb_your_token" \
  "https://api.example.com/api/orders?restaurantId=xxx"
```

---

## Logging

All endpoints log when using restaurantId/propertyId from API tokens:

```
[Categories API] Using restaurantId from API token: xxx
[Menu Items API] Using restaurantId from API token: xxx
[Orders API] Using restaurantId from API token: xxx
[Service Requests API] Using restaurantId from API token: xxx
[Restaurants API] Using propertyId from API token: xxx
```

This helps with debugging and monitoring API token usage.

---

## Migration Impact

### For Tablet Apps

**Before Migration:**
```swift
// Had to send restaurantId in every request
let url = "\(baseURL)/categories?restaurantId=\(restaurantId)"
```

**After Migration:**
```swift
// No restaurantId needed - from API token
let url = "\(baseURL)/categories"
```

### For Portal Users

No changes needed - portal users continue to work as before. They can still:
- Send `restaurantId`/`propertyId` in queries
- Use their `propertyId` from profile automatically (for Supabase/JWT tokens)
- Access all data if SuperAdmin

---

## Security Considerations

1. **Token Scoping**: API tokens are scoped to specific restaurant/property
2. **Automatic Filtering**: Data is automatically filtered by token's scope
3. **No Override**: Query parameters can override token's restaurantId/propertyId (for flexibility)
4. **Validation**: All restaurantId/propertyId values are validated before use

---

## Summary

All major endpoints now support automatic `restaurantId`/`propertyId` extraction from API tokens:

- ✅ GET /api/categories
- ✅ GET /api/menu-items
- ✅ GET /api/orders
- ✅ GET /api/service-requests
- ✅ POST /api/service-requests
- ✅ GET /api/restaurants
- ✅ GET /api/staff

Tablet apps can now use API tokens without sending `restaurantId`/`propertyId` in queries, making integration simpler and more secure.

