import React from 'react';
import { Property, Restaurant, MenuCategory } from '../types';

interface BreadcrumbProps {
    property: Property | null;
    restaurant: Restaurant | null;
    category: MenuCategory | null;
    onPropertyClick: () => void;
    onRestaurantClick: () => void;
    onCategoryClick: () => void;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ property, restaurant, category, onPropertyClick, onRestaurantClick, onCategoryClick }) => {
    
    const Chevron = () => <span className="mx-2 text-slate-400">/</span>;
    
    const renderRestaurantCrumb = () => {
        if (!restaurant) return null;
        const isClickable = !!category;
        return (
            <>
                <Chevron />
                {isClickable ? (
                    <button onClick={onRestaurantClick} className="text-primary-600 hover:underline">{restaurant.name}</button>
                ) : (
                    <span className="text-slate-500 font-semibold">{restaurant.name}</span>
                )}
            </>
        );
    };

    const renderCategoryCrumb = () => {
        if (!category) return null;
        return (
            <>
                <Chevron />
                <span className="text-slate-500 font-semibold">{category.name}</span>
            </>
        );
    };


    const renderPropertyCrumb = () => {
        if (!property) {
             return <span className="text-slate-500 font-semibold">Properties</span>;
        }
        const isClickable = !!restaurant || !!category;
         return (
             <>
                {isClickable ? (
                    <button onClick={onPropertyClick} className="text-primary-600 hover:underline">Properties</button>
                ) : (
                    <span className="text-slate-500 font-semibold">Properties</span>
                )}
                <Chevron />
                 {restaurant ? (
                    <button onClick={onPropertyClick} className="text-primary-600 hover:underline">{property.name}</button>
                ) : (
                    <span className="text-slate-500 font-semibold">{property.name}</span>
                )}
             </>
         );

    }

    if (!property) {
        return null; // Don't show breadcrumb on the top-level property list
    }

    return (
        <nav className="mb-6 text-sm" aria-label="Breadcrumb">
            <button onClick={onPropertyClick} className="text-primary-600 hover:underline">Properties</button>
            {property && (
                <>
                    <Chevron />
                    {restaurant ? (
                        <button onClick={onRestaurantClick} className="text-primary-600 hover:underline">{property.name}</button>
                    ) : (
                        <span className="text-slate-500 font-semibold">{property.name}</span>
                    )}
                </>
            )}
             {restaurant && (
                <>
                    <Chevron />
                    {category ? (
                        <button onClick={onCategoryClick} className="text-primary-600 hover:underline">{restaurant.name}</button>
                    ) : (
                        <span className="text-slate-500 font-semibold">{restaurant.name}</span>
                    )}
                </>
            )}
            {category && (
                <>
                    <Chevron />
                    <span className="text-slate-500 font-semibold">{category.name}</span>
                </>
            )}
        </nav>
    );
};

export default Breadcrumb;
