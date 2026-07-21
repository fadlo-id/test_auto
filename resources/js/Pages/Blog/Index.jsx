import { Head, Link, router } from '@inertiajs/react';
import { Calendar, Newspaper, ArrowRight, Tag } from 'lucide-react';

const SOCIAL_ICONS = [
    { label: 'Facebook', path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
    { label: 'Instagram', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' },
    { label: 'LinkedIn', path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
];
import PublicLayout from '@/Layouts/PublicLayout';
import EmptyState from '@/Components/UI/EmptyState';
import Reveal from '@/Components/UI/Reveal';
import { useLocale } from '@/i18n/LocaleContext';

const DATE_LOCALES = { fr: 'fr-FR', en: 'en-US', es: 'es-ES', ar: 'ar-MA' };

function ArticleRow({ article, delay = 0 }) {
    const { t, locale } = useLocale();
    return (
        <Reveal delay={delay}>
            <Link href={route('blog.show', article.slug)}
                className="group flex gap-4 sm:gap-5 items-start pb-6 border-b border-gray-100 last:border-0">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-gradient-to-br from-red-50 to-amber-50 overflow-hidden relative shrink-0">
                    {article.image_url
                        ? <img src={article.image_url} alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                        : <div className="w-full h-full flex items-center justify-center text-red-200"><Newspaper className="w-8 h-8" strokeWidth={1.25} /></div>}
                </div>
                <div className="flex flex-col gap-1.5 flex-1 min-w-0 pt-1">
                    {article.category && (
                        <span className="text-red-600 text-xs font-bold uppercase tracking-wide capitalize">{article.category}</span>
                    )}
                    <h2 className="font-bold text-gray-900 leading-snug group-hover:text-red-700 transition-colors line-clamp-2 text-base sm:text-lg">
                        {article.title}
                    </h2>
                    <p className="text-xs text-gray-400 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {article.published_at ? new Date(article.published_at).toLocaleDateString(DATE_LOCALES[locale] ?? 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                        <span>· {t('blog.noComments')}</span>
                    </p>
                    <span className="text-sm text-red-600 font-semibold group-hover:underline mt-1">{t('common.readMore')} »</span>
                </div>
            </Link>
        </Reveal>
    );
}

export default function Index({ articles, categories = [], filters = {}, seo = {} }) {
    const { t } = useLocale();
    const setCategory = (category) => {
        router.get(route('blog.index'), category ? { category } : {}, { preserveScroll: true });
    };

    const list = articles?.data ?? [];

    return (
        <>
            <Head title={seo.title || t('blog.pageTitle')}>
                {seo.description && <meta name="description" content={seo.description} />}
            </Head>

            <PublicLayout>
                {/* Header band */}
                <div className="relative overflow-hidden py-16 px-4">
                    <img src="/images/marketing/hero-wheel.jpg" alt=""
                        className="absolute inset-0 w-full h-full object-cover" loading="eager" aria-hidden="true" />
                    <div className="absolute inset-0 bg-black/75" />
                    <Reveal className="relative max-w-3xl mx-auto text-center">
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 font-display">{t('blog.pageTitle')}</h1>
                        <p className="text-gray-300">{t('blog.pageSubtitle')}</p>
                    </Reveal>
                </div>

                <div className="container-page py-14">
                    {categories.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 mb-10">
                            <Tag className="w-4 h-4 text-gray-400 mr-1" />
                            <button onClick={() => setCategory(null)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors capitalize ${
                                    !filters.category ? 'bg-red-600 border-red-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-red-300'
                                }`}>
                                {t('blog.allCategories')}
                            </button>
                            {categories.map((cat) => (
                                <button key={cat} onClick={() => setCategory(cat)}
                                    className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors capitalize ${
                                        filters.category === cat ? 'bg-red-600 border-red-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-red-300'
                                    }`}>
                                    {cat}
                                </button>
                            ))}
                        </div>
                    )}

                    {list.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                            {/* Article list */}
                            <div className="lg:col-span-2 space-y-6">
                                {list.map((a, i) => <ArticleRow key={a.id} article={a} delay={i * 40} />)}

                                {articles.next_page_url && (
                                    <div className="pt-4">
                                        <Link href={articles.next_page_url} preserveScroll
                                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors shadow-sm">
                                            {t('blog.loadMore')} <ArrowRight className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Sidebar */}
                            <aside className="space-y-6">
                                <div className="card-premium p-5">
                                    <h3 className="font-bold text-gray-900 mb-4 border-b-2 border-red-600 inline-block pb-1">{t('blog.followUs')}</h3>
                                    <div className="flex gap-2.5 mt-2">
                                        {SOCIAL_ICONS.map((s) => (
                                            <a key={s.label} href="#" aria-label={s.label}
                                                className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-red-600 hover:text-white transition-colors">
                                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d={s.path} /></svg>
                                            </a>
                                        ))}
                                    </div>
                                </div>

                                {categories.length > 0 && (
                                    <div className="card-premium p-5">
                                        <h3 className="font-bold text-gray-900 mb-4 border-b-2 border-red-600 inline-block pb-1">{t('blog.topCategories')}</h3>
                                        <ul className="space-y-1 mt-2">
                                            {categories.map((cat) => (
                                                <li key={cat}>
                                                    <button onClick={() => setCategory(cat)}
                                                        className="w-full flex items-center gap-2.5 py-2 text-sm text-gray-700 hover:text-red-600 transition-colors capitalize text-left">
                                                        <Tag className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                        {cat}
                                                    </button>
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
                    ) : (
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm">
                            <EmptyState icon={Newspaper} title={t('blog.emptyTitle')}
                                description={t('blog.emptyDesc')} />
                        </div>
                    )}
                </div>
            </PublicLayout>
        </>
    );
}
