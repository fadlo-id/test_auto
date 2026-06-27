<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    protected $fillable = [
        'auto_school_id', 'plan_id', 'stripe_subscription_id',
        'started_at', 'expires_at', 'status', 'cancel_at_period_end',
        'cancellation_reason', 'cancelled_at',
    ];
    protected $casts = [
        'started_at'  => 'datetime',
        'expires_at'  => 'datetime',
        'cancelled_at' => 'datetime',
        'cancel_at_period_end' => 'boolean',
    ];

    public function autoSchool()
    {
        return $this->belongsTo(AutoSchool::class);
    }

    /** @deprecated Use autoSchool() — kept for legacy controller compatibility */
    public function school()
    {
        return $this->autoSchool();
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    public function isActive(): bool
    {
        return $this->status === 'active' && $this->expires_at?->isFuture();
    }

    public function cancel(string $reason = ''): static
    {
        $this->update([
            'status'              => 'cancelled',
            'cancellation_reason' => $reason,
            'cancelled_at'        => now(),
        ]);
        return $this;
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active')->where('expires_at', '>', now());
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}