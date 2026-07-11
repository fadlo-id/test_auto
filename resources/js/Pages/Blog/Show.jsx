import { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Calendar, Clock3, Link2, Check, Newspaper } from 'lucide-react';
import PublicNavbar from '@/Components/PublicNavbar';
import PublicFooter from '@/Components/PublicFooter';
import Breadcrumb from '@/Components/Breadcrumb';

function readingTime(html) {
    const words = (html ?? '').replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
}

function CopyLinkButton() {
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
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-600 transition-colors">
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Link2 className="w-4 h-4" />}
            {copied ? 'Lien copié' : 'Copier le lien'}
        </button>
    );
}

export default function Show({ article, related = [], seo = {} }) {
    return (
        <>
            <Head title={seo.title || article.title}>
                {seo.description && <meta name="description" content={seo.description} />}
            </Head>

            <PublicNavbar />

            <div className="bg-gray-50 border-b border-gray-100 px-4 sm:px-6 py-2.5">
                <div className="max-w-3xl mx-auto">
                    <Breadcrumb items={seo.breadcrumb || [
                        { label: 'Accueil', href: '/' },
                        { label: 'Blog', href: '/blog' },
                        { label: article.title, href: null },
                    ]} />
                </div>
            </div>

            <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
                {article.category && (
                    <span className="inline-block bg-orange-50 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full border border-orange-100 capitalize mb-4">
                        {article.category}
                    </span>
                )}
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-4 text-balance">{article.title}</h1>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 pb-6 mb-8 border-b border-gray-100">
                    <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {article.published_at ? new Date(article.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Clock3 className="w-4 h-4" />
                        {readingTime(article.content)} min de lecture
                    </span>
                    {article.author?.name && <span>Par {article.author.name}</span>}
                    <span className="ml-auto"><CopyLinkButton /></span>
                </div>

                {article.image_url && (
                    <img src={article.image_url} alt={article.title}
                        className="w-full h-auto rounded-2xl border border-gray-100 mb-8" loading="eager" />
                )}

                <div className="prose prose-gray max-w-none prose-headings:font-bold prose-a:text-orange-600 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: article.content }} />
            </article>

            {related.length > 0 && (
                <div className="bg-gray-50 border-t border-gray-100 py-12 px-4 sm:px-6">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="font-bold text-gray-900 mb-5">À lire aussi</h2>
                        <div className="grid sm:grid-cols-3 gap-4">
                            {related.map((a) => (
                                <Link key={a.id} href={route('blog.show', a.slug)}
                                    className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-orange-200 hover:shadow-md transition-all">
                                    <div className="h-24 bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center overflow-hidden">
                                        {a.image_url
                                            ? <img src={a.image_url} alt={a.title} className="w-full h-full object-cover" loading="lazy" />
                                            : <Newspaper className="w-6 h-6 text-orange-200" strokeWidth={1.25} />}
                                    </div>
                                    <div className="p-3">
                                        <p className="text-sm font-semibold text-gray-900 group-hover:text-orange-700 transition-colors line-clamp-2">{a.title}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <PublicFooter />
        </>
    );
}
