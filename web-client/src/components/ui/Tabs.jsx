import React from 'react';

const Tabs = ({ tabs = [], activeTab, onChange }) => {
    return (
        <div className="border-b border-gray-200">
            <div className="flex gap-8">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => onChange(tab)}
                        className={`pb-4 text-sm font-medium capitalize transition-all border-b-2 ${activeTab === tab
                                ? 'border-orange-500 text-orange-600'
                                : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Tabs;
