import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import http from 'http';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const app = express();
const server = http.createServer(app);

// Configuration
const PORT = process.env.PORT || 3002;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Vercel compatibility - detect Vercel environment
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;

// JWT_SECRET - use environment variable or fallback for development
const JWT_SECRET = process.env.JWT_SECRET || (NODE_ENV === 'production' && !isVercel ? null : 'your-super-secret-jwt-key-change-this-in-production');

// Validate JWT_SECRET in production (only for non-Vercel deployments)
// On Vercel, environment variables are set via dashboard, so we allow it to be undefined
// and let the actual API calls fail gracefully if not set
if (NODE_ENV === 'production' && !isVercel && !JWT_SECRET) {
  console.error('❌ ERROR: JWT_SECRET must be set in production!');
  console.error('   Set it via: export JWT_SECRET=your-secret-key');
  process.exit(1);
}

// Warn if JWT_SECRET is not set on Vercel (but don't exit)
if (isVercel && !process.env.JWT_SECRET) {
  console.warn('⚠️  WARNING: JWT_SECRET not set in Vercel environment variables!');
  console.warn('   Set it in Vercel Dashboard → Settings → Environment Variables');
  console.warn('   API authentication will fail until JWT_SECRET is set.');
}

// Supabase Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://pmnaywtzcmlsmqucyuie.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtbmF5d3R6Y21sc21xdWN5dWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3Njg4NDIsImV4cCI6MjA3MzM0NDg0Mn0.13gNWEEmeZ4Fq2t3nAwUdijQ0Bm2KZNo_uo2P2zdwcU';
// Use service role key for backend operations (bypasses RLS)
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;

// Initialize Supabase client with service role key for backend operations
// Service role key bypasses RLS policies, allowing full database access
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('✅ Supabase client initialized');
console.log(`   URL: ${SUPABASE_URL}`);

// CORS Configuration - Production Ready
const getAllowedOrigins = () => {
  if (NODE_ENV === 'production') {
    const origins = [];
    
    // Add frontend URL from environment
    if (process.env.FRONTEND_URL) {
      origins.push(process.env.FRONTEND_URL);
    }
    
    // Add tablet app URL from environment
    if (process.env.TABLET_APP_URL) {
      origins.push(process.env.TABLET_APP_URL);
    }
    
    // Add additional allowed origins from environment (comma-separated)
    if (process.env.ALLOWED_ORIGINS) {
      origins.push(...process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()));
    }
    
    // Default production origins (update these with your actual domains)
    if (origins.length === 0) {
      console.warn('⚠️  WARNING: No CORS origins configured. Using default production origins.');
      origins.push(
        'https://your-frontend-domain.com',
        'https://your-tablet-app-domain.com'
      );
    }
    
    return origins;
  } else {
    // Development origins
    return [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
      'http://localhost:5175'
    ];
  }
};

const allowedOrigins = getAllowedOrigins();

// CORS Middleware - Production Ready
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) {
      return callback(null, true);
    }
    
    // In development, allow all localhost origins
    if (NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // In production, check against allowed origins
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`⚠️  CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS policy'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// WebSocket CORS Configuration
const io = new Server(server, {
  cors: {
    origin: NODE_ENV === 'development' ? true : allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Security Headers Middleware
app.use((req, res, next) => {
  // Security headers for production
  if (NODE_ENV === 'production') {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// Request logging middleware (production)
if (NODE_ENV === 'production') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - Origin: ${req.headers.origin || 'none'}`);
    next();
  });
}

