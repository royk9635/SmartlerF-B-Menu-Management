# 🚀 Backend Implementation Guides

## 🎯 **Quick Implementation Examples**

### **1. Node.js/Express Backend**

#### **Basic Setup**
```javascript
// server.js
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json());

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Validate credentials (replace with your auth logic)
  if (email === 'admin@example.com' && password === 'password') {
    const token = jwt.sign(
      { id: 'user-123', email, role: 'Superadmin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      data: {
        user: {
          id: 'user-123',
          name: 'Admin User',
          email,
          role: 'Superadmin',
          propertyId: 'prop-123'
        },
        token
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.user.id,
      name: 'Admin User',
      email: req.user.email,
      role: req.user.role,
      propertyId: 'prop-123'
    }
  });
});

// Properties endpoints
app.get('/api/properties', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: [
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
    ]
  });
});

// Public menu endpoint
app.get('/api/public/menu/:restaurantId', (req, res) => {
  const { restaurantId } = req.params;
  
  res.json({
    success: true,
    data: {
      restaurant: {
        id: restaurantId,
        name: 'Main Restaurant',
        cuisine: 'Italian',
        phone: '+1-555-0123',
        address: '123 Main St, City, State'
      },
      categories: [
        {
          id: 'cat-123',
          name: 'Appetizers',
          description: 'Start your meal with our delicious appetizers',
          items: [
            {
              id: 'item-123',
              name: 'Caesar Salad',
              description: 'Fresh romaine lettuce with caesar dressing',
              price: 12.99,
              imageUrl: 'https://example.com/images/caesar-salad.jpg',
              isAvailable: true,
              allergens: ['dairy'],
              attributes: ['healthy', 'fresh']
            }
          ]
        }
      ]
    }
  });
});

// WebSocket connection
io.on('connection', (socket) => {
  console.log('Client connected');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
```

#### **Package.json Dependencies**
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "jsonwebtoken": "^9.0.2",
    "socket.io": "^4.7.2"
  }
}
```

### **2. Python/Flask Backend**

#### **Basic Setup**
```python
# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import jwt
import datetime

app = Flask(__name__)
CORS(app, origins=['http://localhost:5173', 'http://localhost:5174'])
socketio = SocketIO(app, cors_allowed_origins=['http://localhost:5173', 'http://localhost:5174'])

# Configuration
app.config['SECRET_KEY'] = 'your-secret-key'
JWT_SECRET = 'your-jwt-secret'

# Authentication decorator
def token_required(f):
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'success': False, 'message': 'Access token required'}), 401
        
        try:
            token = token.split(' ')[1]  # Remove 'Bearer '
            data = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            request.user = data
        except:
            return jsonify({'success': False, 'message': 'Invalid token'}), 403
        
        return f(*args, **kwargs)
    return decorated

