import React, { useState, useEffect } from 'react';
import { ModifierItem } from '../types';
import { XIcon } from './Icons';

interface ModifierItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<ModifierItem, 'id' | 'modifierGroupId'>) => void;
    initialData: ModifierItem | null;
    parentGroupName: string;
}

const ModifierItemModal: React.FC<ModifierItemModalProps> = ({ isOpen, onClose, onSubmit, initialData, parentGroupName }) => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setPrice(initialData.price);
        } else {
            setName('');
            setPrice(0);
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ name, price });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b border-slate-200">
                    <h3 className="text-xl font-semibold">{initialData ? 'Edit Modifier Item' : `Add Item to ${parentGroupName}`}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Item Name</label>
                            <input
                                id="name" type="text" value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-slate-700">Additional Price</label>
                            <input
                                id="price" type="number" value={price}
                                onChange={(e) => setPrice(parseFloat(e.target.value))}
                                step="0.01" min="0"
                                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500"
                                required
                            />
                        </div>
                    </div>
                    <div className="bg-slate-50 p-4 flex justify-end space-x-2 rounded-b-lg">
                        <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none">
                            Cancel
                        </button>
                        <button type="submit" className="bg-primary-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-700 focus:outline-none">
                            Save Item
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModifierItemModal;
