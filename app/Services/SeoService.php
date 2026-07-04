<?php

namespace App\Services;

use App\Models\AutoSchool;

class SeoService
{
    private string $siteName    = 'AutoEcoles.ma';
    private string $twitterHandle = '@autoecoles_ma';
    private string $baseUrl;
    private string $defaultImage;

    public function __construct()
    {
        $this->baseUrl      = rtrim(config('app.url'), '/');
        $this->defaultImage = $this->baseUrl . '/images/og-default.png';
    }

    // ── Public page builders ──────────────────────────────────────────────────

    public function home(): array
    {
        $title = 'AutoEcoles.ma — Trouvez votre auto-école au Maroc';
        $desc  = 'Comparez les meilleures auto-écoles au Maroc. Avis vérifiés, tarifs, photos et inscription en ligne. Casablanca, Rabat, Marrakech et partout au Maroc.';
        $url   = $this->baseUrl . '/';

        return $this->build($title, $desc, $url, [
            $this->schemaWebSite(),
            $this->schemaOrganization(),
            $this->schemaHomeFaq(),
        ]);
    }

    public function schoolDetail(AutoSchool $school): array
    {
        $rating = (float) ($school->average_rating ?? 0);
        $count  = (int)   ($school->reviews_count  ?? 0);
        $url    = $this->baseUrl . '/auto-ecole/' . $school->slug;

        $ratingPart  = $count > 0 ? " — Note {$rating}/5 ({$count} avis)" : '';
        $title       = "{$school->name} — Auto-école à {$school->city}{$ratingPart} | AutoEcoles.ma";
        $rawDesc     = $school->description
            ? strip_tags((string) $school->description)
            : "Auto-école {$school->name} à {$school->city}. Découvrez les services, tarifs et avis vérifiés.";
        $desc        = mb_substr($rawDesc, 0, 155);
        $image       = $school->banner_url ?? $school->logo_url ?? $this->defaultImage;

        // Reviews for Review schema (top 5 approved, already loaded via eager-load)
        $reviewItems = $school->relationLoaded('reviews')
            ? $school->reviews->take(5)->map(fn ($r) => [
                'author'        => $r->user?->name ?? 'Utilisateur',
                'rating'        => $r->rating,
                'body'          => $r->content ?? '',
                'date'          => substr((string) ($r->created_at ?? ''), 0, 10),
              ])->all()
            : [];

        $jsonLd = [
            $this->schemaDrivingSchool($school, $reviewItems),
            $this->schemaBreadcrumb([
                ['name' => 'Accueil',  'url' => $this->baseUrl],
                ['name' => 'Recherche','url' => $this->baseUrl . '/search'],
                ['name' => $school->city ?? 'Ville', 'url' => $this->baseUrl . '/ville/' . rawurlencode($school->city ?? '')],
                ['name' => $school->name, 'url' => $url],
            ]),
        ];

        // Add FAQ schema if school has services
        if ($school->relationLoaded('services') && $school->services->isNotEmpty()) {
            $jsonLd[] = $this->schemaSchoolFaq($school);
        }

        $seo = $this->build($title, $desc, $url, $jsonLd, $image, 'business.business');

        $seo['breadcrumb'] = [
            ['label' => 'Accueil',  'href' => '/'],
            ['label' => 'Recherche','href' => '/search'],
            ['label' => $school->city ?? '', 'href' => '/ville/' . rawurlencode($school->city ?? '')],
            ['label' => $school->name, 'href' => null],
        ];

        return $seo;
    }

