import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AuditLog, User, ActionType, UserRole } from '../types';
import * as api from '../services/supabaseService';
import { LoadingSpinner } from './LoadingSpinner';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface AuditLogPageProps {
    showToast: (message: string, type: 'success' | 'error') => void;
    currentUser: User;
}

const AuditLogPage: React.FC<AuditLogPageProps> = ({ showToast, currentUser }) => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        userId: '',
        startDate: '',
        endDate: '',
        actionType: '' as ActionType | '',
    });
    const [currentPage, setCurrentPage] = useState(1);
    const logsPerPage = 20;

    const fetchLogs = useCallback(async (currentFilters) => {
        setLoading(true);
        try {
            const fetchedLogs = await api.getAuditLogs(currentFilters);
            setLogs(fetchedLogs);
            setCurrentPage(1); 
        } catch (error) {
            showToast('Failed to fetch audit logs.', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [fetchedUsers] = await Promise.all([
                    api.getUsers(),
                    fetchLogs(filters)
                ]);
                setUsers(fetchedUsers);
            } catch (error) {
                showToast('Failed to load initial page data.', 'error');
                setLoading(false);
            }
        };
        loadInitialData();
    }, [fetchLogs]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleApplyFilters = () => {
        fetchLogs(filters);
    };
    
    const handleClearFilters = () => {
        const clearedFilters = { userId: '', startDate: '', endDate: '', actionType: '' as ActionType | '' };
        setFilters(clearedFilters);
        fetchLogs(clearedFilters);
    };

    const paginatedLogs = useMemo(() => {
        const startIndex = (currentPage - 1) * logsPerPage;
        return logs.slice(startIndex, startIndex + logsPerPage);
    }, [logs, currentPage]);
    
    const totalPages = Math.ceil(logs.length / logsPerPage);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };
    
     const getActionTypeBadge = (actionType: ActionType) => {
        switch (actionType) {
            case ActionType.CREATE:
                return 'bg-green-100 text-green-800';
            case ActionType.UPDATE:
                return 'bg-blue-100 text-blue-800';
            case ActionType.DELETE:
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-slate-100 text-slate-800';
        }
    };

    if (currentUser.role !== UserRole.SUPERADMIN) {
        return (
             <div className="bg-white shadow-md rounded-lg border border-slate-200 p-6 text-center">
                 <h2 className="text-2xl font-bold text-rose-600">Access Denied</h2>
                 <p className="text-slate-600 mt-2">You do not have permission to view this page.</p>
             </div>
        )
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-800">Activity Log</h2>

            <div className="bg-white shadow-md rounded-lg border border-slate-200 p-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    <div className="lg:col-span-1">
                        <label htmlFor="userId" className="block text-sm font-medium text-slate-700">User</label>
                        <select id="userId" name="userId" value={filters.userId} onChange={handleFilterChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500">
                            <option value="">All Users</option>
                            {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-slate-700">Start Date</label>
                        <input type="date" id="startDate" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                     <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-slate-700">End Date</label>
                        <input type="date" id="endDate" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                    <div>
                        <label htmlFor="actionType" className="block text-sm font-medium text-slate-700">Action Type</label>
                        <select id="actionType" name="actionType" value={filters.actionType} onChange={handleFilterChange} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500">
                            <option value="">All Actions</option>
                            {Object.values(ActionType).map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>
                    <div className="flex space-x-2">
                        <button onClick={handleApplyFilters} className="w-full bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-primary-700 transition">Filter</button>
                        <button onClick={handleClearFilters} className="w-full bg-white text-slate-700 border border-slate-300 font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-slate-50 transition">Clear</button>
                    </div>
                 </div>
            </div>

            <div className="bg-white shadow-md rounded-lg border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600">Timestamp</th>
                                <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600">User</th>
                                <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600">Action</th>
                                <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600">Details</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-700 divide-y divide-slate-200">
                            {loading ? (
                                <tr><td colSpan={4} className="text-center py-10"><LoadingSpinner /></td></tr>
                            ) : paginatedLogs.length > 0 ? (
                                paginatedLogs.map(log => (
                                    <tr key={log.id} className="hover:bg-slate-50">
                                        <td className="py-3 px-4 whitespace-nowrap text-sm text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                                        <td className="py-3 px-4 font-medium">{log.userName}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getActionTypeBadge(log.actionType)}`}>
                                                {log.actionType}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <p><span className="font-semibold">{log.entityType}:</span> {log.entityName}</p>
                                            <p className="text-sm text-slate-600">{log.details}</p>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={4} className="text-center py-10 text-slate-500">No activity logs found matching your criteria.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                 {totalPages > 1 && !loading && (
                    <div className="p-4 flex justify-between items-center">
                        <span className="text-sm text-slate-600">
                            Showing {((currentPage - 1) * logsPerPage) + 1} - {Math.min(currentPage * logsPerPage, logs.length)} of {logs.length}
                        </span>
                        <div className="flex items-center space-x-2">
                            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-md hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed">
                                <ChevronLeftIcon className="h-5 w-5" />
                            </button>
                            <span className="text-sm font-medium">Page {currentPage} of {totalPages}</span>
                            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-md hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed">
                                <ChevronRightIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuditLogPage;
