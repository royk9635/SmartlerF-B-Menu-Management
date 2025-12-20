import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Property, Restaurant, ModifierGroup, ModifierItem, User, UserRole } from '../types';
import * as api from '../services/supabaseService';
import { LoadingSpinner } from './LoadingSpinner';
import ConfirmationModal from './ConfirmationModal';
import ModifierList from './ModifierList';
import ModifierGroupModal from './ModifierGroupModal';
import ModifierItemModal from './ModifierItemModal';

interface ModifiersPageProps {
    showToast: (message: string, type: 'success' | 'error') => void;
    currentUser: User;
}

const ModifiersPage: React.FC<ModifiersPageProps> = ({ showToast, currentUser }) => {
    // Selection state
    const [allProperties, setAllProperties] = useState<Property[]>([]);
    const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);
    const [selectedPropertyId, setSelectedPropertyId] = useState('');
    const [selectedRestaurantId, setSelectedRestaurantId] = useState('');
    
    // Data state
    const [modifierGroups, setModifierGroups] = useState<ModifierGroup[]>([]);
    const [modifierItemsMap, setModifierItemsMap] = useState<Map<string, ModifierItem[]>>(new Map());
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);
    
    // Modal states
    const [isGroupModalOpen, setGroupModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<ModifierGroup | null>(null);
    const [isItemModalOpen, setItemModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ModifierItem | null>(null);
    const [currentGroupForModal, setCurrentGroupForModal] = useState<ModifierGroup | null>(null);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    const [deleteAction, setDeleteAction] = useState<(() => void) | null>(null);
    const [confirmMessage, setConfirmMessage] = useState('');
    
    const isSuperAdmin = currentUser.role === UserRole.SUPERADMIN;

    // Initial data fetching for selectors
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const [properties, restaurants] = await Promise.all([
                    api.getProperties('tenant-123'),
                    api.getAllRestaurants()
                ]);
                setAllProperties(properties);
                setAllRestaurants(restaurants);
                if (!isSuperAdmin && currentUser.propertyId) {
                    setSelectedPropertyId(currentUser.propertyId);
                    const initialRestaurants = restaurants.filter(r => r.propertyId === currentUser.propertyId);
                    if (initialRestaurants.length > 0) setSelectedRestaurantId(initialRestaurants[0].id);
                }
            } catch (error) { showToast('Failed to fetch initial data', 'error'); } 
            finally { setLoading(false); }
        };
        fetchInitialData();
    }, [showToast, isSuperAdmin, currentUser.propertyId]);

    const visibleProperties = useMemo(() => {
        if (isSuperAdmin) return allProperties;
        if (!currentUser || !currentUser.propertyId) return [];
        return allProperties.filter(p => p && p.id === currentUser.propertyId);
    }, [allProperties, currentUser, isSuperAdmin]);
    const restaurantsForSelectedProperty = useMemo(() => selectedPropertyId ? allRestaurants.filter(r => r.propertyId === selectedPropertyId) : [], [allRestaurants, selectedPropertyId]);

    // Auto-select first restaurant
    useEffect(() => {
        if (restaurantsForSelectedProperty.length > 0 && !restaurantsForSelectedProperty.some(r => r.id === selectedRestaurantId)) {
            setSelectedRestaurantId(restaurantsForSelectedProperty[0].id);
        } else if (restaurantsForSelectedProperty.length === 0) {
            setSelectedRestaurantId('');
        }
    }, [restaurantsForSelectedProperty, selectedRestaurantId]);

    // Fetch modifier groups when restaurant changes
    const fetchModifierGroups = useCallback(async () => {
        if (!selectedRestaurantId) {
            setModifierGroups([]);
            return;
        }
        setLoading(true);
        try {
            const fetched = await api.getModifierGroups(selectedRestaurantId);
            setModifierGroups(fetched);
        } catch (error) { showToast('Failed to fetch modifier groups', 'error'); } 
        finally { setLoading(false); }
    }, [selectedRestaurantId, showToast]);

    useEffect(() => {
        fetchModifierGroups();
    }, [fetchModifierGroups]);

    // Handlers
    const handleToggleExpand = async (groupId: string) => {
        const newExpanded = new Set(expandedGroups);
        if (newExpanded.has(groupId)) {
            newExpanded.delete(groupId);
        } else {
            newExpanded.add(groupId);
            if (!modifierItemsMap.has(groupId)) {
                try {
                    const items = await api.getModifierItems(groupId);
                    setModifierItemsMap(prev => new Map(prev).set(groupId, items));
                } catch (error) { showToast('Failed to fetch modifier items', 'error'); }
            }
        }
        setExpandedGroups(newExpanded);
    };

    const refreshItemsForGroup = async (groupId: string) => {
        const items = await api.getModifierItems(groupId);
        setModifierItemsMap(prev => new Map(prev).set(groupId, items));
    };

    // Group CRUD
    const handleSaveGroup = async (groupData: Omit<ModifierGroup, 'id' | 'restaurantId'>) => {
        try {
            if (editingGroup) {
                await api.updateModifierGroup({ ...editingGroup, ...groupData });
                showToast('Group updated successfully!', 'success');
            } else {
                await api.addModifierGroup({ ...groupData, restaurantId: selectedRestaurantId });
                showToast('Group added successfully!', 'success');
            }
            fetchModifierGroups();
        } catch (error) { showToast('Failed to save group.', 'error'); } 
        finally { setGroupModalOpen(false); setEditingGroup(null); }
    };

    const handleDeleteGroup = (group: ModifierGroup) => {
        setConfirmMessage(`Delete "${group.name}"? All items within it will also be deleted.`);
        setDeleteAction(() => async () => {
            try {
                await api.deleteModifierGroup(group.id);
                showToast('Group deleted successfully!', 'success');
                fetchModifierGroups();
            } catch (error) { showToast('Failed to delete group.', 'error'); }
        });
        setConfirmModalOpen(true);
    };

    // Item CRUD
    const handleSaveItem = async (itemData: Omit<ModifierItem, 'id' | 'modifierGroupId'>) => {
        if (!currentGroupForModal) return;
        try {
            if (editingItem) {
                await api.updateModifierItem({ ...editingItem, ...itemData });
                showToast('Item updated successfully!', 'success');
            } else {
                await api.addModifierItem({ ...itemData, modifierGroupId: currentGroupForModal.id });
                showToast('Item added successfully!', 'success');
            }
            refreshItemsForGroup(currentGroupForModal.id);
        } catch (error) { showToast('Failed to save item.', 'error'); } 
        finally { setItemModalOpen(false); setEditingItem(null); setCurrentGroupForModal(null); }
    };
    
    const handleDeleteItem = (item: ModifierItem) => {
        setConfirmMessage(`Are you sure you want to delete the item "${item.name}"?`);
        setDeleteAction(() => async () => {
            try {
                await api.deleteModifierItem(item.id);
                showToast('Item deleted successfully!', 'success');
                refreshItemsForGroup(item.modifierGroupId);
            } catch (error) { showToast('Failed to delete item.', 'error'); }
        });
        setConfirmModalOpen(true);
    };

    const renderContent = () => {
        if (!selectedRestaurantId) {
            return (
                <div className="text-center py-20 bg-white rounded-lg shadow-md border border-slate-200">
                    <p className="text-slate-500">Please select a property and restaurant to manage modifiers.</p>
                </div>
            );
        }
        if (loading) return <div className="text-center py-10"><LoadingSpinner /></div>;
        return (
            <ModifierList
                groups={modifierGroups}
                itemsMap={modifierItemsMap}
                expandedGroups={expandedGroups}
                onToggleExpand={handleToggleExpand}
                onAddGroup={() => { setEditingGroup(null); setGroupModalOpen(true); }}
                onEditGroup={(g) => { setEditingGroup(g); setGroupModalOpen(true); }}
                onDeleteGroup={handleDeleteGroup}
                onAddItem={(g) => { setCurrentGroupForModal(g); setEditingItem(null); setItemModalOpen(true); }}
                onEditItem={(i, g) => { setCurrentGroupForModal(g); setEditingItem(i); setItemModalOpen(true); }}
                onDeleteItem={handleDeleteItem}
            />
        );
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-800">Manage Modifiers</h2>
            <div className="bg-white p-4 rounded-lg shadow-md border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select value={selectedPropertyId} onChange={(e) => setSelectedPropertyId(e.target.value)} disabled={!isSuperAdmin} className="w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 disabled:bg-slate-50">
                        <option value="" disabled>Select a property</option>
                        {visibleProperties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <select value={selectedRestaurantId} onChange={(e) => setSelectedRestaurantId(e.target.value)} disabled={!selectedPropertyId} className="w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 disabled:bg-slate-50">
                        <option value="" disabled>Select a restaurant</option>
                        {restaurantsForSelectedProperty.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                </div>
            </div>
            {renderContent()}
            <ModifierGroupModal isOpen={isGroupModalOpen} onClose={() => setGroupModalOpen(false)} onSubmit={handleSaveGroup} initialData={editingGroup} />
            {currentGroupForModal && <ModifierItemModal isOpen={isItemModalOpen} onClose={() => setItemModalOpen(false)} onSubmit={handleSaveItem} initialData={editingItem} parentGroupName={currentGroupForModal.name} />}
            <ConfirmationModal isOpen={isConfirmModalOpen} onClose={() => setConfirmModalOpen(false)} onConfirm={() => { deleteAction?.(); setConfirmModalOpen(false); }} title="Confirm Deletion" message={confirmMessage} />
        </div>
    );
};

export default ModifiersPage;
