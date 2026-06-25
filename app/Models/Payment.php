<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = ['auto_school_id', 'subscription_id', 'amount', 'currency', 'status', 'stripe_payment_id', 'paid_at', 'description'];
    protected $casts = ['amount' => 'decimal:2', 'paid_at' => 'datetime'];

    public function autoSchool()
    {
        return $this->belongsTo(AutoSchool::class);
    }

    public function subscription()
    {
        return $this->belongsTo(Subscription::class);
    }
}