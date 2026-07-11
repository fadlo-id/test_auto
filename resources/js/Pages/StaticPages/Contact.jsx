import { Head, useForm } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { Mail, Phone, MapPin, Clock3, CheckCircle2 } from 'lucide-react';

export default function Contact({ content = '', site_email = 'contact@autoecoles.ma', site_phone = '+212 5XX XXX XXX' }) {
    const { flash } = usePage().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        name:    '',
        email:   '',
        subject: '',
        message: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('contact.submit'), { onSuccess: () => reset() });
    };

    return (
        <>
            <Head>
                <title>Contact — AutoEcoles Maroc</title>
                <meta name="description" content="Contactez l'équipe AutoEcoles Maroc." />
            </Head>
            <div className="min-h-screen bg-gray-50">
                <div className="bg-gradient-to-br from-orange-600 to-orange-700 text-white py-16 px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-3xl font-bold mb-3">Contactez-nous</h1>
                        <p className="text-orange-100">Notre équipe vous répond sous 24h ouvrées</p>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto px-4 py-16 grid md:grid-cols-3 gap-8">
                    {/* Contact info */}
                    <div className="space-y-6">
                        {content && (
                            <div className="bg-white rounded-2xl border border-gray-200 p-5">
                                <div className="prose prose-gray max-w-none text-sm text-gray-600 leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: content }} />
                            </div>
                        )}
                        {[
                            { icon: Mail, label: 'Email', value: site_email || 'contact@autoecoles.ma' },
                            { icon: Phone, label: 'Téléphone', value: site_phone || '+212 5XX XXX XXX' },
                            { icon: MapPin, label: 'Adresse', value: 'Casablanca, Maroc' },
                            { icon: Clock3, label: 'Horaires', value: 'Lun–Ven 9h–18h' },
                        ].map(c => (
                            <div key={c.label} className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <c.icon className="w-5 h-5 text-orange-600" strokeWidth={1.75} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-medium">{c.label}</p>
                                    <p className="text-sm text-gray-700 font-medium">{c.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Form */}
                    <div className="md:col-span-2">
                        <div className="bg-white rounded-2xl border border-gray-200 p-8">
                            {flash?.success && (
                                <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 text-sm flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                                    {flash.success}
                                </div>
                            )}

                            <form onSubmit={submit} className="space-y-4">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Nom *</label>
                                        <input value={data.name} onChange={e => setData('name', e.target.value)} required
                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
                                        <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} required
                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                                        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Sujet *</label>
                                    <select value={data.subject} onChange={e => setData('subject', e.target.value)} required
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                                        <option value="">Choisir un sujet</option>
                                        <option value="info">Demande d'information</option>
                                        <option value="school">Inscrire mon auto-école</option>
                                        <option value="problem">Signaler un problème</option>
                                        <option value="other">Autre</option>
                                    </select>
                                    {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Message *</label>
                                    <textarea rows={5} value={data.message} onChange={e => setData('message', e.target.value)} required
                                        placeholder="Décrivez votre demande en détail..."
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none" />
                                    {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
                                </div>
                                <button type="submit" disabled={processing}
                                    className="w-full py-3 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 disabled:opacity-50 transition-colors">
                                    {processing ? 'Envoi en cours...' : 'Envoyer le message'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
