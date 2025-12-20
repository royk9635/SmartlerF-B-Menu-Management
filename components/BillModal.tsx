import React from 'react';
import { Sale, MenuItem } from '../types';
import { XIcon } from './Icons';

interface BillModalProps {
    isOpen: boolean;
    onClose: () => void;
    sale: Sale | null;
    menuItemMap: Map<string, MenuItem>;
}

const BillModal: React.FC<BillModalProps> = ({ isOpen, onClose, sale, menuItemMap }) => {
    if (!isOpen || !sale) return null;
    
    const saleDate = new Date(sale.saleDate);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md transform transition-all">
                <div className="flex justify-between items-center p-4 border-b border-slate-200">
                    <h3 className="text-xl font-semibold text-slate-800">Order Details</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <p className="text-sm text-slate-500">Order ID</p>
                        <p className="font-mono text-slate-800">{sale.id}</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Date & Time</p>
                        <p className="font-medium text-slate-800">{saleDate.toLocaleString()}</p>
                    </div>

                    <div className="border-t border-slate-200 pt-4">
                        <h4 className="font-semibold text-slate-700 mb-2">Items</h4>
                        <ul className="divide-y divide-slate-200">
                            {sale.items.map((item, index) => {
                                const menuItem = menuItemMap.get(item.menuItemId);
                                const subtotal = item.quantity * item.price;
                                return (
                                     <li key={`${item.menuItemId}-${index}`} className="py-2 flex justify-between items-center">
                                        <div>
                                            <p className="font-medium text-slate-800">{menuItem?.name || 'Unknown Item'}</p>
                                            <p className="text-sm text-slate-500">{item.quantity} x ${item.price.toFixed(2)}</p>
                                        </div>
                                        <p className="font-mono text-slate-800">${subtotal.toFixed(2)}</p>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    <div className="border-t-2 border-dashed border-slate-300 pt-4 flex justify-between items-center">
                        <p className="text-lg font-bold text-slate-800">Total</p>
                        <p className="text-lg font-bold font-mono text-slate-800">${sale.totalAmount.toFixed(2)}</p>
                    </div>

                </div>
                <div className="bg-slate-50 p-4 flex justify-end rounded-b-lg">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BillModal;
