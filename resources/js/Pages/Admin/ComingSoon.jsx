import AdminLayout from '@/Layouts/AdminLayout';
import { Construction } from 'lucide-react';

export default function ComingSoon({ module, desc }) {
    return (
        <AdminLayout title={module}>
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center max-w-lg mx-auto px-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-2xl mb-6">
                        <Construction className="w-10 h-10 text-orange-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">{module}</h2>
                    <p className="text-gray-500 text-base leading-relaxed mb-8">{desc}</p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-full text-sm text-orange-700 font-medium">
                        <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                        Module en développement
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
