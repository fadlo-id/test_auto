import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Search, MapPin, Star, ClipboardCheck, ShieldCheck, Wallet, Lock, Smartphone, Check } from 'lucide-react';
import PublicNavbar from '@/Components/PublicNavbar';
import PublicFooter from '@/Components/PublicFooter';
import SchoolCard  from '@/Components/SchoolCard';
import Reveal from '@/Components/UI/Reveal';
import Accordion from '@/Components/UI/Accordion';

/* ── Inline Search Bar ──────────────────────────────────────── */
function HeroSearch() {
    const [search, setSearch] = useState('');
    const [city, setCity]     = useState('');

    const go = (e) => {
        e.preventDefault();
        const params = {};
        if (search) params.search = search;
        if (city)   params.city   = city;
        router.get(route('search'), params);
    };

    return (
        <form onSubmit={go}
            className="flex flex-col sm:flex-row gap-2 bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-2xl shadow-2xl max-w-2xl mx-auto w-full">
            <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nom de l'auto-école…"
                aria-label="Rechercher une auto-école"
                className="flex-1 min-w-0 bg-white text-gray-900 rounded-xl px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ville"
                aria-label="Ville"
                className="sm:w-36 bg-white text-gray-900 rounded-xl px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <button type="submit"
                className="bg-orange-500 hover:bg-orange-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-lg whitespace-nowrap">
                Rechercher
            </button>
        </form>
    );
}

/* ── Stat counter tile ──────────────────────────────────────── */
function StatTile({ value, label, suffix = '+' }) {
    return (
        <div className="text-center">
            <p className="text-4xl sm:text-5xl font-extrabold text-white tabular-nums">
                {Number(value ?? 0).toLocaleString('fr-FR')}{suffix}
            </p>
            <p className="text-orange-200 text-sm mt-1 font-medium">{label}</p>
        </div>
    );
}

/* ── How-it-works step ─────────────────────────────────────── */
function Step({ n, icon, title, desc }) {
    return (
        <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all">
            <div className="relative mb-5">
                <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center text-3xl shadow-sm">
                    {icon}
                </div>
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-orange-600 text-white text-xs font-bold flex items-center justify-center shadow">
                    {n}
                </span>
            </div>
            <h3 className="font-bold text-gray-900 mb-2 text-base">{title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
        </div>
    );
}

/* ── Plan card ─────────────────────────────────────────────── */
function PlanCard({ plan, featured = false }) {
    const feats = plan.features ?? [];
    return (
        <div className={`relative flex flex-col rounded-2xl border-2 p-6 transition-all ${
            featured
                ? 'border-orange-500 bg-orange-50 shadow-xl shadow-orange-100'
                : 'border-gray-100 bg-white hover:border-orange-200 hover:shadow-md'
        }`}>
            {featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow">
                    Le plus populaire
                </span>
            )}
            <h3 className="font-bold text-gray-900 text-lg mb-1">{plan.name}</h3>
            <div className="mb-4">
                <span className="text-4xl font-extrabold text-gray-900">{Number(plan.price).toLocaleString('fr-FR')}</span>
                <span className="text-gray-400 ml-1 text-sm">MAD / {plan.billing_period === 'yearly' ? 'an' : 'mois'}</span>
            </div>
            {plan.description && <p className="text-gray-500 text-sm mb-5">{plan.description}</p>}
            {feats.length > 0 && (
                <ul className="space-y-2 mb-6 flex-1">
                    {feats.slice(0, 6).map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <Check className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                            {f}
                        </li>
                    ))}
                </ul>
            )}
            <Link href={route('school-application.create')}
                className={`mt-auto block text-center py-3 rounded-xl font-semibold text-sm transition-colors ${
                    featured
                        ? 'bg-orange-600 text-white hover:bg-orange-700 shadow-md'
                        : 'border-2 border-orange-200 text-orange-700 hover:bg-orange-50'
                }`}>
                Commencer →
            </Link>
        </div>
    );
}

const HOME_FAQ = [
    { question: 'Est-ce que le service est gratuit pour les candidats ?', answer: "Oui, totalement. La recherche, la comparaison et la prise de contact avec les auto-écoles est gratuite pour les candidats au permis." },
    { question: 'Comment inscrire mon auto-école ?', answer: 'Créez un compte en cliquant sur « Inscrire mon école », complétez votre profil et choisissez un plan. Votre fiche sera visible après validation de notre équipe.' },
    { question: 'Les avis sont-ils authentiques ?', answer: 'Tous les avis publiés sur notre plateforme sont modérés avant publication pour garantir leur authenticité et la qualité des informations.' },
    { question: 'Comment contacter une auto-école ?', answer: "Depuis la fiche de chaque auto-école, vous pouvez appeler, envoyer un message WhatsApp, envoyer un email ou soumettre une demande d'inscription en ligne." },
    { question: 'Quels types de permis sont référencés ?', answer: 'Nous référençons toutes les catégories de permis disponibles au Maroc : A (moto), B (voiture), C/D (poids lourds), et plus encore.' },
];

