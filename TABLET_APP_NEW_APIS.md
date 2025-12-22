# 📱 New APIs for Tablet App

**Base URL:** `https://smartler-f-b-menu-management.vercel.app/api`

**Last Updated:** December 21, 2025

---

## 🆕 New Endpoints

### 1. Service Requests API

#### 1.1 Create Service Request (Public - No Auth Required)

**Endpoint:** `POST /api/service-requests`  
**Alternative:** `POST /api/public/service-requests` (same functionality)

**Description:** Create a service request from the tablet app. No authentication required.

**Request Body:**
```json
{
  "tableNumber": 1,
  "requestType": "waiter" | "water" | "bill" | "assistance" | "other",
  "message": "Optional message (required if requestType is 'other')",
  "restaurantId": "optional-restaurant-uuid-or-tenant-id"
}
```

**Request Type Values:**
- `waiter` - Call Waiter
- `water` - Request Water
- `bill` - Request Bill
- `assistance` - Need Assistance
- `other` - Other (requires `message` field)

**Validation Rules:**
- `tableNumber`: Required, must be a positive integer
- `requestType`: Required, must be one of the allowed values
- `message`: Required if `requestType === 'other'`, optional otherwise
- `restaurantId`: Optional, can be UUID or tenant_id

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "restaurantId": "uuid",
    "tableNumber": 1,
    "requestType": "waiter",
    "message": null,
    "status": "pending",
    "createdAt": "2025-12-21T17:00:00.000Z",
    "acknowledgedAt": null,
    "completedAt": null,
    "staffMemberId": null
  },
  "message": "Service request created successfully"
}
```

**Error Responses:**
- `400` - Validation error (missing/invalid fields)
- `500` - Server error

**Example Request:**
```bash
curl -X POST https://smartler-f-b-menu-management.vercel.app/api/service-requests \
  -H "Content-Type: application/json" \
  -d '{
    "tableNumber": 5,
    "requestType": "water",
    "restaurantId": "restaurant-uuid"
  }'
```

**Example Request (Other Type with Message):**
```bash
curl -X POST https://smartler-f-b-menu-management.vercel.app/api/service-requests \
  -H "Content-Type: application/json" \
  -d '{
    "tableNumber": 3,
    "requestType": "other",
    "message": "Need extra napkins",
    "restaurantId": "restaurant-uuid"
  }'
```

---

### 2. Public Menu API (Enhanced)

#### 2.1 Get Public Menu (Query Parameter Format)

**Endpoint:** `GET /api/public/menu?restaurantId=<restaurant-id>`

**Description:** Get public menu with categories and items. No authentication required.

**Query Parameters:**
- `restaurantId` (required): Restaurant UUID or tenant_id

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "restaurant": {
      "id": "uuid",
      "name": "Restaurant Name",
      "cuisine": "Italian",
      "phone": "+1234567890",
      "address": "123 Main St"
    },
    "categories": [
      {
        "id": "uuid",
        "name": "Appetizers",
        "description": "Start your meal",
        "sortOrder": 1,
        "activeFlag": true,
        "restaurantId": "uuid",
        "items": [
          {
            "id": "uuid",
            "name": "Caesar Salad",
            "description": "Fresh romaine lettuce",
            "price": 12.99,
            "imageUrl": "https://...",
            "isAvailable": true,
            "allergens": ["dairy"],
            "attributes": {
              "protein": 15,
              "carbs": 8,
              "glutenFree": false,
              "ingredients": ["Lettuce", "Cheese", "Dressing"]
            }
          }
        ]
      }
    ]
  }
}
```

**Example Request:**
```bash
curl "https://smartler-f-b-menu-management.vercel.app/api/public/menu?restaurantId=restaurant-uuid"
```

#### 2.2 Get Public Menu (Path Parameter Format - Backward Compatible)

**Endpoint:** `GET /api/public/menu/:restaurantId`

**Description:** Same as above, but restaurantId is in the path instead of query parameter.

**Example Request:**
```bash
curl "https://smartler-f-b-menu-management.vercel.app/api/public/menu/restaurant-uuid"
```

---

## 📊 Menu Item Attributes Structure

Menu items now support structured attributes. The `attributes` field in menu items can contain:

### Nutrition Data
```json
{
  "protein": 15,      // grams (number >= 0)
  "carbs": 8,         // grams (number >= 0)
  "fats": 12,         // grams (number >= 0)
  "fiber": 3,         // grams (number >= 0)
  "sugar": 2,         // grams (number >= 0)
  "sodium": 450,      // mg (number >= 0)
  "glutenFree": false, // boolean
  "dairyFree": false   // boolean
}
```

