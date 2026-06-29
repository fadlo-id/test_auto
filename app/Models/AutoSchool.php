<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Cviebrock\EloquentSluggable\Sluggable;

class AutoSchool extends Model
{
    use HasFactory, SoftDeletes, Sluggable;

    protected $fillable = [
        'user_id', 'name', 'slug', 'description', 'email', 'phone',
        'address', 'city', 'region', 'latitude', 'longitude',
        'license_number', 'established_year',
        'website_url', 'facebook_url', 'instagram_url',
        'logo_url', 'banner_url', 'verified_at', 'featured_until',
        'is_active', 'status', 'rejection_reason',
        'views_remaining', 'clicks_remaining',
        'credits_exhausted', 'credits_reset_at',
    ];

    protected $casts = [
        'verified_at'       => 'datetime',
        'featured_until'    => 'datetime',
        'credits_reset_at'  => 'datetime',
        'is_active'         => 'boolean',
        'credits_exhausted' => 'boolean',
        'latitude'          => 'float',
        'longitude'         => 'float',
        'views_remaining'   => 'integer',
        'clicks_remaining'  => 'integer',
    ];

    public function sluggable(): array
    {
        return [
            'slug' => [
                'source' => 'name'
            ]
        ];
    }

    // Relations
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function categories()
    {
        return $this->belongsToMany(Category::class, 'school_categories');
    }

    public function services()
    {
        return $this->hasMany(Service::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function subscription()
    {
        return $this->hasOne(Subscription::class);
    }

    // Accessors — NOTE: getAverageRatingAttribute / getReviewCountAttribute are intentionally removed.
    // Always use withAvg('reviews as average_rating','rating') and withCount('reviews')
    // in queries to avoid N+1. Direct attribute access falls back to null when not eager-loaded.

    public function getIsVerifiedAttribute(): bool
    {
        return $this->verified_at !== null;
    }

    public function getIsFeaturedAttribute(): bool
    {
        return $this->featured_until !== null && $this->featured_until->isFuture();
    }

    public function isPremium(): bool
    {
        return $this->subscription && $this->subscription->isActive();
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true)->approved();
    }

    /** Publicly visible = active AND credits not exhausted */
    public function scopeVisible($query)
    {
        return $query->active()->where('credits_exhausted', false);
    }

    public function isPubliclyVisible(): bool
    {
        return $this->is_active
            && $this->status === 'approved'
            && ! $this->credits_exhausted;
    }

    public function hasUnlimitedViews(): bool  { return $this->views_remaining  === null; }
    public function hasUnlimitedClicks(): bool { return $this->clicks_remaining === null; }

    public function stats()
    {
        return $this->hasMany(Stat::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function photos()
    {
        return $this->hasMany(SchoolPhoto::class)->orderBy('sort_order');
    }

    public function favoritedBy()
    {
        return $this->belongsToMany(User::class, 'user_favorites');
    }

    public function activeSubscription()
    {
        return $this->hasOne(Subscription::class)
            ->where('status', 'active');
    }

    public function analyticsSetting()
    {
        return $this->hasOne(AnalyticsSetting::class);
    }

    public function analyticsDailyStats()
    {
        return $this->hasMany(AnalyticsDailyStat::class);
    }

    public function viewEvents()
    {
        return $this->hasMany(ViewEvent::class);
    }

    public function clickEvents()
    {
        return $this->hasMany(ClickEvent::class);
    }

    public function leadEvents()
    {
        return $this->hasMany(LeadEvent::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function analyticsDedup()
    {
        return $this->hasMany(AnalyticsDedup::class);
    }

    public function creditLogs()
    {
        return $this->hasMany(CreditLog::class);
    }

    public function creditHistories()
    {
        return $this->hasMany(CreditHistory::class);
    }

}