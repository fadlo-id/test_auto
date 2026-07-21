import { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Calendar, Clock3, Link2, Check, Newspaper, ArrowRight } from 'lucide-react';
import PublicLayout from '@/Layouts/PublicLayout';
import Breadcrumb from '@/Components/Breadcrumb';
import { useLocale } from '@/i18n/LocaleContext';

const DATE_LOCALES = { fr: 'fr-FR', en: 'en-US', es: 'es-ES', ar: 'ar-MA' };

function readingTime(html) {
    const words = (html ?? '').replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
}

function CopyLinkButton() {
    const { t } = useLocale();
    const { url } = usePage();
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(window.location.origin + url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch { /* clipboard unavailable — silently ignore */ }
    };

    return (
        <button onClick={copy}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors">
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Link2 className="w-4 h-4" />}
            {copied ? t('blog.linkCopied') : t('blog.copyLink')}
        </button>
    );
}

export default function Show({ article, related = [], seo = {} }) {
    const { t, locale } = useLocale();
    return (
        <>
            <Head title={seo.title || article.title}>
                {seo.description && <meta name="description" content={seo.description} />}
            </Head>

            <PublicLayout>
                <div className="bg-gray-50 border-b border-gray-100 px-4 sm:px-6 py-2.5">
                    <div className="max-w-5xl mx-auto">
                        <Breadcrumb items={seo.breadcrumb || [
                            { label: t('nav.home'), href: '/' },
                            { label: t('nav.blog'), href: '/blog' },
                            { label: article.title, href: null },
                        ]} />
                    </div>
                </div>

                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <article className="lg:col-span-2">
                        {article.category && (
                            <span className="inline-block bg-red-50 text-red-700 text-xs font-semibold px-3 py-1 rounded-full border border-red-100 capitalize mb-4">
                                {article.category}
                            </span>
                        )}
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-4 text-balance font-display">{article.title}</h1>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 pb-6 mb-8 border-b border-gray-100">
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                {article.published_at ? new Date(article.published_at).toLocaleDateString(DATE_LOCALES[locale] ?? 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Clock3 className="w-4 h-4" />
                                {readingTime(article.content)} {t('common.minRead')}
                            </span>
                            {article.author?.name && <span>{t('common.byAuthor')} {article.author.name}</span>}
                            <span className="ml-auto"><CopyLinkButton /></span>
                        </div>

                        {article.image_url && (
                            <img src={article.image_url} alt={article.title}
                                className="w-full h-auto rounded-3xl border border-gray-100 mb-8 shadow-premium" loading="eager" />
                        )}

                        <div className="prose prose-gray max-w-none prose-headings:font-bold prose-a:text-red-600 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: article.content }} />
                    </article>

                    {/* Sidebar */}
                    <aside className="space-y-6">
                        {related.length > 0 && (
                            <div className="card-premium p-5 sticky top-24">
                                <h2 className="font-bold text-gray-900 mb-4">{t('blog.relatedTitle')}</h2>
                                <ul className="space-y-4">
                                    {related.map((a) => (
                                        <li key={a.id}>
                                            <Link href={route('blog.show', a.slug)} className="group flex items-start gap-3">
                                                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-50 to-amber-50 overflow-hidden shrink-0 flex items-center justify-center">
                                                    {a.image_url
                                                        ? <img src={a.image_url} alt={a.title} className="w-full h-full object-cover" loading="lazy" />
                                                        : <Newspaper className="w-5 h-5 text-red-200" strokeWidth={1.25} />}
                                                </div>
                                                <span className="text-sm font-medium text-gray-800 group-hover:text-red-700 transition-colors line-clamp-3">{a.title}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <div className="card-premium p-5 bg-gradient-to-br from-red-50 to-white text-center">
                            <p className="font-bold text-gray-900 mb-1">{t('blog.readyTitle')}</p>
                            <p className="text-sm text-gray-500 mb-4">{t('blog.readyDesc')}</p>
                            <Link href={route('search')}
                                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors shadow-sm">
                                {t('hero.searchCta')} <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </aside>
                </div>
            </PublicLayout>
        </>
    );
}