/* ── Main page ─────────────────────────────────────────────── */
export default function HomePage({ featured = [], latest = [], cities = [], categories = [], plans = [], stats = {}, seo = {} }) {
    return (
        <>
            <Head title={seo.title || 'AutoEcoles.ma — Trouvez votre auto-école au Maroc'} />

            {/* ── Hero ── */}
            <div className="relative bg-gradient-to-br from-gray-950 via-orange-950 to-gray-900 overflow-hidden">
                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

                <PublicNavbar transparent />

                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-20 pb-24 text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 text-orange-200 text-xs font-medium px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
                        <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                        La référence des auto-écoles au Maroc
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-5 leading-tight tracking-tight">
                        Trouvez la meilleure<br />
                        <span className="text-orange-400">auto-école</span> au Maroc
                    </h1>
                    <p className="text-gray-300 text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
                        Comparez les auto-écoles, lisez les avis vérifiés et inscrivez-vous en quelques clics.
                    </p>

                    <HeroSearch />

                    {/* Quick filters */}
                    {categories.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-2 mt-6">
                            {categories.slice(0, 6).map((cat) => (
                                <Link key={cat.id} href={route('search.category', cat.code)}
                                    className="px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/15 text-white/80 hover:text-white text-xs font-medium rounded-full transition-all backdrop-blur-sm">
                                    Permis {cat.code}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Stats bar */}
                <div className="relative border-t border-white/10 bg-white/5 backdrop-blur-sm">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-3 gap-6">
                        <StatTile value={stats.schools}  label="Auto-écoles" />
                        <StatTile value={stats.cities}   label="Villes" />
                        <StatTile value={stats.reviews}  label="Avis vérifiés" />
                    </div>
                </div>
            </div>

            {/* ── Featured schools ── */}
            {featured.length > 0 && (
                <section className="py-16 px-4 sm:px-6 bg-white">
                    <div className="max-w-6xl mx-auto">
                        <Reveal className="flex items-end justify-between mb-8">
                            <div>
                                <p className="text-orange-600 text-sm font-semibold uppercase tracking-widest mb-1">Sélection</p>
                                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Auto-écoles en vedette</h2>
                            </div>
                            <Link href={route('search')} className="text-sm text-orange-600 hover:underline font-medium hidden sm:block">
                                Voir toutes →
                            </Link>
                        </Reveal>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {featured.map((s, i) => <SchoolCard key={s.id} school={s} priority={i < 3} featured />)}
                        </div>
                        <div className="mt-6 text-center sm:hidden">
                            <Link href={route('search')} className="text-sm text-orange-600 hover:underline font-medium">
                                Voir toutes les auto-écoles →
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* ── Cities grid ── */}
            {cities.length > 0 && (
                <section className="py-16 px-4 sm:px-6 bg-gray-50">
                    <div className="max-w-6xl mx-auto">
                        <Reveal className="text-center mb-10">
                            <p className="text-orange-600 text-sm font-semibold uppercase tracking-widest mb-1">Localisation</p>
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Rechercher par ville</h2>
                        </Reveal>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {cities.map((c) => (
                                <Link key={c.city} href={route('search.city', encodeURIComponent(c.city))}
                                    className="group flex flex-col items-center p-4 bg-white rounded-2xl border border-gray-100 hover:border-orange-300 hover:shadow-md transition-all">
                                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center mb-2 group-hover:bg-orange-100 transition-colors">
                                        <MapPin className="w-5 h-5 text-orange-500" />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-800 group-hover:text-orange-700 text-center transition-colors">{c.city}</span>
                                    <span className="text-xs text-gray-400 mt-0.5">{c.schools_count} école{c.schools_count > 1 ? 's' : ''}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── Latest schools ── */}
            {latest.length > 0 && (
                <section className="py-16 px-4 sm:px-6 bg-white">
                    <div className="max-w-6xl mx-auto">
                        <Reveal className="flex items-end justify-between mb-8">
                            <div>
                                <p className="text-orange-600 text-sm font-semibold uppercase tracking-widest mb-1">Nouveautés</p>
                                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Dernières inscriptions</h2>
                            </div>
                            <Link href={route('search', { sort: 'newest' })} className="text-sm text-orange-600 hover:underline font-medium hidden sm:block">
                                Voir toutes →
                            </Link>
                        </Reveal>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {latest.map((s) => <SchoolCard key={s.id} school={s} />)}
                        </div>
                    </div>
                </section>
            )}

            {/* ── How it works ── */}
            <section className="py-16 px-4 sm:px-6 bg-gray-50">
                <div className="max-w-5xl mx-auto">
                    <Reveal className="text-center mb-12">
                        <p className="text-orange-600 text-sm font-semibold uppercase tracking-widest mb-1">Simple & Rapide</p>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Comment ça fonctionne ?</h2>
                    </Reveal>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <Step n="1" icon={<Search className="w-7 h-7 text-orange-600" strokeWidth={1.7} />} title="Recherchez" desc="Cherchez une auto-école par ville, catégorie de permis ou nom. Trouvez l'école parfaite pour vos besoins." />
                        <Step n="2" icon={<Star className="w-7 h-7 text-orange-600" strokeWidth={1.7} />} title="Comparez" desc="Lisez les avis vérifiés, consultez les tarifs et services proposés par chaque auto-école." />
                        <Step n="3" icon={<ClipboardCheck className="w-7 h-7 text-orange-600" strokeWidth={1.7} />} title="Inscrivez-vous" desc="Contactez l'auto-école directement ou soumettez une demande d'inscription en ligne." />
                    </div>
                </div>
            </section>

            {/* ── Why us ── */}
            <section className="py-16 px-4 sm:px-6 bg-white">
                <div className="max-w-5xl mx-auto">
                    <Reveal className="text-center mb-12">
                        <p className="text-orange-600 text-sm font-semibold uppercase tracking-widest mb-1">Nos avantages</p>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Pourquoi nous choisir ?</h2>
                    </Reveal>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {[
                            { icon: <ShieldCheck className="w-6 h-6" strokeWidth={1.7} />, color: 'bg-green-50 text-green-600', title: 'Avis vérifiés', desc: 'Chaque avis est contrôlé avant publication.' },
                            { icon: <Wallet className="w-6 h-6" strokeWidth={1.7} />, color: 'bg-blue-50 text-blue-600', title: '100% Gratuit', desc: 'La recherche et la comparaison sont entièrement gratuites.' },
                            { icon: <Lock className="w-6 h-6" strokeWidth={1.7} />, color: 'bg-purple-50 text-purple-600', title: 'Données sécurisées', desc: 'Vos informations personnelles sont protégées.' },
                            { icon: <Smartphone className="w-6 h-6" strokeWidth={1.7} />, color: 'bg-orange-50 text-orange-600', title: 'Mobile Friendly', desc: 'Accès depuis tous vos appareils, partout au Maroc.' },
                        ].map((f) => (
                            <div key={f.title} className="flex flex-col items-center text-center p-5 rounded-2xl border border-gray-100 hover:border-orange-100 hover:bg-orange-50/50 transition-all">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${f.color}`}>{f.icon}</div>
                                <h3 className="font-bold text-gray-900 mb-1.5 text-sm">{f.title}</h3>
                                <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Plans ── */}
            {plans.length > 0 && (
                <section className="py-16 px-4 sm:px-6 bg-gray-950 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(234,88,12,0.12)_0%,transparent_70%)] pointer-events-none" />
                    <div className="relative max-w-5xl mx-auto">
                        <Reveal className="text-center mb-12">
                            <p className="text-orange-500 text-sm font-semibold uppercase tracking-widest mb-1">Tarifs</p>
                            <h2 className="text-2xl sm:text-3xl font-bold text-white">Plans pour auto-écoles</h2>
                            <p className="text-gray-400 mt-2 text-sm max-w-md mx-auto">
                                Augmentez votre visibilité, attirez plus d'élèves et gérez votre présence en ligne.
                            </p>
                            <Link href={route('pricing')} className="inline-block mt-3 text-sm text-orange-400 hover:underline font-medium">
                                Voir le détail des formules →
                            </Link>
                        </Reveal>
                        <div className={`grid gap-6 ${plans.length === 1 ? 'max-w-sm mx-auto' : plans.length === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto' : 'grid-cols-1 md:grid-cols-3'}`}>
                            {plans.map((plan, i) => (
                                <PlanCard key={plan.id} plan={plan} featured={i === 1 && plans.length === 3} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── FAQ ── */}
            <section className="py-16 px-4 sm:px-6 bg-white">
                <div className="max-w-2xl mx-auto">
                    <Reveal className="text-center mb-10">
                        <p className="text-orange-600 text-sm font-semibold uppercase tracking-widest mb-1">Questions fréquentes</p>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">FAQ</h2>
                    </Reveal>
                    <div className="bg-gray-50 rounded-2xl border border-gray-100 px-6">
                        <Accordion items={HOME_FAQ} />
                    </div>
                </div>
            </section>

            {/* ── CTA Banner ── */}
            <section className="py-16 px-4 sm:px-6 bg-gradient-to-r from-orange-600 to-orange-500">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Vous êtes propriétaire d'une auto-école ?</h2>
                    <p className="text-orange-100 mb-8 text-sm sm:text-base">
                        Inscrivez votre auto-école gratuitement et commencez à recevoir des demandes d'inscription dès aujourd'hui.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href={route('school-application.create')}
                            className="px-8 py-3.5 bg-white text-orange-700 font-bold rounded-xl hover:bg-orange-50 transition-colors shadow-lg text-sm">
                            Inscrire mon école gratuitement
                        </Link>
                        <Link href={route('about')}
                            className="px-8 py-3.5 bg-transparent border-2 border-white/50 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors text-sm">
                            En savoir plus
                        </Link>
                    </div>
                </div>
            </section>

            <PublicFooter />
        </>
    );
}
