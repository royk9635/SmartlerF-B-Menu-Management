import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Property, User, UserRole } from '../types';
import * as api from '../services/supabaseService';
import { LoadingSpinner } from './LoadingSpinner';
import ConfirmationModal from './ConfirmationModal';
import PropertyModal from './PropertyModal';
import { PlusIcon, PencilIcon, TrashIcon } from './Icons';
import { supabase } from '../supabaseClient';

interface PropertiesPageProps {
    showToast: (message: string, type: 'success' | 'error') => void;
    currentUser: User;
}

const PropertiesPage: React.FC<PropertiesPageProps> = ({ showToast, currentUser }) => {
    const [allProperties, setAllProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    
    const [isModalOpen, setModalOpen] = useState<boolean>(false);
    const [editingProperty, setEditingProperty] = useState<Property | null>(null);

    const [isConfirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
    const [deleteAction, setDeleteAction] = useState<(() => void) | null>(null);
    const [confirmMessage, setConfirmMessage] = useState<string>('');
    
    const isSuperAdmin = currentUser.role === UserRole.SUPERADMIN;

    const fetchProperties = useCallback(async () => {
        setLoading(true);
        try {
            const fetchedProperties = await api.getProperties();
            setAllProperties(fetchedProperties);
        } catch (error) {
            console.error('Failed to fetch properties:', error);
            showToast('Failed to fetch properties.', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchProperties();
        
        // Set up real-time subscription for properties table
        if (supabase) {
            const subscription = supabase
                .channel('properties-changes')
                .on('postgres_changes', 
                    { 
                        event: '*', 
                        schema: 'public', 
                        table: 'properties' 
                    },
                    (payload) => {
                        console.log('Properties changed:', payload);
                        // Refetch properties when changes occur
                        fetchProperties();
                    }
                )
                .subscribe();
            
            return () => {
                subscription.unsubscribe();
            };
        }
    }, [fetchProperties]);

    const visibleProperties = useMemo(() => {
        if (isSuperAdmin) {
            return allProperties;
        }
        if (!currentUser || !currentUser.propertyId) {
            return [];
        }
        return allProperties.filter(p => p && p.id === currentUser.propertyId);
    }, [allProperties, currentUser, isSuperAdmin]);


    const handleOpenAddModal = () => {
        setEditingProperty(null);
        setModalOpen(true);
    };

    const handleOpenEditModal = (property: Property) => {
        setEditingProperty(property);
        setModalOpen(true);
    };

    const handleSaveProperty = async (propertyData: Omit<Property, 'id' | 'tenantId'>) => {
        try {
            if (editingProperty) {
                console.log('📝 Updating property:', editingProperty.id, propertyData);
                const updated = await api.updateProperty({ ...editingProperty, ...propertyData });
                console.log('✅ Property updated:', updated);
                showToast('Property updated successfully!', 'success');
            } else {
                console.log('➕ Creating property:', propertyData);
                const created = await api.addProperty(propertyData);
                console.log('✅ Property created:', created);
                showToast('Property added successfully!', 'success');
            }
            await fetchProperties();
            setModalOpen(false);
            setEditingProperty(null);
        } catch (error: any) {
            console.error('❌ Failed to save property:', error);
            const errorMessage = error?.message || error?.error || 'Failed to save property';
            showToast(errorMessage, 'error');
        }
    };

    const handleDeleteProperty = (property: Property) => {
        setConfirmMessage(`Are you sure you want to delete "${property.name}"? This will also delete all associated restaurants and menus.`);
        setDeleteAction(() => async () => {
            try {
                await api.deleteProperty(property.id);
                showToast('Property deleted successfully!', 'success');
                await fetchProperties();
            } catch (error) {
                console.error('Failed to delete property:', error);
                showToast('Failed to delete property.', 'error');
            }
        });
        setConfirmModalOpen(true);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-96"><LoadingSpinner /></div>;
    }

    return (
        <div className="bg-white shadow-md rounded-lg border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-700">Manage Properties</h2>
                {isSuperAdmin && (
                    <button
                        onClick={handleOpenAddModal}
                        className="flex items-center bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-primary-700 transition duration-300"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Add Property
                    </button>
                )}
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600">Name</th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600">Address</th>
                            <th className="text-center py-3 px-4 uppercase font-semibold text-sm text-slate-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-slate-700">
                        {visibleProperties.map(prop => (
                            <tr key={prop.id} className="border-b border-slate-200 hover:bg-slate-50">
                                <td className="py-3 px-4 font-medium">{prop.name}</td>
                                <td className="py-3 px-4">{prop.address}</td>
                                <td className="py-3 px-4 text-center">
                                    <div className="flex items-center justify-center space-x-2">
                                        <button onClick={() => handleOpenEditModal(prop)} className="text-amber-500 hover:text-amber-700 p-2 rounded-full hover:bg-amber-100 transition" title="Edit Property">
                                            <PencilIcon className="h-5 w-5"/>
                                        </button>
                                        {isSuperAdmin && (
                                            <button onClick={() => handleDeleteProperty(prop)} className="text-rose-500 hover:text-rose-700 p-2 rounded-full hover:bg-rose-100 transition" title="Delete Property">
                                                <TrashIcon className="h-5 w-5"/>
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {visibleProperties.length === 0 && (
                    <div className="text-center py-10 text-slate-500">
                        <p>No properties found. {isSuperAdmin ? 'Click "Add Property" to get started.' : 'Contact a superadmin to be assigned to a property.'}</p>
                    </div>
                )}
            </div>

            <PropertyModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSaveProperty}
                initialData={editingProperty}
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

export default PropertiesPage;
