import React, { useRef, useState } from 'react';
import { MenuCategory, SubCategory } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, PlusCircleIcon, DragHandleIcon, QRIcon, UploadIcon, LoadingSpinnerIcon, DownloadIcon, ChevronDownIcon, ChevronUpIcon } from './Icons';

interface CategoryListProps {
    categories: MenuCategory[];
    subcategoriesMap: Map<string, SubCategory[]>;
    expandedCategories: Set<string>;
    onAddCategory: () => void;
    onEditCategory: (category: MenuCategory) => void;
    onDeleteCategory: (categoryId: string) => void;
    onSelectCategory: (category: MenuCategory) => void;
    onAddItemToCategory: (category: MenuCategory) => void;
    onReorderCategories: (reorderedCategories: MenuCategory[]) => void;
    onGenerateQR: (category: MenuCategory | null) => void;
    isUploading: boolean;
    onImportJson: (file: File) => void;
    onExportJson: () => void;
    onToggleExpand: (categoryId: string) => void;
    onAddSubCategory: (parentCategory: MenuCategory) => void;
    onEditSubCategory: (subcategory: SubCategory) => void;
    onDeleteSubCategory: (subcategoryId: string, parentCategoryId: string) => void;
    onViewSubCategoryItems: (subcategory: SubCategory) => void;
}


