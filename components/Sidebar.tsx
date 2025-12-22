import React from 'react';
import { AnalyticsIcon, DocumentReportIcon, UsersIcon, AuditLogIcon, TagIcon, WarningIcon, AdjustmentsIcon, BellIcon, KeyIcon } from './Icons';
import { User, UserRole } from '../types';

export type Page = 'properties' | 'restaurants' | 'categories' | 'menu_items' | 'attributes' | 'allergens' | 'modifiers' | 'analytics' | 'sales_report' | 'user_management' | 'staff_management' | 'audit_log' | 'orders' | 'service_requests' | 'api_tokens';

interface SidebarProps {
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
    currentUser: User;
}

const NavItem: React.FC<{
    page: Page;
    label: string;
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
    icon?: React.ReactNode;
}> = ({ page, label, currentPage, setCurrentPage, icon }) => {
    const isActive = currentPage === page;
    return (
        <li>
            <a
                href="#"
                onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(page);
                }}
                className={`flex items-center p-3 text-base font-normal rounded-lg transition duration-75 hover:bg-primary-100 hover:text-primary-800 group ${
                    isActive
                        ? 'bg-primary-500 text-white shadow-inner'
                        : 'text-slate-700'
                }`}
            >
                {icon && <span className="w-6 h-6">{icon}</span>}
                <span className="ml-3">{label}</span>
            </a>
        </li>
    );
};

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, currentUser }) => {
    return (
        <aside className="w-64" aria-label="Sidebar">
            <div className="overflow-y-auto h-screen py-4 px-3 bg-white border-r border-slate-200">
                <div className="flex items-center pl-2.5 mb-5">
                     <svg className="h-8 w-8 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2-2z" />
                    </svg>
                    <span className="self-center text-xl font-semibold whitespace-nowrap text-slate-800 ml-2">Smartler</span>
                </div>
                <ul className="space-y-2">
                    <NavItem page="properties" label="Properties" currentPage={currentPage} setCurrentPage={setCurrentPage} />
                    <NavItem page="restaurants" label="Restaurants" currentPage={currentPage} setCurrentPage={setCurrentPage} />
                    <NavItem page="categories" label="Categories" currentPage={currentPage} setCurrentPage={setCurrentPage} />
                    <NavItem page="menu_items" label="Menu Items" currentPage={currentPage} setCurrentPage={setCurrentPage} />
                    <NavItem 
                        page="attributes" 
                        label="Item Attributes" 
                        currentPage={currentPage} 
                        setCurrentPage={setCurrentPage}
                        icon={<TagIcon className={currentPage === 'attributes' ? 'text-white' : 'text-slate-500 group-hover:text-primary-800'}/>}
                    />
                     <NavItem 
                        page="modifiers" 
                        label="Modifiers" 
                        currentPage={currentPage} 
                        setCurrentPage={setCurrentPage}
                        icon={<AdjustmentsIcon className={currentPage === 'modifiers' ? 'text-white' : 'text-slate-500 group-hover:text-primary-800'}/>}
                    />
                    <NavItem 
                        page="allergens" 
                        label="Allergens" 
                        currentPage={currentPage} 
                        setCurrentPage={setCurrentPage}
                        icon={<WarningIcon className={currentPage === 'allergens' ? 'text-white' : 'text-slate-500 group-hover:text-primary-800'}/>}
                    />
                     <div className="pt-4 mt-4 space-y-2 border-t border-slate-200">
                        <NavItem
                            page="orders"
                            label="Live Orders"
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                            icon={<BellIcon className={currentPage === 'orders' ? 'text-white' : 'text-slate-500 group-hover:text-primary-800'}/>}
                        />
                        <NavItem
                            page="service_requests"
                            label="Service Requests"
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                            icon={<BellIcon className={currentPage === 'service_requests' ? 'text-white' : 'text-slate-500 group-hover:text-primary-800'}/>}
                        />
                        <NavItem 
                            page="analytics" 
                            label="Analytics" 
                            currentPage={currentPage} 
                            setCurrentPage={setCurrentPage} 
                            icon={<AnalyticsIcon className={currentPage === 'analytics' ? 'text-white' : 'text-slate-500 group-hover:text-primary-800'}/>}
                        />
                        <NavItem 
                            page="sales_report" 
                            label="Sales Report" 
                            currentPage={currentPage} 
                            setCurrentPage={setCurrentPage}
                            icon={<DocumentReportIcon className={currentPage === 'sales_report' ? 'text-white' : 'text-slate-500 group-hover:text-primary-800'}/>}
                        />
                        {(currentUser.role === UserRole.SUPERADMIN || currentUser.role === UserRole.ADMIN) && (
                            <>
                            <NavItem 
                                page="user_management" 
                                label="User Management" 
                                currentPage={currentPage} 
                                setCurrentPage={setCurrentPage}
                                icon={<UsersIcon className={currentPage === 'user_management' ? 'text-white' : 'text-slate-500 group-hover:text-primary-800'}/>}
                            />
                            <NavItem 
                                page="staff_management" 
                                label="Staff Management" 
                                currentPage={currentPage} 
                                setCurrentPage={setCurrentPage}
                                icon={<UsersIcon className={currentPage === 'staff_management' ? 'text-white' : 'text-slate-500 group-hover:text-primary-800'}/>}
                            />
                            </>
                        )}
                        {currentUser.role === UserRole.SUPERADMIN && (
                            <>
                            <NavItem 
                                page="api_tokens" 
                                label="API Tokens" 
                                currentPage={currentPage} 
                                setCurrentPage={setCurrentPage}
                                icon={<KeyIcon className={currentPage === 'api_tokens' ? 'text-white' : 'text-slate-500 group-hover:text-primary-800'}/>}
                            />
                            <NavItem 
                                page="audit_log" 
                                label="Activity Log" 
                                currentPage={currentPage} 
                                setCurrentPage={setCurrentPage}
                                icon={<AuditLogIcon className={currentPage === 'audit_log' ? 'text-white' : 'text-slate-500 group-hover:text-primary-800'}/>}
                            />
                            </>
                        )}
                    </div>
                </ul>
            </div>
        </aside>
    );
};

export default Sidebar;
