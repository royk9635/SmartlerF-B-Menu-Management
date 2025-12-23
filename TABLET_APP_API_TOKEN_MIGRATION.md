# Tablet App API Token Migration Guide

## Overview

This guide provides step-by-step instructions for migrating the tablet app from Supabase Auth tokens to API tokens. API tokens provide better security, simpler requests, and better separation between portal and tablet app authentication.

---

## Prerequisites

- Access to the portal to generate API tokens
- Knowledge of your tablet app's authentication implementation
- Ability to update API request headers and query parameters

---

## Part 1: Understanding API Tokens

### What are API Tokens?

API tokens are long-lived authentication tokens specifically designed for tablet apps. They:
- Start with `tb_` prefix (e.g., `tb_a1b2c3d4e5f6...`)
- Contain `restaurantId` and/or `propertyId` embedded in the token
- Can be scoped to specific restaurants or properties
- Can be revoked independently without affecting portal users
- Don't expire unless explicitly set (can be set to never expire)

### Benefits of API Tokens

1. **Security**: Tokens are scoped to specific restaurant/property
2. **Simplicity**: No need to send `restaurantId`/`propertyId` in queries
3. **Independence**: Tablet app auth separate from portal auth
4. **Management**: Can revoke tokens without affecting other systems
5. **Long-lived**: Can be set to never expire (unlike Supabase tokens)

---

## Part 2: Getting Your API Token

### Step 1: Login to Portal

1. Open the portal in your browser
2. Login with your admin credentials
3. Navigate to "API Tokens" page

### Step 2: Generate API Token

1. Click "+ Generate New Token" button
2. Fill in the form:
   - **Name**: Descriptive name (e.g., "Tablet App - Restaurant 1")
   - **Property**: Select property (optional, but recommended)
   - **Restaurant**: Select restaurant (optional, but recommended)
   - **Expires in**: 365 days (or leave blank for no expiration)
3. Click "Generate Token"
4. **IMPORTANT**: Copy the token immediately - it starts with `tb_` and won't be shown again!

### Step 3: Verify Token

Test your token to ensure it works:

```bash
curl -H "Authorization: Bearer tb_your_token_here" \
  https://your-api-domain.com/api/tokens/verify
```

Expected response:
```json
{
  "success": true,
  "message": "API token is valid",
  "data": {
    "tokenId": "...",
    "name": "Tablet App - Restaurant 1",
    "restaurantId": "...",
    "propertyId": "...",
    "isActive": true
  }
}
```

---

## Part 3: Implementation Guide

### iOS (Swift) Implementation

#### Step 1: Store API Token Securely

```swift
import Security

class KeychainHelper {
    static func save(_ value: String, forKey key: String) {
        let data = value.data(using: .utf8)!
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecValueData as String: data
        ]
        SecItemDelete(query as CFDictionary)
        SecItemAdd(query as CFDictionary, nil)
    }
    
    static func get(forKey key: String) -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true
        ]
        var result: AnyObject?
        SecItemCopyMatching(query as CFDictionary, &result)
        guard let data = result as? Data else { return nil }
        return String(data: data, encoding: .utf8)
    }
}

// Store token after receiving it
let apiToken = "tb_your_api_token_here"
KeychainHelper.save(apiToken, forKey: "api_token")
```

#### Step 2: Create API Client