# Routes
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    # Validate credentials (replace with your auth logic)
    if email == 'admin@example.com' and password == 'password':
        token = jwt.encode({
            'id': 'user-123',
            'email': email,
            'role': 'Superadmin',
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, JWT_SECRET, algorithm='HS256')
        
        return jsonify({
            'success': True,
            'data': {
                'user': {
                    'id': 'user-123',
                    'name': 'Admin User',
                    'email': email,
                    'role': 'Superadmin',
                    'propertyId': 'prop-123'
                },
                'token': token
            }
        })
    else:
        return jsonify({
            'success': False,
            'message': 'Invalid credentials'
        }), 401

@app.route('/api/auth/me', methods=['GET'])
@token_required
def get_current_user():
    return jsonify({
        'success': True,
        'data': {
            'id': request.user['id'],
            'name': 'Admin User',
            'email': request.user['email'],
            'role': request.user['role'],
            'propertyId': 'prop-123'
        }
    })

@app.route('/api/properties', methods=['GET'])
@token_required
def get_properties():
    return jsonify({
        'success': True,
        'data': [
            {
                'id': 'prop-123',
                'name': 'Downtown Location',
                'address': '123 Main St, City, State',
                'phone': '+1-555-0123',
                'email': 'downtown@restaurant.com',
                'tenantId': 'tenant-123',
                'createdAt': datetime.datetime.utcnow().isoformat(),
                'updatedAt': datetime.datetime.utcnow().isoformat()
            }
        ]
    })

@app.route('/api/public/menu/<restaurant_id>', methods=['GET'])
def get_public_menu(restaurant_id):
    return jsonify({
        'success': True,
        'data': {
            'restaurant': {
                'id': restaurant_id,
                'name': 'Main Restaurant',
                'cuisine': 'Italian',
                'phone': '+1-555-0123',
                'address': '123 Main St, City, State'
            },
            'categories': [
                {
                    'id': 'cat-123',
                    'name': 'Appetizers',
                    'description': 'Start your meal with our delicious appetizers',
                    'items': [
                        {
                            'id': 'item-123',
                            'name': 'Caesar Salad',
                            'description': 'Fresh romaine lettuce with caesar dressing',
                            'price': 12.99,
                            'imageUrl': 'https://example.com/images/caesar-salad.jpg',
                            'isAvailable': True,
                            'allergens': ['dairy'],
                            'attributes': ['healthy', 'fresh']
                        }
                    ]
                }
            ]
        }
    })

# WebSocket events
@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

if __name__ == '__main__':
    socketio.run(app, port=3001, debug=True)
```

#### **Requirements.txt**
```txt
Flask==2.3.3
Flask-CORS==4.0.0
Flask-SocketIO==5.3.6
PyJWT==2.8.0
```

### **3. PHP/Laravel Backend**

#### **Basic Setup**
```php
// routes/api.php
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\PublicMenuController;

// Authentication routes
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/logout', [AuthController::class, 'logout']);
Route::get('/auth/me', [AuthController::class, 'me'])->middleware('auth:sanctum');

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('properties', PropertyController::class);
    Route::apiResource('restaurants', RestaurantController::class);
    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('menu-items', MenuItemController::class);
    Route::apiResource('users', UserController::class);
});

// Public routes
Route::get('/public/menu/{restaurantId}', [PublicMenuController::class, 'getMenu']);
Route::post('/public/orders', [PublicMenuController::class, 'createOrder']);
```

#### **AuthController.php**
```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        if (Auth::attempt($credentials)) {
            $user = Auth::user();
            $token = $user->createToken('auth-token')->plainTextToken;
            
            return response()->json([
                'success' => true,
                'data' => [
                    'user' => $user,
                    'token' => $token
                ]
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Invalid credentials'
        ], 401);
    }

    public function me(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => $request->user()
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }
}
```

---

## 🔧 **Environment Configuration**

### **Frontend (.env.local)**
```bash
VITE_USE_REAL_API=true
VITE_API_BASE_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001
VITE_NODE_ENV=development
VITE_API_LOGGING=true
```

### **Backend Environment Variables**
```bash
# Node.js
JWT_SECRET=your-jwt-secret
PORT=3001

# Python
SECRET_KEY=your-secret-key
JWT_SECRET=your-jwt-secret

# PHP/Laravel
JWT_SECRET=your-jwt-secret
```

---

## 🧪 **Testing Your Backend**

### **1. Test Basic Connectivity**
```bash
curl http://localhost:3001/api/health
```

### **2. Test Authentication**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password"}'
```

### **3. Test Public Menu**
```bash
curl http://localhost:3001/api/public/menu/rest-123
```

### **4. Test Protected Endpoint**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/properties
```

---

## 🚀 **Quick Start Commands**

### **Node.js/Express**
```bash
npm init -y
npm install express cors jsonwebtoken socket.io
node server.js
```

### **Python/Flask**
```bash
pip install flask flask-cors flask-socketio pyjwt
python app.py
```

### **PHP/Laravel**
```bash
composer create-project laravel/laravel backend
cd backend
php artisan serve --port=3001
```

Choose your preferred backend technology and I can provide more specific implementation details!
