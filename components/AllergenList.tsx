import React from 'react';
import { Allergen } from '../types';
import { PlusIcon, PencilIcon, TrashIcon } from './Icons';

interface AllergenListProps {
    allergens: Allergen[];
    onAddAllergen: () => void;
    onEditAllergen: (allergen: Allergen) => void;
    onDeleteAllergen: (allergen: Allergen) => void;
}

const AllergenList: React.FC<AllergenListProps> = ({ allergens, onAddAllergen, onEditAllergen, onDeleteAllergen }) => {
    return (
        <div className="bg-white shadow-md rounded-lg border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-700">Allergen List</h2>
                <button
                    onClick={onAddAllergen}
                    className="flex items-center bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-primary-700 transition duration-300"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Allergen
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
                        {allergens.map(allergen => (
                            <tr key={allergen.id} className="border-b border-slate-200 hover:bg-slate-50">
                                <td className="py-3 px-4 font-medium">{allergen.name}</td>
                                <td className="py-3 px-4 text-center">
                                    <div className="flex items-center justify-center space-x-2">
                                        <button onClick={() => onEditAllergen(allergen)} className="text-amber-500 hover:text-amber-700 p-2 rounded-full hover:bg-amber-100 transition" title="Edit Allergen">
                                            <PencilIcon className="h-5 w-5"/>
                                        </button>
                                        <button onClick={() => onDeleteAllergen(allergen)} className="text-rose-500 hover:text-rose-700 p-2 rounded-full hover:bg-rose-100 transition" title="Delete Allergen">
                                            <TrashIcon className="h-5 w-5"/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {allergens.length === 0 && (
                <div className="text-center py-10 text-slate-500">
                    <p>No allergens found. Click "Add Allergen" to get started.</p>
                </div>
            )}
        </div>
    );
};

export default AllergenList;
