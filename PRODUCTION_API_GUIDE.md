# 🚀 Production API Setup Guide

This guide helps you deploy the F&B Menu Management API to production and configure it for tablet app integration.

---

## 📋 Table of Contents

1. [Production Configuration](#production-configuration)
2. [API Endpoints for Tablet App](#api-endpoints-for-tablet-app)
3. [Authentication Setup](#authentication-setup)
4. [Deployment Options](#deployment-options)
5. [Security Checklist](#security-checklist)
6. [Tablet App Integration](#tablet-app-integration)

---

## 🔧 Production Configuration

### Step 1: Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cd backend
cp .env.example .env
```

Update `.env` with your production values:

```env
# Server Configuration
PORT=3001
NODE_ENV=production

# Security - REQUIRED
# Generate secure secret: openssl rand -base64 32
JWT_SECRET=your-generated-secure-secret-key-here-minimum-32-chars

# Frontend URLs (for CORS)
FRONTEND_URL=https://your-frontend-domain.com
TABLET_APP_URL=https://your-tablet-app-domain.com

# Additional origins (comma-separated, optional)
# ALLOWED_ORIGINS=https://app1.com,https://app2.com
```

### Step 2: Generate Secure JWT Secret

```bash
# Generate a secure random secret
openssl rand -base64 32
```

Copy the output and set it as `JWT_SECRET` in your `.env` file.

### Step 3: Install Dependencies

```bash
cd backend
npm install --production
```

### Step 4: Start Production Server

```bash
# Using PM2 (recommended)
npm install -g pm2
pm2 start server.js --name f-b-api

# Or using node directly
NODE_ENV=production node server.js
```

---

## 📱 API Endpoints for Tablet App

All endpoints require authentication using API tokens (except public endpoints).

### Base URL
```
Production: https://your-api-domain.com/api
Development: http://localhost:3001/api
```

### Authentication Header
```
Authorization: Bearer <api_token>
```

---

### 🔐 Authentication Endpoints

#### Verify API Token
```http
GET /api/tokens/verify
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

### 🏢 Properties & Restaurants

#### Get All Restaurants
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

#### Get Restaurant by ID
```http
GET /api/restaurants/:id
Authorization: Bearer <api_token>
```

---

### 📂 Categories

#### Get Categories for Restaurant
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

### 🍽️ Menu Items

#### Get Menu Items
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

#### Get Menu Item by ID
```http
GET /api/menu-items/:id
Authorization: Bearer <api_token>
```

---

### 📋 Public Menu (No Authentication Required)

#### Get Public Menu for Restaurant
```http
GET /api/public/menu/:restaurantId
```

**No authentication required** - Use this for public-facing displays.

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

### 🛒 Orders

#### Get All Orders
```http
GET /api/orders
Authorization: Bearer <api_token>
```

**Query Parameters:**
- `restaurantId` (optional): Filter by restaurant
- `status` (optional): Filter by status (pending, confirmed, preparing, ready, completed, cancelled)

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

#### Create Order
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

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "order-123",
    "restaurantId": "rest-123",
    "tableNumber": "5",
    "status": "pending",
    "total": 25.98,
    "createdAt": "2025-12-19T10:00:00.000Z"
  }
}
```

#### Update Order Status
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

### 🏷️ Attributes & Allergens

#### Get Attributes
```http
GET /api/attributes
Authorization: Bearer <api_token>
```

#### Get Allergens
```http
GET /api/allergens
Authorization: Bearer <api_token>
```

---

## 🔑 Authentication Setup

### Step 1: Generate API Token

1. **Login to Portal** (get JWT token):
```bash
curl -X POST https://your-api-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

2. **Generate API Token**:
```bash
curl -X POST https://your-api-domain.com/api/tokens/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt_token>" \
  -d '{
    "name": "Tablet App - Main Restaurant",
    "restaurantId": "rest-123",
    "expiresInDays": 365
  }'
```

3. **Save the Token** - It will only be shown once!

### Step 2: Configure Tablet App

In your tablet app configuration:

```
BACKEND_URL=https://your-api-domain.com/api
BACKEND_API_TOKEN=tb_your_generated_token_here
```

---

## 🌐 Deployment Options

### Option 1: Heroku

```bash
# Install Heroku CLI
heroku login
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret-key
heroku config:set FRONTEND_URL=https://your-frontend.com
heroku config:set TABLET_APP_URL=https://your-tablet-app.com

# Deploy
git push heroku main
```

### Option 2: DigitalOcean / AWS / Azure

1. Create a server (Ubuntu 20.04+)
2. Install Node.js and PM2
3. Clone repository
4. Set up environment variables
5. Start with PM2

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone and setup
git clone your-repo
cd backend
npm install --production
cp .env.example .env
# Edit .env with production values

# Start with PM2
pm2 start server.js --name f-b-api
pm2 save
pm2 startup
```

### Option 3: Docker

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["node", "server.js"]
```

Build and run:
```bash
docker build -t f-b-api .
docker run -d -p 3001:3001 --env-file .env f-b-api
```

---

## 🔒 Security Checklist

- [ ] ✅ Set strong `JWT_SECRET` (32+ characters)
- [ ] ✅ Use HTTPS in production
- [ ] ✅ Configure CORS with specific domains (not `*`)
- [ ] ✅ Set `NODE_ENV=production`
- [ ] ✅ Use environment variables (never commit secrets)
- [ ] ✅ Enable rate limiting (consider adding)
- [ ] ✅ Set up SSL/TLS certificate
- [ ] ✅ Regular security updates
- [ ] ✅ Monitor API logs
- [ ] ✅ Set up database (replace mock data)

---

## 📱 Tablet App Integration

### Configuration

```javascript
// Tablet App Configuration
const API_CONFIG = {
  BASE_URL: 'https://your-api-domain.com/api',
  API_TOKEN: 'tb_your_generated_token_here',
  TIMEOUT: 30000
};
```

### Example: Fetch Restaurants

```javascript
async function fetchRestaurants() {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/restaurants`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_CONFIG.API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    if (data.success) {
      return data.data; // Array of restaurants
    }
    throw new Error(data.message || 'Failed to fetch restaurants');
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    throw error;
  }
}
```

### Example: Create Order

```javascript
async function createOrder(orderData) {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_CONFIG.API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });
    
    const data = await response.json();
    if (data.success) {
      return data.data; // Created order
    }
    throw new Error(data.message || 'Failed to create order');
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}
```

---

## 📊 API Response Format

All API responses follow this format:

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error message",
  "errors": {
    "field": ["Error details"]
  }
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

---

## 🧪 Testing API

### Test Token Verification
```bash
curl -X GET https://your-api-domain.com/api/tokens/verify \
  -H "Authorization: Bearer tb_your_token"
```

### Test Fetch Restaurants
```bash
curl -X GET https://your-api-domain.com/api/restaurants \
  -H "Authorization: Bearer tb_your_token"
```

### Test Public Menu (No Auth)
```bash
curl -X GET https://your-api-domain.com/api/public/menu/rest-123
```

---

## 📞 Support

For issues or questions:
1. Check API logs: `pm2 logs f-b-api`
2. Verify environment variables
3. Test endpoints with curl/Postman
4. Check CORS configuration

---

**Last Updated:** December 19, 2025

