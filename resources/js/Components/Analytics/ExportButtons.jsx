const FORMATS = [
    { format: 'pdf', label: 'PDF' },
    { format: 'excel', label: 'Excel' },
    { format: 'csv', label: 'CSV' },
];

export default function ExportButtons({ routeName, filters = {} }) {
    return (
        <div className="flex items-center gap-2">
            {FORMATS.map(({ format, label }) => (
                <a
                    key={format}
                    href={route(routeName, { format, ...filters })}
                    className="px-3 py-1.5 text-sm rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                    {label}
                </a>
            ))}
        </div>
    );
}
