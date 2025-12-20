import React from 'react';
import { ModifierGroup, ModifierItem } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon } from './Icons';

interface ModifierListProps {
    groups: ModifierGroup[];
    itemsMap: Map<string, ModifierItem[]>;
    expandedGroups: Set<string>;
    onToggleExpand: (groupId: string) => void;
    onAddGroup: () => void;
    onEditGroup: (group: ModifierGroup) => void;
    onDeleteGroup: (group: ModifierGroup) => void;
    onAddItem: (parentGroup: ModifierGroup) => void;
    onEditItem: (item: ModifierItem, parentGroup: ModifierGroup) => void;
    onDeleteItem: (item: ModifierItem) => void;
}

const ModifierList: React.FC<ModifierListProps> = ({
    groups, itemsMap, expandedGroups, onToggleExpand,
    onAddGroup, onEditGroup, onDeleteGroup,
    onAddItem, onEditItem, onDeleteItem,
}) => {
    
    const animationStyle = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-8px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .sub-row-anim { animation: fadeIn 0.3s ease-out forwards; }
    `;

    return (
        <div className="bg-white shadow-md rounded-lg border border-slate-200 p-6">
            <style>{animationStyle}</style>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-700">Modifier Groups</h2>
                <button
                    onClick={onAddGroup}
                    className="flex items-center bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-primary-700 transition duration-300"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Group
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="py-3 px-2 w-12 text-center"></th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600">Name / Item</th>
                            <th className="text-center py-3 px-4 uppercase font-semibold text-sm text-slate-600">Selection Rules / Price</th>
                            <th className="text-center py-3 px-4 uppercase font-semibold text-sm text-slate-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-slate-700">
                        {groups.map(group => {
                            const isExpanded = expandedGroups.has(group.id);
                            const items = itemsMap.get(group.id) || [];
                            return (
                                <React.Fragment key={group.id}>
                                    <tr className="border-b border-slate-200">
                                        <td className="py-1 px-2 text-center">
                                            <button onClick={() => onToggleExpand(group.id)} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                                                {isExpanded ? <ChevronUpIcon className="h-5 w-5 text-slate-600" /> : <ChevronDownIcon className="h-5 w-5 text-slate-500" />}
                                            </button>
                                        </td>
                                        <td className="py-3 px-4 font-medium">{group.name}</td>
                                        <td className="py-3 px-4 text-center text-sm text-slate-500">
                                            Min: {group.minSelection}, Max: {group.maxSelection}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <div className="flex items-center justify-center space-x-1">
                                                <button onClick={() => onEditGroup(group)} className="text-amber-500 hover:text-amber-700 p-2 rounded-full hover:bg-amber-100 transition" title="Edit Group">
                                                    <PencilIcon className="h-5 w-5"/>
                                                </button>
                                                <button onClick={() => onDeleteGroup(group)} className="text-rose-500 hover:text-rose-700 p-2 rounded-full hover:bg-rose-100 transition" title="Delete Group">
                                                    <TrashIcon className="h-5 w-5"/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    {isExpanded && (
                                        <>
                                            {items.map((item, index) => (
                                                <tr key={item.id} className="bg-slate-50 hover:bg-slate-100 transition-colors sub-row-anim" style={{animationDelay: `${index * 30}ms`}}>
                                                    <td></td>
                                                    <td className="py-2 px-4 pl-12 text-slate-800">{item.name}</td>
                                                    <td className="py-2 px-4 text-center font-mono text-sm">${item.price.toFixed(2)}</td>
                                                    <td className="py-2 px-4 text-center">
                                                        <div className="flex items-center justify-center space-x-1">
                                                            <button onClick={() => onEditItem(item, group)} className="text-amber-500 hover:text-amber-700 p-2 rounded-full hover:bg-amber-100 transition" title="Edit Item">
                                                                <PencilIcon className="h-5 w-5"/>
                                                            </button>
                                                            <button onClick={() => onDeleteItem(item)} className="text-rose-500 hover:text-rose-700 p-2 rounded-full hover:bg-rose-100 transition" title="Delete Item">
                                                                <TrashIcon className="h-5 w-5"/>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr className="bg-slate-50 border-b-2 border-slate-300 sub-row-anim" style={{animationDelay: `${items.length * 30}ms`}}>
                                                <td colSpan={4} className="py-2 px-4 pl-12">
                                                    <button onClick={() => onAddItem(group)} className="flex items-center text-sm text-primary-600 font-semibold hover:text-primary-800 transition-colors p-1">
                                                        <PlusIcon className="h-4 w-4 mr-1" />
                                                        Add Modifier Item
                                                    </button>
                                                </td>
                                            </tr>
                                        </>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {groups.length === 0 && (
                <div className="text-center py-10 text-slate-500">
                    <p>No modifier groups found. Click "Add Group" to get started.</p>
                </div>
            )}
        </div>
    );
};

export default ModifierList;
