# 🔗 Backend Integration Guide

This guide explains how to connect your F&B Menu Management dashboard to a real backend API.

## 🚀 **Quick Setup**

### **1. Environment Configuration**

Create a `.env.local` file in your project root:

```env
# Backend API Configuration
VITE_API_BASE_URL=http://localhost:3001/api

# WebSocket URL for real-time updates
VITE_WS_URL=ws://localhost:3001

# Environment
VITE_NODE_ENV=development

# Enable API logging
VITE_API_LOGGING=true
```

### **2. Backend API Requirements**

Your backend API should implement these endpoints:

#### **Authentication Endpoints**
```
POST /api/auth/login          # Login with email/password
POST /api/auth/logout         # Logout user
POST /api/auth/refresh        # Refresh JWT token
GET  /api/auth/me            # Get current user info
```

#### **Core Resource Endpoints**
```
# Properties
GET    /api/properties
POST   /api/properties
PUT    /api/properties/:id
DELETE /api/properties/:id

# Restaurants
GET    /api/restaurants
POST   /api/restaurants
PUT    /api/restaurants/:id
DELETE /api/restaurants/:id

# Categories
GET    /api/categories?restaurantId=:id
POST   /api/categories
PUT    /api/categories/:id
DELETE /api/categories/:id

# Menu Items
GET    /api/menu-items?categoryId=:id
POST   /api/menu-items
PUT    /api/menu-items/:id
DELETE /api/menu-items/:id
PATCH  /api/menu-items/bulk   # Bulk update

# Users
GET    /api/users
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id

# Analytics
GET    /api/sales?startDate=:start&endDate=:end
GET    /api/analytics

# Live Orders
GET    /api/orders
PATCH  /api/orders/:id/status

# Public Menu
GET    /api/public/menu/:restaurantId
```

### **3. API Response Format**

All API responses should follow this format:

```typescript
{
  "success": true,
  "data": { ... },      // Your actual data
  "message": "Success", // Optional message
}
```

Error responses:
```typescript
{
  "success": false,
  "message": "Error message",
  "errors": {           // Optional validation errors
    "field": ["Error message"]
  }
}
```

### **4. Authentication Flow**

#### **Login Response**
```typescript
{
  "success": true,
  "data": {
    "user": {
      "id": "user-123",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "Property Admin"
    },
    "token": "jwt-token-here"
  }
}
```

#### **JWT Token Usage**
The frontend automatically includes JWT tokens in request headers:
```
Authorization: Bearer <jwt-token>
```

## 🔄 **Real-time Updates**

### **WebSocket Integration**

Your backend should provide WebSocket support for real-time updates:

#### **Connection**
```javascript
// Client connects with JWT token
ws://localhost:3001?token=<jwt-token>
```

#### **Event Types**
```typescript
{
  "type": "order_created",
  "data": { /* order data */ },
  "timestamp": "2024-01-01T00:00:00Z"
}

{
  "type": "order_updated", 
  "data": { /* updated order */ },
  "timestamp": "2024-01-01T00:00:00Z"
}

{
  "type": "menu_item_updated",
  "data": { /* menu item */ },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## 🛠️ **Backend Implementation Examples**

### **Node.js/Express Example**

```javascript
// Authentication middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid token'
      });
    }
    req.user = user;
    next();
  });
};

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate credentials
    const user = await User.findOne({ email });
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Protected route example
app.get('/api/properties', authenticateToken, async (req, res) => {
  try {
    const properties = await Property.find({
      tenantId: req.user.tenantId
    });

    res.json({
      success: true,
      data: properties
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});
```

### **Python/FastAPI Example**

```python
from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt

app = FastAPI()
security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(
            credentials.credentials, 
            SECRET_KEY, 
            algorithms=["HS256"]
        )
        return payload
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.post("/api/auth/login")
async def login(email: str, password: str):
    # Validate credentials
    user = await get_user_by_email(email)
    if not user or not verify_password(password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Generate token
    token = jwt.encode(
        {"user_id": user.id, "role": user.role},
        SECRET_KEY,
        algorithm="HS256"
    )
    
    return {
        "success": True,
        "data": {
            "user": user.dict(),
            "token": token
        }
    }

@app.get("/api/properties")
async def get_properties(current_user = Depends(verify_token)):
    properties = await Property.find_all(tenant_id=current_user["tenant_id"])
    return {
        "success": True,
        "data": properties
    }
```

## 🧪 **Testing the Integration**

### **1. Start Your Backend**
Ensure your backend is running on `http://localhost:3001`

### **2. Update Environment**
Create `.env.local` with your backend URL

### **3. Test Authentication**
1. Try logging in with valid credentials
2. Check if JWT token is stored in localStorage
3. Verify protected routes work

### **4. Test Real-time Updates**
1. Open multiple browser tabs
2. Create/update data in one tab
3. Verify updates appear in other tabs

## 🚨 **Common Issues & Solutions**

### **CORS Issues**
Add CORS headers to your backend:
```javascript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### **Token Expiration**
The frontend automatically handles 401 responses and redirects to login.

### **WebSocket Connection**
Ensure WebSocket server accepts connections with JWT tokens.

### **API Response Format**
Make sure all responses follow the expected format with `success` and `data` fields.

## 📱 **Mobile/Production Considerations**

### **Production URLs**
Update `.env.production`:
```env
VITE_API_BASE_URL=https://your-api.com/api
VITE_WS_URL=wss://your-api.com
```

### **HTTPS/WSS**
Use secure connections in production:
- `https://` for API calls
- `wss://` for WebSocket connections

### **Error Handling**
The frontend includes comprehensive error handling for:
- Network failures
- Authentication errors
- Validation errors
- Server errors

## 🎯 **Next Steps**

1. **Implement Backend API** following the endpoint specifications
2. **Set up WebSocket Server** for real-time updates
3. **Configure Environment** variables
4. **Test Integration** thoroughly
5. **Deploy to Production** with proper HTTPS/WSS

Your F&B Menu Management system will now be connected to live data! 🚀