app.use(express.json({ limit: '10mb' })); // Increase limit for file uploads
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Tokens storage (still in-memory for now, can be moved to Supabase later)
// Note: Most data is now stored in Supabase, but API tokens remain in memory
let mockData = {
  // Legacy mock data - most endpoints now use Supabase
  // Keeping this structure only for apiTokens which are still in-memory
  users: [],
  properties: [],
  restaurants: [],
  categories: [],
  menuItems: [],
  orders: [],
  attributes: [],
  allergens: [],
  users: [
    {
      id: 'user-123',
      name: 'Admin User',
      email: 'admin@example.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
      role: 'Superadmin',
      propertyId: 'prop-123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  properties: [
    {
      id: 'prop-123',
      name: 'Downtown Location',
      address: '123 Main St, City, State',
      phone: '+1-555-0123',
      email: 'downtown@restaurant.com',
      tenantId: 'tenant-123',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  restaurants: [
    {
      id: 'rest-123',
      name: 'Main Restaurant',
      propertyId: 'prop-123',
      cuisine: 'Italian',
      phone: '+1-555-0123',
      email: 'main@restaurant.com',
      address: '123 Main St, City, State',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  categories: [
    {
      id: 'cat-123',
      name: 'Appetizers',
      restaurantId: 'rest-123',
      description: 'Start your meal with our delicious appetizers',
      sortOrder: 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'cat-456',
      name: 'Main Courses',
      restaurantId: 'rest-123',
      description: 'Our signature main dishes',
      sortOrder: 2,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  menuItems: [
    {
      id: 'item-123',
      name: 'Caesar Salad',
      description: 'Fresh romaine lettuce with caesar dressing',
      price: 12.99,
      categoryId: 'cat-123',
      subCategoryId: null,
      imageUrl: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400',
      isAvailable: true,
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false,
      allergens: ['dairy'],
      attributes: ['healthy', 'fresh'],
      modifierGroups: ['dressing-options'],
      nutritionInfo: {
        calories: 250,
        protein: 8,
        carbs: 15,
        fat: 18
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'item-456',
      name: 'Margherita Pizza',
      description: 'Classic pizza with tomato, mozzarella, and basil',
      price: 16.99,
      categoryId: 'cat-456',
      subCategoryId: null,
      imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400',
      isAvailable: true,
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false,
      allergens: ['gluten', 'dairy'],
      attributes: ['classic', 'popular'],
      modifierGroups: ['size-options'],
      nutritionInfo: {
        calories: 320,
        protein: 12,
        carbs: 35,
        fat: 14
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  orders: [
    {
      id: 'order-123',
      restaurantId: 'rest-123',
      customerName: 'John Doe',
      customerPhone: '+1-555-0123',
      customerEmail: 'john@example.com',
      status: 'pending',
      items: [
        {
          menuItemId: 'item-123',
          name: 'Caesar Salad',
          quantity: 2,
          price: 12.99,
          modifiers: [
            {
              name: 'Extra Dressing',
              price: 1.00
            }
          ]
        }
      ],
      subtotal: 25.98,
      tax: 2.60,
      total: 28.58,
      notes: 'No onions please',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  attributes: [
    {
      id: 'attr-123',
      name: 'Spicy',
      description: 'Contains spicy ingredients',
      color: '#ff4444',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  allergens: [
    {
      id: 'allergen-123',
      name: 'Dairy',
      description: 'Contains dairy products',
      icon: '🥛',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  apiTokens: [
    // API tokens for tablet apps will be stored here
  ]
};

// Authentication middleware - supports both JWT tokens (portal) and API tokens (tablet apps)
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  // First, try Supabase Auth token (EASIEST - no JWT secret needed!)
  try {
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);
    
    if (!authError && authUser) {
      // Valid Supabase Auth token - get user from users table
      const { data: user } = await supabase
        .from('users')
        .select('id, name, email, role, property_id')
        .eq('id', authUser.id)
        .single();
      
      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          propertyId: user.property_id
        };
        req.authType = 'supabase';
        return next();
      }
    }
  } catch (supabaseError) {
    // Not a Supabase token, try JWT
  }

  // Try JWT token (for backward compatibility)
  jwt.verify(token, JWT_SECRET, async (err, user) => {
    if (!err) {
      // Valid JWT token
      req.user = user;
      req.authType = 'jwt';
      return next();
    }

    // If JWT verification fails, check if it's an API token (for tablet apps)
    try {
      const { data: apiToken, error } = await supabase
        .from('api_tokens')
        .select('*')
        .eq('token', token)
        .eq('is_active', true)
        .single();
      
      if (!error && apiToken) {
        // Check if token is expired
        if (apiToken.expires_at && new Date(apiToken.expires_at) < new Date()) {
          return res.status(403).json({ success: false, message: 'API token has expired' });
        }
        
        // Valid API token
        req.user = {
          id: apiToken.id,
          type: 'api_token',
          name: apiToken.name,
          restaurantId: apiToken.restaurant_id,
          propertyId: apiToken.property_id
        };
        req.authType = 'api_token';
        
        // Update last used timestamp
        await supabase
          .from('api_tokens')
          .update({ last_used_at: new Date().toISOString() })
          .eq('id', apiToken.id);
        
        return next();
      }
    } catch (dbErr) {
      console.error('Error checking API token:', dbErr);
    }
    
    // Neither JWT nor API token is valid
    return res.status(403).json({ success: false, message: 'Invalid token' });
  });
};

// Middleware for API token only (for tablet-specific endpoints)
const authenticateApiToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'API token required' });
  }
  
  try {
    const { data: apiToken, error } = await supabase
      .from('api_tokens')
      .select('*')
      .eq('token', token)
      .eq('is_active', true)
      .single();
    
    if (error || !apiToken) {
      return res.status(403).json({ success: false, message: 'Invalid or inactive API token' });
    }
    
    // Check if token is expired
    if (apiToken.expires_at && new Date(apiToken.expires_at) < new Date()) {
      return res.status(403).json({ success: false, message: 'API token has expired' });
    }
    
    req.user = {
      id: apiToken.id,
      type: 'api_token',
      name: apiToken.name,
      restaurantId: apiToken.restaurant_id,
      propertyId: apiToken.property_id
    };
    req.apiToken = apiToken;
    
    // Update last used timestamp
    await supabase
      .from('api_tokens')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', apiToken.id);
    
    next();
  } catch (err) {
    console.error('Error authenticating API token:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Helper function to generate ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Root endpoint - only for API info (when accessed via /api/)
// On Vercel, the frontend handles the root route, so this won't interfere
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'F&B Menu Management API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/login',
      restaurants: '/api/restaurants',
      categories: '/api/categories',
      menuItems: '/api/menu-items',
      orders: '/api/orders',
      publicMenu: '/api/public/menu/:restaurantId'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    vercel: process.env.VERCEL === '1' ? 'yes' : 'no'
  });
});

// Authentication endpoints
// Login using Supabase Auth (EASIEST - no password hashing needed!)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    // Use Supabase Auth - handles password verification automatically!
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (authError || !authData.user) {
      return res.status(401).json({
        success: false,
        message: authError?.message || 'Invalid credentials'
      });
    }
    
    // Get user details from users table (synced by trigger)
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, name, email, role, property_id')
      .eq('id', authData.user.id)
      .single();
    
    if (userError || !user) {
      // User exists in auth but not in users table - create it
      const { data: newUser } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: authData.user.email,
          name: authData.user.user_metadata?.name || authData.user.email,
          role: authData.user.user_metadata?.role || 'Staff',
          active: true
        })
        .select('id, name, email, role, property_id')
        .single();
      
      if (!newUser) {
        return res.status(500).json({
          success: false,
          message: 'Failed to create user profile'
        });
      }
      
      // Return session token from Supabase Auth
      res.json({
        success: true,
        data: {
          user: newUser,
          token: authData.session.access_token // Use Supabase session token
        }
      });
      return;
    }
    
    // Update last login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);
    
    // Return session token from Supabase Auth
    res.json({
      success: true,
      data: {
        user,
        token: authData.session.access_token // Use Supabase session token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Register new user using Supabase Auth (EASIEST - no password hashing needed!)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role = 'Staff', propertyId = null } = req.body;
    
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }
    
    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }
    
    // Validate role
    const validRoles = ['Superadmin', 'Property Admin', 'Staff'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be Superadmin, Property Admin, or Staff'
      });
    }
    
    // Use Supabase Auth to create user - handles password hashing automatically!
    // Note: Set email confirmation to false in Supabase Dashboard for immediate login
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
          property_id: propertyId
        },
        emailRedirectTo: undefined // No email confirmation needed
      }
    });
    
    if (authError || !authData.user) {
      let errorMessage = 'Failed to create user account';
      if (authError?.message) {
        errorMessage = authError.message;
      } else if (authError?.code === 'user_already_registered' || authError?.message?.includes('already registered')) {
        errorMessage = 'Email already registered';
      }
      
      return res.status(400).json({
        success: false,
        message: errorMessage
      });
    }
    
    // Get user from users table (created by trigger, or create manually)
    let user;
    // Wait a moment for trigger to fire
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, name, email, role, property_id')
      .eq('id', authData.user.id)
      .single();
    
    if (existingUser) {
      user = existingUser;
    } else {
      // Trigger might not have fired yet, create manually
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: authData.user.email,
          name,
          role,
          property_id: propertyId,
          active: true
        })
        .select('id, name, email, role, property_id')
        .single();
      
      if (insertError || !newUser) {
        console.error('Failed to create user profile:', insertError);
        return res.status(500).json({
          success: false,
          message: 'Failed to create user profile. User created in auth but not in users table.'
        });
      }
      user = newUser;
    }
    
    // If session is available (email confirmation disabled), return it
    // Otherwise, user needs to login after email confirmation
    if (authData.session) {
      res.status(201).json({
        success: true,
        data: {
          user,
          token: authData.session.access_token
        }
      });
    } else {
      // Email confirmation required - user needs to login after confirming
      res.status(201).json({
        success: true,
        data: {
          user,
          token: null,
          message: 'Account created. Please check your email to confirm your account, then login.'
        }
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  // #region agent log
  try { fs.appendFileSync('/Users/kaushik/Desktop/F&Bportal 181225/smartler-f-b-menu-management/.cursor/debug.log', JSON.stringify({location:'server.js:640',message:'/api/auth/me endpoint hit',data:{hasAuth:!!req.headers.authorization,method:req.method,path:req.path},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'}) + '\n'); } catch(e) {}
  // #endregion
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();
    
    if (error || !user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        propertyId: user.property_id
      }
    });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.post('/api/auth/logout', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Helper function to transform snake_case to camelCase
const toCamelCase = (str) => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

const transformObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(transformObject);
  
  const transformed = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = toCamelCase(key);
    transformed[camelKey] = typeof value === 'object' && value !== null && !(value instanceof Date) 
      ? transformObject(value) 
      : value;
  }
  return transformed;
};

// Properties endpoints (authentication removed - accessible without login)
app.get('/api/properties', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch properties',
        error: error.message
      });
    }
    
    // Transform snake_case to camelCase
    const transformedData = transformObject(data || []);
    
    res.json({
      success: true,
      data: transformedData
    });
  } catch (err) {
    console.error('Error fetching properties:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.get('/api/properties/:id', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }
    
    // Transform snake_case to camelCase
    const transformedData = transformObject(data);
    
    res.json({
      success: true,
      data: transformedData
    });
  } catch (err) {
    console.error('Error fetching property:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.post('/api/properties', async (req, res) => {
  try {
    const { name, address, phone, email, tenantId, tenant_id } = req.body;
    
    const { data, error } = await supabase
      .from('properties')
      .insert({
        name,
        address,
        phone,
        email,
        tenant_id: tenantId || tenant_id || 'tenant-123'
      })
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create property',
        error: error.message
      });
    }
    
    // Transform snake_case to camelCase
    const transformedData = transformObject(data);
    
    res.status(201).json({
      success: true,
      data: transformedData
    });
  } catch (err) {
    console.error('Error creating property:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.put('/api/properties/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, phone, email, tenantId, tenant_id } = req.body;
    
    console.log('📝 Updating property:', { id, name, address, phone, email, tenantId, tenant_id });
    
    // Build update data object
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (address !== undefined) updateData.address = address;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (tenantId !== undefined) updateData.tenant_id = tenantId;
    if (tenant_id !== undefined) updateData.tenant_id = tenant_id;
    
    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString();
    
    console.log('📦 Update data:', updateData);
    
    // Check if updateData is empty
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }
    
    const { data, error } = await supabase
      .from('properties')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Supabase update error:', error);
      console.error('   Error code:', error.code);
      console.error('   Error message:', error.message);
      console.error('   Error details:', error.details);
      console.error('   Error hint:', error.hint);
      
      // Return more specific error message
      return res.status(500).json({
        success: false,
        message: `Failed to update property: ${error.message || 'Database error'}`,
        error: error.code,
        details: error.details || error.hint
      });
    }
    
    if (!data) {
      console.error('❌ No data returned from update');
      return res.status(404).json({
        success: false,
        message: 'Property not found or update had no effect'
      });
    }
    
    console.log('✅ Property updated successfully:', data);
    
    const transformedData = transformObject(data);
    
    res.json({
      success: true,
      data: transformedData
    });
  } catch (err) {
    console.error('❌ Error updating property:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message
    });
  }
});

