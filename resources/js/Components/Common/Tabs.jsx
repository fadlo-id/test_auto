import React from 'react';

export default function Tabs({ tabs, activeTab, onChange, className = '' }) {
    return (
        <div className={`border-b border-gray-200 dark:border-zinc-800 ${className}`}>
            <div className="flex flex-wrap gap-8">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        className={`py-4 px-2 font-medium border-b-2 transition-colors ${
                            activeTab === tab.id
                                ? 'border-orange-600 text-orange-600 dark:text-orange-400'
                                : 'border-transparent text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100'
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
