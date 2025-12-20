import React, { useState } from 'react';
import * as api from '../services/supabaseService';
import { User } from '../types';
import { LoadingSpinnerIcon } from './Icons';

interface LoginPageProps {
    onLoginSuccess: (user: User) => void;
    onSwitchToSignUp?: () => void;
    showToast: (message: string, type: 'success' | 'error') => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onSwitchToSignUp, showToast }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const user = await api.login(email, password);
            onLoginSuccess(user);
        } catch (err: any) {
            // Handle ApiError objects properly
            let errorMessage = 'An unknown error occurred.';
            if (err instanceof Error) {
                errorMessage = err.message;
            } else if (err && typeof err === 'object' && 'message' in err) {
                errorMessage = String(err.message);
            } else if (typeof err === 'string') {
                errorMessage = err;
            }
            setError(errorMessage);
            showToast(errorMessage, 'error');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 border border-slate-200">
                <div className="flex flex-col items-center mb-6">
                    <div className="flex items-center space-x-2">
                        <svg className="h-10 w-10 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h1 className="text-3xl font-bold text-slate-800">
                            Smartler <span className="text-primary-600 font-semibold">Portal</span>
                        </h1>
                    </div>
                     <p className="text-slate-500 mt-2">Sign in to manage your F&B menus.</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                            Email address
                        </label>
                        <div className="mt-1">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                placeholder="super@smartler.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                            Password
                        </label>
                        <div className="mt-1">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                placeholder="password"
                            />
                        </div>
                    </div>
                    
                    {error && (
                        <div className="text-center text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300 disabled:cursor-not-allowed"
                        >
                            {isLoading ? <LoadingSpinnerIcon className="h-5 w-5" /> : 'Sign In'}
                        </button>
                    </div>
                </form>

                {onSwitchToSignUp && (
                    <div className="mt-6 text-center">
                        <button
                            onClick={onSwitchToSignUp}
                            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                            Don't have an account? Create one
                        </button>
                    </div>
                )}

                 <div className="mt-6 text-center text-xs text-slate-400">
                    <p>Demo accounts:</p>
                    <p>super@smartler.com (Superadmin)</p>
                    <p>john.doe@grandhotel.com (Property Admin)</p>
                    <p>Password for all accounts: <strong>password</strong></p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
