# 🗄️ Supabase Integration Setup

## ✅ Status: **CONFIGURED**

Your backend is now using **Supabase** instead of mock data!

---

## 🔑 Supabase Credentials

**URL:** `https://pmnaywtzcmlsmqucyuie.supabase.co`  
**Anon Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtbmF5d3R6Y21sc21xdWN5dWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3Njg4NDIsImV4cCI6MjA3MzM0NDg0Mn0.13gNWEEmeZ4Fq2t3nAwUdijQ0Bm2KZNo_uo2P2zdwcU`

---

## 📋 Environment Variables

### For Local Development

Create `.env` file in the `backend/` directory:

```env
SUPABASE_URL=https://pmnaywtzcmlsmqucyuie.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtbmF5d3R6Y21sc21xdWN5dWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3Njg4NDIsImV4cCI6MjA3MzM0NDg0Mn0.13gNWEEmeZ4Fq2t3nAwUdijQ0Bm2KZNo_uo2P2zdwcU
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

### For Vercel Production

Add these in **Vercel Dashboard → Settings → Environment Variables**:

| Variable | Value |
|----------|-------|
| `SUPABASE_URL` | `https://pmnaywtzcmlsmqucyuie.supabase.co` |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtbmF5d3R6Y21sc21xdWN5dWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3Njg4NDIsImV4cCI6MjA3MzM0NDg0Mn0.13gNWEEmeZ4Fq2t3nAwUdijQ0Bm2KZNo_uo2P2zdwcU` |
| `JWT_SECRET` | (Generate with `openssl rand -base64 32`) |
| `NODE_ENV` | `production` |

---

## 🗃️ Database Schema

The database schema is defined in `supabase_schema.sql`. Make sure to run this SQL in your Supabase dashboard:

1. Go to **Supabase Dashboard → SQL Editor**
2. Copy contents of `supabase_schema.sql`
3. Run the SQL script

---

## 📊 What's Now Using Supabase

✅ **Properties** - Stored in `properties` table  
✅ **Restaurants** - Stored in `restaurants` table  
✅ **Categories** - Stored in `menu_categories` table  
✅ **Menu Items** - Stored in `menu_items` table  
✅ **Users** - Stored in `users` table  
✅ **Orders** - Stored in `live_orders` table  
✅ **Attributes** - Stored in `attributes` table  
✅ **Allergens** - Stored in `allergens` table  

⚠️ **API Tokens** - Still in-memory (can be moved to Supabase later)

---

## 🔄 Migration from Mock Data

All endpoints have been migrated to use Supabase:

- ✅ `GET /api/properties` → `supabase.from('properties').select()`
- ✅ `GET /api/restaurants` → `supabase.from('restaurants').select()`
- ✅ `GET /api/categories` → `supabase.from('menu_categories').select()`
- ✅ `GET /api/menu-items` → `supabase.from('menu_items').select()`
- ✅ `POST /api/auth/login` → `supabase.from('users').select()`
- ✅ `GET /api/users` → `supabase.from('users').select()`
- ✅ `GET /api/orders` → `supabase.from('live_orders').select()`
- ✅ `GET /api/attributes` → `supabase.from('attributes').select()`
- ✅ `GET /api/allergens` → `supabase.from('allergens').select()`
- ✅ `GET /api/public/menu/:restaurantId` → Complex query with joins

---

## 🚀 Next Steps

1. **Run the SQL schema** in Supabase Dashboard
2. **Add environment variables** to Vercel
3. **Test the API** endpoints
4. **Create initial data** via the portal or Supabase dashboard

---

## 📝 Notes

- **Row Level Security (RLS)** is enabled on all tables
- **Public read access** is enabled for public menu endpoints
- **Authenticated users** have full access (can be refined later)
- **Password hashing** uses bcrypt (stored in `password_hash` column)

---

**Status:** ✅ Backend migrated to Supabase  
**Next:** Deploy and test!

