import React, { useState, useEffect } from 'react';
import { ModifierGroup } from '../types';
import { XIcon } from './Icons';

interface ModifierGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<ModifierGroup, 'id' | 'restaurantId'>) => void;
    initialData: ModifierGroup | null;
}

const ModifierGroupModal: React.FC<ModifierGroupModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [name, setName] = useState('');
    const [minSelection, setMinSelection] = useState(0);
    const [maxSelection, setMaxSelection] = useState(1);
    const [error, setError] = useState('');

    useEffect(() => {
        setError('');
        if (initialData) {
            setName(initialData.name);
            setMinSelection(initialData.minSelection);
            setMaxSelection(initialData.maxSelection);
        } else {
            setName('');
            setMinSelection(0);
            setMaxSelection(1);
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (minSelection > maxSelection) {
            setError('Minimum selections cannot be greater than maximum selections.');
            return;
        }
        setError('');
        onSubmit({ name, minSelection, maxSelection });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b border-slate-200">
                    <h3 className="text-xl font-semibold">{initialData ? 'Edit Modifier Group' : 'Add New Modifier Group'}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Group Name</label>
                            <input
                                id="name" type="text" value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="minSelection" className="block text-sm font-medium text-slate-700">Min Selections</label>
                                <input
                                    id="minSelection" type="number" value={minSelection}
                                    onChange={(e) => setMinSelection(parseInt(e.target.value, 10))}
                                    min="0"
                                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500"
                                    required
                                />
                            </div>
                             <div>
                                <label htmlFor="maxSelection" className="block text-sm font-medium text-slate-700">Max Selections</label>
                                <input
                                    id="maxSelection" type="number" value={maxSelection}
                                    onChange={(e) => setMaxSelection(parseInt(e.target.value, 10))}
                                    min="1"
                                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500"
                                    required
                                />
                            </div>
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                    </div>
                    <div className="bg-slate-50 p-4 flex justify-end space-x-2 rounded-b-lg">
                        <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none">
                            Cancel
                        </button>
                        <button type="submit" className="bg-primary-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-700 focus:outline-none">
                            Save Group
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModifierGroupModal;