```swift
class APIClient {
    static let shared = APIClient()
    private let baseURL = "https://your-api-domain.com/api"
    
    private func getAuthToken() -> String? {
        return KeychainHelper.get(forKey: "api_token")
    }
    
    private func buildHeaders() -> [String: String] {
        var headers: [String: String] = [
            "Content-Type": "application/json",
            "Accept": "application/json"
        ]
        
        if let token = getAuthToken() {
            headers["Authorization"] = "Bearer \(token)"
        }
        
        return headers
    }
    
    func getStaff() async throws -> [Staff] {
        guard let url = URL(string: "\(baseURL)/staff") else {
            throw APIError.invalidURL
        }
        
        var request = URLRequest(url: url)
        for (key, value) in buildHeaders() {
            request.setValue(value, forHTTPHeaderField: key)
        }
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw APIError.invalidResponse
        }
        
        let apiResponse = try JSONDecoder().decode(APIResponse<[Staff]>.self, from: data)
        return apiResponse.success ? apiResponse.data : []
    }
    
    func getMenuItems(categoryId: String) async throws -> [MenuItem] {
        guard let url = URL(string: "\(baseURL)/menu-items?categoryId=\(categoryId)") else {
            throw APIError.invalidURL
        }
        
        var request = URLRequest(url: url)
        for (key, value) in buildHeaders() {
            request.setValue(value, forHTTPHeaderField: key)
        }
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw APIError.invalidResponse
        }
        
        let apiResponse = try JSONDecoder().decode(APIResponse<[MenuItem]>.self, from: data)
        return apiResponse.success ? apiResponse.data : []
    }
}
```

#### Step 3: Remove Supabase Auth Code

```swift
// REMOVE: Supabase Auth initialization
// import Supabase
// let supabase = SupabaseClient(...)

// REMOVE: Supabase login code
// let session = try await supabase.auth.signIn(...)

// KEEP: Only API token authentication
```

---

### Android (Kotlin) Implementation

#### Step 1: Store API Token Securely

```kotlin
import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

class SecureStorage(context: Context) {
    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()
    
    private val sharedPreferences: SharedPreferences = EncryptedSharedPreferences.create(
        context,
        "api_token_prefs",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )
    
    fun saveApiToken(token: String) {
        sharedPreferences.edit().putString("api_token", token).apply()
    }
    
    fun getApiToken(): String? {
        return sharedPreferences.getString("api_token", null)
    }
}
```

#### Step 2: Create API Client

```kotlin
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import com.google.gson.Gson

class APIClient(private val context: Context) {
    private val baseURL = "https://your-api-domain.com/api"
    private val client = OkHttpClient()
    private val gson = Gson()
    private val secureStorage = SecureStorage(context)
    
    private fun getAuthToken(): String? {
        return secureStorage.getApiToken()
    }
    
    private fun buildRequest(url: String): Request.Builder {
        val builder = Request.Builder().url(url)
        
        getAuthToken()?.let { token ->
            builder.addHeader("Authorization", "Bearer $token")
        }
        
        builder.addHeader("Content-Type", "application/json")
        builder.addHeader("Accept", "application/json")
        
        return builder
    }
    
    suspend fun getStaff(): List<Staff> {
        val url = "$baseURL/staff"
        val request = buildRequest(url).build()
        
        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) {
                throw APIException("Failed to fetch staff: ${response.code}")
            }
            
            val apiResponse = gson.fromJson(
                response.body?.string(),
                APIResponse::class.java
            ) as APIResponse<List<Staff>>
            
            return if (apiResponse.success) apiResponse.data else emptyList()
        }
    }
    
    suspend fun getMenuItems(categoryId: String): List<MenuItem> {
        val url = "$baseURL/menu-items?categoryId=$categoryId"
        val request = buildRequest(url).build()
        
        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) {
                throw APIException("Failed to fetch menu items: ${response.code}")
            }
            
            val apiResponse = gson.fromJson(
                response.body?.string(),
                APIResponse::class.java
            ) as APIResponse<List<MenuItem>>
            
            return if (apiResponse.success) apiResponse.data else emptyList()
        }
    }
}
```

#### Step 3: Remove Supabase Auth Code

```kotlin
// REMOVE: Supabase Auth initialization
// import io.github.jan-tennert.supabase.SupabaseClient
// val supabase = SupabaseClient(...)

// REMOVE: Supabase login code
// supabase.auth.signInWith(...)

// KEEP: Only API token authentication
```

---

### React Native Implementation

#### Step 1: Store API Token Securely

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';

// Option 1: Using Keychain (more secure)
async function saveApiToken(token) {
    await Keychain.setGenericPassword('api_token', token);
}

async function getApiToken() {
    const credentials = await Keychain.getGenericPassword();
    return credentials ? credentials.password : null;
}

