# Smartler F&B Menu Management - Deployment Guide

## What Was Changed (Summary)

### Security Fix Applied
- **Removed hardcoded Supabase credentials** from the code to prevent exposure
- The app now **requires environment variables** for Supabase connection
- Cleaned up legacy code files

### Architecture Update
- **Before**: Portal → HTTP API (backend) → Supabase
- **After**: Portal → Direct Supabase Client → Supabase
- This means faster operations and simpler deployment
- The backend API remains available for tablet/mobile app integration

### Files Modified
- `supabaseClient.ts` - Removed hardcoded keys, now requires env vars
- `services/supabaseService.ts` - Comprehensive direct Supabase operations
- All component files updated to use direct Supabase calls
- `services/index.ts` - Deleted (was legacy file)

---

## Step 1: Set Up Supabase Database

### 1.1 Create Tables
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the entire contents of `database/supabase_schema.sql`
6. Click **Run** to execute

This will create all 13 required tables:
- `properties` - Hotel/venue properties
- `restaurants` - Restaurants within properties
- `users` - User accounts linked to Supabase Auth
- `menu_categories` - Menu categories
- `subcategories` - Subcategories within categories
- `menu_items` - Individual menu items
- `attributes` - Custom attributes for items
- `allergens` - Allergen definitions
- `modifier_groups` - Modifier group definitions
- `modifier_items` - Individual modifiers
- `menu_item_allergens` - Links items to allergens
- `menu_item_modifier_groups` - Links items to modifier groups
- `api_tokens` - API tokens for tablet/mobile apps

### 1.2 Enable Authentication
1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Enable **Email** provider (should be enabled by default)
3. Configure any additional providers as needed

### 1.3 Rotate Your Anon Key (IMPORTANT!)
Since the previous anon key was exposed in code:
1. Go to **Settings** → **API** in Supabase Dashboard
2. Under "Project API keys", click **Regenerate** on the anon key
3. Copy the new anon key for use in Vercel

---

## Step 2: Deploy to Vercel

### 2.1 Connect Repository
1. Go to [Vercel](https://vercel.com) and sign in
2. Click **Add New** → **Project**
3. Import your GitHub/GitLab repository
4. Vercel will auto-detect it's a Vite project

### 2.2 Configure Environment Variables
In Vercel project settings, add these environment variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGci...` | Your Supabase anon key (the NEW rotated one) |

**How to find these values:**
1. Go to Supabase Dashboard → **Settings** → **API**
2. **Project URL** = `VITE_SUPABASE_URL`
3. **anon public** key = `VITE_SUPABASE_ANON_KEY`

### 2.3 Build Settings
Vercel should auto-detect these, but verify:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 2.4 Deploy
Click **Deploy** and wait for the build to complete.

---

## Step 3: Post-Deployment

### 3.1 Create Your First Admin User
1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Click **Add User** → **Create New User**
3. Enter email and password
4. After user is created, note the user's UUID
5. Go to **Table Editor** → **users**
6. Add a row with:
   - `id`: The user's UUID from step 4
   - `email`: The user's email
   - `name`: Your name
   - `role`: `SuperAdmin`
   - `active`: `true`

### 3.2 Test the Application
1. Visit your Vercel deployment URL
2. Log in with the admin user credentials
3. Start adding properties, restaurants, and menu items

---

## Environment Variables Summary

### Required for Production (Vercel)
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Optional (if using backend API for tablets)
```
JWT_SECRET=your-32-character-secret
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NODE_ENV=production
```

---

## Troubleshooting

### "Supabase configuration missing" error
- Make sure environment variables are set in Vercel
- Ensure variable names start with `VITE_` (required for Vite to expose them)
- Redeploy after adding environment variables

### Users can't log in
- Check that users exist in both Supabase Auth AND the `users` table
- Verify the user's `id` in the `users` table matches their Auth UUID

### Data not loading
- Check browser console for errors
- Verify RLS policies are set correctly (run the SQL schema)
- Check that tables have data

### Need to reset everything
- Drop all tables in Supabase SQL Editor
- Re-run the schema SQL
- Recreate your admin user

---

## Architecture Overview

```
┌─────────────────────┐
│   React Frontend    │
│   (Vite + Tailwind) │
└─────────┬───────────┘
          │
          │ Direct connection via @supabase/supabase-js
          │
          ▼
┌─────────────────────┐
│     Supabase        │
│  - PostgreSQL DB    │
│  - Auth Service     │
│  - Real-time        │
└─────────────────────┘
```

The frontend connects directly to Supabase for all data operations. No backend server is needed for the portal itself.
