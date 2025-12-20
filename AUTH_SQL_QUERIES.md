# 🔐 Authentication SQL Queries

## Database Schema

```sql
-- Users table structure
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL, -- 'Superadmin', 'Property Admin', 'Staff'
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    password_hash TEXT NOT NULL, -- Store hashed passwords (bcrypt/argon2)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ,
    active BOOLEAN DEFAULT TRUE
);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_property_id ON users(property_id);
```

---

## 1. SIGN UP (Register New User)

### SQL Query:
```sql
-- Insert new user with hashed password
INSERT INTO users (name, email, role, property_id, password_hash)
VALUES ($1, $2, $3, $4, $5)
RETURNING id, name, email, role, property_id, created_at;
```

### Parameters:
- `$1`: User's full name (TEXT)
- `$2`: Email address (TEXT, must be unique)
- `$3`: Role (TEXT) - 'Superadmin', 'Property Admin', 'Staff'
- `$4`: Property ID (UUID, nullable for Superadmin)
- `$5`: Password hash (TEXT) - **NEVER store plain passwords!**

### Example (PostgreSQL with Node.js):
```javascript
const bcrypt = require('bcrypt');

async function signUp(name, email, password, role, propertyId = null) {
    // Hash the password (cost factor of 12)
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    const query = `
        INSERT INTO users (name, email, role, property_id, password_hash)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, name, email, role, property_id, created_at;
    `;
    
    const values = [name, email, role, propertyId, passwordHash];
    
    try {
        const result = await db.query(query, values);
        return result.rows[0];
    } catch (error) {
        if (error.code === '23505') { // Unique violation
            throw new Error('Email already exists');
        }
        throw error;
    }
}
```

### Example (Supabase):
```javascript
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function signUp(name, email, password, role, propertyId = null) {
    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);
    
    const { data, error } = await supabase
        .from('users')
        .insert({
            name,
            email,
            role,
            property_id: propertyId,
            password_hash: passwordHash
        })
        .select('id, name, email, role, property_id, created_at')
        .single();
    
    if (error) {
        if (error.code === '23505') {
            throw new Error('Email already registered');
        }
        throw new Error(error.message);
    }
    
    return data;
}
```

---

## 2. SIGN IN (Login)

### SQL Query:
```sql
-- Get user by email
SELECT id, name, email, role, property_id, password_hash, last_login, active
FROM users
WHERE email = $1 AND active = TRUE;
```

### Parameters:
- `$1`: Email address (TEXT)

### Example (PostgreSQL with Node.js):
```javascript
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function signIn(email, password) {
    // 1. Get user by email
    const query = `
        SELECT id, name, email, role, property_id, password_hash, active
        FROM users
        WHERE email = $1 AND active = TRUE;
    `;
    
    const result = await db.query(query, [email]);
    
    if (result.rows.length === 0) {
        throw new Error('Invalid email or password');
    }
    
    const user = result.rows[0];
    
    // 2. Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!passwordMatch) {
        throw new Error('Invalid email or password');
    }
    
    // 3. Update last login
    await db.query(
        'UPDATE users SET last_login = NOW(), updated_at = NOW() WHERE id = $1',
        [user.id]
    );
    
    // 4. Generate JWT token
    const token = jwt.sign(
        {
            userId: user.id,
            email: user.email,
            role: user.role,
            propertyId: user.property_id
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
    
    // 5. Return user data (without password_hash) and token
    const { password_hash, ...userWithoutPassword } = user;
    
    return {
        user: userWithoutPassword,
        token
    };
}
```

### Example (Supabase):
```javascript
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function signIn(email, password) {
    // 1. Get user by email
    const { data: user, error } = await supabase
        .from('users')
        .select('id, name, email, role, property_id, password_hash, active')
        .eq('email', email)
        .eq('active', true)
        .single();
    
    if (error || !user) {
        throw new Error('Invalid email or password');
    }
    
    // 2. Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!passwordMatch) {
        throw new Error('Invalid email or password');
    }
    
    // 3. Update last login
    await supabase
        .from('users')
        .update({ 
            last_login: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
    
    // 4. Generate JWT token
    const token = jwt.sign(
        {
            userId: user.id,
            email: user.email,
            role: user.role,
            propertyId: user.property_id
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
    
    // 5. Return user without password
    const { password_hash, ...userWithoutPassword } = user;
    
    return {
        user: userWithoutPassword,
        token
    };
}
```

---

## 3. GET CURRENT USER (Verify Session)

### SQL Query:
```sql
-- Get user by ID (from JWT token)
SELECT id, name, email, role, property_id, created_at, last_login
FROM users
WHERE id = $1 AND active = TRUE;
```

### Example:
```javascript
async function getCurrentUser(userId) {
    const query = `
        SELECT id, name, email, role, property_id, created_at, last_login
        FROM users
        WHERE id = $1 AND active = TRUE;
    `;
    
    const result = await db.query(query, [userId]);
    
    if (result.rows.length === 0) {
        throw new Error('User not found or inactive');
    }
    
    return result.rows[0];
}
```

