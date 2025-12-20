import React, { useState, useEffect, useMemo } from 'react';
import { MenuItem, Allergen, Currency, SpecialType, ImageOrientation, SubCategory, Attribute, AttributeType, ModifierGroup } from '../types';
import { XIcon } from './Icons';

interface MenuItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (itemData: Omit<MenuItem, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>) => void;
    initialData: MenuItem | null;
    categoryId: string;
    subcategories: SubCategory[];
    attributes: Attribute[];
    availableAllergens: Allergen[];
    availableCurrencies: Currency[];
    availableModifierGroups: ModifierGroup[];
}

const getInitialFormData = () => ({
    name: '',
    description: '',
    price: '',
    currency: Currency.INR,
    imageUrl: '',
    videoUrl: '',
    allergens: [] as string[],
    subCategoryId: '',
    availabilityFlag: true,
    sortOrder: '10',
    displayName: '',
    itemCode: '',
    prepTime: '',
    soldOut: false,
    portion: '',
    specialType: SpecialType.NONE,
    calories: '',
    maxOrderQty: 10,
    bogo: false,
    complimentary: '',
    imageOrientation: ImageOrientation.SQUARE,
    availableTime: '',
    availableDate: '',
    attributes: {} as Record<string, string | number | boolean>,
    modifierGroupIds: [] as string[],
});