    public function search(array $filters = [], int $total = 0): array
    {
        $city   = trim($filters['city'] ?? '');
        $search = trim($filters['search'] ?? '');

        if ($city) {
            $title = "Auto-écoles à {$city} — {$total} résultat" . ($total > 1 ? 's' : '') . ' | AutoEcoles.ma';
            $desc  = "Comparez les {$total} auto-écoles à {$city}. Avis vérifiés, tarifs et inscription en ligne.";
        } elseif ($search) {
            $title = "Résultats pour « {$search} » — Auto-écoles Maroc | AutoEcoles.ma";
            $desc  = "Trouvez votre auto-école : {$total} résultat" . ($total > 1 ? 's' : '') . " pour « {$search} » au Maroc.";
        } else {
            $title = "Toutes les auto-écoles du Maroc — {$total} établissements | AutoEcoles.ma";
            $desc  = "Comparez {$total} auto-écoles au Maroc. Avis, tarifs, photos et inscription en ligne. Toutes les villes.";
        }

        // Only index city/category search — not full-text or rating filters
        $noindex = $search !== '' || ($filters['min_rating'] ?? '') !== '';

        $canonical = $this->canonical('/search', $filters, ['city', 'category', 'sort', 'page']);

        $breadcrumbData = [
            ['name' => 'Accueil',  'url' => $this->baseUrl],
            ['name' => 'Recherche','url' => $canonical],
        ];
        if ($city) {
            $breadcrumbData[1]['url'] = $this->baseUrl . '/search';
            $breadcrumbData[]         = ['name' => $city, 'url' => $canonical];
        }

        $seo = $this->build($title, $desc, $canonical, [
            $this->schemaBreadcrumb($breadcrumbData),
            $this->schemaWebPage($title, $desc, $canonical),
        ]);

        $seo['noindex']   = $noindex;
        $seo['breadcrumb'] = array_map(fn ($b, $i) => [
            'label' => $b['name'],
            'href'  => ($i < count($breadcrumbData) - 1) ? str_replace($this->baseUrl, '', $b['url']) : null,
        ], $breadcrumbData, array_keys($breadcrumbData));

        return $seo;
    }

    public function cityPage(string $city, int $total): array
    {
        $title = "Auto-écoles à {$city} — {$total} établissements | AutoEcoles.ma";
        $desc  = "Découvrez et comparez les {$total} auto-écoles à {$city}. Avis, tarifs et inscription facile.";
        $url   = $this->baseUrl . '/ville/' . rawurlencode($city);

        $seo = $this->build($title, $desc, $url, [
            $this->schemaBreadcrumb([
                ['name' => 'Accueil',  'url' => $this->baseUrl],
                ['name' => 'Recherche','url' => $this->baseUrl . '/search'],
                ['name' => $city,      'url' => $url],
            ]),
            $this->schemaWebPage($title, $desc, $url),
        ]);

        $seo['breadcrumb'] = [
            ['label' => 'Accueil',  'href' => '/'],
            ['label' => 'Recherche','href' => '/search'],
            ['label' => $city,      'href' => null],
        ];

        return $seo;
    }

    public function categoryPage(string $categoryName, string $code, int $total): array
    {
        $title = "Auto-écoles permis {$code} ({$categoryName}) — {$total} résultats | AutoEcoles.ma";
        $desc  = "Trouvez les auto-écoles proposant le permis {$code} ({$categoryName}) au Maroc. {$total} établissements comparés.";
        $url   = $this->baseUrl . '/categorie/' . strtolower($code);

        $seo = $this->build($title, $desc, $url, [
            $this->schemaBreadcrumb([
                ['name' => 'Accueil',  'url' => $this->baseUrl],
                ['name' => 'Recherche','url' => $this->baseUrl . '/search'],
                ['name' => "Permis {$code}", 'url' => $url],
            ]),
            $this->schemaWebPage($title, $desc, $url),
        ]);

        $seo['breadcrumb'] = [
            ['label' => 'Accueil',    'href' => '/'],
            ['label' => 'Recherche',  'href' => '/search'],
            ['label' => "Permis {$code}", 'href' => null],
        ];

        return $seo;
    }

    public function staticPage(string $slug, string $title, string $desc, array $faqItems = []): array
    {
        $fullTitle = "{$title} | AutoEcoles.ma";
        $url       = $this->baseUrl . '/' . ltrim($slug, '/');

        $jsonLd = [
            $this->schemaBreadcrumb([
                ['name' => 'Accueil', 'url' => $this->baseUrl],
                ['name' => $title,    'url' => $url],
            ]),
            $this->schemaWebPage($fullTitle, $desc, $url),
        ];

        if (!empty($faqItems)) {
            $jsonLd[] = $this->schemaFaq($faqItems);
        }

        $seo = $this->build($fullTitle, $desc, $url, $jsonLd);

        $seo['breadcrumb'] = [
            ['label' => 'Accueil', 'href' => '/'],
            ['label' => $title,    'href' => null],
        ];

        return $seo;
    }

    // ── JSON-LD schemas ────────────────────────────────────────────────────────

    public function schemaWebSite(): array
    {
        return [
            '@context'        => 'https://schema.org',
            '@type'           => 'WebSite',
            '@id'             => "{$this->baseUrl}/#website",
            'name'            => $this->siteName,
            'url'             => $this->baseUrl,
            'inLanguage'      => 'fr-MA',
            'potentialAction' => [
                '@type'       => 'SearchAction',
                'target'      => ['@type' => 'EntryPoint', 'urlTemplate' => "{$this->baseUrl}/search?search={search_term_string}"],
                'query-input' => 'required name=search_term_string',
            ],
        ];
    }

