import { Head, Link } from '@inertiajs/react';

export default function About() {
    return (
        <>
            <Head>
                <title>À propos — AutoEcoles Maroc</title>
                <meta name="description" content="Découvrez AutoEcoles Maroc, la plateforme de référence pour trouver et comparer les auto-écoles au Maroc." />
            </Head>
            <div className="min-h-screen bg-gray-50">
                {/* Hero */}
                <div className="bg-gradient-to-br from-orange-600 to-orange-700 text-white py-20 px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-4xl font-bold mb-4">À propos d'AutoEcoles Maroc</h1>
                        <p className="text-xl text-orange-100">La plateforme qui connecte les candidats au permis avec les meilleures auto-écoles du Maroc</p>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 py-16 space-y-16">
                    {/* Mission */}
                    <section className="grid md:grid-cols-2 gap-8 items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Notre mission</h2>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                AutoEcoles Maroc a été créé pour simplifier la recherche d'une auto-école de qualité. Nous référençons les meilleures auto-écoles du pays, vérifiées et évaluées par de vrais élèves.
                            </p>
                            <p className="text-gray-600 leading-relaxed">
                                Notre plateforme permet aux candidats de comparer les offres, lire des avis authentiques et contacter directement les écoles — le tout gratuitement.
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
                            <div className="text-5xl mb-3">🚗</div>
                            <p className="text-3xl font-bold text-orange-600">500+</p>
                            <p className="text-gray-500 text-sm">Auto-écoles référencées</p>
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <p className="text-3xl font-bold text-orange-600">50k+</p>
                                <p className="text-gray-500 text-sm">Candidats aidés</p>
                            </div>
                        </div>
                    </section>

                    {/* Values */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Nos valeurs</h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                { icon: '✅', title: 'Fiabilité', desc: 'Toutes les auto-écoles sont vérifiées avant publication sur la plateforme.' },
                                { icon: '🌟', title: 'Transparence', desc: 'Les avis sont publiés sans modification, bons ou mauvais — la vérité avant tout.' },
                                { icon: '🤝', title: 'Accessibilité', desc: 'Notre service de base est gratuit pour tous les candidats au permis.' },
                            ].map(v => (
                                <div key={v.title} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm text-center">
                                    <div className="text-3xl mb-3">{v.icon}</div>
                                    <h3 className="font-bold text-gray-900 mb-2">{v.title}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* CTA */}
                    <section className="bg-orange-600 rounded-2xl text-white text-center p-10">
                        <h2 className="text-2xl font-bold mb-3">Prêt à trouver votre auto-école ?</h2>
                        <p className="text-orange-100 mb-6">Comparez des centaines d'auto-écoles près de chez vous</p>
                        <Link href={route('search')}
                            className="inline-block px-8 py-3 bg-white text-orange-600 rounded-xl font-bold hover:bg-orange-50 transition-colors">
                            Rechercher maintenant
                        </Link>
                    </section>
                </div>

                {/* Simple footer links */}
                <div className="border-t border-gray-200 py-6 px-4">
                    <div className="max-w-4xl mx-auto flex flex-wrap gap-4 justify-center text-sm text-gray-400">
                        <Link href={route('home')} className="hover:text-orange-600">Accueil</Link>
                        <Link href={route('faq')} className="hover:text-orange-600">FAQ</Link>
                        <Link href={route('contact')} className="hover:text-orange-600">Contact</Link>
                        <Link href={route('privacy')} className="hover:text-orange-600">Confidentialité</Link>
                    </div>
                </div>
            </div>
        </>
    );
}
