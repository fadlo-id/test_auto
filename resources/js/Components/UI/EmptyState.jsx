/**
 * Consistent "nothing here yet" state for tables/lists across the app.
 * Usage: <EmptyState icon={UsersIcon} title="Aucun utilisateur" description="..." action={<Link .../>} />
 */
export default function EmptyState({ icon: Icon, title, description, action }) {
    return (
        <div className="flex flex-col items-center justify-center text-center px-6 py-16">
            {Icon && (
                <span className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
                    <Icon className="w-7 h-7 text-gray-300" strokeWidth={1.5} />
                </span>
            )}
            <p className="text-gray-900 font-semibold">{title}</p>
            {description && <p className="text-sm text-gray-400 mt-1 max-w-sm">{description}</p>}
            {action && <div className="mt-5">{action}</div>}
        </div>
    );
}
