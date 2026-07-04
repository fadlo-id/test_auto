import { useState } from 'react';

export default function DateRangeFilter({ dateFrom, dateTo, schools = null, schoolId = null, onApply }) {
    const [from, setFrom] = useState(dateFrom ?? '');
    const [to, setTo] = useState(dateTo ?? '');
    const [selectedSchool, setSelectedSchool] = useState(schoolId ?? '');

    const apply = () => {
        onApply({
            date_from: from || undefined,
            date_to: to || undefined,
            school_id: selectedSchool || undefined,
        });
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap items-end gap-3">
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Du</label>
                <input
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Au</label>
                <input
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                />
            </div>
            {schools && (
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Auto-ecole</label>
                    <select
                        value={selectedSchool}
                        onChange={(e) => setSelectedSchool(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm min-w-[180px]"
                    >
                        <option value="">Toutes les auto-ecoles</option>
                        {schools.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>
            )}
            <button
                onClick={apply}
                className="px-4 py-1.5 text-sm rounded-lg font-medium bg-orange-600 text-white hover:bg-orange-700 transition-colors"
            >
                Appliquer
            </button>
        </div>
    );
}
