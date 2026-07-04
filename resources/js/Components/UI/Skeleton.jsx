/**
 * Loading-skeleton primitives, built on the `.skeleton` utility (app.css).
 * Use while an Inertia visit / axios poll is in flight.
 */
export function SkeletonText({ className = 'h-4 w-full' }) {
    return <div className={`skeleton ${className}`} />;
}

export function SkeletonStat() {
    return (
        <div className="card kpi-card">
            <div className="flex items-start justify-between">
                <div className="skeleton h-4 w-24" />
                <div className="skeleton h-9 w-9 !rounded-xl" />
            </div>
            <div className="skeleton h-7 w-20" />
        </div>
    );
}

export function SkeletonStatGrid({ count = 4 }) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: count }).map((_, i) => <SkeletonStat key={i} />)}
        </div>
    );
}

export function SkeletonRow({ columns = 4 }) {
    return (
        <tr className="border-b border-gray-50">
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i} className="px-4 py-4">
                    <div className="skeleton h-4" style={{ width: `${60 + (i * 13) % 40}%` }} />
                </td>
            ))}
        </tr>
    );
}

export function SkeletonTable({ rows = 5, columns = 4 }) {
    return (
        <>
            {Array.from({ length: rows }).map((_, i) => <SkeletonRow key={i} columns={columns} />)}
        </>
    );
}

export function SkeletonCard({ lines = 3 }) {
    return (
        <div className="card p-5 space-y-3">
            <div className="skeleton h-5 w-1/3" />
            {Array.from({ length: lines }).map((_, i) => (
                <div key={i} className="skeleton h-3.5" style={{ width: `${90 - i * 12}%` }} />
            ))}
        </div>
    );
}
