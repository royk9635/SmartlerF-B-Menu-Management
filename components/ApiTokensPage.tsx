import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ApiToken, Restaurant, Property, GenerateTokenRequest } from '../types';
import * as api from '../services/supabaseService';
import { apiTokensApi } from '../services/apiService';
import { LoadingSpinner } from './LoadingSpinner';
import ConfirmationModal from './ConfirmationModal';
import { PlusIcon, TrashIcon, CopyIcon, KeyIcon } from './Icons';
import { BaseModal } from './ui/BaseModal';
import { FormInput, FormSelect } from './ui';
import { User } from '../types';

interface ApiTokensPageProps {
    showToast: (message: string, type: 'success' | 'error') => void;
    currentUser: User;
}

const ApiTokensPage: React.FC<ApiTokensPageProps> = ({ showToast, currentUser }) => {
    const [tokens, setTokens] = useState<ApiToken[]>([]);
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    
    const [isGenerateModalOpen, setGenerateModalOpen] = useState<boolean>(false);
    const [newToken, setNewToken] = useState<ApiToken | null>(null);
    const [showNewToken, setShowNewToken] = useState<boolean>(false);
    
    const [isConfirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
    const [deleteAction, setDeleteAction] = useState<(() => void) | null>(null);
    const [confirmMessage, setConfirmMessage] = useState<string>('');

    // Form state
    const [tokenName, setTokenName] = useState<string>('');
    const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('');
    const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
    const [expiresInDays, setExpiresInDays] = useState<number>(365);
    const hasFetchedRef = useRef(false);

    const fetchData = useCallback(async () => {
        if (hasFetchedRef.current && loading) return; // Prevent multiple simultaneous fetches
        hasFetchedRef.current = true;
        setLoading(true);
        try {
            // Fetch data with error handling for each call using Supabase service
            const results = await Promise.allSettled([
                api.getApiTokens().catch(err => {
                    console.error('Failed to fetch tokens:', err);
                    return [];
                }),
                api.getAllRestaurants().catch(err => {
                    console.error('Failed to fetch restaurants:', err);
                    return [];
                }),
                api.getProperties().catch(err => {
                    console.error('Failed to fetch properties:', err);
                    return [];
                })
            ]);
            
            // Handle tokens
            if (results[0].status === 'fulfilled') {
                setTokens(results[0].value || []);
            } else {
                setTokens([]);
            }
            
            // Handle restaurants
            if (results[1].status === 'fulfilled') {
                setRestaurants(results[1].value || []);
            } else {
                setRestaurants([]);
            }
            
            // Handle properties
            if (results[2].status === 'fulfilled') {
                setProperties(results[2].value || []);
            } else {
                setProperties([]);
            }
            
            // Show error only if all failed
            const allFailed = results.every(r => r.status === 'rejected');
            if (allFailed) {
                const error = results[0].status === 'rejected' ? results[0].reason : null;
                const errorMessage = error?.message || 'Failed to fetch data. Please ensure you are logged in.';
                showToast(errorMessage, 'error');
            }
        } catch (error: any) {
            console.error('Failed to fetch API tokens data:', error);
            // Don't show toast on initial load errors - just set empty arrays
            setTokens([]);
            setRestaurants([]);
            setProperties([]);
        } finally {
            setLoading(false);
        }
    }, [showToast, loading]);

    useEffect(() => {
        hasFetchedRef.current = false; // Reset on mount
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run once on mount

    const handleOpenGenerateModal = () => {
        setTokenName('');
        setSelectedRestaurantId('');
        setSelectedPropertyId('');
        setExpiresInDays(365);
        setNewToken(null);
        setShowNewToken(false);
        setGenerateModalOpen(true);
    };

    const ensureAuthenticated = async (): Promise<boolean> => {
        // Check if we have a currentUser prop (authenticated via backend API)
        if (currentUser && currentUser.id) {
            return true;
        }

        // Fallback: Check if we have a valid session via Supabase
        try {
            const user = await api.getCurrentUser();
            if (user) {
                return true;
            }
        } catch (error) {
            console.log('No active session');
        }

        // User needs to be logged in - don't auto-login
        console.log('User not authenticated for API token generation');
        return false;
    };

    const handleGenerateToken = async () => {
        if (!tokenName.trim()) {
            showToast('Token name is required', 'error');
            return;
        }

        // Ensure we're authenticated with real API
        const isAuthenticated = await ensureAuthenticated();
        if (!isAuthenticated) {
            showToast('Failed to authenticate. Please log in manually with real API credentials.', 'error');
            return;
        }

        try {
            console.log('Generating token with request:', {
                name: tokenName.trim(),
                expiresInDays: expiresInDays || undefined,
                restaurantId: selectedRestaurantId || undefined,
                propertyId: selectedPropertyId || undefined
            });

            const request: GenerateTokenRequest = {
                name: tokenName.trim(),
                expiresInDays: expiresInDays || undefined,
            };

            if (selectedRestaurantId) {
                request.restaurantId = selectedRestaurantId;
            }

            if (selectedPropertyId) {
                request.propertyId = selectedPropertyId;
            }

            console.log('Calling apiTokensApi.generate with:', request);
            const generatedToken = await apiTokensApi.generate(request);
            console.log('Token generated successfully:', generatedToken);
            
            setNewToken(generatedToken);
            setShowNewToken(true);
            setGenerateModalOpen(false);
            hasFetchedRef.current = false; // Allow refetch
            await fetchData();
            showToast('API token generated successfully!', 'success');
        } catch (error: any) {
            console.error('Error generating token:', error);
            let errorMessage = 'Unknown error occurred';
            
            if (error?.status === 401) {
                errorMessage = 'Authentication failed. Please ensure the backend server is running and try again.';
                // Clear invalid token
                localStorage.removeItem('auth_token');
            } else if (error?.message) {
                errorMessage = error.message;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            
            console.error('Error message:', errorMessage);
            showToast(`Failed to generate token. ${errorMessage}`, 'error');
        }
    };

    const handleCopyToken = (token: string) => {
        navigator.clipboard.writeText(token);
        showToast('Token copied to clipboard!', 'success');
    };

    const handleRevokeToken = (token: ApiToken) => {
        setConfirmMessage(`Are you sure you want to ${token.isActive ? 'revoke' : 'activate'} the token "${token.name}"?`);
        setDeleteAction(() => async () => {
            try {
                if (token.isActive) {
                    await api.revokeApiToken(token.id);
                    showToast('Token revoked successfully!', 'success');
                } else {
                    await api.activateApiToken(token.id);
                    showToast('Token activated successfully!', 'success');
                }
                hasFetchedRef.current = false; // Allow refetch
                await fetchData();
                setConfirmModalOpen(false);
            } catch (error) {
                showToast(`Failed to update token. ${error instanceof Error ? error.message : ''}`, 'error');
            }
        });
        setConfirmModalOpen(true);
    };

    const handleDeleteToken = (token: ApiToken) => {
        setConfirmMessage(`Are you sure you want to permanently delete the token "${token.name}"? This action cannot be undone.`);
        setDeleteAction(() => async () => {
            try {
                await api.deleteApiToken(token.id);
                showToast('Token deleted successfully!', 'success');
                hasFetchedRef.current = false; // Allow refetch
                await fetchData();
                setConfirmModalOpen(false);
            } catch (error) {
                showToast(`Failed to delete token. ${error instanceof Error ? error.message : ''}`, 'error');
            }
        });
        setConfirmModalOpen(true);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const isExpired = (expiresAt: string | null) => {
        if (!expiresAt) return false;
        return new Date(expiresAt) < new Date();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">API Tokens</h1>
                    <p className="text-slate-600 mt-1">Manage API tokens for tablet apps</p>
                </div>
                <button
                    onClick={handleOpenGenerateModal}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                    <PlusIcon className="w-5 h-5" />
                    Generate New Token
                </button>
            </div>

            {/* New Token Display Modal */}
            {showNewToken && newToken && (
                <BaseModal
                    isOpen={showNewToken}
                    onClose={() => {
                        setShowNewToken(false);
                        setGenerateModalOpen(false);
                        setNewToken(null);
                    }}
                    title="⚠️ API Token Generated"
                    showFooter={false}
                >
                    <div className="space-y-4">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p className="text-yellow-800 font-semibold mb-2">Important!</p>
                            <p className="text-yellow-700 text-sm">
                                Save this token now. It will not be shown again after you close this dialog.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">Token Name</label>
                            <p className="text-slate-900 font-semibold">{newToken.name}</p>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">API Token</label>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 bg-slate-100 p-3 rounded border text-sm font-mono break-all">
                                    {newToken.token}
                                </code>
                                <button
                                    onClick={() => newToken.token && handleCopyToken(newToken.token)}
                                    className="p-2 bg-slate-200 hover:bg-slate-300 rounded transition-colors"
                                    title="Copy token"
                                >
                                    <CopyIcon className="w-5 h-5 text-slate-700" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <label className="block text-slate-600 mb-1">Expires At</label>
                                <p className="text-slate-900">{formatDate(newToken.expiresAt || null)}</p>
                            </div>
                            <div>
                                <label className="block text-slate-600 mb-1">Created At</label>
                                <p className="text-slate-900">{formatDate(newToken.createdAt)}</p>
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-blue-800 font-semibold mb-2">Usage in Tablet App:</p>
                            <code className="text-xs text-blue-700 block bg-blue-100 p-2 rounded">
                                Authorization: Bearer {newToken.token?.substring(0, 20)}...
                            </code>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <button
                                onClick={() => {
                                    if (newToken.token) {
                                        handleCopyToken(newToken.token);
                                    }
                                }}
                                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                            >
                                Copy Token
                            </button>
                            <button
                                onClick={() => {
                                    setShowNewToken(false);
                                    setGenerateModalOpen(false);
                                    setNewToken(null);
                                }}
                                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </BaseModal>
            )}

            {/* Generate Token Modal */}
            <BaseModal
                isOpen={isGenerateModalOpen && !showNewToken}
                onClose={() => setGenerateModalOpen(false)}
                title="Generate New API Token"
                showFooter={false}
            >
                <div className="space-y-4">
                    <FormInput
                        id="tokenName"
                        label="Token Name"
                        value={tokenName}
                        onChange={(e) => setTokenName(e.target.value)}
                        placeholder="e.g., Tablet App - Restaurant 1"
                        required
                    />

                    <FormSelect
                        label="Property (Optional)"
                        value={selectedPropertyId}
                        onChange={(e) => {
                            setSelectedPropertyId(e.target.value);
                            if (e.target.value) {
                                setSelectedRestaurantId(''); // Reset restaurant when property changes
                            }
                        }}
                    >
                        <option value="">All Properties</option>
                        {(properties || []).map((prop) => (
                            <option key={prop.id} value={prop.id}>
                                {prop.name}
                            </option>
                        ))}
                    </FormSelect>

                    <FormSelect
                        label="Restaurant (Optional)"
                        value={selectedRestaurantId}
                        onChange={(e) => setSelectedRestaurantId(e.target.value)}
                        disabled={!selectedPropertyId}
                    >
                        <option value="">All Restaurants</option>
                        {(restaurants || [])
                            .filter((r) => !selectedPropertyId || r.propertyId === selectedPropertyId)
                            .map((rest) => (
                                <option key={rest.id} value={rest.id}>
                                    {rest.name}
                                </option>
                            ))}
                    </FormSelect>

                    <FormInput
                        id="expiresInDays"
                        label="Expires In (Days)"
                        type="number"
                        value={expiresInDays}
                        onChange={(e) => setExpiresInDays(parseInt(e.target.value) || 365)}
                        placeholder="365"
                    />
                    <p className="text-xs text-slate-500">Leave empty for no expiration</p>

                    <div className="flex justify-end gap-2 pt-4">
                        <button
                            type="button"
                            onClick={() => setGenerateModalOpen(false)}
                            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleGenerateToken();
                            }}
                            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                        >
                            Generate Token
                        </button>
                    </div>
                </div>
            </BaseModal>

            {/* Tokens List */}
            {tokens.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
                    <KeyIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">No API tokens found</p>
                    <p className="text-sm text-slate-500 mt-2">Generate your first token to get started</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Token Preview</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Restaurant</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Expires</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Last Used</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {tokens.map((token) => {
                                    const expired = isExpired(token.expiresAt);
                                    const restaurant = restaurants.find(r => r.id === token.restaurantId);
                                    return (
                                        <tr key={token.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-slate-900">{token.name}</div>
                                                <div className="text-xs text-slate-500">{formatDate(token.createdAt)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono">
                                                    {token.tokenPreview || token.token?.substring(0, 12) + '...' || 'N/A'}
                                                </code>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                {restaurant ? restaurant.name : 'All Restaurants'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {expired ? (
                                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Expired</span>
                                                ) : token.isActive ? (
                                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                                                ) : (
                                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-800">Inactive</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                {token.expiresAt ? formatDate(token.expiresAt) : 'Never'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                {formatDate(token.lastUsedAt || null)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleRevokeToken(token)}
                                                        className={`px-3 py-1 rounded text-xs transition-colors ${
                                                            token.isActive
                                                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                                                        }`}
                                                    >
                                                        {token.isActive ? 'Revoke' : 'Activate'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteToken(token)}
                                                        className="p-1 text-red-600 hover:text-red-800 transition-colors"
                                                        title="Delete token"
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={() => {
                    if (deleteAction) {
                        deleteAction();
                    }
                }}
                title="Confirm Action"
                message={confirmMessage}
            />
        </div>
    );
};

export default ApiTokensPage;

