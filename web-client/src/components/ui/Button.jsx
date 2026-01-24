import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
    const baseStyles = "px-6 py-3 rounded-2xl font-body font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20",
        secondary: "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm",
        outline: "bg-transparent hover:bg-orange-50 border border-orange-500 text-orange-600",
        ghost: "text-gray-500 hover:text-orange-500 hover:bg-gray-100 p-2 rounded-lg" // Added for icon buttons
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant] || variants.primary} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