const MenuItemModal: React.FC<MenuItemModalProps> = ({ isOpen, onClose, onSubmit, initialData, categoryId, subcategories, attributes, availableAllergens, availableCurrencies, availableModifierGroups }) => {
    const [formData, setFormData] = useState(getInitialFormData());
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const nameCharLimit = 100;

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                description: initialData.description,
                price: String(initialData.price),
                currency: initialData.currency,
                imageUrl: initialData.imageUrl,
                videoUrl: initialData.videoUrl ?? '',
                allergens: initialData.allergens,
                subCategoryId: initialData.subCategoryId ?? '',
                availabilityFlag: initialData.availabilityFlag,
                sortOrder: initialData.sortOrder.toString(),
                displayName: initialData.displayName ?? '',
                itemCode: initialData.itemCode ?? '',
                prepTime: initialData.prepTime?.toString() ?? '',
                soldOut: initialData.soldOut ?? false,
                portion: initialData.portion ?? '',
                specialType: initialData.specialType ?? SpecialType.NONE,
                calories: initialData.calories?.toString() ?? '',
                maxOrderQty: initialData.maxOrderQty ?? 10,
                bogo: initialData.bogo ?? false,
                complimentary: initialData.complimentary ?? '',
                imageOrientation: initialData.imageOrientation ?? ImageOrientation.SQUARE,
                availableTime: initialData.availableTime ?? '',
                availableDate: initialData.availableDate ?? '',
                attributes: initialData.attributes ?? {},
                modifierGroupIds: initialData.modifierGroupIds ?? [],
            });
            setImagePreview(initialData.imageUrl);
        } else {
            setFormData(getInitialFormData());
            setImagePreview(null);
        }
    }, [initialData, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
             setFormData(prev => ({ ...prev, [name]: checked }));
        } else if (name === 'availabilityFlag' || name === 'soldOut' || name === 'bogo') {
            setFormData(prev => ({ ...prev, [name]: value === 'true' }));
        } else {
             setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleAttributeChange = (attributeId: string, value: string | number | boolean, type: AttributeType) => {
        let processedValue = value;
        if (type === AttributeType.NUMBER) {
            processedValue = value === '' ? '' : Number(value);
        }
        setFormData(prev => ({
            ...prev,
            attributes: {
                ...prev.attributes,
                [attributeId]: processedValue,
            }
        }));
    };

    const handleAllergenChange = (allergenId: string) => {
        setFormData(prev => {
            const newAllergens = prev.allergens.includes(allergenId)
                ? prev.allergens.filter(id => id !== allergenId)
                : [...prev.allergens, allergenId];
            return { ...prev, allergens: newAllergens };
        });
    };
    
    const handleModifierGroupChange = (groupId: string) => {
        setFormData(prev => {
            const newGroupIds = prev.modifierGroupIds.includes(groupId)
                ? prev.modifierGroupIds.filter(id => id !== groupId)
                : [...prev.modifierGroupIds, groupId];
            return { ...prev, modifierGroupIds: newGroupIds };
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setImagePreview(result);
                // In a real app, you'd upload this and get a URL. We'll use a placeholder.
                setFormData(prev => ({ ...prev, imageUrl: 'https://picsum.photos/400/300' }));
            };
            reader.readAsDataURL(file);
        }
    };
    
    const errors = useMemo(() => {
        const newErrors: { name?: string; price?: string } = {};

        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = 'Item Name is required.';
        } else if (formData.name.length > nameCharLimit) {
            newErrors.name = `Item Name cannot exceed ${nameCharLimit} characters.`;
        }

        // Price validation
        const priceValue = parseFloat(String(formData.price));
        if (String(formData.price).trim() === '' || isNaN(priceValue) || priceValue <= 0) {
            newErrors.price = 'Price must be a positive number.';
        }

        return newErrors;
    }, [formData.name, formData.price]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (Object.keys(errors).length === 0) {
            const dataToSubmit = {
                ...formData,
                price: parseFloat(String(formData.price)) || 0,
                sortOrder: parseInt(String(formData.sortOrder), 10) || 10,
                prepTime: parseInt(String(formData.prepTime), 10) || 0,
                calories: parseInt(String(formData.calories), 10) || 0,
                maxOrderQty: parseInt(String(formData.maxOrderQty), 10) || 0,
                subCategoryId: formData.subCategoryId || undefined,
            };
             onSubmit({ ...dataToSubmit, categoryId });
        }
    };

    if (!isOpen) return null;

    const inputClass = "mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500";
    const labelClass = "block text-sm font-medium text-slate-700";
    const errorInputClass = "border-red-500 focus:ring-red-500 focus:border-red-500";

    const getCharCountClass = () => {
        const len = formData.name.length;
        if (len >= nameCharLimit) return 'text-red-600 font-medium';
        if (len >= nameCharLimit - 10) return 'text-yellow-600';
        return 'text-slate-500';
    };

    const renderAttributeInput = (attr: Attribute) => {
        const value = formData.attributes[attr.id];
        const id = `attr-${attr.id}`;
        switch(attr.type) {
            case AttributeType.TEXT:
                return <input id={id} type="text" value={value as string || ''} onChange={(e) => handleAttributeChange(attr.id, e.target.value, attr.type)} className={inputClass} />;
            case AttributeType.NUMBER:
                return <input id={id} type="number" value={value as number || ''} onChange={(e) => handleAttributeChange(attr.id, e.target.value, attr.type)} className={inputClass} />;
            case AttributeType.BOOLEAN:
                return (
                    <div className="mt-2 flex items-center">
                         <input id={id} type="checkbox" checked={!!value} onChange={(e) => handleAttributeChange(attr.id, e.target.checked, attr.type)} className="h-4 w-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500" />
                         <label htmlFor={id} className="ml-2 text-sm text-slate-900">Enabled</label>
                    </div>
                );
            case AttributeType.SELECT:
                return (
                    <select id={id} value={value as string || ''} onChange={(e) => handleAttributeChange(attr.id, e.target.value, attr.type)} className={inputClass}>
                        <option value="">Select...</option>
                        {attr.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                );
            default:
                return null;
        }
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white flex justify-between items-center p-4 border-b border-slate-200 z-10">
                    <h3 className="text-xl font-semibold">{initialData ? 'Edit Food Item' : 'Food Item Registration'}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        {/* Left Column */}
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="name" className={labelClass}>Item Name*</label>
                                <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} className={`${inputClass} ${errors.name ? errorInputClass : ''}`} required maxLength={nameCharLimit}/>
                                <div className="flex justify-between items-center mt-1">
                                    {errors.name ? (
                                        <p className="text-red-500 text-xs">{errors.name}</p>
                                    ) : (
                                        <div /> 
                                    )}
                                    <p className={`text-xs transition-colors ${getCharCountClass()}`}>
                                        {nameCharLimit - formData.name.length} characters remaining
                                    </p>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="subCategoryId" className={labelClass}>Subcategory</label>
                                <select id="subCategoryId" name="subCategoryId" value={formData.subCategoryId} onChange={handleChange} className={inputClass}>
                                    <option value="">None (Item in main category)</option>
                                    {subcategories.map(sc => (
                                        <option key={sc.id} value={sc.id}>{sc.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="sortOrder" className={labelClass}>Sort Order</label>
                                <input id="sortOrder" name="sortOrder" type="number" value={formData.sortOrder} onChange={handleChange} className={inputClass} required />
                            </div>
                             <div>
                                <label htmlFor="availableTime" className={labelClass}>Available Time Period</label>
                                <input id="availableTime" name="availableTime" type="text" value={formData.availableTime} onChange={handleChange} className={inputClass} placeholder="e.g., 09:00-14:00,18:00-22:00" />
                            </div>
                            <div>
                                <label htmlFor="availabilityFlag" className={labelClass}>Active Status</label>
                                <select id="availabilityFlag" name="availabilityFlag" value={String(formData.availabilityFlag)} onChange={handleChange} className={inputClass}>
                                    <option value="true">Active</option>
                                    <option value="false">Inactive</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="description" className={labelClass}>Item Description</label>
                                <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} className={inputClass} />
                            </div>
                            <div>
                                <label htmlFor="soldOut" className={labelClass}>Sold Out</label>
                                <select id="soldOut" name="soldOut" value={String(formData.soldOut)} onChange={handleChange} className={inputClass}>
                                    <option value="false">No</option>
                                    <option value="true">Yes</option>
                                </select>
                            </div>
                             <div>
                                <label htmlFor="portion" className={labelClass}>Portion Good For</label>
                                <input id="portion" name="portion" type="text" value={formData.portion} onChange={handleChange} className={inputClass} placeholder="e.g., 2 persons" />
                            </div>
                             <div>
                                <label className={labelClass}>Primary Image</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
                                    <div className="space-y-1 text-center">
                                        {imagePreview ? <img src={imagePreview} alt="Preview" className="mx-auto h-24 w-24 object-cover rounded-md" /> : <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                                        <div className="flex text-sm text-slate-600 justify-center"><label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"><span>Upload a file</span><input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" /></label></div><p className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="videoUrl" className={labelClass}>Secondary Video URL</label>
                                <input id="videoUrl" name="videoUrl" type="text" value={formData.videoUrl} onChange={handleChange} className={inputClass} placeholder="https://example.com/video.mp4" />
                            </div>
                        </div>
                        {/* Right Column */}
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="displayName" className={labelClass}>Item Display Name</label>
                                <input id="displayName" name="displayName" type="text" value={formData.displayName} onChange={handleChange} className={inputClass} />
                            </div>
                            <div>
                                <label htmlFor="itemCode" className={labelClass}>Item Code</label>
                                <input id="itemCode" name="itemCode" type="text" value={formData.itemCode} onChange={handleChange} className={inputClass} />
                            </div>
                            <div className="flex space-x-4">
                                <div className="flex-grow">
                                    <label htmlFor="price" className={labelClass}>Price*</label>
                                    <input id="price" name="price" type="number" value={formData.price} onChange={handleChange} step="0.01" min="0" className={`${inputClass} ${errors.price ? errorInputClass : ''}`} required />
                                    {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                                </div>
                                <div>
                                    <label htmlFor="currency" className={labelClass}>Currency</label>
                                    <select id="currency" name="currency" value={formData.currency} onChange={handleChange} className={inputClass}>
                                        {availableCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                             <div>
                                <label htmlFor="prepTime" className={labelClass}>Preparation Time in Minutes</label>
                                <input id="prepTime" name="prepTime" type="number" value={formData.prepTime} onChange={handleChange} className={inputClass} min="0" />
                            </div>
                             <div>
                                <label htmlFor="availableDate" className={labelClass}>Available Date Period</label>
                                <input id="availableDate" name="availableDate" type="text" value={formData.availableDate} onChange={handleChange} className={inputClass} placeholder="e.g., 2024/01/01-2024/01/31" />
                            </div>
                            <div>
                                <label htmlFor="specialType" className={labelClass}>Special Type</label>
                                <select id="specialType" name="specialType" value={formData.specialType} onChange={handleChange} className={inputClass}>
                                    {Object.values(SpecialType).map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                             <div>
                                <label htmlFor="calories" className={labelClass}>Calorific Value</label>
                                <input id="calories" name="calories" type="number" value={formData.calories} onChange={handleChange} className={inputClass} min="0" />
                            </div>
                            <div>
                                <label htmlFor="maxOrderQty" className={labelClass}>Max Order Quantity</label>
                                <input id="maxOrderQty" name="maxOrderQty" type="number" value={formData.maxOrderQty} onChange={handleChange} className={inputClass} min="0" />
                            </div>
                             <div>
                                <label htmlFor="bogo" className={labelClass}>BOGO (Buy One Get One)</label>
                                <select id="bogo" name="bogo" value={String(formData.bogo)} onChange={handleChange} className={inputClass}>
                                    <option value="false">No</option>
                                    <option value="true">Yes</option>
                                </select>
                            </div>
                             <div>
                                <label htmlFor="complimentary" className={labelClass}>Complimentary Offering</label>
                                <input id="complimentary" name="complimentary" type="text" value={formData.complimentary} onChange={handleChange} className={inputClass} />
                            </div>
                            <div>
                                <label htmlFor="imageOrientation" className={labelClass}>Image Orientation</label>
                                <select id="imageOrientation" name="imageOrientation" value={formData.imageOrientation} onChange={handleChange} className={inputClass}>
                                    {Object.values(ImageOrientation).map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className={labelClass}>Allergens</label>
                            <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                                {availableAllergens.map(allergen => (
                                    <div key={allergen.id} className="flex items-center">
                                        <input id={`allergen-${allergen.id}`} type="checkbox" checked={formData.allergens.includes(allergen.id)} onChange={() => handleAllergenChange(allergen.id)} className="h-4 w-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500" />
                                        <label htmlFor={`allergen-${allergen.id}`} className="ml-2 text-sm text-slate-700">{allergen.name}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {/* Modifier Groups Section */}
                        <div className="md:col-span-2 pt-4 border-t border-slate-200">
                            <label className={labelClass}>Modifier Groups</label>
                            <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                                {availableModifierGroups.map(group => (
                                    <div key={group.id} className="flex items-center">
                                        <input
                                            id={`modifier-${group.id}`}
                                            type="checkbox"
                                            checked={formData.modifierGroupIds.includes(group.id)}
                                            onChange={() => handleModifierGroupChange(group.id)}
                                            className="h-4 w-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
                                        />
                                        <label htmlFor={`modifier-${group.id}`} className="ml-2 text-sm text-slate-700">{group.name}</label>
                                    </div>
                                ))}
                                {availableModifierGroups.length === 0 && (
                                    <p className="text-sm text-slate-500 col-span-full">No modifier groups available for this restaurant.</p>
                                )}
                            </div>
                        </div>

                        {/* Custom Attributes Section */}
                        {attributes.length > 0 && (
                            <div className="md:col-span-2 pt-4 border-t border-slate-200">
                                <h4 className="text-md font-semibold text-slate-800 mb-2">Custom Attributes</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                    {attributes.map(attr => (
                                        <div key={attr.id}>
                                            <label htmlFor={`attr-${attr.id}`} className={labelClass}>{attr.name}</label>
                                            {renderAttributeInput(attr)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="bg-slate-50 p-4 flex justify-end space-x-2 sticky bottom-0 z-10 rounded-b-lg">
                        <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={Object.keys(errors).length > 0}
                            className="bg-primary-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300 disabled:cursor-not-allowed"
                        >
                            Save Item
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MenuItemModal;
