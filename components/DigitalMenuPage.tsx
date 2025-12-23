import React, { useState, useEffect, useCallback } from 'react';
import * as api from '../services/supabaseService';
import { PublicMenu, MenuItem, SpecialType } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { useTableContext } from '../contexts/TableContext';

interface DigitalMenuPageProps {
    restaurantId: string;
}

const SpecialTypeBadge: React.FC<{ type: SpecialType }> = ({ type }) => {
    if (type === SpecialType.NONE) return null;

    const styles: { [key in SpecialType]?: { bg: string, text: string, border: string } } = {
        [SpecialType.VEG]: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
        [SpecialType.VEGAN]: { bg: 'bg-lime-100', text: 'text-lime-800', border: 'border-lime-300' },
        [SpecialType.NON_VEG]: { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300' },
        [SpecialType.CHEF_SPECIAL]: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
    };

    const style = styles[type];
    if (!style) return null;

    return (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${style.bg} ${style.text} ${style.border}`}>
            {type}
        </span>
    );
};


const DigitalMenuPage: React.FC<DigitalMenuPageProps> = ({ restaurantId }) => {
    const { tableNumber } = useTableContext();
    const [menuData, setMenuData] = useState<PublicMenu | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const data = await api.getPublicMenu(restaurantId);
            setMenuData(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load menu data.');
        } finally {
            setLoading(false);
        }
    }, [restaurantId]);

    useEffect(() => {
        fetchData(); // Initial fetch
        const intervalId = setInterval(fetchData, 30000); // Poll every 30 seconds
        return () => clearInterval(intervalId); // Cleanup on unmount
    }, [fetchData]);

    if (loading) {
        return (
            <div className="bg-white min-h-screen w-full flex flex-col items-center justify-center text-slate-800">
                <LoadingSpinner />
                <p className="mt-4 text-xl">Loading Menu...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-rose-50 min-h-screen w-full flex flex-col items-center justify-center text-rose-900 p-8">
                <h1 className="text-3xl font-bold">Error Loading Menu</h1>
                <p className="mt-2 text-rose-700">{error}</p>
                <p className="mt-4 text-sm text-rose-600">The display will attempt to reload automatically.</p>
            </div>
        );
    }

    if (!menuData) {
        return null;
    }
    
    // Split categories into two columns for display
    const midpoint = Math.ceil(menuData.categories.length / 2);
    const column1Categories = menuData.categories.slice(0, midpoint);
    const column2Categories = menuData.categories.slice(midpoint);

    const animationStyles = `
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .fade-in-up {
            animation: fadeInUp 0.6s ease-out forwards;
        }
        .fade-in {
            animation: fadeIn 0.5s ease-out forwards;
        }
    `;

    return (
        <div className="bg-white min-h-screen font-sans text-slate-800 p-8">
            <style>{animationStyles}</style>
            <header className="text-center mb-12 opacity-0 fade-in-up" style={{ animationDelay: '0ms' }}>
                <h1 className="text-6xl font-bold tracking-tight text-slate-900">{menuData.restaurant.name}</h1>
                {tableNumber && (
                    <div className="mt-4 inline-block">
                        <span className="bg-primary-600 text-white px-6 py-2 rounded-full text-xl font-semibold shadow-lg">
                            Table {tableNumber}
                        </span>
                    </div>
                )}
            </header>
            <main className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                {/* Column 1 */}
                <div className="space-y-10">
                    {column1Categories.map((category, catIndex) => {
                        const categoryDelay = 200 + (catIndex * 250);
                        let itemCounter = 0;
                        return (
                            <section key={category.id} aria-labelledby={`category-${category.id}`} className="opacity-0 fade-in-up" style={{ animationDelay: `${categoryDelay}ms` }}>
                                <h2 id={`category-${category.id}`} className="text-4xl font-bold text-slate-900 border-b-2 border-slate-200 pb-2 mb-6">{category.name}</h2>
                                <div className="space-y-6">
                                    {category.items.map(item => <MenuItemDisplay key={item.id} item={item} style={{ animationDelay: `${categoryDelay + (++itemCounter * 80)}ms` }} />)}
                                    {category.subcategories.map(subcat => {
                                        const subcatDelay = categoryDelay + (++itemCounter * 80);
                                        return(
                                            <div key={subcat.id} className="opacity-0 fade-in-up" style={{ animationDelay: `${subcatDelay}ms` }}>
                                                <h3 className="text-2xl font-semibold text-slate-700 mt-8 mb-4">{subcat.name}</h3>
                                                <div className="space-y-6 pl-4 border-l-2 border-slate-200">
                                                    {subcat.items.map(item => <MenuItemDisplay key={item.id} item={item} style={{ animationDelay: `${subcatDelay + (++itemCounter * 80)}ms` }} />)}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </section>
                        )
                    })}
                </div>
                {/* Column 2 */}
                <div className="space-y-10">
                     {column2Categories.map((category, catIndex) => {
                         const categoryDelay = 200 + (column1Categories.length * 250) + (catIndex * 250);
                         let itemCounter = 0;
                         return (
                            <section key={category.id} aria-labelledby={`category-${category.id}`} className="opacity-0 fade-in-up" style={{ animationDelay: `${categoryDelay}ms` }}>
                                <h2 id={`category-${category.id}`} className="text-4xl font-bold text-slate-900 border-b-2 border-slate-200 pb-2 mb-6">{category.name}</h2>
                                <div className="space-y-6">
                                    {category.items.map(item => <MenuItemDisplay key={item.id} item={item} style={{ animationDelay: `${categoryDelay + (++itemCounter * 80)}ms` }} />)}
                                    {category.subcategories.map(subcat => {
                                        const subcatDelay = categoryDelay + (++itemCounter * 80);
                                        return (
                                            <div key={subcat.id} className="opacity-0 fade-in-up" style={{ animationDelay: `${subcatDelay}ms` }}>
                                                <h3 className="text-2xl font-semibold text-slate-700 mt-8 mb-4">{subcat.name}</h3>
                                                <div className="space-y-6 pl-4 border-l-2 border-slate-200">
                                                    {subcat.items.map(item => <MenuItemDisplay key={item.id} item={item} style={{ animationDelay: `${subcatDelay + (++itemCounter * 80)}ms` }} />)}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </section>
                        )
                    })}
                </div>
            </main>
        </div>
    );
};

const MenuItemDisplay: React.FC<{ item: MenuItem, style: React.CSSProperties }> = ({ item, style }) => {
    return (
        <div 
            style={style} 
            className="opacity-0 fade-in transition-all duration-300 hover:scale-[1.03] hover:shadow-lg rounded-lg p-3 -m-3 hover:bg-slate-50 cursor-pointer"
        >
            <div className="flex justify-between items-start gap-4">
                <div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <h4 className="text-2xl font-bold text-slate-900">{item.name}</h4>
                        {item.specialType && <SpecialTypeBadge type={item.specialType} />}
                    </div>
                    {item.bogo && <p className="text-xs font-bold uppercase tracking-wider text-cyan-600">Buy One Get One</p>}
                    <p className="text-slate-600 mt-1">{item.description}</p>
                </div>
                <p className="text-2xl font-bold text-primary-600 whitespace-nowrap">{item.price.toFixed(2)}</p>
            </div>
        </div>
    );
};

export default DigitalMenuPage;