app.delete('/api/properties/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete property',
        error: error.message
      });
    }
    
    res.json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting property:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Restaurants endpoints
app.get('/api/restaurants', authenticateToken, async (req, res) => {
  try {
    const { propertyId } = req.query;
    let query = supabase
      .from('restaurants')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (propertyId) {
      query = query.eq('property_id', propertyId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch restaurants',
        error: error.message
      });
    }
    
    // Transform snake_case to camelCase
    const transformedData = transformObject(data || []);
    
    res.json({
      success: true,
      data: transformedData
    });
  } catch (err) {
    console.error('Error fetching restaurants:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.post('/api/restaurants', authenticateToken, async (req, res) => {
  try {
    const { name, propertyId, cuisine, phone, email, address, isActive } = req.body;
    
    if (!name || !propertyId) {
      return res.status(400).json({
        success: false,
        message: 'Name and propertyId are required'
      });
    }
    
    const { data, error } = await supabase
      .from('restaurants')
      .insert({
        name,
        property_id: propertyId,
        cuisine,
        phone,
        email,
        address,
        is_active: isActive !== undefined ? isActive : true
      })
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create restaurant',
        error: error.message
      });
    }
    
    const transformedData = transformObject(data);
    
    res.status(201).json({
      success: true,
      data: transformedData
    });
  } catch (err) {
    console.error('Error creating restaurant:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.put('/api/restaurants/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, propertyId, cuisine, phone, email, address, isActive } = req.body;
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (propertyId !== undefined) updateData.property_id = propertyId;
    if (cuisine !== undefined) updateData.cuisine = cuisine;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (address !== undefined) updateData.address = address;
    if (isActive !== undefined) updateData.is_active = isActive;
    
    const { data, error } = await supabase
      .from('restaurants')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }
    
    const transformedData = transformObject(data);
    
    res.json({
      success: true,
      data: transformedData
    });
  } catch (err) {
    console.error('Error updating restaurant:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.delete('/api/restaurants/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('restaurants')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete restaurant',
        error: error.message
      });
    }
    
    res.json({
      success: true,
      message: 'Restaurant deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting restaurant:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Categories endpoints
app.get('/api/categories', authenticateToken, async (req, res) => {
  try {
    const { restaurantId } = req.query;
    let query = supabase
      .from('menu_categories')
      .select('*')
      .order('sort_order', { ascending: true });
    
    if (restaurantId) {
      query = query.eq('restaurant_id', restaurantId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch categories',
        error: error.message
      });
    }
    
    // Transform snake_case to camelCase
    const transformedData = transformObject(data || []);
    
    res.json({
      success: true,
      data: transformedData
    });
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.post('/api/categories', authenticateToken, async (req, res) => {
  try {
    const { name, restaurantId, description, sortOrder, activeFlag, isActive } = req.body;
    
    if (!name || !restaurantId) {
      return res.status(400).json({
        success: false,
        message: 'Name and restaurantId are required'
      });
    }
    
    const { data, error } = await supabase
      .from('menu_categories')
      .insert({
        name,
        restaurant_id: restaurantId,
        description,
        sort_order: sortOrder || 0,
        active_flag: activeFlag !== undefined ? activeFlag : (isActive !== undefined ? isActive : true)
      })
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create category',
        error: error.message
      });
    }
    
    const transformedData = transformObject(data);
    
    res.status(201).json({
      success: true,
      data: transformedData
    });
  } catch (err) {
    console.error('Error creating category:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.put('/api/categories/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, restaurantId, description, sortOrder, activeFlag, isActive } = req.body;
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (restaurantId !== undefined) updateData.restaurant_id = restaurantId;
    if (description !== undefined) updateData.description = description;
    if (sortOrder !== undefined) updateData.sort_order = sortOrder;
    if (activeFlag !== undefined) updateData.active_flag = activeFlag;
    if (isActive !== undefined) updateData.active_flag = isActive;
    
    const { data, error } = await supabase
      .from('menu_categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    const transformedData = transformObject(data);
    
    res.json({
      success: true,
      data: transformedData
    });
  } catch (err) {
    console.error('Error updating category:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.delete('/api/categories/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('menu_categories')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete category',
        error: error.message
      });
    }
    
    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Menu items endpoints
app.get('/api/menu-items', authenticateToken, async (req, res) => {
  try {
    const { categoryId, subCategoryId } = req.query;
    let query = supabase
      .from('menu_items')
      .select('*')
      .order('sort_order', { ascending: true });
    
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    
    if (subCategoryId) {
      query = query.eq('subcategory_id', subCategoryId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch menu items',
        error: error.message
      });
    }
    
    // Transform snake_case to camelCase
    const transformedData = transformObject(data || []);
    
    res.json({
      success: true,
      data: transformedData
    });
  } catch (err) {
    console.error('Error fetching menu items:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.post('/api/menu-items', authenticateToken, async (req, res) => {
  try {
    const { 
      name, categoryId, subCategoryId, description, price, 
      imageUrl, isAvailable, availabilityFlag, sortOrder,
      displayName, itemCode, prepTime, soldOut, portion,
      specialType, calories, maxOrderQty, bogo, complimentary,
      imageOrientation, availableTime, availableDate, attributes,
      tenantId
    } = req.body;
    
    if (!name || !categoryId || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name, categoryId, and price are required'
      });
    }
    
    const insertData = {
      name,
      category_id: categoryId,
      subcategory_id: subCategoryId || null,
      description,
      price,
      image_url: imageUrl || null,
      availability_flag: availabilityFlag !== undefined ? availabilityFlag : (isAvailable !== undefined ? isAvailable : true),
      sort_order: sortOrder || 0,
      display_name: displayName,
      item_code: itemCode,
      prep_time: prepTime,
      sold_out: soldOut || false,
      portion,
      special_type: specialType || 'None',
      calories,
      max_order_qty: maxOrderQty || 10,
      bogo: bogo || false,
      complimentary,
      image_orientation: imageOrientation || '1:1',
      available_time: availableTime,
      available_date: availableDate,
      attributes: attributes || {},
      tenant_id: tenantId || 'tenant-123'
    };
    
    const { data, error } = await supabase
      .from('menu_items')
      .insert(insertData)
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create menu item',
        error: error.message
      });
    }
    
    const transformedData = transformObject(data);
    
    res.status(201).json({
      success: true,
      data: transformedData
    });
  } catch (err) {
    console.error('Error creating menu item:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.put('/api/menu-items/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {};
    
    // Map camelCase to snake_case
    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.categoryId !== undefined) updateData.category_id = req.body.categoryId;
    if (req.body.subCategoryId !== undefined) updateData.subcategory_id = req.body.subCategoryId;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.price !== undefined) updateData.price = req.body.price;
    if (req.body.imageUrl !== undefined) updateData.image_url = req.body.imageUrl;
    if (req.body.isAvailable !== undefined) updateData.availability_flag = req.body.isAvailable;
    if (req.body.availabilityFlag !== undefined) updateData.availability_flag = req.body.availabilityFlag;
    if (req.body.sortOrder !== undefined) updateData.sort_order = req.body.sortOrder;
    if (req.body.displayName !== undefined) updateData.display_name = req.body.displayName;
    if (req.body.itemCode !== undefined) updateData.item_code = req.body.itemCode;
    if (req.body.prepTime !== undefined) updateData.prep_time = req.body.prepTime;
    if (req.body.soldOut !== undefined) updateData.sold_out = req.body.soldOut;
    if (req.body.portion !== undefined) updateData.portion = req.body.portion;
    if (req.body.specialType !== undefined) updateData.special_type = req.body.specialType;
    if (req.body.calories !== undefined) updateData.calories = req.body.calories;
    if (req.body.maxOrderQty !== undefined) updateData.max_order_qty = req.body.maxOrderQty;
    if (req.body.bogo !== undefined) updateData.bogo = req.body.bogo;
    if (req.body.complimentary !== undefined) updateData.complimentary = req.body.complimentary;
    if (req.body.imageOrientation !== undefined) updateData.image_orientation = req.body.imageOrientation;
    if (req.body.availableTime !== undefined) updateData.available_time = req.body.availableTime;
    if (req.body.availableDate !== undefined) updateData.available_date = req.body.availableDate;
    if (req.body.attributes !== undefined) updateData.attributes = req.body.attributes;
    
    const { data, error } = await supabase
      .from('menu_items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }
    
    const transformedData = transformObject(data);
    
    res.json({
      success: true,
      data: transformedData
    });
  } catch (err) {
    console.error('Error updating menu item:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.delete('/api/menu-items/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete menu item',
        error: error.message
      });
    }
    
    res.json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting menu item:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Public menu endpoint
