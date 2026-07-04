export default function Funnel({ funnel }) {
    const steps = funnel?.steps ?? [];
    if (!steps.length) return null;

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Entonnoir de conversion</h2>
            <div className="space-y-3">
                {steps.map((s) => (
                    <div key={s.name}>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700 font-medium">{s.name}</span>
                            <span className="text-gray-500">{Number(s.count).toLocaleString('fr-FR')} ({s.percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                            <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: `${s.percentage}%` }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
