import React, { useState, useRef, useCallback } from 'react';
import { SystemImportStats } from '../types';
import { XIcon, UploadIcon, LoadingSpinnerIcon, ServerStackIcon, CheckCircleIcon, XCircleIcon } from './Icons'; // Assuming CheckCircleIcon and XCircleIcon are available

interface SystemImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (file: File) => Promise<SystemImportStats>;
    initialStats: SystemImportStats | null;
}

const SystemImportModal: React.FC<SystemImportModalProps> = ({ isOpen, onClose, onImport, initialStats }) => {
    const [view, setView] = useState<'upload' | 'processing' | 'summary'>(initialStats ? 'summary' : 'upload');
    const [stats, setStats] = useState<SystemImportStats | null>(initialStats);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (file: File | null) => {
        if (!file) return;
        
        if (file.type !== 'application/json') {
            setError('Invalid file type. Please upload a JSON file.');
            return;
        }
        
        setError(null);
        setView('processing');
        try {
            const resultStats = await onImport(file);
            setStats(resultStats);
            setView('summary');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during import.';
            setError(errorMessage);
            setView('upload');
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files?.[0];
        handleFileChange(file || null);
    };

    const handleClose = () => {
        setView('upload');
        setStats(null);
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    const renderContent = () => {
        switch (view) {
            case 'processing':
                return (
                    <div className="flex flex-col items-center justify-center p-16 space-y-4">
                        <LoadingSpinnerIcon className="h-12 w-12 text-primary-600" />
                        <h4 className="text-xl font-semibold text-slate-700">Processing Menu...</h4>
                        <p className="text-slate-500">This may take a moment. Please don't close this window.</p>
                    </div>
                );
            case 'summary':
                if (!stats) return <p>No summary to display.</p>;
                return (
                    <div className="p-6">
                        <div className="text-center mb-6">
                             <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto" />
                             <h3 className="text-2xl font-bold text-slate-800 mt-2">Import Complete</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                             <div className="bg-slate-50 p-3 rounded-lg">
                                <p className="font-semibold text-slate-600">Restaurants Processed</p>
                                <p className="text-2xl font-bold text-slate-800">{stats.restaurantsProcessed}</p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg">
                                <p className="font-semibold text-slate-600">Restaurants Skipped</p>
                                <p className="text-2xl font-bold text-slate-800">{stats.restaurantsSkipped.length}</p>
                            </div>
                            <div className="bg-green-50 p-3 rounded-lg">
                                <p className="font-semibold text-green-800">Items Created</p>
                                <p className="text-2xl font-bold text-green-900">{stats.itemsCreated}</p>
                            </div>
                             <div className="bg-blue-50 p-3 rounded-lg">
                                <p className="font-semibold text-blue-800">Items Updated</p>
                                <p className="text-2xl font-bold text-blue-900">{stats.itemsUpdated}</p>
                            </div>
                              <div className="bg-sky-50 p-3 rounded-lg">
                                <p className="font-semibold text-sky-800">Categories Created</p>
                                <p className="text-2xl font-bold text-sky-900">{stats.categoriesCreated + stats.subcategoriesCreated}</p>
                            </div>
                             <div className="bg-indigo-50 p-3 rounded-lg">
                                <p className="font-semibold text-indigo-800">Modifiers Created</p>
                                <p className="text-2xl font-bold text-indigo-900">{stats.modifierGroupsCreated + stats.modifierItemsCreated}</p>
                            </div>
                        </div>
                        {stats.restaurantsSkipped.length > 0 && (
                             <div className="mt-4">
                                <p className="font-semibold text-amber-700">Skipped Restaurants (Not Found):</p>
                                <ul className="text-xs list-disc list-inside text-slate-600 max-h-24 overflow-y-auto bg-amber-50 p-2 rounded">
                                    {stats.restaurantsSkipped.map(r => <li key={r.id}><strong>{r.name}</strong> (ID: {r.id})</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                );
            case 'upload':
            default:
                return (
                    <div className="p-6 space-y-4">
                        <p className="text-slate-600">
                            Upload a system-wide menu JSON file. The system will match restaurants by ID, then create or update their categories, items, and modifiers. Restaurants not found in the system will be skipped.
                        </p>
                        <div 
                            onDragOver={handleDragOver} 
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-1 flex justify-center px-6 pt-10 pb-12 border-2 border-slate-300 border-dashed rounded-md cursor-pointer hover:border-primary-500 hover:bg-slate-50 transition"
                        >
                            <div className="space-y-1 text-center">
                                <UploadIcon className="mx-auto h-12 w-12 text-slate-400" />
                                <div className="flex text-sm text-slate-600">
                                    <span className="font-medium text-primary-600">Upload a file</span>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-slate-500">JSON file only</p>
                            </div>
                        </div>
                        <input
                            ref={fileInputRef}
                            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                            type="file"
                            className="hidden"
                            accept=".json,application/json"
                        />
                        {error && (
                            <div className="bg-red-50 p-3 rounded-md flex items-center text-sm text-red-700">
                                <XCircleIcon className="h-5 w-5 mr-2 flex-shrink-0"/>
                                <span>{error}</span>
                            </div>
                        )}
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg">
                <div className="flex justify-between items-center p-4 border-b border-slate-200">
                    <div className="flex items-center space-x-3">
                        <ServerStackIcon className="h-6 w-6 text-primary-600" />
                        <h3 className="text-xl font-semibold text-slate-800">System-Wide Menu Import</h3>
                    </div>
                    <button onClick={handleClose} className="text-slate-400 hover:text-slate-600">
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>
                {renderContent()}
                <div className="bg-slate-50 p-4 flex justify-end space-x-2 rounded-b-lg">
                    <button type="button" onClick={handleClose} className="bg-primary-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                        {view === 'summary' ? 'Done' : 'Close'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SystemImportModal;