app.get('/api/public/menu/:restaurantId', async (req, res) => {
  try {
    const { restaurantId } = req.params;
    
    // Get restaurant
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', restaurantId)
      .single();
    
    if (restaurantError || !restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }
    
    // Get categories with items
    const { data: categories, error: categoriesError } = await supabase
      .from('menu_categories')
      .select(`
        *,
        menu_items (
          id,
          name,
          description,
          price,
          image_url,
          availability_flag,
          allergens:menu_item_allergens (
            allergen:allergens (id, name)
          ),
          attributes
        )
      `)
      .eq('restaurant_id', restaurantId)
      .eq('active_flag', true)
      .order('sort_order', { ascending: true });
    
    if (categoriesError) {
      console.error('Supabase error:', categoriesError);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch menu',
        error: categoriesError.message
      });
    }
    
    // Format categories with items
    const formattedCategories = (categories || []).map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      sortOrder: category.sort_order,
      activeFlag: category.active_flag,
      restaurantId: category.restaurant_id,
      items: (category.menu_items || [])
        .filter(item => item.availability_flag)
        .map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          imageUrl: item.image_url,
          isAvailable: item.availability_flag,
          allergens: (item.allergens || []).map(a => a.allergen?.name).filter(Boolean),
          attributes: item.attributes || {}
        }))
    }));
    
    res.json({
      success: true,
      data: {
        restaurant: {
          id: restaurant.id,
          name: restaurant.name,
          cuisine: restaurant.cuisine,
          phone: restaurant.phone,
          address: restaurant.address
        },
        categories: formattedCategories
      }
    });
  } catch (err) {
    console.error('Error fetching public menu:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Public order creation endpoint (no authentication required)
app.post('/api/public/orders', async (req, res) => {
  try {
    const { restaurantId, tableNumber, items, customerName, customerPhone, customerEmail, notes } = req.body;
    
    // Validate required fields
    if (!restaurantId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: restaurantId and items are required'
      });
    }
    
    // Calculate total amount from items
    let totalAmount = 0;
    const processedItems = items.map(item => {
      // Calculate item total (base price * quantity)
      const itemBaseTotal = (item.price || 0) * (item.quantity || 1);
      
      // Calculate modifiers total if present
      let modifiersTotal = 0;
      if (item.modifiers && Array.isArray(item.modifiers)) {
        modifiersTotal = item.modifiers.reduce((sum, mod) => sum + (mod.price || 0), 0);
      }
      
      const itemTotal = itemBaseTotal + modifiersTotal;
      totalAmount += itemTotal;
      
      // Return processed item with all necessary data
      return {
        menuItemId: item.menuItemId,
        name: item.name || 'Unknown Item',
        quantity: item.quantity || 1,
        price: item.price || 0,
        notes: item.notes || null,
        modifiers: item.modifiers || []
      };
    });
    
    // Prepare order data for database
    const orderData = {
      restaurant_id: restaurantId,
      table_number: tableNumber || null,
      items: processedItems,
      total_amount: parseFloat(totalAmount.toFixed(2)),
      status: 'New',
      placed_at: new Date().toISOString()
    };
    
    // Save order to database
    const { data: order, error } = await supabase
      .from('live_orders')
      .insert(orderData)
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error creating order:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create order',
        error: error.message
      });
    }
    
    // Emit WebSocket event for real-time updates
    if (io) {
      io.emit('order_created', {
        type: 'order_created',
        data: {
          orderId: order.id,
          restaurantId: order.restaurant_id,
          status: order.status,
          totalAmount: order.total_amount
        },
        timestamp: new Date().toISOString()
      });
    }
    
    // Transform snake_case to camelCase for response
    const transformedData = transformObject(order);
    
    res.status(201).json({
      success: true,
      data: transformedData,
      message: 'Order created successfully'
    });
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message
    });
  }
});

