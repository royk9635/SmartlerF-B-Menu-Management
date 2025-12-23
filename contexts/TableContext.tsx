import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TableContextType {
  restaurantId: string | null;
  tableNumber: number | null;
  setRestaurantId: (id: string | null) => void;
  setTableNumber: (num: number | null) => void;
}

const TableContext = createContext<TableContextType | undefined>(undefined);

export const useTableContext = () => {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error('useTableContext must be used within TableContextProvider');
  }
  return context;
};

interface TableContextProviderProps {
  children: ReactNode;
}

export const TableContextProvider: React.FC<TableContextProviderProps> = ({ children }) => {
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [tableNumber, setTableNumber] = useState<number | null>(null);

  // Parse URL parameters on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlRestaurantId = urlParams.get('restaurantId');
    const urlTable = urlParams.get('table') || urlParams.get('tableNumber');
    
    if (urlRestaurantId) {
      setRestaurantId(urlRestaurantId);
    }
    
    if (urlTable) {
      const parsedTable = parseInt(urlTable, 10);
      if (!isNaN(parsedTable) && parsedTable > 0) {
        setTableNumber(parsedTable);
      }
    }
  }, []);

  return (
    <TableContext.Provider
      value={{
        restaurantId,
        tableNumber,
        setRestaurantId,
        setTableNumber,
      }}
    >
      {children}
    </TableContext.Provider>
  );
};

