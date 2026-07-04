<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CreditBalance extends Model
{
    const TYPES = ['view', 'whatsapp', 'phone', 'website', 'facebook', 'instagram', 'maps', 'email'];

    const CLICK_TYPES = ['whatsapp', 'phone', 'website', 'facebook', 'instagram', 'maps', 'email'];

    const LABELS = [
        'view'      => 'Vues',
        'whatsapp'  => 'WhatsApp',
        'phone'     => 'Téléphone',
        'website'   => 'Site web',
        'facebook'  => 'Facebook',
        'instagram' => 'Instagram',
        'maps'      => 'Google Maps',
        'email'     => 'Email',
    ];

    protected $fillable = [
        'auto_school_id', 'credit_type', 'balance', 'is_unlimited', 'is_blocked',
    ];

    protected $casts = [
        'balance'      => 'integer',
        'is_unlimited' => 'boolean',
        'is_blocked'   => 'boolean',
    ];

    public function school(): BelongsTo
    {
        return $this->belongsTo(AutoSchool::class, 'auto_school_id');
    }

    public function isExhausted(): bool
    {
        return ! $this->is_unlimited && $this->balance <= 0;
    }

    public function canConsume(): bool
    {
        return ! $this->is_blocked && ($this->is_unlimited || $this->balance > 0);
    }

    public function getLabelAttribute(): string
    {
        return self::LABELS[$this->credit_type] ?? $this->credit_type;
    }
}
