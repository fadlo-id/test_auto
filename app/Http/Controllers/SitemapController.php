<?php

namespace App\Http\Controllers;

use App\Models\AutoSchool;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function index(): Response
    {
        $schools = AutoSchool::active()
            ->select('slug', 'updated_at')
            ->latest('updated_at')
            ->get();

        $xml = $this->buildSitemap($schools);

        return response($xml, 200, ['Content-Type' => 'application/xml']);
    }

    private function buildSitemap($schools): string
    {
        $baseUrl = config('app.url');
        $now     = now()->toAtomString();

        $staticUrls = [
            ['loc' => $baseUrl, 'priority' => '1.0', 'changefreq' => 'daily'],
            ['loc' => "{$baseUrl}/search", 'priority' => '0.9', 'changefreq' => 'daily'],
            ['loc' => "{$baseUrl}/register", 'priority' => '0.7', 'changefreq' => 'monthly'],
        ];

        $lines = ['<?xml version="1.0" encoding="UTF-8"?>'];
        $lines[] = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

        foreach ($staticUrls as $url) {
            $lines[] = '  <url>';
            $lines[] = "    <loc>{$url['loc']}</loc>";
            $lines[] = "    <lastmod>{$now}</lastmod>";
            $lines[] = "    <changefreq>{$url['changefreq']}</changefreq>";
            $lines[] = "    <priority>{$url['priority']}</priority>";
            $lines[] = '  </url>';
        }

        foreach ($schools as $school) {
            $loc     = "{$baseUrl}/auto-ecole/{$school->slug}";
            $lastmod = $school->updated_at->toAtomString();
            $lines[] = '  <url>';
            $lines[] = "    <loc>{$loc}</loc>";
            $lines[] = "    <lastmod>{$lastmod}</lastmod>";
            $lines[] = '    <changefreq>weekly</changefreq>';
            $lines[] = '    <priority>0.8</priority>';
            $lines[] = '  </url>';
        }

        $lines[] = '</urlset>';

        return implode("\n", $lines);
    }
}
