import React from 'react';

export default function Alert({ type = 'success', message, onClose }) {
    const colors = {
        success: 'bg-green-50 border-green-200 text-green-800',
        error: 'bg-red-50 border-red-200 text-red-800',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800',
    };

    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ',
    };

    return (
        <div className={`border rounded-lg p-4 flex items-center justify-between ${colors[type] || colors.info}`}>
            <div className="flex items-center gap-3">
                <span className="text-2xl font-bold">{icons[type]}</span>
                <p className="font-medium">{message}</p>
            </div>
            <button
                onClick={onClose}
                className="text-lg font-bold opacity-70 hover:opacity-100 transition"
            >
                ×
            </button>
        </div>
    );
}
