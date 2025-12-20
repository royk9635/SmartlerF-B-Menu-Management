import React from 'react';
import { useWebSocket } from '../hooks/useApi';

// Simple component to show API connection status
export const ApiStatusIndicator: React.FC = () => {
  const { connectionState, isConnected } = useWebSocket();
  const useRealAPI = import.meta.env.VITE_USE_REAL_API === 'true';
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs">
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${useRealAPI ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
          <span className="font-medium">
            API: {useRealAPI ? 'Real' : 'Mock'}
          </span>
        </div>
        
        {useRealAPI && (
          <>
            <div className="text-slate-600">URL: {apiBaseUrl}</div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>WebSocket: {connectionState}</span>
            </div>
          </>
        )}
        
        {!useRealAPI && (
          <div className="text-slate-600">
            Using mock data - Set VITE_USE_REAL_API=true to use real backend
          </div>
        )}
      </div>
    </div>
  );
};
