<?php

namespace App\Models;

use App\Support\HtmlSanitizer;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class SiteSetting extends Model
{
    protected $fillable = ['key', 'value', 'group', 'type'];

    private const CACHE_TTL = 600; // 10 minutes

    public static function get(string $key, mixed $default = null): mixed
    {
        $all   = static::allCached();
        $value = array_key_exists($key, $all) ? ($all[$key] ?? $default) : $default;

        // CMS rich-text fields are rendered raw (dangerouslySetInnerHTML) on the
        // frontend — sanitize on the way out regardless of how/when they were
        // stored, so a compromised or lower-trust admin account can't stash a
        // stored XSS payload in an "About"/"Terms"/etc. page.
        if (is_string($value) && str_ends_with($key, '_content')) {
            return HtmlSanitizer::clean($value);
        }

        return $value;
    }

    public static function set(string $key, mixed $value): void
    {
        static::updateOrCreate(['key' => $key], ['value' => $value]);
        Cache::forget('site_settings_all');
    }

    public static function group(string $group): array
    {
        $all = static::allCached();
        // We don't cache per-group; filter from the full cache
        return static::where('group', $group)->pluck('value', 'key')->toArray();
    }

    private static function allCached(): array
    {
        return Cache::remember('site_settings_all', self::CACHE_TTL, function () {
            return static::pluck('value', 'key')->toArray();
        });
    }

    // Called from SystemSettingsController after bulk update
    public static function flushCache(): void
    {
        Cache::forget('site_settings_all');
    }
}
