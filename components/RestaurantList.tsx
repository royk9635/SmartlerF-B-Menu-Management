import React from 'react';
import { Restaurant } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from './Icons';

interface RestaurantListProps {
    restaurants: Restaurant[];
    onAddRestaurant: () => void;
    onEditRestaurant: (restaurant: Restaurant) => void;
    onDeleteRestaurant: (restaurantId: string) => void;
    onSelectRestaurant: (restaurant: Restaurant) => void;
}

const RestaurantList: React.FC<RestaurantListProps> = ({ restaurants, onAddRestaurant, onEditRestaurant, onDeleteRestaurant, onSelectRestaurant }) => {
    return (
        <div className="bg-white shadow-md rounded-lg border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-700">Restaurants</h2>
                 <button
                    onClick={onAddRestaurant}
                    className="flex items-center bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-primary-700 transition duration-300"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Restaurant
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600">Name</th>
                            <th className="text-center py-3 px-4 uppercase font-semibold text-sm text-slate-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-slate-700">
                        {restaurants.map(restaurant => (
                            <tr key={restaurant.id} className="border-b border-slate-200">
                                <td className="py-3 px-4 font-medium">{restaurant.name}</td>
                                <td className="py-3 px-4 text-center">
                                    <div className="flex items-center justify-center space-x-2">
                                        <button onClick={() => onSelectRestaurant(restaurant)} className="text-sky-500 hover:text-sky-700 p-2 rounded-full hover:bg-sky-100 transition" title="View Menu">
                                            <EyeIcon className="h-5 w-5"/>
                                        </button>
                                        <button onClick={() => onEditRestaurant(restaurant)} className="text-amber-500 hover:text-amber-700 p-2 rounded-full hover:bg-amber-100 transition" title="Edit Restaurant">
                                            <PencilIcon className="h-5 w-5"/>
                                        </button>
                                        <button onClick={() => onDeleteRestaurant(restaurant.id)} className="text-rose-500 hover:text-rose-700 p-2 rounded-full hover:bg-rose-100 transition" title="Delete Restaurant">
                                            <TrashIcon className="h-5 w-5"/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {restaurants.length === 0 && (
                <div className="text-center py-10 text-slate-500">
                    <p>No restaurants found for this property. Click "Add Restaurant" to create one.</p>
                </div>
            )}
        </div>
    );
};

export default RestaurantList;
