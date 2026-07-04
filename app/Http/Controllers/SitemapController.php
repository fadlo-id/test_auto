<?php

namespace App\Http\Controllers;

use App\Models\AutoSchool;
use App\Models\Category;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    private string $base;
    private string $now;

    public function __construct()
    {
        $this->base = rtrim(config('app.url'), '/');
        $this->now  = now()->toAtomString();
    }

    // ── Sitemap index ─────────────────────────────────────────────────────────

    public function index(): Response
    {
        $sitemaps = [
            ['loc' => "{$this->base}/sitemap-static.xml",     'lastmod' => $this->now],
            ['loc' => "{$this->base}/sitemap-schools.xml",    'lastmod' => $this->schoolsLastMod()],
            ['loc' => "{$this->base}/sitemap-cities.xml",     'lastmod' => $this->now],
            ['loc' => "{$this->base}/sitemap-categories.xml", 'lastmod' => $this->now],
        ];

        $xml  = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

        foreach ($sitemaps as $s) {
            $xml .= "  <sitemap>\n";
            $xml .= "    <loc>{$s['loc']}</loc>\n";
            $xml .= "    <lastmod>{$s['lastmod']}</lastmod>\n";
            $xml .= "  </sitemap>\n";
        }

        $xml .= '</sitemapindex>';

        return response($xml, 200, ['Content-Type' => 'application/xml; charset=utf-8']);
    }

    // ── Sub-sitemaps ──────────────────────────────────────────────────────────

    public function staticPages(): Response
    {
        $urls = [
            ['loc' => $this->base . '/',          'priority' => '1.0', 'changefreq' => 'daily'],
            ['loc' => $this->base . '/search',     'priority' => '0.9', 'changefreq' => 'daily'],
            ['loc' => $this->base . '/about',      'priority' => '0.5', 'changefreq' => 'monthly'],
            ['loc' => $this->base . '/contact',    'priority' => '0.5', 'changefreq' => 'monthly'],
            ['loc' => $this->base . '/faq',        'priority' => '0.6', 'changefreq' => 'monthly'],
            ['loc' => $this->base . '/privacy',    'priority' => '0.3', 'changefreq' => 'yearly'],
            ['loc' => $this->base . '/terms',      'priority' => '0.3', 'changefreq' => 'yearly'],
            ['loc' => $this->base . '/register',   'priority' => '0.7', 'changefreq' => 'monthly'],
            ['loc' => $this->base . '/login',      'priority' => '0.4', 'changefreq' => 'monthly'],
        ];

        return $this->buildUrlset($urls);
    }

    public function schools(): Response
    {
        $schools = AutoSchool::visible()
            ->select('slug', 'name', 'city', 'logo_url', 'banner_url', 'updated_at')
            ->latest('updated_at')
            ->get();

        $urls = [];
        foreach ($schools as $school) {
            $loc  = "{$this->base}/auto-ecole/{$school->slug}";
            $url  = [
                'loc'        => $loc,
                'lastmod'    => $school->updated_at->toAtomString(),
                'changefreq' => 'weekly',
                'priority'   => '0.8',
                'images'     => [],
            ];

            if ($school->banner_url) {
                $url['images'][] = [
                    'loc'     => $school->banner_url,
                    'title'   => "Auto-école {$school->name} — bannière",
                    'caption' => "Bannière de l'auto-école {$school->name} à {$school->city}",
                ];
            }

            if ($school->logo_url) {
                $url['images'][] = [
                    'loc'   => $school->logo_url,
                    'title' => "Logo de l'auto-école {$school->name}",
                ];
            }

            $urls[] = $url;
        }

        return $this->buildUrlset($urls, withImages: true);
    }

    public function cities(): Response
    {
        $cities = AutoSchool::visible()
            ->selectRaw('city, COUNT(*) as cnt, MAX(updated_at) as last')
            ->groupBy('city')
            ->orderBy('city')
            ->get();

        $urls = [];
        foreach ($cities as $c) {
            $urls[] = [
                'loc'        => "{$this->base}/ville/" . rawurlencode($c->city),
                'lastmod'    => $c->last,
                'changefreq' => 'weekly',
                'priority'   => $c->cnt >= 5 ? '0.8' : '0.6',
            ];
        }

        return $this->buildUrlset($urls);
    }

    public function categories(): Response
    {
        $categories = Category::withCount(['autoSchools as schools_count' => fn ($q) =>
                $q->where('is_active', true)->where('status', 'approved')->where('credits_exhausted', false)])
            ->get(['id', 'code', 'name_fr']);

        $urls = [];
        foreach ($categories as $cat) {
            $urls[] = [
                'loc'        => "{$this->base}/categorie/" . strtolower($cat->code),
                'lastmod'    => $this->now,
                'changefreq' => 'weekly',
                'priority'   => $cat->schools_count >= 3 ? '0.7' : '0.5',
            ];
        }

        return $this->buildUrlset($urls);
    }

    // ── Robots.txt ────────────────────────────────────────────────────────────

    public function robots(): \Illuminate\Http\Response
    {
        $isProd = app()->environment('production');

        $lines = ['User-agent: *'];

        if ($isProd) {
            $lines[] = 'Disallow: /admin/';
            $lines[] = 'Disallow: /school/';
            $lines[] = 'Disallow: /user/';
            $lines[] = 'Disallow: /login';
            $lines[] = 'Disallow: /register';
            $lines[] = 'Disallow: /password/';
            $lines[] = 'Disallow: /profile/';
            $lines[] = 'Disallow: /stripe/';
            $lines[] = 'Disallow: /api/';
            $lines[] = 'Disallow: /*?*search=';
            $lines[] = 'Disallow: /*?*min_rating=';
            $lines[] = 'Crawl-delay: 1';
        } else {
            // Block all crawling on non-production environments
            $lines[] = 'Disallow: /';
        }

        $lines[] = '';
        $lines[] = 'Sitemap: ' . $this->base . '/sitemap.xml';

        return response(implode("\n", $lines), 200, ['Content-Type' => 'text/plain; charset=utf-8']);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function buildUrlset(array $urls, bool $withImages = false): Response
    {
        $ns = 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"';
        if ($withImages) {
            $ns .= ' xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"';
        }

        $xml  = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= "<urlset {$ns}>\n";

        foreach ($urls as $url) {
            $xml .= "  <url>\n";
            $xml .= "    <loc>" . e($url['loc']) . "</loc>\n";

            if (!empty($url['lastmod'])) {
                $lastmod = is_string($url['lastmod']) ? $url['lastmod'] : (string) $url['lastmod'];
                $xml    .= "    <lastmod>{$lastmod}</lastmod>\n";
            }

            if (!empty($url['changefreq'])) {
                $xml .= "    <changefreq>{$url['changefreq']}</changefreq>\n";
            }

            if (!empty($url['priority'])) {
                $xml .= "    <priority>{$url['priority']}</priority>\n";
            }

            if ($withImages && !empty($url['images'])) {
                foreach ($url['images'] as $img) {
                    $xml .= "    <image:image>\n";
                    $xml .= "      <image:loc>" . e($img['loc']) . "</image:loc>\n";
                    if (!empty($img['title'])) {
                        $xml .= "      <image:title>" . e($img['title']) . "</image:title>\n";
                    }
                    if (!empty($img['caption'])) {
                        $xml .= "      <image:caption>" . e($img['caption']) . "</image:caption>\n";
                    }
                    $xml .= "    </image:image>\n";
                }
            }

            $xml .= "  </url>\n";
        }

        $xml .= '</urlset>';

        return response($xml, 200, ['Content-Type' => 'application/xml; charset=utf-8']);
    }

    private function schoolsLastMod(): string
    {
        $last = AutoSchool::visible()->max('updated_at');
        return $last ? \Carbon\Carbon::parse($last)->toAtomString() : $this->now;
    }
}
