<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use App\Services\SeoService;
use Inertia\Inertia;
use Inertia\Response;

class StaticPageController extends Controller
{
    public function about(): Response
    {
        return Inertia::render('StaticPages/About', [
            'content' => SiteSetting::get('about_content', ''),
            'seo'     => app(SeoService::class)->staticPage(
                'about',
                'À propos de nous',
                "AutoEcoles.ma est la première plateforme marocaine dédiée à la comparaison des auto-écoles. Trouvez l'établissement idéal pour votre permis de conduire.",
            ),
        ]);
    }

    public function contact(): Response
    {
        $settings = SiteSetting::group('general');

        return Inertia::render('StaticPages/Contact', [
            'content'     => SiteSetting::get('contact_content', ''),
            'site_email'  => $settings['site_email'] ?? '',
            'site_phone'  => $settings['site_phone'] ?? '',
            'seo'         => app(SeoService::class)->staticPage(
                'contact',
                'Contact',
                "Contactez l'équipe AutoEcoles.ma pour toute question sur notre plateforme, un problème de compte ou une demande de partenariat.",
            ),
        ]);
    }

    public function faq(): Response
    {
        $faqItems = [
            ['q' => "Comment m'inscrire sur AutoEcoles.ma ?",
             'a' => "Créez un compte gratuit en quelques secondes. Vous pourrez ensuite envoyer des demandes d'inscription aux auto-écoles de votre choix et laisser des avis vérifiés."],
            ['q' => "Comment fonctionne la notation des auto-écoles ?",
             'a' => "Seuls les utilisateurs inscrits peuvent laisser un avis. Chaque avis est modéré par notre équipe avant publication pour garantir son authenticité."],
            ['q' => "Mon auto-école peut-elle apparaître sur AutoEcoles.ma ?",
             'a' => "Oui, contactez-nous pour inscrire votre auto-école. Nous proposons des formules d'abonnement adaptées à la taille de votre établissement."],
            ['q' => "Les informations des auto-écoles sont-elles à jour ?",
             'a' => "Chaque auto-école gère sa fiche directement. Les informations (horaires, tarifs, contact) sont mises à jour par l'établissement lui-même."],
            ['q' => "Comment signaler une information incorrecte ?",
             'a' => "Utilisez le bouton « Signaler » sur la fiche de l'auto-école ou contactez-nous directement. Nous traiterons votre signalement sous 48h."],
        ];

        return Inertia::render('StaticPages/Faq', [
            'content' => SiteSetting::get('faq_content', ''),
            'seo'     => app(SeoService::class)->staticPage(
                'faq',
                'Questions fréquentes (FAQ)',
                "Réponses aux questions les plus fréquentes sur AutoEcoles.ma : inscription, avis, auto-écoles partenaires, fonctionnement de la plateforme.",
                $faqItems,
            ),
        ]);
    }

    public function privacy(): Response
    {
        return Inertia::render('StaticPages/Privacy', [
            'content' => SiteSetting::get('privacy_content', ''),
            'seo'     => app(SeoService::class)->staticPage(
                'privacy',
                'Politique de confidentialité',
                "Découvrez comment AutoEcoles.ma collecte, utilise et protège vos données personnelles conformément à la loi 09-08 marocaine.",
            ),
        ]);
    }

    public function terms(): Response
    {
        return Inertia::render('StaticPages/Terms', [
            'content' => SiteSetting::get('terms_content', ''),
            'seo'     => app(SeoService::class)->staticPage(
                'terms',
                "Conditions générales d'utilisation",
                "Lisez les conditions générales d'utilisation de la plateforme AutoEcoles.ma avant d'utiliser nos services.",
            ),
        ]);
    }
}
