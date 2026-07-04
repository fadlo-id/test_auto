export default function Panel({ title, children }) {
    return (
        <div className="card p-5">
            <h2 className="font-semibold text-gray-900 dark:text-zinc-100 mb-4">{title}</h2>
            {children}
        </div>
    );
}
