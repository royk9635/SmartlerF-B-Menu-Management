import React, { useState, useEffect, useCallback } from 'react';
import { User, Property, UserRole } from '../types';
import * as api from '../services/supabaseService';
import { LoadingSpinner } from './LoadingSpinner';
import ConfirmationModal from './ConfirmationModal';
import UserModal from './UserModal';
import { PlusIcon, PencilIcon, TrashIcon } from './Icons';

interface UserManagementPageProps {
    showToast: (message: string, type: 'success' | 'error') => void;
    currentUser: User;
}

const UserManagementPage: React.FC<UserManagementPageProps> = ({ showToast, currentUser }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    
    const [isModalOpen, setModalOpen] = useState<boolean>(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const [isConfirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
    const [deleteAction, setDeleteAction] = useState<(() => void) | null>(null);
    const [confirmMessage, setConfirmMessage] = useState<string>('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [fetchedUsers, fetchedProperties] = await Promise.all([
                api.getUsers(),
                api.getProperties('tenant-123')
            ]);
            setUsers(fetchedUsers);
            setProperties(fetchedProperties);
        } catch (error) {
            showToast('Failed to fetch data.', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const propertyMap = new Map(properties.map(p => [p.id, p.name]));

    const handleOpenAddModal = () => {
        setEditingUser(null);
        setModalOpen(true);
    };

    const handleOpenEditModal = (user: User) => {
        setEditingUser(user);
        setModalOpen(true);
    };

    const handleSaveUser = async (userData: Omit<User, 'id'>) => {
        try {
            if (editingUser) {
                await api.updateUser({ ...editingUser, ...userData });
                showToast('User updated successfully!', 'success');
            } else {
                await api.addUser(userData);
                showToast('User added successfully!', 'success');
            }
            await fetchData();
            setModalOpen(false);
            setEditingUser(null);
        } catch (error) {
            showToast(`Failed to save user. ${error instanceof Error ? error.message : ''}`, 'error');
        }
    };

    const handleDeleteUser = (user: User) => {
        setConfirmMessage(`Are you sure you want to delete the user "${user.name}"?`);
        setDeleteAction(() => async () => {
            try {
                await api.deleteUser(user.id);
                showToast('User deleted successfully!', 'success');
                await fetchData();
            } catch (error) {
                showToast(`Failed to delete user. ${error instanceof Error ? error.message : ''}`, 'error');
            }
        });
        setConfirmModalOpen(true);
    };

    if (currentUser.role !== UserRole.SUPERADMIN && currentUser.role !== UserRole.ADMIN) {
        return (
             <div className="bg-white shadow-md rounded-lg border border-slate-200 p-6 text-center">
                 <h2 className="text-2xl font-bold text-rose-600">Access Denied</h2>
                 <p className="text-slate-600 mt-2">You do not have permission to view this page.</p>
             </div>
        )
    }

    // Filter users for Admin role - only show users from their property
    const filteredUsers = currentUser.role === UserRole.SUPERADMIN 
        ? users 
        : users.filter(u => u.propertyId === currentUser.propertyId);

    if (loading) {
        return <div className="flex justify-center items-center h-96"><LoadingSpinner /></div>;
    }

    return (
        <div className="bg-white shadow-md rounded-lg border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-700">User & Role Management</h2>
                <button
                    onClick={handleOpenAddModal}
                    className="flex items-center bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-primary-700 transition duration-300"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add User
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600">Name</th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600">Email</th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600">Role</th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600">Assigned Property</th>
                            <th className="text-center py-3 px-4 uppercase font-semibold text-sm text-slate-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-slate-700">
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="border-b border-slate-200 hover:bg-slate-50">
                                <td className="py-3 px-4 font-medium">{user.name}</td>
                                <td className="py-3 px-4">{user.email}</td>
                                <td className="py-3 px-4">
                                     <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.role === UserRole.SUPERADMIN ? 'bg-primary-100 text-primary-800' : 'bg-slate-100 text-slate-800'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="py-3 px-4">{user.propertyId ? propertyMap.get(user.propertyId) : 'N/A'}</td>

                                <td className="py-3 px-4 text-center">
                                    <div className="flex items-center justify-center space-x-2">
                                        <button onClick={() => handleOpenEditModal(user)} className="text-amber-500 hover:text-amber-700 p-2 rounded-full hover:bg-amber-100 transition" title="Edit User">
                                            <PencilIcon className="h-5 w-5"/>
                                        </button>
                                        <button onClick={() => handleDeleteUser(user)} disabled={user.id === 'user-1' || user.id === currentUser.id} className="text-rose-500 hover:text-rose-700 p-2 rounded-full hover:bg-rose-100 transition disabled:text-slate-300 disabled:hover:bg-transparent disabled:cursor-not-allowed" title="Delete User">
                                            <TrashIcon className="h-5 w-5"/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredUsers.length === 0 && (
                    <div className="text-center py-10 text-slate-500">
                        <p>No users found. Click "Add User" to get started.</p>
                    </div>
                )}
            </div>

            <UserModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSaveUser}
                initialData={editingUser}
                properties={properties}
            />

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={() => {
                    deleteAction?.();
                    setConfirmModalOpen(false);
                }}
                title="Confirm Deletion"
                message={confirmMessage}
            />
        </div>
    );
};

export default UserManagementPage;
