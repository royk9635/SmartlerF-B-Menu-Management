import React from 'react';

interface StatCardProps {
    title: string;
    value: number | string;
    description?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 flex flex-col justify-between">
            <div>
                <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</h4>
                <p className="text-4xl font-bold text-slate-800 mt-2">{value}</p>
            </div>
            {description && <p className="text-sm text-slate-400 mt-4">{description}</p>}
        </div>
    );
};

export default StatCard;