// Orders endpoints
app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    const { restaurantId } = req.query;
    let query = supabase
      .from('live_orders')
      .select('*')
      .order('placed_at', { ascending: false });
    
    if (restaurantId) {
      query = query.eq('restaurant_id', restaurantId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch orders',
        error: error.message
      });
    }
    
    // Transform snake_case to camelCase
    const transformedData = transformObject(data || []);
    
    res.json({
      success: true,
      data: transformedData
    });
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.patch('/api/orders/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const { data: order, error } = await supabase
      .from('live_orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error || !order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Emit WebSocket event
    io.emit('order_updated', {
      type: 'order_updated',
      data: {
        orderId: order.id,
        restaurantId: order.restaurant_id,
        status: order.status
      },
      timestamp: new Date().toISOString()
    });
    
    // Transform snake_case to camelCase
    const transformedData = transformObject(order);
    
    res.json({
      success: true,
      data: transformedData
    });
  } catch (err) {
    console.error('Error updating order:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Attributes endpoints
app.get('/api/attributes', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('attributes')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch attributes',
        error: error.message
      });
    }
    
    // Transform snake_case to camelCase
    const transformedData = transformObject(data || []);
    
    res.json({
      success: true,
      data: transformedData
    });
  } catch (err) {
    console.error('Error fetching attributes:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Allergens endpoints
app.get('/api/allergens', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('allergens')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch allergens',
        error: error.message
      });
    }
    
    // Transform snake_case to camelCase
    const transformedData = transformObject(data || []);
    
    res.json({
      success: true,
      data: transformedData
    });
  } catch (err) {
    console.error('Error fetching allergens:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Users endpoints
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, property_id, created_at, updated_at')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch users',
        error: error.message
      });
    }
    
    res.json({
      success: true,
      data: (data || []).map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        propertyId: user.property_id,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }))
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// ========================================
// API TOKEN MANAGEMENT FOR TABLET APPS
// ========================================

