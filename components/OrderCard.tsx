import React, { useState, useEffect } from 'react';
import { LiveOrder, OrderStatus, MenuItem } from '../types';

interface OrderCardProps {
    order: LiveOrder;
    menuItemMap: Map<string, MenuItem>;
    onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, menuItemMap, onUpdateStatus }) => {
    const [timeAgo, setTimeAgo] = useState('');

    useEffect(() => {
        const calculateTimeAgo = () => {
            const now = new Date();
            const placedAt = new Date(order.placedAt);
            const diffSeconds = Math.round((now.getTime() - placedAt.getTime()) / 1000);

            if (diffSeconds < 60) {
                setTimeAgo(`${diffSeconds}s ago`);
            } else {
                const diffMinutes = Math.round(diffSeconds / 60);
                setTimeAgo(`${diffMinutes}m ago`);
            }
        };

        calculateTimeAgo();
        const intervalId = setInterval(calculateTimeAgo, 15000); // Update every 15 seconds

        return () => clearInterval(intervalId);
    }, [order.placedAt]);

    const ActionButton: React.FC<{ text: string, onClick: () => void, className: string }> = ({ text, onClick, className }) => (
        <button
            onClick={onClick}
            className={`w-full py-2 px-4 rounded-md font-semibold text-white shadow-sm transition duration-300 ${className}`}
        >
            {text}
        </button>
    );

    const renderAction = () => {
        switch (order.status) {
            case OrderStatus.NEW:
                return <ActionButton text="Accept Order" onClick={() => onUpdateStatus(order.id, OrderStatus.PREPARING)} className="bg-sky-500 hover:bg-sky-600" />;
            case OrderStatus.PREPARING:
                return <ActionButton text="Mark as Ready" onClick={() => onUpdateStatus(order.id, OrderStatus.READY)} className="bg-amber-500 hover:bg-amber-600" />;
            case OrderStatus.READY:
                return <ActionButton text="Complete Order" onClick={() => onUpdateStatus(order.id, OrderStatus.COMPLETED)} className="bg-green-500 hover:bg-green-600" />;
            default:
                return null;
        }
    };
    
    const isNew = order.status === OrderStatus.NEW && (new Date().getTime() - new Date(order.placedAt).getTime()) < 60000;

    return (
        <div className="bg-white rounded-lg shadow-md border border-slate-200 flex flex-col animate-fade-in-up">
            <div className="p-4 border-b border-slate-200">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800">Table {order.tableNumber}</h3>
                    <div className="flex items-center space-x-2">
                        {isNew && <span className="text-xs font-bold text-red-600 animate-pulse">NEW!</span>}
                        <span className="text-sm font-medium text-slate-500">{timeAgo}</span>
                    </div>
                </div>
                <p className="text-xs text-slate-400 font-mono">ID: ...{order.id.slice(-6)}</p>
            </div>
            <div className="p-4 flex-grow max-h-48 overflow-y-auto">
                <ul className="space-y-2 text-sm">
                    {order.items.map((item, index) => {
                        const menuItem = menuItemMap.get(item.menuItemId);
                        return (
                            <li key={index} className="flex justify-between">
                                <span className="font-medium text-slate-700">{item.quantity} x {menuItem?.name || 'Unknown Item'}</span>
                                <span className="font-mono text-slate-600">₹{(item.quantity * item.price).toFixed(2)}</span>
                            </li>
                        );
                    })}
                </ul>
            </div>
            <div className="p-4 bg-slate-50 rounded-b-lg">
                {renderAction()}
            </div>
             <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default OrderCard;
