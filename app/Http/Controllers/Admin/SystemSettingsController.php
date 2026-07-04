<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use HTMLPurifier;
use HTMLPurifier_Config;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SystemSettingsController extends Controller
{
    private array $defaults = [
        'general' => [
            'site_name'        => 'AutoEcoles Maroc',
            'site_tagline'     => 'Trouvez la meilleure auto-ecole au Maroc',
            'site_email'       => '',
            'site_phone'       => '',
            'maintenance_mode' => '0',
            'allow_reviews'    => '1',
            'require_approval' => '1',
        ],
        'seo' => [
            'meta_title'       => 'AutoEcoles Maroc - Comparez les auto-ecoles',
            'meta_description' => 'Trouvez et comparez les meilleures auto-ecoles du Maroc.',
            'meta_keywords'    => 'auto-ecole, permis, maroc',
            'og_image'         => '',
            'google_analytics' => '',
        ],
        'cms' => [
            'about_content'   => '',
            'contact_content' => '',
            'faq_content'     => '',
            'terms_content'   => '',
            'privacy_content' => '',
        ],
    ];

    /** Fields rendered as raw HTML on public pages — must be purified. */
    private const CMS_KEYS = ['about_content', 'contact_content', 'faq_content', 'terms_content', 'privacy_content'];

    public function index(): Response
    {
        // Start with defaults as a plain PHP array (never throws on missing keys)
        $settings = $this->defaults;

        // Overlay with whatever is stored in the DB
        SiteSetting::all()->each(function ($row) use (&$settings) {
            $settings[$row->group][$row->key] = $row->value;
        });

        return Inertia::render('Admin/SystemSettings', ['settings' => $settings]);
    }

    public function update(Request $request): RedirectResponse
    {
        $group    = (string) $request->input('group', 'general');
        $settings = $request->input('settings', []);

        if (! is_array($settings) || ! isset($this->defaults[$group])) {
            return back()->with('error', 'Paramètres invalides.');
        }

        foreach ($settings as $key => $value) {
            $key = (string) $key;

            // Only known keys for the given group may be written — blocks arbitrary
            // key/group injection into site_settings.
            if (! array_key_exists($key, $this->defaults[$group])) {
                continue;
            }

            $value = $value === null ? null : (string) $value;

            // CMS fields are rendered as raw HTML on public pages — strip anything
            // that isn't safe rich-text markup (scripts, event handlers, etc.).
            if ($value !== null && in_array($key, self::CMS_KEYS, true)) {
                $value = $this->purifyHtml($value);
            }

            SiteSetting::updateOrCreate(
                ['key' => $key],
                ['value' => $value, 'group' => $group]
            );
        }

        SiteSetting::flushCache();

        return back()->with('success', 'Paramètres enregistrés.');
    }

    private function purifyHtml(string $html): string
    {
        $config = HTMLPurifier_Config::createDefault();
        $config->set('HTML.Allowed', 'p,br,strong,em,u,ul,ol,li,a[href],h2,h3,h4,blockquote,span');
        $config->set('URI.AllowedSchemes', ['http' => true, 'https' => true, 'mailto' => true]);
        $config->set('Cache.SerializerPath', storage_path('framework/cache'));

        return (new HTMLPurifier($config))->purify($html);
    }
}
