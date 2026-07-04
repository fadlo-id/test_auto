export default function KpiCard({ label, value, prefix = '', suffix = '', color = 'text-gray-900 dark:text-zinc-50' }) {
    const formatted = typeof value === 'number'
        ? value.toLocaleString('fr-FR', { maximumFractionDigits: 2 })
        : (value ?? '—');

    return (
        <div className="card p-5">
            <p className="text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wide mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{prefix}{formatted}{suffix}</p>
        </div>
    );
}
