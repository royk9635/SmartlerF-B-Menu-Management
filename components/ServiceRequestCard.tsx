import React, { useState, useEffect } from 'react';
import { ServiceRequest, ServiceRequestType } from '../types';

interface ServiceRequestCardProps {
    request: ServiceRequest;
    onAcknowledge: (id: string) => void;
    onComplete: (id: string) => void;
}

const getRequestTypeDisplay = (type: ServiceRequestType) => {
    const mapping = {
        waiter: { label: 'Call Waiter', icon: '🔔', color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-800' },
        water: { label: 'Request Water', icon: '💧', color: 'cyan', bgColor: 'bg-cyan-100', textColor: 'text-cyan-800' },
        bill: { label: 'Request Bill', icon: '💰', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-800' },
        assistance: { label: 'Need Assistance', icon: '❓', color: 'orange', bgColor: 'bg-orange-100', textColor: 'text-orange-800' },
        other: { label: 'Other', icon: '💬', color: 'purple', bgColor: 'bg-purple-100', textColor: 'text-purple-800' },
    };
    return mapping[type];
};

const getStatusDisplay = (status: ServiceRequestStatus) => {
    const mapping = {
        pending: { label: 'Pending', color: 'yellow', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
        acknowledged: { label: 'Acknowledged', color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-800' },
        completed: { label: 'Completed', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-800' },
    };
    return mapping[status];
};

const ServiceRequestCard: React.FC<ServiceRequestCardProps> = ({ request, onAcknowledge, onComplete }) => {
    const [timeAgo, setTimeAgo] = useState('');

    useEffect(() => {
        const calculateTimeAgo = () => {
            const now = new Date();
            const createdAt = new Date(request.createdAt);
            const diffSeconds = Math.round((now.getTime() - createdAt.getTime()) / 1000);

            if (diffSeconds < 60) {
                setTimeAgo(`${diffSeconds}s ago`);
            } else if (diffSeconds < 3600) {
                const diffMinutes = Math.round(diffSeconds / 60);
                setTimeAgo(`${diffMinutes}m ago`);
            } else {
                const diffHours = Math.round(diffSeconds / 3600);
                setTimeAgo(`${diffHours}h ago`);
            }
        };

        calculateTimeAgo();
        const intervalId = setInterval(calculateTimeAgo, 15000); // Update every 15 seconds

        return () => clearInterval(intervalId);
    }, [request.createdAt]);

    const typeDisplay = getRequestTypeDisplay(request.requestType);
    const statusDisplay = getStatusDisplay(request.status);

    const ActionButton: React.FC<{ text: string; onClick: () => void; className: string }> = ({ text, onClick, className }) => (
        <button
            onClick={onClick}
            className={`w-full py-2 px-4 rounded-md font-semibold text-white shadow-sm transition duration-300 ${className}`}
        >
            {text}
        </button>
    );

    const renderAction = () => {
        if (request.status === 'pending') {
            return (
                <div className="space-y-2">
                    <ActionButton 
                        text="Acknowledge" 
                        onClick={() => onAcknowledge(request.id)} 
                        className="bg-blue-500 hover:bg-blue-600" 
                    />
                    <ActionButton 
                        text="Complete" 
                        onClick={() => onComplete(request.id)} 
                        className="bg-green-500 hover:bg-green-600" 
                    />
                </div>
            );
        } else if (request.status === 'acknowledged') {
            return (
                <ActionButton 
                    text="Complete" 
                    onClick={() => onComplete(request.id)} 
                    className="bg-green-500 hover:bg-green-600" 
                />
            );
        }
        return null;
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-slate-300 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                    <div className="bg-slate-100 rounded-full w-12 h-12 flex items-center justify-center">
                        <span className="text-2xl font-bold text-slate-700">T{request.tableNumber}</span>
                    </div>
                    <div>
                        <div className="flex items-center space-x-2">
                            <span className="text-lg font-semibold text-slate-800">Table {request.tableNumber}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeDisplay.bgColor} ${typeDisplay.textColor}`}>
                                {typeDisplay.icon} {typeDisplay.label}
                            </span>
                        </div>
                        <div className="text-sm text-slate-500 mt-1">{timeAgo}</div>
                    </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusDisplay.bgColor} ${statusDisplay.textColor}`}>
                    {statusDisplay.label}
                </span>
            </div>

            {request.requestType === 'other' && request.message && (
                <div className="mb-3 p-3 bg-slate-50 rounded-md">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap break-words">
                        {request.message}
                    </p>
                </div>
            )}

            {request.acknowledgedAt && (
                <div className="mb-2 text-xs text-slate-500">
                    Acknowledged {new Date(request.acknowledgedAt).toLocaleTimeString()}
                </div>
            )}

            {request.completedAt && (
                <div className="mb-2 text-xs text-slate-500">
                    Completed {new Date(request.completedAt).toLocaleTimeString()}
                </div>
            )}

            <div className="mt-3">
                {renderAction()}
            </div>
        </div>
    );
};

export default ServiceRequestCard;

