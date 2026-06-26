import { Head, Link, usePage } from '@inertiajs/react';

function StarRating({ value = 0 }) {
    const stars = Math.round(value);
    return (
        <span>
            {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} className={i <= stars ? 'text-yellow-400' : 'text-gray-300'}>★</span>
            ))}
        </span>
    );
}

function SchoolCard({ school }) {
    return (
        <Link href={route('school.detail', school.slug)}
            className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-36 bg-gradient-to-br from-orange-100 to-orange-50 overflow-hidden">
                {school.banner_url
                    ? <img src={`/storage/${school.banner_url}`} alt={school.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    : <div className="w-full h-full flex items-center justify-center text-orange-300 text-4xl">🏫</div>}
            </div>
            <div className="p-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-orange-50 border border-orange-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {school.logo_url
                            ? <img src={`/storage/${school.logo_url}`} alt="" className="w-full h-full object-cover" />
                            : <span className="text-orange-400 text-lg">🚗</span>}
                    </div>
                    <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{school.name}</p>
                        <p className="text-xs text-gray-500">📍 {school.city}</p>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <StarRating value={school.average_rating} />
                    <span className="text-xs text-gray-400">{school.reviews_count ?? 0} avis</span>
                </div>
                {school.categories?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                        {school.categories.slice(0, 3).map((c) => (
                            <span key={c.id} className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">{c.code}</span>
                        ))}
                    </div>
                )}
            </div>
        </Link>
    );
}

export default function HomePage({ featured = [], cities = [], categories = [], plans = [], stats = {} }) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="AutoEcoles Maroc - Trouvez votre auto-ecole" />

            {/* Navbar */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
                    <Link href={route('home')} className="font-bold text-orange-600 text-lg">
                        AutoEcoles<span className="text-gray-900">.ma</span>
                    </Link>
                    <nav className="flex items-center gap-3">
                        <Link href={route('search')} className="text-sm text-gray-600 hover:text-orange-600">Rechercher</Link>
                        {auth?.user ? (
                            <Link href={route('dashboard')} className="text-sm px-3 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                                Mon espace
                            </Link>
                        ) : (
                            <>
                                <Link href={route('login')} className="text-sm text-gray-600 hover:text-orange-600">Connexion</Link>
                                <Link href={route('register')} className="text-sm px-3 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                                    Inscription
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
            </header>

            {/* Hero */}
            <section className="bg-gradient-to-br from-orange-600 to-orange-700 text-white py-20 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
                        Trouvez la meilleure auto-ecole au Maroc
                    </h1>
                    <p className="text-orange-100 text-lg mb-8">
                        Comparez les auto-ecoles, lisez les avis et inscrivez-vous facilement
                    </p>
                    <Link href={route('search')}
                        className="inline-block bg-white text-orange-600 font-semibold px-8 py-3 rounded-xl hover:bg-orange-50 transition-colors shadow-lg">
                        Rechercher une auto-ecole
                    </Link>
                </div>
                <div className="max-w-2xl mx-auto mt-12 grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-3xl font-bold">{stats.schools ?? 500}+</p>
                        <p className="text-orange-200 text-sm">Auto-ecoles</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold">{stats.cities ?? 30}+</p>
                        <p className="text-orange-200 text-sm">Villes</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold">{stats.reviews ?? 10000}+</p>
                        <p className="text-orange-200 text-sm">Avis verifies</p>
                    </div>
                </div>
            </section>

            {/* Categories quick links */}
            {categories.length > 0 && (
                <section className="bg-white border-b border-gray-100 py-5 px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex flex-wrap gap-2 justify-center">
                            {categories.map((cat) => (
                                <Link key={cat.id} href={route('search', { category: cat.id })}
                                    className="px-4 py-1.5 rounded-full border border-gray-200 text-sm font-medium text-gray-700 hover:border-orange-400 hover:text-orange-600 transition-colors">
                                    Permis {cat.code}
                                    {cat.schools_count > 0 && <span className="ml-1 text-gray-400">({cat.schools_count})</span>}
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Featured schools */}
            {featured.length > 0 && (
                <section className="py-14 px-4 bg-gray-50">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Auto-ecoles en vedette</h2>
                            <Link href={route('search')} className="text-sm text-orange-600 hover:underline">Voir toutes →</Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {featured.map((school) => <SchoolCard key={school.id} school={school} />)}
                        </div>
                    </div>
                </section>
            )}

            {/* How it works */}
            <section className="py-14 px-4 bg-white">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Comment ca marche ?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        {[
                            { icon: '🔍', title: 'Recherchez', desc: 'Trouvez des auto-ecoles pres de chez vous par ville ou categorie de permis.' },
                            { icon: '⭐', title: 'Comparez', desc: 'Lisez les avis verifies, comparez les prix et les services proposes.' },
                            { icon: '✅', title: 'Contactez', desc: "Contactez directement l'auto-ecole de votre choix et inscrivez-vous." },
                        ].map((step, i) => (
                            <div key={i} className="p-6">
                                <div className="text-5xl mb-4">{step.icon}</div>
                                <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                                <p className="text-gray-500 text-sm">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Plans */}
            {plans.length > 0 && (
                <section className="py-14 px-4 bg-gray-50">
                    <div className="max-w-5xl mx-auto">
                        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Plans pour auto-ecoles</h2>
                        <p className="text-center text-gray-500 text-sm mb-10">Augmentez votre visibilite et attirez plus d'eleves</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {plans.map((plan) => (
                                <div key={plan.id} className="bg-white rounded-2xl border-2 border-gray-100 p-6">
                                    <h3 className="font-bold text-lg text-gray-900 mb-1">{plan.name}</h3>
                                    <p className="text-3xl font-bold text-orange-600 mb-1">
                                        {Number(plan.price).toLocaleString()} MAD
                                    </p>
                                    <p className="text-xs text-gray-400 mb-4">/{plan.billing_period === 'yearly' ? 'an' : 'mois'}</p>
                                    {plan.description && <p className="text-sm text-gray-500 mb-4">{plan.description}</p>}
                                    <Link href={route('register')}
                                        className="block text-center py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700">
                                        Commencer
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-8 px-4">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="font-bold text-white">AutoEcoles.ma</p>
                    <p className="text-xs">© 2026 AutoEcoles Maroc. Tous droits reserves.</p>
                </div>
            </footer>
        </>
    );
}