### Ingredients & Sourcing
```json
{
  "ingredients": ["Tomato", "Lettuce", "Cheese"],
  "sourcing": {
    "origin": "Local Farm",
    "type": "Local" | "Organic" | "Fair Trade" | "Imported"
  },
  "sustainability": ["Locally Sourced", "Organic"]
}
```

### Recipe Data
```json
{
  "recipe": {
    "steps": [
      "Wash and dry romaine lettuce",
      "Toss lettuce with caesar dressing"
    ],
    "ingredients": ["Romaine Lettuce", "Caesar Dressing"],
    "chefNotes": "Best served fresh"
  }
}
```

### Sensory Type
```json
{
  "sensoryType": "hot" | "cold" | "crispy" | "smooth" | "spicy"
}
```

### Complete Example
```json
{
  "id": "item-123",
  "name": "Caesar Salad",
  "price": 12.99,
  "attributes": {
    "protein": 15,
    "carbs": 8,
    "fats": 12,
    "fiber": 3,
    "sugar": 2,
    "sodium": 450,
    "glutenFree": false,
    "dairyFree": false,
    "ingredients": ["Romaine Lettuce", "Parmesan Cheese", "Caesar Dressing"],
    "sourcing": {
      "origin": "Local Farm",
      "type": "Organic"
    },
    "sustainability": ["Locally Sourced", "Organic"],
    "recipe": {
      "steps": ["Wash lettuce", "Add dressing", "Serve"],
      "ingredients": ["Lettuce", "Dressing"],
      "chefNotes": "Best served fresh"
    },
    "sensoryType": "crispy"
  }
}
```

---

## 🔐 Authentication

**Service Requests:**
- `POST /api/service-requests` - **No authentication required** (public endpoint)
- `POST /api/public/service-requests` - **No authentication required** (public endpoint)

**Public Menu:**
- `GET /api/public/menu` - **No authentication required** (public endpoint)

**Note:** These endpoints are designed for tablet apps and do not require API tokens or authentication.

---

## 📡 WebSocket Events

The backend emits WebSocket events for real-time updates:

### Service Request Events

**Event:** `service_request_created`
```json
{
  "type": "service_request_created",
  "data": {
    "requestId": "uuid",
    "restaurantId": "uuid",
    "tableNumber": 5,
    "requestType": "waiter",
    "status": "pending",
    "timestamp": "2025-12-21T17:00:00.000Z"
  },
  "timestamp": "2025-12-21T17:00:00.000Z"
}
```

**Event:** `service_request_acknowledged`
```json
{
  "type": "service_request_acknowledged",
  "data": {
    "requestId": "uuid",
    "restaurantId": "uuid",
    "tableNumber": 5,
    "requestType": "waiter",
    "status": "acknowledged",
    "timestamp": "2025-12-21T17:01:00.000Z"
  },
  "timestamp": "2025-12-21T17:01:00.000Z"
}
```

**Event:** `service_request_completed`
```json
{
  "type": "service_request_completed",
  "data": {
    "requestId": "uuid",
    "restaurantId": "uuid",
    "tableNumber": 5,
    "requestType": "waiter",
    "status": "completed",
    "timestamp": "2025-12-21T17:02:00.000Z"
  },
  "timestamp": "2025-12-21T17:02:00.000Z"
}
```

---

## ✅ Testing Checklist

- [ ] Create service request with all request types (waiter, water, bill, assistance, other)
- [ ] Verify "other" type requires message field
- [ ] Verify tableNumber validation (must be positive integer)
- [ ] Verify requestType validation (must be one of allowed values)
- [ ] Test public menu endpoint with query parameter
- [ ] Test public menu endpoint with path parameter
- [ ] Verify menu items include structured attributes
- [ ] Test WebSocket events (if implementing real-time features)

---

## 📝 Notes

1. **Service Requests** are public endpoints - no authentication needed
2. **Public Menu** endpoint supports both query parameter and path parameter formats
3. **Attributes** field in menu items now supports structured data (nutrition, ingredients, sourcing, recipe, sensory)
4. **Backward Compatibility:** The old comma-separated string format for attributes is still supported during import
5. **Error Handling:** All endpoints return consistent error format:
   ```json
   {
     "success": false,
     "message": "Error message",
     "error": "Detailed error"
   }
   ```

---

## 🔗 Related Documentation

- Existing API endpoints: See `API_ENDPOINTS_QUICK_REFERENCE.md`
- Authentication: See `TABLET_APP_INTEGRATION_PACKAGE.md`
- Menu Items API: See existing `/api/menu-items` endpoint documentation

---

**For Support:** Contact the backend team or refer to the main API documentation.

