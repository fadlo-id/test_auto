/**
 * Canonical KPI stat card used across Admin / School / User dashboards.
 * Keeps every dashboard's headline numbers visually consistent.
 */
export default function StatCard({ icon: Icon, label, value, trend, trendLabel, tone = 'orange' }) {
    const toneClasses = {
        orange: 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400',
        emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
        blue: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
        purple: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400',
        amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
        red: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
        gray: 'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400',
    };

    const isPositive = typeof trend === 'number' && trend >= 0;

    return (
        <div className="card kpi-card card-hover">
            <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">{label}</p>
                {Icon && (
                    <span className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${toneClasses[tone] ?? toneClasses.orange}`}>
                        <Icon className="w-5 h-5" />
                    </span>
                )}
            </div>

            <p className="text-2xl font-extrabold text-gray-900 dark:text-zinc-50 tracking-tight">{value}</p>

            {typeof trend === 'number' && (
                <div className="flex items-center gap-1.5 text-xs font-medium">
                    <span className={isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                        {isPositive ? '+' : ''}{trend}%
                    </span>
                    {trendLabel && <span className="text-gray-400 dark:text-zinc-500">{trendLabel}</span>}
                </div>
            )}
        </div>
    );
}
