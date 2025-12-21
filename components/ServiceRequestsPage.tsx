import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ServiceRequest, ServiceRequestStatus, Restaurant, Property, User, UserRole } from '../types';
import * as api from '../services/supabaseService';
import { serviceRequestsApi } from '../services/apiService';
import { LoadingSpinner } from './LoadingSpinner';
import ServiceRequestCard from './ServiceRequestCard';

interface ServiceRequestsPageProps {
    showToast: (message: string, type: 'success' | 'error') => void;
    currentUser: User;
}

const ServiceRequestsPage: React.FC<ServiceRequestsPageProps> = ({ showToast, currentUser }) => {
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // For filtering
    const [allProperties, setAllProperties] = useState<Property[]>([]);
    const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);
    const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
    const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('');
    const [selectedStatus, setSelectedStatus] = useState<ServiceRequestStatus | 'all'>('all');
    const [tableNumberFilter, setTableNumberFilter] = useState<string>('');
    const isSuperAdmin = currentUser.role === UserRole.SUPERADMIN;

    // Sound notification state
    const [isSoundEnabled, setIsSoundEnabled] = useState(true);
    const notificationSound = useMemo(() => new Audio('https://cdn.freesound.org/previews/415/415764_6093233-lq.mp3'), []);

    const fetchRequests = useCallback(async () => {
        try {
            const params: { restaurantId?: string; status?: ServiceRequestStatus; tableNumber?: number } = {};
            
            if (selectedRestaurantId) {
                params.restaurantId = selectedRestaurantId;
            }
            
            if (selectedStatus !== 'all') {
                params.status = selectedStatus;
            }
            
            if (tableNumberFilter) {
                const tableNum = parseInt(tableNumberFilter);
                if (!isNaN(tableNum)) {
                    params.tableNumber = tableNum;
                }
            }

            const newRequests = await serviceRequestsApi.getAll(params);
            
            setRequests(prevRequests => {
                const newRequestIds = new Set(newRequests.map(r => r.id));
                const prevRequestIds = new Set(prevRequests.map(r => r.id));

                // Play sound for new pending requests
                if (newRequests.length > prevRequests.length && 
                    newRequests.some(r => !prevRequestIds.has(r.id) && r.status === 'pending')) {
                    if (isSoundEnabled) {
                        notificationSound.play().catch(e => console.error("Error playing sound:", e));
                    }
                }

                return newRequests;
            });
            setError(null);
        } catch (err: any) {
            console.error('Error fetching service requests:', err);
            
            if (err?.status === 401) {
                const errorMsg = 'Authentication required. Please log in again.';
                setError(errorMsg);
                showToast(errorMsg, 'error');
            } else {
                setError(err instanceof Error ? err.message : 'Failed to fetch service requests.');
            }
        } finally {
            setLoading(false);
        }
    }, [isSoundEnabled, notificationSound, selectedRestaurantId, selectedStatus, tableNumberFilter, showToast]);

    useEffect(() => {
        // Fetch initial data for filters
        const fetchInitialData = async () => {
            try {
                const [properties, restaurants] = await Promise.all([
                    api.getProperties('tenant-123'),
                    api.getAllRestaurants()
                ]);
                setAllProperties(properties);
                setAllRestaurants(restaurants);
                if (!isSuperAdmin && currentUser.propertyId) {
                    setSelectedPropertyId(currentUser.propertyId);
                }
            } catch (err) {
                showToast('Failed to load filter data', 'error');
            }
        };

        fetchInitialData();
        fetchRequests();

        const intervalId = setInterval(fetchRequests, 5000); // Poll every 5 seconds
        return () => clearInterval(intervalId);
    }, [fetchRequests, showToast, isSuperAdmin, currentUser.propertyId]);

    const handleAcknowledge = async (id: string) => {
        try {
            const updatedRequest = await serviceRequestsApi.acknowledge(id);
            setRequests(prevRequests => prevRequests.map(r => r.id === id ? updatedRequest : r));
            showToast(`Service request acknowledged`, 'success');
        } catch (err) {
            console.error('Error acknowledging service request:', err);
            showToast(err instanceof Error ? err.message : 'Failed to acknowledge service request', 'error');
        }
    };

    const handleComplete = async (id: string) => {
        try {
            const updatedRequest = await serviceRequestsApi.complete(id);
            setRequests(prevRequests => prevRequests.map(r => r.id === id ? updatedRequest : r));
            showToast(`Service request completed`, 'success');
        } catch (err) {
            console.error('Error completing service request:', err);
            showToast(err instanceof Error ? err.message : 'Failed to complete service request', 'error');
        }
    };

    const visibleProperties = useMemo(() => 
        isSuperAdmin ? allProperties : allProperties.filter(p => p.id === currentUser.propertyId), 
        [allProperties, currentUser.propertyId, isSuperAdmin]
    );

    const restaurantsForFilter = useMemo(() => 
        selectedPropertyId 
            ? allRestaurants.filter(r => r.propertyId === selectedPropertyId) 
            : (isSuperAdmin ? [] : allRestaurants.filter(r => r.propertyId === currentUser.propertyId)), 
        [allRestaurants, selectedPropertyId, currentUser.propertyId, isSuperAdmin]
    );

    const filteredRequests = useMemo(() => {
        let requestsToFilter = [...requests];
        
        if (selectedRestaurantId) {
            requestsToFilter = requestsToFilter.filter(r => r.restaurantId === selectedRestaurantId);
        } else if (selectedPropertyId) {
            const restaurantIds = new Set(restaurantsForFilter.map(r => r.id));
            requestsToFilter = requestsToFilter.filter(r => restaurantIds.has(r.restaurantId));
        } else if (!isSuperAdmin) {
            const restaurantIds = new Set(allRestaurants.filter(r => r.propertyId === currentUser.propertyId).map(r => r.id));
            requestsToFilter = requestsToFilter.filter(r => restaurantIds.has(r.restaurantId));
        }
        
        return requestsToFilter;
    }, [requests, selectedPropertyId, selectedRestaurantId, restaurantsForFilter, allRestaurants, currentUser.propertyId, isSuperAdmin]);

    // Group requests by status for kanban view
    const pendingRequests = useMemo(() => 
        filteredRequests.filter(r => r.status === 'pending').sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ), 
        [filteredRequests]
    );

    const acknowledgedRequests = useMemo(() => 
        filteredRequests.filter(r => r.status === 'acknowledged').sort((a, b) => 
            new Date(b.acknowledgedAt || b.createdAt).getTime() - new Date(a.acknowledgedAt || a.createdAt).getTime()
        ), 
        [filteredRequests]
    );

    const completedRequests = useMemo(() => 
        filteredRequests.filter(r => r.status === 'completed').sort((a, b) => 
            new Date(b.completedAt || b.createdAt).getTime() - new Date(a.completedAt || a.createdAt).getTime()
        ), 
        [filteredRequests]
    );

    if (loading) {
        return <div className="flex justify-center items-center h-96"><LoadingSpinner /></div>;
    }

    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    return (
        <div className="h-[calc(100vh-11rem)] flex flex-col">
            <div className="flex-shrink-0 flex justify-between items-center mb-4 flex-wrap gap-4">
                <h1 className="text-3xl font-bold text-slate-800">Service Requests</h1>
                <div className="flex items-center space-x-2">
                    <label className="flex items-center space-x-2 text-sm text-slate-600">
                        <input
                            type="checkbox"
                            checked={isSoundEnabled}
                            onChange={(e) => setIsSoundEnabled(e.target.checked)}
                            className="rounded"
                        />
                        <span>Sound Notifications</span>
                    </label>
                </div>
            </div>

            {/* Filters */}
            <div className="flex-shrink-0 flex flex-wrap gap-4 mb-4 p-4 bg-white rounded-lg shadow-sm">
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
                <select
                    value={selectedStatus}
                    onChange={e => setSelectedStatus(e.target.value as ServiceRequestStatus | 'all')}
                    className="border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500"
                >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="acknowledged">Acknowledged</option>
                    <option value="completed">Completed</option>
                </select>
                <input
                    type="number"
                    placeholder="Table Number"
                    value={tableNumberFilter}
                    onChange={e => setTableNumberFilter(e.target.value)}
                    className="border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500"
                />
                {(selectedPropertyId || selectedRestaurantId || selectedStatus !== 'all' || tableNumberFilter) && (
                    <button
                        onClick={() => {
                            setSelectedPropertyId('');
                            setSelectedRestaurantId('');
                            setSelectedStatus('all');
                            setTableNumberFilter('');
                        }}
                        className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
                    >
                        Clear Filters
                    </button>
                )}
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto">
                <div className="grid grid-cols-3 gap-4 min-w-max h-full">
                    {/* Pending Column */}
                    <div className="flex flex-col bg-slate-50 rounded-lg p-4 min-w-[300px]">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-slate-800">
                                Pending ({pendingRequests.length})
                            </h2>
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                                {pendingRequests.length}
                            </span>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-3">
                            {pendingRequests.length === 0 ? (
                                <div className="text-center text-slate-400 py-8">No pending requests</div>
                            ) : (
                                pendingRequests.map(request => (
                                    <ServiceRequestCard
                                        key={request.id}
                                        request={request}
                                        onAcknowledge={handleAcknowledge}
                                        onComplete={handleComplete}
                                    />
                                ))
                            )}
                        </div>
                    </div>

                    {/* Acknowledged Column */}
                    <div className="flex flex-col bg-slate-50 rounded-lg p-4 min-w-[300px]">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-slate-800">
                                Acknowledged ({acknowledgedRequests.length})
                            </h2>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                {acknowledgedRequests.length}
                            </span>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-3">
                            {acknowledgedRequests.length === 0 ? (
                                <div className="text-center text-slate-400 py-8">No acknowledged requests</div>
                            ) : (
                                acknowledgedRequests.map(request => (
                                    <ServiceRequestCard
                                        key={request.id}
                                        request={request}
                                        onAcknowledge={handleAcknowledge}
                                        onComplete={handleComplete}
                                    />
                                ))
                            )}
                        </div>
                    </div>

                    {/* Completed Column */}
                    <div className="flex flex-col bg-slate-50 rounded-lg p-4 min-w-[300px]">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-slate-800">
                                Completed ({completedRequests.length})
                            </h2>
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                {completedRequests.length}
                            </span>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-3">
                            {completedRequests.length === 0 ? (
                                <div className="text-center text-slate-400 py-8">No completed requests</div>
                            ) : (
                                completedRequests.map(request => (
                                    <ServiceRequestCard
                                        key={request.id}
                                        request={request}
                                        onAcknowledge={handleAcknowledge}
                                        onComplete={handleComplete}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceRequestsPage;

