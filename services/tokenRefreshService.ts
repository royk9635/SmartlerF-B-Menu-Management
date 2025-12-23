import { httpClient } from './httpClient';
import { API_CONFIG } from '../config/api';

// Token refresh service - proactively refreshes tokens before expiration
class TokenRefreshService {
  private refreshInterval: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes
  private readonly REFRESH_BEFORE_EXPIRY = 5 * 60 * 1000; // Refresh 5 minutes before expiry
  private isRefreshing = false;

  // Decode JWT to get expiration time (basic implementation)
  private getTokenExpiration(token: string): number | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = JSON.parse(atob(parts[1]));
      return payload.exp ? payload.exp * 1000 : null; // Convert to milliseconds
    } catch (error) {
      return null;
    }
  }

  // Check if token needs refresh
  private shouldRefreshToken(): boolean {
    const token = httpClient.getAuthToken();
    if (!token) return false;

    const expiration = this.getTokenExpiration(token);
    if (!expiration) {
      // Can't determine expiration (might be Supabase token), refresh proactively
      return true;
    }

    const now = Date.now();
    const timeUntilExpiry = expiration - now;
    
    // Refresh if token expires within REFRESH_BEFORE_EXPIRY
    return timeUntilExpiry <= this.REFRESH_BEFORE_EXPIRY;
  }

  // Refresh token proactively
  private async refreshToken(): Promise<boolean> {
    if (this.isRefreshing) {
      return false; // Already refreshing
    }

    const refreshToken = httpClient.getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    this.isRefreshing = true;

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        console.warn('⚠️ Proactive token refresh failed');
        return false;
      }

      const data = await response.json();
      if (data.success && data.data?.token && data.data?.refreshToken) {
        httpClient.setAuthToken(data.data.token);
        httpClient.setRefreshToken(data.data.refreshToken);
        console.log('✅ Token refreshed proactively');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    } finally {
      this.isRefreshing = false;
    }
  }

  // Start proactive token refresh checking
  public start(): void {
    if (this.refreshInterval) {
      return; // Already started
    }

    console.log('🔄 Starting proactive token refresh service');

    // Check immediately
    this.checkAndRefresh();

    // Then check periodically
    this.refreshInterval = setInterval(() => {
      this.checkAndRefresh();
    }, this.CHECK_INTERVAL);
  }

  // Stop proactive token refresh checking
  public stop(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
      console.log('⏹️ Stopped proactive token refresh service');
    }
  }

  // Check if refresh is needed and refresh if so
  private async checkAndRefresh(): Promise<void> {
    // Only refresh if we have both tokens
    if (!httpClient.getAuthToken() || !httpClient.getRefreshToken()) {
      return;
    }

    if (this.shouldRefreshToken()) {
      await this.refreshToken();
    }
  }
}

// Export singleton instance
export const tokenRefreshService = new TokenRefreshService();

