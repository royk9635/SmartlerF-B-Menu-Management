# 🚀 API Endpoints Quick Reference

**Base URL:** `http://localhost:3001/api`  
**WebSocket:** `ws://localhost:3001`  
**Auth Header:** `Authorization: Bearer <token>`

---

## 🔐 Authentication
- `POST /api/auth/login` - Login (no auth)
- `GET /api/auth/me` - Get current user (auth required)
- `POST /api/auth/logout` - Logout (auth required)
- `POST /api/auth/refresh` - Refresh token (auth required)

---

## 🏢 Properties
- `GET /api/properties` - Get all properties
- `GET /api/properties/:id` - Get property by ID
- `POST /api/properties` - Create property
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

---

## 🍽️ Restaurants
- `GET /api/restaurants?propertyId={id}` - Get restaurants (optional filter)
- `POST /api/restaurants` - Create restaurant
- `PUT /api/restaurants/:id` - Update restaurant
- `DELETE /api/restaurants/:id` - Delete restaurant

---

## 📂 Categories
- `GET /api/categories?restaurantId={id}` - Get categories (optional filter)
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

---

## 🍕 Menu Items
- `GET /api/menu-items?categoryId={id}&subCategoryId={id}` - Get items (optional filters)
- `POST /api/menu-items` - Create menu item
- `PUT /api/menu-items/:id` - Update menu item
- `DELETE /api/menu-items/:id` - Delete menu item
- `PATCH /api/menu-items/bulk` - Bulk update items
- `POST /api/menu-items/:id/image` - Upload image (multipart/form-data)

---

## 👥 Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

---

## 📊 Analytics & Sales
- `GET /api/sales?startDate={date}&endDate={date}&restaurantId={id}` - Get sales data
- `GET /api/analytics?restaurantId={id}` - Get analytics dashboard

---

## 📦 Orders
- `GET /api/orders?restaurantId={id}` - Get orders (optional filter)
- `PATCH /api/orders/:id/status` - Update order status

**Status values:** `pending`, `preparing`, `ready`, `completed`, `cancelled`

---

## 🌐 Public Menu (No Auth)
- `GET /api/public/menu/:restaurantId` - Get public menu
- `POST /api/public/orders` - Create public order

---

## 🏷️ Attributes
- `GET /api/attributes` - Get all attributes
- `POST /api/attributes` - Create attribute
- `PUT /api/attributes/:id` - Update attribute
- `DELETE /api/attributes/:id` - Delete attribute

---

## ⚠️ Allergens
- `GET /api/allergens` - Get all allergens
- `POST /api/allergens` - Create allergen
- `PUT /api/allergens/:id` - Update allergen
- `DELETE /api/allergens/:id` - Delete allergen

---

## 🔧 Modifiers
- `GET /api/modifier-groups?restaurantId={id}` - Get modifier groups
- `GET /api/modifier-items?groupId={id}` - Get modifier items
- `POST /api/modifier-groups` - Create modifier group
- `POST /api/modifier-items` - Create modifier item

---

## 🔄 System & Utilities
- `POST /api/import/menu/:restaurantId` - Import menu
- `POST /api/import/system-menu` - Import system menu
- `GET /api/audit-logs?{filters}` - Get audit logs
- `GET /api/health` - Health check (no auth)

---

## 📡 WebSocket Events

**Connect to:** `ws://localhost:3001`

**Event Types:**
- `order_created` - New order created
- `order_updated` - Order status updated
- `menu_item_updated` - Menu item updated
- `user_activity` - User activity
- `system_notification` - System notification

---

## 📋 Response Format

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
  "message": "Error description",
  "errors": { ... }
}
```

---

## 🔑 Authentication Flow

1. **Login:** `POST /api/auth/login` with `{ email, password }`
2. **Store Token:** Save token from response `data.token`
3. **Use Token:** Include in header: `Authorization: Bearer <token>`
4. **Refresh:** Call `POST /api/auth/refresh` before token expires

---

**Total: 50+ endpoints** | **All endpoints require auth except:**
- `/api/auth/login`
- `/api/public/*`
- `/api/health`

