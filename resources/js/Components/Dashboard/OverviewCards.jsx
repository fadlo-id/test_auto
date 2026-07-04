import React from 'react';

const ICONS = {
    eye:   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    click: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5"/></svg>,
    star:  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    chart: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
};

export default function OverviewCards({ data }) {
    const cards = [
        { title: 'Total Views',      value: (data.analytics?.total_views  || 0).toLocaleString(), icon: ICONS.eye,   color: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' },
        { title: 'Total Clicks',     value: (data.analytics?.total_clicks || 0).toLocaleString(), icon: ICONS.click, color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' },
        { title: 'Reviews',          value: data.reviews_count || 0,                              icon: ICONS.star,  color: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' },
        { title: 'Average Rating',   value: (data.reviews_avg_rating || 0).toFixed(1),            icon: ICONS.chart, color: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card) => (
                <div key={card.title} className="card card-hover p-5">
                    <div className="flex items-start justify-between mb-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>{card.icon}</div>
                    </div>
                    <p className="text-2xl font-extrabold text-gray-900 dark:text-zinc-50 tracking-tight">{card.value}</p>
                    <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">{card.title}</p>
                </div>
            ))}
        </div>
    );
}
