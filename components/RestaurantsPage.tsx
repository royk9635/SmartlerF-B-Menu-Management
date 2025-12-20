import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Restaurant, Property, User, UserRole, SystemImportStats } from '../types';
import * as api from '../services/supabaseService';
import { LoadingSpinner } from './LoadingSpinner';
import ConfirmationModal from './ConfirmationModal';
import RestaurantModal from './RestaurantModal';
import DisplayUrlModal from './DisplayUrlModal';
import { PlusIcon, PencilIcon, TrashIcon, DisplayIcon, PreviewIcon, ServerStackIcon } from './Icons';
import DigitalMenuPreviewModal from './DigitalMenuPreviewModal';
import SystemImportModal from './SystemImportModal';

interface RestaurantsPageProps {
    showToast: (message: string, type: 'success' | 'error') => void;
    currentUser: User;
}

const RestaurantsPage: React.FC<RestaurantsPageProps> = ({ showToast, currentUser }) => {
    const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);
    const [allProperties, setAllProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [filterPropertyId, setFilterPropertyId] = useState<string>('');
    
    const [isModalOpen, setModalOpen] = useState<boolean>(false);
    const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);

    // For display URL modal
    const [isUrlModalOpen, setUrlModalOpen] = useState<boolean>(false);
    const [displayUrl, setDisplayUrl] = useState<string>('');
    
    // For Preview Modal
    const [isPreviewModalOpen, setPreviewModalOpen] = useState<boolean>(false);
    const [previewRestaurantId, setPreviewRestaurantId] = useState<string | null>(null);

    // For System Import Modal
    const [isSystemImportModalOpen, setSystemImportModalOpen] = useState<boolean>(false);
    const [systemImportStats, setSystemImportStats] = useState<SystemImportStats | null>(null);

    const [isConfirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
    const [deleteAction, setDeleteAction] = useState<(() => void) | null>(null);
    const [confirmMessage, setConfirmMessage] = useState<string>('');
    
    const isSuperAdmin = currentUser.role === UserRole.SUPERADMIN;

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [fetchedRestaurants, fetchedProperties] = await Promise.all([
                api.getAllRestaurants(),
                api.getProperties('tenant-123')
            ]);
            setAllRestaurants(fetchedRestaurants);
            setAllProperties(fetchedProperties);
            if (!isSuperAdmin) {
                setFilterPropertyId(currentUser.propertyId || '');
            }
        } catch (error) {
            showToast('Failed to fetch data.', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast, isSuperAdmin, currentUser.propertyId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const propertyMap = useMemo(() => new Map(allProperties.map(p => [p.id, p.name])), [allProperties]);

    const visibleProperties = useMemo(() => {
        if (isSuperAdmin) {
            return allProperties;
        }
        if (!currentUser || !currentUser.propertyId) {
            return [];
        }
        return allProperties.filter(p => p && p.id === currentUser.propertyId);
    }, [allProperties, currentUser, isSuperAdmin]);


    const filteredRestaurants = useMemo(() => {
        if (!filterPropertyId) {
            if (isSuperAdmin) return allRestaurants;
            if (!currentUser || !currentUser.propertyId) return [];
            return allRestaurants.filter(r => r && r.propertyId === currentUser.propertyId);
        }
        return allRestaurants.filter(r => r && r.propertyId === filterPropertyId);
    }, [allRestaurants, filterPropertyId, isSuperAdmin, currentUser]);

    const handleOpenAddModal = () => {
        if (visibleProperties.length === 0) {
            showToast('Please create a property first before adding a restaurant.', 'error');
            return;
        }
        setEditingRestaurant(null);
        setModalOpen(true);
    };

    const handleOpenEditModal = (restaurant: Restaurant) => {
        setEditingRestaurant(restaurant);
        setModalOpen(true);
    };

    const handleSaveRestaurant = async (restaurantData: Omit<Restaurant, 'id'>) => {
        try {
            if (editingRestaurant) {
                await api.updateRestaurant({ ...editingRestaurant, ...restaurantData });
                showToast('Restaurant updated successfully!', 'success');
            } else {
                await api.addRestaurant(restaurantData);
                showToast('Restaurant added successfully!', 'success');
            }
            await fetchData();
            setModalOpen(false);
            setEditingRestaurant(null);
        } catch (error) {
            showToast('Failed to save restaurant.', 'error');
        }
    };

    const handleDeleteRestaurant = (restaurant: Restaurant) => {
        setConfirmMessage(`Are you sure you want to delete "${restaurant.name}"? This will also delete its menu.`);
        setDeleteAction(() => async () => {
            try {
                await api.deleteRestaurant(restaurant.id);
                showToast('Restaurant deleted successfully!', 'success');
                await fetchData();
            } catch (error) {
                showToast('Failed to delete restaurant.', 'error');
            }
        });
        setConfirmModalOpen(true);
    };

    const handleOpenDisplayUrl = (restaurant: Restaurant) => {
        const baseUrl = window.location.origin + window.location.pathname;
        const url = `${baseUrl}?display_restaurant_id=${restaurant.id}`;
        setDisplayUrl(url);
        setUrlModalOpen(true);
    };
    
    const handleOpenPreviewModal = (restaurantId: string) => {
        setPreviewRestaurantId(restaurantId);
        setPreviewModalOpen(true);
    };
    
    const handleSystemImport = async (file: File): Promise<SystemImportStats> => {
        const jsonString = await file.text();
        const stats = await api.importSystemMenuFromJson(jsonString);
        setSystemImportStats(stats);
        showToast('System-wide import completed!', 'success');
        fetchData(); // Refresh data after import
        return stats;
    };


    if (loading) {
        return <div className="flex justify-center items-center h-96"><LoadingSpinner /></div>;
    }

    return (
        <div className="bg-white shadow-md rounded-lg border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <h2 className="text-2xl font-bold text-slate-700">Manage Restaurants</h2>
                <div className="flex items-center space-x-2">
                    {isSuperAdmin && (
                        <>
                            <select
                                value={filterPropertyId}
                                onChange={(e) => setFilterPropertyId(e.target.value)}
                                className="w-full sm:w-48 pl-3 pr-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            >
                                <option value="">All Properties</option>
                                {visibleProperties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                             <button
                                onClick={() => { setSystemImportStats(null); setSystemImportModalOpen(true); }}
                                className="flex items-center bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-sky-700 transition duration-300"
                                title="Import a menu for multiple restaurants at once"
                            >
                                <ServerStackIcon className="h-5 w-5 mr-2" />
                                System Import
                            </button>
                        </>
                    )}
                    <button
                        onClick={handleOpenAddModal}
                        className="flex items-center bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-primary-700 transition duration-300"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Add Restaurant
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600">Name</th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600">Property</th>
                            <th className="text-center py-3 px-4 uppercase font-semibold text-sm text-slate-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-slate-700">
                        {filteredRestaurants.map(rest => (
                            <tr key={rest.id} className="border-b border-slate-200 hover:bg-slate-50">
                                <td className="py-3 px-4 font-medium">{rest.name}</td>
                                <td className="py-3 px-4 text-slate-600">{propertyMap.get(rest.propertyId) || 'N/A'}</td>
                                <td className="py-3 px-4 text-center">
                                    <div className="flex items-center justify-center space-x-1">
                                        <button onClick={() => handleOpenPreviewModal(rest.id)} className="text-teal-500 hover:text-teal-700 p-2 rounded-full hover:bg-teal-100 transition" title="Preview Digital Signage">
                                            <PreviewIcon className="h-5 w-5"/>
                                        </button>
                                        <button onClick={() => handleOpenDisplayUrl(rest)} className="text-sky-500 hover:text-sky-700 p-2 rounded-full hover:bg-sky-100 transition" title="Show Digital Display URL">
                                            <DisplayIcon className="h-5 w-5"/>
                                        </button>
                                        <button onClick={() => handleOpenEditModal(rest)} className="text-amber-500 hover:text-amber-700 p-2 rounded-full hover:bg-amber-100 transition" title="Edit Restaurant">
                                            <PencilIcon className="h-5 w-5"/>
                                        </button>
                                        <button onClick={() => handleDeleteRestaurant(rest)} className="text-rose-500 hover:text-rose-700 p-2 rounded-full hover:bg-rose-100 transition" title="Delete Restaurant">
                                            <TrashIcon className="h-5 w-5"/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredRestaurants.length === 0 && (
                    <div className="text-center py-10 text-slate-500">
                        <p>No restaurants found. {filterPropertyId ? "Clear the filter or" : ""} add a new restaurant.</p>
                    </div>
                )}
            </div>

            <RestaurantModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSaveRestaurant}
                initialData={editingRestaurant}
                properties={visibleProperties}
            />

            <DisplayUrlModal
                isOpen={isUrlModalOpen}
                onClose={() => setUrlModalOpen(false)}
                url={displayUrl}
                showToast={showToast}
            />
            
            <DigitalMenuPreviewModal
                isOpen={isPreviewModalOpen}
                onClose={() => setPreviewModalOpen(false)}
                restaurantId={previewRestaurantId}
            />

             <SystemImportModal
                isOpen={isSystemImportModalOpen}
                onClose={() => setSystemImportModalOpen(false)}
                onImport={handleSystemImport}
                initialStats={systemImportStats}
            />

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={() => {
                    deleteAction?.();
                    setConfirmModalOpen(false);
                }}
                title="Confirm Deletion"
                message={confirmMessage}
            />
        </div>
    );
};

export default RestaurantsPage;
