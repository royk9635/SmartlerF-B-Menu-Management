import React, { useState, useEffect } from 'react'
import { Header } from './components/Header'
import Sidebar, { Page } from './components/Sidebar'
import PropertiesPage from './components/PropertiesPage'
import RestaurantsPage from './components/RestaurantsPage'
import CategoriesPage from './components/CategoriesPage'
import MenuItemsPage from './components/MenuItemsPage'
import AnalyticsPage from './components/AnalyticsPage'
import SalesReportPage from './components/SalesReportPage'
import UserManagementPage from './components/UserManagementPage'
import AuditLogPage from './components/AuditLogPage'
import Toast from './components/Toast'
import { User, UserRole } from './types'
import DigitalMenuPage from './components/DigitalMenuPage'
import AttributesPage from './components/AttributesPage'
import AllergensPage from './components/AllergensPage'
import ModifiersPage from './components/ModifiersPage'
import OrdersPage from './components/OrdersPage'
import ApiTokensPage from './components/ApiTokensPage'
import LoginPage from './components/LoginPage'
import SignUpPage from './components/SignUpPage'
import * as api from './services/supabaseService'

type MenuItemSelection = {
    propertyId: string,
    restaurantId: string,
    categoryId: string,
    subCategoryId?: string,
};

type AuthPage = 'login' | 'signup';

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>('properties')
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [menuItemsPageInitialSelection, setMenuItemsPageInitialSelection] = useState<MenuItemSelection | null>(null);
    
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [authPage, setAuthPage] = useState<AuthPage>('login');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('smartler_user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                setCurrentUser(user);
            } catch (e) {
                localStorage.removeItem('smartler_user');
            }
        }
        setIsLoading(false);
    }, []);

    const urlParams = new URLSearchParams(window.location.search);
    const displayRestaurantId = urlParams.get('display_restaurant_id');

    if (displayRestaurantId) {
        return <DigitalMenuPage restaurantId={displayRestaurantId} />;
    }

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 5000);
    };

    const handleLoginSuccess = (user: User) => {
        setCurrentUser(user);
        localStorage.setItem('smartler_user', JSON.stringify(user));
        showToast(`Welcome back, ${user.name}!`, 'success');
    };

    const handleLogout = async () => {
        try {
            await api.logout();
        } catch (e) {
            console.error('Logout error:', e);
        }
        setCurrentUser(null);
        localStorage.removeItem('smartler_user');
        setCurrentPage('properties');
        showToast('You have been logged out.', 'success');
    };

    const handleNavigateToMenuItems = (selection: MenuItemSelection) => {
        setMenuItemsPageInitialSelection(selection);
        setCurrentPage('menu_items');
    };

    const clearMenuItemsInitialSelection = () => {
        setMenuItemsPageInitialSelection(null);
    };

    const renderPage = () => {
        if (!currentUser) return null;
        
        switch (currentPage) {
            case 'properties':
                return <PropertiesPage showToast={showToast} currentUser={currentUser} />
            case 'restaurants':
                return <RestaurantsPage showToast={showToast} currentUser={currentUser} />
            case 'categories':
                return <CategoriesPage showToast={showToast} onNavigateToMenuItems={handleNavigateToMenuItems} currentUser={currentUser} />
            case 'menu_items':
                return <MenuItemsPage 
                            showToast={showToast} 
                            initialSelection={menuItemsPageInitialSelection}
                            onSelectionConsumed={clearMenuItemsInitialSelection}
                            currentUser={currentUser}
                        />
            case 'attributes':
                return <AttributesPage showToast={showToast} currentUser={currentUser} />
            case 'allergens':
                return <AllergensPage showToast={showToast} currentUser={currentUser} />
            case 'modifiers':
                return <ModifiersPage showToast={showToast} currentUser={currentUser} />
            case 'orders':
                return <OrdersPage showToast={showToast} currentUser={currentUser} />;
            case 'analytics':
                return <AnalyticsPage showToast={showToast} currentUser={currentUser} />
            case 'sales_report':
                return <SalesReportPage showToast={showToast} currentUser={currentUser} />
            case 'user_management':
                 return <UserManagementPage showToast={showToast} currentUser={currentUser} />
            case 'api_tokens':
                 return <ApiTokensPage showToast={showToast} currentUser={currentUser} />
            case 'audit_log':
                 return <AuditLogPage showToast={showToast} currentUser={currentUser} />
            default:
                return <PropertiesPage showToast={showToast} currentUser={currentUser} />
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!currentUser) {
        return (
            <>
                {authPage === 'login' ? (
                    <LoginPage 
                        onLoginSuccess={handleLoginSuccess}
                        onSwitchToSignUp={() => setAuthPage('signup')}
                        showToast={showToast}
                    />
                ) : (
                    <SignUpPage 
                        onSignUpSuccess={handleLoginSuccess}
                        onSwitchToLogin={() => setAuthPage('login')}
                        showToast={showToast}
                    />
                )}
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            </>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen font-sans flex">
            <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} currentUser={currentUser} />
            <div className="flex-1 flex flex-col">
                <Header 
                    currentUser={currentUser}
                    onLogout={handleLogout}
                />
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                    {renderPage()}
                </main>
            </div>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    )
}

export default App
