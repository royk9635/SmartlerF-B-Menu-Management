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

// Create a separate client for auth operations (uses anon key for proper session handling)
// The service role key doesn't return sessions properly for signInWithPassword
const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
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
      'http://localhost:5175',
      'http://localhost:5000'
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
    
    // In production, allow all Vercel deployment URLs
    // Vercel deployments use pattern: https://project-name-*.vercel.app
    // This is safe because frontend and backend are on the same domain
    if (origin.includes('vercel.app')) {
      return callback(null, true);
    }
    
    // Check against allowed origins
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`⚠️  CORS blocked origin: ${origin}`);
      console.warn(`   Allowed origins: ${allowedOrigins.join(', ')}`);
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

// Note: Periodic cleanup job removed
// Staff now remain active even when they have no table assignments
// This ensures staff can always verify their PIN in the tablet app
// Staff status can only be changed manually by admins in the portal

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
    console.warn(`[Auth] No token provided for ${req.method} ${req.path}`);
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  // First, try Supabase Auth token (EASIEST - no JWT secret needed!)
  // Use supabaseAuth (anon key) for validating user tokens
  try {
    const { data: { user: authUser }, error: authError } = await supabaseAuth.auth.getUser(token);
    
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
      } else {
        console.warn(`[Auth] Supabase user found but not in users table: ${authUser.id}`);
      }
    } else if (authError) {
      // Log Supabase auth error for debugging (but don't fail yet, try other methods)
      console.warn(`[Auth] Supabase auth failed for ${req.method} ${req.path}: ${authError.message}`);
      console.warn(`[Auth] Token preview: ${token.substring(0, 20)}...`);
    }
  } catch (supabaseError) {
    // Not a Supabase token, try JWT
    console.debug(`[Auth] Supabase token check error: ${supabaseError.message}`);
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
          console.warn(`[Auth] API token expired: ${apiToken.id}`);
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
      } else if (error && error.code !== 'PGRST116') {
        // PGRST116 is "not found" which is expected, other errors are real issues
        console.error(`[Auth] Error checking API token: ${error.message}`);
      }
    } catch (dbErr) {
      console.error('[Auth] Error checking API token:', dbErr);
    }
    
    // Neither JWT nor API token is valid
    console.warn(`[Auth] Invalid token for ${req.method} ${req.path} - token preview: ${token.substring(0, 10)}...`);
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid or expired token. Please log in again.',
      hint: 'The authentication token provided is not valid. This may happen if the token has expired or the session has ended.'
    });
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

// Rate limiting for PIN verification (in-memory, simple implementation)
const pinAttempts = new Map(); // IP -> { count, resetTime }

const rateLimitPinVerification = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;

  const attempts = pinAttempts.get(ip);
  
  if (attempts) {
    if (now < attempts.resetTime) {
      if (attempts.count >= maxAttempts) {
        return res.status(429).json({
          success: false,
          error: 'Too many PIN verification attempts. Please try again later.',
          code: 'RATE_LIMIT_EXCEEDED'
        });
      }
      attempts.count++;
    } else {
      // Reset window
      pinAttempts.set(ip, { count: 1, resetTime: now + windowMs });
    }
  } else {
    pinAttempts.set(ip, { count: 1, resetTime: now + windowMs });
  }

  next();
};

