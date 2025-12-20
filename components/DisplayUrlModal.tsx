import React, { useState } from 'react';
import { XIcon } from './Icons';

interface DisplayUrlModalProps {
    isOpen: boolean;
    onClose: () => void;
    url: string;
    showToast: (message: string, type: 'success' | 'error') => void;
}

const DisplayUrlModal: React.FC<DisplayUrlModalProps> = ({ isOpen, onClose, url, showToast }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            showToast('URL copied to clipboard!', 'success');
            setTimeout(() => setCopied(false), 2000);
        }, () => {
            showToast('Failed to copy URL.', 'error');
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg">
                <div className="flex justify-between items-center p-4 border-b border-slate-200">
                    <h3 className="text-xl font-semibold text-slate-800">Digital Menu Display URL</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-sm text-slate-600">
                        Use this URL on your in-store digital screens. The menu will update automatically when you make changes in the portal.
                    </p>
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={url}
                            readOnly
                            className="w-full bg-slate-100 border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
                        />
                        <button
                            onClick={handleCopy}
                            className="flex-shrink-0 bg-primary-600 text-white font-semibold py-2 px-3 rounded-lg shadow-sm hover:bg-primary-700 transition duration-300 disabled:bg-primary-300"
                        >
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                </div>
                 <div className="bg-slate-50 p-4 flex justify-end space-x-2 rounded-b-lg">
                    <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DisplayUrlModal;