const CategoryList: React.FC<CategoryListProps> = ({ 
    categories, subcategoriesMap, expandedCategories, onAddCategory, onEditCategory, 
    onDeleteCategory, onSelectCategory, onAddItemToCategory, onReorderCategories, 
    onGenerateQR, isUploading, onImportJson, onExportJson, onToggleExpand,
    onAddSubCategory, onEditSubCategory, onDeleteSubCategory, onViewSubCategoryItems
}) => {
    const draggedItemId = useRef<string | null>(null);
    const [dragOverId, setDragOverId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onImportJson(file);
        }
        event.target.value = '';
    };

    const handleDragStart = (e: React.DragEvent<HTMLTableRowElement>, id: string) => {
        draggedItemId.current = id;
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => {
            e.currentTarget.classList.add('opacity-50', 'bg-primary-50');
        }, 0);
    };

    const handleDragEnd = (e: React.DragEvent<HTMLTableRowElement>) => {
        e.currentTarget.classList.remove('opacity-50', 'bg-primary-50');
        draggedItemId.current = null;
        setDragOverId(null);
    };

    const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>, id: string) => {
        e.preventDefault();
        if (id !== draggedItemId.current) {
            setDragOverId(id);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLTableRowElement>, dropTargetId: string) => {
        e.preventDefault();
        if (!draggedItemId.current || draggedItemId.current === dropTargetId) {
            setDragOverId(null);
            return;
        }
        const draggedIndex = categories.findIndex(c => c.id === draggedItemId.current);
        const dropTargetIndex = categories.findIndex(c => c.id === dropTargetId);
        if (draggedIndex === -1 || dropTargetIndex === -1) return;
        const reordered = Array.from(categories);
        const [draggedItem] = reordered.splice(draggedIndex, 1);
        reordered.splice(dropTargetIndex, 0, draggedItem);
        const categoriesWithUpdatedSortOrder = reordered.map((category, index) => ({
            ...category,
            sortOrder: index,
        }));
        onReorderCategories(categoriesWithUpdatedSortOrder);
        setDragOverId(null);
    };
    
    const animationStyle = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-8px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .sub-row-anim {
            animation: fadeIn 0.3s ease-out forwards;
        }
    `;

    return (
        <div className="bg-white shadow-md rounded-lg border border-slate-200 p-6">
            <style>{animationStyle}</style>
             <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".json"
            />
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <h2 className="text-2xl font-bold text-slate-700">Menu Categories</h2>
                <div className="flex items-center space-x-2 flex-wrap gap-2">
                    <button
                        onClick={() => onGenerateQR(null)}
                        className="flex items-center bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-slate-700 transition duration-300"
                        title="Generate QR code for the full menu"
                    >
                        <QRIcon className="h-5 w-5 mr-2" />
                        Full Menu QR
                    </button>
                    <button
                        onClick={handleUploadClick}
                        disabled={isUploading}
                        className="flex items-center bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-sky-700 transition duration-300 disabled:bg-sky-300 disabled:cursor-not-allowed"
                        title="Upload menu from a JSON file"
                    >
                        {isUploading ? <LoadingSpinnerIcon className="h-5 w-5 mr-2" /> : <UploadIcon className="h-5 w-5 mr-2" />}
                        {isUploading ? 'Importing...' : 'Import JSON'}
                    </button>
                    <button
                        onClick={onExportJson}
                        className="flex items-center bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-emerald-700 transition duration-300"
                        title="Export full menu to a JSON file"
                    >
                        <DownloadIcon className="h-5 w-5 mr-2" />
                        Export JSON
                    </button>
                    <button
                        onClick={onAddCategory}
                        className="flex items-center bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-primary-700 transition duration-300"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Add Category
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="py-3 px-2 w-12 text-center"></th>
                            <th className="py-3 px-2 w-12 text-center"></th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600">Name</th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600">Description</th>
                            <th className="text-center py-3 px-4 uppercase font-semibold text-sm text-slate-600">Status</th>
                            <th className="text-center py-3 px-4 uppercase font-semibold text-sm text-slate-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-slate-700">
                        {categories.map(category => {
                            const isExpanded = expandedCategories.has(category.id);
                            const subcategories = subcategoriesMap.get(category.id) || [];
                            return (
                                <React.Fragment key={category.id}>
                                    <tr
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, category.id)}
                                        onDragEnd={handleDragEnd}
                                        onDragOver={(e) => handleDragOver(e, category.id)}
                                        onDragLeave={() => setDragOverId(null)}
                                        onDrop={(e) => handleDrop(e, category.id)}
                                        className={`border-b border-slate-200 transition-all duration-300 ${dragOverId === category.id ? 'bg-primary-50 border-t-2 border-t-primary-500' : ''}`}
                                    >
                                        <td className="py-1 px-2 text-center">
                                            <button onClick={() => onToggleExpand(category.id)} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                                                {isExpanded ? <ChevronUpIcon className="h-5 w-5 text-slate-600" /> : <ChevronDownIcon className="h-5 w-5 text-slate-500" />}
                                            </button>
                                        </td>
                                        <td className="py-3 px-2 text-center text-slate-400 cursor-move">
                                            <DragHandleIcon className="h-5 w-5 inline-block" />
                                        </td>
                                        <td className="py-3 px-4 font-medium">{category.name}</td>
                                        <td className="py-3 px-4">{category.description}</td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${category.activeFlag ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {category.activeFlag ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <div className="flex items-center justify-center space-x-1">
                                                <button onClick={() => onSelectCategory(category)} className="text-sky-500 hover:text-sky-700 p-2 rounded-full hover:bg-sky-100 transition" title="View Items in Category">
                                                    <EyeIcon className="h-5 w-5"/>
                                                </button>
                                                <button onClick={() => onGenerateQR(category)} className="text-slate-500 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition" title="Generate QR Code">
                                                    <QRIcon className="h-5 w-5"/>
                                                </button>
                                                <button onClick={() => onAddItemToCategory(category)} className="text-emerald-500 hover:text-emerald-700 p-2 rounded-full hover:bg-emerald-100 transition" title="Add Item to Category">
                                                    <PlusCircleIcon className="h-5 w-5"/>
                                                </button>
                                                <button onClick={() => onEditCategory(category)} className="text-amber-500 hover:text-amber-700 p-2 rounded-full hover:bg-amber-100 transition" title="Edit Category">
                                                    <PencilIcon className="h-5 w-5"/>
                                                </button>
                                                <button onClick={() => onDeleteCategory(category.id)} className="text-rose-500 hover:text-rose-700 p-2 rounded-full hover:bg-rose-100 transition" title="Delete Category">
                                                    <TrashIcon className="h-5 w-5"/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    {isExpanded && (
                                        <>
                                            {subcategories.map((sc, index) => (
                                                <tr key={sc.id} className="bg-slate-50 hover:bg-slate-100 transition-colors sub-row-anim" style={{animationDelay: `${index * 30}ms`}}>
                                                    <td colSpan={2}></td>
                                                    <td className="py-2 px-4 pl-12 font-medium text-slate-800">{sc.name}</td>
                                                    <td colSpan={2}></td>
                                                    <td className="py-2 px-4 text-center">
                                                        <div className="flex items-center justify-center space-x-1">
                                                            <button onClick={() => onViewSubCategoryItems(sc)} className="text-sky-500 hover:text-sky-700 p-2 rounded-full hover:bg-sky-100 transition" title="View Items">
                                                                <EyeIcon className="h-5 w-5"/>
                                                            </button>
                                                            <button onClick={() => onEditSubCategory(sc)} className="text-amber-500 hover:text-amber-700 p-2 rounded-full hover:bg-amber-100 transition" title="Edit Subcategory">
                                                                <PencilIcon className="h-5 w-5"/>
                                                            </button>
                                                            <button onClick={() => onDeleteSubCategory(sc.id, category.id)} className="text-rose-500 hover:text-rose-700 p-2 rounded-full hover:bg-rose-100 transition" title="Delete Subcategory">
                                                                <TrashIcon className="h-5 w-5"/>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr className="bg-slate-50 border-b-2 border-slate-300 sub-row-anim" style={{animationDelay: `${subcategories.length * 30}ms`}}>
                                                <td colSpan={6} className="py-2 px-4 pl-12">
                                                    <button onClick={() => onAddSubCategory(category)} className="flex items-center text-sm text-primary-600 font-semibold hover:text-primary-800 transition-colors p-1">
                                                        <PlusIcon className="h-4 w-4 mr-1" />
                                                        Add Subcategory
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
            {categories.length === 0 && (
                <div className="text-center py-10 text-slate-500">
                    <p>No categories found. Click "Add Category" to get started.</p>
                </div>
            )}
        </div>
    );
};

export default CategoryList;