// Option 2: Using AsyncStorage (less secure, but simpler)
async function saveApiToken(token) {
    await AsyncStorage.setItem('api_token', token);
}

async function getApiToken() {
    return await AsyncStorage.getItem('api_token');
}
```

#### Step 2: Create API Client

```javascript
const API_BASE_URL = 'https://your-api-domain.com/api';

class APIClient {
    async getAuthToken() {
        return await getApiToken();
    }
    
    async buildHeaders() {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        
        const token = await this.getAuthToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return headers;
    }
    
    async getStaff() {
        const url = `${API_BASE_URL}/staff`;
        const headers = await this.buildHeaders();
        
        const response = await fetch(url, {
            method: 'GET',
            headers: headers
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch staff: ${response.status}`);
        }
        
        const apiResponse = await response.json();
        return apiResponse.success ? apiResponse.data : [];
    }
    
    async getMenuItems(categoryId) {
        const url = `${API_BASE_URL}/menu-items?categoryId=${categoryId}`;
        const headers = await this.buildHeaders();
        
        const response = await fetch(url, {
            method: 'GET',
            headers: headers
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch menu items: ${response.status}`);
        }
        
        const apiResponse = await response.json();
        return apiResponse.success ? apiResponse.data : [];
    }
}

export default new APIClient();
```

#### Step 3: Remove Supabase Auth Code

```javascript
// REMOVE: Supabase Auth initialization
// import { createClient } from '@supabase/supabase-js'
// const supabase = createClient(...)

// REMOVE: Supabase login code
// const { data, error } = await supabase.auth.signIn(...)

// KEEP: Only API token authentication
```

---

## Part 4: Changes Required

### What to Remove

1. **Supabase Auth Dependencies**
   - Remove Supabase SDK from dependencies
   - Remove Supabase initialization code
   - Remove Supabase login/logout code

2. **Query Parameters**
   - Remove `restaurantId` from query parameters (embedded in token)
   - Remove `propertyId` from query parameters (embedded in token)

3. **Supabase Token Storage**
   - Remove Supabase session storage
   - Remove Supabase token refresh logic

### What to Add

1. **API Token Storage**
   - Add secure storage for API token
   - Add token retrieval method

2. **API Token Header**
   - Add `Authorization: Bearer <api_token>` header to all requests
   - Ensure header is included in every API call

3. **Error Handling**
   - Handle 401 errors (token invalid/expired)
   - Handle 403 errors (token revoked)
   - Provide user-friendly error messages

---

## Part 5: API Endpoints Reference

All endpoints now work with API tokens. Here are the key endpoints:

### Staff Management

**GET /api/staff**
- No query parameters needed (restaurantId/propertyId from token)
- Returns staff for the restaurant/property in the token

**GET /api/staff/assignments**
- Optional: `tableNumber`, `staffId`, `activeOnly`
- No `restaurantId` needed (from token)

**POST /api/staff/assign-table**
- Body: `{ tableNumber, staffId, restaurantId }`
- `restaurantId` must match token's restaurantId

### Menu Management

**GET /api/menu-items**
- Query: `categoryId` (optional)
- No `restaurantId` needed (from token)

**GET /api/categories**
- Query: `restaurantId` (optional, uses token's restaurantId if not provided)

### Orders

**GET /api/orders**
- No query parameters needed
- Returns orders for token's restaurant

**POST /api/orders**
- Body: Order data
- RestaurantId from token automatically applied

### Service Requests

**GET /api/service-requests**
- Optional: `restaurantId`, `status`, `tableNumber`
- Uses token's restaurantId if not provided

**POST /api/service-requests**
- Body: `{ tableNumber, requestType, message, restaurantId }`
- RestaurantId from token if not provided

---

## Part 6: Error Handling

### Token Errors

**401 Unauthorized**
- Token is missing or invalid
- Action: Prompt user to re-enter token or contact admin

**403 Forbidden**
- Token has been revoked or expired
- Action: Generate new token and update app

**400 Bad Request**
- Request format is invalid
- Action: Check request parameters

### Implementation Example

```swift
// iOS Example
func handleAPIError(_ error: Error, response: HTTPURLResponse?) {
    guard let statusCode = response?.statusCode else { return }
    
    switch statusCode {
    case 401:
        // Token invalid - prompt for new token
        showTokenError("Authentication failed. Please update your API token.")
    case 403:
        // Token revoked/expired - need new token
        showTokenError("Your API token has been revoked. Please contact administrator.")
    case 400:
        // Bad request
        showError("Invalid request. Please check your input.")
    default:
        showError("An error occurred. Please try again.")
    }
}
```

---

## Part 7: Testing Checklist

### Pre-Migration Testing

- [ ] Current app works with Supabase Auth tokens
- [ ] All API endpoints are functional
- [ ] Error handling works correctly

### Migration Testing

- [ ] API token can be stored securely
- [ ] API token can be retrieved
- [ ] All API requests include Authorization header
- [ ] No `restaurantId`/`propertyId` in query parameters
- [ ] All endpoints return correct data
- [ ] Error handling works for invalid tokens
- [ ] Error handling works for revoked tokens

### Post-Migration Testing

- [ ] App works without Supabase dependencies
- [ ] All features function correctly
- [ ] Performance is acceptable
- [ ] No memory leaks from token storage
- [ ] App handles network errors gracefully

---

## Part 8: Rollback Plan

If issues occur, you can rollback:

1. **Keep Supabase Auth code** (commented out) during migration
2. **Feature flag** to switch between Supabase and API tokens
3. **Test thoroughly** before removing Supabase code
4. **Monitor errors** after migration

### Feature Flag Example

```swift
// iOS Example
enum AuthMethod {
    case supabase
    case apiToken
}

