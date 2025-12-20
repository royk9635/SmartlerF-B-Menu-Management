import React from 'react';
import { Attribute } from '../types';
import { PlusIcon, PencilIcon, TrashIcon } from './Icons';

interface AttributeListProps {
    attributes: Attribute[];
    onAddAttribute: () => void;
    onEditAttribute: (attribute: Attribute) => void;
    onDeleteAttribute: (attribute: Attribute) => void;
}

const AttributeList: React.FC<AttributeListProps> = ({ attributes, onAddAttribute, onEditAttribute, onDeleteAttribute }) => {
    return (
        <div className="bg-white shadow-md rounded-lg border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-700">Custom Attributes</h2>
                <button
                    onClick={onAddAttribute}
                    className="flex items-center bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-primary-700 transition duration-300"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Attribute
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600">Name</th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600">Type</th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600">Options</th>
                            <th className="text-center py-3 px-4 uppercase font-semibold text-sm text-slate-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-slate-700">
                        {attributes.map(attr => (
                            <tr key={attr.id} className="border-b border-slate-200 hover:bg-slate-50">
                                <td className="py-3 px-4 font-medium">{attr.name}</td>
                                <td className="py-3 px-4">{attr.type}</td>
                                <td className="py-3 px-4 text-sm text-slate-600">
                                    {attr.options?.map(opt => (
                                        <span key={opt} className="inline-block bg-slate-100 rounded-full px-3 py-1 text-xs font-semibold text-slate-700 mr-2 mb-1">
                                            {opt}
                                        </span>
                                    )) || 'N/A'}
                                </td>
                                <td className="py-3 px-4 text-center">
                                    <div className="flex items-center justify-center space-x-2">
                                        <button onClick={() => onEditAttribute(attr)} className="text-amber-500 hover:text-amber-700 p-2 rounded-full hover:bg-amber-100 transition" title="Edit Attribute">
                                            <PencilIcon className="h-5 w-5"/>
                                        </button>
                                        <button onClick={() => onDeleteAttribute(attr)} className="text-rose-500 hover:text-rose-700 p-2 rounded-full hover:bg-rose-100 transition" title="Delete Attribute">
                                            <TrashIcon className="h-5 w-5"/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {attributes.length === 0 && (
                <div className="text-center py-10 text-slate-500">
                    <p>No attributes found. Click "Add Attribute" to get started.</p>
                </div>
            )}
        </div>
    );
};

export default AttributeList;
