export default function ServiceCard({ service }) {
    return (
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-red-200 hover:bg-red-50/40 transition-colors">
            <div className="flex items-start justify-between gap-2 mb-1">
                <p className="font-semibold text-gray-900 text-sm">{service.name}</p>
                {service.price > 0 && (
                    <span className="text-red-600 font-bold text-sm whitespace-nowrap">
                        {Number(service.price).toLocaleString('fr-FR')} MAD
                    </span>
                )}
            </div>
            {service.description && <p className="text-xs text-gray-500 leading-relaxed">{service.description}</p>}
        </div>
    );
}
