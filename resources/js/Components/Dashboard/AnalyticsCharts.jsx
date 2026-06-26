import React from 'react';

export default function AnalyticsCharts({ school, analytics }) {
    if (!analytics) {
        return (
            <div className="p-6 text-center text-gray-500">
                <p>No analytics data available yet</p>
            </div>
        );
    }

    const {
        total_views = 0,
        total_clicks = 0,
        new_leads = 0,
        ctr = 0,
        conversion_rate = 0,
    } = analytics;

    return (
        <div className="p-6 space-y-6">
            <h2 className="text-2xl font-bold">Analytics Summary</h2>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                    <p className="text-gray-600 text-sm font-medium">Total Views</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">{total_views.toLocaleString()}</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                    <p className="text-gray-600 text-sm font-medium">Total Clicks</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">{total_clicks.toLocaleString()}</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                    <p className="text-gray-600 text-sm font-medium">New Leads</p>
                    <p className="text-3xl font-bold text-purple-600 mt-2">{new_leads.toLocaleString()}</p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                    <p className="text-gray-600 text-sm font-medium">Click-Through Rate</p>
                    <p className="text-3xl font-bold text-orange-600 mt-2">{ctr.toFixed(2)}%</p>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
                    <p className="text-gray-600 text-sm font-medium">Conversion Rate</p>
                    <p className="text-3xl font-bold text-red-600 mt-2">{conversion_rate.toFixed(2)}%</p>
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">📊 About Your Analytics</h3>
                <ul className="text-blue-800 space-y-2 text-sm">
                    <li>✓ Total Views: Number of times your profile was viewed</li>
                    <li>✓ Total Clicks: Number of contact actions (phone, WhatsApp, etc.)</li>
                    <li>✓ New Leads: New contact form submissions</li>
                    <li>✓ Click-Through Rate: Percentage of viewers who clicked contact</li>
                    <li>✓ Conversion Rate: Percentage of viewers who submitted lead form</li>
                </ul>
            </div>

            {/* Analytics View */}
            <div className="bg-gray-50 rounded-lg p-6 text-center">
                <p className="text-gray-600 mb-4">View detailed analytics and charts</p>
                <a
                    href="/dashboard/analytics"
                    className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    View Full Analytics Dashboard →
                </a>
            </div>
        </div>
    );
}
