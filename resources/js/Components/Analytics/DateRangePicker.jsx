import React from 'react';

export default function DateRangePicker({ days, onChange }) {
    const options = [
        { label: 'Last 7 days', value: 7 },
        { label: 'Last 30 days', value: 30 },
        { label: 'Last 60 days', value: 60 },
        { label: 'Last 90 days', value: 90 },
    ];

    return (
        <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Period:</label>
            <select
                value={days}
                onChange={(e) => onChange(parseInt(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                {options.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
