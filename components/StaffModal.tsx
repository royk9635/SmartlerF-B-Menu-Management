import React, { useState, useEffect } from 'react';
import { Staff, Restaurant } from '../types';
import { XIcon } from './Icons';

interface StaffModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { name: string; pin: string; role: Staff['role']; restaurantId: string }) => void;
    initialData: Omit<Staff, 'pin'> | null;
    restaurants: Restaurant[];
}

const StaffModal: React.FC<StaffModalProps> = ({ isOpen, onClose, onSubmit, initialData, restaurants }) => {
    const [name, setName] = useState('');
    const [pin, setPin] = useState('');
    const [role, setRole] = useState<Staff['role']>('waiter');
    const [restaurantId, setRestaurantId] = useState<string>('');

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setPin(''); // Don't show PIN when editing
            setRole(initialData.role);
            setRestaurantId(initialData.restaurantId);
        } else {
            setName('');
            setPin('');
            setRole('waiter');
            setRestaurantId(restaurants[0]?.id || '');
        }
    }, [initialData, isOpen, restaurants]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!pin && !initialData) {
            alert('PIN is required');
            return;
        }
        
        // Validate PIN format (4 digits)
        if (pin && !/^\d{4}$/.test(pin)) {
            alert('PIN must be exactly 4 digits');
            return;
        }
        
        const staffData = {
            name,
            pin: pin || '0000', // Will be validated on backend
            role,
            restaurantId
        };
        onSubmit(staffData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b border-slate-200">
                    <h3 className="text-xl font-semibold">{initialData ? 'Edit Staff Member' : 'Add New Staff Member'}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Full Name</label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="pin" className="block text-sm font-medium text-slate-700">
                                PIN {initialData && <span className="text-slate-500 text-xs">(leave blank to keep current)</span>}
                            </label>
                            <input
                                id="pin"
                                type="text"
                                value={pin}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                                    setPin(value);
                                }}
                                placeholder="4-digit PIN"
                                maxLength={4}
                                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                required={!initialData}
                            />
                            <p className="mt-1 text-xs text-slate-500">Enter a 4-digit PIN for tablet app login</p>
                        </div>
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-slate-700">Role</label>
                            <select
                                id="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value as Staff['role'])}
                                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            >
                                <option value="waiter">Waiter</option>
                                <option value="server">Server</option>
                                <option value="bartender">Bartender</option>
                                <option value="host">Host</option>
                                <option value="manager">Manager</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="restaurantId" className="block text-sm font-medium text-slate-700">Restaurant</label>
                            <select
                                id="restaurantId"
                                value={restaurantId}
                                onChange={(e) => setRestaurantId(e.target.value)}
                                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                required
                            >
                                <option value="" disabled>Select a restaurant</option>
                                {restaurants.map(r => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="bg-slate-50 p-4 flex justify-end space-x-2 rounded-b-lg">
                        <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                            Cancel
                        </button>
                        <button type="submit" className="bg-primary-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                            {initialData ? 'Update Staff' : 'Create Staff'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StaffModal;

