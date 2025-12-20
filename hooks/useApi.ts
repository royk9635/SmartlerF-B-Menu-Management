import { useState, useEffect, useCallback } from 'react';
import { websocketService, WebSocketEventType, WebSocketEvent } from '../services/websocketService';

// Generic API hook with loading, error, and real-time updates
export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = [],
  websocketEvents: WebSocketEventType[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('API call failed:', err);
    } finally {
      setLoading(false);
    }
  }, dependencies);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // WebSocket event listeners for real-time updates
  useEffect(() => {
    if (websocketEvents.length === 0) return;

    const unsubscribeFunctions: (() => void)[] = [];

    websocketEvents.forEach(eventType => {
      const unsubscribe = websocketService.on(eventType, (event: WebSocketEvent) => {
        // Refetch data when relevant events occur
        fetchData();
      });
      unsubscribeFunctions.push(unsubscribe);
    });

    return () => {
      unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    };
  }, [fetchData, websocketEvents]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    setData, // For optimistic updates
  };
}

// Hook for mutations (create, update, delete)
export function useMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
    onSettled?: (data: TData | undefined, error: Error | null, variables: TVariables) => void;
  }
) {
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (variables: TVariables) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await mutationFn(variables);
      setData(result);
      
      options?.onSuccess?.(result, variables);
      options?.onSettled?.(result, null, variables);
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Mutation failed');
      setError(error);
      
      options?.onError?.(error, variables);
      options?.onSettled?.(undefined, error, variables);
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, [mutationFn, options]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    mutate,
    reset,
  };
}

// Hook for WebSocket connection management
export function useWebSocket(token?: string) {
  const [connectionState, setConnectionState] = useState(websocketService.connectionState);

  useEffect(() => {
    // Connect to WebSocket
    websocketService.connect(token);

    // Monitor connection state
    const interval = setInterval(() => {
      setConnectionState(websocketService.connectionState);
    }, 1000);

    return () => {
      clearInterval(interval);
      // Don't disconnect here as other components might be using it
    };
  }, [token]);

  const subscribe = useCallback((eventType: WebSocketEventType, handler: (event: WebSocketEvent) => void) => {
    return websocketService.on(eventType, handler);
  }, []);

  const send = useCallback((type: string, data: any) => {
    websocketService.send(type, data);
  }, []);

  return {
    connectionState,
    isConnected: websocketService.isConnected,
    subscribe,
    send,
  };
}
