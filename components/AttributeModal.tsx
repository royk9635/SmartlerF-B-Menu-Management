import React, { useState, useEffect } from 'react';
import { Attribute, AttributeType } from '../types';
import { XIcon } from './Icons';

interface AttributeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<Attribute, 'id'>) => void;
    initialData: Attribute | null;
}

const AttributeModal: React.FC<AttributeModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState<AttributeType>(AttributeType.TEXT);
    const [options, setOptions] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setType(initialData.type);
            setOptions(initialData.options?.join(', ') || '');
        } else {
            setName('');
            setType(AttributeType.TEXT);
            setOptions('');
        }
        setError(null);
    }, [initialData, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const optionsArray = type === AttributeType.SELECT ? options.split(',').map(o => o.trim()).filter(Boolean) : undefined;

        if (type === AttributeType.SELECT && (!optionsArray || optionsArray.length === 0)) {
            setError('Please provide at least one option for the Dropdown type.');
            return;
        }

        onSubmit({ name, type, options: optionsArray });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b border-slate-200">
                    <h3 className="text-xl font-semibold">{initialData ? 'Edit Attribute' : 'Add New Attribute'}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Attribute Name</label>
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
                            <label htmlFor="type" className="block text-sm font-medium text-slate-700">Input Type</label>
                             <select
                                id="type"
                                value={type}
                                onChange={(e) => setType(e.target.value as AttributeType)}
                                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            >
                                {Object.values(AttributeType).map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                         {type === AttributeType.SELECT && (
                            <div>
                                <label htmlFor="options" className="block text-sm font-medium text-slate-700">Options</label>
                                <textarea
                                    id="options"
                                    value={options}
                                    onChange={(e) => setOptions(e.target.value)}
                                    rows={3}
                                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="Enter comma-separated values, e.g., Mild, Medium, Hot"
                                />
                                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                            </div>
                        )}
                    </div>
                    <div className="bg-slate-50 p-4 flex justify-end space-x-2 rounded-b-lg">
                        <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                            Cancel
                        </button>
                        <button type="submit" className="bg-primary-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                            Save Attribute
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AttributeModal;
