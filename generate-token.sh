#!/bin/bash

# Script to generate API token for tablet app

echo "🔑 Generating API Token for Tablet App"
echo ""

# Step 1: Login
echo "Step 1: Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}')

JWT_TOKEN=$(echo $LOGIN_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['token'])" 2>/dev/null)

if [ -z "$JWT_TOKEN" ]; then
  echo "❌ Failed to login. Make sure the server is running."
  exit 1
fi

echo "✅ Login successful"
echo ""

# Step 2: Generate API token
echo "Step 2: Generating API token..."
TOKEN_NAME="${1:-Tablet App Token}"
RESTAURANT_ID="${2:-rest-123}"

TOKEN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/tokens/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d "{
    \"name\": \"$TOKEN_NAME\",
    \"restaurantId\": \"$RESTAURANT_ID\",
    \"expiresInDays\": 365
  }")

echo "$TOKEN_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$TOKEN_RESPONSE"
echo ""

# Extract token
API_TOKEN=$(echo $TOKEN_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['token'])" 2>/dev/null)

if [ ! -z "$API_TOKEN" ]; then
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "✅ API TOKEN GENERATED SUCCESSFULLY!"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "📱 Token for Tablet App:"
  echo "$API_TOKEN"
  echo ""
  echo "⚠️  IMPORTANT: Save this token now! It won't be shown again."
  echo ""
  echo "📋 Usage in tablet app:"
  echo "   Authorization: Bearer $API_TOKEN"
  echo ""
  echo "🧪 Test the token:"
  echo "   curl -X GET http://localhost:3001/api/tokens/verify \\"
  echo "     -H \"Authorization: Bearer $API_TOKEN\""
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
fi


