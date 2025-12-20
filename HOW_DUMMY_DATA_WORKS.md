# 📊 How Dummy Data Works in the Portal

## 🔍 Where the Data Comes From

The portal shows dummy/mock data because **there's no database connected**. Instead, the data is **hardcoded in memory** in the backend server.

---

## 📍 Location: `backend/server.js`

The dummy data is defined in a JavaScript object called `mockData` starting at **line 141**:

```javascript
// Mock data storage
let mockData = {
  users: [
    {
      id: 'user-123',
      name: 'Admin User',
      email: 'admin@example.com',
      password: '...', // password
      role: 'Superadmin',
      propertyId: 'prop-123',
      ...
    }
  ],
  properties: [
    {
      id: 'prop-123',
      name: 'Downtown Location',
      address: '123 Main St, City, State',
      ...
    }
  ],
  restaurants: [
    {
      id: 'rest-123',
      name: 'Main Restaurant',
      propertyId: 'prop-123',
      ...
    }
  ],
  categories: [...],
  menuItems: [...],
  orders: [...],
  attributes: [...],
  allergens: [...],
  apiTokens: [...]
};
```

---

## 🔄 How It Works

### 1. **In-Memory Storage**
- Data is stored in a JavaScript object (`mockData`)
- Lives only in the server's memory (RAM)
- **Lost when server restarts** (unless you add persistence)

### 2. **API Endpoints Use This Data**
All API endpoints read from and write to `mockData`:

```javascript
// Example: Get all properties
app.get('/api/properties', (req, res) => {
  res.json({
    success: true,
    data: mockData.properties  // ← Returns mock data
  });
});

// Example: Add a property
app.post('/api/properties', (req, res) => {
  const newProperty = { ...req.body, id: generateId() };
  mockData.properties.push(newProperty);  // ← Adds to mock data
  res.json({ success: true, data: newProperty });
});
```

### 3. **Frontend Connects to Backend**
- Frontend makes API calls to `/api/*` endpoints
- Backend responds with data from `mockData`
- Portal displays this data

---

## ⚠️ Important Limitations

### ❌ **Data Persistence**
- **Data is NOT saved** to disk or database
- **Lost on server restart** (Vercel serverless functions restart frequently)
- **Not shared** between server instances

### ❌ **No Real Database**
- No PostgreSQL, MySQL, MongoDB, etc.
- No data backup or recovery
- No data relationships or constraints

### ✅ **What Works**
- You can **add/edit/delete** data via the portal
- Changes persist **until server restarts**
- Good for **testing and development**

---

## 🎯 Why You See Different Data

You might see different data depending on:

1. **Frontend Mock Data** (`services/mockApiService.ts`)
   - Used when `VITE_USE_REAL_API=false`
   - Has data like "Grand Hotel Downtown", "Seaside Resort & Spa"

2. **Backend Mock Data** (`backend/server.js`)
   - Used when `VITE_USE_REAL_API=true` (production)
   - Has data like "Downtown Location", "Main Restaurant"

3. **Data You Added**
   - Any properties/restaurants you created via the portal
   - Stored in `mockData` until server restarts

---

## 🔧 How to Add More Dummy Data

### Option 1: Edit `backend/server.js`

Add more entries to the `mockData` object:

```javascript
properties: [
  {
    id: 'prop-123',
    name: 'Downtown Location',
    address: '123 Main St, City, State',
    ...
  },
  {
    id: 'prop-456',  // ← Add new property
    name: 'Uptown Branch',
    address: '789 Park Ave, City, State',
    ...
  }
]
```

### Option 2: Use the Portal

1. Login to portal
2. Go to "Properties" page
3. Click "+ Add Property"
4. Fill in the form
5. Click "Save"

**Note:** This data will be lost when Vercel restarts the serverless function.

---

## 🚀 To Connect a Real Database

To make data persistent, you need to:

1. **Choose a database:**
   - PostgreSQL (recommended)
   - MongoDB
   - MySQL
   - Supabase (PostgreSQL + auth)

2. **Update `backend/server.js`:**
   - Replace `mockData` with database queries
   - Use a database client (e.g., `pg`, `mongoose`, `prisma`)

3. **Add connection string:**
   - Store in Vercel environment variables
   - Connect on server startup

---

## 📋 Current Data Structure

The `mockData` object contains:

- ✅ **users** - Admin users for login
- ✅ **properties** - Hotel/building locations
- ✅ **restaurants** - Restaurants within properties
- ✅ **categories** - Menu categories
- ✅ **menuItems** - Food items
- ✅ **orders** - Customer orders
- ✅ **attributes** - Food attributes (spicy, healthy, etc.)
- ✅ **allergens** - Allergen information
- ✅ **apiTokens** - API tokens for tablet apps

---

## 🎓 Summary

**The dummy data exists because:**
1. It's hardcoded in `backend/server.js` (line 141)
2. Stored in memory (not a database)
3. Lost when server restarts
4. Good for development/testing

**To make it persistent:**
- Connect a real database (PostgreSQL, MongoDB, etc.)
- Replace `mockData` with database queries
- Add connection string to Vercel environment variables

---

**Current Status:** ✅ Working with in-memory mock data  
**Next Step:** 🔌 Connect a database for production use

