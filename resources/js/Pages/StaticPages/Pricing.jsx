import { Head, Link } from '@inertiajs/react';
import { Check, Sparkles } from 'lucide-react';
import PublicNavbar from '@/Components/PublicNavbar';
import PublicFooter from '@/Components/PublicFooter';
import Accordion from '@/Components/UI/Accordion';

const PRICING_FAQ = [
    { question: "Puis-je changer de formule à tout moment ?", answer: "Oui. Vous pouvez passer à une formule supérieure ou inférieure depuis votre tableau de bord, à tout moment. Le changement prend effet à la prochaine échéance de facturation." },
    { question: "Y a-t-il un engagement de durée ?", answer: "Non, tous nos abonnements sont sans engagement. Vous pouvez résilier à tout moment ; l'accès reste actif jusqu'à la fin de la période déjà payée." },
    { question: "Comment se passe le paiement ?", answer: "Le paiement est sécurisé par carte bancaire via Stripe. Vous recevez une facture après chaque prélèvement, téléchargeable depuis votre espace." },
    { question: "Que se passe-t-il si je ne prends aucune formule payante ?", answer: "La formule gratuite reste disponible : votre auto-école est référencée et visible dans les résultats de recherche, avec des fonctionnalités limitées par rapport aux formules payantes." },
];

function PlanCard({ plan, featured = false }) {
    const feats = plan.features ?? [];
    return (
        <div className={`relative flex flex-col rounded-2xl border-2 p-6 transition-all ${
            featured
                ? 'border-orange-500 bg-orange-50 shadow-xl shadow-orange-100'
                : 'border-gray-100 bg-white hover:border-orange-200 hover:shadow-md'
        }`}>
            {featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
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
                    {feats.map((f, i) => (
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

export default function Pricing({ plans = [], seo = {} }) {
    return (
        <>
            <Head title={seo.title || 'Tarifs pour auto-écoles — AutoEcoles.ma'}>
                {seo.description && <meta name="description" content={seo.description} />}
            </Head>

            <PublicNavbar />

            <div className="bg-gradient-to-br from-gray-950 via-orange-950 to-gray-900 text-white py-20 px-4">
                <div className="max-w-2xl mx-auto text-center">
                    <p className="text-orange-400 text-sm font-semibold uppercase tracking-widest mb-3">Tarifs</p>
                    <h1 className="text-3xl sm:text-4xl font-extrabold mb-4">Une formule pour chaque auto-école</h1>
                    <p className="text-gray-300 text-lg leading-relaxed">
                        Gratuit pour démarrer. Passez à une formule payante pour gagner en visibilité, décrocher le
                        badge vérifié et gérer votre présence en ligne.
                    </p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
                {plans.length > 0 ? (
                    <div className={`grid gap-6 ${plans.length === 1 ? 'max-w-sm mx-auto' : plans.length === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto' : 'grid-cols-1 md:grid-cols-3'}`}>
                        {plans.map((plan, i) => (
                            <PlanCard key={plan.id} plan={plan} featured={i === 1 && plans.length === 3} />
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500">Nos formules seront bientôt disponibles.</p>
                )}

                <p className="text-center text-sm text-gray-400 mt-8">
                    Vous avez déjà une auto-école inscrite ?{' '}
                    <Link href={route('login')} className="text-orange-600 hover:underline font-medium">
                        Connectez-vous
                    </Link>{' '}
                    pour gérer votre abonnement.
                </p>
            </div>

            <div className="bg-gray-50 py-16 px-4 sm:px-6">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-10">
                        <p className="text-orange-600 text-sm font-semibold uppercase tracking-widest mb-1">Questions fréquentes</p>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">À propos des tarifs</h2>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 px-6">
                        <Accordion items={PRICING_FAQ} />
                    </div>
                </div>
            </div>

            <PublicFooter />
        </>
    );
}