---

## 4. PASSWORD RESET

### Request Reset Token:
```sql
-- Store password reset token (create a password_resets table)
CREATE TABLE IF NOT EXISTS password_resets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert reset token
INSERT INTO password_resets (user_id, token, expires_at)
VALUES ($1, $2, NOW() + INTERVAL '1 hour')
RETURNING token, expires_at;
```

### Reset Password:
```sql
-- Verify token and update password
UPDATE users
SET password_hash = $1, updated_at = NOW()
WHERE id = (
    SELECT user_id
    FROM password_resets
    WHERE token = $2
    AND expires_at > NOW()
    AND used = FALSE
)
RETURNING id;

-- Mark token as used
UPDATE password_resets
SET used = TRUE
WHERE token = $2;
```

---

## 5. UPDATE USER PROFILE

```sql
UPDATE users
SET 
    name = $1,
    email = $2,
    updated_at = NOW()
WHERE id = $3
RETURNING id, name, email, role, property_id;
```

---

## 6. CHANGE PASSWORD

```sql
-- Verify old password first, then update
UPDATE users
SET 
    password_hash = $1,
    updated_at = NOW()
WHERE id = $2
RETURNING id;
```

---

## 🔒 Security Best Practices

### 1. **Never Store Plain Passwords**
```javascript
// ❌ BAD - Never do this
INSERT INTO users (email, password) VALUES ('user@example.com', 'password123');

// ✅ GOOD - Always hash passwords
const hashedPassword = await bcrypt.hash('password123', 12);
INSERT INTO users (email, password_hash) VALUES ('user@example.com', hashedPassword);
```

### 2. **Use Prepared Statements** (Prevent SQL Injection)
```javascript
// ❌ BAD - SQL Injection vulnerable
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ GOOD - Use parameterized queries
const query = 'SELECT * FROM users WHERE email = $1';
const result = await db.query(query, [email]);
```

### 3. **Rate Limiting**
```javascript
// Implement rate limiting for login attempts
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes
```

### 4. **JWT Token Security**
```javascript
// Use strong JWT secret (at least 256 bits)
const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '24h',
    algorithm: 'HS256'
});
```

### 5. **HTTPS Only**
- Always use HTTPS in production
- Set secure cookie flags: `httpOnly`, `secure`, `sameSite`

---

## 📊 Complete Backend Example (Express.js)

```javascript
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(express.json());

// Sign Up Endpoint
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, role = 'Staff', propertyId = null } = req.body;
        
        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Name, email and password are required' 
            });
        }
        
        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);
        
        // Insert user
        const result = await pool.query(
            `INSERT INTO users (name, email, role, property_id, password_hash)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, name, email, role, property_id, created_at`,
            [name, email, role, propertyId, passwordHash]
        );
        
        const user = result.rows[0];
        
        // Generate token
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({ 
            success: true, 
            data: { user, token } 
        });
        
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ 
                success: false, 
                message: 'Email already registered' 
            });
        }
        console.error('Sign up error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Registration failed' 
        });
    }
});

// Sign In Endpoint
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Get user
        const result = await pool.query(
            `SELECT id, name, email, role, property_id, password_hash
             FROM users
             WHERE email = $1 AND active = TRUE`,
            [email]
        );
        
        if (result.rows.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }
        
        const user = result.rows[0];
        
        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        
        if (!passwordMatch) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }
        
        // Update last login
        await pool.query(
            'UPDATE users SET last_login = NOW() WHERE id = $1',
            [user.id]
        );
        
        // Generate token
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        // Remove password from response
        const { password_hash, ...userWithoutPassword } = user;
        
        res.json({ 
            success: true, 
            data: { user: userWithoutPassword, token } 
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Login failed' 
        });
    }
});

// Get Current User Endpoint
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, email, role, property_id, created_at, last_login
             FROM users
             WHERE id = $1 AND active = TRUE`,
            [req.user.userId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        res.json({ 
            success: true, 
            data: result.rows[0] 
        });
        
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to get user' 
        });
    }
});

// Authentication Middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
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
                message: 'Invalid or expired token' 
            });
        }
        req.user = user;
        next();
    });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Auth API running on port ${PORT}`);
});
```

---

## 🚀 Quick Setup for Your Database

```sql
-- Run this to set up authentication tables
BEGIN;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'Staff',
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ,
    active BOOLEAN DEFAULT TRUE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_property_id ON users(property_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Create password resets table (optional, for forgot password)
CREATE TABLE IF NOT EXISTS password_resets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);
CREATE INDEX IF NOT EXISTS idx_password_resets_user_id ON password_resets(user_id);

COMMIT;
```

---

**Status:** ✅ Complete SQL queries and backend examples provided
**Security:** ✅ Bcrypt hashing, JWT tokens, prepared statements
**Ready for:** Production deployment
