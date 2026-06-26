<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Cviebrock\EloquentSluggable\Sluggable;
use App\Models\Stat;

class AutoSchool extends Model
{
    use HasFactory, SoftDeletes, Sluggable;

    protected $fillable = [
        'user_id',
        'name',
        'slug',
        'description',
        'email',
        'phone',
        'address',
        'city',
        'region',
        'latitude',
        'longitude',
        'license_number',
        'established_year',
        'website_url',
        'facebook_url',
        'instagram_url',
        'logo_url',
        'banner_url',
        'verified_at',
        'featured_until',
        'is_active',
        'status',
        'rejection_reason',
    ];

    protected $casts = [
        'verified_at' => 'datetime',
        'featured_until' => 'datetime',
        'is_active' => 'boolean',
        'latitude' => 'float',
        'longitude' => 'float',
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

    // Accessors
    public function getAverageRatingAttribute()
    {
        return $this->reviews()->avg('rating') ?? 0;
    }

    public function getReviewCountAttribute()
    {
        return $this->reviews()->count();
    }

    public function isPremium()
    {
        return $this->subscription && $this->subscription->isActive();
    }

    public function stats()
    {
        return $this->hasMany(Stat::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function activeSubscription()
    {
        return $this->hasOne(Subscription::class)
            ->where('status', 'active');
    }

    public function views()
    {
        return $this->hasMany(SchoolView::class);
    }

    public function clicks()
    {
        return $this->hasMany(SchoolClick::class);
    }

    public function getViewsCountAttribute()
    {
        return $this->views()->count();
    }
}