class AuthManager {
    static let currentMethod: AuthMethod = .apiToken
    
    func getAuthHeader() -> String? {
        switch Self.currentMethod {
        case .supabase:
            return "Bearer \(supabaseToken)"
        case .apiToken:
            return "Bearer \(apiToken)"
        }
    }
}
```

---

## Part 9: Common Issues and Solutions

### Issue: Token Not Working

**Symptoms**: 401 errors on all requests

**Solutions**:
1. Verify token starts with `tb_`
2. Check token is correctly stored
3. Verify token hasn't been revoked in portal
4. Test token with curl command

### Issue: Wrong Restaurant Data

**Symptoms**: Getting data for wrong restaurant

**Solutions**:
1. Verify token was generated for correct restaurant
2. Check token's restaurantId matches expected restaurant
3. Regenerate token with correct restaurant

### Issue: Token Expired

**Symptoms**: 403 errors, "token expired" message

**Solutions**:
1. Generate new token in portal
2. Update token in app
3. Consider setting token to never expire

---

## Part 10: Best Practices

1. **Security**
   - Store tokens in secure storage (Keychain/EncryptedSharedPreferences)
   - Never hardcode tokens in source code
   - Never log tokens in production
   - Use HTTPS for all API requests

2. **Error Handling**
   - Handle 401/403 errors gracefully
   - Provide clear error messages to users
   - Log errors for debugging (without tokens)

3. **Token Management**
   - Generate separate tokens for each restaurant/property
   - Use descriptive token names
   - Set appropriate expiration dates
   - Revoke tokens when no longer needed

4. **Testing**
   - Test with invalid tokens
   - Test with revoked tokens
   - Test with expired tokens
   - Test network failures

---

## Part 11: Support

If you encounter issues during migration:

1. **Check API Token**: Verify token is valid using `/api/tokens/verify`
2. **Check Logs**: Review backend logs for authentication errors
3. **Test Endpoints**: Use curl/Postman to test endpoints directly
4. **Contact Support**: Reach out to backend team with:
   - Token name/id
   - Error messages
   - Request/response examples

---

## Summary

Migration from Supabase Auth to API tokens involves:

1. **Getting API Token**: Generate in portal
2. **Storing Token**: Use secure storage
3. **Updating Requests**: Add Authorization header, remove query params
4. **Removing Supabase**: Remove Supabase dependencies and code
5. **Testing**: Thoroughly test all endpoints

The migration provides better security, simpler requests, and better separation between portal and tablet app authentication.

