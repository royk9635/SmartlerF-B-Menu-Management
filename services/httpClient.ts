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
  private getAuthToken(): string | null {
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
      
      // Handle authentication errors - clear potentially invalid token
      if (response.status === 401) {
        console.warn('⚠️ Authentication failed (401), clearing auth token');
        this.clearAuthToken();
      }
      
      throw error;
    }

    return data;
  }

  // Generic request method
  private async request<T>(
    method: string,
    endpoint: string,
    data?: any,
    customHeaders?: Record<string, string>
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
      return await this.handleResponse<T>(response);
    } catch (error) {
      clearTimeout(timeoutId);
      
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
