import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Staff, Restaurant, Property, User, UserRole } from '../types';
import * as api from '../services/supabaseService';
import { staffApi } from '../services/apiService';
import { LoadingSpinner } from './LoadingSpinner';
import ConfirmationModal from './ConfirmationModal';
import StaffModal from './StaffModal';
import { PlusIcon, PencilIcon, TrashIcon } from './Icons';

interface StaffManagementPageProps {
    showToast: (message: string, type: 'success' | 'error') => void;
    currentUser: User;
}

const StaffManagementPage: React.FC<StaffManagementPageProps> = ({ showToast, currentUser }) => {
    const [allStaff, setAllStaff] = useState<Omit<Staff, 'pin'>[]>([]);
    const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);
    const [allProperties, setAllProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [filterPropertyId, setFilterPropertyId] = useState<string>('');
    const [filterRestaurantId, setFilterRestaurantId] = useState<string>('');
    
    const [isModalOpen, setModalOpen] = useState<boolean>(false);
    const [editingStaff, setEditingStaff] = useState<Omit<Staff, 'pin'> | null>(null);

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
            
            // Fetch staff with filters
            const params: { propertyId?: string; restaurantId?: string } = {};
            if (filterPropertyId) params.propertyId = filterPropertyId;
            if (filterRestaurantId) params.restaurantId = filterRestaurantId;
            
            const fetchedStaff = await staffApi.getAll(params);
            setAllStaff(fetchedStaff);
        } catch (error) {
            showToast('Failed to fetch data.', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast, filterPropertyId, filterRestaurantId]);

    useEffect(() => {
        if (!isSuperAdmin && currentUser.propertyId && !filterPropertyId) {
            setFilterPropertyId(currentUser.propertyId);
        }
    }, [isSuperAdmin, currentUser.propertyId, filterPropertyId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const propertyMap = useMemo(() => new Map(allProperties.map(p => [p.id, p.name])), [allProperties]);
    const restaurantMap = useMemo(() => new Map(allRestaurants.map(r => [r.id, r.name])), [allRestaurants]);

    const visibleProperties = useMemo(() => {
        if (isSuperAdmin) {
            return allProperties;
        }
        if (!currentUser || !currentUser.propertyId) {
            return [];
        }
        return allProperties.filter(p => p && p.id === currentUser.propertyId);
    }, [allProperties, currentUser, isSuperAdmin]);

    const visibleRestaurants = useMemo(() => {
        if (filterPropertyId) {
            return allRestaurants.filter(r => r && r.propertyId === filterPropertyId);
        }
        if (isSuperAdmin) {
            return allRestaurants;
        }
        if (!currentUser || !currentUser.propertyId) {
            return [];
        }
        return allRestaurants.filter(r => r && r.propertyId === currentUser.propertyId);
    }, [allRestaurants, filterPropertyId, isSuperAdmin, currentUser]);

    const handleOpenAddModal = () => {
        if (visibleRestaurants.length === 0) {
            showToast('Please create a restaurant first before adding staff.', 'error');
            return;
        }
        setEditingStaff(null);
        setModalOpen(true);
    };

    const handleOpenEditModal = (staff: Omit<Staff, 'pin'>) => {
        setEditingStaff(staff);
        setModalOpen(true);
    };

    const handleSaveStaff = async (staffData: { name: string; pin: string; role: Staff['role']; restaurantId: string }) => {
        try {
            if (editingStaff) {
                const updateData: Partial<{ name: string; pin: string; role: Staff['role']; isActive: boolean }> = {
                    name: staffData.name,
                    role: staffData.role
                };
                if (staffData.pin) {
                    updateData.pin = staffData.pin;
                }
                await staffApi.update(editingStaff.id, updateData);
                showToast('Staff member updated successfully!', 'success');
            } else {
                await staffApi.create(staffData);
                showToast('Staff member added successfully!', 'success');
            }
            await fetchData();
            setModalOpen(false);
            setEditingStaff(null);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            showToast(`Failed to save staff member. ${errorMessage}`, 'error');
        }
    };

    const handleDeleteStaff = (staff: Omit<Staff, 'pin'>) => {
        setConfirmMessage(`Are you sure you want to delete the staff member "${staff.name}"? This action cannot be undone.`);
        setDeleteAction(() => async () => {
            try {
                await staffApi.delete(staff.id);
                showToast('Staff member deleted successfully!', 'success');
                await fetchData();
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                showToast(`Failed to delete staff member. ${errorMessage}`, 'error');
            }
        });
        setConfirmModalOpen(true);
    };

    const handleToggleActive = async (staff: Omit<Staff, 'pin'>) => {
        try {
            await staffApi.update(staff.id, { isActive: !staff.isActive });
            showToast(`Staff member ${!staff.isActive ? 'activated' : 'deactivated'} successfully!`, 'success');
            await fetchData();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            showToast(`Failed to update staff member. ${errorMessage}`, 'error');
        }
    };

    if (currentUser.role !== UserRole.SUPERADMIN && currentUser.role !== UserRole.ADMIN) {
        return (
             <div className="bg-white shadow-md rounded-lg border border-slate-200 p-6 text-center">
                 <h2 className="text-2xl font-bold text-rose-600">Access Denied</h2>
                 <p className="text-slate-600 mt-2">You do not have permission to view this page.</p>
             </div>
        )
    }

    if (loading) {
        return <div className="flex justify-center items-center h-96"><LoadingSpinner /></div>;
    }

    return (
        <div className="bg-white shadow-md rounded-lg border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-700">Staff Management</h2>
                <button
                    onClick={handleOpenAddModal}
                    className="flex items-center bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-primary-700 transition duration-300"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Staff Member
                </button>
            </div>

            {/* Filters */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {isSuperAdmin && (
                    <div>
                        <label htmlFor="filterProperty" className="block text-sm font-medium text-slate-700 mb-2">
                            Filter by Property
                        </label>
                        <select
                            id="filterProperty"
                            value={filterPropertyId}
                            onChange={(e) => {
                                setFilterPropertyId(e.target.value);
                                setFilterRestaurantId(''); // Reset restaurant filter when property changes
                            }}
                            className="block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value="">All Properties</option>
                            {allProperties.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                )}
                <div>
                    <label htmlFor="filterRestaurant" className="block text-sm font-medium text-slate-700 mb-2">
                        Filter by Restaurant
                    </label>
                    <select
                        id="filterRestaurant"
                        value={filterRestaurantId}
                        onChange={(e) => setFilterRestaurantId(e.target.value)}
                        className="block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                        <option value="">All Restaurants</option>
                        {visibleRestaurants.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600">Name</th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600">Role</th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600">Restaurant</th>
                            {isSuperAdmin && (
                                <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600">Property</th>
                            )}
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600">Status</th>
                            <th className="text-center py-3 px-4 uppercase font-semibold text-sm text-slate-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-slate-700">
                        {allStaff.map(staff => (
                            <tr key={staff.id} className="border-b border-slate-200 hover:bg-slate-50">
                                <td className="py-3 px-4 font-medium">{staff.name}</td>
                                <td className="py-3 px-4">
                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-800 capitalize">
                                        {staff.role}
                                    </span>
                                </td>
                                <td className="py-3 px-4">{restaurantMap.get(staff.restaurantId) || 'N/A'}</td>
                                {isSuperAdmin && (
                                    <td className="py-3 px-4">
                                        {(() => {
                                            const restaurant = allRestaurants.find(r => r.id === staff.restaurantId);
                                            return restaurant ? propertyMap.get(restaurant.propertyId) || 'N/A' : 'N/A';
                                        })()}
                                    </td>
                                )}
                                <td className="py-3 px-4">
                                    <button
                                        onClick={() => handleToggleActive(staff)}
                                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            staff.isActive
                                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                    >
                                        {staff.isActive ? 'Active' : 'Inactive'}
                                    </button>
                                </td>
                                <td className="py-3 px-4 text-center">
                                    <div className="flex items-center justify-center space-x-2">
                                        <button onClick={() => handleOpenEditModal(staff)} className="text-amber-500 hover:text-amber-700 p-2 rounded-full hover:bg-amber-100 transition" title="Edit Staff">
                                            <PencilIcon className="h-5 w-5"/>
                                        </button>
                                        <button onClick={() => handleDeleteStaff(staff)} className="text-rose-500 hover:text-rose-700 p-2 rounded-full hover:bg-rose-100 transition" title="Delete Staff">
                                            <TrashIcon className="h-5 w-5"/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {allStaff.length === 0 && (
                    <div className="text-center py-10 text-slate-500">
                        <p>No staff members found. Click "Add Staff Member" to get started.</p>
                    </div>
                )}
            </div>

            <StaffModal
                isOpen={isModalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditingStaff(null);
                }}
                onSubmit={handleSaveStaff}
                initialData={editingStaff}
                restaurants={visibleRestaurants}
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

export default StaffManagementPage;

