<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    protected $fillable = [
        'auto_school_id', 'plan_id', 'stripe_subscription_id',
        'started_at', 'expires_at', 'expiring_soon_notified_at', 'trial_ends_at', 'on_trial',
        'status', 'cancel_at_period_end',
        'cancellation_reason', 'cancelled_at',
        'payment_retry_count', 'next_payment_retry_at',
    ];

    protected $casts = [
        'started_at'                => 'datetime',
        'expires_at'                => 'datetime',
        'expiring_soon_notified_at' => 'datetime',
        'trial_ends_at'             => 'datetime',
        'cancelled_at'              => 'datetime',
        'next_payment_retry_at'     => 'datetime',
        'on_trial'                  => 'boolean',
        'cancel_at_period_end'      => 'boolean',
        'payment_retry_count'       => 'integer',
    ];

    public function autoSchool()
    {
        return $this->belongsTo(AutoSchool::class);
    }

    /** @deprecated kept for legacy controller compatibility */
    public function school()
    {
        return $this->autoSchool();
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    // ── State checks ──────────────────────────────────────────────────────────

    public function isActive(): bool
    {
        return $this->status === 'active' && $this->expires_at?->isFuture();
    }

    public function isInTrial(): bool
    {
        return $this->on_trial && $this->trial_ends_at?->isFuture();
    }

    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }

    public function isPastDue(): bool
    {
        return $this->status === 'past_due';
    }

    public function daysRemaining(): int
    {
        if (! $this->expires_at || $this->isExpired()) return 0;
        return (int) now()->diffInDays($this->expires_at, false);
    }

    public function trialDaysRemaining(): int
    {
        if (! $this->trial_ends_at || ! $this->isInTrial()) return 0;
        return (int) now()->diffInDays($this->trial_ends_at, false);
    }

    // ── State transitions ──────────────────────────────────────────────────────

    public function cancel(string $reason = ''): static
    {
        $this->update([
            'status'              => 'cancelled',
            'cancellation_reason' => $reason,
            'cancelled_at'        => now(),
        ]);
        return $this;
    }

    public function markPastDue(): static
    {
        $this->update(['status' => 'past_due']);
        return $this;
    }

    public function reactivate(): static
    {
        $this->update(['status' => 'active', 'payment_retry_count' => 0, 'next_payment_retry_at' => null]);
        return $this;
    }

    public function scheduleRetry(int $daysFromNow = 3): static
    {
        $this->update([
            'payment_retry_count'   => $this->payment_retry_count + 1,
            'next_payment_retry_at' => now()->addDays($daysFromNow),
        ]);
        return $this;
    }

    // ── Scopes ───────────────────────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('status', 'active')->where('expires_at', '>', now());
    }

    public function scopeInTrial($query)
    {
        return $query->where('on_trial', true)->where('trial_ends_at', '>', now());
    }

    public function scopePastDue($query)
    {
        return $query->where('status', 'past_due');
    }
}
