import React from 'react';

export default function StatsCard({ title, value, change, icon, subtitle }) {
    const isPositive = change >= 0;

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-gray-600 text-sm font-medium">{title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
                    {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
                </div>
                <div className="text-4xl text-gray-300 ml-4">{icon}</div>
            </div>
            {change !== undefined && (
                <div className={`flex items-center mt-4 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    <span className="text-sm font-medium">
                        {isPositive ? '↑' : '↓'} {Math.abs(change)}%
                    </span>
                    <span className="text-xs text-gray-500 ml-2">vs previous period</span>
                </div>
            )}
        </div>
    );
}
