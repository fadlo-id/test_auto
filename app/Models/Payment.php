<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'auto_school_id', 'plan_id', 'subscription_id',
        'coupon_id', 'coupon_code',
        'amount', 'discount_amount', 'net_amount', 'vat_rate', 'vat_amount',
        'currency', 'status',
        'stripe_payment_intent_id',
        'invoice_number', 'payment_type',
        'paid_at', 'description',
        'refunded_amount', 'refund_reason', 'stripe_refund_id',
        'retry_count', 'next_retry_at',
        'failure_code', 'failure_message',
    ];

    protected $casts = [
        'amount'          => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'net_amount'      => 'decimal:2',
        'vat_rate'        => 'decimal:2',
        'vat_amount'      => 'decimal:2',
        'refunded_amount' => 'decimal:2',
        'paid_at'         => 'datetime',
        'next_retry_at'   => 'datetime',
        'retry_count'     => 'integer',
    ];

    // ── Relations ─────────────────────────────────────────────────────────────

    public function autoSchool()
    {
        return $this->belongsTo(AutoSchool::class);
    }

    public function subscription()
    {
        return $this->belongsTo(Subscription::class);
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    public function coupon()
    {
        return $this->belongsTo(Coupon::class);
    }

    // ── State helpers ─────────────────────────────────────────────────────────

    public function isSuccessful(): bool
    {
        return $this->status === 'success';
    }

    public function isFullyRefunded(): bool
    {
        return $this->status === 'refunded' && (float)$this->refunded_amount >= (float)$this->amount;
    }

    public function isPartiallyRefunded(): bool
    {
        return (float)$this->refunded_amount > 0 && (float)$this->refunded_amount < (float)$this->amount;
    }

    public function remainingRefundable(): float
    {
        return max(0, (float)$this->amount - (float)$this->refunded_amount);
    }

    public function hasInvoice(): bool
    {
        return ! empty($this->invoice_number);
    }
}
