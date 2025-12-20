import React from 'react';
import { XIcon } from './Icons';
import DigitalMenuPage from './DigitalMenuPage';

interface DigitalMenuPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    restaurantId: string | null;
}

const DigitalMenuPreviewModal: React.FC<DigitalMenuPreviewModalProps> = ({ isOpen, onClose, restaurantId }) => {
    if (!isOpen || !restaurantId) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-75 z-[60] flex justify-center items-center p-4 sm:p-6 lg:p-8"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="relative bg-slate-800 p-2 sm:p-4 rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col border-4 border-slate-700"
                onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
            >
                {/* Bezel top */}
                <div className="flex-shrink-0 flex justify-between items-center px-4 py-2 bg-slate-900 rounded-t-lg">
                    <div className="h-3 w-3 bg-slate-700 rounded-full"></div>
                    <span className="text-sm text-slate-400">Digital Menu Preview</span>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-white"
                        aria-label="Close preview"
                    >
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Screen Content */}
                <div className="flex-grow bg-slate-900 overflow-y-auto">
                    <DigitalMenuPage restaurantId={restaurantId} />
                </div>

                 {/* Bezel bottom */}
                 <div className="flex-shrink-0 h-8 bg-slate-900 rounded-b-lg flex items-center justify-center">
                    <div className="h-1.5 w-20 bg-slate-700 rounded-full"></div>
                 </div>
            </div>
        </div>
    );
};

export default DigitalMenuPreviewModal;
