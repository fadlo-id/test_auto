import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

export default function TopListChart({ title, data, nameKey = 'name', valueKey = 'value', color = '#ea580c', height = 280 }) {
    if (!data?.length) return null;

    const chartData = data.map((d) => ({ name: d[nameKey] ?? d.name, value: Number(d[valueKey] ?? 0) }));

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">{title}</h2>
            <ResponsiveContainer width="100%" height={height}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={140} />
                    <Tooltip />
                    <Bar dataKey="value" fill={color} radius={[0, 4, 4, 0]} name="Total" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