    public function schemaOrganization(): array
    {
        return [
            '@context'   => 'https://schema.org',
            '@type'      => 'Organization',
            '@id'        => "{$this->baseUrl}/#organization",
            'name'       => $this->siteName,
            'url'        => $this->baseUrl,
            'logo'       => ['@type' => 'ImageObject', 'url' => $this->baseUrl . '/images/logo.png', 'width' => 512, 'height' => 512],
            'sameAs'     => [
                'https://www.facebook.com/autoecoles.ma',
                'https://www.instagram.com/autoecoles_ma',
            ],
            'contactPoint' => [
                '@type'             => 'ContactPoint',
                'contactType'       => 'customer support',
                'availableLanguage' => ['French', 'Arabic'],
                'areaServed'        => 'MA',
            ],
            'areaServed'  => [['@type' => 'Country', 'name' => 'MA']],
            'description' => 'Plateforme de référence pour trouver et comparer les auto-écoles au Maroc.',
        ];
    }

    public function schemaDrivingSchool(AutoSchool $school, array $reviews = []): array
    {
        $rating = (float) ($school->average_rating ?? 0);
        $count  = (int)   ($school->reviews_count  ?? 0);
        $url    = $this->baseUrl . '/auto-ecole/' . $school->slug;

        $schema = [
            '@context'  => 'https://schema.org',
            '@type'     => ['DrivingSchool', 'LocalBusiness'],
            '@id'       => "{$url}#school",
            'name'      => $school->name,
            'url'       => $url,
            'telephone' => $school->phone,
            'email'     => $school->email,
            'address'   => [
                '@type'           => 'PostalAddress',
                'streetAddress'   => $school->address ?? '',
                'addressLocality' => $school->city    ?? '',
                'addressRegion'   => $school->region  ?? '',
                'addressCountry'  => 'MA',
            ],
            'priceRange'         => '$$',
            'currenciesAccepted' => 'MAD',
            'paymentAccepted'    => 'Cash, Virement bancaire, Chèque',
            'openingHours'       => ['Mo-Sa 08:00-18:00'],
            'inLanguage'         => 'fr-MA',
        ];

        if ($school->description) {
            $schema['description'] = strip_tags((string) $school->description);
        }

        // Images
        $images = array_values(array_filter([$school->banner_url, $school->logo_url]));
        if (!empty($images)) {
            $schema['image'] = $images;
        }

        // Geo coordinates
        if ($school->latitude && $school->longitude) {
            $schema['geo'] = [
                '@type'     => 'GeoCoordinates',
                'latitude'  => (float) $school->latitude,
                'longitude' => (float) $school->longitude,
            ];
            $schema['hasMap'] = "https://www.google.com/maps?q={$school->latitude},{$school->longitude}";
        }

        // Aggregate rating
        if ($count > 0) {
            $schema['aggregateRating'] = [
                '@type'       => 'AggregateRating',
                'ratingValue' => number_format($rating, 1),
                'reviewCount' => $count,
                'bestRating'  => 5,
                'worstRating' => 1,
            ];
        }

        // Individual reviews (top 5)
        if (!empty($reviews)) {
            $schema['review'] = array_map(fn ($r) => [
                '@type'        => 'Review',
                'author'       => ['@type' => 'Person', 'name' => $r['author']],
                'reviewRating' => ['@type' => 'Rating', 'ratingValue' => $r['rating'], 'bestRating' => 5, 'worstRating' => 1],
                'reviewBody'   => $r['body'],
                'datePublished'=> $r['date'],
                'itemReviewed' => ['@type' => 'DrivingSchool', 'name' => $school->name],
            ], $reviews);
        }

        // Website
        if ($school->website_url) {
            $schema['sameAs'] = [$school->website_url];
        }

        // Social
        $socials = array_filter([
            $school->facebook_url  ?? null,
            $school->instagram_url ?? null,
        ]);
        if ($socials) {
            $schema['sameAs'] = array_values(array_unique(array_merge($schema['sameAs'] ?? [], $socials)));
        }

        return $schema;
    }

    public function schemaBreadcrumb(array $items): array
    {
        return [
            '@context'        => 'https://schema.org',
            '@type'           => 'BreadcrumbList',
            'itemListElement' => array_values(array_map(fn ($item, $pos) => [
                '@type'    => 'ListItem',
                'position' => $pos + 1,
                'name'     => $item['name'],
                'item'     => $item['url'],
            ], $items, array_keys($items))),
        ];
    }

