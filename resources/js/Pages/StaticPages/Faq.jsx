import { Head, Link } from '@inertiajs/react';
import Accordion from '@/Components/UI/Accordion';

const FAQS = [
    {
        cat: 'Pour les candidats',
        items: [
            { question: 'Est-ce que AutoEcoles Maroc est gratuit ?', answer: 'Oui, la recherche, la consultation des profils et la lecture des avis sont entièrement gratuites pour les candidats au permis.' },
            { question: 'Comment les auto-écoles sont-elles sélectionnées ?', answer: 'Chaque auto-école est vérifiée par notre équipe avant d\'apparaître sur la plateforme. Nous contrôlons l\'existence légale et la conformité aux réglementations en vigueur.' },
            { question: 'Les avis sont-ils authentiques ?', answer: 'Oui. Chaque avis est modéré par notre équipe avant publication pour s\'assurer qu\'il respecte nos règles de conduite. Nous ne modifions jamais le contenu des avis.' },
            { question: 'Comment contacter une auto-école ?', answer: 'Sur la page de chaque auto-école, vous trouverez le numéro de téléphone, l\'adresse et un formulaire de contact direct.' },
        ],
    },
    {
        cat: 'Pour les auto-écoles',
        items: [
            { question: 'Comment inscrire mon auto-école sur la plateforme ?', answer: 'Créez un compte avec le rôle "Propriétaire d\'auto-école", complétez votre profil, puis soumettez votre demande. Notre équipe l\'examine sous 48h.' },
            { question: 'Quels sont les tarifs pour les auto-écoles ?', answer: 'Nous proposons plusieurs formules d\'abonnement adaptées à votre taille. Consultez notre page Tarifs pour plus de détails.' },
            { question: 'Puis-je répondre aux avis clients ?', answer: 'Cette fonctionnalité est disponible dans les formules premium. Elle vous permet de répondre publiquement aux avis laissés par vos élèves.' },
            { question: 'Comment améliorer mon classement dans les résultats ?', answer: 'La qualité de votre profil (photos, description, services) et la note moyenne de vos avis sont les principaux critères de classement.' },
        ],
    },
];

export default function Faq({ content = '' }) {
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
                    {content && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                            <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: content }} />
                        </div>
                    )}
                    {FAQS.map(section => (
                        <div key={section.cat}>
                            <h2 className="text-lg font-bold text-gray-900 mb-2">{section.cat}</h2>
                            <div className="bg-white rounded-2xl border border-gray-100 px-5">
                                <Accordion items={section.items} />
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
