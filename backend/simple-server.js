const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Test login endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'admin@example.com' && password === 'password') {
    res.json({
      success: true,
      data: {
        user: {
          id: 'user-123',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'Superadmin',
          propertyId: 'prop-123'
        },
        token: 'mock-jwt-token-123'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

// Test public menu endpoint
app.get('/api/public/menu/:restaurantId', (req, res) => {
  const { restaurantId } = req.params;
  
  res.json({
    success: true,
    data: {
      restaurant: {
        id: restaurantId,
        name: 'Test Restaurant',
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
              imageUrl: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400',
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
});
