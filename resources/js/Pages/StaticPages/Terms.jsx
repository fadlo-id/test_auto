import { Head, Link } from '@inertiajs/react';

const SECTIONS = [
    {
        title: '1. Objet',
        content: `Les présentes conditions générales d'utilisation (CGU) définissent les modalités d'accès et d'utilisation de la plateforme AutoEcoles Maroc (ci-après "la Plateforme"). En vous inscrivant ou en utilisant nos services, vous acceptez sans réserve ces CGU.`,
    },
    {
        title: '2. Inscription et compte',
        content: `L'inscription est gratuite pour les candidats au permis. Pour les propriétaires d'auto-écoles, un abonnement payant est requis après validation du compte. Vous êtes responsable de la confidentialité de vos identifiants. Tout accès réalisé depuis votre compte vous est imputable.`,
    },
    {
        title: '3. Avis et contenus utilisateurs',
        content: `Les avis publiés sur la Plateforme doivent être honnêtes, basés sur une expérience personnelle réelle et respectueux des personnes. Tout avis diffamatoire, frauduleux ou contraire aux bonnes mœurs sera supprimé. Vous accordez à AutoEcoles Maroc une licence non exclusive d'utilisation du contenu que vous publiez.`,
    },
    {
        title: '4. Obligations des auto-écoles',
        content: `Les auto-écoles s'engagent à fournir des informations exactes et à jour, à ne pas publier de contenu trompeur, et à respecter la législation marocaine en vigueur. La Plateforme se réserve le droit de suspendre tout établissement en cas de manquement à ces obligations.`,
    },
    {
        title: '5. Paiements et abonnements',
        content: `Les abonnements sont facturés selon la périodicité choisie (mensuelle ou annuelle). En cas de résiliation, l'accès reste actif jusqu'à la fin de la période payée. Les remboursements ne sont accordés que dans les 7 jours suivant la souscription si aucune commande n'a été passée via la Plateforme.`,
    },
    {
        title: '6. Limitation de responsabilité',
        content: `AutoEcoles Maroc est une plateforme d'intermédiation. Nous ne sommes pas responsables des services fournis par les auto-écoles référencées. En cas de litige avec un établissement, nous encourageons d'abord une résolution amiable.`,
    },
    {
        title: '7. Modification des CGU',
        content: `Nous nous réservons le droit de modifier ces CGU à tout moment. Les utilisateurs seront informés des modifications significatives par e-mail ou notification sur la Plateforme. La poursuite de l'utilisation après modification vaut acceptation des nouvelles CGU.`,
    },
];

export default function Terms({ content = '' }) {
    return (
        <>
            <Head>
                <title>Conditions d'utilisation — AutoEcoles Maroc</title>
                <meta name="description" content="Conditions générales d'utilisation de la plateforme AutoEcoles Maroc." />
            </Head>
            <div className="min-h-screen bg-gray-50">
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white py-16 px-4">
                    <div className="max-w-3xl mx-auto">
                        <h1 className="text-3xl font-bold mb-2">Conditions d'utilisation</h1>
                        <p className="text-gray-400 text-sm">Dernière mise à jour : Janvier 2026</p>
                    </div>
                </div>

                <div className="max-w-3xl mx-auto px-4 py-12">
                    {content && (
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
                            <div className="prose prose-gray max-w-none text-sm text-gray-600 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: content }} />
                        </div>
                    )}
                    <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
                        {SECTIONS.map(s => (
                            <div key={s.title} className="p-6">
                                <h2 className="font-semibold text-gray-900 mb-3">{s.title}</h2>
                                <p className="text-sm text-gray-600 leading-relaxed">{s.content}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 flex flex-wrap gap-4 justify-center text-sm text-gray-400">
                        <Link href={route('home')} className="hover:text-orange-600">Accueil</Link>
                        <Link href={route('privacy')} className="hover:text-orange-600">Confidentialité</Link>
                        <Link href={route('contact')} className="hover:text-orange-600">Contact</Link>
                    </div>
                </div>
            </div>
        </>
    );
}
