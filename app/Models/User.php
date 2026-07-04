<?php

namespace App\Models;

use App\Notifications\ResetPasswordNotification;
use App\Notifications\VerifyEmailNotification;
use App\Traits\HasPermissions;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable, HasPermissions;

    /**
     * The Super Admin must never be blocked by email verification — guaranteed here at the
     * model level (rather than at each creation call site) so it holds regardless of how the
     * row is written: seeder, admin panel, tinker, or a future role promotion to super_admin.
     */
    protected static function booted(): void
    {
        static::saving(function (self $user) {
            if ($user->role === self::ROLE_SUPER_ADMIN && $user->email_verified_at === null) {
                $user->email_verified_at = now();
            }
        });
    }

    /** Sends our branded, queued Mailable-backed verification email instead of the framework default. */
    public function sendEmailVerificationNotification(): void
    {
        $this->notify(new VerifyEmailNotification());
    }

    /** Sends our branded, queued Mailable-backed password-reset email instead of the framework default. */
    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new ResetPasswordNotification($token));
    }

    const ROLE_SUPER_ADMIN  = 'super_admin';
    const ROLE_ADMIN        = 'admin';
    const ROLE_SCHOOL_OWNER = 'school_owner';
    const ROLE_USER         = 'user';

    protected $fillable = [
        'name', 'email', 'password', 'phone',
        'role', 'role_id', 'is_active', 'status',
        'last_login_at', 'avatar', 'notes', 'google_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_login_at'     => 'datetime',
        'password'          => 'hashed',
        'is_active'         => 'boolean',
        'status'            => 'integer',
    ];

    // Relations
    public function autoSchool(): HasOne
    {
        return $this->hasOne(AutoSchool::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function favorites(): HasMany
    {
        return $this->hasMany(Favorite::class);
    }

    public function favoriteSchools()
    {
        return $this->belongsToMany(AutoSchool::class, 'user_favorites');
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    /** Fine-grained hierarchy tier (Super Admin / Admin / Support / Moderator / ...). */
    public function roleModel(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

    // ── Role checks ────────────────────────────────────────────

    public function isSuperAdmin(): bool
    {
        return $this->role === self::ROLE_SUPER_ADMIN;
    }

    /** Returns true for both admin and super_admin */
    public function isAdmin(): bool
    {
        return in_array($this->role, [self::ROLE_ADMIN, self::ROLE_SUPER_ADMIN]);
    }

    public function isBanned(): bool
    {
        return (int) $this->status === 1;
    }

    // Returns 'active' | 'inactive' | 'banned' — used by the admin UI
    public function getStatusLabelAttribute(): string
    {
        if ($this->isBanned()) return 'banned';
        if (! $this->is_active) return 'inactive';
        return 'active';
    }

    public function isSchoolOwner(): bool
    {
        return $this->role === self::ROLE_SCHOOL_OWNER;
    }

    public function isUser(): bool
    {
        return $this->role === self::ROLE_USER;
    }

    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }

    /** Route name for the post-auth redirect (registration, login, OAuth callback). */
    public function redirectRouteName(): string
    {
        if ($this->isAdmin())       return 'admin.dashboard';
        if ($this->isSchoolOwner()) return 'school.dashboard';
        return 'user.dashboard';
    }

    /** Fine-grained tier checks (independent of the coarse `role` string). */
    public function isSupport(): bool
    {
        return $this->roleModel?->name === 'support';
    }

    public function isModerator(): bool
    {
        return $this->roleModel?->name === 'moderator';
    }

    public function hierarchyLevel(): ?int
    {
        return $this->isSuperAdmin() ? 1 : $this->roleModel?->level;
    }

    /** True if this user sits above $other in the admin hierarchy. */
    public function isSeniorTo(self $other): bool
    {
        if ($this->isSuperAdmin() && ! $other->isSuperAdmin()) return true;

        $mine  = $this->hierarchyLevel();
        $theirs = $other->hierarchyLevel();

        return $mine !== null && $theirs !== null && $mine < $theirs;
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByRole($query, string $role)
    {
        return $query->where('role', $role);
    }

    public function scopeAdmins($query)
    {
        return $query->whereIn('role', [self::ROLE_ADMIN, self::ROLE_SUPER_ADMIN]);
    }
}
