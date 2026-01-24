import React from 'react';

const Badge = ({ children, icon: Icon, className = '' }) => {
    return (
        <span className={`px-4 py-1.5 bg-transparent text-orange-600 rounded-xl font-body text-sm font-medium border border-orange-500 flex items-center gap-2 ${className}`}>
            {Icon && <Icon className="w-3.5 h-3.5" />}
            {children}
        </span>
    );
};

export default Badge;
