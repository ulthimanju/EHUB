import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const Select = ({
    label,
    value,
    onChange,
    options = [],
    icon: Icon,
    placeholder = 'Select...'
}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div>
            {label && <label className="block text-sm font-body font-medium mb-2 text-gray-500">{label}</label>}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full ${Icon ? 'pl-12' : 'px-4'} pr-4 py-3 bg-white border rounded-2xl font-body text-left flex items-center justify-between transition-all shadow-sm group ${isOpen
                            ? 'border-orange-500 ring-2 ring-orange-500/20'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                >
                    <span className={`block truncate ${value ? 'text-gray-900' : 'text-gray-400'}`}>
                        {value || placeholder}
                    </span>
                    <ChevronDown
                        className={`w-5 h-5 transition-transform duration-200 text-orange-500 ${isOpen ? 'rotate-180' : ''
                            }`}
                    />
                </button>
                {Icon && <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200 pointer-events-none text-orange-500" />}

                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setIsOpen(false)}
                        ></div>
                        <div className="absolute z-20 top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden p-1.5 animate-in fade-in zoom-in-95 duration-100 max-h-60 overflow-y-auto">
                            {options.map((option) => (
                                <button
                                    key={option}
                                    onClick={() => {
                                        onChange(option);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full px-4 py-2.5 rounded-xl text-left font-body text-sm transition-all flex items-center justify-between group/item ${value === option
                                            ? 'bg-orange-50 text-orange-700 font-medium'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <span>{option}</span>
                                    {value === option && (
                                        <Check className="w-4 h-4 text-orange-500" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Select;
