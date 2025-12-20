import React, { useState, useEffect, useCallback } from 'react';
import { Allergen, User, UserRole } from '../types';
import * as api from '../services/supabaseService';
import { LoadingSpinner } from './LoadingSpinner';
import ConfirmationModal from './ConfirmationModal';
import AllergenList from './AllergenList';
import AllergenModal from './AllergenModal';

interface AllergensPageProps {
    showToast: (message: string, type: 'success' | 'error') => void;
    currentUser: User;
}

const AllergensPage: React.FC<AllergensPageProps> = ({ showToast, currentUser }) => {
    const [allergens, setAllergens] = useState<Allergen[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    
    const [isModalOpen, setModalOpen] = useState<boolean>(false);
    const [editingAllergen, setEditingAllergen] = useState<Allergen | null>(null);

    const [isConfirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
    const [deleteAction, setDeleteAction] = useState<(() => void) | null>(null);
    const [confirmMessage, setConfirmMessage] = useState<string>('');
    
    const fetchAllergens = useCallback(async () => {
        setLoading(true);
        try {
            const fetchedAllergens = await api.getAllergens();
            setAllergens(fetchedAllergens);
        } catch (error) {
            showToast('Failed to fetch allergens.', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchAllergens();
    }, [fetchAllergens]);

    const handleOpenAddModal = () => {
        setEditingAllergen(null);
        setModalOpen(true);
    };

    const handleOpenEditModal = (allergen: Allergen) => {
        setEditingAllergen(allergen);
        setModalOpen(true);
    };

    const handleSaveAllergen = async (allergenData: Omit<Allergen, 'id'>) => {
        try {
            if (editingAllergen) {
                await api.updateAllergen({ ...editingAllergen, ...allergenData });
                showToast('Allergen updated successfully!', 'success');
            } else {
                await api.addAllergen(allergenData);
                showToast('Allergen added successfully!', 'success');
            }
            await fetchAllergens();
            setModalOpen(false);
            setEditingAllergen(null);
        } catch (error) {
            showToast('Failed to save allergen.', 'error');
        }
    };

    const handleDeleteAllergen = (allergen: Allergen) => {
        setConfirmMessage(`Are you sure you want to delete "${allergen.name}"? This will remove the allergen from all menu items.`);
        setDeleteAction(() => async () => {
            try {
                await api.deleteAllergen(allergen.id);
                showToast('Allergen deleted successfully!', 'success');
                await fetchAllergens();
            } catch (error) {
                showToast('Failed to delete allergen.', 'error');
            }
        });
        setConfirmModalOpen(true);
    };
    
    if (currentUser.role !== UserRole.SUPERADMIN) {
        return (
             <div className="bg-white shadow-md rounded-lg border border-slate-200 p-6 text-center">
                 <h2 className="text-2xl font-bold text-rose-600">Access Denied</h2>
                 <p className="text-slate-600 mt-2">Only Superadmins can manage allergens.</p>
             </div>
        )
    }

    if (loading) {
        return <div className="flex justify-center items-center h-96"><LoadingSpinner /></div>;
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-800">Manage Allergens</h2>
            <AllergenList
                allergens={allergens}
                onAddAllergen={handleOpenAddModal}
                onEditAllergen={handleOpenEditModal}
                onDeleteAllergen={handleDeleteAllergen}
            />
            <AllergenModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSaveAllergen}
                initialData={editingAllergen}
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

export default AllergensPage;
