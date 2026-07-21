import { Head, useForm } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import { Mail, Phone, CheckCircle2 } from 'lucide-react';
import PublicLayout from '@/Layouts/PublicLayout';
import Reveal from '@/Components/UI/Reveal';
import { useLocale } from '@/i18n/LocaleContext';

export default function Contact({ content = '', site_email = 'contact@autoecoles.ma', site_phone = '+212 5XX XXX XXX' }) {
    const { t } = useLocale();
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
                <title>{t('pages.contactMetaTitle')}</title>
                <meta name="description" content={t('pages.contactMetaDesc')} />
            </Head>

            <PublicLayout>
                <div className="relative overflow-hidden py-20 px-4">
                    <img src="/images/marketing/hero-wheel.jpg" alt=""
                        className="absolute inset-0 w-full h-full object-cover" loading="eager" aria-hidden="true" />
                    <div className="absolute inset-0 bg-black/75" />
                    <Reveal className="relative max-w-3xl mx-auto text-center">
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 font-display">{t('footer.contactUs')}</h1>
                        <p className="text-gray-300 text-sm tracking-[0.2em] uppercase">{t('pages.contactHeroSubtitle')}</p>
                    </Reveal>
                </div>

                <div className="bg-white">
                    <div className="max-w-4xl mx-auto px-4 -mt-10 relative">
                        {/* Floating info cards */}
                        <Reveal className="grid sm:grid-cols-2 gap-5 mb-4">
                            <div className="card-premium p-6 flex items-center gap-4">
                                <span className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
                                    <Phone className="w-5 h-5 text-red-600" strokeWidth={1.75} />
                                </span>
                                <div>
                                    <p className="text-red-600 font-bold text-sm mb-0.5">{t('pages.contactCallUs')}</p>
                                    <p className="text-gray-700 text-sm">{site_phone || '+212 5XX XXX XXX'}</p>
                                </div>
                            </div>
                            <div className="card-premium p-6 flex items-center gap-4">
                                <span className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
                                    <Mail className="w-5 h-5 text-red-600" strokeWidth={1.75} />
                                </span>
                                <div>
                                    <p className="text-red-600 font-bold text-sm mb-0.5">{t('pages.contactEmailUs')}</p>
                                    <p className="text-gray-700 text-sm">{site_email || 'contact@autoecoles.ma'}</p>
                                </div>
                            </div>
                        </Reveal>
                    </div>

                    <div className="max-w-3xl mx-auto px-4 py-12">
                        {content && (
                            <div className="card-premium p-5 mb-6">
                                <div className="prose prose-gray max-w-none text-sm text-gray-600 leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: content }} />
                            </div>
                        )}

                        <Reveal delay={100} className="card-premium p-8">
                            <h2 className="font-bold text-gray-900 text-lg mb-1">{t('pages.contactFormTitle')}</h2>
                            <p className="text-sm text-gray-400 mb-6">{t('pages.contactFormSubtitle')}</p>

                            {flash?.success && (
                                <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 text-sm flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                                    {flash.success}
                                </div>
                            )}

                            <form onSubmit={submit} className="space-y-4">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">{t('pages.contactNameLabel')}</label>
                                        <input value={data.name} onChange={e => setData('name', e.target.value)} required
                                            className="input" />
                                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">{t('pages.contactEmailLabel')}</label>
                                        <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} required
                                            className="input" />
                                        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">{t('pages.contactSubjectLabel')}</label>
                                    <select value={data.subject} onChange={e => setData('subject', e.target.value)} required
                                        className="input">
                                        <option value="">{t('pages.contactSubjectPlaceholder')}</option>
                                        <option value="info">{t('pages.contactSubjectInfo')}</option>
                                        <option value="school">{t('pages.contactSubjectSchool')}</option>
                                        <option value="problem">{t('pages.contactSubjectProblem')}</option>
                                        <option value="other">{t('pages.contactSubjectOther')}</option>
                                    </select>
                                    {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">{t('pages.contactMessageLabel')}</label>
                                    <textarea rows={5} value={data.message} onChange={e => setData('message', e.target.value)} required
                                        placeholder={t('pages.contactMessagePlaceholder')}
                                        className="input resize-none" />
                                    {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
                                </div>
                                <button type="submit" disabled={processing}
                                    className="btn-shine w-full py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 transition-all shadow-sm hover:shadow-glow">
                                    {processing ? t('auth.sending') : t('pages.contactSubmitBtn')}
                                </button>
                            </form>
                        </Reveal>
                    </div>
                </div>
            </PublicLayout>
        </>
    );
}
