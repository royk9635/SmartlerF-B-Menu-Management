# 📱 API Endpoints for Tablet App

Complete list of all API endpoints available for tablet app integration.

---

## 🔗 Base Configuration

```
Production URL: https://your-api-domain.com/api
Development URL: http://localhost:3001/api

Authentication: Bearer <api_token>
Token Format: tb_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## ✅ Available Endpoints

### 🔐 Authentication & Token Management

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/tokens/verify` | API Token | Verify API token validity |

---

### 🏢 Restaurants

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/restaurants` | API Token | Get all restaurants |
| GET | `/api/restaurants/:id` | API Token | Get restaurant by ID |

---

### 📂 Categories

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/categories?restaurantId=:id` | API Token | Get categories for restaurant |

---

### 🍽️ Menu Items

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/menu-items` | API Token | Get all menu items |
| GET | `/api/menu-items?categoryId=:id` | API Token | Get items by category |
| GET | `/api/menu-items?restaurantId=:id` | API Token | Get items by restaurant |
| GET | `/api/menu-items/:id` | API Token | Get menu item by ID |

---

### 📋 Public Menu (No Auth)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/public/menu/:restaurantId` | ❌ None | Get public menu for restaurant |

---

### 🛒 Orders

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/orders` | API Token | Get all orders |
| GET | `/api/orders?restaurantId=:id` | API Token | Get orders by restaurant |
| GET | `/api/orders?status=:status` | API Token | Get orders by status |
| GET | `/api/orders/:id` | API Token | Get order by ID |
| POST | `/api/orders` | API Token | Create new order |
| PATCH | `/api/orders/:id/status` | API Token | Update order status |

---

### 🏷️ Attributes & Allergens

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/attributes` | API Token | Get all item attributes |
| GET | `/api/allergens` | API Token | Get all allergens |

---

## 📝 Request Examples

### Get Restaurants
```bash
curl -X GET https://your-api-domain.com/api/restaurants \
  -H "Authorization: Bearer tb_your_token"
```

### Get Categories
```bash
curl -X GET "https://your-api-domain.com/api/categories?restaurantId=rest-123" \
  -H "Authorization: Bearer tb_your_token"
```

### Get Menu Items
```bash
curl -X GET "https://your-api-domain.com/api/menu-items?categoryId=cat-123" \
  -H "Authorization: Bearer tb_your_token"
```

### Create Order
```bash
curl -X POST https://your-api-domain.com/api/orders \
  -H "Authorization: Bearer tb_your_token" \
  -H "Content-Type: application/json" \
  -d '{
    "restaurantId": "rest-123",
    "tableNumber": "5",
    "items": [
      {
        "menuItemId": "item-123",
        "quantity": 2
      }
    ]
  }'
```

### Update Order Status
```bash
curl -X PATCH https://your-api-domain.com/api/orders/order-123/status \
  -H "Authorization: Bearer tb_your_token" \
  -H "Content-Type: application/json" \
  -d '{"status": "confirmed"}'
```

---

## 🔒 Security

- ✅ All endpoints (except `/api/public/menu/*`) require API token authentication
- ✅ Tokens are scoped to restaurants/properties
- ✅ Tokens can be revoked/activated
- ✅ Tokens can have expiration dates
- ✅ HTTPS required in production

---

## 📊 Response Format

All responses follow this format:

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error message"
}
```

---

## 🚀 Quick Setup

1. **Generate API Token** (from portal)
2. **Configure Tablet App:**
   ```
   BACKEND_URL=https://your-api-domain.com/api
   BACKEND_API_TOKEN=tb_your_token
   ```
3. **Test Connection:**
   ```bash
   curl -X GET https://your-api-domain.com/api/tokens/verify \
     -H "Authorization: Bearer tb_your_token"
   ```

---

**All endpoints are production-ready and ready for tablet app integration!** 🎉

