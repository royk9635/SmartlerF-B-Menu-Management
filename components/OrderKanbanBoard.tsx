import React, { useMemo } from 'react';
import { LiveOrder, OrderStatus, MenuItem } from '../types';
import OrderCard from './OrderCard';

interface OrderKanbanBoardProps {
    orders: LiveOrder[];
    menuItemMap: Map<string, MenuItem>;
    onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
}

const KanbanColumn: React.FC<{
    title: string;
    status: OrderStatus;
    orders: LiveOrder[];
    menuItemMap: Map<string, MenuItem>;
    onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
    className: string;
}> = ({ title, status, orders, menuItemMap, onUpdateStatus, className }) => {
    return (
        <div className={`flex-1 rounded-lg p-3 ${className} flex flex-col`}>
            <h2 className="text-xl font-bold text-slate-800 mb-4 px-2">{title} ({orders.length})</h2>
            <div className="flex-grow overflow-y-auto space-y-4 p-1">
                {orders.length > 0 ? (
                    orders.map(order => (
                        <OrderCard 
                            key={order.id} 
                            order={order} 
                            menuItemMap={menuItemMap} 
                            onUpdateStatus={onUpdateStatus} 
                        />
                    ))
                ) : (
                    <div className="text-center text-slate-500 py-10">
                        No orders in this stage.
                    </div>
                )}
            </div>
        </div>
    );
};

const OrderKanbanBoard: React.FC<OrderKanbanBoardProps> = ({ orders, menuItemMap, onUpdateStatus }) => {
    const sortedOrders = useMemo(() => {
        return [...orders].sort((a, b) => new Date(a.placedAt).getTime() - new Date(b.placedAt).getTime());
    }, [orders]);
    
    const newOrders = sortedOrders.filter(o => o.status === OrderStatus.NEW);
    const preparingOrders = sortedOrders.filter(o => o.status === OrderStatus.PREPARING);
    const readyOrders = sortedOrders.filter(o => o.status === OrderStatus.READY);

    return (
        <div className="flex-grow flex gap-6 overflow-x-auto">
            <KanbanColumn
                title="New Orders"
                status={OrderStatus.NEW}
                orders={newOrders}
                menuItemMap={menuItemMap}
                onUpdateStatus={onUpdateStatus}
                className="bg-sky-100"
            />
            <KanbanColumn
                title="In Preparation"
                status={OrderStatus.PREPARING}
                orders={preparingOrders}
                menuItemMap={menuItemMap}
                onUpdateStatus={onUpdateStatus}
                className="bg-amber-100"
            />
            <KanbanColumn
                title="Ready for Pickup"
                status={OrderStatus.READY}
                orders={readyOrders}
                menuItemMap={menuItemMap}
                onUpdateStatus={onUpdateStatus}
                className="bg-green-100"
            />
        </div>
    );
};

export default OrderKanbanBoard;
