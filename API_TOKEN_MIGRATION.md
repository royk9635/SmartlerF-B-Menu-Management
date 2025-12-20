# 🔑 API Token Migration to Supabase

## ✅ Status: **COMPLETED**

API tokens are now stored in **Supabase** instead of in-memory, so they **persist across deployments**!

---

## 🔄 What Changed

### Before (Problem)
- API tokens stored in memory (`mockData.apiTokens`)
- **Lost on server restart** (Vercel redeploys)
- Tokens became invalid after each deployment

### After (Solution)
- API tokens stored in **Supabase** (`api_tokens` table)
- **Persist across deployments**
- Tokens remain valid until manually revoked or expired

---

## 📋 Database Schema

### New Table: `api_tokens`

```sql
CREATE TABLE api_tokens (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    restaurant_id UUID,
    property_id UUID,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_used_at TIMESTAMPTZ,
    created_by UUID
);
```

---

## 🚀 Next Steps

### 1. Run Updated SQL Schema

Go to **Supabase Dashboard → SQL Editor** and run the updated `supabase_schema.sql` to create the `api_tokens` table.

### 2. Generate New API Token

After the schema is updated, generate a new API token:

1. **Login to portal**
2. **Go to "API Tokens" page**
3. **Click "+ Generate New Token"**
4. **Fill in the form:**
   - Name: "Tablet App - Production"
   - Property: (select if needed)
   - Restaurant: (select if needed)
   - Expires in: 365 days
5. **Click "Generate Token"**
6. **Copy the token** (starts with `tb_`)

### 3. Use New Token in Tablet App

Replace the old token with the new one in your tablet app configuration.

---

## 🔍 Verify Token Works

Test the new token:

```bash
curl -H "Authorization: Bearer YOUR_NEW_TOKEN" \
  https://smartler-f-b-menu-management.vercel.app/api/tokens/verify
```

**Expected Response:**
```json
{
  "success": true,
  "message": "API token is valid",
  "data": {
    "tokenId": "...",
    "name": "Tablet App - Production",
    "isActive": true,
    ...
  }
}
```

---

## ⚠️ Important Notes

1. **Old tokens are invalid** - They were stored in memory and lost
2. **Generate new tokens** - Use the portal to create new ones
3. **Tokens persist** - New tokens will survive deployments
4. **Token expiration** - Set expiration dates when creating tokens

---

## 📊 What's Stored in Supabase Now

✅ **Properties**  
✅ **Restaurants**  
✅ **Categories**  
✅ **Menu Items**  
✅ **Users**  
✅ **Orders**  
✅ **Attributes**  
✅ **Allergens**  
✅ **API Tokens** ← **NEW!**

---

## 🎯 Summary

**Problem:** API tokens lost on deployment  
**Solution:** Moved to Supabase database  
**Result:** Tokens persist across deployments ✅

**Action Required:** Generate new API token via portal after running SQL schema update.

