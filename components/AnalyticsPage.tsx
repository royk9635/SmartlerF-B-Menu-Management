import React, { useState, useEffect, useMemo } from 'react';
import { Property, Restaurant, MenuCategory, MenuItem, SpecialType, User, UserRole } from '../types';
import * as api from '../services/supabaseService';
import { LoadingSpinner } from './LoadingSpinner';
import StatCard from './StatCard';
import CategoryBarChart from './CategoryBarChart';
import SpecialTypesBarChart from './SpecialTypesBarChart';

interface AnalyticsPageProps {
    showToast: (message: string, type: 'success' | 'error') => void;
    currentUser: User;
}

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ showToast, currentUser }) => {
    // Full dataset state
    const [allProperties, setAllProperties] = useState<Property[]>([]);
    const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);
    const [allCategories, setAllCategories] = useState<MenuCategory[]>([]);
    const [allItems, setAllItems] = useState<MenuItem[]>([]);
    
    // Filter state
    const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
    const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('');
    
    const [loading, setLoading] = useState(true);
    const isSuperAdmin = currentUser.role === UserRole.SUPERADMIN;

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                const [properties, restaurants, categories, items] = await Promise.all([
                    api.getProperties('tenant-123'),
                    api.getAllRestaurants(),
                    api.getAllCategories(),
                    api.getAllMenuItems(),
                ]);
                setAllProperties(properties);
                setAllRestaurants(restaurants);
                setAllCategories(categories);
                setAllItems(items);
                 if (!isSuperAdmin) {
                    setSelectedPropertyId(currentUser.propertyId || '');
                }
            } catch (error) {
                showToast('Failed to load analytics data.', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, [showToast, isSuperAdmin, currentUser.propertyId]);

    const visibleProperties = useMemo(() => {
        if (isSuperAdmin) return allProperties;
        if (!currentUser || !currentUser.propertyId) return [];
        return allProperties.filter(p => p && p.id === currentUser.propertyId);
    }, [allProperties, currentUser, isSuperAdmin]);


    const filteredData = useMemo(() => {
        let properties = isSuperAdmin ? allProperties : (currentUser?.propertyId ? allProperties.filter(p => p && p.id === currentUser.propertyId) : []);
        let restaurants = isSuperAdmin ? allRestaurants : (currentUser?.propertyId ? allRestaurants.filter(r => r && r.propertyId === currentUser.propertyId) : []);
        let categories = allCategories;
        let items = allItems;
        
        const userRestaurantIds = new Set(restaurants.map(r => r.id));
        categories = allCategories.filter(c => userRestaurantIds.has(c.restaurantId));
        const userCategoryIds = new Set(categories.map(c => c.id));
        items = allItems.filter(i => userCategoryIds.has(i.categoryId));
        
        if (selectedPropertyId) {
            restaurants = allRestaurants.filter(r => r.propertyId === selectedPropertyId);
            const restaurantIds = new Set(restaurants.map(r => r.id));
            categories = allCategories.filter(c => restaurantIds.has(c.restaurantId));
            const categoryIds = new Set(categories.map(c => c.id));
            items = allItems.filter(i => categoryIds.has(i.categoryId));
        }

        if (selectedRestaurantId) {
            categories = allCategories.filter(c => c.restaurantId === selectedRestaurantId);
            const categoryIds = new Set(categories.map(c => c.id));
            items = allItems.filter(i => categoryIds.has(i.categoryId));
        }

        return { restaurants, categories, items };
    }, [selectedPropertyId, selectedRestaurantId, allProperties, allRestaurants, allCategories, allItems, currentUser, isSuperAdmin]);

    const stats = useMemo(() => {
        const { categories, items } = filteredData;
        return {
            totalItems: items.length,
            activeCategories: categories.filter(c => c.activeFlag).length,
            bogoItems: items.filter(i => i.bogo).length,
            soldOutItems: items.filter(i => i.soldOut).length,
        };
    }, [filteredData]);

    const categoryItemData = useMemo(() => {
        if (!selectedRestaurantId) return [];
        const itemsForRestaurant = filteredData.items;
        const categoriesForRestaurant = filteredData.categories;
        
        const counts = new Map<string, number>();
        itemsForRestaurant.forEach(item => {
            counts.set(item.categoryId, (counts.get(item.categoryId) || 0) + 1);
        });

        return categoriesForRestaurant
            .map(cat => ({
                name: cat.name,
                count: counts.get(cat.id) || 0
            }))
            .filter(d => d.count > 0)
            .sort((a, b) => b.count - a.count);
    }, [selectedRestaurantId, filteredData]);
    
    const specialTypesData = useMemo(() => {
         const counts = filteredData.items.reduce((acc, item) => {
            const type = item.specialType || SpecialType.NONE;
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {} as Record<SpecialType, number>);

        return Object.entries(counts)
            .map(([name, count]) => ({ name, count }))
            .sort((a,b) => b.count - a.count);

    }, [filteredData.items]);

    const restaurantsForFilter = useMemo(() => {
        if (!selectedPropertyId) return !isSuperAdmin ? filteredData.restaurants : [];
        return allRestaurants.filter(r => r.propertyId === selectedPropertyId);
    }, [selectedPropertyId, allRestaurants, isSuperAdmin, filteredData.restaurants]);


    if (loading) {
        return <div className="flex justify-center items-center h-96"><LoadingSpinner /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-md border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-slate-700">Analytics Dashboard</h2>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select
                        id="property-select"
                        value={selectedPropertyId}
                        onChange={(e) => {
                            setSelectedPropertyId(e.target.value);
                            setSelectedRestaurantId('');
                        }}
                        disabled={!isSuperAdmin}
                        className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-slate-50 disabled:cursor-not-allowed"
                    >
                        <option value="">{isSuperAdmin ? 'All Properties' : visibleProperties[0]?.name || 'Assigned Property'}</option>
                         {isSuperAdmin && visibleProperties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <select
                        id="restaurant-select"
                        value={selectedRestaurantId}
                        onChange={(e) => setSelectedRestaurantId(e.target.value)}
                        disabled={!selectedPropertyId && isSuperAdmin && restaurantsForFilter.length === 0}
                        className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-slate-50"
                    >
                        <option value="">All Restaurants in Property</option>
                        {restaurantsForFilter.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Menu Items" value={stats.totalItems} />
                <StatCard title="Active Categories" value={stats.activeCategories} />
                <StatCard title="Items on BOGO" value={stats.bogoItems} />
                <StatCard title="Sold Out Items" value={stats.soldOutItems} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
                     <h3 className="text-lg font-semibold text-slate-800 mb-4">Items per Category</h3>
                    {selectedRestaurantId ? (
                        categoryItemData.length > 0 ? (
                             <CategoryBarChart data={categoryItemData} />
                        ) : <p className="text-slate-500 text-center py-10">No items found for this restaurant's categories.</p>
                    ) : <p className="text-slate-500 text-center py-10">Select a restaurant to see the category breakdown.</p>}
                </div>
                 <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
                     <h3 className="text-lg font-semibold text-slate-800 mb-4">Dietary Special Types</h3>
                    {filteredData.items.length > 0 ? (
                        <SpecialTypesBarChart data={specialTypesData} />
                    ) : <p className="text-slate-500 text-center py-10">No items with special types found.</p>}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
