import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Sale, MenuItem, Restaurant, User, UserRole } from '../types';
import * as api from '../services/supabaseService';
import { LoadingSpinner } from './LoadingSpinner';
import StatCard from './StatCard';
import MonthYearPicker from './MonthYearPicker';
import DailyRevenueBarChart from './DailyRevenueBarChart';
import BillModal from './BillModal';
import { InfoIcon, SearchIcon, ChevronLeftIcon, ChevronRightIcon, DownloadIcon } from './Icons';

interface SalesReportPageProps {
    showToast: (message: string, type: 'success' | 'error') => void;
    currentUser: User;
}

declare var XLSX: any;

const SalesReportPage: React.FC<SalesReportPageProps> = ({ showToast, currentUser }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [allMonthlySales, setAllMonthlySales] = useState<Sale[]>([]);
    const [menuItemMap, setMenuItemMap] = useState<Map<string, MenuItem>>(new Map());
    const [restaurantMap, setRestaurantMap] = useState<Map<string, string>>(new Map());
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [selectedDay, setSelectedDay] = useState<Date | null>(null);
    const [loading, setLoading] = useState(true);
    const [isBillModalOpen, setBillModalOpen] = useState(false);
    const [selectedSaleForBill, setSelectedSaleForBill] = useState<Sale | null>(null);

    const [activeTab, setActiveTab] = useState<'overview' | 'orders'>('overview');
    const [orderSearchTerm, setOrderSearchTerm] = useState('');
    const [orderCurrentPage, setOrderCurrentPage] = useState(1);
    const ordersPerPage = 15;
    
    const isSuperAdmin = currentUser.role === UserRole.SUPERADMIN;

    useEffect(() => {
        Promise.all([
            api.getAllMenuItems(),
            api.getAllRestaurants()
        ]).then(([items, allRestaurants]) => {
            setMenuItemMap(new Map(items.map(item => [item.id, item])));
            setRestaurantMap(new Map(allRestaurants.map(r => [r.id, r.name])));
            setRestaurants(allRestaurants);
        }).catch(() => showToast('Failed to load initial report data.', 'error'));
    }, [showToast]);

    const fetchSales = useCallback(async (date: Date) => {
        setLoading(true);
        setSelectedDay(null);
        try {
            const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
            const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            const sales = await api.getSales(startOfMonth.toISOString(), endOfMonth.toISOString());
            setAllMonthlySales(sales);
        } catch (error) {
            showToast('Failed to load sales data.', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        if (menuItemMap.size > 0 && restaurantMap.size > 0) {
            fetchSales(currentDate);
        }
    }, [currentDate, menuItemMap, restaurantMap, fetchSales]);
    
    const monthlySales = useMemo(() => {
        if (isSuperAdmin) {
            return allMonthlySales;
        }
        const propertyRestaurantIds = new Set(
            restaurants
                .filter(r => r.propertyId === currentUser.propertyId)
                .map(r => r.id)
        );
        return allMonthlySales.filter(sale => propertyRestaurantIds.has(sale.restaurantId));
    }, [allMonthlySales, restaurants, currentUser, isSuperAdmin]);


    const salesByDay = useMemo(() => {
        const map = new Map<string, { sales: Sale[], total: number }>();
        for (const sale of monthlySales) {
            const day = new Date(sale.saleDate).toDateString();
            if (!map.has(day)) {
                map.set(day, { sales: [], total: 0 });
            }
            const dayData = map.get(day)!;
            dayData.sales.push(sale);
            dayData.total += sale.totalAmount;
        }
        return map;
    }, [monthlySales]);

    const monthlyStats = useMemo(() => {
        const totalRevenue = monthlySales.reduce((acc, sale) => acc + sale.totalAmount, 0);
        const totalItemsSold = monthlySales.reduce((acc, sale) => acc + sale.items.reduce((itemAcc, item) => itemAcc + item.quantity, 0), 0);
        const itemCounts = new Map<string, number>();

        monthlySales.forEach(sale => {
            sale.items.forEach(item => {
                itemCounts.set(item.menuItemId, (itemCounts.get(item.menuItemId) || 0) + item.quantity);
            });
        });
        
        let bestSellingItemId = '';
        let maxCount = 0;
        itemCounts.forEach((count, id) => {
            if (count > maxCount) {
                maxCount = count;
                bestSellingItemId = id;
            }
        });

        const bestSellingItemName = menuItemMap.get(bestSellingItemId)?.name || 'N/A';

        return {
            totalRevenue,
            totalItemsSold,
            totalOrders: monthlySales.length,
            bestSellingItem: bestSellingItemName,
        };
    }, [monthlySales, menuItemMap]);

    const dailyRevenueChartData = useMemo(() => {
        return Array.from(salesByDay.entries()).map(([dateString, data]) => {
            const day = new Date(dateString).getDate();
            return {
                day: day,
                total: data.total
            };
        });
    }, [salesByDay]);
    
    const daysInMonth = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        return new Date(year, month + 1, 0).getDate();
    }, [currentDate]);

    const paginatedOrders = useMemo(() => {
        const filtered = monthlySales
            .filter(sale => sale.id.toLowerCase().includes(orderSearchTerm.toLowerCase()))
            .sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());
        
        const totalPages = Math.ceil(filtered.length / ordersPerPage);
        const startIndex = (orderCurrentPage - 1) * ordersPerPage;
        
        return {
            data: filtered.slice(startIndex, startIndex + ordersPerPage),
            totalCount: filtered.length,
            totalPages: totalPages,
        };
    }, [monthlySales, orderSearchTerm, orderCurrentPage]);

    
    const handleDayClick = (day: number) => {
        const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        if (selectedDay?.getTime() === clickedDate.getTime()) {
            setSelectedDay(null); // Toggle off if same day is clicked
        } else {
            setSelectedDay(clickedDate);
        }
    };

    const handleOpenBillModal = (sale: Sale) => {
        setSelectedSaleForBill(sale);
        setBillModalOpen(true);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= paginatedOrders.totalPages) {
            setOrderCurrentPage(newPage);
        }
    };

    const handleExportToExcel = () => {
        if (monthlySales.length === 0) {
            showToast('No sales data to export for this month.', 'error');
            return;
        }

        const excelData = monthlySales.flatMap(sale => {
            const restaurantName = restaurantMap.get(sale.restaurantId) || 'N/A';
            const saleDateTime = new Date(sale.saleDate).toLocaleString();
            
            return sale.items.map(item => {
                const menuItem = menuItemMap.get(item.menuItemId);
                const itemName = menuItem?.name || 'Unknown Item';
                const itemSubtotal = item.quantity * item.price;

                return {
                    'Order ID': sale.id,
                    'Date & Time': saleDateTime,
                    'Restaurant': restaurantName,
                    'Table Number': sale.tableNumber,
                    'Item Name': itemName,
                    'Quantity': item.quantity,
                    'Price Per Item': item.price,
                    'Item Subtotal': itemSubtotal,
                    'Order Total': sale.totalAmount,
                };
            });
        });

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales Report');

        const monthStr = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const yearStr = currentDate.getFullYear();
        const fileName = `SalesReport_${yearStr}-${monthStr}.xlsx`;

        XLSX.writeFile(workbook, fileName);
    };

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const blanks = Array(firstDayOfMonth).fill(null);
        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

        return (
            <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="bg-slate-50 text-center py-2 text-sm font-semibold text-slate-600">{day}</div>
                ))}
                {blanks.map((_, i) => <div key={`blank-${i}`} className="bg-slate-50"></div>)}
                {days.map(day => {
                    const date = new Date(year, month, day);
                    const dayData = salesByDay.get(date.toDateString());
                    const isSelected = selectedDay?.getTime() === date.getTime();

                    return (
                        <div key={day} onClick={() => handleDayClick(day)} className={`relative p-2 h-24 bg-white hover:bg-primary-50 transition cursor-pointer flex flex-col ${isSelected ? 'ring-2 ring-primary-500 z-10' : ''}`}>
                            <div className="font-semibold text-slate-800">{day}</div>
                            {dayData && (
                                <div className="mt-auto text-right text-sm font-bold text-emerald-600">
                                    ${dayData.total.toFixed(2)}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };
    
    const renderSelectedDayDetails = () => {
        if (!selectedDay) return null;
        const dayData = salesByDay.get(selectedDay.toDateString());

        if (!dayData || dayData.sales.length === 0) {
            return (
                <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 mt-6 text-center text-slate-500">
                    No sales recorded for {selectedDay.toLocaleDateString()}.
                </div>
            );
        }
        
        const aggregatedItems = new Map<string, { quantity: number; total: number }>();
        dayData.sales.forEach(sale => {
            sale.items.forEach(item => {
                const existing = aggregatedItems.get(item.menuItemId);
                if (existing) {
                    existing.quantity += item.quantity;
                    existing.total += item.price * item.quantity;
                } else {
                    aggregatedItems.set(item.menuItemId, {
                        quantity: item.quantity,
                        total: item.price * item.quantity,
                    });
                }
            });
        });

        const sortedAggregatedItems = Array.from(aggregatedItems.entries()).sort(([, a], [, b]) => b.quantity - a.quantity);
        
        return (
             <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 mt-6">
                <div>
                    <h3 className="text-xl font-bold text-slate-700 mb-4">
                        Items Sold on {selectedDay.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                    </h3>
                     <div className="overflow-x-auto max-h-96">
                        <table className="min-w-full bg-white">
                             <thead className="bg-slate-50 sticky top-0">
                                <tr>
                                    <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600">Item</th>
                                    <th className="text-center py-3 px-4 uppercase font-semibold text-sm text-slate-600">Qty Sold</th>
                                    <th className="text-right py-3 px-4 uppercase font-semibold text-sm text-slate-600">Total Revenue</th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-700 divide-y divide-slate-200">
                                {sortedAggregatedItems.map(([menuItemId, data]) => (
                                    <tr key={menuItemId} className="hover:bg-slate-50">
                                        <td className="py-3 px-4 font-medium">{menuItemMap.get(menuItemId)?.name || 'Unknown Item'}</td>
                                        <td className="py-3 px-4 text-center">{data.quantity}</td>
                                        <td className="py-3 px-4 text-right font-mono">${data.total.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
             </div>
        );
    };

    const renderOverviewTab = () => (
        <>
            <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 space-y-6 mt-6">
                <div className="flex justify-between items-center flex-wrap gap-4">
                    <h3 className="text-xl font-semibold text-slate-700">
                        Monthly Overview: {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h3>
                    <MonthYearPicker
                        date={currentDate}
                        onChange={setCurrentDate}
                    />
                </div>
                <div>
                    <h4 className="text-md font-semibold text-slate-600 mb-2">Daily Revenue</h4>
                    <DailyRevenueBarChart data={dailyRevenueChartData} daysInMonth={daysInMonth} />
                </div>
                <div>
                    <h4 className="text-md font-semibold text-slate-600 mb-2">Select a Day</h4>
                    {renderCalendar()}
                </div>
            </div>
            {renderSelectedDayDetails()}
        </>
    );

    const renderOrdersTab = () => (
        <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 mt-6">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                <h3 className="text-xl font-bold text-slate-700">
                    All Orders: {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h3>
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <SearchIcon className="h-5 w-5 text-slate-400" />
                    </span>
                    <input
                        type="text"
                        placeholder="Search by Order ID..."
                        value={orderSearchTerm}
                        onChange={(e) => { setOrderSearchTerm(e.target.value); setOrderCurrentPage(1); }}
                        className="w-full sm:w-64 pl-10 pr-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600">Order ID</th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600">Restaurant</th>
                            <th className="text-center py-3 px-4 uppercase font-semibold text-sm text-slate-600">Table #</th>
                            <th className="text-left py-3 px-4 uppercase font-semibold text-sm text-slate-600">Date & Time</th>
                            <th className="text-center py-3 px-4 uppercase font-semibold text-sm text-slate-600">Items</th>
                            <th className="text-right py-3 px-4 uppercase font-semibold text-sm text-slate-600">Amount</th>
                            <th className="text-center py-3 px-4 uppercase font-semibold text-sm text-slate-600">Bill</th>
                        </tr>
                    </thead>
                    <tbody className="text-slate-700 divide-y divide-slate-200">
                        {paginatedOrders.data.map(sale => (
                            <tr key={sale.id} className="hover:bg-slate-50">
                                <td className="py-3 px-4 font-mono text-xs">{sale.id}</td>
                                <td className="py-3 px-4">{restaurantMap.get(sale.restaurantId) || 'N/A'}</td>
                                <td className="py-3 px-4 text-center">{sale.tableNumber}</td>
                                <td className="py-3 px-4">{new Date(sale.saleDate).toLocaleString()}</td>
                                <td className="py-3 px-4 text-center">{sale.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                                <td className="py-3 px-4 text-right font-mono">${sale.totalAmount.toFixed(2)}</td>
                                <td className="py-3 px-4 text-center">
                                    <button onClick={() => handleOpenBillModal(sale)} className="text-sky-500 hover:text-sky-700 p-2 rounded-full hover:bg-sky-100 transition" title="View Bill">
                                        <InfoIcon className="h-5 w-5"/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {paginatedOrders.totalCount === 0 && (
                <div className="text-center py-10 text-slate-500">
                    <p>No orders found for this month{orderSearchTerm ? ' matching your search' : ''}.</p>
                </div>
            )}
            {paginatedOrders.totalPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-slate-600">
                        Showing {((orderCurrentPage - 1) * ordersPerPage) + 1}-
                        {Math.min(orderCurrentPage * ordersPerPage, paginatedOrders.totalCount)} of {paginatedOrders.totalCount}
                    </span>
                    <div className="flex items-center space-x-2">
                        <button onClick={() => handlePageChange(orderCurrentPage - 1)} disabled={orderCurrentPage === 1} className="p-2 rounded-md hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed">
                            <ChevronLeftIcon className="h-5 w-5" />
                        </button>
                        <span className="text-sm font-medium">Page {orderCurrentPage} of {paginatedOrders.totalPages}</span>
                        <button onClick={() => handlePageChange(orderCurrentPage + 1)} disabled={orderCurrentPage === paginatedOrders.totalPages} className="p-2 rounded-md hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed">
                            <ChevronRightIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
    
    const TabButton: React.FC<{ tabName: 'overview' | 'orders'; label: string; }> = ({ tabName, label }) => {
        const isActive = activeTab === tabName;
        return (
            <button
                onClick={() => setActiveTab(tabName)}
                className={`px-3 py-2 font-semibold text-sm rounded-md ${
                    isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-slate-500 hover:text-slate-700'
                }`}
                aria-current={isActive ? 'page' : undefined}
            >
                {label}
            </button>
        );
    };

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-slate-800">Sales Report</h2>
                <button
                    onClick={handleExportToExcel}
                    className="flex items-center bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-emerald-700 transition duration-300"
                >
                    <DownloadIcon className="h-5 w-5 mr-2" />
                    Export to Excel
                </button>
             </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Revenue" value={`$${monthlyStats.totalRevenue.toFixed(2)}`} />
                <StatCard title="Total Items Sold" value={monthlyStats.totalItemsSold.toLocaleString()} />
                <StatCard title="Number of Orders" value={monthlyStats.totalOrders.toLocaleString()} />
                <StatCard title="Best-Selling Item" value={monthlyStats.bestSellingItem} />
            </div>

            <div className="border-b border-slate-200">
                <nav className="flex space-x-4" aria-label="Tabs">
                    <TabButton tabName="overview" label="Monthly Overview" />
                    <TabButton tabName="orders" label="View Orders" />
                </nav>
            </div>
            
            {loading ? (
                <div className="flex justify-center items-center h-96"><LoadingSpinner /></div>
            ) : (
                <>
                    {activeTab === 'overview' && renderOverviewTab()}
                    {activeTab === 'orders' && renderOrdersTab()}
                </>
            )}

            <BillModal 
                isOpen={isBillModalOpen}
                onClose={() => setBillModalOpen(false)}
                sale={selectedSaleForBill}
                menuItemMap={menuItemMap}
            />
        </div>
    );
};

export default SalesReportPage;
