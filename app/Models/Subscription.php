<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    protected $fillable = ['auto_school_id', 'plan_id', 'stripe_subscription_id', 'started_at', 'expires_at', 'status', 'cancel_at_period_end'];
    protected $casts = ['started_at' => 'datetime', 'expires_at' => 'datetime'];

    public function autoSchool()
    {
        return $this->belongsTo(AutoSchool::class);
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    public function isActive()
    {
        return $this->status === 'active' && $this->expires_at > now();
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}