import React, { useState, useEffect, useMemo } from 'react';
import { MenuItem, BulkAction, Currency } from '../types';
import { XIcon } from './Icons';

interface BulkActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    items: MenuItem[];
    onApply: (itemIds: string[], action: BulkAction, payload?: { currency?: Currency }) => void;
}

const BulkActionModal: React.FC<BulkActionModalProps> = ({ isOpen, onClose, items, onApply }) => {
    const [selectedAction, setSelectedAction] = useState<BulkAction | ''>('');
    const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
    const [targetCurrency, setTargetCurrency] = useState<Currency | ''>('');

    useEffect(() => {
        if (!isOpen) {
            setSelectedAction('');
            setSelectedItemIds(new Set());
            setTargetCurrency('');
        }
    }, [isOpen]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const allItemIds = new Set(items.map(item => item.id));
            setSelectedItemIds(allItemIds);
        } else {
            setSelectedItemIds(new Set());
        }
    };

    const handleSelectItem = (itemId: string) => {
        setSelectedItemIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }
            return newSet;
        });
    };

    const handleSubmit = () => {
        if (!canApply) return;

        const payload = selectedAction === BulkAction.CHANGE_CURRENCY 
            ? { currency: targetCurrency as Currency } 
            : undefined;
            
        onApply(Array.from(selectedItemIds), selectedAction as BulkAction, payload);
    };

    const isAllSelected = useMemo(() => {
        return items.length > 0 && selectedItemIds.size === items.length;
    }, [items, selectedItemIds]);
    
    const canApply = useMemo(() => {
        if (selectedItemIds.size === 0 || !selectedAction) {
            return false;
        }
        if (selectedAction === BulkAction.CHANGE_CURRENCY && !targetCurrency) {
            return false;
        }
        return true;
    }, [selectedAction, selectedItemIds, targetCurrency]);


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-slate-200">
                    <h3 className="text-xl font-semibold">Bulk Actions</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>
                
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                        <div>
                            <label htmlFor="bulk-action" className="block text-sm font-medium text-slate-700">Select Action</label>
                            <select
                                id="bulk-action"
                                value={selectedAction}
                                onChange={(e) => setSelectedAction(e.target.value as BulkAction)}
                                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            >
                                <option value="" disabled>Choose an action</option>
                                <option value={BulkAction.ENABLE_ITEMS}>Enable Items</option>
                                <option value={BulkAction.DISABLE_ITEMS}>Disable Items</option>
                                <option value={BulkAction.MARK_SOLD_OUT}>Mark as Sold Out</option>
                                <option value={BulkAction.ENABLE_BOGO}>Enable BOGO Offer</option>
                                <option value={BulkAction.DISABLE_BOGO}>Disable BOGO Offer</option>
                                <option value={BulkAction.CHANGE_CURRENCY}>Change Currency</option>
                            </select>
                        </div>
                        {selectedAction === BulkAction.CHANGE_CURRENCY && (
                             <div>
                                <label htmlFor="target-currency" className="block text-sm font-medium text-slate-700">Target Currency</label>
                                <select
                                    id="target-currency"
                                    value={targetCurrency}
                                    onChange={(e) => setTargetCurrency(e.target.value as Currency)}
                                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                >
                                    <option value="" disabled>Select currency</option>
                                    {Object.values(Currency).map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        )}
                         <div className="flex items-center pb-2 justify-self-end">
                            <input
                                id="select-all"
                                type="checkbox"
                                checked={isAllSelected}
                                onChange={handleSelectAll}
                                className="h-4 w-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
                            />
                            <label htmlFor="select-all" className="ml-2 block text-sm text-slate-900">
                                Select All ({items.length})
                            </label>
                        </div>
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto border-t border-b border-slate-200">
                    <ul className="divide-y divide-slate-200">
                        {items.map(item => (
                            <li key={item.id} className="p-4 flex items-center space-x-4">
                                <input
                                    type="checkbox"
                                    checked={selectedItemIds.has(item.id)}
                                    onChange={() => handleSelectItem(item.id)}
                                    className="h-4 w-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
                                />
                                <img src={item.imageUrl} alt={item.name} className="h-10 w-10 rounded-md object-cover" />
                                <div className="flex-grow">
                                    <p className="font-medium text-slate-800">{item.name}</p>
                                    <p className="text-sm text-slate-500">{item.price.toFixed(2)} {item.currency}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                     {item.availabilityFlag ? 
                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Available</span> 
                                        : <span className="px-2 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-800">Disabled</span>
                                     }
                                     {item.soldOut && <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Sold Out</span>}
                                     {item.bogo && <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">BOGO</span>}
                                </div>
                            </li>
                        ))}
                         {items.length === 0 && (
                            <li className="p-4 text-center text-slate-500">
                                No items in this category.
                            </li>
                        )}
                    </ul>
                </div>

                <div className="bg-slate-50 p-4 flex justify-between items-center rounded-b-lg">
                    <p className="text-sm font-medium text-slate-700">{selectedItemIds.size} items selected</p>
                    <div className="flex space-x-2">
                        <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                            Cancel
                        </button>
                        <button 
                            type="button" 
                            onClick={handleSubmit} 
                            disabled={!canApply}
                            className="bg-primary-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300 disabled:cursor-not-allowed"
                        >
                            Apply Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BulkActionModal;
