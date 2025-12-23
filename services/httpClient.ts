import { API_CONFIG } from '../config/api';

// Types for HTTP client
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

// HTTP Client class
class HttpClient {
  private baseURL: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
    this.defaultHeaders = { ...API_CONFIG.HEADERS };
  }

  // Get auth token from localStorage
  public getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  // Set auth token
  public setAuthToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  // Clear auth token
  public clearAuthToken(): void {
    localStorage.removeItem('auth_token');
  }

  // Get refresh token from localStorage
  public getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  // Set refresh token
  public setRefreshToken(token: string): void {
    localStorage.setItem('refresh_token', token);
  }

  // Clear refresh token
  public clearRefreshToken(): void {
    localStorage.removeItem('refresh_token');
  }

  // Refresh access token using refresh token
  private async refreshAccessToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      if (data.success && data.data?.token && data.data?.refreshToken) {
        this.setAuthToken(data.data.token);
        this.setRefreshToken(data.data.refreshToken);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  // Check if token is expired (for Supabase tokens, we can't decode JWT easily, so we'll rely on 401 errors)
  // This is a placeholder - actual expiration checking would require JWT decoding
  private isTokenExpired(): boolean {
    // For now, we'll rely on 401 errors to detect expiration
    // In a production app, you could decode the JWT and check exp claim
    return false;
  }

  // Build headers with authentication
  private buildHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
    const headers = { ...this.defaultHeaders, ...customHeaders };
    
    const token = this.getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    return headers;
  }

  // Handle API response
  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');
    
    // Check if response has content
    const contentLength = response.headers.get('content-length');
    const hasContent = contentLength !== '0' && contentLength !== null;
    
    let data: any;
    try {
      // Get response text first to check if it's empty
      const text = await response.text();
      
      if (!text || text.trim() === '') {
        throw new Error(`Empty response from server (${response.status} ${response.statusText})`);
      }
      
      if (isJson) {
        data = JSON.parse(text);
      } else {
        data = text;
      }
    } catch (parseError: any) {
      console.error('❌ Failed to parse response:', parseError);
      if (parseError.message && parseError.message.includes('Empty response')) {
        throw parseError;
      }
      throw new Error(`Failed to parse server response: ${parseError.message || 'Invalid JSON'}`);
    }

    if (!response.ok) {
      // Backend may return error message in 'message' or 'error' field
      const errorMessage = data.message || data.error || `HTTP Error: ${response.status}`;
      const error: ApiError = {
        message: errorMessage,
        status: response.status,
        errors: data.errors,
      };
      
      // Handle authentication errors - tokens are cleared in request method if refresh fails
      if (response.status === 401) {
        console.warn('⚠️ Authentication failed (401)');
      }
      
      throw error;
    }

    return data;
  }

  // Generic request method with automatic token refresh on 401
  private async request<T>(
    method: string,
    endpoint: string,
    data?: any,
    customHeaders?: Record<string, string>,
    retryOn401: boolean = true
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = this.buildHeaders(customHeaders);

    const config: RequestInit = {
      method,
      headers,
    };

    // Add body for POST, PUT, PATCH requests
    if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
      if (data instanceof FormData) {
        // Remove Content-Type header for FormData (browser will set it)
        delete headers['Content-Type'];
        config.body = data;
      } else {
        config.body = JSON.stringify(data);
      }
    }

    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    config.signal = controller.signal;

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);
      
      // Handle 401 errors with token refresh
      if (response.status === 401 && retryOn401) {
        const refreshToken = this.getRefreshToken();
        if (refreshToken) {
          // Try to refresh the token
          const refreshed = await this.refreshAccessToken();
          if (refreshed) {
            // Token refreshed successfully, retry the request once
            console.log('🔄 Token refreshed, retrying request');
            return this.request<T>(method, endpoint, data, customHeaders, false);
          }
        }
        
        // Refresh failed or no refresh token - clear tokens and handle as normal 401
        this.clearAuthToken();
        this.clearRefreshToken();
      }
      
      return await this.handleResponse<T>(response);
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      // Handle retry flag from handleResponse
      if (error.shouldRetry && retryOn401) {
        console.log('🔄 Retrying request after token refresh');
        return this.request<T>(method, endpoint, data, customHeaders, false);
      }
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.error(`⏱️ API request to ${url} timed out after ${this.timeout}ms`);
          const timeoutError: ApiError = {
            message: 'Request timeout - server took too long to respond',
            status: 408
          };
          throw timeoutError;
        }
        
        // Handle network errors (CORS, server unavailable, etc.)
        if (error.message === 'Failed to fetch') {
          console.error(`❌ API request to ${url} failed:`, error.message);
          console.error('Possible causes:');
          console.error('1. CORS policy blocking the request');
          console.error('2. Server is not running or unreachable');
          console.error('3. Network connectivity issues');
          console.error('4. Invalid API URL configuration');
          console.error('Current API Base URL:', this.baseURL);
          
          // Create a user-friendly error
          const networkError: ApiError = {
            message: 'Unable to connect to server. Please check your internet connection.',
            status: 0
          };
          throw networkError;
        }
      }
      
      throw error;
    }
  }

  // HTTP Methods
  public async get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>('GET', endpoint, undefined, headers);
  }

  public async post<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>('POST', endpoint, data, headers);
  }

  public async put<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>('PUT', endpoint, data, headers);
  }

  public async patch<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>('PATCH', endpoint, data, headers);
  }

  public async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>('DELETE', endpoint, undefined, headers);
  }

  // File upload method
  public async uploadFile<T>(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    return this.request<T>('POST', endpoint, formData);
  }
}

// Export singleton instance
export const httpClient = new HttpClient();
