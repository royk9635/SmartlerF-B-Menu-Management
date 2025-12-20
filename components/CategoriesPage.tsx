import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MenuCategory, Property, Restaurant, SubCategory, User, UserRole } from '../types';
import * as api from '../services/supabaseService';
import { LoadingSpinner } from './LoadingSpinner';
import CategoryList from './CategoryList';
import CategoryModal from './CategoryModal';
import ConfirmationModal from './ConfirmationModal';
import QRCodeModal from './QRCodeModal';
import SubCategoryModal from './SubCategoryModal';

declare var XLSX: any;

interface CategoriesPageProps {
    showToast: (message: string, type: 'success' | 'error') => void;
    onNavigateToMenuItems: (selection: { propertyId: string, restaurantId: string, categoryId: string, subCategoryId?: string }) => void;
    currentUser: User;
}

const CategoriesPage: React.FC<CategoriesPageProps> = ({ showToast, onNavigateToMenuItems, currentUser }) => {
    // Main selection state
    const [allProperties, setAllProperties] = useState<Property[]>([]);
    const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);
    
    const [selectedPropertyId, setSelectedPropertyId] = useState('');
    const [selectedRestaurantId, setSelectedRestaurantId] = useState('');
    
    const [categories, setCategories] = useState<MenuCategory[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Inline subcategory state
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
    const [subcategoriesMap, setSubcategoriesMap] = useState<Map<string, SubCategory[]>>(new Map());
    const [currentCategoryForModal, setCurrentCategoryForModal] = useState<MenuCategory | null>(null);

    // Modal states
    const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
    const [isSubCategoryModalOpen, setSubCategoryModalOpen] = useState(false);
    const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    const [deleteAction, setDeleteAction] = useState<(() => void) | null>(null);
    const [confirmMessage, setConfirmMessage] = useState('');
    const [isQRCodeModalOpen, setQRCodeModalOpen] = useState(false);
    const [qrCodeData, setQrCodeData] = useState<{ url: string; title: string } | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    
    const isSuperAdmin = currentUser.role === UserRole.SUPERADMIN;

    // Initial data fetching
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
                    if (initialRestaurants.length > 0) {
                        setSelectedRestaurantId(initialRestaurants[0].id);
                    }
                }

            } catch (error) { showToast('Failed to fetch initial data', 'error'); } 
            finally { setLoading(false); }
        };
        fetchInitialData();
    }, [showToast, isSuperAdmin, currentUser.propertyId]);

    const visibleProperties = useMemo(() => {
        if (isSuperAdmin) {
            return allProperties;
        }
        if (!currentUser || !currentUser.propertyId) return [];
        return allProperties.filter(p => p && p.id === currentUser.propertyId);
    }, [allProperties, currentUser, isSuperAdmin]);

    const restaurantsForSelectedProperty = useMemo(() => {
        if (!selectedPropertyId) return [];
        return allRestaurants.filter(r => r.propertyId === selectedPropertyId);
    }, [allRestaurants, selectedPropertyId]);

    // Auto-select first restaurant when property changes
    useEffect(() => {
        if (restaurantsForSelectedProperty.length > 0) {
            const currentSelectionExists = restaurantsForSelectedProperty.some(r => r.id === selectedRestaurantId);
            if (!currentSelectionExists) {
                setSelectedRestaurantId(restaurantsForSelectedProperty[0].id);
            }
        } else {
            setSelectedRestaurantId('');
        }
    }, [restaurantsForSelectedProperty, selectedRestaurantId]);


    const fetchCategories = useCallback(async () => {
        if (!selectedRestaurantId) {
            setCategories([]);
            return;
        };
        setLoading(true);
        try {
            const fetched = await api.getCategories(selectedRestaurantId);
            setCategories(fetched);
        } catch (error) { showToast('Failed to fetch categories', 'error'); } 
        finally { setLoading(false); }
    }, [selectedRestaurantId, showToast]);
    
    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);


    const handleToggleExpand = async (categoryId: string) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(categoryId)) {
            newExpanded.delete(categoryId);
        } else {
            newExpanded.add(categoryId);
            if (!subcategoriesMap.has(categoryId)) {
                try {
                    setLoading(true);
                    const fetched = await api.getSubCategories(categoryId);
                    setSubcategoriesMap(prevMap => new Map(prevMap).set(categoryId, fetched));
                } catch (error) {
                    showToast('Failed to fetch subcategories', 'error');
                } finally {
                    setLoading(false);
                }
            }
        }
        setExpandedCategories(newExpanded);
    };

    // Handlers for Categories
    const handleSaveCategory = async (categoryData: Omit<MenuCategory, 'id' | 'restaurantId'>) => {
        if (!selectedRestaurantId) return;
        try {
            if (editingCategory) {
                await api.updateCategory({ ...editingCategory, ...categoryData });
                showToast('Category updated successfully!', 'success');
            } else {
                await api.addCategory({ ...categoryData, restaurantId: selectedRestaurantId });
                showToast('Category added successfully!', 'success');
            }
            await fetchCategories();
        } catch (error) { showToast('Failed to save category.', 'error'); }
        finally { setCategoryModalOpen(false); setEditingCategory(null); }
    };

    const handleDeleteCategory = (categoryId: string) => {
        const categoryToDelete = categories.find(c => c.id === categoryId);
        if (!categoryToDelete) return;
        setConfirmMessage(`Delete "${categoryToDelete.name}"? All subcategories and items within it will also be deleted.`);
        setDeleteAction(() => async () => {
            try {
                await api.deleteCategory(categoryId);
                showToast('Category deleted successfully!', 'success');
                await fetchCategories();
            } catch (error) { showToast('Failed to delete category.', 'error'); }
        });
        setConfirmModalOpen(true);
    };

    // Handlers for SubCategories
    const handleSaveSubCategory = async (subCategoryData: Omit<SubCategory, 'id' | 'categoryId'>) => {
        if (!currentCategoryForModal) return;
        const categoryId = currentCategoryForModal.id;
        try {
            if (editingSubCategory) {
                await api.updateSubCategory({ ...editingSubCategory, ...subCategoryData });
                showToast('Subcategory updated successfully!', 'success');
            } else {
                await api.addSubCategory({ ...subCategoryData, categoryId: categoryId });
                showToast('Subcategory added successfully!', 'success');
            }
            const fetched = await api.getSubCategories(categoryId);
            setSubcategoriesMap(prevMap => new Map(prevMap).set(categoryId, fetched));
        } catch (error) { showToast('Failed to save subcategory.', 'error'); }
        finally { setSubCategoryModalOpen(false); setEditingSubCategory(null); setCurrentCategoryForModal(null); }
    };
    
    const handleDeleteSubCategory = (subCategoryId: string, parentCategoryId: string) => {
        const subCategoryToDelete = subcategoriesMap.get(parentCategoryId)?.find(sc => sc.id === subCategoryId);
        if (!subCategoryToDelete) return;

        setConfirmMessage(`Delete "${subCategoryToDelete.name}"? All items within it will also be deleted.`);
        setDeleteAction(() => async () => {
            try {
                await api.deleteSubCategory(subCategoryId);
                showToast('Subcategory deleted successfully!', 'success');
                const fetched = await api.getSubCategories(parentCategoryId);
                setSubcategoriesMap(prevMap => new Map(prevMap).set(parentCategoryId, fetched));
            } catch (error) { showToast('Failed to delete subcategory.', 'error'); }
        });
        setConfirmModalOpen(true);
    };
    
    const handleOpenAddSubCategoryModal = (parentCategory: MenuCategory) => {
        setCurrentCategoryForModal(parentCategory);
        setEditingSubCategory(null);
        setSubCategoryModalOpen(true);
    };

    const handleOpenEditSubCategoryModal = (subcategory: SubCategory) => {
        const parent = categories.find(c => c.id === subcategory.categoryId);
        if (parent) {
            setCurrentCategoryForModal(parent);
            setEditingSubCategory(subcategory);
            setSubCategoryModalOpen(true);
        }
    };


    // Other handlers
    const handleReorderCategories = async (reordered: MenuCategory[]) => {
        setCategories(reordered); // Optimistic update
        try {
            await Promise.all(reordered.map(c => api.updateCategory(c)));
        } catch (error) { showToast('Failed to save order.', 'error'); fetchCategories(); }
    };

    const handleGenerateQR = (category: MenuCategory | null) => { /* ... */ };
    
    const handleImportJson = async (file: File) => {
        if (!selectedRestaurantId) {
            showToast('Please select a restaurant before importing.', 'error');
            return;
        }

        setIsUploading(true);
        try {
            const jsonString = await file.text();
            const stats = await api.importMenuFromJson(jsonString, selectedRestaurantId);
            showToast(`Import successful! ${stats.itemsCreated} items created, ${stats.itemsUpdated} updated. ${stats.categoriesCreated} categories & ${stats.subcategoriesCreated} subcategories created.`, 'success');
            // Refresh data after import
            await fetchCategories();
        } catch (error) {
            console.error(error);
            showToast(error instanceof Error ? `Import failed: ${error.message}` : 'Import failed due to an unknown error.', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    const handleExportJson = () => { /* ... */ };

    const renderContent = () => {
        if (loading && categories.length === 0) return <div className="text-center py-10"><LoadingSpinner /></div>;
        if (!selectedRestaurantId) {
            return (
                <div className="text-center py-20 bg-white rounded-lg shadow-md border border-slate-200">
                    <p className="text-slate-500">Please select a property and restaurant to manage categories.</p>
                </div>
            );
        }

        return (
            <CategoryList
                categories={categories}
                subcategoriesMap={subcategoriesMap}
                expandedCategories={expandedCategories}
                onAddCategory={() => { setEditingCategory(null); setCategoryModalOpen(true); }}
                onEditCategory={(cat) => { setEditingCategory(cat); setCategoryModalOpen(true); }}
                onDeleteCategory={handleDeleteCategory}
                onSelectCategory={(cat) => onNavigateToMenuItems({ propertyId: selectedPropertyId, restaurantId: selectedRestaurantId, categoryId: cat.id })}
                onAddItemToCategory={(cat) => onNavigateToMenuItems({ propertyId: selectedPropertyId, restaurantId: selectedRestaurantId, categoryId: cat.id })}
                onReorderCategories={handleReorderCategories}
                onGenerateQR={handleGenerateQR}
                isUploading={isUploading}
                onImportJson={handleImportJson}
                onExportJson={handleExportJson}
                onToggleExpand={handleToggleExpand}
                onAddSubCategory={handleOpenAddSubCategoryModal}
                onEditSubCategory={handleOpenEditSubCategoryModal}
                onDeleteSubCategory={handleDeleteSubCategory}
                onViewSubCategoryItems={(sc) => onNavigateToMenuItems({ propertyId: selectedPropertyId, restaurantId: selectedRestaurantId, categoryId: sc.categoryId, subCategoryId: sc.id })}
            />
        );
    };

    return (
        <div className="space-y-6">
             <div className="bg-white p-4 rounded-lg shadow-md border border-slate-200">
                <h2 className="text-xl font-bold text-slate-700 mb-4">Select Menu</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select
                        id="property-select"
                        value={selectedPropertyId}
                        onChange={(e) => setSelectedPropertyId(e.target.value)}
                        disabled={!isSuperAdmin}
                        className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-slate-50 disabled:cursor-not-allowed"
                    >
                        <option value="" disabled>Select a property</option>
                        {visibleProperties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <select
                        id="restaurant-select"
                        value={selectedRestaurantId}
                        onChange={(e) => setSelectedRestaurantId(e.target.value)}
                        disabled={!selectedPropertyId || restaurantsForSelectedProperty.length === 0}
                        className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-slate-50"
                    >
                        <option value="" disabled>Select a restaurant</option>
                        {restaurantsForSelectedProperty.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                </div>
            </div>

            {renderContent()}

            <CategoryModal
                isOpen={isCategoryModalOpen}
                onClose={() => setCategoryModalOpen(false)}
                onSubmit={handleSaveCategory}
                initialData={editingCategory}
            />
            
            {currentCategoryForModal && (
                <SubCategoryModal
                    isOpen={isSubCategoryModalOpen}
                    onClose={() => { setSubCategoryModalOpen(false); setCurrentCategoryForModal(null); }}
                    onSubmit={handleSaveSubCategory}
                    initialData={editingSubCategory}
                    parentCategoryName={currentCategoryForModal.name}
                />
            )}

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={() => { deleteAction?.(); setConfirmModalOpen(false); }}
                title="Confirm Deletion"
                message={confirmMessage}
            />

            {qrCodeData && (
                 <QRCodeModal
                    isOpen={isQRCodeModalOpen}
                    onClose={() => setQRCodeModalOpen(false)}
                    url={qrCodeData.url}
                    title={qrCodeData.title}
                />
            )}
        </div>
    );
};

export default CategoriesPage;
