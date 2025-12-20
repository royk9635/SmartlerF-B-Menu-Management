const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for iPad app
  credentials: false
}));
app.use(express.json());

// Mock data for F&B Portal
let mockData = {
  restaurants: [
    {
      id: 'rest-123',
      name: 'Downtown Bistro',
      cuisine: 'Italian',
      phone: '+1-555-0123',
      email: 'downtown@bistro.com',
      address: '123 Main St, Downtown, City',
      description: 'Authentic Italian cuisine in the heart of downtown',
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
      isActive: true,
      operatingHours: {
        monday: { open: '11:00', close: '22:00' },
        tuesday: { open: '11:00', close: '22:00' },
        wednesday: { open: '11:00', close: '22:00' },
        thursday: { open: '11:00', close: '22:00' },
        friday: { open: '11:00', close: '23:00' },
        saturday: { open: '10:00', close: '23:00' },
        sunday: { open: '10:00', close: '21:00' }
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'rest-456',
      name: 'Garden Cafe',
      cuisine: 'Mediterranean',
      phone: '+1-555-0456',
      email: 'info@gardencafe.com',
      address: '456 Garden Ave, Uptown, City',
      description: 'Fresh Mediterranean dishes in a garden setting',
      imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
      isActive: true,
      operatingHours: {
        monday: { open: '08:00', close: '20:00' },
        tuesday: { open: '08:00', close: '20:00' },
        wednesday: { open: '08:00', close: '20:00' },
        thursday: { open: '08:00', close: '20:00' },
        friday: { open: '08:00', close: '21:00' },
        saturday: { open: '09:00', close: '21:00' },
        sunday: { open: '09:00', close: '19:00' }
      },
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
      imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400'
    },
    {
      id: 'cat-456',
      name: 'Main Courses',
      restaurantId: 'rest-123',
      description: 'Our signature main dishes',
      sortOrder: 2,
      isActive: true,
      imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400'
    },
    {
      id: 'cat-789',
      name: 'Desserts',
      restaurantId: 'rest-123',
      description: 'Sweet endings to your meal',
      sortOrder: 3,
      isActive: true,
      imageUrl: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400'
    },
    {
      id: 'cat-101',
      name: 'Beverages',
      restaurantId: 'rest-123',
      description: 'Refreshing drinks and beverages',
      sortOrder: 4,
      isActive: true,
      imageUrl: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400'
    }
  ],
  menuItems: [
    {
      id: 'item-123',
      name: 'Caesar Salad',
      description: 'Fresh romaine lettuce with house-made caesar dressing, parmesan cheese, and croutons',
      price: 12.99,
      categoryId: 'cat-123',
      restaurantId: 'rest-123',
      imageUrl: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=600',
      isAvailable: true,
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false,
      isSpicy: false,
      allergens: ['dairy', 'gluten'],
      attributes: ['healthy', 'fresh', 'popular'],
      nutritionInfo: {
        calories: 250,
        protein: 8,
        carbs: 15,
        fat: 18,
        fiber: 3
      },
      preparationTime: '10-15 minutes',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'item-456',
      name: 'Margherita Pizza',
      description: 'Classic pizza with San Marzano tomatoes, fresh mozzarella, basil, and extra virgin olive oil',
      price: 16.99,
      categoryId: 'cat-456',
      restaurantId: 'rest-123',
      imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600',
      isAvailable: true,
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false,
      isSpicy: false,
      allergens: ['gluten', 'dairy'],
      attributes: ['classic', 'popular', 'signature'],
      nutritionInfo: {
        calories: 320,
        protein: 12,
        carbs: 35,
        fat: 14,
        fiber: 2
      },
      preparationTime: '15-20 minutes',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'item-789',
      name: 'Tiramisu',
      description: 'Traditional Italian dessert with coffee-soaked ladyfingers and mascarpone cream',
      price: 8.99,
      categoryId: 'cat-789',
      restaurantId: 'rest-123',
      imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600',
      isAvailable: true,
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false,
      isSpicy: false,
      allergens: ['dairy', 'eggs', 'gluten'],
      attributes: ['dessert', 'traditional', 'indulgent'],
      nutritionInfo: {
        calories: 280,
        protein: 6,
        carbs: 25,
        fat: 18,
        fiber: 1
      },
      preparationTime: '5-10 minutes',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'item-101',
      name: 'Fresh Orange Juice',
      description: 'Freshly squeezed orange juice, served chilled',
      price: 4.99,
      categoryId: 'cat-101',
      restaurantId: 'rest-123',
      imageUrl: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=600',
      isAvailable: true,
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: true,
      isSpicy: false,
      allergens: [],
      attributes: ['fresh', 'healthy', 'refreshing'],
      nutritionInfo: {
        calories: 120,
        protein: 2,
        carbs: 28,
        fat: 0,
        fiber: 2
      },
      preparationTime: '2-3 minutes',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  modifiers: [
    {
      id: 'mod-123',
      name: 'Size',
      type: 'single',
      required: true,
      items: [
        { id: 'mod-item-1', name: 'Small', price: 0 },
        { id: 'mod-item-2', name: 'Medium', price: 2.00 },
        { id: 'mod-item-3', name: 'Large', price: 4.00 }
      ]
    },
    {
      id: 'mod-456',
      name: 'Extra Toppings',
      type: 'multiple',
      required: false,
      items: [
        { id: 'mod-item-4', name: 'Extra Cheese', price: 1.50 },
        { id: 'mod-item-5', name: 'Extra Basil', price: 0.50 },
        { id: 'mod-item-6', name: 'Extra Olives', price: 1.00 }
      ]
    }
  ]
};

// Helper function to generate ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'F&B Portal API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ========================================
// RESTAURANT ENDPOINTS FOR IPAD APP
// ========================================

// Get all restaurants
app.get('/api/restaurants', (req, res) => {
  const activeRestaurants = mockData.restaurants.filter(r => r.isActive);
  
  res.json({
    success: true,
    data: activeRestaurants,
    count: activeRestaurants.length
  });
});

// Get restaurant by ID
app.get('/api/restaurants/:id', (req, res) => {
  const restaurant = mockData.restaurants.find(r => r.id === req.params.id && r.isActive);
  
  if (!restaurant) {
    return res.status(404).json({
      success: false,
      message: 'Restaurant not found'
    });
  }
  
  res.json({
    success: true,
    data: restaurant
  });
});

// ========================================
// MENU ENDPOINTS FOR IPAD APP
// ========================================

// Get complete menu for a restaurant
app.get('/api/restaurants/:id/menu', (req, res) => {
  const { id } = req.params;
  
  const restaurant = mockData.restaurants.find(r => r.id === id && r.isActive);
  if (!restaurant) {
    return res.status(404).json({
      success: false,
      message: 'Restaurant not found'
    });
  }
  
  const categories = mockData.categories
    .filter(c => c.restaurantId === id && c.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(category => ({
      ...category,
      items: mockData.menuItems
        .filter(item => item.categoryId === category.id && item.isAvailable)
        .map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          imageUrl: item.imageUrl,
          isAvailable: item.isAvailable,
          isVegetarian: item.isVegetarian,
          isVegan: item.isVegan,
          isGlutenFree: item.isGlutenFree,
          isSpicy: item.isSpicy,
          allergens: item.allergens,
          attributes: item.attributes,
          nutritionInfo: item.nutritionInfo,
          preparationTime: item.preparationTime
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
        address: restaurant.address,
        description: restaurant.description,
        imageUrl: restaurant.imageUrl,
        operatingHours: restaurant.operatingHours
      },
      categories
    }
  });
});

// Get categories for a restaurant
app.get('/api/restaurants/:id/categories', (req, res) => {
  const { id } = req.params;
  
  const categories = mockData.categories
    .filter(c => c.restaurantId === id && c.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  
  res.json({
    success: true,
    data: categories
  });
});

// Get menu items for a specific category
app.get('/api/restaurants/:restaurantId/categories/:categoryId/items', (req, res) => {
  const { restaurantId, categoryId } = req.params;
  
  const items = mockData.menuItems.filter(
    item => item.restaurantId === restaurantId && 
            item.categoryId === categoryId && 
            item.isAvailable
  );
  
  res.json({
    success: true,
    data: items
  });
});

// Get specific menu item
app.get('/api/menu-items/:id', (req, res) => {
  const item = mockData.menuItems.find(i => i.id === req.params.id && i.isAvailable);
  
  if (!item) {
    return res.status(404).json({
      success: false,
      message: 'Menu item not found'
    });
  }
  
  res.json({
    success: true,
    data: item
  });
});

// ========================================
// MODIFIERS ENDPOINTS FOR IPAD APP
// ========================================

// Get modifiers for menu items
app.get('/api/menu-items/:id/modifiers', (req, res) => {
  const { id } = req.params;
  
  const item = mockData.menuItems.find(i => i.id === id);
  if (!item) {
    return res.status(404).json({
      success: false,
      message: 'Menu item not found'
    });
  }
  
  // Return available modifiers for this item
  res.json({
    success: true,
    data: mockData.modifiers
  });
});

// ========================================
// ORDER ENDPOINTS FOR IPAD APP
// ========================================

// Create new order
app.post('/api/orders', (req, res) => {
  const { restaurantId, customerInfo, items, total, notes } = req.body;
  
  // Validate required fields
  if (!restaurantId || !customerInfo || !items || !total) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: restaurantId, customerInfo, items, total'
    });
  }
  
  const newOrder = {
    id: generateId(),
    restaurantId,
    customerInfo,
    items,
    subtotal: total - (total * 0.08), // Assuming 8% tax
    tax: total * 0.08,
    total,
    status: 'pending',
    notes: notes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // In a real app, you'd save this to a database
  // For now, we'll just return the created order
  
  res.status(201).json({
    success: true,
    data: newOrder,
    message: 'Order created successfully'
  });
});

// Get order status
app.get('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  
  // In a real app, you'd fetch from database
  // For demo, return a mock order
  const order = {
    id,
    restaurantId: 'rest-123',
    customerInfo: {
      name: 'John Doe',
      phone: '+1-555-0123',
      email: 'john@example.com'
    },
    items: [
      {
        menuItemId: 'item-123',
        name: 'Caesar Salad',
        quantity: 2,
        price: 12.99,
        modifiers: []
      }
    ],
    subtotal: 25.98,
    tax: 2.08,
    total: 28.06,
    status: 'preparing',
    notes: 'No onions please',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  res.json({
    success: true,
    data: order
  });
});

// ========================================
// SEARCH ENDPOINTS FOR IPAD APP
// ========================================

// Search menu items
app.get('/api/restaurants/:id/search', (req, res) => {
  const { id } = req.params;
  const { q, category, dietary } = req.query;
  
  let items = mockData.menuItems.filter(item => 
    item.restaurantId === id && item.isAvailable
  );
  
  // Filter by search query
  if (q) {
    const query = q.toLowerCase();
    items = items.filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    );
  }
  
  // Filter by category
  if (category) {
    items = items.filter(item => item.categoryId === category);
  }
  
  // Filter by dietary requirements
  if (dietary) {
    switch (dietary) {
      case 'vegetarian':
        items = items.filter(item => item.isVegetarian);
        break;
      case 'vegan':
        items = items.filter(item => item.isVegan);
        break;
      case 'gluten-free':
        items = items.filter(item => item.isGlutenFree);
        break;
    }
  }
  
  res.json({
    success: true,
    data: items,
    count: items.length,
    query: { q, category, dietary }
  });
});

// ========================================
// ERROR HANDLING
// ========================================

// 404 handler - catch all unmatched routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    availableEndpoints: [
      'GET /api/health',
      'GET /api/restaurants',
      'GET /api/restaurants/:id',
      'GET /api/restaurants/:id/menu',
      'GET /api/restaurants/:id/categories',
      'GET /api/restaurants/:restaurantId/categories/:categoryId/items',
      'GET /api/menu-items/:id',
      'GET /api/menu-items/:id/modifiers',
      'POST /api/orders',
      'GET /api/orders/:id',
      'GET /api/restaurants/:id/search'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🍽️  F&B Portal API Server running on port ${PORT}`);
  console.log(`📱 iPad App Integration Ready`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🌐 CORS enabled for all origins`);
  console.log(`\n📋 Available Endpoints:`);
  console.log(`   GET  /api/health`);
  console.log(`   GET  /api/restaurants`);
  console.log(`   GET  /api/restaurants/:id`);
  console.log(`   GET  /api/restaurants/:id/menu`);
  console.log(`   GET  /api/restaurants/:id/categories`);
  console.log(`   GET  /api/restaurants/:restaurantId/categories/:categoryId/items`);
  console.log(`   GET  /api/menu-items/:id`);
  console.log(`   GET  /api/menu-items/:id/modifiers`);
  console.log(`   POST /api/orders`);
  console.log(`   GET  /api/orders/:id`);
  console.log(`   GET  /api/restaurants/:id/search`);
});

module.exports = app;
