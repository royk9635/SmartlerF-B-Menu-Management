import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MenuItem, MenuCategory, Property, Restaurant, Allergen, Currency, BulkAction, SubCategory, User, UserRole, Attribute, ModifierGroup } from '../types';
import * as api from '../services/supabaseService';
import { LoadingSpinner } from './LoadingSpinner';
import MenuItemList from './MenuItemList';
import MenuItemModal from './MenuItemModal';
import ConfirmationModal from './ConfirmationModal';
import ImagePreviewModal from './ImagePreviewModal';
import BulkActionModal from './BulkActionModal';

interface MenuItemsPageProps {
    showToast: (message: string, type: 'success' | 'error') => void;
    initialSelection: { propertyId: string, restaurantId: string, categoryId: string, subCategoryId?: string } | null;
    onSelectionConsumed: () => void;
    currentUser: User;
}

const MenuItemsPage: React.FC<MenuItemsPageProps> = ({ showToast, initialSelection, onSelectionConsumed, currentUser }) => {
    // Selection state
    const [allProperties, setAllProperties] = useState<Property[]>([]);
    const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);
    const [allCategories, setAllCategories] = useState<MenuCategory[]>([]);
    const [allAttributes, setAllAttributes] = useState<Attribute[]>([]);
    const [allAllergens, setAllAllergens] = useState<Allergen[]>([]);
    const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [availableModifierGroups, setAvailableModifierGroups] = useState<ModifierGroup[]>([]);
    
    const [selectedPropertyId, setSelectedPropertyId] = useState('');
    const [selectedRestaurantId, setSelectedRestaurantId] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string>(''); // Empty string for main category items

    const [loading, setLoading] = useState(false);
    
    // Modal states
    const [isMenuItemModalOpen, setMenuItemModalOpen] = useState(false);
    const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    const [deleteAction, setDeleteAction] = useState<(() => void) | null>(null);
    const [confirmMessage, setConfirmMessage] = useState('');
    const [isImageModalOpen, setImageModalOpen] = useState(false);
    const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
    const [isBulkActionModalOpen, setBulkActionModalOpen] = useState(false);

    const isSuperAdmin = currentUser.role === UserRole.SUPERADMIN;

    // --- Data Fetching Chain ---
     useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const [properties, restaurants, categories, attributes, allergens] = await Promise.all([
                    api.getProperties('tenant-123'), // Still mocked
                    api.getAllRestaurants(), // Still mocked
                    api.getAllCategories(), // Now Supabase
                    api.getAttributes(), // Now Supabase
                    api.getAllergens() // Now Supabase
                ]);
                setAllProperties(properties);
                setAllRestaurants(restaurants);
                setAllCategories(categories);
                setAllAttributes(attributes);
                setAllAllergens(allergens);
            } catch (error) { showToast('Failed to fetch initial data', 'error'); }
            finally { setLoading(false); }
        };
        fetchInitialData();
    }, [showToast]);

    // Handle initial selection from navigation or user role
    useEffect(() => {
        if (initialSelection) {
            setSelectedPropertyId(initialSelection.propertyId);
            setSelectedRestaurantId(initialSelection.restaurantId);
            setSelectedCategoryId(initialSelection.categoryId);
            setSelectedSubCategoryId(initialSelection.subCategoryId || '');
            onSelectionConsumed();
        } else if (!isSuperAdmin && currentUser.propertyId) {
            setSelectedPropertyId(currentUser.propertyId);
        }
    }, [initialSelection, onSelectionConsumed, isSuperAdmin, currentUser.propertyId]);

    const visibleProperties = useMemo(() => {
        if (isSuperAdmin) return allProperties;
        if (!currentUser || !currentUser.propertyId) return [];
        return allProperties.filter(p => p && p.id === currentUser.propertyId);
    }, [allProperties, currentUser.propertyId, isSuperAdmin]);

    const visibleRestaurants = useMemo(() => {
        if (!selectedPropertyId) return [];
        return allRestaurants.filter(r => r.propertyId === selectedPropertyId);
    }, [allRestaurants, selectedPropertyId]);

    const visibleCategories = useMemo(() => {
        if (!selectedRestaurantId) return [];
        return allCategories.filter(c => c.restaurantId === selectedRestaurantId);
    }, [allCategories, selectedRestaurantId]);


    useEffect(() => {
        if (!selectedCategoryId) { setSubcategories([]); return; }
        api.getSubCategories(selectedCategoryId).then(setSubcategories).catch(() => showToast('Failed to fetch subcategories', 'error'));
    }, [selectedCategoryId, showToast]);
    
    useEffect(() => {
        if (selectedRestaurantId) {
            api.getModifierGroups(selectedRestaurantId)
               .then(setAvailableModifierGroups)
               .catch(() => showToast('Failed to load modifier groups for this restaurant.', 'error'));
        } else {
            setAvailableModifierGroups([]);
        }
    }, [selectedRestaurantId, showToast]);

    const fetchMenuItems = useCallback(async () => {
        if (!selectedCategoryId) {
            setMenuItems([]);
            return;
        }
        setLoading(true);
        try {
            const subId = selectedSubCategoryId === '' ? undefined : selectedSubCategoryId;
            const items = await api.getMenuItems('tenant-123', selectedCategoryId, subId);
            setMenuItems(items);
        } catch (error) { showToast(`Failed to fetch menu items.`, 'error'); } 
        finally { setLoading(false); }
    }, [selectedCategoryId, selectedSubCategoryId, showToast]);

    useEffect(() => {
        fetchMenuItems();
    }, [fetchMenuItems]);


    // --- CRUD Handlers ---
    const handleSaveMenuItem = async (itemData: Omit<MenuItem, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>) => {
        try {
            if (editingMenuItem) {
                await api.updateMenuItem({ ...editingMenuItem, ...itemData, updatedAt: new Date().toISOString() });
                showToast('Item updated successfully!', 'success');
            } else {
                await api.addMenuItem({ ...itemData, tenantId: 'tenant-123' });
                showToast('Item added successfully!', 'success');
            }
            await fetchMenuItems();
        } catch (error) { showToast('Failed to save menu item.', 'error'); }
        finally { setMenuItemModalOpen(false); setEditingMenuItem(null); }
    };

    const handleDeleteMenuItem = (itemId: string) => {
        const itemToDelete = menuItems.find(i => i.id === itemId);
        if (!itemToDelete) return;
        setConfirmMessage(`Are you sure you want to delete the item "${itemToDelete.name}"?`);
        setDeleteAction(() => async () => {
            try {
                await api.deleteMenuItem(itemId);
                showToast('Item deleted successfully!', 'success');
                await fetchMenuItems();
            } catch (error) { showToast('Failed to delete item.', 'error'); }
        });
        setConfirmModalOpen(true);
    };
    
    const handleToggleAvailability = async (item: MenuItem) => {
        const updatedItem = { ...item, availabilityFlag: !item.availabilityFlag };
        try {
            await api.updateMenuItem(updatedItem);
            setMenuItems(prev => prev.map(i => i.id === item.id ? updatedItem : i));
            showToast(`"${item.name}" availability updated.`, 'success');
        } catch (error) {
            showToast('Failed to update item availability.', 'error');
        }
    };

    const handleBulkUpdateItems = async (itemIds: string[], action: BulkAction, payload?: { currency?: Currency }) => {
        let changes: Partial<Omit<MenuItem, 'id'>> = {};
        let successMessage = '';
    
        switch (action) {
            case BulkAction.ENABLE_ITEMS:
                changes = { availabilityFlag: true };
                successMessage = 'Selected items have been enabled.';
                break;
            case BulkAction.DISABLE_ITEMS:
                changes = { availabilityFlag: false };
                successMessage = 'Selected items have been disabled.';
                break;
            case BulkAction.MARK_SOLD_OUT:
                changes = { soldOut: true };
                successMessage = 'Selected items marked as sold out.';
                break;
            case BulkAction.ENABLE_BOGO:
                changes = { bogo: true };
                successMessage = 'BOGO enabled for selected items.';
                break;
            case BulkAction.DISABLE_BOGO:
                changes = { bogo: false };
                successMessage = 'BOGO disabled for selected items.';
                break;
            case BulkAction.CHANGE_CURRENCY:
                if (payload?.currency) {
                    changes = { currency: payload.currency };
                    successMessage = `Currency changed to ${payload.currency} for selected items. Prices adjusted.`;
                }
                break;
        }
    
        try {
            await api.updateMenuItemsBatch(itemIds, changes);
            await fetchMenuItems();
            showToast(successMessage, 'success');
            setBulkActionModalOpen(false);
        } catch (error) {
            showToast('Failed to apply bulk action.', 'error');
        }
    };
    
    const selectedCategory = allCategories.find(c => c.id === selectedCategoryId);

    return (
        <div className="space-y-6">
             <div className="bg-white p-4 rounded-lg shadow-md border border-slate-200">
                <h2 className="text-xl font-bold text-slate-700 mb-4">Select Items to View</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <select value={selectedPropertyId} onChange={(e) => { setSelectedPropertyId(e.target.value); setSelectedRestaurantId(''); setSelectedCategoryId(''); setSelectedSubCategoryId(''); }} disabled={!isSuperAdmin} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-slate-50 disabled:cursor-not-allowed">
                        <option value="">Select Property</option>
                        {visibleProperties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <select value={selectedRestaurantId} onChange={(e) => { setSelectedRestaurantId(e.target.value); setSelectedCategoryId(''); setSelectedSubCategoryId(''); }} disabled={!selectedPropertyId} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-slate-50">
                        <option value="">Select Restaurant</option>
                        {visibleRestaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                     <select value={selectedCategoryId} onChange={(e) => { setSelectedCategoryId(e.target.value); setSelectedSubCategoryId(''); }} disabled={!selectedRestaurantId} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-slate-50">
                        <option value="">Select Category</option>
                        {visibleCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <select value={selectedSubCategoryId} onChange={(e) => setSelectedSubCategoryId(e.target.value)} disabled={!selectedCategoryId} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-slate-50">
                        <option value="">Items in Main Category</option>
                        {subcategories.map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
                    </select>
                </div>
            </div>

            {loading && !selectedCategory && <div className="text-center py-10"><LoadingSpinner /></div>}
            
            {!loading && selectedCategory && (
                <MenuItemList
                    category={selectedCategory}
                    items={menuItems}
                    onAddItem={() => { setEditingMenuItem(null); setMenuItemModalOpen(true); }}
                    onEditItem={(item) => { setEditingMenuItem(item); setMenuItemModalOpen(true); }}
                    onDeleteItem={handleDeleteMenuItem}
                    onBack={() => setSelectedCategoryId('')}
                    onToggleAvailability={handleToggleAvailability}
                    onImageClick={(url) => { setPreviewImageUrl(url); setImageModalOpen(true); }}
                    onOpenBulkActions={() => setBulkActionModalOpen(true)}
                />
            )}
            
             {!loading && !selectedCategoryId && (
                 <div className="text-center py-20 bg-white rounded-lg shadow-md border border-slate-200">
                    <p className="text-slate-500">Please select a property, restaurant, and category to manage items.</p>
                </div>
            )}
            
            {selectedCategoryId && (
                <MenuItemModal
                    isOpen={isMenuItemModalOpen}
                    onClose={() => setMenuItemModalOpen(false)}
                    onSubmit={handleSaveMenuItem}
                    initialData={editingMenuItem}
                    categoryId={selectedCategoryId}
                    subcategories={subcategories}
                    attributes={allAttributes}
                    availableAllergens={allAllergens}
                    availableCurrencies={Object.values(Currency)}
                    availableModifierGroups={availableModifierGroups}
                />
            )}

            <ConfirmationModal isOpen={isConfirmModalOpen} onClose={() => setConfirmModalOpen(false)} onConfirm={() => { deleteAction?.(); setConfirmModalOpen(false); }} title="Confirm Deletion" message={confirmMessage} />
            <ImagePreviewModal isOpen={isImageModalOpen} onClose={() => setImageModalOpen(false)} imageUrl={previewImageUrl} />
            {selectedCategoryId && <BulkActionModal isOpen={isBulkActionModalOpen} onClose={() => setBulkActionModalOpen(false)} items={menuItems} onApply={handleBulkUpdateItems} />}
        </div>
    );
};

export default MenuItemsPage;
