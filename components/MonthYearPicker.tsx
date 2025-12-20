import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface MonthYearPickerProps {
    date: Date;
    onChange: (newDate: Date) => void;
}

const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const MonthYearPicker: React.FC<MonthYearPickerProps> = ({ date, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [pickerYear, setPickerYear] = useState(date.getFullYear());
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);
    
    useEffect(() => {
        if(isOpen) {
            setPickerYear(date.getFullYear());
        }
    }, [isOpen, date]);

    const handleMonthSelect = (monthIndex: number) => {
        onChange(new Date(pickerYear, monthIndex, 1));
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-64 bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
                <span>{date.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                {isOpen ? <ChevronUpIcon className="h-5 w-5 text-slate-500" /> : <ChevronDownIcon className="h-5 w-5 text-slate-500" />}
            </button>

            {isOpen && (
                <div className="absolute right-0 z-20 mt-1 w-64 bg-white rounded-md shadow-lg border border-slate-200">
                    <div className="flex justify-between items-center p-2">
                        <button onClick={() => setPickerYear(pickerYear - 1)} className="p-1 rounded-full hover:bg-slate-100">
                            <ChevronLeftIcon className="h-5 w-5 text-slate-600" />
                        </button>
                        <span className="font-semibold">{pickerYear}</span>
                        <button onClick={() => setPickerYear(pickerYear + 1)} className="p-1 rounded-full hover:bg-slate-100">
                            <ChevronRightIcon className="h-5 w-5 text-slate-600" />
                        </button>
                    </div>
                    <div className="grid grid-cols-3 gap-1 p-2">
                        {months.map((month, index) => (
                            <button
                                key={month}
                                onClick={() => handleMonthSelect(index)}
                                className={`p-2 text-sm rounded-md text-center ${
                                    date.getFullYear() === pickerYear && date.getMonth() === index
                                        ? 'bg-primary-500 text-white font-semibold'
                                        : 'hover:bg-primary-100'
                                }`}
                            >
                                {month.substring(0, 3)}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MonthYearPicker;
