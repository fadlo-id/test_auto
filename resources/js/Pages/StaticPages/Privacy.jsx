import { Head, Link } from '@inertiajs/react';

const SECTIONS = [
    {
        title: '1. Données collectées',
        content: `Nous collectons les informations que vous nous fournissez directement lors de votre inscription : nom, adresse e-mail, numéro de téléphone (optionnel). Pour les propriétaires d'auto-écoles, nous collectons également les informations de profil de l'établissement. Nous collectons aussi automatiquement des données de navigation anonymisées (pages visitées, durée de session) à des fins statistiques.`,
    },
    {
        title: '2. Utilisation des données',
        content: `Vos données personnelles sont utilisées pour : gérer votre compte et vous authentifier, vous envoyer des notifications liées à votre activité sur la plateforme, améliorer nos services et personnaliser votre expérience. Nous ne vendons jamais vos données personnelles à des tiers.`,
    },
    {
        title: '3. Partage des données',
        content: `Nous partageons uniquement les données nécessaires avec nos prestataires techniques (hébergement, traitement des paiements via Stripe). Ces prestataires sont soumis à des obligations de confidentialité strictes. En aucun cas, vos données ne sont partagées à des fins publicitaires.`,
    },
    {
        title: '4. Cookies',
        content: `Nous utilisons des cookies essentiels au fonctionnement de la plateforme (session d'authentification, préférences). Vous pouvez désactiver les cookies non essentiels dans les paramètres de votre navigateur, mais cela peut altérer certaines fonctionnalités.`,
    },
    {
        title: '5. Conservation des données',
        content: `Vos données sont conservées aussi longtemps que votre compte est actif. En cas de suppression de compte, vos données personnelles sont effacées dans un délai de 30 jours, à l'exception des données requises par la loi (ex. données de facturation conservées 10 ans).`,
    },
    {
        title: '6. Vos droits',
        content: `Conformément à la loi 09-08 relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel, vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données. Pour exercer ces droits, contactez-nous via le formulaire de contact.`,
    },
];

export default function Privacy({ content = '' }) {
    return (
        <>
            <Head>
                <title>Politique de confidentialité — AutoEcoles Maroc</title>
                <meta name="description" content="Politique de confidentialité et protection des données d'AutoEcoles Maroc." />
            </Head>
            <div className="min-h-screen bg-gray-50">
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white py-16 px-4">
                    <div className="max-w-3xl mx-auto">
                        <h1 className="text-3xl font-bold mb-2">Politique de confidentialité</h1>
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
                        <Link href={route('terms')} className="hover:text-orange-600">Conditions d'utilisation</Link>
                        <Link href={route('contact')} className="hover:text-orange-600">Contact</Link>
                    </div>
                </div>
            </div>
        </>
    );
}
