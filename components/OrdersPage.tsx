import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LiveOrder, OrderStatus, Restaurant, Property, User, MenuItem, UserRole } from '../types';
import * as api from '../services/supabaseService';
import { ordersApi } from '../services/apiService';
import { LoadingSpinner } from './LoadingSpinner';
import OrderKanbanBoard from './OrderKanbanBoard';

interface OrdersPageProps {
    showToast: (message: string, type: 'success' | 'error') => void;
    currentUser: User;
}

const OrdersPage: React.FC<OrdersPageProps> = ({ showToast, currentUser }) => {
    const [orders, setOrders] = useState<LiveOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // For filtering
    const [allProperties, setAllProperties] = useState<Property[]>([]);
    const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);
    const [menuItemMap, setMenuItemMap] = useState<Map<string, MenuItem>>(new Map());
    const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
    const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('');
    const isSuperAdmin = currentUser.role === UserRole.SUPERADMIN;

    // Sound notification state
    const [isSoundEnabled, setIsSoundEnabled] = useState(true);
    const notificationSound = useMemo(() => new Audio('https://cdn.freesound.org/previews/415/415764_6093233-lq.mp3'), []);

    const fetchOrders = useCallback(async () => {
        try {
            // Use the real API endpoint instead of mock data
            const newOrders = await ordersApi.getLiveOrders(selectedRestaurantId || undefined);
            setOrders(prevOrders => {
                const newOrderIds = new Set(newOrders.map(o => o.id));
                const prevOrderIds = new Set(prevOrders.map(o => o.id));

                if (newOrders.length > prevOrders.length && newOrders.some(o => !prevOrderIds.has(o.id) && o.status === OrderStatus.NEW)) {
                     if(isSoundEnabled) notificationSound.play().catch(e => console.error("Error playing sound:", e));
                }

                return newOrders;
            });
            setError(null);
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch orders.');
        } finally {
            setLoading(false);
        }
    }, [isSoundEnabled, notificationSound, selectedRestaurantId]);

    useEffect(() => {
        // Fetch initial data for filters and maps
        const fetchInitialData = async () => {
            try {
                const [properties, restaurants, menuItems] = await Promise.all([
                    api.getProperties('tenant-123'),
                    api.getAllRestaurants(),
                    api.getAllMenuItems()
                ]);
                setAllProperties(properties);
                setAllRestaurants(restaurants);
                setMenuItemMap(new Map(menuItems.map(item => [item.id, item])));
                if (!isSuperAdmin && currentUser.propertyId) {
                    setSelectedPropertyId(currentUser.propertyId);
                }
            } catch (err) {
                showToast('Failed to load filter data', 'error');
            }
        };

        fetchInitialData();
        fetchOrders();

        const intervalId = setInterval(fetchOrders, 5000); // Poll every 5 seconds
        return () => clearInterval(intervalId);
    }, [fetchOrders, showToast, isSuperAdmin, currentUser.propertyId]);

    const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
        try {
            // Use the real API endpoint instead of mock data
            const updatedOrder = await ordersApi.updateOrderStatus(orderId, newStatus);
            setOrders(prevOrders => prevOrders.map(o => o.id === orderId ? updatedOrder : o));
            showToast(`Order ${orderId.slice(-6)} moved to ${newStatus}`, 'success');
        } catch (err) {
            console.error('Error updating order status:', err);
            showToast(err instanceof Error ? err.message : 'Failed to update order status', 'error');
        }
    };
    
    const visibleProperties = useMemo(() => isSuperAdmin ? allProperties : allProperties.filter(p => p.id === currentUser.propertyId), [allProperties, currentUser.propertyId, isSuperAdmin]);
    const restaurantsForFilter = useMemo(() => selectedPropertyId ? allRestaurants.filter(r => r.propertyId === selectedPropertyId) : (isSuperAdmin ? [] : allRestaurants.filter(r=>r.propertyId === currentUser.propertyId)), [allRestaurants, selectedPropertyId, currentUser.propertyId, isSuperAdmin]);

    const filteredOrders = useMemo(() => {
        let ordersToFilter = [...orders];
        if (selectedRestaurantId) {
            ordersToFilter = ordersToFilter.filter(o => o.restaurantId === selectedRestaurantId);
        } else if (selectedPropertyId) {
            const restaurantIds = new Set(restaurantsForFilter.map(r => r.id));
            ordersToFilter = ordersToFilter.filter(o => restaurantIds.has(o.restaurantId));
        } else if (!isSuperAdmin) {
            const restaurantIds = new Set(allRestaurants.filter(r => r.propertyId === currentUser.propertyId).map(r => r.id));
            ordersToFilter = ordersToFilter.filter(o => restaurantIds.has(o.restaurantId));
        }
        return ordersToFilter;
    }, [orders, selectedPropertyId, selectedRestaurantId, restaurantsForFilter, allRestaurants, currentUser.propertyId, isSuperAdmin]);

    if (loading) {
        return <div className="flex justify-center items-center h-96"><LoadingSpinner /></div>;
    }

    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    return (
        <div className="h-[calc(100vh-11rem)] flex flex-col">
            <div className="flex-shrink-0 flex justify-between items-center mb-4 flex-wrap gap-4">
                <h1 className="text-3xl font-bold text-slate-800">Live Order Dashboard</h1>
                <div className="flex items-center space-x-2">
                     {isSuperAdmin && (
                        <select
                            value={selectedPropertyId}
                            onChange={e => { setSelectedPropertyId(e.target.value); setSelectedRestaurantId(''); }}
                            className="border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500"
                        >
                            <option value="">All Properties</option>
                            {visibleProperties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                     )}
                     <select
                        value={selectedRestaurantId}
                        onChange={e => setSelectedRestaurantId(e.target.value)}
                        disabled={isSuperAdmin && !selectedPropertyId}
                        className="border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 disabled:bg-slate-50"
                     >
                        <option value="">All Restaurants</option>
                        {restaurantsForFilter.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" checked={isSoundEnabled} onChange={() => setIsSoundEnabled(!isSoundEnabled)} className="h-4 w-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500" />
                        <span className="text-sm font-medium text-slate-700">Sound Alert</span>
                    </label>
                </div>
            </div>
            <OrderKanbanBoard
                orders={filteredOrders}
                menuItemMap={menuItemMap}
                onUpdateStatus={handleUpdateOrderStatus}
            />
        </div>
    );
};

export default OrdersPage;
