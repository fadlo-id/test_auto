import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

const FAQS = [
    {
        cat: 'Pour les candidats',
        items: [
            { q: 'Est-ce que AutoEcoles Maroc est gratuit ?', a: 'Oui, la recherche, la consultation des profils et la lecture des avis sont entièrement gratuites pour les candidats au permis.' },
            { q: 'Comment les auto-écoles sont-elles sélectionnées ?', a: 'Chaque auto-école est vérifiée par notre équipe avant d\'apparaître sur la plateforme. Nous contrôlons l\'existence légale et la conformité aux réglementations en vigueur.' },
            { q: 'Les avis sont-ils authentiques ?', a: 'Oui. Chaque avis est modéré par notre équipe avant publication pour s\'assurer qu\'il respecte nos règles de conduite. Nous ne modifions jamais le contenu des avis.' },
            { q: 'Comment contacter une auto-école ?', a: 'Sur la page de chaque auto-école, vous trouverez le numéro de téléphone, l\'adresse et un formulaire de contact direct.' },
        ],
    },
    {
        cat: 'Pour les auto-écoles',
        items: [
            { q: 'Comment inscrire mon auto-école sur la plateforme ?', a: 'Créez un compte avec le rôle "Propriétaire d\'auto-école", complétez votre profil, puis soumettez votre demande. Notre équipe l\'examine sous 48h.' },
            { q: 'Quels sont les tarifs pour les auto-écoles ?', a: 'Nous proposons plusieurs formules d\'abonnement adaptées à votre taille. Consultez notre page Tarifs pour plus de détails.' },
            { q: 'Puis-je répondre aux avis clients ?', a: 'Cette fonctionnalité est disponible dans les formules premium. Elle vous permet de répondre publiquement aux avis laissés par vos élèves.' },
            { q: 'Comment améliorer mon classement dans les résultats ?', a: 'La qualité de votre profil (photos, description, services) et la note moyenne de vos avis sont les principaux critères de classement.' },
        ],
    },
];

function FaqItem({ q, a }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
            <button onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors">
                <span className="font-medium text-gray-900 text-sm pr-4">{q}</span>
                <span className={`text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-45' : ''}`}>+</span>
            </button>
            {open && (
                <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">{a}</div>
            )}
        </div>
    );
}

export default function Faq() {
    return (
        <>
            <Head>
                <title>FAQ — AutoEcoles Maroc</title>
                <meta name="description" content="Réponses aux questions fréquentes sur AutoEcoles Maroc." />
            </Head>
            <div className="min-h-screen bg-gray-50">
                <div className="bg-gradient-to-br from-orange-600 to-orange-700 text-white py-16 px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-3xl font-bold mb-3">Questions fréquentes</h1>
                        <p className="text-orange-100">Tout ce que vous devez savoir sur AutoEcoles Maroc</p>
                    </div>
                </div>

                <div className="max-w-3xl mx-auto px-4 py-16 space-y-12">
                    {FAQS.map(section => (
                        <div key={section.cat}>
                            <h2 className="text-lg font-bold text-gray-900 mb-4">{section.cat}</h2>
                            <div className="space-y-3">
                                {section.items.map(item => <FaqItem key={item.q} {...item} />)}
                            </div>
                        </div>
                    ))}

                    <div className="bg-orange-50 rounded-2xl p-8 text-center border border-orange-100">
                        <p className="text-gray-900 font-semibold mb-2">Votre question n'est pas listée ?</p>
                        <p className="text-gray-500 text-sm mb-4">Notre équipe est disponible pour vous répondre</p>
                        <Link href={route('contact')}
                            className="inline-block px-6 py-2.5 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700">
                            Nous contacter
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