// Generate a secure API token
const generateApiToken = () => {
  const prefix = 'tb_'; // tablet token prefix
  const randomBytes = crypto.randomBytes(32).toString('hex');
  return prefix + randomBytes;
};

// Generate API token for tablet app
app.post('/api/tokens/generate', authenticateToken, async (req, res) => {
  try {
    const { name, restaurantId, propertyId, expiresInDays } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Token name is required'
      });
    }
    
    const token = generateApiToken();
    const expiresAt = expiresInDays 
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
      : null; // No expiration if not specified
    
    const { data: apiToken, error } = await supabase
      .from('api_tokens')
      .insert({
        name: name || 'Tablet App Token',
        token: token,
        restaurant_id: restaurantId || null,
        property_id: propertyId || req.user.propertyId || null,
        is_active: true,
        expires_at: expiresAt,
        created_by: req.user.id
      })
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate API token',
        error: error.message
      });
    }
    
    const transformedData = transformObject(apiToken);
    
    res.status(201).json({
      success: true,
      data: {
        ...transformedData,
        message: '⚠️ IMPORTANT: Save this token now. It will not be shown again!'
      }
    });
  } catch (error) {
    console.error('Error generating API token:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate API token'
    });
  }
});

// List all API tokens
app.get('/api/tokens', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('api_tokens')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch API tokens',
        error: error.message
      });
    }
    
    const tokens = (data || []).map(token => {
      const transformed = transformObject(token);
      return {
        ...transformed,
        // Don't expose the actual token for security
        tokenPreview: token.token ? (token.token.substring(0, 12) + '...' + token.token.substring(token.token.length - 4)) : 'N/A'
      };
    });
    
    res.json({
      success: true,
      data: tokens
    });
  } catch (err) {
    console.error('Error fetching API tokens:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Revoke/Deactivate API token
app.patch('/api/tokens/:id/revoke', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: token, error } = await supabase
      .from('api_tokens')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single();
    
    if (error || !token) {
      return res.status(404).json({
        success: false,
        message: 'API token not found'
      });
    }
    
    const transformedData = transformObject(token);
    
    res.json({
      success: true,
      message: 'API token revoked successfully',
      data: transformedData
    });
  } catch (err) {
    console.error('Error revoking API token:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Reactivate API token
app.patch('/api/tokens/:id/activate', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: token, error } = await supabase
      .from('api_tokens')
      .update({ is_active: true })
      .eq('id', id)
      .select()
      .single();
    
    if (error || !token) {
      return res.status(404).json({
        success: false,
        message: 'API token not found'
      });
    }
    
    const transformedData = transformObject(token);
    
    res.json({
      success: true,
      message: 'API token activated successfully',
      data: transformedData
    });
  } catch (err) {
    console.error('Error activating API token:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete API token
app.delete('/api/tokens/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('api_tokens')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Supabase error:', error);
      return res.status(404).json({
        success: false,
        message: 'API token not found',
        error: error.message
      });
    }
    
    res.json({
      success: true,
      message: 'API token deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting API token:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Verify API token (for tablet app to test)
app.get('/api/tokens/verify', authenticateApiToken, (req, res) => {
  const transformedToken = transformObject(req.apiToken);
  res.json({
    success: true,
    message: 'API token is valid',
    data: {
      tokenId: transformedToken.id,
      name: transformedToken.name,
      restaurantId: transformedToken.restaurantId,
      propertyId: transformedToken.propertyId,
      isActive: transformedToken.isActive,
      expiresAt: transformedToken.expiresAt
    }
  });
});

// WebSocket connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

// 404 handler - must be last middleware (no path means it matches all unmatched routes)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Start server (skip if running on Vercel)
if (!isVercel) {
  server.listen(PORT, () => {
    // #region agent log
    try { fs.appendFileSync('/Users/kaushik/Desktop/F&Bportal 181225/smartler-f-b-menu-management/.cursor/debug.log', JSON.stringify({location:'server.js:1972',message:'Server started successfully',data:{PORT,NODE_ENV},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'}) + '\n'); } catch(e) {}
    // #endregion
    console.log(`\n🚀 Backend server running on port ${PORT}`);
    console.log(`📦 Environment: ${NODE_ENV}`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
    console.log(`🌐 WebSocket URL: ws://localhost:${PORT}`);
    
    if (NODE_ENV === 'production') {
      console.log(`✅ Production mode enabled`);
      console.log(`🔒 CORS Origins: ${allowedOrigins.join(', ')}`);
      console.log(`🔐 JWT Secret: ${JWT_SECRET ? '✅ Set' : '❌ NOT SET'}`);
    } else {
      console.log(`🔧 Development mode - CORS allows all localhost origins`);
    }
    
    console.log(`\n📱 Tablet App API Endpoints:`);
    console.log(`   GET  /api/restaurants`);
    console.log(`   GET  /api/categories?restaurantId=:id`);
    console.log(`   GET  /api/menu-items?categoryId=:id`);
    console.log(`   GET  /api/public/menu/:restaurantId`);
    console.log(`   GET  /api/orders`);
    console.log(`   POST /api/orders`);
    console.log(`   PATCH /api/orders/:id/status`);
    console.log(`\n🔑 Authentication: Use API Token in Authorization header`);
    console.log(`   Format: Authorization: Bearer <api_token>\n`);
  });
} else {
  console.log('🚀 Running on Vercel - Serverless mode');
}

export { app, server, io };
