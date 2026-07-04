<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    protected $fillable = ['name', 'label', 'description', 'color', 'is_system', 'sort_order', 'level'];

    protected $casts = ['is_system' => 'boolean', 'level' => 'integer'];

    /** Canonical 7-level admin hierarchy, most senior first. Custom roles created later have level = null. */
    public const HIERARCHY = [
        1 => 'super_admin',
        2 => 'admin',
        3 => 'support',
        4 => 'moderator',
        5 => 'school_owner',
        6 => 'staff',
        7 => 'user',
    ];

    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'role_permission');
    }

    /** Users assigned this role via the fine-grained role_id column. */
    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'role_id');
    }

    public function userCount(): int
    {
        return User::where('role_id', $this->id)->orWhere('role', $this->name)->count();
    }

    /** Returns Permission keys for this role. */
    public function permissionKeys(): array
    {
        return $this->permissions()->pluck('key')->toArray();
    }

    /** True if $this sits above $other in the hierarchy (lower level number = more senior). */
    public function isSeniorTo(self $other): bool
    {
        if ($this->level === null || $other->level === null) return false;
        return $this->level < $other->level;
    }

    public function scopeOrderByHierarchy($query)
    {
        return $query->orderByRaw('level IS NULL, level ASC')->orderBy('sort_order');
    }
}
