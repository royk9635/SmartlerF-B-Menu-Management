# 📱 Information for Tablet App Team

**Everything you need to integrate with the F&B Menu Management API**

---

## 🔗 API Configuration

### Base URL
```
https://your-app.up.railway.app/api
```
*(Replace with actual Railway URL after deployment)*

### Authentication Token
```
tb_your_generated_api_token_here
```
*(Will be provided after API token generation)*

---

## 🔐 Authentication

**All API requests require this header:**
```
Authorization: Bearer <api_token>
```

---

## 📋 Available Endpoints

### Restaurants
- `GET /api/restaurants` - List all restaurants
- `GET /api/restaurants/:id` - Get restaurant details

### Categories
- `GET /api/categories?restaurantId=:id` - Get categories for restaurant

### Menu Items
- `GET /api/menu-items` - List menu items
- `GET /api/menu-items?categoryId=:id` - Get items by category
- `GET /api/menu-items/:id` - Get menu item details

### Public Menu (No Auth Required)
- `GET /api/public/menu/:restaurantId` - Public menu display

### Orders
- `GET /api/orders` - List orders
- `GET /api/orders/:id` - Get order details
- `POST /api/orders` - Create new order
- `PATCH /api/orders/:id/status` - Update order status

### Attributes & Allergens
- `GET /api/attributes` - Get item attributes
- `GET /api/allergens` - Get allergens

---

## 💻 Quick Start Code

### JavaScript Example
```javascript
const API_URL = 'https://your-app.up.railway.app/api';
const API_TOKEN = 'tb_your_token';

// Fetch restaurants
fetch(`${API_URL}/restaurants`, {
  headers: {
    'Authorization': `Bearer ${API_TOKEN}`,
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => {
  if (data.success) {
    console.log('Restaurants:', data.data);
  }
});
```

---

## 📊 Response Format

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

## 🧪 Test Endpoints

### Verify Token
```bash
curl -X GET https://your-app.up.railway.app/api/tokens/verify \
  -H "Authorization: Bearer tb_your_token"
```

### Get Restaurants
```bash
curl -X GET https://your-app.up.railway.app/api/restaurants \
  -H "Authorization: Bearer tb_your_token"
```

---

## 📚 Full Documentation

See `TABLET_APP_INTEGRATION_PACKAGE.md` for:
- Complete API reference
- Code examples (JavaScript, Swift, Kotlin)
- Error handling
- Security best practices

---

## ✅ What You'll Receive

After deployment, you'll get:

1. **API Base URL** - Your Railway API URL
2. **API Token** - Generated API token for authentication
3. **This Document** - Quick reference
4. **Full Documentation** - Complete API reference

---

**Ready to integrate! 🚀**

