const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function intensityColor(ratio) {
    if (ratio <= 0) return '#f3f4f6';
    // Interpolate from light orange to strong orange-600
    const alpha = 0.15 + ratio * 0.85;
    return `rgba(234, 88, 12, ${alpha.toFixed(2)})`;
}

export default function Heatmap({ title = 'Activite par heure', data = [] }) {
    const grid = {};
    let max = 0;

    data.forEach((d) => {
        const weekday = Number(d.weekday);
        const hour = Number(d.hour);
        const count = Number(d.count);
        grid[`${weekday}-${hour}`] = count;
        if (count > max) max = count;
    });

    if (data.length === 0) {
        return null;
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">{title}</h2>
            <div className="overflow-x-auto">
                <table className="border-collapse">
                    <thead>
                        <tr>
                            <th className="w-8" />
                            {HOURS.map((h) => (
                                <th key={h} className="text-[9px] font-normal text-gray-400 px-0.5" style={{ minWidth: 14 }}>
                                    {h % 3 === 0 ? h : ''}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {WEEKDAYS.map((label, weekday) => (
                            <tr key={weekday}>
                                <td className="text-[10px] text-gray-500 pr-2 text-right">{label}</td>
                                {HOURS.map((hour) => {
                                    const count = grid[`${weekday}-${hour}`] ?? 0;
                                    const ratio = max > 0 ? count / max : 0;
                                    return (
                                        <td key={hour} className="p-0.5">
                                            <div
                                                title={`${label} ${hour}h — ${count} vues`}
                                                className="w-3.5 h-3.5 rounded-sm"
                                                style={{ backgroundColor: intensityColor(ratio) }}
                                            />
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
