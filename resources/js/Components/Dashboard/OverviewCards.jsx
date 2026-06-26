import React from 'react';

export default function OverviewCards({ data }) {
    const cards = [
        {
            title: 'Total Views',
            value: (data.analytics?.total_views || 0).toLocaleString(),
            icon: '👁️',
            color: 'blue',
        },
        {
            title: 'Total Clicks',
            value: (data.analytics?.total_clicks || 0).toLocaleString(),
            icon: '👆',
            color: 'green',
        },
        {
            title: 'Reviews',
            value: data.reviews_count || 0,
            icon: '⭐',
            color: 'yellow',
        },
        {
            title: 'Average Rating',
            value: (data.reviews_avg_rating || 0).toFixed(1),
            icon: '📊',
            color: 'purple',
        },
    ];

    const getBgColor = (color) => {
        const colors = {
            blue: 'from-blue-50 to-blue-100',
            green: 'from-green-50 to-green-100',
            yellow: 'from-yellow-50 to-yellow-100',
            purple: 'from-purple-50 to-purple-100',
        };
        return colors[color] || 'from-gray-50 to-gray-100';
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card) => (
                <div
                    key={card.title}
                    className={`bg-gradient-to-br ${getBgColor(card.color)} rounded-lg p-6 border border-opacity-10`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">{card.title}</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                        </div>
                        <span className="text-4xl opacity-30">{card.icon}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