    public function schemaWebPage(string $title, string $desc, string $url): array
    {
        return [
            '@context'    => 'https://schema.org',
            '@type'       => 'WebPage',
            'name'        => $title,
            'description' => $desc,
            'url'         => $url,
            'inLanguage'  => 'fr-MA',
            'isPartOf'    => ['@id' => "{$this->baseUrl}/#website"],
        ];
    }

    public function schemaFaq(array $items): array
    {
        return [
            '@context'   => 'https://schema.org',
            '@type'      => 'FAQPage',
            'mainEntity' => array_map(fn ($item) => [
                '@type'          => 'Question',
                'name'           => $item['q'],
                'acceptedAnswer' => ['@type' => 'Answer', 'text' => $item['a']],
            ], $items),
        ];
    }

    private function schemaHomeFaq(): array
    {
        return $this->schemaFaq([
            ['q' => 'Comment choisir une auto-école au Maroc ?',
             'a' => 'Pour choisir la meilleure auto-école, comparez les avis des élèves, vérifiez les tarifs, la réputation et les taux de réussite. AutoEcoles.ma vous permet de comparer toutes les auto-écoles par ville et catégorie de permis.'],
            ['q' => "Quel est le prix d'un permis de conduire au Maroc ?",
             'a' => "Le prix d'un permis de conduire au Maroc varie entre 3 000 et 8 000 MAD selon l'auto-école, la ville et la catégorie de permis (A, B, C, D)."],
            ['q' => 'Quelles sont les catégories de permis au Maroc ?',
             'a' => 'Les principales catégories sont : A (moto), B (voiture légère), C (poids lourd), D (transport de personnes) et EB (remorque légère).'],
            ['q' => "Combien de temps pour obtenir le permis de conduire au Maroc ?",
             'a' => "La formation dure généralement 2 à 4 mois. Elle comprend les cours théoriques (code de la route) et les leçons de conduite pratiques."],
            ['q' => "Comment s'inscrire dans une auto-école sur AutoEcoles.ma ?",
             'a' => "Cherchez une auto-école dans votre ville, consultez ses avis et informations, puis cliquez sur « Demande d'inscription » pour envoyer votre demande directement."],
        ]);
    }

    private function schemaSchoolFaq(AutoSchool $school): array
    {
        $city = $school->city ?? 'votre ville';
        return $this->schemaFaq([
            ['q' => "Où se trouve l'auto-école {$school->name} ?",
             'a' => "L'auto-école {$school->name} est située à {$city}" . ($school->address ? ", {$school->address}" : '') . " au Maroc."],
            ['q' => "Comment contacter {$school->name} ?",
             'a' => "Vous pouvez contacter l'auto-école {$school->name} par téléphone au " . ($school->phone ?? 'numéro disponible sur notre site') . ($school->email ? " ou par email à {$school->email}" : '') . "."],
            ['q' => "Quels permis propose l'auto-école {$school->name} ?",
             'a' => "L'auto-école {$school->name} propose différentes catégories de permis. Consultez la page de l'établissement pour connaître tous les services disponibles."],
        ]);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function build(
        string $title,
        string $desc,
        string $canonical,
        array  $jsonLd    = [],
        string $image     = '',
        string $ogType    = 'website',
    ): array {
        $image = $image ?: $this->defaultImage;

        return [
            'title'       => $title,
            'description' => $desc,
            'canonical'   => $canonical,
            'noindex'     => false,
            'og' => [
                'title'       => $title,
                'description' => $desc,
                'type'        => $ogType,
                'image'       => $image,
                'url'         => $canonical,
                'site_name'   => $this->siteName,
                'locale'      => 'fr_MA',
            ],
            'twitter' => [
                'card'        => 'summary_large_image',
                'site'        => $this->twitterHandle,
                'title'       => $title,
                'description' => $desc,
                'image'       => $image,
            ],
            'json_ld'    => $jsonLd,
            'breadcrumb' => null,
        ];
    }

    private function canonical(string $path, array $params, array $allowedKeys): string
    {
        $clean = array_filter(
            array_intersect_key($params, array_flip($allowedKeys)),
            fn ($v) => $v !== null && $v !== ''
        );
        $url = $this->baseUrl . $path;
        if (!empty($clean)) {
            $url .= '?' . http_build_query($clean);
        }
        return $url;
    }
}
