// WebSocket service for real-time updates
export type WebSocketEventType = 
  | 'order_created' 
  | 'order_updated' 
  | 'menu_item_updated' 
  | 'user_activity'
  | 'system_notification';

export interface WebSocketEvent {
  type: WebSocketEventType;
  data: any;
  timestamp: string;
}

export type WebSocketEventHandler = (event: WebSocketEvent) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private eventHandlers = new Map<WebSocketEventType, WebSocketEventHandler[]>();
  private url: string;
  private isConnecting = false;

  constructor() {
    // Use environment variable or default to localhost
    this.url = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
    
    // Log the WebSocket URL for debugging
    console.log('WebSocket service initialized with URL:', this.url);
  }

  // Check if WebSocket should be enabled
  private shouldConnect(): boolean {
    const useRealAPI = import.meta.env.VITE_USE_REAL_API === 'true';
    const hasValidUrl = this.url && !this.url.includes('localhost') || 
                       (this.url.includes('localhost') && import.meta.env.NODE_ENV === 'development');
    
    return useRealAPI && hasValidUrl;
  }

  // Connect to WebSocket server
  public connect(token?: string): void {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    if (!this.shouldConnect()) {
      console.log('WebSocket connection skipped - not configured for real API or invalid URL');
      return;
    }

    this.isConnecting = true;
    
    try {
      // Add token to WebSocket URL if provided
      const wsUrl = token ? `${this.url}?token=${token}` : this.url;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
      };

      this.ws.onmessage = (event) => {
        try {
          const wsEvent: WebSocketEvent = JSON.parse(event.data);
          this.handleEvent(wsEvent);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnecting = false;
        this.ws = null;
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('A WebSocket connection error occurred. This is often due to the server being unavailable or a cross-origin issue. Event:', error);
        this.isConnecting = false;
        
        // Additional debugging information
        console.error('WebSocket URL:', wsUrl);
        console.error('WebSocket ready state:', this.ws?.readyState);
        console.error('Connection attempts:', this.reconnectAttempts);
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.isConnecting = false;
    }
  }

  // Disconnect from WebSocket server
  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.eventHandlers.clear();
  }

  // Subscribe to WebSocket events
  public on(eventType: WebSocketEventType, handler: WebSocketEventHandler): () => void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    
    this.eventHandlers.get(eventType)!.push(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.eventHandlers.get(eventType);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  // Send message to WebSocket server
  public send(type: string, data: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({ type, data, timestamp: new Date().toISOString() });
      this.ws.send(message);
    } else {
      console.warn('WebSocket is not connected. Message not sent:', { type, data });
    }
  }

  // Handle incoming WebSocket events
  private handleEvent(event: WebSocketEvent): void {
    const handlers = this.eventHandlers.get(event.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error('Error handling WebSocket event:', error);
        }
      });
    }
  }

  // Attempt to reconnect
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('WebSocket max reconnect attempts reached.');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect();
      this.reconnectDelay *= 2; // Exponential backoff
    }, this.reconnectDelay);
  }

  // Get connection status
  public get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  // Get connection state
  public get connectionState(): string {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'connected';
      case WebSocket.CLOSING: return 'closing';
      case WebSocket.CLOSED: return 'closed';
      default: return 'unknown';
    }
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
