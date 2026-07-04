<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;

class Permission extends Model
{
    protected $fillable = ['key', 'label', 'group', 'description', 'sort_order'];

    private const CACHE_KEY = 'permissions_all_keys';
    private const CACHE_KEY_MODELS = 'permissions_all_models';
    private const CACHE_TTL = 600; // 10 minutes

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_permission');
    }

    /**
     * Canonical, DB-driven permission key list — the single source of truth for
     * validation rules and dynamic Gate registration. Never hardcode permission
     * keys elsewhere; add a row here (via the Permission Matrix page) instead.
     */
    public static function keys(): array
    {
        if (! Schema::hasTable('permissions')) return [];

        return Cache::remember(self::CACHE_KEY, self::CACHE_TTL, fn () =>
            static::orderBy('sort_order')->pluck('key')->toArray()
        );
    }

    /**
     * Cached full permission list (id/key/label/group/description/sort_order) —
     * queried on every admin request via HandleInertiaRequests, so this is a hot path.
     */
    public static function allCached()
    {
        if (! Schema::hasTable('permissions')) return collect();

        return Cache::remember(self::CACHE_KEY_MODELS, self::CACHE_TTL, fn () =>
            static::orderBy('sort_order')->get()
        );
    }

    public static function flushKeysCache(): void
    {
        Cache::forget(self::CACHE_KEY);
        Cache::forget(self::CACHE_KEY_MODELS);
    }

    protected static function booted(): void
    {
        static::saved(fn () => static::flushKeysCache());
        static::deleted(fn () => static::flushKeysCache());
    }
}
