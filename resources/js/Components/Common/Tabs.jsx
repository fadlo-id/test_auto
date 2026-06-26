import React from 'react';

export default function Tabs({ tabs, activeTab, onChange, className = '' }) {
    return (
        <div className={`border-b border-gray-200 ${className}`}>
            <div className="flex flex-wrap gap-8">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        className={`py-4 px-2 font-medium border-b-2 transition ${
                            activeTab === tab.id
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <span className="mr-2">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
