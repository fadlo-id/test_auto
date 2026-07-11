import { Head, Link, router } from '@inertiajs/react';
import { Calendar, Newspaper } from 'lucide-react';
import PublicNavbar from '@/Components/PublicNavbar';
import PublicFooter from '@/Components/PublicFooter';
import EmptyState from '@/Components/UI/EmptyState';

function ArticleCard({ article }) {
    return (
        <Link href={route('blog.show', article.slug)}
            className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-orange-200 hover:shadow-lg transition-all duration-200 flex flex-col">
            <div className="h-44 bg-gradient-to-br from-orange-50 to-amber-50 overflow-hidden relative">
                {article.image_url
                    ? <img src={article.image_url} alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    : <div className="w-full h-full flex items-center justify-center text-orange-200"><Newspaper className="w-10 h-10" strokeWidth={1.25} /></div>}
                {article.category && (
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-orange-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-orange-100 capitalize">
                        {article.category}
                    </span>
                )}
            </div>
            <div className="p-4 flex flex-col gap-2 flex-1">
                <h2 className="font-semibold text-gray-900 text-base leading-snug group-hover:text-orange-700 transition-colors line-clamp-2">
                    {article.title}
                </h2>
                {article.excerpt && <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{article.excerpt}</p>}
                <p className="text-xs text-gray-400 mt-auto pt-2 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {article.published_at ? new Date(article.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                </p>
            </div>
        </Link>
    );
}

export default function Index({ articles, categories = [], filters = {}, seo = {} }) {
    const setCategory = (category) => {
        router.get(route('blog.index'), category ? { category } : {}, { preserveScroll: true });
    };

    return (
        <>
            <Head title={seo.title || 'Blog — AutoEcoles.ma'}>
                {seo.description && <meta name="description" content={seo.description} />}
            </Head>

            <PublicNavbar />

            <div className="bg-gradient-to-br from-orange-600 to-orange-700 text-white py-16 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-3xl sm:text-4xl font-bold mb-3">Le blog AutoEcoles.ma</h1>
                    <p className="text-orange-100">Conseils, actualités et guides pratiques pour réussir votre permis de conduire au Maroc</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
                {categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-8">
                        <button onClick={() => setCategory(null)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors capitalize ${
                                !filters.category ? 'bg-orange-600 border-orange-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-orange-300'
                            }`}>
                            Tous
                        </button>
                        {categories.map((cat) => (
                            <button key={cat} onClick={() => setCategory(cat)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors capitalize ${
                                    filters.category === cat ? 'bg-orange-600 border-orange-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-orange-300'
                                }`}>
                                {cat}
                            </button>
                        ))}
                    </div>
                )}

                {articles?.data?.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
                            {articles.data.map((a) => <ArticleCard key={a.id} article={a} />)}
                        </div>

                        {articles.links?.length > 3 && (
                            <div className="flex justify-center gap-1 flex-wrap">
                                {articles.links.map((link, i) => (
                                    link.url ? (
                                        <Link key={i} href={link.url} preserveScroll
                                            className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                                                link.active
                                                    ? 'bg-orange-600 text-white shadow-sm'
                                                    : 'bg-white border border-gray-200 text-gray-700 hover:border-orange-300 hover:text-orange-700'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }} />
                                    ) : (
                                        <span key={i} className="px-3 py-2 text-gray-300 text-sm" dangerouslySetInnerHTML={{ __html: link.label }} />
                                    )
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <EmptyState icon={Newspaper} title="Aucun article pour le moment"
                            description="Revenez bientôt — nous publions régulièrement des conseils pour réussir votre permis." />
                    </div>
                )}
            </div>

            <PublicFooter />
        </>
    );
}
