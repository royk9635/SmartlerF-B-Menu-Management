import React, { useState, useEffect, useCallback } from 'react';
import { Attribute, User, UserRole } from '../types';
import * as api from '../services/supabaseService';
import { LoadingSpinner } from './LoadingSpinner';
import ConfirmationModal from './ConfirmationModal';
import AttributeList from './AttributeList';
import AttributeModal from './AttributeModal';

interface AttributesPageProps {
    showToast: (message: string, type: 'success' | 'error') => void;
    currentUser: User;
}

const AttributesPage: React.FC<AttributesPageProps> = ({ showToast, currentUser }) => {
    const [attributes, setAttributes] = useState<Attribute[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    
    const [isModalOpen, setModalOpen] = useState<boolean>(false);
    const [editingAttribute, setEditingAttribute] = useState<Attribute | null>(null);

    const [isConfirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
    const [deleteAction, setDeleteAction] = useState<(() => void) | null>(null);
    const [confirmMessage, setConfirmMessage] = useState<string>('');
    
    const fetchAttributes = useCallback(async () => {
        setLoading(true);
        try {
            const fetchedAttributes = await api.getAttributes();
            setAttributes(fetchedAttributes);
        } catch (error) {
            showToast('Failed to fetch attributes.', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchAttributes();
    }, [fetchAttributes]);

    const handleOpenAddModal = () => {
        setEditingAttribute(null);
        setModalOpen(true);
    };

    const handleOpenEditModal = (attribute: Attribute) => {
        setEditingAttribute(attribute);
        setModalOpen(true);
    };

    const handleSaveAttribute = async (attributeData: Omit<Attribute, 'id'>) => {
        try {
            if (editingAttribute) {
                await api.updateAttribute({ ...editingAttribute, ...attributeData });
                showToast('Attribute updated successfully!', 'success');
            } else {
                await api.addAttribute(attributeData);
                showToast('Attribute added successfully!', 'success');
            }
            await fetchAttributes();
            setModalOpen(false);
            setEditingAttribute(null);
        } catch (error) {
            showToast('Failed to save attribute.', 'error');
        }
    };

    const handleDeleteAttribute = (attribute: Attribute) => {
        setConfirmMessage(`Are you sure you want to delete "${attribute.name}"? This will remove the attribute from all menu items.`);
        setDeleteAction(() => async () => {
            try {
                await api.deleteAttribute(attribute.id);
                showToast('Attribute deleted successfully!', 'success');
                await fetchAttributes();
            } catch (error) {
                showToast('Failed to delete attribute.', 'error');
            }
        });
        setConfirmModalOpen(true);
    };
    
    if (currentUser.role !== UserRole.SUPERADMIN) {
        return (
             <div className="bg-white shadow-md rounded-lg border border-slate-200 p-6 text-center">
                 <h2 className="text-2xl font-bold text-rose-600">Access Denied</h2>
                 <p className="text-slate-600 mt-2">Only Superadmins can manage custom attributes.</p>
             </div>
        )
    }


    if (loading) {
        return <div className="flex justify-center items-center h-96"><LoadingSpinner /></div>;
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-800">Manage Item Attributes</h2>
            <AttributeList
                attributes={attributes}
                onAddAttribute={handleOpenAddModal}
                onEditAttribute={handleOpenEditModal}
                onDeleteAttribute={handleDeleteAttribute}
            />
            <AttributeModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSaveAttribute}
                initialData={editingAttribute}
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

export default AttributesPage;
