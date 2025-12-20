# 🔑 API Token Guide for Tablet Apps

This guide explains how to generate and use API tokens for tablet app authentication.

---

## 🚀 Quick Start

### **Step 1: Generate an API Token**

1. **Login to the portal** first to get a JWT token:
   ```bash
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"password"}'
   ```

2. **Generate an API token** using the JWT token:
   ```bash
   curl -X POST http://localhost:3001/api/tokens/generate \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -d '{
       "name": "Tablet App - Restaurant 1",
       "restaurantId": "rest-123",
       "propertyId": "prop-123",
       "expiresInDays": 365
     }'
   ```

3. **Save the token** - The response will include the token. **Save it immediately** as it won't be shown again!

---

## 📋 API Token Endpoints

### **POST /api/tokens/generate**
Generate a new API token for tablet app.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Tablet App - Restaurant 1",
  "restaurantId": "rest-123",        // Optional: restrict to specific restaurant
  "propertyId": "prop-123",          // Optional: restrict to specific property
  "expiresInDays": 365               // Optional: token expiration in days
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "token-123",
    "name": "Tablet App - Restaurant 1",
    "token": "tb_a1b2c3d4e5f6...",
    "restaurantId": "rest-123",
    "propertyId": "prop-123",
    "expiresAt": "2026-12-19T00:00:00.000Z",
    "createdAt": "2025-12-19T00:00:00.000Z",
    "message": "⚠️ IMPORTANT: Save this token now. It will not be shown again!"
  }
}
```

---

### **GET /api/tokens**
List all API tokens (token values are partially hidden for security).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "token-123",
      "name": "Tablet App - Restaurant 1",
      "restaurantId": "rest-123",
      "propertyId": "prop-123",
      "isActive": true,
      "expiresAt": "2026-12-19T00:00:00.000Z",
      "createdAt": "2025-12-19T00:00:00.000Z",
      "lastUsedAt": "2025-12-19T15:30:00.000Z",
      "tokenPreview": "tb_a1b2c3d4e5..."
    }
  ]
}
```

---

### **PATCH /api/tokens/:id/revoke**
Revoke (deactivate) an API token.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "API token revoked successfully",
  "data": {
    "id": "token-123",
    "name": "Tablet App - Restaurant 1",
    "isActive": false
  }
}
```

---

### **PATCH /api/tokens/:id/activate**
Reactivate a revoked API token.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "API token activated successfully",
  "data": {
    "id": "token-123",
    "name": "Tablet App - Restaurant 1",
    "isActive": true
  }
}
```

---

### **DELETE /api/tokens/:id**
Permanently delete an API token.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "API token deleted successfully"
}
```

---

### **GET /api/tokens/verify**
Verify if an API token is valid (for tablet app to test connection).

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
    "name": "Tablet App - Restaurant 1",
    "restaurantId": "rest-123",
    "propertyId": "prop-123",
    "isActive": true,
    "expiresAt": "2026-12-19T00:00:00.000Z"
  }
}
```

---

## 📱 Using API Token in Tablet App

### **1. Store the Token Securely**

Store the API token securely in your tablet app (e.g., in secure storage, keychain, etc.).

### **2. Include Token in API Requests**

Add the token to the `Authorization` header in all API requests:

```javascript
// Example: JavaScript/React Native
const apiToken = 'tb_a1b2c3d4e5f6...'; // Your generated token

fetch('http://localhost:3001/api/restaurants', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${apiToken}`,
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data));
```

```swift
// Example: Swift/iOS
let apiToken = "tb_a1b2c3d4e5f6..." // Your generated token
var request = URLRequest(url: URL(string: "http://localhost:3001/api/restaurants")!)
request.setValue("Bearer \(apiToken)", forHTTPHeaderField: "Authorization")
request.setValue("application/json", forHTTPHeaderField: "Content-Type")

URLSession.shared.dataTask(with: request) { data, response, error in
    // Handle response
}.resume()
```

### **3. Test Token Connection**

Before using the token in your app, verify it works:

```bash
curl -X GET http://localhost:3001/api/tokens/verify \
  -H "Authorization: Bearer tb_a1b2c3d4e5f6..."
```

---

## 🔒 Security Best Practices

1. **Never expose tokens** in client-side code or public repositories
2. **Use HTTPS** in production (not HTTP)
3. **Rotate tokens regularly** - Generate new tokens and revoke old ones
4. **Set expiration dates** - Use `expiresInDays` when generating tokens
5. **Restrict by restaurant/property** - Limit token scope when possible
6. **Monitor token usage** - Check `lastUsedAt` to detect suspicious activity
7. **Revoke immediately** - If a token is compromised, revoke it immediately

---

## 📊 Token Management Workflow

### **Generate Token for New Tablet**
1. Login to portal → Get JWT token
2. Generate API token with descriptive name
3. Save token securely
4. Configure tablet app with token
5. Test connection using `/api/tokens/verify`

### **Revoke Compromised Token**
1. Login to portal → Get JWT token
2. List tokens: `GET /api/tokens`
3. Revoke token: `PATCH /api/tokens/:id/revoke`

### **Rotate Expired Token**
1. Generate new token
2. Update tablet app with new token
3. Revoke old token
4. Test new token

---

## 🎯 Example: Complete Token Generation Flow

```bash
# 1. Login to get JWT token
JWT_TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}' \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['token'])")

# 2. Generate API token
curl -X POST http://localhost:3001/api/tokens/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "name": "Tablet App - Main Restaurant",
    "restaurantId": "rest-123",
    "expiresInDays": 365
  }' | python3 -m json.tool

# 3. Save the token from the response
# Token will look like: tb_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6

# 4. Test the token
curl -X GET http://localhost:3001/api/tokens/verify \
  -H "Authorization: Bearer tb_a1b2c3d4e5f6..." | python3 -m json.tool
```

---

## ❓ Troubleshooting

### **Token Not Working**
- Check if token is active: `GET /api/tokens` (look for `isActive: true`)
- Check if token expired: Look at `expiresAt` field
- Verify token format: Should start with `tb_`
- Check Authorization header: Must be `Bearer <token>`

### **401 Unauthorized**
- Token missing in request
- Token format incorrect
- Token has been revoked

### **403 Forbidden**
- Token is invalid
- Token has expired
- Token has been deactivated

---

## 📝 Notes

- API tokens work with **all existing API endpoints** that require authentication
- Tokens are **scoped** to the restaurant/property specified during generation
- Tokens can be **revoked** without affecting other tokens
- Token values are **only shown once** during generation - save them immediately!

---

**Need Help?** Check the main API documentation in `FRONTEND_API_REFERENCE.md`


