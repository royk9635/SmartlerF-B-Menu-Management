import React, { useState, useEffect } from 'react';
import { User, Property, UserRole } from '../types';
import { XIcon } from './Icons';

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<User, 'id'>) => void;
    initialData: User | null;
    properties: Property[];
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSubmit, initialData, properties }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<UserRole>(UserRole.ADMIN);
    const [propertyId, setPropertyId] = useState<string | undefined>('');

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setEmail(initialData.email);
            setRole(initialData.role);
            setPropertyId(initialData.propertyId);
        } else {
            setName('');
            setEmail('');
            setRole(UserRole.ADMIN);
            setPropertyId(properties[0]?.id || '');
        }
    }, [initialData, isOpen, properties]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const userData: Omit<User, 'id'> = {
            name,
            email,
            role,
            propertyId: role !== UserRole.SUPERADMIN ? propertyId : undefined,
        };
        onSubmit(userData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b border-slate-200">
                    <h3 className="text-xl font-semibold">{initialData ? 'Edit User' : 'Add New User'}</h3>
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
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-slate-700">Role</label>
                            <select
                                id="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value as UserRole)}
                                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            >
                                <option value={UserRole.SUPERADMIN}>SuperAdmin</option>
                                <option value={UserRole.ADMIN}>Admin</option>
                                <option value={UserRole.MANAGER}>Manager</option>
                                <option value={UserRole.STAFF}>Staff</option>
                            </select>
                        </div>
                        {role !== UserRole.SUPERADMIN && (
                            <div>
                                <label htmlFor="propertyId" className="block text-sm font-medium text-slate-700">Assign to Property</label>
                                <select
                                    id="propertyId"
                                    value={propertyId}
                                    onChange={(e) => setPropertyId(e.target.value)}
                                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                    required
                                >
                                    <option value="" disabled>Select a property</option>
                                    {properties.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                    <div className="bg-slate-50 p-4 flex justify-end space-x-2 rounded-b-lg">
                        <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                            Cancel
                        </button>
                        <button type="submit" className="bg-primary-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                            Save User
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserModal;