// Middleware to validate staff JWT tokens (from tablet app)
const authenticateStaffToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Invalid or missing authentication token',
      code: 'UNAUTHORIZED'
    });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Validate token structure
    if (!decoded.staffId || !decoded.restaurantId) {
      return res.status(403).json({ 
        success: false, 
        error: 'Invalid token structure',
        code: 'INVALID_TOKEN'
      });
    }

    // Verify staff exists and is active
    const { data: staff, error } = await supabase
      .from('staff')
      .select('id, name, role, restaurant_id, is_active')
      .eq('id', decoded.staffId)
      .single();

    if (error || !staff) {
      return res.status(404).json({ 
        success: false, 
        error: 'Staff member not found',
        code: 'STAFF_NOT_FOUND'
      });
    }

    if (!staff.is_active) {
      return res.status(403).json({ 
        success: false, 
        error: 'Staff member is inactive',
        code: 'STAFF_INACTIVE'
      });
    }

    if (staff.restaurant_id !== decoded.restaurantId) {
      return res.status(403).json({ 
        success: false, 
        error: 'Restaurant mismatch',
        code: 'RESTAURANT_MISMATCH'
      });
    }

    // Attach staff info to request
    req.staff = {
      id: staff.id,
      name: staff.name,
      role: staff.role,
      restaurantId: staff.restaurant_id
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        error: 'Token has expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    return res.status(403).json({ 
      success: false, 
      error: 'Invalid token',
      code: 'INVALID_TOKEN'
    });
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
    // Use supabaseAuth (anon key) for auth operations to get proper session
    const { data: authData, error: authError } = await supabaseAuth.auth.signInWithPassword({
      email,
      password
    });
    
    if (authError || !authData.user) {
      console.error('Supabase auth error:', authError);
      return res.status(401).json({
        success: false,
        message: authError?.message || 'Invalid credentials'
      });
    }
    
    // Check if session exists
    if (!authData.session || !authData.session.access_token) {
      console.error('No session or access token returned from Supabase Auth');
      return res.status(500).json({
        success: false,
        message: 'Authentication failed: No session token received'
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
      const { data: newUser, error: createError } = await supabase
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
      
      if (createError || !newUser) {
        console.error('Error creating user profile:', createError);
        return res.status(500).json({
          success: false,
          message: 'Failed to create user profile',
          error: createError?.message || 'Unknown error'
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
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
      // Check if propertyId is a valid UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      if (uuidRegex.test(propertyId)) {
        // It's a UUID, use it directly
        query = query.eq('property_id', propertyId);
      } else {
        // It's not a UUID, treat it as tenant_id and look up the property first
        const { data: property, error: propertyError } = await supabase
          .from('properties')
          .select('id')
          .eq('tenant_id', propertyId)
          .single();
        
        if (propertyError || !property) {
          // If property not found, return empty array instead of 404
          // This allows the request to succeed even if property doesn't exist
          console.warn(`Property not found with tenant_id: ${propertyId}, returning empty restaurants list`);
          return res.json({
            success: true,
            data: []
          });
        }
        
        // Use the property's UUID to filter restaurants
        query = query.eq('property_id', property.id);
      }
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

// Categories endpoints handler
const handleGetCategories = async (req, res) => {
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
};

// Alias endpoint for backward compatibility (tablet app might use this)
app.get('/api/menu/categories', authenticateToken, handleGetCategories);

app.get('/api/categories', authenticateToken, handleGetCategories);

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

// Attribute validation helper function for structured attributes
const validateAttributes = (attributes) => {
  if (!attributes || typeof attributes !== 'object') return null;
  
  const validated = {};
  
  // Nutrition data (numbers >= 0)
  const nutritionFields = ['protein', 'carbs', 'fats', 'fiber', 'sugar', 'sodium'];
  nutritionFields.forEach(field => {
    if (attributes[field] !== undefined) {
      const value = parseFloat(attributes[field]);
      if (!isNaN(value) && value >= 0) {
        validated[field] = value;
      }
    }
  });
  
  // Boolean nutrition flags
  if (attributes.glutenFree !== undefined) validated.glutenFree = Boolean(attributes.glutenFree);
  if (attributes.dairyFree !== undefined) validated.dairyFree = Boolean(attributes.dairyFree);
  
  // Ingredients array
  if (attributes.ingredients && Array.isArray(attributes.ingredients)) {
    validated.ingredients = attributes.ingredients.filter(i => typeof i === 'string');
  }
  
  // Sourcing object
  if (attributes.sourcing && typeof attributes.sourcing === 'object') {
    const sourcing = {};
    if (attributes.sourcing.origin && typeof attributes.sourcing.origin === 'string') {
      sourcing.origin = attributes.sourcing.origin;
    }
    if (['Local', 'Organic', 'Fair Trade', 'Imported'].includes(attributes.sourcing.type)) {
      sourcing.type = attributes.sourcing.type;
    }
    if (Object.keys(sourcing).length > 0) validated.sourcing = sourcing;
  }
  
  // Sustainability array
  if (attributes.sustainability && Array.isArray(attributes.sustainability)) {
    validated.sustainability = attributes.sustainability.filter(s => typeof s === 'string');
  }
  
  // Recipe object
  if (attributes.recipe && typeof attributes.recipe === 'object') {
    const recipe = {};
    if (attributes.recipe.steps && Array.isArray(attributes.recipe.steps)) {
      recipe.steps = attributes.recipe.steps.filter(s => typeof s === 'string');
    }
    if (attributes.recipe.ingredients && Array.isArray(attributes.recipe.ingredients)) {
      recipe.ingredients = attributes.recipe.ingredients.filter(i => typeof i === 'string');
    }
    if (attributes.recipe.chefNotes && typeof attributes.recipe.chefNotes === 'string') {
      recipe.chefNotes = attributes.recipe.chefNotes;
    }
    if (Object.keys(recipe).length > 0) validated.recipe = recipe;
  }
  
  // Sensory type
  if (['hot', 'cold', 'crispy', 'smooth', 'spicy'].includes(attributes.sensoryType)) {
    validated.sensoryType = attributes.sensoryType;
  }
  
  return Object.keys(validated).length > 0 ? validated : null;
};

// Menu items endpoints handler
const handleGetMenuItems = async (req, res) => {
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
};

// Alias endpoint for backward compatibility (tablet app might use this)
app.get('/api/menu/items', authenticateToken, handleGetMenuItems);

app.get('/api/menu-items', authenticateToken, handleGetMenuItems);

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
      attributes: validateAttributes(attributes) || null,
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
    if (req.body.attributes !== undefined) {
      // Handle attributes - can be object, null, or empty object
      if (req.body.attributes === null || (typeof req.body.attributes === 'object' && Object.keys(req.body.attributes).length === 0)) {
        updateData.attributes = null;
      } else if (typeof req.body.attributes === 'object') {
        // Validate structured attributes
        updateData.attributes = validateAttributes(req.body.attributes);
      } else if (typeof req.body.attributes === 'string') {
        // If it's a string (comma-separated), parse it (backward compatibility)
        const attributeNames = String(req.body.attributes).split(',').map(a => a.trim()).filter(Boolean);
        const attributesObj = {};
        attributeNames.forEach(attrName => {
          attributesObj[attrName] = true;
        });
        updateData.attributes = Object.keys(attributesObj).length > 0 ? attributesObj : null;
      } else {
        updateData.attributes = null;
      }
    }
    
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
// Public menu endpoint - supports both /api/public/menu?restaurantId=xxx and /api/public/menu/:restaurantId
app.get('/api/public/menu', async (req, res) => {
  try {
    const { restaurantId } = req.query;
    
    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: 'restaurantId is required as query parameter'
      });
    }
    
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

// Public menu endpoint with restaurantId in path (alternative format for backward compatibility)
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
    const { restaurantId, tableNumber, items, customerName, customerPhone, customerEmail, notes, paymentId, paymentStatus, paymentMethod, paymentDate } = req.body;
    
    // Validate required fields
    if (!restaurantId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: restaurantId and items are required'
      });
    }
    
    // Validate restaurantId is a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(restaurantId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid restaurantId format. restaurantId must be a valid UUID.',
        error: `Received: "${restaurantId}". Expected format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
      });
    }
    
    // Verify restaurant exists in database
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id')
      .eq('id', restaurantId)
      .single();
    
    if (restaurantError || !restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found',
        error: `Restaurant with ID "${restaurantId}" does not exist in the database`
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
      placed_at: new Date().toISOString(),
      payment_id: paymentId || null,
      payment_status: paymentStatus || null,
      payment_method: paymentMethod || null,
      payment_date: paymentDate || null
    };
    
    // Save order to database
    const { data: order, error } = await supabase
      .from('live_orders')
      .insert(orderData)
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error creating order:', error);
      
      // Handle specific error cases
      if (error.code === '22P02') {
        return res.status(400).json({
          success: false,
          message: 'Invalid UUID format in request data',
          error: error.message,
          hint: 'Please ensure all IDs (restaurantId, menuItemId, etc.) are valid UUIDs'
        });
      }
      
      if (error.code === '23503') {
        return res.status(400).json({
          success: false,
          message: 'Foreign key constraint violation',
          error: error.message,
          hint: 'One or more referenced IDs (restaurantId, menuItemId) do not exist in the database'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Failed to create order',
        error: error.message,
        code: error.code || 'UNKNOWN_ERROR'
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

// ============================================
// SERVICE REQUESTS ENDPOINTS
// ============================================

// POST /api/service-requests - Create service request (public, for tablet app)
app.post('/api/service-requests', async (req, res) => {
  try {
    const { tableNumber, requestType, message, restaurantId } = req.body;
    
    // Validation
    if (!tableNumber || typeof tableNumber !== 'number' || tableNumber <= 0) {
      return res.status(400).json({
        success: false,
        message: 'tableNumber is required and must be a positive integer'
      });
    }
    
    const allowedTypes = ['waiter', 'water', 'bill', 'assistance', 'other'];
    if (!requestType || !allowedTypes.includes(requestType)) {
      return res.status(400).json({
        success: false,
        message: `requestType is required and must be one of: ${allowedTypes.join(', ')}`
      });
    }
    
    if (requestType === 'other' && (!message || message.trim().length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'message is required when requestType is "other"'
      });
    }
    
    // Validate restaurantId if provided
    let validRestaurantId = null;
    if (restaurantId) {
      // Check if it's a valid UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(restaurantId)) {
        // If not a UUID, try to look it up as tenant_id
        const { data: property } = await supabase
          .from('properties')
          .select('id')
          .eq('tenant_id', restaurantId)
          .single();
        
        if (!property) {
          return res.status(400).json({
            success: false,
            message: 'Invalid restaurantId'
          });
        }
        
        // Get restaurant by property_id
        const { data: restaurant } = await supabase
          .from('restaurants')
          .select('id')
          .eq('property_id', property.id)
          .limit(1)
          .single();
        
        if (restaurant) {
          validRestaurantId = restaurant.id;
        }
      } else {
        // Validate restaurant exists
        const { data: restaurant } = await supabase
          .from('restaurants')
          .select('id')
          .eq('id', restaurantId)
          .single();
        
        if (!restaurant) {
          return res.status(400).json({
            success: false,
            message: 'Restaurant not found'
          });
        }
        
        validRestaurantId = restaurantId;
      }
    }
    
    // Create service request
    const requestData = {
      restaurant_id: validRestaurantId,
      table_number: tableNumber,
      request_type: requestType,
      message: message || null,
      status: 'pending'
    };
    
    const { data: serviceRequest, error } = await supabase
      .from('service_requests')
      .insert(requestData)
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error creating service request:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create service request',
        error: error.message
      });
    }
    
    // Emit WebSocket event for real-time updates
    if (io) {
      io.emit('service_request_created', {
        type: 'service_request_created',
        data: {
          requestId: serviceRequest.id,
          restaurantId: serviceRequest.restaurant_id,
          tableNumber: serviceRequest.table_number,
          requestType: serviceRequest.request_type,
          status: serviceRequest.status,
          timestamp: serviceRequest.created_at
        },
        timestamp: new Date().toISOString()
      });
    }
    
    // Transform snake_case to camelCase for response
    const transformedData = transformObject(serviceRequest);
    
    res.status(201).json({
      success: true,
      data: transformedData,
      message: 'Service request created successfully'
    });
  } catch (err) {
    console.error('Error creating service request:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message
    });
  }
});

// POST /api/public/service-requests - Alternative public endpoint (same as /api/service-requests)
app.post('/api/public/service-requests', async (req, res) => {
  try {
    const { tableNumber, requestType, message, restaurantId } = req.body;
    
    // Validation
    if (!tableNumber || typeof tableNumber !== 'number' || tableNumber <= 0) {
      return res.status(400).json({
        success: false,
        message: 'tableNumber is required and must be a positive integer'
      });
    }
    
    const allowedTypes = ['waiter', 'water', 'bill', 'assistance', 'other'];
    if (!requestType || !allowedTypes.includes(requestType)) {
      return res.status(400).json({
        success: false,
        message: `requestType is required and must be one of: ${allowedTypes.join(', ')}`
      });
    }
    
    if (requestType === 'other' && (!message || message.trim().length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'message is required when requestType is "other"'
      });
    }
    
    // Validate restaurantId if provided
    let validRestaurantId = null;
    if (restaurantId) {
      // Check if it's a valid UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(restaurantId)) {
        // If not a UUID, try to look it up as tenant_id
        const { data: property } = await supabase
          .from('properties')
          .select('id')
          .eq('tenant_id', restaurantId)
          .single();
        
        if (!property) {
          return res.status(400).json({
            success: false,
            message: 'Invalid restaurantId'
          });
        }
        
        // Get restaurant by property_id
        const { data: restaurant } = await supabase
          .from('restaurants')
          .select('id')
          .eq('property_id', property.id)
          .limit(1)
          .single();
        
        if (restaurant) {
          validRestaurantId = restaurant.id;
        }
      } else {
        // Validate restaurant exists
        const { data: restaurant } = await supabase
          .from('restaurants')
          .select('id')
          .eq('id', restaurantId)
          .single();
        
        if (!restaurant) {
          return res.status(400).json({
            success: false,
            message: 'Restaurant not found'
          });
        }
        
        validRestaurantId = restaurantId;
      }
    }
    
    // Create service request
    const requestData = {
      restaurant_id: validRestaurantId,
      table_number: tableNumber,
      request_type: requestType,
      message: message || null,
      status: 'pending'
    };
    
    const { data: serviceRequest, error } = await supabase
      .from('service_requests')
      .insert(requestData)
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error creating service request:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create service request',
        error: error.message
      });
    }
    
    // Emit WebSocket event for real-time updates
    if (io) {
      io.emit('service_request_created', {
        type: 'service_request_created',
        data: {
          requestId: serviceRequest.id,
          restaurantId: serviceRequest.restaurant_id,
          tableNumber: serviceRequest.table_number,
          requestType: serviceRequest.request_type,
          status: serviceRequest.status,
          timestamp: serviceRequest.created_at
        },
        timestamp: new Date().toISOString()
      });
    }
    
    // Transform snake_case to camelCase for response
    const transformedData = transformObject(serviceRequest);
    
    res.status(201).json({
      success: true,
      data: transformedData,
      message: 'Service request created successfully'
    });
  } catch (err) {
    console.error('Error creating service request:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message
    });
  }
});

// GET /api/service-requests - Get service requests (authenticated, for staff)
app.get('/api/service-requests', authenticateToken, async (req, res) => {
  try {
    const { restaurantId, status, tableNumber } = req.query;
    
    let query = supabase
      .from('service_requests')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Apply filters
    if (restaurantId) {
      // Handle both UUID and tenant_id
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(restaurantId)) {
        query = query.eq('restaurant_id', restaurantId);
      } else {
        // Look up property by tenant_id, then get restaurants
        const { data: property } = await supabase
          .from('properties')
          .select('id')
          .eq('tenant_id', restaurantId)
          .single();
        
        if (property) {
          const { data: restaurants } = await supabase
            .from('restaurants')
            .select('id')
            .eq('property_id', property.id);
          
          if (restaurants && restaurants.length > 0) {
            const restaurantIds = restaurants.map(r => r.id);
            query = query.in('restaurant_id', restaurantIds);
          } else {
            // No restaurants found, return empty array
            return res.json({
              success: true,
              data: []
            });
          }
        } else {
          // Property not found, return empty array
          return res.json({
            success: true,
            data: []
          });
        }
      }
    }
    // If no restaurantId filter is provided, return ALL requests (including those with null restaurant_id)
    
    if (status) {
      const allowedStatuses = ['pending', 'acknowledged', 'completed'];
      if (allowedStatuses.includes(status)) {
        query = query.eq('status', status);
      }
    }
    
    if (tableNumber) {
      const tableNum = parseInt(tableNumber);
      if (!isNaN(tableNum)) {
        query = query.eq('table_number', tableNum);
      }
    }
    
    const { data: serviceRequests, error } = await query;
    
    if (error) {
      console.error('Supabase error fetching service requests:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch service requests',
        error: error.message
      });
    }
    
    // Transform snake_case to camelCase for response
    const transformedData = (serviceRequests || []).map(transformObject);
    
    res.json({
      success: true,
      data: transformedData
    });
  } catch (err) {
    console.error('Error fetching service requests:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message
    });
  }
});

// PATCH /api/service-requests/:id/acknowledge - Acknowledge service request
app.patch('/api/service-requests/:id/acknowledge', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?.user_id; // Get current user ID from token
    
    // Update service request
    const updateData = {
      status: 'acknowledged',
      acknowledged_at: new Date().toISOString(),
      staff_member_id: userId || null
    };
    
    const { data: serviceRequest, error } = await supabase
      .from('service_requests')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error || !serviceRequest) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found'
      });
    }
    
    // Emit WebSocket event
    if (io) {
      io.emit('service_request_acknowledged', {
        type: 'service_request_acknowledged',
        data: {
          requestId: serviceRequest.id,
          restaurantId: serviceRequest.restaurant_id,
          tableNumber: serviceRequest.table_number,
          requestType: serviceRequest.request_type,
          status: serviceRequest.status,
          timestamp: serviceRequest.acknowledged_at
        },
        timestamp: new Date().toISOString()
      });
    }
    
    // Transform snake_case to camelCase for response
    const transformedData = transformObject(serviceRequest);
    
    res.json({
      success: true,
      data: transformedData,
      message: 'Service request acknowledged'
    });
  } catch (err) {
    console.error('Error acknowledging service request:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message
    });
  }
});

// PATCH /api/service-requests/:id/complete - Complete service request
app.patch('/api/service-requests/:id/complete', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Update service request
    const updateData = {
      status: 'completed',
      completed_at: new Date().toISOString()
    };
    
    const { data: serviceRequest, error } = await supabase
      .from('service_requests')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error || !serviceRequest) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found'
      });
    }
    
    // Emit WebSocket event
    if (io) {
      io.emit('service_request_completed', {
        type: 'service_request_completed',
        data: {
          requestId: serviceRequest.id,
          restaurantId: serviceRequest.restaurant_id,
          tableNumber: serviceRequest.table_number,
          requestType: serviceRequest.request_type,
          status: serviceRequest.status,
          timestamp: serviceRequest.completed_at
        },
        timestamp: new Date().toISOString()
      });
    }
    
    // Transform snake_case to camelCase for response
    const transformedData = transformObject(serviceRequest);
    
    res.json({
      success: true,
      data: transformedData,
      message: 'Service request completed'
    });
  } catch (err) {
    console.error('Error completing service request:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message
    });
  }
});

// ============================================
// STAFF TRACKING ENDPOINTS
// ============================================

// POST /api/staff/verify-pin - Verify staff PIN (public endpoint)
app.post('/api/staff/verify-pin', rateLimitPinVerification, async (req, res) => {
  try {
    const { pin, restaurantId } = req.body;
    
    // Validate PIN format
    if (!pin || typeof pin !== 'string' || !/^\d{4}$/.test(pin)) {
      return res.status(400).json({
        success: false,
        error: 'PIN must be exactly 4 digits',
        code: 'VALIDATION_ERROR'
      });
    }
    
    // Build query
    let query = supabase
      .from('staff')
      .select('id, name, role, restaurant_id, is_active, created_at, updated_at')
      .eq('pin', pin);
    
    // If restaurantId provided, filter by it
    if (restaurantId) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(restaurantId)) {
        query = query.eq('restaurant_id', restaurantId);
      } else {
        // Try to look up as tenant_id
        const { data: property } = await supabase
          .from('properties')
          .select('id')
          .eq('tenant_id', restaurantId)
          .single();
        
        if (property) {
          const { data: restaurants } = await supabase
            .from('restaurants')
            .select('id')
            .eq('property_id', property.id);
          
          if (restaurants && restaurants.length > 0) {
            const restaurantIds = restaurants.map(r => r.id);
            query = query.in('restaurant_id', restaurantIds);
          } else {
            return res.status(404).json({
              success: false,
              error: 'Staff member not found',
              code: 'STAFF_NOT_FOUND'
            });
          }
        } else {
          return res.status(404).json({
            success: false,
            error: 'Staff member not found',
            code: 'STAFF_NOT_FOUND'
          });
        }
      }
    }
    
    const { data: staff, error } = await query.maybeSingle();
    
    if (error) {
      console.error('Supabase error verifying PIN:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
    
    if (!staff) {
      // Log failed attempt
      console.warn(`[PIN Verification] Failed PIN attempt from IP: ${req.ip || 'unknown'}`);
      return res.status(401).json({
        success: false,
        error: 'Invalid PIN',
        code: 'INVALID_PIN'
      });
    }
    
    if (!staff.is_active) {
      return res.status(403).json({
        success: false,
        error: 'Staff member is inactive',
        code: 'STAFF_INACTIVE'
      });
    }
    
    // Reset rate limiting on successful verification
    const ip = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
    pinAttempts.delete(ip);
    
    // Return staff details (without PIN)
    const transformedData = transformObject(staff);
    
    res.json({
      success: true,
      data: transformedData,
      message: 'PIN verified successfully'
    });
  } catch (err) {
    console.error('Error verifying PIN:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

// POST /api/staff/assign-table - Assign staff to table
app.post('/api/staff/assign-table', authenticateStaffToken, async (req, res) => {
  try {
    const { staffId, staffName, tableNumber, restaurantId } = req.body;
    
    // Validation
    if (!staffId || !staffName || !tableNumber || !restaurantId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: staffId, staffName, tableNumber, restaurantId',
        code: 'VALIDATION_ERROR'
      });
    }
    
    // Validate tableNumber
    const tableNum = parseInt(tableNumber);
    if (isNaN(tableNum) || tableNum < 1 || tableNum > 100) {
      return res.status(400).json({
        success: false,
        error: 'tableNumber must be between 1 and 100',
        code: 'INVALID_TABLE_NUMBER'
      });
    }
    
    // Verify staffId matches authenticated staff
    if (req.staff.id !== staffId) {
      return res.status(403).json({
        success: false,
        error: 'Staff ID does not match authenticated user',
        code: 'FORBIDDEN'
      });
    }
    
    // Verify restaurantId matches
    if (req.staff.restaurantId !== restaurantId) {
      return res.status(403).json({
        success: false,
        error: 'Restaurant mismatch',
        code: 'RESTAURANT_MISMATCH'
      });
    }
    
    // Find existing active assignment for this table
    const { data: existingAssignment } = await supabase
      .from('staff_assignments')
      .select('id')
      .eq('table_number', tableNum)
      .eq('restaurant_id', restaurantId)
      .eq('is_active', true)
      .maybeSingle();
    
    // Deactivate existing assignment if found
    if (existingAssignment) {
      await supabase
        .from('staff_assignments')
        .update({
          is_active: false,
          unassigned_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingAssignment.id);
    }
    
    // Create new assignment
    const assignmentData = {
      staff_id: staffId,
      table_number: tableNum,
      restaurant_id: restaurantId,
      is_active: true
    };
    
    const { data: assignment, error } = await supabase
      .from('staff_assignments')
      .insert(assignmentData)
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error creating assignment:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create assignment',
        code: 'INTERNAL_ERROR'
      });
    }
    
    // Auto-activate staff when they assign themselves to a table
    await supabase
      .from('staff')
      .update({ is_active: true, updated_at: new Date().toISOString() })
      .eq('id', staffId);
    
    // Emit WebSocket event
    if (io) {
      io.emit('staff_assigned', {
        type: 'staff_assigned',
        data: {
          assignmentId: assignment.id,
          staffId: staffId,
          staffName: staffName,
          tableNumber: tableNum,
          restaurantId: restaurantId,
          timestamp: assignment.assigned_at
        },
        timestamp: new Date().toISOString()
      });
    }
    
    // Transform snake_case to camelCase
    const transformedData = transformObject(assignment);
    
    res.status(201).json({
      success: true,
      data: transformedData,
      message: 'Staff assigned to table successfully'
    });
  } catch (err) {
    console.error('Error assigning staff to table:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

// GET /api/staff/assignments - Get staff assignments
// Supports both authenticated (portal) and unauthenticated (tablet app) calls
app.get('/api/staff/assignments', async (req, res) => {
  try {
    const { tableNumber, restaurantId, staffId, activeOnly } = req.query;
    
    // Try to authenticate (optional for portal users)
    let user = null;
    try {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const { data: { user: authUser }, error: authError } = await supabaseAuth.auth.getUser(token);
        if (!authError && authUser) {
          // Get user details from users table
          const { data: userData } = await supabase
            .from('users')
            .select('id, name, email, role, property_id')
            .eq('id', authUser.id)
            .single();
          if (userData) {
            user = {
              id: userData.id,
              role: userData.role,
              propertyId: userData.property_id
            };
          }
        }
      }
    } catch (authErr) {
      // Authentication failed, continue without user (for tablet app compatibility)
    }
    
    // Handle restaurantId
    let validRestaurantIds = [];
    
    if (restaurantId) {
      // Handle restaurantId (UUID or tenant_id)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      if (uuidRegex.test(restaurantId)) {
        validRestaurantIds = [restaurantId];
      } else {
        // Look up as tenant_id
        const { data: property } = await supabase
          .from('properties')
          .select('id')
          .eq('tenant_id', restaurantId)
          .single();
        
        if (property) {
          const { data: restaurants } = await supabase
            .from('restaurants')
            .select('id')
            .eq('property_id', property.id);
          
          if (restaurants && restaurants.length > 0) {
            validRestaurantIds = restaurants.map(r => r.id);
          } else {
            return res.json({
              success: true,
              data: tableNumber ? null : []
            });
          }
        } else {
          return res.json({
            success: true,
            data: tableNumber ? null : []
          });
        }
      }
    } else {
      // No restaurantId provided
      if (user) {
        // Authenticated portal user - fetch assignments for all accessible restaurants
        if (user.role === 'SuperAdmin') {
          // SuperAdmin can see all restaurants
          const { data: allRestaurants } = await supabase
            .from('restaurants')
            .select('id');
          if (allRestaurants && allRestaurants.length > 0) {
            validRestaurantIds = allRestaurants.map(r => r.id);
          } else {
            return res.json({
              success: true,
              data: []
            });
          }
        } else if (user.propertyId) {
          // Admin/Manager - fetch restaurants for their property
          const { data: restaurants } = await supabase
            .from('restaurants')
            .select('id')
            .eq('property_id', user.propertyId);
          
          if (restaurants && restaurants.length > 0) {
            validRestaurantIds = restaurants.map(r => r.id);
          } else {
            return res.json({
              success: true,
              data: []
            });
          }
        } else {
          return res.json({
            success: true,
            data: []
          });
        }
      } else {
        // Not authenticated and no restaurantId - return error (for tablet app compatibility)
        return res.status(400).json({
          success: false,
          error: 'restaurantId is required',
          code: 'VALIDATION_ERROR'
        });
      }
    }
    
    // Build query
    let query = supabase
      .from('staff_assignments')
      .select(`
        *,
        staff:staff_id (
          id,
          name,
          role,
          restaurant_id,
          is_active
        )
      `)
      .in('restaurant_id', validRestaurantIds);
    
    // Apply filters
    if (tableNumber) {
      const tableNum = parseInt(tableNumber);
      if (!isNaN(tableNum)) {
        query = query.eq('table_number', tableNum);
      }
    }
    
    if (staffId) {
      query = query.eq('staff_id', staffId);
    }
    
    const activeOnlyFlag = activeOnly === undefined || activeOnly === 'true' || activeOnly === true;
    if (activeOnlyFlag) {
      query = query.eq('is_active', true);
    }
    
    query = query.order('assigned_at', { ascending: false });
    
    const { data: assignments, error } = await query;
    
    if (error) {
      console.error('Supabase error fetching assignments:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch assignments',
        code: 'INTERNAL_ERROR'
      });
    }
    
    // Transform data
    let transformedData;
    if (tableNumber && assignments && assignments.length > 0) {
      // Single assignment
      transformedData = transformObject(assignments[0]);
      // Include staff details
      if (assignments[0].staff) {
        transformedData.staff = transformObject(assignments[0].staff);
      }
    } else if (tableNumber) {
      // No assignment found for single table query
      transformedData = null;
    } else {
      // Multiple assignments
      transformedData = (assignments || []).map(assignment => {
        const transformed = transformObject(assignment);
        if (assignment.staff) {
          transformed.staff = transformObject(assignment.staff);
        }
        return transformed;
      });
    }
    
    res.json({
      success: true,
      data: transformedData
    });
  } catch (err) {
    console.error('Error fetching assignments:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

// POST /api/staff/unassign-table - Unassign staff from table
app.post('/api/staff/unassign-table', authenticateStaffToken, async (req, res) => {
  try {
    const { tableNumber, restaurantId } = req.body;
    
    // Validation
    if (!tableNumber || !restaurantId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: tableNumber, restaurantId',
        code: 'VALIDATION_ERROR'
      });
    }
    
    const tableNum = parseInt(tableNumber);
    if (isNaN(tableNum) || tableNum < 1 || tableNum > 100) {
      return res.status(400).json({
        success: false,
        error: 'tableNumber must be between 1 and 100',
        code: 'INVALID_TABLE_NUMBER'
      });
    }
    
    // Verify restaurantId matches authenticated staff
    if (req.staff.restaurantId !== restaurantId) {
      return res.status(403).json({
        success: false,
        error: 'Restaurant mismatch',
        code: 'RESTAURANT_MISMATCH'
      });
    }
    
    // Find active assignment
    const { data: assignment, error: findError } = await supabase
      .from('staff_assignments')
      .select('*')
      .eq('table_number', tableNum)
      .eq('restaurant_id', restaurantId)
      .eq('is_active', true)
      .maybeSingle();
    
    if (findError) {
      console.error('Supabase error finding assignment:', findError);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'No active assignment found for this table',
        code: 'ASSIGNMENT_NOT_FOUND'
      });
    }
    
    // Deactivate assignment
    const { data: updatedAssignment, error: updateError } = await supabase
      .from('staff_assignments')
      .update({
        is_active: false,
        unassigned_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', assignment.id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Supabase error updating assignment:', updateError);
      return res.status(500).json({
        success: false,
        error: 'Failed to unassign staff',
        code: 'INTERNAL_ERROR'
      });
    }
    
    // Note: Staff remain active even when unassigned from tables
    // This ensures they can always verify their PIN in the tablet app
    
    // Emit WebSocket event
    if (io) {
      io.emit('staff_unassigned', {
        type: 'staff_unassigned',
        data: {
          assignmentId: updatedAssignment.id,
          staffId: assignment.staff_id,
          tableNumber: tableNum,
          restaurantId: restaurantId,
          timestamp: updatedAssignment.unassigned_at
        },
        timestamp: new Date().toISOString()
      });
    }
    
    // Transform snake_case to camelCase
    const transformedData = transformObject(updatedAssignment);
    
    res.json({
      success: true,
      data: transformedData,
      message: 'Staff unassigned from table successfully'
    });
  } catch (err) {
    console.error('Error unassigning staff:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

// ========================================
// STAFF MANAGEMENT (CRUD) - PORTAL
// ========================================

// Get all staff members (filtered by property/restaurant)
app.get('/api/staff', authenticateToken, async (req, res) => {
  try {
    const { propertyId, restaurantId } = req.query;
    
    let query = supabase
      .from('staff')
      .select('id, name, pin, role, restaurant_id, is_active, created_at, updated_at')
      .order('created_at', { ascending: false });
    
    // Filter by restaurant if provided
    if (restaurantId) {
      query = query.eq('restaurant_id', restaurantId);
    }
    
    // Filter by property if provided (need to join with restaurants)
    if (propertyId) {
      const { data: restaurants, error: restaurantsError } = await supabase
        .from('restaurants')
        .select('id')
        .eq('property_id', propertyId);
      
      if (restaurantsError) {
        console.error('Supabase error fetching restaurants:', restaurantsError);
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch restaurants',
          error: restaurantsError.message
        });
      }
      
      const restaurantIds = restaurants.map(r => r.id);
      if (restaurantIds.length > 0) {
        query = query.in('restaurant_id', restaurantIds);
      } else {
        // No restaurants for this property, return empty array
        return res.json({
          success: true,
          data: []
        });
      }
    }
    
    // For Admin/Manager roles, filter by their property
    if (req.user.role !== 'SuperAdmin' && req.user.propertyId) {
      const { data: restaurants, error: restaurantsError } = await supabase
        .from('restaurants')
        .select('id')
        .eq('property_id', req.user.propertyId);
      
      if (restaurantsError) {
        console.error('Supabase error fetching restaurants:', restaurantsError);
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch restaurants',
          error: restaurantsError.message
        });
      }
      
      const restaurantIds = restaurants.map(r => r.id);
      if (restaurantIds.length > 0) {
        query = query.in('restaurant_id', restaurantIds);
      } else {
        return res.json({
          success: true,
          data: []
        });
      }
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch staff',
        error: error.message
      });
    }
    
    // Transform and exclude PIN from response
    const transformedData = (data || []).map(staff => {
      const { pin, ...staffWithoutPin } = transformObject(staff);
      return staffWithoutPin;
    });
    
    res.json({
      success: true,
      data: transformedData
    });
  } catch (err) {
    console.error('Error fetching staff:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new staff member
app.post('/api/staff', authenticateToken, async (req, res) => {
  try {
    const { name, pin, role, restaurantId } = req.body;
    
    // Validation
    if (!name || !pin || !role || !restaurantId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, pin, role, restaurantId',
        code: 'VALIDATION_ERROR'
      });
    }
    
    // Validate PIN format (4 digits)
    if (!/^\d{4}$/.test(pin)) {
      return res.status(400).json({
        success: false,
        error: 'PIN must be exactly 4 digits',
        code: 'INVALID_PIN_FORMAT'
      });
    }
    
    // Validate role
    const validRoles = ['waiter', 'manager', 'server', 'host', 'bartender'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
        code: 'INVALID_ROLE'
      });
    }
    
    // Validate restaurant exists and user has access
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id, property_id')
      .eq('id', restaurantId)
      .single();
    
    if (restaurantError || !restaurant) {
      return res.status(404).json({
        success: false,
        error: 'Restaurant not found',
        code: 'RESTAURANT_NOT_FOUND'
      });
    }
    
    // Check if user has access to this restaurant's property
    if (req.user.role !== 'SuperAdmin' && req.user.propertyId !== restaurant.property_id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this restaurant',
        code: 'ACCESS_DENIED'
      });
    }
    
    // Check if PIN already exists for this restaurant
    const { data: existingStaff, error: checkError } = await supabase
      .from('staff')
      .select('id')
      .eq('pin', pin)
      .eq('restaurant_id', restaurantId)
      .maybeSingle();
    
    if (checkError) {
      console.error('Supabase error checking PIN:', checkError);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
    
    if (existingStaff) {
      return res.status(409).json({
        success: false,
        error: 'PIN already exists for this restaurant',
        code: 'PIN_ALREADY_EXISTS'
      });
    }
    
    // Create staff member
    const { data: newStaff, error: insertError } = await supabase
      .from('staff')
      .insert({
        name,
        pin,
        role,
        restaurant_id: restaurantId,
        is_active: true
      })
      .select('id, name, pin, role, restaurant_id, is_active, created_at, updated_at')
      .single();
    
    if (insertError) {
      console.error('Supabase error creating staff:', insertError);
      return res.status(500).json({
        success: false,
        error: 'Failed to create staff member',
        code: 'INTERNAL_ERROR'
      });
    }
    
    // Transform and exclude PIN from response
    const { pin: _, ...staffWithoutPin } = transformObject(newStaff);
    
    res.status(201).json({
      success: true,
      data: staffWithoutPin,
      message: 'Staff member created successfully'
    });
  } catch (err) {
    console.error('Error creating staff:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Update staff member
app.put('/api/staff/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, pin, role, isActive } = req.body;
    
    // Get existing staff member
    const { data: existingStaff, error: fetchError } = await supabase
      .from('staff')
      .select('id, name, pin, role, restaurant_id, is_active')
      .eq('id', id)
      .single();
    
    if (fetchError || !existingStaff) {
      return res.status(404).json({
        success: false,
        error: 'Staff member not found',
        code: 'STAFF_NOT_FOUND'
      });
    }
    
    // Get restaurant to check property access
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('property_id')
      .eq('id', existingStaff.restaurant_id)
      .single();
    
    if (restaurantError || !restaurant) {
      return res.status(404).json({
        success: false,
        error: 'Restaurant not found',
        code: 'RESTAURANT_NOT_FOUND'
      });
    }
    
    // Check access
    const restaurantPropertyId = restaurant.property_id;
    if (req.user.role !== 'SuperAdmin' && req.user.propertyId !== restaurantPropertyId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }
    
    // Build update object
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (role !== undefined) {
      const validRoles = ['waiter', 'manager', 'server', 'host', 'bartender'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          error: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
          code: 'INVALID_ROLE'
        });
      }
      updateData.role = role;
    }
    if (isActive !== undefined) updateData.is_active = isActive;
    if (pin !== undefined) {
      // Validate PIN format
      if (!/^\d{4}$/.test(pin)) {
        return res.status(400).json({
          success: false,
          error: 'PIN must be exactly 4 digits',
          code: 'INVALID_PIN_FORMAT'
        });
      }
      
      // Check if PIN already exists for this restaurant (excluding current staff)
      const { data: existingPin, error: checkError } = await supabase
        .from('staff')
        .select('id')
        .eq('pin', pin)
        .eq('restaurant_id', existingStaff.restaurant_id)
        .neq('id', id)
        .maybeSingle();
      
      if (checkError) {
        console.error('Supabase error checking PIN:', checkError);
        return res.status(500).json({
          success: false,
          error: 'Internal server error',
          code: 'INTERNAL_ERROR'
        });
      }
      
      if (existingPin) {
        return res.status(409).json({
          success: false,
          error: 'PIN already exists for this restaurant',
          code: 'PIN_ALREADY_EXISTS'
        });
      }
      
      updateData.pin = pin;
    }
    
    updateData.updated_at = new Date().toISOString();
    
    // Update staff member
    const { data: updatedStaff, error: updateError } = await supabase
      .from('staff')
      .update(updateData)
      .eq('id', id)
      .select('id, name, pin, role, restaurant_id, is_active, created_at, updated_at')
      .single();
    
    if (updateError) {
      console.error('Supabase error updating staff:', updateError);
      return res.status(500).json({
        success: false,
        error: 'Failed to update staff member',
        code: 'INTERNAL_ERROR'
      });
    }
    
    // Transform and exclude PIN from response
    const { pin: _, ...staffWithoutPin } = transformObject(updatedStaff);
    
    res.json({
      success: true,
      data: staffWithoutPin,
      message: 'Staff member updated successfully'
    });
  } catch (err) {
    console.error('Error updating staff:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Delete staff member
app.delete('/api/staff/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get existing staff member
    const { data: existingStaff, error: fetchError } = await supabase
      .from('staff')
      .select('id, name, restaurant_id')
      .eq('id', id)
      .single();
    
    if (fetchError || !existingStaff) {
      return res.status(404).json({
        success: false,
        error: 'Staff member not found',
        code: 'STAFF_NOT_FOUND'
      });
    }
    
    // Get restaurant to check property access
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('property_id')
      .eq('id', existingStaff.restaurant_id)
      .single();
    
    if (restaurantError || !restaurant) {
      return res.status(404).json({
        success: false,
        error: 'Restaurant not found',
        code: 'RESTAURANT_NOT_FOUND'
      });
    }
    
    // Check access
    const restaurantPropertyId = restaurant.property_id;
    if (req.user.role !== 'SuperAdmin' && req.user.propertyId !== restaurantPropertyId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }
    
    // Check if staff has active assignments
    const { data: activeAssignments, error: assignmentsError } = await supabase
      .from('staff_assignments')
      .select('id')
      .eq('staff_id', id)
      .eq('is_active', true)
      .limit(1);
    
    if (assignmentsError) {
      console.error('Supabase error checking assignments:', assignmentsError);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
    
    if (activeAssignments && activeAssignments.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete staff member with active table assignments',
        code: 'HAS_ACTIVE_ASSIGNMENTS'
      });
    }
    
    // Delete staff member
    const { error: deleteError } = await supabase
      .from('staff')
      .delete()
      .eq('id', id);
    
    if (deleteError) {
      console.error('Supabase error deleting staff:', deleteError);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete staff member',
        code: 'INTERNAL_ERROR'
      });
    }
    
    res.json({
      success: true,
      message: 'Staff member deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting staff:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Orders endpoints
app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    const { restaurantId, status } = req.query;
    // Explicitly select fields including Order ID, table number, and timestamp (TIMESTAMPTZ)
    let query = supabase
      .from('live_orders')
      .select('id, table_number, placed_at, items, total_amount, restaurant_id, status, payment_id, payment_status, payment_method, payment_date')
      .order('placed_at', { ascending: false });
    
    if (restaurantId) {
      query = query.eq('restaurant_id', restaurantId);
    }
    
    // Filter by status if provided (case-insensitive matching)
    if (status) {
      const statusStr = typeof status === 'string' ? status.trim() : String(status);
      // Map common lowercase status values to database enum values
      const statusMap = {
        'completed': 'Completed',
        'cancelled': 'Cancelled',
        'new': 'New',
        'confirmed': 'Confirmed',
        'preparing': 'Preparing',
        'ready': 'Ready'
      };
      
      // Use mapped value if available, otherwise use the provided value as-is
      const dbStatus = statusMap[statusStr.toLowerCase()] || statusStr;
      query = query.eq('status', dbStatus);
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
    
    // Transform snake_case to camelCase and ensure timestamp is properly formatted
    const transformedData = (data || []).map(order => {
      const transformed = transformObject(order);
      // Ensure timestamp (placed_at -> placedAt) is properly formatted as ISO string
      if (transformed.placedAt) {
        // If it's already a string, ensure it's in ISO format
        transformed.placedAt = new Date(transformed.placedAt).toISOString();
      }
      return transformed;
    });
    
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
    
    // If order is completed, create a sale record for analytics
    if (status === 'Completed') {
      try {
        const saleData = {
          restaurant_id: order.restaurant_id,
          table_number: order.table_number,
          total_amount: order.total_amount,
          sale_date: order.placed_at || new Date().toISOString(),
          items: order.items,
          payment_id: order.payment_id || null,
          payment_status: order.payment_status || null,
          payment_method: order.payment_method || null
        };
        
        const { error: saleError } = await supabase
          .from('sales')
          .insert(saleData);
        
        if (saleError) {
          console.error('Error creating sale record:', saleError);
          // Don't fail the request if sale creation fails, just log it
        } else {
          console.log(`✅ Sale record created for completed order ${id}`);
        }
      } catch (saleErr) {
        console.error('Error creating sale record:', saleErr);
        // Don't fail the request if sale creation fails
      }
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

// Sales endpoints
app.get('/api/sales', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, restaurantId } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate and endDate query parameters are required'
      });
    }
    
    let query = supabase
      .from('sales')
      .select('*')
      .gte('sale_date', startDate)
      .lte('sale_date', endDate)
      .order('sale_date', { ascending: false });
    
    if (restaurantId) {
      query = query.eq('restaurant_id', restaurantId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch sales',
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
    console.error('Error fetching sales:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Analytics endpoint
app.get('/api/analytics', authenticateToken, async (req, res) => {
  try {
    const { restaurantId } = req.query;
    
    // Get sales data for analytics
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    let salesQuery = supabase
      .from('sales')
      .select('*')
      .gte('sale_date', thirtyDaysAgo.toISOString())
      .order('sale_date', { ascending: false });
    
    if (restaurantId) {
      salesQuery = salesQuery.eq('restaurant_id', restaurantId);
    }
    
    const { data: sales, error: salesError } = await salesQuery;
    
    if (salesError) {
      console.error('Supabase error fetching sales:', salesError);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch sales data',
        error: salesError.message
      });
    }
    
    // Calculate analytics
    const totalRevenue = (sales || []).reduce((sum, sale) => sum + parseFloat(sale.total_amount || 0), 0);
    const totalOrders = (sales || []).length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Calculate top items
    const itemCounts = new Map();
    (sales || []).forEach(sale => {
      if (sale.items && Array.isArray(sale.items)) {
        sale.items.forEach((item) => {
          const existing = itemCounts.get(item.menuItemId) || { quantity: 0, revenue: 0, name: item.name || 'Unknown' };
          existing.quantity += item.quantity || 0;
          existing.revenue += (item.price || 0) * (item.quantity || 0);
          existing.name = item.name || existing.name;
          itemCounts.set(item.menuItemId, existing);
        });
      }
    });
    
    const topItems = Array.from(itemCounts.entries())
      .map(([itemId, data]) => ({
        itemId,
        name: data.name,
        quantity: data.quantity,
        revenue: data.revenue
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
    
    // Calculate category breakdown
    const categoryRevenue = new Map();
    // Note: This would require joining with menu_items to get category info
    // For now, we'll return basic structure
    
    res.json({
      success: true,
      data: {
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalOrders,
        averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
        topItems,
        categoryBreakdown: [] // Can be enhanced later with category joins
      }
    });
  } catch (err) {
    console.error('Error fetching analytics:', err);
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

// System-wide menu import endpoint (uses service role key to bypass RLS)
app.post('/api/import/system-menu', authenticateToken, async (req, res) => {
  try {
    const payload = req.body;
    
    if (!payload || !payload.restaurantCategory || !Array.isArray(payload.restaurantCategory)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid import payload. Expected { restaurantCategory: [...], items: [...], condiments: [...] }'
      });
    }

    const stats = {
      restaurantsProcessed: 0,
      restaurantsSkipped: [],
      categoriesCreated: 0,
      subcategoriesCreated: 0,
      itemsCreated: 0,
      itemsUpdated: 0,
      allergensCreated: 0,
      modifierGroupsCreated: 0,
      modifierItemsCreated: 0,
    };

    // Fetch all restaurants
    const { data: restaurants, error: restaurantsError } = await supabase
      .from('restaurants')
      .select('*');
    
    if (restaurantsError) {
      console.error('Error fetching restaurants:', restaurantsError);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch restaurants',
        error: restaurantsError.message
      });
    }

    // Helper to process categories recursively
    const processCategories = async (nodes, restaurantId, parentCategoryId = null) => {
      for (const node of nodes) {
        if (parentCategoryId) {
          // Process as subcategory
          const { data: existingSubcats } = await supabase
            .from('subcategories')
            .select('*')
            .eq('category_id', parentCategoryId)
            .ilike('name', node.name);
          
          let subcat;
          if (existingSubcats && existingSubcats.length > 0) {
            subcat = {
              id: existingSubcats[0].id,
              name: existingSubcats[0].name,
              sortOrder: existingSubcats[0].sort_order,
              categoryId: existingSubcats[0].category_id,
            };
          } else {
            const { data: newSubcat, error: subcatError } = await supabase
              .from('subcategories')
              .insert({
                name: node.name,
                sort_order: node.sortOrder || 0,
                category_id: parentCategoryId
              })
              .select()
              .single();
            
            if (subcatError) {
              console.error('Error creating subcategory:', subcatError);
              continue;
            }
            
            subcat = {
              id: newSubcat.id,
              name: newSubcat.name,
              sortOrder: newSubcat.sort_order,
              categoryId: newSubcat.category_id,
            };
            stats.subcategoriesCreated++;
          }
          
          if (node.categories && node.categories.length > 0) {
            await processCategories(node.categories, restaurantId, subcat.id);
          }
        } else {
          // Process as category
          const { data: existingCats } = await supabase
            .from('menu_categories')
            .select('*')
            .eq('restaurant_id', restaurantId)
            .ilike('name', node.name);
          
          let cat;
          if (existingCats && existingCats.length > 0) {
            cat = {
              id: existingCats[0].id,
              name: existingCats[0].name,
              description: existingCats[0].description || '',
              sortOrder: existingCats[0].sort_order,
              activeFlag: existingCats[0].active_flag,
              restaurantId: existingCats[0].restaurant_id,
            };
          } else {
            const { data: newCat, error: catError } = await supabase
              .from('menu_categories')
              .insert({
                name: node.name,
                description: '',
                sort_order: node.sortOrder || 0,
                active_flag: true,
                restaurant_id: restaurantId
              })
              .select()
              .single();
            
            if (catError) {
              console.error('Error creating category:', catError);
              return res.status(500).json({
                success: false,
                message: `Failed to create category: ${catError.message}`,
                error: catError.message,
                hint: 'This might be due to RLS policies. Ensure the backend is using the service role key.'
              });
            }
            
            cat = {
              id: newCat.id,
              name: newCat.name,
              description: newCat.description || '',
              sortOrder: newCat.sort_order,
              activeFlag: newCat.active_flag,
              restaurantId: newCat.restaurant_id,
            };
            stats.categoriesCreated++;
          }
          
          if (node.categories && node.categories.length > 0) {
            await processCategories(node.categories, restaurantId, cat.id);
          }
        }
      }
    };

    // Process restaurants and their categories
    for (const restCatInfo of payload.restaurantCategory) {
      let restaurant = restaurants.find(r => r.id === restCatInfo.restaurantId) || 
                      restaurants.find(r => r.name.toLowerCase() === restCatInfo.restaurantName.toLowerCase());
      
      if (!restaurant) {
        stats.restaurantsSkipped.push({ id: restCatInfo.restaurantId, name: restCatInfo.restaurantName });
        continue;
      }
      
      stats.restaurantsProcessed++;
      await processCategories(restCatInfo.categories, restaurant.id);
    }

    // Pre-fetch all categories for all restaurants to avoid repeated queries
    const categoryMap = new Map(); // Key: "restaurantId-categoryName", Value: category object
    for (const restaurant of restaurants) {
      const { data: categories } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('restaurant_id', restaurant.id);
      
      if (categories) {
        categories.forEach(cat => {
          categoryMap.set(`${restaurant.id}-${cat.name.toLowerCase()}`, cat);
        });
      }
    }

    // Process modifiers (condiments) and items
    const condimentMap = new Map();
    if (payload.condiments && Array.isArray(payload.condiments)) {
      payload.condiments.forEach(c => condimentMap.set(c.condimentCode, c));
    }
    const processedModifierGroupsCache = new Map(); // Key: "restaurantId-condimentCode", Value: "modifierGroupId"

    // Batch collections for bulk operations
    const itemsToInsert = [];
    const itemsToUpdate = [];
    const modifierGroupLinks = []; // Will be inserted in bulk at the end

    if (payload.items && Array.isArray(payload.items)) {
      for (const item of payload.items) {
        let restaurant = restaurants.find(r => r.id === item.restaurantId) || 
                        restaurants.find(r => r.name.toLowerCase() === item.restaurantName.toLowerCase());
        
        if (!restaurant) continue;

        // Find category using pre-fetched map
        const categoryKey = `${restaurant.id}-${item.category.toLowerCase()}`;
        const categoryData = categoryMap.get(categoryKey);
        
        if (!categoryData) {
          console.warn(`Category not found for item ${item.itemName}: ${item.category}`);
          continue;
        }

        // Process and link modifiers for this item (collect for batch processing)
        const itemModifierGroupIds = [];
        if (item.condimentCodes) {
          const codes = item.condimentCodes.split(',').map(c => c.trim()).filter(Boolean);
          for (const code of codes) {
            const groupKey = `${restaurant.id}-${code}`;

            if (processedModifierGroupsCache.has(groupKey)) {
              const groupId = processedModifierGroupsCache.get(groupKey);
              if (!itemModifierGroupIds.includes(groupId)) {
                itemModifierGroupIds.push(groupId);
              }
              continue;
            }

            const condiment = condimentMap.get(code);
            if (condiment) {
              // Check if modifier group exists (use cache or fetch)
              const { data: existingGroups } = await supabase
                .from('modifier_groups')
                .select('*')
                .eq('restaurant_id', restaurant.id)
                .ilike('name', condiment.condimentName)
                .limit(1);

              let group;
              if (existingGroups && existingGroups.length > 0) {
                group = {
                  id: existingGroups[0].id,
                  name: existingGroups[0].name,
                  restaurantId: existingGroups[0].restaurant_id,
                  minSelection: existingGroups[0].min_selection,
                  maxSelection: existingGroups[0].max_selection,
                };
              } else {
                // Create new modifier group
                const { data: newGroup, error: groupError } = await supabase
                  .from('modifier_groups')
                  .insert({
                    name: condiment.condimentName,
                    restaurant_id: restaurant.id,
                    min_selection: 0,
                    max_selection: 1
                  })
                  .select()
                  .single();
                
                if (groupError) {
                  console.error('Error creating modifier group:', groupError);
                  continue;
                }
                
                group = {
                  id: newGroup.id,
                  name: newGroup.name,
                  restaurantId: newGroup.restaurant_id,
                  minSelection: newGroup.min_selection,
                  maxSelection: newGroup.max_selection,
                };
                stats.modifierGroupsCreated++;

                // Batch insert modifier items
                if (condiment.condimentItems && Array.isArray(condiment.condimentItems) && condiment.condimentItems.length > 0) {
                  const modifierItems = condiment.condimentItems.map(ci => ({
                    name: ci.condimentItemName,
                    price: 0,
                    modifier_group_id: group.id
                  }));
                  
                  const { error: itemsError } = await supabase
                    .from('modifier_items')
                    .insert(modifierItems);
                  
                  if (!itemsError) {
                    stats.modifierItemsCreated += modifierItems.length;
                  } else {
                    console.error('Error batch creating modifier items:', itemsError);
                  }
                }
              }

              if (group) {
                if (!itemModifierGroupIds.includes(group.id)) {
                  itemModifierGroupIds.push(group.id);
                }
                processedModifierGroupsCache.set(groupKey, group.id);
              }
            }
          }
        }

        // Parse attributes - support both structured format and comma-separated string
        let attributes = null;
        if (item.attributes && typeof item.attributes === 'object') {
          // Structured attributes format (nutrition, ingredients, sourcing, recipe, sensory)
          attributes = validateAttributes(item.attributes);
        } else if (item.attributeList) {
          // Backward compatibility: comma-separated string format
          if (typeof item.attributeList === 'string') {
            const attributeNames = item.attributeList.split(',').map(a => a.trim()).filter(Boolean);
            if (attributeNames.length > 0) {
              attributes = {};
              attributeNames.forEach(attrName => {
                attributes[attrName] = true; // Set as boolean true for tag-style attributes
              });
            }
          } else if (typeof item.attributeList === 'object') {
            // If attributeList is an object, validate it as structured attributes
            attributes = validateAttributes(item.attributeList);
          }
        }

        const itemData = {
          name: item.itemName,
          item_code: item.itemCode,
          image_url: item.itemImage || null,
          price: parseFloat(item.itemPrice) || 0,
          category_id: categoryData.id,
          description: item.itemDescription || '',
          sort_order: item.sortOrder || 0,
          availability_flag: true,
          sold_out: false,
          currency: 'INR',
          tenant_id: 'tenant-123',
          bogo: false,
          attributes: attributes
        };

        // Store item data with modifier groups for batch processing
        itemsToInsert.push({
          ...itemData,
          itemModifierGroupIds,
          itemCode: item.itemCode,
          categoryId: categoryData.id
        });
      }

      // Batch process items: first check which exist, then batch insert/update
      if (itemsToInsert.length > 0) {
        // Fetch all existing items in one query
        const itemCodes = itemsToInsert.map(i => i.item_code);
        const categoryIds = [...new Set(itemsToInsert.map(i => i.categoryId))];
        
        const { data: existingItems } = await supabase
          .from('menu_items')
          .select('id, item_code, category_id')
          .in('item_code', itemCodes)
          .in('category_id', categoryIds);

        const existingMap = new Map();
        if (existingItems) {
          existingItems.forEach(ei => {
            existingMap.set(`${ei.item_code}-${ei.category_id}`, ei.id);
          });
        }

        // Separate items into insert and update batches
        const insertBatch = [];
        const updateBatch = [];
        const itemIdMap = new Map(); // Track new item IDs after insert

        for (const itemData of itemsToInsert) {
          const key = `${itemData.item_code}-${itemData.categoryId}`;
          const existingId = existingMap.get(key);
          
          if (existingId) {
            updateBatch.push({
              id: existingId,
              ...itemData,
              itemModifierGroupIds: itemData.itemModifierGroupIds
            });
          } else {
            insertBatch.push(itemData);
          }
        }

        // Batch insert new items
        if (insertBatch.length > 0) {
          const insertData = insertBatch.map(({ itemModifierGroupIds, itemCode, categoryId, ...item }) => {
            // Ensure attributes is properly formatted (null or object, not undefined)
            if (item.attributes === undefined) {
              item.attributes = null;
            }
            return item;
          });
          const { data: newItems, error: insertError } = await supabase
            .from('menu_items')
            .insert(insertData)
            .select('id, item_code, category_id');
          
          if (!insertError && newItems) {
            stats.itemsCreated += newItems.length;
            
            // Map new items for modifier linking
            newItems.forEach((ni, idx) => {
              const originalItem = insertBatch[idx];
              itemIdMap.set(`${ni.item_code}-${ni.category_id}`, {
                id: ni.id,
                modifierGroupIds: originalItem.itemModifierGroupIds
              });
            });
          } else if (insertError) {
            console.error('Error batch inserting items:', insertError);
          }
        }

        // Batch update existing items
        if (updateBatch.length > 0) {
          // Group updates by item to avoid conflicts
          for (const item of updateBatch) {
            const { id, itemModifierGroupIds, itemCode, categoryId, ...updateData } = item;
            // Ensure attributes is properly formatted (null or object, not undefined)
            if (updateData.attributes === undefined) {
              updateData.attributes = null;
            }
            
            const { error: updateError } = await supabase
              .from('menu_items')
              .update(updateData)
              .eq('id', id);
            
            if (!updateError) {
              stats.itemsUpdated++;
              
              // Store modifier links for batch processing
              if (itemModifierGroupIds.length > 0) {
                // Remove existing links first
                await supabase
                  .from('menu_item_modifier_groups')
                  .delete()
                  .eq('menu_item_id', id);
                
                // Add to batch links
                itemModifierGroupIds.forEach(groupId => {
                  modifierGroupLinks.push({
                    menu_item_id: id,
                    modifier_group_id: groupId
                  });
                });
              }
            }
          }
        }

        // Batch insert all modifier group links for new items
        for (const [key, itemInfo] of itemIdMap.entries()) {
          if (itemInfo.modifierGroupIds.length > 0) {
            itemInfo.modifierGroupIds.forEach(groupId => {
              modifierGroupLinks.push({
                menu_item_id: itemInfo.id,
                modifier_group_id: groupId
              });
            });
          }
        }

        // Bulk insert all modifier group links
        if (modifierGroupLinks.length > 0) {
          // Insert in chunks of 100 to avoid payload size limits
          const chunkSize = 100;
          for (let i = 0; i < modifierGroupLinks.length; i += chunkSize) {
            const chunk = modifierGroupLinks.slice(i, i + chunkSize);
            await supabase
              .from('menu_item_modifier_groups')
              .insert(chunk);
          }
        }
      }
    }
    
    res.json({
      success: true,
      data: stats,
      message: 'System menu import completed successfully'
    });
  } catch (err) {
    console.error('Error importing system menu:', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error during import',
      error: err.message
    });
  }
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
