import React from 'react';

const Input = ({
    label,
    icon: Icon,
    className = '',
    containerClassName = '',
    ...props
}) => {
    return (
        <div className={containerClassName}>
            {label && <label className="block text-sm font-body font-medium mb-2 text-gray-500">{label}</label>}
            <div className="relative">
                {Icon && <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-orange-500" />}
                <input
                    className={`w-full ${Icon ? 'pl-12' : 'px-4'} pr-4 py-3 bg-white border border-gray-200 rounded-2xl font-body focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all text-gray-900 placeholder-gray-400 shadow-sm ${className}`}
                    {...props}
                />
            </div>
        </div>
    );
};

export default Input;
