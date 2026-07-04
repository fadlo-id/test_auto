<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'slug', 'description', 'price', 'currency', 'billing_period',
        'trial_days', 'stripe_price_id', 'features', 'max_listings', 'is_active',
        'view_credits', 'whatsapp_credits', 'phone_credits', 'website_credits',
        'facebook_credits', 'instagram_credits', 'maps_credits', 'email_credits',
    ];

    protected $casts = [
        'price'             => 'decimal:2',
        'features'          => 'array',
        'is_active'         => 'boolean',
        'trial_days'        => 'integer',
        'view_credits'      => 'integer',
        'whatsapp_credits'  => 'integer',
        'phone_credits'     => 'integer',
        'website_credits'   => 'integer',
        'facebook_credits'  => 'integer',
        'instagram_credits' => 'integer',
        'maps_credits'      => 'integer',
        'email_credits'     => 'integer',
    ];

    /** Get the monthly quota for a given credit type. null = unlimited. */
    public function getQuota(string $type): ?int
    {
        $field = $type . '_credits';
        return $this->$field ?? null;
    }

    public function isUnlimited(string $type): bool
    {
        return $this->getQuota($type) === null;
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    public function hasTrial(): bool
    {
        return ($this->trial_days ?? 0) > 0;
    }

    public function monthlyPrice(): float
    {
        if ($this->billing_period === 'yearly') {
            return round((float)$this->price / 12, 2);
        }
        return (float)$this->price;
    }

    public function getIsPremiumAttribute(): bool
    {
        return $this->price > 0;
    }
}
