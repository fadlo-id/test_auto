<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    protected $fillable = [
        'code', 'discount_type', 'discount_value', 'min_amount',
        'max_uses', 'used_count', 'expires_at', 'is_active', 'description',
    ];

    protected $casts = [
        'is_active'      => 'boolean',
        'expires_at'     => 'date',
        'discount_value' => 'decimal:2',
        'min_amount'     => 'decimal:2',
    ];

    public function getIsExpiredAttribute(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }

    public function getIsExhaustedAttribute(): bool
    {
        return $this->max_uses !== null && $this->used_count >= $this->max_uses;
    }

    public function isValid(): bool
    {
        return $this->is_active && ! $this->is_expired && ! $this->is_exhausted;
    }

    public function computeDiscount(float $amount): float
    {
        if ($this->discount_type === 'percent') {
            return min(round($amount * ($this->discount_value / 100), 2), $amount);
        }

        return min((float) $this->discount_value, $amount);
    }

    public function recordUsage(): void
    {
        $this->increment('used_count');
    }

    public function scopeValid($query)
    {
        return $query->where('is_active', true)
            ->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>=', now()))
            ->where(fn ($q) => $q->whereNull('max_uses')->orWhereColumn('used_count', '<', 'max_uses'));
    }
}
